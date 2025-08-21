# Type Alias: ErrorMessage

> **ErrorMessage** = *typeof* [`DATABASE_ERRORS`](../variables/DATABASE_ERRORS.md)\[keyof *typeof* [`DATABASE_ERRORS`](../variables/DATABASE_ERRORS.md)\] \| *typeof* [`IPC_ERRORS`](../variables/IPC_ERRORS.md)\[keyof *typeof* [`IPC_ERRORS`](../variables/IPC_ERRORS.md)\] \| *typeof* [`MONITOR_ERRORS`](../variables/MONITOR_ERRORS.md)\[keyof *typeof* [`MONITOR_ERRORS`](../variables/MONITOR_ERRORS.md)\] \| *typeof* [`NETWORK_ERRORS`](../variables/NETWORK_ERRORS.md)\[keyof *typeof* [`NETWORK_ERRORS`](../variables/NETWORK_ERRORS.md)\] \| *typeof* [`SITE_ERRORS`](../variables/SITE_ERRORS.md)\[keyof *typeof* [`SITE_ERRORS`](../variables/SITE_ERRORS.md)\] \| *typeof* [`SYSTEM_ERRORS`](../variables/SYSTEM_ERRORS.md)\[keyof *typeof* [`SYSTEM_ERRORS`](../variables/SYSTEM_ERRORS.md)\] \| *typeof* [`VALIDATION_ERRORS`](../variables/VALIDATION_ERRORS.md)\[keyof *typeof* [`VALIDATION_ERRORS`](../variables/VALIDATION_ERRORS.md)\]

Defined in: [shared/utils/errorCatalog.ts:345](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L345)

Type representing all possible error message values.

## Remarks

Union type of all error message strings from the catalog, useful for
type-safe error handling and message validation.
