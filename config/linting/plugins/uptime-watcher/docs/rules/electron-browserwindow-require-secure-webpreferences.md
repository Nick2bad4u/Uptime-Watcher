# Electron: electron-browserwindow-require-secure-webpreferences

Requires hardened `BrowserWindow` `webPreferences`.

## Why

Electron security best practices require:

- `contextIsolation: true`
- `sandbox: true`
- `nodeIntegration: false`
- `webviewTag: false`

Accidentally changing any of these can create a major security regression.
This rule makes those defaults non-negotiable whenever creating a `BrowserWindow`.

## Options

No options.

## Examples

### Incorrect

```ts
new BrowserWindow({
  webPreferences: {
    nodeIntegration: true,
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
  },
});
```
