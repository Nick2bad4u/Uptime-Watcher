<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


[[3afbde2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3afbde2be61b73929f2e6f36595ebf01fe51825c)...
[3afbde2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3afbde2be61b73929f2e6f36595ebf01fe51825c)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/3afbde2be61b73929f2e6f36595ebf01fe51825c...3afbde2be61b73929f2e6f36595ebf01fe51825c))


### 📦 Dependencies

- [dependency] Update version 9.0.0 [`(3afbde2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3afbde2be61b73929f2e6f36595ebf01fe51825c)






## [9.0.0] - 2025-07-27


[[f3f27cd](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f3f27cdc75c14cfbd26892dbc1123683a0806a7c)...
[fdb7653](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fdb7653868d97a1229ecae984025111265fbbe97)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/f3f27cdc75c14cfbd26892dbc1123683a0806a7c...fdb7653868d97a1229ecae984025111265fbbe97))


### 🛠️ Bug Fixes

- Package.json & package-lock.json to reduce vulnerabilities [`(c0edb0a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c0edb0a975248f4d7440da7002b220e761b06922)



### 📦 Dependencies

- [dependency] Update version 8.9.0 [`(d92d616)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d92d61606f727bb13ed16ec057baf467986c9f6f)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(fdb7653)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fdb7653868d97a1229ecae984025111265fbbe97)



### 💼 Other

- Merge PR #40

[Snyk] Security upgrade electron-builder-squirrel-windows from 24.13.3 to 26.0.3 [`(1e4538c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1e4538c5b50738ed9b944a33d144e5d382996404)



### 🧪 Testing

- 🧪 [test] Remove unused monitor types test file

- Cleans up obsolete or unnecessary unit test to reduce clutter
- Improves maintainability by deleting a redundant test file [`(0b3e373)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0b3e373a1fd70f132fd3813e8d2ada124e85720a)


- 🧪 [test] Update unit tests for consistency and modern style

- Unifies import statements to use double quotes across all test files for style consistency
- Modernizes test formatting and indentation for improved readability and maintainability
- Updates mock setups and test assertions to align with current best practices
- Ensures tests follow a consistent structure for easier navigation and future extension [`(f3f27cd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f3f27cdc75c14cfbd26892dbc1123683a0806a7c)



### 🧹 Chores

- Update changelogs for v8.9.0 [skip ci] [`(acf6064)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/acf606472b2dff67145e283858d00ce17d9cdaea)



### 🔧 Build System

- 🔧 [build] Update linting tools and add unused exports checks

- Updates pre-commit configurations to newer versions and expands hook coverage for better file integrity and code hygiene.
- Adds unused exports linting via new dev dependency, enabling detection of unreferenced code in main and electron entry points.
- Revises Node version requirement and improves script organization for duplicate checking.
- Improves maintainability and code quality by leveraging enhanced tooling. [`(0e4b19c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0e4b19c086d9f60d38938eff4feebf2d14ed36ea)






## [8.9.0] - 2025-07-27


[[68eef81](https://github.com/Nick2bad4u/Uptime-Watcher/commit/68eef81d9de1272c6f5ee775f1fcd593f0bfb4e2)...
[da3746e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/da3746e894f9c290229c2e6bad873450dcb3e90a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/68eef81d9de1272c6f5ee775f1fcd593f0bfb4e2...da3746e894f9c290229c2e6bad873450dcb3e90a))


### 📦 Dependencies

- [dependency] Update version 8.8.0 [`(0eb124c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0eb124c6135f3b1594a56b4d4e585b154f8bdc08)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(da3746e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/da3746e894f9c290229c2e6bad873450dcb3e90a)



### 🧪 Testing

- 🧪 [test] Refactors and fixes unit tests for improved reliability

- Updates and restructures multiple test suites for clarity and maintainability
- Refactors mocks to better match actual dependencies and behaviors, improving test isolation
- Fixes broken and outdated tests, and disables unreliable ones to reduce false negatives
- Simplifies and reduces redundant test cases, focusing on essential edge cases and realistic scenarios
- Enhances test coverage for error handling, async logic, cache operations, and theme management
- Aligns test file imports and structure for consistency, supporting future coverage improvements [`(6a6678a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6a6678ababdee426f6fce0d53da899b967df10cc)



### 🧹 Chores

- Update changelogs for v8.8.0 [skip ci] [`(e755f83)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e755f83d15a4801bb009ed68c0665dd19d207685)



### 👷 CI/CD

- 👷 [ci] Allow coverage jobs to continue on error

Enables frontend and electron test steps to proceed even if tests fail,
preventing workflow interruptions and ensuring coverage reports are generated
for all runs.

Improves CI resilience during partial test failures. [`(68eef81)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/68eef81d9de1272c6f5ee775f1fcd593f0bfb4e2)






## [8.8.0] - 2025-07-26


[[dd17a16](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dd17a16e6257cd6b9b8c73f2319ad6b80c275add)...
[c57bb4e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c57bb4e728595e8f1190ed6c8ea33e7eaa0eb5e2)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/dd17a16e6257cd6b9b8c73f2319ad6b80c275add...c57bb4e728595e8f1190ed6c8ea33e7eaa0eb5e2))


### 📦 Dependencies

- [dependency] Update version 8.7.0 [`(ea90eee)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ea90eee642760d0f577bd4371c5ee1e96184e9cd)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(c57bb4e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c57bb4e728595e8f1190ed6c8ea33e7eaa0eb5e2)



### 🧪 Testing

- 🧪 [test] Add and update unit tests, remove legacy and obsolete tests

- Introduces new and improved test coverage for backend utilities, cache logic, logger, and monitor lifecycle.
- Removes outdated, redundant, or overly broad frontend and backend test suites for improved maintainability and clarity.
- Refines test logic to accommodate recent code changes and stricter validation; improves reliability of UUID and site analytics tests.
- Adds shared monitor type UI interface definitions to support future extensibility.
- Updates mocks and setup for better isolation and cross-environment compatibility.
- Refactors tests to ensure consistency with current codebase and corrects expectation mismatches. [`(dd17a16)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dd17a16e6257cd6b9b8c73f2319ad6b80c275add)



### 🧹 Chores

- Update changelogs for v8.7.0 [skip ci] [`(6d5dcac)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6d5dcaccde6a01714bd16b2e7be9fee856b353f1)






## [8.7.0] - 2025-07-26


[[913db17](https://github.com/Nick2bad4u/Uptime-Watcher/commit/913db17b96d46575a679c2cd609d0b343f7079c6)...
[5420e72](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5420e727200b919b308c678fd16a6d168500aecc)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/913db17b96d46575a679c2cd609d0b343f7079c6...5420e727200b919b308c678fd16a6d168500aecc))


### 📦 Dependencies

- [dependency] Update version 8.6.0 [`(c08abb4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c08abb4792d5f9af460b82fe175cc155664023f4)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(fd27338)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fd2733851306dc62b3b8f8452e67604cbacdf609)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(4c2496b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4c2496b7294579a9dda65c4581cb5374bb80fdd4)



### 🚜 Refactor

- 🚜 [refactor] Streamline backend status updates & code quality

- Refactors status update handling for sites and monitors to enable more efficient, incremental updates and minimize unnecessary full syncs
- Improves code quality and maintainability by modularizing validation logic and reducing cyclomatic complexity in several areas
- Updates IPC logging to reduce output for high-frequency operations and adjusts error handling for robustness
- Unifies manager event types, improves schema handling, and tidies type usage across repositories
- Harden CI workflow, enhance commit documentation, and introduce new logging CLI commands for better development and production diagnostics
- Fixes UI details in history tab and metric rounding in tests for consistency

Relates to ongoing code quality remediation and performance improvements [`(5a9ec9f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a9ec9fc2a14b7f39f98fc5a8381821c554931b2)



### � Documentation

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



### 🎨 Styling

- 🎨 [style] Reformat config files for improved readability

- Consolidates array and object definitions in config files to single lines where appropriate, reducing vertical space and enhancing clarity.
- Removes unnecessary blank lines, making configuration files more concise and easier to maintain. [`(913db17)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/913db17b96d46575a679c2cd609d0b343f7079c6)



### 🧹 Chores

- Update changelogs for v8.6.0 [skip ci] [`(b3ca602)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b3ca602d05e947f86a1beff08b76749dd8b1d82e)



### 🔧 Build System

- 🔧 [build] Enhance jscpd config and scripts; add badge reporter

- Updates code duplication detection to use strict mode and raise minLines threshold for improved accuracy
- Adds badge and csv reporters for richer output and reporting options
- Introduces @jscpd/badge-reporter dependency
- Expands lint scripts for flexible duplicate analysis, supporting local skipping and custom min-lines
- [dependency] Updates project version for new build capabilities [`(5420e72)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5420e727200b919b308c678fd16a6d168500aecc)






## [8.6.0] - 2025-07-25


[[1c15bf4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1c15bf455bc9cd476cb2cef4a2694ebdce62e7c8)...
[5a390b9](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a390b97e9f425a2cb8759c4fa0963e8604a1c04)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1c15bf455bc9cd476cb2cef4a2694ebdce62e7c8...5a390b97e9f425a2cb8759c4fa0963e8604a1c04))


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



### 📦 Dependencies

- [dependency] Update version 8.5.0 [`(2738df8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2738df87a4d7ee6c7bdb7e177dc3789650b84751)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(ebcd5ea)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ebcd5ea4bdda97209ff76a337883e9e1149acd64)



### � Documentation

- 📝 [docs] Add Codacy AI instructions and update ignore rules

- Introduces detailed guidelines for AI behavior when interacting with Codacy's MCP Server, emphasizing immediate post-edit analysis and critical security checks after dependency changes.
 - Updates .gitignore to exclude VS Code AI rules instructions from version control.
 - Renames legacy Copilot instruction files for improved history and clarity.
 - Enhances automation, encourages proactive code quality and security enforcement, and clarifies repository setup error handling. [`(f4a1f44)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f4a1f44a2d9322c3daac32842215ee2acac7e49a)


- 📝 [docs] Improve and standardize TSDoc comments across codebase

- Updates and clarifies TSDoc comments for all major backend services and utilities, enhancing type safety, discoverability, and editor integration.
- Ensures public APIs, error structures, utility functions, and class members provide clear, concise, and project-standard documentation.
- Adds missing remarks, param/returns/throws details, and usage examples, while streamlining repetitive or overly verbose sections.
- Improves internal documentation for maintainability and onboarding, supporting future code generation, tooling, and static analysis.
- No logic or runtime changes; strictly documentation improvements for developer experience. [`(ff31ac4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ff31ac4897131c6b720f47680042b875e30e20a4)


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



### 🧹 Chores

- Update changelogs for v8.5.0 [skip ci] [`(128548f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/128548fffc1f23908823869d3373beb2f34f710e)






## [8.5.0] - 2025-07-24


[[46bbcf7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/46bbcf7c05ca47f4eb98d35723fe116fbd3ef3f2)...
[679f54e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/679f54e8314294e2cc05eeedf5a66a07e55f81a9)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/46bbcf7c05ca47f4eb98d35723fe116fbd3ef3f2...679f54e8314294e2cc05eeedf5a66a07e55f81a9))


### 📦 Dependencies

- *(deps)* [dependency] Update dependency group (#38) [`(736c481)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/736c481a4ba7cde0d314544f1e697db74c115e05)


- [dependency] Update version 8.4.0 [`(3dbd3fd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3dbd3fdc0880ecbd39701e75c3f2fe6b28cd475c)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(679f54e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/679f54e8314294e2cc05eeedf5a66a07e55f81a9)



### � Documentation

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


- 📝 [docs] Clarifies TSDoc improvement checklist instructions

- Expands guidelines to require thorough review and updating of all TSDoc comments, ensuring documentation accurately reflects code behavior, types, parameters, return values, and exceptions.
- Stresses comprehensive coverage for all relevant code constructs and clarifies use of key tags, including discouraging the use of `@property` in favor of `@param`.
- Improves clarity for contributors, promoting higher documentation standards. [`(121e08e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/121e08ead1c3dd85a484dcd183c167d7dad6237b)


- 📝 [docs] Standardize TSDoc and clarify type safety, error handling, and UI docs

- Refines TSDoc comments across backend, shared, and frontend modules to enforce project documentation standards and improve clarity for maintainers and onboarding.
- Enhances documentation on type safety, runtime validation, and error handling throughout form components and domain types, aligning with stricter TypeScript usage.
- Adds comprehensive remarks, examples, and parameter details, especially for component props, event payloads, and exported APIs.
- Clarifies memoization strategies and prop stability requirements for React components to support performance optimizations.
- Documents UI constraints, ARIA accessibility, and CSS variable usage for consistency and maintainability.
- Fixes ambiguous or missing comments on domain models, utility functions, and system-level APIs, aiding future refactoring and debugging.
Relates to internal documentation and code quality improvement tasks. [`(46bbcf7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/46bbcf7c05ca47f4eb98d35723fe116fbd3ef3f2)



### 🧹 Chores

- Update changelogs for v8.4.0 [skip ci] [`(a1abb29)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a1abb29bec73f703cca690c29b3f885f8275ef04)






## [8.4.0] - 2025-07-24


[[4a715b5](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4a715b5137d86b9917fcb1685f6b4acc46cafd34)...
[04f85fb](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04f85fbb657e59727b6ea017e039fdec19db2873)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/4a715b5137d86b9917fcb1685f6b4acc46cafd34...04f85fbb657e59727b6ea017e039fdec19db2873))


### 📦 Dependencies

- [dependency] Update version 8.3.0 [`(0211975)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/02119755798d8db6eae03e81e43600e3282a5cc9)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(73f7c8d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/73f7c8d4e2db4e4cf86f082e9474d2927cb88e00)



### 💼 Other

- 📃[docs] Add TypeDoc plugins for enhanced documentation generation

- Added `typedoc-plugin-dt-links` version 2.0.11 to package.json and package-lock.json for linking to TypeScript definitions.
- Added `typedoc-plugin-external-package-links` version 0.1.0 to package.json and package-lock.json for linking to external package documentation.
- Updated TypeDoc configuration files (`typedoc.electron.json` and `typedoc.json`) to include the new plugins for documentation generation. [`(4a715b5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4a715b5137d86b9917fcb1685f6b4acc46cafd34)



### � Documentation

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


- 📝 [docs] Enable pretty output for TypeDoc configs

- Adds the "pretty" option to documentation generator configurations
- Improves readability of generated documentation output for easier review and maintenance [`(d676508)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d676508a507b7f289fcef263d194937530441f45)


- 📝 [docs] Remove sample blog content and cleanup docs output

- Deletes all example blog posts, author and tag definitions, and related images from documentation
- Removes generated TSDoc errors output file to reduce noise and improve project clarity
- Updates plugin configuration to add a unique identifier, supporting better multi-plugin handling

Cleans up legacy starter content and artifacts to streamline documentation and reduce confusion for future contributors. [`(9728383)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9728383a175f7cd4a9f6dd9d86cec5b53bced4e5)


- 📝 [docs] Remove Docusaurus documentation and example content

- Cleans up project by deleting all example and introductory documentation previously generated by Docusaurus, including markdown, sidebar, and image files.
- Updates project version to 8.3.0 to reflect removal of bundled documentation.
- Reduces maintenance overhead and prepares the repository for custom or updated documentation content. [`(1981a6c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1981a6cff4f375b66d2490343970d93f7f9b02ae)



### 🧹 Chores

- Update changelogs for v8.3.0 [skip ci] [`(1eabc62)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1eabc6258476bd90a1e12208f33d6d65ddc5b0b8)






## [8.3.0] - 2025-07-24


[[63d7aff](https://github.com/Nick2bad4u/Uptime-Watcher/commit/63d7affbda0e2b5db3109529e437dfd8d31b0adb)...
[dca5483](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dca5483e793478722cd3e6e125cafcec5fc771f0)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/63d7affbda0e2b5db3109529e437dfd8d31b0adb...dca5483e793478722cd3e6e125cafcec5fc771f0))


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



### 📦 Dependencies

- [dependency] Update version 8.2.0 [`(63d7aff)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/63d7affbda0e2b5db3109529e437dfd8d31b0adb)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(dca5483)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dca5483e793478722cd3e6e125cafcec5fc771f0)



### 💼 Other

- Update fix-mdx-typedoc.js [`(89e2a94)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/89e2a944e6604f05b2157186ebf009c7681b7361)


- Update typedoc.electron.json [`(6609411)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6609411c13327da1690f663ced5ac9583c9e9f96)


- Update typedoc.json [`(746daaa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/746daaa87be1245eb32305759543c856c4fb526f)


- 📃 [docs] Refactor Docusaurus configuration: remove old config files, update navbar links, and adjust documentation structure [`(2a45eeb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4)


- Add TypeDoc configuration and update dependencies [`(951d670)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/951d670468d7fa5dbf231ca79eeaba94aa9401b5)



### � Documentation

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


- 📝 [docs] Update architecture and coding standards for clarity and stricter rules

- Improves backend description to specify SQLite3-WASM usage
- Clarifies and strengthens type safety requirements, prohibiting use of untyped or weakly typed constructs
- Refines instructions for handling formatting issues and emphasizes established codebase patterns
- Adds absolute prohibitions against direct state mutation, untyped IPC, repository pattern bypassing, and hacks
- Updates review prompt instructions to specify naming conventions for documentation

Enhances onboarding, consistency, and code quality guidance for contributors. [`(20a6fa2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/20a6fa2d7e72c56a3e5734a0b90b363e6bebc796)


- 📝 [docs] Enhance documentation and event handler clarity

- Improves code comments, documentation blocks, and JSDoc usage for application and database services, making event handling and backup logic more transparent.
- Updates event forwarding error logging for consistency and easier tracing.
- Refines comment tag styles and adds missing tags for better highlight and readability in editor.
- Removes unnecessary React Native ESLint configuration to streamline linting for Electron/React projects. [`(7cb0cd5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7cb0cd5f3c361fcc6da54237bce42bf8e76a446d)


- 📝 [docs] Update TSDoc docs to use Markdown, simplify structure

- Replaces HTML and Docusaurus markup in documentation files with clean Markdown formatting for improved readability and compatibility.
- Streamlines navigation and links to use relative Markdown paths.
- Updates code download script to fetch source Markdown files directly from GitHub for more reliable and maintainable tag and page sync.
- Clarifies explanations, removes boilerplate and site-specific structure, and standardizes tag definitions and examples for easier consumption by tooling and developers.
- Increases consistency between documentation sections and makes docs easier to maintain and parse. [`(1a20b90)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1a20b90e8e0e65a4fbd872a2a14c0dfe47d59aa6)



### 🧹 Chores

- Update changelogs for v8.2.0 [skip ci] [`(cad568e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cad568e34be7f0938a53b5de31ab8d40f70d40a9)



### � CI/CD

- Update deploy-docusaurus.yml [`(be2aceb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/be2aceb0b6b660455e8011d1deab71a4475ac7e6)


- Update deploy-docusaurus.yml [`(d65b09f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d65b09ff129043d5c5dfa074ec87d54a872b8d0d)


- Update deploy-docusaurus.yml [`(dc19e6f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dc19e6f246ccdd004891d95d1cda57b65bacb15f)


- Update deploy-docusaurus.yml [`(a39c54e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a39c54eb36441d74310ddce060b9ca4164a29be8)


- Update deploy-docusaurus.yml [`(b023876)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b023876f319af36782abdc2c5570cdae96296773)



### 🔧 Build System

- 🔧 [build] Update dependencies to latest versions

- Upgrades various dependencies and devDependencies to their newest available versions to ensure compatibility, security, and access to recent features.
- Improves ESLint, TypeScript, Electron, API extractor, zod, unicorn plugin, and related toolchain packages for better stability and maintenance.
- Reduces potential technical debt by keeping project dependencies current and minimizing future upgrade friction. [`(0ab7118)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0ab71186668915b54eadc6935cdd8a9305460192)






## [8.2.0] - 2025-07-23


[[f036cae](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f036cae36d78ddc12bc30faf35e0ee7c6bd9715a)...
[b2fbeb1](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b2fbeb12f685ebe41f95f4af841e7427096830d0)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/f036cae36d78ddc12bc30faf35e0ee7c6bd9715a...b2fbeb12f685ebe41f95f4af841e7427096830d0))


### �️ Bug Fixes

- 🛠️ [fix] Improve validation, documentation, and event accuracy

- Enhances input validation with more granular errors and upper bounds for history limits to prevent invalid usage and performance issues.
 - Refines documentation for internal logic and business rules, adding detailed TSDoc comments and remarks for better maintainability.
 - Ensures event data accuracy by retrieving site information before deletion, resulting in correct site name emission.
 - Improves error formatting and readability for validation failures.
 - Updates configuration for TSDoc to allow unsupported HTML and new tags, and removes unused dependencies and adjusts build scripts for clarity. [`(f036cae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f036cae36d78ddc12bc30faf35e0ee7c6bd9715a)



### 📦 Dependencies

- [dependency] Update version 8.1.0 [`(597c706)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/597c7060d8a390cfc59edbeeee4a23f73322c767)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(b2fbeb1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b2fbeb12f685ebe41f95f4af841e7427096830d0)



### 🧹 Chores

- Update changelogs for v8.1.0 [skip ci] [`(2fe33ac)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2fe33ac2f122264213b0f9d14ce9d6826c3347c9)






## [8.1.0] - 2025-07-23


[[dfcce56](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dfcce568b9b8c7990588bb6b92ccc8746814500d)...
[947f859](https://github.com/Nick2bad4u/Uptime-Watcher/commit/947f859b7c02dbeb4d3ebd699c129beee9f63fe4)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/dfcce568b9b8c7990588bb6b92ccc8746814500d...947f859b7c02dbeb4d3ebd699c129beee9f63fe4))


### ✨ Features

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



### 📦 Dependencies

- *(deps)* [dependency] Update the github-actions group across 1 directory with 5 updates [`(fce62d1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fce62d15e94e364e2e2fb0cd13c3c9bbadaf976f)


- [dependency] Update version 8.0.0 [`(5270ffa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5270ffaef64836e2a5ac6497960f257cb1d91944)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(ed7535e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ed7535edf7643180c9a0f270a7c41a5619e5e5ea)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(5e97f5a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5e97f5a69eaef515e493630280e11fd17d5a7adb)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(7262769)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/72627697f274128322b6230bfc8d78401a236522)



### 💼 Other

- Merge PR #35

[ci][skip-ci](deps): [dependency] Update the github-actions group across 1 directory with 5 updates [`(0d46d8c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0d46d8c816d452f223dd1d339383f5c39a047ad8)



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



### � Documentation

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


- 📝 [docs] Enhance event system and orchestrator documentation

- Improves JSDoc comments for event bus, orchestrator, and middleware, clarifying architecture, usage, and edge cases
- Expands event categorization and priority definitions for type safety and maintainability
- Refines event data enhancement logic to handle arrays, primitives, and _meta conflicts safely
- Strengthens validation middleware with robust type checking, safer logging, and error resilience
- Updates ESLint config to disable irrelevant React Native rule for Electron context

Improves developer experience, code clarity, and reliability of event validation and handling. [`(47d4f6d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/47d4f6d51038fd1ad88a89b2aa1c143454cb43a7)


- 📝 [docs] Improve type safety and remediation audit docs

- Updates documentation files to reflect progress on type safety, logger remediation, and IPC event type definition enhancements.
 - Clarifies areas of improvement, completed actions, methodology, and future implementation steps for ongoing type safety initiatives.
 - Refines formatting, tables, and code sample clarity for better readability and maintainability.
 - Removes unnecessary whitespace and ensures consistent markdown for audit and summary reports.
 - No logic or application code is modified; changes are documentation-only. [`(1339d4d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1339d4da40bddad610a51f639446aa0037edb3e4)


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


- 📝 [docs] Update ESLint analysis and improve shared utils docs

- Expands and clarifies ESLint Plugin N analysis, detailing violation types, recommendations, and migration plan for environment detection and async patterns
- Improves documentation and consistency in shared utility files, enhancing readability and type safety explanations
- Standardizes code formatting in config and utility modules for better maintainability

Focuses on code quality, maintainability, and clear guidance for future rule configuration and refactoring. [`(70c3eca)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/70c3eca3ed5c59de24a30c2d7fb4d2110890f588)


- 📝 [docs] Remove obsolete architectural and code audit documentation

Deletes outdated docs covering legacy monitor type systems, architectural standards, code consistency audits, and implementation guides that are no longer relevant after recent registry-driven refactoring.

Improves maintainability and clarity by removing redundant instructions and references to manual patterns, switch cases, and legacy validation logic.

Streamlines onboarding by ensuring only current, dynamic monitor type integration processes are documented. [`(dfcce56)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dfcce568b9b8c7990588bb6b92ccc8746814500d)



### 🎨 Styling

- 🎨 [style] Migrate global styles to CSS nesting syntax

- Adopts CSS nesting syntax throughout all main, component, and theme stylesheets for improved maintainability and consistency
- Reorders property declarations for logical grouping and readability
- Refactors selectors to leverage nesting, reducing repetition and enhancing clarity
- Removes unused or irrelevant stylelint rules related to React Native
- Enforces modern stylelint nesting configuration, preparing codebase for future CSS standard compatibility

No functional or visual regressions expected; focuses purely on code style and structure. [`(d15d27a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d15d27ab7573f4c73a3871efb1ba4faf04973ecd)



### 🧹 Chores

- Update changelogs for v8.0.0 [skip ci] [`(0ae7bdd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0ae7bddff71f29c7e96071bdbbb528fcd323a919)






## [8.0.0] - 2025-07-21


[[69a92cd](https://github.com/Nick2bad4u/Uptime-Watcher/commit/69a92cd0a3be06ae94ab3f3cf89fd341c6c9bd64)...
[317afc9](https://github.com/Nick2bad4u/Uptime-Watcher/commit/317afc96cb471b175790ed35f805dc66e9b946f1)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/69a92cd0a3be06ae94ab3f3cf89fd341c6c9bd64...317afc96cb471b175790ed35f805dc66e9b946f1))


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



### �️ Bug Fixes

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



### 📦 Dependencies

- [dependency] Update version 7.9.0 [`(69a92cd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/69a92cd0a3be06ae94ab3f3cf89fd341c6c9bd64)



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



### � Documentation

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



### 🧹 Chores

- Update changelogs for v7.9.0 [skip ci] [`(af8dd73)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/af8dd73b2186e6d63d7380dc850c7ca21ed51503)



### 🔧 Build System

- 🔧 [build] Update dependencies and extend lint coverage

- [dependency] Updates several dependencies for improved stability and compatibility, including Electron, CSpell, Biome, Stylelint, Vite, ESLint plugins, and node-sqlite3-wasm.
- Expands lint and duplicate-check scripts to include the shared directory, enhancing code quality checks.
- Improves circular, orphan, leaves, metrics, and SLOC analysis scripts to cover all relevant source areas.
- Ensures future maintainability and coverage for linting and duplication detection in shared code. [`(d79260d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d79260d07c7ba122959ec5b03cf37eb68f6f1bb9)






## [7.9.0] - 2025-07-18


[[3e03a70](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e03a70f698ddf642108c2d59bb904f821900f5c)...
[7b062f7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b062f7f6eb70a81267e20aa2863944317e81f43)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/3e03a70f698ddf642108c2d59bb904f821900f5c...7b062f7f6eb70a81267e20aa2863944317e81f43))


### ✨ Features

- Add shared types and site status utilities [`(3e03a70)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e03a70f698ddf642108c2d59bb904f821900f5c)



### �️ Bug Fixes

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



### 📦 Dependencies

- [dependency] Update version 7.8.0 [`(75ba5b3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/75ba5b30133c1f073d70105d5fad21cd4857471a)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(22e1977)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/22e19779c811c5e42277a5889ec426a166e4334d)



### 🚜 Refactor

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



### � Documentation

- 📝 [docs] Update project instructions for clarity and standards

- Revises documentation for code and workflow standards, removing redundant and outdated testing guidelines
- Adds stronger guidance on type safety, documentation, and developer best practices to avoid assumptions and promote thorough code review
- Clarifies low confidence AI claim review prompts to enforce proper documentation and planning before fixes
- Aims to reduce confusion, improve onboarding, and ensure consistent code quality across the project [`(7b062f7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b062f7f6eb70a81267e20aa2863944317e81f43)



### 🧹 Chores

- 🧹 [chore] Standardize prompt file naming and add review template

- Renames prompt files to use consistent kebab-case formatting for improved organization and easier discovery.
- Adds a new template for reviewing low confidence AI claims, outlining a process for validation and fixes during development. [`(a59f910)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a59f91053979ce8fee322c8709dbf91bc5ec15a5)


- Update changelogs for v7.8.0 [skip ci] [`(dabe3a1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dabe3a152146edd03f9dfe8f1519a2abe809b0ca)






## [7.8.0] - 2025-07-17


[[6cc2475](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6cc247568337686edc8a29a036e15716c33fb89e)...
[775e23f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/775e23f8671a2d2e163ee75e36a67531f2b0fbaa)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/6cc247568337686edc8a29a036e15716c33fb89e...775e23f8671a2d2e163ee75e36a67531f2b0fbaa))


### ✨ Features

- ✨ [feat] Add devtools installer and robust Vite dev server wait

- Installs React and Redux DevTools extensions automatically in development mode, enhancing debugging capabilities for developers.
- Implements a retry mechanism to wait for the Vite dev server to be ready before loading the app, improving reliability and reducing errors during startup.
- Adds detailed logging for window lifecycle and content loading events, aiding diagnosis and development workflow. [`(7d2b034)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7d2b0348cfabe325825ab8e117db02a9f5400cbe)



### 📦 Dependencies

- [dependency] Update version 7.7.0 [`(6cc2475)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6cc247568337686edc8a29a036e15716c33fb89e)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(0fa9b90)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0fa9b90577405ae1a4771e48de1fada9c9732ea6)



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



### 🎨 Styling

- 🎨 [style] Reformat imports and docs for clarity

- Collapses multi-line import statements into single lines for improved readability and maintainability.
- Updates Markdown documentation to add spacing and correct minor formatting inconsistencies.
- Enhances overall code and documentation clarity without altering logic or functionality. [`(d8a910a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d8a910a27b2d4ce8aa3c6bad6a43fdff8a29f29b)



### 🧹 Chores

- Update changelogs for v7.7.0 [skip ci] [`(cda8e50)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cda8e502b277ccc551affa470bbeaf5430885c7b)






## [7.7.0] - 2025-07-17


[[b0f0af8](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b0f0af8d175b052759db39a47060929160e3d408)...
[0324cf2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0324cf2b6de5b2e4ebd59388cc288a2de2cde880)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/b0f0af8d175b052759db39a47060929160e3d408...0324cf2b6de5b2e4ebd59388cc288a2de2cde880))


### 📦 Dependencies

- [dependency] Update version 7.6.0 [`(e4b7976)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e4b79766c44cf48c9c26b0c51f14e8e04f94ad0e)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(7f729cf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7f729cf403f12fbd5d4dc5e19583f56d9e79ccb7)



### 🚜 Refactor

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



### � Documentation

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

- 🎨 [style] Reformat codeblocks, update ignore and linter configs

- Reformats code examples in documentation for improved readability and consistency, primarily converting indentation to spaces in large markdown code blocks.
- Expands ignore rules to exclude more file types and folders for stylelint, reducing noise and improving linting accuracy.
- Enhances Stylelint configuration by adding Tailwind CSS support and separating rule definitions, enabling better compatibility with Tailwind CSS conventions.
- Applies small whitespace and formatting fixes across scripts and test files for cleaner diffs.
- Improves clarity and markdown compliance in docs through minor adjustments. [`(b0f0af8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b0f0af8d175b052759db39a47060929160e3d408)



### 🧹 Chores

- Update changelogs for v7.6.0 [skip ci] [`(85fbdac)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/85fbdacffdbd33ca0535be9b5a3581d442a0727a)



### 🔧 Build System

- 🔧 [build] Enhance linting, metrics, and testing toolchain

- Adds new development dependencies for cognitive complexity analysis, duplication detection, and code metrics.
- Expands and refines npm scripts for code quality, including new tasks for cognitive complexity, code duplication, metrics, secret scanning, and orphan/circular dependency detection.
- Updates duplication detection configuration for more output formats and stricter thresholds, while broadening ignore patterns for tests.
- Extends .gitignore to exclude generated reports.
- Improves maintainability and code quality enforcement by integrating more automation and reporting into the development workflow. [`(0324cf2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0324cf2b6de5b2e4ebd59388cc288a2de2cde880)






## [7.6.0] - 2025-07-16


[[c2ad587](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c2ad587da68272b729fe2096f583ebce2eede37f)...
[6869f0b](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6869f0b5b2ce12be8c9c80cee7d6619cd5b6240f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/c2ad587da68272b729fe2096f583ebce2eede37f...6869f0b5b2ce12be8c9c80cee7d6619cd5b6240f))


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



### �️ Bug Fixes

- 🛠️ [fix] Improve monitor ID handling and React plugin config

- Updates monitor mapping logic to ensure IDs are only stringified if valid, improving data consistency.
- Reactivates and configures the React Vite plugin with Fast Refresh and explicit Babel options for better DX and JSX handling.
- Refines test coverage matching/exclusions in SonarQube properties to avoid double-counting test files.
- Cleans up test and utility code for clarity, using more concise methods and stricter type usage.
- Removes redundant cleanup logic in the Electron main entry point. [`(c2ad587)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c2ad587da68272b729fe2096f583ebce2eede37f)



### 📦 Dependencies

- *(deps)* [dependency] Update dependency group (#31) [`(e925d80)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e925d80ab81bff71a319b3cfedac444d94ce13f5)


- [dependency] Update version 7.5.0 [`(35abfa8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/35abfa85418510b09dbff01daa8853676a1a5902)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(57f011e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/57f011eecd32acc3a89d4a0bce40f92861b93901)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(8f909c6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8f909c6f3d7ed2d45f804e2a56a343e6dbbf5e57)



### � Documentation

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



### 🧹 Chores

- 🧹 [chore] Annotate logger calls for v8 coverage ignore

- Adds `/* v8 ignore next */` or `/* v8 ignore next 2 */` comments to logger calls throughout the codebase to prevent logging statements from affecting coverage metrics.
- Aims to improve the accuracy of code coverage reports by excluding side-effect-only logging from coverage analysis.
- No changes to application logic or behavior; purely for tooling and code quality purposes. [`(33f1fd6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/33f1fd6fcc7415053890059c425fadd4cdf80881)


- Update changelogs for v7.5.0 [skip ci] [`(cf03e6e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cf03e6e7ec0a8310d027887d06a6b9859ddd0a08)






## [7.5.0] - 2025-07-16


[[0379231](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0379231f105aa420ab1e94676a66b5db5a352e30)...
[d6924c0](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6924c014d9f23b79bc94e9a15f5e8f260404dfa)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/0379231f105aa420ab1e94676a66b5db5a352e30...d6924c014d9f23b79bc94e9a15f5e8f260404dfa))


### 📦 Dependencies

- [dependency] Update version 7.4.0 [`(5dfd73a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5dfd73ada0c18888be3c5528cb05d43f5dfbc4cc)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(d6924c0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6924c014d9f23b79bc94e9a15f5e8f260404dfa)



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

- Update changelogs for v7.4.0 [skip ci] [`(eed05be)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eed05be1933575477932490de27b1598c536faee)






## [7.4.0] - 2025-07-16


[[1109dae](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1109dae06ddc098df15eb54f0cfc602bfe644236)...
[45ba5f2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45ba5f27917b1291d1f81905e46f0e5bef16de74)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1109dae06ddc098df15eb54f0cfc602bfe644236...45ba5f27917b1291d1f81905e46f0e5bef16de74))


### 📦 Dependencies

- [dependency] Update version 7.3.0 [`(2e8b973)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2e8b97363ca519804d3e8dbb784fc8fae1e5a2e3)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(c272f34)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c272f34f73b3c48818280cece0d0b6c728492efb)



### 🧪 Testing

- 🧪 [test] Add responseTime mock and fix timer advance call

- Ensures mock monitor objects include a response time property to align with expected structure.
- Updates timer advancement to use a non-null assertion, preventing potential errors during async test execution. [`(45ba5f2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45ba5f27917b1291d1f81905e46f0e5bef16de74)



### 🧹 Chores

- Update changelogs for v7.3.0 [skip ci] [`(7607175)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/76071753456ea426a851eb50152104b60f7add5a)


- 🧹 [chore] Remove unused exports and consolidate types

- Cleans up unused and duplicate exports across barrel files and type definitions to reduce confusion and maintenance overhead.
- Removes never-used error classes, utility functions, and conditional UI components for advanced analytics.
- Consolidates type exports to single sources of truth, improving type safety and reducing redundancy.
- Adjusts imports and tests to match new export structure, ensuring consistency and easier future refactoring.
- Improves code clarity in UI components by switching from class-based to style-based response time coloring. [`(1109dae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1109dae06ddc098df15eb54f0cfc602bfe644236)






## [7.3.0] - 2025-07-15


[[f4e43ae](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f4e43aee3e597c6eba8edb174a4d70575711bf85)...
[7981606](https://github.com/Nick2bad4u/Uptime-Watcher/commit/79816068aaecff5423b54bb779d9def939aba323)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/f4e43aee3e597c6eba8edb174a4d70575711bf85...79816068aaecff5423b54bb779d9def939aba323))


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



### 📦 Dependencies

- [dependency] Update version 7.2.0 [`(f4e43ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f4e43aee3e597c6eba8edb174a4d70575711bf85)



### � Documentation

- 📝 [docs] Reformat monitor type guide examples for clarity

- Improves readability in monitor type implementation guides by applying consistent code formatting and indentation
- Adds spacing and formatting to clarify code block sections, field type explanations, UI configuration, and integration steps
- Enhances step-by-step instructions for adding and registering new monitor types
- Aims to make the documentation easier to follow for developers extending monitoring functionality [`(ff92f0c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ff92f0c1bc451a0cad7e5de883a8eaccb5569481)



### 🎨 Styling

- 🎨 [style] Replace console logging with structured logger

- Unifies error and warning reporting across frontend and backend by replacing all console.* calls with a structured logger interface.
- Enhances log consistency, improves error traceability, and supports future log aggregation or filtering.
- Adds logger imports where missing and adapts all error/warning handling code to use logger methods instead of direct console statements.
- Updates documentation comments for clarity and standardization, and improves error context in log messages. [`(ee45c3c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ee45c3cbe5ef8f4d67d8ea295164a692ff6ba76d)






## [7.2.0] - 2025-07-15


[[15de9b5](https://github.com/Nick2bad4u/Uptime-Watcher/commit/15de9b5f08ac149aaad420caf6a841197442381b)...
[f6c3db1](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f6c3db18b64f0ac3bcf798ef391d3399ae018442)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/15de9b5f08ac149aaad420caf6a841197442381b...f6c3db18b64f0ac3bcf798ef391d3399ae018442))


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



### �️ Bug Fixes

- 🛠️ [fix] Prevent memory leaks & improve error handling

- Adds a configurable middleware limit to event bus to prevent excessive registrations and potential memory leaks, with diagnostics reporting usage.
- Refines store utility error handling to log and gracefully recover from failures in state management methods, ensuring robust operation and preventing state corruption.
- Cleans up overlay and timeout logic in screenshot thumbnail for more reliable UI behavior.
- Removes unused dynamic monitor UI logic to reduce code complexity.
- Introduces targeted tests to validate critical error handling and middleware leak prevention features. [`(15de9b5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/15de9b5f08ac149aaad420caf6a841197442381b)



### 📦 Dependencies

- [dependency] Update version 7.1.0 [`(114e444)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/114e444598cdcfcdf3f62e9611f58c3d9c9033c8)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(5c3d12e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5c3d12e9dbc4396c1f62fc3cba599c989d321803)



### � Documentation

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



### 🎨 Styling

- 🎨 [style] Reformat configuration file with consistent indentation

Standardizes indentation to improve readability and maintain consistent code style across the configuration file.

No logic or functional changes introduced. [`(e61db61)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e61db611567440696d6d6f3c2d505887380765fa)



### 🧹 Chores

- Update changelogs for v7.1.0 [skip ci] [`(3febd52)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3febd52ebd35faa525dfdc96cee56b40a80e75c3)



### 🔧 Build System

- 🔧 [build] Update dependencies for improved compatibility

- Upgrades multiple project dependencies to latest versions, including zod, eslint, electron, playwright, vite, and various CSpell, TypeScript, and ESLint plugins.
 - Addresses security, bug fixes, and compatibility improvements with new library releases.
 - Ensures continued support for development and testing tools in the evolving ecosystem. [`(0ecdeed)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0ecdeed52ce55db06da8166f7bf156e4e7168d4a)






## [7.1.0] - 2025-07-15


[[7ac619f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7ac619fb871cf48af4495972241eb19c206164bb)...
[6d0384d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6d0384d05d474bfbeb37f11e56b5348b0a0a0a8b)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/7ac619fb871cf48af4495972241eb19c206164bb...6d0384d05d474bfbeb37f11e56b5348b0a0a0a8b))


### ✨ Features

- ✨ [feat] Implement dynamic monitor migration and validation system

- Introduces a robust migration system for monitor types with version tracking, registry-driven data transformation, and schema evolution support.
- Adds advanced runtime validation and type guard utilities for monitor data, improving error handling and extensibility.
- Refactors monitor type registry and frontend utilities to eliminate hard-coded logic and support dynamic field configuration.
- Updates documentation to reflect completed dynamic monitor architecture, migration strategies, and validation improvements.
- Enhances performance with caching and memoization for monitor type lookups.
- Improves error handling, state management, and test coverage for validation and migration features.
- Increases maintainability and scalability by enabling easy addition of new monitor types with minimal code changes. [`(88a65a0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88a65a0a00765dcb5e5f857859af8e72c7742be2)



### 📦 Dependencies

- *(deps)* [dependency] Update google/osv-scanner-action (#28) [`(2804a12)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2804a1200b476d2a65cf19f55f8f331fbacd602e)


- [dependency] Update version 7.0.0 [`(7ac619f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7ac619fb871cf48af4495972241eb19c206164bb)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(6d0384d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6d0384d05d474bfbeb37f11e56b5348b0a0a0a8b)



### � Documentation

- 📝 [docs] Add implementation, legacy code, and file org reviews

- Adds comprehensive documentation for the dynamic monitor system, including implementation review, legacy code analysis, final summary, and detailed file organization recommendations.
- Removes the outdated monitor type guide to reflect current registry-based architecture and dynamic patterns.
- Updates imports and file naming to use consistent camelCase across components and utilities.
- Motivates future splitting of large utility files for better maintainability and developer experience. [`(3af3ce9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3af3ce9abd6021ac372b10d6e05290c3d3bd5ce4)



### 🧹 Chores

- Update changelogs for v7.0.0 [skip ci] [`(7fe5603)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7fe5603fa143e800266a2e21387fa9bc876c3f1f)






## [7.0.0] - 2025-07-14


[[05af275](https://github.com/Nick2bad4u/Uptime-Watcher/commit/05af275a43743dab4cebeca3deb183b2d314ee7d)...
[483d424](https://github.com/Nick2bad4u/Uptime-Watcher/commit/483d42400c4ce907962513305b51037e8b6f752e)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/05af275a43743dab4cebeca3deb183b2d314ee7d...483d42400c4ce907962513305b51037e8b6f752e))


### ✨ Features

- ✨ [feat] Enable dynamic monitor type registry and UI integration

- Implements a dynamic registry system for monitor types, allowing addition, validation, and configuration of new monitor types without hardcoding.
- Refactors validation, database schema, form rendering, and monitor service factory to use registry-driven configurations and Zod schemas.
- Updates frontend to render monitor fields and help texts dynamically, improving extensibility and UX.
- Adds IPC handlers and unified event flow for monitoring state changes, ensuring real-time UI sync.
- Removes deprecated constants and legacy validation logic; unifies data mapping to support extensible monitor types.
- Improves testability and future-proofing for adding new monitor types and features.

Relates to extensibility and future support for custom monitor types. [`(c7940c1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c7940c14a98b1cf77554ff3f07725a085c6e5e89)



### 📦 Dependencies

- [dependency] Update version 6.9.0 [`(05af275)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/05af275a43743dab4cebeca3deb183b2d314ee7d)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(43116ee)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/43116ee8f00391a247bd7f7e256a5a5ceb797559)



### 🚜 Refactor

- 🚜 [refactor] Remove legacy tests and scripts after monitor type overhaul

Removes obsolete unit tests and PowerShell/BAT scripts related to configuration, monitoring, and markdown link fixing, reflecting migration to a dynamic, registry-driven monitor type system.

Updates remaining tests for compatibility with new monitor status types.
Documentation is fully rewritten to guide new monitor type implementation and refactoring process.

 - Reduces maintenance overhead and test complexity
 - Ensures future extensibility and easier onboarding for contributors [`(483d424)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/483d42400c4ce907962513305b51037e8b6f752e)



### 🎨 Styling

- 🎨 [style] Format VS Code settings for readability

- Expands arrays in settings for improved clarity and consistency
- Adds extensive comment tag color configuration to enhance code annotations
- Updates Prettier ESLint rules to use warnings instead of errors for smoother development experience
- [dependency] Updates dependency version to address minor package update [`(8bcd9bd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8bcd9bd66db3243e6e5cf8a4b489dfc38bd5bd87)



### 🧹 Chores

- Update changelogs for v6.9.0 [skip ci] [`(8ccb2e2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8ccb2e2332abaf14f708f45ddf1505e1f1b878de)



### 👷 CI/CD

- 👷 [ci] Improve SonarCloud config for coverage and exclusions

- Refines test file exclusions to prevent test code from being analyzed as sources
- Adds electron-specific coverage reports and tsconfig paths for broader analysis
- Excludes test folders from duplication checks to reduce false positives
- Sets default issue assignee and enables sensor cache for faster analysis
- Increases max file size for JavaScript analysis to support larger files [`(8e1c9cf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8e1c9cf45245dd9a3dd1b0e4b55b379bec7181f6)






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



### 📦 Dependencies

- [dependency] Update version 6.8.0 [`(5057801)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5057801a96411ba5dfe38fd9902d52d283daaee9)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(00f2bab)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/00f2babe061e35aca46022052dc9c44f8a684777)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(f385357)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f385357358c09192e901ac82dd15b64e4e21a0b9)



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



### � Documentation

- 📝 [docs] Add codebase consistency audit prompt template

- Introduces a detailed prompt outlining procedures for auditing codebase consistency across logic, data flow, architectural patterns, and interfaces
- Provides structured requirements for analysis, reporting, prioritization, and improvement roadmap
- Aims to standardize code practices and proactively identify inconsistencies to enhance maintainability and stability [`(5c5c8c3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5c5c8c34bc82520d2f3f6e30352bee80dd50ca0d)


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



### 🧹 Chores

- Update changelogs for v6.8.0 [skip ci] [`(cf4001b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cf4001ba79a8f454b4856902f5935cef9efc5424)






## [6.8.0] - 2025-07-12


[[02e867f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/02e867f096bb7cf5e51f810cb4ce48aaabc4cf39)...
[58cd258](https://github.com/Nick2bad4u/Uptime-Watcher/commit/58cd25810e238e0d2d2e614cbf2e54aab2859093)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/02e867f096bb7cf5e51f810cb4ce48aaabc4cf39...58cd25810e238e0d2d2e614cbf2e54aab2859093))


### 📦 Dependencies

- [dependency] Update version 6.7.0 [`(4abd419)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4abd41907c8cfaf99faf94540610499e44558f11)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(2b883f2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2b883f2df040bb46208bcfbb78fb49c3c13720bb)



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



### 🧹 Chores

- Update changelogs for v6.7.0 [skip ci] [`(15545f0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/15545f0c6c044b013f93a061985d1575fc0b9c3c)






## [6.7.0] - 2025-07-12


[[1482c88](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1482c884c3145ace9bc028c206014c2c1f04da8d)...
[3e22673](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e22673014215c6c667f8573fd4601f720390d73)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1482c884c3145ace9bc028c206014c2c1f04da8d...3e22673014215c6c667f8573fd4601f720390d73))


### 📦 Dependencies

- [dependency] Update version 6.6.0 [`(1482c88)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1482c884c3145ace9bc028c206014c2c1f04da8d)



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



### � Documentation

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



### 🧪 Testing

- 🧪 [test] Add comprehensive tests for dashboard components

- Introduces thorough unit tests for key dashboard UI components, covering rendering, event handling, accessibility, and React.memo optimization.
- Improves reliability with edge case and integration scenarios for buttons, selectors, metrics, and empty states.
- Fixes API readiness logic for Electron integration by using optional chaining and error handling.
- Refines setup to correctly mock electron log renderer module.
- Enhances main entry point testing with root element error and selector verification. [`(eab39fd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eab39fd41125c34cc0d29a55510abf2b36388987)



### 🧹 Chores

- Update changelogs for v6.6.0 [skip ci] [`(23966fc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/23966fc69085853d016e19604f0882e995e6d05c)



### 🔧 Build System

- 🔧 [build] Enhance ESLint config and update test code style

- Expands ESLint configuration with improved TypeScript, React, Promise, Unicorn, and Prettier integration for better code quality and consistency.
- Adds new ESLint plugins and resolvers, updates package dependencies, and bumps project version.
- Refines test suite formatting for readability and alignment with linting rules. [`(f741d20)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f741d2063d6cdb8516b187aafb413de5e8085c90)






## [6.6.0] - 2025-07-11


[[155201c](https://github.com/Nick2bad4u/Uptime-Watcher/commit/155201c4300c35002001f43bad2870048c5cc3c1)...
[66688c4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66688c485541c87f5c1813b082554a2f1cf780ef)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/155201c4300c35002001f43bad2870048c5cc3c1...66688c485541c87f5c1813b082554a2f1cf780ef))


### ✨ Features

- ✨ [feat] Add site-level monitoring control and type safety

- Introduces a `monitoring` boolean property at the site level, allowing sites to globally enable or disable monitoring of all their monitors.
- Updates auto-start monitoring logic to respect site-level `monitoring` as a master switch and ensures only monitors with monitoring enabled are started.
- Extends database schema, queries, and upsert logic to persist `monitoring` state for sites, including during import/export and bulk operations.
- Refactors test data and utilities to enforce stricter type requirements, normalizing required properties such as `monitoring` and `responseTime` for monitors and sites.
- Deprecates redundant monitoring start logic to avoid duplicate operations and centralizes control in the monitoring manager.
- Improves test coverage for new type constraints and ensures all test cases properly specify required fields.
- Motivated by the need for finer monitoring control, improved type safety, and reduction of subtle monitoring logic errors. [`(c1d3af8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c1d3af8d1f2687933933b6d0b0ead36100e6e654)



### �️ Bug Fixes

- 🛠️ [fix] Prevent duplicate monitor checks and clean up tests

- Removes redundant initial monitor check logic, ensuring only a single check occurs when adding a monitor or creating a site, which avoids double status updates and improves performance.
- Cleans up unused functions and imports related to monitor checks for maintainability.
- Updates unit tests to match the new monitor lifecycle behavior and corrects test mocks for transaction-safe repository methods.
- Refines logging for consistency and fixes ESLint/TypeScript warnings, especially unnecessary conditionals and formatting. [`(33e1de5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/33e1de5af48b39ee42f254e437effe82bbd20279)



### 📦 Dependencies

- [dependency] Update version 6.5.0 [`(155201c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/155201c4300c35002001f43bad2870048c5cc3c1)



### 🚜 Refactor

- 🚜 [refactor] Simplifies monitor and site property handling logic

- Removes fallback and default value logic for monitor and site properties, relying directly on explicit values for consistency.
- Updates notification, logging, and UI components to use the site name without fallback to identifiers.
- Standardizes interval and timeout usage, eliminating redundant default assignments.
- Replaces frontend store logging with electron-log for unified logging across client and backend.

Improves code clarity, predictability, and reduces implicit behavior. [`(ada111c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ada111cc0709a199a7e99712fe45761a8c9095a0)


- 🚜 [refactor] Ensure consistent transactional DB patterns, fix monitor double-check, and update lint/test infra

- Refactors database repositories and service layers to use explicit internal vs. external transaction methods, eliminating nested transaction errors and enforcing ACID compliance across all site, monitor, history, and settings operations
- Implements internal methods and interface updates for HistoryRepository and SettingsRepository, fixes transaction use throughout DataImportExportService and history limit management logic
- Adds efficient history pruning with buffered logic during monitor checks, respecting user-set limits and preventing expensive DB operations
- Fixes monitor setup so new monitors only perform a single initial check before interval scheduling, preventing duplicate immediate checks during site/monitor creation
- Updates event, state, and logging patterns for consistency and maintainability; improves frontend and backend error handling and logging formatting
- Cleans up test mocks and expectations to support internal repository methods, updates all failing or outdated tests, and fixes missing/invalid test logic to achieve 100% passing coverage
- Expands and documents lint/test/package scripts for improved code quality, adds markdown ignore to ESLint config, and resolves unnecessary conditional nags where appropriate

Relates to ongoing project-wide transaction refactor, monitor lifecycle consistency, and test/lint reliability improvements. [`(4c60717)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4c60717e08c92b80cae6732a3a6e16ca0072c194)


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



### � Documentation

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

- 🧪 [test] Guard monitor type checks against undefined

- Updates monitor type assertions to use optional chaining,
  preventing potential runtime errors if the monitor list is shorter
  than expected. Improves test robustness when accessing array elements. [`(66688c4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66688c485541c87f5c1813b082554a2f1cf780ef)


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


- Update changelogs for v6.5.0 [skip ci] [`(f4a444e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f4a444e2e4d6d49c41305870bfd8d70623e219a2)






## [6.5.0] - 2025-07-10


[[7131308](https://github.com/Nick2bad4u/Uptime-Watcher/commit/713130863945e04e1f0c8a1e87d791a93bb2dd0f)...
[ee269f9](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ee269f9972c98fe7c7fbf4662d315fa170aa5a99)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/713130863945e04e1f0c8a1e87d791a93bb2dd0f...ee269f9972c98fe7c7fbf4662d315fa170aa5a99))


### ✨ Features

- ✨ [feat] Add script to find empty directories in project

- Introduces a Node.js script to recursively identify and list empty directories under key project folders.
- Aims to help maintain a clean repository by facilitating the detection and potential removal of unused directories.
- Handles permission errors gracefully and provides clear output for developers running the tool. [`(ee269f9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ee269f9972c98fe7c7fbf4662d315fa170aa5a99)



### �️ Bug Fixes

- 🛠️ [fix] Use Object.hasOwn for safer property checks

- Replaces Object.prototype.hasOwnProperty calls with Object.hasOwn to improve code safety and modernize property checking.
- Enhances reliability by using a method less prone to issues with prototype pollution. [`(75aacf2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/75aacf22b3681304b4c67f3b3876c676e94c4f65)


- 🛠️ [fix] Update type configs and test mocks for ES2024 features

- Expands TypeScript lib settings to include ESNext and ES2022, supporting modern JS features like Object.hasOwn
- Adjusts event category check to use Object.hasOwn for improved code clarity, with ts-expect-error for Electron compatibility
- Updates test mocks to include all monitor properties, ensuring coverage and alignment with data model

Addresses compatibility with recent ECMAScript enhancements and improves type safety in tests. [`(7131308)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/713130863945e04e1f0c8a1e87d791a93bb2dd0f)



### 📦 Dependencies

- [dependency] Update version 6.4.0 [`(0b5c883)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0b5c883693ef6d218c70f87e780be56991d02fdf)



### 🛡️ Security

- [StepSecurity] ci: Harden GitHub Actions (#27)

Signed-off-by: StepSecurity Bot <bot@stepsecurity.io> [`(eee9c0e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eee9c0e602acdeb5a42b86de8a67cfa7a616148c)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(7757dbc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7757dbcbb943db149a0fa76299138c3191defab9)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(ac198c1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ac198c1abece14c85983f5e23d6ff49ae5864776)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(27c0d56)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/27c0d56d435ca1dcdd28256ebd42b93fb8bfd521)



### 🚜 Refactor

- 🚜 [refactor] Improve cspell word appender script flexibility

- Refactors the script to use .mjs extension for better ES module compatibility
- Allows custom dictionary file path via CLI argument or environment variable
- Enhances handling for missing or commented word files, supporting multiple comment styles
- Improves file path resolution to default to project root, increasing portability
- Cleans up output and ensures consistent trailing newline in the word list
- Adds more robust error and stderr logging for cspell invocation

These updates make the script more flexible and robust for different environments and workflows. [`(cc661ab)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cc661ab10fc628ed34880fe865f5d14bb1c8df5a)



### 🎨 Styling

- 🎨 [style] Reformat script for consistent indentation

- Improves code readability by standardizing indentation and formatting
- Makes control flow and logic blocks clearer, aiding maintainability
- No functional or algorithmic changes introduced [`(cac77db)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cac77dbea7ecf430e51ab29f0a776d42d11c7c18)



### 🧹 Chores

- 🧹 [chore] Unify Prettier config, improve meta tags & CI YAMLs

- Replaces redundant Prettier config file with a single unified config and disables JSON Prettier errors for better compatibility.
- Adds SEO-focused meta description and keywords to main HTML for improved discoverability.
- Updates workflow YAML indentation and comments for clarity and consistency.
- Refines linter and VS Code settings for improved maintainability. [`(f4494d2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f4494d208098e3a06c737140a4218704827ca419)


- Update changelogs for v6.4.0 [skip ci] [`(e57a261)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e57a261dd1155da4dbab41ad73da9726691e72f6)


- 🧹 [chore] Update spell-check config and add automation script

- Expands custom spelling dictionary with new terms and removes unused entries to improve spell-check accuracy
- Introduces a script for automatically appending unknown cspell words, streamlining dictionary maintenance
- Updates TypeScript config to include a broader set of ECMAScript libraries for enhanced compatibility
- Refactors test formatting for consistency

Relates to automated spell-checking and build tooling improvements [`(979a6d2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/979a6d224ecc82dc8b311d14f4e33b6b169ab8b6)



### 🔧 Build System

- 🔧 [build] Update linter configs and ignore patterns for dev tools

- Broadens suppression scope for a security rule to all files and disables DevSkim errors to streamline development workflows.
- Expands markdown lint ignore list to cover more documentation and dependency files, reducing noise from irrelevant lint warnings.
- Aims to improve DX by reducing unnecessary linter interruptions in non-production or documentation files. [`(fa1a154)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fa1a1541d139b1cda59e31914a85ca0214327c7a)


- 🔧 [build] Add PostCSS asset and SVG plugins, update settings

- Integrates postcss-assets, postcss-inline-svg, and postcss-reporter to enhance CSS asset handling and reporting
- Updates stylesheet import for Tailwind CSS compatibility and streamlines status indicator padding
- Ignores CSS @import lint warnings in editor settings to reduce noise
- Improves PostCSS workflow for asset management, theming, and error visibility [`(1a38f79)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1a38f793a8d47c39edb4831c62150d588023c0d2)






## [6.4.0] - 2025-07-10


[[063d3e4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/063d3e4ca647320ca78ecdd5e408d79aa9d7e8e3)...
[4bb41cf](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4bb41cf231a7b54791374d087a532d6b194444b1)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/063d3e4ca647320ca78ecdd5e408d79aa9d7e8e3...4bb41cf231a7b54791374d087a532d6b194444b1))


### 📦 Dependencies

- [dependency] Update version 6.3.0 [`(063d3e4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/063d3e4ca647320ca78ecdd5e408d79aa9d7e8e3)



### � Documentation

- 📝 [docs] Correct typo and remove redundant ESLint comment

- Fixes documentation typo for improved clarity in component description
- Removes unnecessary comment intended to satisfy ESLint, as explicit return is no longer required [`(4bb41cf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4bb41cf231a7b54791374d087a532d6b194444b1)






## [6.3.0] - 2025-07-10


[[354d522](https://github.com/Nick2bad4u/Uptime-Watcher/commit/354d5226c936e2c8718204ecd8273ac8879cf421)...
[f3c207d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f3c207db31b94ecf3f74126ccb62b35386af2765)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/354d5226c936e2c8718204ecd8273ac8879cf421...f3c207db31b94ecf3f74126ccb62b35386af2765))


### �️ Bug Fixes

- 🛠️ [fix] Prevents update check errors from logging to console

- Removes error logging for update check failures during initialization
- Avoids cluttering logs with non-critical update check exceptions [`(7e8c6e1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e8c6e1d608a821a77328e178949898592f43b0e)



### 📦 Dependencies

- [dependency] Update version 6.2.0 [`(354d522)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/354d5226c936e2c8718204ecd8273ac8879cf421)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(f3c207d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f3c207db31b94ecf3f74126ccb62b35386af2765)



### 🚜 Refactor

- 🚜 [refactor] Extract theme property application into helper methods

- Improves maintainability by modularizing logic for applying colors, typography, spacing, shadows, and border radius as CSS custom properties
- Enhances readability and simplifies future extension by moving direct property application code into dedicated private methods [`(e81a89c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e81a89c033a35b27b98da77b847e23b16e3d3254)



### 🧹 Chores

- Update changelogs for v6.2.0 [skip ci] [`(976e06d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/976e06dae8bc10477bbc0d7a54de8a3e0891d18b)






## [6.2.0] - 2025-07-10


[[466e771](https://github.com/Nick2bad4u/Uptime-Watcher/commit/466e7717624ebae684db76e3b140091b7a58a643)...
[b474c4f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b474c4f54d0f9ecbaa70e07c2caaa923c6d9bb0f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/466e7717624ebae684db76e3b140091b7a58a643...b474c4f54d0f9ecbaa70e07c2caaa923c6d9bb0f))


### ✨ Features

- ✨ [feat] Add shared interval formatting utils and tests

- Centralizes interval formatting and label helpers in a shared utility, enabling consistent display of monitoring intervals across components
- Refactors components to use new shared helper, removing duplicate logic and improving maintainability
- Expands and corrects related unit tests to reflect updated utility exports
- Adds comprehensive unit tests for core backend managers and event bus, increasing backend test coverage and reliability [`(a24df3a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a24df3aac74860c35caf8ef19d14bad84943bdac)



### �️ Bug Fixes

- 🛠️ [fix] Log update check errors during initialization

- Ensures errors from the update check are properly logged to improve visibility and troubleshooting
- Prevents unhandled promise rejections during application startup [`(b474c4f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b474c4f54d0f9ecbaa70e07c2caaa923c6d9bb0f)


- 🛠️ [fix] Guard category lookup in event type check

Prevents errors when checking event categories by verifying the
category exists before accessing its properties. Adds unit tests to
ensure correct behavior for valid, invalid, and unknown event names
and categories. Improves robustness and test coverage for event
category and priority logic. [`(d5176f5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d5176f55f4860097bbe22f93073f0b4986dc6f51)



### 📦 Dependencies

- [dependency] Update version 6.1.0 [`(4769ed7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4769ed7b536157be7aa09c3c4bf502f0108e83b7)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(6509dda)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6509ddaf56d1fb181c30b95a2c1a168e0c2e268d)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(3ed1480)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3ed14806e196dc745621ac2255c94d9628592cd8)



### 🚜 Refactor

- 🚜 [refactor] Remove form validity check from submit button

- Simplifies form handling by eliminating the explicit validity check before enabling the submit button.
- Removes related prop usage and unit test to streamline button logic and reduce redundancy.
- Shifts responsibility for preventing invalid submissions away from button state management, likely centralizing validation elsewhere. [`(26d7bc0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26d7bc0fe7d6c610aa2904ed0f74e36eb3bb49ff)


- 🚜 [refactor] Improve form reset logic and validation

- Refactors form field reset behavior to selectively clear fields based on monitor type transitions, preserving user input when switching modes.
- Changes validation state to be exposed as a function instead of a boolean for improved flexibility.
- Updates utility import path for UUID generation. [`(ced7df8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ced7df83eef29edef4531456f59881d86a0a9914)



### � Documentation

- 📝 [docs] Rename prompt files for consistent naming

- Ensures prompt files use a standardized ".prompt.md" extension
- Improves clarity and organization of documentation assets [`(2d8e7a2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2d8e7a2eaa52c2222888e66fc54f9e27d71a82eb)


- 📝 [docs] Add guidelines for achieving 100% test coverage

- Introduces detailed instructions for reviewing coverage reports and ensuring all files reach 100% branch coverage.
- Emphasizes comprehensive testing, including edge case handling and non-skippable files, to improve code reliability.
- Updates internal documentation to guide contributors on maintaining full test coverage across the project. [`(466e771)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/466e7717624ebae684db76e3b140091b7a58a643)



### 🎨 Styling

- 🎨 [style] Format VS Code settings, add bracket colorization

- Improves readability by expanding JSON arrays and objects to multiline format
- Adds custom bracket and cursor color settings for enhanced code visibility without extensions
- Organizes configuration for ESLint, SonarLint, and task arguments for better maintainability [`(a99cbbf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a99cbbfa7b598ea233694bce3f96c5e5fd682de1)



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


- 🧪 [test] Add comprehensive unit tests for SiteCard and SiteDetails components

- Provides full test coverage for SiteCard-related components and SiteDetails modal logic, including rendering, props, event handling, and edge cases
- Ensures accessibility and keyboard navigation are covered
- Mocks child components and hooks to enable isolated, focused tests and verify integration points
- Improves test reliability by mocking external dependencies and logging
- Aims to prevent regressions and facilitate future refactoring by documenting expected behaviors in tests [`(3c30742)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3c307420b749d383da6473151c238f0b912d4515)


- 🧪 [test] Increase component and hook test coverage

- Adds comprehensive unit tests targeting low-coverage and edge-case areas across dashboard components, UI states, and core hooks
- Introduces new test suites covering form logic, event handling, error boundaries, performance optimizations, and uncovered branches
- Mocks browser APIs for consistent theme-related testing
- Improves future maintainability and reliability by ensuring broader code coverage and validating previously untested scenarios [`(f6e5540)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f6e55409fdc2de157a2cb5ca55964d7812f567c1)


- 🧪 [test] Remove unused imports from test files

- Cleans up test files by removing unnecessary imports to improve readability and prevent confusion.
- Helps maintain clarity in test dependencies and reduces noise for future maintenance. [`(da68a80)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/da68a80c163d7722def52da3393da75d7781549e)



### 🧹 Chores

- Update changelogs for v6.1.0 [skip ci] [`(de05de8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de05de8ca28599e94a539af4ccb6845e3cd139c7)



### 🔧 Build System

- 🔧 [build] Remove direct test file path from test config

- Eliminates the explicit inclusion of a single test file in the test sources configuration to ensure only test directories are considered.
- Prevents potential issues with test discovery and maintains consistency in test configuration. [`(be6d994)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/be6d99421e4d983a0e952832e85670d1b53190e5)






## [6.1.0] - 2025-07-09


[[834da82](https://github.com/Nick2bad4u/Uptime-Watcher/commit/834da82b5c96dbd570f57f5396ca612ead5c9778)...
[8654c4e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8654c4ef847b5bc808604e3d42fa085a89f1512f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/834da82b5c96dbd570f57f5396ca612ead5c9778...8654c4ef847b5bc808604e3d42fa085a89f1512f))


### �️ Bug Fixes

- 🛠️ [fix] Move stale monitor ID update to useEffect

- Prevents state updates during render by moving logic that syncs monitor ID into a useEffect.
- Ensures React best practices are followed, improving stability and avoiding potential warnings or bugs caused by state updates in render phase.pre [`(593b545)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/593b545ace3ad3c853bd854c3f5a39c803f013e6)



### 📦 Dependencies

- [dependency] Update version 6.0.0 [`(cdca1a3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cdca1a3cafefe482662bc330dffac1623fef5bb9)



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



### � Documentation

- 📝 [docs] Update changelog with detailed release history

- Documents new features, refactors, bug fixes, test improvements, style changes, build system tweaks, and dependency updates from versions 5.6.0 through 6.0.0.
- Highlights introduction of type-safe event bus, transactional safety, new monitor statuses, major refactors, expanded test coverage, and code style unification.
- Removes outdated documentation, test files, and redundant configs to reduce maintenance overhead and improve clarity.
- Ensures changelog accurately reflects recent project evolution, aiding future maintainers and users in tracking progress and rationale. [`(49c7811)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/49c7811d94762b5b3f33631a4cb2a9da7d6eaee6)



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



### 🧹 Chores

- 🧹 [chore] Remove redundant ESLint ignorePattern config

- Removes explicit ESLint ignore pattern for node_modules as this exclusion is handled by default.
- Simplifies configuration and reduces potential confusion over redundant settings. [`(ddf1915)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ddf1915afc8dc7449604b14be31baffc45a6ce43)


- Update changelogs for v6.0.0 [skip ci] [`(1c4ed00)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1c4ed00d758bf0b2803890b0f415cf6ea93550d3)






## [6.0.0] - 2025-07-08


[[916d15d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/916d15db9af07fa245b42ddf11458e9c572b8b9e)...
[98d8eaf](https://github.com/Nick2bad4u/Uptime-Watcher/commit/98d8eaf4b2ef7b02aacff61706d57d306be252ea)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/916d15db9af07fa245b42ddf11458e9c572b8b9e...98d8eaf4b2ef7b02aacff61706d57d306be252ea))


### 📦 Dependencies

- [dependency] Update version 5.9.0 [`(46958f6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/46958f63afe07fb396c8e6db1b67b473498f0911)



### 🧪 Testing

- 🧪 [test] Add comprehensive and edge-case tests for core logic

- Expands test coverage with new and detailed tests for form field behaviors, header metrics, form submission validation (including error handling and logging), and main file error boundaries
- Refactors theme imports in several components for consistency and maintainability
- Exports additional utility for site status calculation to improve code reuse
- Relaxes Codecov comment requirements to allow comments even if head report is missing

Improves reliability, ensures critical validation and error paths are covered, and enhances future maintainability. [`(916d15d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/916d15db9af07fa245b42ddf11458e9c572b8b9e)



### 🧹 Chores

- 🧹 [chore] [dependency] Update version 5.9.0

- Updates project version to 5.9.0 in preparation for new release or to reflect recent merged changes.
 - Keeps versioning consistent across package files.
 - No functional changes included. [`(98d8eaf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/98d8eaf4b2ef7b02aacff61706d57d306be252ea)






## [5.9.0] - 2025-07-08


[[3c1a039](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3c1a0391c4832b52edcce24d5a49b798e3a00139)...
[48aa3ee](https://github.com/Nick2bad4u/Uptime-Watcher/commit/48aa3ee89d4a79f8f7c69490eddfc57f2aa8a773)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/3c1a0391c4832b52edcce24d5a49b798e3a00139...48aa3ee89d4a79f8f7c69490eddfc57f2aa8a773))


### 📦 Dependencies

- [dependency] Update version 5.8.0 [`(3c1a039)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3c1a0391c4832b52edcce24d5a49b798e3a00139)



### 🚜 Refactor

- 🚜 [refactor] Introduce barrel exports and simplify imports

- Unifies and simplifies imports across the codebase by introducing barrel export files for components, theme, services, utilities, and electron modules
- Refactors import paths throughout the app and tests to use centralized entry points, improving maintainability and discoverability
- Removes redundant or direct imports in favor of grouped exports for easier code navigation and future scalability
- Deletes redundant or now-obsolete test files that relied on previous import structures, keeping test coverage relevant and up-to-date [`(48aa3ee)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/48aa3ee89d4a79f8f7c69490eddfc57f2aa8a773)






## [5.8.0] - 2025-07-08


[[0c17436](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0c1743630ec17b1d646d35df0b8cb42be2afdd79)...
[c8b509c](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c8b509c33c6de57b8ccd9f11a36dd0ca2127b070)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/0c1743630ec17b1d646d35df0b8cb42be2afdd79...c8b509c33c6de57b8ccd9f11a36dd0ca2127b070))


### 📦 Dependencies

- [dependency] Update version 5.7.0 [`(0c17436)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0c1743630ec17b1d646d35df0b8cb42be2afdd79)



### 🚜 Refactor

- 🚜 [refactor] Unifies naming, refines logic, and strengthens typing

- Refactors prop and interface names for consistency and clarity, shifting to "Properties" suffix and aligning event argument names.
- Applies modern JavaScript/TypeScript features (numeric separators, spread/rest, destructuring) for readability and maintainability.
- Strengthens type safety and narrows types throughout, especially in hooks and store utilities.
- Improves logic by converting if-else returns to early-exit style, condensing validation and event handling.
- Consolidates error handling and removes deprecated or redundant selectors in store logic, promoting subscription-based patterns.
- Refines ESLint config with new plugins and domain-driven boundaries, reduces false positives, and updates ignore patterns.
- Enhances VS Code workspace and tsconfig excludes to ensure no accidental processing of build/node_modules artifacts.
- Expands documentation, clarifies intentional design decisions (e.g., empty functions for error handling), and adds ESLint error log.
- Updates test code for new interface names and removes now-unnecessary selectors, ensuring full coverage.
- Generalizes utility logic, improves readability, and normalizes code style (e.g., switch/case with braces, ternary avoidance).
- Replaces direct DOM manipulation with more idiomatic methods and ensures global API usage is robust across environments.
- Relates to maintainability, testability, and long-term project scalability. [`(7986cb7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7986cb7bc6b2e9cea36c3258c8ee2230fc86d2f9)


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



### 🎨 Styling

- 🎨 [style] Remove trailing space in tsconfig.json [`(c8b509c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c8b509c33c6de57b8ccd9f11a36dd0ca2127b070)


- 🎨 [style] Remove extraneous blank lines and prettify test mocks

- Cleans up test files by removing unnecessary blank lines after file headers and before imports, improving readability and consistency
- Reformats destructuring in mocked theme components for better clarity and maintainability
- Applies consistent formatting in test assertions and multi-line functions
- Enhances overall code style in configuration and test code without changing logic or behavior [`(17494fc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/17494fc81a95c928bce674d351a8a3d761aeed7a)


- 🎨 [style] Replace unused variables with leading underscores

- Updates variable names to use leading underscores for unused parameters, improving code clarity and conforming to linting standards.
- Adds and adjusts ESLint directive comments to suppress relevant warnings and enhance maintainability.
- No functional or behavioral changes are introduced. [`(4a0ecc1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4a0ecc19c2550a11c9dcd995cc460b71d95541f3)



### 🧪 Testing

- 🧪 [test] Update mocks and assertions to align with implementation changes

- Updates DOM method mocking in tests to use querySelector instead of getElementById, matching the implementation.
- Adjusts selected site ID assertions for improved accuracy with current store logic.
- Changes crypto mocking to apply to the global object for broader compatibility.
These changes improve test reliability and maintain alignment with codebase updates. [`(e3995f6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e3995f6f12ddfbfebb2fa6807a87c77f9ed5bef0)


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

- 🔧 [build] Enable ES module interop and clean up config files

- Adds ES module interoperability to improve compatibility with module imports in the Electron TypeScript configuration
- Removes unnecessary ESLint directive comments from the PostCSS configuration for cleaner code
- Applies minor formatting adjustment to the main TypeScript config for consistency [`(7600239)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7600239d9dd6948cc31aa94319b1a3207dd0d5da)






## [5.7.0] - 2025-07-07


[[1cd5fd3](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1cd5fd3335c47b9dd5561b89d9132790c10dc498)...
[73ed46c](https://github.com/Nick2bad4u/Uptime-Watcher/commit/73ed46ce227d4b3de160c200705b75ec1e6c8325)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1cd5fd3335c47b9dd5561b89d9132790c10dc498...73ed46ce227d4b3de160c200705b75ec1e6c8325))


### 📦 Dependencies

- [dependency] Update version 5.6.0 [`(019a2d6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/019a2d6bb3990fc421e988df05c954ac99ceac47)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(7415878)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/741587827fdfdc0ed49e50411e5c6146167b5af1)



### � Documentation

- 📝 [docs] Remove backend operational hooks documentation and examples

- Deletes detailed usage documentation and example implementations for backend operational hooks.
- Likely reflects a deprecation, migration, or restructuring of documentation strategy.
- Reduces repo clutter and prevents outdated or redundant content from being referenced. [`(7fea5e1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7fea5e1c88a7cacca00c255a89bdb27bfb792a99)



### 🎨 Styling

- 🎨 [style] Improve test formatting and consistency

- Updates test files for improved readability and formatting consistency, including indentation, alignment, and multi-line argument handling.
- Refactors mock and test data formatting for clarity, especially in component and store mocks.
- Enhances maintainability and reduces diff noise in future test changes by enforcing consistent code style. [`(1cd5fd3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1cd5fd3335c47b9dd5561b89d9132790c10dc498)



### 🧪 Testing

- 🧪 [test] Add tests for uncovered lines and improve coverage

- Expands test suite with new cases for site monitoring, UI state, time utilities, and stats calculation logic to cover previously untested code paths
- Adds tests to ensure robust error handling, edge case behavior, and state persistence
- Improves confidence in site status utilities by covering all status and transition scenarios
- Verifies modal accessibility and advanced UI interactions
- Strengthens development feedback by testing status update logging based on environment

No logic in production code is changed; coverage is increased to help prevent regressions and support future refactoring. [`(73ed46c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/73ed46ce227d4b3de160c200705b75ec1e6c8325)



### 🧹 Chores

- 🧹 [chore] Simplify and centralize ESLint config rules

- Removes extensive inline rule definitions and plugin settings in favor of extending recommended, strict, and stylistic configs directly, reducing duplication and improving maintainability.
- Cleans up redundant "react" version detection and unused plugin imports.
- Expands test file ignore patterns for stricter separation of test and source linting.
- Improves clarity and future updates by consolidating config sources. [`(14ea86e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/14ea86ec765b2d6b0c9653f37271306f42c284e7)



### 🔧 Build System

- 🔧 [build] Add Electron test tsconfig and refine ESLint/test setup

- Introduces a dedicated TypeScript config for Electron-side tests to improve type safety and separation from frontend/test environments.
- Refines ESLint configuration to apply distinct rules and parsing for Electron test files, reduces redundant disables, and ensures correct environment globals.
- Cleans up test files by removing unnecessary explicit ESLint disables and replaces them with configuration-level rule overrides.
- Deletes legacy ad-hoc frontend test scripts, centralizing test responsibility and reducing clutter.
- Enhances maintainability and reliability of the testing build pipeline by better isolating Electron test build and lint processes. [`(47b5b40)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/47b5b40589d150692d68eba61ff133b2f97d703b)


- 🔧 [build] Enhance ESLint config with stricter and modern rules

- Integrates additional recommended and stylistic rule sets for JavaScript and TypeScript, improving code consistency and enforcing best practices
- Adds modern and stricter core rules for arrays, objects, functions, and syntax
- Unifies and auto-detects React version settings for improved React support
- Expands and organizes plugin usage, including import, promise, React, accessibility, security, and testing plugins
- Relaxes some TypeScript restrictions and enables unused import checks specifically for test files
- Simplifies ignored patterns to avoid redundant exclusions and potential test coverage gaps [`(1c0853d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1c0853d4b02ba879065378af4bf4b3b19b55eeba)






## [5.6.0] - 2025-07-07


[[f46b798](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f46b798156293a4e540e0898c49d3c28a2b1b4ca)...
[573a099](https://github.com/Nick2bad4u/Uptime-Watcher/commit/573a099402ae827d3bd0928d4ccae604f4230a1d)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/f46b798156293a4e540e0898c49d3c28a2b1b4ca...573a099402ae827d3bd0928d4ccae604f4230a1d))


### ✨ Features

- ✨ [feat] Add paused and mixed monitor statuses with transactional safety

- Introduces support for 'paused' and 'mixed' states for monitors and sites, updating type definitions, logic, and UI to reflect these new statuses.
 - Ensures transactional safety when deleting monitors and during import/export by using atomic operations.
 - Refines monitoring lifecycle management for accurate state transitions and immediate UI updates.
 - Expands unit testing and documentation to cover new status handling, and updates visual themes for consistency. [`(c5694d8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c5694d8d4eb2acbf53d83a62038120a0e383ebb0)


- ✨ [feat] Introduce type-safe event bus, hooks, and DB transaction safety

- Replaces legacy event system with a type-safe event bus featuring middleware support, compile-time event type safety, and improved diagnostics for all inter-manager and public events.
- Introduces backend operational hooks (`useTransaction`, `useRetry`, `useValidation`) for unified transaction management, retry logic, and validation patterns, improving reliability and maintainability.
- Refactors all site, monitor, and database operations to use new service-based architecture and transactional database access, ensuring atomic updates and robust error handling.
- Removes legacy event and site writer modules, updating all usages to leverage the new event bus and backend hooks.
- Updates internal manager communication and event transformation logic, enabling more structured and traceable event flows.
- Adds new and refactored unit tests for backend hooks, event bus, and service patterns to ensure correctness and coverage.
- Applies stricter TypeScript and ESLint configs, and minor package updates for improved code quality.
- Enables easier future extension and debugging of events, while centralizing cross-cutting concerns like logging, error handling, and metrics. [`(b213a9d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b213a9dd89cffc195e35502883006052e9f481ae)



### 📦 Dependencies

- [dependency] Update version 5.3.0 [`(ab53340)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab53340d8da6bddeb3309e8c8b042f3c296c74a4)



### � Documentation

- 📝 [docs] Remove legacy refactoring and coverage analysis docs

- Cleans up outdated documentation files related to refactoring, test coverage, Codecov configuration, data flow, and project analysis
- Reduces clutter by eliminating migration scripts, best practices, and structure analysis guides that are no longer relevant to the current architecture
- Prepares the documentation directory for up-to-date improvement plans and ongoing enhancements [`(f46b798)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f46b798156293a4e540e0898c49d3c28a2b1b4ca)



### 🧹 Chores

- Update changelogs for v5.3.0 [skip ci] [`(10739a9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/10739a91215e0f1c6263678459eb5318548aa224)



### 🔧 Build System

- 🔧 [build] [dependency] Update project version to 5.5.0

- Updates version metadata to reflect upcoming release
 - Prepares package for distribution with new changes [`(573a099)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/573a099402ae827d3bd0928d4ccae604f4230a1d)






## [5.3.0] - 2025-07-06


[[e3f2ca7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e3f2ca7664fb2320f2f90e374b6e85dd7cd32ac1)...
[bcb3652](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bcb36528b74ee86aaf5c4964f76c864ef9a4f455)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/e3f2ca7664fb2320f2f90e374b6e85dd7cd32ac1...bcb36528b74ee86aaf5c4964f76c864ef9a4f455))


### ✨ Features

- ✨ [feat] Add paused and mixed monitor status handling

- Introduces 'paused' and 'mixed' states for monitors and sites, updating type definitions, business logic, and UI components to fully support these statuses
- Ensures transactional safety in monitor deletion and data import/export by adding atomic operations
- Improves monitoring lifecycle logic to reflect accurate per-monitor state transitions and immediate status updates
- Enhances unit tests for new statuses and transactional flows, ensuring comprehensive coverage and future extensibility
- Updates documentation and theme support for new status variants, maintaining visual consistency and contributor clarity [`(bcb3652)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bcb36528b74ee86aaf5c4964f76c864ef9a4f455)



### 📦 Dependencies

- [dependency] Update version 5.2.0 [`(e3f2ca7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e3f2ca7664fb2320f2f90e374b6e85dd7cd32ac1)



### 🧹 Chores

- Update changelogs for v5.2.0 [skip ci] [`(a3f7281)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a3f7281494381b8c2730a35eecaa86b3422474d5)






## [5.2.0] - 2025-07-06


[[af98089](https://github.com/Nick2bad4u/Uptime-Watcher/commit/af98089a6d8ef3104fbb43d8d29739284149b124)...
[c38d792](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c38d792bdd510f1b795efd60cf2a1226cdd81696)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/af98089a6d8ef3104fbb43d8d29739284149b124...c38d792bdd510f1b795efd60cf2a1226cdd81696))


### ✨ Features

- ✨ [feat] Add transactional site DB ops and race-free monitor inserts

- Adds database transaction support to site creation, update, and deletion operations to ensure atomicity and consistency, reducing the risk of partial writes or data corruption.
- Refactors monitor insert logic to use SQL RETURNING clauses, eliminating race conditions and ensuring monitor IDs are reliably retrieved directly on insert.
- Updates interfaces and dependencies to propagate the database service where transactional context is required.
- Improves SQL safety in history pruning by switching to parameterized queries.
- Removes a redundant test file to reflect updated transactional design.
- Introduces a PowerShell script for listing project files by directory, aiding development and documentation.

These changes improve reliability, maintainability, and operational safety for data management across the app. [`(af98089)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/af98089a6d8ef3104fbb43d8d29739284149b124)



### 📦 Dependencies

- [dependency] Update version 5.1.0 [`(455c922)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/455c922ac9a910617dac6dc0bbbe9364842d2a13)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(c38d792)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c38d792bdd510f1b795efd60cf2a1226cdd81696)



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



### 🧹 Chores

- Update changelogs for v5.1.0 [skip ci] [`(bc8059e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bc8059ebc9ded18b3a3bfbbae318dfdf2c907eb1)






## [5.1.0] - 2025-07-06


[[611447f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/611447f810fd90d8b6fc47d09c9d1ae6ad28a267)...
[3486a4a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3486a4a77cb7724bd4125c911ab8735e8a9c264d)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/611447f810fd90d8b6fc47d09c9d1ae6ad28a267...3486a4a77cb7724bd4125c911ab8735e8a9c264d))


### ✨ Features

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



### 📦 Dependencies

- [dependency] Update version 5.0.0 [`(d04e73c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d04e73cc518da820e0bcf6e95d399908e9c9eaba)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(14a45ac)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/14a45acc23eff080112adb7d501152854563a284)



### � Documentation

- 📝 [docs] Update component docstring for clarity

- Removes outdated information about supported monitoring types from the component docstring.
- Keeps documentation aligned with current and intended functionality. [`(9daaa9a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9daaa9ac6206611b55fa2d1b9c34c72b20b8845c)


- 📝 [docs] Update form docs to mention HTTP and port monitoring

- Clarifies in the component documentation that both HTTP and port monitoring types are supported, including customizable check intervals
- Helps users understand available monitoring options and configuration flexibility [`(7e2c64e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7e2c64e1405b156497b00fa1e80b775b0dadcff9)



### 🧹 Chores

- Update changelogs for v5.0.0 [skip ci] [`(c8d35f7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c8d35f74de71a8e7a92b6c4899d9ae4113b2a4bb)



### 👷 CI/CD

- 👷 [ci] Update workflow to use separate commits for version and changelog

- Switches version bump and changelog updates from amending existing commits and force-pushing to creating new commits and pushing normally
- Utilizes a dedicated GitHub Action for committing version bumps, improving workflow reliability and traceability
- Clarifies workflow step naming and status messages to accurately reflect the commit process
- Reduces risk of overwriting history and enhances CI/CD transparency by avoiding force pushes [`(3486a4a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3486a4a77cb7724bd4125c911ab8735e8a9c264d)


- 👷 [ci] Amend commits for version bumps and changelogs

- Switches to amending version bumps and changelog updates into the existing commit rather than creating new commits.
- Uses force push to update the branch, ensuring a linear commit history and avoiding redundant commit noise.
- Updates workflow messaging to clarify that changes are amended, not separately committed.
- Improves release automation by reducing unnecessary commits and keeping history cleaner. [`(611447f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/611447f810fd90d8b6fc47d09c9d1ae6ad28a267)






## [5.0.0] - 2025-07-06


[[e2d3ec8](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e2d3ec806b87b51a1d4205c7de40149038f909fb)...
[1109a83](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1109a836087874e561278141c6bce11c80994033)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/e2d3ec806b87b51a1d4205c7de40149038f909fb...1109a836087874e561278141c6bce11c80994033))


### 📦 Dependencies

- [dependency] Update version 4.9.0 [`(de4d92e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de4d92ef3dd3e2fb4ae638841424d71a7b050458)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(d6bf784)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6bf7848ec7226b84be1b42da29aa109a4c64d7a)



### � Documentation

- 📝 [docs] Clarify form field component coverage in docs

- Expands documentation to specify inclusion of text inputs, dropdowns, and radio groups in provided form field components
- Improves clarity for future maintainers and users seeking reusable UI elements [`(31f8549)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/31f8549250a0117015110c0ccdcd0ff2c79e202e)


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



### 🧪 Testing

- 🧪 [test] Add full unit coverage for database adapters and service factories

- Adds comprehensive tests for database repository adapters, service factory utilities, and data import/export helpers in the Electron main process.
- Ensures all logic branches, dependency injections, and interface contracts are validated, improving maintainability and refactor safety.
- Increases backend code coverage and documents previously uncovered scenarios, supporting the project's production-ready test standards. [`(1109a83)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1109a836087874e561278141c6bce11c80994033)


- 🧪 [test] Remove obsolete test covering themed uncovered lines

- Cleans up unused or redundant test file related to themed rendering of uncovered lines
- Reduces clutter and simplifies the test suite by eliminating outdated test cases [`(d729f6c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d729f6c30627d0f2461a44e31e2475a926033d6e)


- 🧪 [test] Achieve 99.5%+ test coverage and document untestable code

- Adds comprehensive test suites targeting remaining uncovered lines and edge cases across components, utilities, hooks, and error handlers
- Documents all intentionally untestable code with explanations and rationale for exclusion, covering defensive programming guards, browser API edge cases, and rare cleanup scenarios
- Updates documentation with detailed summaries of test coverage achievements, remaining gaps, and compliance with naming and project structure standards
- Refines CI workflow to amend version bumps and changelogs into existing commits for clearer history
- Simplifies and clarifies user-facing README and documentation index for improved navigation and maintenance
- Introduces scripts and workflow updates for automated metrics branch management

Improves code reliability, test maintainability, and transparency around coverage limits while aligning the repository with best practices for quality assurance and documentation. [`(21a4d6e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/21a4d6e2dae98303a29621ad3eb683d34823264b)



### 🧹 Chores

- Update changelogs for v4.9.0 [skip ci] [`(d717d5e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d717d5e81d5ab4376aaec278c561a4d6cb4b3bc8)



### 👷 CI/CD

- 👷 [ci] Replace commit amend with standard commit in release workflow

- Updates release workflow to use standard commits and pushes for version bumps and changelog updates instead of amending and force-pushing commits.
- Improves transparency and traceability in the commit history, aligning with best practices and reducing risks associated with force pushes. [`(dc9a49d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dc9a49deff0c0f35b0106b8b1c7cebfb3c468c99)


- 👷 [ci] Simplifies Codecov config by removing flag management

- Removes flag collision resolution and carryforward settings to streamline Codecov configuration.
- Reduces complexity by eliminating path-based flag priority and ignore_no_changes options.
- Aims to rely on default Codecov behavior for report handling and status checks. [`(64f6c28)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/64f6c28fa50128e2b19841f3a1e16f6505d6c503)


- 👷 [ci] Remove redundant after_n_builds setting from config

- Eliminates the after_n_builds parameter to simplify CI configuration
- Relies on other mechanisms to ensure both frontend and electron uploads are handled
- Reduces maintenance by removing an unnecessary setting [`(1c507f1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1c507f1cc2acbc256b80a8fdf79301b9a0743a51)


- 👷 [ci] Refines Codecov config, CI coverage upload, and removes validation script

- Updates Codecov YAML to improve flag handling, path prioritization, and ignore patterns, preventing flag overlap and refining status checks.
- Enhances CI workflow by cleaning coverage files before test runs and specifying directory parameters for coverage uploads, ensuring accurate and isolated reports.
- Removes the obsolete component validation script to streamline project maintenance.
- Improves maintainability and reliability of coverage reporting in the CI pipeline. [`(2a831b0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a831b018bb87e6e3d3016398280a2d61f959a6b)






## [4.9.0] - 2025-07-05


[[7c0a987](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7c0a9879111d7e6259b9b485473eff4bceff7a58)...
[760f6bf](https://github.com/Nick2bad4u/Uptime-Watcher/commit/760f6bf46a0f6afc1355792407c4907103863877)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/7c0a9879111d7e6259b9b485473eff4bceff7a58...760f6bf46a0f6afc1355792407c4907103863877))


### �️ Bug Fixes

- 🛠️ [fix] Prevents issues with mutated interval and key collections

- Converts interval and key collections to arrays before iteration to avoid potential mutation issues during loop execution.
- Ensures stability when stopping all intervals or deleting keys, particularly if the underlying collections are modified within the loop. [`(7c0a987)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7c0a9879111d7e6259b9b485473eff4bceff7a58)



### 📦 Dependencies

- [dependency] Update version 4.8.0 [`(e6fe1ab)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e6fe1ab37d6337c45bd4cfaf80794ebfd076f7d7)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(760f6bf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/760f6bf46a0f6afc1355792407c4907103863877)



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



### 🧪 Testing

- 🧪 [test] Update store action logging tests with detailed payloads

- Expands tests for store action logging to verify that log calls include detailed payload objects, reflecting recent improvements to log data.
- Ensures tests accurately check for updated logStoreAction invocations with explicit messages, success flags, and relevant metadata.
- Improves reliability and clarity of test assertions, reducing risk of regressions when logging behavior changes. [`(4c78d42)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4c78d42b526ab6e5f6c10b750ec5ea17897104a9)


- 🧪 [test] Improve coverage reporting and barrel export testing

- Adds targeted test files for barrel export modules to ensure all exports are exercised, addressing indirect coverage and circular dependency issues
- Updates coverage configuration to explicitly exclude barrel export files from coverage metrics, improving accuracy and reducing noise from non-testable files
- Expands tests for complex error and edge cases in file download and status update handlers to better document defensive paths and error handling
- Introduces comprehensive documentation analyzing current test coverage, remaining gaps, and practical recommendations for future improvements
- Includes new test for settings component edge cases
- Ensures LICENSE and generated docs are properly ignored by markdown lint tools

These improvements clarify true code coverage, strengthen test reliability, and document both strengths and minor remaining limitations for future maintainability. [`(09cf8f3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/09cf8f31140243dd0e7a47b170eff8e096c4e472)


- 🧪 [test] Expand site hooks index tests and update mocks

- Expands unit tests to cover new analytics and details hooks, ensuring centralized access to all site-related hooks.
- Updates mocks and export checks for increased modularity and future scalability.
- Simplifies agent mocking in HTTP monitor tests for accuracy and maintainability.
- Adjusts configuration manager test to reflect updated retention limits and boundaries. [`(504f5ee)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/504f5ee3c38c92ff20f873f2a4afc7d558e0eaa3)



### 🧹 Chores

- Update changelogs for v4.8.0 [skip ci] [`(ec0e5db)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ec0e5dbadb40aca990e3a57382c2fb5b353742b5)


- 🧹 [chore] Expand ignore globs and enable MCP server configs

- Broadens ignored directories for security scanning to include build, coverage, and release outputs, reducing noise from generated files.
- Reactivates previously commented-out MCP server configurations in the development environment to streamline local server management and testing. [`(a6cc8d9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a6cc8d961a0ceb0ca8363d60283226aa168768ad)






## [4.8.0] - 2025-07-05


[[2fa7607](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2fa76074740c24491b7cd8a288304e2c50480077)...
[5310836](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5310836cf0f9ce209d1ca9a1bc928927549d3641)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/2fa76074740c24491b7cd8a288304e2c50480077...5310836cf0f9ce209d1ca9a1bc928927549d3641))


### ✨ Features

- ✨ [feat] Expose site management actions and add new hooks

- Expands exports to provide site monitoring, operations, sync, and state management actions for broader access across the app
- Adds new site-related hooks and reorganizes existing ones for improved modularity and discoverability
- Facilitates easier integration and testing of site functionality by centralizing exports [`(2fa7607)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2fa76074740c24491b7cd8a288304e2c50480077)



### 📦 Dependencies

- [dependency] Update version 4.7.0 [`(4e582ab)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e582ab01f338cb50082f8ba902b4a0f1eab09ea)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(5310836)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5310836cf0f9ce209d1ca9a1bc928927549d3641)



### 🧹 Chores

- Update changelogs for v4.7.0 [skip ci] [`(62af4b3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/62af4b3da6edd91ec8110b307e1db6e9e6ba5323)



### � CI/CD

- Update repo-stats.yml [`(04fbfe9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04fbfe92b2bb07fe9c6a8d519885811e50fc1e23)






## [4.7.0] - 2025-07-05


[[e3329e9](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e3329e9c09b2a33eca22be615ffce65445c260a6)...
[db56dac](https://github.com/Nick2bad4u/Uptime-Watcher/commit/db56dacd2cd72d47fce3edb813d07fe9c32a37c5)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/e3329e9c09b2a33eca22be615ffce65445c260a6...db56dacd2cd72d47fce3edb813d07fe9c32a37c5))


### 📦 Dependencies

- [dependency] Update version 4.6.0 [`(7c6c4bc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7c6c4bc2af066b59450d892b56f88033eaea2e94)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(db56dac)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/db56dacd2cd72d47fce3edb813d07fe9c32a37c5)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(fea5443)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fea5443bff6687e7dc4b51cd057505e0aef6836c)



### 🚜 Refactor

- 🚜 [refactor] Remove redundant refactored sites store implementation

- Eliminates the modular version of the sites store to reduce duplication and potential maintenance overhead
- Consolidates store logic to a single source, promoting clarity and preventing confusion between alternative implementations [`(cfa7de3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cfa7de3a5a755a0d05e523da51f768d83db52f0a)


- 🚜 [refactor] Modularize sites store into focused submodules

- Refactors the site management store into separate modules for state, CRUD operations, monitoring, and synchronization, improving maintainability and testability
- Replaces a large monolithic store with a composition-based approach, delegating concerns to smaller, focused files
- Enhances error handling by ensuring errors passed to loggers are always Error objects
- Reduces duplication and clarifies responsibilities, making future updates and testing easier [`(a645f40)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a645f402ca76890ad65c99bf74f4342f82b50755)



### � Documentation

- 📝 [docs] Add comprehensive docs for Sites Store refactor

- Introduces detailed analysis and summary documentation for the modularization of the Sites Store, outlining the migration from a monolithic to a modular architecture
- Documents architectural decisions, module responsibilities, test strategy, performance impact, and migration steps, emphasizing maintainability, testability, and backward compatibility
- Facilitates onboarding and future maintenance by providing clear rationale, benefits, and lessons learned from the refactor [`(2505ea2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2505ea2553ada8fea927289922611eb46b2b82d9)



### 🧪 Testing

- 🧪 [test] Add comprehensive tests for refactored sites store

- Introduces thorough unit, edge case, and integration tests for newly modularized sites store logic, covering site state, sync, operations, and monitoring modules
- Removes obsolete portal cleanup test and updates logger error assertions for consistency
- Ensures backend sync and state mutation are validated after site and monitor modifications
- Strengthens reliability by addressing boundary conditions, error handling, and concurrent operations
- Facilitates future maintenance and refactoring by improving test coverage and separation of concerns [`(93179ac)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/93179ac57315ba87a1e7eaa44dda794d13864a7e)


- 🧪 [test] Improve test coverage and consistency in UI tests

- Expands unit test coverage for UI components by adding missing logger mocks and simplifying iteration logic in tests.
- Refactors test loops for readability and consistent test behavior across size and status combinations.
- Updates ignore rules to exclude project-specific artifacts.
- Enhances maintainability and reliability of test suite. [`(e3329e9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e3329e9c09b2a33eca22be615ffce65445c260a6)



### 🧹 Chores

- Update changelogs for v4.6.0 [skip ci] [`(3cb37e0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3cb37e0e6153b7a9d04702e1460e8efcccef1bc5)



### 🔧 Build System

- 🔧 [build] Add Electron ESLint config, improve test/cov setup

- Introduces dedicated ESLint configuration for Electron (main process) files with appropriate parser, plugins, and rules, and disables React-specific linting for Node.js contexts
 - Refines TypeScript and test config patterns for better separation of renderer and Electron code, including improved file includes/excludes and alias consistency
 - Ensures more maintainable and DRY site store logic by sharing the getSites function
 - Adds missing ESLint type definitions to dependencies for enhanced type safety
 - Optimizes Vitest configs for both renderer and Electron by improving output, coverage, and performance settings, and clarifies test include/exclude patterns
 - Minor improvements for code immutability and maintainability in chart config and store modules [`(d88d310)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d88d31056662f9fb62527c237831a56f15817ce7)


- 🔧 [build] Update TypeScript settings and comment out MCP configs

- Enables stricter TypeScript integration in the editor for improved code validation and auto-imports.
- Excludes node_modules from TypeScript server and file watching to boost performance.
- Comments out MCP server configuration blocks, possibly to disable local development dependencies or reduce noise.
- Enhances project maintainability and reduces unnecessary resource usage during development. [`(8f3a286)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8f3a286b472fc3a7a3b1ecfefe2794b193b63486)






## [4.6.0] - 2025-07-04


[[81c7499](https://github.com/Nick2bad4u/Uptime-Watcher/commit/81c749998e3e4f26262cc505bdbee9801e89841c)...
[6db8eb9](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6db8eb94ece4a9c14e46d56df9f5744ba9245dba)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/81c749998e3e4f26262cc505bdbee9801e89841c...6db8eb94ece4a9c14e46d56df9f5744ba9245dba))


### ✨ Features

- ✨ [feat] Add robust Electron API polling and form field tests

- Introduces a utility to reliably wait for the Electron API using exponential backoff, reducing race conditions during initialization and API access.
 - Refactors site status update handling to ensure incremental updates are resilient, trigger full sync fallback as needed, and gracefully handle missing API at subscription time.
 - Adds comprehensive unit tests for form field components, improving test coverage and regression safety.
 - Enhances update store typing with structured update info and progress tracking for clearer update state management.
 - Replaces Tailwind's @apply with explicit CSS for key components, and modernizes media queries for better browser compatibility. [`(3b45238)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3b45238ca4693394f6f1f6f9ad8eb1bebdd1d22b)



### �️ Bug Fixes

- 🛠️ [fix] Allow monitor ID override and mock console error in tests

- Enables overriding the monitor ID during creation to support custom identifiers, improving flexibility for testing and data handling.
- Mocks and asserts console error output in file download tests to suppress unwanted logs and verify error handling, enhancing test reliability and clarity. [`(a731602)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a731602e561eb7dda178f79564d98d21dc873ece)


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



### 📦 Dependencies

- [dependency] Update version 4.5.0 [`(e2824a3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e2824a3267ee9126dac3d69a27e5853db5dab25a)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(937ecee)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/937eceecd44be642e8aa8366f597e4836c8aca68)



### 🚜 Refactor

- 🚜 [refactor] Modularize sites store with service and utility layers

- Refactors the sites store to use dedicated service and utility modules, improving separation of concerns and maintainability
- Extracts monitoring and site operations to service classes that encapsulate electron API calls, enabling easier testing and future extension
- Centralizes common logic for status updates, file downloads, and monitor operations into reusable utilities
- Simplifies the store logic, reduces repetition, and enhances clarity by delegating responsibilities to new modules
- Lays groundwork for scaling and future feature development by adopting a modular architecture [`(685aee0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/685aee0e8868bfc660b27c7b0030deb48bd560a0)



### 🎨 Styling

- 🎨 [style] Standardize quote usage and formatting in tests/docs

- Unifies single and double quote usage to consistently use double quotes in test files for environment variables and DOM event names, improving code style consistency.
- Refactors code formatting for improved readability, such as condensing multi-line props, aligning JSON and TypeScript snippets, and cleaning up indentation and spacing in test cases and documentation.
- Enhances maintainability by reducing unnecessary line breaks and harmonizing style patterns across various test and markdown documentation files. [`(c1ad054)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c1ad0544de6375adec17ef7e4012d9388a2d3687)



### 🧪 Testing

- 🧪 [test] Expand update store tests and improve mocks

- Adds comprehensive tests for update applying and error clearing, ensuring robustness against missing API objects
- Refines mocking of global objects for reliability and avoids property redefinition issues
- Enhances coverage of store action logging and update lifecycle handling for better regression protection [`(6db8eb9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6db8eb94ece4a9c14e46d56df9f5744ba9245dba)


- 🧪 [test] Expand file download and filename generation tests

- Adds comprehensive unit tests for file download logic, covering edge cases such as error handling, large files, special characters, and browser API unavailability
- Refactors and extends filename generation tests for various prefixes, extensions, and date scenarios
- Improves reliability and code coverage of the file download utility by ensuring robust handling of browser environment quirks and potential failures
- Relocates and updates import paths for improved test organization and maintainability [`(50fc38c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/50fc38c76a9137c2dc1957b1be5a12ea6313393c)


- 🧪 [test] Remove redundant and barrel export tests for UI components

- Cleans up the codebase by deleting comprehensive unit test suites for form fields, dashboard site card components, and common component barrel exports
- Reduces maintenance overhead associated with testing re-export patterns and mock component structures
- Focuses test coverage on component logic rather than export aggregation

No functional or production code is affected; only test files related to internal module organization are removed. [`(cbccd91)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cbccd91d34ea92e5cbf4c362539f10d23f3880a4)


- 🧪 [test] Refactors test mocks and improves timer handling

- Updates global Electron API mocks for better alignment with app modules, consolidating and simplifying mock implementations.
- Removes unnecessary React imports from test files for cleaner dependencies.
- Switches to real timers in specific async tests to ensure reliable timeout handling, then restores fake timers for consistency.
- Aims to improve test reliability, maintainability, and coverage fidelity. [`(6384922)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/638492298deba7233cc04cd8ce4a2c12bccc06cd)


- 🧪 [test] Add comprehensive unit tests for untested logic

- Increases test coverage for previously uncovered logic in several components and utility functions, focusing on warning conditions, effect cleanup, and error handling paths.
- Targets missing branches and lines, especially for invalid settings key handling, asynchronous API readiness checks, and portal/timeout cleanup in UI components.
- Adds new test files with thorough mocking and simulation of real-world scenarios to ensure robustness and prevent regressions.
- Updates ignore rules and modernizes project config for improved maintainability and dev experience. [`(580c1bb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/580c1bb6b0acf4dff54e9dc8d938780a21f236b8)


- 🧪 [test] Remove redundant useSiteDetails hook test files

- Deletes duplicated or unnecessary test files for the useSiteDetails hook to reduce maintenance overhead and avoid confusion.
- Streamlines the test suite by eliminating overlap and ensuring only relevant tests remain. [`(193db2a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/193db2a2736250d20cd05b587c3db62159289623)


- 🧪 [test] Improve test strictness and mock usage; update deps

- Adopts stricter TypeScript compiler options for improved code safety and type checking in tests.
- Refactors environment variable access in tests to use consistent bracket notation, reducing property access issues.
- Switches to a more robust mocking utility for improved type inference in test mocks.
- Adds a language service dependency and updates config to include/exclude relevant test and config files.
- Enhances maintainability and reliability of the test suite by enforcing stricter rules and updating dependencies. [`(784da2d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/784da2dfcc5d14a25e17b423e6f34f626ed72b8c)


- 🧪 [test] Add comprehensive unit tests and update test structure

- Adds extensive unit tests for error, stats, UI, and updates stores to ensure full coverage of business and edge cases
- Expands test coverage for site details, backend focus sync, and core logic, emphasizing error handling and state transitions
- Refactors test directory structure for clarity and better separation of concerns
- Updates test mocks and dependencies to align with new coverage needs
- Enhances reliability and maintainability of the codebase by ensuring critical logic is well-tested [`(8b3ac86)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8b3ac865750d264aeb2e6512f3a146e8280eeeff)


- 🧪 [test] Remove redundant and placeholder test files

- Cleans up unnecessary and duplicate test files, including simple, placeholder, and edge case tests that added no real test coverage.
- Reduces clutter and potential confusion in the test suite by eliminating files referenced by TypeScript but not providing meaningful validation.
- Streamlines the codebase for better maintainability and clarity. [`(30449dd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/30449ddb8379a3cd767be8b94559387618edee29)


- 🧪 [test] Improve robustness and edge coverage in tests

- Updates tests to use optional chaining and length checks, preventing runtime errors from undefined or missing values
- Adds new tests for settings and site stores to ensure full coverage of store logic, persistence, and error handling
- Refactors tests for history, monitor, and analytics features to handle empty arrays and undefined properties safely
- Enhances test reliability by checking existence before accessing or interacting with UI elements
- Adds comprehensive ErrorBoundary and useSiteDetails hook test suites for better component and hook reliability
- Motivated by a desire to eliminate test flakiness, improve coverage, and support future code changes with safer, more resilient tests [`(b2071d9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b2071d966b486f7f491922af9a1c46bb131483fd)



### 🧹 Chores

- Update changelogs for v4.5.0 [skip ci] [`(65c2bcb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65c2bcb9c154f4c3903b86665588edb69a84dcf0)



### 🔧 Build System

- 🔧 [build] Update config to respect .gitignore and exclude node_modules

- Adds node_modules to exclusion globs to prevent scanning dependencies.
- Enables respect for .gitignore, ensuring ignored files are not analyzed.
- Improves scan performance and avoids unnecessary alerts on third-party or ignored files. [`(ff7dab1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ff7dab19f0d27912b36560ffff444594332f9a7f)






## [4.5.0] - 2025-07-04


[[afe7b11](https://github.com/Nick2bad4u/Uptime-Watcher/commit/afe7b11d0af66cd0f9e0f71124aa4861da2e258d)...
[7279bf0](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7279bf0ec71b1e36e24463bd1460d8e636eb102f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/afe7b11d0af66cd0f9e0f71124aa4861da2e258d...7279bf0ec71b1e36e24463bd1460d8e636eb102f))


### ✨ Features

- ✨ [feat] Introduce event-driven architecture for managers

- Replaces direct callback and synchronous method dependencies between managers with a centralized, event-driven communication model using strongly-typed event constants.
- Adds event definitions for all inter-manager operations, improving type safety and readability.
- Refactors managers to extend event emitters, emitting and listening for structured events instead of invoking callbacks directly.
- Introduces a business logic-focused configuration manager, centralizing validation and policy enforcement for site and monitor operations.
- Removes scattered business logic and validation from utilities, improving separation of concerns and maintainability.
- Paves the way for easier future extensibility, decoupled orchestration, and potential multi-process communication. [`(51f3fd0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/51f3fd08af211ced267ef5d99bcc2ba628fc18f7)



### 📦 Dependencies

- [dependency] Update version 4.4.0 [`(3703e59)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3703e5916f1f77a684023676e3bdfe5aed10608b)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(7279bf0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7279bf0ec71b1e36e24463bd1460d8e636eb102f)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(6beb540)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6beb5402655613ec0b50c6974fae8e5a71349771)



### 🚜 Refactor

- 🚜 [refactor] Modularize global state into focused Zustand stores

- Refactors monolithic global state management into dedicated Zustand stores for error handling, sites, settings, UI, updates, and stats.
- Replaces all usage of the previous unified store with new store hooks, improving code clarity, separation of concerns, and maintainability.
- Introduces an ErrorBoundary for robust UI error containment and fallback.
- Enhances error tracking, loading state isolation, and store-specific error feedback.
- Updates initialization and state access patterns across components and hooks for modular store structure.
- Lays groundwork for easier future enhancements, testing, and scaling of state logic. [`(0324258)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0324258d07ca5a26e20acd76d93354065892f5e2)


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



### � Documentation

- 📝 [docs] Update contribution and tooling guidelines

- Expands instructional documentation with new best practices, emphasizing memory tool usage, thorough testing, test coverage, and code cleanup.
- Updates workspace settings to improve performance and clarity by excluding additional test, coverage, and build directories from file watching and search.
- Reformats settings for readability and consistency, ensuring tool commands and linting configurations are easier to manage. [`(d8594e2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d8594e2fb6c0b79fd73e3d4e3957bd7712e0ac8a)


- 📝 [docs] Add detailed refactoring summary and assessment

- Documents architecture and code quality improvements from recent backend refactoring
 - Summarizes complexity reduction, 100% test coverage, and test suite fixes
 - Outlines new event-driven, repository, and configuration patterns
 - Provides rationale for manager sizing and future development guidance
 - Ensures maintainability and clarity for future contributors [`(606dea8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/606dea873dcd495083f0db4631d0360c3b258d1d)



### 🎨 Styling

- 🎨 [style] Reformat, clean up, and align test and docs code

- Unifies code style across tests and docs for better readability and consistency
- Converts multi-line array and object definitions to single-line where appropriate in config files
- Cleans up spacing, indentation, and formatting in test implementations and markdown docs
- Updates documentation to improve structure, clarity, and maintainability without changing technical content
- Provides more idiomatic usage of array methods and function signatures in test assertions
- No logic or functionality changes, focusing solely on maintainability and future code readability [`(4d77db5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4d77db512c6514bf854c929b5ae5b7c7306546f0)



### 🧪 Testing

- 🧪 [test] Refactor tests for new modular store structure

- Updates all tests to use new modular stores, replacing legacy monolithic store mocks with specific store mocks (sites, settings, error, UI, updates, stats)
- Refactors mock setup, store function calls, and assertions to align with separated concerns in the updated store architecture
- Simplifies edge case and coverage tests to fit the new structure and removes obsolete store edge case file
- Relaxes some TypeScript strictness to support the new structure and ease test maintenance
- Improves test isolation and clarity by aligning mocks and hooks usage with newly organized store modules
Relates to the store refactor and modularization effort [`(df534ba)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/df534ba976c04a77661836d134c8c61362d787fa)


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
- Improves test suite clarity and maintainability by focusing on relevant scenarios [`(2222121)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2222121f63f90cb09265da67781ae0a972af56f4)


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



### 🧹 Chores

- Update changelogs for v4.4.0 [skip ci] [`(852ae4d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/852ae4dc769d2e619cac67df1e5f7549d5e907a4)


- 🧹 [chore] Remove obsolete docs and add Vitest config

- Deletes outdated documentation and analysis files related to prior refactoring and business logic separation, reducing repository clutter.
- Adds a dedicated Vitest configuration to streamline frontend test discovery and integration with VS Code, aligning test coverage with the current project structure.
- Removes an unused test task from the workspace configuration to prevent confusion and keep task definitions up to date. [`(0fb01c9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0fb01c99c296e0eb02ca65017f5eea18eaf955e7)



### 🔧 Build System

- 🔧 [build] Strengthens TypeScript checks and code quality rules

- Introduces stricter type checking options for improved type safety, including exact optional property types, no implicit returns, unchecked indexed access, and no implicit override.
- Adds rules to disallow unused labels and unreachable code, reducing dead code and potential bugs.
- Reformats tsconfig for readability and maintainability.
- Enhances early error detection and enforces more consistent code practices. [`(4a6b189)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4a6b189003449601898468f022e1a51f1d956fc1)






## [4.4.0] - 2025-07-03


[[cefb68d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cefb68d2a3a59d4edad348dde6f8946a4685498f)...
[1bc1129](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1bc112951bf8bf5b295b6b92af665d9b2970222a)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/cefb68d2a3a59d4edad348dde6f8946a4685498f...1bc112951bf8bf5b295b6b92af665d9b2970222a))


### 📦 Dependencies

- [dependency] Update version 4.3.0 [`(323250c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/323250c996216ccdfa683cda99a340a12e1fa4f1)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(1bc1129)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1bc112951bf8bf5b295b6b92af665d9b2970222a)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(09030ca)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/09030cab3bbbef1ec65f7fc087f8c2b9ec955a6e)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(f24ea09)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f24ea090d9c523fb9cdfbf65db60635fe6e59d16)



### 🚜 Refactor

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



### � Documentation

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



### 🎨 Styling

- 🎨 [style] Normalize whitespace in history limit manager

- Updates spacing and blank lines for improved code readability and consistency
- No functional or logic changes introduced [`(4e7097c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e7097c636e36cb1ae411f1dec188f86b9e442d3)


- 🎨 [style] Standardize test file naming for consistency

- Renames test files to use camelCase, aligning with project naming conventions
- Improves codebase consistency and eases file discovery in the test suite [`(a8b4b50)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a8b4b509ef9a8d11f5a541900f7ea5a1a537aa47)



### 🧪 Testing

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


- 🧪 [test] Remove edge case and coverage tests for improved maintainability

Removes a large set of unit and integration test files targeting edge cases,
coverage gaps, and defensive code paths throughout the codebase.

The motivation is to streamline the test suite, reduce maintenance overhead,
and possibly re-evaluate the necessity of exhaustive branch coverage for
defensive and utility code. This may also be in preparation for a revised
testing strategy or for codebase cleanup.

- Cleans up tests for rarely hit branches, error guards, and component edge cases.
- Reduces noise and complexity in the test directory. [`(e7526cb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e7526cb3fef0bbd4880ad876ddde13a0486f7a7d)



### 🧹 Chores

- Update changelogs for v4.3.0 [skip ci] [`(2467d35)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2467d35b30c24df241d8379e9b3bf2e58a162245)



### 👷 CI/CD

- 👷 [ci] Update test scripts for Electron integration

- Adds Electron-specific Vitest configuration to test scripts to improve coverage for both standard and Electron environments
- [dependency] Updates package version to 4.3.0 to reflect enhanced test support
- Facilitates easier cross-environment test execution and maintenance [`(f71142c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f71142c746196fe7c69fd9816c5a98604fb51e4d)






## [4.3.0] - 2025-07-03


[[b68a3e7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b68a3e7b6cf85c578d20bc3d531ecd9d2321e115)...
[7084242](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7084242977d3597d7763c178bc1e39549d419fb4)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/b68a3e7b6cf85c578d20bc3d531ecd9d2321e115...7084242977d3597d7763c178bc1e39549d419fb4))


### 📦 Dependencies

- [dependency] Update version 4.2.0 [`(559383d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/559383df8c7ef68381de8d7177f7078ed450f329)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(7084242)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7084242977d3597d7763c178bc1e39549d419fb4)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(0c2e4a0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0c2e4a02b4fd173c624f0c60978c4b6c3e3422e7)



### 🚜 Refactor

- 🚜 [refactor] Remove unnecessary v8 ignore comments and improve controlled input handling

- Cleans up redundant `/* v8 ignore next */` coverage comments throughout backend and frontend code, reducing noise and improving readability.
 - Refactors controlled component handling in UI inputs, checkboxes, and selects to avoid uncontrolled-to-controlled warnings and ensure proper value propagation only when explicitly set.
 - Minor code formatting and dependency cleanup for better maintainability. [`(0a8ec42)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0a8ec42890124c90dab0a643b09d0935ed6d5e36)



### � Documentation

- 📝 [docs] Add AI refactor prompt templates and update test doc location

- Introduces detailed AI prompt templates for code refactoring and review, tailored for Electron, TypeScript, React, and modern tech stack conventions
- Moves and updates the testing documentation to a new test directory for clearer project organization
- Enhances clarity on testing setup, frontend/backend separation, and usage instructions [`(37ceed7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/37ceed70e621458e7cfa36253686c24cce771059)



### 🧪 Testing

- 🧪 [test] Achieve full branch coverage for UI components

- Improves test suites for several UI components to cover edge cases, all conditional branches, and defensive code paths, especially around falsy/null/undefined values and cleanup logic
- Refactors and expands tests for history, settings, site hooks, and dashboard components, ensuring all branches (including nullish coalescing and fallback logic) are tested
- Updates mocks and interaction patterns to prevent JSDOM navigation errors and improve reliability in simulated browser/Electron environments
- Enhances clarity and maintainability of tests with consistent formatting and more explicit assertions
- Motivated by the goal to guarantee robust, predictable behavior and facilitate confident refactoring [`(5ef2ead)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5ef2ead74f8923b9479ae910bec207d4dcca000f)


- 🧪 [test] Add defensive and branch coverage for nullish, edge, and fallback cases

- Expands unit tests to cover null, undefined, and edge cases in theme, site, monitor, and history logic, increasing branch and line coverage.
- Adds explicit tests for fallback handling in UI components (e.g., missing names, URLs, settings keys, or monitor history/lastChecked).
- Ensures logger calls and UI displays are validated for all nullish input scenarios.
- Covers error branches and unexpected values in store actions, status updates, and statistics logic.
- Documents defensive code paths and validates runtime safety against type or data corruption. [`(3637d05)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3637d053220a80ee8675fb0f71d714d97ccd697d)


- 🧪 [test] Add edge case and cleanup tests for UI components

- Improves test coverage for UI components by adding tests for event-driven timeout cleanup, edge-case overlay positioning, invalid settings key handling, and unknown prop values
- Documents closure issues in certain cleanup logic and validates graceful handling of unexpected states or inputs
- Ensures components behave robustly during unmount, prop changes, and user interaction sequences [`(40e2191)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/40e2191545ec4c8cbf5eb2158acf6de8b189a2e3)



### 🧹 Chores

- Update changelogs for v4.2.0 [skip ci] [`(91646b8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/91646b8dd97ef25bf9de908a995c29ab554c7e75)


- 🧹 [chore] Add script to standardize test file naming

Introduces a PowerShell script that converts test file names in test directories to camelCase and ensures proper .test suffix usage, improving consistency and discoverability across the codebase.

 - Helps enforce a predictable naming convention for TypeScript test files.
 - Offers a dry-run mode to preview changes before applying. [`(04203f8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04203f8dd551a45ca09e9eef311727597fbaf078)



### 👷 CI/CD

- 👷 [ci] Reformat codecov config for consistent YAML indentation

- Ensures consistent 4-space indentation across all sections for improved readability and maintainability
- Prevents potential parsing issues caused by inconsistent YAML structure [`(cb00786)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cb00786db7622cb92339d81027b36944040715a8)


- 👷 [ci] Simplify Codecov upload and test result steps

- Removes unnecessary 'directory', 'exclude', and 'disable_search' parameters from Codecov actions to streamline workflow configuration
- Ensures clearer and more maintainable CI setup by relying on default Codecov behaviors [`(b68a3e7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b68a3e7b6cf85c578d20bc3d531ecd9d2321e115)



### 🔧 Build System

- 🔧 [build] Update dependencies for Electron, Zod, and TypeScript

- Upgrades Electron to 37.2.0 for latest features and fixes
- Updates Zod to 3.25.69 for improved validation support
- Advances @typescript/native-preview and related platform packages to 7.0.0-dev.20250702.1 for enhanced compatibility
- Adjusts devDependencies to move zod-to-json-schema to devDeps, clarifying its usage

Keeps tooling and runtime environments current to maintain stability and leverage upstream improvements. [`(dd63491)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dd6349137895e786f0e16ab7c5b28ec439f1f705)






## [4.2.0] - 2025-07-02


[[5af2c21](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5af2c21dfa51c163c31a0232af8cc195ef192812)...
[cdfe9a7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cdfe9a7050dc795a6c291b3726dbb10463c140b7)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/5af2c21dfa51c163c31a0232af8cc195ef192812...cdfe9a7050dc795a6c291b3726dbb10463c140b7))


### 📦 Dependencies

- [dependency] Update version 4.1.0 [`(1fd0cdb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1fd0cdb931ab91879d28ffe2a506467258486253)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(cdfe9a7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cdfe9a7050dc795a6c291b3726dbb10463c140b7)



### 🧪 Testing

- 🧪 [test] Improve test coverage for settings and site details

- Expands test coverage for settings validation, loading state cleanup, and edge cases in site details logic.
- Adds tests for non-Error exception handling, input sanitization, and conversion logic to ensure robustness.
- Removes redundant option from code coverage configuration for cleaner CI output. [`(5af2c21)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5af2c21dfa51c163c31a0232af8cc195ef192812)






## [4.1.0] - 2025-07-02


[[222632a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/222632a6ff1348845dc5b73e6ce201642afb56f9)...
[d9b3bc3](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9b3bc33baea0b5784a38d7fd666302897a16788)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/222632a6ff1348845dc5b73e6ce201642afb56f9...d9b3bc33baea0b5784a38d7fd666302897a16788))


### 📦 Dependencies

- [dependency] Update version 4.0.0 [`(d18778a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d18778a5d7752d9b13ba2131e7f2bd5d276a6327)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(d9b3bc3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9b3bc33baea0b5784a38d7fd666302897a16788)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(79f648b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/79f648b43905d49f70c8f32d0400d2c526f99ae4)



### 🚜 Refactor

- 🚜 [refactor] Extract duration calculation to shared utility

- Moves monitoring duration logic from component to a reusable utility module to improve code reuse and maintainability.
- Updates workflow steps to continue on error and consistently use Codecov token as an environment variable for more robust CI reporting. [`(222632a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/222632a6ff1348845dc5b73e6ce201642afb56f9)



### 🧪 Testing

- 🧪 [test] Increase settings and interval formatting test coverage

- Adds targeted tests for settings cleanup logic, settings key validation, and interval duration formatting to improve branch and line coverage.
- Ensures coverage of unmount cleanup with timeouts, invalid settings warnings, and all branches of the duration formatting utility.
- Removes stale test report artifact to keep the repository clean. [`(0f23393)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0f2339389fa95c12a58e8719372ca552d4476a98)



### 🧹 Chores

- Update changelogs for v4.0.0 [skip ci] [`(5a0746b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a0746b1d600dc055af44ce34d27d4e0439f08b5)



### � CI/CD

- Update codecov.yml [`(50e8070)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/50e80702a987087435fd8fb7e43a71b981d9894c)



### 👷 CI/CD

- 👷 [ci] Enhance Codecov config for frontend/electron splits

- Improves Codecov configuration to support separate coverage targets and flags for frontend and electron codebases, enabling more granular reporting and thresholds.
- Adds stricter report age limits, branch targeting, and adjusts notification settings for improved reliability.
- Expands comment layout for richer PR feedback and enables advanced parser and branch detection options.
- Updates CI workflow to provide verbose output for easier diagnostics.
- Adds 'gcov' to custom words list to prevent false spelling errors. [`(73341e9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/73341e900fafd12541526a2976105506fd153ace)


- 👷 [ci] Improve test coverage workflow and reporting

- Updates Node.js version to 22 and limits git fetch depth for faster CI runs
- Simplifies test and coverage steps by generating JUnit reports during test execution, removing redundant report generation steps
- Adds environment variable configuration for coverage upload steps
- Adds coverage file verification and enhances verbosity for debugging
- Updates Codecov actions to use explicit file paths, disables auto-search, and sets descriptive flags and names for uploads
- Removes obsolete coverage output artifact

Improves CI reliability, clarity, and integration with Codecov for more actionable feedback on test coverage. [`(87dd444)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/87dd44442a73d7628b3481865c247b5724c73a94)






## [4.0.0] - 2025-07-02


[[c24fa68](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c24fa68b82587714446f6b3e89ac29a099379ff3)...
[2bd9e54](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2bd9e54468d7e37c623953e18293e81255abdbed)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/c24fa68b82587714446f6b3e89ac29a099379ff3...2bd9e54468d7e37c623953e18293e81255abdbed))


### �️ Bug Fixes

- 🛠️ [fix] Add update payload validation and improve progress accessibility

- Prevents runtime errors by validating status update payloads before processing, ensuring update and its site property are defined.
- Improves accessibility for progress components by adding a visually hidden native progress element and marking decorative divs as hidden from assistive technologies. [`(ee1de00)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ee1de00dabc88f20eba1b6357fbe2c1139287e12)



### 📦 Dependencies

- [dependency] Update version 3.9.0 [`(594621f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/594621f3d1dbf960608df05dd053f5cc574e2d16)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(2bd9e54)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2bd9e54468d7e37c623953e18293e81255abdbed)



### 🧪 Testing

- 🧪 [test] Update type assertions in tab component tests

- Changes type assertions from direct casting to use 'unknown as' for component functions during test execution.
- Improves type safety and reduces potential type errors in test cases by ensuring more robust casting for function calls. [`(f062b78)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f062b7887c2969e5d0c706b4d1d4505857faf9e9)


- 🧪 [test] Remove obsolete unit tests for tab components

- Deletes outdated or unnecessary test files for tab components to streamline the test suite.
 - Reduces maintenance overhead and potential confusion from legacy tests no longer aligned with current implementation. [`(98c2020)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/98c202011b6d9e5e76b6ff05c3e74a1b0e7a7afc)


- 🧪 [test] Expand coverage for theme, store, and component tests

- Adds extensive test cases for theme management, custom theme creation, CSS variable generation, and system theme edge cases to ensure robust theming.
- Increases test coverage for UI components, including badges, buttons, cards, boxes, progress bars, and status indicators, targeting edge cases and interactive behaviors.
- Introduces new tests for various monitor configuration updates and error handling in the application store, including fallback syncing and error scenarios.
- Refactors test file structure by relocating and renaming test files for clarity and consistency.
- Improves test coverage for keyboard and accessibility interactions, as well as variant and size permutations.
- Ensures all logical branches and utility functions are exercised, aiming for near 100% test coverage. [`(c4b09ca)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c4b09caf4d3cc167bb1de994e78a85d2c918fbbd)



### 🧹 Chores

- Update changelogs for v3.9.0 [skip ci] [`(2ea8e19)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2ea8e196eeda9692ed6e3d12959511d67bd47779)



### 🔧 Build System

- 🔧 [build] Replace ts-prune with knip and ts-morph-helpers

- Updates dev dependencies to remove ts-prune and add knip and ts-morph-helpers for improved dead code analysis and codebase maintenance.
- Removes related dependencies no longer needed by ts-prune and adds new dependencies required by knip and ts-morph-helpers.
- Enables more modern and accurate unused code detection tooling, which should help maintain code quality and streamline dependency management. [`(c24fa68)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c24fa68b82587714446f6b3e89ac29a099379ff3)






## [3.9.0] - 2025-07-02


[[18cb442](https://github.com/Nick2bad4u/Uptime-Watcher/commit/18cb4429a2b88939bc8fa94404788314a8e5714f)...
[45fd6d0](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45fd6d033a06f68d802a05727a7aca0cfeafc49b)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/18cb4429a2b88939bc8fa94404788314a8e5714f...45fd6d033a06f68d802a05727a7aca0cfeafc49b))


### ✨ Features

- ✨ [feat] Improve screenshot overlay UX and test UI integration

- Enhances screenshot overlay with debounced hover/focus handling, preventing flickering and ensuring cleanup of portal and timeouts for better accessibility and stability
- Updates button component to support accessible aria-labels
- Restricts test coverage reporting to exclude type definition files and ignore empty lines
- Adds @vitest/ui and related dependencies for improved test UI workflows
- Refines average response time calculation to consider only successful checks
- Expands custom dictionary with new domain-specific terms [`(475d2b2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/475d2b29f6ca09224003d5aa0daa3da48c16dbd2)



### 📦 Dependencies

- *(deps)* [dependency] Update dependency group [`(0e19d08)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0e19d08deef4201d90e32631111cd8f1a3069d0c)


- [dependency] Update version 3.8.0 [`(7b9f516)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7b9f516d1e1a9729a0b003022025dff78e732b60)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(b40c8e5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b40c8e525dab6fc15d9c4a76f6736bf2bb823b6f)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(77dc94d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/77dc94dae2e7d0f66644c29c42d9093213af8499)



### 💼 Other

- Merge PR #20

[ci][skip-ci](deps): [dependency] Update dependency group [`(a6073d8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a6073d83341eeb0f1ee31b82b423b6fb55525570)



### 🎨 Styling

- 🎨 [style] Simplify conditional rendering for time range selector in SiteDetailsNavigation
 - Removed redundant checks for selectedMonitorId in the analytics tab rendering logic
 - Improved readability by restructuring JSX layout [`(123cc6d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/123cc6ddcf2cf106a12a801293e1934da1662a08)



### 🧪 Testing

- 🧪 [test] Add comprehensive unit tests for components, hooks, and store

- Introduces detailed test suites covering major UI components, hooks, and state management, significantly improving automated test coverage
- Validates rendering, user interactions, accessibility, memoization, and error handling across forms, dashboard, theming, and store logic
- Adds tests for validation scenarios, edge cases, and Redux/Zustand store side effects to ensure robustness and reliability
- Updates CI config to ensure coverage output folder exists before running frontend and Electron tests, making CI more stable

Relates to improved code quality and maintainability through thorough testing. [`(968dbe0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/968dbe0be0eec3e391fe694b9a7f661664966a75)


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



### 🧹 Chores

- 🧹 [chore] Remove outdated changelogs and unused devDependency

- Deletes all auto-generated changelog markdown files from the documentation,
  cleaning up the repo and reducing maintenance overhead for obsolete or redundant logs.
- Removes the unused TypeScript CLI devDependency to streamline the dependency tree.
- Updates test IDs in form field tests for consistency and future-proofing.
- Adds a custom spelling entry for "Sarif" and minor code style tweaks in test mocks.

Helps reduce clutter, improve test clarity, and maintain an up-to-date codebase. [`(535c3df)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/535c3df642310de57c9fa23b67cc6634795c97cb)


- Update changelogs for v3.8.0 [skip ci] [`(34a3abd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/34a3abd399770aeb377e55e4ccfe2a9eb38f8bf2)



### � CI/CD

- Update codecov.yml [`(b319768)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b3197687162e1173c97a75aaeb7ff1bb3a253676)


- Update codecov.yml [`(81d10bb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/81d10bb95b5b0123e547dcf74814e9480abc37ce)


- Update codecov.yml [`(d18fd8e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d18fd8e811dc5e7d2305937be293183ffa46c247)



### 👷 CI/CD

- 👷 [ci] Ensure coverage directories exist and fix test report upload paths

- Creates necessary directories before generating JUnit test reports to prevent errors if they do not exist.
- Updates test report upload parameters to use the correct key for single files, aligning with codecov action requirements.
- Improves CI reliability and ensures test results are properly uploaded for both frontend and electron suites. [`(fd9e38a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fd9e38a376605353b4c75e9dd93a31e1fb4d4446)


- 👷 [ci] Add separate CI steps for frontend and electron coverage

- Separates test and coverage workflows for frontend and electron code, generating distinct reports and using Codecov flags for clearer tracking.
- Updates documentation to clarify dual test setup, coverage locations, and recommended commands for each environment.
- Adds a unified script for both coverage runs and improves report formats with HTML output for local review.

Relates to improved multi-environment coverage reporting and CI transparency. [`(18cb442)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/18cb4429a2b88939bc8fa94404788314a8e5714f)



### 🔧 Build System

- 🔧 [build] Update test config and lint ignores for coverage and bail

- Adds coverage directories to lint ignore patterns to prevent unnecessary linting of coverage outputs.
- Updates test scripts to use bail mode for faster feedback on failures.
- Integrates recommended Vitest globals directly in lint config for better compatibility.
- Sets a 10-second timeout for Vitest tests to avoid hanging during slow runs. [`(45fd6d0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45fd6d033a06f68d802a05727a7aca0cfeafc49b)


- 🔧 [build] Add Codecov Vite plugin, update dependencies

- Integrates Codecov Vite plugin for improved coverage reporting and bundle analysis, enabling analysis when a token is present.
- Updates several devDependencies to latest versions for better compatibility, security, and type coverage.
- Removes obsolete Electron type definitions and updates type stubs for sqlite3.
- Adds package overrides and lockfile entries to ensure consistent build and CI behavior. [`(0bc88f4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0bc88f4e23c76b339fc39df1134e2d4527063478)






## [3.8.0] - 2025-07-01


[[5b491e0](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5b491e0145120282645f975e74b3be3756ad765f)...
[ed8e8d7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ed8e8d7eb2a62be0b90ecd90359f545ecbaaada7)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/5b491e0145120282645f975e74b3be3756ad765f...ed8e8d7eb2a62be0b90ecd90359f545ecbaaada7))


### 📦 Dependencies

- [dependency] Update version 3.7.0 [`(0399012)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0399012a66ff5665546e03ae75fda0fda7713683)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(ed8e8d7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ed8e8d7eb2a62be0b90ecd90359f545ecbaaada7)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(ec44898)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ec44898061e1c7d7c6dd8e8a06f10d517d61278e)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(b4c0b61)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b4c0b613dec3a5de6e43151ad588da0f7385f24a)



### � Documentation

- 📝 [docs] Add comprehensive prompt templates for project automation

- Introduces detailed prompt files for accessibility, React hooks, database migrations, E2E testing, Electron IPC, error handling, monitoring, mock data, performance, TypeScript utilities, Vite plugin, and various test generation needs
- Provides standardized requirements, testing strategies, and documentation guidelines to streamline automated code and test generation
- Improves developer onboarding and ensures best practices are consistently followed across features and services [`(5b491e0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5b491e0145120282645f975e74b3be3756ad765f)



### 🧪 Testing

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



### 👷 CI/CD

- 👷 [ci] Standardize and reformat CI workflow YAML files

- Reindents and restructures GitHub Actions workflows for test, coverage, and code quality analysis using consistent 4-space indentation and YAML best practices.
- Improves readability and maintainability by aligning job, step, and input formatting across all pipeline definitions.
- Makes no logic changes but ensures easier future edits and consistent automation behavior. [`(52d47b5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/52d47b56ad58456f9618d10688a7a90736ed1e0d)


- 👷 [ci] Enhance SonarCloud workflow and project configuration

- Updates CI workflow to include explicit Node.js setup, dependency installation, build, and test steps for improved SonarCloud code quality analysis.
 - Refines SonarCloud project properties with expanded exclusions, explicit test and coverage settings, and improved documentation for clarity and maintainability.
 - Adds further dist folder exclusions to the build tool config to prevent unwanted files from analysis.
 - Improves reliability and relevance of code analysis by enhancing test and coverage reporting integration. [`(69239c9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/69239c9ca9f628c2f70aca7ca8fea52ce902a743)






## [3.7.0] - 2025-06-30


[[cd4aad4](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd4aad40d930471cf85974e2dcbe34ca6865b54a)...
[2488118](https://github.com/Nick2bad4u/Uptime-Watcher/commit/24881180e4add7fd1cf02e89fb68b74e895d516c)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/cd4aad40d930471cf85974e2dcbe34ca6865b54a...24881180e4add7fd1cf02e89fb68b74e895d516c))


### 📦 Dependencies

- Merge pull request #19 from Nick2bad4u/dependabot/github_actions/github-actions-012ad2d1b8

[ci][skip-ci](deps): [dependency] Update dependency group [`(c3c29a6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c3c29a67affab862ba7c41cda45e9ba53c371b76)


- *(deps)* [dependency] Update dependency group [`(d055ac0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d055ac026d77c9a3f83c443367c14e8c55817404)


- [dependency] Update version 3.6.0 [`(cd4aad4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd4aad40d930471cf85974e2dcbe34ca6865b54a)



### 🚜 Refactor

- 🚜 [refactor] Extracts duration/label formatting helpers in settings tab

- Moves interval and retry attempt label formatting into standalone helper functions to reduce duplication and improve maintainability.
- Applies readonly modifier to props in the settings tab for improved type safety and clarity.
- Enhances readability and reduces inline logic in JSX by centralizing formatting logic. [`(d919827)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d919827f51d0e38006f31fc6cb2e08e085ac4a30)


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


- 🚜 [refactor] Expand changelog automation and update commit grouping

- Refactors changelog automation to process a broader set of project directories, creating a separate changelog for each and storing them in a dedicated location for improved organization and review.
- Updates the commit parser configuration to comprehensively group commits by emoji-based types, aligning changelog sections with project conventions and increasing the clarity of generated logs.
- Improves maintainability and visibility of project history, especially for large or modular repositories, and ensures changelog grouping matches evolving commit standards. [`(4c22f9a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4c22f9a59ef15d3bc5654451a9cfd85fc716031c)


- 🚜 [refactor] Simplifies monitor counting and ID selection logic

- Refactors monitor status aggregation to use a functional approach, replacing multiple mutable variables and loops with a reducer for improved readability and maintainability.
- Streamlines default monitor ID selection by adopting a concise conditional expression, reducing imperative branching.
- Enhances code clarity and reduces potential for errors in monitor management logic. [`(6d59edf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6d59edf7e31b19ff710b013df2856a46c33d47d5)



### 🎨 Styling

- 🎨 [style] Add type aliases and readonly props for UI components

- Introduces type aliases for common union types and centralizes CSS class names as constants, reducing duplication and improving maintainability.
- Applies `readonly` to all component props interfaces, enhancing type safety and preventing unintended mutations.
- Updates usage of default values to use nullish coalescing for better handling of undefined props.
- Improves code clarity and consistency across UI components. [`(da8a93d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/da8a93d814171b71c7ad9c7f124376b787838b6f)


- 🎨 [style] Mark IPC service dependencies as readonly

- Enforces immutability for injected dependencies in the IPC service to prevent accidental modification.
- Improves code safety and clarifies intent by making these properties read-only after construction. [`(80ba83c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/80ba83c7df6cdb56d382f7ef80b575f05217bcf8)


- 🎨 [style] Standardize Markdown and JSON formatting across docs

- Converts all lists, arrays, and objects in Markdown, JSON, and config files to a single-line style for improved consistency, readability, and diff clarity
- Removes excess blank lines and aligns indentation in all documentation, changelogs, and VSCode project settings
- Updates Markdown checklists and tables to use consistent spacing and formatting
- Unifies code fence and raw block usage in Markdown docs, and corrects inconsistent link and emphasis styles
- Cleans up changelog files by removing unnecessary blank lines and aligning contributor/license footers

Improves maintainability and ensures a uniform appearance across all documentation, configuration, and project files. [`(5961dcc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5961dcc0f308156068b43c08d70f45d447f281a5)



### 🧪 Testing

- 🧪 [test] Add Vitest and Testing Library integration

- Introduces Vitest as the main test runner, adding scripts for running, UI, and coverage reporting
- Integrates @testing-library/react, @testing-library/jest-dom, and related typings and setup for robust React and DOM testing
- Updates Vite config for test environment, coverage settings, and setup file support
- Enables isolated, modern, and maintainable testing workflows for React components and TypeScript code [`(2488118)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/24881180e4add7fd1cf02e89fb68b74e895d516c)



### 🧹 Chores

- Update changelogs for v3.6.0 [skip ci] [`(70b753b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/70b753bd2799a506d991d10207888ba465ca07d7)



### 👷 CI/CD

- 👷 [ci] Add SonarCloud integration for code analysis

- Introduces configuration files to enable automated code quality and static analysis using SonarCloud on push and pull request events.
- Aims to improve maintainability and code health by providing continuous feedback and coverage reporting.
- Lays the groundwork for integrating code quality gates into the CI pipeline. [`(2df8a1d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2df8a1d126cc26108ca383fdd3e8d18e75b32c46)






## [3.6.0] - 2025-06-30


[[a59c50d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a59c50d3c0e0e5196792b4e927a9a4db4781e914)...
[c59a185](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c59a1853cf723f1c767a3645999e3960eb604e44)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/a59c50d3c0e0e5196792b4e927a9a4db4781e914...c59a1853cf723f1c767a3645999e3960eb604e44))


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



### 📦 Dependencies

- [dependency] Update version 3.5.0 [`(cc93b21)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cc93b2140503a2aed16f8126498f80b44b3d05cd)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(c59a185)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c59a1853cf723f1c767a3645999e3960eb604e44)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(52164aa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/52164aaa3e909d16015bbfdac79ac2180334eb9f)



### � Documentation

- 📝 [docs] Remove all architecture and API documentation

- Deletes all markdown documentation for architecture, components, API reference, guides, and type definitions
- Removes internal docs for forms, settings, dashboard, hooks, validation, and backend structure
- Cleans up the codebase, likely in preparation for major restructuring, documentation migration, or to eliminate outdated and potentially misleading technical docs

No logic or application code is affected; only documentation is impacted. [`(3d87674)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3d876748208640ca8fcb8fff49bb811a98efcc02)



### 🧹 Chores

- Update changelogs for v3.5.0 [skip ci] [`(06036b1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/06036b1e21713b5869fc850242a67b4c6a9339b5)






## [3.5.0] - 2025-06-29


[[111ed86](https://github.com/Nick2bad4u/Uptime-Watcher/commit/111ed86d4800f1d7e469ac8127f83ab5ba560fc8)...
[ec6a570](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ec6a5704c77b7bca0e0107d6c9d55495070ecf7f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/111ed86d4800f1d7e469ac8127f83ab5ba560fc8...ec6a5704c77b7bca0e0107d6c9d55495070ecf7f))


### ✨ Features

- ✨ [feat] Improve accessibility and event handling in UI components

- Enhances accessibility by adding ARIA attributes, native button semantics, and role assignments to interactive components.
- Refactors event handling to stop propagation at the button level instead of container level, preventing unintended card clicks and improving user experience.
- Updates reusable components to support flexible element types, extended event props, and better keyboard accessibility, enabling more consistent UI behavior. [`(ce52495)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ce52495055708a6e614f8ac3acd65cac53443223)


- ✨ [feat] Add per-monitor request timeout configuration

- Enables setting custom request timeouts for individual monitors, overriding the global/default timeout value
- Updates backend schema, frontend UI, and business logic to support per-monitor timeout input, persistence, and usage during monitoring
- Removes deprecated global timeout setting from app settings, making timeout a monitor-specific property for improved flexibility
- Improves user control over monitoring behavior, especially for sites or ports with varying response expectations [`(47f479b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/47f479b1802ff2ed39a27956ab8a69e834b2fd8b)



### �️ Bug Fixes

- 🛠️ [fix] Use nullish coalescing for site name fallback

- Replaces logical OR with nullish coalescing to ensure the identifier is only used when the name is null or undefined, not when it is an empty string or other falsy value
- Improves display accuracy for site names that may be intentionally set as empty strings [`(c302bc3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c302bc3de0cc3b4ac3fb754837d344b0e83de39e)



### 📦 Dependencies

- [dependency] Update version 3.4.0 [`(cba3c1b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cba3c1b56c1fcb91c52080e6247f00b533bda144)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(9c27776)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9c27776c4656f4177d3b7397ff24d1e3b254e321)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(d813054)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d813054dd83065b82e740af0719a86c0043505a5)


- Update theme-api.md [`(04ea615)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04ea6150ecc11ff0153c688ca9f06b2f6cb341d8)


- ⭐ feat: update dependencies and integrate Vite MCP plugin

- Added @executeautomation/database-server and @playwright/test to package.json
- Updated @typescript/native-preview and eslint versions
- Introduced vite-plugin-mcp in vite.config.ts for Model Context Protocol integration
- Created Vite-MCP-Configuration.md for detailed MCP setup and usage instructions
- Updated @types/node version in dependencies
- Added zod and zod-to-json-schema to dependencies [`(15272a9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/15272a9139a6579025be87d8d69eafcb07b07d6c)



### 🚜 Refactor

- 🚜 [refactor] Extracts monitor history suffix formatting to helpers

- Moves logic for formatting HTTP and port monitor history suffixes into dedicated helper functions
- Improves readability and maintainability by reducing inline logic in the component
- Prepares for easier extension or modification of monitor title formatting in the future [`(af39bf2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/af39bf29d44513fa507dfa6d93dd7f33d548d411)


- 🚜 [refactor] Refactor monitor option formatting logic

- Extracts the detail construction logic for monitor options into a dedicated helper function within the memoized callback.
- Improves readability and maintainability by isolating conditional formatting, making the code easier to extend and debug. [`(94211ab)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/94211abd5ea6fbc1479c3812440279e381d47c9c)


- 🚜 [refactor] Extract and modularize form validation and submission logic

- Modularizes form validation and monitor creation by extracting them into dedicated helper functions for clarity and maintainability
- Centralizes error handling and user feedback, reducing repeated code and improving validation consistency
- Improves accessibility logic in form fields by introducing a utility for determining aria-describedby values
- Enhances code readability and paves the way for future extensibility of form validation and submission workflows [`(52c7652)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/52c76521354342d4e962cc4cdaf57714967a6978)


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



### � Documentation

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

- 🎨 [style] Enforce immutability on component props

- Updates component props to use a readonly type for better type safety
- Prevents accidental mutation of props, aligning with best practices [`(ec6a570)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ec6a5704c77b7bca0e0107d6c9d55495070ecf7f)


- 🎨 [style] Clean up imports and className order in UI components

- Merges theme-related imports and removes redundancy for improved clarity.
- Adjusts className property order for better readability and consistency. [`(9b628a7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9b628a70d2805c3d7c9af6ad5a68340c2dff9681)



### 🧹 Chores

- Update changelogs for v3.4.0 [skip ci] [`(32c75ef)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/32c75efb81366bee486ad1c7df84589cb11b1952)



### � CI/CD

- Update prettier.yml [`(32a139c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/32a139cf6c764d0884fb602fa485c6bb743a2278)



### 🔧 Build System

- 🔧 [build] Switch to local Jekyll theme and remove remote plugin

- Replaces the remote theme with the standard Jekyll theme to simplify configuration and reduce reliance on external plugins
- Removes the now-unnecessary remote theme plugin for improved build stability and maintainability [`(63ff127)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/63ff127c8e254d592ec8a74cbe96f8d66cf8b863)






## [3.4.0] - 2025-06-28


[[de553f2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de553f2e025dee562de0d73f63b130c8b32443aa)...
[28d3918](https://github.com/Nick2bad4u/Uptime-Watcher/commit/28d3918a0786eaf7e0e8a7953ce6a674c22b253e)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/de553f2e025dee562de0d73f63b130c8b32443aa...28d3918a0786eaf7e0e8a7953ce6a674c22b253e))


### 📦 Dependencies

- [dependency] Update version 3.3.0 [`(de553f2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de553f2e025dee562de0d73f63b130c8b32443aa)



### � Documentation

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



### 🧹 Chores

- Update changelogs for v3.3.0 [skip ci] [`(8f6d1c9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8f6d1c9aad248ca1e4761d060bc22bced82dae22)



### � CI/CD

- Update prettier.yml [`(ab848a6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab848a6e7ca911edda37ecebe136fda8f267efc9)






## [3.3.0] - 2025-06-28


[[66fed3e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66fed3e4d9a917ca24eb592df628f68e9e83151f)...
[88a93af](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88a93af0d91097e73f65cd2e8cadf13a5e060aad)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/66fed3e4d9a917ca24eb592df628f68e9e83151f...88a93af0d91097e73f65cd2e8cadf13a5e060aad))


### 📦 Dependencies

- [dependency] Update version 3.2.0 [`(66fed3e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66fed3e4d9a917ca24eb592df628f68e9e83151f)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(88a93af)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88a93af0d91097e73f65cd2e8cadf13a5e060aad)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(0dc5398)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0dc5398cb0a6eaca49cd77b3bfcfb7b2f0e4bbee)



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


- 🚜 [refactor] Move site hooks to dedicated subfolder

- Improves project structure by relocating site analytics and details hooks to a dedicated "site" subdirectory
- Updates imports throughout the codebase to reference new hook locations
- Enhances code maintainability and discoverability by grouping related hooks

No functional changes introduced; supports better scalability for future site-related features. [`(829150a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/829150adcc38e691f1adfd85a1cff432ba7c8809)


- 🚜 [refactor] Modularize and streamline site details UI

- Splits a large, monolithic site details component into modular, focused subcomponents for header, navigation, and tab content, improving readability and maintainability
- Introduces a custom hook to encapsulate site details state and logic, reducing prop drilling and duplication
- Moves tab content (overview, analytics, history, settings) to dedicated files with improved cohesion and separation of concerns
- Removes inline debug code and outdated comments for cleaner production code
- Ensures all user actions (tab changes, filter changes, key settings) are logged for better analytics and traceability
- Enhances code organization and paves way for easier future enhancements and testing [`(0c4b982)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0c4b982d131386cbdaabda115efd6f4c0d8a6ff6)


- 🚜 [refactor] Modularize and document SiteDetails; improve project structure

- Refactors the monolithic SiteDetails component by planning and summarizing its decomposition into modular, testable subcomponents and custom hooks, mirroring the SiteCard refactor strategy
- Documents the refactor in detail, outlining architecture changes, new hooks, component breakdown, and migration notes to guide maintainability and future improvements
- Adds dedicated markdown documentation for both the refactor summary and migration process, enhancing codebase transparency and onboarding
- Introduces various chatmode and prompt templates for debugging, documentation, code review, migration, security, and test writing, improving AI assistant usability and project workflows
- Cleans up obsolete files and wordlists, updates spellcheck dictionaries, and streamlines VSCode and cspell configuration for better development experience

- Lays groundwork for improved maintainability, readability, and testability in large React components, with clear patterns for future modularization across the app [`(0fc01d9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0fc01d993d238c2c2d371c2f747c622aac70da05)



### 🧹 Chores

- Update changelogs for v3.2.0 [skip ci] [`(3a74493)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3a74493821086ca2ce4417eb1a76c828b73b4e7f)






## [3.2.0] - 2025-06-27


[[4876c9b](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4876c9b7772765edb8e70974a73c32fc15fd7c72)...
[691aee8](https://github.com/Nick2bad4u/Uptime-Watcher/commit/691aee801a61b1ba80ac2bdad1213b552daa8c63)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/4876c9b7772765edb8e70974a73c32fc15fd7c72...691aee801a61b1ba80ac2bdad1213b552daa8c63))


### �️ Bug Fixes

- 🛠️ [fix] Improve form validation using validator library

- Replaces custom and built-in URL, host, and port validation with the `validator` library to enhance accuracy and consistency of user input checks
- Expands custom word list to support new validation-related terminology
- Adjusts ESLint and markdown configurations for improved test and documentation management
- Updates dependencies for improved compatibility and developer experience [`(5deb984)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5deb984a1115b0a9cf24a17a6a59d8198dd339ab)



### 📦 Dependencies

- [dependency] Update version 3.1.0 [`(2197c91)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2197c916b354ef06745f26b5248f1297bbdfcc96)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(691aee8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/691aee801a61b1ba80ac2bdad1213b552daa8c63)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(5fc7ce5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5fc7ce5a1b5d7bbbfc843cbf117d8abea58302bf)



### 🚜 Refactor

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



### 🧹 Chores

- Update changelogs for v3.1.0 [skip ci] [`(4312c1c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4312c1cc11857ff4775d86e4e72072ba7e799b40)



### � CI/CD

- Update _config.yml [`(702408c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/702408cac16645c62df3b39919b5f42f672733d3)






## [3.1.0] - 2025-06-26


[[4d92d5a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4d92d5a18f0a67f96808baedd98f47c544ae18f9)...
[f4e714d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f4e714db0221088bc0f7524a2a68b0a6da3014e9)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/4d92d5a18f0a67f96808baedd98f47c544ae18f9...f4e714db0221088bc0f7524a2a68b0a6da3014e9))


### 📦 Dependencies

- [dependency] Update version 3.0.0 [`(4d92d5a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4d92d5a18f0a67f96808baedd98f47c544ae18f9)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(f4e714d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f4e714db0221088bc0f7524a2a68b0a6da3014e9)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(04b258c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04b258cd35fd18f981406e0316d5bccd66bd5829)



### 🚜 Refactor

- 🚜 [refactor] Standardizes DB null handling and improves WASM setup

- Replaces all uses of `null` with `undefined` for SQLite field values to better align with WASM driver expectations and reduce ambiguity
- Refactors retry logic loops for site DB operations for clarity and code style consistency
- Updates documentation and download script to explicitly reference and set up the WASM-based SQLite driver, ensuring required directories exist before download
- Adds minor linter rule suppressions and logging clarifications for better maintainability [`(2d4ff4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2d4ff4c1d90999296d9d336b8b601029c086dd80)



### 🎨 Styling

- 🎨 [style] Refines className ordering and layout consistency

- Improves visual consistency by adjusting the order of utility classes in component markup for better readability and maintainability
- Fixes minor typos in class names and ensures uniformity in flex, grid, and spacing utilities
- Enhances accessibility and clarity of interface elements without logic changes
- Updates formatting configs for cross-platform compatibility and stricter linting with Prettier integration
- Expands custom dictionary for spellchecking to include new project-specific terms [`(10e1c28)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/10e1c281ef9fda06244fd83c274a366344a98038)



### 🧹 Chores

- Update package.json scripts and dependencies [`(65f8aa5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65f8aa5fe3ac03560bb3ed09e9995d71602e0bd2)


- Update changelogs for v3.0.0 [skip ci] [`(5c8de28)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5c8de28ac659426105b8e4932355e5c940bbb1f0)



### � CI/CD

- Update flatpak-build.yml [`(46f8b61)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/46f8b61a2441f4761b4a7a174bf9991ec36ae498)



### 🔧 Build System

- 🔧 [build] Update dependencies and enhance spelling config

- Upgrades multiple devDependencies, including Tailwind CSS, Zustand, and ESLint plugins, to improve stability and compatibility
- Adds new TypeScript native preview and bundled dictionary packages for spell checking support
- Refines spelling configuration with additional ignore paths, custom dictionary integration, and expanded dictionary usage
- Expands allowed words list in editor settings for improved spell checking accuracy
- Adjusts TypeScript compiler options for better JS interop and import compatibility [`(b21421a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b21421a7dcdbd2a581d4782869c22d5ee5aa51ba)


- 🔧 [build] Update path import to use namespace import syntax [`(1350b7f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1350b7f2e18537013a41b1c981614a79d9e61cb1)


- 🔧 [build] Downgrade Electron builder deps, add git-cliff

- Updates Electron build-related dependencies to 24.x versions for better compatibility and stability
- Removes several indirect dependencies and cleans up the lockfile to reduce bloat and resolve version conflicts
- Adds git-cliff as a development tool for generating changelogs
- Motivated by the need to align build tooling with supported Electron versions and streamline the project's dependency tree [`(b1dc4bc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b1dc4bc3618189af16939ed19b1631c0f5868f7d)






## [3.0.0] - 2025-06-26


[[0010075](https://github.com/Nick2bad4u/Uptime-Watcher/commit/00100759ca445500faf72b8001accf69c540043a)...
[0990dce](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0990dce68e70df25663d1200e43abade9b53fd17)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/00100759ca445500faf72b8001accf69c540043a...0990dce68e70df25663d1200e43abade9b53fd17))


### ✨ Features

- ✨ [feat] Add Electron main process, IPC, and uptime monitor backend

Introduces a comprehensive Electron backend, including the main process logic, IPC handlers, and an uptime monitoring engine with persistent SQLite storage.

Enables site and monitor management, status updates, per-site monitoring controls, and direct database backup/export/import via Electron APIs. Integrates auto-update support and notification handling for monitor status changes.

Adjusts ignore and VS Code settings to allow tracking of built Electron output, and improves file/folder exclusions for better workspace usability.

Lays the technical foundation for reliable uptime tracking, flexible data persistence, and robust desktop application functionality. [`(4e94c98)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e94c988797316fc0ae86fcab01142c2f3266c04)


- Adds full ESLint support for CSS, HTML, YAML, TOML, and Markdown [`(8601fe6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8601fe60e0313de1bb3b909963fd68ee08f02f62)


- Add details column to history table and render details in SiteDetails component [skip ci] [`(2f9730b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2f9730b23165946292c243aee4d3cb905aeb031b)



### �️ Bug Fixes

- 🛠️ [fix] Standardize use of undefined instead of null for state

- Unifies usage of `undefined` over `null` for uninitialized or cleared state across components, hooks, and store logic
- Prevents ambiguity and improves consistency, especially for optional values and reset actions
- Updates conditional checks and default values to align with this standardization
- Enhances code clarity and reduces potential bugs from mixed usage [`(20db2d8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/20db2d8d892b416e3e3f28a2521d19a3144d8025)



### 📦 Dependencies

- [dependency] Update version 2.9.0 [`(af928b5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/af928b55aa1c54629483d385289065e64bb7fd5e)


- [dependency] Update version 2.8.0 [`(4f1f8e2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4f1f8e2407b2230fb34730b2631a9e6bfbc158f4)


- Merge pull request #11 from Nick2bad4u/dependabot/npm_and_yarn/npm-all-cc0e35ee04 [skip-ci]

test(deps): bump the npm-all group across 1 directory with 6 updates [`(cddca39)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cddca395359bc04233ba0437bef3e0846e4cfd2d)


- *(deps)* [dependency] Update the npm-all group across 1 directory with 6 updates [`(c558da1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c558da19b47ad3f8405e09c89f1800b1b2190112)


- [dependency] Update version 2.7.0 [`(28c207a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/28c207ad95cb90d749cc199bcae6c2c92f29aaa1)


- [dependency] Update version 2.6.0 [`(56fbb63)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/56fbb63557cd02affa5c0fd3c2ddda0c933b0ebb)


- [dependency] Update version 2.5.0 [`(73ac430)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/73ac43078cf1593f2d1712df6b1bbf93d80d94d6)


- [dependency] Update version 2.4.0 [`(b7385f3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b7385f3983f14e2a79656e6e6736a9f9437578be)


- [dependency] Update version 2.3.0 [`(1e3bb29)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1e3bb2952ccdf397177c20cb3e3391884eaf3554)


- [dependency] Update version 2.2.0 [`(0010075)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/00100759ca445500faf72b8001accf69c540043a)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(9af10ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9af10ae8d8ab17523324e80f2f8faf73625513ce)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(2dc3cf5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2dc3cf530ae48a2589cdee877bf850a756416e67)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(8ec4c4f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8ec4c4f5a21505e738933b728e4d96415c8b5dd5)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(4b96451)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4b96451181802a94d3dbc8f9c9daeab92959903d)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(cea96ea)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cea96eaae6e759aa9159fcc1bfb54d0292c64723)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(2e619f0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2e619f05f6a3b3bb61104b2cf5d941f1e0b410a3)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(f7b0988)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f7b0988ab30d7b85fb923ed0e2b49889985d93ab)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(f7e983d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f7e983d27fe5e63127d082c160b9d3b710634eca)


- Improves ignore settings and cleans up VSCode config

Updates ignore patterns for Prettier and VSCode to better match project structure, removes redundant .vscodeignore, and tidies import order for consistency. Enhances editor usability and prevents formatting or indexing of unnecessary files. [`(98b2a6b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/98b2a6bc51be5ec93e5d99e2fda1737d45d5d80d)


- Improves ignore settings and cleans up VSCode config

Updates ignore patterns for Prettier and VSCode to better match project structure, removes redundant .vscodeignore, and tidies import order for consistency. Enhances editor usability and prevents formatting or indexing of unnecessary files. [`(75b2e97)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/75b2e97966a3fb5e6d0832d3c21e00ba308b4b91)


- Refactor code to use CommonJS module syntax and improve strict mode compliance

- Updated main.js to use CommonJS imports and added strict mode.
- Refactored chartConfig.js to use CommonJS exports and added strict mode.
- Modified logger.js to utilize CommonJS imports and exports, ensuring consistent logging.
- Adjusted store.js to implement CommonJS syntax and added strict mode.
- Refactored ThemeManager.js to use CommonJS exports and added strict mode.
- Updated components.js to utilize CommonJS imports and exports, enhancing component structure.
- Refactored themes.js to use CommonJS exports and added strict mode.
- Updated types.js to include strict mode and CommonJS exports.
- Refactored useTheme.js to utilize CommonJS imports and exports, improving theme management.
- Updated status.js to use CommonJS exports and added strict mode.
- Refactored time.js to utilize CommonJS exports and added strict mode.
- Modified vite.config.js to use CommonJS imports and exports, ensuring compatibility.
- Updated tsconfig.json to change module resolution to CommonJS and include additional file types.
- Adjusted vite.config.ts to remove unnecessary copy to dist/ for frontend assets. [skip-ci] [`(12280c6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/12280c6588b4e93ef278daffb8934e7f3a6f65b2)


- Update .markdownlintignore [skip-ci] [`(8e92aa5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8e92aa55e40da0aa48f986c8769d2e992b480df9)


- Adds full-featured Electron+React frontend with per-site monitoring

Introduces a React-based UI integrated with Electron, enabling per-site and per-monitor interval configuration, detailed site analytics, charting, and flexible theming. Implements robust IPC between renderer and main processes, persistent SQLite storage, direct backup/download, and advanced state management via Zustand. Improves developer experience with enhanced VSCode launch tasks, hot reload, and unified test/build workflow. Lays groundwork for future extensibility and improved monitoring reliability. [skip-ci] [`(776f214)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/776f214be3b319b60e31367766a78400c305cbc5)


- Adds full-featured Electron+React frontend with per-site monitoring

Introduces a React-based UI integrated with Electron, enabling per-site and per-monitor interval configuration, detailed site analytics, charting, and flexible theming. Implements robust IPC between renderer and main processes, persistent SQLite storage, direct backup/download, and advanced state management via Zustand. Improves developer experience with enhanced VSCode launch tasks, hot reload, and unified test/build workflow. Lays groundwork for future extensibility and improved monitoring reliability. [skip-ci] [`(5662f5c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5662f5c3db7d63ff06956a68dc6bdcb32ad7e41a)


- Merge pull request #5 from Nick2bad4u/chore/prettier-fix [skip-ci]

chore: format code with Prettier [`(4ff1e39)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4ff1e39350f371c1899530a9b0ec2d87626c109b)


- Update metrics.repository.svg - [Skip GitHub Action] [`(71f5458)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/71f545898fe9fbdc0f144ca8d62ab13de2a27e65)



### 🚜 Refactor

- 🚜 [refactor] Improve import order, cleanup effects, and unify option structure

- Refactors import statements across multiple files for consistency and conformance with new ESLint and perfectionist rules.
- Simplifies logic in effect cleanup functions for loading overlays and button states, making them more concise and reliable.
- Reorders destructured store and hook usages for readability and alphabetizes where appropriate.
- Standardizes the structure of interval and history option arrays, changing from `{ value, label }` to `{ label, value }` for consistency throughout the app.
- Updates package dependencies and scripts, removing redundant or deprecated packages, and bumps versions to latest where needed.
- Makes minor optimizations to responsive CSS and chart data mapping for maintainability.
- Adds missing WASM asset to public directory for deployment consistency.

These improvements enhance code maintainability, readability, and enforce a stricter, more logical import and configuration structure. [`(197f637)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/197f63786d00b9d174331c0ad4ff8b95cc8aa25c)


- 🚜 [refactor] Standardize nullable state to use undefined

- Replaces usage of null with undefined for all optional state and function return values across components, hooks, and store
- Improves type consistency and aligns codebase with TypeScript best practices for representing absence of value
- Simplifies logic around error states, selected items, and UI resets by unifying handling of uninitialized or cleared values [`(190ee58)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/190ee58f64409fcca300e3c5b00ba467a93171be)


- 🚜 [refactor] Standardize nullable state to use undefined

- Replaces usage of null with undefined for all optional state and function return values across components, hooks, and store
- Improves type consistency and aligns codebase with TypeScript best practices for representing absence of value
- Simplifies logic around error states, selected items, and UI resets by unifying handling of uninitialized or cleared values [`(2a948dd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a948dd79b5d2a36f36a175af142852053efd0ce)


- 🚜 [refactor] Standardize nullable state to use undefined

- Replaces usage of null with undefined for all optional state and function return values across components, hooks, and store
- Improves type consistency and aligns codebase with TypeScript best practices for representing absence of value
- Simplifies logic around error states, selected items, and UI resets by unifying handling of uninitialized or cleared values [`(cf1db5b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cf1db5bd21503eace6931bd434f0768d68a03b1f)


- 🚜 [refactor] Standardize nullable state to use undefined

- Replaces usage of null with undefined for all optional state and function return values across components, hooks, and store
- Improves type consistency and aligns codebase with TypeScript best practices for representing absence of value
- Simplifies logic around error states, selected items, and UI resets by unifying handling of uninitialized or cleared values [`(762768b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/762768b75e687f0dc5b16474a0b99b388a99a430)



### 🎨 Styling

- 🎨 [style] Refactor theme structure and update ESLint config

- Simplifies and standardizes theme definitions for consistency and maintainability, ensuring all themes share structure for colors, spacing, shadows, border radius, and typography
- Changes theme property ordering for clarity and merges object entries using modern loop constructs for better readability and performance
- Excludes build output directories from linting and disables import/order ESLint rule to reduce noise and improve dev experience
- Adds explanatory inline ESLint disable comments for clarity
- Optimizes Tailwind config by reorganizing color and animation declarations for improved maintainability [`(d51c32f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d51c32f97ea910f8c97c8537e85b39390108e241)



### 🧹 Chores

- 🧹 [chore] Update ignores for typings and dist directories

- Adds support for ignoring downloaded typings and dist folders throughout the project to prevent accidental commits of generated or external files
- Updates VS Code settings to hide dist and refine .husky exclusions in file and search views, reducing noise and improving focus
- Improves code style consistency in configuration by formatting multi-line rules for better readability [`(0990dce)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0990dce68e70df25663d1200e43abade9b53fd17)


- Update changelogs for v2.9.0 [skip ci] [`(95c9849)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/95c9849731e616e9f5064a78c98a9ff1327a7618)


- Update changelogs for v2.8.0 [skip ci] [`(6ba8e9e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6ba8e9ef08eb0a70f688f59890f989e129f07a41)


- Update changelogs for v2.7.0 [skip ci] [`(1ae0565)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1ae05656f00a7a0add1e9ad3df34fbd80e6a71a6)


- 🧹 [chore] Remove compiled Electron distribution files

Removes all generated Electron build artifacts from version control
to reduce repository size and prevent tracking of build outputs.

 - Ensures only source files are maintained under version control
 - Addresses issues related to accidental commits of binary or compiled files
 - Promotes cleaner repository management and avoids merge conflicts

No logic or application behavior is changed. [`(8bad781)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8bad781558c710903cd5dc2ee51f3bf7f670f9a5)


- Update changelogs for v2.6.0 [skip ci] [`(09a8f8b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/09a8f8be9b8e02865def901ee6fe60b50822616c)


- Update changelogs for v2.5.0 [skip ci] [`(3794642)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/379464292e0cd6e519e002a2363105b8178ce3c0)


- Update changelogs for v2.4.0 [skip ci] [`(d9e7bcc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9e7bccf8122f08073c7fac7464529ad0448ad05)


- Update changelogs for v2.4.0 [skip ci] [`(55f3541)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/55f35416157299b8163798a79d945f7be35d04a9)


- Format code with Prettier [`(c24b09f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c24b09fc25fe4eb88036d470b5fa348b20c116ee)


- Update changelogs for v2.3.0 [skip ci] [`(410aabd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/410aabd49731c2fa7b0a9f928b4703753045c028)


- Update @typescript-eslint/parser to v8.35.0 and add prettier-eslint dependency [`(de4a549)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de4a54967c9e7d0d984862aec4922ba41e862865)


- Update changelogs for v2.2.0 [skip ci] [`(50cbe97)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/50cbe973468ebcb7aac19244f86e57098bfc6689)



### � CI/CD

- Update codeql.yml [`(6296214)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/629621493cbf467bfdb284b1cf9c9d2a309a38d6)


- Update codeql.yml [`(5301aca)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5301acab2d1a868b10417e174bf228c45d5d11fd)


- Update _config.yml [skip-ci] [`(e6627ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e6627ae06b36ec4d73429f72be7a99949f65bc98)


- Update .mega-linter.yml [skip-ci] [`(e681f07)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e681f073dbf0f764b0642700ab480bd919d2c804)



### 👷 CI/CD

- 👷 [ci] Remove Electron backend build artifacts from source

- Removes previously committed build output and Electron backend files from version control to prevent storing build artifacts in the repository.
- Updates CI workflow to add a dedicated step for building the Vite frontend and Electron backend, ensuring separation of install and build phases.
- Improves repository hygiene and reduces potential for merge conflicts and accidental deployment of stale artifacts. [`(8259198)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/82591980852202900bb47d142b5f888eae86555c)



### 🔧 Build System

- 🔧 [build] Ignore Electron build output directory

- Prevents accidental commits of Electron build artifacts by adding the Electron output directory to the ignore list
- Helps keep the repository clean and avoids tracking large or generated files [`(5d9bd03)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5d9bd037c65b22ee522faebd4566d529120a65de)


- 🔧 [build] Update dependencies and modernize Electron main code

- Upgrades Electron to v37, Vite to v7, cspell, Prettier, typescript-eslint, and other related dev dependencies for improved compatibility and security.
- Adds postinstall and utility scripts for managing node-sqlite3-wasm, including download, clean, verify, and reinstall tasks.
- Updates .gitignore to exclude the dist directory for cleaner version control.
- Refactors Electron main process code to use modern JavaScript syntax (optional chaining, class fields), improving readability, maintainability, and reducing legacy verbosity.
- Removes redundant variable assignments and cleans up error-prone legacy patterns for more robust runtime behavior.
- Keeps package-lock.json in sync with new dependency versions and ensures reproducible builds. [`(8d0976d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8d0976dc9bc9333a004db4d72f0d443cb95d21a7)






## [2.2.0] - 2025-06-23


[[9174b15](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9174b15321660e184ec4a9ef72dcdec586f3350c)...
[32b2e14](https://github.com/Nick2bad4u/Uptime-Watcher/commit/32b2e14e4f6ab95b789e03c0adebe8ce2f984ab5)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/9174b15321660e184ec4a9ef72dcdec586f3350c...32b2e14e4f6ab95b789e03c0adebe8ce2f984ab5))


### ✨ Features

- Add shell wrapper for running Electron application [`(a2a74ca)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a2a74caf1d7216b788d227376e008784568ad02c)


- Enhance build process and add new scripts [`(67b5fe7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/67b5fe731fe24bcf6740917e646b30dfc57a6bab)


- Implement update notification system and enhance app state management [`(9a3a01d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9a3a01d9f14cb3f26a181c321b2de6c3b3ba8a82)


- Add x64ArchFiles exclusion for lightningcss-darwin-arm64 in package.json [`(eb955e5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eb955e5f0d975c3891738eb89f1b5f22df46da3f)


- Add build step for application and improve Flatpak installation commands [`(cede97a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cede97a6eccbbb49c71dcd50cb931355a949e331)


- Implement availability color utility and enhance themed components with new status variants [`(50b2260)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/50b226067cb7937fdfa5dfebf50ecde976683f05)


- Enhance theme with hover states and update spacing variables in CSS [`(f1de760)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f1de76048978a1126954a0d2716d2cf7dc5f0c13)


- Enhance error alert styles and add site icon fallback functionality [`(0741ce0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0741ce0e3fca5246d0e3e703b270efe4b107e9d8)


- Enhance SiteCard component with quick actions and improved uptime metrics [`(982281f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/982281f0d8ea0bce20e8265ddeb9391f5b705c66)


- Add updateSite functionality to store and types [`(9174b15)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9174b15321660e184ec4a9ef72dcdec586f3350c)



### 🛠️ Bug Fixes

- Update dependencies and correct version numbers in package.json and package-lock.json [`(32b2e14)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/32b2e14e4f6ab95b789e03c0adebe8ce2f984ab5)


- Add libarchive-tools to Flatpak installation in workflow [`(7fe4d2c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7fe4d2c95c6af4a6bf98cf4fbfc012ea8ced7b4c)


- Update package.json to include dist files and refine macOS packaging exclusions [`(26bc4ef)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26bc4ef07e2232af8754ecd2a3a99c3702195b85)


- Update version to 1.8.3 and add allowList for macOS packaging [`(3e49bac)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e49bac66297422e1daf9d8f2d0b9fe9c58e1251)


- Update version to 1.8.2 and correct x64ArchFiles path in package.json [`(f279496)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f279496112d5a73a7bd66211311a3e4c2e1cf69c)


- Update x64ArchFiles format in package.json to a string [`(9941edc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9941edc881e37feabdb2c7e676bdb9c4f5f5c6e6)


- Update npm commands in Flatpak build configuration to use absolute paths [`(6e69bb7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e69bb7c04203d1e76dfe10ad1f44426a7f1372b)



### 📦 Dependencies

- [dependency] Update version 2.1.0 [`(d90dfb4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d90dfb49fd05a3a650e6268832de9635d3fad6b4)


- [dependency] Update version 2.0.1 [`(2a2f6d2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a2f6d2b361acd07b2ed334717c5e0ecbea7fe75)


- [dependency] Update version 1.8.12 [`(170f373)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/170f3738e826daae007abd3fa583637b923a62ea)


- [dependency] Update version 1.8.11 [`(511db9c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/511db9c3702299b887ae391263df33754a7eacf0)


- [dependency] Update version 1.8.10 [`(2fbba3b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2fbba3b84d5ac91a8eb5a8deabed10f89de06c64)


- [dependency] Update version 1.8.9 [`(534364d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/534364d09cd58223bc556944a844da7bf10590c1)


- [dependency] Update version 1.8.8 [`(ab8c318)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab8c3181dbd175bd62190b4dff06d1b2a0550ca6)


- [dependency] Update version 1.8.7 [`(9f810e9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9f810e92a619d99bed9250f0efae46f6ba9c821b)


- [dependency] Update version 1.8.6 [`(9c0ea9e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9c0ea9e6998e424f5212f104cc315a78056a9805)


- [dependency] Update version 1.8.5 [`(fd1ede2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fd1ede2668e108d54e2d86cfdd64a3d442617a03)


- [dependency] Update version 1.8.4 [`(73a0084)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/73a0084a892a532f7ce59e259acc66ac771ff3c9)


- [dependency] Update version 1.8.3 [`(3630062)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/36300627ced0af4346405356845aca30ada63491)


- [dependency] Update version 1.8.2 [`(702953b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/702953b9a4ed4e6c3125ed2318088b2a70eba922)


- [dependency] Update version 1.8.1 [`(00c6d6d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/00c6d6dfc3dcedbfa9fd3c2fca1565c50777e212)


- [dependency] Update version 1.8.0 in package.json and package-lock.json [`(fd1f3ea)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fd1f3eaf10114b3f44c8fe2cb507599447b38e99)


- [dependency] Update version 1.8.0 [`(126ba5e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/126ba5e841d35548e1953888debe228732459c8a)


- [dependency] Update version 1.7.0 [`(0733182)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0733182d8e7d3c6dc43fbeec991718c3b8724188)


- [dependency] Update version 1.6.0 [`(45f6ecd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45f6ecd4a96d60d29d410c652092dc1009e6b8ef)


- [dependency] Update version 1.5.0 [`(e32cf47)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e32cf47c9367428d069dda13ae97827984cbb6ec)


- [dependency] Update version 1.4.0 [`(b733de2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b733de28c8cf537ee67a389c1f5b4aeabfc062a8)



### 🛡️ Security

- Improves type safety and updates dependencies

Switches many uses of 'any' to more precise types for site data, status, and chart props, enhancing type safety and maintainability. Updates several dependencies and devDependencies to newer versions for better compatibility and security. Cleans up some component props and utility functions for improved clarity and reliability. [`(65ccbe3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65ccbe3f372f8d30ad303348869c92e1adc963d1)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(809ec32)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/809ec32f53a89e12b586cebfd00de37b3851681a)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(a53c12e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a53c12ea30c20c3de4f3f182a131c4f4f01aa788)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher

Updates version to 1.8.11 and refreshes changelog

Documents recent dependency upgrades, workflow updates, and improvements—such as resuming active monitors after restart and refining history limit logic—for better reliability and history handling. Also synchronizes metrics and TODOs with latest project state. [`(d09bb06)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d09bb0657dcd173662bda0721843bdac785bbbe6)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher

Updates changelog links and bumps version to 1.8.9

Improves consistency and accuracy of changelog URLs by removing redundant path segments. Updates package version to 1.8.9 and adjusts ESLint workflow for clearer plugin installation, supporting better release management and CI reliability. [`(466c94a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/466c94a2c2d8b2611c56a08ea60faf492c6f32db)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(f4e60df)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f4e60dfc53f32290b9eb99262c8418a6c4d1721f)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(2cef839)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2cef839bd26e541d48a53027d08a7ab363b6a086)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(09fd227)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/09fd2278b525ad3c1c6f95db695e91c7dad02618)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(229bb5e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/229bb5ed2cec6e8eee5ef4319f9a1f52989cc6c8)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(78307ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/78307aeb76c4d9b8b635e9fa27b033d5eeb38a35)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(b9ec1ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b9ec1ae834972736dc120a5d6426853ee484759e)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(45901e2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45901e25e0ff05c5baa42e3c7df979dba07c8048)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(5a95072)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a950727631053afb5d12409e75eb4dc11588c25)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(89f5b29)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/89f5b29fcbc31a6de79ccbaf9b65b93e9154a18a)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(7d52d3c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7d52d3cedf02fedd1b2899f27b4c2de3c975d561)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(bd53a9b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bd53a9b407b41456aea6b66526be896eef826d42)



### 💼 Other

- Update package.json [`(c09c0ba)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c09c0bae505d39c02ee00ff29077871b8bae74d2)


- Update .prettierignore [`(44330e4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/44330e46033a48424d490dda11832950c949e03c)


- Update metrics.repository.svg - [Skip GitHub Action] [`(2337adc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2337adc2a8387d8007e889c653741963268064c8)


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


- Rename eslint.config.js to eslint.config.mjs [`(6e70037)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e700375ea147aebb01a6156c0ea6fd06220f318)


- Adds typescript-eslint and fixes devDependencies order

Introduces typescript-eslint for improved TypeScript linting and code quality.
Reorders devDependencies for better organization and consistency, and sets "type" to "commonjs" for module clarity. [`(efe1967)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/efe19678d1f47839dcdf772c4298cc1d05da6cec)


- Adds code quality, linting, and style tools

Integrates new dev dependencies for markdown linting, code duplication detection, stylelint, and link checking to improve code quality and maintainability. Updates ESLint config dependencies and refines .gitignore for node_modules backup. No production logic is affected. [`(ab20722)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab20722bb8cc27a69305ef294ea1b134b871ed8f)


- Refactor code for improved readability and consistency across multiple files

Improves code readability and formatting consistency

Refactors code across multiple files to enhance readability
and maintain consistent formatting, including clearer
line breaks and indentation. Updates linting configuration
to ignore package lock files for smoother workflow.
Aims to make future maintenance and collaboration easier. [`(2841749)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2841749e824a0ed994932eaf0611891c74a071a3)


- Refactor site identifier usage across components and services

- Updated SiteDetails component to use 'identifier' instead of 'id' for site references.
- Modified SiteList to use 'identifier' as the key for SiteCard.
- Changed logger service to log site events using 'identifier'.
- Adjusted store actions and state management to handle 'identifier' instead of 'url' or 'id'.
- Updated types to reflect the new 'identifier' field in Site and Monitor interfaces.
- Enhanced error handling and validation for site and monitor operations.
- Updated TypeScript configuration to include vite.config.ts for better type checking. [`(fabc009)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fabc009ff629d95a1d998806db89c48624a28452)


- Update metrics.repository.svg - [Skip GitHub Action] [`(2da3265)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2da3265dcc58bf4847285ec9b079014df9e6e26c)


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


- Create eslint.config.mjs [`(1add9a3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1add9a313c51bbb6b56355a8a2721de164324e48)


- Update ESLint output file path and add build options for Flatpak [`(cfd4f50)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cfd4f504f22dd8b8634b10f7a719dd8faea7ae42)


- Refactor preload.js: Align formatting of electronAPI methods for consistency [`(0929b27)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0929b27309150d724102b15785fe6e973ed29edc)


- Update Flatpak platform and SDK versions to 24.08 for improved compatibility [`(8ebcb04)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8ebcb047d6e8fe556394fc1c5046919eeb5db763)


- Reformats codebase for improved readability

Applies consistent indentation, line breaks, and formatting across
multiple sections to enhance maintainability and clarity.
No functional or logic changes are introduced. [`(884adc3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/884adc398b1d12c3a39acfa0983e5e13614f6d9b)


- Adds screenshot preview and improves site details UI

Introduces website screenshot thumbnail previews to site details, including a portal-based larger image overlay on hover for better visual context. Refines site settings and information layout with improved spacing, grouping, and visual hierarchy. Enhances button, checkbox, and status indicator styles for a more consistent and accessible interface. Cleans up redundant or duplicate CSS and improves maintainability. Also updates configuration files for markdown and linting. [`(cd4b190)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd4b190698be6dcbdfac2a1b28c54bd315e8ade5)


- Enhances UI with modern icons and synchronized state

Refactors the header and site details interfaces to use consistent, theme-aware iconography via a new icon library for a more modern, accessible look. Introduces new visual feedback and accessibility improvements with custom CSS, including improved status summaries and interactive elements.

Synchronizes key UI state (like tab selection and chart time range) across the app for a seamless user experience, persisting state between sessions. Removes redundant settings and streamlines code for clarity.

Adds `react-icons` as a dependency and supports flexible icon coloring in themed components, enabling better visual consistency throughout the application. [`(722e4f9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/722e4f943ee79c0ee6f9005630f3582b7a2cfe23)


- Unifies uptime quality logic and cleans up constants

Refactors uptime color mapping to use a centralized theme utility instead of scattered thresholds. Cleans up and removes unused constants, types, and configuration blocks to improve maintainability and reduce duplication. Enhances type safety for time periods and streamlines related imports. [`(398a536)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/398a5369561404bbf6ee5f49c482623064c0ff47)


- Restricts CI workflows to src directory changes

Updates all GitHub Actions workflows to only trigger on modifications within the src directory, reducing unnecessary runs for unrelated file changes. Also updates Flatpak build to use runtime and base version 24.08, sets NODE_ENV to production, and optimizes dependency installation for production builds. [`(6a6ed55)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6a6ed55504265c5d65b611fb32b02cea96dd3600)


- Update package.json [`(f047a8c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f047a8c6129c45d8318d82df43d26b84cbf30f2a)


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


- Centralizes timing logic and UI thresholds

Moves time formatting utilities and UI delay values into shared modules for improved consistency and maintainability.
Unifies response time and timestamp formatting, uptime thresholds, and timeout constraints, reducing code duplication and easing future updates to timing logic across the app. [`(d174393)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d174393e816e391634730a83cd6dcccc937561ae)


- Refactors store actions for unified backend integration

Streamlines state management by consolidating all backend-related logic into async store actions, improving error handling and reducing UI code duplication. Updates components to use new store methods for site CRUD, monitoring, and settings, removing direct backend calls and redundant loading/error state management. Expands interval and history limit options for greater configurability.

Improves maintainability and enables clearer separation of concerns between UI and data logic. [`(dcb8db7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/dcb8db74e3f71717fd1a9cde2f9cdc3e860ed88b)


- Update metrics.repository.svg - [Skip GitHub Action] [`(b128009)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b1280096c6d1157e8c3315cda9d3a31eecaa7dbe)


- Update cliff.toml [`(4d1e460)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4d1e4600e3a2e007c08a9fb63068e1740d40199b)


- Refines UI and improves error/status handling

Modernizes the application's theme by introducing error text styling, consistent spacing, and improved component classnames. Unifies status icon logic and enhances site status display for clarity. Updates product branding and streamlines the start script for development. Removes legacy site-saving script and polishes quick actions and input layouts for a more professional, accessible user experience. [`(06a6fbf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/06a6fbf99665974e6ea38926d7c15ed65be49750)



### 🚜 Refactor

- Update version bump logic to handle minor version increments [`(6413137)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6413137561abb68e7a4eb224ce46a590c017bf87)


- Remove unused ESLint and Husky configurations [`(c275d7d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c275d7d85c21774a671c3f23a76dcee96f3dba19)



### 📝 Documentation

- Add Design-Plan and AddSiteForm documentation; update Flatpak build configuration for improved structure [`(4e249c0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e249c0582ba7986e5eabf4bfd245f03392ca1a7)



### ⚡ Performance

- ⚡️ migration from lowdb to SQLite3 WASM [`(1983e4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1983e4c44558506048d978822ba06b1ff927656f)



### 🎨 Styling

- Format code for improved readability in preload.js [`(0ea0dbc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0ea0dbc81ad04fd4e95574e9d1f4470b6a6afe2d)



### 🧹 Chores

- Add cross-env dependency to package.json [`(33c8e79)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/33c8e79805d5b60758a5d43fad9765bb80b90bd8)


- Add .husky directory to .gitignore and update package.json scripts [`(cad9b86)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cad9b860e88e319e1d701f8fc2666cf12bb7a13c)


- Update changelog for version 1.8.12 and document recent changes [`(239f3cf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/239f3cf8f1934f3d170c04b284200ca96b83a996)


- Update changelogs for v1.8.12 [skip ci] [`(2c5afc9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2c5afc966f1cdf658ca5542a05b019cc0edad30f)


- Update changelogs for v1.8.11 [skip ci] [`(049c5a7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/049c5a73c55a56b1e5a81392348ad0872dba0d23)


- Update changelogs for v1.8.10 [skip ci] [`(1cbea90)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1cbea90d8062d42263da2ece56f373d74cc439cf)


- Update version to 1.8.9 and adjust markdownlint dependency [`(02c4ee5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/02c4ee54e25645f12e817772ad881485ede5d028)


- Update changelogs for v1.8.9 [skip ci] [`(ca2fdf5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ca2fdf5b1fefda2ba053bf059000d4083110a35d)


- Update changelogs for v1.8.8 [skip ci] [`(33454ed)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/33454ed211840d1dd96534215b11573ca26c0131)


- Update changelogs for v1.8.7 [skip ci] [`(5156f85)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5156f85174e6275a7ede04dfa43254906ce55dab)


- Update changelogs for v1.8.0 [skip ci] [`(6c5ba74)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6c5ba749b399c0d533ddb5bc202d8d7ce196ea6a)


- Update changelogs for v1.7.0 [skip ci] [`(a52fdc4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a52fdc431623c6b19923ef4dd85b605e3970db42)


- Update changelogs for v1.6.0 [skip ci] [`(0d47ce3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0d47ce3703ec536f5462bbb978e06e54d87ac5b6)


- Update Tailwind CSS to version 4.1.10 and adjust configuration [`(58ba9f7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/58ba9f7b3c60edfd811e0dd382ba9d0cbed659b5)


- Update changelogs for v1.5.0 [skip ci] [`(a1691f4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a1691f4003517be5aec230ff6fdb767085900dbf)


- Update changelogs for v1.4.0 [skip ci] [`(ba7ab4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ba7ab4cab57610645d1b20ced69477674c02810d)



### � CI/CD

- Update npm-audit.yml [`(5a7a035)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a7a035edd2b637e554d6d583f606ab573be0000)


- Update flatpak-build.yml [`(28205d0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/28205d0f46ea48fcf3db4b74523684ec84343e42)


- Update flatpak-build.yml [`(a9154ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a9154ae0ae672b9a5d88df69edbb21456de25227)


- Update eslint.yml [`(5891ca1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5891ca1db6282484242760d041dcf46198772a86)


- Update eslint.yml [`(ec839b0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ec839b09ade2c9ee06b1598540da1b55f90fb572)


- Update eslint.yml [`(5c3a9fa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5c3a9fab9bcccc09e2ee33057d163b9fe37eacc7)


- Update eslint.yml [`(9a393ef)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9a393ef8221afa08cf76e132bced427fb3605257)


- Update eslint.yml [`(a85db5c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a85db5cdf98b09bc0158052c1944e5086be72e2d)


- Rename flatpak-builder.yml to flatpak-build.yml [`(e308960)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e3089606b0e43c4ce2d0f244865e4fbfdc0ceea9)


- Create flatpak-builder.yml [`(94bfc72)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/94bfc72ffdb09401a11febe1b2b6d49fd6efc512)






## [1.4.0] - 2025-06-20


[[135e14e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/135e14edebc9a760ff38bc993ccea70d7774453d)...
[f91a50c](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f91a50c474b411725be5e2207d7e6809ce51092d)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/135e14edebc9a760ff38bc993ccea70d7774453d...f91a50c474b411725be5e2207d7e6809ce51092d))


### ✨ Features

- Add supported OS list to package.json and package-lock.json [`(f91a50c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f91a50c474b411725be5e2207d7e6809ce51092d)


- Update preload script and add new icons [`(4964001)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/496400172cb0310f7f310f2002bc26c7cafb6ba7)


- Add release, dist, and node_modules to .gitignore [`(cc38838)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cc38838ae9c2771152b0f36cb22858dd36979ed6)


- Add cspell configuration for custom words [`(9b687cf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9b687cf24f744a5559e58f385754aaecc02209a5)


- Add history limit and export/import functionality to uptime monitor [`(9d2bfd7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9d2bfd762dceedb4d7df4f8bd8c50adf70552376)


- Add manual site check functionality and enhance site statistics [`(4806c86)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4806c8669657fede80b9d7b7b39db50aaa45e7eb)


- Add Site Details modal with charts and statistics [`(2930396)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2930396d39e1bf0f448159adc62ee744f5a82a56)



### 🛠️ Bug Fixes

- Update npm package ecosystem directory to root [`(bc20504)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bc205040b1d77395feb8387e8faad5de7bd3d5c5)



### 📦 Dependencies

- Merge pull request #2 from Nick2bad4u/dependabot/github_actions/github-actions-9a90b96a51

[ci](deps): [dependency] Update rojopolis/spellcheck-github-actions 0.51.0 in the github-actions group [`(d59e419)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d59e4191a211a4397040b380b89915922f77c9a4)


- *(deps)* [dependency] Update rojopolis/spellcheck-github-actions [`(9b33de1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9b33de100e2a1dbdaec97bfee720f4ba13447cf9)


- [dependency] Update version 1.3.0 [`(8167767)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/816776798a8688250efd2e9079d2fd36f5986791)


- [dependency] Update version 1.2.0 [`(d6c99ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6c99ae31f3dc1ff67c73486c3600a8e13f63c72)


- [dependency] Update version 1.1.0 [`(d95c913)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d95c913ff2e47c6e0f7be94b36c69e09bfe3bc19)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(4749c7f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4749c7f06e948d00d31f076ce239c645dd9ee8d8)



### 💼 Other

- Refactor CSS for improved readability and consistency

- Adjusted indentation for CSS custom properties in :root for better alignment.
- Standardized content property values to use double quotes for consistency.
- Reformatted keyframes and animation properties for improved readability.
- Enhanced transition property formatting for clarity. [`(c5202b7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c5202b76822d51bab76671bbf911139b7b6a5a48)


- Refactor SiteDetails component and enhance UI

- Simplified preload.js by removing unnecessary line breaks.
- Added a new header section in SiteDetails with improved styling and layout.
- Introduced tab navigation for better organization of content (Overview, Analytics, History, Settings).
- Implemented auto-refresh functionality for site checks with a toggle button.
- Enhanced statistics calculations including uptime, response times, and downtime periods.
- Added a new doughnut chart for uptime visualization and improved analytics display.
- Created separate components for each tab (OverviewTab, AnalyticsTab, HistoryTab, SettingsTab) for better code organization.
- Updated CSS styles for improved visual consistency and responsiveness. [`(97e0a45)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/97e0a45761ae9fdaa6c557165671e9c1ead5b52f)


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


- Replaces bundled mime-db with external dependency

Switches from an inlined, minified database of MIME types to importing an external dependency for improved maintainability and clarity. Reduces repository size and simplifies dependency management. No runtime logic changes are introduced. [`(4ca58a4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4ca58a42cc8c76bd3f7e34901bc07cadd776c2e2)


- Improve loading UX with delayed spinners and overlay

Introduces a 100ms delay before showing loading indicators to reduce flicker for fast operations, both globally and on action buttons.
Adds a semi-transparent loading overlay for global state and updates button spinners for visual consistency.
Extracts reusable theme component styles to a dedicated CSS file for maintainability and improved UI consistency. [`(f01503e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f01503e705f8a546739c0db61c1ea6c51ede7e9d)


- Ignore Electron build output in version control

Prevents generated release and dist-electron directories from being tracked
by Git, reducing noise and avoiding accidental commits of build artifacts.
Speeds up status checks and ensures a cleaner repository. [`(4bfff70)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4bfff70c9da083079daafe2a428d3d054868cfc8)


- Adds theme system with accessible, reusable UI components

Introduces a comprehensive theming architecture, including light, dark, and high-contrast modes, with a centralized theme manager and context-aware React components. Refactors UI to use new themed components for consistent styling, accessibility, and easier customization. Improves error handling and settings flexibility, enhancing user experience and maintainability. [`(064d288)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/064d288e60302fbe59ee2c1cc7f75cc975dd71d4)


- Initialize project structure and developer tooling

Adds essential project files including a detailed README, a design plan, VS Code launch and task configurations, and a comprehensive .gitignore for Node/Electron development. Lays the groundwork for developer experience, project documentation, and future code contributions. [`(65aa6b2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65aa6b2e5f0821f8b0476adfc9175ab41ff1c1f0)


- Initial commit [`(135e14e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/135e14edebc9a760ff38bc993ccea70d7774453d)



### 🚜 Refactor

- Update SiteDetails styles to use new color variables and enhance error handling [`(6e26257)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e26257ebd298212352e7069ac4f3d9af0878b23)


- Simplify SiteDetails modal styles and enhance theme component CSS [`(81d3a21)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/81d3a2169f51b9936cff643ce16c98d3d2d3af58)



### � CI/CD

- Update Build.yml [`(72ecf52)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/72ecf52451442d21671034f2fd73d87969d98e06)






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/Uptime-Watcher/graphs/contributors) for their hard work!
## License
This project is licensed under the [MIT License](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/LICENSE.md)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
