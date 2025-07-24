# Function: SiteList()

> **SiteList**(): `Element`

Defined in: [src/components/Dashboard/SiteList/index.tsx:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/components/Dashboard/SiteList/index.tsx#L34)

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
