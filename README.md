# create-whatever

> The smartest `create-` app template generator.

![screencast](https://raw.githubusercontent.com/uetchy/create-whatever/master/.github/assets/screencast.gif)

## Why?

- **Built-in License chooser** No need to care about license things.
- **Template engine** Just put files with template strings and we will do the rest.
- **Highly customizable** Can change caveat text, and add extra cli options.

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

Edit files inside `templates/default`. Text files will be passed through Mustache template engine that all template strings is replaced with respective value.

- `{{name}}` package name
- `{{description}}` package description
- `{{author}}` author name
- `{{email}}` author email
- `{{author_full}}` author name formatted with `{{name}} <{{email}}>` if email given, otherwise `{{name}}`
- `{{license}}` package license (e.g. `MIT`)
- `{{year}}` current year (e.g. `2020`)

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

An extra options passed to the app. These options will be accessible as template string. In this case, `--language` cli option and `{{language}}` template string will be available.

## Contribution

PRs are always welcome!
