# Function: deepMergeTheme()

> **deepMergeTheme**(`baseTheme`, `overrides`): [`Theme`](../../../types/interfaces/Theme.md)

Defined in: [src/theme/utils/themeMerging.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/utils/themeMerging.ts#L99)

Deep merge themes with proper type safety and nested object handling.
Performs deep merging of nested objects like colors, typography, and spacing
to ensure that only specified properties are overridden while preserving all
other base theme properties.

## Parameters

### baseTheme

[`Theme`](../../../types/interfaces/Theme.md)

The base theme to start with

### overrides

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Theme`](../../../types/interfaces/Theme.md)\>

Partial theme object with overrides to apply

## Returns

[`Theme`](../../../types/interfaces/Theme.md)

Merged theme with deep object merging applied

## Remarks

This utility handles all nested theme objects including:

- Colors (with all sub-categories)
- Typography (with font properties)
- Spacing, shadows, borderRadius

## Example

```typescript
const customTheme = deepMergeTheme(baseTheme, {
    colors: {
        primary: { main: "#custom-color" },
    },
});
```
