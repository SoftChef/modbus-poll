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

export interface ModbusNodeConfig {

  thingName: string;

  property: string;

  slaveId: number;

  functionCode: '0x01' | '0x02' | '0x03' | '0x04' | '0x05' | '0x06' | '0x14' | '0x15' | '0x16' | '0x43';

  address: number;

  quantity: number;

  command: number;

  decimal?: number;

}