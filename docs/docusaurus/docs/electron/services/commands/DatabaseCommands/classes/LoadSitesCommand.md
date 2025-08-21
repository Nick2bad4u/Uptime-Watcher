# Class: LoadSitesCommand

Defined in: [electron/services/commands/DatabaseCommands.ts:481](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L481)

Command for loading sites from the database into the in-memory cache.

## Remarks

Encapsulates the logic for loading all sites from the database and atomically
replacing the cache. Rollback restores the previous cache state. Validation
is a no-op.

## Extends

- [`DatabaseCommand`](DatabaseCommand.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)[]\>

## Constructors

### Constructor

> **new LoadSitesCommand**(`serviceFactory`, `eventEmitter`, `cache`): `LoadSitesCommand`

Defined in: [electron/services/commands/DatabaseCommands.ts:144](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L144)

#### Parameters

##### serviceFactory

[`DatabaseServiceFactory`](../../../factories/DatabaseServiceFactory/classes/DatabaseServiceFactory.md)

##### eventEmitter

[`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

##### cache

[`StandardizedCache`](../../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

#### Returns

`LoadSitesCommand`

#### Inherited from

[`DatabaseCommand`](DatabaseCommand.md).[`constructor`](DatabaseCommand.md#constructor)

## Methods

### execute()

> **execute**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../shared/types/interfaces/Site.md)[]\>

Defined in: [electron/services/commands/DatabaseCommands.ts:484](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L484)

Executes the command operation.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Site`](../../../../../shared/types/interfaces/Site.md)[]\>

Promise resolving to the operation result.

#### Remarks

Performs the main database operation encapsulated by the command.

#### Throws

When command execution fails.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`execute`](DatabaseCommand.md#execute)

***

### rollback()

> **rollback**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:514](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L514)

Restores the cache to its previous state.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Resolved promise after cache restoration is complete

#### Remarks

Performs a synchronous cache restoration operation by clearing the
current cache and restoring the backup state. Returns a resolved promise
to satisfy the IDatabaseCommand interface contract.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`rollback`](DatabaseCommand.md#rollback)

***

### validate()

> **validate**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:533](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L533)

Validates site loading operation prerequisites.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Resolved promise with validation result indicating success

#### Remarks

Site loading operations have minimal prerequisites, so validation always
succeeds. Returns a resolved promise to satisfy the IDatabaseCommand
interface contract.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`validate`](DatabaseCommand.md#validate)

***

### getDescription()

> **getDescription**(): `string`

Defined in: [electron/services/commands/DatabaseCommands.ts:539](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L539)

Gets a description of the command for logging and debugging.

#### Returns

`string`

Human-readable command description.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`getDescription`](DatabaseCommand.md#getdescription)
