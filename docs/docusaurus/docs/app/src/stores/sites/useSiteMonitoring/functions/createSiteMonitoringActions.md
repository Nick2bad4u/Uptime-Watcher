# Function: createSiteMonitoringActions()

> **createSiteMonitoringActions**(): [`SiteMonitoringActions`](../interfaces/SiteMonitoringActions.md)

Defined in: [src/stores/sites/useSiteMonitoring.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSiteMonitoring.ts#L36)

Creates site monitoring actions for managing monitoring lifecycle operations.

## Returns

[`SiteMonitoringActions`](../interfaces/SiteMonitoringActions.md)

Object containing all site monitoring action functions

## Remarks

This factory function creates actions for starting, stopping, and manually checking sites.
All operations communicate with the backend via IPC services and rely on event-driven
updates for state synchronization.
