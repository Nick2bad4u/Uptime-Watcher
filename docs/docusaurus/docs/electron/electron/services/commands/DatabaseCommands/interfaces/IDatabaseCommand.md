# Interface: IDatabaseCommand\<TResult\>

Defined in: [electron/services/commands/DatabaseCommands.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L25)

Base interface for all database commands.

## Remarks

Defines the contract for atomic database operations with rollback capabilities, including validation, execution, rollback, and description for logging.

## Type Parameters

### TResult

`TResult` = `void`

The result type returned by the command's execute method.

## Methods

### execute()

> **execute**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L35)

Executes the command operation.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

Promise resolving to the operation result.

#### Remarks

Performs the main database operation encapsulated by the command.

#### Throws

When command execution fails.

***

### getDescription()

> **getDescription**(): `string`

Defined in: [electron/services/commands/DatabaseCommands.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L42)

Gets a description of the command for logging and debugging.

#### Returns

`string`

Human-readable command description.

***

### rollback()

> **rollback**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L52)

Rolls back the command operation if possible.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise resolving when rollback is complete.

#### Remarks

Attempts to revert the effects of the command. Not all commands require rollback.

***

### validate()

> **validate**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/commands/DatabaseCommands.ts#L62)

Validates the command before execution.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `errors`: `string`[]; `isValid`: `boolean`; \`\>

Promise resolving to validation result.

#### Remarks

Ensures the command is in a valid state before execution. Returns a validation result with errors if any.
