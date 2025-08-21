# Variable: SiteCardHeader

> `const` **SiteCardHeader**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`SiteCardHeaderProps`](../interfaces/SiteCardHeaderProps.md)\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardHeader.tsx:105](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/SiteCardHeader.tsx#L105)

Header section of the site card containing site name, monitor selection, and
action buttons. Provides interactive controls for monitor management and site
operations.

This component is memoized to prevent unnecessary re-renders when parent
components update. For optimal performance, ensure that all callback props
are stable references (wrapped in useCallback). The site object should also
be stable to prevent unnecessary re-renders.

UX Note: ActionButtonGroup is disabled when hasMonitor is false, preventing
actions on sites without configured monitors. The isLoading state is handled
internally by ActionButtonGroup to disable buttons during operations.

## Param

SiteCardHeader component props

## Returns

JSX.Element containing site header with controls
