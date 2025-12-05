---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "Event Emission Checklist"
summary: "Checklist for defining and emitting typed events across main/renderer aligned with RendererEventPayloadMap."
created: "2025-12-04"
last_reviewed: "2025-12-04"
category: "guide"
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
- [ ] Payload type added to `RendererEventPayloadMap` (and Zod schema where applicable).
- [ ] CorrelationId and metadata included (`_meta` preserved on re-emit).
- [ ] Validation at boundary (IPC handler or preload) before emission.
- [ ] Renderer broadcast path defined (webContents.send + preload validation).
- [ ] Logging/telemetry includes channel, correlationId, and outcome; no PII in logs.
- [ ] Tests cover payload validation and event flow (main → preload → renderer store/component).

## Minimal Skeleton

```typescript
// shared/types/events.ts
export interface RendererEventPayloadMap {
    "monitor:status-changed": MonitorStatusChangedEventData;
    // new channel here
    "notifications:sent": NotificationSentEventData;
}

// main
await eventBus.emitTyped("notifications:sent", {
    notificationId,
    siteIdentifier,
    monitorId,
    status,
    timestamp: Date.now(),
});

// preload
ipcRenderer.on("notifications:sent", (_event, payload: NotificationSentEventData) => {
    validateNotificationPayload(payload);
    window.electronAPI.events.emit("notifications:sent", payload);
});
```
