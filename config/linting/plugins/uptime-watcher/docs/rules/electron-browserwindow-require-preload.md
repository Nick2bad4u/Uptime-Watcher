# Electron: electron-browserwindow-require-preload

Requires `BrowserWindow` creation to specify `webPreferences.preload`.

## Why

In this project, preload is the audited boundary (contextBridge) between renderer and main.
Creating a `BrowserWindow` without a preload script typically leads to insecure fallbacks (Node integration, ad-hoc IPC, etc.).

## Options

No options.

## Examples

### Incorrect

```ts
new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    sandbox: true,
    nodeIntegration: false,
    webviewTag: false,
  },
});
```

### Correct

```ts
new BrowserWindow({
  webPreferences: {
    contextIsolation: true,
    sandbox: true,
    nodeIntegration: false,
    webviewTag: false,
    preload: getPreloadPath(),
  },
});
```
