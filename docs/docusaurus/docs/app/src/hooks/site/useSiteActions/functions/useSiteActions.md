# Function: useSiteActions()

> **useSiteActions**(`site`, `monitor`): [`SiteActionsResult`](../interfaces/SiteActionsResult.md)

Defined in: [src/hooks/site/useSiteActions.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteActions.ts#L30)

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
