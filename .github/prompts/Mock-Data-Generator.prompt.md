---
mode: "agent"
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'sequentialthinking', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Generate mock data and fixtures for testing"
---

Create realistic test fixtures and mock data for: ${input:dataType}

Requirements:

- Generate TypeScript-typed mock data
- Create factories for different data scenarios
- Include edge cases and boundary conditions
- Support both valid and invalid data sets
- Create reusable data generators
- Include realistic timestamps and IDs
- Support different data volumes (small, medium, large)
- Include internationalization test data

Data Categories:

- Site monitoring data (uptime, response times, history)
- User interface states and configurations
- Network monitoring results and errors
- Database entities and relationships
- API request/response payloads
- Configuration files and settings
- Error scenarios and edge cases

Mock Data Features:

- Realistic domain names and URLs
- Varied response times and status codes
- Historical data with trends
- Different monitor types (HTTP, port, etc.)
- Geographically distributed data
- Time zone variations
- Error conditions and recovery scenarios

Factory Functions:

- createMockSite(overrides?: Partial<Site>)
- createMockMonitor(type: MonitorType, overrides?)
- createMockHistory(count: number, trend?: 'up' | 'down' | 'mixed')
- createMockSettings(environment?: 'dev' | 'prod')
- createMockError(type: ErrorType, details?)

Data Validation:

- Ensure data follows project schemas
- Include proper TypeScript types
- Validate against real API contracts
- Test data serialization/deserialization
- Include proper error object structures

File Organization:

- Group by domain/feature area
- Create index files for easy imports
- Include data seeding utilities
- Support different test environments
- Include documentation and examples

Integration:

- Compatible with Vitest testing framework
- Work with MSW for API mocking
- Support database seeding
- Include Electron IPC mock data
- Support component prop mocking

Performance:

- Lazy loading for large datasets
- Memory-efficient data generation
- Support streaming for large volumes
- Include cleanup utilities
- Optimize for test execution speed
