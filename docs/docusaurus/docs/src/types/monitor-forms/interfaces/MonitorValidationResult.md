# ~~Interface: MonitorValidationResult~~

Defined in: [src/types/monitor-forms.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L73)

Monitor validation result with specific error types

## Deprecated

Use ValidationResult from unified validation system instead

## See

ValidationResult in shared/types/validation.ts

## Properties

### ~~errors~~

> **errors**: `string`[]

Defined in: [src/types/monitor-forms.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L75)

Array of error messages

***

### ~~metadata~~

> **metadata**: `object`

Defined in: [src/types/monitor-forms.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L77)

Additional validation metadata

#### ~~monitorType~~

> **monitorType**: `"http"` \| `"port"` \| `"ping"` \| `"dns"`

Monitor type being validated

#### ~~timestamp~~

> **timestamp**: `number`

Validation timestamp

#### ~~validatedFields~~

> **validatedFields**: `string`[]

Fields that were validated

***

### ~~success~~

> **success**: `boolean`

Defined in: [src/types/monitor-forms.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L86)

Whether validation passed

***

### ~~warnings~~

> **warnings**: `string`[]

Defined in: [src/types/monitor-forms.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L88)

Array of warning messages
