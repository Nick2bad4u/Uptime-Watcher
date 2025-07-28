# Variable: StatusChart

> `const` **StatusChart**: [`MemoExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L1545)\<(`__namedParameters`) => [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)\>

Defined in: [src/components/SiteDetails/charts/ChartComponents.tsx:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/charts/ChartComponents.tsx#L59)

Status distribution bar chart component with memoization for performance optimization.

Displays status distribution (up/down/pending) using a bar chart visualization.
Memoized to prevent unnecessary re-renders when parent component updates.

## Param

Chart.js compatible data configuration for bar charts

## Param

Chart.js compatible options configuration for bar charts

## Returns

Memoized bar chart component
