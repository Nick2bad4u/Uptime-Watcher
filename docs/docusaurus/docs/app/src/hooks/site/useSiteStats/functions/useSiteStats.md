# Function: useSiteStats()

> **useSiteStats**(`history`): `SiteStats`

Defined in: [src/hooks/site/useSiteStats.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteStats.ts#L23)

Custom hook to calculate statistics based on a monitor's history

## Parameters

### history

[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]

Array of status history records

## Returns

`SiteStats`

Object containing calculated statistics (uptime, checkCount, averageResponseTime)
