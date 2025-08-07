# 🤖 AI Context Guide - Uptime Watcher (Comprehensive)

> **Complete AI Onboarding**: This document provides exhaustive context for AI assistants to understand and work effectively with the Uptime Watcher codebase at every level.

## 📋 Project Overview & Mission

**Uptime Watcher** is a sophisticated Electron desktop application for monitoring website uptime with real-time updates, response time tracking, and historical data visualization.

### Core Purpose & Capabilities

- **Multi-Service Monitoring**: HTTP, port connectivity, and ping monitoring
- **Real-Time Status Updates**: Live status changes with visual feedback
- **Historical Data Tracking**: Comprehensive uptime history and response times
- **Advanced Notifications**: Desktop notifications and sound alerts
- **Comprehensive Configuration**: Per-monitor settings and global preferences
- **Data Management**: Export/import functionality with SQLite database
- **Auto-Updates**: Built-in update mechanism with restart coordination

### Project Metadata

- **Version**: 10.1.0
- **License**: Unlicense
- **Repository**: https://github.com/Nick2bad4u/Uptime-Watcher
- **Main Entry**: dist-electron/main.js
- **Development Server**: Vite on port 5173

## 🏗️ Technology Stack (COMPLETE)

### Frontend Stack

```yaml
Framework: React 18+ with TypeScript
Styling: Tailwind CSS + Custom Theme System
State Management: Zustand (modular stores)
Build Tool: Vite 5.4+
Development: Hot reload with React DevTools
Icons: React Icons (Heroicons, Lucide)
Charts: Chart.js with React-Chartjs-2
```

### Desktop Framework

```yaml
Platform: Electron 32+ (main + renderer processes)
Security: Context isolation + preload scripts
Process Communication: IPC with typed safety
File System: Node.js APIs in main process
Native Features: System tray, notifications, auto-updater
```

### Backend/Data Layer

```yaml
Database: SQLite with node-sqlite3-wasm
ORM Pattern: Custom repository pattern
Transactions: Automatic transaction wrapping
Migration: Built-in schema migration system
Backup: Export/import functionality
```

### Development & Quality

```yaml
Testing: Vitest (dual config: frontend + electron)
Type Checking: TypeScript 5.6+ (strict mode)
Linting: ESLint + Prettier + Biome
Code Quality: Cognitive complexity analysis
Documentation: TypeDoc + TSDoc standards
Coverage: Codecov integration with dual reporting
```

### Build & Distribution

```yaml
Build: Vite + TypeScript compilation
Packaging: Electron Builder
Platform Support: Windows, macOS, Linux
Auto-Updates: electron-updater integration
Assets: Static file copying for WASM
```

## 📁 Complete Directory Structure

