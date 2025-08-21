# Variable: HistoryChart

> `const` **HistoryChart**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`HistoryChartProps`](../interfaces/HistoryChartProps.md)\>

Defined in: [src/components/common/HistoryChart.tsx:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/HistoryChart.tsx#L48)

Reusable history chart component for visualizing status history. Can be used
anywhere we need to show historical data.

Features:

- Responsive layout using CSS
- Memoized to prevent unnecessary re-renders
- Configurable item limit
- Graceful handling of empty data

## Param

HistoryChart component props

## Returns

JSX element containing the history chart, or null if no data
  (following React conventions for conditional rendering)
