# Variable: useMonitorTypesStore

> `const` **useMonitorTypesStore**: `UseBoundStore`\<`StoreApi`\<[`MonitorTypesStore`](../type-aliases/MonitorTypesStore.md)\>\>

Defined in: [src/stores/monitor/useMonitorTypesStore.ts:229](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/monitor/useMonitorTypesStore.ts#L229)

Monitor Types store for managing monitor type configurations and operations.

## Remarks

Centralizes all monitor type related functionality that was previously
scattered across components and utilities. Provides consistent state
management and eliminates direct ElectronAPI calls.

## Returns

Complete monitor types store with all actions and state
