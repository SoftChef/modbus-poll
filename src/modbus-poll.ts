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
} from 'modbus-serial/ModbusRTU';
import {
  ModbusClientType,
  ModbusNodeConfig,
  ModbusRTUClientConfig,
  ModbusTCPClientConfig,
  readFunctionCodes,
} from './constracts';

export class ModbusPoll extends EventEmitter {

  public readonly name: string;

  private readonly modbusClient: ModbusRTU;

  private readonly config: ModbusRTUClientConfig | ModbusTCPClientConfig;

  private readonly nodes: {
    [property: string]: ModbusNodeConfig;
  };

  private timer: NodeJS.Timer | null;

  public constructor(config: ModbusRTUClientConfig | ModbusTCPClientConfig) {
    super();
    this.name = config.name;
    this.modbusClient = new ModbusRTU();
    this.config = config;
    this.nodes = keyBy(config.nodes, 'property');
    this.timer = null;
  }

  public async connect(): Promise<void> {
    // Set modbus client timeout
    this.modbusClient.setTimeout(
      this.config.timeout.valueOfMilliseconds(),
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

  public startPulling() {
    this.timer = setInterval(async() => {
      let data: {
        [key: string]: any;
      } = {};
      try {
        for (const node of this.config.nodes) {
          if (readFunctionCodes.indexOf(node.functionCode) === -1) {
            continue;
          }
          let result: ReadCoilResult | ReadRegisterResult | null = null;
          // Switch node's slave id
          this.modbusClient.setID(node.slaveId);
          switch (node.functionCode) {
            case '0x01':
              result = await this.modbusClient.readCoils(node.address, node.quantity);
              break;
            case '0x02':
              result = await this.modbusClient.readDiscreteInputs(node.address, node.quantity);
              break;
            case '0x03':
              result = await this.modbusClient.readHoldingRegisters(node.address, node.quantity);
              break;
            case '0x04':
              result = await this.modbusClient.readInputRegisters(node.address, node.quantity);
              break;
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
        this.emit('data', data);
      } catch (error) {
        console.log(error);
      }
    }, this.config.interval.valueOfMilliseconds());
  }

  public async write(_property: string, _value: number): Promise<void> {
    // console.log(this.nodes);
  }

};