# Variable: UptimeChart

> `const` **UptimeChart**: [`MemoExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L1545)\<(`__namedParameters`) => [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)\>

Defined in: [src/components/SiteDetails/charts/ChartComponents.tsx:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/charts/ChartComponents.tsx#L45)

Uptime distribution doughnut chart component with memoization for performance optimization.

Displays uptime vs downtime distribution using a doughnut chart visualization.
Memoized to prevent unnecessary re-renders when parent component updates.

## Param

Chart.js compatible data configuration for doughnut charts

## Param

Chart.js compatible options configuration for doughnut charts

## Returns

Memoized doughnut chart component
