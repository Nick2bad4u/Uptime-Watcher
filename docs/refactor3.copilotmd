<!-- markdownlint-disable -->
## 📋 **Current Issues**

### SiteCard.tsx Issues:
1. **God Component**: 150+ lines doing too many things
2. **Mixed Concerns**: Business logic, UI, and state management all in one place
3. **Complex Event Handling**: Multiple `stopPropagation` calls indicate event bubbling issues
4. **Tight Coupling**: Heavy dependency on store with 8+ store methods
5. **Calculation Logic**: Uptime calculation embedded in component
6. **Repetitive Code**: Similar button patterns with different variants

### SiteList.tsx Issues:
1. **Minor**: Direct theme usage instead of component-level theming
2. **Styling**: Hardcoded CSS classes that could be themed

## 🔧 **Refactoring Strategy**

### Phase 1: Extract Custom Hooks

**1. `useSiteMonitor` Hook**
```typescript
// Extract monitor selection and management logic
const useSiteMonitor = (site: Site) => {
  // Handle monitor selection, status, response time
  // Return monitor data and helper functions
}
```

**2. `useSiteActions` Hook**
```typescript
// Extract all site-related actions
const useSiteActions = (site: Site, monitor: Monitor) => {
  // Handle start/stop monitoring, check now, navigation
  // Return action handlers
}
```

**3. `useSiteStats` Hook**
```typescript
// Extract calculation logic
const useSiteStats = (history: MonitorHistory[]) => {
  // Calculate uptime, format data
  // Return computed values
}
```

### Phase 2: Break Down SiteCard Components

**1. `SiteCardHeader`**
- Site name and monitor selection
- Action buttons (check now, start/stop)

**2. `SiteCardStatus`**
- Status indicator and basic info

**3. `SiteCardMetrics`**
- Grid of status, uptime, response time, checks

**4. `SiteCardHistory`**
- History visualization with mini chart bars

**5. `SiteCardFooter`**
- Click hint and additional info

### Phase 3: Create Reusable Components

**1. `ActionButtonGroup`**
- Reusable button group with proper event handling
- Eliminates repetitive stopPropagation code

**2. `MetricCard`**
- Reusable metric display component
- Used in the metrics grid

**3. `EmptyState`**
- Extract from SiteList for reusability

### Phase 4: Optimize Performance

**1. Memoization**
- Memoize expensive calculations
- Use `React.memo` for pure components
- Optimize re-renders with `useMemo` and `useCallback`

**2. Event Handling**
- Implement proper event delegation
- Reduce event handler recreation

## 📁 **Proposed File Structure**

```
Dashboard/
├── SiteList/
│   ├── index.tsx                 # Main SiteList component
│   ├── EmptyState.tsx           # Empty state component
│   └── styles.ts                # Styled components/themes
├── SiteCard/
│   ├── index.tsx                # Main SiteCard container
│   ├── SiteCardHeader.tsx       # Header with name + actions
│   ├── SiteCardStatus.tsx       # Status indicator section
│   ├── SiteCardMetrics.tsx      # Metrics grid
│   ├── SiteCardHistory.tsx      # History visualization
│   ├── SiteCardFooter.tsx       # Footer section
│   └── components/
│       ├── ActionButtonGroup.tsx
│       ├── MetricCard.tsx
│       └── MonitorSelector.tsx
└── hooks/
    ├── useSiteMonitor.ts        # Monitor management
    ├── useSiteActions.ts        # Action handlers
    ├── useSiteStats.ts          # Calculations
    └── useSiteCard.ts           # Orchestrating hook
```

## 🚀 **Implementation Order**

### Step 1: Extract Business Logic Hooks
1. Create `useSiteStats` for calculations
2. Create `useSiteMonitor` for monitor management
3. Create `useSiteActions` for event handlers

### Step 2: Create Small UI Components
1. Extract `MetricCard` component
2. Extract `ActionButtonGroup` component
3. Extract `MonitorSelector` component

### Step 3: Break Down SiteCard
1. Create `SiteCardHeader`
2. Create `SiteCardMetrics` 
3. Create `SiteCardHistory`
4. Update main `SiteCard` to compose these

### Step 4: Optimize and Polish
1. Add proper TypeScript interfaces
2. Implement memoization
3. Add comprehensive prop-types/validation
4. Improve accessibility

## 🎁 **Benefits**

1. **Maintainability**: Smaller, focused components easier to understand and modify
2. **Testability**: Individual hooks and components can be unit tested
3. **Reusability**: Extracted components can be used elsewhere
4. **Performance**: Targeted re-renders and memoization
5. **Developer Experience**: Better code organization and IntelliSense
6. **Accessibility**: Focused components allow better a11y implementation

## 📊 **Metrics**
- Reduce SiteCard from ~150 lines to ~50 lines
- Create 6+ reusable components
- Extract 3+ custom hooks
- Improve code coverage potential from ~30% to ~80%

Would you like me to start implementing any specific part of this refactoring plan?