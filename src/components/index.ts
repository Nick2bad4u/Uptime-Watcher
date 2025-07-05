/**
 * Components barrel export.
 * Provides centralized access to all application components.
 */

// Common reusable components
export * from "./common";

// Main application components
export { Header } from "./Header/Header";
export { Settings } from "./Settings/Settings";

// Site management components
export { AddSiteForm } from "./AddSiteForm/AddSiteForm";
export { FormField, TextField, SelectField, RadioGroup } from "./AddSiteForm/FormFields";
export type {
    FormFieldProps,
    TextFieldProps,
    SelectOption,
    SelectFieldProps,
    RadioOption,
    RadioGroupProps,
} from "./AddSiteForm/FormFields";
export { handleSubmit } from "./AddSiteForm/Submit";
export { useAddSiteForm } from "./AddSiteForm/useAddSiteForm";

// Site details components
export * from "./SiteDetails";

// Dashboard components (access through their respective directories)
// Note: Dashboard components are accessed directly from their subdirectories
// as they're context-specific and not commonly reused across the app
