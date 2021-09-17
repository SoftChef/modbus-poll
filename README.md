# Modbus Poll

[![npm version](https://badge.fury.io/js/%40softchef%2Fmodbus-poll.svg)](https://badge.fury.io/js/%40softchef%2Fmodbus-poll)
![Release](https://github.com/SoftChef/modbus-poll/workflows/Release/badge.svg)
![npm](https://img.shields.io/npm/dt/@softchef/modbus-poll?label=NPM%20Downloads&color=orange)

Modbus Poll can automation polling the Modbus devices by Modbus map table and convert to JSON object by defined property. This package is used [modbus-serial](https://www.npmjs.com/package/modbus-serial) package to connect Modbus protocol and operate Modbus commands.
## Installation

NPM

```
npm install @softchef/modbus-poll
```

Yarn
```
yarn add @softchef/modbus-poll
```

Try these options on npm install to build, if you have problems to install

```
--unsafe-perm --build-from-source
```

### Compatibility

Version of NodeJS:
This module has not been tested on every single version of NodeJS. For best results you should stick to LTS versions, which are denoted by even major version numbers e.g. 4.x, 6.x, 8.x.

## Config definition

```new ModbusPoll(config)```

* `type```: dbus client type, support `ModbusTCP`, `ModbusRTU`, `ModbusRTUBuffered`.
* `name`: fine connection name.
* `path`: e ModbusRTU serial port path, ex: `/dev/ttyUSB0`.
* `host`: e ModbusTCP IP address.
* `port`: e ModbusTCP port, default is `502`.
* `serialPorptions`: The ModbusRTU options. Reference [modbus-serial](https://github.com/yaacov/node-modbus-serial#readme)
* `serialPorptions.baudRate`: The serial port's baud rate. Default is `9600`.
* `interval`: `Set` the polling interval, Default is `3000`ms.
* `timeout`: Set Modbus command's timeout. Default is `3000`ms.
* `delay`: Set read/write command's delay time. Default is `50`ms.
* `sensors`: Array of Modbus address table for read.
* `sensors[].thingName`: Define device name.
* `sensors[].property`: Define data property name.
* `sensors[].slaveId`: The Modbus device's slave ID.
* `sensors[].functionCode`:: The Modbus function code. Supports `0x01`, `0x02`, `0x03`, `0x04`. Reference [modbus-serial functions](https://github.com/yaacov/node-modbus-serial#these-classes-are-implemented).
* `sensors[].address`: The Modbus register address.
* `sensors[].quantity`: Read data length.
* `sensors[].endian?`: The payload's endial, `little` or `big` or `raw`, Default is `raw`.
* `sensors[].decimal?`: When data is a numberic, decimal will convert decimal places. Default is `0`. Ex: decimal is 2, data is `2635`, result is `26.35`.
* `actuators`: Array of Modbus address table for control.
* `actuators[].thingName`: Define device name.
* `actuators[].property`: Define data property name.
* `actuators[].slaveId`: The Modbus device's slave ID.
* `actuators[].functionCode`:: The Modbus function code. Supports `0x05`, `0x06`, `0x14`, `0x15`, `0x16`. Reference [modbus-serial functions](https://github.com/yaacov/node-modbus-serial#these-classes-are-implemented).
* `actuators[].address`: The Modbus register address.

## Example

Polling Modbus device's data
```
const config = {}; // Reference config definition
const modbusPoll = new ModbusPoll(config);
await modbusPoll.connect();
modbusPoll.startPolling();
modbusPoll.on('data', (data) => {
  console.log('Receive polling data:', data);
});
```

Control Modbus device

```
const config = {
  ...,
  actuators: [
    {
      thingName: 'relay',
      property: 'ch1',
      slaveId: 1,
      functionCode: '0x05',
      address: '0x00'
    }
  ]
};
const modbusPoll = new ModbusPoll(config);
await modbusPoll.connect();
// Control relay.ch1 to "on" and delay 1000 ms.
modbusPoll.write('relay.ch1', 1, 1000)
// Control relay.ch1 to "off" after 1000 ms
modbusPoll.write('relay.ch1', 0)
```

