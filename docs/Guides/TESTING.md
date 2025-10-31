# Testing and Coverage Setup

This project uses Vitest for testing with separate configurations for frontend (React), backend (Electron), and shared utilities, integrated with comprehensive mocking strategies and coverage reporting.

## Setup Summary

### Triple Test Configuration

The project has three separate Vitest configurations:

1. __Frontend Tests__ (`vitest.config.ts`):
   * Tests React components in `src/` directory
   * Merges configuration from `vite.config.ts`
   * Uses jsdom environment with React Testing Library
   * Comprehensive ElectronAPI mocking
   * Coverage reports to `./coverage/`

2. __Backend Tests__ (`vitest.electron.config.ts`):
   * Tests Electron main process code in `electron/` directory
   * Uses Node.js environment
   * Database and service layer testing
   * Coverage reports to `./coverage/electron/`

3. __Shared Tests__ (`vitest.shared.config.ts`):
   * Tests shared utilities in `shared/` directory
   * Cross-platform utility testing
   * Type validation and error handling
   * Coverage reports to `./coverage/shared/`

### Files Created/Modified

1. __`vitest.config.ts`__ - Frontend test configuration with React Testing Library setup
2. __`vitest.electron.config.ts`__ - Electron backend test configuration
3. __`vitest.shared.config.ts`__ - Shared utilities test configuration
4. __`src/test/setup.ts`__ - Test setup with comprehensive ElectronAPI mocking
5. __`electron/test/setup.ts`__ - Backend test setup with database mocking
6. __`shared/test/setup.ts`__ - Shared utilities test setup
7. __Test files__:
   * Component tests in `src/components/`
   * Store tests in `src/stores/`
   * Service tests in `electron/services/`
   * Utility tests in `shared/utils/`

### Coverage Configuration

* __Provider__: V8 (fast and accurate)
* __Reporters__: text, json, lcov, html
* __Environments__:
  * jsdom (for React component testing with full DOM simulation)
  * node (for Electron backend and shared utilities)
* __Coverage Flags__:
  * `frontend` - React/src code coverage
  * `electron` - Electron/backend code coverage
  * `shared` - Shared utilities coverage
* __Excludes__: Build artifacts, configuration files, test files

### Commands

```bash
# Run all tests (frontend + electron + shared)
npm run test:all

# Run frontend tests only
npm run test:frontend

# Run frontend tests with coverage
npm run test:coverage

# Run electron tests only
npm run test:electron

# Run electron tests with coverage
npm run test:electron:coverage

# Run shared utility tests only
npm run test:shared

# Run shared tests with coverage
npm run test:shared:coverage

# Run all test suites with coverage (recommended for Codecov)
npm run test:all:coverage

# Interactive testing
npm run test:ui              # Frontend tests UI
npm run test:electron:ui     # Electron tests UI
npm run test:shared:ui       # Shared tests UI
npm run test:watch           # Frontend tests in watch mode
npm run test:electron:watch  # Electron tests in watch mode
npm run test:shared:watch    # Shared tests in watch mode
```

Notes:

* `npm run test` executes all three test configurations: shared, electron, and frontend tests sequentially.

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
import { SiteService } from "src/services/SiteService";

