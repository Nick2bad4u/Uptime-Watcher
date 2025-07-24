# Variable: AddSiteForm

> `const` **AddSiteForm**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<`object`\>

Defined in: [src/components/AddSiteForm/AddSiteForm.tsx:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/AddSiteForm/AddSiteForm.tsx#L41)

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
