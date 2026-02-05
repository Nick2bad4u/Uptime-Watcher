# Identifiers: No call identifiers

Rule ID: `uptime-watcher/no-call-identifiers`

## Summary

Disallow calling certain identifiers directly to enforce use of canonical wrappers.

## Options

This rule is configurable.

### `{ banned }`

- **Type:** `Array<{ name: string; message?: string }>`
- **Default:** `[]`

Each entry bans calling an identifier by name, both for:

- direct calls: `danger()`
- member calls: `utils.danger()` (bans the property name)

If `message` is provided, it will be appended to the lint error to explain
which canonical helper should be used instead.

#### Example

```js
{
    "uptime-watcher/no-call-identifiers": [
        "error",
        {
            banned: [
                {
                    name: "danger",
                    message: "Use safeDanger() from @shared/utils/...",
                },
            ],
        },
    ],
}
```
