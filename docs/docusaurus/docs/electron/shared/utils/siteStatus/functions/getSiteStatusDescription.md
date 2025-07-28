# Function: getSiteStatusDescription()

> **getSiteStatusDescription**(`site`): `string`

Defined in: [shared/utils/siteStatus.ts:146](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/siteStatus.ts#L146)

Generates a human-readable description of the site's current status.

## Parameters

### site

[`SiteForStatus`](../../../types/interfaces/SiteForStatus.md)

The [SiteForStatus](../../../types/interfaces/SiteForStatus.md) object representing the site to describe.

## Returns

`string`

A human-readable string describing the site's status.

## Remarks

The description summarizes the site's status and monitoring activity for display in the UI.

## Example

```typescript
const desc = getSiteStatusDescription(site);
// desc: "All 3 monitors are up and running", "Mixed status (2/3 monitoring active)", etc.
```
