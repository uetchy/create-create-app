import chalk from 'chalk';
import { epicfail } from 'epicfail';
import execa, { CommonOptions, ExecaChildProcess } from 'execa';
import fs from 'fs';
import {
  availableLicenses as getAvailableLicenses,
  makeLicenseSync,
} from 'license.js';
import path from 'path';
import yargsInteractive, { OptionData } from 'yargs-interactive';
import { exists, isOccupied } from './fs';
import { getGitUser, initGit } from './git';
import { addDeps, installDeps, PackageManager, whichPm } from './npm';
import { copy, getAvailableTemplates } from './template';

export interface Option {
  [key: string]: OptionData | { default: boolean };
}

export interface Options {
  templateRoot: string;

  modifyName?: (name: string) => string | Promise<string>;
  extra?: Option;

  defaultDescription?: string;
  defaultAuthor?: string;
  defaultEmail?: string;
  defaultTemplate?: string;
  defaultLicense?: string;
  defaultPackageManager?: PackageManager;

  promptForDescription?: boolean;
  promptForAuthor?: boolean;
  promptForEmail?: boolean;
  promptForTemplate?: boolean;
  promptForLicense?: boolean;
  promptForPackageManager?: boolean;

  skipGitInit?: boolean;
  skipNpmInstall?: boolean;

  after?: (options: AfterHookOptions) => void | Promise<void>;
  caveat?:
    | string
    | ((options: AfterHookOptions) => string | void | Promise<string | void>);
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
  answers: View;
  run: (
    command: string,
    options?: CommonOptions<string>
  ) => ExecaChildProcess<string>;
  installNpmPackage: (packageName: string, isDev?: boolean) => Promise<void>;
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

export async function create(appName: string, options: Options) {
  epicfail(require.main!.filename, {
    assertExpected: (err) => err.name === 'CLIError',
  });

  const gitUser = await getGitUser();

  const {
    templateRoot,
    modifyName,
    extra: extraOptions = {},
    after,
    caveat,

    defaultDescription = 'description',
    defaultAuthor = gitUser.name ?? 'Your name',
    defaultEmail = gitUser.email ?? 'Your email',
    defaultTemplate = 'default',
    defaultLicense = 'MIT',
    defaultPackageManager = undefined, // undefined by default, we'll try to guess pm manager later

    promptForDescription = true,
    promptForAuthor = true,
    promptForEmail = true,
    promptForTemplate = false,
    promptForLicense = true,
    promptForPackageManager = false,

    skipGitInit = false,
    skipNpmInstall = false,
  } = options;

  // verify args
  const firstArg = process.argv[2];
  if (firstArg === undefined) {
    throw new CLIError(`${appName} <name>`);
  }

  // configure package name and root direcotry
  const useCurrentDir = firstArg === '.';

  const name: string = useCurrentDir
    ? path.basename(process.cwd())
    : modifyName
    ? await Promise.resolve(modifyName(firstArg))
    : firstArg;

  const packageDir = useCurrentDir ? process.cwd() : path.resolve(name);
  if (isOccupied(packageDir)) {
    throw new CLIError(`${packageDir} is not empty directory.`);
  }

  // construct yargs options
  const availableTemplates = getAvailableTemplates(templateRoot);
  if (availableTemplates.length === 0) {
    throw new CLIError(`No template found`);
  }

  const availableLicenses = [...getAvailableLicenses(), 'UNLICENSED'];

  const isMultipleTemplates = availableTemplates.length > 1;

  const yargsOption = {
    interactive: { default: true },
    description: {
      type: 'input',
      describe: 'Description',
      default: defaultDescription,
      prompt: promptForDescription ? 'if-no-arg' : 'never',
    },
    author: {
      type: 'input',
      describe: 'Author name',
      default: defaultAuthor,
      prompt: promptForAuthor ? 'if-no-arg' : 'never',
    },
    email: {
      type: 'input',
      describe: 'Author email',
      default: defaultEmail,
      prompt: promptForEmail ? 'if-no-arg' : 'never',
    },
    template: {
      type: 'list',
      describe: 'Template',
      default: defaultTemplate,
      prompt: isMultipleTemplates && promptForTemplate ? 'if-no-arg' : 'never',
      choices: availableTemplates,
    },
    license: {
      type: 'list',
      describe: 'License',
      choices: availableLicenses,
      default: defaultLicense,
      prompt: promptForLicense ? 'if-no-arg' : 'never',
    },
    'node-pm': {
      type: 'list',
      describe: 'Package manager to use for installing packages from npm',
      choices: ['npm', 'yarn', 'pnpm'],
      default: defaultPackageManager, // undefined by default, we'll try to guess pm later
      prompt: promptForPackageManager ? 'if-no-arg' : 'never',
    },
    'skip-git': {
      type: 'confirm',
      describe: 'Skip initializing git repository',
      prompt: 'never',
    },
    'skip-install': {
      type: 'confirm',
      describe: 'Skip installing package dependencies',
      prompt: 'never',
    },
    ...extraOptions,
  };

  const args = (await yargsInteractive()
    .usage('$0 <name> [args]')
    .interactive(yargsOption as any)) as Record<keyof typeof yargsOption, any>;

  const template = args['template'];
  const templateDir = path.resolve(templateRoot, template);

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

  const year = new Date().getFullYear();
  const contact = getContact(args['author'], args['email']);

  // copy files from the template folder
  console.log(`\nCreating a new package in ${chalk.green(packageDir)}.`);

  await copy({
    packageDir,
    templateDir,
    view: {
      ...filteredArgs,
      name,
      year,
      contact,
    },
  });

  // create license file
  try {
    const license = makeLicenseSync(args['license'], {
      year,
      project: name,
      description: args.description,
      organization: getContact(args['author'], args['email']),
    });
    const licenseText =
      (license.header ?? '') + license.text + (license.warranty ?? '');
    fs.writeFileSync(path.resolve(packageDir, 'LICENSE'), licenseText);
  } catch (e) {
    // do not generate LICENSE
  }

  // init git if option skipGitInit or arg --skip-git are not set
  if (!(skipGitInit || args['skip-git'])) {
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
    // guess which package manager to use
    const packageManager = args['node-pm'] ?? whichPm();

    // install deps only if skipNpmInstall is not falsy
    if (!(skipNpmInstall || args['skip-install'])) {
      console.log(`\nInstalling dependencies using ${packageManager}`);
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

  // setup afterHookOptions
  const run = (command: string, options: CommonOptions<string> = {}) => {
    const [script, ...scriptArgs] = command.split(' ');

    return execa(script, scriptArgs, {
      stdio: 'inherit',
      cwd: packageDir,
      ...options,
    });
  };

  const hookOptions: AfterHookOptions = {
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
  if (after) {
    await Promise.resolve(after(hookOptions));
  }

  console.log(`\nSuccessfully created ${chalk.bold.cyan(packageDir)}`);

  // show caveat
  if (caveat) {
    switch (typeof caveat) {
      case 'string':
        console.log(caveat);
        break;
      case 'function':
        const response = await Promise.resolve(caveat(hookOptions));
        if (response) {
          console.log(response);
        }
        break;
      default:
    }
  }
}
