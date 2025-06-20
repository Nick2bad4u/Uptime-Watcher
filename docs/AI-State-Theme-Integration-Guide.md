# AI Assistant Guide: State Management & Theme Integration in Uptime Watcher

## Overview

This guide provides comprehensive instructions for AI assistants working on the Uptime Watcher Electron application. The project uses a sophisticated state management system with Zustand and a comprehensive theme system that are tightly integrated throughout the application.

## Project Architecture Summary

- **State Management**: Zustand with persistence middleware
- **Theme System**: Custom theme manager with CSS custom properties and React hooks
- **UI Components**: Themed component library with consistent patterns
- **Integration**: State and theme are connected through the store and theme hooks

## 🏗️ State Management Architecture

### Core State Store (`src/store.ts`)

The application uses Zustand for centralized state management with the following key principles:

#### State Structure

```typescript
interface AppState {
  // Core data
  sites: Site[];
  isMonitoring: boolean;
  checkInterval: number;
  settings: AppSettings;
  
  // UI state
  showSettings: boolean;
  selectedSite: Site | null;
  showSiteDetails: boolean;
  
  // Error handling
  lastError: string | null;
  isLoading: boolean;
  
  // Statistics
  totalUptime: number;
  totalDowntime: number;
  
  // Legacy compatibility
  darkMode: boolean; // Synced with settings.theme
}
```

#### Settings Structure

```typescript
interface AppSettings {
  notifications: boolean;
  autoStart: boolean;
  minimizeToTray: boolean;
  theme: ThemeName; // "light" | "dark" | "high-contrast" | "system"
  timeout: number;
  maxRetries: number;
  soundAlerts: boolean;
  historyLimit: number;
}
```

### State Access Patterns

#### ✅ Correct: Using Store Actions

```typescript
const { sites, addSite, updateSiteStatus, setError, setLoading } = useStore();

// Add site with proper error handling
const handleAddSite = async (siteData) => {
  setLoading(true);
  try {
    const newSite = await window.electronAPI.addSite(siteData);
    addSite(newSite);
  } catch (error) {
    setError(`Failed to add site: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
```

#### ❌ Incorrect: Direct State Mutation

```typescript
// DON'T DO THIS - Direct mutation
sites.push(newSite);

// DON'T DO THIS - Missing error handling
const newSite = await window.electronAPI.addSite(siteData);
addSite(newSite);
```

### Error Handling Pattern

All async operations should follow this pattern:

```typescript
const { setError, setLoading, clearError } = useStore();

