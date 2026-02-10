<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


[[748d654](https://github.com/Nick2bad4u/Uptime-Watcher/commit/748d65478619de60127944145e33c18d943a3dc8)...
[d77227b](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d77227b76ec8024b0e90611643d644a41753fa7a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/748d65478619de60127944145e33c18d943a3dc8...d77227b76ec8024b0e90611643d644a41753fa7a))


### ✨ Features

- ✨ [feat] Adds PWA support and UI refactors

✨ [feat] Adds an installable docs experience with offline support and manifest assets
🚜 [refactor] Refactors shell logic into reusable hooks/components to reduce complexity and keep loading, sidebar, and update UI behavior consistent
 - 🚜 [refactor] Extracts delayed loading and compact sidebar dismissal into shared hooks
🚜 [refactor] Centralizes add-site defaults, normalization, and validation to prevent drift between UI state and submission
🛠️ [fix] Improves URL and IPC validation plus status update subscription handling to harden trust boundaries and avoid stale callbacks
🚜 [refactor] Consolidates shared utilities for byte-size formatting, volume normalization, sqlite restore checks, and cloud notifications

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(538f58a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/538f58a4de1747c57f9ac14c5c75f8dbeb5e19ff)


- ✨ [feat] Adds lint drift guards and mock helpers

✨ [feat] Adds drift-guard lint rules to prevent duplicate contracts and helper redefinitions across layers 🧭
🔧 [build] Aligns lint configuration with the new plugin guards and reduces conflicting style/test rules 🧹
🚜 [refactor] Moves constructible mock utilities into shared helpers and adds constructible return-value helpers to avoid non-constructible mocks 🧰
🧪 [test] Updates constructor-based mocks to use constructible helpers for instantiation safety ✅
📝 [docs] Refreshes lint and testing guidance to reflect the new guardrails 📚

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5c66818)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5c66818d27169a8fbb74ce9585ee797b3eb19413)


- ✨ [feat] Enhances sync security and data integrity

🛠️ [fix] Prevents sensitive token leakage by stripping raw error objects from cloud synchronization logs
 - Extracts only non-sensitive metadata such as error codes and operation types to avoid logging private Authorization headers or request bodies
🛠️ [fix] Sanitizes JSON data transfers by stripping internal cloud settings and secrets during import and export operations
 - Ensures that machine-specific state and encrypted OAuth credentials are not leaked or transferred between different device environments
🛠️ [fix] Implements a reference-counted subscription mechanism for state synchronization events to resolve race conditions
 - Guarantees reliable resource cleanup and prevents memory leaks when components unmount before sync initialization completes
🛠️ [fix] Strengthens database restoration safety by enforcing SQLite header validation and integrity assertions
 - Verifies the file structure before writing to the local filesystem and performs a `quick_check` before swapping the active database file
🛠️ [fix] Adds a 5-second timeout to identity provider metadata requests to prevent indefinite network hangs during account label fetching
✨ [feat] Enforces IPC payload budgets for JSON exports to maintain system stability when handling large site datasets
🛠️ [fix] Updates monitor import logic to utilize a fail-fast approach that aborts the entire transaction on any site-specific failure
⚡ [perf] Optimizes theme hook performance by utilizing shallow state selection to prevent redundant re-renders from unrelated setting changes
🧪 [test] Expands the test suite to verify token leak prevention, idempotent subscriptions, and robust backup validation routines

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4016128)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4016128e787b19b9e08b5cf33e36bd0047ea41be)


- ✨ [feat] Enhance monitoring utilities with AbortSignal support
 - 🔧 [build] Introduce AbortSignal parameter in performSinglePingCheck and performPingCheckWithRetry functions to allow cancellation of ping checks.
 - 🔧 [build] Update checkHttpConnectivity and checkConnectivity functions to accept AbortSignal for better control over network requests.
 - 🔧 [build] Implement raceWithAbort utility to handle operation cancellation effectively.
 - 🛠️ [fix] Modify handlePingCheckError and handlePortCheckError to return standardized responses for aborted operations.
 - 🧪 [test] Add comprehensive tests for AbortSignal handling in ping and port monitoring utilities, ensuring correct behavior on cancellation.
 - 🧪 [test] Enhance existing tests to validate the integration of AbortSignal in various scenarios, including connectivity checks and error handling.
 - 📝 [docs] Update documentation to reflect changes in function signatures and usage of AbortSignal.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3fa6dbc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3fa6dbc50851d0cafbfb643433bb00b7e4a34e5b)


- ✨ [feat] Enhance cloud backup and token management functionality
 - 🔧 [feat] Implement best-effort cleanup for orphaned metadata in `uploadBackupWithMetadata`
 - 🔧 [feat] Add `deleteObject` method to `BaseCloudStorageProvider` for improved object management
 - 🔧 [feat] Introduce `handleChildProcessGone` and `handleBrowserWindowCreated` for better process monitoring in Electron
 - 🔧 [feat] Deduplicate concurrent token refresh requests in `DropboxTokenManager` and `GoogleDriveTokenManager`
 - 🔧 [feat] Add logging for orphaned metadata sidecars in `listBackupsFromMetadataObjects`
 - 🔧 [feat] Implement `syncFileSafely` and `syncDirectorySafely` methods in `DataBackupService` to ensure data integrity during file operations
 - 🔧 [feat] Enhance error handling in `getUserFacingErrorDetail` to redact sensitive information
 - 🧪 [test] Add tests for `uploadBackupWithMetadata` to verify deletion of backups on metadata upload failure
 - 🧪 [test] Create tests for `listBackupsFromMetadataObjects` to ensure orphaned metadata is skipped
 - 🧪 [test] Add tests for deduplication of concurrent refreshes in `DropboxTokenManager` and `GoogleDriveTokenManager`
 - 🧪 [test] Update tests for `DataBackupService` to cover new sync methods
 - 🎨 [style] Refactor `useOverflowMarquee` hook for improved readability and performance

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9cf2e5b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9cf2e5bed6dab0495f6c6bc9dedbccd7c2626224)


- ✨ [feat] Enhance backup and restore functionality
 - 🆕 Introduced constants for maximum sizes of SQLite backup buffers and restore payloads over IPC.
 - 🆕 Added constants for JSON import payload sizes to improve data handling during imports.

🔧 [refactor] Update MonitorRow interface
 - 🔄 Extended MonitorRow to include UnknownRecord for better type safety.
 - 🗑️ Removed the optional id property to streamline the interface.

🛠️ [fix] Improve error handling in MonitoringService
 - 🔄 Replaced generic Error throws with ApplicationError for better error context.
 - 📝 Added detailed error messages and codes for backend operation failures.

🧪 [test] Update tests for MonitoringService edge cases
 - ✅ Adjusted tests to expect ApplicationError structure in rejection cases.
 - 🔄 Ensured error messages reflect the new error handling strategy.

✨ [feat] Add applySiteSnapshot method to site state management
 - 🆕 Implemented applySiteSnapshot in BaseSiteState to allow authoritative site state updates.
 - 🔄 Updated useSitesState to include applySiteSnapshot for local state mutations.

🧹 [chore] Update mock setups for testing
 - 🔄 Refined mock implementations to include new methods and ensure compatibility with updated interfaces.
 - 🧪 Enhanced test coverage for new features and error handling improvements.

🎨 [style] Change image format for mascot logo
 - 🔄 Updated mascot logo import from PNG to AVIF for better performance and quality.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(250bc5c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/250bc5cd0e044d3958ca49ceefa5793cec1c9339)


- ✨ [feat] Implement path-based backups and harden process resilience

✨ [feat] Introduce path-based SQLite backup saving to prevent memory spikes when handling large databases
 - 💾 Implement a direct-to-disk backup flow utilizing `VACUUM INTO` for consistent snapshots
 - 🔄 Add fallback logic to temporarily close the primary connection if snapshotting hits `SQLITE_BUSY` locks
 - 🛡️ Ensure data integrity via atomic file replacement with a `.bak` recovery fallback during target writes
 - 📏 Enforce a 10MB limit on IPC database transfers, directing larger files to the native save dialog flow

🛠️ [fix] Improve main process stability and crash resilience with dedicated shutdown orchestration
 - 🛑 Register global handlers for `uncaughtException` and `unhandledRejection` to ensure safe app termination
 - 📉 Monitor `render-process-gone` events to better diagnose renderer-level crashes or GPU resets
 - ⏱️ Implement an asynchronous fatal shutdown sequence with a 5-second timeout to prevent zombie processes

🏗️ [refactor] Enhance database transaction isolation and error handling heuristics
 - 🖇️ Support nested transaction boundaries by utilizing `SAVEPOINT` and `RELEASE` operations
 - 🔍 Centralize SQLite lock detection logic into a shared utility for consistent service-level retries
 - 🧼 Harden http monitor cleanup by safely handling stream-like response data properties

📡 [feat] Optimize IPC state synchronization and data payload normalization
 - 🔢 Preserve accurate site counts when processing truncated bulk-sync events from the orchestrator
 - 🧹 Normalize state-sync payloads into lightweight structures to minimize IPC serialization overhead
 - 🔒 Block `<webview>` tag attachment in the window service as a defense-in-depth security measure

🧪 [test] Expand comprehensive test coverage for backup validation and cloud metadata
 - 🏗️ Move `createSingleFlight` to shared utilities for deduplicating concurrent async work across layers
 - 📂 Sanitize file path segments in cloud metadata to prevent leaking local system structures
 - 🧪 Add regression tests for siteCount preservation and IPC buffer transfer size validation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e501db4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e501db4f9145b51285caac11671d3fad7e199180)


- ✨ [feat] Enhance state synchronization and event handling
 - 🔧 Update `StateSyncEventData` to include `revision` and `siteCount` for better tracking of sync events.
 - 🛠️ Refactor event handling in `StateSyncService` to manage `truncated` events and implement recovery logic.
 - ⚡ Improve `calculateSiteSyncDelta` to streamline delta calculations by removing unnecessary previous site snapshots.
 - 🚜 Refactor `applySnapshotEvent` and `applyDeltaEvent` to handle new event structures and ensure proper state updates.
 - 🧪 Add comprehensive tests for new event structures and recovery scenarios in `StateSyncService` and `useSiteSync`.
 - 🎨 Update test cases to reflect changes in event data structure and ensure coverage for new features.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(66a81e0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66a81e0897ebb20d2de3acc2d650116b21806fcf)


- ✨ [feat] Implement JSON byte budgeting for state sync events
 - Introduced `isJsonByteBudgetExceeded` utility to check payload size against a defined budget.
 - Added a size check in `sendStateSyncEvent` method of `RendererEventBridge` to drop oversized events.
 - Logged a warning when state sync events are dropped due to exceeding the size budget.

🛠️ [fix] Improve IPC handler parameter validation
 - Updated `assertChannelParams` to enforce exact parameter count for handlers.
 - Enhanced error handling for unexpected parameters in IPC handlers, ensuring proper logging and response creation.

🚜 [refactor] Enhance CSP header handling in WindowService
 - Modified `onHeadersReceived` to apply CSP headers only to document resources, preventing unnecessary mutations for other resource types.

🧪 [test] Add comprehensive tests for new features and fixes
 - Created tests for JSON byte budgeting in `RendererEventBridge` to ensure oversized payloads are correctly handled.
 - Added tests for IPC handler parameter validation to confirm correct behavior with missing and extra parameters.
 - Implemented tests for CSP header handling in `WindowService` to verify correct application based on resource type.

✨ [feat] Introduce cloud object key normalization utilities
 - Added `normalizeCloudObjectKey` and `assertCloudObjectKey` functions to enforce key formatting and validation.
 - Implemented tests to cover various normalization scenarios, including path traversal prevention and byte length enforcement.

🧹 [chore] Update URL safety utilities
 - Introduced `tryGetSafeThirdPartyHttpUrl` to sanitize URLs for third-party requests, ensuring they meet strict safety criteria.
 - Updated `ScreenshotThumbnail` component to utilize new URL safety checks, improving security when handling screenshot URLs.

📝 [docs] Improve code documentation and comments
 - Enhanced comments throughout the codebase for clarity on new features and changes, particularly in utility functions and event handling.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(56cd5a8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/56cd5a89c4fc5cda60b86282cb055003c7184246)


- ✨ [feat] Implement single-flight utility for IPC handlers
 - 🛠️ [fix] Add createSingleFlight function to mitigate concurrent IPC calls
 - 🔧 [build] Refactor registerCloudHandlers to utilize single-flight for sync and backup operations
 - 🔧 [build] Refactor registerDataHandlers to utilize single-flight for data export and download operations
 - 🎨 [style] Improve logging safety by using redacted URLs in urlSafety utility

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f1ee12f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f1ee12fed76fbaa5190470b4ba405a8135087a97)


- ✨ [feat] Implement update status subscription in updates store
 - 🛠️ Added `subscribeToUpdateStatusEvents` method to `UpdatesStore` interface for subscribing to backend update status events.
 - 🛠️ Implemented the subscription logic in `useUpdatesStore`, handling event cleanup and error logging.
 - ⚡ Enhanced the persistence configuration for the updates store to include `updateInfo` and `updateStatus`.
 - 🧪 Updated tests to mock the new subscription method and ensure coverage for the updates store functionality.

🧪 [test] Add comprehensive tests for updates store and related utilities
 - 🧪 Added tests for the new `subscribeToUpdateStatusEvents` method in various test files to ensure proper functionality.
 - 🧪 Enhanced existing tests to check for error handling and subscription cleanup.
 - 🧪 Introduced new tests for cache utilities to validate deduplication of concurrent fetches and cache invalidation behavior.

🛠️ [fix] Improve error handling in settings and system services
 - 🛠️ Updated error handling in `SettingsService` and `SystemService` to throw descriptive errors instead of returning raw values.
 - 🛠️ Ensured that null and undefined errors are properly handled and logged.

⚡ [perf] Optimize cache utilities for concurrent fetches
 - ⚡ Implemented a mechanism to deduplicate concurrent fetches for the same cache key, improving performance and reducing unnecessary network requests.
 - ⚡ Added cache generation tracking to prevent overwriting newer values set during fetch operations.

🎨 [style] Refactor media query utilities for better compatibility
 - 🎨 Updated `subscribeToMediaQueryListChanges` to support legacy implementations of `addListener` and `removeListener` for broader browser compatibility.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(462c8df)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/462c8df71dbab886bf5ffcee66552033087f4138)


- ✨ [feat] Enhance Data Backup and Restore Functionality
 - 🛠️ Validate incoming SQLite database files during restore to ensure integrity.
 - 🔧 Improve error handling during database initialization after restore operations.
 - 🧹 Refactor temporary directory management to ensure safe cleanup.

✨ [feat] Improve Operational Hooks and Retry Logic
 - ⚡ Replace manual timeout handling with a reusable sleep utility for better readability and performance.
 - 🛠️ Update retry logic to ensure consistent error handling across retries.

✨ [feat] Update Events Bridge Documentation
 - 📝 Clarify event subscription descriptions in the EventsDomainBridge interface for better understanding.

✨ [feat] Introduce UTF Byte Length Utility
 - 🎨 Create a new utility to calculate UTF-8 byte lengths for strings, ensuring consistent handling of string sizes across the application.

✨ [feat] Implement Filesystem Base Directory Validation
 - 🛠️ Add validation logic for filesystem base directories to ensure they meet specific criteria, enhancing security and reliability.

✨ [feat] Refactor Theme Management
 - ⚡ Centralize dark mode preference handling with a new utility for improved consistency and maintainability.
 - 🧹 Clean up theme manager to utilize the new system theme utilities.

🧪 [test] Update Tests for IPC Service Helpers
 - 🧪 Ensure tests reflect shared initialization promise behavior for IPC service helpers, improving test reliability.

🧪 [test] Enhance Coverage for Settings and Events Services
 - 🧪 Update tests to verify that concurrent calls share a single in-flight initialization, ensuring efficient resource usage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2d79d67)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2d79d67406adba2aaa421a9ac10a87b0457531d9)


- ✨ [feat] Enhance site management and error handling

 - 🔧 [build] Refactor AddSiteForm to use selectors for error handling
   - Improved performance by subscribing only to necessary fields from the error store.
   - Added selectors for error management: `selectClearError`, `selectErrorIsLoading`, and `selectLastError`.

 - 🔧 [build] Update SiteCard to use useMemo for last check timestamp
   - Optimized rendering by memoizing the calculation of the last check timestamp.

 - 🔧 [build] Refactor AppSidebar for improved site filtering
   - Introduced `useDeferredValue` for smoother search experience.
   - Memoized the sites map for efficient lookups and filtering.

 - 🔧 [build] Enhance ScreenshotThumbnail to utilize selectors
   - Updated to use `selectOpenExternal` for better state management.

 - 🔧 [build] Optimize HistoryTab for performance
   - Memoized the filtered history records and added an index map for efficient access.

 - 🔧 [build] Introduce new utility function scrollToSiteCard
   - Added a utility to scroll to specific site cards in the UI, improving navigation.

 - 🧪 [test] Update tests to reflect changes in error handling and site management
   - Adjusted mocks for `useErrorStore` and `useSitesStore` to support selector-based usage.
   - Added comprehensive tests for the new `scrollToSiteCard` utility.

 - 🧪 [test] Enhance coverage for AddSiteForm and ScreenshotThumbnail
   - Improved test cases to cover new error handling logic and UI interactions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8c41c43)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8c41c439ed99a42defa6db5f14542cdcbd7a66d6)


- ✨ [feat] Enhance SystemService with clipboard functionality
 - 🆕 Added `writeClipboardText` method to `SystemService` for writing text to the OS clipboard.
 - 🔒 Implemented URL safety check in `openExternal` to block disallowed URLs.
 - 📜 Updated `SystemServiceContract` to include the new method.

🧪 [test] Add tests for clipboard functionality in SystemService
 - ✅ Created comprehensive tests for `writeClipboardText` to ensure proper functionality.
 - 🔍 Mocked `writeClipboardText` in `SyncMaintenancePanel` tests to validate clipboard interactions.

🎨 [style] Improve test readability and structure
 - ✏️ Refactored test cases in `CloudProviderSetupPanel`, `StatusAlertToast`, and `PromptDialog` for clarity.
 - 🧹 Cleaned up unnecessary async/await patterns in tests for better performance.

📝 [docs] Update documentation for new features
 - 📖 Documented the purpose and usage of the new `writeClipboardText` method in the codebase.

⚡ [perf] Optimize regex patterns for better performance
 - 🔄 Changed regex patterns in `environment.ts`, `icons.ts`, and `electron-api-mock.ts` to use the `u` flag for Unicode support.

🚜 [refactor] General code cleanup and organization
 - 🧹 Removed redundant code and improved overall structure in various components and services.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a405257)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a4052575c04396c803c33e9f6c3fed388bb4b920)


- ✨ [feat] Enhance URL validation and sidebar layout context
 - 🛠️ [fix] Update `isValidUrl` to accept camelCase options for disallowing authentication in URLs
 - 🔧 [build] Introduce `SidebarLayoutContext` for managing sidebar visibility state across components
 - 🛠️ [fix] Refactor `RemoteBackupsPanel` to use button `value` instead of `data-backup-key` for better accessibility
 - 🛠️ [fix] Improve `ScreenshotThumbnail` to validate URLs and ensure they are safe for screenshots
 - 🛠️ [fix] Update `SiteDetailsHeader` to validate monitor URLs with disallowed authentication
 - 🛠️ [fix] Modify `Tooltip` to use passive event listeners for scroll events
 - 🛠️ [fix] Enhance `SystemService` to log safe URLs without authentication details
 - 🧪 [test] Add comprehensive tests for URL validation and sidebar context functionality
 - 🧪 [test] Update tests to ensure proper handling of URLs with authentication
 - 🎨 [style] Improve code readability and maintainability across various components

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c64add9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c64add9198dd3151349d78eccf85d83fa4bb89ea)


- ✨ [feat] Integrate Google Drive as a cloud provider
 - Added support for Google Drive integration, including OAuth and PKCE handling in the Electron main process.
 - Updated `package.json` to include `googleapis` dependency for Google Drive functionality.
 - Enhanced cloud types to include Google Drive provider in `cloud.ts`, `ipc.ts`, and `preload.ts`.
 - Modified `CloudSettingsSection` to manage Google Drive connection state and selectors.
 - Updated `CloudProviderSetupPanel` to include Google Drive as a selectable provider with connection handling.
 - Implemented connection logic for Google Drive in `CloudService` and `useCloudStore`.
 - Created comprehensive tests for Google Drive connection and integration in `CloudProviderSetupPanel` and `useCloudStore`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4e36aa9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e36aa9fb145e2ffbbe3a51993b22a905b1bf82d)


- ✨ [feat] Implement Cloud Sync & Backup Settings Section
 - Introduced `CloudSection` component to manage cloud sync and backup settings.
 - Added functionality to display connection status, last sync, and backup timestamps.
 - Implemented encryption status and actions for managing encryption settings.
 - Integrated `RemoteBackupsPanel` for listing and managing remote backups.
 - Included `BackupMigrationPanel` for migrating backups between formats.
 - Added `SyncMaintenancePanel` for resetting sync state and managing sync settings.
 - Enhanced user feedback with error alerts and configuration hints.

✨ [feat] Create Remote Backups Panel
 - Developed `RemoteBackupsPanel` to display and manage remote backups.
 - Implemented functionality for restoring and deleting backups with appropriate UI feedback.
 - Added buttons for refreshing the backup list and uploading the latest backup.

✨ [feat] Add App Notification Service
 - Created `AppNotificationService` for dispatching system notifications.
 - Ensured notifications are user-initiated and provide immediate feedback.

🛠️ [fix] Enhance Cloud Service with Dropbox Integration
 - Updated `CloudService` documentation to reflect the addition of Dropbox provider support.
 - Ensured OAuth 2.0 integration for secure Dropbox connections.

⚡ [perf] Improve Cloud Store with Notification Handling
 - Integrated `AppNotificationService` into `useCloudStore` for better user feedback during cloud operations.
 - Added toast notifications for various cloud operations, including connecting to Dropbox, syncing, and backup migrations.

🧪 [test] Expand Cloud Store Tests
 - Added comprehensive tests for cloud store operations, including success and error scenarios for Dropbox connections and backup management.
 - Verified toast notifications are correctly triggered for cloud operations.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(748d654)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/748d65478619de60127944145e33c18d943a3dc8)



### 🛠️ Bug Fixes

- 🛠️ [fix] Improves cancellation safety

🛠️ [fix] Improves cancellation handling across monitoring and retries
 - Standardizes abort errors and propagates cancelled state in results and logs
 - Prevents timeout timers and queued waits from keeping the app alive
🛠️ [fix] Guards configuration writes and sync resets
 - Rolls back provider settings when persistence fails
 - Deletes only validated sync keys during resets
🛠️ [fix] Ensures legacy schemas upgrade before version bumps
🚜 [refactor] Hardens IPC invoke parameter validation
 - Enforces runtime parameter counts per channel
🚜 [refactor] Redacts auth secrets in log messages and metadata
🧪 [test] Expands coverage for cancellation, logging, IPC, and migrations

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(df5cf3f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/df5cf3f08a1ab7b4a2df7110b354885886e27b22)


- 🛠️ [fix] Adds IPC timeouts and sync actions

🛠️ [fix] Adds configurable IPC invoke timeouts to avoid hangs and surface clearer failures
 - Applies timeouts to handler verification and long-running operations
🚜 [refactor] Standardizes state sync actions and sources with shared constants and guards for safer validation
🔧 [build] Adds static guard checks to centralize external navigation and window-open handling while verifying invoke coverage
🎨 [style] Avoids showing non-positive response times in the dashboard
🧪 [test] Adds timeout coverage and constructable mock helpers for IPC and networking tests
🧹 [chore] Aligns editor launch/task formatting and TypeScript problem matchers

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4eaaa22)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4eaaa22c1ba9d625c546e28e65e08cb0a844ee75)


- 🛠️ [fix] Improves shutdown and DNS checks ⚡

🛠️ [fix] Adds runtime cleanup checks 🧹 so shutdown only calls valid handlers
 - Avoids failures when mocked services return non-instances 🧪
🛠️ [fix] Reworks DNS resolution to race timeout/abort 🕒 without leaked listeners
 - Returns explicit timeout/abort errors for clearer monitoring results 📡
🛠️ [fix] Ensures state sync emits for bulk/update actions 🔄 to keep revision streams monotonic
 - Keeps delete emissions gated on meaningful deltas 🧭
🚜 [refactor] Standardizes iterable copies and validator options 🧰 for clarity
 - Prefers spread for iterables and aligns option keys ✨
🧹 [chore] Updates linting, config, and docs styling 🎛️ for consistency
 - Enables stylistic rules and disables webpack-only chunk naming 🧩
 - Adds iterable DOM libs and normalizes CSS module access 📚
 - Expands documentation spacing for clearer examples 📝
🧪 [test] Aligns mocks and fixtures with constructable services 🧰
 - Switches test data to spread-based copies to mirror runtime paths 🔁

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(341bc67)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/341bc677466b43426f1c94fb0e39d7a756859435)


- 🛠️ [fix] Improve error safety and scheduling

🛠️ [fix] Adds catch normalization guardrail and uses safe errors to prevent unsafe property access.
🚜 [refactor] Queues manual checks after running jobs and hardens connectivity option defaults for reliable runs.
🧹 [chore] Updates lint/style tooling and dependency versions to keep formatting consistent.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ae2de8e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ae2de8ec549291007858cc0b9580e1812b575f3b)


- 🛠️ [fix] Improve cloud sync resilience

🛠️ [fix] Improves provider switching by preserving prior config on failed OAuth verification and clearing stale secrets only after success
🛠️ [fix] Adds strict base64 and UTF-8 decoding plus canonical key filtering to surface corruption and reject unsafe keys
🛠️ [fix] Hardens sync transport with snapshot nonces, size/UTF-8 errors, deterministic listing, and non-overwriting snapshots
🛠️ [fix] Validates manifest device IDs with shared rules, caps device lists, and avoids prototype pollution in settings handling
🛠️ [fix] Recomputes backup schema metadata from database files to block forged payloads
🧪 [test] Adds coverage for provider rollback, encoding validation, sync limits, and manifest sanitization

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7c27520)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7c275208b204cdef57b0c32bcc83da8dcc2f430d)


- 🛠️ [fix] Updates logging flags and CSS imports

🛠️ [fix] Expands logging flag parsing with production and info aliases for clearer runtime control
🛠️ [fix] Uses explicit package paths for CSS imports to stabilize build resolution
🎨 [style] Normalizes dynamic import formatting and validator option key quoting to satisfy linting
🔧 [build] Adjusts dependency graph scripts to avoid spinners and ignore CSS
🧪 [test] Targets the specific recovered toast on dismissal to reduce flakiness

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(656a83e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/656a83e2eb8a6b31a22e513500a46d116b20886f)


- 🛠️ [fix] Improves UI state tracking

🛠️ [fix] Improves metric logging and observer refresh to avoid stale UI state
📝 [docs] Updates documentation examples and remark formatting for consistency
🎨 [style] Aligns minor formatting in runtime modules for readability
🧪 [test] Adds coverage for stores and validation plus test cleanup

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(60cb588)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/60cb588b7ad0d0715517d7ab4ce0e00427fadb38)


- 🛠️ [fix] Improves validation and scheduling

🛠️ [fix] Adds runtime validation for monitoring lifecycle summaries to block malformed IPC payloads.
🛠️ [fix] Guards sync and update schedulers against duplicate runs and captures callback failures.
🛠️ [fix] Hardens OAuth loopback flow with state checks, buffered callbacks, and clearer retry messaging.
🛠️ [fix] Normalizes numeric inputs for pruning, retries, and cooldowns to avoid invalid limits.
🛠️ [fix] Adds manual check timeouts and abort-aware logging for monitor executions.
🚜 [refactor] Allows null field updates, handles async cleanup rejections, and broadens bridge readiness checks.
🛠️ [fix] Coalesces site resync requests and avoids caching types before load.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(51e2eb8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/51e2eb8eec31dfaecb7b02fee68148fe8742d470)


- 🛠️ [fix] Enhance UI interaction and build tooling

🛠️ [fix] Optimize notification toaster interaction
 - 🖱️ Set pointer-events to none on the alert container to allow interaction with UI elements behind the notification area
🎨 [style] Address linting in validation logic
 - 🛡️ Add suppression for intentional unsafe type assertions to maintain stable IPC typing
🔧 [build] Refactor Flatpak manifest and re-enable YAML linting
 - 📦 Restructure flatpak-build.yml for better readability and add extension points for custom themes
 - 🧹 Clean up build environment variables and module definitions
 - ✅ Restore yml/sort-keys linting rule following upstream plugin fix for Node 25
🧪 [test] Stabilize Storybook and Vitest environments
 - 🪵 Introduce an electron-log/renderer stub to prevent noisy initialization warnings in non-Electron contexts
 - 🔇 Silence MSW unhandled request logs to reduce console clutter
 - ⚙️ Refine Node.js warning suppression logic to handle various argument signatures during tests
 - 🗺️ Configure Vitest aliases to route log imports to the new mocks

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a13074c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a13074ca226a347e265675fda6eee31491d5a031)


- 🛠️ [fix] Enhance IPC safety and testing stability

🛠️ [fix] Harden the Electron IPC bridge with runtime function validation
 - 🛡️ Prevents memory leaks and log spam by rejecting invalid event callbacks
 - 📝 Adds diagnostic logging for rejected listener registrations in the preload context
🛠️ [fix] Align site monitoring store with the validation schemas
 - 🔄 Corrects field mapping from `error` to `details` during optimistic updates and snapshot applications
🎨 [style] Restore user interaction for status alert toasters by enabling pointer events
🧪 [test] Overhaul Vitest configuration for Storybook story testing
 - 🪟 Introduces a custom Vite transform to fix Windows path globbing issues
 - 🏎️ Optimizes performance by switching to Node/jsdom and increasing memory limits for test runs
 - 🤫 Suppresses irrelevant experimental Node storage warnings to keep output clean
🧪 [test] Improve E2E test stability and locator reliability
 - 🚦 Adjusts Playwright worker counts to prevent flakiness when launching multiple Electron instances
 - 🎯 Updates locators for modals, tabs, and alerts to use more robust selection strategies
🧹 [chore] Disable crashing ESLint YAML sorting rules on Windows and Node 25
📦 [deps] [dependency] Update project dependencies including Typedoc, ESLint plugins, and Prettier utilities
🔧 [build] Standardize Webpack chunk names for cloud providers and update VS Code tasks

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c3e3001)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c3e3001d7f02b7f199a7c024ff9783dd48c10b01)


- 🛠️ [fix] Harden data integrity, backoff logic, and logging safety

🛠️ [fix] Improve database restore reliability by introducing mandatory SQLite structural integrity checks before swapping files
 - 🛡️ Implement renderer-side IPC budget enforcement for backup and import payloads to prevent memory exhaustion and "IPC failed" confusion
 - 🔒 Wrap database event emissions in protective try-catch blocks to ensure that notification failures do not interrupt critical data operations
🛠️ [fix] Enhance service resilience by increasing maximum exponential backoff delay to 60 minutes, mitigating provider rate-limiting and local contention
 - ⏱️ Update scheduler logic to ensure backoff caps never reduce the user-configured base monitoring interval
 - 💤 Call `unref()` on monitoring timers to prevent scheduled checks from blocking graceful application shutdown
🛠️ [fix] Secure monitoring logs by redacting sensitive URL components including credentials, query parameters, and fragments
 - 📁 Update Dropbox provider to gracefully ignore folder and deleted entries during recursive file listings
✨ [feat] Upgrade Settings UI to utilize the shared `Modal` component, adding 지원 for decorative backgrounds and detailed subtitles
 - 🎹 Implement ARIA-compliant keyboard navigation (arrow keys, Home, End) for Site Details tabs to improve accessibility
 - 🔍 Expand cloud sync maintenance tools with a new diagnostic JSON export and a live preview of the generated diagnostic text
🚜 [refactor] Simplify IPC bridge type definitions to reduce mapped-type complexity and improve IDE performance/tooling accuracy
🎨 [style] Modernize Settings styling using nested CSS rules for better maintainability and encapsulation
🧹 [chore] Migrate YAML linting to ESLint for improved performance and consistency across the configuration stack
🧪 [test] Add comprehensive unit and regression tests for scheduler backoff, URL redaction, database integrity, and IPC payload budgeting

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a1b90c2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a1b90c2b69d6099e4ed7372cdda280480c6cf8ad)


- 🛠️ [fix] Improve type safety in chart components and themed components
 - 🔧 Update mock components in tests to use specific prop types for better type safety
 - 🧪 Refactor tests for `ChartComponents` to use `ChartJsMockComponentProperties` instead of `any`
 - 🧪 Refactor tests for `AnalyticsTab`, `HistoryTab`, and `OverviewTab` to use `PropsWithChildren` and specific HTML attributes
 - 🧪 Update `ThemedButton`, `ThemedCard`, `ThemedSelect`, and other themed components to use more specific prop types
 - 🔧 Improve type definitions in `ThemeManager`, `ThemedBox`, and `ThemedSelect` to use `UnknownRecord` for better type handling
 - 🔧 Refactor utility functions in `chartUtils` to ensure type safety with `UnknownRecord`
 - 🔧 Update `FormErrorAlert` and `SaveButton` tests to use specific prop types for better clarity and type safety

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d6f680e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6f680eef756e3dbb7d1750e171aa9cb7d80bc87)


- 🛠️ [fix] Refactor Electron API mocking across test files

 - 🔧 Update the electron API mocking strategy to use a centralized `installElectronApiMock` utility for better consistency and maintainability.
 - 🧪 Enhance test setup by ensuring `window` exists when needed, preventing potential issues in non-DOM environments.
 - 🧹 Remove redundant global `electronAPI` definitions from individual test files, streamlining the mocking process.
 - 📝 Update tests to properly restore the mocked API after each test, ensuring isolation and preventing state leakage between tests.
 - ⚡ Improve performance by reducing the complexity of the mock setup, allowing for easier adjustments and clearer test intentions.
 - 🎨 Clean up test files by removing outdated comments and unused code related to the previous mocking strategy.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0943d4f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0943d4f8129e1e059dd1d8a284c16d1cccda0040)


- 🛠️ [fix] Refactor useSiteMonitor tests to improve mock store handling
 - 🔧 Update the mock implementation of `useSitesStore` to use `createSelectorHookMock` and `createSitesStoreMock` for better state management.
 - 🔄 Replace direct mock return values with `setState` calls to ensure consistent state across tests.
 - 🧪 Adjust tests to handle undefined monitor IDs instead of null for better clarity and accuracy.

🎨 [style] Enhance button and form styles for accessibility
 - 🎨 Add media queries to disable transitions for users with reduced motion preferences in button styles.
 - 🎨 Update hover and focus styles to improve accessibility and user experience in form controls.
 - 🎨 Remove deprecated hover styles and replace them with `:is()` pseudo-class for better specificity and clarity.

🧪 [test] Update critical coverage tests for useSiteDetails
 - 🔧 Change mock return values in critical tests to use `undefined` instead of `null` for selected monitor IDs.
 - 🔄 Introduce a helper function `applySitesStoreMockState` to streamline mock store setup across tests.
 - 🧪 Ensure all tests are consistent with the new mock store structure and improve overall test reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8957ce7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8957ce7636a38b38304e1f7ff7493c545b607acb)


- 🛠️ [fix] Centralize and standardize user-facing error handling

🛠️ [fix] Standardize error message extraction and reporting logic
- 🛡️ Centralize error detail extraction into a shared utility to ensure consistent messaging across both Electron and Renderer processes
- 🔒 Prevent implementation detail leakage by using a stable error catalog for unknown or system-level errors
- 🧬 Replace manual error-to-string conversions with a robust helper that handles `Error` instances, plain objects, and primitives
- 🧪 Update IPC handlers and service managers to use sanitized error details for logging and user notifications

🚜 [refactor] Consolidate validation schemas and shared utilities
- 🏗️ Introduce a reusable string schema factory to standardize non-whitespace validation across site and monitor fields
- 📂 Relocate cloud backup metadata key generation to the appropriate provider module for better logic encapsulation
- 🏷️ Rename internal error handling functions to more accurately reflect their purpose in operation failure reporting

🧹 [chore] Clean up project structure and environment
- 🙈 Add the `reports/` directory to `.gitignore` to prevent test artifacts from being tracked
- 🧼 Remove redundant utility imports and consolidate shared types

🧪 [test] Modernize and streamline the test suite
- 🏗️ Refactor service tests to use hoisted mocking patterns, improving isolation and execution speed
- 📉 Consolidate fragmented test files for the entry point and site forms into single, comprehensive suites
- 🧹 Remove deprecated "comprehensive" test variants in favor of deterministic, mock-based validation
- 🔄 Improve test readability by switching to more descriptive test names and standardizing setup/teardown logicsure

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(dea7a29)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dea7a295d56de1b0cd526d3a148c602c9b6f7f3e)


- 🛠️ [fix] Improve error logging and handling across various services
 - 🔧 Update error logging in middleware to include serialized data for better debugging.
 - 🛠️ Refactor ServiceContainer tests to remove unnecessary database manager initialization checks.
 - 🛠️ Adjust ApplicationService tests to log errors without wrapping them in an object.
 - 🛠️ Enhance historyMapper tests to ensure error logging captures the error object directly.
 - 🛠️ Modify pingErrorHandling tests to log errors and context directly instead of wrapping them.
 - 🛠️ Update WindowService tests to simplify error logging for security header middleware failures.
 - 🔧 Refactor environment utility to log errors more concisely.
 - 🛠️ Adjust validation utility to improve numeric validation logic and error handling.

🎨 [style] Refactor ESLint configuration for better organization and clarity
 - 🎨 Add guardrails for Electron IPC handlers to enforce validation.
 - 🎨 Introduce AI Agent guardrails for production and test environments to ensure code quality.

🧪 [test] Enhance test coverage and assertions for various components
 - 🧪 Update Playwright tests to handle dynamic UI elements more robustly.
 - 🧪 Improve input fuzzing tests to ensure error logging captures the correct context.
 - 🧪 Refactor mock setups to include Google Drive connection handling in tests.

🚜 [refactor] Clean up CloudSettingsSection component for better performance
 - 🚜 Use Zustand's shallow comparison to optimize state selection and reduce re-renders.
 - 🚜 Consolidate state selections into a single useCallback for improved readability and performance.

📝 [docs] Update comments and descriptions for clarity
 - 📝 Improve documentation in CloudProviderSetupPanel to clarify OAuth processes for users.
 - 📝 Enhance comments in validation utility to explain numeric validation logic more clearly.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(16d9630)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/16d9630fb72e9e515b6ca534bee1f4e89c71d9b4)



### 🛡️ Security

- 🔧 [refactor] Enhance path navigation security and improve state management
 - 🔒 Implement `isPathWithinDirectory` to restrict `file://` navigations outside the production directory
 - 🔄 Refactor `normalizeLogValue` to safely handle circular references
 - 🔄 Update `DynamicMonitorFields`, `Header`, `Settings`, and `HistoryTab` components to use selectors for state management
 - 🧪 Add tests for `WindowService` to validate navigation restrictions
 - 🧪 Improve test mocks for `useErrorStore` and `useSettingsStore` to support selector-based state retrieval

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a29e9e6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a29e9e66ae2921d64534c858fef5bf7fe4a3d98f)



### 🚜 Refactor

- 🚜 [refactor] Streamlines validation and linting

🚜 [refactor] Streamlines monitor form validation by centralizing URL/FQDN options and reusing them across checks, including websocket protocols 🔗
 - Removes stray type fields and uses safer host key access to keep guards consistent ✅
🛠️ [fix] Prevents lint rules from running on stdin buffers and limits a mock-return-value rule to test files to avoid false positives 🧪
🔧 [build] Expands lint enforcement with security, import, node, math, and comment-length rules while aligning plugin wiring to reduce noise 🧰
🎨 [style] Improves docs site behavior with overscroll/scrollbar safeguards and broader lint ignore coverage, plus type declaration inclusion 🧭
🧹 [chore] Clarifies scripts and docs comments with extra JSDoc context and usage text formatting for better guidance ✍️

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(665ed19)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/665ed19ef0524d3046f8eb0d655319490dd5a1e6)


- 🚜 [refactor] Enhance monitor type handling and validation
 - 🛠️ [fix] Introduce buildMonitorValidationCandidate to standardize monitor data structure
 - 🔧 [build] Normalize monitor type strings to prevent empty values
 - 🛠️ [fix] Update validateMonitorData to utilize the new validation candidate structure
 - 📝 [docs] Improve error messages for required fields in validation schemas
 - 🎨 [style] Refactor monitor schemas to ensure consistent error handling
 - 🧪 [test] Update tests to reflect changes in monitor type handling and validation logic
 - 🔧 [build] Adjust Vite and Vitest configurations to improve project structure and type resolution

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b19500a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b19500a06279ea270e2b1c76e618c6c06bf24f2c)


- 🚜 [refactor] Standardizes monitor type typing

🚜 [refactor] Aligns monitor type identifiers across shared models, IPC contracts, and renderer state to reduce drift and enforce consistent option values.
 - Adds runtime validation when serializing monitor type metadata and avoids trimming inputs to preserve canonical identifiers.
🚜 [refactor] Tightens monitor model fields by using shared DNS record type unions for record selection.
📝 [docs] Updates audit notes and guide maintenance steps to reflect new validation and tooling commands.
🧪 [test] Adjusts fixtures and expectations to use supported monitor types and new option fallbacks.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4e174c7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e174c79e81ba39537a157057be37cff9a922461)


- 🚜 [refactor] Centralizes IPC helpers

🚜 [refactor] Removes duplicate renderer IPC and monitor-form helpers to rely on shared contracts and tighter runtime validation
 - 🛠️ [fix] Adds stricter monitor type checks and DNS record typing for safer defaults
🛠️ [fix] Aligns site snapshot parsing with safe-parse results for clearer error diagnostics and payload handling
🚜 [refactor] Simplifies update lifecycle state to shared status events and drops stored release metadata
🚜 [refactor] Standardizes sites telemetry payload typing for consistent logging
🧪 [test] Updates coverage and fuzz suites to match shared helpers and stricter validation
📝 [docs] Refreshes architecture and workflow docs to reflect removed helpers and updated IPC flows
🎨 [style] Documents memoization lint rule rationale while keeping rules disabled

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2eb93cd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2eb93cde67ec61395ec8f83fef08a3f71d763e8e)


- 🚜 [refactor] Improves IPC safety and linting

🚜 [refactor] Adds optional payload parsing and schema validation to improve IPC runtime safety and inference
🚜 [refactor] Centralizes frontend store detection and refines error boundary typing and state for reliable recovery
🛠️ [fix] Uses selector-based root lookup and URL-derived logo assets to avoid UI resolution issues
🎨 [style] Updates template interpolation regex handling and trims redundant lint suppressions and type-parameter noise
🧹 [chore] Expands lint rules and targeted overrides for themes, factories, and unassigned imports to match TypeScript usage
🧪 [test] Aligns entry-point expectations and test config directory resolution with the selector lookup and module metadata

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5293c12)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5293c12998b2a76f77d26012bc4f27202e071dfa)


- 🚜 [refactor] Improves IPC setup safety

🚜 [refactor] Wraps preload bridges, monitor factories, and renderer IPC services in explicit error handling to keep initialization fail-fast and remove blanket exception-handling disables
🚜 [refactor] Strengthens type safety for monitor defaults and object omission, loosens monitor lookup inputs, and adjusts monitor label formatting without regex lookarounds
🛠️ [fix] Improves window setup with ESM directory metadata support, cryptographic retry jitter, and clearer permission denial handling
🧪 [test] Aligns fuzzing and retry-delay assertions with stricter typings and variable jitter
🔧 [build] Refreshes lint plugin wiring, tool/agent config, dependency versions, and the bundled SQLite WASM revision

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bff0dd2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bff0dd221f66afd06addd6e66211813c987cc758)


- 🚜 [refactor] Simplifies sync, UI, and linting

🚜 [refactor] Tightens object-safe omission to prevent routing-only data from leaking into validation
 - 🚜 [refactor] Narrows object handling to avoid unsafe key access paths
🚜 [refactor] Keeps sequential operations explicit while scoping lint disables for retries and migrations
 - 🚜 [refactor] Streamlines import flow to avoid early-continue branching and preserve rollback safety
🎨 [style] Relies on native select focus with cleaner wrapper semantics and updated layout positioning
 - 🧪 [test] Updates selector interaction expectations to match the simplified focus behavior

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0cb3a44)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0cb3a44e613673f93be7498940d10212d96d621b)


- 🚜 [refactor] Improves stability and overlays

🛠️ [fix] Ensures the app lifecycle instance stays reachable to avoid premature teardown.
🚜 [refactor] Centralizes DNS record parsing to reduce complexity and standardize success evaluation.
🛠️ [fix] Hardens TLS certificate and subject handling to treat empty or malformed data as failures.
🚜 [refactor] Splits settings sections into focused components to simplify maintenance and reuse.
🛠️ [fix] Adds dedicated overlay dismiss buttons so modal closing is accessible without backdrop handlers.
🚜 [refactor] Validates history retention rules and prevents settings sync subscription races.
🚜 [refactor] Tightens type safety in charts, object helpers, and validation utilities to reduce unsafe casts.
🛠️ [fix] Normalizes button and card rendering to avoid invalid child node output.
🧪 [test] Updates modal interaction tests to use the new dismiss controls.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2bbb4f6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2bbb4f65a48567c6bb53be786f15ee2c777444e1)


- 🚜 [refactor] Improves runtime type safety

🚜 [refactor] Centralizes unchecked casting and removes scattered assertions across payload cloning, error handling, IPC/database access, and UI helpers to clarify trusted boundaries
🛠️ [fix] Strengthens runtime validation, schema normalization, and safe property access for inputs, monitor types, and null-prototype maps
🛠️ [fix] Makes DNS monitoring parsing resilient by filtering record shapes, handling mixed result types, and improving record detail extraction
🛠️ [fix] Switches retries and devtools delays to unref-friendly sleeps to avoid shutdown blocking
🚜 [refactor] Hardens theme variable generation by iterating only record-like sections, skipping non-string values, and simplifying button/select rendering
🛠️ [fix] Reworks UUID fallback generation to avoid Math.random, prefer crypto entropy, and add deterministic sequencing for uniqueness
🧪 [test] Streamlines UUID tests to focus on observable behavior, crypto fallbacks, and uniqueness

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5b40954)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5b409548a98d6db56da7db59b3ccbe1f04fc7f42)


- 🚜 [refactor] Tightens type safety and guards

🚜 [refactor] Strengthens object safety helpers and theme handling.
 - 🧩 Uses record-like guards and null-prototype objects to reduce unsafe casts.
 - 🎨 Simplifies theme variable application with stricter key checks.

🛠️ [fix] Hardens cache validation and event handling.
 - 🧹 Clears invalid cached monitor type data and falls back safely.
 - 🧭 Adds platform-aware path normalization and uses generic submit events.

🚜 [refactor] Moves type-only Electron surfaces to declarations.

🧹 [chore] Aligns test runner configs and dependency versions.
 - ⚙️ Normalizes silent flags and config dirname resolution.

🧪 [test] Adds strict coverage suites for cloud, backup, fs, and path utilities.
 - 🔍 Expands property-based checks for monitor type handling.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(74169d4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/74169d4cd54f26d1f967c78c0882e222042e99a5)


- 🚜 [refactor] Improves retry orchestration

🚜 [refactor] Centralizes retry behavior with dynamic delays, hooks, and unref timers to reduce scattered loops across services
 - 🛠️ [fix] Keeps non-retryable errors surfaced while insulating retry callbacks from failure
🛠️ [fix] Stabilizes readiness polling for dev server and bridge checks with clearer retry reasons and final failure context
 - ⚡ [perf] Maintains exponential backoff with jitter while avoiding last-attempt waits
🛠️ [fix] Improves theme equality checks with deep comparison to prevent false change detection
⚡ [perf] Simplifies cumulative backoff math for settings retry messaging

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3875997)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3875997e04bdbe4f67795c3be25f81d9fe98d896)


- 🚜 [refactor] Streamlines validation and UI

🚜 [refactor] 🧩 Tightens cloud and data parsing with explicit loose schemas, safer generic metadata, and binary/blob validation.
🛠️ [fix] 🎯 Simplifies overflow/mount behavior, trims resync coalescing, and refines alert layout plus icon sizing for consistency.
🔧 [build] 🧰 Updates lint and script config, bumps tooling deps, and captures Electron/Playwright logs while relaxing strict-void in non-app code.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fce0f49)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fce0f49b18f68bed6873bc4fffa061b0b4f2299c)


- 🚜 [refactor] Fixes backups and moves shared utils

🚜 [refactor] Centralizes core logic by migrating utilities to shared modules
 - Relocates `cloudKeyNormalization`, `jsonByteBudget`, and `errorSerialization` to `@shared/utils`
 - Moves identifier validation logic to `@shared/validation` for consistent cross-process enforcement
🛠️ [fix] Enhances database backup reliability and SQLite sidecar management
 - Updates `DataBackupService` to handle `-wal`, `-shm`, and `-journal` sidecar files during restoration
 - Ensures sidecars are relocated alongside the database during rollbacks to prevent mismatched state corruption
 - Introduces `fsSafeOps` for standardized `fsync` and atomic-like rename operations
🛠️ [fix] Resolves React lifecycle and sync subscription issues
 - Fixes `useMount` cleanup to properly support React StrictMode's extra setup/cleanup cycles
 - Ensures `useSiteSync` singleton manager dispatches status updates to the latest registered callback reference
 - Defers initialization state updates in the `App` component to comply with rendering constraints
⚡ [perf] Optimizes UI responsiveness and rate limiting logic
 - Throttles `Tooltip` repositioning via `requestAnimationFrame` to reduce layout thrashing during scroll and resize events
 - Generalizes `HttpRateLimiter` to support environment-agnostic configuration and fail-open wait thresholds
🎨 [style] Eliminates button rendering glitches using hardware acceleration
 - Applies `translate3d` transforms to themed buttons to maintain composited layers and prevent rasterization artifacts
🧪 [test] Updates test coverage and removes redundant type checks
 - Aligns repository and cloud test suites with the new shared utility import paths
 - Removes obsolete coverage tests for pure interface definitions and documents their shared usage

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8fc8c48)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8fc8c48239d2866c66656d3d12a1da3bce89bfec)


- 🚜 [refactor] Refactors monitoring lifecycle and optimizes history pruning

🚜 [refactor] Centralizes monitoring timeout logic and improves operation coordination
 - ⏱️ Implements a new utility for resolving base request timeouts versus operation timeouts that include cleanup buffers
 - 🛡️ Enhances `MonitorOperationCoordinator` with a single-flight policy to prevent starting new operations for a monitor if one is still outstanding
 - 📉 Optimizes `EnhancedMonitorChecker` by introducing a throttled history pruning strategy that reduces redundant database count queries
 - 🧼 Simplifies `DnsMonitor` and `nativeConnectivity` by removing manual abort wrappers in favor of native signal propagation and integrated promise racing
 - 🔌 Refactors `withOperationalHooks` to ensure consistent cancellation behavior across retries, providing a unified "Operation was aborted" error state
 - 🏷️ Standardizes the use of `z.ZodType` and `z.ZodError` across all validation schemas and service boundaries for improved consistency

🧪 [test] Strengthens monitoring test suite and benchmark reliability
 - 📈 Adds coverage for history count check throttling to ensure performance optimizations work as intended
 - 🩺 Validates that manual checks correctly enforce monitor-specific timeouts using the new signal utilities
 - 🔄 Updates `MonitorOperationRegistry` and repository mocks to support the new single-flight and operation tracking logic
 - 🛠️ Adjusts `HistoryRepository` test data to use string-based identifiers consistently

🔧 [build] Updates project configuration and build paths
 - 📂 Relocates `tsBuildInfoFile` and `declarationDir` outputs to a centralized `.cache` directory structure across UI, documentation, and test projects
 - 🏗️ Aligns TypeScript configurations for `electron/test` and `shared/test` to extend dedicated testing base configs

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9f60412)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9f604129c9ac0aeb9d62df2c9cfa319f9c7a3362)


- 🚜 [refactor] Modularize core services and harden IPC

🚜 [refactor] Decompose monolithic services into specialized modules
 - ☁️ Relocate `CloudService` logic into dedicated operation modules for backups, encryption, provider management, and synchronization.
 - 🛡️ Introduce an internal operation context to safely share dependencies across extracted cloud modules.
 - 📡 Offload `UptimeOrchestrator` event-handler plumbing to a dedicated handler class to improve maintainability.
 - 🏗️ Extract site state synchronization and revision bookkeeping from `SiteManager` into `SiteManagerStateSync`.
 - 🔍 Separate dynamic SQL query building and identifier escaping from `MonitorRepository` into specialized update utilities.

✨ [feat] Harden IPC security and preload bridge validation
 - 🧱 Implement `createValidatedInvoker` in the bridge factory to verify main-process response payloads against Zod schemas.
 - 🛡️ Introduce strict JSON byte-budget checks for monitor validation payloads to prevent memory exhaustion via IPC.
 - 📊 Enhance IPC response metadata to include execution duration, parameter counts, and structured validation errors.
 - 🧪 Expand property-based testing for monitor type APIs to ensure schema enforcement for all edge cases.

🛠️ [fix] Enhance WindowService security and idempotency
 - 🗔 Ensure `createMainWindow` is idempotent by reusing existing instances instead of spawning duplicates.
 - 🚫 Strengthen security by explicitly denying and logging unauthorized permission requests and display media (screen capture) attempts.

🧹 [chore] Modernize project configuration and dependencies
 - 📦 Update core dependencies including `@types/node`, `eslint-plugin-react`, and `secretlint` packages.
 - 🎨 Clean up redundant Prettier configurations and adjust HTML hinting rules to support flexible tag closing.
 - 🔧 Refine Node.js configuration for improved test reporting and diagnostic output.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(eb04abf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eb04abff5a857c0756d6a21108d686f5500827a3)


- 🚜 [refactor] Decouple event orchestration and modularize core services

🚜 [refactor] Decouple event orchestration logic from the main orchestrator
 - 🧩 Introduces `OrchestratorEventForwardingCoordinator` to isolate the logic for bridging internal manager events to renderer-facing public events
 - 🧹 Removes extensive event handling boilerplate from `UptimeOrchestrator` to improve maintainability and focus on high-level lifecycle delegation
🚜 [refactor] Modularize event type definitions via domain-specific catalogues
 - 📂 Decomposes the monolithic `UptimeEvents` interface into specialized modules covering `core`, `internalCacheDatabase`, `internalMonitoringSite`, and `public` events
 - 🔌 Employs TypeScript module augmentation to provide a scalable and organized event map architecture
🚜 [refactor] Streamline service dependencies and cloud orchestration
 - 📦 Extracts `ServiceContainerEventForwarder` to manage inter-manager bus communication outside of the primary `ServiceContainer`
 - ☁️ Refactors `CloudService` by extracting settings, migration, and backup metadata logic into dedicated internal helper modules
 - 🏗️ Isolates `SiteManager` dependency and interface contracts into a standalone type-only module to reduce implementation file noise
🎨 [style] Standardize compiler and build configurations
 - 🔧 Updates testing `tsconfig` files with consistent path mapping, output directories, and build info locations
 - 💅 Reformats JSON configuration files for improved readability and structural consistency
🧪 [test] Update test suites for architectural alignment
 - 🛠️ Adjusts `ServiceContainer` and `SiteManager` tests to integrate with the new coordinator and type structures
 - 🧪 Align monitoring and scheduler tests with updated event emission signatures

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9436129)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9436129ac38c9ac8acc719740f9290d0c80e25f9)


- 🚜 [refactor] Standardize imports and event documentation

🚜 [refactor] Enforces namespace imports for Node.js built-in modules using `import * as` syntax across the entire codebase to improve consistency and ESM compatibility 📦
 - Updates usage of `node:path`, `node:fs`, `node:crypto`, `node:http`, and `node:tls` in services, scripts, and configuration files 🛠️

📝 [docs] Extensively updates Architectural Decision Records (ADRs) and pattern guides to align with refined event naming conventions 📑
 - Renames plural event topics like `sites:added` to singular `site:added` to strictly follow the `domain:action` standard 🏷️
 - Clarifies state synchronization mechanisms, documenting how internal main-process events are rebroadcast to renderers via the `state-sync-event` IPC channel 📡
 - Refines integration guides for error handling, renderer integration, and lifecycle management to include updated technical contracts 📈

🧹 [chore] Hardens the linting configuration by implementing strict `unicorn/import-style` rules within `eslint.config.mjs` 🧼
 - Adds repository-specific ignore patterns to `.gitignore` and `.remarkignore` to manage Docusaurus build outputs and generated documentation 📁

🛡️ [fix] Optimizes the preload bridge by simplifying event validation guards and stripping redundant metadata reason codes 🔒
 - Updates `WindowService` security notes to detail Chromium sandbox constraints and dependencies within the preload layer 🛡️

🧪 [test] Updates the testing suite, including Vitest configurations and mock bridges, to reflect renamed identifiers and corrected import paths 🧪
 - Adjusts Playwright fixtures and E2E coverage utilities to maintain parity with the updated project structure 🎭

🏗️ [build] Updates Vite and Vitest configuration files to use standardized import patterns for build-time resolution utilities 🏗️

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7bfbade)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7bfbade524a70f4877226e03e5335295e8467ad6)


- 🚜 [refactor] Streamline IPC protocol and state sync events

🚜 [refactor] Decouple event subscriptions from the state sync bridge by moving broadcast listeners to a dedicated events domain
🚜 [refactor] Simplify the IPC response contract by removing legacy validation wrappers and specialized response types
🛡️ [logic] Enhance site synchronization reliability with a new sanitation pipeline that detects duplicate identifiers and overlapping deltas
✨ [feat] Add a bulk deletion method to the site management service for clearing all records in a single operation
✅ [validator] Replace manual string checks with shared Zod schemas for site and monitor identifier validation
📝 [docs] Update architecture guidelines and ADRs to reflect hyphenated naming conventions for invoke channels and broadcast patterns for events
📂 [refactor] Reorganize IPC validators into domain-specific modules for better maintainability and discovery
🧪 [test] Align comprehensive test suites with the revised preload bridge interface and improved error logging diagnostics

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7e0f249)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e0f249377aea5ea4997ac6bfc0a92149bd7ce85)


- 🚜 [refactor] Simplify monitor schemas and enhance UI

🚜 [refactor] Simplify the monitor data model by consolidating disparate configuration and form data types into a unified interface
 - Eradicate legacy database column aliases and manual schema normalization logic to enforce a strict source of truth for monitor properties
 - Transition the internal database representation of monitoring states to use a singular boolean source of truth, removing legacy aliasing

✨ [feat] Enhance confirmation dialogs with context-aware iconography and support for visual emphasis on specific substrings in messages
 - Implement a mechanism to highlight crucial information, such as site or monitor names, within global alert dialogs to prevent accidental deletions

🎨 [style] Fix modal stacking issues by reordering global dialogs in the application shell and refining z-index hierarchies for overlays
 - Ensure that critical confirmation and prompt dialogs always render above other active modals like site detail views

🔧 [build] Update linting configurations and documentation guidelines to enforce standardized schema keys in markdown frontmatter

🧪 [test] Conduct a major cleanup of the test suite by removing obsolete type coverage tests and updating repository mocks to align with the simplified schemas

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(62f48b2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/62f48b2ee689c8c890297fdc15879c285974b5c5)


- 🚜 [refactor] Centralize shared logic and types

🚜 [refactor] Centralize database and monitoring repository interfaces into shared "bundle" types to reduce code duplication and address copy-paste detection (jscpd) warnings across manager and service layers.

🏗️ [refactor] Extract common adapter logic into a new base class for monitor services, reducing boilerplate for HTTP and remote monitoring implementations.

🎨 [refactor] Introduce a shared `useThemedControlStyles` hook to unify the visual appearance of form controls, ensuring consistent borders, transitions, and spacing across inputs and selects.

🔄 [refactor] Consolidate dashboard site metadata derivation into a shared hook to provide a single source of truth for monitor runtime summaries and marquee text dependencies.

📝 [refactor] Overhaul the renderer-side logging system using factory functions to generate consistent log methods and improve metadata extraction logic.

🧩 [refactor] Streamline form submission and chart data calculation by grouping related derived values and precomputing validation field maps.

🛠️ [refactor] Wrap site-wide monitoring actions in a unified, fire-and-forget logging utility to standardize error reporting and reduce repetition in action hooks.

🧪 [test] Clean up redundant fuzzing tests and clarify timeout conversion assertions while moving monitoring action interfaces to shared type definitions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4765016)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4765016997e36b7b875ab975c1a6afd95f310c69)


- 🚜 [refactor] Centralize monitoring and cloud logic

🚜 [refactor] Consolidate monitoring lifecycle management by centralizing start/stop request handling and response building within the coordinator and manager layers 🔌
 - 📦 [refactor] Standardize site mutation event emission and state synchronization in `SiteManager` to eliminate logic drift across add, update, and remove flows 🔄
 - 📡 [refactor] Refactor `EnhancedMonitorChecker` to use a canonical strategy registry and unified runtime state, removing duplicate monitor service instantiations 🛠️
 - ☁️ [feat] Introduce a shared `BaseCloudStorageProvider` and a robust cloud key normalization utility to unify backup IO across filesystem and cloud providers ☁️
 - ⏱️ [refactor] Implement centralized `AbortSignal` merging and timeout management utilities to ensure consistent request cancellation across all monitor types ⏳
 - 🔔 [refactor] Unify notification suppression logic for monitor status changes, consolidating site muting and cooldown checks into a single code path 🔕
 - 🧩 [refactor] Extract reusable UI patterns for layout toggles, settings numeric fields, and maintenance panels to reduce component boilerplate 🎨
 - 🧪 [test] Update test suites to accommodate refactored service registries and standardized loading delays in the application lifecycle 🧪

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(63c3f58)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/63c3f58078163ceae1981aaaf77fbb0b084101e6)


- 🚜 [refactor] Centralize cloud I/O and DB operations

🚜 [refactor] Consolidate shared logic for cloud storage and database transactions
 - 🚜 [refactor] Create a unified module for cloud backup and metadata I/O to ensure consistent storage patterns across all providers
 - 🚜 [refactor] Update Filesystem, Dropbox, and Google Drive storage implementations to utilize standardized upload and download helpers
 - 🚜 [refactor] Implement factory functions for creating transaction-scoped repository adapters to simplify database transaction setup
 - 🚜 [refactor] Abstract dot-separated path validation into a reusable internal utility for monitor configuration schemas
 - 🚜 [refactor] Streamline cloud synchronization schemas by introducing a shared base operation structure to reduce duplication
 - 🚜 [refactor] Improve Google Drive backup listing by adopting shared metadata processing utilities

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6170f46)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6170f4651c789e860c0ce96abe94a51394746727)


- 🚜 [refactor] Streamlines IPC and error utilities

🚜 [refactor] Implements a curried registrar pattern to simplify IPC handler definitions
 - 🏗️ Introduces `createStandardizedIpcRegistrar` in the Electron service layer to manage handler tracking
 - ✂️ Reduces boilerplate by eliminating the need to pass `registeredHandlers` to every individual IPC call
 - 🧩 Updates modules for cloud, data, diagnostics, monitoring, and system handlers to use the new registrar

🛠️ [fix] Centralizes error derivation logic within the shared error catalog
 - 🔄 Migrates legacy `getErrorMessage` utility to `getUnknownErrorMessage` inside the global catalog
 - 🧹 Removes the redundant `errorUtils.ts` file to consolidate shared utility functions
 - 🛡️ Ensures consistent fallback strings are sourced from `ERROR_CATALOG` across the entire application
 - 🩹 Improves error detail extraction in `SyncMaintenancePanel` and various database repository services

🧪 [test] Enhances test suite reliability and optimizes coverage structure
 - 🧹 Deletes numerous redundant "fixed" coverage test files to clean up the service test directory
 - 🔍 Updates IPC contract consistency tests to recognize the new curried registration syntax
 - ✅ Adds exhaustive behavioral tests for `getUnknownErrorMessage` to guarantee deterministic fallbacks
 - 📈 Refines test logic for `PortMonitor` and `EnhancedMonitorChecker` to improve coverage accuracy

🔧 [build] Updates project dependencies and development toolsets
 - ⬆️ [dependency] Updates `@typescript-eslint` ecosystem to version `8.50.1`
 - 🆙 Upgrades Vitest ESLint plugins and `knip` for improved linting and dead-code detection
 - 📦 Updates `package-lock.json` to reflect upstream security patches and dependency tree changes

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c498355)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c4983557c223d127bdeae771c06394043762291a)


- 🚜 [refactor] Centralize IPC logic and error handling

🚜 [refactor] Centralize IPC response validation and data extraction into a shared utility
 - 📡 Standardizes the `IpcResponse` envelope format across preload and renderer layers
 - 🛡️ Prevents accidental misinterpretation of `undefined` data as a malformed response
 - 🔗 Unifies typed and void invoker semantics to avoid logic divergence across the bridge
✨ [feat] Implement a unified helper for user-facing error message extraction
 - 💬 Provides consistent string formatting for unknown error values within UI components
 - 🛠️ Safely handles `Error` objects, custom records, and primitive types gracefully
🚜 [refactor] Streamline IPC service initialization and store operation boilerplate
 - 🏗️ Simplifies service factory calls by removing redundant module-level try/catch blocks
 - ♻️ Deduplicates site monitoring lifecycle actions through a shared internal runner
 - ⚙️ Consolidates numeric field update logic for monitors into reusable helper functions
 - 🛡️ Hardens monitor update logic to guarantee ID preservation during partial updates
🔧 [build] Refactor file download utilities to improve resource lifecycle management
 - 🧹 Introduces helper functions for automatic `ObjectURL` revocation and safer DOM cleanup
 - 🖱️ Abstracts anchor-based triggers to handle browser-specific DOM manipulation failures
🧪 [test] Update service initialization tests to reflect streamlined error paths

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7da2468)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7da2468f06f4ec3685208b2b4dd6bcf696c7cdfe)


- 🚜 [refactor] Improves core service logic and configuration consistency

🚜 [refactor] Refactors `MonitorManagerEnhancedLifecycle` to significantly reduce code duplication by abstracting monitor toggling and batch processing into dedicated internal helpers.
 - ⚙️ Introduces `runEnhancedLifecycleBatch` for standardized sequential execution of monitor start/stop actions.
 - 🛡️ Implements `toggleSingleMonitorEnhanced` to unify host-level state applications and checker service calls.
🚜 [refactor] Consolidates cloud service logic for status building and backup management to ensure cross-provider UI consistency.
 - ☁️ Centralizes `CloudStatusSummary` construction into a singular `buildCloudStatusSummary` builder shared by Dropbox, Filesystem, and Google Drive implementations.
 - 🔍 Moves backup discovery and metadata hydration logic to a shared `listBackupsFromMetadataObjects` utility.
✨ [feat] Enhances the `TypedEventBus` system and internal middleware with improved type safety and introspection.
 - 🛡️ Adds a dedicated `isEventMetadata` type guard module to strengthen runtime validation during event propagation.
 - 🧩 Integrates `collectOwnPropertyValuesSafely` for more robust circular reference detection in event middleware.
🚀 [refactor] Shifts core utilities including `readProcessEnv`, `readNumberEnv`, and `generateCorrelationId` to shared packages to improve cross-process architectural integrity and reuse.
🛠️ [fix] Standardizes IPC handler validation patterns by utilizing a new `requireRecordParam` helper to verify incoming object structures before processing.
🧹 [chore] Prunes the codebase by deleting obsolete database migration benchmarks and removing deprecated migration-related constants from the monitoring service.
🎨 [style] Performs a sweeping reform of project configuration files, collapsing arrays and standardizing indentation across `.cspell.json`, `.devskim.json`, `.ncurc.json`, and `.vscode` settings.
📝 [docs] Refreshes architectural decision records (ADRs), templates, and developer guides to reflect current state management patterns and component standards.
 - 🖼️ Removes legacy assets including `logo-old.svg` and `favicon-old.ico` from the documentation static files.
🔧 [build] Updates TypeScript configurations and path mappings to accommodate moved shared utilities and asset removals.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d7b4f10)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d7b4f10ca16d38b2724a550d3b8c62597a287bd5)


- 🚜 [refactor] Centralizes validation and hardens IPC bridge

- 🏗️ Migrates legacy manual validation to a canonical Zod-based architecture
 - 🛡️ Replaces bespoke checks with robust schemas to ensure consistency across the mono-repo
 - 📏 Centralizes field constraints such as minimum check intervals to prevent logic drift
- 🛡️ Hardens database repositories with defensive identifier validation
 - 🚫 Implements checks for ASCII control characters and length limits on site and monitor IDs
 - 📝 Enhances repository logging with structured context for easier debugging
- 🔗 Refactors the IPC bridge factory for better consistency
 - ⚙️ Implements `invokeWithValidation` to synchronize correlation handling and error mapping
 - 🛡️ Wraps renderer event listeners in safe callbacks to prevent crashes from unhandled errors
- ☁️ Simplifies cloud sync encryption configuration
 - ✂️ Removes legacy `enabledAt` migration timestamps in favor of a uniform encryption policy
 - 🔒 Restores strict rejection of unencrypted sync artifacts within the storage provider
- 🧹 Prunes technical debt in settings and IPC services
 - 🗑️ Removes outdated settings migration logic and legacy notification channel shims
 - 🔌 Aligns IPC parameter validators with shared validation constants
- 🧪 Overhauls test infrastructure and snapshot logic
 - 📈 Updates fuzzers and comprehensive suites to match refined schema behaviors
 - 🛠️ Refactors renderer store snapshots to resolve TypeScript property access conflicts

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(83f3378)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/83f3378d03f5f9d3ccbab4d4587ed67a14acff04)


- 🚜 [refactor] Consolidate shared utilities and harden IPC validation

🚜 [refactor] Standardize IPC parameter validation using a new factory-based architecture to ensure consistent error reporting and type safety.
 - 🏗️ Implement `createParamValidator` in the IPC layer to unify parameter count checks and validation logic.
 - 📎 Add `toClonedArrayBuffer` utility to safely transfer exact byte segments across the IPC bridge without leaking underlying buffer memory.
 - 🧹 Remove the redundant `withIgnoredIpcEvent` wrapper from all service handlers to streamline the registration process.
 - 🛡️ Strengthen filesystem path validation to better handle Windows device namespaces and absolute path constraints.
✨ [feat] Introduce architectural "Drift Guards" via custom ESLint rules to enforce code consistency.
 - 🚫 Implement `no-regexp-v-flag` to disallow experimental regex features that cause toolchain and runtime compatibility issues.
 - 👮 Deploy `no-local-identifiers` and `no-call-identifiers` to prevent the duplication of shared utility logic like JSON parsing and object type guards.
 - ⚠️ Enforce `prefer-try-get-error-code` to standardize how system and network error codes are extracted.
🛡️ [security] Centralize OAuth authorization URL validation to protect against malicious navigation.
 - 🔗 Create a shared `validateOAuthAuthorizeUrl` helper to enforce `https:` protocols and prevent credential leakage in external browser requests.
 - 🛠️ Integrate `getElectronErrorCodeSuffix` to provide consistent, redacted error messaging for failed external link operations.
🚜 [refactor] Consolidate core logic into shared utility modules to reduce logic duplication.
 - 🆔 Unify sync device ID validation into `getPersistedDeviceIdValidationError` to maintain stable error strings across transport layers.
 - 📄 Move `hasAsciiControlCharacters` to a shared `stringSafety` module used by both the Electron process and the renderer.
 - 🔍 Refactor cloud metadata parsing to support strict and best-effort strategies, improving resiliency against corrupted provider files.
🛠️ [fix] Downgrade project-wide Regular Expression flags from `v` to `u`.
 - ⚙️ Adjust `eslint.config.mjs` to disable conflicting Unicode set requirements while maintaining project safety.
 - 🔍 Update patterns in monitoring, sync, and UI components to ensure compatibility with the current toolchain.
🧪 [test] Expand test coverage for critical cloud synchronization and validation paths.
 - 🚥 Add comprehensive unit tests for OAuth URL validation and sync engine key parsing.
 - 🧪 Implement new tests for token managers to verify handling of malformed or invalid stored secrets.
 - 🧪 Ensure Zod issue formatting remains consistent across the shared validation layer.

🚜 [refactor] Harden IPC and unify validation logic

🚜 [refactor] Standardizes the IPC layer using a factory-based architecture to unify parameter count checks and validation logic.
 - 🏗️ Implements a shared parameter validator factory to ensure consistent type safety and error reporting across all service handlers.
 - 🛡️ Hardens filesystem security by strengthening path validation for Windows device namespaces and absolute path constraints.
 - 🧹 Streamlines IPC registration by removing redundant handler wrappers and simplifying the service interface.
 - 📎 Adds a memory-safe buffer cloning utility to prevent leaking extra bytes from underlying memory segments during IPC transfers.
✨ [feat] Introduces architectural "Drift Guards" via custom ESLint rules to enforce code consistency and runtime safety.
 - 🚫 Disallows the experimental RegExp `v` flag through a new lint rule to prevent toolchain and runtime compatibility errors.
 - 👮 Enforces the use of centralized shared utilities for JSON parsing, object type guards, and error code extraction.
 - ⚠️ Standardizes error reporting by requiring unified formatting for system and network error code suffixes.
🛡️ [security] Centralizes OAuth authorization URL validation to protect against malicious navigation and credential leakage.
 - 🔗 Implements a shared validation helper that enforces HTTPS protocols and redacts sensitive query parameters in logs.
 - 🛠️ Integrates consistent, redacted error messaging for failed external link operations across all cloud providers.
🚜 [refactor] Consolidates core logic into shared utility modules to reduce duplication across Electron and renderer processes.
 - 🆔 Unifies sync device ID validation to maintain stable error strings and canonical key segments in the transport layer.
 - 📄 Moves string safety checks and ASCII control character filtering to a centralized module.
 - 🔍 Refactors cloud metadata parsing to support both strict and best-effort strategies, improving resiliency against corrupted files.
🛠️ [fix] Downgrades project-wide Regular Expression flags from `v` to `u` to ensure full compatibility with the current runtime environment.
 - ⚙️ Adjusts the global lint configuration to disable conflicting Unicode set requirements while maintaining project safety.
🧪 [test] Expands comprehensive test coverage for critical cloud synchronization and validation paths.
 - 🚥 Adds unit tests for OAuth URL verification, sync engine key parsing, and token manager secret handling.
 - 🧪 Verifies that Zod issue formatting remains consistent and accurate across the shared validation infrastructure.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a6ca7c9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a6ca7c925b718daac91934035624a8b47ec6caca)



### 📝 Documentation

- 📝 [docs] Add interactive chart docs

📝 [docs] Adds chart-focused markdown guides with Mermaid visuals and updated ADR phrasing
 - Replaces MDX pages with TypeDoc-ingested chart docs for site inclusion
🔧 [build] Updates documentation site config, sidebar entries, and doc inputs
 - Enables extra markdown handling and links chart pages in navigation
🎨 [style] Refines mobile navbar selectors and search input styling
🧹 [chore] Tightens inline documentation comment wording

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d77227b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d77227b76ec8024b0e90611643d644a41753fa7a)


- 📝 [docs] Update architecture docs and linting

🚜 [refactor] Standardize internal Zod schema naming and validation
 - 🔄 Reorganizes internal schema variables to follow a consistent `internalSchema` suffix naming convention across shared types
 - 🔢 Simplifies numeric validation by utilizing direct integer constraints for timestamps, ports, and retry counts
 - ⚖️ Refines Zod error handling by switching custom refine logic to use explicit error objects for enhanced validation feedback

🎨 [style] Improve acronym casing in UI display labels
 - 🔡 Enhances text formatting utilities to correctly preserve uppercase for common acronyms like HTTP, DNS, and API
 - 🏷️ Updates monitor status badges and selectors to display technical terms with consistent casing

🔧 [build] Expand ESLint configuration for future-proofing and consistency
 - 🧪 Integrates `eslint-plugin-react-19-upgrade` to prepare the codebase for upcoming React version transitions
 - 📦 Adds `eslint-plugin-zod-x` and `eslint-plugin-case-police` to enforce best practices and string casing standards
 - ⚙️ Configures additional rules for workspace hardening, including strict gitignore parsing and namespace import preferences

📝 [docs] Update Architecture Decision Records and API documentation
 - 📅 Refreshes multiple ADRs with updated review dates and refined implementation statuses for cloud sync and security
 - 🗺️ Clarifies the roadmap for WebDAV support and documents the shift toward `safeStorage` for secret management
 - 📖 Rewrites monitor configuration API guides to align with the shared domain model and centralized Zod schemas

🛠️ [fix] Refine OAuth loopback behavior and platform-specific paths
 - 🌐 Adjusts loopback redirect logic to accommodate provider-specific path requirements while maintaining port stability
 - 🍎 Corrects a casing typo in the macOS application bundle path within the backup service tests

🧪 [test] Synchronize test suites with updated UI and schema logic
 - ✅ Updates unit and fuzzing tests to match new casing expectations for monitor type display labels
 - 🧪 Refines property-based tests to accurately validate camelCase and snake_case transformations with acronym support

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(588c07b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/588c07b04f9373f729bd12bd03e2a753ecd6e2c9)



### 🎨 Styling

- 🎨 [style] Refactor import statements for consistency and readability
 - Standardized import statements across multiple test files to a single line format for better readability.
 - Adjusted spacing and indentation in various test files to enhance code clarity.

🧪 [test] Improve test coverage and structure
 - Updated tests in `cloudServiceFsUtils.test.ts` to ensure consistent import style and improved readability.
 - Enhanced tests in `googleDriveHttpClient.test.ts` by refactoring mock function definitions for clarity.
 - Refined tests in `snapshot.test.ts` to maintain consistent import statements and improve overall structure.
 - Modified tests in `pathGuards.test.ts` to ensure uniformity in import statements and enhance readability.
 - Streamlined tests in `fsSafeOps.test.ts` by consolidating mock function definitions and improving clarity.

📝 [docs] Update comments for clarity
 - Revised comments in `vitest.electron.config.ts`, `vitest.linting.config.ts`, and `vitest.shared.config.ts` to clarify the purpose of eslint disable directives.
 - Ensured comments accurately reflect the intent of the code and maintain consistency across configuration files.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b0efe37)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b0efe373fb4caad9e06049fa32b3ec6bd6b52e0b)


- 🎨 [style] Refactor code formatting for improved readability
 - Adjusted multiline import statements for better alignment in `cloudProviderDeps.ts`, `resolveCloudProviderOrNull.ts`, and `main.ts`
 - Reformatted comments in `zodIssueFormatting.ts` for consistent line breaks
 - Enhanced readability of function parameters in `monitorFormData.ts`
 - Improved indentation in `useSitesStore.coverage.test.ts` for clarity

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e0581c5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e0581c5c578484cb72007ded34f64b4ab881b5e7)


- 🎨 [style] Standardize codebase formatting and structure

🎨 [style] Applies a comprehensive project-wide formatting overhaul to align with standardized linting rules
 - 🚜 Refactors complex conditional statements and object assignments across core services into readable multi-line formats 🚜
 - 🧹 Eliminates redundant manual validation logic by removing `identifierValidation.ts` in favor of shared schemas 🧹
 - ✨ Standardizes JSDoc documentation across the event catalogue and public bridges for improved IDE intellisense ✨
 - 🧩 Reorganizes function signatures in the IPC layer to ensure consistent parameter wrapping and clarity 🧩
 - 📂 Cleans up directory-wide whitespace, trailing lines, and inconsistent indentation in the `electron/` backend 📂
 - 🔧 Harmonizes the primary `eslint.config.mjs` by grouping plugins and rules for better maintainability 🔧
 - ⚡ Refines the Electron main process imports to use consistent grouping and standardized path aliases ⚡
 - 🚜 Improves the readability of complex monitoring and cloud sync logic through logical line breaking 🚜
 - 📝 Corrects documentation spacing and markdown formatting in feature development and testing guides 📝
 - 🧪 Synchronizes the testing suite with new structural standards, updating mocks and property-based tests 🧪

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e5c7176)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e5c71768f5f6e1d9e2e2cd77c09355b201045ebc)


- 🎨 [style] Improve code formatting and readability across multiple files
 - 🔧 [style] Refactor knip.config.ts by removing unused entries
 - 🎨 [style] Enhance formatting in main.ts for better readability
 - 🎨 [style] Adjust formatting in eventsApi.ts for consistent style
 - 🎨 [style] Simplify error message formatting in cloudKeyNormalization.ts
 - 🎨 [style] Clean up DataBackupService.ts by improving code structure
 - 🎨 [style] Streamline MonitorFactory.ts for better clarity
 - 🎨 [style] Refine httpMonitorCore.ts for improved readability
 - 🎨 [style] Consolidate errorHandling.ts for cleaner code
 - 🎨 [style] Enhance WindowService.ts formatting for consistency
 - 🎨 [style] Improve bridgeFactory.comprehensive.test.ts formatting
 - 🎨 [style] Adjust cloudKeyNormalization.test.ts for better readability
 - 🎨 [style] Refactor monitorServiceHelpers.test.ts for clarity
 - 🎨 [style] Clean up errorHandling.test.ts for improved structure
 - 🎨 [style] Enhance WindowService.test.ts formatting for consistency
 - 🎨 [style] Refactor jsonByteBudget.ts for better readability
 - 🎨 [style] Improve utfByteLength.ts formatting for clarity

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a79040b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a79040b93939505c478865175ecc32e1eed2287c)


- 🎨 [style] Improve code formatting for better readability

 - Refactor `DataBackupService.ts` to enhance code formatting by aligning parameters and arguments for better clarity.
 - Update `createSingleFlight.ts` to improve inline comments and formatting for better understanding.
 - Adjust `urlSafety.test.ts` to format the `validateExternalOpenUrlCandidate` test case for improved readability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b7d3e0e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b7d3e0ed09e3259d6d5d30e38ef338943f61c3b0)


- 🎨 [style] Clean up code formatting and improve readability
 - Align multi-line statements for better clarity
 - Remove unnecessary blank lines to streamline code
 - Adjust indentation for consistency across files

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7c31aa4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7c31aa448d61d49a8937986507f89d796d7721bc)


- 🎨 [style] Refactor code for improved readability and consistency
 - 📝 Clean up formatting in SyncEngine tests for better readability
 - 📝 Adjust indentation and line breaks in various test files
 - 📝 Standardize function argument formatting in validators tests
 - 📝 Enhance readability in URL safety tests by organizing imports and formatting

✨ [feat] Introduce URL validation for external links
 - 🔒 Implement `validateExternalOpenUrlCandidate` to validate and normalize URLs for external opening
 - 🚫 Reject URLs with credentials, newlines, and invalid formats
 - 📧 Allow `mailto:` URLs alongside `http:` and `https:`
 - 🔍 Update SystemService to utilize new URL validation logic

🛠️ [fix] Update dependencies for improved functionality
 - 🔄 Upgrade `fast-check` to version 4.5.0 for enhanced testing capabilities
 - 🔄 Upgrade `knip` to version 5.76.0 for better code analysis
 - 🔄 Upgrade `putout` to version 41.0.8 for improved code formatting
 - 🔄 Upgrade `prettier-plugin-multiline-arrays` to version 4.1.3 for better formatting options

🧪 [test] Enhance test coverage for URL validation
 - ✅ Add tests for `validateExternalOpenUrlCandidate` to ensure correct behavior for valid and invalid URLs
 - ✅ Include tests for various URL formats including `mailto:` and invalid cases
 - ✅ Update UI store tests to reflect changes in URL validation logic

🧹 [chore] Clean up unused imports and variables
 - 🧼 Remove unnecessary imports in SystemService and UI store files
 - 🧼 Clean up test files by removing unused variables and imports

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7f0ac64)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7f0ac64cf200e2adbc03e574fc54826c84d05e27)


- 🎨 [style] Refactor code for improved readability and consistency
 - Removed unnecessary blank lines in `CloudService.ts`, `LoopbackOAuthServer.ts`, and other files to enhance code clarity.
 - Reformatted long lines for better readability in `CloudService.ts`, `GoogleDriveAuthFlow.ts`, and other files.
 - Adjusted indentation and spacing in various files to maintain consistent coding style.

🛠️ [fix] Update OAuth redirect URIs for improved compatibility
 - Changed the default loopback redirect URI from `http://127.0.0.1` to `http://localhost` in `LoopbackOAuthServer.ts` to align with modern practices.
 - Updated the redirect path in `LoopbackOAuthServer.ts` to `/oauth2/callback` to meet Google’s OAuth requirements.

✨ [feat] Enhance Google Drive integration
 - Modified `GoogleDriveAuthFlow.ts` to support optional path components in loopback redirects.
 - Improved error handling and token management in `GoogleDriveTokenManager.ts` for better user experience.

📝 [docs] Update comments for clarity
 - Revised comments in `CloudService.ts`, `LoopbackOAuthServer.ts`, and `GoogleDriveAuthFlow.ts` to provide clearer explanations of functionality and usage.

🧪 [test] Improve test coverage and assertions
 - Enhanced tests in `GoogleDriveCloudStorageProvider.test.ts` and `GoogleDriveTokenManager.test.ts` to ensure robust validation of Google Drive functionalities.
 - Updated assertions in `IpcService.test.ts` and `useCloudStore.comprehensive.test.ts` for better clarity and accuracy.

🧹 [chore] Clean up package.json and dependencies
 - Removed duplicate optional dependencies in `package.json` to streamline the project configuration.
 - Updated linting scripts in `package.json` to improve code quality checks.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(da1d436)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/da1d4366a166b8bf4754db2cdf2f62d5471d61a1)



### 🧹 Chores

- Update changelogs for v22.1.0 [skip ci] [`(18ddf69)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/18ddf6999178930c99bef4ef63638a4234a4f423)


- Update changelogs for v22.0.0 [skip ci] [`(5459f43)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5459f4360d890467685cbbca77640ee80d0f1180)


- Update changelogs for v21.9.0 [skip ci] [`(7bae946)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7bae946d612f6da022553c060d732db93223866f)


- Update changelogs for v21.8.0 [skip ci] [`(ab638db)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab638db37e31f1dd81354c239e718550f795d4aa)


- Update changelogs for v21.7.0 [skip ci] [`(0592f72)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0592f72e410c1505e11cad7346ba4dc2b97eef64)


- Update changelogs for v21.6.0 [skip ci] [`(5b9bd1f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5b9bd1fecda795b5401af5f0fb14a3b27faa828e)


- Update changelogs for v21.5.0 [skip ci] [`(bb5aa5e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bb5aa5e4f1cf7fa1863ab299b52bb4fa91c069d2)


- Update changelogs for v21.4.0 [skip ci] [`(a0a6b11)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a0a6b115ce7b907b5948749334df1af0e962eb43)


- Update changelogs for v21.3.0 [skip ci] [`(decc95e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/decc95e21e2362e68f33af6a1179b177a70a2956)


- Update changelogs for v21.2.0 [skip ci] [`(761bd4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/761bd4c64c2e1a20215281a004f455d2cbfbca16)


- Update changelogs for v21.1.0 [skip ci] [`(7b8d429)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b8d4290831f4f0c982a64665136fe7895272b3b)


- Update changelogs for v21.0.0 [skip ci] [`(d54009c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d54009cf33b556e668453ee4a52883801035e42d)


- Update changelogs for v20.9.0 [skip ci] [`(a4fc51a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a4fc51ab5357f54cecc2c18188bf6e683d58100d)



### 🔧 Build System

- 🔧 [build] Harden IPC bridge & optimize UI stores

✨ [feat] Implement comprehensive runtime validation for IPC response payloads across the preload bridge to ensure cross-process data integrity
 - 🛡️ Introduce `createSafeParseAdapter` and specialized result parsers in the bridge factory to verify data coming from the main process
 - 🔗 Migrate Cloud, Data, Monitoring, Settings, and System APIs to use `createValidatedInvoker` for strictly-typed response verification
 - 📝 Expand shared Zod schemas to cover cloud migrations, status summaries, and synchronization results

🛠️ [fix] Strengthen IPC parameter validation to mitigate potential prototype pollution vulnerabilities
 - 🚫 Implement `getForbiddenRecordKeyErrors` to block reserved keys like `__proto__` and `constructor` in record validation

⚡ [perf] Optimize React frontend performance by minimizing component re-renders
 - 🧪 Apply `useShallow` selectors in `App.tsx` and `useSiteDetails.ts` to ensure components only update when relevant store slices change

🚜 [refactor] Improve robustness of store event subscription and cleanup logic
 - 🔄 Implement reference counting for update status event listeners to prevent duplicate registrations and ensure proper disposal
 - 🐛 Resolve a race condition in site synchronization where cleanup could occur prematurely during subscription setup

✨ [feat] Refine shared TypeScript definitions for better null safety and validation coverage
 - 🔍 Enhance `isValidationResult` guard with stricter checks for errors, metadata, and success flags
 - 🏗️ Standardize `StatusUpdate` and `CloudStatusSummary` types with explicit undefined properties

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bb423d3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bb423d315d543acbc735508af36917534bd6fd58)


- 🔧 [build] Refactor media query handling and improve error management

 - 🎨 [style] Standardize media query usage with new utility functions
   - Introduced `getMediaQueryMatches`, `tryGetMediaQueryList`, and `subscribeToMediaQueryMatches` for consistent media query handling across components.
   - Centralized media query logic to avoid duplication and improve maintainability.

 - 🛠️ [fix] Enhance error handling in file download process
   - Added `FileDownloadDomAttachmentError` to specifically handle DOM attachment failures during file downloads.
   - Updated `clickDownloadAnchor` to throw this new error for better clarity on failure reasons.

 - ⚡ [perf] Optimize sidebar collapse behavior
   - Replaced direct media query checks with `getMediaQueryMatches` in `AppSidebar` and `usePrefersReducedMotion` hooks for improved performance and readability.
   - Introduced `SIDEBAR_COLLAPSE_MEDIA_QUERY` constant for better maintainability of sidebar collapse logic.

 - 📝 [docs] Update comments and documentation for clarity
   - Improved JSDoc comments across various functions to better describe their purpose and usage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f6df058)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f6df0588e6d1e607b3c6b6c11b2abd1ebc43c213)


- 🔧 [build] Optimize build process and improve path handling

 - 🛠️ Increase Node.js memory limit to prevent build failures on macOS arm64
 - 📝 Add `normalizePathSeparatorsToWindows` function for converting POSIX paths to Windows format
 - 🔄 Refactor `isWindowsDeviceNamespacePath` to utilize the new path normalization function
 - 🎨 Rename `linkReference` to `linkRef` for consistency in `ScreenshotThumbnail` component

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fb93d1d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fb93d1dc4a0e30d8291cca9efa012f2c84baa004)


- 🔧 [build] Update dependencies in package.json
 - 🔄 Upgrade `zod` from `^4.2.1` to `^4.3.2` for improved type safety and validation features.
 - 🔄 Upgrade `@eslint-react/eslint-plugin` from `^2.4.0` to `^2.5.0` for enhanced linting capabilities.
 - 🔄 Upgrade `@html-eslint/eslint-plugin` from `^0.52.0` to `^0.52.1` for bug fixes and improvements.
 - 🔄 Upgrade `@putout/eslint` from `^5.0.0` to `^5.0.2` and `@putout/eslint-flat` from `^3.0.3` to `^3.0.5` for better linting performance.
 - 🔄 Upgrade `@storybook/addon-designs` from `^11.1.0` to `^11.1.1` for compatibility with the latest Storybook features.
 - 🔄 Upgrade `eslint-plugin-package-json` from `^0.85.0` to `^0.87.0` for improved package.json linting.
 - 🔄 Upgrade `eslint-plugin-perfectionist` from `^5.1.0` to `^5.2.0` for better code quality checks.
 - 🔄 Upgrade `eslint-plugin-putout` from `^29.1.2` to `^29.2.2` for enhanced linting rules.
 - 🔄 Upgrade `eslint-plugin-react-dom` from `^2.4.0` to `^2.5.0` for improved React DOM linting.
 - 🔄 Upgrade `eslint-plugin-testing-library` from `^7.15.3` to `^7.15.4` for better testing practices.
 - 🔄 Upgrade `fast-check` from `^4.5.2` to `^4.5.3` for enhanced property-based testing capabilities.
 - 🔄 Upgrade `putout` from `^41.1.2` to `^41.3.3` for improved code transformation features.
 - 🔄 Upgrade `vite-plugin-mcp` from `^0.3.1` to `^0.3.2` for better Vite integration.

🛠️ [fix] Refactor safePropertyAccess function
 - 🔄 Remove special-case handling for array length access to simplify the function logic.
 - 🔄 Ensure that the function only checks for properties in records, improving maintainability.

✨ [feat] Add path separator normalization utility
 - ✨ Introduce `normalizePathSeparatorsToPosix` function to convert Windows path separators (`\`) to POSIX separators (`/`).
 - 📜 Document the function to clarify its purpose and usage, emphasizing that it only performs separator normalization.

🧪 [test] Update fuzzing tests for typeHelpers
 - 🔄 Modify tests to directly access array properties instead of using safePropertyAccess for length checks, improving clarity and accuracy.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1ad5b30)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1ad5b30a47da5247a32039f099326ca0dc2b5110)


- 🔧 [build] Enhance cloud backup metadata handling and validation

 - 🛠️ [fix] Update last reviewed date in Boundary Validation Strategy documentation
 - 🚜 [refactor] Simplify cloud backup metadata parsing by integrating Zod validation
 - 🛠️ [fix] Improve error handling in cloud backup listing to log invalid metadata
 - 📝 [docs] Add validation schemas for cloud backup entries and serialized database metadata
 - 🧪 [test] Add tests for schema validation of import data and cloud backup entries

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4fd0724)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4fd0724d42e6c9816ae308713a48c00ebf47f8b9)


- 🔧 [build] Refactor backup size constants and improve error handling
 - 🛠️ [fix] Move DEFAULT_MAX_BACKUP_SIZE_BYTES to shared constants for consistency across processes
 - 🚜 [refactor] Update imports to use shared backup constants in database and IPC validators
 - 🛠️ [fix] Introduce CloudSyncCorruptRemoteObjectError for better error handling in cloud sync operations
 - 🚜 [refactor] Enhance error handling in ProviderCloudSyncTransport for JSON validation and size limit checks
 - 🎨 [style] Rename maxResponseTime to maxResponseTimeMs for clarity in AddSiteForm and related components
 - 🧪 [test] Update tests to reflect changes in maxResponseTime to maxResponseTimeMs across various test files

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2bc5e79)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2bc5e798269f5875c6ecaf394b5be76563e57440)


- 🔧 [build] Update local state properties for check interval and timeout

 - 🛠️ [fix] Change localCheckInterval to localCheckIntervalMs in multiple components to reflect milliseconds instead of seconds.
 - 🛠️ [fix] Change localTimeout to localTimeoutSeconds in multiple components to clarify that the value is in seconds.
 - 🛠️ [fix] Update related hooks and services to ensure consistency with the new naming conventions for check interval and timeout.
 - 🧪 [test] Modify tests to use the updated localCheckIntervalMs and localTimeoutSeconds properties, ensuring all tests reflect the new state structure.
 - 🧪 [test] Adjust comprehensive and fuzzing tests to validate the new properties and their expected behaviors.
 - 🎨 [style] Refactor SettingItem component to support optional icon properties for better customization.
 - 🚜 [refactor] Simplify icon rendering logic in SettingItem for improved performance and readability.
 - 📝 [docs] Update comments and documentation to clarify the purpose of new properties and their expected units.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a3ffb6c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a3ffb6c5150ac6ec170cd309570aba60464fc346)






## [19.6.0] - 2025-12-15


[[baab69a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/baab69a04788758ee330477adcf1162dbc126d1d)...
[1570ad4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1570ad477286705b78440c5d7594839521ec36ff)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/baab69a04788758ee330477adcf1162dbc126d1d...1570ad477286705b78440c5d7594839521ec36ff))


### ✨ Features

- ✨ [feat] Implement backup deletion functionality in CloudService and useCloudStore
 - Added `deleteBackup` method to `CloudServiceContract` for removing backups by key.
 - Implemented `deleteBackup` in `CloudService` to handle backup deletion logic.
 - Updated `useCloudStore` to include `deleteBackup` action, managing loading state and updating backups list.
 - Introduced `deletingBackupKey` state to track the key of the backup being deleted.
 - Enhanced error handling during backup deletion process.

📝 [test] Add comprehensive tests for backup deletion functionality
 - Created tests for `BackupMigrationPanel` to ensure UI reflects backup migration status correctly.
 - Developed tests for `SyncMaintenancePanel` to validate sync reset operations and diagnostics copying.
 - Added tests for `PromptDialog` to cover user interaction scenarios.
 - Implemented comprehensive tests for `useCloudStore` to verify backup deletion and related state updates.

🎨 [style] Refactor CloudService and useCloudStore for improved readability
 - Cleaned up async/await usage in `CloudService` methods for consistency.
 - Enhanced code formatting and structure in `useCloudStore` for better maintainability.
 - Adjusted test files for consistent formatting and improved clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1570ad4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1570ad477286705b78440c5d7594839521ec36ff)


- ✨ [feat] Enhance cloud sync and backup functionality
 - 📝 Update documentation to include Dropbox Cloud Sync setup guide
 - 📝 Add Cloud Sync & Backups IPC section in API documentation
 - 🛠️ Refactor CloudStorageProvider imports to use types file
 - 🛠️ Implement new loopback port for Dropbox OAuth in DropboxAuthFlow
 - 🛠️ Update CloudService tests to cover new backup migration and sync reset features
 - 🛠️ Add data-testid prop to ThemedButton for improved testing

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4c095b4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4c095b44d6aabb93eb7c6ac6b1cc4c0d4234f842)


- ✨ [feat] Implement cloud backup functionality and related tests
 - 🛠️ [fix] Add cloud-related methods to ElectronAPI interface
 - 🔧 [build] Mock cloud settings in tests to isolate functionality
 - 🧪 [test] Create comprehensive tests for CloudService, covering initialization, status retrieval, sync enabling, and backup management
 - 🧹 [chore] Refactor logger tests to improve clarity and ensure proper mocking
 - 📝 [docs] Update comments and documentation for clarity on cloud sync operations
 - 🎨 [style] Enhance icon imports to include cloud-related icons for UI consistency
 - 🚜 [refactor] Clean up unused mock functions and streamline test setup for better maintainability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9caec2f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9caec2fba80fe0d0988a45a3edb56be43eb0cd1d)


- ✨ [feat] Integrate cloud backup and synchronization features
 - 🆕 Added `cloudApi` to the Electron preload script to expose cloud functionalities to the renderer process.
 - 🛠️ Introduced `CloudService` in the service container to manage cloud-related operations.
 - 🔌 Updated `IpcService` to register cloud IPC handlers for backup and synchronization tasks.
 - 📦 Created validators for cloud IPC handlers to ensure correct parameter types and structures.
 - 🌐 Enhanced `WindowService` to restrict navigation and handle external links securely.
 - 📝 Updated documentation to reflect changes in cloud backup and restore processes.
 - 🧪 Added comprehensive tests for `IpcService` to cover new cloud functionalities.
 - 🧪 Updated tests for `useMonitorFields` to ensure error handling integrates with the new cloud features.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(52929fc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/52929fca10ff7305605e42ab521eb02b59fd1c90)


- ✨ [feat] Implement site notification mute functionality
 - 🛠️ [fix] Update SettingsSection component to use more descriptive interface names
 - 🔧 [build] Integrate muted site notification identifiers into settings store
 - ✨ [feat] Add mute/unmute button for site notifications in SettingsTab
 - 📝 [docs] Update constants to reflect unlimited history retention logic
 - ⚡ [perf] Refactor site monitoring actions to use async/await for better error handling
 - 🧪 [test] Enhance tests for notification preferences synchronization and settings updates
 - 🎨 [style] Clean up code formatting and improve readability across multiple files

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(baab69a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/baab69a04788758ee330477adcf1162dbc126d1d)



### 🛠️ Bug Fixes

- 🛠️ [fix] Refactor error handling in useMonitorTypesStore and related tests
 - 🧪 [test] Integrate useErrorStore for error management in useMonitorTypesStore tests
 - 🔧 [build] Update tests to check error states using useErrorStore instead of local state
 - 🧪 [test] Ensure loading states are managed through useErrorStore
 - 🧪 [test] Modify tests to validate error messages from useErrorStore
 - 🧪 [test] Adjust test descriptions for clarity on error handling
 - 🧪 [test] Remove redundant error handling methods from useMonitorTypesStore
 - 🧪 [test] Ensure comprehensive coverage of error handling scenarios

🎨 [style] Update event listener names in site sync tests
 - 🔧 [build] Change listener names to use a consistent naming convention

📝 [docs] Improve IPC usage documentation in ipc.ts
 - 🔧 [build] Clarify usage of ipcRenderer and suggest using typed invokers

🚜 [refactor] Clean up monitorValidation utility
 - 🔧 [build] Remove unused constants and streamline validation logic

🧹 [chore] Optimize Storybook preview setup
 - 🔧 [build] Refactor environment variable handling for better type safety

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(85d4258)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/85d425825adb858da3603c6bcb52d23475566174)



### 🎨 Styling

- 🎨 [style] Apply consistent formatting across the codebase

This commit introduces a large-scale, automated code formatting pass to enhance consistency and readability across the entire project.

🎨 [style] Implements widespread code formatting adjustments.
 - Removes redundant trailing parentheses from multi-line arrow functions, array literals, method calls, and object instantiations. This affects a significant number of files, particularly within benchmarks and the Electron application source.
 - Standardizes multi-line array and object initializations to improve visual structure.

📝 [docs] Simplifies JSDoc type definitions.
 - Converts multi-line JSDoc type definitions into concise single-line formats in linting configurations (`.remarkrc.mjs`, `uptime-watcher.mjs`) for improved clarity.

🧹 [chore] Performs minor configuration and file cleanup.
 - Adds a trailing newline to `.codecov.yml` for consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(814e408)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/814e408a876eae39dac2cf6736fb0a6fa93bc310)



### 🔧 Build System

- 🔧 [build] Update package.json and dependencies
 - 🛠️ Remove unused `storybook:test-server` script from package.json
 - 🔄 Update test scripts to replace `test:storybook:runner` with `test:playwright`
 - 🔄 Update `markdown-to-jsx` dependency from `^9.3.3` to `^9.3.4`
 - 🧹 Remove `start-server-and-test` dependency from package.json

🛠️ [fix] Adjust TypeScript configuration for Playwright
 - 🔄 Change `skipLibCheck` from `false` to `true` in `playwright/tsconfig.json` for improved type checking

🚜 [refactor] Modify environment comprehensive coverage test
 - 🔄 Change type of `originalProcess` from `typeof globalThis.process` to `any` to avoid type conflicts with Node's evolving Process type

🎨 [style] Reorganize imports in HistoryTab component
 - 🔄 Move import of `DEFAULT_HISTORY_LIMIT_RULES` to the correct position in `HistoryTab.tsx`

📝 [docs] Improve documentation in DataService
 - 🔄 Enhance comments in `DataService.ts` for clarity on error handling and logging

📝 [docs] Clarify validation error message formatting
 - 🔄 Update comments in `validation.ts` to improve readability of error message patterns

🧪 [test] Update HistoryTab stories for better readability
 - 🔄 Refactor test assertions in `HistoryTab.stories.tsx` to use `void expect(...)` for clarity

🧪 [test] Refactor Settings stories to improve test assertions
 - 🔄 Update assertions in `Settings.stories.tsx` to use `void expect(...)` for consistency

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(19c593f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/19c593f58f2fea257d4b605649a34af6265a5ac9)


- 🔧 [build] Update monitoring services and validation logic

 - ✨ [feat] Enhance `HttpJsonMonitor` by adding a missing import for `isRecord`.
 - 🛠️ [fix] Improve timeout resolution in `MonitorScheduler` to ensure `timeoutMs` is finite and greater than zero.
 - ⚡ [perf] Normalize retry attempts in `performPingCheckWithRetry` to ensure valid values are used and improve error handling.
 - 🛠️ [fix] Refactor `createAbortableOperation` in `abortUtils` to streamline abort handling during sleep operations.
 - 📝 [docs] Update comments in `monitorStatusEvents` for clarity and consistency.
 - 🧹 [chore] Modify `sonar-project.properties` to include additional test directories and improve duplication and security exclusions.
 - 🎨 [style] Adjust `StatusAlertToast` to return structured timestamp data for better readability.
 - 🚜 [refactor] Consolidate state management in `useSiteDetails` to track user edits more effectively across multiple monitors.
 - 🛠️ [fix] Update `DataService` to utilize a new validation helper for consistent error handling.
 - 🛠️ [fix] Modify `EventsService` to log active monitors instead of paused ones for better clarity.
 - 🛠️ [fix] Update `MonitorTypesService` to use the new validation helper for payload validation.
 - 🛠️ [fix] Simplify `NotificationPreferenceService` by removing unnecessary bridge checks and directly using the API.
 - 🎨 [style] Improve logging messages in `SettingsService` for better clarity on history limit updates.
 - ✨ [feat] Introduce a new utility file for shared validation helpers to streamline service validations.
 - 🧪 [test] Update tests for `NotificationPreferenceService` to reflect changes in error handling and improve coverage.
 - 🧪 [test] Refactor tests in `useTheme` to simplify mock implementations and improve readability.
 - 🧪 [test] Enhance tests for `pingRetry` utilities to ensure proper routing and error handling.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(214bb42)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/214bb42c802dcc4caf5872e3f78f6f0b37194789)


- 🔧 [build] Update dependencies and package manager version
 - Updated "@eslint-react/eslint-plugin" from "^2.3.12" to "^2.3.13"
 - Updated "@storybook/addon-a11y" from "^10.1.4" to "^10.1.5"
 - Updated Storybook related packages from "^10.1.4" to "^10.1.5"
 - Updated "eslint-plugin-react-dom" from "^2.3.12" to "^2.3.13"
 - Updated "eslint-plugin-react-hooks-extra" from "^2.3.12" to "^2.3.13"
 - Updated "eslint-plugin-react-naming-convention" from "^2.3.12" to "^2.3.13"
 - Updated "eslint-plugin-react-web-api" from "^2.3.12" to "^2.3.13"
 - Updated "eslint-plugin-storybook" from "^10.1.4" to "^10.1.5"
 - Updated "knip" from "^5.72.0" to "^5.73.0"
 - Updated "markdown-to-jsx" from "^9.3.2" to "^9.3.3"
 - Updated "storybook" from "^10.1.4" to "^10.1.5"
 - Updated package manager from "npm@11.6.4" to "npm@11.7.0"

🛠️ [fix] Improve error handling in various components
 - Replaced manual error handling with `ensureError` utility in `App.tsx`, `alertCoordinator.ts`, and `hydration.ts` for better consistency and readability
 - Ensured all caught errors are normalized to `Error` instances

🚜 [refactor] Consolidate type checking utility functions
 - Removed redundant `isRecord` function in `loggingContext.ts`, `monitorStatusEvents.ts`, `operations.ts`, `fileDownload.ts`, `operationHelpers.ts`, and `ipc.ts`
 - Replaced with shared `isRecord` utility from `typeHelpers.ts` to promote code reuse

🎨 [style] Clean up code formatting and comments
 - Removed unnecessary public tag in `useThemeStyles.ts`
 - Adjusted comments in `useTheme.ts` for clarity on parameter descriptions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4beb588)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4beb5888dee79fa257d481c7ed8421a73cb81266)






## [19.2.0] - 2025-12-08


[[c851e5a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c851e5a3cfe62b34ef946fabecb6742b8623f0e2)...
[ba94cc6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ba94cc68427605be82be1a2071febe16c69984f7)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/c851e5a3cfe62b34ef946fabecb6742b8623f0e2...ba94cc68427605be82be1a2071febe16c69984f7))


### ✨ Features

- ✨ [feat] Enhance various components and documentation

 - 📝 [docs] Add comprehensive overview for Sites Store and State Sync
 - 🔧 [build] Update tools in BeastMode agent for improved functionality
 - 🛠️ [fix] Adjust preRestoreFileName type in SerializedDatabaseRestoreResult for clarity
 - 🛠️ [fix] Improve validation logic in DataService for database restore operations
 - 🛠️ [fix] Refine environment variables documentation for better understanding
 - 🎨 [style] Clean up type guards and validation utilities for consistency
 - 🛠️ [fix] Update NotificationPreferenceService to include runtime checks for better error handling
 - 🧪 [test] Enhance monitor validation tests to ensure accurate type handling

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ba94cc6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ba94cc68427605be82be1a2071febe16c69984f7)


- ✨ [feat] Enhance notification preferences validation and data handling
 - 🛠️ Refactor `validateNotificationPreferences` to utilize `validateNotificationPreferenceUpdate` for improved validation logic
 - 🔧 Introduce `notificationPreferenceUpdateSchema` for structured validation of notification preferences
 - 🛠️ Update `NotificationPreferenceService` to validate preferences before updating, ensuring data integrity

🚜 [refactor] Improve data service error handling and validation
 - 🔧 Implement `runDataOperation` for consistent error handling across data operations
 - 🛠️ Add `validateAndUnwrap` function to streamline validation of serialized database results
 - ⚡ Enhance `DataService` methods to validate responses from IPC calls, ensuring they conform to expected schemas

🧪 [test] Expand test coverage for data service and monitor types store
 - 🛠️ Update tests to reflect changes in validation logic and error handling
 - 🎨 Refactor tests for clarity and maintainability, ensuring they accurately reflect the new validation structure

✨ [feat] Introduce comprehensive validation schemas for database operations
 - 🔧 Add `dataSchemas.ts` to define schemas for serialized database backup and restore operations
 - 🛠️ Implement validation functions for these schemas to ensure data integrity during operations

🎨 [style] Clean up code formatting and comments for better readability
 - ⚡ Remove unnecessary comments and improve inline documentation for clarity

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(de2f15a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de2f15aab6b010978b3d635e20963b18137ba9d6)


- ✨ [feat] Enhance SQLite Backup and Restore Functionality
 - 🛠️ Update `downloadSqliteBackup` to return detailed metadata including `appVersion`, `checksum`, `retentionHintDays`, and `schemaVersion`.
 - 🛠️ Implement `restoreSqliteBackup` to provide comprehensive metadata upon restoring, ensuring consistency with backup metadata.
 - 🔧 Modify `createMockSitesStore` and related mocks to include new metadata fields for backups and restores.
 - 🧪 Add tests for `restoreSqliteBackup` in `DataService` to verify successful restoration and error handling.
 - 🧪 Enhance existing tests across various services and stores to validate the new metadata structure in backup and restore operations.
 - 🧪 Update Storybook mocks to reflect changes in backup and restore functionalities, ensuring accurate representation in UI components.
 - 📝 Update IPC types to include new serialized structures for backup and restore operations, improving type safety and clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a29fc68)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a29fc687b8de09eb61b505bd77af8da7e8322478)


- ✨ [feat] Enhance testing configurations and add property-based tests
 - 🧪 [test] Update tsconfig to include strict test directories for better coverage
 - 🧪 [test] Introduce fast-check for property-based testing in monitor operations and validation schemas
 - 🧪 [test] Add comprehensive property tests for monitor identifiers and status validation
 - 🧪 [test] Improve test coverage for monitor operations with randomized input testing
 - 🧪 [test] Extend vitest configuration to include strict test directories

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c851e5a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c851e5a3cfe62b34ef946fabecb6742b8623f0e2)



### 🛠️ Bug Fixes

- 🛠️ [fix] Improve type guard functions and tests
 - 🔧 Update `isPositiveNumber` to check for finite values, ensuring it returns false for `Infinity`
 - 🔧 Modify `isSerializedDatabaseBackupResult` to return true if `metadata` is undefined
 - 🔧 Refactor type guard tests to simplify array checks, removing unnecessary multiline formatting
 - 🔧 Enhance `hasProperties` checks in tests for better readability
 - 🔧 Adjust `toIsoStringSafe` function to handle invalid dates gracefully in IPC tests
 - 🔧 Update environment utility to allow testing overrides for process snapshots
 - 🔧 Ensure `isNonNullObject` and `isObject` return false for arrays, improving type safety
 - 🔧 Fix various test cases to ensure they accurately reflect expected behavior for type guards
 - 🔧 Clean up console error handling in test setup to suppress CSS parse warnings more effectively

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(05dabb3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/05dabb3d25e490f6d993087acb5124e2e9dee21d)


- 🛠️ [fix] Update type guard tests for improved clarity and coverage
 - 🔧 Refactor test objects in `typeGuards.comprehensive.test.ts` for better naming consistency
 - 🔧 Ensure all type guard functions are tested with relevant sample data
 - 🔧 Add false case tests to validate type guard functions thoroughly

📝 [docs] Enhance documentation in `SettingsService.ts`
 - 📜 Add detailed explanations regarding validation behavior for history limits
 - 📜 Clarify the return values and error handling in the `updateHistoryLimit` method

🧪 [test] Improve comprehensive tests for `SiteDetails` component
 - 🔧 Fix rerendering logic in `SiteDetails.comprehensive.test.tsx` to ensure accurate testing of component updates

🧪 [test] Enhance `useAddSiteForm` hook tests
 - 🔧 Normalize values in `useAddSiteForm.comprehensive.test.ts` to ensure consistent state updates

🧪 [test] Expand coverage in `objectSafety-coverage.test.ts`
 - 🔧 Introduce property-based tests using `fast-check` for various object safety utilities
 - 🔧 Validate behavior of `safeObjectAccess`, `safeObjectIteration`, `safeObjectOmit`, and `safeObjectPick` functions

🧪 [test] Add property-based tests for store utility functions
 - 🔧 Implement property-based tests in `utils.test.ts` to validate logging behavior under various conditions

🧪 [test] Enhance type guard utility tests with property-based testing
 - 🔧 Introduce property-based tests in `typeguard-utility-test.test.ts` to validate property existence and absence in objects

🧪 [test] Improve JSON safety tests with advanced fuzzing
 - 🔧 Update `jsonSafety.advanced-fuzzing.test.ts` to test performance with varied payloads

🧪 [test] Add property-based tests for site deletion functionality
 - 🔧 Implement tests in `siteDeletion.test.ts` to validate deletion behavior with various site identifiers and monitor arrays

🧪 [test] Refactor monitor identifier tests for clarity
 - 🔧 Remove unnecessary character arrays in `monitorIdentifiers.test.ts` to streamline test setup

🎨 [style] Clean up fast-check configuration
 - 🔧 Remove unnecessary whitespace in `fastcheckConfig.ts` for improved readability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9b07a14)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9b07a1471b4e52d090c56f7f472c2867c618c515)



### 🚜 Refactor

- 🚜 [refactor] Decompose UptimeOrchestrator into specialized coordinators

This commit introduces a major refactoring of the `UptimeOrchestrator` to improve modularity, separation of concerns, and maintainability. Its core responsibilities have been delegated to new, specialized coordinator classes.

### 🚜 [refactor] Orchestrator Decomposition
- Extracts business logic from `UptimeOrchestrator` into three new coordinators:
    - 🔀 `SiteLifecycleCoordinator`: Manages the lifecycle of sites and monitors (add, remove, delete all). Encapsulates transactional logic with compensation for failures.
    - 🔄 `MonitoringLifecycleCoordinator`: Handles the state of monitoring operations (start, stop, restart, resume, manual checks).
    - 💾 `SnapshotSyncCoordinator`: Orchestrates state synchronization, cache updates, and snapshot management between processes.
- The `UptimeOrchestrator` now acts as a high-level conductor, wiring together managers and coordinators and delegating tasks.

### 🚜 [refactor] IPC Handler Organization
- Decomposes the monolithic IPC handler setup in `IpcService` into domain-specific registration functions.
- Each functional area (sites, monitoring, data, settings, etc.) now has its own handler registration file in `electron/services/ipc/handlers/`, making the `IpcService` cleaner and easier to manage.

### 🚜 [refactor] Monitor Checking Strategy
- Introduces the Strategy pattern for executing monitor checks in `EnhancedMonitorChecker`.
- Creates a `MonitorStrategyRegistry` to map monitor types to their corresponding check service implementations.
- Implements `MonitorOperationCoordinator` to centralize the logic for initiating, tracking, and timing out monitor check operations.

### 📝 [docs] Update Project Documentation
- Updates dependency locks and versions for the Docusaurus documentation site.
- Corrects documentation to reflect the refactoring of validation schemas into separate `siteSchemas` and `monitorSchemas` files.

### 🎨 [style] Refine Prettier Configuration
- Moves Prettier plugin definitions from the global scope into file-specific `overrides`. This ensures plugins only operate on relevant file types, improving performance and accuracy.
- Adds new overrides for SQL, Shell, Properties, and INI files.
- Removes the `prettier-plugin-multiline-arrays` plugin.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e8fb7f0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e8fb7f0c945c8378e59f335bd1efac012e7fdba4)


- 🚜 [refactor] Overhaul application-wide TypeScript typings

This commit introduces a massive, systematic refactoring to strengthen TypeScript typings across the entire application, guided by a comprehensive typing audit. The primary goal is to eliminate or tightly constrain `any`, `unknown`, and `UnknownRecord` types in favor of specific, branded, and validated types, thereby improving code safety, maintainability, and developer experience.

✨ [feat] Core System Enhancements
 - 🚌 **Typed Event Bus**
   - Enforces `EventPayloadValue` so all event payloads are primitives, plain objects, or arrays, preventing emission of functions, class instances, and other non-serializable values.
   - Defensively clones array/object payloads before emission so no listener can mutate shared state seen by other listeners.
   - Attaches metadata (`_meta`, `_originalMeta`) as non-enumerable properties on payloads, preserving payload shape while still enabling correlation and tracing across processes.
   - Passes a fully typed middleware context (including event name, payload type, correlation metadata, and bus identifiers) into all event middleware, improving safety for rate limiting, logging, and diagnostics.

✨ [feat] Branded & Validated Types
 - 🏷️ **Branded Units & IDs**
   - Introduces branded units such as `TimeoutMilliseconds` and `CheckIntervalMilliseconds` plus helpers that enforce shared min/max constraints at runtime, ensuring safe time-based configuration everywhere.
   - Adds a branded `CorrelationId` type and `generateCorrelationId()` utility in the Electron layer so event bus metadata uses strong, non-guessable IDs instead of arbitrary strings.
   - Adds an internal branded `OperationId` type for operational hooks, ensuring operation identifiers are only produced by the dedicated generator while remaining fully compatible with logging and JSON.
   - Uses composable utility patterns like “require-all-or-none” / “require-at-least-one” to model invariants on complex configuration objects and reduce invalid partial states.

✨ [feat] Error Handling & Serialization
 - ⚙️ **Consistent Error Serialization**
   - Enhances `errorSerialization` helpers so all thrown `unknown` values are normalized into a `SerializedError` shape, which is then used consistently across logs, IPC responses, and tests.
   - Tightens `jsonSafety` around `JsonValue` / `Jsonifiable` unions, ensuring only JSON-safe values flow into serialization helpers and that non-serializable values produce clear error/fallback results.

✨ [feat] Operational Hooks & Context
 - 🪝 **Typed Operational Context**
   - Introduces a branded `OperationalHookContext` that carries immutable, typed metadata through `withOperationalHooks` and `withDatabaseOperation`, reducing reliance on ad-hoc `Record<string, unknown>` blobs.
   - Strengthens lifecycle telemetry for retries, failures, and completions by threading `OperationId`, duration, log level, and context through typed helper functions and centralized logging logic.

🚜 [refactor] Electron & Shared Code Refactoring
 - 💾 **Database Interactions**
   - Adds type-safe query helpers (`querySiteRows`, `querySiteRow`, `queryMonitorRows`, `queryMonitorRow`, `queryHistoryRows`, `queryHistoryRow`, `querySettingsRows`, `querySettingsRow`) that validate SQLite rows using shared guards (`isValidSiteRow`, `isValidMonitorRow`, `isValidSettingsRow`, `isValidHistoryRow`) instead of scattered `as` casts.
   - Introduces `RowValidationOptions` plus `ensureValidRow` / `ensureValidRows` utilities to centralize row validation, provide better error messages, and reduce duplicated validation logic across repositories.
   - Narrows helper result types such as `CountResult` and `IdOnlyResult` from `UnknownRecord` to concrete `{ count: number }` / `{ id: number }` interfaces so callers cannot accidentally rely on undeclared fields.
   - Normalizes legacy monitor schemas (e.g. `monitor_id`, `monitor_type`, `timeout_ms`, `interval_ms`) into the canonical `MonitorRow` shape before validation, allowing older migrations to coexist with stricter current typings.

 - 🧱 **Monitor Mapping & Dynamic Schema**
   - Refactors `dynamicSchema` and `monitorMapper` to use structured field-mapping helpers for standard and dynamic fields, reducing error-prone manual key juggling.
   - Replaces ad-hoc `Number(...)` conversions with `safeInteger` and explicit bounds for `checkInterval`, `timeout`, `responseTime`, and `retryAttempts`, preventing NaN or out-of-range numeric values from leaking into domain models.
   - Validates `activeOperations` by parsing JSON and guarding with `isValidIdentifierArray`, logging warnings and falling back to an empty array whenever data is malformed or unsafe.

 - 📡 **IPC System**
   - Enforces typed IPC handlers through `IpcInvokeChannel`, `IpcInvokeChannelParams`, and `IpcInvokeChannelResult`, so Electron main handlers no longer rely on manual parameter/result casting.
   - Centralizes validation using `IpcValidators` (`requiredString`, `requiredNumber`, `requiredBoolean`, `requiredObject`, `requiredUrl`, etc.) and `withIpcHandlerValidation`, ensuring all handlers return a consistent `IpcResponse<T>` envelope on success or failure.
   - Introduces `IpcHandlerMetadata` to capture diagnostics (channel name, duration, param count, validation errors) in a structured, typed way, while keeping the public `IpcResponse.metadata` as a generic `UnknownRecord` for flexibility.
   - Adds shared diagnostics log metadata types (`IpcHandlerVerificationLogMetadata`, `PreloadGuardDiagnosticsLogMetadata`) in ipc.ts and uses them in `IpcService` for structured logging of missing handlers and preload guard failures.
   - Keeps diagnostics payload types (`IpcHandlerVerificationResult`, `PreloadGuardDiagnosticsReport`, `IpcDiagnosticsEvent`) in the shared IPC module as the single source of truth for diagnostics contracts consumed by main, preload, and renderer.

 - 🩺 **Monitoring Services**
   - Standardizes monitor configuration via `MonitorServiceConfig` (derived from shared `Monitor` types) so all monitor implementations (HTTP, ping, ports, DNS, SSL, latency, etc.) consume a unified configuration contract.
   - Aligns `EnhancedMonitorChecker` and related monitoring services with shared types for status updates, history entries, and operation metadata, reducing divergence between renderer, Electron, and shared layers.
   - Routes monitor validation through shared schema helpers and consistent status update structures, ensuring invalid configurations are caught early and reported with typed metadata.

 - 📊 **Events & Metadata Forwarding**
   - Wires the typed event bus, middleware, and metadata-forwarding utilities to use shared `EventMetadata` plus the new branded `CorrelationId` end-to-end.
   - Strengthens `eventMetadataSchema` with a dedicated `correlationId` Zod schema that accepts strings and brands them as `CorrelationId` in TypeScript, preserving runtime JSON behavior while satisfying strict typing.
   - Ensures forwarded event payloads carefully strip and reattach metadata (`_meta`, `_originalMeta`) in a controlled manner, preserving original emission context while updating forwarded event names and timestamps.

🎨 [style] Frontend & UI Improvements
 - 🐻 **Zustand & Site/Monitor Stores**
   - Refactors site and monitor Zustand slices to use shared typed identifiers and snapshot overlays instead of loose `Record<string, unknown>` maps, improving safety for optimistic updates and synchronization.
   - Introduces typed operation-helper contexts for site operations (base/pending/success/failure metadata), making it easier for UI code to reason about operation state without ad-hoc context objects.

 - ⚛️ **Component & Hook Typing**
   - Replaces generic `Record<string, unknown>` and raw `string` props in key components and hooks with shared domain types (e.g. monitor form data, site snapshots, status helpers), reducing duplication and drift.
   - Ensures theme and status utilities (`useTheme`, status icon/color helpers) consume shared status enums and theme configuration types, keeping the renderer aligned with shared configuration models.

📝 [docs] Documentation and Audits
 - 📜 **Typing Audit Artifacts**
   - Adds/updates `TYPING_AUDIT_HISTORY.md` with a detailed record of the typing audit: what was tightened, what remains intentionally generic, and where future refactors are planned (e.g. splitting `IpcService` and decomposing `EnhancedMonitorChecker`).
   - Documents new branded types (`CorrelationId`, `TimeoutMilliseconds`, etc.) and shared helper modules (`jsonSafety`, `siteSnapshots`, type guards, units) so future contributors understand the invariants enforced by this refactor.

 - 💅 **Supporting Docs & Examples**
   - Updates ADR examples to reflect the new event bus middleware and rate limiting APIs.
   - Keeps developer-facing documentation in sync with the stricter typed IPC and monitoring contracts now enforced across the stack.

🧪 [test] Test Suite Modernization
 - 🔬 **Typed Test Data & Fuzzing**
   - Updates dozens of unit, integration, and fuzz tests to use the new typed event payloads, IPC contracts, and monitor configurations (`MonitorServiceConfig`, `EventMetadata`, `IpcResponse`) as first-class citizens instead of untyped fixtures.
   - Aligns JSON fuzz/property tests with *actual* JSON semantics for edge cases like `-0` vs `0` by comparing against `JSON.parse(JSON.stringify(sample))` (the normalized JSON representation) rather than the raw sample, ensuring helpers behave like native JSON rather than asserting impossible invariants.
   - Fixes the `safeParseCheckInterval` fuzz property to match real runtime semantics:
     - Intervals are truncated to integer milliseconds,
     - Values are clamped to `MAX_TIMEOUT_MILLISECONDS`,
     - Non-finite values (e.g. `Infinity`, `-Infinity`) fall back to the provided default instead of leaking invalid numbers into the system.
   - Strengthens IPC and diagnostics tests to account for branded IDs and structured metadata, verifying that correlation IDs, handler diagnostics, and preload guard reports preserve their fully typed shapes through logging and IPC round-trips.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3e34403)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e34403589d8dbbd436473401a7d17434e845c70)



### 🔧 Build System

- 🔧 [build] Update dependencies in package.json
 - 📦 Upgrade `node-sqlite3-wasm` from `0.8.51` to `0.8.52`
 - 📦 Upgrade `react` and `react-dom` from `19.2.0` to `19.2.1`
 - 📦 Upgrade `@awmottaz/prettier-plugin-void-html` from `1.9.0` to `1.10.0`
 - 📦 Upgrade `@eslint-react/eslint-plugin` from `2.3.11` to `2.3.12`
 - 📦 Upgrade `@storybook/addon-*` packages from `10.1.3` to `10.1.4`
 - 📦 Upgrade `electron` from `39.2.4` to `39.2.5`
 - 📦 Upgrade `eslint-plugin-es-x` from `9.2.0` to `9.3.0`
 - 📦 Upgrade `eslint-plugin-putout` from `29.0.1` to `29.0.2`
 - 📦 Upgrade `eslint-plugin-react-dom` from `2.3.11` to `2.3.12`
 - 📦 Upgrade `markdownlint` from `0.39.0` to `0.40.0`
 - 📦 Upgrade `putout` from `40.15.1` to `41.0.0`
 - 📦 Upgrade `storybook` from `10.1.3` to `10.1.4`
 - 📦 Upgrade `yaml-eslint-parser` from `1.3.1` to `1.3.2`
 - 📦 Upgrade `prettier-plugin-multiline-arrays` from `4.0.4` to `4.0.5`

🛠️ [fix] Refactor environment test utility
 - 🔄 Simplify the way `versions` are assigned in `environment.comprehensive.test.ts` by directly using `overrides.versions` instead of a fallback.

🚜 [refactor] Clean up stateSync.ts
 - 🔄 Remove unnecessary array declarations for `STATE_SYNC_SOURCE_VALUES` and `STATE_SYNC_ACTION_VALUES` to improve readability.

📝 [docs] Enhance ThemeName type documentation
 - 📜 Add detailed comments to `ThemeName` and introduce `THEME_NAMES` array for runtime validation in `types.ts`.

🎨 [style] Adjust GalaxyBackground story metadata
 - ✏️ Remove redundant title property from `GalaxyBackground` story in `GalaxyBackground.stories.tsx`.

🧪 [test] Improve theme handling in Settings component
 - 🔄 Change theme handling to use `ThemeName` type for better type safety in `Settings.tsx`.
 - 🔄 Add runtime guard to validate theme names in `handleThemeSelectChange`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b2a4749)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b2a4749f197120534b21622f653878cef325d12a)


- 🔧 [build] Update configurations and type definitions
 - 🛠️ [fix] Modify `.remarkignore` to include all MDX files in Docusaurus
 - 🔧 [build] Add `@types/debug` to Knip configuration for improved type support
 - 🔧 [build] Update `package.json` to include `@docusaurus/eslint-plugin` in devDependencies
 - 🚜 [refactor] Introduce `isNonNullObject` utility function in `ServiceContainer.ts` for better null checks
 - 🛠️ [fix] Change `bulkInsert` method in `HistoryRepository.ts` to accept `StatusHistory[]` instead of a more complex type
 - 🛠️ [fix] Update `convertValueForDatabase` method in `MonitorRepository.ts` to return `undefined` instead of `null`
 - 🛠️ [fix] Refactor `bulkInsertHistory` function to accept `StatusHistory[]` in `historyManipulation.ts`
 - 🎨 [style] Adjust ESLint configuration to disable specific Vitest rules for better test clarity
 - 🛠️ [fix] Simplify type definitions in `chartHybrid.ts` for `ChartUtilities`
 - 🛠️ [fix] Refactor `MiniChartBar` component to align status prop with `SiteStatus`
 - 🛠️ [fix] Update `useTheme` hook to remove unnecessary `MonitorStatus` type
 - 🛠️ [fix] Streamline status handling in `status.ts` to focus on `SiteStatus`
 - 🛠️ [fix] Correct type assertion in `SiteCard.stories.tsx` for better type safety

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(12f16de)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/12f16de81989c547622c71c8c39a4bf66778d7c8)






## [18.9.0] - 2025-11-24


[[a4994b6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a4994b6a04135dfc1923f6ecd12443b2c5f772e1)...
[24b157e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/24b157e533d42c459e4e75066ea156653e5be135)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/a4994b6a04135dfc1923f6ecd12443b2c5f772e1...24b157e533d42c459e4e75066ea156653e5be135))


### ✨ Features

- ✨ [feat] Introduce property-based testing for various components and utilities
 - 🧪 [test] Add property-based tests for `normalizeHistoryLimit` to ensure idempotence, range constraints, and monotonicity
 - 🧪 [test] Implement property-based tests for `isNonEmptyString` and `isValidIdentifier` to validate string conditions
 - 🧪 [test] Create property-based tests for `useAlertStore` to verify site name derivation logic
 - 🧪 [test] Add property-based tests for `dataValidation` to ensure URL validation and parsing of numeric strings
 - 📝 [docs] Add README for strict tests directory outlining scope, structure, and naming conventions
 - 🧪 [test] Introduce shared fast-check arbitraries for consistent testing across strict tests
 - 🧪 [test] Implement `assertProperty` helper for standardized property assertions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0797d4d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0797d4d6f05ea3713188f8e7a10650760a41d7b7)


- ✨ [feat] Enhance settings and monitoring functionality
 - 🔧 [settings] Refactor system notification sound handling
   - Removed dependency on `systemNotificationsEnabled` for sound setting changes
   - Updated checkbox labels for clarity
 - 🔧 [error] Improve error logging in ErrorBoundary
   - Added component stack information to error logs for better debugging
 - 🔧 [settings] Add detailed logging for settings hydration process
   - Introduced logs for normalization and synchronization status
 - 🔧 [sites] Introduce optimistic monitoring locks
   - Added `optimisticMonitoringLocks` to manage monitor states optimistically
   - Implemented functions to register and clear monitoring locks
   - Enhanced site monitoring actions to utilize optimistic updates
 - 🔧 [tests] Update AddSiteForm tests for async rendering
   - Refactored tests to ensure proper cleanup and rendering of components
   - Ensured all tests wait for asynchronous updates to complete
 - 🔧 [utils] Create utility for optimistic monitoring locks
   - Added `OptimisticMonitoringLock` interface and key builder function

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(49f9f39)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/49f9f3958d342a29bd8488a3c0723ea3d32c8066)


- ✨ [feat] Implement usePrefersReducedMotion hook
 - Introduced a new React hook `usePrefersReducedMotion` to track user's reduced-motion preference using the `prefers-reduced-motion` media query.
 - Ensured compatibility with server-side rendering by defaulting to `false` when the match media API is unavailable.
 - Added subscription to preference changes to dynamically update the state.

🛠️ [fix] Normalize in-app alert volume settings
 - Added `inAppAlertVolume` to the settings state and default settings.
 - Implemented `clampInAppAlertVolume` function to ensure volume values are clamped between 0 and 1.
 - Updated `normalizeAppSettings` to normalize persisted or partial settings objects, including the new volume setting.

📝 [docs] Update AppSettings interface
 - Extended the `AppSettings` interface to include `inAppAlertVolume` for managing in-app alert sound levels.

🧪 [test] Enhance settings tests for in-app alert volume
 - Updated tests to include scenarios for the new `inAppAlertVolume` setting.
 - Added tests to ensure proper normalization of volume values and behavior when sound alerts are disabled.

🎨 [style] Create ThemedSlider component
 - Developed a new `ThemedSlider` component for consistent styling of range inputs across the application.
 - Ensured accessibility support and theming integration for better user experience.

🎨 [style] Add styles for ThemedSlider
 - Created CSS styles for the `themed-slider` class to ensure consistent appearance and behavior across browsers.
 - Included focus and hover states for improved interactivity.

🧪 [test] Comprehensive tests for NotificationPreferenceService
 - Added tests to ensure proper functionality of the `NotificationPreferenceService`, including error handling for missing methods and uninitialized API.

🧪 [test] Targeted tests for useSettingsStore
 - Updated targeted tests for `useSettingsStore` to include scenarios for the new `inAppAlertVolume` setting.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c19d8e2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c19d8e2c3373eed0a1413570afbfffb18d725afb)


- ✨ [feat] Update settings structure and enhance notification preferences
 - 🔧 Refactor settings structure to replace legacy notification flags with more granular options:
   - `inAppAlertsEnabled`: Enables in-app alerts.
   - `inAppAlertsSoundEnabled`: Controls sound for in-app alerts.
   - `systemNotificationsEnabled`: Enables system notifications.
   - `systemNotificationsSoundEnabled`: Controls sound for system notifications.
 - 🧪 Update tests across multiple files to reflect new settings structure and ensure comprehensive coverage:
   - Adjusted mock settings in `Settings.test.tsx`, `DataService.comprehensive.test.ts`, and others to use new notification flags.
   - Enhanced fuzzing tests in `database.comprehensive-fuzzing.test.ts` and `ipc.comprehensive-fuzzing.test.ts` to include new settings.
 - 📝 Updated documentation and storybook examples to demonstrate new settings structure in `Settings.stories.tsx`.
 - 🧹 Cleaned up legacy notification handling in `useSettingsStore` and related tests to ensure consistency with new settings.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f94f595)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f94f595708e329c867b01a856aa26f27ff636895)


- ✨ [feat] Enhance monitor schema types and error handling
 - 🛠️ [refactor] Introduce `BaseMonitorSchemaShape` interface to streamline monitor schema definitions
 - 🛠️ [refactor] Replace repetitive monitor schema definitions with a generic `MonitorSchema` type
 - 🛠️ [refactor] Update all monitor schema types to extend from the new `MonitorSchema`
 - 🔧 [build] Add `@snyk/protect` dependency for improved security checks

🛠️ [fix] Improve error handling in hooks
 - 🛠️ [fix] Integrate `convertError` utility in `useDynamicHelpText` and `useMonitorTypes` hooks for better error normalization
 - 📝 [test] Update tests to reflect changes in error handling logic for `useMonitorTypes`

⚡ [perf] Optimize utility functions for monitor UI operations
 - 🛠️ [refactor] Create `runMonitorUiOperation` to standardize error handling across monitor UI operations
 - 🛠️ [refactor] Replace direct error handling with `runMonitorUiOperation` in multiple utility functions

⚡ [perf] Streamline monitor validation logic
 - 🛠️ [refactor] Introduce `runMonitorValidationOperation` for consistent error handling in validation functions
 - 🛠️ [refactor] Update validation functions to utilize the new standardized operation

🎨 [style] Enhance duration formatting utility
 - 🛠️ [refactor] Implement `formatRoundedDuration` for consistent duration formatting across the application
 - 🛠️ [refactor] Update `formatIntervalDuration` and `formatResponseDuration` to use the new formatting utility

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8a32e63)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8a32e63addb1d41c2da29f9318b80bdb8222a795)


- ✨ [feat] Refactor IPC channel usage across multiple APIs

 - 🔧 [refactor] Update systemApi to use SYSTEM_CHANNELS for openExternal and quitAndInstall methods
 - 🔧 [refactor] Modify dataApi tests to utilize DATA_CHANNELS for downloadSqliteBackup, exportData, and importData
 - 🔧 [refactor] Enhance monitorTypesApi tests to incorporate MONITOR_TYPES_CHANNELS for formatMonitorDetail, formatMonitorTitleSuffix, and validateMonitorData
 - 🔧 [refactor] Adjust monitoringApi tests to leverage MONITORING_CHANNELS for startMonitoringForSite, startMonitoringForMonitor, stopMonitoringForSite, and stopMonitoringForMonitor
 - 🔧 [refactor] Update settingsApi tests to use SETTINGS_CHANNELS for updateHistoryLimit, getHistoryLimit, and resetSettings
 - 🔧 [refactor] Revise sitesApi tests to implement SITES_CHANNELS for addSite, getSites, removeSite, removeMonitor, updateSite, and deleteAllSites
 - 🔧 [refactor] Modify stateSyncApi tests to utilize STATE_SYNC_CHANNELS for getSyncStatus and requestFullSync
 - 🔧 [refactor] Update systemApi tests to use SYSTEM_CHANNELS for openExternal and quitAndInstall
 - 🔧 [refactor] Revise preload types to define and export new channel mappings for monitoring, monitorTypes, and other APIs
 - 🔧 [refactor] Update MonitorTypesService to correctly wrap methods from the monitorTypes domain
 - 🔧 [refactor] Adjust mock setups in tests to reflect changes in channel usage for monitorTypes and monitoring APIs
 - 🔧 [refactor] Update storybook DetailLabel stories to use the new monitorTypes API structure

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(57d1110)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/57d11107677cc0e63290ee0a9845d02e23d34cf2)


- ✨ [feat] Add canonical StatusUpdate schema and rich validation helpers
 - 📌 Add createStatusUpdateSchema(), statusUpdateSchema, and compile-time conformance check to model the canonical StatusUpdate payload
 - 🔍 Add isoTimestampSchema for ISO 8601 timestamp validation used across status updates
 - 🧩 Add JSON-path and dot-path validators (isValidJsonPath, jsonPathSchema, isValidDotPath, createDotPathSchema) and edgeLocationListSchema
 - 🏷 Add HTTP header token validation (ALLOWED_HEADER_SYMBOLS, isValidHeaderName) and shared header schemas (httpHeaderNameSchema, httpHeaderValueSchema)
 - 🧾 Improve JSDoc and introduce literal-tuple enums (statusHistoryEnumValues, monitorStatusEnumValues) to preserve precise typing and docs

🔧 [build] [dependency] Update bundled node-sqlite3-wasm and update WASM asset
 - 📦 Upgrade node-sqlite3-wasm to ^0.8.51 in package.json and regenerate lockfile entries
 - 🗂 Replace bundled node-sqlite3-wasm.wasm and update assets/.wasm-version to the new hash

🧹 [chore] Upgrade dependencies and refresh lockfile
 - ⬆️ [dependency] Update many dev/runtime deps (biome, cspell suite, storybook, tailwindcss, vite, vite-plugin-mcp, msw, magic-string, knip, globals-vitest, etc.) and align transitive upgrades (ajv, ajv-formats, json-schema-traverse)
 - 🔒 Normalize license strings and lockfile metadata where applicable

🚜 [refactor] Harden DOM test environment and runtime mocks
 - 🧰 Replace minimal mocks with typed, behaviorful IntersectionObserver and ResizeObserver implementations to improve component visibility & resize testing
 - ⏱ Implement robust requestIdleCallback / cancelIdleCallback with timer tracking to avoid leaks during tests
 - 📁 Provide realistic File and FileReader mocks (readAsText/readAsDataURL/readAsArrayBuffer/readAsBinaryString, readyState, events, slice) for reliable upload tests
 - ⛑ Stubs for performance.now, URL, getComputedStyle and other globals improved for deterministic tests

🧪 [test] Strengthen FormFields uncovered tests and typings
 - ✅ Add explicit React input/select attribute typings and typed themed component mocks
 - 🎯 Simplify TestFormField markup to exercise aria-describedby edge cases deterministically

⚡ [perf] Minor formatting and whitespace cleanup
 - 🧾 Tidy line-wrapping in electron/UptimeOrchestrator.ts (no functional change)

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(51ff449)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/51ff44979c23ece25c39a4127168b5a10311b0d9)


- ✨ [feat] Add DB lock artifact recovery and harden DatabaseService initialization

🛠️ [fix] DatabaseService:
 - Add ensureError and structured error logging for close/initialization failures
 - Introduce DATABASE_INITIALIZATION_MAX_ATTEMPTS and DATABASE_BUSY_TIMEOUT_MS and apply PRAGMA busy_timeout / foreign_keys
 - Implement retry loop that detects locked DB errors, closes connection silently, invokes lock-artifact cleanup, and retries initialization
 - Add helpers: applyConnectionPragmas, isDatabaseLockedError, handleDatabaseLockedError, closeDatabaseSilently

✨ [feat] New util: electron/services/database/utils/databaseLockRecovery.ts
 - Implement generateLockArtifactCandidates, listExistingLockArtifacts and cleanupDatabaseLockArtifacts
 - Safe path normalization, quarantined relocation to stale-lock-artifacts, UUID-based unique names and detailed cleanup result (relocated/missing/failed)

🛠️ [fix] ApplicationService:
 - Add hasCloseFunction type guard and attempt to call service.close() for DatabaseService entries when present
 - Use structured logging ({ error: ... }) and ensureError when reporting cleanup errors

🧹 [chore] Logging/templates:
 - Add new SERVICE/DEBUG/WARNING/ERROR templates for DB recovery, PRAGMA failures, close/recovery outcomes and lock-detection diagnostics

🧪 [test] Tests:
 - Add tests for databaseLockRecovery utilities and DatabaseService initialization recovery
 - Update DatabaseService, ApplicationService and logTemplates tests and mocks to reflect new behaviors and assertions

🧹 [chore] Config:
 - Permit "UNLICENSED" in .npmpackagejsonlintrc valid license values

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(47cd163)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/47cd1638d0b46e644558ed76091dbd56b255b9b4)



### 🛠️ Bug Fixes

- 🛠️ [fix] Enforce canonical StatusUpdate schema, hydrate cached snapshots, and harden monitoring validation

✨ [feat] Add canonical StatusUpdate Zod schema
 - 🧾 Create isoTimestampSchema to validate ISO 8601 timestamps
 - 🧩 Compose statusUpdateSchema (monitor + site + required fields) and export it
 - 🔎 Add a type-level conformance check to ensure schema matches shared StatusUpdate type

🛠️ [fix] Centralize validation and sanitize incoming event payloads
 - 🔗 Import statusUpdateSchema into shared guards and expose validateStatusUpdate(...) for reuse
 - 🧼 Add stripEventMetadata(...) to monitorStatusEvents to remove _meta/_originalMeta before validation
 - ✅ Replace ad-hoc property checks with zod validation results for clearer, consistent guards

🛠️ [fix] Harden MonitoringService.checkSiteNow and normalize IPC responses
 - 🧯 Validate raw IPC result using validateStatusUpdate; log ZodError details and metadata on failure
 - 💥 Throw a descriptive error with cause when backend returns an invalid status update
 - ♻️ Normalize/return a strict StatusUpdate object (include optional details/previousStatus/responseTime only when present)
 - 🛠️ Add helpers: resolveIdentifier(...) and logInvalidStatusUpdateAndThrow(...) to centralize error handling

🛠️ [fix] Merge cached snapshots into manual check completion flows
 - 🧩 Add mergeMonitorSnapshots(...) and mergeSiteSnapshots(...) in UptimeOrchestrator to hydrate canonical payloads with cached snapshots
 - 🔁 Prefer canonical (payload) monitor/site as source-of-truth but reuse cached monitor.history and cached site.monitoring where appropriate
 - ⚠️ Add defensive warnings and early returns when monitor or site context is missing after validation

🧪 [test] Align tests & stabilize suites for stricter validation and runtime flakiness
 - ⚙️ MonitoringService tests: add StatusUpdate fixtures and exercises for valid, undefined, and invalid IPC responses
 - 🧾 strictTests: update monitorStatusEvents-complete-coverage to produce full Monitor/Site snapshots that satisfy new schema
 - 🧪 types.test: switch to MONITOR_STATUS / STATUS_HISTORY_VALUES constants and strengthen checkSiteNow mock payloads
 - 🧰 statusUpdateHandler.test: canonicalize monitor fixtures, use baseMonitor helper and numeric timestamps to simplify expectations
 - 🧭 Playwright tests: increase describe/test timeouts, replace brittle interactions (click) with keyboard press where appropriate, and raise WAIT_TIMEOUTS for stability
 - ⚡ database fuzzing: clamp/normalize pressure/user/load factors before degradation math to bound results

🧹 [chore] Misc test/time tuning and runtime refinements
 - 🔧 Reduce iteration counts and expose timeouts in long-running property tests to improve CI reliability
 - 🧼 Remove duplicated/verbose annotations in unit tests to simplify output

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(79cd1db)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/79cd1dbc347b6f3e260ed32dfb3b91ebb076a237)


- 🛠️ [fix] Normalize manual check completion payloads: prefer cache snapshots, fall back to payload

🛠️ [fix] UptimeOrchestrator: merge cache & payload context for manual check completions
 - ✅ Destructure incoming StatusUpdate (monitor/site) and resolve site from siteManager cache.
 - ✅ Prefer monitor/site snapshots from cache when present; fall back to payload snapshots when missing.
 - ⚠️ Replace hard abort-on-missing behavior with warnings so broadcasts are not dropped; always build an enriched StatusUpdate (monitor + site) for downstream consumers.

🛠️ [fix] Storybook electron API mock: include monitor snapshot in checkSiteNow
 - ✅ Create monitorSnapshot = clone(resultingMonitor ?? monitor) and return it as `monitor`.
 - ✅ Use monitorSnapshot.status as the authoritative status in the returned payload (avoid stale previousStatus fallback).

🧪 [test] Align test fixtures & fast-check runs to the enriched StatusUpdate contract
 - ✅ src/test/setup.ts: import Monitor type and update mockElectronAPI.monitoring.checkSiteNow to return a typed monitor snapshot and include it inside site.monitors.
 - ✅ src/test/types.test.tsx: add createTestMonitor helper and update Site/StatusUpdate fixtures to contain monitor snapshots and monitorId for stronger typing.
 - ✅ shared/test/fuzzing/siteStatus.fuzz.test.ts: update getSiteStatusDescription assertions to derive expectations from getSiteDisplayStatus and explicitly handle "unknown", "paused", and "mixed" cases.
 - ✅ src/test/components/AddSiteForm/Submit.comprehensive.test.tsx: harden property-based tests — introduce richer arbitraries (non-blank names, whitespace-only inputs, structured error messages), add base/concurrency fast-check parameters, and apply per-test timeouts to improve CI stability.

 - ✳️ Overall: converge runtime, storybook and test mocks on a single, enriched StatusUpdate shape so manual check broadcasts are consistent, resilient, and type-safe.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3b2ee4b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3b2ee4b20ea0a836f3850b608a09a2d8b7126d71)


- 🛠️ [fix] Enforce enriched StatusUpdate payloads and make monitoring broadcasts scope-aware

🛠️ [fix] UptimeOrchestrator: add determineMonitoringScope and emit monitoring events only for global ("all") operations
 - 🔎 Skip "monitoring:started"/"monitoring:stopped" broadcasts for scoped (site/monitor) operations to avoid redundant renderer updates
 - 📨 Attach forwarded metadata for global broadcasts and preserve cache invalidation semantics for scoped ops

🛠️ [fix] UptimeOrchestrator: harden manual check completion handling
 - 🔧 Populate missing site/monitor from cache when possible; warn if monitor cannot be matched
 - ⛔ Abort manual-check broadcasts if site or monitor context remains missing; ensure enrichedResult contains confirmed monitor & site

🛠️ [fix] EnhancedMonitorChecker: include full monitor & site context in emitted StatusUpdate payloads
 - 🧩 Build fallback monitor snapshot (lastChecked, responseTime, status) and include monitor + site in status update bases before persistence and event emission

🚜 [refactor] Shared contract & validation tightening
 - 📐 Make StatusUpdate.monitor and StatusUpdate.site required (shared/types.ts) — BREAKING: consumers must provide full monitor & site objects
 - ✅ Simplify/adjust validation guards to reflect required enriched payloads

🛠️ [fix] Consumers & utilities: adopt enriched payload shape
 - ⚙️ ApplicationService, statusUpdateHandler and test/mock setup now read direct monitor/site properties and forward rich context

🧪 [test] Update tests & fixtures to match new contract and behavior
 - 🔁 Refresh UptimeOrchestrator, MonitorManager, preload, monitoringApi, ApplicationService and related tests to include monitor/site fixtures and assert scoped vs global broadcast behavior

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a4994b6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a4994b6a04135dfc1923f6ecd12443b2c5f772e1)



### 📝 Documentation

- 📝 [docs] Update parameter descriptions in SiteManager and API interfaces
 - Refactor synchronization parameter documentation in SiteManager to improve clarity
 - Remove unnecessary parameter descriptions in DataApi, MonitoringApi, SettingsApi, and SitesApi interfaces
 - Enhance documentation for the ServiceContainer's singleton instance retrieval
 - Clarify transaction parameter in SiteWriterService
 - Improve type annotations in siteArbitraries for better type safety
 - Update test cases in Submit components for additional coverage and clarity
 - Refactor site status tests to use MonitorStatus for improved type accuracy

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(24b157e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/24b157e533d42c459e4e75066ea156653e5be135)


- 📝 [docs] Add documentation analytics and maintenance scripts
 - ✨ [feat] Introduce `analyze-docs.mjs` for documentation quality analysis
   - Collects markdown files, analyzes word count, complexity, and checks for broken links
   - Generates a comprehensive report on documentation health
 - ✨ [feat] Implement `maintain-docs.mjs` for automated documentation maintenance
   - Updates `last_reviewed` dates for modified files
   - Generates table of contents for lengthy documents
   - Validates cross-references and internal links
 - 🧹 [chore] Add `test-remark.mjs` for validating remark configuration
   - Tests markdown processing with remark plugins and outputs validation messages
 - 🛠️ [fix] Enhance `architecture-static-guards.mjs` to enforce IPC usage rules
   - Added checks for direct `ipcRenderer` imports in source files
 - 🧪 [test] Update tests to capture console warnings and errors
   - Spy on console methods to verify error handling in various test scenarios
 - 🚜 [refactor] Improve error handling context in store operations
   - Standardize error handling across various store operations as per ADR-003

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5853763)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/585376360caca008e80e25517409768c539f8e1f)


- 📝 [docs] Update documentation metadata and structure across multiple guides

 - 📝 [docs] Revise metadata in `DOCUSAURUS_SETUP_GUIDE.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `ENVIRONMENT_SETUP.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `ERROR_HANDLING_GUIDE.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `EVENT_SYSTEM_GUIDE.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `FALLBACK_SYSTEM_USAGE_ANALYSIS.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `IPC_AUTOMATION_WORKFLOW.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `MONITORING_RACE_CONDITION_SOLUTION_PLAN.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `NEW_MONITOR_TYPE_IMPLEMENTATION.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `ORGANIZATION_SUMMARY.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `README.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `RENDERER_INTEGRATION_GUIDE.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `STORYBOOK_VITEST_COMPONENT_TESTING.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `STYLE_LAYOUT_GUIDE.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `TECHNOLOGY_EVOLUTION.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `TESTING.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `TESTING_METHODOLOGY_REACT_COMPONENTS.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `TOOLS_AND_COMMANDS_GUIDE.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `TROUBLESHOOTING.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `TYPE_FEST_PATTERNS.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `UI_FEATURE_DEVELOPMENT_GUIDE.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `VITE_PERFORMANCE.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `ZUSTAND_STORE_PATTERN_GUIDE.md` to include created and last reviewed dates, and update summary and tags.
 - 📝 [docs] Revise metadata in `validation-strategy.md` to include created and last reviewed dates, and update summary and tags.
 - 🧪 [test] Add unit tests for monitor-specific type guards in `typeGuards.monitor.test.ts`.
 - 🧪 [test] Add focused tests for the `DashboardOverview` component in `DashboardOverview.test.tsx`.
 - 📝 [docs] Update testing commands in `README.md` and `TEST_VERBOSITY_GUIDE.md` for clarity and detail.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9baac00)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9baac00ca9c88ebb45a33d1ee25f694a87da716b)



### 🧪 Testing

- 🧪 [test] Enhance comprehensive test coverage for site-related components
 - ✨ [feat] Utilize arbitrary values for site names, URLs, and identifiers in tests to improve randomness and coverage
 - 🔧 [build] Refactor test setup for `Submit.comprehensive.test.tsx` to generate dynamic site properties using `sampleOne` from `siteArbitraries`
 - 🛠️ [fix] Update `StatusAlertToast.test.tsx` to use generated site names for consistency in alert rendering
 - 🚜 [refactor] Modify `SiteCardHeader.behavior.test.tsx` to utilize arbitrary site names for improved test reliability
 - 🧪 [test] Revise `ScreenshotThumbnail.arithmetic-mutations.test.tsx` to generate dynamic props for rendering tests
 - 🧪 [test] Update `ScreenshotThumbnail.basic.test.tsx` to use arbitrary values for site names and URLs, enhancing test coverage
 - 🔧 [build] Refactor `SettingsTab` tests to use arbitrary site names and identifiers for better test variability
 - 🧪 [test] Enhance `SiteOverviewTab.comprehensive.test.tsx` to utilize arbitrary values for site identifiers and names
 - 🧪 [test] Update `useAlertStore.test.ts` to use arbitrary values for monitor and site identifiers in alert tests
 - 🧪 [test] Revise `MonitoringService.test.ts` to use arbitrary site names for creating mock site data
 - 🧪 [test] Update `useSiteMonitoring.comprehensive.test.ts` to utilize arbitrary site names for improved test coverage
 - 🧪 [test] Enhance `dataValidation.test.ts` to ensure URL validation tests cover a wider range of inputs
 - 🧪 [test] Revise `siteStatus.direct.test.ts` to use arbitrary site data for testing site status functions
 - 🎨 [style] Clean up fastcheck configuration to improve readability and maintainability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(acb4981)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/acb498188e77d853495bc1c22e4d3978aac10be8)



### 🧹 Chores

- 🧹 [chore] Clean up unused files and configurations across the project
 - Removed obsolete configurations from .storybook and electron directories
 - Streamlined component stories in storybook for better organization
 - Eliminated redundant utility files in shared and src directories

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(35c2751)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/35c2751a9c375a400a99950a8ea27212d06c30e5)



### 🔧 Build System

- 🔧 [build] Update ESLint configuration to include additional ignore patterns
 - Added "public/mockServiceWorker.js" and "storybook/test-runner-jest.config.js" to global ignore patterns

🛠️ [fix] Enhance error handling in sampleOne function
 - Updated sampleOne function to throw an error if fast-check fails to sample a value

🧪 [test] Refactor site status tests to use factory functions for creating test data
 - Introduced createHttpMonitor and createSite functions to streamline test data creation
 - Updated tests to utilize these factory functions for better readability and maintainability

🎨 [style] Improve naming consistency in ScreenshotThumbnail tests
 - Renamed renderThumbnail to mountThumbnail for clarity in purpose
 - Updated references in tests to reflect the new naming

📝 [docs] Add JSDoc comments to mockServiceWorker.js
 - Included detailed file overview and documentation for functions within mockServiceWorker.js

🎨 [style] Update Jest configuration files to improve documentation
 - Added JSDoc comments to storybook/test-runner-jest.config.js and test-runner-jest.config.js for clarity
 - Disabled specific ESLint rules for better compatibility with JSDoc formatting

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0ddd1c4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0ddd1c4ca53d8984916e75fd138de63a8dabfc19)


- 🔧 [build] Update monitoring service tests to use createMonitorConfig

 - 🛠️ [fix] Refactor HttpHeaderMonitor, HttpJsonMonitor, HttpKeywordMonitor, HttpLatencyMonitor, HttpStatusMonitor, and SslMonitor tests to replace extractMonitorConfig with createMonitorConfig for better clarity and consistency.
 - 🧪 [test] Enhance PortMonitor tests to utilize createMonitorConfig, ensuring all configurations are handled uniformly across tests.
 - 📝 [docs] Add type guards for monitor types in shared/typeGuards/monitor.ts to improve type safety and runtime checks.
 - 🧹 [chore] Introduce utility functions in shared/utils/assertions.ts for better error handling and assertions.
 - 🎨 [style] Improve App component to handle undefined site identifiers gracefully, enhancing robustness.
 - 🧪 [test] Update AddSiteForm tests to bridge store mocks through global references, preventing hoist-time import errors and ensuring proper mock initialization.
 - 🧪 [test] Adjust Settings component tests to standardize store mock creation, avoiding early access issues.
 - 🧪 [test] Refactor Dashboard SiteList tests to create sites store state outside hoisted blocks, ensuring proper mock behavior.
 - 🔧 [build] Update package-lock.json and package.json for dependency management and script improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c949975)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c949975a6e90e0c8598a2607793ad0a4c765c2eb)






## [18.0.0] - 2025-11-04


[[eb7300a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eb7300ae40165a6315fe9828fb8c67685cda9db0)...
[292b064](https://github.com/Nick2bad4u/Uptime-Watcher/commit/292b0646abe164bd68c56d4e555948f8e19cbda4)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/eb7300ae40165a6315fe9828fb8c67685cda9db0...292b0646abe164bd68c56d4e555948f8e19cbda4))


### ✨ Features

- ✨ [feat] Enhance IPC registration and add comprehensive test coverage

This commit introduces significant improvements to the application's stability, developer experience, and testing infrastructure. Key enhancements include robust IPC handler registration, a more resilient overflow detection hook, and a major expansion of strict test coverage across the shared codebase.

✨ **[feat] Robust IPC Handler Registration**
- 🛡️ Implements duplicate handler detection in `registerStandardizedIpcHandler` to prevent channel collisions at runtime.
- ↩️ Adds transactional safety by rolling back registration if `ipcMain.handle` fails, ensuring the system remains in a consistent state.
- 📝 Introduces detailed error logging for both duplicate and failed registrations, improving debuggability.

🎨 **[style] Standardize Documentation Formatting**
- ✍️ Updates Markdown files (`.md`) to use consistent formatting for blockquotes, bold text, and lists, improving readability.

⚡ **[perf] Optimize Overflow Marquee Hook**
- 🧠 Refactors the `useOverflowMarquee` hook to use a shared `ResizeObserver` registry (`WeakMap`).
- 🔄 This reduces memory usage and allocations by reusing observer instances for the same element across re-renders, especially in React's Strict Mode.
- 🧼 Implements a deferred cleanup mechanism to safely disconnect observers without interfering with potential component remounts.

🧹 **[chore] Improve Cache Invalidation Logic**
- 🔄 Adjusts `cacheSync` to correctly handle global (`all`) and site-specific (`site`) invalidation events triggered by monitoring lifecycle updates.
- 🗑️ This ensures that caches are now properly cleared and resynchronized in response to these events, preventing stale data from being displayed in the UI.

🐛 **[fix] Stabilize Full Sync Recovery**
- 🔄 Overhauls the `StateSyncService` recovery logic to handle the asynchrony between fetching a full sync snapshot and receiving its corresponding broadcast event.
- ⏳ Introduces a timed expectation for the broadcast, logging a warning if it doesn't arrive within a 5-second window, preventing the system from waiting indefinitely.
- 🧹 Enhances the subscription cleanup process to correctly terminate pending recovery operations and timers, preventing memory leaks and race conditions upon component unmount.

🧪 **[test] Add Comprehensive Strict Test Suites**
- 🎯 Introduces numerous new "complete-coverage" test files under `shared/test/strictTests` to achieve exhaustive validation of critical shared utilities and constants.
- 🏗️ Adds `shared/test/fixtures/siteFactories.ts` to provide standardized, reusable test data for sites and monitors.
- 🛡️ Creates exhaustive tests for:
  - Error handling utilities (`ApplicationError`, `withErrorHandling`).
  - History retention limits and normalization logic.
  - Shared logging helpers and interfaces.
  - Monitor status event validation guards.
  - Monitoring interval constants and remediation logic.
  - Renderer IPC event contracts.
  - Site data validation, sanitation, and synchronization utilities.
- ⚙️ Adds new tests for the improved IPC handler registration to verify duplicate rejection and rollback behavior.
- 🖼️ Adds coverage tests for the `useOverflowMarquee` hook and `toSentenceCase` utility.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0a0585a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0a0585a77a6696b511538f8136b908065cad5116)


- ✨ [feat] Enhance monitoring summaries and data import synchronization

This commit introduces several enhancements across the application, focusing on providing more detailed feedback from monitoring operations and improving data synchronization after imports.

✨ **[feat] Monitoring Service Enhancements**
- 📞 The `startMonitoring` and `stopMonitoring` IPC methods now return detailed summary objects (`MonitoringStartSummary`, `MonitoringStopSummary`) instead of a simple boolean.
-  Frontend `MonitoringService` is updated to return these summaries, providing the UI layer with richer context about how many monitors succeeded or failed to start/stop.
- 💥 Error handling is improved to include the summary object when a start/stop operation fails or partially fails.

🚜 **[refactor] Centralize Site Snapshot and Sanitization Logic**
- 📦 Adds a new `siteSnapshots.ts` utility module to centralize logic for creating sanitized site snapshots.
- 🚮 This handles the removal of duplicate site identifiers and calculates deltas between states.
- 🔄 `SiteManager`, `IpcService`, and the frontend `useSiteSync` hook are refactored to use these new utilities, ensuring consistent behavior across the main and renderer processes.

🛠️ **[fix] Ensure UI Updates After Data Import**
- 🔄 After a successful data import, the `UptimeOrchestrator` now fetches the refreshed site list and emits a `BULK_SYNC` event.
- 📢 This ensures the frontend state is immediately synchronized with the newly imported database content, fixing a bug where the UI would not reflect the changes without a manual refresh.
- ➡️ The `DatabaseManager` now emits an internal event to request a cache update after an import, improving separation of concerns.

📝 **[docs] Update API Documentation and Add Wiki Structure**
- 📄 Updates `API_DOCUMENTATION.md` to reflect the new return types for monitoring functions and to strongly recommend using the renderer service layer (`SiteService`, `MonitoringService`, etc.) over the raw IPC bridge.
- ✨ Adds a new `wiki.json` file, laying out a comprehensive structure for project documentation, covering architecture, technology stack, and key features.

🔧 **[build] Build & Linting Adjustments**
- 📦 Updates the docusaurus `package.json` version and main entry point.
- ⚙️ Disables the `require-bin` and `require-man` rules in `npmpackagejsonlintrc.json` to align with project structure.
- 🙈 Adds `codeql-agent-results/` to `.gitignore`.

🧪 **[test] Update Tests for New Features**
- ✅ Unit and integration tests are updated to align with the new monitoring summary return types and the improved data import flow.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a5bd5fc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a5bd5fcf9252b4b02f2717ae69ca61f32844cdf8)



### 🛠️ Bug Fixes

- 🛠️ [fix] Validate & create absolute Electron userData path during startup

🛠️ [fix] Ensure userData override is absolute and directory exists
 - 🧭 Add path.isAbsolute validation for userData override and throw a clear error when a non-absolute value is provided (message includes the received value).
 - 🗂️ Ensure the target directory exists using mkdirSync(..., { recursive: true }) during early startup and justify the sync IO with an eslint disable comment.
 - 🔎 Continue to set app.setPath("userData", resolvedPath) and log the chosen path for diagnostics.

🚜 [refactor] Use node:path default import & tidy fuzz runner script
 - ♻️ Replace named dirname/join imports with a single default import from node:path and use path.join / path.dirname for bundled CLI resolution.
 - 🧾 Append an eslint-disable comment to the entrypoint call (void main()) to satisfy lint rules about top-level await in CommonJS entrypoints.

🔧 [build] Include shared sources in electron test tsconfig
 - 🧩 Add shared/**/*.ts|mts|cts|tsx and shared/test/**/* globs to config/testing/tsconfig.electron.test.json include array so shared files are picked up by the electron test build / typechecker.

📝 [docs] Normalize FAST_CHECK_FUZZING_GUIDE.md formatting
 - ✍️ Convert inconsistent hyphen list markers to standard Markdown bullets, fix glob examples, and escape FAST_CHECK_* env var names for clearer documentation.

🧪 [test] Improve typing in safeObjectPick fuzz test
 - 🛡️ Cast keysToPick to a typed readonly (keyof typeof obj)[] (typedKeys) before filtering and mapping, simplifying the type logic and producing a type-safe expected value for assertions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(292b064)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/292b0646abe164bd68c56d4e555948f8e19cbda4)


- 🛠️ [fix] Harden URL validation & mark type-only modules for coverage
 - shared/validation/validatorUtils.ts: reject values ending with "://", preventing false-positive scheme-only URLs
 - electron/UptimeOrchestrator.types.ts & electron/managers/validators/interfaces.ts: add /* V8 ignore start *///* V8 ignore end */ wrappers and export runtime marker constants to satisfy coverage tooling for pure-type modules

🧹 [chore] Adjust lint / tsconfig / build settings
 - .npmpackagejsonlintrc.json: normalize "description-format" to ["error", {}] to satisfy schema validation
 - .storybook/tsconfig.json: expand include globs and add explicit exclude placeholder to pick up storybook sources
 - eslint.config.mjs: add project-match tuning (maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 24) to reduce parser noise
 - vite.config.ts: disable coverage autoUpdate and tighten thresholds with explanation to avoid Magicast mutation issues
 - storybook/test-runner-jest.config.js: refine eslint-disable comment for CommonJS config
 - vitest.electron.config.ts: exclude "**/*.types.ts" and include tests/strictTests/electron/**/* to surface strict backend tests

🧪 [test] Add comprehensive runtime & strict test coverage and improve existing tests
 - Add many new tests across electron/, src/, and tests/strictTests/ (MonitorTypeRegistry coverage/migration, siteDeletion coverage/strict, DatabaseService transactions, MonitorManagerEnhancedLifecycle, monitorFactoryUtils, pingRetry, databaseInitializer, useSiteSync/useSiteMonitoring/useSiteSync throttling, and more)
 - electron/test/services/window/WindowService.test.ts: enhance BrowserWindow/webContents mocks and add scenarios (headless behavior, DevTools failure handling, security header middleware, lifecycle cleanup, Vite server readiness/retries, env-flag helper)
 - src/test/components/.../SiteTableRow.fast-check.test.tsx: small test normalization tweak (.replace -> .replaceAll) to stabilize accessible name assertions

📝 [docs] Update agent prompt & tool ordering
 - .github/agents/BeastMode.agent.md: clarify "Continue" handoff prompt (unlimited compute/resources) and reorder tool list for clarity

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ccc5c50)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ccc5c503cddaf581106d1c13a1fb640618e1e537)



### 🚜 Refactor

- 🚜 [refactor] Centralize history-limit validation & normalize error semantics
 - Move normalization into shared normalizeHistoryLimit: accept numeric input, treat <=0 as unlimited (0), floor fractions, clamp to minLimit and throw RangeError for > maxLimit.
 - Remove redundant integer/finite guards in DatabaseManager and surface explicit error when history rules are unavailable.
 - Update SettingsService to pre-normalize requests, map backend RangeError->TypeError for renderer-facing contract, and gracefully fallback to sanitized request when backend returns invalid values.

🧪 [test] Align tests with normalization behavior and typed mocks
 - Update DatabaseManager/SettingsService/unit/integration tests to use DEFAULT_HISTORY_LIMIT_RULES + normalizeHistoryLimit and assert normalization/clamping instead of rejection.
 - Adjust historyLimitManager tests to expect floored integer behavior and update mock implementations to apply normalization.

✨ [feat] Add typed test mock factory and migrate tests
 - Introduce createMockFunction<Fn> helper for strongly-typed vitest mocks and migrate many vi.fn usages to typed Mock + createMockFunction for clearer test intent and typings.

🚜 [refactor] Harden runtime/bench code for immutability & clarity
 - Make fields explicit readonly and switch from parameter-property shorthand to explicit constructor assignment across benchmark classes, mock components, MockFile, alert/monitor classes and other small runtime helpers.
 - Bind notificationService/config dependencies to readonly fields where relevant.

🔧 [build] Normalize and tighten tooling / config files
 - Expand and normalize .cspell.json, .npmpackagejsonlintrc.json, .hintrc, .yamllint and eslint.config.mjs rules/ignores; update tsconfig.* (testing, scripts, playwright) path mappings and references to use cached build artifacts.
 - Update root and docs/docusaurus package.json metadata, scripts and dependency ranges; add package lint scripts and packaging metadata used by CI/tooling.

🧹 [chore] Unify Electron API typing for renderer & Storybook
 - Introduce a single ElectronAPI alias in src/types and update storybook/type alias to import/export it, keeping global window typing consistent.

🧪 [test] Refactor cacheSync property-based tests & helpers
 - Add build/trigger/expect helpers for CacheInvalidated events, use CACHE_INVALIDATION_* enums in tests, and simplify async assertions and error handling for property-based scenarios.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f5262c0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f5262c084ed00f6a57ec30a3fd52fad0d7c6cdfc)


- 🚜 [refactor] Centralize history limit rules and normalize values

This commit refactors history retention logic by centralizing business rules into a new shared module, ensuring consistent validation and normalization across the application.

✨ [feat] Introduce shared history limit rules
- ➕ Adds a new `shared/constants/history.ts` file to define canonical `HistoryLimitRules` (`defaultLimit`, `minLimit`, `maxLimit`).
- 🔄 Introduces a `normalizeHistoryLimit` utility function to validate and sanitize history limit values, handling integers, bounds checking, and treating non-positive values as "unlimited" (0).

🚜 [refactor] Refactor backend to use shared history rules
- 🏠 `DatabaseManager` and `ConfigurationManager` now source history limit rules from the new shared constant.
- 🛡️ `DatabaseManager` initialization is hardened to use `normalizeHistoryLimit` when loading the persisted value, falling back to the default on validation errors.
- 🧰 The `historyLimitManager` utility is updated to accept and apply these rules, centralizing the clamping and validation logic previously duplicated in different layers.

🎨 [style] Format Docusaurus MDX documentation
- 🧹 Applies consistent formatting to all architecture and guide `.mdx` pages.
- 💅 Standardizes Markdown syntax, JSX layout indentation, and cleans up Mermaid diagram definitions.
- ⛔ Adds complex MDX page diagrams to `.remarkignore` to prevent linter conflicts with manual formatting.

🧪 [test] Improve test suite robustness
- 🔧 Updates Vitest configurations and tests to align with the refactored history limit logic.
- 🔒 Enhances type safety in test mocks and constructor initializations.
- 🎯 Adjusts property-based tests to correctly assert against the new centralized minimum limit instead of a hardcoded value.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d9f794b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9f794b4597ac577998b32e94c25885a706ad0c2)



### 🎨 Styling

- 🎨 [style] Standardize markdown formatting across all documentation

This commit introduces a comprehensive and consistent formatting standard across all Markdown (`.md`) files in the repository.

### ✨ Key Changes

*   📝 **Consistent List Formatting**:
    *   Uniformly replaces hyphen-based (`-`) lists with asterisk-based (`*`) lists.
    *   Standardizes section headers within lists to use bold (`__Header__`) for improved readability.

*   💅 **Visual Style Unification**:
    *   Replaces all horizontal rules (`----`) with a consistent three-asterisk separator (`***`) for a cleaner visual appearance.

*   🚀 **Developer Experience Enhancements**:
    *   Improves VS Code task problem matchers in `tasks.json` with more robust regular expressions to better parse output from tools like Vite, ESLint, Stylelint, and TypeScript, including handling of ANSI color codes.
    *   Defaults linting tasks (`lint`, `lint:css`, `lint:all`) to their auto-fixing equivalents (`lint:fix`, `lint:css:fix`, `lint:all:fix`) to streamline the development workflow.
    *   Adds problem matchers for `remark`, `knip`, and `madge` to the `Lint:All:Fix` task.

*   🔧 **Tooling and Configuration**:
    *   Adds a new `.npmpackagejsonlintrc.json` configuration file to enforce `package.json` structure and correctness.
    *   Updates `.gitignore` to exclude the `temp/` directory.
    *   Refines agent prompts in `BeastMode.agent.md` for better clarity and effectiveness.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(eb7300a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eb7300ae40165a6315fe9828fb8c67685cda9db0)



### 🧪 Testing

- 🧪 [test] Centralize fast-check env config, add fuzz runner, and wire into test setups

 - ✨ [feat] Add shared/test/utils/fastCheckEnv.ts: resolveFastCheckEnvOverrides reads FAST_CHECK_NUM_RUNS & FAST_CHECK_SEED, validates inputs, emits warnings for invalid values, and returns an object suitable for fc.configureGlobal
 - ✨ [feat] Add scripts/run-fast-check-fuzzing.ts + package.json:fuzz:runs: CLI to run targeted fuzzing suites with --runs / --seed / --targets, picks an npm invocation strategy, and forwards FAST_CHECK_* env vars to child processes
 - 🧪 [test] Replace hardcoded numRuns in test setup files (src/test/*, shared/test/*, electron/test/setup.ts, shared/test/setup.ts, src/test/vitest-context-setup.ts, src/test/dom-setup.ts, src/test/mock-setup.ts, src/test/global-setup.ts) to use resolveFastCheckEnvOverrides for consistent, environment-driven fast-check configuration
 - 🚜 [refactor] Simplify objectSafety.fuzz.test.ts assertion: compute expected entries via filter/map and assert equality with Object.fromEntries for clearer, stricter expectations
 - 📝 [docs] Update FAST_CHECK_FUZZING_GUIDE.md: formatting tweaks and examples showing fuzz:runs usage, seeds, run counts, and --targets to limit environments

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(62740d9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/62740d99e40e625ed716728cdc265d57a5ae6767)






## [17.8.0] - 2025-10-30


[[ac8ef8d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ac8ef8d78e4367401518aad483f0dc06acb7aa05)...
[12247c6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/12247c6e92c0e1cddac1116041543efd4c596c39)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/ac8ef8d78e4367401518aad483f0dc06acb7aa05...12247c6e92c0e1cddac1116041543efd4c596c39))


### ✨ Features

- ✨ [feat] Enhance monitoring lifecycle and add architectural lint rules

This commit introduces significant improvements to the monitoring lifecycle, event system, and architectural integrity through new ESLint rules.

✨ **[feat] Monitoring Lifecycle Summaries**
- `startMonitoring` and `stopMonitoring` methods now return detailed `MonitoringStartSummary` and `MonitoringStopSummary` objects instead of `void`.
- This provides callers (including the IPC layer) with granular results, detailing how many monitors were successfully started/stopped, failed, or skipped.
- 📤 IPC handlers for `start-monitoring` and `stop-monitoring` now forward these summary objects to the renderer, enabling more informative UI feedback.

⚡ **[perf] Event Metadata & System Refinements**
- 🚇 Introduces a robust `attachForwardedMetadata` utility to correctly propagate event correlation IDs and metadata when internal events are re-emitted to the renderer.
  - This fixes potential metadata loss or conflicts during event forwarding.
  - 🛡️ Utilizes `Reflect` and a private `Symbol` in `TypedEventBus` for safer and more reliable metadata handling on event payloads.
- 📈 `UptimeOrchestrator` now enriches `monitoring:started` and `monitoring:stopped` events with the new lifecycle summaries, providing a comprehensive view of monitoring state changes.
- 🔧 The minimum monitor check interval is increased from 1s to 5s to reduce system load and prevent excessive checks.
- 🧹 Imported monitor configurations now have their `checkInterval` clamped to this new minimum, ensuring data integrity.

🚜 **[refactor] MonitorManager Enhanced Lifecycle**
- 🏗️ Extracts complex monitoring lifecycle logic (start/stop all, start/stop for site) from `MonitorManager` into pure, testable helper functions in a new `MonitorManagerEnhancedLifecycle.ts` file.
- 📖 `MonitorManager` documentation is significantly streamlined to improve clarity and focus on its public API. JSDoc is refined for better developer experience.
- 🧪 The `MonitorScheduler` is updated to be injectable with a logger instance, improving testability.

🔧 **[build] New Architectural ESLint Rules**
- 🧱 Adds a `shared-no-outside-imports` rule to enforce that `shared` code remains platform-agnostic by preventing imports from the `electron` or `renderer` layers.
- ⛔ Adds an `electron-no-renderer-import` rule to prevent Electron main process code from importing renderer-specific modules.
- 🚫 Adds a `renderer-no-browser-dialogs` rule to discourage the use of native `alert()`, `confirm()`, and `prompt()` in favor of the app's custom dialog system for a consistent UX.

📝 **[docs] Agent & Config Updates**
- 🤖 Updates the `BeastMode` agent prompt to recommend using `lint:fix` for auto-formatting, improving agent efficiency.
- 🎨 Formats agent tool and handoff lists for better readability.

🧪 **[test] Comprehensive Test Updates**
- 🔄 Updates unit and integration tests for `UptimeOrchestrator`, `IpcService`, and `MonitorManager` to align with the new method signatures that return lifecycle summaries.
- 🔬 Adds tests to verify correct event metadata forwarding and payload enrichment.
- 🛠️ Increases timeouts for some long-running tests to prevent flakiness in CI environments.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(12247c6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/12247c6e92c0e1cddac1116041543efd4c596c39)



### 🚜 Refactor

- 🚜 [refactor] Standardize terminology, remove deprecated exports, and enhance tooling

This commit introduces a broad set of refactoring and tooling improvements focused on standardizing terminology, enforcing code quality with new linting rules, and cleaning up deprecated code patterns.

### ✨ Features
-   **ESLint:** Introduces a new custom ESLint rule, `no-deprecated-exports`, to prevent the export of any code marked with `@deprecated` in its TSDoc comments. This rule is now enforced across the codebase to ensure deprecated APIs are not accidentally used externally.

### 🚜 Refactor
-   **Terminology Standardization:** Systematically replaces the term "legacy" across the entire codebase—including documentation, comments, tests, and configuration files—with more descriptive synonyms like "former," "outdated," "historical," and "prior." This improves clarity and consistency in project-wide language.
-   **Event System:**
    -   Renames `addMiddleware` to `registerMiddleware` in `TypedEventBus` for better semantic clarity.
    -   Removes the deprecated `addMiddleware` compatibility method.
    -   Removes the deprecated `site:cache-miss` and `site:cache-updated` event types, which are now handled exclusively through internal channels.
-   **Monitoring Services:** Removes the overloaded `performSingleHealthCheck` method signature that provided a compatibility layer. The method now strictly accepts a single parameter object, simplifying its interface and removing outdated call patterns.

### 🧹 Chores
-   **Dependabot Configuration:** Adds a 3-day cooldown period for `npm` dependency updates to reduce the frequency of pull requests and streamline dependency management.

### 📝 Documentation
-   **IPC Diagrams:** Updates system architecture and workflow diagrams to accurately reflect the event flow from the `RendererBridge` via `webContents.send` instead of the older `WindowService` model.
-   **Terminology Update:** All documentation has been updated to use the new standardized terminology, replacing "legacy" with more specific terms.

### 🧪 Testing
-   **Test Updates:** Adjusts test descriptions, variable names, and assertions across numerous test files to align with the project-wide terminology and API refactorings, ensuring all tests continue to pass and accurately reflect the current state of the code.
-   **Monitor Tests:** Refactors `HttpMonitor` tests to use a new factory function for creating test parameters, removing reliance on the now-deleted compatibility-focused method signature.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ac8ef8d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ac8ef8d78e4367401518aad483f0dc06acb7aa05)






## [17.7.0] - 2025-10-28


[[4a39b24](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4a39b2441d864d4d78515ba75ee9d081327e8205)...
[06160b0](https://github.com/Nick2bad4u/Uptime-Watcher/commit/06160b027e8d56dc1a1eabc9cf956bd53bfbd104)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/4a39b2441d864d4d78515ba75ee9d081327e8205...06160b027e8d56dc1a1eabc9cf956bd53bfbd104))


### ✨ Features

- ✨ [feat] Introduce structured deltas for site synchronization events

This enhances the site synchronization mechanism by calculating and embedding a structured delta within state sync events. This delta explicitly details which sites were added, removed, or updated, allowing the frontend to perform more efficient and precise state updates instead of re-rendering the entire site list.

✨ [feat] Add structured delta to site synchronization events
 - 🖥️ The `SiteManager` now calculates a `SiteSyncDelta` by comparing the new state against a cached snapshot of the previous state.
 - 📡 This `delta` is included in the `sites:state-synchronized` event payload, providing granular details on additions, removals, and updates.
 - ⚛️ The frontend `useSiteSync` store now leverages this `delta` if present, falling back to manual calculation if not. This avoids redundant work and streamlines state updates.
 - 🛡️ Moves the `SiteSyncDelta` type definition and calculation logic to the shared package for reuse between the main and renderer processes.

⚡ [perf] Optimize sync status retrieval to use cached data
 - 🐢 The `get-sync-status` IPC handler previously loaded all sites from the database just to get a count.
 - 🏎️ Adds a `getCachedSiteCount` method to `UptimeOrchestrator` that retrieves the site count directly from the in-memory cache, avoiding a database query and improving UI responsiveness.

🚜 [refactor] Centralize site sanitization logic
 - 🧹 Moves the logic for removing duplicate sites by identifier from `SiteManager` to a shared utility function `sanitizeSitesByIdentifier`.

🧪 [test] Update and refactor tests for new features
 - ✅ Adds unit tests for the new `getCachedSiteCount` method and delta calculation logic.
 - 🧹 Simplifies and refactors the `MonitorRepository` tests, removing verbose property-based tests in favor of simpler, focused orchestration tests.
 - 🔧 Updates IPC service and site store tests to reflect the new delta-based synchronization and cached site count logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4a39b24)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4a39b2441d864d4d78515ba75ee9d081327e8205)



### 🚜 Refactor

- 🚜 [refactor] Update monitor schemas and improve URL validation

This commit introduces several refactors and improvements across the application, focusing on updating monitor schemas and enhancing validation logic.

🚜 [refactor] Updates monitor type schemas to be more robust and URL-based.
 - 🌐 For `http-latency` monitors, renames `latencyThreshold` to `maxResponseTime` for clarity.
 -  DNS monitors (`dns`) now use `host` instead of `hostname` and support an `expectedValue` field.
 - 🔒 SSL monitors (`ssl`) are updated to use `host` instead of `hostname` and include a `port` field.
 - 🔌 WebSocket monitors (`websocket-keepalive`) are simplified to use `maxPongDelayMs` instead of ping/pong messages and point to a new test endpoint.
 - ❤️ Server Heartbeat monitors (`server-heartbeat`) are refactored to use a `url` for status checks, along with fields for status, timestamp, and drift, replacing the identifier-based model.
 - 🔄 Replication monitors (`replication`) now use status URLs for the primary and replica, a timestamp field, and a maximum lag in seconds, replacing the host-based model.

🛠️ [fix] Improves URL validation logic.
 - Replaces a simple `endsWith("://")` check with a more precise regular expression `/^[a-z][a-z\d+\-.]*:\/\/$/iv` to correctly identify incomplete URL schemes and prevent invalid inputs.

🔧 [build] Enhances dependency graph analysis configuration.
 - 📈 Updates `madge` configuration (`.madgerc` and `package.json`) to include npm packages (`includeNpm: true`) and TypeScript type imports (`skipTypeImports: false`), providing a more complete and accurate dependency graph.

🧪 [test] Adjusts test configurations for stability.
 - ⏳ Increases timeouts for several long-running tests in `main.comprehensive.test.ts` and `cacheSync.test.ts` to prevent flakiness in slower environments.
 - 📊 Makes a performance test threshold in `constants-theme-100-coverage.test.ts` dynamic, relaxing it during code coverage runs to account for instrumentation overhead.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(06160b0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/06160b027e8d56dc1a1eabc9cf956bd53bfbd104)


- 🚜 [refactor] Enhance code style, validation, and build tooling

This commit introduces a wide range of refactorings and improvements across the codebase, focusing on code quality, validation logic, build process robustness, and test suite consistency.

✨ **[feat] Source Code Enhancements**
*   **URL Validation Logic:** 🌐 Strengthens the `isValidUrl` utility by adding stricter checks.
    *   It now rejects URLs that contain multiple protocol schemes (e.g., `https://http://...`).
    *   Enforces the presence of `//` after `http:` or `https:` to prevent malformed URLs like `http:example.com`.
*   **App Update Handling:** 🔄 Improves the application update process by wrapping the `applyUpdate` call in a `try...catch` block to gracefully handle and log potential errors during the update application. The click handler is also updated to properly handle the async nature of the action.

🚜 **[refactor] Code & Configuration Refinements**
*   **IPC Validators:** 🧱 Refactors IPC parameter validators by extracting inline arrow functions into standalone, named functions (`validateNoParams`, `validatePreloadGuardReport`). This improves readability, testability, and reusability.
*   **Monitor Creation:** 简化 `createMonitorObject` function by directly returning a constructed object, removing redundant steps and improving conciseness.
*   **DNS Monitor Payload:** DNS monitor payload creation is streamlined to conditionally add the `expectedValue` field only when it's defined, simplifying the logic.
*   **ESLint Configuration:** 🧹 Reorganizes `unicorn` rules within `eslint.config.mjs` for better alphabetical consistency.
*   **Graphviz Configuration:** 🗑️ Removes the hardcoded `graphVizPath` from `.madgerc`, assuming Graphviz is now available in the system's PATH.

🧪 **[test] Testing and Build Script Improvements**
*   **Build Scripts:** 🛠️ Enhances build script robustness in `vite.config.ts` and `storybook/viteSharedConfig.ts`.
    *   Adds robust error handling and logging for path resolution and module loading.
    *   Uses `import.meta.dirname` with fallbacks for more reliable directory resolution.
    *   Replaces direct `require` with a safer, lazily-evaluated shim.
*   **Test Code Style:** 🎨 Adopts more modern and concise syntax in tests.
    *   Uses `new Map([...])` constructor for direct initialization instead of multiple `.set()` calls.
    *   Uses `String.raw` for strings containing backslashes in `console.log` calls to prevent misinterpretation of escape sequences.
*   **Type Imports:** 🏷️ Updates test setup to use `node:path` for imports, enforcing the explicit `node:` protocol for built-in modules.
*   **Fuzzing Test:** 🐛 Fixes a minor issue in a fuzzing test by using `String.fromCodePoint` instead of `String.fromCharCode` for generating high Unicode plane characters.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6774815)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/677481550f6c42ed9d9e99772b5211587e595e4a)



### 🧹 Chores

- 🧹 [chore] Update dependencies and enhance project tooling

This commit introduces a wide range of updates, primarily focused on dependency upgrades, tooling enhancements, and internal refactoring for improved code quality and maintainability.

✨ **[feat] Feature Enhancements**
- 🤝 Enhances the `sites:state-synchronized` event payload to include an optional `delta` object, providing more granular details about site additions, removals, and updates during state synchronization.

🚜 **[refactor] Code Refactoring**
- 📦 Moves shared type definitions for `SiteSyncDelta` into a dedicated file (`src/stores/sites/siteSyncDelta.ts`) to improve modularity and clarify its scope within the renderer.
- 🚚 Relocates the `getCachedSiteCount` method in `UptimeOrchestrator` for better code organization without changing its functionality.
- 🧹 Removes an unnecessary `async` keyword from the `get-sync-status` IPC handler, as the underlying operation is synchronous.
- 🎨 Minor reordering of properties in type definitions and log statements for consistency.

🔧 **[build] Build & Tooling**
- 📦 Upgrades numerous production and development dependencies, including `electron`, `vitest`, `axios`, `eslint`, and their related plugins, to their latest versions.
- ⚙️ Adds a new `.madgerc` configuration file to customize the output of the `madge` dependency graphing tool.
- 警告 Adds the `--warning` flag to the `madge:circular` script to treat circular dependencies as non-fatal warnings.
- 📜 Enables new ESLint rules from `eslint-plugin-unicorn` (`no-useless-collection-argument`, `no-immediate-mutation`, `prefer-response-static-json`) to catch potential issues.

🧪 **[test] Testing**
- 🦾 Strengthens test mocks and spies in `MonitorRepository.simple.test.ts` with more accurate types and robust assertions, improving test reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a57084b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a57084b4f8fc6998c0978b0bafa196ec2889f4b3)






## [17.6.0] - 2025-10-27


[[cb96c21](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cb96c21ed015d63e00bf7ee5b00418a7bd63e45f)...
[cb96c21](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cb96c21ed015d63e00bf7ee5b00418a7bd63e45f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/cb96c21ed015d63e00bf7ee5b00418a7bd63e45f...cb96c21ed015d63e00bf7ee5b00418a7bd63e45f))


### 🚜 Refactor

- 🚜 [refactor] Extract coordinator and type definitions from UptimeOrchestrator

This commit refactors the `UptimeOrchestrator` to improve modularity and separation of concerns.

### Source Code Changes

🚜 **[refactor]** Extracts history limit logic into a new `HistoryLimitCoordinator`.
-   This new coordinator class encapsulates the responsibility of listening for history limit updates from the database, validating the new limit, and forwarding the event to the renderer.
-   It maintains the last known limit to provide `previousLimit` telemetry in the forwarded event.
-   `UptimeOrchestrator` now instantiates and uses this coordinator, simplifying its own logic by removing the `handleDatabaseHistoryLimitUpdatedEvent` method and related properties.

📝 **[docs]** Moves `UptimeOrchestrator` type definitions to a dedicated `UptimeOrchestrator.types.ts` file.
-   This cleans up the main orchestrator file, separating complex interface declarations from the implementation logic.

🎨 **[style]** Improves site sanitization logic in `SiteManager`.
-   Replaces the direct usage of `sanitizeSitesByIdentifier` with a local `getSanitizedSitesForManager` function that returns a strongly-typed snapshot. This enhances clarity and type safety within the manager.
-   The `sanitizeSitesByIdentifier` function in the shared `siteIntegrity.ts` file is simplified for better readability.

🔧 **[build]** Standardizes Electron bridge readiness checks across the frontend.
-   Updates `createIpcServiceHelpers` to use a new centralized `waitForElectronAPI` utility.
-   The `waitForElectronAPI` function in `stores/utils.ts` is enhanced to accept an optional array of bridge contracts to validate.
-   Various service files (`EventsService`, `StateSyncService`) are updated to use the new validation patterns for event cleanup handlers, improving code consistency.

### Test and Development Changes

🧪 **[test]** Adds comprehensive tests for the new `HistoryLimitCoordinator`.
-   Verifies correct event forwarding, telemetry (`previousLimit`), and handling of invalid or negative limit values.

🧪 **[test]** Updates numerous test files to reflect the refactoring of the Electron bridge readiness checks.
-   Mocks are updated from `waitForElectronAPI` to the underlying `waitForElectronBridge` utility.
-   This affects tests for `DataService`, `EventsService`, `SettingsService`, `SystemService`, `MonitoringService`, `SiteService`, and several store hooks (`useSettingsStore`, `useSitesStore`), ensuring they align with the new initialization logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(cb96c21)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cb96c21ed015d63e00bf7ee5b00418a7bd63e45f)






## [17.5.0] - 2025-10-27


[[738962d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/738962d6cc50bf24dc85a72bb7ee753ad9be4a43)...
[7cce37e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7cce37e8603d8f25e5d924f2be6f06fde4979326)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/738962d6cc50bf24dc85a72bb7ee753ad9be4a43...7cce37e8603d8f25e5d924f2be6f06fde4979326))


### ✨ Features

- ✨ [feat] Add DevTools snippets and improve data integrity

This update introduces a suite of developer tools and significantly enhances the application's data integrity by preventing duplicate site entries.

✨ [feat] Add Chrome DevTools Snippets for Testing
-   Adds a new `DEVTOOLS_SNIPPETS.md` guide.
-   Provides JavaScript snippets to run in the DevTools console for easier testing and debugging.
-   Snippets include:
    -   `Add Test Sites`: Creates a comprehensive set of test sites, one for each monitor type.
    -   `Add Minimal Test Sites`: Quickly adds a few basic sites for rapid testing.
    -   `Remove All Sites`: Deletes all sites from the application (with a confirmation prompt).
    -   `List All Sites`: Prints a detailed list of all configured sites to the console.
-   Also adds several snippets for pausing the debugger on hover or after a delay to inspect UI elements.

🛠️ [fix] Implement Duplicate Site Sanitization
-   Introduces a `sanitizeSitesByIdentifier` utility to detect and remove sites with duplicate identifiers, keeping only the first occurrence.
-   The `SiteManager` now sanitizes site data when updating its cache, preventing duplicates from being stored or processed.
-   Full state synchronization requests now return a sanitized list of sites, ensuring the UI does not display duplicates.

🚜 [refactor] Improve Electron Bridge Readiness Checks
-   Replaces the basic `waitForElectronAPI` function with a more robust `waitForElectronBridge` utility.
-   This new system allows renderer services to declare their specific API "contracts" (required domains and methods).
-   If the `electronAPI` bridge is not ready or a contract is not met after several retries, it throws a detailed `ElectronBridgeNotReadyError` with diagnostics, improving debuggability.
-   All renderer services are updated to use this new, more reliable initialization check.

📝 [docs] Create DevTools Snippets Guide
-   Adds a comprehensive guide (`DEVTOOLS_SNIPPETS.md`) detailing how to use the new testing snippets.
-   Includes instructions, troubleshooting tips, and the full code for each snippet.

🧪 [test] Update Tests for New Logic
-   Adjusts unit and comprehensive tests to align with the new duplicate sanitization logic and the refactored `emitSitesStateSynchronized` method.
-   Adds new tests for the `electronBridgeReadiness` utility.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7cce37e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7cce37e8603d8f25e5d924f2be6f06fde4979326)


- ✨ [feat] Add IPC artifact generation and drift detection

This commit introduces a comprehensive system for managing and verifying Inter-Process Communication (IPC) contracts, ensuring consistency between the main process, renderer, and documentation. It adds a new script to automatically generate IPC type definitions and documentation from the source code.

✨ [feat] IPC and Event System Enhancements
- Adds a new script (`generate-ipc-artifacts.mts`) to auto-generate the `eventsBridge.ts` type definitions and the `ipc-channel-inventory.md` documentation file from canonical source definitions.
- Introduces a new CI check (`npm run check:ipc`) to prevent drift between the source code and generated artifacts, ensuring the IPC contract remains consistent.
- Adds `fast-deep-equal` to the knip ignore list, as it is a dependency of the new generation script.

📝 [docs] New Renderer Integration Guide
- Adds a comprehensive `RENDERER_INTEGRATION_GUIDE.md` to document the updated IPC contract, patterns for optimistic UI updates, and history limit synchronization.
- Updates the main documentation index to include the new guide.

🛠️ [fix] Improve IPC Event Handling and Preload Guards
- Refactors the preload `eventsApi` to add more specific type guards for `monitoring:started`, `monitoring:stopped`, and `state-sync-event` payloads, improving runtime safety.
- Alphabetizes event channel definitions and handler registrations for better organization and consistency with generated artifacts.

🚜 [refactor] Strengthen `UptimeOrchestrator` Logic
- Improves the handler for manual monitor checks (`handleManualCheckCompleted`) by destructuring the event payload more robustly and ensuring monitor/site data is always enriched before being broadcast to the renderer.
- Adds robust initialization logic for the history retention limit, falling back to a default value if the `DatabaseManager` fails or returns an invalid number.

🎨 [style] Minor CSS and Code Style Adjustments
- Adjusts CSS for the compact site card header to improve wrapping and alignment of elements.
- Sorts properties in various event type definitions and log templates for improved readability and consistency.

🧪 [test] Update and Expand Test Coverage
- Updates Jest and Playwright tests to align with the refactored event handling and new IPC contract.
- Adds a test utility to reset the history limit subscription, enabling more reliable testing of the settings store's initialization logic.
- Corrects mock setups and test logic to use the updated, alphabetically sorted event API.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9d8628e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9d8628e08372a0ad5fcbe46da73ccabdfe76e427)


- ✨ [feat] Implement optimistic updates and IPC automation

This commit introduces significant enhancements to the application's IPC protocol, state synchronization, and developer tooling.

✨ [feat] Optimistic UI Updates & Event Sync
- Implements optimistic updates for manual monitor checks. The UI now reflects the check result immediately by applying the returned `StatusUpdate` payload, rather than waiting for the event broadcast.
- Introduces a new `settings:history-limit-updated` event to synchronize database retention policy changes (e.g., from imports or migrations) with the renderer's settings store, ensuring UI consistency. The payload includes both new and previous values for contextual display.

🚜 [refactor] Standardize IPC Channel Naming
- Overhauls the IPC channel naming convention from `domain:action` (e.g., `sites:add`) to a verb-first, hyphenated format (e.g., `add-site`). This improves clarity and consistency across the API surface.
- Broadcast event channels retain their `domain:event-name` structure to distinguish them from invoke channels.

🛠️ [tooling] Automate IPC Artifact Generation
- Adds new npm scripts to automate IPC contract management:
  - `npm run generate:ipc`: Rebuilds the preload bridge type definitions and generates a canonical IPC channel inventory markdown file.
  - `npm run check:ipc`: A CI script to detect and prevent drift between the source code schema and the generated documentation.

📝 [docs] Update Architecture & Development Guides
- Updates all relevant documentation, including ADRs, development guides, and API references, to reflect the new IPC naming convention and synchronization patterns.
- Adds a new auto-generated `ipc-channel-inventory.md` file as the single source of truth for all IPC channels.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(43e770d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/43e770d40d2ec9d2491cd05b2f07b69a7d06a987)



### 🛠️ Other Changes

- 🔧 [refactor] Centralize site addition source metadata and improve event handling 🎯

Refactors site addition event sourcing to provide better traceability of where sites originate (user creation, imports, or migrations).

**Source Code Changes:**

- ✨ Extracts site addition source types into shared event types module, making `SiteAddedSource` and `SITE_ADDED_SOURCE` constants universally accessible across preload, main, and shared layers
  - Defines canonical enum-like constants (`IMPORT`, `MIGRATION`, `USER`) with frozen object pattern for type safety
  - Replaces inline string literals throughout codebase with centralized constants

- 🎯 Updates `SiteManager.addSite()` to accept optional source metadata via options parameter, defaulting to user-initiated additions
  - Passes source information through internal event emissions for proper audit trail

- 📡 Enhances `UptimeOrchestrator` to preserve and forward source metadata when processing internal site addition events
  - Ensures source context flows from backend services through to renderer event listeners

- 💾 Implements automatic source tracking during data imports in `DatabaseCommands`
  - Emits individual `internal:site:added` events for newly imported sites with `IMPORT` source
  - Replaces batch processing with per-site event emissions for granular change tracking

- 🔌 Updates preload API layer and event type definitions to use centralized source types

**Supporting Changes:**

- 🛠️ Improves error handling in main process hot reload logic with better null checks and service container validation
  - Adds `ensureError()` utility calls for consistent error normalization
  - Prevents crashes when service container or windows unavailable during reload

- 📚 Updates API documentation with clarified method signatures and behavior descriptions
  - Reflects renamed IPC handlers and updated parameter types
  - Improves examples with source metadata usage

- 🧪 Adds comprehensive test coverage for source metadata propagation through event pipeline
  - Validates custom source preservation in site manager
  - Tests import command properly emits source-tagged events

- ⬆️ Upgrades development dependencies (Biome 2.3.0, Storybook 9.1.15, Vitest 4.0.3, Tailwind 4.1.16, etc.)
- 🔧 Configures ESLint recheck-jar path resolution for improved regex validation linting
- 🎨 Applies formatting improvements and mock function naming conventions for test clarity

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(88d0f97)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88d0f97ce2fa661ec0167c11dfb1510b8da6ca55)



### 🚜 Refactor

- 🚜 [refactor] Relocate settings management to a dedicated domain

🚜 [refactor] Creates a new `settings` IPC domain and moves all settings-related functionality out of the `data` domain. This improves code organization and clarifies the separation of concerns between general data operations (import/export, backups) and application settings management.
- Moves `resetSettings`, `getHistoryLimit`, and `updateHistoryLimit` from the `data` API domain to a new `settings` API domain.
- Creates a dedicated `setupSettingsHandlers` method in `IpcService` to register all settings-related IPC channels.
- Establishes a new `SettingsHandlerValidators` group for IPC parameter validation, separating it from `DataHandlerValidators`.

🛠️ [fix] Enhances site synchronization logic to handle duplicate identifiers.
- Introduces a `sanitizeSitesSnapshot` utility to detect and remove duplicate sites received from the backend during state synchronization.
- The first occurrence of a site is kept, and any subsequent duplicates are discarded to prevent store corruption.
- Adds detailed logging when duplicates are detected to improve observability.

⚡ [perf] Adds robust cleanup validation for event service subscriptions.
- Implements a new `subscribeWithValidatedCleanup` utility to ensure that all event subscriptions return a valid cleanup function from the preload bridge.
- Provides fallback cleanup handlers and logs detailed errors if an invalid value (e.g., `undefined`) is returned, preventing potential memory leaks and runtime errors.

📝 [docs] Updates API documentation to reflect the new `settings` domain.
- Moves the `resetSettings` function documentation from the Data API section to the new Settings API section.

🧪 [test] Updates and expands tests for the new `settings` domain and enhanced cleanup logic.
- Refactors tests for `IpcService`, preload APIs, and frontend services to align with the new domain structure.
- Adds comprehensive tests for the `EventsService` to verify correct handling of invalid cleanup handlers and cleanup errors.
- Adds property-based tests to ensure the `useSiteSync` hook correctly sanitizes payloads with duplicate site identifiers.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d336379)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d3363795b6a071a92cfe1f12b5b4ce18c6916623)


- 🚜 [refactor] Clarify monitoring API and standardize IPC handling

This commit refactors the monitoring API for clarity, improves IPC handling, and enhances event data validation and context.

✨ [feat] Introduce explicit monitoring API methods
-   Splits the ambiguous `startMonitoringForSite` and `stopMonitoringForSite` methods, which previously used an optional `monitorId`, into distinct functions:
    -   `startMonitoringForMonitor` / `stopMonitoringForMonitor`: Target a single monitor and require a `monitorId`.
    -   `startMonitoringForSite` / `stopMonitoringForSite`: Target all monitors within a site.
-   This change improves API ergonomics and removes ambiguity for developers.

🚜 [refactor] Standardize `quitAndInstall` IPC handling
-   Migrates the `quit-and-install` IPC call from `ipcMain.on` to `ipcMain.handle`.
-   This makes it an async, promise-based operation consistent with other IPC handlers, allowing the renderer to await confirmation.
-   The renderer-side `SystemService` is updated to `await` this call and handle potential errors.

⚡ [perf] Enhance event payload validation
-   Replaces local, manual type guards in the preload script (`eventsApi.ts`, `stateSyncApi.ts`) with robust, schema-based validators (`validateSiteSnapshot`, `safeParseStateSyncEventData`) from the shared package.
-   This strengthens type safety at the IPC boundary and centralizes validation logic.

✨ [feat] Add `cascade` flag to site removal events
-   Introduces a `cascade: boolean` flag to `internal:site:removed` events.
-   This flag differentiates between single site removals (`cascade: false`) and bulk removal operations (`cascade: true`), providing more context to event listeners.

📝 [docs] Update API documentation
-   Refreshes `API_DOCUMENTATION.md` to reflect the new, more explicit monitoring methods (`start/stopMonitoringForMonitor` and `start/stopMonitoringForSite`).

🎨 [style] Adjust compact site card layout
-   Updates the CSS for the compact site card status section to use `display: grid` for better alignment and responsiveness on smaller screens.

🧪 [test] Update tests for API and IPC changes
-   Aligns unit and comprehensive tests across the application to match the refactored monitoring API, standardized `quitAndInstall` IPC handling, and new event validation logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(753769f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/753769f0b036cd1ac856956dee3bfb167c59cb56)


- 🚜 [refactor] Use RendererEventPayloadMap for site event typings and add TODO prompt

 - 🚜 [refactor] Replace RENDERER_EVENT_CHANNELS + RendererEventPayload usage with RendererEventPayloadMap['site:added' | 'site:removed' | 'site:updated'] to derive site event payload types; remove unused imports and decouple channel constants from payload types (shared/types/eventsBridge.ts, src/services/EventsService.ts).
 - 📝 [docs] Add .github/prompts/Add-To-ToDo.md: BeastMode agent prompt to generate and maintain a comprehensive TODO.md (clear existing TODOs, capture full context, list dependencies/estimates, implement, test, and iterate).

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(738962d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/738962d6cc50bf24dc85a72bb7ee753ad9be4a43)






## [17.3.0] - 2025-10-24


[[6de39e8](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6de39e86c86fb54e87df6a366275912f1c9d7ad8)...
[44c5964](https://github.com/Nick2bad4u/Uptime-Watcher/commit/44c5964cf784cb36e0e34b96ec0c100b739fb19c)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/6de39e86c86fb54e87df6a366275912f1c9d7ad8...44c5964cf784cb36e0e34b96ec0c100b739fb19c))


### ✨ Features

- ✨ [feat] Enhance Storybook and code coverage

This commit introduces several enhancements and fixes across the Storybook configuration, code quality checks, and test suites.

- 🧪 [test] Adds a function coverage boost to call every exported function from low-coverage modules
 - Maximizes coverage by invoking functions with different argument combinations and tolerating exceptions
 - Prevents noisy console output during coverage boosting by overriding function-specific arguments
 - Registers low-coverage modules for coverage boosting
- 📝 [docs] Updates Copilot instructions to clarify terminal output handling
 - Redirects terminal output to files only for linting, testing, or type-checking commands
- 🛠️ [fix] Normalizes Storybook story paths for broader compatibility
 - Resolves issues with relative paths in Storybook configurations
 - Ensures correct story loading by normalizing story paths
- 👷 [ci] Adds a new test command to verify accessibility of storybook components
- 🛠️ [fix] Addresses TypeScript errors in monitor services
 - Simplifies configuration resolvers in `ReplicationMonitor` and `ServerHeartbeatMonitor` to address TypeScript issues
- 🧹 [chore] Updates dependencies, including `@tailwindcss/postcss` and `vite`, in `package-lock.json` and `package.json`
- 📝 [docs] Adds tsconfig files for storybook to prevent eslint errors
- 🛠️ [fix] Fixes storybook test glob pattern
 - Avoids issues caused by extglob tokens on Windows systems
- 🛠️ [fix] Ensures node web storage shims are registered before Storybook config loads
- ✨ [feat] Adds accessibility test mode to storybook
 - Allows setting of accessibility test mode

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(eb24cda)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eb24cdafb80ba9543548c4f8dbec05cbe4d2434f)


- ✨ [feat] Enhance state synchronization

This commit introduces a dedicated state synchronization service and improves event handling for real-time updates.

- 🔄 [refactor] Migrates state synchronization logic to `StateSyncService`
 - Centralizes state management and simplifies event handling.
 - Improves code organization and maintainability.
- 📡 [feat] Introduces `requestFullSync` for authoritative site snapshots.
 - Enables complete data refresh, ensuring consistency across renderers.
 - Emits `sites:state-synchronized` event for renderer updates.
- 👂 [feat] Adds `onStateSyncEvent` for incremental state sync events.
 - Supports bulk-sync, update, and delete actions.
 - Provides a cleanup function for unsubscribing listeners.
- 🪵 [chore] Updates event listeners and store integrations
 - Modifies `window.electronAPI.events` to focus on monitoring, cache invalidation, update status, and diagnostic test events.
 - Simplifies event listener registration and cleanup.
- 🎨 [style] Aligns source of state sync events to frontend
- 🧪 [test] Updates tests to reflect changes in state synchronization

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7e8f4e5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e8f4e525c9e4316a7bea56bdd4c4cfe0f25c437)


- ✨ [feat] Enforce shared contract interface consistency

Adds an ESLint rule to prevent duplicate interface declarations.

 - 💡 Introduces a new ESLint rule to enforce the usage of shared contract interfaces from the `@shared` package, preventing local redeclarations.
 - 📝 Updates the consistency guide to reflect the new linting rule and best practices for shared contract interfaces.
 - 🧪 Adds a test to ensure that all typed invoke channels have a registered handler, increasing contract consistency.
 - 🛠️ Refactors the `MonitorTypeOption` interface to be shared between the renderer and backend, ensuring consistent labeling and identification.
 - 🎨 Updates CSS to improve UI consistency and responsiveness across different screen sizes.
 - 🐛 Fixes an issue with safe number conversions where boolean inputs were not handled correctly, resulting in incorrect default values.
 - 🐛 Fixes an issue where `normalizeMonitor` was not providing a default URL for HTTP monitors.
 - ⚡️ Improves the fallback logger by switching to `electron-log` for structured logging in renderer processes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6de39e8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6de39e86c86fb54e87df6a366275912f1c9d7ad8)



### 🛠️ Bug Fixes

- 🛠️ [fix] Enhance site state management and validation

This commit improves site state management and data validation throughout the application.

- 🛠️ **Improves data validation for site snapshots**:
 - Introduces shared runtime validation guards using Zod schemas to ensure data consistency between renderer and main processes.
 -  This prevents accidental data corruption and ensures adherence to shared type definitions.
 -  Adds validation to `addSite`, `getSites`, and `updateSite` operations in `SiteService` to validate site snapshots returned from the backend, throwing errors and logging details for invalid snapshots.
- 🛠️ **Refactors site state synchronization**:
 -  Enhances state synchronization events by including more comprehensive information, such as the action type, site identifier, and source of the event (e.g., database, cache).
 -  Adds `emitSitesStateSynchronized` to consolidate emitting state sync events.
 - Ensures state synchronization events are emitted after site modifications, such as adding, updating, or deleting sites, to maintain consistency across the application.
- 🛠️ **Streamlines site deletion process**:
 - Removes monitor stop calls while removing sites, relying on orchestrator-managed removal.
 - This simplifies the deletion process and reduces potential errors.
- 🧹 **Updates linter configurations**:
 - Adds a new Remark plugin (`require-snippets.mjs`) to enforce the presence of specific code snippets in documentation files, ensuring critical references are maintained.
 - Adds `.remarkignore` and `.stylelintignore` to exclude generated files and directories from linting, improving linting performance and reducing noise.
- 🧪 **Enhances test coverage**:
 - Adds property-based testing for URL validation to improve the robustness of URL validation logic.
 - Adds comprehensive tests for SiteManager to verify state synchronization and data consistency.
 - Updates mock implementations and test cases to align with the new validation and state management logic, ensuring thorough test coverage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(08e57db)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/08e57dbf2c268ca2970a03c63ed1259f9ea30e72)


- 🛠️ [fix] Refactor monitor removal workflow for reliability

This commit refactors the monitor removal process to improve reliability and data consistency.

- ♻️ **Orchestrator-Owned Monitor Deletion**: Changes the monitor deletion process to be orchestrated by the backend, ensuring data consistency and reliability.
   - 🔄 The `removeMonitor` function in `UptimeOrchestrator` now returns the updated `Site` snapshot after the monitor has been removed, instead of a boolean.
   - 🛠️ The `SiteManager.removeMonitor` method now returns the updated `Site` snapshot after monitor removal, throwing an error if the updated site is not found.
   - 🗑️ Removes the compensation logic in `UptimeOrchestrator` as the operation is now considered complete when the database update succeeds.
   - 🧪 Updates tests in `UptimeOrchestrator.test.ts` to reflect the change in return type and error handling.
- 💾 **State Management**: Updates the frontend state management to align with the backend changes.
   - ⚛️ The `SiteService.removeMonitor` now returns a Promise resolving to the updated `Site` record.
   - ⚛️ Updates `useSiteOperations.ts` to use `applySavedSiteToStore` to persist the backend snapshot, ensuring duplicate identifier detection, logging, and future invariants remain centralized.
   - 📝 Updates TSDoc in `stores/sites.md` to reflect the new monitor removal workflow and the use of `applySavedSiteToStore`.
- 🛡️ **Validation**: Enhances data validation and error handling.
   - 📝 Adds a new guide, `validation-strategy.md`, detailing the application's layered validation pipeline and principles.
   - 🚨 Adds validation checks in `SiteService` to ensure the returned site snapshot is valid.
- 🧪 **Testing**: Updates tests to ensure correct behavior with the new workflow.
   - 🧪 Updates `electron/test/preload/core/bridgeFactory.comprehensive.test.ts` and `electron/test/preload/domains/sitesApi.comprehensive.test.ts` to check for the correct return value.
   - 🧪 Updates `src/test/mock-setup.ts` and `src/test/setup.ts` to return a mock site snapshot.
   - 🧪 Updates `src/test/stores/sites/useSiteOperations.targeted.test.ts` to test the new workflow and error handling.
- ⚡ **Performance**: Improves performance by debouncing duplicate site update invalidations.
   - ⏱️ Adds a debounce mechanism to `src/utils/cacheSync.ts` to prevent multiple full resyncs for site updates within a short period.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ca8f2a4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ca8f2a4c6a167fba2d15595ac4730811cb081cea)


- 🛠️ [fix] Enhance external URL handling and validation

This commit improves the application's handling of external URLs, focusing on security, user experience, and maintainability.

- ✨ Enhances URL validation and error handling for `openExternal` functionality.
 - Validates URLs before navigation to prevent opening unsafe links.
 - Improves error reporting by providing more descriptive error messages to the user.
 - Adds logging for invalid URL attempts to aid debugging and security monitoring.
- 🛠️ Updates `SystemService` to enforce URL validation before attempting to open external links.
 -  Ensures that only `http://` and `https://` URLs are allowed, blocking other schemes.
 -  Throws a `TypeError` synchronously if an invalid scheme is detected, preventing further processing.
 -  Logs errors when unsafe URLs are rejected.
- 📝 Updates documentation to reflect changes in `openExternal` behavior and recommendations.
 -  Clarifies that `openExternal` in the System API now returns a boolean.
 -  Recommends using the `SystemService` for accessing `openExternal` due to its added safety features.
- 🎨 Refactors UI components to improve aesthetics and user experience.
 - Updates the appearance of site cards, tables, and history tabs with new styling and visual enhancements.
 - Improves the layout and spacing in settings sections for better readability.
- 🧪 Adds comprehensive test coverage for URL validation and handling in `SystemService`.
 -  Ensures that valid URLs are correctly opened and invalid URLs are blocked.
 -  Verifies that appropriate errors are thrown and logged for invalid URLs.
- ⚡ Improves the UI Store's `openExternal` function to prevent opening invalid external URLs.
 - Adds a check to ensure that the URL starts with `http(s)://`.
 - If the URL is invalid, logs a warning and sets an error in the error store.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(29b85d8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/29b85d83fc9aa6752e8d896083dd597a1848fb87)


- 🛠️ [fix] Enhance code quality and validation

This commit improves code quality, enhances validation, and refactors various parts of the application.

- 🛠️ Ensure payloads mirror original event data contracts by omitting event bus metadata during forwarding.
   - The orchestrator expects pristine payloads that mirror the original event data contracts.
   - Manager event buses append `_meta` and `_originalMeta` fields for diagnostics; this change strips those fields while leaving the rest of the structure untouched.
- 🛠️ Enhance monitor configuration property validation to prevent silent drift between processes.
   - Throws when unexpected monitor configuration properties are detected.
   - Fails fast whenever a registry entry contains keys the renderer is not prepared to consume.
- 🛠️ Refactor UI config serialization for monitor types, improving type safety and data handling.
   - Normalizes optional string and boolean properties with fallback values.
   - Streamlines serialization logic for detail formats, display preferences, and help texts.
 - 🛠️ Improve type safety and validation for monitor type configurations.
   - Adds runtime type guards for `MonitorFieldDefinition` and `MonitorTypeConfig`.
   - Implements comprehensive validation checks for field types, options, and UI configurations.
- 🛠️ Update Storybook configuration to correctly map stories and ensure proper initialization in Node environments.
   - Adds a shim to provide a minimal Web Storage API in Node-based Storybook environments.
   - Updates story mapping to handle relative paths correctly.
- 🛠️ [dependency] Update eslint-plugin-exception-handling 1.5.5
- 🛠️ [dependency] Update eslint-plugin-fsecond 1.4.0
- 🛠️ [dependency] Update eslint-plugin-node-dependencies 1.2.0
- 🛠️ [dependency] Update eslint-plugin-unused-imports 4.3.0
- 🛠️ [dependency] Update msw 2.11.6
- 🛠️ Remove extraneous shared dependencies.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(63c707a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/63c707a0549460198ac992efd8d3da205d5f2380)


- 🛠️ [fix] Enforce site identifier uniqueness

This commit addresses potential data integrity issues by ensuring the uniqueness of site identifiers across the application.

- 🛠️ **Introduces validation for site identifier uniqueness:**
  - Implements `collectDuplicateSiteIdentifiers` and `ensureUniqueSiteIdentifiers` in `shared/validation/siteIntegrity.ts` to detect duplicate identifiers.
  - Integrates these utilities into the `SitesStore` and `SiteManager` to validate site data before state updates.
  - This prevents the introduction of duplicate site entries, surfacing any integrity breaches through `DuplicateSiteIdentifierError` to avoid masking backend regressions.
 - 📝 **Updates documentation:**
  - Adds notes to the architecture guides to explain the helper functions.
- 🧪 **Adds comprehensive tests:**
  - Adds new tests to verify the correct behavior of the new data validation logic.
- 🧹 **Refactors existing functions:**
  - Removes unused handleSiteAdded, replaces it with handleStateSyncEvent, which now uses setSites on bulk sync or update.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a9319e8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a9319e836b1cee56ce108d8b313b380452f76404)


- 🛠️ [fix] Improves IPC handler and cache invalidation

This commit enhances the robustness and efficiency of IPC communication and cache management.

- ♻️ Refactors IPC response handling to use a shared type from `@shared/types/ipc`, promoting consistency across the application layers and reducing code duplication.
- ⚡ Implements a new `executeIpcHandler` utility to streamline IPC handler execution, including detailed logging and error handling, improving maintainability and debugging.
   - ➖ This utility also reduces logging spam for high-frequency operations.
- 💾 Updates state synchronization to use `DATABASE` as the source of truth instead of `FRONTEND`, ensuring data consistency and preventing potential conflicts.
- 🧹 Simplifies data export/import error handling by introducing a central `handleDataOperationFailure` method, reducing redundancy and improving error reporting.
- 🧪 Updates tests to reflect changes in state synchronization source, ensuring continued correctness.
- 🧪 Updates and standardizes environment variable handling for Playwright tests to ensure consistency and prevent unexpected behavior.
- 🔧 Updates the zero-coverage Vitest configuration to properly export the configuration.
- 📝 Adds the zero-coverage Vitest config file to eslint.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ccdd5d8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ccdd5d8278f252561a7377c317b0ceb171a41d46)



### 🚜 Refactor

- 🚜 [refactor] Reorganize test files and improve orphan test script

This commit refactors the project's test file structure and enhances the script for finding orphaned tests.

🧹 [chore] Moves test files to dedicated `test` directories.
 - Test files previously co-located with source code in `src/` and `shared/` are now organized into `src/test/` and `shared/test/` respectively.
 - This improves project structure and separates test code from implementation code.
 - Updates relative import paths within the moved test files to reflect their new locations.

🔧 [build] Enhances the `Find-OrphanedTests.ps1` script.
 - Adds `playwright/tests` to the list of main directories to scan for tests.
 - Expands test file patterns to include Playwright (`.playwright.ts`), Cypress (`.cy.ts`), E2E (`.e2e.ts`), and module TypeScript (`.mts`) test files.
 - Improves the exclusion list to ignore common cache (`.cache`, `.tmp`), build (`out`), and temporary (`temp`) directories, as well as the script itself.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(44c5964)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/44c5964cf784cb36e0e34b96ec0c100b739fb19c)


- 🚜 [refactor] Improve service initialization and update dependencies

This commit introduces several refactorings, dependency updates, and test improvements across the codebase. The most significant change is the enhancement of the service initialization logic in the `ServiceContainer` to more robustly handle both synchronous and asynchronous initializers.

### Source Code Changes

*   **🚜 [refactor] `electron/services/ServiceContainer.ts`:**
    *   Improves the service initialization process to correctly handle methods that return a `Promise` and those that do not.
    *   A new `isPromiseLike` type guard is introduced to check if an initializer's return value has a `then` method.
    *   The `tryInitializeService` method now conditionally `await`s the result only if it's a promise, making the system more flexible.
    *   The type for `PossiblyInitializableService`'s `initialize` method is simplified.

*   **🎨 [style] `src/services/EventsService.ts`:**
    *   Corrects formatting for JSDoc code examples.
    *   Standardizes import statements for better consistency.

*   **🎨 [style] `shared/types/eventsBridge.ts`:**
    *   Standardizes import statement formatting.

### Build & Configuration

*   **🔧 [build] Vitest Configurations:**
    *   Updates several Vitest configuration files (`vitest.config.ts`, `vitest.zero-coverage.config.ts`, `vitest.storybook.config.ts`) to use the renamed `ViteUserConfigFnObject` type from `vitest/config`.
    *   Adds `as any` type assertions to work around outdated or incomplete type definitions in Vitest and its coverage plugins, silencing type errors.
    *   Disables specific ESLint rules in configuration files where type overrides are necessary.

### Test Suite Improvements

*   **🧪 [test] General Test Refinements:**
    *   Removes unused imports and variables from several test files, cleaning up the test code.
    *   Replaces numeric separators (e.g., `5_000`) with standard integers (`5000`) in test timeouts for consistency.
    *   Converts `NodeList` collections to arrays using `Array.from()` before iteration to prevent potential issues with live collections during DOM manipulation in tests.

*   **🧪 [test] `electron/test/setup.ts`:**
    *   Refactors `fs` mock creation by adding explicit type casts to mocked functions, improving type safety and clarity within the test setup.

*   **🧪 [test] `src/test/utils/cacheSync.test.ts`:**
    *   Refactors the setup for store mocks (`useMonitorTypesStore`, `useSitesStore`) to be more direct and less reliant on `vi.spyOn` with complex implementations, simplifying the test structure.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(26794e9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26794e9ce30c8283b3fcb3b24ec194bd28cdf8a0)


- 🚜 [refactor] Improve service initialization and modernize test mocks

This commit introduces several refactoring improvements across the application, focusing on enhancing the service initialization process and standardizing the mocking strategy in tests for better debugging and maintainability.

### Source Code Changes 🚀

*   **🔧 [build] Refactor Service Initialization**
    *   Introduces a `tryInitializeService` helper in the `ServiceContainer` to safely call optional `initialize` methods on services.
    *   Adds a `hasInitializeMethod` type guard for improved type safety and robustness during the application's bootstrap sequence.
    *   Adds debug logging for services that do not have an initializer, improving diagnostics.

*   **🛠️ [fix] Correct DNS Resolution Promise Typing**
    *   Fixes a type issue in the `checkDnsResolution` utility where a timeout promise was incorrectly typed, preventing potential runtime errors.

*   **🎨 [style] Modernize Property Checking**
    *   Replaces `Object.prototype.hasOwnProperty.call()` with the more modern and direct `Object.hasOwn()` in `WindowService`.

### Test Suite Enhancements 🧪

*   **🚜 [refactor] Standardize Mocking Strategy**
    *   Replaces anonymous arrow functions in `vi.fn()` with named functions (e.g., `vi.fn(function MyMock() { ... })`) across numerous test files. This greatly improves debugging by providing meaningful names in stack traces.
    *   Introduces a `createConstructableMock` helper to simplify the creation of mock classes, ensuring consistency and reducing boilerplate.

*   **🧪 [test] Improve Test Isolation and Accuracy**
    *   Enhances test isolation by resetting mock states and using `mockImplementationOnce` where appropriate, particularly in `ApplicationService` tests.
    *   Corrects a test assertion in `ServiceContainer.fixed.test.ts` to reflect the expected behavior accurately.
    *   Adds explicit timeouts to several long-running database repository tests to prevent CI hangs.

*   **🧹 [chore] Update Test Utilities and Mocks**
    *   Improves the `node:fs` mock in the global test setup to be more robust by delegating to the actual module while allowing specific functions to be spied on or replaced.
    *   Refactors test hooks in `renderHook` calls to include cleanup (`unmount`) to prevent memory leaks between tests.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(afa27fa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/afa27fad81ede0afa3922048ea7ed612bb7b7759)


- 🚜 [refactor] Refine monitor config serialization

Refactors the monitor configuration serialization process for improved type safety and error handling.

- ⚙️  Enhances the monitor type configuration serialization within the IPC service to ensure safer data transmission between processes.
   -  Replaces the `SerializedMonitorTypeConfig` interface with direct usage of `MonitorTypeConfig`, leveraging runtime type guards (`isMonitorTypeConfig`, `isMonitorFieldDefinition`) for validation.
   -  This approach ensures that only valid configurations are processed, preventing runtime errors due to unexpected or malformed data.
 - 🚨 Implements strict validation of monitor configurations to fail fast on unexpected properties.
   - Introduces `assertNoUnexpectedProperties` to immediately throw an error if a configuration contains properties not explicitly defined in the `MonitorTypeConfig`.
   -  This prevents silent data drift and ensures that configurations adhere to the expected schema.
 - 🔍 Improves error logging and diagnostics for invalid monitor configurations.
   -  Adds detailed error messages and logging when invalid configurations are detected, including the type of monitor and the unexpected properties found.
   -  This aids in debugging and maintaining configuration integrity.
- 🧪 Adds comprehensive unit tests for monitor type guards.
   - Introduces new tests to validate the runtime type guards for `MonitorFieldDefinition` and `MonitorTypeConfig`.
   -  These tests ensure that the guards correctly identify valid and invalid configurations, providing confidence in the validation process.
- ♻️ Updates the monitor types store to filter and log invalid monitor configurations.
   - Modifies the store to filter out invalid configurations using `isMonitorTypeConfig` before updating the state.
   - Logs detailed information about the invalid configurations, including their index and type, to aid in debugging.
- 🧱 Modifies site store synchronization to validate sites.
   - Adds validation of sites to the site store synchronization.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7687412)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7687412a1a757204d2548e5a5d2bd83a2ef93d6a)



### 📝 Documentation

- 📝 [docs] Revamps event emission and handling

Updates documentation and code to reflect changes in event emission and handling, particularly regarding cache invalidation and site lifecycle events.

- 🛠️ Improves event emission flow:
 - Managers now emit only internal events (`internal:site:*`).
 - The `UptimeOrchestrator` enriches these events and rebroadcasts renderer-facing `site:*` events.
 - Translates cache telemetry into the `cache:invalidated` pipeline.
- 📝 Updates documentation to reflect changes in event emission:
 - Documents that `site:cache-miss` and `site:cache-updated` are no longer emitted directly by managers.
 - Adds documentation for new `site:added`, `site:removed`, and `site:updated` events.
- 🎨 Introduces dedicated helpers for site lifecycle events in the renderer:
 - Exposes `EventsService` for `site:added`, `site:removed`, and `site:updated` events, which keeps cleanup logic consistent and avoids direct references to `window.electronAPI`.
- 🧹 Removes deprecated `site:cache-miss` and `site:cache-updated` events.
- 🧪 Updates tests to reflect changes in event emission and handling:
 - Updates `eventTypes.comprehensive.test.ts` to no longer check for deprecated cache events.
- 📝 Updates various documentation files to reflect the new event emissions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0681f76)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0681f764adcec471de8d8ec2e94bdae2ad02f505)


- 📝 [docs] Enhance logging in documentation

This commit improves the documentation by replacing `console.log` statements with calls to the logger.

- 📝 [docs] Updates code examples to use centralized logger

 -  Replaces `console.log` with `logger.info`, `logger.warn`, `logger.error` and `logger.debug` calls throughout the documentation examples in various files
 -  Adds imports for the logger in the documentation examples
 -  This change provides more structured and manageable logging across the application.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3bd04f6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3bd04f69c241a9cd13fb5831ec659e472395d97e)



### 🎨 Styling

- 🎨 [style] Enforce `@app` alias and restrict Electron imports

Updates ESLint rules to enforce the use of the `@app` alias for imports within the `src` directory and restricts direct imports from Electron in renderer modules.

- 🎨 [style] Adds new ESLint rules:
  -  `renderer-no-electron-import`: Disallows renderer code from directly importing Electron packages or backend modules, encouraging the use of preload bridges or shared contracts instead. 🚫
   -  This rule checks `ImportDeclaration`, `ImportExpression`, and `CallExpression` nodes for invalid Electron dependencies.
  - `prefer-app-alias`: Enforces the use of the `@app` alias for referencing renderer code from outside the `src` directory, preventing relative deep imports. 🚀
   -  The rule provides a fix to automatically replace relative paths with the `@app` alias.
- 📝 [docs] Updates the consistency guide to reflect the new `@app` alias rule. 📚
- 🧹 [chore] Updates benchmark import path for SettingsService. ✅
- 🧪 [test] Adds new `tsconfig.json` files for electron and shared test directories. 🧪
- 🧹 [chore] Disables `@jcoreio/implicit-dependencies/no-implicit` rule in test files. 🛠️

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3eeb312)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3eeb312bbba99ca399dcc0b9a9d79a2cc7f28792)






## [16.9.0] - 2025-10-17


[[afe2335](https://github.com/Nick2bad4u/Uptime-Watcher/commit/afe2335549a9a11f228440393ca6f915786c410a)...
[465af28](https://github.com/Nick2bad4u/Uptime-Watcher/commit/465af28833f78940bdf648c100236dc13c1aa41a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/afe2335549a9a11f228440393ca6f915786c410a...465af28833f78940bdf648c100236dc13c1aa41a))


### ✨ Features

- ✨ [feat] Enhance error handling and validation

This commit introduces layered validation, structured error handling, and architectural documentation to improve data quality, consistency, and maintainability.

- 🧱 Implements layered validation strategy with IPC schema, manager business rules, and repository persistence checks to ensure data quality at each layer.
 - Guarantees a single responsibility per layer, early failure with actionable messages, structured errors using `ApplicationError`, immutable inputs, and unit tests at the source.
- 🐛 Introduces `ApplicationError` for consistent error propagation with contextual metadata, aiding in debugging and user feedback.
 - Normalizes error causes, includes machine-readable codes, operation identifiers, and structured diagnostic metadata.
- 🔄 Refactors `UptimeOrchestrator` to use `runWithContext` for standardized error handling across operations.
 - Wraps operations in a try/catch block, normalizes errors into `ApplicationError` instances, and includes contextual information like code, details, message, and operation.
- 📝 Adds architectural diagrams and documentation for validation layers, error propagation, and event bus flow to improve understanding and maintainability.
 - Documents IPC boundary, event bus coupling, transaction adapters, validation layers, error propagation, service container, and repositories.
- 🧪 Updates tests to reflect changes in `IpcService` constructor and `MonitorManager` to account for new error handling and validation logic.
- 🧹 Introduces `RendererEventBridge` to manage renderer process communication via IPC, centralizing window iteration and error handling.
 - Adds `sendToRenderers` for sending payloads to all active renderer windows and `sendStateSyncEvent` for emitting state synchronization events with metadata.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fb77fcc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fb77fcc5311cae4429c3cea6d754753c19a106fe)


- ✨ [feat] Enhance preload diagnostics and logging

This commit introduces enhanced diagnostics and logging capabilities, focusing on improving the reliability and debuggability of preload scripts.

- 🔧 Extends logging capabilities in the Electron main process and preload scripts.
 - Adds structured diagnostics forwarding for preload guard violations to the main process.
 - Implements detailed logging for IPC handler verifications and preload guard failures.
 - Provides more context and clarity in log messages, facilitating easier debugging and issue resolution.
- 🛠️ Introduces a new `preloadLogger` utility for enhanced logging within preload scripts.
 - Creates dedicated logger instances for standard and diagnostic logging.
 - Implements structured payload previews to provide context for debugging.
 - Adds functionality to report preload guard failures to the main process for centralized diagnostics.
- 🧪 Adds comprehensive tests for the `eventsApi` to ensure proper handling of malformed payloads.
 - Verifies that invalid payloads are correctly dropped and reported via diagnostics.
 - Includes tests for undefined, null, and malformed event data.
- 📝 Updates documentation to reflect architectural evolution.
- 🚜 Refactors code to improve readability and maintainability.
 - Replaces `console.warn` with the new `preloadDiagnosticsLogger` for reporting malformed payloads.
 - Simplifies logging configuration in `electron/main.ts`.
- 🎨 Improves type safety and code clarity.
 - Corrects type definitions for `EffectCallback` and `EffectCleanup` in `hookPerformance.bench.ts`.
 - Updates parameter descriptions in `sitesApi.ts` for clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(baad87b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/baad87b9ac5ca1d11278ed79b66c1400499e8810)



### 🛠️ Bug Fixes

- 🛠️ [fix] Improve site management and event handling

This commit refactors site management and event handling to improve data consistency and streamline inter-process communication.

- 🛠️ **Site Management Improvements**:
 - Normalizes cache updates through a shared utility to guarantee event emission when a site is added.
  - This ensures that the cache is consistent and that all relevant events are triggered.
 - Sanitizes site data before emitting events to prevent unintended data exposure.
  - This enhances data integrity by ensuring that only safe data is shared.
 - Emits internal site events ("internal:site:added", "internal:site:removed") to provide more granular control over site lifecycle events.
  - These events allow internal components to react specifically to site addition or removal.
 - ⚡ Updates site removal logic to ensure cache and event consistency.
  - Ensures sites are properly removed from the cache before removal events are fired.
- 📝 **IPC Service**:
 - Removes the `RendererEventBridge` dependency from the `IpcService`.
  - This simplifies the `IpcService` by removing an unnecessary dependency.
 - ♻️ **Event Handling**:
  - Forwards `sites:state-synchronized` events from the orchestrator to the renderer, ensuring that all renderer processes are kept in sync with the latest site state.
  - This maintains UI consistency across all application windows.
- 🧪 **Testing**:
 - Updates comprehensive tests for `SiteManager` to accurately mock cache operations.
  - Ensures cache operations are reliably mocked to mimic real-world behavior.
- 🧹 **Other Changes**:
 - Registers database event bus for event forwarding.
  - Enables the forwarding of events from the database event bus to other parts of the application.
 - Adds new events to the list of forwarded events in `ServiceContainer`.
  - Ensures that new events are properly forwarded to the appropriate listeners.
 - Removes unnecessary `sendStateSyncEvent` calls from `IpcService`.
  - This reduces redundancy and potential inconsistencies in state synchronization.
- 🎨 **UI**:
 - Adds a status subscription indicator to the header, providing real-time feedback on the health of the app's event listeners.
  - Includes logic for retrying subscriptions and displaying detailed listener states.
- 📝 **Documentation**:
 - Updates ADR_005_IPC_COMMUNICATION_PROTOCOL.md to reflect changes to IpcService.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(465af28)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/465af28833f78940bdf648c100236dc13c1aa41a)


- 🛠️ [fix] Improve cache update atomicity

This commit refactors cache update operations to ensure atomicity and consistency, and includes various related improvements:

- 🔄 Updates the `StandardizedCache` class to include a `replaceAll` method that atomically replaces all cache entries.
 -  This method first clears the cache and then bulk updates it with new items, ensuring a consistent state.
 -  Emits `internal:cache:bulk-updated` event with a zero count when `replaceAll` is called with an empty array.
- ⚡ Improves the performance of cache updates by using the new `replaceAll` method in `DatabaseManager` and `SiteManager`.
 -  Removes the temporary cache implementation in `updateSitesCache` in `SiteManager`.
 -  Updates the site cache update process in `DatabaseManager` to use `replaceAll`.
- 🧪 Updates tests to reflect the new `replaceAll` method and ensure proper cache behavior.
 -  Improves test coverage and adds comprehensive tests for `replaceAll` in `StandardizedCache`.
 -  Updates mocks and test implementations to align with the new `replaceAll` method.
- 📝 Updates documentation and comments to reflect the changes in cache update operations.
- 🛠️ Addresses potential issues with URL validation and sanitization in the `AddSiteForm`.
 - Ensures URLs are properly trimmed and sanitized before being used, preventing validation issues.
- 🛠️ Normalizes timestamp generation in event data to prevent potential issues with invalid date strings.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e6719a8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e6719a8d98fb904a263a71fafd1ab64c040c7f4b)


- 🛠️ [fix] Improve state synchronization reliability

This commit enhances the reliability and efficiency of state synchronization across the application.

- ♻️ Refactors the state synchronization mechanism to ensure data consistency and prevent potential race conditions.
   - 🗑️ Removes the `create` action from the `StateSyncEventData` interface as it's no longer needed.
   - 🚚 Renames `WindowService.sendToRenderer` to `RendererEventBridge.sendToRenderers` to clarify its purpose and scope.
   - 📝 Updates documentation to reflect the changes in the event system and architecture.
   - ⚡️ Improves performance by streamlining the state synchronization process.
   - 🔑 Replaces optional `sites` with a mandatory `sites` array in `StateSyncEventData` to guarantee data availability.
   - 🩹 Fixes the state sync event to always provide a full state snapshot after an event to prevent inconsistencies.
   - 🌐 Updates the `stateSyncApi.ts` to check if the sites array exists and is indeed an array.
   - 🎨 Updates the default site name to be located in `@shared/constants/sites` to ensure both the frontend and backend use the same default and stay in lockstep.
- 🧪 Adds comprehensive test coverage for state synchronization to ensure its reliability and correctness.
   - ✅ Adds comprehensive tests for the state sync domain API.
   - ✅ Adds tests for the `SiteManager` to ensure the cache is properly updated.
   - ✅ Adds tests for the `ApplicationService`.
- 🗑️ Removes the singleton `operationRegistry` as it's no longer needed.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c6be6ba)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c6be6bab8e8fff2317f6b8e08ae8fa33a3b43f6a)


- 🛠️ [fix] Enhance error handling and event dispatch

This commit improves error handling and event dispatch within the application.

- 🛠️ Updates error handling in `UptimeOrchestrator` to use `createContextualError` for standardized error reporting and logging, enhancing error context and diagnostics.
 - 📝 This change replaces `this.throwWithContext` with `this.createContextualError` to ensure consistent error formatting and logging across the orchestrator.
 - 🐛 It corrects error details and cause handling for initialization, shutdown, site/monitor removal, and data export operations.
- ✨ The commit refactors event dispatch in `ApplicationService` to use `RendererEventBridge` for sending updates to renderers, decoupling the service from direct window management.
+ ✨ Refactors event dispatch in `ApplicationService` to use `RendererEventBridge` for sending updates to renderers.
  - ⚙️ It replaces direct calls to `windowService.sendToRenderer` with `rendererBridge.sendToRenderers`, improving modularity and maintainability.
  - 📢 It ensures auto-updater status and monitoring events are dispatched via the event bridge.
- ⚡ This commit improves database transaction handling by removing unnecessary async wrappers, streamlining repository operations, and enhancing performance.
+ ⚡ Improves database transaction handling by removing unnecessary async wrappers, streamlining repository operations, and enhancing performance.
  - 🔄 It simplifies transaction execution in `MonitorManager`, `HistoryRepository`, `MonitorRepository`, and `SettingsRepository` by directly returning the promise from `executeTransaction`.
- 🧪 Updates tests to reflect changes in error handling and event dispatch, ensuring test suite accuracy and reliability.
+ 🧪 Updates tests to reflect changes in error handling and event dispatch.
   - ✅ It adjusts assertions to validate the new error structure and event dispatch mechanism.
   - 📝 It adds comprehensive testing for forwarding errors in the `ApplicationService`.
- 🎨 Updates events API to use renderer event channels for event management, improving code maintainability and readability.
+ 🎨 Updates events API to use renderer event channels for event management.
  - 🏷️ It introduces `RENDERER_EVENT_CHANNELS` constant for defining event channels.
  - ✨ It migrates event subscriptions to use the new event channel constants.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(af06cea)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/af06ceabcfe2fb1edba9a2bfae5f7769f6a7da09)


- 🛠️ [fix] Improve site monitoring and operation flows

This commit enhances site monitoring and operation flows by improving logging, error handling, and subscription management.

- 🛠️ **Enhances telemetry for store operations**:
   - Updates `withSiteOperation` and `withSiteOperationReturning` to use a new telemetry system.
   - Adds support for stage-specific metadata (pending, success, failure) to provide more granular logging.
   - Centralizes logging logic to ensure consistency across different operations.
- 🧪 **Fixes potential NaN value in safe number conversions**:
   - Modifies `safeNumberConversion` to handle potential NaN default values, ensuring a fallback to 0.
- ⚡ **Improves status update subscription**:
   - Modifies the status update subscription process to handle cases where a callback is not initially provided.
   - Implements retry logic for status update subscriptions, ensuring proper cleanup and re-subscription.
   - Adds unsubscribe functionality to cleanly disconnect from status updates.
- 📝 **Updates documentation**:
   - Adds documentation for real-time subscription diagnostics, logging conventions, and shared helpers.
   - Clarifies the usage of `updateMonitorAndSave` and the importance of composing helpers for consistent state transitions.
- 🧹 **Updates dependencies**:
   - Adds new dependencies to `knip.config.ts` to align with project requirements, including `@storybook/test-runner`, `istanbul-lib-coverage`, `istanbul-lib-report`, `istanbul-reports`, and `node-abi`.
- 🎨 **Updates UI components**:
   - Refactors `StatusSubscriptionIndicator` to improve error handling and display subscription status more accurately.
   - Updates CSS styles for `Header.css` to enhance the visual presentation of status indicators and controls.
- 📝 **Excludes build artifacts from remark linting**:
   - Adds new entries to `.remarkignore` to exclude build artifacts and generated documentation from remark linting.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0377b44)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0377b444319a0399a5ceb2f626d86823814813a7)



### 🚜 Refactor

- 🚜 [refactor] Improves event handling and state sync

This commit refactors event handling and state synchronization within the application to improve maintainability and reduce potential errors.

- 🚚 Moves cache-related event definitions in `eventTypes.ts` to improve organization and readability.
- ♻️ Refactors state synchronization logic in `SiteManager.ts` and `IpcService.ts` to use constants for actions and sources, ensuring consistency and reducing the risk of typos.
 - 📝 This change replaces inline string literals with references to `STATE_SYNC_ACTION` and `STATE_SYNC_SOURCE`
 - 🔤 Adds and utilizes `STATE_SYNC_ACTION` and `STATE_SYNC_SOURCE` constants in `shared/types/stateSync.ts`
- ✅ Enhances type safety and code clarity in `eventsApi.ts` and `stateSyncApi.ts` by using `some()` with type predicates to validate event data.
 - 🔍 This ensures that event payloads are correctly typed before being processed, preventing runtime errors.
 - ➕ Introduces canonical lists (`CACHE_INVALIDATION_REASON_VALUES`, `CACHE_INVALIDATION_TYPE_VALUES`, `MONITORING_CONTROL_REASON_VALUES`, `UPDATE_STATUS_VALUES`) to define allowed values for event properties.
- 🔨 Modifies `AutoUpdaterService.ts` to use `UPDATE_STATUS` constants for update status changes, promoting consistency.
- 🧪 Adds comprehensive tests for event types to ensure all cases are covered.
- 🧪 Improves test descriptions for clarity.
- ⏱️ Adds `flushMicrotasks` to cache tests to ensure events are emitted before assertions are made.
- ✨ These changes make the codebase more robust and easier to maintain.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(df77379)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/df7737912a46f46cb4ae58ebae0edeba776337a6)


- 🚜 [refactor] Improve error handling

This commit improves error handling and renderer event management.

- 🛠️ Refactors `UptimeOrchestrator` to use `createContextualError` for standardized error creation and logging, enhancing error context.
 - Removes the `throwWithContext` method.
 - Updates error handling in methods like `initialize`, `shutdown`, `removeMonitor`, and `removeSite`, ensuring consistent error reporting.
- 🛠️ Modifies `MonitorManager` to streamline database transaction execution, simplifying the `applyDefaultInterval` method.
- 🛠️ Updates `HistoryRepository` and `SiteRepository` to use arrow functions and promises for database transactions.
- ✨ Introduces `RENDERER_EVENT_CHANNELS` to manage renderer IPC channels, providing a centralized definition for event names.
- 🔄 Updates `ApplicationService` to use `RendererEventBridge` for sending events to renderers, decoupling the service from direct window management.
- 🧹 Cleans up and standardizes event emission in `ApplicationService`, improving code readability and maintainability.
- 🧪 Adds comprehensive tests for `ApplicationService` to ensure proper event handling and error forwarding.
- 🧪 Updates `UptimeOrchestrator.test.ts` to check for `ApplicationError` instances for initialization and setup failures.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(cd43a7c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd43a7c56ca19dd4da60d4858ea5c39ad3c25537)


- 🚜 [refactor] Move monitor removal to sites API

This commit refactors the monitor removal functionality by moving it from the monitoring API to the sites API.

- 🧩 **API Restructuring**:
 - 🚚 Moves the `removeMonitor` function from `monitoringApi.ts` to `sitesApi.ts`.
  - This change aligns the API structure more logically, as monitor management is more closely associated with site management.
 - 📝 Updates the corresponding interface definitions in `shared/types/preload.ts` to reflect this move.
  - Removes `removeMonitor` from `MonitoringChannelMap` and `MONITORING_CHANNELS_DEFINITION`.
  - Adds `removeMonitor` to `SitesChannelMap` and `SITES_CHANNELS_DEFINITION`.
- 🛠️ **Service Layer Modification**:
 - 🔄 Modifies `SiteService.ts` to use the `sites.removeMonitor` API instead of `monitoring.removeMonitor`.
  - This ensures that the service layer correctly calls the new API endpoint for removing monitors.
- 🔄 Updates the `updateSite` function in `SiteService.ts` to return the updated `Site` instance from the backend.
  -  Ensures the frontend receives the complete, updated site data after a modification.
- 🔄 Updates `useSiteOperations.ts` to set the sites after updating a site via `updateSite`.
 - Ensures the frontend receives and applies site changes.
- 🧪 **Comprehensive Testing Updates**:
 - 🧪 Updates `useSiteOperations.targeted.test.ts` to reflect the change in API usage.
  - Removes the mock for `monitoring.removeMonitor` and adds a mock for `sites.removeMonitor`.
 - 🧪 Modifies `useSiteOperations.test.ts` to align with the refactored API structure.
 - 🧪 Updates `src/test/stores/sites/utils/operationHelpers.test.ts` to ensure tests are up to date with changes.
 - ✅ Adds a new test case to `src/test/stores/sites/SiteService.test.ts` to cover the `updateSite` function.
- 🧪 **UI Store Error handling**:
 - ✅ Adds error handling and logging to `useUIStore.ts` when opening external URLs fails.
  - Improves the reliability of the UI by gracefully handling errors when opening external links.
- 🐛 **Bug Fix**:
 - 🐛 Fixes an issue in `App.tsx` where the `subscribeToStatusUpdates` function could encounter issues.
  - Adds a check for the `success` property in the subscription result and logs a warning if the subscription fails.
- ⚡ **Performance**:
 - ⚡ Improves the efficiency of status updates by using incremental updates.
- 🧪 **Comprehensive Testing**:
 - 🧪 Adds tests to `useSiteSync.comprehensive.test.ts` to cover the new status update subscription logic.
- 🔄 Updates the `subscribeToStatusUpdates` function in `useSiteSync.ts` to return a promise that resolves with a `StatusUpdateSubscriptionSummary` object.
- 📝 Adds a new type `StatusUpdateSubscriptionSummary` to `src/stores/sites/baseTypes.ts` to represent the summary of a status update subscription.
- 🔄 Updates the `StatusUpdateManager` class in `src/stores/sites/utils/statusUpdateHandler.ts` to return a `StatusUpdateSubscriptionResult` object when subscribing to status updates.
- 🗑️ **Code Cleanup**:
 - 🗑️ Removes unused code from `electron/test/preload/domains/monitoringApi.comprehensive.test.ts` and `electron/test/preload.missing-branches.test.ts`.
  - This removes the test case for `monitoringApi.removeMonitor` and the corresponding expectation in `preload.missing-branches.test.ts`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9391f45)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9391f4592d754df3942bd09d37ee8166f78be26c)


- 🚜 [refactor] Rename `siteId` to `siteIdentifier`

This commit refactors the codebase to rename the `siteId` property to `siteIdentifier` for improved clarity and consistency.

- 🛠️ Updates the codebase to consistently use `siteIdentifier` instead of `siteId`.
 - This change ensures that the code accurately reflects the intended purpose of the identifier.
 - 💡 The renaming enhances code readability and reduces potential confusion.
- 📝 Updates documentation and guides to reflect the change from `siteId` to `siteIdentifier`.
 - This ensures that the documentation remains accurate and up-to-date.
- 🧪 Updates benchmarks and tests to use `siteIdentifier` for consistency.
 - This ensures that the tests remain relevant and accurate.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(34a2e8a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/34a2e8afbdd35f2164c4686210c0d97190b866f4)


- 🚜 [refactor] Standardize site identifier usage

This commit refactors the application to consistently use `siteIdentifier` instead of `siteId` for identifying sites across the codebase.

- 🔑 Replaces instances of `siteId` with `siteIdentifier` in documentation, code, and event payloads to ensure consistent naming and prevent confusion.
 - This change improves code readability and maintainability by establishing a single, clear identifier for sites.
- 🔄 Updates the UI store, add site form, site details, and other relevant components to reflect the change from `selectedSiteId` to `selectedSiteIdentifier`.
- 🚦 Modifies event payloads and their corresponding type definitions to consistently use `siteIdentifier`.
 - This ensures that events are correctly processed and that the correct site is targeted.
- 🚚 Adapts the electron backend to emit and listen for events using the new `siteIdentifier`.
 - This includes changes to the uptime orchestrator, monitor manager, and site manager, ensuring that site removals and other operations are correctly handled.
- 🛡️ Adds runtime type guards to validate monitor status events, ensuring data integrity and preventing errors due to malformed payloads.
- 🧪 Updates tests to reflect the identifier change and to ensure that events are correctly processed.
 - Includes comprehensive fuzzing tests to handle a wide range of inputs and edge cases.
- 📝 Updates documentation to reflect the new naming convention and to provide clear guidance on using the `siteIdentifier`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2bac699)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2bac699c24708bfd0acdf57153c205d628090245)



### 📝 Documentation

- 📝 [docs] Augment benchmark files with documentation

This commit enhances the benchmark suite by adding comprehensive documentation to several files.

- ✨ [feat] Introduces JSDoc comments to classes, interfaces, types, and functions across multiple benchmark files.
   - This improves code understanding and maintainability by providing clear explanations of each component's purpose and usage.
- 📝 [docs] Updates file headers in benchmark files to include descriptions and package documentation tags.
   - This offers a high-level overview of each benchmark's goal and scope.
- 🔧 [build] Adds a script to automate the documentation augmentation process.
   - This ensures consistency and reduces manual effort when updating documentation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1740b43)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1740b435af453124cbe19b5142f69932a4734b7e)


- 📝 [docs] Improve code documentation and types

Improves code documentation and type definitions across multiple modules to enhance clarity and maintainability.

- 🌐 **Shared Types**:
 -  Refines JSDoc comments for shared types in `shared/types.ts`, `shared/types/chartConfig.ts`, `shared/types/componentProps.ts`, `shared/types/database.ts`, `shared/types/events.ts`, `shared/types/eventsBridge.ts`, `shared/types/formData.ts`, `shared/types/ipc.ts`, `shared/types/monitorConfig.ts`, `shared/types/monitorTypes.ts`, `shared/types/preload.ts`, `shared/types/schemaTypes.ts`, `shared/types/stateSync.ts`, `shared/types/themeConfig.ts`, and `shared/types/validation.ts` to provide better context and usage examples.
 -  Adds descriptions and `@public` tags for public interfaces and types.
 -  Clarifies the purpose and usage of various types, interfaces, and functions.
 -  Ensures all shared types are well-documented for both frontend and backend use.
 -  Replaces some uses of backticks around `Monitor` with a KaTeX equation and removes some unnecessary `@see` links.
- 🔧 **Enhanced Monitor Checker**:
 -  Updates `@see` links in `EnhancedMonitorChecker.ts` to reflect renamed methods in `MonitorOperationRegistry`, `OperationTimeoutManager`, and `MonitorStatusUpdateService`.
- 🛠️ **Ping Monitor**:
 -  Updates `@see` links in `PingMonitor.ts` to reflect renamed methods: `hasValidHost` is now `validateMonitorHost` and `getMonitorTimeout` + `getMonitorRetryAttempts` are now `extractMonitorConfig`.
- 🧪 **Playwright UI Helper**:
 -  Adds retry logic with increased timeouts to `openSiteDetails` in `playwright/utils/ui-helpers.ts` to improve test stability.
 -  Adds scrolling and visibility checks before clicking the target card.
- 🧹 **Cache Configuration**:
 -  Updates JSDoc in `shared/constants/cacheConfig.ts` to better explain cache configuration and usage.
 -  Marks internal interfaces to clarify the structure of the `CACHE_CONFIG` constant.
- ⏱️ **Monitoring Constants**:
 -  Adds JSDoc to `shared/constants/monitoring.ts` to clarify the purpose of `DEFAULT_MONITOR_CHECK_INTERVAL_MS` and `MIN_MONITOR_CHECK_INTERVAL_MS`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(afe2335)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/afe2335549a9a11f228440393ca6f915786c410a)






## [16.8.0] - 2025-10-11


[[98d6078](https://github.com/Nick2bad4u/Uptime-Watcher/commit/98d607861e2906360a3fafce95673c08d90f9565)...
[a60227e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a60227eaba7d5418aad6e07efd83bcece93fed5a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/98d607861e2906360a3fafce95673c08d90f9565...a60227eaba7d5418aad6e07efd83bcece93fed5a))


### ✨ Features

- ✨ [feat] Refreshes UI with new styling and coverage

This commit introduces UI enhancements and improved test coverage tooling.

- 🎨 [style] Implements refreshed UI across key components:
  - Applies new styles for modals, dashboard elements, and settings sections using CSS custom properties for theme consistency.
  - Updates the site list layout selector with enhanced visuals and interactive states.
  - Introduces styling to the site details modal and navigation.
 - 🧪 [test] Adds Playwright coverage collection:
  - Integrates Istanbul for Playwright coverage reporting and threshold enforcement.
  - Adds utilities for collecting coverage data from Electron renderer windows.
  - Creates a Vite plugin for enabling coverage instrumentation during Playwright runs.
  - Sets up a script for aggregating coverage fragments and generating reports.
- 🛠️ [fix] Removes old E2E tests:
  - Deletes many old, unmaintained E2E tests related to site managemement, component UI, cross browser compatibility, complete workflows, edge cases, and electron features.
- 📝 [docs] Adds a style and layout guide.
- 🚜 [refactor] Updates config files:
  - Adds coverage utils to test and config files.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f505de0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f505de0f5c1c2d4033eab38ef2acdb5c28006a7c)


- ✨ [feat] Enhance app architecture and UI

- ✨ [feat] Introduces an overflow marquee hook for UI elements
 - ➕ Adds `useOverflowMarquee` hook to handle text overflow in containers, applying marquee animations when necessary.
 - 🎨 Includes CSS utility classes (`animate-marquee` / `marquee-pause-on-hover`) for consistent animation styling.
- 🚜 [refactor] Improves database transaction handling across repositories
 - 🔄 Refactors `MonitorManager` to use transaction adapters for database operations, ensuring atomicity.
 - 💱 Introduces transaction adapters for `HistoryRepository` and `SettingsRepository` to encapsulate transactional write operations.
 - 🧩 Implements transaction adapters in `SiteRepository` and `MonitorRepository` to expose encapsulated write operations.
- 🛠️ [fix] Implements handler verification for IPC channels
 - ✅ Adds diagnostics channel to verify IPC handler registration, enhancing preload bridge reliability.
 - 🔍 Implements middleware to verify channel or throw an error to ensure handler registration.
- 📝 [docs] Updates architecture documentation
 - 📚 Modifies directory structure and architecture documentation map for clarity.
 - ✏️Updates ADR links and development patterns guide links to reflect file name changes.
- ⚡ [perf] Improves logging and codebase maintainability
 - 🪵 Enhances logging in `electron/utils/logger.ts` by using shared logging helpers, centralizing message formatting and error serialization for consistent output.
- 🧪 [test] Adds comprehensive test coverage
 - 🧪 Adds test coverage in `electron/test/managers/SiteManager.test.ts` to ensure all functions are properly tested.
 - 🧪 Adds comprehensive bridge factory tests in `electron/test/preload/core/bridgeFactory.comprehensive.test.ts` to ensure all functions are properly tested.
 - 🧪 Adds comprehensive monitor repository tests in `electron/test/services/database/MonitorRepository.comprehensive.test.ts` to ensure all functions are properly tested.
 - 🧪 Adds comprehensive site details navigation tests in `src/test/components/SiteDetails/SiteDetailsNavigation.comprehensive.test.tsx` to ensure all functions are properly tested.
 - 🧪 Adds comprehensive store tests in `src/test/hooks/useSelectedSite.comprehensive.test.ts` to ensure all functions are properly tested.
 - 🧪 Adds comprehensive store tests in `src/test/stores/sites/useSiteMonitoring.comprehensive.test.ts` to ensure all functions are properly tested.
 - 🧪 Adds targeted store tests in `src/test/stores/sites/useSiteOperations.targeted.test.ts` to ensure all functions are properly tested.
 - 🧪 Adds store tests in `src/test/stores/sites/useSiteOperations.test.ts` to ensure all functions are properly tested.
 - 🧪 Adds store tests in `src/test/stores/sites/utils/operationHelpers.test.ts` to ensure all functions are properly tested.
 - 🧪 Adds fuzzing tests in `src/test/stores/ui/useUIStore.input-fuzzing.test.ts` to ensure all functions are properly tested.
 - 🧪 Adds store tests in `src/test/stores/ui/useUIStore.test.ts` to ensure all functions are properly tested.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f06123f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f06123f0e356b1190e49284f7b1ae0072a8a7132)



### 🛠️ Bug Fixes

- 🛠️ [fix] Enhance diagnostics and UI interactions

This commit improves diagnostics logging and enhances UI interactions for a smoother user experience.

- 🛠️ **Enhances diagnostics logging**:
 - Introduces a `consoleDiagnosticsLogger` for fallback logging.
 - Updates `resolveDiagnosticsLogger` to prioritize `diagnosticsLogger`, then `logger`, and finally fall back to `consoleDiagnosticsLogger`.
 - Improves robustness in environments with incomplete mocks.
 - 🎨 **Improves UI interactions**:
 - Adds auto-dismissal of the navigation drawer on compact viewports when focus leaves it, improving usability on smaller screens 📱.
 - 🎨 **Refines site list table**:
 - Fixes alignment issues in the site table, ensuring consistent presentation.
 - Improves the resizing behavior of table columns for better user control 🖱️.
 - 🧪 **Updates test mocks**:
 - Updates logger mocks in tests to include both `logger` and `diagnosticsLogger` for more comprehensive testing.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7d51276)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7d51276ba0b9349546ed87b71255d3cb3355f67c)


- 🛠️ [fix] Improves logger initialization and table UI

This commit addresses issues with logger initialization and enhances the table UI for improved user experience.

- 🛠️ [fix] Implements a more robust logger initialization process:
 -  Ensures a fallback mechanism for logger initialization, preventing failures due to incomplete mocks or module lookup issues.
 -  This change avoids silent failures and provides a minimal console-backed logger as a last resort 🗄️.
- 🎨 [style] Enhances the site list table UI for better usability:
 -  Introduces resizable columns ↔️, allowing users to customize the table layout.
 -  Improves the compact site card layout with better alignment and text wrapping 📰.
- 🧪 [test] Updates mocks for logger to include diagnosticsLogger
 -  This ensures tests accurately reflect the availability of both standard and diagnostics loggers.
- 📝 [docs] Adds a comment to explain the change to the error message.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(19c3e60)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/19c3e6001ad7aa2c8291a7ac31b7e1516960f26f)


- 🛠️ [fix] Enhance UI/UX for settings and site details

This commit improves the user interface and experience across the application, focusing on settings and site details views.

- 🎨 Updates settings modal UI for better clarity and usability:
   - Replaces text-based settings access with icon-based buttons for improved visual recognition.
   - Improves layout and spacing within the settings modal to enhance information hierarchy.
   - Enhances accessibility by adding ARIA labels and roles to settings elements.
- ✨ Improves site details modal for better navigation and information display:
   - Modifies the site details modal to enhance keyboard navigation and accessibility.
   - Improves status summary in the header with more detailed monitor status and global health information. 📊
- 🔧 Refactors internal logic for improved maintainability:
   - Updates component properties to enhance type safety and reduce potential errors.
   - Improves the overall structure and theming of UI components for consistency.
- 🧪 Updates tests to reflect UI changes:
   - Updates tests to use `getByTestId` for more robust element selection.
   - Adjusts tests to verify the visibility of settings elements based on the updated UI.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(98d6078)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/98d607861e2906360a3fafce95673c08d90f9565)



### 🚜 Refactor

- 🚜 [refactor] Implement transaction adapters

This commit refactors the database operations to use transaction adapters for `SiteRepository` and `MonitorRepository`.

- 🛠️ **Transaction Adapters**: Introduces `SiteRepositoryTransactionAdapter` and `MonitorRepositoryTransactionAdapter` interfaces to encapsulate database operations within a transaction.
   - This ensures that operations are atomic and consistent, especially when dealing with multiple related entities.
- 🧪 **Benchmark Updates**: Updates benchmarks to use transaction adapters for site and monitor operations, improving test isolation and reliability.
- 🔄 **Repository Method Visibility**: Changes the visibility of several internal repository methods (`createInternal`, `updateInternal`, `deleteInternal`, etc.) to private, encapsulating them within the repository and exposing transaction-scoped operations via the new adapters.
- 📝 **Type Updates**: Updates type definitions for Monitor and Site statuses to use constants, enhancing code clarity and maintainability. ➕ Adds new status kinds and updates related logic.
- 🎨 **UI Enhancements**: Implements UI improvements in the `SiteCompactCard` and `SiteTableRow` components, including marquee effect for overflowing site names and improved status display.
   - ✨ Adds marquee effect to site names to improve UI experience.
   -  Updates status display in `SiteCompactCard` for better readability.
- 🧪 **Comprehensive Test Updates**: Updates comprehensive tests for `MonitorRepository` and `SiteWriterService` to align with adapter pattern. Mock transaction adapter functions.
- 🧹 **Code Cleanup**: Removes unused internal methods from repositories and streamlines database operation logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(47e7fe5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/47e7fe52a35bc3bfc05361b85a7a117540f3522f)



### 📝 Documentation

- 📝 [docs] Enhance architecture documentation

Updates architecture documentation for clarity and consistency.

- 📝 [docs] Corrects broken links in ADRs and patterns documentation
   - Ensures internal links between architecture documents point to the correct files, improving navigation and discoverability.
- 📝 [docs] Introduces a "Using This Documentation" guide
   - Provides guidance for new contributors, feature owners, and reviewers on how to effectively navigate the architecture knowledge base.
- 📝 [docs] Adds automation and review cadence details
   - Documents the link validation process via `npm run docs:check-links` and the quarterly review cycle for architecture documentation, enhancing maintainability.
- 📝 [docs] Enhances the Development Patterns Guide
   - Adds sections on shared utility imports and logging format standards, promoting consistent code practices across the application.
     - ✅ Explains the requirements for explicit module paths under `@shared/utils/*` and the prohibition of barrel imports.
     - ✅ Details logging practices, structured prefixes, and the use of `LOG_TEMPLATES` for consistent telemetry.
- 📝 [docs] Refactors architecture documentation
   - Improves example accuracy and cross-references between related documents.
- 📝 [docs] Updates the component prop standards guide
   - Specifies compliance checklists and TSDoc standards, ensuring new code remains well-documented.
- 🛠️ [fix] Adds diagnostics metrics collector for IPC bridge verification
   - Tracks runtime statistics exposed by the preload diagnostics handshake, allowing for detection of missing handler registrations during CI and in production logs.
   - Adds diagnostics logger to track IPC bridge and runtime health metrics.
- 🛠️ [fix] Modifies the preload bridge factory to allow diagnostics fallback
   - Adds a mechanism to bypass IPC diagnostics during testing and development, preventing false negatives in environments without full backend support.
   - Resets verification caches to support deterministic testing.
- 🛠️ [fix] Updates IpcService to record missing handler metrics
   - Implements diagnostics metrics recording for IPC handler verification, improving observability and issue detection.
- 🧹 [chore] Adds enhanced test utilities
   - Creates a comprehensive mock for database repositories.
- 🧪 [test] Adds comprehensive tests for IpcService
   - Verifies diagnostics metrics recording during handler verification.
- 🎨 [style] Improves site list component styling
   - Improves the layout and appearance of the site list component, enhancing the user interface.
- 🎨 [style] Enhances header component styling
   - Improves the appearance and layout of the header component, enhancing the user experience.
- 🎨 [style] Imrpoves the AppSidebar styling
   - Improves the styling of the AppSidebar component, enhancing the appearance and usability of the application's sidebar navigation.
- 🎨 [style] Enhances the Settings modal styling
   - Improves the appearance and layout of the Settings modal, enhancing the user experience.
- 🎨 [style] Enhances the SiteDetails styling
   - Improves the styling of the SiteDetails component, enhancing the user experience.
- 🎨 [style] Enhances the ConfirmDialog styling
   - Improves the styling of the ConfirmDialog component, enhancing the user experience.
- 🎨 [style] Updates themed select styling
   - Implements cursor style changes for disabled select elements.
- 🚜 [refactor] Refactors the useThemeStyles hook
   - Improves site details header styling.
- 🧪 [test] Adds comprehensive tests for the useSiteOperations
   - Improves error handling for `deleteSite` to provide more informative error messages.
- 🧪 [test] Adds input fuzzing tests for the UI Store
   - Adds tests to validate valid values.
- 🛠️ [fix] Improves URL validation
   - Prevents false positives by checking for disallowed characters and improving URL validation logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5088d2d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5088d2d3b1e75ebc5d68d12c2a0779468364bb50)



### 👷 CI/CD

- 👷 [ci] Enhance CI/CD workflow for releases

This commit enhances the CI/CD pipeline to streamline the release process and improve build consistency.

- 🔧 [build] Updates the build workflow for Electron apps:
  -  [dependency] Updates the package.json version number automatically based on the current version.
  -  Creates a new git tag for the new version.
  -  Commits and pushes the version bump to the repository.
  -  Uploads the bumped package.json as an artifact.
  -  Downloads the bumped package.json in the build job.
  -  Sets up the Node.js environment.
  -  Installs build dependencies for Linux, macOS, and Windows.
  -  Caches node modules for faster builds.
  -  Builds the Vite frontend and Electron backend.
  -  Builds the Electron app for various platforms and architectures.
  -  Uploads build artifacts.
  -  Updates the build matrix summary.
- 📦 [release] Implements a comprehensive release process:
  -  Downloads all build artifacts from the build job.
  -  Generates release notes for the new version, including merge commit details.
  -  Organizes distributables by platform and architecture.
  -  Fixes SHA512 hashes in latest.yml files to ensure integrity.
  -  Creates or updates the GitHub release with distributable builds, including detailed release notes and download links.
  -  Includes a detailed table of download links for each platform and architecture.
- 📝 [docs] Updates changelogs in multiple directories:
  -  Sets up Node.js and installs git-cliff.
  -  Generates CHANGELOG.md files for the root directory, src, shared, docs, config, and electron directories.
  -  Commits and pushes the updated changelogs to the repository.
  -  Creates and completes a check run to track the changelog update process.
- 🧪 [test] Updates integration tests for site deletion:
  -  Updates the `findBySiteIdentifier` mock to correctly return an empty array if no monitors are found for a given site identifier.
- 🧹 [chore] Removes unnecessary `ignore` directive from dependabot.yml.
- ✨ [feat] Adds Storybook build step to codecov workflow.
- 🛠️ [fix] Improves URL validation logic:
  -  Fixes an issue where valid URLs containing protocol-like sequences in the path were being rejected.
  -  Removes unnecessary protocol check in the `isValidUrl` function.
- 🎨 [style] Disables `selector-class-pattern` in stylelint configuration to allow flexibility with utility-first CSS frameworks.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a60227e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a60227eaba7d5418aad6e07efd83bcece93fed5a)






## [16.1.0] - 2025-10-01


[[8dddf86](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8dddf86d57923188cb32a58b49843c940a369120)...
[29d1c8d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/29d1c8df649442215788b160a10c224540ebf16d)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/8dddf86d57923188cb32a58b49843c940a369120...29d1c8df649442215788b160a10c224540ebf16d))


### ✨ Features

- ✨ [feat] Introduce global confirmation dialog and refactor cache TTL

This commit introduces several key enhancements, focusing on UI consistency and code clarity. The primary changes include implementing a centralized confirmation dialog to replace native browser confirms and refactoring the cache configuration to use a more intuitive `ttl` property.

✨ **[feat] Add Global Confirmation Dialog**
 - Implements a new, non-blocking `ConfirmDialog` component and a corresponding `useConfirmDialog` hook.
 - Provides a global `requestConfirmation` function managed by a Zustand store (`useConfirmDialogStore`) to display modal confirmations.
 - This replaces all instances of `window.confirm` and `globalThis.confirm` for destructive actions (like deleting sites/monitors or resetting settings), offering a consistent and modern UX.
 - The dialog is integrated into the main `App` component and is controlled via a centralized store, ensuring only one can be active at a time.

🚜 **[refactor] Standardize Cache TTL Configuration**
 - Renames the `defaultTTL` property to `ttl` across the entire `StandardizedCache` and `TypedCache` implementation.
 - This change clarifies that the property sets a cache-level time-to-live, not just a default that can be overridden.
 - All related configurations, documentation (including ADRs), and tests have been updated to reflect this new, more intuitive naming convention.
 - The cache now emits `undefined` for the TTL in events when expiration is disabled (TTL <= 0), improving event data clarity.

🚜 **[refactor] Improve Unique ID Generation**
 - Simplifies unique ID generation by exclusively using `globalThis.crypto.randomUUID()`.
 - Removes the previous fallback logic that used `Date.now()` and `Math.random()`.
 - This change enforces a dependency on a modern, secure, and more reliable method for creating unique identifiers, throwing an error if `crypto.randomUUID` is unavailable.

🧪 **[test] Enhance Test Suites**
 - Updates all relevant tests to use the new `useConfirmDialog` mock instead of spying on `window.confirm`.
 - Refactors cache tests to align with the `defaultTTL` -> `ttl` rename.
 - Improves test mocks for `matchMedia` and `crypto` to be more robust and accurate.

🧹 **[chore] Update BeastMode Chatmode**
 - Adds `think` and `problems` tools to the agent's capabilities.
 - Updates instructions to reflect new tool usage and enforce TSDoc commenting.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(79b6211)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/79b6211fde8d4875ba63e16cc37aa9b5944bd12f)


- ✨ [feat] Add new monitor types and enhance monitoring capabilities

This commit introduces several new monitor types and enhances existing monitoring and development features.

### ✨ Source Code Features & Refinements

-   **New Monitor Types Added**: Introduces four new advanced monitor types to expand the application's monitoring capabilities:
    -   `cdn-edge-consistency`: Verifies that content served from multiple CDN edge locations is consistent with a baseline origin URL.
    -   `replication`: Checks database or system replication lag by comparing timestamps between a primary and a replica.
    -   `server-heartbeat`: Monitors a service's health by checking a heartbeat endpoint for a specific status and timestamp drift.
    -   `websocket-keepalive`: Ensures WebSocket connections are stable by performing a ping/pong keepalive check.
-   **Enhanced Monitor Display**: Improves how monitor information is displayed in the UI:
    -   The monitor selector dropdown and site details view now show more descriptive labels and relevant identifiers (e.g., "Website URL: example.com", "Replication Lag: primary.example.com/status") for better clarity.
    -   Refactors the logic for generating these display names to be more robust and cover all monitor types.
-   **Improved Form Logic**: Refactors the "Add Site/Monitor" form logic for better state management and validation.
    -   The `useAddSiteForm` hook is streamlined, improving how monitor-specific fields are managed and reset when the type changes.
    -   Validation logic in `monitorValidation.ts` is expanded to cover the new monitor types.
-   **Robust Error Handling**: Strengthens the `CdnEdgeConsistencyMonitor` by adding a check to prevent runtime errors when a baseline request fails without an error message.
-   **Type Safety**: Improves type safety in utility functions (`isNonNegativeNumber`, `isPositiveNumber`) by ensuring they only validate finite numbers.

### 🧪 Testing & Development Experience

-   **Comprehensive Unit Tests**: Adds extensive unit tests for the new monitor services (`CdnEdgeConsistencyMonitor`, `ReplicationMonitor`, `ServerHeartbeatMonitor`, `WebsocketKeepaliveMonitor`), ensuring their reliability.
-   **Property-Based Testing**: Updates property-based and fuzz tests to include all new monitor types, making schema and validation testing more comprehensive.
-   **New Build Task**: Adds a new `"Install Dependencies (Force)"` task to `tasks.json` to simplify forcefully reinstalling dependencies during development.
-   **AI Agent Tooling**: Refactors and updates the tools available to the "Beast Mode" AI agent, including namespacing and adding a new `executePrompt` tool.

### 🧹 Dependency Updates

-   Updates various development and production dependencies, including ESLint plugins and Vite, to their latest versions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(201ede3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/201ede3f4c3821b7c5c80fa40086e7308c4b52f4)


- ✨ [feat] Add four advanced monitor types and supporting documentation

This commit introduces four new advanced monitor types to enhance system observability and provides comprehensive documentation for the project's architecture and tooling.

### ✨ Source Code Features
- **Adds Four New Monitor Types**:
  - `CDN Edge Consistency`: Compares responses from multiple edge locations against a baseline origin URL to detect content or status drift.
  - `Replication Lag`: Tracks database replication by comparing timestamps between primary and replica status endpoints.
  - `Server Heartbeat`: Polls a heartbeat endpoint, validates its status, and checks for timestamp drift to ensure services are responsive.
  - `WebSocket Keepalive`: Verifies WebSocket connections by sending ping frames and expecting a pong response within a specified delay.
- **Introduces New Shared Utilities**:
  - Adds helper functions for parsing URL lists, extracting nested fields from JSON objects using dot-notation, and normalizing various timestamp formats into milliseconds. These utilities support the complex data handling required by the new monitors.
- **Enhances the "Add Monitor" Form**:
  - The UI form for adding/editing monitors is updated with new dynamic fields corresponding to each new monitor type.
  - State management (`useAddSiteForm` hook) is extended to handle the new fields, including their values, setters, and validation logic.
  - The form submission process now correctly constructs monitor objects for the new types.

### 📝 Documentation
- **Adds Engineering Tooling Diagrams**:
  - Introduces a new `engineering-tooling.mdx` page with Mermaid diagrams visualizing the linting, type-checking, documentation, and site build pipelines.
- **Adds Testing Architecture Diagrams**:
  - Creates a new `testing-architecture.mdx` page that maps out the entire testing stack, including Vitest, Playwright E2E, and property-based testing workflows.
- **Expands System Architecture Diagrams**:
  - Updates the existing `system-architecture.mdx` page with new diagrams for "UI Component Composition" and "UI-State Integration," clarifying how UI components and state stores interact.

### 🧪 Testing
- Extends the test suite to provide comprehensive coverage for the new monitor types. This includes:
  - Unit and integration tests for the new monitor services.
  - Property-based tests (`fast-check`) for Zod schemas and type guards.
  - Validation tests for form data and monitor configurations.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8dddf86)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8dddf86d57923188cb32a58b49843c940a369120)



### 🚜 Refactor

- 🚜 [refactor] Refactor preload script structure

This commit refactors the Electron preload script to improve code organization and maintainability.

- ♻️ Introduces domain-specific modules for the preload script, enhancing structure and separation of concerns.
   - Moves functionality into dedicated files under `electron/preload/domains/`.
   - Improves code modularity and readability.
- 📝 Updates the main `preload.ts` to import and aggregate the domain APIs.
   - Simplifies the main preload file.
   - Removes the old `preload.old.ts` file.
- ⚡ Leverages shared types for IPC channel definitions and bridge construction, promoting type safety and consistency between the main process and renderer.
   - Introduces `shared/types/preload.ts` to define IPC channel maps.
   - Uses `DomainBridge` and `IpcBridgeMethod` to enforce type contracts.
- ⬆️ Updates `docs/docusaurus/package.json` to upgrade the TypeScript version.
- 🔨 Implements `MonitorConfigurationError` to improve error handling for monitor configuration updates.
- 🧪 Adds a targeted test to `electron/test/services/monitoring/MonitorFactory.fixed.test.ts` to check for configuration update failures.
- 🧹 Removes comprehensive tests for the Data domain API which includes fast-check property-based testing for robust coverage
- 🧪 Adds a focused test for the data preload domain
- 🎨 Applies a dedicated stacking class in `src/theme/components.css` so the `ConfirmDialog` stays above other modals
- 🧪 Adds a regression test for the `ConfirmDialog` component
- 🚜 Moves history limit operations to `SettingsService`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(29d1c8d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/29d1c8df649442215788b160a10c224540ebf16d)


- 🚜 [refactor] Enhance IPC bridge for type safety

This commit refactors the IPC bridge factory to enhance type safety and improve code maintainability.

- 🚀 **Refactors `createTypedInvoker` and `createVoidInvoker`**:
  - ♻️  Updates the invoker functions to leverage the `IpcInvokeChannelMap` for stronger type enforcement.
  - ✅ Enforces parameter tuples and result payloads at compile time, reducing runtime errors.
  - ⚙️  Removes the need for explicit `TOutput` type parameters, inferring types directly from channel definitions.
  - 🗑️  Removes now-unnecessary `satisfies` type assertions.
 - 📝 **Updates IPC type definitions**:
  - ➕ Introduces `IpcInvokeChannelMap` to map channel names to parameter and result types.
  - ➕ Adds `IpcInvokeChannel`, `IpcInvokeChannelParams`, and `IpcInvokeChannelResult` utility types for type extraction.
  - ✅ Enforces strict type checking for IPC channel parameters and results.
  - ➕ Adds `VoidIpcInvokeChannel` to identify channels with no return payload
 - 💥 **Updates domain APIs to use typed invokers**:
  - ✅ Modifies domain APIs (e.g., `dataApi`, `monitoringApi`, `sitesApi`) to use the new typed invokers.
  - ⬆️  Updates function signatures to align with the `IpcInvokeChannelMap` definitions.
  - ⚠️ This represents a breaking change if consumers were relying on the looser typing of the previous invokers.
 - 🗑️ **Removes deprecated channel configuration**:
  - 🗑️  Removes the `ChannelConfig` interface and related utility functions (`defineChannel`, `createDomainBridge`, `convertChannelToCamelCase`) as they are no longer needed with the new type system.
 - 🐞 **Fixes**:
   - 🐛 Fixes an issue where error details were not being correctly passed in `IpcError` constructor.
   - ✅ Ensures `details` are frozen in `IpcError` to prevent mutation.
 - 🧪 **Updates tests**:
   - ✅ Updates comprehensive tests to reflect the new API and type constraints.
   - ✅ Adds tests to ensure the typed invokers enforce correct parameter types.
   - 🗑️ Removes property-based testing as it is less relevant with the stronger type system.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b1b5831)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b1b58313dad7b6e3d63e0ea47d097b3c6444c99b)



### 🎨 Styling

- 🎨 [style] Apply consistent formatting across the codebase

🧹 [chore] Improves code consistency and readability by applying automated formatting rules across multiple files. This addresses minor stylistic discrepancies, ensuring a unified code style.

- Updates formatting for `Array.from` calls, ternary operators, and function arguments across various benchmark and test files.
- Adjusts JSDoc comments and `console.log` statements in build scripts for better alignment with style guidelines.
- Standardizes quote usage within the ESLint configuration file.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2c8ab4b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2c8ab4b53e32ef74221a3490c191803bd30b1414)






## [16.0.0] - 2025-09-28


[[6c1cdca](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6c1cdca1984bdb2c4b2c3628021383ae74c493e0)...
[6173ed2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6173ed2fc3369b6522bb338ac84f42715b11e684)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/6c1cdca1984bdb2c4b2c3628021383ae74c493e0...6173ed2fc3369b6522bb338ac84f42715b11e684))


### ✨ Features

- ✨ [feat] Add HTTP Header, JSON, and Latency monitor types

This introduces three new HTTP-based monitor types: `http-header`, `http-json`, and `http-latency`, expanding the application's monitoring capabilities.

### ✨ Source Code Changes
*   **New Monitor Types**:
    *   Adds schemas, validation, and UI form state for the new monitor types (`http-header`, `http-json`, `http-latency`).
    *   Integrates the new fields (`headerName`, `jsonPath`, `maxResponseTime`, etc.) into the `AddSiteForm` and its submission logic.
    *   Updates the `useAddSiteForm` hook to manage state for the new fields and reset them correctly when the monitor type changes.
*   **Backend Stability**:
    *   🚜 [refactor] Refactors the `MonitorManager` to start and stop monitors sequentially instead of in parallel. This prevents race conditions and overlapping SQLite transactions during bulk operations.
*   **Validation Improvements**:
    *   🛠️ [fix] Strengthens validation for string-based schema fields (`bodyKeyword`, `expectedHeaderValue`, `expectedJsonValue`) to reject values that are only whitespace.
    *   🛠️ [fix] Enhances the URL validator to reject URLs containing single or backtick quotes, preventing potential issues.

### 🧪 Test and Documentation Changes
*   **Testing**:
    *   Expands property-based, comprehensive, and unit tests to cover the new monitor types, ensuring their schemas, form data, and UI interactions are correctly handled.
    *   Refactors monitor service unit tests to use `vi.hoisted` for a cleaner and more robust mocking strategy.
*   **Documentation**:
    *   📝 [docs] Updates the `NEW_MONITOR_TYPE_IMPLEMENTATION.md` guide with more accurate instructions, corrected paths, and expanded templates to reflect recent refactoring and the addition of new UI configuration options.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6173ed2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6173ed2fc3369b6522bb338ac84f42715b11e684)


- ✨ [feat] Add HTTP Header, JSON, and Latency monitors

This commit introduces three new advanced HTTP monitor types, expanding the application's monitoring capabilities.

### ✨ New Monitor Types
- **HTTP Header Match:** Verifies that a specific header exists in an HTTP response and matches an expected value. This is useful for checking `Content-Type`, caching headers, or custom application headers.
- **HTTP JSON Match:** Fetches a JSON response and validates the value at a specified dot-notation path (e.g., `data.items[0].status`). This allows for deep inspection of API health and data integrity.
- **HTTP Latency Threshold:** Measures the response time of an endpoint and flags it as "degraded" if it exceeds a configured threshold in milliseconds. This helps in tracking and enforcing performance SLOs.

### 🛠️ Backend Implementation
- Adds three new monitor service classes (`HttpHeaderMonitor`, `HttpJsonMonitor`, `HttpLatencyMonitor`) to encapsulate the checking logic for each new type.
- Updates the `EnhancedMonitorChecker` to route check requests for the new monitor types to their respective services.
- Registers the new monitor types in the `MonitorTypeRegistry`, defining their metadata, UI configuration, validation schemas, and service factories.

### 🎨 Frontend & Shared Code
- Extends the shared `Monitor` type and Zod validation schemas to include the new configuration fields (`headerName`, `expectedHeaderValue`, `jsonPath`, `expectedJsonValue`, `maxResponseTime`).
- Updates the `monitorOperations` utility in the renderer to correctly handle default values and data mapping for the new monitor types when creating or editing them.

### 🧪 Testing & 📝 Documentation
- Adds comprehensive unit tests for each new monitor service, covering success, failure, and edge cases.
- Expands property-based tests to ensure the new monitor schemas are robust and handle arbitrary data correctly.
- Updates the `NEW_MONITOR_TYPE_IMPLEMENTATION.md` guide to reflect the latest file structures and testing requirements, keeping developer documentation current.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3a3b145)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3a3b14559eeb0bc366b742bf76c403b7463b6b58)


- ✨ [feat] Add HTTP Keyword and Status Code monitors

This change introduces two new monitor types, enhancing the application's HTTP monitoring capabilities. Users can now create monitors that assert the presence of a specific keyword in an HTTP response body or verify that an endpoint returns a specific HTTP status code.

*   ✨ [feat] Implement `http-keyword` and `http-status` monitor types.
    *   Adds `HttpKeywordMonitor` service to check for a case-insensitive keyword in an HTTP response body.
    *   Adds `HttpStatusMonitor` service to verify an endpoint's response matches an expected status code (e.g., 200, 404).
    *   Integrates the new monitor services into the main `EnhancedMonitorChecker` to dispatch checks based on monitor type.
*   🚜 [refactor] Centralize HTTP rate limiting.
    *   Extracts the `SimpleRateLimiter` from `HttpMonitor` into a shared `httpRateLimiter` utility.
    *   Ensures all HTTP-based monitors (`http`, `http-keyword`, `http-status`) use the same singleton rate limiter to coordinate requests and prevent flooding hosts.
*   🛠️ [fix] Improve database-to-object mapping.
    *   Updates the `monitorMapper` to correctly hydrate `bodyKeyword` and `expectedStatusCode` fields when loading monitors from the database, ensuring type safety.
*   ✨ [feat] Expose new monitor types in the UI and backend.
    *   Registers the `http-keyword` and `http-status` types in the `MonitorTypeRegistry`, defining their display names, form fields, and validation schemas.
    *   Updates the "Add Site" form to include state and input fields for `bodyKeyword` and `expectedStatusCode`.
    *   Adds the new monitor types to the monitor type dropdown in the UI.
*   📝 [docs] Update documentation and guides.
    *   Refreshes the `README.md` with a new DeepWiki badge, updated diagram styles, and improved formatting.
    *   Updates the `NEW_MONITOR_TYPE_IMPLEMENTATION.md` guide to reflect the latest development process, including changes to testing commands and file impacts.
*   🧪 [test] Add comprehensive tests for new features.
    *   Introduces unit tests for `HttpKeywordMonitor` and `HttpStatusMonitor` services.
    *   Expands shared Zod schema validation tests to cover the new monitor types and their specific fields (`bodyKeyword`, `expectedStatusCode`).

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(14e9efa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/14e9efa30dd20a1f4753c7bef40f29509b3e22c1)


- ✨ [feat] Add SSL certificate monitor

This commit introduces a new monitor type for checking SSL/TLS certificate validity and expiry. It serves as a complete, end-to-end implementation, providing a new capability to the platform and establishing a clear pattern for future monitor development.

### ✨ New Features
-   **SSL Certificate Monitor**: Adds a new `ssl` monitor type that:
    -   Performs a TLS handshake to verify connectivity and certificate authenticity.
    -   Evaluates certificate validity, marking monitors as `degraded` if the certificate is within a configurable warning period and `down` if it has expired.
    -   Integrates with the existing retry and timeout system.
-   **Dynamic UI Configuration**: The frontend now dynamically renders form fields for the SSL monitor (`host`, `port`, `certificateWarningDays`) based on the new registry configuration.

### 🚜 Refactoring & System Integration
-   **Backend**: The `SslMonitor` service is integrated into the `EnhancedMonitorChecker` and registered in the `MonitorTypeRegistry`, enabling the system to route and process SSL checks.
-   **Shared**: New types and Zod validation schemas (`sslMonitorSchema`) are added to ensure type safety and strict validation for SSL monitor configurations across the entire application.
-   **Frontend**: UI logic is updated to handle the new `certificateWarningDays` field in forms and state management.

### 📝 Documentation
-   The developer guide for implementing new monitor types has been completely rewritten. It now uses the concrete SSL monitor implementation as its primary, real-world example, replacing the previous theoretical guide.

### 🧹 Chores & Maintenance
-   Updates various development dependencies, including `@docusaurus`, `@eslint-react`, and `knip`.
-   Adds a configuration file for `npm-check-updates` to standardize dependency management.
-   Refines ESLint rules and configurations for improved code quality and consistency with React 19 practices.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ed0c299)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ed0c299366a490f816682a88d69eafac9ad3d680)



### 🛠️ Bug Fixes

- 🛠️ [fix] Improve state sync logic, error handling & prop sanitization

- Refines state sync validation by introducing dedicated type guards for actions and sources, reducing duplication and improving type safety 🚦
- Updates fallback logic for sync status retrieval to handle API failures more robustly, ensuring frontend gracefully recovers from backend errors
- Normalizes monitor creation and error logging for site operations, centralizing error handling for better maintainability
- Enhances React hook memoization and dependency management, preventing stale closures and ensuring correct state updates in hooks and tests
- Adds utility for DOM prop sanitization in tests, eliminating React warnings from invalid attributes in mocked components 🧼
- Refactors test mocks and expectations for truthy/boolean values, increases coverage of error scenarios and edge cases
- Cleans up API mocks and improves type correctness in Storybook setup
- Adjusts frontend and shared types for status summaries, standardizing property names and nullability

- Source code improvements prioritized over test changes
- Relates to frontend reliability, edge case handling, and long-term maintainability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b766034)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b766034def9be913d2009db37c9ca6e7f656b572)


- 🛠️ [fix] Improve build configuration and enhance error handling robustness

This commit introduces a series of improvements across the build system, TypeScript configuration, and runtime error handling utilities.

### 🛠️ Source Code Fixes
*   **`safeNumberConversion`:** Strengthens the utility by ensuring it never returns `NaN`. If a `defaultValue` of `NaN` is provided, it now correctly falls back to `0`.

### 🧪 Testing Enhancements
*   **Error Handling Fuzz Tests:** Massively expands fuzz testing for all error handling utilities (`withErrorHandling`, `withUtilityErrorHandling`, `convertError`, `ensureError`).
    *   Adds comprehensive checks for backend, frontend (store integration), and utility function scenarios.
    *   Verifies correct behavior with invalid loggers, failing store methods, and various non-Error thrown values.
    *   Ensures the system now warns to the console if a provided logger fails during error reporting.

### 🔧 Build & Configuration Improvements
*   **TypeScript Configuration (`tsconfig.json`):**
    *   Refines compiler options for stricter, more modern standards by enabling `verbatimModuleSyntax` and disabling legacy decorator options.
    *   Simplifies `lib` and `include` arrays for better clarity.
    *   Moves `tsBuildInfoFile` output from the `dist` to a dedicated `cache` directory to separate build artifacts from cache files.
*   **Vite & Vitest Configuration:**
    *   Dynamically configures test runner thread counts (`maxThreads`) based on the environment (`CI` vs. local) to optimize resource usage.
    *   Enables single-threaded execution in CI environments for stability.
    *   Cleans up test reporters, keeping the output concise by default.
    *   Corrects a Vite cache directory path.
    *   Re-enables `experimentalAstAwareRemapping` for more accurate coverage reporting.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6c1cdca)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6c1cdca1984bdb2c4b2c3628021383ae74c493e0)



### 🚜 Refactor

- 🚜 [refactor] Refactor monitor schemas and improve test coverage

This commit introduces several refactoring and testing improvements across the application, primarily focused on enhancing the monitor type definitions and their associated tests.

### Source Code Changes
*   **🎨 [style] `AddSiteForm/Submit.tsx`**: Reorganizes function parameters and logging object properties into alphabetical order for improved readability and consistency.
*   **📝 [docs] `shared/types.ts`**: Updates the comment for the `Monitor.type` property to use a multi-line JSDoc format for better documentation.

### Testing and Development Changes
*   **🧪 [test] `shared/test/schemas.property.test.ts`**:
    *   Expands property-based tests to include arbitraries for `http-keyword`, `http-status`, and `ssl` monitor types.
    *   Refactors HTTP monitor arbitraries to use a shared `httpMonitorBaseFields` object, reducing code duplication.
    *   Updates validation tests to recognize and correctly handle the newly added monitor types.
*   **🧪 [test] Monitor Service Tests**:
    *   Refactors `HttpKeywordMonitor.test.ts` and `HttpStatusMonitor.test.ts` to address mock hoisting issues by initializing the `withOperationalHooksMock` within the `vi.mock` factory.
    *   Improves test descriptions by using the class name directly (e.g., `describe(HttpStatusMonitor)`) instead of a string literal.
    *   Updates a test in `HttpStatusMonitor.test.ts` to use `Reflect.deleteProperty` for a more precise test of a missing property.
*   **🧪 [test] `IpcService.comprehensive.test.ts`**: Enhances the `monitorSchemas` mock to be more comprehensive, dynamically creating mocks for all available monitor types, including the new HTTP variants.
*   **🧪 [test] Comprehensive & Fuzzing Tests**: Updates various UI, fuzzing, and coverage-focused tests to include new form fields (`bodyKeyword`, `expectedStatusCode`) and monitor types, ensuring continued high test coverage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(20b0bd1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/20b0bd1698aa7af9336ad390ef47d5479a528621)


- 🚜 [refactor] Standardize state sync APIs and response types

This commit refactors the state synchronization, site, and monitor removal APIs to provide more structured and consistent data contracts between the main and renderer processes.

### Source Code Changes

*   **✨ [feat] New State Sync Types**
    *   Introduces dedicated types for state synchronization (`StateSyncStatusSummary`, `StateSyncFullSyncResult`) in a new `shared/types/stateSync.ts` file. This improves type safety and clarifies the data structures for sync operations.

*   **🚜 [refactor] State Sync API**
    *   Updates the `stateSyncApi` to use the new, more descriptive types for `getSyncStatus` and `requestFullSync`.
    *   Enhances the `isStateSyncEventData` type guard for more robust validation of incoming event data.
    *   Standardizes the event channel name to `state-sync-event`.
    *   Refines the `StateSyncEventData` interface by renaming `siteId` to `siteIdentifier` and updating the allowed `action` and `source` values for better clarity.

*   **🚜 [refactor] IPC Handlers**
    *   Modifies the IPC handlers for `request-full-sync` and `get-sync-status` to return payloads that conform to the new `StateSyncFullSyncResult` and `StateSyncStatusSummary` types.

*   **🎨 [style] API Return Types**
    *   Changes `removeSite` and `removeMonitor` API methods to return a `Promise<boolean>` indicating the success of the operation, rather than returning the removed object or `void`. This simplifies the API contract.

*   **🧹 [chore] Site Store Updates**
    *   Updates the sites store (`useSiteSync`, `SiteService`, etc.) to align with the new API contracts and type definitions from the backend.
    *   `getSyncStatus` now expects the `StateSyncStatusSummary` object.
    *   `removeSite` and `removeMonitor` now correctly handle the boolean return value.

### Testing and Configuration

*   **🧪 [test] Update Preload and Store Tests**
    *   Revises comprehensive tests for `monitoringApi`, `sitesApi`, and `stateSyncApi` to match the updated API signatures and response structures.
    *   Adjusts store-level tests (`useSitesStore`) to reflect the changes in service calls and data handling.

*   **🔧 [build] ESlint Configuration**
    *   Disables the `boundaries/element-types` ESLint rule to resolve configuration conflicts.
    *   Adds `execute_command` and `get_diagnostics` tools to the BeastMode chatmode configuration.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ebb93f3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ebb93f33035d616f5ab075e77442503dce9acd66)



### 📝 Documentation

- 📝 [docs] Overhaul new monitor implementation guide

This commit completely rewrites the guide for implementing new monitor types, transforming it from an SSL-specific example into a comprehensive, step-by-step manual for engineers.

✨ [feat]
*   Replaces the SSL-centric document with a generic, layered guide covering the entire process from specification to deployment.
*   Introduces a "File Impact Matrix" as a checklist for developers to ensure all necessary files across shared, backend, persistence, and renderer layers are updated.
*   Adds detailed sections for each implementation phase, including troubleshooting FAQs and reference code snippets for a new service and registry entry.

🛠️ [fix]
*   Improves error handling in the `SslMonitor` for TLS authorization failures.
    -   It now consistently captures the error details, whether it's an `Error` object or a string, and creates a new, more informative `Error` that includes the original error as its `cause`.

🧪 [test]
*   Updates IPC service tests to assert that the `ssl` monitor type is correctly included in the list of available monitors, increasing the expected count from 4 to 5.
*   Adds `ssl`-specific checks to property-based schema tests.
*   Refactors and cleans up various test files, including form mocks and fuzzing tests, to account for SSL-related fields like `certificateWarningDays`.
*   Updates constants tests to reflect the addition of the `ssl` monitor type in fallback options.

🚜 [refactor]
*   Simplifies and improves the clarity of Zod schema type definitions in `shared/types/schemaTypes.ts` by using shared shapes and reducing verbose repetition.
*   Enhances the `ThemeProvider` component to filter out non-valid React elements from its children, preventing potential rendering errors.

🎨 [style]
*   Removes extraneous newlines from the ESLint configuration.
*   Improves JSDoc comments and formatting in the `download-sqlite3-wasm.mjs` script.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(214b70d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/214b70d326e4e4fb96f2998e596af965bdac47e9)



### ⚡ Performance

- ⚡ [perf] Standardize array creation with Array.from for improved performance

This commit refactors the codebase to consistently use `Array.from()` instead of the spread syntax (`...`) for creating new arrays from iterables like Sets, other arrays, and Maps. This change is motivated by performance benefits, as `Array.from()` is generally more optimized, especially for large iterables.

Additionally, this update leverages the optional mapping function in `Array.from(iterable, mapFn)` to combine the creation and mapping of new arrays into a single, more efficient operation.

Key changes include:

*   ⚡ **Performance & Style:**
    *   Replaces all instances of array spread syntax (`[...iterable]`) with `Array.from(iterable)`. This applies to creating shallow copies of arrays and converting Sets, Maps, and other iterables into arrays.
    *   Consolidates `.map()` calls that immediately follow an array creation into the second argument of `Array.from()`, reducing intermediate array allocations.
    *   Disables the `unicorn/prefer-spread` ESLint rule to enforce this new convention.
*   🚜 **Refactor Zod Schemas:**
    *   The Zod schema type definitions in `shared/types/schemaTypes.ts` are refactored for better clarity and organization.
    *   Moves away from generic shapes to explicit, flattened type definitions for each monitor type (`HttpMonitorSchemaType`, `PortMonitorSchemaType`, etc.), improving readability.
*   🧪 **Test Updates:**
    *   Updates numerous test files across benchmarks, unit tests, and fuzzing tests to align with the new `Array.from()` convention.
    *   Adds missing `history: []` properties to monitor objects in validation schema tests to ensure they conform to the updated schema.
    *   Cleans up test file documentation and imports for better maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(693472e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/693472e37ea2570e1ca4ceba949a577776e89c9a)



### 🧹 Chores

- 🧹 [chore] Update dependencies and refactor imports

This commit introduces a wide range of updates and improvements across the repository, focusing on dependency management, code quality, and configuration enhancements.

✨ **Key Changes:**

*   **Dependency Upgrades**:
    *   Upgrades Docusaurus and its related packages to version `3.9.0`, bringing in the latest documentation features and fixes.
    *   Updates numerous development dependencies, including `@commitlint`, `@tailwindcss/typography`, and various ESLint plugins, to their latest versions to improve the development workflow and ensure security.
*   **Refactoring**:
    *   Refactors Storybook stories by extracting render logic into separate, reusable story components (`<*Story>`), simplifying the story definitions and improving maintainability.
    *   Standardizes TypeScript imports across test files to use `import type` for type-only imports. This clarifies the distinction between type and value imports and can lead to better compile-time optimizations.
*   **Configuration**:
    *   Enhances the Vitest configuration for Storybook tests, making it more robust and ensuring the coverage directory is created before tests run.
    *   Expands the list of allowed AI models for the integrated chat feature in the VS Code settings.
    *   Adds the `storybook` directory to the TypeScript test configuration, ensuring its files are correctly type-checked.
    *   Updates the `clean` script to remove additional cache directories.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1d5059b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1d5059bb3e49d6ff275259d1bc46d9863bb6e381)






## [15.8.0] - 2025-09-24


[[5a71de4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a71de49eb6579aba9ca08c6352c08ead9b362b7)...
[8a0d1ff](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8a0d1ff1e1cf26d8e9484c5ac483a4b1fd975b5a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/5a71de49eb6579aba9ca08c6352c08ead9b362b7...8a0d1ff1e1cf26d8e9484c5ac483a4b1fd975b5a))


### ✨ Features

- ✨ [feat] Improve IPC API contracts and cache invalidation

This commit refactors key Inter-Process Communication (IPC) APIs for better type safety and introduces a cache invalidation mechanism to ensure the UI stays synchronized with backend data changes.

### Source Code Changes

*   **✨ [feat] Add Cache Invalidation on Data Import:**
    *   After successfully importing data, the backend now emits a `cache:invalidated` event.
    *   This proactively notifies the renderer process that its data (specifically the site list) is stale and needs to be resynchronized, preventing inconsistent states.

*   **🚜 [refactor] Enhance `updateHistoryLimit` API:**
    *   The `updateHistoryLimit` function in the settings API now returns the updated `number` value from the backend instead of `void`.
    *   This provides immediate feedback to the frontend, allowing the UI store to confirm and sanitize the value received from the backend, improving data consistency.

*   **🚜 [refactor] Standardize `importData` API Return Type:**
    *   The `importData` function now returns a `Promise<boolean>` instead of a `Promise<string>`.
    *   This simplifies the API contract to a clear success/failure flag, making it easier for the frontend to handle the operation's outcome.

*   **⚡ [perf] Implement Frontend Cache Syncing:**
    *   A new `cacheSync` utility is introduced in the renderer to listen for `cache:invalidated` events.
    *   When an event is received, it triggers a full resynchronization of the relevant data stores (e.g., `useSitesStore`, `useMonitorTypesStore`), ensuring the UI always reflects the latest backend state.

*   **📝 [docs] Clean Up `WindowService` Documentation:**
    *   Removes corrupted text and clarifies comments in the `WindowService` for better readability.

### Development & Build Changes

*   **🧪 [test] Update Tests for API and Event Changes:**
    *   Unit and comprehensive tests for preload scripts, services, and stores are updated to align with the new API return types and behaviors.
    *   Tests now validate the `boolean` return from `importData` and the `number` return from `updateHistoryLimit`.
    *   A test is added to confirm the `cache:invalidated` event is emitted correctly during data import.
    *   Asynchronous test logic is improved to prevent race conditions.

*   **🔧 [build] Refine ESLint and Knip Configurations:**
    *   Removes the `eslint-plugin-boundaries` configuration, which is no longer needed.
    *   Updates the `knip` configuration to correctly identify entry points and dependencies, reducing false positives.

*   **🧹 [chore] Update Dependencies:**
    *   [dependency] Updates versions for numerous development dependencies, including `@typescript-eslint`, `@playwright/test`, and various ESLint plugins.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9db4f09)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9db4f09514c041c511ae41225d78f0c4387f2f54)


- ✨ [feat] Adds state synchronization event subscription support

Implements real-time state synchronization between backend and frontend through event-based updates. The system now actively listens for state changes and automatically syncs data when backend modifications occur.

Key improvements:
 - Adds `onStateSyncEvent` API method to subscribe to backend state changes 🔄
 - Implements `StateSyncEventData` interface for typed event handling
   - Supports bulk-sync, create, update, and delete actions
   - Tracks event source (backend/cache/manual) for debugging
 - Integrates event subscription into sites store for automatic UI updates
   - Bulk sync immediately updates all sites
   - Individual operations trigger full resync for consistency

🛠️ [fix] Corrects method naming inconsistencies
 - Renames `downloadSQLiteBackup` to `downloadSqliteBackup` throughout codebase
   - Updates all references in components, stores, and tests
   - Maintains backward compatibility with consistent camelCase naming

🧪 [test] Updates test expectations for improved error handling
 - MonitorTypesService now properly re-throws errors instead of silently failing
 - Validation results preserve original structure when API returns ValidationResult
 - Test assertions updated to expect thrown errors for null/undefined responses
 - Fixes test mocks to prevent async operation hanging

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b676247)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b676247f3b57e9d2d2fb1e94ba83a09a5218e9f1)


- ✨ [feat] Add support for 'degraded' monitor status

- Expands status logic and UI to recognize and display 'degraded' state for monitors.
- Updates validation, analytics, summary components, and styling to treat 'degraded' as a first-class status.
- Adjusts uptime calculations and chart data to factor in degraded monitors.
- Improves iconography and descriptions for degraded status.
- Enhances test coverage to include scenarios for degraded status.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ac735da)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ac735da4bed88850e70da37b7a5f506bafb3c5e4)



### 🚜 Refactor

- 🚜 [refactor] Centralize monitor interval constants and logic

This commit refactors monitor interval handling to improve consistency, robustness, and performance across the application.

*   ✨ [feat] Introduces a new shared module `shared/constants/monitoring.ts` to act as a single source of truth for:
    *   `DEFAULT_MONITOR_CHECK_INTERVAL_MS` (5 minutes)
    *   `MIN_MONITOR_CHECK_INTERVAL_MS` (5 seconds)
    *   A new utility function `shouldRemediateMonitorInterval` to centralize the logic for determining if an interval is invalid (e.g., `null`, `NaN`, or below the minimum).

*   🚜 [refactor] Updates multiple parts of the codebase to use these new shared constants and logic:
    *   The minimum interval validation in Zod schemas and the `ConfigurationManager` now use `MIN_MONITOR_CHECK_INTERVAL_MS`.
    *   The logic for applying default intervals in `MonitorManager` and `MonitorValidator` is now delegated to the `shouldRemediateMonitorInterval` function, making it more robust.
    *   Frontend monitor normalization (`normalizeMonitor`) now clamps check intervals to the new shared minimum.

*   ⚡ [perf] Improves the performance of applying default monitor intervals in `MonitorManager`:
    *   Instead of updating each monitor with an invalid interval individually, all required updates are now batched into a single database transaction.
    *   The in-memory cache is now explicitly updated after remediation to prevent state inconsistencies.

*   🧪 [test] Updates and expands test suites to cover the new logic:
    *   Tests for `MonitorValidator` and `monitorOperations` are updated to reflect the new minimum interval rules and remediation logic.
    *   Tests for `MonitorManager` are enhanced to verify that the cache is correctly updated and that database operations are batched in a transaction.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8a0d1ff)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8a0d1ff1e1cf26d8e9484c5ac483a4b1fd975b5a)


- 🚜 [refactor] Centralize cache configuration and logger interfaces

This refactoring consolidates shared code by moving cache constants and logger interfaces to the `shared` directory, improving code reuse and consistency between the frontend and backend.

### Source Code Changes

*   **⚡ [perf] Direct Cache Configuration Usage**
    *   Removes the intermediate `CACHE_TTL` and `CACHE_SIZE_LIMITS` constants from the Electron backend.
    *   The `ConfigurationManager` now directly consumes cache settings (TTL and max size) from the centralized `CACHE_CONFIG` object located in the `shared` directory. This eliminates redundant declarations and centralizes cache management.

*   **🚜 [refactor] Unified Logger Interface**
    *   Creates a new shared logger interface file at `@shared/utils/logger/interfaces.ts`, defining `BaseLogger`, `ExtendedLogger`, and other specialized logger types.
    *   The `Logger` type is now a `BaseLogger` for backward compatibility.
    *   All backend files are updated to import the `Logger` type from this new shared location instead of the local `electron/utils/interfaces.ts`.
    *   The frontend logger service is refactored to implement the `UnifiedLogger` interface, ensuring a consistent logging contract across the entire application.
    *   The now-redundant `Logger` interface definition is removed from `electron/utils/interfaces.ts`.

### Test and Documentation Changes

*   **🧪 [test] Update Constant Tests**
    *   Removes tests for the now-deleted `CACHE_TTL` and `CACHE_SIZE_LIMITS` constants.
    *   The test suites are updated to reflect the new state of the backend constants file.

*   **📝 [docs] Update Interface Documentation**
    *   Adds documentation to `electron/utils/interfaces.ts` to guide developers to import logger types from the new shared path.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(653d053)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/653d053f6f324e303b1f9b4e7a99225985b7f88d)


- 🚜 [refactor] Modularize preload API and add degraded status support

- Refactors the Electron preload script into a modular, domain-based architecture for type-safe IPC bridging, auto-generating domain APIs from backend channel definitions
- Adds native connectivity checks replacing the ping library, including robust support for "degraded" monitor status to distinguish partial connectivity (e.g., DNS resolves but ports unreachable, HTTP non-2xx responses)
- Updates all monitor, site, and theme status types to include "degraded", ensuring consistent handling and UI coloring for partial failures
- Improves CSS documentation and sidebar/category styling; enhances theme color configurations to support new status
- Removes obsolete dependencies and test imports; adds comprehensive tests for degraded state handling and modular connectivity logic
- Documents and auto-generates IPC channel analysis reports for maintainability and future automation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(04f054c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04f054cd5fa34f2ea6c140c418ce6921cc21feae)



### 🧪 Testing

- 🧪 [test] Improve test coverage and mocks for monitor utilities

- Expands unit test coverage for monitor and site utilities, including history preservation and error handling scenarios.
- Refines monitor validation and formatting logic in tests to ensure robust fallback behaviors and accurate result normalization.
- Updates mock implementations for services and hooks to more closely simulate real-world behavior, reducing flakiness and improving reliability.
- Enhances logging expectations for test runs, clarifies event and cache handling, and aligns test assertions with application semantics.
- Improves default value handling and error management in conversion helpers and store initialization logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5a71de4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a71de49eb6579aba9ca08c6352c08ead9b362b7)



### 🧹 Chores

- 🧹 [chore] Refactor preload APIs, enhance type safety, and update docs

This commit introduces a series of improvements across the application, focusing on refactoring, enhancing type safety, fixing bugs, and updating documentation.

✨ [feat] Adds support for 'degraded' status in the site overview tab, ensuring the correct status color is displayed.

🛠️ [fix] Corrects the normalization of `ValidationResult` in `useMonitorTypesStore`.
 - This change ensures that even if the raw validation result from the backend is a partial object, it is correctly reconstructed into a full `ValidationResult` with default values for missing properties like `errors`, `metadata`, and `warnings`.

🚜 [refactor] Improves type safety and robustness in several areas.
 - Introduces a type guard in `stateSyncApi.ts` to validate incoming `StateSyncEventData` before processing, preventing potential runtime errors from malformed event data.
 - Simplifies the `waitForElectronAPI` utility by removing unnecessary optional chaining, making the check for API availability more direct.
 - Replaces `createTypedInvoker` with `createVoidInvoker` in `settingsApi.ts` for operations that do not return a value, improving clarity and intent.

📝 [docs] Updates documentation to improve clarity and formatting.
 - Refines the system architecture documentation with better formatting and a more concise conclusion.
 - Improves the readability of the IPC channel analysis report by adding spacing and consistent formatting.

🎨 [style] Applies minor code style and formatting adjustments across multiple files for consistency and readability.

🧪 [test] Updates tests to align with source code changes and improve coverage.
 - Adjusts mocks and assertions in unit and integration tests to reflect the refactored logic, particularly for API calls and store behavior.
 - Corrects test assertions from `toHaveBeenCalledOnce()` to `toHaveBeenCalledTimes(1)` for consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(58f5ace)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/58f5ace00b6e39047931f7c184bcb911efeee8bc)






## [15.4.0] - 2025-09-20


[[d76bffe](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d76bffeb0bac88b3fb23716885942cda5c761b9f)...
[49a58d0](https://github.com/Nick2bad4u/Uptime-Watcher/commit/49a58d0fc9768f7552f7eabe487b8e98bcc0a16a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/d76bffeb0bac88b3fb23716885942cda5c761b9f...49a58d0fc9768f7552f7eabe487b8e98bcc0a16a))


### ✨ Features

- ✨ [feat] Centralize IPC response extraction and improve error handling

- Refactors client-side IPC usage to validate and extract response data in preload, removing redundant frontend type checks and simplifying service/store logic.
- Improves error handling by returning extracted data directly from preload and wrapping API calls in try/catch with contextual error messages.
- Updates monitor creation in forms to use a shared utility for consistency and maintainability.
- Adds DNS as a selectable monitor type and ensures cache invalidation triggers monitor type refresh.
- Unifies error handling utilities under shared module imports, removing obsolete local utility files.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(49a58d0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/49a58d0fc9768f7552f7eabe487b8e98bcc0a16a)


- ✨ [feat] Unifies error handling, adds shared form/modal utils, improves Playwright/E2E infra

- Refactors error handling to use a shared utility for consistent messaging across backend, frontend, and tests; replaces ad-hoc error stringification with getErrorMessage everywhere.
- Introduces new shared utilities for form validation and modal management to reduce duplication, enabling standardized handlers and validation patterns across components.
- Updates modal escape key handling to prioritize modals and centralize logic, integrating new hook into main app and details modal.
- Expands Playwright/E2E infrastructure: adds detailed guides, codegen template improvements, debug/test files, and corrects Electron launch logic to resolve flaky or broken test suites; increases allowed workers for local Electron tests.
- Improves HTTP monitoring: makes Axios validateStatus always lenient to ensure all HTTP responses are analyzed (fixes false negatives for 4xx/5xx), sets default Accept header to avoid negotiation issues; adds comprehensive integration tests against httpbin endpoints.
- Cleans up cache logic by extracting expiration handling into a shared cleanup utility, reducing code repetition and improving maintainability.
- Updates TypeScript configs for stricter checks, dev dependencies, and proper project references; adjusts scripts for better lint, knip, markdownlint, and build commands.
- Enhances documentation with detailed testing guides and adds references to new resources for fuzzing and Playwright coverage.
- Fixes miscellaneous minor bugs and improves code organization and annotation in tests for coverage and maintainability.

Relates to reliability and maintainability efforts; resolves E2E test flakiness and error reporting inconsistencies.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ea291a5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ea291a5a9f1c3ee0982e04178c287de0de2dfaeb)


- ✨ [feat] Add bulk site deletion and refactor header status UI

- Implements a bulk deletion API for all monitored sites, with IPC handler, validation, and database transaction support; enables clean test state and improves test isolation for E2E and accessibility suites
- Refactors header status section into modular components for health, counters, dividers, and controls, greatly improving maintainability and accessibility
- Updates empty state messages and test selectors for better clarity in UI and test assertions
- Adds comprehensive modal cleanup utility for Playwright tests to prevent UI state leakage between runs
- Improves validation logic for monitor configuration fields, enforcing finite and safe values
- Refines main process hot reload logic with circuit breaker and progressive backoff to avoid infinite reload loops during development
- Updates and clarifies CI workflow triggers, timeout handling, and artifact reporting for mutation testing
- Tweaks Playwright and ESLint configs for robustness and disables noisy or conflicting rules in documentation and VSCode workspace files

Relates to enhanced E2E test reliability and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ab7c92f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab7c92f4af70bc07e7b742752fcbe312dd52cd7f)


- ✨ [feat] Add comprehensive Playwright E2E, UI, and error handling tests

- Introduces full-featured Playwright test suites covering accessibility, UI component integrity, user workflows, edge cases, error resilience, and Electron main process validation.
- Implements custom codegen template and transform scripts to enforce lint-compliant test outputs, semantic locators, and standardized structure.
- Enhances developer experience with Playwright codegen/transform commands, detailed best practices, and usage documentation.
- Refines ESLint Playwright config for improved linting, TypeScript support, and testing-library rules.
- Updates Electron tests for improved dependency mocking and module isolation.
- Integrates Istanbul code coverage for Vite.
- Fixes minor logic in shared type guards and form error alert fuzzing tests for stability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d76bffe)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d76bffeb0bac88b3fb23716885942cda5c761b9f)



### 🛠️ Bug Fixes

- 🛠️ [fix] Simplifies backup logic, removes debug tests, updates configs

- Refactors database backup to use direct Node.js fs API, improving reliability and startup performance.
- Removes Playwright debug and inspection tests to clean up the test suite and streamline CI runs.
- Updates Playwright, ESLint, and Vite configurations for better report management and compatibility with modern code patterns.
- Adds more robust logging and error handling for monitor and validation workflows.
- Minor style fixes for improved code clarity and consistency.

Relates to improved CI maintainability and test reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(14e5aee)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/14e5aee9cf531cc00d6877c13b3aadaaa4cb6496)



### 🚜 Refactor

- 🚜 [refactor] Move modal visibility control and escape handling to parent

- Refactors modal components to delegate visibility and close logic to parent
- Implements centralized escape key handling in main app for all modals, improving UX consistency and simplifying modal code
- Updates modal wrappers to use native dialog semantics via themed components and enforces open state via prop
- Cleans up obsolete internal state, event listeners, and associated tests in modal components
- Adjusts error handling tests to use direct console error spying for async fallback scenarios
- Minor: bumps test bail threshold and improves style consistency for dialogs

Facilitates easier modal management and composability, reduces duplication, and improves accessibility.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7f3e44e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7f3e44ef1518d41b8d801296f807b1840cbe9d26)


- 🚜 [refactor] Consolidate error handling to shared module

- Centralizes all error handling utilities in the shared module for improved consistency and maintainability
- Updates imports across the codebase to use the shared error handling functions
- Removes duplicate and redundant frontend error handling utilities and tests
- Simplifies frontend error handling to rely on shared patterns, ensuring uniform behavior between frontend and backend

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(30a5b00)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/30a5b00a53ccf7fcaaeff6c4da27e59c4dc71f1b)



### 🧪 Testing

- 🧪 [test] Unifies monitoring mocks and improves validation coverage

- Standardizes mocked monitoring service responses to consistently resolve with boolean values for improved clarity and predictability.
- Refines validation result handling and extraction in monitor type store tests to better reflect real implementation, increasing coverage and reliability for edge cases and IPC response scenarios.
- Adds development-mode debug logging for missing sites or monitors in status update logic, with corresponding tests for logging branches and event formats.
- Updates property and fuzz tests to exclude NaN values, preventing false positives and improving test robustness.
- Adjusts handler registration and cleanup tests to dynamically reflect handler counts, reducing brittleness in IPC service tests.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4804e8a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4804e8a90652f5b208b5682a64d4d47a6e5dbd09)


- 🧪 [test] Add comprehensive fuzzing and resilience tests for monitoring and database schema logic

- Adds extensive property-based fuzzing tests for monitor type registry and database schema utilities, targeting edge cases, malformed input, error handling, SQL/XSS injection resistance, performance, and memory safety.
- Improves reliability of HTTP monitor integration tests by adding transient error retry logic, reducing flakiness due to upstream/CDN issues.
- Refines test generators to avoid empty or whitespace-only names for state management fuzzing.
- Updates numeric and time-related assertions for better tolerance and correctness in conversion and timestamp tests.
- Raises per-case async timeout for property-based tests to accommodate slower DOM and async scenarios.
- Enables and disables Playwright raw locator rule at file boundaries for clarity.
- Fixes race condition timing in abort signal fuzzing tests by adjusting abort delays.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(cdab7dc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cdab7dc34c1ba56c8473eeb19c8a1d4e9239e492)


- 🧪 [test] Add comprehensive coverage for shared utilities

- Introduces exhaustive unit tests for form validation, modal handler, and error handling utilities, ensuring 100% coverage and robust input edge case handling.
- Refactors legacy Playwright modal test to a minimal stub for easier debugging and future rework.
- Increases input fuzzing and realistic test timeouts for AddSiteForm, improving reliability for slow environments and complex scenarios.
- Enhances maintainability by validating all error, modal, and form logic against realistic and adversarial inputs.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7ddec26)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7ddec26943be4ff7ff5296caa5008cc21d9a5183)


- 🧪 [test] Improve coverage, fuzzing, and error handling mocks

- Expands property-based and edge-case tests for monitor validation, site sync, monitor types, and conversion utilities.
- Refactors test mocks to consistently use injected logger/error handlers, ensuring error reporting through logger instead of console.
- Relaxes timeouts and run counts for fuzz/property tests to improve reliability and performance.
- Adds or corrects test IDs and props for components to support robust Playwright/E2E scenarios.
- Updates conditional rendering of update notifications for better clarity and maintainability.
- Preserves original monitor IDs in update logic to ensure data integrity.
- Cleans up redundant or misordered test code, streamlining branch, line, and function coverage.
- Ensures exclusion of dangerous prototype keys in property-based fuzzing for monitor types.
- Improves async error handling wrappers to use safer, promise-based approaches.
Relates to coverage and reliability improvements; no issue reference.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0802001)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/08020019d0a152b6adfe4aef807669362e54abf6)


- 🧪 [test] Improve fuzzing stability and update mocks; 🚜 [refactor] Remove unused prompts

- Refactors global test mocking and state reset for more reliable property-based and comprehensive fuzzing runs, reducing test flakiness and false positives.
- Updates test suite timeouts and iteration counts for better performance and resource management.
- Converts render-time state resets in hooks to useEffect for React best practices, preventing unnecessary re-renders and side effects.
- Revises test assertions to avoid dependency on implementation quirks, focusing on structural correctness and compatibility.
- Unifies Electron API mocks to match real structure, improving coverage and error handling in stores and IPC tests.
- Removes many unused prompt files and agent-mode settings, simplifying repo maintenance and aligning prompt configuration with BeastMode.
- Adds utilities to suppress React act warnings in test environments where mocking is unreliable.
- Fixes edge-case handling for safe conversions and property access, ensuring consistent results for non-finite, NaN, and special values.
- Improves accessibility, input, and error scenario fuzzing coverage for UI components.
- Relates to ongoing fuzzing and stability improvements for CI and test coverage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3becbb9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3becbb90a0d27afe29a6732b0996bb13acc29711)


- 🧪 [test] Simplifies and prunes exhaustive fuzzing tests

Removes over-detailed fast-check fuzzing tests for IPC, store, and shared/utilities modules to reduce maintenance burden and improve test suite performance.

Retains essential property-based coverage, focusing on key APIs and typical use cases rather than attempting 100% combinatorial coverage.

Improves logic for safe conversions (e.g. number, percentage, check interval), stringification, and UI selectors for modals in Playwright E2E tests.

Updates dependencies, scripts, and Playwright E2E instructions for modern workflows and robust test coverage.

Refines error handling and result consistency in store and shared utility tests, and clarifies edge case handling for conversions and site status descriptions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1c2d8e0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1c2d8e0518adf9b38b3bc046a2de71acfa629eb9)


- 🧪 [test] Excludes comprehensive fuzzing tests from main suite

Moves exhaustive property-based fuzzing tests for IPC, shared utilities, stores, and src utilities to a temporary exclusion directory to reduce CI/test runtime and avoid duplication.

Updates Playwright and unit tests to improve reliability, semantic locator usage, and maintainability, including broader use of getByRole/getByTestId for UI interactions.

Refactors helper functions and selectors to better support robust, semantic queries and simplify test logic.

Improves test assertion logic for accessibility, keyboard navigation, and theme toggling to enhance coverage consistency.

Enhances documentation to reflect new best practices for semantic locators and Playwright code generation.

Relates to improved test performance and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1ec4440)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1ec44405b1a0506a66ef7489620422c555b863f1)


- 🧪 [test] Add complete fuzzing coverage for shared utilities

- Introduces comprehensive property-based fuzzing tests for abort signal management, environment detection, object safety, type helpers, string conversion, and safe conversion utilities
- Ensures robust edge case handling, type safety, and coverage for all core shared utility functions
- Refactors test cases and Playwright tests for improved consistency and reliability, including API usage and assertion clarity
- Enhances maintainability by consolidating event handler removal logic and updating test nomenclature for clarity
- Fixes minor bugs in status calculation and output formatting for standardized test behavior

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fc4c627)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fc4c627c5f9a252e8627439b25c9ac4243afc193)



### 🧹 Chores

- 🧹 [chore] Enforce comment capitalization and extend lint coverage

- Enforces capitalized comments with exceptions for various rule-related tags, improving code readability and consistency.
- Upgrades linting rigor by enabling additional rules for regex, import/export, React JSX, SonarJS, and total-functions, enhancing code quality and maintainability.
- Refines comment clarity, capitalization, and disables redundant or overly strict rules where appropriate.
- Updates global disables section and several rule descriptions for better documentation and understanding.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c66adb8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c66adb8e0bc786172a93fe9d500e560454248490)



### 🔧 Build System

- 🔧 [build] Update dependencies and increase event bus listener limit

- Upgrades multiple dependencies to latest versions for improved stability, compatibility, and security, including Electron, node-sqlite3-wasm, TypeScript types, Vite plugin, and Putout.
- Updates the wasm asset and its version to match the new node-sqlite3-wasm release.
- Raises the event bus max listeners from 50 to 60 to better support larger development setups and prevent warning spam.
- Adds npm scripts for running fuzz tests to streamline test execution.

Enhances development experience and keeps the project up-to-date with upstream improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(836bae2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/836bae29a538702b60681b9fc2d80ace80d34718)






## [14.5.0] - 2025-09-12


[[ca8dd66](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ca8dd663c0bb11a910566fda0a405d3413edb5c5)...
[c223e96](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c223e969eb1361d10c29c6d3659d4b45f3e1523b)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/ca8dd663c0bb11a910566fda0a405d3413edb5c5...c223e969eb1361d10c29c6d3659d4b45f3e1523b))


### 🛠️ Bug Fixes

- 🛠️ [fix] Update ESLint config for new eslint-comments plugin

- Switches all disable/enable-pair comments to use the new scoped rule name from @eslint-community.
- Updates ESLint configuration to reference @eslint-community/eslint-plugin-eslint-comments and its recommended rules.
- Removes old rule references and replaces direct rule settings and plugin usage with the updated plugin configuration.
- Ensures improved compatibility, future-proofing, and correct rule enforcement for comment management.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c223e96)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c223e969eb1361d10c29c6d3659d4b45f3e1523b)



### 🧪 Testing

- 🧪 [test] Expand fuzz coverage and fix timing/test logic

- Improves property-based and fuzz test coverage for form utilities, monitor operations, abort/cancellation helpers, database operations, and hook/store integrations.
- Adjusts timing tolerances and error handling for more robust and realistic test scenarios.
- Adds edge case and type checks, fixes logic in monitor normalization and database batching.
- Updates dependencies for better stability and compatibility.
- Refines VSCode launch configs, build scripts, and code style for clarity and modern usage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8157a7f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8157a7faa0a5cdca7919762147bc0aa52e510ca2)


- 🧪 [test] Achieve 100% property-based coverage in shared and stores utils

- Adds comprehensive fast-check property-based tests for shared/types, shared/validation, error handling, abort logic, monitor/site utils, and file download utilities to maximize function coverage and robustness.
- Improves test assertions for edge cases, boundary conditions, security (prototype pollution), and type guard consistency.
- Refines fuzzing and input tests for form components, fixing timeout and query performance.
- Updates validation, monitor, and error handling logic to align with stricter test expectations (e.g., whitespace handling, dangerous keys).
- Refactors font size merging and theme utility for safer property assignment.
- Fixes memory leaks by adding cleanup for timeouts in React components.
- Enhances site synchronization logic to prevent concurrent syncs and ensure proper promise handling.
- Updates launch configuration and chat mode tooling for expanded development workflows.
- Improves documentation warnings for debounce utility regarding potential memory leaks.
- Relates to improving overall code reliability, correctness, and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ca8dd66)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ca8dd663c0bb11a910566fda0a405d3413edb5c5)






## [14.4.0] - 2025-09-11


[[db764c7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/db764c7b7acc2ffa655620b79dc961a05f07fa71)...
[17fd1f5](https://github.com/Nick2bad4u/Uptime-Watcher/commit/17fd1f58a8ef7b22d4bcb2b55885bdecd2de1a53)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/db764c7b7acc2ffa655620b79dc961a05f07fa71...17fd1f58a8ef7b22d4bcb2b55885bdecd2de1a53))


### 🛠️ Other Changes

- Refactor tests and utility functions for improved clarity and functionality

- Updated test cases in `useAddSiteForm.comprehensive.test.ts` to use consistent bracket notation for object properties.
- Modified `chartConfig.input-fuzzing.test.ts` to enhance readability by standardizing property access.
- Improved assertions in `useErrorStore.input-fuzzing.test.ts` to clarify expected behavior of error clearing functions.
- Enhanced `useUIStore.input-fuzzing.test.ts` with consistent loop structures for rapid state changes.
- Refined `database.comprehensive-fuzzing.test.ts` to ensure throughput assertions align with operation success.
- Adjusted `themeMerging.ts` to introduce helper functions for merging objects, allowing explicit undefined values to override.
- Updated `validation.comprehensive-fuzzing.test.ts` to match function behavior for percentage string parsing.
- Enhanced type safety in state management tests by defining interfaces for state actions and states.
- Improved error handling and validation in IPC communication tests to ensure robust message channel checks.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(17fd1f5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/17fd1f58a8ef7b22d4bcb2b55885bdecd2de1a53)



### 🧪 Testing

- 🧪 [test] Refactors property-based tests for stricter type safety and coverage

- Updates numerous test files to use non-null assertions and more precise type guards, reducing TypeScript errors and improving maintainability.
- Removes unused imports and redundant variable assignments to streamline test logic.
- Refactors arbitraries in property-based tests for edge cases and compatibility with actual data structures.
- Comments out or disables problematic tests and scenarios for future investigation, especially those causing issues with mocks or performance constraints.
- Introduces more consistent prop naming, usage of array destructuring, and explicit nullability checks to prevent runtime errors.
- Refactors build config to explicitly type the configuration object, improving IDE compatibility.
- Relates to increased test robustness and improved compatibility with evolving codebase.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2020ece)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2020ece6488e296f2613689f894d0962285d041d)


- 🧪 [test] Add fast-check property-based fuzzing tests

Introduces extensive property-based and fuzzing tests for core components, stores, utilities, and services using fast-check, improving reliability and coverage for edge cases and input validation.

Validates error and sites store state management, UI and settings forms, chart configuration, logger output, and component behavior under varied and extreme conditions. Enhances test suite with focused accessibility, performance, and security scenarios.

Includes related small fixes for test expectations and minor refactors to support robust fuzzing.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(db764c7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/db764c7b7acc2ffa655620b79dc961a05f07fa71)






## [14.1.0] - 2025-09-10


[[d6ac036](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6ac036e7f792ba92e906741610567fc846cd872)...
[e8f173f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e8f173f92ed63e2c330353855e2d3f3d501f33d4)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/d6ac036e7f792ba92e906741610567fc846cd872...e8f173f92ed63e2c330353855e2d3f3d501f33d4))


### ✨ Features

- ✨ [feat] Integrate ESLint Config Inspector into docs site

Adds automated build and deployment workflow for ESLint Config Inspector as a static application within the documentation site, including new build and verification scripts, updated build and ignore rules, and seamless navbar navigation integration.

Improves developer experience by enabling visual inspection of ESLint configuration, ensures correct linting exclusions for generated output, and enhances property-based testing with more robust fast-check configuration.

Refactors monitor status logic to accurately exclude invalid monitors from health calculations, and updates test assertions for better reliability and coverage.

 - Relates to improved documentation automation and enhanced test robustness.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(88f0a22)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88f0a22d3116d1576751753fa46e281174739fbb)



### 🛠️ Bug Fixes

- 🛠️ [fix] Improve error handling, test coverage, and code clarity

- Refines error propagation by consistently using error causes and improving diagnostic messages for better traceability and debugging.
- Enhances ESLint configuration with new rules, more granular naming for overrides, and improved plugin coverage, including stricter code quality and formatting standards.
- Updates conditional rendering patterns and disables/enables relevant lint rules contextually for maintainable and readable JSX.
- Adds property-based and realistic test cases to strengthen coverage and ensure robustness across edge cases and complex scenarios.
- Refactors middleware registration logic for event handling and replaces ambiguous or legacy patterns with clear, future-proof APIs.
- Improves cache, database, and retry logic to correctly handle edge conditions, finite numbers, and expiration checks for increased reliability.
- Modernizes documentation, comments, and code annotations to clarify rationale and intent, increasing maintainability and onboarding ease.
Relates to stability, DX, and maintainability improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d0b8dfb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d0b8dfb345c637ad1421b15e3eef7ff3eb8fe71f)


- 🛠️ [fix] Improve test stability, error handling, and build config

- Updates property-based test configs to reduce flakiness and speed up execution by lowering timeouts, retries, and delays. Adjusts abort logic for better predictability in tests.
- Strengthens error handling: enhances error message formatting, adds defensive checks, and makes logger fallback more robust.
- Revises cache key parsing and validation for stricter input handling, preventing malformed identifiers and keys.
- Refines schema validation logic for field existence checks, increasing reliability.
- Adjusts monitor config loading and monitor status updates for more precise filtering and error messaging.
- Sets higher EventEmitter max listeners in all test environments to suppress memory leak warnings and improve test reliability.
- Improves Vite and Vitest configuration: clarifies build targets, plugin docs, port usage, and test attachment handling; simplifies path aliasing and removes redundant glob patterns.
- Adds lcov-result-merger for coverage reporting.
- Updates comments and explanatory notes for maintainability and developer clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(558dc57)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/558dc570715794dba26511af0c958fcaaf6d52f1)



### 🚜 Refactor

- 🚜 [refactor] Replace .sort() with .toSorted() for immutability

- Modernizes sorting logic across codebase by switching from mutating `.sort()` to immutable `.toSorted()` for arrays.
 - Prevents accidental in-place mutations, leading to safer and more predictable code.
 - Updates error handling to consistently use the `cause` option for better error context.
 - Refactors fuzz and test utilities to handle JavaScript quirks (e.g. signed zero serialization) for more robust assertions.
 - Reduces test run timeouts and improves DOM interaction speed in fuzzing scenarios for faster CI.
 - Cleans up unused imports and improves code style consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f48cb7f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f48cb7f9a75878d6970755ff17c9b796690c17bd)



### 📝 Documentation

- 📝 [docs] Add rich project docs, accessibility, and mascot assets

- Introduces a comprehensive documentation page with project overview, badges, screenshots, architecture, and contribution guidelines for improved onboarding and transparency
- Adds accessibility-focused CSS for reduced motion, refines button and print styles, and improves sidebar layout for better usability
- Includes high-res mascot images for branding and visual identity
- Updates Docusaurus config for sidebar and favicon, tweaks menu links for clarity
- Improves code and settings timer management to prevent memory leaks and ensure proper cleanup
- Enhances clipboard and theme logic for better user feedback and accessibility
- Adds property-based tests for utility functions to boost test coverage and reliability
- Applies stricter error handling and prototype pollution protection to utility modules
- Refines ignore files and CI/test configs to better support docs and robust testing workflows

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0340ad9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0340ad93c739dde461294c3827416f121f8f7cc2)



### 🎨 Styling

- 🎨 [style] Improve test readability with consistent formatting

- Updates formatting of test assertions and property-based test setups for improved clarity and maintainability.
- Replaces single-line and nested calls with multi-line structures, ensuring better alignment and easier review.
- Does not introduce logic changes; focuses solely on code style and readability for future contributors.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b6d9e45)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b6d9e450e22b6c240978a75aa0c8b144935750ac)


- 🎨 [style] Standardizes test assertions and describe blocks

- Replaces generic assertion methods (.toBe(true/false), .toHaveBeenCalled(), .toHaveBeenCalledOnce()) with more expressive and idiomatic matchers such as .toBeTruthy(), .toBeFalsy(), .toHaveBeenCalledWith(), and .toHaveBeenCalledTimes().
- Updates test suite descriptions to use direct references to the tested subjects/functions for improved clarity and IDE navigation.
- Enhances consistency, readability, and maintainability of the test codebase.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9c515d3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9c515d36cdc5bb27c1b57a62a79ed993267e4b32)



### 🧪 Testing

- 🧪 [test] Add comprehensive property-based fuzzing for validation, database, and IPC layers

- Adds extensive Fast-Check fuzzing suites to cover validation, database, and IPC logic, targeting edge cases, concurrency, error handling, and performance under load.
- Expands test coverage for transaction safety, referential integrity, batch operations, resource constraints, and security scenarios.
- Refines validation and update logic to improve test reliability and reduce false negatives in property-based tests.
- Updates CI workflow to support advanced Stylelint reporting and accessibility rule management.
- Improves CSS for better accessibility, reduced-motion support, and consistent :focus styling.
- Upgrades and extends linting scripts and dependencies for Stylelint with additional formatters and accessibility plugins.
Relates to #231, #232, #233

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ec7b1d6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ec7b1d602837701ce5b8cb1da887d5245de5b274)


- 🧪 [test] Refactors and improves test mocks, typing, and property usage

- Refactors property-based tests to enhance data generation versatility,
   improving test coverage and maintainability for database repositories.
 - Updates variable naming for clarity and consistency, replacing unused
   parameters with underscores.
 - Removes redundant mock methods and adapts to updated repository interfaces,
   ensuring alignment with actual method signatures.
 - Applies stricter typing in test mocks and assertions for increased type safety.
 - Addresses edge cases in test logic, such as optional chaining and safer
   property access, to reduce false positives and improve reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4f1924b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4f1924b7f3585e0a398450b84df11ec93cac1cf0)


- 🧪 [test] Improve fuzzing reliability and coverage for input, error, and validation tests

- Refactors property-based fuzzing tests to reduce timeouts, shrink run counts, and optimize DOM interactions for better reliability and speed
- Adds comprehensive edge case coverage for AddSiteForm user input boundaries, including site name, URL, host, and port fields, with aggressive cleanup to prevent flaky behavior
- Updates error handling, type guard, and JSON safety fuzzing to account for normalization differences and avoid false negative assertions on empty/invalid cases
- Improves validation tests to mock dependencies, handle invalid monitor types, and reduce brittle test failures
- Tweaks global and per-test fast-check timeouts for more robust CI performance
- Clarifies and strengthens assertions to focus on practical user input and realistic boundary conditions

Relates to stability and coverage improvements for property-based test suites

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f368113)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f3681134738fe7a1d1084fde651fcaf9af74d546)


- 🧪 [test] Achieve 100% fuzz and branch coverage for core utilities

- Adds advanced property-based fuzzing suites for error handling, JSON safety, and type guards to maximize branch and edge case coverage.
- Extends test logic with large, nested, circular, and boundary-value structures, including Unicode and special numeric cases.
- Improves reliability and maintainability by surfacing hidden defects and validating type safety under stress.
- Refines build and deployment scripts to support local testing, asset path correction, and more robust Nuxt.js subdirectory handling.
- Updates logic to handle whitespace-only error messages and BigInt/symbol conversion for error utilities.
- Adjusts property-based test timeouts and boundaries to optimize test performance and stability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2f1214b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2f1214bff2b5926fac1848a37166f7a225c58e50)


- 🧪 [test] Add property-based tests for robust input validation

- Enhances unit and fuzzing tests with property-based testing using fast-check
- Validates a wide range of inputs, edge cases, and type invariants for form utilities, shared conversion functions, object safety, string handling, and core constants
- Strengthens coverage for database-related logic, repository methods, and backup/schema utilities with randomized data scenarios
- Improves resilience against malformed, unexpected, or malicious user input and ensures consistency across validation patterns
- Updates dependencies and ESLint configuration for improved maintainability and testing standards

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(66d154f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66d154f555dde69a9705922c148fea8f9ace4e37)


- 🧪 [test] Add comprehensive property-based test suites

- Adds extensive property-based tests using Fast-Check for cache, chart, duration, error handling, fallback, monitor title, status, time, timeout, and validation utilities
- Improves edge case coverage, invariants, and deterministic behavior checks for core utilities
- Refactors test data generation to satisfy strict TypeScript and exact optional property types
- Enhances robustness and performance validation across multiple domains
- Updates some test cases for consistency, clarity, and modern idioms

Relates to improved test reliability and coverage for future-proofing core logic

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7265205)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7265205b03ac1c545d88e9f09190f65d9fdcb548)


- 🧪 [test] Add property-based tests for validation and utilities

- Introduces extensive property-based fuzz testing for validation, schema, and utility modules using fast-check and @fast-check/vitest.
- Ensures comprehensive edge case coverage for string, numeric, array, error handling, cache, chart, duration, download, monitor, status, and time utilities.
- Refines some test logic for correctness and consistency, including protocol validation for URLs (restricts to HTTP/HTTPS).
- Improves test performance and reliability by exploring a wide range of input scenarios and enforcing invariants.
- Updates legacy tests to use modern fast-check property-based patterns.
- Fixes minor issues in test assertions and aligns protocol validation rules across modules.

Relates to enhanced robustness and reliability in testing.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(98d451a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/98d451a0f0d3aacf07d6fe875d10cc76058ca028)


- 🧪 [test] Add comprehensive fast-check fuzzing for shared utils

Expands test coverage by introducing property-based fuzzing using fast-check for core shared utility modules, including cache keys, environment, error handling, log templates, object safety, safe conversions, string conversion, type guards, and type helpers.

Improves resilience and reliability by systematically covering edge cases and unreachable branches, achieving near-complete function and branch coverage on critical code paths.

Updates strict and functional tests to enforce stricter error handling in cache key parsing for invalid and empty identifier scenarios.

Refactors and enhances test descriptions for clarity, correctness, and maintainability, ensuring all major utility behaviors and failure modes are validated.

Relates to quality improvement and coverage goals for the shared utility library.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b9ba8e8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b9ba8e8a90c70c6c55beec515db5051d103ee695)


- 🧪 [test] Achieve 100% coverage with fast-check fuzzing and direct tests

- Adds comprehensive property-based fuzzing and direct test suites for shared and src utilities, constants, and helpers to ensure full branch, statement, and function coverage.
- Integrates fast-check and zod-fast-check for modern fuzzing, updates configs and dependencies, and introduces a CLI coverage analysis script.
- Refactors coverage settings, improves exclusion logic, and updates related dependencies for enhanced accuracy and maintainability.
- Fixes minor logic and typing issues in abort, log, and utility modules to support edge case coverage and robustness.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8b246c1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8b246c18cca2e40b6aa4872308cb2f52d95998f0)


- 🧪 [test] Enhance property-based fuzz testing and coverage config

- Updates all test setups to globally configure fast-check for consistent property-based testing runs.
- Adds extensive fuzzing suites for event bus and data import/export, improving robustness against edge cases and malformed input.
- Refines coverage and exclude configurations for all test environments, leveraging vitest defaults for maintainability.
- Improves regex-based assertions in schema mutation tests for stronger snake_case validation.
- Updates package dependencies to latest patch versions for test and build tooling.
- Removes unused Stryker setup file to clean up project.
- Ensures all property-based tests make assertions on results to satisfy test runner requirements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d6ac036)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6ac036e7f792ba92e906741610567fc846cd872)



### 🧹 Chores

- Update dependencies and improve error handling [`(e8f173f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e8f173f92ed63e2c330353855e2d3f3d501f33d4)



### 🔧 Build System

- 🔧 [build] Enhance Stylelint config for modern workflows

- Expands Stylelint configuration to support HTML, CSS-in-JS, styled JSX, CSS Modules, and SCSS, improving coverage for diverse frontend workflows
- Integrates new plugins for custom properties, BEM patterns, SCSS, and scale enforcement to boost standards, maintainability, and error detection
- Updates ignore patterns to better handle build artifacts and allow linting on relevant JS/TS files
- Upgrades and adds dev dependencies for advanced Stylelint and PostCSS support
- Refines scripts to use compact output, including docs and module files in lint targets
- Improves error handling and type safety in scripts and tests for robustness
- Refines CSS for error states, font sizes, and logical structure to align with new linting rules

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2a4d08f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a4d08f243e299087e73519c35a6cdd0dd1b433f)






## [13.7.0] - 2025-09-04


[[0593130](https://github.com/Nick2bad4u/Uptime-Watcher/commit/05931306af1bb80a7993bea3621e10d7c09dba6d)...
[b1e82fd](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b1e82fdaec2947a9199154361f97b03d9ad889b2)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/05931306af1bb80a7993bea3621e10d7c09dba6d...b1e82fdaec2947a9199154361f97b03d9ad889b2))


### 🛠️ Other Changes

- Add comprehensive tests for useMonitorTypesStore and ThemedProgress component

- Introduced a new test suite for useMonitorTypesStore with 100% coverage, focusing on store initialization, loading monitor types, error handling, validation, formatting operations, and state management.
- Added arithmetic mutation tests for ThemedProgress component to detect potential issues in percentage calculation logic, including edge cases and bounds checking.
- Enhanced useSiteAnalytics tests to cover downtime period calculations, MTTR computation, and percentile index clamping, ensuring robustness against arithmetic mutations.
- Updated Vite configuration to exclude additional directories and files from coverage reports, improving accuracy in test coverage metrics.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b1e82fd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b1e82fdaec2947a9199154361f97b03d9ad889b2)



### 🧪 Testing

- 🧪 [test] Add property-based fuzzing and improve mutation coverage

- Introduces property-based fuzzing tests for backend, database, and shared utilities to strengthen input validation, error handling, and security.
- Updates test suites and store logic to better handle malformed data and edge cases, increasing resilience.
- Enhances Stryker mutation testing by refining configuration, concurrency, and exclusion lists for more reliable and comprehensive mutation analysis.
- Adds prompt generation and workflow documentation for mutation coverage gaps, enabling systematic improvement.
- Cleans up .gitignore and related docs to support new mutation workflow.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0593130)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/05931306af1bb80a7993bea3621e10d7c09dba6d)






## [13.6.0] - 2025-09-03


[[de1fe78](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de1fe78b55bd9d2d7e418d99efb84cd7d576def8)...
[f583a61](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f583a619c9b753476e3ed97d8b993dd0c6e5e534)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/de1fe78b55bd9d2d7e418d99efb84cd7d576def8...f583a619c9b753476e3ed97d8b993dd0c6e5e534))


### ✨ Features

- Implement Chart.js tree-shaking optimization [`(4e4982a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e4982a34fc6b2e14ae54ec31a4de56dd0579523)



### 🚜 Refactor

- 🚜 [refactor] Centralize monitor defaults and enhance validation

- Refactors monitor creation and normalization to use a centralized default config, reducing duplication and risk of divergence between default and validation logic.
- Improves monitor update and normalization by delegating type-specific default logic, ensuring required fields are always present and valid based on monitor type.
- Enhances error handling when converting values to strings and when updating monitors, preventing invalid or malformed data from corrupting site state.
- Adds multiple ESLint formatter dependencies and lint scripts for improved CI and developer workflow.
- Updates several dev dependencies for better compatibility and reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9dbf4d8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9dbf4d850905b21a77f321c09938d9552bb6ac84)


- 🚜 [refactor] Improve type safety, code clarity, and input handling

- Refactors input change handlers for better type safety, introduces specialized and legacy-compatible functions, and updates tests for stricter validation logic.
- Adds defensive runtime checks, explicit type assertions, and targeted eslint-disable comments for safe type narrowing and property access.
- Standardizes number formatting with numeric separators and corrects edge case values across tests and benchmarks.
- Removes redundant type definitions, switches to direct imports, and simplifies logic in several utility and validation functions.
- Enhances error handling and object safety with clearer null/undefined checks and safe merges.
- Improves code readability and maintainability by adopting modern patterns and clarifying defensive programming intentions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(df8c9cc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/df8c9ccbc45e13fce40f6d2f1f7f2d2d4072cd5d)


- 🚜 [refactor] Standardize numeric literals and improve type safety

- Replaces magic numbers with digit separators in tests and shared types to enhance readability and prevent errors with large values.
- Refactors loops to use for-of instead of forEach for better async compatibility and clarity.
- Reorders properties and types in shared type definitions for consistency and maintainability.
- Removes unused or redundant plugin and rule references in ESLint configuration, and disables aggressive rules that hinder flexibility.
- Refactors chart type definitions for better alignment and future extensibility.
- Improves object validation and type safety in database row checking and property access utilities.
- Normalizes global access patterns in test environments for cross-platform compatibility.
- Improves code style and consistency in utility and helper functions by using concise arrow syntax and better naming.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e1a517f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e1a517f42611bfd4f9f264a90c81b90ccc12d49b)


- 🚜 [refactor] Adopt readonly types and modern React imports

- Updates most array and object properties across types, interfaces, and function signatures to use readonly variants for improved type safety and immutability.
- Refactors React component imports to prefer named imports of types (e.g., ReactNode, NamedExoticComponent, FC) and functional utilities (e.g., memo), removing unused default imports and aligning with modern best practices.
- Replaces plain error variable types in test suites with unknown for stricter error handling.
- Cleans up test cases to use assertions over console logging, improving test clarity and maintainability.
- Ensures consistent usage of undefined-coalescing (??) for more robust fallback handling.
- Improves consistency and future-proofing of type usage throughout codebase, reducing risk of accidental mutations and making code more maintainable.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(de1fe78)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de1fe78b55bd9d2d7e418d99efb84cd7d576def8)



### 🎨 Styling

- 🎨 [style] Improve code formatting and readability in tests

- Updates test files to consistently format multiline function calls, arguments, and object literals for better readability.
- Removes unnecessary line breaks and indentation inconsistencies across various unit tests.
- Enhances maintainability and clarity of test logic without changing functionality.

No functional changes or logic modifications are introduced.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f583a61)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f583a619c9b753476e3ed97d8b993dd0c6e5e534)


- 🎨 [style] Normalize formatting and whitespace across codebase

- Unifies code style by converting redundant parentheses, improving spacing, and aligning multi-line constructs for greater readability and maintainability.
- Consistently applies array and object formatting, removes unnecessary blank lines, and harmonizes CSS and Markdown style blocks.
- Enhances test and fuzzing code clarity by standardizing property-based test presentation and nested object/array layouts.
- Updates documentation guides for cleaner bullet points and list formatting without altering content.
- No logic changes; purely improves developer experience and code review efficiency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5ff94cc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5ff94cc392f378d44cd56b5174a9e824ef3b90cb)



### 🧪 Testing

- 🧪 [test] Refactors event handler usage and improves coverage

- Replaces usage of namespaced event handler types with direct imports for improved clarity and developer experience across shared types and theme components.
- Adds centralized namespace for event handler types to enhance discoverability and consistency.
- Refactors fuzzing, property-based tests, and component tests for more robust coverage and aligns with updated type definitions.
- Removes obsolete documentation on bug-finding tools to streamline project files.
- Improves edge case handling in fuzzing tests and validation, increasing reliability and correctness.
- Updates chart utility type imports for consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4e2d88e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e2d88e9d742fe73b2490bb06f6d5e6728eb01c3)


- 🧪 [test] Refactors type guard tests and improves fuzz coverage

- Updates all test files to consistently use the 'guardUtils' namespace and improves naming for type guard and helper imports.
- Refactors tests for clarity, edge case handling, and future maintainability, including more descriptive function names and explicit error objects.
- Improves fuzzing and monitor normalization tests to better validate input boundaries, Unicode handling, malicious input, empty fields, and normalization of invalid data.
- Adds more robust assertions for monitor type, numeric boundaries, and required fields to ensure coverage and correctness.
- Adopts modern JavaScript practices for property deletion, RegExp usage, and global property checks, eliminating outdated syntax and potential lint errors.
- Enhances overall test readability, reliability, and coverage for shared utility modules.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ca5a594)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ca5a594e8a17b70c1dbcb01122d191e6287b59f9)


- 🧪 [test] Improve edge case coverage, formatting, and store tests

- Enhances test coverage for edge cases, store utilities, and constants by adding missing branches, error conditions, and integration scenarios.
- Refactors test formatting for readability, consistency, and maintainability, including indentation and line breaks for complex assertions and object structures.
- Adds and updates VS Code extension recommendations to support development and code review workflows.
- Removes unused TypeScript native-preview dependencies to streamline package management and reduce install size.
- Updates documentation and optimization summaries for accuracy, consistency, and clarity.
- Addresses minor code style and formatting in scripts and CSS for improved readability and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d9d774c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9d774c861fcd9411513e8426d02f498b82f3b56)


- 🧪 [test] Achieve 100% coverage for utilities and core logic

- Adds comprehensive edge case and boundary tests for utility functions, store patterns, constants, and form logic
- Replaces deprecated chart setup module and tests with improved tree-shaking and component-based registration
- Updates and optimizes code for safer property checks and suppresses unnecessary linter disables
- Expands CI/dev scripts for safer git operations and branch management
- [dependency] Updates and adds dev dependencies for markdown tooling and charting
- Improves accessibility and a11y compliance in UI form components
- Fixes test logic to ensure stable assertions under timing-sensitive scenarios
Relates to coverage improvement and maintainability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7615a57)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7615a572356a629d264b8b428334bee2c595e166)






## [13.3.0] - 2025-08-29


[[9f9d51f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9f9d51f985b628981d0a12c09b4a268e0b30171b)...
[d32ee24](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d32ee244a9ea649eebd9877b1f28482b832bb348)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/9f9d51f985b628981d0a12c09b4a268e0b30171b...d32ee244a9ea649eebd9877b1f28482b832bb348))


### ✨ Features

- ✨ [feat] Integrates type-fest for deep type safety and improves config, validation, and UI typing

- Replaces most usages of generic record/object types with type-fest utilities (UnknownRecord, PartialDeep, Simplify, SetOptional, Merge, CamelCase, Except, ReadonlyDeep) for stronger type guarantees across config, validation, theme, forms, IPC, and test utilities
- Refactors monitor, form, theme, chart, and store types to be more expressive, flattening intersection types for developer ergonomics and using type-fest for deep partials and merging
- Adds new utilities for test data creation leveraging type-fest, enabling type-safe mocks and partial objects for robust test scenarios
- Refactors monitor field definitions and validation to provide more granular and type-safe error results, improving error handling and code coverage
- Improves default values and UI fallback logic using ReadonlyDeep for immutability, and introduces deep theme override mechanisms
- Enhances chart, status, and log template utilities with type-fest-powered string/record typing, including CamelCase identifiers and merged config results
- Cleans up code by centralizing type imports and updating test cases to ensure comprehensive type coverage and edge-case handling
- Updates dependencies in package manifests to include type-fest and picocolors

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d11aa22)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d11aa22e8b1c6266df5a93dbd32fa3ab53c59e4c)



### 🚜 Refactor

- 🚜 [refactor] Convert all React default imports to named imports

- Standardizes React imports throughout the codebase by replacing default imports with named imports and type-only imports.
- Refactors all component, hook, and test files to use named exports and imports for React, improving tree-shaking and bundle size.
- Updates logger service to use named export for better mocking and explicit imports in tests and main app.
- Refactors theme and shared components to use explicit named exports, eliminating ambiguity and easing test mocking.
- Cleans up test mocks and usage patterns to align with new named import conventions for React and internal modules.
- Updates hybrid Chart.js type system documentation and implementation, promoting type safety and maintainability.
- Improves type-safe utility function signatures and test coverage for all frontend components.
- Updates build and test configs to optimize dependency chunking and ensure compatibility with named imports in Vite and Vitest.
- Provides scripts and documentation for fixing legacy logger mocks and finding problematic shared imports.
- Ensures full architecture compliance and validates the change with comprehensive test and type/lint passes.

Relates to tree-shaking optimization and modern React patterns.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3b32a21)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3b32a211babfe6619907908d2eeef41e1f619517)


- 🚜 [refactor] Centralize form field base props in shared types

- Unifies core form field properties into a shared base interface to improve code reuse and maintain consistency across input components.
- Reduces duplication by extending the shared base type in component-specific prop interfaces, simplifying future updates and ensuring alignment of accessibility, labeling, and validation features.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(27a857a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/27a857a3d38b51a316cd1eba20d14ddb97635731)



### 📝 Documentation

- 📝 [docs] Document type-fest patterns; update build, lint, and test configs

- Adds detailed documentation for consistent type-fest utility integration, promoting enterprise-grade type safety and improved DX.
- Updates testing and build configs for better cache management, chunk splitting, coverage, and typecheck reliability.
- Refines ESLint, Vite, and Vitest configs to support modern workflows, explicit aliasing, and coverage thresholds.
- Improves agent instructions for clarity, quality standards, and architecture practices.
- Removes outdated tool documentation and enables stricter linting for improved maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(40606e2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/40606e28afba0e02dc44578299ca8c4b4b704d3b)



### 🎨 Styling

- 🎨 [style] Standardizes code formatting and improves docs clarity

- Updates code and markdown files to use consistent quote styles, indentation, and table layouts for improved readability.
- Refines documentation for migration scripts, providing clearer usage instructions and migration examples.
- Adjusts comments and line breaks for better maintainability across test setups, type declarations, and configuration.
- Enhances import processing logic for migration automation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0cfe753)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0cfe753e48b21c2040176298c7abd80ec83ecd63)


- 🎨 [style] Improve code formatting and test consistency

- Refactors code across benchmarks, docs, configs, and test files to enhance readability and maintain consistent formatting.
- Converts multi-line function parameters and object arguments to a more readable style, favoring explicit wrapping and indentation.
- Updates test suites to use concise async parameter destructuring and standardized annotation calls, reducing boilerplate for common test setup and assertions.
- Cleans up comment and documentation formatting to avoid line-breaking issues and improve markdown rendering in guides.
- Does not alter any core logic or application behavior; focuses solely on style, formatting, and developer experience.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9f9d51f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9f9d51f985b628981d0a12c09b4a268e0b30171b)



### 🧪 Testing

- 🧪 [test] Add standardized annotation to all test cases

- Adds consistent metadata annotation to every test case for improved categorization, reporting, and traceability.
- Facilitates future test analytics and integration with external tooling by embedding functional, component, category, and type tags.
- Enhances maintainability and clarity for test suite organization and review.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d4edb44)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d4edb44332bba276156d9bf30d2c7a8b67aa4629)


- 🧪 [test] Improve typings and coverage in tests and mocks

- Updates event and record interfaces to support symbol keys, improving type safety and flexibility in tests.
- Refines test coverage for error handling functions, ensuring proper context is passed and edge cases are exercised.
- Enhances timestamp parsing tests for clarity and reliability.
- Adjusts type assertions and callback signatures in final function coverage tests to reduce type errors and better reflect intended usage.
- Refactors mock monitor history to use a centralized type definition for consistency and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c910bd6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c910bd6b5fe944795ce5ce37d63c90b0c3cc0f47)


- 🧪 [test] Add comprehensive tests to achieve 90%+ function coverage

- Introduces systematic and exhaustive test suites targeting all exported functions across shared and utility modules with previously low coverage.
- Calls functions with varied and edge case arguments to trigger all code paths and validation logic, boosting overall coverage above the 90% threshold.
- Addresses prior gaps in function coverage to improve reliability and future maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(df49925)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/df49925b4ce599a3b2155a686255fd67d1ab1156)


- 🧪 [test] Migrate shared tests to Vitest globals and update setup

- Replaces legacy Jest context and fail function usage with Vitest's built-in globals in shared and frontend tests.
- Adds Vitest setup files for test context injection and updates test environment configuration for improved consistency.
- Removes obsolete Jest types and dependencies from configs and lockfile for leaner dev tooling.
- Updates TypeScript and ESLint package versions for compatibility with latest Vitest and lint rules.
- Fixes test reliability by mocking Date.now in timestamp tests for deterministic results.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e12e07b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e12e07ba24a984719bd998388d22a537d05e6199)



### 🧹 Chores

- 🧹 [chore] Improve code consistency and formatting across tests and types

- Enhances codebase readability by standardizing quotation styles, argument formatting, and multi-line function calls
- Updates documentation comments for clarity and completeness in type definition files
- Refactors several test files to maintain consistent mock and callback syntax
- Removes unnecessary trailing blank lines for cleaner diffs
- Facilitates easier future maintenance and onboarding by enforcing style uniformity

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d32ee24)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d32ee244a9ea649eebd9877b1f28482b832bb348)






## [12.7.0] - 2025-08-26


[[63cdb3a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/63cdb3a0bdb364bb8edbaa29aa4e6c9e635cb6a8)...
[95baf5d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/95baf5d5a6a42dd34c9af8fbd6edb19f4fb105af)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/63cdb3a0bdb364bb8edbaa29aa4e6c9e635cb6a8...95baf5d5a6a42dd34c9af8fbd6edb19f4fb105af))


### 🛠️ Other Changes

- Priority 1.2: Component Props Standards - Documentation & Templates

- Created comprehensive Component Props Standards documentation
- Added reusable prop type definitions in shared/types/componentProps.ts
- Updated UI Feature Development Guide with standardized component templates
- Added standardized event handler patterns and prop interface examples
- Documented consistent naming conventions and accessibility patterns

Part of consistency improvement roadmap Priority 1.2

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(79948fe)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/79948fe3f621450792103a76d090c50d4d2479bc)



### 🚜 Refactor

- 🚜 [refactor] Apply consistent formatting and structure to DB benchmarks

- Standardizes code style across all database benchmark files for better readability and maintainability.
- Uses consistent indentation, line breaks, and parameter formatting for improved clarity.
- Replaces inline callbacks with arrow functions and expands parameter lists for type safety.
- Updates comment and doc block layouts to ensure uniform documentation standards.
- Enhances simulated operations with more realistic delays and batch handling.
- Improves handling of array methods, chunking, and parameter spreading for code reliability.
- Promotes codebase scalability by making future additions and changes easier to manage.

Relates to code quality and maintainability initiatives.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c04042e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c04042e314546f886dba99f8ff2a9de43126436b)



### 📝 Documentation

- 📝 [docs] Add Docusaurus setup guide and improve sidebar UX

- Introduces a comprehensive documentation setup guide detailing architecture, configuration, build process, and best practices for unified Docusaurus and TypeDoc usage.
- Enhances sidebar structure with clearer categories, badges, and improved navigation, including onboarding guides, API sections, and advanced internals.
- Updates custom CSS for sidebar visual cues and badge styling to improve discoverability and organization.
- Refines type guards for form data validation, increases robustness of property access in database utilities, and corrects monitoring status logic for edge cases.
- Disables problematic ESLint CSS class rule to reduce false positives.
- Fixes documentation example for string conversion utility to accurately reflect null handling.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6ddd33a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6ddd33a57ffdfcd36ce44ce367cba9aadc79cb00)


- 📝 [docs] Expand and refine API documentation comments

- Adds detailed JSDoc comments to interfaces, function return types, and component props throughout the codebase for improved code readability and developer onboarding
- Refines descriptions for many UI, store, service, and utility types, clarifying usage, expected values, and domain context
- Removes legacy error catalog and related tests to streamline error handling and reduce redundancy

Improves code maintainability and discoverability by making interfaces, data structures, and API contracts more self-explanatory.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(39e53c9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/39e53c9aa15aff0e079ff49b5cd71d75ae75061c)



### 🎨 Styling

- 🎨 [style] Reformat and align benchmark and test files

- Updates benchmark file indentation and formatting for consistency, readability, and maintainability.
 - Refactors type/interface declarations, arrays, and simulation blocks using aligned indentation and standard code style.
 - Corrects import path format in test file to ensure compatibility with module resolution.
 - Adjusts multi-line TypeScript interface property declarations for improved clarity in test types.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c1e1280)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c1e1280f8c6a6a8c47ca89fdd88a86cb59e38a29)


- 🎨 [style] Standardizes code formatting across docs and tests

- Applies consistent indentation and spacing to documentation, CSS, TypeScript, and test files for improved readability and maintainability
- Switches to double quotes in TypeScript/React files to unify import and JSX style
- Reformats test cases and config files for better alignment and clarity
- No functional or logic changes; focuses solely on code style and formatting for future ease of collaboration

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a71ae02)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a71ae02aad25c2df191685b462780c9a53ed510c)



### 🧪 Testing

- 🧪 [test] Enhance test coverage with contextual annotations

- Adds detailed `annotate` calls to every test case, providing extra metadata such as component, category, type, and functional context.
- Improves traceability and test reporting by categorizing test intent for easier filtering and analysis.
- Ensures all branches, edge cases, and conditional logic are explicitly exercised and documented.
- Facilitates future coverage audits by clarifying the purpose and scope of each test.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(95baf5d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/95baf5d5a6a42dd34c9af8fbd6edb19f4fb105af)


- 🧪 [test] Add annotation hooks to improve test traceability

- Introduces standardized annotation calls to all test cases, capturing contextual metadata such as component, category, and test type.
- Enhances maintainability and traceability by making test intent explicit, aiding coverage analysis and reporting.
- Improves granular filtering and analysis of test results for future automated test pipelines.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(aae7fef)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/aae7fef323e4cc92865e2024b755797c6dc1df51)


- 🧪 [test] Add comprehensive unit tests for shared utilities

- Introduces complete function coverage tests for type guards, type helpers, environment utilities, object safety, string conversion, and safe conversion modules.
- Improves reliability and maintainability by validating edge cases, error handling, and type validation logic.
- Ensures all exported functions are thoroughly exercised, supporting future refactoring and preventing regressions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(666c829)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/666c829ef62a6a21cc1fff237026ab343de60cba)


- 🧪 [test] Achieves 100% function and branch coverage for shared modules

- Ensures all type guards, validation functions, and utility methods in shared modules are fully covered by tests.
- Refactors tests to assert thrown errors for unknown field validation, improving coverage accuracy.
- Adds dedicated test files targeting previously uncovered lines and scenarios in database, formData, schemas, and string conversion modules.
- Updates mock and assertion patterns for consistency and reliability in edge case handling.
- Simplifies type guard checks to prevent false negatives for null/undefined configs.
- Improves maintainability and future regression prevention for schema validation and object safety logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9a3cac6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9a3cac643a64e180e81a3ddefb6a0e80ae5a7f1f)


- 🧪 [test] Achieves 100% test coverage and improves consistency

- Expands and refines test suites across shared and electron modules to ensure full coverage for all functions, type guards, edge cases, and error handling paths.
- Updates formatting, whitespace, and test data for improved readability and consistency.
- Fixes missed edge cases and unreachable lines, increasing reliability of validation, logging, monitor management, and database utilities.
- Enhances maintainability and future-proofing by covering private methods and strict type scenarios.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c46c1bf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c46c1bfa2db13e766e5f5cdd050e7e6cb749ccea)


- 🧪 [test] Achieve 100% coverage for shared and electron modules

- Adds comprehensive and targeted unit tests to electron and shared modules, covering all public methods, type guards, validators, and error handling branches.
- Fixes missing test coverage for logger interfaces, core validation logic, shared utility functions, and database service helpers.
- Refactors sidebar configuration and documentation file structure to improve organization and maintainability.
- Updates TypeDoc configs for more precise documentation generation and markdown processing.
- Ensures rigorous edge case testing for schema validators, type guards, and conversion utilities.
- Motivated by the need to boost overall test coverage to 100% and strengthen code reliability for future development.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(476fd08)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/476fd08a30a77d83fdcf0f81bde692971a468db7)


- 🧪 [test] Improve formatting and coverage for 100% test suites

Updates test files to enhance code formatting, readability, and consistency with project standards.

Expands and clarifies coverage for edge cases in utility, validation, hook, store, and component logic, focusing on dynamic handlers, error categorization, and strict mode behaviors.

Facilitates future maintenance and ensures robust coverage for targeted lines by using explicit structure, type assertions, and more comprehensive input scenarios.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a7de6b2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a7de6b2bd2bc2d6b99cc406fcc6ed40871b8352f)


- 🧪 [test] Achieve 100% coverage for key modules and improve TypeDoc workflow

- Adds comprehensive unit tests to reach full coverage for utility, store, schema validation, monitor forms, and React hooks, targeting previously uncovered lines and edge cases.
- Refactors TypeDoc configuration and build workflow to leverage markdown plugins, update schemas, and enhance MDX compatibility.
- Cleans up legacy scripts, replaces CommonJS with ESM for documentation post-processing, and updates npm dependencies to support new markdown and remark plugins.
- Improves CI and build pipeline for documentation deployments, switches artifact output to unified docs, and updates VS Code settings to reflect new documentation structure.
- Motivated by the need for robust code quality metrics and seamless documentation generation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7e2f6d0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e2f6d073f8ec8731d960a03d45befaa109901a2)


- 🧪 [test] Expand function and branch coverage for utility and validation modules

- Adds thorough unit tests to cover edge cases, branch logic, and all switch statements in utility and validation modules.
- Improves reliability of function coverage reports by explicitly testing null, undefined, complex object, and error scenarios.
- Ensures robust validation and error handling for schemas with ZodError path cases and warning categorization.
- Strengthens coverage for all exported functions, including object safety, string conversion, type guards, and site status logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b4c5d08)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b4c5d08daebdae8faa7734c6c8f4e87a5261021f)


- 🧪 [test] Add comprehensive function and branch coverage tests

- Improves coverage for shared/utils and types modules by adding targeted tests for uncovered branches, edge cases, and complex type guards.
- Increases reliability of type checking, schema validation, and error handling logic through integration and missing-case scenarios.
- Updates test exclusions and coverage providers for more accurate reporting.
- Refines CI and build workflow scripts, dependency versions, and icon handling for Flatpak, enhancing reproducibility and packaging consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c615708)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c615708c6327edcf68ae3a3191860a365de513a2)


- 🧪 [test] Ensure 100% function coverage in string conversion utility

- Updates and expands string conversion utility tests for exhaustive function and branch coverage
- Validates all data types, edge cases, and determinism in string serialization
- Harmonizes formatting and improves readability in multiple test files for consistency
- Refactors multi-parameter functions and class declarations to improve clarity and maintainability
- Fixes ESLint config property formatting for stricter lint compliance
- Reorders and restores schema-related JSON properties to resolve validation warnings
- Standardizes trailing newlines in TypeScript config files for better tooling compatibility

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(23b6fd7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/23b6fd74a7a54975efe12632ec37d8225365ebb8)


- 🧪 [test] Improve test robustness and coverage patterns

- Updates test assertions for safer optional chaining and property access, reducing the risk of runtime errors and improving type safety.
- Refactors test imports and component overrides for consistency, modern syntax, and clearer intent.
- Expands comprehensive coverage for environment detection, conversions, and store creation to address edge cases and improve maintainability.
- Removes redundant and deprecated targeted coverage tests, streamlining the test suite.
- Adds a custom Oh My Posh theme configuration for development productivity.
- Refines .gitignore to ensure development assets are correctly tracked.
- Enhances tsconfig paths for improved tool compatibility.run

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bb8d1da)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bb8d1da1b061e2cfc6b3d91cc6fe7488ef42ae3a)


- 🧪 [test] Boost function coverage to 95%+ with comprehensive targeted unit tests

Adds a large suite of targeted and comprehensive unit tests for shared utilities, type guards, cache key helpers, conversion functions, environment detection, error handling, and validation logic.

Ensures every exported function is called and all code branches are exercised, raising function coverage above the 90% threshold and eliminating all uncovered function lines in shared and backend code.

Improves maintainability, correctness, and future refactoring safety by validating all edge cases, error paths, and integration points.

Relates to coverage improvement goal and future-proofing core utility modules.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(46551b1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/46551b1c85796f2b6dededff858eb8f728b99e00)


- 🧪 [test] Add comprehensive database and electron benchmarks

Adds extensive benchmark suites for database and Electron operations, covering backup/restore, bulk transactions, connection pooling, data validation, index management, migration, query performance, transaction management, and Electron main-process services.

Improves performance visibility, enables regression detection, and facilitates system optimization across core database and application layers.

 - Enables granular measurement of operational characteristics and edge-case behaviors.
 - Supports future performance tuning and reliability improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(63cdb3a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/63cdb3a0bdb364bb8edbaa29aa4e6c9e635cb6a8)



### 🔧 Build System

- 🔧 [build] Move test configs, standardize cache and paths

- Relocates Vitest and TypeScript test configuration files into dedicated 'config/testing' and 'config/benchmarks' directories for improved maintainability and separation of concerns.
- Updates references across scripts, ESLint, Sonar, Knip, and documentation to match new config paths.
- Standardizes tool cache locations under a single '.cache/' directory and updates ignore/purge rules to avoid stale artifacts.
- Cleans up obsolete audit and roadmap reports, and refreshes benchmark code for simplified structure and modern APIs.
- Improves code consistency, future test scaling, and cross-tool integration for CI and static analysis.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f5b4450)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f5b4450b1d541f249469a33f89d10c1eabb88a74)


- 🔧 [build] Enhance Docusaurus ESLint config and plugin setup

- Integrates dedicated Docusaurus ESLint plugin and CSS modules linting for improved doc code quality.
- Refines ignore patterns for Prettier and ESLint to better target build artifacts and generated docs.
- Expands Docusaurus site configuration with new UI, navigation, and future/experimental flags.
- Promotes internal validation utilities for broader, type-safe reuse.
- Improves field validation error handling for stricter schema compliance.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6c88b5b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6c88b5ba2f9fab10c4a20ca21778a9bc568a0121)






## [11.6.0] - 2025-08-19


[[754b12a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/754b12ac1764817ab106cc94768f3dbde46096c3)...
[3ba8232](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3ba8232fa1887032f96bdd35adf80bad1fa58031)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/754b12ac1764817ab106cc94768f3dbde46096c3...3ba8232fa1887032f96bdd35adf80bad1fa58031))


### ✨ Features

- ✨ [feat] Add production-ready DNS monitor support

- Implements full DNS record monitoring as a first-class monitor type, supporting all major DNS records (A, AAAA, CNAME, MX, TXT, NS, SRV, CAA, PTR, NAPTR, SOA, TLSA, ANY) with configurable timeout, retry, and detailed error handling
- Updates UI, schemas, validation, type definitions, and registry to seamlessly integrate DNS monitoring with safe string handling, conditional form logic, and dynamic title formatting
- Refactors documentation and developer patterns to reflect real DNS implementation experience for future extensibility
- Expands test coverage and updates all monitor type counting logic to include DNS
- Improves frontend form logic and backend normalization for DNS-specific fields
- Fixes validation, code style, and field mapping issues for robust integration

Relates to DNS monitoring feature rollout and architecture enhancement

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0dc69ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0dc69ae4614f8f0bb24b4ee1fd42d0eae2dac3c7)



### 🛠️ Bug Fixes

- 🛠️ [fix] Improve form validation and build/test configs

- Enhances form data validation to check for non-empty strings and valid port ranges, reducing user input errors.
- Updates test and build scripts to clarify build dependencies and ensure shared code is included in tests.
- Refines type exclusion in testing to avoid omitting functional files.
- Cleans up ESLint config by removing redundant plugin and rules.
- Improves workflow triggers and VS Code settings for better productivity and cleaner workspace.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2ea5866)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2ea5866acbedf67207f892f6df2aa16bfbc21df8)



### 📝 Documentation

- 📝 [docs] Enhance and standardize code documentation across app

- Improves codebase maintainability by expanding, clarifying, and unifying documentation comments in all major modules, including backend, shared, and frontend areas
- Adds detailed @remarks, @example usage, and @packageDocumentation tags, clarifying responsibilities, key features, contracts, and usage patterns
- Refines docstring structure for better developer experience and onboarding, reducing ambiguity and duplication
- Prioritizes type safety, error handling, and design rationale explanations in comments
- No functional or logic changes; strictly documentation-focused

Relates to internal documentation quality initiative

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(754b12a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/754b12ac1764817ab106cc94768f3dbde46096c3)



### 🎨 Styling

- 🎨 [style] Expands multiline array formatting for consistency

- Standardizes multiline array/object formatting across all code, tests, and configuration to improve readability and maintain consistency with formatting rules.
- Updates Prettier threshold to trigger wrapping for arrays with two or more elements, ensuring uniform code style.
- Refactors affected logic and test files to use expanded array/object formatting, without altering functional behavior.
- Facilitates easier code reviews and future maintenance by aligning with formatting standards.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3ba8232)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3ba8232fa1887032f96bdd35adf80bad1fa58031)



### 🧪 Testing

- 🧪 [test] Achieves 90%+ function coverage and modernizes build configs

- Adds comprehensive and precision-focused unit tests to target remaining uncovered logic, pushing function coverage above 90% threshold
 - Refactors and expands test cases for edge scenarios, validation, and utility functions
 - Updates workflows and configuration files for Flatpak and CI: moves to latest Node.js, upgrades SDK extensions, and improves smoke-checks for build artifacts
 - Cleans up dependency management by moving many dev dependencies to optional, simplifying peer and dev lists
 - Improves code style consistency and formatting in test files and config scripts
 - Enhances error handling, validation, and site status logic coverage for maintainability and future-proofing

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(66dc4a7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66dc4a75b407a3400836e55f5ffef207632069bb)


- 🧪 [test] Boost function coverage above 90%

- Adds comprehensive and targeted tests for utility, validation, type guard, store, site status, configuration, error handling, and component helper functions to address remaining uncovered branches.
- Expands existing suites and introduces new ones for edge cases, integration, async behaviors, and error scenarios, especially for monitor types, form data, and cache/electron API handling.
- Refactors and enhances test structures for improved reliability and coverage accuracy, including additional DNS monitor logic and UI/component state transitions.
- Motivated by coverage report analysis to ensure function coverage surpasses the 90% threshold.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8d18476)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8d18476bd7f79e305f1b63c834ef81387000002c)


- 🧪 [test] Increase coverage for edge cases and error handling

- Adds targeted tests to cover error scenarios and default cases in utility functions, improving branch and catch-block coverage.
- Refines test logic for string conversion, replacing array iteration with explicit loops for better clarity and robustness.
- Mocks store hooks and theme dependencies more explicitly to prevent test contamination and improve isolation.
- Updates exclusion patterns for editor search and static analysis to ignore additional generated and documentation directories.
- Expands ESLint configuration to suppress implicit dependency warnings for a new module, reducing unnecessary lint errors.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2b7c241)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2b7c241e9171583d806542851d3aff4f7299992d)



### 🧹 Chores

- 🧹 [chore] Standardize formatting and improve test robustness

- Removes unnecessary blank lines and ensures consistent formatting across markdown, config, and test files for clarity and maintainability.
- Refactors test cases to use double quotes and modernizes proxy/object setups for improved reliability and coverage.
- Updates ESLint config for clearer implicit dependency handling and better readability.
- Enhances documentation comment blocks for easier parsing and future editing.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8faf3a9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8faf3a9768171e2591486eac8b3a5980a57e901a)






## [11.4.0] - 2025-08-18


[[c47a49b](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c47a49b786d7a057939c0fb064d224640376a2f3)...
[dc51463](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dc5146369ab47cff4342fd8182d9038af7cc6007)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/c47a49b786d7a057939c0fb064d224640376a2f3...dc5146369ab47cff4342fd8182d9038af7cc6007))


### 🧪 Testing

- 🧪 [test] Improve formatting and coverage in shared and app tests

- Enhances test readability and consistency by reformatting code and array/object literals.
- Increases code coverage for unreachable and edge cases, especially in string conversion utilities and app status logging.
- Refactors mock usage for greater clarity and correctness in test callbacks and assertions.
- Removes unnecessary whitespace and ensures files end with newlines for better style compliance.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(dc51463)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dc5146369ab47cff4342fd8182d9038af7cc6007)


- 🧪 [test] Achieves 100% coverage for unreachable code paths

- Adds new tests to explicitly cover previously unreachable branches and edge cases in utility and app modules, ensuring full coverage and branch testing.
- Refactors existing tests for improved clarity and robustness, especially in type and undefined handling.
- Enhances coverage for development-only logging code and status update callbacks, including fallback logic.
- Improves configuration for linters, commit conventions, and CI workflow to support stricter standards, automated fixes, and better reporting.
- Updates and cleans up project configuration files for consistency and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c47a49b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c47a49b786d7a057939c0fb064d224640376a2f3)






## [11.2.0] - 2025-08-17


[[65ffe57](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65ffe5781675cf4a2564edfdbaf21d5a07646703)...
[87f0fff](https://github.com/Nick2bad4u/Uptime-Watcher/commit/87f0fff20190d60172ed1733a0b71d12f3d4742f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/65ffe5781675cf4a2564edfdbaf21d5a07646703...87f0fff20190d60172ed1733a0b71d12f3d4742f))


### ✨ Features

- ✨ [feat] Add advanced linting plugins and strict schema validation

- Integrates several ESLint plugins for code quality, safety, and package.json validation, including etc, package-json, safe-jsx, loadable-imports, and zod.
- Enforces stricter Zod validation schemas for monitor and site objects and introduces history tracking for monitor status.
- Updates scripts and overrides for improved benchmarking and development workflows.
- Adds a Vite plugin to address CSP issues with zod in development.
- Removes references to deprecated or broken dependencies and tidies package metadata.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(756407d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/756407dbf0a4627eeb2c76362fa4a841f76903bc)



### 🛠️ Bug Fixes

- 🛠️ [fix] Prevents invalid site selection and port 0 usage

- Excludes port 0 from validation to avoid reserved or misconfigured ports.
- Improves site lookup to handle null and undefined entries, preventing errors.
- Adds a version counter to theme changes for more reliable updates.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a403ae4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a403ae475183f33dd7f1bb01fd0da1fa5179039e)


- 🛠️ [fix] Handle missing monitor intervals and settings safely

- Prevents incorrect monitor scheduling by defaulting to a predefined interval when none is specified, improving reliability.
- Ensures imported settings are safely handled when null or undefined to avoid runtime errors.
- Strengthens monitor validation by enforcing allowed types and robustly checking active operations.
- Refines backend focus sync effect cleanup logic for consistency when toggling enabled state.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(806a6d3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/806a6d378dec9c3a7eecf00bf5b502c36eaaab27)


- 🛠️ [fix] Eliminate ESLint errors, improve code consistency, and optimize async logic

- Resolves all remaining ESLint errors and warnings by refactoring code to comply with linting rules, including function style, callback usage, and object method definitions
- Refactors sequential async operations to run in parallel where safe, improving performance for monitor and site history operations, and uses Promise.all or Promise.allSettled for batch processing
- Converts function expressions to concise arrow functions and removes unnecessary curly braces, enhancing code readability and consistency
- Updates React component definitions to use implicit returns for stateless components, streamlining JSX rendering
- Adds and adjusts ESLint directives for legacy dialog usage, side-effect constructors, and loop awaits to clarify intentional design and maintain code quality
- Moves helper utilities and type guards to top-level definitions, ensuring proper ordering and avoiding duplicate declarations
- Refactors error handling, logging, and template interpolation for clarity and maintainability
- Updates environment and validation utilities for improved type safety and explicitness
- Incorporates new ESLint plugin (publint) and config for stricter lint integration and future package quality checks
- Improves code comments and documentation, clarifying rationale and future intent for maintainers
- Fixes various minor bugs in async state handling, callback memoization, and UI branch logic to ensure reliable operation and correct rendering

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9b981d3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9b981d39ef3ad9e49179969f84107c91a519f3da)



### 🚜 Refactor

- 🚜 [refactor] Migrate frontend to shared import alias and update project structure

- Refactors all frontend and Electron imports to use the "@shared/" alias for shared modules, improving maintainability and reducing relative path complexity.
- Updates tsconfig references and composite build settings to support project references, enhancing build performance and tooling compatibility.
- Renames Tailwind config for compatibility with latest syntax.
- Adds centralized error catalog and site status utility wrappers for improved error handling and consistent frontend usage.
- Ensures Chart.js components are correctly registered for chart rendering reliability.
- Cleans up chart and store logic for better type safety and clarity.
- Improves test setup for availability descriptions and corrects UI behavior based on percentage ranges.
- Expands ESLint and dev dependencies for stricter alias and import rules, ensuring future code hygiene.
Relates to improved modularity and developer experience.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5d35628)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5d35628ec600a51570a77d4ad577475e1232d114)


- 🚜 [refactor] Eliminate type and logic duplication, centralize shared code

- Removes redundant local type definitions and re-exports, standardizing all domain types to import from shared sources for consistency and maintainability.
- Centralizes error handling, event listener management, and monitor validation logic to reusable factories and helpers, reducing code repetition across stores and services.
- Refactors form components and chart imports to use shared wrappers and direct imports, improving accessibility and reducing boilerplate.
- Updates validation utilities and schemas to share host/port logic, streamlining monitor configuration checks.
- Cleans up unused files and legacy wrappers, focusing on unified sources of truth for types and logic.
- Improves cleanup processes for app, window, and auto-updater event listeners to prevent memory leaks.
- Enhances store operation helpers for error state consistency and easier future extensions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(65ffe57)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65ffe5781675cf4a2564edfdbaf21d5a07646703)



### 📝 Documentation

- 📝 [docs] Clarifies formatting in code documentation comments

- Updates code comments across multiple files to use consistent formatting for special values and thresholds (e.g., wraps numeric and percentage values in backticks).
- Improves clarity of documentation by explicitly listing return conditions and outcomes, making it easier for future contributors to understand the logic and expectations.
- Enhances readability and professionalism in docstrings and inline comments for maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9fc5ae7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9fc5ae7e67acc0f00b8d18bd498837283e678056)


- 📝 [docs] Improve documentation structure and clarity

- Updates code comments and docstrings to correct formatting, enhance readability, and clarify the behavior of functions and configuration parameters.
- Revises list and code example formatting for consistency and developer guidance.
- Refactors CSS import and theme configuration order for better clarity, and adds modern animation, shadow, and utility definitions to improve maintainability and customization.
- Makes documentation more approachable for future contributors by aligning with standard conventions and Tailwind CSS v4 syntax.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(785c287)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/785c2871dcbfd27877fe60ccd0817e18953ab47a)


- 📝 [docs] Standardize and clarify TSDoc across codebase

- Updates documentation comments throughout the codebase to use consistent TSDoc tag ordering and formatting
- Adds missing @example, @param, @returns, and @remarks sections to API documentation
- Improves clarity and readability of doc comments for public, internal, and private APIs
- Ensures all doc tags are separated with line breaks, with examples moved after param/returns/throws where appropriate
- Makes documentation more accessible for tooling and future contributors, reducing ambiguity and improving maintenance

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2a0d90a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a0d90ac60b1cfc419649a13bdee09513dbff751)


- 📝 [docs] Improve and standardize JSDoc formatting throughout codebase

Updates documentation comments for greater clarity, consistency, and completeness across all modules and public interfaces.

 - Adds missing parameter and return tags, ensures example sections are well-formatted, and clarifies remarks.
 - Harmonizes line breaks and indentation for improved readability, using a uniform structure for all JSDoc blocks.
 - Enhances maintainability and developer experience by making API documentation more accurate and discoverable.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7772b24)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7772b2450e8ff583e1609065fff7fa9c3f8556da)



### ⚡ Performance

- ⚡ [perf] Optimize theme application and app startup UX

- Prevents unnecessary theme re-applications and DOM updates to reduce UI flickering and repaint overhead.
 - Improves loading overlay behavior to avoid flashes during app initialization and fast operations.
 - Ensures user theme preferences persist through backend sync and store initialization.
 - Adds persistent monitoring resumption after app restart for reliable backend state.
 - Refines CSS for better transitions and reduced fallback duplication.
 - Updates test helpers for more flexible default data handling.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5509ea5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5509ea5331850de2e996d7ccf4159d0bbbfd42b9)



### 🎨 Styling

- 🎨 [style] Enforces consistent array/object formatting in tests

- Improves readability and maintainability by vertically formatting array and object literals across all test files and documentation examples.
- Removes two legacy AI copilot instruction files to clean up project standards.
- Enhances clarity in code samples and test coverage by standardizing indentation and spacing, making future updates and review easier.
- Does not alter any logic or behavior; focuses solely on visual and structural consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(282ddb1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/282ddb197548f8d5e719c324b1ed0df487ad8c9f)


- 🎨 [style] Improve array formatting for readability

- Reformats array literals across multiple files to use multi-line style, enhancing code clarity and consistency.
 - Aims to make editing and reviewing array elements easier for future contributors.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ba96318)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ba963181c3853684931a0ae4bebd8af6ea71d5df)


- 🎨 [style] Improves code formatting and consistency

- Applies consistent code style and indentation across documentation, templates, and test files for better readability and maintainability.
- Refactors multiline arrays, objects, and function calls to enhance clarity, especially in tests and example implementations.
- Updates markdown code block syntax in documentation templates to ensure proper formatting.
- Does not change any functional logic or behavior.

Relates to code quality and developer experience improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(69b58f0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/69b58f0c1bc6f8b14e8613d0802fed103ecf5035)



### 🧪 Testing

- 🧪 [test] Add comprehensive unit tests for test helpers

- Introduces thorough test coverage for utility functions supporting monitor creation and status history.
- Validates default behaviors, edge cases, type safety, and performance for test helpers.
- Ensures robust handling of overrides, monitor types/statuses, and large data sets for reliability in test scenarios.
- Updates project version to reflect new test coverage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(87f0fff)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/87f0fff20190d60172ed1733a0b71d12f3d4742f)


- 🧪 [test] Update test imports for improved maintainability

- Replaces deep relative import paths in shared test files with shorter, maintainable paths to local modules.
 - Adds "shared/test/**/*" to TypeScript exclude list to prevent test files from affecting build and type checking.
 - Improves clarity and consistency of type assertions in test cases, enhancing TypeScript compatibility and reducing noise.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(64e370d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/64e370de3aef364a08bf034d7793851f5ffe7500)


- 🧪 [test] Expand edge and branch coverage for UI, utils, and store logic

Improves test coverage by targeting previously uncovered lines and edge cases across UI components, utility functions, and store logic.

 - Adds detailed scenario tests for form fields, dynamic field types, custom switch statements, error boundaries, and API error handling
 - Refactors test formatting for readability and consistency, including proper line breaks, indentation, and multi-argument calls
 - Ensures all conditional branches and error paths are exercised, including custom error objects, development and production logging, keyboard handlers, and rehydration flows
 - Validates fallback logic, formatter priorities, conditional prop spreading, and accessibility attributes

Supports future code changes by reducing risk of regressions and clarifying expected behavior under complex or unusual input conditions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bcbbab0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bcbbab00ee1457ea1762ae688133c349f9672abd)


- 🧪 [test] Achieves 100% branch and line coverage across modules

- Improves test coverage for core modules, validation utilities, UI components, and store logic
- Adds edge case, error path, and conditional branch tests to ensure robust coverage for all significant code paths
- Refines and expands test suites for component props, schema validation, store rehydration, keyboard interactions, and branch logic
- Strengthens reliability and maintainability by verifying error handling, switch statement defaults, and integration scenarios

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(cf6d41d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cf6d41d742c35b9537a5cfe2fe5aa0e88b336a70)


- 🧪 [test] Standardize monitor test mocks and TypeScript compliance

- Ensures all monitor-related tests use complete mock objects with required properties, fixing TypeScript errors and improving coverage consistency
- Refactors test helpers to provide reusable monitor and history generators, reducing duplication and mismatches across test suites
- Updates assertions and test implementations to use strict property access and valid types
- Removes unused imports and simplifies test setups and mock implementations for clarity
- Improves test reliability and future maintainability by enforcing strict type usage

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(87341c7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/87341c7408746ec17e94186cc49c993fbc559e60)


- 🧪 [test] Achieves 100% coverage for React components and stores

- Adds comprehensive and targeted tests for uncovered lines and branches in React components, hooks, utils, and stores
- Enhances error handling, edge case validation, and callback coverage
- Refactors and formats existing tests for improved readability and maintainability
- Updates documentation to clarify testing methodology and coverage patterns
- Cleans up trailing whitespace, formatting, and missing newlines in config files
- Improves consistency in test mocks and coverage of advanced scenarios

Relates to coverage improvement initiative

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ea7201a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ea7201a5d06fb7063777aac521f41798c3b31fea)


- 🧪 [test] Achieve 100% coverage for components, stores, and utils

- Adds comprehensive and targeted tests to reach full branch and line coverage for React components, hooks, store logic, and utility functions.
- Addresses previously uncovered error handling, edge cases, and branching logic, especially for form validation, state management actions, and fallback behaviors.
- Improves maintainability and reliability with systematic coverage methodology documentation and reusable testing patterns.
- Refactors test helpers to enforce correct monitor type assignment and prevent accidental override.
- Updates documentation to summarize coverage improvement strategy for React components and test methodology.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fccc30c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fccc30c2e1de96c10e7bbb26b56beb2862a05eae)


- 🧪 [test] Update imports and mocks for ESM compatibility

- Ensures all test imports use explicit `.js` extensions to support ESM environments and avoid ambiguous resolution.
- Refactors test mocks to use direct instance-based mocking and factory method spies for improved maintainability and clarity.
- Adds the required `history` field to monitor objects in validation schema tests, addressing new schema requirements and enhancing branch coverage.
- Cleans up className assertions in UI tests for more accurate whitespace handling.

Supports future module system upgrades and improves overall test reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b511a9f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b511a9f98879754e79ed89eedae22f4078b4b7f5)


- 🧪 [test] Unskips and refines tests, removes obsolete files

- Unskips numerous previously skipped unit and integration tests across backend, frontend, and shared code to improve coverage and surface testable logic.
- Refines test assertions for monitor normalization, validation, and IPC service responses to better match updated implementation and validation logic.
- Removes obsolete and redundant comprehensive test files that duplicated coverage, reducing maintenance burden.
- Adds enhanced mocking for event bus and service dependencies, improving correctness and isolation for service and site manager tests.
- Updates test logic to clarify expectations for default values, error handling, and state transitions.
- Introduces shared ESLint config for project consistency.
- Improves accuracy of validation and monitor-related tests, handling more edge cases and error conditions.
- Fixes minor inconsistencies in test assertions for UI, theme, and state sync logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6698db8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6698db8b6fe06f1f8f08162018e2f50cdd2885c9)


- 🧪 [test] Add comprehensive isolated tests for IPC and data services

- Improves test coverage and reliability for IPC parameter validators, ServiceContainer, and DataImportExportService by introducing fully isolated, hoisted, and factory-based mocks.
- Expands test scenarios to validate edge cases, error handling, handler registration, and complex object validation for all major handler groups and database operations.
- Refactors existing tests to use more robust mocking patterns, ensuring correct dependency injection and interface compliance.
- Addresses previous mocking issues for event bus and service dependencies, enabling consistent test execution order and realistic behavior simulation.
- Enables future maintenance and extensibility by standardizing test structure and enhancing coverage across service layers.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1652c20)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1652c20a9c166a85466b53d7fbb9d981af3e65da)


- 🧪 [test] Boost branch coverage and improve effect hooks

- Expands test suite with comprehensive branch coverage for key UI components, hooks, and entry point logic, targeting previously untested conditions and branches.
- Refactors `useEffect` usage throughout the codebase to use named functions for better debugging and maintainability.
- Updates usage of `getElementById` for improved app initialization performance.
- Modernizes ESLint config and scripts, including plugin upgrades and new sorting automation.
- Refines theme and error styling for accessibility and consistency.
- Fixes and simplifies state updates, effect cleanups, and prop passing for improved UI reliability.
- Relates to coverage and maintainability improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(294e5f3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/294e5f3b7739f85753ea4d3666e5e5b5387da695)


- 🧪 [test] Enhance AddSiteForm branch and coverage tests

- Expands AddSiteForm test suite with an enhanced comprehensive test file, covering all user interactions, state changes, error scenarios, validation logic, accessibility, and edge cases.
- Fixes test assertions for check interval values using underscores for clarity and consistency.
- Improves branch coverage for useSiteDetails and related hooks with new and more granular test cases, ensuring all code paths (validation success/failure, early returns, edge cases) are exercised.
- Updates existing tests to use more idiomatic number parsing and interval values, and refactors repeated logic for maintainability.
- Boosts overall code quality and reliability by maximizing test coverage and verifying robustness across realistic and extreme scenarios.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5454e42)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5454e42fa22567c2328317c15e69c399b078fec9)



### 🧹 Chores

- 🧹 [chore] Remove unused lint and Vite plugins; modernize test mocks

- Cleans up dependency lists by removing obsolete Stylelint configs, lint plugins, and Vite extensions to streamline maintenance and reduce install bloat.
- Updates test and mock setup to consistently use globalThis for polyfills and mock APIs, improving reliability and compatibility across environments.
- Refactors numeric literals in tests for readability and standardization.
- Deletes redundant backup test files to reduce clutter.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d44bcf0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d44bcf0a55efb5b5f8daaabbb45021e5f242f6d9)



### 👷 CI/CD

- 👷 [ci] Add dedicated shared test coverage and unify scripts

- Separates shared utility test coverage into its own configuration and CI flag, enabling more granular reporting in Codecov and Codacy.
- Updates workflow scripts, package scripts, and documentation to consistently reference new shared test commands.
- Removes redundant test coverage and optimizes inclusion/exclusion patterns for frontend, backend, and shared test suites.
- Improves test reliability, reporting, and coverage thresholds for shared code.
- Cleans up legacy workflow and aligns configuration files for better maintenance.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3151972)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/315197276f56fa43b65846357ea7c2b0ba984874)



### 🔧 Build System

- 🔧 [build] Update config files for improved tooling and linting

- Reorders and restructures multiple configuration files for tools such as ESLint, Prettier, Knip, Repomix, and Typedoc to optimize readability, maintainability, and compatibility with plugins
- Adds and upgrades devDependencies for enhanced linting (including plugins for hardcoded strings, undefined CSS classes, tree-shaking, JSON sorting, and React hooks addons)
- Improves ESLint setup for CSS files and enables advanced rules and plugins for strict code quality enforcement
- Refines Prettier configuration to support JSON sorting, Tailwind CSS, and better plugin management
- Enhances VSCode settings for CSS and Stylelint integration, disables unnecessary validation, and updates TypeScript preferences
- Optimizes markdown-related config files for improved link checking and formatting behavior
- Refactors test code and imports for style consistency and to avoid unnecessary destructuring
- Improves documentation config ordering and grouping for Typedoc outputs
- No breaking changes; focuses on developer experience and codebase maintainability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e7d1927)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e7d19273c4668c77d8a2d75ca5e6ba476ff43052)






## [10.5.0] - 2025-08-12


[[570e742](https://github.com/Nick2bad4u/Uptime-Watcher/commit/570e74289cbf93d3999736a2d2db9a19cc0fc985)...
[6e27f4f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e27f4f11dcd5705587a47e4f687db69697a7a5f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/570e74289cbf93d3999736a2d2db9a19cc0fc985...6e27f4f11dcd5705587a47e4f687db69697a7a5f))


### ✨ Features

- ✨ [feat] Unifies error alerts & improves event handling

- Introduces a centralized, accessible error alert component for consistent UI messaging, replacing ad-hoc error display logic throughout the app.
- Refactors event handlers and callbacks to use `useCallback` and a custom `useMount` hook, reducing unnecessary re-renders and eliminating inline functions for better performance and code quality.
- Moves monitor type config to shared types for better modularity and avoids circular imports.
- Updates ESLint config to enable stricter rules and add overrides for improved maintainability.
- Enhances settings and site details interactions with more descriptive button labels and accessibility improvements.

Relates to improved UX, maintainability, and test coverage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(10b2188)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/10b2188d81a23b8b44828f504dd52c3d4d5bff16)



### 🛠️ Bug Fixes

- 🛠️ [fix] Add defensive checks and error handling for theme and env vars

- Improves robustness across environments by adding null checks for theme property objects before accessing their values, preventing runtime errors in tests and SSR.
- Adds try/catch error handling to event emission and environment variable access to gracefully handle edge cases and log failures.
- Refines fallback logic for file download errors to ensure proper error propagation and warning logging.

Relates to improved cross-environment compatibility and test reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b7b41b9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b7b41b93eb3a4c7a1c1214e23f25b28a4817a55c)



### 🚜 Refactor

- 🚜 [refactor] Centralize validation logic and remove redundant code

- Moves monitor data validation to shared modules for consistency and maintainability.
- Removes duplicate and unused validation helpers and test utilities.
- Improves type guard reliability by enforcing finite values for timeout and retry attempts.
- Enhances availability description logic by integrating it with theme utilities for better UI cohesion.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a5ee215)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a5ee215f43dcc4f8123784f8d79a292b7a3f265a)


- 🚜 [refactor] Move class methods to bottom, improve consistency

- Refactors multiple classes and components to consistently place constructors and utility methods at the end of class definitions, following a bottom-up structure.
- Improves readability and developer experience by reducing code churn from method reordering and aligning code organization across backend and frontend layers.
- No logic or algorithm changes; ensures future maintainability and easier onboarding.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c0b2e9d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c0b2e9d011443931f6233ae7b5ae5bf13760f95f)


- 🚜 [refactor] Reorders function and type declarations for clarity

Moves interfaces, types, and helper functions to improve code organization and readability.
Reduces cognitive overhead by placing frequently used or public-facing types before implementation details.
Minimizes risk of circular references and enhances maintainability for future development.
No functional changes; logic and behavior remain the same.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c39da7d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c39da7d1aa9363963d7d4a964c9824e8cdf16447)


- 🚜 [refactor] Centralize type safety and doc enhancements

- Reorganizes type assertions and type guard utilities into dedicated modules for safer, reusable patterns around IPC, database, and value validation
- Improves documentation and code comments across core constants, logging utilities, and type helpers for clarity and maintainability
- Refactors database access to use new type-safe query helpers, reducing scattered and unsafe type casts
- Updates event handling and store logging logic for consistency, readability, and safer type coercion
- Cleans up unused files and simplifies store utility imports to avoid circular dependencies

Enhances codebase reliability, developer experience, and future extensibility by making cross-cutting type operations explicit and robust.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f11d949)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f11d9498071c6bb17410e540202cba19e2838e10)


- 🚜 [refactor] Modularize theme components and improve type sourcing

- Splits large themed component file into individual modular components for maintainability and better tree-shaking.
- Unifies and clarifies type imports by using explicit direct imports from shared types, reducing re-exporting ambiguity and linting issues.
- Refactors form field and input components for enhanced accessibility, composability, and consistent styling.
- Updates references across the codebase to use new theme component import paths and shared types, improving clarity and IDE support.
- Improves error boundary usage and testing by extracting HOC into a separate module.
- Enhances chart components with dedicated memoized wrappers for performance and code clarity.
- Updates tests to accommodate new theme/component architecture and import patterns for more robust coverage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2479b50)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2479b50b9775e9c075e841466b05d8027627e5cd)


- 🚜 [refactor] Apply consistent 'import type' usage and clarify logic

- Uses `import type` for all type-only imports across backend and frontend to improve build performance and maintain clarity between types and runtime code.
- Refactors callback and handler implementations for better readability and reliability, especially in hooks and UI components.
- Updates logic to leverage object destructuring, array destructuring, and property access for more concise and safer code.
- Normalizes boolean checks to avoid redundant comparisons (e.g., replaces `monitoring === true` with `monitoring`).
- Improves error handling, callback cleanup, and internal state initialization patterns to enhance maintainability and prevent subtle bugs.
- Expands and clarifies doc comments for enhanced developer understanding and future maintenance.
- Makes method/property access more explicit and type-safe, reducing risk of runtime errors.
- No breaking changes; all refactors maintain backward compatibility.

Relates to improved codebase consistency and prepares for future type-driven tooling.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(10ce7fc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/10ce7fc027c022c5aadc845004548d1a49656859)


- 🚜 [refactor] Enforces explicit type annotations app-wide

- Standardizes type annotations for constants, exports, interfaces, and function return types across backend, shared, and frontend codebases
- Introduces explicit interface/type definitions for configuration objects, catalog structures, stores, theme systems, chart setups, and component props
- Improves React component typing for memoized and functional components, ensuring accurate props and JSX/return values
- Refactors store and cache definitions for proper TypeScript inference and persistence, increasing type safety and maintainability
- Facilitates better IDE support, code navigation, and future refactoring by reducing implicit 'any' and clarifying expected shapes [`(570e742)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/570e74289cbf93d3999736a2d2db9a19cc0fc985)



### 📝 Documentation

- 📝 [docs] Add automated download scripts for package docs

- Introduces scripts to automate downloading documentation for Electron, Chart.js, React, and Zustand from their official sources and repositories.
- Cleans, rewrites, and saves docs in Markdown format with normalized links for consistency and local use.
- Updates test files and type imports for stricter type usage and improved test reliability.
- Refines documentation formatting for clarity, markdown consistency, and improved code sample indentation.
Removes unused internal logging module to streamline codebase.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(48fe5af)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/48fe5af8375daec3ab295b77cd23a2af68570351)



### 🎨 Styling

- 🎨 [style] Use unified import style for types with 'import { type ... }'

Standardizes all type-only imports to use the `import { type ... }` syntax
across the codebase for improved clarity and consistency. Aligns with modern
TypeScript best practices, making type imports more explicit and reducing
potential confusion between values and types. No functional changes introduced.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4ff6320)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4ff6320f2b0afb864aeca890ab7473135c68fa3e)


- 🎨 [style] Enforce Tailwind and array type consistency; improve UI class order

- Harmonizes Tailwind CSS class order and formatting across components for improved readability and style consistency
- Prefers T[] over Array<T> for simple types in TypeScript, updating types throughout backend and frontend for uniformity
- Adds project-specific Tailwind linting to ESLint config and enables stricter rules for style and import conventions
- Refines UI layouts and button/component alignment for greater visual clarity
- Improves accessibility and disables relevant lint rules only when necessary
- Strengthens error handling and fallback formatting in analytics
- Enhances semantic version validation logic for robustness

Relates to ongoing UI/UX and code quality improvements

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8d0656d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8d0656d263c6fbf04bb9851d7cb64a18bbc5a936)


- 🎨 [style] Apply consistent multi-line formatting project-wide

- Updates codebase and documentation to use multi-line parameter and array formatting for improved readability and consistency.
- Refactors function and method signatures, object initializations, and complex destructuring to span multiple lines where appropriate.
- Enhances maintainability and reduces merge conflicts by enforcing a unified code style.

Relates to ongoing style standardization efforts. [`(0e475eb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0e475eb71b2874d6c479c4bbf22380c24e9479eb)



### 🧪 Testing

- 🧪 [test] Improve coverage and formatting for benchmark and test suites

- Updates formatting and indentation in all benchmark and test files for consistency and readability.
- Refactors nested and callback logic, expands coverage to all conditional branches and edge cases.
- Enhances async and error case handling in test scenarios for greater reliability.
- Unifies annotation, chunking, and validation logic across tests to maximize coverage.
- Fixes minor typos and normalizes string formatting throughout benchmark utilities and test assertions.
- Improves maintainability and prepares codebase for easier future expansion and analysis.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6e27f4f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e27f4f11dcd5705587a47e4f687db69697a7a5f)


- 🧪 [test] Add comprehensive unit tests for backend and monitoring services

- Introduces extensive test coverage for backend constants, Electron utilities, database services, monitoring logic, IPC types, window management, and logger utilities
- Validates configuration defaults, type safety, error handling, retry logic, edge cases, and integration scenarios
- Enhances test reliability by mocking dependencies and simulating diverse operational states
- Facilitates future refactoring, performance optimizations, and robust error handling by ensuring core service behaviors are thoroughly tested

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f303228)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f3032280e12102d5798b5e648064bd1d9e5c3333)


- 🧪 [test] Enhance test coverage and add annotation metadata

Improves automated test coverage across core, manager, event, and integration suites.

 - Adds extensive annotation calls to all unit and integration tests to boost metadata, traceability, and future reporting.
 - Extends edge case, error handling, and input validation scenarios to achieve near-complete branch and path coverage.
 - Refactors test structure for consistency; adds missing asynchronous branches and complex object handling.
 - Introduces integration tests for database manager using true service implementations for realistic coverage.
 - Improves documentation and test file metadata for maintainability and automated analysis.

Relates to: test coverage targets and codebase stability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(aa79b82)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/aa79b827354afb09e8c79928dc1d8538ed9c7790)


- 🧪 [test] Achieve 100% backend and shared test coverage

- Adds comprehensive and final-coverage test suites for backend services, shared utilities, validation schemas, and store modules
- Refactors and enhances testing utilities for robust mocking and easier coverage
- Fixes test assertions to match logic edge cases and actual validation outputs
- Improves test stability and reliability by handling error and edge scenarios
- Updates ThemeManager logic for improved type safety and variable application
- Ensures all uncovered lines and branches are exercised, increasing confidence in code correctness

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a741a64)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a741a640559b896fbda7a17a5a1b6723abb26d89)


- 🧪 [test] Add comprehensive tests for coverage and type guards

- Adds thorough unit tests for previously untested hooks, utility functions, type guards, and UI components, greatly increasing coverage across hooks, shared utilities, and monitor form logic
- Refactors and expands test suites for details and navigation tabs, overview, settings, and shared utility modules
- Ensures robust type guard validation for monitor forms, cache key parsing, error cataloging, and log template interpolation
- Simplifies router usage in component tests by mocking navigation providers to avoid dependencies
- Updates ESLint config to enforce import alias usage, inline type imports, and canonical rules for improved consistency and maintainability
- Converts all shared type imports in shared modules to use alias paths, aligning with new ESLint enforcement
- Improves resilience of test assertions and error handling, covering edge and error cases in hooks and utilities

Relates to improved test reliability, maintainability, and type safety.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(57aeb2c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/57aeb2c6884f17c0161c130358d6271dea46368c)


- 🧪 [test] Add comprehensive tests for monitor form data types and refactor theme components

- Introduced a new test file for comprehensive testing of monitor form data types, covering interface compliance, default data creation, type guard functions, and validation scenarios.
- Refactored theme components to use arrow function syntax for consistency and improved readability.
- Updated type exports in `src/types.ts` for better organization and clarity.
- Modified cache utility functions to use `Array<T>` syntax for type definitions.
- Enhanced duration calculation logic with clearer comments and improved readability.
- Improved fallback function for generating monitor type display labels with better regex handling.
- Updated monitor type helper functions to use `Array<T>` for type definitions.
- Refactored monitor validation to ensure type safety and clarity in required fields.
- Cleaned up data validation functions for uptime parsing with improved regex handling.
- Excluded test files from Vite build process for cleaner output. [`(2eb6de9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2eb6de9ac33c245590e02e419861c26e1472fc96)



### 🧹 Chores

- 🧹 [chore] Clarifies ESLint comments and refines Tailwind usage

- Improves clarity of inline ESLint disable comments, explaining rationale and environment compatibility for future maintainers.
- Refactors Tailwind CSS utility classes to use semantic min-width spacing, replacing arbitrary pixel values for better maintainability and design consistency.
- Updates fallback logic and explanatory comments in utility functions to clarify intent and cross-environment support.
- Cleans up unused code and redundant fragments, simplifying React returns.
- Ensures defensive checks and singleton initializations are clearly explained, reducing confusion on lazy loading and environment-specific code paths.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ed64fef)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ed64fef19c79912f21a0d70443263c2179802041)






## [10.2.0] - 2025-08-06


[[e43e3a4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e43e3a40384edf3b60e20733ceaba8afd2227bfe)...
[c6979c8](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c6979c8176ff12c6f5eec3ec7863a5425a9b1319)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/e43e3a40384edf3b60e20733ceaba8afd2227bfe...c6979c8176ff12c6f5eec3ec7863a5425a9b1319))


### ✨ Features

- ✨ [feat] Standardize logging with type-safe templates

- Implements a comprehensive log message templating system to ensure consistent, type-safe logging throughout the codebase.
- Migrates logger calls in core backend modules to use centralized templates, improving maintainability and enabling future localization.
- Refines error catalog for user-facing errors and IPC, clarifying the distinction between error messaging and logging.
- Updates utility and infrastructure code to adopt template-driven logging, reducing repetition and risk of format errors.
- Adds detailed documentation and progress reports to guide and verify the migration strategy.
- Enhances build configuration and type acquisition for improved developer experience and reliability. [`(c6979c8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c6979c8176ff12c6f5eec3ec7863a5425a9b1319)



### 🧹 Chores

- 🧹 [chore] Centralize error handling and cache key utilities

- Unifies error messaging across frontend, backend, and shared code by introducing a structured error catalog with domain-specific constants, improving maintainability and reducing typos.
- Replaces scattered error message usage with consistent imports from a shared error catalog, updating stores, utilities, and tests for type safety and clarity.
- Adds comprehensive cache key generation helpers to standardize caching patterns for configuration, site, monitor, and validation data throughout the app.
- Refactors store actions and utility functions to use new error and cache key systems, improving code readability and future extensibility.
- Updates documentation, configuration files, and test suites to reflect new architecture and error handling conventions. [`(37d0c64)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/37d0c6497e17a8f5802dc65851106d6da9cffe16)


- 🧹 [chore] Remove obsolete reports, update configs, and improve type safety

- Cleans up unused report and coverage files to reduce clutter.
- Updates SonarQube configuration to include shared sources, tests, and TypeScript configs for better code analysis coverage.
- Improves type safety in test assertions by ensuring metadata objects are properly guarded.
- Re-exports validation result types for easier module consumption and consistency.
- Fixes script path for monitor types debugging to support new directory layout.
- Adds clarifying comments and minor safety notes for Electron API usage.

No logic or feature changes; focuses on maintainability, developer experience, and improved static analysis. [`(e43e3a4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e43e3a40384edf3b60e20733ceaba8afd2227bfe)



### 🔧 Build System

- 🔧 [build] Add Secretlint integration and improve schema usage

- Introduces Secretlint and its recommended rule preset for detecting and preventing secrets in code.
- Adds corresponding development dependencies and configuration files for Secretlint and Knip.
- Updates config files to include explicit JSON schema references for better IDE validation and tooling support.
- Refines type definitions for validation metadata to improve type safety and extensibility.
- Enhances overall build tooling reliability and maintainability. [`(bb9431c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bb9431c2d881e8439d099a2627fdf6403023c71e)






## [10.1.0] - 2025-08-05


[[7c388d3](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7c388d3c5e93e8a7825578d70017e9577e26d235)...
[85d0a94](https://github.com/Nick2bad4u/Uptime-Watcher/commit/85d0a94a6be56fa9424e8686071108a44131bdff)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/7c388d3c5e93e8a7825578d70017e9577e26d235...85d0a94a6be56fa9424e8686071108a44131bdff))


### ✨ Features

- ✨ [feat] Unifies type safety and validation across app

- Refactors validation system to use a single, unified set of type-safe interfaces for all config, monitor, and theme validation, eliminating duplicate and backward-compatible types.
 - Replaces broad `unknown` and `Record<string, unknown>` types with explicit union types for config and cache values, improving compile-time type safety and code maintainability.
 - Migrates all monitor type logic, validation, and field configs to a centralized Zustand store for better state management and consistent IPC usage.
 - Updates all related code to use the new store and unified validation results, ensuring consistent naming (`success` vs `isValid`) and removing all inline imports for clarity.
 - Improves developer experience by cleaning up interface inheritance, enforcing project-wide import style, and providing comprehensive documentation and lessons learned.
 - Adds and updates docs to reflect the new robust type safety architecture and future recommendations.
Fixes type consistency and maintainability issues identified in previous reviews. [`(26bc213)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26bc213d25be778056e3e1ddc0b257c4d4e5afb7)


- ✨ [feat] Add type-safe config types and unify form/chart/theme handling

- Introduces comprehensive type definitions for chart, form, monitor, and theme configurations to improve type safety and maintainability across frontend and backend.
- Refactors mapping functions, data access, and validation logic to leverage new types, reducing reliance on generic records and unsafe property access.
- Adds a reusable hook for delayed button loading states, streamlining UI feedback and eliminating duplicate logic.
- Unifies type guards and default value handling for monitor forms, chart configs, and themes, enabling future extensibility and consistent validation.
- Cleans up legacy ESLint disables and removes unsafe object injection comments, reflecting improved code safety.
- Improves error logging clarity and standardizes output messaging for better debugging. [`(ddcf6ca)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ddcf6caba0eb43cfcd8b30de21e48d69088ccb29)


- ✨ [feat] Improve form validation and modal accessibility

- Adds stricter runtime validation for monitor configuration fields to prevent invalid user input and improve error feedback.
- Memoizes field change handlers in forms to optimize rendering and reduce unnecessary updates.
- Refactors modal escape key handling to use a global event listener, enhancing accessibility and reliability.
- Prevents unnecessary re-renders of site monitoring controls by memoizing handler functions.

These changes enhance usability, robustness, and performance of UI interactions. [`(b2d4620)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b2d4620cdbb018881f7d405e4532d9628ad03ef9)



### 🛠️ Bug Fixes

- 🛠️ [fix] Handle undefined monitor operations and improve URL validation

- Prevents errors when monitor active operations are undefined by defaulting to empty arrays during add/remove actions.
- Updates URL validation logic to allow localhost URLs by adjusting default options, improving compatibility for local development. [`(7c388d3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7c388d3c5e93e8a7825578d70017e9577e26d235)



### 🚜 Refactor

- 🚜 [refactor] Modularize validation and logic helpers across app

- Extracts and composes helper functions for monitor, IPC, theme, form, and status validation to improve code readability and maintainability.
- Reduces code duplication and function complexity, especially for form validation, monitor counting, and theme merging.
- Updates type and validation logic to support the "ping" monitor type throughout the codebase.
- Enhances performance by using memoization for computed props and counts, minimizing unnecessary re-renders.
- Improves type safety and error messaging for validation utilities, ensuring clearer feedback and stricter runtime checks. [`(ae20777)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ae207770e589719c4eb0ef64fadb55c473dafcec)



### 📝 Documentation

- 📝 [docs] Improve formatting, clarity, and consistency across docs and prompts

- Refines Markdown formatting and indentation for better readability in documentation, guides, and review prompts
 - Adds missing line breaks and whitespace for clarity, making lists and code blocks easier to parse
 - Updates tables, example code, and explanatory text to follow consistent standards throughout guides
 - Enhances accessibility and maintainability by improving structure and separating independent ideas
 - Cleans up test and config files for consistent code style, aiding future development and review [`(26f8d12)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26f8d126f1e0e654d7ade92187e9e6891219b475)



### 🧪 Testing

- 🧪 [test] Refactors test suite for monitor/site stores and UI

- Updates test mocks to use electronAPI integration for monitor types, sites, and system actions, improving isolation and accuracy.
- Simplifies and corrects test setup for monitor type and monitor validation hooks, supporting new backend store integration.
- Refactors dynamic monitor field tests and site operations tests to directly mock electronAPI calls and store logic, replacing older service-layer mocks.
- Improves error handling and loading state assertions in tests to match new store-driven state.
- Cleans up and modernizes test coverage for UI actions, error handling, and chart configuration utilities.
- Adjusts field and config validation logic in tests for consistency with updated backend and store responses. [`(85d0a94)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/85d0a94a6be56fa9424e8686071108a44131bdff)


- 🧪 [test] Add comprehensive unit tests for core UI and backend logic

- Improves test coverage for components, forms, hooks, database types, constants, and utilities, targeting previously untested or under-tested files
- Validates all edge cases, error paths, integration points, and type contracts to ensure reliability and prevent regressions
- Refines monitor validation logic for ping types and BigInt serialization, addressing coverage gaps
- Provides mock setups for external dependencies to enable isolated and deterministic testing
- Enables more robust CI and future refactoring by ensuring critical logic is thoroughly exercised [`(5400887)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5400887f165731a8338c737ec3cda8450e673cb0)


- 🧪 [test] Add and reorganize backend coverage tests for shared validation and conversions

Adds new backend test suites targeting shared utilities and types to ensure comprehensive coverage and accurate reporting. Reorganizes tests to electron/test for backend coverage tracking, introduces more exhaustive scenarios for validation logic, and skips fragile or redundant assertions to align with backend-only execution.

Improves maintainability and reliability of backend validation and conversion utilities, safeguarding shared code correctness across both frontend and backend. [`(c51d489)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c51d489f277ba88ade2ac7dc5d068bea77f895f1)


- 🧪 [test] Add comprehensive unit tests for conversions and validation

- Introduces thorough test suites for conversion utilities and validation logic to ensure edge cases and default behaviors are covered.
- Improves reliability and future maintainability by formally verifying input handling and error scenarios.
- Updates and clarifies existing tests to reflect conditional rendering and normalization behaviors. [`(84dc389)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/84dc3897507d446f7dd76b922b6a8df8905a632e)



### 🧹 Chores

- 🧹 [chore] Move validation test file to correct directory

- Organizes test files by relocating validation tests to the standard test directory.
- Improves project structure and test discoverability. [`(2a9ac7f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a9ac7fdd4d4b21b8abdca869acdcdf1d26e4a41)






## [9.8.0] - 2025-08-02


[[56b26f4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/56b26f42f7751ba1251233ee6f7ec114615a57f0)...
[b890faf](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b890fafaebecc846c6718eb9c1f0ff788cdba316)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/56b26f42f7751ba1251233ee6f7ec114615a57f0...b890fafaebecc846c6718eb9c1f0ff788cdba316))


### ✨ Features

- ✨ [feat] Add operation-correlated monitoring for race safety

- Introduces an enhanced monitoring subsystem with operation correlation to prevent race conditions during monitor checks and lifecycle changes.
- Adds new service modules for monitor checkers, operation registries, status update services, and timeout management, integrating them into the main manager and dependency injection flow.
- Refactors validation logic across backend and frontend to use centralized, well-tested utilities for consistent string, URL, and identifier checks.
- Updates monitor schema and shared types to track active operations, ensuring safer concurrent state transitions.
- Improves site cache refresh logic to guarantee UI and scheduler reflect the latest monitor state after lifecycle changes.
- Marks legacy monitoring utilities as fallback-only and documents preferred usage of the enhanced system. [`(56b26f4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/56b26f42f7751ba1251233ee6f7ec114615a57f0)



### 🚜 Refactor

- 🚜 [refactor] Standardize import order and improve validator utils

- Reorders import statements for consistency and readability across modules.
- Refactors shared validation utilities to improve documentation, rearrange functions for logical grouping, and enhance maintainability.
- Moves the array identifier validator above the URL validator to better reflect usage frequency and intuitive grouping.
- Updates formatting for inline comments and function documentation to align with project standards.
- No logic changes to core application behavior. [`(2be161b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2be161bf4bc9f3f0f7cd7e4e56141b8469ae7abd)



### 🧪 Testing

- 🧪 [test] Improve validation test coverage and monitor lifecycle checks

- Expands unit tests for validation utilities, covering string, URL, FQDN, identifier, integer, and numeric validation scenarios to ensure reliability.
- Integrates stricter usage of safe integer parsing in service and utility tests to catch edge cases and enforce bounds.
- Adds and verifies active operation lifecycle management for monitor objects and repositories, reducing risk of concurrency bugs.
- Refactors service container tests to enforce dependency initialization order, improving coverage of complex service interactions and preventing circular reference issues.
- Strengthens monitor and site operation tests with explicit checks for new properties and normalization, supporting future extensibility. [`(b890faf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b890fafaebecc846c6718eb9c1f0ff788cdba316)






## [9.7.0] - 2025-07-31


[[46bbcf7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/46bbcf7c05ca47f4eb98d35723fe116fbd3ef3f2)...
[cd71c5f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd71c5fb522fee53f2cec54f13fcdbc80c330ef1)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/46bbcf7c05ca47f4eb98d35723fe116fbd3ef3f2...cd71c5fb522fee53f2cec54f13fcdbc80c330ef1))


### ✨ Features

- ✨ [feat] Add Ping monitor type with validation and UI support

- Introduces a cross-platform Ping monitor, enabling network reachability checks via ICMP ping with retry, timeout, and detailed result reporting.
- Integrates Ping monitor into backend service registry, type definitions, validation schemas, and migration/versioning system.
- Updates form types, validation logic, and UI scaffolding to support adding and configuring Ping monitors alongside existing types.
- Refactors shared schema utilities and type guards to dynamically accommodate the new monitor type for robust extensibility. [`(afd7cb4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/afd7cb4621e8273f5a320dc5cefa25b1590796d7)


- ✨ [feat] Add type-safe theme merging and settings reset

- Adds deep theme merging utility to centralize and simplify custom theme overrides, addressing code duplication and improving maintainability.
- Implements backend-synchronized settings reset, ensuring all application settings can be restored to defaults via IPC and the database, with improved frontend synchronization.
- Refactors code to use type-safe property access for database rows, form data, and Chart.js configs, reducing index signature errors and enhancing reliability.
- Introduces configuration-driven approaches for cache clearing, monitor display identifiers, and monitor type labels for easier extensibility.
- Updates docs and tests to reflect new features and API contracts.
- Relates to duplicate code and maintainability recommendations in the provided review. [`(8eae8ed)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8eae8ed0e0c2fb33d2e9497ed2039642a5b107bd)


- ✨ [feat] Improve theme, monitoring, and analytics robustness

- 📝 [docs] Enhances code documentation for theme system, monitoring, IPC, stores, hooks, and utilities to clarify interfaces, rationale, and advanced usage.
- 🚜 [refactor] Refactors theme manager, monitoring services, stores, and hooks for better type safety, dynamic theme management, and deep merge logic.
- 🛠️ [fix] Fixes color/description alignment, fallback logic, and runtime validation for monitor types and analytics calculations.
- ✨ [feat] Adds robust validation, error handling, and dynamic cache management across UI, monitoring, and backend synchronization.
- 🎨 [style] Improves CSS variable naming consistency and theme-aware style hooks.
- ⚡ [perf] Optimizes cache and state management for incremental updates and large datasets.
- 🧹 [chore] Consolidates duplicate logic, improves code organization, and increases maintainability across the codebase.
- Relates to improved accessibility, reliability, and extensibility for advanced monitoring scenarios. [`(62ebb4f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/62ebb4f5a8164cd104b529b921cf051265aeb2cb)



### 🚜 Refactor

- 🚜 [refactor] Improve state logic, error handling, and code clarity

- Refactors state updates in UI components to avoid direct setState calls in effects, reducing unnecessary renders and improving React best practices
- Replaces spread syntax for array copying with Array.from for consistency, clarity, and future-proofing
- Renames and standardizes private/protected variable naming for singleton services, enhancing code readability and maintainability
- Adds and improves error handling in backend service initializations and IPC calls to provide clearer feedback and more robust fail-safes
- Refactors frontend logic to better track user-edited fields versus derived or default state for site and monitor details, ensuring correct UI behavior
- Improves fallback behavior and logging when loading monitor types or settings fails, making user experience more resilient
- Adjusts effect and cleanup logic in theme and overlay hooks to prevent memory leaks and infinite render loops
- Updates UI dropdown and form option calculations for accuracy and user-friendliness
- Moves and renames component files for clearer project structure and easier maintenance
- Updates chart config service API for clearer intent and usage
- Expands array-of-strings formatting for font families and status options to improve code readability
- Refactors code style to use stable callbacks, default objects, and de-structuring for safer property management

Overall, these changes reduce subtle UI bugs, improve maintainability, and make error cases more explicit. [`(39bcee8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/39bcee8d6e9eb0e5921baed5302a9f16b6d746cb)


- 🚜 [refactor] Streamline backend status updates & code quality

- Refactors status update handling for sites and monitors to enable more efficient, incremental updates and minimize unnecessary full syncs
- Improves code quality and maintainability by modularizing validation logic and reducing cyclomatic complexity in several areas
- Updates IPC logging to reduce output for high-frequency operations and adjusts error handling for robustness
- Unifies manager event types, improves schema handling, and tidies type usage across repositories
- Harden CI workflow, enhance commit documentation, and introduce new logging CLI commands for better development and production diagnostics
- Fixes UI details in history tab and metric rounding in tests for consistency

Relates to ongoing code quality remediation and performance improvements [`(5a9ec9f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a9ec9fc2a14b7f39f98fc5a8381821c554931b2)



### 📝 Documentation

- 📝 [docs] Add Node-Sqlite3 and WASM doc sync scripts and imported docs

- Introduces new scripts for automated downloading and cleaning of documentation for Node-Sqlite3 and its WASM variant, enabling streamlined doc updates.
- Imports key documentation files for Node-Sqlite3, including API, binaries, caching, debugging, and control flow guides, along with tracking logs and content hashes for doc integrity.
- Establishes a consistent structure for documentation management and future updates. [`(1337cdc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1337cdce8177788ce93ad5ae596c6390a9aa43bb)


- 📝 [docs] Enhance and standardize code documentation across codebase

- Improves and expands JSDoc/TSDoc comments for nearly all modules, interfaces, types, and exported functions to clarify usage, parameters, return values, error behavior, and intended audience (public/internal)
- Brings consistency to doc formatting and structure, ensuring all code entities are well-described and discoverable, with explicit remarks and usage examples where appropriate
- Updates documentation to match actual behavior, describe design rationale, and highlight extensibility, improving onboarding and maintainability
- Removes duplicate or redundant comments, restructures for clarity, and corrects outdated or misleading explanations
- Adds missing public/internal annotations, improves type parameter explanations, and ensures referential links (e.g., {@link ...}) are accurate
- Does not alter runtime behavior or business logic; focuses solely on developer experience and API clarity

Relates to ongoing documentation and maintainability efforts. [`(133b721)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/133b72197db9192c99df6ac44caf89494a5f8bb2)


- 📝 [docs] Standardize TSDoc and clarify type safety, error handling, and UI docs

- Refines TSDoc comments across backend, shared, and frontend modules to enforce project documentation standards and improve clarity for maintainers and onboarding.
- Enhances documentation on type safety, runtime validation, and error handling throughout form components and domain types, aligning with stricter TypeScript usage.
- Adds comprehensive remarks, examples, and parameter details, especially for component props, event payloads, and exported APIs.
- Clarifies memoization strategies and prop stability requirements for React components to support performance optimizations.
- Documents UI constraints, ARIA accessibility, and CSS variable usage for consistency and maintainability.
- Fixes ambiguous or missing comments on domain models, utility functions, and system-level APIs, aiding future refactoring and debugging.
Relates to internal documentation and code quality improvement tasks. [`(46bbcf7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/46bbcf7c05ca47f4eb98d35723fe116fbd3ef3f2)



### 🎨 Styling

- 🎨 [style] Expand multiline arrays and objects for readability

- Updates formatting across configuration and test files to expand array and object literals over multiple lines.
- Improves code readability and consistency, especially for longer lists and argument arrays in both config and test cases.
- No logic or functionality changes; focuses solely on stylistic improvements. [`(bfb8351)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bfb83515aa7e21ae2be7cd0a469eacbc4f116670)



### 🧪 Testing

- 🧪 [test] Expand and improve frontend test coverage

- Adds comprehensive and additional tests for error boundary, error fallback, theme hooks, settings store, and site status utilities
- Refactors test assertions for property access and handler checks to enhance reliability and maintainability
- Updates tests to cover more edge cases, asynchronous behavior, accessibility, and functional re-export validation
- Improves test clarity for type usage and interaction behaviors, supporting future refactors and feature additions [`(cd71c5f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd71c5fb522fee53f2cec54f13fcdbc80c330ef1)


- 🧪 [test] Improve test coverage and ensure consistent formatting

- Increases branch and edge case coverage across multiple test suites, targeting previously uncovered code paths, error handling, and integration scenarios.
- Applies consistent formatting and style to test code, improving readability and maintainability.
- Refactors array, object, and function declarations for brevity and clarity in test files.
- Streamlines test case definitions and input data, reducing redundancy and improving test execution speed.
- Updates scripts for documentation downloading to enhance robustness, path resolution, and output handling.
- Does not modify production code logic; focuses on testing, formatting, and supporting build/test scripts. [`(916b337)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/916b33702fcbecf98dceacaee285c13bd69b25be)


- 🧪 [test] Achieve 98%+ branch coverage across core modules

- Adds extensive targeted and comprehensive unit tests for Electron, shared, and frontend code to boost branch coverage above 98%
- Covers error handling, switch defaults, edge cases, utility functions, store logic, theme hooks, and component render branches
- Refactors and replaces insufficient or disabled tests with robust, focused coverage
- Fixes minor inconsistencies in existing tests and aligns test expectations with actual UI/component behavior
- Ensures proper mocking, error scenarios, and integration coverage for critical store actions and system events
- Improves test reliability, maintainability, and paves the way for confident future refactors [`(a3c541d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a3c541d9c3c85a329c71b1ed0ff79f14440179af)


- 🧪 [test] Add branch and edge case tests to achieve 98%+ coverage

- Adds comprehensive and branch coverage tests for validation logic, type guards, object and JSON safety utilities, string conversion, and theme/UI components
- Introduces targeted tests for previously uncovered lines, error handling, and edge cases in utility, theme, and validation modules
- Removes redundant or obsolete test files to streamline the test suite
- Improves overall test reliability and ensures that complex error paths and SSR scenarios are exercised
- Enables more robust future refactoring and increases confidence in code quality [`(e225010)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e225010a7e31c859d896010a447d9bf6c915c5c0)


- 🧪 [test] Add comprehensive and edge case tests across codebase

- Expands test coverage with new comprehensive suites for configuration, validation, lifecycle utilities, UI helpers, and React components
- Refactors and enhances existing tests for stricter typing, branch coverage, and edge case handling
- Updates test mocks and type imports for accuracy and maintainability
- Improves test clarity, correctness, and resilience to code changes
- Supports future codebase stability and confidence in core logic under varied scenarios [`(6195be8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6195be8a11be30e41497c789d80b5a8582ec0a50)


- 🧪 [test] Add comprehensive unit tests for store, theme, and status utilities

- Introduces extensive unit tests to achieve 90%+ branch coverage for store actions, site status utilities, and theme management logic
- Adds edge case and error handling tests to ensure robust coverage for CRUD operations, monitoring, theme application, and sync event handling
- Updates test configuration for improved code coverage accuracy and reporting, including full source inclusion and better concurrency handling
- Improves maintainability and future-proofing by validating edge scenarios and integration points across store and UI themes [`(cbae68c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cbae68cd02ca86b31412f12887c8b3cb6ee168bf)


- 🧪 [test] Remove unused monitor types test file

- Cleans up obsolete or unnecessary unit test to reduce clutter
- Improves maintainability by deleting a redundant test file [`(0b3e373)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0b3e373a1fd70f132fd3813e8d2ada124e85720a)


- 🧪 [test] Add and update unit tests, remove legacy and obsolete tests

- Introduces new and improved test coverage for backend utilities, cache logic, logger, and monitor lifecycle.
- Removes outdated, redundant, or overly broad frontend and backend test suites for improved maintainability and clarity.
- Refines test logic to accommodate recent code changes and stricter validation; improves reliability of UUID and site analytics tests.
- Adds shared monitor type UI interface definitions to support future extensibility.
- Updates mocks and setup for better isolation and cross-environment compatibility.
- Refactors tests to ensure consistency with current codebase and corrects expectation mismatches. [`(dd17a16)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dd17a16e6257cd6b9b8c73f2319ad6b80c275add)






## [8.4.0] - 2025-07-24


[[3e03a70](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e03a70f698ddf642108c2d59bb904f821900f5c)...
[04f85fb](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04f85fbb657e59727b6ea017e039fdec19db2873)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/3e03a70f698ddf642108c2d59bb904f821900f5c...04f85fbb657e59727b6ea017e039fdec19db2873))


### ✨ Features

- ✨ [feat] Improve error handling and docs for core services

- Enhances notifications, site, and updater services with robust error checks, detailed logging, and atomic config updates to ensure reliability and thread safety.
- Refactors monitor type definitions for stricter type safety and modernizes UUID generation by relying on crypto.randomUUID.
- Removes fallback and legacy utility functions for cleaner codebase and updates documentation to clarify concurrency, error handling, and usage patterns.
- Simplifies operational ID generation by dropping outdated compatibility logic.

Relates to code maintainability and robustness improvements. [`(88a640a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88a640a9b44d7ed879b54cfb7c2b100a3702c8d6)


- ✨ [feat] Expand linting, validation, and type safety across codebase

- Adds multiple new ESLint plugins and rules for stricter code quality, including Tailwind, security, math, dependency, and comment style plugins
- Expands linting to shared TypeScript files and enhances rule coverage for both frontend and backend
- Refactors and improves type definitions for site and monitor status, ensuring consistent status handling and more robust type guards
- Improves and reorders utility functions for error handling, environment detection, JSON safety, and object operations for clarity and reliability
- Updates validation logic and schemas to enhance error reporting, field validation, and Zod-based type checking for monitors and sites
- Adjusts configuration files to support new linter plugins and CSS file inclusion in TypeScript and testing configs

These changes aim to enforce higher code quality, better type safety, and easier maintainability across shared and platform-specific code. [`(59b0b08)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/59b0b08fbc9a4d97ebf837d3ba2ee7155d7cb3ac)


- ✨ [feat] Enforce strict type safety for IPC event payloads

- Replaces all generic and unknown IPC event callback types with specific, strongly-typed interfaces across frontend, backend, and shared types
- Introduces dedicated event payload definitions for all IPC communication, improving IDE support, auto-completion, and compile-time error detection
- Refactors related validation, monitor field, and form data structures to eliminate generic Record patterns in favor of explicit interfaces
- Updates ESLint configs to enforce strict type-checked rules, further reducing untyped or loosely-typed code
- Ensures all logger and error handling usages are structured and type-safe, replacing console statements in production code
- Adds extensive documentation and audit reports to summarize type safety improvements and consistency audits

Relates to type safety and maintainability enhancement objectives [`(2a91885)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a91885a23a8fd6dca42b275299ab60e70227b02)


- ✨ [feat] Add type-safe utilities, env abstraction, and ESLint tuning

- Introduces comprehensive type guard, object, JSON, and conversion utilities for enhanced type safety throughout the codebase
- Refactors environment detection to use shared, testable abstractions, replacing raw environment variable access and improving consistency
- Updates ESLint configuration to enable nuanced Node.js rules, disables false positives, and adds no-only-tests enforcement
- Refactors middleware and service logic for explicit callback returns, removes unnecessary ignores, and tidies up logging and error handling
- Adds cache invalidation event support to frontend API typings for increased reliability
- Upgrades dependencies and enforces Node.js >=23 in the engine field
- Documents analysis and type safety opportunities to guide future improvements

Relates to Node.js best practices and maintainability improvements [`(67e9034)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/67e9034b5526d3eb8c819971d036818f036e5e39)


- Add shared types and site status utilities [`(3e03a70)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e03a70f698ddf642108c2d59bb904f821900f5c)



### 🛠️ Bug Fixes

- 🛠️ [fix] Unifies type, error, cache, and validation patterns

- Resolves critical architectural inconsistencies by consolidating type definitions, removing duplicated interfaces, and enforcing single-source imports for shared types
- Standardizes error handling throughout the codebase with a shared utility, replacing mixed patterns and direct error casting, improving logging and maintainability
- Centralizes fallback values and privacy-protecting truncation logic, ensuring consistent handling of null, undefined, and sensitive data
- Unifies frontend and backend validation logic with shared Zod schemas, enabling robust, real-time validation and field-level checks
- Refactors caching to use a single TypedCache system for monitor types and UI helpers, reducing redundancy and improving performance
- Updates documentation and audit reports to reflect the resolved inconsistencies and consolidation achievements
- Fixes all remaining logger usage and privacy patterns, and replaces direct console usage with structured logging
- Improves developer experience, maintainability, and reliability of the codebase by enforcing clear architectural standards

Relates to consistency audit and consolidation reports [`(7eb77b2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7eb77b2d4dacb3aed9d57ebc532f11780ceda875)


- 🛠️ [fix] Unifies core type definitions and import patterns

- Resolves critical type duplication by centralizing all core domain types in a single shared location and updating the codebase to import from it consistently
- Eliminates maintenance burden and potential runtime bugs caused by divergent Monitor interfaces and status types across frontend and backend
- Standardizes error message usage and improves type safety for status updates and historical data
- Enhances maintainability, developer experience, and reliability by enforcing a single source of truth and consistent import strategy
- Fixes all identified architectural inconsistencies and documents the resolution with detailed audit and implementation summaries [`(75cda5e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/75cda5e94b67b2d25cb0f5c3588f9b9100dc6192)


- 🛠️ [fix] Improve string conversion for database mapping

- Introduces a safe string conversion utility to handle complex objects, preventing '[object Object]' serialization issues flagged by SonarCloud.
- Updates database mapping logic to use the new utility, ensuring consistent and reliable string representations for settings and site data.
- Removes redundant barrel export documentation and refines code quality standards for clarity.
- Splits cognitive complexity linting scripts by project area for more granular analysis. [`(6b61050)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6b610503cfb57cc65aad33bbf31dd9e638dc6ba2)



### 🚜 Refactor

- 🚜 [refactor] Restructure shared types and improve error handling

- Refactors shared type imports to separate event types from domain types, reducing circular dependencies and clarifying module boundaries.
- Centralizes file download error handling into dedicated helper functions for clearer logic and easier maintenance.
- Updates environment and object utility functions to improve type safety, add explanatory comments, and handle process checks more robustly.
- Replaces console logging in store utilities with a unified logger for consistent debug output.
- Adds inline comments to explain deviations from linting rules and clarify shared utility constraints. [`(71b6827)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/71b6827de0a1b95a35c76a7ba422833e7b819398)


- 🚜 [refactor] Decouples repositories, adds SiteService, unifies validation

- Refactors repository layer to remove cross-repository dependencies, strictly enforcing single responsibility and clean architectural boundaries
- Introduces a dedicated SiteService for complex site operations and coordination across multiple repositories
- Updates all relevant managers, utility modules, and the service container to use the new service layer
- Replaces duplicated and inconsistent monitor validation logic with centralized, shared validation utilities for type safety and consistency
- Documents standardized transaction patterns and architectural improvements
- Improves maintainability, testability, and clarity of data access and business logic separation
- Fixes critical architectural violation identified in the audit [`(2958ce0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2958ce0982c55dd537bff06b17c8b8e3fe7ba528)


- 🚜 [refactor] Modularize orchestrator event handlers and improve string conversion

- Refactors orchestrator event handler setup into focused, modular methods for database, site, monitoring, and event forwarding logic, clarifying architecture and initialization flow.
- Enhances string conversion utility to avoid '[object Object]' outputs, provide descriptive fallbacks for complex, circular, function, and symbol types, and guarantee meaningful string representations for all values.
- Updates documentation and settings for consistency, readability, and maintainability. [`(05fa9f4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/05fa9f49d11c4e34ee32f3eb135f4f60d19deab0)


- 🚜 [refactor] Streamline service architecture and event APIs

- Refactors service container and orchestration logic to improve dependency management, initialization order, and resource cleanup for better maintainability and testability.
- Enhances event bus diagnostics, middleware, and type safety for more robust cross-service communication.
- Reorganizes site, monitor, and database repositories for clearer separation of concerns and atomic operations, including bulk actions and transaction boundaries.
- Refines type guard, validation, and migration logic to support extensible monitor types and forward-compatible schema evolution.
- Updates and clarifies event IPC APIs for improved frontend/backend integration and future-proofing.
- Fixes minor issues with field ordering, code style, and documentation for consistency and readability. [`(874aa5b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/874aa5bf220f8e7bad842428a4791a4921b44692)



### 📝 Documentation

- 📝 [docs] Address AI review feedback and improve type safety

- 📝 Updates and completes TSDoc documentation across shared, backend, and frontend utilities, including overloads, @throws, return values, and internal APIs for full API clarity and maintainability
 - 📝 Documents rationale behind environment fallback strategies, internal API boundaries, and sentinel values for better developer guidance
 - 🛠️ Fixes event naming and payload consistency in operational hooks to support explicit operation phases and enhance event-driven clarity
 - 🛠️ Adds robust crypto fallback for UUID generation to avoid runtime errors in diverse environments
 - 🛠️ Aligns function naming, return types, and usage patterns for validation and monitor utilities to match TypeScript conventions and prevent confusion
 - 🚜 Refactors monitor status handling and internal APIs to use shared constants and safer type guards, improving runtime safety and code consistency
 - 🛠️ Adds memoization and accessibility improvements in React entry points, and centralizes UI strings for future localization
 - 📝 Clarifies error handling flows in monitoring and site writer services, ensuring robust logging for debugging and operational resilience
 - 📝 Upgrades dependencies for zod, vite, and TypeScript native preview to maintain compatibility and leverage latest features
 - 🧹 Cleans up redundant comments, aligns inline documentation with standards, and removes dead or misleading code and comments from multiple modules

Relates to internal AI code review and documentation initiative. [`(04f85fb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04f85fbb657e59727b6ea017e039fdec19db2873)


- 📝 [docs] Update ESLint analysis and improve shared utils docs

- Expands and clarifies ESLint Plugin N analysis, detailing violation types, recommendations, and migration plan for environment detection and async patterns
- Improves documentation and consistency in shared utility files, enhancing readability and type safety explanations
- Standardizes code formatting in config and utility modules for better maintainability

Focuses on code quality, maintainability, and clear guidance for future rule configuration and refactoring. [`(70c3eca)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/70c3eca3ed5c59de24a30c2d7fb4d2110890f588)


- 📝 [docs] Standardizes formatting and improves clarity in audit docs

- Unifies markdown formatting, indentation, and code block consistency across all audit and summary documentation.
- Clarifies explanations, table layouts, and validation code for improved readability.
- Corrects minor grammar and style inconsistencies, ensuring clear separation of technical points.
- Facilitates easier future audits and onboarding with more structured documentation. [`(c720921)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c72092168060e79e003249cb7a5edea855c36e27)


- 📝 [docs] Standardizes architecture, state, and documentation guidelines

- Updates documentation to enforce consistent architectural patterns for repositories, services, managers, and orchestrators
- Establishes clear component state management rules, including when to use custom hooks versus direct state and backend-first validation
- Refines store architecture guidelines with modular versus monolithic patterns based on complexity, error handling requirements, and naming conventions
- Formalizes TSDoc documentation standards with progressive requirements and detailed examples for functions, hooks, and interfaces
- Cleans up formatting, table structures, and code samples for improved readability
- Removes extraneous whitespace and normalizes array/object formatting in configuration files
- Improves overall developer experience and code maintainability by eliminating ambiguity and inconsistencies in process and documentation [`(92c9dad)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/92c9dad6e1ac57753fc0b531521bd6001f635371)


- 📝 [docs] Standardizes architecture, state, and doc guidelines

- Introduces comprehensive documentation covering state management, store architecture, and TSDoc patterns to resolve major inconsistencies and clarify best practices.
- Audits and fully aligns error handling across all stores with centralized error store integration, replacing inconsistent patterns and empty handlers.
- Refactors status type definitions for consistency by unifying monitor and site status types and associated type guards in shared modules.
- Updates lint configuration to disable specific formatting rules for better compatibility.
- Improves maintainability and developer onboarding by establishing clear migration paths, decision trees, and documentation checklists.
- Fixes # (refer to related tracking/issue if applicable). [`(edf8c3c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/edf8c3cb26351b1df10840ac58e76c950c231406)



### 🧹 Chores

- 🧹 [chore] Standardize prompt file naming and add review template

- Renames prompt files to use consistent kebab-case formatting for improved organization and easier discovery.
- Adds a new template for reviewing low confidence AI claims, outlining a process for validation and fixes during development. [`(a59f910)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a59f91053979ce8fee322c8709dbf91bc5ec15a5)






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/Uptime-Watcher/graphs/contributors) for their hard work!
## License
This project is licensed under the [UnLicense](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/LICENSE)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
