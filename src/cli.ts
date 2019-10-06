import {tmpdir} from 'os';
import fs from 'fs';
import path from 'path';
import globby from 'globby';
import Mustache from 'mustache';
import inquirer from 'inquirer';
import gitconfig from 'gitconfig';

interface Arguments {
  [key: string]: unknown;
  $0: string;
  _: string[];
  pluginName?: string;
  author?: string;
  email?: string;
  description: string;
  license?: string;
  template: string;
}

async function ask(key: string, options: {} = {}): Promise<string> {
  const answer = await inquirer.prompt<{name: string}>([
    {name: key, ...options},
  ]);
  return Object.values(answer)[0];
}

function prepareDirectory(filePath: string) {
  try {
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
  } catch {}
}

async function getGitUser() {
  const config = await gitconfig.get({location: 'global'});
  return config.user;
}

function validateEmptiness(s: string) {
  return s && s.length > 0;
}

export default async function cli(args: Arguments) {
  let name: string;
  if (args._.length === 0) {
    throw new Error('create-figma-plugin <name>');
  } else if (args._[0] === '.') {
    name = path.basename(process.cwd());
  } else {
    name = args._[0];
  }

  const targetDir = path.resolve(name);

  console.log('Bootstrapping your plugin package');
  const pluginName =
    args.pluginName || (await ask('pluginName', {validate: validateEmptiness}));
  const description = args.description || (await ask('description'));
  const author =
    args.author ||
    (await ask('author', {
      default: async () => (await getGitUser()).name,
    }));
  const email =
    args.email ||
    (await ask('email', {
      default: async () => (await getGitUser()).email,
    }));
  const license =
    args.license || (await ask('license', {type: 'list', choices: ['MIT']}));
  const templateDir = path.resolve(__dirname, '../templates', args.template);
  if (!fs.existsSync(templateDir)) {
    throw new Error('No template found');
  }

  const view = {
    pluginName,
    name,
    description,
    author,
    email,
    license,
    year: new Date().getFullYear(),
  };

  const templateFiles = await globby(templateDir);
  for (const sourcePath of templateFiles) {
    const relativePath = path.relative(templateDir, sourcePath);
    const targetPath = path.resolve(targetDir, relativePath);
    prepareDirectory(targetPath);
    console.log(`Copying ${relativePath}`);
    const sourceData = fs.readFileSync(sourcePath);
    const templatedData = Mustache.render(sourceData.toString(), view);
    fs.writeFileSync(targetPath, templatedData, 'utf-8');
  }
}
