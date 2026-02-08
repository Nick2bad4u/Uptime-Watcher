<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


[[6fee1f8](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6fee1f850712770d13ed4d8940de7cae221f7036)...
[4077b52](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4077b52c4633678237f6707a2564c1a74eda2f9a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/6fee1f850712770d13ed4d8940de7cae221f7036...4077b52c4633678237f6707a2564c1a74eda2f9a))


### ✨ Features

- ✨ [feat] Adds security-focused lint rules

✨ [feat] Adds guardrails for Electron usage, renderer env access, and error rethrowing to reduce security and reliability regressions
🧪 [test] Adds coverage for new lint rules

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c38fe30)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c38fe308cf2b516134fb030940229c11c3e86c88)


- ✨ [feat] Adds Electron lint guardrails

✨ [feat] Adds Electron lint guardrails for native dialogs and non-standard module metadata to reduce automation hangs and runtime crashes
 - ✨ [feat] Registers the new guardrails in the core Electron lint profile
🛠️ [fix] Adds automation-safe backup handling and standard directory resolution in the Electron main process to avoid blocked UI and bundler fragility
🛠️ [fix] Sanitizes debugger-injected node options when launching Electron for automation to prevent startup stalls
🧪 [test] Aligns monitor-type and lint rule tests with canonical types and new checks for consistent coverage
 - 🧪 [test] Adds rule documentation integrity validation for lint metadata links
📝 [docs] Adds rule guides and removes an outdated architecture note

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b687493)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b687493d3586c551c347ad037d9bffdc1b8768ec)


- ✨ [feat] Enhance ESLint and TypeScript configurations

 - 🛠️ [fix] Update TypeScript configuration files to include new ESLint plugins:
   - Added paths for `eslint-plugin-comment-length` and `eslint-plugin-total-functions` in `tsconfig.js.json`.
   - Excluded `test-runner-jest.config.js` from TypeScript builds.

 - 🛠️ [fix] Clean up `tsconfig.test.json` by removing unnecessary test paths for linting.

 - ✨ [feat] Introduce new TypeScript declaration files for ESLint plugins:
   - Created `eslint-plugin-comment-length.d.ts` and `eslint-plugin-total-functions.d.ts` with default exports.

 - 📝 [docs] Update documentation for custom linting rules:
   - Corrected naming conventions for several `uptime-watcher` rules in `LINT_GUARDRAILS_AND_CUSTOM_RULES.md`.

 - 🧪 [test] Add a new Vitest configuration for linting tests:
   - Created `vitest.linting.config.ts` to run RuleTester suites for internal ESLint plugins.

 - 🔧 [build] Modify `vite.config.ts` to include the new linting test configuration.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ed6a4f1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ed6a4f16eee1bede8555e8e9637ede7767a2f455)


- ✨ [feat] Modularize ESLint rules for uptime-watcher plugin
 - 🆕 Add `renderer-no-preload-bridge-writes` rule to prevent mutations of `window.electronAPI` in renderer code.
 - 🆕 Introduce `renderer-no-window-open` rule to disallow `window.open` usage in renderer code for external navigation.
 - 🆕 Implement `require-ensureError-in-catch` rule to enforce normalization of caught `unknown` errors before property access.
 - 🆕 Create `shared-no-outside-imports` rule to prevent shared modules from importing renderer or Electron runtime code.
 - 🆕 Add `shared-types-no-local-isPlainObject` rule to disallow local declarations of `isPlainObject` in shared/types.
 - 🆕 Introduce `store-actions-require-finally-reset` rule to ensure Zustand store busy flags are reset in `finally` blocks.
 - 🆕 Add `test-no-mock-return-value-constructors` rule to prevent mocking constructors with `mockReturnValue`.
 - 🆕 Implement `tsdoc-no-console-example` rule to disallow console usage in TSDoc example code blocks.
🧪 [test] Add tests for new ESLint rules in uptime-watcher plugin
 - 🆕 Create tests for `electron-no-console` rule to validate console usage in Electron context.
 - 🆕 Add tests for `renderer-no-window-open` rule to ensure proper handling of `window.open`.
 - 🆕 Implement tests for `require-ensureError-in-catch` rule to check for normalization of caught errors.
 - 🆕 Include tests for other newly added rules to ensure compliance and functionality.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9bab9dc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9bab9dc636f8759fc9be79c63971f35b5fc8c184)


- ✨ [feat] Adds lint drift guards and mock helpers

✨ [feat] Adds drift-guard lint rules to prevent duplicate contracts and helper redefinitions across layers 🧭
🔧 [build] Aligns lint configuration with the new plugin guards and reduces conflicting style/test rules 🧹
🚜 [refactor] Moves constructible mock utilities into shared helpers and adds constructible return-value helpers to avoid non-constructible mocks 🧰
🧪 [test] Updates constructor-based mocks to use constructible helpers for instantiation safety ✅
📝 [docs] Refreshes lint and testing guidance to reflect the new guardrails 📚

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5c66818)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5c66818d27169a8fbb74ce9585ee797b3eb19413)


- ✨ [feat] Refactor icon usage across components to utilize AppIcons

 - 🔧 [build] Replace react-icons with AppIcons in SiteOverviewTab for improved icon management
 - 🔧 [build] Update ConfirmDialog to use AppIcons for consistency in icon representation
 - 🔧 [build] Modify ErrorAlert to utilize AppIcons, enhancing icon clarity and maintainability
 - 🔧 [build] Refactor PromptDialog to implement AppIcons for better icon handling
 - 🔧 [build] Change SaveButton to use AppIcons, ensuring uniformity in icon usage
 - 🔧 [build] Update ThemedBadge stories to utilize AppIcons for demonstration
 - 🔧 [build] Adjust ThemedButton stories to incorporate AppIcons for visual consistency
 - 🔧 [build] Revise ThemedCard stories to use AppIcons for a cohesive design
 - 🔧 [build] Modify ThemedIconButton stories to implement AppIcons for better icon representation

🧪 [test] Update tests to reflect changes in icon usage
 - 🔧 [build] Remove mock implementations for react-icons in tests, ensuring tests align with new AppIcons usage
 - 🧪 [test] Adjust tests in ErrorAlert and SaveButton to verify AppIcons integration
 - 🧪 [test] Update comprehensive tests for SiteOverviewTab to check for new button roles and accessibility
 - 🧪 [test] Modify input-fuzzing tests for SaveButton to validate icon presence and functionality

🛠️ [fix] Improve Vite configuration for better test performance
 - ⚡ [perf] Update Vite config to remove deprecated poolOptions, replacing with maxWorkers for improved test execution
 - ⚡ [perf] Adjust Electron and shared Vite configurations to enhance test reliability and performance

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1f4df52)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1f4df52f687503430215d3bc279fa55194502c6a)



### 🛠️ Bug Fixes

- 🛠️ [fix] Adds IPC result checks

