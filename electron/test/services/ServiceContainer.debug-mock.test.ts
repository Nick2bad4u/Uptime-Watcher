/**
 * Debug test to understand TypedEventBus mocking differences
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function createConstructableMock<T extends object>(
    instance: T,
    name: string
): new () => T {
    function Constructable(this: unknown): T {
        return instance;
    }

    Object.defineProperty(Constructable, "name", { value: name });

    return Constructable as unknown as new () => T;
}

// Use the same mocking approach as the working targeted test
const typedEventBusMocks = vi.hoisted(() => {
    const typedEventBusInstance = {
        on: vi.fn(),
        once: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
        removeListener: vi.fn(),
        removeAllListeners: vi.fn(),
        listeners: vi.fn().mockReturnValue([] as unknown[]),
        addListener: vi.fn(),
        onTyped: vi.fn(),
        emitTyped: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn(),
        busId: "test-bus",
    };

    return {
        MockTypedEventBus: createConstructableMock(
            typedEventBusInstance,
            "MockTypedEventBus"
        ),
        typedEventBusInstance,
    };
});

vi.mock("../events/TypedEventBus", () => {
    console.log("Mock being applied for ../events/TypedEventBus");
    return {
        TypedEventBus: typedEventBusMocks.MockTypedEventBus,
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
    diagnosticsLogger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock other dependencies with minimal stubs
const managerMocks = vi.hoisted(() => {
    const mockConfigurationManager = {
        initialize: vi.fn().mockResolvedValue(undefined),
        getConfig: vi.fn().mockReturnValue({}),
    };

    const mockHistoryRepository = {};
    const mockMonitorRepository = {};
    const mockSettingsRepository = {};
    const mockSiteRepository = {};

    const mockSiteManager = {
        getSitesCache: vi.fn().mockReturnValue(new Map()),
        getEventBus: vi.fn().mockReturnValue({
            ...typedEventBusMocks.typedEventBusInstance,
            busId: "test-site-manager-bus",
        }),
        initialize: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
    };

    const mockUptimeOrchestrator = {
        initialize: vi.fn().mockResolvedValue(undefined),
        start: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn().mockResolvedValue(undefined),
        restart: vi.fn().mockResolvedValue(undefined),
        isInitialized: vi.fn().mockReturnValue(true),
        emitTyped: vi.fn().mockResolvedValue(undefined),
    };

    return {
        MockConfigurationManager: createConstructableMock(
            mockConfigurationManager,
            "MockConfigurationManager"
        ),
        MockHistoryRepository: createConstructableMock(
            mockHistoryRepository,
            "MockHistoryRepository"
        ),
        MockMonitorRepository: createConstructableMock(
            mockMonitorRepository,
            "MockMonitorRepository"
        ),
        MockSettingsRepository: createConstructableMock(
            mockSettingsRepository,
            "MockSettingsRepository"
        ),
        MockSiteManager: createConstructableMock(
            mockSiteManager,
            "MockSiteManager"
        ),
        MockSiteRepository: createConstructableMock(
            mockSiteRepository,
            "MockSiteRepository"
        ),
        MockUptimeOrchestrator: createConstructableMock(
            mockUptimeOrchestrator,
            "MockUptimeOrchestrator"
        ),
    };
});

vi.mock("../../managers/ConfigurationManager", () => ({
    ConfigurationManager: managerMocks.MockConfigurationManager,
}));

vi.mock("../../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: vi.fn().mockReturnValue({
            initialize: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        }),
    },
}));

vi.mock("../../services/database/HistoryRepository", () => ({
    HistoryRepository: managerMocks.MockHistoryRepository,
}));

vi.mock("../../services/database/MonitorRepository", () => ({
    MonitorRepository: managerMocks.MockMonitorRepository,
}));

vi.mock("../../services/database/SettingsRepository", () => ({
    SettingsRepository: managerMocks.MockSettingsRepository,
}));

vi.mock("../../services/database/SiteRepository", () => ({
    SiteRepository: managerMocks.MockSiteRepository,
}));

vi.mock("../../managers/SiteManager", () => ({
    SiteManager: managerMocks.MockSiteManager,
}));

vi.mock("../../UptimeOrchestrator", () => ({
    UptimeOrchestrator: managerMocks.MockUptimeOrchestrator,
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

    it("should create ServiceContainer and test SiteManager creation", async ({
        annotate,
    }) => {
        await annotate("Component: ServiceContainer.debug-mock", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Constructor", "type");

        console.log("Creating ServiceContainer instance...");
        serviceContainer = ServiceContainer.getInstance();

        const siteManager = serviceContainer.getSiteManager();

        console.log("SiteManager created successfully:", Boolean(siteManager));
        expect(siteManager).toBeDefined();
    });
});
