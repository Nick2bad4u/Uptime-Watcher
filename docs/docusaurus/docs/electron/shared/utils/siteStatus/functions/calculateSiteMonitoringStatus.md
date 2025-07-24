# Function: calculateSiteMonitoringStatus()

> **calculateSiteMonitoringStatus**(`site`): `"stopped"` \| `"partial"` \| `"running"`

Defined in: [shared/utils/siteStatus.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/utils/siteStatus.ts#L21)

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

`"stopped"` \| `"partial"` \| `"running"`

Overall monitoring status
