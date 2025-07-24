# Variable: HistoryChart

> `const` **HistoryChart**: `NamedExoticComponent`\<`HistoryChartProperties`\>

Defined in: [src/components/common/HistoryChart.tsx:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/components/common/HistoryChart.tsx#L36)

Reusable history chart component for visualizing status history.
Can be used anywhere we need to show historical data.

Features:
- Responsive layout using CSS
- Memoized to prevent unnecessary re-renders
- Configurable item limit
- Graceful handling of empty data

## Param

HistoryChart component props

## Returns

JSX element containing the history chart or null if no data
