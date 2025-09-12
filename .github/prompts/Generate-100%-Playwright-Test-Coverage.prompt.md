---
mode: "agent"
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'sequentialthinking', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Generate 100% Playwright Test Coverage"

---
# Generate Comprehensive Playwright Test Coverage

# Review All Coverage and Test Files

## Workflow

Focus on End-to-End Test Generation using Playwright:

Fix any broken tests, and then write comprehensive E2E tests focusing on user flows, UI interactions, cross-browser scenarios, accessibility, and edge cases.

Workflow:
1. Fix broken tests (`npx playwright test` or `npm run test:e2e` if configured).
2. Fix TypeScript errors (`npm run type-check:test`).
3. Fix lint errors (`npm run lint:fix`).
4. Create new E2E tests using Playwright to cover all user interactions, UI components, and scenarios. Use Playwright's codegen for initial test scaffolding if needed (`npx playwright codegen`).

Pull info from: https://playwright.dev/docs/codegen to ensure modern test generation methods.

Playwright Test Generation:
You should use Playwright's built-in tools as much as possible for E2E testing:
- Playwright Best Practices: https://playwright.dev/docs/best-practices
- Playwright Test Assertions: https://playwright.dev/docs/test-assertions
- Playwright Test Runner: https://playwright.dev/docs/test-runner
- Playwright Trace Viewer: https://playwright.dev/docs/trace-viewer
- Playwright Test TypeScript: https://playwright.dev/docs/test-typescript



For advanced scenarios, integrate with Playwright's API testing or visual comparisons:
- API Testing: https://playwright.dev/docs/api-testing
- Visual Comparisons: https://playwright.dev/docs/test-snapshots

If you need help with Playwright, pull from the resources below.
Playwright Resources:
- Playwright Test Use Options: https://playwright.dev/docs/test-use-options
- Playwright Test Configuration: https://playwright.dev/docs/test-configuration
- Playwright Test Intro: https://playwright.dev/docs/intro
- Playwright API Class: https://playwright.dev/docs/api/class-playwright
- Playwright Test Configuration: https://playwright.dev/docs/test-configuration
- Playwright Test Parallelism: https://playwright.dev/docs/test-parallelism
- Playwright Test Retries: https://playwright.dev/docs/test-retries
- Playwright Test Timeouts: https://playwright.dev/docs/test-timeouts
- Playwright Test Fixtures: https://playwright.dev/docs/test-fixtures
- Playwright Locators: https://playwright.dev/docs/locators
- Playwright Pages: https://playwright.dev/docs/pages
- Playwright Browsers: https://playwright.dev/docs/browsers
- Playwright Screenshots: https://playwright.dev/docs/screenshots
- Playwright Videos: https://playwright.dev/docs/videos
- Playwright Accessibility Testing: https://playwright.dev/docs/accessibility-testing
- Playwright Test Assertions: https://playwright.dev/docs/test-assertions

Regular testing methods:

1. **Fix all broken tests first.**
2. Run and check current test errors and warnings:
   - `npx playwright test`
   - `npx playwright test --headed` (for visual debugging)
   - `npm run type-check:test`
   *Do not move onto the next step until all tests pass with no errors or warnings.*
3. Ensure all tests pass with no errors or warnings.
4. Check scenario coverage and create tests for uncovered user paths, components, and integrations:
   - `npx playwright test` (run tests)
   - `npx playwright test --coverage` (only if a coverage tool is configured and integrated)
   - `npx playwright show-report` (open Playwright HTML report when available)
   - Review test reports for gaps and adjust tests accordingly
5. Scan application UI and code to create intelligent tests for all user flows, branches, and edge cases (e.g., error states, network failures, device responsiveness).
6. Ensure comprehensive tests for all edge cases (e.g., slow networks, invalid inputs, accessibility violations).
7. Use appropriate time and resource allowances for long-running operations (e.g., CI runners). Do not assume unlimited host resources; treat resource claims as environment-specific.
8. **Do not skip any user flows or components**, regardless of size or perceived triviality.
9. Aim for broad scenario coverage where feasible, prioritizing high-impact paths. Document areas that cannot be reasonably covered by E2E tests (e.g., tightly-coupled third-party services) and propose mock strategies.
10. Do not stop, even if the process is lengthy.
11. All new test files should be created in the `playwright/tests` directory or equivalent, organized by feature (e.g., `ui/`, `api/`, `accessibility/`).
12. Always start with the most critical user flows (e.g., login, core functionality) and work outward to less critical ones.
13. Some scenarios may have low coverage due to being development-only or console-based; ignore these for E2E purposes. Use Playwright's ignore options in config for non-functional elements.
14. An easy way to identify gaps is to run tests and review the Playwright report, or use `npx playwright test --list` to audit test files.
15. If you find a legitimate bug or issue while writing tests, document it in a separate file and fix the codebase as appropriate (only if 100% sure).
16. If something is too hard to test or mock (e.g., third-party integrations), create a documentation file explaining why it is not covered, document edge cases, and suggest improvements for testability (e.g., using Playwright's API mocking).
17. Playwright's built-in features should be used as much as possible to create robust E2E tests (e.g., auto-waiting, retries).
18. Use Playwright features as much as possible to create effective tests (e.g., fixtures, parallel execution).
19. Always pull the links below for more detailed information or examples.
20. You can use CLI to filter test files by name, so you can test specific files:
   - Example: `npx playwright test login`: Will only execute test files that contain "login" in the name.
21. Always ensure no TypeScript errors in tests. Use Playwright's type-safe locators and assertions.
22. Use `page.route()` or `page.unroute()` to mock network requests and reset between tests.
23. Use `page.screenshot()` or `expect(page).toHaveScreenshot()` for visual regression testing.
24. Use `test.describe.serial` for sequential tests if needed, and `test.use()` for custom fixtures.

## Test Creation Rules

### General Guidelines
>>> FOCUS ON ADDING TO EXISTING TESTS, NOT CREATING NEW TEST FILES UNLESS ABSOLUTELY NECESSARY. <<<
1. **Aim for clarity and simplicity** in your tests. They should be easy to read and understand, mimicking real user actions.
2. **Test one user flow at a time**. If a test is failing, you should be able to pinpoint the exact cause in the UI or integration.
3. **Use descriptive names** for your tests. This will make it easier to understand what user scenario is being tested and why.
4. **Playwright Features are useful** for creating more effective E2E tests. Familiarize yourself with them to enhance your testing strategy.
5. Use the following Playwright features as they improve testing:

- Playwright Page (Required)
- Playwright Locator (Required)
- Playwright Browser Context (Required)
- Playwright Test Fixtures (Recommended for setup/teardown)
- Playwright Assertions (Required)
- Playwright Screenshots/Videos (Optional, Recommended for debugging)
- Playwright Accessibility (Optional, Recommended for inclusive testing)
- Playwright API Testing (Optional, Recommended for backend integration)
- Playwright Visual Comparisons (Optional, Recommended for UI consistency)

6. Always pull the links below for more detailed information or examples.
7. You can use CLI to filter test files by name, so you can test specific files:
   - Example: `npx playwright test basic`: Will only execute test files that contain "basic" in the name.

### Playwright API Reference

- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)

