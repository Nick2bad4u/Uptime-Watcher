# Function: calculateSiteMonitoringStatus()

> **calculateSiteMonitoringStatus**(`site`): `"partial"` \| `"running"` \| `"stopped"`

Defined in: [shared/utils/siteStatus.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/utils/siteStatus.ts#L21)

Calculate the overall site monitoring status.

Logic:
- "running": All monitors are actively monitoring
- "stopped": No monitors are actively monitoring
- "partial": Some monitors are monitoring, some are not

## Parameters

### site

[`SiteForStatus`](../../../types/interfaces/SiteForStatus.md)

The site to calculate monitoring status for

## Returns

`"partial"` \| `"running"` \| `"stopped"`

Overall monitoring status
