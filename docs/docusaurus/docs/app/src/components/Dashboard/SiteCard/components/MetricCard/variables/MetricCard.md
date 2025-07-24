# Variable: MetricCard

> `const` **MetricCard**: `NamedExoticComponent`\<`MetricCardProperties`\>

Defined in: [src/components/Dashboard/SiteCard/components/MetricCard.tsx:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/components/Dashboard/SiteCard/components/MetricCard.tsx#L46)

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
