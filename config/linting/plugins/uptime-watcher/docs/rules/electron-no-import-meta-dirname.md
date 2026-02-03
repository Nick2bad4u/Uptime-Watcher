# Electron: electron-no-import-meta-dirname

Disallows using `import.meta.dirname` and `import.meta.filename` in Electron main-process sources.

## Why

Even if your current Node/Electron runtime provides `import.meta.dirname` / `import.meta.filename`, bundlers (Vite/Rollup) can rewrite `import.meta` in ways that **do not preserve** these non-standard properties.

In Electron **main process** code, that becomes a user-visible crash (the Windows “A JavaScript error occurred in the main process” dialog).

## Options

No options.

## Examples

### Incorrect

```ts
const dirname = import.meta.dirname;
```

```ts
import * as path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
```

### Correct

```ts
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
```
