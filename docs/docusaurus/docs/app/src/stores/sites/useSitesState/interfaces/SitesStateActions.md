# Interface: SitesStateActions

Defined in: [src/stores/sites/useSitesState.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSitesState.ts#L19)

## Properties

### addSite()

> **addSite**: (`site`) => `void`

Defined in: [src/stores/sites/useSitesState.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSitesState.ts#L21)

Add a site to the store

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`

***

### getSelectedMonitorId()

> **getSelectedMonitorId**: (`siteId`) => `undefined` \| `string`

Defined in: [src/stores/sites/useSitesState.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSitesState.ts#L23)

Get selected monitor ID for a site

#### Parameters

##### siteId

`string`

#### Returns

`undefined` \| `string`

***

### getSelectedSite()

> **getSelectedSite**: () => `undefined` \| [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/stores/sites/useSitesState.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSitesState.ts#L25)

Get the currently selected site

#### Returns

`undefined` \| [`Site`](../../../../../shared/types/interfaces/Site.md)

***

### removeSite()

> **removeSite**: (`identifier`) => `void`

Defined in: [src/stores/sites/useSitesState.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSitesState.ts#L27)

Remove a site from the store

#### Parameters

##### identifier

`string`

#### Returns

`void`

***

### setSelectedMonitorId()

> **setSelectedMonitorId**: (`siteId`, `monitorId`) => `void`

Defined in: [src/stores/sites/useSitesState.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSitesState.ts#L29)

Set selected monitor ID for a site

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`void`

***

### setSelectedSite()

> **setSelectedSite**: (`site`) => `void`

Defined in: [src/stores/sites/useSitesState.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSitesState.ts#L31)

Set selected site

#### Parameters

##### site

`undefined` | [`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`

***

### setSites()

> **setSites**: (`sites`) => `void`

Defined in: [src/stores/sites/useSitesState.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/useSitesState.ts#L33)

Set sites data

#### Parameters

##### sites

[`Site`](../../../../../shared/types/interfaces/Site.md)[]

#### Returns

`void`
