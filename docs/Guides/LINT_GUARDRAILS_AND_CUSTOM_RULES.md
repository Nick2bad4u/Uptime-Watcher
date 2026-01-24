---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Lint guardrails and custom ESLint rules"
summary: "How Uptime Watcher uses custom ESLint rules to enforce architecture boundaries and prevent duplicated codepaths (especially from AI-assisted edits)."
created: "2025-12-12"
last_reviewed: "2025-12-16"
category: "guide"
author: "Uptime Watcher Team"
tags:
 - "linting"
 - "eslint"
 - "architecture"
 - "guardrails"
 - "ai-agent"
---

# Lint guardrails and custom ESLint rules

This repository contains a custom ESLint plugin (`uptime-watcher/*`) and a
small number of targeted ESLint guard configs that exist
primarily to prevent architectural drift and AI-style failure modes:

- inventing new codepaths where canonical helpers already exist
- duplicating IPC channel strings instead of using the shared registries
- bypassing preload/renderer boundaries
- bypassing the renderer services layer

## Quick examples

### Replace inline IPC channel strings

Bad:

```ts
// ❌ Wrong: do not inline IPC channel strings.
const channel = "add-site";

await invoke(channel, payload);
```

Good:

```ts
import { SITES_CHANNELS } from "@shared/types/preload";

// in preload: createTypedInvoker(SITES_CHANNELS.addSite)
// in renderer: call the renderer service wrapper, not window.electronAPI
```

## Where the rules live

- Plugin implementation: `config/linting/plugins/uptime-watcher.mjs`
- Shared contract interface guard: `uptime-watcher/no-redeclare-shared-contract-interfaces` (implemented in the plugin)
- Configuration: `eslint.config.mjs`

## Current custom rule inventory (enforced)

The following `uptime-watcher/*` rules currently exist and are enabled in
`eslint.config.mjs` (file-glob scoped):

- IPC + boundary guardrails
  - `uptime-watcher/electron-no-direct-ipc-handle`
  - `uptime-watcher/electron-no-direct-ipc-handler-wrappers`
  - `uptime-watcher/electron-no-direct-ipcMain-import`
  - `uptime-watcher/electron-no-inline-ipc-channel-literal`
  - `uptime-watcher/electron-no-inline-ipc-channel-type-argument`
  - `uptime-watcher/electron-preload-no-direct-ipcRenderer-usage`
  - `uptime-watcher/electron-preload-no-inline-ipc-channel-constant`
  - `uptime-watcher/no-inline-ipc-channel-type-literals`
  - `uptime-watcher/electron-ipc-handler-require-validator`
  - `uptime-watcher/renderer-no-electron-import`
  - `uptime-watcher/renderer-no-ipcRenderer-usage`
  - `uptime-watcher/renderer-no-direct-preload-bridge`
  - `uptime-watcher/renderer-no-preload-bridge-writes`
  - `uptime-watcher/renderer-no-direct-networking`
  - `uptime-watcher/renderer-no-direct-electron-log`
  - `uptime-watcher/renderer-no-direct-bridge-readiness`
  - `uptime-watcher/renderer-no-browser-dialogs`
  - `uptime-watcher/renderer-no-window-open`
  - `uptime-watcher/renderer-no-import-internal-service-utils`

- Layer isolation + import conventions
  - `uptime-watcher/shared-no-outside-imports`
  - `uptime-watcher/prefer-shared-alias`
  - `uptime-watcher/prefer-app-alias`

- Anti-duplication helpers
  - `uptime-watcher/no-local-record-guards`
  - `uptime-watcher/no-local-error-normalizers`
  - `uptime-watcher/no-deprecated-exports`
  - `uptime-watcher/no-redeclare-shared-contract-interfaces`
  - `uptime-watcher/electron-no-local-string-safety-helpers`
  - `uptime-watcher/electron-no-ad-hoc-error-code-suffix`
  - `uptime-watcher/electron-sync-no-local-ascii-digits`
  - `uptime-watcher/electron-cloud-providers-drift-guards`
  - `uptime-watcher/shared-types-no-local-isPlainObject`
  - `uptime-watcher/preload-no-local-isPlainObject`

