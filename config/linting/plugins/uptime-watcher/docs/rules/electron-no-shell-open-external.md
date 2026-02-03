# Electron: electron-no-shell-open-external

Disallows calling `shell.openExternal()` directly in Electron main-process sources.

## Why

`shell.openExternal()` is security-sensitive. This repository centralizes external URL opening in:

- `electron/services/shell/openExternalUtils.ts`

That module is responsible for normalizing URLs and enforcing allow-list rules consistently.

## Options

No options.

## Examples

### Incorrect

```ts
import { shell } from "electron";

await shell.openExternal("https://example.com");
```

### Correct

```ts
import { openExternal } from "../services/shell/openExternalUtils";

await openExternal("https://example.com");
```
