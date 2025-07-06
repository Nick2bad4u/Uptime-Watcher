# Uptime Watcher - Complete Data Flow Architecture

## Overview

This document provides a comprehensive analysis of data flows throughout the Uptime Watcher application. The application follows a modern Electron + React architecture with clear separation between main process (backend) and renderer process (frontend).

## Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (Renderer Process)"
        UI[React Components]
        Stores[Zustand Stores]
        Hooks[Custom Hooks]
        Services[Frontend Services]
    end

    subgraph "IPC Bridge"
        Preload[Preload Script]
        Bridge[Context Bridge]
    end

    subgraph "Backend (Main Process)"
        IPC[IPC Service]
        Orchestrator[Uptime Orchestrator]
        Managers[Domain Managers]
        Database[SQLite Database]
    end

    UI --> Stores
    Stores --> Hooks
    Hooks --> Services
    Services --> Bridge
    Bridge --> Preload
    Preload --> IPC
    IPC --> Orchestrator
    Orchestrator --> Managers
    Managers --> Database
```

## Core Data Flow Patterns

### 1. Site Management Data Flow

```mermaid
sequenceDiagram
    participant UI as React Component
    participant Store as Sites Store
    participant API as electronAPI
    participant IPC as IPC Service
    participant Orc as UptimeOrchestrator
    participant SM as SiteManager
    participant DB as Database

    UI->>Store: addSite(siteData)
    Store->>API: window.electronAPI.sites.addSite()
    API->>IPC: ipcRenderer.invoke("add-site")
    IPC->>Orc: uptimeOrchestrator.addSite()
    Orc->>SM: siteManager.addSite()
    SM->>DB: INSERT INTO sites
    DB-->>SM: Site created
    SM-->>Orc: Site object
    Orc-->>IPC: Site object
    IPC-->>API: Site object
    API-->>Store: Site object
    Store->>Store: Add to sites array
    Store-->>UI: Updated state
```

### 2. Real-Time Status Update Flow

```mermaid
sequenceDiagram
    participant Monitor as Monitor Service
    participant Orc as UptimeOrchestrator
    participant Window as Window Service
    participant Handler as Status Handler
    participant Store as Sites Store
    participant UI as React Components

    Monitor->>Orc: status change detected
    Orc->>Orc: emit("status-update", data)
    Orc->>Window: sendToRenderer("status-update")
    Window->>Handler: onStatusUpdate callback
    Handler->>Store: updateSite(siteData)
    Store->>Store: incremental update
    Store-->>UI: re-render with new data
```

### 3. Settings Synchronization Flow

```mermaid
sequenceDiagram
    participant UI as Settings Modal
    participant SettingsStore as Settings Store
    participant API as electronAPI
    participant IPC as IPC Service
    participant Orc as UptimeOrchestrator
    participant Config as ConfigurationManager
    participant DB as Database

    UI->>SettingsStore: updateHistoryLimitValue(limit)
    SettingsStore->>API: window.electronAPI.settings.updateHistoryLimit()
    API->>IPC: ipcRenderer.invoke("update-history-limit")
    IPC->>Orc: setHistoryLimit(limit)
    Orc->>Config: setHistoryLimit(limit)
    Config->>DB: UPDATE settings
    Config->>DB: DELETE old history
    DB-->>Config: Success
    Config-->>Orc: Success
    Orc-->>IPC: Success
    IPC-->>API: Success
    API->>SettingsStore: getHistoryLimit() (sync back)
    SettingsStore->>SettingsStore: updateSettings({historyLimit})
    SettingsStore-->>UI: Updated state
```

## Domain-Specific Data Flows

### Frontend State Management Flow

The frontend uses a modular Zustand store architecture with domain separation:

```typescript
// Store Dependencies Flow
Error Store (Global Error Handling)
    ↑
Sites Store ← Settings Store
    ↑              ↑
