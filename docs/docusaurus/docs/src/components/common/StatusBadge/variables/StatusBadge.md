# Variable: StatusBadge

> `const` **StatusBadge**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`StatusBadgeProperties`](../interfaces/StatusBadgeProperties.md)\>

Defined in: [src/components/common/StatusBadge.tsx:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/common/StatusBadge.tsx#L90)

Reusable status badge component that combines status indicator with text. Can
be used throughout the app for consistent status display.

This component is memoized to prevent unnecessary re-renders when parent
components update. The memoization is beneficial because status badges are
often rendered in lists and don't change frequently. Consumers should ensure
that props are stable (especially formatter function) to maximize memoization
benefits.

## Param

StatusBadge component props

## Returns

JSX element containing status indicator and text
