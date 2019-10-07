import fs from 'fs';
import path from 'path';
import globby from 'globby';
import isUtf8 from 'is-utf8';
import Mustache from 'mustache';
import {Config} from '.';

function prepareDirectory(filePath: string) {
  try {
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
  } catch {}
}

export function getAvailableTemplates(root: string) {
  return fs.readdirSync(root).filter((d) => !d.startsWith('.'));
}

export async function copy(args: Config) {
  const templateFiles = await globby(args.templateDir);
  for (const sourcePath of templateFiles) {
    const relativePath = path.relative(args.templateDir, sourcePath);
    const targetPath = path.resolve(args.packageDir, relativePath);

    prepareDirectory(targetPath);

    let sourceData = fs.readFileSync(sourcePath);
    let targetData = sourceData;
    if (isUtf8(sourceData)) {
      targetData = Buffer.from(
        Mustache.render(sourceData.toString(), args.view),
      );
    }
    fs.writeFileSync(targetPath, targetData, 'utf-8');
  }
}
