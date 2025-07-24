# Class: SettingsRepository

Defined in: [electron/services/database/SettingsRepository.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/SettingsRepository.ts#L17)

Repository for managing application settings persistence.
Handles CRUD operations for settings in the database.

## Constructors

### Constructor

> **new SettingsRepository**(`dependencies`): `SettingsRepository`

Defined in: [electron/services/database/SettingsRepository.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/SettingsRepository.ts#L20)

#### Parameters

##### dependencies

[`SettingsRepositoryDependencies`](../interfaces/SettingsRepositoryDependencies.md)

#### Returns

`SettingsRepository`

## Methods

### bulkInsert()

> **bulkInsert**(`settings`): `Promise`\<`void`\>

Defined in: [electron/services/database/SettingsRepository.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/SettingsRepository.ts#L28)

Bulk insert settings (for import functionality).
Uses a prepared statement and transaction for better performance.

#### Parameters

##### settings

`Record`\<`string`, `string`\>

#### Returns

`Promise`\<`void`\>

***

### bulkInsertInternal()

> **bulkInsertInternal**(`db`, `settings`): `void`

Defined in: [electron/services/database/SettingsRepository.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/SettingsRepository.ts#L64)

Internal method to bulk insert settings within an existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction)

##### settings

`Record`\<`string`, `string`\>

Key-value pairs to insert

#### Returns

`void`

#### Throws

Error When database operations fail

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction context.

**Error Handling**: Uses prepared statements which may throw on constraint violations
or database errors. All exceptions are propagated to the calling transaction context
for proper rollback handling.

**Performance**: Uses prepared statements for optimal bulk insert performance.

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: [electron/services/database/SettingsRepository.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/SettingsRepository.ts#L87)

Delete a setting by key.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteAll()

> **deleteAll**(): `Promise`\<`void`\>

Defined in: [electron/services/database/SettingsRepository.ts:104](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/SettingsRepository.ts#L104)

Clear all settings from the database.

#### Returns

`Promise`\<`void`\>

***

### deleteAllInternal()

> **deleteAllInternal**(`db`): `void`

Defined in: [electron/services/database/SettingsRepository.ts:117](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/SettingsRepository.ts#L117)

Internal method to clear all settings from the database within an existing transaction.
Use this method when you're already within a transaction context.

#### Parameters

##### db

`Database`

#### Returns

`void`

***

### deleteInternal()

> **deleteInternal**(`db`, `key`): `void`

Defined in: [electron/services/database/SettingsRepository.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/SettingsRepository.ts#L126)

Internal method to delete a setting by key within an existing transaction.
Use this method when you're already within a transaction context.

#### Parameters

##### db

`Database`

##### key

`string`

#### Returns

`void`

***

### get()

> **get**(`key`): `Promise`\<`undefined` \| `string`\>

Defined in: [electron/services/database/SettingsRepository.ts:139](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/SettingsRepository.ts#L139)

Get a setting by key.

#### Parameters

##### key

`string`

Setting key to retrieve

#### Returns

`Promise`\<`undefined` \| `string`\>

Promise resolving to setting value or undefined if not found

***

### getAll()

> **getAll**(): `Promise`\<`Record`\<`string`, `string`\>\>

Defined in: [electron/services/database/SettingsRepository.ts:159](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/SettingsRepository.ts#L159)

Get all settings.

#### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

Promise resolving to all settings as key-value pairs

#### Remarks

**Performance Note**: Settings tables are typically small (under 100 entries) by design.
No pagination is needed as settings are configuration data, not user-generated content.
If settings grow beyond expected size, consider splitting into separate configuration domains.

***

### set()

> **set**(`key`, `value`): `Promise`\<`void`\>

Defined in: [electron/services/database/SettingsRepository.ts:177](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/SettingsRepository.ts#L177)

Set a setting value.

#### Parameters

##### key

`string`

Setting key to set

##### value

`string`

Setting value to store

#### Returns

`Promise`\<`void`\>

Promise that resolves when setting is saved

#### Throws

Error When database operation fails

***

### setInternal()

> **setInternal**(`db`, `key`, `value`): `void`

Defined in: [electron/services/database/SettingsRepository.ts:195](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/SettingsRepository.ts#L195)

Internal method to set a setting value within an existing transaction.
Use this method when you're already within a transaction context.

#### Parameters

##### db

`Database`

##### key

`string`

##### value

`string`

#### Returns

`void`
