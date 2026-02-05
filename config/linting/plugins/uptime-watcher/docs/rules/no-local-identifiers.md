# Identifiers: No local duplicates

Rule ID: `uptime-watcher/no-local-identifiers`

## Summary

Disallow local re-declarations of certain canonical identifiers to prevent drift.

## Options

This rule is configurable.

### `{ banned }`

- **Type:** `Array<{ name: string; message?: string; kinds?: Array<"function" | "variable"> }>`
- **Default:** `[]`

Each entry bans declaring an identifier locally as either a function and/or a
variable. If `kinds` is omitted, both are banned.

If `message` is provided, it will be appended to the lint error to explain what
to import instead.

#### Example

```js
{

    "uptime-watcher/no-local-identifiers": [
        "error",
        {
            banned: [
                {
                    name: "ensureError",
                    kinds: ["function"],
                    message: "Import ensureError from @shared/utils/errorHandling instead.",
                },
            ],
        },
    ],
}
```