```text
Uptime-Watcher/
├── 📦 Root Configuration
│   ├── package.json           # Dependencies, scripts, metadata
│   ├── vite.config.ts         # Vite build configuration
│   ├── tsconfig.json          # Frontend TypeScript config
│   ├── tsconfig.electron.json # Backend TypeScript config
│   ├── vitest.config.ts       # Frontend test configuration
│   ├── vitest.electron.config.ts # Backend test configuration
│   ├── eslint.config.mjs      # ESLint configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── .env                   # Environment variables
│
├── 🖥️ electron/ (Main Process - Node.js)
│   ├── main.ts                # Application entry point
│   ├── preload.ts             # IPC bridge & security layer
│   ├── constants.ts           # Electron-specific constants
│   ├── electronUtils.ts       # Electron utility functions
│   ├── types.ts               # Electron-specific types
│   ├── UptimeOrchestrator.ts  # Main application orchestrator
│   │
│   ├── 🎯 events/             # Event system
│   │   ├── eventTypes.ts      # Complete event type definitions
│   │   └── TypedEventBus.ts   # Type-safe event bus implementation
│   │
│   ├── 👔 managers/           # High-level business orchestrators
│   │   ├── ConfigurationManager.ts # App configuration management
│   │   ├── DatabaseManager.ts     # Database lifecycle management
│   │   ├── MonitorManager.ts      # Monitoring orchestration
│   │   └── SiteManager.ts         # Site operations orchestration
│   │
│   ├── 🔧 services/           # Service-oriented architecture
│   │   ├── ServiceContainer.ts    # Dependency injection container
│   │   │
│   │   ├── 📊 application/        # Core application services
│   │   │   └── ApplicationService.ts # Main app lifecycle service
│   │   │
│   │   ├── 💾 database/           # Data persistence layer
│   │   │   ├── DatabaseService.ts     # Core database operations
│   │   │   ├── HistoryRepository.ts   # Status history data
│   │   │   ├── MonitorRepository.ts   # Monitor configuration data
│   │   │   ├── SettingsRepository.ts  # Application settings data
│   │   │   ├── SiteRepository.ts      # Site configuration data
│   │   │   └── utils/                 # Database utilities
│   │   │
│   │   ├── 🔌 ipc/               # Inter-process communication
│   │   │   ├── IpcService.ts         # Main IPC handler service
│   │   │   ├── types.ts              # IPC message types
│   │   │   ├── utils.ts              # IPC utility functions
│   │   │   └── validators.ts         # IPC message validation
│   │   │
│   │   ├── 📡 monitoring/         # Monitoring system
│   │   │   ├── EnhancedMonitorChecker.ts # Main monitoring engine
│   │   │   ├── EnhancedMonitoringServiceFactory.ts # Service factory
│   │   │   ├── HttpMonitor.ts        # HTTP monitoring service
│   │   │   ├── PingMonitor.ts        # Ping monitoring service
│   │   │   ├── PortMonitor.ts        # Port monitoring service
│   │   │   ├── MonitorFactory.ts     # Monitor service factory
│   │   │   ├── MonitorScheduler.ts   # Scheduled monitoring
│   │   │   ├── MonitorOperationRegistry.ts # Race condition prevention
│   │   │   ├── MonitorStatusUpdateService.ts # Status update handling
│   │   │   ├── OperationTimeoutManager.ts # Timeout management
│   │   │   ├── MonitorTypeRegistry.ts # Monitor type registration
│   │   │   ├── constants.ts          # Monitoring constants
│   │   │   ├── types.ts              # Monitoring type definitions
│   │   │   └── utils/                # Monitoring utilities
│   │   │
│   │   ├── 🔔 notifications/      # System notifications
│   │   │   └── NotificationService.ts # Desktop notification service
│   │   │
│   │   ├── 🌐 site/               # Site management services
│   │   │   └── SiteService.ts        # Site business logic
│   │   │
│   │   ├── 🔄 updater/            # Auto-update functionality
│   │   │   └── AutoUpdaterService.ts # Update management
│   │   │
│   │   └── 🪟 window/             # Window management
│   │       └── WindowService.ts      # Electron window handling
│   │
│   ├── 🛠️ utils/               # Shared utilities
│   │   ├── logger.ts              # Logging infrastructure
│   │   ├── cache/                 # Caching utilities
│   │   ├── monitoring/            # Monitoring helper functions
│   │   └── operationalHooks.ts    # Database operation hooks
│   │
│   └── ✅ test/                # Backend tests
│       ├── setup.ts               # Test environment setup
│       └── **/*.test.ts           # Test files
│
├── 🎨 src/ (Renderer Process - React)
│   ├── main.tsx               # React application entry point
│   ├── App.tsx                # Main App component
│   ├── index.css              # Global styles
│   ├── constants.ts           # Frontend constants
│   ├── types.ts               # Frontend-specific types
│   │
│   ├── 🧩 components/         # React component tree
│   │   ├── AddSiteForm/           # Site creation forms
│   │   │   ├── AddSiteModal.tsx       # Modal wrapper
│   │   │   ├── AddSiteForm.tsx        # Main form component
│   │   │   └── **/*.tsx               # Form sub-components
│   │   │
│   │   ├── Dashboard/             # Main dashboard interface
│   │   │   ├── SiteList/              # Site listing components
│   │   │   │   ├── SiteList.tsx           # Main list component
│   │   │   │   └── **/*.tsx               # List sub-components
│   │   │   │
│   │   │   └── SiteCard/              # Individual site cards
│   │   │       ├── SiteCard.tsx           # Main card component
│   │   │       ├── SiteCardHeader.tsx     # Card header
│   │   │       └── **/*.tsx               # Card sub-components
│   │   │
│   │   ├── Header/                # Application header
│   │   │   ├── Header.tsx             # Main header component
│   │   │   └── **/*.tsx               # Header sub-components
│   │   │
│   │   ├── Settings/              # Settings interface
│   │   │   ├── Settings.tsx           # Main settings component
│   │   │   └── **/*.tsx               # Settings sub-components
│   │   │
│   │   ├── SiteDetails/           # Site detail views
│   │   │   ├── SiteDetails.tsx        # Main details component
│   │   │   └── **/*.tsx               # Details sub-components
│   │   │
│   │   ├── common/                # Reusable components
│   │   │   └── **/*.tsx               # Shared UI components
│   │   │
│   │   └── error/                 # Error handling components
│   │       └── **/*.tsx               # Error boundary components
│   │
│   ├── 🎣 hooks/               # Custom React hooks
│   │   ├── useBackendFocusSync.ts # Backend focus synchronization
│   │   ├── useSelectedSite.ts     # Site selection management
│   │   └── **/*.ts                # Additional custom hooks
│   │
│   ├── 🏪 stores/              # Zustand state management
│   │   ├── types.ts               # Store type definitions
│   │   ├── utils.ts               # Store utility functions
│   │   │
│   │   ├── error/                 # Error state management
│   │   │   ├── useErrorStore.ts       # Error handling store
│   │   │   └── ErrorBoundary.tsx      # React error boundary
│   │   │
│   │   ├── monitor/               # Monitor type management
│   │   │   └── useMonitorTypesStore.ts # Monitor type configuration
│   │   │
│   │   ├── settings/              # Application settings
│   │   │   ├── useSettingsStore.ts    # Settings state management
│   │   │   └── types.ts               # Settings type definitions
│   │   │
│   │   ├── sites/                 # Site and monitoring data
│   │   │   ├── useSitesStore.ts       # Main sites store (modular)
│   │   │   ├── useSitesState.ts       # Core state management
│   │   │   ├── useSiteOperations.ts   # CRUD operations
│   │   │   ├── useSiteMonitoring.ts   # Monitoring lifecycle
│   │   │   ├── useSiteSync.ts         # Backend synchronization
│   │   │   ├── types.ts               # Site store types
│   │   │   ├── services/              # Site services
│   │   │   └── utils/                 # Site utilities
│   │   │
│   │   ├── ui/                    # UI state management
│   │   │   └── useUiStore.ts          # UI state (modals, views)
│   │   │
│   │   └── updates/               # Update management
│   │       ├── useUpdatesStore.ts     # Update state management
│   │       └── types.ts               # Update type definitions
│   │
│   ├── 🎨 theme/               # Theming system
│   │   ├── components.tsx         # Themed component library
│   │   ├── types.ts               # Theme type definitions
│   │   └── useTheme.ts            # Theme management hook
│   │
│   ├── 🛠️ utils/               # Frontend utilities
│   │   ├── cacheSync.ts           # Cache synchronization
│   │   └── **/*.ts                # Additional utilities
│   │
│   ├── 🔧 services/            # Frontend services
│   │   ├── logger.ts              # Frontend logging
│   │   └── **/*.ts                # Additional services
│   │
│   └── ✅ test/                # Frontend tests
│       ├── setup.ts               # Test environment setup
│       └── **/*.test.tsx          # Test files
│
├── 🤝 shared/                 # Common code (frontend + backend)
│   ├── types.ts               # Core domain types
│   │
│   ├── 📊 types/               # Shared type definitions
│   │   └── events.ts              # Event type definitions
│   │
│   ├── 🛠️ utils/               # Shared utilities
│   │   ├── environment.ts         # Environment detection
│   │   └── errorHandling.ts       # Shared error handling
│   │
│   ├── ✅ validation/          # Shared validation
│   │   ├── schemas.ts             # Zod validation schemas
│   │   └── validatorUtils.ts      # Validation utilities
│   │
│   └── ✅ test/                # Shared test utilities
│       └── **/*.ts                # Shared test helpers
│
├── 📚 docs/                   # Comprehensive documentation
│   ├── AI-CONTEXT.md          # This document
│   ├── DEVELOPER-QUICK-START.md # Quick start guide
│   ├── API-DOCUMENTATION.md   # API reference
│   ├── TROUBLESHOOTING.md     # Debug guide
│   │
│   ├── Architecture/              # Architecture documentation
│   │   ├── ADRs/                      # Architecture Decision Records
│   │   ├── Patterns/                  # Development patterns
│   │   └── Templates/                 # Code templates
│   │
│   ├── Guides/                    # Implementation guides
│   │   ├── NEW_MONITOR_TYPE_IMPLEMENTATION.md
│   │   ├── UI-Feature-Development-Guide.md
│   │   ├── TESTING.md
│   │   └── **/*.md                    # Additional guides
│   │
│   └── Archive/                   # Historical documentation
│
├── 🏗️ assets/                # Static assets
│   └── node-sqlite3-wasm.wasm    # SQLite WebAssembly binary
│
├── 🖼️ icons/                 # Application icons
│   └── **/*.png                  # Icon files for different platforms
│
├── 📦 release/                # Build outputs
├── 📊 coverage/               # Test coverage reports
└── 🛠️ dist-electron/          # Compiled Electron code
```

