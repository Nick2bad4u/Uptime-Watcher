# shared/types

Shared type definitions used across frontend and backend.

## Remarks

All core domain types (Monitor, Site, StatusUpdate, etc.) live here. Both
frontend and backend must import from this file for consistency. Event types
are separate to avoid circular dependencies.

## Interfaces

- [MonitorStatusConstants](interfaces/MonitorStatusConstants.md)
- [Monitor](interfaces/Monitor.md)
- [MonitorFieldDefinition](interfaces/MonitorFieldDefinition.md)
- [Site](interfaces/Site.md)
- [SiteForStatus](interfaces/SiteForStatus.md)
- [StatusHistory](interfaces/StatusHistory.md)
- [StatusUpdate](interfaces/StatusUpdate.md)

## Type Aliases

- [MonitorStatus](type-aliases/MonitorStatus.md)
- [MonitorType](type-aliases/MonitorType.md)
- [SiteStatus](type-aliases/SiteStatus.md)

## Variables

- [BASE\_MONITOR\_TYPES](variables/BASE_MONITOR_TYPES.md)
- [MONITOR\_STATUS](variables/MONITOR_STATUS.md)
- [DEFAULT\_MONITOR\_STATUS](variables/DEFAULT_MONITOR_STATUS.md)
- [DEFAULT\_SITE\_STATUS](variables/DEFAULT_SITE_STATUS.md)

## Functions

- [isComputedSiteStatus](functions/isComputedSiteStatus.md)
- [isMonitorStatus](functions/isMonitorStatus.md)
- [isSiteStatus](functions/isSiteStatus.md)
- [validateMonitor](functions/validateMonitor.md)
