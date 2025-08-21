# Interface: BaseSiteState

Defined in: [src/stores/sites/baseTypes.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L95)

Common site state management interface. Shared between different state
modules.

## Properties

### addSite()

> **addSite**: (`site`) => `void`

Defined in: [src/stores/sites/baseTypes.ts:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L97)

Add a site to the store

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`

***

### getSelectedMonitorId()

> **getSelectedMonitorId**: (`siteId`) => `undefined` \| `string`

Defined in: [src/stores/sites/baseTypes.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L99)

Get selected monitor ID for a site

#### Parameters

##### siteId

`string`

#### Returns

`undefined` \| `string`

***

### getSelectedSite()

> **getSelectedSite**: () => `undefined` \| [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/stores/sites/baseTypes.ts:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L101)

Get the currently selected site

#### Returns

`undefined` \| [`Site`](../../../../../shared/types/interfaces/Site.md)

***

### removeSite()

> **removeSite**: (`identifier`) => `void`

Defined in: [src/stores/sites/baseTypes.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L103)

Remove a site from the store

#### Parameters

##### identifier

`string`

#### Returns

`void`

***

### setSelectedMonitorId()

> **setSelectedMonitorId**: (`siteId`, `monitorId`) => `void`

Defined in: [src/stores/sites/baseTypes.ts:105](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L105)

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

Defined in: [src/stores/sites/baseTypes.ts:107](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L107)

Set selected site

#### Parameters

##### site

`undefined` | [`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`

***

### setSites()

> **setSites**: (`sites`) => `void`

Defined in: [src/stores/sites/baseTypes.ts:109](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L109)

Set all sites

#### Parameters

##### sites

[`Site`](../../../../../shared/types/interfaces/Site.md)[]

#### Returns

`void`

***

### updateSite()

> **updateSite**: (`site`) => `void`

Defined in: [src/stores/sites/baseTypes.ts:111](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L111)

Update a site

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`
