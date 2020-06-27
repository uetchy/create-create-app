# ✨ Create Create App

[![npm-badge]][npm-url]
[![workflow-badge]][workflow-url]

[npm-badge]: https://img.shields.io/npm/v/create-create-app.svg
[npm-url]: https://npmjs.org/package/create-create-app
[workflow-badge]: https://github.com/uetchy/create-create-app/workflows/create-create-app/badge.svg
[workflow-url]: https://github.com/uetchy/create-create-app/actions?workflow=create-create-app

Create your own `create-something` app.

![screencast](https://raw.githubusercontent.com/uetchy/create-create-app/master/.github/assets/screencast.gif)

## Why?

- ⚖️ **Built-in License chooser** No need to care about license things.
- 🎩 **Template engine** Just put files with template strings and we will do the rest.
- 💄 **Highly customizable** Can change caveat text, and add extra cli options.

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Quick Start](#quick-start)
  - [1. `yarn create create-app`](#1-yarn-create-create-app)
  - [2. Edit templates](#2-edit-templates)
    - [TypeScript](#typescript)
  - [3. Publish package to npm](#3-publish-package-to-npm)
  - [4. PROFIT!](#4-profit)
- [Template](#template)
  - [Helper functions](#helper-functions)
    - [`upper`](#upper)
    - [`lower`](#lower)
    - [`camel`](#camel)
    - [`capital`](#capital)
    - [`snake`](#snake)
    - [`kebab`](#kebab)
    - [`uuid`](#uuid)
- [Config](#config)
  - [`extra`](#extra)
  - [`caveat`](#caveat)
    - [AfterHookOptions](#afterhookoptions)
  - [`after`](#after)
  - [`handleName`](#handlename)
- [Contribution](#contribution)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Quick Start

Let's create `create-greet` package in four steps.

### 1. `yarn create create-app`

```shell
yarn create create-app greet
```

or if you use `npm`, then run `npm create create-app greet`

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

#### `upper`

Output text in UPPERCASE.

`{{upper name}}` becomes `CREATE-REACT-APP`.

#### `lower`

Output text in lowercase.

`{{lower name}}` becomes `create-react-app`.

#### `camel`

Output text in camelCase.

`{{camel name}}` becomes `createReactApp`.

#### `capital`

Output text in CapitalCase.

`{{capital name}}` becomes `CreateReactApp`, and `{{capital name space=true}}` becomes `Create React App`.

#### `snake`

Output text in snake_case.

`{{snake name}}` becomes `create_react_app`.

#### `kebab`

Output text in kebab-case.

`{{kebab name}}` becomes `create-react-app`.

#### `uuid`

Generates unique UUID string.

```
{{uuid}}
{{upper (uuid)}}
```

## Config

You can find the app config in `src/cli.ts`.

```ts
import {resolve} from 'path';
import {create} from 'create-create-app';

create('create-greet', {
  templateRoot: resolve(__dirname, '../templates'),
  extra: {
    language: {
      type: 'input',
      describe: 'greeting language',
      default: 'en',
      prompt: 'if-no-arg',
    },
  },
  after: ({installNpmPackage}) => installNpmPackage('chalk'),
  caveat: `Your app has been created successfuly!`,
  handleName: (name) => `package-prefix-${name}`
});
```

`templateRoot` set to `path.resolve(__dirname, '../templates')`. You can change it to whereever you want.

### `extra`

`object | undefined`

Extra options passed to the app. These options will be accessible as a cli option, interactive question, and template string. In this case, `--language` cli option and `{{language}}` template string will be available.

You can find all possible options in [yargs-interactive documentation](https://github.com/nanovazquez/yargs-interactive#options).

### `caveat`

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

#### AfterHookOptions

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

### `after`

`(options: AfterHookOptions) => void`

After hook script that runs after the initialization.

### `handleName`

`(name: string) => string | Promise<string>`

Modify `name` property.

## Contribution

PRs are always welcome!
