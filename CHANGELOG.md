<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


[[56fbb63](https://github.com/Nick2bad4u/Uptime-Watcher/commit/56fbb63557cd02affa5c0fd3c2ddda0c933b0ebb)...
[4b96451](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4b96451181802a94d3dbc8f9c9daeab92959903d)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/56fbb63557cd02affa5c0fd3c2ddda0c933b0ebb...4b96451181802a94d3dbc8f9c9daeab92959903d))


### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(4b96451)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4b96451181802a94d3dbc8f9c9daeab92959903d)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(cea96ea)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cea96eaae6e759aa9159fcc1bfb54d0292c64723)



### 📦 Dependencies

- [dependency] Update version 2.6.0 [`(56fbb63)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/56fbb63557cd02affa5c0fd3c2ddda0c933b0ebb)






## [2.6.0] - 2025-06-25


[[73ac430](https://github.com/Nick2bad4u/Uptime-Watcher/commit/73ac43078cf1593f2d1712df6b1bbf93d80d94d6)...
[20db2d8](https://github.com/Nick2bad4u/Uptime-Watcher/commit/20db2d8d892b416e3e3f28a2521d19a3144d8025)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/73ac43078cf1593f2d1712df6b1bbf93d80d94d6...20db2d8d892b416e3e3f28a2521d19a3144d8025))


### 🛠️ GitHub Actions

- Update codeql.yml [`(6296214)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/629621493cbf467bfdb284b1cf9c9d2a309a38d6)


- Update codeql.yml [`(5301aca)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5301acab2d1a868b10417e174bf228c45d5d11fd)



### 💼 Other

- 🛠️ [fix] Standardize use of undefined instead of null for state

- Unifies usage of `undefined` over `null` for uninitialized or cleared state across components, hooks, and store logic
- Prevents ambiguity and improves consistency, especially for optional values and reset actions
- Updates conditional checks and default values to align with this standardization
- Enhances code clarity and reduces potential bugs from mixed usage [`(20db2d8)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/20db2d8d892b416e3e3f28a2521d19a3144d8025)


- Update metrics.repository.svg - [Skip GitHub Action] [`(f7e983d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f7e983d27fe5e63127d082c160b9d3b710634eca)



### ⚙️ Miscellaneous Tasks

- Update changelogs for v2.5.0 [skip ci] [`(3794642)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/379464292e0cd6e519e002a2363105b8178ce3c0)



### 📦 Dependencies

