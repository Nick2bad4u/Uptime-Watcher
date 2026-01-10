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

import type {
    ChangeEvent,
    CSSProperties,
    FocusEvent,
    FormEvent,
    KeyboardEvent,
    MouseEvent,
    ReactNode,
} from "react";
import type { SetOptional, SetRequired, UnknownRecord } from "type-fest";

/**
 * Core set of structural properties shared by many UI components.
 *
 * @remarks
 * Establishes common behavioral flags such as `disabled` and standard wrapper
 * attributes that most interactive primitives expose.
 *
 * @public
 */
export interface CoreComponentProperties {
    /** Component content (text, elements, or other components) */
    readonly children?: ReactNode;
    /** Additional CSS classes for styling customization */
    readonly className?: string;
    /** Whether the component is disabled and non-interactive */
    readonly disabled?: boolean;
}

/**
 * DOM identity properties commonly forwarded to native elements.
 *
 * @remarks
 * `id` is frequently needed for accessibility, automation, and integration with
 * browser APIs.
 *
 * @public
 */
export interface DomIdentityProperties {
    /** Optional DOM id forwarded to the underlying element. */
    readonly id?: string;
}

/**
 * Strongly-typed `data-*` attributes for automation and diagnostics.
 *
 * @remarks
 * These are intentionally limited to JSON-serializable primitives. React will
 * stringify these values when emitting to the DOM.
 *
 * @public
 */
export type DataAttributeProperties = Readonly<
    Partial<Record<`data-${string}`, boolean | number | string | undefined>>
>;


/**
 * Accessibility properties following ARIA standards.
 *
 * @remarks
 * These props provide essential accessibility support for screen readers and
 * other assistive technologies.
 *
 * @public
 */
export interface AccessibilityProperties {
    /** ARIA described-by reference for additional descriptions */
    readonly "aria-describedby"?: string;
    /** ARIA disabled state for interactive controls that are visually disabled */
    readonly "aria-disabled"?: boolean;
    /** ARIA label for screen readers */
    readonly "aria-label"?: string;
    /** ARIA labelledby reference for complex labeling */
    readonly "aria-labelledby"?: string;
    /** ARIA heading level for elements using role="heading" */
    readonly "aria-level"?: number;
    /** Role attribute for semantic meaning */
    readonly role?: string;
    /** Tab index for keyboard navigation */
    readonly tabIndex?: number;
}

/**
 * Standard size variants used across components.
 *
 * @public
 */
export type ComponentSize = "lg" | "md" | "sm" | "xl" | "xs";

/**
 * Standard visual variants for component theming.
 *
 * @public
 */
export type ComponentVariant =
    | "danger"
    | "ghost"
    | "primary"
    | "secondary"
    | "success"
    | "warning";

/**
 * Styling and theming properties.
 *
 * @remarks
 * These props control the visual appearance and behavior of components,
 * providing consistent theming across the application.
 *
 * @public
 */
export interface StylingProperties {
    /** Whether component should take full width of its container */
    readonly fullWidth?: boolean;
    /** Size variant for the component */
    readonly size?: ComponentSize;
    /** Inline styles to apply (use sparingly) */
    readonly style?: CSSProperties;
    /** Visual variant for component theming */
    readonly variant?: ComponentVariant;
}

/**
 * Component state properties.
 *
 * @remarks
 * These props represent common state indicators that components may need to
 * display visually.
 *
 * @public
 */
export interface StateProperties {
    /** Whether the component is in an active state */
    readonly active?: boolean;
    /** Whether the component is in a loading state */
    readonly loading?: boolean;
    /** Whether the component is selected */
    readonly selected?: boolean;
}

/**
 * Base form field properties for input components.
 *
 * @remarks
 * These props provide the essential form field functionality including
 * labeling, validation, and help text support. This serves as a base interface
 * that can be extended by components requiring additional properties like
 * children.
 *
 * @public
 */
export interface FormFieldBaseProperties {
    /** Error message to display when validation fails */
    readonly error?: string;
    /** Help text to provide guidance to users */
    readonly helpText?: string;
    /** Unique identifier for the field (required for accessibility) */
    readonly id: string;
    /** Label text to display for the field */
    readonly label: string;
    /** Whether the field is required for form submission */
    readonly required?: boolean;
}

/**
 * Icon-related properties for components that support icon rendering.
 *
 * @remarks
 * These props provide consistent icon integration patterns across components
 * that support icon display.
 *
 * @public
 */
export interface IconProperties {
    /** Icon element to display */
    readonly icon?: ReactNode;
    /** Color theme for the icon */
    readonly iconColor?: string;
    /** Whether to show only the icon (hide text content) */
    readonly iconOnly?: boolean;
    /** Position of the icon relative to content */
    readonly iconPosition?: "left" | "right";
}

