import { SerialPortOptions } from 'modbus-serial/ModbusRTU';
import {
  ModbusActuatorConfig,
  ModbusClientType,
  ModbusSensorConfig,
} from '.';

export interface ModbusClientConfig {

  type: ModbusClientType;

  name: string;

  interval: number;

  timeout: number;

  delay: number;

  sensors?: ModbusSensorConfig[];

  actuators?: ModbusActuatorConfig[];

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

export interface ModbusRTUBufferedClientConfig extends ModbusClientConfig {

  type: ModbusClientType.ModbusRTUBuffered;

  path: string;

  serialPortOptions: SerialPortOptions;

}