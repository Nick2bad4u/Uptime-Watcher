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
│      IPC Bridge         │ ← Communication (window.electronAPI)
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

````tsx

// Import standardized prop types for consistency
import type {
 CoreComponentProperties,
 EventHandlers,
 ComponentProperties,
} from "shared/types/componentProps";

/**
 * Component description following TSDoc guidelines
 *
 * @remarks
 * Detailed remarks about the component's purpose and behavior. See
 * {@link https://github.com/nick2bad4u/uptime-watcher/blob/main/docs/Architecture/Patterns/Component-Props-Standards.md | Component Props Standards}
 * for prop naming and structure guidelines.
 *
 * @example
 *
 * ```tsx
 * <MyComponent
 *  identifier="unique-id"
 *  onClick={handleClick}
 *  isLoading={false}
 * />;
 * ```
 *
 * @param props - Component props following standardized patterns
 *
 * @returns JSX element description
 *
 * @public
 */
export const MyComponent = React.memo(function MyComponent({
 // Core props (always first)
 identifier,
 className = "",
 isDisabled = false,

 // Event handlers (using standardized signatures)
 onClick,
 onChange,

 // Component-specific props
 customProp,
}: MyComponentProperties) {
 // State and hooks
 const { state } = useAppropriateStore();

 // Event handlers with standardized patterns
 const handleClick = useCallback<EventHandlers.ClickHandler>(
  (event) => {
   event?.stopPropagation(); // Prevent event bubbling
   if (isDisabled) return;
   onClick?.(event);
  },
  [onClick, isDisabled]
 );

 const handleChange = useCallback<EventHandlers.ChangeHandler<string>>(
  (event) => {
   const value = event.target.value;
   onChange?.(value, event);
  },
  [onChange]
 );

 // Early returns
 if (conditionalReturn) {
  return <></>;
 }

 // Main render
 return (
  <ThemedBox className={className} data-testid={`my-component-${identifier}`}>
   {/* Component content */}
  </ThemedBox>
 );
});
````

// Main render
return <ThemedBox>{/_Component content_/}</ThemedBox>;
});

### Props Interface

```tsx
/**
 * Props for the MyComponent component following standardized patterns.
 *
 * @remarks
 * Extends CoreComponentProperties for consistent base props across all
 * components. Uses standardized event handler signatures from EventHandlers
 * namespace.
 *
 * @public
 */
export interface MyComponentProperties
 extends ComponentProperties<{
  /** Component-specific prop with clear description */
  customProp: string;
  /** Optional configuration prop */
  enableFeature?: boolean;
 }> {
 /** Standard click handler following EventHandlers pattern */
 onClick?: EventHandlers.ClickHandler;
 /** Standard change handler with typed value */
 onChange?: EventHandlers.ChangeHandler<string>;
}

// Alternative: For components with extensive props, use intersection types
export interface MyComplexComponentProperties
 extends CoreComponentProperties,
  AccessibilityProperties {
 /** Event handlers group */
 onClick?: EventHandlers.ClickHandler;
 onSubmit?: EventHandlers.SubmitHandler;
 onKeyDown?: EventHandlers.KeyboardHandler;

 /** Component configuration */
 variant?: "primary" | "secondary" | "danger";
 size?: "sm" | "md" | "lg";

 /** Data props */
 items: Array<{ id: string; label: string }>;
 selectedItemId?: string;
}
```

### Key Guidelines

- **Always use React.memo**: Prevents unnecessary re-renders
- **Extend standardized interfaces**: Use `ComponentProperties<T>` or intersect with `CoreComponentProperties`
- **Standardized event handlers**: Use types from `EventHandlers` namespace for consistent signatures
- **Alphabetical prop ordering**: Core props first, then event handlers, then component-specific props
- **Event handler naming**: Use `handle` prefix for internal handlers, standardized signatures for props
- **Proper prop typing**: Never use `any` or `unknown`, leverage standardized types
- **Stop event propagation**: Add `event?.stopPropagation()` in button click handlers within cards
- **Accessibility first**: Include `data-testid` attributes using component identifier
- **Import standardized types**: Always import from `shared/types/componentProps` for consistency

## Component Props Standards

For comprehensive prop interface guidelines, see the [Component Props Standards](../Architecture/Patterns/Component-Props-Standards.md) documentation.

### Using Standardized Prop Types

The application provides reusable prop type definitions in `shared/types/componentProps.ts`:

#### Core Properties

```tsx
import type {
 CoreComponentProperties,
 AccessibilityProperties,
 ComponentProperties,
} from "shared/types/componentProps";

// Simple component extending core properties
interface SimpleButtonProperties extends CoreComponentProperties {
 label: string;
 onClick?: EventHandlers.ClickHandler;
}

// Component with accessibility features
interface AccessibleFormProperties
 extends CoreComponentProperties,
  AccessibilityProperties {
 onSubmit: EventHandlers.SubmitHandler;
}

// Complex component using utility type
interface ComplexComponentProperties
 extends ComponentProperties<{
  items: Array<{ id: string; name: string }>;
  selectedId?: string;
  onSelectionChange: (id: string) => void;
 }> {
 // Event handlers are included via ComponentProperties
 // Core props (className, isDisabled, etc.) are included
}
```

#### Event Handler Standards

```tsx
import type { EventHandlers } from "shared/types/componentProps";

// Standard click handler
const handleClick: EventHandlers.ClickHandler = useCallback((event) => {
 event?.stopPropagation();
 // Handle click logic
}, []);

// Change handler with typed value
const handleNameChange: EventHandlers.ChangeHandler<string> = useCallback(
 (value, event) => {
  setName(value);
  onChange?.(value, event);
 },
 [onChange]
);

// Submit handler with form data
const handleSubmit: EventHandlers.SubmitHandler = useCallback(
 (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  onSubmit?.(formData, event);
 },
 [onSubmit]
);
```

