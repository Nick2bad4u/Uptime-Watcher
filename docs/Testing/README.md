---
ai_note: Updated by AI on 2025-11-15 to add metadata.
summary: >-
  Index of testing documentation, guides, and best practices for the Uptime
  Watcher application.
creation_date: unknown
last_modified_date: '2025-11-15'
author: Nick2bad4u
title: Testing documentation
description: >-
  Top-level overview of the testing documentation, including unit, integration,
  E2E, and fuzzing strategies used in the Uptime-Watcher project.
keywords:
  - uptime-watcher
  - testing
  - vitest
  - playwright
misc:
  doc_category: Testing
  source: Uptime-Watcher docs
---

# Testing documentation

This directory contains comprehensive testing guides, best practices, and methodology documentation for the Uptime Watcher application.

## 📁 Directory structure

```text
docs/Testing/
├── README.md                              # This file
├── CODEGEN-BEST-PRACTICES.md             # Code generation best practices
├── CODEGEN_TEMPLATE_USAGE.md             # Template usage for test generation
├── FAST_CHECK_FUZZING_GUIDE.md          # Property-based testing with fast-check
├── HEADLESS_TESTING.md                   # Headless test execution strategies
├── PLAYWRIGHT_CODEGEN_GUIDE.md          # Playwright test generation workflows
├── PLAYWRIGHT_TESTING_GUIDE.md          # Comprehensive Playwright testing guide
├── ZERO_COVERAGE_AUDIT.md               # Workflow for spotting orphaned tests
└── TEST_VERBOSITY_GUIDE.md               # Test output configuration and debugging
```

## 🧪 Testing framework overview

The Uptime Watcher application uses a comprehensive testing strategy with multiple frameworks:

- **Vitest** - Unit and integration testing
- **Playwright** - End-to-end and Electron testing
- **Fast-check** - Property-based testing and fuzzing
- **Coverage analysis** - Comprehensive code coverage tracking

### Test pipeline overview

```mermaid
flowchart LR
    classDef stage fill:#dbeafe,stroke:#1d4ed8,stroke-width:2px,color:#1e3a8a;
    classDef quality fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;
    classDef report fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#4c1d95;

    Trigger(["Push / PR / Nightly"]):::stage
    Precommit(["Static checks\n(lint + type)"]):::quality
    Unit(["Vitest unit suites"]):::quality
    Electron(["Electron integration suites"]):::quality
    Playwright(["Playwright e2e flows"]):::quality
    Fuzz(["fast-check fuzzers"]):::quality
    Coverage(["Coverage aggregation"]):::report
    Artifacts(["Artifacts & dashboards"]):::report

    Trigger --> Precommit --> Unit --> Electron --> Playwright --> Coverage
    Unit --> Fuzz --> Coverage
    Coverage --> Artifacts
```

## 🚀 Quick start testing

For new developers getting started with testing:

1. **[Playwright testing guide](./PLAYWRIGHT_TESTING_GUIDE.md)** - Complete E2E testing setup
2. **[Headless testing](./HEADLESS_TESTING.md)** - Running tests without UI
3. **[Test verbosity guide](./TEST_VERBOSITY_GUIDE.md)** - Configuring test output

## 📖 Testing guides

### Playwright testing

Guide                                                     | Description                              | Use case
--------------------------------------------------------- | ---------------------------------------- | ---------------------------
[Playwright testing guide](./PLAYWRIGHT_TESTING_GUIDE.md) | Comprehensive Playwright setup and usage | E2E and Electron testing
[Playwright codegen guide](./PLAYWRIGHT_CODEGEN_GUIDE.md) | Test generation workflows and automation | Creating new test cases
[Headless testing](./HEADLESS_TESTING.md)                 | Running tests without UI in CI/CD        | Automated testing pipelines

### Code generation and templates

Guide                                                 | Description                                   | Use case
----------------------------------------------------- | --------------------------------------------- | ----------------------------
[Codegen best practices](./CODEGEN_BEST_PRACTICES.md) | Guidelines for effective code generation      | Test maintenance and quality
[Template usage](./CODEGEN_TEMPLATE_USAGE.md)         | Using templates for consistent test structure | Standardizing test patterns

### Advanced testing techniques

Guide                                                        | Description                                   | Use case
------------------------------------------------------------ | --------------------------------------------- | ----------------------------------
[Fast-check fuzzing coverage](./FAST_CHECK_FUZZING_GUIDE.md) | Property-based testing and fuzzing strategies | Finding edge cases and bugs
[Zero coverage audit](./ZERO_COVERAGE_AUDIT.md)              | Isolate tests that no longer execute code     | Pruning stale specs safely
[Test verbosity guide](./TEST_VERBOSITY_GUIDE.md)            | Configuring test output and debugging         | Test debugging and CI optimization

## 🏃‍♂️ Running tests

### Available test commands

```bash
# Renderer/React tests (alias)
npm run test            # Renderer tests via vitest.config.ts
npm run test:frontend   # Explicit renderer alias

# Run Electron-specific tests
npm run test:electron

# Shared module tests
npm run test:shared

# Run tests with coverage
npm run test:coverage
npm run test:electron:coverage
npm run test:shared:coverage

# Playwright / E2E suites
npm run test:playwright
npm run test:e2e
npm run test:playwright:coverage

# Run performance benchmarks
npm run bench
```

### Testing different components

- **Frontend tests** - React component testing with Vitest
- **Electron tests** - Main process and IPC testing
- **Shared module tests** - Utility and service testing
- **E2E tests** - Full application workflow testing with Playwright

## 🔧 Test configuration

Test configuration files are located in the project root:

- `vitest.config.ts` - Main Vitest configuration
- `vitest.electron.config.ts` - Electron-specific test configuration
- `vitest.shared.config.ts` - Shared module test configuration
- `playwright.config.ts` - Playwright E2E test configuration

## 🎯 Testing best practices

### Unit testing

- Test individual functions and components in isolation
- Use mocking for external dependencies
- Aim for high code coverage on critical paths
- Follow AAA pattern (Arrange, Act, Assert)

### Integration testing

- Test component interactions and data flows
- Verify IPC communication between processes
- Test database operations and state management
- Use real services where possible, mock external APIs

### End-to-end testing

- Test complete user workflows
- Verify UI behavior and user interactions
- Test across different operating systems
- Use Playwright for cross-browser compatibility

### Property-based testing

- Use fast-check for testing invariants
- Generate random inputs to find edge cases
- Focus on critical algorithms and data processing
- Supplement unit tests with property-based tests

## 🗂️ Navigation

- **[Main documentation](../../README.md)** - Project overview and setup
- **[Architecture documentation](../Architecture/README.md)** - System design and patterns
- **[Guides documentation](../Guides/README.md)** - Development guides and tutorials
- **[TSDoc documentation](../TSDoc/README.md)** - Code documentation standards

## 📝 Contributing to testing

When adding new tests or testing documentation:

1. Follow the [documentation style guide](../Guides/DOCUMENTATION_STYLE_GUIDE.md)
2. Update this README to include new testing guides
3. Ensure tests follow established patterns and conventions
4. Add appropriate coverage for new features
5. Update test documentation for any new testing approaches