## 🎯 Core Architectural Patterns

### 1. Service Container Pattern (Dependency Injection)

**Location**: `electron/services/ServiceContainer.ts`

```typescript
export class ServiceContainer {
 private static instance: ServiceContainer | undefined;

 // Service Categories:
 // - Core Services: Infrastructure (Database, IPC, Events)
 // - Application Services: Business orchestrators (Managers)
 // - Feature Services: Domain functionality (Monitoring, Notifications)
 // - Utility Services: Support functions (Window, Updater)

 public getDatabaseService(): DatabaseService {
  /* ... */
 }
 public getMonitorManager(): MonitorManager {
  /* ... */
 }
 public getSiteManager(): SiteManager {
  /* ... */
 }
 // ... all services accessible via getters
}
```

**Service Categories**:

- **Core Services**: `DatabaseService`, `IpcService`, `TypedEventBus`
- **Application Services**: `ApplicationService`, managers
- **Feature Services**: `MonitoringServices`, `NotificationService`
- **Utility Services**: `WindowService`, `AutoUpdaterService`

### 2. Repository Pattern (Database Access)

**All database access through repositories with dual method patterns**:

```typescript
// Public async methods (create transactions)
async addSite(site: Site): Promise<Site>
async updateSite(id: string, updates: Partial<Site>): Promise<void>

// Internal sync methods (within existing transactions)
addSiteSync(site: Site, db: Database): Site
updateSiteSync(id: string, updates: Partial<Site>, db: Database): void
```

