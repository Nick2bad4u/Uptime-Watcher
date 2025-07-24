# electron/services/database/utils/monitorMapper

Monitor data mapping utilities.

## Remarks

Handles conversion between database rows and application monitor objects.
Uses dynamic schema based on monitor type registry for extensible monitor types.

## Interfaces

- [MonitorRow](interfaces/MonitorRow.md)

## Functions

- [buildMonitorParameters](functions/buildMonitorParameters.md)
- [isValidMonitorRow](functions/isValidMonitorRow.md)
- [rowsToMonitors](functions/rowsToMonitors.md)
- [rowToMonitor](functions/rowToMonitor.md)
- [rowToMonitorOrUndefined](functions/rowToMonitorOrUndefined.md)
