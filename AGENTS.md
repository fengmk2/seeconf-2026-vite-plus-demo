# Vite+ monorepo demos

Run normal development commands from the repository root. The main pnpm workspace contains `apps/agenda-web` (`@seeconf/agenda-web`) and `packages/favorites-lib` (`@seeconf/favorites`). The app depends on the library through `workspace:*` and uses its TypeScript source export. Do not duplicate the library logic in the app or require a library build before starting development.

The root owns `.node-version`, `package.json`, `pnpm-workspace.yaml` and `pnpm-lock.yaml`. Preserve the declared Node.js 24.22.1, pnpm 10.33.0 and catalog-pinned Vite+ 1.4.0 unless a dependency change is requested. Run `vp install --frozen-lockfile` before making changes.

The root `vite.config.ts` owns shared format, lint, test and task settings, and selects the default application/library targets. The app config owns its development server at http://127.0.0.1:6517. The library config owns its pack entry and declaration settings.

Verify changes from the root with `vp check`, `vp test`, `vp build` and `vp pack`. The 14 business tests live in `packages/favorites-lib/src/index.test.ts`. Import `packages/favorites-lib/dist/index.mjs` to verify the built library. `vp run verify` runs the cached check/test/build/pack task; `vp run --last-details` explains the last execution. Preserve the favorites limit and existing assertions. Session data is illustrative, not the official conference schedule.

## Configuration migration references

`config-consolidation/before` and `config-consolidation/after` are reference fixtures, excluded from the main workspace and its root lint, format and test scopes. Their separate manifests and lockfiles preserve different toolchains. Do not run migration in the main workspace or modify either fixture in place while rehearsing.

- `before` uses standalone Vite 8.3.5, Vitest 5.0.5, Oxlint 1.89.0 and Oxfmt 0.74.0. Keep its four tool configuration files and standalone imports.
- `after` uses Vite+ 1.4.0 and one `vite.config.ts` for `server`, `build`, `test`, `lint`, `fmt` and `run`. Keep its lint rules and format options.

Run `node scripts/config-demo.mjs prepare`, `before`, `migrate`, `show`, `finish`, `verify` and `diff` from the repository root. The harness creates its runtime copy outside the repository at `~/.cache/seeconf-vite-plus-demo/<path-hash>/config-consolidation`. Use `node scripts/config-demo.mjs path` to print the actual location. `prepare` archives a previous copy before replacing it and creates a Git index only inside that copy for comparison. It must not stage or commit the parent repository.

For each toolchain child process, the harness reads `.node-version` and `package.json.packageManager` from the runtime copy and invokes `vp env exec --node <version> --package-manager <name@version> vp ...`. This explicitly selects the fixture's Node.js and package-manager versions, even when another Node.js version starts the harness.

Keep the migration boundary explicit. The pinned migrator automatically merges Oxlint and Oxfmt configuration, adds its lint options/plugin rules, and rewrites package scripts. The separate Vitest config remains. `finish` applies a pre-reviewed, fixture-specific manual patch to merge test configuration, move `verify` into `run.tasks`, remove forwarding scripts and remove the old Vitest config reference from `tsconfig.json`. It does not call AI and is not part of `vp migrate`. Rehearse the full sequence after changes to fixtures or the patch; baseline and final projects should pass the same 14 business tests and build successfully.

Keep generated output, dependencies, videos and screenshots out of commits. The existing video predates the monorepo layout; do not describe it as rerecorded.
