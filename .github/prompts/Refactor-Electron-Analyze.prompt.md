---
mode: "agent"
tools: ["All Tools"]
description: "Review Electron main process/backend code to determine if refactoring is necessary"
---

Scrutinize the Electron main process/backend code for the following indicators that refactoring is needed:

- Code complexity: Are there large functions, deeply nested logic, or hard-to-follow flows?
- Type safety: Is all code fully typed using strict TypeScript? Any use of `any`, implicit types, or unsafe casts?
- Error handling: Are errors handled consistently and safely? Any silent failures or unhandled promise rejections?
- Separation of concerns: Are business logic, data access, IPC, and orchestration well-separated?
- Dependency injection: Are services, loggers, and repositories injected (for testability), or directly imported and tightly coupled?
- Test coverage: Are there unit/integration tests for all business logic, error scenarios, and event flows?
- Logging: Is logging contextual, structured, and never leaking sensitive data?
- State management: Is in-memory state safe, race-condition free, and well-encapsulated?
- Event emission: Are all custom events (IPC, EventEmitter) clearly documented and type-safe?
- Linting/style: Does all code comply with project ESLint/Prettier rules and conventions?
- Dead code or duplication: Any repeated logic or legacy/dead code that could be removed?
- Modern patterns: Are modern Electron, Node.js, and TypeScript patterns used throughout?

For each code area, indicate:

- Does it require refactoring? (Yes/No)
- If yes, briefly summarize why and what should be improved.

Format output as a checklist with detailed comments for any “Yes” answers.

Include recommendations for how to proceed if refactoring is needed.
