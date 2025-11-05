# Component Props Standards

## 📋 __Overview__

This document establishes standardized prop patterns for React components in the Uptime Watcher application to ensure consistency, maintainability, and improved developer experience.

## 🎯 __Standardization Goals__

* __Consistency__: Uniform prop patterns across all components
* __Type Safety__: Strong TypeScript typing with predictable interfaces
* __Accessibility__: Built-in accessibility support through standardized props
* __Developer Experience__: Predictable API patterns and clear documentation
* __Maintainability__: Easier refactoring and component composition

***

## 🏗️ __Core Prop Patterns__

### __1. Interface Naming Convention__

__Standard__: Use `Properties` suffix for all component prop interfaces

```typescript
// ✅ Correct
export interface ButtonProperties {
 readonly onClick?: () => void;
}

// ❌ Avoid
export interface ButtonProps {
 onClick?: () => void;
}
```

__Rationale__:

* Consistency with existing codebase patterns
* Clearer distinction from React's built-in `Props` types
* Better alignment with TypeScript conventions

***

### __2. Property Mutability__

__Standard__: All props should be `readonly` to prevent accidental mutations

```typescript
// ✅ Correct
export interface ComponentProperties {
 readonly title: string;
 readonly disabled?: boolean;
 readonly onClick?: () => void;
}

// ❌ Avoid
export interface ComponentProperties {
 title: string;
 disabled?: boolean;
 onClick?: () => void;
}
```

__Rationale__:

* Prevents accidental mutations of props
* Encourages immutable data patterns
* Better TypeScript safety

***

### __3. Event Handler Patterns__

#### __Click Events__

__Standard__: Use simple function signatures for click handlers unless event object is needed

```typescript
// ✅ Preferred (simple actions)
export interface SimpleButtonProperties {
 readonly onClick?: () => void;
}

// ✅ Acceptable (when event object is needed)
export interface EventButtonProperties {
 readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// ❌ Avoid optional event parameters
export interface BadButtonProperties {
 readonly onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
}
```

#### __Change Events__

__Standard__: Use value-based handlers for form components, event-based for low-level components

```typescript
// ✅ Form Components (high-level, value-focused)
export interface FormFieldBaseProperties {
 readonly onChange: (value: string) => void;
}

// ✅ Themed Components (low-level, event-focused)
export interface ThemedInputProperties {
 readonly onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
```

#### __Submit Events__

__Standard__: Always include event object for form submissions

```typescript
// ✅ Correct
export interface FormProperties {
 readonly onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}
```

***

### __4. Common Prop Categories__

#### __Core Props__ (Present in most components)

```typescript
export interface CoreComponentProperties {
 /** Additional CSS classes for styling customization */
 readonly className?: string;
 /** Whether the component is disabled */
 readonly disabled?: boolean;
 /** Component content */
 readonly children?: React.ReactNode;
}
```

#### __Accessibility Props__

```typescript
export interface AccessibilityProperties {
 /** ARIA label for screen readers */
 readonly "aria-label"?: string;
 /** ARIA described-by reference */
 readonly "aria-describedby"?: string;
 /** ARIA labelledby reference */
 readonly "aria-labelledby"?: string;
 /** Role attribute for semantic meaning */
 readonly role?: string;
}
```

#### __Form Props__

```typescript
export interface FormFieldBaseProperties {
 /** Unique identifier for the field */
 readonly id: string;
 /** Field label text */
 readonly label: string;
 /** Whether the field is required */
 readonly required?: boolean;
 /** Error message to display */
 readonly error?: string;
 /** Help text for guidance */
 readonly helpText?: string;
}
```

#### __Styling Props__

```typescript
export interface StylingProperties {
 /** Size variant */
 readonly size?: "xs" | "sm" | "md" | "lg" | "xl";
 /** Visual variant */
 readonly variant?: "primary" | "secondary" | "danger" | "success" | "warning";
 /** Whether component takes full width */
 readonly fullWidth?: boolean;
}
```

#### __State Props__

