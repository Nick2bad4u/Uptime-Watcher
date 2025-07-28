# Function: withErrorHandling()

**`Internal`**

Implementation of the overloaded withErrorHandling function.

## Type Param

The return type of the async operation

## Param

Async operation to execute

## Param

Either frontend store or backend context

## Throws

Re-throws the original error after handling (logging or state management)

## Call Signature

> **withErrorHandling**\<`T`\>(`operation`, `store`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [shared/utils/errorHandling.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/errorHandling.ts#L59)

Handle async operations with frontend store integration.

### Type Parameters

#### T

`T`

The return type of the async operation

### Parameters

#### operation

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Async operation to execute with error handling

#### store

[`ErrorHandlingFrontendStore`](../interfaces/ErrorHandlingFrontendStore.md)

Frontend store with error and loading state management

### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise resolving to operation result

### Remarks

Automatically manages loading state and error state in the provided store.
Clears error state before operation, sets loading during execution,
and handles error state on failure while preserving the original error.

## Call Signature

> **withErrorHandling**\<`T`\>(`operation`, `context`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [shared/utils/errorHandling.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/errorHandling.ts#L73)

Handle async operations with backend logging integration.

### Type Parameters

#### T

`T`

The return type of the async operation

### Parameters

#### operation

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Async operation to execute with error handling

#### context

[`ErrorHandlingBackendContext`](../interfaces/ErrorHandlingBackendContext.md)

Backend context with logger and optional operation name

### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise resolving to operation result

### Remarks

Logs operation failures using the provided logger with contextual information.
Preserves original error for upstream handling while ensuring proper logging.
