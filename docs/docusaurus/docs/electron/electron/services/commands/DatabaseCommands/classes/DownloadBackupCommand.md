# Class: DownloadBackupCommand

Defined in: [electron/services/commands/DatabaseCommands.ts:236](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L236)

Command for downloading a database backup as a buffer and file name.

## Remarks

Encapsulates the logic for downloading a backup and emitting a success event. Rollback and validation are no-ops.

## Extends

- [`DatabaseCommand`](DatabaseCommand.md)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

## Constructors

### Constructor

> **new DownloadBackupCommand**(`serviceFactory`, `eventEmitter`, `cache`): `DownloadBackupCommand`

Defined in: [electron/services/commands/DatabaseCommands.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L76)

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

## Properties

### cache

> `protected` `readonly` **cache**: [`StandardizedCache`](../../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

Defined in: [electron/services/commands/DatabaseCommands.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L72)

#### Inherited from

[`DatabaseCommand`](DatabaseCommand.md).[`cache`](DatabaseCommand.md#cache)

***

### eventEmitter

> `protected` `readonly` **eventEmitter**: [`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/services/commands/DatabaseCommands.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L73)

#### Inherited from

[`DatabaseCommand`](DatabaseCommand.md).[`eventEmitter`](DatabaseCommand.md#eventemitter)

***

### serviceFactory

> `protected` `readonly` **serviceFactory**: [`DatabaseServiceFactory`](../../../factories/DatabaseServiceFactory/classes/DatabaseServiceFactory.md)

Defined in: [electron/services/commands/DatabaseCommands.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L74)

#### Inherited from

[`DatabaseCommand`](DatabaseCommand.md).[`serviceFactory`](DatabaseCommand.md#servicefactory)

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

#### Inherited from

[`DatabaseCommand`](DatabaseCommand.md).[`emitFailureEvent`](DatabaseCommand.md#emitfailureevent)

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

#### Inherited from

[`DatabaseCommand`](DatabaseCommand.md).[`emitSuccessEvent`](DatabaseCommand.md#emitsuccessevent)

***

### execute()

> **execute**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:237](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L237)

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

### getDescription()

> **getDescription**(): `string`

Defined in: [electron/services/commands/DatabaseCommands.ts:249](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L249)

Gets a description of the command for logging and debugging.

#### Returns

`string`

Human-readable command description.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`getDescription`](DatabaseCommand.md#getdescription)

***

### rollback()

> **rollback**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:261](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L261)

No-op rollback for backup operations.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Resolved promise since backup operations are read-only and do not require rollback.

#### Remarks

Backup operations are inherently safe and do not modify the database state, so no rollback action is necessary. Returns a resolved promise to satisfy the [IDatabaseCommand](../interfaces/IDatabaseCommand.md) interface contract.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`rollback`](DatabaseCommand.md#rollback)

***

### validate()

> **validate**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:274](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L274)

Validates backup operation prerequisites.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Resolved promise with validation result indicating success.

#### Remarks

Backup operations have minimal prerequisites, so validation always succeeds. Returns a resolved promise to satisfy the [IDatabaseCommand](../interfaces/IDatabaseCommand.md) interface contract.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`validate`](DatabaseCommand.md#validate)
