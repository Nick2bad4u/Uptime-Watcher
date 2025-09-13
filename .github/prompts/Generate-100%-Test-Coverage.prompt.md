---
mode: "agent"
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'sequentialthinking', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Generate 100% Test Coverage"
---

# Review All Coverage and Test Files

## Workflow

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
11. All new test files should be created in `tests/strictTests/` directory, under electron, shared, or src directories as appropriate.
12. Always start with the files with the lowest coverage first, and work your way up to the highest coverage files.
13. Some files may have low coverage due to being development only features, console statements, or logging. These should be ignored for coverage purposes. (If you find a way to ignore those coverage lines in the report, even better!)

## Test Creation Rules

### General Guidelines

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
- **Compute Resource setting:** `unlimited` and `high` and `maximum`
- **Compute Constraint setting:** `unlimited` and `high` and `maximum`
- **Request constraint setting:** `unlimited` and `high` and `maximum`
- **Thinking Mode setting:** `Super Think` and `Deep Think` and `Think Harder` and `Think Twice`
- **Thinking Constraint Time setting:** `unlimited` and `high` and `maximum`
- **Thinking Constraint Compute setting:** `unlimited` and `high` and `maximum`
- **Thinking Constraint Requests setting:** `unlimited` and `high` and `maximum`

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

I REPEAT: You cannot stop until you eliminate all of these test warnings above for both Front AND Backend tests.
