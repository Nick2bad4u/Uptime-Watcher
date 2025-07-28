# Variable: SiteCardHeader

> `const` **SiteCardHeader**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`SiteCardHeaderProperties`](../interfaces/SiteCardHeaderProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/SiteCardHeader.tsx:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/Dashboard/SiteCard/SiteCardHeader.tsx#L56)

Header section of the site card containing site name, monitor selection, and action buttons.
Provides interactive controls for monitor management and site operations.

This component is memoized to prevent unnecessary re-renders when parent components
update. For optimal performance, ensure that all callback props (onCheckNow,
onMonitorIdChange, onStartMonitoring, onStopMonitoring) are stable references
(wrapped in useCallback). The site object should also be stable to prevent
unnecessary re-renders.

UX Note: ActionButtonGroup is disabled when hasMonitor is false, preventing
actions on sites without configured monitors. The isLoading state is handled
internally by ActionButtonGroup to disable buttons during operations.

## Param

SiteCardHeader component props

## Returns

JSX.Element containing site header with controls
