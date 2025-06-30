# SiteCard Components Documentation

## Overview

The SiteCard component system is a modular, composable set of components that work together to display individual site monitoring information in the Dashboard. This system breaks down the complex site card into smaller, focused### Accessibility Features

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through MonitorSelector and ActionButtonGroup
- **Enter/Space**: Proper activation for buttons and selects
- **Event Propagation**: Controlled event handling to prevent conflicts

### Screen Reader Support

- **ARIA Labels**: Descriptive labels for all interactive elements
  - "Check Now", "Start Monitoring", "Stop Monitoring" button labels
  - Monitor selector with proper labeling
- **Semantic HTML**: Proper heading structure and form labels
- **Status Communication**: StatusBadge provides status information better maintainability and reusability.

---

## Component Hierarchy

```text
SiteCard (main container)
├── SiteCardHeader
│   ├── Site Name Display
│   ├── MonitorSelector
│   └── ActionButtonGroup
├── SiteCardStatus
├── SiteCardMetrics
│   └── MetricCard (four instances)
├── SiteCardHistory
└── SiteCardFooter
```

---

## Main SiteCard Component

### Location & Files

- **Component:** `src/components/Dashboard/SiteCard/index.tsx`
- **Props:** `{ site: Site }`

### Key Features

- **Composition Pattern**: Uses smaller components for clean architecture
- **Custom Hook Integration**: Leverages `useSite()` hook for all site logic
- **Performance Optimized**: React.memo prevents unnecessary re-renders
- **Event Handling**: Click handling for site details modal via handleCardClick
- **Themed Integration**: Uses ThemedBox for consistent styling

### Architecture

The main SiteCard acts as a container that:

1. **Data Management**: Uses `useSite()` hook to get all required data
2. **Event Orchestration**: Passes event handlers to child components
3. **Layout Management**: Organizes child components in a flexible column layout
4. **State Distribution**: Distributes state and data to appropriate child components

---

## SiteCardHeader Component

### SiteCardHeader Location & Files

- **Component:** `src/components/Dashboard/SiteCard/SiteCardHeader.tsx`

### SiteCardHeader Props Interface

```typescript
interface SiteCardHeaderProps {
 site: Site;
 selectedMonitorId: string;
 onMonitorIdChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
 onCheckNow: () => void;
 onStartMonitoring: () => void;
 onStopMonitoring: () => void;
 isLoading: boolean;
 isMonitoring: boolean;
 hasMonitor: boolean;
}
```

### SiteCardHeader Features

- **Site Identification**: Displays site name or identifier (fallback)
- **Monitor Selection**: Dropdown for selecting different monitors
- **Action Controls**: Buttons for monitoring operations (check now, start/stop)
- **Responsive Layout**: Flexbox layout with proper spacing and minimum widths

### Sub-components

#### MonitorSelector

- **Purpose**: Dropdown for selecting between different monitors for a site
- **Location**: `src/components/Dashboard/SiteCard/components/MonitorSelector.tsx`
- **Features**:
  - Displays monitor list from site.monitors data
  - Handles monitor selection changes with event propagation control
  - Disabled state when no monitors available
  - Dynamic option formatting (TYPE: detail format)
  - Click event stopping to prevent card click conflicts

#### ActionButtonGroup

- **Purpose**: Group of action buttons for monitoring operations
- **Location**: `src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx`
- **Features**:
  - Check Now button (🔄) for immediate status check
  - Start/Stop monitoring toggle buttons (▶️/⏸️)
  - Loading states for ongoing operations
  - Conditional rendering based on monitoring state (isMonitoring)
  - Event propagation control to prevent card click conflicts
  - ARIA labels for accessibility

---

## SiteCardStatus Component

### SiteCardStatus Location & Files

- **Component:** `src/components/Dashboard/SiteCard/SiteCardStatus.tsx`

### SiteCardStatus Features

- **Status Display**: Shows current monitoring status using StatusBadge component
- **Visual Indicators**: Color-coded status with icons (up/down/pending)
- **Monitor Integration**: Displays status for selected monitor with formatted label
- **Theme Support**: Adapts to current theme colors automatically

---

## SiteCardMetrics Component

### SiteCardMetrics Location & Files

- **Component:** `src/components/Dashboard/SiteCard/SiteCardMetrics.tsx`

### SiteCardMetrics Features

- **Four Metrics Display**: Shows status, uptime percentage, response time, and check count
- **MetricCard Integration**: Uses reusable MetricCard sub-components in 4-column grid
- **Responsive Grid**: CSS Grid layout (grid-cols-4) that adapts to screen size
- **Performance Stats**: Real-time metrics display with memoized calculations
- **Graceful Handling**: Handles undefined response times with "-" fallback

### Sub-component: MetricCard

- **Purpose**: Reusable card for displaying individual metrics
- **Location**: `src/components/Dashboard/SiteCard/components/MetricCard.tsx`
- **Features**:
  - Vertical layout with label above value (flex-col items-center)
  - Themed text components for unified styling
  - Flexible value types (string or number)
  - Optimized with React.memo to prevent unnecessary re-renders
  - Center-aligned text layout

---

## SiteCardHistory Component

### SiteCardHistory Location & Files

- **Component:** `src/components/Dashboard/SiteCard/SiteCardHistory.tsx`

### SiteCardHistory Features

- **Historical Visualization**: Displays status history using HistoryChart component
- **Dynamic Titles**: Generates titles based on monitor type (HTTP/Port with details)
- **HistoryChart Integration**: Uses the common HistoryChart component with maxItems=60
- **Performance Optimized**: Custom comparison function for selective re-rendering
- **Responsive Display**: Adapts chart size to card width

