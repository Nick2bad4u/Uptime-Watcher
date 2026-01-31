<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


[[9ea2112](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9ea2112b5cea87f1163261bb4881577951b49bbe)...
[bca82d2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bca82d273fcc9ad52fe0fd6c159a4a0033a7d4b4)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/9ea2112b5cea87f1163261bb4881577951b49bbe...bca82d273fcc9ad52fe0fd6c159a4a0033a7d4b4))


### ✨ Features

- ✨ [feat] Adds lint drift guards and mock helpers

✨ [feat] Adds drift-guard lint rules to prevent duplicate contracts and helper redefinitions across layers 🧭
🔧 [build] Aligns lint configuration with the new plugin guards and reduces conflicting style/test rules 🧹
🚜 [refactor] Moves constructible mock utilities into shared helpers and adds constructible return-value helpers to avoid non-constructible mocks 🧰
🧪 [test] Updates constructor-based mocks to use constructible helpers for instantiation safety ✅
📝 [docs] Refreshes lint and testing guidance to reflect the new guardrails 📚

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5c66818)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5c66818d27169a8fbb74ce9585ee797b3eb19413)


- ✨ [feat] Add sqlite backup IPC and update tooling

✨ [feat] Introduces `save-sqlite-backup` IPC invocation channel for database persistence 🗄️
 - 🛰️ Establishes the communication bridge for serialized database backup results
📝 [docs] Synchronizes architectural documentation with the latest IPC registry 📄
 - 📈 Updates the generated channel inventory to reflect the new backup capability
🔧 [build] Enhances the linting infrastructure with automated IPC validation 🛠️
 - 🧼 Integrates dedicated `lint:ipc` and `lint:ipc:fix` tasks into the global workflow
 - 🏎️ Streamlines the `lint:ci` script by centralizing static guard execution logic
🧹 [chore] Performs a wide-scale update of development tools and dependencies 📦
 - ⬆️ [dependency] Updates versions for core tooling including `vite`, `knip`, and `putout`
 - ⚙️ Upgrades several ESLint plugins for React, Stylistic, and JSDoc rulesets
 - 🔒 Refreshes the package lockfile to maintain a secure and consistent dependency tree

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f7928ed)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f7928ed26291f91c1f8dbb74cb690e1c9b61f650)


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

- 🛠️ [fix] Adds success accent to settings modal

🛠️ [fix] Improves settings visibility by adding a success accent for clearer status cues
🔧 [build] Updates linting setup with refreshed rule configs and resolver tweaks to reduce noise
 - routes markdown lint fixing through the shared script
🧪 [test] Strengthens UI coverage by asserting invalid submissions keep modals open and selectors surface labels
📝 [docs] Normalizes documentation formatting and escapes underscores for consistent rendering

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bca82d2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bca82d273fcc9ad52fe0fd6c159a4a0033a7d4b4)


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


- 🛠️ [fix] Improves UI state tracking

🛠️ [fix] Improves metric logging and observer refresh to avoid stale UI state
📝 [docs] Updates documentation examples and remark formatting for consistency
🎨 [style] Aligns minor formatting in runtime modules for readability
🧪 [test] Adds coverage for stores and validation plus test cleanup

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(60cb588)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/60cb588b7ad0d0715517d7ab4ce0e00427fadb38)


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


- 🛠️ [fix] Refine store cleanup and bump dependencies

🛠️ [fix] Optimize cleanup logic in the updates store
 - 🗑️ Remove redundant service cleanup call within the subscription handler to prevent unnecessary executions when the store is already disposed

🔧 [build] Upgrade project-wide devDependencies and tools
 - ⬆️ Update ESLint plugins for React, Playwright, and Putout to their latest versions
 - ⬆️ [dependency] Update `@jscpd` and `jscpd` packages to improve code duplication detection
 - ⬆️ Update `putout` and `markdown-to-jsx` for better code transformation and rendering
 - ⬆️ Modernize documentation tools by upgrading `typedoc` and its dependency links plugin

🧪 [test] Expand strict unit test coverage for services and stores
 - ✅ Add detailed tests for `openExternalUtils` to verify secure URL handling and error suffix generation
 - ✅ Implement unit tests for `AppNotificationService` to ensure IPC initialization and payload wrapping
 - ✅ Add coverage for `usePromptDialog` to verify successful store delegation
 - ✅ Create robust tests for `useUpdatesStore` covering state mutations, subscription management, and error logging
 - 🚫 Update Vitest configuration to exclude Electron test directories from production coverage reports

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6bf53b5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6bf53b5658bfff3bb18c75d71c0448549c0e3172)


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



### 📦 Dependencies

- *(deps)* [dependency] Update h3 in /docs/docusaurus [`(e2ba768)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e2ba768d15e51cb231d2e47b8a058add6aef9956)


- *(deps)* [dependency] Update undici in /docs/docusaurus [`(74077c3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/74077c383991162a387fb202449504ae80f682bb)



### 🚜 Refactor

- 🚜 [refactor] Clarifies monitoring wiring

🚜 [refactor] Extracts shared monitoring type contracts and narrows history persistence dependencies.
 - Avoids registry import cycles and limits repository access to required APIs.
🎨 [style] Broadens modal overlay selector matching for consistent stacking behavior.
📝 [docs] Normalizes guide links, tables, and escapes to improve readability and navigation.
🧹 [chore] Simplifies markdown formatting settings and disables embedded formatting for markdown.
🧪 [test] Updates fuzz registry coverage to reference extracted type contracts.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(949e8c1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/949e8c1e8dbdb2040ee0ebf5581d08e5789ea80f)


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


- 🚜 [refactor] Streamlines async handlers

🚜 [refactor] Introduces reusable fire-and-forget utilities to standardize background task error handling across orchestration, caching, and app lifecycle flows.
🛠️ [fix] Adds explicit error fallback for monitoring-active requests to keep responses predictable when scheduler checks fail.
🚜 [refactor] Extracts monitoring result normalization, UI config, and title suffix helpers to centralize monitoring behaviors and reduce duplication.
🚜 [refactor] Centralizes production window path guards and security header construction for tighter navigation and response hardening.
🚜 [refactor] Moves add-site guidance bullet logic into a dedicated builder for consistent de-duplication and clarity.
🧹 [chore] Updates documentation plugins and lint/style tooling dependencies.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c54baf0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c54baf03609a36ae3caeee30df03e61465f12003)


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


- 🚜 [refactor] Improve OAuthProviderPanel structure and performance
 - 🔧 Refactor renderOAuthProviderPanel into a new component, OAuthProviderPanel, for better readability and maintainability
 - 🧹 Simplify props handling by using a single interface for OAuthProviderPanel properties
 - ⚡ Optimize rendering of icons using useMemo to prevent unnecessary re-renders
 - 🔧 Update the connection handling logic to improve clarity and reduce redundancy

🔧 [build] Update dependencies in package.json
 - 🔧 Upgrade @dword-design/eslint-plugin-import-alias to version 7.0.0
 - 🔧 Upgrade @eslint-react/eslint-plugin to version 2.4.0
 - 🔧 Upgrade @putout/eslint to version 5.0.0
 - 🔧 Upgrade @vitest/eslint-plugin to version 1.6.4
 - 🔧 Upgrade cognitive-complexity-ts to version 0.8.0
 - 🔧 Upgrade eslint-plugin-putout to version 29.1.2
 - 🔧 Upgrade eslint-plugin-react-dom to version 2.4.0
 - 🔧 Upgrade jsdom to version 27.4.0
 - 🔧 Upgrade knip to version 5.78.0
 - 🔧 Upgrade msw to version 2.12.7
 - 🔧 Upgrade prettier-plugin-properties to version 0.3.1
 - 🔧 Upgrade putout to version 41.0.11
 - 🔧 Upgrade stylelint-config-alphabetical-order to version 2.0.0
 - 🔧 Upgrade stylelint-plugin-use-baseline to version 1.1.5
 - 🔧 Upgrade typedoc-plugin-dt-links to version 2.0.35

⚡ [perf] Optimize ThemedInput and ThemedSelect components
 - ⚡ Use useMemo in ThemedInput to memoize control style arguments, improving performance
 - ⚡ Use useMemo in ThemedSelect to memoize control style arguments, enhancing rendering efficiency

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7553304)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/755330469e9142d43de374f67d1d7dedbf4d417e)


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

- 📝 [docs] Improve documentation formatting consistency

📝 [docs] Improves table alignment, example spacing, and quote style to keep rendered docs consistent and readable
 - 📝 [docs] Adds ignore directives to preserve intended formatting in examples
📝 [docs] Normalizes link escaping and example titles to reduce formatter noise across guides

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(eb37136)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eb37136489b972e6959a2b027cd8c1d760273487)


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

- 🎨 [style] Refactor code formatting and documentation

 - 📝 Remove unnecessary blank lines in multiple Markdown files for improved readability
 - 🎨 Update Prettier configuration to enhance code style consistency
 - 📝 Adjust JSDoc comments for better clarity and formatting
 - 🧹 Clean up example code snippets in documentation to remove excess whitespace
 - 🔧 Modify ESLint configuration for better ignore patterns and project settings

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(964e0f3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/964e0f348f62a26d806470abc24002d8e679df3e)


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

- Update changelogs for v21.1.0 [skip ci] [`(7b8d429)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b8d4290831f4f0c982a64665136fe7895272b3b)


- Update changelogs for v21.0.0 [skip ci] [`(d54009c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d54009cf33b556e668453ee4a52883801035e42d)


- Update changelogs for v20.9.0 [skip ci] [`(a4fc51a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a4fc51ab5357f54cecc2c18188bf6e683d58100d)


- 🧹 [chore] Update dev dependencies

🧹 [chore] Updates type definitions and tooling packages to newer versions for compatibility and maintenance.
🧹 [chore] Refreshes linting, formatting, and markdown tooling to align with latest ecosystem updates.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(87c1ad2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/87c1ad2b324d67ac1f895accbd6d70e5b6e14f52)


- 🧹 [chore] Update dependencies and gitignore

🔧 [build] Upgrade documentation and linting dependencies
 - 📖 [dependency] Update `typedoc-plugin-mdn-links` to `v5.1.0` in both root and Docusaurus workspaces to ensure accurate external documentation references
 - 🛠️ Update `eslint-plugin-toml` to `v1.0.3` to incorporate recent linting rule improvements
 - 🛠️ Update `eslint-plugin-yml` to `v2.0.1` for YAML file validation stability
🧹 [chore] Update version control ignore rules
 - 📸 Add `storybook/stories/__screenshots__/` to `.gitignore` to prevent tracking of auto-generated visual regression testing assets

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(dd2e57c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dd2e57c6f343aadf376507f90e41f894663c0a55)



### 🔧 Build System

- 🔧 [build] Update TypeScript configuration files for improved build info management
 - 🛠️ Update `tsBuildInfoFile` paths in multiple TypeScript configuration files to ensure consistency
 - 🛠️ Adjust `declarationDir` paths in `.storybook/tsconfig.json` and `docs/docusaurus/tsconfig.json` for better organization
 - 🛠️ Modify `tsBuildInfoFile` paths in benchmark and testing configurations to align with new directory structure

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fcf6daa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fcf6daa5fecd39ef8597474eae75d78efe9a3b9e)


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


- 🔧 [build] Update dependencies in package.json

 - 🔄 Upgrade electron-updater from ^6.6.2 to ^6.7.3 for improved update handling.
 - 🔄 Upgrade ws from ^8.18.3 to ^8.19.0 for WebSocket enhancements.
 - 🔄 Upgrade zod from ^4.3.4 to ^4.3.5 for better type validation.
 - 🔄 Upgrade @dword-design/eslint-plugin-import-alias from ^8.1.2 to ^8.1.3 for import alias linting improvements.
 - 🔄 Upgrade @eslint-react/eslint-plugin from ^2.5.0 to ^2.5.1 for React linting updates.
 - 🔄 Upgrade @typescript-eslint/eslint-plugin, parser, and types from ^8.51.0 to ^8.52.0 for TypeScript linting enhancements.
 - 🔄 Upgrade electron-builder and electron-builder-squirrel-windows from ^26.0.12 to ^26.4.0 for better packaging support.
 - 🔄 Upgrade electron-publish from ^26.0.11 to ^26.3.4 for publishing improvements.
 - 🔄 Upgrade eslint-plugin-antfu from ^3.1.1 to ^3.1.3 for additional linting rules.
 - 🔄 Upgrade eslint-plugin-package-json from ^0.87.1 to ^0.88.0 for package.json linting updates.
 - 🔄 Upgrade eslint-plugin-perfectionist from ^5.2.0 to ^5.3.0 for enhanced code perfectionism checks.
 - 🔄 Upgrade eslint-plugin-putout from ^29.2.4 to ^29.3.0 for better code quality checks.
 - 🔄 Upgrade eslint-plugin-react-dom from ^2.5.0 to ^2.5.1 for React DOM linting improvements.
 - 🔄 Upgrade eslint-plugin-react-hooks-extra and react-naming-convention from ^2.5.0 to ^2.5.1 for additional React hooks linting rules.
 - 🔄 Upgrade eslint-plugin-react-web-api from ^2.5.0 to ^2.5.1 for improved web API linting.
 - 🔄 Upgrade knip from ^5.79.0 to ^5.80.0 for better dependency management.
 - 🔄 Upgrade npm-check-updates from ^19.2.1 to ^19.3.1 for improved package update checks.
 - 🔄 Upgrade putout from ^41.5.0 to ^41.6.1 for enhanced code quality checks.
 - 🔄 Upgrade typedoc-plugin-dt-links from ^2.0.35 to ^2.0.36 for better documentation generation.
 - 🔄 Upgrade typescript-eslint from ^8.51.0 to ^8.52.0 for improved TypeScript linting capabilities.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a2dd2d7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a2dd2d7f517c6ac4edae43d83deb8e61c7acc1ea)


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


- 🔧 [build] Enhance cloud backup metadata handling and validation

 - 🛠️ [fix] Update last reviewed date in Boundary Validation Strategy documentation
 - 🚜 [refactor] Simplify cloud backup metadata parsing by integrating Zod validation
 - 🛠️ [fix] Improve error handling in cloud backup listing to log invalid metadata
 - 📝 [docs] Add validation schemas for cloud backup entries and serialized database metadata
 - 🧪 [test] Add tests for schema validation of import data and cloud backup entries

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4fd0724)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4fd0724d42e6c9816ae308713a48c00ebf47f8b9)


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


- ✨ [feat] Update Storybook and enhance HistoryTab functionality
 - 🔧 [build] Upgrade Storybook addons to version 10.1.6 for improved accessibility and performance
 - 🛠️ [fix] Refactor HistoryTab component to resolve backend history limit and improve dropdown options
 - 📝 [docs] Add detailed comments and JSDoc annotations for clarity on history limit handling
 - 🎨 [style] Enhance HistoryTab story with interactive tests for filtering and adjusting visible history count

✨ [feat] Improve DataService and MonitoringService documentation
 - 📝 [docs] Add comprehensive JSDoc comments to DataService methods for better understanding of data operations
 - 📝 [docs] Enhance MonitoringService documentation to clarify monitoring operations and error handling

🧪 [test] Expand SettingsService tests for history limit handling
 - 🧪 [test] Add tests for various history limit scenarios, including edge cases and non-integer values
 - 🧪 [test] Update test messages to reflect changes in history limit rejection handling

🎨 [style] Refactor Storybook stories for better structure and readability
 - 🎨 [style] Wrap SiteTableRow stories in a semantic table structure to avoid hydration issues
 - 🎨 [style] Improve Settings story with interactive tests for history limit control

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ceaa0d3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ceaa0d368d4785d8b8ad9e2b856b221a7769c94d)


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



### 📦 Dependencies

- *(deps)* [dependency] Update the npm-all group across 1 directory with 26 updates [`(c9a924b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c9a924bc5b67dabf20d9f54d4ff97dab8b9d9958)



### 🔧 Build System

- 🔧 [build] Update dependencies in package.json

 - 🔄 Upgrade react from ^19.2.1 to ^19.2.3 for improved performance and bug fixes
 - 🔄 Upgrade react-dom from ^19.2.1 to ^19.2.3 for better compatibility
 - 🔄 Upgrade @eslint/js from ^9.39.1 to ^9.39.2 for linting improvements
 - 🔄 Upgrade @html-eslint/eslint-plugin and @html-eslint/parser from ^0.50.0 to ^0.51.0 for enhanced HTML linting
 - 🔄 Upgrade @storybook/addon-a11y from ^10.1.7 to ^10.1.8 for accessibility improvements
 - 🔄 Upgrade all Storybook addons from ^10.1.7 to ^10.1.8 for consistency and new features
 - 🔄 Upgrade @types/node from ^25.0.0 to ^25.0.2 for type definitions updates
 - 🔄 Upgrade electron from ^39.2.6 to ^39.2.7 for security patches
 - 🔄 Upgrade eslint from ^9.39.1 to ^9.39.2 for linting enhancements
 - 🔄 Upgrade eslint-plugin-storybook from ^10.1.7 to ^10.1.8 for better Storybook integration
 - 🔄 Upgrade eslint-plugin-testing-library from ^7.13.5 to ^7.13.6 for testing improvements
 - 🔄 Upgrade knip from ^5.73.3 to ^5.73.4 for dependency analysis updates
 - 🔄 Upgrade markdown-to-jsx from ^9.3.4 to ^9.3.5 for JSX parsing improvements
 - 🔄 Upgrade storybook from ^10.1.7 to ^10.1.8 for overall enhancements
 - 🔄 Upgrade typedoc-plugin-dt-links from ^2.0.32 to ^2.0.33 for documentation improvements

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9ecc82a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9ecc82acfaa81e2b3a3a1c150ba343456fb6c82a)


- 🔧 [build] Update package.json for improved build and linting processes
 - 🛠️ Remove `build-storybook` command from the build scripts to streamline the build process
 - 🧹 Reorganize type checking commands:
   - Add `check-types`, `check-types:all`, and `check-types:all:all` back to the scripts for better type validation
 - 🎨 Update linting commands:
   - Modify `lint:format` to run `lint:prettier` for consistency in formatting checks
   - Adjust `lint:prettier` and `lint:prettier-fix` to improve logging and disable autofix for multiline arrays
 - 🔄 Update dependencies:
   - [dependency] Update versions of `type-fest`, `@snyk/protect`, `@storybook/addon-designs`, `@types/node`, `@typescript-eslint/*`, `vite`, and others for better compatibility and features
 - ⚡ Enhance linting and testing scripts:
   - Add `lint-pretty` and `lint-pretty:fix` for improved linting output and fixes
   - Introduce new scripts for spell checking and markdown link validation
 - 📝 Update documentation scripts to ensure frontmatter validation and link checking are included

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bde6359)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bde6359be97670b7225bed742f21162df6469379)






## [19.2.0] - 2025-12-08


[[3e34403](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e34403589d8dbbd436473401a7d17434e845c70)...
[ba94cc6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ba94cc68427605be82be1a2071febe16c69984f7)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/3e34403589d8dbbd436473401a7d17434e845c70...ba94cc68427605be82be1a2071febe16c69984f7))


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



### 🛠️ Bug Fixes

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



### 📦 Dependencies

- [chore] Merge Branch 'main' of https://github.com/nick2bad4u/uptime-watcher

* 'main' of https://github.com/nick2bad4u/uptime-watcher:
  test[docusaurus](deps): [dependency] Update the npm-all group
  [ci][skip-ci](deps): [dependency] Update dependency group
  test(deps): [dependency] Update express
  test[docusaurus](deps): [dependency] Update mdast-util-to-hast
  test(deps): [dependency] Update mdast-util-to-hast 13.2.1 [`(8173893)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8173893c94d2ee524ad775fe4abbe0ce3ac29c26)


- *(deps)* [dependency] Update the npm-all group [`(e879f18)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e879f18429503a2203aca37c404b8a32106ceeaf)


- *(deps)* [dependency] Update mdast-util-to-hast [`(2965170)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/29651700fce7f89b2dc6c156cd91174afad9d1a9)



### 🛠️ Other Changes

- Merge PR #116

test[docusaurus](deps): [dependency] Update mdast-util-to-hast 13.2.1 in /docs/docusaurus [`(7bf1eb5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7bf1eb50b10b02a196b6a55b1b208cab81d110c2)



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



### 📝 Documentation

- 📝 [docs] Update ADR-011 and ADR-013 documentation

 - 📝 [docs] Enhance ADR-011 with detailed explanations on jitter/backoff benefits:
   - **Thundering herd avoidance**: Staggered start times to reduce network/CPU spikes.
   - **Flapping mitigation**: Backoff strategy to temper rapid retries on down hosts.
   - **Timeout recovery**: Prevent overlapping checks with timeout-aware cancellation.
   - **Manual check coexistence**: Backoff reconciles next-run after manual overrides.
   - **Resource fairness**: Spreading load during incident storms.

 - 📝 [docs] Revise ADR-013 to reflect changes in backup metadata:
   - Updated `last_reviewed` date to "2025-12-05".
   - Changed status from "Draft" to "Accepted".
   - Expanded implementation details for backup and restore processes:
     - Embed additional metadata fields in backups for validation and user guidance.
     - Documented validation steps and manual recovery processes for corrupted backups.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(50d4df9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/50d4df99f0817a3675f740c2f877f263739b1ef8)



### 🔧 Build System

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






## [19.1.0] - 2025-11-26


[[1bdb297](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1bdb2979eb333748b43e95737d2cc6e78d0f7be3)...
[3b43b50](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3b43b504ee555122a743752534238a1d9387d2d7)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1bdb2979eb333748b43e95737d2cc6e78d0f7be3...3b43b504ee555122a743752534238a1d9387d2d7))


### 🛠️ Bug Fixes

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



### 📦 Dependencies

- *(deps)* [dependency] Update sucrase [`(1bdb297)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1bdb2979eb333748b43e95737d2cc6e78d0f7be3)



### 🔧 Build System

- 🔧 [build] Update ESLint configuration for improved package.json validation
 - 🛠️ Add new rules for package.json validation including:
   - "package-json/bin-name-casing": "warn"
   - "package-json/no-redundant-publishConfig": "warn"
   - "package-json/require-attribution": "warn"
   - "package-json/require-exports": "warn"
   - "package-json/restrict-private-properties": "warn"
   - "package-json/valid-homepage": "warn"
   - "package-json/valid-publishConfig": "warn"
   - "package-json/valid-repository": "warn"
   - "package-json/valid-sideEffects": "warn"
   - "package-json/valid-workspaces": "warn"
 - 🛠️ Enable warnings for TypeScript private class members:
   - "@typescript-eslint/no-unused-private-class-members": "warn"
 - 🛠️ Enhance JSDoc rules for better documentation practices:
   - "jsdoc/no-blank-blocks": "warn"
   - "jsdoc/ts-no-empty-object-type": "warn"

✨ [feat] Add favicon and icon assets for improved branding
 - 🎨 Add favicon.ico for application branding
 - 🎨 Update icon-512.png for enhanced visual representation
 - 🎨 Add icon-transparent-512.png for transparent icon support

🧪 [test] Refactor Settings component tests for clarity and maintainability
 - 🔄 Replace property-based tests with explicit scenarios for better readability
 - 🛠️ Update test descriptions to reflect the new structure
 - 🔄 Ensure all test cases are covered with clear assertions

🛠️ [fix] Improve object safety tests for better accuracy
 - 🔄 Change property checks to use Object.hasOwn for more reliable assertions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3b43b50)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3b43b504ee555122a743752534238a1d9387d2d7)


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






## [19.0.0] - 2025-11-24


[[8444d6b](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8444d6bc735cc9f5090d854b7e6adb473ddfb26e)...
[4a0e1fd](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4a0e1fdf142441c46574b6d98b8655e3671d6061)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/8444d6bc735cc9f5090d854b7e6adb473ddfb26e...4a0e1fdf142441c46574b6d98b8655e3671d6061))


### ✨ Features

- ✨ [feat] Update documentation and configuration files
 - 📝 Update `.github/labeler.yml` to remove unnecessary schema declaration
 - 🛠️ Modify `backup-docusaurus.yml` to fetch the latest state from the remote before pushing documentation
 - 🛠️ Change `playwright.yml` to force install dependencies using `npm ci --force`
 - 🛠️ Update `stryker-mutation-testing.yml` to force install dependencies with `npm ci --force`
 - 📝 Simplify `.remarkignore` to ignore all MDX files in the specified directory
 - 📝 Add TypeScript ignore directive in `.remarkrc.mjs` for missing types
 - 📝 Correct title casing in `DOCUSAURUS_REMOTE_GIT_SETUP.md`
 - 🎨 Update badges in `README.md` for better clarity and consistency
 - ✨ Add `@eslint/config-inspector` to `package.json` dependencies
 - 🎨 Refactor `index.module.css` to enhance hero section styles and animations
 - 📝 Clean up `index.tsx` by removing unused components and improving readability
 - 📝 Enhance `typedoc.config.json` with additional links for better documentation navigation
 - ✨ Add new scripts in `package.json` for backing up documentation with subtree commands

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f6e2cb2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f6e2cb2a42af563a51c07d8be9046d32b5b43672)


- ✨ [feat] Implement Docusaurus documentation backup workflow
 - 🛠️ Add GitHub Actions workflow for building and backing up Docusaurus documentation
 - 📁 Create backup-docusaurus.yml to automate documentation deployment
 - 🔧 Update package.json with commands for subtree backup and force push
 - 📝 Add documentation style guide for Docusaurus setup
 - 🎨 Enhance README with detailed site structure and deployment instructions
 - 🧹 Update .gitignore to exclude Docusaurus build artifacts and generated files
 - 🔍 Refine prompts for property-based testing in Enhance-Tests prompt

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(542eb08)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/542eb08db4a5d1f8a625c38778732533dc155683)


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



### 📦 Dependencies

- *(deps)* [dependency] Update the npm-all group across 1 directory with 53 updates [`(8444d6b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8444d6bc735cc9f5090d854b7e6adb473ddfb26e)



### 📝 Documentation

- 📝 [docs] Update TSDoc links for consistency
 - Correct links in TSDoc-Home.md to point to the appropriate files
 - Update TSDoc-Package-Tsdoc.md link to reflect the correct path
 - Modify TSDoc-Spec-Overview.md to ensure accurate package reference
 - Adjust comments in StatusSubscriptionIndicator.utils.ts for clarity
 - Refine useAddSiteForm.ts documentation by removing unnecessary link syntax
 - Enhance chartConfig.ts comments for better readability
 - Add Stylelint config schema reference in stylelint.config.mjs

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4a0e1fd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4a0e1fdf142441c46574b6d98b8655e3671d6061)



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


- 🔧 [build] Update configuration files for improved linting and schema validation
 - 🛠️ [fix] Modify .mega-linter.yml to include quotes around file paths and add default workspace
 - 🛠️ [fix] Enhance biome.json with new 'grit' assist configuration and set root to true
 - 🛠️ [fix] Add YAML schema references to cliff.toml, kics.yaml, and lychee.toml
 - 🛠️ [fix] Introduce npm-badges.json for GitHub integration with npm package details
 - 📝 [docs] Correct schema reference in typedoc.config.json and typedoc.local.config.json
 - 🔧 [build] Update package.json and package-lock.json with new type definitions for postcss
 - 🎨 [style] Add typedoc-plugin-markdown.json for enhanced documentation generation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4c29fc6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4c29fc698149e8fc8944d9d07d518221e04415fa)






## [18.8.0] - 2025-11-22


[[5853763](https://github.com/Nick2bad4u/Uptime-Watcher/commit/585376360caca008e80e25517409768c539f8e1f)...
[4343aef](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4343aef944aa50ad78869cc7953cb18aa4ad1f79)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/585376360caca008e80e25517409768c539f8e1f...4343aef944aa50ad78869cc7953cb18aa4ad1f79))


### ✨ Features

- ✨ [feat] Add new icon assets and improve UI styling
 - 🎨 [style] Introduced new icon files for various sizes including 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 192x192, 256x256, 512x512, and favicon files in both PNG and ICNS formats.
 - 🎨 [style] Updated CSS styles for body and root elements to enhance layout responsiveness with `block-size` and `max-block-size` properties.
 - 🎨 [style] Improved scrollbar styles for both light and dark modes, adjusting background and thumb colors for better visibility.
 - 🎨 [style] Enhanced card component styles with hover effects, transitions, and improved layout for better user experience.
 - 🎨 [style] Added smooth scrolling behavior to modal overlays and improved modal shell animations for better visual feedback.
 - 🎨 [style] Refined settings and modal components to ensure consistent styling and behavior across the application.
 - 🧪 [test] Updated tests for `AddSiteModal` and `Settings` components to ensure proper handling of close actions and modal interactions, incorporating `waitFor` for asynchronous behavior.
 - 🧪 [test] Enhanced branch coverage tests for `AddSiteModal` to validate user interactions and modal state changes.
 - 🧪 [test] Improved comprehensive tests for `HistoryTab` to ensure button visibility and functionality.
 - 🧪 [test] Added utility function `waitForAnimation` to facilitate waiting for animations in tests.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d6311ce)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6311ce2cade5be9ddaf6b537d9fe3b4008d0181)



### 📝 Documentation

