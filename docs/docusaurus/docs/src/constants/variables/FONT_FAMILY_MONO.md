# Variable: FONT\_FAMILY\_MONO

> `const` **FONT\_FAMILY\_MONO**: `string`[]

Defined in: [src/constants.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/constants.ts#L87)

Font family constants for monospace text display.

## Remarks

Monospace fonts prioritize consistent character width for code display, data
tables, and other content where alignment is important. The array provides
fallback fonts for cross-platform compatibility.

## Example

```typescript
const codeStyle = {
    fontFamily: FONT_FAMILY_MONO.join(", "),
};
```