**Transaction Safety**: All mutations wrapped in `executeTransaction()`

**Repositories**:

- `SiteRepository` - Site configuration and metadata
- `MonitorRepository` - Monitor configurations
- `HistoryRepository` - Status history and metrics
- `SettingsRepository` - Application preferences

### 3. Event-Driven Communication

**TypedEventBus**: `electron/events/TypedEventBus.ts`

```typescript
interface UptimeEvents {
 "monitor:status-updated": MonitorStatusUpdateEventData;
 "site:monitoring-started": SiteMonitoringStartedEventData;
 "database:operation-completed": DatabaseOperationEventData;
 // ... 50+ typed events
}

// Type-safe event emission
eventBus.emit("monitor:status-updated", {
 siteId: "site-123",
 monitorId: "monitor-456",
 oldStatus: "up",
 newStatus: "down",
 // ... automatic metadata injection
});
```

**Event Categories**: `database`, `monitoring`, `system`, `ui`

**Automatic Metadata**: Correlation IDs, timestamps, environment context

### 4. Manager Pattern (Business Orchestration)

**High-level orchestrators for complex business logic**:

- **`SiteManager`**: Site CRUD, validation, event coordination
- **`MonitorManager`**: Monitoring lifecycle, scheduling, status updates
- **`DatabaseManager`**: Schema migrations, backup/restore
- **`ConfigurationManager`**: Settings management, validation

### 5. Enhanced Monitoring System

**Unified Architecture** (no fallback systems):

```typescript
// Operation Correlation for Race Condition Prevention
interface MonitorCheckOperation {
 id: string; // UUID-based operation tracking
 monitorId: string;
 initiatedAt: Date;
 cancelled: boolean;
}

// Enhanced monitoring components:
// - EnhancedMonitorChecker: Main monitoring engine
// - MonitorOperationRegistry: Operation correlation
// - MonitorStatusUpdateService: Safe status updates
// - OperationTimeoutManager: Timeout handling
```

### 6. Modular State Management (Zustand)

**Domain-specific stores with dependency injection**:

```typescript
export const useSitesStore = create<SitesStore>()((set, get) => {
 // Modular composition
 const stateActions = createSitesStateActions(set, get);
 const syncActions = createSiteSyncActions({
  /* deps */
 });
 const monitoringActions = createSiteMonitoringActions();
 const operationsActions = createSiteOperationsActions({
  /* deps */
 });

 return {
  ...initialSitesState,
  ...stateActions, // Core state management
  ...operationsActions, // CRUD operations
  ...monitoringActions, // Monitoring lifecycle
  ...syncActions, // Backend synchronization
 };
});
```

**Store Modules**:

- **State Module**: Core data manipulation
- **Operations Module**: CRUD operations
- **Monitoring Module**: Monitoring lifecycle
- **Sync Module**: Backend synchronization

## 💻 Development Conventions & Standards

### TypeScript Configuration (Ultra-Strict)

```jsonc
{
 "compilerOptions": {
  "strict": true, // All strict flags enabled
  "exactOptionalPropertyTypes": true, // Exact optional properties
  "noUncheckedIndexedAccess": true, // Safe array/object access
  "noImplicitReturns": true, // All code paths return
  "noUnusedLocals": true, // No unused variables
  "noUnusedParameters": true, // No unused parameters
  "isolatedModules": true, // Module isolation
  "isolatedDeclarations": true, // Declaration isolation
  // ... comprehensive strict configuration
 },
}
```

**Type Safety Rules**:

- ❌ No `any`, `unknown`, `null`, `undefined` when avoidable
- ✅ Interface-first design for all IPC and events
- ✅ Strict union types and discriminated unions
- ✅ Comprehensive TSDoc documentation

### Error Handling Pattern

**Shared `withErrorHandling` Utility** (`shared/utils/errorHandling.ts`):

```typescript
// Frontend usage (with store integration)
await withErrorHandling(
 async () => {
  const result = await window.electronAPI.sites.addSite(siteData);
  return result;
 },
 {
  clearError: () => errorStore.clearStoreError("sites"),
  setError: (error) => errorStore.setStoreError("sites", error),
  setLoading: (loading) => errorStore.setOperationLoading("addSite", loading),
 }
);

// Backend usage (with logging)
await withErrorHandling(
 async () => {
  return await this.repository.performOperation();
 },
 {
  logger: logger,
  operationName: "performOperation",
 }
);
```

### Validation System

**Shared Zod Schemas** (`shared/validation/schemas.ts`):

