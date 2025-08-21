# Function: calculateSiteMonitoringStatus()

> **calculateSiteMonitoringStatus**(`site`): `"partial"` \| `"running"` \| `"stopped"`

Defined in: [shared/utils/siteStatus.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/siteStatus.ts#L38)

Calculates the overall monitoring state for a site based on its monitors.

## Parameters

### site

[`SiteForStatus`](../../../types/interfaces/SiteForStatus.md)

The [SiteForStatus](../../../types/interfaces/SiteForStatus.md) object representing the site to
  evaluate.

## Returns

`"partial"` \| `"running"` \| `"stopped"`

The monitoring state: `"running"`, `"stopped"`, or `"partial"`.

## Remarks

The monitoring state reflects whether all, some, or none of the site's
monitors are actively monitoring.

- Returns `"running"` if all monitors are actively monitoring.
- Returns `"stopped"` if no monitors are actively monitoring or if there are no
  monitors.
- Returns `"partial"` if some monitors are monitoring and some are not.

## Example

```typescript
const status = calculateSiteMonitoringStatus(site);
// status: "running" | "stopped" | "partial"
```