- Test stability helpers
  - `uptime-watcher/test-no-mock-return-value-constructors`

### Vitest constructor mocks

When you need a mocked constructor to be usable with `new`, **do not** use
`mockReturnValue` / `mockReturnValueOnce` (Vitest implements those with an
arrow function).

Prefer the shared helper:

- `@shared/test/helpers/vitestConstructors`
  - `mockConstructableReturnValue(mock, value)`
  - `mockConstructableReturnValueOnce(mock, value)`
  - `createMockConstructor(factory)`

- Logging / docs guardrails
  - `uptime-watcher/electron-no-console`
  - `uptime-watcher/tsdoc-no-console-example`
  - `uptime-watcher/logger-no-error-in-context`

- Project-specific safety
  - `uptime-watcher/electron-prefer-readProcessEnv`
  - `uptime-watcher/no-onedrive`

- Monitor config consistency
  - `uptime-watcher/monitor-fallback-consistency`

## How to interpret failures

When a custom rule fires, the intended fix is almost always:

1. Find the canonical helper/type/channel registry.
2. Use that instead of creating a new variant.
3. Remove literal strings and let types be inferred.

If the canonical helper does not exist, **add it** (in the right layer) and then
adopt it across call sites.

## IPC + preload/renderer boundary rules

### Electron handler channel literals

**Rule:** `uptime-watcher/electron-no-inline-ipc-channel-literal`

**What it prevents:** direct string literals like `"add-site"` in invoke/handle
registration or invocation.

**Fix:** use channel constants from `@shared/types/preload`:

```ts
import { SITES_CHANNELS } from "@shared/types/preload";

registerStandardizedIpcHandler(
 SITES_CHANNELS.addSite,
 handler,
 validator,
 registeredHandlers
);
```

### `uptime-watcher/no-inline-ipc-channel-type-literals`

**What it prevents:** encoding IPC channel strings in **TypeScript type
positions**, which tends to spread string literals even when runtime code uses
constants.

Examples that are not allowed:

- `Extract<IpcInvokeChannel, "update-notification-preferences">`
- `"add-site" satisfies IpcInvokeChannel`
- `"add-site" as IpcInvokeChannel`

**Fix:** reference the canonical channel constant and let types infer:

```ts
import { NOTIFICATION_CHANNELS } from "@shared/types/preload";

type UpdatePreferencesChannel = typeof NOTIFICATION_CHANNELS.updatePreferences;
```

### `uptime-watcher/renderer-no-direct-preload-bridge`

**What it prevents:** direct `window.electronAPI.*` access in renderer code.

**Fix:** call via `src/services/*` (request/response IPC) so validation,
error-handling, telemetry, and return typing are centralized.

Related guardrails you will typically see alongside this:

- `uptime-watcher/renderer-no-direct-bridge-readiness`
- `uptime-watcher/renderer-no-preload-bridge-writes`

### `uptime-watcher/renderer-no-window-open`

**What it prevents:** calling `window.open(...)` (or the global `open(...)`) in
renderer code.

**Why:** external navigation must stay behind the main-process boundary so URL
validation and OS integration remain centralized.

**Fix:** use `SystemService.openExternal(url)`.

## Anti-duplication helper rules

### `uptime-watcher/no-local-record-guards`

**What it prevents:** local ad-hoc helpers like `isObjectRecord`, `toRecord`, or
`asRecord` being re-invented in random files.

**Fix:** import and use the canonical helper(s):

```ts
import { ensureRecordLike, isRecord } from "@shared/utils/typeHelpers";
```

### `uptime-watcher/no-local-error-normalizers`

**What it prevents:** local re-implementations of error normalization (most
commonly `ensureError`).

**Fix:** import the canonical helper:

```ts
import { ensureError } from "@shared/utils/errorHandling";
```

## Logging correctness rules

### `uptime-watcher/logger-no-error-in-context`

**What it prevents:** passing an `Error` object via a context property like:

```ts
logger.error("Something failed", { error: ensureError(error) });
```

