# Dashboard Component Documentation

## Overview

The `Dashboard` is the main view component of the Uptime Watcher application, responsible for displaying and managing the list of monitored sites. It serves as the primary interface where users can view site statuses, add new sites, and access detailed site information.

---

## Location & Structure

The Dashboard is organized as a component system:

- **Main Component:** `src/components/Dashboard/` (main dashboard logic)
- **Site Cards:** `src/components/Dashboard/SiteCard/` (individual site displays)
- **Site List:** `src/components/Dashboard/SiteList/` (site list container)

---

## Architecture

### Component Hierarchy

```text
Dashboard
├── SiteList
│   ├── SiteCard (for each site)
│   └── AddSiteForm (when adding new sites)
├── Header (global app header)
└── SiteDetails (modal, when site is selected)
```

### Key Responsibilities

1. **Site Management:** Display and organize monitored sites
2. **Status Overview:** Show real-time status of all sites
3. **User Interactions:** Handle site selection, addition, and removal
4. **Data Flow:** Coordinate between global state and UI components
5. **Layout Management:** Responsive grid layout for different screen sizes

---

## Key Features

### Site Display

- **Grid Layout:** Responsive card-based layout for site display
- **Real-time Status:** Live updates of site monitoring status
- **Visual Indicators:** Color-coded status badges and icons
- **Quick Actions:** Direct access to site actions from cards

### User Interface

- **Responsive Design:** Adapts to desktop, tablet, and mobile screens
- **Theme Support:** Full light/dark theme integration
- **Loading States:** Visual feedback during data loading
- **Empty States:** Helpful messages when no sites are configured

### Interaction Features

- **Site Selection:** Click to view detailed site information
- **Quick Add:** Streamlined process for adding new sites
- **Bulk Operations:** Multi-site actions and management
- **Search/Filter:** Find specific sites in large lists

---

## State Management

### Global Store Integration

```typescript
const {
  sites,           // Array of all monitored sites
  isLoading,       // Global loading state
  selectedSite,    // Currently selected site for details
  addSite,         // Action to add new site
  removeSite,      // Action to remove site
  selectSite,      // Action to select site for details
  updateSite       // Action to update site configuration
} = useStore();
```

### Local State

- Search/filter criteria
- Layout preferences
- User interface state (modals, dialogs)
- Loading states for individual operations

---

## Layout System

### Responsive Grid

- **Desktop:** Multi-column grid with optimal spacing
- **Tablet:** Adjusted columns for medium screens
- **Mobile:** Single-column layout for small screens

### CSS Grid Implementation

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
}
```

### Site Card Layout

Each site is displayed in a standardized card format:

- **Header:** Site name and URL
- **Status:** Current monitoring status with visual indicators
- **Metrics:** Key performance indicators (uptime, response time)
- **Actions:** Quick action buttons (view details, pause, delete)

---

## Data Flow

### Real-time Updates

1. **Monitor Services** → Check site status
2. **Backend Services** → Process and store results
3. **IPC Communication** → Send updates to frontend
4. **Store Updates** → Update global state
5. **Component Re-render** → Reflect changes in UI

### User Actions

1. **User Interaction** → Trigger action in component
2. **Store Dispatch** → Send action to global store
3. **Backend Operation** → Execute operation via IPC
4. **State Update** → Update store with results
5. **UI Feedback** → Show success/error feedback

---

## Performance Optimizations

### Rendering Efficiency

- **React.memo** for SiteCard components
- **Virtual scrolling** for large site lists
- **Lazy loading** of site details
- **Debounced search** for filtering

### Data Management

- **Selective updates** only for changed sites
- **Cached calculations** for performance metrics
- **Optimized re-renders** with proper dependency arrays
- **Background processing** for non-critical updates

---

## User Experience Features

### Progressive Loading

- **Skeleton screens** during initial load
- **Incremental loading** for large datasets
- **Smooth transitions** between states
- **Optimistic updates** for immediate feedback

### Accessibility

- **Keyboard navigation** for all interactive elements
- **Screen reader support** with proper ARIA labels
- **High contrast mode** support
- **Focus management** for modal interactions

### Error Handling

- **Graceful degradation** when services are unavailable
- **Error boundaries** to prevent crashes
- **User-friendly error messages** with actionable advice
- **Retry mechanisms** for failed operations

---

## Integration Points

### Core Services

- **Monitoring Service:** Real-time site status updates
- **Database Service:** Site configuration and history
- **Notification Service:** Status change alerts
- **Theme Service:** UI appearance and preferences

### External Dependencies

- **Chart Libraries:** For analytics visualization
- **Icon Libraries:** Status indicators and UI icons
- **Animation Libraries:** Smooth transitions and feedback
- **Utility Libraries:** Date formatting, validation, etc.

---

## Testing Strategy

### Component Testing

- **Unit tests** for individual components
- **Integration tests** for component interactions
- **Snapshot tests** for UI consistency
- **Accessibility tests** for compliance

### User Flow Testing

- **E2E tests** for complete user workflows
- **Performance tests** for large datasets
- **Responsive tests** across different screen sizes
- **Theme switching tests** for visual consistency

---

## Configuration Options

### Layout Preferences

- Grid vs. list view options
- Card size and density settings
- Sort order preferences
- Column configuration for list view

### Display Options

- Status indicator styles
- Metric display preferences
- Color scheme customization
- Animation settings

---

## Best Practices Demonstrated

- **Component Composition:** Modular, reusable components
- **State Management:** Centralized state with local optimizations
- **Performance First:** Optimized rendering and data handling
- **Accessibility:** Comprehensive accessibility features
- **Responsive Design:** Mobile-first, adaptive layouts
- **Error Handling:** Robust error boundaries and user feedback
- **Type Safety:** Full TypeScript coverage

---

## Future Enhancements

### Advanced Features

- **Customizable dashboards** with widget system
- **Advanced filtering** with saved filter sets
- **Bulk operations** for site management
- **Export functionality** for site configurations
- **Real-time collaboration** for team environments

### User Experience

- **Drag-and-drop** site organization
- **Custom grouping** and categorization
- **Advanced search** with multiple criteria
- **Keyboard shortcuts** for power users
- **Offline mode** with sync capabilities

---

## Related Components

- `SiteCard` - Individual site display component
- `SiteList` - Site collection container
- `AddSiteForm` - New site creation interface
- `SiteDetails` - Detailed site information modal
- `Header` - Global navigation and controls

---

## Development Guidelines

### Adding New Features

1. **Follow existing patterns** for consistency
2. **Consider performance impact** of new features
3. **Maintain accessibility** standards
4. **Test across all screen sizes** and themes
5. **Update documentation** for new functionality

### Component Development

1. **Use TypeScript** for all new components
2. **Implement proper error boundaries** for robustness
3. **Follow the theme system** for styling
4. **Add comprehensive tests** for new features
5. **Consider mobile experience** in design decisions

---

## Contact

For questions or improvements regarding the Dashboard component, see the project README or open an issue on GitHub.
