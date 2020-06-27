#!/usr/bin/env node

import chalk from 'chalk';
import { resolve } from 'path';
import { AfterHookOptions, create } from '.';

const templateRoot = resolve(__dirname, '../templates');
const caveat = ({ name, template }: AfterHookOptions) => {
  let text = `
cd ${chalk.bold.green(name)}
`;

  switch (template) {
    case 'typescript':
      text += `
Inside that directory, you can run several commands:

${chalk.bold.cyan('yarn dev')}
  ${chalk.gray("Starts 'tsc -w'.")}
${chalk.bold.cyan('yarn build')}
  ${chalk.gray('Build the app for production.')}

After the build, run ${chalk.cyan(
        'node lib/cli.js <package>',
      )} to test your app.
`;
      break;
    default:
      text += `node src/cli.js <package>
`;
  }

  text += `
Read the docs for the further information:
${chalk.yellow(
  'https://github.com/uetchy/create-whatever/blob/master/README.md',
)}`;

  return text;
};

create('create-whatever', {
  templateRoot,
  alwaysAskForTemplate: true,
  caveat,
});
