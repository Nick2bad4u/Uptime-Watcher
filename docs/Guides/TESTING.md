---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Testing and Coverage Setup"
summary: "Overview of Uptime Watcher's testing configurations, coverage setup, and testing commands across frontend, backend, shared, and Storybook projects."
created: "2025-06-30"
last_reviewed: "2025-12-04"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "testing"
  - "vitest"
  - "coverage"
  - "ci"
---

# Testing and Coverage Setup

## Table of Contents

1. [Setup Summary](#setup-summary)

## Setup Summary

### Triple Test Configuration

The project has three separate Vitest configurations:

1. **Frontend Tests** (`vitest.config.ts`):

- Tests React components in `src/` directory
- Merges configuration from `vite.config.ts`
- Uses jsdom environment with React Testing Library
- Comprehensive ElectronAPI mocking
- Coverage reports to `./coverage/`

2. **Backend Tests** (`vitest.electron.config.ts`):

- Tests Electron main process code in `electron/` directory
- Uses Node.js environment
- Database and service layer testing
- Coverage reports to `./coverage/electron/`

3. **Shared Tests** (`vitest.shared.config.ts`):

- Tests shared utilities in `shared/` directory
- Cross-platform utility testing
- Type validation and error handling
- Coverage reports to `./coverage/shared/`

### Files Created/Modified

1. **`vitest.config.ts`** - Frontend test configuration with React Testing Library setup
2. **`vitest.electron.config.ts`** - Electron backend test configuration
3. **`vitest.shared.config.ts`** - Shared utilities test configuration
4. **`src/test/setup.ts`** - Test setup with comprehensive ElectronAPI mocking
5. **`electron/test/setup.ts`** - Backend test setup with database mocking
6. **`shared/test/setup.ts`** - Shared utilities test setup
7. **Test files**:

- Component tests in `src/components/`
- Store tests in `src/stores/`
- Service tests in `electron/services/`
- Utility tests in `shared/utils/`

### Coverage Configuration

- **Provider**: V8 (fast and accurate)

- **Reporters**: text, json, lcov, html

- **Environments**:

  - jsdom (for React component testing with full DOM simulation)
  - node (for Electron backend and shared utilities)

- **Coverage Flags**:

  - `frontend` - React/src code coverage
  - `electron` - Electron/backend code coverage
  - `shared` - Shared utilities coverage

- **Excludes**: Build artifacts, configuration files, test files

### Commands

```bash
# Aggregate suites (frontend, electron, shared, Storybook)
npm run test:all

# Frontend tests (renderer)
npm run test               # Frontend tests via vitest.config.ts
npm run test:frontend      # Explicit alias for renderer suite
npm run test:coverage      # Renderer coverage (vitest.config.ts)

# Electron (main process) tests
npm run test:electron
npm run test:electron:coverage

# Shared module tests
npm run test:shared
npm run test:shared:coverage

# Storybook component tests
npm run test:storybook
npm run test:storybook:coverage
npm run test:storybook:runner
npm run test:storybook:runner:coverage

# Playwright / E2E tests
npm run test:playwright
npm run test:e2e
npm run test:playwright:coverage

# Aggregate coverage (recommended for Codecov)
npm run test:all:coverage

# Interactive UIs (where available)
npm run test:electron:ui    # Electron tests UI
npm run test:shared:ui      # Shared tests UI
```

Notes:

- `npm run test` runs the frontend Vitest configuration (renderer) only.
- `npm run test:all` orchestrates the full test matrix across frontend, electron, shared, and Storybook.

### ElectronAPI Mocking Strategy

The frontend tests use comprehensive ElectronAPI mocking to simulate IPC communication:

```typescript
// src/test/setup.ts
const mockElectronAPI = {
 sites: {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(),
 },
 monitors: {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(),
 },
 events: {
  onSiteUpdated: vi.fn(),
  onMonitorStatus: vi.fn(),
  onCacheInvalidated: vi.fn(),
  onStateSync: vi.fn(),
 },
 system: {
  getVersion: vi.fn(),
  getPlatform: vi.fn(),
 },
};

vi.stubGlobal("window", {
 electronAPI: mockElectronAPI,
});
```

### Testing Patterns

#### Component Testing with Mocked APIs

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { SiteCard } from "../SiteCard";
import { SiteService } from "@app/services/SiteService";

describe("SiteCard", () => {
 it("should handle site deletion", async () => {
  const removeSpy = vi.spyOn(SiteService, "removeSite").mockResolvedValue(true);

  render(<SiteCard site={mockSite} />);

  const deleteButton = screen.getByRole("button", { name: /delete/i });
  fireEvent.click(deleteButton);

  await waitFor(() => {
   expect(removeSpy).toHaveBeenCalledWith(mockSite.id);
  });
 });
});
```

#### Store Testing

```typescript
import { act, renderHook } from "@testing-library/react";
import { useSitesStore } from "../useSitesStore";
import { SiteService } from "@app/services/SiteService";

describe("useSitesStore", () => {
 beforeEach(() => {
  useSitesStore.getState().reset();
 });

 it("should add site via service", async () => {
  const mockSite = { id: "1", name: "Test Site", url: "https://test.com" };
  vi.spyOn(SiteService, "addSite").mockResolvedValue(mockSite);

  const { result } = renderHook(() => useSitesStore());

  await act(async () => {
   await result.current.addSite({ name: "Test Site", url: "https://test.com" });
  });

  expect(result.current.sites).toContain(mockSite);
 });
});
```

#### Event System Testing

```typescript
import { EventsService } from "../EventsService";

describe("EventsService", () => {
 it("should register event listeners", async () => {
  const callback = vi.fn();
  const cleanup = vi.fn();
  window.electronAPI.events.onSiteUpdated.mockReturnValue(cleanup);

  const result = await EventsService.onSiteUpdated(callback);

  expect(window.electronAPI.events.onSiteUpdated).toHaveBeenCalledWith(
   callback
  );
  expect(result).toBe(cleanup);
 });
});
```

### Coverage Reports

Coverage reports are generated in separate directories:

**Frontend Coverage** (`./coverage/`):

- `lcov.info` - For Codecov integration (frontend flag)
- `coverage-final.json` - JSON coverage data
- `index.html` - HTML coverage report

**Electron Coverage** (`./coverage/electron/`):

- `lcov.info` - For Codecov integration (electron flag)
- `coverage-final.json` - JSON coverage data
- `index.html` - HTML coverage report

**Shared Coverage** (`./coverage/shared/`):

- `lcov.info` - For coverage integration (shared flag)
- `coverage-final.json` - JSON coverage data
- `index.html` - HTML coverage report

### Integration with CI/CD

The project uses Codecov flags to separate coverage across domains:

- **frontend** flag: Covers `src/` directory (React components, stores, services)
- **electron** flag: Covers `electron/` directory (main process, services, IPC)
- **shared** flag: Covers `shared/` directory (utilities, types, validation)

All reports are automatically merged to provide complete application coverage.

### GitHub Actions

The workflow runs on:

- Push to main/master branches
- Pull requests to main/master branches

The workflow:

1. Installs dependencies
2. Runs tests with coverage
3. Uploads coverage to Codecov

### Current Testing Approach

The test suite implements modern testing patterns:

**Frontend Testing**:

- **Component Tests**: React Testing Library with comprehensive ElectronAPI mocking
- **Store Tests**: Zustand store testing with action verification
- **Service Tests**: EventsService and utility function testing
- **Type Safety Tests**: TypeScript interface and type guard validation

**Backend Testing**:

- **Service Layer Tests**: Database services, IPC handlers, business logic
- **Repository Tests**: Database operations with transaction safety
- **Event System Tests**: TypedEventBus with middleware testing
- **Integration Tests**: Service interactions and data flow

**Shared Testing**:

- **Utility Functions**: Cross-platform utility testing
- **Type Validation**: Zod schema and type guard testing
- **Error Handling**: Shared error utilities and patterns
- **Cross-Platform Logic**: Platform-agnostic functionality

### Coverage Achievements

**Frontend Coverage** (`src/` directory):

- **React Components**: High coverage with user interaction testing
- **Store Management**: Complete Zustand store action and state testing
- **Service Layer**: EventsService and utility functions fully tested
- **Type Guards**: All validation functions tested with edge cases
- **Error Handling**: Comprehensive error boundary and handling tests
- **Overall Frontend**: \~95%+ coverage

**Backend Coverage** (`electron/` directory):

- **Service Layer**: Database services and IPC handlers fully tested
- **Repository Pattern**: All database operations tested with mocking
- **Event System**: TypedEventBus and middleware comprehensively tested
- **Manager Classes**: Business logic and orchestration tested
- **Overall Backend**: \~90%+ coverage

**Shared Coverage** (`shared/` directory):

- **Utility Functions**: All cross-platform utilities tested
- **Type Validation**: Zod schemas and type guards fully tested
- **Error Handling**: Shared error utilities covered by automated tests
- **Type Definitions**: Interface and type consistency verified
- **Overall Shared**: \~95%+ coverage

**Current Test Structure**:

**Frontend Tests** (`src/`):

- `src/components/**/*.test.tsx` - React component tests
- `src/stores/**/*.test.ts` - Zustand store tests
- `src/services/**/*.test.ts` - Service layer tests
- `src/utils/**/*.test.ts` - Utility function tests

**Backend Tests** (`electron/`):

- `electron/services/**/*.test.ts` - Service layer tests
- `electron/repositories/**/*.test.ts` - Database tests
- `electron/events/**/*.test.ts` - Event system tests
- `electron/managers/**/*.test.ts` - Business logic tests

**Shared Tests** (`shared/`):

- `shared/utils/**/*.test.ts` - Cross-platform utilities
- `shared/types/**/*.test.ts` - Type validation tests
- `shared/validation/**/*.test.ts` - Schema validation tests

### Coverage Quality

The test suite includes:

- **Unit tests**: Individual function and component testing
- **Integration tests**: Store interactions and event flows
- **Type safety tests**: Ensuring TypeScript interfaces work correctly
- **Edge case testing**: Boundary conditions and error scenarios
- **React component testing**: Component rendering and interactions

### Testing Best Practices Implemented

1. **Comprehensive ElectronAPI Mocking**: Full simulation of IPC communication for frontend tests
2. **Modular Store Testing**: Zustand stores tested for both state changes and action execution
3. **Event System Testing**: TypedEventBus, middleware, and IPC events thoroughly tested
4. **Repository Pattern Testing**: Database operations tested with proper transaction mocking
5. **Component Testing**: React components tested with React Testing Library and user interactions
6. **Cross-Domain Testing**: Shared utilities tested across frontend, backend, and shared domains
7. **Type Safety Testing**: TypeScript interfaces, type guards, and Zod schemas validated
8. **Error Scenario Testing**: Comprehensive error handling and edge case coverage

### Next Steps for Maintaining Coverage

To maintain high coverage:

1. **Test-Driven Development**: Write tests before implementing new features
2. **Component Testing**: Add comprehensive tests for new React components
3. **API Integration Testing**: Test new IPC handlers and service integrations
4. **Event Testing**: Test new event types and event-driven flows
5. **Error Boundary Testing**: Test error handling and recovery scenarios
6. **Performance Testing**: Add benchmarks for critical operations

Place test files next to the code they test with `.test.ts` or `.test.tsx` extensions. The current test structure follows co-location patterns for easy maintenance.

### Related Documentation

- [Testing Methodology - React Components](./TESTING_METHODOLOGY_REACT_COMPONENTS.md) - Detailed React testing patterns
- [Error Handling Guide](./ERROR_HANDLING_GUIDE.md) - Error handling patterns and testing
- [Event System Guide](./EVENT_SYSTEM_GUIDE.md) - Event testing and debugging
