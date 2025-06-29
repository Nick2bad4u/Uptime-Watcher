# 🧩 Component Documentation

> **Navigation:** [📖 Docs Home](../README) » **Component Documentation**

Comprehensive documentation for all React components in the Uptime Watcher application.

## 📋 Component Index

### 🏠 Main Components

- **[Dashboard](Dashboard)** - Main application dashboard with site overview
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

- [🎨 Theme API](../api/theme-api) - Theme system documentation
- [🧩 Hook APIs](../api/hook-apis) - Custom hooks used by components
- [🚀 Developer Guide](../guides/Developer-Guide) - Development setup and patterns
- [📋 Types API](../api/types-api) - Component prop type definitions

---

> **Related:** [📖 Documentation Home](../README) | [📚 API Reference](../api/README)
