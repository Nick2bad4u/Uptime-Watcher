# Interface: MigrationRule

Defined in: [electron/services/monitoring/MigrationSystem.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L44)

Describes a migration rule for a monitor type.

## Remarks

Each migration rule transforms monitor configuration data from one version to
another. Used by the migration system to upgrade or modify monitor
configuration schemas.

## Example

```typescript
{
  description: "Add timeout field",
  fromVersion: "1.0.0",
  toVersion: "1.1.0",
  isBreaking: false,
  transform: async (data) => ({ ...data, timeout: 30000 })
}
```

## Properties

### description

> **description**: `string`

Defined in: [electron/services/monitoring/MigrationSystem.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L51)

Human-readable description of the migration.

#### Remarks

Used for logging and diagnostics.

***

### fromVersion

> **fromVersion**: `string`

Defined in: [electron/services/monitoring/MigrationSystem.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L58)

Source version for the migration.

#### Remarks

The version string this migration starts from (e.g., "1.0.0").

***

### isBreaking

> **isBreaking**: `boolean`

Defined in: [electron/services/monitoring/MigrationSystem.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L65)

Indicates if the migration is breaking.

#### Remarks

If true, migration may require user intervention or data review.

***

### toVersion

> **toVersion**: `string`

Defined in: [electron/services/monitoring/MigrationSystem.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L72)

Target version for the migration.

#### Remarks

The version string this migration upgrades to (e.g., "1.1.0").

***

### transform()

> **transform**: (`data`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [electron/services/monitoring/MigrationSystem.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L87)

Transformation function to migrate data.

#### Parameters

##### data

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

The monitor configuration data to transform.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

A promise resolving to the transformed data.

#### Remarks

Receives the monitor configuration data and returns a Promise resolving
to the transformed data. May throw if transformation fails or data is
invalid.

#### Throws

Throws if transformation fails or data is invalid.
