# Interface: UseMonitorFieldsResult

Defined in: [src/hooks/useMonitorFields.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/useMonitorFields.ts#L52)

Result interface for the useMonitorFields hook

## Properties

### error?

> `optional` **error**: `string`

Defined in: [src/hooks/useMonitorFields.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/useMonitorFields.ts#L54)

Error message if loading failed

***

### getFields()

> **getFields**: (`monitorType`) => [`MonitorFieldDefinition`](../../../../shared/types/interfaces/MonitorFieldDefinition.md)[]

Defined in: [src/hooks/useMonitorFields.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/useMonitorFields.ts#L56)

Get field definitions for a specific monitor type

#### Parameters

##### monitorType

`string`

#### Returns

[`MonitorFieldDefinition`](../../../../shared/types/interfaces/MonitorFieldDefinition.md)[]

***

### getRequiredFields()

> **getRequiredFields**: (`monitorType`) => `string`[]

Defined in: [src/hooks/useMonitorFields.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/useMonitorFields.ts#L58)

Get required fields for a specific monitor type

#### Parameters

##### monitorType

`string`

#### Returns

`string`[]

***

### isFieldRequired()

> **isFieldRequired**: (`monitorType`, `fieldName`) => `boolean`

Defined in: [src/hooks/useMonitorFields.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/useMonitorFields.ts#L60)

Check if a field is required for a monitor type

#### Parameters

##### monitorType

`string`

##### fieldName

`string`

#### Returns

`boolean`

***

### isLoaded

> **isLoaded**: `boolean`

Defined in: [src/hooks/useMonitorFields.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/useMonitorFields.ts#L62)

Whether field definitions are loaded
