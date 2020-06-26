import chalk from 'chalk';
import { spawn } from 'cross-spawn';
import execa from 'execa';
import fs from 'fs';
import gitconfig from 'gitconfig';
import { availableLicenses, makeLicenseSync } from 'license.js';
import path from 'path';
import yargsInteractive, { Option } from 'yargs-interactive';
import { copy, getAvailableTemplates } from './template';

export interface Config {
  packageDir: string;
  templateDir: string;
  view: View;
}

export interface View {
  name: string;
  description: string;
  author: string;
  email: string;
  contact: string;
  license: string;
  [key: string]: string | number | boolean | any[];
}

export interface AfterHookOptions {
  name: string;
  packageDir: string;
  template: string;
  templateDir: string;
  year: number;
  answers: Omit<View, 'name'>;
}

export interface Options {
  templateRoot: string;
  extra?: Option;
  caveat?: string | ((options: AfterHookOptions) => string | void);
  after?: (options: AfterHookOptions) => void;
}

async function getGitUser() {
  const config = await gitconfig.get({ location: 'global' });
  return config.user;
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
    const child = spawn(command, args, { stdio: 'inherit' });
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

function exists(filePath: string, baseDir: string): boolean {
  return fs.existsSync(path.resolve(baseDir, filePath));
}

async function initGit(root: string) {
  await execa('git init', { shell: true, cwd: root });
}

function getContact(author: string, email?: string) {
  return `${author}${email ? ` <${email}>` : ''}`;
}

function isOccupied(dirname: string) {
  try {
    return (
      fs.readdirSync(dirname).filter((s) => !s.startsWith('.')).length !== 0
    );
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

async function getYargsOptions(
  templateRoot: string,
  extraOptions: Option = {},
) {
  const gitUser = await getGitUser();
  const yargOption: Option = {
    interactive: { default: true },
    description: {
      type: 'input',
      describe: 'description',
      default: 'description',
      prompt: 'if-no-arg',
    },
    author: {
      type: 'input',
      describe: 'author name',
      default: gitUser.name,
      prompt: 'if-no-arg',
    },
    email: {
      type: 'input',
      describe: 'author email',
      default: gitUser.email,
      prompt: 'if-no-arg',
    },
    license: {
      type: 'list',
      describe: 'license',
      choices: availableLicenses(),
      prompt: 'if-no-arg',
    },
    template: {
      type: 'list',
      describe: 'template',
      default: 'default',
      choices: getAvailableTemplates(templateRoot),
    },
    ...extraOptions,
  };
  return yargOption;
}

export async function create(appName: string, options: Options) {
  try {
    const firstArg = process.argv[2];
    if (firstArg === undefined) {
      throw new Error(`${appName} <name>`);
    }
    const useCurrentDir = firstArg === '.';
    const name: string = useCurrentDir
      ? path.basename(process.cwd())
      : firstArg;
    const packageDir = useCurrentDir ? process.cwd() : path.resolve(name);
    const templateRoot = options.templateRoot;

    if (isOccupied(packageDir)) {
      throw new Error(`${packageDir} is not empty directory.`);
    }

    const yargsOption = await getYargsOptions(templateRoot, options.extra);
    const args = await yargsInteractive()
      .usage('$0 <name> [args]')
      .interactive(yargsOption);

    const template = args.template;
    const templateDir = path.resolve(templateRoot, template);
    const year = new Date().getFullYear();
    const contact = getContact(args.author, args.email);

    if (!fs.existsSync(templateDir)) {
      throw new Error('No template found');
    }

    const filterdArgs = Object.entries<string>(args)
      .filter(
        (arg) =>
          arg[0].match(/^[^$_]/) &&
          !['interactive', 'template'].includes(arg[0]),
      )
      .reduce(
        (sum, cur) => ((sum[cur[0]] = cur[1]), sum),
        {} as {
          [key in keyof View]: View[key];
        },
      );

    const view = {
      ...filterdArgs,
      name,
      year,
      contact,
    };

    // copy files from template
    console.log(`\nCreating a new package in ${chalk.green(packageDir)}.\n`);
    await copy({
      packageDir,
      templateDir,
      view,
    });

    // create LICENSE
    const license = makeLicenseSync(args.license, {
      year,
      project: name,
      description: args.description,
      organization: getContact(args.author, args.email),
    });
    const licenseText = license.header + license.text + license.warranty;
    fs.writeFileSync(path.resolve(packageDir, 'LICENSE'), licenseText);

    // install dependencies using yarn / npm
    if (exists('package.json', packageDir)) {
      console.log(`Installing dependencies.`);
      const useYarn = await IsYarnAvaialable();
      await installDeps(packageDir, useYarn);
    }

    // init git
    await initGit(packageDir);
    console.log('\nInitialized a git repository');

    const afterHookOptions = {
      name,
      packageDir,
      template,
      templateDir,
      year,
      answers: {
        ...filterdArgs,
        contact,
      },
    };

    // after hook script
    if (options.after) {
      options.after(afterHookOptions);
    }

    console.log(`\nSuccess! Created ${chalk.bold.cyan(name)}.`);

    if (options.caveat) {
      switch (typeof options.caveat) {
        case 'string':
          console.log(options.caveat);
          break;
        case 'function':
          const response = await Promise.resolve(
            options.caveat(afterHookOptions),
          );
          if (response) {
            console.log(response);
          }
          break;
        default:
      }
    }
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
}
