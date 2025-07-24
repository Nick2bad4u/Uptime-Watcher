# Function: useSiteStats()

> **useSiteStats**(`history`): [`SiteStats`](../interfaces/SiteStats.md)

Defined in: [src/hooks/site/useSiteStats.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteStats.ts#L28)

Custom hook to calculate statistics based on a monitor's history

## Parameters

### history

[`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]

Array of status history records

## Returns

[`SiteStats`](../interfaces/SiteStats.md)

Object containing calculated statistics (uptime, checkCount, averageResponseTime)
