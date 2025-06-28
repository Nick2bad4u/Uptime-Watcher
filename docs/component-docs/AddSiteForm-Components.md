# AddSiteForm Sub-Components Documentation

## Overview

The AddSiteForm system includes several specialized sub-components that handle form field rendering, validation, and submission. These components work together to provide a robust, accessible, and user-friendly site addition experience.

---

## Component Hierarchy

```text
AddSiteForm (main component)
├── FormFields Components
│   ├── FormField (reusable field wrapper)
│   ├── UrlField
│   ├── NameField
│   ├── IntervalField
│   └── TagsField
└── Submit (submission handling)
```

---

## FormFields Module

### Location & Files

- **Main Module:** `src/components/AddSiteForm/FormFields.tsx`
- **Purpose**: Reusable form field components with consistent styling and validation

### Core Components

#### FormField (Base Component)

**Purpose**: Base wrapper component for all form fields providing consistent layout and error handling.

**Props Interface**:

```typescript
interface FormFieldProps {
 children: React.ReactNode;
 error?: string;
 helpText?: string;
 id: string;
 label: string;
 required?: boolean;
}
```

**Key Features**:

- **Consistent Layout**: Standardized label, input, and error message positioning
- **Accessibility**: Proper label association and ARIA attributes
- **Error Display**: Integrated error message display with styling
- **Help Text**: Optional help text for user guidance
- **Required Indicators**: Visual indicators for required fields

**Implementation Details**:

```typescript
// ARIA label helper with required suffix
const REQUIRED_SUFFIX = " (required)";
const createAriaLabel = (label: string, required: boolean): string =>
    `${label}${required ? REQUIRED_SUFFIX : ""}`;

// Memoized for performance
export const FormField = React.memo(function FormField({
    children, error, helpText, id, label, required = false
}: FormFieldProps) {
    return (
        <div>
            <label className="block mb-1" htmlFor={id}>
                <ThemedText size="sm" variant="secondary" weight="medium">
                    {label} {required && "*"}
                </ThemedText>
            </label>
            {children}
            {error && (
                <div id={`${id}-error`}>
                    <ThemedText className="mt-1" size="xs" variant="error">
                        {error}
                    </ThemedText>
                </div>
            )}
            {helpText && !error && (
                <div id={`${id}-help`}>
                    <ThemedText className="mt-1" size="xs" variant="secondary">
                        {helpText}
                    </ThemedText>
                </div>
            )}
        </div>
    );
});
```

#### UrlField Component

**Purpose**: Specialized input field for website URL entry with validation and formatting.

**Key Features**:

- **URL Validation**: Real-time URL format validation
- **Protocol Handling**: Automatic protocol prefix addition
- **Input Formatting**: URL normalization and formatting
- **Error Messages**: Specific URL-related error messages

**Usage Pattern**:

```typescript
<FormField
    id="url"
    label="Website URL"
    required={true}
    error={errors.url}
    helpText="Enter the full URL including protocol (https://)"
>
    <ThemedInput
        id="url"
        type="url"
        value={formData.url}
        onChange={handleUrlChange}
        placeholder="https://example.com"
        aria-describedby={error ? "url-error" : "url-help"}
        required
    />
</FormField>
```

#### NameField Component

**Purpose**: Text input for site name/identifier with optional auto-generation from URL.

**Key Features**:

- **Auto-generation**: Automatic name suggestion from URL
- **Manual Override**: User can customize the generated name
- **Validation**: Name uniqueness and format validation
- **Placeholder Logic**: Smart placeholder text based on URL

#### IntervalField Component

**Purpose**: Dropdown selection for monitoring check intervals.

**Key Features**:

- **Predefined Options**: Standard interval options (30s, 1m, 5m, etc.)
- **Performance Hints**: Visual indicators for performance impact
- **Default Selection**: Intelligent default based on site type
- **Validation**: Ensures valid interval selection

**Options Structure**:

```typescript
const INTERVAL_OPTIONS = [
 { value: 30, label: "30 seconds", performance: "high" },
 { value: 60, label: "1 minute", performance: "medium" },
 { value: 300, label: "5 minutes", performance: "low" },
 { value: 900, label: "15 minutes", performance: "minimal" },
 // ... more options
];
```

#### TagsField Component

**Purpose**: Input field for adding organizational tags to sites.

**Key Features**:

- **Tag Suggestions**: Auto-complete from existing tags
- **Multi-tag Input**: Support for multiple tags with visual chips
- **Tag Validation**: Format and length validation for tags
- **Visual Feedback**: Tag chips with remove functionality

---

## Submit Component

### Submit Component Location & Files

- **Component:** `src/components/AddSiteForm/Submit.tsx`
- **Purpose**: Handles form submission logic and user feedback

### Key Features

#### Submission Handling

- **Form Validation**: Pre-submission validation checks
- **Loading States**: Visual feedback during submission
- **Error Handling**: Comprehensive error message display
- **Success Feedback**: Confirmation of successful site addition

#### User Experience

- **Progress Indicators**: Loading spinners and progress feedback
- **Button States**: Disabled states during processing
- **Error Recovery**: Clear error messages with recovery suggestions
- **Keyboard Support**: Full keyboard accessibility

### Implementation Pattern

