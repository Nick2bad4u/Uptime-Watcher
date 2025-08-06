# 🤖 AI Context Guide - Uptime Watcher

> **Quick AI Onboarding**: This document provides essential context for AI assistants to understand and work effectively with the Uptime Watcher codebase.

## 📋 Project Overview

**Uptime Watcher** is a sophisticated Electron desktop application for monitoring website uptime with real-time updates, response time tracking, and historical data visualization.

### Core Purpose
- Monitor multiple websites/services simultaneously
- Provide real-time status updates and notifications
- Track historical uptime data and response times
- Offer comprehensive configuration and management

## 🏗️ Architecture Quick Reference

### Technology Stack (ACTUAL - README is outdated)
```yaml
Frontend: React + TypeScript + Tailwind CSS + Vite
Desktop: Electron (main + renderer processes)
State Management: Zustand (domain-specific stores)
Database: SQLite (node-sqlite3-wasm) # NOT LowDB as README claims
IPC: Electron contextBridge with type safety
Events: Custom TypedEventBus with middleware
Testing: Vitest (dual config: frontend + electron)
Build: Vite + TypeScript + Electron Builder
```

### Directory Structure
```text
├── electron/           # Main process (Node.js)
│   ├── main.ts        # Entry point
│   ├── services/      # Service-oriented architecture
│   ├── managers/      # High-level orchestrators
│   └── utils/         # Shared utilities
├── src/               # Renderer process (React)
│   ├── components/    # React components
│   ├── stores/        # Zustand state management
│   └── services/      # Frontend services
├── shared/            # Common code (types, utils, validation)
└── docs/              # Comprehensive documentation
    ├── Architecture/  # ADRs, patterns, templates
    └── Guides/        # Implementation guides
```

## 🎯 Key Architectural Patterns

### 1. Service Container Pattern
- **Location**: `electron/services/ServiceContainer.ts`
- **Purpose**: Centralized dependency injection for all services
- **Categories**: Core, Application, Feature, Utility services

### 2. Repository Pattern
- **Location**: `electron/services/database/*Repository.ts`
- **Dual Methods**: Public async (creates transactions) + Internal sync (within transactions)
- **Transaction Safety**: All mutations wrapped in `executeTransaction()`

### 3. Event-Driven Communication
- **TypedEventBus**: `electron/events/TypedEventBus.ts`
- **Type Safety**: Compile-time checked events with `UptimeEvents` interface
- **Metadata**: Automatic correlation IDs, timestamps, and context injection

### 4. Manager Pattern
- **SiteManager**: Orchestrates site operations
- **MonitorManager**: Handles monitoring lifecycle and operations
- **DatabaseManager**: Coordinates database operations

### 5. Enhanced Monitoring System
- **Operation Correlation**: UUID-based operation tracking
- **Race Condition Prevention**: Validates operations before status updates
- **Unified Architecture**: Single monitoring system (fallback systems removed)

## 💻 Development Conventions

### TypeScript Standards
- **Strict Config**: No `any`, `unknown`, `null`, `undefined` when avoidable
- **Interface-First**: All IPC messages and event payloads are typed
- **TSDoc Required**: Comprehensive documentation with examples

### Error Handling
- **withErrorHandling()**: Shared utility for consistent error management
- **Context-Aware**: Different behavior for frontend vs backend
- **Error Preservation**: Always re-throw after logging/state management

### State Management (Frontend)
- **Domain-Specific Stores**: Separate Zustand stores per domain
- **No Global State**: Modular, composable store architecture
- **Action Logging**: All store actions include consistent logging

### Database Operations
- **Repository Pattern**: All DB access through repositories
- **Transaction Wrapper**: `withDatabaseOperation()` for retry logic and events
- **Event Emission**: Database operations emit lifecycle events

## 🔧 Common Development Tasks

### Adding a New Monitor Type
1. **Interface**: Implement `IMonitorService` in `electron/services/monitoring/`
2. **Registration**: Add to monitoring service factory
3. **Validation**: Create validation schema in `shared/validation/`
4. **Frontend**: Add UI components and form handling
5. **Testing**: Unit tests for both backend and frontend

### Adding IPC Handlers
1. **Handler**: Create in `electron/services/ipc/` following domain pattern
2. **Validation**: Add type guards in `validators.ts`
3. **Types**: Define interfaces for parameters and responses
4. **Frontend**: Use via `window.electronAPI` with type safety

