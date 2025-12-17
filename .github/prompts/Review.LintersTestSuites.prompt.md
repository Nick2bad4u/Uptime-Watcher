---
name: "Review-Linters-Test-Suites"
agent: "BeastMode"
description: "Review Test Suites and Linters"
argument-hint: "This task involves reviewing the entire test suites and linters to ensure they all pass successfully without any errors or warnings."
---

-  Run comprehensive quality checks: execute linters (e.g., via `lint:all:fix` or `lint:fix` tasks), run the full test suite (e.g., via `Test`, `Test:Coverage`, and `Test:Playwright` tasks), and perform type-checking (e.g., via `Type-check:all` task). Capture and summarize outputs, fixing any failures before proceeding.
- Make sure all linters, tests, and typechecks pass successfully without any errors or warnings.
- The test suites you need to look into are Vitest, Playwright, and Storybook.
- The linters you need to look into are ESLint, Stylelint, and any other linters configured in the project. You can run them all with the commands "npm run lint:all:fix" or "npm run lint:all:fix".
- Don't stop until every single test case is passing and all linter issues are resolved.
