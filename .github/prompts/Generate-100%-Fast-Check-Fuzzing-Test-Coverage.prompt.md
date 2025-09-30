---
mode: "BeastMode"
tools: ['executePrompt', 'usages', 'testFailure', 'fetch', 'ms-vscode.vscode-websearchforcopilot/websearch', 'todos', 'edit/createFile', 'edit/createDirectory', 'edit/editFiles', 'search/fileSearch', 'search/textSearch', 'search/listDirectory', 'search/readFile', 'search/codebase', 'runCommands/runInTerminal', 'runCommands/getTerminalOutput', 'runTasks/runTask', 'runTasks/getTaskOutput', 'vscode-mcp/get_diagnostics', 'vscode-mcp/get_references', 'vscode-mcp/get_symbol_lsp_info', 'deepwiki/ask_question']

description: "Generate 100% Fast-Check Fuzzing Test Coverage"

---

# Review All Coverage and Test Files

## Workflow

Fast Check Focus Test Generation:

Fix any broken tests, and then write fuzz tests focusing on using:
https://fast-check.dev/ (Already installed)

Workflow:
1. Fix broken tests (`npm run test`)
2. Fix TypeScript errors (`npm run type-check:test`)
3. Fix lint errors (`npm run lint:fix`)
4. Create new "fuzzing" tests using fast-check (https://fast-check.dev/) to fulfill coverage and testing.

Pull info from: https://www.npmjs.com/package/@fast-check/vitest to make sure you're always using up-to-date modern testing methods.

Vitest Fast-Check Integration:
You should try to use this as MUCH as possible in testing as its designed to work with vitest:
@fast-check/vitest
https://www.npmjs.com/package/@fast-check/vitest

You can use this for the small amount of Zod integration it has, but primarily focus on @fast-check/vitest:
Vitest Zod Integration:
zod-fast-check
https://www.npmjs.com/package/zod-fast-check

If you need help with Fast-Check, pull from the resources below.
Fast-Check Resources:
- https://fast-check.dev/docs/core-blocks/
- https://fast-check.dev/docs/core-blocks/properties/
- https://fast-check.dev/docs/core-blocks/arbitraries/
- https://fast-check.dev/docs/core-blocks/runners/

- https://fast-check.dev/docs/advanced/race-conditions/
- https://fast-check.dev/docs/advanced/fake-data/
- https://fast-check.dev/docs/tutorials/detect-race-conditions/
- https://fast-check.dev/docs/advanced/model-based-testing/
- https://fast-check.dev/docs/advanced/fuzzing/

Regular testing methods:

1. **Fix all broken tests first.**
2. Run and check current test errors and warnings:
   - `npm run test`
   - `npm run test:electron`
   - `npm run test:shared`
   - `npm run type-check:test`
   *Do not move onto the next step until all tests pass with no errors or warnings.*
3. Ensure all tests pass with no errors or warnings.
4. Check coverage and create tests for files below 95% (or 100% if above 95%):
   - `npm run test:coverage`
   - `npm run test:electron:coverage`
   - `npm run test:shared:coverage`
5. Scan source code to create intelligent tests for all branches and edge cases.
6. Ensure comprehensive tests for all edge cases.
7. Use unlimited requests and time as needed.
8. **Do not skip any files**, regardless of size or perceived triviality.
9. Continue until all files reach 95% (or 100% if above 95%) coverage for branch, line, function, and statement.
10. Do not stop, even if the process is lengthy.
11. All new test files should be created in the test directory, under electron, shared, or src directories as appropriate.
12. Always start with the files with the lowest coverage first, and work your way up to the highest coverage files.
13. Some files may have low coverage due to being development only features, console statements, or logging. These should be ignored for coverage purposes. (If you find a way to ignore those coverage lines in the report, even better!)
14. An easy way to find files with low coverage is to run the coverage and then run the script: `node scripts/analyze-coverage.mjs --limit 5` to find the 5 lowest coverage files.
15. If you find a legitimate bug or issue while writing tests, document it in a separate file and fix the codebase as appropriate (only if 100% sure).
16. If something is too hard to test or mock, create a documentation file explaining why it is not covered, document edge cases, and suggest improvements for testability.
17. Fast-check should be used as much as possible to create more robust tests.
18. Use vitest features as much as possible to create more effective tests.
19. Always pull the links below for more detailed information or examples.
20. You can use CLI to filter test files by name, so you can test specific files:
   - Example: `npx vitest basic`: Will only execute test files that contain basic: `basic.test.ts` `basic-foo.test.ts` `basic/foo.test.ts`
21. Always ensure no TypeScript errors in tests. Use `expectTypeOf` or `assertType` for type tests if needed.
22. Use `vi.mock()` to mock dependencies and reset mocks between tests with `vi.resetAllMocks()` or `vi.restoreAllMocks()`. Use `vi.fn()` for mock functions.
23. Use `vi.bench()` for benchmarks, isolating them and using `vi.fn()` for mock functions in benchmarks.
24. Use `toMatchSnapshot` for object/component snapshots (not recommended) or `toMatchInlineSnapshot()` for inline snapshots (recommended if needed).

## Test Creation Rules

### General Guidelines
>>> FOCUS ON ADDING TO EXISTING TESTS, NOT CREATING NEW TEST FILES UNLESS ABSOLUTELY NECESSARY. <<<
1. **Aim for clarity and simplicity** in your tests. They should be easy to read and understand.
2. **Test one thing at a time**. If a test is failing, you should be able to pinpoint the exact cause.
3. **Use descriptive names** for your tests. This will make it easier to understand what is being tested and why.
4. **Vitest Features are useful** for creating more effective tests. Familiarize yourself with them to enhance your testing strategy.
5. Use the following vitest features as they improve testing:

- Vitest Expect (Required)
- Vitest It (Required)
- Vitest Describe (Required)
- Vitest Bench (Optional (Recommended for performance testing))
- Vitest Mock (Optional (Recommended for mocking dependencies))
- Vitest Task (Optional (Recommended for managing test metadata))
- Vitest Annotate (Optional (Recommended for adding metadata to tests))
- Vitest Signal (Optional (Recommended for creating test signals))
- Vitest Snapshot (Optional (Recommended for creating test snapshots))

6. Always pull the links below for more detailed information or examples.
7. You can use CLI to filter test files by name, so you can test specific files:
   - Example: `npx vitest basic`: Will only execute test files that contain basic: `basic.test.ts` `basic-foo.test.ts` `basic/foo.test.ts`

### Vitest API Reference

- [Vitest API Reference](https://vitest.dev/api/)

#### Test Context

- `expect`: Assertions
- `describe`: Group tests
- `it`: Individual tests
- `skip`: Skip tests
- `task`: Metadata about the test
- `annotate`: Add metadata to tests
- `signal`: Create test signals

- [Vitest Test Context](https://vitest.dev/guide/test-context.html)

#### Type Testing

- Not required, but if used, ensure no type errors.
- Use `expectTypeOf` or `assertType` for type tests.
- [Vitest Type Testing](https://vitest.dev/guide/testing-types.html)

#### Test Mocking

- Use `vi.mock()` to mock dependencies.
- Reset mocks between tests: `vi.resetAllMocks()` or `vi.restoreAllMocks()`.
- Use `vi.fn()` for mock functions.
- [Vitest Mocking](https://vitest.dev/guide/mocking.html)

#### Test Benchmarking

- Use `vi.bench()` for benchmarks.
- Isolate benchmarks.
- Use `vi.fn()` for mock functions in benchmarks.
- [Vitest Benchmarking](https://vitest.dev/config/#benchmark)

#### Test Snapshotting

- Use `toMatchSnapshot` for object/component snapshots (not recommended).
- Use `toMatchInlineSnapshot()` for inline snapshots (recommended if needed).
- [Vitest Snapshotting](https://vitest.dev/guide/snapshot.html)

## Special Instructions

- **Ignore coverage for console statements, logging, barrel exports, constants, and development-only features.**
- Focus on functional code and logic.
- Cover all edge cases where applicable.
- If something is too hard to test or mock:
  - Create a documentation file explaining why it is not covered.
  - Document edge cases and suggest improvements for testability.
- **If you discover a legitimate bug or issue while writing tests:**
  - Document it in a separate file.
  - Fix the codebase as appropriate (only if 100% sure).

## Requirements

- 95% branch, line, function, and statement coverage for all files (100% if above 95% already).
- Create tests for all files below 95% coverage until all files are covered.

## If Attachments Are Present

- They are problems identified in test runs that need to be fixed.
- If nothing attached, start with `npm run test` to fix broken tests.
- If no tests are broken, use `npm run test:coverage` and add testing to the uncovered areas.

---

### Important AI Note

- **Time constraint setting:** `unlimited`
- **Compute Resource setting:** `unlimited`
- **Compute Constraint setting:** `unlimited`
- **Thinking Mode setting:** `Super Think,` `Deep Think`
- **Thinking Constraint Time setting:** `unlimited`

---

## All Possible Test API to Use

### Test

- `test.extend`
- `test.skip`
- `test.skipIf`
- `test.runIf`
- `test.only`
- `test.concurrent`
- `test.sequential`
- `test.todo`
- `test.fails`
- `test.each`
- `test.for`

### Bench

- `bench`
- `bench.skip`
- `bench.only`
- `bench.todo`

### Describe

- `describe`
- `describe.skip`
- `describe.skipIf`
- `describe.runIf`
- `describe.only`
- `describe.concurrent`
- `describe.sequential`
- `describe.shuffle`
- `describe.todo`
- `describe.each`
- `describe.for`

### Setup and Teardown

- `beforeEach`
- `afterEach`
- `beforeAll`
- `afterAll`

### Test Hooks

- `onTestFinished`
- `onTestFailed`

## Test Assertions

- A long list can be found here: [Vitest Test Assertion API](https://vitest.dev/api/assert.html)

You cannot stop until you eliminate all of these test warnings:

I REPEAT: You cannot stop until you eliminate all of these test warnings:

"ERROR: Coverage for lines does not meet global threshold (95%)"
"ERROR: Coverage for functions does not meet global threshold (95%)"
"ERROR: Coverage for statements does not meet global threshold (95%)"
"ERROR: Coverage for branches does not meet global threshold (95%)"

No failing tests, no TypeScript errors, no lint errors, and 95% coverage (100% if above 95%) for all files.
If you have failing tests, fix them first, you cannot stop until all tests pass with no errors or warnings.
