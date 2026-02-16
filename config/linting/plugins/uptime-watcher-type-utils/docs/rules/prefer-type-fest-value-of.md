# Prefer TypeFest ValueOf

Require TypeFest `ValueOf<T>` over direct `T[keyof T]` indexed-access unions when extracting object value unions.

## What it checks

- Type-level indexed access patterns shaped like `T[keyof T]`.

## Why

`ValueOf<T>` is clearer and more intent-revealing than repeating indexed-access unions. It also keeps value-union typing conventions consistent with other TypeFest-based utility types in the codebase.
