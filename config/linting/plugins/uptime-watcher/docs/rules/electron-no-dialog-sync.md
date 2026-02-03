# Electron: electron-no-dialog-sync

Disallows using synchronous Electron dialog APIs:

- `dialog.showMessageBoxSync`
- `dialog.showOpenDialogSync`
- `dialog.showSaveDialogSync`

## Why

Synchronous dialogs block the Electron main thread and make the application unresponsive.
They also frequently break automation (Playwright) because they create OS-level modal UI that the test runner cannot interact with.

## Options

No options.

## Examples

### Incorrect

```ts
import { dialog } from "electron";

dialog.showMessageBoxSync({
  message: "Hello",
});
```

### Correct

```ts
import { dialog } from "electron";

await dialog.showMessageBox({
  message: "Hello",
});
```
