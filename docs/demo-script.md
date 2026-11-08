# vp 常用命令：逐步演示脚本

先按[仓库首页](../README.md)安装 `vp`、克隆仓库。以下命令在指定项目目录运行；两份锁文件分别对应两个独立示例。

## 视频对应时间

| 视频时间 | 内容 |
| --- | --- |
| 00:00–00:03 | 议程收藏页与片头 |
| 00:03–00:10 | `vp env current`：项目声明的 Node.js 与包管理器 |
| 00:10–00:16 | `vp install --frozen-lockfile`：按锁文件安装依赖 |
| 00:16–00:25 | `vp dev`：启动页面、收藏一场分享、筛选收藏 |
| 00:25–00:33 | `vp check`：格式、lint 与类型检查 |
| 00:33–00:41 | `vp test`：14 个业务逻辑测试通过 |
| 00:41–00:50 | `vp build`：生成 Web 应用产物 |
| 00:50–01:00 | `vp pack src/index.ts --dts`：生成库与类型声明，导入产物并调用 |

## 1. 让项目声明环境

在仓库根目录进入应用：

```sh
cd agenda-web
vp env current
```

打开 `.node-version` 和 `package.json`，指出 Node.js `24.22.1` 与 `packageManager: "pnpm@10.33.0"`。环境版本保存在项目里，人和 Agent 可以从同一个入口开始工作。

## 2. 安装并启动

```sh
vp install --frozen-lockfile
vp dev
```

打开 <http://127.0.0.1:6517>。为了得到与视频相同的初始画面，可先清除该站点的浏览器存储。

1. 点击第一场分享的“收藏”。
2. 确认页面显示“已收藏 1 / 3”。
3. 点击“只看收藏”，列表只保留已收藏的分享。
4. 按 `Ctrl+C` 停止开发服务，返回终端。

页面中的分享和时间均为演示数据。

## 3. 检查、测试、构建

```sh
vp check
vp test
vp build
```

讲解时依次指出：

- `vp check` 验证格式、lint 和类型，配置见 `vite.config.ts`。
- `vp test` 运行 `src/favorites.test.ts`，预期 14 个测试通过，覆盖收藏上限、取消收藏和存储数据恢复等行为。
- `vp build` 将应用输出到 `dist/`，其中包含 HTML、CSS 和 JavaScript。

## 4. 将同一段逻辑打包成库

```sh
cd ../favorites-lib
vp install --frozen-lockfile
vp pack src/index.ts --dts
vp exec node --input-type=module --eval 'import { toggleFavorite } from "./dist/index.mjs"; console.log(toggleFavorite([], "toolchain", ["toolchain"]));'
```

`src/index.ts` 是应用中收藏逻辑的独立副本。`tsconfig.json` 启用 `declaration` 与 `isolatedDeclarations`，本次打包生成：

- `dist/index.mjs`：可导入的 ESM 模块。
- `dist/index.d.mts`：对应的 TypeScript 类型声明。

最后一条命令直接使用构建产物，预期输出：

```text
{ ids: [ 'toolchain' ], status: 'added' }
```

## 可选延伸：缓存重复验证

这一段不在 60 秒视频内，可用于继续介绍 `vp run`。从独立库目录切回应用：

```sh
cd ../agenda-web
vp run verify
vp run verify
vp run --last-details
```

`verify` 在 `vite.config.ts` 中串联 `vp check`、`vp test` 与 `vp build`。在输入和相关执行条件没有变化时，再次运行可以复用任务缓存；查看最后一次执行详情，说明是否命中以及原因。修改输入后再运行，观察缓存决策如何变化。实际耗时取决于机器、项目与缓存状态，不承诺固定加速倍数。

## 录制说明

分享中的 60 秒演示使用实际执行的命令输出与本地页面截图制作，终端画面为剪辑后的回放。个人路径、颜色控制码、装饰符号和部分无关输出已移除；每段的输入、输出与阅读停顿按成片节奏编排。画面中的耗时仅为当次采样，不是基准测试。复现以上步骤无需视频文件。
