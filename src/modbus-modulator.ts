import { EventEmitter } from 'events';
import ModbusRTU from 'modbus-serial';

export class ModbusModulator extends EventEmitter {

  private modbusClient: ModbusRTU;

  public constructor() {
    super();
    this.modbusClient = new ModbusRTU();
  }

  public async connectTcp(host: string, port?: number) {
    return this.modbusClient.connectTCP(host, {
      port: port ?? 8502,
    });
  }
  public pulling() {
    this.modbusClient.readHoldingRegisters(1, 1).then((value) => {
      console.log(value);
    }).catch(error => {
      console.log('error', error);
    });
  }
};