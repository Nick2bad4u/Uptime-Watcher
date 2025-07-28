# Variable: themes

> `const` **themes**: `object`

Defined in: [src/theme/themes.ts:374](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/theme/themes.ts#L374)

Collection of all available themes in the application.

## Type declaration

### dark

> `readonly` **dark**: [`Theme`](../../types/interfaces/Theme.md) = `darkTheme`

### high-contrast

> `readonly` **high-contrast**: [`Theme`](../../types/interfaces/Theme.md) = `highContrastTheme`

### light

> `readonly` **light**: [`Theme`](../../types/interfaces/Theme.md) = `lightTheme`

## Remarks

Provides a centralized registry of all theme configurations available
for use throughout the application. Used by the ThemeManager to resolve
theme names to actual theme objects.

## Example

```typescript
import { themes } from './themes';

// Get a specific theme
const theme = themes.dark;

// List all available themes
const themeNames = Object.keys(themes);
```
