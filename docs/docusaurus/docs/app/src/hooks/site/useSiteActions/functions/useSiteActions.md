# Function: useSiteActions()

> **useSiteActions**(`site`, `monitor`): [`SiteActionsResult`](../interfaces/SiteActionsResult.md)

Defined in: [src/hooks/site/useSiteActions.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteActions.ts#L30)

Hook to handle site-related actions like checking status and monitoring
Integrated with logger and state management for proper tracking

## Parameters

### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

The site object to act upon

### monitor

The specific monitor to use for actions

`undefined` | [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

## Returns

[`SiteActionsResult`](../interfaces/SiteActionsResult.md)

Object containing action handler functions
