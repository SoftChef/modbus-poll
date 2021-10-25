const fs = require('fs');
const { ModbusPoll } = require('@softchef/modbus-poll');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile).pop();

let [ _a, _b, path, value ] = process.argv;

config.path = path;

value = parseInt(value);

exports.handler = async () => {
  const modbusPoll = new ModbusPoll(config);
  console.log('Start connect to', config.path);
  await modbusPoll.connect();
  console.log('Connect success');
  await modbusPoll.write('relay.ch1', value);
  await modbusPoll.write('relay.ch2', value);
  await modbusPoll.write('relay.ch3', value);
  await modbusPoll.write('relay.ch4', value);
  await modbusPoll.write('relay.ch5', value);
  await modbusPoll.write('relay.ch6', value);
  await modbusPoll.write('relay.ch7', value);
  await modbusPoll.write('relay.ch8', value);
  console.log('Control success');
  await modbusPoll.disconnect();
}

this.handler();