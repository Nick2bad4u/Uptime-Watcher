/**
 * ServiceContainer test using factory bypass approach
 *
 * Instead of trying to fix SiteManager mocking, we mock EnhancedMonitoringServiceFactory
 * to avoid the getSitesCache dependency entirely
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "node:events";

// Create hoisted mock factory for TypedEventBus using constructor pattern
const mockTypedEventBus = vi.hoisted(() => {
    function MockTypedEventBus(name?: string) {
        const eventEmitter = new EventEmitter() as any;

        // Add TypedEventBus-specific methods
        eventEmitter.onTyped = vi.fn();
        eventEmitter.emitTyped = vi.fn().mockResolvedValue(undefined);
        eventEmitter.offTyped = vi.fn();
        eventEmitter.onceTyped = vi.fn();
        eventEmitter.removeTypedListener = vi.fn();
        eventEmitter.removeAllTypedListeners = vi.fn();
        eventEmitter.getListenerCount = vi.fn().mockReturnValue(0);
        eventEmitter.hasListeners = vi.fn().mockReturnValue(false);
        eventEmitter.busId = name || "test-bus";
        eventEmitter.destroy = vi.fn();

        return eventEmitter;
    }

    return MockTypedEventBus;
});

// Mock TypedEventBus using hoisted factory
vi.mock("../../events/TypedEventBus", () => ({
    TypedEventBus: mockTypedEventBus,
}));

// Mock EnhancedMonitoringServiceFactory to bypass sites parameter issue
vi.mock("../../services/monitoring/EnhancedMonitoringServiceFactory", () => ({
    EnhancedMonitoringServiceFactory: {
        createServices: vi.fn().mockReturnValue({
            enhancedHistoryRepository: {
                insertMonitorResult: vi.fn().mockResolvedValue(undefined),
                getLatestMonitorResults: vi.fn().mockResolvedValue([]),
                getMonitorResultHistory: vi.fn().mockResolvedValue([]),
                deleteOldMonitorResults: vi.fn().mockResolvedValue(undefined),
                deleteAllMonitorResults: vi.fn().mockResolvedValue(undefined),
            },
            enhancedMonitoringOperations: {
                checkSiteStatus: vi
                    .fn()
                    .mockResolvedValue({ success: true, responseTime: 100 }),
                performHealthCheck: vi.fn().mockResolvedValue(true),
                validateSiteConfiguration: vi.fn().mockReturnValue(true),
            },
            enhancedMonitorRepository: {
                getMonitorBySiteId: vi.fn().mockResolvedValue(null),
                insertMonitor: vi.fn().mockResolvedValue(undefined),
                updateMonitor: vi.fn().mockResolvedValue(undefined),
                deleteMonitor: vi.fn().mockResolvedValue(undefined),
                getAllMonitors: vi.fn().mockResolvedValue([]),
            },
            enhancedSiteRepository: {
                insertSite: vi.fn().mockResolvedValue(undefined),
                updateSite: vi.fn().mockResolvedValue(undefined),
                deleteSite: vi.fn().mockResolvedValue(undefined),
                getSiteById: vi.fn().mockResolvedValue(null),
                getAllSites: vi.fn().mockResolvedValue([]),
            },
        }),
    },
}));

// Mock all other dependencies
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("../../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: function mockGetInstance() {
            return {
                getDatabasePath: vi.fn().mockReturnValue("test.db"),
                executeInTransaction: vi.fn(),
                initialize: vi.fn().mockResolvedValue(undefined),
            };
        },
    },
}));

vi.mock("../../managers/SiteManager", () => ({
    SiteManager: function MockSiteManager() {
        // Create a proper mock for StandardizedCache
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
            eventBus: mockTypedEventBus(),
        };
    },
}));

// Import ServiceContainer after mocks are set up
import { ServiceContainer } from "../../services/ServiceContainer";

describe("ServiceContainer - Factory Bypass Test", () => {
    let container: ServiceContainer;

    beforeEach(() => {
        vi.clearAllMocks();
        ServiceContainer.resetForTesting();
        container = ServiceContainer.getInstance();
        console.log("🧪 Factory bypass test setup complete");
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    it("should create SiteManager successfully", () => {
        console.log("🧪 Testing SiteManager creation");

        const siteManager = container.getSiteManager();
        console.log("🎯 SiteManager created:", !!siteManager);

        expect(siteManager).toBeDefined();
        expect(siteManager.initialize).toBeDefined();
        expect(siteManager.addSite).toBeDefined();
    });

    it("should create MonitorManager successfully without getSitesCache error", async () => {
        console.log("🧪 Testing MonitorManager creation with factory bypass");

        // First create SiteManager
        const siteManager = container.getSiteManager();
        console.log("🎯 SiteManager created:", !!siteManager);

        // Then create MonitorManager - this should NOT fail because EnhancedMonitoringServiceFactory is mocked
        const monitorManager = container.getMonitorManager();
        console.log("🎯 MonitorManager created:", !!monitorManager);

        expect(siteManager).toBeDefined();
        expect(monitorManager).toBeDefined();

        // Verify that EnhancedMonitoringServiceFactory.createServices was called
        const { EnhancedMonitoringServiceFactory } = await import(
            "../../services/monitoring/EnhancedMonitoringServiceFactory"
        );
        expect(
            EnhancedMonitoringServiceFactory.createServices
        ).toHaveBeenCalled();
    });
});
