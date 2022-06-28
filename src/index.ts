import chalk from 'chalk';
import { epicfail } from 'epicfail';
import execa, { CommonOptions, ExecaChildProcess } from 'execa';
import fs from 'fs';
import { availableLicenses, makeLicenseSync } from 'license.js';
import path from 'path';
import yargsInteractive, { OptionData } from 'yargs-interactive';
import { exists, isOccupied } from './fs';
import { getGitUser, initGit } from './git';
import { addDeps, installDeps, whichPm } from './npm';
import { copy, getAvailableTemplates } from './template';

export interface Option {
  [key: string]: OptionData | { default: boolean };
}

export interface Options {
  templateRoot: string;
  promptForTemplate?: boolean;
  promptForLicense?: boolean;
  promptForNodePM?: boolean;
  skipGitInit?: boolean;
  skipNpmInstall?: boolean;
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
  installNpmPackage: (packageName: string, isDev?: boolean) => Promise<void>;
}

export enum NodePM {
  Npm = 'npm',
  Yarn = 'yarn',
  Pnpm = 'pnpm',
}

export class CLIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CLIError';
  }
}

export function printCommand(...commands: string[]) {
  console.log(chalk.gray('>', ...commands));
}

function getContact(author: string, email?: string) {
  return `${author}${email ? ` <${email}>` : ''}`;
}

async function getYargsOptions(
  templateRoot: string,
  promptForTemplate: boolean,
  promptForLicense: boolean,
  promptForNodePM: boolean,
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
      describe: 'Description',
      default: 'description',
      prompt: 'if-no-arg',
    },
    author: {
      type: 'input',
      describe: 'Author name',
      default: gitUser.name,
      prompt: 'if-no-arg',
    },
    email: {
      type: 'input',
      describe: 'Author email',
      default: gitUser.email,
      prompt: 'if-no-arg',
    },
    template: {
      type: 'list',
      describe: 'Template',
      default: 'default',
      prompt: askForTemplate ? 'if-no-arg' : 'never',
      choices: availableTemplates,
    },
    license: {
      type: 'list',
      describe: 'License',
      choices: [...availableLicenses(), 'UNLICENSED'],
      default: promptForLicense ? 'MIT' : 'UNLICENSED',
      prompt: promptForLicense ? 'if-no-arg' : 'never',
    },
    'node-pm': {
      type: 'list',
      describe: 'package manager to use for installing packages from npm',
      choices: ['npm', 'yarn', 'pnpm'],
      default: undefined, // undefined by default, we'll try to guess pm manager later
      prompt: promptForNodePM ? 'if-no-arg' : 'never',
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

  if (isOccupied(packageDir)) {
    throw new CLIError(`${packageDir} is not empty directory.`);
  }

  const {
    templateRoot,
    promptForTemplate = false,
    promptForLicense = true,
    promptForNodePM = false,
  } = options;

  const yargsOption = await getYargsOptions(
    templateRoot,
    promptForTemplate,
    promptForLicense,
    promptForNodePM,
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
  console.log(`\nCreating a new package in ${chalk.green(packageDir)}.`);
  await copy({
    packageDir,
    templateDir,
    view,
  });

  // create license file
  try {
    const license = makeLicenseSync(args.license, {
      year,
      project: name,
      description: args.description,
      organization: getContact(args.author, args.email),
    });
    const licenseText =
      (license.header ?? '') + license.text + (license.warranty ?? '');
    fs.writeFileSync(path.resolve(packageDir, 'LICENSE'), licenseText);
  } catch (e) {
    // do not generate LICENSE
  }

  const run = (command: string, options: CommonOptions<string> = {}) => {
    const args = command.split(' ');
    return execa(args[0], args.slice(1), {
      stdio: 'inherit',
      cwd: packageDir,
      ...options,
    });
  };

  // init git

  // init git if option skipGitInit or arg --skip-git are not set
  const skipGit = args['skip-git'];
  if (!(options.skipGitInit || skipGit)) {
    try {
      console.log('\nInitializing a git repository');
      await initGit(packageDir);
    } catch (err: any) {
      if (err?.exitCode == 127) return; // no git available
      throw err;
    }
  }

  // run Node.js related tasks (only if `package.json` does exist in the template root)
  let installNpmPackage = async (
    pkg: string,
    isDev?: boolean
  ): Promise<void> => {};

  if (exists('package.json', packageDir)) {
    const nodePMArg = args['node-pm'];
    const skipInstallArg = args['skip-install'];

    // guess which package manager to use
    const packageManager = whichPm(nodePMArg);

    // install deps only if skipNpmInstall is not falsy
    if (!(options.skipNpmInstall || skipInstallArg)) {
      await installDeps(packageDir, packageManager);
    }

    installNpmPackage = async (
      pkg: string | string[],
      isDev: boolean = false
    ): Promise<void> => {
      await addDeps(packageDir, Array.isArray(pkg) ? pkg : [pkg], {
        isDev,
        pm: packageManager,
      });
    };
  }

  const afterHookOptions: AfterHookOptions = {
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

  // run after hook script
  if (options.after) {
    await Promise.resolve(options.after(afterHookOptions));
  }

  console.log(`\nSuccessfully created ${chalk.bold.cyan(packageDir)}`);

  // show caveat
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
