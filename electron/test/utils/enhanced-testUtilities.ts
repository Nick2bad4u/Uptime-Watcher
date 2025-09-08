/**
 * Enhanced test utilities and factory functions for comprehensive test
 * coverage. Provides robust mocking utilities based on modern Vitest patterns.
 */

import { vi } from "vitest";
import type { Site, Monitor } from "../../../shared/types.js";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { UptimeEvents } from "../../events/eventTypes";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

/**
 * Creates a properly typed and mocked StandardizedCache instance
 */
export function createMockStandardizedCache<T>(): Partial<
    StandardizedCache<T>
> {
    const cache = new Map<string, T>();

    return {
        // Cache operations
        get: vi.fn((key: string) => cache.get(key)),
        set: vi.fn((key: string, value: T, _ttl?: number) => {
            cache.set(key, value);
        }),
        has: vi.fn((key: string) => cache.has(key)),
        delete: vi.fn((key: string) => cache.delete(key)),
        clear: vi.fn(() => cache.clear()),
        size: cache.size,
        keys: vi.fn(() => [...cache.keys()]),
        entries: vi.fn(() => [...cache.entries()][Symbol.iterator]()),

        // Statistics
        getStats: vi.fn(() => ({
            hits: 0,
            misses: 0,
            size: cache.size,
            hitRatio: 0,
        })),

        // Bulk operations
        getAll: vi.fn(() => [...cache.values()]),
        bulkUpdate: vi.fn(),
        cleanup: vi.fn(() => 0),
        invalidate: vi.fn(),
        invalidateAll: vi.fn(),
        onInvalidation: vi.fn(() => () => {}),
    };
}

/**
 * Creates a properly mocked TypedEventBus instance
 */
export function createMockEventBus(): Partial<TypedEventBus<UptimeEvents>> {
    return {
        emitTyped: vi.fn().mockResolvedValue(undefined),
        onTyped: vi.fn(),
        offTyped: vi.fn(),
        onceTyped: vi.fn(),
        removeAllListeners: vi.fn(),
        getDiagnostics: vi.fn(() => ({
            busId: "test-bus",
            listenerCounts: {},
            maxListeners: 10,
            maxMiddleware: 5,
            middlewareCount: 0,
            middlewareUtilization: 0,
        })),
        clearMiddleware: vi.fn(),
        listenerCount: vi.fn(() => 0),
        eventNames: vi.fn(() => []),
        getMaxListeners: vi.fn(() => 10),
        setMaxListeners: vi.fn(),
        prependListener: vi.fn(),
        prependOnceListener: vi.fn(),
        emit: vi.fn(() => true),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn(),
    };
}

/**
 * Creates test site data with realistic structure
 */
export function createTestSite(
    identifier: string,
    overrides: Partial<Site> = {}
): Site {
    return {
        identifier,
        name: `Test Site ${identifier}`,
        monitoring: true,
        monitors: [],
        ...overrides,
    };
}

/**
 * Creates test monitor data with realistic structure
 */
export function createTestMonitor(
    id: string,
    overrides: Partial<Monitor> = {}
): Monitor {
    return {
        id,
        type: "http",
        monitoring: true,
        status: "pending",
        checkInterval: 300,
        timeout: 30,
        retryAttempts: 3,
        responseTime: 0,
        history: [],
        activeOperations: [],
        url: `https://example-${id}.com`,
        ...overrides,
    };
}

/**
 * Creates a comprehensive mock for a database repository
 */
export function createMockRepository(): any {
    return {
        // Standard CRUD operations
        getAll: vi.fn().mockResolvedValue([]),
        getByIdentifier: vi.fn().mockResolvedValue(undefined),
        add: vi.fn().mockResolvedValue(true),
        update: vi.fn().mockResolvedValue(true),
        delete: vi.fn().mockResolvedValue(true),

        // Specialized operations (may not exist on all repositories)
        findAll: vi.fn().mockResolvedValue([]),
        findByIdentifier: vi.fn().mockResolvedValue(undefined),
        findBySiteIdentifier: vi.fn().mockResolvedValue([]),
        findByKey: vi.fn().mockResolvedValue(undefined),

        // Bulk operations
        bulkInsert: vi.fn().mockResolvedValue(undefined),
        deleteAll: vi.fn().mockResolvedValue(undefined),
        exportAll: vi.fn().mockResolvedValue([]),

        // Settings-specific operations
        get: vi.fn().mockResolvedValue("500"),
        set: vi.fn().mockResolvedValue(true),
        getInternal: vi.fn().mockResolvedValue("500"),
        setInternal: vi.fn().mockResolvedValue(true),
        upsert: vi.fn().mockResolvedValue(undefined),

        // History-specific operations
        deleteAllHistory: vi.fn().mockResolvedValue(undefined),
        pruneAllHistoryInternal: vi.fn().mockResolvedValue(undefined),

        // Monitor-specific operations
        getAllMonitorIds: vi.fn().mockResolvedValue([]),
    };
}

