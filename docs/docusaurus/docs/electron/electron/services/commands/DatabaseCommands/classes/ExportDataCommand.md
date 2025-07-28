# Class: ExportDataCommand

Defined in: [electron/services/commands/DatabaseCommands.ts:288](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L288)

Command for exporting all application data to JSON.

## Remarks

Encapsulates the logic for exporting all data and emitting a success event. Rollback and validation are no-ops.

## Extends

- [`DatabaseCommand`](DatabaseCommand.md)\<`string`\>

## Constructors

### Constructor

> **new ExportDataCommand**(`serviceFactory`, `eventEmitter`, `cache`): `ExportDataCommand`

Defined in: [electron/services/commands/DatabaseCommands.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L76)

#### Parameters

##### serviceFactory

[`DatabaseServiceFactory`](../../../factories/DatabaseServiceFactory/classes/DatabaseServiceFactory.md)

##### eventEmitter

[`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

##### cache

[`StandardizedCache`](../../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

#### Returns

`ExportDataCommand`

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

> **execute**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:289](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L289)

Executes the command operation.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

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

Defined in: [electron/services/commands/DatabaseCommands.ts:301](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L301)

Gets a description of the command for logging and debugging.

#### Returns

`string`

Human-readable command description.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`getDescription`](DatabaseCommand.md#getdescription)

***

### rollback()

> **rollback**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:305](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L305)

Rolls back the command operation if possible.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise resolving when rollback is complete.

#### Remarks

Attempts to revert the effects of the command. Not all commands require rollback.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`rollback`](DatabaseCommand.md#rollback)

***

### validate()

> **validate**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:309](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L309)

Validates the command before execution.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Promise resolving to validation result.

#### Remarks

Ensures the command is in a valid state before execution. Returns a validation result with errors if any.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`validate`](DatabaseCommand.md#validate)
