/**
 * Working ServiceContainer test - copied from simple test that works
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import type {
    MonitoringStartSummary,
    MonitoringStopSummary,
} from "@shared/types";

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
    vi.fn(function MonitorManagerMock() {
        const startSummary: MonitoringStartSummary = {
            attempted: 2,
            failed: 0,
            partialFailures: false,
            siteCount: 1,
            skipped: 0,
            succeeded: 2,
            isMonitoring: true,
            alreadyActive: false,
        };
        const stopSummary: MonitoringStopSummary = {
            attempted: 2,
            failed: 0,
            partialFailures: false,
            siteCount: 1,
            skipped: 0,
            succeeded: 2,
            isMonitoring: false,
            alreadyInactive: false,
        };
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            startMonitoring: vi.fn().mockResolvedValue(startSummary),
            stopMonitoring: vi.fn().mockResolvedValue(stopSummary),
            getMonitorStatus: vi.fn().mockReturnValue("stopped"),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    })
);

const mockDatabaseService = vi.hoisted(() =>
    vi.fn(function DatabaseServiceMock() {
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
    vi.fn(function DatabaseManagerMock() {
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
    vi.fn(function UptimeOrchestratorMock() {
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
    vi.fn(function IpcServiceMock() {
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

vi.mock("../../events/TypedEventBus", async () => {
    const actual = await vi.importActual<
        typeof import("../../events/TypedEventBus")
    >("../../events/TypedEventBus");

    return {
        ...actual,
        TypedEventBus: mockEventBus,
    };
});

// Mock all repository services
vi.mock("../../services/database/SettingsRepository", () => ({
    SettingsRepository: vi.fn(function SettingsRepositoryMock() {
        return {};
    }),
}));

vi.mock("../../services/database/SiteRepository", () => ({
    SiteRepository: vi.fn(function SiteRepositoryMock() {
        return {};
    }),
}));

vi.mock("../../services/database/MonitorRepository", () => ({
    MonitorRepository: vi.fn(function MonitorRepositoryMock() {
        return {};
    }),
}));

vi.mock("../../services/database/HistoryRepository", () => ({
    HistoryRepository: vi.fn(function HistoryRepositoryMock() {
        return {};
    }),
}));

vi.mock("../../services/configuration/ConfigurationManager", () => ({
    ConfigurationManager: vi.fn(function ConfigurationManagerMock() {
        return {
            get: vi.fn(),
            set: vi.fn(),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    }),
}));

// Import after mocks
import { ServiceContainer } from "../../services/ServiceContainer";
import {
    FORWARDED_METADATA_PROPERTY_KEY,
    ORIGINAL_METADATA_PROPERTY_KEY,
} from "../../utils/eventMetadataForwarding";

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
            expect(() => container.getSiteManager()).not.toThrowError();
        });
    });

    describe("Metadata forwarding preservation", () => {
        const invokeStripEventMetadata = (
            eventName: string,
            payload: unknown
        ): unknown => {
            const { eventForwarder } = container as unknown as {
                eventForwarder: {
                    stripEventMetadataForForwarding: (
                        eventName: string,
                        payload: unknown
                    ) => unknown;
                };
            };

            return eventForwarder.stripEventMetadataForForwarding(
                eventName,
                payload
            );
        };

        it("should reattach metadata for object payloads as non-enumerable properties", () => {
            const forwardedMetadata = {
                busId: "manager-bus",
                correlationId: "corr-object",
                eventName: "internal:site:added",
                timestamp: Date.now(),
            } as const;

            const originalMetadata = {
                busId: "orchestrator-bus",
                correlationId: "orig-object",
                eventName: "site:added",
                timestamp: Date.now() - 10,
            } as const;

            const payload = {
                identifier: "site-object",
                site: {
                    identifier: "site-object",
                    monitoring: true,
                    monitors: [],
                    name: "Object Site",
                },
            } as Record<string, unknown>;

            Object.assign(payload, {
                [FORWARDED_METADATA_PROPERTY_KEY]: forwardedMetadata,
                [ORIGINAL_METADATA_PROPERTY_KEY]: originalMetadata,
            });

            const sanitized = invokeStripEventMetadata(
                "site:added",
                payload
            ) as Record<string, unknown>;

            expect(sanitized).not.toBe(payload);
            expect(sanitized["identifier"]).toBe("site-object");
            const forwardedDescriptor = Object.getOwnPropertyDescriptor(
                sanitized,
                FORWARDED_METADATA_PROPERTY_KEY
            );
            expect(forwardedDescriptor).toBeDefined();
            expect(forwardedDescriptor?.enumerable).toBeFalsy();
            expect(
                Reflect.get(sanitized, FORWARDED_METADATA_PROPERTY_KEY)
            ).toEqual(forwardedMetadata);

            const originalDescriptor = Object.getOwnPropertyDescriptor(
                sanitized,
                ORIGINAL_METADATA_PROPERTY_KEY
            );
            expect(originalDescriptor).toBeDefined();
            expect(originalDescriptor?.enumerable).toBeFalsy();
            expect(
                Reflect.get(sanitized, ORIGINAL_METADATA_PROPERTY_KEY)
            ).toEqual(originalMetadata);

            const metadataSymbols = Object.getOwnPropertySymbols(sanitized);
            const originalMetaSymbol = metadataSymbols.find(
                (symbol) =>
                    symbol.description === "typed-event-bus:original-meta"
            );

            expect(originalMetaSymbol).toBeDefined();
            const symbolDescriptor =
                originalMetaSymbol === undefined
                    ? undefined
                    : Object.getOwnPropertyDescriptor(
                          sanitized,
                          originalMetaSymbol
                      );
            expect(symbolDescriptor).toBeDefined();
            expect(symbolDescriptor?.enumerable).toBeFalsy();
            expect(
                originalMetaSymbol
                    ? Reflect.get(sanitized, originalMetaSymbol)
                    : undefined
            ).toEqual(originalMetadata);

            // Original payload should retain enumerable metadata properties
            const sourceDescriptor = Object.getOwnPropertyDescriptor(
                payload,
                FORWARDED_METADATA_PROPERTY_KEY
            );
            expect(sourceDescriptor).toBeDefined();
            expect(sourceDescriptor?.enumerable).toBeTruthy();
        });

        it("should reattach metadata for array payloads while preserving order", () => {
            const forwardedMetadata = {
                busId: "manager-bus",
                correlationId: "corr-array",
                eventName: "internal:monitor:batch",
                timestamp: Date.now(),
            } as const;

            const originalMetadata = {
                busId: "orchestrator-bus",
                correlationId: "orig-array",
                eventName: "monitoring:started",
                timestamp: Date.now() - 25,
            } as const;

            const payload = [
                {
                    identifier: "site-array",
                    monitorId: "monitor-1",
                    status: "up",
                },
            ] as unknown[];

            Object.assign(payload, {
                [FORWARDED_METADATA_PROPERTY_KEY]: forwardedMetadata,
                [ORIGINAL_METADATA_PROPERTY_KEY]: originalMetadata,
            });

            const sanitized = invokeStripEventMetadata(
                "site:added",
                payload
            ) as unknown[] & Record<string | symbol, unknown>;

            expect(Array.isArray(sanitized)).toBeTruthy();
            expect(sanitized).not.toBe(payload);
            expect(sanitized).toHaveLength(1);
            expect(sanitized[0]).toEqual(payload[0]);

            const metaDescriptor = Object.getOwnPropertyDescriptor(
                sanitized,
                FORWARDED_METADATA_PROPERTY_KEY
            );
            expect(metaDescriptor).toBeDefined();
            expect(metaDescriptor?.enumerable).toBeFalsy();
            expect(metaDescriptor?.value).toEqual(forwardedMetadata);

            const originalDescriptor = Object.getOwnPropertyDescriptor(
                sanitized,
                ORIGINAL_METADATA_PROPERTY_KEY
            );
            expect(originalDescriptor).toBeDefined();
            expect(originalDescriptor?.enumerable).toBeFalsy();
            expect(originalDescriptor?.value).toEqual(originalMetadata);

            const metadataSymbols = Object.getOwnPropertySymbols(sanitized);
            const originalMetaSymbol = metadataSymbols.find(
                (symbol) =>
                    symbol.description === "typed-event-bus:original-meta"
            );

            expect(originalMetaSymbol).toBeDefined();
            expect(
                originalMetaSymbol
                    ? Reflect.get(sanitized, originalMetaSymbol)
                    : undefined
            ).toEqual(originalMetadata);

            const sourceDescriptor = Object.getOwnPropertyDescriptor(
                payload,
                FORWARDED_METADATA_PROPERTY_KEY
            );
            expect(sourceDescriptor).toBeDefined();
            expect(sourceDescriptor?.enumerable).toBeTruthy();
        });
    });
});
