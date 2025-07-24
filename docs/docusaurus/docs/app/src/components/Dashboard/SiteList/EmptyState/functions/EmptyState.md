# Function: EmptyState()

> **EmptyState**(): `Element`

Defined in: [src/components/Dashboard/SiteList/EmptyState.tsx:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/components/Dashboard/SiteList/EmptyState.tsx#L29)

Empty state component displayed when no sites are configured for monitoring.

Shows a centered message with an icon to guide users towards adding their
first site. Uses themed components for consistent styling.

## Returns

`Element`

JSX element containing the empty state UI

## Example

```tsx
function SiteList({ sites }) {
  if (sites.length === 0) {
    return <EmptyState />;
  }
  // Render site list items
  return <div>{sites.map(site => <SiteCard key={site.id} site={site} />)}</div>;
}
```
