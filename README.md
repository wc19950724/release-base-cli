# 自动生成 CHANGELOG.md & release

## Getting Started

To begin, you'll need to install `release-base-cli`:

```js
npm install release-base-cli --save-dev
```

or

```js
yarn add -D release-base-cli
```

or

```js
pnpm add -D release-base-cli
```

**package.json**

```json
"scripts": {
    "release": "release-cli"
},
"devDependencies": {
  "release-base-cli": "latest"
}
```

**release Description**

```markdown
    -h, --help   : cli help
    -v, --version: package version
    -p, --preid  : version prefix  default 'beta'
    -c, --commit : commit message  default 'release: v'
    -q, --quiet  : quiet release   default false
    -t, --test   : test release    default false
```

## License

[MIT](./LICENSE)