/**
 * Creates a comprehensive mock for all database repositories
 */
export function createMockRepositories(): any {
    return {
        database: {
            close: vi.fn().mockResolvedValue(undefined),
            execute: vi.fn().mockResolvedValue(undefined),
            query: vi.fn().mockResolvedValue([]),
            executeTransaction: vi
                .fn()
                .mockImplementation((operation) => operation({})),
            getDatabase: vi.fn().mockReturnValue({}),
            initialize: vi.fn().mockResolvedValue(undefined),
        },
        history: createMockRepository(),
        monitor: createMockRepository(),
        settings: createMockRepository(),
        site: createMockRepository(),
    };
}

/**
 * Creates a comprehensive mock configuration manager
 */
export function createMockConfigurationManager(): any {
    return {
        getMonitoringConfiguration: vi.fn().mockReturnValue({
            setHistoryLimit: vi.fn(),
            setupNewMonitors: vi.fn(),
            startMonitoring: vi.fn(),
            stopMonitoring: vi.fn(),
        }),
        getHistoryRetentionRules: vi.fn().mockReturnValue({
            defaultLimit: 500,
            maxLimit: Number.MAX_SAFE_INTEGER,
            minLimit: 25,
        }),
        configCache: new Map(),
        monitorValidator: {},
        siteValidator: {},
        validationCache: new Map(),
        validateMonitor: vi
            .fn()
            .mockResolvedValue({ isValid: true, errors: [] }),
        validateSite: vi.fn().mockResolvedValue({ isValid: true, errors: [] }),
        initializeValidators: vi.fn().mockResolvedValue(undefined),
        getValidationRules: vi.fn().mockReturnValue({}),
        refreshConfiguration: vi.fn().mockResolvedValue(undefined),
        clearCache: vi.fn().mockResolvedValue(undefined),
        getConfiguration: vi.fn().mockReturnValue({}),
        setConfiguration: vi.fn().mockResolvedValue(undefined),
        getCacheStats: vi.fn().mockReturnValue({}),
        getFileWatcher: vi.fn().mockReturnValue({}),
        isWatchingEnabled: vi.fn().mockReturnValue(false),
    };
}

/**
 * Creates a mock site loading orchestrator
 */
export function createMockSiteLoadingOrchestrator(): any {
    return {
        loadSitesFromDatabase: vi.fn().mockResolvedValue({
            success: true,
            sites: [],
            errorCount: 0,
            metadata: {
                totalProcessed: 0,
                loadedFromCache: 0,
                loadedFromDatabase: 0,
            },
        }),
    };
}

/**
 * Resets all mocks in an object deeply
 */
export function resetAllMocks(obj: any): void {
    for (const key in obj) {
        if (obj[key] && typeof obj[key] === "object") {
            if (vi.isMockFunction(obj[key])) {
                obj[key].mockReset();
            } else {
                resetAllMocks(obj[key]);
            }
        }
    }
}

/**
 * Creates a properly mocked database command executor that can handle different
 * command types
 */
export function createMockCommandExecutor(): any {
    return {
        execute: vi.fn().mockImplementation(
            async (_command: any) =>
                // Default response for any command
                "mock-result"
        ),
        rollbackAll: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn(),
    };
}

/**
 * Creates a mock service factory with all required services
 */
export function createMockServiceFactory(): any {
    return {
        dependencies: {} as any,
        loggerAdapter: {} as any,
        createBackupService: vi.fn().mockReturnValue({
            downloadDatabaseBackup: vi.fn().mockResolvedValue({
                buffer: Buffer.from("test-backup-data"),
                fileName: "backup-2024.db",
            }),
        }),
        createImportExportService: vi.fn().mockReturnValue({
            exportAllData: vi.fn().mockResolvedValue('{"test": "data"}'),
            importDataFromJson: vi.fn().mockResolvedValue({
                sites: [],
                settings: { theme: "dark" },
            }),
            persistImportedData: vi.fn().mockResolvedValue(undefined),
        }),
        createSiteRepositoryService: vi.fn().mockReturnValue({
            getSitesFromDatabase: vi.fn().mockResolvedValue([]),
        }),
    };
}
