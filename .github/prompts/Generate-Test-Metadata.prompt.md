---
mode: "BeastMode"
tools: ['runSubagent', 'usages', 'testFailure', 'fetch', 'ms-vscode.vscode-websearchforcopilot/websearch', 'todos', 'edit/createFile', 'edit/createDirectory', 'edit/editFiles', 'search/fileSearch', 'search/textSearch', 'search/listDirectory', 'search/readFile', 'search/codebase', 'runCommands/runInTerminal', 'runCommands/getTerminalOutput', 'runTasks/runTask', 'runTasks/getTaskOutput', 'vscode-mcp/get_diagnostics', 'vscode-mcp/get_references', 'vscode-mcp/get_symbol_lsp_info']

description: "Add Metadata and Benchmarks to existing tests"
---

1. I want you to work on creating Vitest Benchmarks for our most critical heavy compute areas.

2. I want you to add more metadata to ALL of our tests using the vitest context features.

3. Dont stop until you have scanned every single test file and added metadata to all of them.

Always have meaningful metadata that aligns with the project.

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

- 90% branch, line, function, and statement coverage for all files (100% if above 90% already).
- Create tests for all files below 90% coverage until all files are covered.

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