UI Store ← Stats Store ← Updates Store
```

#### Store Interaction Patterns

1. **Sites Store** → Manages site data, monitoring state, real-time updates
2. **Settings Store** → Handles app preferences, theme, backend sync
3. **UI Store** → Controls modal states, selected items, view preferences
4. **Error Store** → Centralized error handling across all operations
5. **Stats Store** → Computes metrics from site data
6. **Updates Store** → Manages application update lifecycle

### Backend Service Communication Flow

```mermaid
graph TB
    subgraph "Application Layer"
        App[ApplicationService]
    end

    subgraph "Orchestration Layer"
        Orc[UptimeOrchestrator]
    end

    subgraph "Manager Layer"
        SM[SiteManager]
        MM[MonitorManager]
        CM[ConfigurationManager]
        DM[DatabaseManager]
    end

    subgraph "Service Layer"
        WS[WindowService]
        IS[IpcService]
        NS[NotificationService]
        AS[AutoUpdaterService]
    end

    subgraph "Database Layer"
        DB[(SQLite Database)]
    end

    App --> Orc
    Orc --> SM
    Orc --> MM
    Orc --> CM
    Orc --> DM
    App --> WS
    App --> IS
    App --> NS
    App --> AS
    SM --> DB
    MM --> DB
    CM --> DB
    DM --> DB
```

## IPC Communication Patterns

### IPC API Organization

The IPC API is organized into domain-specific namespaces:

```typescript
window.electronAPI = {
    sites: {
        // Site CRUD operations
        getSites: () => Promise<Site[]>
        addSite: (site: Site) => Promise<Site>
        removeSite: (id: string) => Promise<boolean>
        updateSite: (id: string, updates: Partial<Site>) => Promise<Site>
        checkSiteNow: (siteId: string, monitorId: string) => Promise<StatusUpdate>
    },

    monitoring: {
        // Monitoring control
        startMonitoring: () => Promise<boolean>
        stopMonitoring: () => Promise<boolean>
        startMonitoringForSite: (siteId: string, type?: string) => Promise<boolean>
        stopMonitoringForSite: (siteId: string, type?: string) => Promise<boolean>
    },

    data: {
        // Data operations
        exportData: () => Promise<string>
        importData: (data: string) => Promise<boolean>
        downloadSQLiteBackup: () => Promise<{buffer: ArrayBuffer, fileName: string}>
    },

    settings: {
        // Settings management
        getHistoryLimit: () => Promise<number>
        updateHistoryLimit: (limit: number) => Promise<void>
    },

    events: {
        // Event handling
        onStatusUpdate: (callback: (data: StatusUpdate) => void) => void
        onUpdateStatus: (callback: (data: UpdateStatus) => void) => void
        removeAllListeners: (channel: string) => void
    },

    system: {
        // System operations
        quitAndInstall: () => void
    }
}
```

### IPC Security Flow

```mermaid
graph LR
    subgraph "Renderer Process"
        Comp[React Component]
    end

    subgraph "IPC Bridge (Secure)"
        CB[Context Bridge]
        PL[Preload Script]
    end

    subgraph "Main Process"
        IPC[IPC Service]
        Val[Input Validation]
        Bus[Business Logic]
    end

    Comp --> CB
    CB --> PL
    PL --> IPC
    IPC --> Val
    Val --> Bus