```typescript
export const baseMonitorSchema = z.object({
 id: z.string().min(1),
 type: z.enum(["http", "port", "ping"]),
 status: z.enum(["up", "down", "pending", "paused"]),
 monitoring: z.boolean(),
 checkInterval: z.number().min(5000).max(2_592_000_000), // 5s to 30 days
 timeout: z.number().min(1000).max(300_000), // 1s to 5min
 retryAttempts: z.number().min(0).max(10),
 responseTime: z.number().min(-1), // -1 = never checked
 lastChecked: z.date().optional(),
});

export const httpMonitorSchema = baseMonitorSchema.extend({
 type: z.literal("http"),
 url: z.string().refine((val) =>
  validator.isURL(val, {
   protocols: ["http", "https"],
   require_protocol: true,
   require_tld: true,
   // ... comprehensive URL validation
  })
 ),
});
```

**Validation Utilities** (`shared/validation/validatorUtils.ts`):

- Consistent validation across frontend/backend
- Security-focused patterns using validator.js
- Type-safe validation with automatic TypeScript inference

### Database Operation Patterns

**Repository Methods**:

```typescript
// Transaction-creating async methods (public API)
public async addSite(site: Site): Promise<Site> {
    return this.databaseService.executeTransaction(async (db) => {
        return this.addSiteSync(site, db);
    });
}

// Sync methods for use within transactions (internal)
public addSiteSync(site: Site, db: Database): Site {
    // Direct database operations within existing transaction
    const statement = db.prepare(ADD_SITE_SQL);
    const result = statement.run(siteData);
    return { ...site, id: result.lastInsertRowid as string };
}
```

**Event Emission**: All database operations emit lifecycle events

### IPC Communication Pattern

**Type-Safe IPC** (`electron/preload.ts`):

```typescript
// Organized by functional domains
const electronAPI = {
 sites: {
  addSite: (site: Site) => ipcRenderer.invoke("add-site", site),
  getSites: () => ipcRenderer.invoke("get-sites"),
  updateSite: (id: string, updates: Partial<Site>) => ipcRenderer.invoke("update-site", id, updates),
  // ... all site operations
 },
 monitoring: {
  startMonitoring: () => ipcRenderer.invoke("start-monitoring"),
  stopMonitoring: () => ipcRenderer.invoke("stop-monitoring"),
  checkSiteNow: (siteId: string, monitorId: string) => ipcRenderer.invoke("check-site-now", siteId, monitorId),
  // ... all monitoring operations
 },
 // ... other domains
};
```

**IPC Handlers** (`electron/services/ipc/IpcService.ts`):

- Standardized registration with validators
- Comprehensive error handling and logging
- Type-safe message contracts

## 🔧 Critical Components Deep Dive

### MonitorCheckResult Interface (CURRENT)

```typescript
export interface MonitorCheckResult {
 /** Optional human-readable details about the check result */
 details?: string;

 /** Optional error message if the check failed */
 error?: string;

 /** Response time in milliseconds (REQUIRED) */
 responseTime: number;

 /** Status outcome of the check (REQUIRED) */
 status: "up" | "down";
}
```

**Critical Notes**:

- `responseTime` is **REQUIRED** (not optional as some docs claim)
- `details` should be populated for proper history tracking
- Return `status: "up" | "down"` only (not "pending" or "paused")

### Enhanced Monitoring Components

**Core Services**:

1. **`EnhancedMonitorChecker`** - Main monitoring engine

   - Operation correlation with UUID tracking
   - Race condition prevention
   - Advanced timeout management
   - Status update validation

2. **`MonitorOperationRegistry`** - Operation tracking

   - UUID-based operation IDs with collision prevention
   - Active operation management per monitor
   - Automatic cleanup on completion/timeout

3. **`MonitorStatusUpdateService`** - Safe status updates

   - Validates monitoring state before updates
   - Operation correlation prevents conflicting updates
   - Database transaction safety

4. **`OperationTimeoutManager`** - Timeout handling
   - Buffer-based timeout management
   - Resource leak prevention
   - Automatic operation cancellation

### Service Container Details

**Service Registration Categories**:

```typescript
// Core infrastructure services
private getDatabaseService(): DatabaseService
private getEventBus(): TypedEventBus<UptimeEvents>
private getIpcService(): IpcService

// Repository layer
private getHistoryRepository(): HistoryRepository
private getMonitorRepository(): MonitorRepository
private getSettingsRepository(): SettingsRepository
private getSiteRepository(): SiteRepository

// Business logic managers
public getConfigurationManager(): ConfigurationManager
public getDatabaseManager(): DatabaseManager
public getMonitorManager(): MonitorManager
public getSiteManager(): SiteManager

// Feature services
public getEnhancedMonitoringServices(): EnhancedMonitoringServices
public getNotificationService(): NotificationService
public getSiteService(): SiteService

// Utility services
public getAutoUpdaterService(): AutoUpdaterService
public getWindowService(): WindowService
```

**Initialization Order**: Infrastructure → Repositories → Managers → Features → Utilities

### Complete Store Architecture

**Store Organization**:

1. **`useSitesStore`** (Modular Composition)

   - `useSitesState` - Core state management
   - `useSiteOperations` - CRUD operations with error handling
   - `useSiteMonitoring` - Monitoring lifecycle management
   - `useSiteSync` - Backend synchronization

