# SiteList Components Documentation

## Overview

The SiteList component system manages the display and organization of monitored sites in the main dashboard. It includes the site list container and specialized components for handling empty states and site organization.

---

## Component Hierarchy

```text
Dashboard
└── SiteList (main container)
    ├── EmptyState (when no sites)
    └── SiteCard[] (array of site cards)
```

---

## SiteList Component

### Location & Files

- **Component:** `src/components/Dashboard/SiteList/index.tsx`
- **Purpose**: Main container component for organizing and displaying site cards

### Key Features

#### Layout Management

- **Responsive Grid**: CSS Grid layout that adapts to screen size
- **Dynamic Sizing**: Automatic adjustment based on number of sites
- **Spacing Control**: Consistent spacing between site cards
- **Overflow Handling**: Scroll behavior for large numbers of sites

#### State Management Integration

- **Site Data**: Connects to global site store for real-time updates
- **Loading States**: Handles loading indicators during data fetching
- **Error States**: Displays error messages when site loading fails
- **Empty States**: Shows EmptyState component when no sites exist

### Implementation Pattern

```typescript
interface SiteListProps {
    sites: Site[];
    isLoading: boolean;
    error?: string;
}

export const SiteList = React.memo(function SiteList({
    sites,
    isLoading,
    error
}: SiteListProps) {
    // Handle empty state
    if (!isLoading && sites.length === 0) {
        return <EmptyState />;
    }

    // Handle error state
    if (error) {
        return <ErrorDisplay message={error} />;
    }

    // Render site grid
    return (
        <div className="site-list-grid">
            {sites.map((site) => (
                <SiteCard
                    key={site.id}
                    site={site}
                />
            ))}
        </div>
    );
});
```

### Responsive Design

#### Grid Layout

```css
.site-list-grid {
 display: grid;
 gap: 1rem;
 grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

/* Responsive breakpoints */
@media (max-width: 768px) {
 .site-list-grid {
  grid-template-columns: 1fr;
  gap: 0.75rem;
 }
}

@media (min-width: 1200px) {
 .site-list-grid {
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
 }
}
```

#### Layout Behaviors

- **Mobile**: Single column layout for optimal touch interaction
- **Tablet**: 2-3 columns depending on screen width
- **Desktop**: Auto-fit columns with minimum card width
- **Large Screens**: Maximum columns with optimal card sizing

---

## EmptyState Component

### EmptyState Location & Files

- **Component:** `src/components/Dashboard/SiteList/EmptyState.tsx`
- **Purpose**: Displays helpful content when no sites are being monitored

### EmptyState Features

#### User Guidance

- **Welcome Message**: Friendly introduction for new users
- **Action Prompts**: Clear instructions on how to add first site
- **Visual Elements**: Icons and illustrations to enhance the message
- **Call-to-Action**: Prominent button to start adding sites

#### Design Elements

- **Centered Layout**: Visually centered content for better focus
- **Themed Styling**: Consistent with application theme
- **Responsive Text**: Text sizing that adapts to screen size
- **Accessibility**: Proper heading structure and alt text

### Implementation

```typescript
export const EmptyState = React.memo(function EmptyState() {
    const { setShowAddSiteForm } = useStore();

    return (
        <div className="empty-state-container">
            <div className="empty-state-content">
                {/* Icon/Illustration */}
                <div className="empty-state-icon">
                    <MdMonitorHeart className="text-6xl text-secondary" />
                </div>

                {/* Message */}
                <ThemedText
                    size="2xl"
                    weight="bold"
                    className="mb-2 text-center"
                >
                    No Sites Yet
                </ThemedText>

                <ThemedText
                    size="lg"
                    variant="secondary"
                    className="mb-6 text-center max-w-md"
                >
                    Start monitoring your websites and services by adding your first site.
                </ThemedText>

                {/* Call-to-Action */}
                <ThemedButton
                    variant="primary"
                    size="lg"
                    onClick={() => setShowAddSiteForm(true)}
                    className="add-first-site-button"
                >
                    <MdAdd className="mr-2" />
                    Add Your First Site
                </ThemedButton>

                {/* Additional Help */}
                <ThemedText
                    size="sm"
                    variant="secondary"
                    className="mt-4 text-center"
                >
                    You can monitor websites, APIs, or any HTTP endpoint
                </ThemedText>
            </div>
        </div>
    );
});
```

### Visual Design

#### Layout Structure

- **Vertical Centering**: Content centered both horizontally and vertically
- **Progressive Disclosure**: Information hierarchy from icon to action
- **Whitespace Usage**: Generous spacing for clean, uncluttered feel
- **Visual Flow**: Eye flow from icon → message → action → help text

#### Styling Considerations

```css
.empty-state-container {
 display: flex;
 align-items: center;
 justify-content: center;
 min-height: 400px;
 padding: 2rem;
}

.empty-state-content {
 display: flex;
 flex-direction: column;
 align-items: center;
 text-align: center;
 max-width: 500px;
}

.empty-state-icon {
 margin-bottom: 1.5rem;
 opacity: 0.8;
}

.add-first-site-button {
 transition: transform 0.2s ease;
}

.add-first-site-button:hover {
 transform: translateY(-1px);
}
```

---

