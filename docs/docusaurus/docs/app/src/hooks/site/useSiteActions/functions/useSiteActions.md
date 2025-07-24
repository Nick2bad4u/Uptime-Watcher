# Function: useSiteActions()

> **useSiteActions**(`site`, `monitor`): `SiteActionsResult`

Defined in: [src/hooks/site/useSiteActions.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/hooks/site/useSiteActions.ts#L25)

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

`SiteActionsResult`

Object containing action handler functions
