---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "IPC Diagnostics Handler Template"
summary: "Pattern for diagnostics/report IPC handlers with validation, redaction, and typed responses."
created: "2025-12-04"
last_reviewed: "2025-12-11"
category: "guide"
author: "Nick2bad4u"
tags:
 - "uptime-watcher"
 - "architecture"
 - "template"
 - "ipc"
 - "diagnostics"
 - "validation"
 - "privacy"
---

# IPC Diagnostics Handler Template

## Table of Contents

1. [Purpose](#purpose)
2. [Implementation Steps](#implementation-steps)
3. [Example Skeleton](#example-skeleton)
4. [Checklist](#checklist)

## Purpose

Provide a safe, repeatable pattern for diagnostics/report IPC handlers (for
example the preload guard reporting flow) that validates payloads, redacts
sensitive data, and returns typed results.

## Implementation Steps

1. **Schema & Types**
   - Define Zod schema for request payload with explicit size limits (e.g., max bytes/fields).
   - Export TypeScript types inferred from the schema for handler signatures.

2. **Handler Registration (Main)**
   - Use `registerStandardizedIpcHandler(channel, handler, validator)`.
   - Validator uses the Zod schema; reject oversize or malformed payloads with structured errors.
   - Handler returns typed result object `{ status, details, redactions }`.

3. **Redaction & Privacy**
   - Strip URLs/auth tokens/secrets; hash identifiers when included for correlation.
   - Ensure no PII is logged; log only metadata (correlationId, channel, sizes, counts).

4. **Preload Bridge**
   - Expose typed API with request/response types; ensure payload validation before forwarding to main.

5. **Correlation & Payload Limits**
   - Every typed bridge invocation (via `createTypedInvoker`) automatically sends a correlation envelope; `registerStandardizedIpcHandler` extracts it, so avoid baking correlation IDs into payload schemas.
   - Enforce `MAX_DIAGNOSTICS_METADATA_BYTES` and `MAX_DIAGNOSTICS_PAYLOAD_PREVIEW_BYTES` before logging or returning payload previews. Flag truncation in the response/logs.

6. **Logging & Telemetry**
   - Log diagnostics handling with `correlationId`, `channel`, and outcome via `withLogContext` to avoid leaking PII.
   - Emit `diagnostics:report-created` (or similar) for observability where appropriate.

7. **Testing**
   - Unit tests: schema validation, redaction, oversize rejection, typed success response.
   - Integration tests: preload-to-main round trip with valid/invalid payloads.

## Example Skeleton

```typescript
// shared/types/diagnostics.ts
export const diagnosticsReportSchema = z.object({
 report: z.string().max(10_000),
 context: z.record(z.string(), z.string()).optional(),
});
export type DiagnosticsReport = z.infer<typeof diagnosticsReportSchema>;
export interface DiagnosticsResult {
 status: "ok" | "rejected";
 redactions: string[];
}

// shared/types/preload.ts
// Add (or reuse) a DIAGNOSTICS_CHANNELS mapping entry:
//   reportPreloadGuard: "diagnostics-report-preload-guard"

// main (electron/services/ipc/handlers/diagnosticsHandlers.ts)
import { DIAGNOSTICS_CHANNELS } from "@shared/types/preload";
import { registerStandardizedIpcHandler } from "../utils";

registerStandardizedIpcHandler(
 DIAGNOSTICS_CHANNELS.reportPreloadGuard,
 async (payload: DiagnosticsReport): Promise<DiagnosticsResult> => {
  const redactions = redactSecrets(payload.report);
  return { status: "ok", redactions };
 },
 (payload): payload is DiagnosticsReport =>
  diagnosticsReportSchema.safeParse(payload).success,
 registeredHandlers
);

// preload (electron/preload/domains/diagnosticsApi.ts)
import { DIAGNOSTICS_CHANNELS } from "@shared/types/preload";
import { createTypedInvoker } from "../core/bridgeFactory";

const submitPreloadGuardReport = createTypedInvoker(
 DIAGNOSTICS_CHANNELS.reportPreloadGuard
);

// then expose submitPreloadGuardReport via contextBridge, following the
// existing preload bridge structure.
```

## Checklist

- [ ] Zod schema with size limits
- [ ] Redaction of secrets/PII
- [ ] Typed request/response wiring in preload
- [ ] Structured logging with correlationId (via auto envelope)
- [ ] Metadata/payload previews respect byte limits and surface truncation flags
- [ ] Tests for invalid, oversize, and success paths
