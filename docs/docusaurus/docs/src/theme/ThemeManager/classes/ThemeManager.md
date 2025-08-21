# Class: ThemeManager

Defined in: [src/theme/ThemeManager.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/ThemeManager.ts#L25)

Singleton service for managing application themes. Handles theme selection,
system preference detection, and automatic switching.

## Constructors

### Constructor

> **new ThemeManager**(): `ThemeManager`

#### Returns

`ThemeManager`

## Methods

### applyTheme()

> **applyTheme**(`theme`): `void`

Defined in: [src/theme/ThemeManager.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/ThemeManager.ts#L46)

Apply theme to document - only if different from currently applied theme

#### Parameters

##### theme

[`Theme`](../../types/interfaces/Theme.md)

#### Returns

`void`

***

### getInstance()

> `static` **getInstance**(): `ThemeManager`

Defined in: [src/theme/ThemeManager.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/ThemeManager.ts#L38)

Get the singleton instance of ThemeManager. Creates the instance if it
doesn't exist.

#### Returns

`ThemeManager`

ThemeManager singleton instance

***

### createCustomTheme()

> **createCustomTheme**(`baseTheme`, `overrides`): [`Theme`](../../types/interfaces/Theme.md)

Defined in: [src/theme/ThemeManager.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/ThemeManager.ts#L98)

Create a custom theme based on an existing theme.

#### Parameters

##### baseTheme

[`Theme`](../../types/interfaces/Theme.md)

The base theme to extend from

##### overrides

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Theme`](../../types/interfaces/Theme.md)\>

Partial theme object with properties to override

#### Returns

[`Theme`](../../types/interfaces/Theme.md)

New theme with deep-merged properties

#### Remarks

This method performs a deep merge of the override properties into the
base theme, ensuring that nested objects are properly merged rather than
replaced entirely. This allows for granular customization while
preserving unmodified properties.

***

### generateCSSVariables()

> **generateCSSVariables**(`theme`): `string`

Defined in: [src/theme/ThemeManager.ts:108](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/ThemeManager.ts#L108)

Generate CSS variables string for a theme

#### Parameters

##### theme

[`Theme`](../../types/interfaces/Theme.md)

#### Returns

`string`

***

### getAvailableThemes()

> **getAvailableThemes**(): [`ThemeName`](../../types/type-aliases/ThemeName.md)[]

Defined in: [src/theme/ThemeManager.ts:129](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/ThemeManager.ts#L129)

Get all available theme names.

#### Returns

[`ThemeName`](../../types/type-aliases/ThemeName.md)[]

Array of available theme names including system

#### Remarks

Dynamically generates the list from the themes object to ensure
consistency. Always includes "system" for automatic theme detection.

***

### getSystemThemePreference()

> **getSystemThemePreference**(): `"dark"` \| `"light"`

Defined in: [src/theme/ThemeManager.ts:145](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/ThemeManager.ts#L145)

Get system theme preference from OS/browser settings. Uses CSS media
query to detect dark mode preference.

#### Returns

`"dark"` \| `"light"`

Dark if user prefers dark mode, "light" otherwise

#### Remarks

In SSR or non-browser environments where window is undefined, this method
will fallback to "light" theme as the default. This ensures safe
operation across all deployment environments.

***

### getTheme()

> **getTheme**(`name`): [`Theme`](../../types/interfaces/Theme.md)

Defined in: [src/theme/ThemeManager.ts:162](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/ThemeManager.ts#L162)

Get theme by name, with automatic system theme detection. Handles
"system" theme by detecting user's OS preference.

#### Parameters

##### name

[`ThemeName`](../../types/type-aliases/ThemeName.md)

Theme name to retrieve

#### Returns

[`Theme`](../../types/interfaces/Theme.md)

Theme object containing colors, typography, and spacing

***

### isValidThemeName()

> **isValidThemeName**(`name`): `name is ThemeName`

Defined in: [src/theme/ThemeManager.ts:175](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/ThemeManager.ts#L175)

Validate if theme name is valid

#### Parameters

##### name

`string`

#### Returns

`name is ThemeName`

***

### onSystemThemeChange()

> **onSystemThemeChange**(`callback`): () => `void`

Defined in: [src/theme/ThemeManager.ts:187](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/theme/ThemeManager.ts#L187)

Listen for system theme changes and call callback when detected. Useful
for automatic theme switching when user changes OS settings.

#### Parameters

##### callback

(`isDark`) => `void`

Function to call when system theme changes

#### Returns

Cleanup function to remove the event listener

> (): `void`

##### Returns

`void`
