# Function: SiteDetails()

> **SiteDetails**(`props`): `null` \| [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/components/SiteDetails/SiteDetails.tsx:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetails.tsx#L87)

Site details component with tabbed interface for comprehensive site monitoring.
Provides overview, history, analytics, and settings views for a monitored site.

Uses composition pattern with specialized tab components and custom hooks for
state management and data fetching.

## Parameters

### props

[`SiteDetailsProperties`](../interfaces/SiteDetailsProperties.md)

Component props

## Returns

`null` \| [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

JSX element containing the site details interface

## Example

```tsx
<SiteDetails
  site={selectedSite}
  onClose={() => setSelectedSite(null)}
/>
```
