# Interface: MonitorTypeUICommons

Defined in: [shared/types/monitorTypes.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/monitorTypes.ts#L46)

Common UI configuration properties shared between frontend and backend monitor types.

## Remarks

These properties provide UI hints, help texts, and feature support flags
for monitor types, enabling consistent rendering and feature gating.

## Properties

### helpTexts?

> `optional` **helpTexts**: `object`

Defined in: [shared/types/monitorTypes.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/monitorTypes.ts#L53)

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

Defined in: [shared/types/monitorTypes.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/monitorTypes.ts#L70)

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

Defined in: [shared/types/monitorTypes.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/monitorTypes.ts#L78)

Whether this monitor type supports response time analytics.

#### Remarks

If true, response time metrics and charts may be shown in the UI.

#### Default Value

```ts
false
```
