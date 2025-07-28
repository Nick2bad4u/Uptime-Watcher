# Function: getSiteDisplayStatus()

> **getSiteDisplayStatus**(`site`): [`SiteStatus`](../../../types/type-aliases/SiteStatus.md)

Defined in: [shared/utils/siteStatus.ts:108](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/siteStatus.ts#L108)

Determines the display status for a site, considering both operational and monitoring states.

## Parameters

### site

[`SiteForStatus`](../../../types/interfaces/SiteForStatus.md)

The [SiteForStatus](../../../types/interfaces/SiteForStatus.md) object representing the site to evaluate.

## Returns

[`SiteStatus`](../../../types/type-aliases/SiteStatus.md)

The display status as a [SiteStatus](../../../types/type-aliases/SiteStatus.md) value.

## Remarks

This is the primary function for determining the status to display in the UI.
- Returns `"unknown"` if there are no monitors.
- Returns `"paused"` if no monitors are actively monitoring.
- Returns `"mixed"` if monitoring is partial (some monitors running, some not).
- Otherwise, returns the operational status as determined by [calculateSiteStatus](calculateSiteStatus.md).

## Example

```typescript
const displayStatus = getSiteDisplayStatus(site);
// displayStatus: "up" | "down" | "pending" | "paused" | "mixed" | "unknown"
```
