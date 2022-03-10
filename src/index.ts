import chalk from 'chalk';
import { CommonSpawnOptions } from 'child_process';
import { spawn } from 'cross-spawn';
import { epicfail } from 'epicfail';
import execa, { CommonOptions, ExecaChildProcess } from 'execa';
import fs from 'fs';
import gitconfig from 'gitconfig';
import { availableLicenses, makeLicenseSync } from 'license.js';
import path from 'path';
import yargsInteractive, { OptionData } from 'yargs-interactive';
import { copy, getAvailableTemplates } from './template';

export interface Option {
  [key: string]: OptionData | { default: boolean };
}

export interface Options {
  templateRoot: string;
  promptForTemplate?: boolean;
  modifyName?: (name: string) => string | Promise<string>;
  extra?: Option;
  caveat?:
    | string
    | ((options: AfterHookOptions) => string | void | Promise<string | void>);
  after?: (options: AfterHookOptions) => void | Promise<void>;
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
  run: (
    command: string,
    options?: CommonOptions<string>
  ) => ExecaChildProcess<string>;
  installNpmPackage: (packageName: string) => Promise<void>;
}

export class CLIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CLIError';
  }
}

async function getGitUser(): Promise<{ name?: string; email?: string }> {
  try {
    const config = await gitconfig.get({ location: 'global' });
    return config.user ?? {};
  } catch (err) {
    return {};
  }
}

function spawnPromise(
  command: string,
  args: string[] = [],
  options: CommonSpawnOptions = {}
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('close', (code) => {
      if (code !== 0) {
        return reject(code);
      }
      resolve(code);
    });
  });
}

async function installDeps(rootDir: string, useYarn: boolean) {
  let command: string;
  let args: string[];
  if (useYarn) {
    command = 'yarnpkg';
    args = ['install', '--cwd', rootDir];
  } else {
    command = 'npm';
    args = ['install'];
    process.chdir(rootDir);
  }
  try {
    await spawnPromise(command, args, { stdio: 'inherit' });
  } catch (err) {
    throw new CLIError(`installDeps failed: ${err}`);
  }
}

async function IsYarnAvailable() {
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
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

async function getYargsOptions(
  templateRoot: string,
  promptForTemplate: boolean,
  extraOptions: Option = {}
) {
  const gitUser = await getGitUser();
  const availableTemplates = getAvailableTemplates(templateRoot);
  const isMultipleTemplates = availableTemplates.length > 1;
  const askForTemplate = isMultipleTemplates && promptForTemplate;
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
    template: {
      type: 'list',
      describe: 'template',
      default: 'default',
      prompt: askForTemplate ? 'if-no-arg' : 'never',
      choices: availableTemplates,
    },
    license: {
      type: 'list',
      describe: 'license',
      choices: [...availableLicenses(), 'UNLICENSED'],
      prompt: 'if-no-arg',
    },
    ...extraOptions,
  };
  return yargOption;
}

export async function create(appName: string, options: Options) {
  epicfail(require.main!.filename, {
    assertExpected: (err) => err.name === 'CLIError',
  });

  const firstArg = process.argv[2];
  if (firstArg === undefined) {
    throw new CLIError(`${appName} <name>`);
  }
  const useCurrentDir = firstArg === '.';
  const name: string = useCurrentDir
    ? path.basename(process.cwd())
    : options.modifyName
    ? await Promise.resolve(options.modifyName(firstArg))
    : firstArg;
  const packageDir = useCurrentDir ? process.cwd() : path.resolve(name);
  const { templateRoot, promptForTemplate = false } = options;

  if (isOccupied(packageDir)) {
    throw new CLIError(`${packageDir} is not empty directory.`);
  }

  const yargsOption = await getYargsOptions(
    templateRoot,
    promptForTemplate,
    options.extra
  );
  const args = await yargsInteractive()
    .usage('$0 <name> [args]')
    .interactive(yargsOption as any);

  const template = args.template;
  const templateDir = path.resolve(templateRoot, template);
  const year = new Date().getFullYear();
  const contact = getContact(args.author, args.email);

  if (!fs.existsSync(templateDir)) {
    throw new CLIError('No template found');
  }

  const filteredArgs = Object.entries<string>(args)
    .filter(
      (arg) =>
        arg[0].match(/^[^$_]/) && !['interactive', 'template'].includes(arg[0])
    )
    .reduce(
      (sum, cur) => ((sum[cur[0]] = cur[1]), sum),
      {} as {
        [key in keyof View]: View[key];
      }
    );

  const view = {
    ...filteredArgs,
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
  try {
    const license = makeLicenseSync(args.license, {
      year,
      project: name,
      description: args.description,
      organization: getContact(args.author, args.email),
    });
    const licenseText = license.header + license.text + license.warranty;
    fs.writeFileSync(path.resolve(packageDir, 'LICENSE'), licenseText);
  } catch (e) {
    // do not generate LICENSE
  }

  // install dependencies using yarn / npm
  const useYarn = await IsYarnAvailable();
  if (exists('package.json', packageDir)) {
    console.log(`Installing dependencies.`);
    await installDeps(packageDir, useYarn);
  }

  // init git
  try {
    await initGit(packageDir);
    console.log('\nInitialized a git repository');
  } catch (err: any) {
    if (err?.exitCode == 127) return; // no git available
    throw err;
  }

  const run = (command: string, options: CommonOptions<string> = {}) => {
    const args = command.split(' ');
    return execa(args[0], args.slice(1), {
      stdio: 'inherit',
      cwd: packageDir,
      ...options,
    });
  };

  const installNpmPackage = (packageName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      let command: string;
      let args: string[];
      if (useYarn) {
        command = 'yarnpkg';
        args = ['--cwd', packageDir, 'add', packageName];
      } else {
        command = 'npm';
        args = ['install', '-D', packageName];
        process.chdir(packageDir);
      }
      const child = spawn(command, args, { stdio: 'inherit' });
      child.on('close', (code) => {
        if (code !== 0) {
          return reject(`installDeps failed: ${command} ${args.join(' ')}`);
        }
        resolve();
      });
    });
  };

  const afterHookOptions = {
    name,
    packageDir,
    template,
    templateDir,
    year,
    run,
    installNpmPackage,
    answers: {
      ...filteredArgs,
      contact,
    },
  };

  // after hook script
  if (options.after) {
    await Promise.resolve(options.after(afterHookOptions));
  }

  console.log(`\nSuccess! Created ${chalk.bold.cyan(name)}.`);

  if (options.caveat) {
    switch (typeof options.caveat) {
      case 'string':
        console.log(options.caveat);
        break;
      case 'function':
        const response = await Promise.resolve(
          options.caveat(afterHookOptions)
        );
        if (response) {
          console.log(response);
        }
        break;
      default:
    }
  }
}
