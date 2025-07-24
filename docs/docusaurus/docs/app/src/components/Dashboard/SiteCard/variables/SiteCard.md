# Variable: SiteCard

> `const` **SiteCard**: `NamedExoticComponent`\<`SiteCardProperties`\>

Defined in: [src/components/Dashboard/SiteCard/index.tsx:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/components/Dashboard/SiteCard/index.tsx#L40)

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
