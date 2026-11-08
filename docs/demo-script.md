# vp 常用命令：逐步演示脚本

先按[仓库首页](../README.md)安装 `vp`、克隆仓库。以下命令全部在 **monorepo 根目录**执行，应用与共享库使用同一份锁文件和工具链。

## 分享中的切入位置

在常用命令短片之前，用 **05:05–06:25 的 80 秒**展示[统一配置演示](unified-config.md)：单项目参考案例的四份配置先经 `vp migrate` 自动合并为两份，再经人工整理合并为一份。随后播放现有 60 秒常用命令短片，约 **07:25** 结束；依赖升级内容讲到 **08:00**，继续进入 `vp run`。总分享仍为 25 分钟。

迁移演示的完整安装与验证在彩排时跑完，现场展示真实结果和 diff。人工整理补丁须明确说明。

## 原视频与当前仓库

原视频录制时，应用和库分别运行；当前仓库已改为 monorepo，同样流程均从根目录执行，最后一步简化为 `vp pack`。视频尚未重录，以下时间表保留原片段对应关系。

| 视频时间    | 内容与当前复现命令                                        |
| ----------- | --------------------------------------------------------- |
| 00:00–00:03 | 议程收藏页与片头                                          |
| 00:03–00:10 | `vp env current`：项目声明的 Node.js 与包管理器           |
| 00:10–00:16 | `vp install --frozen-lockfile`：安装整个 workspace 的依赖 |
| 00:16–00:25 | `vp dev`：启动应用、收藏一场分享、筛选收藏                |
| 00:25–00:33 | `vp check`：共享的格式、lint 与类型检查                   |
| 00:33–00:41 | `vp test`：共享库的 14 个业务逻辑测试                     |
| 00:41–00:50 | `vp build`：生成 Web 应用产物                             |
| 00:50–01:00 | `vp pack`：生成库与类型声明，导入产物并调用               |

## 1. 从根目录了解整个项目

```sh
vp env current
```

打开根目录 `.node-version`、`package.json` 和 `pnpm-workspace.yaml`，指出 Node.js `24.22.1`、pnpm `10.33.0` 和 catalog 中的 Vite+ `1.4.0`。

应用 `@seeconf/agenda-web` 通过 `workspace:*` 引用 `@seeconf/favorites`。收藏逻辑只有一份，位于 `packages/favorites-lib/src/index.ts`；应用开发时直接使用源码，无需先运行 `vp pack`。

## 2. 一次安装，启动应用

```sh
vp install --frozen-lockfile
vp dev
```

打开 <http://127.0.0.1:6517>。需要从空收藏状态演示时，可先清除该站点的浏览器存储。

1. 点击第一场分享的“收藏”。
2. 确认页面显示“已收藏 1 / 3”。
3. 点击“只看收藏”，列表只保留已收藏的分享。
4. 按 `Ctrl+C` 停止开发服务。

页面中的分享和时间均为演示数据。

## 3. 检查、测试、构建应用

```sh
vp check
vp test
vp build
```

- 根目录 `vite.config.ts` 集中管理格式、lint、测试与任务配置。
- `vp test` 运行 `packages/favorites-lib/src/index.test.ts`，预期 14 个测试通过，覆盖收藏上限、取消收藏和存储数据恢复等行为。
- `vp build` 根据根配置选择应用，将 HTML、CSS 和 JavaScript 输出到 `apps/agenda-web/dist/`。

应用配置保留本地服务器设置，库配置保留打包设置；各包共享的规则由根配置管理。

## 4. 打包共享库并验证产物

仍在根目录运行：

```sh
vp pack
vp exec node --input-type=module --eval 'import { toggleFavorite } from "./packages/favorites-lib/dist/index.mjs"; console.log(toggleFavorite([], "toolchain", ["toolchain"]));'
```

根配置为 `vp pack` 选择共享库，库配置声明入口 `src/index.ts` 并启用类型声明。生成：

- `packages/favorites-lib/dist/index.mjs`：可导入的 ESM 模块。
- `packages/favorites-lib/dist/index.d.mts`：对应的 TypeScript 类型声明。

最后一条命令直接使用构建产物，预期输出：

```text
{ ids: [ 'toolchain' ], status: 'added' }
```

## 可选延伸：缓存重复验证

```sh
vp run verify
vp run verify
vp run --last-details
```

根配置中的 `verify` 串联 `vp check`、`vp test`、`vp build` 与 `vp pack`。在输入和相关执行条件没有变化时，再次运行可以复用任务缓存；查看执行详情确认是否命中及原因。修改共享库后重新验证，观察输入变化如何影响执行。实际耗时取决于机器、项目与缓存状态。

任务保留自动输入追踪，并从缓存输入中排除生成的 `dist/`，避免打包时读取旧产物导致缓存失效；`dist/` 仍作为输出被追踪，源文件变化仍参与缓存判断。

## 录制说明

原 60 秒演示使用实际执行的命令输出与本地页面截图制作，终端画面为剪辑后的回放。个人路径及部分无关输出已移除，画面中的耗时仅为当次采样。以上步骤可直接在当前仓库复现，无需视频文件。