- 📝 [docs] Update documentation frontmatter and summaries
 - 📝 Add frontmatter to CODEGEN_BEST_PRACTICES.md, CODEGEN_TEMPLATE_USAGE.md, FAST_CHECK_FUZZING_GUIDE.md, HEADLESS_TESTING.md, PLAYWRIGHT_CODEGEN_GUIDE.md, PLAYWRIGHT_TESTING_GUIDE.md, TEST_VERBOSITY_GUIDE.md, ZERO_COVERAGE_AUDIT.md
 - 📝 Update summaries and metadata for clarity and consistency

🔧 [build] Update package dependencies
 - 🔧 Upgrade eslint-plugin-es-x from 9.1.2 to 9.2.0
 - 🔧 Upgrade globals-vitest from 4.0.12 to 4.0.13

🛠️ [fix] Improve Playwright configuration
 - 🛠️ Simplify reporter configuration in playwright.config.ts
 - 🛠️ Update recording configuration comments for clarity

🚜 [refactor] Skip flaky Playwright tests
 - 🚜 Mark specific tests as skipped in ui-addsitemodal-basic.ui.playwright.test.ts to avoid flakiness due to upstream issues

🧪 [test] Enhance test coverage for UI components
 - 🧪 Add surfaceDensity state management in Header and SiteList components
 - 🧪 Update SiteList and SiteListLayoutSelector stories to use InterfaceDensity

🎨 [style] Clean up code formatting
 - 🎨 Standardize formatting in various test files for improved readability
 - 🎨 Refactor MarqueeText story to use Tailwind CSS classes for styling

🧹 [chore] Maintain documentation scripts
 - 🧹 Update maintain-docs.mjs to process documentation folders more efficiently
 - 🧹 Extend last_reviewed date update logic to 180 days for better tracking

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(cb0e9ed)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cb0e9ed8638f1d7a3c8976f57b15de3e167fa73f)


- 📝 [docs] Update guidelines across multiple folders and files

 - ✨ [docs] Enhance JSON instructions with tooling alignment for npm scripts to maintain order and validation.
 - ✨ [docs] Add repository conventions to MJS instructions, targeting Node.js 24+ and ensuring compatibility with shared tooling.
 - ✨ [docs] Revise Markdown instructions to clarify front matter usage and metadata accuracy, including tooling alignment with Remark.
 - ✨ [docs] Introduce Playwright folder guidelines for structuring E2E tests, emphasizing test harness usage and fixture management.
 - ✨ [docs] Update Playwright TypeScript instructions to include metadata tagging for tests and proper file organization.
 - ✨ [docs] Add PowerShell guidelines for repository conventions and cross-platform execution.
 - ✨ [docs] Establish Public folder guidelines for static assets, detailing the purpose and management of files in the public directory.
 - ✨ [docs] Revise ReactJS instructions to enforce the use of Properties suffix for props/interfaces and integration with the service layer.
 - ✨ [docs] Create Scripts folder guidelines to ensure tooling scripts remain focused on automation and adhere to safety and performance standards.
 - ✨ [docs] Introduce Shared folder guidelines to define contracts and utilities, emphasizing environment-agnostic code.
 - ✨ [docs] Establish Src folder guidelines for the React renderer layer, detailing directory structure and data access practices.
 - ✨ [docs] Create Storybook folder guidelines for configuration and story management, ensuring deterministic behavior in stories.
 - ✨ [docs] Update Storybook instructions to include async data handling with MSW and resilience for Electron-specific stories.
 - ✨ [docs] Create Tests folder guidelines to ensure tests focus on observable behavior and maintain isolation and determinism.
 - ✨ [docs] Revise TypeScript 5 instructions to leverage path aliases and module resolution settings.
 - ✨ [docs] Enhance YAML instructions with tooling alignment for linting YAML files.
 - ✨ [docs] Update copilot instructions to clarify coding standards and workflow integration.
 - ✨ [docs] Add a new guide for Sites Store Mutation and Sync, detailing the mutation pipeline, state sync, and logging conventions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c8930ad)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c8930adb93d0439194e37a72bebe6c8ac9d270a7)


- 📝 [docs] Update documentation for state synchronization and settings service
 - 📜 Added detailed explanation of the state sync pipeline in `docs/TSDoc/stores/sites.md`
 - 📜 Included references to architecture documentation for better understanding of state sync operations
 - 📜 Enhanced comments in `SettingsService.ts` regarding history retention limit updates

🛠️ [fix] Refactor Playwright tests for site card actions
 - 🔍 Improved locator strategy for global toaster notifications
 - 🔄 Simplified toast visibility checks and dismissal logic
 - 🔄 Ensured proper handling of monitoring state transitions in tests

🚜 [refactor] Update mocking strategy in AddSiteForm tests
 - 🔄 Changed constant mocks to preserve original exports while overriding specific values
 - 🔄 Streamlined mock implementations for theme and constants to avoid hoisting issues

🧪 [test] Enhance coverage for AddSiteForm component tests
 - 🔍 Added input fuzzing tests to ensure robustness against invalid inputs
 - 🔍 Improved branch coverage by triggering error logging scenarios in radio group component

🧪 [test] Improve theme-related tests for comprehensive coverage
 - 🔄 Updated theme mocks to use async imports for better compatibility
 - 🔄 Ensured consistent theme behavior across various components and tests

⚡ [perf] Optimize Vite configuration
 - 🔧 Adjusted ESLint rules in `vite.config.ts` for better build performance
 - 🔧 Enhanced thread management logic for improved build efficiency

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d94d500)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d94d500d5ee109bb9b197cfed94eea84dad328d0)


- 📝 [docs] Update documentation scripts and linting processes
 - 🔧 Add new script for checking documentation frontmatter: `docs:check`
 - 🧹 Remove redundant `docs:validate:frontmatter` script
 - 🔧 Reorganize documentation linting scripts for clarity
 - 🔧 Add `docs:fix` and `docs:maintain` scripts for better maintenance
 - 🔧 Introduce `docs:stats` and `docs:toc` for documentation analysis and table of contents generation
 - 🔧 Add `docs:validate-links` for link validation in documentation

🔧 [build] Update dependencies and improve package management
 - 🔧 Upgrade `@biomejs/biome` from `^2.3.5` to `^2.3.6`
 - 🔧 Upgrade Storybook packages from `^10.0.7` to `^10.0.8`
 - 🔧 Upgrade `typescript-eslint` packages from `^8.46.4` to `^8.47.0`
 - 🔧 Upgrade Vitest packages from `^4.0.9` to `^4.0.10`
 - 🔧 Upgrade `eslint-plugin-package-json` from `^0.79.0` to `^0.83.0`
 - 🔧 Upgrade `eslint-plugin-storybook` from `^10.0.7` to `^10.0.8`
 - 🔧 Add new dependencies for improved linting and validation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9e9417d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9e9417deafcbcbcff984141702e2a7180756e1a7)


- 📝 [docs] Update Tools and Commands Guide with project test suite instructions
 - Added detailed instructions for running project test suites using Vitest
 - Included commands for targeted test executions and coverage analysis workflows
 - Clarified usage of temporary logs and cleanup processes for test outputs

🛠️ [fix] Refactor test cases for improved clarity and functionality
 - Updated `Submit.comprehensive.test.tsx` to use `calls.at(-1)` for better readability
 - Enhanced `StatusAlertToaster.test.tsx` and `SiteCardHeader.test.tsx` to use component names in describe blocks
 - Improved mock implementations in `SiteCompactCard.test.tsx` for better state management
 - Adjusted `monitorValidation.error-handling.test.ts` to use a more structured mock for monitor types store state

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(194e3f3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/194e3f3f1ea37cdbd6cc122aae6145ae8cee42dd)


- 📝 [docs] Update documentation for Uptime Watcher

 - 🔧 [docs] Update last reviewed dates in multiple guides to 2025-11-16
 - 📝 [docs] Improve table of contents formatting in various guides for better navigation
 - 📝 [docs] Add missing sections to the table of contents in Playwright testing guides
 - 📝 [docs] Enhance frontmatter structure in markdown files for consistency
 - 📝 [docs] Add new tags and categories to various documentation files for better organization
 - 📝 [docs] Remove deprecated references to 'remark-reference-links' and add 'remark-inline-links' for improved link handling
 - 🛠️ [fix] Fix internal link resolution in documentation scripts to handle edge cases
 - 🚜 [refactor] Refactor documentation maintenance scripts for better readability and performance
 - 🧪 [test] Update validation script to include new documentation directories for thorough checks

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(61a3fce)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/61a3fce71d9028f4218c7ef0c6d225abe14bba38)


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



### 🧹 Chores

- 🧹 [chore] Clean up unused files and configurations across the project
 - Removed obsolete configurations from .storybook and electron directories
 - Streamlined component stories in storybook for better organization
 - Eliminated redundant utility files in shared and src directories

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(35c2751)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/35c2751a9c375a400a99950a8ea27212d06c30e5)



### 🔧 Build System

- 🔧 [build] Update documentation and configuration files
 - 📝 [docs] Correct link to Validation Strategy guide in CONTRIBUTING.md
 - 🔧 [build] Exclude additional directories in TypeScript configuration files
   - Updated tsconfig.AllOtherRoot.json to exclude "node_modules" and "eslint.config.mjs"
   - Updated tsconfig.js.json to exclude "node_modules" and "../../node_modules/**"
   - Updated tsconfig.scripts.json to exclude "../../playwright/codegen-template.mjs"
 - 🎨 [style] Add new Storybook addon to knip.config.ts
 - 📝 [docs] Remove references to AI_CONTEXT.md in multiple documentation files
   - Updated DEVELOPER_QUICK_START.md, DOCUMENTATION_INDEX.md, and ORGANIZATION_SUMMARY.md
 - 🛠️ [fix] Modify ESLint configuration to handle missing types for HTML plugin
 - 🧪 [test] Enable previously skipped Playwright tests for UI components
 - 🛠️ [fix] Improve IPC channel analysis logic in analyze-ipc-channels.ts
 - 🛠️ [fix] Enhance error handling in detect-zero-coverage-tests.ts
 - 🛠️ [fix] Clean up console logging in List-Sites.js
 - 🛠️ [fix] Refactor seed handling in run-fast-check-fuzzing.ts
 - 🔧 [build] Update Jest configuration for Storybook test runner

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4343aef)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4343aef944aa50ad78869cc7953cb18aa4ad1f79)


- 🔧 [build] Refactor UI density handling and improve modal animations

 - ✨ [feat] Rename `SiteTableDensity` to `InterfaceDensity` for clarity in UI density settings.
 - 🔧 [build] Update `UIStore` interface to use `surfaceDensity` instead of `siteTableDensity`.
 - 🧪 [test] Adjust tests to reflect changes in density naming and ensure proper functionality.
 - 🎨 [style] Add new CSS animations for modal transitions to enhance user experience.
 - 🎨 [style] Introduce shared density tokens for comfortable, cozy, and compact layouts in utility styles.
 - 🎨 [style] Update button focus styles to improve accessibility and visual feedback.
 - 🎨 [style] Refine card background gradients and overlays for a modern look.
 - 🎨 [style] Enhance input and select components with improved border and background styles.
 - 🎨 [style] Implement layout content width caps for better responsiveness across devices.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(27d0406)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/27d0406b29022a06fc1d04be2c2224a242199dd8)


- 🔧 [build] Update @types/react and related dependencies

 - Updated @types/react from ^19.2.5 to ^19.2.6 for improved type definitions
 - Updated @types/react-refresh from ^0.14.6 to ^0.14.7 for better compatibility
 - Updated globals-vitest from ^4.0.9 to ^4.0.10 for enhanced functionality
 - Updated csstype from ^3.0.2 to ^3.2.2 for better type support
 - Updated csstype in package-lock.json to reflect the new version

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(cd3393a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd3393a7e5a7751588dbedbf9bb0efdb83ba6afa)


- 🔧 [build] Update dependencies in package.json

 - 📦 Added new dependencies for remark linting:
   - 📝 `remark-directive` for improved directive handling.
   - 📝 `remark-lint-check-toc` to enforce table of contents checks.
   - 📝 `remark-lint-checkbox-content-indent` for consistent checkbox indentation.
   - 📝 `remark-lint-code-block-split-list` to ensure proper code block formatting.
   - 📝 `remark-lint-definition-sort` for sorting definitions.
   - 📝 `remark-lint-directive-*` for various directive attribute checks:
     - `remark-lint-directive-attribute-sort`
     - `remark-lint-directive-collapsed-attribute`
     - `remark-lint-directive-quote-style`
     - `remark-lint-directive-shortcut-attribute`
     - `remark-lint-directive-unique-attribute-name`
   - 📝 `remark-lint-fenced-code-flag-case` for case sensitivity in fenced code flags.
   - 📝 `remark-lint-first-heading-level` to enforce heading levels.
   - 📝 `remark-lint-linebreak-style` for consistent line break styles.
   - 📝 `remark-lint-mdx-jsx-*` for JSX attribute checks:
     - `remark-lint-mdx-jsx-attribute-sort`
     - `remark-lint-mdx-jsx-no-void-children`
     - `remark-lint-mdx-jsx-quote-style`
     - `remark-lint-mdx-jsx-self-close`
     - `remark-lint-mdx-jsx-shorthand-attribute`
     - `remark-lint-mdx-jsx-unique-attribute-name`
   - 📝 `remark-lint-media-style` for media syntax checks.
   - 📝 `remark-lint-no-*` for various linting rules:
     - `remark-lint-no-duplicate-headings-in-section`
     - `remark-lint-no-empty-sections`
     - `remark-lint-no-heading-indent`
     - `remark-lint-no-heading-like-paragraph`
     - `remark-lint-no-hidden-table-cell`
     - `remark-lint-no-html`
     - `remark-lint-no-missing-blank-lines`
     - `remark-lint-no-paragraph-content-indent`
     - `remark-lint-no-unneeded-full-reference-image`
     - `remark-lint-no-unneeded-full-reference-link`
   - 📝 `remark-lint-strikethrough-marker` for strikethrough syntax checks.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4a0e06d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4a0e06ddb88a2ff36a9c0d22b083c861131ec10e)






## [18.6.0] - 2025-11-16


[[ab90f2f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab90f2fa1cca5634195783f3e79a5fa7dd8e4ecf)...
[e605499](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e6054997dc4d74ced490662e94c0156e153b3414)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/ab90f2fa1cca5634195783f3e79a5fa7dd8e4ecf...e6054997dc4d74ced490662e94c0156e153b3414))


### 📝 Documentation

- 📝 [docs] Update metadata and structure in documentation files

 - 📄 Update last reviewed date and created date in Architecture documentation
 - 📄 Refactor Consistency Guide to include metadata, topics, and tags
 - 📄 Enhance Testing documentation with metadata, topics, and tags
 - 📄 Revise Docusaurus README to include metadata and topics
 - 📄 Improve ESLint Config Inspector Deployment summary with metadata and topics
 - 📄 Modify Markdown page example to include metadata and topics

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ab90f2f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab90f2fa1cca5634195783f3e79a5fa7dd8e4ecf)



### 🔧 Build System

- 🔧 [build] Optimize file handling in build workflow
 - 🛠️ Move main files instead of copying to reduce disk usage
 - 🛠️ Rename latest-mac.yml to architecture-specific name after moving
 - 🛠️ Update directory handling to use move instead of copy for subdirectories

🧪 [test] Enhance error logging in main application tests
 - 🛠️ Mock structured logger for consistent error assertions
 - 🛠️ Update tests to verify structured logger captures initialization errors

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e605499)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e6054997dc4d74ced490662e94c0156e153b3414)






## [18.5.0] - 2025-11-16


[[abc5dca](https://github.com/Nick2bad4u/Uptime-Watcher/commit/abc5dca68427da99938430a87052204c985d76df)...
[a271f8a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a271f8aa5516cee2d7604a6ace12612a5a51be81)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/abc5dca68427da99938430a87052204c985d76df...a271f8aa5516cee2d7604a6ace12612a5a51be81))


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


- 📝 [docs] Update documentation with metadata and summaries
 - Added metadata to multiple guides including UI Feature Development, Vite Performance, Zustand Store Pattern, and Validation Strategy
 - Enhanced descriptions and keywords for better searchability
 - Updated README files for Testing and Docusaurus with relevant summaries and metadata

🛠️ [fix] Corrected links and paths in documentation
 - Fixed paths in TSDoc README and other documentation files to ensure proper navigation
 - Updated script to check document links to include new directories

✨ [feat] Enhance alert store tests with additional scenarios
 - Added tests for deriving site names from identifiers when names are blank
 - Implemented tests for normalizing invalid timestamps to Date.now()
 - Introduced tests for identifier generation fallbacks using crypto and Date.now()

🚜 [refactor] Refactor Storybook configuration
 - Changed import paths in Storybook main configuration to include file extensions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(abc5dca)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/abc5dca68427da99938430a87052204c985d76df)



### 🔧 Build System

- 🔧 [build] Update dependencies in package.json

 - 🔄 Update `@cspell/cspell-bundled-dicts` and `@cspell/cspell-types` to version `9.3.2` for improved spell checking.
 - 🔄 Upgrade `@eslint/compat` to version `2.0.0` for better compatibility with ESLint.
 - 🔄 Upgrade `@eslint/mcp` to version `0.2.0` for enhanced linting capabilities.
 - 🔄 Update `@types/react` to version `19.2.5` for better type definitions.
 - 🔄 Update `@types/validator` to version `13.15.9` for improved validation types.
 - 🔄 Upgrade `cspell` to version `9.3.2` for better spell checking functionality.
 - 🔄 Update `electron` to version `39.2.1` for the latest features and fixes.
 - 🔄 Upgrade `eslint-plugin-boundaries` to version `5.2.0` for improved linting rules.
 - 🔄 Update `eslint-plugin-package-json` to version `0.79.0` for better package.json linting.
 - 🔄 Upgrade `eslint-plugin-putout` to version `28.2.0` for enhanced linting capabilities.
 - 🔄 Update `globals-vitest` to version `4.0.9` for better global definitions.
 - 🔄 Upgrade `msw` to version `2.12.2` for improved mocking capabilities.
 - 🔄 Update `typedoc-plugin-dt-links` to version `2.0.29` for better documentation generation.

📝 [docs] Enhance frontmatter validation in validate-doc-frontmatter.mjs

 - 🔄 Update validation logic to accept both `schema` and legacy `$schema` properties for schema references.
 - 🔄 Improve error messages to clarify the requirement for a string `schema` property pointing to the schema file.
 - 🔄 Ensure that the validation checks for the correct schema reference path, enhancing the robustness of the frontmatter validation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a271f8a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a271f8aa5516cee2d7604a6ace12612a5a51be81)






## [18.3.0] - 2025-11-15


[[d175e8f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d175e8f375680302ceffb8f9174f766e30321a40)...
[2b14f01](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2b14f0111b29fc307052ea69b99b90f9e7d6bcc5)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/d175e8f375680302ceffb8f9174f766e30321a40...2b14f0111b29fc307052ea69b99b90f9e7d6bcc5))


### ✨ Features

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


- ✨ [feat] Enhance configuration and testing coverage
 - 🔧 [build] Update Knip configuration to include additional files for dependency analysis
 - 🎨 [style] Refactor Docusaurus config to use ESM paths for client modules
 - 🧪 [test] Add strict regression tests for Docusaurus configuration
 - 🧪 [test] Implement strict coverage tests for NotificationPreferenceService
 - 🧪 [test] Add strict coverage tests for monitor identifier utilities
 - 🧪 [test] Introduce strict edge-case coverage for monitor title formatter utilities

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0e30778)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0e307788ca50503c23e343ba376a1545ca3ef73b)


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



### 📦 Dependencies

- *(deps)* [dependency] Update the npm-all group [`(4c88e65)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4c88e6555363c1c7f942ead98c8e15f1ab48d149)


- *(deps)* [dependency] Update the npm-all group (#97) [`(77cf1be)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/77cf1bea163b8feec0afda3a697f13d0719c5621)



### 📝 Documentation

- 📝 [docs] Update documentation for clarity and consistency

 - 📝 Refactor documentation index for improved readability
   - Adjusted table formatting for better alignment
   - Updated links to follow consistent naming conventions (e.g., `AI_CONTEXT.md` to `AI\_CONTEXT.md`)

 - 📝 Enhance IPC Automation Workflow troubleshooting section
   - Reformatted troubleshooting table for clarity
   - Improved descriptions for common issues and fixes

 - 📝 Revise New Monitor Type Implementation guide
   - Clarified file impact matrix with better formatting

 - 📝 Update Organization Summary for new user onboarding
   - Adjusted document links to follow consistent naming conventions

 - 📝 Revise Renderer Integration Guide for better structure
   - Improved IPC & Event Channels section with clearer formatting
   - Enhanced testing guidance for better clarity

 - 📝 Improve Vite Performance guide
   - Cleaned up import optimization examples for better understanding

 - 📝 Update Validation Strategy documentation
   - Enhanced layer overview table for better clarity and consistency

 - 📝 Revise Fast Check Fuzzing Guide
   - Improved formatting for environment variable descriptions

 - 📝 Update Playwright Testing Guide
   - Enhanced emergency fixes section for clarity

 - 📝 Revise Testing README for better organization
   - Improved section headers and descriptions for testing guides

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2b14f01)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2b14f0111b29fc307052ea69b99b90f9e7d6bcc5)


- 📝 [docs] Remove references to Packages documentation in Docusaurus setup and TypeDoc configuration
 - 📝 Update `.remarkrc.mjs` to remove processing settings comment
 - 📝 Remove `Packages` directory references from `DOCUSAURUS_SETUP_GUIDE.md`
 - 📝 Eliminate `Packages` directory from entry points in `typedoc.config.json`
 - 📝 Remove `Packages` directory from entry points in `typedoc.local.config.json`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d8965a8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d8965a8f2f411515538639fbf6d78ebc3a748918)


- 📝 [docs] Update documentation style guide and file naming conventions
 - 📄 Change documentation file names to use uppercase and underscores for consistency
 - 📄 Update links in various guides to reflect new file naming conventions
 - 📄 Revise examples in the style guide to match updated naming standards

📝 [docs] Revise environment setup documentation
 - 📄 Update links to the Developer Quick Start Guide to match new naming conventions

📝 [docs] Modify error handling and event system guides
 - 📄 Update related resource links to reflect new file naming conventions

📝 [docs] Remove obsolete logger migration report
 - 🗑️ Delete the Logger Migration Complete Report as it is no longer needed

📝 [docs] Add new Style & Layout Guide
 - 📄 Introduce guidelines for consistent styling and layout practices across the application

📝 [docs] Update testing documentation
 - 📄 Revise related resource links to reflect new file naming conventions
 - 📄 Improve clarity in fuzzing guide regarding environment variables

📝 [docs] Update Vite performance guide
 - 📄 Revise related resource links to reflect new file naming conventions

📝 [docs] Update Zustand store pattern guide
 - 📄 Revise related resource links to reflect new file naming conventions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7b7cc46)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b7cc46def581c60e8b73026fed18387529e20b6)


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


- 📝 [docs] Add implementation-audit snapshots and unify IPC inventory artifact

🛠️ [fix] Standardize generated IPC inventory filename → IPC_CHANNEL_INVENTORY.md
 - 🔁 Update generator to emit docs/Architecture/generated/IPC_CHANNEL_INVENTORY.md (scripts/generate-ipc-artifacts.mts)
 - 📝 Replace references across docs/guides to the canonical artifact (IPC_AUTOMATION_WORKFLOW.md, RENDERER_INTEGRATION_GUIDE.md, TECHNOLOGY_EVOLUTION.md, ADR_005, README.md, etc.)
 - ➕ Add generated artifact at docs/Architecture/generated/IPC_CHANNEL_INVENTORY.md

