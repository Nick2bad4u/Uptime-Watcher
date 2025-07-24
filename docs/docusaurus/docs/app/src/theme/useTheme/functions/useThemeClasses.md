# Function: useThemeClasses()

> **useThemeClasses**(): `object`

Defined in: [src/theme/useTheme.ts:218](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/theme/useTheme.ts#L218)

Hook for theme-aware CSS classes using CSS custom properties.
Provides utility functions for generating dynamic CSS classes based on the current theme.

## Returns

`object`

Object with methods for generating background, text, and status classes

### getBackgroundClass()

> **getBackgroundClass**: (`variant`) => `object`

#### Parameters

##### variant

`"primary"` | `"secondary"` | `"tertiary"`

#### Returns

`object`

##### backgroundColor

> **backgroundColor**: `string`

### getBorderClass()

> **getBorderClass**: (`variant`) => `object`

#### Parameters

##### variant

`"focus"` | `"primary"` | `"secondary"`

#### Returns

`object`

##### borderColor

> **borderColor**: `string`

### getColor()

> **getColor**: (`path`) => `string`

#### Parameters

##### path

`string`

#### Returns

`string`

### getStatusClass()

> **getStatusClass**: (`status`) => `object`

#### Parameters

##### status

`"down"` | `"paused"` | `"pending"` | `"up"` | `"mixed"` | `"unknown"`

#### Returns

`object`

##### color

> **color**: `string`

### getSurfaceClass()

> **getSurfaceClass**: (`variant`) => `object`

#### Parameters

##### variant

`"base"` | `"elevated"` | `"overlay"`

#### Returns

`object`

##### backgroundColor

> **backgroundColor**: `string`

### getTextClass()

> **getTextClass**: (`variant`) => `object`

#### Parameters

##### variant

`"primary"` | `"secondary"` | `"inverse"` | `"tertiary"`

#### Returns

`object`

##### color

> **color**: `string`
