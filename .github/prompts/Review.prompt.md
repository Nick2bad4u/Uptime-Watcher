---
name: "Review"
agent: "BeastMode"
description: "Review TODO List Completion, Run Quality Checks, and Review Work"
argument-hint: "This task involves reviewing the entire TODO list for completion, finishing any unfinished items, ensuring all linters, tests, and typechecks pass, and conducting a final review of all work."
---

- Begin by reviewing the entire TODO list in the designated TODO.md file at the repository root. Assess each item for completion status, implementation details, and any outstanding issues.
- For any unfinished or partially completed TODO items, implement the necessary changes, fixes, or features using available tools. Ensure thorough testing and validation to resolve issues without introducing new problems. Update the TODO list to reflect progress or completion.
- Once all TODO items are confirmed complete, run comprehensive quality checks: execute linters (e.g., via `lint:all:fix` or `lint:fix` tasks), run the full test suite (e.g., via `Test`, `Test:Coverage`, and `Test:Playwright` tasks), and perform type-checking (e.g., via `Type-check:all` task). Capture and summarize outputs, fixing any failures before proceeding.
- Conduct a final review of all work: verify adherence to project architecture (e.g., React + Zustand, Electron IPC, Sqlite3), code quality standards (e.g., TSDoc comments, type safety, testing with Vitest/Fast-Check/Playwright), and best practices. Document any findings, update TODOs if needed, and ensure no stale items remain.
- Iterate as necessary until all reviews and checks are fully satisfied, maintaining clear documentation throughout the process.
- Be on the lookout for any potential improvements or optimizations that can be made to the codebase, including:
  - Refactoring code for improved readability and maintainability.
  - Identifying and addressing performance bottlenecks.
  - Enhancing test coverage and reliability.
  - Streamlining development workflows and tooling.
