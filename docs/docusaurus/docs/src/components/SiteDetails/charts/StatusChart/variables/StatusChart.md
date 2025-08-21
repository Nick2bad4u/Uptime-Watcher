# Variable: StatusChart

> `const` **StatusChart**: [`MemoExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L1545)\<(``
        data,
        options,
    ``) => [`JSX.Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)\>

Defined in: [src/components/SiteDetails/charts/StatusChart.tsx:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/charts/StatusChart.tsx#L80)

Memoized status distribution bar chart component for monitoring status
visualization.

## Remarks

Displays status distribution (up/down/pending) using a bar chart
visualization with Chart.js. The component is memoized to prevent unnecessary
re-renders when parent component updates, providing optimal performance for
frequent status updates in monitoring contexts.

## Example

```tsx
<StatusChart data={statusDistributionData} options={barChartOptions} />;
```

## Param

The component properties containing data and options for the
  chart

## Returns

Memoized bar chart component
