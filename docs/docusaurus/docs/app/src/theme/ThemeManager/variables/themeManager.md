# Variable: themeManager

> `const` **themeManager**: [`ThemeManager`](../classes/ThemeManager.md)

Defined in: [src/theme/ThemeManager.ts:309](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/theme/ThemeManager.ts#L309)

Global theme manager singleton instance.

## Remarks

Provides convenient access to theme management functionality throughout
the application. This singleton ensures consistent theme state and
provides a centralized API for theme operations.

## Example

```typescript
import { themeManager } from './ThemeManager';

// Apply a theme
const theme = themeManager.getTheme('dark');
themeManager.applyTheme(theme);

// Listen for system theme changes
const cleanup = themeManager.onSystemThemeChange((isDark) => {
  console.log('System theme changed:', isDark ? 'dark' : 'light');
});
```