#### Test Context

- `page`: Interact with the browser page
- `browser`: Control the browser instance
- `context`: Manage browser contexts (e.g., for isolation)
- `test.describe`: Group tests
- `test`: Individual tests
- `test.skip`: Skip tests
- `test.only`: Run only specific tests

- [Playwright Test Configuration](https://playwright.dev/docs/test-configuration)

#### Type Testing

- Not required for E2E, but ensure locators and assertions are type-safe with Playwright's TypeScript support.
- [Playwright TypeScript](https://playwright.dev/docs/test-typescript)

#### Test Mocking

- Use `page.route()` to mock network requests.
- Reset mocks between tests by using fresh contexts or `page.unroute()`.
- Use `page.evaluate()` for custom mocking.
- [Playwright Network Interception](https://playwright.dev/docs/network)

#### Test Benchmarking

- Use Playwright's performance APIs (e.g., `page.evaluate(() => performance.now())`) for basic timing.
- Isolate performance tests in separate suites.
- [Playwright Performance](https://playwright.dev/docs/api/class-page#page-evaluate)

#### Test Snapshotting

- Use `expect(page).toHaveScreenshot()` for visual snapshots (recommended).
- Use `toMatchSnapshot` for custom snapshots if needed.
- [Playwright Screenshots](https://playwright.dev/docs/screenshots)

## Special Instructions

- **Ignore coverage for development-only features, console logs, or non-UI elements.**
- Focus on functional user interactions and integrations.
- Cover all edge cases where applicable (e.g., mobile views, slow connections).
- If something is too hard to test or mock:
  - Create a documentation file explaining why it is not covered.
  - Document edge cases and suggest improvements for testability (e.g., exposing APIs for mocking).
- **If you discover a legitimate bug or issue while writing tests:**
  - Document it in a separate file.
  - Fix the codebase as appropriate (only if 100% sure).

## Requirements

- Aim for comprehensive scenario coverage for all user flows, UI components, and integrations where reasonably possible.
- Where 100% E2E coverage is not feasible, document gaps, provide rationale, and propose alternatives (unit/integration tests, mocks).

## If Attachments Are Present

- They are problems identified in test runs that need to be fixed.
- If nothing attached, start with `npx playwright test` to fix broken tests.
- If no tests are broken, use `npx playwright show-report` and add testing to the uncovered scenarios.

---

### Important AI Note (edited for factual accuracy)
- Time and compute: assume no explicit constraints in the prompt, but respect the actual environment where tests run (CI, local machine). Do not assert host-level guarantees such as "unlimited time" or "unlimited compute".
- Thinking Mode labels in this file are guidance only and do not change real-world runtime or scheduling.

---

### Important AI Note

- **Time constraint setting:** `unlimited`
- **Compute Resource setting:** `unlimited`
- **Compute Constraint setting:** `unlimited`
- **Thinking Mode setting:** `Super Think,` `Deep Think`
- **Thinking Constraint Time setting:** `unlimited`

---

## All Possible Test API to Use (pruned to commonly-supported Playwright APIs)

### Test
- test
- test.only
- test.skip
- test.describe
- test.describe.serial
- test.describe.parallel (use with understanding of concurrency)
- test.beforeEach
- test.afterEach
- test.beforeAll
- test.afterAll
- test.use
- test.extend

### Setup and Teardown
- test.beforeEach
- test.afterEach
- test.beforeAll
- test.afterAll

### Test Hooks
- Custom hooks via fixtures or `test.use` / `test.extend`

## Test Assertions

- A long list can be found here: [Playwright Test Assertions](https://playwright.dev/docs/test-assertions)

You cannot stop until you eliminate all gaps in E2E scenario coverage:

I REPEAT: You cannot stop until you eliminate all gaps in E2E scenario coverage for both frontend and backend integrations.

If you find a legitimate bug or issue while writing tests, document it in a separate file and fix the codebase as appropriate (only if 100% sure).
