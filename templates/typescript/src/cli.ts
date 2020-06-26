#!/usr/bin/env node

import { create } from 'create-whatever';
import { resolve } from 'path';

const templateRoot = resolve(__dirname, '../templates');
const caveat = `
This is a caveat!
You can change this to whatever you want.
`;

create('{{kebab name}}', {
  templateRoot,
  caveat,
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
});
