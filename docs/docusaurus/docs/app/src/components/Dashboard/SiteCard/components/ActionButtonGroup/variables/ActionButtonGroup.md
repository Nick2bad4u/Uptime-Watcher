# Variable: ActionButtonGroup

> `const` **ActionButtonGroup**: `NamedExoticComponent`\<`ActionButtonGroupProperties`\>

Defined in: [src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx#L53)

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
