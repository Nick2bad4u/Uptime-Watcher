# Renderer: renderer-no-process-env

Disallows using `process.env` in renderer code (`src/**`).

## Why

In the renderer, `process.env` is not a reliable configuration mechanism:

- With Node integration disabled, `process` may not exist.
- With bundlers, `process.env` is often a shim and can differ between dev/prod.

This project should use:

- `import.meta.env` for build-time configuration (Vite), or
- preload + IPC for runtime configuration.

## Options

No options.

## Examples

### Incorrect

```ts
if (process.env.NODE_ENV === "production") {
  // ...
}
```

### Correct

```ts
if (import.meta.env.MODE === "production") {
  // ...
}
```
