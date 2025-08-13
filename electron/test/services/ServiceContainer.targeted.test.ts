/**
 * Targeted test for ServiceContainer SiteManager creation with event bus mocking
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
}));

// Mock TypedEventBus with proper implementation
vi.mock("@electron/events/TypedEventBus", () => {
    console.log("TypedEventBus mock being defined");
    // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module -- Required for mock
    const { EventEmitter } = require("node:events");
    
    return {
        TypedEventBus: vi.fn().mockImplementation((name?: string) => {
            console.log(`Creating TypedEventBus instance for: ${name}`);
            // Create an actual EventEmitter instance
            // eslint-disable-next-line unicorn/prefer-event-target -- Required for Node.js EventEmitter compatibility
            const eventEmitter = new EventEmitter();
            
            // Add TypedEventBus-specific methods
            const mockInstance = Object.assign(eventEmitter, {
                onTyped: vi.fn(),
                emitTyped: vi.fn(),
                busId: name || "test-bus",
            });
            
            console.log("Mock TypedEventBus instance created with on method:", typeof mockInstance.on);
            return mockInstance;
        }),
    };
});

// Also mock the relative path used by ServiceContainer
vi.mock("../events/TypedEventBus", () => {
    console.log("TypedEventBus relative mock being defined");
    // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module -- Required for mock
    const { EventEmitter } = require("node:events");
    
    return {
        TypedEventBus: vi.fn().mockImplementation((name?: string) => {
            console.log(`Creating TypedEventBus relative instance for: ${name}`);
            // Create an actual EventEmitter instance
            // eslint-disable-next-line unicorn/prefer-event-target -- Required for Node.js EventEmitter compatibility
            const eventEmitter = new EventEmitter();
            
            // Add TypedEventBus-specific methods
            const mockInstance = Object.assign(eventEmitter, {
                onTyped: vi.fn(),
                emitTyped: vi.fn(),
                busId: name || "test-bus",
            });
            
            console.log("Mock TypedEventBus relative instance created with on method:", typeof mockInstance.on);
            return mockInstance;
        }),
    };
});

// Mock DatabaseService singleton
const mockDatabaseServiceInstance = {
    initialize: vi.fn().mockResolvedValue(undefined),
    isInitialized: vi.fn().mockReturnValue(true),
    close: vi.fn().mockResolvedValue(undefined),
    getConnection: vi.fn(),
    beginTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    rollbackTransaction: vi.fn()
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
        isInitialized: vi.fn().mockReturnValue(true)
    })),
}));

vi.mock("../../services/database/MonitorRepository", () => ({
    MonitorRepository: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getAllMonitors: vi.fn().mockResolvedValue([]),
        createMonitor: vi.fn().mockResolvedValue(undefined),
        updateMonitor: vi.fn().mockResolvedValue(undefined),
        deleteMonitor: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true)
    })),
}));

vi.mock("../../services/database/SettingsRepository", () => ({
    SettingsRepository: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getSettings: vi.fn().mockResolvedValue({}),
        updateSettings: vi.fn().mockResolvedValue(undefined),
        resetSettings: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true)
    })),
}));

vi.mock("../../services/database/SiteRepository", () => ({
    SiteRepository: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getAllSites: vi.fn().mockResolvedValue([]),
        createSite: vi.fn().mockResolvedValue(undefined),
        updateSite: vi.fn().mockResolvedValue(undefined),
        deleteSite: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true)
    })),
}));

// Mock ConfigurationManager
vi.mock("../../managers/ConfigurationManager", () => ({
    ConfigurationManager: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getConfig: vi.fn().mockReturnValue({}),
        updateConfig: vi.fn().mockResolvedValue(undefined),
        resetConfig: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true)
    })),
}));

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

// Mock UptimeOrchestrator
vi.mock("../../UptimeOrchestrator", () => ({
    UptimeOrchestrator: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        start: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn().mockResolvedValue(undefined),
        restart: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
        emitTyped: vi.fn().mockResolvedValue(undefined)
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
