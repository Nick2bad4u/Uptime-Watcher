# Electron: electron-no-webcontents-execute-JavaScript

Disallows calling `webContents.executeJavaScript()` in Electron sources.

## Why

`executeJavaScript()` runs arbitrary code in the renderer context from the main process.
This is security-sensitive and bypasses your validated preload/IPC boundary.

Prefer:

- explicit IPC channels (validated payloads), or
- preload bridge functions.

## Options

No options.

## Examples

### Incorrect

```ts
mainWindow.webContents.executeJavaScript("alert('hi')");
```

### Correct

```ts
await mainWindow.webContents.send("some-channel", { /* validated payload */ });
```
