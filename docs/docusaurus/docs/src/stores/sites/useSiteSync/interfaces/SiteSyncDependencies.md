# Interface: SiteSyncDependencies

Defined in: [src/stores/sites/useSiteSync.ts:164](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteSync.ts#L164)

Dependencies required for site synchronization operations.

## Remarks

These dependencies are injected into the sync actions to maintain separation
of concerns and enable easier testing. The dependencies provide access to the
site state without direct coupling to the Zustand store implementation.

## Properties

### getSites()

> **getSites**: () => [`Site`](../../../../../shared/types/interfaces/Site.md)[]

Defined in: [src/stores/sites/useSiteSync.ts:166](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteSync.ts#L166)

Function to get current sites from the store

#### Returns

[`Site`](../../../../../shared/types/interfaces/Site.md)[]

***

### setSites()

> **setSites**: (`sites`) => `void`

Defined in: [src/stores/sites/useSiteSync.ts:168](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteSync.ts#L168)

Function to update sites in the store

#### Parameters

##### sites

[`Site`](../../../../../shared/types/interfaces/Site.md)[]

#### Returns

`void`
