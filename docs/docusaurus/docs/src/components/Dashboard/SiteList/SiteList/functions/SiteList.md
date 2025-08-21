# Function: SiteList()

> **SiteList**(): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/components/Dashboard/SiteList/SiteList.tsx:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteList/SiteList.tsx#L37)

Main site list component that displays all monitored sites.

Renders either a list of SiteCard components (one per site) with dividers, or
an EmptyState component when no sites are configured. Automatically applies
theme-appropriate styling.

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)

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