🛠️ [fix] Improves IPC handling by validating success payloads and returning safe errors when checks fail ✅🧯
 - 🛠️ [fix] Records result validation issues in handler metadata for diagnostics 🧾
🚜 [refactor] Tightens handler argument typing to reduce mismatch risk 🧩
✨ [feat] Adds schema-backed validators for backup and restore results 🗂️
🧹 [chore] Updates agent configuration to allow user invocation 🤖
🎨 [style] Cleans up minor lint-rule formatting 🧽
🧪 [test] Extends IPC tests and fixtures for result validation and new metadata fields 🧪

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4ecb590)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4ecb59095e65c929b9c4bfb46b6d5ea9ba847e4d)


- 🛠️ [fix] Implement linting rules for uptime-watcher plugin

 - ✨ [feat] Add tests for `electron-sync-no-local-ascii-digits` rule to prevent usage of local ASCII digits in specific files.
 - ✨ [feat] Introduce `logger-no-error-in-context` rule to avoid logging errors with context in certain files.
 - ✨ [feat] Create `monitor-fallback-consistency` rule to ensure fallback monitor types are consistent and valid.
 - ✨ [feat] Add `no-call-identifiers` rule to restrict usage of banned function calls in specified files.
 - ✨ [feat] Implement `no-deprecated-exports` rule to prevent exporting deprecated values.
 - ✨ [feat] Add `no-inline-ipc-channel-type-literals` rule to avoid inline type literals for IPC channels.
 - ✨ [feat] Introduce `no-local-error-normalizers` rule to restrict local error normalizers in specific files.
 - ✨ [feat] Create `no-local-identifiers` rule to prevent usage of banned local identifiers.
 - ✨ [feat] Implement `no-local-record-guards` rule to restrict local record guards in certain files.
 - ✨ [feat] Add `no-onedrive` rule to prevent usage of OneDrive paths in specific files.
 - ✨ [feat] Introduce `no-redeclare-shared-contract-interfaces` rule to avoid redeclaring shared interfaces.
 - ✨ [feat] Create `no-regexp-v-flag` rule to prevent usage of the 'v' flag in regular expressions.
 - ✨ [feat] Implement `prefer-app-alias` rule to encourage the use of application aliases in imports.
 - ✨ [feat] Add `prefer-shared-alias` rule to enforce shared aliases in imports.
 - ✨ [feat] Introduce `prefer-try-get-error-code` rule to encourage using a helper function for error codes.
 - ✨ [feat] Create `preload-no-local-is-plain-object` rule to restrict local plain object checks in preload scripts.
 - ✨ [feat] Implement `renderer-no-browser-dialogs` rule to prevent usage of browser dialogs in renderer processes.
 - ✨ [feat] Add `renderer-no-direct-bridge-readiness` rule to enforce service helper usage for bridge readiness.
 - ✨ [feat] Create `renderer-no-direct-electron-log` rule to prevent direct usage of electron-log in renderer.
 - ✨ [feat] Implement `renderer-no-direct-networking` rule to restrict direct networking calls in renderer.
 - ✨ [feat] Add `renderer-no-direct-preload-bridge` rule to prevent direct access to preload bridge.
 - ✨ [feat] Create `renderer-no-electron-import` rule to restrict direct imports from electron in renderer.
 - ✨ [feat] Implement `renderer-no-import-internal-service-utils` rule to prevent internal service utility imports in renderer.
 - ✨ [feat] Add `renderer-no-ipc-renderer-usage` rule to restrict usage of ipcRenderer in renderer.
 - ✨ [feat] Create `renderer-no-preload-bridge-writes` rule to prevent writing to preload bridge.
 - ✨ [feat] Implement `renderer-no-window-open` rule to restrict usage of window.open in renderer.
 - ✨ [feat] Add `require-ensure-error-in-catch` rule to enforce error handling in catch blocks.
 - ✨ [feat] Create `shared-no-outside-imports` rule to prevent outside imports in shared modules.
 - ✨ [feat] Implement `shared-types-no-local-is-plain-object` rule to restrict local plain object checks in shared types.
 - ✨ [feat] Add `store-actions-require-finally-reset` rule to enforce finally blocks in store actions.
 - ✨ [feat] Create `test-no-mock-return-value-constructors` rule to prevent mocking return value constructors in tests.
 - ✨ [feat] Add `tsdoc-no-console-example` rule to prevent console usage in TSDoc examples.
 - 🧹 [chore] Remove outdated `uptime-watcher-plugin.rules.test.ts` file as it is no longer needed.
 - 🎨 [style] Update `eslint.config.mjs` to adjust rules for internal helper filenames and other configurations.
 - 🚜 [refactor] Refactor `SaveButton.tsx` to use `useMemo` for button variant calculation based on disabled state.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2630c00)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2630c00e7b5a9a1b7795e6b59fde6eea90f41ff6)


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


- 🛠️ [fix] Improve error safety and scheduling

🛠️ [fix] Adds catch normalization guardrail and uses safe errors to prevent unsafe property access.
🚜 [refactor] Queues manual checks after running jobs and hardens connectivity option defaults for reliable runs.
🧹 [chore] Updates lint/style tooling and dependency versions to keep formatting consistent.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ae2de8e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ae2de8ec549291007858cc0b9580e1812b575f3b)


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



### 🚜 Refactor

- 🚜 [refactor] Centralizes validation helpers

🚜 [refactor] Extracts shared validation utilities to reduce duplication
 - Improves consistency for record, string, restore, and notification checks
🚜 [refactor] Normalizes monitor retry handling and HTTP parsing helpers
 - Aligns retry attempts and consolidates JSON/header string handling
🧹 [chore] Updates tooling configs and dependency versions
 - Adjusts linting directives, overrides order, and package upgrades

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fba5b2f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fba5b2fd7b79ad096c6d1c8fac3b7430d8350117)


- 🚜 [refactor] Update workflow configurations and code structure
 - 🛠️ [fix] Modify ESLint and Stylelint workflows to use `npm ci --force` for improved dependency installation
 - 🛠️ [fix] Adjust Flatpak build workflow to enforce `npm ci --force` for consistency
 - 🛠️ [fix] Enhance SonarCloud workflow to conditionally skip scan if `SONAR_TOKEN` is not available
 - 🛠️ [fix] Update TruffleHog configuration to exclude URI detectors for better results
 - 🛠️ [fix] Revise Gitleaks configuration to add multiple allowlists for sensitive data
 - 🎨 [style] Refactor linter configurations to point to the correct paths
 - 🎨 [style] Remove deprecated Prettier plugin from configurations
 - 📝 [docs] Update TypeScript configuration to include additional files for documentation generation
 - 📝 [docs] Modify CloudStore to streamline backup retrieval logic

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3a29378)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3a293780163f550fcc9daa9c72b779314c7be831)


