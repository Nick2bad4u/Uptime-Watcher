# Prefer ts-extras isDefined in filter callbacks

Require `isDefined` from `ts-extras` in `Array.prototype.filter` callbacks instead of inline undefined checks.

## What it checks

- `filter((value) => value !== undefined)`
- `filter((value) => typeof value !== "undefined")`
- `filter((value): value is T => value !== undefined)`

## Why

`isDefined` is clearer, reusable, and gives consistent narrowing behavior across filtering pipelines without repeating inline predicate logic.
