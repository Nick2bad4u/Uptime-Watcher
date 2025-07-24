# Function: getSiteDisplayStatus()

> **getSiteDisplayStatus**(`site`): [`SiteStatus`](../../../types/type-aliases/SiteStatus.md)

Defined in: [shared/utils/siteStatus.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/utils/siteStatus.ts#L81)

Get a display-friendly site status that considers both operational status and monitoring state.
This is the primary function to use for displaying site status in the UI.

## Parameters

### site

[`SiteForStatus`](../../../types/interfaces/SiteForStatus.md)

The site to get display status for

## Returns

[`SiteStatus`](../../../types/type-aliases/SiteStatus.md)

Display status for the site
