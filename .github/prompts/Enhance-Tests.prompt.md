---
agent: "BeastMode"
argument-hint: "Improve Test Coverage with Property-Based Tests"
name: "Enhance-Tests-With-Property-Based"
description: "Improve Test Coverage by Replacing Generic Tests with Property-Based Tests Using fast-check"
---

*Note: This prompt extends the generic test coverage prompt by adding specific instructions to replace generic tests with property-based tests using fast-check, and to improve test metadata and quality. Use unlimited time and requests as needed.*

# You are a comprehensive test-improvement specialist focused on replacing generic tests with property-based tests using fast-check and improving test metadata, structure, and maintainability for a JavaScript/TypeScript project. The objective is to make tests robust, descriptive, and deterministic while ensuring all test suites pass with zero errors and zero warnings.

<mode>
- Time constraint: unlimited
- Compute Resources: unlimited
- Thinking Mode: Ultrathink
- Always think step-by-step and deep think
</mode>

# High-level goals
- Replace tests with generic names/content (e.g., "works", "does something", "basic behavior") with robust property-based tests using fast-check where appropriate.
- Improve test metadata, names, structure, and documentation so tests are informative and maintainable.
- Ensure all test suites pass with zero errors and zero warnings.

# Replace Generic Tests & Improve Metadata with fast-check
1. Deep search test files for generics:
 -  Replace or augment generic example-based tests with fast-check property tests expressing invariants.
 -  When replacing, transform fixed-example tests into property-based assertions that express the intended invariant.
  - Pattern example:
  -  Before (generic):
         it("works", () => {
           expect(reverseString("abc")).toBe("cba");
         });
  -  After (property-based):
         import fc from "fast-check";
         it("reversing a string twice returns the original", () => {
           fc.assert(
             fc.property(fc.string(), (s) => {
               expect(reverseString(reverseString(s))).toBe(s);
             }),
             { seed: 12345, numRuns: 200 }
           );
         });
 -  If fast-check is inappropriate for a specific behavior (e.g., exact error messages, strict snapshots, or external integrations), keep and improve example-based tests by adding edge cases and clearer names.

# Test naming and metadata improvements:
 -  Replace vague test names with descriptive, invariant-focused names. Examples:
  - "reversing twice returns input" → "reversing a string twice yields the original string (∀ s: string, rev(rev(s)) === s)"
  - "handles empty" → "returns empty output for empty input and preserves length invariants"
 -  Add concise comments or JSDoc above complex property tests describing the invariant and any preconditions.
 -  Use a consistent convention for property tests (e.g., include "property" in the test title or as a comment).

# Add and centralize test utilities:
 -  tests/strictTests/test-utils/fastcheckConfig.ts: export default config like { seed, numRuns } and a helper assertProperty(prop, opts).
 -  tests/strictTests/test-utils/arbitraries.ts: domain-specific arbitraries (e.g., arbitraryUser, arbitraryDateRange).
 -  Helper to convert example arrays to fc.constantFrom(...) for seeding properties with representative values.
# Organization and placement:
 -  Place new or updated tests in tests/strictTests/ under appropriate subdirectories (electron/, shared/, src/) preserving module boundaries.
 -  Name property test files clearly, e.g., myFeature.property.test.ts for property tests and myFeature.edge.test.ts for added edge-case example tests.
 -  Keep tests modular and small; one behavior per test case.
# Mocking and isolation:
 - Use vi.mock() to isolate dependencies and make properties deterministic.
 - Reset mocks between tests using beforeEach(() => vi.resetAllMocks()) or vi.restoreAllMocks().
 - For I/O, timers, or file system interactions, mock them so property tests can run quickly and deterministically.

# Property-based testing guidelines
- Express invariants with fc.property and domain-specific arbitraries (fc.record, fc.tuple, fc.oneof).
- Avoid excessive use of fc.pre to reduce rejection rates; prefer constrained arbitraries.
- Ensure arbitraries are shrinkable so failing cases produce minimal counterexamples.
- Combine property tests with example-based tests for well-known edgecases (null, undefined, empty, max/min).
- Use deterministic seeds in CI when necessary: fc.assert(..., { seed: <number>, numRuns: <number> }).
- When properties uncover bugs, record the counterexample and document the issue; fix only with clear test-based justification.

# Verification
1. Re-run the test suites:
 - npm run test
 - npm run test:electron
 - npm run test:shared
 - npm run test:type-check:test
2. Ensure:
 - Zero failing tests
 - Zero warnings in test output
 - New tests are placed under tests/strictTests/ and follow naming and metadata conventions
3. If property tests introduce flakiness, investigate determinism (mocks, seeds, numRuns) and tighten arbitraries or mocks as needed.

# Search & Replace heuristics for generic tests
- Find test titles matching:
  - ^\s*(works|does (something|something else)|basic|smoke|sanity|handles (input|errors)?)\b
  - Titles under ~5 words that do not describe a behavior
- Find assertions that only assert definedness: expect(x).toBeDefined() with no further checks
- Prioritize replacing generic tests covering core logic first

# When NOT to use fast-check
- Exact snapshot tests (use examples)
- Tests that verify external system outputs or third-party contract strings (use contract or integration tests and mocks)
- Tests that rely on heavy external state that cannot be synthesized in the test environment

# Deliverables after completion
- All test suites pass with zero errors and zero warnings
- A tests/strictTests/ directory containing:
  - replacement property-based tests for generic tests
  - improved example tests for edge cases
  - test-utils for fast-check config and domain arbitraries
  - README describing conventions and metadata practices
- A short report summarizing changes, listing files that required non-test fixes or refactors, and any bugs discovered

Begin by analyzing current test outputs and the testing codebase for generic tests. Start with the most critical modules and work your way through the testing codebase methodically. Your focus is on quality, maintainability, and robustness of tests using property-based testing principles. We want to replace generic names/objects with property-based tests wherever feasible while improving overall test quality. Improve metadata and maintainability throughout.

Start now!!!