```

## Data Persistence Patterns

### Database Schema Flow

```mermaid
erDiagram
    sites {
        string identifier PK
        string name
        timestamp created_at
        timestamp updated_at
    }

    monitors {
        string id PK
        string site_identifier FK
        string type
        string url
        number port
        number interval
        boolean enabled
    }

    status_history {
        string id PK
        string monitor_id FK
        string status
        number response_time
        timestamp checked_at
        string error_message
    }

    settings {
        string key PK
        string value
        timestamp updated_at
    }

    sites ||--o{ monitors : "contains"
    monitors ||--o{ status_history : "generates"
```

### Database Operations Flow

1. **Create Operations** → Validation → Insert → Event Emission → UI Update
2. **Read Operations** → Query → Transform → Cache → Return
3. **Update Operations** → Validation → Update → History → Event → UI Update
4. **Delete Operations** → Cascade Check → Delete → Cleanup → Event → UI Update

## Error Handling Data Flow

### Centralized Error Management

```mermaid
sequenceDiagram
    participant Comp as Component
    participant Store as Domain Store
    participant Util as withErrorHandling
    participant EStore as Error Store
    participant Logger as Logger Service

    Comp->>Store: performAction()
    Store->>Util: withErrorHandling(operation)

    alt Success Path
        Util->>Store: operation()
        Store-->>Comp: Success result
    else Error Path
        Util->>EStore: setStoreError()
        EStore->>Logger: log error
        Util->>EStore: setOperationLoading(false)
        EStore-->>Comp: Error state update
    end
```

### Error Propagation Pattern

1. **Operation Level** → Try-catch → Error transformation
2. **Store Level** → Error state management → User notification
3. **Component Level** → Error display → Recovery actions
4. **Global Level** → Error boundaries → Fallback UI

## Monitoring Data Flow

### Real-Time Monitoring Cycle

```mermaid
graph TB
    subgraph "Monitoring Loop"
        Start[Start Monitoring]
        Check[Perform Check]
        Store[Store Result]
        Emit[Emit Event]
        Wait[Wait Interval]
    end

    subgraph "Data Flow"
        DB[(Database)]
        Frontend[Frontend Update]
        Notifications[User Notifications]
    end

    Start --> Check
    Check --> Store
    Store --> DB
    Store --> Emit
    Emit --> Frontend
    Emit --> Notifications
    Emit --> Wait
    Wait --> Check
```

### Status Update Optimization

The application uses intelligent incremental updates to minimize re-renders:

```typescript
// Optimized Status Update Handler
const statusUpdateHandler = (update: StatusUpdate) => {
 // Only update the specific site that changed
 setSites((currentSites) =>
  currentSites.map(
   (site) =>
    site.identifier === update.site.identifier
     ? { ...update.site } // Fresh data from backend
     : site // Keep unchanged
  )
 );
};
```

## Performance Optimization Patterns

### State Management Optimizations

1. **Domain Separation** → Reduced re-render scope
2. **Selective Subscriptions** → Components only subscribe to needed state
3. **Memoization** → Expensive computations cached
4. **Incremental Updates** → Only changed data updates

### Database Optimizations

1. **Connection Pooling** → Reuse database connections
2. **Prepared Statements** → SQL injection prevention + performance
3. **Indexing** → Fast queries on identifier and timestamp fields
4. **History Pruning** → Configurable retention limits

### IPC Optimizations

1. **Batched Updates** → Multiple changes sent together
2. **Selective Data** → Only necessary data transferred
3. **Compression** → Large data payloads compressed
4. **Rate Limiting** → Prevent IPC flooding

## Data Backup and Recovery Flow

### Export/Import Process

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant API as electronAPI
    participant Orc as UptimeOrchestrator
    participant DB as Database
    participant FS as File System

    Note over UI,FS: Export Process
    UI->>API: exportData()
    API->>Orc: exportData()
    Orc->>DB: SELECT * FROM all_tables
    DB-->>Orc: JSON data
    Orc-->>API: JSON string
    API->>FS: trigger download

    Note over UI,FS: Import Process
    UI->>API: importData(jsonString)
    API->>Orc: importData(data)
    Orc->>Orc: validate data structure
    Orc->>DB: BEGIN TRANSACTION
    Orc->>DB: INSERT validated data
    Orc->>DB: COMMIT
    DB-->>Orc: Success
    Orc-->>API: Success
```

### SQLite Backup Flow

```mermaid
sequenceDiagram
    participant UI as User Interface
    participant API as electronAPI
    participant Orc as UptimeOrchestrator
    participant DB as DatabaseManager
    participant Buffer as File Buffer

    UI->>API: downloadSQLiteBackup()
    API->>Orc: downloadBackup()
    Orc->>DB: createBackup()
    DB->>Buffer: read database file
    Buffer-->>DB: ArrayBuffer
    DB-->>Orc: {buffer, fileName}
    Orc-->>API: backup data
    API->>UI: trigger download
```

## Summary

The Uptime Watcher application demonstrates a well-architected data flow system with:

1. **Clear Separation of Concerns** → Frontend/Backend/Database layers
2. **Type-Safe Communication** → IPC with TypeScript interfaces
3. **Real-Time Updates** → Event-driven architecture with optimized updates
4. **Error Resilience** → Centralized error handling with graceful degradation
5. **Performance Optimization** → Intelligent caching and incremental updates
6. **Data Integrity** → Transactional operations with validation
7. **Security** → Context isolation and input validation
8. **Scalability** → Modular architecture supporting feature growth

This architecture supports the application's core mission of reliable website monitoring while maintaining excellent developer experience and user performance.
