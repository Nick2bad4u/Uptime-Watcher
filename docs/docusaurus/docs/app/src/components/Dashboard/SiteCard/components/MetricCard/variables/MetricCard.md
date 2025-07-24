# Variable: MetricCard

> `const` **MetricCard**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`MetricCardProperties`](../interfaces/MetricCardProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/components/MetricCard.tsx:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/components/MetricCard.tsx#L47)

Metric display card component for showing labeled values.

Features:
- Consistent vertical layout with label above value
- Themed text components for unified styling
- Flexible value types (string or number)
- Optimized with React.memo to prevent unnecessary re-renders
- Customizable styling through className prop

## Param

Component props

## Returns

JSX element containing the metric display

## Example

```tsx
<MetricCard
  label="Uptime"
  value="98.5%"
  className="border-r"
/>
```
