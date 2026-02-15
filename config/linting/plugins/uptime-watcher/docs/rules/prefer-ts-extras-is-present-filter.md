# Prefer ts-extras isPresent in filter callbacks

Require `isPresent` from `ts-extras` in `Array.prototype.filter` callbacks instead of inline nullish checks.

## What it checks

- `filter((value) => value != null)`
- `filter((value): value is T => value !== null)`
- `filter((value): value is T => value !== null && value !== undefined)`

## Why

`isPresent` makes nullish filtering explicit and reusable while preserving strong narrowing to `NonNullable<T>` without repeating ad-hoc callback logic.