- 🚜 [refactor] Streamlines validation and linting

🚜 [refactor] Streamlines monitor form validation by centralizing URL/FQDN options and reusing them across checks, including websocket protocols 🔗
 - Removes stray type fields and uses safer host key access to keep guards consistent ✅
🛠️ [fix] Prevents lint rules from running on stdin buffers and limits a mock-return-value rule to test files to avoid false positives 🧪
🔧 [build] Expands lint enforcement with security, import, node, math, and comment-length rules while aligning plugin wiring to reduce noise 🧰
🎨 [style] Improves docs site behavior with overscroll/scrollbar safeguards and broader lint ignore coverage, plus type declaration inclusion 🧭
🧹 [chore] Clarifies scripts and docs comments with extra JSDoc context and usage text formatting for better guidance ✍️

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(665ed19)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/665ed19ef0524d3046f8eb0d655319490dd5a1e6)


- 🚜 [refactor] Add default lint configs

🚜 [refactor] Adds default presets to simplify reuse
 - Keeps plugin registration centralized for reuse
🎨 [style] Normalizes rule and test formatting for clarity
 - Improves JSDoc structure without behavior changes
🧪 [test] Refines linting test runtime environment handling
 - Avoids direct env access and relaxes assertion checks
🧹 [chore] Updates docs and script ordering metadata
 - Refreshes audit references and IPC inventory notes

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(38ae7df)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/38ae7dfeec205358d934f8640ef8ed3b155daf5d)


- 🚜 [refactor] Enhance uptime-watcher ESLint plugin configuration
 - 📝 Update README.md to include usage instructions for repo-scoped presets
 - 🛠️ Add error handling and registration functions for the uptime-watcher plugin in plugin.mjs
 - 🧪 Introduce tests for plugin configurations to ensure expected keys and structure
 - 🔧 Modify tsconfig.eslint.json to specify output directories for builds
 - 🔧 Add new linting test scripts in package.json for better test coverage
 - 🔧 Update Vitest configurations across multiple files to ensure proper type exports

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b8d69f4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b8d69f4c6c0cbc0721e10f87716dff71f0e6ce62)


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



### 🧹 Chores

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


- 🧹 [chore] Update package.json and vite.config.ts to remove googleapis dependency

 - 🔧 Removed "googleapis" from the dependencies in package.json to streamline the project and reduce unnecessary bloat.
 - 🔧 Updated the "clean" script in package.json to include "release" in the cleanup process, ensuring that all relevant build artifacts are removed.
 - 🔧 Modified the "clean:cache:dist" script to also remove "release" artifacts, maintaining a clean state for builds.
 - 🔧 Removed "googleapis" from the external dependencies in vite.config.ts to further optimize the build process and avoid inflating the main-process bundle.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7c8af71)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7c8af71e64ce67f7f34472fe396ec34003719221)



### 🔧 Build System

- 🔧 [build] Update linting configuration and package details
 - 🛠️ [fix] Add ESLint and related plugins to exceptions in .npmpackagejsonlintrc.json
 - 🧹 [chore] Extend .stylelintignore to exclude Storybook static files
 - 🔧 [build] Include maintainers and contributors in uptime-watcher ESLint plugin package.json
 - 🔧 [build] Add new script for checking scripts in package.json

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6f69449)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6f69449c22553efe8972166ac75af4fd50cac469)


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


- 🔧 [build] Update GitHub workflows and configurations
 - 🛠️ [fix] Add GITLEAKS_CONFIG environment variable to gitleaks.yml for custom configuration
 - 🧹 [chore] Refactor mirror-eslint-plugin.yml to improve source directory handling and ensure proper file copying
 - 🧹 [chore] Clean up .secretlintignore by removing unnecessary patterns and adding specific files to ignore
 - 🛠️ [fix] Update .secretlintrc.json to include new secretlint rules for enhanced security checks
 - 🗑️ [delete] Remove obsolete glossary.md file from documentation
 - 🔧 [build] Enhance package.json scripts for better documentation build and linting processes
 - 🔧 [build] Update package-lock.json to include new secretlint rules dependencies

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5edf1c9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5edf1c9fb263af60ef56d5bed8bbf4a95f82739a)


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


- 🔧 [build] Update dependencies and improve TypeScript checks

 - 🛠️ [fix] Enhance `check:configs` script to include TypeScript linting for uptime-watcher
 - 🔄 [update] Upgrade `@commitlint` packages to version 20.4.1 for improved commit message validation
 - 🔄 [update] Upgrade `@cspell` packages to version 9.6.3 for better spell checking
 - 🔄 [update] Upgrade `@eslint-react/eslint-plugin` to version 2.9.3 for enhanced React linting
 - 🔄 [update] Upgrade `@putout/eslint` to version 5.0.3 for improved linting capabilities
 - 🔄 [update] Upgrade `@storybook` packages to version 10.2.4 for the latest features and fixes
 - 🔄 [update] Upgrade `@stryker-mutator` packages to version 9.5.1 for better mutation testing
 - 🔄 [update] Upgrade `@types/node` to version 25.2.0 for compatibility with the latest Node.js features
 - 🔄 [update] Upgrade `@vitejs/plugin-react` to version 5.1.3 for improved React support in Vite
 - 🔄 [update] Upgrade `cspell` to version 9.6.3 for enhanced spell checking
 - 🔄 [update] Upgrade `eslint-plugin-react-dom` to version 2.9.3 for better React DOM linting
 - 🔄 [update] Upgrade `jsdom` to version 28.0.0 for the latest DOM features
 - 🔄 [update] Upgrade `knip` to version 5.83.0 for improved dependency management
 - 🔄 [update] Upgrade `storybook` to version 10.2.4 for the latest features and fixes
 - 🔄 [update] Upgrade `stylelint-plugin-defensive-css` to version 1.1.1 for better CSS linting
 - 🔄 [update] Upgrade `stylelint-plugin-use-baseline` to version 1.2.2 for improved CSS baseline checks
 - 🔄 [update] Upgrade `vite-bundle-analyzer` to version 1.3.4 for enhanced bundle analysis

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(508dd22)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/508dd2255e740fdb652d6a890d68aac15e032547)


- 🔧 [build] Update ESLint configuration and dependencies
 - 🆕 Add `eslint-plugin-eslint-plugin` to enhance linting capabilities
 - 🛠️ Modify ESLint config to include new plugin settings for improved rule management
 - 🔄 Remove unused `eslint-plugin-github` import for cleaner code

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(206552b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/206552b1756a5216597d9a88bf30895081886eaf)


- 🔧 [build] Update TypeScript configuration files for improved build info management
 - 🛠️ Update `tsBuildInfoFile` paths in multiple TypeScript configuration files to ensure consistency
 - 🛠️ Adjust `declarationDir` paths in `.storybook/tsconfig.json` and `docs/docusaurus/tsconfig.json` for better organization
 - 🛠️ Modify `tsBuildInfoFile` paths in benchmark and testing configurations to align with new directory structure

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fcf6daa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fcf6daa5fecd39ef8597474eae75d78efe9a3b9e)