```typescript
export interface StateProperties {
 /** Loading state indicator */
 readonly loading?: boolean;
 /** Whether component is in an active state */
 readonly active?: boolean;
 /** Whether component is selected */
 readonly selected?: boolean;
}
```

***

## 📏 __Size and Variant Standards__

### __Size Options__

__Standard sizes__: `"xs" | "sm" | "md" | "lg" | "xl"`

```typescript
// ✅ Standard size variants
export interface SizedComponentProperties {
 readonly size?: "xs" | "sm" | "md" | "lg" | "xl";
}

// Default: "md"
```

### __Visual Variants__

__Standard variants__: `"primary" | "secondary" | "danger" | "success" | "warning" | "ghost"`

```typescript
// ✅ Standard visual variants
export interface VariantComponentProperties {
 readonly variant?:
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "warning"
  | "ghost";
}

// Default: "primary"
```

***

## 🧩 __Composition Patterns__

### __Prop Interface Composition__

__Standard__: Compose interfaces using intersection types rather than extension

```typescript
// ✅ Preferred (composition)
export interface ButtonProperties
 extends CoreComponentProperties,
  AccessibilityProperties,
  StylingProperties,
  StateProperties {
 readonly onClick?: () => void;
 readonly type?: "button" | "submit" | "reset";
}

// ✅ Also acceptable (intersection)
export type ButtonProperties = CoreComponentProperties &
 AccessibilityProperties &
 StylingProperties &
 StateProperties & {
  readonly onClick?: () => void;
  readonly type?: "button" | "submit" | "reset";
 };
```

### __Icon Integration__

__Standard__: Consistent icon prop patterns across components

```typescript
export interface IconComponentProperties {
 /** Icon element to display */
 readonly icon?: React.ReactNode;
 /** Icon position relative to content */
 readonly iconPosition?: "left" | "right";
 /** Icon color theme */
 readonly iconColor?: string;
}
```

***

## 📝 __Documentation Standards__

### __Property Documentation__

__Standard__: Use TSDoc comments with clear descriptions

````typescript
export interface ComponentProperties {
 /**
  * Primary action handler for the component.
  *
  * @remarks
  * Called when user interacts with the component. Should handle any necessary
  * validation or state updates.
  *
  * @example
  *
  * ```tsx
  * <Component onClick={() => console.log("Clicked!")} />;
  * ```
  */
 readonly onClick?: () => void;

 /**
  * Visual size variant for the component.
  *
  * @defaultValue "md"
  */
 readonly size?: "xs" | "sm" | "md" | "lg" | "xl";
}
````

### __Component Documentation__

__Standard__: Include comprehensive examples and usage patterns

````typescript
/**
 * Button component with theming, states, and accessibility support.
 *
 * @remarks
 * Provides a comprehensive button implementation with various visual variants,
 * sizes, loading states, and full accessibility support.
 *
 * @example Basic usage:
 *
 * ```tsx
 * <Button onClick={handleClick}>Click me</Button>;
 * ```
 *
 * @example With loading state:
 *
 * ```tsx
 * <Button
 *  onClick={handleSubmit}
 *  loading={isSubmitting}
 *  disabled={!isValid}
 * >
 *  Submit Form
 * </Button>;
 * ```
 *
 * @public
 */
````

***

## 🎨 __Implementation Templates__

### __Basic Component Template__

````typescript

/**
 * [Component] - [brief description]
 *
 * @remarks
 * [Detailed description of component purpose and features]
 *
 * @example
 *
 * ```tsx
 * <ComponentName prop="value" />;
 * ```
 */

import React from "react";

/**
 * Properties for the [Component] component.
 */
export interface ComponentNameProperties
 extends CoreComponentProperties,
  AccessibilityProperties {
 /** Component-specific props */
 readonly specificProp?: string;
 /** Event handlers */
 readonly onClick?: () => void;
}

/**
 * [Component description]
 *
 * @param props - Component properties
 *
 * @returns JSX element
 */
export const ComponentName: React.FC<ComponentNameProperties> = React.memo(
 ({
  className,
  disabled = false,
  children,
  specificProp,
  onClick,
  ...accessibilityProps
 }) => {
  // Component implementation
  return (
   <div className={className} {...accessibilityProps}>
    {children}
   </div>
  );
 }
);

