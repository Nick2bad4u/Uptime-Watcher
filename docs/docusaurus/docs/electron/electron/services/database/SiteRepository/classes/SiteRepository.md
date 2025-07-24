# Class: SiteRepository

Defined in: [electron/services/database/SiteRepository.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L42)

## Constructors

### Constructor

> **new SiteRepository**(`dependencies`): `SiteRepository`

Defined in: [electron/services/database/SiteRepository.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L45)

#### Parameters

##### dependencies

[`SiteRepositoryDependencies`](../interfaces/SiteRepositoryDependencies.md)

#### Returns

`SiteRepository`

## Methods

### bulkInsert()

> **bulkInsert**(`sites`): `Promise`\<`void`\>

Defined in: [electron/services/database/SiteRepository.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L62)

Bulk insert sites (for import functionality).
Uses executeTransaction for atomic operation.

#### Parameters

##### sites

[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)[]

Array of site data to insert

#### Returns

`Promise`\<`void`\>

#### Throws

Re-throws database errors after logging for upstream handling

#### Remarks

Performs bulk insertion with consistent data normalization:
- Uses INSERT OR IGNORE to handle conflicts gracefully
- Applies standard name and monitoring defaults
- Wraps operation in database transaction for atomicity

***

### bulkInsertInternal()

> **bulkInsertInternal**(`db`, `sites`): `void`

Defined in: [electron/services/database/SiteRepository.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L96)

Internal method to bulk insert sites within an existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction)

##### sites

[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)[]

Array of site data to insert

#### Returns

`void`

#### Remarks

**IMPORTANT**: This method is strictly synchronous and must be called
within an existing database transaction context. It uses prepared
statements for performance and applies consistent data normalization.

**Data Normalization:**
- Names: Default to "Unnamed Site" when null/undefined
- Monitoring: Default to true when undefined
- Uses INSERT OR IGNORE to handle identifier conflicts gracefully

***

### delete()

> **delete**(`identifier`): `Promise`\<`boolean`\>

Defined in: [electron/services/database/SiteRepository.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L126)

Delete a site from the database.

#### Parameters

##### identifier

`string`

Unique site identifier to delete

#### Returns

`Promise`\<`boolean`\>

Promise resolving to true if site was deleted, false if not found

***

### deleteAll()

> **deleteAll**(): `Promise`\<`void`\>

Defined in: [electron/services/database/SiteRepository.ts:146](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L146)

Clear all sites from the database.

#### Returns

`Promise`\<`void`\>

#### Remarks

**WARNING**: This operation is irreversible and will delete all site data.
Use with caution in production environments.

***

### deleteAllInternal()

> **deleteAllInternal**(`db`): `void`

Defined in: [electron/services/database/SiteRepository.ts:164](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L164)

Internal method to clear all sites from the database within an existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction)

#### Returns

`void`

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction context.
It performs a hard delete of all site records.

***

### deleteInternal()

> **deleteInternal**(`db`, `identifier`): `boolean`

Defined in: [electron/services/database/SiteRepository.ts:178](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L178)

Delete a site from the database (internal version for use within existing transactions).

#### Parameters

##### db

`Database`

Database connection (must be within active transaction)

##### identifier

`string`

Site identifier to delete

#### Returns

`boolean`

True if the site was deleted, false if not found

#### Throws

Re-throws database errors after logging for upstream handling

***

### exists()

> **exists**(`identifier`): `Promise`\<`boolean`\>

Defined in: [electron/services/database/SiteRepository.ts:202](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L202)

Check if a site exists by identifier.

#### Parameters

##### identifier

`string`

Site identifier to check

#### Returns

`Promise`\<`boolean`\>

Promise resolving to true if site exists, false otherwise

***

### exportAll()

> **exportAll**(): `Promise`\<[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)[]\>

Defined in: [electron/services/database/SiteRepository.ts:223](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L223)

Export all sites for backup/import functionality.

#### Returns

`Promise`\<[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)[]\>

Promise resolving to array of all site data

#### Remarks

Returns raw site data suitable for backup or export operations.
Uses consistent query and validation patterns.

***

### findAll()

> **findAll**(): `Promise`\<[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)[]\>

Defined in: [electron/services/database/SiteRepository.ts:240](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L240)

Get all sites from the database (without monitors).

#### Returns

`Promise`\<[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)[]\>

Promise resolving to array of all site data

#### Remarks

Uses consistent query patterns and validation. Identical to exportAll
in functionality but semantically different purpose.

***

### findByIdentifier()

> **findByIdentifier**(`identifier`): `Promise`\<`undefined` \| [`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)\>

Defined in: [electron/services/database/SiteRepository.ts:256](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L256)

Find a site by its identifier with resilient error handling.

#### Parameters

##### identifier

`string`

Site identifier to find

#### Returns

`Promise`\<`undefined` \| [`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md)\>

Promise resolving to site data if found, undefined otherwise

#### Throws

Re-throws database errors after logging for upstream handling

***

### upsert()

> **upsert**(`site`): `Promise`\<`void`\>

Defined in: [electron/services/database/SiteRepository.ts:289](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L289)

Create or update a site in the database.

#### Parameters

##### site

`Pick`\<[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md), `"identifier"` \| `"monitoring"` \| `"name"`\>

Site data to create or update

#### Returns

`Promise`\<`void`\>

#### Throws

Re-throws database errors after logging for upstream handling

#### Remarks

Uses INSERT OR REPLACE to handle both creation and updates atomically.
Applies consistent data normalization with standard defaults.

***

### upsertInternal()

> **upsertInternal**(`db`, `site`): `void`

Defined in: [electron/services/database/SiteRepository.ts:316](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/SiteRepository.ts#L316)

Internal method to create or update a site within an existing transaction.

#### Parameters

##### db

`Database`

Database connection (must be within active transaction)

##### site

`Pick`\<[`SiteRow`](../../utils/siteMapper/interfaces/SiteRow.md), `"identifier"` \| `"monitoring"` \| `"name"`\>

Site data to create or update

#### Returns

`void`

#### Remarks

**IMPORTANT**: This method must be called within an existing transaction context.

**Data Normalization:**
- Names: Default to "Unnamed Site" when null/undefined (consistent with bulk operations)
- Monitoring: Default to true when undefined (safe default)
- Uses INSERT OR REPLACE for atomic upsert operation
