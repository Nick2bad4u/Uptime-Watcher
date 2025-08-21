# Function: useSiteDetails()

> **useSiteDetails**(`props`): [`UseSiteDetailsResult`](../interfaces/UseSiteDetailsResult.md)

Defined in: [src/hooks/site/useSiteDetails.ts:137](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteDetails.ts#L137)

Hook for managing site details state and operations.

Provides all necessary state and handlers for the site details view,
including monitor selection, monitoring controls, settings management, and
integration with analytics.

## Parameters

### props

[`UseSiteDetailsProperties`](../interfaces/UseSiteDetailsProperties.md)

Hook props containing the site to manage

## Returns

[`UseSiteDetailsResult`](../interfaces/UseSiteDetailsResult.md)

Object containing all site details state and handlers

## Example

```tsx
function SiteDetails({ site }) {
    const {
        currentSite,
        selectedMonitor,
        isLoading,
        handleStartMonitoring,
        handleStopMonitoring,
        // ... other state and handlers
    } = useSiteDetails({ site });

    // Use the state and handlers in your component
}
```
