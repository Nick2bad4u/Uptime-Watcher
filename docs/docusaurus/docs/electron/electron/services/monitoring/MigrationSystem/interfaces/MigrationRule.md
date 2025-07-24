# Interface: MigrationRule

Defined in: [electron/services/monitoring/MigrationSystem.ts:8](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/MigrationSystem.ts#L8)

## Properties

### description

> **description**: `string`

Defined in: [electron/services/monitoring/MigrationSystem.ts:9](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/MigrationSystem.ts#L9)

***

### fromVersion

> **fromVersion**: `string`

Defined in: [electron/services/monitoring/MigrationSystem.ts:10](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/MigrationSystem.ts#L10)

***

### isBreaking

> **isBreaking**: `boolean`

Defined in: [electron/services/monitoring/MigrationSystem.ts:11](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/MigrationSystem.ts#L11)

***

### toVersion

> **toVersion**: `string`

Defined in: [electron/services/monitoring/MigrationSystem.ts:12](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/MigrationSystem.ts#L12)

***

### transform()

> **transform**: (`data`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>

Defined in: [electron/services/monitoring/MigrationSystem.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/MigrationSystem.ts#L13)

#### Parameters

##### data

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>\>
