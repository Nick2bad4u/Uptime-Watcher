# SiteDetails Component Documentation

## Overview

`SiteDetails` is a comprehensive modal component system for displaying detailed information about monitored sites in the Uptime Watcher application. It provides tabbed navigation for different views of site data including overview, analytics, history, and settings.

---

## Location & Structure

The SiteDetails is organized as a modular component system:

- **Main Component:** `src/components/SiteDetails/SiteDetails.tsx`
- **Header Component:** `src/components/SiteDetails/SiteDetailsHeader.tsx`
- **Navigation:** `src/components/SiteDetails/SiteDetailsNavigation.tsx`
- **Screenshot:** `src/components/SiteDetails/ScreenshotThumbnail.tsx`
- **Tabs:** `src/components/SiteDetails/tabs/` (multiple tab components)
- **Styles:** `src/components/SiteDetails/SiteDetails.css`
- **Index:** `src/components/SiteDetails/index.ts`

---

## Architecture

The component follows a modular, tab-based architecture:

### 1. **SiteDetails.tsx** - Main Container

- Modal wrapper with backdrop and positioning
- Manages overall layout and structure
- Handles modal open/close state
- Integrates theme system for consistent styling

### 2. **SiteDetailsHeader.tsx** - Header Section

- Displays site name, URL, and status
- Shows current monitor information
- Provides close button functionality
- Integrates with screenshot thumbnail

### 3. **SiteDetailsNavigation.tsx** - Tab Navigation

- Renders tab navigation buttons
- Manages active tab state
- Provides smooth transitions between tabs
- Theme-aware styling and interactions

### 4. **Tab Components** - Content Sections

Multiple specialized tab components for different data views:

- **OverviewTab:** General site information and current status
- **AnalyticsTab:** Charts and performance metrics
- **HistoryTab:** Historical monitoring data
- **SettingsTab:** Site-specific configuration options

### 5. **ScreenshotThumbnail.tsx** - Visual Preview

- Displays site screenshot when available
- Handles loading and error states
- Provides fallback for missing images
- Optimized image loading and caching

---

## Key Features

- **Modal Interface:** Full-screen modal with backdrop and animations
- **Tabbed Navigation:** Organized content in logical sections
- **Real-time Data:** Live updates of monitoring status and metrics
- **Responsive Design:** Adapts to different screen sizes and orientations
- **Theme Integration:** Full support for light/dark themes
- **Performance Optimized:** Efficient rendering and data loading
- **Accessibility:** ARIA labels, keyboard navigation, and screen reader support
- **Error Handling:** Graceful handling of missing data or errors

---

## State Management

The SiteDetails component integrates with multiple state sources:

### Store Integration

```typescript
const {
 selectedSite, // Currently selected site for details
 closeSiteDetails, // Action to close the modal
 updateSite, // Action to update site settings
 deleteSite, // Action to delete a site
 analytics, // Site analytics data
} = useStore();
```

### Theme Integration

```typescript
const { theme, toggleTheme } = useTheme();
```

### Local State

- Active tab selection
- Modal animation states
- Loading states for individual tabs
- Form states for settings modifications

---

## Tab System

### Overview Tab

- Current status and uptime percentage
- Response time information
- Monitor configuration details
- Recent check history

### Analytics Tab

- Response time charts (line graph)
- Uptime/downtime bar charts
- Performance metrics over time
- Configurable time ranges

### History Tab

- Chronological list of all checks
- Detailed status change information
- Filtering and search capabilities
- Export functionality for historical data

### Settings Tab

- Monitor type configuration
- Check interval settings
- Notification preferences
- Site-specific options

---

## Usage Example

The SiteDetails modal is typically triggered from site cards:

```typescript
import { SiteDetails } from './components/SiteDetails';

function Dashboard() {
  const { selectedSite } = useStore();

  return (
    <div>
      {/* Site cards */}
      {selectedSite && <SiteDetails />}
    </div>
  );
}
```

---

## Performance Considerations

### Lazy Loading

- Tab content is loaded only when accessed
- Charts are rendered on-demand
- Historical data is paginated

### Memoization

- React.memo for tab components
- useMemo for expensive calculations
- useCallback for event handlers

### Optimized Rendering

- Virtual scrolling for large history lists
- Efficient chart updates
- Minimal re-renders with proper state management

---

## Accessibility Features

- **Keyboard Navigation:** Full keyboard support for tabs and interactions
- **ARIA Labels:** Comprehensive labeling for screen readers
- **Focus Management:** Proper focus handling in modal context
- **Color Contrast:** High contrast modes for better visibility
- **Screen Reader Support:** Descriptive text for all visual elements

---

## Styling & Theming

### CSS Organization

- Component-specific styles in `SiteDetails.css`
- Theme variables for consistent coloring
- Responsive breakpoints for mobile compatibility
- Animation transitions for smooth interactions

### Theme Variables

- Automatic light/dark mode switching
- Consistent color schemes across all tabs
- Theme-aware chart styling
- Responsive design patterns

---

## Integration Points

- **Global Store:** Site data, analytics, and actions
- **Theme System:** Consistent styling and user preferences
- **Chart Library:** Chart.js integration for analytics
- **Logger Service:** Comprehensive logging for debugging
- **Screenshot Service:** Image loading and caching

---

## Best Practices Demonstrated

- **Modular Architecture:** Clear separation of concerns
- **Performance Optimization:** Lazy loading and memoization
- **Accessibility First:** Comprehensive accessibility features
- **Type Safety:** Full TypeScript coverage
- **Error Boundaries:** Graceful error handling
- **Responsive Design:** Mobile-first approach
- **Theme Consistency:** Integrated theming system

---

## Testing Strategy

### Unit Tests

- Individual tab component testing
- State management integration tests
- Accessibility compliance tests
- Theme switching functionality

### Integration Tests

- Full modal workflow testing
- Tab navigation and content loading
- Data flow between tabs
- Error handling scenarios

---

## Future Enhancements

- **Export Functionality:** Data export in multiple formats
- **Comparison Mode:** Side-by-side site comparisons
- **Advanced Filtering:** Enhanced search and filter options
- **Customizable Tabs:** User-configurable tab layout
- **Real-time Collaboration:** Multi-user editing support

---

## Related Components

- `SiteCard` - Triggers SiteDetails modal
- `Dashboard` - Container for site management
- `Header` - Global navigation and actions
- `Chart components` - Analytics visualization
- `Themed components` - UI consistency

---

## Development Notes

For developers working on SiteDetails:

1. **Tab Development:** Follow the existing tab pattern for consistency
2. **Performance:** Always consider lazy loading for new features
3. **Accessibility:** Test with screen readers and keyboard navigation
4. **Theming:** Use theme variables for all styling
5. **State Management:** Keep local state minimal, prefer global store
6. **Testing:** Maintain test coverage for all tab components

---

## Contact

For questions or improvements regarding the SiteDetails component, see the project README or open an issue on GitHub.
