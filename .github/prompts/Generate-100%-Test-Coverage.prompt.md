---
mode: "agent"
tools: ["All Tools"]
description: "Generate 100% Test Coverage"
---

# Review all Coverage and Test Files

Fix all broken tests.
Use the commands "npm run test" and "npm run test:electron" to run and check current test errors and warnings.
Ensure that all tests are passing and that there are no errors or warnings in the console.
Use the commands "npm run test:coverage" and "npm run test:electron:coverage" to check current coverage and create testing for all files that do not have 90% (100% if above 90%) branch/line/func/statement coverage.
Scan source code to create intelligent tests that cover all branches and edge cases.
Ensure that all tests are comprehensive and cover all edge cases.
You can use as many requests and time as needed to achieve this goal.
You cannot skip any files, even if they are small or seem trivial.
You cannot stop until all files have 90% (100% if above 90%) branch/line/func/statement coverage.
You cannot stop even if it takes a long time to complete.

# Special Instructions

- !!! Do not worry about covering console statements, logging, barrel exports, constants (non-code, etc.) or other development-only features. (such as development extensions, debug logging, etc.)
- Focus on the functional code and logic of the application.
- Ensure that all edge cases are covered where applicable.
- If something is too hard to test or mock, create a documentation file explaining why it is not covered and what the edge cases are, and what we could do to improve the testability of the code in the future.
- !!! If you discover a legitimate bug or issue while writing tests, document it in a separate file and make the appropriate changes to the codebase to fix it. You must be 100% sure that the bug is legitimate and not a false positive.

Requirements:

- 90% branch/line/func/statement coverage for all files (100% if above 90% already)
- Create tests for all files without 90% branch/line/func/statement coverage until all files are covered 90% (100% if above 90% already)

If Attachments are present:

- They are problems that were identified in test runs that need to be fixed.
