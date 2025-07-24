# Function: useSelectedSite()

> **useSelectedSite**(): `undefined` \| [`Site`](../../../../shared/types/interfaces/Site.md)

Defined in: [src/hooks/useSelectedSite.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/hooks/useSelectedSite.ts#L49)

Hook to get the currently selected site from coordinated store data.

## Returns

`undefined` \| [`Site`](../../../../shared/types/interfaces/Site.md)

The selected site object or undefined if no selection exists

## Remarks

This hook efficiently combines data from the UI store (selection state) and
sites store (site data) using useMemo to prevent unnecessary recalculations.
The memoization ensures the hook only recalculates when the selected site ID
or sites array actually changes.
