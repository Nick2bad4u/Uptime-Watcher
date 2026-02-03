# Electron: electron-no-app-getpath-at-module-scope

Disallows calling these Electron `app` APIs at **module scope** (top-level code):

- `app.getPath(...)`
- `app.getAppPath()`
- `app.getName()`

## Why

Module-scope code executes during import. In Electron, that can run before `app.whenReady()`, and it also makes startup behavior harder to test.

This rule enforces a safer pattern: **read paths/names inside functions** that run after readiness.

In practice, this means:

- no `const userData = app.getPath("userData")` at top-level,
- no computed paths in class field initializers,
- move these reads into a function (or a class method) called after readiness.

## Options

No options.

## Examples

### Incorrect

```ts
import { app } from "electron";

const userData = app.getPath("userData");
```

### Correct

```ts
import { app } from "electron";

export function getUserDataPath(): string {
  return app.getPath("userData");
}
```
