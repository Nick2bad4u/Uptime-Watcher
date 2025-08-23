/**
 * Standardized component prop type definitions for consistent component
 * interfaces.
 *
 * @remarks
 * This module provides reusable TypeScript interfaces for common component prop
 * patterns used throughout the Uptime Watcher application. These types ensure
 * consistency, improve developer experience, and enable better composition of
 * component interfaces.
 *
 * @packageDocumentation
 */

import type { ReactNode } from "react";

/**
 * Core properties that most components should support.
 *
 * @remarks
 * These are the fundamental props that provide basic styling and content
 * capabilities for components.
 */
export interface CoreComponentProperties {
    /** Additional CSS classes for styling customization */
    readonly className?: string;
    /** Whether the component is disabled and non-interactive */
    readonly disabled?: boolean;
    /** Component content (text, elements, or other components) */
    readonly children?: ReactNode;
}

/**
 * Accessibility properties following ARIA standards.
 *
 * @remarks
 * These props provide essential accessibility support for screen readers and
 * other assistive technologies.
 */
export interface AccessibilityProperties {
    /** ARIA label for screen readers */
    readonly "aria-label"?: string;
    /** ARIA described-by reference for additional descriptions */
    readonly "aria-describedby"?: string;
    /** ARIA labelledby reference for complex labeling */
    readonly "aria-labelledby"?: string;
    /** Role attribute for semantic meaning */
    readonly role?: string;
    /** Tab index for keyboard navigation */
    readonly tabIndex?: number;
}

/**
 * Standard size variants used across components.
 */
export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Standard visual variants for component theming.
 */
export type ComponentVariant =
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "ghost";

/**
 * Styling and theming properties.
 *
 * @remarks
 * These props control the visual appearance and behavior of components,
 * providing consistent theming across the application.
 */
export interface StylingProperties {
    /** Size variant for the component */
    readonly size?: ComponentSize;
    /** Visual variant for component theming */
    readonly variant?: ComponentVariant;
    /** Whether component should take full width of its container */
    readonly fullWidth?: boolean;
    /** Inline styles to apply (use sparingly) */
    readonly style?: React.CSSProperties;
}

/**
 * Component state properties.
 *
 * @remarks
 * These props represent common state indicators that components may need to
 * display visually.
 */
export interface StateProperties {
    /** Whether the component is in a loading state */
    readonly loading?: boolean;
    /** Whether the component is in an active state */
    readonly active?: boolean;
    /** Whether the component is selected */
    readonly selected?: boolean;
}

/**
 * Form field properties for input components.
 *
 * @remarks
 * These props provide the essential form field functionality including
 * labeling, validation, and help text support.
 */
export interface FormFieldProperties {
    /** Unique identifier for the field (required for accessibility) */
    readonly id: string;
    /** Label text to display for the field */
    readonly label: string;
    /** Whether the field is required for form submission */
    readonly required?: boolean;
    /** Error message to display when validation fails */
    readonly error?: string;
    /** Help text to provide guidance to users */
    readonly helpText?: string;
}

/**
 * Icon integration properties.
 *
 * @remarks
 * These props provide consistent icon integration patterns across components
 * that support icon display.
 */
export interface IconProperties {
    /** Icon element to display */
    readonly icon?: ReactNode;
    /** Position of the icon relative to content */
    readonly iconPosition?: "left" | "right";
    /** Color theme for the icon */
    readonly iconColor?: string;
    /** Whether to show only the icon (hide text content) */
    readonly iconOnly?: boolean;
}

/**
 * Event handler types for consistent event handling patterns.
 */
export namespace EventHandlers {
    /** Simple click handler for basic interactions */
    export type Click = () => void;

    /** Click handler with event object when event details are needed */
    export type ClickWithEvent<TElement extends HTMLElement = HTMLElement> = (
        event: React.MouseEvent<TElement>
    ) => void;

    /** Flexible click handler supporting both event and no-event patterns */
    export type ClickFlexible<TElement extends HTMLElement = HTMLElement> =
        | ((event: React.MouseEvent<TElement>) => void)
        | (() => void);

    /** Value-based change handler for form components */
    export type Change = (value: string) => void;

    /** Event-based change handler for low-level input components */
    export type ChangeWithEvent<
        TElement extends
            | HTMLInputElement
            | HTMLSelectElement = HTMLInputElement,
    > = (event: React.ChangeEvent<TElement>) => void;

    /** Form submission handler */
    export type Submit = (event: React.FormEvent<HTMLFormElement>) => void;

    /** Focus handler for input components */
    export type Focus<TElement extends HTMLElement = HTMLElement> = (
        event: React.FocusEvent<TElement>
    ) => void;

    /** Blur handler for input components */
    export type Blur<TElement extends HTMLElement = HTMLElement> = (
        event: React.FocusEvent<TElement>
    ) => void;

    /** Key press handler for keyboard interactions */
    export type KeyPress<TElement extends HTMLElement = HTMLElement> = (
        event: React.KeyboardEvent<TElement>
    ) => void;
}

/**
 * Button-specific properties combining common patterns.
 *
 * @remarks
 * This interface combines the most common props needed for button components,
 * serving as a standard template.
 */
export interface StandardButtonProperties
    extends CoreComponentProperties,
        AccessibilityProperties,
        StylingProperties,
        StateProperties,
        IconProperties {
    /** Click handler for button interactions */
    readonly onClick?: EventHandlers.Click;
    /** HTML button type */
    readonly type?: "button" | "submit" | "reset";
    /** Tooltip text for hover states */
    readonly title?: string;
}