ComponentName.displayName = "ComponentName";

export default ComponentName;
````

### __Form Component Template__

```typescript
/**
 * [FormComponent] - [description]
 */

import React, { useCallback } from "react";

export interface FormComponentProperties
 extends FormFieldBaseProperties,
  CoreComponentProperties {
 /** Current value */
 readonly value: string;
 /** Change handler */
 readonly onChange: (value: string) => void;
 /** Component-specific props */
 readonly placeholder?: string;
}

export const FormComponent: React.FC<FormComponentProperties> = React.memo(
 ({
  id,
  label,
  value,
  onChange,
  required = false,
  error,
  helpText,
  placeholder,
  disabled = false,
  className,
 }) => {
  const handleChange = useCallback(
   (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
   },
   [onChange]
  );

  return (
   <BaseFormField
    id={id}
    label={label}
    required={required}
    error={error}
    helpText={helpText}
   >
    {(ariaProps) => (
     <input
      {...ariaProps}
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
     />
    )}
   </BaseFormField>
  );
 }
);

FormComponent.displayName = "FormComponent";

export default FormComponent;
```

***

## ✅ __Compliance Checklist__

### __Interface Design__

* [ ] Uses `Properties` suffix for prop interfaces
* [ ] All props marked as `readonly`
* [ ] Proper TSDoc documentation for all props
* [ ] Consistent event handler signatures
* [ ] Appropriate use of optional vs required props

### __Event Handlers__

* [ ] Simple `() => void` for basic actions
* [ ] Event object included when needed
* [ ] Consistent naming (onClick, onChange, onSubmit)
* [ ] Value-based handlers for form components

### __Accessibility__

* [ ] Appropriate ARIA props included
* [ ] Screen reader considerations
* [ ] Keyboard navigation support
* [ ] Focus management

### __Documentation__

* [ ] Component purpose clearly documented
* [ ] Usage examples provided
* [ ] Props documented with descriptions
* [ ] Default values specified

### __Type Safety__

* [ ] Strong TypeScript typing
* [ ] No `any` types used
* [ ] Proper generic constraints
* [ ] Interface composition over inheritance

***

## 🔧 __Migration Guide__

### __Updating Existing Components__

1. __Interface Naming__:

   ```typescript
   // Before
   interface ButtonProps {
    onClick?: () => void;
   }

   // After
   interface ButtonProperties {
    readonly onClick?: () => void;
   }
   ```

2. __Event Handlers__:

   ```typescript
   // Before
   readonly onClick?: (e?: React.MouseEvent) => void;

   // After
   readonly onClick?: () => void;
   // OR (if event needed)
   readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
   ```

3. __Property Mutability__:

   ```typescript
   // Before
   interface ComponentProps {
    title: string;
    disabled?: boolean;
   }

   // After
   interface ComponentProperties {
    readonly title: string;
    readonly disabled?: boolean;
   }
   ```

***

## 📚 __Related Documentation__

* [UI Feature Development Guide](../../Guides/UI_FEATURE_DEVELOPMENT_GUIDE.md)
* [Development Patterns Guide](./DEVELOPMENT_PATTERNS_GUIDE.md)
* [Using This Documentation](../UsageGuides/Using-This-Documentation.md)
* [TSDoc Standards](../TSDOC_STANDARDS.md)

***

## Current Implementation Audit (2025-11-04)

* Surveyed component modules under `src/components/` (e.g., `FormControls`, `MonitorList`, `SiteDetails`) to confirm prop interfaces follow the `Properties` suffix and readonly members highlighted above.
* Checked shared UI utilities in `src/utils/react` to ensure handler helpers continue to expose strongly typed callbacks without leaking DOM event types unnecessarily.
* Verified lint rules (`.eslintrc` flat config and `eslint-plugin-react-naming-convention`) still enforce the naming and mutability guarantees described in this standard.

***

*This document should be reviewed and updated as new patterns emerge or requirements change. All new components must follow these standards for consistency.*
