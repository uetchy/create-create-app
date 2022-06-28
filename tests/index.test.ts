import execa from 'execa';
import { existsSync, mkdtempSync, readFileSync } from 'fs';
import { readdirSync } from 'node:fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { test, expect } from 'vitest';

const pkg = require('../package.json');

const SCRIPT_PATH = resolve(__dirname, '..', pkg.bin['create-create-app']);
const TMP_PREFIX = join(tmpdir(), 'create-create-app-');

const DEFAULT_ANSWERS = [
  '--description',
  'desc.',
  '--author',
  '"Awesome Doe"',
  '--email',
  'awesome@example.com',
];

test('show usage', async () => {
  const { stdout } = await execa(SCRIPT_PATH, []);
  expect(stdout).toBe('create-create-app <name>');
}, 300000);

test('template', async () => {
  const tmpDir = mkdtempSync(TMP_PREFIX);
  const projectPath = './tests/fixtures/create-test';
  const cliPath = resolve(join(projectPath, 'src/cli.js'));

  await execa('yarn', ['install'], {
    cwd: projectPath,
  });

  const opts = [
    cliPath,
    'test',
    ...DEFAULT_ANSWERS,
    '--template',
    'default',
    '--license',
    'UNLICENSED',
    '--architecture',
    'macOS',
  ];

  const { stdout } = await execa('node', opts, {
    cwd: tmpDir,
  });

  expect(readdirSync(join(tmpDir, 'test'))).toEqual(
    expect.arrayContaining([
      '.git',
      '.gitignore',
      'README.md',
      'test.code-workspace',
      'Test-config',
    ])
  );
  expect(
    readFileSync(join(tmpDir, 'test', 'test.code-workspace'), 'utf-8')
  ).toContain(`"name": "test"`);
  expect(
    readFileSync(
      join(tmpDir, 'test', 'Test-config', 'README-MACOS.md'),
      'utf-8'
    )
  ).toContain(`# README (macOS)`);
  expect(stdout).toContain('Ok you chose macOS');
}, 300000);

