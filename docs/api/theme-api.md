# 🎨 Theme API Reference

> **Navigation:** [📖 Docs Home](../README.md) » [📚 API Reference](README.md) » **Theme API**

The Theme API provides a comprehensive theming system for the Uptime Watcher application, including theme management, color utilities, and responsive design tokens.

## Table of Contents

- [Overview](#overview)
- [Core Interfaces](#core-interfaces)
- [Theme Hook](#theme-hook)
- [Theme Manager](#theme-manager)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing](#spacing)
- [Components](#components)
- [Usage Examples](#usage-examples)
- [Custom Themes](#custom-themes)
- [Best Practices](#best-practices)

## Overview

The theme system is built around a centralized architecture that supports:

- **Multiple theme variants**: Light, dark, and system-based themes
- **Color semantics**: Status colors, semantic colors, and brand colors
- **Typography scale**: Consistent font sizes and line heights
- **Spacing system**: Uniform spacing tokens
- **CSS custom properties**: Dynamic theme switching
- **TypeScript support**: Full type safety for theme values

### Key Components

- **ThemeManager**: Singleton service for theme management
- **useTheme hook**: React hook for theme state and utilities
- **Theme types**: TypeScript interfaces for theme structure
- **CSS variables**: Dynamic styling with CSS custom properties

## Core Interfaces

### `ThemeName`

Available theme names in the application.

```typescript
type ThemeName = "light" | "dark" | "system";
```

### `ThemeColors`

Complete color palette interface defining all theme colors.

```typescript
interface ThemeColors {
    // Core brand colors (50-900 scale)
    primary: {
        50: string;   // Lightest shade
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;  // Base color
        600: string;
        700: string;
        800: string;
        900: string;  // Darkest shade
    };

    // Status indication colors
    status: {
        up: string;      // Green for operational
        down: string;    // Red for down/error
        pending: string; // Yellow/Orange for pending
        unknown: string; // Gray for unknown state
    };

    // Semantic colors for UI feedback
    success: string;    // Success messages
    warning: string;    // Warning messages
    error: string;      // Error messages
    errorAlert: string; // Critical error alerts
    info: string;       // Information messages

    // Background colors
    background: {
        primary: string;   // Main background
        secondary: string; // Card/panel backgrounds
        tertiary: string;  // Input/form backgrounds
        modal: string;     // Modal overlay backgrounds
    };

    // Text colors
    text: {
        primary: string;   // Main text
        secondary: string; // Secondary/muted text
        tertiary: string;  // Disabled/placeholder text
        inverse: string;   // Text on dark backgrounds
    };

    // Border colors
    border: {
        primary: string;   // Default borders
        secondary: string; // Subtle borders
        focus: string;     // Focus indicators
        error: string;     // Error state borders
    };

    // Interactive element colors
    interactive: {
        hover: string;     // Hover state overlay
        active: string;    // Active state overlay
        disabled: string;  // Disabled state overlay
        focus: string;     // Focus ring color
    };
}
```

### `ThemeTypography`

Typography scale and text styling definitions.

```typescript
interface ThemeTypography {
    fontFamily: {
        sans: string;    // Primary sans-serif font stack
        mono: string;    // Monospace font stack
    };

    fontSize: {
        xs: string;      // 12px
        sm: string;      // 14px
        base: string;    // 16px
        lg: string;      // 18px
        xl: string;      // 20px
        "2xl": string;   // 24px
        "3xl": string;   // 30px
        "4xl": string;   // 36px
    };

    fontWeight: {
        normal: number;   // 400
        medium: number;   // 500
        semibold: number; // 600
        bold: number;     // 700
    };

    lineHeight: {
        tight: number;    // 1.25
        normal: number;   // 1.5
        relaxed: number;  // 1.75
    };
}
```

### `ThemeSpacing`

Consistent spacing scale for layouts and components.

```typescript
interface ThemeSpacing {
    xs: string;    // 4px
    sm: string;    // 8px
    md: string;    // 16px
    lg: string;    // 24px
    xl: string;    // 32px
    "2xl": string; // 48px
    "3xl": string; // 64px
    "4xl": string; // 96px
}
```

### `Theme`

Complete theme object containing all styling tokens.

```typescript
interface Theme {
    name: ThemeName;
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    metadata: {
        displayName: string;
        description: string;
        version: string;
    };
}
```

## Theme Hook

### `useTheme()`

Primary React hook for accessing theme state and utilities.

```typescript
const {
    // Current theme data
    currentTheme,
    themeName,
    isDark,
    
    // Theme switching
    setTheme,
    
    // System theme detection
    systemTheme,
    
    // Utility functions
    getStatusColor,
    getAvailabilityColor,
    
    // Force refresh
    themeVersion
} = useTheme();
```

#### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `currentTheme` | `Theme` | Complete current theme object |
| `themeName` | `ThemeName` | Current theme name |
| `isDark` | `boolean` | Whether current theme is dark |
| `setTheme` | `(theme: ThemeName) => void` | Theme switching function |
| `systemTheme` | `"light" \| "dark"` | System theme preference |
| `getStatusColor` | `(status: StatusType) => string` | Get color for status |
| `getAvailabilityColor` | `(percentage: number) => string` | Get color for uptime percentage |
| `themeVersion` | `number` | Version counter for forcing re-renders |

### Basic Usage

```typescript
import { useTheme } from '../theme/useTheme';

function MyComponent() {
    const { currentTheme, setTheme, isDark, getStatusColor } = useTheme();

    return (
        <div style={{ 
            backgroundColor: currentTheme.colors.background.primary,
            color: currentTheme.colors.text.primary 
        }}>
            <h1>Current theme: {currentTheme.name}</h1>
            
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')}>
                Switch to {isDark ? 'light' : 'dark'} theme
            </button>
            
            <div style={{ color: getStatusColor('up') }}>
                Service is operational
            </div>
        </div>
    );
}
```

### Advanced Usage with Status Colors

```typescript
function StatusIndicator({ status, children }) {
    const { getStatusColor } = useTheme();
    
    return (
        <span style={{ 
            color: getStatusColor(status),
            fontWeight: 'medium'
        }}>
            {children}
        </span>
    );
}
```

## Theme Manager

### `ThemeManager.getInstance()`

Singleton service for low-level theme management.

#### Methods

##### `getTheme(name: ThemeName): Theme`

Retrieves a theme by name with automatic system theme detection.

```typescript
import { themeManager } from './ThemeManager';

const lightTheme = themeManager.getTheme('light');
const systemTheme = themeManager.getTheme('system'); // Auto-detects system preference
```

##### `applyTheme(theme: Theme): void`

Applies a theme by setting CSS custom properties.

```typescript
const theme = themeManager.getTheme('dark');
themeManager.applyTheme(theme);
```

##### `getSystemThemePreference(): "light" | "dark"`

Detects the system theme preference.

```typescript
const systemPref = themeManager.getSystemThemePreference();
console.log(`System prefers ${systemPref} theme`);
```

##### `onSystemThemeChange(callback: (isDark: boolean) => void): () => void`

Listens for system theme changes.

```typescript
const cleanup = themeManager.onSystemThemeChange((isDark) => {
    console.log(`System theme changed to ${isDark ? 'dark' : 'light'}`);
});

// Cleanup listener
cleanup();
```

## Color System

### Status Colors

The theme system provides semantic colors for different status types:

```typescript
const { getStatusColor } = useTheme();

// Status color mapping
const upColor = getStatusColor('up');       // Green variants
const downColor = getStatusColor('down');   // Red variants  
const pendingColor = getStatusColor('pending'); // Yellow/Orange variants
const unknownColor = getStatusColor('unknown'); // Gray variants
```

### Availability Colors

Colors for uptime percentage visualization:

```typescript
const { getAvailabilityColor } = useTheme();

// Availability color mapping (0-100%)
const excellentColor = getAvailabilityColor(99.9); // Green
const goodColor = getAvailabilityColor(95.0);      // Yellow-green
const poorColor = getAvailabilityColor(85.0);      // Orange
const badColor = getAvailabilityColor(70.0);       // Red
```

### Color Utilities

```typescript
function StatusBadge({ status, uptime }: { status: StatusType; uptime: number }) {
    const { getStatusColor, getAvailabilityColor } = useTheme();
    
    return (
        <div className="status-badge">
            <span style={{ color: getStatusColor(status) }}>
                {status.toUpperCase()}
            </span>
            <span style={{ color: getAvailabilityColor(uptime) }}>
                {uptime.toFixed(1)}%
            </span>
        </div>
    );
}
```

## Typography

### Font System

```typescript
function TypographyExample() {
    const { currentTheme } = useTheme();
    const { typography } = currentTheme;
    
    return (
        <div style={{ fontFamily: typography.fontFamily.sans }}>
            <h1 style={{ 
                fontSize: typography.fontSize["3xl"],
                fontWeight: typography.fontWeight.bold,
                lineHeight: typography.lineHeight.tight
            }}>
                Main Heading
            </h1>
            
            <p style={{ 
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.normal,
                lineHeight: typography.lineHeight.normal
            }}>
                Body text with normal weight and line height.
            </p>
            
            <code style={{ 
                fontFamily: typography.fontFamily.mono,
                fontSize: typography.fontSize.sm
            }}>
                Monospace code text
            </code>
        </div>
    );
}
```

## Spacing

### Spacing System

```typescript
function SpacingExample() {
    const { currentTheme } = useTheme();
    const { spacing } = currentTheme;
    
    return (
        <div style={{ 
            padding: spacing.lg,
            margin: spacing.md,
            gap: spacing.sm
        }}>
            <div style={{ marginBottom: spacing.xs }}>Small spacing</div>
            <div style={{ marginBottom: spacing.xl }}>Large spacing</div>
        </div>
    );
}
```

## Components

### Theme Provider Pattern

```typescript
import { createContext, useContext } from 'react';
import { useTheme } from '../theme/useTheme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const theme = useTheme();
    
    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within ThemeProvider');
    }
    return context;
}
```

### Themed Components

```typescript
interface ThemedButtonProps {
    variant: 'primary' | 'secondary' | 'danger';
    size: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    onClick?: () => void;
}

function ThemedButton({ variant, size, children, onClick }: ThemedButtonProps) {
    const { currentTheme } = useTheme();
    
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: currentTheme.colors.primary[500],
                    color: currentTheme.colors.text.inverse,
                    borderColor: currentTheme.colors.primary[500],
                };
            case 'secondary':
                return {
                    backgroundColor: currentTheme.colors.background.secondary,
                    color: currentTheme.colors.text.primary,
                    borderColor: currentTheme.colors.border.primary,
                };
            case 'danger':
                return {
                    backgroundColor: currentTheme.colors.error,
                    color: currentTheme.colors.text.inverse,
                    borderColor: currentTheme.colors.error,
                };
        }
    };
    
    const getSizeStyles = () => {
        const { typography, spacing } = currentTheme;
        switch (size) {
            case 'sm':
                return {
                    fontSize: typography.fontSize.sm,
                    padding: `${spacing.xs} ${spacing.sm}`,
                };
            case 'md':
                return {
                    fontSize: typography.fontSize.base,
                    padding: `${spacing.sm} ${spacing.md}`,
                };
            case 'lg':
                return {
                    fontSize: typography.fontSize.lg,
                    padding: `${spacing.md} ${spacing.lg}`,
                };
        }
    };
    
    return (
        <button
            onClick={onClick}
            style={{
                ...getVariantStyles(),
                ...getSizeStyles(),
                border: '1px solid',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: currentTheme.typography.fontWeight.medium,
                transition: 'all 0.2s ease',
            }}
        >
            {children}
        </button>
    );
}
```

## Usage Examples

### Complete Theme Integration

{% raw %}
```typescript
import React from 'react';
import { useTheme } from '../theme/useTheme';

function Dashboard() {
    const { 
        currentTheme, 
        setTheme, 
        isDark, 
        getStatusColor,
        getAvailabilityColor 
    } = useTheme();
    
    const sites = [
        { name: 'Website', status: 'up', uptime: 99.9 },
        { name: 'API', status: 'down', uptime: 87.3 },
        { name: 'Database', status: 'pending', uptime: 95.1 }
    ];
    
    return (
        <div style={{
            backgroundColor: currentTheme.colors.background.primary,
            color: currentTheme.colors.text.primary,
            minHeight: '100vh',
            fontFamily: currentTheme.typography.fontFamily.sans,
            padding: currentTheme.spacing.lg
        }}>
            {/* Theme Switcher */}
            <header style={{ 
                marginBottom: currentTheme.spacing.xl,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h1 style={{
                    fontSize: currentTheme.typography.fontSize["2xl"],
                    fontWeight: currentTheme.typography.fontWeight.bold,
                    margin: 0
                }}>
                    Uptime Dashboard
                </h1>
                
                <select 
                    value={currentTheme.name}
                    onChange={(e) => setTheme(e.target.value as ThemeName)}
                    style={{
                        backgroundColor: currentTheme.colors.background.secondary,
                        color: currentTheme.colors.text.primary,
                        border: `1px solid ${currentTheme.colors.border.primary}`,
                        borderRadius: '6px',
                        padding: currentTheme.spacing.sm,
                        fontSize: currentTheme.typography.fontSize.sm
                    }}
                >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                </select>
            </header>
            
            {/* Site Status Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: currentTheme.spacing.lg
            }}>
                {sites.map((site, index) => (
                    <div
                        key={index}
                        style={{
                            backgroundColor: currentTheme.colors.background.secondary,
                            border: `1px solid ${currentTheme.colors.border.primary}`,
                            borderRadius: '8px',
                            padding: currentTheme.spacing.lg
                        }}
                    >
                        <h3 style={{
                            fontSize: currentTheme.typography.fontSize.lg,
                            fontWeight: currentTheme.typography.fontWeight.semibold,
                            margin: `0 0 ${currentTheme.spacing.sm} 0`
                        }}>
                            {site.name}
                        </h3>
                        
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                color: getStatusColor(site.status),
                                fontWeight: currentTheme.typography.fontWeight.medium,
                                fontSize: currentTheme.typography.fontSize.sm,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {site.status}
                            </span>
                            
                            <span style={{
                                color: getAvailabilityColor(site.uptime),
                                fontWeight: currentTheme.typography.fontWeight.bold,
                                fontSize: currentTheme.typography.fontSize.lg
                            }}>
                                {site.uptime}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```
{% endraw %}
### CSS Custom Properties Usage

The theme system automatically sets CSS custom properties that can be used in stylesheets:

```css
/* These variables are automatically available */
.themed-component {
    background-color: var(--color-background-primary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-primary);
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
}

.status-up {
    color: var(--color-status-up);
}

.status-down {
    color: var(--color-status-down);
}

.status-pending {
    color: var(--color-status-pending);
}
```

## Custom Themes

### Creating Custom Themes

```typescript
import { Theme } from '../theme/types';

const customTheme: Theme = {
    name: 'custom',
    colors: {
        primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9', // Base color
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
        },
        status: {
            up: '#10b981',    // Emerald-500
            down: '#ef4444',  // Red-500
            pending: '#f59e0b', // Amber-500
            unknown: '#6b7280'  // Gray-500
        },
        // ... other color definitions
    },
    typography: {
        fontFamily: {
            sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            mono: '"JetBrains Mono", Consolas, Monaco, monospace'
        },
        // ... other typography definitions
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px'
    },
    metadata: {
        displayName: 'Custom Theme',
        description: 'A custom theme for specific branding',
        version: '1.0.0'
    }
};

// Register the custom theme
import { themes } from '../theme/themes';
themes.custom = customTheme;
```

## Best Practices

### 1. Use Semantic Colors

```typescript
// ✅ Good - Use semantic colors
const errorColor = currentTheme.colors.error;
const successColor = currentTheme.colors.success;

// ❌ Bad - Don't use arbitrary color values
const errorColor = '#ff0000';
```

### 2. Leverage Theme Utilities

```typescript
// ✅ Good - Use theme utilities for status colors
const statusColor = getStatusColor(status);

// ❌ Bad - Manual color mapping
const statusColor = status === 'up' ? '#10b981' : '#ef4444';
```

### 3. Consistent Spacing

```typescript
// ✅ Good - Use theme spacing tokens
const style = {
    padding: currentTheme.spacing.md,
    margin: currentTheme.spacing.lg
};

// ❌ Bad - Arbitrary spacing values
const style = {
    padding: '16px',
    margin: '24px'
};
```

### 4. Typography Scale

```typescript
// ✅ Good - Use typography scale
const headingStyle = {
    fontSize: currentTheme.typography.fontSize['2xl'],
    fontWeight: currentTheme.typography.fontWeight.bold
};

// ❌ Bad - Arbitrary font sizes
const headingStyle = {
    fontSize: '24px',
    fontWeight: 700
};
```

### 5. Theme-Aware Components

```typescript
// ✅ Good - Theme-aware component
function ThemedCard({ children }) {
    const { currentTheme } = useTheme();
    
    return (
        <div style={{
            backgroundColor: currentTheme.colors.background.secondary,
            border: `1px solid ${currentTheme.colors.border.primary}`,
            borderRadius: '8px',
            padding: currentTheme.spacing.lg
        }}>
            {children}
        </div>
    );
}

// ❌ Bad - Hard-coded styles
function Card({ children }) {
    return (
        <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px'
        }}>
            {children}
        </div>
    );
}
```

## See Also

- [Component Props](component-props.md) - Themed component interfaces
- [Hook APIs](hook-apis.md) - Other React hooks
- [Store API](store-api.md) - Settings integration
