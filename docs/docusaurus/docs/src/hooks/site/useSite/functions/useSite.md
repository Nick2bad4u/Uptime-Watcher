# Function: useSite()

> **useSite**(`site`): [`UseSiteResult`](../interfaces/UseSiteResult.md)

Defined in: [src/hooks/site/useSite.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSite.ts#L79)

A comprehensive hook that combines site monitoring, actions, statistics, and
UI state

## Parameters

### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

The site to work with

## Returns

[`UseSiteResult`](../interfaces/UseSiteResult.md)

Combined data and functionality from all site-related hooks

## Remarks

This hook serves as a composition layer that combines:

- Monitor data and selection (from useSiteMonitor)
- Site statistics and analytics (from useSiteStats)
- Action handlers for site operations (from useSiteActions)
- UI loading state (from useErrorStore)

Property precedence: Actions → Monitor → Stats → Loading state. The isLoading
property is added last and will not be overwritten.

## Example

```tsx
function SiteCard({ site }) {
  const {
    monitor,
    status,
    uptime,
    handleCheckNow,
    handleStartMonitoring,
    isLoading
  } = useSite(site);

  return (
    <div>
      <h3>{site.name}</h3>
      <p>Status: {status}</p>
      <p>Uptime: {uptime}%</p>
      <button onClick={handleCheckNow} disabled={isLoading}>
        Check Now
      </button>
    </div>
  );
}
```

## See

[UseSiteResult](../interfaces/UseSiteResult.md) for the complete interface specification
