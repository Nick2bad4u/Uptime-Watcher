# Variable: ERROR\_LOGS

> `const` **ERROR\_LOGS**: `object`

Defined in: [shared/utils/logTemplates.ts:246](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/logTemplates.ts#L246)

Error log templates.

## Type declaration

### APPLICATION\_CLEANUP\_ERROR

> `readonly` **APPLICATION\_CLEANUP\_ERROR**: `"[ApplicationService] Error during cleanup"` = `"[ApplicationService] Error during cleanup"`

Application errors

### APPLICATION\_FORWARD\_CACHE\_INVALIDATION\_ERROR

> `readonly` **APPLICATION\_FORWARD\_CACHE\_INVALIDATION\_ERROR**: `"[ApplicationService] Failed to forward cache invalidation to renderer"` = `"[ApplicationService] Failed to forward cache invalidation to renderer"`

### APPLICATION\_FORWARD\_MONITOR\_DOWN\_ERROR

> `readonly` **APPLICATION\_FORWARD\_MONITOR\_DOWN\_ERROR**: `"[ApplicationService] Failed to forward monitor down to renderer"` = `"[ApplicationService] Failed to forward monitor down to renderer"`

### APPLICATION\_FORWARD\_MONITOR\_STATUS\_ERROR

> `readonly` **APPLICATION\_FORWARD\_MONITOR\_STATUS\_ERROR**: `"[ApplicationService] Failed to forward monitor status change to renderer"` = `"[ApplicationService] Failed to forward monitor status change to renderer"`

### APPLICATION\_FORWARD\_MONITOR\_UP\_ERROR

> `readonly` **APPLICATION\_FORWARD\_MONITOR\_UP\_ERROR**: `"[ApplicationService] Failed to forward monitor up to renderer"` = `"[ApplicationService] Failed to forward monitor up to renderer"`

### APPLICATION\_FORWARD\_MONITORING\_STARTED\_ERROR

> `readonly` **APPLICATION\_FORWARD\_MONITORING\_STARTED\_ERROR**: `"[ApplicationService] Failed to forward monitoring started to renderer"` = `"[ApplicationService] Failed to forward monitoring started to renderer"`

### APPLICATION\_FORWARD\_MONITORING\_STOPPED\_ERROR

> `readonly` **APPLICATION\_FORWARD\_MONITORING\_STOPPED\_ERROR**: `"[ApplicationService] Failed to forward monitoring stopped to renderer"` = `"[ApplicationService] Failed to forward monitoring stopped to renderer"`

### APPLICATION\_INITIALIZATION\_ERROR

> `readonly` **APPLICATION\_INITIALIZATION\_ERROR**: `"[ApplicationService] Error during app initialization"` = `"[ApplicationService] Error during app initialization"`

### APPLICATION\_SYSTEM\_ERROR

> `readonly` **APPLICATION\_SYSTEM\_ERROR**: `"[ApplicationService] System error: `context`"` = `"[ApplicationService] System error: `context`"`

### APPLICATION\_UPDATE\_CHECK\_ERROR

> `readonly` **APPLICATION\_UPDATE\_CHECK\_ERROR**: `"[ApplicationService] Failed to check for updates"` = `"[ApplicationService] Failed to check for updates"`

### DATABASE\_BACKUP\_FAILED

> `readonly` **DATABASE\_BACKUP\_FAILED**: `"[DatabaseBackup] Failed to create database backup"` = `"[DatabaseBackup] Failed to create database backup"`

Database errors

### DATABASE\_INDEXES\_FAILED

> `readonly` **DATABASE\_INDEXES\_FAILED**: `"[DatabaseSchema] Failed to create indexes"` = `"[DatabaseSchema] Failed to create indexes"`

### DATABASE\_SCHEMA\_FAILED

> `readonly` **DATABASE\_SCHEMA\_FAILED**: `"[DatabaseSchema] Failed to create database schema"` = `"[DatabaseSchema] Failed to create database schema"`

### DATABASE\_TABLES\_FAILED

> `readonly` **DATABASE\_TABLES\_FAILED**: `"[DatabaseSchema] Failed to create tables"` = `"[DatabaseSchema] Failed to create tables"`

### DATABASE\_VALIDATION\_SETUP\_FAILED

> `readonly` **DATABASE\_VALIDATION\_SETUP\_FAILED**: `"[DatabaseSchema] Failed to setup monitor type validation"` = `"[DatabaseSchema] Failed to setup monitor type validation"`

### EVENT\_BUS\_EMISSION\_FAILED

> `readonly` **EVENT\_BUS\_EMISSION\_FAILED**: `"[TypedEventBus:`busId`] Failed to emit '`eventName`' [`correlationId`]"` = `"[TypedEventBus:`busId`] Failed to emit '`eventName`' [`correlationId`]"`

Event bus errors

### HISTORY\_ADD\_FAILED

> `readonly` **HISTORY\_ADD\_FAILED**: `"[HistoryManipulation] Failed to add history entry for monitor: `monitorId`"` = `"[HistoryManipulation] Failed to add history entry for monitor: `monitorId`"`

History errors

### HISTORY\_BULK\_INSERT\_FAILED

> `readonly` **HISTORY\_BULK\_INSERT\_FAILED**: `"[HistoryManipulation] Failed to bulk insert history for monitor: `monitorId`"` = `"[HistoryManipulation] Failed to bulk insert history for monitor: `monitorId`"`

### HISTORY\_FETCH\_FAILED

> `readonly` **HISTORY\_FETCH\_FAILED**: `"[HistoryQuery] Failed to fetch history for monitor: `monitorId`"` = `"[HistoryQuery] Failed to fetch history for monitor: `monitorId`"`

### HISTORY\_LATEST\_FETCH\_FAILED

> `readonly` **HISTORY\_LATEST\_FETCH\_FAILED**: `"[HistoryQuery] Failed to get latest history entry for monitor: `monitorId`"` = `"[HistoryQuery] Failed to get latest history entry for monitor: `monitorId`"`

### HISTORY\_MAPPER\_FAILED

> `readonly` **HISTORY\_MAPPER\_FAILED**: `"[HistoryMapper] Failed to map database row to history entry"` = `"[HistoryMapper] Failed to map database row to history entry"`

### HISTORY\_PRUNE\_FAILED

> `readonly` **HISTORY\_PRUNE\_FAILED**: `"[HistoryManipulation] Failed to prune history for monitor: `monitorId`"` = `"[HistoryManipulation] Failed to prune history for monitor: `monitorId`"`

### MONITOR\_CHECK\_ENHANCED\_FAILED

> `readonly` **MONITOR\_CHECK\_ENHANCED\_FAILED**: `"Enhanced monitor check failed for `monitorId`"` = `"Enhanced monitor check failed for `monitorId`"`

Monitor errors

### MONITOR\_MAPPER\_FAILED

> `readonly` **MONITOR\_MAPPER\_FAILED**: `"[MonitorMapper] Failed to build monitor parameters"` = `"[MonitorMapper] Failed to build monitor parameters"`

### SETTINGS\_MAPPER\_FAILED

> `readonly` **SETTINGS\_MAPPER\_FAILED**: `"[SettingsMapper:rowToSetting] Failed to map database row to setting"` = `"[SettingsMapper:rowToSetting] Failed to map database row to setting"`

Settings errors

### SITE\_BACKGROUND\_LOAD\_EMIT\_ERROR

> `readonly` **SITE\_BACKGROUND\_LOAD\_EMIT\_ERROR**: `"[SiteManager] Failed to emit background load error event"` = `"[SiteManager] Failed to emit background load error event"`

### SITE\_BACKGROUND\_LOAD\_FAILED

> `readonly` **SITE\_BACKGROUND\_LOAD\_FAILED**: `"[SiteManager] Background site load failed for `identifier`"` = `"[SiteManager] Background site load failed for `identifier`"`

Site errors

### SITE\_HISTORY\_LIMIT\_FAILED

> `readonly` **SITE\_HISTORY\_LIMIT\_FAILED**: `"[SiteManager] Failed to set history limit"` = `"[SiteManager] Failed to set history limit"`

### SITE\_INITIALIZATION\_FAILED

> `readonly` **SITE\_INITIALIZATION\_FAILED**: `"[SiteManager] Failed to initialize cache"` = `"[SiteManager] Failed to initialize cache"`

### SITE\_MAPPER\_FAILED

> `readonly` **SITE\_MAPPER\_FAILED**: `"[SiteMapper] Failed to map database row to site"` = `"[SiteMapper] Failed to map database row to site"`

### SITE\_MONITOR\_REMOVAL\_FAILED

> `readonly` **SITE\_MONITOR\_REMOVAL\_FAILED**: `"[SiteManager] Failed to remove monitor `monitorId` from site `siteIdentifier`"` = `"[SiteManager] Failed to remove monitor `monitorId` from site `siteIdentifier`"`
