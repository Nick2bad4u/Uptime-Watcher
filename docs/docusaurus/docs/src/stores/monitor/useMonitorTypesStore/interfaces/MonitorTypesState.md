# Interface: MonitorTypesState

Defined in: [src/stores/monitor/useMonitorTypesStore.ts:179](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/monitor/useMonitorTypesStore.ts#L179)

Monitor Types store state interface.

## Remarks

Defines the state structure for monitor type management including:

- Cached monitor type configurations
- Field configurations mapped by type for efficient access
- Loading state to prevent duplicate operations

The state is designed to provide fast access to monitor type information
while maintaining consistency with backend data.

## Properties

### fieldConfigs

> **fieldConfigs**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, [`MonitorTypeConfig`](../../../../../shared/types/monitorTypes/interfaces/MonitorTypeConfig.md)\[`"fields"`\]\>

Defined in: [src/stores/monitor/useMonitorTypesStore.ts:188](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/monitor/useMonitorTypesStore.ts#L188)

Field configurations mapped by monitor type.

#### Remarks

Provides efficient access to field definitions for dynamic form
rendering. Each monitor type maps to its specific field configuration
array.

***

### isLoaded

> **isLoaded**: `boolean`

Defined in: [src/stores/monitor/useMonitorTypesStore.ts:197](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/monitor/useMonitorTypesStore.ts#L197)

Flag indicating whether monitor types have been loaded.

#### Remarks

Used to prevent duplicate loading operations and to show appropriate
loading states in the UI.

***

### monitorTypes

> **monitorTypes**: [`MonitorTypeConfig`](../../../../../shared/types/monitorTypes/interfaces/MonitorTypeConfig.md)[]

Defined in: [src/stores/monitor/useMonitorTypesStore.ts:207](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/monitor/useMonitorTypesStore.ts#L207)

Array of all available monitor type configurations.

#### Remarks

Contains the complete set of monitor type definitions loaded from the
backend registry, including metadata, field definitions, and validation
rules.
