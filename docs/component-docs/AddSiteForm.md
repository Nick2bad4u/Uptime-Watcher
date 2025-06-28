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

### 2. **FormFields.tsx** - Input Fields

- Renders all form input fields (URL, name, monitor type, etc.)
- Handles field-specific validation and user interaction
- Integrates with the custom hook for state management

### 3. **Submit.tsx** - Form Submission

- Handles form submission logic and validation
- Manages loading states and user feedback
- Integrates with the global store for site creation

### 4. **useAddSiteForm.ts** - State Management Hook

- Centralizes all form state in a custom hook
- Provides form validation logic
- Handles form reset and field clearing

---

## Key Features

- **Modular Architecture:** Separated into focused components and custom hooks
- **State Management:** Uses Zustand store actions and custom hooks for form state
- **Theming:** Full integration with the app's theme system
- **Accessibility:** All form fields have proper labels and ARIA attributes
- **Error Handling:** Comprehensive error display and validation
- **Loading Feedback:** Visual feedback during form submission
- **Form Reset:** Automatic field clearing after successful submission
- **Type Safety:** Full TypeScript integration with proper interfaces

---

## Component Details

### useAddSiteForm Hook

The custom hook centralizes all form state management:

```typescript
const {
 formState, // All form field values
 isFormValid, // Computed validation state
 setUrl, // URL field setter
 setName, // Name field setter
 setMonitorType, // Monitor type setter
 resetForm, // Form reset function
} = useAddSiteForm();
```

### Form Validation

- **URL Validation:** Ensures valid URL format and accessibility
- **Monitor Type:** Validates monitor configuration based on type
- **Real-time Feedback:** Immediate validation feedback as user types
- **Submit Validation:** Comprehensive checks before form submission

### Integration Points

- **Store Integration:** `useStore` for site creation and error handling
- **Theme Integration:** `useTheme` for consistent styling
- **Logger Integration:** Comprehensive logging for debugging and analytics

---

## Usage Example

The AddSiteForm is typically used in modals or dedicated pages:

```typescript
import { AddSiteForm } from './components/AddSiteForm';

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

- **Advanced Validation:** Extended URL and port validation
- **Bulk Import:** Support for importing multiple sites
- **Template System:** Pre-configured monitor templates
- **Validation Feedback:** Real-time validation with visual feedback
- **Auto-suggestions:** URL completion and common port suggestions

---

## Development Notes

For developers working on this component:

1. **State Management:** Use the custom hook for all form state
2. **Styling:** Follow the theme system for consistent appearance
3. **Validation:** Add new validation rules in the custom hook
4. **Testing:** Test each module independently for better coverage
5. **Accessibility:** Maintain ARIA attributes for screen readers

---

## Contact

For questions or improvements regarding the AddSiteForm component, see the project README or open an issue on GitHub.
