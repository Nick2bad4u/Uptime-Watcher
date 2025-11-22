---
name: "Assets-Folder-Guidelines"
description: "Management rules for packaged binary and media assets under assets/."
applyTo: "assets/**"
---

# Packaged Assets (assets/) Guidelines

- Purpose:
  - `assets/` stores binary artifacts that must ship with the desktop app outside the module bundler (for example, the bundled SQLite WASM binary and brand imagery). Treat everything here as release-critical—accidental edits can break runtime functionality.
- SQLite WASM lifecycle:
  - `node-sqlite3-wasm.wasm` and `.wasm-version` are managed by `scripts/download-sqlite3-wasm.mjs`. Always use the npm scripts (`npm run sqlite:download`, `npm run sqlite:download:force`, or `npm run copy-wasm`) to refresh the binary instead of editing it manually.
  - When the script downloads a new version it updates `.wasm-version` with the corresponding hash. Commit both files together so the integrity check remains in sync.
  - After updating the binary, run `npm run test:electron` (or the relevant integration tests) to confirm database access still works across platforms.
- Adding new assets:
  - Prefer lossless formats (PNG, SVG) optimized for size. Large binaries should be compressed and, if practical, hosted externally with download-on-demand instead of committed to git.
  - Document the purpose and expected usage of any new asset in `docs/Architecture/` or the feature-specific guide so future maintainers know why it exists.
  - Update `electron-builder.config.ts` if the new asset must be bundled or copied into the installer; otherwise the file will not ship with new builds.
- Housekeeping:
  - Avoid temporary or environment-specific files. Keep the directory tidy—helpers like `scripts/find-empty-dirs.mjs` expect only committed assets.
  - Use descriptive filenames (e.g., `UptimeWatcherMascotPanel.png`) and keep naming consistent with consuming code under `src/components/icons/` or other modules.
