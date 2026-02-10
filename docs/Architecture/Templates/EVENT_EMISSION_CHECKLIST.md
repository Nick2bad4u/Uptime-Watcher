---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Event Emission Checklist"
summary: "Checklist for defining and emitting typed events across main/renderer aligned with RendererEventPayloadMap."
created: "2025-12-04"
last_reviewed: "2026-01-10"
doc_category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "template"
  - "events"
  - "ipc"
  - "typed-event-bus"
  - "renderer"
---
# Event Emission Checklist

## Table of Contents

1. [Purpose](#purpose)
2. [Checklist](#checklist)
3. [Minimal Skeleton](#minimal-skeleton)

## Purpose

Use this checklist whenever adding or modifying events (main, renderer, or preload) to keep the event surface consistent with `RendererEventPayloadMap` and TypedEventBus usage.

## Checklist

- [ ] Channel name follows existing conventions (domain:action).
- [ ] Payload type exists in `@shared/types/events` and is referenced by `RendererEventPayloadMap`.
- [ ] Metadata (`_meta`) is preserved on re-emit (correlation IDs belong in metadata, not the payload).
- [ ] Validation at boundary (IPC handler or preload) before emission.
- [ ] Renderer broadcast path defined (webContents.send + preload validation).
- [ ] Logging/telemetry includes channel, correlationId, and outcome; no PII in logs.
- [ ] Tests cover payload validation and event flow (main → preload → renderer store/component).

## Minimal Skeleton

```typescript
import { RENDERER_EVENT_CHANNELS } from "@shared/ipc/rendererEvents";
import type { RendererEventPayload } from "@shared/ipc/rendererEvents";

// main (orchestrator / manager event bus)
await eventBus.emitTyped("site:added", {
 site,
 source: "user",
 timestamp: Date.now(),
});

// main (renderer event bridge)
rendererEventBridge.sendToRenderers(
 RENDERER_EVENT_CHANNELS.SITE_ADDED,
 payload satisfies RendererEventPayload<
  typeof RENDERER_EVENT_CHANNELS.SITE_ADDED
 >
);

// preload
// Use createEventManager(RENDERER_EVENT_CHANNELS.SITE_ADDED) + a guard, then
// expose the subscription via the events domain bridge.

// renderer
// Subscribe via EventsService (which consumes the preload events bridge and
// normalizes cleanup handlers).
```
