# Variable: SiteCard

> `const` **SiteCard**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`SiteCardProperties`](../interfaces/SiteCardProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/index.tsx:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/index.tsx#L44)

Main site card component using composition of smaller, focused sub-components.
Provides a complete overview of site monitoring status, metrics, and controls.

Features:
- Real-time status indicators
- Historical uptime data visualization
- Monitor management controls
- Performance metrics display
- Click-to-expand details

Much cleaner and more maintainable than a monolithic component approach.
Memoized to prevent unnecessary re-renders when parent updates.

## Param

SiteCard component props

## Returns

JSX element containing the complete site monitoring card
