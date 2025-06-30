# Settings Component Documentation

## Overview

The `Settings` component provides a comprehensive modal interface for configuring all application preferences and options. It serves as the central hub for user customization, system configuration, and data management within the Uptime Watcher application. The component is structured as a modal overlay with organized sections for different types of settings.

---

## Location & Files

- **Component:** `src/components/Settings/Settings.tsx`
- **Props Interface:** `SettingsProps { onClose: () => void }`

---

## Key Features

### ⚙️ Application Configuration

- **Monitoring Settings**: Timeout, retry limits, and history limits
- **Notification Preferences**: Desktop notifications, sound alerts
- **System Behavior**: Auto-start, minimize to tray
- **Theme Management**: Full theme selection and preview

### 💾 Data Management

- **SQLite Backup**: Download database backups
- **Data Synchronization**: Full sync from backend
- **History Management**: Configurable history retention limits
- **Settings Reset**: Restore factory defaults

### 🎨 User Interface

- **Real-time Preview**: Theme changes apply immediately
- **Form Validation**: Input validation with user feedback
- **Loading States**: Progress indicators for async operations
- **Error Handling**: Clear error messages and recovery options

---

## Architecture

### Component Structure

```tsx
Settings
├── Header Section (Title + Close Button)
├── Error/Success Display
├── Monitoring Configuration
│   ├── History Limit Settings
│   ├── Request Timeout Settings
│   └── Max Retries Settings
├── Notification Settings
│   ├── Desktop Notifications
│   └── Sound Alerts
├── Application Settings
│   ├── Theme Selection
│   ├── Auto-start
│   └── Minimize to Tray
├── Data Management
│   ├── Sync Data Button
│   └── SQLite Backup Download
└── Footer Section
    ├── Reset to Defaults
    └── Cancel/Save Buttons
```

### State Management

The Settings component integrates with multiple state systems:

- **`useStore()`**: Application settings and data operations
- **`useTheme()`**: Theme management and selection
- **Local State**: Form state, loading indicators, success messages

---

## Settings Categories

### Monitoring Configuration

```typescript
// Timeout settings with validation
timeout: number (TIMEOUT_CONSTRAINTS.MIN to TIMEOUT_CONSTRAINTS.MAX)
historyLimit: number (HISTORY_LIMIT_OPTIONS array)
```

### Notification System

```typescript
// Notification preferences
notifications: boolean (desktop notifications)
soundAlerts: boolean (audio notifications)
```

### System Behavior

```typescript
// Application behavior
autoStart: boolean (launch on system startup)
minimizeToTray: boolean (minimize behavior)
```

### Theme Management

```typescript
// Theme selection
theme: ThemeName (from availableThemes)
// Real-time theme switching with immediate preview
```

---

## Data Operations

### Backup & Sync

The Settings component provides access to data management operations:

```typescript
// SQLite backup download
await downloadSQLiteBackup()

// Full data synchronization
await fullSyncFromBackend()

// History limit updates with validation
await updateHistoryLimitValue(limit)
```

### Settings Management

```typescript
// Update individual settings
updateSettings({ [key]: value })

// Reset all settings to defaults
resetSettings()

// Clear application errors
clearError()
```

---

## User Interaction Patterns

### Form Handling

- **Real-time Updates**: Most settings apply immediately on change
- **Validation**: Input constraints enforced (timeout ranges, retry limits)
- **Confirmation**: Destructive actions require user confirmation (settings reset)

### Loading States

The component implements sophisticated loading state management:

```typescript
// Delayed loading indicators (100ms delay for UX)
const [showButtonLoading, setShowButtonLoading] = useState(false);

useEffect(() => {
    if (isLoading) {
        const timeoutId = setTimeout(() => {
            setShowButtonLoading(true);
        }, UI_DELAYS.LOADING_BUTTON);
        return () => clearTimeout(timeoutId);
    }
    setShowButtonLoading(false);
}, [isLoading]);
```

### Success Feedback

- **Sync Success**: Visual confirmation for sync operations
- **Theme Preview**: Real-time theme switching
- **Setting Changes**: Immediate application of changes

---

## Theme Integration

### Theme Selection

The Settings component provides full theme management:

