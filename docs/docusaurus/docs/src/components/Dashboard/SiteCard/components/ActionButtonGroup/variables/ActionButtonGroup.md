# Variable: ActionButtonGroup

> `const` **ActionButtonGroup**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`ActionButtonGroupProperties`](../interfaces/ActionButtonGroupProperties.md)\>

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L73)

Reusable action button group component for site monitoring operations.

Features:

- Unified interface for check now, start/stop monitoring actions
- Proper event handling with stopPropagation on individual buttons to prevent
  card click conflicts - Optimized with React.memo and useCallback to prevent
  unnecessary re-renders - Accessibility support with proper ARIA labels and
  native button elements
- Visual feedback for loading and disabled states

## Example

```tsx
import { ActionButtonGroup } from "./components/ActionButtonGroup";

<ActionButtonGroup
    onCheckNow={handleCheckNow}
    onStartMonitoring={handleStart}
    onStopMonitoring={handleStop}
    isLoading={false}
    isMonitoring={true}
    disabled={false}
/>;
```

## Param

Component props

## Returns

JSX element containing action buttons
