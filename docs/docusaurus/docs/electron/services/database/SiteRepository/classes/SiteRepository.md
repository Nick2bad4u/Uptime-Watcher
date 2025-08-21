# Class: SiteRepository

Defined in: [electron/services/database/SiteRepository.ts:121](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L121)

## Remarks

Handles all CRUD operations for sites in the database using the repository
pattern. All mutations are wrapped in transactions for consistency and error
handling. Data normalization is applied for site names and monitoring
status.

Repository for managing site data persistence.

## Constructors

### Constructor

> **new SiteRepository**(`dependencies`): `SiteRepository`

Defined in: [electron/services/database/SiteRepository.ts:398](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L398)

Constructs a new SiteRepository instance.

#### Parameters

##### dependencies

[`SiteRepositoryDependencies`](../interfaces/SiteRepositoryDependencies.md)

The required dependencies for site operations.

#### Returns

`SiteRepository`

#### Example

```typescript
const repo = new SiteRepository({ databaseService });
```

## Methods

### bulkInsert()

> **bulkInsert**(`sites`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/SiteRepository.ts:147](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L147)

Bulk inserts sites into the database.

#### Parameters

##### sites

[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)[]

Array of site data to insert.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when all sites are inserted.

#### Remarks

- Uses a transaction for atomicity.
- Applies default values for missing name or monitoring fields.
- Uses `INSERT OR IGNORE` to avoid duplicate identifiers.

#### Example

```typescript
await repo.bulkInsert([
    { identifier: "abc", name: "Site", monitoring: true },
]);
```

#### Throws

If the database operation fails.

***

### delete()

> **delete**(`identifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/services/database/SiteRepository.ts:180](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L180)

Deletes a site by its identifier.

#### Parameters

##### identifier

`string`

Unique site identifier to delete.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to `true` if the site was deleted, `false` if
  not found.

#### Example

```typescript
const deleted = await repo.delete("site-123");
```

#### Throws

If the database operation fails.

***

### deleteAll()

> **deleteAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/SiteRepository.ts:209](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L209)

Deletes all sites from the database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when all sites are deleted.

#### Remarks

**WARNING**: This operation is irreversible and will delete all site
data.

#### Example

```typescript
await repo.deleteAll();
```

#### Throws

If the database operation fails.

***

### exists()

> **exists**(`identifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/services/database/SiteRepository.ts:236](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L236)

Checks if a site exists by its identifier.

#### Parameters

##### identifier

`string`

Site identifier to check.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to `true` if the site exists, `false`
  otherwise.

#### Example

```typescript
const exists = await repo.exists("site-123");
```

#### Throws

If the database operation fails.

***

### exportAll()

> **exportAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)[]\>

Defined in: [electron/services/database/SiteRepository.ts:264](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L264)

Exports all sites for backup or import functionality.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)[]\>

Promise resolving to an array of all site data.

#### Remarks

Returns raw site data suitable for backup or export operations.

#### Example

```typescript
const allSites = await repo.exportAll();
```

#### Throws

If the database operation fails.

***

### findAll()

> **findAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)[]\>

Defined in: [electron/services/database/SiteRepository.ts:291](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L291)

Retrieves all sites from the database.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)[]\>

Promise resolving to an array of all site data.

#### Remarks

Functionally identical to [exportAll](#exportall), but intended for general
querying.

#### Example

```typescript
const sites = await repo.findAll();
```

#### Throws

If the database operation fails.

***

### findByIdentifier()

> **findByIdentifier**(`identifier`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)\>

Defined in: [electron/services/database/SiteRepository.ts:317](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L317)

Finds a site by its identifier.

#### Parameters

##### identifier

`string`

Site identifier to find.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)\>

Promise resolving to site data if found, or `undefined` if not
  found.

#### Example

```typescript
const site = await repo.findByIdentifier("site-123");
```

#### Throws

If the database operation fails.

***

### upsert()

> **upsert**(`site`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/database/SiteRepository.ts:372](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L372)

Creates or updates a site in the database.

#### Parameters

##### site

[`Pick`](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)\<[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md), `"identifier"` \| `"monitoring"` \| `"name"`\>

Site data to create or update.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when the operation completes.

#### Remarks

- Uses `INSERT OR REPLACE` for atomic upsert.
- Normalizes site data before persistence.

#### Example

```typescript
await repo.upsert({
    identifier: "site-123",
    name: "My Site",
    monitoring: true,
});
```

#### Throws

If the database operation fails.

***

### bulkInsertInternal()

> **bulkInsertInternal**(`db`, `sites`): `void`

Defined in: [electron/services/database/SiteRepository.ts:417](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L417)

Internal method to bulk insert sites within an existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction).

##### sites

[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)[]

Array of site data to insert.

#### Returns

`void`

Void

#### Remarks

- Must be called within an active transaction context.
- Uses prepared statements for performance.
- Normalizes site data before insertion.

#### Throws

Error When database operations fail.

***

### deleteAllInternal()

> **deleteAllInternal**(`db`): `void`

Defined in: [electron/services/database/SiteRepository.ts:458](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L458)

Internal method to delete all sites within an existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction).

#### Returns

`void`

Void

#### Remarks

- Must be called within an active transaction context.
- Performs a hard delete of all site records.

***

### deleteInternal()

> **deleteInternal**(`db`, `identifier`): `boolean`

Defined in: [electron/services/database/SiteRepository.ts:478](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L478)

Internal method to delete a site by identifier within an existing
transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction).

##### identifier

`string`

Site identifier to delete.

#### Returns

`boolean`

`true` if the site was deleted, `false` if not found.

#### Remarks

- Must be called within an active transaction context.
- Logs deletion status.

#### Throws

Error When database operations fail.

***

### upsertInternal()

> **upsertInternal**(`db`, `site`): `void`

Defined in: [electron/services/database/SiteRepository.ts:512](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/SiteRepository.ts#L512)

Creates or updates a site within an existing transaction context.

#### Parameters

##### db

`Database`

The database connection (must be within an active
  transaction).

##### site

[`Pick`](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)\<[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md), `"identifier"` \| `"monitoring"` \| `"name"`\>

Site data to create or update.

#### Returns

`void`

#### Remarks

- Must be called within an active transaction context.
- Applies default values for missing fields.
