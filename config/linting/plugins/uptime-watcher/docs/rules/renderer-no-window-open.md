# Renderer: No window\.open()

Rule ID: `uptime-watcher/renderer-no-window-open`

## Summary

Disallow `window.open(...)` in renderer (React) runtime code.

## Options

This rule has no options.

## Examples

### Incorrect

```ts
window.open("https://example.com");
```

### Correct

```ts
window.location.href = "https://example.com";
```
