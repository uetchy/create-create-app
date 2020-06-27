#!/usr/bin/env node

import { create } from 'create-whatever';
import { resolve } from 'path';

const templateRoot = resolve(__dirname, '../templates');

const caveat = `
This is a caveat!
You can change this in \`src/cli.ts\`.
`;

// See https://github.com/uetchy/create-whatever/blob/master/README.md for the all options.

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
