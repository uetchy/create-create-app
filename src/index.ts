import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import gitconfig from 'gitconfig';
import yargsInteractive, {Option} from 'yargs-interactive';

import copy from './template';

export interface Config {
  packageDir: string;
  templateDir: string;
  view: View;
}

export interface View {
  author: string;
  email: string;
  description: string;
  license: string;
}

async function getGitUser() {
  const config = await gitconfig.get({location: 'global'});
  return config.user;
}

export async function create(
  appName: string,
  templateRoot: string,
  extraOptions: Option = {},
) {
  try {
    const gitUser = await getGitUser();
    const options: Option = {
      interactive: {default: true},
      description: {
        type: 'input',
        describe: 'describe your package',
        default: 'my awesome package',
        prompt: 'if-no-arg',
      },
      author: {
        type: 'input',
        describe: "author's name",
        default: gitUser.name,
        prompt: 'if-no-arg',
      },
      email: {
        type: 'input',
        describe: "author's email",
        default: gitUser.email,
        prompt: 'if-no-arg',
      },
      license: {
        type: 'list',
        describe: 'choose license',
        choices: ['MIT', 'Apache'],
        prompt: 'if-no-arg',
      },
      template: {
        type: 'list',
        describe: 'template name',
        default: 'default',
        choices: ['default'],
        prompt: 'if-no-arg',
      },
      ...extraOptions,
    };

    const firstArg = process.argv[2];
    if (firstArg === undefined) {
      throw new Error(`${appName} <name>`);
    }

    const args = await yargsInteractive()
      .usage('$0 <name> [args]')
      .interactive(options);

    let packageName: string =
      firstArg === '.' ? path.basename(process.cwd()) : firstArg;

    const packageDir = path.resolve(packageName);
    const templateDir = path.resolve(templateRoot, args.template);
    if (!fs.existsSync(templateDir)) {
      throw new Error('No template found');
    }

    const view = {
      name: packageName,
      description: args.description,
      author: args.author,
      email: args.email,
      license: args.license,
      year: new Date().getFullYear(),
    };

    console.log('Bootstrapping your package');

    await copy({
      packageDir,
      templateDir,
      view,
    });

    console.log(`✨ Package ${packageName} has been created!`);
    console.log(packageDir);
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}
