# Class: `abstract` DatabaseCommand\<TResult\>

Defined in: [electron/services/commands/DatabaseCommands.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L71)

Abstract base class for database commands providing common functionality for event emission and dependency management.

## Extended by

- [`DownloadBackupCommand`](DownloadBackupCommand.md)
- [`ExportDataCommand`](ExportDataCommand.md)
- [`ImportDataCommand`](ImportDataCommand.md)
- [`LoadSitesCommand`](LoadSitesCommand.md)

## Type Parameters

### TResult

`TResult` = `void`

The result type returned by the command's execute method.

## Implements

- [`IDatabaseCommand`](../interfaces/IDatabaseCommand.md)\<`TResult`\>

## Constructors

### Constructor

> **new DatabaseCommand**\<`TResult`\>(`serviceFactory`, `eventEmitter`, `cache`): `DatabaseCommand`\<`TResult`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L76)

#### Parameters

##### serviceFactory

[`DatabaseServiceFactory`](../../../factories/DatabaseServiceFactory/classes/DatabaseServiceFactory.md)

##### eventEmitter

[`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

##### cache

[`StandardizedCache`](../../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

#### Returns

`DatabaseCommand`\<`TResult`\>

## Properties

### cache

> `protected` `readonly` **cache**: [`StandardizedCache`](../../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/services/commands/DatabaseCommands.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L72)

***

### eventEmitter

> `protected` `readonly` **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/services/commands/DatabaseCommands.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L73)

***

### serviceFactory

> `protected` `readonly` **serviceFactory**: [`DatabaseServiceFactory`](../../../factories/DatabaseServiceFactory/classes/DatabaseServiceFactory.md)

Defined in: [electron/services/commands/DatabaseCommands.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L74)

## Methods

### emitFailureEvent()

> `protected` **emitFailureEvent**(`eventType`, `error`, `data`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:102](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L102)

**`Internal`**

Emits a failure event for the command operation.

#### Parameters

##### eventType

keyof [`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)

The event type to emit.

##### error

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

The [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) that occurred.

##### data

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\[keyof [`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\]\> = `{}`

Additional event data to include in the event payload.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Remarks

Used internally to emit a typed event indicating command failure, including error details and additional event data.

***

### emitSuccessEvent()

> `protected` **emitSuccessEvent**(`eventType`, `data`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L125)

**`Internal`**

Emits a success event for the command operation.

#### Parameters

##### eventType

keyof [`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)

The event type to emit.

##### data

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\[keyof [`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\]\>

Additional event data to include in the event payload.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Remarks

Used internally to emit a typed event indicating command success, including additional event data.

***

### execute()

> `abstract` **execute**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L86)

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

Defined in: [electron/services/commands/DatabaseCommands.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L87)

Gets a description of the command for logging and debugging.

#### Returns

`string`

Human-readable command description.

#### Implementation of

[`IDatabaseCommand`](../interfaces/IDatabaseCommand.md).[`getDescription`](../interfaces/IDatabaseCommand.md#getdescription)

***

### rollback()

> `abstract` **rollback**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L88)

Rolls back the command operation if possible.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise resolving when rollback is complete.

#### Remarks

Attempts to revert the effects of the command. Not all commands require rollback.

#### Implementation of

[`IDatabaseCommand`](../interfaces/IDatabaseCommand.md).[`rollback`](../interfaces/IDatabaseCommand.md#rollback)

***

### validate()

> `abstract` **validate**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L89)

Validates the command before execution.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Promise resolving to validation result.

#### Remarks

Ensures the command is in a valid state before execution. Returns a validation result with errors if any.

#### Implementation of

[`IDatabaseCommand`](../interfaces/IDatabaseCommand.md).[`validate`](../interfaces/IDatabaseCommand.md#validate)
