#!/usr/bin/env node

import {resolve} from 'path';
import {create} from '.';

const templateRoot = resolve(__dirname, '../templates');
const caveat = `Inside that directory, you can run several commands:
yarn dev
  Starts 'tsc -w'.
yarn build
  Build the app for production.
`;

create('create-whatever', templateRoot, {caveat});
