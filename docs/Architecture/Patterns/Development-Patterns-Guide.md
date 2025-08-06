# Development Patterns Guide

This guide documents the established architectural patterns used throughout the Uptime-Watcher application. Following these patterns ensures consistency, maintainability, and predictable behavior across the codebase.

## Table of Contents

1. [Repository Pattern](#repository-pattern)
2. [Event-Driven Communication](#event-driven-communication)
3. [Error Handling Patterns](#error-handling-patterns)
4. [Frontend State Management](#frontend-state-management)
5. [IPC Communication](#ipc-communication)
6. [Testing Patterns](#testing-patterns)

## Repository Pattern

### Overview
All database access uses the Repository Pattern with consistent transaction handling and dual-method structure.

### Key Characteristics
- **Dual methods**: Public async methods create transactions, internal sync methods work within existing transactions
- **Transaction safety**: All mutations wrapped in `executeTransaction()`
- **Operational hooks**: Use `withDatabaseOperation()` for retry logic and event emission
- **Dependency injection**: Constructor-based dependency injection

### Implementation Template
```typescript
export interface ExampleRepositoryDependencies {
    databaseService: DatabaseService;
}

const EXAMPLE_QUERIES = {
    SELECT_ALL: "SELECT * FROM example_table",
    INSERT: "INSERT INTO example_table (field) VALUES (?)",
    DELETE_ALL: "DELETE FROM example_table",
} as const;

export class ExampleRepository {
    private readonly databaseService: DatabaseService;
    
    constructor(dependencies: ExampleRepositoryDependencies) {
        this.databaseService = dependencies.databaseService;
    }
    
    // Public async method with transaction
    public async create(data: ExampleData): Promise<Example> {
        return withDatabaseOperation(async () => {
            return this.databaseService.executeTransaction((db) => {
                this.createInternal(db, data);
                return Promise.resolve(createdExample);
            });
        }, "ExampleRepository.create");
    }
    
    // Internal sync method for transaction contexts
    public createInternal(db: Database, data: ExampleData): void {
        db.run(EXAMPLE_QUERIES.INSERT, [data.field]);
        logger.debug("[ExampleRepository] Example created (internal)");
    }
    
    // Read operations (no transaction needed)
    public async findAll(): Promise<Example[]> {
        const db = this.getDb();
        return db.all(EXAMPLE_QUERIES.SELECT_ALL);
    }
    
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }
}
```

### Usage Guidelines
- ✅ Use dual methods for operations that might be called within transactions
- ✅ Wrap all mutations in `withDatabaseOperation()`
- ✅ Include descriptive operation names for debugging
- ✅ Use query constants to prevent SQL duplication
- ❌ Don't bypass the repository pattern for direct database access
- ❌ Don't create transactions within internal methods

## Event-Driven Communication

### Overview
The application uses a TypedEventBus for decoupled communication between components with compile-time type safety.

### Event Naming Convention
- **Format**: `domain:action` (e.g., `sites:added`, `monitor:status-changed`)
- **Domain**: Major category (sites, monitors, database, system)
- **Action**: Specific action in past tense for completed events
- **Consistency**: Use kebab-case for multi-word actions

### Implementation Template
```typescript
// 1. Define event interfaces
interface DomainEvents extends Record<string, unknown> {
    'domain:action-completed': {
        entityId: string;
        timestamp: number;
        // ... other event-specific data
    };
    'domain:action-failed': {
        entityId: string;
        error: string;
        timestamp: number;
    };
}

// 2. Emit events in services
export class ExampleService {
    constructor(private eventBus: TypedEventBus<UptimeEvents>) {}
    
    async performAction(id: string): Promise<void> {
        try {
            // Perform operation
            const result = await this.doSomething(id);
            
            // Emit success event
            await this.eventBus.emitTyped('domain:action-completed', {
                entityId: id,
                result,
                timestamp: Date.now(),
            });
        } catch (error) {
            // Emit failure event
            await this.eventBus.emitTyped('domain:action-failed', {
                entityId: id,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now(),
            });
            throw error;
        }
    }
}

// 3. Listen to events
eventBus.onTyped('domain:action-completed', (data) => {
    // data is properly typed and includes _meta
    console.log(`Action completed for ${data.entityId} at ${data.timestamp}`);
    console.log(`Correlation ID: ${data._meta.correlationId}`);
});
```

### Usage Guidelines
- ✅ Use typed events with proper interfaces
- ✅ Include timestamps in all events
- ✅ Emit both success and failure events for operations
- ✅ Use correlation IDs for request tracing
- ❌ Don't emit events for every minor operation
- ❌ Don't include sensitive data in event payloads

## Error Handling Patterns

### Overview
Multi-layered error handling ensures system stability and provides consistent error reporting across all application layers.

### Shared Error Handling Utilities

#### Frontend with Store Integration
```typescript
// For operations that need store state management
const handleUserAction = async () => {
    await withErrorHandling(async () => {
        const result = await window.electronAPI.sites.addSite(siteData);
        // Handle success
        return result;
    }, errorStore); // Automatically manages loading/error state
};
```

#### Backend with Logger Integration
```typescript
// For backend operations that need logging
const performBackendOperation = async () => {
    return withErrorHandling(async () => {
        const result = await this.repository.performOperation();
        return result;
    }, { logger, operationName: "performOperation" });
};
```

#### Database Operations
```typescript
// For database operations (includes retry logic)
public async databaseOperation(): Promise<Result> {
    return withDatabaseOperation(async () => {
        return this.databaseService.executeTransaction((db) => {
            // Database operations
            return result;
        });
    }, "Service.databaseOperation");
}
```

#### Utility Functions
```typescript
// For utility functions with fallback values
export async function utilityFunction(): Promise<string> {
    return withUtilityErrorHandling(async () => {
        // Perform operation
        return result;
    }, "utilityFunction", "fallback-value");
}
```

### Error Preservation Pattern
```typescript
// ✅ Good - preserves original error
try {
    return await operation();
} catch (error) {
    logger.error("Operation failed", error);
    // Emit failure event
    await eventBus.emitTyped('operation:failed', { 
        error: error instanceof Error ? error.message : String(error) 
    });
    throw error; // Re-throw original
}

// ❌ Bad - loses error context
try {
    return await operation();
} catch (error) {
    throw new Error("Operation failed"); // Original error lost
}
```

### Usage Guidelines
- ✅ Always re-throw errors after handling (logging/state management)
- ✅ Use appropriate error handling utility for the context
- ✅ Include correlation IDs for request tracing
- ✅ Emit failure events for monitoring
- ❌ Don't swallow errors without proper handling
- ❌ Don't lose original error context and stack traces

## Frontend State Management

### Overview
Zustand-based state management with modular composition for complex stores and type safety throughout.

### Simple Store Pattern
```typescript
interface SimpleStore {
    // State
    value: string;
    isLoading: boolean;
    
    // Actions
    setValue: (value: string) => void;
    setLoading: (loading: boolean) => void;
    performAsyncAction: () => Promise<void>;
}

export const useSimpleStore = create<SimpleStore>()((set, get) => ({
    // Initial state
    value: "",
    isLoading: false,
    
    // Actions
    setValue: (value: string) => {
        logStoreAction("SimpleStore", "setValue", { value });
        set({ value });
    },
    
    setLoading: (isLoading: boolean) => {
        logStoreAction("SimpleStore", "setLoading", { isLoading });
        set({ isLoading });
    },
    
    performAsyncAction: async () => {
        await withErrorHandling(async () => {
            get().setLoading(true);
            // Perform async operation
            const result = await window.electronAPI.someOperation();
            get().setValue(result);
        }, errorStore);
        get().setLoading(false);
    },
}));
```

### Complex Store with Modules
```typescript
// 1. Define module interfaces
interface StateModule {
    sites: Site[];
    selectedSiteId?: string;
    setSites: (sites: Site[]) => void;
    setSelectedSite: (site: Site | undefined) => void;
}

interface OperationsModule {
    createSite: (data: SiteCreationData) => Promise<Site>;
    deleteSite: (id: string) => Promise<void>;
}

// 2. Create module implementations
export function createStateModule(set: SetFunction, get: GetFunction): StateModule {
    return {
        sites: [],
        selectedSiteId: undefined,
        
        setSites: (sites: Site[]) => {
            logStoreAction("SitesStore", "setSites", { count: sites.length });
            set({ sites });
        },
        
        setSelectedSite: (site: Site | undefined) => {
            logStoreAction("SitesStore", "setSelectedSite", { siteId: site?.identifier });
            set({ selectedSiteId: site?.identifier });
        },
    };
}

// 3. Compose in main store
export interface SitesStore extends StateModule, OperationsModule {}

export const useSitesStore = create<SitesStore>()((set, get) => {
    const stateModule = createStateModule(set, get);
    const operationsModule = createOperationsModule(set, get);
    
    return {
        ...stateModule,
        ...operationsModule,
    };
});
```

### Persistence Pattern
```typescript
export const useUIStore = create<UIStore>()(
    persist(
        (set) => ({
            // Store implementation
        }),
        {
            name: "uptime-watcher-ui",
            partialize: (state) => ({
                // Only persist user preferences
                theme: state.theme,
                showAdvancedMetrics: state.showAdvancedMetrics,
                // Exclude transient state
                // showModal: false,
                // isLoading: false,
            }),
        }
    )
);
```

### Usage Guidelines
- ✅ Use modular composition for complex stores
- ✅ Include action logging for debugging
- ✅ Integrate with error handling utilities
- ✅ Use selective persistence for user preferences
- ❌ Don't mutate state directly
- ❌ Don't persist transient UI state

## IPC Communication

### Overview
Standardized IPC protocol using contextBridge with type safety, validation, and consistent error handling.

### Handler Registration Pattern
```typescript
// 1. Define validation functions
export function isExampleParams(data: unknown): data is ExampleParams {
    return typeof data === 'object' && 
           data !== null &&
           'field' in data &&
           typeof (data as any).field === 'string';
}

// 2. Register handlers by domain
private registerExampleHandlers(deps: IpcServiceDependencies): void {
    this.registerStandardizedIpcHandler(
        'example:create',
        async (params: ExampleParams) => {
            const result = await deps.exampleManager.create(params);
            return result;
        },
        isExampleParams
    );
    
    this.registerStandardizedIpcHandler(
        'example:get-all',
        async () => {
            const results = await deps.exampleManager.getAll();
            return results;
        }
        // No validation needed for parameterless operations
    );
}
```

### Preload API Pattern
```typescript
// preload.ts
const electronAPI = {
    example: {
        create: (params: ExampleParams): Promise<Example> =>
            ipcRenderer.invoke('example:create', params),
        getAll: (): Promise<Example[]> =>
            ipcRenderer.invoke('example:get-all'),
    },
    events: {
        onExampleEvent: (callback: (data: ExampleEventData) => void) => {
            const wrappedCallback = (_event: any, data: ExampleEventData) => callback(data);
            ipcRenderer.on('example:event', wrappedCallback);
            return () => ipcRenderer.off('example:event', wrappedCallback);
        },
    },
} as const;

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// types.d.ts
declare global {
    interface Window {
        electronAPI: typeof electronAPI;
    }
}
```

### Usage Guidelines
- ✅ Use domain-specific grouping for handlers
- ✅ Include validation for all parameterized operations
- ✅ Return cleanup functions for event listeners
- ✅ Use consistent channel naming (`domain:action`)
- ❌ Don't expose Node.js APIs directly to renderer
- ❌ Don't bypass validation for any parameters

## Testing Patterns

### Store Testing
```typescript
describe("useExampleStore", () => {
    beforeEach(() => {
        // Reset store state
        const store = useExampleStore.getState();
        act(() => {
            store.reset();
        });
        vi.clearAllMocks();
    });

    it("should update state correctly", () => {
        const { result } = renderHook(() => useExampleStore());
        
        act(() => {
            result.current.setValue("test");
        });

        expect(result.current.value).toBe("test");
    });
    
    it("should handle async operations", async () => {
        const { result } = renderHook(() => useExampleStore());
        
        await act(async () => {
            await result.current.performAsyncAction();
        });

        expect(mockElectronAPI.example.getAll).toHaveBeenCalled();
    });
});
```

### Repository Testing
```typescript
describe("ExampleRepository", () => {
    let repository: ExampleRepository;
    let mockDatabaseService: any;
    let mockDatabase: any;

    beforeEach(() => {
        mockDatabase = {
            run: vi.fn().mockReturnValue({ changes: 1 }),
            all: vi.fn().mockReturnValue([]),
            get: vi.fn().mockReturnValue(undefined),
        };

        mockDatabaseService = {
            getDatabase: vi.fn().mockReturnValue(mockDatabase),
            executeTransaction: vi.fn().mockImplementation(async (callback) => {
                return callback(mockDatabase);
            }),
        };

        repository = new ExampleRepository({ databaseService: mockDatabaseService });
    });

    it("should create example successfully", async () => {
        await repository.create(mockData);

        expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
        expect(mockDatabase.run).toHaveBeenCalledWith(
            expect.stringContaining("INSERT"),
            expect.any(Array)
        );
    });
});
```

### Usage Guidelines
- ✅ Reset state in beforeEach for store tests
- ✅ Use act() for state updates in React tests
- ✅ Mock dependencies consistently
- ✅ Test both success and error paths
- ❌ Don't test implementation details
- ❌ Don't share state between test cases

## Best Practices Summary

1. **Consistency**: Follow established patterns rather than creating new ones
2. **Type Safety**: Use TypeScript interfaces for all data structures
3. **Error Handling**: Always preserve original errors and provide appropriate fallbacks
4. **Testing**: Write comprehensive tests following established patterns
5. **Documentation**: Include TSDoc comments with examples
6. **Logging**: Use consistent logging with correlation IDs
7. **Events**: Emit events for significant state changes
8. **Validation**: Validate all external inputs and IPC parameters
