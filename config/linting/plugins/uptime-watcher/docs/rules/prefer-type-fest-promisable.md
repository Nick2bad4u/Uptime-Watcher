# Prefer TypeFest Promisable

Require TypeFest `Promisable<T>` for sync-or-async callback contracts currently expressed as `Promise<T> | T` unions.

## What it checks

- Type unions shaped like `Promise<T> | T` in architecture-critical runtime layers.

## Why

`Promisable<T>` communicates intent directly, keeps callback contracts consistent, and avoids repeating equivalent sync-or-async unions throughout the codebase.
