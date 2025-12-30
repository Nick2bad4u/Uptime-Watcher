/**
 * Debug SiteManager mocking to verify our setup works correctly
 */

import { describe, expect, it, vi } from "vitest";
import { SiteManager } from "../../managers/SiteManager";

// Mock logger first
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
    diagnosticsLogger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
}));

// First add the same mocks as the main test
// First add the same mocks as the main test
function createConstructableMock<T extends object>(
    instance: T,
    name: string
): new () => T {
    function Constructable(this: unknown): T {
        return instance;
    }

    Object.defineProperty(Constructable, "name", { value: name });

    return Constructable as unknown as new () => T;
}

const cacheMocks = vi.hoisted(() => {
    const mockCache = {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
        has: vi.fn(),
        clear: vi.fn(),
        keys: vi.fn().mockReturnValue([] as string[]),
        getAll: vi.fn().mockReturnValue([] as unknown[]),
        entries: vi.fn().mockReturnValue(new Map().entries()),
        bulkUpdate: vi.fn(),
        cleanup: vi.fn(),
        invalidate: vi.fn(),
        invalidateAll: vi.fn(),
        getStats: vi
            .fn()
            .mockReturnValue({ hits: 0, misses: 0, hitRatio: 0, size: 0 }),
        onInvalidation: vi.fn().mockReturnValue(() => {}),
    };

    const MockStandardizedCache = createConstructableMock(
        mockCache,
        "MockStandardizedCache"
    );

    return { mockCache, MockStandardizedCache };
});

vi.mock("../../utils/cache/StandardizedCache", () => ({
    StandardizedCache: cacheMocks.MockStandardizedCache,
}));

const repositoryMocks = vi.hoisted(() => {
    const mockSiteRepositoryServiceInstance = {
        getSitesFromDatabase: vi.fn().mockResolvedValue([] as unknown[]),
    };

    const mockLoggerAdapterInstance = {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    };

    return {
        MockLoggerAdapter: createConstructableMock(
            mockLoggerAdapterInstance,
            "MockLoggerAdapter"
        ),
        MockSiteRepositoryService: createConstructableMock(
            mockSiteRepositoryServiceInstance,
            "MockSiteRepositoryService"
        ),
        mockLoggerAdapterInstance,
        mockSiteRepositoryServiceInstance,
    };
});

vi.mock("../../services/database/serviceFactory", () => ({
    LoggerAdapter: repositoryMocks.MockLoggerAdapter,
}));

vi.mock("../../services/database/SiteRepositoryService", () => ({
    SiteRepositoryService: repositoryMocks.MockSiteRepositoryService,
}));

const siteWriterMocks = vi.hoisted(() => {
    const mockSiteWriterServiceInstance = {
        createSite: vi.fn(),
        updateSite: vi.fn(),
        deleteSite: vi.fn(),
        handleMonitorIntervalChanges: vi.fn(),
        detectNewMonitors: vi.fn().mockReturnValue([] as unknown[]),
    };

    return {
        MockSiteWriterService: createConstructableMock(
            mockSiteWriterServiceInstance,
            "MockSiteWriterService"
        ),
        mockSiteWriterServiceInstance,
    };
});

vi.mock("../../services/database/SiteWriterService", () => ({
    SiteWriterService: siteWriterMocks.MockSiteWriterService,
}));

