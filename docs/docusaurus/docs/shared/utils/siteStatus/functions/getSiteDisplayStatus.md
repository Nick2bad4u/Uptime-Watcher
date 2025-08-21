# Function: getSiteDisplayStatus()

> **getSiteDisplayStatus**(`site`): [`SiteStatus`](../../../types/type-aliases/SiteStatus.md)

Defined in: [shared/utils/siteStatus.ts:131](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/siteStatus.ts#L131)

Determines the display status for a site, considering both operational and
monitoring states.

## Parameters

### site

[`SiteForStatus`](../../../types/interfaces/SiteForStatus.md)

The [SiteForStatus](../../../types/interfaces/SiteForStatus.md) object representing the site to
  evaluate.

## Returns

[`SiteStatus`](../../../types/type-aliases/SiteStatus.md)

`"unknown"` if there are no monitors.

## Remarks

This is the primary function for determining the status to display in the UI.

## Example

```typescript
const displayStatus = getSiteDisplayStatus(site);
// displayStatus: "up" | "down" | "pending" | "paused" | "mixed" | "unknown"
```
