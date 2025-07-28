# Function: calculateSiteMonitoringStatus()

> **calculateSiteMonitoringStatus**(`site`): `"partial"` \| `"running"` \| `"stopped"`

Defined in: [shared/utils/siteStatus.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/siteStatus.ts#L29)

Calculates the overall monitoring state for a site based on its monitors.

## Parameters

### site

[`SiteForStatus`](../../../types/interfaces/SiteForStatus.md)

The [SiteForStatus](../../../types/interfaces/SiteForStatus.md) object representing the site to evaluate.

## Returns

`"partial"` \| `"running"` \| `"stopped"`

The monitoring state: `"running"`, `"stopped"`, or `"partial"`.

## Remarks

The monitoring state reflects whether all, some, or none of the site's monitors are actively monitoring.
- Returns `"running"` if all monitors are actively monitoring.
- Returns `"stopped"` if no monitors are actively monitoring or if there are no monitors.
- Returns `"partial"` if some monitors are monitoring and some are not.

## Example

```typescript
const status = calculateSiteMonitoringStatus(site);
// status: "running" | "stopped" | "partial"
```
