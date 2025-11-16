---

schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "React Component Testing Methodology"
summary: "Testing methodology and patterns for React components in Uptime Watcher using Vitest and React Testing Library."
created: "2025-09-22"
last\_reviewed: "2025-11-15"
category: "guide"
author: "Nick2bad4u"
tags:

- "uptime-watcher"
- "react"
- "testing"
- "vitest"
- "rtl"

---

# React Component Testing Methodology

## Overview

Comprehensive testing approach for React components in the Uptime Watcher application using **Vitest**, **React Testing Library**, and current implementation patterns. This guide reflects actual testing practices and patterns used throughout the codebase.

## Current Testing Architecture

- **Testing Framework**: Vitest for unit and integration testing
- **Component Testing**: React Testing Library with @testing-library/react
- **Mocking Strategy**: Comprehensive ElectronAPI and store mocking
- **Pattern**: Component interaction testing with proper event simulation
- **Target**: High coverage through realistic user interaction scenarios

## Validated Testing Patterns

### 1. Current ElectronAPI Mocking Pattern

```typescript
// Current standard ElectronAPI mock used across the codebase
const mockElectronAPI = {
 sites: {
  addSite: vi.fn().mockResolvedValue({ id: "test-1", name: "Test Site" }),
  deleteSite: vi.fn().mockResolvedValue(true),
  getSites: vi.fn().mockResolvedValue([]),
  updateSite: vi.fn().mockResolvedValue(true),
 },
 events: {
  onMonitorStatusChanged: vi.fn(() => () => {}),
  onMonitorUp: vi.fn(() => () => {}),
  onMonitorDown: vi.fn(() => () => {}),
  onCacheInvalidated: vi.fn(() => () => {}),
 },
 system: {
  openExternal: vi.fn(),
  showInFolder: vi.fn(),
 },
};

// Global mock setup
Object.defineProperty(window, "electronAPI", {
 value: mockElectronAPI,
 writable: true,
});
```

### 2. Store Testing with Zustand

```typescript
// Store testing pattern for current Zustand architecture
import { act, renderHook } from "@testing-library/react";
import { useSitesStore } from "../stores/sites/useSitesStore";

describe("useSitesStore", () => {
 beforeEach(() => {
  // Reset store state before each test
  act(() => {
   useSitesStore.getState().setSites([]);
  });
 });

 it("handles modular composition correctly", async () => {
  const { result } = renderHook(() => useSitesStore());

  const mockSite = { id: "test-1", name: "Test Site", monitors: [] };

  await act(async () => {
   await result.current.createSite(mockSite);
  });

  expect(result.current.sites).toContain(mockSite);
 });

 it("handles error states properly", async () => {
  const { result } = renderHook(() => useSitesStore());

  // Mock API to throw error
  mockElectronAPI.sites.addSite.mockRejectedValueOnce(new Error("Test error"));

  await act(async () => {
   try {
    await result.current.createSite(mockSite);
   } catch (error) {
    // Error should be handled by store
   }
  });

  expect(result.current.sites).toHaveLength(0);
 });
});
```

### 3. Component Integration Testing

```typescript
// Testing components with store integration
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../theme/components/ThemeProvider";
import { MyComponent } from "./MyComponent";

const renderWithProviders = (component: React.ReactElement) => {
 return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe("MyComponent Integration", () => {
 beforeEach(() => {
  vi.clearAllMocks();
 });

 it("handles user interactions correctly", async () => {
  renderWithProviders(<MyComponent siteName="test-site" />);

  const actionButton = screen.getByTestId("action-button-test-site");
  fireEvent.click(actionButton);

  await waitFor(() => {
   expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
    expect.objectContaining({ name: "test-site" })
   );
  });
 });

 it("prevents event propagation correctly", () => {
  const mockParentClick = vi.fn();

  render(
   <div onClick={mockParentClick} data-testid="parent">
    <MyComponent siteName="test-site" />
   </div>
  );

  fireEvent.click(screen.getByTestId("action-button-test-site"));

  expect(mockParentClick).not.toHaveBeenCalled();
 });
});
```

### 4. Event System Testing

```typescript
// Testing EventsService integration
import { EventsService } from "../services/EventsService";

vi.mock("../services/EventsService", () => ({
 EventsService: {
  onMonitorStatusChanged: vi.fn(() => vi.fn()), // Returns cleanup function
  onMonitorUp: vi.fn(() => vi.fn()),
  onMonitorDown: vi.fn(() => vi.fn()),
  onCacheInvalidated: vi.fn(() => vi.fn()),
 },
}));

describe("Event Integration", () => {
 it("sets up event listeners correctly", async () => {
  const { result } = renderHook(() => useMonitorEventIntegration());

  await waitFor(() => {
   expect(EventsService.onMonitorStatusChanged).toHaveBeenCalled();
   expect(EventsService.onMonitorUp).toHaveBeenCalled();
   expect(EventsService.onMonitorDown).toHaveBeenCalled();
  });
 });

 it("cleans up event listeners on unmount", () => {
  const mockCleanup = vi.fn();
  vi.mocked(EventsService.onMonitorStatusChanged).mockReturnValue(mockCleanup);

  const { unmount } = renderHook(() => useMonitorEventIntegration());
  unmount();

  expect(mockCleanup).toHaveBeenCalled();
 });
});
```