This tends to lose stack/cause formatting in the shared logger.

**Fix:** pass the error as the dedicated argument, and keep context separate:

```ts
logger.error("Something failed", ensureError(error), { operation: "..." });
```

## Type + schema enforcement rules

Uptime Watcher enforces schema/type correctness primarily via:

- TypeScript strict type-checking (`npm run type-check:all`)
- Zod linting helpers (e.g. `eslint-plugin-zod` and `eslint-plugin-import-zod`)

At the moment there is **no** `uptime-watcher/*` rule that specifically enforces
`schema satisfies type` patterns. If we want stronger enforcement for future
development (especially AI-assisted edits), a good candidate custom rule would
be:

- `uptime-watcher/require-zod-schema-satisfies` (future work)
  - flag Zod schema declarations that are not constrained to a TS contract
  - flag IPC validators/schemas that are declared but never used at boundaries

## Candidate additions (recommended)

This repo already has unusually strong guardrails. The next improvements should
be **high-signal** and **low-false-positive**, otherwise developers will start
sprinkling disables and the guardrails lose value.

Below are candidates that have historically prevented real AI-agent drift.

### Candidate `uptime-watcher/*` custom rules

1. **`uptime-watcher/require-ensureError-in-catch`**
   - **Goal:** stop `catch (error) { logger.error(error.message) }` when `error`
     is `unknown`.
   - **Fix:** require `ensureError(error)` before accessing `.message` or
     passing caught values into loggers/toasts.
   - **Notes:** this complements `@typescript-eslint/use-unknown-in-catch-callback-variable`.

2. **`uptime-watcher/no-settings-key-string-literals`**
   - **Goal:** avoid settings-key drift (`"cloud.provider"` vs
     `"cloud.providers"`, etc.).
   - **Fix:** require settings keys to come from a centralized constant module.
   - **Notes:** this is powerful but can be noisy; roll out incrementally.

3. **`uptime-watcher/store-actions-require-finally-reset`**
   - **Goal:** prevent “busy flag stuck true” regressions in Zustand stores.
   - **Fix:** when a store action sets `isX: true`, enforce it resets in a
     `finally` block.
   - **Notes:** only feasible if we standardize action patterns strongly.

### Candidate config tightening (existing plugins)

These are usually easier than writing custom rules.

- **Raise `canonical/no-re-export`** from `warn` → `error` for production code
  (keep allowances for module boundaries if needed).
- **Raise `@typescript-eslint/no-explicit-any`** from `warn` → `error` outside
  tests/benchmarks/scripts.
- Enable `eslint-plugin-no-hardcoded-strings` _selectively_ for new UI modules
  (or at least for user-facing copy in settings pages), if you decide to start
  centralizing copy/strings.
- Consider enabling a “task-comment hygiene” rule (either a small custom rule
  or a third-party one) that requires task comments to include an issue/ADR
  reference.

## Banned provider reintroductions

### `uptime-watcher/no-onedrive`

**What it prevents:** reintroducing OneDrive references in code after the
project explicitly removed OneDrive support.

**Fix:** remove OneDrive-related identifiers/strings entirely. If you need a
cloud provider example, use Dropbox or Google Drive.

This rule exists primarily as an **AI guardrail**: it prevents future agents
from “helpfully” reintroducing a provider the project deliberately removed.

## When is an ESLint disable acceptable?

Almost never for architecture rules.

If you believe a disable is warranted:

1. explain _why_ the canonical helper is not usable
2. keep the scope to a single line
3. create a follow-up issue to remove it

In practice: the correct fix is usually to move code into the correct layer
instead of disabling the rule.

## Repository-wide AI guardrails (non-tests)

In addition to `uptime-watcher/*`, the ESLint config enforces a small number of
high-signal guardrails across `src/`, `electron/`, and `shared/` (excluding all
test folders and `*.test.*` / `*.spec.*` files):

- `canonical/no-re-export`: **error**
  - Prevents “helpful” re-export layers that become accidental barrel modules.
- `@typescript-eslint/no-explicit-any`: **error**
  - Keeps runtime code strongly typed; tests remain flexible.