## Integration Patterns

### Store Integration

The SiteList components integrate tightly with the application store:

```typescript
// In parent Dashboard component
const { sites, isLoading, error, setShowAddSiteForm } = useStore();

// Data flow to SiteList
<SiteList
    sites={sites}
    isLoading={isLoading}
    error={error}
/>

// EmptyState integration
const EmptyState = () => {
    const { setShowAddSiteForm } = useStore();
    // Component implementation
};
```

### Event Handling

#### Site Addition Flow

```typescript
// EmptyState triggers site addition
<ThemedButton onClick={() => setShowAddSiteForm(true)}>
    Add Your First Site
</ThemedButton>

// Store handles modal state
const setShowAddSiteForm = (show: boolean) => {
    set({ showAddSiteForm: show });
};
```

#### Site Card Interactions

```typescript
// Each SiteCard handles its own interactions
<SiteCard
    site={site}
    onCardClick={handleSiteDetailsOpen}
    onStatusCheck={handleStatusCheck}
    onToggleMonitoring={handleToggleMonitoring}
/>
```

---

## Performance Optimizations

### List Rendering

#### Memoization Strategy

```typescript
// SiteList is memoized to prevent unnecessary re-renders
export const SiteList = React.memo(function SiteList(props) {
 // Component implementation
});

// Individual SiteCards are also memoized
export const SiteCard = React.memo(function SiteCard(props) {
 // Component implementation
});
```

#### Key Strategy

```typescript
// Stable keys for consistent rendering
{sites.map((site) => (
    <SiteCard
        key={site.id} // Use stable site ID as key
        site={site}
    />
))}
```

### Large Dataset Handling

For applications with many sites, consider:

- **Virtual Scrolling**: Render only visible site cards
- **Pagination**: Break large lists into pages
- **Filtering**: Client-side filtering to reduce rendered items
- **Search**: Real-time search to narrow displayed sites

### Memory Management

```typescript
// Cleanup in useEffect hooks
useEffect(() => {
 // Set up site monitoring
 const cleanup = setupSiteMonitoring();

 return () => {
  // Clean up subscriptions and timers
  cleanup();
 };
}, []);
```

---

## Accessibility Features

### Keyboard Navigation

#### Tab Order

- **Sequential Navigation**: Logical tab order through site cards
- **Skip Links**: Option to skip to specific sites or actions
- **Focus Management**: Proper focus indicators and management

#### Keyboard Shortcuts

```typescript
// Keyboard event handling
useEffect(() => {
 const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
   case "a":
    if (e.ctrlKey || e.metaKey) {
     e.preventDefault();
     setShowAddSiteForm(true);
    }
    break;
   case "f":
    if (e.ctrlKey || e.metaKey) {
     e.preventDefault();
     focusSearchInput();
    }
    break;
  }
 };

 window.addEventListener("keydown", handleKeyDown);
 return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

### Screen Reader Support

#### ARIA Labels

```typescript
// Proper ARIA labeling for site list
<div
    role="grid"
    aria-label="Monitored sites"
    aria-rowcount={sites.length}
>
    {sites.map((site, index) => (
        <div
            key={site.id}
            role="gridcell"
            aria-rowindex={index + 1}
            aria-label={`Site: ${site.name}, Status: ${site.status}`}
        >
            <SiteCard site={site} />
        </div>
    ))}
</div>
```

#### Status Announcements

```typescript
// Live region for status updates
<div aria-live="polite" aria-atomic="true" className="sr-only">
    {announcements.map((announcement) => (
        <div key={announcement.id}>
            {announcement.message}
        </div>
    ))}
</div>
```

---

## Error Handling

### Error Display

```typescript
// Error state rendering
if (error) {
    return (
        <ThemedCard variant="error" padding="lg" className="text-center">
            <MdError className="text-4xl mb-4 text-error" />
            <ThemedText size="lg" weight="semibold" className="mb-2">
                Unable to Load Sites
            </ThemedText>
            <ThemedText variant="secondary" className="mb-4">
                {error}
            </ThemedText>
            <ThemedButton
                variant="primary"
                onClick={handleRetry}
            >
                Try Again
            </ThemedButton>
        </ThemedCard>
    );
}
```

### Recovery Mechanisms

- **Retry Logic**: Automatic retry with exponential backoff
- **Manual Retry**: User-triggered retry buttons
- **Partial Loading**: Show available sites even if some fail to load
- **Error Boundaries**: Prevent component crashes from affecting the entire app

---

## Future Enhancements

### Planned Features

- **Drag & Drop**: Reorder sites by dragging cards
- **Bulk Actions**: Select multiple sites for batch operations
- **List Views**: Alternative compact list view option
- **Grouping**: Group sites by tags or status

### Advanced Features

- **Virtual Scrolling**: Handle thousands of sites efficiently
- **Real-time Updates**: WebSocket-based live updates
- **Offline Support**: Show cached data when offline
- **Export/Import**: Backup and restore site configurations

### Customization Options

- **Card Layouts**: User-selectable card layouts and sizes
- **Sort Options**: Multiple sorting criteria and directions
- **Filter Presets**: Save and reuse filter combinations
- **Dashboard Widgets**: Additional dashboard components beyond site cards
