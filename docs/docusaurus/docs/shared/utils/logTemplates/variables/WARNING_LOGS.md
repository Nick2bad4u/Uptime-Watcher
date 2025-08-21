# Variable: WARNING\_LOGS

> `const` **WARNING\_LOGS**: `object`

Defined in: [shared/utils/logTemplates.ts:317](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/logTemplates.ts#L317)

Warning and error log templates.

## Type declaration

### APPLICATION\_MONITOR\_DOWN

> `readonly` **APPLICATION\_MONITOR\_DOWN**: `"[ApplicationService] Monitor failure detected - forwarding to renderer"` = `"[ApplicationService] Monitor failure detected - forwarding to renderer"`

Application warnings

### DATABASE\_MONITOR\_VALIDATION\_CONTINUE

> `readonly` **DATABASE\_MONITOR\_VALIDATION\_CONTINUE**: `"[DatabaseSchema] Continuing without monitor type validation"` = `"[DatabaseSchema] Continuing without monitor type validation"`

Database warnings

### DATABASE\_MONITOR\_VALIDATION\_MISSING

> `readonly` **DATABASE\_MONITOR\_VALIDATION\_MISSING**: `"[DatabaseSchema] No monitor types registered - validation will allow any type"` = `"[DatabaseSchema] No monitor types registered - validation will allow any type"`

### HISTORY\_INVALID\_STATUS

> `readonly` **HISTORY\_INVALID\_STATUS**: `"[HistoryMapper] Invalid status value, defaulting to 'down'"` = `"[HistoryMapper] Invalid status value, defaulting to 'down'"`

History warnings

### MONITOR\_ACTIVE\_OPERATIONS\_INVALID

> `readonly` **MONITOR\_ACTIVE\_OPERATIONS\_INVALID**: `"active_operations contains invalid or unsafe data, using empty array"` = `"active_operations contains invalid or unsafe data, using empty array"`

Monitor warnings

### MONITOR\_ACTIVE\_OPERATIONS\_PARSE\_FAILED

> `readonly` **MONITOR\_ACTIVE\_OPERATIONS\_PARSE\_FAILED**: `"Failed to parse active_operations, using empty array"` = `"Failed to parse active_operations, using empty array"`

### MONITOR\_CONFIG\_UPDATE\_FAILED\_INSTANCE

> `readonly` **MONITOR\_CONFIG\_UPDATE\_FAILED\_INSTANCE**: `"Failed to update config for monitor instance"` = `"Failed to update config for monitor instance"`

### MONITOR\_CONFIG\_UPDATE\_FAILED\_TYPE

> `readonly` **MONITOR\_CONFIG\_UPDATE\_FAILED\_TYPE**: `"Failed to update config for monitor type `type`"` = `"Failed to update config for monitor type `type`"`

### MONITOR\_FRESH\_DATA\_MISSING

> `readonly` **MONITOR\_FRESH\_DATA\_MISSING**: `"Fresh monitor data not found for `monitorId`"` = `"Fresh monitor data not found for `monitorId`"`

### MONITOR\_NOT\_FOUND\_CACHE

> `readonly` **MONITOR\_NOT\_FOUND\_CACHE**: `"Monitor `monitorId` not found, ignoring result"` = `"Monitor `monitorId` not found, ignoring result"`

### MONITOR\_NOT\_MONITORING

> `readonly` **MONITOR\_NOT\_MONITORING**: `"Monitor `monitorId` no longer monitoring, ignoring result"` = `"Monitor `monitorId` no longer monitoring, ignoring result"`

### MONITOR\_TYPE\_UNKNOWN\_CHECK

> `readonly` **MONITOR\_TYPE\_UNKNOWN\_CHECK**: `"Unknown monitor type: `monitorType`"` = `"Unknown monitor type: `monitorType`"`

### MONITOR\_TYPE\_UNKNOWN\_DETAIL

> `readonly` **MONITOR\_TYPE\_UNKNOWN\_DETAIL**: `"Unknown monitor type for detail formatting"` = `"Unknown monitor type for detail formatting"`

### MONITOR\_TYPE\_UNKNOWN\_TITLE

> `readonly` **MONITOR\_TYPE\_UNKNOWN\_TITLE**: `"Unknown monitor type for title suffix formatting"` = `"Unknown monitor type for title suffix formatting"`

### NOTIFICATIONS\_UNSUPPORTED

> `readonly` **NOTIFICATIONS\_UNSUPPORTED**: `"Notifications not supported on this platform"` = `"Notifications not supported on this platform"`

Notification warnings

### OPERATION\_TIMEOUT

> `readonly` **OPERATION\_TIMEOUT**: `"Operation `operationId` timed out, cancelling"` = `"Operation `operationId` timed out, cancelling"`

Operation warnings

### RECURSIVE\_CALL\_PREVENTED

> `readonly` **RECURSIVE\_CALL\_PREVENTED**: `"Preventing recursive call for `identifier`/`monitorId`"` = `"Preventing recursive call for `identifier`/`monitorId`"`

### SITE\_NOT\_FOUND\_MANUAL

> `readonly` **SITE\_NOT\_FOUND\_MANUAL**: `"Site `identifier` not found or has no monitors for manual check"` = `"Site `identifier` not found or has no monitors for manual check"`

Site not found warnings

### SITE\_NOT\_FOUND\_SCHEDULED

> `readonly` **SITE\_NOT\_FOUND\_SCHEDULED**: `"Site `siteIdentifier` not found in cache for scheduled check"` = `"Site `siteIdentifier` not found in cache for scheduled check"`
