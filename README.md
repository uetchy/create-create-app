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

- ⚖️ **Built-in License chooser** No need to care about license things.
- 🎩 **Template engine** Just put files with template strings and we will do the rest.
- 💄 **Highly customizable** Can change caveat text, and add extra cli options.

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Quick Start](#quick-start)
  - [1. `npm create create-app`](#1-npm-create-create-app)
  - [2. Edit templates](#2-edit-templates)
    - [TypeScript](#typescript)
  - [3. Publish package to npm](#3-publish-package-to-npm)
  - [4. PROFIT!](#4-profit)
- [Template](#template)
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
- [Contribution](#contribution)
  - [Contributors ✨](#contributors-)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Quick Start

Let's create `create-greet` package in four steps.

### 1. `npm create create-app`

```shell
npm create create-app greet
```

or if you use `yarn`, then run `yarn create create-app greet`

![screenshot](https://raw.githubusercontent.com/uetchy/create-create-app/master/.github/assets/ss1.png)

### 2. Edit templates

`cd create-greet` and edit files inside `templates/default`.

#### TypeScript

Run `yarn build` or `npm run build` to transpile TypeScript into JavaScript.

### 3. Publish package to npm

Run `yarn publish` or `npm publish` to publish your `create-` app to npm.

### 4. PROFIT!

```bash
yarn create greet ohayo
```

![screenshot](https://raw.githubusercontent.com/uetchy/create-create-app/master/.github/assets/ss2.png)

## Template

Edit files inside `templates/default`. File names, directory names, and text files will be processed through Handlebars template engine to replace all template strings with respective value.

- `{{name}}` package name
- `{{description}}` package description
- `{{author}}` author name
- `{{email}}` author email
- `{{contact}}` author name formatted with `{{name}} <{{email}}>` if email given, otherwise `{{name}}`
- `{{license}}` package license (e.g. `MIT`)
- `{{year}}` current year (e.g. `2020`)

### Helper functions

In the following example, we assume that variable `name` is `create-react-app`.

#### `upper`

Output text in UPPERCASE.

`{{upper name}}` becomes `CREATE-REACT-APP`.

#### `lower`

Output text in lowercase.

`{{lower name}}` becomes `create-react-app`.

#### `capital`

Output text in CapitalCase.

- `{{capital name}}` becomes `CreateReactApp`
- `{{capital name space=true}}` becomes `Create React App`.

#### `camel`

Output text in camelCase.

`{{camel name}}` becomes `createReactApp`.

#### `snake`

Output text in snake_case.

`{{snake name}}` becomes `create_react_app`.

#### `kebab`

Output text in kebab-case.

`{{kebab name}}` becomes `create-react-app`.

#### `space`

Replace all word separators with single space.

`{{space name}}` becomes `create react app`

#### `uuid`

Generates unique UUID string.

```
{{uuid}}
{{upper (uuid)}}
```

## Config

You can find the app config in `src/cli.js` (or `src/cli.ts` if you chose `typescript` template).

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

`templateRoot` set to `path.resolve(__dirname, '../templates')`. You can change it to whereever you want.

### promptForTemplate (default: `false`)

Ask users to choose a template to be used for initialization only if `promptForTemplate` is set `true` AND there's multiple templates found in `templates/`.

With `promptForTemplate` set `false`, users still can specify template via command-line flag `--template`:

```
create-something <name> --template <template>
```

### extra (default: `undefined`)

`object | undefined`

Extra options passed to the app. These options will be accessible as a cli option, interactive question, and template string. In this case, `--language` cli option and `{{language}}` template string will be available.

You can find all possible options in [yargs-interactive documentation](https://github.com/nanovazquez/yargs-interactive#options).

### modifyName (default: `undefined`)

`(name: string) => string | Promise<string>`

Modify `name` property.

### after (default: `undefined`)

`(options: AfterHookOptions) => void`

After hook script that runs after the initialization.

### caveat (default: `undefined`)

`string | ((options: AfterHookOptions) => string | void) | undefined`

The caveat message will be shown after the entire process completed.

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
  caveat: async ({ answers }) => {
    const pkg = answers.plugin;
    await execa('yarn', ['add', plugin]);
    console.log(`${plugin} has been added`);
  },
});
```

### AfterHookOptions

```typescript
{
  // variables
  packageDir: string;
  templateDir: string;
  year: number; // 2020
  answers: {
    name: string; // package name
    description: string; // description
    author: string; // John Doe
    email: string; // john@example.com
    contact: string; // John Doe <john@example.com>
    license: string; // MIT
    [key: string]: string | number | boolean | any[]; // any values defined in the `extra` field.
  };
  // functions
  run: (command: string, options?: CommonOptions<string>) => ExecaChildProcess<string>; // run shell command in the package dir
  installNpmPackage: (packageName: string) => Promise<void>; // use yarn if available
}
```

## Contribution

PRs are always welcome!

### Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://uechi.io/"><img src="https://avatars0.githubusercontent.com/u/431808?v=4?s=100" width="100px;" alt=""/><br /><sub><b>uetchy</b></sub></a><br /><a href="https://github.com/uetchy/create-create-app/commits?author=uetchy" title="Code">💻</a> <a href="https://github.com/uetchy/create-create-app/commits?author=uetchy" title="Documentation">📖</a></td>
    <td align="center"><a href="https://vivliostyle.org/"><img src="https://avatars1.githubusercontent.com/u/3324737?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Shinyu Murakami</b></sub></a><br /><a href="https://github.com/uetchy/create-create-app/commits?author=MurakamiShinyu" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