const handleAsyncOperation = async () => {
  setLoading(true);
  clearError(); // Clear previous errors
  
  try {
    const result = await window.electronAPI.someOperation();
    // Update state with result
    // Show success notification if needed
  } catch (error) {
    setError(`Operation failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
```

### State Persistence

The store automatically persists:

- ✅ `sites` - Maintain site history across sessions
- ✅ `settings` - User preferences
- ✅ `checkInterval` - Monitoring configuration
- ✅ `darkMode` - Legacy theme compatibility
- ✅ `totalUptime/totalDowntime` - Statistics
- ❌ UI states (`showSettings`, `selectedSite`, etc.)
- ❌ Error/loading states

## 🎨 Theme System Architecture

### Theme Manager (`src/theme/ThemeManager.ts`)

The theme system is built around a singleton ThemeManager that handles:

- Theme switching and detection
- CSS custom property application
- System theme preference detection
- Theme persistence through the state store

#### Theme Structure

```typescript
interface Theme {
  name: string;
  colors: ThemeColors; // Comprehensive color palette
  spacing: ThemeSpacing; // Consistent spacing scale
  typography: ThemeTypography; // Typography system
  shadows: ThemeShadows; // Box shadow variations
  borderRadius: ThemeBorderRadius; // Consistent border radius
  isDark: boolean; // Dark mode flag
}
```

### Theme Integration with State

The theme system is connected to the state store through the `settings.theme` property:

```typescript
// In useTheme hook
const { settings, updateSettings } = useStore();

const setTheme = (themeName: ThemeName) => {
  updateSettings({ theme: themeName });
};
```

### Theme Hook Usage Patterns

#### Primary Theme Hook (`useTheme`)

```typescript
const {
  currentTheme,       // Current active theme object
  themeName,          // Current theme name from settings
  systemTheme,        // System preference ("light" | "dark")
  setTheme,           // Change theme function
  toggleTheme,        // Toggle between light/dark
  getColor,           // Get theme color by path
  getStatusColor,     // Get status-specific colors
  availableThemes,    // List of available themes
  isDark,             // Boolean for dark mode
  themeManager        // Direct access to manager
} = useTheme();
```

#### Theme-Aware Styling (`useThemeClasses`)

```typescript
const {
  getBackgroundClass,  // Background color styles
  getTextClass,        // Text color styles
  getBorderClass,      // Border color styles
  getSurfaceClass,     // Surface color styles
  getStatusClass,      // Status color styles
  getColor            // Direct color access
} = useThemeClasses();
```

#### Specialized Hooks

```typescript
// For theme-dependent values
const fontSize = useThemeValue(theme => theme.typography.fontSize.lg);

// For status colors
const { up, down, pending, unknown } = useStatusColors();
```

## 🧩 Themed Component System

### Component Usage Patterns

#### ✅ Correct: Using Themed Components

```typescript
import {
  ThemedBox,
  ThemedText,
  ThemedButton,
  StatusIndicator,
  ThemedInput,
  ThemedSelect,
  ThemedCheckbox
} from "../theme/components";

function MyComponent() {
  return (
    <ThemedBox variant="secondary" padding="lg" rounded="lg" shadow="md">
      <ThemedText variant="primary" size="lg" weight="semibold">
        Site Status
      </ThemedText>
      <StatusIndicator status="up" size="md" />
      <ThemedButton variant="primary" size="md" onClick={handleAction}>
        Check Now
      </ThemedButton>
    </ThemedBox>
  );
}
```

#### ❌ Incorrect: Direct Styling

```typescript
// DON'T DO THIS - Hardcoded colors and styles
function MyComponent() {
  return (
    <div style={{ backgroundColor: '#ffffff', padding: '16px' }}>
      <span style={{ color: '#000000', fontSize: '18px' }}>
        Site Status
      </span>
    </div>
  );
}
```

### Available Themed Components

- **Layout**: `ThemedBox` - Container with background, padding, borders
- **Typography**: `ThemedText` - Text with theme-aware colors and typography
- **Interactive**: `ThemedButton` - Buttons with variants and states
- **Status**: `StatusIndicator` - Site status with colors and icons
- **Forms**: `ThemedInput`, `ThemedSelect`, `ThemedCheckbox`
- **Charts**: `MiniChartBar` - Theme-aware data visualization

### Component Variant System

Most components support variants that automatically adapt to the current theme:

```typescript
// Background variants
<ThemedBox variant="primary" />     // Main background
<ThemedBox variant="secondary" />   // Secondary background
<ThemedBox variant="tertiary" />    // Subtle background

// Surface variants  
<ThemedBox surface="base" />        // Base surface
<ThemedBox surface="elevated" />    // Elevated surface
<ThemedBox surface="overlay" />     // Modal/overlay surface

// Button variants
<ThemedButton variant="primary" />   // Primary action
<ThemedButton variant="secondary" /> // Secondary action
<ThemedButton variant="success" />   // Success action
<ThemedButton variant="warning" />   // Warning action
<ThemedButton variant="error" />     // Destructive action
<ThemedButton variant="ghost" />     // Minimal styling
```

## 🔧 Implementation Guidelines

### Adding New Components

When creating new components, follow these patterns:

#### 1. Use Store for State Management
```typescript
import { useStore } from "../store";

function NewComponent() {
  const { 
    // Select only what you need
    sites, 
    addSite, 
    setError, 
    setLoading,
    isLoading 
  } = useStore();
  
  // Component logic
}
```

#### 2. Use Themed Components
```typescript
import {
  ThemedBox,
  ThemedText,
  ThemedButton
} from "../theme/components";
import { useTheme } from "../theme/useTheme";

function NewComponent() {
  const { getStatusColor } = useTheme();
  
  return (
    <ThemedBox variant="primary" padding="lg">
      <ThemedText variant="primary" size="lg">
        Content
      </ThemedText>
    </ThemedBox>
  );
}
```

#### 3. Implement Error Handling
```typescript
function NewComponent() {
  const { setError, setLoading, clearError } = useStore();
  
  const handleAction = async () => {
    setLoading(true);
    clearError();
    
    try {
      await someAsyncOperation();
      // Handle success
    } catch (error) {
      setError(`Action failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
}
```

### Modifying Existing Components

#### State Updates
- Always use store actions, never mutate state directly
- Clear previous errors before new operations
- Use loading states for user feedback
- Handle both success and error cases

#### Theme Updates
- Use themed components instead of hardcoded styles
- Leverage the variant system for consistency
- Use theme hooks for dynamic styling
- Ensure accessibility across all themes

### Error Handling Patterns

#### Global Error Display
Errors are automatically displayed in the main App component:

```typescript
// In App.tsx - automatic error handling
{lastError && (
  <div className="error-notification">
    <ThemedText variant="error">{lastError}</ThemedText>
    <ThemedButton onClick={clearError}>Dismiss</ThemedButton>
  </div>
)}
```

#### Component-Level Error Handling
```typescript
function ComponentWithAsyncAction() {
  const { setError, setLoading, isLoading } = useStore();
  const [localError, setLocalError] = useState<string | null>(null);
  
  const handleAction = async () => {
    setLoading(true);
    setLocalError(null);
    
    try {
      const result = await window.electronAPI.action();
      // Handle success
    } catch (error) {
      // For user-facing errors, use global error
      setError(`Failed to perform action: ${error.message}`);
      // For component-specific errors, use local state
      setLocalError("Please check your input and try again");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ThemedBox>
      {localError && (
        <ThemedText variant="error">{localError}</ThemedText>
      )}
      <ThemedButton 
        disabled={isLoading} 
        loading={isLoading}
        onClick={handleAction}
      >
        {isLoading ? "Processing..." : "Perform Action"}
      </ThemedButton>
    </ThemedBox>
  );
}
```

## 🎯 Common Patterns and Best Practices

### State Selection Optimization
```typescript
// ✅ Good: Select only what you need
const { sites, addSite } = useStore();

// ❌ Avoid: Selecting entire store
const store = useStore();
```

### Theme Integration
```typescript
// ✅ Good: Use theme hooks for dynamic values
const { getStatusColor, currentTheme } = useTheme();
const statusColor = getStatusColor(site.status);

// ❌ Avoid: Hardcoded theme values
const statusColor = site.status === "up" ? "#10b981" : "#ef4444";
```

### Loading State Management
```typescript
// ✅ Good: Centralized loading with delayed UI updates
const { isLoading, setLoading } = useStore();
const [showLoadingSpinner, setShowLoadingSpinner] = useState(false);

useEffect(() => {
  let timeoutId: NodeJS.Timeout;
  
  if (isLoading) {
    // Prevent flash for quick operations
    timeoutId = setTimeout(() => setShowLoadingSpinner(true), 100);
  } else {
    setShowLoadingSpinner(false);
  }
  
  return () => timeoutId && clearTimeout(timeoutId);
}, [isLoading]);
```

### Settings Integration
```typescript
// ✅ Good: Update settings through store
const { settings, updateSettings } = useStore();

const handleSettingChange = (key: keyof AppSettings, value: any) => {
  updateSettings({ [key]: value });
  
  // Sync with electron backend if needed
  if (key === 'historyLimit') {
    window.electronAPI.updateHistoryLimit(value);
  }
};
```

## 🚫 Common Pitfalls to Avoid

### State Management
- ❌ Don't mutate state directly: `sites.push(newSite)`
- ❌ Don't ignore error handling in async operations
- ❌ Don't use local state for data that needs persistence
- ❌ Don't forget to clear loading states in finally blocks

### Theme Integration
- ❌ Don't hardcode colors or spacing values
- ❌ Don't create custom CSS classes instead of using themed components
- ❌ Don't ignore system theme preferences
- ❌ Don't forget to handle theme changes in dynamic content

### Performance
- ❌ Don't select entire store when only specific values are needed
- ❌ Don't create unnecessary re-renders by not memoizing callbacks
- ❌ Don't forget to clean up event listeners and timers

## 🔍 Debugging and Development

### Development Tools
- Use browser dev tools to inspect CSS custom properties
- Check Redux DevTools (Zustand supports it) for state changes
- Use React Developer Tools to inspect component props and state

### Theme Debugging
```typescript
// Access theme manager directly for debugging
const { themeManager } = useTheme();
console.log('Current theme:', themeManager.getTheme('system'));
console.log('Available themes:', themeManager.getAvailableThemes());
```

### State Debugging
```typescript
// Log state changes during development
const store = useStore();
console.log('Current state:', store.getState());
```

## 📋 Checklist for New Features

When implementing new features, ensure:

### State Integration
- [ ] Uses `useStore()` hook for all state access
- [ ] Implements proper error handling with `setError` and `clearError`
- [ ] Uses loading states with `setLoading` for async operations
- [ ] Follows the established state update patterns
- [ ] Persists only necessary state (not UI state)

### Theme Integration
- [ ] Uses themed components instead of custom styling
- [ ] Leverages the variant system for consistency
- [ ] Responds to theme changes automatically
- [ ] Maintains accessibility across all themes
- [ ] Uses theme hooks for dynamic styling

### Error Handling
- [ ] Handles both success and error cases
- [ ] Provides meaningful error messages to users
- [ ] Clears previous errors before new operations
- [ ] Uses try-catch-finally pattern consistently

### Performance
- [ ] Selects only needed state properties
- [ ] Avoids unnecessary re-renders
- [ ] Cleans up event listeners and timers
- [ ] Uses React.memo for expensive components when appropriate

## 🎉 Summary

The Uptime Watcher application has a robust and well-integrated state management and theme system. By following these patterns and guidelines, you can maintain consistency, ensure proper error handling, and create a seamless user experience across all features.

Key principles:
1. **Centralized state** through Zustand store
2. **Themed components** for consistent UI
3. **Proper error handling** with user feedback
4. **Loading states** for better UX
5. **Theme responsiveness** across all components

This architecture provides a solid foundation for future development while maintaining code quality and user experience standards.
