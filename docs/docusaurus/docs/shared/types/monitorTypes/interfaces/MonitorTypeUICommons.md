# Interface: MonitorTypeUICommons

Defined in: [shared/types/monitorTypes.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L94)

Common UI configuration properties shared between frontend and backend
monitor types.

## Remarks

These properties provide UI hints, help texts, and feature support flags for
monitor types, enabling consistent rendering and feature gating.

## Properties

### helpTexts?

> `optional` **helpTexts**: `object`

Defined in: [shared/types/monitorTypes.ts:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L101)

Help text for form fields associated with this monitor type.

#### primary?

> `optional` **primary**: `string`

Primary help text for the main form field.

#### secondary?

> `optional` **secondary**: `string`

Secondary help text for additional context or advanced options.

#### Remarks

Used to provide contextual guidance to users configuring monitors.

***

### supportsAdvancedAnalytics?

> `optional` **supportsAdvancedAnalytics**: `boolean`

Defined in: [shared/types/monitorTypes.ts:119](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L119)

Whether this monitor type supports advanced analytics.

#### Remarks

If true, advanced analytics features may be enabled in the UI.

#### Default Value

```ts
false
```

***

### supportsResponseTime?

> `optional` **supportsResponseTime**: `boolean`

Defined in: [shared/types/monitorTypes.ts:128](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L128)

Whether this monitor type supports response time analytics.

#### Remarks

If true, response time metrics and charts may be shown in the UI.

#### Default Value

```ts
false
```