// Test if our mocks are working correctly
describe("SiteManager Mock Debug", () => {
    it("should create SiteManager with working mocks", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: SiteManager", "component");
        await annotate("Category: Manager", "category");
        await annotate("Type: Constructor", "type");

        const mockConfigurationManager = {
            validateSiteConfiguration: vi
                .fn()
                .mockResolvedValue({ success: true, errors: [] }),
            configCache: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
            monitorValidator: vi.fn(),
            siteValidator: vi.fn(),
            validationCache: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
            validateMonitorConfiguration: vi.fn(),
            validateSettingsConfiguration: vi.fn(),
            getSiteValidationSchema: vi.fn(),
            getMonitorValidationSchema: vi.fn(),
            getSettingsValidationSchema: vi.fn(),
            getConfigErrors: vi.fn(),
            getConfigWarnings: vi.fn(),
            getConfigInfo: vi.fn(),
            getConfigSummary: vi.fn(),
            getConfigType: vi.fn(),
            getConfigDefaults: vi.fn(),
            getConfigExample: vi.fn(),
            getConfigDocs: vi.fn(),
            getConfigVersion: vi.fn(),
            getConfigHistory: vi.fn(),
            // Add missing required properties
            clearValidationCache: vi.fn(),
            getCacheStats: vi
                .fn()
                .mockReturnValue({ hits: 0, misses: 0, hitRatio: 0, size: 0 }),
            getDefaultMonitorInterval: vi.fn().mockReturnValue(60),
            getHistoryRetentionRules: vi.fn().mockReturnValue([]),
            getMonitorTypeInfo: vi.fn().mockReturnValue({}),
            getSiteTypeInfo: vi.fn().mockReturnValue({}),
            getSettingsTypeInfo: vi.fn().mockReturnValue({}),
            getValidationSchemaVersion: vi.fn().mockReturnValue("1.0.0"),
            getValidationSchemaDocs: vi.fn().mockReturnValue(""),
            getValidationSchemaExample: vi.fn().mockReturnValue({}),
            // Required by SiteManagerDependencies
            getMaximumPortNumber: vi.fn().mockReturnValue(65_535),
            getMinimumCheckInterval: vi.fn().mockReturnValue(10),
            getMinimumTimeout: vi.fn().mockReturnValue(1),
            shouldApplyDefaultInterval: vi.fn().mockReturnValue(true),
            shouldApplyDefaultTimeout: vi.fn().mockReturnValue(true),
            shouldApplyDefaultRetention: vi.fn().mockReturnValue(true),
            // Add missing required properties for SiteManagerDependencies
            shouldAutoStartMonitoring: vi.fn().mockReturnValue(false),
            shouldIncludeInExport: vi.fn().mockReturnValue(true),
        };

        const mockDeps = {
            configurationManager: mockConfigurationManager,
            databaseService: {
                executeTransaction: vi
                    .fn()
                    .mockImplementation(async (fn) => fn()),
            },
            eventEmitter: {
                emitTyped: vi.fn().mockResolvedValue(undefined),
            },
            historyRepository: {
                findBySiteIdentifier: vi.fn(),
                create: vi.fn(),
                deleteAll: vi.fn(),
            },
            monitorRepository: {
                findBySiteIdentifier: vi.fn(),
                create: vi.fn(),
                delete: vi.fn().mockResolvedValue(true),
                bulkCreate: vi.fn(),
                deleteBySiteIdentifier: vi.fn(),
            },
            settingsRepository: {
                get: vi.fn(),
                set: vi.fn(),
            },
            siteRepository: {
                findAll: vi.fn(),
                findByIdentifier: vi.fn(),
                upsert: vi.fn(),
                delete: vi.fn(),
                exists: vi.fn(),
            },
        };

        // Create SiteManager and test its internals
        // @ts-expect-error -- mocking private
        const siteManager = new SiteManager(mockDeps);

        // Test that the cache is properly mocked
        const cache = siteManager["sitesCache"];
        const writer = siteManager["siteWriterService"];
        const repo = siteManager["siteRepositoryService"];

        // Force output by throwing an error with the details we need
        const debugInfo = {
            cache: {
                constructor: cache?.constructor?.name,
                hasGet: Boolean(cache?.get),
                methods: Object.getOwnPropertyNames(cache || {}),
                isGetMocked: cache?.get ? vi.isMockFunction(cache.get) : false,
            },
            writer: {
                constructor: writer?.constructor?.name,
                hasCreateSite: Boolean(writer?.createSite),
                methods: Object.getOwnPropertyNames(writer || {}),
                isCreateSiteMocked: writer?.createSite
                    ? vi.isMockFunction(writer.createSite)
                    : false,
            },
            repo: {
                constructor: repo?.constructor?.name,
                hasGetSites: Boolean(repo?.getSitesFromDatabase),
                methods: Object.getOwnPropertyNames(repo || {}),
                isGetSitesMocked: repo?.getSitesFromDatabase
                    ? vi.isMockFunction(repo.getSitesFromDatabase)
                    : false,
            },
        };

        // Verify that mocking is working correctly
        expect(debugInfo.cache.isGetMocked).toBeTruthy();
        expect(debugInfo.repo.isGetSitesMocked).toBeTruthy();
        expect(debugInfo.writer.isCreateSiteMocked).toBeTruthy();
    });
});
