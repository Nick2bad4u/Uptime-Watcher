<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]


[[197f637](https://github.com/Nick2bad4u/Uptime-Watcher/commit/197f63786d00b9d174331c0ad4ff8b95cc8aa25c)...
[197f637](https://github.com/Nick2bad4u/Uptime-Watcher/commit/197f63786d00b9d174331c0ad4ff8b95cc8aa25c)]
([compare](https://github.com/Nick2bad4u/Uptime-Watcher/compare/197f63786d00b9d174331c0ad4ff8b95cc8aa25c...197f63786d00b9d174331c0ad4ff8b95cc8aa25c))


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






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/Uptime-Watcher/graphs/contributors) for their hard work!
## License
This project is licensed under the [MIT License](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/LICENSE.md)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
