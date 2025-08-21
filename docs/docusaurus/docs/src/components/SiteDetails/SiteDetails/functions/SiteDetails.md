# Function: SiteDetails()

> **SiteDetails**(`props`): `null` \| [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/components/SiteDetails/SiteDetails.tsx:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetails.tsx#L101)

Site details component with tabbed interface for comprehensive site
monitoring. Provides overview, history, analytics, and settings views for a
monitored site.

Uses composition pattern with specialized tab components and custom hooks for
state management and data fetching.

## Parameters

### props

[`SiteDetailsProperties`](../interfaces/SiteDetailsProperties.md)

Component props

## Returns

`null` \| [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)

JSX element containing the site details interface

## Example

```tsx
<SiteDetails
    site={selectedSite}
    onClose={() => setSelectedSite(null)}
/>;
```