```typescript
interface SubmitProps {
    formData: SiteFormData;
    errors: FormErrors;
    isLoading: boolean;
    onSubmit: (data: SiteFormData) => Promise<void>;
    onCancel: () => void;
}

export const Submit = React.memo(function Submit({
    formData, errors, isLoading, onSubmit, onCancel
}: SubmitProps) {
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (hasErrors(errors)) return;

        try {
            await onSubmit(formData);
        } catch (error) {
            // Error handling is managed by parent component
            logger.error("Form submission failed", error);
        }
    };

    return (
        <div className="flex justify-end gap-3 mt-6">
            <ThemedButton
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
            >
                Cancel
            </ThemedButton>
            <ThemedButton
                variant="primary"
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={hasErrors(errors)}
            >
                Add Site
            </ThemedButton>
        </div>
    );
});
```

---

## Validation System

### Validation Architecture

The form validation system is distributed across components but centrally coordinated:

#### Field-Level Validation

```typescript
// Individual field validation
const validateUrl = (url: string): string | undefined => {
 if (!url) return "URL is required";
 if (!isValidUrl(url)) return "Please enter a valid URL";
 if (!url.startsWith("http")) return "URL must include protocol (http:// or https://)";
 return undefined;
};

// Real-time validation on change
const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const value = e.target.value;
 setFormData((prev) => ({ ...prev, url: value }));
 setErrors((prev) => ({ ...prev, url: validateUrl(value) }));
};
```

#### Form-Level Validation

```typescript
// Complete form validation before submission
const validateForm = (data: SiteFormData): FormErrors => {
 return {
  url: validateUrl(data.url),
  name: validateName(data.name),
  interval: validateInterval(data.interval),
  tags: validateTags(data.tags),
 };
};
```

### Error Handling Patterns

- **Real-time Feedback**: Validation on blur and change events
- **Submission Blocking**: Prevent submission with validation errors
- **Error Persistence**: Maintain error state until resolved
- **Error Prioritization**: Show most critical errors first

---

## Accessibility Features

### Form Accessibility

#### Label Association

```typescript
// Proper label-input association
<label htmlFor={id}>
    <ThemedText size="sm" variant="secondary" weight="medium">
        {label} {required && "*"}
    </ThemedText>
</label>
<ThemedInput
    id={id}
    aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
    aria-invalid={!!error}
    aria-required={required}
/>
```

#### Error Announcements

- **ARIA Live Regions**: Error announcements for screen readers
- **Error Association**: Errors linked to inputs via `aria-describedby`
- **Error Formatting**: Clear, actionable error messages

#### Keyboard Navigation

- **Tab Order**: Logical tab sequence through form fields
- **Enter Submission**: Form submission via Enter key
- **Escape Cancellation**: Cancel form via Escape key

### Screen Reader Support

- **Field Descriptions**: Comprehensive field descriptions
- **Required Indicators**: Clear required field announcements
- **Error Context**: Detailed error context for each field
- **Help Text**: Additional guidance when needed

---

## Performance Optimizations

### Component Memoization

```typescript
// All form components are memoized
export const FormField = React.memo(function FormField(props) {
 // Component implementation
});

export const UrlField = React.memo(function UrlField(props) {
 // Component implementation
});
```

### Event Handler Optimization

- **Stable References**: Use useCallback for event handlers
- **Debounced Validation**: Debounce validation for performance
- **Efficient Updates**: Minimize re-renders during typing

### Data Management

- **Controlled Components**: Efficient state management
- **Validation Caching**: Cache validation results where appropriate
- **Selective Updates**: Update only changed form fields

---

## Integration Patterns

### Parent-Child Communication

```typescript
// Data flows down, events flow up
<AddSiteForm>
    <FormFields
        formData={formData}
        errors={errors}
        onChange={handleFormChange}
        onValidate={handleValidation}
    />
    <Submit
        formData={formData}
        errors={errors}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
    />
</AddSiteForm>
```

### Hook Integration

The form components integrate with custom hooks:

- **useFormValidation**: Centralized validation logic
- **useFormState**: State management for form data
- **useSubmission**: Handles submission and loading states

---

## Testing Strategies

### Component Testing

```typescript
describe("FormField", () => {
 test("renders label and input correctly", () => {
  // Test basic rendering
 });

 test("displays error messages", () => {
  // Test error display
 });

 test("shows help text when no errors", () => {
  // Test help text display
 });
});
```

### Integration Testing

- **Form Flow**: Test complete form submission flow
- **Validation**: Test all validation scenarios
- **Accessibility**: Test keyboard navigation and screen reader support
- **Error Handling**: Test error recovery and user feedback

### User Experience Testing

- **Tab Order**: Verify logical tab sequence
- **Error Feedback**: Test error message clarity
- **Success Flow**: Test successful form submission
- **Mobile Experience**: Test on touch devices

---

## Future Enhancements

### Planned Improvements

- **Advanced Validation**: Custom validation rules
- **Dynamic Fields**: Conditionally shown fields based on input
- **Auto-save**: Automatic draft saving
- **Import/Export**: Bulk site addition via file import

### Extensibility

- **Custom Fields**: Plugin system for additional fields
- **Validation Plugins**: Extensible validation system
- **Theme Customization**: Per-form theme overrides
- **Localization**: Multi-language support for form labels and errors
