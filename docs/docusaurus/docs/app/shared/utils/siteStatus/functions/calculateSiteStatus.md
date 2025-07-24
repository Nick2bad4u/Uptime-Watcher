# Function: calculateSiteStatus()

> **calculateSiteStatus**(`site`): [`SiteStatus`](../../../types/type-aliases/SiteStatus.md)

Defined in: [shared/utils/siteStatus.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/utils/siteStatus.ts#L55)

Calculate the overall site status based on monitor states.

Logic:
- "up": All monitors are up and running
- "down": All monitors are down
- "pending": All monitors are pending
- "paused": All monitors are paused (not monitoring)
- "mixed": Monitors have different statuses (some up, some down, some paused, etc.)
- "unknown": No monitors exist

## Parameters

### site

[`SiteForStatus`](../../../types/interfaces/SiteForStatus.md)

The site to calculate status for

## Returns

[`SiteStatus`](../../../types/type-aliases/SiteStatus.md)

Overall site status
