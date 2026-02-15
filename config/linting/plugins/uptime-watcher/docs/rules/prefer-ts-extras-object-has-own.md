# Prefer ts-extras objectHasOwn

Require `objectHasOwn` from `ts-extras` over `Object.hasOwn` when checking own properties.

## What it checks

- Calls to `Object.hasOwn(...)` in runtime source files and typed rule fixtures.

## Why

`objectHasOwn` is a type guard that narrows the object to include the checked property. This makes downstream access safer and reduces manual casts after own-property checks.
