import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import execa from 'execa';
import {spawn} from 'cross-spawn';
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

export interface Options {
  extra?: Option;
  caveat?: string;
}

async function getGitUser() {
  const config = await gitconfig.get({location: 'global'});
  return config.user;
}

export async function create(
  appName: string,
  templateRoot: string,
  options: Options = {},
) {
  try {
    const gitUser = await getGitUser();
    const yarnOption: Option = {
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
        choices: ['mit'],
        prompt: 'if-no-arg',
      },
      template: {
        type: 'list',
        describe: 'template name',
        default: 'default',
        choices: ['default'],
        prompt: 'if-no-arg',
      },
      ...options.extra,
    };

    const firstArg = process.argv[2];
    if (firstArg === undefined) {
      throw new Error(`${appName} <name>`);
    }

    const args = await yargsInteractive()
      .usage('$0 <name> [args]')
      .interactive(yarnOption);

    const useCurrentDir = firstArg === '.';
    const packageName: string = useCurrentDir
      ? path.basename(process.cwd())
      : firstArg;
    const packageDir = useCurrentDir
      ? process.cwd()
      : path.resolve(packageName);
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

    // copy files from template
    console.log(`\nCreating a new app in ${chalk.green(packageDir)}.\n`);
    await copy({
      packageDir,
      templateDir,
      view,
    });

    // install dependencies using yarn / npm
    console.log(`Installing dependencies.`);
    const useYarn = await IsYarnAvaialable();
    await installDeps(packageDir, useYarn);
    if (useYarn) {
      console.log('');
    }

    // init git
    await initGit(packageDir);
    console.log('\nInitialized a git repository\n');

    console.log(`Success! Created ${packageName} at ${packageDir}`);
    if (options.caveat) {
      console.log(options.caveat);
    }
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}

function installDeps(rootDir: string, useYarn: boolean) {
  return new Promise((resolve, reject) => {
    let command: string;
    let args: string[];
    if (useYarn) {
      command = 'yarnpkg';
      args = ['install', '--cwd', rootDir];
    } else {
      command = 'npm';
      args = ['install', '--prefix', rootDir];
    }
    const child = spawn(command, args, {stdio: 'inherit'});
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(`installDeps failed: ${command} ${args.join(' ')}`);
      }
      resolve();
    });
  });
}

async function IsYarnAvaialable() {
  try {
    await execa('yarnpkg', ['--version']);
    return true;
  } catch (e) {
    return false;
  }
}

async function initGit(root: string) {
  await execa('git init', {shell: true, cwd: root});
}