/**
 * Input field properties combining form and interaction patterns.
 *
 * @remarks
 * This interface provides a standard template for input components with
 * consistent typing and behavior patterns.
 */
export interface StandardInputProperties
    extends CoreComponentProperties,
        AccessibilityProperties,
        FormFieldProperties {
    /** Current input value */
    readonly value: string;
    /** Value change handler */
    readonly onChange: EventHandlers.Change;
    /** Placeholder text for empty inputs */
    readonly placeholder?: string;
    /** Input type for different input behaviors */
    readonly type?: "text" | "email" | "url" | "password" | "number";
    /** Focus event handler */
    readonly onFocus?: EventHandlers.Focus<HTMLInputElement>;
    /** Blur event handler */
    readonly onBlur?: EventHandlers.Blur<HTMLInputElement>;
}

/**
 * Select field properties for dropdown components.
 *
 * @remarks
 * This interface provides a standard template for select/dropdown components
 * with consistent option handling.
 */
export interface StandardSelectProperties
    extends CoreComponentProperties,
        AccessibilityProperties,
        FormFieldProperties {
    /** Currently selected value */
    readonly value: string;
    /** Selection change handler */
    readonly onChange: EventHandlers.Change;
    /** Available options for selection */
    readonly options: readonly SelectOption[];
    /** Placeholder text when no option is selected */
    readonly placeholder?: string;
    /** Whether multiple selections are allowed */
    readonly multiple?: boolean;
}

/**
 * Option definition for select components.
 */
export interface SelectOption {
    /** Unique value for the option */
    readonly value: string;
    /** Display label for the option */
    readonly label: string;
    /** Whether this option is disabled */
    readonly disabled?: boolean;
    /** Optional group for organizing options */
    readonly group?: string;
}

/**
 * Checkbox/radio input properties.
 *
 * @remarks
 * This interface provides a standard template for boolean input components like
 * checkboxes and radio buttons.
 */
export interface StandardCheckableProperties
    extends CoreComponentProperties,
        AccessibilityProperties {
    /** Unique identifier for the input */
    readonly id: string;
    /** Label text for the input */
    readonly label: string;
    /** Whether the input is checked */
    readonly checked: boolean;
    /** Check state change handler */
    readonly onChange: (checked: boolean) => void;
    /** Input name for form grouping */
    readonly name?: string;
    /** Input value attribute */
    readonly value?: string;
}

/**
 * Card/container component properties.
 *
 * @remarks
 * This interface provides a standard template for container components like
 * cards, panels, and boxes.
 */
export interface StandardContainerProperties
    extends CoreComponentProperties,
        AccessibilityProperties,
        StylingProperties {
    /** Optional click handler for interactive containers */
    readonly onClick?: EventHandlers.Click;
    /** Whether the container has elevated styling */
    readonly elevated?: boolean;
    /** Whether the container has border styling */
    readonly bordered?: boolean;
    /** Padding variant for internal spacing */
    readonly padding?: ComponentSize;
}

/**
 * Modal/dialog component properties.
 *
 * @remarks
 * This interface provides a standard template for modal and dialog components
 * with proper accessibility support.
 */
export interface StandardModalProperties
    extends CoreComponentProperties,
        AccessibilityProperties {
    /** Whether the modal is currently open */
    readonly open: boolean;
    /** Handler called when modal should close */
    readonly onClose: () => void;
    /** Modal title for accessibility */
    readonly title: string;
    /** Whether clicking outside closes the modal */
    readonly closeOnOutsideClick?: boolean;
    /** Whether pressing escape closes the modal */
    readonly closeOnEscape?: boolean;
    /** Size variant for the modal */
    readonly size?: ComponentSize;
}

/**
 * Data display component properties for lists, tables, etc.
 *
 * @remarks
 * This interface provides a standard template for components that display
 * collections of data.
 */
export interface StandardDataDisplayProperties<TItem>
    extends CoreComponentProperties,
        AccessibilityProperties {
    /** Data items to display */
    readonly items: readonly TItem[];
    /** Render function for individual items */
    readonly renderItem: (item: TItem, index: number) => ReactNode;
    /** Optional empty state content */
    readonly emptyContent?: ReactNode;
    /** Loading state indicator */
    readonly loading?: boolean;
    /** Error state content */
    readonly error?: string;
    /** Key extractor for React list optimization */
    readonly keyExtractor?: (item: TItem, index: number) => string | number;
}

/**
 * Utility type for creating component properties with specific overrides.
 *
 * @remarks
 * This utility allows creating component prop interfaces by combining standard
 * interfaces with component-specific overrides.
 *
 * @example
 *
 * ```typescript
 * type MyButtonProps = ComponentProperties<
 *     StandardButtonProperties,
 *     {
 *         readonly customProp: string;
 *         readonly onClick: () => Promise<void>; // Override default onClick
 *     }
 * >;
 * ```
 */
export type ComponentProperties<TBase, TOverrides = {}> = Omit<
    TBase,
    keyof TOverrides
> &
    TOverrides;

/**
 * Utility type for making certain properties required.
 *
 * @example
 *
 * ```typescript
 * type RequiredButtonProps = RequireProperties<
 *     StandardButtonProperties,
 *     "onClick"
 * >;
 * ```
 */
export type RequireProperties<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility type for making certain properties optional.
 *
 * @example
 *
 * ```typescript
 * type OptionalLabelProps = OptionalProperties<
 *     FormFieldProperties,
 *     "label"
 * >;
 * ```
 */
export type OptionalProperties<T, K extends keyof T> = Omit<T, K> &
    Partial<Pick<T, K>>;
