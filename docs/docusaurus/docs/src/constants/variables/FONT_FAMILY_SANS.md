# Variable: FONT\_FAMILY\_SANS

> `const` **FONT\_FAMILY\_SANS**: `string`[]

Defined in: [src/constants.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/constants.ts#L114)

Sans-serif font family constants for general UI text.

## Remarks

Provides a modern, readable font stack for body text and UI elements. The
fallback chain ensures consistent display across different operating systems
and environments. Prioritizes system fonts for optimal performance and native
appearance.

## Example

```typescript
const textStyle = {
    fontFamily: FONT_FAMILY_SANS.join(", "),
};
```
