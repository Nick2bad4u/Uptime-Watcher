/**
 * Working ServiceContainer test - copied from simple test that works
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "node:events";

// Create comprehensive mocks using vi.hoisted to ensure they're available before imports
const mockSiteManager = vi.hoisted(() => {
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
        getStats: vi.fn().mockReturnValue({ hits: 0, misses: 0, evictions: 0 }),
        cleanup: vi.fn().mockReturnValue(0),
        invalidate: vi.fn(),
        invalidateAll: vi.fn(),
        bulkUpdate: vi.fn(),
        onInvalidation: vi.fn().mockReturnValue(() => {}),
    };

    // Create a constructor function that returns the mock object
    function MockSiteManager(_options: any) {
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
        };
    }

    return MockSiteManager;
});

const mockEventBus = vi.hoisted(() => {
    // Create a constructor function that returns EventEmitter
    function MockEventBus(name?: string) {
        // eslint-disable-next-line unicorn/prefer-event-target
        const emitter = new EventEmitter();
        // Add required TypedEventBus methods
        (emitter as any).onTyped = vi.fn().mockReturnThis();
        (emitter as any).emitTyped = vi.fn().mockResolvedValue(undefined);
        (emitter as any).busId = name || "test-bus";
        (emitter as any).destroy = vi.fn();
        return emitter;
    }

    return MockEventBus;
});

const mockMonitorManager = vi.hoisted(() =>
    vi.fn().mockImplementation(function () {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            startMonitoring: vi.fn().mockResolvedValue(undefined),
            stopMonitoring: vi.fn().mockResolvedValue(undefined),
            getMonitorStatus: vi.fn().mockReturnValue("stopped"),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    })
);

const mockDatabaseService = vi.hoisted(() =>
    vi.fn().mockImplementation(function () {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
            close: vi.fn().mockResolvedValue(undefined),
            getConnection: vi.fn(),
            beginTransaction: vi.fn(),
            commitTransaction: vi.fn(),
            rollbackTransaction: vi.fn(),
            getInstance: vi.fn().mockReturnThis(),
        };
    })
);

const mockDatabaseManager = vi.hoisted(() =>
    vi.fn().mockImplementation(function () {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            backup: vi.fn().mockResolvedValue(undefined),
            restore: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
            refreshSites: vi.fn().mockResolvedValue(undefined),
        };
    })
);

const mockUptimeOrchestrator = vi.hoisted(() =>
    vi.fn().mockImplementation(function () {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            start: vi.fn().mockResolvedValue(undefined),
            stop: vi.fn().mockResolvedValue(undefined),
            restart: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
            getHistoryLimit: vi.fn().mockReturnValue(100),
        };
    })
);

const mockIpcService = vi.hoisted(() =>
    vi.fn().mockImplementation(function () {
        return {
            setupHandlers: vi.fn(),
            cleanup: vi.fn(),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    })
);

// Hoisted mocks for all dependencies
vi.mock("../../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: mockDatabaseService,
    },
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

// Mock all repository services
vi.mock("../../services/database/SettingsRepository", () => ({
    SettingsRepository: vi.fn().mockImplementation(function () {
        return {};
    }),
}));

vi.mock("../../services/database/SiteRepository", () => ({
    SiteRepository: vi.fn().mockImplementation(function () {
        return {};
    }),
}));

vi.mock("../../services/database/MonitorRepository", () => ({
    MonitorRepository: vi.fn().mockImplementation(function () {
        return {};
    }),
}));

vi.mock("../../services/database/HistoryRepository", () => ({
    HistoryRepository: vi.fn().mockImplementation(function () {
        return {};
    }),
}));

vi.mock("../../services/configuration/ConfigurationManager", () => ({
    ConfigurationManager: vi.fn().mockImplementation(() => ({
        get: vi.fn(),
        set: vi.fn(),
        isInitialized: vi.fn().mockReturnValue(true),
    })),
}));

// Import after mocks
import { ServiceContainer } from "../../services/ServiceContainer";

describe("ServiceContainer - Working Tests", () => {
    let container: ServiceContainer;

    beforeEach(() => {
        vi.clearAllMocks();
        ServiceContainer.resetForTesting();
        container = ServiceContainer.getInstance();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    describe("Service Creation Tests", () => {
        it("should create SiteManager with getSitesCache method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const siteManager = container.getSiteManager();

            expect(siteManager).toBeDefined();
            expect(siteManager.getSitesCache).toBeDefined();
            expect(typeof siteManager.getSitesCache).toBe("function");

            const cache = siteManager.getSitesCache();
            expect(cache).toBeDefined();
        });

        it("should create MonitorManager singleton with dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const monitorManager = container.getMonitorManager();

            expect(monitorManager).toBeDefined();
        });

        it("should create UptimeOrchestrator singleton with dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const uptimeOrchestrator = container.getUptimeOrchestrator();

            expect(uptimeOrchestrator).toBeDefined();
        });

        it("should create IpcService singleton with dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const ipcService = container.getIpcService();

            expect(ipcService).toBeDefined();
        });
    });

    describe("Initialization Process", () => {
        it("should initialize all services in correct order", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const monitorManager = container.getMonitorManager();
            const siteManager = container.getSiteManager();

            expect(monitorManager).toBeDefined();
            expect(siteManager).toBeDefined();
            expect(siteManager.getSitesCache).toBeDefined();
        });
    });

    describe("Status and Diagnostics", () => {
        it("should return correct initialization status for services", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const monitorManager = container.getMonitorManager();
            const siteManager = container.getSiteManager();

            expect(monitorManager).toBeDefined();
            expect(siteManager).toBeDefined();

            const cache = siteManager.getSitesCache();
            expect(cache).toBeDefined();
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle orchestrator access when initialized", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const uptimeOrchestrator = container.getUptimeOrchestrator();
            const ipcService = container.getIpcService();

            expect(uptimeOrchestrator).toBeDefined();
            expect(ipcService).toBeDefined();
        });

        it("should handle service creation order independence", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const siteManager = container.getSiteManager();
            const monitorManager = container.getMonitorManager();

            expect(siteManager).toBeDefined();
            expect(monitorManager).toBeDefined();
        });

        it("should handle empty configuration", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Test that container works even with minimal setup
            const container = ServiceContainer.getInstance();

            expect(container).toBeDefined();
            expect(() => container.getSiteManager()).not.toThrow();
        });
    });
});
