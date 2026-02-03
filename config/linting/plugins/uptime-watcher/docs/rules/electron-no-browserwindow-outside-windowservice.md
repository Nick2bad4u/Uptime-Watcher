# Electron: electron-no-browserwindow-outside-windowservice

Restricts `new BrowserWindow(...)` usage to `electron/services/window/WindowService.ts`.

## Why

This project centralizes BrowserWindow creation in one place so:

- security defaults cannot drift,
- lifecycle/event handlers stay consistent,
- future hardening changes are made once.

## Options

No options.

## Examples

### Incorrect

```ts
import { BrowserWindow } from "electron";

export function createWindow() {
  return new BrowserWindow({});
}
```

### Correct

```ts
import { WindowService } from "../services/window/WindowService";

const windowService = new WindowService();
windowService.createMainWindow();
```
