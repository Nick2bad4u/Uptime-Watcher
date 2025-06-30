<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


[[0f037eb](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0f037eb8d7a5920b7fb27a30e1e38033878333bb)...
[0f037eb](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0f037eb8d7a5920b7fb27a30e1e38033878333bb)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/0f037eb8d7a5920b7fb27a30e1e38033878333bb...0f037eb8d7a5920b7fb27a30e1e38033878333bb))


### � Documentation

- 📝 [docs] Remove AI-generated and migration docs, update architecture guide

- Cleans up the documentation folder by deleting AI assistant guides, health reports, migration summaries, optimization summaries, refactoring logs, and PowerShell utility scripts, reducing clutter and focusing the docs on core reference material
- Replaces the project architecture guide with a standard Markdown version, removing the Copilot-specific file and ensuring consistency for general users and contributors
- Streamlines the documentation set for maintainability and lowers overhead for future documentation updates [`(0f037eb)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0f037eb8d7a5920b7fb27a30e1e38033878333bb)






## [3.4.0] - 2025-06-28


[[8d0976d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8d0976dc9bc9333a004db4d72f0d443cb95d21a7)...
[28d3918](https://github.com/Nick2bad4u/Uptime-Watcher/commit/28d3918a0786eaf7e0e8a7953ce6a674c22b253e)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/8d0976dc9bc9333a004db4d72f0d443cb95d21a7...28d3918a0786eaf7e0e8a7953ce6a674c22b253e))


### 🚜 Refactor

- 🚜 [refactor] Standardizes DB null handling and improves WASM setup

- Replaces all uses of `null` with `undefined` for SQLite field values to better align with WASM driver expectations and reduce ambiguity
- Refactors retry logic loops for site DB operations for clarity and code style consistency
- Updates documentation and download script to explicitly reference and set up the WASM-based SQLite driver, ensuring required directories exist before download
- Adds minor linter rule suppressions and logging clarifications for better maintainability [`(2d4ff4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2d4ff4c1d90999296d9d336b8b601029c086dd80)



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



### 🔧 Build System

- 🔧 [build] Update dependencies and modernize Electron main code

- Upgrades Electron to v37, Vite to v7, cspell, Prettier, typescript-eslint, and other related dev dependencies for improved compatibility and security.
- Adds postinstall and utility scripts for managing node-sqlite3-wasm, including download, clean, verify, and reinstall tasks.
- Updates .gitignore to exclude the dist directory for cleaner version control.
- Refactors Electron main process code to use modern JavaScript syntax (optional chaining, class fields), improving readability, maintainability, and reducing legacy verbosity.
- Removes redundant variable assignments and cleans up error-prone legacy patterns for more robust runtime behavior.
- Keeps package-lock.json in sync with new dependency versions and ensures reproducible builds. [`(8d0976d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8d0976dc9bc9333a004db4d72f0d443cb95d21a7)






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/Uptime-Watcher/graphs/contributors) for their hard work!
## License
This project is licensed under the [MIT License](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/LICENSE.md)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
