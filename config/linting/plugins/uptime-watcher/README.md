# Uptime Watcher ESLint plugin (internal)

This folder contains the internal `uptime-watcher` ESLint plugin used by this
repository.

## Usage (flat config)

```js
import uptimeWatcherPlugin from "./config/linting/plugins/uptime-watcher.mjs";

export default [
    uptimeWatcherPlugin.configs.recommended,
];
```

## Rules

Per-rule documentation lives in:

- `docs/rules/*.md`

Rule IDs are always kebab-case:

- `uptime-watcher/<rule-id>`

## Tests

RuleTester suites live under:

- `test/**/*.test.ts`
