# Abstract Class: DatabaseCommand\<TResult\>

Defined in: [electron/services/commands/DatabaseCommands.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L86)

Abstract base class for database commands providing common functionality for
event emission and dependency management.

## Extended by

- [`DownloadBackupCommand`](DownloadBackupCommand.md)
- [`ExportDataCommand`](ExportDataCommand.md)
- [`ImportDataCommand`](ImportDataCommand.md)
- [`LoadSitesCommand`](LoadSitesCommand.md)

## Type Parameters

### TResult

`TResult` = `void`

The result type returned by the command's execute
  method.

## Implements

- [`IDatabaseCommand`](../interfaces/IDatabaseCommand.md)\<`TResult`\>

## Constructors

### Constructor

> **new DatabaseCommand**\<`TResult`\>(`serviceFactory`, `eventEmitter`, `cache`): `DatabaseCommand`\<`TResult`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:144](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L144)

#### Parameters

##### serviceFactory

[`DatabaseServiceFactory`](../../../factories/DatabaseServiceFactory/classes/DatabaseServiceFactory.md)

##### eventEmitter

[`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

##### cache

[`StandardizedCache`](../../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

#### Returns

`DatabaseCommand`\<`TResult`\>

## Methods

### execute()

> `abstract` **execute**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:154](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L154)

Executes the command operation.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

Promise resolving to the operation result.

#### Remarks

Performs the main database operation encapsulated by the command.

#### Throws

When command execution fails.

#### Implementation of

[`IDatabaseCommand`](../interfaces/IDatabaseCommand.md).[`execute`](../interfaces/IDatabaseCommand.md#execute)

***

### getDescription()

> `abstract` **getDescription**(): `string`

Defined in: [electron/services/commands/DatabaseCommands.ts:156](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L156)

Gets a description of the command for logging and debugging.

#### Returns

`string`

Human-readable command description.

#### Implementation of

[`IDatabaseCommand`](../interfaces/IDatabaseCommand.md).[`getDescription`](../interfaces/IDatabaseCommand.md#getdescription)

***

### rollback()

> `abstract` **rollback**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:158](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L158)

Rolls back the command operation if possible.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise resolving when rollback is complete.

#### Remarks

Attempts to revert the effects of the command. Not all commands require
rollback.

#### Implementation of

[`IDatabaseCommand`](../interfaces/IDatabaseCommand.md).[`rollback`](../interfaces/IDatabaseCommand.md#rollback)

***

### validate()

> `abstract` **validate**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L160)

Validates the command before execution.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Promise resolving to validation result.

#### Remarks

Ensures the command is in a valid state before execution. Returns a
validation result with errors if any.

#### Implementation of

[`IDatabaseCommand`](../interfaces/IDatabaseCommand.md).[`validate`](../interfaces/IDatabaseCommand.md#validate)
