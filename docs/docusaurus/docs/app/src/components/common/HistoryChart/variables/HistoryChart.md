# Variable: HistoryChart

> `const` **HistoryChart**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`HistoryChartProperties`](../interfaces/HistoryChartProperties.md)\>

Defined in: [src/components/common/HistoryChart.tsx:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/common/HistoryChart.tsx#L40)

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
