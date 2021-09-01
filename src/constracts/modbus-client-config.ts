import { SerialPortOptions } from 'modbus-serial/ModbusRTU';
import {
  Duration,
  ModbusActuatorConfig,
  ModbusClientType,
  ModbusSensorConfig,
} from '.';

export interface ModbusClientConfig {

  type: ModbusClientType;

  name: string;

  interval: Duration;

  timeout: Duration;

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