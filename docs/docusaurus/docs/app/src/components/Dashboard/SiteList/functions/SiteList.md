# Function: SiteList()

> **SiteList**(): `Element`

Defined in: [src/components/Dashboard/SiteList/index.tsx:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/components/Dashboard/SiteList/index.tsx#L34)

Main site list component that displays all monitored sites.

Renders either a list of SiteCard components (one per site) with dividers,
or an EmptyState component when no sites are configured. Automatically
applies theme-appropriate styling.

## Returns

`Element`

JSX element containing the site list or empty state

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
