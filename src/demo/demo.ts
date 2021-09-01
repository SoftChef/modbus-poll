import * as fs from 'fs';
import {
  Duration,
  // Duration,
  ModbusClientType,
  ModbusSensorConfig,
  ModbusRTUClientConfig,
  ModbusTCPClientConfig,
  ModbusActuatorConfig,
} from '../constracts';
import { ModbusPoll } from '../modbus-poll';
/**
 * @TODO
 * -1. Read config and trans by interfaces
 * -2. Loop config to create modbus clients
 * -3. Loop config to read value and convert by decimal
 * -4. Trans nodes.property to nested object
 * -5. Emit pulling result to data event(on data)
 * -6. Accept define pulling interval per modbus client
 * -7. Support ModbusRTU & ModbusTCP
 * -8. Control by nodes.property
 * 9. thingName.property(ex: key: Thing1-A-B, object: Thing1.A.B)
 * 10. Merge nodes(multi-client)
 * 11. Control by thingName & property
 * 12. Group by client and pulling
 */

async function handler() {
  const modbusClientsConfig: (ModbusRTUClientConfig | ModbusTCPClientConfig)[] = loadModbusClientsConfig();
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
    await modbusPolls.rtu1.write('relay.ch1', 0x00);
    await modbusPolls.rtu1.write('relay.ch2', 0x00);
    await modbusPolls.rtu1.write('relay.ch3', 0x00);
    await modbusPolls.rtu1.write('relay.ch4', 0x00);
    await modbusPolls.rtu1.write('relay.ch5', 0x00);
    await modbusPolls.rtu1.write('relay.ch6', 0x00);
    await modbusPolls.rtu1.write('relay.ch7', 0x00);
    await modbusPolls.rtu1.write('relay.ch8', 0x00);
  }, 1000);
};

function loadModbusClientsConfig(): (ModbusRTUClientConfig | ModbusTCPClientConfig)[] {
  const clientsConfig: (ModbusRTUClientConfig | ModbusTCPClientConfig)[] = [];
  const configFile = fs.readFileSync('./src/demo/config.json');
  const config = JSON.parse(
    configFile.toString(),
  ).map((configObject: { [key: string]: any }) => {
    configObject.interval = Duration.seconds(configObject.interval ?? 10);
    configObject.timeout = Duration.seconds(configObject.timeout ?? 5);
    configObject.sensors = configObject.sensors as ModbusSensorConfig[];
    configObject.actuators = configObject.actuators as ModbusActuatorConfig[];
    return configObject;
  });
  for (const clientConfig of config) {
    if (clientConfig.type === ModbusClientType.ModbusRTU) {
      clientsConfig.push(clientConfig as ModbusRTUClientConfig);
    } else if (clientConfig.type === ModbusClientType.ModbusTCP) {
      clientsConfig.push(clientConfig as ModbusTCPClientConfig);
    } else {
      console.error('Unknow type:', clientConfig.type);
    }
  }
  return clientsConfig;
}

void handler();