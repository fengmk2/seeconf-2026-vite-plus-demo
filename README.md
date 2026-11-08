# SEE Conf 2026 · Vite+ 命令演示

《从 cnpm 到 Vite+：AI 时代的开发者体验演进》的视频示例代码：用一个议程收藏页介绍 Web 项目的环境、依赖、开发、检查、测试和构建，再把收藏逻辑打包成库。

[逐步演示脚本](docs/demo-script.md)

## 项目

| 目录 | 内容 |
| --- | --- |
| `agenda-web/` | 议程收藏页，包含 14 个业务逻辑测试 |
| `favorites-lib/` | 独立的收藏逻辑库，演示 `vp pack` 与类型声明生成 |

两个示例各自管理依赖和锁文件。议程中的时间、嘉宾和分享均为演示数据，不代表大会正式议程。

## 快速开始

先按 [Vite+ 官方文档](https://viteplus.dev/guide/)安装全局 `vp`，然后运行：

```sh
git clone https://github.com/fengmk2/seeconf-2026-vite-plus-demo.git
cd seeconf-2026-vite-plus-demo/agenda-web
vp env current
vp install --frozen-lockfile
vp dev
```

打开 <http://127.0.0.1:6517>，点击收藏，再点击“只看收藏”。收藏会保存在当前浏览器，最多可收藏 3 场分享。开发服务使用固定端口；如端口已被占用，请先停止占用该端口的服务。

按 `Ctrl+C` 停止开发服务，再验证项目：

```sh
vp check
vp test
vp build
```

预期 14 个测试通过，应用构建产物生成到 `agenda-web/dist/`。

## 构建库

从 `agenda-web/` 切换到独立库项目：

```sh
cd ../favorites-lib
vp install --frozen-lockfile
vp pack src/index.ts --dts
vp exec node --input-type=module --eval 'import { toggleFavorite } from "./dist/index.mjs"; console.log(toggleFavorite([], "toolchain", ["toolchain"]));'
```

构建生成 `dist/index.mjs` 和 `dist/index.d.mts`，最后一条命令输出 `{ ids: [ 'toolchain' ], status: 'added' }`。

## 版本与视频说明

两个项目均固定 Node.js `24.22.1`、pnpm `10.33.0`、Vite+ `1.4.0`；锁文件中的 Vitest 为 `5.0.5`。录制时使用的全局 `vp` 为 `1.5.0`，项目内命令使用本地工具链。

视频由实际命令输出和本地浏览器画面剪辑而成，终端采用回放呈现，去掉了个人路径和部分无关输出。命令与阅读停顿按 60 秒节奏编排，画面中的耗时仅属于当次运行，不是性能基准。
