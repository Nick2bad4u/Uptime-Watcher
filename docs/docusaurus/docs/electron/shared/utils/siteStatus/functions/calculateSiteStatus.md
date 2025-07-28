# Function: calculateSiteStatus()

> **calculateSiteStatus**(`site`): [`SiteStatus`](../../../types/type-aliases/SiteStatus.md)

Defined in: [shared/utils/siteStatus.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/siteStatus.ts#L70)

Calculates the overall operational status for a site based on the statuses of its monitors.

## Parameters

### site

[`SiteForStatus`](../../../types/interfaces/SiteForStatus.md)

The [SiteForStatus](../../../types/interfaces/SiteForStatus.md) object representing the site to evaluate.

## Returns

[`SiteStatus`](../../../types/type-aliases/SiteStatus.md)

The operational status as a [SiteStatus](../../../types/type-aliases/SiteStatus.md) value.

## Remarks

The operational status reflects the aggregate health of all monitors:
- Returns `"up"` if all monitors are up.
- Returns `"down"` if all monitors are down.
- Returns `"pending"` if all monitors are pending.
- Returns `"paused"` if all monitors are paused.
- Returns `"mixed"` if monitors have different statuses.
- Returns `"unknown"` if there are no monitors.

## Example

```typescript
const status = calculateSiteStatus(site);
// status: "up" | "down" | "pending" | "paused" | "mixed" | "unknown"
```