```typescript
// Access available themes
const { availableThemes, setTheme } = useTheme();

// Theme change handler with logging
const handleThemeChange = (themeName: string) => {
    const oldTheme = settings.theme;
    setTheme(themeName as ThemeName);
    logger.user.settingsChange("theme", oldTheme, themeName);
};
```

### Themed Components

Uses the full range of themed components:

- `ThemedBox` - Container styling with surface variants (overlay, elevated, base)
- `ThemedText` - Text styling with size, weight, and variant options
- `ThemedButton` - Interactive elements with variant, size, and loading states
- `ThemedInput` - Form inputs with validation styling
- `ThemedSelect` - Dropdown selections with themed styling
- `ThemedCheckbox` - Boolean options with accessible design
- `StatusIndicator` - Theme preview indicators for status states

### CSS Classes

Key CSS classes used for layout and styling:

- `modal-overlay` - Full-screen modal backdrop
- `modal-container` - Centered modal content container
- `space-y-6`, `space-y-4` - Vertical spacing utilities
- `setting-item` - Individual setting row layout
- `setting-info` - Setting label and description container
- `error-alert`, `success-alert` - Alert message styling
- `hover-opacity` - Hover interaction states

---

## Validation & Error Handling

### Input Validation

```typescript
// Settings key validation
const allowedKeys: Array<keyof typeof settings> = [
    "notifications", "autoStart", "minimizeToTray", 
    "theme", "soundAlerts", "historyLimit"
];

const handleSettingChange = (key: keyof typeof settings, value: unknown) => {
    if (!allowedKeys.includes(key)) {
        logger.warn("Attempted to update invalid settings key", key);
        return;
    }
    // Safe to update setting
};
```

### Error States

- **Store Integration**: Displays errors from store state
- **Operation Failures**: Handles async operation errors
- **Recovery Options**: Clear error paths for users

### Confirmation Dialogs

```typescript
const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all settings to defaults?")) {
        resetSettings();
        clearError();
        logger.user.action("Reset settings to defaults");
    }
};
```

---

## Performance Considerations

### Optimizations

- **Delayed Loading**: 100ms delay prevents loading flicker for better UX
- **Event Handling**: Efficient change handlers for settings updates
- **Targeted Updates**: Individual setting updates rather than bulk operations

### Resource Management

- **Cleanup**: Proper cleanup of timeouts and effects
- **State Management**: Minimal local state with store integration
- **Async Operations**: Proper error handling for data operations

---

## Accessibility Features

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through all controls
- **Enter/Space**: Proper button activation
- **Escape**: Modal closing behavior

### Screen Reader Support

- **ARIA Labels**: Descriptive labels for all controls
- **Semantic HTML**: Proper form structure and labeling
- **Status Announcements**: Success/error state communication

### Visual Accessibility

- **Theme Support**: Full dark/light mode support
- **Contrast**: Proper contrast ratios in all themes
- **Focus Indicators**: Clear focus states for keyboard navigation

---

## Integration Points

### Store Integration

Direct integration with application state:

```typescript
const {
    clearError, downloadSQLiteBackup, fullSyncFromBackend,
    isLoading, lastError, resetSettings, setError,
    settings, updateHistoryLimitValue, updateSettings
} = useStore();
```

### Theme System

Full theme system integration:

```typescript
const { availableThemes, isDark, setTheme } = useTheme();
```

### Logging System

Comprehensive user action logging:

```typescript
logger.user.settingsChange(key, oldValue, value);
logger.user.action("Reset settings to defaults");
```

---

## Modal Behavior

### Opening/Closing

- **Trigger**: Opened via Header settings button
- **Close Button**: Header close button (✕)
- **Footer Actions**: Cancel and Save Changes buttons

### State Persistence

- **Auto-save**: Settings save automatically on change
- **Error Recovery**: Displays and manages errors from store state
- **Success Feedback**: Shows success messages for sync operations

---

## Future Enhancements

### Potential Improvements

- **Import/Export**: Settings backup and restore
- **Advanced Monitoring**: Custom monitoring scripts
- **Notification Scheduling**: Time-based notification rules
- **Keyboard Shortcuts**: Settings-specific hotkeys

### Data Features

- **Bulk Operations**: Batch setting updates
- **Setting Profiles**: Multiple configuration profiles
- **Cloud Sync**: Settings synchronization across devices
- **Version Control**: Settings change history and rollback
