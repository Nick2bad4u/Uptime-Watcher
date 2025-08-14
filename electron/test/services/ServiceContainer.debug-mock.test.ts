/**
 * Debug test to understand TypedEventBus mocking differences
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Use the same mocking approach as the working targeted test
vi.mock("../events/TypedEventBus", () => {
    console.log("Mock being applied for ../events/TypedEventBus");
    // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module -- Required for mock
    const { EventEmitter } = require("node:events");
    
    return {
        TypedEventBus: vi.fn().mockImplementation((name?: string) => {
            console.log(`Creating TypedEventBus instance for: ${name || 'unnamed'}`);
            // Create an actual EventEmitter instance
            // eslint-disable-next-line unicorn/prefer-event-target -- Required for Node.js EventEmitter compatibility
            const eventEmitter = new EventEmitter();
            
            // Add TypedEventBus-specific methods
            const mockInstance = Object.assign(eventEmitter, {
                onTyped: vi.fn(),
                emitTyped: vi.fn().mockResolvedValue(undefined),
                busId: name || "test-bus",
                destroy: vi.fn(),
            });
            
            console.log("Mock TypedEventBus instance created with on method:", typeof mockInstance.on);
            return mockInstance;
        }),
    };
});

// Mock logger
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock other dependencies with minimal stubs
vi.mock("../../managers/ConfigurationManager", () => ({
    ConfigurationManager: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        getConfig: vi.fn().mockReturnValue({}),
    })),
}));

vi.mock("../../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: vi.fn().mockReturnValue({
            initialize: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        })
    },
}));

vi.mock("../../services/database/HistoryRepository", () => ({
    HistoryRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../services/database/MonitorRepository", () => ({
    MonitorRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../services/database/SettingsRepository", () => ({
    SettingsRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../services/database/SiteRepository", () => ({
    SiteRepository: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("../../managers/SiteManager", () => ({
    SiteManager: vi.fn().mockImplementation(() => ({
        getSitesCache: vi.fn().mockReturnValue(new Map()),
        getEventBus: vi.fn().mockReturnValue({
            emit: vi.fn(),
            on: vi.fn().mockReturnValue(undefined),
            off: vi.fn(),
            once: vi.fn(),
            removeListener: vi.fn(),
            removeAllListeners: vi.fn(),
            listeners: vi.fn().mockReturnValue([]),
            addListener: vi.fn(),
            emitTyped: vi.fn().mockResolvedValue(undefined),
            onTyped: vi.fn(),
            busId: "test-site-manager-bus",
            destroy: vi.fn(),
        }),
        initialize: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    })),
}));

// Import after mocks
import { ServiceContainer } from "../../services/ServiceContainer";

describe("ServiceContainer - Debug Mock Test", () => {
    let serviceContainer: ServiceContainer;

    beforeEach(() => {
        vi.clearAllMocks();
        console.log("Setting up test...");
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
        vi.clearAllMocks();
    });

    it("should create ServiceContainer and test SiteManager creation", async () => {
        console.log("Creating ServiceContainer instance...");
        serviceContainer = ServiceContainer.getInstance();
        
        console.log("Creating SiteManager...");
        const siteManager = serviceContainer.getSiteManager();
        
        console.log("SiteManager created successfully:", !!siteManager);
        expect(siteManager).toBeDefined();
    });
});
