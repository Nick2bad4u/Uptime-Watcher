# Interface: HistoryRetentionConfig

Defined in: [electron/managers/ConfigurationManager.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L79)

Describes the configuration for history retention limits.

## Remarks

Used by [ConfigurationManager.getHistoryRetentionRules](../classes/ConfigurationManager.md#gethistoryretentionrules) to specify
allowed history limits.

## Properties

### defaultLimit

> **defaultLimit**: `number`

Defined in: [electron/managers/ConfigurationManager.ts:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L85)

The default history retention limit.

#### Default Value

```ts
DEFAULT_HISTORY_LIMIT
```

***

### maxLimit

> **maxLimit**: `number`

Defined in: [electron/managers/ConfigurationManager.ts:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L91)

The maximum allowed history retention limit.

#### Default Value

```ts
Number.MAX_SAFE_INTEGER
```

***

### minLimit

> **minLimit**: `number`

Defined in: [electron/managers/ConfigurationManager.ts:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/ConfigurationManager.ts#L97)

The minimum allowed history retention limit.

#### Default Value

```ts
25
```
