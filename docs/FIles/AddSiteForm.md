# AddSiteForm Component Documentation

## Overview

`AddSiteForm` is a React functional component responsible for rendering the UI and logic for adding a new website to monitor in the Uptime Watcher application. It is fully integrated with the app's state management (Zustand) and theming system, and follows all best practices for error handling, loading states, and accessibility.

---

## Location

- **File:** `src/components/AddSiteForm.tsx`

---

## Purpose

- Allows users to add a new site (URL and optional name) to the monitoring list.
- Handles form validation, error display, and loading feedback.
- Integrates with the global store for state updates and error handling.
- Uses themed UI components for consistent appearance across themes.

---

## Key Features

- **State Management:** Uses Zustand store actions for creating sites, loading state, and error handling.
- **Theming:** Uses `useTheme` and themed components for full theme responsiveness.
- **Accessibility:** All form fields have labels and ARIA attributes.
- **Error Handling:** Displays errors from the global store and allows dismissing them.
- **Loading Feedback:** Shows a spinner on the submit button with a 100ms delay to avoid flicker.
- **Form Reset:** Resets fields on successful submission.
- **Logging:** Logs user actions and errors for analytics/debugging.

---

## Component Structure

### Imports

- React hooks: `useState`, `useEffect`
- Zustand store: `useStore`
- Constants: `UI_DELAYS`
- Theme hook: `useTheme`
- Themed components: `ThemedBox`, `ThemedText`, `ThemedButton`, `ThemedInput`
- Logger: `logger`

### State

- `url` (string): The website URL to add (required).
- `name` (string): Optional display name for the site.
- `showButtonLoading` (boolean): Controls the loading spinner on the submit button.

### Store Selectors

- `createSite`: Store action to add a new site.
- `isLoading`: Global loading state.
- `lastError`: Last error message from the store.
- `clearError`: Store action to clear errors.

### Theme

- `isDark`: Boolean indicating if the current theme is dark (for error box styling).

---

## Logic Details

### Loading Spinner Delay

- Uses a 100ms delay before showing the button spinner to avoid flicker for fast operations.
- Cleans up the timer on unmount or when loading state changes.

### Form Submission (`handleSubmit`)

- Prevents default form submission.
- Validates that the URL is not empty.
- Clears any previous error.
- Calls `createSite` with the trimmed URL and name.
- On success, resets the form fields and logs the action.
- On error, logs the error (store handles user-facing error display).

### Error Display

- If `lastError` is set, displays a themed error box with a close button to clear the error.
- Error box adapts to dark mode.

### Accessibility

- All inputs have `aria-label` attributes.
- Required fields are marked with `*` in the label.

### Themed Components

- Uses only themed components for all UI elements:
  - `ThemedBox` for error alert container
  - `ThemedText` for labels, help text, and error messages
  - `ThemedInput` for text/url fields
  - `ThemedButton` for submit and error close actions

---

## UI Layout

- **Site Name (Optional):** Text input, not required.
- **Website URL:** URL input, required.
- **Submit Button:** Disabled if URL is empty or loading. Shows spinner if loading.
- **Error Message:** Themed box with error text and dismiss button.
- **Help Text:** Two lines of small, tertiary-colored text below the form.

---

## Example Usage

This component is typically rendered in a modal or a section of the main app UI where users can add new sites.

---

## Best Practices Followed

- Uses store actions for all state changes (no direct mutation).
- Handles both global and local errors.
- Uses loading state for user feedback.
- Fully themed and accessible.
- Cleans up timers to avoid memory leaks.
- Logs user actions and errors for analytics/debugging.

---

## Future Improvements

- Add more advanced URL validation (currently only checks for non-empty string).
- Optionally support additional site metadata fields.
- Add keyboard accessibility enhancements if needed.
- Integrate with notification system for success feedback.

---

## Related Files

- `src/store.ts` (Zustand store/actions)
- `src/theme/components.tsx` (Themed UI components)
- `src/theme/useTheme.ts` (Theme hook)
- `src/constants.ts` (UI delays)
- `src/services/logger.ts` (Logging)

---

## Contact

For questions or improvements, see the project README or open an issue on GitHub.
