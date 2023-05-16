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
-V, --version output the version number
-p, --preId <preId> example: release-cli -p (alpha | beta | rc | ...)
-t, --test example: release-cli -t
-h, --help display help for command
```

## License

[MIT](./LICENSE)
