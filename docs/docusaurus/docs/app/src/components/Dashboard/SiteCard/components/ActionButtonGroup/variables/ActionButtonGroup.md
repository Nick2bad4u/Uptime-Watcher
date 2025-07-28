# Variable: ActionButtonGroup

> `const` **ActionButtonGroup**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`ActionButtonGroupProperties`](../interfaces/ActionButtonGroupProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L58)

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
import { ActionButtonGroup } from './components/ActionButtonGroup';

<ActionButtonGroup
  onCheckNow={handleCheckNow}
  onStartMonitoring={handleStart}
  onStopMonitoring={handleStop}
  isLoading={false}
  isMonitoring={true}
  disabled={false}
/>
```
