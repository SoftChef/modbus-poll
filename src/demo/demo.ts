import { ModbusModulator } from '../modbus-modulator';

/**
 * @TODO
 * 1. Read config and trans by interfaces
 * 2. Loop config to create modbus clients
 * 3. Loop config to read value and convert by decimal
 * 4. Trans nodes.property to nested object
 * 5. Emit pulling result to data event(on data)
 * 6. Accept define pulling interval per modbus client
 * 7. Support ModbusRTU & ModbusTCP
 * 8. Control by nodes.property
 */

async function handler() {
  const modbusModulator = new ModbusModulator();
  await modbusModulator.connectTcp('127.0.0.1', 8502);
  modbusModulator.pulling();
  modbusModulator.on('data', (data) => {
    console.log(data);
  });
};

void handler();