# Class: DownloadBackupCommand

Defined in: [electron/services/commands/DatabaseCommands.ts:291](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L291)

Command for downloading a database backup as a buffer and file name.

## Remarks

Encapsulates the logic for downloading a backup and emitting a success event.
Rollback and validation are no-ops.

## Extends

- [`DatabaseCommand`](DatabaseCommand.md)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

## Constructors

### Constructor

> **new DownloadBackupCommand**(`serviceFactory`, `eventEmitter`, `cache`): `DownloadBackupCommand`

Defined in: [electron/services/commands/DatabaseCommands.ts:144](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L144)

#### Parameters

##### serviceFactory

[`DatabaseServiceFactory`](../../../factories/DatabaseServiceFactory/classes/DatabaseServiceFactory.md)

##### eventEmitter

[`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

##### cache

[`StandardizedCache`](../../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

#### Returns

`DownloadBackupCommand`

#### Inherited from

[`DatabaseCommand`](DatabaseCommand.md).[`constructor`](DatabaseCommand.md#constructor)

## Methods

### execute()

> **execute**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:295](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L295)

Executes the command operation.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

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

Defined in: [electron/services/commands/DatabaseCommands.ts:318](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L318)

No-op rollback for backup operations.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Resolved promise since backup operations are read-only and do
  not require rollback.

#### Remarks

Backup operations are inherently safe and do not modify the database
state, so no rollback action is necessary. Returns a resolved promise to
satisfy the [IDatabaseCommand](../interfaces/IDatabaseCommand.md) interface contract.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`rollback`](DatabaseCommand.md#rollback)

***

### validate()

> **validate**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:332](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L332)

Validates backup operation prerequisites.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Resolved promise with validation result indicating success.

#### Remarks

Backup operations have minimal prerequisites, so validation always
succeeds. Returns a resolved promise to satisfy the
[IDatabaseCommand](../interfaces/IDatabaseCommand.md) interface contract.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`validate`](DatabaseCommand.md#validate)

***

### getDescription()

> **getDescription**(): `string`

Defined in: [electron/services/commands/DatabaseCommands.ts:338](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L338)

Gets a description of the command for logging and debugging.

#### Returns

`string`

Human-readable command description.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`getDescription`](DatabaseCommand.md#getdescription)
