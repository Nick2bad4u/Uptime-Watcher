# SiteCard Components Documentation

## Overview

The SiteCard component system is a modular, composable set of components that work together to display individual site monitoring information in the Dashboard. This system breaks down the complex site card into smaller, focused components for better maintainability and reusability.

---

## Component Hierarchy

```text
SiteCard (main container)
├── SiteCardHeader
│   ├── MonitorSelector
│   └── ActionButtonGroup
├── SiteCardStatus
├── SiteCardMetrics
│   └── MetricCard (multiple instances)
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
- **Event Handling**: Click handling for site details modal
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

- **Site Identification**: Displays site name or identifier
- **Monitor Selection**: Dropdown for selecting different monitors
- **Action Controls**: Buttons for monitoring operations
- **Responsive Layout**: Flexbox layout with proper spacing

### Sub-components

#### MonitorSelector

- **Purpose**: Dropdown for selecting between different monitors for a site
- **Location**: `src/components/Dashboard/SiteCard/components/MonitorSelector.tsx`
- **Features**:
  - Displays monitor list from site data
  - Handles monitor selection changes
  - Disabled state when no monitors available

#### ActionButtonGroup

- **Purpose**: Group of action buttons for monitoring operations
- **Location**: `src/components/Dashboard/SiteCard/components/ActionButtonGroup.tsx`
- **Features**:
  - Check Now button for immediate status check
  - Start/Stop monitoring toggle buttons
  - Loading states for ongoing operations
  - Conditional rendering based on monitoring state

---

## SiteCardStatus Component

### SiteCardStatus Location & Files

- **Component:** `src/components/Dashboard/SiteCard/SiteCardStatus.tsx`

### SiteCardStatus Features

- **Status Display**: Shows current monitoring status (up/down/pending)
- **Visual Indicators**: Color-coded status with icons
- **Monitor Integration**: Displays status for selected monitor
- **Theme Support**: Adapts to current theme colors

---

## SiteCardMetrics Component

### SiteCardMetrics Location & Files

- **Component:** `src/components/Dashboard/SiteCard/SiteCardMetrics.tsx`

### SiteCardMetrics Features

- **Multiple Metrics**: Displays uptime, response time, and check count
- **MetricCard Integration**: Uses reusable MetricCard sub-components
- **Responsive Grid**: Grid layout that adapts to screen size
- **Performance Stats**: Real-time metrics display

### Sub-component: MetricCard

- **Purpose**: Reusable card for displaying individual metrics
- **Location**: `src/components/Dashboard/SiteCard/components/MetricCard.tsx`
- **Features**:
  - Icon + label + value display pattern
  - Themed styling and colors
  - Tooltip support for additional information
  - Consistent spacing and typography

---

## SiteCardHistory Component

### SiteCardHistory Location & Files

- **Component:** `src/components/Dashboard/SiteCard/SiteCardHistory.tsx`

### SiteCardHistory Features

- **Historical Visualization**: Displays status history as mini chart
- **Timeline View**: Shows recent status changes over time
- **HistoryChart Integration**: Uses the common HistoryChart component
- **Responsive Display**: Adapts chart size to card width

---

## SiteCardFooter Component

### SiteCardFooter Location & Files

- **Component:** `src/components/Dashboard/SiteCard/SiteCardFooter.tsx`

### SiteCardFooter Features

- **Additional Actions**: Space for footer-level actions
- **Consistent Spacing**: Maintains proper card footer spacing
- **Extensible**: Can be expanded for future footer content

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
// Events bubble up from child components to useSite hook
MonitorSelector onChange -> handleMonitorIdChange -> useSite
ActionButtonGroup onCheckNow -> handleCheckNow -> useSite
ActionButtonGroup onStartMonitoring -> handleStartMonitoring -> useSite
```

### State Management

- **Local State**: Managed by `useSite()` hook
- **Global State**: Site data from Zustand store
- **Derived State**: Calculated values (uptime percentage, filtered history)
- **UI State**: Loading states, selection state

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

- `.site-card`: Main card container styling
- `.site-card-header`: Header section styling
- `.site-card-metrics`: Metrics grid container
- `.site-card-history`: History chart container
- `.metric-card`: Individual metric card styling

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