### 5. Form Validation Testing

```typescript
// Testing current validation patterns with Zod schemas
import { httpMonitorSchema } from "@shared/validation/schemas";

describe("Form Validation", () => {
 it("validates form data with shared schemas", async () => {
  render(<AddSiteForm isVisible={true} onClose={mockOnClose} />);

  // Fill form with invalid data
  fireEvent.change(screen.getByLabelText(/site name/i), {
   target: { value: "" }, // Empty name should fail validation
  });

  fireEvent.click(screen.getByRole("button", { name: /add site/i }));

  await waitFor(() => {
   expect(screen.getByText(/site name is required/i)).toBeInTheDocument();
  });
 });

 it("handles successful validation", async () => {
  render(<AddSiteForm isVisible={true} onClose={mockOnClose} />);

  // Fill form with valid data
  fireEvent.change(screen.getByLabelText(/site name/i), {
   target: { value: "Test Site" },
  });

  fireEvent.change(screen.getByLabelText(/url/i), {
   target: { value: "https://example.com" },
  });

  fireEvent.click(screen.getByRole("button", { name: /add site/i }));

  await waitFor(() => {
   expect(mockElectronAPI.sites.addSite).toHaveBeenCalledWith(
    expect.objectContaining({
     name: "Test Site",
     url: "https://example.com",
    })
   );
  });
 });
});
```

### 6. Modal and UI State Testing

```typescript
// Testing modal interactions and UI state
describe("Modal Interactions", () => {
 it("handles escape key modal closure", () => {
  render(<MyModal />);

  fireEvent.keyDown(document, { key: "Escape" });

  expect(mockOnClose).toHaveBeenCalled();
 });

 it("handles backdrop click closure", () => {
  render(<MyModal />);

  const backdrop = screen.getByRole("button", { name: "" }); // Backdrop with role="button"
  fireEvent.click(backdrop);

  expect(mockOnClose).toHaveBeenCalled();
 });

 it("prevents content click from closing modal", () => {
  render(<MyModal />);

  const content = screen.getByTestId("modal-content");
  fireEvent.click(content);

  expect(mockOnClose).not.toHaveBeenCalled();
 });
});
```

## Current Testing Configuration

### Vitest Setup

```typescript
// vitest.config.ts patterns
export default defineConfig({
 test: {
  environment: "jsdom",
  setupFiles: ["./src/test/setup.ts"],
  globals: true,
  coverage: {
   provider: "v8",
   reporter: [
    "text",
    "json",
    "html",
   ],
   exclude: [
    "node_modules/",
    "src/test/",
    "**/*.d.ts",
    "**/*.config.*",
   ],
  },
 },
});
```

### Test Setup File

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Global ElectronAPI mock
const mockElectronAPI = {
 sites: {
  addSite: vi.fn(),
  deleteSite: vi.fn(),
  getSites: vi.fn().mockResolvedValue([]),
  updateSite: vi.fn(),
 },
 events: {
  onMonitorStatusChanged: vi.fn(() => () => {}),
  onMonitorUp: vi.fn(() => () => {}),
  onMonitorDown: vi.fn(() => () => {}),
  onCacheInvalidated: vi.fn(() => () => {}),
 },
};

Object.defineProperty(window, "electronAPI", {
 value: mockElectronAPI,
 writable: true,
});

