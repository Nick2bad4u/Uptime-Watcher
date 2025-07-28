# Variable: SiteCardHistory

> `const` **SiteCardHistory**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`SiteCardHistoryProperties`](../interfaces/SiteCardHistoryProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardHistory.tsx:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/Dashboard/SiteCard/SiteCardHistory.tsx#L51)

History visualization component for site cards displaying monitor status over time.

Features:
- Dynamic title generation based on monitor type and configuration
- Optimized with React.memo and custom comparison for performance
- Automatic updates when monitor history changes in store
- Supports up to 60 history items for visualization
- Handles HTTP and port monitor types with specific title formatting

Data flow: Store → useSiteMonitor → useSite → SiteCard → SiteCardHistory

## Param

Component props

## Returns

JSX element containing the history chart

## Example

```tsx
<SiteCardHistory
  monitor={selectedMonitor}
  filteredHistory={recentHistory}
/>
```
