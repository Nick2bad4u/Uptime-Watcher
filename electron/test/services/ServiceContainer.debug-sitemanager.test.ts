/**
 * Debug test to understand SiteManager mocking issue
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

// Mock TypedEventBus using hoisted factory
vi.mock("../../events/TypedEventBus", () => ({
    TypedEventBus: mockTypedEventBus,
}));

// Mock logger
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock SiteManager using constructor pattern
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

// Mock other dependencies
vi.mock("../../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: vi.fn().mockReturnValue({
            initialize: vi.fn().mockResolvedValue(undefined),
        }),
    },
}));

import { ServiceContainer } from "../../services/ServiceContainer";

describe("Debug SiteManager Mock", () => {
    let container: ServiceContainer;

    beforeEach(() => {
        vi.clearAllMocks();
        ServiceContainer.resetForTesting();
        container = ServiceContainer.getInstance();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    it("should create SiteManager with getSitesCache method", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer.debug-sitemanager", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

        console.log("Starting test...");

        // Get SiteManager
        const siteManager = container.getSiteManager();
        console.log("SiteManager instance:", siteManager);
        console.log("SiteManager type:", typeof siteManager);
        console.log("SiteManager methods:", Object.keys(siteManager));
        console.log("getSitesCache method:", siteManager.getSitesCache);
        console.log("getSitesCache type:", typeof siteManager.getSitesCache);

        expect(siteManager).toBeDefined();
        expect(typeof siteManager.getSitesCache).toBe("function");

        // Try to call getSitesCache
        const cache = siteManager.getSitesCache();
        console.log("Cache result:", cache);
        expect(cache).toBeDefined();
    });
});
