<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


[[de553f2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de553f2e025dee562de0d73f63b130c8b32443aa)...
[ab848a6](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab848a6e7ca911edda37ecebe136fda8f267efc9)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/de553f2e025dee562de0d73f63b130c8b32443aa...ab848a6e7ca911edda37ecebe136fda8f267efc9))


### 🛠️ GitHub Actions

- Update prettier.yml [`(ab848a6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab848a6e7ca911edda37ecebe136fda8f267efc9)



### 📦 Dependencies

- [dependency] Update version 3.3.0 [`(de553f2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de553f2e025dee562de0d73f63b130c8b32443aa)






## [3.3.0] - 2025-06-28


[[66fed3e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66fed3e4d9a917ca24eb592df628f68e9e83151f)...
[88a93af](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88a93af0d91097e73f65cd2e8cadf13a5e060aad)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/66fed3e4d9a917ca24eb592df628f68e9e83151f...88a93af0d91097e73f65cd2e8cadf13a5e060aad))


### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(88a93af)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/88a93af0d91097e73f65cd2e8cadf13a5e060aad)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(0dc5398)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0dc5398cb0a6eaca49cd77b3bfcfb7b2f0e4bbee)


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



### ⚙️ Miscellaneous Tasks

- Update changelogs for v3.2.0 [skip ci] [`(3a74493)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3a74493821086ca2ce4417eb1a76c828b73b4e7f)



### 📦 Dependencies

- [dependency] Update version 3.2.0 [`(66fed3e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/66fed3e4d9a917ca24eb592df628f68e9e83151f)



### 🛡️ Security

- 🚜 [refactor] Modularize and document SiteDetails; improve project structure

- Refactors the monolithic SiteDetails component by planning and summarizing its decomposition into modular, testable subcomponents and custom hooks, mirroring the SiteCard refactor strategy
- Documents the refactor in detail, outlining architecture changes, new hooks, component breakdown, and migration notes to guide maintainability and future improvements
- Adds dedicated markdown documentation for both the refactor summary and migration process, enhancing codebase transparency and onboarding
- Introduces various chatmode and prompt templates for debugging, documentation, code review, migration, security, and test writing, improving AI assistant usability and project workflows
- Cleans up obsolete files and wordlists, updates spellcheck dictionaries, and streamlines VSCode and cspell configuration for better development experience

- Lays groundwork for improved maintainability, readability, and testability in large React components, with clear patterns for future modularization across the app [`(0fc01d9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0fc01d993d238c2c2d371c2f747c622aac70da05)






## [3.2.0] - 2025-06-27


[[4876c9b](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4876c9b7772765edb8e70974a73c32fc15fd7c72)...
[691aee8](https://github.com/Nick2bad4u/Uptime-Watcher/commit/691aee801a61b1ba80ac2bdad1213b552daa8c63)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/4876c9b7772765edb8e70974a73c32fc15fd7c72...691aee801a61b1ba80ac2bdad1213b552daa8c63))


### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(691aee8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/691aee801a61b1ba80ac2bdad1213b552daa8c63)



### 🛠️ GitHub Actions

- Update _config.yml [`(702408c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/702408cac16645c62df3b39919b5f42f672733d3)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(5fc7ce5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5fc7ce5a1b5d7bbbfc843cbf117d8abea58302bf)


- 🚜 [refactor] Remove site list/card components and optimize form fields

- Removes dashboard site list and card components to streamline or redesign dashboard UI.
- Refactors form field components to use memoization for performance gains.
- Updates form error handling with a memoized callback for cleaner React code.
- Simplifies logging on site/monitor add actions and form submission failures.
- Updates accessibility linting settings and custom dictionary entries for better dev experience.
- Disables markdown linting in refactor documentation for flexibility.

Prepares codebase for improved dashboard UX and more maintainable forms. [`(ad436cb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ad436cb78c46e245398a52d5a0a370926a1f15ab)


- 🛠️ [fix] Improve form validation using validator library

- Replaces custom and built-in URL, host, and port validation with the `validator` library to enhance accuracy and consistency of user input checks
- Expands custom word list to support new validation-related terminology
- Adjusts ESLint and markdown configurations for improved test and documentation management
- Updates dependencies for improved compatibility and developer experience [`(5deb984)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5deb984a1115b0a9cf24a17a6a59d8198dd339ab)


- 🚜 [refactor] Restructure components and remove legacy docs

- Removes all legacy documentation and Copilot instructions to reduce maintenance and confusion.
- Deletes and reorganizes UI components from a flat structure to feature-based folders for better modularity and maintainability.
- Cleans up unused CSS and TypeScript files tied to the old component structure.
- Updates imports in the main app to reflect the new component organization.
- Improves accessibility support for input and select components by adding ARIA attributes.
- Updates Linux desktop entry to use the wrapper script for launching Electron.
- Ensures that site deletion stops all monitoring processes before removing the site for improved resource management and reliability. [`(4876c9b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4876c9b7772765edb8e70974a73c32fc15fd7c72)



### ⚙️ Miscellaneous Tasks

- Update changelogs for v3.1.0 [skip ci] [`(4312c1c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4312c1cc11857ff4775d86e4e72072ba7e799b40)



### 📦 Dependencies

- [dependency] Update version 3.1.0 [`(2197c91)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2197c916b354ef06745f26b5248f1297bbdfcc96)






## [3.1.0] - 2025-06-26


[[4d92d5a](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4d92d5a18f0a67f96808baedd98f47c544ae18f9)...
[f4e714d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f4e714db0221088bc0f7524a2a68b0a6da3014e9)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/4d92d5a18f0a67f96808baedd98f47c544ae18f9...f4e714db0221088bc0f7524a2a68b0a6da3014e9))


### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(f4e714d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f4e714db0221088bc0f7524a2a68b0a6da3014e9)



### 🛠️ GitHub Actions

- Update flatpak-build.yml [`(46f8b61)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/46f8b61a2441f4761b4a7a174bf9991ec36ae498)



### 💼 Other

- 🎨 [style] Refines className ordering and layout consistency

- Improves visual consistency by adjusting the order of utility classes in component markup for better readability and maintainability
- Fixes minor typos in class names and ensures uniformity in flex, grid, and spacing utilities
- Enhances accessibility and clarity of interface elements without logic changes
- Updates formatting configs for cross-platform compatibility and stricter linting with Prettier integration
- Expands custom dictionary for spellchecking to include new project-specific terms [`(10e1c28)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/10e1c281ef9fda06244fd83c274a366344a98038)


- 🔧 [build] Update dependencies and enhance spelling config

- Upgrades multiple devDependencies, including Tailwind CSS, Zustand, and ESLint plugins, to improve stability and compatibility
- Adds new TypeScript native preview and bundled dictionary packages for spell checking support
- Refines spelling configuration with additional ignore paths, custom dictionary integration, and expanded dictionary usage
- Expands allowed words list in editor settings for improved spell checking accuracy
- Adjusts TypeScript compiler options for better JS interop and import compatibility [`(b21421a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b21421a7dcdbd2a581d4782869c22d5ee5aa51ba)


- 🔧 [build] Update path import to use namespace import syntax [`(1350b7f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1350b7f2e18537013a41b1c981614a79d9e61cb1)


- 🚜 [refactor] Standardizes DB null handling and improves WASM setup

- Replaces all uses of `null` with `undefined` for SQLite field values to better align with WASM driver expectations and reduce ambiguity
- Refactors retry logic loops for site DB operations for clarity and code style consistency
- Updates documentation and download script to explicitly reference and set up the WASM-based SQLite driver, ensuring required directories exist before download
- Adds minor linter rule suppressions and logging clarifications for better maintainability [`(2d4ff4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2d4ff4c1d90999296d9d336b8b601029c086dd80)


- 🔧 [build] Downgrade Electron builder deps, add git-cliff

- Updates Electron build-related dependencies to 24.x versions for better compatibility and stability
- Removes several indirect dependencies and cleans up the lockfile to reduce bloat and resolve version conflicts
- Adds git-cliff as a development tool for generating changelogs
- Motivated by the need to align build tooling with supported Electron versions and streamline the project's dependency tree [`(b1dc4bc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b1dc4bc3618189af16939ed19b1631c0f5868f7d)


- Update metrics.repository.svg - [Skip GitHub Action] [`(04b258c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/04b258cd35fd18f981406e0316d5bccd66bd5829)



### ⚙️ Miscellaneous Tasks

- Update package.json scripts and dependencies [`(65f8aa5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65f8aa5fe3ac03560bb3ed09e9995d71602e0bd2)


- Update changelogs for v3.0.0 [skip ci] [`(5c8de28)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5c8de28ac659426105b8e4932355e5c940bbb1f0)



### 📦 Dependencies

- [dependency] Update version 3.0.0 [`(4d92d5a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4d92d5a18f0a67f96808baedd98f47c544ae18f9)






## [3.0.0] - 2025-06-26


[[0010075](https://github.com/Nick2bad4u/Uptime-Watcher/commit/00100759ca445500faf72b8001accf69c540043a)...
[0990dce](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0990dce68e70df25663d1200e43abade9b53fd17)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/00100759ca445500faf72b8001accf69c540043a...0990dce68e70df25663d1200e43abade9b53fd17))


### 🚀 Features

- Adds full ESLint support for CSS, HTML, YAML, TOML, and Markdown [`(8601fe6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8601fe60e0313de1bb3b909963fd68ee08f02f62)


- Add details column to history table and render details in SiteDetails component [skip ci] [`(2f9730b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2f9730b23165946292c243aee4d3cb905aeb031b)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(9af10ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9af10ae8d8ab17523324e80f2f8faf73625513ce)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(2dc3cf5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2dc3cf530ae48a2589cdee877bf850a756416e67)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(8ec4c4f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8ec4c4f5a21505e738933b728e4d96415c8b5dd5)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(4b96451)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4b96451181802a94d3dbc8f9c9daeab92959903d)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(cea96ea)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cea96eaae6e759aa9159fcc1bfb54d0292c64723)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(2e619f0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2e619f05f6a3b3bb61104b2cf5d941f1e0b410a3)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(f7b0988)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f7b0988ab30d7b85fb923ed0e2b49889985d93ab)



### 🛠️ GitHub Actions

- Update codeql.yml [`(6296214)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/629621493cbf467bfdb284b1cf9c9d2a309a38d6)


- Update codeql.yml [`(5301aca)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5301acab2d1a868b10417e174bf228c45d5d11fd)


- Update _config.yml [skip-ci] [`(e6627ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e6627ae06b36ec4d73429f72be7a99949f65bc98)


- Update .mega-linter.yml [skip-ci] [`(e681f07)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e681f073dbf0f764b0642700ab480bd919d2c804)



### 💼 Other

- 🧹 [chore] Update ignores for typings and dist directories

- Adds support for ignoring downloaded typings and dist folders throughout the project to prevent accidental commits of generated or external files
- Updates VS Code settings to hide dist and refine .husky exclusions in file and search views, reducing noise and improving focus
- Improves code style consistency in configuration by formatting multi-line rules for better readability [`(0990dce)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0990dce68e70df25663d1200e43abade9b53fd17)


- 👷 [ci] Remove Electron backend build artifacts from source

- Removes previously committed build output and Electron backend files from version control to prevent storing build artifacts in the repository.
- Updates CI workflow to add a dedicated step for building the Vite frontend and Electron backend, ensuring separation of install and build phases.
- Improves repository hygiene and reduces potential for merge conflicts and accidental deployment of stale artifacts. [`(8259198)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/82591980852202900bb47d142b5f888eae86555c)


- ✨ [feat] Add Electron main process, IPC, and uptime monitor backend

Introduces a comprehensive Electron backend, including the main process logic, IPC handlers, and an uptime monitoring engine with persistent SQLite storage.

Enables site and monitor management, status updates, per-site monitoring controls, and direct database backup/export/import via Electron APIs. Integrates auto-update support and notification handling for monitor status changes.

Adjusts ignore and VS Code settings to allow tracking of built Electron output, and improves file/folder exclusions for better workspace usability.

Lays the technical foundation for reliable uptime tracking, flexible data persistence, and robust desktop application functionality. [`(4e94c98)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e94c988797316fc0ae86fcab01142c2f3266c04)


- 🔧 [build] Ignore Electron build output directory

- Prevents accidental commits of Electron build artifacts by adding the Electron output directory to the ignore list
- Helps keep the repository clean and avoids tracking large or generated files [`(5d9bd03)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5d9bd037c65b22ee522faebd4566d529120a65de)


- 🧹 [chore] Remove compiled Electron distribution files

Removes all generated Electron build artifacts from version control
to reduce repository size and prevent tracking of build outputs.

 - Ensures only source files are maintained under version control
 - Addresses issues related to accidental commits of binary or compiled files
 - Promotes cleaner repository management and avoids merge conflicts

No logic or application behavior is changed. [`(8bad781)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8bad781558c710903cd5dc2ee51f3bf7f670f9a5)


- 🎨 [style] Refactor theme structure and update ESLint config

- Simplifies and standardizes theme definitions for consistency and maintainability, ensuring all themes share structure for colors, spacing, shadows, border radius, and typography
- Changes theme property ordering for clarity and merges object entries using modern loop constructs for better readability and performance
- Excludes build output directories from linting and disables import/order ESLint rule to reduce noise and improve dev experience
- Adds explanatory inline ESLint disable comments for clarity
- Optimizes Tailwind config by reorganizing color and animation declarations for improved maintainability [`(d51c32f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d51c32f97ea910f8c97c8537e85b39390108e241)


- 🚜 [refactor] Improve import order, cleanup effects, and unify option structure

- Refactors import statements across multiple files for consistency and conformance with new ESLint and perfectionist rules.
- Simplifies logic in effect cleanup functions for loading overlays and button states, making them more concise and reliable.
- Reorders destructured store and hook usages for readability and alphabetizes where appropriate.
- Standardizes the structure of interval and history option arrays, changing from `{ value, label }` to `{ label, value }` for consistency throughout the app.
- Updates package dependencies and scripts, removing redundant or deprecated packages, and bumps versions to latest where needed.
- Makes minor optimizations to responsive CSS and chart data mapping for maintainability.
- Adds missing WASM asset to public directory for deployment consistency.

These improvements enhance code maintainability, readability, and enforce a stricter, more logical import and configuration structure. [`(197f637)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/197f63786d00b9d174331c0ad4ff8b95cc8aa25c)


- 🛠️ [fix] Standardize use of undefined instead of null for state

- Unifies usage of `undefined` over `null` for uninitialized or cleared state across components, hooks, and store logic
- Prevents ambiguity and improves consistency, especially for optional values and reset actions
- Updates conditional checks and default values to align with this standardization
- Enhances code clarity and reduces potential bugs from mixed usage [`(20db2d8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/20db2d8d892b416e3e3f28a2521d19a3144d8025)


- Update metrics.repository.svg - [Skip GitHub Action] [`(f7e983d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f7e983d27fe5e63127d082c160b9d3b710634eca)


- 🚜 [refactor] Standardize nullable state to use undefined

- Replaces usage of null with undefined for all optional state and function return values across components, hooks, and store
- Improves type consistency and aligns codebase with TypeScript best practices for representing absence of value
- Simplifies logic around error states, selected items, and UI resets by unifying handling of uninitialized or cleared values [`(190ee58)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/190ee58f64409fcca300e3c5b00ba467a93171be)


- Improves ignore settings and cleans up VSCode config

Updates ignore patterns for Prettier and VSCode to better match project structure, removes redundant .vscodeignore, and tidies import order for consistency. Enhances editor usability and prevents formatting or indexing of unnecessary files. [`(98b2a6b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/98b2a6bc51be5ec93e5d99e2fda1737d45d5d80d)


- 🚜 [refactor] Standardize nullable state to use undefined

- Replaces usage of null with undefined for all optional state and function return values across components, hooks, and store
- Improves type consistency and aligns codebase with TypeScript best practices for representing absence of value
- Simplifies logic around error states, selected items, and UI resets by unifying handling of uninitialized or cleared values [`(2a948dd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a948dd79b5d2a36f36a175af142852053efd0ce)


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


- 🚜 [refactor] Standardize nullable state to use undefined

- Replaces usage of null with undefined for all optional state and function return values across components, hooks, and store
- Improves type consistency and aligns codebase with TypeScript best practices for representing absence of value
- Simplifies logic around error states, selected items, and UI resets by unifying handling of uninitialized or cleared values [`(cf1db5b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cf1db5bd21503eace6931bd434f0768d68a03b1f)


- 🚜 [refactor] Standardize nullable state to use undefined

- Replaces usage of null with undefined for all optional state and function return values across components, hooks, and store
- Improves type consistency and aligns codebase with TypeScript best practices for representing absence of value
- Simplifies logic around error states, selected items, and UI resets by unifying handling of uninitialized or cleared values [`(762768b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/762768b75e687f0dc5b16474a0b99b388a99a430)


- Adds full-featured Electron+React frontend with per-site monitoring

Introduces a React-based UI integrated with Electron, enabling per-site and per-monitor interval configuration, detailed site analytics, charting, and flexible theming. Implements robust IPC between renderer and main processes, persistent SQLite storage, direct backup/download, and advanced state management via Zustand. Improves developer experience with enhanced VSCode launch tasks, hot reload, and unified test/build workflow. Lays groundwork for future extensibility and improved monitoring reliability. [skip-ci] [`(5662f5c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5662f5c3db7d63ff06956a68dc6bdcb32ad7e41a)


- Merge pull request #5 from Nick2bad4u/chore/prettier-fix [skip-ci]

chore: format code with Prettier [`(4ff1e39)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4ff1e39350f371c1899530a9b0ec2d87626c109b)


- Update metrics.repository.svg - [Skip GitHub Action] [`(71f5458)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/71f545898fe9fbdc0f144ca8d62ab13de2a27e65)



### ⚙️ Miscellaneous Tasks

- Update changelogs for v2.9.0 [skip ci] [`(95c9849)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/95c9849731e616e9f5064a78c98a9ff1327a7618)


- Update changelogs for v2.8.0 [skip ci] [`(6ba8e9e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6ba8e9ef08eb0a70f688f59890f989e129f07a41)


- Update changelogs for v2.7.0 [skip ci] [`(1ae0565)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1ae05656f00a7a0add1e9ad3df34fbd80e6a71a6)


- Update changelogs for v2.6.0 [skip ci] [`(09a8f8b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/09a8f8be9b8e02865def901ee6fe60b50822616c)


- Update changelogs for v2.5.0 [skip ci] [`(3794642)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/379464292e0cd6e519e002a2363105b8178ce3c0)


- Update changelogs for v2.4.0 [skip ci] [`(d9e7bcc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9e7bccf8122f08073c7fac7464529ad0448ad05)


- Update changelogs for v2.4.0 [skip ci] [`(55f3541)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/55f35416157299b8163798a79d945f7be35d04a9)


- Format code with Prettier [`(c24b09f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c24b09fc25fe4eb88036d470b5fa348b20c116ee)


- Update changelogs for v2.3.0 [skip ci] [`(410aabd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/410aabd49731c2fa7b0a9f928b4703753045c028)


- Update @typescript-eslint/parser to v8.35.0 and add prettier-eslint dependency [`(de4a549)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de4a54967c9e7d0d984862aec4922ba41e862865)


- Update changelogs for v2.2.0 [skip ci] [`(50cbe97)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/50cbe973468ebcb7aac19244f86e57098bfc6689)



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



### 🛡️ Security

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


### 🚀 Features

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



### 🐛 Bug Fixes

- Update dependencies and correct version numbers in package.json and package-lock.json [`(32b2e14)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/32b2e14e4f6ab95b789e03c0adebe8ce2f984ab5)


- Add libarchive-tools to Flatpak installation in workflow [`(7fe4d2c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7fe4d2c95c6af4a6bf98cf4fbfc012ea8ced7b4c)


- Update package.json to include dist files and refine macOS packaging exclusions [`(26bc4ef)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26bc4ef07e2232af8754ecd2a3a99c3702195b85)


- Update version to 1.8.3 and add allowList for macOS packaging [`(3e49bac)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e49bac66297422e1daf9d8f2d0b9fe9c58e1251)


- Update version to 1.8.2 and correct x64ArchFiles path in package.json [`(f279496)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f279496112d5a73a7bd66211311a3e4c2e1cf69c)


- Update x64ArchFiles format in package.json to a string [`(9941edc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9941edc881e37feabdb2c7e676bdb9c4f5f5c6e6)


- Update npm commands in Flatpak build configuration to use absolute paths [`(6e69bb7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e69bb7c04203d1e76dfe10ad1f44426a7f1372b)



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



### 🛠️ GitHub Actions

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



### 📚 Documentation

- Add Design-Plan and AddSiteForm documentation; update Flatpak build configuration for improved structure [`(4e249c0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e249c0582ba7986e5eabf4bfd245f03392ca1a7)



### ⚡ Performance

- ⚡️ migration from lowdb to SQLite3 WASM [`(1983e4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1983e4c44558506048d978822ba06b1ff927656f)



### 🎨 Styling

- Format code for improved readability in preload.js [`(0ea0dbc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0ea0dbc81ad04fd4e95574e9d1f4470b6a6afe2d)



### ⚙️ Miscellaneous Tasks

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






## [1.4.0] - 2025-06-20


[[135e14e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/135e14edebc9a760ff38bc993ccea70d7774453d)...
[f91a50c](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f91a50c474b411725be5e2207d7e6809ce51092d)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/135e14edebc9a760ff38bc993ccea70d7774453d...f91a50c474b411725be5e2207d7e6809ce51092d))


### 🚀 Features

- Add supported OS list to package.json and package-lock.json [`(f91a50c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f91a50c474b411725be5e2207d7e6809ce51092d)


- Update preload script and add new icons [`(4964001)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/496400172cb0310f7f310f2002bc26c7cafb6ba7)


- Add release, dist, and node_modules to .gitignore [`(cc38838)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cc38838ae9c2771152b0f36cb22858dd36979ed6)


- Add cspell configuration for custom words [`(9b687cf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9b687cf24f744a5559e58f385754aaecc02209a5)


- Add history limit and export/import functionality to uptime monitor [`(9d2bfd7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9d2bfd762dceedb4d7df4f8bd8c50adf70552376)


- Add manual site check functionality and enhance site statistics [`(4806c86)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4806c8669657fede80b9d7b7b39db50aaa45e7eb)


- Add Site Details modal with charts and statistics [`(2930396)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2930396d39e1bf0f448159adc62ee744f5a82a56)



### 🐛 Bug Fixes

- Update npm package ecosystem directory to root [`(bc20504)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bc205040b1d77395feb8387e8faad5de7bd3d5c5)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(4749c7f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4749c7f06e948d00d31f076ce239c645dd9ee8d8)



### 🛠️ GitHub Actions

- Update Build.yml [`(72ecf52)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/72ecf52451442d21671034f2fd73d87969d98e06)



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



### 📦 Dependencies

- Merge pull request #2 from Nick2bad4u/dependabot/github_actions/github-actions-9a90b96a51

[ci](deps): [dependency] Update rojopolis/spellcheck-github-actions 0.51.0 in the github-actions group [`(d59e419)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d59e4191a211a4397040b380b89915922f77c9a4)


- *(deps)* [dependency] Update rojopolis/spellcheck-github-actions [`(9b33de1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9b33de100e2a1dbdaec97bfee720f4ba13447cf9)


- [dependency] Update version 1.3.0 [`(8167767)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/816776798a8688250efd2e9079d2fd36f5986791)


- [dependency] Update version 1.2.0 [`(d6c99ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6c99ae31f3dc1ff67c73486c3600a8e13f63c72)


- [dependency] Update version 1.1.0 [`(d95c913)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d95c913ff2e47c6e0f7be94b36c69e09bfe3bc19)






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/Uptime-Watcher/graphs/contributors) for their hard work!
## License
This project is licensed under the [MIT License](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/LICENSE.md)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
