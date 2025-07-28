# Function: getSiteStatusVariant()

> **getSiteStatusVariant**(`status`): `"error"` \| `"info"` \| `"success"` \| `"warning"`

Defined in: [shared/utils/siteStatus.ts:194](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/siteStatus.ts#L194)

Maps a [SiteStatus](../../../types/type-aliases/SiteStatus.md) value to a UI color variant for status indicators.

## Parameters

### status

[`SiteStatus`](../../../types/type-aliases/SiteStatus.md)

The [SiteStatus](../../../types/type-aliases/SiteStatus.md) value to map.

## Returns

`"error"` \| `"info"` \| `"success"` \| `"warning"`

The color variant: `"success"`, `"error"`, `"warning"`, or `"info"`.

## Remarks

The returned variant is intended for use in UI components (e.g., badges, icons).
- `"success"`: All monitors are healthy (`"up"`).
- `"error"`: All monitors are down or status is unknown (`"down"` or `"unknown"`).
- `"warning"`: Mixed or paused status (`"mixed"` or `"paused"`).
- `"info"`: Pending status (`"pending"`).

## Example

```typescript
const color = getSiteStatusVariant("up"); // "success"
```
