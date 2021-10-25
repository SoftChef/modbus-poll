const fs = require('fs');
const { ModbusPoll } = require('@softchef/modbus-poll');

const configFile = fs.readFileSync('./config.json');
const config = JSON.parse(configFile).pop();

const [ _a, _b, path ] = process.argv;

config.path = path;

exports.handler = async () => {
  const modbusPoll = new ModbusPoll(config);
  console.log('Start connect to', config.path);
  await modbusPoll.connect();
  console.log('Connect success');
  modbusPoll.startPolling();
  modbusPoll.on('data', (data) => {
    console.log(data);
  });
}

this.handler();