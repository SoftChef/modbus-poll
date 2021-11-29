import {
  EventEmitter,
} from 'events';
import {
  keyBy,
  set as setObject,
} from 'lodash';
import {
  pow,
  round,
} from 'mathjs';
import ModbusRTU from 'modbus-serial';
import {
  ReadCoilResult,
  ReadRegisterResult,
  WriteCoilResult,
  WriteMultipleResult,
  WriteRegisterResult,
} from 'modbus-serial/ModbusRTU';
import {
  ModbusClientType,
  ModbusSensorConfig,
  ModbusActuatorConfig,
  ModbusRTUBufferedClientConfig,
  ModbusRTUClientConfig,
  ModbusTCPClientConfig,
  ModbusAsciiSerialClientConfig,
} from './constracts';

type ModbusPollResult = number | Array<number | string | boolean> | { [key: string]: number | string | boolean } | undefined;

type ModbusPollDecoder = (value: ReadCoilResult | ReadRegisterResult, context: Object) => ModbusPollResult;

export class ModbusPoll extends EventEmitter {
  /**
   * Name for identify
   */
  public readonly name: string;
  /**
   * Modbus client instance
   */
  private readonly modbusClient: ModbusRTU;
  /**
   * Modbus config
   */
  private readonly config: ModbusRTUClientConfig | ModbusRTUBufferedClientConfig | ModbusAsciiSerialClientConfig | ModbusTCPClientConfig;
  /**
   * All of Modbus sensors by property
   */
  private readonly sensors: {
    [property: string]: ModbusSensorConfig;
  } = {};
  /**
   * All of Modbus actuators by property
   */
  private readonly actuators: {
    [property: string]: ModbusActuatorConfig;
  } = {};
  /**
   * Timeout's timer
   */
  private timer: NodeJS.Timer | null = null;
  /**
   * Define decoders to convert results after poll, with node's config 'decoder' property
   */
  private decoders: {
    [name: string]: ModbusPollDecoder;
  } = {};

  public constructor(
    config: ModbusRTUClientConfig | ModbusRTUBufferedClientConfig | ModbusAsciiSerialClientConfig | ModbusTCPClientConfig,
    decoders?: { [name: string]: ModbusPollDecoder },
  ) {
    super();
    this.name = config.name;
    this.modbusClient = new ModbusRTU();
    this.config = config;
    if (config.sensors) {
      this.sensors = keyBy(
        config.sensors.map((sensorConfig: ModbusSensorConfig) => {
          return {
            ...sensorConfig,
            key: `${sensorConfig.thingName}.${sensorConfig.property}`,
          };
        }), 'key',
      );
    }
    if (config.actuators) {
      this.actuators = keyBy(
        config.actuators.map((actuatorConfig: ModbusActuatorConfig) => {
          return {
            ...actuatorConfig,
            key: `${actuatorConfig.thingName}.${actuatorConfig.property}`,
          };
        }), 'key',
      );
    }
    if (decoders) {
      this.setDecoders(decoders);
    }
  }

  public setDecoders(decoders: { [name: string]: ModbusPollDecoder }): ModbusPoll {
    this.decoders = decoders;
    return this;
  }

  public setDecoder(name: string, decoder: ModbusPollDecoder): ModbusPoll {
    this.decoders[name] = decoder;
    return this;
  }

  public async connect(): Promise<void> {
    // Set modbus client timeout
    this.modbusClient.setTimeout(
      this.config.timeout || 3000,
    );
    let connection: Promise<void>;
    switch (this.config.type) {
      case ModbusClientType.ModbusRTU:
        connection = this.modbusClient.connectRTU(this.config.path, this.config.serialPortOptions);
        break;
      case ModbusClientType.ModbusRTUBuffered:
        connection = this.modbusClient.connectRTUBuffered(this.config.path, this.config.serialPortOptions);
        break;
      case ModbusClientType.ModbusAsciiSerial:
        connection = this.modbusClient.connectAsciiSerial(this.config.path, this.config.serialPortOptions);
        break;
      case ModbusClientType.ModbusTCP:
        connection = this.modbusClient.connectTCP(this.config.host, {
          port: this.config.port,
        });
        break;
      default:
        connection = Promise.reject(
          new Error('Modbus client type not supported.'),
        );
        break;
    }
    return connection;
  }