describe("SiteCard", () => {
  it("should handle site deletion", async () => {
    const removeSpy = vi
      .spyOn(SiteService, "removeSite")
      .mockResolvedValue(true);

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
import { SiteService } from "src/services/SiteService";

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

__Frontend Coverage__ (`./coverage/`):

* `lcov.info` - For Codecov integration (frontend flag)
* `coverage-final.json` - JSON coverage data
* `index.html` - HTML coverage report

__Electron Coverage__ (`./coverage/electron/`):

* `lcov.info` - For Codecov integration (electron flag)
* `coverage-final.json` - JSON coverage data
* `index.html` - HTML coverage report

__Shared Coverage__ (`./coverage/shared/`):

* `lcov.info` - For coverage integration (shared flag)
* `coverage-final.json` - JSON coverage data
* `index.html` - HTML coverage report

### Integration with CI/CD

The project uses Codecov flags to separate coverage across domains:

* __frontend__ flag: Covers `src/` directory (React components, stores, services)
* __electron__ flag: Covers `electron/` directory (main process, services, IPC)
* __shared__ flag: Covers `shared/` directory (utilities, types, validation)

All reports are automatically merged to provide complete application coverage.

### GitHub Actions

The workflow runs on:

* Push to main/master branches
* Pull requests to main/master branches

The workflow:

1. Installs dependencies
2. Runs tests with coverage
3. Uploads coverage to Codecov

### Current Testing Approach

The test suite implements modern testing patterns:

__Frontend Testing__:

* __Component Tests__: React Testing Library with comprehensive ElectronAPI mocking
* __Store Tests__: Zustand store testing with action verification
* __Service Tests__: EventsService and utility function testing
* __Type Safety Tests__: TypeScript interface and type guard validation

__Backend Testing__:

* __Service Layer Tests__: Database services, IPC handlers, business logic
* __Repository Tests__: Database operations with transaction safety
* __Event System Tests__: TypedEventBus with middleware testing
* __Integration Tests__: Service interactions and data flow

__Shared Testing__:

* __Utility Functions__: Cross-platform utility testing
* __Type Validation__: Zod schema and type guard testing
* __Error Handling__: Shared error utilities and patterns
* __Cross-Platform Logic__: Platform-agnostic functionality

### Coverage Achievements

__Frontend Coverage__ (`src/` directory):

* __React Components__: High coverage with user interaction testing
* __Store Management__: Complete Zustand store action and state testing
* __Service Layer__: EventsService and utility functions fully tested
* __Type Guards__: All validation functions tested with edge cases
* __Error Handling__: Comprehensive error boundary and handling tests
* __Overall Frontend__: \~95%+ coverage

__Backend Coverage__ (`electron/` directory):

* __Service Layer__: Database services and IPC handlers fully tested
* __Repository Pattern__: All database operations tested with mocking
* __Event System__: TypedEventBus and middleware comprehensively tested
* __Manager Classes__: Business logic and orchestration tested
* __Overall Backend__: \~90%+ coverage

__Shared Coverage__ (`shared/` directory):

* __Utility Functions__: All cross-platform utilities tested
* __Type Validation__: Zod schemas and type guards fully tested
* __Error Handling__: Shared error utilities completely covered
* __Type Definitions__: Interface and type consistency verified
* __Overall Shared__: \~95%+ coverage

__Current Test Structure__:

__Frontend Tests__ (`src/`):

* `src/components/**/*.test.tsx` - React component tests
* `src/stores/**/*.test.ts` - Zustand store tests
* `src/services/**/*.test.ts` - Service layer tests
* `src/utils/**/*.test.ts` - Utility function tests

__Backend Tests__ (`electron/`):

* `electron/services/**/*.test.ts` - Service layer tests
* `electron/repositories/**/*.test.ts` - Database tests
* `electron/events/**/*.test.ts` - Event system tests
* `electron/managers/**/*.test.ts` - Business logic tests

__Shared Tests__ (`shared/`):

* `shared/utils/**/*.test.ts` - Cross-platform utilities
* `shared/types/**/*.test.ts` - Type validation tests
* `shared/validation/**/*.test.ts` - Schema validation tests

### Coverage Quality

The test suite includes:

* __Unit tests__: Individual function and component testing
* __Integration tests__: Store interactions and event flows
* __Type safety tests__: Ensuring TypeScript interfaces work correctly
* __Edge case testing__: Boundary conditions and error scenarios
* __React component testing__: Component rendering and interactions

### Testing Best Practices Implemented

1. __Comprehensive ElectronAPI Mocking__: Full simulation of IPC communication for frontend tests
2. __Modular Store Testing__: Zustand stores tested for both state changes and action execution
3. __Event System Testing__: TypedEventBus, middleware, and IPC events thoroughly tested
4. __Repository Pattern Testing__: Database operations tested with proper transaction mocking
5. __Component Testing__: React components tested with React Testing Library and user interactions
6. __Cross-Domain Testing__: Shared utilities tested across frontend, backend, and shared domains
7. __Type Safety Testing__: TypeScript interfaces, type guards, and Zod schemas validated
8. __Error Scenario Testing__: Comprehensive error handling and edge case coverage

### Next Steps for Maintaining Coverage

To maintain high coverage:

1. __Test-Driven Development__: Write tests before implementing new features
2. __Component Testing__: Add comprehensive tests for new React components
3. __API Integration Testing__: Test new IPC handlers and service integrations
4. __Event Testing__: Test new event types and event-driven flows
5. __Error Boundary Testing__: Test error handling and recovery scenarios
6. __Performance Testing__: Add benchmarks for critical operations

Place test files next to the code they test with `.test.ts` or `.test.tsx` extensions. The current test structure follows co-location patterns for easy maintenance.

### Related Documentation

* [Testing Methodology - React Components](./testing-methodology-react-components.md) - Detailed React testing patterns
* [Error Handling Guide](./error-handling-guide.md) - Error handling patterns and testing
* [Event System Guide](./event-system-guide.md) - Event testing and debugging
