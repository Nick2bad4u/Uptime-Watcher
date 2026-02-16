# Uptime-watcher-type-utils ESLint plugin

Transitional internal plugin that owns `type-fest` and `ts-extras` lint rules.

## Why this exists

This plugin isolates utility-type conventions from the core
`eslint-plugin-uptime-watcher` package so those rules can be extracted into a
standalone/public plugin later with minimal migration work.

Rule source, docs, tests, and typed fixtures for these families live directly
in this directory so extraction can be done with minimal follow-up refactors.

## Rule families currently owned here

- `prefer-type-fest-*`
- `prefer-ts-extras-*`
