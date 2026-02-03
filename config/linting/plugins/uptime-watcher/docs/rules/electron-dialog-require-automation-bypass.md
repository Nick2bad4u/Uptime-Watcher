# Electron: electron-dialog-require-automation-bypass

Requires Electron main-process code that uses native `dialog.*` APIs to include an automation escape hatch.

## Why

Native dialogs are **blocking UI**. In Playwright/E2E runs they:

- hang the test waiting for user input,
- cause flakes,
- or fail the test because the runner cannot interact with OS-level dialogs.

This rule enforces a simple convention: if a module calls `dialog.showSaveDialog`, `dialog.showOpenDialog`, etc., it must also contain a guard for automation mode (currently detected via `PLAYWRIGHT_TEST` or `HEADLESS`).

## Options

No options.

## Examples

### Incorrect

```ts
import { dialog } from "electron";

await dialog.showSaveDialog({
  title: "Save",
});
```

### Correct

```ts
import { dialog } from "electron";
import { readProcessEnv } from "@shared/utils/environment";

const isPlaywright = readProcessEnv("PLAYWRIGHT_TEST")?.toLowerCase() === "true";

if (!isPlaywright) {
  await dialog.showSaveDialog({
    title: "Save",
  });
}
```
