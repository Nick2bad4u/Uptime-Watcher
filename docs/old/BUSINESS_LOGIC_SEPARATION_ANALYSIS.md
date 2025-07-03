# Business/Technical Logic Separation Analysis

## Current Architecture Assessment

The Uptime Watcher project demonstrates a well-architected separation of concerns with the following layers:

### 1. **Manager Layer (Business Logic)**

- **DatabaseManager**: Handles business rules for data management, import/export, and history limits
- **SiteManager**: Manages site lifecycle, cache synchronization, and CRUD operations
- **MonitorManager**: Orchestrates monitoring lifecycle and business rules for monitoring

### 2. **Service Layer (Technical Implementation)**

- **DatabaseService**: Low-level database operations
- **Repositories**: Data access layer with CRUD operations
- **MonitorScheduler**: Technical scheduling implementation
- **HttpMonitor/PortMonitor**: Technical monitoring implementations

### 3. **Utility Layer (Shared Technical Functions)**

- Database utilities: Technical database operations
- Monitoring utilities: Technical monitoring operations
- Logger: Technical logging implementation

### 4. **Orchestrator Layer (Coordination)**

- **UptimeOrchestrator**: Coordinates managers and provides unified API

## Areas for Potential Improvement

### 1. **Manager Callback Dependencies** ⚠️

**Issue**: Managers have complex callback dependencies between each other, creating tight coupling.

**Current State**:

```typescript
// DatabaseManager requires callbacks from other managers
this.databaseManager.setCallbacks({
    getSitesFromCache: () => this.siteManager.getSitesFromCache(),
    updateSitesCache: (sites) => this.siteManager.updateSitesCache(sites),
    startMonitoringForSite: (identifier, monitorId) =>
        this.monitorManager.startMonitoringForSite(identifier, monitorId),
    setHistoryLimit: (limit) => { this.historyLimit = limit; },
});
```

**Recommended Improvement**:
Create a shared event bus or mediator pattern to reduce direct dependencies:

```typescript
// Event-driven approach
class EventBus extends EventEmitter {
    emitSitesCacheUpdate(sites: Site[]): void
    emitStartMonitoring(identifier: string, monitorId?: string): void
    emitHistoryLimitChange(limit: number): void
}
```

### 2. **Business Logic in Utility Functions** ⚠️

**Issue**: Some utility functions contain business logic that should be in managers.

**Examples**:

- `autoStartMonitoring` in utils contains business rules about when to start monitoring
- `setDefaultMonitorIntervals` contains business rules about default intervals
- Site validation logic is spread across utilities

**Recommended Improvement**:
Move business rules to managers:

```typescript
// In MonitorManager
public async setupNewSite(site: Site): Promise<void> {
    // Business logic: when to auto-start monitoring
    if (this.shouldAutoStart(site)) {
        await this.startMonitoringForSite(site.identifier);
    }
    
    // Business logic: default interval rules
    this.applyDefaultIntervals(site);
}

private shouldAutoStart(site: Site): boolean {
    // Business rule logic here
    return site.isActive && !isDev();
}
```

### 3. **Mixed Concerns in Database Utilities** ⚠️

**Issue**: Database utilities mix business validation with technical operations.

**Example** in `siteAdder.ts`:

```typescript
// Business validation mixed with technical operation
if (!siteData?.identifier) {
    throw new Error("Site identifier is required"); // Business rule
}
await repositories.site.upsert(site); // Technical operation
```

**Recommended Improvement**:
Separate validation from persistence:

```typescript
// In SiteManager (business logic)
private validateSite(site: Site): void {
    if (!site?.identifier) {
        throw new Error("Site identifier is required");
    }
    // Other business validations
}

// In utility (technical only)
export async function persistSite(repositories: Repositories, site: Site): Promise<Site> {
    // Pure technical persistence
    await repositories.site.upsert(site);
    return site;
}
```

### 4. **Configuration Logic Scattered** ⚠️

**Issue**: Business configuration logic is scattered across multiple files.

**Examples**:

- Default intervals in constants and scattered in utilities
- Auto-start logic in monitoring utilities
- History limit logic in multiple places

**Recommended Improvement**:
Create a configuration manager:

```typescript
class ConfigurationManager {
    public getDefaultMonitorInterval(): number
    public shouldAutoStartMonitoring(site: Site): boolean
    public getHistoryRetentionRules(): HistoryRetentionConfig
    public validateSiteConfiguration(site: Site): ValidationResult
}
```

## Recommended Refactoring Plan

### Phase 1: Event-Driven Communication

1. Create `EventBus` or use existing `EventEmitter` more systematically
2. Replace callback dependencies with event-driven communication
3. Reduce coupling between managers

### Phase 2: Business Logic Consolidation

1. Move business rules from utilities to managers
2. Create clear validation methods in managers
3. Ensure utilities are purely technical

### Phase 3: Configuration Centralization

1. Create `ConfigurationManager` for business rules
2. Centralize default values and business constants
3. Create policy objects for complex business rules

### Phase 4: Domain Services

1. Consider creating domain services for complex business operations
2. Extract reusable business logic into domain services
3. Keep managers focused on coordination

## Positive Aspects (Already Well Implemented)

### ✅ **Clear Layer Separation**

- Managers handle business logic
- Services handle technical implementation
- Repositories provide clean data access
- Clear separation between database and monitoring concerns

### ✅ **Dependency Injection**

- Managers receive dependencies through constructor injection
- Easy to test and mock
- Good separation of concerns

### ✅ **Event-Driven Architecture**

- Uses EventEmitter for status updates
- Decoupled communication for monitoring events
- Good for real-time updates

### ✅ **Repository Pattern**

- Clean data access layer
- Database operations properly abstracted
- Good for testing and maintenance

### ✅ **Single Responsibility**

- Each manager has a clear responsibility
- Services are focused on specific technical concerns
- Good modular structure

## Conclusion

The current architecture is **already quite good** with proper separation of business and technical logic. The main areas for improvement are:

1. **Reducing inter-manager coupling** through better event-driven communication
2. **Moving scattered business logic** from utilities to managers
3. **Centralizing configuration and business rules**

These improvements would make the codebase more maintainable and testable, but the current structure is already following good architectural principles.

The project demonstrates strong software engineering practices with:

- High test coverage (99.93%)
- Clear separation of concerns
- Proper dependency injection
- Good modular design
- Event-driven architecture where appropriate

The suggested improvements are refinements rather than major architectural changes.
