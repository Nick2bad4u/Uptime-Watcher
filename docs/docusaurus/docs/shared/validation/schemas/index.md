# shared/validation/schemas

Shared Zod validation schemas and validation utilities for monitor and site
data.

## Remarks

These schemas and functions are used by both frontend and backend to ensure
data integrity. Validation constraints are synchronized with UI constants in
constants.ts. All validation logic is centralized here for consistency
and maintainability.

## Interfaces

- [MonitorSchemas](interfaces/MonitorSchemas.md)

## Type Aliases

- [HttpMonitor](type-aliases/HttpMonitor.md)
- [DnsMonitor](type-aliases/DnsMonitor.md)
- [Monitor](type-aliases/Monitor.md)
- [PingMonitor](type-aliases/PingMonitor.md)
- [PortMonitor](type-aliases/PortMonitor.md)
- [Site](type-aliases/Site.md)

## Variables

- [baseMonitorSchema](variables/baseMonitorSchema.md)
- [httpMonitorSchema](variables/httpMonitorSchema.md)
- [portMonitorSchema](variables/portMonitorSchema.md)
- [pingMonitorSchema](variables/pingMonitorSchema.md)
- [dnsMonitorSchema](variables/dnsMonitorSchema.md)
- [monitorSchema](variables/monitorSchema.md)
- [siteSchema](variables/siteSchema.md)
- [monitorSchemas](variables/monitorSchemas.md)

## Functions

- [validateMonitorData](functions/validateMonitorData.md)
- [validateMonitorField](functions/validateMonitorField.md)
- [validateSiteData](functions/validateSiteData.md)
