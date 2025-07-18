<!-- markdownlint-disable -->

# Component State Management Guidelines

This document outlines standardized patterns for managing component state, forms, and validation in the Uptime Watcher application.

## Component State Pattern Guidelines

### When to Use Custom Hooks vs Direct State

#### Use Custom Hooks When:

- **Complex forms** with 5+ form fields
- **Complex validation logic** that needs to be shared or tested independently
- **Multi-step workflows** with state transitions
- **Reusable state logic** across multiple components
- **Forms with dynamic fields** based on configuration

**Example**: `useAddSiteForm` (15+ fields, complex validation, dynamic monitor types)

```typescript
// ✅ GOOD - Complex form with custom hook
export function useAddSiteForm(): AddSiteFormActions & AddSiteFormState {
 const [url, setUrl] = useState("");
 const [host, setHost] = useState("");
 const [port, setPort] = useState("");
 const [name, setName] = useState("");
 const [monitorType, setMonitorType] = useState<MonitorType>("http");
 // ... 10+ more fields

 // Complex validation logic
 const isFormValid = useCallback(
  () => {
   // Complex multi-field validation
  },
  [
   /* dependencies */
  ]
 );

 return {
  // 15+ state fields and actions
 };
}
```

#### Use Direct useState When:

- **Simple forms** with 1-4 fields
- **UI state** (modals, toggles, filters)
- **Component-specific state** that won't be reused
- **Simple interactions** without complex validation

**Example**: Filter state in HistoryTab

```typescript
// ✅ GOOD - Simple component state
export const HistoryTab = () => {
 const [historyFilter, setHistoryFilter] = useState<"all" | "down" | "up">("all");
 const [historyLimit, setHistoryLimit] = useState(defaultHistoryLimit);

 // Simple, focused component logic
};
```

## Validation Strategy Guidelines

### Primary: Backend Registry Validation

**Use backend registry validation as the primary approach** for all monitor-related data:

```typescript
// ✅ PREFERRED - Backend registry validation
import { validateMonitorData } from "../../utils/monitorValidation";

async function validateMonitorType(
 monitorType: MonitorType,
 url: string,
 host: string,
 port: string
): Promise<string[]> {
 const monitorData = buildMonitorData(monitorType, { url, host, port });
 const result = await validateMonitorData(monitorType, monitorData);
 return result.errors;
}
```

**Benefits**:

- Consistent with backend validation rules
- Automatically updated when monitor types change
- Centralized validation logic
- Type-safe and extensible

### Secondary: Local Validation

**Use local validation only for**:

- **UI-specific validations** (form completeness, basic format checks)
- **Non-monitor data** (site names, intervals, basic inputs)
- **Quick feedback** before expensive backend calls

```typescript
// ✅ ACCEPTABLE - Local validation for basic checks
function validateAddMode(addMode: string, name: string, selectedExistingSite: string): string[] {
 const errors: string[] = [];

 if (addMode === "new" && !name.trim()) {
  errors.push("Site name is required");
 }

 if (addMode === "existing" && !selectedExistingSite) {
  errors.push("Please select a site to add the monitor to");
 }

 return errors;
}
```

### Avoid: Mixed Validation Approaches

**❌ AVOID**: Different validation rules for the same data type

```typescript
// ❌ WRONG - Inconsistent validation
// Component A: Uses backend validation for URL
// Component B: Uses local regex for URL
// Component C: Uses different URL validation rules
```

## State Management Decision Tree

```folder
Component needs state management?
├── Yes → Is it form data?
│   ├── Yes → How many fields?
│   │   ├── 5+ fields OR complex validation → Custom Hook
│   │   └── 1-4 fields AND simple validation → Direct useState
│   └── No → Is it UI state?
│       ├── Yes → Direct useState
│       └── No → Is it shared across components?
│           ├── Yes → Store state (Zustand)
│           └── No → Direct useState
└── No → Use store state or props
```

## Form Patterns

### Complex Forms (Custom Hook Pattern)

**Structure**:

```typescript
// useComplexForm.ts
export interface ComplexFormState {
    // All form fields
}

export interface ComplexFormActions {
    // All form actions
    isFormValid: () => boolean;
    resetForm: () => void;
}

export function useComplexForm(): ComplexFormState & ComplexFormActions {
    // Implementation
}

// ComplexFormComponent.tsx
export const ComplexFormComponent = () => {
    const formState = useComplexForm();

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields using formState */}
        </form>
    );
};
```

**Requirements**:

- Separate interface definitions for state and actions
- Comprehensive TSDoc documentation
- Validation using backend registry when applicable
- Error handling integration with error store

### Simple Forms (Direct State Pattern)

**Structure**:

```typescript
export const SimpleFormComponent = () => {
    const [field1, setField1] = useState("");
    const [field2, setField2] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Simple validation and submission
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
        </form>
    );
};
```

**Requirements**:

- Keep validation logic simple and inline
- Use backend validation for monitor data
- Handle errors appropriately

## Validation Implementation Guidelines

### Backend Registry Validation Setup

1. **Import validation utilities**:

```typescript
import { validateMonitorData } from "../../utils/monitorValidation";
```

2. **Build monitor data using dynamic config**:

```typescript
const monitorData = await buildMonitorData(monitorType, formFields);
```

3. **Validate with backend registry**:

```typescript
const result = await validateMonitorData(monitorType, monitorData);
if (!result.success) {
 // Handle validation errors
 console.error("Validation errors:", result.errors);
}
```

### Local Validation Patterns

1. **Field-level validation functions**:

```typescript
function validateSiteName(name: string): string[] {
 const errors: string[] = [];
 if (!name.trim()) errors.push("Site name is required");
 if (name.length > 100) errors.push("Site name too long");
 return errors;
}
```

2. **Combine validation results**:

```typescript
const allErrors = [
 ...validateSiteName(name),
 ...validateCheckInterval(interval),
 ...(await validateMonitorData(type, data)).errors,
];
```

## Component State Best Practices

### State Organization

1. **Group related state**: Keep related useState calls together
2. **Use descriptive names**: Avoid generic names like `data`, `value`
3. **Initialize with proper types**: Use type assertions when needed
4. **Use useCallback for event handlers**: Prevent unnecessary re-renders

### Performance Considerations

1. **Memoize expensive computations**: Use `useMemo` for filtering/sorting
2. **Debounce API calls**: Use debouncing for real-time validation
3. **Avoid unnecessary re-renders**: Use `useCallback` and `useMemo` appropriately

### Error Handling

1. **Integrate with error store**: Use centralized error management
2. **Provide user feedback**: Show validation errors clearly
3. **Handle async errors**: Properly catch and display async validation errors

## Examples

### Complex Form Hook (Reference: `useAddSiteForm`)

- 15+ form fields with interdependencies
- Dynamic field visibility based on monitor type
- Backend registry validation integration
- Comprehensive error handling

### Simple Component State (Reference: `HistoryTab`)

- 2-3 simple state variables
- Local validation for UI constraints
- Direct useState usage
- Focused component functionality

### Backend Validation (Reference: `AddSiteForm/Submit.tsx`)

- Primary validation through backend registry
- Fallback local validation for basic checks
- Comprehensive error collection and handling
- Type-safe validation with proper error messages

## Migration Guidelines

### From Local to Backend Validation

1. Identify monitor-related validation logic
2. Replace with `validateMonitorData` calls
3. Update error handling to use validation results
4. Test with different monitor types

### From Direct State to Custom Hook

1. Identify complex form patterns (5+ fields)
2. Extract state and actions to custom hook
3. Create proper interfaces for type safety
4. Move validation logic to hook
5. Update component to use hook

## Common Patterns to Avoid

1. **❌ Inconsistent validation**: Different rules for same data type
2. **❌ Mixed state patterns**: Custom hooks and direct state for similar complexity
3. **❌ Validation without error handling**: Not displaying validation errors to users
4. **❌ Unnecessary custom hooks**: Using hooks for simple 1-2 field forms
5. **❌ Missing backend validation**: Using only local validation for monitor data
