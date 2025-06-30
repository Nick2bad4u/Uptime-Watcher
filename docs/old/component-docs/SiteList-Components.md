# SiteList Components Documentation

## Overview

The SiteList component system manages the display and organization of monitored sites in the main dashboard. It includes the site list container and specialized components for handling empty states and site organization.

## Component Hierarchy

```text
App (main dashboard)
├── Header
└── Main Content Grid
    ├── SiteList Container
    │   ├── EmptyState (when no sites)
    │   └── SiteCard[] (array of site cards with dividers)
    └── AddSiteForm Sidebar
```

## SiteList Component

### Location & Files

- **Component:** `src/components/Dashboard/SiteList/index.tsx`
- **Purpose**: Main container component for organizing and displaying site cards

### Props Interface

The SiteList component takes no props and manages its own data through store integration:

```typescript
export function SiteList() {
 const { sites } = useStore();
 const { isDark } = useTheme();
 // Implementation...
}
```

### Key Features

- **Store Integration**: Directly connects to global store for site data
- **Theme Awareness**: Integrates with theme system for light/dark mode
- **Conditional Rendering**: Shows EmptyState when no sites exist
- **Divider Layout**: Uses divider-y class for visual separation between site cards
- **Performance Optimized**: Simple rendering without unnecessary complexity

### Implementation

```typescript
export function SiteList() {
    const { sites } = useStore();
    const { isDark } = useTheme();

    if (sites.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className={`divider-y ${isDark ? "dark" : ""}`}>
            {sites.map((site) => (
                <SiteCard key={site.identifier} site={site} />
            ))}
        </div>
    );
}
```

### Layout Design

- **Divider Layout**: Uses `divider-y` class to create visual separation between cards
- **Theme Styling**: Applies theme-aware divider colors through conditional class application
- **Unique Keys**: Uses `site.identifier` as the unique key for each SiteCard
- **Simple Structure**: Clean, minimal implementation focused on display

## EmptyState Component

### Location & Files

- **Component:** `src/components/Dashboard/SiteList/EmptyState.tsx`
- **Purpose**: Displays helpful content when no sites are being monitored

### Props Interface

The EmptyState component takes no props and is self-contained:

```typescript
export function EmptyState() {
 // Simple implementation with themed components
}
```

### Features

- **Simple Message**: Centered message encouraging users to add sites
- **Themed Components**: Uses ThemedBox and ThemedText for consistent styling
- **Icon Display**: Simple emoji icon (🌐) for visual appeal
- **Accessibility**: Proper text hierarchy and semantic structure

### Implementation

```typescript
export function EmptyState() {
    return (
        <ThemedBox surface="base" padding="xl" className="text-center">
            <div className="empty-state-icon">🌐</div>
            <ThemedText size="lg" weight="medium" className="mb-2">
                No sites to monitor
            </ThemedText>
            <ThemedText variant="secondary">
                Add your first website to start monitoring its uptime.
            </ThemedText>
        </ThemedBox>
    );
}
```

### Design Elements

- **Centered Layout**: Text-center class for centered content alignment
- **Icon Display**: Simple emoji icon with custom styling via CSS
- **Typography Hierarchy**: Large primary text with secondary descriptive text
- **Themed Integration**: Uses surface="base" and appropriate text variants

## Integration with App.tsx

The SiteList is integrated into the main application layout in `App.tsx`:

### Usage Context

```typescript
// In App.tsx main content area
<main className="main-container">
    <div className="grid-layout">
        {/* Main content */}
        <div>
            <ThemedBox surface="elevated" padding="md" shadow="sm" rounded="lg">
                <ThemedBox surface="base" padding="md" border className="border-b">
                    <ThemedText size="lg" weight="medium">
                        Monitored Sites ({sites.length})
                    </ThemedText>
                </ThemedBox>
                <div className="p-0">
                    <SiteList />
                </div>
            </ThemedBox>
        </div>

        {/* Sidebar with AddSiteForm */}
        <div>
            <AddSiteForm />
        </div>
    </div>
</main>
```

### Layout Structure

- **Grid Layout**: Two-column grid with main content and sidebar
- **Container Styling**: Wrapped in ThemedBox with elevation and shadows
- **Header Section**: Shows site count and provides visual separation
- **Content Area**: SiteList renders in zero-padding container for edge-to-edge cards

## Store Integration

Both components integrate directly with the application store:

### SiteList Store Usage

```typescript
// Direct store access
const { sites } = useStore();
const { isDark } = useTheme();
```

### Data Flow

1. **Store Management**: Sites array comes from global Zustand store
2. **Real-time Updates**: Store automatically updates when sites change
3. **Theme Integration**: Component responds to theme changes automatically
4. **Conditional Rendering**: EmptyState shown when sites array is empty

## Performance Considerations

### Simple Implementation

The SiteList components use a straightforward approach for optimal performance:

- **Direct Store Access**: No props drilling, components access store directly
- **Minimal Re-renders**: Components only re-render when their specific store data changes
- **Efficient Keys**: Uses stable `site.identifier` keys for React reconciliation
- **No Memoization**: Simple enough implementation that memoization isn't needed

### Memory Management

```typescript
// Automatic cleanup through store subscription
const { sites } = useStore(); // Zustand handles subscription lifecycle
```

## Key Features

### SiteList Features

- **Theme Integration**: Automatic light/dark mode styling
- **Store Integration**: Direct access to global site data
- **Conditional Rendering**: Automatic empty state handling
- **Visual Separation**: Divider styling between site cards
- **Performance Optimized**: Minimal overhead with direct store access

### EmptyState Features

- **User Guidance**: Clear messaging about adding first site
- **Themed Styling**: Consistent with application theme
- **Simple Design**: Clean, focused message without clutter
- **Accessibility**: Proper text hierarchy and semantic structure

## CSS Integration

### SiteList Styling

The component relies on CSS classes for layout and theming:

```css
/* Theme-aware divider styling */
.divider-y {
 /* Divider styling between cards */
}

.divider-y.dark {
 /* Dark mode divider colors */
}
```

### EmptyState Styling

```css
.empty-state-icon {
 /* Custom icon styling for emoji display */
}
```

## Related Components

- **App.tsx** - Main application component that renders SiteList in grid layout
- **SiteCard** - Individual site display component rendered by SiteList
- **AddSiteForm** - Sidebar form for adding new sites (separate from SiteList)
- **Header** - Application header component (sibling to main content)
- **SiteDetails** - Modal component triggered from SiteCard interactions

## Technical Implementation

### Component Architecture

- **Functional Components**: Both components use modern React function syntax
- **Store Integration**: Direct access to Zustand store without props
- **Theme Awareness**: Integration with custom theme system
- **Simple Rendering**: Minimal complexity for maximum performance

### Development Notes

1. **No Props Required**: Components are self-contained with store access
2. **Theme System**: Uses custom ThemedBox and ThemedText components
3. **Store Subscriptions**: Zustand handles subscription lifecycle automatically
4. **CSS Classes**: Relies on CSS classes for layout and theming
5. **Simple Keys**: Uses site.identifier for stable React keys
