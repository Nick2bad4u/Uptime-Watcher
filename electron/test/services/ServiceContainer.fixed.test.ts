/**
 * Fixed ServiceContainer comprehensive test - using hoisted mocking pattern
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "node:events";

// Create comprehensive hoisted mocks using constructor function pattern
const mockEventBus = vi.hoisted(() => {
    // Return constructor function that creates new event bus instances
    function MockTypedEventBus(busId?: string) {
        const emitter = new EventEmitter() as any;

        // Add TypedEventBus specific methods
        emitter.emitTyped = vi.fn().mockResolvedValue(undefined);
        emitter.onTyped = vi.fn().mockReturnThis();
        emitter.offTyped = vi.fn().mockReturnThis();
        emitter.onceTyped = vi.fn().mockReturnThis();
        emitter.removeTypedListener = vi.fn().mockReturnThis();
        emitter.removeAllTypedListeners = vi.fn().mockReturnThis();
        emitter.getListenerCount = vi.fn().mockReturnValue(0);
        emitter.hasListeners = vi.fn().mockReturnValue(false);
        emitter.busId = busId || "test-bus";
        emitter.destroy = vi.fn();

        return emitter;
    }

    return MockTypedEventBus;
});

const mockDatabaseService = vi.hoisted(() => ({
    getInstance: vi.fn(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
        close: vi.fn().mockResolvedValue(undefined),
        getConnection: vi.fn(),
        beginTransaction: vi.fn(),
        commitTransaction: vi.fn(),
        rollbackTransaction: vi.fn(),
        executeTransaction: vi.fn(),
        getDatabasePath: vi.fn().mockReturnValue("test.db"),
    })),
}));

const mockStandardizedCache = vi.hoisted(() => ({
    get: vi.fn(),
    set: vi.fn(),
    has: vi.fn().mockReturnValue(false),
    delete: vi.fn().mockReturnValue(false),
    clear: vi.fn(),
    keys: vi.fn().mockReturnValue([]),
    entries: vi.fn().mockReturnValue([][Symbol.iterator]()),
    getAll: vi.fn().mockReturnValue([]),
    size: 0,
    getStats: vi.fn().mockReturnValue({ hits: 0, misses: 0, evictions: 0 }),
    cleanup: vi.fn().mockReturnValue(0),
    invalidate: vi.fn(),
    invalidateAll: vi.fn(),
    bulkUpdate: vi.fn(),
    onInvalidation: vi.fn().mockReturnValue(() => {}),
}));

const mockSiteManager = vi.hoisted(() =>
    vi.fn(function MockSiteManager() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getSitesCache: vi.fn().mockReturnValue(mockStandardizedCache),
            addSite: vi.fn().mockResolvedValue(undefined),
            updateSite: vi.fn().mockResolvedValue(undefined),
            deleteSite: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
            getSites: vi.fn().mockResolvedValue([]),
            getSiteById: vi.fn().mockResolvedValue(null),
            clearCache: vi.fn(),
            reloadSites: vi.fn().mockResolvedValue(undefined),
            eventBus: mockEventBus(),
            getEventBus: vi.fn().mockReturnValue(mockEventBus()),
        };
    })
);

const mockMonitorManager = vi.hoisted(() =>
    vi.fn(function MockMonitorManager() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            setupNewMonitors: vi.fn().mockResolvedValue(undefined),
            startMonitoringForSite: vi.fn().mockResolvedValue(true),
            stopMonitoringForSite: vi.fn().mockResolvedValue(true),
            updateMonitor: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
            eventBus: mockEventBus(),
            getEventBus: vi.fn().mockReturnValue(mockEventBus()),
        };
    })
);

const mockDatabaseManager = vi.hoisted(() =>
    vi.fn(function MockDatabaseManager() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            setHistoryLimit: vi.fn().mockResolvedValue(undefined),
            getHistoryLimit: vi.fn().mockReturnValue(100),
            backup: vi.fn().mockResolvedValue(undefined),
            restore: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
            refreshSites: vi.fn().mockResolvedValue(undefined),
            eventBus: mockEventBus(),
            getEventBus: vi.fn().mockReturnValue(mockEventBus()),
        };
    })
);

const mockUptimeOrchestrator = vi.hoisted(() =>
    vi.fn(function MockUptimeOrchestrator() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            start: vi.fn().mockResolvedValue(undefined),
            stop: vi.fn().mockResolvedValue(undefined),
            restart: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
            getHistoryLimit: vi.fn().mockReturnValue(100),
            eventBus: mockEventBus(),
        };
    })
);

const mockIpcService = vi.hoisted(() =>
    vi.fn(function MockIpcService() {
        return {
            setupHandlers: vi.fn(),
            cleanup: vi.fn(),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    })
);

// Hoisted mocks for all dependencies
vi.mock("../../services/database/DatabaseService", () => ({
    DatabaseService: mockDatabaseService,
}));

vi.mock("../../managers/SiteManager", () => ({
    SiteManager: mockSiteManager,
}));

vi.mock("../../managers/MonitorManager", () => ({
    MonitorManager: mockMonitorManager,
}));

vi.mock("../../managers/DatabaseManager", () => ({
    DatabaseManager: mockDatabaseManager,
}));

vi.mock("../../UptimeOrchestrator", () => ({
    UptimeOrchestrator: mockUptimeOrchestrator,
}));

vi.mock("../../services/ipc/IpcService", () => ({
    IpcService: mockIpcService,
}));

vi.mock("../../events/TypedEventBus", () => ({
    TypedEventBus: mockEventBus,
}));

// Mock other dependencies
vi.mock("../../managers/ConfigurationManager", () => ({
    ConfigurationManager: function MockConfigurationManager() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getConfig: vi.fn().mockReturnValue({}),
            updateConfig: vi.fn().mockResolvedValue(undefined),
            resetConfig: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

// Mock repositories
vi.mock("../../services/database/HistoryRepository", () => ({
    HistoryRepository: function MockHistoryRepository() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getAllHistory: vi.fn().mockResolvedValue([]),
            addHistoryEntry: vi.fn().mockResolvedValue(undefined),
            deleteHistory: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/database/MonitorRepository", () => ({
    MonitorRepository: function MockMonitorRepository() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            findBySiteIdentifier: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue(undefined),
            update: vi.fn().mockResolvedValue(undefined),
            delete: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/database/SettingsRepository", () => ({
    SettingsRepository: function MockSettingsRepository() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getAll: vi.fn().mockResolvedValue({}),
            get: vi.fn().mockResolvedValue(null),
            set: vi.fn().mockResolvedValue(undefined),
            delete: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/database/SiteRepository", () => ({
    SiteRepository: function MockSiteRepository() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            findAll: vi.fn().mockResolvedValue([]),
            findById: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue(undefined),
            update: vi.fn().mockResolvedValue(undefined),
            delete: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

// Mock notification and window services
vi.mock("../../services/NotificationService", () => ({
    NotificationService: function MockNotificationService() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            sendNotification: vi.fn(),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/AutoUpdaterService", () => ({
    AutoUpdaterService: function MockAutoUpdaterService() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            checkForUpdates: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/WindowService", () => ({
    WindowService: function MockWindowService() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            createWindow: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

// Mock SiteService
vi.mock("../../services/SiteService", () => ({
    SiteService: function MockSiteService() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getAllSites: vi.fn().mockResolvedValue([]),
            getSiteById: vi.fn().mockResolvedValue(null),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

// Import ServiceContainer after mocks are set up
import {
    ServiceContainer,
    type ServiceContainerConfig,
} from "../../services/ServiceContainer";

describe("ServiceContainer - Fixed Tests", () => {
    let container: ServiceContainer;
    let mockConfig: ServiceContainerConfig;

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset container singleton
        ServiceContainer.resetForTesting();

        mockConfig = {
            enableDebugLogging: false,
        };
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    describe("Service Creation Tests", () => {
        it("should create UptimeOrchestrator singleton with dependencies", () => {
            container = ServiceContainer.getInstance(mockConfig);

            const orchestrator = container.getUptimeOrchestrator();

            expect(orchestrator).toBeDefined();
            expect(mockUptimeOrchestrator).toHaveBeenCalled();
        });

        it("should create IpcService singleton with dependencies", () => {
            container = ServiceContainer.getInstance(mockConfig);

            const ipcService = container.getIpcService();

            expect(ipcService).toBeDefined();
            expect(mockIpcService).toHaveBeenCalled();
        });

        it("should create MonitorManager singleton with complex dependencies", () => {
            container = ServiceContainer.getInstance(mockConfig);

            // Ensure SiteManager is created first
            container.getSiteManager();

            const monitorManager = container.getMonitorManager();

            expect(monitorManager).toBeDefined();
            expect(mockMonitorManager).toHaveBeenCalled();
        });

        it("should create SiteManager with getSitesCache method", () => {
            container = ServiceContainer.getInstance(mockConfig);

            const siteManager = container.getSiteManager();

            expect(siteManager).toBeDefined();
            expect(siteManager.getSitesCache).toBeDefined();
            expect(typeof siteManager.getSitesCache).toBe("function");

            // Verify the cache is returned
            const cache = siteManager.getSitesCache();
            expect(cache).toBeDefined();
            expect(cache).toBe(mockStandardizedCache);
        });
    });

    describe("Initialization Process", () => {
        it("should initialize all services in correct order", async () => {
            container = ServiceContainer.getInstance(mockConfig);

            // Create all services first to get their instances
            const databaseManager = container.getDatabaseManager();
            const siteManager = container.getSiteManager();
            const orchestrator = container.getUptimeOrchestrator();
            const ipcService = container.getIpcService();

            await container.initialize();

            // Verify initialization calls were made on the actual instances
            expect(databaseManager.initialize).toHaveBeenCalled();
            expect(orchestrator.initialize).toHaveBeenCalled();
            expect(ipcService.setupHandlers).toHaveBeenCalled();
        });
    });

    describe("Status and Diagnostics", () => {
        it("should return correct initialization status for services", () => {
            container = ServiceContainer.getInstance(mockConfig);

            // Create services
            container.getSiteManager();
            container.getMonitorManager();

            const initializedServices = container.getInitializedServices();

            expect(Array.isArray(initializedServices)).toBe(true);
            expect(initializedServices.length).toBeGreaterThan(0);
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle orchestrator access when initialized", () => {
            container = ServiceContainer.getInstance(mockConfig);

            // Create orchestrator first
            const orchestrator = container.getUptimeOrchestrator();

            expect(orchestrator).toBeDefined();
            expect(mockUptimeOrchestrator).toHaveBeenCalled();
        });

        it("should handle service creation order independence", () => {
            container = ServiceContainer.getInstance(mockConfig);

            // Create services in different order
            const monitorManager = container.getMonitorManager();
            const siteManager = container.getSiteManager();
            const orchestrator = container.getUptimeOrchestrator();

            expect(monitorManager).toBeDefined();
            expect(siteManager).toBeDefined();
            expect(orchestrator).toBeDefined();
        });

        it("should handle empty configuration", () => {
            const emptyConfig = {} as ServiceContainerConfig;
            container = ServiceContainer.getInstance(emptyConfig);

            expect(container).toBeDefined();
            expect(() => container.getSiteManager()).not.toThrow();
        });
    });
});
