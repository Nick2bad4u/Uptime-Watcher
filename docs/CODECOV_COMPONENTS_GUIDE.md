# Codecov Components Guide for Uptime Watcher

## Overview

This document outlines the Codecov Components configuration for the Uptime Watcher project. Components allow us to track coverage for specific functional areas of our application, providing better insight into which parts of our codebase are well-tested and which need more attention.

## Why Components Over Flags?

While we use flags to separate frontend and electron coverage uploads, components provide additional granular tracking within those domains. Components are virtual filters defined entirely in the `codecov.yml` configuration, allowing us to:

- Track coverage for cross-cutting concerns (e.g., error handling across both frontend and backend)
- Monitor specific architectural layers (e.g., state management, database layer)
- Set different coverage targets for different types of code
- Get component-specific status checks in pull requests

## Component Structure

### Frontend Architecture Components

#### UI Components (`frontend_ui_components`)

- **Path**: `src/components/**`
- **Purpose**: All React components and their related files
- **Coverage Target**: 80% project, 75% patch
- **Rationale**: UI components should be well-tested but may include styling code that's harder to test

#### State Management (`frontend_state_management`)

- **Path**: `src/stores/**`
- **Purpose**: Zustand stores managing application state
- **Coverage Target**: 85% project, 80% patch
- **Rationale**: State management is critical to application functionality and should be thoroughly tested

#### Frontend Services (`frontend_services`)

- **Path**: `src/services/**`
- **Purpose**: Frontend business logic and API communication
- **Coverage Target**: 80% project, 75% patch
- **Rationale**: Business logic should be well-tested but may include complex async operations

#### React Hooks (`frontend_hooks`)

- **Path**: `src/hooks/**`
- **Purpose**: Custom React hooks for reusable logic
- **Coverage Target**: 80% project, 75% patch
- **Rationale**: Custom hooks contain reusable logic that should be well-tested

#### Frontend Utils (`frontend_utils`)

- **Path**: `src/utils/**`
- **Purpose**: Pure utility functions for the frontend
- **Coverage Target**: 85% project, 80% patch
- **Rationale**: Utility functions are usually pure and easier to test comprehensively

### Backend Architecture Components

#### Core Backend Services (`backend_core_services`)

- **Path**: `electron/services/**`
- **Purpose**: All backend services (database, monitoring, IPC, etc.)
- **Coverage Target**: 90% project, 85% patch
- **Rationale**: Backend services are critical infrastructure and should be thoroughly tested

#### Domain Managers (`backend_managers`)

- **Path**: `electron/managers/**`
- **Purpose**: High-level domain managers (DatabaseManager, SiteManager, etc.)
- **Coverage Target**: 90% project, 85% patch
- **Rationale**: Domain managers orchestrate business logic and should be well-tested

#### Uptime Orchestrator (`backend_orchestrator`)

- **Path**: `electron/UptimeOrchestrator.ts`
- **Purpose**: Central coordinator for monitoring operations
- **Coverage Target**: 95% project, 90% patch
- **Rationale**: Core monitoring logic is critical and should have the highest coverage

#### Backend Utils (`backend_utils`)

- **Path**: `electron/utils/**`, `electron/electronUtils.ts`
- **Purpose**: Utility functions for the backend
- **Coverage Target**: 85% project, 80% patch
- **Rationale**: Utility functions should be well-tested but may include platform-specific code

### Domain-Specific Components

#### Database Layer (`database_layer`)

- **Path**: `electron/services/database/**`, `electron/managers/DatabaseManager.ts`
- **Purpose**: All database-related code
- **Coverage Target**: 95% project, 90% patch
- **Rationale**: Database operations are critical and should be thoroughly tested

#### Monitoring Engine (`monitoring_engine`)

- **Path**: `electron/services/monitoring/**`, `electron/managers/MonitorManager.ts`
- **Purpose**: Core monitoring functionality
- **Coverage Target**: 90% project, 85% patch
- **Rationale**: Monitoring is the core feature and should be well-tested

#### IPC Communication (`ipc_communication`)

