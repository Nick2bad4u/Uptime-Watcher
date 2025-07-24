# Interface: ThemeState

Defined in: [src/theme/types.ts:165](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/theme/types.ts#L165)

Theme state interface for managing active themes.
Tracks current theme selection and custom theme definitions.

## Properties

### activeTheme

> **activeTheme**: [`Theme`](Theme.md)

Defined in: [src/theme/types.ts:167](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/theme/types.ts#L167)

Currently active theme object

***

### currentTheme

> **currentTheme**: [`ThemeName`](../type-aliases/ThemeName.md)

Defined in: [src/theme/types.ts:169](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/theme/types.ts#L169)

Currently selected theme name

***

### customThemes

> **customThemes**: `Record`\<`string`, [`Theme`](Theme.md)\>

Defined in: [src/theme/types.ts:171](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/theme/types.ts#L171)

Custom user-defined themes

***

### systemThemePreference

> **systemThemePreference**: `"dark"` \| `"light"`

Defined in: [src/theme/types.ts:173](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/theme/types.ts#L173)

System theme preference (light/dark)
