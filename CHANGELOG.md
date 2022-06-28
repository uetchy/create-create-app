# [7.3.0](https://github.com/uetchy/create-create-app/compare/v7.2.1...v7.3.0) (2022-06-28)

### Bug Fixes

- more slash ([2083a33](https://github.com/uetchy/create-create-app/commit/2083a333612fc54f5e89b0b00bc00186a4fe102b))
- only replace `gitignore` file ([bffca9c](https://github.com/uetchy/create-create-app/commit/bffca9ccd225fafa134b872a5e61d192064efe0b))
- use shell to run npm command ([101e03c](https://github.com/uetchy/create-create-app/commit/101e03c6c0a846d3b07c951d2263c1e4f31292c2))
- **windows:** slash before format ([8575810](https://github.com/uetchy/create-create-app/commit/8575810f2be349bcae08694233a7e36fbf2f49bc))

### Features

- guess pm, skip install/git ([#42](https://github.com/uetchy/create-create-app/issues/42)) by [@lucas-labs](https://github.com/lucas-labs) ([718b190](https://github.com/uetchy/create-create-app/commit/718b1909a2afa5adfbd1a7e1a19b4627e7de1685))
- more options for prompts ([6623b9b](https://github.com/uetchy/create-create-app/commit/6623b9bb3f6b9be2b88d7f2cbe2c438e3b7fefbc)), closes [#36](https://github.com/uetchy/create-create-app/issues/36)

## [7.2.1](https://github.com/uetchy/create-create-app/compare/v7.2.0...v7.2.1) (2022-06-09)

### Bug Fixes

- typescript template is missing type defs for node ([e360b57](https://github.com/uetchy/create-create-app/commit/e360b57502d03057f836cdf93601ed91856da2c7))

# [7.2.0](https://github.com/uetchy/create-create-app/compare/v7.1.0...v7.2.0) (2022-03-26)

### Bug Fixes

- prevent null being appeared on LICENSE ([c8e8ff3](https://github.com/uetchy/create-create-app/commit/c8e8ff3a983c1decafe2662eb9f9988fcc32da31)), closes [#30](https://github.com/uetchy/create-create-app/issues/30)

### Features

- add cli param for node.js package manager ([a1bb7a6](https://github.com/uetchy/create-create-app/commit/a1bb7a6bb4f632054b09aea8cc0be6964f7e06c9)), closes [#29](https://github.com/uetchy/create-create-app/issues/29)## [7.0.2](https://github.com/uetchy/create-create-app/compare/v7.0.1...v7.0.2) (2021-03-10)

### Bug Fixes

- avoid crashes when .gitconfig exists but user is not set ([1428db3](https://github.com/uetchy/create-create-app/commit/1428db30eb1417280b6c245952ed93eae3f79c8c))

## [7.0.1](https://github.com/uetchy/create-create-app/compare/v7.0.0...v7.0.1) (2020-08-27)

# [7.0.0](https://github.com/uetchy/create-create-app/compare/v6.0.1...v7.0.0) (2020-08-27)

### Bug Fixes

- choices only accept string[] ([180d4cd](https://github.com/uetchy/create-create-app/commit/180d4cdc073f6f649faecade8b971478fd3e2666))

### Features

- allow to choose UNLICENSED as license ([#25](https://github.com/uetchy/create-create-app/issues/25)) ([7275769](https://github.com/uetchy/create-create-app/commit/72757693b2a6d5c7da9098bac43b38b4f81c3ce2)), closes [#22](https://github.com/uetchy/create-create-app/issues/22)

### BREAKING CHANGES

- {"name": string, "value": string} style in `choices` has been deprecated.

## [6.0.1](https://github.com/uetchy/create-create-app/compare/v6.0.0...v6.0.1) (2020-08-10)

### Bug Fixes

- Fails on Windows when Yarn is not installed ([adf4f3f](https://github.com/uetchy/create-create-app/commit/adf4f3fffad14dafa92c859da0502acf41d2b370))

# [6.0.0](https://github.com/uetchy/create-create-app/compare/v5.7.0...v6.0.0) (2020-08-04)

### Bug Fixes

- rename to modifyName ([6fba9b9](https://github.com/uetchy/create-create-app/commit/6fba9b97bd4f8cb460ffb515991adcaeac8cc99e))
- update epicfail ([d55fdca](https://github.com/uetchy/create-create-app/commit/d55fdcae92c9068fcbd1c6ad47f552b13e52aa6a))

### Features

- init epicfail inside create function ([b7168ad](https://github.com/uetchy/create-create-app/commit/b7168ade460dbb0931ac0ed71d471f92d4804b6b))
- new helper 'space' ([996861e](https://github.com/uetchy/create-create-app/commit/996861e73e84db6e33f3fda4a95a75ffa240c0c2))

### BREAKING CHANGES

- handleName => modifyName

# [5.7.0](https://github.com/uetchy/create-create-app/compare/v5.6.1...v5.7.0) (2020-07-29)

### Bug Fixes

- avoid crashes when git is unavailable ([2f3e50a](https://github.com/uetchy/create-create-app/commit/2f3e50a033c05b42924b8c356a46c97e4c4d05b8))
- failed to copy template files on Windows ([#17](https://github.com/uetchy/create-create-app/issues/17)) ([1e8d6b7](https://github.com/uetchy/create-create-app/commit/1e8d6b7b36fbd0ed23712751854a126f41b44c6b))

### Features

- add types ([be72e93](https://github.com/uetchy/create-create-app/commit/be72e9331232f00daeafab9907792dcc4d7c9aa8))

## [5.0.1](https://github.com/uetchy/create-create-app/compare/v5.0.0...v5.0.1) (2020-06-24)

# [5.0.0](https://github.com/uetchy/create-create-app/compare/v4.1.0...v5.0.0) (2019-10-09)

### Bug Fixes

- dissolve templateRoot into options ([07296b4](https://github.com/uetchy/create-create-app/commit/07296b4))

### BREAKING CHANGES

- all create() must be fixed

# [4.1.0](https://github.com/uetchy/create-create-app/compare/v4.0.4...v4.1.0) (2019-10-09)

### Features

- add uuid template string ([5795ddb](https://github.com/uetchy/create-create-app/commit/5795ddb))

## [4.0.4](https://github.com/uetchy/create-create-app/compare/v4.0.3...v4.0.4) (2019-10-09)

### Bug Fixes

- no escape template string ([8b3e642](https://github.com/uetchy/create-create-app/commit/8b3e642))

## [4.0.3](https://github.com/uetchy/create-create-app/compare/v4.0.0...v4.0.3) (2019-10-08)

### Bug Fixes

- update lib version ([58f787e](https://github.com/uetchy/create-create-app/commit/58f787e))

# [4.0.0](https://github.com/uetchy/create-create-app/compare/v3.1.0...v4.0.0) (2019-10-08)

### Features

- new template system ([e8e6bd9](https://github.com/uetchy/create-create-app/commit/e8e6bd9))
