# Class: SettingsRepository

Defined in: [electron/services/database/SettingsRepository.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L114)

Repository for managing application settings persistence.

Handles all CRUD operations for settings in the database, following the
repository pattern.

## Remarks

All operations are wrapped in transactions and use the repository pattern for
consistency, error handling, and maintainability. This class should be used
as the sole interface for settings data access and mutation.

## Constructors

### Constructor

> **new SettingsRepository**(`dependencies`): `SettingsRepository`

Defined in: [electron/services/database/SettingsRepository.ts:302](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L302)

Constructs a new SettingsRepository instance.

#### Parameters

##### dependencies

[`SettingsRepositoryDependencies`](../interfaces/SettingsRepositoryDependencies.md)

The required dependencies for settings operations.

#### Returns

`SettingsRepository`

#### Example

```typescript
const repo = new SettingsRepository({ databaseService });
```

## Methods

### bulkInsert()

> **bulkInsert**(`settings`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/SettingsRepository.ts:136](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L136)

Bulk inserts settings (for import functionality).

#### Parameters

##### settings

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Key-value pairs to insert.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when all settings are inserted.

#### Remarks

Uses a prepared statement and transaction for better performance.

#### Example

```typescript
await repo.bulkInsert({ theme: "dark", language: "en" });
```

#### Throws

Error if the database operation fails.

***

### delete()

> **delete**(`key`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/SettingsRepository.ts:169](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L169)

Deletes a setting by key.

#### Parameters

##### key

`string`

The setting key to delete.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the setting is deleted.

#### Example

```typescript
await repo.delete("theme");
```

#### Throws

Error if the database operation fails.

***

### deleteAll()

> **deleteAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/SettingsRepository.ts:195](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L195)

Clears all settings from the database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when all settings are deleted.

#### Example

```typescript
await repo.deleteAll();
```

#### Throws

Error if the database operation fails.

***

### get()

> **get**(`key`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| `string`\>

Defined in: [electron/services/database/SettingsRepository.ts:222](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L222)

Gets a setting by key.

#### Parameters

##### key

`string`

The setting key to retrieve.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| `string`\>

A promise resolving to the setting value or `undefined` if not
  found.

#### Example

```typescript
const theme = await repo.get("theme");
```

#### Throws

Error if the database operation fails.

***

### getAll()

> **getAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>\>

Defined in: [electron/services/database/SettingsRepository.ts:251](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L251)

Gets all settings.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>\>

A promise resolving to all settings as key-value pairs.

#### Remarks

**Performance Note**: Settings tables are typically small (under 100
entries) by design. No pagination is needed as settings are configuration
data, not user-generated content. If settings grow beyond expected size,
consider splitting into separate configuration domains.

#### Example

```typescript
const allSettings = await repo.getAll();
```

#### Throws

Error if the database operation fails.

***

### set()

> **set**(`key`, `value`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/SettingsRepository.ts:278](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L278)

Sets a setting value.

#### Parameters

##### key

`string`

The setting key to set.

##### value

`string`

The setting value to store.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the setting is saved.

#### Example

```typescript
await repo.set("theme", "dark");
```

#### Throws

Error if the database operation fails.

***

### bulkInsertInternal()

> **bulkInsertInternal**(`db`, `settings`): `void`

Defined in: [electron/services/database/SettingsRepository.ts:326](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L326)

Bulk inserts settings within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active
  transaction).

##### settings

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Key-value pairs to insert.

#### Returns

`void`

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction
context.

**Error Handling**: Uses prepared statements which may throw on
constraint violations or database errors. All exceptions are propagated
to the calling transaction context for proper rollback handling.

**Performance**: Uses prepared statements for optimal bulk insert
performance.

#### Throws

Error when database operations fail.

***

### deleteAllInternal()

> **deleteAllInternal**(`db`): `void`

Defined in: [electron/services/database/SettingsRepository.ts:361](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L361)

Clears all settings from the database within an existing transaction
context.

#### Parameters

##### db

`Database`

The database connection (must be within an active
  transaction).

#### Returns

`void`

#### Remarks

Use this method only when already within a transaction context.

***

### deleteInternal()

> **deleteInternal**(`db`, `key`): `void`

Defined in: [electron/services/database/SettingsRepository.ts:376](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L376)

Deletes a setting by key within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active
  transaction).

##### key

`string`

The setting key to delete.

#### Returns

`void`

#### Remarks

Use this method only when already within a transaction context.

***

### setInternal()

> **setInternal**(`db`, `key`, `value`): `void`

Defined in: [electron/services/database/SettingsRepository.ts:396](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SettingsRepository.ts#L396)

Sets a setting value within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active
  transaction).

##### key

`string`

The setting key to set.

##### value

`string`

The setting value to store.

#### Returns

`void`

#### Remarks

Use this method only when already within a transaction context.
