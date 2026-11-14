# 小程序工坊 · dsh-go-miniapp-kit

微信小程序开发助手，dsh-go（DeepSeek Harness 手机版）原生插件。把项目骨架、页面四件套、上线自查和常用代码装进 App，按官方当前规范生成，可直接导入微信开发者工具。

A WeChat Mini Program development kit for dsh-go (DeepSeek Harness mobile): project scaffolds, page templates, launch checklist and snippets, rendered with native dsh-go views.

## 功能

- **新建项目**：生成 `project.config.json`、`app.json`、`app.js`、`app.wxss`、`sitemap.json`；支持云开发（`miniprogram/` + `cloudfunctions/`）和 Skyline（`glass-easel`）。
- **页面四件套**：列表页 / 表单页 / 空白页的 `.wxml`、`.wxss`、`.js`、`.json`，含下拉刷新、触底加载、空态、表单校验和防重复提交。
- **上线自查**：配置、性能、体验、合规四组共 22 项，可一键复制成 Markdown 清单。
- **代码速查**：`wx.request` 封装、`wx.login` 换 session、云开发初始化、云函数模板、路由与缓存、隐私授权。
- **规范注入**：把 9 条小程序开发约定写进输入框，让 AI 按同一套结构、命名和性能要求写代码。

## 界面入口

装好后在 dsh-go 里：

- 输入框上方胶囊「小程序」→ 工坊首页；「需求改写」→ 把一句话需求扩成开发任务书。
- 输入框加号面板「页面模板」「上线自查」。
- 对话详情页「插件」页签 / 「全部功能」：小程序工坊、新建项目、页面四件套、上线自查。

插件只在你点按时读取输入框文字（用于「需求改写」），不联网、不写文件、不保存输入内容。

## 安装

从 npm（包发布后）：

```sh
dsh plugin --profile web add dsh-go-miniapp-kit
```

直接从 GitHub 安装：

```sh
dsh plugin --profile web add github:ImSusua/dsh-go-miniapp-kit
```

本地开发时用目录路径：

```sh
dsh plugin --profile web add /path/to/dsh-go-miniapp-kit
```

卸载：

```sh
dsh plugin --profile web remove dsh-go-miniapp-kit
```

## 开发

```sh
node --version   # >= 22.19
node ~/.dsh/skills/dsh-go-plugin/kit/bin/check.mjs . --load
npm pack --dry-run
```

模板和文案都在 `lib/index.js` 顶部：`SPEC_PROMPT`、`SNIPPETS`、`CHECK`、`projectFiles()`、`pageFiles()`。改 `lib/` 后需要在 App 的「引擎」页重启引擎；只改 `package.json` 会自动重读。

## 兼容

- DSH `>=0.2.1-rc.2 <0.3.0-0`，Node `>=22.19`。
- 原生面板使用视图 v2（`codeBlock`、`tabs`、`accordion`、表单控件），需要较新的 dsh-go App。
- 旧版 App 上胶囊和面板可能不显示，但不影响安装。

## 许可

MIT