- 🔧 [build] Refactor Knip configuration to simplify dependency ignore patterns
 - Consolidated ignore patterns for various dependencies using wildcards for better maintainability
 - Cleared out unnecessary entries in the ignoreUnresolved array for cleaner configuration
📝 [docs] Update ESLint configuration comment for clarity
 - Added clarification to the "prettier/prettier" rule to indicate usage in Prettier directly for reduced noise in AI

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6fee1f8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6fee1f850712770d13ed4d8940de7cae221f7036)






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



### 🚜 Refactor

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






## [19.1.0] - 2025-11-26


[[32bba34](https://github.com/Nick2bad4u/Uptime-Watcher/commit/32bba346aaa6fb24ffab74b2624586be43673ffb)...
[3b43b50](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3b43b504ee555122a743752534238a1d9387d2d7)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/32bba346aaa6fb24ffab74b2624586be43673ffb...3b43b504ee555122a743752534238a1d9387d2d7))


### ✨ Features

- ✨ [feat] Enhance testing configurations and add property-based tests
 - 🧪 [test] Update tsconfig to include strict test directories for better coverage
 - 🧪 [test] Introduce fast-check for property-based testing in monitor operations and validation schemas
 - 🧪 [test] Add comprehensive property tests for monitor identifiers and status validation
 - 🧪 [test] Improve test coverage for monitor operations with randomized input testing
 - 🧪 [test] Extend vitest configuration to include strict test directories

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c851e5a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c851e5a3cfe62b34ef946fabecb6742b8623f0e2)


- ✨ [feat] Enhance Docusaurus backup workflow and linting configuration
 - 🛠️ Update backup workflow to include environment variables for backup repository and branch
 - 🔄 Remove redundant remote addition steps and streamline backup process
 - 📝 Add checks for GITHUB_TOKEN in backup steps to ensure proper configuration
 - 🧹 Sync documentation artifacts to backup repository using rsync for cleaner management
 - 🔧 Update ActionLint configuration to include necessary secrets for enhanced security

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f339a66)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f339a6693e141ef67f6026a7ebfe4554962dca37)


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



### 📝 Documentation

- 📝 [docs] Update README to include contributors section
 - Added All Contributors badge to README
 - Listed contributors with their respective contributions and links
 - Updated last modified date to November 2025 and version to 18.0.0

🔧 [build] Update package-lock.json and package.json for new dependencies
 - [dependency] Updateed version from 18.7.0 to 18.8.0 in package-lock.json and package.json
 - Added all-contributors-cli as a dependency in package.json
 - Added remark-ignore as a dependency in package.json
 - Updated various dependencies in package-lock.json

🧹 [chore] Modify linting configuration in .yamllint
 - Adjusted rules for comments-indentation, document-start, and document-end
 - Enabled checks for float-values and octal-values
 - Updated key-duplicates and key-ordering rules for better structure
 - Disabled truthy checks for flexibility with CI/CD configurations

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6747906)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/67479062c69d367287022e80760c2e799d47e14a)



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


- 🔧 [build] Update configuration files for improved linting and schema validation
 - 🛠️ [fix] Modify .mega-linter.yml to include quotes around file paths and add default workspace
 - 🛠️ [fix] Enhance biome.json with new 'grit' assist configuration and set root to true
 - 🛠️ [fix] Add YAML schema references to cliff.toml, kics.yaml, and lychee.toml
 - 🛠️ [fix] Introduce npm-badges.json for GitHub integration with npm package details
 - 📝 [docs] Correct schema reference in typedoc.config.json and typedoc.local.config.json
 - 🔧 [build] Update package.json and package-lock.json with new type definitions for postcss
 - 🎨 [style] Add typedoc-plugin-markdown.json for enhanced documentation generation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4c29fc6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4c29fc698149e8fc8944d9d07d518221e04415fa)


- 🔧 [build] Update configuration files for improved linting and schema validation
 - 🛠️ [fix] Add maxFileSize setting to .cspell.json for better file handling
 - 📝 [docs] Include schema reference in .devskim.json for enhanced validation
 - 🔧 [build] Extend .djlintrc with additional formatting options for better code style enforcement
 - 📝 [docs] Add schema reference in .editorconfig for consistent coding styles
 - 🛠️ [fix] Include schema in .madgerc for improved configuration validation
 - 📝 [docs] Add schema reference in .remarkrc.mjs for better markdown linting
 - 📝 [docs] Include schema reference in .checkov.yml for enhanced security scanning
 - 📝 [docs] Add schema reference in .grype.yaml for improved vulnerability scanning
 - 📝 [docs] Include schema in .secretlintrc.json for better secret detection
 - 📝 [docs] Add schema reference in ActionLintConfig.yaml for enhanced linting
 - 🛠️ [fix] Remove outdated schema from jscpd.json and add pattern for better duplication detection
 - ✨ [feat] Create node.config.json for enhanced Node.js configuration management
 - ✨ [feat] Add npm-badges.json for improved npm package badge management

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(32bba34)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/32bba346aaa6fb24ffab74b2624586be43673ffb)






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



### 🎨 Styling

- 🎨 [style] Enhance Remark configuration with additional plugin types and options
 - Added missing plugin types for better type safety and clarity
 - Updated existing type definitions for consistency
 - Improved comments for better understanding of configuration purpose
🔧 [build] Update package dependencies for Remark plugins
 - Added new dependencies for linting and markdown processing
 - Ensured compatibility with existing tools and configurations

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8a42b88)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8a42b887cc2ed9adde58d1fb4ea6c3e1c46d0940)



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






## [18.7.0] - 2025-11-16


[[f3c3362](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f3c33621152d7d92e19de018a3d2d05411dc8cea)...
[f3c3362](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f3c33621152d7d92e19de018a3d2d05411dc8cea)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/f3c33621152d7d92e19de018a3d2d05411dc8cea...f3c33621152d7d92e19de018a3d2d05411dc8cea))


### ✨ Features

- ✨ [feat] Introduce electron-builder configuration and update build scripts
 - 🛠️ [fix] Update build commands in package.json to use new electron-builder config
 - 📝 [docs] Add electron-builder.config.ts for centralized build configuration
 - 🔧 [build] Modify Build.yml to handle macOS universal builds by removing optional native dependencies
 - 🧪 [test] Enhance main.test.tsx to verify error handling during application initialization
 - 🧹 [chore] Update tsconfig.configs.json and eslint.config.mjs to include new electron-builder config
 - 🔧 [build] [dependency] Update version 18.6.0 in package.json and package-lock.json

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f3c3362)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f3c33621152d7d92e19de018a3d2d05411dc8cea)






## [18.5.0] - 2025-11-16


