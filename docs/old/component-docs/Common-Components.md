# Common Components Documentation

## Overview

The `common` components directory contains reusable UI components that are used throughout the Uptime Watcher application. These components provide consistent styling, behavior, and functionality across different parts of the application.

---

## Location & Files

- **Directory:** `src/components/common/`
- **Components:**
  - `StatusBadge.tsx` - Status display with icons and text
  - `HistoryChart.tsx` - Historical data visualization
  - `index.ts` - Component exports

---

## Components

### StatusBadge Component

A reusable status display component that combines status indicators with descriptive text.

#### Features

- **Status Indicators**: Visual status icons (up/down/pending)
- **Flexible Sizing**: Multiple size options from xs to 4xl
- **Configurable Display**: Optional icon visibility
- **Consistent Styling**: Integrated with theme system
- **Performance Optimized**: React.memo for efficient re-rendering

#### Props Interface

```typescript
interface StatusBadgeProps {
 label: string; // Status description text
 status: "up" | "down" | "pending"; // Status type
 size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl"; // Text size
 showIcon?: boolean; // Whether to show status icon (default: true)
 className?: string; // Additional CSS classes
}
```

#### Usage Examples

```tsx
// Basic usage
<StatusBadge label="Website Status" status="up" />

// Large size without icon
<StatusBadge
    label="API Status"
    status="down"
    size="lg"
    showIcon={false}
/>

// Custom styling
<StatusBadge
    label="Service Health"
    status="pending"
    className="custom-status-badge"
/>
```

#### Size Mapping

The component intelligently maps text sizes to appropriate indicator sizes:

```typescript
const getIndicatorSize = (textSize) => {
 switch (textSize) {
  case ("xs", "sm"):
   return "sm";
  case ("base", "lg"):
   return "md";
  case ("xl", "2xl", "3xl", "4xl"):
   return "lg";
  default:
   return "sm";
 }
};
```

---

### HistoryChart Component

A responsive chart component for visualizing historical status data over time.

#### HistoryChart Features

- **Responsive Design**: CSS-based responsive layout
- **Performance Optimized**: React.memo prevents unnecessary re-renders
- **Configurable Limits**: Adjustable maximum data points
- **Theme Integration**: Uses themed chart bar components
- **Empty State Handling**: Graceful handling of no data

#### HistoryChart Props Interface

```typescript
interface HistoryChartProps {
 history: StatusHistory[]; // Array of historical status records
 title: string; // Chart title/description
 maxItems?: number; // Maximum data points to display (default: 120)
 className?: string; // Additional CSS classes
}
```

#### HistoryChart Usage Examples

```tsx
// Basic usage
<HistoryChart
    history={siteHistory}
    title="24 Hour History"
/>

// Limited data points
<HistoryChart
    history={monitorHistory}
    title="Recent Activity"
    maxItems={50}
/>

// Custom styling
<HistoryChart
    history={statusData}
    title="Uptime Trend"
    className="custom-chart-container"
/>
```

#### Data Structure

Expected `StatusHistory` structure:

```typescript
interface StatusHistory {
 timestamp: number; // Unix timestamp
 status: "up" | "down"; // Status at that time (no "pending" in history)
 responseTime: number; // Response time data (required, not optional)
}
```

#### Rendering Logic

```typescript
// Empty state handling
if (history.length === 0) {
    return null; // React convention for "render nothing"
}

// Data processing - show up to maxItems bars, most recent first (reverse chronological order)
const displayedHistory = history.slice(0, maxItems).reverse();

// Responsive rendering with CSS Flexbox
<div className="flex items-center justify-end gap-1 overflow-hidden min-w-0 flex-shrink">
    {displayedHistory.map((record) => (
        <MiniChartBar
            key={record.timestamp}
            status={record.status}
            responseTime={record.responseTime}
            timestamp={record.timestamp}
        />
    ))}
</div>
```

---

## Design Patterns

### Memoization Strategy

Both components use React.memo for performance optimization:

```typescript
export const StatusBadge = React.memo(function StatusBadge({ ...props }) {
 // Component implementation
});

export const HistoryChart = React.memo(function HistoryChart({ ...props }) {
 // Component implementation
});
```

### Theme Integration

Components integrate seamlessly with the application theme system:

- **StatusBadge**: Uses `StatusIndicator` and `ThemedText` components
- **HistoryChart**: Uses `MiniChartBar` and `ThemedText` components

### Responsive Design

#### StatusBadge Responsive Behavior

- **Flexbox Layout**: `flex items-center gap-3`
- **Icon Scaling**: Automatic size mapping for different text sizes
- **Text Format**: Displays as "{label}: {status}" format

#### HistoryChart Responsive Behavior

- **CSS Flexbox**: `flex items-center justify-end gap-1`
- **Overflow Handling**: `overflow-hidden min-w-0 flex-shrink`
- **Data Limiting**: Client-side limitation prevents performance issues
- **Reverse Chronological**: Newest data appears on the right

---

## Performance Considerations

### Memory Optimization

- **React.memo**: Prevents unnecessary re-renders
- **Key Props**: Proper key assignment for list rendering
- **Data Slicing**: Limited data points prevent DOM bloat

### Rendering Efficiency

```typescript
// HistoryChart: Efficient data processing
const displayedHistory = history.slice(0, maxItems).reverse();

// StatusBadge: Conditional rendering and text formatting
{showIcon && <StatusIndicator status={status} size={getIndicatorSize(size)} />}
<ThemedText variant="secondary" size={size}>
    {label}: {status}
</ThemedText>
```

### CSS Performance

- **Hardware Acceleration**: CSS transforms where appropriate
- **Minimal DOM**: Lean component structure
- **Efficient Selectors**: Optimized CSS class usage

---

## Accessibility Features

### StatusBadge Accessibility

- **Semantic HTML**: Proper div structure with meaningful content
- **Color Independence**: Status communicated through text, icons, and descriptive text format
- **Screen Reader**: Descriptive text includes both label and status ("{label}: {status}")

### HistoryChart Accessibility

- **Chart Description**: Title text provides chart context
- **Data Access**: Individual data points accessible through MiniChartBar components
- **Keyboard Navigation**: Standard focus behavior for chart elements

---

## Integration Examples

### Dashboard Integration

```tsx
// In SiteCard component
<StatusBadge
    label={site.name}
    status={site.currentStatus}
    size="base"
/>

<HistoryChart
    history={site.statusHistory}
    title="24h History"
    maxItems={100}
/>
```

### Header Integration

```tsx
// Status summary in Header
<StatusBadge label="System Health" status={overallStatus} size="sm" showIcon={true} />
```

### SiteDetails Integration

```tsx
// Detailed view in modal
<HistoryChart history={selectedSite.fullHistory} title="Complete History" maxItems={200} className="detailed-chart" />
```

---

## Testing Considerations

### StatusBadge Testing

- **Props Validation**: Test all prop combinations
- **Size Mapping**: Verify correct indicator size mapping
- **Theme Integration**: Test with different themes
- **Performance**: Verify memoization behavior

### HistoryChart Testing

- **Empty State**: Test with empty history array
- **Data Limits**: Test with various maxItems values
- **Responsive**: Test responsive behavior
- **Performance**: Test with large datasets

---

## Future Enhancements

### StatusBadge Improvements

- **Animation**: Subtle status change animations
- **Tooltips**: Hover tooltips with additional information
- **Custom Icons**: Configurable icon sets
- **Click Handlers**: Interactive status badges

### HistoryChart Improvements

- **Zoom Controls**: Interactive chart zoom functionality
- **Time Ranges**: Configurable time range selection
- **Export**: Chart data export capabilities
- **Tooltips**: Hover information for individual data points

### New Common Components

- **LoadingSpinner**: Reusable loading indicators
- **ErrorBoundary**: Error boundary for component isolation
- **ConfirmDialog**: Reusable confirmation modals
- **DataTable**: Generic data table component
