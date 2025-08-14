/**
 * Debug test to understand SiteManager mocking issue
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

    it("should create SiteManager with getSitesCache method", () => {
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
