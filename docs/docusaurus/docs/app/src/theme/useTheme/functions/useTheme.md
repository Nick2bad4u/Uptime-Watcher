# Function: useTheme()

> **useTheme**(): `object`

Defined in: [src/theme/useTheme.ts:122](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/theme/useTheme.ts#L122)

Main theme hook providing comprehensive theme management functionality.

## Returns

`object`

Object containing theme state, setters, and utility functions

### availableThemes

> **availableThemes**: [`ThemeName`](../../types/type-aliases/ThemeName.md)[]

### currentTheme

> **currentTheme**: [`Theme`](../../types/interfaces/Theme.md)

### getColor()

> **getColor**: (`path`) => `string`

#### Parameters

##### path

`string`

#### Returns

`string`

### getStatusColor()

> **getStatusColor**: (`status`) => `string`

#### Parameters

##### status

[`SiteStatus`](../../../../shared/types/type-aliases/SiteStatus.md)

#### Returns

`string`

### isDark

> **isDark**: `boolean` = `currentTheme.isDark`

### setTheme()

> **setTheme**: (`themeName`) => `void`

#### Parameters

##### themeName

[`ThemeName`](../../types/type-aliases/ThemeName.md)

#### Returns

`void`

### systemTheme

> **systemTheme**: `"dark"` \| `"light"`

### themeManager

> **themeManager**: [`ThemeManager`](../../ThemeManager/classes/ThemeManager.md)

### themeName

> **themeName**: [`ThemeName`](../../types/type-aliases/ThemeName.md) = `settings.theme`

### themeVersion

> **themeVersion**: `number`

### toggleTheme()

> **toggleTheme**: () => `void`

#### Returns

`void`

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
