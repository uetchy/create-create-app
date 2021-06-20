<div align="center">
<h1 align="center">✨ Create Create App</h1>
<h6>Create your own `create-something` app.</h6>
<br/>
<img src="https://raw.githubusercontent.com/uetchy/create-create-app/master/.github/assets/ss1.png" alt="screenshot"/>
<br/><br/>
<a href="https://npmjs.org/package/create-create-app"><img src="https://img.shields.io/npm/v/create-create-app.svg"></a>
<a href="https://npmjs.org/package/create-create-app"><img src="https://badgen.net/npm/dt/create-create-app"></a>
<a href="https://github.com/uetchy/create-create-app/actions?workflow=test"><img src="https://github.com/uetchy/create-create-app/workflows/test/badge.svg"/></a>
</div>

## Why?

- ⚖️ **Built-in License chooser** No need to worry about license thingy.
- 🎩 **Template engine** You can use template strings in text files, file names, and folder names.
- 💄 **Highly customizable** Can change caveat text, add extra command-line options.

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Quick Start](#quick-start)
  - [1. Bootstrap your project](#1-bootstrap-your-project)
  - [2. Add and edit template files](#2-add-and-edit-template-files)
  - [3. Build the app (TypeScript only)](#3-build-the-app-typescript-only)
  - [4. Publish package to npm](#4-publish-package-to-npm)
  - [5. PROFIT](#5-profit)
- [Template](#template)
  - [Advanced: Multiple templates](#advanced-multiple-templates)
  - [Helper functions](#helper-functions)
    - [`upper`](#upper)
    - [`lower`](#lower)
    - [`capital`](#capital)
    - [`camel`](#camel)
    - [`snake`](#snake)
    - [`kebab`](#kebab)
    - [`space`](#space)
    - [`uuid`](#uuid)
- [Config](#config)
  - [templateRoot (required)](#templateroot-required)
  - [promptForTemplate (default: `false`)](#promptfortemplate-default-false)
  - [extra (default: `undefined`)](#extra-default-undefined)
  - [modifyName (default: `undefined`)](#modifyname-default-undefined)
  - [after (default: `undefined`)](#after-default-undefined)
  - [caveat (default: `undefined`)](#caveat-default-undefined)
  - [AfterHookOptions](#afterhookoptions)
- [Showcase](#showcase)
- [Contribution](#contribution)
  - [Contributors ✨](#contributors-)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Quick Start

Let's create `create-greet` package in five steps.

### 1. Bootstrap your project

```shell
npx create-create-app greet  # simplest route
npm init create-app greet    # requires npm 6+
yarn create create-app greet # requires Yarn 0.25+
```

You will then be asked about your project.

![screenshot](https://raw.githubusercontent.com/uetchy/create-create-app/master/.github/assets/ss1.png)

### 2. Add and edit template files

```shell
cd create-greet
```

Then you can see the `templates/default` folder where the actual template files go.

### 3. Build the app (TypeScript only)

Run `npm run build` or `yarn build` to transpile TypeScript code into JavaScript. If you chose the default template, this step is not necessary.

### 4. Publish package to npm

Run `npm publish` or `yarn publish` to publish your `create-greet` app to npm.

### 5. PROFIT

```bash
npx create-greet ohayo
npm init greet ohayo
yarn create greet ohayo
```

![screenshot](https://raw.githubusercontent.com/uetchy/create-create-app/master/.github/assets/ss2.png)

## Template

Edit files inside `templates/default`. Every file name, directory name, and a text file will be processed through Handlebars template engine to replace all template strings with the respective value.

Built-in variables are:

- `{{name}}` package name (e.g. `ohayo`)
- `{{description}}` package description
- `{{author}}` author name (e.g. `John Doe`)
- `{{email}}` author email (e.g. `john@example.com`)
- `{{contact}}` author name formatted with `{{name}} <{{email}}>`. If email is missing, simply `{{name}}`
- `{{license}}` package license (e.g. `MIT`)
- `{{year}}` current year (e.g. `2021`)

### Advanced: Multiple templates

Creates a new directory in the location defined by `templateRoot`. It can be accessed via `--template` flag (e.g. `create-something <name> --template <template>`).
You might want to set `promptForTemplate` to `true` to explicitly ask the user to choose a template during the initialization phase. If `promptForTemplate` is `false`, which is the default behavior, `default` template will be used unless the user explicitly selects a template via `--template` cli flag.

### Helper functions

In the following example, we assume that the variable `name` is `create-react-app`.

#### `upper`

Convert text to UPPERCASE.

`{{upper name}}` becomes `CREATE-REACT-APP`.

#### `lower`

Convert text to lowercase.

`{{lower name}}` becomes `create-react-app`.

#### `capital`

Convert text to CapitalCase.

- `{{capital name}}` becomes `CreateReactApp`
- `{{capital name space=true}}` becomes `Create React App`.

#### `camel`

Convert text to camelCase.

`{{camel name}}` becomes `createReactApp`.

#### `snake`

Convert text to snake_case.

`{{snake name}}` becomes `create_react_app`.

#### `kebab`

Convert text to kebab-case.

`{{kebab name}}` becomes `create-react-app`.

#### `space`

Replace all word separators with single space.

`{{space name}}` becomes `create react app`

#### `uuid`

Generates unique UUID string.

```
{{uuid}} // => a5df7100-da46-47a6-907e-afe861f48b39
{{upper (uuid)}} // => A5DF7100-DA46-47A6-907E-AFE861F48B39
```

## Config

The app configuration can be found in `src/cli.js` (or `src/cli.ts` if you choose the `typescript` template).

```ts
import { resolve } from 'path';
import { create } from 'create-create-app';

create('create-greet', {
  templateRoot: resolve(__dirname, '..', 'templates'),
  extra: {
    language: {
      type: 'input',
      describe: 'greeting language',
      default: 'en',
      prompt: 'if-no-arg',
    },
  },
  modifyName: (name) => `package-prefix-${name}`,
  after: ({ installNpmPackage }) => installNpmPackage('chalk'),
  caveat: `Your app has been created successfully!`,
});
```

### templateRoot (required)

`templateRoot` is set to `path.resolve(__dirname, '../templates')`. You can change this to any location you like.

### promptForTemplate (default: `false`)

Interactively asks the user to select a template if and only if:

1. `promptForTemplate` is set to `true`, and
2. there are multiple templates in the `templates` directory.

Even if `promptForTemplate` is set to `false`, the user can still specify a template with the command line flag `--template <template>`.

```
create-something <name> --template <template>
```

### extra (default: `undefined`)

`object | undefined`

Additional questions can be defined. These options will be available as CLI flags, interactive questions, and template strings. In the example above, `--language` flag and the `{{language}}` template string will be enabled in the app.

All possible options can be found in the [yargs-interactive documentation](https://github.com/nanovazquez/yargs-interactive#options).

### modifyName (default: `undefined`)

`(name: string) => string | Promise<string>`

Modify `name` property.

```js
{
  modifyName: (name) => (name.startsWith('create-') ? name : `create-${name}`);
}
```

### after (default: `undefined`)

`(options: AfterHookOptions) => void`

Define after-hook script to be executed after initialization.

### caveat (default: `undefined`)

`string | ((options: AfterHookOptions) => string | void) | undefined`

The caveat message will be shown after the entire process is completed.

```js
create('create-greet', {
  caveat: 'Happy coding!',
});
```

```js
create('create-greet', {
  caveat: ({ answers }) => `Run -> cd ${answers.name} && make`,
});
```

```js
create('create-greet', {
  extra: {
    plugin: {
      type: 'input',
      describe: 'plugin to be used in your project',
      default: 'some-plugin',
      prompt: 'if-no-arg',
    },
  },
  caveat: async ({ packageDir, answers }) => {
    const { plugin } = answers;
    await execa('npm', ['install', '--prefix', packageDir, '-S', plugin]);
    console.log(`"${plugin}" has been added`);
  },
});
```

### AfterHookOptions

```typescript
{
  // variables
  packageDir: string; // e.g. "/path/to/ohayo"
  templateDir: string; // e.g. "/path/to/create-greet/templates/default"
  year: number; // e.g. 2020
  answers: {
    name: string; // package name passed through `modifyName`
    description: string; // description
    author: string; // e.g. "John Doe"
    email: string; // e.g. "john@example.com"
    contact: string; // e.g. "John Doe <john@example.com>"
    license: string; // e.g. "MIT"
    [key: string]: string | number | boolean | any[]; // any values defined in the `extra` field.
  };

  // helper functions
  run: (command: string, options?: CommonOptions<string>) => ExecaChildProcess<string>; // execute shell commands in the package dir
  installNpmPackage: (packageName: string) => Promise<void>; // install npm package. uses yarn if available
}
```

## Showcase

List of amazing projects built with `create-create-app`.

- [create-create-app](https://github.com/uetchy/create-create-app) - Yes, `create-create-app` uses `create-create-app` itself to generate `create-<app>` template!
- [create-book](https://github.com/vivliostyle/create-book) - Fast & frictionless book template generator.
- [create-vivliostyle-theme](https://github.com/vivliostyle/themes/tree/master/packages/create-vivliostyle-theme) - Create Vivliostyle theme at ease.
- [create-alfred-workflow](https://github.com/uetchy/create-alfred-workflow) - Create Alfred Workflow.
- [create-catalyst](https://github.com/dvalinotti/create-catalyst) - NPM create-app command for scaffolding a new Web Components project with GitHub's Catalyst.
- [create-lit](https://github.com/litelement-dev/create-lit) - Create simple-starter-kit `lit` applications.

> Send a PR to add yours here!

## Contribution

PRs are always welcome.

### Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://uechi.io/"><img src="https://avatars0.githubusercontent.com/u/431808?v=4" width="100px;" alt=""/><br /><sub><b>uetchy</b></sub></a><br /><a href="https://github.com/uetchy/create-create-app/commits?author=uetchy" title="Code">💻</a> <a href="https://github.com/uetchy/create-create-app/commits?author=uetchy" title="Documentation">📖</a></td>
    <td align="center"><a href="https://vivliostyle.org/"><img src="https://avatars1.githubusercontent.com/u/3324737?v=4" width="100px;" alt=""/><br /><sub><b>Shinyu Murakami</b></sub></a><br /><a href="https://github.com/uetchy/create-create-app/commits?author=MurakamiShinyu" title="Code">💻</a></td>
    <td align="center"><a href="http://twitter.com/takahashim"><img src="https://avatars2.githubusercontent.com/u/10401?v=4" width="100px;" alt=""/><br /><sub><b>Masayoshi Takahashi</b></sub></a><br /><a href="https://github.com/uetchy/create-create-app/commits?author=takahashim" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
