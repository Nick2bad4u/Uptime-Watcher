# Variable: SiteCardHistory

> `const` **SiteCardHistory**: `NamedExoticComponent`\<`SiteCardHistoryProperties`\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardHistory.tsx:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/components/Dashboard/SiteCard/SiteCardHistory.tsx#L46)

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