  public async disconnect(): Promise<void> {
    this.modbusClient.close(() => {
      if (this.timer !== null) {
        clearInterval(this.timer);
      }
      this.timer = null;
      return Promise.resolve();
    });
  }

  public startPolling() {
    const polling = async () => {
      let data: {
        [key: string]: any;
      } = {};
      for (const node of Object.values(this.sensors)) {
        setObject(data, `${node.thingName}.${node.property}`, await this.read(`${node.thingName}.${node.property}`, data));
        await this.delay(this.config.delay);
      }
      if (Object.keys(data).length > 0) {
        this.emit('data', data);
      }
    };
    void polling();
    this.timer = setInterval(polling, this.config.interval || 3000);
  }

  public async read(target: string, context: Object): Promise<any> {
    if (this.sensors[target] === undefined) {
      return Promise.reject(
        new Error('Target not found'),
      );
    }
    const node = this.sensors[target];
    let result: ReadCoilResult | ReadRegisterResult | null = null;
    try {
      // Switch node's slave id
      await this.modbusClient.setID(node.slaveId);
      switch (node.functionCode) {
        case '0x01':
          result = await this.modbusClient.readCoils(node.address, node.quantity || 1);
          break;
        case '0x02':
          result = await this.modbusClient.readDiscreteInputs(node.address, node.quantity || 1);
          break;
        case '0x03':
          result = await this.modbusClient.readHoldingRegisters(node.address, node.quantity || 1);
          break;
        case '0x04':
          result = await this.modbusClient.readInputRegisters(node.address, node.quantity || 1);
          break;
      }
    } catch (error) {
      console.log('Poll Error', error);
    }
    let value: ModbusPollResult = undefined;
    if (result) {
      if (node.decoder && this.decoders[node.decoder]) {
        value = this.decoders[node.decoder](result, context);
      } else {
        switch (node.functionCode) {
          case '0x01':
          case '0x02':
            value = result.data as Array<boolean>;
            break;
          case '0x03':
          case '0x04':
            if (node.endian === 'little') {
              value = result.buffer.readIntLE(0, node.quantity * 2);
            } else if (node.endian === 'big') {
              value = result.buffer.readIntBE(0, node.quantity * 2);
            } else { // node.endian equal raw
              value = result.data;
            }
            if (typeof value === 'number') {
              value = round(value * (pow(10, node.decimal || 1) as number), 2);
            }
            break;
        }
      }
    }
    return value;
  }

  public async write(target: string, value: number | number[] | boolean | boolean[], delay?: number): Promise<any> {
    if (this.actuators[target] === undefined) {
      return Promise.reject(
        new Error('Target not found'),
      );
    }
    const actuator = this.actuators[target];
    let result: WriteCoilResult | WriteRegisterResult | WriteMultipleResult | null = null;
    try {
      await this.modbusClient.setID(actuator.slaveId);
      switch (actuator.functionCode) {
        case '0x05':
          result = await this.modbusClient.writeCoil(actuator.address, <boolean>value);
          break;
        case '0x06':
          result = await this.modbusClient.writeRegister(actuator.address, <number>value);
          break;
        // case '0x14':
        case '0x15':
          result = await this.modbusClient.writeCoils(actuator.address, <boolean[]>value);
          break;
        case '0x16':
          result = await this.modbusClient.writeRegisters(actuator.address, <number[]>value);
          break;
      }
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
    await this.delay(delay || this.config.delay);
    return Promise.resolve(result);
  }

  private delay(millisecond: number): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(resolve, millisecond || 100);
    });
  }

};