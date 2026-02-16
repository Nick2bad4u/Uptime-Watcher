# Prefer ts-extras objectHasOwn

Require `objectHasOwn` from `ts-extras` over `Object.hasOwn` when a runtime own-property guard is actually needed.

## What it checks

- Calls to `Object.hasOwn(...)` in runtime source files and typed rule fixtures.
- The rule intentionally skips checks that are statically redundant (for example, checking a required key on a fully-known record shape).

## Why

`objectHasOwn` is a type guard that narrows the object to include the checked property. This makes downstream access safer and reduces manual casts after own-property checks.

When the guard is already provably unnecessary, this rule stays quiet so it does not encourage keeping incorrect or redundant guard logic.
