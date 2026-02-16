# Prefer TypeFest UnknownRecord

Prefers `UnknownRecord` from TypeFest over `Record<string, unknown>` in architecture-critical layers.

## What it checks

- `Record<string, unknown>` type references in configured boundary paths (for example shared contracts and IPC-adjacent layers).

## Why

`UnknownRecord` conveys intent directly and keeps boundary contracts consistent with TypeFest-first typing conventions.
