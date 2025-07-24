# Function: withErrorHandling()

## Call Signature

> **withErrorHandling**\<`T`\>(`operation`, `store`): `Promise`\<`T`\>

Defined in: [shared/utils/errorHandling.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/utils/errorHandling.ts#L26)

### Type Parameters

#### T

`T`

### Parameters

#### operation

() => `Promise`\<`T`\>

#### store

[`ErrorHandlingFrontendStore`](../interfaces/ErrorHandlingFrontendStore.md)

### Returns

`Promise`\<`T`\>

## Call Signature

> **withErrorHandling**\<`T`\>(`operation`, `context`): `Promise`\<`T`\>

Defined in: [shared/utils/errorHandling.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/utils/errorHandling.ts#L28)

### Type Parameters

#### T

`T`

### Parameters

#### operation

() => `Promise`\<`T`\>

#### context

[`ErrorHandlingBackendContext`](../interfaces/ErrorHandlingBackendContext.md)

### Returns

`Promise`\<`T`\>
