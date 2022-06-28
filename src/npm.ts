import { NodePM, printCommand, CLIError } from '.';
import { spawnPromise } from './fs';

function getPm(name: string) {
  switch (name) {
    case 'pnpm':
      return NodePM.Pnpm;

    case 'yarn':
      return NodePM.Yarn;

    case 'npm':
      return NodePM.Npm;
  
    default:
      return NodePM.Npm;
  }
}

// License for `whichPm`
// The MIT License (MIT)
// Copyright (c) 2017-2022 Zoltan Kochan <z@kochan.io>
// https://github.com/zkochan/packages/tree/main/which-pm-runs
export function whichPm(defaultPm?: string) {
  // if there's a default pm (passed by argv), use it
  if(defaultPm) {
    return getPm(defaultPm);
  }

  if (!process.env.npm_config_user_agent) {
    return NodePM.Npm;
  }

  const pmSpec = process.env.npm_config_user_agent.split(' ')[0]
  const separatorPos = pmSpec.lastIndexOf('/')
  const name = pmSpec.substring(0, separatorPos)

  return getPm(name);
}

export async function installDeps(rootDir: string, pm: NodePM) {
  let command: string;
  let args: string[];

  console.log(`Installing dependencies using ${pm}`);

  switch (pm) {
    case NodePM.Npm: {
      command = 'npm';
      args = ['install'];
      process.chdir(rootDir);
      break;
    }
    case NodePM.Yarn: {
      command = 'yarnpkg';
      args = ['install', '--cwd', rootDir];
      break;
    }
    case NodePM.Pnpm: {
      command = 'pnpm';
      args = ['install', '--dir', rootDir];
      break;
    }
  }

  printCommand(command, ...args);

  try {
    await spawnPromise(command, args, { stdio: 'inherit', shell: true });
  } catch (err) {
    throw new CLIError(`Failed to install dependencies: ${err}`);
  }
}

export async function addDeps({
  rootDir,
  deps,
  isDev = false,
  pm,
}: {
  rootDir: string;
  deps: string[];
  isDev?: boolean;
  pm: NodePM;
}) {
  let command: string;
  let args: string[];

  switch (pm) {
    case NodePM.Npm: {
      command = 'npm';
      args = ['install', isDev ? '-D' : '-S', ...deps];
      process.chdir(rootDir);
      break;
    }
    case NodePM.Yarn: {
      command = 'yarnpkg';
      args = ['add', '--cwd', rootDir, ...deps, isDev ? '-D' : ''];
      break;
    }
    case NodePM.Pnpm: {
      command = 'pnpm';
      args = ['add', '--dir', rootDir, ...deps, isDev ? '-D' : ''];
      break;
    }
  }

  printCommand(command, ...args);

  try {
    await spawnPromise(command, args, { stdio: 'inherit', shell: true });
  } catch (err) {
    throw new CLIError(`Failed to add dependencies: ${err}`);
  }
}
