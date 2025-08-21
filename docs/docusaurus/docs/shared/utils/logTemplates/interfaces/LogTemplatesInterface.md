# Interface: LogTemplatesInterface

Defined in: [shared/utils/logTemplates.ts:370](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/logTemplates.ts#L370)

Interface for the log templates catalog structure.

## Properties

### debug

> `readonly` **debug**: `object`

Defined in: [shared/utils/logTemplates.ts:371](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/logTemplates.ts#L371)

#### APPLICATION\_CLEANUP\_SERVICE

> `readonly` **APPLICATION\_CLEANUP\_SERVICE**: `"[ApplicationService] Cleaning up `name`"` = `"[ApplicationService] Cleaning up `name`"`

Application cleanup service

#### APPLICATION\_FORWARDING\_CACHE\_INVALIDATION

> `readonly` **APPLICATION\_FORWARDING\_CACHE\_INVALIDATION**: `"[ApplicationService] Forwarding cache invalidation to renderer"` = `"[ApplicationService] Forwarding cache invalidation to renderer"`

Application forwarding events

#### APPLICATION\_FORWARDING\_MONITOR\_STATUS

> `readonly` **APPLICATION\_FORWARDING\_MONITOR\_STATUS**: `"[ApplicationService] Forwarding monitor status change to renderer"` = `"[ApplicationService] Forwarding monitor status change to renderer"`

#### APPLICATION\_FORWARDING\_MONITOR\_UP

> `readonly` **APPLICATION\_FORWARDING\_MONITOR\_UP**: `"[ApplicationService] Monitor recovered - forwarding to renderer"` = `"[ApplicationService] Monitor recovered - forwarding to renderer"`

#### APPLICATION\_FORWARDING\_MONITORING\_STARTED

> `readonly` **APPLICATION\_FORWARDING\_MONITORING\_STARTED**: `"[ApplicationService] Forwarding monitoring started to renderer"` = `"[ApplicationService] Forwarding monitoring started to renderer"`

#### APPLICATION\_FORWARDING\_MONITORING\_STOPPED

> `readonly` **APPLICATION\_FORWARDING\_MONITORING\_STOPPED**: `"[ApplicationService] Forwarding monitoring stopped to renderer"` = `"[ApplicationService] Forwarding monitoring stopped to renderer"`

#### BACKGROUND\_LOAD\_COMPLETE

> `readonly` **BACKGROUND\_LOAD\_COMPLETE**: `"[SiteManager] Background site load completed: `identifier`"` = `"[SiteManager] Background site load completed: `identifier`"`

Background operations

#### BACKGROUND\_LOAD\_START

> `readonly` **BACKGROUND\_LOAD\_START**: `"[SiteManager] Loading site in background: `identifier`"` = `"[SiteManager] Loading site in background: `identifier`"`

#### EVENT\_BUS\_CLEARED

> `readonly` **EVENT\_BUS\_CLEARED**: `"[TypedEventBus:`busId`] Cleared `count` middleware functions"` = `"[TypedEventBus:`busId`] Cleared `count` middleware functions"`

Event bus operations

#### EVENT\_BUS\_CREATED

> `readonly` **EVENT\_BUS\_CREATED**: `"[TypedEventBus:`busId`] Created new event bus (max middleware: `maxMiddleware`)"` = `"[TypedEventBus:`busId`] Created new event bus (max middleware: `maxMiddleware`)"`

#### EVENT\_BUS\_EMISSION\_START

> `readonly` **EVENT\_BUS\_EMISSION\_START**: `"[TypedEventBus:`busId`] Starting emission of '`eventName`' [`correlationId`]"` = `"[TypedEventBus:`busId`] Starting emission of '`eventName`' [`correlationId`]"`

#### EVENT\_BUS\_EMISSION\_SUCCESS

> `readonly` **EVENT\_BUS\_EMISSION\_SUCCESS**: `"[TypedEventBus:`busId`] Successfully emitted '`eventName`' [`correlationId`]"` = `"[TypedEventBus:`busId`] Successfully emitted '`eventName`' [`correlationId`]"`

#### EVENT\_BUS\_LISTENER\_REGISTERED

> `readonly` **EVENT\_BUS\_LISTENER\_REGISTERED**: `"[TypedEventBus:`busId`] Registered listener for '`eventName`'"` = `"[TypedEventBus:`busId`] Registered listener for '`eventName`'"`

#### EVENT\_BUS\_LISTENER\_REMOVED

> `readonly` **EVENT\_BUS\_LISTENER\_REMOVED**: `"[TypedEventBus:`busId`] Removed listener(s) for '`eventName`'"` = `"[TypedEventBus:`busId`] Removed listener(s) for '`eventName`'"`

#### EVENT\_BUS\_MIDDLEWARE\_REMOVED

> `readonly` **EVENT\_BUS\_MIDDLEWARE\_REMOVED**: `"[TypedEventBus:`busId`] Removed middleware (remaining: `count`)"` = `"[TypedEventBus:`busId`] Removed middleware (remaining: `count`)"`

#### EVENT\_BUS\_ONE\_TIME\_LISTENER

> `readonly` **EVENT\_BUS\_ONE\_TIME\_LISTENER**: `"[TypedEventBus:`busId`] Registered one-time listener for '`eventName`'"` = `"[TypedEventBus:`busId`] Registered one-time listener for '`eventName`'"`

#### HISTORY\_ENTRY\_ADDED

> `readonly` **HISTORY\_ENTRY\_ADDED**: `"[HistoryManipulation] Added history entry for monitor: `monitorId` - Status: `status`"` = `"[HistoryManipulation] Added history entry for monitor: `monitorId` - Status: `status`"`

History operations

#### MONITOR\_AUTO\_STARTED

> `readonly` **MONITOR\_AUTO\_STARTED**: `"[MonitorManager] Auto-started monitoring for new monitor: `monitorId`"` = `"[MonitorManager] Auto-started monitoring for new monitor: `monitorId`"`

Monitor lifecycle

#### MONITOR\_CHECK\_START

> `readonly` **MONITOR\_CHECK\_START**: `"Checking monitor: site=`siteIdentifier`, id=`monitorId`, operation=`operationId`"` = `"Checking monitor: site=`siteIdentifier`, id=`monitorId`, operation=`operationId`"`

#### MONITOR\_INTERVALS\_APPLIED

> `readonly` **MONITOR\_INTERVALS\_APPLIED**: `"[MonitorManager] Applied interval for monitor `monitorId`: `interval`s"` = `"[MonitorManager] Applied interval for monitor `monitorId`: `interval`s"`

#### MONITOR\_MANAGER\_AUTO\_STARTING\_SITE

> `readonly` **MONITOR\_MANAGER\_AUTO\_STARTING\_SITE**: `"[MonitorManager] Auto-starting monitoring for site: `identifier`"` = `"[MonitorManager] Auto-starting monitoring for site: `identifier`"`

#### MONITOR\_MANAGER\_INTERVALS\_SETTING

> `readonly` **MONITOR\_MANAGER\_INTERVALS\_SETTING**: `"[MonitorManager] Applying default intervals for site: `identifier`"` = `"[MonitorManager] Applying default intervals for site: `identifier`"`

#### MONITOR\_MANAGER\_NO\_MONITORS\_FOUND

> `readonly` **MONITOR\_MANAGER\_NO\_MONITORS\_FOUND**: `"[MonitorManager] No monitors found for site: `identifier`"` = `"[MonitorManager] No monitors found for site: `identifier`"`

#### MONITOR\_MANAGER\_SETUP\_MONITORS

> `readonly` **MONITOR\_MANAGER\_SETUP\_MONITORS**: `"[MonitorManager] Setting up `count` new monitors for site: `identifier`"` = `"[MonitorManager] Setting up `count` new monitors for site: `identifier`"`

#### MONITOR\_MANAGER\_SKIP\_AUTO\_START

> `readonly` **MONITOR\_MANAGER\_SKIP\_AUTO\_START**: `"[MonitorManager] Skipping auto-start for new monitors - site monitoring disabled"` = `"[MonitorManager] Skipping auto-start for new monitors - site monitoring disabled"`

#### MONITOR\_MANAGER\_SKIP\_INDIVIDUAL

> `readonly` **MONITOR\_MANAGER\_SKIP\_INDIVIDUAL**: `"[MonitorManager] Skipping monitor `monitorId` - individual monitoring disabled"` = `"[MonitorManager] Skipping monitor `monitorId` - individual monitoring disabled"`

#### MONITOR\_MANAGER\_SKIP\_NEW\_INDIVIDUAL

> `readonly` **MONITOR\_MANAGER\_SKIP\_NEW\_INDIVIDUAL**: `"[MonitorManager] Skipping new monitor `monitorId` - individual monitoring disabled"` = `"[MonitorManager] Skipping new monitor `monitorId` - individual monitoring disabled"`

#### MONITOR\_MANAGER\_VALID\_MONITORS

> `readonly` **MONITOR\_MANAGER\_VALID\_MONITORS**: `"[MonitorManager] No valid new monitors found for site: `identifier`"` = `"[MonitorManager] No valid new monitors found for site: `identifier`"`

#### MONITOR\_RESPONSE\_TIME

> `readonly` **MONITOR\_RESPONSE\_TIME**: `"[HttpMonitor] URL `url` responded with status `status` in `responseTime`ms"` = `"[HttpMonitor] URL `url` responded with status `status` in `responseTime`ms"`

#### OPERATION\_CANCELLED

> `readonly` **OPERATION\_CANCELLED**: `"Cancelled `count` operations for monitor `monitorId`"` = `"Cancelled `count` operations for monitor `monitorId`"`

Operation management

#### OPERATION\_COMPLETED

> `readonly` **OPERATION\_COMPLETED**: `"Completed operation `operationId` for monitor `monitorId`"` = `"Completed operation `operationId` for monitor `monitorId`"`

#### OPERATION\_TIMEOUT\_SCHEDULED

> `readonly` **OPERATION\_TIMEOUT\_SCHEDULED**: `"Scheduled timeout for operation `operationId` (`timeoutMs`ms)"` = `"Scheduled timeout for operation `operationId` (`timeoutMs`ms)"`

#### SITE\_BACKGROUND\_LOAD\_FAILED

> `readonly` **SITE\_BACKGROUND\_LOAD\_FAILED**: `"[SiteManager] Site not found during background load: `identifier`"` = `"[SiteManager] Site not found during background load: `identifier`"`

Site operations

#### SITE\_CACHE\_MISS\_ERROR

> `readonly` **SITE\_CACHE\_MISS\_ERROR**: `"[SiteManager] Failed to emit cache miss event"` = `"[SiteManager] Failed to emit cache miss event"`

#### SITE\_LOADING\_ERROR\_IGNORED

> `readonly` **SITE\_LOADING\_ERROR\_IGNORED**: `"[SiteManager] Background loading error ignored"` = `"[SiteManager] Background loading error ignored"`

***

### errors

> `readonly` **errors**: `object`

Defined in: [shared/utils/logTemplates.ts:372](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/logTemplates.ts#L372)

#### APPLICATION\_CLEANUP\_ERROR

> `readonly` **APPLICATION\_CLEANUP\_ERROR**: `"[ApplicationService] Error during cleanup"` = `"[ApplicationService] Error during cleanup"`

Application errors

#### APPLICATION\_FORWARD\_CACHE\_INVALIDATION\_ERROR

> `readonly` **APPLICATION\_FORWARD\_CACHE\_INVALIDATION\_ERROR**: `"[ApplicationService] Failed to forward cache invalidation to renderer"` = `"[ApplicationService] Failed to forward cache invalidation to renderer"`

#### APPLICATION\_FORWARD\_MONITOR\_DOWN\_ERROR

> `readonly` **APPLICATION\_FORWARD\_MONITOR\_DOWN\_ERROR**: `"[ApplicationService] Failed to forward monitor down to renderer"` = `"[ApplicationService] Failed to forward monitor down to renderer"`

#### APPLICATION\_FORWARD\_MONITOR\_STATUS\_ERROR

> `readonly` **APPLICATION\_FORWARD\_MONITOR\_STATUS\_ERROR**: `"[ApplicationService] Failed to forward monitor status change to renderer"` = `"[ApplicationService] Failed to forward monitor status change to renderer"`

#### APPLICATION\_FORWARD\_MONITOR\_UP\_ERROR

> `readonly` **APPLICATION\_FORWARD\_MONITOR\_UP\_ERROR**: `"[ApplicationService] Failed to forward monitor up to renderer"` = `"[ApplicationService] Failed to forward monitor up to renderer"`

#### APPLICATION\_FORWARD\_MONITORING\_STARTED\_ERROR

> `readonly` **APPLICATION\_FORWARD\_MONITORING\_STARTED\_ERROR**: `"[ApplicationService] Failed to forward monitoring started to renderer"` = `"[ApplicationService] Failed to forward monitoring started to renderer"`

#### APPLICATION\_FORWARD\_MONITORING\_STOPPED\_ERROR

> `readonly` **APPLICATION\_FORWARD\_MONITORING\_STOPPED\_ERROR**: `"[ApplicationService] Failed to forward monitoring stopped to renderer"` = `"[ApplicationService] Failed to forward monitoring stopped to renderer"`

#### APPLICATION\_INITIALIZATION\_ERROR

> `readonly` **APPLICATION\_INITIALIZATION\_ERROR**: `"[ApplicationService] Error during app initialization"` = `"[ApplicationService] Error during app initialization"`

#### APPLICATION\_SYSTEM\_ERROR

> `readonly` **APPLICATION\_SYSTEM\_ERROR**: `"[ApplicationService] System error: `context`"` = `"[ApplicationService] System error: `context`"`

#### APPLICATION\_UPDATE\_CHECK\_ERROR

> `readonly` **APPLICATION\_UPDATE\_CHECK\_ERROR**: `"[ApplicationService] Failed to check for updates"` = `"[ApplicationService] Failed to check for updates"`

#### DATABASE\_BACKUP\_FAILED

> `readonly` **DATABASE\_BACKUP\_FAILED**: `"[DatabaseBackup] Failed to create database backup"` = `"[DatabaseBackup] Failed to create database backup"`

Database errors

#### DATABASE\_INDEXES\_FAILED

> `readonly` **DATABASE\_INDEXES\_FAILED**: `"[DatabaseSchema] Failed to create indexes"` = `"[DatabaseSchema] Failed to create indexes"`

#### DATABASE\_SCHEMA\_FAILED

> `readonly` **DATABASE\_SCHEMA\_FAILED**: `"[DatabaseSchema] Failed to create database schema"` = `"[DatabaseSchema] Failed to create database schema"`

#### DATABASE\_TABLES\_FAILED

> `readonly` **DATABASE\_TABLES\_FAILED**: `"[DatabaseSchema] Failed to create tables"` = `"[DatabaseSchema] Failed to create tables"`

#### DATABASE\_VALIDATION\_SETUP\_FAILED

> `readonly` **DATABASE\_VALIDATION\_SETUP\_FAILED**: `"[DatabaseSchema] Failed to setup monitor type validation"` = `"[DatabaseSchema] Failed to setup monitor type validation"`

#### EVENT\_BUS\_EMISSION\_FAILED

> `readonly` **EVENT\_BUS\_EMISSION\_FAILED**: `"[TypedEventBus:`busId`] Failed to emit '`eventName`' [`correlationId`]"` = `"[TypedEventBus:`busId`] Failed to emit '`eventName`' [`correlationId`]"`

Event bus errors

#### HISTORY\_ADD\_FAILED

> `readonly` **HISTORY\_ADD\_FAILED**: `"[HistoryManipulation] Failed to add history entry for monitor: `monitorId`"` = `"[HistoryManipulation] Failed to add history entry for monitor: `monitorId`"`

History errors

#### HISTORY\_BULK\_INSERT\_FAILED

> `readonly` **HISTORY\_BULK\_INSERT\_FAILED**: `"[HistoryManipulation] Failed to bulk insert history for monitor: `monitorId`"` = `"[HistoryManipulation] Failed to bulk insert history for monitor: `monitorId`"`

#### HISTORY\_FETCH\_FAILED

> `readonly` **HISTORY\_FETCH\_FAILED**: `"[HistoryQuery] Failed to fetch history for monitor: `monitorId`"` = `"[HistoryQuery] Failed to fetch history for monitor: `monitorId`"`

#### HISTORY\_LATEST\_FETCH\_FAILED

> `readonly` **HISTORY\_LATEST\_FETCH\_FAILED**: `"[HistoryQuery] Failed to get latest history entry for monitor: `monitorId`"` = `"[HistoryQuery] Failed to get latest history entry for monitor: `monitorId`"`

#### HISTORY\_MAPPER\_FAILED

> `readonly` **HISTORY\_MAPPER\_FAILED**: `"[HistoryMapper] Failed to map database row to history entry"` = `"[HistoryMapper] Failed to map database row to history entry"`

#### HISTORY\_PRUNE\_FAILED

> `readonly` **HISTORY\_PRUNE\_FAILED**: `"[HistoryManipulation] Failed to prune history for monitor: `monitorId`"` = `"[HistoryManipulation] Failed to prune history for monitor: `monitorId`"`

#### MONITOR\_CHECK\_ENHANCED\_FAILED

> `readonly` **MONITOR\_CHECK\_ENHANCED\_FAILED**: `"Enhanced monitor check failed for `monitorId`"` = `"Enhanced monitor check failed for `monitorId`"`

Monitor errors

#### MONITOR\_MAPPER\_FAILED

> `readonly` **MONITOR\_MAPPER\_FAILED**: `"[MonitorMapper] Failed to build monitor parameters"` = `"[MonitorMapper] Failed to build monitor parameters"`

#### SETTINGS\_MAPPER\_FAILED

> `readonly` **SETTINGS\_MAPPER\_FAILED**: `"[SettingsMapper:rowToSetting] Failed to map database row to setting"` = `"[SettingsMapper:rowToSetting] Failed to map database row to setting"`

Settings errors

#### SITE\_BACKGROUND\_LOAD\_EMIT\_ERROR

> `readonly` **SITE\_BACKGROUND\_LOAD\_EMIT\_ERROR**: `"[SiteManager] Failed to emit background load error event"` = `"[SiteManager] Failed to emit background load error event"`

#### SITE\_BACKGROUND\_LOAD\_FAILED

> `readonly` **SITE\_BACKGROUND\_LOAD\_FAILED**: `"[SiteManager] Background site load failed for `identifier`"` = `"[SiteManager] Background site load failed for `identifier`"`

Site errors

#### SITE\_HISTORY\_LIMIT\_FAILED

> `readonly` **SITE\_HISTORY\_LIMIT\_FAILED**: `"[SiteManager] Failed to set history limit"` = `"[SiteManager] Failed to set history limit"`

#### SITE\_INITIALIZATION\_FAILED

> `readonly` **SITE\_INITIALIZATION\_FAILED**: `"[SiteManager] Failed to initialize cache"` = `"[SiteManager] Failed to initialize cache"`

#### SITE\_MAPPER\_FAILED

> `readonly` **SITE\_MAPPER\_FAILED**: `"[SiteMapper] Failed to map database row to site"` = `"[SiteMapper] Failed to map database row to site"`

#### SITE\_MONITOR\_REMOVAL\_FAILED

> `readonly` **SITE\_MONITOR\_REMOVAL\_FAILED**: `"[SiteManager] Failed to remove monitor `monitorId` from site `siteIdentifier`"` = `"[SiteManager] Failed to remove monitor `monitorId` from site `siteIdentifier`"`

***

### services

> `readonly` **services**: `object`

Defined in: [shared/utils/logTemplates.ts:373](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/logTemplates.ts#L373)

#### APPLICATION\_ACTIVATED

> `readonly` **APPLICATION\_ACTIVATED**: `"[ApplicationService] App activated"` = `"[ApplicationService] App activated"`

Application activated

#### APPLICATION\_CLEANUP\_COMPLETE

> `readonly` **APPLICATION\_CLEANUP\_COMPLETE**: `"[ApplicationService] Cleanup completed"` = `"[ApplicationService] Cleanup completed"`

Application cleanup completed

#### APPLICATION\_CLEANUP\_START

> `readonly` **APPLICATION\_CLEANUP\_START**: `"[ApplicationService] Starting cleanup"` = `"[ApplicationService] Starting cleanup"`

Application cleanup started

#### APPLICATION\_CREATING\_WINDOW

> `readonly` **APPLICATION\_CREATING\_WINDOW**: `"[ApplicationService] No windows open, creating main window"` = `"[ApplicationService] No windows open, creating main window"`

Application creating window

#### APPLICATION\_INITIALIZING

> `readonly` **APPLICATION\_INITIALIZING**: `"[ApplicationService] Initializing application services"` = `"[ApplicationService] Initializing application services"`

Application service initialization

#### APPLICATION\_QUITTING

> `readonly` **APPLICATION\_QUITTING**: `"[ApplicationService] Quitting app (non-macOS)"` = `"[ApplicationService] Quitting app (non-macOS)"`

Application quitting

#### APPLICATION\_READY

> `readonly` **APPLICATION\_READY**: `"[ApplicationService] App ready - initializing services"` = `"[ApplicationService] App ready - initializing services"`

Application app ready

#### APPLICATION\_SERVICES\_INITIALIZED

> `readonly` **APPLICATION\_SERVICES\_INITIALIZED**: `"[ApplicationService] All services initialized successfully"` = `"[ApplicationService] All services initialized successfully"`

Application services initialized

#### APPLICATION\_WINDOWS\_CLOSED

> `readonly` **APPLICATION\_WINDOWS\_CLOSED**: `"[ApplicationService] All windows closed"` = `"[ApplicationService] All windows closed"`

Application all windows closed

#### DATABASE\_BACKUP\_CREATED

> `readonly` **DATABASE\_BACKUP\_CREATED**: `"[DatabaseBackup] Database backup created successfully"` = `"[DatabaseBackup] Database backup created successfully"`

Database backup created

#### DATABASE\_CONNECTION\_CLOSED

> `readonly` **DATABASE\_CONNECTION\_CLOSED**: `"[DatabaseService] Database connection closed safely"` = `"[DatabaseService] Database connection closed safely"`

Database connection closed

#### DATABASE\_INDEXES\_CREATED

> `readonly` **DATABASE\_INDEXES\_CREATED**: `"[DatabaseSchema] All indexes created successfully"` = `"[DatabaseSchema] All indexes created successfully"`

Database indexes created

#### DATABASE\_INITIALIZED

> `readonly` **DATABASE\_INITIALIZED**: `"[DatabaseService] Database initialized successfully"` = `"[DatabaseService] Database initialized successfully"`

Database initialized successfully

#### DATABASE\_MONITOR\_VALIDATION\_INITIALIZED

> `readonly` **DATABASE\_MONITOR\_VALIDATION\_INITIALIZED**: `"[DatabaseSchema] Monitor type validation initialized"` = `"[DatabaseSchema] Monitor type validation initialized"`

Database monitor validation initialized

#### DATABASE\_MONITOR\_VALIDATION\_READY

> `readonly` **DATABASE\_MONITOR\_VALIDATION\_READY**: `"[DatabaseSchema] Monitor type validation framework ready"` = `"[DatabaseSchema] Monitor type validation framework ready"`

Database monitor validation ready

#### DATABASE\_SCHEMA\_CREATED

> `readonly` **DATABASE\_SCHEMA\_CREATED**: `"[DatabaseSchema] Database schema created successfully"` = `"[DatabaseSchema] Database schema created successfully"`

Database schema created

#### DATABASE\_TABLES\_CREATED

> `readonly` **DATABASE\_TABLES\_CREATED**: `"[DatabaseSchema] All tables created successfully"` = `"[DatabaseSchema] All tables created successfully"`

Database tables created

#### HISTORY\_BULK\_INSERT

> `readonly` **HISTORY\_BULK\_INSERT**: `"[HistoryManipulation] Bulk inserted `count` history entries for monitor: `monitorId`"` = `"[HistoryManipulation] Bulk inserted `count` history entries for monitor: `monitorId`"`

History bulk insert

#### IPC\_SERVICE\_CLEANUP

> `readonly` **IPC\_SERVICE\_CLEANUP**: `"[IpcService] Cleaning up IPC handlers"` = `"[IpcService] Cleaning up IPC handlers"`

IPC service cleanup

#### MIGRATION\_APPLYING

> `readonly` **MIGRATION\_APPLYING**: `"Applying migration: `monitorType` `fromVersion` → `toVersion`"` = `"Applying migration: `monitorType` `fromVersion` → `toVersion`"`

Migration system

#### MIGRATION\_REGISTERED

> `readonly` **MIGRATION\_REGISTERED**: `"Registered migration for `monitorType`: `fromVersion` → `toVersion`"` = `"Registered migration for `monitorType`: `fromVersion` → `toVersion`"`

#### MONITOR\_MANAGER\_APPLYING\_INTERVALS

> `readonly` **MONITOR\_MANAGER\_APPLYING\_INTERVALS**: `"[MonitorManager] Completed applying default intervals for site: `identifier`"` = `"[MonitorManager] Completed applying default intervals for site: `identifier`"`

Monitor manager applying intervals

#### MONITOR\_MANAGER\_AUTO\_STARTING

> `readonly` **MONITOR\_MANAGER\_AUTO\_STARTING**: `"[MonitorManager] Completed auto-starting monitoring for site: `identifier`"` = `"[MonitorManager] Completed auto-starting monitoring for site: `identifier`"`

Monitor manager auto-starting

#### MONITOR\_REMOVED\_FROM\_SITE

> `readonly` **MONITOR\_REMOVED\_FROM\_SITE**: `"[SiteManager] Monitor `monitorId` removed from site `siteIdentifier`"` = `"[SiteManager] Monitor `monitorId` removed from site `siteIdentifier`"`

Monitor removed from site

#### MONITOR\_STARTED

> `readonly` **MONITOR\_STARTED**: `"Started monitoring for monitor `monitorId` on site `siteIdentifier`"` = `"Started monitoring for monitor `monitorId` on site `siteIdentifier`"`

Monitor started

#### MONITOR\_STOPPED

> `readonly` **MONITOR\_STOPPED**: `"Stopped monitoring for monitor `monitorId` on site `siteIdentifier`"` = `"Stopped monitoring for monitor `monitorId` on site `siteIdentifier`"`

Monitor stopped

#### SITE\_ADDED\_SUCCESS

> `readonly` **SITE\_ADDED\_SUCCESS**: `"Site added successfully: `identifier` (`name`)"` = `"Site added successfully: `identifier` (`name`)"`

Site added successfully

#### SITE\_MANAGER\_INITIALIZED

> `readonly` **SITE\_MANAGER\_INITIALIZED**: `"[SiteManager] Initialized with `count` sites in cache"` = `"[SiteManager] Initialized with `count` sites in cache"`

Site manager initialized

#### SITE\_MANAGER\_INITIALIZED\_WITH\_CACHE

> `readonly` **SITE\_MANAGER\_INITIALIZED\_WITH\_CACHE**: `"[SiteManager] Initialized with StandardizedCache"` = `"[SiteManager] Initialized with StandardizedCache"`

Site manager initialized with cache

#### SITE\_MANAGER\_LOADING\_CACHE

> `readonly` **SITE\_MANAGER\_LOADING\_CACHE**: `"[SiteManager] Initializing - loading sites into cache"` = `"[SiteManager] Initializing - loading sites into cache"`

Site manager cache loading

#### UPDATER\_QUIT\_INSTALL

> `readonly` **UPDATER\_QUIT\_INSTALL**: `"[AutoUpdaterService] Quitting and installing update"` = `"[AutoUpdaterService] Quitting and installing update"`

Auto updater messages

***

### warnings

> `readonly` **warnings**: `object`

Defined in: [shared/utils/logTemplates.ts:374](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/logTemplates.ts#L374)

#### APPLICATION\_MONITOR\_DOWN

> `readonly` **APPLICATION\_MONITOR\_DOWN**: `"[ApplicationService] Monitor failure detected - forwarding to renderer"` = `"[ApplicationService] Monitor failure detected - forwarding to renderer"`

Application warnings

#### DATABASE\_MONITOR\_VALIDATION\_CONTINUE

> `readonly` **DATABASE\_MONITOR\_VALIDATION\_CONTINUE**: `"[DatabaseSchema] Continuing without monitor type validation"` = `"[DatabaseSchema] Continuing without monitor type validation"`

Database warnings

#### DATABASE\_MONITOR\_VALIDATION\_MISSING

> `readonly` **DATABASE\_MONITOR\_VALIDATION\_MISSING**: `"[DatabaseSchema] No monitor types registered - validation will allow any type"` = `"[DatabaseSchema] No monitor types registered - validation will allow any type"`

#### HISTORY\_INVALID\_STATUS

> `readonly` **HISTORY\_INVALID\_STATUS**: `"[HistoryMapper] Invalid status value, defaulting to 'down'"` = `"[HistoryMapper] Invalid status value, defaulting to 'down'"`

History warnings

#### MONITOR\_ACTIVE\_OPERATIONS\_INVALID

> `readonly` **MONITOR\_ACTIVE\_OPERATIONS\_INVALID**: `"active_operations contains invalid or unsafe data, using empty array"` = `"active_operations contains invalid or unsafe data, using empty array"`

Monitor warnings

#### MONITOR\_ACTIVE\_OPERATIONS\_PARSE\_FAILED

> `readonly` **MONITOR\_ACTIVE\_OPERATIONS\_PARSE\_FAILED**: `"Failed to parse active_operations, using empty array"` = `"Failed to parse active_operations, using empty array"`

#### MONITOR\_CONFIG\_UPDATE\_FAILED\_INSTANCE

> `readonly` **MONITOR\_CONFIG\_UPDATE\_FAILED\_INSTANCE**: `"Failed to update config for monitor instance"` = `"Failed to update config for monitor instance"`

#### MONITOR\_CONFIG\_UPDATE\_FAILED\_TYPE

> `readonly` **MONITOR\_CONFIG\_UPDATE\_FAILED\_TYPE**: `"Failed to update config for monitor type `type`"` = `"Failed to update config for monitor type `type`"`

#### MONITOR\_FRESH\_DATA\_MISSING

> `readonly` **MONITOR\_FRESH\_DATA\_MISSING**: `"Fresh monitor data not found for `monitorId`"` = `"Fresh monitor data not found for `monitorId`"`

#### MONITOR\_NOT\_FOUND\_CACHE

> `readonly` **MONITOR\_NOT\_FOUND\_CACHE**: `"Monitor `monitorId` not found, ignoring result"` = `"Monitor `monitorId` not found, ignoring result"`

#### MONITOR\_NOT\_MONITORING

> `readonly` **MONITOR\_NOT\_MONITORING**: `"Monitor `monitorId` no longer monitoring, ignoring result"` = `"Monitor `monitorId` no longer monitoring, ignoring result"`

#### MONITOR\_TYPE\_UNKNOWN\_CHECK

> `readonly` **MONITOR\_TYPE\_UNKNOWN\_CHECK**: `"Unknown monitor type: `monitorType`"` = `"Unknown monitor type: `monitorType`"`

#### MONITOR\_TYPE\_UNKNOWN\_DETAIL

> `readonly` **MONITOR\_TYPE\_UNKNOWN\_DETAIL**: `"Unknown monitor type for detail formatting"` = `"Unknown monitor type for detail formatting"`

#### MONITOR\_TYPE\_UNKNOWN\_TITLE

> `readonly` **MONITOR\_TYPE\_UNKNOWN\_TITLE**: `"Unknown monitor type for title suffix formatting"` = `"Unknown monitor type for title suffix formatting"`

#### NOTIFICATIONS\_UNSUPPORTED

> `readonly` **NOTIFICATIONS\_UNSUPPORTED**: `"Notifications not supported on this platform"` = `"Notifications not supported on this platform"`

Notification warnings

#### OPERATION\_TIMEOUT

> `readonly` **OPERATION\_TIMEOUT**: `"Operation `operationId` timed out, cancelling"` = `"Operation `operationId` timed out, cancelling"`

Operation warnings

#### RECURSIVE\_CALL\_PREVENTED

> `readonly` **RECURSIVE\_CALL\_PREVENTED**: `"Preventing recursive call for `identifier`/`monitorId`"` = `"Preventing recursive call for `identifier`/`monitorId`"`

#### SITE\_NOT\_FOUND\_MANUAL

> `readonly` **SITE\_NOT\_FOUND\_MANUAL**: `"Site `identifier` not found or has no monitors for manual check"` = `"Site `identifier` not found or has no monitors for manual check"`

Site not found warnings

#### SITE\_NOT\_FOUND\_SCHEDULED

> `readonly` **SITE\_NOT\_FOUND\_SCHEDULED**: `"Site `siteIdentifier` not found in cache for scheduled check"` = `"Site `siteIdentifier` not found in cache for scheduled check"`
