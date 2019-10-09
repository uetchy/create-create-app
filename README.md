# ✨ Create Whatever

[![npm-badge]][npm-url] [![workflow-badge]][workflow-url]

[npm-badge]: https://img.shields.io/npm/v/create-whatever.svg
[npm-url]: https://npmjs.org/package/create-whatever
[workflow-badge]: https://github.com/uetchy/create-whatever/workflows/create-whatever/badge.svg
[workflow-url]: https://github.com/uetchy/create-whatever/actions?workflow=create-whatever

> The smartest `create-` app template generator.

![screencast](https://raw.githubusercontent.com/uetchy/create-whatever/master/.github/assets/screencast.gif)

## Why?

- ⚖️ **Built-in License chooser** No need to care about license things.
- 🎩 **Template engine** Just put files with template strings and we will do the rest.
- 💄 **Highly customizable** Can change caveat text, and add extra cli options.

## How

Create `create-greet` package in four steps.

### 1. Generate template

```shell
yarn create whatever create-greet --template typescript
```

or if you use `npm`, then run `npx create-whatever create-greet`

### 2. Edit templates

`cd create-greet` and edit files inside `templates/default`.

#### TypeScript

Run `yarn build` or `npm run build` to transpile TypeScript into JavaScript.

### 3. Publish package to npm

Run `yarn publish` or `npm publish` to publish your `create-` app to npm.

### 4. PROFIT!!!

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

In the case of `name` is `create-react-app`, `{{upper name}}` becomes `CREATE-REACT-APP`.

#### `lower`

Output text in lowercase.

In the case of `name` is `CREATE-REACT-APP`, `{{lower name}}` becomes `create-react-app`.

#### `camel`

Output text in camelCase.

In the case of `name` is `create-react-app`, `{{camel name}}` becomes `createReactApp`.

#### `capital`

Output text in CapitalCase.

In the case of `name` is `create-react-app`, `{{capital name}}` becomes `CreateReactApp`, and `{{capital name space=true}}` becomes `Create React App`.

#### `snake`

Output text in snake_case.

In the case of `name` is `CreateReactApp`, `{{snake name}}` becomes `create_react_app`.

#### `kebab`

Output text in kebab-case.

In the case of `name` is `CreateReactApp`, `{{kebab name}}` becomes `create-react-app`.

## Config

You can find the app config in `src/cli.ts`.

```ts
import {create} from 'create-whatever';

create('create-greet', templateRoot, {
  caveat: `Your app has been created successfuly!`,
  extra: {
    language: {
      type: 'input',
      describe: 'greeting language',
      default: 'en',
      prompt: 'if-no-arg',
    },
  },
});
```

`templateRoot` set to `path.resolve(__dirname, '../templates')`. You can change it to whereever you want.

### `caveat`

`string | undefined`

This message will be shown after the generation process.

### `extra`

`object | undefined`

Extra options passed to the app. These options will be accessible as a cli option, interactive question, and template string. In this case, `--language` cli option and `{{language}}` template string will be available.

You can find all possible options in [yargs-interactive documentation](https://github.com/nanovazquez/yargs-interactive#options).

## Contribution

PRs are always welcome!
