import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { copy } from '../../src/template';
import utils from '../utils';

const templates = join(__dirname, '.', 'test_templates', 'default');

describe('unit: tempate.ts', () => {
  let tempFolder: string;

  beforeEach(() => {
    tempFolder = utils.createTempFolder();
  });

  afterEach(() => {
    // cleanup
    utils.deleteTempFolder(tempFolder);
  });

  it('should copy template files and resolve variables both in file contents and in filenames', async () => {
    await copy({
      packageDir: tempFolder,
      templateDir: templates,
      view: {
        name: 'myproject',
        description: 'test description',
        author: 'author',
        email: 'test@email.com',
        license: 'MIT',
        contact: 'contact',
      },
    });

    expect(existsSync(tempFolder)).toBeTruthy();
    expect(existsSync(`${tempFolder}/README.md`)).toBeTruthy();
    expect(existsSync(`${tempFolder}/myproject.md`)).toBeTruthy();
    expect(readFileSync(`${tempFolder}/README.md`, 'utf-8')).toBe(
      '# myproject...'
    );
    expect(readFileSync(`${tempFolder}/myproject.md`, 'utf-8')).toBe(
      'myproject: testing variables on file names'
    );
  }, 300000);
});
