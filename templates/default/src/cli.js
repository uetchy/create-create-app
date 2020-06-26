#!/usr/bin/env node

const { resolve } = require('path');
const { create } = require('create-whatever');

const templateRoot = resolve(__dirname, '../templates');
const caveat = `
This is a caveat!
You can change this to whatever you want.
`;

create('{{kebab name}}', {
  templateRoot,
  extra: {
    architecture: {
      type: 'list',
      describe: 'choose your fave os',
      choices: [
        { name: 'macOS', value: 'mac' },
        { name: 'Windows', value: 'win' },
        { name: 'Linux', value: 'linux' },
      ],
      prompt: 'if-no-arg',
    },
  },
  after: ({ answers }) => console.log(`Ok you chose ${answers.architecture}.`),
  caveat,
});
