import {
  BuadRate,
  ModbusClientType,
} from './';

export interface ModbusClient {

  name: string;

}

export interface ModbusTCPClient extends ModbusClient {

  type: ModbusClientType.ModbusTCP;

  host: string;

  port: number;

}

export interface ModbusRTUClient extends ModbusClient {

  type: ModbusClientType.ModbusRTU;

  serialPort: string;

  baudRate: BuadRate;

}