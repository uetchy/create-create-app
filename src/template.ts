import fs from 'fs';
import path from 'path';
import {tmpdir} from 'os';
import globby from 'globby';
import Mustache from 'mustache';
import isUtf8 from 'is-utf8';
import {Config} from '.';

function prepareDirectory(filePath: string) {
  try {
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
  } catch {}
}

export default async function copy(args: Config) {
  console.log('Bootstrapping your plugin package');
  console.log(args);

  const templateFiles = await globby(args.templateDir);
  for (const sourcePath of templateFiles) {
    const relativePath = path.relative(args.templateDir, sourcePath);
    const targetPath = path.resolve(args.packageDir, relativePath);
    prepareDirectory(targetPath);
    console.log(`Copying ${relativePath}`);
    let sourceData: Buffer = fs.readFileSync(sourcePath);
    let targetData: Buffer = sourceData;
    if (isUtf8(sourceData)) {
      targetData = Buffer.from(
        Mustache.render(sourceData.toString(), args.view),
      );
    }
    fs.writeFileSync(targetPath, targetData, 'utf-8');
  }
}