- [dependency] Update version 2.5.0 [`(73ac430)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/73ac43078cf1593f2d1712df6b1bbf93d80d94d6)






## [2.5.0] - 2025-06-24


[[b7385f3](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b7385f3983f14e2a79656e6e6736a9f9437578be)...
[190ee58](https://github.com/Nick2bad4u/Uptime-Watcher/commit/190ee58f64409fcca300e3c5b00ba467a93171be)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/b7385f3983f14e2a79656e6e6736a9f9437578be...190ee58f64409fcca300e3c5b00ba467a93171be))


### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(2e619f0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2e619f05f6a3b3bb61104b2cf5d941f1e0b410a3)



### 🛠️ GitHub Actions

- Update _config.yml [skip-ci] [`(e6627ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e6627ae06b36ec4d73429f72be7a99949f65bc98)


- Update .mega-linter.yml [skip-ci] [`(e681f07)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e681f073dbf0f764b0642700ab480bd919d2c804)



### 💼 Other

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



### ⚙️ Miscellaneous Tasks

- Update changelogs for v2.4.0 [skip ci] [`(d9e7bcc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d9e7bccf8122f08073c7fac7464529ad0448ad05)


- Update changelogs for v2.4.0 [skip ci] [`(55f3541)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/55f35416157299b8163798a79d945f7be35d04a9)



### 📦 Dependencies

- [dependency] Update version 2.4.0 [`(b7385f3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b7385f3983f14e2a79656e6e6736a9f9437578be)






## [2.4.0] - 2025-06-24


[[1e3bb29](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1e3bb2952ccdf397177c20cb3e3391884eaf3554)...
[776f214](https://github.com/Nick2bad4u/Uptime-Watcher/commit/776f214be3b319b60e31367766a78400c305cbc5)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1e3bb2952ccdf397177c20cb3e3391884eaf3554...776f214be3b319b60e31367766a78400c305cbc5))


### 💼 Other

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



### ⚙️ Miscellaneous Tasks

- Format code with Prettier [`(c24b09f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c24b09fc25fe4eb88036d470b5fa348b20c116ee)


- Update changelogs for v2.3.0 [skip ci] [`(410aabd)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/410aabd49731c2fa7b0a9f928b4703753045c028)



### 📦 Dependencies

- [dependency] Update version 2.3.0 [`(1e3bb29)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1e3bb2952ccdf397177c20cb3e3391884eaf3554)






## [2.3.0] - 2025-06-24


[[0010075](https://github.com/Nick2bad4u/Uptime-Watcher/commit/00100759ca445500faf72b8001accf69c540043a)...
[f7b0988](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f7b0988ab30d7b85fb923ed0e2b49889985d93ab)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/00100759ca445500faf72b8001accf69c540043a...f7b0988ab30d7b85fb923ed0e2b49889985d93ab))


### 🚀 Features

- Adds full ESLint support for CSS, HTML, YAML, TOML, and Markdown [`(8601fe6)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/8601fe60e0313de1bb3b909963fd68ee08f02f62)


- Add details column to history table and render details in SiteDetails component [skip ci] [`(2f9730b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2f9730b23165946292c243aee4d3cb905aeb031b)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(f7b0988)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f7b0988ab30d7b85fb923ed0e2b49889985d93ab)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(71f5458)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/71f545898fe9fbdc0f144ca8d62ab13de2a27e65)



### ⚙️ Miscellaneous Tasks

- Update @typescript-eslint/parser to v8.35.0 and add prettier-eslint dependency [`(de4a549)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/de4a54967c9e7d0d984862aec4922ba41e862865)


- Update changelogs for v2.2.0 [skip ci] [`(50cbe97)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/50cbe973468ebcb7aac19244f86e57098bfc6689)



### 📦 Dependencies

- [dependency] Update version 2.2.0 [`(0010075)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/00100759ca445500faf72b8001accf69c540043a)






## [2.2.0] - 2025-06-23


[[a2a74ca](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a2a74caf1d7216b788d227376e008784568ad02c)...
[32b2e14](https://github.com/Nick2bad4u/Uptime-Watcher/commit/32b2e14e4f6ab95b789e03c0adebe8ce2f984ab5)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/a2a74caf1d7216b788d227376e008784568ad02c...32b2e14e4f6ab95b789e03c0adebe8ce2f984ab5))


### 🚀 Features

- Add shell wrapper for running Electron application [`(a2a74ca)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a2a74caf1d7216b788d227376e008784568ad02c)



### 🐛 Bug Fixes

- Update dependencies and correct version numbers in package.json and package-lock.json [`(32b2e14)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/32b2e14e4f6ab95b789e03c0adebe8ce2f984ab5)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(809ec32)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/809ec32f53a89e12b586cebfd00de37b3851681a)



### ⚙️ Miscellaneous Tasks

- Add cross-env dependency to package.json [`(33c8e79)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/33c8e79805d5b60758a5d43fad9765bb80b90bd8)



### 📦 Dependencies

- [dependency] Update version 2.1.0 [`(d90dfb4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d90dfb49fd05a3a650e6268832de9635d3fad6b4)






## [2.1.0] - 2025-06-23


[[cad9b86](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cad9b860e88e319e1d701f8fc2666cf12bb7a13c)...
[6413137](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6413137561abb68e7a4eb224ce46a590c017bf87)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/cad9b860e88e319e1d701f8fc2666cf12bb7a13c...6413137561abb68e7a4eb224ce46a590c017bf87))


### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(a53c12e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a53c12ea30c20c3de4f3f182a131c4f4f01aa788)



### 🚜 Refactor

- Update version bump logic to handle minor version increments [`(6413137)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6413137561abb68e7a4eb224ce46a590c017bf87)



### ⚙️ Miscellaneous Tasks

- Add .husky directory to .gitignore and update package.json scripts [`(cad9b86)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cad9b860e88e319e1d701f8fc2666cf12bb7a13c)



### 📦 Dependencies

- [dependency] Update version 2.0.1 [`(2a2f6d2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2a2f6d2b361acd07b2ed334717c5e0ecbea7fe75)






## [2.0.1] - 2025-06-23


[[1983e4c](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1983e4c44558506048d978822ba06b1ff927656f)...
[c275d7d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c275d7d85c21774a671c3f23a76dcee96f3dba19)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/1983e4c44558506048d978822ba06b1ff927656f...c275d7d85c21774a671c3f23a76dcee96f3dba19))


### 💼 Other

- Update package.json [`(c09c0ba)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c09c0bae505d39c02ee00ff29077871b8bae74d2)


- Update .prettierignore [`(44330e4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/44330e46033a48424d490dda11832950c949e03c)



### 🚜 Refactor

- Remove unused ESLint and Husky configurations [`(c275d7d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/c275d7d85c21774a671c3f23a76dcee96f3dba19)



### ⚡ Performance

- ⚡️ migration from lowdb to SQLite3 WASM [`(1983e4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1983e4c44558506048d978822ba06b1ff927656f)



### ⚙️ Miscellaneous Tasks

- Update changelog for version 1.8.12 and document recent changes [`(239f3cf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/239f3cf8f1934f3d170c04b284200ca96b83a996)


- Update changelogs for v1.8.12 [skip ci] [`(2c5afc9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2c5afc966f1cdf658ca5542a05b019cc0edad30f)



### 📦 Dependencies

- [dependency] Update version 1.8.12 [`(170f373)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/170f3738e826daae007abd3fa583637b923a62ea)






## [1.8.12] - 2025-06-23


[[67b5fe7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/67b5fe731fe24bcf6740917e646b30dfc57a6bab)...
[d09bb06](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d09bb0657dcd173662bda0721843bdac785bbbe6)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/67b5fe731fe24bcf6740917e646b30dfc57a6bab...d09bb0657dcd173662bda0721843bdac785bbbe6))


### 🚀 Features

- Enhance build process and add new scripts [`(67b5fe7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/67b5fe731fe24bcf6740917e646b30dfc57a6bab)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher

Updates version to 1.8.11 and refreshes changelog

Documents recent dependency upgrades, workflow updates, and improvements—such as resuming active monitors after restart and refining history limit logic—for better reliability and history handling. Also synchronizes metrics and TODOs with latest project state. [`(d09bb06)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d09bb0657dcd173662bda0721843bdac785bbbe6)



### 💼 Other

- Update metrics.repository.svg - [Skip GitHub Action] [`(2337adc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2337adc2a8387d8007e889c653741963268064c8)


- Switches monitoring logic to use unique monitor IDs

Refactors app logic to identify and manage monitors via unique string IDs
instead of type, enabling multiple monitors of the same type per site.
Updates backend, IPC, and UI to consistently use monitor IDs. Adds direct
SQLite backup download for advanced users. Improves history limit handling
and site/monitor sync. Removes legacy JSON export/import.

Addresses user needs for better extensibility, safer data handling, and more
robust monitoring operations. [`(30bc1af)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/30bc1afd510d803564fccc25489d81d52fd54be0)



### ⚙️ Miscellaneous Tasks

- Update changelogs for v1.8.11 [skip ci] [`(049c5a7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/049c5a73c55a56b1e5a81392348ad0872dba0d23)



### 📦 Dependencies

- [dependency] Update version 1.8.11 [`(511db9c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/511db9c3702299b887ae391263df33754a7eacf0)






## [1.8.11] - 2025-06-22


[[2fbba3b](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2fbba3b84d5ac91a8eb5a8deabed10f89de06c64)...
[69f2b18](https://github.com/Nick2bad4u/Uptime-Watcher/commit/69f2b18ac835418771df6af79c26367056ce284c)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/2fbba3b84d5ac91a8eb5a8deabed10f89de06c64...69f2b18ac835418771df6af79c26367056ce284c))


### 🛠️ GitHub Actions

- Update npm-audit.yml [`(5a7a035)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a7a035edd2b637e554d6d583f606ab573be0000)


- Update flatpak-build.yml [`(28205d0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/28205d0f46ea48fcf3db4b74523684ec84343e42)


- Update flatpak-build.yml [`(a9154ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a9154ae0ae672b9a5d88df69edbb21456de25227)


- Update eslint.yml [`(5891ca1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5891ca1db6282484242760d041dcf46198772a86)


- Update eslint.yml [`(ec839b0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ec839b09ade2c9ee06b1598540da1b55f90fb572)



### 💼 Other

- Resumes active monitors after restart and improves history limit

Ensures that monitoring automatically resumes for previously active monitors upon app restart, improving reliability for ongoing uptime checks.

Also replaces the use of Infinity with Number.MAX_SAFE_INTEGER for the unlimited history option to avoid potential issues with serialization and internal calculations. [`(69f2b18)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/69f2b18ac835418771df6af79c26367056ce284c)


- Rename eslint.config.js to eslint.config.mjs [`(6e70037)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e700375ea147aebb01a6156c0ea6fd06220f318)



### ⚙️ Miscellaneous Tasks

- Update changelogs for v1.8.10 [skip ci] [`(1cbea90)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1cbea90d8062d42263da2ece56f373d74cc439cf)



### 📦 Dependencies

- [dependency] Update version 1.8.10 [`(2fbba3b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2fbba3b84d5ac91a8eb5a8deabed10f89de06c64)






## [1.8.10] - 2025-06-22


[[ab20722](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab20722bb8cc27a69305ef294ea1b134b871ed8f)...
[efe1967](https://github.com/Nick2bad4u/Uptime-Watcher/commit/efe19678d1f47839dcdf772c4298cc1d05da6cec)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/ab20722bb8cc27a69305ef294ea1b134b871ed8f...efe19678d1f47839dcdf772c4298cc1d05da6cec))


### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher

Updates changelog links and bumps version to 1.8.9

Improves consistency and accuracy of changelog URLs by removing redundant path segments. Updates package version to 1.8.9 and adjusts ESLint workflow for clearer plugin installation, supporting better release management and CI reliability. [`(466c94a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/466c94a2c2d8b2611c56a08ea60faf492c6f32db)



### 🛠️ GitHub Actions

- Update eslint.yml [`(5c3a9fa)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5c3a9fab9bcccc09e2ee33057d163b9fe37eacc7)


- Update eslint.yml [`(9a393ef)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9a393ef8221afa08cf76e132bced427fb3605257)


- Update eslint.yml [`(a85db5c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a85db5cdf98b09bc0158052c1944e5086be72e2d)



### 💼 Other

- Adds typescript-eslint and fixes devDependencies order

Introduces typescript-eslint for improved TypeScript linting and code quality.
Reorders devDependencies for better organization and consistency, and sets "type" to "commonjs" for module clarity. [`(efe1967)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/efe19678d1f47839dcdf772c4298cc1d05da6cec)


- Adds code quality, linting, and style tools

Integrates new dev dependencies for markdown linting, code duplication detection, stylelint, and link checking to improve code quality and maintainability. Updates ESLint config dependencies and refines .gitignore for node_modules backup. No production logic is affected. [`(ab20722)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab20722bb8cc27a69305ef294ea1b134b871ed8f)



### ⚙️ Miscellaneous Tasks

- Update version to 1.8.9 and adjust markdownlint dependency [`(02c4ee5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/02c4ee54e25645f12e817772ad881485ede5d028)


- Update changelogs for v1.8.9 [skip ci] [`(ca2fdf5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ca2fdf5b1fefda2ba053bf059000d4083110a35d)



### 📦 Dependencies

- [dependency] Update version 1.8.9 [`(534364d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/534364d09cd58223bc556944a844da7bf10590c1)






## [1.8.9] - 2025-06-22


[[fabc009](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fabc009ff629d95a1d998806db89c48624a28452)...
[f4e60df](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f4e60dfc53f32290b9eb99262c8418a6c4d1721f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/fabc009ff629d95a1d998806db89c48624a28452...f4e60dfc53f32290b9eb99262c8418a6c4d1721f))


### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(f4e60df)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f4e60dfc53f32290b9eb99262c8418a6c4d1721f)



### 💼 Other

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



### ⚙️ Miscellaneous Tasks

- Update changelogs for v1.8.8 [skip ci] [`(33454ed)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/33454ed211840d1dd96534215b11573ca26c0131)



### 📦 Dependencies

- [dependency] Update version 1.8.8 [`(ab8c318)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ab8c3181dbd175bd62190b4dff06d1b2a0550ca6)






## [1.8.8] - 2025-06-22


[[7fe4d2c](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7fe4d2c95c6af4a6bf98cf4fbfc012ea8ced7b4c)...
[2cef839](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2cef839bd26e541d48a53027d08a7ab363b6a086)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/7fe4d2c95c6af4a6bf98cf4fbfc012ea8ced7b4c...2cef839bd26e541d48a53027d08a7ab363b6a086))


### 🐛 Bug Fixes

- Add libarchive-tools to Flatpak installation in workflow [`(7fe4d2c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7fe4d2c95c6af4a6bf98cf4fbfc012ea8ced7b4c)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(2cef839)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2cef839bd26e541d48a53027d08a7ab363b6a086)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(09fd227)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/09fd2278b525ad3c1c6f95db695e91c7dad02618)



### 💼 Other

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



### ⚙️ Miscellaneous Tasks

- Update changelogs for v1.8.7 [skip ci] [`(5156f85)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5156f85174e6275a7ede04dfa43254906ce55dab)



### 📦 Dependencies

- [dependency] Update version 1.8.7 [`(9f810e9)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9f810e92a619d99bed9250f0efae46f6ba9c821b)






## [1.8.7] - 2025-06-21


[[26bc4ef](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26bc4ef07e2232af8754ecd2a3a99c3702195b85)...
[9a3a01d](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9a3a01d9f14cb3f26a181c321b2de6c3b3ba8a82)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/26bc4ef07e2232af8754ecd2a3a99c3702195b85...9a3a01d9f14cb3f26a181c321b2de6c3b3ba8a82))


### 🚀 Features

- Implement update notification system and enhance app state management [`(9a3a01d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9a3a01d9f14cb3f26a181c321b2de6c3b3ba8a82)



### 🐛 Bug Fixes

- Update package.json to include dist files and refine macOS packaging exclusions [`(26bc4ef)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/26bc4ef07e2232af8754ecd2a3a99c3702195b85)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(229bb5e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/229bb5ed2cec6e8eee5ef4319f9a1f52989cc6c8)



### 💼 Other

- Create eslint.config.mjs [`(1add9a3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/1add9a313c51bbb6b56355a8a2721de164324e48)



### 📦 Dependencies

- [dependency] Update version 1.8.6 [`(9c0ea9e)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9c0ea9e6998e424f5212f104cc315a78056a9805)


- [dependency] Update version 1.8.5 [`(fd1ede2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/fd1ede2668e108d54e2d86cfdd64a3d442617a03)






## [1.8.5] - 2025-06-21


[[3e49bac](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e49bac66297422e1daf9d8f2d0b9fe9c58e1251)...
[78307ae](https://github.com/Nick2bad4u/Uptime-Watcher/commit/78307aeb76c4d9b8b635e9fa27b033d5eeb38a35)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/3e49bac66297422e1daf9d8f2d0b9fe9c58e1251...78307aeb76c4d9b8b635e9fa27b033d5eeb38a35))


### 🐛 Bug Fixes

- Update version to 1.8.3 and add allowList for macOS packaging [`(3e49bac)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/3e49bac66297422e1daf9d8f2d0b9fe9c58e1251)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(78307ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/78307aeb76c4d9b8b635e9fa27b033d5eeb38a35)



### 📦 Dependencies

- [dependency] Update version 1.8.4 [`(73a0084)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/73a0084a892a532f7ce59e259acc66ac771ff3c9)






## [1.8.4] - 2025-06-21


[[f279496](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f279496112d5a73a7bd66211311a3e4c2e1cf69c)...
[b9ec1ae](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b9ec1ae834972736dc120a5d6426853ee484759e)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/f279496112d5a73a7bd66211311a3e4c2e1cf69c...b9ec1ae834972736dc120a5d6426853ee484759e))


### 🐛 Bug Fixes

- Update version to 1.8.2 and correct x64ArchFiles path in package.json [`(f279496)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f279496112d5a73a7bd66211311a3e4c2e1cf69c)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(b9ec1ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/b9ec1ae834972736dc120a5d6426853ee484759e)



### 📦 Dependencies

- [dependency] Update version 1.8.3 [`(3630062)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/36300627ced0af4346405356845aca30ada63491)






## [1.8.3] - 2025-06-21


[[9941edc](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9941edc881e37feabdb2c7e676bdb9c4f5f5c6e6)...
[45901e2](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45901e25e0ff05c5baa42e3c7df979dba07c8048)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/9941edc881e37feabdb2c7e676bdb9c4f5f5c6e6...45901e25e0ff05c5baa42e3c7df979dba07c8048))


### 🐛 Bug Fixes

- Update x64ArchFiles format in package.json to a string [`(9941edc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9941edc881e37feabdb2c7e676bdb9c4f5f5c6e6)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(45901e2)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/45901e25e0ff05c5baa42e3c7df979dba07c8048)



### 📦 Dependencies

- [dependency] Update version 1.8.2 [`(702953b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/702953b9a4ed4e6c3125ed2318088b2a70eba922)






## [1.8.2] - 2025-06-21


[[4e249c0](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e249c0582ba7986e5eabf4bfd245f03392ca1a7)...
[eb955e5](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eb955e5f0d975c3891738eb89f1b5f22df46da3f)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/4e249c0582ba7986e5eabf4bfd245f03392ca1a7...eb955e5f0d975c3891738eb89f1b5f22df46da3f))


### 🚀 Features

- Add x64ArchFiles exclusion for lightningcss-darwin-arm64 in package.json [`(eb955e5)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/eb955e5f0d975c3891738eb89f1b5f22df46da3f)


- Add build step for application and improve Flatpak installation commands [`(cede97a)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cede97a6eccbbb49c71dcd50cb931355a949e331)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(5a95072)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/5a950727631053afb5d12409e75eb4dc11588c25)



### 📚 Documentation

- Add Design-Plan and AddSiteForm documentation; update Flatpak build configuration for improved structure [`(4e249c0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4e249c0582ba7986e5eabf4bfd245f03392ca1a7)



### 📦 Dependencies

- [dependency] Update version 1.8.1 [`(00c6d6d)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/00c6d6dfc3dcedbfa9fd3c2fca1565c50777e212)






## [1.8.1] - 2025-06-21


[[9174b15](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9174b15321660e184ec4a9ef72dcdec586f3350c)...
[6e69bb7](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e69bb7c04203d1e76dfe10ad1f44426a7f1372b)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/9174b15321660e184ec4a9ef72dcdec586f3350c...6e69bb7c04203d1e76dfe10ad1f44426a7f1372b))


### 🚀 Features

- Implement availability color utility and enhance themed components with new status variants [`(50b2260)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/50b226067cb7937fdfa5dfebf50ecde976683f05)


- Enhance theme with hover states and update spacing variables in CSS [`(f1de760)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f1de76048978a1126954a0d2716d2cf7dc5f0c13)


- Enhance error alert styles and add site icon fallback functionality [`(0741ce0)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0741ce0e3fca5246d0e3e703b270efe4b107e9d8)


- Enhance SiteCard component with quick actions and improved uptime metrics [`(982281f)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/982281f0d8ea0bce20e8265ddeb9391f5b705c66)


- Add updateSite functionality to store and types [`(9174b15)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9174b15321660e184ec4a9ef72dcdec586f3350c)



### 🐛 Bug Fixes

- Update npm commands in Flatpak build configuration to use absolute paths [`(6e69bb7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e69bb7c04203d1e76dfe10ad1f44426a7f1372b)



### 🔀 Merge Commits

- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(89f5b29)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/89f5b29fcbc31a6de79ccbaf9b65b93e9154a18a)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(7d52d3c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/7d52d3cedf02fedd1b2899f27b4c2de3c975d561)


- [chore] Merge Branch 'main' of https://github.com/Nick2bad4u/Uptime-Watcher [`(bd53a9b)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bd53a9b407b41456aea6b66526be896eef826d42)



### 🛠️ GitHub Actions

- Rename flatpak-builder.yml to flatpak-build.yml [`(e308960)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/e3089606b0e43c4ce2d0f244865e4fbfdc0ceea9)


- Create flatpak-builder.yml [`(94bfc72)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/94bfc72ffdb09401a11febe1b2b6d49fd6efc512)



### 💼 Other

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



### 🎨 Styling

- Format code for improved readability in preload.js [`(0ea0dbc)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0ea0dbc81ad04fd4e95574e9d1f4470b6a6afe2d)



### ⚙️ Miscellaneous Tasks

- Update changelogs for v1.8.0 [skip ci] [`(6c5ba74)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6c5ba749b399c0d533ddb5bc202d8d7ce196ea6a)


- Update changelogs for v1.7.0 [skip ci] [`(a52fdc4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a52fdc431623c6b19923ef4dd85b605e3970db42)


- Update changelogs for v1.6.0 [skip ci] [`(0d47ce3)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/0d47ce3703ec536f5462bbb978e06e54d87ac5b6)


- Update Tailwind CSS to version 4.1.10 and adjust configuration [`(58ba9f7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/58ba9f7b3c60edfd811e0dd382ba9d0cbed659b5)


- Update changelogs for v1.5.0 [skip ci] [`(a1691f4)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/a1691f4003517be5aec230ff6fdb767085900dbf)


- Update changelogs for v1.4.0 [skip ci] [`(ba7ab4c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/ba7ab4cab57610645d1b20ced69477674c02810d)



### 📦 Dependencies

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


[[8167767](https://github.com/Nick2bad4u/Uptime-Watcher/commit/816776798a8688250efd2e9079d2fd36f5986791)...
[f91a50c](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f91a50c474b411725be5e2207d7e6809ce51092d)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/816776798a8688250efd2e9079d2fd36f5986791...f91a50c474b411725be5e2207d7e6809ce51092d))


### 🚀 Features

- Add supported OS list to package.json and package-lock.json [`(f91a50c)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/f91a50c474b411725be5e2207d7e6809ce51092d)


- Update preload script and add new icons [`(4964001)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/496400172cb0310f7f310f2002bc26c7cafb6ba7)



### 📦 Dependencies

- Merge pull request #2 from Nick2bad4u/dependabot/github_actions/github-actions-9a90b96a51

[ci](deps): [dependency] Update rojopolis/spellcheck-github-actions 0.51.0 in the github-actions group [`(d59e419)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d59e4191a211a4397040b380b89915922f77c9a4)


- *(deps)* [dependency] Update rojopolis/spellcheck-github-actions [`(9b33de1)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9b33de100e2a1dbdaec97bfee720f4ba13447cf9)


- [dependency] Update version 1.3.0 [`(8167767)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/816776798a8688250efd2e9079d2fd36f5986791)






## [1.3.0] - 2025-06-20


[[d6c99ae](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6c99ae31f3dc1ff67c73486c3600a8e13f63c72)...
[72ecf52](https://github.com/Nick2bad4u/Uptime-Watcher/commit/72ecf52451442d21671034f2fd73d87969d98e06)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/d6c99ae31f3dc1ff67c73486c3600a8e13f63c72...72ecf52451442d21671034f2fd73d87969d98e06))


### 🛠️ GitHub Actions

- Update Build.yml [`(72ecf52)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/72ecf52451442d21671034f2fd73d87969d98e06)



### 📦 Dependencies

- [dependency] Update version 1.2.0 [`(d6c99ae)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d6c99ae31f3dc1ff67c73486c3600a8e13f63c72)






## [1.2.0] - 2025-06-20


[[97e0a45](https://github.com/Nick2bad4u/Uptime-Watcher/commit/97e0a45761ae9fdaa6c557165671e9c1ead5b52f)...
[4749c7f](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4749c7f06e948d00d31f076ce239c645dd9ee8d8)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/97e0a45761ae9fdaa6c557165671e9c1ead5b52f...4749c7f06e948d00d31f076ce239c645dd9ee8d8))


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



### 🚜 Refactor

- Update SiteDetails styles to use new color variables and enhance error handling [`(6e26257)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/6e26257ebd298212352e7069ac4f3d9af0878b23)



### 📦 Dependencies

- [dependency] Update version 1.1.0 [`(d95c913)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/d95c913ff2e47c6e0f7be94b36c69e09bfe3bc19)






## [1.1.0] - 2025-06-20


[[135e14e](https://github.com/Nick2bad4u/Uptime-Watcher/commit/135e14edebc9a760ff38bc993ccea70d7774453d)...
[81d3a21](https://github.com/Nick2bad4u/Uptime-Watcher/commit/81d3a2169f51b9936cff643ce16c98d3d2d3af58)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/135e14edebc9a760ff38bc993ccea70d7774453d...81d3a2169f51b9936cff643ce16c98d3d2d3af58))


### 🚀 Features

- Add release, dist, and node_modules to .gitignore [`(cc38838)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/cc38838ae9c2771152b0f36cb22858dd36979ed6)


- Add cspell configuration for custom words [`(9b687cf)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9b687cf24f744a5559e58f385754aaecc02209a5)


- Add history limit and export/import functionality to uptime monitor [`(9d2bfd7)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/9d2bfd762dceedb4d7df4f8bd8c50adf70552376)


- Add manual site check functionality and enhance site statistics [`(4806c86)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/4806c8669657fede80b9d7b7b39db50aaa45e7eb)


- Add Site Details modal with charts and statistics [`(2930396)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/2930396d39e1bf0f448159adc62ee744f5a82a56)



### 🐛 Bug Fixes

- Update npm package ecosystem directory to root [`(bc20504)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/bc205040b1d77395feb8387e8faad5de7bd3d5c5)



### 💼 Other

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

- Simplify SiteDetails modal styles and enhance theme component CSS [`(81d3a21)`](https://github.com/Nick2bad4u/Uptime-Watcher/commit/81d3a2169f51b9936cff643ce16c98d3d2d3af58)






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/Uptime-Watcher/graphs/contributors) for their hard work!
## License
This project is licensed under the [MIT License](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/LICENSE.md)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
