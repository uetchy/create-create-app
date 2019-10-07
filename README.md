# create-whatever

![screencast](https://raw.githubusercontent.com/uetchy/create-whatever/master/.github/assets/screencast.gif)

The universal template for creating `create-` package.

## Usage

1. `npx create-whatever create-greet`
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
- `{{license}}` package license

## Config

You can find the app config in `src/cli.ts`.

```
import {create} from 'create-whatever';

create('create-greet', templateRoot, {
  caveat: `You app has been created successfuly!`
});
```

### `caveat`

`string`

This message will be shown after the generation process.

## Contribution

PRs are always welcome!