📝 [docs] Add "Current Implementation Audit (2025-11-04)" snapshots across architecture docs, patterns, and templates
 - ✅ Capture verification of live code (repositories, TypedEventBus, IPC handlers/utilities, preload bridges, cache config, Zustand stores, error/operational hooks)
 - 📁 Files updated include: ADR_001..ADR_006, ARCHITECTURE_DIAGRAM.md, COMPONENT_PROPS_STANDARDS.md, DEVELOPMENT_PATTERNS_GUIDE.md, site-loading-orchestration.md, Templates/* (IPC_HANDLER_TEMPLATE.md, REPOSITORY_TEMPLATE*.md, ZUSTAND_STORE_TEMPLATE.md), Using-This-Documentation.md and others

🧹 [chore] Normalize docs index & file naming in docs/Architecture/README.md
 - 🔤 Switch ADR/template listings to underscore/UPPERCASE conventions, add "Generated Artifacts" section, and refresh diagram/mapping nodes to reflect renamed files

🛠️ [fix] Miscellaneous doc & formatting fixes
 - 🧾 TSDOC_STANDARDS.md: adjust code-fence/Repository Methods formatting
 - ✏️ Minor phrasing, link and lint-rule notes updated in Using-This-Documentation.md and related guides

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d175e8f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d175e8f375680302ceffb8f9174f766e30321a40)



### 🎨 Styling

- 🎨 [style] Update color values to use full hex codes for consistency
 - 🔧 Updated background and text colors in various CSS files to use full hex codes (e.g., #ffffff instead of #fff) for better readability and consistency.
 - 📝 Modified gradient color definitions to replace shorthand hex codes with full hex codes across multiple components including buttons, cards, forms, and overlays.
 - 🎨 Adjusted hover and focus states in button styles to ensure uniformity in color representation.
 - 🎨 Enhanced tooltip and alert styles by standardizing color definitions to full hex codes.
 - 🎨 Refined status indicator styles to utilize full hex codes for improved clarity in color mixing.
 - 🎨 Updated media query styles to ensure consistent color definitions across different themes.
 - 🎨 Revised settings and header styles to reflect the change in color definitions, ensuring a cohesive design language.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2cddf72)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2cddf7243b81e8fa7055d4c7dc383cc5e4c4c76f)


- 🎨 [style] Refactor ESLint configurations and improve code styling
 - 🧹 Remove unused ESLint disable comments in multiple files
 - 🎨 Update CSS styles for StatusAlertToaster component
 - 🎨 Adjust layout and styling for SiteList component
 - 🎨 Enhance Docusaurus configuration and remove unnecessary comments
 - 🎨 Modify GitHubStats component to clean up ESLint rules
 - 🎨 Update Storybook helpers for better clarity and organization
 - 📝 Add new TSDoc tags for improved documentation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5c0bcf9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5c0bcf9b6fcd8134ff448d4a892442de0301b62c)



### 🧹 Chores

- 🧹 [chore] Remove outdated documentation download scripts

 - 🗑️ Deleted `download-validator-docs.mjs` script as it is no longer needed.
 - 🗑️ Deleted `download-zustand-docs.mjs` script to streamline the codebase.

🛠️ [fix] Improve type annotations in utility scripts

 - ✏️ Added JSDoc type annotation for `files` array in `find-shared-imports.js` to enhance type safety.
 - ✏️ Added JSDoc type annotations for parameters in `getArgValue` function in `fix-test-quotes.mjs` for better clarity and documentation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(58703e2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/58703e2a6614710f580350d809a5f6493b3bc058)



### 👷 CI/CD

- 👷 [ci] Normalize tsconfig $schema URLs to canonical schemastore.org

 - 👷 🔁 Replace non-canonical/short schemastore URLs with the canonical https://www.schemastore.org/tsconfig.json across repository configs
 - 👷 📂 Files updated: .storybook/tsconfig.json, storybook/tsconfig.json, storybook/tsconfig.eslint.json, docs/docusaurus/tsconfig.json, docs/docusaurus/tsconfig.eslint.json, docs/docusaurus/tsconfig.typedoc.json, src/test/tsconfig.json
 - 👷 🛠️ Normalize pre-commit jsonschema hook args in config/tools/.pre-commit-config.yaml to reference the canonical schemastore URL for consistent schema validation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d188f63)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d188f63d65b58c2fab7112ac4879c5d2fcecb730)



### 🔧 Build System

- 🔧 [build] Update Electron startup script for improved execution
 - Adjusted the execution command in `run-electron.sh` to ensure proper execution of the Electron binary.
 - Ensured that the script checks for the Electron binary in both the app directory and node_modules.

🛠️ [fix] Refactor site monitoring logic to enhance optimistic updates
 - Removed unnecessary `noop` function and introduced `trackStorePromise` to handle unhandled promise rejections gracefully.
 - Updated `createSiteMonitoringActions` to return a `whenReady` promise, allowing callers to await the completion of optimistic updates.
 - Enhanced error handling in monitoring operations to ensure proper rollback of optimistic states on failure.

🧪 [test] Add comprehensive tests for site monitoring edge cases
 - Implemented tests to verify optimistic monitoring updates for site-wide and individual monitor operations.
 - Added tests to ensure proper rollback of optimistic updates when service calls fail.
 - Included tests for monitoring lock registration and expiration cleanup.

🎨 [style] Improve code readability and organization
 - Reformatted code for better readability, including consistent indentation and spacing.
 - Added comments to clarify the purpose of complex logic and functions.

📝 [docs] Update documentation for monitoring functions
 - Enhanced inline documentation for `trackStorePromise` and other monitoring functions to clarify their purpose and usage.

⚡ [perf] Optimize storage type checks in nodeWebStorage shim
 - Refined the `isStorageLike` function to use `Reflect.get` for property access, improving performance and clarity.
 - Added type guards to ensure proper handling of potential storage candidates.

🧹 [chore] Update Vite configuration for better asset handling
 - Adjusted Vite configuration to exclude CSS and asset files from certain processing steps, improving build performance.
 - Ensured regex patterns are correctly defined for node protocol imports.

👷 [ci] Configure Vitest for Storybook environment
 - Set the environment to "browser" in the Vitest configuration for better compatibility with Storybook tests.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(96600ec)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/96600ec07f3feedc7b0d47110c65bc11645d05d8)


- 🔧 [build] Update dependencies in package.json
 - 🔄 [dependency] Update versions of Vitest packages to ^4.0.9 for improved functionality
 - 🔄 Update Electron version to 39.1 for better stability
 - 🔄 Upgrade eslint-plugin-import-zod to ^1.2.1 for enhanced linting
 - 🔄 Upgrade eslint-plugin-putout to ^28.1.0 for better code quality checks
 - 🔄 Update node-abi to ^4.24.0 for compatibility improvements
 - 🔄 Upgrade putout to ^40.14.0 for better performance
 - 🔄 Update vitest-environment-browser to npm:@vitest/browser@^4.0.9 for consistency

🎨 [style] Refactor CSS for Settings component
 - ✨ Combine styles for .settings-field__helper and .settings-alert-volume-control__note for cleaner code
 - 🔄 Remove redundant CSS rules for .settings-alert-volume-control__note

🚜 [refactor] Optimize forms.css for themed slider
 - 🔄 Refactor slider styles to use nested selectors for better readability
 - 🔄 Remove unnecessary comments and unused styles for cleaner code

🛠️ [fix] Improve error handling in nodeWebStorage
 - 🔄 Add functions to handle storage initialization errors and define properties more robustly
 - 🔄 Refactor storage installation logic for better clarity and error management

🔧 [build] Enhance Vite configuration for Electron
 - 🔄 Add rollupOptions to externalize dependencies in the main process for better performance
 - 🔄 Ensure compatibility with native modules and Electron internals

🧪 [test] Update Vitest configuration for Storybook
 - 🔄 Integrate Playwright as the provider for improved testing capabilities
 - 🔄 Remove deprecated environment setting for cleaner configuration

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(efcef35)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/efcef35ed994e403c6016706c16d45f41c2603df)


- 🔧 [build] Update dependencies in package.json
 - Updated Storybook addons to version 10.0.7 for improved functionality and bug fixes.
 - Updated ESLint plugin for Storybook to version 10.0.7 for better linting support.
 - Updated @types/react to version 19.2.3 for type definitions.
 - Updated storybook package to version 10.0.7 for consistency across packages.

🛠️ [fix] Refactor error message handling in useMonitorTypes hook
 - Changed error message assignment to use trimmed message for better clarity.
 - Ensured fallback message is used when no error message is available.

🧪 [test] Enhance comprehensive tests for App component
 - Reset default settings store state before each test to ensure clean state.

🧪 [test] Improve additional coverage tests for Submit component
 - Refactored validation mocks to use a consistent approach for better readability.
 - Created utility functions to apply validation results, reducing redundancy in tests.

🧪 [test] Add comprehensive tests for Submit component
 - Implemented validation result application to streamline test setup.
 - Ensured validation results are consistently applied across multiple test cases.

🧪 [test] Update StatusAlertToast and StatusAlertToaster tests
 - Added tests for rendering alerts from status updates when in-app alerts are enabled.
 - Verified that alerts are not enqueued when in-app alerts are disabled.

🧪 [test] Enhance alertCoordinator tests
 - Added test to ensure notification preferences are synchronized when toggles change.

🧪 [test] Refactor useMonitorTypes tests for clarity
 - Improved promise handling in tests to ensure proper async behavior.

📝 [docs] Update TSDoc configuration
 - Changed noStandardTags to true for stricter documentation rules.
 - Added custom tag definitions for better documentation support.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(15dd069)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/15dd0694e0503073320045b06221d03bbaec0f39)


- 🔧 [build] Update dependencies in package.json

 - 🔧 Update "validator" from "^13.15.20" to "^13.15.23" for improved validation features.
 - 🔧 Update "@biomejs/biome" from "^2.3.4" to "^2.3.5" for bug fixes and enhancements.
 - 🔧 Update "@eslint-react/eslint-plugin" from "^2.3.1" to "^2.3.4" for better linting support.
 - 🔧 Update "@microsoft/tsdoc-config" from "^0.17.1" to "^0.18.0" for updated TypeScript documentation support.
 - 🔧 Update "@storybook/addon-coverage" from "^2.0.0" to "^3.0.0" for new features and improvements.
 - 🔧 Update "@typescript-eslint/eslint-plugin" from "^8.46.3" to "^8.46.4" for TypeScript linting improvements.
 - 🔧 Update "autoprefixer" from "^10.4.21" to "^10.4.22" for better CSS compatibility.
 - 🔧 Update "electron" from "^39.1.1" to "^39.1.2" for security and performance improvements.
 - 🔧 Update "eslint-plugin-json-schema-validator" from "^5.4.1" to "^5.5.0" for enhanced JSON schema validation.
 - 🔧 Update "eslint-plugin-package-json" from "^0.65.0" to "^0.65.3" for improved package.json linting.
 - 🔧 Update "eslint-plugin-react-dom" from "^2.3.1" to "^2.3.4" for better React DOM linting support.
 - 🔧 Update "eslint-plugin-react-hooks-extra" from "^2.3.2-beta.1" to "^2.3.4" for additional hooks linting rules.
 - 🔧 Update "eslint-plugin-tsdoc" from "^0.4.0" to "^0.5.0" for improved TSDoc linting capabilities.
 - 🔧 Update "knip" from "^5.68.0" to "^5.69.0" for better code analysis.
 - 🔧 Update "msw" from "^2.12.0" to "^2.12.1" for bug fixes and enhancements.
 - 🔧 Update "putout" from "^40.12.0" to "^40.13.0" for improved code quality checks.
 - 🔧 Update "typedoc-plugin-dt-links" from "^2.0.27" to "^2.0.28" for better documentation generation.
 - 🔧 Update "typescript-eslint" from "^8.46.3" to "^8.46.4" for TypeScript linting improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(45ebc0d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45ebc0dee61497f2ea93c01ed31c640e09211fc7)


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


- 🔧 [build] Update dependencies in package.json
 - 🔄 Upgrade `@html-eslint/eslint-plugin` and `@html-eslint/parser` to version `0.48.0`
 - 🔄 Upgrade Storybook addons and core packages to version `10.0.6`
 - 🔄 Upgrade Vitest packages to version `4.0.8`
 - 🔄 Upgrade `eslint-plugin-storybook` to version `10.0.6`
 - 🔄 Upgrade `globals-vitest` to version `4.0.8`
 - 🔄 Upgrade `vite` to version `7.2.2`
 - 🔄 Upgrade `remark-lint` packages to latest versions
 - 🔄 Upgrade `storybook` to version `10.0.6`
 - 🔄 Upgrade TypeScript related packages to latest versions

🛠️ [fix] Refactor App component logging
 - 🔄 Change logging statement to use `update.site.identifier` directly instead of fallback

🚜 [refactor] Enhance site monitoring type definitions
 - 🔄 Introduce `StatusUpdateSnapshotPayload` type for better clarity in `useSiteMonitoring.ts`
 - 🔄 Update `applyStatusUpdate` method signature to use the new type

🛠️ [fix] Improve status update handler
 - 🔄 Modify `applyStatusUpdateSnapshot` to accept `StatusUpdateSnapshotPayload` instead of `StatusUpdate`
 - 🔄 Destructure `monitor` and `site` from `statusUpdate` for cleaner code

🧹 [chore] Update ESLint and Stylelint configurations
 - 🔄 Add ESLint disable comments for better clarity in config files

📝 [docs] Update TypeScript configuration
 - 🔄 Add various TypeScript compiler options for improved project management

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(34ffd89)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/34ffd89d2eb6cd9f529280316e56422f24cf6284)


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






## [18.0.0] - 2025-11-04


[[1985086](https://github.com/Nick2bad4u/Uptime-Watcher/commit/19850867b5a8f8396b7508aa8b03564361a3e227)...
[292b064](https://github.com/Nick2bad4u/Uptime-Watcher/commit/292b0646abe164bd68c56d4e555948f8e19cbda4)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/19850867b5a8f8396b7508aa8b03564361a3e227...292b0646abe164bd68c56d4e555948f8e19cbda4))


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



### 🧹 Chores

- 🧹 [chore] Add schema metadata & normalize lint/editor configs

🧹 [chore] .vscode: add VS Code JSON schemas for editor autocompletion & validation
 - Add "$schema": "vscode://schemas/extensions" to .vscode/extensions.json ✅
 - Add "$schema": "vscode://schemas/settings/workspace" to .vscode/settings.json ✅

🧹 [chore] config/linting: ensure schemas and locale for linters
 - Add "$schema": "https://raw.githubusercontent.com/anchore/grype/refs/heads/main/schema/grype/db/blob/json/schema-latest.json" to config/linting/.grype.yaml 🔍
 - Add locale: en_US.UTF-8 to config/linting/.yamllint for consistent parsing 🌐

🧹 [chore] config/linting/.taplo.toml: formatting & schema normalization
 - Insert/normalize [schema] block (enabled + url), tighten eslint-disable to only toml/key-spacing, and normalize include array spacing 🧾

📝 [docs] docs/docusaurus/stylelint.config.mjs: add JSDoc typedefs
 - Add typedef JSDoc comments for stylelint types to improve IDE typing and documentation 📚

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1b3756c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1b3756cfb32482f0f99dd33fcae17ccd57cedb6e)


- 🧹 [chore] Update deps & lockfiles, adjust bundling/lint rules, add schema, clarify Continue prompt

🔧 [build] [dependency] Update key devDependencies & tooling 🛠️
 - eslint: ^9.38.0 → ^9.39.0 🔼
 - @eslint-react/eslint-plugin: ^2.2.4 → ^2.3.1 🔼
 - @eslint/js: ^9.38.0 → ^9.39.0 🔼
 - @fast-check/vitest: ^0.2.2 → ^0.2.3 🔼
 - @types/node: ^24.9.2 → ^24.10.0 🔼
 - eslint-plugin-playwright: ^2.2.2 → ^2.3.0 🔼
 - eslint-plugin-react-dom: ^2.2.4 → ^2.3.1 🔼
 - eslint-plugin-react-hooks-extra: ^2.2.4 → ^2.3.2-beta.1 🔼
 - eslint-plugin-react-naming-convention: ^2.2.4 → ^2.3.1 🔼
 - eslint-plugin-react-web-api: ^2.2.4 → ^2.3.1 🔼
 - globals: ^16.4.0 → ^16.5.0, globals-vitest: ^3.2.4 → ^4.0.6 🔼
 - knip: ^5.66.4 → ^5.67.0, typedoc-plugin-dt-links: ^2.0.26 → ^2.0.27 🔼

🧹 [chore] Refresh & align package-lock.json + package metadata 🔁
 - regenerate lockfile entries to match bumped deps and nested package upgrades 🔄
 - mark node-sqlite3-wasm as bundled/included in lockfile (bundleDependencies / inBundle: true) 📦
 - remove stray empty "bundleDependencies": [] from package.json (cleanup) 🧹

🛠️ [fix] Relax package-json linting for bundled deps ⚙️
 - set require-bundledDependencies → "off" in .npmpackagejsonlintrc.json to avoid enforcing bundling as an error ✅

📝 [docs] Add schema & normalize docs package metadata 🗂️
 - add "$schema": "https://www.schemastore.org/package.json" to docs/docusaurus/package.json for editor/validation 🌐
 - update docs/docusaurus/package-lock.json: version → 1.0.0 and normalize Docusaurus deps to caret ranges (^3.9.2) for consistency 📚

📝 [docs] Clarify continuation prompt location ✍️
 - update .github/prompts/Continue.prompt.md to explicitly state that TODO.md lives at the repository root 🗒️

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7eff54b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7eff54b098b2aa93ce5d1980e320dab1596c0dbe)



### 🔧 Build System

- 🔧 [build] Sync lockfile and bump dev/test dependencies
 - Update docs/docusaurus/package-lock.json and root package-lock.json to align with current package.json (version -> 17.9.0)
 - Upgrade test tooling and dev deps: Vitest and related @vitest/* packages 4.0.5 -> 4.0.6
 - [dependency] Update jsdom 27.1.0, cssstyle to 5.3.2, @electron/notarize to 3.1.1 and refresh resolved/integrity entries
 - Add @acemir/cssom and remove rrweb-cssom where applicable; refresh lockfile metadata and engine constraints

🛠️ [fix] Update WASM artifact reference
 - assets/.wasm-version updated from b2b295ae -> 53123fb8 to match new build artifact

🧹 [chore] Add license metadata to docs lockfile
 - Insert "license": "UnLicense" into docs/docusaurus/package-lock.json

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8db9a50)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8db9a502bfdf56ea9d2763eee7be3f5f71c10cf2)


- 🔧 [build] [dependency] Update Storybook 10.0.2 and update Storybook-related packages
 - Upgrade @storybook packages and shims to 10.0.2 and update package-lock entries / integrity hashes
 - Affects: @storybook/addon-a11y, @storybook/addon-docs, @storybook/addon-links, @storybook/addon-themes, @storybook/addon-vitest, @storybook/builder-vite, @storybook/react, @storybook/react-vite, csf-plugin, react-dom-shim, etc.

🧹 [chore] Upgrade testing/linting/tooling deps
 - @vitest/eslint-plugin -> 1.4.0
 - eslint-plugin-package-json -> 0.59.1 (and validate-npm-package-name -> 7.0.0 with updated node engine range)
 - node-abi -> 4.17.0
 - typedoc-plugin-external-package-links -> 0.2.0

🧹 [chore] Sync lockfiles and mark docs peers
 - Apply package-lock.json updates across repo to reflect bumped devDependencies
 - Add "peer": true flags across docs/docusaurus/package-lock.json for multiple Docusaurus plugins/themes to reflect peerDependencies and keep lockfile consistent

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1985086)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/19850867b5a8f8396b7508aa8b03564361a3e227)






## [17.9.0] - 2025-10-31


[[c089f6b](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c089f6b1e7ea3fed6477a534d6dda6facfaebd7d)...
[b0be106](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b0be106dc82d83ee637967ca301f4eaa24afbe13)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/c089f6b1e7ea3fed6477a534d6dda6facfaebd7d...b0be106dc82d83ee637967ca301f4eaa24afbe13))


### 📦 Dependencies

- *(deps)* [dependency] Update the npm-all group (#95) [`(b511158)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b5111581bc271f4bcb7ef079315159e1ae1cb90d)


- *(deps)* [dependency] Update the npm-all group across 1 directory with 62 updates (#91) [`(c089f6b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c089f6b1e7ea3fed6477a534d6dda6facfaebd7d)



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


- 🚜 [refactor] Introduce renderer services to abstract IPC calls

This commit introduces a significant architectural refactor by creating a renderer-side service layer to abstract all Inter-Process Communication (IPC). Previously, UI components and Zustand stores directly accessed `window.electronAPI`, coupling them to the raw context bridge.

✨ **[feat] New Renderer Service Layer (`src/services/*`)**
- A new facade layer of domain-specific services (e.g., `SiteService`, `EventsService`, `SettingsService`) is introduced in the renderer process.
- These services now encapsulate all interactions with the `window.electronAPI` context bridge.
- This abstraction decouples UI and state management logic from the underlying IPC implementation, improving modularity and testability.
- Bridge readiness logic, previously handled by a global `waitForElectronAPI` helper, is now managed within each service's initialization, simplifying consumer code.

🚜 **[refactor] Update Application-Wide IPC Usage**
- All direct calls to `window.electronAPI` throughout the codebase (in stores, components, and utilities) are replaced with calls to the new renderer services.
- Event listener registration is now consistently asynchronous, as methods like `EventsService.onSiteAdded()` return a `Promise` that resolves to the cleanup function.

📝 **[docs] Update All Architectural and Developer Documentation**
- All documentation, including ADRs, developer guides, and templates, has been updated to reflect the new service-based IPC pattern.
- Code examples and architectural diagrams are modified to show `SiteService`, `EventsService`, etc., as the primary method for frontend-to-backend communication.
- The `ZUSTAND_STORE_TEMPLATE.md` is overhauled to use the new pattern, providing a clear blueprint for future development.

🧪 **[test] Adapt Tests to Service-Based Mocking**
- Unit and component tests are updated to mock the new service layer using `vi.spyOn` instead of mocking the global `window.electronAPI` object.
- The `waitForElectronAPI` utility function has been removed, and its corresponding mocks are deleted from all test files.

🧹 **[chore] Remove Deprecated `waitForElectronAPI` Utility**
- The `waitForElectronAPI` function in `src/stores/utils.ts` is removed as its responsibility is now delegated to the individual service initializers.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4cc300d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4cc300d4f14f7bcd4d636c485b612cfc7de584ea)


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



### 🔧 Build System

- 🔧 [build] [dependency] Update Storybook 10.0.2 and update Storybook-related packages
 - Upgrade @storybook packages and shims to 10.0.2 and update package-lock entries / integrity hashes
 - Affects: @storybook/addon-a11y, @storybook/addon-docs, @storybook/addon-links, @storybook/addon-themes, @storybook/addon-vitest, @storybook/builder-vite, @storybook/react, @storybook/react-vite, csf-plugin, react-dom-shim, etc.

🧹 [chore] Upgrade testing/linting/tooling deps
 - @vitest/eslint-plugin -> 1.4.0
 - eslint-plugin-package-json -> 0.59.1 (and validate-npm-package-name -> 7.0.0 with updated node engine range)
 - node-abi -> 4.17.0
 - typedoc-plugin-external-package-links -> 0.2.0

🧹 [chore] Sync lockfiles and mark docs peers
 - Apply package-lock.json updates across repo to reflect bumped devDependencies
 - Add "peer": true flags across docs/docusaurus/package-lock.json for multiple Docusaurus plugins/themes to reflect peerDependencies and keep lockfile consistent

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b0be106)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b0be106dc82d83ee637967ca301f4eaa24afbe13)






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


- ✨ [feat] Introduce IPC automation and optimistic updates

This commit introduces a generation-first workflow for Electron IPC contracts and implements optimistic UI updates for manual monitor checks. It also refactors and clarifies development scripts for consistency.

✨ [feat] Adds optimistic updates for manual monitor checks.
-   When a user triggers a manual check, the UI now updates immediately with an optimistic status.
-   This avoids waiting for the full `monitor:check-completed` event, improving perceived performance.
-   The new `check-site-now` IPC channel returns an enriched payload that the renderer uses for the instant update.

👷 [ci] Implements an IPC automation workflow.
-   Adds a new script `npm run generate:ipc` to auto-generate IPC bridge typings and Markdown documentation from shared TypeScript schemas. This ensures contracts between main, renderer, and preload are always synchronized.
-   Introduces `npm run check:ipc` to verify that generated artifacts are up-to-date, which is now enforced in the CI pipeline.

📝 [docs] Creates a new `IPC_AUTOMATION_WORKFLOW.md` guide.
-   Documents the new generation-first process for developers, explaining how to modify IPC channels and regenerate the necessary files.
-   Updates all related development guides (`DEVELOPER_QUICK_START`, `README`, etc.) to reference the new scripts and workflow.

🔧 [build] Standardizes development NPM scripts.
-   Renames `npm run start` to `npm run electron-dev` to better reflect its function of running Vite and Electron concurrently.
-   Updates `package.json` to allow forwarding command-line arguments to the Electron process (e.g., `npm run electron-dev -- --log-debug`).
-   Cleans up old script aliases and updates documentation to reflect the new canonical commands.

🚜 [refactor] Adds TSDoc comments to the IPC generator script.
-   Improves maintainability by documenting functions and interfaces within `scripts/generate-ipc-artifacts.mts`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(603a0a4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/603a0a49abb20694a3a2b93cebacdc18ef731020)


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


[[2ac871b](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2ac871b71e549d1e939b3bdb07acf3d74faed345)...
[a15b7a5](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a15b7a59b17721cda8678dfbd38f88eb954a11e3)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/2ac871b71e549d1e939b3bdb07acf3d74faed345...a15b7a59b17721cda8678dfbd38f88eb954a11e3))


### ✨ Features

- ✨ [feat] Introduce Beast Mode agent configuration

 - Adds a new agent configuration file for "Beast Mode 3.1 [Custom]".
 - Defines tools, rules, planning, code edit guidelines, tool use instructions, command output handling, debugging strategies, and override constraints for the agent.
 - This new agent is designed to iterate and refine solutions until tasks are perfectly completed, with a strong emphasis on planning, thoroughness, and leveraging available tools effectively.
 - The agent is configured with access to a wide array of tools, including file and text search, code editing, terminal commands, task execution, web search, and more.
 - It also includes specific instructions for handling command output, debugging, and overriding constraints for unlimited time and resources.

🧹 [chore] Remove deprecated chat mode configurations

 - Removes several deprecated chat mode configuration files (Debugging, Docs, Explore, Migration, Performance, Questions, Refactor, Review, Security, Tests).
 - These files are no longer in use and their removal cleans up the repository.

🚜 [refactor] Update CONTRIBUTING.md to reflect current validation strategy

 - Updates the link to the Validation Strategy guide in `CONTRIBUTING.md`.
 - This ensures that contributors are directed to the correct documentation when introducing new input flows or modifying existing schemas.

🛠️ [fix] Add missing dependency to knip config

 - Adds "winget" and "utf-8-validate" to the list of allowed dependencies in the `knip` configuration.
 - This prevents `knip` from incorrectly reporting these dependencies as unused.

🧹 [chore] Remove unused file from .gitignore

 - Removes `.github/chatmodes/BeastMode.chatmode.md` from `.gitignore` as it is no longer needed.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2ac871b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2ac871b71e549d1e939b3bdb07acf3d74faed345)



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






## [17.1.0] - 2025-10-21


[[6de39e8](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6de39e86c86fb54e87df6a366275912f1c9d7ad8)...
[10d3f4e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/10d3f4e69cf53d0bf04537ce88d357c64713fa29)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/6de39e86c86fb54e87df6a366275912f1c9d7ad8...10d3f4e69cf53d0bf04537ce88d357c64713fa29))


### ✨ Features

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


- ✨ [feat] Add zero-coverage audit tooling (Vitest config, detector script, docs)

🧪 [test] Add config/testing/vitest.zero-coverage.config.ts
 - Provides an isolated Vitest config for zero-coverage probes (separate cacheDir)
 - Limits coverage collection to touched files, emits JSON reports, uses v8 provider
 - Disables global coverage thresholds and writes reports to ./coverage/zero-coverage

✨ [feat] Add scripts/detect-zero-coverage-tests.ts
 - Implements a serial detector that enumerates tests (vitest list) and runs each file with --coverage --reporter=json
 - Parses coverageMap via istanbul-lib-coverage to detect files with zero executable coverage
 - Retries Vitest invocations on transient Windows filesystem errors, with exponential backoff and cleanup attempts
 - Supports CLI flags: --config, --pattern, --max-files, --dry-run, --keep-reports and persistent/transient report directories
 - Produces human-readable summary and a ranked list of top coverage-producing specs

📝 [docs] Add docs/Testing/ZERO_COVERAGE_AUDIT.md
 - Documents workflow, usage examples, output format, triage guidance, and when to rerun the audit
 - Notes cache isolation and options for persisting JSON reports for inspection

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8279526)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8279526b7dcc6827fd80639293004a4ade2e3700)


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



### 🎨 Styling

- 🎨 [style] Refactor CSS structure and update docs

Updates CSS architecture for improved modularity and maintainability.

- 🧱 [structure]: Moves SiteDetails CSS into focused partials within `src/components/SiteDetails/styles/` to promote better organization and easier maintenance.
- 🧩 [structure]: Updates `src/index.css` to import these partials, centralizing load order and improving global stylesheet management.
- ✅ [structure]: Removes now-redundant `SiteDetails.css` import from eslint config.
- 📝 [docs]: Updates `StyleLayoutGuide.md` to reference the new theme component utilities import path and to document the modular stylesheet structure, improving developer understanding and consistency.
- 🚀 [enhancement]: Adds `@media (prefers-reduced-motion: reduce)` blocks to reduce motion, improving accessibility.
- 🐛 [fix]: Corrects minor CSS styling issues and enhances visual consistency of several components.
- ⬆️ [deps]: Updates `@eslint/markdown` and typescript-related dependencies in `package-lock.json` and `package.json` to their latest versions.
- ⚙️ [config]: Adds powershell script to package.json to update node using winget.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(10d3f4e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/10d3f4e69cf53d0bf04537ce88d357c64713fa29)


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



### 🧹 Chores

- 🧹 [chore] Upgrade project dependencies and devDependencies
 - [dependency] Update multiple devDependencies to pick up minor/patch fixes (eslint, @eslint/js, @vitest/eslint-plugin, @playwright/test, playwright, putout, storybook and related addons/plugins, prettier-plugin-tailwindcss, rollup-plugin-visualizer, knip, @stylistic/eslint-plugin, @types/node, etc.)
 - Update various lint/test/tooling packages (eslint-plugin-package-json, eslint-plugin-storybook, eslint-plugin-css, @docusaurus/eslint-plugin, @vitest/eslint-plugin) to compatible newer versions
 - Misc maintenance bumps to reduce transitive vulnerabilities and align peer dep ranges

🔧 [build] Replace npm-run-all with npm-run-all2 and adjust workspace/shared deps
 - Add npm-run-all2 ^8.0.4 to dependencies and replace prior npm-run-all usage in package metadata
 - Reorder/move @shared/ipc entry in package.json to ensure correct bundling / workspace resolution

🧹 [chore] Refresh lockfiles & docs docusaurus version bumps
 - [dependency] Update Docusaurus packages in docs to 3.9.2 (package.json + package-lock.json) and regenerate lockfile entries
 - Update many lockfile-resolved packages (notable: @ai-sdk/gateway -> 2.0.0, ai -> 5.0.76, @ai-sdk/react -> 2.0.76; Algolia client packages -> 5.40.1; @vercel/oidc -> 3.0.3; @swc/core and platform binaries -> 1.13.5; std-env, tslib, and other transitive packages)
 - Add/adjust peer flags and internal lockfile tweaks (new cacheable/keyv-related nodes, qified/hookified updates, file-entry-cache/flat-cache upgrades) as generated by npm install / lockfile regeneration
 - Result: lockfiles reflect the above dependency upgrades and package replacements to keep installs reproducible

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6ad8914)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6ad8914709b6f95c3b67a71f3ba840a6fb355241)






## [16.9.0] - 2025-10-17


[[97c6545](https://github.com/Nick2bad4u/Uptime-Watcher/commit/97c6545cd08b3c376c28bb790d0cba7f75e67a12)...
[465af28](https://github.com/Nick2bad4u/Uptime-Watcher/commit/465af28833f78940bdf648c100236dc13c1aa41a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/97c6545cd08b3c376c28bb790d0cba7f75e67a12...465af28833f78940bdf648c100236dc13c1aa41a))


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


- ✨ [feat] Expose realtime status subscription health

This commit introduces a new UI component and associated logic to display the health of the realtime status subscription.

- Adds a `StatusSubscriptionIndicator` component to the header, providing a summary of the subscription's health and retry controls.
 - The component visualizes the status using icons and text, and provides a tooltip with detailed diagnostics.
 - Exposes a button to retry the subscription if it's degraded or failed.
 - Styles the indicator to reflect different health states (healthy, degraded, failed, unknown) using color-coding and icons.
- Creates a `useStatusSubscriptionHealth` hook to derive a normalized health representation from the latest subscription summary.
 - Aggregates `StatusUpdateSubscriptionSummary` data into a format suitable for UI rendering.
 - Defines discrete health states (degraded, failed, healthy, unknown).
- Modifies the sites store to persist subscription diagnostics.
 - Adds `setStatusSubscriptionSummary` action to store the latest `StatusUpdateSubscriptionSummary`.
 - Updates `subscribeToStatusUpdates` and `retryStatusSubscription` actions to persist subscription diagnostics and handle cases where no callback is registered.
 - Updates `unsubscribeFromStatusUpdates` to clear the persisted subscription diagnostics.
- Updates site operations to handle backend-sourced snapshots, and ensure that the Zustand store always holds the enriched `Site`, including backend-side defaults.
 - Updates site operations to only call `applySavedSiteToStore` as the only supported post-mutation path.
- Adds logging to site monitoring actions for pending, success, and failure states.
- Adds dedicated tests for the new component and hook:
 - `StatusSubscriptionIndicator.test.tsx` tests the rendering and functionality of the `StatusSubscriptionIndicator` component.
 - `deriveStatusSubscriptionHealth.test.ts` tests the logic of the `deriveStatusSubscriptionHealth` hook.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ca83cbd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ca83cbddce24b39d00af1e488eebbfe48d833468)


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



### 📦 Dependencies

- *(deps)* [dependency] Update katex (#86) [`(b22ca5c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b22ca5caa5fb986e9e827e01ebf50420a20c7373)


- *(deps)* [dependency] Update the npm-all group (#85) [`(d38a27e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d38a27ebd8ebd90e7abc73b9104bef0c045d2373)



### 🛠️ Other Changes

- Update tsconfig.typedoc.json [`(55a9f74)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/55a9f74dab20d0e73eaab32fb7b37e5f0f483836)



### 🚜 Refactor

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



### 🔧 Build System

- 🔧 [build] Update greetings workflow to use correct parameter names for first interaction action
 - Changed `repo-token` to `repo_token`
 - Changed `issue-message` to `issue_message`
 - Changed `pr-message` to `pr_message`
📝 [docs] Modify TypeScript configuration to include baseUrl and additional path mappings
 - Added `baseUrl` option
 - Introduced path mapping for `@assets/*`
 - Included `vite/client` in types array

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(97c6545)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/97c6545cd08b3c376c28bb790d0cba7f75e67a12)






## [16.7.0] - 2025-10-11


[[f06123f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f06123f0e356b1190e49284f7b1ae0072a8a7132)...
[d9c62fd](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9c62fd22d7af27284eeeff8fa788ad5896aba80)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/f06123f0e356b1190e49284f7b1ae0072a8a7132...d9c62fd22d7af27284eeeff8fa788ad5896aba80))


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


[[f1fdd24](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f1fdd245fdabc2e1a4e2e0591e400de78ee432e3)...
[29d1c8d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/29d1c8df649442215788b160a10c224540ebf16d)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/f1fdd245fdabc2e1a4e2e0591e400de78ee432e3...29d1c8df649442215788b160a10c224540ebf16d))


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


- ✨ [feat] Enhance Docusaurus configuration and add glossary pipeline

This commit introduces significant improvements to the Docusaurus documentation site, focusing on configuration flexibility, build performance, and content structure.

✨ **Features & Enhancements**
*   **Dynamic Configuration**: The `docusaurus.config.ts` now uses environment variables for `baseUrl` and `siteUrl`, allowing for more flexible deployments across different environments.
*   **Experimental Build Flag**: Adds a `build:fast` npm script using `cross-env` to enable experimental Docusaurus performance features like the Rspack bundler via a `DOCUSAURUS_ENABLE_EXPERIMENTAL` flag.
*   **SEO & Social Sharing**: Enriches pages with Open Graph (og:) meta tags for improved social media card previews.
*   **Glossary Pipeline**:
    *   Introduces a placeholder `glossary.md` page.
    *   Adds a `docs/terms/` directory for defining terminology.
    *   The `@grnet/docusaurus-terminology` plugin, which is incompatible with Docusaurus v3, has been disabled. A new build process will handle glossary generation.

🔧 **Build & Tooling**
*   **Cleanup Script**: Adds a new Node.js script `scripts/clean-generated-docs.mjs` to programmatically remove generated documentation artifacts (TypeDoc output, Docusaurus build cache) and recreate placeholder files. This simplifies the pre-build cleanup process.
*   **Dependency**: Adds `cross-env` to enable setting environment variables in npm scripts for cross-platform compatibility.

🎨 **Style & Refactoring**
*   **Plugin Configuration**:
    *   Moves theme-related plugins (`@docusaurus/theme-live-codeblock`, `@docusaurus/theme-mermaid`, `@easyops-cn/docusaurus-search-local`) to the correct `themes` array in the configuration.
    *   Activates and refines the styling for `docusaurus-plugin-copy-page-button` using CSS variables for better theme integration and a modern look.
*   **Code Cleanup**: Removes redundant ESLint comments from various MDX documentation pages.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5ff9a16)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5ff9a165b12d21514ccd2d77e6fd192bd020eb04)


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



### 🔧 Build System

- 🔧 [build] Update dependencies and fix documentation

This commit updates various development dependencies and resolves issues within the documentation files.

*   📝 [docs] Fixes invalid comment syntax in multiple MDX files by converting JavaScript-style block comments to JSX-style comments (`{/* ... */}`). This ensures correct parsing and rendering of the documentation pages.
*   📝 [docs] Removes the obsolete `docsearch-verify.md` file, as it is no longer required for Algolia site verification.
*   🔧 [build] [dependency] Updates several development dependencies to their latest versions, including:
    *   `@html-eslint/eslint-plugin` and `@html-eslint/parser`
    *   `@types/react`
    *   `electron`
    *   `typedoc-plugin-dt-links`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f1fdd24)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f1fdd245fdabc2e1a4e2e0591e400de78ee432e3)






## [16.0.0] - 2025-09-28


[[2150780](https://github.com/Nick2bad4u/Uptime-Watcher/commit/215078099a30a8c0cb30b2c0aefa34d224527df2)...
[6173ed2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6173ed2fc3369b6522bb338ac84f42715b11e684)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/215078099a30a8c0cb30b2c0aefa34d224527df2...6173ed2fc3369b6522bb338ac84f42715b11e684))


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


- ✨ [feat] Integrate MSW and SonarQube reporting into Storybook

This commit enhances the Storybook component testing workflow by integrating Mock Service Worker (MSW) for network request mocking and adding comprehensive test and coverage reporting for SonarQube.

✨ **Features**
*   **Unified Network Mocking**: Adds `msw` and `msw-storybook-addon` to provide a consistent way to mock API requests across both the interactive Storybook environment and Vitest component tests.
    *   The MSW service worker is now included in the `public` directory.
    *   Stories can define request handlers via `parameters.msw.handlers`, which are automatically applied in Storybook and tests.
    *   Unhandled requests are configured to bypass the mock server, preventing test failures from legitimate network calls.
*   **Integrated Coverage Reporting**: Adds `@storybook/addon-coverage` to generate code coverage reports from component interactions.
    *   Coverage instrumentation is gated behind the `VITE_COVERAGE=true` environment variable to keep development builds fast.
    *   The include/exclude patterns for coverage are now centralized and shared between Storybook and Vitest.
*   **CI-Friendly Test Reports**: Adds `vitest-sonar-reporter` to generate SonarQube-compatible XML test reports (`sonar-report.xml`) for each Storybook test run.

📝 **Documentation**
*   Updates the Storybook component testing guide with detailed sections on:
    *   Configuring and using MSW for network mocking.
    *   Generating and exploring coverage reports.
    *   The new CI reporting artifacts (`sonar-report.xml`, `test-results.json`, `lcov.info`).

🔧 **Build & CI**
*   Updates the `test:storybook:coverage` script to correctly set the `VITE_COVERAGE` environment variable.
*   Configures `sonar-project.properties` to automatically discover and process the new test execution and coverage reports from the `coverage/storybook/` directory.
*   Adds new dependencies (`msw-storybook-addon`, `@storybook/addon-coverage`, `vitest-sonar-reporter`) to `package.json`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(79a79ac)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/79a79ac07e99a5ca1af15b7dc4f3ebdef7d9065b)


- ✨ [feat] Integrate Storybook with Vitest for component testing

This commit introduces a comprehensive integration of Storybook with Vitest, enabling browser-driven component testing directly against stories. This allows for reusing Storybook's decorators, parameters, and mocked environments within the test suite, ensuring consistency between development and testing.

### Key Changes:

*   ✨ **Storybook & Vitest Integration:**
    *   Adds new configuration files (`.storybook/main.ts`, `.storybook/preview.ts`, `.storybook/vitest.setup.ts`) to bridge Storybook and Vitest.
    *   The setup ensures that Storybook's preview annotations, including decorators and globals, are applied to tests running in a browser environment via Playwright.
*   📝 **Documentation:**
    *   Adds a new guide (`STORYBOOK_VITEST_COMPONENT_TESTING.md`) detailing the configuration, rationale, and usage patterns for the new component testing suite.
*   🧹 **ESLint Configuration:**
    *   Enables `eslint-plugin-storybook` and applies frontend linting rules to Storybook-related files to maintain code quality and consistency.
*   🎨 **Code Styling:**
    *   Applies consistent formatting to the `.gitleaks.toml` file for improved readability.
*   🔧 **Agent Prompting:**
    *   Refines the `BeastMode` chatmode prompt with updated instructions and adds the `openSimpleBrowser` tool.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c899a7a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c899a7a5ab58e57ac632eb180c5f7fb7adfbd544)



### 🛠️ Bug Fixes

- Import Layout in Docusaurus custom pages (#77) [`(4e433f6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e433f69bd16929edca5f0323b50edda20b303d8)



