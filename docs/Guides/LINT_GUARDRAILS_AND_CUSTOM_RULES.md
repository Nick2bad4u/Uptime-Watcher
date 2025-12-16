---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Lint guardrails and custom ESLint rules"
summary: "How Uptime Watcher uses custom ESLint rules to enforce architecture boundaries and prevent duplicated codepaths (especially from AI-assisted edits)."
created: "2025-12-12"
last_reviewed: "2025-12-12"
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

This repository contains a custom ESLint plugin (`uptime-watcher/*`) that exists
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
- Configuration: `eslint.config.mjs`

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
import { UPDATE_NOTIFICATION_PREFERENCES_CHANNEL } from "@electron/services/ipc/notificationChannelGuards";

type UpdatePreferencesChannel = typeof UPDATE_NOTIFICATION_PREFERENCES_CHANNEL;
```

### `uptime-watcher/renderer-no-direct-preload-bridge`

**What it prevents:** direct `window.electronAPI.*` access in renderer code.

**Fix:** call via `src/services/*` (request/response IPC) so validation,
error-handling, telemetry, and return typing are centralized.

Related guardrails you will typically see alongside this:

- `uptime-watcher/renderer-no-direct-bridge-readiness`
- `uptime-watcher/renderer-no-preload-bridge-writes`

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

## Type + schema enforcement rules

### `uptime-watcher/require-zod-schema-satisfies`

**What it prevents:** drifting runtime Zod schemas vs compile-time types.

**Fix:** use `satisfies z.ZodType<YourType>` (or equivalent) so TS and Zod stay
locked.

### `uptime-watcher/require-zod-parse-with-schema`

**What it prevents:** ad-hoc parsing/validation patterns.

**Fix:** prefer `schema.parse(...)` / `schema.safeParse(...)` in the boundary
layer.

## Testing rules

### `uptime-watcher/no-random-in-tests`

**What it prevents:** flaky tests caused by `Math.random()`.

**Fix:** use deterministic generators (or `fast-check`).

### `uptime-watcher/no-date-now-in-tests`

**What it prevents:** flaky time-based tests.

**Fix:** use fake timers or injected clocks.

## When is an ESLint disable acceptable?

Almost never for architecture rules.

If you believe a disable is warranted:

1. explain _why_ the canonical helper is not usable
2. keep the scope to a single line
3. create a follow-up issue to remove it

In practice: the correct fix is usually to move code into the correct layer
instead of disabling the rule.