2. **`useSettingsStore`** - Application preferences

   - Theme management, notification settings
   - History limits, auto-start configuration
   - Persistent storage sync

3. **`useErrorStore`** - Global error management

   - Store-specific error isolation
   - Operation-level error tracking
   - Automatic error clearing

4. **`useUiStore`** - UI state management

   - Modal visibility, active views
   - Loading states, user interactions

5. **`useUpdatesStore`** - Auto-update management
   - Update availability, download progress
   - Installation coordination

### Event System Complete Reference

**Event Categories & Examples**:

```typescript
interface UptimeEvents {
 // Database Events
 "database:operation-started": DatabaseOperationStartedEventData;
 "database:operation-completed": DatabaseOperationCompletedEventData;
 "database:migration-started": DatabaseMigrationStartedEventData;
 "database:backup-created": DatabaseBackupCreatedEventData;

 // Monitoring Events
 "monitor:status-updated": MonitorStatusUpdateEventData;
 "monitor:check-started": MonitorCheckStartedEventData;
 "monitor:check-completed": MonitorCheckCompletedEventData;
 "monitor:up": MonitorUpEventData;
 "monitor:down": MonitorDownEventData;

 // Site Events
 "site:added": SiteAddedEventData;
 "site:updated": SiteUpdatedEventData;
 "site:deleted": SiteDeletedEventData;
 "site:monitoring-started": SiteMonitoringStartedEventData;
 "site:monitoring-stopped": SiteMonitoringStoppedEventData;

 // System Events
 "system:startup-completed": SystemStartupCompletedEventData;
 "system:shutdown-initiated": SystemShutdownInitiatedEventData;
 "system:focus-changed": SystemFocusChangedEventData;

 // UI Events
 "ui:modal-opened": UiModalOpenedEventData;
 "ui:theme-changed": UiThemeChangedEventData;
 "ui:view-changed": UiViewChangedEventData;

 // ... 50+ total events with complete type safety
}
```

**Event Metadata** (Automatic):

- `correlationId` - UUID for request tracing
- `timestamp` - ISO string timestamp
- `environment` - development/production
- `version` - Application version
- `category` - Event category for filtering

## 🧪 Testing Strategy & Configuration

### Dual Test Configuration

**Frontend Tests** (`vitest.config.ts`):

```typescript
export default defineConfig((configEnv) =>
 mergeConfig(
  viteConfig(configEnv),
  defineConfig({
   test: {
    environment: "jsdom",
    coverage: {
     provider: "v8",
     reporter: ["text", "json", "lcov", "html"],
     reportsDirectory: "./coverage/",
    },
    setupFiles: ["src/test/setup.ts"],
   },
  })
 )
);
```

**Backend Tests** (`vitest.electron.config.ts`):

```typescript
export default defineConfig({
 test: {
  environment: "node",
  coverage: {
   provider: "v8",
   reporter: ["text", "json", "lcov", "html"],
   reportsDirectory: "./coverage/electron/",
  },
  setupFiles: ["electron/test/setup.ts"],
 },
});
```

**Test Commands**:

```bash
# Frontend tests
npm run test                    # Run frontend tests
npm run test:coverage           # Frontend with coverage
npm run test:ui                 # Interactive UI
npm run test:watch              # Watch mode

# Backend tests
npm run test:electron           # Run electron tests
npm run test:electron:coverage  # Electron with coverage
npm run test:electron:ui        # Interactive UI
npm run test:electron:watch     # Watch mode

# Combined
npm run test:all                # Run all tests
npm run test:all:coverage       # All tests with coverage
npm run test:codecov            # Codecov reporting
```

**Coverage Integration**:

- **Frontend Flag**: `frontend` - covers `src/` directory
- **Backend Flag**: `electron` - covers `electron/` directory
- **Codecov**: Automatic dual-flag reporting via GitHub Actions

### Test Patterns

**Repository Testing**:

```typescript
describe("SiteRepository", () => {
 let repository: SiteRepository;
 let mockDatabaseService: MockDatabaseService;

 beforeEach(() => {
  mockDatabaseService = createMockDatabaseService();
  repository = new SiteRepository(mockDatabaseService);
 });

 it("should add site with transaction", async () => {
  // Test async public methods
  const site = await repository.addSite(mockSite);
  expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
 });
});
```

**Store Testing**:

```typescript
describe("useSitesStore", () => {
 let store: UseBoundStore<StoreApi<SitesStore>>;

 beforeEach(() => {
  store = useSitesStore;
  store.getState().clearAllSites();
 });

 it("should handle async operations with error handling", async () => {
  await store.getState().createSite(mockSiteData);
  expect(store.getState().sites).toHaveLength(1);
 });
});
```

**Component Testing**:

```typescript
describe('SiteCard', () => {
    it('should render site information correctly', () => {
        render(<SiteCard site={mockSite} />);
        expect(screen.getByText(mockSite.name)).toBeInTheDocument();
    });

    it('should handle monitoring toggle', async () => {
        const user = userEvent.setup();
        render(<SiteCard site={mockSite} />);

        await user.click(screen.getByRole('button', { name: /toggle monitoring/i }));
        // Assert monitoring state change
    });
});
```

## 🛠️ Build & Development Configuration

### Development Scripts

```bash
# Development
npm run dev                     # Start Vite dev server (port 5173)
npm run electron-dev           # Concurrent Vite + Electron
npm run electron-dev:debug     # With debugging enabled
npm run dev:with-sqlite3       # Copy WASM + start dev

# Building
npm run build                  # Full production build
npm run build:electron-main    # Electron main process only
npm run build:prepublish       # Lint + test + build
npm run dist                   # Build + package with Electron Builder

# Type Checking
npm run check:all              # Check all TypeScript
npm run check:frontend         # Frontend only
npm run check:electron         # Backend only
npm run check:all:test         # Include test configurations

# Quality
npm run lint                   # ESLint + Prettier
npm run lint:fix               # Auto-fix issues
npm run cognitive-complexity   # Complexity analysis
npm run dupes                  # Duplicate code detection

# Documentation
npm run docs:build             # TypeDoc + Docusaurus
npm run docs:deploy            # Deploy to GitHub Pages
npm run docusaurus:start       # Local documentation server
```

### Build Configuration Details

**Vite Configuration** (`vite.config.ts`):

```typescript
export default defineConfig(() => ({
 base: "./", // Relative paths for Electron
 target: "es2024", // Modern JavaScript
 esbuild: {
  target: "es2024",
  keepNames: true, // Better coverage reports
  include: ["**/*.{js,ts,jsx,tsx,mjs}"], // Comprehensive transpilation
 },
 build: {
  emptyOutDir: true,
  sourcemap: true, // Debugging support
  outDir: "dist",
  rollupOptions: {
   // Optimized for Electron builds
  },
 },
 plugins: [
  react(), // React support
  electron([
   // Electron processes
   {
    entry: "electron/main.ts",
    vite: electronMainConfig,
   },
   {
    entry: "electron/preload.ts",
    vite: electronPreloadConfig,
   },
  ]),
  ViteMcp(), // MCP integration
  viteStaticCopy([
   // Copy WASM files
   {
    src: "node_modules/node-sqlite3-wasm/dist/node-sqlite3-wasm.wasm",
    dest: ".",
   },
  ]),
  codecovVitePlugin({
   // Coverage integration
   enableBundleAnalysis: true,
   bundleName: "uptime-watcher",
  }),
 ],
}));
```

**Electron Builder Configuration** (package.json):

```json
{
 "build": {
  "appId": "io.github.uptimewatcher",
  "productName": "Uptime Watcher",
  "directories": {
   "output": "release"
  },
  "files": [
   "dist/**/*",
   "dist-electron/**/*",
   "!**/node_modules/**/*"
  ],
  "extraFiles": [
   {
    "from": "node_modules/node-sqlite3-wasm/dist/node-sqlite3-wasm.wasm",
    "to": "node-sqlite3-wasm.wasm"
   }
  ],
  "mac": {
   /* macOS specific config */
  },
  "win": {
   /* Windows specific config */
  },
  "linux": {
   /* Linux specific config */
  }
 }
}
```

### Environment & Path Configuration

**Path Aliases** (tsconfig.json):

```jsonc
{
 "compilerOptions": {
  "baseUrl": ".",
  "paths": {
   "@/*": ["src/*"], // Frontend components and utilities
   "@shared/*": ["shared/*"], // Shared types and utilities
   "@electron/*": ["electron/*"], // Backend services and utilities
  },
 },
}
```

**Environment Detection** (`shared/utils/environment.ts`):

```typescript
export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";
export const isTest = process.env.NODE_ENV === "test";

export function getEnvVar(name: string, defaultValue?: string): string {
 const value = process.env[name];
 if (value === undefined) {
  if (defaultValue !== undefined) return defaultValue;
  throw new Error(`Required environment variable ${name} is not set`);
 }
 return value;
}
```

## � Critical Knowledge for AI Assistants

### Absolute Requirements ✅

1. **Type Safety First**

   - All IPC messages must be typed
   - No `any` or `unknown` unless absolutely necessary
   - Strict TypeScript configuration must be maintained
   - Use discriminated unions for complex types

2. **Repository Pattern Compliance**

   - All database access through repositories
   - Use `executeTransaction()` for all mutations
   - Implement both async (public) and sync (internal) methods
   - Emit appropriate events for database operations

3. **Error Handling Standards**

   - Use `withErrorHandling()` for all async operations
   - Frontend: Include store error management
   - Backend: Include proper logging context
   - Always re-throw errors after handling

4. **Event-Driven Communication**

   - Prefer events over direct method calls
   - Use TypedEventBus with proper type definitions
   - Include comprehensive metadata in events
   - Follow event naming conventions (`domain:action-description`)

