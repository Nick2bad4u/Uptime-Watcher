# Function: EmptyState()

> **EmptyState**(): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/components/Dashboard/SiteList/EmptyState.tsx:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteList/EmptyState.tsx#L29)

Empty state component displayed when no sites are configured for monitoring.

Shows a centered message with an icon to guide users towards adding their
first site. Uses themed components for consistent styling.

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

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
