# Variable: AddSiteForm

> `const` **AddSiteForm**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`AddSiteFormProperties`](../interfaces/AddSiteFormProperties.md)\>

Defined in: [src/components/AddSiteForm/AddSiteForm.tsx:109](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/AddSiteForm.tsx#L109)

Main form component for adding new monitoring sites or monitors.

## Remarks

- Allows creation of new sites with monitors, or adding monitors to existing
  sites. - Supports HTTP and port monitoring, with dynamic fields based on
  monitor type. - Handles form validation, error display, and loading
  states.
- Uses Zustand stores for state and error management.
- Loads monitor types from backend and displays dynamic help text.

## Example

```tsx
<AddSiteForm onSuccess={() => console.log("Site added!")} />;
```

## Param

AddSiteForm component props

## Returns

The rendered AddSiteForm JSX element.
