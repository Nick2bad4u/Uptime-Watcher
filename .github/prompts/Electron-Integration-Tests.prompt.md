---
mode: "agent"
tools: ['Best Tools']
description: "Generate integration tests for Electron main process"
---

Create integration tests for Electron service: ${input:serviceName}

Requirements:

- Test Electron main process functionality
- Mock IPC communication between main and renderer
- Use Vitest with Electron testing utilities
- Test database interactions and data persistence
- Include async operation testing
- Mock external APIs and network requests
- Test error handling and recovery
- Verify event emission and listening
- Test service lifecycle (startup/shutdown)
- Include performance and memory leak tests

Focus Areas:

- Service initialization and configuration
- Database operations (CRUD, transactions)
- IPC message handling and responses
- File system operations
- Network monitoring functionality
- Error handling and logging
- Resource cleanup and disposal
- Cross-platform compatibility

Mock Requirements:

- Mock Electron BrowserWindow and app modules
- Mock database connections and queries
- Mock network requests and responses
- Mock file system operations
- Create realistic test data fixtures

Test Structure:

- Group tests by service functionality
- Use descriptive test suite names
- Include setup/teardown for each test group
- Test both success and failure scenarios
- Verify side effects and state changes
- Include timeout handling for async operations

Follow project patterns from existing Electron tests in electron/test/ directory
