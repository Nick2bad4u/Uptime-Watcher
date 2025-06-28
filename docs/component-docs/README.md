# 🧩 Component Documentation

> **Navigation:** [📖 Docs Home](../README.md) » **Component Documentation**

Comprehensive documentation for all React components in the Uptime Watcher application.

## 📋 Component Index

### 🏠 Main Components

- **[Dashboard](Dashboard.md)** - Main application dashboard with site overview
- **[Header](Header.md)** - Application header with status overview and controls
- **[Settings](Settings.md)** - Settings modal for application configuration

### 📝 Form Components

- **[AddSiteForm](AddSiteForm.md)** - Site creation and editing interface
- **[AddSiteForm Components](AddSiteForm-Components.md)** - Sub-components and form fields

### 🏢 Site Components

- **[SiteDetails](SiteDetails.md)** - Detailed site information modal
- **[SiteDetails Tab Components](SiteDetails-Tab-Components.md)** - Tab system for site details
- **[SiteCard Components](SiteCard-Components.md)** - Site display cards and status
- **[SiteList Components](SiteList-Components.md)** - Site listing and empty states

### 🔧 Common Components

- **[Common Components](Common-Components.md)** - Reusable components across the app
  - StatusBadge
  - HistoryChart
  - Themed components

## 🏗️ Component Architecture

### Component Hierarchy

```text
App
├── Header
├── Dashboard
│   ├── AddSiteForm
│   │   ├── FormFields
│   │   └── SubmitButton
│   └── SiteList
│       ├── SiteCard
│       └── EmptyState
├── SiteDetails (Modal)
│   ├── Overview Tab
│   ├── History Tab
│   ├── Analytics Tab
│   └── Settings Tab
└── Settings (Modal)
```

### Design Patterns

- **Composition over Inheritance**: Components are composed of smaller, reusable parts
- **Props Interface**: All components have well-defined TypeScript interfaces
- **Theme Integration**: Components use the centralized theme system
- **Accessibility**: Components follow ARIA guidelines and accessibility best practices

## 🎨 Styling Guidelines

All components follow consistent styling patterns:

- Use themed components from `src/theme/components`
- Implement responsive design with TailwindCSS
- Support both light and dark themes
- Include proper focus states and accessibility

## 🧪 Testing

Component testing follows these patterns:

- Unit tests for individual components
- Integration tests for component interactions
- Accessibility testing with screen readers
- Visual regression testing for UI consistency

## See Also

- [🎨 Theme API](../api/theme-api.md) - Theme system documentation
- [🧩 Hook APIs](../api/hook-apis.md) - Custom hooks used by components
- [🚀 Developer Guide](../guides/Developer-Guide.md) - Development setup and patterns
- [📋 Types API](../api/types-api.md) - Component prop type definitions

---

> **Related:** [📖 Documentation Home](../README.md) | [📚 API Reference](../api/README.md)
