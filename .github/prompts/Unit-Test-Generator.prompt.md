---
mode: "agent"
tools: ["All Tools"]
description: "Generate comprehensive unit tests for existing code"
---

Generate comprehensive unit tests for: ${input:targetFile}

Requirements:

- Use Vitest testing framework
- Follow existing test patterns in the project
- Create test file with `.test.ts` or `.test.tsx` extension
- Include beforeEach/afterEach setup and cleanup
- Mock all external dependencies appropriately
- Test all public methods and edge cases
- Include error handling tests
- Add integration tests where applicable
- Use descriptive test names with "should..." pattern
- Group related tests with describe blocks
- Aim for 90%+ code coverage
- Include JSDoc comments explaining complex test scenarios

Test Categories:

- Happy path scenarios
- Error conditions and edge cases
- Input validation
- State management
- Event handling
- Async operations
- Mock verification
- Performance considerations

Mock Strategy:

- Use vi.mock() for external modules
- Create reusable mock instances
- Mock only what's necessary
- Verify mock calls and arguments
- Reset mocks between tests

Follow project conventions:

- Use existing test utilities and setup files
- Match the project's assertion style
- Include proper TypeScript types for test data
- Use project-specific test helpers
