# Variable: StatusBadge

> `const` **StatusBadge**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`StatusBadgeProperties`](../interfaces/StatusBadgeProperties.md)\>

Defined in: [src/components/common/StatusBadge.tsx:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/common/StatusBadge.tsx#L47)

Reusable status badge component that combines status indicator with text.
Can be used throughout the app for consistent status display.

This component is memoized to prevent unnecessary re-renders when parent
components update. The memoization is beneficial because status badges are
often rendered in lists and don't change frequently. Consumers should ensure
that props are stable (especially formatter function) to maximize memoization benefits.

## Param

StatusBadge component props

## Returns

JSX element containing status indicator and text
