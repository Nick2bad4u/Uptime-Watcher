<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


[[3554271](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3554271e1b0239553929c19f16bf7898cc087c59)...
[b6134be](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b6134be75a6250204c9cc3c9f5fb4340231ded0e)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/3554271e1b0239553929c19f16bf7898cc087c59...b6134be75a6250204c9cc3c9f5fb4340231ded0e))


### ✨ Features

- ✨ [feat] Centralize monitor defaults and improve identifier display

- Centralizes default configuration values (timeouts, intervals, retry/backoff, history limits) into shared constants for consistency across backend and frontend.
- Updates monitor creation and settings logic to use these constants, ensuring unified and explicit default values.
- Refactors identifier display logic in the settings UI to show human-friendly labels and values based on monitor type (URL for HTTP, host:port for port monitors).
- Simplifies retry/backoff logic and ensures exponential backoff is consistently applied using constants.
- Cleans up and reorders store update functions for better maintainability.
- Removes redundant inline default values, relying on shared configuration.
- Fixes minor style and type issues for improved code clarity. [`(b6134be)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b6134be75a6250204c9cc3c9f5fb4340231ded0e)


- ✨ [feat] Improve accessibility and event handling in UI components

- Enhances accessibility by adding ARIA attributes, native button semantics, and role assignments to interactive components.
- Refactors event handling to stop propagation at the button level instead of container level, preventing unintended card clicks and improving user experience.
- Updates reusable components to support flexible element types, extended event props, and better keyboard accessibility, enabling more consistent UI behavior. [`(ce52495)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ce52495055708a6e614f8ac3acd65cac53443223)



### 🚜 Refactor

- 🚜 [refactor] Remove legacy dark mode, flatten API, update docs

- Streamlines codebase by removing legacy dark mode state and migration fields,
  consolidating theme management under settings for consistency.
- Refactors API surface to use organized, domain-specific namespaces
  instead of a flat structure, improving maintainability and clarity.
- Updates documentation and type definitions to reflect new API structure,
  eliminates outdated migration guides, and aligns examples with current best practices.
- Cleans up interfaces and comments for clarity, removing legacy code and references.

Relates to ongoing modernization and API consistency efforts. [`(3554271)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3554271e1b0239553929c19f16bf7898cc087c59)






## [3.4.0] - 2025-06-28


[[064d288](https://github.com/Nick2bad4u/Uptime-Watcher/commit/064d288e60302fbe59ee2c1cc7f75cc975dd71d4)...
[28d3918](https://github.com/Nick2bad4u/Uptime-Watcher/commit/28d3918a0786eaf7e0e8a7953ce6a674c22b253e)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/064d288e60302fbe59ee2c1cc7f75cc975dd71d4...28d3918a0786eaf7e0e8a7953ce6a674c22b253e))


### ✨ Features

- ✨ [feat] Add Electron main process, IPC, and uptime monitor backend

Introduces a comprehensive Electron backend, including the main process logic, IPC handlers, and an uptime monitoring engine with persistent SQLite storage.

Enables site and monitor management, status updates, per-site monitoring controls, and direct database backup/export/import via Electron APIs. Integrates auto-update support and notification handling for monitor status changes.

Adjusts ignore and VS Code settings to allow tracking of built Electron output, and improves file/folder exclusions for better workspace usability.

Lays the technical foundation for reliable uptime tracking, flexible data persistence, and robust desktop application functionality. [`(4e94c98)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e94c988797316fc0ae86fcab01142c2f3266c04)


- Adds full ESLint support for CSS, HTML, YAML, TOML, and Markdown [`(8601fe6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8601fe60e0313de1bb3b909963fd68ee08f02f62)


- Implement availability color utility and enhance themed components with new status variants [`(50b2260)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/50b226067cb7937fdfa5dfebf50ecde976683f05)


