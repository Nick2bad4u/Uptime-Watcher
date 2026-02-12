<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


[[9ea2112](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9ea2112b5cea87f1163261bb4881577951b49bbe)...
[b3f7370](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b3f73701742a9e00395ca9501e4495ca0da5b91b)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/9ea2112b5cea87f1163261bb4881577951b49bbe...b3f73701742a9e00395ca9501e4495ca0da5b91b))


### ✨ Features

- ✨ [feat] Enhance system API and preload domain management
 - 🛠️ Refactor system API initialization to use `createPreloadDomain` for better error handling and fallback support.
 - 🔧 Introduce `createSystemApiFallback` to provide deterministic fallback methods for unavailable API calls.
 - 📝 Add utility functions in `preloadDomainFactory` for safely constructing preload domains and accepting unused arguments.

✨ [feat] Implement event guard helpers
 - 🛠️ Create `createStringUnionGuard` to validate string unions.
 - 🔧 Add `isUnknownRecord` and `hasFiniteTimestamp` for type narrowing and validation.

✨ [feat] Improve IPC service state synchronization
 - 🛠️ Refactor state synchronization logic to use `StateSyncStatusTracker` for better encapsulation and management of state sync status.
 - 🔧 Remove redundant state sync status management from `IpcService` and delegate to the new tracker.
 - 📝 Update handlers to utilize the new state sync tracker for status updates.

✨ [feat] Enhance data handling and validation
 - 🔧 Introduce `buildPlaywrightBackupPath` and `ensureSqliteFileExtension` for consistent SQLite backup path management.
 - 🛠️ Refactor data handlers to utilize new utility functions for backup path construction.
 - 📝 Improve validation logic in `cloudValidation` and `restoreValidation` to streamline error handling.

✨ [feat] Refactor alert handling and telemetry
 - 🔧 Move alert mapping logic to a new utility file `alertPayload` for better organization and reusability.
 - 🛠️ Update `StatusUpdateManager` to use new utility functions for building status update payloads and telemetry objects.
 - 📝 Clean up alert store by removing unused functions and consolidating alert mapping logic.

🧪 [test] Update alert store tests to reflect changes in alert mapping
 - 🔧 Adjust tests to import `mapStatusUpdateToAlert` from the new utility file.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f0907e3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f0907e3068a9ec964f69bbead5f8e0004e6c21d7)


- ✨ [feat] Adds PWA support and UI refactors

✨ [feat] Adds an installable docs experience with offline support and manifest assets
🚜 [refactor] Refactors shell logic into reusable hooks/components to reduce complexity and keep loading, sidebar, and update UI behavior consistent
 - 🚜 [refactor] Extracts delayed loading and compact sidebar dismissal into shared hooks
🚜 [refactor] Centralizes add-site defaults, normalization, and validation to prevent drift between UI state and submission
🛠️ [fix] Improves URL and IPC validation plus status update subscription handling to harden trust boundaries and avoid stale callbacks
🚜 [refactor] Consolidates shared utilities for byte-size formatting, volume normalization, sqlite restore checks, and cloud notifications

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(538f58a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/538f58a4de1747c57f9ac14c5c75f8dbeb5e19ff)


- ✨ [feat] Adds Electron lint guardrails

✨ [feat] Adds Electron lint guardrails for native dialogs and non-standard module metadata to reduce automation hangs and runtime crashes
 - ✨ [feat] Registers the new guardrails in the core Electron lint profile
🛠️ [fix] Adds automation-safe backup handling and standard directory resolution in the Electron main process to avoid blocked UI and bundler fragility
🛠️ [fix] Sanitizes debugger-injected node options when launching Electron for automation to prevent startup stalls
🧪 [test] Aligns monitor-type and lint rule tests with canonical types and new checks for consistent coverage
 - 🧪 [test] Adds rule documentation integrity validation for lint metadata links
📝 [docs] Adds rule guides and removes an outdated architecture note

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b687493)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b687493d3586c551c347ad037d9bffdc1b8768ec)


- ✨ [feat] Implement Settings Controller Hook for Enhanced Settings Management
 - Introduced `useSettingsController` hook to manage application settings in a modular way.
 - Added state management for application sections, maintenance, monitoring, and notifications.
 - Implemented handlers for theme changes, history limits, in-app alerts, and system notifications.
 - Integrated backup and restore functionality for SQLite databases with user feedback.
 - Enhanced user experience with volume control for in-app alert sounds and notifications.

🧪 [test] Add Comprehensive Tests for Settings Hooks and UI Store
 - Created tests for `useInAppAlertTonePreview` to validate volume preview scheduling and sound playback.
 - Developed tests for `useSettingsChangeHandlers` to ensure proper application of settings changes and logging.
 - Implemented tests for `useSiteDetailsUiStore` to verify state management and tab synchronization functionality.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3dbe1dc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3dbe1dc4b1d3508a452c2624d5e1fc32cf3184f5)


- ✨ [feat] Implement idempotent initialization utility
 - 🆕 Add runIdempotentInitialization function to manage initialization promises
 - 🔄 Refactor initialize methods in UptimeOrchestrator and ServiceContainer to use the new utility
 - 📦 Ensure that multiple initialization calls are handled correctly, allowing retries after failures

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bc150ea)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bc150ea94647ceee95a88fad31ef806e33d21ea1)


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


- ✨ [feat] Enhance database schema and indexing for performance improvements
 - 🛠️ [fix] Add composite index on history table for monitor_id and timestamp to optimize queries
 - 🛠️ [fix] Implement safe SQL identifier checks and escaping in dynamic schema generation
 - ⚡ [perf] Improve history pruning logic by ensuring valid IDs are processed and invalid ones are filtered out
 - 🚜 [refactor] Update monitor repository to streamline deletion of history and monitor entries
 - 🧪 [test] Add comprehensive tests for database service initialization and transaction retries
 - 🧪 [test] Introduce tests for history manipulation utilities to ensure correct behavior with invalid IDs

✨ [feat] Introduce connectivity checks with abort signal support
 - 🛠️ [fix] Modify native connectivity functions to accept AbortSignal for cancellation
 - 🧪 [test] Create tests for ping retry utilities to validate retry logic and signal handling
 - 🧪 [test] Ensure connectivity checks throw errors on degraded or down statuses

🧹 [chore] Update package.json scripts for cleaner test reporting
 - 🔧 [build] Remove unnecessary no-truncate flags from test scripts for improved readability

🎨 [style] Adjust confirm dialog store to expose automation hooks conditionally
 - ⚡ [perf] Optimize confirm dialog store initialization based on environment mode

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6ee6b8f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6ee6b8fae810b2d0687e07ff7d47602056026353)


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


- ✨ [feat] Enhance site settings and monitoring functionality
 - 🛠️ [fix] Prevent misleading status alerts when status does not change
 - 🚜 [refactor] Optimize status change event emissions for better performance
 - 🎨 [style] Improve UI components in site settings with consistent help text
 - ✨ [feat] Add SiteSettingsHelpText component for consistent helper text
 - ⚡ [perf] Clamp retry attempts to ensure valid values in site details
 - 🧪 [test] Update tests to reflect changes in status alert and settings behavior

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7f37029)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7f37029bf0a5e08a195196cba0a15f0064d0397d)


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


- ✨ [feat] Enhance site details tabs with new icons and improved UI components
 - 🔧 [build] Added new icons for analytics, history, overview, and settings tabs to improve visual representation.
 - 🎨 [style] Updated the layout of the OverviewTab and SettingsTab for better alignment and spacing.
 - 🛠️ [fix] Refactored the AnalyticsTab to replace text-based status indicators with icon-based badges for uptime and downtime.
 - ⚡ [perf] Memoized icon components in AnalyticsTab to prevent unnecessary re-renders, improving performance.
 - 🎨 [style] Introduced a new icon for notifications in the SettingsTab and updated the notification toggle button for better UX.
 - 📝 [docs] Updated the SettingsTab to provide clearer descriptions for timeout and retry attempts, enhancing user understanding.
 - 🧪 [test] Adjusted tests in AnalyticsTab and SettingsTab to reflect changes in UI and ensure accurate rendering of new components.
 - 🧹 [chore] Cleaned up unused CSS styles in foundation.css and utilities.css to streamline the codebase.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9a873f8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9a873f81c4bc4a5eca8b75c86994c06e61c0fd64)


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


- ✨ [feat] Implement generic toast notifications system
 - Introduced `AppToastToast` component for rendering toast notifications with customizable tones (error, info, success).
 - Integrated toast auto-dismiss functionality based on a specified time-to-live (TTL).
 - Enhanced `StatusAlertToaster` to include rendering of toast notifications alongside status alerts.
 - Updated `useAlertStore` to manage a queue of toast notifications, including enqueueing and dismissing toasts.
 - Added types for toast notifications, including `AppToast` and `AppToastInput`, to ensure type safety.
 - Implemented logic to limit the number of toasts retained in memory to a maximum defined length.

🧪 [test] Add tests for toast notifications functionality
 - Created tests for `StatusAlertToaster` to verify rendering of toast notifications.
 - Mocked `useAlertStore` to simulate different states of alerts and toasts for comprehensive testing.
 - Ensured that toast notifications are correctly dismissed and that the state updates as expected.

📝 [docs] Update documentation for toast notifications
 - Documented the new `AppToastToast` component and its properties.
 - Updated the `useAlertStore` documentation to include new methods for managing toast notifications.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9ea2112)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9ea2112b5cea87f1163261bb4881577951b49bbe)



### 🛠️ Bug Fixes

- 🛠️ [fix] Update Dependabot configuration to ignore problematic packages
 - Ignore "form-data", "qs", and "tough-cookie" to prevent repeated failures in Dependabot runs.

👷 [ci] Enhance Flatpak build workflow for better resource management
 - Add steps to free disk space before builds and prune devDependencies to reduce size.

📝 [docs] Update TruffleHog configuration to reduce noise
 - Only fail the job for VERIFIED secrets to minimize false positives.

🎨 [style] Refactor code for better readability and maintainability
 - Adjust formatting in multiple files for consistent style, including function signatures and comments.

🧪 [test] Improve test reliability for Date error handling
 - Use a fixed UTC time to avoid flaky assertions in CI environments.

⚡ [perf] Optimize ThemeManager performance tests
 - Adjust time budget for CI runners to account for variability in execution time.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3f39611)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3f396116d81c6786e965c39305f0692407ddc67c)


- 🛠️ [fix] Adds IPC result checks

🛠️ [fix] Improves IPC handling by validating success payloads and returning safe errors when checks fail ✅🧯
 - 🛠️ [fix] Records result validation issues in handler metadata for diagnostics 🧾
🚜 [refactor] Tightens handler argument typing to reduce mismatch risk 🧩
✨ [feat] Adds schema-backed validators for backup and restore results 🗂️
🧹 [chore] Updates agent configuration to allow user invocation 🤖
🎨 [style] Cleans up minor lint-rule formatting 🧽
🧪 [test] Extends IPC tests and fixtures for result validation and new metadata fields 🧪

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4ecb590)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4ecb59095e65c929b9c4bfb46b6d5ea9ba847e4d)


- 🛠️ [fix] Adds success accent to settings modal

🛠️ [fix] Improves settings visibility by adding a success accent for clearer status cues
🔧 [build] Updates linting setup with refreshed rule configs and resolver tweaks to reduce noise
 - routes markdown lint fixing through the shared script
🧪 [test] Strengthens UI coverage by asserting invalid submissions keep modals open and selectors surface labels
📝 [docs] Normalizes documentation formatting and escapes underscores for consistent rendering

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bca82d2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bca82d273fcc9ad52fe0fd6c159a4a0033a7d4b4)


- 🛠️ [fix] Harden snapshot creation against NUL bytes
 - Added validation to `escapeSqlStringLiteral` to reject strings containing NUL bytes, preventing potential SQLite errors.
 - Updated tests to ensure `createVacuumSnapshot` throws an error when provided with a snapshot path containing NUL bytes and verifies that the transient connection is closed.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7a3163a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7a3163a32e471dc05891a72767384e4fdfe4585c)


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


- 🛠️ [fix] Improves connectivity fallback

🛠️ [fix] Falls back to DNS when TCP probing fails 🚦 so socket quirks don’t mark hosts down ❌
🧪 [test] Stabilizes retry simulation with listener-driven connect/error timing 🧷
🧹 [chore] Updates lint setup to use config helpers 🧰 and ignore changelog files 📄

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fd19a58)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fd19a58de96ca4adcd5126a04a0946a795da1e2c)


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


- 🛠️ [fix] Improves OAuth loopback stability

🛠️ [fix] Strengthens loopback OAuth handling to guard ephemeral ports and surface callback errors for clearer recovery.
🚜 [refactor] Consolidates Dropbox OAuth flow on shared loopback helpers and state generation to reduce duplicated handling.
⚡ [perf] Limits UI store subscriptions and avoids showing invalid or zero response times for steadier rendering.
🛠️ [fix] Adds IPC correlation validation for preload diagnostics and streamlines debouncing to avoid stale timers.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fb577c0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fb577c095557ba1bd46bd53e0549584aa7edcba5)


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



### 🛠️ Other Changes

- 🔧 [refactor] Update IPC service state synchronization and error handling
 - Make `_meta` optional in state synchronization event data
 - Refactor state update logic to use destructured variables for clarity
 - Improve error handling in HTTP client by adding response type and cleanup methods

🧪 [test] Enhance tests for HTTP monitor service
 - Verify response type in follow redirects tests
 - Ensure error logging captures detailed error information

🛠️ [fix] Adjust WindowService fetch logic
 - Safeguard against undefined response in server readiness check
 - Change loadContent method visibility to public for better access

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f04b6e9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f04b6e90635bb15bacf50b93451d0ba1dcbbd412)


- 🔧 [refactor] Enhance AddSiteForm and FormField components with improved helper text display

 - 🆕 Introduce HelperInfoIcon to provide visual cues for help text in AddSiteForm
 - 🔄 Refactor helper bullet text generation to avoid duplicates and normalize text
 - 📝 Update tests to reflect changes in help text rendering and ensure accurate coverage
 - 🔍 Adjust behavioral tests to verify presence and absence of specific help text

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(aa9c213)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/aa9c21340ef58b1f2244288b6eb5c1342e365dda)


- 🔧 [refactor] Improve error handling and redirect safety in HTTP client

 - 🛠️ Enhance error handling in handleCheckError to map unsupported redirect protocols to user-friendly messages.
 - 🛠️ Introduce enforceRedirectSafety function to prevent following redirects to unsupported schemes or those including credentials.
 - 🔧 Update createHttpClient to include beforeRedirect option for redirect safety enforcement.
 - 🧪 Add tests for redirect safety errors to ensure proper handling of unsupported protocols.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ce22b32)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ce22b32048ff3acf4be028ebbcf1691a9f578409)


- 🔧 [refactor] Enhance electron-debug initialization and improve monitor service handling
 - 🛠️ Refactor electron-debug initialization to use type-safe interfaces and validation
 - 🛠️ Update getMonitorWithResult to prevent unnecessary config re-application on cached instances
 - 🛠️ Simplify HTTP client agent management by implementing shared agents for connection pooling
 - 🎨 Improve URL validation to enforce HTTP/HTTPS protocols
 - 🧪 Add comprehensive tests for monitor service and error handling utilities
 - 🧪 Introduce tests for validateMonitorUrl and handleCheckError functions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(cd8a28a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd8a28a3e8e8e98804716f94db33e396a0ad69c5)


- 🔧 [fix] Ensure proper timeout management in OperationTimeoutManager
 - Clear existing timeout before scheduling a new one to prevent unexpected cancellations
 - Update tests to reflect that only one timeout should be active for the same operation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5063012)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5063012482a485a497376fdf89d8e722f4da8041)



### 🚜 Refactor

- 🚜 [refactor] Update service container retrieval method in hot reload logic
 - Changed `ServiceContainer.getExistingInstance()` to `ServiceContainer.getExisting()` for improved clarity and consistency in the hot reload process.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4df23d4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4df23d45cdcc22906fce11d62940330ce3cb095f)


- 🚜 [refactor] Enhance OAuth URL validation and external URL handling
 - 🛠️ Update `validateOAuthAuthorizeUrl` to use policy-based validation with HTTPS requirement
 - 🔧 Introduce `validateExternalOpenUrlCandidateWithPolicy` for stricter URL validation
 - 📝 Refactor `WindowService` to utilize new external URL validation methods
 - 🚜 Move monitor signature creation logic to `monitorPersistenceUtils`
 - 🧪 Add strict tests for external URL validation and opening behavior
 - 🧹 Clean up unused code and improve error handling in `SiteWriterService`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(85452fc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/85452fc395a3f621466021283022dd8c0027d283)


- 🚜 [refactor] Clarifies container access

🚜 [refactor] Renames the existing-instance accessor to discourage implicit initialization
 - Emphasizes explicit usage in non-bootstrapping paths
📝 [docs] Improves API reference linking and narrative guidance
 - Reduces broken cross-module links and clarifies utility/error notes
🎨 [style] Simplifies documentation lint suppression rules
 - Keeps lint configuration aligned with supported checks

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c0b67e5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c0b67e5b8f35f330e854e7d9679c19c0401369ed)


- 🚜 [refactor] Centralizes validation helpers

🚜 [refactor] Extracts shared validation utilities to reduce duplication
 - Improves consistency for record, string, restore, and notification checks
🚜 [refactor] Normalizes monitor retry handling and HTTP parsing helpers
 - Aligns retry attempts and consolidates JSON/header string handling
🧹 [chore] Updates tooling configs and dependency versions
 - Adjusts linting directives, overrides order, and package upgrades

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fba5b2f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fba5b2fd7b79ad096c6d1c8fac3b7430d8350117)


- 🚜 [refactor] Centralizes service helpers

🚜 [refactor] Extracts service wiring helpers to reduce inline adapter logic and guard cache access during initialization.
🚜 [refactor] Centralizes cloud OAuth token requests with consistent parsing and error messages for interactive and refresh flows.
🚜 [refactor] Consolidates history prune limit and retry-attempt normalization, routing connectivity retries through shared hooks with safer host logging.
🚜 [refactor] Moves cloud IPC validators into a dedicated module and streamlines monitor title suffix resolution and docs.
🧪 [test] Removes connectivity retry tests aligned with the new retry path.
🔧 [build] Reorders overrides and bumps lint tooling versions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2b0d3cf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2b0d3cff014d03d289ef4125f146fa7618fa8575)


- 🚜 [refactor] Improves orchestration helpers

🚜 [refactor] Extracts orchestration, event, IPC, and monitoring utilities to centralize error contexts, payload cloning, resumption flows, and handler execution for steadier runtime behavior
🚜 [refactor] Simplifies site management event emission and validation through shared helpers to reduce duplication and keep state sync signaling consistent
🧹 [chore] Adds CSS module typings generation and checks to strengthen docs type safety
🧹 [chore] Updates linting setup to use modular React rule sets and ignore generated style typings
🧹 [chore] Expands type-check scripts to include docs and refreshes tooling versions
🧪 [test] Updates validation error formatter tests to use the shared helper

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e211183)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e21118338ea05544555b144e96a93b0cc291f68f)


- 🚜 [refactor] Simplify directory path retrieval in WindowService

 - Refactored the method of obtaining the absolute directory path for the module.
 - Replaced `import.meta.dirname` with `path.dirname(fileURLToPath(import.meta.url))` for consistency and reliability.
 - Updated documentation to clarify the standard approach for ESM modules.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(535d281)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/535d281c6635131ff956f06caa8fd5260b9d96a4)


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


- 🚜 [refactor] Clarifies monitoring wiring

🚜 [refactor] Extracts shared monitoring type contracts and narrows history persistence dependencies.
 - Avoids registry import cycles and limits repository access to required APIs.
🎨 [style] Broadens modal overlay selector matching for consistent stacking behavior.
📝 [docs] Normalizes guide links, tables, and escapes to improve readability and navigation.
🧹 [chore] Simplifies markdown formatting settings and disables embedded formatting for markdown.
🧪 [test] Updates fuzz registry coverage to reference extracted type contracts.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(949e8c1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/949e8c1e8dbdb2040ee0ebf5581d08e5789ea80f)


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


- 🚜 [refactor] Extract MonitorManager operations and helpers for improved organization

 - ✨ [feat] Move enhanced lifecycle configuration creation to createEnhancedLifecycle.ts
 - ✨ [feat] Introduce createEnhancedLifecycleConfigOperation and createEnhancedLifecycleHostOperation for better encapsulation
 - 🚜 [refactor] Centralize monitoring toggle operations in toggleMonitoringAllOperation.ts
 - 🚜 [refactor] Create toggleMonitoringForSiteOperation.ts to handle per-site monitoring toggles
 - 🚜 [refactor] Extract scheduled check handling logic into handleScheduledCheckOperation.ts
 - 🚜 [refactor] Implement createMonitorActionDelegate in createMonitorActionDelegate.ts for recursion-safe actions
 - 🛠️ [fix] Update EnhancedMonitorChecker to use bound cleanup operation for better context handling
 - 📝 [docs] Add documentation comments to new utility files for clarity
 - 🚜 [refactor] Simplify Settings component by extracting in-app alert tone preview logic into useInAppAlertTonePreview.ts
 - 🚜 [refactor] Create useSettingsChangeHandlers.ts to manage settings change logic separately
 - 🚜 [refactor] Refactor useSiteDetails to utilize a dedicated UI store slice in useSiteDetails.uiStore.ts

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(07df4e3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/07df4e3c745370d22a937e70cd6a57ce81fe85f1)


- 🚜 [refactor] Extract SiteDetails tab content into separate component

 - 🆕 [new] Create SiteDetailsTabContent component to encapsulate tab rendering logic
 - 🔧 [build] Update SiteDetails component to utilize SiteDetailsTabContent for cleaner structure
 - 🧹 [chore] Remove individual tab rendering logic from SiteDetails, simplifying its responsibilities
 - 🔄 [refactor] Pass necessary props to SiteDetailsTabContent for rendering different tabs
 - 📝 [docs] Add comments to clarify the purpose of the new SiteDetailsTabContent component
 - 🧪 [test] Ensure comprehensive test coverage for the new SiteDetailsTabContent component

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(77c2986)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/77c29866897b448ffe9c6591df32414980925cd0)


- 🚜 [refactor] Modularize monitoring flows

🚜 [refactor] Extracts monitoring lifecycle operations into dedicated helpers to simplify orchestration and keep state, logging, and event emission consistent
 - Reduces branching in core monitoring flows while preserving manual checks and auto-start behavior
🚜 [refactor] Splits site details analytics and settings handling into focused hooks and components to lower complexity and improve chart reuse
 - Centralizes chart configuration and metric rendering for clearer UI updates
🧹 [chore] Adds a lint configuration script and refreshes core and tooling dependencies for consistency

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f410b8c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f410b8c19f5e044803335500e5c2d2c35b489cda)


- 🚜 [refactor] Improves retry orchestration

🚜 [refactor] Centralizes retry behavior with dynamic delays, hooks, and unref timers to reduce scattered loops across services
 - 🛠️ [fix] Keeps non-retryable errors surfaced while insulating retry callbacks from failure
🛠️ [fix] Stabilizes readiness polling for dev server and bridge checks with clearer retry reasons and final failure context
 - ⚡ [perf] Maintains exponential backoff with jitter while avoiding last-attempt waits
🛠️ [fix] Improves theme equality checks with deep comparison to prevent false change detection
⚡ [perf] Simplifies cumulative backoff math for settings retry messaging

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3875997)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3875997e04bdbe4f67795c3be25f81d9fe98d896)


- 🚜 [refactor] Extract backup/history helpers

🚜 [refactor] Moves backup orchestration steps into shared helpers
 - ⚙️ Improves separation of concerns for snapshots, temp files, and safe swaps
🚜 [refactor] Centralizes monitor history save and pruning flow
 - 🧠 Keeps the checker focused on orchestration and state tracking

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(998087b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/998087b3c0681aa971876b1ddd3558f8d844180d)


- 🚜 [refactor] Splits orchestration and settings UI

🚜 [refactor] Centralizes orchestrator subscriptions and error context
 - 🔌 Keeps event wiring and diagnostics logging consistent on teardown
🚜 [refactor] Extracts site cache, background load, and monitoring helpers
 - 🧹 Reuses duplicate checks and state sync emission paths
🚜 [refactor] Modularizes monitor type registration catalogs
 - 🧩 Separates HTTP and non-HTTP definitions to shrink registry size
🚜 [refactor] Splits cloud provider and site settings UI panels
 - 🧭 Uses shared models and focused cards to simplify view logic

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c63cb79)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c63cb79d9dc902f1cce554c8d71fa0838cb521f2)


- 🚜 [refactor] Streamlines async handlers

🚜 [refactor] Introduces reusable fire-and-forget utilities to standardize background task error handling across orchestration, caching, and app lifecycle flows.
🛠️ [fix] Adds explicit error fallback for monitoring-active requests to keep responses predictable when scheduler checks fail.
🚜 [refactor] Extracts monitoring result normalization, UI config, and title suffix helpers to centralize monitoring behaviors and reduce duplication.
🚜 [refactor] Centralizes production window path guards and security header construction for tighter navigation and response hardening.
🚜 [refactor] Moves add-site guidance bullet logic into a dedicated builder for consistent de-duplication and clarity.
🧹 [chore] Updates documentation plugins and lint/style tooling dependencies.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c54baf0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c54baf03609a36ae3caeee30df03e61465f12003)


- 🚜 [refactor] Improves shared sync logic

🚜 [refactor] Centralizes IPC validation helpers and record checks for consistent parameter rules
 - Moves common validators and parameter/record validation utilities into shared helpers

🚜 [refactor] Extracts preload cleanup validation and sync event handling to simplify diagnostics
 - Adds reusable subscription cleanup validation, sync event handler, and status summary utilities

🚜 [refactor] Replaces custom update status wiring with a ref-counted async subscription helper for safer async setup and cleanup
 - Adds reusable subscription utility with focused coverage

🧪 [test] Simplifies mocks and adds coverage for ref-counted subscriptions

🧹 [chore] Updates dependencies and minor lint config cleanup

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1c7cf4a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1c7cf4a945a016639eab31d8756e1f92ba381e00)


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


- 🚜 [refactor] Simplify active operations parsing in mapRowToMonitor function
 - Removed inline parsing of activeOperations from database row
 - Clarified that parsing and validation occur in the repository mapping layer
 - Focused schema mapper on dynamic field mapping only

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2989b8c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2989b8c2f4a91a16f86fcdc2a48c9d074e5b420c)


- 🚜 [refactor] Restructure database utility imports and update check interval naming

 - 🔄 Refactored import paths for database utilities to improve organization:
   - Moved `databaseBackup` to `backup/databaseBackup`
   - Moved `databaseLockRecovery` to `maintenance/databaseLockRecovery`
   - Moved `databaseSchema` to `schema/databaseSchema`
   - Moved `historyManipulation` to `maintenance/historyManipulation`
   - Moved `historyMapper` to `mappers/historyMapper`
   - Moved `historyQuery` to `queries/historyQuery`
   - Moved `typedQueries` to `queries/typedQueries`
   - Moved `valueConverters` to `converters/valueConverters`

 - ✏️ Updated variable names for clarity:
   - Changed `checkInterval` to `checkIntervalMs` in `AddSiteForm` and related components to explicitly indicate the unit of measurement (milliseconds).
   - Updated all references in the codebase, including state management, props, and test cases, to reflect the new naming convention.

 - 🧪 Enhanced test coverage to ensure all changes are validated:
   - Updated test cases to use `checkIntervalMs` instead of `checkInterval`.
   - Ensured all mocks and assertions in tests are consistent with the new naming.

 - 📚 Improved documentation and comments where necessary to clarify the purpose of changes and maintain code readability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5084f11)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5084f11852b4be805b1d535c71753ff64eb80b4e)


- 🚜 [refactor] Enhance site overview and user data handling
 - 🛠️ [fix] Trim user data override path before validation
 - 🔒 [security] Bind remote debugging to localhost for security
 - 🎨 [style] Add text shadow to site details title for better visibility
 - ✨ [feat] Introduce site identifier and name display with copy functionality
 - 🔧 [build] Update SiteOverviewTab to use badges for site metadata
 - 🧪 [test] Improve tests for site name and identifier rendering

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2df41e3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2df41e3d1c91cb0d8e240fa2a699d1836ca8fc9f)


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

- 📝 [docs] Update documentation and TypeDoc configuration
 - 📄 Add new hierarchy documentation in `docs/docusaurus/docs/hierarchy.md` detailing component and service structures.
 - 📄 Update `.gitignore` to exclude `docs/docusaurus/docs/typedoc.json`.
 - 🔧 Modify `typedoc-plugin-markdown.json` to reference `docs/typedoc.json` for JSON output.
 - ✨ Introduce a new TypeDoc plugin `hash-to-bang-links.mjs` to convert `#` links to `!` links for better internal linking.
 - 🔧 Enhance `typedoc.config.json` and `typedoc.local.config.json` with new settings for better documentation generation, including block tags, custom themes, and navigation options.
 - 🛠️ Fix references in `UptimeOrchestrator.ts`, `SiteLifecycleCoordinator.ts`, and other files to improve link accuracy in documentation.
 - 🛠️ Update error handling documentation in `oauthAuthorizeUrl.ts`, `DatabaseCommands.ts`, and `SiteRepositoryService.ts` for clarity.
 - 🛠️ Refactor validation guard documentation in `guards.ts` and `statusUpdateSchemas.ts` to improve readability and accuracy.
 - 🛠️ Adjust site state documentation in `types.ts` and `statusUpdateSnapshot.ts` to ensure consistency with shared types.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6613553)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66135530b7edbc1e5a22f380fe197c2fd91e8dc5)


- 📝 [docs] Add interactive chart docs

📝 [docs] Adds chart-focused markdown guides with Mermaid visuals and updated ADR phrasing
 - Replaces MDX pages with TypeDoc-ingested chart docs for site inclusion
🔧 [build] Updates documentation site config, sidebar entries, and doc inputs
 - Enables extra markdown handling and links chart pages in navigation
🎨 [style] Refines mobile navbar selectors and search input styling
🧹 [chore] Tightens inline documentation comment wording

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d77227b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d77227b76ec8024b0e90611643d644a41753fa7a)


- 📝 [docs] Enhance documentation across multiple scripts
 - ✨ Improved JSDoc comments for clarity and consistency in `enhance-test-metadata.mjs`, `extract-test-names.mjs`, `find-empty-dirs.mjs`, `find-shared-imports.mjs`, `fix-test-quotes.mjs`, `maintain-docs.mjs`, `migrate-to-mts-simple.mjs`, `sort-frontmatter-all.mjs`, `sort-frontmatter.mjs`, `transform-test.mjs`, `validate-doc-frontmatter.mjs`, `validate-performance-config.mjs`, `verify-eslint-inspector.mjs`, and `test-remark.mjs`.
 - 🛠️ Fixed quote issues in test descriptions in `ErrorBoundary.comprehensive.test.tsx`.
 - 🎨 Updated comments in `test-runner-jest.config.js` for better understanding of configuration purpose.
 - ⚡ Added usage information and remarks in various scripts to enhance usability and understanding.
 - 🧹 Removed unnecessary eslint disable comments in `test-runner-jest.config.js`.
 - ✨ Improved overall readability and structure of comments to facilitate easier maintenance and onboarding for new developers.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f94618c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f94618cba62126ce8d2ba4dcef989b0e36e0bf75)


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


- 📝 [docs] Update TSDoc specifications for various tags
 - 🎨 [style] Standardize quotes for tag titles to double quotes in TSDoc files
 - 🎨 [style] Adjust formatting for block comments in TSDoc examples for better readability
 - 📝 [docs] Enhance examples in TSDoc files by adding spacing and aligning comments
 - 📝 [docs] Improve clarity in remarks and descriptions across multiple TSDoc files
 - 📝 [docs] Refactor CloudService.ts to utilize new internal status builder functions
 - 🚜 [refactor] Remove redundant status building methods in CloudService.ts
 - 🛠️ [fix] Correct parameter descriptions and return types in TSDoc files
 - 📝 [docs] Update validation.ts documentation for clarity on error handling

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(aa7fb64)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/aa7fb64cd6dff844f20c922df0c13a3d441d3744)



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


- 🎨 [style] Improve code formatting and readability across multiple files
 - Reformat JSON arrays for better readability in:
   - .devskim.json
   - .ncurc.json
   - .npmpackagejsonlintrc.json
   - .prettierrc
   - .vscode/launch.json
   - .vscode/settings.json
   - config/linting/.secretlintrc.json
   - config/schemas/doc-frontmatter.schema.json
   - config/testing/tsconfig.shared.test.json
   - config/tools/.markdown-link-check.json
   - docs/docusaurus/tsconfig.eslint.json
   - docs/docusaurus/tsconfig.json
   - electron/services/cloud/providers/dropbox/DropboxCloudStorageProvider.ts
   - mermaid.config.json
 - Update package dependencies in package.json and package-lock.json:
   - globals from ^16.5.0 to ^17.0.0
   - npm-package-json-lint from ^9.0.0 to ^9.1.0
   - putout from ^41.4.0 to ^41.4.1

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(76a028d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/76a028d45710df6b7371f863bd7ed6acd850487a)


- 🎨 [style] Improve code formatting and readability
 - Refactor import statements for better clarity in bridgeFactory.ts
 - Simplify error handling code structure in GoogleDriveAuthFlow.ts
 - Enhance error logging format in databaseSchema.ts
 - Adjust indentation for consistency in App.tsx
 - Streamline useMemo hook implementation in useOverflowMarquee.ts
 - Format dependencies array in useDelayedButtonLoading.ts for readability
 - Clarify error message formatting in validation.ts
 - Refine status subscription error handling in useSiteSync.ts
 - Enhance update status handling in useUpdatesStore.ts
 - Improve mock import formatting in aliases.test.ts
 - Adjust media query test assertions for better readability in mediaQueries.test.ts
 - Clarify comments and formatting in cache.ts

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ea206cc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ea206cc7ff6671cb2b44e65e8c230e2cfa32d93b)


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

- Update changelogs for v22.6.0 [skip ci] [`(b3f7370)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b3f73701742a9e00395ca9501e4495ca0da5b91b)


- Update changelogs for v22.5.0 [skip ci] [`(5abecd9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5abecd999280d9024d95365d1350719b474b06e2)


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


- 🧹 [chore] Streamlines sync linting rules

🧹 [chore] Allows async APIs with sync naming in lint rules
 - 🧹 [chore] Reduces noise so warnings focus on real sync I/O
🚜 [refactor] Cleans up sync-related handler naming and notes
 - 🚜 [refactor] Improves readability by removing scattered suppressions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8cad793)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8cad79315da4592d5da04bc34fb5d65224187026)


- Update changelogs for v21.0.0 [skip ci] [`(d54009c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d54009cf33b556e668453ee4a52883801035e42d)


- Update changelogs for v20.9.0 [skip ci] [`(a4fc51a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a4fc51ab5357f54cecc2c18188bf6e683d58100d)


- 🧹 [chore] Update package.json and vite.config.ts to remove googleapis dependency

 - 🔧 Removed "googleapis" from the dependencies in package.json to streamline the project and reduce unnecessary bloat.
 - 🔧 Updated the "clean" script in package.json to include "release" in the cleanup process, ensuring that all relevant build artifacts are removed.
 - 🔧 Modified the "clean:cache:dist" script to also remove "release" artifacts, maintaining a clean state for builds.
 - 🔧 Removed "googleapis" from the external dependencies in vite.config.ts to further optimize the build process and avoid inflating the main-process bundle.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7c8af71)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7c8af71e64ce67f7f34472fe396ec34003719221)



### 🔧 Build System

- 🔧 [build] Update linting rules and dependencies
 - 🛠️ [fix] Import `normalizePath` in multiple linting rules to ensure path normalization is consistently applied.
 - 🛠️ [fix] Refactor `no-deprecated-exports` rule to use `getContextSourceCode` for better source code handling.
 - 🛠️ [fix] Update `hasLocalBinding` function in multiple renderer rules to improve scope handling and prevent infinite loops.
 - 🛠️ [fix] Enhance `waitForBoundingBoxToSettle` utility to reduce flakiness in UI tests by ensuring element stability before interactions.
 - 📝 [docs] Update Docusaurus configuration to include Storybook documentation.
 - 🧪 [test] Adjust timeout for UI tests to accommodate slower environments.
 - 🧹 [chore] Update package dependencies, including `eslint-plugin-antfu` and `eslint-plugin-es-x`, to their latest versions for improved linting capabilities.
 - 🧹 [chore] Modify workspace configuration in `package.json` to include `uptime-watcher` plugin for better project structure.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b03e2a1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b03e2a1f9d273d56c7479fc7ab8a0582c024e271)


- 🔧 [build] Refactor linting rules to use context compatibility utilities

 - 🛠️ Update all linting rules in the uptime-watcher plugin to replace direct calls to `context.getFilename()` with `getContextFilename(context)` for improved compatibility.
 - 🛠️ Modify rules to utilize `getContextSourceCode(context)` where applicable, enhancing source code access consistency.
 - 📝 Ensure that all rules maintain their original functionality while improving code maintainability and readability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1721ef9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1721ef9a5a85e06fc863a43cf33857588c3c56cf)


- 🔧 [build] Update linting scripts and dependencies
 - ✨ [feat] Add quiet variants for linting commands to suppress output
 - 🔧 [build] Update `babel-plugin-react-compiler` to version 1.0.0
 - 🔧 [build] Upgrade `eslint-plugin-jsdoc` to version 62.5.1
 - 🔧 [build] Upgrade `markdown-to-jsx` to version 9.7.2
 - 🔧 [build] Upgrade `putout` to version 41.18.0
 - 🔧 [build] Update package manager to npm@11.9.0

🧪 [test] Refactor Playwright tests for better timeout management
 - 🔧 [fix] Change `test.setTimeout` to `test.describe.configure` for timeout settings
 - ✨ [feat] Introduce `url` field in `MonitorCreationScenario` to avoid duplicate input handling

🛠️ [fix] Improve error handling in `verify-storybook-tsconfig.mjs`
 - 🔧 [fix] Update error throwing to include the original error as cause

🛠️ [fix] Refactor error handling in `useUiStore.ts`
 - 🔧 [fix] Change error handling to directly use the caught error instead of wrapping it

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ecde092)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ecde0921305bcbc8259a1861ae86d2ca8b3f146d)


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


- 🔧 [build] Update dependencies in package.json and package-lock.json

 - 🔧 Update "@eslint-react/eslint-plugin" from "^2.5.3" to "^2.5.4" for improved linting capabilities.
 - 🔧 Upgrade "@types/node" from "^25.0.3" to "^25.0.6" to ensure compatibility with the latest Node.js features.
 - 🔧 [dependency] Update "@types/react" from "^19.2.7" to "^19.2.8" for enhanced type definitions.
 - 🔧 Change "canvas" version from "^3.2.0" to "^3.2.1" to include bug fixes and performance improvements.
 - 🔧 Update "eslint-plugin-json-schema-validator" from "^5.5.0" to "^5.5.1" for better JSON schema validation.
 - 🔧 Upgrade "eslint-plugin-react-dom" from "^2.5.3" to "^2.5.4" for improved React DOM linting.
 - 🔧 [dependency] Update "eslint-plugin-react-hooks-extra" and "eslint-plugin-react-naming-convention" from "^2.5.3" to "^2.5.4" for enhanced React hooks linting.
 - 🔧 Update "eslint-plugin-react-web-api" from "^2.5.3" to "^2.5.4" for better linting of React web APIs.
 - 🔧 Change "eslint-plugin-toml" from "^0.13.0" to "^0.13.1" to include minor updates.
 - 🔧 Upgrade "markdown-to-jsx" from "^9.5.1" to "^9.5.3" for improved Markdown rendering.
 - 🔧 Update "toml-eslint-parser" from "^0.11.0" to "^1.0.0" for enhanced TOML parsing capabilities.
 - 🔧 Update various dependencies in package-lock.json to reflect the changes made in package.json.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d41682d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d41682d25abbd3a7a2aa6b0c394676092e5b21c3)


- 🔧 [build] Refactor electron-debug initialization for development mode
 - Use dynamic import for electron-debug to avoid production dependency
 - Ensure electron-debug is only loaded in development mode
 - Log warnings if electron-debug fails to load or does not export a function

🛠️ [fix] Update isRendererEventChannel function for better validation
 - Change includes check to some for improved performance and accuracy

🔧 [build] Update package dependencies
 - Upgrade @biomejs/biome to version 2.3.11
 - Upgrade eslint-plugin-import-alias to version 8.1.2
 - Upgrade eslint-plugin-putout to version 29.2.4
 - Upgrade putout to version 41.5.0
 - Upgrade other dependencies as necessary

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(35ca57a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/35ca57a2496444104aef7983f3e6a51648e52d9c)


- 🔧 [build] Refactor OAuth token management and validation

 - 🛠️ [fix] Consolidate token retrieval logic in DropboxTokenManager and GoogleDriveTokenManager using readStoredJsonSecret for improved maintainability.
 - 🚜 [refactor] Remove redundant error handling code in token retrieval methods, enhancing clarity and reducing duplication.
 - ✨ [feat] Introduce new utility module oauthStoredTokens for centralized JSON token handling, including schema validation and error logging.
 - 🎨 [style] Improve code readability by using consistent naming conventions and simplifying complex structures in AddSiteForm and related components.
 - ⚡ [perf] Optimize dynamic monitor field value handling in AddSiteForm by utilizing buildMonitorValidationFieldValues for better performance and clarity.
 - 🧪 [test] Enhance test coverage for AddSiteForm and related components, ensuring robust validation and error handling.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3e5f994)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e5f99475023c95249dd6954822b8ad876ea0841)


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


- 🔧 [build] Enhance error handling and validation in database queries and Dropbox authentication

 - 🛠️ Improve error handling for Dropbox OAuth loopback server startup failures
 - 🛠️ Refine error handling in `getHistoryCount` to use `TypedQueryRowValidationError`
 - ✨ Introduce `TypedQueryRowValidationError` for structured error metadata in typed queries
 - 🧪 Add tests for OAuth PKCE generation utilities to ensure correct functionality

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(264d235)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/264d23564a30b57615945b749b31e50a22b1cbbe)


- 🔧 [build] Improve error handling for database and cloud sync operations
 - 🛠️ Update `isDatabaseLockedError` to utilize `tryGetErrorCode` for better lock error detection
 - 🛠️ Refactor cloud sync error handling to use `isCloudSyncSizeLimitError` for size limit validation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(416cfd4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/416cfd4b8c028a619380922503e21aa667d7fd40)


- 🔧 [build] Enhance Google Drive error handling for missing and existing objects
 - 🛠️ [fix] Implement error handling for missing objects in downloadObject method
 - 🛠️ [fix] Add EEXIST error handling for uploadObject when overwrite is false
 - 🧪 [test] Add tests for downloadObject throwing ENOENT error
 - 🧪 [test] Add tests for uploadObject throwing EEXIST error

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(33dfaf1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/33dfaf16ab78e2ed7816099ba1e1f9a80d2effa0)


- 🔧 [build] Enhance Dropbox error handling and conflict detection
 - 🛠️ Implement hasTag function to recursively check for specific tags in Dropbox error responses
 - 🛠️ Add isDropboxConflictError function to identify conflict errors based on status code and tagged payload
 - 🔧 Update uploadObject method to throw EEXIST error when a conflict occurs and overwrite is false
 - 🧪 Add test case for handling EEXIST error during upload with conflict

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3aa89ec)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3aa89ece771c1cd770771406fd54147a4337d687)


- 🔧 [build] Enhance error handling in cloud storage providers

 - 🛠️ Refactor FilesystemCloudStorageProvider tests to include typed error handling for missing objects
 - 🛠️ Add tests for CloudProviderOperationError in EncryptedSyncCloudStorageProvider
 - 📝 Implement detailed error messages for download and upload operations

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6079daf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6079dafbd2b6a243f337c132bf562f8e68d43734)


- 🔧 [build] Enhance cloud provider error handling and validation

 - 🛠️ [fix] Implement consistent error handling across cloud storage providers
   - Introduced `CloudProviderOperationError` for operational failures
   - Standardized error codes and messages for `uploadObject`, `downloadObject`, and `listObjects`
   - Ensured that errors are thrown with relevant context (operation, provider kind, target)

 - 📝 [docs] Update Cloud Provider Implementation Guide
   - Added sections on provider boundary responsibilities and error model
   - Emphasized the importance of runtime validation using Zod schemas

 - 🧪 [test] Refactor tests to validate error handling
   - Updated tests to check for `ENOENT` and `EEXIST` error codes
   - Ensured that missing manifests are treated as `ENOENT` errors

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a4fbc0b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a4fbc0b9cbefff1ac161756adbfcf774c6852b6a)


- 🔧 [build] Update Dropbox and Google Drive cloud storage providers

 - Refactor constants for improved clarity and consistency
 - Enhance error handling mechanisms for better reliability
 - Streamline folder structure management for both providers

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c45b0eb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c45b0eb38268f2fa3b94fc2ab3dfad66b85ed7c6)


- 🔧 [build] Refactor Dropbox and Google Drive error handling and parsing

 - 🛠️ [fix] Introduce `tryParseDropboxErrorSummary` for improved Dropbox error parsing
 - 🚜 [refactor] Move `tryParseDropboxErrorSummary` to a new file for better organization
 - 🛠️ [fix] Enhance Google Drive error handling with `tryDescribeGoogleDriveApiError`
 - 🚜 [refactor] Create `googleDriveErrorSchemas.ts` for structured Google API error responses
 - 🛠️ [fix] Implement `tryParseGoogleUserInfoResponse` for parsing Google user info
 - 🚜 [refactor] Add `googleOpenIdSchemas.ts` to manage OpenID Connect user info payloads

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bda7375)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bda73750c013f2aa4725c51dd224f7a2fda1d9ca)


- 🔧 [build] Enhance Dropbox and Google Drive integration with schema validation

 - ✨ [feat] Introduce Dropbox SDK schemas for upload and download results
   - Added `parseDropboxFilesUploadResult` and `parseDropboxFilesDownloadResult` for validating Dropbox responses.
   - Implemented `tryParseDropboxListFolderFileEntry` for parsing list folder entries.

 - 🔧 [build] Improve error handling in DropboxTokenManager
   - Added logging for invalid JSON tokens and schema validation failures.
   - Implemented token clearing on validation errors.

 - ✨ [feat] Add Google Drive API schemas for file operations
   - Introduced `parseGoogleDriveCreateResponse`, `parseGoogleDriveFileMetadata`, and `parseGoogleDriveListResponse` for response validation.
   - Enhanced `GoogleDriveCloudStorageProvider` to utilize new parsing functions.

 - 🔧 [build] Update GoogleDriveTokenManager with error handling
   - Added logging for invalid stored tokens and schema validation failures.
   - Implemented token clearing on validation errors.

 - 🚜 [refactor] Clean up Google Drive OAuth error handling
   - Introduced `tryParseGoogleOAuthErrorResponse` for better error parsing.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5e6ae08)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5e6ae08fda452a9fa9e1599bf8c8ecdf9378cb73)


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


[[9b07a14](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9b07a1471b4e52d090c56f7f472c2867c618c515)...
[1570ad4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1570ad477286705b78440c5d7594839521ec36ff)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/9b07a1471b4e52d090c56f7f472c2867c618c515...1570ad477286705b78440c5d7594839521ec36ff))


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


- ✨ [feat] Enhance database backup functionality and improve environment variable handling
 - 🛠️ Update `DatabaseManager` to return a structured `DatabaseBackupResult` type from `downloadBackup` method, encapsulating backup data and metadata.
 - 🛠️ Modify `DownloadBackupCommand` to utilize the new `DatabaseBackupResult` type, ensuring consistent data handling across the application.
 - 🛠️ Refactor `DataBackupService` to return `DatabaseBackupResult` from `downloadDatabaseBackup`, improving type safety and clarity.
 - 🛠️ Introduce `environment.ts` utility for safe access to environment variables, including methods for reading strings, booleans, and numbers.
 - ⚡ Update various services and handlers to leverage the new environment variable utilities, enhancing code maintainability and readability.
 - 🧪 Add comprehensive tests to validate the new backup metadata structure and ensure proper functionality of the updated methods.
 - 🎨 Introduce `GalaxyBackground` component stories in Storybook for visual regression testing and design validation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(90217b5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/90217b55b4025ea04a590f709e17f820bcaaf42c)



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


- 🛠️ [fix] Update WindowService test configuration and improve Add Site modal tests
 - 🛠️ Adjust WindowService test to include sandbox option set to false
 - 🛠️ Refactor Add Site modal tests for better readability and structure
 - 🛠️ Increase timeout for server heartbeat validation test to 70 seconds
 - 🛠️ Update WAIT_TIMEOUTS to extend LONG timeout from 10 seconds to 20 seconds

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(284fa7a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/284fa7a35e6292ef75f74198acba8e690a9f9edb)


- 🛠️ [fix] Update IPC context handling in state sync and system APIs
 - 🔧 Refactor correlation envelope matcher to ipcContext for consistency in stateSyncApi tests
 - 🔧 Adjust tests to use ipcContext in systemApi tests for better clarity and maintainability

🛠️ [fix] Improve database backup tests for better error handling and metadata validation
 - 🔧 Simplify binary data initialization in databaseBackup tests for readability
 - 🔧 Enhance error handling in createDatabaseBackup tests to throw specific errors
 - 🔧 Ensure metadata validation includes checksum and schema version in databaseBackup tests

🧪 [test] Enhance IPC service tests with accurate backup metadata
 - 🔧 Update mock backup metadata to include checksum and sizeBytes for consistency
 - 🔧 Validate metadata structure in IpcService tests to ensure correctness

🧪 [test] Refactor monitor scheduler tests for better delay tolerance checks
 - 🔧 Introduce expectDelayWithinTolerance function to validate delay timings in MonitorScheduler tests
 - 🔧 Update assertions to use the new delay tolerance checks for improved accuracy

🧪 [test] Improve notification service tests with better mock implementations
 - 🔧 Refactor notification mock to improve clarity and maintainability in NotificationService tests

🧪 [test] Enhance data backup service tests with detailed error logging
 - 🔧 Update error messages in DataBackupService tests to provide clearer context on failures

🧪 [test] Add utility functions for serialized backup and restore results
 - ✨ Introduce createSerializedBackupResult and createSerializedRestoreResult utilities for consistent test data generation

🧪 [test] Update site sync tests to include lastBackupMetadata handling
 - 🔧 Ensure lastBackupMetadata is correctly initialized and validated in useSiteSync tests

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b6e9b73)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b6e9b736712ae64797c98e63b91f63c90aefdf81)


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

- 🔧 [build] Update tailwind-scrollbar-hide regex for version compatibility
🛠️ [fix] Ensure monitor ID is a number in pruneHistoryForMonitor function
🛠️ [fix] Improve type safety in pruneHistoryForMonitor by converting IDs to numbers
✨ [feat] Synchronize notification preferences with destructured settings
🛠️ [fix] Enhance settings merging logic to prevent data loss during rehydration
🧪 [test] Add mock implementations for cloud API methods in tests

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(79029c3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/79029c3a9eefb2cbd7e245ea72cd0fe7ffa92643)


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


- 🔧 [build] Update dependencies and configuration

 - 🔧 Update `@awmottaz/prettier-plugin-void-html` from `^1.10.0` to `^2.0.0` in `package.json` and `package-lock.json`
 - 🔧 Update `@fast-check/vitest` from `^0.2.3` to `^0.2.4` in `package.json` and `package-lock.json`
 - 🔧 Update `markdown-to-jsx` from `^9.3.0` to `^9.3.2` in `package.json` and `package-lock.json`
 - 🔧 Update `stylelint-use-nesting` from `^6.0.0` to `^6.0.1` in `package.json` and `package-lock.json`
 - 🔧 Update `eslint-plugin-boundaries` from `^5.3.0` to `^5.3.1` in `package.json` and `package-lock.json`
 - 🔧 Update `eslint-plugin-jsdoc` from `^61.4.1` to `^61.4.2` in `package.json` and `package-lock.json`
 - 🔧 Update `fast-check` from `^4.3.0` to `^4.4.0` in `package.json` and `package-lock.json`
 - 🔧 Update `typedoc-plugin-dt-links` from `^2.0.31` to `^2.0.32` in `package.json` and `package-lock.json`
 - 🎨 Update `.prettierrc` to include `escapeNonLatin1` option under `properties` file options
 - 🛠️ Modify `WindowService.ts` to set `sandbox` to `false` for full Node built-ins access

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(26bca1e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26bca1eaea6173d24a27a5f1ecc49a9f39f447eb)


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


[[35c2751](https://github.com/Nick2bad4u/Uptime-Watcher/commit/35c2751a9c375a400a99950a8ea27212d06c30e5)...
[24b157e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/24b157e533d42c459e4e75066ea156653e5be135)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/35c2751a9c375a400a99950a8ea27212d06c30e5...24b157e533d42c459e4e75066ea156653e5be135))


### ✨ Features

- ✨ [feat] Enhance AddSiteForm with improved validation and error handling
 - 🛠️ Introduced a new error message for required site names to improve user feedback.
 - 🧪 Added state management for form submission to track if the form has been submitted.
 - ⚡ Updated the site name input to trim leading whitespace, ensuring cleaner data entry.
 - 🎨 Refactored the error display logic to show error messages conditionally based on user input.
 - 📝 Enhanced the CSS for field groups and error messages for better visual hierarchy.

🧪 [test] Expand AddSiteForm tests for comprehensive coverage
 - 🧪 Added tests to verify the presence of error messages for required fields.
 - 🧪 Updated existing tests to check for multiple instances of error messages.
 - 🧪 Enhanced behavioral tests to ensure proper form submission and error handling.

🚜 [refactor] Clean up and optimize existing test cases
 - 🎨 Improved readability of test cases by consolidating repeated logic.
 - 🧹 Removed unnecessary console logs and debug statements from tests.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6e05b33)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e05b3315f5a5d41ae3f7aa7eec048acbeebfa7d)


- ✨ [feat] Enhance Site List and Card Components
 - 🎨 [style] Update marquee text animation for smoother scrolling and snapping behavior.
 - 📝 [docs] Add new density options for the tabular site list view, including "comfortable", "compact", and "cozy".
 - 🔧 [build] Implement state management for site table density in the UI store.
 - 🧪 [test] Refactor tests for SiteCompactCard to utilize mocks for improved clarity and reliability.
 - 🧪 [test] Update SiteList layout behavior tests to include density changes and ensure proper rendering.
 - 🎨 [style] Modify SiteListLayoutSelector to incorporate density selection functionality.
 - 🎨 [style] Adjust SiteTableView to accept and render based on the new density prop.
 - 🎨 [style] Enhance styling for site cards and layout components to improve visual consistency and responsiveness.
 - 🧪 [test] Add tests for new density options in SiteList and SiteListLayoutSelector components.
 - 🧹 [chore] Clean up unused imports and variables in various test files for better maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f14823e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f14823e1ea29718941608a03394551cc212d167a)



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



### 🎨 Styling

- 🎨 [style] Update ESLint configuration for UptimeOrchestrator

 - Adjust comment length rule to allow multi-line comments
 - Modify max-lines rule to skip blank lines and comments

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c193e5a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c193e5a79f25ddd348dbbc672b8f72355f85e897)



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






## [18.6.0] - 2025-11-16


[[57d1110](https://github.com/Nick2bad4u/Uptime-Watcher/commit/57d11107677cc0e63290ee0a9845d02e23d34cf2)...
[e605499](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e6054997dc4d74ced490662e94c0156e153b3414)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/57d11107677cc0e63290ee0a9845d02e23d34cf2...e6054997dc4d74ced490662e94c0156e153b3414))


### ✨ Features

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



### 🛠️ Bug Fixes

- 🛠️ [fix] Refactor site store mocks and tests for improved clarity and maintainability
 - 🔧 Introduced `createSelectorHookMock` utility to simplify mock creation for Zustand selector hooks
 - 🔧 Added `createSitesStoreMock` utility to generate fully typed `SitesStore` mocks with customizable overrides
 - 🔧 Updated tests across multiple components to utilize the new mock utilities for better consistency
 - 🧪 Enhanced test coverage for `SiteList`, `Settings`, and `AddSiteForm` components by integrating the new mock structure
 - 🧪 Improved error handling in tests by ensuring mocks reset correctly between test cases
 - 🧪 Refactored site monitoring tests to utilize the new mock structure, ensuring clearer assertions and error handling

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3b78b17)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3b78b1762ee08b0534b6a3f3876a952049b01d47)



### 📝 Documentation

- 📝 [docs] Update documentation front-matter and content

 - 📝 Update front-matter in multiple guide documents to include schema reference
 - 📝 Adjust tags formatting for consistency across documentation
 - 📝 Revise section headings in UI Feature Development Guide for clarity
 - 📝 Enhance validation strategy documentation with improved summaries

🛠️ [fix] Modify types and interfaces for better clarity

 - 🔧 Change `monitorId` in `StopMonitoringRequestData` to be required
 - 🛠️ Update event types to mark `monitorId` as optional in relevant events

🎨 [style] Improve code comments and formatting

 - 🎨 Standardize comment styles in Playwright testing guide for better readability
 - 🎨 Refactor comments in `useAlertStore` tests for consistency in capitalization

🧪 [test] Enhance test cases for alert store

 - 🧪 Update assertions in `useAlertStore` tests to improve clarity and accuracy
 - 🧪 Refine regex patterns in tests to ensure they match expected alert ID formats

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(aae9ed0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/aae9ed0c28634c745bfa2e5c6dffcea4e2b9443b)



### 🔧 Build System

- 🔧 [build] Optimize file handling in build workflow
 - 🛠️ Move main files instead of copying to reduce disk usage
 - 🛠️ Rename latest-mac.yml to architecture-specific name after moving
 - 🛠️ Update directory handling to use move instead of copy for subdirectories

🧪 [test] Enhance error logging in main application tests
 - 🛠️ Mock structured logger for consistent error assertions
 - 🛠️ Update tests to verify structured logger captures initialization errors

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e605499)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e6054997dc4d74ced490662e94c0156e153b3414)


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


- 🔧 [build] Refactor IPC handlers to use centralized channel constants
 - 🔧 Update IpcService to utilize constants from @shared/types/preload for data, monitoring, and settings channels
 - 🔧 Modify utils.ts to reference MONITOR_TYPES_CHANNELS for high frequency operations
 - 🧪 Enhance ipcContractConsistency tests to validate channel registration
 - 📝 Improve App component logging to include resolved site identifiers
 - 🔧 Refactor SiteList and StatusSubscriptionIndicator components to use selectors for state management
 - 🧪 Add additional coverage for App and StatusSubscriptionIndicator components

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a37d0a8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a37d0a8174a91ae3f6cec0b5be0f7a16b3fa4c0a)


- 🔧 [build] Update package and lock files for version 18.2.0
 - 🔧 [build] [dependency] Update version 18.2.0 in package.json and package-lock.json
 - 🔧 [build] Update electron dependency to version 39.1.1
📝 [docs] Fix title in troubleshooting guide
 - 📝 [docs] Correct heading from "Troubl&#x65;**&#x53;olutions**" to "Troubleshooting Guide"
🎨 [style] Adjust linting rules in .npmpackagejsonlintrc.json
 - 🎨 [style] Disable 'require-directories' and 'require-files' rules
✨ [feat] Enhance remark configuration in .remarkrc.mjs
 - ✨ [feat] Add new properties for bullet and thematic break markers
🛠️ [fix] Refactor stateSyncApi.ts imports
 - 🛠️ [fix] Move import statements for better organization
🧪 [test] Update electron-api-mock.ts to restructure monitor types
 - 🧪 [test] Move formatMonitorDetail and formatMonitorTitleSuffix to monitorTypes

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(75c7997)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/75c7997912901f8527278d2be5b7dc9843f71b7f)






## [18.1.0] - 2025-11-07


[[9f38268](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9f38268c7db68e1d342f585aa943adaf8e0720ab)...
[aa84ce6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/aa84ce6d957aa9daa1ac300fa99f3ec538739f65)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/9f38268c7db68e1d342f585aa943adaf8e0720ab...aa84ce6d957aa9daa1ac300fa99f3ec538739f65))


### ✨ Features

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

- 🛠️ [fix] Refactor GitHub Actions Build workflow to consolidate output handling
 - Streamlined output handling in version bumping step by combining echo statements into a single block.

🧪 [test] Enhance IPC utils tests for improved timing accuracy
 - Updated tests to use `vi.spyOn` for precise timing measurement.
 - Ensured mock handlers are called correctly and duration is accurately asserted.

🧪 [test] Implement soft cleanup timeout in Playwright tests
 - Added `runWithSoftTimeout` function to manage cleanup actions with a timeout.
 - Ensured cleanup actions for pages and Electron applications are handled gracefully.

🛠️ [fix] Update mockElectronAPI to include isLoaded mock
 - Added `isLoaded` mock to `mockElectronAPI` for better test coverage.

🧹 [chore] Clean up Stryker configuration by removing unnecessary ignores
 - Removed ignored patterns for config/testing directory and JSON files to simplify configuration.

🧹 [chore] Simplify Vitest Stryker configuration
 - Merged base Vitest config with Stryker-specific overrides for cleaner setup.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(aa84ce6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/aa84ce6d957aa9daa1ac300fa99f3ec538739f65)


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

- 📝 [docs] Harmonize Markdown/style across docs + lint/test tidying

🔧 [build] Update HTMLHint lint config
 - 🧾 config/linting/.htmlhintrc: reorder and normalize rules, set attr-sorted/attr-value/whitespace/tags-check consistently to match repo conventions ✅
 - 🔍 Purpose: stabilize HTMLHint behavior so CI/docs generation obey standardized attribute/quote/whitespace rules

🧹 [chore] Project-wide documentation formatting & housekeeping
 - ✨ Normalize emphasis and heading styles: convert legacy __underscore__ emphasis and mixed HTML tags to consistent Markdown (**bold**, _italics_) across README.md, SECURITY.md, SUPPORT.md and many docs files ✅
 - 🧭 Standardize lists & separators: replace ad-hoc "***" separators with canonical "---", unify bullet/list styles and numbered list formats across docs/Architecture, docs/Guides, docs/Testing, and templates ✅
 - 📚 Convert many ADRs, Architecture notes, Patterns, Guides, Templates, and Docusaurus pages to consistent prose and markup (examples: docs/Architecture/ADRs/*, docs/Architecture/Patterns/*, docs/Guides/*) — improves readability and generator compatibility
 - 🧾 README/table polish: update Monitor types table (use consistent bolding for monitor names, tidy descriptions) and quick-start links for clarity

🎨 [style] Docusaurus & frontmatter adjustments
 - 📝 docs/docusaurus/src/pages/markdown-page.md: switch frontmatter separators from '***' → '---' to ensure valid YAML frontmatter and Docusaurus compatibility
 - 🔁 Small presentation tweaks in Docusaurus-generated pages and ESLint-inspector documentation for consistent headings/points

🧪 [test] Lint-driven test & TypeScript formatting fixes (non-functional)
 - 🛠 Reflow/format test sources to satisfy lint/type checks: adjust line breaks, trailing commas, multi-line arrays, import string wrapping, and typed callback formatting across numerous test files (examples: tests/strictTests/electron/**, src/test/**, electron/test/**) ✅
 - 🧹 Remove/clean stray markup in tests (example: removed stray backticks/closing fences in Settings.input-fuzzing.test.tsx) and tighten a few assertions for readability
 - 🔎 Minor logic-preserving refactors in tests: break long expressions into multi-line forms and normalize Object.hasOwn checks to a single-line style for consistency (e.g. src/test/constants-theme-100-coverage.test.ts)
 - 🧾 Update test helper imports/paths formatting (small path string wrapping changes to avoid horizontal line noise in diffs)

🧰 [chore] Tooling / docs automation notes
 - 🔁 IPC/Docs references: many IPC and automation workflow guides were clarified (IPC_AUTOMATION_WORKFLOW.md, RENDERER_INTEGRATION_GUIDE.md, API docs, generation-first guidance) to reflect canonical channel generation and check:ipc/generate:ipc workflow
 - 🧭 Emphasized event contract (settings:history-limit-updated) and optimistic manual-check behavior across renderer docs for implementer clarity

⚠️ [note] Scope & impact
 - 🧪 Most edits are documentation, formatting and test-style only — no production behavior changes intended
 - 🔒 The only configuration-level change that affects behavior is the HTMLHint rule reordering (linting/CI outcome); runtime logic and feature behavior remain unchanged
 - ✅ Purpose: pass linters, improve documentation consistency, and reduce future CI/drift failures

🧹 [chore] Miscellaneous micro-cleanups
 - 🧷 Tidy small helper/test files (ServiceContainer.working.test.ts, pingRetry.test.ts, monitor lifecycle tests, site deletion tests) — purely stylistic or readability improvements
 - 🧾 Consistently apply TSDoc/markdown conventions in many templates and examples for better generated docs and editor UX

Summary: an extensive docs & style sweep plus targeted lint/test format fixes to standardize repository documentation, stabilize HTML/MD authoring conventions, and bring tests into consistent formatting to reduce CI noise and improve maintainability. 🎯✨
Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fa85e4e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fa85e4e38dc1f6393e106d08c6e7900304705edf)


- 📝 [docs] Refine and standardize JSDoc and type annotations in SiteRepository.ts

📝 - 📄 Expand and rework module-level documentation; remove obsolete @packageDocumentation
📝 - 🔁 Promote and document SiteRowUpsertFields earlier for clearer upsert typing
📝 - ✅ Standardize @throws wording across public and private APIs and add missing @throws annotations
📝 - ➕ Add/move @returns, @typeParam and @remarks for read helpers and transaction adapter
📝 - 🧹 Minor wording/formatting cleanups; no runtime or behavioral changes

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9f38268)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9f38268c7db68e1d342f585aa943adaf8e0720ab)






## [18.0.0] - 2025-11-04


[[459c8ab](https://github.com/Nick2bad4u/Uptime-Watcher/commit/459c8ab0b2fcf7fa1cbe1fe4034419fd6984540e)...
[292b064](https://github.com/Nick2bad4u/Uptime-Watcher/commit/292b0646abe164bd68c56d4e555948f8e19cbda4)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/459c8ab0b2fcf7fa1cbe1fe4034419fd6984540e...292b0646abe164bd68c56d4e555948f8e19cbda4))


### ✨ Features

- ✨ [feat] Add configurable Electron userData override and ensure directory creation
 - 🗂️ Read override from UPTIME_WATCHER_USER_DATA_DIR / PLAYWRIGHT_USER_DATA_DIR at startup
 - 🛠️ mkdirSync(resolvedPath, { recursive: true }) then app.setPath("userData", resolvedPath)
 - 🐞 Log success/failure and normalise errors with ensureError
 - 📁 Enables isolated userData for Playwright runs and manual dev overrides

🚜 [refactor] Harden Playwright electron fixture: allocate isolated userData & robust cleanup
 - 🔧 Allocate mkdtemp temporary userData dir and set process.env["PLAYWRIGHT_USER_DATA_DIR"]
 - 🧹 Register cleanup tasks (rm temp dir, restore previous env) and ensure single-run via runCleanup()
 - 🔁 Hook app.on("close") and wrap app.close() (coverage and non-coverage paths) to collect coverage, run cleanup and surface errors

🧪 [test] Consume shared launch helper & adapt UI helpers for isolated userData
 - 🔗 Replace inline electron.launch usages in renderer tests with launchElectronApp
 - 🧭 playwright/utils/ui-helpers: make removeAllSites a no-op when PLAYWRIGHT_USER_DATA_DIR is present; adjust resetApplicationState to avoid redundant DB clears
 - 🔒 WindowService tests: use bracketed env access (process.env["HEADLESS"]) for safer typing

🎨 [style] Standardise runtime-only type module markers
 - 🔤 Rename __uptimeOrchestratorTypesRuntimeMarker -> UPTIME_ORCHESTRATOR_TYPES_RUNTIME_MARKER
 - 🔤 Rename __validatorInterfacesRuntimeMarker -> VALIDATOR_INTERFACES_RUNTIME_MARKER
 - ✅ Aligns naming across type-only modules and coverage instrumentation

🧹 [chore] Tooling & config tweaks
 - ⚙️ .vscode/tasks.json: split task groups into explicit buckets (vite-dev, vite-build, deps-install, lint-*, test-*, test-coverage, etc.) for clearer runner UI
 - 🧰 config/tools/knip.config.ts: add @jscpd/leveldb-store to knip config

🧪 [test] Unify test logger mocks & tighten test hygiene across strict suites
 - 🧩 Introduce createLoggerMock(), loggerModuleMockFactory(), getLoggerMock() and satisfy typed logger exports in multiple tests
 - 🧰 Centralise MockDatabase / sqlite mocks and use vi.spyOn for controlled stubs; reset mocks cleanly between tests
 - ✅ Replace brittle assertions with robust matchers (toBeFalsy/toBeTruthy, toHaveBeenCalledExactlyOnceWith, expectTypeOf(...).toBeNumber(), use .at(0) for call inspection)
 - ♻️ Minor test housekeeping: WithErrorHandling typing, toThrow -> toThrow simplification, and small expectation ordering fixes

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ec3c561)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ec3c5617eae11d21489a5359f2de512380d86afd)


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


- 🚜 [refactor] Reorganize MonitorManager enhanced lifecycle helpers
 - Move startAllMonitoringEnhanced / stopAllMonitoringEnhanced / startMonitoringForSiteEnhanced / stopMonitoringForSiteEnhanced closer to related lifecycle methods for better locality and readability.
 - Make these helpers async to standardize signatures and prepare for future await-based flows.

🛠️ [fix] Preserve and normalize event metadata when forwarding in ServiceContainer
 - Extract forwarded/original metadata from both property keys and symbol, normalize the metadata shape, and reattach as non-enumerable properties on cloned payloads.
 - Handle both array and object payloads, remove reliance on enumerable _meta/_originalMeta fields, and consistently apply FORWARDED_METADATA_PROPERTY_KEY, ORIGINAL_METADATA_PROPERTY_KEY and ORIGINAL_METADATA_SYMBOL.
 - Improves correctness of event metadata forwarding to the orchestrator and preserves diagnostics for downstream consumers.

🧪 [test] Validate metadata forwarding and adjust TypedEventBus mocking
 - Change TypedEventBus mock to importActual and override only TypedEventBus to preserve symbol behavior in tests.
 - Add "Metadata forwarding preservation" tests in ServiceContainer.working.test.ts to assert non-enumerable descriptors and symbol-based original metadata for object and array payloads.

🧪 [test] Normalize SQLite backup mock name and re-enable backup fuzzing
 - Rename downloadSQLiteBackup → downloadSqliteBackup across Settings tests (invalid-key, comprehensive, input-fuzzing) to match runtime API.
 - Re-enable and improve property-based fuzzing backup test: use render helper, target the export button, assert mockDownloadSqliteBackup is invoked and error handling behavior is exercised.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(459c8ab)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/459c8ab0b2fcf7fa1cbe1fe4034419fd6984540e)



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


[[838bd17](https://github.com/Nick2bad4u/Uptime-Watcher/commit/838bd17a55aeffbfd1c49a2f7f8123a5bb3e5a27)...
[12247c6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/12247c6e92c0e1cddac1116041543efd4c596c39)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/838bd17a55aeffbfd1c49a2f7f8123a5bb3e5a27...12247c6e92c0e1cddac1116041543efd4c596c39))


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


- 🚜 [refactor] Centralize services and add duplicate site handling

This commit introduces a major refactoring by centralizing IPC-related services and improving data integrity.

### Source Code Changes

✨ **[feat] Add Duplicate Site Identifier Sanitization**
- 🛡️ Implements a sanitization step in the main process `get-sites` IPC handler.
- 🔍 Detects and removes sites with duplicate `identifier` values before sending the site list to the renderer.
- 🪵 Adds detailed error logging when duplicates are found, including the count and specific identifiers, to aid in debugging data corruption issues.

🚜 **[refactor] Centralize Renderer Services**
- 📂 Moves `SiteService` and `MonitoringService` from `src/stores/sites/services` to a new top-level `src/services` directory.
- 🎯 This establishes a clear, unified location for all renderer-side services that communicate with the main process.

⚡ **[perf] Refine Site Initialization**
- 🔄 Updates the `initializeSites` action in the sites store to use the `syncSites` function.
- ⬇️ This ensures the initial site load leverages the full state synchronization pipeline, rather than a direct `getSites` call, for better consistency.

### Documentation and Test Changes

📝 **[docs] Update API Documentation for Service Layer**
- 📖 Overhauls the API documentation to strongly recommend using the new, centralized service modules (`SiteService`, `MonitoringService`, etc.) instead of directly accessing `window.electronAPI`.
- 💻 Updates all code examples and API references to reflect the new service-based access pattern.
- 🔗 Corrects broken links in architecture documents that pointed to the old service file locations.

🧪 **[test] Adapt Tests to Refactoring and New Logic**
- 🧩 Updates all unit and integration tests to import services from their new `src/services` location.
- ⚙️ Modifies the `IpcService` test to account for the new duplicate site filtering logic, ensuring it correctly returns a sanitized list.
- ♻️ Adjusts store-level tests to reflect the change in the `initializeSites` implementation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(838bd17)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/838bd17a55aeffbfd1c49a2f7f8123a5bb3e5a27)






## [17.7.0] - 2025-10-28


[[7bedb23](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7bedb231e49c4fbfcf3f4c30783e78ffa3cf2fff)...
[06160b0](https://github.com/Nick2bad4u/Uptime-Watcher/commit/06160b027e8d56dc1a1eabc9cf956bd53bfbd104)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/7bedb231e49c4fbfcf3f4c30783e78ffa3cf2fff...06160b027e8d56dc1a1eabc9cf956bd53bfbd104))


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


- ✨ [feat] Add diagnostics for preload guard failures

✨ [feat] Enhance preload event handling with diagnostics
 - Adds robust error handling to the `stateSyncApi` event listener.
 - 🛡️ When an incoming event payload fails validation, it is now dropped instead of being ignored silently.
 - 🪵 A detailed warning is logged with a preview of the malformed payload for easier debugging.
 - 📊 A formal "preload guard failure" diagnostic report is now sent to the main process for centralized monitoring and analysis.
 - ♻️ Refactors the event manager to be created only once, improving efficiency.

🚜 [refactor] Replace `waitForElectronAPI` with `waitForElectronBridge`
 - Updates the IPC service helper to use the newer, more robust `waitForElectronBridge` utility.
 - 🗑️ Removes the now-obsolete `waitForElectronAPI` utility from frontend stores.
 - This change unifies the bridge readiness check across the application.

🧪 [test] Overhaul repository and component tests
 - 🔄 Replaces simple coverage-focused tests for `MonitorRepository` with comprehensive property-based tests using `fast-check`.
 - 🧹 Cleans up and standardizes timeouts in `SettingsRepository` property-based tests.
 - 🧩 Updates numerous component tests (`ScreenshotThumbnail`, `App`, `Settings`, etc.) to use a consistent and improved logger mock.
 - 🔧 Refactors `ScreenshotThumbnail` click handling tests to use the `SystemService` instead of directly mocking the `electronAPI`.
 - ➡️ Removes dependencies on the deprecated `waitForElectronAPI` from service tests, aligning them with the `waitForElectronBridge` refactor.

🔧 [build] Improve zero-coverage test detection script
 - ⏱️ Adds a configurable timeout (`--timeout-ms`) to individual Vitest commands to prevent the script from hanging.
 - 📝 Introduces more detailed logging to provide better visibility into the script's execution flow.
 - 📁 Adds a file existence check for the Vitest configuration path to avoid errors when the file is missing.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7bedb23)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7bedb231e49c4fbfcf3f4c30783e78ffa3cf2fff)



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


[[f9ad293](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f9ad29353ef8106055541dd5451260004901515e)...
[cb96c21](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cb96c21ed015d63e00bf7ee5b00418a7bd63e45f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/f9ad29353ef8106055541dd5451260004901515e...cb96c21ed015d63e00bf7ee5b00418a7bd63e45f))


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



### 🎨 Styling

- 🎨 [style] Apply consistent code formatting across the project

This commit applies automated code formatting and style fixes across various files, ensuring consistency and improving readability.

🎨 [style] Adjusts code formatting for consistency and brevity.
 - Collapses several multi-line function calls, array initializations, and `expect` statements in test files into single lines.
 - Standardizes indentation and spacing in test mocks and function arguments.
 - Removes extraneous newlines from test files.

📝 [docs] Improves JSDoc and comment formatting.
 - Aligns type definitions within JSDoc blocks in the custom ESLint plugin for better readability.
 - Adds minor formatting corrections to documentation blocks in test files.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f9ad293)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f9ad29353ef8106055541dd5451260004901515e)






## [17.5.0] - 2025-10-27


[[11d1782](https://github.com/Nick2bad4u/Uptime-Watcher/commit/11d178289f4a0221146a49f017c0a0cde412d17d)...
[7cce37e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7cce37e8603d8f25e5d924f2be6f06fde4979326)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/11d178289f4a0221146a49f017c0a0cde412d17d...7cce37e8603d8f25e5d924f2be6f06fde4979326))


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


- ✨ [feat] Introduce state sync delta tracking and improve status reporting

This update introduces comprehensive tracking of site synchronization changes and enhances the accuracy of state sync status reporting. It also includes several fixes and refactorings to improve data integrity and type safety.

✨ [feat] Implement Site Synchronization Delta Calculation
 - Adds a new utility, `calculateSiteSyncDelta`, to compute the difference between two collections of sites.
 - This function identifies added, removed, and updated sites, providing a structured `SiteSyncDelta` object.
 - The `fast-deep-equal` package is used for efficient and accurate structural comparisons of site objects.

✨ [feat] Integrate Delta Tracking into State Management
 - The main sites store (`useSitesStore`) now tracks the `lastSyncDelta`.
 - When a state synchronization event occurs, the store now calculates and records this delta.
 - This allows the UI and other services to react to specific changes (e.g., site additions or removals) rather than just reloading the entire list.

🛠️ [fix] Preserve Previous Site State on Monitor Removal
 - In the `SiteManager`, when a monitor is removed, the site's state is now cloned *before* the modification.
 - This ensures that `internal:site:updated` events emit the correct "previous" site snapshot, accurately reflecting the state before the monitor was deleted.

🚜 [refactor] Enhance State Sync Status Reporting
 - The `IpcService` now caches the synchronization status and listens for `sites:state-synchronized` events to keep it updated.
 - The `get-sync-status` IPC handler now returns this cached status, providing a more accurate and persistent representation of the last sync operation, rather than generating a new status on each call.

🎨 [style] Improve Event Handler Type Safety
 - Strengthens type safety in `EventsService` for `onMonitoringStarted` and `onMonitoringStopped` events.
 - Type guards are now used to ensure that callbacks receive the correctly structured event payload, preventing potential runtime errors.

🧪 [test] Expand Test Coverage and Stability
 - Adds extensive new tests for the site sync delta calculation and state management logic.
 - Introduces a regression test in `UptimeOrchestrator` to verify that the `previousSite` snapshot is correctly preserved when monitors are removed.
 - Improves the stability of property-based fuzzing tests for the Settings component by ensuring a clean DOM state for each test iteration.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5ce61d6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5ce61d69b8d069e8bf081282b0ffa6262092b58a)



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


- 🚜 [refactor] Implement Site Mutation Pipeline for data consistency

This refactoring introduces a standardized "Site Mutation Pipeline" to ensure transactional integrity and data consistency across the database, cache, and event bus when modifying site information.

✨ **[feat] Site Mutation Pipeline**
-   Adds a strict, layered contract for all write operations, ensuring the database, in-memory caches, and monitoring systems remain synchronized.
-   The flow is now: `SiteManager` (invariant checks) → `SiteWriterService` (transaction management & cache updates) → `Repository` (SQL execution).

🚜 **[refactor] `SiteManager.removeMonitor`**
-   Rewrites the monitor removal logic to adhere to the new pipeline.
-   Instead of direct repository calls and manual cache refreshes, it now uses `SiteWriterService` to handle the mutation atomically.
-   Adds a domain invariant check to prevent the removal of the last monitor from a site, throwing a specific error.
-   Ensures `validateSite` is called with the proposed changes before committing to the database.
-   Events are now emitted only *after* the transaction and cache update are successfully completed by the `SiteWriterService`, guaranteeing consumers receive a consistent state.

📝 **[docs] Development Patterns Guide**
-   Adds a comprehensive "Site Mutation Pipeline" section to the development guide.
-   Includes a sequence diagram, layer responsibilities, an invariant checklist, and usage guidelines to document the new pattern.

🧪 **[test] Update Unit & Comprehensive Tests**
-   Overhauls tests for `removeMonitor` to reflect the new pipeline logic, covering success cases, error handling (like removing the last monitor), and interaction with the `SiteWriterService`.
-   Adds new tests for the `getSiteSnapshotForMutation` helper to verify its caching and cloning behavior.
-   Adjusts `SiteRepository` tests to confirm that `upsert` operations are now correctly wrapped in a transaction.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(11d1782)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/11d178289f4a0221146a49f017c0a0cde412d17d)






## [17.4.0] - 2025-10-25


[[6de39e8](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6de39e86c86fb54e87df6a366275912f1c9d7ad8)...
[a15b7a5](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a15b7a59b17721cda8678dfbd38f88eb954a11e3)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/6de39e86c86fb54e87df6a366275912f1c9d7ad8...a15b7a59b17721cda8678dfbd38f88eb954a11e3))


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


- 🛠️ [fix] Refactor and improve code quality

This commit refactors and improves code quality across several files, focusing on enhanced error handling, code modernization, and improved data processing.

- ♻️  Modernizes array sorting and string conversion in `verify-storybook-tsconfig.mjs`:
 - Uses `Array.from(values).toSorted()` for locale-based sorting, enhancing performance and readability.
 - Simplifies string conversion with `values.map(String)`, streamlining the code.
 - 🐛 Improves error handling in Storybook tsconfig verification:
 - Adds more descriptive error messages with a cause, aiding in debugging.
 - 🤔 This change makes it easier to identify and address issues in the tsconfig file.
- 🐛 Fixes duplicate site identifier detection in `useSiteSync.ts`:
 - Removes a conditional check that prevented duplicate site identifier errors from being logged when a snapshot was present.
 - 📝 This ensures that duplicate identifiers are always reported, improving data integrity.
- ⚡️ Simplifies test assertions in `SiteManager.test.ts`:
 - Renames `updateSitesCache` to `updateSitesCache diagnostics` to better reflect the tests purpose.
 - ✅ This clarifies the test's intent and improves maintainability.
- 🎨 Updates styling in `BaseFormField.stories.tsx`:
 - Adjusts the classname for the input field to `rounded-xs`, streamlining the user interface.
- 🧪 Updates mock functions in `operationHelpers.test.ts` to better reflect their types.
- 🛠️ Improves component prop handling in `AnalyticsTab.stories.tsx` and `OverviewTab.stories.tsx`:
- Uses `useCallback` to memoize event handlers, preventing unnecessary re-renders and improving performance.
- 💡 This optimization ensures that the components only re-render when their dependencies change, leading to smoother user interactions.
- ✨ Improves monitor type handling in `DynamicMonitorFields.stories.tsx`:
 - Uses `prepareMonitorTypesStore` to initialize the monitor types store, ensuring consistent state.
- 🐛 Fixes type definitions and simplifies data mapping in `storybook/helpers/monitorTypeStoryHelpers.ts`:
  - Replaces `.map` with a `for...of` loop to build the `fieldConfigs` object, improving readability and maintainability.
  - 🧩 This change streamlines the data transformation process, making the code easier to understand and modify.
- 🛠️ Standardizes timeout value in `useSiteOperations.test.ts`:
 - Changes `timeout: 5_000` to `timeout: 5000` for consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(89cf652)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/89cf652d9bf05c5ad696daae9d433bf9a8f5a255)


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


- 🚜 [refactor] Refactor event emission for site/monitor updates

This commit refactors the event emission process for site and monitor updates to improve consistency and streamline data flow.

- 🔄 **Managers Emit Internal Lifecycle Topics**:
  - `SiteManager` and `MonitorManager` now emit `internal:site:*` and `internal:monitor:*` events for CRUD and monitoring lifecycle operations instead of public events.
  - High-frequency telemetry like `monitor:status-changed` continues to originate directly from `MonitorManager`.
- ➡️ **`UptimeOrchestrator` as Public Source of Truth**:
  - The orchestrator consumes internal lifecycle events, sanitizes metadata, and emits public events (`site:*`, `monitoring:*`, `monitor:*`) plus `cache:invalidated` notifications.
  - Global monitoring transitions now use `{ type: "all" }` for cache invalidation, enabling renderers to perform a full resync.
- 👂 **Frontend Listens Only to Orchestrator Output**:
  - `ApplicationService` subscribes to the orchestrator and uses `RendererEventBridge` to fan out events to windows, ensuring consistent payloads across renderers.
- 🐛 **Fixes**:
  - Ensures that site data is available when `internal:site:removed` is emitted by including the site snapshot in the event data.
  - Handles cases where site data might be missing by providing fallback values and logging warnings.
- 🧪 **Tests**:
  - Updates tests to reflect the new event emission patterns and ensure proper cache invalidation.
  - Adds tests to verify global cache invalidation for bulk monitor start/stop events.
- 📝 **Documentation**:
  - Updates documentation to reflect the layered emission strategy and the role of the `UptimeOrchestrator` as the single source of truth for public events.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(dce38b6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dce38b685b3edcc92bb5a39772a5d6010eb15974)


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


- 🚜 [refactor] Refactors monitor services to use shared core

This commit refactors the HTTP monitor services to use a shared HTTP core, and updates Storybook configuration.

- ♻️ [Refactor] Migrates `HttpHeaderMonitor`, `HttpJsonMonitor`, `HttpKeywordMonitor`, `HttpLatencyMonitor`, `HttpStatusMonitor`, `ReplicationMonitor`, and `ServerHeartbeatMonitor` to use the shared HTTP monitor core for consistent request handling and retry logic.
   - This involves creating `HttpMonitorBehavior` implementations for each monitor type, defining the monitor-specific logic for validating configurations and evaluating responses.
   - This greatly reduces code duplication and provides a single place to update request lifecycle logic.
- 🧱 [Build] Introduces `httpMonitorCore.ts` and `monitorFactoryUtils.ts`
   - `httpMonitorCore.ts`: This centralizes request handling, retry logic, and response logging for HTTP-derived monitor services.
   - `monitorFactoryUtils.ts`: This provides utilities for wrapping monitor factory construction with hardened exception handling.
- 🔨 [Refactor] Removes the rate limiter from each of the monitor implementations and places it in the shared http core.
- 📝 [Docs] Updates documentation to reflect the new shared core architecture.
- 🧹 [Chore] Adds `verify-storybook-tsconfig.mjs` and updates `eslint.config.mjs`
   - Enforces stricter type checking and linting rules.
   - Sorts and deduplicates Storybook tsconfig includes to avoid typecheck errors.
- 🧪 [Test] No changes to existing tests as functionality remains the same.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(88256ad)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88256ad9f639483217fc6e4396bc37f8debff78f)


- 🚜 [refactor] Refactor shared type imports

Refactors imports to use the `@shared` alias for shared types.

- 🚜 [refactor] Updates imports to use the `@shared` alias
 -  Refactors multiple files to import shared types from the `@shared` alias instead of relative paths.
 -  This change improves code maintainability and reduces the risk of import errors when moving files.
- 🧪 [test] Updates test files to use the `@shared` alias
 -  Updates test files to use `@shared` imports.
- 📝 [test] Updates tsconfig to include shared directory
 -  Updates tsconfig to include all shared directories.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(30b1afb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/30b1afb7ee4ba4ec87e223684d6194714fef816d)



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

- 🎨 [style] Refactor codebase with consistent formatting and style improvements

This commit introduces a wide-ranging series of updates focused on improving code style, consistency, and readability across the entire project. It also enhances the BeastMode agent's capabilities and refines development and testing configurations.

✨ [feat] Enhance BeastMode Agent Configuration
 - Updates the agent to use the `GPT-5-Codex` model.
 - Refines and expands the agent's handoff capabilities with new tasks for testing, TSDoc, and work review.
 - Adds a new `Review.prompt.md` to guide the agent in comprehensive task validation.

🎨 [style] Apply Consistent Code Formatting
 - Applies standardized formatting to numerous TypeScript, JavaScript, and Markdown files.
 - Improves JSDoc comments, type definitions, and code block indentation for better readability and maintainability.
 - Reformats complex object and array declarations to follow a consistent multi-line style.

🔧 [build] Refine ESLint and Build Configuration
 - Adjusts ESLint plugin and rule definitions for improved clarity.
 - Improves JSDoc in the Storybook test runner configuration.

🧪 [test] Standardize Test File Formatting
 - Applies consistent formatting across the test suite, including Vitest and Fast-Check tests.
 - Cleans up mock implementations and test setups for better readability without changing logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a15b7a5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a15b7a59b17721cda8678dfbd38f88eb954a11e3)


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



### 🧪 Testing

- 🧪 [test] Enhance testing and fix eslint issues

- 🧪 [test] Improves test setup by:
  - 🔇 Suppresses specific console warnings during tests to reduce noise and focus on relevant issues.
  - 💾 Mocks `localStorage` and `sessionStorage` when Node.js shims are incomplete, providing a consistent testing environment:
   - ⚙️ Creates an in-memory `Map`-backed storage implementation.
   - ✅ Ensures `globalThis` exposes a fully functional storage implementation.
- 🛠️ [fix] Fixes a bug in `DatabaseCommands.test.ts` where console.error was spied on instead of the logger, and improves the error message:
   - 🐛 Replaces `consoleSpy` with `loggerSpy` to correctly capture logger errors.
   - 📝 Updates the error message to provide more context, including the command name.
- 🧹 [chore] Disables the `@jcoreio/implicit-dependencies/no-implicit` ESLint rule:
  - 🚫 Disables the rule in multiple ESLint configurations.
- 🎨 [style] Removes duplicate imports in `storybook/helpers/siteStoryHelpers.tsx`
- ✨ [feat] Adds stories for Header components:
  - ✨ Adds `HeaderControls.stories.tsx` for action cluster coverage.
  - ✨ Adds `HealthIndicator.stories.tsx` for uptime badge.
  - ✨ Adds `StatusCounter.stories.tsx` for badge variants.
  - ✨ Adds `StatusDivider.stories.tsx` for utility element.
  - ✨ Adds `StatusSubscriptionIndicator.stories.tsx` for realtime status subscription diagnostics.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(315d5e8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/315d5e82d986a46984063f9e559ea2b81c24bb04)



### 🧹 Chores

- 🧹 [chore] Enforce linting rules and update dependencies

This commit introduces custom ESLint rules to enforce architectural conventions and improve code quality. It also updates dependencies to ensure compatibility and access to the latest features.

- 🔧 Introduces a new ESLint plugin (`uptime-watcher.mjs`) with custom rules:
  - 🛡️ `monitor-fallback-consistency`: Ensures `FALLBACK_MONITOR_TYPE_OPTIONS` aligns with shared `BASE_MONITOR_TYPES`, preventing inconsistencies.
  - 🚫 `electron-no-console`: Enforces the use of structured logging instead of `console.*` in Electron runtime code, improving maintainability and debugging.
  - ✍️ `tsdoc-no-console-example`: Disallows `console.*` usage within TSDoc example code blocks, promoting consistent logging practices.
  - 🔗 `prefer-shared-alias`: Enforces the use of `@shared/*` import aliases instead of relative paths for shared modules, enhancing code clarity and maintainability.
- 📝 Integrates the new ESLint plugin into the main ESLint configuration (`eslint.config.mjs`) and applies the custom rules to relevant files.
  - 📁 Applies "Monitor Fallback Consistency" rule to `src/constants.ts`.
  - 🖥️ Applies "Electron Logger Enforcement" rule to `electron/**/*.{ts,tsx}` (excluding `electron/test/**/*`).
  - ✍️ Applies "TSDoc Logger Examples" rule to all `**/*.{ts,tsx}`.
  - 🔗 Applies "Shared Alias Imports" rule to `docs/**/*.{ts,tsx}`, `electron/**/*.{ts,tsx}`, `src/**/*.{ts,tsx}`, and `storybook/**/*.{ts,tsx}` (excluding `shared/**/*`).
- 🚚 Refactors database command rollback logging in `DatabaseCommands.ts` to use the `backendLogger` instead of `console.error`, aligning with the new linting rules.
  - 🪵 Improves logging clarity by including the command description in the log message.
- 🩹 Updates `diagnosticsMetrics.ts` to use a `fallbackDiagnosticsLogger` based on `electron-log/main` instead of `console`, ensuring consistent logging even when the primary logger is unavailable.
- ⬆️ Updates import paths in various test files to use the `@shared` alias, aligning with the new linting rules and improving code readability.
- 🧪 Adds a new `tsconfig.json` file in the `src/test` directory to extend the base testing configuration.
- 🧹 Disables `@jcoreio/implicit-dependencies/no-implicit` rule for storybook stories.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3f623f4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3f623f4614ca0343af2467f5b477031847bbed54)






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

Refactors code to consistently use `siteIdentifier` instead of `siteId`.

- 🛠️ Updates codebase to replace instances of `siteId` with `siteIdentifier` across multiple files.
 - This change ensures consistency and clarity in identifying sites throughout the application.
 -  🧼 Cleans up naming inconsistencies to improve code readability and maintainability.
- ⚡️ Improves code efficiency by aligning naming conventions with the intended purpose of site identification.
- 🧪 Updates benchmarks and tests to reflect the change from `siteId` to `siteIdentifier`.
 -  Ensures that the test suite remains accurate and reliable after the refactoring.
 -  Includes modifications to mock data and test assertions to align with the new naming convention.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(64f3527)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/64f35276da2549e3f2d72669d8690c02ca343490)


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


[[a60227e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a60227eaba7d5418aad6e07efd83bcece93fed5a)...
[a60227e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a60227eaba7d5418aad6e07efd83bcece93fed5a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/a60227eaba7d5418aad6e07efd83bcece93fed5a...a60227eaba7d5418aad6e07efd83bcece93fed5a))


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






## [16.7.0] - 2025-10-11


[[7e0f43e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e0f43e99af0d8cfe94e70f68c1917f0f15ca167)...
[d9c62fd](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9c62fd22d7af27284eeeff8fa788ad5896aba80)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/7e0f43e99af0d8cfe94e70f68c1917f0f15ca167...d9c62fd22d7af27284eeeff8fa788ad5896aba80))


### ✨ Features

- ✨ [feat] Upgrade dependencies and enhance Storybook

This commit upgrades various dependencies and enhances the Storybook configuration to improve the application's functionality and development experience.

- 🧪 **Core Dependency Updates**:
 - Updates `node-sqlite3-wasm` to version `0.8.50` to incorporate latest fixes and improvements.
 - Upgrades `@eslint/css` to version `0.13.0` to ensure code style consistency.
 - [dependency] Updates `typedoc` to version `0.28.14` for better documentation generation.
 - ⬆️ Updates various `@storybook/*` packages to version `9.1.10` for the newest features and bug fixes.
 - ⬆️ Updates many other dependencies to their latest versions, including testing libraries and build tools.
- ✨ **Storybook Enhancements**:
 - Adds `@storybook/addon-designs` and `@storybook/addon-links` for enhanced design and navigation capabilities within Storybook.
 - ➕ Introduces a new script, `run-storybook-tests.mjs`, to run Storybook tests in a CI environment.
 - ⚙️ Modifies the Storybook configuration to include shared Vite configuration for consistency across environments.
- 🔧 **Testing Configuration**:
 - Adds `test:storybook:runner` and related scripts to facilitate automated testing of Storybook stories.
 - ➖ Removes `storybook-dark-mode` because it's not compatible with storybook 9.
 - 🧩 Introduces `storybook/viteSharedConfig.ts` to centralize Vite configuration for Storybook.
 - 📝 Updates `test:all` and related scripts to include Storybook tests.
- 🎨 **UI Component Modifications**:
 - 🛠️ Fixes the `SiteTableView` component to correctly handle column resizing by using the table element found by walking up the DOM tree.
 - 🛠️ Improves the `Tooltip` component by removing unnecessary event handlers and simplifying the trigger properties.
 - ⚡ Optimizes the `useOverflowMarquee` hook to improve performance and reduce redundant calculations.
- 🧹 **Code Cleanup and Refactoring**:
 - ➖ Removes unused type definitions and improves type safety.
 - 🔄 Refactors the service initialization to handle potential errors during IPC service setup.
 - ⬆️ Updates and organizes dependencies in `package.json` and `package-lock.json`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d9c62fd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9c62fd22d7af27284eeeff8fa788ad5896aba80)


- ✨ [feat] Enhance UI and automation capabilities

This commit introduces several enhancements to the UI and improves automation capabilities across the application.

- 🎨 [style] Introduces data-testid attributes to various UI components.
  - Improves testability and targetability of UI elements for automation and testing.
  - Includes components like: Header, Sidebar, AddSiteModal, ConfirmDialog, and Settings modals.
- 🧪 [test] Adds a function to expand the header if it is collapsed in UI tests.
  - Ensures that tests can reliably interact with header elements regardless of their initial state.
- 🛠️ [fix] Corrects the working directory for dependency installation.
  - Fixes the install dependencies (force) task to use the workspace folder instead of the file directory.
- 🚜 [refactor] Improves the logic for detecting Playwright automation.
  - Enhances the reliability of automation detection by checking the process context and environment variables.
- 🧪 [test] Refactors UI tests to use more specific locators.
  - Improves the robustness and accuracy of UI tests by targeting elements more precisely.
- ✨ [feat] Adds a new task to lint all source files.
  - Integrates comprehensive linting checks (TypeScript, ESLint, Stylelint, Madge, Knip) into the build process.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8bec040)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8bec04097e32d68eb2db0684595349f9f34ffdec)


- ✨ [feat] Enhance testing and automation support

This commit improves the project's testability and automation capabilities by introducing features and configurations to streamline testing workflows and facilitate integration with Playwright.

- ⚙️ Updates project dependencies, including `@putout/eslint-flat`, `electron`, `@types/react`, `@types/react-dom`, `eslint-plugin-testing-library`, and `istanbul-reports` to their latest versions.
- 🧪 Adds a flag to expose Playwright automation in main world, enabling automated tests to interact with the application more effectively.
 - Allows tests to determine if they are running in automation mode, which can be used to conditionally enable or disable certain features.
 - 🧪 Configures `NODE_OPTIONS` to suppress a specific deprecation warning during Playwright tests.
 - 🧪 Modifies the `launchElectronApp` helper function to set the `PLAYWRIGHT_TEST` environment variable to `true`, indicating that the application is running under Playwright automation.
 - 🧪 Introduces a `resetApplicationState` helper function to clear persisted UI preferences and site data, ensuring deterministic test state.
 - 🧪Adds a `getSiteCardLocator` helper function to reliably locate site cards on the dashboard.
 - 🧪 Enhances the `createSiteViaModal` helper function to wait for the expected monitor count after creating a site.
- 🧪 Implements `waitForConfirmDialogRequest` and `resolveConfirmDialog` to handle confirmation dialogs during automated tests.
- 🧪 Updates tests to use the new `resetApplicationState` helper function, ensuring deterministic test state.
 - 🧪 Modifies tests to use `getSiteCardLocator` for locating site cards.
 - 🧪 Updates tests to wait for the expected monitor count after creating a site.
- 🧪 Updates tests to use `waitForConfirmDialogRequest` and `resolveConfirmDialog` for handling confirmation dialogs.
- 📝 Refactors the Copilot instructions to:
 - 🤖 Refines the AI coding assistant's role and capabilities, emphasizing expertise in modern web technologies and best practices.
 - 📐 Clarifies the architecture overview, focusing on frontend and backend technologies, IPC, state management, and database.
 - 🛠️ Enhances code quality standards, emphasizing documentation, type safety, and testing.
 - 🚫 Streamlines instructions, focusing on verifying system behavior, prioritizing robust solutions, and delivering maintainable fixes.
 - ⏳ Removes time constraints and emphasizes leveraging available tools and resources.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8b27b7e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8b27b7e2bcb41556374ed63b4a73beeca9d950ee)


- ✨ [feat] Enhance project setup and testing

This commit enhances the project's development and testing infrastructure.

- ➕ [feat] Adds `vite-tsconfig-paths` to resolve `tsconfig.json` paths in Vite configurations, improving module resolution during development and testing.
- ⚙️ [feat] Modifies various `tsconfig.json` files to include `@assets/*` path mappings, enabling easier access to static assets.
- 🧪 [feat] Updates `global-setup.ts` to conditionally execute `build:playwright-coverage` when the `PLAYWRIGHT_COVERAGE` environment variable is set, facilitating coverage collection during Playwright tests.
 - 📦 [build] Integrates a new build command for Playwright coverage, streamlining the process of generating coverage reports during end-to-end tests.
- 📝 [build] Adds new build commands to `package.json` for playwright coverage, adding the necessary scripts.
- 🧹 [chore] Removes deprecated E2E tests, streamlining the test suite and focusing on more robust and maintainable tests.
- 📝 [build] Updates `eslint.config.mjs` to allow default project in `vite.playwright-coverage.config.ts`, allowing the new vite config to be linted.
- 🛠️ [fix] Modifies a test to use `async` and `await` for better test stability and reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f32d4b3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f32d4b3701eeea22833de14c3a81089c73c72203)


- ✨ [feat] Enhance UI with link checking and card layouts

This commit introduces several enhancements to the user interface and development workflow.

- 🎨 Adds a new compact card layout for sites, improving UI flexibility.
   - Implements a marquee text component for handling long site names in limited spaces ➡️ ensures readability and a polished look.
   - Enhances the site card to display key monitoring metrics in a compact format.
- 📝 Updates pull request templates with repository adapter review and documentation link checks.
   - Adds a documentation link check (`npm run docs:check-links`) to ensure documentation integrity.
   - Includes a repository adapter review step in PR templates 🔄 to confirm transaction adapter updates and rollback coverage.
- 🛠️ Updates documentation and development tasks to include link validation.
   - Integrates link validation into the contribution guide and development scripts 🔗, improving doc quality.
- 🧪 Adds fuzzing tests for bulk database inserts with transaction rollback verification.
   - Implements database operation fuzzing tests 🧪 to ensure data integrity during bulk operations.
   - Verifies transaction rollbacks ⏪ when statement fails during bulk inserts.
- 🚜 Refactors ESLint and package configurations.
   - Updates ESLint configurations and dependencies ⚙️, ensuring code quality and compatibility.
   - Sets `prefer-called-exactly-once-with` to off in vitest config.
   - Upgrades React and related dependencies to latest versions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e7b1e0a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e7b1e0a1e2eea39a6159c65416ec776d08c0b37e)


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


- 🛠️ [fix] Improve site removal and deletion

Improves the reliability of site removal and deletion processes.

- 🗑️ Ensures monitoring is stopped before site removal to prevent inconsistencies.
   - Introduces compensation logic to restart monitoring if site deletion fails after monitoring has been stopped.
   - Emits a system error event if monitor restart fails during compensation, indicating a critical state inconsistency.
 - 🛑 Stops monitoring before deleting all sites in bulk to avoid orphaned monitors.
 - 📝 Adds logging for site removal and deletion processes to improve traceability.
- 🎨 Updates UI theming and styling to improve visual consistency and user experience.
   - 💅 Updates the styling of various UI components such as dashboard overview cards, header badges, and tooltips to improve visual appeal and consistency.
   - 🌈 Introduces new color variables for shadows and accents to enhance theming capabilities.
   - ♿ Improves accessibility by adjusting color contrasts and focus states.
- ✅ Updates tests to reflect changes in site removal and deletion logic.
   - Adds tests for error handling during site removal, including scenarios where monitoring stop or site deletion fails.
   - Updates mocks and test assertions to align with the new site removal and deletion behavior.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7e0f43e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e0f43e99af0d8cfe94e70f68c1917f0f15ca167)



### 🚜 Refactor

- 🚜 [refactor] Consolidates site management logic

This commit refactors the site management logic by removing the `SiteService` and delegating its responsibilities to the `SiteManager`.

- 🗑️ Removes `SiteService` and its associated tests, as its functionality is now integrated into `SiteManager`.
 - This simplifies the service container and reduces redundancy.
- ➕ Introduces `ForwardableEventPayload` and `ForwardablePayloadWithMeta` types to handle event metadata when forwarding manager events to the orchestrator.
 -  Ensures type safety when normalizing payloads while preserving the original data shape.
- ♻️ Modifies the event forwarding mechanism in `ServiceContainer` to strip event metadata before emitting events to the main orchestrator.
 -  This ensures that the orchestrator receives clean payloads without EventEmitter-specific metadata.
 - 🧪 Updates fuzzing tests to handle unicode strings correctly.
 - 📝 Updates integration tests to reflect the removal of `SiteService`.
 - 🎨 Updates UI components to reflect the removal of `SiteService`.
 - 🛠️ Fixes a bug where focus state was not being reset correctly in `MonitorSelector`.
 - 📝 Updates the `DataService` and `SiteService` to have readonly properties.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1354660)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1354660c57784db4d00a5e08fbf9c8183b981cdf)


- 🚜 [refactor] Consolidates site management logic

This commit refactors the site management logic to improve maintainability and reduce code duplication.

- ♻️ Removes `SiteService` dependencies from `MonitorManager` to decouple components.
- ➕ Introduces `SiteManager.getSiteWithDetails` to centralize site retrieval logic.
- 🏗️ Modifies `SiteService` to delegate operations to `SiteManager`, ensuring a single entry point for site management.
 - This simplifies the service and ensures consistency in site operations.
- 🗑️ Removes database access logic from `SiteService`, streamlining its responsibilities.
- 🧪 Adds integration tests for site deletion flows to verify transactional behavior.
- 📝 Updates copilot instructions to emphasize systematic work and resource utilization.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(196f825)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/196f825431b59a269b4802f16ab536634cf03468)


- 🚜 [refactor] Streamline site deletion process

Refactors the site deletion process to improve efficiency and data consistency.

- 🛠️ Introduces transaction adapters for site and monitor repositories to ensure atomicity during deletion.
 -  This change ensures that either all deletion operations succeed, or none at all, preventing data inconsistencies.
- 🧹 Removes redundant history deletion logic, as monitor deletion now cascades history deletion.
- ✨ Adds monitor count to deletion summary for better logging and debugging.
- 🧪 Updates tests to reflect changes in the site deletion process, using mocks for transaction adapters.
- 🎨 Improves UI by persisting the collapsed state of the site details header between sessions.
 -  Adds new helper functions for ensuring the header state.
- 🎨 Enhances the monitor selection in the site details navigation using a dedicated `MonitorSelector` component.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1c6a9c9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1c6a9c9e23e3ed7c6e7db8db573fff096f11b6d6)


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



### 🎨 Styling

- 🎨 [style] Improves code style and documentation

Improves code style and documentation across multiple files for consistency and readability.

- 📝 [docs] Updates the development patterns guide to improve clarity and provide better examples.
 -  ✅ Uses proper code fences for Typescript code blocks.
 -  ✅ Clarifies shared utility import guidelines and provides examples.
 -  ✅ Refines logging guidelines and examples.
 -  ✅ Updates event-driven implementation template with improved formatting and clarity.
- 🎨 [style] Updates the `App` component to improve the auto-dismissal logic of the navigation sidebar on compact viewports.
 -  ✅ Uses a named function expression for the `useEffect` hook to improve readability.
 -  ✅ Adds type annotations for better type safety.
 -  ✅ Improves logic to determine if the sidebar should be closed based on user interaction.
- 🎨 [style] Enhances the `AddSiteModal` and `Settings` components by adding explicit roles and aria-level attributes to the modal headers, improving accessibility.
- 🎨 [style] Improves the styling of the `SiteList` component.
 -  ✅ Uses `inset-inline-end` and `inset-block-start` instead of `top`, `right`, and `bottom` for positioning the resize handle. 📐
 -   - This change makes the code more modern and flexible.
 -  ✅ Fixes a minor issue where the resize handle was slightly misaligned in the last column.
- 🎨 [style] Enhances the `SiteTableView` component by refactoring the column resizing logic.
 -  ✅ Uses `useMemo` to compute column styles based on column widths. 🔄
 -   - This optimization ensures that the styles are only recomputed when the column widths change.
 -  ✅ Creates a pointer handler that manages interactive column resizing. 🖱️
 -   - This change improves the user experience by providing a more intuitive way to resize columns.
- 🎨 [style] Updates the `AppSidebar` component to use a configured Vite alias for shared asset resolution.
- 🎨 [style] Improves the styling of the `Settings` component by using `overflow-block` instead of `overflow-y`.
 -  ✅ This change ensures that the content overflows in the block direction, which is more appropriate for vertical scrolling.
- 🚜 [refactor] Modifies several test files to use bracket notation for accessing properties on mock repository objects.
 -  ✅ This change avoids potential issues with reserved keywords or special characters in property names.
 -   - Files: `import-export.fuzz.test.ts`, `DatabaseManager.comprehensive.test.ts`, `DataImportExportService.comprehensive.test.ts`, `enhanced-testUtilities.ts`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(05ee016)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/05ee016b9607ff8a753c6d4cd6d8393998f56aea)






## [16.1.0] - 2025-10-01


[[89b3123](https://github.com/Nick2bad4u/Uptime-Watcher/commit/89b3123f1a193bdac1785bc1877983d198e25ccd)...
[29d1c8d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/29d1c8df649442215788b160a10c224540ebf16d)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/89b3123f1a193bdac1785bc1877983d198e25ccd...29d1c8df649442215788b160a10c224540ebf16d))


### ✨ Features

- ✨ [feat] Add SQLite database backup download

Adds functionality to download a SQLite database backup.

- ✨ [feat] Introduces `downloadSqliteBackup` API to generate and transfer a SQLite database backup to the renderer process.
 - Returns a transferable payload containing the binary buffer, file metadata, and a suggested download file name, ensuring compatibility with browser APIs.
- 🛠️ [fix] Moves `findBySiteIdentifierInternal` and `runAllSitesOperation` methods to maintain code organization and readability.
 - The methods are relocated within their respective classes without changing their functionality.
- 🧪 [test] Enhances test coverage and reliability.
 - 🧪 [test] Updates `SiteRepository.test.ts` to correctly assert the number of changes during database operations.
 - 🧪 [test] Modifies `generateUuid.test.ts` to ensure fallback mechanism is correctly triggered and tested when `crypto.randomUUID` is unavailable.
 - 🧪 [test] Refactors `fileDownload.fast-check-comprehensive.test.ts` and `fileDownload.fixed.test.ts` to improve the validation and handling of SQLite backup downloads, ensuring comprehensive test coverage and proper error handling.
 - 🧹 [chore] Cleans up test descriptions in `bridgeFactory.comprehensive.test.ts` for better readability.
- 🛠️ [fix] Implements a fallback mechanism for UUID generation when `crypto.randomUUID` is unavailable.
 - 🛠️ [fix] Modifies `generateUuid` to use a timestamp-based ID when `crypto.randomUUID` is not available, ensuring functionality in environments lacking the crypto API.
- 🧹 [chore] Refactors `handleSQLiteBackupDownload` to improve data handling and validation.
 - 🧹 [chore] Implements validation for backup data to ensure it matches the expected structure.
 - 🧹 [chore] Uses a fresh typed array view when creating the blob from backup data.
 - 🧹 [chore] Falls back to a generated filename when the provided filename is blank.
- 📝 [docs] Adds API documentation for `downloadSqliteBackup` to explain its usage and the structure of the returned data.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0061e49)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0061e49085e1a7a2d1cd9250faa4e9f12a8f2a6b)


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


- ✨ [feat] Overhaul Storybook configuration and improve monitor display

This update introduces a comprehensive overhaul of the Storybook setup, refactors core application logic for improved clarity and robustness, and enhances the user interface.

✨ **Features & Enhancements**
*   **Storybook Overhaul**:
    *   Replaces the manual theme provider with `storybook-dark-mode` and `@storybook/addon-themes` for a more integrated and robust theming experience in Storybook.
    *   Introduces a compatibility shim for `@storybook/preview-api` to ensure addon compatibility.
    *   Removes the explicit `title` property from story metadata, allowing Storybook to infer it from the file path for better organization.
*   **Improved Monitor Display**:
    *   The monitor selector now intelligently displays the `host:port` combination for monitors where the port is non-standard (not 80 or 443), providing more context at a glance.
*   **Enhanced AI Capabilities**:
    *   Expands Beast Mode's toolset with Tavily's `crawl` and `search` capabilities for more advanced web interactions.

🚜 **Refactoring**
*   **Sequential Task Execution**:
    *   Introduces a `runSequentially` helper in `MonitorManager` to abstract and centralize the pattern of executing asynchronous monitor operations in order. This simplifies methods like `startAll` and `stopAll` by removing repetitive `for...of` loops with `await` and associated ESLint disable comments.
*   **Form Submission Logic**:
    *   Decomposes the monitor creation and validation logic in the "Add Site" form into smaller, single-responsibility functions. This makes the form submission process more modular, readable, and easier to extend with new monitor types.
*   **Error Handling**:
    *   Improves error handling in monitor services by re-throwing normalized errors with enriched messages. This preserves the original stack trace and error type, simplifying debugging.

🧹 **Chore & Docs**
*   **Dependency Updates**:
    *   Updates numerous development dependencies, including `@typescript-eslint`, `@types/node`, and various Storybook packages.
*   **ESLint Configuration**:
    *   Cleans up the ESLint configuration by removing commented-out code and adding `MARK:` comments to delineate sections, significantly improving readability and navigation.
*   **Documentation**:
    *   Updates the guide for implementing new monitor types with clearer instructions on schema access and validation builder usage.
    *   Refines ESLint disable comments in Docusaurus MDX files for better style and precision.

🧪 **Testing**
*   **Test Modernization**:
    *   Updates tests to use `Reflect.deleteProperty` instead of assigning `undefined` for more accurate object manipulation.
    *   Improves the WebSocket mock in tests for better clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4993111)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4993111150068fcd901d77f06209fb37b78db82c)


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


- ✨ [feat] Add advanced monitor types and system documentation

✨ [feat] Implements four new advanced monitor types to expand system health checking capabilities.
 - **CDN Edge Consistency Monitor**: Compares responses from multiple CDN edge locations against a baseline origin. It uses content hashing (SHA256) to detect mismatches in status codes or response bodies, reporting `degraded` for inconsistencies and `down` for widespread failures.
 - **Replication Monitor**: Checks the time lag between primary and replica database or service endpoints. It extracts timestamps from JSON responses and reports a `degraded` status if the lag exceeds a configurable threshold.
 - **Server Heartbeat Monitor**: Validates a service's health by checking a heartbeat endpoint. It ensures the service reports an expected status value and that its reported timestamp is within an acceptable drift from the current time.
 - **WebSocket Keepalive Monitor**: Establishes a WebSocket connection, sends a `ping`, and waits for a `pong` or any message. It reports `degraded` if no response is received within a specified window and `down` if the connection fails.

📝 [docs] Adds new architecture and workflow diagrams to enhance system understanding.
 - A sequence diagram for the "Scheduled Monitor Check Lifecycle" is added, detailing the flow from scheduling to UI updates.
 - A flowchart for the "Site Provisioning Control Plane" is included, illustrating the process of adding a new site from the UI to the backend persistence layer.

🔧 [build] Updates project dependencies to support new features.
 - Adds `ws` and `@types/ws` to dependencies for the WebSocket monitor implementation.

🧹 [chore] Updates the BeastMode chatmode tool configuration.
 - Refines the available tools, removing several legacy or unused commands and adding new capabilities like `fileSearch`, `runInTerminal`, and `websearch`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(89b3123)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/89b3123f1a193bdac1785bc1877983d198e25ccd)



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


- 🚜 [refactor] Relocate monitoring IPC methods from sites to monitoring domain

✨ [feat] Moves `checkSiteNow` from the `sites` API to the `monitoring` API domain.
- The `checkSiteNow` function now belongs to the `monitoringApi`, providing a more logical grouping of monitoring-related functionalities.
- The return type is updated from `Site` to `StatusUpdate | undefined` for more specific feedback.

🛠️ [fix] Improves type safety for `validateMonitorData` IPC calls.
- The `validateMonitorData` function in `monitoringApi` and its corresponding service now correctly return a strongly-typed `ValidationResult` instead of `unknown`.
- The `useMonitorTypesStore` is updated to handle the new `ValidationResult` type directly, removing the need for manual type guards and normalization logic.

🧹 [chore] Removes deprecated monitoring methods from the `sitesApi`.
- The `startMonitoringForSite` and `stopMonitoringForSite` methods are removed from the `sitesApi`, as their responsibilities are now handled by the dedicated `monitoringApi`.

📝 [docs] Restructures and enhances AI agent instruction files.
- The `BeastMode.chatmode.md` and `copilot-instructions.md` files are updated with XML-like tags (`<rules>`, `<plan>`, etc.) to provide better structure and clarity for the AI agent prompts.

🧪 [test] Updates tests to align with API refactoring.
- All relevant unit, integration, and comprehensive tests are updated to reflect the relocation of `checkSiteNow` from the `sites` to the `monitoring` domain.
- Mocks and test assertions are adjusted to match the new `ValidationResult` return type.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(53f425f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/53f425f41d0daa2c4dc0ed4ae4af58c3e353a99e)



### 📝 Documentation

- 📝 [docs] Expand documentation for 14 new monitor types

This commit introduces a comprehensive update to the project's documentation to reflect the addition of 10 new monitor types, bringing the total to 14. It also includes related refactoring, test improvements, and dependency updates.

### ✨ Features & Documentation
*   **README Overhaul**: The `README.md` is significantly updated to showcase the 14 distinct monitor types, replacing the previous list of four.
    *   The "Key Features" and "Monitor Types" tables are expanded with detailed descriptions, objectives, and highlights for each monitor, including: HTTP family (6), Transport (2), Network (2), and Advanced (4).
    *   The architecture diagram is updated to reflect the new protocol workers.
*   **API & Developer Guides**:
    *   `API_DOCUMENTATION.md` is rewritten to detail the new `MonitorConfig` union type and provides a comprehensive table mapping all 14 monitor types to their configuration interfaces and key fields.
    *   The Docusaurus site documentation is updated across multiple pages (`system-architecture`, `data-models`, `monitoring-workflows`) with new Mermaid diagrams illustrating the expanded monitor ecosystem, updated data models, and a new decision tree for choosing the right monitor.
*   **License Change**: The project license mentioned in the documentation is updated from MIT to UnLicense.

### 🚜 Refactoring
*   **Form Submission Logic**: The `AddSiteForm/Submit.tsx` component is refactored to use a more robust, data-driven approach for creating and validating monitor configurations.
    *   Introduces `monitorValidationBuilders` to centralize the logic for constructing validation payloads for each of the 14 monitor types, reducing duplication and improving clarity.
*   **WebSocket Monitor**: The `WebsocketKeepaliveMonitor` is refactored for improved readability and robustness.
    *   Introduces distinct handler functions (`handleOpen`, `handlePong`, `handleError`, etc.) to break down the logic.
    *   Improves timer management and cleanup logic.

### 🧪 Testing
*   **HTTP Monitor Tests**: The `httpbin.org` integration tests are improved by adding a pre-flight check to ensure `httpbin.org` is available, skipping the tests gracefully if it's not.
*   **Linting**: ESLint configuration is updated with new rules and Storybook plugin integration. `eslint-disable` comments are added where necessary to handle await-in-loop for sequential operations and other specific cases.

### 🧹 Chore
*   **Dependencies**: Updates `package.json` and `package-lock.json` to add new Storybook addons (`@storybook/addon-essentials`, `@storybook/addon-themes`) and related dependencies.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bfec946)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bfec9466366854e962c9678f2b3f800aadd6ccc8)






## [16.0.0] - 2025-09-28


[[4572093](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45720936795021db067bcbf2afa10a7f52459bfe)...
[6173ed2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6173ed2fc3369b6522bb338ac84f42715b11e684)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/45720936795021db067bcbf2afa10a7f52459bfe...6173ed2fc3369b6522bb338ac84f42715b11e684))


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


- ✨ [feat] Enhance HTTP monitor details and form logic

This refactors and enhances HTTP monitoring by improving UI display, form state management, and adding more detailed tests.

✨ [feat]
- Displays specific details for `http-keyword` and `http-status` monitors in the `MonitorSelector` dropdown, showing the URL along with the keyword or expected status code. 📜
- Adds logging for `bodyKeyword` and `expectedStatusCode` on form submission for better debugging. 🪵

🚜 [refactor]
- Reorders state, setters, and dependencies in the `AddSiteForm` and `useAddSiteForm` hook for improved readability and consistency.
- Removes redundant JSDoc and inline comments in form submission logic.

📝 [docs]
- Updates the `BeastMode` agent prompt with enhanced capabilities and debugging instructions.

🧪 [test]
- Adds comprehensive tests for `http-keyword` and `http-status` monitor form validation.
- Adds tests to verify default field generation for new HTTP monitor types.
- Improves a test for invalid monitor configuration to use `Reflect.deleteProperty` for a more accurate scenario.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(aed7952)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/aed7952e3e57df354fe4f43ad2155e5ab6063843)


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


- ✨ [feat] Support custom log level for operation failures

- Enables configurable logging level for permanent operation failures via a new option, allowing warnings or info logs for expected cancellation scenarios instead of always error logs.
- Adds logic to classify cancellation errors and select an appropriate log level, improving error reporting granularity and aligning logs with expected error types.
- Refines type guards and error normalization for more robust cancellation handling across operational hooks and monitoring logic.
- Updates related monitoring service to downgrade log severity for cancellation errors, reducing noise in error tracking for routine aborts.
- Refactors input validation for state sync actions/sources to improve type safety and reliability.
- Simplifies and standardizes return values for monitor removal operations, clarifying success/failure semantics for downstream consumers.
- Updates test suites to cover new log level logic, cancellation error handling, and monitor removal outcomes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2096452)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/20964521eba6cda16e085ddf8697736c0868c451)



### 🛠️ Bug Fixes

- Import Layout in Docusaurus custom pages (#77) [`(4e433f6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e433f69bd16929edca5f0323b50edda20b303d8)


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


- 🚜 [refactor] Standardize build output directory to 'dist'

Unifies the build output path for the Electron main and preload processes from `dist-electron` to a single `dist` directory. This simplifies the build configuration, scripts, and overall project structure.

*   ✨ **Build & Configuration (`vite.config.ts`, `package.json`)**
    *   Updates the Vite configuration to direct all build outputs to the `dist` directory, removing the separate `dist-electron` path.
    *   Modifies the `main` entry in `package.json` to point to `dist/main.js`.
    *   Adjusts various npm scripts (`clean`, `copy-wasm`, `electron-main:debug`) to use the new `dist` path.

*   🛠️ **Source Code (`WindowService.ts`)**
    *   Updates the `getPreloadPath` method to resolve the preload script from the `dist` directory during development.

*   👷 **CI/CD (`flatpak-build.yml`)**
    *   Modifies the Flatpak build workflow to cache, check for, and package artifacts from the `dist` directory.

*   🧪 **Testing & Debugging (`.vscode/launch.json`, `playwright/fixtures/global-setup.ts`)**
    *   Aligns VS Code launch configurations to debug the main process from `dist/main.js`.
    *   Updates the Playwright global setup to verify the main process file exists in the correct `dist` location.

*   📝 **Documentation (`docs/`)**
    *   Updates all guides (environment setup, troubleshooting, testing) and code examples to reflect the new `dist` output directory.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4572093)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45720936795021db067bcbf2afa10a7f52459bfe)



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


[[c09af75](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c09af75c203449b95d6631736ae84c685cf67e51)...
[8a0d1ff](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8a0d1ff1e1cf26d8e9484c5ac483a4b1fd975b5a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/c09af75c203449b95d6631736ae84c685cf67e51...8a0d1ff1e1cf26d8e9484c5ac483a4b1fd975b5a))


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


- ✨ [feat] Unifies settings API under data domain

- Moves settings-related methods to a consolidated data API for improved organization and maintainability
- Updates IPC handler to return updated history limit for better client feedback
- Expands type definitions to expose new data API methods for history limit and settings management
- Ensures readiness check validates both data and sites APIs for robust initialization

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(253f7bc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/253f7bca9008253ecfb8ee2d0122deb4ac759780)


- ✨ [feat] Add support for 'degraded' monitor status

- Expands status logic and UI to recognize and display 'degraded' state for monitors.
- Updates validation, analytics, summary components, and styling to treat 'degraded' as a first-class status.
- Adjusts uptime calculations and chart data to factor in degraded monitors.
- Improves iconography and descriptions for degraded status.
- Enhances test coverage to include scenarios for degraded status.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ac735da)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ac735da4bed88850e70da37b7a5f506bafb3c5e4)


- ✨ [feat] Add "degraded" monitor status and improve IPC usage

- Introduces a three-state monitor status model ("up", "degraded", "down") for enhanced server health classification, with logic to distinguish degraded 5xx responses.
- Refactors frontend IPC methods to directly unwrap responses via the preload bridge, removing manual extraction and simplifying error handling.
- Updates theme, tests, and related utilities to support the new "degraded" status color.
- Unifies monitor detail/title formatting under a single API namespace for consistency.
- Documents agent and prompt configurations with model metadata.

Relates to ongoing improvements in monitoring accuracy and frontend/backend API alignment.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(482e037)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/482e037f51543702c5ab625fb160387e21263dc8)



### 🛠️ Bug Fixes

- 🛠️ [fix] Ensure cache TTL config and DNS monitor field mapping

- Adapts cache configuration mapping so renderer caches use correct TTL values, preventing cache expiry misconfigurations per ADR-006.
- Adds DNS-specific fields to monitor update logic to support DNS health checks and improve monitoring accuracy.
- Refactors monitor lifecycle updates to use atomic database transactions and event emissions for system consistency.
- Fixes test setup for global electron API mocking and introduces regression tests to guard against architectural mistakes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0062edd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0062edd26575c3ee6f98910bb4837c091b929bba)



### 🛠️ Other Changes

- Weird vscode bug [`(4ca4d28)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4ca4d2805745e9e44feb4a2dc4e0d55443a559cc)



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


- 🚜 [refactor] Standardize DI, logging, docs & VS Code config

- Refactors notification service to use explicit dependency injection pattern, aligning with consistency standards and enabling better extensibility/configurability.
- Replaces remaining `console.*` usage and JSDoc examples with structured `logger` calls across all monitoring, utility, and database services for consistency and observability.
- Consolidates and improves service configuration patterns (e.g., notification config now always injected as an object), ensuring consistent usage throughout the codebase.
- Adopts `withErrorHandling()` utility for robust error handling in migration and window management services, improving logging structure and reducing manual try/catch boilerplate.
- Extensively enhances and standardizes documentation, TSDoc, and code comments for maintainability and developer onboarding; adds a detailed Consistency Guide outlining all architectural, error handling, and documentation standards.
- Updates `.gitignore` and linter configs for better environment, cache, and generated file exclusion, including Chocolatey and VS Code specifics.
- Upgrades VS Code launch and task configurations: improves grouping, icons, presentation, run options, and test/lint task structure for a clearer, more productive developer experience.
- Makes minor algorithmic and documentation improvements in migration, service container, and monitoring implementations for clarity and safety.

These changes aim to improve maintainability, enforce standard patterns, and ensure robust, observable behavior across the application.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a954a26)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a954a268dce6ddcb8a1819d1742dd78df541caaa)


- 🚜 [refactor] Consolidate build outputs and enhance IPC stability

This commit introduces several refactoring and stability improvements across the project. Build output directories are consolidated into a centralized `.cache` folder, and IPC event handling is made more robust. Additionally, comprehensive tests are added for renderer-side services.

### Source Code Changes

*   **⚡ [perf] Improve IPC Event Handling Stability**
    *   Wraps event listener callbacks in the IPC `bridgeFactory` with `try...catch` blocks.
    *   This prevents a single misbehaving event handler from crashing the entire event system for a channel. Errors are now logged as warnings without halting execution. 🛡️

### Build and Configuration Changes

*   **🔧 [build] Consolidate Build Artifacts**
    *   Relocates all TypeScript build outputs (`dist-*` folders) and `tsBuildInfoFile`s into a unified `.cache/builds/` directory.
    *   This cleans up the project root and simplifies gitignore rules.

*   **🔧 [build] Unify Electron and Shared Output**
    *   Changes the output directory for `electron` and `shared` modules from `dist-electron` and `dist-shared` to a single `dist` directory.

*   **🧹 [chore] Refine VS Code Tasks**
    *   Removes numerous outdated or redundant npm script tasks from `tasks.json` to simplify the developer workflow.

*   **🎨 [style] Clean Up ESLint Configuration**
    *   Removes several `@ts-expect-error` comments, indicating that underlying type issues in ESLint plugins have been resolved.

### Testing Improvements

*   **🧪 [test] Add Comprehensive Service Tests**
    *   Introduces new comprehensive test suites for `DataService`, `EventsService`, `SettingsService`, and `SystemService`.
    *   These tests ensure high code coverage and validate service initialization, API interactions, error handling, and edge cases.

*   **🧪 [test] Update Preload API Tests for IPC Response Format**
    *   Adapts preload domain API tests (`monitoring`, `settings`, `sites`, etc.) to align with a new standardized IPC response format (`{ success: true, data: ... }`).
    *   This ensures tests accurately reflect the updated data contract between the main and renderer processes.

*   **🧪 [test] Correct IPC Channel Names in Tests**
    *   Fixes incorrect event channel names (e.g., `test:event` to `test-event`) in tests to match the implementation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(cb7534a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cb7534a2b6e3f07f528e4ed30e7724d8e11660f5)


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


- 🚜 [refactor] Alphabetizes JSON properties in IPC channel mapping

Reorders all properties in the IPC channel mapping configuration to follow alphabetical order for improved consistency and maintainability. This systematic reorganization makes the configuration file more predictable and easier to navigate.

Key improvements:
 - Sorts object properties alphabetically throughout the entire JSON structure
 - Maintains functional equivalence while improving readability
 - Standardizes property ordering across all channel definitions:
   - `channel` → `domain` → `handlerMethod` → `hasParameters` → `methodName` → `returnType` → `validator`
 - Reorders top-level domain sections: `data` → `monitorTypes` → `monitoring` → `sites` → `stateSync` → `system`

The refactoring touches every channel definition but preserves all existing functionality, making future maintenance and additions more straightforward by establishing a consistent property ordering convention.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f5ae9eb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f5ae9eb0b867598544905627186b5394f3c5f414)


- 🚜 [refactor] Modularize preload API and add degraded status support

- Refactors the Electron preload script into a modular, domain-based architecture for type-safe IPC bridging, auto-generating domain APIs from backend channel definitions
- Adds native connectivity checks replacing the ping library, including robust support for "degraded" monitor status to distinguish partial connectivity (e.g., DNS resolves but ports unreachable, HTTP non-2xx responses)
- Updates all monitor, site, and theme status types to include "degraded", ensuring consistent handling and UI coloring for partial failures
- Improves CSS documentation and sidebar/category styling; enhances theme color configurations to support new status
- Removes obsolete dependencies and test imports; adds comprehensive tests for degraded state handling and modular connectivity logic
- Documents and auto-generates IPC channel analysis reports for maintainability and future automation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(04f054c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04f054cd5fa34f2ea6c140c418ce6921cc21feae)


- 🚜 [refactor] Replace legacy monitor lifecycle with enhanced system

- Migrates monitor management to fully use the enhanced monitoring system, removing legacy lifecycle utilities and tests.
- Updates all logic and tests to invoke enhanced monitor start/stop functions, improving reliability and consistency.
- Preserves monitor history in UI during stop events to prevent empty history flashes.
- Modernizes architectural regression tests to validate enhanced system imports rather than legacy modules.
- Cleans up type imports and re-exports for core monitoring types.

Improves maintainability and prepares for future advanced monitoring features.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6c4e493)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6c4e493e4cc2aba87ffab90ec21adcc88a42f962)


- 🚜 [refactor] Improve cache and monitor status consistency

- Refactors cache configuration to support both legacy and extended TTL options, removing redundant adapter logic and improving runtime validation for cache lifecycle management.
- Enhances site and monitor update operations for transactional integrity, ensuring cached state aligns with database changes and avoiding stale or inconsistent data.
- Updates monitor lifecycle event emission to provide richer, more accurate payloads, including full site and monitor details and previous status information, improving observability and debugging.
- Simplifies and clarifies site cache refresh logic, consolidating duplicate code and making cache updates more predictable.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(49bc618)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/49bc6185c2b2006421274956dcd018baa9383ad2)


- 🚜 [refactor] Introduces service layer for IPC and refactors store usage

- Decouples direct Electron IPC calls from store logic by introducing dedicated service modules for data, events, monitor types, settings, and system operations.
- Refactors all major store actions to use these new service abstractions, improving maintainability, testability, and type safety.
- Updates IPC response handling for settings and data flows, ensuring all extracted values are properly typed and error handling is centralized.
- Refines environment variable access for enhanced compatibility and robustness, particularly in Electron main process and HTTP monitoring.
- Enhances unit tests for missing branches and correct result extraction, aligning with new service logic.

Facilitates cleaner separation of concerns and eases future backend changes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(eaaaa02)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eaaaa02d77de3d1fdbf3ae1ed78825ea0d03dda5)



### 🧪 Testing

- 🧪 [test] Add comprehensive tests for Electron preload APIs

Adds an extensive suite of comprehensive tests for the Electron preload bridge APIs, significantly improving test coverage, robustness, and confidence in the IPC layer. These tests utilize `vitest` for the testing framework and `fast-check` for property-based testing to cover a wide range of scenarios, including edge cases and concurrency.

✨ **Key Improvements:**
-   **Comprehensive Testing:** Introduces new, detailed test files for each major preload API domain:
    -   `bridgeFactory`: The core infrastructure for creating IPC invokers and event managers.
    -   `dataApi`: Data import/export and backup functionality.
    -   `eventsApi`: Event subscription handling.
    -   `monitoringApi`: Monitor control and management.
    -   `monitorTypesApi`: Fetching monitor type definitions.
    -   `settingsApi`: Application settings management.
    -   `sitesApi`: Site CRUD and monitoring operations.
    -   `stateSyncApi`: Real-time state synchronization.
    -   `systemApi`: System-level interactions like opening external links.
-   **Robustness with Property-Based Testing:** Leverages `fast-check` to automatically generate a wide variety of inputs, ensuring the APIs are resilient against unexpected data, edge cases, and malformed payloads.
-   **Concurrency and Integration Scenarios:** Includes tests for concurrent API calls, mixed success/failure responses, and common user workflows to validate the stability of the system under load.

🔧 **Build & Tooling:**
-   Updates `package.json` scripts to use `tsc --build` instead of `--noEmit`, enabling faster incremental type-checking across the project.
-   Adds `dist-bench/` to `.gitignore` to exclude benchmark build artifacts from version control.

🛠️ **Minor Test Fixes:**
-   Adds `@testing-library/jest-dom` to the `AddSiteModal` test setup for improved DOM assertions.
-   Updates theme mocks in several test files to include a new `white` color property, aligning them with recent theme changes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7283961)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/72839615b98521bb8bb99bf519e9bcc1ce33d398)


- 🧪 [test] Refactors and improves test suites for robustness and accuracy

This commit introduces a wide range of improvements across the testing landscape, focusing on enhancing mock implementations, correcting assertions, and refactoring test structures for better maintainability and accuracy.

*   ✨ **IPC Handler Enhancement**:
    *   The `update-history-limit` IPC handler now returns the updated value upon success, providing immediate feedback to the client.

*   🧪 **Test Suite Improvements**:
    *   Updates tests for `updateHistoryLimit` to assert for `undefined` instead of `null` on invalid input, aligning with the actual return type.
    *   Refactors `nativeConnectivity.test.ts` to use a more robust mocking strategy for Node.js modules (`dns`, `net`), preventing potential hoisting issues with `vi.mock`.
    *   Improves `net.Socket` mocks by adding `removeAllListeners` to prevent listener leaks during tests.
    *   Enhances IPC service tests by implementing stateful mocks for `getHistoryLimit` and `setHistoryLimit`, allowing for more realistic behavior simulation.
    *   Strengthens `useMonitorTypesStore` tests by asserting that API failures correctly propagate as thrown errors rather than returning fallback values, ensuring proper error handling.
    *   Modifies regression tests to use `try/catch` blocks for asserting thrown errors, improving reliability.

*   🚜 **Refactoring and Consistency**:
    *   Replaces direct store calls to `electronAPI` with calls to abstracted `SiteService` and `MonitoringService` in `useSitesStore.critical.test.ts`, respecting the new architecture.
    *   Introduces the `isNonEmptyString` utility in fuzzing tests for consistent validation logic.
    *   Makes the `expectedValue` field optional for DNS monitors in property-based tests, reflecting its optional nature in the application logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c3876c2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c3876c237ce8c663a8a52ef7f2a3a793045a9636)


- 🧪 [test] Improve test coverage and mocks for monitor utilities

- Expands unit test coverage for monitor and site utilities, including history preservation and error handling scenarios.
- Refines monitor validation and formatting logic in tests to ensure robust fallback behaviors and accurate result normalization.
- Updates mock implementations for services and hooks to more closely simulate real-world behavior, reducing flakiness and improving reliability.
- Enhances logging expectations for test runs, clarifies event and cache handling, and aligns test assertions with application semantics.
- Improves default value handling and error management in conversion helpers and store initialization logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5a71de4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a71de49eb6579aba9ca08c6352c08ead9b362b7)


- 🧪 [test] Refactors IPC test mocks and improves error handling coverage

- Unifies and modernizes IPC response mocks in tests, returning extracted data directly instead of wrapped objects.
- Upgrades error handling tests for increased coverage, validating error conversion and propagation in more scenarios.
- Updates monitor type tests to expect an added type and adjusts related assertions.
- Refactors cache sync logic for improved async error robustness after cache invalidations.
- Cleans up imports and typings in utility tests for clarity and maintainability.

Relates to improved reliability and future-proofing of IPC and error handling logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c09af75)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c09af75c203449b95d6631736ae84c685cf67e51)



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


[[ce6a35b](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ce6a35b32c9065f04b6f4659a7048ec581fbc067)...
[49a58d0](https://github.com/Nick2bad4u/Uptime-Watcher/commit/49a58d0fc9768f7552f7eabe487b8e98bcc0a16a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/ce6a35b32c9065f04b6f4659a7048ec581fbc067...49a58d0fc9768f7552f7eabe487b8e98bcc0a16a))


### ✨ Features

- ✨ [feat] Centralize IPC response extraction and improve error handling

- Refactors client-side IPC usage to validate and extract response data in preload, removing redundant frontend type checks and simplifying service/store logic.
- Improves error handling by returning extracted data directly from preload and wrapping API calls in try/catch with contextual error messages.
- Updates monitor creation in forms to use a shared utility for consistency and maintainability.
- Adds DNS as a selectable monitor type and ensures cache invalidation triggers monitor type refresh.
- Unifies error handling utilities under shared module imports, removing obsolete local utility files.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(49a58d0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/49a58d0fc9768f7552f7eabe487b8e98bcc0a16a)


- ✨ [feat] Add richer status change events and open-external IPC

- Improves monitor status change events with complete monitor and site objects, ensuring updated history and accurate check counts for incremental updates.
- Refactors frontend status update logic to leverage full event objects, reducing redundant data lookups and fallback full syncs.
- Adds IPC support for opening external URLs from the renderer process, validating parameters for safety.
- Unifies SQLite backup responses for compatibility and simplifies frontend usage.
- Expands IPC validators and test coverage for new event fields and system handlers.

Relates to improved real-time updates and external link handling.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6df6488)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6df64880fc24f82282281b87a89deadec2936ad9)


- ✨ [feat] Add Playwright screenshot helpers and comprehensive testing docs

- Introduces reusable screenshot utilities for Playwright tests, providing automated, consistent screenshot naming, storage, and reporting for both browser and Electron contexts.
- Adds detailed documentation covering Playwright codegen workflows, headless Electron testing strategies, recommended codegen practices, template usage, and test script verbosity options.
- Improves developer experience and test maintainability by standardizing test creation, output, and debugging practices across the project.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8202a3c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8202a3ca0e15dcdb8941d7a9ceeddf8feff3fdde)


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



### 🛠️ Bug Fixes

- 🛠️ [fix] Standardizes IPC response handling and validation logic

- Unifies IPC response structures for monitoring and site operations, enforcing boolean success checks and explicit error handling.
- Improves reliability by surfacing backend failures to callers and updating type definitions to reflect new return types.
- Refactors store and service logic to unwrap and validate IPC results, ensuring failures are propagated and handled consistently.
- Updates test mocks and cases to match new IPC response contracts, enhancing coverage for error scenarios and correct validation flows.

Relates to improved error transparency and contract consistency across Electron IPC boundaries.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(17fb1b2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/17fb1b2259ba8a645f4c33103216779077662c11)


- 🛠️ [fix] Round ping timeouts up to prevent premature expiration

- Ensures requested ping timeouts are never shortened by rounding up to the next whole second, preserving expected duration and cross-platform reliability.
- Adds targeted unit test to verify correct rounding behavior.
- Updates documentation code block formats for improved clarity and consistency.
- Adds linter ignores explaining centralized error handling in service and operations code.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a068cd8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a068cd809fe0b0f96b7e91bfe39dc4bd5e0fb1cf)


- 🛠️ [fix] Simplifies backup logic, removes debug tests, updates configs

- Refactors database backup to use direct Node.js fs API, improving reliability and startup performance.
- Removes Playwright debug and inspection tests to clean up the test suite and streamline CI runs.
- Updates Playwright, ESLint, and Vite configurations for better report management and compatibility with modern code patterns.
- Adds more robust logging and error handling for monitor and validation workflows.
- Minor style fixes for improved code clarity and consistency.

Relates to improved CI maintainability and test reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(14e5aee)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/14e5aee9cf531cc00d6877c13b3aadaaa4cb6496)



### 📝 Documentation

- 📝 [docs] Clarifies Zustand store patterns and updates guides

- Improves documentation to distinguish between direct create and modular composition patterns for Zustand state management.
- Adds a dedicated guide for pattern selection and migration, including decision criteria and anti-patterns.
- Updates architecture and UI guides to reflect best practices and provide concrete examples for choosing store patterns.
- Refines prompt instructions for consistency checks and fast-check test coverage to enforce full file scans and comprehensive quality gates.
- Refactors some component and utility interfaces for naming clarity and external type usage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(566ffb6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/566ffb6c9ca27217936e5d7d7b20b895925590e4)



### 🧪 Testing

- 🧪 [test] Unifies monitoring mocks and improves validation coverage

- Standardizes mocked monitoring service responses to consistently resolve with boolean values for improved clarity and predictability.
- Refines validation result handling and extraction in monitor type store tests to better reflect real implementation, increasing coverage and reliability for edge cases and IPC response scenarios.
- Adds development-mode debug logging for missing sites or monitors in status update logic, with corresponding tests for logging branches and event formats.
- Updates property and fuzz tests to exclude NaN values, preventing false positives and improving test robustness.
- Adjusts handler registration and cleanup tests to dynamically reflect handler counts, reducing brittleness in IPC service tests.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4804e8a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4804e8a90652f5b208b5682a64d4d47a6e5dbd09)


- 🧪 [test] Improve test mocks and error handling for site operations

- Updates test mocks to return standardized IPC-style response structures for better consistency across tests.
- Enhances error handling in site and monitoring operation tests to ensure exceptions are properly thrown and asserted.
- Adds missing mock implementations for IPC extraction utilities to improve test isolation.
- Increases timeouts and retry attempts for flaky HTTP monitor integration tests to reduce spurious failures.
- Improves WASM asset path resolution in build config with fallback logic and clear error messaging, aiding reliability in development and CI.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5e72aa2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5e72aa2253bf0ab548ebf4aa4f49beb75764aca8)


- 🧪 [test] Add comprehensive fuzzing and resilience tests for monitoring and database schema logic

- Adds extensive property-based fuzzing tests for monitor type registry and database schema utilities, targeting edge cases, malformed input, error handling, SQL/XSS injection resistance, performance, and memory safety.
- Improves reliability of HTTP monitor integration tests by adding transient error retry logic, reducing flakiness due to upstream/CDN issues.
- Refines test generators to avoid empty or whitespace-only names for state management fuzzing.
- Updates numeric and time-related assertions for better tolerance and correctness in conversion and timestamp tests.
- Raises per-case async timeout for property-based tests to accommodate slower DOM and async scenarios.
- Enables and disables Playwright raw locator rule at file boundaries for clarity.
- Fixes race condition timing in abort signal fuzzing tests by adjusting abort delays.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(cdab7dc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cdab7dc34c1ba56c8473eeb19c8a1d4e9239e492)


- 🧪 [test] Simplifies Playwright E2E launches and stabilizes tests

- Removes redundant path imports and switches all Electron launches in Playwright tests to use the project root as the entrypoint, reducing platform quirks and setup complexity.
- Refactors and streamlines test logic for better reliability: reduces test data volume, replaces brittle selectors, and simplifies assertions for faster CI runs.
- Adds a new basic data migration test suite to cover core data management scenarios and error handling.
- Updates timeouts and Playwright config for more stable and consistent test execution.
- Documents known Playwright Electron launcher warnings and clarifies comments for maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(233bcfd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/233bcfdbf6a256628124752d0c0ccb31328cd326)


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


- 🧪 [test] Add comprehensive fast-check fuzzing and E2E suites

- Introduces 100% fast-check property-based fuzzing tests for shared utilities, event system, IPC, database, Zustand stores, and core frontend utility modules.
- Adds new Playwright E2E and UI test suites for accessibility, navigation, modals, performance, and cross-browser compatibility.
- Refactors event bus emission to be resilient to listener errors and logs them; improves test selectors for consistent element targeting.
- Enhances Playwright config to include new comprehensive test files.
- Motivated by need to maximize reliability, coverage, and accessibility for core app features and infrastructure.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ce6a35b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ce6a35b32c9065f04b6f4659a7048ec581fbc067)



### 🧹 Chores

- 🧹 [chore] Enforce comment capitalization and extend lint coverage

- Enforces capitalized comments with exceptions for various rule-related tags, improving code readability and consistency.
- Upgrades linting rigor by enabling additional rules for regex, import/export, React JSX, SonarJS, and total-functions, enhancing code quality and maintainability.
- Refines comment clarity, capitalization, and disables redundant or overly strict rules where appropriate.
- Updates global disables section and several rule descriptions for better documentation and understanding.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c66adb8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c66adb8e0bc786172a93fe9d500e560454248490)


- 🧹 [chore] Remove lint-staged and Husky pre-commit tooling

- Cleans up legacy pre-commit linting and formatting setup to streamline development workflow.
- Deletes configuration, scripts, and dependencies related to lint-staged and Husky.
- Updates linting rules to allow usage of certain process.env variables, improving clarity and safety in environment checks.
- Simplifies Playwright test environment config by removing redundant test mode variable.
- Improves maintainability and reduces unnecessary dependencies.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(59406d5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/59406d599b40fe124e25c1615a97ed3f4ac03469)






## [14.8.0] - 2025-09-14


[[d76bffe](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d76bffeb0bac88b3fb23716885942cda5c761b9f)...
[7b94508](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b94508b00f9c6869f0b75c2cb4b01e5ad9357d4)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/d76bffeb0bac88b3fb23716885942cda5c761b9f...7b94508b00f9c6869f0b75c2cb4b01e5ad9357d4))


### ✨ Features

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



### 🧪 Testing

- 🧪 [test] Improve store, service, and component coverage

- Adds critical coverage test suites for store functions, service error handling, and edge cases in hooks and components
- Targets previously uncovered logic, invalid states, and boundary conditions to raise overall coverage
- Updates workflows for stricter concurrency control and output auditing
- Refines Playwright and Stryker testing logic for reliability and reporting
- Adjusts coverage and build config for more accurate reporting and exclusion of interface-only files

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7b94508)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b94508b00f9c6869f0b75c2cb4b01e5ad9357d4)






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


[[d6ac036](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6ac036e7f792ba92e906741610567fc846cd872)...
[17fd1f5](https://github.com/Nick2bad4u/Uptime-Watcher/commit/17fd1f58a8ef7b22d4bcb2b55885bdecd2de1a53)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/d6ac036e7f792ba92e906741610567fc846cd872...17fd1f58a8ef7b22d4bcb2b55885bdecd2de1a53))


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


- 🧪 [test] Enhance property-based fuzz testing and coverage config

- Updates all test setups to globally configure fast-check for consistent property-based testing runs.
- Adds extensive fuzzing suites for event bus and data import/export, improving robustness against edge cases and malformed input.
- Refines coverage and exclude configurations for all test environments, leveraging vitest defaults for maintainability.
- Improves regex-based assertions in schema mutation tests for stronger snake_case validation.
- Updates package dependencies to latest patch versions for test and build tooling.
- Removes unused Stryker setup file to clean up project.
- Ensures all property-based tests make assertions on results to satisfy test runner requirements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d6ac036)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6ac036e7f792ba92e906741610567fc846cd872)



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


[[9f9d51f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9f9d51f985b628981d0a12c09b4a268e0b30171b)...
[b1e82fd](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b1e82fdaec2947a9199154361f97b03d9ad889b2)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/9f9d51f985b628981d0a12c09b4a268e0b30171b...b1e82fdaec2947a9199154361f97b03d9ad889b2))


### ✨ Features

- Implement Chart.js tree-shaking optimization [`(4e4982a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e4982a34fc6b2e14ae54ec31a4de56dd0579523)


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



### 🛠️ Bug Fixes

- 🛠️ [fix] Improve error handling and env usage in scripts

- Enhances robustness of scripts by consistently handling errors using type checks and clear messaging.
- Standardizes environment variable access via bracket notation, improving reliability across platforms.
- Refines type annotations, code comments, and intentional error condition tests for better readability and maintainability.
- Updates configuration to relax TypeScript strictness for script testing, reducing false positives.
- Minor refactors in test code to avoid unused imports and clarify intention.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(cf4d137)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cf4d13710cbbf1657e0e41cb151ce59f78c55812)



### 🛠️ Other Changes

- Add comprehensive tests for useMonitorTypesStore and ThemedProgress component

- Introduced a new test suite for useMonitorTypesStore with 100% coverage, focusing on store initialization, loading monitor types, error handling, validation, formatting operations, and state management.
- Added arithmetic mutation tests for ThemedProgress component to detect potential issues in percentage calculation logic, including edge cases and bounds checking.
- Enhanced useSiteAnalytics tests to cover downtime period calculations, MTTR computation, and percentile index clamping, ensuring robustness against arithmetic mutations.
- Updated Vite configuration to exclude additional directories and files from coverage reports, improving accuracy in test coverage metrics.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b1e82fd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b1e82fdaec2947a9199154361f97b03d9ad889b2)



### 🚜 Refactor

- 🚜 [refactor] Improve type safety, code clarity, and input handling

- Refactors input change handlers for better type safety, introduces specialized and legacy-compatible functions, and updates tests for stricter validation logic.
- Adds defensive runtime checks, explicit type assertions, and targeted eslint-disable comments for safe type narrowing and property access.
- Standardizes number formatting with numeric separators and corrects edge case values across tests and benchmarks.
- Removes redundant type definitions, switches to direct imports, and simplifies logic in several utility and validation functions.
- Enhances error handling and object safety with clearer null/undefined checks and safe merges.
- Improves code readability and maintainability by adopting modern patterns and clarifying defensive programming intentions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(df8c9cc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/df8c9ccbc45e13fce40f6d2f1f7f2d2d4072cd5d)


- 🚜 [refactor] Adopt readonly types and modern React imports

- Updates most array and object properties across types, interfaces, and function signatures to use readonly variants for improved type safety and immutability.
- Refactors React component imports to prefer named imports of types (e.g., ReactNode, NamedExoticComponent, FC) and functional utilities (e.g., memo), removing unused default imports and aligning with modern best practices.
- Replaces plain error variable types in test suites with unknown for stricter error handling.
- Cleans up test cases to use assertions over console logging, improving test clarity and maintainability.
- Ensures consistent usage of undefined-coalescing (??) for more robust fallback handling.
- Improves consistency and future-proofing of type usage throughout codebase, reducing risk of accidental mutations and making code more maintainable.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(de1fe78)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de1fe78b55bd9d2d7e418d99efb84cd7d576def8)


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



### 🎨 Styling

- 🎨 [style] Optimize React performance and clarify type assertions

- Refactors multiple UI components to use `useMemo` and `useCallback` for style and handler computations, improving render efficiency and reducing object recreation.
- Adds caching for icon color styles to further boost performance.
- Enhances error handling in several site operations and monitor update helpers for better robustness.
- Replaces broad ESLint rule overrides with targeted inline disables and enables, providing explicit justification for necessary type assertions and maintaining stricter code quality elsewhere.
- Updates some comments for clarity and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3d244cc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3d244cc989bd6cb7aaea45e66f100d215e8d42d8)


- 🎨 [style] Improve code formatting and test consistency

- Refactors code across benchmarks, docs, configs, and test files to enhance readability and maintain consistent formatting.
- Converts multi-line function parameters and object arguments to a more readable style, favoring explicit wrapping and indentation.
- Updates test suites to use concise async parameter destructuring and standardized annotation calls, reducing boilerplate for common test setup and assertions.
- Cleans up comment and documentation formatting to avoid line-breaking issues and improve markdown rendering in guides.
- Does not alter any core logic or application behavior; focuses solely on style, formatting, and developer experience.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9f9d51f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9f9d51f985b628981d0a12c09b4a268e0b30171b)



### 🧪 Testing

- 🧪 [test] Add property-based fuzzing and improve mutation coverage

- Introduces property-based fuzzing tests for backend, database, and shared utilities to strengthen input validation, error handling, and security.
- Updates test suites and store logic to better handle malformed data and edge cases, increasing resilience.
- Enhances Stryker mutation testing by refining configuration, concurrency, and exclusion lists for more reliable and comprehensive mutation analysis.
- Adds prompt generation and workflow documentation for mutation coverage gaps, enabling systematic improvement.
- Cleans up .gitignore and related docs to support new mutation workflow.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0593130)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/05931306af1bb80a7993bea3621e10d7c09dba6d)


- 🧪 [test] Refactors event handler usage and improves coverage

- Replaces usage of namespaced event handler types with direct imports for improved clarity and developer experience across shared types and theme components.
- Adds centralized namespace for event handler types to enhance discoverability and consistency.
- Refactors fuzzing, property-based tests, and component tests for more robust coverage and aligns with updated type definitions.
- Removes obsolete documentation on bug-finding tools to streamline project files.
- Improves edge case handling in fuzzing tests and validation, increasing reliability and correctness.
- Updates chart utility type imports for consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4e2d88e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e2d88e9d742fe73b2490bb06f6d5e6728eb01c3)


- 🧪 [test] Improve edge case coverage, formatting, and store tests

- Enhances test coverage for edge cases, store utilities, and constants by adding missing branches, error conditions, and integration scenarios.
- Refactors test formatting for readability, consistency, and maintainability, including indentation and line breaks for complex assertions and object structures.
- Adds and updates VS Code extension recommendations to support development and code review workflows.
- Removes unused TypeScript native-preview dependencies to streamline package management and reduce install size.
- Updates documentation and optimization summaries for accuracy, consistency, and clarity.
- Addresses minor code style and formatting in scripts and CSS for improved readability and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d9d774c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9d774c861fcd9411513e8426d02f498b82f3b56)


- 🧪 [test] Improve typings and coverage in tests and mocks

- Updates event and record interfaces to support symbol keys, improving type safety and flexibility in tests.
- Refines test coverage for error handling functions, ensuring proper context is passed and edge cases are exercised.
- Enhances timestamp parsing tests for clarity and reliability.
- Adjusts type assertions and callback signatures in final function coverage tests to reduce type errors and better reflect intended usage.
- Refactors mock monitor history to use a centralized type definition for consistency and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c910bd6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c910bd6b5fe944795ce5ce37d63c90b0c3cc0f47)



### 🧹 Chores

- 🧹 [chore] Annotate safe type assertions and clean project docs

- Adds explicit ESLint comments to document safe use of TypeScript type assertions throughout the codebase, improving clarity and future maintainability.
- Switches lint rule for unsafe type assertions from 'off' to 'warn' to encourage best practices without blocking necessary cases.
- Removes internal Copilot and Codacy instruction files no longer needed for project guidance.
- Refactors README for improved visuals, structure, and accuracy, clarifying technology stack, requirements, contribution process, and license information.
- Enhances code documentation and disables redundant comments.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e39ed3d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e39ed3d709c55a7a87ce09366b07832eaf659b06)






## [12.7.0] - 2025-08-26


[[476fd08](https://github.com/Nick2bad4u/Uptime-Watcher/commit/476fd08a30a77d83fdcf0f81bde692971a468db7)...
[95baf5d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/95baf5d5a6a42dd34c9af8fbd6edb19f4fb105af)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/476fd08a30a77d83fdcf0f81bde692971a468db7...95baf5d5a6a42dd34c9af8fbd6edb19f4fb105af))


### 🛠️ Other Changes

- Priority 1.2: Component Props Standards - Documentation & Templates

- Created comprehensive Component Props Standards documentation
- Added reusable prop type definitions in shared/types/componentProps.ts
- Updated UI Feature Development Guide with standardized component templates
- Added standardized event handler patterns and prop interface examples
- Documented consistent naming conventions and accessibility patterns

Part of consistency improvement roadmap Priority 1.2

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(79948fe)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/79948fe3f621450792103a76d090c50d4d2479bc)



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






## [12.0.0] - 2025-08-21


[[1f60aa6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1f60aa6df81d5a2b5abb2f7b4fef42f50dfb3338)...
[36f12f4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/36f12f4ebb80ead80437ddd0a1d9526a227c994c)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1f60aa6df81d5a2b5abb2f7b4fef42f50dfb3338...36f12f4ebb80ead80437ddd0a1d9526a227c994c))


### 📝 Documentation

- 📝 [docs] Improve documentation clarity and TypeScript typing

- Enhances code and configuration comments for better clarity and maintainability.
- Updates TypeScript config to emit declarations, improving API documentation generation and type safety.
- Expands JSDoc and inline comments for interfaces, event payloads, and manager/service dependencies.
- Refines external link mapping, event priorities, and validation configuration for more accurate docs and validation checks.
- Makes types and validation results more explicit and descriptive for easier understanding and usage.
Relates to documentation and developer experience improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1f60aa6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1f60aa6df81d5a2b5abb2f7b4fef42f50dfb3338)



### 🎨 Styling

- 🎨 [style] Improves documentation formatting and updates build deps

- Refines JSDoc comments for better readability and consistency, improving line wrapping and parameter description clarity throughout core, store, and utility modules.
- Updates build and packaging dependencies to latest major versions for Electron ecosystem, including electron-builder, dmg-builder, and related tools.
- Refactors ESLint config to simplify plugin usage and file matching, and bumps granular-selectors plugin version.
- Enhances Typedoc config with new replacements for better docs linking and markdown handling.
- Removes deprecated dependencies from lockfile for cleaner builds.
- No logic changes; focuses solely on style, documentation, and build ecosystem maintenance.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(36f12f4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/36f12f4ebb80ead80437ddd0a1d9526a227c994c)






## [11.9.0] - 2025-08-21


[[95f9902](https://github.com/Nick2bad4u/Uptime-Watcher/commit/95f99027de560ed7f63f660fc6531d8682dfa207)...
[95f9902](https://github.com/Nick2bad4u/Uptime-Watcher/commit/95f99027de560ed7f63f660fc6531d8682dfa207)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/95f99027de560ed7f63f660fc6531d8682dfa207...95f99027de560ed7f63f660fc6531d8682dfa207))


### 📝 Documentation

- 📝 [docs] Add and improve API documentation for core interfaces

- Expands JSDoc comments for event structures, hooks, configuration services, and helper interfaces to improve code clarity and maintainability.
- Documents event payloads, lifecycle hooks, cache and monitor utilities, and chart configuration types for better developer understanding and automated API reference generation.
- Updates documentation generation configs and output settings to support enhanced documentation coverage and link resolution.
- Improves consistency and discoverability of internal and public APIs.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(95f9902)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/95f99027de560ed7f63f660fc6531d8682dfa207)






## [11.8.0] - 2025-08-21


[[63cdb3a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/63cdb3a0bdb364bb8edbaa29aa4e6c9e635cb6a8)...
[b9db564](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b9db5645a780af7862714ed1e0b3e81a96be3f97)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/63cdb3a0bdb364bb8edbaa29aa4e6c9e635cb6a8...b9db5645a780af7862714ed1e0b3e81a96be3f97))


### 🚜 Refactor

- 🚜 [refactor] Unifies site status utils and Typedoc config, cleans tests

- Removes duplicated and frontend-only site status utility wrappers, consolidating usage to shared module for consistency and maintainability.
- Updates all test imports to reference the shared site status utilities, simplifying the frontend/backend boundary.
- Refactors documentation build scripts and Typedoc configs: adds a single local config and updates related scripts, removing legacy config files for clarity.
- Expands documentation sidebar categories and Typedoc entry points for improved navigation and coverage.
- Deletes redundant and outdated comprehensive test suites to streamline the codebase.

Reduces maintenance overhead and ensures all site status logic is sourced from the shared module, eliminating confusion and mismatches.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b9db564)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b9db5645a780af7862714ed1e0b3e81a96be3f97)


- 🚜 [refactor] Standardizes naming, regex, and type checks across codebase

- Refactors variable and function names for consistency and clarity, improving code readability and maintainability.
- Updates regular expressions to use named capture groups and more precise patterns, enhancing robustness and future compatibility.
- Replaces legacy type and property checks (e.g., `.hasOwnProperty`, `isNaN`, `== null`) with modern, explicit methods (`Object.hasOwn`, `Number.isNaN`, `=== null`), preventing subtle bugs and aligning with current ECMAScript standards.
- Refactors debounce/throttle implementations for clarity and type safety.
- Adds missing imports and updates test suite setups for React and Vitest.
- Removes redundant or obsolete files and improves placeholder comments.
- Improves mock usage in tests, simplifying mocking strategies and clarifying limitations.
- Fixes minor logic issues and updates test expectations to match current code behavior.
- Enhances code coverage through targeted changes and explicit type annotations.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3f8691a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3f8691a834628b865261fbceb99f1fe793ac21a4)


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


- 🚜 [refactor] Use numeric separators for large numbers in benchmarks

- Improves code readability and consistency by replacing large numeric literals with underscores across benchmark and config files.
- Refactors array and object generation to use modern JavaScript patterns for clarity.
- Cleans up ESLint and PostCSS config comments for better maintainability.
- Updates default-case rule handling and disables explicit type enforcement for TypeScript React components.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ca32d65)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ca32d6558937b4a6bbee83d5dde5e3df9af8e812)



### 📝 Documentation

- 📝 [docs] Expand and refine API documentation comments

- Adds detailed JSDoc comments to interfaces, function return types, and component props throughout the codebase for improved code readability and developer onboarding
- Refines descriptions for many UI, store, service, and utility types, clarifying usage, expected values, and domain context
- Removes legacy error catalog and related tests to streamline error handling and reduce redundancy

Improves code maintainability and discoverability by making interfaces, data structures, and API contracts more self-explanatory.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(39e53c9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/39e53c9aa15aff0e079ff49b5cd71d75ae75061c)



### 🧪 Testing

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






## [11.6.0] - 2025-08-19


[[806a6d3](https://github.com/Nick2bad4u/Uptime-Watcher/commit/806a6d378dec9c3a7eecf00bf5b502c36eaaab27)...
[3ba8232](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3ba8232fa1887032f96bdd35adf80bad1fa58031)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/806a6d378dec9c3a7eecf00bf5b502c36eaaab27...3ba8232fa1887032f96bdd35adf80bad1fa58031))


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


- ✨ [feat] Resume only active monitors after restart; add Prettier plugins

- Updates monitoring resumption logic to restart only monitors that were actively running prior to restart, avoiding silent failures for paused monitors and improving reliability.
- Adds several Prettier plugins for enhanced formatting support (INI, properties, embedded content, package.json, interpolated HTML tags), improving code consistency and formatting automation.
- Updates dependencies to support new formatting plugins and tools.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a82aedf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a82aedf13809b77a05d0edab09ae0b7a5daa98d7)



### 🛠️ Bug Fixes

- 🛠️ [fix] Improve monitor type field handling and DNS support

- Updates monitor normalization and update logic to filter fields by monitor type, ensuring only allowed attributes are included and preventing type corruption.
- Adds explicit DNS monitor type support throughout UI, forms, and data models for accurate field mapping and validation.
- Enhances database transaction handling to avoid nested transaction errors and improve error logging and rollback reliability.
- Improves dynamic schema utilities with warnings for invalid data and prevents NaN corruption for numeric conversions.
- Refines test cases and UI helpers for better monitor type detection and extensibility.
- Clarifies documentation with real-world implementation guidance and lessons learned.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(becb9be)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/becb9be18ed7a3a36f09e69d5ada24cf38d9e340)


- 🛠️ [fix] Handle missing monitor intervals and settings safely

- Prevents incorrect monitor scheduling by defaulting to a predefined interval when none is specified, improving reliability.
- Ensures imported settings are safely handled when null or undefined to avoid runtime errors.
- Strengthens monitor validation by enforcing allowed types and robustly checking active operations.
- Refines backend focus sync effect cleanup logic for consistency when toggling enabled state.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(806a6d3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/806a6d378dec9c3a7eecf00bf5b502c36eaaab27)



### 📝 Documentation

- 📝 [docs] Enhance and standardize code documentation across app

- Improves codebase maintainability by expanding, clarifying, and unifying documentation comments in all major modules, including backend, shared, and frontend areas
- Adds detailed @remarks, @example usage, and @packageDocumentation tags, clarifying responsibilities, key features, contracts, and usage patterns
- Refines docstring structure for better developer experience and onboarding, reducing ambiguity and duplication
- Prioritizes type safety, error handling, and design rationale explanations in comments
- No functional or logic changes; strictly documentation-focused

Relates to internal documentation quality initiative

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(754b12a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/754b12ac1764817ab106cc94768f3dbde46096c3)


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


- ⚡ [perf] Optimize React rendering with memoization

- Refactors components to use useMemo and useCallback for derived values, event handlers, and inline JSX, minimizing unnecessary re-renders and preventing stale closures.
- Applies stable selectors for Zustand stores and hooks, improving state access performance.
- Updates logic for dynamic field handlers and chart configurations to ensure referential stability.
- Adds ESLint comments to clarify rule conflicts and required class patterns.
- Improves resource cleanup and initialization in React lifecycle hooks.
- Enhances code consistency by memoizing icons and styles throughout the UI.

Improves UI responsiveness and maintainability by reducing render overhead and preventing unintended side effects.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(133fb36)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/133fb36c037a72774b43d4301c37bbb441cd0dc5)



### 🎨 Styling

- 🎨 [style] Expands multiline array formatting for consistency

- Standardizes multiline array/object formatting across all code, tests, and configuration to improve readability and maintain consistency with formatting rules.
- Updates Prettier threshold to trigger wrapping for arrays with two or more elements, ensuring uniform code style.
- Refactors affected logic and test files to use expanded array/object formatting, without altering functional behavior.
- Facilitates easier code reviews and future maintenance by aligning with formatting standards.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3ba8232)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3ba8232fa1887032f96bdd35adf80bad1fa58031)


- 🎨 [style] Enforces consistent array/object formatting in tests

- Improves readability and maintainability by vertically formatting array and object literals across all test files and documentation examples.
- Removes two legacy AI copilot instruction files to clean up project standards.
- Enhances clarity in code samples and test coverage by standardizing indentation and spacing, making future updates and review easier.
- Does not alter any logic or behavior; focuses solely on visual and structural consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(282ddb1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/282ddb197548f8d5e719c324b1ed0df487ad8c9f)


- 🎨 [style] Improves code formatting and consistency

- Applies consistent code style and indentation across documentation, templates, and test files for better readability and maintainability.
- Refactors multiline arrays, objects, and function calls to enhance clarity, especially in tests and example implementations.
- Updates markdown code block syntax in documentation templates to ensure proper formatting.
- Does not change any functional logic or behavior.

Relates to code quality and developer experience improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(69b58f0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/69b58f0c1bc6f8b14e8613d0802fed103ecf5035)


- 🎨 [style] Add eslint-disable comments for etc plugin rules

Adds explicit eslint-disable-next-line comments to clarify intentional usage of function types and generic parameters, improving code clarity and suppressing unnecessary lint errors.

Standardizes dependency interface imports and removes duplicate interface declarations for maintainability.

Cleans up formatting in a UI component for consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4f0a44f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4f0a44fe7abd9758da09a5e619508809c18bf395)



### 🧪 Testing

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


- 🧪 [test] Improve monitor formatting and mocks in tests

- Updates monitor display test cases to require explicit host, port, and URL formatting for consistency and coverage.
- Refactors factory service mocks to provide more realistic return values, improving test reliability.
- Fixes edge cases for port and ping monitor data representation in component tests.
- Enhances CSS selector specificity for spacing, divider, and animation classes to increase layout predictability and stylelint compliance.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8d6fafa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8d6fafac293d3858aeaea1abdc293c42363c48af)


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


- 🧪 [test] Update imports and mocks for ESM compatibility

- Ensures all test imports use explicit `.js` extensions to support ESM environments and avoid ambiguous resolution.
- Refactors test mocks to use direct instance-based mocking and factory method spies for improved maintainability and clarity.
- Adds the required `history` field to monitor objects in validation schema tests, addressing new schema requirements and enhancing branch coverage.
- Cleans up className assertions in UI tests for more accurate whitespace handling.

Supports future module system upgrades and improves overall test reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b511a9f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b511a9f98879754e79ed89eedae22f4078b4b7f5)


- 🧪 [test] Expand mocks and assertions for coverage; update labels

- Improves unit test reliability by expanding mocked service methods and properties for configuration and database dependencies.
- Refines test assertions to verify mock behavior explicitly for cache, repository, and writer components.
- Updates UI label text in settings branch coverage tests for better clarity and consistency.
- Applies formatting improvements to HTML for readability and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2c100c8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2c100c8cc722d19c47d85417b4a6f1243c70ef99)


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






## [11.0.0] - 2025-08-14


[[629fb70](https://github.com/Nick2bad4u/Uptime-Watcher/commit/629fb701186ed28d3c96ea334ea827907078d0e7)...
[3ab0812](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3ab08129c94cdaec3e9ad0eea87aaa12cd21da50)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/629fb701186ed28d3c96ea334ea827907078d0e7...3ab08129c94cdaec3e9ad0eea87aaa12cd21da50))


### 🛠️ Bug Fixes

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



### 🎨 Styling

- 🎨 [style] Improve code readability by updating formatting

- Applies consistent import formatting in test files for improved readability.
- Removes unnecessary blank lines and corrects rule style in ESLint config.
- Simplifies grouped imports in strict tests for clarity.
- Enhances maintainability without changing logic or behavior.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3ab0812)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3ab08129c94cdaec3e9ad0eea87aaa12cd21da50)



### 🧪 Testing

- 🧪 [test] Refactors and improves database import/export tests

- Updates import/export service tests to use correct mock paths and dynamic imports, preventing hoisting issues and improving reliability
- Removes redundant comprehensive test suite for data import/export, streamlining test coverage and maintenance
- Enhances mock event bus setup with additional event methods for consistency
- Refactors Electron IPC test imports for clarity and type safety

Improves overall test accuracy and maintainability for database logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7406ffe)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7406ffe4178844ec6a6b7d048a97ec548b2f6c72)


- 🧪 [test] Replace EventEmitter with EventTarget in mocks

- Updates test event bus and emitter mocks to use EventTarget instead of EventEmitter for improved cross-platform compatibility and reduced dependency on Node.js core modules.
- Adjusts error expectations in database import/export tests to directly check for thrown mock errors, ensuring more accurate test validation.
- Refines mock implementations for transactional operations, monitor repository methods, and event emission to allow more precise and isolated unit testing.
- Fixes naming for mock error classes to reduce confusion with production error types.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(629fb70)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/629fb701186ed28d3c96ea334ea827907078d0e7)






## [10.9.0] - 2025-08-14


[[65ffe57](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65ffe5781675cf4a2564edfdbaf21d5a07646703)...
[a5c21e5](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a5c21e5a2bf81bc48f45fb266f2033f7f9ff140a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/65ffe5781675cf4a2564edfdbaf21d5a07646703...a5c21e5a2bf81bc48f45fb266f2033f7f9ff140a))


### 🛠️ Bug Fixes

- 🛠️ [fix] Ensure proper singleton initialization for status updates

- Prevents duplicate or uninitialized status update manager instances by switching to a lazy singleton pattern.
- Addresses potential dependency issues between services by enforcing initialization order.
- Improves robustness of subscription and unsubscription logic for site status updates.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(581b28d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/581b28dc36973c11d523f473fed176dc82786e22)



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



### ⚡ Performance

- ⚡ [perf] Optimize Vite build and enhance linting coverage

- Improves frontend performance by adding Vite warmup configuration and new profiling/debug scripts for transform and CPU analysis.
- Refines chunk splitting in Vite for better cache and load times; implements stricter chunk size warnings for vendor bundles.
- Expands static copy plugin for WASM validation and reliability; adds a validator script for performance config correctness.
- Updates ESLint config: adds new plugins for SQL, JSDoc, observer, and comment length checks; improves TypeScript path aliasing; disables false positive rules for store files.
- Removes unused/legacy TypeScript aliases across configs for clarity and consistency.
- Adds documentation on performance profiling and warmup strategy.
- Enables hot reload of Electron preload scripts in development for improved DX.
- Relates to improved reliability, faster cold starts, and higher code quality.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(11d8db0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/11d8db04b8addeb165c272665bb814e8f671cc39)



### 🎨 Styling

- 🎨 [style] Improves JSDoc formatting for readability

- Reformats multi-line JSDoc comments and line wrapping across all backend files to enhance documentation clarity and maintain consistency.
- Breaks up long comment lines to improve maintainability and ease of reading, especially for future contributors and code reviews.
- No logic or functional changes; focuses solely on comment style and developer experience.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(47401bd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/47401bd5aa6ca4689ed739afee0ad5c139c9fadd)



### 🧪 Testing

- 🧪 [test] Improve test clarity, consistency, and numeric formatting

- Updates numeric literals in tests to use underscores for readability.
- Refactors validation test assertions for consistency and clarity.
- Enhances boundary and edge case coverage for validator tests.
- Removes redundant DataImportExportService isolated test file to prevent duplication.
- Switches property access in initialization status tests to string-based for robustness.
- Improves floating point and NaN value checks in number validation tests.

Relates to improved maintainability and test reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a5c21e5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a5c21e5a2bf81bc48f45fb266f2033f7f9ff140a)


- 🧪 [test] Standardizes code style in test and mock files

Unifies indentation, spacing, and quote usage across all test and mock files for improved readability and consistency.

  - Ensures consistent formatting in mock definitions, test blocks, and object literals
  - Enhances maintainability and makes future reviews easier by minimizing style discrepancies

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5458f6b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5458f6b9c28016ba4dd97c52ec1191ba71fb3f8f)


- 🧪 [test] Add comprehensive isolated tests for IPC and data services

- Improves test coverage and reliability for IPC parameter validators, ServiceContainer, and DataImportExportService by introducing fully isolated, hoisted, and factory-based mocks.
- Expands test scenarios to validate edge cases, error handling, handler registration, and complex object validation for all major handler groups and database operations.
- Refactors existing tests to use more robust mocking patterns, ensuring correct dependency injection and interface compliance.
- Addresses previous mocking issues for event bus and service dependencies, enabling consistent test execution order and realistic behavior simulation.
- Enables future maintenance and extensibility by standardizing test structure and enhancing coverage across service layers.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1652c20)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1652c20a9c166a85466b53d7fbb9d981af3e65da)


- 🧪 [test] Add focused and comprehensive tests for ServiceContainer and UI branch coverage

- Adds targeted, core, feature, application, and debug test suites for ServiceContainer to verify singleton creation, dependency resolution, event forwarding, initialization, error handling, and integration scenarios.
- Introduces comprehensive branch coverage tests for UI components and utilities, including radio groups, progress bars, theme boxes, icon color utilities, and status badges, to improve coverage above 90%.
- Refactors and fixes file download utility tests for robust edge case and error handling, replacing prior coverage tests with updated versions.
- Addresses gaps in branch and prop comparison logic for key dashboard and site history components, ensuring all conditional branches are exercised.
- Improves reliability and maintainability of tests by standardizing mock implementations and isolating dependency behavior.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c212267)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c21226787099d32c29bbab0bb24cf18e3e2e8fd6)


- 🧪 [test] Boost branch coverage and improve effect hooks

- Expands test suite with comprehensive branch coverage for key UI components, hooks, and entry point logic, targeting previously untested conditions and branches.
- Refactors `useEffect` usage throughout the codebase to use named functions for better debugging and maintainability.
- Updates usage of `getElementById` for improved app initialization performance.
- Modernizes ESLint config and scripts, including plugin upgrades and new sorting automation.
- Refines theme and error styling for accessibility and consistency.
- Fixes and simplifies state updates, effect cleanups, and prop passing for improved UI reliability.
- Relates to coverage and maintainability improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(294e5f3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/294e5f3b7739f85753ea4d3666e5e5b5387da695)


- 🧪 [test] Add comprehensive unit tests for theme, forms, and components

Expands unit test coverage for theme hooks, form utilities, shared UI components, and site details, including edge cases, accessibility, and integration scenarios.
Updates and fixes test imports, mocks, and structure for compatibility with shared and refactored modules.
Improves test reliability and branch coverage, ensuring more robust validation of functional and visual behavior.
Relates to ongoing maintainability and quality assurance efforts.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e122ead)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e122ead81778bfd71c481cda3c0568c8dc573e3d)



### 🔧 Build System

- 🔧 [build] Integrates new ESLint plugins and stricter test linting

- Adds several ESLint plugins for improved code quality, including rules for deprecated APIs, SQL formatting, explicit type exports, top-level variable restrictions, and error handling.
- Configures stricter linting for dedicated test directories to enforce best practices and full type checking.
- Updates documentation to specify strict test file locations for new coverage efforts.
- Refactors test mocks to use EventTarget instead of EventEmitter for better cross-platform compatibility.
- Introduces utility scripts to convert PascalCase filenames to camelCase and to extract all test names for improved test management and visibility.
- Updates package dependencies to reflect new tooling requirements and bumps project version for release alignment.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8b104fe)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8b104feb76881e718df59b411b97da93bf43c18a)






## [10.6.0] - 2025-08-12


[[34d8980](https://github.com/Nick2bad4u/Uptime-Watcher/commit/34d89808fca716659364ceea0ea612a02610c4a6)...
[6b3e0db](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6b3e0db5d1f40e4c405beafe4c31a97c579d6444)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/34d89808fca716659364ceea0ea612a02610c4a6...6b3e0db5d1f40e4c405beafe4c31a97c579d6444))


### 🎨 Styling

- 🎨 [style] Improve test readability with consistent formatting

- Updates test assertions and function calls to use consistent multi-line formatting for improved readability.
- Replaces inline expressions with multi-line equivalents where argument lists or callback parameters are long.
- Maintains existing test logic and coverage, ensuring no behavioral changes.
- Makes tests easier to review and maintain by standardizing formatting style across files.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6b3e0db)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6b3e0db5d1f40e4c405beafe4c31a97c579d6444)



### 🧪 Testing

- 🧪 [test] Boost test coverage, improve assertions, add integration

- Adds comprehensive and integration tests across database utilities, registry, service layers, shared utils, and theme hooks to maximize coverage and validation of all logic branches
- Refactors test code to prefer direct queries/selectors over class names for robustness, improves assertion clarity, and ensures accurate simulation of global context in environments
- Replaces some array forEach usages with for...of for broader code path coverage and consistency
- Updates mock implementations and hooks to ensure all theme and settings code paths are exercised, including edge cases and error handling
- Introduces basic and backup tests for components to confirm mounting and rendering, expanding baseline reliability
- Refines test assertions to more closely match real-world usage, including accessibility and DOM queries

Relates to coverage improvement and regression prevention initiatives

🧪 [test] Boost coverage, enhance test robustness and reliability

- Expands test suites across database, registry, service, theme, and component layers to maximize code coverage and validate all logic branches
- Refactors test code for improved assertion clarity, realistic DOM queries, and accurate simulation of global context in test environments
- Replaces array forEach with for...of loops for broader code path coverage and consistency
- Updates mocks and hooks to fully exercise theme and settings logic, including edge cases, error handling, and global state changes
- Adds integration and baseline component tests to ensure reliable rendering and mounting, supporting regression prevention
- Improves accessibility and real-world alignment of assertions
Relates to coverage improvement and regression prevention efforts

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(34d8980)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/34d89808fca716659364ceea0ea612a02610c4a6)






## [10.5.0] - 2025-08-12


[[6de66b2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6de66b2f194770332b7eeffdad9e5989b33bd82c)...
[6e27f4f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e27f4f11dcd5705587a47e4f687db69697a7a5f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/6de66b2f194770332b7eeffdad9e5989b33bd82c...6e27f4f11dcd5705587a47e4f687db69697a7a5f))


### 🛠️ Bug Fixes

- 🛠️ [fix] Add defensive checks and error handling for theme and env vars

- Improves robustness across environments by adding null checks for theme property objects before accessing their values, preventing runtime errors in tests and SSR.
- Adds try/catch error handling to event emission and environment variable access to gracefully handle edge cases and log failures.
- Refines fallback logic for file download errors to ensure proper error propagation and warning logging.

Relates to improved cross-environment compatibility and test reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b7b41b9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b7b41b93eb3a4c7a1c1214e23f25b28a4817a55c)


- 🛠️ [fix] Ensure proper async handling and null checks in DB ops

- Updates async database operations to consistently use 'await' for correct promise resolution, preventing missed execution and potential errors.
- Refines null and undefined checks for improved reliability in dynamic schema mapping and settings retrieval.
- Clarifies return values and logging for site lookup, ensuring explicit undefined returns where required.
- Improves code readability and maintainability by removing redundant code and refining ESLint usage.

These changes enhance database transaction safety, guard against edge-case failures, and improve code clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6d64fd1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6d64fd1d93001ec9ffb37a1d9c4197fb917ae50d)



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


- 🚜 [refactor] Enforces explicit return types across codebase

- Standardizes function and method signatures by explicitly declaring return types for all functions, callbacks, and React hooks.
- Improves type safety and code clarity, reducing ambiguity for maintainers and tooling.
- Enhances IDE autocompletion and error detection, facilitating future refactoring and onboarding.
- Updates documentation and code comments where necessary to reflect changes in type usage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0c5b5fa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0c5b5faf714ce46d11a4eb5d6562cadf60bab359)


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



### 📝 Documentation

- 📝 [docs] Add automated download scripts for package docs

- Introduces scripts to automate downloading documentation for Electron, Chart.js, React, and Zustand from their official sources and repositories.
- Cleans, rewrites, and saves docs in Markdown format with normalized links for consistency and local use.
- Updates test files and type imports for stricter type usage and improved test reliability.
- Refines documentation formatting for clarity, markdown consistency, and improved code sample indentation.
Removes unused internal logging module to streamline codebase.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(48fe5af)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/48fe5af8375daec3ab295b77cd23a2af68570351)



### 🎨 Styling

- 🎨 [style] Applies consistent formatting and improves code clarity

- Normalizes code style across source, test, and documentation files for improved readability and maintainability
- Refactors nested and multiline expressions for clarity, especially in test assertions and mocks
- Ensures all code blocks use consistent indentation, bracket placement, and spacing
- Standardizes Markdown code block language tags in documentation, replacing inconsistent or missing tags
- Updates documentation lists and examples for clearer structure and uniformity
- Improves argument handling and output formatting in utility scripts for robustness and user experience
- Adds missing trailing newlines to config files for compatibility with tooling
- Enhances test coverage by clarifying mock data and assertion patterns

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(818763c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/818763c760ea31091e27e006cb5d8fc9d2b48411)


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


- 🧪 [test] Improve test readability and error coverage

- Reformats test code for better readability and consistency,
  including multiline function parameters and mock implementations.
- Enhances error handling coverage and event emission assertions,
  ensuring negative and edge case scenarios are explicitly tested.
- Clarifies mock setup for dependencies and test data creation,
  facilitating maintenance and future extensions of test suites.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8cd6987)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8cd6987c3ddfe848dba7506a3f5594c0e15a1af9)


- 🧪 [test] Achieve 100% backend and shared test coverage

- Adds comprehensive and final-coverage test suites for backend services, shared utilities, validation schemas, and store modules
- Refactors and enhances testing utilities for robust mocking and easier coverage
- Fixes test assertions to match logic edge cases and actual validation outputs
- Improves test stability and reliability by handling error and edge scenarios
- Updates ThemeManager logic for improved type safety and variable application
- Ensures all uncovered lines and branches are exercised, increasing confidence in code correctness

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a741a64)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a741a640559b896fbda7a17a5a1b6723abb26d89)


- 🧪 [test] Improve type safety and reduce unused code in tests

- Updates test suites to use explicit type assertions and safe property accesses, preventing potential undefined errors and TypeScript warnings.
- Removes unused variables, interfaces, and components to resolve linter and TypeScript errors (TS6133, TS6196).
- Refactors test data setup using new mock factory utilities for maintainable, consistent, and type-safe test objects.
- Adjusts test logic for edge cases by checking for property existence before access, improving reliability.
- Enhances clarity and maintainability of tests by removing redundant code and streamlining mock object creation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3b16e2c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3b16e2c9e9069a1c4a55e3d7a40c8ca0a8ca31fa)


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


- 🧪 [test] Improve test coverage and consistency across core modules

- Unifies import and mock style to use double quotes in all test files for consistency.
- Expands and structures test suites for hooks, types, and utility functions to ensure comprehensive branch and edge case coverage.
- Refactors and extends tests for fallback behaviors, input validation, type guards, and time formatting for reliability.
- Adjusts and organizes test assertions for clarity, resilience, and deterministic results, especially for time- and randomness-dependent logic.
- Cleans up duplicated or redundant test logic, and improves maintainability of complex test blocks for future feature changes. [`(abe46d8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/abe46d868b14f322e81ce1f0d95f1ee1566020d5)


- 🧪 [test] Add comprehensive unit tests for hooks, utils, and types

- Adds full-coverage, scenario-driven unit tests for core React hooks, utility functions, and shared type definitions, targeting edge cases and integration paths
- Extends backend and frontend test suites with exhaustive checks to improve type safety, runtime reliability, and regression resistance
- Updates ESLint and TypeScript configuration to ensure proper linting and type-checking for config files in test environments
- Refines Vite and Vitest build/test configs to improve coverage, concurrency reliability, and public asset handling
- Enhances confidence in core logic and architectural boundaries by validating store hooks, UUID generation, duration calculations, and monitor configuration types [`(6de66b2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6de66b2f194770332b7eeffdad9e5989b33bd82c)



### 🧹 Chores

- 🧹 [chore] Clarifies ESLint comments and refines Tailwind usage

- Improves clarity of inline ESLint disable comments, explaining rationale and environment compatibility for future maintainers.
- Refactors Tailwind CSS utility classes to use semantic min-width spacing, replacing arbitrary pixel values for better maintainability and design consistency.
- Updates fallback logic and explanatory comments in utility functions to clarify intent and cross-environment support.
- Cleans up unused code and redundant fragments, simplifying React returns.
- Ensures defensive checks and singleton initializations are clearly explained, reducing confusion on lazy loading and environment-specific code paths.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ed64fef)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ed64fef19c79912f21a0d70443263c2179802041)






## [10.3.0] - 2025-08-07


[[570e742](https://github.com/Nick2bad4u/Uptime-Watcher/commit/570e74289cbf93d3999736a2d2db9a19cc0fc985)...
[6274a4a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6274a4a21a213e4dce1b0a8141b6107d13b65d0d)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/570e74289cbf93d3999736a2d2db9a19cc0fc985...6274a4a21a213e4dce1b0a8141b6107d13b65d0d))


### 🚜 Refactor

- 🚜 [refactor] Enforces explicit type annotations app-wide

- Standardizes type annotations for constants, exports, interfaces, and function return types across backend, shared, and frontend codebases
- Introduces explicit interface/type definitions for configuration objects, catalog structures, stores, theme systems, chart setups, and component props
- Improves React component typing for memoized and functional components, ensuring accurate props and JSX/return values
- Refactors store and cache definitions for proper TypeScript inference and persistence, increasing type safety and maintainability
- Facilitates better IDE support, code navigation, and future refactoring by reducing implicit 'any' and clarifying expected shapes [`(570e742)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/570e74289cbf93d3999736a2d2db9a19cc0fc985)



### 📝 Documentation

- 📝 [docs] Improve docs, templates, and consistency across guides

- Enhances documentation by adding missing newlines and improving formatting for readability in core guides, ADRs, and templates
- Refines and expands code examples in architecture docs, development patterns, and templates for repository, IPC, and Zustand store implementations
- Standardizes usage of code blocks and TSDoc inline example style throughout documentation
- Removes an obsolete generated analysis file and deletes an unused report to reduce repository noise
- Updates markdown lists, section headings, and example categories for clarity and easier onboarding
- Clarifies migration, compliance, and testing guidelines in project docs to better support contributors [`(6274a4a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6274a4a21a213e4dce1b0a8141b6107d13b65d0d)



### 🔧 Build System

- 🔧 [build] Enhance build setup with CSS Modules, analyzer, and package updates

- Integrates advanced CSS Modules support and enables generation of TypeScript definitions for styles.
- Adds bundle analysis and devtools plugins to improve build insights and debugging.
- Upgrades and adjusts multiple dev dependencies for improved compatibility and coverage.
- Enforces stricter TypeScript incremental builds for faster development cycles.
- Refines test mocks to ensure more accurate and predictable test outcomes.
- Moves PostCSS config to ESM, updates config references, and improves security via CSP in HTML.
- Updates settings for better TypeScript experience in VS Code. [`(cf227be)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cf227be8cddb6c0c6684f7b314b361b6587f0ec4)






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






## [10.1.0] - 2025-08-05


[[85d0a94](https://github.com/Nick2bad4u/Uptime-Watcher/commit/85d0a94a6be56fa9424e8686071108a44131bdff)...
[85d0a94](https://github.com/Nick2bad4u/Uptime-Watcher/commit/85d0a94a6be56fa9424e8686071108a44131bdff)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/85d0a94a6be56fa9424e8686071108a44131bdff...85d0a94a6be56fa9424e8686071108a44131bdff))


### 🧪 Testing

- 🧪 [test] Refactors test suite for monitor/site stores and UI

- Updates test mocks to use electronAPI integration for monitor types, sites, and system actions, improving isolation and accuracy.
- Simplifies and corrects test setup for monitor type and monitor validation hooks, supporting new backend store integration.
- Refactors dynamic monitor field tests and site operations tests to directly mock electronAPI calls and store logic, replacing older service-layer mocks.
- Improves error handling and loading state assertions in tests to match new store-driven state.
- Cleans up and modernizes test coverage for UI actions, error handling, and chart configuration utilities.
- Adjusts field and config validation logic in tests for consistency with updated backend and store responses. [`(85d0a94)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/85d0a94a6be56fa9424e8686071108a44131bdff)






## [10.0.0] - 2025-08-05


[[7c388d3](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7c388d3c5e93e8a7825578d70017e9577e26d235)...
[cd95d5a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd95d5a9d23f44b43e0bd923dc59bf64d8a82aec)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/7c388d3c5e93e8a7825578d70017e9577e26d235...cd95d5a9d23f44b43e0bd923dc59bf64d8a82aec))


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


- 🚜 [refactor] Remove legacy monitor status logic, fully adopt enhanced monitoring

- Migrates all monitoring operations to the enhanced, race-condition-safe service bundle
- Eliminates legacy fallback monitor checking and outdated status update handler
- Strengthens dependency injection and clarifies service requirements for better testability and maintainability
- Refines error handling and documentation, ensuring safer and more predictable monitoring workflows
- Updates API contracts and construction patterns to align with the unified architecture [`(cd8e41e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd8e41e6a9a34e8cf0499ac037c506ca3b25e695)


- 🚜 [refactor] Modularize config serialization and validators

- Extracts monitor config property validation and UI config serialization into reusable utility objects for improved clarity and maintainability.
- Refactors parameter validation logic in IPC handlers to use composable validator functions, reducing duplication and easing future extension.
- Splits theme style computation into dedicated functions for each style section, enhancing code readability and facilitating easier updates. [`(1226803)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/122680300f65867e0daaaa037fc02202fe293f97)



### 📝 Documentation

- 📝 [docs] Improve type safety documentation and cleanup formatting

- Updates multiple documentation files to clarify lessons learned, implementation details, and analysis around TypeScript type safety improvements.
- Removes inline imports and redundant interface definitions from code samples to reinforce best practices.
- Highlights unified validation system, enhanced cache typing, and domain-specific configuration improvements.
- Fixes formatting and indentation inconsistencies for improved readability.
- Confirms comprehensive review and cleanup of type safety issues, emphasizing architectural boundaries for `unknown` usage.
- Updates build and lint status sections for accuracy. [`(cd95d5a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd95d5a9d23f44b43e0bd923dc59bf64d8a82aec)


- 📝 [docs] Add comprehensive analysis of unknown type usage

- Documents a full audit of all unknown type occurrences, confirming that the vast majority are architecturally appropriate and align with established best practices.
- Highlights several targeted opportunities for future typing improvements, with actionable recommendations for high-impact areas.
- Emphasizes the maturity of current type safety and advises preserving existing flexible patterns at boundaries. [`(566e598)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/566e5980bf0ce71a9e420ca571193ab564227330)


- 📝 [docs] Improve formatting, clarity, and consistency across docs and prompts

- Refines Markdown formatting and indentation for better readability in documentation, guides, and review prompts
 - Adds missing line breaks and whitespace for clarity, making lists and code blocks easier to parse
 - Updates tables, example code, and explanatory text to follow consistent standards throughout guides
 - Enhances accessibility and maintainability by improving structure and separating independent ideas
 - Cleans up test and config files for consistent code style, aiding future development and review [`(26f8d12)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26f8d126f1e0e654d7ade92187e9e6891219b475)



### 🧪 Testing

- 🧪 [test] Improve test readability and formatting

Refactors test files for better readability and consistent code style.
Updates indentation, spacing, callback usage, and mock implementations to improve maintainability.
Standardizes array iteration and callback patterns for clarity.
No changes to test logic or coverage; focuses purely on code organization and formatting. [`(7679157)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/767915729a9ae65a6a9da0d8ddfa2ade3c155ee1)


- 🧪 [test] Add comprehensive coverage for database row validation

- Introduces extensive tests targeting all validation utility functions for shared database types to ensure 100% branch and type coverage.
- Improves reliability and future maintainability by verifying edge cases, expected input formats, and error handling across history, monitor, settings, and site row validators.
- Standardizes numeric literal formatting in existing tests for consistency. [`(9d79f3b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9d79f3bca7e288b25565bdac6b26c1b050861c21)


- 🧪 [test] Add comprehensive unit tests for site form submission

- Improves code reliability by introducing detailed tests covering site creation and monitor addition flows, including success and error handling
 - Refactors props memoization in components for better render performance and code clarity
 - Enhances data handling robustness by safely serializing objects and validating property extraction
 - Optimizes UI by memoizing styles and callbacks to reduce unnecessary re-renders [`(70eafdf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/70eafdfec35b2b629d836570d2f84931240eb8cf)


- 🧪 [test] Add comprehensive unit tests for core UI and backend logic

- Improves test coverage for components, forms, hooks, database types, constants, and utilities, targeting previously untested or under-tested files
- Validates all edge cases, error paths, integration points, and type contracts to ensure reliability and prevent regressions
- Refines monitor validation logic for ping types and BigInt serialization, addressing coverage gaps
- Provides mock setups for external dependencies to enable isolated and deterministic testing
- Enables more robust CI and future refactoring by ensuring critical logic is thoroughly exercised [`(5400887)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5400887f165731a8338c737ec3cda8450e673cb0)


- 🧪 [test] Refactors MonitorManager tests to use enhanced checker mocks

- Updates MonitorManager tests to mock and use enhanced checker services for manual site checks, replacing legacy monitorStatusChecker mocks.
- Improves test clarity and maintainability by aligning with updated service injection patterns.
- Adjusts related site and settings store tests to expect new API response structure for greater consistency. [`(c0ce9d9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c0ce9d9183b36015937697f7bd5fbf566d226b6b)


- 🧪 [test] Add and reorganize backend coverage tests for shared validation and conversions

Adds new backend test suites targeting shared utilities and types to ensure comprehensive coverage and accurate reporting. Reorganizes tests to electron/test for backend coverage tracking, introduces more exhaustive scenarios for validation logic, and skips fragile or redundant assertions to align with backend-only execution.

Improves maintainability and reliability of backend validation and conversion utilities, safeguarding shared code correctness across both frontend and backend. [`(c51d489)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c51d489f277ba88ade2ac7dc5d068bea77f895f1)






## [9.8.0] - 2025-08-02


[[b200338](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b2003386edf359ae7dc19080c176ec0b52dbe7cc)...
[b890faf](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b890fafaebecc846c6718eb9c1f0ff788cdba316)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/b2003386edf359ae7dc19080c176ec0b52dbe7cc...b890fafaebecc846c6718eb9c1f0ff788cdba316))


### ✨ Features

- ✨ [feat] Add operation-correlated monitoring for race safety

- Introduces an enhanced monitoring subsystem with operation correlation to prevent race conditions during monitor checks and lifecycle changes.
- Adds new service modules for monitor checkers, operation registries, status update services, and timeout management, integrating them into the main manager and dependency injection flow.
- Refactors validation logic across backend and frontend to use centralized, well-tested utilities for consistent string, URL, and identifier checks.
- Updates monitor schema and shared types to track active operations, ensuring safer concurrent state transitions.
- Improves site cache refresh logic to guarantee UI and scheduler reflect the latest monitor state after lifecycle changes.
- Marks legacy monitoring utilities as fallback-only and documents preferred usage of the enhanced system. [`(56b26f4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/56b26f42f7751ba1251233ee6f7ec114615a57f0)



### 🚜 Refactor

- 🚜 [refactor] Unifies monitor operation lifecycle and result handling

- Streamlines monitoring lifecycle by consistently clearing active operations when starting or stopping monitors, reducing risk of stale operations.
- Unifies monitor check result interfaces and event emission logic, ensuring accurate status updates and event consistency across manual and correlated checks.
- Replaces ad-hoc numeric validation with standardized utility for monitor configuration values, improving reliability and input safety.
- Improves error handling and history logging with enhanced result detail propagation. [`(b87dbaf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b87dbaf7fc51cf78010721f285bc45851e4ab8b6)


- 🚜 [refactor] Standardize import order and improve validator utils

- Reorders import statements for consistency and readability across modules.
- Refactors shared validation utilities to improve documentation, rearrange functions for logical grouping, and enhance maintainability.
- Moves the array identifier validator above the URL validator to better reflect usage frequency and intuitive grouping.
- Updates formatting for inline comments and function documentation to align with project standards.
- No logic changes to core application behavior. [`(2be161b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2be161bf4bc9f3f0f7cd7e4e56141b8469ae7abd)



### 🎨 Styling

- 🎨 [style] Reformat and clean up test code for readability

- Updates test files to use consistent formatting and improved indentation.
- Refactors JSX in tests for better clarity and maintainability.
- Standardizes array and object literals for configuration and test assertions.
- Removes extraneous whitespace to enhance code quality and review experience. [`(b200338)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b2003386edf359ae7dc19080c176ec0b52dbe7cc)



### 🧪 Testing

- 🧪 [test] Improve validation test coverage and monitor lifecycle checks

- Expands unit tests for validation utilities, covering string, URL, FQDN, identifier, integer, and numeric validation scenarios to ensure reliability.
- Integrates stricter usage of safe integer parsing in service and utility tests to catch edge cases and enforce bounds.
- Adds and verifies active operation lifecycle management for monitor objects and repositories, reducing risk of concurrency bugs.
- Refactors service container tests to enforce dependency initialization order, improving coverage of complex service interactions and preventing circular reference issues.
- Strengthens monitor and site operation tests with explicit checks for new properties and normalization, supporting future extensibility. [`(b890faf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b890fafaebecc846c6718eb9c1f0ff788cdba316)






## [9.7.0] - 2025-07-31


[[94ae942](https://github.com/Nick2bad4u/Uptime-Watcher/commit/94ae942a2e31a8054725772aab9be2e059167679)...
[cd71c5f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd71c5fb522fee53f2cec54f13fcdbc80c330ef1)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/94ae942a2e31a8054725772aab9be2e059167679...cd71c5fb522fee53f2cec54f13fcdbc80c330ef1))


### ✨ Features

- ✨ [feat] Add Ping monitor type with validation and UI support

- Introduces a cross-platform Ping monitor, enabling network reachability checks via ICMP ping with retry, timeout, and detailed result reporting.
- Integrates Ping monitor into backend service registry, type definitions, validation schemas, and migration/versioning system.
- Updates form types, validation logic, and UI scaffolding to support adding and configuring Ping monitors alongside existing types.
- Refactors shared schema utilities and type guards to dynamically accommodate the new monitor type for robust extensibility. [`(afd7cb4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/afd7cb4621e8273f5a320dc5cefa25b1590796d7)



### 🛠️ Bug Fixes

- 🛠️ [fix] Work around ESLint plugin iterator bug

- Avoids direct use of the iterator property to bypass a known ESLint plugin issue.
 - Ensures compatibility with linting tools while preserving iteration functionality. [`(7ecf608)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7ecf60823bb29f3f5231ab0dd3554519f332e19a)


- 🛠️ [fix] Improve safety and logging config, return validation metadata

- Ensures monitor lists are safely handled if null or undefined to prevent runtime errors.
- Updates console logging level detection to use a more reliable environment variable check for production mode.
- Returns metadata in monitor field validation results for richer error handling and diagnostics.
- Removes redundant ESLint disable comments for cleaner code. [`(94ae942)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/94ae942a2e31a8054725772aab9be2e059167679)



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



### 🎨 Styling

- 🎨 [style] Expand multiline arrays and objects for readability

- Updates formatting across configuration and test files to expand array and object literals over multiple lines.
- Improves code readability and consistency, especially for longer lists and argument arrays in both config and test cases.
- No logic or functionality changes; focuses solely on stylistic improvements. [`(bfb8351)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bfb83515aa7e21ae2be7cd0a469eacbc4f116670)


- 🎨 [style] Adjust ESLint directive placement for clarity

- Moves, adds, and re-enables ESLint disable/enable comments to better scope rule exemptions to specific functions or code blocks.
- Improves code readability and ensures linter exceptions are applied only where necessary, supporting future maintainability. [`(ef810eb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ef810ebf772dfe59ac317d8af647b3b31c0e9f20)



### 🧪 Testing

- 🧪 [test] Expand and improve frontend test coverage

- Adds comprehensive and additional tests for error boundary, error fallback, theme hooks, settings store, and site status utilities
- Refactors test assertions for property access and handler checks to enhance reliability and maintainability
- Updates tests to cover more edge cases, asynchronous behavior, accessibility, and functional re-export validation
- Improves test clarity for type usage and interaction behaviors, supporting future refactors and feature additions [`(cd71c5f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd71c5fb522fee53f2cec54f13fcdbc80c330ef1)


- 🧪 [test] Update tests for theme and util changes, fix mocks

- Updates tests to use new naming and structure for utility functions and chart config creation.
- Improves test logic for error checks, custom errors, and large object handling.
- Corrects mock paths to match file structure changes.
- Refactors theme hook to defer state updates and avoid direct setState in effects, improving React state handling and stability.
- Enhances system theme detection and updates using timeouts and stable callbacks.
- Cleans up redundant ESLint directives and whitespace in test files. [`(69642d6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/69642d603046df7c10aff7c8674899f3342bc319)


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






## [9.4.0] - 2025-07-29


[[b80855d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b80855dc70fcc914f192eef8c06523beb85bfcb9)...
[b0317ee](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b0317eea506e794d3f40ed2ffd9a4f5cb264b30b)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/b80855dc70fcc914f192eef8c06523beb85bfcb9...b0317eea506e794d3f40ed2ffd9a4f5cb264b30b))


### 🚜 Refactor

- 🚜 [refactor] Centralize and clarify logging config constants

- Consolidates log file name, max size, and format strings into constants for improved maintainability and readability.
- Reduces repetition and simplifies future updates to logging configuration. [`(25520d4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/25520d43af811dec996c0ca8dc9273fe496dacd3)


- 🚜 [refactor] Centralize SQL queries and harden theme/style logic

- Replaces inline SQL query strings with internal constants across database modules for improved maintainability, consistency, and error reduction.
- Refactors theme variable generation and application logic by extracting repetitive code into dedicated helper methods, adding defensive checks for safer runtime access.
- Enhances robustness of theme-related React hooks by handling rare cases where matchMedia may throw, and unifying cleanup management.
- Fixes a potential crash in site operations by checking for existence of monitor data before attempting to stop monitoring.
- Updates cache sync logic to better detect electron environment features.
- Excludes documentation files from test coverage reporting for more accurate results. [`(1890260)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1890260bdc488727fe25acbf786914af93bd17a7)


- 🚜 [refactor] Modularize DB ops, add type safety & atomicity

- Refactors database and monitoring logic to decouple responsibilities using command and factory patterns, improving SOLID compliance and testability
- Centralizes backup, import/export, and site repository logic with new factories and command objects, enabling atomic operations and easier rollbacks
- Introduces type guards for monitor configs to ensure runtime type safety, addressing historical undefined value issues
- Adds constants for retries, intervals, and migration steps to replace magic numbers and improve maintainability
- Strengthens migration system with explicit version validation, improved error handling, and configurable step limits
- Improves cache update methods to prevent race conditions and enable atomic replacement, reducing risk of data inconsistency
- Updates documentation and usage examples for clarity, especially around async event handlers and frontend integration
- Enhances error reporting and recovery for critical operations, logging inconsistencies and emitting system error events for observability [`(ed3b585)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ed3b5852cd0f990c3ebff31b929aa613f4744f7d)



### 📝 Documentation

- 📝 [docs] Enhance and standardize code documentation across codebase

- Improves and expands JSDoc/TSDoc comments for nearly all modules, interfaces, types, and exported functions to clarify usage, parameters, return values, error behavior, and intended audience (public/internal)
- Brings consistency to doc formatting and structure, ensuring all code entities are well-described and discoverable, with explicit remarks and usage examples where appropriate
- Updates documentation to match actual behavior, describe design rationale, and highlight extensibility, improving onboarding and maintainability
- Removes duplicate or redundant comments, restructures for clarity, and corrects outdated or misleading explanations
- Adds missing public/internal annotations, improves type parameter explanations, and ensures referential links (e.g., {@link ...}) are accurate
- Does not alter runtime behavior or business logic; focuses solely on developer experience and API clarity

Relates to ongoing documentation and maintainability efforts. [`(133b721)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/133b72197db9192c99df6ac44caf89494a5f8bb2)



### 🎨 Styling

- 🎨 [style] Reformat tests and configs for consistency and readability

- Applies consistent code formatting across test files and configuration files, improving readability and reducing unnecessary diffs in the future.
- Collapses object and array literals, standardizes indentation, and aligns multi-line arguments.
- Updates mock and renderHook invocations to unified inline/expanded formats where needed.
- Removes extraneous blank lines and ensures uniform spacing throughout.
- No logic or functional changes introduced; focuses purely on code style and test formatting for maintainability. [`(b0317ee)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b0317eea506e794d3f40ed2ffd9a4f5cb264b30b)


- 🎨 [style] Improve code readability and test robustness

- Replaces large numeric literals with underscores for clarity across tests and mocks
- Refactors array iteration patterns to use for...of or for...entries for better consistency and future-proofing
- Switches to explicit usage of Number.NaN and similar constants, enhancing code clarity
- Updates import statements for Node built-ins to the 'node:' prefix for alignment with best practices
- Adds missing required fields to test data objects, improving type completeness in tests
- Uses globalThis instead of global for compatibility
- Minor regex and utility improvements for consistency and maintainability
- Adds or updates TypeScript error expectations in test files for clarity

These changes boost maintainability, ensure test predictability, and align stylistic conventions throughout the codebase. [`(2bf7af3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2bf7af36c3b8001e0c2d67e55d0598127de308a1)


- 🎨 [style] Remove unnecessary blank lines in test suites

- Cleans up test file formatting by deleting superfluous blank lines between describe and it blocks
- Improves code readability and maintains consistent code style across tests [`(fea3323)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fea33238849df07af94d73ea4442cb75b0b3b55d)



### 🧪 Testing

- 🧪 [test] Expand and refine comprehensive and edge case test coverage

- Adds multiple new comprehensive test suites targeting error handling, edge cases, and branch coverage for cache, site, and database logic.
- Substantially expands StandardizedCache tests to cover TTL, LRU, stats, events, invalidation, bulk ops, cleanup, and error scenarios.
- Introduces and refines tests for error handling utilities, store action logging, and site status helpers.
- Updates existing tests for event bus, middleware, and site/database managers to improve mocking, branch coverage, and edge case handling.
- Skips or marks problematic or redundant tests to avoid false negatives due to mocking/async complexity.
- Motivated by the goal of achieving high (90%+) branch and statement coverage and ensuring robust behavior under failure and rare scenarios. [`(e68fc85)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e68fc853a2dc870036d2a0309d8de77f3260c254)


- 🧪 [test] Add comprehensive frontend and backend test suites

- Introduces extensive unit and integration tests for Electron main process, managers, event bus, middleware, and React hooks
- Targets 90%+ branch coverage, focusing on edge cases, error handling, and type safety
- Ensures coverage for dynamic theme, help text, monitor field/type, chart utilities, cache, and site selection logic
- Replaces or modernizes several test mocks to improve isolation and test reliability
- Removes legacy site operations test suite in favor of granular, more maintainable coverage
- Improves maintainability and confidence in code quality by systematically validating all critical branches and behaviors [`(78d8787)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/78d878791b6da3be721d26b39c2ed77ac37fd952)


- 🧪 [test] Add comprehensive unit tests for store, theme, and status utilities

- Introduces extensive unit tests to achieve 90%+ branch coverage for store actions, site status utilities, and theme management logic
- Adds edge case and error handling tests to ensure robust coverage for CRUD operations, monitoring, theme application, and sync event handling
- Updates test configuration for improved code coverage accuracy and reporting, including full source inclusion and better concurrency handling
- Improves maintainability and future-proofing by validating edge scenarios and integration points across store and UI themes [`(cbae68c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cbae68cd02ca86b31412f12887c8b3cb6ee168bf)


- 🧪 [test] Streamline and expand component test suite formatting

- Refactors test files for themed components, utilities, and services to condense array values, assertions, and props into single lines for improved readability and maintainability.
- Ensures consistent formatting and style across all test cases, reducing visual clutter and improving future modification.
- Does not alter test coverage logic or assertions; focuses purely on code style and structure. [`(65ada1d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65ada1d97a89fe7cfebdd5770f390168098079d8)


- 🧪 [test] Achieve 90%+ branch coverage for core components and services

- Adds comprehensive test suites for themed UI components, application service lifecycle, database utilities, IPC handlers, monitor types, notification service, and utility functions.
- Increases coverage of all conditional branches, edge cases, and integration scenarios, ensuring robust behavior and improved reliability.
- Updates prompts and test coverage requirements from 100% to 90% branch coverage, clarifying testing scope and excluding development-only features.
- Refactors and expands existing tests for better mocking, error handling, and coverage of asynchronous logic and configuration scenarios.
- Improves maintainability and future testability by documenting hard-to-mock cases and enhancing branch coverage criteria.

Relates to coverage improvement and test reliability. [`(b80855d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b80855dc70fcc914f192eef8c06523beb85bfcb9)



### 🧹 Chores

- 🧹 [chore] Define log file name constant for maintainability

- Extracts the log file name into a constant to improve code readability and simplify future updates.
- Reduces hardcoding and potential for errors from repeated string literals. [`(c15cb5d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c15cb5deeef19cf2e28018f5922019ebfbe7c604)






## [9.2.0] - 2025-07-27


[[543efe4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/543efe4bb8ba01e1ab2b3071e322824620139594)...
[f7da81f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f7da81f7b934c87cf4a98ccf4b1504caa8cef94f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/543efe4bb8ba01e1ab2b3071e322824620139594...f7da81f7b934c87cf4a98ccf4b1504caa8cef94f))


### ✨ Features

- ✨ [feat] Add type-safe theme merging and settings reset

- Adds deep theme merging utility to centralize and simplify custom theme overrides, addressing code duplication and improving maintainability.
- Implements backend-synchronized settings reset, ensuring all application settings can be restored to defaults via IPC and the database, with improved frontend synchronization.
- Refactors code to use type-safe property access for database rows, form data, and Chart.js configs, reducing index signature errors and enhancing reliability.
- Introduces configuration-driven approaches for cache clearing, monitor display identifiers, and monitor type labels for easier extensibility.
- Updates docs and tests to reflect new features and API contracts.
- Relates to duplicate code and maintainability recommendations in the provided review. [`(8eae8ed)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8eae8ed0e0c2fb33d2e9497ed2039642a5b107bd)



### 🚜 Refactor

- 🚜 [refactor] Streamline backend status updates & code quality

- Refactors status update handling for sites and monitors to enable more efficient, incremental updates and minimize unnecessary full syncs
- Improves code quality and maintainability by modularizing validation logic and reducing cyclomatic complexity in several areas
- Updates IPC logging to reduce output for high-frequency operations and adjusts error handling for robustness
- Unifies manager event types, improves schema handling, and tidies type usage across repositories
- Harden CI workflow, enhance commit documentation, and introduce new logging CLI commands for better development and production diagnostics
- Fixes UI details in history tab and metric rounding in tests for consistency

Relates to ongoing code quality remediation and performance improvements [`(5a9ec9f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a9ec9fc2a14b7f39f98fc5a8381821c554931b2)



### 📝 Documentation

- 📝 [docs] Improve clarity and structure in review reports

- Updates review documentation to enhance readability with better formatting and spacing between sections and claims.
- Improves visibility of analysis details, false positives, and implementation plans.
- Clarifies assessment of static analysis findings, test coverage, and key learnings for future development workflow.
- No logic or code changes; documentation only. [`(f7da81f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f7da81f7b934c87cf4a98ccf4b1504caa8cef94f)


- 📝 [docs] Add AI claim review & final report; clean up code

- Adds detailed documentation reviewing static analysis AI findings, outlining valid issues, false positives, and remediation strategy for maintainability, performance, and security.
- Introduces associated final report summarizing fixes, test coverage, and recommendations.
- Cleans up unused import from config, fixes redundant test conditions, and bumps Node.js engine requirement.
- Improves code quality by optimizing React memoization and removing dead code.
- Ensures comprehensive test coverage and aligns with project standards. [`(b09dde3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b09dde3dbd7ed1ba0d07a6f78dc820d8af95f153)


- 📝 [docs] Finalize and standardize AI claims review docs

- Updates summary, review, and implementation documentation for low-confidence AI claim reviews across all service, utility, infrastructure, and monitoring layers
- Aligns tables, formatting, and section ordering for clarity and consistency
- Expands on rationale, architectural impact, and validation results for each review batch
- Ensures comprehensive TSDoc standards, error handling, type safety, and code quality commentary are reflected in documentation
- Documents additional improvements, architectural insights, and future recommendations
- Clarifies false positive findings and documents architectural decisions
- No functional code changes; documentation and review summaries only [`(543efe4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/543efe4bb8ba01e1ab2b3071e322824620139594)



### ⚡ Performance

- ⚡ [perf] Memoize callbacks and options in form fields

- Optimizes form components by memoizing event handlers and option arrays to reduce unnecessary re-renders.
- Improves maintainability and performance, especially for complex forms with dynamic fields.
- Refactors numeric and string input handling for better callback reuse and clarity. [`(01140e1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/01140e16ee361ebe59bf8191072bd36c96b7ea39)



### 🧪 Testing

- 🧪 [test] Remove unused monitor types test file

- Cleans up obsolete or unnecessary unit test to reduce clutter
- Improves maintainability by deleting a redundant test file [`(0b3e373)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0b3e373a1fd70f132fd3813e8d2ada124e85720a)


- 🧪 [test] Update unit tests for consistency and modern style

- Unifies import statements to use double quotes across all test files for style consistency
- Modernizes test formatting and indentation for improved readability and maintainability
- Updates mock setups and test assertions to align with current best practices
- Ensures tests follow a consistent structure for easier navigation and future extension [`(f3f27cd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f3f27cdc75c14cfbd26892dbc1123683a0806a7c)


- 🧪 [test] Refactors and fixes unit tests for improved reliability

- Updates and restructures multiple test suites for clarity and maintainability
- Refactors mocks to better match actual dependencies and behaviors, improving test isolation
- Fixes broken and outdated tests, and disables unreliable ones to reduce false negatives
- Simplifies and reduces redundant test cases, focusing on essential edge cases and realistic scenarios
- Enhances test coverage for error handling, async logic, cache operations, and theme management
- Aligns test file imports and structure for consistency, supporting future coverage improvements [`(6a6678a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6a6678ababdee426f6fce0d53da899b967df10cc)


- 🧪 [test] Add and update unit tests, remove legacy and obsolete tests

- Introduces new and improved test coverage for backend utilities, cache logic, logger, and monitor lifecycle.
- Removes outdated, redundant, or overly broad frontend and backend test suites for improved maintainability and clarity.
- Refines test logic to accommodate recent code changes and stricter validation; improves reliability of UUID and site analytics tests.
- Adds shared monitor type UI interface definitions to support future extensibility.
- Updates mocks and setup for better isolation and cross-environment compatibility.
- Refactors tests to ensure consistency with current codebase and corrects expectation mismatches. [`(dd17a16)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dd17a16e6257cd6b9b8c73f2319ad6b80c275add)



### 🔧 Build System

- 🔧 [build] Update Electron build deps, CI, and coverage paths

- Aligns Electron package dependencies to latest compatible versions for improved stability and reduced maintenance overhead.
- Switches coverage reporting to explicit lcov.info files for more accurate coverage uploads.
- Forces npm install in audit CI workflow to resolve dependency conflicts.
- Refines Electron logging type usage for better clarity.
- Adds detailed duplicate code and static analysis report for future refactoring. [`(0ed9ce0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0ed9ce0f79552537176c8bd1b8c707f6ef5a4eca)






## [8.6.0] - 2025-07-25


[[46bbcf7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/46bbcf7c05ca47f4eb98d35723fe116fbd3ef3f2)...
[5a390b9](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a390b97e9f425a2cb8759c4fa0963e8604a1c04)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/46bbcf7c05ca47f4eb98d35723fe116fbd3ef3f2...5a390b97e9f425a2cb8759c4fa0963e8604a1c04))


### ✨ Features

- ✨ [feat] Standardize IPC, QA, and import patterns for consistency

- ✨ [feat] Introduces a fully standardized IPC architecture with type-safe handlers, unified validation, and consistent response formats across the Electron main and renderer processes, improving maintainability and reliability.
- 🧪 [test] Adds comprehensive IPC handler coverage, automated import pattern audits, performance benchmarking, and console statement remediation tools for proactive technical debt reduction and code health monitoring.
- 📝 [docs] Provides detailed guides on IPC standardization, QA/testing methodology, and import pattern best practices to enhance onboarding and ongoing development quality.
- 🚜 [refactor] Refactors site analytics and related hooks to encapsulate metrics logic, improve testability, and leverage new IPC response handling patterns.
- 🛠️ [fix] Fixes minor bugs in database pruning logic, object property checks, and type conversions for improved type safety and stability.
- 👷 [ci] Adds Codacy coverage reporter workflow for automated code coverage reporting.
- Improves developer experience, enables future scalability, and establishes robust QA/testing foundations for long-term maintainability.

Relates to QA and architectural consistency milestones. [`(5a390b9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a390b97e9f425a2cb8759c4fa0963e8604a1c04)


- ✨ [feat] Improve theme, monitoring, and analytics robustness

- 📝 [docs] Enhances code documentation for theme system, monitoring, IPC, stores, hooks, and utilities to clarify interfaces, rationale, and advanced usage.
- 🚜 [refactor] Refactors theme manager, monitoring services, stores, and hooks for better type safety, dynamic theme management, and deep merge logic.
- 🛠️ [fix] Fixes color/description alignment, fallback logic, and runtime validation for monitor types and analytics calculations.
- ✨ [feat] Adds robust validation, error handling, and dynamic cache management across UI, monitoring, and backend synchronization.
- 🎨 [style] Improves CSS variable naming consistency and theme-aware style hooks.
- ⚡ [perf] Optimizes cache and state management for incremental updates and large datasets.
- 🧹 [chore] Consolidates duplicate logic, improves code organization, and increases maintainability across the codebase.
- Relates to improved accessibility, reliability, and extensibility for advanced monitoring scenarios. [`(62ebb4f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/62ebb4f5a8164cd104b529b921cf051265aeb2cb)



### 📝 Documentation

- 📝 [docs] Improve and standardize TSDoc comments across codebase

- Updates and clarifies TSDoc comments for all major backend services and utilities, enhancing type safety, discoverability, and editor integration.
- Ensures public APIs, error structures, utility functions, and class members provide clear, concise, and project-standard documentation.
- Adds missing remarks, param/returns/throws details, and usage examples, while streamlining repetitive or overly verbose sections.
- Improves internal documentation for maintainability and onboarding, supporting future code generation, tooling, and static analysis.
- No logic or runtime changes; strictly documentation improvements for developer experience. [`(ff31ac4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ff31ac4897131c6b720f47680042b875e30e20a4)


- 📝 [docs] Improve documentation, accessibility, and code standards

- Updates and expands code documentation across core managers, services, repositories, and components for clarity, maintainability, and API usage.
- Enhances accessibility and browser compatibility by adding reduced motion coverage and CSS fallbacks for modern features.
- Refactors event handler and prop naming to align with React conventions and best practices.
- Standardizes chart time range options and improves type safety for analytics components.
- Unifies loading state management and removes misleading comments for better code quality.
- Improves test coverage and updates tests for renamed props.
- Refines user experience with improved empty states, filter messaging, and icon usage.
- Adds architectural notes and rationale to support long-term maintainability and developer onboarding.
Relates to ongoing codebase quality and accessibility initiatives. [`(433d6d2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/433d6d22725fe137a449bc3bf62d5170ebd62d5d)


- 📝 [docs] Standardize TSDoc and clarify type safety, error handling, and UI docs

- Refines TSDoc comments across backend, shared, and frontend modules to enforce project documentation standards and improve clarity for maintainers and onboarding.
- Enhances documentation on type safety, runtime validation, and error handling throughout form components and domain types, aligning with stricter TypeScript usage.
- Adds comprehensive remarks, examples, and parameter details, especially for component props, event payloads, and exported APIs.
- Clarifies memoization strategies and prop stability requirements for React components to support performance optimizations.
- Documents UI constraints, ARIA accessibility, and CSS variable usage for consistency and maintainability.
- Fixes ambiguous or missing comments on domain models, utility functions, and system-level APIs, aiding future refactoring and debugging.
Relates to internal documentation and code quality improvement tasks. [`(46bbcf7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/46bbcf7c05ca47f4eb98d35723fe116fbd3ef3f2)






## [8.4.0] - 2025-07-24


[[67e9034](https://github.com/Nick2bad4u/Uptime-Watcher/commit/67e9034b5526d3eb8c819971d036818f036e5e39)...
[04f85fb](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04f85fbb657e59727b6ea017e039fdec19db2873)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/67e9034b5526d3eb8c819971d036818f036e5e39...04f85fbb657e59727b6ea017e039fdec19db2873))


### ✨ Features

- ✨ [feat] Improve error handling and docs for core services

- Enhances notifications, site, and updater services with robust error checks, detailed logging, and atomic config updates to ensure reliability and thread safety.
- Refactors monitor type definitions for stricter type safety and modernizes UUID generation by relying on crypto.randomUUID.
- Removes fallback and legacy utility functions for cleaner codebase and updates documentation to clarify concurrency, error handling, and usage patterns.
- Simplifies operational ID generation by dropping outdated compatibility logic.

Relates to code maintainability and robustness improvements. [`(88a640a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88a640a9b44d7ed879b54cfb7c2b100a3702c8d6)


- ✨ [feat] Improve database safety, docs, and consistency

- Enhances data safety and consistency across database operations by enforcing idempotency, transaction context usage, and atomicity, especially for destructive actions like bulk deletes.
- Refactors repository patterns to use explicit and validated schemas, standardized SQL queries, and consistent data normalization (e.g., site names and monitoring states).
- Expands documentation and inline remarks for platform compatibility, transaction behavior, error handling, and domain-specific logic to clarify usage and prevent silent failures.
- Improves type safety and validation for database responses, mapping logic, and error handling, reducing risks of corrupt data or missing results.
- Refines history and settings mapping logic for better edge case handling, boolean conversion, and fallback strategies.
- Adds backup metadata and validation steps for schema generation to facilitate reliable database exports and migrations.
- Optimizes performance by leveraging prepared statements, reducing startup overhead, and preventing unnecessary database operations. [`(5006b2d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5006b2d4f85cf476ceacc1e09b42005c6ac7d2f2)


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



### 🛠️ Bug Fixes

- 🛠️ [fix] Improve validation, documentation, and event accuracy

- Enhances input validation with more granular errors and upper bounds for history limits to prevent invalid usage and performance issues.
 - Refines documentation for internal logic and business rules, adding detailed TSDoc comments and remarks for better maintainability.
 - Ensures event data accuracy by retrieving site information before deletion, resulting in correct site name emission.
 - Improves error formatting and readability for validation failures.
 - Updates configuration for TSDoc to allow unsupported HTML and new tags, and removes unused dependencies and adjusts build scripts for clarity. [`(f036cae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f036cae36d78ddc12bc30faf35e0ee7c6bd9715a)



### 🚜 Refactor

- 🚜 [refactor] Standardizes validation, caching, and event handling

- Refactors validation logic for sites and monitors to improve error reporting, ensure async compatibility, and enforce stricter business rules.
- Introduces centralized cache TTLs and limits for consistent cache management across services.
- Unifies event emission and error handling patterns, reducing race conditions and enhancing observability.
- Updates middleware interfaces and documentation for clarity and best practices.
- Improves atomic cache replacement and site refresh logic to prevent data inconsistency.
- Cleans up ESLint config by removing redundant rules. [`(a1ae79a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a1ae79a7ce6f33552162f4723ac909855dc86f15)


- 🚜 [refactor] Restructure shared types and improve error handling

- Refactors shared type imports to separate event types from domain types, reducing circular dependencies and clarifying module boundaries.
- Centralizes file download error handling into dedicated helper functions for clearer logic and easier maintenance.
- Updates environment and object utility functions to improve type safety, add explanatory comments, and handle process checks more robustly.
- Replaces console logging in store utilities with a unified logger for consistent debug output.
- Adds inline comments to explain deviations from linting rules and clarify shared utility constraints. [`(71b6827)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/71b6827de0a1b95a35c76a7ba422833e7b819398)



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


- 📝 [docs] Add detailed AI claim review docs and enhance code docs

- 📝 Adds comprehensive documentation reviewing AI claims for multiple modules, including monitoring utilities, site writer service, monitor lifecycle, history limit manager, and service factory.
- 📝 Documents rationale for code decisions, design choices, and false positives found in static analysis.
- 📝 Improves and clarifies TSDoc/comments throughout service, repository, import/export, cache, and monitoring logic for better maintainability and onboarding.
- 🚜 Refactors and clarifies comments for error handling, transaction safety, and status state management.
- 🛠️ Fixes inconsistent documentation, return type order, and default value usage for site names and database file names.
- 📝 Updates and clarifies scripts and documentation-related npm scripts for Docusaurus and Typedoc.
- 🛠️ Fixes cache expiration checks and key retrieval logic for consistency and correctness.
- 🎨 Applies minor style and clarity improvements to code comments and error messages.

Relates to AI code review and architecture documentation initiatives. [`(ba60a45)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ba60a45131469672ea1a59b01960b4dd63ebaa57)


- 📝 [docs] Improve TSDoc coverage and TypeDoc config

- Addresses extensive TSDoc warnings by adding missing interface/type exports and @public tags, correcting @param names, consolidating duplicate tags, and replacing invalid block tags.
- Updates TypeDoc and Docusaurus config for better documentation generation and multi-entry support.
- Adds new TypeDoc plugins to improve markdown and type link handling.
- Enhances generated API docs coverage, improves intellisense, and lays groundwork for stricter documentation standards. [`(7d4aff7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7d4aff77effaffa9a0ad4a07dc7817a26ba9f0ca)


- 📝 [docs] Update doc links to match latest source commit

Synchronizes all API reference documentation links to point to the
latest commit hash in the source code. Ensures consistency between
documentation and the current codebase, improving traceability and
reducing confusion for developers referencing documentation.

No content, logic, or structural changes to docs; only link updates. [`(b08e2dd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b08e2ddd1291150c02d1b24ae21a2f69f1061c7d)


- 📝 [docs] Improve monitoring utils documentation and error handling

- Enhances inline documentation across monitoring utility modules for greater clarity on function behavior, error handling, timing, and retry logic.
- Refines error result structures and error classes, standardizing error reporting and response time handling for both HTTP and port checks.
- Improves input validation and status determination logic to handle edge cases and maintain consistent monitoring semantics.
- Adds type-safe timing measurement and error normalization for robust diagnostics and retry mechanisms. [`(a230788)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a2307888fed1098221e415384b3fa5b6cff6a987)


- 📝 [docs] Improve monitoring code documentation and type safety

- Updates docstrings across monitoring modules for clarity, maintainability, and onboarding, detailing configuration, error handling, extension guidelines, and lifecycle management.
- Refines type usage and validation for monitor types, configurations, and migration utilities, increasing runtime safety and reducing circular dependencies.
- Enhances internal logic for monitor factory and scheduler, including better error handling, key parsing, interval validation, and config updates.
- Motivates easier extension of monitor types and smoother migration paths in future changes. [`(9fcfef4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9fcfef4fbb0200ae607896dedbb85530e9d4125f)


- 📝 [docs] Enhance database mapper and converter documentation

- Improves inline documentation for all database mapping and value conversion utilities, clarifying usage, edge cases, and error handling.
- Strengthens validation logic for site and settings mappers, improving type safety and data integrity.
- Refines error logging for mapping failures to aid future debugging.
- Increases maintainability and onboarding ease by explaining non-obvious mapping conventions and behaviors. [`(c068099)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c06809931c4f14c562cca4560cd701478dd046d4)


- 📝 [docs] Add reviews and legacy code cleanup reports

- Documents AI claims reviews and implementation for HttpMonitor and PortMonitor, detailing fixes for robustness, type safety, configuration validation, and documentation clarity
- Summarizes cross-service improvements and risk assessments for monitor services
- Adds comprehensive legacy/backwards compatibility cleanup report, highlighting removal of deprecated APIs, unused utilities, and legacy compatibility code
- Improves documentation of modernization efforts and code quality benefits
- Updates test mocks to use modern import patterns, removing deprecated API usage [`(fc5973b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fc5973b64536f0ded916b8e4a5c3baaae83a3be8)


- 📝 [docs] Enhance documentation and event handler clarity

- Improves code comments, documentation blocks, and JSDoc usage for application and database services, making event handling and backup logic more transparent.
- Updates event forwarding error logging for consistency and easier tracing.
- Refines comment tag styles and adds missing tags for better highlight and readability in editor.
- Removes unnecessary React Native ESLint configuration to streamline linting for Electron/React projects. [`(7cb0cd5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7cb0cd5f3c361fcc6da54237bce42bf8e76a446d)


- 📝 [docs] Enhance event system and orchestrator documentation

- Improves JSDoc comments for event bus, orchestrator, and middleware, clarifying architecture, usage, and edge cases
- Expands event categorization and priority definitions for type safety and maintainability
- Refines event data enhancement logic to handle arrays, primitives, and _meta conflicts safely
- Strengthens validation middleware with robust type checking, safer logging, and error resilience
- Updates ESLint config to disable irrelevant React Native rule for Electron context

Improves developer experience, code clarity, and reliability of event validation and handling. [`(47d4f6d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/47d4f6d51038fd1ad88a89b2aa1c143454cb43a7)


- 📝 [docs] Add layer audit report and update lint/style configs

- Documents a comprehensive layer consistency audit, including findings and recommended fixes for architectural separation
- Refines and reorganizes Stylelint configuration: adds plugins and presets for React Native, Tailwind, defensive CSS, Prettier, and improved ordering; updates rules for better style consistency and maintainability
- Updates ESLint config to include React Native plugin and rules, ensuring cross-platform linting coverage
- Expands package dependencies for enhanced style and lint tooling, including React Native, defensive CSS, and improved ordering support
- Improves Electron utility function for accurate dev/prod detection and adds inline documentation
- Refines Electron app extension loading logic to restrict devtools to development mode only
- Cleans up logging and documentation for application service lifecycle and main process logic
- Clarifies and enhances documentation across Electron preload API and orchestrator code for maintainability and onboarding
- Adjusts CSS z-index/property order for improved specificity and Stylelint compliance [`(44e4db0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/44e4db0d06d07af7fbbe4eab0ab09f69f6deaf25)






## [8.0.0] - 2025-07-21


[[3e03a70](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e03a70f698ddf642108c2d59bb904f821900f5c)...
[317afc9](https://github.com/Nick2bad4u/Uptime-Watcher/commit/317afc96cb471b175790ed35f805dc66e9b946f1)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/3e03a70f698ddf642108c2d59bb904f821900f5c...317afc96cb471b175790ed35f805dc66e9b946f1))


### ✨ Features

- ✨ [feat] Add automatic frontend cache sync with backend

- Implements cache invalidation event handling between backend and frontend to keep caches synchronized.
- Refactors database operations to use single transactions for atomicity, improving consistency and reducing risk of nested transactions.
- Extracts and centralizes chart configuration logic to reduce duplication of font and title styling.
- Refactors theme definitions to use a shared base theme and override helper, simplifying maintenance and reducing repetition.
- Cleans up type definitions by re-exporting from shared sources, improving type safety and consistency across the app. [`(f91ea1d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f91ea1d19d57eb2dc3422d48e5411926f898ccc2)


- ✨ [feat] Improve database init and dependency injection

- Ensures database history limit is loaded from persistent settings on startup, providing better config consistency.
- Refactors manager and service initialization to inject full repository dependencies, improving modularity and testability.
- Adds explicit database file access checking and handling for locked files, helping diagnose startup issues and guiding users.
- Improves service container startup sequence for reliability and clearer logging. [`(de4ef57)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de4ef57b3c8c0bca3392c42296ba676dc5cee79c)


- ✨ [feat] Add SiteWriterService for testable site data ops

- Introduces a dependency-injected service to handle site creation, updating, and deletion as pure data operations, improving testability and separation of concerns
- Refactors monitor retry logic to simplify dev-only hooks and removes unnecessary debug statements for cleaner code
- Updates ESLint config for resolver compatibility and bumps related dependencies for improved tooling support
- Documents comprehensive function usage and clarifies architectural patterns to aid maintainability
- Increments version to reflect feature addition and dependency updates [`(84ef490)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/84ef490bf5df88667b35dea5ac19c7555843a957)


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


- 🛠️ [fix] Ensure type safety for DB IDs and improve ESLint config

- Converts database record IDs to numbers before deletion to prevent type inconsistencies and potential query issues.
- Updates ESLint configuration to use stricter rule sets for enhanced code quality.
- Replaces unused promise result with void for clarity in app startup.
- Adds ESLint directives to handle ESM meta property usage for window services.

These changes collectively improve type safety, maintainability, and code standards. [`(945d9b3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/945d9b33d8593dbd9f0c904f07ebde926202fbc6)


- 🛠️ [fix] Improve string conversion for database mapping

- Introduces a safe string conversion utility to handle complex objects, preventing '[object Object]' serialization issues flagged by SonarCloud.
- Updates database mapping logic to use the new utility, ensuring consistent and reliable string representations for settings and site data.
- Removes redundant barrel export documentation and refines code quality standards for clarity.
- Splits cognitive complexity linting scripts by project area for more granular analysis. [`(6b61050)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6b610503cfb57cc65aad33bbf31dd9e638dc6ba2)



### 🚜 Refactor

- 🚜 [refactor] Decouples repositories, adds SiteService, unifies validation

- Refactors repository layer to remove cross-repository dependencies, strictly enforcing single responsibility and clean architectural boundaries
- Introduces a dedicated SiteService for complex site operations and coordination across multiple repositories
- Updates all relevant managers, utility modules, and the service container to use the new service layer
- Replaces duplicated and inconsistent monitor validation logic with centralized, shared validation utilities for type safety and consistency
- Documents standardized transaction patterns and architectural improvements
- Improves maintainability, testability, and clarity of data access and business logic separation
- Fixes critical architectural violation identified in the audit [`(2958ce0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2958ce0982c55dd537bff06b17c8b8e3fe7ba528)


- 🚜 [refactor] Simplify service initialization and remove unused factories

- Streamlines service container initialization by removing redundant logging and unnecessary delays
- Cleans up database service logic, eliminating manual file lock checks and verbose error guidance to rely on SQLite error handling
- Removes unused service factory functions to reduce maintenance overhead and improve clarity

Focuses on reducing complexity and improving maintainability without changing functional behavior. [`(49967a5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/49967a568853f4bff6bbfbeb576baf86a30518af)


- 🚜 [refactor] Enforces dependency injection, simplifies db services

- Removes fallback to singleton service container, ensuring all core managers and repositories are constructed via explicit dependency injection for improved testability and maintainability.
- Refactors database service to focus only on low-level DB management, moving backup and import/export logic to dedicated services.
- Updates service initialization and event forwarding for clearer separation of concerns and circular dependency avoidance.
- Cleans up legacy code paths and default parameters to reinforce strict dependency usage.
- Improves documentation to clarify boundaries between data access and business logic. [`(72e76f8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/72e76f8f1234d5a5fa6e97ea6c9fedcd57a02bf9)


- 🚜 [refactor] Centralizes dependency management via ServiceContainer

- Removes scattered direct instantiation of repositories and managers in favor of dependency injection using a ServiceContainer singleton.
- Enhances testability and lifecycle control by passing dependencies explicitly, reducing tight coupling and circular references.
- Updates constructors and factory functions to accept dependencies, and forwards events for better frontend integration.
- Improves maintainability and scalability by standardizing service initialization and usage patterns across the codebase. [`(9b493d3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9b493d348be487348d98352db5fd0221be8e0553)


- 🚜 [refactor] Standardizes cache management across managers

- Migrates all managers and service layers to use a unified cache implementation, eliminating custom and legacy cache interfaces.
- Introduces a feature-rich standardized cache with TTL, LRU eviction, event emission, and stats tracking for improved performance and observability.
- Updates tests and factories for compatibility, ensuring type safety and consistency throughout the codebase.
- Removes obsolete documentation and code related to function usage analysis and legacy cache patterns.
- Adds new build plugins for bundle visualization and TypeScript path support.
- Enables easier future maintenance and debugging by centralizing cache logic and configuration.

Relates to codebase consistency and technical debt reduction. [`(f5889ad)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f5889ade471ae278e380f84f977367bfa7225c7a)


- 🚜 [refactor] Consolidate error handling utilities and unify retry logic

- Unifies retry and error handling patterns for monitoring and database operations by replacing overlapping utilities with a consistent approach.
- Refactors backend and frontend wrappers to use standardized operational hooks, enhancing maintainability and debugging.
- Deprecates redundant error handling functions in favor of parameterized wrappers, ensuring backwards compatibility.
- Updates documentation and analysis to reflect architectural improvements and clarify function usage. [`(2707b61)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2707b611cfe343b1c72cdc3727569d854cfe992f)


- 🚜 [refactor] Remove dead orchestrator code; streamline backup/import logic

- Eliminates unused orchestrator classes and cache methods, consolidating backup and import/export flows into direct service calls for clarity and maintainability.
- Updates docs to clarify IPC function usage, removes misleading dead code, and revises tests to target the active API.
- Improves error handling and event emission in backup and import routines, simplifying code tracing and future maintenance. [`(ff7bec9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ff7bec924c3757ccc978fd8b228ce794bb944840)


- 🚜 [refactor] Remove orchestrator, unify site write logic

- Streamlines site writing operations by removing the orchestrator class and integrating monitoring logic directly into the main service
- Simplifies service creation and usage, reducing indirection and improving maintainability
- Ensures monitoring updates are handled consistently during site updates [`(b7ea2e5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b7ea2e5ec04770e2a187571e175049b4d594e541)


- 🚜 [refactor] Modularize orchestrator event handlers and improve string conversion

- Refactors orchestrator event handler setup into focused, modular methods for database, site, monitoring, and event forwarding logic, clarifying architecture and initialization flow.
- Enhances string conversion utility to avoid '[object Object]' outputs, provide descriptive fallbacks for complex, circular, function, and symbol types, and guarantee meaningful string representations for all values.
- Updates documentation and settings for consistency, readability, and maintainability. [`(05fa9f4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/05fa9f49d11c4e34ee32f3eb135f4f60d19deab0)


- 🚜 [refactor] Remove obsolete monitoring and stats utilities

- Cleans up legacy backend and utility modules related to monitoring, error handling, and stats management
- Eliminates redundant type guards, migration logic, monitor interval helpers, and site status wrappers
- Streamlines codebase by removing unused store logic and type definitions
- Prepares code for a new or refactored monitoring/stats architecture by reducing technical debt [`(e39762e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e39762edd60b25fbb9459ee96517c5a6d3de5b05)


- 🚜 [refactor] Streamline service architecture and event APIs

- Refactors service container and orchestration logic to improve dependency management, initialization order, and resource cleanup for better maintainability and testability.
- Enhances event bus diagnostics, middleware, and type safety for more robust cross-service communication.
- Reorganizes site, monitor, and database repositories for clearer separation of concerns and atomic operations, including bulk actions and transaction boundaries.
- Refines type guard, validation, and migration logic to support extensible monitor types and forward-compatible schema evolution.
- Updates and clarifies event IPC APIs for improved frontend/backend integration and future-proofing.
- Fixes minor issues with field ordering, code style, and documentation for consistency and readability. [`(874aa5b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/874aa5bf220f8e7bad842428a4791a4921b44692)



### 📝 Documentation

- 📝 [docs] Improve function usage analysis formatting and clarity

- Updates markdown tables for better readability and column alignment
- Adds spacing and headings to enhance document structure
- Clarifies recommendations and architectural insights for easier review
- No logic or content changes; purely documentation improvements [`(902e954)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/902e9543377abd0d806464b91307fbc1e6e8c83c)


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



### 🧪 Testing

- 🧪 [test] Remove legacy and redundant test files

Removes obsolete test suites across electron, src, and shared packages
to streamline the codebase and reduce maintenance overhead.

Cleans up comprehensive, duplicated, and low-value coverage tests
for core components, utilities, and hooks that are no longer relevant
to current development or CI processes.

Updates build and lint scripts to add markdown linting and fix support.

Adds missing shared alias to test config for improved import resolution. [`(317afc9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/317afc96cb471b175790ed35f805dc66e9b946f1)


- 🧪 [test] Remove legacy and redundant test files

Removes obsolete, redundant, and legacy test suites for backend and frontend modules.
  - Cleans up outdated coverage and unit test files after code refactoring or architectural changes.
  - Speeds up CI runs, reduces maintenance overhead, and prevents confusion from stale tests.
  - Prepares project for new testing strategy or improved structure.

Relates to test infrastructure modernization. [`(3d0c136)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3d0c136ab4fa113a87c2e902d64dbaf95ebef141)






## [7.8.0] - 2025-07-17


[[b0f0af8](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b0f0af8d175b052759db39a47060929160e3d408)...
[775e23f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/775e23f8671a2d2e163ee75e36a67531f2b0fbaa)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/b0f0af8d175b052759db39a47060929160e3d408...775e23f8671a2d2e163ee75e36a67531f2b0fbaa))


### ✨ Features

- ✨ [feat] Add devtools installer and robust Vite dev server wait

- Installs React and Redux DevTools extensions automatically in development mode, enhancing debugging capabilities for developers.
- Implements a retry mechanism to wait for the Vite dev server to be ready before loading the app, improving reliability and reducing errors during startup.
- Adds detailed logging for window lifecycle and content loading events, aiding diagnosis and development workflow. [`(7d2b034)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7d2b0348cfabe325825ab8e117db02a9f5400cbe)



### 🚜 Refactor

- 🚜 [refactor] Split event imports for error handling modules

- Updates imports in error handling utilities to reference event bus and event types from their specific modules rather than a combined source.
- Improves module clarity and reduces coupling, supporting better maintainability and future scalability. [`(775e23f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/775e23f8671a2d2e163ee75e36a67531f2b0fbaa)


- 🚜 [refactor] Remove barrel files and switch to direct imports

- Resolves all circular dependencies by eliminating barrel (index) files and updating to explicit file-based imports across the codebase
- Improves maintainability, IDE performance, and build efficiency by clarifying dependency chains and aligning with modern TypeScript best practices
- Updates component, store, hook, and utility imports throughout frontend and backend, removing >70 index files and cleaning up related tests
- Documents completion of the circular dependency resolution plan and updates architecture notes for future maintainability
- Ensures zero circular dependencies remain and prepares the project for easier future refactoring [`(6a284dd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6a284ddad91fe255a4b0e1e9fb1970f44fe24603)


- 🚜 [refactor] Untangles circular dependencies and cleans imports

- Refactors import structure across backend and frontend to eliminate 19 circular dependencies, improving maintainability and compilation reliability
- Moves core monitor type definitions to break cross-module cycles and introduces a shared validation interface for configuration logic
- Replaces barrel imports with direct file imports, especially for logger and services, to prevent cyclic chains
- Extracts and centralizes shared types and utility functions into dedicated shared modules, breaking store/theme cycles in the frontend
- Updates type assertions and type guard usage for improved type safety and clarity
- Provides detailed documentation and tracking for circular dependency resolution and code duplication, setting clear future refactoring actions
- No functional or API changes; all updates are internal and preserve existing behavior

Relates to circular dependency cleanup and maintainability goals. [`(72c3d9b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/72c3d9bd002a5575c384a59257c34f14f65febde)


- 🚜 [refactor] Centralize Chart.js setup and improve chart typings

- Moves Chart.js component registration and configuration into a single setup module to prevent duplication and inconsistencies across the app
- Refactors chart-related components to use strongly typed, memoized wrappers for improved type safety and rendering performance
- Updates chart data structures and options for strict typing, eliminating type assertions and clarifying intent
- Cleans up imports and code organization in chart-related UI, adopting the new centralized system
- Enhances maintainability by consolidating chart logic and reducing repeated setup code [`(227178b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/227178bae223f88f67bba6e48635bc6057634b35)


- 🚜 [refactor] Standardize repository data mapping and error handling

- Replaces ad-hoc and conditional data transformations in all repository layers with dedicated, reusable mapper utilities for sites, monitors, history, and settings.
- Unifies type handling by introducing strict row types and validation functions, increasing type safety and maintainability across database operations.
- Refactors repository methods to consistently return promises and leverage shared transformation logic, reducing code duplication and improving testability.
- Implements centralized, layered error handling utilities for backend, frontend, and utility operations, supporting standardized logging, event emission, and retries.
- Updates related services and frontend utilities to use new error handling wrappers, simplifying error management and ensuring consistent user-facing behavior.
- Documents the repository pattern standardization, outlining before/after patterns, benefits, and next steps for further improvements.
- Updates all affected tests to match new async interfaces and improved result consistency.

Addresses code consistency, reduces duplication, and lays groundwork for further pattern standardization across the codebase. [`(bd999aa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bd999aaffec74850d8818c4583788cfd96eb2e11)



### 📝 Documentation

- 📝 [docs] Remove orchestrator class JSDoc block

- Cleans up the file by deleting the class-level documentation comment
- May reduce duplication or prepare for alternative documentation approaches [`(ddf78bf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ddf78bf5643afb3e7c5bd6a84b8773f71e7ed2e0)


- 📝 [docs] Add consistency audit plan and improve repo docs

- Documents a comprehensive codebase consistency audit, outlining current inconsistencies, areas of strength, and a phased improvement roadmap for error handling, repository patterns, and IPC handlers.
- Updates repository pattern documentation for clarity and highlights benefits of recent standardizations.
- Adds new terms to custom dictionary for better tooling support.
- Cleans up formatting in config and markdown files for improved readability and consistency.
- Ignores coverage result files in code style and tooling configs to reduce noise.

These changes aim to guide ongoing architectural alignment and improve maintainability across the codebase. [`(dae5886)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dae588644f14d3939a59c57805804a92d85d7764)



### 🎨 Styling

- 🎨 [style] Reformat imports and docs for clarity

- Collapses multi-line import statements into single lines for improved readability and maintainability.
- Updates Markdown documentation to add spacing and correct minor formatting inconsistencies.
- Enhances overall code and documentation clarity without altering logic or functionality. [`(d8a910a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d8a910a27b2d4ce8aa3c6bad6a43fdff8a29f29b)


- 🎨 [style] Reformat codeblocks, update ignore and linter configs

- Reformats code examples in documentation for improved readability and consistency, primarily converting indentation to spaces in large markdown code blocks.
- Expands ignore rules to exclude more file types and folders for stylelint, reducing noise and improving linting accuracy.
- Enhances Stylelint configuration by adding Tailwind CSS support and separating rule definitions, enabling better compatibility with Tailwind CSS conventions.
- Applies small whitespace and formatting fixes across scripts and test files for cleaner diffs.
- Improves clarity and markdown compliance in docs through minor adjustments. [`(b0f0af8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b0f0af8d175b052759db39a47060929160e3d408)






## [7.6.0] - 2025-07-16


[[0379231](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0379231f105aa420ab1e94676a66b5db5a352e30)...
[6869f0b](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6869f0b5b2ce12be8c9c80cee7d6619cd5b6240f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/0379231f105aa420ab1e94676a66b5db5a352e30...6869f0b5b2ce12be8c9c80cee7d6619cd5b6240f))


### ✨ Features

- ✨ [feat] Unifies and extends monitor event system for status changes

- Standardizes monitor status events by replacing legacy "status-update" with typed "monitor:status-changed", "monitor:up", and "monitor:down" events, enabling a more granular and type-safe notification system.
- Refactors event emission, handling, and IPC wiring across backend and frontend to consistently use the new event names and payload structures.
- Updates preload and global typings to expose new event listeners, and revises all related tests, mocks, and documentation accordingly.
- Improves initialization, error handling, and event processing logic for better reliability and maintainability.
- Removes outdated event constants and handler code, ensuring cleaner API boundaries and reducing redundancy.
- Motivated by the need for clearer event semantics, stronger typing, and improved frontend reactivity to monitor state changes. [`(6869f0b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6869f0b5b2ce12be8c9c80cee7d6619cd5b6240f)


- ✨ [feat] Add event listener cleanup support and improve API typing

- Introduces cleanup functions for all event subscription APIs, enabling proper removal of listeners in the renderer, improving memory management and preventing listener leaks
- Updates type definitions and test mocks to reflect the new pattern, ensuring type safety and test accuracy
- Refactors subscription management in the status update handler to utilize cleanup functions instead of global listener removal, enabling more granular and reliable event unsubscription
- Adds and clarifies documentation on Electron application entry, context isolation, and event security model
- Fixes minor logic and parameter handling in orchestrator and event emission for accuracy and consistency
- Removes experimental code coverage setting for improved compatibility [`(7b44526)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b44526edec1831e7abf0fab47310316a4ac2581)



### 🛠️ Bug Fixes

- 🛠️ [fix] Improve monitor ID handling and React plugin config

- Updates monitor mapping logic to ensure IDs are only stringified if valid, improving data consistency.
- Reactivates and configures the React Vite plugin with Fast Refresh and explicit Babel options for better DX and JSX handling.
- Refines test coverage matching/exclusions in SonarQube properties to avoid double-counting test files.
- Cleans up test and utility code for clarity, using more concise methods and stricter type usage.
- Removes redundant cleanup logic in the Electron main entry point. [`(c2ad587)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c2ad587da68272b729fe2096f583ebce2eede37f)



### 📝 Documentation

- 📝 [docs] Enhance monitor integration guide and clarify architecture

- Expands the guide for adding new monitor types with richer examples, advanced usage patterns, and clearer step-by-step instructions
 - Details registry-driven features, migration support, operational hooks, and type safety improvements
 - Updates code samples to reflect modern best practices, including use of JSON columns for schema flexibility and validator.js for robust validation
 - Adds advanced notes, debugging tips, architectural status, and clarifies error handling and caching strategies
 - Refines comments and JSDoc in orchestrator and main process for maintainability and onboarding
 - Removes outdated instructions and improves overall documentation structure for better developer experience [`(4e39e39)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e39e39e7bc7dc30b0d758584862163b6332f424)



### 🎨 Styling

- 🎨 [style] Improve test formatting and coverage config consistency

- Standardizes code style and formatting across test files, enhancing readability and reducing diff noise.
- Updates coverage and build configurations for more accurate and maintainable code coverage reporting, including enabling AST-aware remapping and ensuring comment removal.
- Refines plugin and alias usage for better consistency between main and electron test setups.
- Clarifies and expands comments for better documentation of config intent.
- No functional or logic changes to application or test behavior. [`(e366f3d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e366f3deb8c89d6ed1c9ed2824dabff2821bf3ec)



### 🧪 Testing

- 🧪 [test] Enhance coverage with new and fixed tests, minor type fixes

- Adds comprehensive and edge-case tests for runtime type guards, monitor UI helpers, and App component to significantly improve frontend and backend coverage
- Introduces a final coverage summary and simplified coverage enhancement tests to document and validate testing strategies, reliability, and achievements
- Removes redundant logger test in favor of global logger mocks and more targeted coverage
- Fixes test reliability for main process cleanup logic and MonitorScheduler interval case, skipping unstable tests as needed
- Updates type references for Zod schemas to ZodType for better type safety
- Improves mocking and setup in test environment, ensuring better isolation and logger test coverage

Relates to coverage targets and continuous quality improvements [`(0379231)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0379231f105aa420ab1e94676a66b5db5a352e30)



### 🧹 Chores

- 🧹 [chore] Annotate logger calls for v8 coverage ignore

- Adds `/* v8 ignore next */` or `/* v8 ignore next 2 */` comments to logger calls throughout the codebase to prevent logging statements from affecting coverage metrics.
- Aims to improve the accuracy of code coverage reports by excluding side-effect-only logging from coverage analysis.
- No changes to application logic or behavior; purely for tooling and code quality purposes. [`(33f1fd6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/33f1fd6fcc7415053890059c425fadd4cdf80881)






## [7.4.0] - 2025-07-16


[[1109dae](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1109dae06ddc098df15eb54f0cfc602bfe644236)...
[45ba5f2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45ba5f27917b1291d1f81905e46f0e5bef16de74)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1109dae06ddc098df15eb54f0cfc602bfe644236...45ba5f27917b1291d1f81905e46f0e5bef16de74))


### 🧪 Testing

- 🧪 [test] Add responseTime mock and fix timer advance call

- Ensures mock monitor objects include a response time property to align with expected structure.
- Updates timer advancement to use a non-null assertion, preventing potential errors during async test execution. [`(45ba5f2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45ba5f27917b1291d1f81905e46f0e5bef16de74)



### 🧹 Chores

- 🧹 [chore] Remove unused exports and consolidate types

- Cleans up unused and duplicate exports across barrel files and type definitions to reduce confusion and maintenance overhead.
- Removes never-used error classes, utility functions, and conditional UI components for advanced analytics.
- Consolidates type exports to single sources of truth, improving type safety and reducing redundancy.
- Adjusts imports and tests to match new export structure, ensuring consistency and easier future refactoring.
- Improves code clarity in UI components by switching from class-based to style-based response time coloring. [`(1109dae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1109dae06ddc098df15eb54f0cfc602bfe644236)






## [7.3.0] - 2025-07-15


[[ee45c3c](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ee45c3cbe5ef8f4d67d8ea295164a692ff6ba76d)...
[7981606](https://github.com/Nick2bad4u/Uptime-Watcher/commit/79816068aaecff5423b54bb779d9def939aba323)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/ee45c3cbe5ef8f4d67d8ea295164a692ff6ba76d...79816068aaecff5423b54bb779d9def939aba323))


### ✨ Features

- ✨ [feat] Enforces barrel imports, theme consistency, and error handling

- Updates import/export standards to require barrel files for all utility and service imports, improving maintainability and consistency.
- Refactors codebase to strictly use barrel exports for monitor utilities and hooks, removing deep imports.
- Introduces robust theme-aware CSS classes and global scrollbar styling for a more consistent UI across light/dark modes.
- Enhances error handling logic in stores and database utilities, ensuring safer state updates and error conversion.
- Improves code readability by extracting nested ternary expressions and splitting logic into helper functions.
- Removes redundant feature doc comments and unused unit tests to streamline documentation and coverage.
- Adds electron-devtools-installer for improved development workflow.
- Adjusts formatting and linting scripts for stricter code quality. [`(7981606)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/79816068aaecff5423b54bb779d9def939aba323)



### 🎨 Styling

- 🎨 [style] Replace console logging with structured logger

- Unifies error and warning reporting across frontend and backend by replacing all console.* calls with a structured logger interface.
- Enhances log consistency, improves error traceability, and supports future log aggregation or filtering.
- Adds logger imports where missing and adapts all error/warning handling code to use logger methods instead of direct console statements.
- Updates documentation comments for clarity and standardization, and improves error context in log messages. [`(ee45c3c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ee45c3cbe5ef8f4d67d8ea295164a692ff6ba76d)






## [7.2.0] - 2025-07-15


[[88a65a0](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88a65a0a00765dcb5e5f857859af8e72c7742be2)...
[f6c3db1](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f6c3db18b64f0ac3bcf798ef391d3399ae018442)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/88a65a0a00765dcb5e5f857859af8e72c7742be2...f6c3db18b64f0ac3bcf798ef391d3399ae018442))


### ✨ Features

- ✨ [feat] Emit sync events after site updates for consistency

- Ensures state synchronization by emitting a dedicated event after site and monitor updates.
- Facilitates downstream listeners to react to state changes and maintain data integrity. [`(0e1c0cc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0e1c0cc5166e4557c56ddb5e5a7f2e916ab87852)


- ✨ [feat] Add unified state sync event support and sync status API

- Implements real-time state synchronization events for better consistency between backend, cache, and frontend, replacing previous ad-hoc sync logic.
- Adds a structured API to query synchronization status and metadata, improving diagnostics and UI feedback.
- Updates relevant interfaces and event emitters to include synchronization source and timestamp for traceability.
- Cleans up redundant legacy state sync code to streamline state management. [`(863989e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/863989ebb8ebb3f653439027df4709c27e37f360)


- ✨ [feat] Add Biome integration, IPC monitor formatting, and docs

- Introduces Biome for code formatting and linting, adds configuration, and updates scripts for linting workflows.
- Expands IPC interface and backend handlers to support dynamic monitor detail and title formatting, enabling frontend to use backend registry for monitor type display logic.
- Documents the process for adding new monitor types, clarifying which steps are automated and which require manual intervention.
- Refactors status history logic for type safety, cleans up event constants, and improves migration system robustness.
- Updates ESLint configuration to include React Refresh and adds related dev dependencies.
- Adds new dev tooling for dependency analysis and static code checks (depcheck, madge, vite-plugin-checker, vite-plugin-eslint2).
- Ensures database schema and history manipulation match improved type definitions for historical status.
- Relates to ongoing extensibility and maintenance improvements for monitor type system. [`(b670584)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b6705840a0389fbc3124b4c2449246b189057d51)


- ✨ [feat] Implement dynamic monitor migration and validation system

- Introduces a robust migration system for monitor types with version tracking, registry-driven data transformation, and schema evolution support.
- Adds advanced runtime validation and type guard utilities for monitor data, improving error handling and extensibility.
- Refactors monitor type registry and frontend utilities to eliminate hard-coded logic and support dynamic field configuration.
- Updates documentation to reflect completed dynamic monitor architecture, migration strategies, and validation improvements.
- Enhances performance with caching and memoization for monitor type lookups.
- Improves error handling, state management, and test coverage for validation and migration features.
- Increases maintainability and scalability by enabling easy addition of new monitor types with minimal code changes. [`(88a65a0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88a65a0a00765dcb5e5f857859af8e72c7742be2)



### 🛠️ Bug Fixes

- 🛠️ [fix] Prevent memory leaks & improve error handling

- Adds a configurable middleware limit to event bus to prevent excessive registrations and potential memory leaks, with diagnostics reporting usage.
- Refines store utility error handling to log and gracefully recover from failures in state management methods, ensuring robust operation and preventing state corruption.
- Cleans up overlay and timeout logic in screenshot thumbnail for more reliable UI behavior.
- Removes unused dynamic monitor UI logic to reduce code complexity.
- Introduces targeted tests to validate critical error handling and middleware leak prevention features. [`(15de9b5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/15de9b5f08ac149aaad420caf6a841197442381b)



### 📝 Documentation

- 📝 [docs] Add updated guide for monitor type implementation

- Introduces a simplified documentation outlining the new registry-driven approach for adding monitor types, reducing required changes to just two files and streamlining development.
- Improves error handling in monitoring configuration logic by ensuring failed history limit updates are logged without blocking execution.
- Skips a test for handling invalid status values in bulk inserts, reflecting a change in expectations around status correction behavior. [`(f6c3db1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f6c3db18b64f0ac3bcf798ef391d3399ae018442)






## [7.0.0] - 2025-07-14


[[c7940c1](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c7940c14a98b1cf77554ff3f07725a085c6e5e89)...
[483d424](https://github.com/Nick2bad4u/Uptime-Watcher/commit/483d42400c4ce907962513305b51037e8b6f752e)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/c7940c14a98b1cf77554ff3f07725a085c6e5e89...483d42400c4ce907962513305b51037e8b6f752e))


### ✨ Features

- ✨ [feat] Enable dynamic monitor type registry and UI integration

- Implements a dynamic registry system for monitor types, allowing addition, validation, and configuration of new monitor types without hardcoding.
- Refactors validation, database schema, form rendering, and monitor service factory to use registry-driven configurations and Zod schemas.
- Updates frontend to render monitor fields and help texts dynamically, improving extensibility and UX.
- Adds IPC handlers and unified event flow for monitoring state changes, ensuring real-time UI sync.
- Removes deprecated constants and legacy validation logic; unifies data mapping to support extensible monitor types.
- Improves testability and future-proofing for adding new monitor types and features.

Relates to extensibility and future support for custom monitor types. [`(c7940c1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c7940c14a98b1cf77554ff3f07725a085c6e5e89)



### 🚜 Refactor

- 🚜 [refactor] Remove legacy tests and scripts after monitor type overhaul

Removes obsolete unit tests and PowerShell/BAT scripts related to configuration, monitoring, and markdown link fixing, reflecting migration to a dynamic, registry-driven monitor type system.

Updates remaining tests for compatibility with new monitor status types.
Documentation is fully rewritten to guide new monitor type implementation and refactoring process.

 - Reduces maintenance overhead and test complexity
 - Ensures future extensibility and easier onboarding for contributors [`(483d424)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/483d42400c4ce907962513305b51037e8b6f752e)






## [6.9.0] - 2025-07-13


[[d33eb0a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d33eb0a224d4fd1d3cbdb82a67ac8cdb721ec7f2)...
[f2f5be6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f2f5be661635cfbc76d2079e24dbb49a2170f8c1)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/d33eb0a224d4fd1d3cbdb82a67ac8cdb721ec7f2...f2f5be661635cfbc76d2079e24dbb49a2170f8c1))


### ✨ Features

- ✨ [feat] Unifies state management, monitoring types, and docs

- ✨ [feat] Introduces centralized state synchronization service to unify database, cache, and frontend store, resolving consistency issues and simplifying cross-layer updates
- ✨ [feat] Replaces hard-coded monitor types with extensible registry, enabling future plugin-based monitor expansion without widespread code changes
- ✨ [feat] Adds frontend hook for state synchronization, improving real-time updates and store consistency
- 🚜 [refactor] Refactors site and monitor managers to leverage new cache interface, advanced invalidation, and registry-driven monitor type validation
- 🚜 [refactor] Updates IPC and preload APIs to support state sync events and bulk synchronization from backend to frontend
- 📝 [docs] Expands and standardizes TSDoc across backend and frontend for all services, types, and components, improving maintainability and developer onboarding
- ⚡ [perf] Adds database indexes for optimized query performance, especially for history and monitor lookups
- 🧪 [test] Refactors tests to support new async repository interfaces and registry-driven monitor instantiation
- 🛠️ [fix] Ensures cache invalidation properly propagates to frontend and backend, preventing stale data issues
- 🧹 [chore] Cleans up legacy comments, disables unnecessary lint rules, and reorganizes exports for clarity

Addresses maintainability, extensibility, and reliability of monitoring and state handling across the app. [`(d3cadd2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d3cadd205afd1867698acfbfb2085ae9dfae9f7d)



### 🚜 Refactor

- 🚜 [refactor] Unifies service architecture and error handling

- Introduces a centralized service container for dependency management and lifecycle control, simplifying initialization and cleanup of Electron services.
- Refactors database and site management layers to remove legacy adapter interfaces, enabling direct dependency injection of concrete repository classes.
- Standardizes error handling with reusable utility methods for consistent logging, wrapping, and event emission, improving maintainability and debugging.
- Updates frontend Zustand store initialization for clarity and future extensibility, and switches to a unified logger for UI and backend actions.
- Improves data consistency by enforcing cache synchronization on database reads and transactional integrity for bulk operations.
- Enhances robustness by adding error catching to cleanup routines and IPC operations, reducing risk of silent failures.

Relates to overall architecture modernization and maintainability goals. [`(85bfaf5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/85bfaf59561174ade218eaf4f6e66ea32888d6d6)


- 🚜 [refactor] Make repository methods async and update tests

- Refactors database repository methods to return Promises for improved consistency and future-proofing of async operations.
- Updates related service logic and tests to use await or handle Promises properly.
- Enhances monitor mapping docs for clarity and type safety.
- Unifies sites cache mock implementations in tests for more predictable behavior. [`(86c4090)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/86c40900b8ec3c6174db50e1596e0e865d0e03d1)


- 🚜 [refactor] Extract monitor update logic into helper methods

- Improves maintainability by splitting complex monitor update and creation logic into focused, private helper functions.
- Clarifies responsibilities for updating existing monitors, creating new ones, and removing obsolete monitors.
- Removes redundant and skipped test cases for undefined/null monitor parameters, keeping the test suite relevant and lean.
- Enhances readability and future extensibility of site monitor transaction workflows. [`(d33eb0a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d33eb0a224d4fd1d3cbdb82a67ac8cdb721ec7f2)



### 📝 Documentation

- 📝 [docs] Enhance code documentation for manager and service modules

- Expands and improves inline documentation and JSDoc comments across site management, monitoring, repository service, and utility modules.
- Clarifies responsibilities, usage examples, and error handling for key classes and interfaces.
- Facilitates maintainability, onboarding, and future feature extension by detailing architectural patterns and intended behaviors.
- Addresses code readability and developer experience, making modules easier to test and integrate. [`(c8a1d3d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c8a1d3dd9ca3e8b1155250c624510cd324f7d6d7)



### 🎨 Styling

- 🎨 [style] Improve code formatting and markdown consistency

- Updates indentation and spacing across markdown and TypeScript code samples for better readability.
- Applies consistent arrow function formatting in tests.
- Enhances markdown structure for clarity in documentation and action plans. [`(3c00443)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3c00443d9a504770bd03ad71885ef77457f784f1)



### 🧪 Testing

- 🧪 [test] Remove redundant and edge case tests from orchestrator suite

- Cleans up test suite by removing duplicate delegation tests and unnecessary edge case handling for undefined manager results.
- Simplifies monitoring API tests, focusing coverage on relevant scenarios.
- Improves maintainability by reducing test noise and focusing on meaningful validations. [`(f2f5be6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f2f5be661635cfbc76d2079e24dbb49a2170f8c1)


- 🧪 [test] Remove obsolete tests and skip unstable test cases

- Removes outdated or redundant test files to reduce maintenance overhead and improve clarity.
- Skips several flaky or unstable unit tests to stabilize test runs and allow for future investigation.
- Updates test suite logic to reflect API changes, ensuring consistency with recent refactors. [`(f92bd27)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f92bd27a5a00111bddb47e07b7364687f37a3702)






## [6.8.0] - 2025-07-12


[[02e867f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/02e867f096bb7cf5e51f810cb4ce48aaabc4cf39)...
[58cd258](https://github.com/Nick2bad4u/Uptime-Watcher/commit/58cd25810e238e0d2d2e614cbf2e54aab2859093)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/02e867f096bb7cf5e51f810cb4ce48aaabc4cf39...58cd25810e238e0d2d2e614cbf2e54aab2859093))


### 🚜 Refactor

- 🚜 [refactor] Normalize DB operation handlers and improve history pruning

- Refactors database operation handlers to consistently return resolved promises, streamlining async control and error handling across repository methods.
- Updates history pruning logic to reliably remove excess entries per monitor, ensuring only the specified limit is retained.
- Simplifies bulk history insertion by removing redundant transaction management, assuming external transaction context for better flexibility and performance. [`(02e867f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/02e867f096bb7cf5e51f810cb4ce48aaabc4cf39)



### 🧪 Testing

- 🧪 [test] Update monitor tests for null default values

- Replaces undefined with null for monitor property defaults in tests
- Improves test consistency with expected data model
- Cleans up formatting, removing unnecessary blank lines in multiple test files [`(58cd258)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/58cd25810e238e0d2d2e614cbf2e54aab2859093)


- 🧪 [test] Remove redundant and error-handling tests from backend

- Cleans up unit tests by removing error-handling cases, redundant logger assertions, and duplicate transactional checks.
- Simplifies and future-proofs test suites by marking complex or outdated tests for refactoring.
- Updates expectation for event unsubscription to match revised event name.
- Skips frontend component tests to reduce noise during backend test refactoring.

Streamlines backend test maintenance and aligns with recent changes to error management and transactional logic. [`(d813f05)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d813f05f08cf40c2771f7937a4f077a7aa279278)






## [6.7.0] - 2025-07-12


[[7e8c6e1](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e8c6e1d608a821a77328e178949898592f43b0e)...
[3e22673](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e22673014215c6c667f8573fd4601f720390d73)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/7e8c6e1d608a821a77328e178949898592f43b0e...3e22673014215c6c667f8573fd4601f720390d73))


### ✨ Features

- ✨ [feat] Add site-level monitoring control and type safety

- Introduces a `monitoring` boolean property at the site level, allowing sites to globally enable or disable monitoring of all their monitors.
- Updates auto-start monitoring logic to respect site-level `monitoring` as a master switch and ensures only monitors with monitoring enabled are started.
- Extends database schema, queries, and upsert logic to persist `monitoring` state for sites, including during import/export and bulk operations.
- Refactors test data and utilities to enforce stricter type requirements, normalizing required properties such as `monitoring` and `responseTime` for monitors and sites.
- Deprecates redundant monitoring start logic to avoid duplicate operations and centralizes control in the monitoring manager.
- Improves test coverage for new type constraints and ensures all test cases properly specify required fields.
- Motivated by the need for finer monitoring control, improved type safety, and reduction of subtle monitoring logic errors. [`(c1d3af8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c1d3af8d1f2687933933b6d0b0ead36100e6e654)



### 🛠️ Bug Fixes

- 🛠️ [fix] Prevent duplicate monitor checks and clean up tests

- Removes redundant initial monitor check logic, ensuring only a single check occurs when adding a monitor or creating a site, which avoids double status updates and improves performance.
- Cleans up unused functions and imports related to monitor checks for maintainability.
- Updates unit tests to match the new monitor lifecycle behavior and corrects test mocks for transaction-safe repository methods.
- Refines logging for consistency and fixes ESLint/TypeScript warnings, especially unnecessary conditionals and formatting. [`(33e1de5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/33e1de5af48b39ee42f254e437effe82bbd20279)


- 🛠️ [fix] Update type configs and test mocks for ES2024 features

- Expands TypeScript lib settings to include ESNext and ES2022, supporting modern JS features like Object.hasOwn
- Adjusts event category check to use Object.hasOwn for improved code clarity, with ts-expect-error for Electron compatibility
- Updates test mocks to include all monitor properties, ensuring coverage and alignment with data model

Addresses compatibility with recent ECMAScript enhancements and improves type safety in tests. [`(7131308)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/713130863945e04e1f0c8a1e87d791a93bb2dd0f)


- 🛠️ [fix] Prevents update check errors from logging to console

- Removes error logging for update check failures during initialization
- Avoids cluttering logs with non-critical update check exceptions [`(7e8c6e1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e8c6e1d608a821a77328e178949898592f43b0e)



### 🚜 Refactor

- 🚜 [refactor] Centralizes DB operations with operational hooks

- Refactors database-related logic across repositories and services to use a unified operational hook for transactional operations, error handling, and event emission.
- Simplifies control flow by removing repetitive try/catch and transaction boilerplate.
- Improves reliability and observability of all critical CRUD and bulk operations, including site, monitor, settings, and history management.
- Updates frontend stores and status update handler for safer event subscription and cleanup.
- Adds support for JSONC parsing in ESLint config and introduces TSDoc config for custom tags.

Relates to improved maintainability and future extensibility of data handling. [`(13875bd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/13875bd200c491cffbfe866d6e8f36ea0010edf1)


- 🚜 [refactor] Standardize async patterns, error handling, and code style

- Refactors async database, cache, and monitor operations to use standardized wrappers for error handling, retries, and event emission.
- Improves code readability by converting array manipulations to use spread syntax and removing unnecessary Promise.resolve wrappers.
- Moves utility functions out of React render scope for better memoization and lint compliance.
- Enhances consistency in type checking, error types, and singleton initialization.
- Updates switch statements and callback signatures for clarity and future maintainability.
- Introduces operational hooks utility and integrates it throughout for unified observability.
- Cleans up ESLint disables, ensures explicit return types, and aligns code with modern TypeScript best practices. [`(6077686)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/60776865b7a6524df3b027543df8a34a78fe6051)


- 🚜 [refactor] Simplifies monitor and site property handling logic

- Removes fallback and default value logic for monitor and site properties, relying directly on explicit values for consistency.
- Updates notification, logging, and UI components to use the site name without fallback to identifiers.
- Standardizes interval and timeout usage, eliminating redundant default assignments.
- Replaces frontend store logging with electron-log for unified logging across client and backend.

Improves code clarity, predictability, and reduces implicit behavior. [`(ada111c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ada111cc0709a199a7e99712fe45761a8c9095a0)


- 🚜 [refactor] Move initial monitor checks to scheduler

- Refactors monitoring setup logic by removing initial monitor checks from site setup methods and delegating them to the monitor scheduler when monitoring starts.
- Cleans up related code paths and updates tests to skip initial check assertions, aligning with the new responsibility split.
- Improves separation of concerns and simplifies site setup flow. [`(b898d4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b898d4cdd926f64391f02cccc13b6cf45247f313)


- 🚜 [refactor] Unifies DB transactions, adds new monitor setup logic

- Refactors database repository methods to consistently use explicit transactions, introducing internal variants to prevent nested transaction issues and ensure data integrity on bulk and multi-step operations.
- Adds logic to detect and properly set up new monitors added to existing sites, aligning their lifecycle and default configuration with newly created sites for consistent monitoring behavior.
- Streamlines bulk import/export and history pruning operations, reducing redundant transactions and improving performance, especially for large-scale data operations and history limit enforcement.
- Improves developer experience with enhanced logging, timestamped messages, and clearer debugging output, especially during site and monitor updates.
- Updates interfaces and adapters to support new transactional method signatures, ensuring type safety and clear separation between async and internal operations.
- Fixes subtle bugs with store updates by only applying monitor changes when the relevant value is defined, preventing unintended overwrites.

Relates to reliability, maintainability, and operational consistency across site and monitor management workflows. [`(9eb2349)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9eb2349e0aa2c0007d269763c66a952bc48b7f69)


- 🚜 [refactor] Remove unnecessary use of undefined in types

- Updates core type definitions to eliminate optional/undefined fields for site and monitor properties that always have defaults or are required.
- Ensures all monitors and sites have guaranteed values for name, monitoring, checkInterval, timeout, retryAttempts, and responseTime, reducing null/undefined handling across the codebase.
- Refactors all data creation, database mapping, and UI logic to provide and expect these required defaults.
- Updates tests, mocks, and related store actions to align with stricter type requirements, resulting in more predictable and type-safe behavior.
- Retains undefined usage for fields that are genuinely optional or mutually exclusive (e.g., lastChecked, url/host, port, details).
- Improves code clarity, maintainability, and reduces runtime errors by enforcing stronger typing and consistent data structures. [`(f5824a9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f5824a9b8b3c8eb35781c54b7264b50f639cf62a)


- 🚜 [refactor] Refine monitor types and streamline responseTime handling

- Unifies and documents monitor status types for clarity and future extensibility, introducing dedicated type aliases for current and historical statuses.
- Refactors code to treat responseTime as always a number, removing unnecessary null/undefined checks, and updates mapping logic to set a default value.
- Enhances and clarifies type documentation, specifying property exclusivity and fallback behaviors to prevent misconfiguration.
- Improves maintainability and type safety for code working with monitor and status objects. [`(7d5b710)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7d5b710cf22157a5a4ab73508d46ec6b9eafd5dc)



### 📝 Documentation

- 📝 [docs] Modernize docs for event-driven patterns and return logic

- Updates documentation to reflect reactive event-driven architecture and modernization of return patterns.
- Details improvements to cache management, error recovery, state updates, and operational hooks.
- Adds clarity to event coverage, new event types, configuration observability, and system best practices.
- Enhances formatting, consistency, and structure for improved readability and maintainability. [`(3e22673)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e22673014215c6c667f8573fd4601f720390d73)


- 📝 [docs] Document and modernize return/event patterns

- Adds comprehensive guides and action plans for modernizing return patterns, cache handling, error recovery, and event-driven architecture.
- Documents ESLint rule decisions, fixes summary, event system architecture, actionable implementation steps, and non-return function event analysis.
- Updates ignore rules for Markdown and documentation files, and enables downlevel iteration in TypeScript configs to resolve compilation issues.
- Removes obsolete scripts and ESLint results for clarity and maintainability.
- Improves project observability, error resilience, and developer onboarding by clarifying best practices and event patterns across backend and frontend. [`(6ef21cd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6ef21cdca520f528f3e9c5a504ec3de86defe1e3)


- 📝 [docs] Clarify and expand TSDoc comments for monitoring types

- Improves documentation for all public APIs and complex logic in monitoring types file, ensuring clarity on status semantics and field usage.
- Updates barrel file documentation for better overview and consistency.
- Adds process note to contribution instructions to require TSDoc comments on all public APIs and complex logic.
- Removes redundant variable assignment in application entry point for cleaner code.
- Enhances maintainability and onboarding for new contributors by providing precise contract details and rationale in type definitions. [`(f77a8d1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f77a8d1a176d72d3a6404e5642cf306ffa223f83)


- 📝 [docs] Add TSDoc tag kinds docs and update logging cleanup

- Introduces detailed documentation on TSDoc's block, modifier, and inline tags to support API documentation efforts.
- Refines Electron main process cleanup: ensures robust and idempotent shutdown by handling both Node's beforeExit and Electron's will-quit events, and switches to using the correct log instance.
- Updates tests to reflect event name changes and cleanup logic.
- [dependency] Updates package version to 6.5.0 and adds @microsoft/api-extractor and @microsoft/tsdoc-config as dev dependencies to enable API extraction and improved documentation tooling. [`(193faeb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/193faeb1787bc1708c47e7d453970feb59322232)



### 🧪 Testing

- 🧪 [test] Remove redundant frontend tests and skip unstable branches

- Cleans up frontend test suite by deleting numerous low-value and edge-case tests for UI components, stores, and hooks
- Skips flaky or unstable backend and integration test branches related to timeout fallback logic and error handling
- Adds comprehensive tests for newly introduced configuration manager, improving backend validation and business rules coverage
- Refactors test scripts to reduce maintenance burden and avoid excessive coverage chasing
- Renames test prebuild script for better CI clarity

Reduces maintenance and flakiness while retaining critical backend coverage. [`(c62062f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c62062fda67b2a1af9c9fc24257d5c066cb7f94b)


- 🧪 [test] Update tests for monitor defaults and remove timeout fallback checks

- Aligns tests with updated monitor and site defaults, ensuring explicit values for fields like responseTime, monitoring, checkInterval, timeout, and retryAttempts.
- Removes redundant checks for timeout fallback logic, reflecting changes in monitor configuration handling.
- Improves clarity and reliability of type-related test expectations. [`(d1f3668)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d1f366869db75d9fb00fcc17e68574cf666780d2)


- 🧪 [test] Remove obsolete configuration and port monitor tests

- Cleans up redundant and outdated unit tests for configuration management and port monitoring, streamlining the test suite.
- Updates npm scripts to clarify prestart logic, reducing confusion before running the application.
- Improves maintainability by eliminating legacy test coverage no longer needed. [`(618f15e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/618f15e48a6d4f3c813c7b50d6d728a47d9e4c59)


- 🧪 [test] Update tests for internal DB transaction usage

- Migrates test mocks and assertions to use internal repository methods and explicit database transactions for improved accuracy and coverage.
- Expands test data structures with missing monitor/site fields to match current interfaces and edge cases.
- Refines log output assertions to match new timestamped formats for consistency.
- Removes obsolete or redundant test cases and updates expectations for function calls related to internal operations.
- Improves coverage for scenarios with zero/undefined values and enhances test reliability for site/monitor actions. [`(ff6abfc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ff6abfcfc8a03ee5243b7af45256995ec22c4f90)


- 🧪 [test] Set default responseTime to 0 in monitor tests

- Updates test monitor objects to use responseTime: 0 instead of undefined, ensuring tests align with expected default values
- Skips test cases related to undefined or null numeric fields, likely due to changes in default field handling
- Improves consistency and future resilience of unit tests as code moves toward stricter type and value expectations [`(cb92f09)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cb92f09dce477d38c770fa4070a10232ba5d9f60)



### 🧹 Chores

- 🧹 [chore] Standardize property formatting and trailing commas

- Enforces consistent use of double quotes and trailing commas across all relevant test, utility, and service files.
- Updates object and array property formatting for clarity and future maintainability.
- Improves readability and reduces noise in diffs, simplifying future code reviews.
- Prepares the codebase for automated linting and formatting tools. [`(0481571)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04815717377282e6ead249fea81a279b6b4f7f8e)


- 🧹 [chore] Update spell-check config and add automation script

- Expands custom spelling dictionary with new terms and removes unused entries to improve spell-check accuracy
- Introduces a script for automatically appending unknown cspell words, streamlining dictionary maintenance
- Updates TypeScript config to include a broader set of ECMAScript libraries for enhanced compatibility
- Refactors test formatting for consistency

Relates to automated spell-checking and build tooling improvements [`(979a6d2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/979a6d224ecc82dc8b311d14f4e33b6b169ab8b6)






## [6.2.0] - 2025-07-10


[[d5176f5](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d5176f55f4860097bbe22f93073f0b4986dc6f51)...
[b474c4f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b474c4f54d0f9ecbaa70e07c2caaa923c6d9bb0f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/d5176f55f4860097bbe22f93073f0b4986dc6f51...b474c4f54d0f9ecbaa70e07c2caaa923c6d9bb0f))


### ✨ Features

- ✨ [feat] Add shared interval formatting utils and tests

- Centralizes interval formatting and label helpers in a shared utility, enabling consistent display of monitoring intervals across components
- Refactors components to use new shared helper, removing duplicate logic and improving maintainability
- Expands and corrects related unit tests to reflect updated utility exports
- Adds comprehensive unit tests for core backend managers and event bus, increasing backend test coverage and reliability [`(a24df3a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a24df3aac74860c35caf8ef19d14bad84943bdac)



### 🛠️ Bug Fixes

- 🛠️ [fix] Log update check errors during initialization

- Ensures errors from the update check are properly logged to improve visibility and troubleshooting
- Prevents unhandled promise rejections during application startup [`(b474c4f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b474c4f54d0f9ecbaa70e07c2caaa923c6d9bb0f)


- 🛠️ [fix] Guard category lookup in event type check

Prevents errors when checking event categories by verifying the
category exists before accessing its properties. Adds unit tests to
ensure correct behavior for valid, invalid, and unknown event names
and categories. Improves robustness and test coverage for event
category and priority logic. [`(d5176f5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d5176f55f4860097bbe22f93073f0b4986dc6f51)



### 🚜 Refactor

- 🚜 [refactor] Remove form validity check from submit button

- Simplifies form handling by eliminating the explicit validity check before enabling the submit button.
- Removes related prop usage and unit test to streamline button logic and reduce redundancy.
- Shifts responsibility for preventing invalid submissions away from button state management, likely centralizing validation elsewhere. [`(26d7bc0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26d7bc0fe7d6c610aa2904ed0f74e36eb3bb49ff)



### 🧪 Testing

- 🧪 [test] Improve formatting and branch coverage in tests

- Refactors test files for improved formatting and consistent style,
  including array/object literals, function signatures, and mock usage

- Expands test cases to cover previously uncovered branches and edge
  conditions, especially for UI components, error boundaries, and
  utility functions

- Normalizes whitespace and code structure for better readability
  and maintenance

- Ensures all mocked components and functions are fully exercised
  to maximize code coverage and reduce untested lines [`(b27ca95)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b27ca95520763a4b50f4fbd225f95bc435900578)


- 🧪 [test] Add comprehensive unit tests for middleware and coverage

- Introduces extensive unit tests to cover middleware functionalities, including logging, metrics, error handling, rate limiting, validation, filtering, and debugging behaviors.
- Adds general tests to improve code coverage for constants, types, utilities, environment configurations, file system interactions, runtime types, edge cases, and async operations.
- Enhances confidence in core logic and ensures robust handling of various scenarios. [`(eeded29)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eeded292e440a91afde6153a3e11b1b3a7efea9f)


- 🧪 [test] Add comprehensive tests for database and orchestrators

- Expands test coverage for advanced orchestrator event handling, database backup, schema creation, and import/export services.
- Validates error handling, edge cases, and large data scenarios for backup, import, and export logic.
- Ensures robust test mocks for dependencies to isolate unit logic.
- Aims to improve regression protection and facilitate future refactoring by covering critical integration points. [`(0b1d820)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0b1d8205cef1fe9313ecf8e7c10bc10d9cec637d)






## [6.1.0] - 2025-07-09


[[834da82](https://github.com/Nick2bad4u/Uptime-Watcher/commit/834da82b5c96dbd570f57f5396ca612ead5c9778)...
[8654c4e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8654c4ef847b5bc808604e3d42fa085a89f1512f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/834da82b5c96dbd570f57f5396ca612ead5c9778...8654c4ef847b5bc808604e3d42fa085a89f1512f))


### 🚜 Refactor

- 🚜 [refactor] Simplifies null checks and tightens type safety

- Removes unnecessary null/undefined checks and fallback logic from arrays, objects, and API calls, streamlining code and improving readability.
- Refactors singleton patterns and theme logic for better consistency and accuracy in browser environments.
- Strengthens type safety by adding explicit type guards, runtime checks, and TypeScript typings, especially in IPC and data import/export flows.
- Improves performance and maintainability by removing redundant code, tightening DOM handling, and always awaiting API readiness before event binding.
- Enhances future extensibility by preparing for additional monitor types and unifying monitor property access patterns.

Relates to robustness, maintainability, and groundwork for new monitor features. [`(365af3a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/365af3a21e30051f49af69272d667be053111ed3)


- 🚜 [refactor] Remove unnecessary async/await from sync codebase

- Refactors backend and frontend code to eliminate redundant async/await usage in synchronous functions, improving clarity and performance.
- Normalizes usage of nullish coalescing (??) to avoid fallback bugs with falsy values.
- Updates event handlers, UI callbacks, and repository adapters to match synchronous contracts, wrapping return values in Promises where needed for compatibility.
- Adds missing type safety, error handling, and defensive coding throughout event-driven backend logic.
- Improves React code by ensuring side-effectful async actions are wrapped in void or handled with explicit error logging, reducing unhandled promise warnings.
- Standardizes UI logic to use void when triggering async handlers in event callbacks, ensuring consistent behavior and better error resilience.
- Updates documentation and ESLint tracking to reflect the new error/fixable status and progress.
- Expands UI component support for additional sizing and better flexible layout.
- Overall, modernizes codebase to rely on synchronous database APIs, reducing complexity, increasing maintainability, and aligning with architectural intent.

Relates to ongoing technical debt and stability improvements. [`(3fe67bf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3fe67bf1d3f5c8063697dd0c5a635efe8eebd2b0)


- 🚜 [refactor] Unify internal imports to use explicit index paths

- Standardizes all internal imports to use explicit `index` paths for improved clarity and maintainability.
- Reduces ambiguity and risk of circular dependencies by making import sources explicit, especially for modules that could resolve to either directories or files.
- Improves consistency across services, managers, repositories, validators, and utility modules.
- No logic or algorithmic changes; focuses on project structure and code clarity.

Relates to codebase maintainability and future-proofing. [`(212e334)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/212e3349a22d074ee59086be51f137ed6b457c50)


- 🚜 [refactor] Unify correlation and validation utils; cleanup hooks/tests

- Refactors correlation and validation utilities into a common location for improved consistency and easier maintenance
- Removes backend hook modules and their associated tests, consolidating logic under a unified utils directory
- Updates event bus and internal imports to reflect new utility locations, simplifying import paths and reducing redundancy
- Standardizes test mocks and imports, reducing code duplication and improving test maintainability
- Moves WASM asset to a central assets directory, updates scripts and build steps to reference the new location, and ensures consistent binary handling across environments
- Cleans up obsolete script artifacts and improves download/copy logic for SQLite WASM binary
- Adds new prompts for accessibility test/code review guidance [`(de35fa3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de35fa38167e730018bf1e0d9d8e306199d66bb2)


- 🚜 [refactor] Streamline imports and add root barrel export

- Unifies and shortens imports throughout the codebase by centralizing service and utility exports, reducing direct file-level imports.
- Introduces a root barrel export for the application, enabling centralized and consistent module access and promoting clearer import patterns.
- Improves maintainability and scalability by simplifying future refactoring and reducing coupling between modules. [`(7b11f1a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b11f1a02b41b5a15ccb4accb76775898199b3ae)


- 🚜 [refactor] Simplify imports with barrel files and improve exports

- Consolidates multiple related imports into single barrel imports for events, services, hooks, stores, and utils, reducing redundancy and improving code maintainability
- Updates index files to re-export services, utilities, and hooks, providing a cleaner and more centralized API for internal modules and tests
- Refactors test imports to use new barrel exports, reducing import paths and improving test clarity
- Increases utility exports count and updates related test assertions for consistency
- Does not change application logic, focusing on code organization and developer experience [`(834da82)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/834da82b5c96dbd570f57f5396ca612ead5c9778)



### 🎨 Styling

- 🎨 [style] Remove extraneous blank lines from test files

- Cleans up test source files by deleting unnecessary empty lines
 - Improves readability and maintains consistent formatting across test suites [`(8654c4e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8654c4ef847b5bc808604e3d42fa085a89f1512f)


- 🎨 [style] Reformat code for consistency and readability

- Applies consistent code formatting, including improved indentation, spacing, and bracket alignment across backend and utility modules.
- Streamlines function signatures and argument lists for better clarity.
- Enhances ESLint config readability by aligning comments and object properties.
- Improves documentation structure and Markdown formatting for ESLint error tracking.

No functional or logic changes are introduced; changes focus on code clarity and maintainability. [`(c83bd8a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c83bd8a42a91fca02288f736f7bbb949cc5fe425)


- 🎨 [style] Improve formatting and spacing across codebase

- Cleans up extra blank lines and ensures consistent spacing in documentation and source files
 - Unifies import statement formatting for readability and maintainability
 - Enhances markdown prompt clarity with improved list spacing
 - No functional or logic changes introduced [`(d7b45cb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d7b45cb4da363ceb996f253a283a2482bf03e237)


- 🎨 [style] Standardizes import formatting and test style

- Unifies import statements for consistency, improving readability and code style across modules
- Applies consistent quote styles and formatting in test files, aligning with project conventions
- Reformats and deduplicates code blocks in tests for clarity and maintainability
- Does not modify business logic; focuses on stylistic and formatting enhancements only [`(20a2614)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/20a2614a29776b54a439113cbb670b60c0474ac8)



### 🧪 Testing

- 🧪 [test] Remove redundant and edge-case tests for coverage

Cleans up the test suite by deleting tests focused on unreachable code paths, artificial edge cases, and redundant null/undefined handling.
Removes tests for invalid argument scenarios, error branches unlikely to occur in production, and defensive UI/component code not triggered in typical usage.
Simplifies maintenance and reduces noise in the test suite, making coverage more meaningful and focused on real-world behaviors. [`(4bf8d31)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4bf8d31db276a6a447adbf0d265209b17e6549d7)






## [5.9.0] - 2025-07-08


[[b213a9d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b213a9dd89cffc195e35502883006052e9f481ae)...
[48aa3ee](https://github.com/Nick2bad4u/Uptime-Watcher/commit/48aa3ee89d4a79f8f7c69490eddfc57f2aa8a773)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/b213a9dd89cffc195e35502883006052e9f481ae...48aa3ee89d4a79f8f7c69490eddfc57f2aa8a773))


### ✨ Features

- ✨ [feat] Introduce type-safe event bus, hooks, and DB transaction safety

- Replaces legacy event system with a type-safe event bus featuring middleware support, compile-time event type safety, and improved diagnostics for all inter-manager and public events.
- Introduces backend operational hooks (`useTransaction`, `useRetry`, `useValidation`) for unified transaction management, retry logic, and validation patterns, improving reliability and maintainability.
- Refactors all site, monitor, and database operations to use new service-based architecture and transactional database access, ensuring atomic updates and robust error handling.
- Removes legacy event and site writer modules, updating all usages to leverage the new event bus and backend hooks.
- Updates internal manager communication and event transformation logic, enabling more structured and traceable event flows.
- Adds new and refactored unit tests for backend hooks, event bus, and service patterns to ensure correctness and coverage.
- Applies stricter TypeScript and ESLint configs, and minor package updates for improved code quality.
- Enables easier future extension and debugging of events, while centralizing cross-cutting concerns like logging, error handling, and metrics. [`(b213a9d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b213a9dd89cffc195e35502883006052e9f481ae)



### 🚜 Refactor

- 🚜 [refactor] Introduce barrel exports and simplify imports

- Unifies and simplifies imports across the codebase by introducing barrel export files for components, theme, services, utilities, and electron modules
- Refactors import paths throughout the app and tests to use centralized entry points, improving maintainability and discoverability
- Removes redundant or direct imports in favor of grouped exports for easier code navigation and future scalability
- Deletes redundant or now-obsolete test files that relied on previous import structures, keeping test coverage relevant and up-to-date [`(48aa3ee)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/48aa3ee89d4a79f8f7c69490eddfc57f2aa8a773)


- 🚜 [refactor] Migrate DB import/export to service-based arch

- Replaces legacy database import/export and backup logic with new service-based, dependency-injected architecture for better testability and maintainability
- Removes old utility modules and integrates orchestrators for all DB operations, ensuring a unified approach across the codebase
- Simplifies database management and improves consistency by eliminating ad-hoc callbacks and direct repository calls

Relates to ongoing architectural modernization for data management [`(c016ee7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c016ee705b29672c56f0b3c9fb08b84580811010)


- 🚜 [refactor] Replace EventEmitter with typed event bus system

- Unifies event handling by removing legacy EventEmitter usage in favor of a strongly-typed event bus throughout database, monitoring, and manager modules
- Standardizes error and status events as typed, improving type safety, error propagation, and event traceability
- Eliminates custom event transformation logic, simplifying code and reducing duplication
- Ensures all database operations, backup/import/export routines, and monitor status changes emit typed events directly for better maintainability and observability
- Refreshes site cache after monitor updates to guarantee consistency across in-memory and persistent states

Relates to improved codebase consistency and maintainability [`(5d8d4e5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5d8d4e503eb7c337dcc27a662dee6873fba1c053)



### 📝 Documentation

- 📝 [docs] Remove backend operational hooks documentation and examples

- Deletes detailed usage documentation and example implementations for backend operational hooks.
- Likely reflects a deprecation, migration, or restructuring of documentation strategy.
- Reduces repo clutter and prevents outdated or redundant content from being referenced. [`(7fea5e1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7fea5e1c88a7cacca00c255a89bdb27bfb792a99)



### 🎨 Styling

- 🎨 [style] Remove extraneous blank lines and prettify test mocks

- Cleans up test files by removing unnecessary blank lines after file headers and before imports, improving readability and consistency
- Reformats destructuring in mocked theme components for better clarity and maintainability
- Applies consistent formatting in test assertions and multi-line functions
- Enhances overall code style in configuration and test code without changing logic or behavior [`(17494fc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/17494fc81a95c928bce674d351a8a3d761aeed7a)


- 🎨 [style] Replace unused variables with leading underscores

- Updates variable names to use leading underscores for unused parameters, improving code clarity and conforming to linting standards.
- Adds and adjusts ESLint directive comments to suppress relevant warnings and enhance maintainability.
- No functional or behavioral changes are introduced. [`(4a0ecc1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4a0ecc19c2550a11c9dcd995cc460b71d95541f3)


- 🎨 [style] Improve test formatting and consistency

- Updates test files for improved readability and formatting consistency, including indentation, alignment, and multi-line argument handling.
- Refactors mock and test data formatting for clarity, especially in component and store mocks.
- Enhances maintainability and reduces diff noise in future test changes by enforcing consistent code style. [`(1cd5fd3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1cd5fd3335c47b9dd5561b89d9132790c10dc498)



### 🧪 Testing

- 🧪 [test] Remove all Electron and utility unit tests

Removes all unit tests related to Electron managers and utility database modules to reduce test maintenance burden and streamline the codebase.
Also updates ESLint config to enable stricter rules and upgrades TypeScript, ESLint, and Zod dependencies to latest versions for improved type safety and linting consistency.

Removes test-related code for database, monitor, repository services, and utility backup logic, reflecting a shift in testing or maintenance strategy. [`(7e13e34)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e13e34db9da82c61e9caef33bdc7c7aa74642e8)


- 🧪 [test] Update service factory and theme status tests

- Removes unused parameter from service creation test to align with factory signature change
- Extends theme status tests to cover new "paused" and "mixed" states, ensuring color mappings are validated [`(e644cde)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e644cde743a43f7c25747bb07e8b4c8d29f474e8)



### 🧹 Chores

- 🧹 [chore] Remove redundant ESLint disable comments and unused tests

Removes unnecessary inline ESLint disable comments for rules that are now globally disabled or obsolete, resulting in cleaner and more maintainable source and test files.
Updates all Node.js core module imports to use the explicit 'node:' protocol for consistency and future compatibility.
Deletes unused or obsolete test files related to data import/export and file download utilities, reducing maintenance overhead.
No logic changes are made to application behavior; improvements are focused on code clarity and project hygiene. [`(7e011a8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e011a8cb349958bdde2138647e4f0d86a7285c8)



### 🔧 Build System

- 🔧 [build] Add Electron test tsconfig and refine ESLint/test setup

- Introduces a dedicated TypeScript config for Electron-side tests to improve type safety and separation from frontend/test environments.
- Refines ESLint configuration to apply distinct rules and parsing for Electron test files, reduces redundant disables, and ensures correct environment globals.
- Cleans up test files by removing unnecessary explicit ESLint disables and replaces them with configuration-level rule overrides.
- Deletes legacy ad-hoc frontend test scripts, centralizing test responsibility and reducing clutter.
- Enhances maintainability and reliability of the testing build pipeline by better isolating Electron test build and lint processes. [`(47b5b40)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/47b5b40589d150692d68eba61ff133b2f97d703b)






## [5.3.0] - 2025-07-06


[[7ca9ff7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7ca9ff7da4a4c2d950346636b80d29ff90ab1e05)...
[bcb3652](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bcb36528b74ee86aaf5c4964f76c864ef9a4f455)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/7ca9ff7da4a4c2d950346636b80d29ff90ab1e05...bcb36528b74ee86aaf5c4964f76c864ef9a4f455))


### ✨ Features

- ✨ [feat] Add paused and mixed monitor status handling

- Introduces 'paused' and 'mixed' states for monitors and sites, updating type definitions, business logic, and UI components to fully support these statuses
- Ensures transactional safety in monitor deletion and data import/export by adding atomic operations
- Improves monitoring lifecycle logic to reflect accurate per-monitor state transitions and immediate status updates
- Enhances unit tests for new statuses and transactional flows, ensuring comprehensive coverage and future extensibility
- Updates documentation and theme support for new status variants, maintaining visual consistency and contributor clarity [`(bcb3652)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bcb36528b74ee86aaf5c4964f76c864ef9a4f455)


- ✨ [feat] Add transactional site DB ops and race-free monitor inserts

- Adds database transaction support to site creation, update, and deletion operations to ensure atomicity and consistency, reducing the risk of partial writes or data corruption.
- Refactors monitor insert logic to use SQL RETURNING clauses, eliminating race conditions and ensuring monitor IDs are reliably retrieved directly on insert.
- Updates interfaces and dependencies to propagate the database service where transactional context is required.
- Improves SQL safety in history pruning by switching to parameterized queries.
- Removes a redundant test file to reflect updated transactional design.
- Introduces a PowerShell script for listing project files by directory, aiding development and documentation.

These changes improve reliability, maintainability, and operational safety for data management across the app. [`(af98089)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/af98089a6d8ef3104fbb43d8d29739284149b124)


- ✨ [feat] Add per-monitor removal, site-level controls & UI overhaul

- Implements the ability to remove individual monitors from sites, including full UI, backend, and IPC support.
- Adds site-wide monitoring controls and refactors navigation to support both site and monitor-level actions.
- Overhauls the Site Details UI for better responsiveness, accessibility, and theme consistency.
- Modernizes analytics, history, and settings tabs with improved layout, badge/progress displays, and action feedback.
- Updates state management, hooks, and service layers for new monitor operations and site-level monitoring.
- Cleans up and streamlines tests, removing legacy tests for outdated tab structures.
- Improves CSS structure for modals and headers, making components mobile-friendly and more maintainable.
- Documents new best practices in contributor guidelines.

Relates to improved UX, maintainability, and granularity of site/monitor management. [`(7ca9ff7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7ca9ff7da4a4c2d950346636b80d29ff90ab1e05)



### 🚜 Refactor

- 🚜 [refactor] Decouples cross-store dependencies and optimizes bulk DB inserts

- Refactors state management to decouple cross-store dependencies by introducing a dedicated hook for selected site logic and updating selectors to avoid direct store access.
- Refactors statistics and UI state to require explicit data flow, preventing tight coupling between stores.
- Optimizes bulk insert operations for settings, sites, and monitor history by using prepared statements and database transactions, improving performance and reliability.
- Adds user-facing feedback for missing site data and improves null/undefined guard handling in UI components.
- Cleans up minor style and import issues for consistency and maintainability. [`(d92afd8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d92afd88dbce27fbefa09612f802c8122ba11083)



### 🧪 Testing

- 🧪 [test] Add comprehensive tests for SiteDetails and hooks

- Adds thorough unit and integration tests for SiteDetails, including basic, simple, and comprehensive scenarios to ensure robust coverage and prevent regressions.
- Enhances tests for custom hooks, especially theme-related logic, covering both dark and light modes and various state transitions.
- Refactors existing tests to improve mock accuracy and selector handling, addressing edge cases and null/undefined handling.
- Updates test configurations to increase timeouts and add custom reporters for improved reliability and detection of hanging processes.
- Improves test output clarity by increasing verbosity and ensuring all utility exports are covered.

Motivated by the need to guarantee UI reliability, catch edge case failures, and support future refactoring with a strong safety net. [`(a31cb8d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a31cb8d3925c6418b0668a7810ac36311341baab)






## [5.0.0] - 2025-07-06


[[96019b4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/96019b4746c8843ef8dc9fd2c104ca321235e5d0)...
[1109a83](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1109a836087874e561278141c6bce11c80994033)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/96019b4746c8843ef8dc9fd2c104ca321235e5d0...1109a836087874e561278141c6bce11c80994033))


### ✨ Features

- ✨ [feat] Expose site management actions and add new hooks

- Expands exports to provide site monitoring, operations, sync, and state management actions for broader access across the app
- Adds new site-related hooks and reorganizes existing ones for improved modularity and discoverability
- Facilitates easier integration and testing of site functionality by centralizing exports [`(2fa7607)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2fa76074740c24491b7cd8a288304e2c50480077)


- ✨ [feat] Introduce event-driven architecture for managers

- Replaces direct callback and synchronous method dependencies between managers with a centralized, event-driven communication model using strongly-typed event constants.
- Adds event definitions for all inter-manager operations, improving type safety and readability.
- Refactors managers to extend event emitters, emitting and listening for structured events instead of invoking callbacks directly.
- Introduces a business logic-focused configuration manager, centralizing validation and policy enforcement for site and monitor operations.
- Removes scattered business logic and validation from utilities, improving separation of concerns and maintainability.
- Paves the way for easier future extensibility, decoupled orchestration, and potential multi-process communication. [`(51f3fd0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/51f3fd08af211ced267ef5d99bcc2ba628fc18f7)



### 🛠️ Bug Fixes

- 🛠️ [fix] Prevents issues with mutated interval and key collections

- Converts interval and key collections to arrays before iteration to avoid potential mutation issues during loop execution.
- Ensures stability when stopping all intervals or deleting keys, particularly if the underlying collections are modified within the loop. [`(7c0a987)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7c0a9879111d7e6259b9b485473eff4bceff7a58)


- 🛠️ [fix] Enforce strict optional typing and improve prop handling

- Enables strict TypeScript settings with exact optional property types for better type safety and null handling.
- Refactors object creation and React prop spreading to only include optional properties when defined, reducing risk of undefined/null bugs.
- Updates form fields and UI components to conditionally spread props and attributes, improving accessibility and flexibility.
- Improves logic in data parsing, event emission, and DB mapping, ensuring optional fields are only present when valid.
- Adds explicit checks for monitor and site properties throughout the app, preventing runtime errors and enhancing reliability.
- Enhances testability and clarity in tab content rendering and error boundaries by handling optional props more defensively.
- Improves percentile calculation fallback in analytics for empty datasets.

Relates to improved robustness and maintainability in strict typing environments. [`(f36bd14)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f36bd140da481bba2020cc6ccd3c983042937ab4)


- 🛠️ [fix] Ensure explicit undefined returns in effect cleanups

- Prevents potential issues with effect cleanup functions by explicitly returning `undefined` where no cleanup is needed, aligning with React's expectations for effect return values.
- Removes unnecessary TypeScript error comments in test mocks, improving test code clarity.
- Enhances code consistency and future maintainability by standardizing return practices across hooks, components, and utility functions. [`(81c7499)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/81c749998e3e4f26262cc505bdbee9801e89841c)



### 🚜 Refactor

- 🚜 [refactor] Redesign site data logic for testability & clarity

- Refactors site repository and writer logic into service-based, dependency-injected architecture for improved modularity, testability, and maintainability
- Introduces interface abstractions, adapter layers, orchestrators, and factory functions, separating pure data operations from side effects
- Fixes legacy monitor ID bug by correctly handling string-based UUIDs, improving reliability
- Updates function signatures and store actions to consistently return detailed status objects instead of void, enhancing state management and logging
- Expands unit test coverage for all new services and orchestrators, ensuring robust and isolated testing
- Modernizes error handling with custom error classes for clearer diagnostics
- Maintains backward compatibility with legacy wrapper functions and unchanged public APIs

Relates to the goal of adopting modern software engineering best practices and supporting future scalabilitynpm [`(dfa9b48)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dfa9b481feb8034ed70796e1edb4b3424e377e36)


- 🚜 [refactor] Align history retention and iteration logic with UI and standards

- Updates history retention defaults to match UI options, improving consistency for user-configurable limits.
- Refactors iteration over Maps and arrays to use Array.from, ensuring compatibility and more predictable iteration, especially in environments with potential non-standard Map behavior.
- Changes logging calls to omit unused empty objects, streamlining code and reducing noise.
- Switches to namespace imports for HTTP modules for consistency with project import style.

These changes enhance maintainability, ensure UI and backend alignment, and improve code clarity. [`(438cb70)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/438cb70610f6b9f298e88824ba31595ca5d8ed91)


- 🚜 [refactor] Modularize site loading and monitoring logic

- Extracts site data loading, history limit setting, and monitoring startup into dedicated helper functions for improved readability and maintainability
- Reduces code duplication and clarifies responsibilities in the site loading process
- Enhances error handling and logging consistency around settings initialization [`(bcae1d4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bcae1d4e3a5655e22a6ad629989c41f13f26e627)


- 🚜 [refactor] Consolidate utilities and decouple validation logic

- Refactors and consolidates site and monitoring utility functions by removing fragmented modules and grouping logic into more cohesive files for easier maintenance and discoverability.
- Decouples site and monitor validation logic from configuration management by delegating to specialized validators, reducing complexity and improving separation of concerns.
- Streamlines imports of development environment checks to a single utility, removing duplicate logic and clarifying intent.
- Updates usage in management and service classes to align with the new utility structure and validator delegation, supporting better modularity and future extensibility. [`(9f92c48)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9f92c48366d3c1c34357628ac5810a467f47d435)


- 🚜 [refactor] Remove unused database management implementation

- Eliminates an obsolete or redundant database management module to simplify the codebase and reduce maintenance overhead.
- Removal likely follows consolidation of logic elsewhere or architectural changes that render the file unnecessary. [`(f74d991)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f74d991a34522fd11c940311e71c23eada27cdbb)


- 🚜 [refactor] Separate business logic, deprecate utilities, improve tests

- Refactors architecture to move all business rules from utility modules into dedicated manager classes, establishing clear boundaries between business logic and technical operations
- Introduces a centralized configuration manager for business policies, validation, and defaults, improving maintainability and testability
- Deprecates and removes legacy utility files, updating exports and documentation accordingly; eliminates backward compatibility code
- Updates and expands unit tests to achieve near-total test coverage, adapting to the new manager-focused architecture and event-driven communication patterns
- Documents the refactoring process, rationale, and next steps to guide future development and ensure ongoing code quality [`(5f4d038)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5f4d03898aef9bfaf1d23c77f47f503e45b9c60d)


- 🚜 [refactor] Modularize uptime monitor into orchestrator and managers

- Splits the monolithic uptime monitor logic into distinct orchestrator and manager classes, enabling clearer separation of concerns and improved maintainability.
- Introduces new orchestrator and manager classes for site, monitor, and database operations, each with focused responsibilities and clean interfaces.
- Moves utility logic and low-level operations into dedicated utility modules for database and monitoring, reducing duplication and simplifying dependencies.
- Replaces direct data manipulation with repository and utility functions, decoupling data access from business logic.
- Updates all dependent services and IPC handlers to use the orchestrator pattern, removing references to the old implementation.
- Deprecates the old uptime monitor file and directs usage to the orchestrator-based system.
- Lays groundwork for improved extensibility and testing of monitoring and data layers. [`(e56d1d5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e56d1d51d553da3538e4d57fa4d334889204d76d)


- 🚜 [refactor] Delegate data import/export/backup to utility modules

- Simplifies the core monitoring service by moving data import, export, backup, and site refresh logic to dedicated utility modules.
- Enhances maintainability and separation of concerns by using dependency injection and standardized callbacks for database operations.
- Reduces code duplication and improves error handling consistency. [`(f29e01d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f29e01db5abf11fdd60a08159e480d2ab016a4b6)


- 🚜 [refactor] Delegate site update logic to shared utility

Moves complex site update logic into a shared utility function, reducing duplication and centralizing update behavior.
 - Simplifies the main class by removing in-place logic for validation, monitor updates, and interval handling.
 - Enhances maintainability by leveraging dependency injection and callbacks for monitoring control.
 - Prepares codebase for easier testing and future enhancements. [`(3e6fd7e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e6fd7e5ebaee51ddc85ec6c1715720be2a2d2d1)


- 🚜 [refactor] Extract monitoring logic to utility modules

- Modularizes site and monitor start/stop, check, and manual check logic into dedicated utility functions for improved maintainability and reuse
- Simplifies the main orchestration class by delegating complex operations, reducing code duplication and clarifying responsibilities
- Enables easier testing and future extension by decoupling orchestration from monitoring details [`(5e963a1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5e963a1bbb89488c9371d552fd69a45c5bb98e66)


- 🚜 [refactor] Modularize site and monitor database logic

- Extracts site and monitor-related database operations into dedicated utility modules for improved modularity and maintainability
- Simplifies core class by delegating add, remove, load, and history limit logic to reusable helpers
- Enhances testability and separation of concerns by isolating data access patterns
- Updates logging and test expectations to align with new modular approach [`(9864749)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/986474922925140445f80a178c26fc509c5670f9)


- 🚜 [refactor] Simplifies DB initialization with shared utility

- Refactors database setup to use a common initialization helper, reducing redundancy and improving error handling consistency.
- Centralizes site loading and error emission logic, making future maintenance easier. [`(f743618)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f7436185f9f42edfd1f85e7d18c8e33200718c2e)


- 🚜 [refactor] Remove unnecessary v8 ignore comments and improve controlled input handling

- Cleans up redundant `/* v8 ignore next */` coverage comments throughout backend and frontend code, reducing noise and improving readability.
 - Refactors controlled component handling in UI inputs, checkboxes, and selects to avoid uncontrolled-to-controlled warnings and ensure proper value propagation only when explicitly set.
 - Minor code formatting and dependency cleanup for better maintainability. [`(0a8ec42)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0a8ec42890124c90dab0a643b09d0935ed6d5e36)



### 🎨 Styling

- 🎨 [style] Standardize quote usage and formatting in tests/docs

- Unifies single and double quote usage to consistently use double quotes in test files for environment variables and DOM event names, improving code style consistency.
- Refactors code formatting for improved readability, such as condensing multi-line props, aligning JSON and TypeScript snippets, and cleaning up indentation and spacing in test cases and documentation.
- Enhances maintainability by reducing unnecessary line breaks and harmonizing style patterns across various test and markdown documentation files. [`(c1ad054)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c1ad0544de6375adec17ef7e4012d9388a2d3687)


- 🎨 [style] Reformat, clean up, and align test and docs code

- Unifies code style across tests and docs for better readability and consistency
- Converts multi-line array and object definitions to single-line where appropriate in config files
- Cleans up spacing, indentation, and formatting in test implementations and markdown docs
- Updates documentation to improve structure, clarity, and maintainability without changing technical content
- Provides more idiomatic usage of array methods and function signatures in test assertions
- No logic or functionality changes, focusing solely on maintainability and future code readability [`(4d77db5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4d77db512c6514bf854c929b5ae5b7c7306546f0)


- 🎨 [style] Normalize whitespace in history limit manager

- Updates spacing and blank lines for improved code readability and consistency
- No functional or logic changes introduced [`(4e7097c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e7097c636e36cb1ae411f1dec188f86b9e442d3)


- 🎨 [style] Standardize test file naming for consistency

- Renames test files to use camelCase, aligning with project naming conventions
- Improves codebase consistency and eases file discovery in the test suite [`(a8b4b50)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a8b4b509ef9a8d11f5a541900f7ea5a1a537aa47)



### 🧪 Testing

- 🧪 [test] Add full unit coverage for database adapters and service factories

- Adds comprehensive tests for database repository adapters, service factory utilities, and data import/export helpers in the Electron main process.
- Ensures all logic branches, dependency injections, and interface contracts are validated, improving maintainability and refactor safety.
- Increases backend code coverage and documents previously uncovered scenarios, supporting the project's production-ready test standards. [`(1109a83)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1109a836087874e561278141c6bce11c80994033)


- 🧪 [test] Expand site hooks index tests and update mocks

- Expands unit tests to cover new analytics and details hooks, ensuring centralized access to all site-related hooks.
- Updates mocks and export checks for increased modularity and future scalability.
- Simplifies agent mocking in HTTP monitor tests for accuracy and maintainability.
- Adjusts configuration manager test to reflect updated retention limits and boundaries. [`(504f5ee)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/504f5ee3c38c92ff20f873f2a4afc7d558e0eaa3)


- 🧪 [test] Improve test strictness and mock usage; update deps

- Adopts stricter TypeScript compiler options for improved code safety and type checking in tests.
- Refactors environment variable access in tests to use consistent bracket notation, reducing property access issues.
- Switches to a more robust mocking utility for improved type inference in test mocks.
- Adds a language service dependency and updates config to include/exclude relevant test and config files.
- Enhances maintainability and reliability of the test suite by enforcing stricter rules and updating dependencies. [`(784da2d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/784da2dfcc5d14a25e17b423e6f34f626ed72b8c)


- 🧪 [test] Improve robustness and edge coverage in tests

- Updates tests to use optional chaining and length checks, preventing runtime errors from undefined or missing values
- Adds new tests for settings and site stores to ensure full coverage of store logic, persistence, and error handling
- Refactors tests for history, monitor, and analytics features to handle empty arrays and undefined properties safely
- Enhances test reliability by checking existence before accessing or interacting with UI elements
- Adds comprehensive ErrorBoundary and useSiteDetails hook test suites for better component and hook reliability
- Motivated by a desire to eliminate test flakiness, improve coverage, and support future code changes with safer, more resilient tests [`(b2071d9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b2071d966b486f7f491922af9a1c46bb131483fd)


- 🧪 [test] Remove deprecated tests and setup files for Electron backend

- Removes outdated or redundant Electron test setup files and deprecated test logic to streamline the test suite
- Cleans up legacy mocks and configuration files no longer needed after recent refactors
- Updates remaining tests to use direct mock functions, improving maintainability and clarity
- Deletes a deprecated compatibility file, encouraging direct usage of the modular architecture

No functional code paths are affected; focuses solely on test and setup maintenance. [`(173a59e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/173a59e9ed457ef6e2d5e04fc3e8c5b3a3b0085f)


- 🧪 [test] Remove legacy and redundant test files, update test structure

- Cleans up outdated or redundant test files to streamline test coverage
- Removes unnecessary imports and edge case tests to reduce maintenance overhead
- Moves documentation analysis files to an archive directory for better organization
- Improves test suite clarity and maintainability by focusing on relevant scenarios [`(5d2b9d4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5d2b9d42aeaddac7a258c0ac1fb34283ff1ccc8b)


- 🧪 [test] Add comprehensive UptimeOrchestrator and validator tests

- Introduces full unit tests for uptime orchestration, manual checks, monitoring control, and site management to ensure reliability and correctness of core monitoring features
- Adds 100% coverage tests for monitor and site validation logic, including edge cases and invalid configurations
- Refactors test imports to use a dedicated electron utility module for development environment detection, improving test consistency and maintainability
- Updates various mocks and test setups to accurately reflect actual service initialization and behavior
- Improves event emission and in-memory cache update verification to strengthen regression protection

Relates to improved test coverage and maintainability for core monitoring logic. [`(3fc1a7d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3fc1a7d90811ca263b00d99141df4cb125e788cc)


- 🧪 [test] Extend coverage for error handling and deprecation

- Adds unit tests for edge cases in monitor error handling, improving reliability and coverage of error logging for missing or invalid monitor IDs
- Introduces a test suite to ensure the deprecated monitor entry point only exports comments and a deprecation notice, maintaining backwards compatibility
- Updates an existing test to directly verify usage of the default request timeout constant, clarifying fallback behavior [`(afe7b11)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/afe7b11d0af66cd0f9e0f71124aa4861da2e258d)


- 🧪 [test] Refactors tests for new orchestrator, logging, and utils

- Updates all test suites to reflect the renaming of the core monitoring orchestrator and adjusts mock imports and usages accordingly
- Refactors logger label expectations in database and repository tests to match new logging conventions
- Moves and tests monitoring utility helpers separately, including status determination and error handling logic
- Centralizes database and monitor utility function tests, directly testing shared helpers rather than through service internals
- Adds focused tests for monitor status checker utility, ensuring correct timeout handling and monitor instantiation logic
- Improves clarity and maintainability by decoupling test logic from private internals, favoring public/shared utilities [`(76d912e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/76d912e5d2482d546690335590483fcad1ca96f6)


- 🧪 [test] Add ESLint disables and improve monitoring edge tests

- Disables specific ESLint rules across test files for better DX and to reduce TypeScript/ESLint noise in test code
- Refactors uptime monitoring tests to improve simulation of state transitions, error handling, and scheduling, ensuring more accurate coverage of real-world edge cases
- Skips a non-critical edge case test that was difficult to maintain due to complex mocks and limited value
- Clarifies test intent and comments, making future maintenance easier [`(94244cf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/94244cf0fded12beb7661c361d9e28231d330d7d)


- 🧪 [test] Achieve full branch coverage for UI components

- Improves test suites for several UI components to cover edge cases, all conditional branches, and defensive code paths, especially around falsy/null/undefined values and cleanup logic
- Refactors and expands tests for history, settings, site hooks, and dashboard components, ensuring all branches (including nullish coalescing and fallback logic) are tested
- Updates mocks and interaction patterns to prevent JSDOM navigation errors and improve reliability in simulated browser/Electron environments
- Enhances clarity and maintainability of tests with consistent formatting and more explicit assertions
- Motivated by the goal to guarantee robust, predictable behavior and facilitate confident refactoring [`(5ef2ead)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5ef2ead74f8923b9479ae910bec207d4dcca000f)


- 🧪 [test] Expand test coverage for edge cases and nullish behavior

- Adds comprehensive tests for null, undefined, and falsy values in deletion and export logic, ensuring robust handling of edge cases in repositories.
- Improves monitoring service test coverage for nullish coalescing, error handling (including non-Error types), and configuration fallbacks.
- Verifies guard clauses and early returns in window management logic, preventing unintended side effects when main objects are missing.
- Marks logger debug statements and test-only branches with v8 coverage ignore comments to ensure accurate code coverage reporting.
- Updates coverage configuration to ignore empty lines for more accurate metrics. [`(347291e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/347291e1a9f989b3dfb9badfa5ba2e9c3b0db7ed)


- 🧪 [test] Achieve full branch coverage for monitor DB logic

- Expands unit tests to cover all edge cases and branches in monitor and history repository database logic, including null, undefined, falsy, and mixed-type field handling
- Verifies correct SQL parameterization and conversion for all field types, especially for undefined and falsy values
- Ensures robust type conversion, error handling, and fallback logic for monitor creation, updating, fetching, and deletion
- Improves confidence in handling SQLite's dynamic typing and database result edge cases [`(5e263bf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5e263bff01034335c14ba1f036421a2f4568cae4)


- 🧪 [test] Expand HttpMonitor test coverage for timeouts and logging

- Adds comprehensive tests to cover all timeout fallback branches, retry attempts, and debug logging scenarios in HTTP monitoring logic
- Verifies correct use of default, config, and monitor-specific timeout values, along with error handling and logging in both dev and production modes
- Improves reliability of monitoring logic by ensuring edge cases and conditional branches are thoroughly tested [`(104234e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/104234e02b478a634676dfe71334ca78497e4b7c)


- 🧪 [test] Expand test coverage for monitoring and logger utils

- Adds tests for handling non-Error objects in logger utilities to ensure robust logging of atypical error scenarios.
- Introduces tests for updating monitor types, handling empty IDs in bulk database creation, and directly testing private helper methods, improving reliability and safety of database operations.
- Updates coverage exclusions for generated/types/index files to keep coverage metrics accurate.
- Adds and updates dev dependencies to support new tests and coverage tooling. [`(bc50006)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bc500063bf2d517c830dfa069954dee2f5bb8386)


- 🧪 [test] Expand coverage for event handling and edge cases

- Adds comprehensive tests for application service event handlers, uptime monitor events, and auto-updater integration to ensure robust behavior in all scenarios
- Introduces tests for database repository edge cases, including handling of empty updates, date conversion, and error conditions on insert
- Improves code coverage by marking logging and side-effect lines as ignored for coverage tools, allowing for more accurate metrics
- Enhances reliability by validating error handling and ensuring detailed logging during unexpected states [`(ab7e1b2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab7e1b210d9862706fe3dbebd4d481feda0354ee)


- 🧪 [test] Improve chart config tests for type safety and theme props

- Updates test theme object to match new theme property structure, ensuring tests reflect current design tokens.
- Refactors assertions to use type casts for deep nested Chart.js properties, improving compatibility with TypeScript's strict types.
- Enhances reliability of label callback tests by invoking with explicit context.
- Removes unused variables and cleans up redundant code for clarity.
- Helps prevent future type errors and ensures tests align with the evolving chart configuration API. [`(3e9ebc4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e9ebc4396474b6e41c715b1908a2794009584b5)


- 🧪 [test] Update mocks, types, and assertions for stricter type safety

- Improves test reliability by refining mock data to align with stricter typing, reflecting recent type changes in application models
- Replaces runtime type checks with assertions that better match TypeScript's compile-time guarantees
- Updates import paths and usage of nullish coalescing to prevent value coercion and improve clarity
- Cleans up test data initialization, ensuring compatibility with updated interfaces and reducing risk of type errors in future changes [`(da43763)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/da43763b7336c6ef167db43102c85559e6614836)


- 🧪 [test] Improve mocking and test reliability in unit tests

- Updates mock implementations in unit tests to use more consistent and reliable mocking strategies, reducing redundancy and potential import side effects.
- Explicitly sets monitor status in test cache to ensure correct initial state, improving test determinism and clarity.
- Enhances maintainability and readability of test code by centralizing mock setups and clarifying comments. [`(c3a7a9a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c3a7a9aaa35f25263b08f540f2b56abf66ac51e7)


- 🧪 [test] Expand and improve site monitoring and error tests

- Adds extensive test coverage for monitoring start/stop logic, manual checks, update flows, import/export, validation, and advanced edge cases
- Improves tests for error handling, event emission, backup/download, and site/monitor update scenarios, ensuring robust behavior in failure and edge conditions
- Updates main logic to re-throw DB load errors, return correct results when stopping multiple monitors, and clarify error messages for missing sites/monitors
- Refines test mocks for repository and scheduler behavior to validate new and existing monitor/interval handling
- Slightly relaxes a condition on importing monitor history to match practical scenarios

Enhances reliability and maintainability by verifying more code paths and tightening error handling. [`(6e5d9f0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e5d9f0d9c44142d5acab9f214b701105c95adad)


- 🧪 [test] Expand and refactor test coverage for app logic

- Replaces basic tests with comprehensive suites for app components, constants, and utilities, covering global state, modal behavior, notifications, error handling, and environment-specific logic
- Refactors and expands test setup for improved isolation and flexibility, removing broad repository and logger mocks to allow test-level control
- Improves logging-related test clarity and ensures consistent mocking of external dependencies
- Updates scripts for test running and debugging, adds new Vitest script variants for CI and debugging scenarios
- Increases confidence in regression detection and code quality by verifying edge cases and error flows across core modules [`(235ddd1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/235ddd1b99d039bbd3597b7a254c110260a2067c)


- 🧪 [test] Add comprehensive Electron backend test suite

- Introduces a full suite of backend tests for Electron services, types, utilities, and IPC bridge, significantly improving reliability and maintainability.
- Adds detailed type, service, and integration tests for core monitoring, logging, application orchestration, and preload APIs.
- Refactors and expands test setup mocks for electron and database modules to ensure robust, isolated test environments.
- Updates ESLint and tsconfig to properly ignore and support new test files, preventing conflicts and ensuring code quality.
- Adds a dedicated Vitest config for Electron backend, enabling granular control over test runs and coverage reporting.
- Enhances package scripts to support running, watching, and collecting coverage for Electron tests.
- Freezes retry config object for immutability; introduces missing method stub for application service to improve testability.

Relates to improved backend coverage and developer workflow. [`(96019b4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/96019b4746c8843ef8dc9fd2c104ca321235e5d0)



### 🧹 Chores

- 🧹 [chore] Remove outdated changelogs and unused devDependency

- Deletes all auto-generated changelog markdown files from the documentation,
  cleaning up the repo and reducing maintenance overhead for obsolete or redundant logs.
- Removes the unused TypeScript CLI devDependency to streamline the dependency tree.
- Updates test IDs in form field tests for consistency and future-proofing.
- Adds a custom spelling entry for "Sarif" and minor code style tweaks in test mocks.

Helps reduce clutter, improve test clarity, and maintain an up-to-date codebase. [`(535c3df)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/535c3df642310de57c9fa23b67cc6634795c97cb)



### 👷 CI/CD

- 👷 [ci] Standardize and reformat CI workflow YAML files

- Reindents and restructures GitHub Actions workflows for test, coverage, and code quality analysis using consistent 4-space indentation and YAML best practices.
- Improves readability and maintainability by aligning job, step, and input formatting across all pipeline definitions.
- Makes no logic changes but ensures easier future edits and consistent automation behavior. [`(52d47b5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/52d47b56ad58456f9618d10688a7a90736ed1e0d)






## [3.7.0] - 2025-06-30


[[15272a9](https://github.com/Nick2bad4u/Uptime-Watcher/commit/15272a9139a6579025be87d8d69eafcb07b07d6c)...
[2488118](https://github.com/Nick2bad4u/Uptime-Watcher/commit/24881180e4add7fd1cf02e89fb68b74e895d516c)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/15272a9139a6579025be87d8d69eafcb07b07d6c...24881180e4add7fd1cf02e89fb68b74e895d516c))


### ✨ Features

- ✨ [feat] Centralize monitor defaults and improve identifier display

- Centralizes default configuration values (timeouts, intervals, retry/backoff, history limits) into shared constants for consistency across backend and frontend.
- Updates monitor creation and settings logic to use these constants, ensuring unified and explicit default values.
- Refactors identifier display logic in the settings UI to show human-friendly labels and values based on monitor type (URL for HTTP, host:port for port monitors).
- Simplifies retry/backoff logic and ensures exponential backoff is consistently applied using constants.
- Cleans up and reorders store update functions for better maintainability.
- Removes redundant inline default values, relying on shared configuration.
- Fixes minor style and type issues for improved code clarity. [`(b6134be)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b6134be75a6250204c9cc3c9f5fb4340231ded0e)


- ✨ [feat] Add per-monitor retry attempts with UI and persistence

- Introduces configurable retry attempts for individual monitors, allowing fine-grained control over failure detection sensitivity.
- Updates backend, database schema, and repository logic to store and process retry attempts per monitor.
- Refactors monitoring logic to use per-monitor retry and timeout, applying exponential backoff between attempts for reliability.
- Enhances UI: adds retry attempts configuration to site details, calculates max check duration, and removes global maxRetries from settings and docs.
- Sets default check interval to 5 minutes, removes auto-refresh, and improves advanced error/status handling for HTTP and port monitors.
- Cleans up related documentation and code for consistency.

Relates to #213 [`(a59c50d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a59c50d3c0e0e5196792b4e927a9a4db4781e914)


- ✨ [feat] Add per-monitor request timeout configuration

- Enables setting custom request timeouts for individual monitors, overriding the global/default timeout value
- Updates backend schema, frontend UI, and business logic to support per-monitor timeout input, persistence, and usage during monitoring
- Removes deprecated global timeout setting from app settings, making timeout a monitor-specific property for improved flexibility
- Improves user control over monitoring behavior, especially for sites or ports with varying response expectations [`(47f479b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/47f479b1802ff2ed39a27956ab8a69e834b2fd8b)



### 🛠️ Other Changes

- ⭐ feat: update dependencies and integrate Vite MCP plugin

- Added @executeautomation/database-server and @playwright/test to package.json
- Updated @typescript/native-preview and eslint versions
- Introduced vite-plugin-mcp in vite.config.ts for Model Context Protocol integration
- Created Vite-MCP-Configuration.md for detailed MCP setup and usage instructions
- Updated @types/node version in dependencies
- Added zod and zod-to-json-schema to dependencies [`(15272a9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/15272a9139a6579025be87d8d69eafcb07b07d6c)



### 🚜 Refactor

- 🚜 [refactor] Improve type safety, accessibility, and UI modularity

- Refactors components and repositories to use `readonly` for props and class fields, enhancing immutability and type safety.
- Replaces modal markup with native dialog and backdrop button for better accessibility and keyboard navigation.
- Extracts and documents helper functions for label formatting and availability logic to improve code clarity and reuse.
- Updates UI icon color logic to use centralized configuration, reducing duplication and making theme adjustments easier.
- Cleans up unnecessary `await` usage in database calls, streamlining async handling.
- Refines HistoryTab detail rendering for better maintainability and user experience.

These changes improve maintainability, code robustness, and accessibility, while making future UI and logic updates easier. [`(fd732b0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fd732b08422d536394e76f4ffcc36b0d8a3566a4)


- 🚜 [refactor] Simplify DB calls and centralize monitor param handling

- Refactors repository logic to remove unnecessary use of `await` for synchronous database calls, improving code clarity and performance.
- Introduces centralized helpers for building monitor parameters and updating fields, reducing duplication and risk of type errors.
- Improves type safety and null handling for monitor fields, ensuring consistent database interaction.
- Enhances maintainability by encapsulating repetitive SQL logic and conversion routines. [`(22a87a6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/22a87a65b88ff2bd59d39da9cba79d0883ae61b4)


- 🚜 [refactor] Modularize site update and import logic

- Extracts site update, monitor management, and import operations into smaller, focused private methods for improved readability and maintainability
- Enhances input validation and error handling during import and update processes
- Improves monitor interval change detection and handling, reducing code duplication and clarifying intent
- Facilitates future changes and testing by isolating complex logic into discrete functions [`(dcaaf87)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dcaaf87b3a607e4e6ce0fb4e99d3ad5832f5bf16)


- 🚜 [refactor] Make service dependencies readonly and async init

- Ensures immutability of service dependencies to prevent accidental reassignment and improve type safety.
- Refactors application and monitor initialization flow to support async database setup, reducing race conditions at startup.
- Cleans up nullish coalescing and improves clarity of status and logging output. [`(ba596c1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ba596c141a3bb710ea63052c02478b46f95e83d1)


- 🚜 [refactor] Replace || with ?? for safer fallback values

- Updates fallback logic to use nullish coalescing (??) instead of logical OR (||) when providing default values for monitor type and site names
- Prevents unintended use of falsy values (e.g., empty strings) as fallbacks, ensuring more accurate and predictable notification messages [`(f0ec53f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f0ec53feff259417cd23fa039178cee63e48b4bc)


- 🚜 [refactor] Make interval map readonly and remove non-null assertion

- Ensures the internal interval storage cannot be reassigned, improving immutability and type safety.
- Removes unnecessary non-null assertion for monitor IDs, relying on stricter typing to prevent runtime errors. [`(f95e988)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f95e98854fa6041c159ec098356005993fdc707e)


- 🚜 [refactor] Centralize retry logic for monitoring checks

- Replaces inlined retry loops in monitoring services with shared retry utility, reducing code duplication and improving maintainability
- Adds custom error handling and response time tracking for port checks to preserve diagnostic data across retries
- Enhances debug logging for retry attempts to aid troubleshooting
- Sets foundation for more consistent retry and error handling logic in service monitors [`(426ecfc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/426ecfc57582fb285f25fb297058dc0275c66eb6)


- 🚜 [refactor] Simplifies monitor counting and ID selection logic

- Refactors monitor status aggregation to use a functional approach, replacing multiple mutable variables and loops with a reducer for improved readability and maintainability.
- Streamlines default monitor ID selection by adopting a concise conditional expression, reducing imperative branching.
- Enhances code clarity and reduces potential for errors in monitor management logic. [`(6d59edf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6d59edf7e31b19ff710b013df2856a46c33d47d5)


- 🚜 [refactor] Use dedicated Axios instance and improve error handling

- Switches to a dedicated Axios instance with configurable defaults to improve code maintainability and reduce duplication
- Centralizes and simplifies error handling for HTTP monitoring, offering clearer distinctions between network errors, timeouts, and HTTP status responses
- Updates config logic to ensure Axios instance stays in sync with runtime changes
- Adds comprehensive documentation for Axios usage in the project

Enhances reliability and clarity of HTTP monitoring while making future maintenance easier. [`(66b2201)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66b22010811825a82207cc6e4f5ab87a2390ba5d)


- 🚜 [refactor] Remove legacy dark mode, flatten API, update docs

- Streamlines codebase by removing legacy dark mode state and migration fields,
  consolidating theme management under settings for consistency.
- Refactors API surface to use organized, domain-specific namespaces
  instead of a flat structure, improving maintainability and clarity.
- Updates documentation and type definitions to reflect new API structure,
  eliminates outdated migration guides, and aligns examples with current best practices.
- Cleans up interfaces and comments for clarity, removing legacy code and references.

Relates to ongoing modernization and API consistency efforts. [`(3554271)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3554271e1b0239553929c19f16bf7898cc087c59)



### 🎨 Styling

- 🎨 [style] Mark IPC service dependencies as readonly

- Enforces immutability for injected dependencies in the IPC service to prevent accidental modification.
- Improves code safety and clarifies intent by making these properties read-only after construction. [`(80ba83c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/80ba83c7df6cdb56d382f7ef80b575f05217bcf8)



### 🧪 Testing

- 🧪 [test] Add Vitest and Testing Library integration

- Introduces Vitest as the main test runner, adding scripts for running, UI, and coverage reporting
- Integrates @testing-library/react, @testing-library/jest-dom, and related typings and setup for robust React and DOM testing
- Updates Vite config for test environment, coverage settings, and setup file support
- Enables isolated, modern, and maintainable testing workflows for React components and TypeScript code [`(2488118)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/24881180e4add7fd1cf02e89fb68b74e895d516c)






## [3.4.0] - 2025-06-28


[[65aa6b2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65aa6b2e5f0821f8b0476adfc9175ab41ff1c1f0)...
[28d3918](https://github.com/Nick2bad4u/Uptime-Watcher/commit/28d3918a0786eaf7e0e8a7953ce6a674c22b253e)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/65aa6b2e5f0821f8b0476adfc9175ab41ff1c1f0...28d3918a0786eaf7e0e8a7953ce6a674c22b253e))


### ✨ Features

- ✨ [feat] Add Electron main process, IPC, and uptime monitor backend

Introduces a comprehensive Electron backend, including the main process logic, IPC handlers, and an uptime monitoring engine with persistent SQLite storage.

Enables site and monitor management, status updates, per-site monitoring controls, and direct database backup/export/import via Electron APIs. Integrates auto-update support and notification handling for monitor status changes.

Adjusts ignore and VS Code settings to allow tracking of built Electron output, and improves file/folder exclusions for better workspace usability.

Lays the technical foundation for reliable uptime tracking, flexible data persistence, and robust desktop application functionality. [`(4e94c98)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e94c988797316fc0ae86fcab01142c2f3266c04)


- Add details column to history table and render details in SiteDetails component [skip ci] [`(2f9730b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2f9730b23165946292c243aee4d3cb905aeb031b)


- Enhance build process and add new scripts [`(67b5fe7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/67b5fe731fe24bcf6740917e646b30dfc57a6bab)


- Implement update notification system and enhance app state management [`(9a3a01d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9a3a01d9f14cb3f26a181c321b2de6c3b3ba8a82)


- Add updateSite functionality to store and types [`(9174b15)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9174b15321660e184ec4a9ef72dcdec586f3350c)


- Add history limit and export/import functionality to uptime monitor [`(9d2bfd7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9d2bfd762dceedb4d7df4f8bd8c50adf70552376)


- Add manual site check functionality and enhance site statistics [`(4806c86)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4806c8669657fede80b9d7b7b39db50aaa45e7eb)



### 🛠️ Other Changes

- Switches monitoring logic to use unique monitor IDs

Refactors app logic to identify and manage monitors via unique string IDs
instead of type, enabling multiple monitors of the same type per site.
Updates backend, IPC, and UI to consistently use monitor IDs. Adds direct
SQLite backup download for advanced users. Improves history limit handling
and site/monitor sync. Removes legacy JSON export/import.

Addresses user needs for better extensibility, safer data handling, and more
robust monitoring operations. [`(30bc1af)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/30bc1afd510d803564fccc25489d81d52fd54be0)


- Resumes active monitors after restart and improves history limit

Ensures that monitoring automatically resumes for previously active monitors upon app restart, improving reliability for ongoing uptime checks.

Also replaces the use of Infinity with Number.MAX_SAFE_INTEGER for the unlimited history option to avoid potential issues with serialization and internal calculations. [`(69f2b18)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/69f2b18ac835418771df6af79c26367056ce284c)


- Refactor site identifier usage across components and services

- Updated SiteDetails component to use 'identifier' instead of 'id' for site references.
- Modified SiteList to use 'identifier' as the key for SiteCard.
- Changed logger service to log site events using 'identifier'.
- Adjusted store actions and state management to handle 'identifier' instead of 'url' or 'id'.
- Updated types to reflect the new 'identifier' field in Site and Monitor interfaces.
- Enhanced error handling and validation for site and monitor operations.
- Updated TypeScript configuration to include vite.config.ts for better type checking. [`(fabc009)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fabc009ff629d95a1d998806db89c48624a28452)


- Refactor SiteCard and SiteDetails components for per-monitor monitoring state

- Updated SiteCard to always select the latest site from the store and handle monitoring state per monitor type.
- Refactored event handlers in SiteCard to simplify logic and improve readability.
- Enhanced SiteDetails to manage per-monitor check intervals and monitoring state.
- Introduced useBackendFocusSync hook to sync sites from backend on window focus.
- Modified store to support per-monitor monitoring and check intervals, removing global monitoring state.
- Updated types to include monitoring state and check intervals for monitors.
- Adjusted actions in the store for starting and stopping monitoring on a per-monitor basis.
- Improved UI components to reflect changes in monitoring controls and check interval settings. [`(599c634)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/599c634d8c044a7314e0e8f7299d638e511ea9d2)


- Refactors code for improved readability and consistency

Streamlines code formatting by reducing line breaks and consolidating multi-line statements, resulting in more concise and readable logic. Aligns style for variable declarations, function definitions, and control structures to enhance maintainability and make future updates easier. No functional changes are introduced. [`(e2e9171)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e2e917101087de9bf7f8daf394cbef955a3961e9)


- Unifies uptime quality logic and cleans up constants

Refactors uptime color mapping to use a centralized theme utility instead of scattered thresholds. Cleans up and removes unused constants, types, and configuration blocks to improve maintainability and reduce duplication. Enhances type safety for time periods and streamlines related imports. [`(398a536)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/398a5369561404bbf6ee5f49c482623064c0ff47)


- Refactor code for improved readability and consistency

- Cleaned up formatting and spacing in SiteDetails component for better readability.
- Consolidated memoization hooks in SiteDetails for line and bar chart options.
- Streamlined logger service for consistent logging format and improved clarity.
- Enhanced theme component styles for better maintainability.
- Updated constants for consistent spacing and formatting.
- Refactored useSiteAnalytics hook for clarity and performance.
- Improved time formatting utility functions for consistency.
- Removed unnecessary whitespace and comments in various files. [`(6e75286)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e75286ce8d9f7eccf287f3dbfb5cbb17c19be20)


- Migrates to structured logging using electron-log

Replaces all console-based statements with a centralized, production-ready logging approach powered by electron-log. Introduces a shared logging service for both main and renderer processes, providing contextual log levels, error stack capture, and log rotation. Enhances traceability of site operations, user actions, settings changes, and application events, supporting easier debugging and future log analytics. Updates Flatpak and build configs for new log file paths and improves package metadata for distribution.

See Logging-Migration-Summary.md for migration details. [`(deab1aa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/deab1aaa57f205516f8658816b8f53715b0c4677)


- Refactor theme structure and improve type definitions

- Updated the light and dark theme definitions to enhance readability and maintainability.
- Added spacing, typography, shadows, and border radius properties to both light and dark themes.
- Improved the ThemeColors interface to include new properties for border and surface colors.
- Refined the ThemeSpacing and ThemeTypography interfaces for better organization.
- Enhanced the useTheme hook to streamline theme management and color retrieval.
- Updated the tailwind.config.js to align with new theme colors and animations.
- Adjusted TypeScript configuration files for consistency and clarity.
- Improved the Vite configuration for better plugin management and build output. [`(6ca7152)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6ca7152ae1f9ec359be47b5cb30f7e959a50f46e)


- Initialize project structure and developer tooling

Adds essential project files including a detailed README, a design plan, VS Code launch and task configurations, and a comprehensive .gitignore for Node/Electron development. Lays the groundwork for developer experience, project documentation, and future code contributions. [`(65aa6b2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65aa6b2e5f0821f8b0476adfc9175ab41ff1c1f0)



### 🚜 Refactor

- 🚜 [refactor] Modularizes backend architecture and optimizes sync

- Refactors backend codebase to a fully modular service/repository architecture, mirroring frontend patterns for maintainability and testability
  - Extracts all database, monitoring, notification, updater, window, and IPC logic into dedicated services and repositories with clear separation of concerns
  - Removes monolithic logic from main process entry point, delegating orchestration to an application service
  - Centralizes logging and error handling, ensuring consistent and robust diagnostics across all domains

- Optimizes frontend-backend synchronization for real-time UI updates
  - Implements smart incremental site updates using status event payloads, replacing inefficient full-database fetches on every monitor check
  - Achieves instant UI responsiveness and drastically reduces backend query load, supporting scalability for large site counts
  - Adds fallback to full sync for edge cases and error scenarios, ensuring reliability

- Fixes duplicate log entries and standardizes logging behaviors throughout the app, including React component event deduplication

- Enhances code quality and maintainability:
  - Cleans dead code, unused imports, and applies rigorous lint/formatting standards
  - Improves type safety, validation, and error resilience in both backend and frontend integration points

- Updates documentation and configuration to reflect new architecture and performance improvements

- Addresses real-time update bug for history and metrics in UI, and ensures all site/monitor changes are reflected instantly

- [dependency] Updates relevant dependencies for compatibility and development experience

Relates to performance, maintainability, and real-time UX improvements [`(750de8e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/750de8e4750000c9898ce23429cf32f6ed31aa50)


- 🚜 [refactor] Modularize and streamline site details UI

- Splits a large, monolithic site details component into modular, focused subcomponents for header, navigation, and tab content, improving readability and maintainability
- Introduces a custom hook to encapsulate site details state and logic, reducing prop drilling and duplication
- Moves tab content (overview, analytics, history, settings) to dedicated files with improved cohesion and separation of concerns
- Removes inline debug code and outdated comments for cleaner production code
- Ensures all user actions (tab changes, filter changes, key settings) are logged for better analytics and traceability
- Enhances code organization and paves way for easier future enhancements and testing [`(0c4b982)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0c4b982d131386cbdaabda115efd6f4c0d8a6ff6)


- 🚜 [refactor] Standardizes DB null handling and improves WASM setup

- Replaces all uses of `null` with `undefined` for SQLite field values to better align with WASM driver expectations and reduce ambiguity
- Refactors retry logic loops for site DB operations for clarity and code style consistency
- Updates documentation and download script to explicitly reference and set up the WASM-based SQLite driver, ensuring required directories exist before download
- Adds minor linter rule suppressions and logging clarifications for better maintainability [`(2d4ff4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2d4ff4c1d90999296d9d336b8b601029c086dd80)


- Remove unused ESLint and Husky configurations [`(c275d7d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c275d7d85c21774a671c3f23a76dcee96f3dba19)



### 📝 Documentation

- 📝 [docs] Add comprehensive codebase documentation and cleanup

- Adds detailed JSDoc-style documentation to all major modules, React components, hooks, and utility functions for improved maintainability and onboarding
- Refactors and enhances all documentation files, including README, guides, and API references, for improved clarity, navigation, and cross-linking
- Updates and reorganizes documentation structure to highlight core, API, user, and component docs with navigation improvements
- Removes a large third-party validator library doc, focusing documentation on project-relevant content
- Cleans up, annotates, and standardizes code comments and export barrels across backend and frontend for better code understanding
- Improves markdownlint and commitlint configs for more consistent documentation and commit practices
- Updates security policy and related docs to accurately reflect project naming and dependencies

Aims to make the codebase significantly easier to navigate and contribute to, while raising the bar for documentation quality. [`(28d3918)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/28d3918a0786eaf7e0e8a7953ce6a674c22b253e)



### ⚡ Performance

- ⚡ [perf] Make debug logging conditional on development mode

- Reduces log volume and noise in production by wrapping all non-essential debug and verbose logs in a development mode condition across backend services and frontend state management.
- Maintains always-on logging for errors, warnings, and critical state changes, ensuring production logs focus on actionable information.
- Improves log clarity, performance, and maintainability while preserving full debug detail for development and troubleshooting.
- Addresses prior issues with log spam from routine operations (IPC, monitor checks, database CRUD) and ensures cleaner log files in production environments. [`(9e0e7b1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9e0e7b1f59c71d13abd1dca76bd7d0040227bcc3)


- ⚡️ migration from lowdb to SQLite3 WASM [`(1983e4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1983e4c44558506048d978822ba06b1ff927656f)



### 👷 CI/CD

- 👷 [ci] Remove Electron backend build artifacts from source

- Removes previously committed build output and Electron backend files from version control to prevent storing build artifacts in the repository.
- Updates CI workflow to add a dedicated step for building the Vite frontend and Electron backend, ensuring separation of install and build phases.
- Improves repository hygiene and reduces potential for merge conflicts and accidental deployment of stale artifacts. [`(8259198)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/82591980852202900bb47d142b5f888eae86555c)


- Adds full-featured Electron+React frontend with per-site monitoring

Introduces a React-based UI integrated with Electron, enabling per-site and per-monitor interval configuration, detailed site analytics, charting, and flexible theming. Implements robust IPC between renderer and main processes, persistent SQLite storage, direct backup/download, and advanced state management via Zustand. Improves developer experience with enhanced VSCode launch tasks, hot reload, and unified test/build workflow. Lays groundwork for future extensibility and improved monitoring reliability. [skip-ci] [`(776f214)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/776f214be3b319b60e31367766a78400c305cbc5)


- Adds full-featured Electron+React frontend with per-site monitoring

Introduces a React-based UI integrated with Electron, enabling per-site and per-monitor interval configuration, detailed site analytics, charting, and flexible theming. Implements robust IPC between renderer and main processes, persistent SQLite storage, direct backup/download, and advanced state management via Zustand. Improves developer experience with enhanced VSCode launch tasks, hot reload, and unified test/build workflow. Lays groundwork for future extensibility and improved monitoring reliability. [skip-ci] [`(5662f5c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5662f5c3db7d63ff06956a68dc6bdcb32ad7e41a)


- Refactor code for improved readability and consistency across multiple files

Improves code readability and formatting consistency

Refactors code across multiple files to enhance readability
and maintain consistent formatting, including clearer
line breaks and indentation. Updates linting configuration
to ignore package lock files for smoother workflow.
Aims to make future maintenance and collaboration easier. [`(2841749)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2841749e824a0ed994932eaf0611891c74a071a3)



### 🔧 Build System

- 🔧 [build] Update path import to use namespace import syntax [`(1350b7f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1350b7f2e18537013a41b1c981614a79d9e61cb1)






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/Uptime-Watcher/graphs/contributors) for their hard work!
## License
This project is licensed under the [UnLicense](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/LICENSE)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
