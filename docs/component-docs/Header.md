# Header Component Documentation

## Overview

The `Header` component serves as the main navigation and status overview bar for the Uptime Watcher application. It provides a centralized location for monitoring overall system health, accessing global controls, and displaying key metrics across all monitored sites.

---

## Location & Files

- **Component:** `src/components/Header/Header.tsx`
- **Styles:** `src/components/Header/Header.css`

---

## Key Features

### 🏷️ Application Branding

- **App Title**: Displays "📊 Uptime Watcher" with proper styling
- **Visual Identity**: Consistent branding across the application

### 📊 System Status Overview

- **Overall Health Percentage**: Real-time calculation of uptime across all monitors
- **Monitor Count Breakdown**:
  - Up monitors (green indicator)
  - Down monitors (red indicator)
  - Pending monitors (yellow indicator)
  - Total monitor count
- **Visual Status Indicators**: Color-coded badges and animated health dots

### ⚙️ Global Controls

- **Theme Toggle**: Switch between light and dark modes (☀️/🌙)
- **Settings Access**: Open settings modal (⚙️ gear icon)

---

## Architecture

### Component Structure

```tsx
Header
├── App Title Section
│   └── Branded title with icon
├── Status Summary Section
│   ├── Overall Health Badge
│   ├── Up Monitors Count
│   ├── Down Monitors Count  
│   ├── Pending Monitors Count
│   └── Total Monitors Count
└── Controls Section
    ├── Theme Toggle Button
    └── Settings Button
```

### State Management

The Header component integrates with several parts of the application state:

- **`useStore()`**: Accesses site data and triggers settings modal
- **`useTheme()`**: Manages theme state and provides toggle functionality
- **`useAvailabilityColors()`**: Gets appropriate colors for health status

---

## Status Calculation Logic

The Header performs real-time calculations across all sites and monitors:

```typescript
// Count monitors by status across all sites
let upMonitors = 0;
let downMonitors = 0; 
let pendingMonitors = 0;
let totalMonitors = 0;

for (const site of sites) {
    if (site.monitors) {
        for (const monitor of site.monitors) {
            totalMonitors++;
            if (monitor.status === "up") upMonitors++;
            else if (monitor.status === "down") downMonitors++;
            else if (monitor.status === "pending") pendingMonitors++;
        }
    }
}

// Calculate overall uptime percentage
const uptimePercentage = totalMonitors > 0 
    ? Math.round((upMonitors / totalMonitors) * 100) 
    : 0;
```

---

## Responsive Design

### Layout Adaptation

- **Mobile**: Stacked layout with wrapped elements
- **Tablet**: Balanced horizontal layout
- **Desktop**: Full horizontal layout with optimal spacing

### Interactive Elements

- **Hover Effects**: Subtle hover states on buttons and status badges
- **Animations**: Pulsing health indicator dots
- **Transitions**: Smooth color and size transitions

---

## Theming Integration

The Header fully supports the application's theme system:

- **Dynamic Colors**: Status indicators adapt to current theme
- **Theme Toggle**: Integrated theme switching capability
- **Consistent Styling**: Uses `ThemedBox`, `ThemedText`, and `ThemedButton` components

### Theme-Aware Elements

- Background colors and borders
- Text colors and contrast
- Button states and hover effects
- Status indicator colors

---

## Usage Patterns

### Status Monitoring

```tsx
// Access header status from store
const { sites } = useStore();

// Monitor changes through header display
// Header automatically recalculates on site updates
```

### Theme Control

```tsx
// Theme management integration
const { isDark, toggleTheme } = useTheme();

// Header provides UI for theme switching
<ThemedButton onClick={toggleTheme}>
    {isDark ? "☀️" : "🌙"}
</ThemedButton>
```

---

## Performance Considerations

### Optimizations

- **Real-time Calculations**: Efficient iteration through sites/monitors
- **Memoization**: Status calculations only when sites data changes
- **CSS Animations**: Hardware-accelerated animations for smooth performance

### Update Frequency

- Recalculates status on every site/monitor update
- Responds immediately to theme changes
- No polling or timers (event-driven updates only)

---

## CSS Classes & Styling

### Key CSS Classes

- `.header-container`: Main container styling
- `.header-title-box`: App title styling container
- `.header-title-accent`: Title text styling
- `.header-status-summary-box`: Status summary container
- `.health-badge`: Overall health indicator
- `.health-dot`: Animated status dot
- `.health-text`: Health percentage text
- `.status-*-badge`: Individual status counters
- `.header-controls-box`: Control buttons container

### Responsive Breakpoints

- Uses Tailwind CSS responsive utilities
- Flexbox-based layout for automatic adaptation
- Min-width constraints for critical elements

---

## Integration Points

### Store Integration

- **Sites Data**: Real-time access to all monitored sites
- **Settings Modal**: Triggers settings display
- **Error States**: Could integrate error notifications (future enhancement)

### Theme System Integration

- **Theme Provider**: Full integration with app theme context
- **Color System**: Uses semantic color tokens
- **Component Library**: Built with themed components

### Navigation Integration

- **Central Hub**: Primary navigation point for global features
- **Status Gateway**: Entry point for system-wide monitoring
- **Settings Access**: Gateway to application configuration

---

## Future Enhancements

### Potential Improvements

- **Notification Indicators**: Show unread notification count
- **Search Integration**: Quick site search functionality
- **Export Controls**: Quick access to data export features
- **Keyboard Shortcuts**: Hotkey support for common actions

### Accessibility

- **ARIA Labels**: Already includes basic accessibility
- **Keyboard Navigation**: Could be enhanced for full keyboard control
- **Screen Reader**: Semantic markup for status announcements
