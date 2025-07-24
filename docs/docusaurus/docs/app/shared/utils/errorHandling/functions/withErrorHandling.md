# Function: withErrorHandling()

## Call Signature

> **withErrorHandling**\<`T`\>(`operation`, `store`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [shared/utils/errorHandling.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/utils/errorHandling.ts#L26)

### Type Parameters

#### T

`T`

### Parameters

#### operation

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

#### store

[`ErrorHandlingFrontendStore`](../interfaces/ErrorHandlingFrontendStore.md)

### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

## Call Signature

> **withErrorHandling**\<`T`\>(`operation`, `context`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [shared/utils/errorHandling.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/utils/errorHandling.ts#L28)

### Type Parameters

#### T

`T`

### Parameters

#### operation

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

#### context

[`ErrorHandlingBackendContext`](../interfaces/ErrorHandlingBackendContext.md)

### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>
