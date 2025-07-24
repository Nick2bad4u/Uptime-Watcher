# Interface: StatusUpdateHandlerOptions

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/utils/statusUpdateHandler.ts#L13)

## Properties

### fullSyncFromBackend()

> **fullSyncFromBackend**: () => `Promise`\<`void`\>

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/utils/statusUpdateHandler.ts#L15)

Function to trigger full sync

#### Returns

`Promise`\<`void`\>

***

### getSites()

> **getSites**: () => [`Site`](../../../../../../shared/types/interfaces/Site.md)[]

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/utils/statusUpdateHandler.ts#L17)

Function to get current sites

#### Returns

[`Site`](../../../../../../shared/types/interfaces/Site.md)[]

***

### onUpdate()?

> `optional` **onUpdate**: (`update`) => `void`

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/utils/statusUpdateHandler.ts#L19)

Optional callback for additional processing

#### Parameters

##### update

[`StatusUpdate`](../../../../../../shared/types/interfaces/StatusUpdate.md)

#### Returns

`void`

***

### setSites()

> **setSites**: (`sites`) => `void`

Defined in: [src/stores/sites/utils/statusUpdateHandler.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/utils/statusUpdateHandler.ts#L21)

Function to set sites

#### Parameters

##### sites

[`Site`](../../../../../../shared/types/interfaces/Site.md)[]

#### Returns

`void`
