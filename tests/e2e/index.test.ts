import execa from 'execa';
import { existsSync, mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import utils from '../utils';

describe('e2e: cli test', () => {
  let baseDir: string;

  beforeEach(() => {
    baseDir = utils.createTempFolder();
  });

  afterEach(() => {
    // cleanup
    utils.deleteTempFolder(baseDir);
  });

  it('should show usage example', async () => {
    const { stdout } = await execa(utils.scriptPath, []);
    expect(stdout).toContain('create-create-app <name>');
  });

  it('should create default project', async () => {
    const opts = [
      'greet',
      '--description',
      'desc.',
      '--author',
      '"Awesome Doe"',
      '--email',
      'awesome@example.com',
      '--template',
      'default',
      '--license',
      'MIT',
      '--node-pm',
      'pnpm',
    ];
    const { stdout } = await execa(utils.scriptPath, opts, { cwd: baseDir });
    expect(stdout).toContain('Read the docs for the further information');

    expect(existsSync(`${baseDir}/create-greet/package-lock.json`)).toBeFalsy();
    expect(existsSync(`${baseDir}/create-greet/pnpm-lock.yaml`)).toBeTruthy();

    const newGitignore = readFileSync(
      `${baseDir}/create-greet/.gitignore`,
      'utf-8'
    );
    expect(newGitignore).toContain('node_modules/');

    const newReadMe = readFileSync(
      `${baseDir}/create-greet/README.md`,
      'utf-8'
    );
    expect(newReadMe).toContain('# Create Greet');
    expect(newReadMe).toContain('- {{author}} => Awesome Doe');
    expect(newReadMe).toContain('- {{email}} => awesome@example.com');
    expect(newReadMe).toContain(
      'See https://github.com/uetchy/create-create-app#template for the further details.'
    );

    const newPackageJson = readFileSync(
      `${baseDir}/create-greet/package.json`,
      'utf-8'
    );
    expect(newPackageJson).toContain('"name": "create-greet",');
    expect(newPackageJson).toContain('"description": "desc.",');
    expect(newPackageJson).toContain(
      '"author": "Awesome Doe <awesome@example.com>",'
    );
    expect(newPackageJson).toContain('"license": "MIT"');
    expect(newPackageJson).toContain('"create-create-app": "^');

    const newSrcCli = readFileSync(
      `${baseDir}/create-greet/src/cli.js`,
      'utf-8'
    );
    expect(newSrcCli).toContain('#!/usr/bin/env node');
    expect(newSrcCli).toContain("create('create-greet', {");

    const newLicense = readFileSync(`${baseDir}/create-greet/LICENSE`, 'utf-8');
    expect(newLicense)
      .toBe(`Copyright (c) ${new Date().getFullYear()} Awesome Doe <awesome@example.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.
`);
  }, 300000);

  it('should create typescript project', async () => {
    const { stdout } = await execa(
      utils.scriptPath,
      [
        'greet',
        '--description',
        'say hello at ease.',
        '--author',
        'John Doe',
        '--email',
        'john@example.com',
        '--license',
        'Apache-2.0',
        '--template',
        'typescript',
      ],
      { cwd: baseDir }
    );
    expect(stdout).toContain('Build the app for production.');

    const testDir = join(baseDir, 'create-greet');
    await execa('npm', ['run', 'build'], {
      cwd: testDir,
    });
    const { stdout: stdout2 } = await execa(
      'node',
      [
        'dist/cli.js',
        'test',
        '--description',
        'Test',
        '--author',
        'someone',
        '--email',
        'someone@example.com',
        '--license',
        'Apache-2.0',
        '--architecture',
        'macOS',
      ],
      {
        cwd: testDir,
      }
    );
    expect(stdout2).toContain('Ok you chose macOS');
  }, 300000);

  it('should create unlicensed app', async () => {
    const opts = [
      'create-greet',
      '--description',
      'desc.',
      '--author',
      '"Awesome Doe"',
      '--email',
      'awesome@example.com',
      '--template',
      'default',
      '--license',
      'UNLICENSED',
    ];
    const { stdout } = await execa(utils.scriptPath, opts, {
      cwd: baseDir,
    });
    expect(stdout).toContain('Read the docs for the further information');

    const newPackageJson = readFileSync(
      join(baseDir, 'create-greet', 'package.json'),
      'utf-8'
    );
    expect(newPackageJson).toContain('"license": "UNLICENSED"');

    const existed = existsSync(`${baseDir}/create-greet/LICENSE`);
    expect(existed).toBeFalsy();
  }, 300000);
});
