import execa from 'execa';
import gitconfig from 'gitconfig';
import { printCommand } from '.';

export async function initGit(root: string) {
  printCommand('git init');
  await execa('git init', { shell: true, cwd: root });
}

export async function getGitUser(): Promise<{ name?: string; email?: string }> {
  try {
    const config = await gitconfig.get({ location: 'global' });
    return config.user ?? {};
  } catch (err) {
    return {};
  }
}
