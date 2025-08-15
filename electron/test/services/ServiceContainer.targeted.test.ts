/**
 * Targeted test for ServiceContainer SiteManager creation with event bus mocking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ServiceContainer } from "../../services/ServiceContainer";

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

// Mock TypedEventBus using hoisted factory
vi.mock("../../events/TypedEventBus", () => ({
    TypedEventBus: mockTypedEventBus,
}));

// Mock logger to prevent noise
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock DatabaseService singleton
const mockDatabaseServiceInstance = {
    initialize: vi.fn().mockResolvedValue(undefined),
    isInitialized: vi.fn().mockReturnValue(true),
    close: vi.fn().mockResolvedValue(undefined),
    getConnection: vi.fn(),
    beginTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    rollbackTransaction: vi.fn(),
};

vi.mock("../../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: vi.fn(() => mockDatabaseServiceInstance),
    },
}));

// Mock all repository classes
vi.mock("../../services/database/HistoryRepository", () => ({
    HistoryRepository: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getAllHistory: vi.fn().mockResolvedValue([]),
        addHistoryEntry: vi.fn().mockResolvedValue(undefined),
        deleteHistory: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    })),
}));

vi.mock("../../services/database/MonitorRepository", () => ({
    MonitorRepository: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getAllMonitors: vi.fn().mockResolvedValue([]),
        createMonitor: vi.fn().mockResolvedValue(undefined),
        updateMonitor: vi.fn().mockResolvedValue(undefined),
        deleteMonitor: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    })),
}));

vi.mock("../../services/database/SettingsRepository", () => ({
    SettingsRepository: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getSettings: vi.fn().mockResolvedValue({}),
        updateSettings: vi.fn().mockResolvedValue(undefined),
        resetSettings: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    })),
}));

vi.mock("../../services/database/SiteRepository", () => ({
    SiteRepository: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getAllSites: vi.fn().mockResolvedValue([]),
        createSite: vi.fn().mockResolvedValue(undefined),
        updateSite: vi.fn().mockResolvedValue(undefined),
        deleteSite: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    })),
}));

// Mock ConfigurationManager
vi.mock("../../managers/ConfigurationManager", () => ({
    ConfigurationManager: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getConfig: vi.fn().mockReturnValue({}),
        updateConfig: vi.fn().mockResolvedValue(undefined),
        resetConfig: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    })),
}));

// Mock SiteManager
let mockSiteEventBus;
vi.mock("../../managers/SiteManager", () => ({
    SiteManager: vi.fn().mockImplementation((dependencies) => {
        // Store the event bus passed to the constructor so ServiceContainer can use it
        mockSiteEventBus = dependencies.eventEmitter;

        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getSitesCache: vi.fn().mockReturnValue(new Map()),
            addSite: vi.fn().mockResolvedValue(undefined),
            updateSite: vi.fn().mockResolvedValue(undefined),
            deleteSite: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    }),
}));

// Mock UptimeOrchestrator
vi.mock("../../UptimeOrchestrator", () => ({
    UptimeOrchestrator: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        start: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn().mockResolvedValue(undefined),
        restart: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
        emitTyped: vi.fn().mockResolvedValue(undefined),
    })),
}));

describe("ServiceContainer - Targeted SiteManager Test", () => {
    beforeEach(() => {
        ServiceContainer.resetForTesting();
        vi.clearAllMocks();
        console.log("Test setup complete - starting test");
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    describe("SiteManager Creation", () => {
        it("should create SiteManager without event bus errors", () => {
            console.log("Starting SiteManager creation test");
            const container = ServiceContainer.getInstance();

            console.log("About to call getSiteManager()");
            const siteManager = container.getSiteManager();

            console.log("SiteManager created successfully:", siteManager);
            expect(siteManager).toBeDefined();
        });
    });
});
