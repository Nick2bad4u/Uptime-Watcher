# Variable: AddSiteForm

> `const` **AddSiteForm**: `NamedExoticComponent`\<`object`\>

Defined in: [src/components/AddSiteForm/AddSiteForm.tsx:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/components/AddSiteForm/AddSiteForm.tsx#L41)

Main form component for adding new monitoring sites or monitors.

Features:
- Create new sites with monitors
- Add monitors to existing sites
- Support for HTTP and port monitoring
- Form validation and error handling
- Configurable check intervals
- Responsive design with loading states

The component uses a custom hook (useAddSiteForm) for state management
and modular sub-components for form fields and submission handling.

## Returns

JSX element containing the complete add site form