- Enhance theme with hover states and update spacing variables in CSS [`(f1de760)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f1de76048978a1126954a0d2716d2cf7dc5f0c13)


- Enhance error alert styles and add site icon fallback functionality [`(0741ce0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0741ce0e3fca5246d0e3e703b270efe4b107e9d8)


- Enhance SiteCard component with quick actions and improved uptime metrics [`(982281f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/982281f0d8ea0bce20e8265ddeb9391f5b705c66)


- Add updateSite functionality to store and types [`(9174b15)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9174b15321660e184ec4a9ef72dcdec586f3350c)


- Add manual site check functionality and enhance site statistics [`(4806c86)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4806c8669657fede80b9d7b7b39db50aaa45e7eb)



### 🛡️ Security

- Improves type safety and updates dependencies

Switches many uses of 'any' to more precise types for site data, status, and chart props, enhancing type safety and maintainability. Updates several dependencies and devDependencies to newer versions for better compatibility and security. Cleans up some component props and utility functions for improved clarity and reliability. [`(65ccbe3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/65ccbe3f372f8d30ad303348869c92e1adc963d1)



### 💼 Other

- Adds full-featured Electron+React frontend with per-site monitoring

Introduces a React-based UI integrated with Electron, enabling per-site and per-monitor interval configuration, detailed site analytics, charting, and flexible theming. Implements robust IPC between renderer and main processes, persistent SQLite storage, direct backup/download, and advanced state management via Zustand. Improves developer experience with enhanced VSCode launch tasks, hot reload, and unified test/build workflow. Lays groundwork for future extensibility and improved monitoring reliability. [skip-ci] [`(776f214)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/776f214be3b319b60e31367766a78400c305cbc5)


- Adds full-featured Electron+React frontend with per-site monitoring

Introduces a React-based UI integrated with Electron, enabling per-site and per-monitor interval configuration, detailed site analytics, charting, and flexible theming. Implements robust IPC between renderer and main processes, persistent SQLite storage, direct backup/download, and advanced state management via Zustand. Improves developer experience with enhanced VSCode launch tasks, hot reload, and unified test/build workflow. Lays groundwork for future extensibility and improved monitoring reliability. [skip-ci] [`(5662f5c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5662f5c3db7d63ff06956a68dc6bdcb32ad7e41a)


- Refactors code for improved readability and consistency

Streamlines code formatting by reducing line breaks and consolidating multi-line statements, resulting in more concise and readable logic. Aligns style for variable declarations, function definitions, and control structures to enhance maintainability and make future updates easier. No functional changes are introduced. [`(e2e9171)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e2e917101087de9bf7f8daf394cbef955a3961e9)


- Adds screenshot preview and improves site details UI

Introduces website screenshot thumbnail previews to site details, including a portal-based larger image overlay on hover for better visual context. Refines site settings and information layout with improved spacing, grouping, and visual hierarchy. Enhances button, checkbox, and status indicator styles for a more consistent and accessible interface. Cleans up redundant or duplicate CSS and improves maintainability. Also updates configuration files for markdown and linting. [`(cd4b190)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cd4b190698be6dcbdfac2a1b28c54bd315e8ade5)


- Enhances UI with modern icons and synchronized state

Refactors the header and site details interfaces to use consistent, theme-aware iconography via a new icon library for a more modern, accessible look. Introduces new visual feedback and accessibility improvements with custom CSS, including improved status summaries and interactive elements.

Synchronizes key UI state (like tab selection and chart time range) across the app for a seamless user experience, persisting state between sessions. Removes redundant settings and streamlines code for clarity.

Adds `react-icons` as a dependency and supports flexible icon coloring in themed components, enabling better visual consistency throughout the application. [`(722e4f9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/722e4f943ee79c0ee6f9005630f3582b7a2cfe23)


- Refactor code for improved readability and consistency

- Cleaned up formatting and spacing in SiteDetails component for better readability.
- Consolidated memoization hooks in SiteDetails for line and bar chart options.
- Streamlined logger service for consistent logging format and improved clarity.
- Enhanced theme component styles for better maintainability.
- Updated constants for consistent spacing and formatting.
- Refactored useSiteAnalytics hook for clarity and performance.
- Improved time formatting utility functions for consistency.
- Removed unnecessary whitespace and comments in various files. [`(6e75286)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e75286ce8d9f7eccf287f3dbfb5cbb17c19be20)


- Centralizes timing logic and UI thresholds

Moves time formatting utilities and UI delay values into shared modules for improved consistency and maintainability.
Unifies response time and timestamp formatting, uptime thresholds, and timeout constraints, reducing code duplication and easing future updates to timing logic across the app. [`(d174393)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d174393e816e391634730a83cd6dcccc937561ae)


- Refines UI and improves error/status handling

Modernizes the application's theme by introducing error text styling, consistent spacing, and improved component classnames. Unifies status icon logic and enhances site status display for clarity. Updates product branding and streamlines the start script for development. Removes legacy site-saving script and polishes quick actions and input layouts for a more professional, accessible user experience. [`(06a6fbf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/06a6fbf99665974e6ea38926d7c15ed65be49750)


- Refactor CSS for improved readability and consistency

- Adjusted indentation for CSS custom properties in :root for better alignment.
- Standardized content property values to use double quotes for consistency.
- Reformatted keyframes and animation properties for improved readability.
- Enhanced transition property formatting for clarity. [`(c5202b7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c5202b76822d51bab76671bbf911139b7b6a5a48)


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


- Adds theme system with accessible, reusable UI components

Introduces a comprehensive theming architecture, including light, dark, and high-contrast modes, with a centralized theme manager and context-aware React components. Refactors UI to use new themed components for consistent styling, accessibility, and easier customization. Improves error handling and settings flexibility, enhancing user experience and maintainability. [`(064d288)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/064d288e60302fbe59ee2c1cc7f75cc975dd71d4)



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


- 🚜 [refactor] Restructure components and remove legacy docs

- Removes all legacy documentation and Copilot instructions to reduce maintenance and confusion.
- Deletes and reorganizes UI components from a flat structure to feature-based folders for better modularity and maintainability.
- Cleans up unused CSS and TypeScript files tied to the old component structure.
- Updates imports in the main app to reflect the new component organization.
- Improves accessibility support for input and select components by adding ARIA attributes.
- Updates Linux desktop entry to use the wrapper script for launching Electron.
- Ensures that site deletion stops all monitoring processes before removing the site for improved resource management and reliability. [`(4876c9b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4876c9b7772765edb8e70974a73c32fc15fd7c72)


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
- Simplifies logic around error states, selected items, and UI resets by unifying handling of uninitialized or cleared values [`(762768b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/762768b75e687f0dc5b16474a0b99b388a99a430)


- Simplify SiteDetails modal styles and enhance theme component CSS [`(81d3a21)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/81d3a2169f51b9936cff643ce16c98d3d2d3af58)



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



### 🎨 Styling

- 🎨 [style] Refactor theme structure and update ESLint config

- Simplifies and standardizes theme definitions for consistency and maintainability, ensuring all themes share structure for colors, spacing, shadows, border radius, and typography
- Changes theme property ordering for clarity and merges object entries using modern loop constructs for better readability and performance
- Excludes build output directories from linting and disables import/order ESLint rule to reduce noise and improve dev experience
- Adds explanatory inline ESLint disable comments for clarity
- Optimizes Tailwind config by reorganizing color and animation declarations for improved maintainability [`(d51c32f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d51c32f97ea910f8c97c8537e85b39390108e241)



### 👷 CI/CD

- 👷 [ci] Remove Electron backend build artifacts from source

- Removes previously committed build output and Electron backend files from version control to prevent storing build artifacts in the repository.
- Updates CI workflow to add a dedicated step for building the Vite frontend and Electron backend, ensuring separation of install and build phases.
- Improves repository hygiene and reduces potential for merge conflicts and accidental deployment of stale artifacts. [`(8259198)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/82591980852202900bb47d142b5f888eae86555c)






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/Uptime-Watcher/graphs/contributors) for their hard work!
## License
This project is licensed under the [MIT License](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/LICENSE.md)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
