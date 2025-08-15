/**
 * Copy of working simple test with added SiteManager test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create hoisted mock factory for TypedEventBus using constructor pattern
const mockTypedEventBus = vi.hoisted(() => {
    function MockTypedEventBus(name?: string) {
        // Create a mock that has both EventEmitter and TypedEventBus methods
        return {
            // Standard EventEmitter methods
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
            once: vi.fn(),
            removeListener: vi.fn(),
            removeAllListeners: vi.fn(),
            addListener: vi.fn(),
            prependListener: vi.fn(),
            prependOnceListener: vi.fn(),
            listeners: vi.fn().mockReturnValue([]),
            listenerCount: vi.fn().mockReturnValue(0),
            eventNames: vi.fn().mockReturnValue([]),
            setMaxListeners: vi.fn(),
            getMaxListeners: vi.fn().mockReturnValue(10),

            // TypedEventBus-specific methods
            onTyped: vi.fn(),
            emitTyped: vi.fn().mockResolvedValue(undefined),
            offTyped: vi.fn(),
            onceTyped: vi.fn(),
            removeTypedListener: vi.fn(),
            removeAllTypedListeners: vi.fn(),
            getListenerCount: vi.fn().mockReturnValue(0),
            hasListeners: vi.fn().mockReturnValue(false),
            busId: name || "test-bus",
            destroy: vi.fn(),
        };
    }

    return MockTypedEventBus;
});

// Create hoisted mock factory for SiteManager using constructor pattern
const mockSiteManager = vi.hoisted(() => {
    function MockSiteManager() {
        const mockStandardizedCache = {
            get: vi.fn(),
            set: vi.fn(),
            has: vi.fn().mockReturnValue(false),
            delete: vi.fn().mockReturnValue(false),
            clear: vi.fn(),
            keys: vi.fn().mockReturnValue([]),
            entries: vi.fn().mockReturnValue([][Symbol.iterator]()),
            getAll: vi.fn().mockReturnValue([]),
            size: 0,
            getStats: vi
                .fn()
                .mockReturnValue({ hits: 0, misses: 0, evictions: 0 }),
            cleanup: vi.fn().mockReturnValue(0),
            invalidate: vi.fn(),
            invalidateAll: vi.fn(),
            bulkUpdate: vi.fn(),
            onInvalidation: vi.fn().mockReturnValue(() => {}),
        };

        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getSitesCache: vi.fn().mockReturnValue(mockStandardizedCache),
            getEventBus: vi.fn().mockReturnValue(mockTypedEventBus()),
            addSite: vi.fn().mockResolvedValue(undefined),
            updateSite: vi.fn().mockResolvedValue(undefined),
            deleteSite: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
            getSites: vi.fn().mockResolvedValue([]),
            getSiteById: vi.fn().mockResolvedValue(null),
            clearCache: vi.fn(),
            reloadSites: vi.fn().mockResolvedValue(undefined),
            eventBus: mockTypedEventBus(),
        };
    }

    return MockSiteManager;
});

// Mock all dependencies
vi.mock("../../managers/SiteManager", () => ({
    SiteManager: mockSiteManager,
}));

vi.mock("../../events/TypedEventBus", () => ({
    TypedEventBus: mockTypedEventBus,
}));

vi.mock(
    "../../managers/monitoring/services/EnhancedMonitoringServiceFactory",
    () => ({
        EnhancedMonitoringServiceFactory: {
            createServices: vi.fn().mockReturnValue({
                enhancedHistoryRepository: {},
                enhancedMonitoringOperations: {},
                enhancedMonitorRepository: {},
                enhancedSiteRepository: {},
            }),
        },
    })
);

vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock all other required dependencies
vi.mock("../../managers/DatabaseManager", () => ({
    DatabaseManager: function MockDatabaseManager() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getHistoryLimit: vi.fn().mockReturnValue(100),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: function mockGetInstance() {
            return {
                initialize: vi.fn().mockResolvedValue(undefined),
                isInitialized: vi.fn().mockReturnValue(true),
                close: vi.fn().mockResolvedValue(undefined),
                getConnection: vi.fn(),
                beginTransaction: vi.fn(),
                commitTransaction: vi.fn(),
                rollbackTransaction: vi.fn(),
            };
        },
    },
}));

vi.mock("../../services/database/SettingsRepository", () => ({
    SettingsRepository: function MockSettingsRepository() {
        return {};
    },
}));

vi.mock("../../services/database/SiteRepository", () => ({
    SiteRepository: function MockSiteRepository() {
        return {};
    },
}));

vi.mock("../../services/database/MonitorRepository", () => ({
    MonitorRepository: function MockMonitorRepository() {
        return {};
    },
}));

vi.mock("../../services/database/HistoryRepository", () => ({
    HistoryRepository: function MockHistoryRepository() {
        return {};
    },
}));

// Mock Configuration manager
vi.mock("../../managers/ConfigurationManager", () => ({
    ConfigurationManager: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
        getSettings: vi.fn().mockReturnValue({}),
        getSetting: vi.fn().mockReturnValue("default"),
    })),
}));

import { ServiceContainer } from "../../services/ServiceContainer";

describe("ServiceContainer - Copy of Simple Test", () => {
    let container: ServiceContainer;

    beforeEach(() => {
        vi.clearAllMocks();
        ServiceContainer.resetForTesting();
        container = ServiceContainer.getInstance();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    it("should create ServiceContainer instance without errors", () => {
        expect(container).toBeDefined();
        expect(container).toBeInstanceOf(ServiceContainer);
    });

    it("should have proper basic ServiceContainer methods", () => {
        expect(container.getDatabaseService).toBeDefined();
        expect(typeof container.getDatabaseService).toBe("function");
    });

    it("should create SiteManager with getSitesCache method", () => {
        const siteManager = container.getSiteManager();
        expect(siteManager).toBeDefined();
        expect(siteManager.getSitesCache).toBeInstanceOf(Function);

        const cache = siteManager.getSitesCache();
        expect(cache).toBeDefined();
        expect(cache.get).toBeInstanceOf(Function);
    });
});
