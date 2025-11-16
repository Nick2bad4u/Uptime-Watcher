---

schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "UI Feature Development Guide"
summary: "Guidelines for adding and modifying UI features in Uptime Watcher, including stores, events, and validation."
created: "2025-08-02"
last\_reviewed: "2025-11-15"
category: "guide"
author: "Nick2bad4u"
tags:

- "uptime-watcher"
- "ui"
- "react"
- "zustand"
- "development"

---

# UI Feature Development Guide

This document provides comprehensive guidelines for adding and modifying UI features in the Uptime Watcher application, based on lessons learned from implementing the site monitoring functionality and modal improvements.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Process](#development-process)
3. [Component Creation Guidelines](#component-creation-guidelines)
4. [Component Props Standards](#component-props-standards)
5. [State Management](#state-management)
6. [Event Handling](#event-handling)
7. [Modal Development](#modal-development)
8. [Reusable Components](#reusable-components)
9. [Validation Best Practices](#validation-best-practices)
10. [Testing Strategy](#testing-strategy)
11. [Documentation Requirements](#documentation-requirements)
12. [Common Pitfalls](#common-pitfalls)

## Architecture Overview

### Core Principles

- **Domain-Specific State**: Use Zustand stores for domain-specific state management, avoid global state
- **Repository Pattern**: All database operations use repositories with transaction wrapping
- **Event-Driven Updates**: Communication between UI and backend via events and IPC
- **Service Layer**: Managers orchestrate business logic and event flows
- **Type Safety**: Strict TypeScript with proper interfaces for all IPC messages and event payloads
- **Validation Consistency**: Use centralized validation utilities across frontend and backend

### Key Layers

```text
┌─────────────────────────┐
│      React Components   │ ← UI Layer (src/components)
├─────────────────────────┤
│      Zustand Stores     │ ← State Management (src/stores)
├─────────────────────────┤
│      Custom Hooks       │ ← Logic Composition (src/hooks)
├─────────────────────────┤
│      Services           │ ← Business Logic (src/services)
├─────────────────────────┤
│      Validation Layer   │ ← Shared Validation (shared/validation)
├─────────────────────────┤
│   Renderer Services     │ ← Communication via `src/services`
├─────────────────────────┤
│      Electron Backend   │ ← Backend Logic (electron/)
└─────────────────────────┘
```

## Validation Best Practices

### Frontend Validation Standards

**Always use the shared validation schemas for consistent behavior:**

```typescript
// ✅ Good: Use shared validation schemas
import {
 httpMonitorSchema,
 baseMonitorSchema,
} from "shared/validation/schemas";

const validateSiteForm = (formData: FormData) => {
 const result = httpMonitorSchema.safeParse(formData);
 if (!result.success) {
  return { isValid: false, errors: result.error.errors };
 }
 return { isValid: true, data: result.data };
};

// ❌ Bad: Manual validation that differs from backend
const validateSiteForm = (formData: FormData) => {
 if (!formData.identifier || formData.identifier.length < 2) {
  return { isValid: false, errors: ["ID too short"] };
 }
};
```

**Benefits of Shared Validation:**

- ✅ **Consistent validation** between frontend and backend
- ✅ **Well-tested** validation using Zod and validator.js
- ✅ **Type-safe** with automatic TypeScript type inference
- ✅ **Security-focused** validation patterns

### Real-time Validation Patterns

```typescript
// Real-time form validation with shared schemas
import { z } from "zod";

const useFormValidation = <T>(schema: z.ZodSchema<T>) => {
 const [errors, setErrors] = useState<Record<string, string>>({});

 const validateField = useCallback(
  (name: string, value: unknown) => {
   try {
    // Extract field schema from the main schema
    const fieldSchema = (schema as any).shape[name];
    if (fieldSchema) {
     fieldSchema.parse(value);
     // Clear error if validation passes
     setErrors((prev) => {
      const { [name]: _, ...rest } = prev;
      return rest;
     });
    }
   } catch (error) {
    if (error instanceof z.ZodError) {
     setErrors((prev) => ({
      ...prev,
      [name]: error.errors[0]?.message || "Invalid value",
     }));
    }
   }
  },
  [schema]
 );

 return { errors, validateField };
};
```

## Development Process

### 1. Planning Phase

Before implementing any UI feature:

1. **Understand the Full Context**: Read existing code to understand patterns and flows
2. **Identify Components**: Break down the feature into smaller, focused components
3. **Map Data Flow**: Trace how data will flow from backend to UI and back
4. **Check Existing Patterns**: Look for similar implementations to follow established patterns
5. **Plan State Management**: Determine which stores need updates and what new state is required

### 2. Implementation Order

Always follow this order to minimize breaking changes:

1. **Backend Integration**: Ensure all needed backend services and store actions exist
2. **State Management**: Add state to appropriate Zustand stores
3. **Hooks Layer**: Create or extend custom hooks for business logic
4. **Components**: Implement UI components from innermost to outermost
5. **Integration**: Wire up components with state and event handlers
6. **Testing**: Verify functionality and run all tests

### 3. Code Review Checklist

- [ ] Follows established architectural patterns
- [ ] No direct state mutations
- [ ] Proper error handling with logging
- [ ] Event handlers include `stopPropagation()` where needed
- [ ] TypeScript interfaces for all props and return types
- [ ] TSDoc documentation following base tag guidelines
- [ ] Tests pass and new functionality is covered

## Component Creation Guidelines

### Component Structure

**Current Implementation Pattern:**

````tsx
// Import standardized prop types for consistency
import type {
 ComponentSize,
 ComponentVariant,
} from "@shared/types/componentProps";
import type { JSX } from "react/jsx-runtime";

import { useCallback, useEffect, useState } from "react";

/**
 * Component description following TSDoc guidelines
 *
 * @remarks
 * Detailed remarks about the component's purpose and behavior. Components
 * should be functional components using hooks for state management and
 * lifecycle operations.
 *
 * @example
 *
 * ```tsx
 * <MyComponent
 *  siteName="Example Site"
 *  onAction={handleAction}
 *  isLoading={false}
 * />;
 * ```
 *
 * @param props - Component properties using standardized patterns
 *
 * @returns JSX element description
 *
 * @public
 */
export const MyComponent = ({
 // Core props
 siteName,
 className = "",
 disabled = false,

 // Event handlers
 onAction,
 onChange,

 // Component-specific props
 customProp,
}: MyComponentProperties): JSX.Element => {
 // State and hooks
 const [isLoading, setIsLoading] = useState<boolean>(false);

 // Event handlers with proper typing
 const handleClick = useCallback(
  (event: React.MouseEvent) => {
   event?.stopPropagation(); // Prevent event bubbling
   if (disabled || isLoading) return;
   onAction?.(event);
  },
  [
   onAction,
   disabled,
   isLoading,
  ]
 );

 const handleChange = useCallback(
  (event: React.ChangeEvent<HTMLInputElement>) => {
   const value = event.target.value;
   onChange?.(value, event);
  },
  [onChange]
 );

 // Effect cleanup pattern
 useEffect(
  function setupComponent() {
   // Setup logic here

   return function cleanup() {
    // Cleanup logic here
   };
  },
  [
   /* dependencies */
  ]
 );

 // Early returns for conditional rendering
 if (conditionalReturn) {
  return <></>;
 }

 // Main render
 return (
  <div className={className} data-testid={`my-component-${siteName}`}>
   {/* Component content */}
  </div>
 );
};
````

### Props Interface

```tsx
/**
 * Props for the MyComponent component following current patterns.
 *
 * @remarks
 * Uses modern TypeScript interfaces with proper typing and optional properties.
 * Components receive specific props rather than extending large base
 * interfaces.
 *
 * @public
 */
export interface MyComponentProperties {
 /** Site name for identification and display */
 readonly siteName: string;
 /** Additional CSS classes for styling customization */
 readonly className?: string;
 /** Whether the component is disabled and non-interactive */
 readonly disabled?: boolean;
 /** Component-specific configuration prop */
 readonly customProp: string;
 /** Optional feature toggle */
 readonly enableFeature?: boolean;

 /** Event handlers with proper typing */
 readonly onAction?: (event: React.MouseEvent) => void;
 readonly onChange?: (
  value: string,
  event: React.ChangeEvent<HTMLInputElement>
 ) => void;
}

// For complex components, use specific interfaces
export interface ComplexComponentProperties {
 /** Component identification */
 readonly siteName: string;
 readonly className?: string;
 readonly disabled?: boolean;

 /** Event handlers group */
 readonly onClick?: (event: React.MouseEvent) => void;
 readonly onSubmit?: (event: React.FormEvent) => void;
 readonly onKeyDown?: (event: React.KeyboardEvent) => void;

 /** Component configuration */
 readonly variant?: ComponentVariant;
 readonly size?: ComponentSize;

 /** Data props */
 readonly items: Array<{ id: string; label: string }>;
 readonly selectedItemId?: string;
}
```

### Key Guidelines for Current Implementation

- **Functional Components**: Use functional components with hooks (no React.memo unless performance issues)
- **Specific Interfaces**: Create specific prop interfaces rather than extending large base types
- **Readonly Properties**: Mark all props as readonly for immutability
- **Proper Event Typing**: Use specific React event types rather than generic handlers
- **JSX.Element Return**: Use `JSX.Element` as return type for clarity
- **Named Functions in useEffect**: Use named functions in useEffect for better debugging
- **Event handler naming**: Use `handle` prefix for internal handlers
- **Stop event propagation**: Add `event?.stopPropagation()` in button click handlers within cards
- **Accessibility**: Include `data-testid` attributes using component identifier
- **Import standardized types**: Import types from `@shared/types/componentProps` when available

## Component Props Standards

The application provides reusable prop type definitions in `shared/types/componentProps.ts` for common patterns:

### Using Standardized Types

```tsx
import type {
 ComponentSize,
 ComponentVariant,
 SubmitHandler,
} from "@shared/types/componentProps";

// Use standardized size and variant types
interface ButtonProperties {
 readonly size?: ComponentSize; // "xs" | "sm" | "md" | "lg" | "xl"
 readonly variant?: ComponentVariant; // "primary" | "secondary" | "danger" | etc.
 readonly onSubmit?: SubmitHandler; // Standardized form submission handler
}
```

### Current Event Handler Patterns

```tsx
// Standard event handlers used in current implementation
const handleClick = useCallback(
 (event: React.MouseEvent) => {
  event?.stopPropagation();
  if (disabled) return;
  onClick?.(event);
 },
 [onClick, disabled]
);

// Input change handler
const handleChange = useCallback(
 (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value;
  onChange?.(value, event);
 },
 [onChange]
);

// Form submission handler
const handleSubmit = useCallback(
 (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  onSubmit?.(formData, event);
 },
 [onSubmit]
);
```

## State Management

### Current Store Architecture

The application uses **Zustand** for state management with two main patterns:

#### Pattern 1: Direct Create (Simple Stores)

For simple stores with single responsibility:

```typescript
// Current implementation example - UI Store
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create<UIStore>()(
 persist(
  (set, get) => ({
   // Initial state
   showAddSiteModal: false,
   showSettings: false,
   showSiteDetails: false,
   selectedSiteIdentifier: undefined,
   activeTab: "dashboard",

   // Actions
   setShowAddSiteModal: (show: boolean) => {
    logStoreAction("UIStore", "setShowAddSiteModal", { show });
    set({ showAddSiteModal: show });
   },

   setShowSettings: (show: boolean) => {
    logStoreAction("UIStore", "setShowSettings", { show });
    set({ showSettings: show });
   },

   setSelectedSiteIdentifier: (siteIdentifier: string | undefined) => {
    logStoreAction("UIStore", "setSelectedSiteIdentifier", {
     siteIdentifier,
    });
    set({ selectedSiteIdentifier: siteIdentifier });
   },

   // Compound actions
   showSiteDetails: (siteIdentifier: string) => {
    logStoreAction("UIStore", "showSiteDetails", { siteIdentifier });
    set({
     selectedSiteIdentifier: siteIdentifier,
     showSiteDetails: true,
    });
   },
  }),
  {
   name: "ui-store",
   partialize: (state) => ({
    // Persist user preferences only
    activeTab: state.activeTab,
    // Don't persist modal states or temporary selections
   }),
  }
 )
);
```

#### Pattern 2: Modular Composition (Complex Stores)

For complex stores with multiple concerns:

```typescript
// Current implementation example - Sites Store
import { create } from "zustand";

export const useSitesStore = create<SitesStore>()((set, get) => {
 // Create state actions module
 const stateActions = createSitesStateActions(set, get);

 // Create specialized operation modules with dependencies
 const operationsActions = createSiteOperationsActions({
  addSite: stateActions.addSite,
  removeSite: stateActions.removeSite,
  setSites: stateActions.setSites,
  getSites: () => get().sites,
 });

 const monitoringActions = createSiteMonitoringActions();

 const syncActions = createSiteSyncActions({
  setSites: stateActions.setSites,
  getSites: () => get().sites,
 });

 return {
  // Initial state
  ...initialSitesState,

  // Composed actions from modules
  ...stateActions,
  ...operationsActions,
  ...monitoringActions,
  ...syncActions,
 };
});
```

#### Current Store Examples by Pattern

**Direct Pattern Stores:**

- `useUIStore` - Modal states, tab selections, user preferences
- `useErrorStore` - Error handling and loading states
- `useUpdatesStore` - Application update management
- `useSettingsStore` - Configuration and user settings

**Modular Pattern Stores:**

- `useSitesStore` - Sites, monitors, operations, synchronization

### Store Module Structure

Each store module has clear responsibilities:

- **State Module** (`useSitesState`): Core state management and data manipulation
- **Operations Module** (`useSiteOperations`): CRUD operations for entities
- **Monitoring Module** (`useSiteMonitoring`): Monitoring lifecycle and status management
- **Sync Module** (`useSiteSync`): Backend synchronization and data consistency

### Error Handling in Stores

```typescript
// ✅ Good: Consistent error handling with withErrorHandling
import { withErrorHandling } from "@shared/utils/errorHandling";
import { useErrorStore } from "@app/stores/error/useErrorStore";
import { SiteService } from "@app/services/SiteService";

export const createSiteOperationsActions = (
 deps: SiteOperationsDependencies
) => ({
 createSite: async (siteData) => {
  const errorStore = useErrorStore.getState();
  await withErrorHandling(
   async () => {
    // Perform operation
  const savedSite = await SiteService.addSite(siteData);
  applySavedSiteToStore(savedSite, deps);
  return savedSite;
   },
   {
    clearError: () => errorStore.clearStoreError("sites-operations"),
    setError: (error) => errorStore.setStoreError("sites-operations", error),
    setLoading: (loading) =>
     errorStore.setOperationLoading("createSite", loading),
   }
  );

  > **Tip:** `applySavedSiteToStore` guards against duplicate identifiers by
  > validating the merged snapshot before it hits the store. If the backend ever
  > returns inconsistent data, the helper surfaces detailed diagnostics instead of
  > silently masking the issue.
 },
});
```

### Store Organization

```tsx
// stores/domain/useDomainStore.ts
export const useDomainStore = create<DomainStore>()(
 persist(
  (set, get) => ({
   // State
   data: [],
   isLoading: false,

   // Actions
   updateData: (newData) => {
    logStoreAction("DomainStore", "updateData", { newData });
    set({ data: newData });
   },
  }),
  {
   name: "domain-store",
   partialize: (state) => ({
    // Only persist non-transient state
    data: state.data,
    // Don't persist loading states or modals
   }),
  }
 )
);
```

### State Partitioning Rules

- **Persist User Preferences**: Settings, theme choices, tab selections
- **Don't Persist Transient State**: Modal visibility, loading states, selected items
- **Domain Boundaries**: Keep related state in the same store
- **Loading States**: Use centralized error store for operation loading states

## Event Handling

### Event Handler Implementation

```tsx
// Standard button click handling
const handleButtonClick = useCallback(
 (event: React.MouseEvent) => {
  event?.stopPropagation(); // Prevents event bubbling to parent cards
  if (disabled || isLoading) return;
  onAction?.();
 },
 [
  onAction,
  disabled,
  isLoading,
 ]
);

// Input change handling
const handleInputChange = useCallback(
 (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value;
  setValue(value);
  onChange?.(value, event);
 },
 [onChange]
);

// Form submission
const handleFormSubmit = useCallback(
 (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  onSubmit?.(formData);
 },
 [onSubmit]
);
```

### Keyboard Event Handling

```tsx
// Modal escape key handling
useEffect(
 function setupKeyboardHandlers() {
  const handleKeyDown = (event: KeyboardEvent) => {
   if (event.key === "Escape") {
    onClose();
   }
  };

  document.addEventListener("keydown", handleKeyDown);

  return function cleanup() {
   document.removeEventListener("keydown", handleKeyDown);
  };
 },
 [onClose]
);

// Component-specific keyboard handling
const handleKeyDown = useCallback(
 (event: React.KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
   event.preventDefault();
   handleSubmit();
  }
 },
 [handleSubmit]
);
```

## Modal Development

### Modal Structure

```tsx
export const MyModal = React.memo(function MyModal() {
 const { showModal, setShowModal } = useUIStore();

 const handleClose = useCallback(() => {
  setShowModal(false);
 }, [setShowModal]);

 const handleBackdropClick = useCallback(
  (event: React.MouseEvent) => {
   if (event.target === event.currentTarget) {
    handleClose();
   }
  },
  [handleClose]
 );

 // Global escape key handling
 useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
   if (event.key === "Escape") {
    handleClose();
   }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => {
   document.removeEventListener("keydown", handleKeyDown);
  };
 }, [handleClose]);

 if (!showModal) {
  return <></>;
 }

 return (
  <div
   className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm"
   onClick={handleBackdropClick}
   role="button"
   tabIndex={0}
  >
   <ThemedBox className="w-full max-w-2xl">{/* Modal content */}</ThemedBox>
  </div>
 );
});
```

### Modal Best Practices

- **Glass Effect**: Use `backdrop-blur-sm bg-black bg-opacity-30` for modern glass overlay
- **Escape Key**: Always implement global escape key handling
- **Backdrop Clicks**: Close modal when clicking outside content area
- **Focus Management**: Consider focus trapping for accessibility
- **Z-Index**: Use consistent z-index values (50 for standard modals, 1000 for overlay modals)

## Reusable Components

### When to Extract Components

Extract components when:

- Same UI pattern is used in 2+ places
- Component has complex logic that can be isolated
- Component provides a specific, reusable behavior
- Different contexts need slightly different configurations

### Reusable Component Pattern

```tsx
// components/common/ReusableButton/ReusableButton.tsx
import type {
 StandardButtonProperties,
 EventHandlers,
} from "shared/types/componentProps";

export interface ReusableButtonProperties extends StandardButtonProperties {
 /** Context-specific props */
 label?: string;
 icon?: string;
 compact?: boolean;
}

export const ReusableButton = React.memo(function ReusableButton({
 // Standard button props (from StandardButtonProperties)
 variant = "primary",
 size = "md",
 isLoading = false,
 isDisabled = false,
 onClick,

 // Core props (from CoreComponentProperties)
 className = "",
 identifier,

 // Component-specific props
 compact = false,
 icon,
 label,

 // Children from StandardButtonProperties
 children,
}: ReusableButtonProperties) {
 const handleClick = useCallback<EventHandlers.ClickHandler>(
  (event) => {
   event?.stopPropagation();
   if (isDisabled || isLoading) return;
   onClick?.(event);
  },
  [
   onClick,
   isDisabled,
   isLoading,
  ]
 );

 return (
  <ThemedButton
   className={`flex items-center gap-1 ${className}`}
   disabled={isDisabled || isLoading}
   onClick={handleClick}
   size={size}
   variant={variant}
   data-testid={identifier ? `button-${identifier}` : undefined}
  >
   {icon && <span>{icon}</span>}
   {!compact && label && <span>{label}</span>}
   {children}
  </ThemedButton>
 );
});
```

### Integration Pattern

```tsx
// Import and use reusable component
import { ReusableButton } from "../common/ReusableButton/ReusableButton";
import type { EventHandlers } from "shared/types/componentProps";

// In parent component
const handleStartMonitoring = useCallback<EventHandlers.ClickHandler>(
 (event) => {
  // Handle start monitoring logic
 },
 []
);

<ReusableButton
 identifier="start-monitoring-btn"
 icon="🚀"
 isLoading={isLoading}
 label="Start Monitoring"
 onClick={handleStartMonitoring}
 variant="primary" // Using standardized variant values
 size="md"
/>;
```

## Testing Strategy

### Current Testing Approach

The application uses **Vitest** for unit testing with comprehensive mocking strategies:

#### Component Testing

```typescript
// Component render and interaction testing
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
 it("renders without errors", () => {
  render(<MyComponent siteName="test-site" />);
  expect(screen.getByTestId("my-component-test-site")).toBeInTheDocument();
 });

 it("handles click events correctly", () => {
  const mockOnAction = vi.fn();
  render(<MyComponent siteName="test-site" onAction={mockOnAction} />);

  fireEvent.click(screen.getByRole("button"));
  expect(mockOnAction).toHaveBeenCalledTimes(1);
 });

 it("prevents event propagation", () => {
  const mockOnAction = vi.fn();
  const mockParentClick = vi.fn();

  render(
   <div onClick={mockParentClick}>
    <MyComponent siteName="test-site" onAction={mockOnAction} />
   </div>
  );

  fireEvent.click(screen.getByRole("button"));
  expect(mockOnAction).toHaveBeenCalledTimes(1);
  expect(mockParentClick).not.toHaveBeenCalled();
 });
});
```

#### Store Testing

```typescript
// Zustand store testing with act
import { act, renderHook } from "@testing-library/react";
import { useSitesStore } from "./useSitesStore";

describe("useSitesStore", () => {
 beforeEach(() => {
  // Reset store state before each test
  useSitesStore.getState().setSites([]);
 });

 it("adds site correctly", () => {
  const { result } = renderHook(() => useSitesStore());
  const newSite = { id: "test-1", name: "Test Site", monitors: [] };

  act(() => {
   result.current.addSite(newSite);
  });

  expect(result.current.sites).toContain(newSite);
 });

 it("handles async operations", async () => {
  const { result } = renderHook(() => useSitesStore());

  await act(async () => {
   await result.current.syncSitesFromBackend();
  });

  expect(result.current.sites.length).toBeGreaterThan(0);
 });
});
```

#### Mock Strategies

```typescript
// ElectronAPI mocking for components
const mockElectronAPI = {
 sites: {
  addSite: vi.fn(),
  deleteSite: vi.fn(),
  getSites: vi.fn().mockResolvedValue([]),
 },
 events: {
  onMonitorStatusChanged: vi.fn(() => () => {}),
  onMonitorUp: vi.fn(() => () => {}),
  onMonitorDown: vi.fn(() => () => {}),
 },
};

// Global mock setup
Object.defineProperty(window, "electronAPI", {
 value: mockElectronAPI,
 writable: true,
});
```

#### Integration Testing

```typescript
// Testing component integration with stores
import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../theme/components/ThemeProvider";
import { MyIntegratedComponent } from "./MyIntegratedComponent";

const renderWithProviders = (component: React.ReactElement) => {
 return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe("MyIntegratedComponent Integration", () => {
 it("updates UI when store changes", async () => {
  renderWithProviders(<MyIntegratedComponent />);

  // Trigger store update
  act(() => {
   useSitesStore.getState().addSite(mockSite);
  });

  await waitFor(() => {
   expect(screen.getByText("Test Site")).toBeInTheDocument();
  });
 });
});
```

## Documentation Requirements

### TSDoc Standards

Follow the base tag guidelines in `docs/TSDoc/`:

/\*\*

- Brief component description. -

- @remarks

- Detailed explanation of component behavior, patterns used, and any important

- implementation details. -

- @example -

- /\`\`\`tsx

- <component prop="value">;</component>

- /\`\`\` -

- @param props - Component props -

- @returns JSX element description -

- @public \*/

### Code Comments

- **Why, not what**: Explain the reasoning behind complex logic
- **Business context**: Explain domain-specific requirements
- **Gotchas**: Document any non-obvious behavior or workarounds
- **TODO items**: Mark areas that need future improvement

## Common Pitfalls

### 1. Event Propagation

**Problem**: Button clicks in cards trigger card click handlers

**Solution**: Always use `event?.stopPropagation()` in button handlers

```tsx
// Wrong
onClick={() => handleAction()}

// Right
onClick={(event) => {
    event?.stopPropagation();
    handleAction();
}}
```

### 2. State Mutations

**Problem**: Directly mutating store state

**Solution**: Always use store actions

```tsx
// Wrong
sites[0].name = "New Name";

// Right
updateSiteName(siteIdentifier, "New Name");
```

### 3. Prop Drilling

**Problem**: Passing props through many component levels

**Solution**: Use appropriate stores or context, or compose with hooks

```tsx
// Wrong: Passing through multiple levels
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data} />

// Right: Use store or hook
const Component = () => {
    const { data } = useAppropriateStore();
    return <div>{data}</div>;
};
```

### 4. Missing Dependencies

**Problem**: useCallback/useEffect missing dependencies

**Solution**: Always include all dependencies, use ESLint rules

```tsx
// Wrong
const handler = useCallback(() => {
 doSomething(prop);
}, []); // Missing 'prop' dependency

// Right
const handler = useCallback(() => {
 doSomething(prop);
}, [prop]);
```

### 5. Improper Error Handling

**Problem**: Errors not properly caught and logged

**Solution**: Use withErrorHandling and centralized logger

```tsx
// Wrong
try {
 await riskyOperation();
} catch (error) {
 console.log(error);
}

// Right
try {
 await riskyOperation();
} catch (error) {
 logger.error("Operation failed", ensureError(error));
 throw error; // Re-throw after logging
}
```

## Real-Time Updates & Event Integration

### Current EventsService Architecture

The application uses **EventsService** abstraction for backend event integration:

```text
Backend Services → TypedEventBus → IPC → EventsService → React Components
```

### Setting Up Event Listeners

```typescript
// Component or hook event listener setup
import { EventsService } from "../services/EventsService";

export const useMonitorEventIntegration = () => {
 const sitesStore = useSitesStore();

 useEffect(
  function setupEventListeners() {
   const cleanupFunctions: Array<() => void> = [];

   const initializeEventListeners = async () => {
    try {
     // Monitor status change events
     const statusCleanup = await EventsService.onMonitorStatusChanged(
      (data) => {
       sitesStore.updateMonitorStatus(data.siteIdentifier, data.monitor);
      }
     );
     cleanupFunctions.push(statusCleanup);

     // Monitor up/down events
     const upCleanup = await EventsService.onMonitorUp((data) => {
      sitesStore.handleMonitorUp(data.siteIdentifier, data.monitorId);
     });
     cleanupFunctions.push(upCleanup);

     const downCleanup = await EventsService.onMonitorDown((data) => {
      sitesStore.handleMonitorDown(data.siteIdentifier, data.monitorId);
     });
     cleanupFunctions.push(downCleanup);

     // Cache invalidation events
     const cacheCleanup = await EventsService.onCacheInvalidated((data) => {
      if (data.domain === "sites") {
       sitesStore.syncSitesFromBackend();
      }
     });
     cleanupFunctions.push(cacheCleanup);
    } catch (error) {
     logger.error("Failed to setup event listeners:", error);
    }
   };

   initializeEventListeners();

   return function cleanup() {
    cleanupFunctions.forEach((cleanup) => cleanup());
   };
  },
  [sitesStore]
 );
};
```

### Cache Synchronization Pattern

```typescript
// Current cache sync implementation (used in App.tsx)
import { setupCacheSync } from "../utils/cacheSync";

useMount(
 useCallback(async function initializeApp() {
  // Initialize stores first
  await sitesStore.syncSitesFromBackend();
  await settingsStore.initializeSettings();

  // Setup automatic cache sync
  const cacheSyncCleanup = setupCacheSync();
  cacheSyncCleanupRef.current = cacheSyncCleanup;

  setIsInitialized(true);
 }, []),

 useCallback(function cleanup() {
  // Cleanup cache sync on unmount
  if (cacheSyncCleanupRef.current) {
   cacheSyncCleanupRef.current();
  }
 }, [])
);
```

### Common Event System Issues

**❌ Wrong Event Names**

```typescript
// Wrong - event doesn't exist in UptimeEvents
eventEmitter.emit("statusUpdate", data);
```

**✅ Correct Event Names**

```typescript
// Right - use defined events
await eventEmitter.emitTyped("monitor:status-changed", {
 monitor: freshMonitor,
 status: "up",
 previousStatus: "down",
 site: site,
 siteIdentifier: site.identifier,
 timestamp: new Date().toISOString(),
});
```

**❌ Disconnected Event Buses**

```typescript
// Wrong - using separate event bus that doesn't forward to main
const separateEventBus = new TypedEventBus("MyService");
separateEventBus.emit("monitor:up", data); // Never reaches frontend
```

**✅ Connected Event System**

```typescript
// Right - use manager event bus with forwarding setup
// ServiceContainer automatically forwards these events:
// ["monitor:status-changed", "monitor:up", "monitor:down", ...]
```

### Event Debugging Checklist

1. **Backend Events**: Are events being emitted with correct names?
2. **Event Forwarding**: Is ServiceContainer.setupEventForwarding() including your events?
3. **IPC Registration**: Is ApplicationService listening and forwarding events?
4. **Frontend Handlers**: Are components properly subscribing to events?
5. **Event Payloads**: Do event data structures match interface definitions?

### Integration with Existing Systems

**❌ Reinventing Services**

```typescript
// Wrong - creating new placeholder implementations
private performPortCheck(): Promise<boolean> {
    logger.warn("Port check not implemented");
    return Promise.resolve(true); // Hardcoded!
}
```

**✅ Using Existing Services**

```typescript
// Right - leverage existing monitor services
private async performTypeSpecificCheck(monitor: Monitor): Promise<boolean> {
    const portMonitor = new PortMonitor({});
    const result = await portMonitor.check(monitor);
    return result.status === "up";
}
```

### Code Quality and Security Guidelines

**❌ Magic Numbers**

```typescript
// Wrong - hardcoded values
const timeoutMs = (monitor.timeout || 30) * 1000 + 5000;
```

**✅ Named Constants**

```typescript
// Right - use defined constants
import {
 DEFAULT_MONITOR_TIMEOUT_SECONDS,
 MONITOR_TIMEOUT_BUFFER_MS,
} from "./constants";
const timeoutMs =
 (monitor.timeout || DEFAULT_MONITOR_TIMEOUT_SECONDS) *
  SECONDS_TO_MS_MULTIPLIER +
 MONITOR_TIMEOUT_BUFFER_MS;
```

**❌ Performance Issues in Validation**

```typescript
// Wrong - every() doesn't short-circuit optimally
return array.every((item) => typeof item === "string");
```

**✅ Optimized Validation**

```typescript
// Right - early return for better performance
for (const item of array) {
 if (typeof item !== "string") return false;
}
return true;
```

**❌ Unsafe JSON Parsing**

```typescript
// Wrong - no content validation
const data = JSON.parse(dbValue);
```

**✅ Secure JSON Parsing with Validation**

```typescript
// Right - validate parsed content structure and safety
try {
 const parsed = JSON.parse(dbValue);
 if (
  Array.isArray(parsed) &&
  parsed.every(
   (item) =>
    typeof item === "string" && !item.includes("{") && !item.includes("}")
  )
 ) {
  return parsed;
 }
 logger.warn("Parsed data failed security validation");
 return [];
} catch (error) {
 logger.warn("JSON parsing failed", error);
 return [];
}
```

## Summary

This guide provides comprehensive guidelines for UI development in the Uptime Watcher application based on current implementation patterns. Always follow these practices:

### Core Development Principles

1. **Follow Current Architecture**: Use functional components with hooks, Zustand stores, and EventsService integration
2. **Plan Before Implementing**: Understand data flows and integration points before writing code
3. **Use Specific Types**: Create focused prop interfaces rather than extending large base types
4. **Implement Proper Event Handling**: Include `event?.stopPropagation()` and proper error boundaries
5. **Write Comprehensive Tests**: Include component, integration, and store testing with proper mocking

### Current Implementation Standards

1. **Component Structure**: Use `JSX.Element` return types, named functions in useEffect, and proper cleanup patterns
2. **Store Patterns**: Choose between direct create (simple stores) and modular composition (complex stores) appropriately
3. **Event Integration**: Use EventsService abstraction for backend communication and cache synchronization
4. **Type Safety**: Use readonly props, specific React event types, and avoid `any` or `unknown`
5. **Testing Strategy**: Use Vitest with comprehensive mocking and proper store state management

### Quality Assurance

- **Code Review**: Verify implementation follows established patterns before submission
- **Performance**: Use proper dependency arrays in useCallback and useEffect
- **Accessibility**: Include data-testid attributes and proper keyboard navigation
- **Security**: Validate all inputs and use secure JSON parsing patterns
- **Documentation**: Maintain TSDoc comments following project guidelines

By following these practices, we ensure a consistent, maintainable, and scalable codebase that reflects the current architectural patterns and provides excellent developer experience.