### Adding Database Entities
1. **Repository**: Create using repository template
2. **Migration**: Add database schema changes
3. **Manager**: Add business logic orchestration
4. **IPC**: Expose operations via IPC handlers

### Frontend Component Development
1. **Store**: Create Zustand store for state management
2. **Validation**: Use shared validation schemas
3. **IPC Integration**: Communicate with backend via typed IPC
4. **Error Handling**: Use `withErrorHandling()` for async operations

## 🚨 Critical Things to Know

### DO's ✅
- **Read Documentation First**: Architecture docs are comprehensive and current
- **Follow Patterns**: Use established templates and patterns
- **Type Everything**: Strict TypeScript - no shortcuts
- **Use Repository Pattern**: Never direct database access
- **Test Both Layers**: Frontend and Electron backend
- **Check TSDoc Standards**: Use proper documentation patterns

### DON'Ts ❌
- **No Direct State Mutations**: Always use store actions
- **No Repository Bypass**: Always use repository pattern for DB
- **No Untyped IPC**: All IPC messages must be typed
- **No Global State**: Keep stores domain-specific
- **No `any` or `unknown`**: Maintain strict typing
- **No Breaking Changes**: Consider backward compatibility

### Architecture Constraints
- **Event-Driven**: Prefer events over direct method calls
- **Transaction Safety**: Database mutations must be transactional
- **Type Safety**: Runtime and compile-time type checking
- **Error Handling**: Consistent error patterns across layers

## 🧪 Testing Strategy

### Dual Test Configuration
- **Frontend**: `vitest.config.ts` (React components, stores)
- **Backend**: `vitest.electron.config.ts` (Electron services, repositories)

### Test Patterns
- **Repository Tests**: Mock database service for unit tests
- **Service Tests**: Test business logic with dependency injection
- **Integration Tests**: Test IPC communication and event flows
- **Component Tests**: React component behavior and store integration

## 🛠️ Key Files to Understand

### Entry Points
- `electron/main.ts` - Electron main process entry
- `src/main.tsx` - React renderer entry
- `electron/preload.ts` - IPC bridge setup

### Core Architecture
- `electron/services/ServiceContainer.ts` - Dependency injection
- `electron/events/TypedEventBus.ts` - Event system
- `electron/UptimeOrchestrator.ts` - Main orchestrator

### Critical Services
- `electron/services/ipc/IpcService.ts` - IPC communication
- `electron/services/database/DatabaseService.ts` - Database operations
- `electron/managers/SiteManager.ts` - Site management logic

### State Management
- `src/stores/` - Zustand stores for frontend state
- Pattern: Each domain has its own store module

## 📚 Documentation Quick Links

### For Architecture Understanding
- `docs/Architecture/ADRs/` - Key architectural decisions
- `docs/Architecture/Patterns/Development-Patterns-Guide.md` - Coding patterns
- `docs/Architecture/TSDoc-Standards.md` - Documentation standards

### For Implementation
- `docs/Guides/NEW_MONITOR_TYPE_IMPLEMENTATION.md` - Adding monitor types
- `docs/Guides/UI-Feature-Development-Guide.md` - Frontend development
- `docs/Architecture/Templates/` - Code templates for common patterns

### For Context
- `docs/Guides/Monitoring-Race-Condition-Solution-Plan.md` - Monitoring architecture
- `docs/Guides/Fallback-System-Usage-Analysis.md` - Migration history

## 🎯 AI Assistant Guidelines

### When Helping with Code
1. **Check Documentation First**: Most patterns are documented
2. **Follow Established Patterns**: Don't invent new patterns
3. **Maintain Type Safety**: All code must be properly typed
4. **Use Templates**: Leverage existing templates for consistency
5. **Consider Events**: Prefer event-driven communication
6. **Test Completeness**: Ensure both frontend and backend are tested

### Common AI Tasks
- **Bug Fixes**: Check error handling patterns and transaction safety
- **Feature Addition**: Follow the service/repository/IPC pattern
- **Refactoring**: Maintain existing interfaces and event contracts
- **Documentation**: Use TSDoc standards for all new code

### Integration Points
- **IPC Communication**: All frontend ↔ backend via typed IPC
- **Event System**: Cross-service communication via TypedEventBus
- **Database**: All access via repository pattern with transactions
- **State**: Frontend state via Zustand, backend state via services

---

💡 **Pro Tip**: This codebase prioritizes type safety, clean architecture, and comprehensive documentation. When in doubt, check the existing patterns in `docs/Architecture/` before implementing new solutions.
