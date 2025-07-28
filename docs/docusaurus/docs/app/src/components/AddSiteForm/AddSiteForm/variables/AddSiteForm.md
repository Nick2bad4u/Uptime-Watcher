# Variable: AddSiteForm

> `const` **AddSiteForm**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<`object`\>

Defined in: [src/components/AddSiteForm/AddSiteForm.tsx:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/AddSiteForm.tsx#L84)

Main form component for adding new monitoring sites or monitors.

## Remarks

- Allows creation of new sites with monitors, or adding monitors to existing sites.
- Supports HTTP and port monitoring, with dynamic fields based on monitor type.
- Handles form validation, error display, and loading states.
- Uses Zustand stores for state and error management.
- Loads monitor types from backend and displays dynamic help text.

## Returns

The rendered AddSiteForm JSX element.

## Example

```tsx
<AddSiteForm />
```
