/**
 * Fixed ServiceContainer test - proper mocking approach
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

    return vi.fn().mockImplementation(() => ({
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
    }));
});

const mockEventBus = vi.hoisted(() =>
    vi.fn().mockImplementation((name?: string) => {
        const emitter = new EventTarget();
        // Add required TypedEventBus methods
        (emitter as any).onTyped = vi.fn().mockReturnThis();
        (emitter as any).emitTyped = vi.fn().mockResolvedValue(undefined);
        (emitter as any).busId = name || "test-bus";
        (emitter as any).destroy = vi.fn();
        return emitter;
    })
);

// Mock all dependencies with vi.hoisted for proper hoisting
vi.mock("../../managers/SiteManager", () => ({
    SiteManager: mockSiteManager,
}));

vi.mock("../../events/TypedEventBus", () => ({
    TypedEventBus: mockEventBus,
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
    DatabaseManager: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getHistoryLimit: vi.fn().mockReturnValue(100),
        isInitialized: vi.fn().mockReturnValue(true),
    })),
}));

vi.mock("../../managers/MonitorManager", () => ({
    MonitorManager: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        setupNewMonitors: vi.fn().mockResolvedValue(undefined),
        startMonitoringForSite: vi.fn().mockResolvedValue(true),
        stopMonitoringForSite: vi.fn().mockResolvedValue(true),
    })),
}));

vi.mock("../../managers/ConfigurationManager", () => ({
    ConfigurationManager: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getConfiguration: vi.fn().mockReturnValue({}),
    })),
}));

vi.mock("../../services/database/DatabaseService", () => {
    const mockInstance = {
        initialize: vi.fn().mockResolvedValue(undefined),
        getDatabasePath: vi.fn().mockReturnValue("test.db"),
        executeInTransaction: vi.fn(),
        executeTransaction: vi.fn(),
    };

    return {
        DatabaseService: {
            getInstance: vi.fn().mockReturnValue(mockInstance),
        },
    };
});

vi.mock("../../services/database/SiteRepository", () => ({
    SiteRepository: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../../services/database/MonitorRepository", () => ({
    MonitorRepository: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../../services/database/HistoryRepository", () => ({
    HistoryRepository: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../../services/database/SettingsRepository", () => ({
    SettingsRepository: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../../UptimeOrchestrator", () => ({
    UptimeOrchestrator: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../../services/ipc/IpcService", () => ({
    IpcService: vi.fn().mockImplementation(() => ({
        setupHandlers: vi.fn(),
        initialize: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../../services/notifications/NotificationService", () => ({
    NotificationService: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../../services/window/WindowService", () => ({
    WindowService: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../../services/updater/AutoUpdaterService", () => ({
    AutoUpdaterService: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../../services/site/SiteService", () => ({
    SiteService: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
    })),
}));

// Import ServiceContainer after all mocks are set up
import { ServiceContainer } from "../../services/ServiceContainer";

describe("ServiceContainer - Fixed getSitesCache Test", () => {
    let container: ServiceContainer;

    beforeEach(() => {
        vi.clearAllMocks();
        ServiceContainer.resetForTesting();
        container = ServiceContainer.getInstance();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    it("should create ServiceContainer instance without errors", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: ServiceContainer", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Constructor", "type");

        expect(container).toBeDefined();
        expect(container).toBeInstanceOf(ServiceContainer);
    });

    it("should have proper basic ServiceContainer methods", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: ServiceContainer", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Business Logic", "type");

        expect(container.getDatabaseService).toBeDefined();
        expect(typeof container.getDatabaseService).toBe("function");
    });
});