### 🚜 Refactor

- 🚜 [refactor] Consolidate build output directories into `dist/`

This refactoring streamlines the project's build process by consolidating all build artifacts into a single `dist/` directory. It removes the previously separate `dist-electron/`, `dist-shared/`, and other temporary build directories.

This change simplifies configuration across the entire repository, improving consistency and maintainability for various tools.

*   🚜 [refactor] Updates TypeScript configurations (`tsconfig.*.json` files) to redirect their output directories (`outDir`) into subfolders within a unified `.cache/builds/dist/` structure (e.g., `dist/test/electron`). This centralizes all compiled test and application code.
*   🔧 [build] Modifies `package.json` scripts (`clean`, `lint:circular:*`, `madge:*`, `sqlite:clean-wasm`) to remove references to the old `dist-electron` and `dist-shared` directories. The `files` array for packaging is also updated to reflect the new structure.
*   🧹 [chore] Removes `dist-electron`, `dist-shared`, and their variants from numerous configuration and ignore files across the project, including:
    -   `.gitignore` to stop tracking the old directories.
    -   `.vscode/settings.json` to clean up the editor's file tree and search.
    -   Linter configs (`.prettierignore`, `.stylelintignore`, `eslint.config.mjs`, etc.) to ensure build artifacts are consistently ignored.
    -   CI/CD and analysis tool configs (`.codecov.yml`, `sonar-project.properties`, `.gitleaks.toml`, etc.) to exclude the consolidated build output from scans.
*   🎨 [style] Reformats the `.gitleaks.toml` configuration file by sorting keywords and paths alphabetically for improved readability and consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(da28cd1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/da28cd187de58f90a1b57e4f634a416f902bcbcd)


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


- 📝 [docs] Consolidate documentation and update file naming conventions

🧹 [chore] This commit streamlines the project's documentation and improves testing infrastructure.

📝 [docs] Removes the extensive `DOCUMENTATION_STYLE_GUIDE.md`.
 - This file is being deprecated in favor of a more simplified and centrally managed approach to documentation standards.

🎨 [style] Renames several documentation files from kebab-case to UPPERCASE_SNAKE_CASE to align with new project conventions.
 - `TSDoc-Standards.md` -> `TSDOC_STANDARDS.md`
 - `CODEGEN-BEST-PRACTICES.md` -> `CODEGEN_BEST_PRACTICES.md`
 - `FAST-CHECK-FUZZING-GUIDE.md` -> `FAST_CHECK_FUZZING_GUIDE.md`

🚜 [refactor] Updates the Playwright codegen template to discourage the use of brittle locators.
 - Removes transformations for `locator("body")` and `locator("html")`.
 - Adds detailed comments explaining why these broad selectors are problematic and guides developers toward more semantic and robust alternatives like `getByRole()` or `getByTestId()`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(81a247f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/81a247f1e7da3d711e761bae38fc0eba6e5025d4)


- 📝 [docs] Sync latest upstream documentation changes for packages and TSDoc

This commit updates the documentation for several packages and refines the TSDoc content.

✨ **New Features**
- Introduces the `IsUndefined` type guard to `TypeFest`.
- Exports `Options` types for several `TypeFest` utilities, enhancing configurability.

🚜 **Refactoring & Improvements**
- **TypeFest**:
  - Renames several internal helper types with a leading underscore (`_`) for clarity (e.g., `_Numeric`, `_LiteralStringUnion`).
  - Removes unused types and consolidates internal imports.
  - Improves the `IsEqual` type to handle `never` more robustly.
- **TSDoc**:
  - Standardizes code block formatting and cleans up whitespace for better readability.
  - Corrects tag names in titles (e.g., `@alpha` instead of `"@alpha"`) and improves comment formatting across multiple files.
  - Updates the `@override` example to use `@virtual` for the base method, reflecting more accurate usage.

🧹 **Chore**
- Updates `node-sqlite3-wasm` documentation to reflect the new SQLite version `3.50.4`.
- Syncs the latest documentation content and file hashes for `TypeFest` and `node-sqlite3-wasm`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2150780)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/215078099a30a8c0cb30b2c0aefa34d224527df2)



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

- 🧹 [chore] Update Knip config and reformat docs

This commit introduces several maintenance changes to improve dependency management and documentation clarity.

🧹 [chore] Updates the Knip configuration to manage dependency tracking more accurately.
- Removes `msw` and `react-icons` from the ignore list, as they are now correctly tracked or no longer dependencies.
- Adds several new Storybook, Babel, and Vitest-related packages to the ignore list to prevent them from being incorrectly flagged as unused dependencies.

📝 [docs] Refreshes the `NEW_MONITOR_TYPE_IMPLEMENTATION.md` guide.
- Improves readability by reformatting the `File Impact Matrix` and `Troubleshooting` tables using `<br>` tags for multi-line cells.
- Standardizes code block formatting for code snippets and fixes minor typographical issues throughout the document.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a47ddab)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a47ddab23ca7ab88e46dade8cfec4cfe8581dc90)


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



### 🔧 Build System

- 🔧 [build] Consolidate TypeScript build artifacts and configurations

This commit refactors the project's TypeScript build process for better organization and efficiency.

🔧 [build] Centralizes all build outputs into the `.cache/builds` directory, moving them out of the previous `dist` and `dist-*` folders.
 - This standardizes the output location across all parts of the application (main app, tests, scripts, docs).
 - Updates `outDir` in all `tsconfig.*.json` files to reflect this new structure.

🔧 [build] Separates TypeScript declaration files (`.d.ts`) from compiled JavaScript.
 - Enables the `declaration` option in all relevant `tsconfig.json` files.
 - Introduces `declarationDir` to place type definitions into a dedicated `types` subfolder within each build output directory.

🔧 [build] Consolidates `tsBuildInfoFile` for all TypeScript projects into the root `.cache` directory.
 - This simplifies build caching and makes it easier to clean build artifacts.

🧹 [chore] Adds the `npm-run-all` dependency to enable more complex build and check scripts.
 - Updates `package.json` with new and simplified `build:*` and `check:*` scripts that leverage the refactored configuration.
 - `noEmit` is set to `false` in several `tsconfig.json` files to ensure build artifacts are generated as intended.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(aa22260)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/aa22260cee02687e821222a14ea19f838b0f9095)






## [15.6.0] - 2025-09-22


[[653d053](https://github.com/Nick2bad4u/Uptime-Watcher/commit/653d053f6f324e303b1f9b4e7a99225985b7f88d)...
[4cb4094](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4cb409492576a9de14af1bf1aa631d2ec2d2bc71)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/653d053f6f324e303b1f9b4e7a99225985b7f88d...4cb409492576a9de14af1bf1aa631d2ec2d2bc71))


### ✨ Features

- ✨ [feat] Introduce shadow colors to theme and refine configurations

This update introduces several enhancements across the project, focusing on theming, dependency management, and documentation consistency.

✨ [feat] **Theme System Enhancement**
 - Adds a new `shadows` property to the theme object. This provides dedicated shadow colors for various component statuses (e.g., `success`, `error`, `warning`), allowing for more nuanced and consistent UI styling.

👷 [ci] **Dependabot Configuration**
 - Implements a 3-day cooldown for `github-actions` updates to reduce the frequency of pull requests.
 - Configures Dependabot to ignore local `file:` dependencies, preventing erroneous update attempts on internal packages.

📝 [docs] **Documentation Formatting**
 - Applies consistent formatting across all Markdown documentation files. This includes standardizing indentation, spacing, and quote usage within code blocks for improved readability.

🎨 [style] **Stylelint Configuration**
 - Refines and enhances the JSDoc comments within `stylelint.config.mjs` for better clarity and maintainability.

🧪 [test] **Test Updates**
 - Updates theme-related tests, including unit, branch coverage, and fuzzing tests, to incorporate the new `shadows` theme property.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4cb4094)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4cb409492576a9de14af1bf1aa631d2ec2d2bc71)



### 🚜 Refactor

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



### 📝 Documentation

- 📝 [docs] Enhance documentation and standardize project requirements

This commit introduces a comprehensive overhaul of the project's documentation, standardizes file naming conventions, and updates project-wide requirements.

### ✨ [feat] Major Documentation Enhancements:
- 📝 **API Documentation**: Rewrites and significantly expands the API & IPC documentation.
    - Introduces a domain-based API organization (`sites`, `data`, `events`, `monitoring`, etc.).
    - Details the `TypedEventBus` architecture, event listener registration, and real-time frontend integration patterns.
    - Adds advanced frontend patterns like optimistic updates, custom hooks for IPC operations, and modular store integration.
- 🚀 **Developer Quick Start Guide**: Overhauls the guide to reflect current architectural patterns.
    - Updates Node.js requirement to `24.8+`.
    - Adds a new "Data Flow Architecture" section to explain the modern data flow from React components to the SQLite database.
    - Updates code examples for the repository pattern, IPC validation, `TypedEventBus`, modular Zustand stores, and shared validation schemas.
- 🛠️ **New Guides**: Adds several new detailed guides to improve developer experience.
    - `ERROR_HANDLING_GUIDE.md`: A comprehensive guide on the application's multi-layered error handling strategy.
    - `EVENT_SYSTEM_GUIDE.md`: Documents the `TypedEventBus` architecture, middleware, and real-time communication patterns.
    - `TESTING_METHODOLOGY_REACT_COMPONENTS.md`: Outlines the current testing approach for React components using Vitest and React Testing Library.
    - `ZUSTAND_STORE_PATTERN_GUIDE.md`: Provides a decision guide for choosing between direct and modular Zustand store patterns.

### 🚜 [refactor] Documentation & Project Standardization:
- 🧹 **Node.js Version**: Standardizes the required Node.js version to `24.8.0` across `README.md`, `CONTRIBUTING.md`, `SUPPORT.md`, and issue templates.
- 📁 **File Naming**: Enforces consistent file naming conventions (UPPER_SNAKE_CASE or kebab-case) across the `docs` and `.github/prompts` directories.
- 🎨 **Stylelint Configuration**: Massively expands the `stylelint.config.mjs` to include comprehensive support for HTML, CSS-in-JS, SCSS, and CSS Modules, along with detailed comments and plugin configurations for better code quality enforcement.
- 🔄 **Documentation Updates**: Updates numerous guides (`TECHNOLOGY_EVOLUTION`, `TESTING`, `TROUBLESHOOTING`, `VITE_PERFORMANCE`, etc.) to reflect the latest project architecture, dependencies, and best practices.

### 🛠️ [fix] Minor Fixes & Cleanups:
- 🧹 Removes a duplicate `model` entry in the `BeastMode.prompt.md` prompt.
- 🏷️ Updates the project version badge in `README.md` to `15.5.0`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9bea8f4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9bea8f478a589804477554d8ffbb127b50ff2645)



### 🧹 Chores

- 🧹 [chore] Consolidate configs, optimize CI, and clean up docs

This commit introduces several improvements to the project's configuration, CI workflows, and documentation.

*   **🔧 [build] Consolidates Vitest configuration files**
    *   Moves `vitest.electron.config.ts` and `vitest.shared.config.ts` from the `config/testing/` directory to the project root for better organization and easier access.
    *   Updates all relevant configuration files (`.codecov.yml`, `knip.config.ts`, `tsconfig.json`, CI workflows) to reflect the new locations.

*   **👷 [ci] Optimizes CI workflows for stability and efficiency**
    *   Increases the memory allocation for the Stryker mutation testing job from 8GB to 12GB to prevent heap out-of-memory errors.
    *   Adds a 10-minute timeout per mutation and limits concurrent test runners to 1 during the Stryker run to improve stability.
    *   Enhances Stryker error handling in the workflow with a `try...catch` block for better failure diagnostics.
    *   Switches the test reporter in the Codecov workflow from `verbose` to `dot` to reduce log noise.
    *   Prevents the `summary.yml` workflow from running on Dependabot PRs to reduce unnecessary CI runs.
    *   Configures Dependabot to ignore local `@shared/*` packages, preventing erroneous update attempts.

*   **📝 [docs] Removes obsolete analysis and planning documents**
    *   Deletes outdated and irrelevant Markdown files related to codebase analysis, circuit breaker implementation plans, and CI optimizations, as they are no longer current.
    *   Removes the extensive `AI_CONTEXT.md` guide.

*   **🎨 [style] Updates Stylelint configuration**
    *   Adds `*.mdx` files to the `.stylelintignore` to prevent linting on documentation files.
    *   Removes unused custom scrollbar styling from the Docusaurus CSS.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bceb3b4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bceb3b45aa35d186ab5a6aec16e90782b252438e)






## [15.5.0] - 2025-09-22


[[1ec4440](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1ec44405b1a0506a66ef7489620422c555b863f1)...
[47bcf6d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/47bcf6d1a8c84fbaaa7ef6305ff9e6a32b35a041)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1ec44405b1a0506a66ef7489620422c555b863f1...47bcf6d1a8c84fbaaa7ef6305ff9e6a32b35a041))


### ✨ Features

- ✨ [feat] Add "degraded" monitor status and improve IPC usage

- Introduces a three-state monitor status model ("up", "degraded", "down") for enhanced server health classification, with logic to distinguish degraded 5xx responses.
- Refactors frontend IPC methods to directly unwrap responses via the preload bridge, removing manual extraction and simplifying error handling.
- Updates theme, tests, and related utilities to support the new "degraded" status color.
- Unifies monitor detail/title formatting under a single API namespace for consistency.
- Documents agent and prompt configurations with model metadata.

Relates to ongoing improvements in monitoring accuracy and frontend/backend API alignment.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(482e037)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/482e037f51543702c5ab625fb160387e21263dc8)


- ✨ [feat] Add comprehensive Mermaid config with dark mode

- Introduces detailed Mermaid configuration supporting dark mode, custom fonts, enhanced diagram styles, and strict security settings.
- Enables deterministic IDs, improved rendering for multiple diagram types, and tailored color themes for better visual consistency.
- Facilitates consistent diagram generation and project branding for Uptime-Watcher.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b565f61)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b565f619c1bb2e7ddb37f8d51373dfaf60a9d8fd)


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

- 🛠️ [fix] Round ping timeouts up to prevent premature expiration

- Ensures requested ping timeouts are never shortened by rounding up to the next whole second, preserving expected duration and cross-platform reliability.
- Adds targeted unit test to verify correct rounding behavior.
- Updates documentation code block formats for improved clarity and consistency.
- Adds linter ignores explaining centralized error handling in service and operations code.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a068cd8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a068cd809fe0b0f96b7e91bfe39dc4bd5e0fb1cf)


- 🛠️ [fix] Ensure IPC errors propagate in site flows

- Replaces fallback-based IPC response handling with strict error propagation for all site-related operations and backup downloads.
- Updates tests and mocks to verify that backend failures are surfaced to callers, preventing silent error swallowing.
- Adds regression tests to validate correct error propagation and minimal performance impact.
- Improves documentation with architecture diagrams for workflows and system overviews.
Fixes #ai-claims-validation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8ef824d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8ef824d2394e4a13e3d888592f34e3e632eca3fa)



### 🚜 Refactor

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



### 📝 Documentation

- 📝 [docs] Integrates remark linting and formatting for markdown/MDX

- Adds comprehensive remark linting and formatting support for markdown and MDX files, including new configuration, ignore patterns, and ESLint integration
- Updates formatting scripts to include remark lint/fix/check steps for improved documentation consistency and code quality
- Renames documentation files for naming standardization and updates style guide to clarify conventions
- Installs remark lint plugins and presets to enable advanced markdown quality checks and formatting automation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3a019d2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3a019d2c725e5fd2e48f0dd4256bec85f1a38390)


- 📝 [docs] Add interactive architecture diagrams and CI optimizations docs

- Documents Uptime Watcher’s system architecture, data models, monitoring workflows, deployment infrastructure, and performance metrics using interactive Mermaid diagrams for improved clarity and onboarding.
- Introduces a CI optimization guide detailing Stryker mutation testing improvements for better reliability, memory usage, and workflow flexibility.
- Enhances sidebar navigation with a new category for visual documentation.
- Refactors Mermaid plugin configuration for Docusaurus for better maintainability.
- Addresses CI resilience and reporting transparency, allowing mutation testing with failing tests when explicitly enabled.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4bd1407)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4bd140719f83467d6bda222fde4f31892c583294)


- 📝 [docs] Establish unified docs standards and correct links

- Introduces a comprehensive documentation style guide to enforce consistent Markdown formatting, naming conventions, and best practices across the project.
- Renames multiple documentation files for uniform kebab-case naming, aligning with the new style guide.
- Updates internal references and links in docs and guides to match revised filenames and structure.
- Adds support and agent operation guides to clarify workflow expectations.
- Performs extensive package upgrades and engine requirement bump to ensure compatibility and improved tooling.
- Corrects references and improves clarity in architecture and testing docs.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2271fe6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2271fe64b31fb63d32546e7d983c9699febe9fd6)


- 📝 [docs] Update and reorganize documentation structure

- Removes emoji styling from section headers for consistency and clarity.
- Standardizes capitalization and formatting across main and guide documentation files.
- Adds comprehensive README files for Guides, TSDoc, and Testing directories, improving discoverability and onboarding.
- Documents directory structures, content purpose, and navigation links to enhance contributor workflow.
- Emphasizes best practices, usage guidelines, and contribution steps for development, testing, and documentation.
- Improves documentation organization to support easier maintenance and future expansion.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(188ef64)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/188ef647f965a9a0c9291cbb74bfe2308bd67db0)


- 📝 [docs] Update docs, templates, and version for project maturity

- Modernizes and expands documentation, contributing guidelines, and templates to reflect improved architecture, code quality, and testing maturity
- Introduces detailed documentation style guide and codebase analysis correction, clarifying previous recommendations and highlighting actual strengths
- Refines issue, feature, and PR templates with clear sections, improved prompts, and emoji formatting for consistency
- Updates project version to 15.0.0, refreshes dependency requirements, and reworks README for clarity, feature highlights, and future-oriented content
- Improves quick start and internal links for developer onboarding and navigation
- Emphasizes high testing standards, advanced contribution focus, and robust development workflows

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2e6d566)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2e6d566e59e2ac9e12c350084702839f098c052c)


- 📝 [docs] Clarifies Zustand store patterns and updates guides

- Improves documentation to distinguish between direct create and modular composition patterns for Zustand state management.
- Adds a dedicated guide for pattern selection and migration, including decision criteria and anti-patterns.
- Updates architecture and UI guides to reflect best practices and provide concrete examples for choosing store patterns.
- Refines prompt instructions for consistency checks and fast-check test coverage to enforce full file scans and comprehensive quality gates.
- Refactors some component and utility interfaces for naming clarity and external type usage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(566ffb6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/566ffb6c9ca27217936e5d7d7b20b895925590e4)



### 🧪 Testing

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



### 🧹 Chores

- 🧹 [chore] Remove obsolete documentation and apply style fixes

This commit cleans up the repository by removing outdated files and applying minor code style adjustments.

-   📝 [docs] Deletes obsolete documentation and generated analysis files.
    -   Removes IPC channel analysis (`ipc-channel-analysis.md`, `ipc-channel-mapping.json`) related to the completed preload refactor.
    -   Removes cached documentation, examples, and sync logs for the `node-ping` package.
-   🎨 [style] Applies minor formatting adjustments to the ESLint configuration (`eslint.config.mjs`) for consistency, such as correcting quote styles and trailing commas.
-   🧪 [test] Cleans up JSDoc comments in the settings input fuzzing test file by removing empty code blocks.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(47bcf6d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/47bcf6d1a8c84fbaaa7ef6305ff9e6a32b35a041)


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


- 🧹 [chore] Migrate Knip config to TypeScript and improve linting flow

- Migrates Knip configuration from JSON to TypeScript for enhanced type safety and maintainability.
- Updates linting scripts to use the new TypeScript config and streamlines the lint:all job for greater efficiency.
- Improves documentation and markdown lint configs with clearer type annotations and disables unused var warnings for MDX pages.
- Expands TypeScript project references to include new Knip config locations, ensuring unified tooling support.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(75b9c5c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/75b9c5c7b36ea4fb54d9749736a73dbf6f1857ba)


- 🧹 [chore] Enforce comment capitalization and extend lint coverage

- Enforces capitalized comments with exceptions for various rule-related tags, improving code readability and consistency.
- Upgrades linting rigor by enabling additional rules for regex, import/export, React JSX, SonarJS, and total-functions, enhancing code quality and maintainability.
- Refines comment clarity, capitalization, and disables redundant or overly strict rules where appropriate.
- Updates global disables section and several rule descriptions for better documentation and understanding.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c66adb8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c66adb8e0bc786172a93fe9d500e560454248490)






## [14.9.0] - 2025-09-14


[[3f9a450](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3f9a450b2410337cad88528bebf9cff994709664)...
[321d872](https://github.com/Nick2bad4u/Uptime-Watcher/commit/321d872e8cf34bb7ee60c22bf1858e7a69a99fd7)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/3f9a450b2410337cad88528bebf9cff994709664...321d872e8cf34bb7ee60c22bf1858e7a69a99fd7))


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


- ✨ [feat] Add comprehensive Playwright E2E, accessibility, and compatibility test suites

- Introduces extensive automated Playwright test coverage for critical user workflows, accessibility compliance (including WCAG and keyboard navigation), edge cases, cross-browser/platform compatibility, and UI resilience.
 - Adds a helper script and documentation to streamline Playwright codegen and integration for Electron and web contexts.
 - Refines test configuration with granular TypeScript isolation, enhanced ESLint Playwright rules, and improved test metadata/tagging.
 - Updates core app markup and test selectors to support robust, reliable automated UI testing and accessibility assertions.
 - Integrates Playwright test type checks into CI and scripts for higher code quality.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3f9a450)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3f9a450b2410337cad88528bebf9cff994709664)



### 🛠️ Other Changes

- Delete docs/docusaurus/stylelintcache

