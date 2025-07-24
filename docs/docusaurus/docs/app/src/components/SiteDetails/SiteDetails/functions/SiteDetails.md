# Function: SiteDetails()

> **SiteDetails**(`props`): `null` \| `Element`

Defined in: [src/components/SiteDetails/SiteDetails.tsx:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/components/SiteDetails/SiteDetails.tsx#L82)

Site details component with tabbed interface for comprehensive site monitoring.
Provides overview, history, analytics, and settings views for a monitored site.

Uses composition pattern with specialized tab components and custom hooks for
state management and data fetching.

## Parameters

### props

`SiteDetailsProperties`

Component props

## Returns

`null` \| `Element`

JSX element containing the site details interface

## Example

```tsx
<SiteDetails
  site={selectedSite}
  onClose={() => setSelectedSite(null)}
/>
```
