# Variable: themeManager

> `const` **themeManager**: [`ThemeManager`](../classes/ThemeManager.md)

Defined in: [src/theme/ThemeManager.ts:544](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/ThemeManager.ts#L544)

Global theme manager singleton instance.

## Remarks

Provides convenient access to theme management functionality throughout the
application. This singleton ensures consistent theme state and provides a
centralized API for theme operations.

## Example

```typescript
import { themeManager } from "./ThemeManager";

// Apply a theme
const theme = themeManager.getTheme("dark");
themeManager.applyTheme(theme);

// Listen for system theme changes
const cleanup = themeManager.onSystemThemeChange((isDark) => {
    console.log("System theme changed:", isDark ? "dark" : "light");
});
```
