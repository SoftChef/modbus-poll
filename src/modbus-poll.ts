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
  ModbusRTUClientConfig,
  ModbusTCPClientConfig,
  readFunctionCodes,
} from './constracts';

export class ModbusPoll extends EventEmitter {

  public readonly name: string;

  private readonly modbusClient: ModbusRTU;

  private readonly config: ModbusRTUClientConfig | ModbusTCPClientConfig;

  private readonly sensors: {
    [property: string]: ModbusSensorConfig;
  } = {};

  private readonly actuators: {
    [property: string]: ModbusActuatorConfig;
  } = {};

  private timer: NodeJS.Timer | null = null;

  public constructor(config: ModbusRTUClientConfig | ModbusTCPClientConfig) {
    super();
    this.name = config.name;
    this.modbusClient = new ModbusRTU();
    this.config = config;
    if (config.sensors) {
      this.sensors = keyBy(
        (config.sensors ?? []).map((sensorConfig: ModbusSensorConfig) => {
          return {
            ...sensorConfig,
            key: `${sensorConfig.thingName}.${sensorConfig.property}`,
          };
        }), 'key',
      );
    }
    if (config.actuators) {
      this.actuators = keyBy(
        (config.actuators ?? []).map((actuatorConfig: ModbusActuatorConfig) => {
          return {
            ...actuatorConfig,
            key: `${actuatorConfig.thingName}.${actuatorConfig.property}`,
          };
        }), 'key',
      );
    }
  }

  public async connect(): Promise<void> {
    // Set modbus client timeout
    this.modbusClient.setTimeout(
      this.config.timeout,
    );
    if (this.config.type === ModbusClientType.ModbusRTU) {
      return this.modbusClient.connectRTU(this.config.path, this.config.serialPortOptions);
    } else if (this.config.type === ModbusClientType.ModbusTCP) {
      return this.modbusClient.connectTCP(this.config.host, {
        port: this.config.port,
      });
    } else {
      return Promise.reject(
        new Error('Modbus client type not supported.'),
      );
    }
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
    this.timer = setInterval(async() => {
      let data: {
        [key: string]: any;
      } = {};
      for (const node of Object.values(this.sensors)) {
        if (readFunctionCodes.indexOf(node.functionCode) === -1) {
          continue;
        }
        let result: ReadCoilResult | ReadRegisterResult | null = null;
        try {
          // Switch node's slave id
          this.modbusClient.setID(node.slaveId);
          switch (node.functionCode) {
            case '0x01':
              result = await this.modbusClient.readCoils(node.address, node.quantity ?? 1);
              break;
            case '0x02':
              result = await this.modbusClient.readDiscreteInputs(node.address, node.quantity ?? 1);
              break;
            case '0x03':
              result = await this.modbusClient.readHoldingRegisters(node.address, node.quantity ?? 1);
              break;
            case '0x04':
              result = await this.modbusClient.readInputRegisters(node.address, node.quantity ?? 1);
              break;
          }
        } catch (error) {
          console.log('Poll Error', error);
        }
        let value: number | Array<number | string> | undefined = undefined;
        if (result !== null) {
          if (result.data.length === 1) {
            value = result.data.pop() as number;
          } else {
            value = result.data as Array<number | string>;
          }
        }
        if (typeof value === 'number' && typeof node.decimal === 'number' && value > 0) {
          value = round(value * (pow(10, node.decimal) as number), 2);
        }
        setObject(data, `${node.thingName}.${node.property}`, value);
      }
      if (Object.keys(data).length > 0) {
        this.emit('data', data);
      }
    }, this.config.interval);
  }

  public async write(target: string, value: number | number[] | boolean | boolean[]): Promise<any> {
    if (this.actuators[target] !== undefined) {
      const actuator = this.actuators[target];
      let result: WriteCoilResult | WriteRegisterResult | WriteMultipleResult | null = null;
      try {
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
      return Promise.resolve(result);
    }
  }

};