test('create default project with pnpm', async () => {
  const tmpDir = mkdtempSync(TMP_PREFIX);

  const opts = [
    'greet',
    ...DEFAULT_ANSWERS,
    '--template',
    'default',
    '--license',
    'MIT',
    '--node-pm',
    'pnpm',
  ];

  const { stdout } = await execa(SCRIPT_PATH, opts, { cwd: tmpDir });

  expect(stdout).toContain('Read the docs for the further information');

  expect(existsSync(`${tmpDir}/create-greet/.git`)).toBeTruthy();
  expect(existsSync(`${tmpDir}/create-greet/package-lock.json`)).toBeFalsy();
  expect(existsSync(`${tmpDir}/create-greet/pnpm-lock.yaml`)).toBeTruthy();

  const newGitignore = readFileSync(
    `${tmpDir}/create-greet/.gitignore`,
    'utf-8'
  );
  expect(newGitignore).toContain('node_modules/');

  const newReadMe = readFileSync(`${tmpDir}/create-greet/README.md`, 'utf-8');
  expect(newReadMe).toContain('# Create Greet');
  expect(newReadMe).toContain('- {{author}} => Awesome Doe');
  expect(newReadMe).toContain('- {{email}} => awesome@example.com');
  expect(newReadMe).toContain(
    'See https://github.com/uetchy/create-create-app#template for the further details.'
  );

  const newPackageJson = readFileSync(
    `${tmpDir}/create-greet/package.json`,
    'utf-8'
  );
  expect(newPackageJson).toContain('"name": "create-greet",');
  expect(newPackageJson).toContain('"description": "desc.",');
  expect(newPackageJson).toContain(
    '"author": "Awesome Doe <awesome@example.com>",'
  );
  expect(newPackageJson).toContain('"license": "MIT"');
  expect(newPackageJson).toContain('"create-create-app": "^');

  const newSrcCli = readFileSync(`${tmpDir}/create-greet/src/cli.js`, 'utf-8');
  expect(newSrcCli).toContain('#!/usr/bin/env node');
  expect(newSrcCli).toContain("create('create-greet', {");

  const newLicense = readFileSync(`${tmpDir}/create-greet/LICENSE`, 'utf-8');
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

test('create typescript project', async () => {
  const tmpDir = mkdtempSync(TMP_PREFIX);

  const { stdout } = await execa(
    SCRIPT_PATH,
    [
      'greet',
      ...DEFAULT_ANSWERS,
      '--license',
      'UNLICENSED',
      '--template',
      'typescript',
    ],
    { cwd: tmpDir }
  );

  expect(stdout).toContain('Build the app for production.');

  const projectDir = join(tmpDir, 'create-greet');

  await execa('npm', ['run', 'build'], {
    cwd: projectDir,
  });

  const { stdout: stdout2 } = await execa(
    'node',
    [
      'dist/cli.js',
      'test',
      ...DEFAULT_ANSWERS,
      '--license',
      'Apache-2.0',
      '--architecture',
      'macOS',
    ],
    {
      cwd: projectDir,
    }
  );
  expect(stdout2).toContain('Ok you chose macOS');
}, 300000);

test('create unlicensed app', async () => {
  const tmpDir = mkdtempSync(TMP_PREFIX);

  const opts = [
    'create-greet',
    ...DEFAULT_ANSWERS,
    '--template',
    'default',
    '--license',
    'UNLICENSED',
  ];

  const { stdout } = await execa(SCRIPT_PATH, opts, {
    cwd: tmpDir,
  });

  expect(stdout).toContain('Read the docs for the further information');

  const newPackageJson = readFileSync(
    join(tmpDir, 'create-greet', 'package.json'),
    'utf-8'
  );
  expect(newPackageJson).toContain('"license": "UNLICENSED"');

  const existed = existsSync(`${tmpDir}/create-greet/LICENSE`);
  expect(existed).toBeFalsy();
}, 300000);

test('should create project with minimal footprint', async () => {
  const tmpDir = mkdtempSync(TMP_PREFIX);
  const projectPath = './tests/fixtures/create-test';
  const cliPath = resolve(join(projectPath, 'src/cli.js'));

  await execa('yarn', ['install'], {
    cwd: projectPath,
  });

  const opts = [
    cliPath,
    'test',
    ...DEFAULT_ANSWERS,
    '--license',
    'UNLICENSED',
    '--template',
    'default',
    '--architecture',
    'macOS',
    '--skip-install',
    '--skip-git',
  ];

  await execa('node', opts, {
    cwd: tmpDir,
  });

  expect(existsSync(`${tmpDir}/test/LICENSE`)).toBeFalsy();
  expect(existsSync(`${tmpDir}/test/node_modules`)).toBeFalsy();
  expect(existsSync(`${tmpDir}/test/.git`)).toBeFalsy();
}, 300000);

test('should create project with minimal questions', async () => {
  const tmpDir = mkdtempSync(TMP_PREFIX);
  const projectPath = './tests/fixtures/minimal';
  const cliPath = resolve(join(projectPath, 'src/cli.js'));

  await execa('yarn', ['install'], {
    cwd: projectPath,
  });

  const opts = [cliPath, 'test'];

  await execa('node', opts, {
    cwd: tmpDir,
  });

  expect(existsSync(`${tmpDir}/test/.git`)).toBeFalsy();
  expect(existsSync(`${tmpDir}/test/yarn.lock`)).toBeTruthy();
  expect(readFileSync(`${tmpDir}/test/LICENSE`, 'utf-8')).toContain(
    'DO WHAT THE FUCK'
  );
  expect(
    readFileSync(`${tmpDir}/test/package.json`, 'utf-8').replace(/\r\n/g, '\n')
  ).toBe(`{
  "name": "test",
  "description": "Hi",
  "author": "Ina <ina@example.com>"
}
`);
}, 300000);
