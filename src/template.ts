import fs from 'fs';
import path from 'path';
import globby from 'globby';
import isUtf8 from 'is-utf8';
import uuidv4 from 'uuid/v4';
import Handlebars from 'handlebars';

import {Config} from '.';

function trim(text: string) {
  return text.replace(/[\r\n]/g, '');
}
Handlebars.registerHelper('trim', trim);

function upper(text: string) {
  return trim(text).toUpperCase();
}
Handlebars.registerHelper('upper', upper);

function lower(text: string) {
  return trim(text).toLowerCase();
}
Handlebars.registerHelper('lower', lower);

function capital(text: string, options?: any) {
  const space = options && options.hash && options.hash.space;
  return trim(text)
    .split(/[-_\s]+/)
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

function format<T>(text: Buffer | string, view: T) {
  const template = Handlebars.compile(text.toString(), {noEscape: true});
  return template(view);
}

function prepareDirectory(filePath: string) {
  try {
    const target = path.dirname(filePath);
    fs.mkdirSync(target, {recursive: true});
  } catch {}
}

export function getAvailableTemplates(root: string) {
  return fs.readdirSync(root).filter((d) => !d.startsWith('.'));
}

export async function copy(args: Config) {
  const templateFiles = await globby(args.templateDir, {dot: true});
  for (const sourcePath of templateFiles) {
    const relativePath = path.relative(args.templateDir, sourcePath);
    const targetPath = format(
      path.resolve(args.packageDir, relativePath),
      args.view,
    );
    prepareDirectory(targetPath);

    let sourceData = fs.readFileSync(sourcePath);
    let targetData = sourceData;
    if (isUtf8(sourceData)) {
      targetData = Buffer.from(format(sourceData, args.view));
    }
    fs.writeFileSync(targetPath, targetData, 'utf-8');
  }
}
