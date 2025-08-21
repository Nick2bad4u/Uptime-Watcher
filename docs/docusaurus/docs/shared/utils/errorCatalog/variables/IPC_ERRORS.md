# Variable: IPC\_ERRORS

> `const` **IPC\_ERRORS**: `object`

Defined in: [shared/utils/errorCatalog.ts:290](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L290)

IPC (Inter-Process Communication) error messages.

## Type declaration

### INVALID\_RESPONSE\_FORMAT

> `readonly` **INVALID\_RESPONSE\_FORMAT**: `"Invalid IPC response format"` = `"Invalid IPC response format"`

Error when IPC response format is invalid

### IPC\_OPERATION\_FAILED

> `readonly` **IPC\_OPERATION\_FAILED**: `"Operation failed"` = `"Operation failed"`

Error when IPC operation fails

### VALIDATION\_FAILED

> `readonly` **VALIDATION\_FAILED**: `"IPC validation failed"` = `"IPC validation failed"`

Error when IPC validation fails

## Remarks

Error messages for IPC operations, validation, and communication between main
and renderer processes.