[[9baac00](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9baac00ca9c88ebb45a33d1ee25f694a87da716b)...
[a271f8a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a271f8aa5516cee2d7604a6ace12612a5a51be81)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/9baac00ca9c88ebb45a33d1ee25f694a87da716b...a271f8aa5516cee2d7604a6ace12612a5a51be81))


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


[[d63ea4e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d63ea4e6c9582ea3ecc2002d1042ddfc9b56e235)...
[2b14f01](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2b14f0111b29fc307052ea69b99b90f9e7d6bcc5)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/d63ea4e6c9582ea3ecc2002d1042ddfc9b56e235...2b14f0111b29fc307052ea69b99b90f9e7d6bcc5))


### ✨ Features

- ✨ [feat] Update configuration schemas and tools
 - 🔧 [build] Change schema URL in generic.schema.json to raw GitHub link for better accessibility.
 - 📝 [docs] Update cliff.toml to point to the new schema URL and improve formatting for readability.
 - 📝 [docs] Modify lychee.toml to use the new schema URL and enhance formatting consistency.

🎨 [style] Refactor eslint.config.mjs
 - 🧹 [chore] Adjust ignore patterns to include all subdirectories under .cache.

🛠️ [fix] Enhance run-storybook-tests script
 - 🔧 [build] Add local storage handling for Storybook tests to improve test consistency.
 - 🛠️ [fix] Ensure local storage directory is created if it doesn't exist.

🧪 [test] Add specialized monitor type tests
 - 🧪 [test] Implement tests for CDN edge consistency, DNS records, and replication monitors to ensure correct display identifiers.

⚡ [perf] Optimize monitor title formatting
 - 🛠️ [fix] Update titleSuffixFormatters to prefer baseline URL and replica status URL for better monitor identification.

🧹 [chore] Clean up test runner configurations
 - 🧹 [chore] Adjust Jest configuration to use default export from Storybook test runner config.
 - 🧹 [chore] Remove unnecessary environment setting in vitest.storybook.config.ts.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1487dc7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1487dc76e76eeadd3f1c542998af53cf9d998b9f)


- ✨ [feat] Introduce optimistic monitoring locks and enhance site store functionality
 - 🛠️ [fix] Refactor `useSitesStore` to streamline state actions and improve type handling
 - 🆕 [new] Add `OptimisticMonitoringLock` interface and `buildMonitoringLockKey` utility for managing optimistic locks
 - 🧪 [test] Update tests for `AddSiteForm` to improve input handling and ensure robust coverage
 - 🧪 [test] Enhance input fuzzing tests for `AddSiteForm` to validate user input handling
 - 🧪 [test] Comprehensive tests for `useSelectedSite` and `useSiteSync` to include optimistic monitoring locks
 - 🧪 [test] Update mock store implementations to include optimistic monitoring locks for consistency
 - 🎨 [style] Modify animation keyframes to use percentage values for opacity for better clarity
 - ⚡ [perf] Optimize stylelint configuration for improved performance and stricter linting rules
 - 👷 [ci] Increase startup timeout for Vitest configurations to accommodate slower environments

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3f51866)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3f51866d9dfd59bbab17831e78348e08fc6f74aa)


- ✨ [feat] Enhance configuration and testing coverage
 - 🔧 [build] Update Knip configuration to include additional files for dependency analysis
 - 🎨 [style] Refactor Docusaurus config to use ESM paths for client modules
 - 🧪 [test] Add strict regression tests for Docusaurus configuration
 - 🧪 [test] Implement strict coverage tests for NotificationPreferenceService
 - 🧪 [test] Add strict coverage tests for monitor identifier utilities
 - 🧪 [test] Introduce strict edge-case coverage for monitor title formatter utilities

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0e30778)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0e307788ca50503c23e343ba376a1545ca3ef73b)


- ✨ [feat] Add generic schema and update configuration files
 - 📝 Create a new JSON schema for cliff.toml and lychee.toml configuration files
 - 🔧 Update cliff.toml to include schema reference and additional metadata
 - 🔧 Modify lychee.toml to include schema reference and configuration details
 - 🔧 Enhance repomix.config.json with new options for logging and directory structure

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d918210)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d918210e861c65096d4c87a3cc3826ffc90c0309)


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



### 🎨 Styling

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

- 🧹 [chore] Normalize configs, docs, tooling and CI outputs

 - 👷 [ci] Expose bump-version outputs in Build workflow (write new_version and patch to GITHUB_OUTPUT) so downstream steps can reliably consume them
 - 🧹 [chore] .editorconfig — convert tabs → spaces across scopes, harmonize indent sizes and increase max_line_length for source (160) and markdown (1000) for better formatting tolerance
 - 🛠️ [fix] eslint.config.mjs — enable additional lint rules to enforce project conventions: uptime-watcher/prefer-app-alias, package-json/scripts-name-casing, @eslint-react/jsx-dollar
 - ✨ [feat] mermaid.config.json — overhaul diagram configuration (larger fonts, paddings, useMaxWidth, improved axis/chart/kanban/quadrant/radar settings and other layout tweaks) to produce clearer diagrams
 - 🧹 [chore] Tooling config updates:
   - 🧹 [chore] config/tools/.markdown-link-check.json — remove $schema entry and ensure replacementPatterns is present
   - 🧹 [chore] config/tools/lychee.toml — normalize array formatting, reorder fallback_extensions, tidy accept/exclude lists and add common URL excludes
   - 🧹 [chore] .lycheeignore — append common URL patterns to ignore list
 - 📝 [docs] README.md — standardize markdown (replace mixed HTML/bold with consistent emphasis, convert feature tables/lists to readable bullet lists, add separators) for improved readability
 - 📝 [docs] SECURITY.md — normalize list bullets and emphasis for consistent documentation style
 - 📝 [docs] .github/ISSUE_TEMPLATE — standardize schema to GitHub Issue Forms (schemastore issue-forms.json) for bug_report, custom_issue and add missing schema to feature_request
 - 🧹 [chore] .cspell.json — remove redundant "json" reporter to reduce output noise
 - 🧹 [chore] .github/FUNDING.yml — sanitize custom funding placeholder (use example URL)
 - 🧹 [chore] .github/agents/BeastMode.agent.md — reorder/standardize tools list for consistency
 - 🧹 [chore] config/linting/ActionLintConfig.yaml — support .{yml,yaml} globs and tighten ignore regexes for shellcheck/permission warnings
 - 🧹 [chore] package.json — normalize license field to "UNLICENSED"

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d63ea4e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d63ea4e6c9582ea3ecc2002d1042ddfc9b56e235)



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

 - 🔄 Update "@cspell/cspell-bundled-dicts" from "^9.3.0" to "^9.3.1"
 - 🔄 Update "@cspell/cspell-types" from "^9.3.0" to "^9.3.1"
 - 🔄 Update "@eslint-react/eslint-plugin" from "^2.3.4" to "^2.3.5"
 - 🔄 Update "@types/node" from "^24.10.0" to "^24.10.1"
 - 🔄 Update "@types/react" from "^19.2.3" to "^19.2.4"
 - 🔄 Update "@types/react-dom" from "^19.2.2" to "^19.2.3"
 - 🔄 Update "@types/validator" from "^13.15.4" to "^13.15.8"
 - 🔄 Update "@vitejs/plugin-react" from "^5.1.0" to "^5.1.1"
 - 🔄 Update "cspell" from "^9.3.0" to "^9.3.1"
 - 🔄 Update "eslint-plugin-depend" from "^1.3.1" to "^1.4.0"
 - 🔄 Update "eslint-plugin-package-json" from "^0.65.3" to "^0.74.0"
 - 🔄 Update "eslint-plugin-react-dom" from "^2.3.4" to "^2.3.5"
 - 🔄 Update "eslint-plugin-react-hooks-extra" from "^2.3.4" to "^2.3.5"
 - 🔄 Update "eslint-plugin-react-naming-convention" from "^2.3.4" to "^2.3.5"
 - 🔄 Update "eslint-plugin-react-web-api" from "^2.3.4" to "^2.3.5"
 - 🔄 Update "eslint-plugin-testing-library" from "^7.13.3" to "^7.13.4"
 - 🔄 Update "jsdom" from "^27.1.0" to "^27.2.0"
 - 🔄 Update "knip" from "^5.69.0" to "^5.69.1"
 - 🔄 Update "node-abi" from "^4.17.0" to "^4.23.0"

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6a44b3b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6a44b3bf4526dd108222cd38f887cfc754e1ad5e)


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






