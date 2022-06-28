#!/usr/bin/env node

const { resolve } = require('path');
const { create } = require('create-create-app');

const templateRoot = resolve(__dirname, '..', 'templates');

const caveat = `
This is a caveat!
You can change this in \`src/cli.js\`.
`;

// See https://github.com/uetchy/create-create-app/blob/master/README.md for other options.

create('create-test', {
  templateRoot,
  caveat,
  defaultDescription: 'Hi',
  defaultAuthor: 'Ina',
  defaultEmail: 'ina@example.com',
  defaultLicense: 'WTFPL',
  defaultPackageManager: 'yarn',
  promptForDescription: false,
  promptForAuthor: false,
  promptForEmail: false,
  promptForLicense: false,
  promptForTemplate: false,
  skipGitInit: true,
  // skipNpmInstall: true,
});