Non supposed to be uploaded [`(211367e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/211367e863d95bb2e31b281825b2e065e7c060c6)



### 📝 Documentation

- 📝 [docs] Streamline code samples, improve clarity, update formatting

- Removes redundant blank lines for cleaner code blocks in documentation and templates.
- Refactors lists, arrays, and configuration examples for compactness and readability.
- Updates summary docs to better structure test and documentation status.
- Fixes minor markdown and HTML formatting issues for consistency.
- Improves code sample formatting and indentation in tests and guides.
- No logic changes; focuses on editorial and presentational improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7829915)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/782991527da93951a8b06cf5ca2649cf6b239caf)



### 🔧 Build System

- 🔧 [build] Update dependencies and Node requirements for ES2024+

- Upgrades major and minor dependencies for better compatibility with Node.js 24+ and latest ecosystem standards, including axios, joi, jsdom, type-fest, tough-cookie, eslint-plugin-n, and related packages.
- Adjusts .gitignore to support React Native and new cache files, improving cross-platform development workflows.
- Refines ESLint configuration to enforce support for ES2024 features and Node.js 24+, increasing code quality and future-proofing.
- Updates build scripts to use TypeScript project references and removes redundant cleaning steps for faster and safer builds.
- Cleans up unnecessary ESLint disable comments where modern Node.js resolves compatibility issues.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(321d872)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/321d872e8cf34bb7ee60c22bf1858e7a69a99fd7)






## [14.5.0] - 2025-09-12


[[c223e96](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c223e969eb1361d10c29c6d3659d4b45f3e1523b)...
[c223e96](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c223e969eb1361d10c29c6d3659d4b45f3e1523b)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/c223e969eb1361d10c29c6d3659d4b45f3e1523b...c223e969eb1361d10c29c6d3659d4b45f3e1523b))


### 🛠️ Bug Fixes

- 🛠️ [fix] Update ESLint config for new eslint-comments plugin

- Switches all disable/enable-pair comments to use the new scoped rule name from @eslint-community.
- Updates ESLint configuration to reference @eslint-community/eslint-plugin-eslint-comments and its recommended rules.
- Removes old rule references and replaces direct rule settings and plugin usage with the updated plugin configuration.
- Ensures improved compatibility, future-proofing, and correct rule enforcement for comment management.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c223e96)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c223e969eb1361d10c29c6d3659d4b45f3e1523b)






## [14.4.0] - 2025-09-11


[[2020ece](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2020ece6488e296f2613689f894d0962285d041d)...
[17fd1f5](https://github.com/Nick2bad4u/Uptime-Watcher/commit/17fd1f58a8ef7b22d4bcb2b55885bdecd2de1a53)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/2020ece6488e296f2613689f894d0962285d041d...17fd1f58a8ef7b22d4bcb2b55885bdecd2de1a53))


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






## [14.3.0] - 2025-09-10


[[db764c7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/db764c7b7acc2ffa655620b79dc961a05f07fa71)...
[35e00aa](https://github.com/Nick2bad4u/Uptime-Watcher/commit/35e00aa85b8036e2a2e474c1832e7ed2cd97839d)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/db764c7b7acc2ffa655620b79dc961a05f07fa71...35e00aa85b8036e2a2e474c1832e7ed2cd97839d))


### 📝 Documentation

- 📝 [docs] Update documentation strategy and test summary

- Adds a comprehensive summary detailing recent test suite fixes, strategic documentation improvements, and future priorities to support continued project quality.
- Removes glossary to streamline documentation and updates ignore settings for generated doc files.
- Emphasizes systematic test methodology and a phased plugin rollout plan to enhance long-term maintainability and documentation accuracy.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(35e00aa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/35e00aa85b8036e2a2e474c1832e7ed2cd97839d)



### 🧪 Testing

- 🧪 [test] Add fast-check property-based fuzzing tests

Introduces extensive property-based and fuzzing tests for core components, stores, utilities, and services using fast-check, improving reliability and coverage for edge cases and input validation.

Validates error and sites store state management, UI and settings forms, chart configuration, logger output, and component behavior under varied and extreme conditions. Enhances test suite with focused accessibility, performance, and security scenarios.

Includes related small fixes for test expectations and minor refactors to support robust fuzzing.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(db764c7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/db764c7b7acc2ffa655620b79dc961a05f07fa71)






## [14.1.0] - 2025-09-10


[[e1bb06f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e1bb06f88f79cab9113cc9b876cc7655adf1c220)...
[e8f173f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e8f173f92ed63e2c330353855e2d3f3d501f33d4)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/e1bb06f88f79cab9113cc9b876cc7655adf1c220...e8f173f92ed63e2c330353855e2d3f3d501f33d4))


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



### 🧹 Chores

- Update dependencies and improve error handling [`(e8f173f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e8f173f92ed63e2c330353855e2d3f3d501f33d4)



### 🔧 Build System

- 🔧 [build] Update dev dependencies and fix scroll reveal styles

- Upgrades multiple dev dependencies to latest versions for improved linting, formatting, and build reliability.
- Sets scroll reveal animation classes to visible by default to address potential visibility or animation issues.
- Updates stylelint configuration formatting for clarity and consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e1bb06f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e1bb06f88f79cab9113cc9b876cc7655adf1c220)






## [14.0.0] - 2025-09-09


[[d6ac036](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6ac036e7f792ba92e906741610567fc846cd872)...
[a90a140](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a90a1402fda4f098cd4f8f72842e53995e4de3de)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/d6ac036e7f792ba92e906741610567fc846cd872...a90a1402fda4f098cd4f8f72842e53995e4de3de))


### ✨ Features

- ✨ [feat] Add new ESLint plugins and fuzz test scripts

- Integrates multiple ESLint plugins for security, timer cleanup, secret detection, paths, key sorting, and switch-case rules to enhance code quality and security coverage.
- Updates dependencies to support these plugins and adds new ESLint formatters for improved reporting.
- Relaxes static secret and a11y rules to reduce false positives and improve accessibility flexibility.
- Adds comprehensive fuzz testing npm scripts for targeted, minimal, quiet, and verbose test runs, supporting frontend, shared, and Electron code.
- Improves documentation styling rules for accessibility and maintainability of Docusaurus docs.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a90a140)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a90a1402fda4f098cd4f8f72842e53995e4de3de)


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



### 📝 Documentation

- 📝 [docs] Add automated docs sync and downloader scripts

- Introduces new scripts for automated documentation downloading, processing, and syncing with upstream sources, featuring advanced options like caching, parallel/concurrent downloads, validation, and robust error handling.
- Adds comprehensive documentation sync logs and hash tracking for Zod-Fast-Check, @fast-check-vitest, and Example-Package, improving traceability and reproducibility.
- Populates package docs directories with updated README files and moves Example-Package docs to local permanent redirects, standardizing documentation structure and facilitating maintainability.
- Enhances build pipeline flexibility by supporting forced updates, output customization, and environment variable overrides for documentation outputs.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(71d05de)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/71d05de4b3b64b2e751e244f80dbb8019e739e05)



### 🎨 Styling

- 🎨 [style] Improve test readability with consistent formatting

- Updates formatting of test assertions and property-based test setups for improved clarity and maintainability.
- Replaces single-line and nested calls with multi-line structures, ensuring better alignment and easier review.
- Does not introduce logic changes; focuses solely on code style and readability for future contributors.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b6d9e45)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b6d9e450e22b6c240978a75aa0c8b144935750ac)



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


- 🔧 [build] Restructures config files for clarity and consistency

- Reorders, deduplicates, and aligns keys in various config and JSON files to improve readability and maintainability.
- Harmonizes the structure of TypeScript, ESLint, Biome, markdownlint, and other tool configs, enhancing consistency across environments.
- Adjusts script definitions and disables/enables relevant lint rules for accuracy, flexibility, and future-proofing.
- Improves test, lint, and install script clarity, grouping related commands and updating disables to match project needs.
- Expands external documentation mappings for Typedoc to boost developer experience.
- Facilitates easier updates, merges, and onboarding by standardizing configuration formatting and option order.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ef7fd61)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ef7fd617dbfd2ee709df8bc5bb864f0ab83d76d9)






## [13.7.0] - 2025-09-04


[[8dd75d3](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8dd75d39f38f8f1e588407c97b027c76b189974d)...
[b1e82fd](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b1e82fdaec2947a9199154361f97b03d9ad889b2)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/8dd75d39f38f8f1e588407c97b027c76b189974d...b1e82fdaec2947a9199154361f97b03d9ad889b2))


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



### 🎨 Styling

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



### 👷 CI/CD

- 👷 [ci] Add Stryker mutation testing and fuzzing coverage

- Integrates Stryker mutation testing into CI/CD with GitHub Actions workflow, incremental caching, and automated report uploads
- Adds mutation score PR comments, dashboard integration, and quality gates for silent failure detection
- Introduces comprehensive property-based fuzzing tests for form validation, monitor operations, IPC, and validator logic using fast-check
- Updates ignore patterns and VSCode settings to exclude Stryker temp files from linting, search, and file watching
- Documents advanced bug-finding strategies and tool recommendations for future test suite hardening
- Adds mutation testing scripts and dependencies to package configuration for streamlined developer workflow

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1c8ec37)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1c8ec37fa01164b3e19900a906026d9f1485e825)






## [13.5.0] - 2025-09-01


[[c9bb5d6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c9bb5d68549aa89c9bb4c2ade7e17a6ba186fda6)...
[3198a49](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3198a49f4bede2314be768b0f29e01df9d379827)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/c9bb5d68549aa89c9bb4c2ade7e17a6ba186fda6...3198a49f4bede2314be768b0f29e01df9d379827))


### ✨ Features

- ✨ [feat] Enhance script portability, test verbosity, and ESLint config

- Refactors all Node.js scripts to use native ESM imports (`node:`), `import.meta.dirname/filename`, and removes CommonJS `require` for improved cross-platform compatibility and future-proofing.
 - Adds a comprehensive test verbosity guide and introduces new npm script variants for quiet, minimal, verbose, and detailed test output, including coverage and documentation test scripts, enabling easier control over test output for CI, debugging, and development.
 - Updates ESLint configuration with a dedicated scripts section, relaxing rules for benchmarks and scripts, and expands ignore patterns to better match project structure.
 - Improves npm script memory usage for ESLint by setting `NODE_OPTIONS=--max_old_space_size=16384` via `cross-env`.
 - Adds TypeScript configuration for scripts, enabling type checking and linting for all script files.
 - Updates shell prompt configuration for more informative OhMyPosh segments.
 - Cleans up code style in scripts, improves error handling, and modernizes regular expressions to use named capture groups and `replaceAll`.
 - Updates documentation authorship attribution where appropriate.

Relates to overall project workflow, developer experience, and maintainability improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(06acc95)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/06acc95d8e0d99acc1cb8b15139b495c0bc351b4)



### 🛠️ Other Changes

- Merge PR #57

chore: format code with Prettier [skip-ci] [`(3198a49)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3198a49f4bede2314be768b0f29e01df9d379827)



### 🚜 Refactor

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



### 📝 Documentation

- 📝 [docs] Refactors TypeFest API documentation to enhance code clarity and consistency

- Migrates all TypeFest API docs to use Markdown code blocks with explicit language tags, improving readability and IDE syntax highlighting.
- Cleans up formatting, restructures type definitions, and standardizes code examples for better maintainability and easier navigation.
- Updates summary logs to reflect new file hashes and revision status.
- Documents missing file errors for traceability.
- Prepares documentation for future automated parsing and improved developer onboarding.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(dc029bd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dc029bd097073dc1883f8381ff756e0fb56e59f9)


- 📝 [docs] Add TypeFest package documentation and type API references

- Introduces comprehensive documentation for the TypeFest package, including detailed API docs for all type utilities, usage examples, and explanations of alternative type names and declined additions.
- Documents built-in TypeScript utility types for user reference and clarifies their relationship to TypeFest types.
- Records synchronization logs for TypeFest documentation syncs and hash tracking to ensure file integrity.
- Provides markdown-based type definitions for all included TypeFest utilities, supporting advanced TypeScript use cases such as deep partials, type guards, and template literal manipulation.
- Fixes previous failed validation of one file by ensuring all API reference files are present and validated.
- Facilitates discoverability and usability for developers integrating TypeFest types in complex TypeScript projects.

Relates to #TypeFestDocsSync

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(dcc2432)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dcc2432c094c43369477a3f059fda0f6e5e2ee5d)


- 📝 [docs] Document type-fest patterns; update build, lint, and test configs

- Adds detailed documentation for consistent type-fest utility integration, promoting enterprise-grade type safety and improved DX.
- Updates testing and build configs for better cache management, chunk splitting, coverage, and typecheck reliability.
- Refines ESLint, Vite, and Vitest configs to support modern workflows, explicit aliasing, and coverage thresholds.
- Improves agent instructions for clarity, quality standards, and architecture practices.
- Removes outdated tool documentation and enables stricter linting for improved maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(40606e2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/40606e28afba0e02dc44578299ca8c4b4b704d3b)


- 📝 [docs] Remove redundant guides from sidebar configuration

- Cleans up sidebar structure by eliminating duplicate guide entries already covered by autogenerated package docs
- Improves navigation clarity and reduces maintenance overhead

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c9bb5d6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c9bb5d68549aa89c9bb4c2ade7e17a6ba186fda6)



### 🎨 Styling

- 🎨 [style] Standardizes code formatting and improves docs clarity

- Updates code and markdown files to use consistent quote styles, indentation, and table layouts for improved readability.
- Refines documentation for migration scripts, providing clearer usage instructions and migration examples.
- Adjusts comments and line breaks for better maintainability across test setups, type declarations, and configuration.
- Enhances import processing logic for migration automation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0cfe753)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0cfe753e48b21c2040176298c7abd80ec83ecd63)


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

- 🧪 [test] Improve edge case coverage, formatting, and store tests

- Enhances test coverage for edge cases, store utilities, and constants by adding missing branches, error conditions, and integration scenarios.
- Refactors test formatting for readability, consistency, and maintainability, including indentation and line breaks for complex assertions and object structures.
- Adds and updates VS Code extension recommendations to support development and code review workflows.
- Removes unused TypeScript native-preview dependencies to streamline package management and reduce install size.
- Updates documentation and optimization summaries for accuracy, consistency, and clarity.
- Addresses minor code style and formatting in scripts and CSS for improved readability and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d9d774c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9d774c861fcd9411513e8426d02f498b82f3b56)


- 🧪 [test] Add standardized annotation to all test cases

- Adds consistent metadata annotation to every test case for improved categorization, reporting, and traceability.
- Facilitates future test analytics and integration with external tooling by embedding functional, component, category, and type tags.
- Enhances maintainability and clarity for test suite organization and review.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d4edb44)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d4edb44332bba276156d9bf30d2c7a8b67aa4629)



### 🧹 Chores

- Format code with Prettier [skip-ci] [`(385553d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/385553d36d5f1ea6c859df548eb847bd1790ebcd)



### 🔧 Build System

- 🔧 [build] Centralizes lint/config files and updates related scripts

- Moves and reorganizes linting and tool configuration files into dedicated subfolders to improve maintainability and project structure.
- Updates scripts, workflow commands, ignore lists, and npm tasks to reference new config paths, ensuring consistency across tooling.
- Refines changelog generation targets in CI workflows to match updated repository layout.
- Cleans up redundant VS Code settings and improves file exclusion patterns for better performance.
- Enhances script logic for cspell word management and increases custom dictionary coverage.
- Improves documentation by syncing Axios files and standardizing interface naming.

Relates to repository tooling stability and developer experience improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(79bbe68)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/79bbe683eea9a05673a3c3b88f9c5d657a6faf74)


- 🔧 [build] Update configs, dependencies, and scripts for 2025

- Aligns code quality, build, and test configs with latest best practices and tool updates for 2025
- Streamlines and clarifies linter, scanner, and CI/CD settings for better integration and less noise
- Adds new TypeScript config for config/test files, refines test/bench/config TypeScript script support
- Improves file pattern matching and ignores for ESLint, pre-commit, and spellcheck
- Upgrades key dependencies and dev tools for improved performance and compatibility
- Enhances standardization for documentation, reusable props, and code comments
- Refines package scripts for easier maintenance and more robust automation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(33ac50e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/33ac50e59b3a891dde3ab70972e2e8aecf4797fc)


- 🔧 [build] Move test configs, standardize cache and paths

- Relocates Vitest and TypeScript test configuration files into dedicated 'config/testing' and 'config/benchmarks' directories for improved maintainability and separation of concerns.
- Updates references across scripts, ESLint, Sonar, Knip, and documentation to match new config paths.
- Standardizes tool cache locations under a single '.cache/' directory and updates ignore/purge rules to avoid stale artifacts.
- Cleans up obsolete audit and roadmap reports, and refreshes benchmark code for simplified structure and modern APIs.
- Improves code consistency, future test scaling, and cross-tool integration for CI and static analysis.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f5b4450)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f5b4450b1d541f249469a33f89d10c1eabb88a74)






## [12.6.0] - 2025-08-25


[[76e2c5a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/76e2c5a23a2ddd5adfaf5750ce325a4ecb56cd28)...
[9016fd0](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9016fd09d46afe287ddedba3bfbb49fe0a7d4272)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/76e2c5a23a2ddd5adfaf5750ce325a4ecb56cd28...9016fd09d46afe287ddedba3bfbb49fe0a7d4272))


### ✨ Features

- ✨ [feat] Modernize docs UI with advanced CSS, JS, and interactivity

- Overhauls documentation site styling with advanced CSS: glassmorphism, gradient backgrounds, animated cards, improved sidebar, and responsive design
- Adds interactive JS micro-interactions: scroll indicator, magnetic buttons, animated tilt, cursor gradients, and performance optimizations
- Introduces GitHub stats and live version display on homepage for project transparency
- Refactors homepage content for clarity and developer-centric messaging; improves demo UI mockup and feature descriptions
- Expands documentation navigation, sidebar categories, and TSDoc standards section for easier discovery
- Upgrades workflow to Node.js v24, enhances caching, and improves CI concurrency
- Adds stylelint config and scripts for docs CSS linting and automated formatting
- Updates TypeScript config for stricter type safety and DX
- Improves accessibility, color contrast, and keyboard navigation throughout

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9016fd0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9016fd09d46afe287ddedba3bfbb49fe0a7d4272)



### 🛠️ Other Changes

- Update docusaurus.config.ts [`(f0b02f4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f0b02f4461dc920e3d2cb58103b694cd8064d09d)


- Update docusaurus.config.ts [`(ea8c779)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ea8c779fa5d78a5b962ed5b3264e7fbec2b0195e)


- Priority 1.2: Component Props Standards - Documentation & Templates

- Created comprehensive Component Props Standards documentation
- Added reusable prop type definitions in shared/types/componentProps.ts
- Updated UI Feature Development Guide with standardized component templates
- Added standardized event handler patterns and prop interface examples
- Documented consistent naming conventions and accessibility patterns

Part of consistency improvement roadmap Priority 1.2

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(79948fe)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/79948fe3f621450792103a76d090c50d4d2479bc)



### 📝 Documentation

- 📝 [docs] Update Prism language support for syntax highlighting

Removes several unused or redundant languages from syntax highlighting configuration to streamline supported languages.

Adds "logs" language support to improve documentation relevance and clarity for log examples.

 - Enhances maintainability and reduces overhead from unnecessary language definitions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7e05ac1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e05ac10f0bfcd427d52852884138c96611425ec)


- 📝 [docs] Improve Docusaurus docs metadata and homepage sections

- Adds author, description, keywords, and bug URL to documentation metadata for better discoverability and project tracking
- Refactors homepage structure for clearer feature presentation, setup guides, and quick stats via modular React components
- Updates sidebar configuration for improved API categorization and navigation consistency
- Introduces a new TypeScript config for documentation, aligning ESLint and Typedoc settings for maintainability
- Enhances ESLint configuration to properly lint docs, TypeScript, CSS, and JSON files, supporting Docusaurus and custom paths
- Improves clarity, accessibility, and future scalability across documentation and code quality workflows

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(76e2c5a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/76e2c5a23a2ddd5adfaf5750ce325a4ecb56cd28)



### 🎨 Styling

- 🎨 [style] Update UI colors and TypeScript target

- Improves visual appearance of announcement bar with new background and text colors for better readability and emphasis.
- Upgrades TypeScript benchmark configuration to use latest language features by targeting ES2024.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1340c36)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1340c3637b9c9463d87ff3b38479f481e81e4b18)


- 🎨 [style] Standardizes code formatting across docs and tests

- Applies consistent indentation and spacing to documentation, CSS, TypeScript, and test files for improved readability and maintainability
- Switches to double quotes in TypeScript/React files to unify import and JSX style
- Reformats test cases and config files for better alignment and clarity
- No functional or logic changes; focuses solely on code style and formatting for future ease of collaboration

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a71ae02)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a71ae02aad25c2df191685b462780c9a53ed510c)



### 🧹 Chores

- 🧹 [chore] Remove legacy ESLint config and unused Prism language

- Eliminates the shared ESLint configuration for Uptime Watcher projects, streamlining project dependencies and maintenance.
- Removes the "logs" language from Prism syntax highlighting, reducing unnecessary code highlighting options.

Helps reduce maintenance overhead and potential confusion from obsolete linting configurations.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(855093c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/855093c739a0000754bb712d1daf2a2ddfa2fa4a)



### 👷 CI/CD

- 👷 [ci] Update Docusaurus deployment to install deps in subdir

- Ensures all dependency installations in CI workflow run within the Docusaurus docs directory.
- Improves reliability of deployment by scoping installs, reducing risk of misconfigured dependencies.
- Reformats keywords in documentation package manifest for improved readability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2460c78)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2460c78a84c58919eb3645e3ac510744dde6308c)



### 🔧 Build System

- 🔧 [build] Enable Rspack bundler, persistent cache, and i18n

- Switches to Rspack bundler with persistent caching for improved build performance.
- Adds internationalization configuration with English as the default locale.
- Removes unused Prism language definitions to streamline syntax highlighting.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(89d52ee)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/89d52ee86ce6174dd2cd4e94babcab0d8f7673d2)


- 🔧 [build] Update config for improved v4 compatibility

- Refactors configuration to nest legacy head attribute removal and CSS cascade layer options under the upcoming v4 compatibility flag.
- Prepares for future Docusaurus v4 upgrades by aligning with expected schema structure.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1e19e13)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1e19e137ae9641cd1d831332cbbd35050744f205)


- 🔧 [build] Update Docusaurus docs dependencies and ESLint config

- Adds new Docusaurus plugins and supporting packages to enhance documentation features and build performance.
- Upgrades and introduces related dependencies for faster builds, module federation, and improved CSS processing.
- Refines ESLint config by disabling rules that conflict with Docusaurus patterns, relaxing strictness for JSX, import resolution, and filename enforcement, and improving compatibility for docs development.
- Expands allowed import paths for custom Docusaurus aliases.
- Updates Typedoc plugin versions for better markdown support.

These changes improve maintainability, build efficiency, and developer experience for documentation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f14f43d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f14f43df58180d5a3fca560b39e9a8b352d3bc04)






## [12.3.0] - 2025-08-23


[[3ef48a9](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3ef48a9c796f223daa4fff17295610a954b4cc2d)...
[766e53e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/766e53e5fbc701eabdbc404d81062dc0ab2a524a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/3ef48a9c796f223daa4fff17295610a954b4cc2d...766e53e5fbc701eabdbc404d81062dc0ab2a524a))


### 📝 Documentation

- 📝 [docs] Add Docusaurus setup guide and improve sidebar UX

- Introduces a comprehensive documentation setup guide detailing architecture, configuration, build process, and best practices for unified Docusaurus and TypeDoc usage.
- Enhances sidebar structure with clearer categories, badges, and improved navigation, including onboarding guides, API sections, and advanced internals.
- Updates custom CSS for sidebar visual cues and badge styling to improve discoverability and organization.
- Refines type guards for form data validation, increases robustness of property access in database utilities, and corrects monitoring status logic for edge cases.
- Disables problematic ESLint CSS class rule to reduce false positives.
- Fixes documentation example for string conversion utility to accurately reflect null handling.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6ddd33a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6ddd33a57ffdfcd36ce44ce367cba9aadc79cb00)


- 📝 [docs] Update TypeDoc output directory path

- Changes documentation output location for generated TypeDoc files to streamline doc structure and simplify navigation.
- Ensures consistency between documentation tools and reduces potential confusion for contributors.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c567001)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c567001639f042bcc4703436ed76448096539571)



### 🎨 Styling

- 🎨 [style] Improve formatting of imports and logging

- Updates import statements across scripts for better readability by expanding multiline imports.
- Refines logging output for enhanced clarity in script execution.
- Makes code more maintainable and consistent with formatting standards.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3ef48a9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3ef48a9c796f223daa4fff17295610a954b4cc2d)



### 🧪 Testing

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


- 🧪 [test] Achieve 100% coverage for key modules and improve TypeDoc workflow

- Adds comprehensive unit tests to reach full coverage for utility, store, schema validation, monitor forms, and React hooks, targeting previously uncovered lines and edge cases.
- Refactors TypeDoc configuration and build workflow to leverage markdown plugins, update schemas, and enhance MDX compatibility.
- Cleans up legacy scripts, replaces CommonJS with ESM for documentation post-processing, and updates npm dependencies to support new markdown and remark plugins.
- Improves CI and build pipeline for documentation deployments, switches artifact output to unified docs, and updates VS Code settings to reflect new documentation structure.
- Motivated by the need for robust code quality metrics and seamless documentation generation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7e2f6d0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e2f6d073f8ec8731d960a03d45befaa109901a2)



### 👷 CI/CD

- 👷 [ci] Improve caching and Flatpak setup in workflows

- Optimizes CI by expanding caching for Node.js dependencies, build artifacts, and Flatpak runtimes.
- Switches Flatpak runtime/SDK installation and verification to user scope for better build sandbox compatibility.
- Refines Flatpak build output logging and error handling for improved diagnostics.
- Updates Docusaurus config for enhanced future compatibility and caching, adds experimental flags, and improves config structure.
- Adds Docusaurus faster plugin to dependencies for build performance.
- Disables Docusaurus i18n lint rules in lint config to reduce noisy warnings.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(766e53e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/766e53e5fbc701eabdbc404d81062dc0ab2a524a)


- 👷 [ci] Update docs build workflow and cleanup configs

- Removes Docusaurus TypeDoc plugin to resolve conflicts with standalone TypeDoc generation.
- Switches Docusaurus npm scripts to use npx for improved reliability and version control.
- Refines CI deploy workflow to generate TypeDoc docs first, then build Docusaurus, and uploads only the final build output.
- Simplifies Flatpak Node.js SDK extension handling and environment setup.

Improves documentation build consistency and deployment robustness.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(52b5dcb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/52b5dcb80717241b550e4990d83a0e3d0077f460)



### 🔧 Build System

- 🔧 [build] Enhance Docusaurus ESLint config and plugin setup

- Integrates dedicated Docusaurus ESLint plugin and CSS modules linting for improved doc code quality.
- Refines ignore patterns for Prettier and ESLint to better target build artifacts and generated docs.
- Expands Docusaurus site configuration with new UI, navigation, and future/experimental flags.
- Promotes internal validation utilities for broader, type-safe reuse.
- Improves field validation error handling for stricter schema compliance.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6c88b5b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6c88b5ba2f9fab10c4a20ca21778a9bc568a0121)


- 🔧 [build] Add MDX linting and update docs config

- Integrates eslint-plugin-mdx and configures linting for MDX files, improving code quality for Markdown+JS/TS documentation.
- Updates docs config to enhance Markdown/MDX handling, enabling features like mermaid diagrams and custom preprocessing.
- Ignores .mdx files in prettier to avoid formatting conflicts.
- Removes post-typedoc scripts from docs workflow for streamlined documentation generation.
- [dependency] Updates package version and updates dependencies to support new linting and doc features.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1e01a8e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1e01a8eac1259bdd9179e7c3daa2bd4590f605d0)


- 🔧 [build] Remove redundant npx usage in scripts and deps

Simplifies scripts and dependencies by eliminating unnecessary 'npx' prefixes.
Improves consistency with standard npm usage and reduces potential execution overhead.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(12321c7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/12321c7380232cda895473df7563dcd27a589ab6)


- 🔧 [build] Use npx for all package scripts and dependencies

- Ensures consistent execution environment by invoking CLI tools via npx.
- Updates dependencies to use npx-prefixed versions, reducing reliance on global installs and improving developer experience.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(339100f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/339100fa5382ffc0da3be35c26ed93b1ab99cdfc)






## [12.0.0] - 2025-08-21


[[1f60aa6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1f60aa6df81d5a2b5abb2f7b4fef42f50dfb3338)...
[36f12f4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/36f12f4ebb80ead80437ddd0a1d9526a227c994c)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1f60aa6df81d5a2b5abb2f7b4fef42f50dfb3338...36f12f4ebb80ead80437ddd0a1d9526a227c994c))


### 📝 Documentation

- 📝 [docs] Docusaurus Generated Removal - Remove internal architecture & guide documentation

Removes extensive architecture, API, pattern, template, and onboarding documentation from the project docs.

 - Streamlines the documentation set to focus on external or essential resources
 - Addresses maintenance overhead and potential redundancy
 - May improve build performance and reduce repository size for contributors

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7ed72fa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7ed72fa9b84e4e53385f28f87c7313be583aeb3f)


- 📝 [docs] Update documentation index and Typedoc configs

