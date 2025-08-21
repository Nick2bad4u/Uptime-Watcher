# Interface: MonitorTypeDisplayCommons

Defined in: [shared/types/monitorTypes.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L63)

Common display configuration for monitor types.

## Remarks

Provides display-related preferences that can be used to control how monitor
types are presented in the UI.

## Properties

### display?

> `optional` **display**: `object`

Defined in: [shared/types/monitorTypes.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/monitorTypes.ts#L70)

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
