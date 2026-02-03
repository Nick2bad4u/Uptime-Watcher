# Electron: electron-open-devtools-require-dev-only

Requires `openDevTools()` calls to live in **dev-only** code paths.

## Why

Opening DevTools in production is almost always accidental and can be noisy.
This rule prevents regressions by enforcing a convention: only open DevTools from functions/methods whose name includes `dev` (e.g. `loadDevelopmentContent`, `openDevToolsInDev`).

## Options

No options.

## Examples

### Incorrect

```ts
class WindowService {
  createMainWindow() {
    this.mainWindow.webContents.openDevTools();
  }
}
```

### Correct

```ts
class WindowService {
  loadDevelopmentContent() {
    this.mainWindow.webContents.openDevTools();
  }
}
```
