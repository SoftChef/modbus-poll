const {
  TypeScriptAppProject,
  NpmAccess,
  ProjectType,
  DependenciesUpgradeMechanism,
} = require('projen');

const AUTOMATION_TOKEN = 'PROJEN_GITHUB_TOKEN';

const project = new TypeScriptAppProject({
  author: 'SoftChef',
  authorName: 'MinChe Tsai',
  authorEmail: 'poke@softchef.com',
  npmAccess: NpmAccess.PUBLIC,
  projectType: ProjectType.LIB,
  defaultReleaseBranch: 'main',
  name: '@softchef/modbus-poll',
  repositoryUrl: 'https://github.com/SoftChef/modbus-poll.git',
  // release: true,
  // releaseToNpm: true,
  package: true,
  entrypoint: 'lib/index.js',
  deps: [
    'lodash',
    'mathjs',
    'modbus-serial',
  ],
  devDeps: [
    '@types/mathjs',
    '@types/lodash',
  ],
  depsUpgrade: DependenciesUpgradeMechanism.githubWorkflow({
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
      secret: AUTOMATION_TOKEN,
    },
  }),
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['MinCheTsai'],
  },
  scripts: {
    demo: 'node ./lib/demo/demo.js',
  },
  tsconfig: {
    compilerOptions: {
      target: 'es2020',
      moduleResolution: 'node',
    },
  },
});

project.synth();