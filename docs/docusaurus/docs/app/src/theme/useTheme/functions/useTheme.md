# Function: useTheme()

> **useTheme**(): `object`

Defined in: [src/theme/useTheme.ts:131](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/theme/useTheme.ts#L131)

Main theme hook providing comprehensive theme management functionality.

## Returns

Object containing theme state, setters, and utility functions

### availableThemes

> **availableThemes**: [`ThemeName`](../../types/type-aliases/ThemeName.md)[]

Array of all available theme names

### currentTheme

> **currentTheme**: [`Theme`](../../types/interfaces/Theme.md)

Current active theme object

### getColor()

> **getColor**: (`path`) => `string`

Get color value from dot-notation path

Get theme-aware color from a dot-notation path.

#### Parameters

##### path

`string`

Dot-notation path to the color (e.g., "colors.status.up")

#### Returns

`string`

Color value as string, or theme-aware fallback if path is invalid

#### Example

```typescript
const upColor = getColor("status.up");
const primaryBg = getColor("background.primary");
```

### getStatusColor()

> **getStatusColor**: (`status`) => `string`

Get status-specific color

Get status-specific color from the current theme.

#### Parameters

##### status

[`SiteStatus`](../../../../shared/types/type-aliases/SiteStatus.md)

Site status value

#### Returns

`string`

Status color from theme, or theme-aware fallback with warning

#### Example

```typescript
const upColor = getStatusColor("up");
const downColor = getStatusColor("down");
```

### isDark

> **isDark**: `boolean` = `currentTheme.isDark`

Whether current theme is dark mode

### setTheme()

> **setTheme**: (`themeName`) => `void`

Change active theme

Change the active theme.

#### Parameters

##### themeName

[`ThemeName`](../../types/type-aliases/ThemeName.md)

Name of the theme to activate

#### Returns

`void`

#### Example

```typescript
setTheme("dark"); // Switch to dark theme
setTheme("system"); // Use system preference
```

### systemTheme

> **systemTheme**: `"dark"` \| `"light"`

Current system theme preference

### themeManager

> **themeManager**: [`ThemeManager`](../../ThemeManager/classes/ThemeManager.md)

ThemeManager instance for advanced operations

### themeName

> **themeName**: [`ThemeName`](../../types/type-aliases/ThemeName.md) = `settings.theme`

Current theme name

### themeVersion

> **themeVersion**: `number`

Theme version for forcing re-renders

### toggleTheme()

> **toggleTheme**: () => `void`

Toggle between light and dark themes

Toggle between light and dark themes.

#### Returns

`void`

#### Remarks

Switches from current theme to its opposite (light ↔ dark).
If current theme is neither light nor dark, defaults to light.

#### Example

```typescript
toggleTheme(); // Dark theme → Light theme
```

## Remarks

This hook provides a complete theming solution with system integration,
color utilities, and automatic updates. It serves as the primary interface
for all theme-related operations throughout the application.

## See

 - ThemeManager for theme management implementation
 - [useSettingsStore](../../../stores/settings/useSettingsStore/variables/useSettingsStore.md) for settings integration

## Example

```typescript
const { isDark, toggleTheme, getStatusColor } = useTheme();

// Toggle between light and dark themes
toggleTheme();

// Get status-based colors
const upColor = getStatusColor('up');
```
