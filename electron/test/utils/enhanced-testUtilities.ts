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
        get size() {
            return cache.size;
        },
        keys: vi.fn(() => Array.from(cache.keys())),
        entries: vi.fn(() => Array.from(cache.entries())[Symbol.iterator]()),

        // Statistics
        getStats: vi.fn(() => ({
            hits: 0,
            misses: 0,
            size: cache.size,
            hitRatio: 0,
        })),

        // Bulk operations
        getAll: vi.fn(() => Array.from(cache.values())),
        bulkUpdate: vi.fn(),
        replaceAll: vi.fn((items: { key: string; data: T }[]) => {
            cache.clear();
            for (const { key, data } of items) {
                cache.set(key, data);
            }
        }),
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
    const repository: Record<string, any> = {
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
        bulkInsertInternal: vi.fn(),
        deleteAllInternal: vi.fn(),
        deleteInternal: vi.fn(),
        deleteBySiteIdentifierInternal: vi.fn(),
        createInternal: vi.fn(),
        updateInternal: vi.fn(),
        clearActiveOperationsInternal: vi.fn(),

        // Settings-specific operations
        get: vi.fn().mockResolvedValue("500"),
        set: vi.fn().mockResolvedValue(true),
        getInternal: vi.fn().mockResolvedValue("500"),
        setInternal: vi.fn().mockResolvedValue(true),
        upsert: vi.fn().mockResolvedValue(undefined),

        // History-specific operations
        addEntryInternal: vi.fn(),
        deleteAllHistory: vi.fn().mockResolvedValue(undefined),
        deleteByMonitorIdInternal: vi.fn(),
        getHistoryCountInternal: vi.fn(),
        pruneAllHistoryInternal: vi.fn().mockResolvedValue(undefined),

        // Monitor-specific operations
        getAllMonitorIds: vi.fn().mockResolvedValue([]),
    };

    repository["createTransactionAdapter"] = vi
        .fn()
        .mockImplementation((db: unknown) => {
            const adapter: Record<string, any> = {};

            if (repository["bulkInsertInternal"].mock) {
                adapter["bulkInsert"] = vi.fn((payload: unknown) =>
                    repository["bulkInsertInternal"](db, payload)
                );
            }

            if (repository["deleteAllInternal"].mock) {
                adapter["deleteAll"] = vi.fn(() =>
                    repository["deleteAllInternal"](db)
                );
            }

            if (repository["deleteInternal"].mock) {
                adapter["delete"] = vi.fn((identifier: unknown) =>
                    repository["deleteInternal"](db, identifier)
                );
                adapter["deleteByKey"] = vi.fn((key: unknown) =>
                    repository["deleteInternal"](db, key)
                );
                adapter["deleteById"] = vi.fn((identifier: unknown) =>
                    repository["deleteInternal"](db, identifier)
                );
            }

            if (repository["deleteBySiteIdentifierInternal"].mock) {
                adapter["deleteBySiteIdentifier"] = vi.fn(
                    (siteIdentifier: unknown) =>
                        repository["deleteBySiteIdentifierInternal"](
                            db,
                            siteIdentifier
                        )
                );
            }

            if (repository["createInternal"].mock) {
                adapter["create"] = vi.fn((...args: unknown[]) =>
                    repository["createInternal"](db, ...args)
                );
            }

            if (repository["updateInternal"].mock) {
                adapter["update"] = vi.fn((...args: unknown[]) =>
                    repository["updateInternal"](db, ...args)
                );
            }

            if (repository["clearActiveOperationsInternal"].mock) {
                adapter["clearActiveOperations"] = vi.fn((monitorId: unknown) =>
                    repository["clearActiveOperationsInternal"](db, monitorId)
                );
            }

            if (repository["addEntryInternal"].mock) {
                adapter["addEntry"] = vi.fn(
                    (monitorId: unknown, entry: unknown, details?: unknown) =>
                        repository["addEntryInternal"](
                            db,
                            monitorId,
                            entry,
                            details
                        )
                );
            }

            if (repository["deleteByMonitorIdInternal"].mock) {
                adapter["deleteByMonitorId"] = vi.fn((monitorId: unknown) =>
                    repository["deleteByMonitorIdInternal"](db, monitorId)
                );
            }

            if (repository["getHistoryCountInternal"].mock) {
                adapter["getHistoryCount"] = vi.fn((monitorId: unknown) =>
                    repository["getHistoryCountInternal"](db, monitorId)
                );
            }

            if (repository["pruneAllHistoryInternal"].mock) {
                adapter["pruneAllHistory"] = vi.fn((limit: unknown) =>
                    repository["pruneAllHistoryInternal"](db, limit)
                );
            }

            if (repository["setInternal"].mock) {
                adapter["set"] = vi.fn((key: unknown, value: unknown) =>
                    repository["setInternal"](db, key, value)
                );
            }

            return adapter;
        });

    return repository;
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
