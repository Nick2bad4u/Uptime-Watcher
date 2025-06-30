# Dashboard Component Documentation

## Overview

The Dashboard represents the main application interface of the Uptime Watcher, implemented primarily through the `App.tsx` component. It orchestrates the display and management of monitored sites through a coordinated system of components including the Header, SiteList, AddSiteForm sidebar, and modal dialogs. This serves as the primary interface where users can view site statuses, add new sites, and access detailed site information.

---

## Location & Structure

The Dashboard functionality is distributed across multiple components:

- **Main Application:** `src/App.tsx` (main dashboard logic and layout)
- **Site Cards:** `src/components/Dashboard/SiteCard/` (individual site displays)
- **Site List:** `src/components/Dashboard/SiteList/` (site list container)
- **Form Component:** `src/components/AddSiteForm/` (new site creation)

---

## Architecture

### Component Hierarchy

```text
App (Main Dashboard Logic)
├── Header (global app header)
├── Main Content Grid
│   ├── SiteList Container
│   │   └── SiteCard (for each site)
│   └── AddSiteForm Sidebar
├── SiteDetails (modal, when site is selected)
└── Settings (modal, when settings opened)
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

- **Site Selection:** Click on any site card to view detailed site information in modal
- **Form Sidebar:** Fixed sidebar with AddSiteForm for streamlined new site addition
- **Real-time Actions:** Monitor control buttons in each site card header
- **Modal Management:** Overlay dialogs for Settings and SiteDetails without page navigation

---

## State Management

### Global Store Integration

```typescript
const {
 sites, // Array of all monitored sites
 isLoading, // Global loading state
 selectedSite, // Currently selected site for details
 showSettings, // Settings modal visibility state
 showSiteDetails, // Site details modal visibility state
 setShowSettings, // Action to toggle settings modal
 setShowSiteDetails, // Action to toggle site details modal
 getSelectedSite, // Function to get currently selected site
 lastError, // Global error state
 clearError, // Action to clear global errors
 updateStatus, // App update status
 updateError, // Update error messages
} = useStore();
```

### Local State

- **Loading overlay state:** Delayed loading indicator to prevent flash for quick operations
- **Modal visibility:** Local state management for modal open/close
- **Theme integration:** Theme-aware styling and dark/light mode support
- **Focus synchronization:** Optional backend sync when window gains focus

---

## Layout System

### Responsive Grid

- **Desktop:** Two-column grid with main content area and fixed sidebar
- **Tablet:** Single-column layout with stacked content sections
- **Mobile:** Full-width single column with responsive card sizing

### CSS Grid Implementation

The main layout uses CSS Grid with a two-column structure:

```css
.grid-layout {
 display: grid;
 grid-template-columns: 1fr 400px;
 gap: 2rem;
 padding: 2rem;
}

/* Responsive behavior for smaller screens */
@media (max-width: 1024px) {
 .grid-layout {
  grid-template-columns: 1fr;
  gap: 1rem;
 }
}
```

### Site Card Layout

Each site is displayed in a standardized card format within the SiteList:

- **Header:** Site name and monitor selector with action buttons
- **Status:** Current monitoring status with visual indicators
- **Metrics:** Key performance indicators (uptime, response time, check count)
- **History:** Mini chart showing recent status history
- **Footer:** Additional card spacing and future expansion area

---

## Data Flow

### Real-time Updates

1. **Monitor Services** → Check site status
2. **Backend Services** → Process and store results
3. **IPC Communication** → Send status updates to frontend
4. **Store Subscription** → useStore subscribes to status updates
5. **Component Re-render** → SiteCard components automatically reflect changes

### User Actions

1. **User Interaction** → Click/action in SiteCard or AddSiteForm
2. **Store Action** → Trigger appropriate store action (addSite, etc.)
3. **IPC Request** → Send request to backend via Electron IPC
4. **Backend Operation** → Execute monitoring or database operation
5. **State Update** → Update store with results and refresh UI

---

## Performance Optimizations

### Rendering Efficiency

- **React.memo** for SiteCard components to prevent unnecessary re-renders
- **Delayed loading overlay** only shows after 100ms to prevent flash
- **Optimized status subscriptions** with smart incremental updates
- **Theme-aware rendering** with efficient dark/light mode switching

### Data Management

- **Smart subscriptions** to status updates with automatic cleanup
- **Focus-based sync** available for backend state synchronization
- **Global error handling** with user-friendly error notifications
- **Update management** for app version updates with download progress

---

## User Experience Features

### Progressive Loading

- **Delayed loading indicators** with 100ms threshold to prevent flash
- **ThemeProvider integration** for consistent loading state styling
- **Modal-based workflows** for detailed views without page reload
- **Optimistic error recovery** with retry mechanisms and user feedback

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

- **App Initialization Service:** Handles initial app startup and backend connection
- **Status Update Subscription:** Real-time monitoring status updates via IPC
- **Theme Service:** Light/dark mode management and consistent theming
- **Modal Management:** Centralized Settings and SiteDetails modal handling

### External Dependencies

- **React:** Core framework with hooks for state management
- **Zustand:** Lightweight state management for global app state
- **Electron IPC:** Communication bridge between frontend and backend
- **Theme System:** Custom theming with ThemedBox, ThemedText, ThemedButton components

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

- **Grid-based layout:** Two-column desktop, single-column mobile
- **Fixed sidebar:** Consistent AddSiteForm placement
- **Modal overlays:** Settings and site details as overlay dialogs
- **Responsive breakpoints:** Automatic layout adaptation by screen size

### Display Options

- **Theme integration:** Automatic light/dark mode support throughout
- **Status indicators:** Color-coded status badges and real-time updates
- **Global notifications:** Error alerts and update notifications
- **Loading states:** Consistent loading indicators with intelligent timing

---

## Best Practices Demonstrated

- **Component Composition:** App.tsx orchestrates specialized components rather than monolithic design
- **State Management:** Zustand for global state with local state for UI-specific concerns
- **Performance First:** React.memo, delayed loading, and optimized subscriptions
- **Error Boundaries:** Global error handling with user-friendly notifications
- **Theme Integration:** Comprehensive theming system with automatic mode switching
- **Modal Management:** Centralized modal state without complex routing
- **Type Safety:** Full TypeScript coverage throughout the application stack

---

## Future Enhancements

### Advanced Features

- **Enhanced notification system** with customizable alerts and persistence
- **Bulk site operations** for efficient management of multiple sites
- **Workspace management** with site grouping and categorization
- **Export/import functionality** for site configurations and backup
- **Plugin system** for extensible monitoring capabilities

### User Experience

- **Improved sidebar functionality** with collapsible form and quick actions
- **Enhanced search and filtering** across site lists with saved criteria
- **Keyboard shortcuts** for efficient navigation and site management
- **Drag-and-drop** site reordering and organization
- **Offline functionality** with intelligent sync when connection restored

---

## Related Components

- `App.tsx` - Main dashboard container and layout orchestration
- `SiteCard` - Individual site display component within the SiteList
- `SiteList` - Site collection container with empty state handling
- `AddSiteForm` - New site creation interface in the sidebar
- `SiteDetails` - Detailed site information modal with tabbed interface
- `Header` - Global navigation and system status overview
- `Settings` - Application configuration modal

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

For questions or improvements regarding the Dashboard functionality or the main App component, see the project README or open an issue on GitHub.
