# SEE Conf 2026 · Vite+ 命令演示

《从 cnpm 到 Vite+：AI 时代的开发者体验演进》的示例代码。一个 monorepo 同时包含议程收藏应用与共享收藏逻辑库，用统一的环境、依赖和验证入口演示 Web 开发流程。

[常用命令演示](docs/demo-script.md) · [统一配置演示](docs/unified-config.md)

## 仓库结构

| 目录                           | 内容                                                       |
| ------------------------------ | ---------------------------------------------------------- |
| `apps/agenda-web/`             | 议程收藏应用 `@seeconf/agenda-web`                         |
| `packages/favorites-lib/`      | 共享库 `@seeconf/favorites`，包含 14 个业务逻辑测试        |
| `config-consolidation/before/` | 迁移参考项目：Vite、Vitest、Oxlint、Oxfmt 使用四份工具配置 |
| `config-consolidation/after/`  | 迁移参考项目：统一到一份 `vite.config.ts`                  |

主 workspace 共用根目录的运行时声明、包管理器、catalog 和锁文件。应用通过 `workspace:*` 依赖共享库，直接使用库的 TypeScript 源码，开发前无需先打包库。议程中的时间、嘉宾和分享均为演示数据，不代表大会正式议程。

两个迁移参考项目不属于主 workspace。迁移演示在仓库外的副本执行，保留前后两套工具链供对照。

## 快速开始

先按 [Vite+ 官方文档](https://viteplus.dev/guide/)安装全局 `vp`。之后所有日常命令都在**仓库根目录**执行：

```sh
git clone https://github.com/fengmk2/seeconf-2026-vite-plus-demo.git
cd seeconf-2026-vite-plus-demo
vp env current
vp install --frozen-lockfile
vp dev
```

打开 <http://127.0.0.1:6517>，点击收藏，再点击“只看收藏”。收藏会保存在当前浏览器，最多可收藏 3 场分享。开发服务使用固定端口；如端口已被占用，请先停止占用该端口的服务。

按 `Ctrl+C` 停止开发服务，再验证和构建：

```sh
vp check
vp test
vp build
vp pack
```

预期 14 个测试通过，应用产物位于 `apps/agenda-web/dist/`，库产物为 `packages/favorites-lib/dist/index.mjs` 与 `index.d.mts`。

## 一份共享配置，一个验证入口

根目录 `vite.config.ts` 集中管理格式、lint、测试与任务；应用配置保留开发服务器设置，库配置保留打包入口和类型声明设置。根配置还为 `vp dev`、`vp build`、`vp pack` 选择对应的默认目标，日常操作无需切换目录。[Vite+ 配置文档](https://viteplus.dev/config/)

```sh
vp run verify
vp run verify
vp run --last-details
```

`verify` 通过 `dependsOn: ["packLib"]` 声明前置任务。运行 `vp run verify` 时，Vite+ 先打包共享库，再依次构建应用、检查代码、运行测试。Vite+ 自动追踪每一步读取的输入和写出的产物。输入和执行条件相同时，缓存可以回放日志、还原缺失的产物。本例无需配置 `cache.input` 或 `cache.output`。

## 配置迁移：四份文件到一份

单项目示例从四份工具配置开始。`vp migrate` 先合并 Oxlint、Oxfmt 配置，再由你的 AI Agent 把 Vitest 的 `test` 区块并入 `vite.config.ts`。Agent 跑检查、测试和构建，维护者审查配置与结果。[Agent 操作步骤与提示词](docs/unified-config.md#让-agent-合并测试配置)

要回放已审阅的示例补丁，在仓库根目录运行：

```sh
node scripts/config-demo.mjs prepare
node scripts/config-demo.mjs before
node scripts/config-demo.mjs migrate
node scripts/config-demo.mjs show
node scripts/config-demo.mjs finish
node scripts/config-demo.mjs verify
node scripts/config-demo.mjs diff
```

副本位于仓库外的用户缓存目录，运行 `node scripts/config-demo.mjs path` 查看具体位置。`prepare` 先归档上次副本，`finish` 应用已审阅的示例补丁；主 workspace 不参与迁移。操作细节见[统一配置演示](docs/unified-config.md)。

## 版本与原视频

主 workspace 固定 Node.js `24.22.1`、pnpm `12.21.0`、Vite+ `1.7.0`，锁文件中的 Vitest 为 `5.1.0`。迁移前参考项目使用独立的 Vite `8.3.5`、Vitest `5.0.5`、Oxlint `1.89.0`、Oxfmt `0.74.0`。

原 60 秒视频录制时使用两个独立项目和全局 `vp` `1.5.0`；本仓库现已整理为 monorepo，相同流程均从根目录执行，视频尚未重录。视频使用真实命令输出和页面画面剪辑，显示耗时仅属于当次运行。