// Logger mock
vi.mock("../services/logger", () => ({
 logger: {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
 },
}));
```

## Test Structure Templates

### Component Test Template

```typescript
describe("ComponentName", () => {
 beforeEach(() => {
  vi.clearAllMocks();
 });

 describe("Rendering", () => {
  it("renders without errors", () => {
   render(<ComponentName siteName="test-site" />);
   expect(screen.getByTestId("component-test-site")).toBeInTheDocument();
  });

  it("renders with correct props", () => {
   render(<ComponentName siteName="test-site" variant="primary" />);
   expect(screen.getByTestId("component-test-site")).toHaveClass("primary");
  });
 });

 describe("Interactions", () => {
  it("handles click events correctly", () => {
   const mockOnAction = vi.fn();
   render(<ComponentName siteName="test-site" onAction={mockOnAction} />);

   fireEvent.click(screen.getByRole("button"));

   expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it("prevents event propagation", () => {
   const mockParentClick = vi.fn();

   render(
    <div onClick={mockParentClick}>
     <ComponentName siteName="test-site" />
    </div>
   );

   fireEvent.click(screen.getByRole("button"));

   expect(mockParentClick).not.toHaveBeenCalled();
  });
 });

 describe("Error Handling", () => {
  it("handles API errors gracefully", async () => {
   mockElectronAPI.sites.addSite.mockRejectedValueOnce(new Error("API Error"));

   render(<ComponentName siteName="test-site" />);
   fireEvent.click(screen.getByRole("button"));

   await waitFor(() => {
    expect(logger.error).toHaveBeenCalledWith(
     expect.stringContaining("API Error"),
     expect.any(Error)
    );
   });
  });
 });
});
```

### Store Test Template

```typescript
describe("useStoreHook", () => {
 beforeEach(() => {
  // Reset store state
  act(() => {
   useStoreHook.getState().resetState();
  });
 });

 describe("State Management", () => {
  it("initializes with correct default state", () => {
   const { result } = renderHook(() => useStoreHook());

   expect(result.current.items).toEqual([]);
   expect(result.current.isLoading).toBe(false);
  });

  it("updates state correctly", () => {
   const { result } = renderHook(() => useStoreHook());

   act(() => {
    result.current.addItem({ id: "1", name: "Test Item" });
   });

   expect(result.current.items).toHaveLength(1);
   expect(result.current.items[0]).toEqual({ id: "1", name: "Test Item" });
  });
 });

 describe("Async Operations", () => {
  it("handles async operations correctly", async () => {
   const { result } = renderHook(() => useStoreHook());

   await act(async () => {
    await result.current.fetchItems();
   });

   expect(result.current.items.length).toBeGreaterThan(0);
   expect(result.current.isLoading).toBe(false);
  });

  it("handles async errors", async () => {
   mockElectronAPI.items.getItems.mockRejectedValueOnce(
    new Error("Fetch failed")
   );

   const { result } = renderHook(() => useStoreHook());

   await act(async () => {
    try {
     await result.current.fetchItems();
    } catch (error) {
     // Error should be handled by store
    }
   });

   expect(result.current.items).toEqual([]);
   expect(result.current.isLoading).toBe(false);
  });
 });
});
```

## Testing Best Practices

### 1. Mock Strategy

- **ElectronAPI**: Always mock with consistent interface
- **External Dependencies**: Mock at module level
- **Store State**: Reset between tests
- **Event Cleanup**: Verify cleanup functions are called

### 2. Async Testing

- **Use waitFor**: For DOM updates after async operations
- **Use act**: For store state changes
- **Proper Cleanup**: Clean up mocks and timeouts
- **Error Handling**: Test both success and error paths

### 3. Event Testing

- **Prevent Propagation**: Verify events don't bubble when they shouldn't
- **Keyboard Events**: Test escape keys and form submissions
- **Form Validation**: Use real validation schemas in tests
- **Event Cleanup**: Test that event listeners are properly removed

### 4. Coverage Strategy

- **Component Interactions**: Focus on user behavior rather than implementation details
- **Error Paths**: Test error handling and logging
- **Edge Cases**: Test boundary conditions and invalid inputs
- **Integration Points**: Test component-store interactions

## Common Testing Patterns

### Testing Custom Hooks

```typescript
// useMount hook testing
describe("useMount", () => {
 it("calls mount function on mount", () => {
  const mockMount = vi.fn();
  renderHook(() => useMount(mockMount));

  expect(mockMount).toHaveBeenCalledTimes(1);
 });

 it("calls cleanup function on unmount", () => {
  const mockCleanup = vi.fn();
  const mockMount = vi.fn(() => mockCleanup);

  const { unmount } = renderHook(() => useMount(mockMount));
  unmount();

  expect(mockCleanup).toHaveBeenCalledTimes(1);
 });
});
```

### Testing Error Boundaries

```typescript
// ErrorBoundary testing
describe("ErrorBoundary", () => {
 it("catches and displays errors", () => {
  const ThrowError = () => {
   throw new Error("Test error");
  };

  render(
   <ErrorBoundary>
    <ThrowError />
   </ErrorBoundary>
  );

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
 });
});
```

## Testing Tools and Commands

### Current Testing Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- path/to/test.tsx

# Run tests with coverage for specific file
npm test -- path/to/test.tsx --coverage
```

### Coverage Analysis

- **Target Coverage**: Aim for >90% coverage on critical components
- **Focus Areas**: User interactions, error handling, store integration
- **Quality Metrics**: Test reliability, maintainability, readability
- **Continuous Improvement**: Regular coverage analysis and improvement

## Success Metrics

- **Coverage Improvement**: Significant percentage point gains through realistic testing
- **Test Reliability**: 100% test pass rate with proper async handling
- **Pattern Consistency**: Reusable patterns across component tests
- **Integration Coverage**: Components work correctly with stores and events

This methodology provides a comprehensive, systematic approach for testing React components with current implementation patterns, ensuring high-quality, maintainable test suites that reflect real-world usage scenarios.
