# Function: calculateSiteMonitoringStatus()

> **calculateSiteMonitoringStatus**(`site`): `"partial"` \| `"running"` \| `"stopped"`

Defined in: [src/utils/siteStatus.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/siteStatus.ts#L23)

Calculates the overall monitoring state for a site based on its monitors.

## Parameters

### site

[`SiteForStatus`](../../../../shared/types/interfaces/SiteForStatus.md)

The site to evaluate.

## Returns

`"partial"` \| `"running"` \| `"stopped"`

The monitoring state: "running", "stopped", or "partial".
