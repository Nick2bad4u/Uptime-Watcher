---
mode: "agent"
tools: ["All Tools"]
description: "Perform a generic refactor for improved quality, maintainability, and conventions"
---

Refactor the target code to improve:

- Readability and code clarity
- Maintainability and modularity
- Type safety (TypeScript, if applicable)
- Error handling and edge cases
- Memory management and cleanup
- Consistency with project conventions
- Naming for variables, functions, and files

Refactoring Guidelines:

- Apply descriptive naming and clear structure
- Remove dead code, unnecessary comments, and redundancies
- Simplify complex logic and flatten nested structures
- Extract reusable logic into functions or hooks
- Add or improve JSDoc/type annotations
- Ensure all dependencies and side effects are handled properly
- Use latest language features and patterns (e.g., hooks, async/await)
- Add missing tests or improve test coverage

Testing Requirements:

- Ensure all functionality is covered by unit and integration tests
- Test error scenarios, edge cases, and cleanup logic
- Use mocks/stubs for external dependencies
- Validate performance and concurrent usage if relevant

Integration:

- Follow project architecture and directory structure
- Maintain compatibility with related modules, stores, or APIs
- Adhere to project error handling and logging conventions

Documentation:

- Update or add inline comments and JSDoc
- Provide before/after usage examples if changes are user-facing
- Document breaking changes and migration steps if needed

File Structure:

- Place refactored files in appropriate directories
- Export from relevant index files
- Update or add documentation as necessary
