# Interface: UseMonitorFieldsResult

Defined in: [src/hooks/useMonitorFields.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/useMonitorFields.ts#L17)

Result interface for the useMonitorFields hook

## Properties

### getFields()

> **getFields**: (`monitorType`) => [`MonitorFieldDefinition`](../../../../shared/types/interfaces/MonitorFieldDefinition.md)[]

Defined in: [src/hooks/useMonitorFields.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/useMonitorFields.ts#L19)

Get field definitions for a specific monitor type

#### Parameters

##### monitorType

`string`

#### Returns

[`MonitorFieldDefinition`](../../../../shared/types/interfaces/MonitorFieldDefinition.md)[]

***

### getRequiredFields()

> **getRequiredFields**: (`monitorType`) => `string`[]

Defined in: [src/hooks/useMonitorFields.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/useMonitorFields.ts#L21)

Get required fields for a specific monitor type

#### Parameters

##### monitorType

`string`

#### Returns

`string`[]

***

### isFieldRequired()

> **isFieldRequired**: (`monitorType`, `fieldName`) => `boolean`

Defined in: [src/hooks/useMonitorFields.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/useMonitorFields.ts#L23)

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

Defined in: [src/hooks/useMonitorFields.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/useMonitorFields.ts#L25)

Whether field definitions are loaded
