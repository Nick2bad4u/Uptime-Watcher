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

// Mock TypedEventBus with proper implementation
vi.mock("../events/TypedEventBus", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module -- Required for mock
    const { EventEmitter } = require("node:events");
    
    return {
        TypedEventBus: vi.fn().mockImplementation((name?: string) => {
            // Create an actual EventEmitter instance
            // eslint-disable-next-line unicorn/prefer-event-target -- Required for Node.js EventEmitter compatibility
            const eventEmitter = new EventEmitter();
            
            // Add TypedEventBus-specific methods and return directly
            return Object.assign(eventEmitter, {
                onTyped: vi.fn(),
                emitTyped: vi.fn(),
                busId: name || "test-bus",
            });
        }),
    };
});

// Mock SiteManager
vi.mock("../../managers/SiteManager", () => ({
    SiteManager: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getSitesCache: vi.fn().mockReturnValue(new Map()),
        getEventBus: vi.fn().mockReturnValue({
            emit: vi.fn(),
            on: vi.fn(),
            off: vi.fn(),
            once: vi.fn(),
            removeListener: vi.fn(),
            removeAllListeners: vi.fn(),
            listeners: vi.fn().mockReturnValue([]),
            addListener: vi.fn(),
        }),
        addSite: vi.fn().mockResolvedValue(undefined),
        updateSite: vi.fn().mockResolvedValue(undefined),
        deleteSite: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    })),
}));

// Mock all necessary dependencies
vi.mock("../../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: vi.fn().mockReturnValue({
            initialize: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
            close: vi.fn().mockResolvedValue(undefined),
            getConnection: vi.fn(),
        }),
    },
}));

vi.mock("../../managers/ConfigurationManager", () => ({
    ConfigurationManager: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getConfig: vi.fn().mockReturnValue({}),
        isInitialized: vi.fn().mockReturnValue(true)
    })),
}));

vi.mock("../../managers/MonitorManager", () => ({
    MonitorManager: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    })),
}));

vi.mock("../../UptimeOrchestrator", () => ({
    UptimeOrchestrator: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        start: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    })),
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