- Removes archived documentation section to simplify the docs index and focus on relevant materials
- Fixes glob patterns in Typedoc configs to ensure recursive markdown inclusion
- Adds external Axios error documentation link for improved reference
- Optimizes reference ordering for clarity

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(352fc94)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/352fc94d214a652384658253e37c00300ec3bfe1)


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


[[b82f42b](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b82f42b3ce788a4657028ba381da205b69fa1634)...
[95f9902](https://github.com/Nick2bad4u/Uptime-Watcher/commit/95f99027de560ed7f63f660fc6531d8682dfa207)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/b82f42b3ce788a4657028ba381da205b69fa1634...95f99027de560ed7f63f660fc6531d8682dfa207))


### 📝 Documentation

- 📝 [docs] Add and improve API documentation for core interfaces

- Expands JSDoc comments for event structures, hooks, configuration services, and helper interfaces to improve code clarity and maintainability.
- Documents event payloads, lifecycle hooks, cache and monitor utilities, and chart configuration types for better developer understanding and automated API reference generation.
- Updates documentation generation configs and output settings to support enhanced documentation coverage and link resolution.
- Improves consistency and discoverability of internal and public APIs.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(95f9902)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/95f99027de560ed7f63f660fc6531d8682dfa207)


- 📝 [docs] Update TypeDoc output paths and add error resolution prompt

- Clarifies TypeDoc output directory to align documentation generation with Docusaurus structure, preventing misplaced files and improving maintainability.
- Updates sidebar configuration to point to new documentation locations, ensuring navigation matches generated content.
- Introduces a prompt for systematically resolving all TypeDoc errors and warnings, establishing clear procedures for documentation quality and future error handling.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5597484)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5597484654b69497415dbd34f3b621281f7c272e)


- 📝 [docs] Streamlines sidebar and Typedoc MD config

- Removes redundant sidebar categories to simplify navigation.
- Updates Typedoc config to include only top-level markdown files, reducing unnecessary nested documentation and output directory complexity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b82f42b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b82f42b3ce788a4657028ba381da205b69fa1634)



### 👷 CI/CD

- 👷 [ci] Update Node.js and improve sidebar paths

- Upgrades Node.js version for CI to align with latest dependencies and enhances build performance using npm caching.
- Simplifies documentation sidebar configuration by removing redundant directory prefixes, improving maintainability and clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(798366b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/798366bcada603b339045c2675afd2fdaf81904c)



### 🔧 Build System

- 🔧 [build] Add full support for .mts/.cts TypeScript files

- Expands lint, build, test, and coverage configs to recognize .mts and .cts file extensions for TypeScript modules and CommonJS modules.
- Updates related scripts, globs, and TypeScript config files to ensure consistent treatment of .mts/.cts in all workflows.
- Upgrades dependencies for improved compatibility and performance, including linter and resolver packages.
- Removes unused API documentation sidebar for docs clarity.
- Improves Typedoc configs to document all comment styles and removes markdown entry points for simplicity.
- Ensures complete coverage and linting for all source, test, and benchmark files regardless of module format.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(91d4c36)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/91d4c36b60830f95748d85c2398dfa188b4c5769)






## [11.8.0] - 2025-08-21


[[2580769](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2580769f2a5882a58b282a45b069128ccac16ba3)...
[b9db564](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b9db5645a780af7862714ed1e0b3e81a96be3f97)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/2580769f2a5882a58b282a45b069128ccac16ba3...b9db5645a780af7862714ed1e0b3e81a96be3f97))


### 🚜 Refactor

- 🚜 [refactor] Unifies site status utils and Typedoc config, cleans tests

- Removes duplicated and frontend-only site status utility wrappers, consolidating usage to shared module for consistency and maintainability.
- Updates all test imports to reference the shared site status utilities, simplifying the frontend/backend boundary.
- Refactors documentation build scripts and Typedoc configs: adds a single local config and updates related scripts, removing legacy config files for clarity.
- Expands documentation sidebar categories and Typedoc entry points for improved navigation and coverage.
- Deletes redundant and outdated comprehensive test suites to streamline the codebase.

Reduces maintenance overhead and ensures all site status logic is sourced from the shared module, eliminating confusion and mismatches.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b9db564)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b9db5645a780af7862714ed1e0b3e81a96be3f97)



### 📝 Documentation

- 📝 [docs] Add comprehensive architecture and usage docs

- Introduces extensive documentation covering architecture decisions, development patterns, templates, code standards, and troubleshooting.
- Adds onboarding guides, API references, environment setup, and index files for easier navigation.
- Documents ADRs for repository, event-driven, error handling, state management, and IPC communication patterns.
- Improves developer experience, onboarding speed, and architectural consistency across the project.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5243efc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5243efc2ebf0af2df8363575fc0a1f00cc2de681)


- 📝 [docs] Remove archived historical and implementation documentation

- Cleans up legacy analysis, implementation records, review summaries, and planning docs from the archive folder.
- Reduces repository clutter and improves focus on current, actionable documentation.
- Preserves historical context in git history for reference.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2580769)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2580769f2a5882a58b282a45b069128ccac16ba3)



### 🧪 Testing

- 🧪 [test] Expand function and branch coverage for utility and validation modules

- Adds thorough unit tests to cover edge cases, branch logic, and all switch statements in utility and validation modules.
- Improves reliability of function coverage reports by explicitly testing null, undefined, complex object, and error scenarios.
- Ensures robust validation and error handling for schemas with ZodError path cases and warning categorization.
- Strengthens coverage for all exported functions, including object safety, string conversion, type guards, and site status logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b4c5d08)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b4c5d08daebdae8faa7734c6c8f4e87a5261021f)






## [11.6.0] - 2025-08-19


[[2eb6de9](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2eb6de9ac33c245590e02e419861c26e1472fc96)...
[3ba8232](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3ba8232fa1887032f96bdd35adf80bad1fa58031)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/2eb6de9ac33c245590e02e419861c26e1472fc96...3ba8232fa1887032f96bdd35adf80bad1fa58031))


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

- 🛠️ [fix] Improve monitor type field handling and DNS support

- Updates monitor normalization and update logic to filter fields by monitor type, ensuring only allowed attributes are included and preventing type corruption.
- Adds explicit DNS monitor type support throughout UI, forms, and data models for accurate field mapping and validation.
- Enhances database transaction handling to avoid nested transaction errors and improve error logging and rollback reliability.
- Improves dynamic schema utilities with warnings for invalid data and prevents NaN corruption for numeric conversions.
- Refines test cases and UI helpers for better monitor type detection and extensibility.
- Clarifies documentation with real-world implementation guidance and lessons learned.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(becb9be)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/becb9be18ed7a3a36f09e69d5ada24cf38d9e340)



### 🛠️ Other Changes

- 📃[docs] Update TSDoc documentation and examples for consistency and clarity

- Changed code block syntax from ` ```typescript ` to ` ``` ts ` for better formatting.
- Updated email example in Zod metadata documentation.
- Improved indentation and formatting in various TSDoc examples.
- Standardized the use of single quotes for titles in TSDoc tag documentation.
- Enhanced clarity in comments and descriptions across multiple TSDoc files.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4335751)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4335751f0c88edb1ba3df9025a4eb75da108a472)



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



### 📝 Documentation

- 📝 [docs] Remove Docusaurus API and component reference docs

Removes generated API documentation and component reference files from the docs directory, including interfaces, functions, variables, and markdown indexes.

This reduces repository size and avoids duplication of autogenerated documentation. Prepares for a streamlined or alternative documentation system.

Also updates CI workflow to build Electron files before running TypeDoc for improved module resolution.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b80ec93)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b80ec93427ca72d75db1c21a04c82d28ba995554)


- 📝 [docs] Standardize and clarify TSDoc across codebase

- Updates documentation comments throughout the codebase to use consistent TSDoc tag ordering and formatting
- Adds missing @example, @param, @returns, and @remarks sections to API documentation
- Improves clarity and readability of doc comments for public, internal, and private APIs
- Ensures all doc tags are separated with line breaks, with examples moved after param/returns/throws where appropriate
- Makes documentation more accessible for tooling and future contributors, reducing ambiguity and improving maintenance

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2a0d90a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a0d90ac60b1cfc419649a13bdee09513dbff751)


- 📝 [docs] Update repository and event ADRs; add clean template

- Refines documentation for repository pattern with improved dual-method examples, detailed TSDoc comments, and clarified transaction handling.
- Expands event-driven ADR to comprehensively document public and internal event types for site, monitor, database, and system domains, enhancing clarity for contributors.
- Introduces a clean, production-ready repository template with checklist and testing guide, supporting consistent repository implementation and maintainability.
- Simplifies and aligns the existing repository template to match new conventions, making customization more intuitive.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1768e6e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1768e6e6e99e66e8b365aeb717874d3428a1b27d)


- 📝 [docs] Clarify DNS monitor as example, update patterns

- Improves documentation by clearly stating DNS monitoring is not implemented and only used for illustrative purposes.
- Enhances example code and schema patterns to better demonstrate how to add new monitor types, emphasizing required architectural practices.
- Updates validation, configuration, and registration instructions to match current extensible patterns and highlight critical requirements for consistency.
- Helps prevent confusion for developers by differentiating hypothetical examples from supported features.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(31f9ac8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/31f9ac87333976840b59b11a7e31f767113572b4)


- 📝 [docs] Standardize code style and formatting in docs/scripts

- Updates documentation markdown and code samples to use consistent code block formatting, indentation, and quotation style.
- Refactors script files for improved readability, consistent spacing, and cleaner error handling.
- Enhances maintainability and clarity of documentation and scripts by unifying code style conventions across the project.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6d02d58)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6d02d580db75d205301c6ed7ea760051d936610f)


- 📝 [docs] Add automated download scripts for package docs

- Introduces scripts to automate downloading documentation for Electron, Chart.js, React, and Zustand from their official sources and repositories.
- Cleans, rewrites, and saves docs in Markdown format with normalized links for consistency and local use.
- Updates test files and type imports for stricter type usage and improved test reliability.
- Refines documentation formatting for clarity, markdown consistency, and improved code sample indentation.
Removes unused internal logging module to streamline codebase.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(48fe5af)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/48fe5af8375daec3ab295b77cd23a2af68570351)


- 📝 [docs] Update architecture docs for production readiness

- Expands and revises ADRs, guides, and templates to reflect production-grade standards, focusing on enhanced error handling, memory management, race condition prevention, and event-driven monitoring.
- Introduces new documentation patterns, detailed implementation requirements, and comprehensive validation/testing guidance for adding new monitor types.
- Clarifies repository pattern, monitoring architecture, and error resilience with examples, best practices, and integration checklists.
- Improves clarity, completeness, and alignment with the latest system behavior, enforcing strict ADR compliance and consistent developer experience.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5b7f705)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5b7f70551786c8260fcc6c305ca6f4dfe31e82a2)



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


- 🎨 [style] Standardizes single quotes for tool arrays in metadata

- Updates YAML front matter in chatmode and prompt configuration files to use single quotes for tool arrays, ensuring consistency across metadata formatting.
- Renames Tailwind config file extension for clarity and alignment with other config files.
- Cleans up documentation code snippets by removing unused path aliases to reduce confusion.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bc7800f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bc7800f27a9b89cdb8180cec6c77f852b6c83156)


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


- 🎨 [style] Apply consistent multi-line formatting project-wide

- Updates codebase and documentation to use multi-line parameter and array formatting for improved readability and consistency.
- Refactors function and method signatures, object initializations, and complex destructuring to span multiple lines where appropriate.
- Enhances maintainability and reduces merge conflicts by enforcing a unified code style.

