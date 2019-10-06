import yargs from 'yargs';

import cli from './cli';

const argv = yargs
  .option('description', {
    alias: 'd',
    type: 'string',
    description: 'package description',
    default: 'package description',
  })
  .option('author', {
    alias: 'a',
    type: 'string',
    description: "author's name",
  })
  .option('email', {
    alias: 'e',
    type: 'string',
    description: "author's email",
  })
  .option('license', {
    alias: 'l',
    type: 'string',
    description: 'package license',
  })
  .option('template', {
    alias: 't',
    type: 'string',
    description: 'template name',
    default: 'default',
  }).argv;

cli(argv).catch((err) => console.log(err.message));
