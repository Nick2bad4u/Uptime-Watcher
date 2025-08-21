# Variable: themes

> `const` **themes**: [`Themes`](../interfaces/Themes.md)

Defined in: [src/theme/themes.ts:395](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/themes.ts#L395)

Collection of all available themes in the application.

## Remarks

Provides a centralized registry of all theme configurations available for use
throughout the application. Used by the ThemeManager to resolve theme names
to actual theme objects.

## Example

```typescript
import { themes } from "./themes";

// Get a specific theme
const theme = themes.dark;

// List all available themes
const themeNames = Object.keys(themes);
```