#### Standard Button Properties

```tsx
import type { StandardButtonProperties } from "shared/types/componentProps";

// Button component using standard properties
interface ActionButtonProperties extends StandardButtonProperties {
 action: "save" | "cancel" | "delete";
 confirmationRequired?: boolean;
}

const ActionButton: React.FC<ActionButtonProperties> = ({
 // Standard button props
 variant = "primary",
 size = "md",
 isLoading = false,
 isDisabled = false,
 onClick,

 // Component-specific props
 action,
 confirmationRequired = false,

 // Core props
 className = "",
 children,
}) => {
 // Implementation using standardized patterns
};
```

## State Management

### Modular Zustand Store Architecture

The application uses a **modular composition pattern** for Zustand stores to separate concerns and improve testability:

```typescript
// ✅ Good: Modular store composition
import { create } from "zustand";

export const useSitesStore = create<SitesStore>()((set, get) => {
 // Create state actions
 const stateActions = createSitesStateActions(set, get);

 // Shared functions between modules
 const getSites = () => get().sites;

 // Create specialized action modules
 const syncActions = createSiteSyncActions({
  getSites,
  setSites: stateActions.setSites,
 });

 const monitoringActions = createSiteMonitoringActions();
 const operationsActions = createSiteOperationsActions({
  addSite: stateActions.addSite,
  getSites,
  removeSite: stateActions.removeSite,
  setSites: stateActions.setSites,
  syncSitesFromBackend: syncActions.syncSitesFromBackend,
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
import { useErrorStore } from "../error/useErrorStore";

export const createSiteOperationsActions = (
 deps: SiteOperationsDependencies
) => ({
 createSite: async (siteData) => {
  const errorStore = useErrorStore.getState();
  await withErrorHandling(
   async () => {
    // Perform operation
    const site = await window.electronAPI.sites.addSite(siteData);
    await deps.syncSitesFromBackend();
    return site;
   },
   {
    clearError: () => errorStore.clearStoreError("sites-operations"),
    setError: (error) => errorStore.setStoreError("sites-operations", error),
    setLoading: (loading) =>
     errorStore.setOperationLoading("createSite", loading),
   }
  );
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

### Button Event Handling

```tsx
// Correct: Prevents event bubbling to parent card
const handleButtonClick = useCallback(
 (event: React.MouseEvent) => {
  event?.stopPropagation();
  onAction();
 },
 [onAction]
);

// Incorrect: Event bubbles up to parent card
const handleButtonClick = useCallback(() => {
 onAction();
}, [onAction]);
```

### Keyboard Events

```tsx
// Modal escape key handling
useEffect(() => {
 const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
   onClose();
  }
 };

 document.addEventListener("keydown", handleKeyDown);
 return () => {
  document.removeEventListener("keydown", handleKeyDown);
 };
}, [onClose]);
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

### Component Testing

- **Render Tests**: Verify component renders without errors
- **Interaction Tests**: Test button clicks, form submissions
- **State Tests**: Verify state updates work correctly
- **Integration Tests**: Test component integration with stores
- **Accessibility Tests**: Verify keyboard navigation and screen reader support

### Testing Hooks

```tsx
// Test custom hooks with renderHook
import { renderHook } from "@testing-library/react";

test("useSiteActions provides correct handlers", () => {
 const { result } = renderHook(() => useSiteActions(mockSite, mockMonitor));

 expect(result.current.handleStartMonitoring).toBeDefined();
 expect(result.current.handleStopMonitoring).toBeDefined();
});
```

## Documentation Requirements

### TSDoc Standards

Follow the base tag guidelines in `docs/TSDoc/`:

/\*\*

- Brief component description.
-
- @remarks
- Detailed explanation of component behavior, patterns used, and any important
- implementation details.
-
- @example
-
- /```tsx
- <Component prop="value" />;
- /```
-
- @param props - Component props
-
- @returns JSX element description
-
- @public
  \*/

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
updateSiteName(siteId, "New Name");
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

## Real-Time Updates & Event System Debugging

### Event Flow Architecture

Understanding the complete event flow is crucial for debugging real-time UI updates:

```text
Enhanced/Traditional Monitoring → Event Bus → ServiceContainer →
UptimeOrchestrator → ApplicationService → IPC → Preload → Frontend
```

### Key Lessons from Monitor Status Update Issues

When UI doesn't update after backend operations:

1. **Verify Event Emission**: Check if the backend service is emitting the correct events
2. **Check Event Types**: Ensure emitted events match the defined UptimeEvents interface
3. **Trace Event Forwarding**: Verify events flow through the complete chain
4. **Validate Event Payloads**: Ensure event data matches expected interface structure

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
 newStatus: "up",
 previousStatus: "down",
 site: site,
 siteId: site.identifier,
 timestamp: Date.now(),
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

This guide provides a foundation for consistent, maintainable UI development in the Uptime Watcher application. Always:

1. Follow established architectural patterns
2. Plan before implementing
3. Consider reusability from the start
4. Implement proper error handling and logging
5. Write comprehensive tests and documentation
6. **Verify real-time event flows work end-to-end**
7. **Use existing services rather than creating placeholders**
8. **Ensure event names match the UptimeEvents interface**
9. Review code against these guidelines before submission

By following these practices, we ensure a consistent, maintainable, and scalable codebase that follows React and TypeScript best practices while adhering to the application's specific architectural requirements.
