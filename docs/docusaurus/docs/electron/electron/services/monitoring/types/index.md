# electron/services/monitoring/types

Type definitions for monitoring services and operations.

## Remarks

Defines interfaces and types used by monitor services to perform health checks
and manage monitoring configurations across different monitor types.

**Configuration Defaults:**
Default values referenced in this file are implemented in:
- `electron/constants.ts` - Global monitoring constants
- `HttpMonitor.ts` - HTTP-specific defaults
- `PortMonitor.ts` - Port monitoring defaults

**Type Safety:**
All interfaces use TypeScript strict mode and require explicit handling
of optional properties. No `any` types are used to ensure compile-time safety.

**Extension Guidelines:**
When adding new monitor types:
1. Extend MonitorConfig with type-specific options if needed
2. Ensure MonitorCheckResult covers new result formats
3. Update documentation with new examples
4. Add default value constants to appropriate files

## Interfaces

- [IMonitorService](interfaces/IMonitorService.md)
- [MonitorCheckResult](interfaces/MonitorCheckResult.md)
- [MonitorConfig](interfaces/MonitorConfig.md)
