# Errors: Ensure error in catch

Rule ID: `uptime-watcher/require-ensure-error-in-catch`

## Summary

Require `ensureError(...)` before accessing properties on a caught `unknown` error.

## Options

This rule has no options.

## Examples

### Incorrect

```ts
try {
    throw new Error("boom");
} catch (error) {
    console.log(error.message);
}
```

### Correct

```ts
try {
    throw new Error("boom");
} catch (error) {
    ensureError(error);
    console.log(error.message);
}
```
