# Variable: ResponseTimeChart

> `const` **ResponseTimeChart**: [`MemoExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L1545)\<(``
        data,
        options,
    ``) => [`JSX.Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)\>

Defined in: [src/components/SiteDetails/charts/ResponseTimeChart.tsx:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/charts/ResponseTimeChart.tsx#L81)

Memoized response time line chart component for monitoring performance
trends.

## Remarks

Displays response time trends over time using a line chart visualization with
Chart.js. The component is memoized to prevent unnecessary re-renders when
parent component updates, providing optimal performance for real-time
monitoring data visualization.

## Example

```tsx
<ResponseTimeChart data={responseTimeData} options={lineChartOptions} />;
```

## Param

The component properties containing data and options for the
  chart

## Returns

Memoized line chart component
