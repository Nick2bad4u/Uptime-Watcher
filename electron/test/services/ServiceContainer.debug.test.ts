/**
 * Debug test to isolate TypedEventBus issue
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ServiceContainer } from "../../services/ServiceContainer";

// Mock logger to prevent noise
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
    monitorLogger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

// Create hoisted mock factory for TypedEventBus using constructor pattern
const mockTypedEventBus = vi.hoisted(() => {
    function MockTypedEventBus(name?: string) {
        const eventEmitter = new EventTarget() as any;

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

// Mock all necessary dependencies
vi.mock("../../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: function mockGetInstance() {
            return {
                initialize: vi.fn().mockResolvedValue(undefined),
                isInitialized: vi.fn().mockReturnValue(true),
                close: vi.fn().mockResolvedValue(undefined),
                getConnection: vi.fn(),
            };
        },
    },
}));

vi.mock("../../managers/ConfigurationManager", () => ({
    ConfigurationManager: function MockConfigurationManager() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getConfig: vi.fn().mockReturnValue({}),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../managers/MonitorManager", () => ({
    MonitorManager: function MockMonitorManager() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../UptimeOrchestrator", () => ({
    UptimeOrchestrator: function MockUptimeOrchestrator() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            start: vi.fn().mockResolvedValue(undefined),
            stop: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

describe("Debug Test - UptimeOrchestrator Creation", () => {
    let container: ServiceContainer;

    beforeEach(() => {
        vi.clearAllMocks();
        ServiceContainer.resetForTesting();
        container = ServiceContainer.getInstance();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    it("should create UptimeOrchestrator without errors", () => {
        // Create SiteManager first to ensure proper initialization
        container.getSiteManager();

        // Then create UptimeOrchestrator
        const orchestrator = container.getUptimeOrchestrator();

        expect(orchestrator).toBeDefined();
    });
});
