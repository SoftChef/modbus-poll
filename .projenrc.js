const { TypeScriptAppProject } = require('projen');
const project = new TypeScriptAppProject({
  defaultReleaseBranch: 'main',
  name: 'modbus-modulator',
});
project.synth();