---

## SiteCardFooter Component

### SiteCardFooter Location & Files

- **Component:** `src/components/Dashboard/SiteCard/SiteCardFooter.tsx`

### SiteCardFooter Features

- **Interactive Hint**: Displays "Click to view detailed statistics and settings" message
- **Visual Feedback**: Hover-triggered opacity animation for user guidance
- **Consistent Spacing**: Maintains proper card footer spacing with top border
- **Static Content**: Optimized with React.memo for static content

---

## Integration Patterns

### Data Flow

```typescript
// Main SiteCard receives site prop
<SiteCard site={site} />

// Uses useSite hook for all data and handlers
const {
    checkCount, filteredHistory, handleCardClick,
    handleCheckNow, handleMonitorIdChange,
    handleStartMonitoring, handleStopMonitoring,
    isLoading, isMonitoring, latestSite,
    monitor, responseTime, selectedMonitorId,
    status, uptime
} = useSite(site);

// Distributes data to child components
<SiteCardHeader
    site={latestSite}
    selectedMonitorId={selectedMonitorId}
    onMonitorIdChange={handleMonitorIdChange}
    // ... other props
/>
```

### Event Handling

```typescript
// Events bubble up from child components through props to useSite hook
MonitorSelector onChange -> handleMonitorIdChange -> useSiteActions
ActionButtonGroup onCheckNow -> handleCheckNow -> useSiteActions
ActionButtonGroup onStartMonitoring -> handleStartMonitoring -> useSiteActions
ActionButtonGroup onStopMonitoring -> handleStopMonitoring -> useSiteActions
SiteCard onClick -> handleCardClick -> useSiteActions
```

### State Management

- **Composite Hook**: Managed by `useSite()` hook which combines useSiteMonitor, useSiteStats, and useSiteActions
- **Global State**: Site data from Zustand store
- **Derived State**: Calculated values (uptime percentage, filtered history)
- **UI State**: Loading states from store, selection state from hooks

---

## Performance Considerations

### Optimizations

- **React.memo**: All components memoized to prevent unnecessary renders
- **Custom Hook**: `useSite()` centralizes all logic and optimizations
- **Selective Re-rendering**: Only affected components re-render on state changes
- **Event Handler Stability**: Stable event handler references

### Memory Management

- **Efficient Data Structures**: Optimized history filtering and calculations
- **Cleanup**: Proper cleanup in hooks and effects
- **Reference Equality**: Stable object references where possible

---

## Styling & Theming

### Theme Integration

All components use the themed component system:

```typescript
// Example usage
<ThemedBox variant="secondary" padding="md" rounded="md" shadow="sm">
    <ThemedText variant="primary" size="lg" weight="semibold">
        {site.name}
    </ThemedText>
</ThemedBox>
```

### Responsive Design

- **Flexbox Layouts**: Flexible layouts that adapt to different sizes
- **Grid Systems**: CSS Grid for metric cards
- **Breakpoint Awareness**: Responsive behavior at different screen sizes
- **Touch Friendly**: Appropriate touch targets for mobile devices

### CSS Classes

Key CSS classes used throughout the SiteCard system:

- `.site-card`: Main card container styling (applied to ThemedBox)
- `.flex`, `.flex-col`: Flexbox layout classes
- `.grid`, `.grid-cols-4`: CSS Grid for metrics layout
- `.gap-2`, `.gap-4`: Spacing utilities
- `.min-w-[180px]`, `.min-w-[80px]`, `.min-w-[32px]`: Minimum width constraints
- `.cursor-pointer`: Pointer cursor for clickable card
- `.pt-2`, `.mt-2`, `.mb-4`: Padding and margin utilities
- `.border-t`: Top border styling

---

## Accessibility Features

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through interactive elements
- **Enter/Space**: Proper activation for buttons and selects
- **Arrow Keys**: Select dropdown navigation

### Screen Reader Support

- **ARIA Labels**: Descriptive labels for all interactive elements
- **Semantic HTML**: Proper heading structure and form labels
- **Status Announcements**: Dynamic status changes announced
- **Role Attributes**: Appropriate ARIA roles for custom components

### Visual Accessibility

- **Color Independence**: Information not conveyed by color alone
- **Contrast Ratios**: Proper contrast in all theme variants
- **Focus Indicators**: Clear focus states for keyboard users
- **Text Sizing**: Respects user font size preferences

---

## Testing Considerations

### Component Testing

```typescript
// Example test structure
describe("SiteCard", () => {
 test("renders site information correctly", () => {
  // Test basic rendering
 });

 test("handles monitor selection", () => {
  // Test MonitorSelector integration
 });

 test("manages loading states", () => {
  // Test ActionButtonGroup loading states
 });
});
```

### Integration Testing

- **useSite Hook**: Test hook behavior with different site states
- **Event Flow**: Test event propagation through component hierarchy
- **State Updates**: Test state changes and re-rendering behavior
- **Error Handling**: Test error states and recovery

---

## Future Enhancements

### Potential Improvements

- **Card Customization**: User-configurable card layouts
- **Additional Metrics**: More detailed performance metrics
- **Drag & Drop**: Reorder cards in dashboard
- **Card Actions**: More action buttons in header or footer

### Extensibility

- **Plugin System**: Pluggable metric cards
- **Custom Themes**: Per-card theme overrides
- **Advanced History**: Interactive history charts
- **Export Options**: Export individual site data

### Performance

- **Virtualization**: Virtual scrolling for large site lists
- **Progressive Loading**: Lazy load detailed metrics
- **Caching**: Intelligent caching of computed values
- **Web Workers**: Background processing for complex calculations
