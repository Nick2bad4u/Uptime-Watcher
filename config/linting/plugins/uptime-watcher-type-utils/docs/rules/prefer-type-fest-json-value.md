# Prefer TypeFest JsonValue

Prefers TypeFest JSON types (`JsonValue`, `JsonObject`) for serialization-bound payload/context contracts.

## What it checks

- Payload/context-like contract aliases using `Record<string, unknown>`/`Record<string, any>` in JSON boundary folders.

## Why

Serialization boundaries should declare JSON-compatible intent directly so type safety and runtime assumptions stay aligned.
