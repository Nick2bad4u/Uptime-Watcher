# Electron IPC: Require validators

Rule ID: `uptime-watcher/electron-ipc-handler-require-validator`

## Summary

Require IPC handlers to provide a validator so inputs are validated at the boundary.

This rule covers both registration styles used in this repo:

- `registerStandardizedIpcHandler(channel, handler, validator)`
- `const register = createStandardizedIpcRegistrar(...)` then `register(channel, handler, validator)`

## Options

This rule has no options.
