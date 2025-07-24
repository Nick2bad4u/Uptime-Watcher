# Class: ThemeManager

Defined in: [src/theme/ThemeManager.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/theme/ThemeManager.ts#L15)

Singleton service for managing application themes.
Handles theme selection, system preference detection, and automatic switching.

## Constructors

### Constructor

> **new ThemeManager**(): `ThemeManager`

#### Returns

`ThemeManager`

## Methods

### applyTheme()

> **applyTheme**(`theme`): `void`

Defined in: [src/theme/ThemeManager.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/theme/ThemeManager.ts#L33)

Apply theme to document

#### Parameters

##### theme

[`Theme`](../../types/interfaces/Theme.md)

#### Returns

`void`

***

### createCustomTheme()

> **createCustomTheme**(`baseTheme`, `overrides`): [`Theme`](../../types/interfaces/Theme.md)

Defined in: [src/theme/ThemeManager.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/theme/ThemeManager.ts#L51)

Create a custom theme based on an existing theme

#### Parameters

##### baseTheme

[`Theme`](../../types/interfaces/Theme.md)

##### overrides

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Theme`](../../types/interfaces/Theme.md)\>

#### Returns

[`Theme`](../../types/interfaces/Theme.md)

***

### generateCSSVariables()

> **generateCSSVariables**(`theme`): `string`

Defined in: [src/theme/ThemeManager.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/theme/ThemeManager.ts#L81)

Generate CSS variables string for a theme

#### Parameters

##### theme

[`Theme`](../../types/interfaces/Theme.md)

#### Returns

`string`

***

### getAvailableThemes()

> **getAvailableThemes**(): [`ThemeName`](../../types/type-aliases/ThemeName.md)[]

Defined in: [src/theme/ThemeManager.ts:129](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/theme/ThemeManager.ts#L129)

Get all available theme names

#### Returns

[`ThemeName`](../../types/type-aliases/ThemeName.md)[]

***

### getSystemThemePreference()

> **getSystemThemePreference**(): `"dark"` \| `"light"`

Defined in: [src/theme/ThemeManager.ts:139](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/theme/ThemeManager.ts#L139)

Get system theme preference from OS/browser settings.
Uses CSS media query to detect dark mode preference.

#### Returns

`"dark"` \| `"light"`

"dark" if user prefers dark mode, "light" otherwise

***

### getTheme()

> **getTheme**(`name`): [`Theme`](../../types/interfaces/Theme.md)

Defined in: [src/theme/ThemeManager.ts:153](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/theme/ThemeManager.ts#L153)

Get theme by name, with automatic system theme detection.
Handles "system" theme by detecting user's OS preference.

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

Defined in: [src/theme/ThemeManager.ts:166](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/theme/ThemeManager.ts#L166)

Validate if theme name is valid

#### Parameters

##### name

`string`

#### Returns

`name is ThemeName`

***

### onSystemThemeChange()

> **onSystemThemeChange**(`callback`): () => `void`

Defined in: [src/theme/ThemeManager.ts:177](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/theme/ThemeManager.ts#L177)

Listen for system theme changes and call callback when detected.
Useful for automatic theme switching when user changes OS settings.

#### Parameters

##### callback

(`isDark`) => `void`

Function to call when system theme changes

#### Returns

Cleanup function to remove the event listener

> (): `void`

##### Returns

`void`

***

### getInstance()

> `static` **getInstance**(): `ThemeManager`

Defined in: [src/theme/ThemeManager.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/theme/ThemeManager.ts#L25)

Get the singleton instance of ThemeManager.
Creates the instance if it doesn't exist.

#### Returns

`ThemeManager`

ThemeManager singleton instance
