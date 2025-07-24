# Interface: MigrationRule

Defined in: [electron/services/monitoring/MigrationSystem.ts:8](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MigrationSystem.ts#L8)

## Properties

### description

> **description**: `string`

Defined in: [electron/services/monitoring/MigrationSystem.ts:9](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MigrationSystem.ts#L9)

***

### fromVersion

> **fromVersion**: `string`

Defined in: [electron/services/monitoring/MigrationSystem.ts:10](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MigrationSystem.ts#L10)

***

### isBreaking

> **isBreaking**: `boolean`

Defined in: [electron/services/monitoring/MigrationSystem.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MigrationSystem.ts#L11)

***

### toVersion

> **toVersion**: `string`

Defined in: [electron/services/monitoring/MigrationSystem.ts:12](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MigrationSystem.ts#L12)

***

### transform()

> **transform**: (`data`) => `Promise`\<`Record`\<`string`, `unknown`\>\>

Defined in: [electron/services/monitoring/MigrationSystem.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MigrationSystem.ts#L13)

#### Parameters

##### data

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`Record`\<`string`, `unknown`\>\>
