# create-whatever

> The smartest `create-` app template generator.

![screencast](https://raw.githubusercontent.com/uetchy/create-whatever/master/.github/assets/screencast.gif)

## Why?

- **Built-in License chooser** No need to care about license things.
- **Template engine** Just put files with template strings and we will do the rest.
- **Highly customizable** Can change caveat text, and add extra cli options.

## Usage

1. `npx create-whatever create-greet --template typescript`
2. `cd create-greet`
3. edit files inside `templates/default`
4. `yarn build` or `npm run build`
5. `yarn publish` or `npm publish`
6. profit!

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
});
```

`templateRoot` set to `path.resolve(__dirname, '../templates')`. You can change it to whereever you want.

### `caveat`

`string | undefined`

This message will be shown after the generation process.

## Contribution

PRs are always welcome!
