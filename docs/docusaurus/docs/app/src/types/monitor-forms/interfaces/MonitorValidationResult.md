# Interface: MonitorValidationResult

Defined in: [src/types/monitor-forms.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/monitor-forms.ts#L74)

Monitor validation result with specific error types

## Properties

### errors

> **errors**: `string`[]

Defined in: [src/types/monitor-forms.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/monitor-forms.ts#L76)

Array of error messages

***

### metadata

> **metadata**: `object`

Defined in: [src/types/monitor-forms.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/monitor-forms.ts#L78)

Additional validation metadata

#### monitorType

> **monitorType**: `"http"` \| `"port"`

Monitor type being validated

#### timestamp

> **timestamp**: `number`

Validation timestamp

#### validatedFields

> **validatedFields**: `string`[]

Fields that were validated

***

### success

> **success**: `boolean`

Defined in: [src/types/monitor-forms.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/monitor-forms.ts#L87)

Whether validation passed

***

### warnings

> **warnings**: `string`[]

Defined in: [src/types/monitor-forms.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/monitor-forms.ts#L89)

Array of warning messages
