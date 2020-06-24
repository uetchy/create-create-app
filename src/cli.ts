#!/usr/bin/env node

import {resolve} from 'path';
import {create} from '.';

const templateRoot = resolve(__dirname, '../templates');
const caveat = `
Inside that directory, you can run several commands:
yarn dev (--template typescript)
  Starts 'tsc -w'.
yarn build (--template typescript)
  Build the app for production.

Read the doc for the further information:
https://github.com/uetchy/create-whatever/blob/master/README.md
`;

create('create-whatever', {
  templateRoot,
  caveat,
});
