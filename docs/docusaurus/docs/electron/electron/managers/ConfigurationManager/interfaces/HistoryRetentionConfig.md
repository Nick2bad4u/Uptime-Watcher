# Interface: HistoryRetentionConfig

Defined in: [electron/managers/ConfigurationManager.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/ConfigurationManager.ts#L26)

Describes the configuration for history retention limits.

## Remarks

Used by [ConfigurationManager.getHistoryRetentionRules](../classes/ConfigurationManager.md#gethistoryretentionrules) to specify allowed history limits.

## Properties

### defaultLimit

> **defaultLimit**: `number`

Defined in: [electron/managers/ConfigurationManager.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/ConfigurationManager.ts#L32)

The default history retention limit.

#### Default Value

```ts
DEFAULT_HISTORY_LIMIT
```

***

### maxLimit

> **maxLimit**: `number`

Defined in: [electron/managers/ConfigurationManager.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/ConfigurationManager.ts#L38)

The maximum allowed history retention limit.

#### Default Value

```ts
Number.MAX_SAFE_INTEGER
```

***

### minLimit

> **minLimit**: `number`

Defined in: [electron/managers/ConfigurationManager.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/ConfigurationManager.ts#L44)

The minimum allowed history retention limit.

#### Default Value

```ts
25
```