- **Path**: `electron/services/ipc/**`, `electron/preload.ts`
- **Purpose**: Inter-process communication between main and renderer
- **Coverage Target**: 90% project, 85% patch
- **Rationale**: IPC is critical for frontend-backend communication

#### Site Management (`site_management`)

- **Path**: `electron/managers/SiteManager.ts`, `src/stores/sites/**`, `src/components/AddSiteForm/**`, `src/components/SiteDetails/**`
- **Purpose**: All site-related functionality across frontend and backend
- **Coverage Target**: 85% project, 80% patch
- **Rationale**: Site management spans UI and backend, some UI code may be harder to test

#### Settings & Configuration (`settings_configuration`)

- **Path**: `electron/managers/ConfigurationManager.ts`, `src/stores/settings/**`, `src/components/Settings/**`
- **Purpose**: Application settings and configuration
- **Coverage Target**: 85% project, 80% patch
- **Rationale**: Settings are important but may include UI code that's harder to test

#### Dashboard & Analytics (`dashboard_analytics`)

- **Path**: `src/components/Dashboard/**`, `src/stores/stats/**`, `src/stores/ui/**`
- **Purpose**: Main dashboard and analytics display
- **Coverage Target**: 80% project, 75% patch
- **Rationale**: Dashboard code includes complex UI and visualization logic

#### Error Handling (`error_handling`)

- **Path**: `src/stores/error/**`, `**/error*`
- **Purpose**: Error handling across the entire application
- **Coverage Target**: 90% project, 85% patch
- **Rationale**: Error handling is critical for user experience and should be well-tested

#### Theme System (`theme_system`)

- **Path**: `src/theme/**`
- **Purpose**: Application theming and styling
- **Coverage Target**: 75% project, 70% patch
- **Rationale**: Theme code is often styling-related and may be harder to test

### Cross-Cutting Components

#### Type Definitions (`type_definitions`)

- **Path**: `src/types.ts`, `electron/types.ts`, `**/types/**`
- **Purpose**: TypeScript type definitions
- **Coverage Target**: 70% project, 65% patch
- **Rationale**: Type definitions are mostly interfaces and may not require extensive testing

#### Constants (`constants`)

- **Path**: `src/constants.ts`, `electron/constants.ts`
- **Purpose**: Application constants
- **Coverage Target**: 70% project, 65% patch
- **Rationale**: Constants are usually simple values that don't require extensive testing

## Coverage Targets Rationale

The coverage targets are set based on the criticality and testability of each component:

- **95%**: Critical core functionality (Uptime Orchestrator, Database Layer)
- **90%**: Important backend services and infrastructure
- **85%**: Business logic and state management
- **80%**: UI components and frontend services
- **75%**: Styling and theme-related code
- **70%**: Type definitions and constants

## Using Components in Development

### Pull Request Comments

Components will appear in PR comments, showing which areas of the codebase are affected by your changes and their coverage impact.

### Status Checks

Each component can have its own status check, allowing you to see if your changes meet the coverage requirements for specific areas.

### Coverage Over Time

Once enabled in the Codecov UI, you can track coverage trends for each component over time, helping identify areas that need attention.

### Filtering in UI

You can filter the Codecov UI by component to focus on specific areas of the codebase.

## Best Practices

1. **Component-Specific Testing**: When working on a specific component, ensure your tests cover the functionality within that component's scope.

2. **Cross-Component Testing**: For features that span multiple components (like site management), ensure tests cover the interactions between components.

3. **Coverage Monitoring**: Use the component coverage information to identify which areas of the codebase need more testing attention.

4. **Target Adjustment**: Coverage targets can be adjusted based on real-world usage and the difficulty of testing specific components.

## Future Enhancements

- **Feature-Based Components**: Consider adding components for specific features (e.g., notifications, updates)
- **Performance Monitoring**: Add components for performance-critical code paths
- **Security Components**: Track coverage for security-related code
- **Integration Components**: Monitor coverage for external integrations

## Maintenance

This component configuration should be reviewed and updated when:

- New major features are added
- Architecture changes significantly
- Coverage targets need adjustment based on real-world data
- New testing strategies are implemented

Remember to update this documentation when making changes to the component configuration in `.codecov.yml`.
