# Vite+ command demos

This repository contains two independent projects, not a shared workspace. Run commands inside the project directory.

Both projects pin Node.js 24.22.1, pnpm 10.33.0 and Vite+ 1.4.0. Run `vp install --frozen-lockfile` before making changes. Preserve both lockfiles unless a dependency change is requested.

- `agenda-web`: run `vp check`, `vp test` and `vp build`. `vp dev` serves http://127.0.0.1:6517. `vp run verify` runs the cached validation task; `vp run --last-details` explains its last execution.
- `favorites-lib`: run `vp check` and `vp pack src/index.ts --dts`. Import the resulting `dist/index.mjs` to verify the public functions.

Preserve the favorites limit and existing assertions. The application uses illustrative sessions, not the official conference schedule. `favorites-lib/src/index.ts` is an independent copy of `agenda-web/src/favorites.ts` for the library packaging example; keep their behavior aligned.

Keep generated output, dependencies, videos and screenshots out of commits.
