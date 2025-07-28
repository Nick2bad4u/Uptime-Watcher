# Function: createSitesStateActions()

> **createSitesStateActions**(`set`, `get`): [`SitesStateActions`](../interfaces/SitesStateActions.md)

Defined in: [src/stores/sites/useSitesState.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSitesState.ts#L45)

Creates state management actions for the sites store.

## Parameters

### set

(`function_`) => `void`

Zustand state setter function for updating store state

### get

() => [`SitesState`](../interfaces/SitesState.md)

Zustand state getter function for reading current state

## Returns

[`SitesStateActions`](../interfaces/SitesStateActions.md)

Object containing all state management action functions
