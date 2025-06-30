# 📚 API Reference

> **Navigation:** [📖 Docs Home](../README) » **API Reference**

This directory contains comprehensive API documentation for the Uptime Watcher project, covering all public interfaces, functions, classes, and modules.

## 📁 Structure

### Core APIs

- **[Store API](store-api)** - Zustand store interfaces and state management
- **[IPC API](ipc-api)** - Electron IPC communication channels
- **[Theme API](theme-api)** - Theme system and theming utilities
- **[Monitor API](monitor-api)** - Monitoring services and factories
- **[Types API](types-api)** - TypeScript type definitions and interfaces

### Service APIs

- **[Database API](database-api)** - Database services and repositories
- **[Notification API](notification-api)** - System notification management
- **[Logger API](logger-api)** - Logging utilities and configurations
- **[Chart API](chart-api)** - Chart configuration and visualization

### Component APIs

- **[Hook APIs](hook-apis)** - Custom React hooks reference
- **[Component Props](component-props)** - React component prop interfaces *(Coming Soon)*
- **[Common Components](common-component-apis)** - Reusable component APIs *(Coming Soon)*

### Utility APIs

- **[Utilities API](utilities-api)** - Time formatting, status utilities, and common helpers
- **[Validation Utilities](validation-utils-api)** - Input validation and constraint checking

## 🚀 Quick Start

For developers new to the API:

1. **State Management**: Start with [Store API](store-api) to understand global state
2. **Backend Communication**: Check [IPC API](ipc-api) for Electron communication
3. **UI Development**: Review [Hook APIs](hook-apis) and [Component Props](component-props)
4. **Theming**: Explore [Theme API](theme-api) for UI customization
5. **Data Persistence**: Study [Database API](database-api) for data operations

## 📖 Conventions

### TypeScript Types

All APIs include comprehensive TypeScript type definitions with JSDoc documentation.

### Error Handling

APIs follow consistent error handling patterns with proper error types and error boundaries.

### Async Operations

All asynchronous operations use Promises with proper error handling and timeout management.

### Naming Conventions

- Functions: `camelCase`
- Classes: `PascalCase`
- Interfaces: `PascalCase` with descriptive names
- Types: `PascalCase` with `Type` suffix where appropriate
- Constants: `UPPER_SNAKE_CASE`

## 🛠️ Development Guidelines

### Adding New APIs

When adding new public APIs:

1. Add comprehensive JSDoc documentation
2. Include TypeScript type definitions
3. Add error handling documentation
4. Include usage examples
5. Update relevant API reference documents

### Breaking Changes

All breaking changes to public APIs must:

1. Be documented in CHANGELOG.md
2. Include migration guides
3. Provide deprecation warnings where possible
4. Follow semantic versioning

### Testing

All public APIs should have:

1. Unit tests for core functionality
2. Integration tests for complex workflows
3. Type safety tests for TypeScript definitions
4. Error condition tests

## 📝 Contributing to Documentation

When updating API documentation:

1. Keep documentation in sync with code changes
2. Include practical examples for complex APIs
3. Document error conditions and edge cases
4. Use consistent formatting and structure
5. Test all code examples for accuracy
