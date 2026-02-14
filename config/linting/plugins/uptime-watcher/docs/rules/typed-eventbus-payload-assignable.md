# Typed EventBus Payload Assignable

Requires typed event bus interactions to stay assignable to event-map contracts.

## What it checks

- `emit(eventName, payload)` payload is assignable to the event payload type.
- `on(...)`/`onTyped(...)` listener callback type is assignable to the listener contract.

## Why

Typed event buses only help when payload and listener signatures remain aligned. This rule catches mismatches that can hide behind broad function types.
