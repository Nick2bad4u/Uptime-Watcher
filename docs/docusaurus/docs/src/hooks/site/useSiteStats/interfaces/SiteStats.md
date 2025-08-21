# Interface: SiteStats

Defined in: [src/hooks/site/useSiteStats.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteStats.ts#L22)

Interface for site statistics data

## Remarks

All values are computed from StatusHistory records:

- Uptime: Integer percentage (0-100) based on status="up" ratio
- CheckCount: Total number of history records processed
- AverageResponseTime: Mean response time for successful checks only

## Extended by

- [`UseSiteResult`](../../useSite/interfaces/UseSiteResult.md)

## Properties

### averageResponseTime

> **averageResponseTime**: `number`

Defined in: [src/hooks/site/useSiteStats.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteStats.ts#L26)

Average response time in milliseconds (only for successful "up" checks)

***

### checkCount

> **checkCount**: `number`

Defined in: [src/hooks/site/useSiteStats.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteStats.ts#L28)

Total number of checks performed

***

### uptime

> **uptime**: `number`

Defined in: [src/hooks/site/useSiteStats.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteStats.ts#L30)

Uptime percentage as integer (0-100)
