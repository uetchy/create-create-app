import { create } from '../src/index'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

const TEST_WORK_DIR = path.join(os.tmpdir(), 'jest_create_create_app_setup')
const TEST_CURRENT_DIR = process.cwd()

describe('create()', () => {
  beforeEach(() => {
    fs.mkdirSync(TEST_WORK_DIR, { recursive: true })
  })

  afterEach(() => {
    fs.rmdirSync(TEST_WORK_DIR, { recursive: true })
    // back to current dir
    process.chdir(TEST_CURRENT_DIR)
  })

  test('create app', async () => {
    process.argv = [
      'create',
      'create-app',
      'sample_book',
      '--description',
      'desc.',
      '--author',
      'Awesome Doe',
      '--email',
      'awesome@example.com',
      '--license',
      'Apache-2.0',
    ]
    process.chdir(TEST_WORK_DIR)

    const opts = await create('foo', {
      templateRoot: `${TEST_CURRENT_DIR}/templates`,
    })

    const newReadMe = fs.readFileSync(`${TEST_WORK_DIR}/sample_book/README.md`)
    expect(newReadMe.toString()).toMatch('# Sample Book')
    expect(newReadMe.toString()).toMatch('- {{author}} => Awesome Doe')
    expect(newReadMe.toString()).toMatch('- {{email}} => awesome@example.com')
    expect(newReadMe.toString()).toMatch(
      'See https://github.com/uetchy/create-create-app#template for the further details.'
    )

    const newPackageJson = fs.readFileSync(
      `${TEST_WORK_DIR}/sample_book/package.json`
    )
    expect(newPackageJson.toString()).toMatch('"name": "sample-book",')
    expect(newPackageJson.toString()).toMatch('"description": "desc.",')
    expect(newPackageJson.toString()).toMatch(
      '"author": "Awesome Doe <awesome@example.com>",'
    )
    expect(newPackageJson.toString()).toMatch('"license": "Apache-2.0"')

    const newSrcCli = fs.readFileSync(`${TEST_WORK_DIR}/sample_book/src/cli.js`)
    expect(newSrcCli.toString()).toMatch('#!/usr/bin/env node')
    expect(newSrcCli.toString()).toMatch("create('sample-book', {")
  }, 300000)

  test('create unlicensed app', async () => {
    process.argv = [
      'create',
      'create-app',
      'sample_book',
      '--description',
      'desc.',
      '--author',
      'Awesome Doe',
      '--email',
      'awesome@example.com',
      '--license',
      'UNLICENSED',
    ]
    process.chdir(TEST_WORK_DIR)

    const opts = await create('foo', {
      templateRoot: `${TEST_CURRENT_DIR}/templates`,
    })

    const newPackageJson = fs.readFileSync(
      `${TEST_WORK_DIR}/sample_book/package.json`
    )
    expect(newPackageJson.toString()).toMatch('"license": "UNLICENSED"')

    const existed = fs.existsSync(`${TEST_WORK_DIR}/sample_book/LICENSE`)
    expect(existed).toBeFalsy()
  }, 300000)
})
