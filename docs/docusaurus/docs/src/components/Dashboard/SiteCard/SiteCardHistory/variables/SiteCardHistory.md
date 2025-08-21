# Variable: SiteCardHistory

> `const` **SiteCardHistory**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`SiteCardHistoryProperties`](../interfaces/SiteCardHistoryProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardHistory.tsx:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/SiteCardHistory.tsx#L99)

History visualization component for site cards displaying monitor status over
time.

Features:

- Dynamic title generation based on monitor type and configuration
- Optimized with React.memo and custom comparison for performance
- Automatic updates when monitor history changes in store
- Supports up to 60 history items for visualization
- Handles HTTP and port monitor types with specific title formatting

Data flow: Store → useSiteMonitor → useSite → SiteCard → SiteCardHistory

## Example

```tsx
<SiteCardHistory
    monitor={selectedMonitor}
    filteredHistory={recentHistory}
/>;
```

## Param

Component props

## Returns

JSX element containing the history chart
