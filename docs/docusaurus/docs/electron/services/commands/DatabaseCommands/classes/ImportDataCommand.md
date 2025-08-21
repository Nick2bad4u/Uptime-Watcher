# Class: ImportDataCommand

Defined in: [electron/services/commands/DatabaseCommands.ts:390](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L390)

Command for importing application data from JSON.

## Remarks

Encapsulates the logic for importing data, updating the cache, and emitting a
success event. Rollback restores the previous cache state. Validation checks
for valid JSON and non-empty input.

## Extends

- [`DatabaseCommand`](DatabaseCommand.md)\<`boolean`\>

## Constructors

### Constructor

> **new ImportDataCommand**(`serviceFactory`, `eventEmitter`, `cache`, `data`): `ImportDataCommand`

Defined in: [electron/services/commands/DatabaseCommands.ts:456](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L456)

#### Parameters

##### serviceFactory

[`DatabaseServiceFactory`](../../../factories/DatabaseServiceFactory/classes/DatabaseServiceFactory.md)

##### eventEmitter

[`TypedEventBus`](../../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../../events/eventTypes/interfaces/UptimeEvents.md)\>

##### cache

[`StandardizedCache`](../../../../utils/cache/StandardizedCache/classes/StandardizedCache.md)\<[`Site`](../../../../../shared/types/interfaces/Site.md)\>

##### data

`string`

#### Returns

`ImportDataCommand`

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`constructor`](DatabaseCommand.md#constructor)

## Methods

### execute()

> **execute**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:395](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L395)

Executes the command operation.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

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

Defined in: [electron/services/commands/DatabaseCommands.ts:426](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L426)

Rolls back the command operation if possible.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise resolving when rollback is complete.

#### Remarks

Attempts to revert the effects of the command. Not all commands require
rollback.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`rollback`](DatabaseCommand.md#rollback)

***

### validate()

> **validate**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:435](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L435)

Validates the command before execution.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Promise resolving to validation result.

#### Remarks

Ensures the command is in a valid state before execution. Returns a
validation result with errors if any.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`validate`](DatabaseCommand.md#validate)

***

### getDescription()

> **getDescription**(): `string`

Defined in: [electron/services/commands/DatabaseCommands.ts:466](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L466)

Gets a description of the command for logging and debugging.

#### Returns

`string`

Human-readable command description.

#### Overrides

[`DatabaseCommand`](DatabaseCommand.md).[`getDescription`](DatabaseCommand.md#getdescription)
