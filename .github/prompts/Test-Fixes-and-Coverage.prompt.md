---
mode: "agent"
tools: ['All Tools']
description: "Fix failing tests and improve test coverage"
---

Fix failing tests and improve coverage for: ${input:testFile}

Current Issues to Address:

- Failing test cases and error messages
- Low test coverage areas
- Flaky or unreliable tests
- Missing edge case coverage
- Outdated mocks and fixtures
- Performance issues in test execution

Analysis Required:

- Review test failure logs and error messages
- Identify missing test scenarios
- Check mock accuracy against real implementations
- Analyze code coverage reports
- Review test execution timing
- Identify brittle test patterns

Fixes to Implement:

- Update failing assertions and expectations
- Fix mock configurations and return values
- Add missing test cases for uncovered code paths
- Improve async operation handling
- Fix timing issues and race conditions
- Update test data to match current schemas
- Improve error handling test coverage

Coverage Improvements:

- Add tests for error conditions
- Test edge cases and boundary values
- Include integration test scenarios
- Test user interaction flows
- Add accessibility testing
- Include performance regression tests
- Test cross-browser compatibility

Mock Improvements:

- Ensure mocks match real API responses
- Add realistic error scenarios
- Include proper async behavior simulation
- Mock external dependencies accurately
- Create reusable mock factories
- Add proper cleanup procedures

Test Quality:

- Make tests deterministic and reliable
- Improve test isolation
- Add proper setup and teardown
- Use meaningful test descriptions
- Group related tests logically
- Add documentation for complex test scenarios

Performance Optimization:

- Reduce test execution time
- Optimize mock creation
- Minimize test data setup
- Improve parallel test execution
- Reduce memory usage in tests

Debugging Support:

- Add detailed error messages
- Include test debugging utilities
- Improve test failure reporting
- Add logging for complex scenarios
- Include test data validation