5. **Store Architecture Compliance**
   - Keep stores domain-specific (no global state)
   - Use modular composition pattern
   - Include error handling in all store actions
   - Follow dependency injection between store modules

### Architecture Constraints ⚠️

1. **Enhanced Monitoring Only**

   - No fallback monitoring systems exist
   - MonitorManager requires enhanced services
   - All monitoring uses operation correlation
   - Return proper `MonitorCheckResult` interface

2. **Transaction Safety**

   - All database mutations in transactions
   - Use repository patterns exclusively
   - Event emission within transaction scope
   - Proper rollback on errors

3. **IPC Security**

   - All communication via contextBridge
   - Type-safe message contracts
   - Validation at IPC boundaries
   - No direct Node.js access from renderer

4. **Module Boundaries**
   - Shared code only in `shared/` directory
   - Frontend code in `src/` directory
   - Backend code in `electron/` directory
   - No cross-boundary imports outside shared

### Common Pitfalls to Avoid ❌

1. **Direct Database Access**

   ```typescript
   // ❌ WRONG - Direct database access
   const result = db.prepare("SELECT * FROM sites").all();

   // ✅ CORRECT - Repository pattern
   const sites = await siteRepository.getAllSites();
   ```

2. **Untyped IPC Communication**

   ```typescript
   // ❌ WRONG - Untyped IPC
   ipcRenderer.invoke("some-operation", data);

   // ✅ CORRECT - Typed IPC
   window.electronAPI.sites.addSite(siteData);
   ```

3. **Direct State Mutation**

   ```typescript
   // ❌ WRONG - Direct mutation
   store.sites.push(newSite);

   // ✅ CORRECT - Store actions
   store.addSite(newSite);
   ```

4. **Incorrect Error Handling**

   ```typescript
   // ❌ WRONG - Swallowing errors
   try {
    await operation();
   } catch (error) {
    console.log(error);
   }

   // ✅ CORRECT - Proper error handling
   await withErrorHandling(() => operation(), { logger, operationName: "operation" });
   ```

### Performance Considerations 🚀

1. **Database Operations**

   - Use prepared statements in repositories
   - Batch operations within single transactions
   - Implement proper indexing strategies
   - Use connection pooling appropriately

2. **Event System**

   - Avoid excessive event emission in tight loops
   - Use event batching for bulk operations
   - Implement proper event cleanup
   - Monitor event listener memory usage

3. **State Management**

   - Use selector patterns for computed state
   - Implement proper state normalization
   - Avoid unnecessary re-renders with proper memo
   - Use store subscriptions efficiently

4. **IPC Communication**
   - Batch IPC calls when possible
   - Use streaming for large data transfers
   - Implement proper request/response correlation
   - Avoid blocking the main process

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

## 📚 Essential Files Reference

### Entry Points

- **Electron Main**: `electron/main.ts` - Application lifecycle
- **React Renderer**: `src/main.tsx` - UI application entry
- **IPC Bridge**: `electron/preload.ts` - Secure communication layer

### Core Architecture

- **Service Container**: `electron/services/ServiceContainer.ts` - DI container
- **Event System**: `electron/events/TypedEventBus.ts` - Type-safe events
- **Main Orchestrator**: `electron/UptimeOrchestrator.ts` - Application coordinator

### Database Layer

- **Database Service**: `electron/services/database/DatabaseService.ts`
- **Site Repository**: `electron/services/database/SiteRepository.ts`
- **Monitor Repository**: `electron/services/database/MonitorRepository.ts`
- **History Repository**: `electron/services/database/HistoryRepository.ts`

### Business Logic

- **Site Manager**: `electron/managers/SiteManager.ts` - Site operations
- **Monitor Manager**: `electron/managers/MonitorManager.ts` - Monitoring logic
- **Enhanced Monitor Checker**: `electron/services/monitoring/EnhancedMonitorChecker.ts`

### State Management

- **Sites Store**: `src/stores/sites/useSitesStore.ts` - Main data store
- **Settings Store**: `src/stores/settings/useSettingsStore.ts` - Preferences
- **Error Store**: `src/stores/error/useErrorStore.ts` - Error handling

### Type Definitions

- **Shared Types**: `shared/types.ts` - Core domain types
- **Event Types**: `electron/events/eventTypes.ts` - Event definitions
- **Store Types**: `src/stores/types.ts` - Frontend store types

### Validation

- **Schemas**: `shared/validation/schemas.ts` - Zod validation schemas
- **Utilities**: `shared/validation/validatorUtils.ts` - Validation helpers

### Configuration

- **TypeScript**: `tsconfig.json`, `tsconfig.electron.json`
- **Build**: `vite.config.ts`, `package.json`
- **Testing**: `vitest.config.ts`, `vitest.electron.config.ts`

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

🎯 **Final Note**: This codebase emphasizes type safety, clean architecture, and comprehensive documentation. When working with this project, prioritize understanding the established patterns before making changes, and always maintain the high standards of type safety and error handling that are foundational to its design.
