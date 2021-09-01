const readFunctionCodes: string[] = [
  '0x01',
  '0x02',
  '0x03',
  '0x04',
];

const writeFunctionCodes: string[] = [
  '0x05',
  '0x06',
  '0x14',
  '0x15',
  '0x16',
];

export {
  readFunctionCodes,
  writeFunctionCodes,
};

export interface ModbusSensorConfig {

  thingName: string;

  property: string;

  slaveId: number;

  functionCode: '0x01' | '0x02' | '0x03' | '0x04';

  address: number;

  quantity: number;

  decimal?: number;

}

export interface ModbusActuatorConfig {

  thingName: string;

  property: string;

  slaveId: number;

  functionCode: '0x05' | '0x06' | '0x14' | '0x15' | '0x16';

  address: number;

}