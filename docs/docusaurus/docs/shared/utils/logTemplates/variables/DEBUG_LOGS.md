# Variable: DEBUG\_LOGS

> `const` **DEBUG\_LOGS**: `object`

Defined in: [shared/utils/logTemplates.ts:158](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/logTemplates.ts#L158)

Debug and diagnostic log templates.

## Type declaration

### APPLICATION\_CLEANUP\_SERVICE

> `readonly` **APPLICATION\_CLEANUP\_SERVICE**: `"[ApplicationService] Cleaning up `name`"` = `"[ApplicationService] Cleaning up `name`"`

Application cleanup service

### APPLICATION\_FORWARDING\_CACHE\_INVALIDATION

> `readonly` **APPLICATION\_FORWARDING\_CACHE\_INVALIDATION**: `"[ApplicationService] Forwarding cache invalidation to renderer"` = `"[ApplicationService] Forwarding cache invalidation to renderer"`

Application forwarding events

### APPLICATION\_FORWARDING\_MONITOR\_STATUS

> `readonly` **APPLICATION\_FORWARDING\_MONITOR\_STATUS**: `"[ApplicationService] Forwarding monitor status change to renderer"` = `"[ApplicationService] Forwarding monitor status change to renderer"`

### APPLICATION\_FORWARDING\_MONITOR\_UP

> `readonly` **APPLICATION\_FORWARDING\_MONITOR\_UP**: `"[ApplicationService] Monitor recovered - forwarding to renderer"` = `"[ApplicationService] Monitor recovered - forwarding to renderer"`

### APPLICATION\_FORWARDING\_MONITORING\_STARTED

> `readonly` **APPLICATION\_FORWARDING\_MONITORING\_STARTED**: `"[ApplicationService] Forwarding monitoring started to renderer"` = `"[ApplicationService] Forwarding monitoring started to renderer"`

### APPLICATION\_FORWARDING\_MONITORING\_STOPPED

> `readonly` **APPLICATION\_FORWARDING\_MONITORING\_STOPPED**: `"[ApplicationService] Forwarding monitoring stopped to renderer"` = `"[ApplicationService] Forwarding monitoring stopped to renderer"`

### BACKGROUND\_LOAD\_COMPLETE

> `readonly` **BACKGROUND\_LOAD\_COMPLETE**: `"[SiteManager] Background site load completed: `identifier`"` = `"[SiteManager] Background site load completed: `identifier`"`

Background operations

### BACKGROUND\_LOAD\_START

> `readonly` **BACKGROUND\_LOAD\_START**: `"[SiteManager] Loading site in background: `identifier`"` = `"[SiteManager] Loading site in background: `identifier`"`

### EVENT\_BUS\_CLEARED

> `readonly` **EVENT\_BUS\_CLEARED**: `"[TypedEventBus:`busId`] Cleared `count` middleware functions"` = `"[TypedEventBus:`busId`] Cleared `count` middleware functions"`

Event bus operations

### EVENT\_BUS\_CREATED

> `readonly` **EVENT\_BUS\_CREATED**: `"[TypedEventBus:`busId`] Created new event bus (max middleware: `maxMiddleware`)"` = `"[TypedEventBus:`busId`] Created new event bus (max middleware: `maxMiddleware`)"`

### EVENT\_BUS\_EMISSION\_START

> `readonly` **EVENT\_BUS\_EMISSION\_START**: `"[TypedEventBus:`busId`] Starting emission of '`eventName`' [`correlationId`]"` = `"[TypedEventBus:`busId`] Starting emission of '`eventName`' [`correlationId`]"`

### EVENT\_BUS\_EMISSION\_SUCCESS

> `readonly` **EVENT\_BUS\_EMISSION\_SUCCESS**: `"[TypedEventBus:`busId`] Successfully emitted '`eventName`' [`correlationId`]"` = `"[TypedEventBus:`busId`] Successfully emitted '`eventName`' [`correlationId`]"`

### EVENT\_BUS\_LISTENER\_REGISTERED

> `readonly` **EVENT\_BUS\_LISTENER\_REGISTERED**: `"[TypedEventBus:`busId`] Registered listener for '`eventName`'"` = `"[TypedEventBus:`busId`] Registered listener for '`eventName`'"`

### EVENT\_BUS\_LISTENER\_REMOVED

> `readonly` **EVENT\_BUS\_LISTENER\_REMOVED**: `"[TypedEventBus:`busId`] Removed listener(s) for '`eventName`'"` = `"[TypedEventBus:`busId`] Removed listener(s) for '`eventName`'"`

### EVENT\_BUS\_MIDDLEWARE\_REMOVED

> `readonly` **EVENT\_BUS\_MIDDLEWARE\_REMOVED**: `"[TypedEventBus:`busId`] Removed middleware (remaining: `count`)"` = `"[TypedEventBus:`busId`] Removed middleware (remaining: `count`)"`

### EVENT\_BUS\_ONE\_TIME\_LISTENER

> `readonly` **EVENT\_BUS\_ONE\_TIME\_LISTENER**: `"[TypedEventBus:`busId`] Registered one-time listener for '`eventName`'"` = `"[TypedEventBus:`busId`] Registered one-time listener for '`eventName`'"`

### HISTORY\_ENTRY\_ADDED

> `readonly` **HISTORY\_ENTRY\_ADDED**: `"[HistoryManipulation] Added history entry for monitor: `monitorId` - Status: `status`"` = `"[HistoryManipulation] Added history entry for monitor: `monitorId` - Status: `status`"`

History operations

### MONITOR\_AUTO\_STARTED

> `readonly` **MONITOR\_AUTO\_STARTED**: `"[MonitorManager] Auto-started monitoring for new monitor: `monitorId`"` = `"[MonitorManager] Auto-started monitoring for new monitor: `monitorId`"`

Monitor lifecycle

### MONITOR\_CHECK\_START

> `readonly` **MONITOR\_CHECK\_START**: `"Checking monitor: site=`siteIdentifier`, id=`monitorId`, operation=`operationId`"` = `"Checking monitor: site=`siteIdentifier`, id=`monitorId`, operation=`operationId`"`

### MONITOR\_INTERVALS\_APPLIED

> `readonly` **MONITOR\_INTERVALS\_APPLIED**: `"[MonitorManager] Applied interval for monitor `monitorId`: `interval`s"` = `"[MonitorManager] Applied interval for monitor `monitorId`: `interval`s"`

### MONITOR\_MANAGER\_AUTO\_STARTING\_SITE

> `readonly` **MONITOR\_MANAGER\_AUTO\_STARTING\_SITE**: `"[MonitorManager] Auto-starting monitoring for site: `identifier`"` = `"[MonitorManager] Auto-starting monitoring for site: `identifier`"`

### MONITOR\_MANAGER\_INTERVALS\_SETTING

> `readonly` **MONITOR\_MANAGER\_INTERVALS\_SETTING**: `"[MonitorManager] Applying default intervals for site: `identifier`"` = `"[MonitorManager] Applying default intervals for site: `identifier`"`

### MONITOR\_MANAGER\_NO\_MONITORS\_FOUND

> `readonly` **MONITOR\_MANAGER\_NO\_MONITORS\_FOUND**: `"[MonitorManager] No monitors found for site: `identifier`"` = `"[MonitorManager] No monitors found for site: `identifier`"`

### MONITOR\_MANAGER\_SETUP\_MONITORS

> `readonly` **MONITOR\_MANAGER\_SETUP\_MONITORS**: `"[MonitorManager] Setting up `count` new monitors for site: `identifier`"` = `"[MonitorManager] Setting up `count` new monitors for site: `identifier`"`

### MONITOR\_MANAGER\_SKIP\_AUTO\_START

> `readonly` **MONITOR\_MANAGER\_SKIP\_AUTO\_START**: `"[MonitorManager] Skipping auto-start for new monitors - site monitoring disabled"` = `"[MonitorManager] Skipping auto-start for new monitors - site monitoring disabled"`

### MONITOR\_MANAGER\_SKIP\_INDIVIDUAL

> `readonly` **MONITOR\_MANAGER\_SKIP\_INDIVIDUAL**: `"[MonitorManager] Skipping monitor `monitorId` - individual monitoring disabled"` = `"[MonitorManager] Skipping monitor `monitorId` - individual monitoring disabled"`

### MONITOR\_MANAGER\_SKIP\_NEW\_INDIVIDUAL

> `readonly` **MONITOR\_MANAGER\_SKIP\_NEW\_INDIVIDUAL**: `"[MonitorManager] Skipping new monitor `monitorId` - individual monitoring disabled"` = `"[MonitorManager] Skipping new monitor `monitorId` - individual monitoring disabled"`

### MONITOR\_MANAGER\_VALID\_MONITORS

> `readonly` **MONITOR\_MANAGER\_VALID\_MONITORS**: `"[MonitorManager] No valid new monitors found for site: `identifier`"` = `"[MonitorManager] No valid new monitors found for site: `identifier`"`

### MONITOR\_RESPONSE\_TIME

> `readonly` **MONITOR\_RESPONSE\_TIME**: `"[HttpMonitor] URL `url` responded with status `status` in `responseTime`ms"` = `"[HttpMonitor] URL `url` responded with status `status` in `responseTime`ms"`

### OPERATION\_CANCELLED

> `readonly` **OPERATION\_CANCELLED**: `"Cancelled `count` operations for monitor `monitorId`"` = `"Cancelled `count` operations for monitor `monitorId`"`

Operation management

### OPERATION\_COMPLETED

> `readonly` **OPERATION\_COMPLETED**: `"Completed operation `operationId` for monitor `monitorId`"` = `"Completed operation `operationId` for monitor `monitorId`"`

### OPERATION\_TIMEOUT\_SCHEDULED

> `readonly` **OPERATION\_TIMEOUT\_SCHEDULED**: `"Scheduled timeout for operation `operationId` (`timeoutMs`ms)"` = `"Scheduled timeout for operation `operationId` (`timeoutMs`ms)"`

### SITE\_BACKGROUND\_LOAD\_FAILED

> `readonly` **SITE\_BACKGROUND\_LOAD\_FAILED**: `"[SiteManager] Site not found during background load: `identifier`"` = `"[SiteManager] Site not found during background load: `identifier`"`

Site operations

### SITE\_CACHE\_MISS\_ERROR

> `readonly` **SITE\_CACHE\_MISS\_ERROR**: `"[SiteManager] Failed to emit cache miss event"` = `"[SiteManager] Failed to emit cache miss event"`

### SITE\_LOADING\_ERROR\_IGNORED

> `readonly` **SITE\_LOADING\_ERROR\_IGNORED**: `"[SiteManager] Background loading error ignored"` = `"[SiteManager] Background loading error ignored"`
