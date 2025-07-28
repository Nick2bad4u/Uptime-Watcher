# Function: useThemeClasses()

> **useThemeClasses**(): `object`

Defined in: [src/theme/useTheme.ts:288](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/theme/useTheme.ts#L288)

Hook for theme-aware CSS classes using CSS custom properties.
Provides utility functions for generating dynamic CSS classes based on the current theme.

## Returns

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
