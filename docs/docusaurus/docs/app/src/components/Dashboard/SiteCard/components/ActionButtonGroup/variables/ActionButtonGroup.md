# Variable: ActionButtonGroup

> `const` **ActionButtonGroup**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`ActionButtonGroupProperties`](../interfaces/ActionButtonGroupProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L55)

Reusable action button group component for site monitoring operations.

Features:
- Unified interface for check now, start/stop monitoring actions
- Proper event handling with stopPropagation on individual buttons to prevent card click conflicts
- Optimized with React.memo and useCallback to prevent unnecessary re-renders
- Accessibility support with proper ARIA labels and native button elements
- Visual feedback for loading and disabled states

## Param

Component props

## Returns

JSX element containing action buttons

## Example

```tsx
<ActionButtonGroup
  onCheckNow={handleCheckNow}
  onStartMonitoring={handleStart}
  onStopMonitoring={handleStop}
  isLoading={false}
  isMonitoring={true}
  disabled={false}
/>
```
