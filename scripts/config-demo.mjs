import { cpSync, existsSync, mkdirSync, readFileSync, realpathSync, renameSync } from "node:fs";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const projectId = createHash("sha256").update(realpathSync(root)).digest("hex").slice(0, 12);
const scratch = join(realpathSync(homedir()), ".cache", "seeconf-vite-plus-demo", projectId);
const work = join(scratch, "config-consolidation");
const fixture = join(root, "config-consolidation", "before");
const patch = join(root, "config-consolidation", "finish.patch");
const configFiles = ["vite.config.ts", "vitest.config.ts", ".oxlintrc.json", ".oxfmtrc.json"];
const command = process.argv[2];
const childEnv = { ...process.env };
for (const key of [
  "GIT_DIR",
  "GIT_WORK_TREE",
  "GIT_COMMON_DIR",
  "GIT_INDEX_FILE",
  "GIT_OBJECT_DIRECTORY",
  "GIT_ALTERNATE_OBJECT_DIRECTORIES",
  "GIT_PREFIX",
  "GIT_NAMESPACE",
])
  delete childEnv[key];

function run(binary, args, cwd = work) {
  if (binary === "vp") {
    const nodeVersion = readFileSync(join(cwd, ".node-version"), "utf8").trim();
    const { packageManager } = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8"));
    args = [
      "env",
      "exec",
      "--node",
      nodeVersion,
      "--package-manager",
      packageManager,
      "vp",
      ...args,
    ];
  }
  console.log(`\n$ ${binary} ${args.join(" ")}`);
  const result = spawnSync(binary, args, { cwd, env: childEnv, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${binary} exited with ${result.status ?? result.signal}`);
}

function requireCopy() {
  if (!existsSync(join(work, ".git"))) {
    throw new Error("Run `node scripts/config-demo.mjs prepare` first.");
  }
  if (realpathSync(work) !== work) throw new Error("The demo directory must not be a symlink.");
  const result = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: work,
    env: childEnv,
    encoding: "utf8",
  });
  if (result.status !== 0 || realpathSync(result.stdout.trim()) !== work) {
    throw new Error("Expected a separate Git repository in the demo directory.");
  }
}

function showConfigs() {
  const present = configFiles.filter((name) => existsSync(join(work, name)));
  console.log(`\n${present.length} 个工具配置文件：${present.join(", ")}`);
  for (const name of present) {
    console.log(`\n--- ${name} ---\n${readFileSync(join(work, name), "utf8")}`);
  }
  console.log("package.json、tsconfig.json、.node-version、pnpm 配置与锁文件继续保留。");
}

try {
  if (command === "path") {
    console.log(work);
  } else if (command === "prepare") {
    mkdirSync(scratch, { recursive: true });
    if (existsSync(work)) {
      const archive = `${work}-${new Date().toISOString().replaceAll(/[:.]/g, "-")}`;
      renameSync(work, archive);
      console.log(`已保留上次副本：${archive}`);
    }
    const excluded = new Set(["node_modules", "dist", "coverage", ".git", ".vite-plus"]);
    cpSync(fixture, work, {
      recursive: true,
      filter: (source) => !excluded.has(relative(fixture, source).split(/[\\/]/)[0]),
    });
    run("git", ["init", "--quiet"]);
    requireCopy();
    run("git", ["add", "."]);
    console.log(`\n演示副本：${work}\n已建立比较基线；没有创建提交。`);
    showConfigs();
  } else if (["before", "migrate", "show", "finish", "verify", "diff"].includes(command)) {
    requireCopy();
    if (command === "before") {
      run("vp", ["install", "--frozen-lockfile"]);
      run("vp", ["exec", "pnpm", "run", "verify"]);
    } else if (command === "migrate") {
      const manifest = JSON.parse(readFileSync(join(work, "package.json"), "utf8"));
      if (manifest.devDependencies?.["vite-plus"]) {
        throw new Error(
          "This copy already uses Vite+. Run prepare and before for a fresh migration.",
        );
      }
      run("vp", ["install", "--frozen-lockfile"]);
      run("vp", [
        "exec",
        "pnpm",
        "dlx",
        "--package=vite-plus@1.4.0",
        "vp",
        "migrate",
        "--no-interactive",
        "--no-agent",
        "--no-editor",
        "--no-hooks",
      ]);
      run("vp", ["fmt"]);
      showConfigs();
    } else if (command === "finish") {
      console.log(
        "应用这份示例专用的人工整理补丁：合并 test，迁移 verify 任务。\n这是已写好的补丁，不是 Agent 现场生成的代码。",
      );
      run("git", ["apply", "--check", patch]);
      run("git", ["apply", patch]);
      showConfigs();
    } else if (command === "verify") {
      for (const action of ["check", "test", "build"]) run("vp", [action]);
    } else if (command === "diff") {
      run("git", ["--no-pager", "diff", "--stat"]);
      run("git", ["--no-pager", "diff", "--", ...configFiles, "package.json", "tsconfig.json"]);
    } else {
      showConfigs();
    }
  } else {
    console.log(
      "Usage: node scripts/config-demo.mjs <prepare|before|migrate|show|finish|verify|diff|path>",
    );
    if (command) process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
