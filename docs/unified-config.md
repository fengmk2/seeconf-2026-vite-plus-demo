# 统一配置：四份文件到一份

Vite+ 将工具链配置集中到 `vite.config.ts`：保留 Vite 的 `server`、`build` 等配置，再加入 `test`、`lint`、`fmt`、`run` 等区块。这样，人和 Agent 可以从同一个入口了解项目怎样开发、检查、测试和构建。[官方配置文档](https://viteplus.dev/config/)

这里演示的是**工具配置的集中管理**。`package.json`、`tsconfig.json`、`.node-version`、`pnpm-lock.yaml` 和 `pnpm-workspace.yaml` 各自承担包信息、类型系统、运行时和依赖管理职责，仍然保留。

## 主 monorepo 怎样组织配置

本仓库的主 workspace 包含 `apps/agenda-web` 和 `packages/favorites-lib`，应用通过 `workspace:*` 使用共享库。根目录统一声明运行时、包管理器、依赖 catalog 与锁文件；根 `vite.config.ts` 管理共享的格式、lint、测试和任务，并为开发、构建、打包选择默认目标。应用配置保留服务器设置，库配置保留打包设置。日常的 `vp dev`、`vp check`、`vp test`、`vp build`、`vp pack` 全部从根目录运行。

下面“四份到一份”的迁移过程使用一个**单项目参考案例**，便于逐项展示配置合并。`config-consolidation/before` 与 `after` 不属于主 workspace，也不进入根目录的 lint、格式和测试范围。迁移脚本在仓库外创建独立副本，保留该案例原有依赖与锁文件，主 workspace 不参与迁移。

## 先看文件怎样变化

| 配置职责   | 迁移前                             | 完整整理后                            |
| ---------- | ---------------------------------- | ------------------------------------- |
| 开发与构建 | `vite.config.ts`                   | `vite.config.ts` 的 `server`、`build` |
| 测试       | `vitest.config.ts`                 | 同一文件的 `test`                     |
| lint       | `.oxlintrc.json`                   | 同一文件的 `lint`                     |
| 格式化     | `.oxfmtrc.json`                    | 同一文件的 `fmt`                      |
| 验证流程   | `package.json` 的 `scripts.verify` | 同一文件的 `run.tasks.verify`         |

按三个状态对照阅读：

1. [迁移前项目](../config-consolidation/before/)：四份工具配置分别管理，使用独立安装的 Vite、Vitest、Oxlint、Oxfmt。
2. `vp migrate` 执行后的演示副本：自动合并两份 JSON 配置，剩下 `vite.config.ts` 和 `vitest.config.ts`。
3. [完整整理后的项目](../config-consolidation/after/)：通过人工审阅的补丁完成测试配置与任务的合并，只保留一份工具配置。

**四份 → 两份，是本例中真实迁移命令的自动结果；两份 → 一份，是随后明确展示的人工整理。**

## 自动迁移做了什么

本例固定使用 Vite+ `1.4.0` 的迁移器。它会将 `.oxlintrc.json` 的规则和 `.oxfmtrc.json` 的格式选项合并进 `vite.config.ts`，删除迁移成功的两份 JSON 配置。原有 `eqeqeq` 规则，以及 `semi`、`singleQuote`、`printWidth` 选项都应保留。

迁移器还会调整工具依赖、导入与包管理器配置，改写 `package.json` 中的工具命令，并添加 lint 的 `typeAware`、`typeCheck` 选项及 Vite+ 插件规则。执行后检查真实 diff，不把迁移器输出直接视为可提交结果。[官方迁移指南](https://viteplus.dev/guide/migrate)、[迁移规则](https://viteplus.dev/guide/migrate-rules)

在这个固定版本和项目中，`vitest.config.ts` 仍然存在，`verify` 仍然是 `package.json` 中的脚本。它们不会因为上述自动迁移而自行进入 `vite.config.ts`。

## 人工整理做了什么

`finish.patch` 是预先审阅的示例专用补丁，`finish` 命令只负责应用它，不调用 AI，也不属于 `vp migrate`。

补丁把已有的 `test.include` 与 `test.environment` 移入 `vite.config.ts`，删除独立的 `vitest.config.ts` 并清理 `tsconfig.json` 对它的引用；同时删除仅转发内置命令的脚本，将验证流程放到 `run.tasks.verify`：

```ts
run: {
  tasks: {
    verify: {
      command: "vp check && vp test && vp build",
    },
  },
},
```

之后用 `vp run verify` 运行该任务。放到 `run.tasks` 的任务默认启用缓存；`package.json` 脚本默认不启用缓存，需要显式选择。这也为下一段“`vp run` 让快更快”做好铺垫。[任务运行文档](https://viteplus.dev/guide/run)

原有业务逻辑和 14 个测试断言保持一致，检查、测试和构建继续运行；集中配置可以减少查找和重复维护的工作。

## 完整复现步骤

先按[仓库首页](../README.md)安装全局 `vp`。以下命令均在仓库根目录运行，脚本会在外部副本中执行实际工具命令：

```sh
node scripts/config-demo.mjs prepare
node scripts/config-demo.mjs path
node scripts/config-demo.mjs before
node scripts/config-demo.mjs show
node scripts/config-demo.mjs migrate
node scripts/config-demo.mjs show
node scripts/config-demo.mjs diff
node scripts/config-demo.mjs finish
node scripts/config-demo.mjs show
node scripts/config-demo.mjs verify
node scripts/config-demo.mjs diff
```

| 命令      | 执行内容与观察点                                                                                          |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `prepare` | 将 `before` 复制到仓库外的用户缓存目录；若已有副本，先归档。仅在副本里建立 Git 索引用于对比，不创建提交。 |
| `path`    | 打印当前演示副本的实际路径，便于在编辑器中打开。                                                          |
| `before`  | 按原锁文件安装依赖并运行原有 `verify` 脚本，确认迁移前就能检查、通过 14 个测试并构建。                    |
| `migrate` | 运行固定版本的真实迁移器，再格式化生成的配置。安装依赖需要网络，首次运行耗时因环境而异。                  |
| `show`    | 查看当前配置文件，分别观察四份、两份、一份三个状态。                                                      |
| `finish`  | 应用已审阅的人工整理补丁，完成测试与任务配置的合并。                                                      |
| `verify`  | 运行 `vp check`、`vp test`、`vp build`，验证完成后的项目。                                                |
| `diff`    | 对照最初索引查看全部变更的统计，以及工具配置、`package.json`、`tsconfig.json` 的详细 diff。               |

演示副本位于 `~/.cache/seeconf-vite-plus-demo/<path-hash>/config-consolidation`；使用 `path` 命令获取本次路径。外部目录使参考案例能够使用自己的依赖和配置，而不被主 workspace 接管。

脚本会读取演示副本中的 `.node-version` 和 `package.json.packageManager`，通过 `vp env exec` 显式指定所有工具链子进程使用的版本。即使在仓库根目录启动脚本的 Node.js 版本不同，安装、迁移和验证仍使用案例声明的 Node.js `24.22.1` 与 pnpm `10.33.0`。

迁移步骤在演示副本中实际执行以下命令，固定运行环境与迁移器版本，并跳过 Agent、编辑器与 Git hooks 设置：

```sh
vp env exec --node 24.22.1 --package-manager pnpm@10.33.0 \
  vp exec pnpm dlx --package=vite-plus@1.4.0 \
  vp migrate --no-interactive --no-agent --no-editor --no-hooks
```

`before` 和 `after` 是可对照阅读的参考项目。彩排使用外部副本，不要在这两个目录或主 workspace 中直接运行迁移。若要重新演示，重新执行 `prepare`。

## 80 秒现场讲解

安排在 **05:05–06:25**，位于工具链介绍中、现有常用命令短片之前。完整安装和验证提前跑完，现场展示真实结果、配置和 diff；不把安装等待压进 80 秒。

| 分享时间    | 展示内容                          | 讲稿提示                                                                                          |
| ----------- | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| 05:05–05:20 | `before` 的四份配置及验证脚本     | “命令选好了，配置还散落在几个文件里。人要找，Agent 也要找。”                                      |
| 05:20–05:45 | 真实迁移后的文件与 diff           | “`vp migrate` 把 lint 和格式配置收进来，原来的规则保留。现在还有单独的测试配置。”                 |
| 05:45–06:10 | 人工补丁及最终 `vite.config.ts`   | “这一步是审阅后的人工整理：合并测试，把验证流程定义成任务。并不是迁移器自动做完了一切。”          |
| 06:10–06:25 | 14 个测试通过、构建成功的实际输出 | “配置入口集中起来，原有行为继续验证。接下来用一分钟看看这些命令怎样跑完一个 Web 项目的日常流程。” |

**06:25–07:25** 播放现有 60 秒常用命令短片，随后讲依赖升级，到 **08:00** 进入 `vp run`。这段替换原工具链介绍中的部分讲述，总分享仍为 25 分钟。
