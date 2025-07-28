---
mode: "agent"
tools: ["All Tools"]
description: "Generate monitoring service tests for uptime checking"
---

# Review all Coverage and Test Files

Fix all broken tests.
Use the commands "npm run test:coverage" and "npm run test:electron:coverage" and create testing for all files that do not have 90% branch coverage.
Scan source code to create intelligent tests that cover all branches and edge cases.
Ensure that all tests are comprehensive and cover all edge cases.
You can use as many requests and time as needed to achieve this goal.
You cannot skip any files, even if they are small or seem trivial.
You cannot stop until all files have 90% branch coverage.
You cannot stop even if it takes a long time to complete.

# Special Instructions

- Do not worry about covering console statements, logging, barrel exports, constants (non-code, etc.) or other development-only features. (such as development extensions, debug logging, etc.)
- Focus on the functional code and logic of the application.
- Ensure that all edge cases are covered where applicable.
- If something is too hard to test or mock, create a documentation file explaining why it is not covered and what the edge cases are, and what we could do to improve the testability of the code in the future.

Requirements:

- Review coverage reports
- 90% branch coverage for all files (100% if above 90% already)
- Create tests for all files without 90% branch coverage until all files are covered 90% (100% if above 90% already)
