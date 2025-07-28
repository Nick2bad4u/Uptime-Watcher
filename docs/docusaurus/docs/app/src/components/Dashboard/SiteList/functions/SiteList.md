# Function: SiteList()

> **SiteList**(): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/components/Dashboard/SiteList/index.tsx:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/Dashboard/SiteList/index.tsx#L34)

Main site list component that displays all monitored sites.

Renders either a list of SiteCard components (one per site) with dividers,
or an EmptyState component when no sites are configured. Automatically
applies theme-appropriate styling.

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

JSX.Element containing the site list or empty state

## Example

```tsx
function Dashboard() {
  return (
    <div>
      <Header />
      <SiteList />
    </div>
  );
}
```
