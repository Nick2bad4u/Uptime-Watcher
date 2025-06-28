# Uptime Watcher Documentation

This directory contains comprehensive documentation for the Uptime Watcher project, organized by category for easy navigation.

## 📁 Directory Structure

### 🏗️ Architecture

Contains high-level architecture and design documents:

- **Project-Architecture-Guide.copilotmd** - Complete project architecture overview

### 📚 Guides

Development guides and integration documentation:

- **AI-State-Theme-Integration-Guide.copilotmd** - AI state and theme integration guide
- **Developer-Guide.md** - Comprehensive development setup and workflow guide
- **Theme-Usage.md** - Theme usage and customization guide
- **Validator.md** - Validation patterns and best practices

### 🔧 Refactoring

Documentation related to code refactoring efforts:

- **BackendRafactor.copilotmd** - Backend refactoring summary and frontend review
- **BackendRafactor.md** - Additional backend refactoring documentation

### 📦 Component Documentation

Detailed documentation for specific components:

- **AddSiteForm.md** - AddSiteForm component structure and logic (updated for modular architecture)
- **AddSiteForm-Components.md** - AddSiteForm sub-components (FormFields, Submit)
- **Dashboard.md** - Dashboard component architecture and features
- **SiteDetails.md** - SiteDetails modal component system
- **SiteDetails-Tab-Components.md** - SiteDetails tab components (Overview, History, Analytics, Settings)
- **SiteCard-Components.md** - SiteCard component system and sub-components
- **SiteList-Components.md** - SiteList and EmptyState components
- **Header.md** - Header component with status overview and global controls
- **Settings.md** - Settings modal component with configuration management
- **Common-Components.md** - Reusable components (StatusBadge, HistoryChart)
- **SiteDetails-Refactoring-Summary.copilotmd** - SiteDetails component refactoring

### 🚀 Migration Summaries

Documentation of major migrations and transitions:

- **Backend-Persistence-Migration-SQLite.copilotmd** - SQLite backend migration summary
- **Logging-Migration-Summary.copilotmd** - Logging system migration summary

### ⚡ Optimization Summaries

Performance and optimization-related documentation:

- **Future-Proofing-Improvements-Summary.copilotmd** - Future-proofing improvements and patterns
- **Performance-Optimization-Summary.copilotmd** - General performance optimizations

### 🏥 Health Reports

Code quality and health assessment reports:

- **Codebase-Health-Check.copilotmd** - Updated comprehensive codebase health assessment

### 🛠️ Instructions

Development environment and tooling instructions:

- **copilot-instructions.md** - Full Copilot development instructions
- **copilot-instructions-short.md** - Condensed Copilot instructions

## 📖 Getting Started

1. **New Developers**: Start with `guides/Developer-Guide.md` for complete setup instructions
2. **Architecture Overview**: Read `architecture/Project-Architecture-Guide.copilotmd` for system understanding
3. **Component Work**: Check `component-docs/` for specific component documentation
4. **Refactoring History**: Review `refactoring/BackendRafactor.copilotmd` for architectural changes
5. **Performance**: Check `optimization-summaries/` for performance best practices
6. **Code Quality**: Review `health-reports/` for current codebase health status

## 🔄 Document Updates

When adding new documentation:

- Place architecture documents in `architecture/`
- Place how-to guides in `guides/`
- Place refactoring docs in `refactoring/`
- Place component-specific docs in `component-docs/`
- Place migration docs in `migration-summaries/`
- Place optimization docs in `optimization-summaries/`
- Place health reports in `health-reports/`

## 📝 File Naming Convention

- Use descriptive, kebab-case naming: `component-optimization-summary.md`
- Include the document type in the name when relevant
- Use `.md` extension for standard markdown files
- Use `.copilotmd` extension for Copilot-generated documentation
