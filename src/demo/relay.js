const fs = require('fs');
// const { ModbusPoll } = require('@softchef/modbus-poll');
const { ModbusPoll } = require('../modbus-poll');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile).pop();

let [ _a, _b, path, channel, value ] = process.argv;

config.path = path;

value = parseInt(value);

exports.handler = async () => {
  const modbusPoll = new ModbusPoll(config);
  console.log('Start connect to', config.path);
  await modbusPoll.connect();
  console.log('Connect success');
  await modbusPoll.write(`relay.${channel}`, value);
  console.log('Control success');
  await modbusPoll.disconnect();
}

this.handler();