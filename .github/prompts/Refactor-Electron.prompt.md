---
mode: "agent"
tools: ["All Tools"]
description: "Refactor core backend service classes: orchestration, state, repository and event logic for maintainability, type safety, and testability"
---

Refactor this core backend service class to optimize for:

- Strong TypeScript typing (strict mode, all members and methods fully typed)
- Clean object-oriented design: clear separation between orchestration, data access (repositories), event emission, and business logic
- Dependency injection for external services (database, logger, repositories, schedulers)
- Testability: pure logic where possible, all side effects (DB, events, logging) injectable/mocked
- Idiomatic error handling (typed, contextual, never leak sensitive data)
- Comprehensive JSDoc for all class members, methods, and public APIs
- Compliance with project’s ESLint, Prettier, and TypeScript rules
- Compatibility with Electron main process, IPC, and state management patterns

Refactoring Guidelines:

- Break up large methods into smaller, focused, testable functions (private where possible)
- Extract side-effectful logic (DB, event emission, logging) so it can be easily stubbed/mocked
- Use repository and service patterns consistently for all data access and business logic
- Avoid direct state mutation—use encapsulation and helper methods for cache/state updates
- Use modern TypeScript features (readonly, types, generics, access modifiers)
- Add/Improve JSDoc for all methods, including usage examples
- Ensure all events, errors, and async flows are fully documented and typed
- All logger calls must be contextual but never expose sensitive data

Testing Requirements:

- 100% unit test coverage for all business logic, event flows, and error handling
- Mock all repositories, services, logger, and event emitter in tests
- Test key flows: site/monitor CRUD, monitoring start/stop, event emission, database errors, import/export
- Validate correct in-memory state and cache updates in all branches
- Test Electron IPC/event integration where relevant

Integration & Documentation:

- Place refactored core service in src/services/ (or equivalent) directory
- Export class and main types from index.ts
- Add and update JSDoc for all exported APIs and events
- Include integration and usage examples in documentation/README
- Document event flows, error handling, and state management patterns

File Structure:

- src/services/
  - UptimeMonitor.ts (core service class)
  - index.ts (exports)
  - **tests**/
    - UptimeMonitor.test.ts
- Update/add README.md for service usage, event and IPC integration
