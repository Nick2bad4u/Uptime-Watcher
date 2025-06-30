# 🧩 Component Documentation

> **Navigation:** [📖 Docs Home](../README) » **Component Documentation**

Comprehensive documentation for all React components in the Uptime Watcher application.

## 📋 Component Index

### 🏠 Main Components

- **[Dashboard](Dashboard)** - Main application layout orchestrated by App.tsx
- **[Header](Header)** - Application header with status overview and controls
- **[Settings](Settings)** - Settings modal for application configuration

### 📝 Form Components

- **[AddSiteForm](AddSiteForm)** - Site creation and editing interface
- **[AddSiteForm Components](AddSiteForm-Components)** - Sub-components and form fields

### 🏢 Site Components

- **[SiteDetails](SiteDetails)** - Detailed site information modal
- **[SiteDetails Tab Components](SiteDetails-Tab-Components)** - Tab system for site details
- **[SiteCard Components](SiteCard-Components)** - Site display cards and status
- **[SiteList Components](SiteList-Components)** - Site listing and empty states

### 🔧 Common Components

- **[Common Components](Common-Components)** - Reusable components across the app
  - StatusBadge
  - HistoryChart
  - Themed components

## 🏗️ Component Architecture

### Component Hierarchy

```text
App (Main Container)
├── ThemeProvider
├── Header
├── Main Content Grid
│   ├── SiteList Container
│   │   ├── SiteCard (for each site)
│   │   │   ├── SiteCardHeader
│   │   │   │   ├── MonitorSelector
│   │   │   │   └── ActionButtonGroup
│   │   │   ├── SiteCardStatus
│   │   │   ├── SiteCardMetrics
│   │   │   │   └── MetricCard (multiple)
│   │   │   ├── SiteCardHistory
│   │   │   └── SiteCardFooter
│   │   └── EmptyState (when no sites)
│   └── AddSiteForm Sidebar
│       ├── FormFields
│       └── Submit
├── SiteDetails Modal
│   ├── SiteDetailsHeader
│   ├── SiteDetailsNavigation
│   └── Tab Components
│       ├── OverviewTab
│       ├── AnalyticsTab
│       ├── HistoryTab
│       └── SettingsTab
└── Settings Modal
```

### Design Patterns

- **Composition over Inheritance**: Components are composed of smaller, focused sub-components
- **Props Interface**: All components have well-defined TypeScript interfaces
- **Theme Integration**: Components use the centralized ThemedBox/ThemedText/ThemedButton system
- **Custom Hooks**: Logic is abstracted into reusable hooks (useStore, useTheme, useSite)
- **React.memo**: Performance optimization through memoization of components
- **Accessibility**: Components follow ARIA guidelines with proper labels and focus management

## 🎨 Styling Guidelines

All components follow consistent styling patterns:

- Use themed components from `src/theme/components` (ThemedBox, ThemedText, ThemedButton, StatusIndicator)
- Implement responsive design with Tailwind CSS utilities
- Support both light and dark themes automatically through ThemeProvider
- Include proper focus states and accessibility features
- Use CSS custom properties for theme-aware styling
- Implement hover effects with transitions and transforms

## 🧪 Testing

Component testing follows these patterns:

- Unit tests for individual components with Jest and React Testing Library
- Integration tests for component interactions and data flow
- Accessibility testing with screen readers and ARIA compliance
- Visual regression testing for UI consistency across themes
- Performance testing for React.memo optimization
- Type safety validation through TypeScript strict mode

## See Also

- [🎨 Theme API](../api/theme-api) - Theme system documentation
- [🧩 Hook APIs](../api/hook-apis) - Custom hooks used by components
- [🚀 Developer Guide](../guides/Developer-Guide) - Development setup and patterns
- [📋 Types API](../api/types-api) - Component prop type definitions

---

> **Related:** [📖 Documentation Home](../README) | [📚 API Reference](../api/README)