Relates to ongoing style standardization efforts. [`(0e475eb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0e475eb71b2874d6c479c4bbf22380c24e9479eb)



### 🧪 Testing

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


- 🧪 [test] Improve AddSiteForm and shared component test readability

- Reformats and expands unit tests for AddSiteForm, SiteOverviewTab, and shared UI components for improved readability, accessibility coverage, and edge case handling.
- Uses more explicit test assertions, consistent indentation, and multi-line props for clarity.
- Adds comprehensive tests for accessibility, keyboard navigation, rapid state changes, className handling, unicode/special character values, and prop spreading.
- Addresses branch coverage gaps in custom hooks and logic branches.
- Makes all test suites easier to maintain and extend for future changes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f7a3c7f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f7a3c7f36ec9f9b702fa6cdcb871f48e61a17c54)


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

- 🧹 [chore] Standardize formatting and improve test robustness

- Removes unnecessary blank lines and ensures consistent formatting across markdown, config, and test files for clarity and maintainability.
- Refactors test cases to use double quotes and modernizes proxy/object setups for improved reliability and coverage.
- Updates ESLint config for clearer implicit dependency handling and better readability.
- Enhances documentation comment blocks for easier parsing and future editing.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8faf3a9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8faf3a9768171e2591486eac8b3a5980a57e901a)



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






## [10.3.0] - 2025-08-07


[[a607e85](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a607e859b2c70e914188c5aba337e383f27e339b)...
[6274a4a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6274a4a21a213e4dce1b0a8141b6107d13b65d0d)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/a607e859b2c70e914188c5aba337e383f27e339b...6274a4a21a213e4dce1b0a8141b6107d13b65d0d))


### 📝 Documentation

- 📝 [docs] Improve docs, templates, and consistency across guides

- Enhances documentation by adding missing newlines and improving formatting for readability in core guides, ADRs, and templates
- Refines and expands code examples in architecture docs, development patterns, and templates for repository, IPC, and Zustand store implementations
- Standardizes usage of code blocks and TSDoc inline example style throughout documentation
- Removes an obsolete generated analysis file and deletes an unused report to reduce repository noise
- Updates markdown lists, section headings, and example categories for clarity and easier onboarding
- Clarifies migration, compliance, and testing guidelines in project docs to better support contributors [`(6274a4a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6274a4a21a213e4dce1b0a8141b6107d13b65d0d)



### 🧪 Testing

- 🧪 [test] Boosts test coverage for shared types and logic

- Adds comprehensive tests for uncovered code paths in shared types and utility modules, targeting type definitions, cache logic, error handling, and edge cases.
- Refines cache key usage in monitor type helper tests to match updated naming conventions.
- Improves error fallback logic and messaging for utility error handling.
- Updates file and documentation organization for clarity and historical record-keeping.
- Enhances robustness of external URL opening logic, improving fallback handling for test environments.
- Motivated by the need to improve overall code coverage and reliability, especially for critical shared logic and type definitions. [`(a607e85)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a607e859b2c70e914188c5aba337e383f27e339b)






## [10.2.0] - 2025-08-06


[[f0d2774](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f0d277401b81fcf8ee9b0491b03ca5ef79f45596)...
[c6979c8](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c6979c8176ff12c6f5eec3ec7863a5425a9b1319)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/f0d277401b81fcf8ee9b0491b03ca5ef79f45596...c6979c8176ff12c6f5eec3ec7863a5425a9b1319))


### ✨ Features

- ✨ [feat] Standardize logging with type-safe templates

- Implements a comprehensive log message templating system to ensure consistent, type-safe logging throughout the codebase.
- Migrates logger calls in core backend modules to use centralized templates, improving maintainability and enabling future localization.
- Refines error catalog for user-facing errors and IPC, clarifying the distinction between error messaging and logging.
- Updates utility and infrastructure code to adopt template-driven logging, reducing repetition and risk of format errors.
- Adds detailed documentation and progress reports to guide and verify the migration strategy.
- Enhances build configuration and type acquisition for improved developer experience and reliability. [`(c6979c8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c6979c8176ff12c6f5eec3ec7863a5425a9b1319)



### 📝 Documentation

- 📝 [docs] Overhaul documentation structure and add architecture guides

- Reorganizes documentation for clarity, separating current docs from historical materials by moving legacy analysis and implementation records into an Archive directory with an index for easy reference.
- Adds comprehensive architecture documentation, including ADRs for repository pattern, event-driven design, error handling, frontend state management, and IPC protocol.
- Introduces detailed development patterns, code templates, and TSDoc standards to standardize future contributions.
- Provides a new developer quick start, environment setup, troubleshooting guide, and full documentation index to streamline onboarding and daily workflow.
- Updates or clarifies monitor implementation and testing guides to reflect new architectural patterns and migration status.
- Improves navigation and maintainability by clearly distinguishing active, actionable docs from historical context.

Relates to documentation cleanup and architecture transparency initiatives. [`(f0d2774)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f0d277401b81fcf8ee9b0491b03ca5ef79f45596)



### 🧹 Chores

- 🧹 [chore] Centralize error handling and cache key utilities

- Unifies error messaging across frontend, backend, and shared code by introducing a structured error catalog with domain-specific constants, improving maintainability and reducing typos.
- Replaces scattered error message usage with consistent imports from a shared error catalog, updating stores, utilities, and tests for type safety and clarity.
- Adds comprehensive cache key generation helpers to standardize caching patterns for configuration, site, monitor, and validation data throughout the app.
- Refactors store actions and utility functions to use new error and cache key systems, improving code readability and future extensibility.
- Updates documentation, configuration files, and test suites to reflect new architecture and error handling conventions. [`(37d0c64)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/37d0c6497e17a8f5802dc65851106d6da9cffe16)






## [10.0.0] - 2025-08-05


[[b4a8f51](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b4a8f516e0f2be54c85b98643055131258b4d9ae)...
[cd95d5a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd95d5a9d23f44b43e0bd923dc59bf64d8a82aec)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/b4a8f516e0f2be54c85b98643055131258b4d9ae...cd95d5a9d23f44b43e0bd923dc59bf64d8a82aec))


### ✨ Features

- ✨ [feat] Unifies type safety and validation across app

- Refactors validation system to use a single, unified set of type-safe interfaces for all config, monitor, and theme validation, eliminating duplicate and backward-compatible types.
 - Replaces broad `unknown` and `Record<string, unknown>` types with explicit union types for config and cache values, improving compile-time type safety and code maintainability.
 - Migrates all monitor type logic, validation, and field configs to a centralized Zustand store for better state management and consistent IPC usage.
 - Updates all related code to use the new store and unified validation results, ensuring consistent naming (`success` vs `isValid`) and removing all inline imports for clarity.
 - Improves developer experience by cleaning up interface inheritance, enforcing project-wide import style, and providing comprehensive documentation and lessons learned.
 - Adds and updates docs to reflect the new robust type safety architecture and future recommendations.
Fixes type consistency and maintainability issues identified in previous reviews. [`(26bc213)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26bc213d25be778056e3e1ddc0b257c4d4e5afb7)


- ✨ [feat] Add modal-driven site creation and unified site monitoring controls

- Introduces a modal-based workflow for adding new sites, improving clarity and minimizing dashboard clutter
- Implements a reusable site monitoring button component for consistent start/stop-all controls across site cards and details
- Enhances the UI store and header to support modal visibility management
- Refactors dashboard and details layouts for cleaner presentation and accessibility, including escape-key support for modals
- Lays groundwork for extensible monitor type documentation and onboarding

Improves user experience by centralizing add-site actions and providing unified, ergonomic site-wide monitoring controls. [`(cec7223)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cec72237b11668101d88dbf6299c90244c230f1d)



### 🛠️ Other Changes

- 📃[docs] add package docs [`(c1c99fe)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c1c99fe941d77f0eabe0caffade3ba3753da58cb)


- 📃[docs] Typedoc New Docs [`(68c902d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/68c902dba1cfc6e2471ec7e392d11a13b0757cfd)



### 🚜 Refactor

- 🚜 [refactor] Reduce parameter overload via interface grouping

- Refactors component props by consolidating 12 individual parameters into 4 logically grouped interfaces, improving readability and maintainability.
- Updates usage sites and tests to adopt new grouped props, enhancing type safety and developer experience.
- Revises lint and formatting scripts for improved caching and performance; cleans up package config for clarity.
- Establishes a reusable interface segregation pattern for future refactors. [`(951634c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/951634c7d60d32f4f24d104f5866f452dfed4b33)


- 🚜 [refactor] Reduce prop overload via grouped interfaces

- Refactors component interfaces to replace numerous individual parameters with four logically grouped configuration objects, improving maintainability and clarity.
- Adopts interface segregation to enhance type safety, developer experience, and scalability for future prop additions.
- Updates related test and usage sites to align with grouped props structure.
- Documents implementation and establishes patterns to address parameter overload elsewhere in the codebase. [`(d4f2a57)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d4f2a578093fc472f043f7396087dd36b398f24c)


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

- 📝 [docs] Improve type safety documentation and cleanup formatting

- Updates multiple documentation files to clarify lessons learned, implementation details, and analysis around TypeScript type safety improvements.
- Removes inline imports and redundant interface definitions from code samples to reinforce best practices.
- Highlights unified validation system, enhanced cache typing, and domain-specific configuration improvements.
- Fixes formatting and indentation inconsistencies for improved readability.
- Confirms comprehensive review and cleanup of type safety issues, emphasizing architectural boundaries for `unknown` usage.
- Updates build and lint status sections for accuracy. [`(cd95d5a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd95d5a9d23f44b43e0bd923dc59bf64d8a82aec)


- 📝 [docs] Document completion of type safety and security

- Adds extensive documentation detailing the final implementation, verification, and lessons learned from comprehensive TypeScript type safety and security efforts.
- Summarizes interface upgrades, elimination of inappropriate generic types, and critical security fixes, including object injection prevention in type guards.
- Provides quality metrics, maintenance guidelines, and recommendations for future development to ensure maintainable, world-class standards.
- Confirms no additional work is required and establishes the codebase as a reference model for secure, type-safe Electron applications. [`(6320d60)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6320d60f1a0ec65631bd565677b2405488a9f65f)


- 📝 [docs] Add lessons learned on validation and composition

- Documents critical validation omissions for ping monitors and the systematic approach taken to resolve and prevent similar issues.
- Shares patterns and principles for reducing code complexity using functional composition, with measured impacts across multiple areas.
- Emphasizes the importance of completeness, type-driven decomposition, and maintainability as future standards. [`(60d88a1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/60d88a195957b189fb718a62f0bd36b2d2f28e23)


- 📝 [docs] Update docs for backwards compatibility cleanup and monitoring migration

- Details the completed removal of legacy fallback monitoring systems and documents the migration to a unified enhanced monitoring architecture.
- Adds a comprehensive summary of backwards compatibility cleanup, including deprecated code removal, improved type safety, and standardized IPC response formats.
- Updates build scripts for prettier to simplify command usage.
- Upgrades dependencies for eslint and typedoc plugins to maintain tooling consistency.
- Improves maintainability, reliability, and test coverage by clarifying current architecture and future roadmap in documentation. [`(844957e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/844957e5a5b1aec860dba9131bd7c48f1364159e)


- 📝 [docs] Improve formatting, clarity, and consistency across docs and prompts

- Refines Markdown formatting and indentation for better readability in documentation, guides, and review prompts
 - Adds missing line breaks and whitespace for clarity, making lists and code blocks easier to parse
 - Updates tables, example code, and explanatory text to follow consistent standards throughout guides
 - Enhances accessibility and maintainability by improving structure and separating independent ideas
 - Cleans up test and config files for consistent code style, aiding future development and review [`(26f8d12)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26f8d126f1e0e654d7ade92187e9e6891219b475)


- 📝 [docs] Document complexity reduction, AI review fixes, and false positive findings

Adds comprehensive documentation for the code complexity reduction strategy and implementation, including detailed reports on recently completed refactors that lower cyclomatic complexity in critical functions. Summarizes lessons learned, architectural improvements, and successful patterns for future complexity reduction.

Includes thorough AI review analysis of 14 low-confidence claims, documenting fixes for valid issues (React performance, accessibility, test code simplification) and providing clear rationale for dismissing false positives related to intentional patterns, TypeScript idioms, database handling, and repository abstraction.

Improves maintainability, code quality, and developer onboarding by providing actionable recommendations, implementation plans, and test results while ensuring accessibility and performance best practices are followed throughout the codebase. [`(2bfb33c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2bfb33cad74be9603a0371e194197659a957179e)


- 📝 [docs] Add comprehensive monitoring and UI architecture guides

- Documents lessons learned and solution plans for race condition prevention in monitoring logic, clarifying enhanced vs. fallback monitoring operation, interface consistency, and correct database integration.
- Updates monitor type implementation guide with enhanced monitoring requirements, strict validation standards, and detailed testing criteria for the new details field.
- Introduces an extensive UI feature development guide covering architecture, validation, state management, event handling, modal design, reusable components, testing, documentation, and common pitfalls.
- Ensures future development maintains reliability, correctness, and consistency across backend and frontend layers. [`(e1c313a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e1c313a22d184e1468aaa3ebc9a151c943ff68cd)


- 📝 [docs] Add comprehensive guide for new monitor type integration

- Removes outdated IPC standardization and quality assurance documentation
- Introduces a detailed, step-by-step guide for implementing new monitor types, including backend, frontend, validation, registry, and testing requirements
- Improves developer onboarding and maintainability by consolidating all necessary architectural and integration steps into a single reference
- Ensures future extensibility with clear checklist and dynamic registry instructions [`(d90624f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d90624f4b12b6a17e8ffb4a0276433a2601f823b)


- 📝 [docs] Add comprehensive Electron-Log and Electron-Updater docs

- Introduces detailed documentation for Electron-Log, covering error handling, event logging, extending functionality, initialization in renderer, migration between major versions, and all transport options and formats
- Adds full Electron-Updater documentation, including setup, configuration, events, staged rollouts, compatibility, and advanced usage patterns
- Aims to improve developer onboarding and clarify best practices for logging and auto-update workflows in Electron apps [`(3394581)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3394581370161be9e0334fa53afd3534ae1fc4ab)


- 📝 [docs] Add comprehensive Chart.js Zoom plugin documentation

- Introduces detailed usage guides, options reference, developer API, and integration instructions for the Chart.js Zoom plugin
- Adds a variety of interactive code samples covering zoom, pan, drag, wheel, scale types, and advanced configuration scenarios
- Provides scripts and utilities to support sample execution and documentation consistency
- Facilitates user onboarding and in-depth understanding of plugin features and extensibility [`(4c7a035)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4c7a035ab6c81a92fa139b15a05a2754e57056e5)


- 📝 [docs] Add comprehensive Chart.js user documentation

- Introduces a complete set of user-facing documentation for Chart.js, covering installation, integration, configuration, chart types, axes, options, plugins, accessibility, and performance best practices.
- Provides detailed usage guides, step-by-step examples, configuration references, and sample code for all major chart types and features.
- Enhances developer experience by offering clear explanations, option tables, and links to related samples and advanced topics.
- Lays the foundation for standardized, maintainable, and discoverable documentation across the Chart.js codebase. [`(57eeeda)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/57eeedac7971be3d6e2378358fd418f94135f278)


- 📝 [docs] Add Node-Sqlite3 and WASM doc sync scripts and imported docs

- Introduces new scripts for automated downloading and cleaning of documentation for Node-Sqlite3 and its WASM variant, enabling streamlined doc updates.
- Imports key documentation files for Node-Sqlite3, including API, binaries, caching, debugging, and control flow guides, along with tracking logs and content hashes for doc integrity.
- Establishes a consistent structure for documentation management and future updates. [`(1337cdc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1337cdce8177788ce93ad5ae596c6390a9aa43bb)


- 📝 [docs] Add ValidatorJS package documentation sync support

- Introduces automated scripts and configuration for downloading, cleaning, and tracking documentation from the ValidatorJS repository.
- Adds logic to support section and line removals based on custom markers, and rewrites link references for consistency.
- Provides log and hash tracking for documentation updates, improving doc sync transparency and change detection.
- Updates template scripts to support flexible output directory naming and enhanced cleaner logic. [`(5cac379)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5cac3791e224713c63193d582aef0762063d5565)


- 📝 [docs] Replace monitor type implementation guide with Node-Ping docs sync and examples

- Removes the in-house guide for adding new monitor types to streamline documentation.
- Adds automated scripts and logs for syncing documentation from the Node-Ping upstream repository, including example files and hash tracking for change detection.
- Updates and reorganizes the Node-Ping documentation, consolidating usage instructions and FAQs, and incorporating contributor guidelines and badges.
- Improves reproducibility and maintainability of third-party package documentation by introducing a script-driven, hash-verified sync process. [`(b368d82)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b368d82508a2660663b8e95b4ca86793e282e518)


- 📝 [docs] Add usage documentation for node-ping package

- Introduces a comprehensive markdown guide detailing installation, usage examples, configuration options, and output specifications for the node-ping package.
- Helps users understand both callback and promise-based APIs, including async/await usage and cross-platform configuration nuances.
- Aims to improve developer onboarding and clarify module behavior for various use cases. [`(46908a2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/46908a2c3e316ca7bf614a3f01f3432ca8511d4a)


- 📝 [docs] Add comprehensive Axios documentation package

- Introduces a full set of Axios documentation files covering API reference, request/response configuration, error handling, interceptors, multipart and urlencoded forms, and usage examples
- Adds sync log and hash tracking for future doc integrity and updates
- Enables easier onboarding, better understanding of advanced usage, and improved developer experience for Axios users [`(d3fa008)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d3fa008293f6ea9c8d79ac2f4800979e334f5af6)


- 📝 [docs] Update reviews and docs for SOLID refactor & v9.3.0

- Updates comprehensive code review documents to reflect improvements in SOLID compliance, error handling, architecture, and testability for core manager classes and database utilities
- Details critical bug fixes, architectural refactors (factory and command patterns), and improved documentation coverage
- Revises implementation summaries, changelog entries, and compliance tables to highlight increased maintainability, type safety, atomicity, and overall code quality
- Adjusts output/documentation paths for generated API docs and fixes minor doc formatting and configuration inconsistencies
- [dependency] Updates version to 9.3.0 and documents new features, patterns, and key quality metrics

Relates to SOLID architecture refactor and v9.3.0 release [`(2ccbabd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2ccbabd4bfc48787f4c3a182dbe68f3259021172)


- 📝 [docs] Remove obsolete audit, analysis, and remediation docs

Removes outdated codebase audit, code report, ESLint analysis, and
fix planning documentation. Cleans up repository by deleting
large, now-redundant markdown and text reports covering
consistency checks, error handling, IPC pattern standardization,
and code quality issues.

- Improves maintainability by eliminating stale reference material
- Ensures documentation reflects current architecture and practices [`(216b072)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/216b072e6e3aea81e45092c4919bc6adfaf0e842)



### 🧪 Testing

- 🧪 [test] Improve test readability and formatting

Refactors test files for better readability and consistent code style.
Updates indentation, spacing, callback usage, and mock implementations to improve maintainability.
Standardizes array iteration and callback patterns for clarity.
No changes to test logic or coverage; focuses purely on code organization and formatting. [`(7679157)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/767915729a9ae65a6a9da0d8ddfa2ade3c155ee1)


- 🧪 [test] Streamline and expand component test suite formatting

- Refactors test files for themed components, utilities, and services to condense array values, assertions, and props into single lines for improved readability and maintainability.
- Ensures consistent formatting and style across all test cases, reducing visual clutter and improving future modification.
- Does not alter test coverage logic or assertions; focuses purely on code style and structure. [`(65ada1d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65ada1d97a89fe7cfebdd5770f390168098079d8)



### 🧹 Chores

- 🧹 [chore] Standardize output commands, add Grype, update lint configs

- Replaces all `Write-Host` usages with `Write-Output` in scripts for consistent logging and better compatibility with non-interactive shells.
- Adds Grype vulnerability scanning configuration and related lint scripts for enhanced security checks.
- Refactors spell-check and stylelint commands to use project-specific cache and config files, improving performance and reliability.
- Updates ignore files and custom word list to reflect new tooling and project conventions.
- Revises mega-linter and GitHub workflow configs for better reporting and security permissions.
- Improves script file analysis and summary logic for more accurate and readable output. [`(b4a8f51)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b4a8f516e0f2be54c85b98643055131258b4d9ae)



### 🔧 Build System

- 🔧 [build] Add Docusaurus package config for documentation site

- Introduces a package configuration to set up a Docusaurus-based documentation site.
- Defines scripts for building, serving, generating API docs with TypeDoc, and deployment workflows.
- Specifies dependencies and devDependencies required for documentation generation and site management.
- Establishes Node version and browser compatibility for consistent builds. [`(70a5d1f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/70a5d1f32831e70c9ba29435fc119a6e8117d0d3)






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


- 📝 [docs] Improve formatting and clarity in quality review

- Enhances markdown formatting, table alignment, and section separation for better readability
- Adds line breaks and spacing for clarity in remediation plans and implementation status
- Updates language to be more consistent and actionable
- Improves presentation of code analysis metrics and recommendations [`(c1ddf2a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c1ddf2a5851447f0c2075ace3c641ca1826621c0)


- 📝 [docs] Finalize and standardize AI claims review docs

- Updates summary, review, and implementation documentation for low-confidence AI claim reviews across all service, utility, infrastructure, and monitoring layers
- Aligns tables, formatting, and section ordering for clarity and consistency
- Expands on rationale, architectural impact, and validation results for each review batch
- Ensures comprehensive TSDoc standards, error handling, type safety, and code quality commentary are reflected in documentation
- Documents additional improvements, architectural insights, and future recommendations
- Clarifies false positive findings and documents architectural decisions
- No functional code changes; documentation and review summaries only [`(543efe4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/543efe4bb8ba01e1ab2b3071e322824620139594)



### 🧪 Testing

- 🧪 [test] Update unit tests for consistency and modern style

- Unifies import statements to use double quotes across all test files for style consistency
- Modernizes test formatting and indentation for improved readability and maintainability
- Updates mock setups and test assertions to align with current best practices
- Ensures tests follow a consistent structure for easier navigation and future extension [`(f3f27cd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f3f27cdc75c14cfbd26892dbc1123683a0806a7c)


- 🧪 [test] Add and update unit tests, remove legacy and obsolete tests

- Introduces new and improved test coverage for backend utilities, cache logic, logger, and monitor lifecycle.
- Removes outdated, redundant, or overly broad frontend and backend test suites for improved maintainability and clarity.
- Refines test logic to accommodate recent code changes and stricter validation; improves reliability of UUID and site analytics tests.
- Adds shared monitor type UI interface definitions to support future extensibility.
- Updates mocks and setup for better isolation and cross-environment compatibility.
- Refactors tests to ensure consistency with current codebase and corrects expectation mismatches. [`(dd17a16)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dd17a16e6257cd6b9b8c73f2319ad6b80c275add)






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

- 📝 [docs] Add example for Algolia site verification meta tag

- Clarifies site verification process by providing explicit sample meta tag and usage in documentation.
- Helps users easily enable Algolia verification by copying the correct meta tag format. [`(5cbb8e1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5cbb8e1f9ad717806c8538ff1c20ba1f0b1ada9b)


- 📝 [docs] Add verification instructions for DocSearch

- Improves onboarding by introducing DocsSearch verification details
- Adds a descriptive title, Markdown header, and explanation to clarify the purpose of the Algolia meta tag
- Formats example HTML in a code block for easier reference [`(9815c2a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9815c2a06eefdb565d24542622ba6252ce333d96)


- 📝 [docs] Update Electron docs link to internal route

- Switches Electron (Backend) sidebar link from external URL to internal documentation route for improved navigation consistency and better integration with site routing. [`(71e0966)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/71e096675f0ce977cb7d08296f1402a84bf6bf90)


- 📝 [docs] Rename docsearch verification page to markdown

- Improves consistency by switching the verification page from HTML to Markdown format.
 - Facilitates easier editing and better integration with documentation tools. [`(33c976c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/33c976c057963742ef108fb0c846eff5a348ceb8)


- 📝 [docs] Remove redundant type from Electron link config

- Simplifies sidebar configuration by omitting unnecessary 'type' property for the Electron documentation link.
- Enhances maintainability and reduces potential confusion in the navigation setup. [`(8b814e0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8b814e051debcf6dc50c13aac1884bba0be854b4)


- 📝 [docs] Add and update low-confidence AI claim review docs, improve TSDoc standards

- Documents comprehensive reviews and resolutions of low-confidence AI claims across multiple areas, including React hooks, utility helpers, site/store modules, services, and monitor-related utilities.
- Enhances TSDoc standards and documentation order guidelines for project consistency.
- Adds new review documents detailing identified issues, validation status, implementation fixes, and architectural improvements.
- Updates documentation configuration to display last update author/time, includes Algolia verification page, and removes unused config.
- Improves clarity and maintainability by standardizing documentation, centralizing error messages, extracting constants, and refining code patterns for performance and robustness.
- No breaking changes; all enhancements maintain backward compatibility and improve developer experience. [`(1c15bf4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1c15bf455bc9cd476cb2cef4a2694ebdce62e7c8)


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


[[1a20b90](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1a20b90e8e0e65a4fbd872a2a14c0dfe47d59aa6)...
[04f85fb](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04f85fbb657e59727b6ea017e039fdec19db2873)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1a20b90e8e0e65a4fbd872a2a14c0dfe47d59aa6...04f85fbb657e59727b6ea017e039fdec19db2873))


### 🛠️ Other Changes

- 📃[docs] Add TypeDoc plugins for enhanced documentation generation

- Added `typedoc-plugin-dt-links` version 2.0.11 to package.json and package-lock.json for linking to TypeScript definitions.
- Added `typedoc-plugin-external-package-links` version 0.1.0 to package.json and package-lock.json for linking to external package documentation.
- Updated TypeDoc configuration files (`typedoc.electron.json` and `typedoc.json`) to include the new plugins for documentation generation. [`(4a715b5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4a715b5137d86b9917fcb1685f6b4acc46cafd34)


- 📃 [docs] Refactor Docusaurus configuration: remove old config files, update navbar links, and adjust documentation structure [`(2a45eeb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4)


- Add TypeDoc configuration and update dependencies [`(951d670)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/951d670468d7fa5dbf231ca79eeaba94aa9401b5)



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


- 📝 [docs] Add detailed AI review summaries and document fixes

- Adds comprehensive documentation of low-confidence AI code review claims, including additional analysis and validation for several modules
- Documents valid issues, false positives, and minor improvements, focusing on documentation clarity, edge case handling, parameter naming, and consistency
- Details rationale and validation for lint fixes, error handling, documentation enhancements, and codebase patterns
- Introduces new local Docusaurus and TypeDoc build scripts for improved documentation workflows
- Improves traceability and future review process by outlining review patterns, recommendations, and decisions

Relates to ongoing AI-assisted code review and documentation improvement efforts [`(dd23650)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dd23650e0bc512c2133967eb2243f8decf4283e7)


- 📝 [docs] Add and update AI review reports and documentation

- Documents low-confidence AI claim reviews for multiple modules, summarizing both valid issues and false positives.
- Details rationale for code/documentation improvements, especially around TSDoc usage, error handling, and code clarity.
- Improves project maintainability by centralizing decisions, clarifying minimum value logic, standardizing comments, and aligning with error-handling guidelines.
- Enhances future code reviews by providing a summarized audit trail and actionable recommendations. [`(e794e34)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e794e34be34c60cf260109132b52f72dd12368c7)


- 📝 [docs] Remove sample blog content and cleanup docs output

- Deletes all example blog posts, author and tag definitions, and related images from documentation
- Removes generated TSDoc errors output file to reduce noise and improve project clarity
- Updates plugin configuration to add a unique identifier, supporting better multi-plugin handling

Cleans up legacy starter content and artifacts to streamline documentation and reduce confusion for future contributors. [`(9728383)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9728383a175f7cd4a9f6dd9d86cec5b53bced4e5)


- 📝 [docs] Remove Docusaurus documentation and example content

- Cleans up project by deleting all example and introductory documentation previously generated by Docusaurus, including markdown, sidebar, and image files.
- Updates project version to 8.3.0 to reflect removal of bundled documentation.
- Reduces maintenance overhead and prepares the repository for custom or updated documentation content. [`(1981a6c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1981a6cff4f375b66d2490343970d93f7f9b02ae)


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


- 📝 [docs] Overhauls documentation site with new structure and features

- Migrates Docusaurus config to reflect project branding and deployment settings
- Refactors sidebar layout for clearer separation of app and Electron API docs
- Revamps homepage with improved features section, quick stats, and setup guide for better onboarding
- Replaces SVG feature icons with emojis for simplicity and style
- Adds comprehensive styles for homepage and new sections
- Updates TypeDoc configs for enhanced MDX compatibility and better exclusion rules
- Integrates new script to fix TypeDoc markdown for Docusaurus MDX rendering
- Updates build scripts and dependencies to support the improved documentation flow
- Excludes docs from stylelint and improves ignore/config patterns for smooth build process [`(3cce0c3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3cce0c3b352c8390536ca3c7399ece50a05faf18)


- 📝 [docs] Add AI review docs for monitoring and services

- Documents low-confidence AI claim reviews for monitoring system and core services, including rationale, implementation plans, and quality improvements.
- Details fixes for documentation gaps, error handling, validation, logic bugs, and performance issues across monitoring, notification, updater, and site modules.
- Explains critical fixes for version update logic, migration safety, monitor interval validation, error propagation, and parallel data fetching.
- Outlines improvements in maintainability, type safety, reliability, and developer experience, raising overall quality scores and ensuring production readiness. [`(c23c348)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c23c348e6f4528cee9b63a2a96b02c68902ba1f7)


- 📝 [docs] Add AI review summaries and implementation details for monitoring utilities

- Documents AI-driven code review outcomes and fixes applied across monitoring service utilities.
- Highlights resolution of critical configuration and logic bugs, improved documentation, and enhanced error handling.
- Provides detailed breakdowns of issues, solutions, quality improvements, and future recommendations to support maintainability and onboarding.
- Addresses risk assessment and technical debt reduction for core monitoring modules. [`(81dfe78)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/81dfe7858daeabffd7a23cb95a6b1156316ed11c)


- 📝 [docs] Add AI claims review summaries and implementation analysis

- Documents the review and resolution of low confidence AI claims for monitoring service files.
- Details critical type safety fixes, especially for monitor types synchronization.
- Outlines improved documentation standards, error handling, and maintainability enhancements.
- Provides validation results and risk assessments supporting immediate deployment. [`(1b592bd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1b592bd4a7c78cb1495e5205b8a91c5773ec34c2)


- 📝 [docs] Add reviews and legacy code cleanup reports

- Documents AI claims reviews and implementation for HttpMonitor and PortMonitor, detailing fixes for robustness, type safety, configuration validation, and documentation clarity
- Summarizes cross-service improvements and risk assessments for monitor services
- Adds comprehensive legacy/backwards compatibility cleanup report, highlighting removal of deprecated APIs, unused utilities, and legacy compatibility code
- Improves documentation of modernization efforts and code quality benefits
- Updates test mocks to use modern import patterns, removing deprecated API usage [`(fc5973b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fc5973b64536f0ded916b8e4a5c3baaae83a3be8)


- 📝 [docs] Add comprehensive AI review reports for code quality

- Documents results of an extensive low-confidence AI claims audit across database, repository, and utility layers.
- Adds detailed review files covering validation, type safety, architectural patterns, documentation standards, and critical fixes implemented.
- Summarizes key outcomes, including false positive analysis, data consistency improvements, transaction safety, documentation enhancements, and future maintenance recommendations.
- Minor build changes: bumps package version, updates dev dependencies, and disables unused ESLint plugins for build stability.
- Improves project maintainability by clarifying rationale and standards for recent codebase changes. [`(0ad5608)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0ad5608d76bfa7df5fbfb316f6eac7c44bde43ef)


- 📝 [docs] Update TSDoc docs to use Markdown, simplify structure

- Replaces HTML and Docusaurus markup in documentation files with clean Markdown formatting for improved readability and compatibility.
- Streamlines navigation and links to use relative Markdown paths.
- Updates code download script to fetch source Markdown files directly from GitHub for more reliable and maintainable tag and page sync.
- Clarifies explanations, removes boilerplate and site-specific structure, and standardizes tag definitions and examples for easier consumption by tooling and developers.
- Increases consistency between documentation sections and makes docs easier to maintain and parse. [`(1a20b90)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1a20b90e8e0e65a4fbd872a2a14c0dfe47d59aa6)



### 🔧 Build System

- 🔧 [build] Update dependencies to latest versions

- Upgrades various dependencies and devDependencies to their newest available versions to ensure compatibility, security, and access to recent features.
- Improves ESLint, TypeScript, Electron, API extractor, zod, unicorn plugin, and related toolchain packages for better stability and maintenance.
- Reduces potential technical debt by keeping project dependencies current and minimizing future upgrade friction. [`(0ab7118)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0ab71186668915b54eadc6935cdd8a9305460192)






## [8.1.0] - 2025-07-23


[[ee45c3c](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ee45c3cbe5ef8f4d67d8ea295164a692ff6ba76d)...
[947f859](https://github.com/Nick2bad4u/Uptime-Watcher/commit/947f859b7c02dbeb4d3ebd699c129beee9f63fe4)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/ee45c3cbe5ef8f4d67d8ea295164a692ff6ba76d...947f859b7c02dbeb4d3ebd699c129beee9f63fe4))


### ✨ Features

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



### 🚜 Refactor

- 🚜 [refactor] Decouples repositories, adds SiteService, unifies validation

- Refactors repository layer to remove cross-repository dependencies, strictly enforcing single responsibility and clean architectural boundaries
- Introduces a dedicated SiteService for complex site operations and coordination across multiple repositories
- Updates all relevant managers, utility modules, and the service container to use the new service layer
- Replaces duplicated and inconsistent monitor validation logic with centralized, shared validation utilities for type safety and consistency
- Documents standardized transaction patterns and architectural improvements
- Improves maintainability, testability, and clarity of data access and business logic separation
- Fixes critical architectural violation identified in the audit [`(2958ce0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2958ce0982c55dd537bff06b17c8b8e3fe7ba528)


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


- 🚜 [refactor] Remove dead orchestrator code; streamline backup/import logic

- Eliminates unused orchestrator classes and cache methods, consolidating backup and import/export flows into direct service calls for clarity and maintainability.
- Updates docs to clarify IPC function usage, removes misleading dead code, and revises tests to target the active API.
- Improves error handling and event emission in backup and import routines, simplifying code tracing and future maintenance. [`(ff7bec9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ff7bec924c3757ccc978fd8b228ce794bb944840)


- 🚜 [refactor] Remove orchestrator, unify site write logic

- Streamlines site writing operations by removing the orchestrator class and integrating monitoring logic directly into the main service
- Simplifies service creation and usage, reducing indirection and improving maintainability
- Ensures monitoring updates are handled consistently during site updates [`(b7ea2e5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b7ea2e5ec04770e2a187571e175049b4d594e541)


- 🚜 [refactor] Streamline service architecture and event APIs

- Refactors service container and orchestration logic to improve dependency management, initialization order, and resource cleanup for better maintainability and testability.
- Enhances event bus diagnostics, middleware, and type safety for more robust cross-service communication.
- Reorganizes site, monitor, and database repositories for clearer separation of concerns and atomic operations, including bulk actions and transaction boundaries.
- Refines type guard, validation, and migration logic to support extensible monitor types and forward-compatible schema evolution.
- Updates and clarifies event IPC APIs for improved frontend/backend integration and future-proofing.
- Fixes minor issues with field ordering, code style, and documentation for consistency and readability. [`(874aa5b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/874aa5bf220f8e7bad842428a4791a4921b44692)


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

- 📝 [docs] Migrate and expand TSDoc documentation pages

- Updates documentation by removing outdated TSDoc tag guides and importing the latest tag reference pages and spec docs from tsdoc.org.
- Adds scripts to automate fetching and updating documentation, including hash tracking and change logs for downloaded files.
- Improves coverage and accuracy of TSDoc tag, spec, package, and usage documentation for maintainers and users.
- Enables future automated syncs and change detection for TSDoc documentation. [`(947f859)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/947f859b7c02dbeb4d3ebd699c129beee9f63fe4)


- 📝 [docs] Remove legacy consistency audit and type safety reports

- Cleans up numerous documentation files used for previous consistency audits, type safety assessments, implementation summaries, and architectural review reports
- Reduces repository clutter by deleting outdated audit reports, implementation plans, and summary markdown files from the docs folder
- Ensures only current, relevant documentation remains, streamlining maintenance and preventing confusion
- Reflects completion and verification of all major consistency and type safety tasks; future audits or summaries will be tracked elsewhere [`(2160e71)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2160e7189c063b5fd8a2d9817934eb54c440336b)


- 📝 [docs] Improve type safety and remediation audit docs

- Updates documentation files to reflect progress on type safety, logger remediation, and IPC event type definition enhancements.
 - Clarifies areas of improvement, completed actions, methodology, and future implementation steps for ongoing type safety initiatives.
 - Refines formatting, tables, and code sample clarity for better readability and maintainability.
 - Removes unnecessary whitespace and ensures consistent markdown for audit and summary reports.
 - No logic or application code is modified; changes are documentation-only. [`(1339d4d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1339d4da40bddad610a51f639446aa0037edb3e4)


- 📝 [docs] Remove obsolete architectural and code audit documentation

Deletes outdated docs covering legacy monitor type systems, architectural standards, code consistency audits, and implementation guides that are no longer relevant after recent registry-driven refactoring.

Improves maintainability and clarity by removing redundant instructions and references to manual patterns, switch cases, and legacy validation logic.

Streamlines onboarding by ensuring only current, dynamic monitor type integration processes are documented. [`(dfcce56)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dfcce568b9b8c7990588bb6b92ccc8746814500d)


- 📝 [docs] Standardizes formatting and improves clarity in audit docs

- Unifies markdown formatting, indentation, and code block consistency across all audit and summary documentation.
- Clarifies explanations, table layouts, and validation code for improved readability.
- Corrects minor grammar and style inconsistencies, ensuring clear separation of technical points.
- Facilitates easier future audits and onboarding with more structured documentation. [`(c720921)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c72092168060e79e003249cb7a5edea855c36e27)


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


- 📝 [docs] Add consistency audit plan and improve repo docs

- Documents a comprehensive codebase consistency audit, outlining current inconsistencies, areas of strength, and a phased improvement roadmap for error handling, repository patterns, and IPC handlers.
- Updates repository pattern documentation for clarity and highlights benefits of recent standardizations.
- Adds new terms to custom dictionary for better tooling support.
- Cleans up formatting in config and markdown files for improved readability and consistency.
- Ignores coverage result files in code style and tooling configs to reduce noise.

These changes aim to guide ongoing architectural alignment and improve maintainability across the codebase. [`(dae5886)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dae588644f14d3939a59c57805804a92d85d7764)


- 📝 [docs] Enhance monitor integration guide and clarify architecture

- Expands the guide for adding new monitor types with richer examples, advanced usage patterns, and clearer step-by-step instructions
 - Details registry-driven features, migration support, operational hooks, and type safety improvements
 - Updates code samples to reflect modern best practices, including use of JSON columns for schema flexibility and validator.js for robust validation
 - Adds advanced notes, debugging tips, architectural status, and clarifies error handling and caching strategies
 - Refines comments and JSDoc in orchestrator and main process for maintainability and onboarding
 - Removes outdated instructions and improves overall documentation structure for better developer experience [`(4e39e39)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e39e39e7bc7dc30b0d758584862163b6332f424)


- 📝 [docs] Reformat monitor type guide examples for clarity

- Improves readability in monitor type implementation guides by applying consistent code formatting and indentation
- Adds spacing and formatting to clarify code block sections, field type explanations, UI configuration, and integration steps
- Enhances step-by-step instructions for adding and registering new monitor types
- Aims to make the documentation easier to follow for developers extending monitoring functionality [`(ff92f0c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ff92f0c1bc451a0cad7e5de883a8eaccb5569481)



### 🎨 Styling

- 🎨 [style] Reformat codeblocks, update ignore and linter configs

- Reformats code examples in documentation for improved readability and consistency, primarily converting indentation to spaces in large markdown code blocks.
- Expands ignore rules to exclude more file types and folders for stylelint, reducing noise and improving linting accuracy.
- Enhances Stylelint configuration by adding Tailwind CSS support and separating rule definitions, enabling better compatibility with Tailwind CSS conventions.
- Applies small whitespace and formatting fixes across scripts and test files for cleaner diffs.
- Improves clarity and markdown compliance in docs through minor adjustments. [`(b0f0af8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b0f0af8d175b052759db39a47060929160e3d408)


- 🎨 [style] Replace console logging with structured logger

- Unifies error and warning reporting across frontend and backend by replacing all console.* calls with a structured logger interface.
- Enhances log consistency, improves error traceability, and supports future log aggregation or filtering.
- Adds logger imports where missing and adapts all error/warning handling code to use logger methods instead of direct console statements.
- Updates documentation comments for clarity and standardization, and improves error context in log messages. [`(ee45c3c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ee45c3cbe5ef8f4d67d8ea295164a692ff6ba76d)






## [7.2.0] - 2025-07-15


[[3af3ce9](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3af3ce9abd6021ac372b10d6e05290c3d3bd5ce4)...
[f6c3db1](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f6c3db18b64f0ac3bcf798ef391d3399ae018442)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/3af3ce9abd6021ac372b10d6e05290c3d3bd5ce4...f6c3db18b64f0ac3bcf798ef391d3399ae018442))


### ✨ Features

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



### 📝 Documentation

- 📝 [docs] Add updated guide for monitor type implementation

- Introduces a simplified documentation outlining the new registry-driven approach for adding monitor types, reducing required changes to just two files and streamlining development.
- Improves error handling in monitoring configuration logic by ensuring failed history limit updates are logged without blocking execution.
- Skips a test for handling invalid status values in bulk inserts, reflecting a change in expectations around status correction behavior. [`(f6c3db1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f6c3db18b64f0ac3bcf798ef391d3399ae018442)


- 📝 [docs] Update monitor type docs for dynamic registry refactor

- Modernizes documentation for dynamic monitor system and registry-driven architecture
- Documents removal of hard-coded type lists, switch cases, and manual registration patterns
- Details new Zod validation schemas, migration framework, and monitor type extensibility
- Clarifies implementation steps, file organization, and integration points for adding new monitor types
- Improves formatting, adds examples, and updates guides to reflect plugin/plugin-like approach
- Ensures future extensibility, maintainability, and developer experience are highlighted

Relates to overall system refactor and onboarding improvements. [`(88d04e2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88d04e21affafdee8c624ba285fca1a67e57b869)


- 📝 [docs] Add implementation, legacy code, and file org reviews

- Adds comprehensive documentation for the dynamic monitor system, including implementation review, legacy code analysis, final summary, and detailed file organization recommendations.
- Removes the outdated monitor type guide to reflect current registry-based architecture and dynamic patterns.
- Updates imports and file naming to use consistent camelCase across components and utilities.
- Motivates future splitting of large utility files for better maintainability and developer experience. [`(3af3ce9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3af3ce9abd6021ac372b10d6e05290c3d3bd5ce4)






## [7.0.0] - 2025-07-14


[[d33eb0a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d33eb0a224d4fd1d3cbdb82a67ac8cdb721ec7f2)...
[483d424](https://github.com/Nick2bad4u/Uptime-Watcher/commit/483d42400c4ce907962513305b51037e8b6f752e)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/d33eb0a224d4fd1d3cbdb82a67ac8cdb721ec7f2...483d42400c4ce907962513305b51037e8b6f752e))


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

- 🚜 [refactor] Remove legacy tests and scripts after monitor type overhaul

Removes obsolete unit tests and PowerShell/BAT scripts related to configuration, monitoring, and markdown link fixing, reflecting migration to a dynamic, registry-driven monitor type system.

Updates remaining tests for compatibility with new monitor status types.
Documentation is fully rewritten to guide new monitor type implementation and refactoring process.

 - Reduces maintenance overhead and test complexity
 - Ensures future extensibility and easier onboarding for contributors [`(483d424)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/483d42400c4ce907962513305b51037e8b6f752e)


- 🚜 [refactor] Extract monitor update logic into helper methods

- Improves maintainability by splitting complex monitor update and creation logic into focused, private helper functions.
- Clarifies responsibilities for updating existing monitors, creating new ones, and removing obsolete monitors.
- Removes redundant and skipped test cases for undefined/null monitor parameters, keeping the test suite relevant and lean.
- Enhances readability and future extensibility of site monitor transaction workflows. [`(d33eb0a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d33eb0a224d4fd1d3cbdb82a67ac8cdb721ec7f2)



### 🎨 Styling

- 🎨 [style] Improve code formatting and markdown consistency

- Updates indentation and spacing across markdown and TypeScript code samples for better readability.
- Applies consistent arrow function formatting in tests.
- Enhances markdown structure for clarity in documentation and action plans. [`(3c00443)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3c00443d9a504770bd03ad71885ef77457f784f1)






## [6.7.0] - 2025-07-12


[[af98089](https://github.com/Nick2bad4u/Uptime-Watcher/commit/af98089a6d8ef3104fbb43d8d29739284149b124)...
[3e22673](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e22673014215c6c667f8573fd4601f720390d73)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/af98089a6d8ef3104fbb43d8d29739284149b124...3e22673014215c6c667f8573fd4601f720390d73))


### ✨ Features

- ✨ [feat] Add transactional site DB ops and race-free monitor inserts

- Adds database transaction support to site creation, update, and deletion operations to ensure atomicity and consistency, reducing the risk of partial writes or data corruption.
- Refactors monitor insert logic to use SQL RETURNING clauses, eliminating race conditions and ensuring monitor IDs are reliably retrieved directly on insert.
- Updates interfaces and dependencies to propagate the database service where transactional context is required.
- Improves SQL safety in history pruning by switching to parameterized queries.
- Removes a redundant test file to reflect updated transactional design.
- Introduces a PowerShell script for listing project files by directory, aiding development and documentation.

These changes improve reliability, maintainability, and operational safety for data management across the app. [`(af98089)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/af98089a6d8ef3104fbb43d8d29739284149b124)



### 🛠️ Bug Fixes

- 🛠️ [fix] Prevent duplicate monitor checks and clean up tests

- Removes redundant initial monitor check logic, ensuring only a single check occurs when adding a monitor or creating a site, which avoids double status updates and improves performance.
- Cleans up unused functions and imports related to monitor checks for maintainability.
- Updates unit tests to match the new monitor lifecycle behavior and corrects test mocks for transaction-safe repository methods.
- Refines logging for consistency and fixes ESLint/TypeScript warnings, especially unnecessary conditionals and formatting. [`(33e1de5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/33e1de5af48b39ee42f254e437effe82bbd20279)



### 🚜 Refactor

- 🚜 [refactor] Centralizes DB operations with operational hooks

- Refactors database-related logic across repositories and services to use a unified operational hook for transactional operations, error handling, and event emission.
- Simplifies control flow by removing repetitive try/catch and transaction boilerplate.
- Improves reliability and observability of all critical CRUD and bulk operations, including site, monitor, settings, and history management.
- Updates frontend stores and status update handler for safer event subscription and cleanup.
- Adds support for JSONC parsing in ESLint config and introduces TSDoc config for custom tags.

Relates to improved maintainability and future extensibility of data handling. [`(13875bd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/13875bd200c491cffbfe866d6e8f36ea0010edf1)


- 🚜 [refactor] Ensure consistent transactional DB patterns, fix monitor double-check, and update lint/test infra

- Refactors database repositories and service layers to use explicit internal vs. external transaction methods, eliminating nested transaction errors and enforcing ACID compliance across all site, monitor, history, and settings operations
- Implements internal methods and interface updates for HistoryRepository and SettingsRepository, fixes transaction use throughout DataImportExportService and history limit management logic
- Adds efficient history pruning with buffered logic during monitor checks, respecting user-set limits and preventing expensive DB operations
- Fixes monitor setup so new monitors only perform a single initial check before interval scheduling, preventing duplicate immediate checks during site/monitor creation
- Updates event, state, and logging patterns for consistency and maintainability; improves frontend and backend error handling and logging formatting
- Cleans up test mocks and expectations to support internal repository methods, updates all failing or outdated tests, and fixes missing/invalid test logic to achieve 100% passing coverage
- Expands and documents lint/test/package scripts for improved code quality, adds markdown ignore to ESLint config, and resolves unnecessary conditional nags where appropriate

Relates to ongoing project-wide transaction refactor, monitor lifecycle consistency, and test/lint reliability improvements. [`(4c60717)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4c60717e08c92b80cae6732a3a6e16ca0072c194)



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


- 📝 [docs] Add TSDoc tag kinds docs and update logging cleanup

- Introduces detailed documentation on TSDoc's block, modifier, and inline tags to support API documentation efforts.
- Refines Electron main process cleanup: ensures robust and idempotent shutdown by handling both Node's beforeExit and Electron's will-quit events, and switches to using the correct log instance.
- Updates tests to reflect event name changes and cleanup logic.
- [dependency] Updates package version to 6.5.0 and adds @microsoft/api-extractor and @microsoft/tsdoc-config as dev dependencies to enable API extraction and improved documentation tooling. [`(193faeb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/193faeb1787bc1708c47e7d453970feb59322232)


- 📝 [docs] Remove legacy refactoring and coverage analysis docs

- Cleans up outdated documentation files related to refactoring, test coverage, Codecov configuration, data flow, and project analysis
- Reduces clutter by eliminating migration scripts, best practices, and structure analysis guides that are no longer relevant to the current architecture
- Prepares the documentation directory for up-to-date improvement plans and ongoing enhancements [`(f46b798)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f46b798156293a4e540e0898c49d3c28a2b1b4ca)



### 🎨 Styling

- 🎨 [style] Reformat code for consistency and readability

- Applies consistent code formatting, including improved indentation, spacing, and bracket alignment across backend and utility modules.
- Streamlines function signatures and argument lists for better clarity.
- Enhances ESLint config readability by aligning comments and object properties.
- Improves documentation structure and Markdown formatting for ESLint error tracking.

No functional or logic changes are introduced; changes focus on code clarity and maintainability. [`(c83bd8a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c83bd8a42a91fca02288f736f7bbb949cc5fe425)


- 🎨 [style] Improve test formatting and consistency

- Updates test files for improved readability and formatting consistency, including indentation, alignment, and multi-line argument handling.
- Refactors mock and test data formatting for clarity, especially in component and store mocks.
- Enhances maintainability and reduces diff noise in future test changes by enforcing consistent code style. [`(1cd5fd3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1cd5fd3335c47b9dd5561b89d9132790c10dc498)



### 🧪 Testing

- 🧪 [test] Add comprehensive tests for SiteDetails and hooks

- Adds thorough unit and integration tests for SiteDetails, including basic, simple, and comprehensive scenarios to ensure robust coverage and prevent regressions.
- Enhances tests for custom hooks, especially theme-related logic, covering both dark and light modes and various state transitions.
- Refactors existing tests to improve mock accuracy and selector handling, addressing edge cases and null/undefined handling.
- Updates test configurations to increase timeouts and add custom reporters for improved reliability and detection of hanging processes.
- Improves test output clarity by increasing verbosity and ensuring all utility exports are covered.

Motivated by the need to guarantee UI reliability, catch edge case failures, and support future refactoring with a strong safety net. [`(a31cb8d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a31cb8d3925c6418b0668a7810ac36311341baab)






## [5.0.0] - 2025-07-06


[[111ed86](https://github.com/Nick2bad4u/Uptime-Watcher/commit/111ed86d4800f1d7e469ac8127f83ab5ba560fc8)...
[1109a83](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1109a836087874e561278141c6bce11c80994033)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/111ed86d4800f1d7e469ac8127f83ab5ba560fc8...1109a836087874e561278141c6bce11c80994033))


### ✨ Features

- ✨ [feat] Add per-monitor retry attempts with UI and persistence

- Introduces configurable retry attempts for individual monitors, allowing fine-grained control over failure detection sensitivity.
- Updates backend, database schema, and repository logic to store and process retry attempts per monitor.
- Refactors monitoring logic to use per-monitor retry and timeout, applying exponential backoff between attempts for reliability.
- Enhances UI: adds retry attempts configuration to site details, calculates max check duration, and removes global maxRetries from settings and docs.
- Sets default check interval to 5 minutes, removes auto-refresh, and improves advanced error/status handling for HTTP and port monitors.
- Cleans up related documentation and code for consistency.

Relates to #213 [`(a59c50d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a59c50d3c0e0e5196792b4e927a9a4db4781e914)



### 🛠️ Other Changes

- Update theme-api.md [`(04ea615)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04ea6150ecc11ff0153c688ca9f06b2f6cb341d8)


- ⭐ feat: update dependencies and integrate Vite MCP plugin

- Added @executeautomation/database-server and @playwright/test to package.json
- Updated @typescript/native-preview and eslint versions
- Introduced vite-plugin-mcp in vite.config.ts for Model Context Protocol integration
- Created Vite-MCP-Configuration.md for detailed MCP setup and usage instructions
- Updated @types/node version in dependencies
- Added zod and zod-to-json-schema to dependencies [`(15272a9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/15272a9139a6579025be87d8d69eafcb07b07d6c)



### 🚜 Refactor

- 🚜 [refactor] Delegate site update logic to shared utility

Moves complex site update logic into a shared utility function, reducing duplication and centralizing update behavior.
 - Simplifies the main class by removing in-place logic for validation, monitor updates, and interval handling.
 - Enhances maintainability by leveraging dependency injection and callbacks for monitoring control.
 - Prepares codebase for easier testing and future enhancements. [`(3e6fd7e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e6fd7e5ebaee51ddc85ec6c1715720be2a2d2d1)


- 🚜 [refactor] Expand changelog automation and update commit grouping

- Refactors changelog automation to process a broader set of project directories, creating a separate changelog for each and storing them in a dedicated location for improved organization and review.
- Updates the commit parser configuration to comprehensively group commits by emoji-based types, aligning changelog sections with project conventions and increasing the clarity of generated logs.
- Improves maintainability and visibility of project history, especially for large or modular repositories, and ensures changelog grouping matches evolving commit standards. [`(4c22f9a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4c22f9a59ef15d3bc5654451a9cfd85fc716031c)


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



### 📝 Documentation

- 📝 [docs] Add Codecov components docs & coverage breakdown

- Introduces detailed documentation and quick reference for Codecov component-based coverage, outlining coverage targets and rationale for each architectural area.
- Updates project documentation to guide contributors on using and monitoring coverage components.
- Replaces legacy flag-based codecov configuration with a granular component-based setup for better coverage tracking and CI feedback.
- Adds validation and analysis scripts for coverage configuration and project file metrics, improving maintainability.
- Updates CI workflow to use the latest SonarQube scan action for better code analysis integration.

Relates to ongoing coverage and code quality improvements. [`(2f07b66)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2f07b66e633eb4cea54075cf4bb3c33577327afa)


- 📝 [docs] Add comprehensive architecture and analysis docs

- Introduces detailed project documentation covering architecture, data flow, and analysis summary to support maintainability and onboarding
 - Documents core patterns, IPC communication, state management, naming conventions, and test coverage to ensure consistency and clarity for contributors
 - Updates existing instructions and markdownlint settings to reflect new documentation standards and include essential AI context guidance [`(e2d3ec8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e2d3ec806b87b51a1d4205c7de40149038f909fb)


- 📝 [docs] Add comprehensive docs for Sites Store refactor

- Introduces detailed analysis and summary documentation for the modularization of the Sites Store, outlining the migration from a monolithic to a modular architecture
- Documents architectural decisions, module responsibilities, test strategy, performance impact, and migration steps, emphasizing maintainability, testability, and backward compatibility
- Facilitates onboarding and future maintenance by providing clear rationale, benefits, and lessons learned from the refactor [`(2505ea2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2505ea2553ada8fea927289922611eb46b2b82d9)


- 📝 [docs] Add detailed refactoring summary and assessment

- Documents architecture and code quality improvements from recent backend refactoring
 - Summarizes complexity reduction, 100% test coverage, and test suite fixes
 - Outlines new event-driven, repository, and configuration patterns
 - Provides rationale for manager sizing and future development guidance
 - Ensures maintainability and clarity for future contributors [`(606dea8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/606dea873dcd495083f0db4631d0360c3b258d1d)


- 📝 [docs] Modernize and standardize all refactoring guides

- Updates all documentation files to use modern TypeScript and React patterns, including improved formatting, consistent code style, and clearer before/after examples
- Refactors code snippets to prefer dependency injection, custom error classes, modular Zustand stores, and async hooks for better maintainability and testability
- Unifies TypeScript config and Vite config examples, emphasizing stricter type checking, optimized build outputs, and explicit path aliasing for clarity
- Details advanced migration and script automation steps to support large-scale refactoring with PowerShell/AST scripts
- Improves markdown tables and formatting for better readability and actionability
- Addresses previously identified documentation inconsistencies, incomplete examples, and technical debt annotations
- Prepares codebase and guides for further modularization and scalability [`(8b9cac2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8b9cac2d9b1e9f594f6a431bad0cf6f4cb8c4ea4)


- 📝 [docs] Add comprehensive refactoring and modernization guides

- Introduces detailed documentation for refactoring, best practices, and modernization, including actionable step-by-step guides, exact before/after code replacements, and automated migration scripts
- Outlines architectural improvements, error handling, design system patterns, state management splitting, and testing strategies to address technical debt and codebase complexity
- Adds analysis and validation scripts for complexity, dependency, and coverage, while providing a prioritized roadmap for incremental implementation
- Updates custom word list for spellchecking with new technical terms and acronyms

Relates to the ongoing codebase modernization and maintainability initiative [`(cefb68d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cefb68d2a3a59d4edad348dde6f8946a4685498f)


- 📝 [docs] Remove all architecture and API documentation

- Deletes all markdown documentation for architecture, components, API reference, guides, and type definitions
- Removes internal docs for forms, settings, dashboard, hooks, validation, and backend structure
- Cleans up the codebase, likely in preparation for major restructuring, documentation migration, or to eliminate outdated and potentially misleading technical docs

No logic or application code is affected; only documentation is impacted. [`(3d87674)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3d876748208640ca8fcb8fff49bb811a98efcc02)


- 📝 [docs] Remove AI-generated and migration docs, update architecture guide

- Cleans up the documentation folder by deleting AI assistant guides, health reports, migration summaries, optimization summaries, refactoring logs, and PowerShell utility scripts, reducing clutter and focusing the docs on core reference material
- Replaces the project architecture guide with a standard Markdown version, removing the Copilot-specific file and ensuring consistency for general users and contributors
- Streamlines the documentation set for maintainability and lowers overhead for future documentation updates [`(0f037eb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0f037eb8d7a5920b7fb27a30e1e38033878333bb)


- 📝 [docs] Remove legacy documentation and update review status

- Deletes outdated and redundant documentation summary, review, and implementation plan files to reflect the removal of all legacy and backward compatibility code.
- Updates the documentation review progress file to indicate 100% accuracy and completion across API, component, and guide docs, with a summary of the verification process.
- Cleans up unused utility functions related to timestamp formatting, as they are no longer referenced in the codebase.
- Improves maintainability by ensuring only current, relevant documentation remains and removing risk of confusion from obsolete docs. [`(9d36057)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9d360578c59be496bcef334ed421c9498fc3d033)


- 📝 [docs] Revamps and expands component and API documentation

- Updates documentation for major components including Dashboard, SiteCard, SiteDetails, AddSiteForm, Settings, and SiteList to reflect current architecture, internal structure, and accessibility features.
- Expands and clarifies API docs for chart configuration, database operations, hooks, and IPC, including new methods, improved usage examples, error handling, and data flow explanations.
- Refines explanations of styling, theming, and testing strategies to improve developer onboarding and maintainability.
- Removes outdated or redundant docs and ensures all files use consistent formatting, terminology, and hierarchy for easier navigation and comprehension. [`(a5726a5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a5726a59fab098497582d08e9479bf1dbf3f43f8)


- 📝 [docs] Replace custom 404 HTML with Markdown version

- Switches the 404 error page from a static HTML file to a Markdown-based version for improved maintainability and consistency with the documentation site.
- Leverages site-wide styles and layouts, making updates and theming easier.
- Retains helpful links, error imagery, and assistance options in a more concise, maintainable format. [`(2d3c3f2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2d3c3f2f2c77e9e8803605de576b3f648414fa5d)


- 📝 [docs] Remove custom 404 page and update markdownlint config

- Removes the custom documentation 404 page to simplify the docs directory or align with new site error handling.
- Updates markdownlint rules to allow specific HTML elements, supporting richer markdown formatting flexibility. [`(486ae82)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/486ae82fc41068b5a641a1992aaa887db8c3eec3)


- 📝 [docs] Update all docs for consistent, extensionless internal links

- Replaces all Markdown links to internal documentation by removing trailing slashes and file extensions, ensuring consistency and preventing potential broken links with static site generators.
- Refactors the 404 page with enhanced visuals and improved navigation, aligning quick links and help sections with updated URLs.
- Updates the documentation index, API references, component docs, and all guides to use uniform, extensionless links for a cleaner, more reliable user experience.
- Adjusts navigation breadcrumbs and "See Also" sections site-wide for clarity and maintainability.
- [dependency] Updates package version to 3.4.0 and corrects misplaced dependencies in the lockfile for improved build reliability. [`(15bb4b4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/15bb4b4e69b6d3053e3e5b6443dbf2353b030ef5)


- 📝 [docs] Update all docs to use directory-style links

- Replaces .md file links with trailing-slash directory-style links throughout documentation for improved compatibility with static site generators and cleaner URLs
- Updates navigation, breadcrumbs, cross-references, and "See Also" sections for consistency
- Adjusts config for correct site URL and baseurl, and corrects Jekyll remote theme plugin ordering
- Adds frontmatter to guide and instruction index files for better integration with site layouts
- Enhances code block rendering in some guides with {% raw %} tags to prevent Jekyll/Liquid parsing issues
- Improves maintainability and reduces risk of broken links due to file renaming or restructuring [`(b8642e9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b8642e9fbf1a36b69cb2b2965fd59e336fb652f7)


- 📝 [docs] Add raw blocks and enforce code fence style in docs

- Wraps code examples in documentation with raw blocks to prevent unwanted Markdown processing and rendering issues.
- Updates linting configuration to enforce consistent fenced code block style across Markdown files.
- Improves readability and reliability of code snippets for users and contributors. [`(6de4d28)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6de4d2848957ac613b12a3017c1ed3f121a35939)


- 📝 [docs] Update docs for repo URLs, interval options, and security details

- Updates all documentation links to use the correct GitHub repository URL for consistency and accuracy
- Documents expanded monitoring interval options, lowering the minimum to 5 seconds and raising the maximum to 30 days
- Clarifies authentication support and planned features in the FAQ
- Refines API and security documentation to reflect current and planned feature sets, removing obsolete configuration examples and aligning descriptions with actual and upcoming capabilities
- Improves navigation links and usage examples for better user guidance [`(111ed86)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/111ed86d4800f1d7e469ac8127f83ab5ba560fc8)



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


- 🎨 [style] Standardize Markdown and JSON formatting across docs

- Converts all lists, arrays, and objects in Markdown, JSON, and config files to a single-line style for improved consistency, readability, and diff clarity
- Removes excess blank lines and aligns indentation in all documentation, changelogs, and VSCode project settings
- Updates Markdown checklists and tables to use consistent spacing and formatting
- Unifies code fence and raw block usage in Markdown docs, and corrects inconsistent link and emphasis styles
- Cleans up changelog files by removing unnecessary blank lines and aligning contributor/license footers

Improves maintainability and ensures a uniform appearance across all documentation, configuration, and project files. [`(5961dcc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5961dcc0f308156068b43c08d70f45d447f281a5)



### 🧪 Testing

- 🧪 [test] Add full unit coverage for database adapters and service factories

- Adds comprehensive tests for database repository adapters, service factory utilities, and data import/export helpers in the Electron main process.
- Ensures all logic branches, dependency injections, and interface contracts are validated, improving maintainability and refactor safety.
- Increases backend code coverage and documents previously uncovered scenarios, supporting the project's production-ready test standards. [`(1109a83)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1109a836087874e561278141c6bce11c80994033)


- 🧪 [test] Achieve 99.5%+ test coverage and document untestable code

- Adds comprehensive test suites targeting remaining uncovered lines and edge cases across components, utilities, hooks, and error handlers
- Documents all intentionally untestable code with explanations and rationale for exclusion, covering defensive programming guards, browser API edge cases, and rare cleanup scenarios
- Updates documentation with detailed summaries of test coverage achievements, remaining gaps, and compliance with naming and project structure standards
- Refines CI workflow to amend version bumps and changelogs into existing commits for clearer history
- Simplifies and clarifies user-facing README and documentation index for improved navigation and maintenance
- Introduces scripts and workflow updates for automated metrics branch management

Improves code reliability, test maintainability, and transparency around coverage limits while aligning the repository with best practices for quality assurance and documentation. [`(21a4d6e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/21a4d6e2dae98303a29621ad3eb683d34823264b)


- 🧪 [test] Improve coverage reporting and barrel export testing

- Adds targeted test files for barrel export modules to ensure all exports are exercised, addressing indirect coverage and circular dependency issues
- Updates coverage configuration to explicitly exclude barrel export files from coverage metrics, improving accuracy and reducing noise from non-testable files
- Expands tests for complex error and edge cases in file download and status update handlers to better document defensive paths and error handling
- Introduces comprehensive documentation analyzing current test coverage, remaining gaps, and practical recommendations for future improvements
- Includes new test for settings component edge cases
- Ensures LICENSE and generated docs are properly ignored by markdown lint tools

These improvements clarify true code coverage, strengthen test reliability, and document both strengths and minor remaining limitations for future maintainability. [`(09cf8f3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/09cf8f31140243dd0e7a47b170eff8e096c4e472)


- 🧪 [test] Add comprehensive unit tests and update test structure

- Adds extensive unit tests for error, stats, UI, and updates stores to ensure full coverage of business and edge cases
- Expands test coverage for site details, backend focus sync, and core logic, emphasizing error handling and state transitions
- Refactors test directory structure for clarity and better separation of concerns
- Updates test mocks and dependencies to align with new coverage needs
- Enhances reliability and maintainability of the codebase by ensuring critical logic is well-tested [`(8b3ac86)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8b3ac865750d264aeb2e6512f3a146e8280eeeff)


- 🧪 [test] Remove legacy and redundant test files, update test structure

- Cleans up outdated or redundant test files to streamline test coverage
- Removes unnecessary imports and edge case tests to reduce maintenance overhead
- Moves documentation analysis files to an archive directory for better organization
- Improves test suite clarity and maintainability by focusing on relevant scenarios [`(5d2b9d4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5d2b9d42aeaddac7a258c0ac1fb34283ff1ccc8b)



### 🧹 Chores

- 🧹 [chore] Remove outdated changelogs and unused devDependency

- Deletes all auto-generated changelog markdown files from the documentation,
  cleaning up the repo and reducing maintenance overhead for obsolete or redundant logs.
- Removes the unused TypeScript CLI devDependency to streamline the dependency tree.
- Updates test IDs in form field tests for consistency and future-proofing.
- Adds a custom spelling entry for "Sarif" and minor code style tweaks in test mocks.

Helps reduce clutter, improve test clarity, and maintain an up-to-date codebase. [`(535c3df)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/535c3df642310de57c9fa23b67cc6634795c97cb)



### 👷 CI/CD

- 👷 [ci] Refines Codecov config, CI coverage upload, and removes validation script

- Updates Codecov YAML to improve flag handling, path prioritization, and ignore patterns, preventing flag overlap and refining status checks.
- Enhances CI workflow by cleaning coverage files before test runs and specifying directory parameters for coverage uploads, ensuring accurate and isolated reports.
- Removes the obsolete component validation script to streamline project maintenance.
- Improves maintainability and reliability of coverage reporting in the CI pipeline. [`(2a831b0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a831b018bb87e6e3d3016398280a2d61f959a6b)



### 🔧 Build System

- 🔧 [build] Switch to local Jekyll theme and remove remote plugin

- Replaces the remote theme with the standard Jekyll theme to simplify configuration and reduce reliance on external plugins
- Removes the now-unnecessary remote theme plugin for improved build stability and maintainability [`(63ff127)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/63ff127c8e254d592ec8a74cbe96f8d66cf8b863)






## [3.4.0] - 2025-06-28


[[4bfff70](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4bfff70c9da083079daafe2a428d3d054868cfc8)...
[28d3918](https://github.com/Nick2bad4u/Uptime-Watcher/commit/28d3918a0786eaf7e0e8a7953ce6a674c22b253e)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/4bfff70c9da083079daafe2a428d3d054868cfc8...28d3918a0786eaf7e0e8a7953ce6a674c22b253e))


### ✨ Features

- Enhance build process and add new scripts [`(67b5fe7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/67b5fe731fe24bcf6740917e646b30dfc57a6bab)


- Add cspell configuration for custom words [`(9b687cf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9b687cf24f744a5559e58f385754aaecc02209a5)



### 🛠️ Bug Fixes

- 🛠️ [fix] Improve form validation using validator library

- Replaces custom and built-in URL, host, and port validation with the `validator` library to enhance accuracy and consistency of user input checks
- Expands custom word list to support new validation-related terminology
- Adjusts ESLint and markdown configurations for improved test and documentation management
- Updates dependencies for improved compatibility and developer experience [`(5deb984)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5deb984a1115b0a9cf24a17a6a59d8198dd339ab)


- Update npm commands in Flatpak build configuration to use absolute paths [`(6e69bb7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e69bb7c04203d1e76dfe10ad1f44426a7f1372b)



### 🛠️ Other Changes

- Reformats codebase for improved readability

Applies consistent indentation, line breaks, and formatting across
multiple sections to enhance maintainability and clarity.
No functional or logic changes are introduced. [`(884adc3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/884adc398b1d12c3a39acfa0983e5e13614f6d9b)


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


- Centralizes time period constants for analytics

Eliminates duplicate time period definitions by introducing a single source of truth for analytics-related time intervals. Updates relevant modules to use the new centralized constants, improving maintainability and reducing risk of inconsistencies. Also replaces a magic number for timeout with a derived constant to enhance configuration clarity. [`(361601f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/361601f52824d2fff76e2ffce017b69efc3a053f)


- Refactors analytics and chart config for maintainability

Centralizes chart configuration and site analytics logic into
dedicated, reusable services and hooks, reducing code duplication
and improving type safety. Introduces comprehensive constants
management for easier global configuration and future extensibility.
Enhances performance through memoization and clarifies application
structure for easier future development and testing. [`(78dc5b9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/78dc5b9bbd99e23ca0fd5869192050b09ecf239f)


- Refines UI and improves error/status handling

Modernizes the application's theme by introducing error text styling, consistent spacing, and improved component classnames. Unifies status icon logic and enhances site status display for clarity. Updates product branding and streamlines the start script for development. Removes legacy site-saving script and polishes quick actions and input layouts for a more professional, accessible user experience. [`(06a6fbf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/06a6fbf99665974e6ea38926d7c15ed65be49750)


- Refactor theme structure and improve type definitions

- Updated the light and dark theme definitions to enhance readability and maintainability.
- Added spacing, typography, shadows, and border radius properties to both light and dark themes.
- Improved the ThemeColors interface to include new properties for border and surface colors.
- Refined the ThemeSpacing and ThemeTypography interfaces for better organization.
- Enhanced the useTheme hook to streamline theme management and color retrieval.
- Updated the tailwind.config.js to align with new theme colors and animations.
- Adjusted TypeScript configuration files for consistency and clarity.
- Improved the Vite configuration for better plugin management and build output. [`(6ca7152)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6ca7152ae1f9ec359be47b5cb30f7e959a50f46e)


- Refactor theme components and types for consistency and readability

- Updated string literals to use double quotes for consistency across theme components.
- Removed unnecessary line breaks and whitespace for cleaner code.
- Ensured all theme-related properties are consistently formatted.
- Improved type definitions in theme types for better clarity.
- Enhanced the useTheme hook to streamline theme management and system theme detection.
- Adjusted spacing and formatting in theme definitions for better readability. [`(e31632d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e31632db00e40b28b583595d9fbebe4f3fc83ce2)


- Ignore Electron build output in version control

Prevents generated release and dist-electron directories from being tracked
by Git, reducing noise and avoiding accidental commits of build artifacts.
Speeds up status checks and ensures a cleaner repository. [`(4bfff70)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4bfff70c9da083079daafe2a428d3d054868cfc8)



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


- 🚜 [refactor] Modularize and document SiteDetails; improve project structure

- Refactors the monolithic SiteDetails component by planning and summarizing its decomposition into modular, testable subcomponents and custom hooks, mirroring the SiteCard refactor strategy
- Documents the refactor in detail, outlining architecture changes, new hooks, component breakdown, and migration notes to guide maintainability and future improvements
- Adds dedicated markdown documentation for both the refactor summary and migration process, enhancing codebase transparency and onboarding
- Introduces various chatmode and prompt templates for debugging, documentation, code review, migration, security, and test writing, improving AI assistant usability and project workflows
- Cleans up obsolete files and wordlists, updates spellcheck dictionaries, and streamlines VSCode and cspell configuration for better development experience

- Lays groundwork for improved maintainability, readability, and testability in large React components, with clear patterns for future modularization across the app [`(0fc01d9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0fc01d993d238c2c2d371c2f747c622aac70da05)


- 🚜 [refactor] Remove site list/card components and optimize form fields

- Removes dashboard site list and card components to streamline or redesign dashboard UI.
- Refactors form field components to use memoization for performance gains.
- Updates form error handling with a memoized callback for cleaner React code.
- Simplifies logging on site/monitor add actions and form submission failures.
- Updates accessibility linting settings and custom dictionary entries for better dev experience.
- Disables markdown linting in refactor documentation for flexibility.

Prepares codebase for improved dashboard UX and more maintainable forms. [`(ad436cb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ad436cb78c46e245398a52d5a0a370926a1f15ab)


- 🚜 [refactor] Restructure components and remove legacy docs

- Removes all legacy documentation and Copilot instructions to reduce maintenance and confusion.
- Deletes and reorganizes UI components from a flat structure to feature-based folders for better modularity and maintainability.
- Cleans up unused CSS and TypeScript files tied to the old component structure.
- Updates imports in the main app to reflect the new component organization.
- Improves accessibility support for input and select components by adding ARIA attributes.
- Updates Linux desktop entry to use the wrapper script for launching Electron.
- Ensures that site deletion stops all monitoring processes before removing the site for improved resource management and reliability. [`(4876c9b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4876c9b7772765edb8e70974a73c32fc15fd7c72)


- 🚜 [refactor] Standardizes DB null handling and improves WASM setup

- Replaces all uses of `null` with `undefined` for SQLite field values to better align with WASM driver expectations and reduce ambiguity
- Refactors retry logic loops for site DB operations for clarity and code style consistency
- Updates documentation and download script to explicitly reference and set up the WASM-based SQLite driver, ensuring required directories exist before download
- Adds minor linter rule suppressions and logging clarifications for better maintainability [`(2d4ff4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2d4ff4c1d90999296d9d336b8b601029c086dd80)



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


- Add Design-Plan and AddSiteForm documentation; update Flatpak build configuration for improved structure [`(4e249c0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e249c0582ba7986e5eabf4bfd245f03392ca1a7)



### ⚡ Performance

- ⚡ [perf] Make debug logging conditional on development mode

- Reduces log volume and noise in production by wrapping all non-essential debug and verbose logs in a development mode condition across backend services and frontend state management.
- Maintains always-on logging for errors, warnings, and critical state changes, ensuring production logs focus on actionable information.
- Improves log clarity, performance, and maintainability while preserving full debug detail for development and troubleshooting.
- Addresses prior issues with log spam from routine operations (IPC, monitor checks, database CRUD) and ensures cleaner log files in production environments. [`(9e0e7b1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9e0e7b1f59c71d13abd1dca76bd7d0040227bcc3)



### 🧹 Chores

- Format code with Prettier [`(c24b09f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c24b09fc25fe4eb88036d470b5fa348b20c116ee)


- Update Tailwind CSS to version 4.1.10 and adjust configuration [`(58ba9f7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/58ba9f7b3c60edfd811e0dd382ba9d0cbed659b5)






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/Uptime-Watcher/graphs/contributors) for their hard work!
## License
This project is licensed under the [UnLicense](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/LICENSE)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
