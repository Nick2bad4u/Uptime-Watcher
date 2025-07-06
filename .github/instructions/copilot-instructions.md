You are a professional software engineer following all modern best practices and standards.

Always keep in mind the following when making changes:

1. Review all logic and data paths
2. Ensure proper state management
3. Use project standards for coding
4. Ensure proper integration with front and backend
5. Double check all changes for consistency
6. Use the tools available to you to ensure the code is correct and follows best practices
7. Always test your changes thoroughly before finalizing
8. Always aim for 100% test coverage.
9. Don't forget to clean up any unused code or imports, especially after refactoring.
10. Use as many requests as you want, and use as much time as you want. KEEP GOING UNTIL YOU FINISH ALL ASSIGNED TASKS!!!

# Uptime Watcher - AI Context Instructions

## Project Overview

Uptime Watcher is a production-ready Electron + React desktop application for website monitoring with comprehensive test coverage and enterprise-level architecture.

Always update this document at ./.github/instructions/copilot-instructions.md if you make changes to the architecture or key components.

## Core Architecture

### Technology Stack

- **Frontend**: React + TypeScript + Zustand + TailwindCSS + Vite
- **Backend**: Electron main process + Node.js + SQLite
- **Communication**: IPC with contextBridge security
- **Testing**: Vitest with extensive frontend and backend test suites

### Directory Structure

```
src/                    # Frontend (React)
├── components/         # React components (PascalCase)
├── stores/            # Zustand stores (domain-separated)
├── hooks/             # Custom React hooks
├── services/          # Frontend business logic
├── utils/             # Pure utility functions
└── theme/             # Theme system + styled components

electron/              # Backend (Electron main process)
├── services/          # Domain services (application/, database/, ipc/, monitoring/)
├── managers/          # Domain managers (ConfigurationManager, DatabaseManager, etc.)
├── utils/             # Backend utilities
└── main.ts           # Entry point
```

### Key Design Patterns

#### 1. Store Architecture (Zustand)

```typescript
// Domain-separated stores with centralized error handling
useSitesStore; // Site data + monitoring state
useSettingsStore; // App preferences + backend sync
useErrorStore; // Global error handling
useUiStore; // Modal states + view preferences
useStatsStore; // Computed metrics
useUpdatesStore; // Application updates
```

#### 2. IPC Communication Pattern

```typescript
// Secure, domain-organized API
window.electronAPI = {
 sites: { getSites, addSite, removeSite, updateSite, checkSiteNow },
 monitoring: { startMonitoring, stopMonitoring, startMonitoringForSite },
 data: { exportData, importData, downloadSQLiteBackup },
 settings: { getHistoryLimit, updateHistoryLimit },
 events: { onStatusUpdate, onUpdateStatus, removeAllListeners },
};
```

#### 3. Data Flow Pattern

```
User Action → Store → IPC → Backend Service → Database →
Response → Store Update → Component Re-render
```

#### 4. Real-Time Updates

```
Monitor Service → UptimeOrchestrator → emit("status-update") →
Window Service → Frontend Handler → Store → UI Update
```

## File Naming Conventions

- **Components**: PascalCase (`SiteCard.tsx`, `AddSiteForm.tsx`)
- **Utilities**: camelCase (`electronUtils.ts`, `fileDownload.ts`)
- **Managers**: PascalCase + Manager suffix (`ConfigurationManager.ts`)
- **Stores**: camelCase + Store suffix (`useSitesStore.ts`)
- **Documentation**: kebab-case (`data-flow-architecture.md`)

## Key Components

### Frontend Components

- **Dashboard**: Site overview with SiteCard grid
- **SiteDetails**: Modal with tabs (Overview, Analytics, History, Settings)
- **AddSiteForm**: Site creation with validation
- **Settings**: App configuration modal
- **Header**: Global controls + status overview

### Backend Services

- **ApplicationService**: App lifecycle coordination
- **IpcService**: Domain-organized IPC handlers
- **UptimeOrchestrator**: Central coordinator for monitoring
- **DatabaseManager**: SQLite operations
- **WindowService**: Window management

### Stores & State

- **Sites**: Real-time site data, monitoring control, status updates
- **Settings**: Theme, preferences, history limits (synced with backend)
- **Error**: Centralized error handling with user notifications
- **UI**: Modal states, selected items, loading indicators

## Database Schema

```sql
sites (identifier PK, name, created_at, updated_at)
monitors (id PK, site_identifier FK, type, url, port, interval, enabled)
status_history (id PK, monitor_id FK, status, response_time, checked_at)
settings (key PK, value, updated_at)
```

## Security & Performance

- **Security**: Context isolation, input validation, no direct DOM manipulation
- **Performance**: Incremental updates, domain-separated stores, intelligent caching
- **Error Handling**: Centralized with graceful degradation
- **Testing**: High coverage across frontend and backend with comprehensive test suites

## Key Behaviors

1. **No Direct DOM**: All UI updates flow through React state
2. **Type Safety**: Full TypeScript with strict configuration
3. **Real-Time**: Event-driven status updates with optimized re-renders
4. **Modular**: Clean domain separation, dependency injection ready
5. **Production Ready**: Comprehensive error handling, logging, backup/recovery

## Common Patterns to Follow

- Use domain-specific stores, never global state
- All backend communication via `window.electronAPI`
- Error handling via `withErrorHandling` wrapper
- Component composition over inheritance
- Memoization for expensive computations
- Incremental updates for real-time data
- Always use the theme system for styling
- Use `useEffect` for side effects, never in render
- Use `useMemo` and `useCallback` to optimize performance
- Use the proper state management patterns for your components
- Never do any direct DOM manipulation in the frontend; always use React state to manage UI updates
- Always use the API provided by the backend for any data operations

## When Making Changes

1. **Frontend**: Update store → component will auto-update
2. **Backend**: Add IPC handler → update preload → update frontend
3. **Database**: Use existing repositories, maintain transaction safety
4. **Tests**: Add tests for new functionality (maintain high coverage standards)
5. **Types**: Update TypeScript interfaces for new data structures

Always keep this document up-to-date with any architectural changes or key component updates to ensure consistency and clarity for all contributors.
Always maintain the highest standards of code quality, security, and performance. Use the tools available to you to ensure the code is correct and follows best practices. Always test your changes thoroughly before finalizing, and aim for 100% test coverage.
Keep going until you finish all assigned tasks, and don't forget to clean up any unused code or imports, especially after refactoring. Use as many requests and as much time as you need to ensure the code is correct and follows best practices.