/**
 * Event handler types for consistent event handling patterns.
 */

/**
 * Simple click handler for basic interactions.
 *
 * @public
 */
export type ClickHandler = () => void;

/**
 * Click handler with event object when event details are needed.
 *
 * @public
 */
export type ClickWithEventHandler<TElement extends HTMLElement = HTMLElement> =
    (event: MouseEvent<TElement>) => void;

/**
 * Flexible click handler supporting both event and no-event patterns.
 *
 * @public
 */
export type ClickFlexibleHandler<TElement extends HTMLElement = HTMLElement> =
    | (() => void)
    | ((event: MouseEvent<TElement>) => void);

/**
 * Value-based change handler for form components.
 *
 * @public
 */
export type ChangeHandler = (value: string) => void;

/**
 * Event-based change handler for low-level input components.
 *
 * @public
 */
export type ChangeWithEventHandler<
    TElement extends HTMLInputElement | HTMLSelectElement = HTMLInputElement,
> = (event: ChangeEvent<TElement>) => void;

/**
 * Centralized namespace for event handler types to ensure consistency.
 *
 * @remarks
 * This namespace provides convenient access to all event handler types used
 * throughout the application. It promotes consistency and makes it easier to
 * discover available handler types.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace -- Namespace provides organized access to event handler types for better developer experience and API consistency
export namespace EventHandlers {
    /**
     * Click handler with event object when event details are needed.
     *
     * @public
     */
    export type ClickWithEvent<TElement extends HTMLElement = HTMLElement> =
        ClickWithEventHandler<TElement>;

    /**
     * Flexible click handler supporting both event and no-event patterns.
     *
     * @public
     */
    export type ClickFlexible<TElement extends HTMLElement = HTMLElement> =
        ClickFlexibleHandler<TElement>;

    /**
     * Event-based change handler for low-level input components.
     *
     * @public
     */
    export type ChangeWithEvent<
        TElement extends HTMLInputElement | HTMLSelectElement =
            HTMLInputElement,
    > = ChangeWithEventHandler<TElement>;

    /**
     * Focus handler for input components.
     *
     * @public
     */
    export type Focus<TElement extends HTMLElement = HTMLElement> =
        FocusHandler<TElement>;

    /**
     * Blur handler for input components.
     *
     * @public
     */
    export type Blur<TElement extends HTMLElement = HTMLElement> =
        BlurHandler<TElement>;

    /**
     * Key press handler for keyboard interactions.
     *
     * @public
     */
    export type KeyPress<TElement extends HTMLElement = HTMLElement> =
        KeyPressHandler<TElement>;
}

/**
 * Form submission handler.
 *
 * @public
 */
export type SubmitHandler = (event: FormEvent<HTMLFormElement>) => void;

/**
 * Focus handler for input components.
 *
 * @public
 */
export type FocusHandler<TElement extends HTMLElement = HTMLElement> = (
    event: FocusEvent<TElement>
) => void;

/**
 * Blur handler for input components.
 *
 * @public
 */
export type BlurHandler<TElement extends HTMLElement = HTMLElement> = (
    event: FocusEvent<TElement>
) => void;

/**
 * Key press handler for keyboard interactions.
 *
 * @public
 */
export type KeyPressHandler<TElement extends HTMLElement = HTMLElement> = (
    event: KeyboardEvent<TElement>
) => void;

/**
 * Button-specific properties combining common patterns.
 *
 * @remarks
 * This interface combines the most common props needed for button components,
 * serving as a standard template.
 *
 * @public
 */
export interface StandardButtonProperties
    extends
        AccessibilityProperties,
        CoreComponentProperties,
        DataAttributeProperties,
        DomIdentityProperties,
        IconProperties,
        StateProperties,
        StylingProperties {
    /**
     * Optional form id to associate the button with an external <form>.
     *
     * @remarks
     * This enables submit/reset buttons to live outside the form element (e.g.
     * in a dialog footer) while still triggering form submission.
     */
    readonly form?: string;
    /** Click handler for button interactions */
    readonly onClick?: ClickHandler;
    /** Tooltip text for hover states */
    readonly title?: string;
    /** HTML button type */
    readonly type?: "button" | "reset" | "submit";
    /**
     * Optional string value assigned to the underlying HTML button.
     *
     * @remarks
     * This is useful when a shared click handler needs to identify which button
     * was clicked without relying on `data-*` attributes.
     */
    readonly value?: string;
}

/**
 * Input field properties combining form and interaction patterns.
 *
 * @remarks
 * This interface provides a standard template for input components with
 * consistent typing and behavior patterns.
 *
 * @public
 */
