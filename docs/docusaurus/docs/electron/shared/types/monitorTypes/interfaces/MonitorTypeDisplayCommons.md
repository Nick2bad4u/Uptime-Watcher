# Interface: MonitorTypeDisplayCommons

Defined in: [shared/types/monitorTypes.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/monitorTypes.ts#L16)

Common display configuration for monitor types.

## Remarks

Provides display-related preferences that can be used to control
how monitor types are presented in the UI.

## Properties

### display?

> `optional` **display**: `object`

Defined in: [shared/types/monitorTypes.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/monitorTypes.ts#L23)

Display preferences for the monitor type.

#### showAdvancedMetrics?

> `optional` **showAdvancedMetrics**: `boolean`

Whether to show advanced metrics for this monitor type.

##### Default Value

```ts
false
```

#### showUrl?

> `optional` **showUrl**: `boolean`

Whether to display the monitored URL in the UI.

##### Default Value

```ts
true
```

#### Remarks

Controls visibility of advanced metrics and URL display in the UI.
