/**
 * Debug SiteManager mocking to verify our setup works correctly
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteManager } from "../../managers/SiteManager";

// Mock logger first
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
}));

// First add the same mocks as the main test
const mockCache = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    clear: vi.fn(),
    size: 0,
    keys: vi.fn().mockReturnValue([]),
    getAll: vi.fn().mockReturnValue([]),
    entries: vi.fn().mockReturnValue(new Map().entries()),
    bulkUpdate: vi.fn(),
    cleanup: vi.fn(),
    invalidate: vi.fn(),
    invalidateAll: vi.fn(),
    getStats: vi.fn().mockReturnValue({ hits: 0, misses: 0, hitRatio: 0, size: 0 }),
    onInvalidation: vi.fn().mockReturnValue(() => {}),
};

vi.mock("../../utils/cache/StandardizedCache", () => {
    return {
        StandardizedCache: vi.fn(() => mockCache),
    };
});

const mockSiteRepositoryServiceInstance = {
    getSitesFromDatabase: vi.fn().mockResolvedValue([]),
};

const mockLoggerAdapterInstance = {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
};

vi.mock("../../utils/database/serviceFactory", () => ({
    LoggerAdapter: vi.fn(() => mockLoggerAdapterInstance),
}));

vi.mock("../../utils/database/SiteRepositoryService", () => ({
    SiteRepositoryService: vi.fn(() => mockSiteRepositoryServiceInstance),
}));

const mockSiteWriterServiceInstance = {
    createSite: vi.fn(),
    updateSite: vi.fn(),
    deleteSite: vi.fn(),
    handleMonitorIntervalChanges: vi.fn(),
    detectNewMonitors: vi.fn().mockReturnValue([]),
};

vi.mock("../../utils/database/SiteWriterService", () => {
    return {
        SiteWriterService: vi.fn(() => mockSiteWriterServiceInstance),
    };
});

// Test if our mocks are working correctly
describe("SiteManager Mock Debug", () => {
    it("should create SiteManager with working mocks", () => {
        const mockDeps = {
            configurationManager: {
                validateSiteConfiguration: vi.fn().mockResolvedValue({ success: true, errors: [] }),
            },
            databaseService: {
                executeTransaction: vi.fn().mockImplementation(async (fn) => fn()),
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
        const siteManager = new SiteManager(mockDeps);
        
        // Test that the cache is properly mocked
        const cache = siteManager["sitesCache"];
        const writer = siteManager["siteWriterService"];
        const repo = siteManager["siteRepositoryService"];
        
        // Force output by throwing an error with the details we need
        const debugInfo = {
            cache: {
                constructor: cache?.constructor?.name,
                hasGet: !!cache?.get,
                methods: Object.getOwnPropertyNames(cache || {}),
                isGetMocked: cache?.get ? vi.isMockFunction(cache.get) : false,
            },
            writer: {
                constructor: writer?.constructor?.name,
                hasCreateSite: !!writer?.createSite,
                methods: Object.getOwnPropertyNames(writer || {}),
                isCreateSiteMocked: writer?.createSite ? vi.isMockFunction(writer.createSite) : false,
            },
            repo: {
                constructor: repo?.constructor?.name,
                hasGetSites: !!repo?.getSitesFromDatabase,
                methods: Object.getOwnPropertyNames(repo || {}),
                isGetSitesMocked: repo?.getSitesFromDatabase ? vi.isMockFunction(repo.getSitesFromDatabase) : false,
            }
        };
        
        // Expect something that will fail to show the debug info
        expect(debugInfo).toEqual({ mockingWorking: true });
    });
});