## [18.0.0] - 2025-11-04


[[eb4d9b5](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eb4d9b52abcbbde27a8215e671bd17ef3f23e80b)...
[292b064](https://github.com/Nick2bad4u/Uptime-Watcher/commit/292b0646abe164bd68c56d4e555948f8e19cbda4)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/eb4d9b52abcbbde27a8215e671bd17ef3f23e80b...292b0646abe164bd68c56d4e555948f8e19cbda4))


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


- 🧹 [chore] Normalize tooling/config metadata, tighten CI/build steps, and add jscpd leveldb store

👷 [ci] Use deterministic installs for mutation testing
 - 🔧 Replace `npm install --force` → `npm ci` in Stryker workflow for reproducible installs before mutation testing

🔧 [build] Harden Flatpak build script & safety checks
 - 🛡 Consolidate many build-commands into a single `set -e` script block to fail fast and improve logging
 - 📁 Ensure app dirs, copy/permissions, wrapper script, desktop/metainfo/icons installation and desktop validation are robust
 - ♻️ Trim/normalize file operations and add final validation/reporting steps

🧹 [chore] Add schema hints, editor metadata & tidy IDE configs
 - ✨ Add name/description front-matter to Copilot instruction files (.github/copilot-instructions*.md)
 - 🧾 Add/standardize $schema / yaml-language-server comments across dependabot, markdown-link-check, grype, yamllint and other configs
 - 🛠 Add $schema to .vscode launch & tasks, and add unwantedRecommendations to .vscode/extensions.json

🧹 [chore] Linting & formatter config improvements
 - 🧹 Reformat and enrich .taplo.toml (column_width, newline_at_eof, compact_inline_tables, rule blocks) for consistent formatting
 - 🧹 Tidy .htmlhintrc ordering and update biome.json to use latest schema
 - 🔁 Enhance config/linting/jscpd.json (moved keys, ignoreCase, maxLines, reporters, reportersOptions badge, silent/store options)

🧹 [chore] Add centralized markdown ignore
 - 📁 Add config/linting/.markdownlintignore to centralize markdown ignore patterns

🧹 [chore] Expand test tsconfigs to include strict tests
 - ✅ Add ../../tests/strictTests/** entries to testing tsconfigs (electron + shared) so strict test suites are included in builds

🧹 [chore] Add @jscpd/leveldb-store & refresh lockfile
 - ➕ Add @jscpd/leveldb-store to package.json devDependencies and include corresponding leveldb-related packages in package-lock.json
 - 🏷 Remove empty optionalDependencies and add legacy bundleDependencies key for packaging compatibility

🎨 [style] Minor typing & formatting polish
 - 🧾 Add JSDoc typedef + typed export in commitlint.config.mjs and a small formatting polish in eslint.config.mjs
 - 🔍 Minor whitespace/order fixes in .storybook tsconfig and ActionLint workflow

 - 💡 Overall: configuration hygiene, schema metadata and reproducible CI/build behaviour; no functional app source changes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a7ddf28)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a7ddf2829b7718c550fd676e0a44b94c4f555886)



### 👷 CI/CD

- 👷 [ci] Refine BeastMode automation prompts, add TODO workflows, add wiki schema, and tweak configs
 - 📝 [docs] Add .github/prompts/Add-ToDo.prompt.md — detailed TODO creation workflow and storage guidance (TODO.md)
 - 📝 [docs] Add .github/prompts/Continue.prompt.md — continuation checklist for resuming and completing TODO items
 - 👷 [ci] Update .github/agents/BeastMode.agent.md — split ToDo flow: reference Add-ToDo and new Continue prompts, adjust prompts/labels
 - 📝 [docs] Clarify scope in several prompts (Consistency-Check and Generate-100%* files) by inserting a generic note about usage and scope
 - 🧹 [chore] Add config/schemas/devin-wiki.schema.json and reference it from .devin/wiki.json to enable JSON-schema validation for the wiki
 - 🔧 [build] Update vite.config.ts to exclude "**/assets/**" from scanning to avoid processing static asset folders
 - 📝 [docs] Minor header doc tweak in eslint.config.mjs (add @see link for schema reference)

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(81704ce)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/81704ce76ad0450656b9faa21014cf01b6a3da0d)


- 👷 [ci] Centralize lint scripts, normalize .yamllint new-lines, and tidy Playwright workflow comment

 - 🧹 [chore] Replace inline npmPkgJsonLint/yamllint invocations with npm-run wrappers in package.json
   - Invoke lint:packagelintrc and lint:yaml from lint:all variants to centralize package/yaml linting and improve reuse
 - 🧹 [chore] Update lint:package to call lint:packagelintrc instead of running npmPkgJsonLint inline
 - 🧹 [chore] Adjust lint:yaml invocation order and add a completion echo for clearer CI output
 - 🧹 [chore] Normalize config/linting/.yamllint new-lines to "platform" (instead of "dos") and add minor formatting cleanup
 - 👷 [ci] Minor comment wrap in .github/workflows/playwright.yml for readability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a08175f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a08175f96c775041a19666886ebac609a12446f6)



### 🔧 Build System

- 🔧 [build] Add AllOtherRoot TS project and tighten TypeScript / tooling configs

 - 🔧 [build] Add config/testing/tsconfig.AllOtherRoot.json to centralize "other" root references and enable a consolidated tsc check; add package.json script check:other:all to run it
 - 🔧 [build] Expand config/testing/tsconfig.configs.json includes to cover vitest, storybook and vite config files so tooling/config scripts are type-checked
 - 🔧 [build] Include linting config patterns in config/testing/tsconfig.js.json and ensure config/testing/tsconfig.scripts.json declares rootDir for correct script resolution
 - 🔧 [build] Fix declarationDir in config/testing/tsconfig.test.json to point at .cache/builds/test/test/types (corrects emitted type output path)
 - 🚜 [refactor] Reduce repetitive // @ts-expect-error noise in eslint.config.mjs and replace with clearer, targeted comments where types are known to be mismatched
 - 🔧 [build] Harden root tsconfig.json: enable composite, adjust compiler flags, add excludes for temp/.cache/.coverage/storybook/storybook-static/out, tighten includes to src only, and add watchOptions to ignore noisy directories and improve watcher performance
 - 🔧 [build] Update vite.config.ts coverage excludes to omit shared/out/temp/.cache/.storybook/.coverage/storybook-static to avoid tooling/cache folders polluting coverage

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(eb4d9b5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eb4d9b52abcbbde27a8215e671bd17ef3f23e80b)






## [17.8.0] - 2025-10-30


[[9d8628e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9d8628e08372a0ad5fcbe46da73ccabdfe76e427)...
[12247c6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/12247c6e92c0e1cddac1116041543efd4c596c39)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/9d8628e08372a0ad5fcbe46da73ccabdfe76e427...12247c6e92c0e1cddac1116041543efd4c596c39))


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



### 🚜 Refactor

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


[[1740b43](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1740b435af453124cbe19b5142f69932a4734b7e)...
[10d3f4e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/10d3f4e69cf53d0bf04537ce88d357c64713fa29)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1740b435af453124cbe19b5142f69932a4734b7e...10d3f4e69cf53d0bf04537ce88d357c64713fa29))


### ✨ Features

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






## [16.7.0] - 2025-10-11


[[1ec4440](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1ec44405b1a0506a66ef7489620422c555b863f1)...
[d9c62fd](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9c62fd22d7af27284eeeff8fa788ad5896aba80)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1ec44405b1a0506a66ef7489620422c555b863f1...d9c62fd22d7af27284eeeff8fa788ad5896aba80))


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


- ✨ [feat] Integrate Storybook for UI development

Adds Storybook to the project to facilitate UI component development and testing.

- 🔧 **ESLint**:
  - Integrates `eslint-plugin-storybook` to enforce best practices for Storybook stories.
  - Applies the recommended rule set for files matching the `*.stories.*` pattern.
  - Disables the `import-x/no-anonymous-default-export` rule specifically for story files, as this pattern is standard in Storybook's Component Story Format (CSF).
  - Includes minor code formatting adjustments throughout the configuration file.

- 🧪 **TypeScript**:
  - Updates `tsconfig.test.json` to include the `.storybook` directory, ensuring Storybook configuration files are correctly type-checked within the test environment.

- 🧹 **Git**:
  - Updates `.gitignore` to exclude Storybook log files and the static build output directory (`storybook-static`).

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9d35b8d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9d35b8d7b52738a781f1137cd76339dc32ec16ee)


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


- 🧪 [test] Remove comprehensive Playwright E2E and integration tests

Removes extensive accessibility, integration, user flow, and compatibility
test suites from Playwright, including advanced WCAG, bulk operations,
data migration, navigation, and cross-browser scenarios.

Cleans up test configuration and references, streamlines the test environment,
and eliminates large test files to reduce build time and maintenance overhead.

Minor enhancements to existing helpers and templates for type safety and
robustness, ensuring remaining tests run efficiently.

 - Motivated by the need to simplify and focus automated test coverage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(dfae2ed)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dfae2ed51c31fb809ea8f41c49274ac03af02b5f)


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


- 🧹 [chore] Migrate Knip config to TypeScript and improve linting flow

- Migrates Knip configuration from JSON to TypeScript for enhanced type safety and maintainability.
- Updates linting scripts to use the new TypeScript config and streamlines the lint:all job for greater efficiency.
- Improves documentation and markdown lint configs with clearer type annotations and disables unused var warnings for MDX pages.
- Expands TypeScript project references to include new Knip config locations, ensuring unified tooling support.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(75b9c5c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/75b9c5c7b36ea4fb54d9749736a73dbf6f1857ba)


- 🧹 [chore] Remove lint-staged and Husky pre-commit tooling

- Cleans up legacy pre-commit linting and formatting setup to streamline development workflow.
- Deletes configuration, scripts, and dependencies related to lint-staged and Husky.
- Updates linting rules to allow usage of certain process.env variables, improving clarity and safety in environment checks.
- Simplifies Playwright test environment config by removing redundant test mode variable.
- Improves maintainability and reduces unnecessary dependencies.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(59406d5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/59406d599b40fe124e25c1615a97ed3f4ac03469)



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






## [14.8.0] - 2025-09-14


[[7b94508](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b94508b00f9c6869f0b75c2cb4b01e5ad9357d4)...
[7b94508](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b94508b00f9c6869f0b75c2cb4b01e5ad9357d4)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/7b94508b00f9c6869f0b75c2cb4b01e5ad9357d4...7b94508b00f9c6869f0b75c2cb4b01e5ad9357d4))


### 🧪 Testing

- 🧪 [test] Improve store, service, and component coverage

- Adds critical coverage test suites for store functions, service error handling, and edge cases in hooks and components
- Targets previously uncovered logic, invalid states, and boundary conditions to raise overall coverage
- Updates workflows for stricter concurrency control and output auditing
- Refines Playwright and Stryker testing logic for reliability and reporting
- Adjusts coverage and build config for more accurate reporting and exclusion of interface-only files

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7b94508)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b94508b00f9c6869f0b75c2cb4b01e5ad9357d4)






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



### 🧪 Testing

- 🧪 [test] Improve fuzzing reliability and coverage for input, error, and validation tests

- Refactors property-based fuzzing tests to reduce timeouts, shrink run counts, and optimize DOM interactions for better reliability and speed
- Adds comprehensive edge case coverage for AddSiteForm user input boundaries, including site name, URL, host, and port fields, with aggressive cleanup to prevent flaky behavior
- Updates error handling, type guard, and JSON safety fuzzing to account for normalization differences and avoid false negative assertions on empty/invalid cases
- Improves validation tests to mock dependencies, handle invalid monitor types, and reduce brittle test failures
- Tweaks global and per-test fast-check timeouts for more robust CI performance
- Clarifies and strengthens assertions to focus on practical user input and realistic boundary conditions

Relates to stability and coverage improvements for property-based test suites

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f368113)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f3681134738fe7a1d1084fde651fcaf9af74d546)


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



### 🔧 Build System

- 🔧 [build] Restructures config files for clarity and consistency

- Reorders, deduplicates, and aligns keys in various config and JSON files to improve readability and maintainability.
- Harmonizes the structure of TypeScript, ESLint, Biome, markdownlint, and other tool configs, enhancing consistency across environments.
- Adjusts script definitions and disables/enables relevant lint rules for accuracy, flexibility, and future-proofing.
- Improves test, lint, and install script clarity, grouping related commands and updating disables to match project needs.
- Expands external documentation mappings for Typedoc to boost developer experience.
- Facilitates easier updates, merges, and onboarding by standardizing configuration formatting and option order.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ef7fd61)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ef7fd617dbfd2ee709df8bc5bb864f0ab83d76d9)






## [13.7.0] - 2025-09-04


[[b1e82fd](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b1e82fdaec2947a9199154361f97b03d9ad889b2)...
[b1e82fd](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b1e82fdaec2947a9199154361f97b03d9ad889b2)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/b1e82fdaec2947a9199154361f97b03d9ad889b2...b1e82fdaec2947a9199154361f97b03d9ad889b2))


### 🛠️ Other Changes

- Add comprehensive tests for useMonitorTypesStore and ThemedProgress component

- Introduced a new test suite for useMonitorTypesStore with 100% coverage, focusing on store initialization, loading monitor types, error handling, validation, formatting operations, and state management.
- Added arithmetic mutation tests for ThemedProgress component to detect potential issues in percentage calculation logic, including edge cases and bounds checking.
- Enhanced useSiteAnalytics tests to cover downtime period calculations, MTTR computation, and percentile index clamping, ensuring robustness against arithmetic mutations.
- Updated Vite configuration to exclude additional directories and files from coverage reports, improving accuracy in test coverage metrics.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b1e82fd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b1e82fdaec2947a9199154361f97b03d9ad889b2)






## [13.4.0] - 2025-08-31


[[d11aa22](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d11aa22e8b1c6266df5a93dbd32fa3ab53c59e4c)...
[6b7569c](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6b7569c64aa93dc9c52c6d0ca4d24723cc5438f6)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/d11aa22e8b1c6266df5a93dbd32fa3ab53c59e4c...6b7569c64aa93dc9c52c6d0ca4d24723cc5438f6))


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



### 📝 Documentation

- 📝 [docs] Document type-fest patterns; update build, lint, and test configs

- Adds detailed documentation for consistent type-fest utility integration, promoting enterprise-grade type safety and improved DX.
- Updates testing and build configs for better cache management, chunk splitting, coverage, and typecheck reliability.
- Refines ESLint, Vite, and Vitest configs to support modern workflows, explicit aliasing, and coverage thresholds.
- Improves agent instructions for clarity, quality standards, and architecture practices.
- Removes outdated tool documentation and enables stricter linting for improved maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(40606e2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/40606e28afba0e02dc44578299ca8c4b4b704d3b)



### 🎨 Styling

- 🎨 [style] Improve error message formatting and code consistency

- Enhances readability by splitting long error message assignments across multiple lines in scripts and tests.
- Updates formatting for array iteration blocks to follow consistent code style.
- Reformats JSON configuration for improved clarity and maintainability.
- Aims to reduce visual clutter and make future edits easier.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6b7569c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6b7569c64aa93dc9c52c6d0ca4d24723cc5438f6)






## [13.1.0] - 2025-08-27


[[f5b4450](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f5b4450b1d541f249469a33f89d10c1eabb88a74)...
[66902c6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66902c61900ca257b94ca76866a8499f28ef3821)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/f5b4450b1d541f249469a33f89d10c1eabb88a74...66902c61900ca257b94ca76866a8499f28ef3821))


### 🚜 Refactor

- 🚜 [refactor] Centralizes config files under config directory

Moves various tool and linter configuration files into organized subfolders within a unified config directory for improved maintainability and discoverability.

Updates scripts, CI workflows, ignore lists, and references to use new config paths, ensuring consistency and reducing file clutter at the project root.

Upgrades ESLint plugin dependency and corrects related script invocations for better alignment with dependency management.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(48531dd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/48531ddf14e7f0a9415de1f7acb2489c2b1a2eb9)



### 📝 Documentation

- 📝 [docs] Revamps README with enhanced feature overview and project details

- Improves documentation clarity and visual appeal with detailed feature tables, architecture diagrams, badges, and screenshots
- Expands sections on technology stack, core capabilities, monitor types, and contribution guidelines
- Adds quick start instructions, development setup, and comprehensive architecture explanation to aid onboarding
- Relocates Flatpak build configuration for organizational consistency

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3a3ec7c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3a3ec7c3caffb931a923ff33fe87f295da6a2343)



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

- 🧪 [test] Migrate shared tests to Vitest globals and update setup

- Replaces legacy Jest context and fail function usage with Vitest's built-in globals in shared and frontend tests.
- Adds Vitest setup files for test context injection and updates test environment configuration for improved consistency.
- Removes obsolete Jest types and dependencies from configs and lockfile for leaner dev tooling.
- Updates TypeScript and ESLint package versions for compatibility with latest Vitest and lint rules.
- Fixes test reliability by mocking Date.now in timestamp tests for deterministic results.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e12e07b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e12e07ba24a984719bd998388d22a537d05e6199)



### 🧹 Chores

- 🧹 [chore] Streamline config, optimize ESLint structure, add JS build tsconfig

- Refactors ESLint flat config for better maintainability, clarity, and plugin ordering, ensuring more granular overrides for file types.
- Adds dedicated TypeScript config for JavaScript build scripts to improve type safety and build separation.
- Updates Prettier and VS Code settings to support new config structures and enhance formatting consistency.
- Cleans up TOML configuration files for changelogs and secrets scanning, improving readability and postprocessing reliability.
- Improves plugin settings for Docusaurus, TailwindCSS, and package linting, reducing false positives and supporting modern frameworks.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b532e66)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b532e6637d22b59a4cf525f864f714aef34fd48a)



### 🔧 Build System

- 🔧 [build] Update Flatpak build paths and ESLint config structure

- Streamlines Flatpak build workflow by relocating manifest and updating references for improved maintainability.
- Adds detailed section headers in ESLint config to clarify rules scope and organization.
- Expands boundaries settings with fine-grained type capture for better code architecture enforcement.
- Adjusts plugin and rule usage to reduce noise and enhance clarity in linting, including tweaks for test and config files.
- Temporarily disables YAML key sorting in manifest to prevent build issues.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(66902c6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66902c61900ca257b94ca76866a8499f28ef3821)


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






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/Uptime-Watcher/graphs/contributors) for their hard work!
## License
This project is licensed under the [UnLicense](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/LICENSE)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
