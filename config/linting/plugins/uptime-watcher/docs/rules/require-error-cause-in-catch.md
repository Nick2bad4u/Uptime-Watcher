# Error handling: require-error-cause-in-catch

Requires `throw new Error(..., { cause })` (or other built-in Error constructors) when throwing from inside a `catch` block.

## Why

When you wrap/rethrow errors inside a `catch`, you should preserve the original error via the standard `cause` chain.
That makes logs and crash reports more actionable.

## Options

No options.

## Examples

### Incorrect

```ts
try {
  doThing();
} catch (err) {
  throw new Error("Failed to do thing");
}
```

### Correct

```ts
try {
  doThing();
} catch (err) {
  throw new Error("Failed to do thing", { cause: err });
}
```
