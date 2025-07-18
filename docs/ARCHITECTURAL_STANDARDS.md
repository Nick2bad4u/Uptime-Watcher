# Architectural Standards - Uptime Watcher

## Overview

This document defines the clear architectural patterns and responsibilities for the Uptime Watcher codebase to resolve the layer confusion identified in the consistency audit.

## Architectural Layers

### **Repository Layer** (Data Access)
**Responsibility**: Direct database access and CRUD operations
- **Location**: `electron/services/database/*Repository.ts`
- **Naming**: `*Repository` (e.g., `SiteRepository`, `MonitorRepository`)
- **Responsibilities**:
  - Raw database queries and data persistence
  - Transaction-aware internal methods (`*Internal`)
  - No business logic or coordination
  - No external dependencies except DatabaseService

**Example**: `SiteRepository.findByIdentifier()`, `MonitorRepository.create()`

### **Service Layer** (Business Logic)
**Responsibility**: Focused business logic for specific domains
- **Location**: `electron/services/*` (connection services), `src/services/*` (UI services)
- **Naming**: `*Service` (e.g., `DatabaseService`, `NotificationService`, `ThemeManager`)
- **Responsibilities**:
  - Specific business logic (connections, notifications, themes)
  - Service coordination within a single domain
  - No cross-domain coordination

**Example**: `DatabaseService` (connections/transactions), `ThemeManager` (theme logic)

### **Manager Layer** (Coordination)
**Responsibility**: Cross-domain business logic coordination
- **Location**: `electron/managers/*Manager.ts`
- **Naming**: `*Manager` (e.g., `SiteManager`, `MonitorManager`)
- **Responsibilities**:
  - Coordinate between repositories and services
  - Complex business workflows
  - Cache management and event coordination
  - Cross-domain logic (sites + monitors + database)

**Example**: `SiteManager.addSite()` coordinates site creation, monitor setup, and caching

### **Orchestrator Layer** (Application Coordination)
**Responsibility**: Top-level application coordination and side effects
- **Location**: `electron/*Orchestrator.ts`
- **Naming**: `*Orchestrator` (only `UptimeOrchestrator`)
- **Responsibilities**:
  - Application-wide coordination
  - Manager coordination and event routing
  - External system integration
  - Main application lifecycle

**Example**: `UptimeOrchestrator` coordinates all managers and handles IPC

## Eliminated Patterns

### ❌ **Removed: Adapter Layer**
- **Reason**: Added unnecessary indirection without value
- **Migration**: Direct repository usage or service abstraction

### ❌ **Removed: Thin Wrapper Orchestrators**
- **Reason**: No added value over direct service usage
- **Examples**: `SiteWritingOrchestrator`, `DataBackupOrchestrator`
- **Migration**: Use services directly or integrate into managers

### ❌ **Removed: Service/Manager Duplication**
- **Reason**: Unclear responsibility boundaries
- **Examples**: `DatabaseManager` + `DatabaseService`, `SiteManager` + `SiteWriterService`
- **Migration**: Consolidate into single layer based on complexity

## Decision Matrix

| Use Case | Recommended Layer | Rationale |
|----------|------------------|-----------|
| Database connections, transactions | Service | Focused technical responsibility |
| Simple domain logic (themes, notifications) | Service | Single-domain, focused logic |
| Cross-domain coordination (site + monitor management) | Manager | Requires coordination between multiple repositories |
| Application-wide coordination | Orchestrator | Top-level responsibility |
| Direct data access | Repository | Clear data access boundary |

## Naming Conventions

- **Repositories**: `*Repository` - Data access only
- **Services**: `*Service` or specific names like `ThemeManager` - Business logic
- **Managers**: `*Manager` - Coordination and complex workflows
- **Orchestrators**: `*Orchestrator` - Application coordination (limited use)

## Implementation Guidelines

### Repository Guidelines
```typescript
// ✅ Good: Focused data access
class SiteRepository {
    async findByIdentifier(id: string): Promise<Site | undefined> {
        // Direct database access
    }
    
    // Internal methods for transactions
    createInternal(db: Database, site: Site): void {
        // Transaction-aware creation
    }
}
```

### Service Guidelines
```typescript
// ✅ Good: Focused business logic
class DatabaseService {
    executeTransaction<T>(operation: (db: Database) => Promise<T>): Promise<T> {
        // Transaction management
    }
    
    async downloadBackup(): Promise<Buffer> {
        // Database backup logic
    }
}
```

### Manager Guidelines
```typescript
// ✅ Good: Cross-domain coordination
class SiteManager {
    async addSite(site: Site): Promise<Site> {
        // 1. Validate site data
        // 2. Persist via repository
        // 3. Update cache
        // 4. Setup monitoring
        // 5. Emit events
    }
}
```

### Anti-Patterns

```typescript
// ❌ Bad: Thin wrapper orchestrator
class SiteWritingOrchestrator {
    async createSite(site: Site): Promise<Site> {
        return this.siteWriterService.createSite(site); // Just delegates
    }
}

// ❌ Bad: Manager/Service duplication
class DatabaseManager {
    async exportData(): Promise<string> { /* business logic */ }
}
class DatabaseService {
    async exportData(): Promise<string> { /* same logic */ }
}
```

## Migration Plan

1. **Remove thin wrapper orchestrators** - Use services directly
2. **Consolidate duplicated functionality** - Choose Manager or Service based on complexity
3. **Clarify responsibilities** - Ensure each class has single, clear purpose
4. **Update imports and dependencies** - Reflect new architecture
5. **Update tests** - Ensure test structure matches new architecture

## Benefits

- **Clear Separation of Concerns**: Each layer has distinct responsibilities
- **Reduced Duplication**: No overlapping functionality between layers
- **Easier Testing**: Clear boundaries make mocking and testing simpler
- **Better Maintainability**: Developers know where to find and add functionality
- **Consistent Patterns**: Predictable structure across the codebase
