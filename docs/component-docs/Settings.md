# Settings Component Documentation

## Overview

The `Settings` component provides a comprehensive modal interface for configuring all application preferences and options. It serves as the central hub for user customization, system configuration, and application management within the Uptime Watcher application.

---

## Location & Files

- **Component:** `src/components/Settings/Settings.tsx`
- **Props Interface:** `SettingsProps { onClose: () => void }`

---

## Key Features

### ⚙️ Application Configuration

- **Monitoring Settings**: Timeout, retry limits, and check intervals
- **Notification Preferences**: Desktop notifications, sound alerts
- **System Behavior**: Auto-start, minimize to tray, history limits
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
├── Theme Selection Section
├── Monitoring Configuration
│   ├── Timeout Settings
│   ├── Retry Limits
│   └── History Retention
├── Notification Settings
│   ├── Desktop Notifications
│   └── Sound Alerts
├── System Behavior
│   ├── Auto-start
│   └── Minimize to Tray
├── Data Management
│   ├── Backup Controls
│   ├── Sync Operations
│   └── Settings Reset
└── Action Buttons
    ├── Save/Close
    └── Reset to Defaults
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
maxRetries: number (configurable retry attempts)
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
await downloadSQLiteBackup();

// Full data synchronization
await fullSyncFromBackend();

// History limit updates with validation
await updateHistoryLimitValue(limit);
```

### Settings Management

```typescript
// Update individual settings
updateSettings({ [key]: value });

// Reset all settings to defaults
resetSettings();

// Clear application errors
clearError();
```

---

## User Interaction Patterns

### Form Handling

- **Real-time Updates**: Changes apply immediately where appropriate
- **Validation**: Input constraints enforced with user feedback
- **Confirmation**: Destructive actions require user confirmation

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

- `ThemedBox` - Container styling
- `ThemedText` - Text styling
- `ThemedButton` - Interactive elements
- `ThemedInput` - Form inputs
- `ThemedSelect` - Dropdown selections
- `ThemedCheckbox` - Boolean options

---

## Validation & Error Handling

### Input Validation

```typescript
// Settings key validation
const allowedKeys: Array<keyof typeof settings> = [
 "notifications",
 "autoStart",
 "minimizeToTray",
 "theme",
 "timeout",
 "maxRetries",
 "soundAlerts",
 "historyLimit",
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

- **Delayed Loading**: 100ms delay prevents loading flicker
- **Memoization**: Prevents unnecessary re-renders
- **Efficient Updates**: Targeted setting updates rather than full refreshes

### Resource Management

- **Cleanup**: Proper cleanup of timeouts and effects
- **State Management**: Minimal local state with store integration
- **Event Handling**: Debounced or throttled where appropriate

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
 clearError,
 downloadSQLiteBackup,
 fullSyncFromBackend,
 isLoading,
 lastError,
 resetSettings,
 setError,
 settings,
 updateHistoryLimitValue,
 updateSettings,
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
- **Backdrop Click**: Configurable close behavior
- **Escape Key**: Standard modal close behavior

### State Persistence

- **Auto-save**: Most settings save automatically
- **Form State**: Maintains form state during session
- **Error Recovery**: Preserves state through errors

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
