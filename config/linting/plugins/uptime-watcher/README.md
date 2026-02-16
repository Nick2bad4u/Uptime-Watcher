# Uptime Watcher ESLint plugin (internal)

This folder contains the internal `uptime-watcher` ESLint plugin used by this
repository.

## Usage (flat config)

```js
import uptimeWatcherPlugin from "./config/linting/plugins/uptime-watcher.mjs";

export default [
    // Generic (unscoped) presets.
    uptimeWatcherPlugin.configs.recommended,
    // Or: uptimeWatcherPlugin.configs["flat/recommended"],
];
```

## Usage (this repo / scoped presets)

For Uptime-Watcher specifically, you typically want the repo-scoped presets.
These are exported as **arrays** of flat-config items, so they must be spread:

```js
import uptimeWatcherPlugin from "./config/linting/plugins/uptime-watcher.mjs";

export default [
    ...uptimeWatcherPlugin.configs.repo,
    // Or: ...uptimeWatcherPlugin.configs["repo/core"],
    // Or: ...uptimeWatcherPlugin.configs["repo/drift-guards"],
];
```

## Rules

Per-rule documentation lives in:

- `docs/rules/*.md`

Rule IDs are always kebab-case:

- `uptime-watcher/<rule-id>`

`type-fest` and `ts-extras` convention rules now live in the separate
`uptime-watcher-type-utils` plugin.

### Rule module conventions

- Rule modules under `rules/*.mjs` must export rule objects using **named
  exports** (for example, `export { requireEnsureErrorInCatchRule };`).
- `plugin.mjs` must import rule modules using matching **named imports**.
- Avoid introducing new default exports for individual rule modules.

## Tests

RuleTester suites live under:

- `test/**/*.test.ts`
