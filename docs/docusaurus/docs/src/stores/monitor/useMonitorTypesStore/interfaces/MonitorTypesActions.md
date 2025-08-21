# Interface: MonitorTypesActions

Defined in: [src/stores/monitor/useMonitorTypesStore.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/monitor/useMonitorTypesStore.ts#L71)

Monitor Types store actions interface.

## Remarks

Defines all actions available for monitor type management including:

- Loading and caching monitor type configurations
- Validating monitor data against type schemas
- Formatting monitor details and titles
- Managing field configurations for dynamic forms

All actions provide consistent error handling and logging through the
centralized error management system.

## Properties

### formatMonitorDetail()

> **formatMonitorDetail**: (`type`, `details`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [src/stores/monitor/useMonitorTypesStore.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/monitor/useMonitorTypesStore.ts#L84)

Formats monitor detail text using backend registry.

#### Parameters

##### type

`string`

The monitor type identifier

##### details

`string`

Raw detail text to format

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Promise resolving to formatted detail text

#### Remarks

Uses the backend monitor type registry to format detail text according to
type-specific rules and conventions.

***

### formatMonitorTitleSuffix()

> **formatMonitorTitleSuffix**: (`type`, `monitor`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [src/stores/monitor/useMonitorTypesStore.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/monitor/useMonitorTypesStore.ts#L99)

Generates formatted title suffix for a monitor.

#### Parameters

##### type

`string`

The monitor type identifier

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration object

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Promise resolving to formatted title suffix

#### Remarks

Creates a descriptive suffix for monitor titles based on the monitor type
and configuration. Used in UI displays to provide context about the
monitor's target.

***

### getFieldConfig()

> **getFieldConfig**: (`type`) => `undefined` \| [`MonitorFieldDefinition`](../../../../../shared/types/interfaces/MonitorFieldDefinition.md)[]

Defined in: [src/stores/monitor/useMonitorTypesStore.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/monitor/useMonitorTypesStore.ts#L115)

Retrieves field configuration for a specific monitor type.

#### Parameters

##### type

The monitor type to get fields for

`"http"` | `"port"` | `"ping"` | `"dns"`

#### Returns

`undefined` \| [`MonitorFieldDefinition`](../../../../../shared/types/interfaces/MonitorFieldDefinition.md)[]

Field configuration or undefined if type not found

#### Remarks

Gets the field definitions used by dynamic form components to render
monitor-specific input fields.

***

### loadMonitorTypes()

> **loadMonitorTypes**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/monitor/useMonitorTypesStore.ts:131](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/monitor/useMonitorTypesStore.ts#L131)

Loads all available monitor type configurations from backend.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when loading is complete

#### Remarks

Fetches monitor type definitions from the backend registry and caches
them in the store. This includes field configurations, validation
schemas, and UI metadata for each monitor type.

Uses `safeExtractIpcData` for robust IPC response handling.

***

### refreshMonitorTypes()

> **refreshMonitorTypes**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/monitor/useMonitorTypesStore.ts:143](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/monitor/useMonitorTypesStore.ts#L143)

Clears monitor types cache and reloads from backend.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when refresh is complete

#### Remarks

Forces a fresh load of monitor type configurations from the backend,
bypassing any cached data. Useful for development or when types may have
changed.

***

### validateMonitorData()

> **validateMonitorData**: (`type`, `data`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../../../../../shared/types/validation/interfaces/ValidationResult.md)\>

Defined in: [src/stores/monitor/useMonitorTypesStore.ts:158](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/monitor/useMonitorTypesStore.ts#L158)

Validates monitor data against type-specific schema.

#### Parameters

##### type

`string`

The monitor type to validate against

##### data

`unknown`

The monitor data to validate

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ValidationResult`](../../../../../shared/types/validation/interfaces/ValidationResult.md)\>

Promise resolving to validation result

#### Remarks

Performs comprehensive validation of monitor configuration data using the
backend validation registry. Returns detailed validation results
including success status, errors, and metadata.
