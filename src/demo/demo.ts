import * as fs from 'fs';
import { ModbusPoll } from '../modbus-poll';

async function handler() {
  const configFile = fs.readFileSync('./src/demo/config.json');
  const modbusClientsConfig = JSON.parse(
    configFile.toString(),
  );
  // Read
  let modbusPolls: {
    [name: string]: ModbusPoll;
  } = {};
  for (const modbusClientConfig of modbusClientsConfig) {
    const modbusPoll = new ModbusPoll(modbusClientConfig);
    await modbusPoll.connect();
    modbusPoll.startPolling();
    modbusPoll.on('data', (data) => {
      console.log(data);
    });
    modbusPolls[modbusClientConfig.name] = modbusPoll;
  }
  // Write
  setTimeout(async () => {
    await modbusPolls.rtu1.write('relay.ch1', 0x01);
    await modbusPolls.rtu1.write('relay.ch2', 0x01);
    await modbusPolls.rtu1.write('relay.ch3', 0x01);
    await modbusPolls.rtu1.write('relay.ch4', 0x01);
    await modbusPolls.rtu1.write('relay.ch5', 0x01);
    await modbusPolls.rtu1.write('relay.ch6', 0x01);
    await modbusPolls.rtu1.write('relay.ch7', 0x01);
    await modbusPolls.rtu1.write('relay.ch8', 0x01);
  }, 1000);
};

void handler();