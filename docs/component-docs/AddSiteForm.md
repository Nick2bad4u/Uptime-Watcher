# AddSiteForm Component Documentation

## Overview

`AddSiteForm` is a modular React component system responsible for adding new websites to monitor in the Uptime Watcher application. It follows a modular architecture with separate files for different concerns, fully integrated with the app's state management (Zustand) and theming system.

---

## Location & Structure

The AddSiteForm is organized as a component module:

- **Main Component:** `src/components/AddSiteForm/AddSiteForm.tsx`
- **Form Fields:** `src/components/AddSiteForm/FormFields.tsx`
- **Submit Logic:** `src/components/AddSiteForm/Submit.tsx`
- **Custom Hook:** `src/components/AddSiteForm/useAddSiteForm.ts`

---

## Architecture

The component follows a modular architecture pattern:

### 1. **AddSiteForm.tsx** - Main Container

- Orchestrates the overall form layout and structure
- Handles theme integration and styling
- Manages error display and loading states

### 2. **FormFields.tsx** - Reusable Input Components

- Provides reusable form components (TextField, SelectField, RadioGroup, FormField)
- Handles consistent styling and accessibility for form inputs
- Integrates with themed components for visual consistency

### 3. **Submit.tsx** - Form Submission Logic

- Contains the `handleSubmit` function for form processing
- Implements comprehensive validation logic
- Handles error messaging and success callbacks

### 4. **useAddSiteForm.ts** - State Management Hook

- Centralizes all form state in a custom hook
- Provides form field setters and validation state
- Handles form reset and field clearing logic

---

## Key Features

- **Dual Mode Operation:** Support for creating new sites or adding monitors to existing sites
- **Multiple Monitor Types:** HTTP/HTTPS monitoring and port monitoring
- **Modular Architecture:** Separated into focused components and utility functions
- **State Management:** Uses Zustand store actions and custom hooks for form state
- **Theming:** Full integration with the app's theme system
- **Accessibility:** All form fields have proper labels and ARIA attributes
- **Error Handling:** Comprehensive error display and validation
- **Loading Feedback:** Visual feedback during form submission with delayed spinner
- **Form Reset:** Automatic field clearing after successful submission
- **Type Safety:** Full TypeScript integration with proper interfaces
- **UUID Generation:** Automatic site identifier generation for new sites

---

## Component Details

### useAddSiteForm Hook

The custom hook provides direct access to all form state and actions:

```typescript
const {
 url, // URL field value
 host, // Host field value
 port, // Port field value
 name, // Site name field value
 monitorType, // Selected monitor type
 checkInterval, // Check interval value
 addMode, // Form mode (new/existing)
 selectedExistingSite, // Selected existing site ID
 isFormValid, // Computed validation state
 setUrl, // URL field setter
 setHost, // Host field setter
 setPort, // Port field setter
 setName, // Name field setter
 setMonitorType, // Monitor type setter
 setCheckInterval, // Check interval setter
 setAddMode, // Add mode setter
 resetForm, // Form reset function
} = useAddSiteForm();
```

### Form Validation

- **URL Validation:** Comprehensive URL format validation using validator.js
- **Host/IP Validation:** Validates IP addresses and domain names for port monitors
- **Port Validation:** Ensures valid port numbers (1-65535)
- **Mode-based Validation:** Different validation rules for new vs existing sites
- **Submit-time Validation:** Comprehensive validation before form submission
- **Basic Form State:** Simple validation for submit button enablement

### Integration Points

- **Store Integration:** `useStore` for site creation, monitor addition, and error handling
- **Theme Integration:** `useTheme` for consistent styling and dark mode support
- **Logger Integration:** Comprehensive logging for debugging and analytics
- **Constants Integration:** Uses `CHECK_INTERVALS` and `UI_DELAYS` for configuration
- **UUID Generation:** Uses `generateUuid` utility for unique site identifiers

---

## Usage Example

The AddSiteForm is typically used as a standalone component:

```typescript
import { AddSiteForm } from '../components/AddSiteForm/AddSiteForm';

function App() {
  return (
    <div>
      <AddSiteForm />
    </div>
  );
}
```

---

## Best Practices Demonstrated

- **Separation of Concerns:** Each file has a single, clear responsibility
- **Custom Hooks:** Centralized state management with reusable logic
- **Type Safety:** Full TypeScript coverage with proper interfaces
- **Error Boundaries:** Comprehensive error handling at multiple levels
- **Accessibility:** ARIA labels and semantic HTML structure
- **Performance:** Optimized re-renders with proper state management
- **Testability:** Modular structure makes unit testing straightforward

---

## Related Files

- `src/store.ts` - Global Zustand store for site management
- `src/theme/` - Theme system and themed components
- `src/services/logger.ts` - Application logging service
- `src/constants.ts` - UI constants and configuration
- `src/types.ts` - TypeScript type definitions

---

## Future Enhancements

- **Enhanced Validation:** Extended URL validation and real-time feedback
- **Bulk Import:** Support for importing multiple sites from files
- **Template System:** Pre-configured monitor templates for common services
- **Auto-completion:** URL completion and common port suggestions
- **Import/Export:** Backup and restore form configurations
- **Custom Headers:** Support for custom HTTP headers in monitoring requests

---

## Development Notes

For developers working on this component:

1. **State Management:** Use the `useAddSiteForm` hook for all form state management
2. **Styling:** Follow the theme system and use ThemedBox, ThemedText, ThemedButton components
3. **Validation:** Add new validation rules in the `handleSubmit` function in Submit.tsx
4. **Form Fields:** Use the reusable components from FormFields.tsx (TextField, SelectField, RadioGroup)
5. **Testing:** Test each module independently for better coverage
6. **Accessibility:** Maintain ARIA attributes and proper form labeling
7. **Error Handling:** Use both form-level and store-level error handling

---

## Contact

For questions or improvements regarding the AddSiteForm component, see the project README or open an issue on GitHub.
