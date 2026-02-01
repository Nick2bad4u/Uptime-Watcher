# Electron: No console

Rule ID: `uptime-watcher/electron-no-console`

## Summary

Disallow `console.*` usage in Electron runtime code and require the shared logger utilities instead.

## Options

This rule has no options.

## Examples

### Incorrect

```ts
console.log("started");
```

### Correct

```ts
logger.info("started");
```
