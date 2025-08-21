# Interface: SiteOperationsDependencies

Defined in: [src/stores/sites/types.ts:122](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/types.ts#L122)

Dependencies interface for site operations. Defines the minimal interface
needed by operation helpers.

## Properties

### addSite()

> **addSite**: (`site`) => `void`

Defined in: [src/stores/sites/types.ts:123](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/types.ts#L123)

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`

***

### getSites()

> **getSites**: () => [`Site`](../../../../../shared/types/interfaces/Site.md)[]

Defined in: [src/stores/sites/types.ts:124](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/types.ts#L124)

#### Returns

[`Site`](../../../../../shared/types/interfaces/Site.md)[]

***

### removeSite()

> **removeSite**: (`identifier`) => `void`

Defined in: [src/stores/sites/types.ts:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/types.ts#L125)

#### Parameters

##### identifier

`string`

#### Returns

`void`

***

### setSites()

> **setSites**: (`sites`) => `void`

Defined in: [src/stores/sites/types.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/types.ts#L126)

#### Parameters

##### sites

[`Site`](../../../../../shared/types/interfaces/Site.md)[]

#### Returns

`void`

***

### syncSitesFromBackend()

> **syncSitesFromBackend**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/types.ts:127](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/types.ts#L127)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
