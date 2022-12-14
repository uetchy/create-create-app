import fs from 'fs';
import globby from 'globby';
import Handlebars from 'handlebars';
import isUtf8 from 'is-utf8';
import path, { sep } from 'path';
import slash from 'slash';
import { v4 as uuidv4 } from 'uuid';
import { Answers } from '.';

function split(word: string): string[] {
  return word.split(/[-_\s]+/);
}

function space(word: string): string {
  return split(trim(word)).join(' ');
}
Handlebars.registerHelper('space', space);

function trim(text: string) {
  return text.replace(/[\r\n]/g, '');
}
Handlebars.registerHelper('trim', trim);

function upper(text: string) {
  return trim(text).toUpperCase();
}
Handlebars.registerHelper('upper', upper);

function lower(text: string, options?: any) {
  const space = options && options.hash && options.hash.space;
  return trim(text).toLowerCase();
}
Handlebars.registerHelper('lower', lower);

function capital(text: string, options?: any) {
  const space = options && options.hash && options.hash.space;
  return split(trim(text))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(space ? ' ' : '');
}
Handlebars.registerHelper('capital', capital);

function camel(text: string) {
  return capital(text).replace(/^./, (s) => s.toLowerCase());
}
Handlebars.registerHelper('camel', camel);

function snake(text: string) {
  return capital(text)
    .replace(/(?<=([a-z](?=[A-Z])|[A-Za-z](?=[0-9])))(?=[A-Z0-9])/g, '_')
    .toLowerCase();
}
Handlebars.registerHelper('snake', snake);

function kebab(text: string) {
  return snake(text).replace(/_/g, '-');
}
Handlebars.registerHelper('kebab', kebab);

function uuid() {
  return uuidv4();
}
Handlebars.registerHelper('uuid', uuid);

function rawHelper(options: Handlebars.HelperDeclareSpec) {
  return options.fn();
}
Handlebars.registerHelper('raw-helper', rawHelper);

function format<T>(text: Buffer | string, view: T) {
  const template = Handlebars.compile(text.toString(), { noEscape: true });
  return template(view);
}

function prepareDirectory(filePath: string) {
  try {
    const target = path.dirname(filePath);
    fs.mkdirSync(target, { recursive: true });
  } catch {}
}

export function getAvailableTemplates(root: string) {
  return fs.readdirSync(root).filter((d) => !d.startsWith('.'));
}

export interface CopyConfig {
  targetDir: string;
  sourceDir: string;
  view: Answers;
}

export async function copy(args: CopyConfig) {
  const sourceFiles = await globby(slash(args.sourceDir), { dot: true });

  for (const sourceFile of sourceFiles) {
    const relativePath = path.relative(args.sourceDir, sourceFile);
    const targetPath = format(
      slash(path.resolve(args.targetDir, relativePath)),
      args.view
    ).replace(new RegExp(`${sep}gitignore$`, 'g'), `${sep}.gitignore`); // https://github.com/uetchy/create-create-app/issues/38
    prepareDirectory(targetPath);

    let sourceData = fs.readFileSync(sourceFile);
    let targetData = sourceData;
    if (isUtf8(sourceData)) {
      targetData = Buffer.from(format(sourceData, args.view));
    }
    fs.writeFileSync(targetPath, targetData, 'utf-8');
  }
}
