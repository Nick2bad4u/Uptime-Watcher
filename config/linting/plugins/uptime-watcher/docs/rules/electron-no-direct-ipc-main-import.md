# Electron: No direct ipcMain import

Rule ID: `uptime-watcher/electron-no-direct-ipc-main-import`

## Summary

Disallow importing `ipcMain` outside the centralized Electron IPC service modules.

## Options

This rule has no options.

## Examples

### Incorrect

```ts
import { ipcMain } from "electron";
```

### Correct

```ts
// Route IPC registration through the centralized IPC service helpers.
registerStandardizedIpcHandler(/* ... */);
```
