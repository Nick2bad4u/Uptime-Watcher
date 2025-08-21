# Class: DatabaseCommandExecutor

Defined in: [electron/services/commands/DatabaseCommands.ts:174](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L174)

Command executor that provides transaction-like semantics for command
execution and rollback.

## Remarks

Maintains a history of executed commands and provides automatic rollback on
failure. Supports full rollback of all executed commands in reverse order to
maintain transactional integrity.

## Constructors

### Constructor

> **new DatabaseCommandExecutor**(): `DatabaseCommandExecutor`

#### Returns

`DatabaseCommandExecutor`

## Methods

### execute()

> **execute**\<`TResult`\>(`command`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:195](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L195)

Executes a command with automatic rollback on failure.

#### Type Parameters

##### TResult

`TResult`

The result type returned by the command's execute
  method.

#### Parameters

##### command

[`IDatabaseCommand`](../interfaces/IDatabaseCommand.md)\<`TResult`\>

The [IDatabaseCommand](../interfaces/IDatabaseCommand.md) to execute.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`TResult`\>

Promise resolving to the command result.

#### Remarks

Validates the command before execution. If execution fails, attempts to
rollback the command. Adds the command to the history if successful.

#### Throws

When command validation or execution fails.

***

### rollbackAll()

> **rollbackAll**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/commands/DatabaseCommands.ts:241](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L241)

Rolls back all executed commands in reverse order.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise resolving when all rollbacks are complete.

#### Remarks

Executes rollback operations for all previously executed commands in
reverse order to maintain transactional integrity. Individual rollback
failures are collected but do not prevent other rollbacks from executing.
Uses array index access which is safe for typed arrays (hence the
eslint-disable comment).

#### Throws

AggregateError containing all rollback failures if any occurred.

***

### clear()

> **clear**(): `void`

Defined in: [electron/services/commands/DatabaseCommands.ts:277](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/commands/DatabaseCommands.ts#L277)

Clears the command history without performing rollback.

#### Returns

`void`

#### Remarks

Removes all references to previously executed commands. Does not attempt
to revert any changes.
