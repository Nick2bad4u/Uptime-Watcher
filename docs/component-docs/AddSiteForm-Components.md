# AddSiteForm Components Documentation

## Overview

The AddSiteForm system consists of a main form component and reusable form field components that handle form rendering, validation, and submission. The architecture provides a flexible form builder for creating new monitoring sites or adding monitors to existing sites.

---

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->

- [AddSiteForm Components Documentation](#addsiteform-components-documentation)
  - [Overview](#overview)
  - [Component Hierarchy](#component-hierarchy)
  - [FormFields Module](#formfields-module)
    - [Location \& Files](#location--files)
    - [Core Components](#core-components)
      - [FormField (Base Component)](#formfield-base-component)
      - [TextField Component](#textfield-component)
      - [SelectField Component](#selectfield-component)
      - [RadioGroup Component](#radiogroup-component)
  - [State Management Hook](#state-management-hook)
    - [useAddSiteForm Hook](#useaddsiteform-hook)
      - [State Interface](#state-interface)
      - [Actions Interface](#actions-interface)
      - [Key Features](#key-features)
  - [Submission Handling](#submission-handling)
    - [handleSubmit Function](#handlesubmit-function)
      - [Function Signature](#function-signature)
      - [Props Interface](#props-interface)
      - [Validation Features](#validation-features)
      - [Error Handling](#error-handling)
  - [Main Component Integration](#main-component-integration)
    - [AddSiteForm Component](#addsiteform-component)
      - [Key Features](#key-features-1)
      - [Form Flow](#form-flow)
  - [Validation System](#validation-system)
    - [Client-Side Validation](#client-side-validation)
      - [Form-Level Validation (Submit Button)](#form-level-validation-submit-button)
      - [Submission Validation (Comprehensive)](#submission-validation-comprehensive)
    - [Validation Error Messages](#validation-error-messages)
  - [Accessibility Features](#accessibility-features)
    - [ARIA Support](#aria-support)
    - [Keyboard Navigation](#keyboard-navigation)
    - [Screen Reader Support](#screen-reader-support)
  - [Performance Optimizations](#performance-optimizations)
    - [Component Memoization](#component-memoization)
    - [Hook Optimizations](#hook-optimizations)
  - [Testing Considerations](#testing-considerations)
    - [Unit Testing](#unit-testing)
    - [Integration Testing](#integration-testing)
    - [Accessibility Testing](#accessibility-testing)

<!-- TOC end -->

---

## Component Hierarchy

```text
AddSiteForm (main component)
├── FormFields Components
│   ├── FormField (reusable field wrapper)
│   ├── TextField (text/url/number inputs)
│   ├── SelectField (dropdown selection)
│   └── RadioGroup (radio button group)
├── useAddSiteForm (custom hook for state management)
└── handleSubmit (submission function from Submit.tsx)
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
 /** Form input element(s) to wrap */
 children: React.ReactNode;
 /** Error message to display */
 error?: string;
 /** Help text to show below the field */
 helpText?: string;
 /** Unique ID for the form field */
 id: string;
 /** Label text to display */
 label: string;
 /** Whether the field is required */
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
                    <ThemedText className="mt-1" size="xs" variant="tertiary">
                        {helpText}
                    </ThemedText>
                </div>
            )}
        </div>
    );
});
```

#### TextField Component

**Purpose**: Flexible text input field supporting text, URL, and number input types with validation.

**Props Interface**:

```typescript
interface TextFieldProps {
 /** Whether the field is disabled */
 disabled?: boolean;
 /** Error message to display */
 error?: string;
 /** Help text to show below the field */
 helpText?: string;
 /** Unique ID for the input field */
 id: string;
 /** Label text to display */
 label: string;
 /** Maximum value for number inputs */
 max?: number;
 /** Minimum value for number inputs */
 min?: number;
 /** Callback when value changes */
 onChange: (value: string) => void;
 /** Placeholder text for the input */
 placeholder?: string;
 /** Whether the field is required */
 required?: boolean;
 /** Input type (text, url, or number) */
 type?: "text" | "url" | "number";
 /** Current field value */
 value: string;
}
```

**Key Features**:

- **Multiple Input Types**: Supports text, URL, and number inputs
- **Validation Support**: Built-in HTML5 validation for URLs and numbers
- **Accessibility**: Full ARIA support and proper labeling
- **Range Constraints**: Min/max values for number inputs

**Usage Examples**:

```typescript
// Site name input
<TextField
    id="siteName"
    label="Site Name"
    type="text"
    value={name}
    onChange={setName}
    placeholder="My Website"
    required
/>

// URL input for HTTP monitors
<TextField
    id="websiteUrl"
    label="Website URL"
    type="url"
    value={url}
    onChange={setUrl}
    placeholder="https://example.com"
    helpText="Enter the full URL including http:// or https://"
    required
/>

// Port number input
<TextField
    id="port"
    label="Port"
    type="number"
    value={port}
    onChange={setPort}
    min={1}
    max={65535}
    placeholder="80"
    helpText="Enter a port number (1-65535)"
    required
/>
```

#### SelectField Component

**Purpose**: Dropdown selection component with customizable options.

**Props Interface**:

```typescript
interface SelectFieldProps {
 /** Whether the field is disabled */
 disabled?: boolean;
 /** Error message to display */
 error?: string;
 /** Help text to show below the field */
 helpText?: string;
 /** Unique ID for the select field */
 id: string;
 /** Label text to display */
 label: string;
 /** Callback when selection changes */
 onChange: (value: string) => void;
 /** Array of options to display in dropdown */
 options: SelectOption[];
 /** Placeholder text for empty selection */
 placeholder?: string;
 /** Whether selection is required */
 required?: boolean;
 /** Currently selected value */
 value: string | number;
}

interface SelectOption {
 /** Display text for the option */
 label: string;
 /** Value to be selected */
 value: string | number;
}
```

**Key Features**:

- **Dynamic Options**: Flexible option configuration
- **Placeholder Support**: Optional placeholder for empty state
- **Validation**: Required field validation
- **Accessibility**: Proper ARIA attributes and labeling

**Usage Examples**:

```typescript
// Monitor type selection
<SelectField
    id="monitorType"
    label="Monitor Type"
    value={monitorType}
    onChange={(value) => setMonitorType(value as "http" | "port")}
    options={[
        { label: "HTTP (Website/API)", value: "http" },
        { label: "Port (Host/Port)", value: "port" },
    ]}
/>

// Check interval selection
<SelectField
    id="checkInterval"
    label="Check Interval"
    value={checkInterval}
    onChange={(value) => setCheckInterval(Number(value))}
    options={CHECK_INTERVALS.map((interval) => ({
        label: interval.label,
        value: interval.value,
    }))}
/>

// Existing site selection
<SelectField
    id="selectedSite"
    label="Select Site"
    value={selectedExistingSite}
    onChange={setSelectedExistingSite}
    placeholder="-- Select a site --"
    options={sites.map((site) => ({
        label: site.name || site.identifier,
        value: site.identifier,
    }))}
    required
/>
```

#### RadioGroup Component

**Purpose**: Radio button group for selecting one option from multiple choices.

**Props Interface**:

```typescript
interface RadioGroupProps {
 /** Whether the radio group is disabled */
 disabled?: boolean;
 /** Error message to display */
 error?: string;
 /** Help text to show below the field */
 helpText?: string;
 /** Unique ID for the radio group */
 id: string;
 /** Label text to display */
 label: string;
 /** Name attribute for radio inputs (should be unique) */
 name: string;
 /** Callback when selection changes */
 onChange: (value: string) => void;
 /** Array of radio options to display */
 options: RadioOption[];
 /** Whether a selection is required */
 required?: boolean;
 /** Currently selected value */
 value: string;
}

interface RadioOption {
 /** Display text for the radio option */
 label: string;
 /** Value to be selected */
 value: string;
}
```

**Key Features**:

- **Keyboard Navigation**: Full keyboard accessibility
- **Single Selection**: Ensures only one option can be selected
- **Custom Styling**: Consistent theming with other form elements
- **ARIA Support**: Proper radiogroup role and attributes

**Usage Example**:

```typescript
// Add mode selection
<RadioGroup
    id="addMode"
    name="addMode"
    label="Add Mode"
    value={addMode}
    onChange={(value) => setAddMode(value as "new" | "existing")}
    options={[
        { label: "Create New Site", value: "new" },
        { label: "Add to Existing Site", value: "existing" },
    ]}
/>
```

---

## State Management Hook

### useAddSiteForm Hook

**Location**: `src/components/AddSiteForm/useAddSiteForm.ts`

**Purpose**: Custom hook that manages all form state, validation, and actions for the AddSiteForm component.

#### State Interface

```typescript
export interface AddSiteFormState {
 /** URL field for HTTP monitors */
 url: string;
 /** Host/IP field for port monitors */
 host: string;
 /** Port number field for port monitors */
 port: string;
 /** Display name for the site */
 name: string;
 /** Selected monitor type */
 monitorType: MonitorType;
 /** Check interval in milliseconds */
 checkInterval: number;
 /** Generated site identifier */
 siteId: string;
 /** Form operation mode (new site vs existing site) */
 addMode: FormMode;
 /** Selected existing site ID when adding to existing */
 selectedExistingSite: string;
 /** Current form validation error */
 formError: string | undefined;
}
```

#### Actions Interface

```typescript
export interface AddSiteFormActions {
 /** Set URL field value */
 setUrl: (value: string) => void;
 /** Set host field value */
 setHost: (value: string) => void;
 /** Set port field value */
 setPort: (value: string) => void;
 /** Set site name field value */
 setName: (value: string) => void;
 /** Set monitor type */
 setMonitorType: (value: MonitorType) => void;
 /** Set check interval */
 setCheckInterval: (value: number) => void;
 /** Set site ID */
 setSiteId: (value: string) => void;
 /** Set form operation mode */
 setAddMode: (value: FormMode) => void;
 /** Set selected existing site */
 setSelectedExistingSite: (value: string) => void;
 /** Set form error message */
 setFormError: (error: string | undefined) => void;
 /** Reset form to initial state */
 resetForm: () => void;
 /** Whether the form is currently valid */
 isFormValid: boolean;
}
```

#### Key Features

- **Auto-reset Logic**: Automatically clears fields when monitor type or add mode changes
- **UUID Generation**: Generates unique site identifiers for new sites
- **Simple Validation**: Basic form validation for submit button state
- **Memoized Functions**: Performance-optimized with useCallback

---

## Submission Handling

### handleSubmit Function

**Location**: `src/components/AddSiteForm/Submit.tsx`

**Purpose**: Comprehensive form submission handler with validation and error handling.

#### Function Signature

```typescript
export async function handleSubmit(e: React.FormEvent, props: FormSubmitProps);
```

#### Props Interface

```typescript
type FormSubmitProps = AddSiteFormState &
 Pick<AddSiteFormActions, "setFormError"> &
 StoreActions & {
  /** UUID generator function */
  generateUuid: () => string;
  /** Logger instance for debugging */
  logger: Logger;
  /** Optional callback executed after successful submission */
  onSuccess?: () => void;
 };
```

#### Validation Features

- **Mode-based Validation**: Different validation rules for new vs existing sites
- **Monitor Type Validation**: Specific validation for HTTP and port monitors
- **URL Validation**: Uses validator.js for comprehensive URL validation
- **Host/IP Validation**: Validates IP addresses and domain names
- **Port Validation**: Ensures valid port numbers (1-65535)

#### Error Handling

- **Comprehensive Logging**: Detailed error logging for debugging
- **User-friendly Messages**: Clear error messages for users
- **Validation Priority**: Shows the first validation error encountered
- **Recovery Support**: Clear error state management

---

## Main Component Integration

### AddSiteForm Component

**Location**: `src/components/AddSiteForm/AddSiteForm.tsx`

**Purpose**: Main form component that orchestrates all sub-components and handles the complete form workflow.

#### Key Features

- **Dynamic Form Fields**: Shows/hides fields based on monitor type and add mode
- **Loading States**: Provides visual feedback during submission
- **Error Display**: Integrated error display with dismissal
- **Form Reset**: Automatic form reset on successful submission
- **Accessibility**: Full keyboard navigation and screen reader support

#### Form Flow

1. **Mode Selection**: User chooses to create new site or add to existing
2. **Site Selection**: For existing sites, user selects from dropdown
3. **Monitor Configuration**: User configures monitor type and parameters
4. **Validation**: Real-time validation provides immediate feedback
5. **Submission**: Form submits with comprehensive validation
6. **Success/Error**: User receives feedback and form resets on success

---

## Validation System

### Client-Side Validation

The validation system operates at multiple levels:

#### Form-Level Validation (Submit Button)

```typescript
const isFormValid = useCallback(() => {
 // Basic check for submit button enablement only
 if (addMode === "new" && !name.trim()) return false;
 if (addMode === "existing" && !selectedExistingSite) return false;
 if (monitorType === "http" && !url.trim()) return false;
 if (monitorType === "port" && (!host.trim() || !port.trim())) return false;
 return true;
}, [addMode, name, selectedExistingSite, monitorType, url, host, port]);
```

#### Submission Validation (Comprehensive)

- **Required Field Validation**: Ensures all required fields are filled
- **Format Validation**: Validates URLs, IPs, domains, and port numbers
- **Business Logic Validation**: Ensures data consistency and constraints

### Validation Error Messages

- **Specific Messages**: Tailored error messages for each validation type
- **User-Friendly Language**: Clear, actionable error descriptions
- **Priority Display**: Shows most critical errors first

---

## Accessibility Features

### ARIA Support

```typescript
// Proper ARIA labeling
const createAriaLabel = (label: string, required: boolean): string =>
    `${label}${required ? REQUIRED_SUFFIX : ""}`;

// Error association
<ThemedInput
    aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
    aria-label={createAriaLabel(label, required)}
    aria-invalid={!!error}
    aria-required={required}
/>
```

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through form fields
- **Enter Submission**: Form submission via Enter key
- **Radio Navigation**: Arrow key navigation for radio groups
- **Focus Management**: Proper focus indicators and management

### Screen Reader Support

- **Field Descriptions**: Comprehensive field descriptions and help text
- **Error Announcements**: Errors are properly announced to screen readers
- **Required Indicators**: Clear indication of required fields
- **Form Structure**: Proper form structure and labeling

---

## Performance Optimizations

### Component Memoization

```typescript
// All form components are memoized for performance
export const FormField = React.memo(function FormField(props) {
 // Component implementation
});

export const TextField = React.memo(function TextField(props) {
 // Component implementation
});
```

### Hook Optimizations

- **useCallback**: Stable references for event handlers
- **Efficient State Updates**: Minimal re-renders during form interaction
- **Selective Validation**: Validation only when necessary

---

## Testing Considerations

### Unit Testing

- **Component Rendering**: Test all form components render correctly
- **User Interactions**: Test form field interactions and state changes
- **Validation Logic**: Test all validation scenarios
- **Error Handling**: Test error display and recovery

### Integration Testing

- **Form Submission**: Test complete form submission workflow
- **Mode Switching**: Test switching between new/existing site modes
- **Monitor Types**: Test switching between HTTP and port monitors
- **Error Recovery**: Test error handling and form reset

### Accessibility Testing

- **Keyboard Navigation**: Verify complete keyboard accessibility
- **Screen Reader**: Test with screen reader software
- **ARIA Attributes**: Validate proper ARIA implementation
- **Focus Management**: Test focus behavior and visual indicators
