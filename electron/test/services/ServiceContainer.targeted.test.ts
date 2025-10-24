/**
 * Targeted test for ServiceContainer SiteManager creation with event bus
 * mocking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ServiceContainer } from "../../services/ServiceContainer";

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

// Create hoisted mock factory for TypedEventBus using constructor pattern
const typedEventBusMocks = vi.hoisted(() => {
    const typedEventBusInstance = {
        on: vi.fn(),
        off: vi.fn(),
        once: vi.fn(),
        emit: vi.fn(),
        removeListener: vi.fn(),
        removeAllListeners: vi.fn(),
        listeners: vi.fn().mockReturnValue([] as unknown[]),
        addListener: vi.fn(),
        onTyped: vi.fn(),
        emitTyped: vi.fn().mockResolvedValue(undefined),
        removeTypedListener: vi.fn(),
        removeAllTypedListeners: vi.fn(),
        getListenerCount: vi.fn().mockReturnValue(0),
        hasListeners: vi.fn().mockReturnValue(false),
        destroy: vi.fn(),
        busId: "test-bus",
    };

    return {
        MockTypedEventBus: createConstructableMock(
            typedEventBusInstance,
            "MockTypedEventBus"
        ),
        typedEventBusInstance,
    };
});

// Mock TypedEventBus using hoisted factory
vi.mock("../../events/TypedEventBus", () => ({
    TypedEventBus: typedEventBusMocks.MockTypedEventBus,
}));

// Mock logger to prevent noise
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
    diagnosticsLogger: {
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
const serviceMocks = vi.hoisted(() => {
    const mockHistoryRepository = {
        initialize: vi.fn().mockResolvedValue(undefined),
        getAllHistory: vi.fn().mockResolvedValue([]),
        addHistoryEntry: vi.fn().mockResolvedValue(undefined),
        deleteHistory: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    };

    const mockMonitorRepository = {
        initialize: vi.fn().mockResolvedValue(undefined),
        getAllMonitors: vi.fn().mockResolvedValue([]),
        createMonitor: vi.fn().mockResolvedValue(undefined),
        updateMonitor: vi.fn().mockResolvedValue(undefined),
        deleteMonitor: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    };

    const mockSettingsRepository = {
        initialize: vi.fn().mockResolvedValue(undefined),
        getSettings: vi.fn().mockResolvedValue({}),
        updateSettings: vi.fn().mockResolvedValue(undefined),
        resetSettings: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    };

    const mockSiteRepository = {
        initialize: vi.fn().mockResolvedValue(undefined),
        getAllSites: vi.fn().mockResolvedValue([]),
        createSite: vi.fn().mockResolvedValue(undefined),
        updateSite: vi.fn().mockResolvedValue(undefined),
        deleteSite: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    };

    const mockConfigurationManager = {
        initialize: vi.fn().mockResolvedValue(undefined),
        getConfig: vi.fn().mockReturnValue({}),
        updateConfig: vi.fn().mockResolvedValue(undefined),
        resetConfig: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    };

    const mockSiteManager = {
        initialize: vi.fn().mockResolvedValue(undefined),
        getSitesCache: vi.fn().mockReturnValue(new Map()),
        addSite: vi.fn().mockResolvedValue(undefined),
        updateSite: vi.fn().mockResolvedValue(undefined),
        deleteSite: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    };

    const mockUptimeOrchestrator = {
        initialize: vi.fn().mockResolvedValue(undefined),
        start: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn().mockResolvedValue(undefined),
        restart: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
        emitTyped: vi.fn().mockResolvedValue(undefined),
    };

    return {
        MockConfigurationManager: createConstructableMock(
            mockConfigurationManager,
            "MockConfigurationManager"
        ),
        MockHistoryRepository: createConstructableMock(
            mockHistoryRepository,
            "MockHistoryRepository"
        ),
        MockMonitorRepository: createConstructableMock(
            mockMonitorRepository,
            "MockMonitorRepository"
        ),
        MockSettingsRepository: createConstructableMock(
            mockSettingsRepository,
            "MockSettingsRepository"
        ),
        MockSiteManager: createConstructableMock(
            mockSiteManager,
            "MockSiteManager"
        ),
        MockSiteRepository: createConstructableMock(
            mockSiteRepository,
            "MockSiteRepository"
        ),
        MockUptimeOrchestrator: createConstructableMock(
            mockUptimeOrchestrator,
            "MockUptimeOrchestrator"
        ),
    };
});

vi.mock("../../services/database/HistoryRepository", () => ({
    HistoryRepository: serviceMocks.MockHistoryRepository,
}));

vi.mock("../../services/database/MonitorRepository", () => ({
    MonitorRepository: serviceMocks.MockMonitorRepository,
}));

vi.mock("../../services/database/SettingsRepository", () => ({
    SettingsRepository: serviceMocks.MockSettingsRepository,
}));

vi.mock("../../services/database/SiteRepository", () => ({
    SiteRepository: serviceMocks.MockSiteRepository,
}));

vi.mock("../../managers/ConfigurationManager", () => ({
    ConfigurationManager: serviceMocks.MockConfigurationManager,
}));

vi.mock("../../managers/SiteManager", () => ({
    SiteManager: serviceMocks.MockSiteManager,
}));

vi.mock("../../UptimeOrchestrator", () => ({
    UptimeOrchestrator: serviceMocks.MockUptimeOrchestrator,
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
        it("should create SiteManager without event bus errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            console.log("Starting SiteManager creation test");
            const container = ServiceContainer.getInstance();

            console.log("About to call getSiteManager()");
            const siteManager = container.getSiteManager();

            console.log("SiteManager created successfully:", siteManager);
            expect(siteManager).toBeDefined();
        });
    });
});
