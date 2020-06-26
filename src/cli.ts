#!/usr/bin/env node

import chalk from 'chalk';
import { resolve } from 'path';
import { create } from '.';

const templateRoot = resolve(__dirname, '../templates');
const caveat = `
Inside that directory, you can run several commands:

${chalk.bold.cyan('yarn dev')}
  ${chalk.gray("Starts 'tsc -w'.")}
${chalk.bold.cyan('yarn build')}
  ${chalk.gray('Build the app for production.')}

These commands are only available when you run ${chalk.cyan(
  'create-whatever <pkg> --template typescript',
)}

Read the doc for the further information:
https://github.com/uetchy/create-whatever/blob/master/README.md
`;

create('create-whatever', {
  templateRoot,
  caveat,
});
