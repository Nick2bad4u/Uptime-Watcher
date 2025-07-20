# 📋 **State Management Pattern Guidelines**

## 🎯 **Overview**

This document establishes **clear, consistent guidelines** for state management patterns across the Uptime Watcher application. Following these patterns ensures maintainable, predictable, and scalable component architecture.

## 📊 **Pattern Selection Decision Tree**

### **✅ Use Custom Hook Pattern When:**

1. **Complex forms** with 8+ fields
2. **Multiple interdependent state variables** (3+ pieces of state that affect each other)
3. **Complex validation logic** (cross-field validation, async validation)
4. **Side effects coordination** (API calls triggered by state changes)
5. **State synchronization** with external services
6. **Reusable state logic** across multiple components

**Examples:**

- ✅ `useAddSiteForm` - 15+ fields with complex validation
- ✅ `useSiteDetails` - Multiple state variables with server synchronization
- ✅ Form components with dynamic field dependencies

### **✅ Use Direct useState Pattern When:**

1. **Simple forms** with 3 or fewer fields
2. **Independent state variables** (no cross-dependencies)
3. **Basic validation** (simple required/format checks)
4. **Local component state** (no external synchronization)
5. **Simple UI state** (toggles, selections, filters)

**Examples:**

- ✅ `HistoryTab` - Filter selection and display limits
- ✅ Simple modals with basic inputs
- ✅ Toggle switches and dropdowns

## 🏗️ **Implementation Patterns**

### **Pattern A: Custom Hook (Complex State)**

```typescript
// ✅ CORRECT - Complex form with custom hook
export interface AddSiteFormState {
    // State properties (8+ fields)
    url: string;
    host: string;
    port: string;
    name: string;
    monitorType: MonitorType;
    checkInterval: number;
    siteId: string;
    timeout: number;
    addMode: FormMode;
    selectedExistingSite: string;
    retryAttempts: number;
    formError: string | undefined;
}

export interface AddSiteFormActions {
    // Action methods
    setUrl: (url: string) => void;
    setHost: (host: string) => void;
    setPort: (port: string) => void;
    // ... other setters
    resetForm: () => void;
    setFormError: (error: string | undefined) => void;
}

export function useAddSiteForm(): AddSiteFormState & AddSiteFormActions {
    const [url, setUrl] = useState("");
    const [host, setHost] = useState("");
    // ... other state variables

    // Complex validation logic
    const validateForm = useCallback(() => {
        // Cross-field validation
        // Async validation calls
        // Complex business logic
    }, [url, host, port, monitorType]);

    // Side effects
    useEffect(() => {
        // Sync with external services
        // Update dependent fields
    }, [monitorType, addMode]);

    return {
        // State
        url,
        host,
        port,
        // ... other state
        
        // Actions
        setUrl,
        setHost,
        setPort,
        // ... other actions
        resetForm,
        setFormError,
    };
}
```

### **Pattern B: Direct useState (Simple State)**

```typescript
// ✅ CORRECT - Simple component with direct useState
export const HistoryTab = ({ selectedMonitor }: HistoryTabProperties) => {
    // Simple, independent state variables
    const [historyFilter, setHistoryFilter] = useState<"all" | "down" | "up">("all");
    const [historyLimit, setHistoryLimit] = useState(defaultHistoryLimit);
    const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");

    // Simple event handlers
    const handleFilterChange = (filter: "all" | "down" | "up") => {
        setHistoryFilter(filter);
    };

    const handleLimitChange = (limit: number) => {
        setHistoryLimit(limit);
    };

    // Render logic with simple state
    return (
        <div>
            <FilterDropdown value={historyFilter} onChange={handleFilterChange} />
            <LimitSelector value={historyLimit} onChange={handleLimitChange} />
            {/* ... rest of component */}
        </div>
    );
};
```

## 🔄 **Migration Guidelines**

### **From Direct State to Custom Hook**

**When to migrate:**

- Component grows beyond 5 fields
- Cross-field validation is needed
- Multiple components need the same state logic
- Server synchronization is required

**Migration steps:**

1. Extract state variables to interface
2. Create action interface
3. Move useState calls to custom hook
4. Move validation logic to hook
5. Update component to use hook
6. Test thoroughly

### **From Custom Hook to Direct State**

**When to migrate:**

- Hook is only used in one place
- State has been simplified to 3 or fewer variables
- No complex validation or side effects
- No reusability requirements

**Migration steps:**

1. Move useState calls to component
2. Inline simple validation
3. Remove hook file
4. Update imports
5. Test thoroughly

## 📝 **Code Quality Standards**

### **Custom Hook Standards**

```typescript
// ✅ GOOD - Clear interfaces and type safety
export interface FormState {
    field1: string;
    field2: number;
    errors: Record<string, string>;
}

export interface FormActions {
    setField1: (value: string) => void;
    setField2: (value: number) => void;
    validateForm: () => boolean;
    resetForm: () => void;
}

export function useMyForm(): FormState & FormActions {
    // Implementation with proper error handling
    // Clear separation of concerns
    // Memoized callbacks where appropriate
}
```

```typescript
// ❌ BAD - Unclear interfaces and mixed concerns
export function useMyForm() {
    // Mixed state management and business logic
    // No clear interfaces
    // Poor error handling
}
```

### **Direct State Standards**