export interface StandardInputProperties
    extends
        AccessibilityProperties,
        CoreComponentProperties,
        FormFieldBaseProperties {
    /** Blur event handler */
    readonly onBlur?: BlurHandler<HTMLInputElement>;
    /** Value change handler */
    readonly onChange: ChangeHandler;
    /** Focus event handler */
    readonly onFocus?: FocusHandler<HTMLInputElement>;
    /** Placeholder text for empty inputs */
    readonly placeholder?: string;
    /** Input type for different input behaviors */
    readonly type?: "email" | "number" | "password" | "text" | "url";
    /** Current input value */
    readonly value: string;
}

/**
 * Select field properties for dropdown components.
 *
 * @remarks
 * This interface provides a standard template for select/dropdown components
 * with consistent option handling.
 *
 * @public
 */
export interface StandardSelectProperties
    extends
        AccessibilityProperties,
        CoreComponentProperties,
        FormFieldBaseProperties {
    /** Whether multiple selections are allowed */
    readonly multiple?: boolean;
    /** Selection change handler */
    readonly onChange: ChangeHandler;
    /** Available options for selection */
    readonly options: readonly SelectOption[];
    /** Placeholder text when no option is selected */
    readonly placeholder?: string;
    /** Currently selected value */
    readonly value: string;
}

/**
 * Option definition for select components.
 *
 * @public
 */
export interface SelectOption {
    /** Whether this option is disabled */
    readonly disabled?: boolean;
    /** Optional group for organizing options */
    readonly group?: string;
    /** Display label for the option */
    readonly label: string;
    /** Unique value for the option */
    readonly value: string;
}

/**
 * Checkbox/radio input properties.
 *
 * @remarks
 * This interface provides a standard template for boolean input components like
 * checkboxes and radio buttons.
 *
 * @public
 */
export interface StandardCheckableProperties
    extends AccessibilityProperties, CoreComponentProperties {
    /** Whether the input is checked */
    readonly checked: boolean;
    /** Unique identifier for the input */
    readonly id: string;
    /** Label text for the input */
    readonly label: string;
    /** Input name for form grouping */
    readonly name?: string;
    /** Check state change handler */
    readonly onChange: (checked: boolean) => void;
    /** Input value attribute */
    readonly value?: string;
}

/**
 * Card/container component properties.
 *
 * @remarks
 * This interface provides a standard template for container components like
 * cards, panels, and boxes.
 *
 * @public
 */
export interface StandardContainerProperties
    extends
        AccessibilityProperties,
        CoreComponentProperties,
        StylingProperties {
    /** Whether the container has border styling */
    readonly bordered?: boolean;
    /** Whether the container has elevated styling */
    readonly elevated?: boolean;
    /** Optional click handler for interactive containers */
    readonly onClick?: ClickHandler;
    /** Padding variant for internal spacing */
    readonly padding?: ComponentSize;
}

/**
 * Modal/dialog component properties.
 *
 * @remarks
 * This interface provides a standard template for modal and dialog components
 * with proper accessibility support.
 *
 * @public
 */
export interface StandardModalProperties
    extends AccessibilityProperties, CoreComponentProperties {
    /** Whether pressing escape closes the modal */
    readonly closeOnEscape?: boolean;
    /** Whether clicking outside closes the modal */
    readonly closeOnOutsideClick?: boolean;
    /** Handler called when modal should close */
    readonly onClose: () => void;
    /** Whether the modal is currently open */
    readonly open: boolean;
    /** Size variant for the modal */
    readonly size?: ComponentSize;
    /** Modal title for accessibility */
    readonly title: string;
}

/**
 * Data display component properties for lists, tables, etc.
 *
 * @remarks
 * This interface provides a standard template for components that display
 * collections of data.
 *
 * @public
 */
export interface StandardDataDisplayProperties<TItem>
    extends AccessibilityProperties, CoreComponentProperties {
    /** Optional empty state content */
    readonly emptyContent?: ReactNode;
    /** Error state content */
    readonly error?: string;
    /** Data items to display */
    readonly items: readonly TItem[];
    /** Key extractor for React list optimization */
    readonly keyExtractor?: (item: TItem, index: number) => number | string;
    /** Loading state indicator */
    readonly loading?: boolean;
    /** Render function for individual items */
    readonly renderItem: (item: TItem, index: number) => ReactNode;
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
 *
 * @public
 */
export type ComponentProperties<TBase, TOverrides = UnknownRecord> = Omit<
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
 *
 * @public
 */
export type RequireProperties<T, K extends keyof T> = SetRequired<T, K>;

/**
 * Utility type for making certain properties optional.
 *
 * @example
 *
 * ```typescript
 * type OptionalLabelProps = OptionalProperties<
 *     FormFieldBaseProperties,
 *     "label"
 * >;
 * ```
 *
 * @public
 */
export type OptionalProperties<T, K extends keyof T> = SetOptional<T, K>;
