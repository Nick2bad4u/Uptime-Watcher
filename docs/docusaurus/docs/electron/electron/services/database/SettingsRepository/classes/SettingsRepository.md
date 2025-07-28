# Class: SettingsRepository

Defined in: [electron/services/database/SettingsRepository.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L52)

Repository for managing application settings persistence.

Handles all CRUD operations for settings in the database, following the repository pattern.

## Remarks

All operations are wrapped in transactions and use the repository pattern for consistency, error handling, and maintainability. This class should be used as the sole interface for settings data access and mutation.

## Constructors

### Constructor

> **new SettingsRepository**(`dependencies`): `SettingsRepository`

Defined in: [electron/services/database/SettingsRepository.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L65)

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

Defined in: [electron/services/database/SettingsRepository.ts:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L82)

Bulk inserts settings (for import functionality).

#### Parameters

##### settings

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Key-value pairs to insert.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when all settings are inserted.

#### Throws

Error if the database operation fails.

#### Remarks

Uses a prepared statement and transaction for better performance.

#### Example

```typescript
await repo.bulkInsert({ theme: "dark", language: "en" });
```

***

### bulkInsertInternal()

> **bulkInsertInternal**(`db`, `settings`): `void`

Defined in: [electron/services/database/SettingsRepository.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L114)

Bulk inserts settings within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active transaction).

##### settings

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Key-value pairs to insert.

#### Returns

`void`

#### Throws

Error when database operations fail.

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction context.

**Error Handling**: Uses prepared statements which may throw on constraint violations or database errors. All exceptions are propagated to the calling transaction context for proper rollback handling.

**Performance**: Uses prepared statements for optimal bulk insert performance.

***

### delete()

> **delete**(`key`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/SettingsRepository.ts:145](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L145)

Deletes a setting by key.

#### Parameters

##### key

`string`

The setting key to delete.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the setting is deleted.

#### Throws

Error if the database operation fails.

#### Example

```typescript
await repo.delete("theme");
```

***

### deleteAll()

> **deleteAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/SettingsRepository.ts:169](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L169)

Clears all settings from the database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when all settings are deleted.

#### Throws

Error if the database operation fails.

#### Example

```typescript
await repo.deleteAll();
```

***

### deleteAllInternal()

> **deleteAllInternal**(`db`): `void`

Defined in: [electron/services/database/SettingsRepository.ts:185](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L185)

Clears all settings from the database within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active transaction).

#### Returns

`void`

#### Remarks

Use this method only when already within a transaction context.

***

### deleteInternal()

> **deleteInternal**(`db`, `key`): `void`

Defined in: [electron/services/database/SettingsRepository.ts:198](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L198)

Deletes a setting by key within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active transaction).

##### key

`string`

The setting key to delete.

#### Returns

`void`

#### Remarks

Use this method only when already within a transaction context.

***

### get()

> **get**(`key`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| `string`\>

Defined in: [electron/services/database/SettingsRepository.ts:216](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L216)

Gets a setting by key.

#### Parameters

##### key

`string`

The setting key to retrieve.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| `string`\>

A promise resolving to the setting value or `undefined` if not found.

#### Throws

Error if the database operation fails.

#### Example

```typescript
const theme = await repo.get("theme");
```

***

### getAll()

> **getAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>\>

Defined in: [electron/services/database/SettingsRepository.ts:236](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L236)

Gets all settings.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>\>

A promise resolving to all settings as key-value pairs.

#### Throws

Error if the database operation fails.

#### Remarks

**Performance Note**: Settings tables are typically small (under 100 entries) by design. No pagination is needed as settings are configuration data, not user-generated content. If settings grow beyond expected size, consider splitting into separate configuration domains.

#### Example

```typescript
const allSettings = await repo.getAll();
```

***

### set()

> **set**(`key`, `value`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/SettingsRepository.ts:257](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L257)

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

#### Throws

Error if the database operation fails.

#### Example

```typescript
await repo.set("theme", "dark");
```

***

### setInternal()

> **setInternal**(`db`, `key`, `value`): `void`

Defined in: [electron/services/database/SettingsRepository.ts:280](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/SettingsRepository.ts#L280)

Sets a setting value within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active transaction).

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
