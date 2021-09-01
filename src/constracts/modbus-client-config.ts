import { SerialPortOptions } from 'modbus-serial/ModbusRTU';
import {
  Duration,
  ModbusClientType,
  ModbusNodeConfig,
} from '.';

export interface ModbusClientConfig {

  type: ModbusClientType;

  name: string;

  interval: Duration;

  timeout: Duration;

  nodes: ModbusNodeConfig[];

}

export interface ModbusTCPClientConfig extends ModbusClientConfig {

  type: ModbusClientType.ModbusTCP;

  host: string;

  port: number;

}

export interface ModbusRTUClientConfig extends ModbusClientConfig {

  type: ModbusClientType.ModbusRTU;

  path: string;

  serialPortOptions: SerialPortOptions;

}