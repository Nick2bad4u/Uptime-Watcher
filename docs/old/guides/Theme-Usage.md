# 🎨 Theme Usage Guide

> **Navigation:** [📖 Docs Home](../README) » [📘 Guides](../README.md#guides) » **Theme Usage**

This guide demonstrates how to use the theme system throughout the Uptime Watcher application.

## Overview

The theme system provides consistent colors, typography, and styling across all components. There are multiple ways to access and use theme values.

## Usage Methods

### Method 1: Using the useTheme Hook

Access theme values directly in React components:

{% raw %}

```typescript
import React from 'react';
import { useTheme } from './src/theme/useTheme';

function ExampleWithHook() {
    const { currentTheme } = useTheme();

    return (
        <div style={{ color: currentTheme.colors.errorAlert }}>
            This text uses the errorAlert color from the theme
        </div>
    );
}
```

{% endraw %}

### Method 2: Using CSS Classes (RECOMMENDED)

Use CSS custom properties for better performance:

```typescript
function ExampleWithCSS() {
    return (
        <div className="error-alert__text">
            This text uses the errorAlert color via CSS custom property
        </div>
    );
}
```

### Method 3: Using ThemedText Component

Use pre-built themed components:

{% raw %}

```typescript
import { ThemedText } from './src/theme/components';

function ExampleWithThemedComponent() {
    return (
        <ThemedText
            variant="primary"
            style={{ color: 'var(--color-error-alert)' }}
        >
            This text uses the errorAlert color via CSS custom property
        </ThemedText>
    );
}
```

{% endraw %}

### Method 4: Creating Reusable Components

Build custom themed components:

```typescript
function ErrorAlertText({ children }: { children: React.ReactNode }) {
    return (
        <span className="error-alert__text">
            {children}
        </span>
    );
}
```

## Complete Example

```typescript
export default function ExampleUsage() {
    return (
        <div>
            <h2>Examples of using the errorAlert theme color:</h2>
            <ExampleWithHook />
            <ExampleWithCSS />
            <ExampleWithThemedComponent />
            <ErrorAlertText>This is an error alert message</ErrorAlertText>
        </div>
    );
}
```

## See Also

- [🎨 Theme API](../api/theme-api) - Complete theme API reference
- [🚀 Developer Guide](Developer-Guide) - Development setup and patterns
- [🧩 Hook APIs](../api/hook-apis) - useTheme hook documentation
- [📋 Types API](../api/types-api) - Theme type definitions

---

> **Related:** [📖 Documentation Home](../README) | [📘 All Guides](../README.md#guides)
