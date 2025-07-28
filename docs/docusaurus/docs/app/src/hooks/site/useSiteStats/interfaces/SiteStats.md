# Interface: SiteStats

Defined in: [src/hooks/site/useSiteStats.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteStats.ts#L21)

Interface for site statistics data

## Remarks

All values are computed from StatusHistory records:
- uptime: Integer percentage (0-100) based on status="up" ratio
- checkCount: Total number of history records processed
- averageResponseTime: Mean response time for successful checks only

## Extended by

- [`UseSiteResult`](../../useSite/interfaces/UseSiteResult.md)

## Properties

### averageResponseTime

> **averageResponseTime**: `number`

Defined in: [src/hooks/site/useSiteStats.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteStats.ts#L23)

Average response time in milliseconds (only for successful "up" checks)

***

### checkCount

> **checkCount**: `number`

Defined in: [src/hooks/site/useSiteStats.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteStats.ts#L25)

Total number of checks performed

***

### uptime

> **uptime**: `number`

Defined in: [src/hooks/site/useSiteStats.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteStats.ts#L27)

Uptime percentage as integer (0-100)
