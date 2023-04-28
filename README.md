# 自动生成 CHANGELOG.md & release

```javascript
// 项目中安装
npm install release-base-cli
// package.json
"scripts": {
    "release": "release-cli",
    // help & example
    "release:help": "release-cli -h"
},
// -c, --config 配置说明
{
    // 输出文件路径: 默认当前目录下的CAHNGELOG.md, 可通过改配置更改输出路径或更改名称
    outfile: string;
    // standard-changelog 执行函数接收的原始参数
    params: [
        options?: Options<TCommit, TContext>,
        context?: Partial<TContext>,
        gitRawCommitsOpts?: GitRawCommitsOptions,
        parserOpts?: ParserOptions,
        writerOpts?: WriterOptions<TCommit, TContext>,
        execOpts?: GitRawExecOptions
    ]
}
```
