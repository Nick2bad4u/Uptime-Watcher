C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\events\middleware.ts
15,1: import { logger as baseLogger } from "../utils/logger";

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\events\TypedEventBus.ts
158,1: logger.debug(`[TypedEventBus:${this.busId}] Created new event bus (max middleware: ${this.maxMiddleware})`);
171,1: logger.debug(`[TypedEventBus:${this.busId}] Cleared ${count} middleware functions`);
220,1: logger.debug(`[TypedEventBus:${this.busId}] Starting emission of '${eventName}' [${correlationId}]`);
236,1: logger.debug(`[TypedEventBus:${this.busId}] Successfully emitted '${eventName}' [${correlationId}]`);
238,1: logger.error(`[TypedEventBus:${this.busId}] Failed to emit '${eventName}' [${correlationId}]`, error);
297,1: logger.debug(`[TypedEventBus:${this.busId}] Removed listener(s) for '${eventName}'`);
326,1: logger.debug(`[TypedEventBus:${this.busId}] Registered one-time listener for '${eventName}'`);
349,1: logger.debug(`[TypedEventBus:${this.busId}] Registered listener for '${eventName}'`);
366,1: logger.debug(`[TypedEventBus:${this.busId}] Removed middleware (remaining: ${this.middlewares.length})`);
395,1: logger.debug(
449,1: logger.debug(
492,1: logger.error(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\managers\MonitorManager.ts
229,1: logger.warn(`Site ${identifier} not found or has no monitors for manual check`);
327,1: logger.debug(`[MonitorManager] Setting up ${newMonitorIds.length} new monitors for site: ${site.identifier}`);
333,1: logger.debug(`[MonitorManager] No valid new monitors found for site: ${site.identifier}`);
340,1: logger.info(
451,1: logger.warn(`[MonitorManager] Preventing recursive call for ${identifier}/${monitorId ?? "all"}`);
541,1: logger.warn(`[MonitorManager] Preventing recursive call for ${identifier}/${monitorId ?? "all"}`);
573,1: logger.debug(`[MonitorManager] Applying default intervals for site: ${site.identifier}`);
593,1: logger.debug(
599,1: logger.info(`[MonitorManager] Completed applying default intervals for site: ${site.identifier}`);
613,1: logger.debug(
619,1: logger.debug(
627,1: logger.debug(`[MonitorManager] No monitors found for site: ${site.identifier}`);
631,1: logger.debug(`[MonitorManager] Auto-starting monitoring for site: ${site.identifier}`);
639,1: logger.debug(
644,1: logger.debug(`[MonitorManager] Skipping monitor ${monitor.id} - individual monitoring disabled`);
648,1: logger.info(`[MonitorManager] Completed auto-starting monitoring for site: ${site.identifier}`);
666,1: logger.debug(`[MonitorManager] Auto-started monitoring for new monitor: ${monitor.id}`);
668,1: logger.debug(`[MonitorManager] Skipping new monitor ${monitor.id} - individual monitoring disabled`);
687,1: logger.warn(`Site ${siteIdentifier} not found in cache for scheduled check`);
695,1: logger.error(`Enhanced monitor check failed for ${monitorId}`, error);
717,1: logger.debug(
726,1: logger.debug(`[MonitorManager] Skipping auto-start for new monitors - site monitoring disabled`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\managers\SiteManager.ts
217,1: logger.info("[SiteManager] Initialized with StandardizedCache");
256,1: logger.info(`Site added successfully: ${site.identifier} (${site.name || "unnamed"})`);
285,1: logger.debug(`[SiteManager] Failed to emit cache miss event`, error);
290,1: logger.debug(`[SiteManager] Background loading error ignored`, error);
362,1: logger.info("[SiteManager] Initializing - loading sites into cache");
365,1: logger.info(`[SiteManager] Initialized with ${sites.length} sites in cache`);
367,1: logger.error("[SiteManager] Failed to initialize cache", error);
416,1: logger.info(`[SiteManager] Monitor ${monitorId} removed from site ${siteIdentifier}`);
422,1: logger.error(`[SiteManager] Failed to remove monitor ${monitorId} from site ${siteIdentifier}`, error);
605,1: logger.error("[SiteManager] Failed to set history limit", error);
679,1: logger.debug(`[SiteManager] Loading site in background: ${identifier}`);
693,1: logger.debug(`[SiteManager] Background site load completed: ${identifier}`);
695,1: logger.debug(`[SiteManager] Site not found during background load: ${identifier}`);
707,1: logger.debug(`[SiteManager] Background site load failed for ${identifier}`, error);
718,1: logger.debug(`[SiteManager] Failed to emit background load error event`, emitError);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\application\ApplicationService.ts
46,1: logger.info("[ApplicationService] Initializing application services");
71,1: logger.info("[ApplicationService] Starting cleanup");
76,1: logger.debug(`[ApplicationService] Cleaning up ${name}`);
94,1: logger.info("[ApplicationService] Cleanup completed");
96,1: logger.error("[ApplicationService] Error during cleanup", error);
112,1: logger.info("[ApplicationService] App ready - initializing services");
126,1: logger.info("[ApplicationService] All services initialized successfully");
144,1: logger.error("[ApplicationService] Error during app initialization", error);
149,1: logger.info("[ApplicationService] All windows closed");
151,1: logger.info("[ApplicationService] Quitting app (non-macOS)");
157,1: logger.info("[ApplicationService] App activated");
160,1: logger.info("[ApplicationService] No windows open, creating main window");
188,1: logger.error("[ApplicationService] Failed to check for updates", error);
213,1: logger.debug("[ApplicationService] Forwarding monitor status change to renderer", {
223,1: logger.error("[ApplicationService] Failed to forward monitor status change to renderer", error);
230,1: logger.info("[ApplicationService] Monitor recovered - forwarding to renderer", {
239,1: logger.error("[ApplicationService] Failed to forward monitor up to renderer", error);
246,1: logger.warn("[ApplicationService] Monitor failure detected - forwarding to renderer", {
255,1: logger.error("[ApplicationService] Failed to forward monitor down to renderer", error);
261,1: logger.error(`[ApplicationService] System error: ${data.context}`, data.error);
267,1: logger.debug("[ApplicationService] Forwarding monitoring started to renderer", data);
270,1: logger.error("[ApplicationService] Failed to forward monitoring started to renderer", error);
276,1: logger.debug("[ApplicationService] Forwarding monitoring stopped to renderer", data);
279,1: logger.error("[ApplicationService] Failed to forward monitoring stopped to renderer", error);
286,1: logger.debug("[ApplicationService] Forwarding cache invalidation to renderer", {
293,1: logger.error("[ApplicationService] Failed to forward cache invalidation to renderer", error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\utils\databaseBackup.ts
103,1: logger.info("[DatabaseBackup] Database backup created successfully", {
120,1: logger.error("[DatabaseBackup] Failed to create database backup", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\utils\databaseSchema.ts
96,1: logger.debug("[DatabaseSchema] All indexes created successfully");
98,1: logger.error("[DatabaseSchema] Failed to create indexes", error);
123,1: logger.info("[DatabaseSchema] Database schema created successfully");
129,1: logger.error("[DatabaseSchema] Failed to create database schema", error);
174,1: logger.info("[DatabaseSchema] All tables created successfully");
176,1: logger.error("[DatabaseSchema] Failed to create tables", error);
197,1: logger.warn("[DatabaseSchema] No monitor types registered - validation will allow any type");
199,1: logger.info("[DatabaseSchema] Monitor type validation initialized", {
215,1: logger.info("[DatabaseSchema] Monitor type validation framework ready");
217,1: logger.error("[DatabaseSchema] Failed to setup monitor type validation", error);
220,1: logger.warn("[DatabaseSchema] Continuing without monitor type validation");

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\utils\historyManipulation.ts
62,1: logger.debug(
67,1: logger.error(`[HistoryManipulation] Failed to add history entry for monitor: ${monitorId}`, error);
116,1: logger.info(
123,1: logger.error(`[HistoryManipulation] Failed to bulk insert history for monitor: ${monitorId}`, error);
147,1: logger.debug("[HistoryManipulation] Cleared all history");
150,1: logger.error("[HistoryManipulation] Failed to clear all history", error);
173,1: logger.debug(`[HistoryManipulation] Deleted history for monitor: ${monitorId}`);
176,1: logger.error(`[HistoryManipulation] Failed to delete history for monitor: ${monitorId}`, error);
222,1: logger.debug(
229,1: logger.error(`[HistoryManipulation] Failed to prune history for monitor: ${monitorId}`, error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\utils\historyMapper.ts
145,1: logger.error("[HistoryMapper] Failed to map database row to history entry", {
214,1: logger.warn("[HistoryMapper] Invalid status value, defaulting to 'down'", { status });

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\utils\historyQuery.ts
57,1: logger.error(`[HistoryQuery] Failed to fetch history for monitor: ${monitorId}`, error); /_ v8 ignore next _/
87,1: logger.error(`[HistoryQuery] Failed to get history count for monitor: ${monitorId}`, error);
122,1: logger.error(`[HistoryQuery] Failed to get latest history entry for monitor: ${monitorId}`, error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\utils\monitorMapper.ts
74,1: logger.error("[MonitorMapper] Failed to build monitor parameters", { error, monitor, siteIdentifier });
165,1: logger.error("[MonitorMapper] Failed to map database row to monitor", { error, row });
289,1: logger.warn("active_operations contains invalid or unsafe data, using empty array", { parsed });
293,1: logger.warn("Failed to parse active_operations, using empty array", error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\utils\settingsMapper.ts
81,1: logger.error("[SettingsMapper:rowToSetting] Failed to map database row to setting", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\utils\siteMapper.ts
118,1: logger.error("[SiteMapper.rowToSite] Failed to map database row to site", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\DatabaseService.ts
113,1: logger.info("[DatabaseService] Database connection closed safely");
115,1: logger.error("[DatabaseService] Failed to close database", error);
160,1: logger.error("[DatabaseService] Failed to rollback transaction", rollbackError);
217,1: logger.info(`[DatabaseService] Initializing SQLite DB at: ${dbPath}`);
223,1: logger.info("[DatabaseService] Database initialized successfully");
226,1: logger.error("[DatabaseService] Failed to initialize database", error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\HistoryRepository.ts
153,1: logger.info(
389,1: logger.debug(`[HistoryRepository] Pruned history for all monitors (limit: ${limit}) (internal)`);
435,1: logger.debug(`[HistoryRepository] Pruned history for monitor ${monitorId} (limit: ${limit}) (internal)`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\MonitorRepository.ts
140,1: logger.info(`[MonitorRepository] Bulk created ${monitors.length} monitors for site: ${siteIdentifier}`);
183,1: logger.debug(`[MonitorRepository] Cleared all active operations for monitor ${monitorId}`);
245,1: logger.debug(
274,1: logger.debug(`[MonitorRepository] Deleted monitor with id: ${monitorId}`);
277,1: logger.warn(`[MonitorRepository] Monitor not found for deletion: ${monitorId}`);
320,1: logger.debug("[MonitorRepository] Cleared all monitors (internal)");
343,1: logger.debug(`[MonitorRepository] Deleted all monitors for site: ${siteIdentifier}`);
505,1: logger.debug(`[MonitorRepository] updateInternal called with monitorId: ${monitorId}, monitor:`, monitor);
512,1: logger.debug(`[MonitorRepository] mapMonitorToRow result:`, row);
522,1: logger.debug(`[MonitorRepository] No fields to update for monitor: ${monitorId} (internal)`);
585,1: logger.warn(`[MonitorRepository] Skipping non-primitive field ${key} with value:`, value);
606,1: logger.debug(`[MonitorRepository] Executing SQL: ${sql} with values:`, updateValues);
612,1: logger.debug(`[MonitorRepository] Updated monitor with id: ${monitorId} (internal)`);
640,1: logger.debug(`[MonitorRepository] Skipping 'enabled' field - monitoring state not provided in update`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\SettingsRepository.ts
130,1: logger.info(`[SettingsRepository] Bulk inserted ${entries.length} settings (internal)`);
189,1: logger.info("[SettingsRepository] All settings deleted (internal)");
203,1: logger.debug(`[SettingsRepository] Deleted setting (internal): ${key}`);
285,1: logger.debug(`[SettingsRepository] Set setting (internal): ${key} = ${value}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\SiteRepository.ts
144,1: logger.debug(`[SiteRepository] Bulk inserted ${sites.length} sites (internal)`);
208,1: logger.debug("[SiteRepository] All sites deleted (internal)");
229,1: logger.debug(`[SiteRepository] Deleted site: ${identifier}`);
231,1: logger.warn(`[SiteRepository] Site not found for deletion: ${identifier}`);
236,1: logger.error(`[SiteRepository] Failed to delete site: ${identifier}`, error);
328,1: logger.error(`[SiteRepository] Failed to find site: ${identifier}`, error);
383,1: logger.debug(`[SiteRepository] Upserted site (internal): ${identifier}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\ipc\IpcService.ts
68,1: logger.warn("[IpcService] Unexpected properties in monitor config", {
219,1: logger.info("[IpcService] Cleaning up IPC handlers");
452,1: logger.warn("[IpcService] Unknown monitor type for detail formatting", { monitorType });
475,1: logger.warn("[IpcService] Unknown monitor type for title suffix formatting", { monitorType });
596,1: logger.debug("[IpcService] Full sync completed", { siteCount: sites.length });
631,1: logger.info("[IpcService] Handling quit-and-install");

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\ipc\utils.ts
228,1: logger.debug(`[IpcHandler] Starting ${channelName}`);
235,1: logger.debug(`[IpcHandler] Completed ${channelName}`, { duration });
243,1: logger.error(`[IpcHandler] Failed ${channelName}`, {
291,1: logger.debug(`[IpcHandler] Starting ${channelName}`, { paramCount: params.length });
298,1: logger.warn(`[IpcHandler] Validation failed ${channelName}`, { errors: validationErrors });
306,1: logger.debug(`[IpcHandler] Completed ${channelName}`, { duration });
314,1: logger.error(`[IpcHandler] Failed ${channelName}`, {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\utils\errorHandling.ts
38,1: logger.debug(`[HttpMonitor] Creating error result`, { correlationId, error, responseTime });
81,1: logger.debug(`[HttpMonitor] Network error for ${url}: ${errorMessage}`, logData);
118,1: logger.error(`[HttpMonitor] Unexpected error checking ${url}`, logData);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\utils\pingErrorHandling.ts
48,1: logger.error("Ping check failed", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\utils\pingRetry.ts
91,1: logger.debug("Starting ping check with retry", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\utils\portChecker.ts
66,1: logger.debug(`[PortMonitor] Checking port: ${host}:${port} with timeout: ${timeout}ms`);
80,1: logger.debug(`[PortMonitor] Port ${host}:${port} is reachable in ${responseTime}ms`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\utils\portErrorHandling.ts
150,1: logger.debug(`[PortMonitor] Final error for ${host}:${port}: ${errorMessage}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\utils\portRetry.ts
76,1: logger.debug(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\EnhancedMonitorChecker.ts
310,1: logger.debug(`Monitor ${monitorId} not monitoring, skipping check`);
335,1: logger.info(`Started monitoring for monitor ${monitorId} on site ${siteIdentifier}`);
347,1: logger.error(`Failed to start monitoring for monitor ${monitorId}`, error);
370,1: logger.info(`Stopped monitoring for monitor ${monitorId} on site ${siteIdentifier}`);
383,1: logger.error(`Failed to stop monitoring for monitor ${monitorId}`, error);
443,1: logger.error(`Monitor check failed for ${monitor.id}`, error);
473,1: logger.warn(`Fresh monitor data not found for ${checkResult.monitorId}`);
523,1: logger.info(`Checking monitor: site=${site.identifier}, id=${monitor.id}, operation=${operationId}`);
539,1: logger.error(`Monitor check failed for ${monitorId}`, error);
606,1: logger.warn(`Fresh monitor data not found for ${monitor.id}`);
643,1: logger.error(`Direct monitor check failed for ${monitor.id}`, error);
671,1: logger.warn(`Unknown monitor type: ${monitor.type}`);
684,1: logger.error(`Monitor check failed for ${monitor.id}`, error);
701,1: logger.warn("Cannot save history entry: monitor missing ID");
725,1: logger.debug(
731,1: logger.debug(`Saved history entry for monitor ${monitor.id}: ${checkResult.status}`);
733,1: logger.error(`Failed to save history entry for monitor ${monitor.id}`, error);
762,1: logger.error(`Failed to add operation ${operationId} to monitor ${monitorId}`, error);
779,1: logger.error(`Monitor not found for id: ${monitorId} on site: ${site.identifier}`);
784,1: logger.error(`Monitor missing id for ${site.identifier}, skipping check.`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\HttpMonitor.ts
274,1: logger.debug(
299,1: logger.debug(`[HttpMonitor] Checking URL: ${url} with timeout: ${timeout}ms`);
306,1: logger.debug(`[HttpMonitor] URL ${url} responded with status ${response.status} in ${responseTime}ms`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\MigrationSystem.ts
180,1: logger.info(`Applying migration: ${monitorType} ${migration.fromVersion} → ${migration.toVersion}`);
194,1: logger.error(errorMessage, {
224,1: logger.error(errorMessage, error);
359,1: logger.info(`Registered migration for ${monitorType}: ${rule.fromVersion} → ${rule.toVersion}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\MonitorFactory.ts
192,1: logger.warn(`Failed to update config for monitor type ${type}`, { error });
233,1: logger.warn("Failed to update config for monitor instance", { error });

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\MonitorOperationRegistry.ts
82,1: logger.debug(`Cancelled ${cancelledCount} operations for monitor ${monitorId}`);
95,1: logger.debug(`Completed operation ${operationId} for monitor ${operation.monitorId}`);
145,1: logger.debug(`Initiated operation ${operationId} for monitor ${monitorId}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\MonitorScheduler.ts
103,1: logger.error(`[MonitorScheduler] Error during immediate check for ${intervalKey}`, error);
174,1: logger.warn(`[MonitorScheduler] Cannot start monitoring for monitor without ID: ${siteIdentifier}`);
187,1: logger.debug(
199,1: logger.error(`[MonitorScheduler] Error during scheduled check for ${intervalKey}`, error);
210,1: logger.error(`[MonitorScheduler] Error during immediate check for ${intervalKey}`, error);
215,1: logger.debug(
263,1: logger.info("[MonitorScheduler] Stopped all monitoring intervals");
290,1: logger.debug(`[MonitorScheduler] Stopped monitoring for ${intervalKey}`);
409,1: logger.warn(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\MonitorStatusUpdateService.ts
77,1: logger.debug(`Ignoring cancelled operation ${result.operationId}`);
85,1: logger.warn(`Monitor ${result.monitorId} not found, ignoring result`);
92,1: logger.debug(`Monitor ${result.monitorId} no longer monitoring, ignoring result`);
114,1: logger.debug(`Updated monitor ${result.monitorId} status to ${result.status}`);
117,1: logger.error(`Failed to update monitor status for ${result.monitorId}`, error);
135,1: logger.warn(`Site not found for monitor ${monitorId}, cannot refresh cache`);
142,1: logger.warn(`Fresh monitor data not found for ${monitorId}`);
153,1: logger.debug(`Refreshed site cache for monitor ${monitorId} in site ${site.identifier}`);
155,1: logger.warn(`Failed to refresh site cache for monitor ${monitorId}`, error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\MonitorTypeRegistry.ts
554,1: logger.info(`Migrating monitor type ${monitorType} from ${fromVersion} to ${toVersion}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\OperationTimeoutManager.ts
43,1: logger.debug(`Cleared timeout for operation ${operationId}`);
59,1: logger.debug(`Scheduled timeout for operation ${operationId} (${timeoutMs}ms)`);
70,1: logger.warn(`Operation ${operationId} timed out, cancelling`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\notifications\NotificationService.ts
140,1: logger.error("[NotificationService] Cannot notify down: monitorId is invalid");
148,1: logger.warn(
156,1: logger.warn(`[NotificationService] Monitor down alert: ${site.name} [${monitorType}]`);
165,1: logger.info(`[NotificationService] Notification sent for monitor down: ${site.name} (${monitorType})`);
167,1: logger.warn("[NotificationService] Notifications not supported on this platform");
197,1: logger.error("[NotificationService] Cannot notify up: monitorId is invalid");
205,1: logger.warn(
213,1: logger.info(`[NotificationService] Monitor restored: ${site.name} [${monitorType}]`);
222,1: logger.info(`[NotificationService] Notification sent for monitor restored: ${site.name} (${monitorType})`);
224,1: logger.warn("[NotificationService] Notifications not supported on this platform");
260,1: logger.debug("[NotificationService] Configuration updated", this.config);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\site\SiteService.ts
86,1: logger.debug(`[SiteService] Starting deletion of site ${identifier} with related data`);
90,1: logger.debug(`[SiteService] Found ${monitors.length} monitors to delete for site ${identifier}`);
102,1: logger.debug(`[SiteService] Deleted history for ${monitors.length} monitors`);
110,1: logger.debug(`[SiteService] Deleted monitors for site ${identifier}`);
118,1: logger.info(`[SiteService] Successfully deleted site ${identifier} with all related data`);
150,1: logger.debug(`[SiteService] Site not found: ${identifier}`);
174,1: logger.debug(`[SiteService] Found site ${identifier} with ${monitors.length} monitors`);
198,1: logger.debug(`[SiteService] Loading details for ${siteRows.length} sites`);
223,1: logger.info(`[SiteService] Loaded ${sites.length} sites with complete details`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\updater\AutoUpdaterService.ts
81,1: logger.error("[AutoUpdaterService] Failed to check for updates", error);
115,1: logger.info("[AutoUpdaterService] Initializing auto-updater");
118,1: logger.debug("[AutoUpdaterService] Checking for updates");
123,1: logger.info("[AutoUpdaterService] Update available", info);
128,1: logger.debug("[AutoUpdaterService] No update available", info);
133,1: logger.debug("[AutoUpdaterService] Download progress", {
143,1: logger.info("[AutoUpdaterService] Update downloaded", info);
148,1: logger.error("[AutoUpdaterService] Auto-updater error", error);
190,1: logger.info("[AutoUpdaterService] Quitting and installing update");

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\window\WindowService.ts
88,1: logger.debug("[WindowService] Created WindowService in development mode");
171,1: logger.debug(`[WindowService] Sending to renderer: ${channel}`);
174,1: logger.warn(`[WindowService] Cannot send to renderer (no main window): ${channel}`);
226,1: logger.error("[WindowService] Cannot load content: main window not initialized");
231,1: logger.debug("[WindowService] Development mode: waiting for Vite dev server");
232,1: logger.debug("[WindowService] NODE_ENV:", getNodeEnv());
237,1: logger.debug("[WindowService] Production mode: loading from dist");
239,1: logger.error("[WindowService] Failed to load production file", {
292,1: logger.warn("[WindowService] Failed to open DevTools", {
307,1: logger.error("[WindowService] Failed to load development content", errorContext);
323,1: logger.info("[WindowService] Main window ready to show");
328,1: logger.debug("[WindowService] DOM ready in renderer");
332,1: logger.debug("[WindowService] Renderer finished loading");
336,1: logger.error(`[WindowService] Failed to load renderer: ${errorCode} - ${errorDescription}`);
340,1: logger.info("[WindowService] Main window closed");
377,1: logger.debug("[WindowService] Vite dev server is ready");
383,1: logger.debug(
398,1: logger.debug(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\ServiceContainer.ts
176,1: logger.debug("[ServiceContainer] Creating new service container");
223,1: logger.debug("[ServiceContainer] Created AutoUpdaterService");
238,1: logger.debug("[ServiceContainer] Created ConfigurationManager");
267,1: logger.debug("[ServiceContainer] Created DatabaseManager with dependencies");
294,1: logger.debug("[ServiceContainer] Created HistoryRepository");
378,1: logger.debug("[ServiceContainer] Created IpcService with dependencies");
439,1: logger.debug("[ServiceContainer] Created MonitorManager with dependencies");
456,1: logger.debug("[ServiceContainer] Created MonitorRepository");
471,1: logger.debug("[ServiceContainer] Created NotificationService");
488,1: logger.debug("[ServiceContainer] Created SettingsRepository");
521,1: logger.debug(`[ServiceContainer] History limit set to ${limit} via DatabaseManager`);
523,1: logger.error("[ServiceContainer] Failed to set history limit", {
577,1: logger.debug("[ServiceContainer] Created SiteManager with dependencies");
594,1: logger.debug("[ServiceContainer] Created SiteRepository");
614,1: logger.debug("[ServiceContainer] Created SiteService");
636,1: logger.debug("[ServiceContainer] Created UptimeOrchestrator with injected dependencies");
651,1: logger.debug("[ServiceContainer] Created WindowService");
667,1: logger.info("[ServiceContainer] Initializing services");
681,1: logger.info("[ServiceContainer] All services initialized successfully");
733,1: logger.error(`[ServiceContainer] Error forwarding ${eventType} from ${managerName}:`, error);
736,1: logger.debug(
744,1: logger.debug(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\cache\StandardizedCache.ts
105,1: logger.debug(
117,1: logger.debug(`[Cache:${this.config.name}] Bulk updating ${items.length} items`);
144,1: logger.debug(`[Cache:${this.config.name}] Cleaned up ${cleaned} expired items`);
164,1: logger.debug(`[Cache:${this.config.name}] Cleared cache (${size} items)`);
181,1: logger.debug(`[Cache:${this.config.name}] Deleted item: ${key}`);
244,1: logger.debug(`[Cache:${this.config.name}] Cache hit for key: ${key}`);
312,1: logger.debug(`[Cache:${this.config.name}] Invalidated key: ${key}`);
325,1: logger.debug(`[Cache:${this.config.name}] Invalidated all ${size} items`);
369,1: logger.debug(`[Cache:${this.config.name}] Invalidation callback registered`);
374,1: logger.debug(`[Cache:${this.config.name}] Invalidation callback removed`);
404,1: logger.debug(`[Cache:${this.config.name}] Cached item: ${key} (TTL: ${effectiveTTL}ms)`);
438,1: logger.debug(`[Cache:${this.config.name}] Evicted LRU item: ${oldestKey}`);
457,1: logger.error(`[Cache:${this.config.name}] Error in invalidation callback:`, error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\database\DataBackupService.ts
53,1: this.logger.info(`Database backup created: ${result.fileName}`);
57,1: this.logger.error(message, error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\database\databaseInitializer.ts
32,1: logger.error("Failed to initialize database", error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\database\DataImportExportService.ts
95,1: this.logger.error(message, error);
128,1: this.logger.error(message, error);
171,1: this.logger.info(
238,1: this.logger.debug(
242,1: this.logger.error(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\database\historyLimitManager.ts
106,1: logger.debug(`History limit set to ${finalLimit}`);
108,1: logger.debug(`Pruned history to ${finalLimit} entries per monitor`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\database\serviceFactory.ts
26,1: this.logger.debug(message, ...args);
30,1: this.logger.error(message, error, ...args);
34,1: this.logger.info(message, ...args);
38,1: this.logger.warn(message, ...args);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\database\SiteRepositoryService.ts
167,1: this.logger.info(`History limit applied: ${limit}`);
184,1: this.logger.warn(`Invalid history limit setting: ${historyLimitSetting}`);
190,1: this.logger.warn("Could not load history limit from settings:", error);
224,1: this.logger.error(message, error);
242,1: this.logger.info(`Loaded ${sites.length} sites into cache`);
245,1: this.logger.error(message, error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\database\SiteWriterService.ts
112,1: this.logger.info(`Creating new site in database: ${siteData.identifier}`);
135,1: this.logger.info(
180,1: this.logger.info(`Removing site: ${identifier}`);
194,1: this.logger.info(`Site removed successfully: ${identifier}`);
196,1: this.logger.warn(`Site not found in cache for removal: ${identifier}`);
264,1: this.logger.debug(
280,1: this.logger.error(`Failed to handle monitor interval changes for site ${identifier}:`, error);
355,1: this.logger.info(`Site updated successfully: ${identifier}`);
422,1: this.logger.debug(`Created new monitor ${newId} for site ${siteIdentifier}${reasonSuffix}`);
500,1: this.logger.debug(`Removed monitor ${existingMonitor.id} from site ${siteIdentifier}`);
516,1: this.logger.warn(`Attempted to update existing monitor without ID for site ${siteIdentifier}`, {
524,1: this.logger.debug(`Updated existing monitor ${newMonitor.id} for site ${siteIdentifier}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\monitoring\monitorLifecycle.ts
81,1: config.logger.debug("Monitoring already running");
85,1: config.logger.info(`Starting monitoring with ${config.sites.size} sites (per-site intervals)`);
111,1: config.logger.error(
121,1: config.logger.info(`Started all monitoring operations and set monitors to ${MONITOR_STATUS.PENDING}`);
142,1: config.logger.warn(`Site not found for monitoring: ${identifier}`);
198,1: config.logger.error(
207,1: config.logger.info(`Stopped all site monitoring intervals and set monitors to ${MONITOR_STATUS.PAUSED}`);
228,1: config.logger.warn(`Site not found for stopping monitoring: ${identifier}`);
254,1: config.logger.warn(`Monitor not found: ${identifier}:${monitorId}`);
301,1: config.logger.error(`Failed to process monitor ${monitor.id}:`, error);
372,1: config.logger.debug(`Refreshed site cache for ${identifier} after monitor start`);
375,1: config.logger.warn(`Failed to refresh site cache for ${identifier}`, error);
382,1: config.logger.debug(
388,1: config.logger.error(`Failed to start monitoring for ${identifier}:${monitorId}`, error);
447,1: config.logger.debug(`Refreshed site cache for ${identifier} after monitor stop`);
450,1: config.logger.warn(`Failed to refresh site cache for ${identifier}`, error);
457,1: config.logger.debug(
463,1: config.logger.error(`Failed to stop monitoring for ${identifier}:${monitorId}`, error);
491,1: config.logger.warn(`Monitor ${identifier}:${monitor.id} has no valid check interval set`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\operationalHooks.ts
139,1: /_ v8 ignore next 2 _/ logger.debug(
152,1: /_ v8 ignore next 2 _/ logger.debug(
202,1: /_ v8 ignore next 2 _/ logger.debug(
219,1: logger.debug("[OperationalHooks] crypto.randomUUID() not available, using fallback", error);
244,1: /_ v8 ignore next 2 _/ logger.debug(
262,1: /_ v8 ignore next 2 _/ logger.debug(
269,1: /_ v8 ignore next 2 _/ logger.error(
303,1: /_ v8 ignore next 2 _/ logger.debug(
313,1: /_ v8 ignore next 2 _/ logger.debug(`[OperationalHooks] Retrying ${operationName} in ${delay}ms`, {
341,1: /_ v8 ignore next 2 _/ logger.debug(
360,1: /_ v8 ignore next 2 _/ logger.debug(
367,1: /_ v8 ignore next 2 _/ logger.debug(`[OperationalHooks] ${operationName} succeeded after ${attempt} attempt(s)`, {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\main.ts
102,1: logger.info("Starting Uptime Watcher application");
112,1: logger.error("[Main] Cleanup failed", error);
162,1: logger.info(`[Main] Added Extensions: ${extensions.map((ext) => ext.name).join(", ")}`);
165,1: logger.warn("[Main] Failed to install dev extensions (this is normal in production)", error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\UptimeOrchestrator.ts
268,1: logger.info(
272,1: logger.error(
279,1: logger.error(`[UptimeOrchestrator] Failed to add site ${siteData.identifier}:`, error);
360,1: logger.info("[UptimeOrchestrator] Starting initialization...");
364,1: logger.info("[UptimeOrchestrator] Database manager initialized");
368,1: logger.info("[UptimeOrchestrator] Site manager initialized");
373,1: logger.info("[UptimeOrchestrator] Initialization completed successfully");
375,1: logger.error("[UptimeOrchestrator] Initialization failed:", error);
401,1: logger.warn(
416,1: logger.warn(
421,1: logger.info(
429,1: logger.error(`[UptimeOrchestrator] ${criticalError.message}:`, restartError);
444,1: logger.error(`[UptimeOrchestrator] Failed to remove monitor ${siteIdentifier}/${monitorId}:`, error);
609,1: logger.error(`[UptimeOrchestrator] Failed to setup monitoring for site ${site.identifier}:`, error);
628,1: logger.error(`[UptimeOrchestrator] ${errorMessage}`);
638,1: logger.warn(
643,1: logger.info(`[UptimeOrchestrator] Successfully set up monitoring for all ${successful} loaded sites`);
653,1: logger.error("[UptimeOrchestrator] Error handling update-sites-cache-requested:", error);
659,1: logger.error("[UptimeOrchestrator] Error handling get-sites-from-cache-requested:", error);
665,1: logger.error("[UptimeOrchestrator] Error handling internal:database:initialized:", error);
750,1: logger.error("[UptimeOrchestrator] Error handling internal:monitor:started:", error);
768,1: logger.error("[UptimeOrchestrator] Error handling internal:monitor:stopped:", error);
790,1: logger.error(`[UptimeOrchestrator] Error starting monitoring for site ${data.identifier}:`, error);
814,1: logger.error(`[UptimeOrchestrator] Error stopping monitoring for site ${data.identifier}:`, error);
853,1: logger.error(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\shared\utils\errorHandling.ts
125,1: logger.error(operationName ? `Failed to ${operationName}` : "Async operation failed", error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\components\AddSiteForm\AddSiteForm.tsx
22,1: import logger from "../../services/logger";
138,1: logger.error(`Invalid monitor type value: ${value}`);
150,1: logger.error(`Invalid check interval value: ${value}`);
235,1: logger.error(`Invalid add mode value: ${value}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\components\AddSiteForm\DynamicMonitorFields.tsx
17,1: import logger from "../../services/logger";
126,1: logger.error(`Missing onChange handler for field: ${field.name}`);
140,1: logger.warn(`No onChange handler provided for field: ${field.name}`);
186,1: logger.error(`Invalid numeric input: ${val}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\components\AddSiteForm\Submit.tsx
112,1: logger.debug("Form submission started", {
131,1: logger.debug("Form validation failed", {
175,1: logger.info("Monitor added to site successfully", {
278,1: logger.info(`Successfully ${addMode === "new" ? "created site" : "added monitor"}: ${identifier}`);
296,1: logger.info("Site created successfully", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\components\common\MonitorUiComponents.tsx
11,1: import logger from "../../services/logger";
59,1: logger.warn("Failed to check response time support", error as Error);
98,1: logger.warn("Failed to format detail label", error as Error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\components\Settings\Settings.tsx
16,1: import logger from "../../services/logger";
86,1: logger.warn("Attempted to update invalid settings key", key);
92,1: logger.user.settingsChange(key, oldValue, value);
103,1: logger.user.settingsChange("historyLimit", oldLimit, limit);
105,1: logger.error("Failed to update history limit from settings", ensureError(error));
115,1: logger.user.action("Reset settings to defaults");
122,1: logger.user.settingsChange("theme", oldTheme, themeName);
131,1: logger.user.action("Synced data from SQLite backend");
133,1: logger.error("Failed to sync data from backend", ensureError(error));
148,1: logger.user.action("Downloaded SQLite backup");
150,1: logger.error("Failed to download SQLite backup", ensureError(error));

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\components\SiteDetails\tabs\AnalyticsTab.tsx
13,1: import logger from "../../../services/logger";
185,1: logger.user.action("Chart time range changed", {
294,1: logger.user.action("Advanced metrics toggle", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\components\SiteDetails\tabs\HistoryTab.tsx
10,1: import logger from "../../../services/logger";
130,1: logger.user.action("History tab viewed", {
170,1: logger.user.action("History filter changed", {
198,1: logger.user.action("History limit changed", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\components\SiteDetails\tabs\OverviewTab.tsx
11,1: import logger from "../../../services/logger";
317,1: logger.user.action("Monitor removal button clicked from overview tab", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\components\SiteDetails\tabs\SettingsTab.tsx
11,1: import logger from "../../../services/logger";
127,1: logger.user.action("Settings: Save site name initiated", {
136,1: logger.user.action("Settings: Save check interval", {
146,1: logger.user.action("Settings: Remove site initiated", {
154,1: logger.user.action("Settings: Save timeout", {
164,1: logger.user.action("Settings: Save retry attempts", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\components\SiteDetails\SiteDetailsNavigation.tsx
9,1: import logger from "../../services/logger";
75,1: logger.user.action("Site details tab changed", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\hooks\site\useSiteActions.ts
3,1: import logger from "../../services/logger";
87,1: logger.site.error(
96,1: logger.user.action("Started site monitoring", {
103,1: logger.site.error(site.identifier, ensureError(error));
110,1: logger.site.error(
119,1: logger.user.action("Stopped site monitoring", {
126,1: logger.site.error(site.identifier, ensureError(error));
135,1: logger.user.action("Started site-wide monitoring", {
141,1: logger.site.error(site.identifier, ensureError(error));
151,1: logger.user.action("Stopped site-wide monitoring", {
157,1: logger.site.error(site.identifier, ensureError(error));
165,1: logger.site.error(site.identifier, ensureError(new Error("Attempted to check site without valid monitor")));
169,1: logger.user.action("Manual site check initiated", {
181,1: logger.user.action("Manual site check completed successfully", {
188,1: logger.site.error(site.identifier, errorObj);
196,1: logger.user.action("Site card clicked - navigating to details", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\hooks\site\useSiteDetails.ts
21,1: import logger from "../../services/logger";
221,1: logger.user.action("Manual site check initiated", {
228,1: logger.user.action("Manual site check completed successfully", {
274,1: logger.site.removed(currentSite.identifier);
285,1: logger.site.error(currentSite.identifier, "No monitor selected for removal");
303,1: logger.user.action("Monitor removed successfully", {
330,1: logger.user.action("Started site monitoring", {
355,1: logger.user.action("Stopped site monitoring", {
378,1: logger.user.action("Started monitoring", {
394,1: logger.user.action("Stopped monitoring", {
427,1: logger.site.error(currentSite.identifier, validationError);
433,1: logger.user.action("Updated check interval", {
473,1: logger.site.error(currentSite.identifier, validationError);
479,1: logger.user.action("Updated monitor timeout", {
517,1: logger.site.error(currentSite.identifier, validationError);
523,1: logger.user.action("Updated monitor retry attempts", {
554,1: logger.user.action("Updated site name", { identifier: currentSite.identifier, name: localName.trim() });

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\hooks\useDynamicHelpText.ts
37,1: import logger from "../services/logger";
89,1: logger.warn("Failed to load help texts", error instanceof Error ? error : new Error(String(error)));

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\hooks\useMonitorTypes.ts
42,1: import logger from "../services/logger";
81,1: logger.error(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\services\logger.ts
70,1: logger.error(`Application error in ${context}`, error);
73,1: logger.debug(`Performance: ${operation} took ${duration}ms`);
76,1: logger.info("Application started");
79,1: logger.info("Application stopped");
144,1: logger.info(`Site added: ${identifier}`);
148,1: logger.info(`Site check: ${identifier} - Status: ${status}${timeInfo}`);
152,1: logger.error(`Site check error: ${identifier} - ${error}`);
154,1: logger.error(`Site check error: ${identifier}`, error);
158,1: logger.info(`Site removed: ${identifier}`);
161,1: logger.info(`Site status change: ${identifier} - ${oldStatus} -> ${newStatus}`);
167,1: logger.debug(`Notification sent: ${title} - ${body}`);
170,1: logger.debug(`Tray action: ${action}`);
174,1: logger.debug(`Window ${action}${nameInfo}`);
180,1: logger.info(`User action: ${action}`, details ?? "");
183,1: logger.info(`Settings change: ${setting} - ${String(oldValue)} -> ${String(newValue)}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\error\ErrorBoundary.tsx
13,1: import logger from "../../services/logger";
78,1: logger.error("Store Error Boundary caught an error", error);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\shared\utils.ts
6,1: import logger from "../../services/logger";
14,1: logger.debug(`[${storeName}] ${action}`, payload);
16,1: logger.debug(`[${storeName}] ${action}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\sites\utils\fileDownload.ts
6,1: import logger from "../../../services/logger";
118,1: logger.error(
166,1: logger.warn(
195,1: logger.error("File download failed", new Error(String(error)));
210,1: logger.error("File download failed", error);
245,1: logger.error(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\sites\utils\statusUpdateHandler.ts
15,1: import logger from "../../../services/logger";
170,1: logger.warn("Invalid monitor status changed event data, triggering full sync", data);
313,1: logger.debug(`Site ${event.siteId} not found in store, triggering full sync`);
323,1: logger.debug(`Monitor ${event.monitorId} not found in site ${event.siteId}, triggering full sync`);
348,1: logger.debug(
353,1: logger.error("Failed to apply incremental status update, falling back to full sync", ensureError(error));

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\sites\useSiteOperations.ts
12,1: import logger from "../../services/logger";
136,1: logger.warn(
249,1: logger.warn(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\sites\useSiteSync.ts
19,1: import logger from "../../services/logger";
247,1: logger.error("Failed to subscribe to status updates:", ensureError(error));

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\ui\useUiStore.ts
40,1: import logger from "../../services/logger";
53,1: logger.user.action("External URL opened", {

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\utils.ts
13,1: import logger from "../services/logger";
140,1: logger.info(`[${storeName}] ${actionName}`, data);
142,1: logger.info(`[${storeName}] ${actionName}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\utils\monitoring\dataValidation.ts
6,1: import logger from "../../services/logger";
22,1: logger.warn("Invalid uptime value received", { uptime: uptimeString });

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\utils\cacheSync.ts
6,1: import logger from "../services/logger";
37,1: logger.warn("Cache invalidation events not available - frontend cache sync disabled");
45,1: logger.debug("Received cache invalidation event", data);
62,1: logger.warn("Unknown cache invalidation type:", data.type);
66,1: logger.error("Error handling cache invalidation:", ensureError(error));
70,1: logger.debug("[CacheSync] Cache synchronization enabled");
91,1: logger.debug("[CacheSync] Clearing all frontend caches");
97,1: logger.debug(`[CacheSync] Cleared ${cacheType} cache`);
99,1: logger.error(`[CacheSync] Failed to clear ${cacheType} cache:`, ensureError(error));
114,1: logger.debug("[CacheSync] Clearing monitor-related caches", { identifier });
142,1: logger.debug("[CacheSync] Clearing site-related caches", { identifier });

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\utils\errorHandling.ts
6,1: import logger from "../services/logger";
40,1: logger.error(`${operationName} failed`, wrappedError);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\utils\fallbacks.ts
8,1: import logger from "../services/logger";
49,1: logger.error(`${operationName} failed`, ensureError(error));

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\App.tsx
32,1: import logger from "./services/logger";
134,1: logger.app.started();
153,1: logger.debug(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\events\middleware.ts
558,1: throw new Error(`Validation failed for event '${event}'`);
566,1: throw new Error(`Validation failed for event '${event}': ${errorMsg}`);
580,1: throw new Error(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\events\TypedEventBus.ts
151,1: throw new Error(`maxMiddleware must be positive, got ${maxMiddleware}`);
388,1: throw new Error(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\managers\DatabaseManager.ts
407,1: throw new TypeError(
413,1: throw new TypeError(
419,1: throw new RangeError(
425,1: throw new RangeError(`[DatabaseManager.setHistoryLimit] History limit must be finite, received: ${limit}`);
431,1: throw new RangeError(
553,1: throw new Error(result.message);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\managers\SiteManager.ts
482,1: throw new Error(`Site with identifier ${identifier} not found`);
522,1: throw new Error(`Site with identifier ${identifier} not found in cache after refresh`);
601,1: throw new Error("MonitoringOperations not available but required for setHistoryLimit");
610,1: throw new Error("MonitoringOperations not available but required for setupNewMonitors");
616,1: throw new Error("MonitoringOperations not available but required for startMonitoring");
622,1: throw new Error("MonitoringOperations not available but required for stopMonitoring");
738,1: throw new Error(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\commands\DatabaseCommands.ts
175,1: throw new Error(`Command validation failed: ${validation.errors.join(", ")}`);
222,1: throw new Error(`Rollback errors: ${errors.map((e) => e.message).join(", ")}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\utils\databaseBackup.ts
97,1: throw new Error(`Failed to import fs/promises: ${errorMessage}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\utils\databaseSchema.ts
236,1: throw new Error("Generated schema is empty or invalid");
239,1: throw new Error("Generated schema missing required monitors table definition");
242,1: throw new Error("Generated schema contains undefined or null values");

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\utils\settingsMapper.ts
68,1: throw new Error(`[SettingsMapper] Invalid setting key: ${key}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\utils\siteMapper.ts
95,1: throw new Error("Invalid site row: missing or invalid identifier");

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\DatabaseService.ts
180,1: throw new Error("Database not initialized. Call initialize() first.");

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\database\MonitorRepository.ts
121,1: throw new Error("Failed to create monitor: invalid database response");
128,1: throw new Error("Failed to create monitor: invalid or missing ID in database response");
236,1: throw new Error(`Failed to create monitor for site ${siteIdentifier}: invalid database response`);
239,1: throw new Error(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\utils\pingRetry.ts
164,1: throw new Error(`Ping failed: ${errorMessage} (response time: ${responseTime}ms)`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\utils\portChecker.ts
89,1: throw new PortCheckError(PORT_NOT_REACHABLE, responseTime);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\HttpMonitor.ts
161,1: throw new Error(`HttpMonitor cannot handle monitor type: ${monitor.type}`);
210,1: throw new Error("Invalid timeout: must be a positive number");
213,1: throw new Error("Invalid userAgent: must be a string");

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\MigrationSystem.ts
299,1: throw new Error(
310,1: throw new Error(
321,1: throw new Error(
351,1: throw new Error(`Failed to create migration rules for ${monitorType}`);
409,1: throw new Error(`${parameterName} must be a non-empty string, got: ${typeof version}`);
415,1: throw new Error(
424,1: throw new Error(`${parameterName} "${version}" contains invalid numeric parts`);
612,1: throw new Error(`Invalid port value: ${portValue}. Must be 1-65535.`);
624,1: throw new Error(`Invalid port number: ${portValue}. Must be 1-65535.`);
629,1: throw new Error(`Port must be a number or numeric string, got: ${typeof portValue}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\MonitorFactory.ts
158,1: throw new Error(`Unsupported monitor type: ${type}. Available types: ${availableTypes}`);
165,1: throw new Error(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\MonitorOperationRegistry.ts
134,1: throw new Error("Failed to generate a unique operation ID after multiple attempts.");

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\MonitorScheduler.ts
404,1: throw new Error(`Invalid check interval: ${checkInterval}. Must be a positive integer.`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\PingMonitor.ts
158,1: throw new Error(`PingMonitor cannot handle monitor type: ${monitor.type}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\monitoring\PortMonitor.ts
91,1: throw new Error(`PortMonitor cannot handle monitor type: ${monitor.type}`);
161,1: throw new Error("Invalid timeout: must be a positive number");

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\site\SiteService.ts
82,1: throw new Error(`Invalid site identifier: ${identifier}`);
97,1: throw new Error(
108,1: throw new Error(`Failed to delete monitors for site ${identifier}: ${error}`);
115,1: throw new Error(`Failed to delete site ${identifier}`);
144,1: throw new Error(`Invalid site identifier: ${identifier}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\window\WindowService.ts
281,1: throw new Error("Main window was destroyed while waiting for Vite server");
405,1: throw new Error(`Vite dev server did not become available after ${MAX_RETRIES} attempts`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\services\ServiceContainer.ts
401,1: throw new Error(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\database\DataBackupService.ts
66,1: throw new SiteLoadingError(message, error instanceof Error ? error : new Error(String(error)));

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\database\DataImportExportService.ts
104,1: throw new SiteLoadingError(message, error instanceof Error ? error : undefined);
118,1: throw new Error(`Invalid import data format: ${parseResult.error ?? "Unknown parsing error"}`);
137,1: throw new SiteLoadingError(message, error instanceof Error ? error : undefined);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\database\SiteRepositoryService.ts
225,1: throw new SiteLoadingError(message, error instanceof Error ? error : undefined);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\utils\database\SiteWriterService.ts
561,1: throw new SiteNotFoundError("Site identifier is required");
566,1: throw new SiteNotFoundError(identifier);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\electron\UptimeOrchestrator.ts
229,1: throw new Error(
888,1: throw new TypeError("DatabaseManager not properly initialized - missing initialize method");
891,1: throw new TypeError("SiteManager not properly initialized - missing initialize method");
894,1: throw new TypeError("MonitorManager not properly initialized - missing startMonitoring method");

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\shared\utils\cacheKeys.ts
321,1: throw new Error(`Invalid cache key format: ${key}`);
335,1: throw new Error(`Invalid cache key format: ${key}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\shared\validation\schemas.ts
470,1: throw new Error(`Unknown field: ${fieldName}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\sites\utils\fileDownload.ts
93,1: throw new TypeError("Invalid backup data received");
123,1: throw new Error(
196,1: throw new Error("File download failed");
211,1: throw new Error("File download failed");
249,1: throw new Error("File download failed");

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\sites\utils\monitorOperations.ts
131,1: throw new Error(ERROR_CATALOG.monitors.NOT_FOUND);
163,1: throw new Error(ERROR_CATALOG.sites.NOT_FOUND);
168,1: throw new Error(ERROR_CATALOG.monitors.NOT_FOUND);
207,1: throw new Error(`Invalid monitor status: ${String(status)}`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\sites\useSiteOperations.ts
65,1: throw new Error(ERROR_CATALOG.sites.NOT_FOUND);
235,1: throw new Error(ERROR_CATALOG.sites.NOT_FOUND);
240,1: throw new Error(ERROR_CATALOG.monitors.CANNOT_REMOVE_LAST);
277,1: throw new Error(ERROR_CATALOG.sites.NOT_FOUND);
305,1: throw new Error(ERROR_CATALOG.sites.NOT_FOUND);
333,1: throw new Error(ERROR_CATALOG.sites.NOT_FOUND);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\stores\utils.ts
192,1: throw new Error(

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\types\ipc.ts
41,1: throw new Error("Invalid IPC response format");
45,1: throw new Error(response.error ?? "Operation failed");

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\utils\errorHandling.ts
47,1: throw new Error(`${operationName} failed and no fallback value provided`);

C:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher\src\main.tsx
38,1: throw new Error("Root element not found");
