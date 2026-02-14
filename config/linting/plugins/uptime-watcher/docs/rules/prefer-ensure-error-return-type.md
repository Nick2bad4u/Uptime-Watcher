# Prefer Ensure Error Return Type

Companion rule for catch/error hygiene that keeps `ensureError(...)` usage strongly typed.

## What it checks

- Catch variables should resolve to `unknown`.
- Results of `ensureError(...)` should remain `Error` (inferred or explicit), not recast to unrelated assertion types.

## Why

This preserves safe narrowing boundaries and prevents unsafe recasting after normalization.
