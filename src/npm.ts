import { NodePM, printCommand, CLIError } from '.';
import { spawnPromise } from './fs';

export async function installDeps(rootDir: string, pm: NodePM) {
  let command: string;
  let args: string[];

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
