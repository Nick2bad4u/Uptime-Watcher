---
mode: "agent"
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'sequentialthinking', 'playwright', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Generate 100% Playwright Test Coverage"

---
# Generate Comprehensive Playwright Test Coverage

# Review All Coverage and Test Files

## Workflow

Focus on End-to-End Test Generation using Playwright:

Fix any broken tests, and then write comprehensive E2E tests focusing on user flows, UI interactions, cross-browser scenarios, accessibility, and edge cases.

You have access to the Playwright MCP server for this task: https://github.com/microsoft/playwright-mcp
This allows you to use special tools to create Playwright tests. Use the Playwright MCP tools as much as possible to create robust E2E tests, these will allow you to "see" the application as a user would based on structured data.

Workflow:
1. Fix broken tests (`npm run test:e2e` or `npm run test:e2e:debug` (Debug Mode)).
2. Fix TypeScript errors (`npm run type-check:test`).
3. Fix lint errors (`npm run lint` or `npm run lint:fix`).
4. Create new E2E tests using Playwright to cover all user interactions, UI components, and scenarios. Use Playwright's codegen for initial test scaffolding if needed (`npx playwright codegen`).
5. Use the Playwright MCP tools to enhance test coverage and robustness. Using the tools will help you create more effective tests that cover more scenarios and edge cases.

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
   - `npm run test:e2e` (main test command)
   - `npm run test:e2e:debug` (Debug Mode)
   - `npm run test:e2e:headed` (for visual debugging)
   - `npm run type-check:test`
   *Do not move onto the next step until all tests pass with no errors or warnings.*
3. Ensure all tests pass with no errors or warnings.
4. Check scenarios and create tests for uncovered user paths, components, and integrations:
   - `npm run test:e2e` (run tests)
5. Scan application UI and code to create intelligent tests for all user flows, branches, and edge cases (e.g., error states, network failures, device responsiveness).
6. Ensure comprehensive tests for all edge cases
7. Use appropriate time and resource allowances for long-running operations (e.g., CI runners).
8. **Do not skip any user flows or components**, regardless of size or perceived triviality.
9. Aim for broad scenario coverage where feasible, prioritizing high-impact paths.
10. Do not stop, even if the process is lengthy.
11. All new test files should be created in the `playwright/tests` directory or equivalent, organized by feature (e.g., `ui/`, `api/`, `accessibility/`, etc).
12. Always start with the most critical user flows (e.g., login, core functionality) and work outward to less critical ones.
13. Some scenarios may have no tests due to being development-only or console-based; ignore these for E2E purposes.
14. You cannot stop until you eliminate all gaps in E2E scenario coverage for frontend integrations.
15. If you find a legitimate bug or issue while writing tests, fix the codebase as appropriate (only if 100% sure).
16. Do not test 3rd party libraries or services; focus on your own code and integrations.
17. Playwright's built-in features should be used as much as possible to create robust E2E tests (e.g., auto-waiting, retries). Playwright MCP tools should also be used extensively.
18. Use Playwright features as much as possible to create effective tests (e.g., fixtures, parallel execution).
19. Links to official Playwright documentation offer more detailed information and examples.
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
- Playwright MCP Tools (Highly Recommended for robust test creation)

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

- **Ignore development-only features, console logs, or non-UI elements.**
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
- Use Playwright's built-in features and the Playwright MCP tools extensively to create robust E2E tests.

---

### Important AI Note
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

## Playwright MCP Server Tools

- List can be found here: https://raw.githubusercontent.com/microsoft/playwright-mcp/refs/heads/main/README.md

## Ai Thinking Mode (Always use the highest possible settings)
- **Time constraint setting:** `unlimited`
- **Compute Resource setting:** `unlimited` and `high` and `maximum`
- **Compute Constraint setting:** `unlimited` and `high` and `maximum`
- **Request constraint setting:** `unlimited` and `high` and `maximum`
- **Thinking Mode setting:** `Super Think` and `Deep Think` and `Think Harder` and `Think Twice`
- **Thinking Constraint Time setting:** `unlimited` and `high` and `maximum`
- **Thinking Constraint Compute setting:** `unlimited` and `high` and `maximum`
- **Thinking Constraint Requests setting:** `unlimited` and `high` and `maximum`

You cannot stop until you eliminate all gaps in E2E scenario coverage:

I REPEAT: You cannot stop until you eliminate all gaps in E2E scenarios for both frontend integrations.

If you find a legitimate bug or issue while writing tests, document it in a separate file and fix the codebase as appropriate (only if 100% sure).
