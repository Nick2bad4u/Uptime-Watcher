# Variable: HistoryChart

> `const` **HistoryChart**: `NamedExoticComponent`\<`HistoryChartProperties`\>

Defined in: [src/components/common/HistoryChart.tsx:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/components/common/HistoryChart.tsx#L36)

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
