# shared/types/monitorConfig

Monitor configuration type definitions for Uptime Watcher.

## Remarks

These interfaces provide type-safe configuration structures for different
monitor types. Each monitor type has its own specific configuration interface
that extends the base configuration. This ensures proper validation and type
checking throughout the monitoring system.

## Interfaces

- [AdvancedMonitorConfig](interfaces/AdvancedMonitorConfig.md)
- [BaseMonitorConfig](interfaces/BaseMonitorConfig.md)
- [HttpMonitorConfig](interfaces/HttpMonitorConfig.md)
- [MonitorConfigTemplate](interfaces/MonitorConfigTemplate.md)
- [PingMonitorConfig](interfaces/PingMonitorConfig.md)
- [PortMonitorConfig](interfaces/PortMonitorConfig.md)

## Type Aliases

- [MonitorConfig](type-aliases/MonitorConfig.md)

## Variables

- [DEFAULT\_MONITOR\_CONFIG](variables/DEFAULT_MONITOR_CONFIG.md)

## Functions

- [isHttpMonitorConfig](functions/isHttpMonitorConfig.md)
- [isPingMonitorConfig](functions/isPingMonitorConfig.md)
- [isPortMonitorConfig](functions/isPortMonitorConfig.md)