```typescript
// ✅ GOOD - Simple, clear state management
const [filter, setFilter] = useState<"all" | "specific">("all");
const [isOpen, setIsOpen] = useState(false);

const handleFilterChange = (newFilter: "all" | "specific") => {
    setFilter(newFilter);
};
```

```typescript
// ❌ BAD - Overly complex for simple state
const [state, setState] = useState({
    filter: "all",
    isOpen: false,
    data: [],
    loading: false,
    errors: {},
}); // This should use a custom hook!
```

## 🧪 **Testing Patterns**

### **Testing Custom Hooks**

```typescript
import { renderHook, act } from "@testing-library/react";
import { useAddSiteForm } from "./useAddSiteForm";

describe("useAddSiteForm", () => {
    it("should initialize with default values", () => {
        const { result } = renderHook(() => useAddSiteForm());

        expect(result.current.url).toBe("");
        expect(result.current.host).toBe("");
        expect(result.current.formError).toBeUndefined();
    });

    it("should update state when setters are called", () => {
        const { result } = renderHook(() => useAddSiteForm());

        act(() => {
            result.current.setUrl("https://example.com");
        });

        expect(result.current.url).toBe("https://example.com");
    });

    it("should validate form correctly", () => {
        const { result } = renderHook(() => useAddSiteForm());

        act(() => {
            result.current.setUrl("invalid-url");
        });

        // Test validation logic
        expect(result.current.formError).toContain("valid URL");
    });
});
```

### **Testing Direct State Components**

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { HistoryTab } from "./HistoryTab";

describe("HistoryTab", () => {
    it("should update filter when dropdown changes", () => {
        render(<HistoryTab selectedMonitor={mockMonitor} />);

        const filterDropdown = screen.getByRole("combobox");
        fireEvent.change(filterDropdown, { target: { value: "down" } });

        // Verify filter state change
        expect(screen.getByDisplayValue("down")).toBeInTheDocument();
    });
});
```

## 🚨 **Common Anti-Patterns to Avoid**

### **❌ Mixed Patterns in Similar Complexity**

```typescript
// BAD - Inconsistent patterns for similar complexity
const ComponentA = () => {
    // 5 fields using custom hook
    const formState = useComplexForm();
    // ...
};

const ComponentB = () => {
    // 5 fields using direct state
    const [field1, setField1] = useState("");
    const [field2, setField2] = useState("");
    // ... 3 more fields
};
```

### **❌ Overly Complex Direct State**

```typescript
// BAD - Complex state that should use custom hook
const [formData, setFormData] = useState({
    personalInfo: { name: "", email: "", phone: "" },
    preferences: { theme: "light", notifications: true },
    settings: { autoSave: false, language: "en" },
});

// Multiple useEffect hooks for validation
useEffect(() => { /* complex validation */ }, [formData.personalInfo]);
useEffect(() => { /* more validation */ }, [formData.preferences]);
useEffect(() => { /* sync logic */ }, [formData.settings]);
```

### **❌ Unnecessary Custom Hooks**

```typescript
// BAD - Overkill for simple state
function useSimpleToggle() {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    return { isOpen, toggle };
}

// BETTER - Direct state for simple cases
const [isOpen, setIsOpen] = useState(false);
const toggle = () => setIsOpen(!isOpen);
```

## 📋 **Validation Patterns**

### **For Custom Hooks**

```typescript
export function useFormWithValidation() {
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = useCallback((field: string, value: any) => {
        // Backend registry validation for monitor data
        if (field === "monitorData") {
            return validateMonitorData(monitorType, value);
        }
        
        // Local validation for basic fields
        return validateBasicField(field, value);
    }, [monitorType]);

    const validateAll = useCallback(() => {
        const newErrors: Record<string, string> = {};
        // Comprehensive validation
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [/* dependencies */]);

    return { errors, validateField, validateAll };
}
```

### **For Direct State**

```typescript
const SimpleComponent = () => {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | undefined>();

    const handleNameChange = (value: string) => {
        setName(value);
        // Simple inline validation
        if (!value.trim()) {
            setError("Name is required");
        } else {
            setError(undefined);
        }
    };

    return (
        <TextField
            value={name}
            onChange={handleNameChange}
            error={error}
        />
    );
};
```

## 📈 **Success Metrics**

### **Technical Metrics**

- **Pattern Consistency**: 100% compliance with decision tree
- **Code Reusability**: Custom hooks used in multiple components
- **Maintainability**: Reduced time to add new fields or validation
- **Type Safety**: All state management uses proper TypeScript interfaces

### **Developer Experience Metrics**

- **Onboarding Speed**: New developers can quickly understand patterns
- **Bug Reduction**: Fewer state-related bugs
- **Feature Velocity**: Faster implementation of new forms and components

## 🎯 **Conclusion**

Following these guidelines ensures:

1. **Predictable Architecture** - Developers know which pattern to use
2. **Maintainable Code** - Clear separation of concerns
3. **Scalable Components** - Easy to extend and modify
4. **Type Safety** - Comprehensive TypeScript coverage
5. **Testing Clarity** - Appropriate testing patterns for each approach

**Key Takeaway**: **Choose the right tool for the job** - use custom hooks for complex state management and direct useState for simple cases. When in doubt, start simple and refactor to custom hooks as complexity grows.
