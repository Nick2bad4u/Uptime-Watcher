# Interface: SiteOperationsDependencies

Defined in: [src/stores/sites/useSiteOperations.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L47)

## Properties

### addSite()

> **addSite**: (`site`) => `void`

Defined in: [src/stores/sites/useSiteOperations.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L48)

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`

***

### getSites()

> **getSites**: () => [`Site`](../../../../../shared/types/interfaces/Site.md)[]

Defined in: [src/stores/sites/useSiteOperations.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L49)

#### Returns

[`Site`](../../../../../shared/types/interfaces/Site.md)[]

***

### removeSite()

> **removeSite**: (`identifier`) => `void`

Defined in: [src/stores/sites/useSiteOperations.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L50)

#### Parameters

##### identifier

`string`

#### Returns

`void`

***

### setSites()

> **setSites**: (`sites`) => `void`

Defined in: [src/stores/sites/useSiteOperations.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L51)

#### Parameters

##### sites

[`Site`](../../../../../shared/types/interfaces/Site.md)[]

#### Returns

`void`

***

### syncSitesFromBackend()

> **syncSitesFromBackend**: () => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteOperations.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/useSiteOperations.ts#L52)

#### Returns

`Promise`\<`void`\>
