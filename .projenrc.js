const { TypeScriptAppProject } = require('projen');

const project = new TypeScriptAppProject({
  defaultReleaseBranch: 'main',
  name: 'modbus-modulator',
  deps: [
    'modbus-serial',
  ],
  scripts: {
    demo: 'node ./lib/demo/demo.js',
  },
});

project.synth();