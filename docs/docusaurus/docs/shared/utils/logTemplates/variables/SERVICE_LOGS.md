# Variable: SERVICE\_LOGS

> `const` **SERVICE\_LOGS**: `object`

Defined in: [shared/utils/logTemplates.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/logTemplates.ts#L42)

Service-related log message templates.

## Type declaration

### APPLICATION\_ACTIVATED

> `readonly` **APPLICATION\_ACTIVATED**: `"[ApplicationService] App activated"` = `"[ApplicationService] App activated"`

Application activated

### APPLICATION\_CLEANUP\_COMPLETE

> `readonly` **APPLICATION\_CLEANUP\_COMPLETE**: `"[ApplicationService] Cleanup completed"` = `"[ApplicationService] Cleanup completed"`

Application cleanup completed

### APPLICATION\_CLEANUP\_START

> `readonly` **APPLICATION\_CLEANUP\_START**: `"[ApplicationService] Starting cleanup"` = `"[ApplicationService] Starting cleanup"`

Application cleanup started

### APPLICATION\_CREATING\_WINDOW

> `readonly` **APPLICATION\_CREATING\_WINDOW**: `"[ApplicationService] No windows open, creating main window"` = `"[ApplicationService] No windows open, creating main window"`

Application creating window

### APPLICATION\_INITIALIZING

> `readonly` **APPLICATION\_INITIALIZING**: `"[ApplicationService] Initializing application services"` = `"[ApplicationService] Initializing application services"`

Application service initialization

### APPLICATION\_QUITTING

> `readonly` **APPLICATION\_QUITTING**: `"[ApplicationService] Quitting app (non-macOS)"` = `"[ApplicationService] Quitting app (non-macOS)"`

Application quitting

### APPLICATION\_READY

> `readonly` **APPLICATION\_READY**: `"[ApplicationService] App ready - initializing services"` = `"[ApplicationService] App ready - initializing services"`

Application app ready

### APPLICATION\_SERVICES\_INITIALIZED

> `readonly` **APPLICATION\_SERVICES\_INITIALIZED**: `"[ApplicationService] All services initialized successfully"` = `"[ApplicationService] All services initialized successfully"`

Application services initialized

### APPLICATION\_WINDOWS\_CLOSED

> `readonly` **APPLICATION\_WINDOWS\_CLOSED**: `"[ApplicationService] All windows closed"` = `"[ApplicationService] All windows closed"`

Application all windows closed

### DATABASE\_BACKUP\_CREATED

> `readonly` **DATABASE\_BACKUP\_CREATED**: `"[DatabaseBackup] Database backup created successfully"` = `"[DatabaseBackup] Database backup created successfully"`

Database backup created

### DATABASE\_CONNECTION\_CLOSED

> `readonly` **DATABASE\_CONNECTION\_CLOSED**: `"[DatabaseService] Database connection closed safely"` = `"[DatabaseService] Database connection closed safely"`

Database connection closed

### DATABASE\_INDEXES\_CREATED

> `readonly` **DATABASE\_INDEXES\_CREATED**: `"[DatabaseSchema] All indexes created successfully"` = `"[DatabaseSchema] All indexes created successfully"`

Database indexes created

### DATABASE\_INITIALIZED

> `readonly` **DATABASE\_INITIALIZED**: `"[DatabaseService] Database initialized successfully"` = `"[DatabaseService] Database initialized successfully"`

Database initialized successfully

### DATABASE\_MONITOR\_VALIDATION\_INITIALIZED

> `readonly` **DATABASE\_MONITOR\_VALIDATION\_INITIALIZED**: `"[DatabaseSchema] Monitor type validation initialized"` = `"[DatabaseSchema] Monitor type validation initialized"`

Database monitor validation initialized

### DATABASE\_MONITOR\_VALIDATION\_READY

> `readonly` **DATABASE\_MONITOR\_VALIDATION\_READY**: `"[DatabaseSchema] Monitor type validation framework ready"` = `"[DatabaseSchema] Monitor type validation framework ready"`

Database monitor validation ready

### DATABASE\_SCHEMA\_CREATED

> `readonly` **DATABASE\_SCHEMA\_CREATED**: `"[DatabaseSchema] Database schema created successfully"` = `"[DatabaseSchema] Database schema created successfully"`

Database schema created

### DATABASE\_TABLES\_CREATED

> `readonly` **DATABASE\_TABLES\_CREATED**: `"[DatabaseSchema] All tables created successfully"` = `"[DatabaseSchema] All tables created successfully"`

Database tables created

### HISTORY\_BULK\_INSERT

> `readonly` **HISTORY\_BULK\_INSERT**: `"[HistoryManipulation] Bulk inserted `count` history entries for monitor: `monitorId`"` = `"[HistoryManipulation] Bulk inserted `count` history entries for monitor: `monitorId`"`

History bulk insert

### IPC\_SERVICE\_CLEANUP

> `readonly` **IPC\_SERVICE\_CLEANUP**: `"[IpcService] Cleaning up IPC handlers"` = `"[IpcService] Cleaning up IPC handlers"`

IPC service cleanup

### MIGRATION\_APPLYING

> `readonly` **MIGRATION\_APPLYING**: `"Applying migration: `monitorType` `fromVersion` → `toVersion`"` = `"Applying migration: `monitorType` `fromVersion` → `toVersion`"`

Migration system

### MIGRATION\_REGISTERED

> `readonly` **MIGRATION\_REGISTERED**: `"Registered migration for `monitorType`: `fromVersion` → `toVersion`"` = `"Registered migration for `monitorType`: `fromVersion` → `toVersion`"`

### MONITOR\_MANAGER\_APPLYING\_INTERVALS

> `readonly` **MONITOR\_MANAGER\_APPLYING\_INTERVALS**: `"[MonitorManager] Completed applying default intervals for site: `identifier`"` = `"[MonitorManager] Completed applying default intervals for site: `identifier`"`

Monitor manager applying intervals

### MONITOR\_MANAGER\_AUTO\_STARTING

> `readonly` **MONITOR\_MANAGER\_AUTO\_STARTING**: `"[MonitorManager] Completed auto-starting monitoring for site: `identifier`"` = `"[MonitorManager] Completed auto-starting monitoring for site: `identifier`"`

Monitor manager auto-starting

### MONITOR\_REMOVED\_FROM\_SITE

> `readonly` **MONITOR\_REMOVED\_FROM\_SITE**: `"[SiteManager] Monitor `monitorId` removed from site `siteIdentifier`"` = `"[SiteManager] Monitor `monitorId` removed from site `siteIdentifier`"`

Monitor removed from site

### MONITOR\_STARTED

> `readonly` **MONITOR\_STARTED**: `"Started monitoring for monitor `monitorId` on site `siteIdentifier`"` = `"Started monitoring for monitor `monitorId` on site `siteIdentifier`"`

Monitor started

### MONITOR\_STOPPED

> `readonly` **MONITOR\_STOPPED**: `"Stopped monitoring for monitor `monitorId` on site `siteIdentifier`"` = `"Stopped monitoring for monitor `monitorId` on site `siteIdentifier`"`

Monitor stopped

### SITE\_ADDED\_SUCCESS

> `readonly` **SITE\_ADDED\_SUCCESS**: `"Site added successfully: `identifier` (`name`)"` = `"Site added successfully: `identifier` (`name`)"`

Site added successfully

### SITE\_MANAGER\_INITIALIZED

> `readonly` **SITE\_MANAGER\_INITIALIZED**: `"[SiteManager] Initialized with `count` sites in cache"` = `"[SiteManager] Initialized with `count` sites in cache"`

Site manager initialized

### SITE\_MANAGER\_INITIALIZED\_WITH\_CACHE

> `readonly` **SITE\_MANAGER\_INITIALIZED\_WITH\_CACHE**: `"[SiteManager] Initialized with StandardizedCache"` = `"[SiteManager] Initialized with StandardizedCache"`

Site manager initialized with cache

### SITE\_MANAGER\_LOADING\_CACHE

> `readonly` **SITE\_MANAGER\_LOADING\_CACHE**: `"[SiteManager] Initializing - loading sites into cache"` = `"[SiteManager] Initializing - loading sites into cache"`

Site manager cache loading

### UPDATER\_QUIT\_INSTALL

> `readonly` **UPDATER\_QUIT\_INSTALL**: `"[AutoUpdaterService] Quitting and installing update"` = `"[AutoUpdaterService] Quitting and installing update"`

Auto updater messages
