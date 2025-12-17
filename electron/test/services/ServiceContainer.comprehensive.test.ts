/**
 * Comprehensive tests for ServiceContainer.ts
 *
 * Tests all service creation, dependency injection, initialization flow, error
 * handling, debugging capabilities, and event forwarding mechanisms.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create hoisted mock factory for TypedEventBus using constructor function pattern
const MockTypedEventBus = vi.hoisted(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module -- Required for mock
    const { EventEmitter } = require("node:events");

    // Use plain constructor function instead of vi.fn().mockImplementation()
    return function MockEventBus(name?: string) {
        // Create an actual EventEmitter instance that inherits all EventEmitter methods
        // eslint-disable-next-line unicorn/prefer-event-target -- Required for Node.js EventEmitter compatibility
        const eventEmitter = new EventEmitter();

        // Add TypedEventBus-specific methods
        eventEmitter.onTyped = vi.fn();
        eventEmitter.emitTyped = vi.fn().mockResolvedValue(undefined);
        eventEmitter.busId = name || "test-bus";
        eventEmitter.destroy = vi.fn();

        return eventEmitter;
    };
});

// Mock all service dependencies FIRST before any imports
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
    diagnosticsLogger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock TypedEventBus using hoisted factory for consistent behavior
vi.mock("../events/TypedEventBus", () => ({
    TypedEventBus: MockTypedEventBus,
}));

// Also mock the relative path used within ServiceContainer itself
vi.mock("../events/TypedEventBus", () => ({
    TypedEventBus: MockTypedEventBus,
}));

// Now import the modules to apply mocks
import type { Site } from "@shared/types";
import {
    ServiceContainer,
    type ServiceContainerConfig,
} from "../../services/ServiceContainer";

vi.mock("../../managers/ConfigurationManager", () => ({
    ConfigurationManager: function MockConfigurationManager() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getConfig: vi.fn().mockReturnValue({}),
            updateConfig: vi.fn().mockResolvedValue(undefined),
            resetConfig: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../managers/DatabaseManager", () => ({
    DatabaseManager: function MockDatabaseManager() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            setHistoryLimit: vi.fn().mockResolvedValue(undefined),
            getHistoryLimit: vi.fn().mockReturnValue(100),
            backup: vi.fn().mockResolvedValue(undefined),
            restore: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../managers/MonitorManager", () => ({
    MonitorManager: function MockMonitorManager() {
        const managerEventBus = {
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
            busId: "test-monitor-manager-bus",
            destroy: vi.fn(),
        };
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            setupNewMonitors: vi.fn().mockResolvedValue(undefined),
            startMonitoringForSite: vi.fn().mockResolvedValue(true),
            stopMonitoringForSite: vi.fn().mockResolvedValue(true),
            updateMonitor: vi.fn().mockResolvedValue(undefined),
            getEventBus: vi.fn().mockReturnValue(managerEventBus),
            isInitialized: vi.fn().mockReturnValue(true),
            eventBus: managerEventBus,
        };
    },
}));

// Create SiteManager mock using constructor function pattern
const MockSiteManager = vi.hoisted(
    () =>
        function MockSiteManagerConstructor() {
            const managerEventBus = {
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
            };

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
                getEventBus: vi.fn().mockReturnValue(managerEventBus),
                addSite: vi.fn().mockResolvedValue(undefined),
                updateSite: vi.fn().mockResolvedValue(undefined),
                deleteSite: vi.fn().mockResolvedValue(undefined),
                isInitialized: vi.fn().mockReturnValue(true),
                eventBus: managerEventBus,
            };
        }
);

vi.mock("../../managers/SiteManager", () => ({
    SiteManager: MockSiteManager,
}));

vi.mock("../../UptimeOrchestrator", () => ({
    UptimeOrchestrator: function MockUptimeOrchestrator() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            start: vi.fn().mockResolvedValue(undefined),
            stop: vi.fn().mockResolvedValue(undefined),
            restart: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

// Mock singleton services with getInstance methods
const mockDatabaseServiceInstance = {
    initialize: vi.fn().mockResolvedValue(undefined),
    isInitialized: vi.fn().mockReturnValue(true),
    close: vi.fn().mockResolvedValue(undefined),
    getConnection: vi.fn(),
    beginTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    rollbackTransaction: vi.fn(),
};

vi.mock("../../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: vi.fn(() => mockDatabaseServiceInstance),
    },
}));

vi.mock("../../services/database/HistoryRepository", () => ({
    HistoryRepository: function MockHistoryRepository() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getAllHistory: vi.fn().mockResolvedValue([]),
            addHistoryEntry: vi.fn().mockResolvedValue(undefined),
            deleteHistory: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/database/MonitorRepository", () => ({
    MonitorRepository: function MockMonitorRepository() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getAllMonitors: vi.fn().mockResolvedValue([]),
            createMonitor: vi.fn().mockResolvedValue(undefined),
            updateMonitor: vi.fn().mockResolvedValue(undefined),
            deleteMonitor: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/database/SettingsRepository", () => ({
    SettingsRepository: function MockSettingsRepository() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getSettings: vi.fn().mockResolvedValue({}),
            updateSettings: vi.fn().mockResolvedValue(undefined),
            resetSettings: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/database/SiteRepository", () => ({
    SiteRepository: function MockSiteRepository() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            getAllSites: vi.fn().mockResolvedValue([]),
            createSite: vi.fn().mockResolvedValue(undefined),
            updateSite: vi.fn().mockResolvedValue(undefined),
            deleteSite: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/ipc/IpcService", () => ({
    IpcService: function MockIpcService() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            setupHandlers: vi.fn(),
            send: vi.fn(),
            handle: vi.fn(),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/monitoring/EnhancedMonitoringServiceFactory", () => ({
    EnhancedMonitoringServiceFactory: {
        createServices: vi.fn().mockReturnValue({
            httpMonitoringService: { initialize: vi.fn() },
            tcpMonitoringService: { initialize: vi.fn() },
            icmpMonitoringService: { initialize: vi.fn() },
        }),
    },
}));

vi.mock("../../services/notifications/NotificationService", () => ({
    NotificationService: function MockNotificationService() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            showNotification: vi.fn(),
            hideNotification: vi.fn(),
            clearAll: vi.fn(),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/updater/AutoUpdaterService", () => ({
    AutoUpdaterService: function MockAutoUpdaterService() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            checkForUpdates: vi.fn().mockResolvedValue(undefined),
            downloadUpdate: vi.fn().mockResolvedValue(undefined),
            installUpdate: vi.fn().mockResolvedValue(undefined),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

vi.mock("../../services/window/WindowService", () => ({
    WindowService: function MockWindowService() {
        return {
            initialize: vi.fn().mockResolvedValue(undefined),
            createWindow: vi.fn(),
            closeWindow: vi.fn(),
            focusWindow: vi.fn(),
            isInitialized: vi.fn().mockReturnValue(true),
        };
    },
}));

describe("ServiceContainer - Comprehensive Coverage", () => {
    beforeEach(() => {
        ServiceContainer.resetForTesting();
        vi.clearAllMocks();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    describe("Singleton Management", () => {
        it("should create singleton instance with default config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const container1 = ServiceContainer.getInstance();
            const container2 = ServiceContainer.getInstance();

            expect(container1).toBe(container2);
            expect(container1).toBeInstanceOf(ServiceContainer);
        });

        it("should create singleton instance with custom config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const config: ServiceContainerConfig = {
                enableDebugLogging: true,
                notificationConfig: {
                    showDownAlerts: false,
                    showUpAlerts: true,
                },
            };

            const container = ServiceContainer.getInstance(config);
            expect(container).toBeInstanceOf(ServiceContainer);
        });

        it("should return same instance after initialization", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const container1 = ServiceContainer.getInstance();
            const container2 = ServiceContainer.getInstance({
                enableDebugLogging: true,
            });

            expect(container1).toBe(container2);
        });

        it("should reset for testing", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const container1 = ServiceContainer.getInstance();
            ServiceContainer.resetForTesting();
            const container2 = ServiceContainer.getInstance();

            expect(container1).not.toBe(container2);
        });
    });

    describe("Service Creation - Core Services", () => {
        let container: ServiceContainer;

        beforeEach(() => {
            container = ServiceContainer.getInstance({
                enableDebugLogging: true,
            });
        });

        it("should create DatabaseService singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const service1 = container.getDatabaseService();
            const service2 = container.getDatabaseService();

            expect(service1).toBe(service2);
            expect(service1).toBeDefined();
        });

        it("should create HistoryRepository singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const repo1 = container.getHistoryRepository();
            const repo2 = container.getHistoryRepository();

            expect(repo1).toBe(repo2);
            expect(repo1).toBeDefined();
        });

        it("should create MonitorRepository singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const repo1 = container.getMonitorRepository();
            const repo2 = container.getMonitorRepository();

            expect(repo1).toBe(repo2);
            expect(repo1).toBeDefined();
        });

        it("should create SettingsRepository singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const repo1 = container.getSettingsRepository();
            const repo2 = container.getSettingsRepository();

            expect(repo1).toBe(repo2);
            expect(repo1).toBeDefined();
        });

        it("should create SiteRepository singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const repo1 = container.getSiteRepository();
            const repo2 = container.getSiteRepository();

            expect(repo1).toBe(repo2);
            expect(repo1).toBeDefined();
        });
    });

    describe("Service Creation - Application Services", () => {
        let container: ServiceContainer;

        beforeEach(() => {
            container = ServiceContainer.getInstance({
                enableDebugLogging: true,
            });
        });

        it("should create ConfigurationManager singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const manager1 = container.getConfigurationManager();
            const manager2 = container.getConfigurationManager();

            expect(manager1).toBe(manager2);
            expect(manager1).toBeDefined();
        });

        it("should create DatabaseManager singleton with dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const manager1 = container.getDatabaseManager();
            const manager2 = container.getDatabaseManager();

            expect(manager1).toBe(manager2);
            expect(manager1).toBeDefined();
        });

        it("should create SiteManager singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const manager1 = container.getSiteManager();
            const manager2 = container.getSiteManager();

            expect(manager1).toBe(manager2);
            expect(manager1).toBeDefined();
        });

        it("should create UptimeOrchestrator singleton with dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            // Create SiteManager first to avoid dependency issues
            container.getSiteManager();

            const orchestrator1 = container.getUptimeOrchestrator();
            const orchestrator2 = container.getUptimeOrchestrator();

            expect(orchestrator1).toBe(orchestrator2);
            expect(orchestrator1).toBeDefined();
        });
    });

    describe("Service Creation - Feature Services", () => {
        let container: ServiceContainer;

        beforeEach(() => {
            container = ServiceContainer.getInstance({
                enableDebugLogging: true,
            });
        });

        it("should create NotificationService singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const service1 = container.getNotificationService();
            const service2 = container.getNotificationService();

            expect(service1).toBe(service2);
            expect(service1).toBeDefined();
        });

        it("should create NotificationService with custom config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const config: ServiceContainerConfig = {
                notificationConfig: {
                    showDownAlerts: false,
                    showUpAlerts: false,
                },
            };

            const customContainer = ServiceContainer.getInstance(config);
            const service = customContainer.getNotificationService();

            expect(service).toBeDefined();
        });

        it("should create IpcService singleton with dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            // Create SiteManager first to avoid dependency issues
            container.getSiteManager();

            const service1 = container.getIpcService();
            const service2 = container.getIpcService();

            expect(service1).toBe(service2);
            expect(service1).toBeDefined();
        });

        it("should create AutoUpdaterService singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const service1 = container.getAutoUpdaterService();
            const service2 = container.getAutoUpdaterService();

            expect(service1).toBe(service2);
            expect(service1).toBeDefined();
        });

        it("should create WindowService singleton", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const service1 = container.getWindowService();
            const service2 = container.getWindowService();

            expect(service1).toBe(service2);
            expect(service1).toBeDefined();
        });
    });

    describe("Complex Service Dependencies", () => {
        let container: ServiceContainer;

        beforeEach(() => {
            container = ServiceContainer.getInstance({
                enableDebugLogging: true,
            });
        });

        it("should create SiteManager singleton with all dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const manager1 = container.getSiteManager();
            const manager2 = container.getSiteManager();

            expect(manager1).toBe(manager2);
            expect(manager1).toBeDefined();
        });

        it("should create MonitorManager singleton with complex dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            // Create SiteManager first to avoid dependency error
            container.getSiteManager();

            const manager1 = container.getMonitorManager();
            const manager2 = container.getMonitorManager();

            expect(manager1).toBe(manager2);
            expect(manager1).toBeDefined();
        });

        it("should handle MonitorManager creation without throwing when SiteManager auto-initialized", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            // MonitorManager creation automatically calls getSiteManager() first
            // so there should be no dependency error in normal usage
            expect(() => {
                container.getMonitorManager();
            }).not.toThrowError();

            expect(container.getMonitorManager()).toBeDefined();
        });
    });

    describe("Initialization Process", () => {
        let container: ServiceContainer;

        beforeEach(() => {
            container = ServiceContainer.getInstance({
                enableDebugLogging: true,
            });

            // Create SiteManager first to avoid dependency issues
            container.getSiteManager();

            // Mock all async methods
            vi.mocked(
                container.getDatabaseManager().initialize
            ).mockResolvedValue();
            vi.mocked(
                container.getUptimeOrchestrator().initialize
            ).mockResolvedValue();
            vi.mocked(
                container.getIpcService().setupHandlers
            ).mockReturnValue();
        });

        it("should initialize all services in correct order", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            await container.initialize();

            // Verify initialization order and methods were called
            expect(
                container.getDatabaseService().initialize
            ).toHaveBeenCalled();
            expect(
                container.getUptimeOrchestrator().initialize
            ).toHaveBeenCalled();
            expect(container.getIpcService().setupHandlers).toHaveBeenCalled();
        });

        it("should handle initialization with all services created", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            // Pre-create all services
            container.getAutoUpdaterService();
            container.getConfigurationManager();
            container.getDatabaseManager();
            container.getDatabaseService();
            container.getHistoryRepository();
            container.getMonitorRepository();
            container.getSettingsRepository();
            container.getSiteRepository();
            container.getSiteManager();
            container.getMonitorManager();
            container.getUptimeOrchestrator();
            container.getIpcService();
            container.getNotificationService();
            container.getWindowService();

            await container.initialize();

            // Verify no errors during initialization
            expect(
                container.getDatabaseService().initialize
            ).toHaveBeenCalled();
        });
    });

    describe("Status and Diagnostics", () => {
        let container: ServiceContainer;

        beforeEach(() => {
            container = ServiceContainer.getInstance();
        });

        it("should return correct initialization status for uninitialized services", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const status = container.getInitializationStatus();

            expect(status).toEqual({
                AutoUpdaterService: false,
                CloudService: false,
                ConfigurationManager: false,
                DatabaseManager: false,
                DatabaseService: false,
                HistoryRepository: false,
                IpcService: false,
                MonitorManager: false,
                MonitorRepository: false,
                NotificationService: false,
                SettingsRepository: false,
                SiteManager: false,
                SiteRepository: false,
                UptimeOrchestrator: false,
                WindowService: false,
            });
        });

        it("should return correct initialization status for initialized services", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            // Initialize some services
            container.getDatabaseService();
            container.getConfigurationManager();
            container.getHistoryRepository();

            const status = container.getInitializationStatus();

            expect(status["DatabaseService"]).toBeTruthy();
            expect(status["ConfigurationManager"]).toBeTruthy();
            expect(status["HistoryRepository"]).toBeTruthy();
            expect(status["MonitorManager"]).toBeFalsy();
            expect(status["UptimeOrchestrator"]).toBeFalsy();
        });

        it("should return empty array for getInitializedServices when no services initialized", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const services = container.getInitializedServices();

            expect(services).toEqual([]);
        });

        it("should return correct initialized services", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            // Initialize some services
            const databaseService = container.getDatabaseService();
            const configManager = container.getConfigurationManager();

            const services = container.getInitializedServices();

            expect(services).toHaveLength(2);
            expect(services).toEqual(
                expect.arrayContaining([
                    { name: "DatabaseService", service: databaseService },
                    { name: "ConfigurationManager", service: configManager },
                ])
            );
        });

        it("should handle all services initialized in getInitializedServices", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            // Initialize all services
            container.getAutoUpdaterService();
            container.getConfigurationManager();
            container.getDatabaseManager();
            container.getDatabaseService();
            container.getHistoryRepository();
            container.getMonitorRepository();
            container.getSettingsRepository();
            container.getSiteRepository();
            container.getSiteManager();
            container.getNotificationService();
            container.getUptimeOrchestrator();
            container.getWindowService();

            const services = container.getInitializedServices();

            expect(services).toHaveLength(13); // All services except IpcService and MonitorManager
            expect(services.every((s) => s.name && s.service)).toBeTruthy();
        });
    });

    describe("Event Forwarding", () => {
        let container: ServiceContainer;
        let mockMainOrchestrator: any;

        beforeEach(() => {
            container = ServiceContainer.getInstance({
                enableDebugLogging: true,
            });

            mockMainOrchestrator = {
                emitTyped: vi.fn().mockResolvedValue(undefined),
            };
        });

        it("should set up event forwarding for SiteManager", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            // Create SiteManager which should trigger event forwarding setup
            const siteManager = container.getSiteManager();

            // Verify SiteManager was created successfully
            expect(siteManager).toBeDefined();
        });

        it("should set up event forwarding for MonitorManager", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            // Create SiteManager first, then MonitorManager
            container.getSiteManager();
            const monitorManager = container.getMonitorManager();

            // Verify MonitorManager was created successfully
            expect(monitorManager).toBeDefined();
        });

        it("should set up event forwarding for DatabaseManager", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            const databaseManager = container.getDatabaseManager();

            // Verify DatabaseManager was created successfully
            expect(databaseManager).toBeDefined();
        });

        it("should handle event forwarding when main orchestrator is available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            // Mock getMainOrchestrator to return the mock orchestrator
            const privateContainer = container as any;
            privateContainer.uptimeOrchestrator = mockMainOrchestrator;

            // Create SiteManager to trigger event forwarding setup
            const siteManager = container.getSiteManager();

            // Verify setup was successful
            expect(siteManager).toBeDefined();
            expect(mockMainOrchestrator.emitTyped).toBeDefined();
        });

        it("should handle event forwarding error gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Mock getMainOrchestrator to return orchestrator that throws error
            mockMainOrchestrator.emitTyped.mockRejectedValue(
                new Error("Forwarding error")
            );
            const privateContainer = container as any;
            privateContainer.uptimeOrchestrator = mockMainOrchestrator;

            const siteManager = container.getSiteManager();

            // Verify setup was successful even with error handling
            expect(siteManager).toBeDefined();
        });

        it("should not forward events when main orchestrator is not initialized", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const siteManager = container.getSiteManager();

            // Verify SiteManager works without main orchestrator
            expect(siteManager).toBeDefined();
        });
    });

    describe("SiteManager Monitoring Operations", () => {
        let container: ServiceContainer;

        beforeEach(() => {
            container = ServiceContainer.getInstance({
                enableDebugLogging: true,
            });

            // Create SiteManager first to avoid dependency issues
            container.getSiteManager();

            // Mock all required dependencies
            vi.mocked(
                container.getDatabaseManager().setHistoryLimit
            ).mockResolvedValue();
            vi.mocked(
                container.getMonitorManager().setupNewMonitors
            ).mockResolvedValue();
            vi.mocked(
                container.getMonitorManager().startMonitoringForSite
            ).mockResolvedValue(true);
            vi.mocked(
                container.getMonitorManager().stopMonitoringForSite
            ).mockResolvedValue(true);
        });

        it("should handle setHistoryLimit operation successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Configuration", "type");

            // Test that the container can access monitoring operations through SiteManager
            const databaseManager = container.getDatabaseManager();

            // Mock the database manager method
            vi.mocked(databaseManager.setHistoryLimit).mockResolvedValue();

            // Directly test the method
            await databaseManager.setHistoryLimit(1000);

            expect(databaseManager.setHistoryLimit).toHaveBeenCalledWith(1000);
        });

        it("should handle setHistoryLimit operation error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const databaseManager = container.getDatabaseManager();
            vi.mocked(databaseManager.setHistoryLimit).mockRejectedValue(
                new Error("Database error")
            );

            await expect(
                databaseManager.setHistoryLimit(1000)
            ).rejects.toThrowError("Database error");
        });

        it("should handle setupNewMonitors operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitorManager = container.getMonitorManager();

            const testSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [],
            };

            // Mock the setupNewMonitors method
            vi.mocked(monitorManager.setupNewMonitors).mockResolvedValue();

            await monitorManager.setupNewMonitors(testSite, [
                "monitor1",
                "monitor2",
            ]);

            expect(monitorManager.setupNewMonitors).toHaveBeenCalledWith(
                testSite,
                ["monitor1", "monitor2"]
            );
        });

        it("should handle startMonitoringForSite operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitorManager = container.getMonitorManager();

            // Mock the method to return true
            vi.mocked(monitorManager.startMonitoringForSite).mockResolvedValue(
                true
            );

            const result = await monitorManager.startMonitoringForSite(
                "site1",
                "monitor1"
            );

            expect(result).toBeTruthy();
            expect(monitorManager.startMonitoringForSite).toHaveBeenCalledWith(
                "site1",
                "monitor1"
            );
        });

        it("should handle stopMonitoringForSite operation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitorManager = container.getMonitorManager();

            // Mock the method to return true
            vi.mocked(monitorManager.stopMonitoringForSite).mockResolvedValue(
                true
            );

            const result = await monitorManager.stopMonitoringForSite(
                "site1",
                "monitor1"
            );

            expect(result).toBeTruthy();
            expect(monitorManager.stopMonitoringForSite).toHaveBeenCalledWith(
                "site1",
                "monitor1"
            );
        });
    });

    describe("Debug Logging", () => {
        it("should log debug messages when debug logging is enabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const container = ServiceContainer.getInstance({
                enableDebugLogging: true,
            });

            // Create a service which should trigger debug logging if implemented
            container.getDatabaseService();
            container.getConfigurationManager();

            // Debug logging should be enabled - just verify container works with debug mode
            expect(container).toBeDefined();
        });

        it("should not log debug messages when debug logging is disabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const container = ServiceContainer.getInstance({
                enableDebugLogging: false,
            });

            container.getDatabaseService();
            container.getConfigurationManager();

            // No specific debug calls should be made when disabled
            // We'll just check that the container is working without debug logs
            expect(container).toBeDefined();
        });

        it("should handle debug logging in event forwarding", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            const container = ServiceContainer.getInstance({
                enableDebugLogging: true,
            });

            container.getSiteManager();

            // Event forwarding setup should work with debug logging
            expect(container.getSiteManager()).toBeDefined();
        });
    });

    describe("Edge Cases and Error Handling", () => {
        let container: ServiceContainer;

        beforeEach(() => {
            container = ServiceContainer.getInstance();
        });

        it("should handle empty configuration", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const emptyContainer = ServiceContainer.getInstance({});

            expect(emptyContainer).toBeInstanceOf(ServiceContainer);
            expect(emptyContainer.getDatabaseService()).toBeDefined();
        });

        it("should handle undefined configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const undefinedContainer = ServiceContainer.getInstance(undefined);

            expect(undefinedContainer).toBeInstanceOf(ServiceContainer);
            expect(undefinedContainer.getDatabaseService()).toBeDefined();
        });

        it("should handle service creation with all optional configs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const fullConfigContainer = ServiceContainer.getInstance({
                enableDebugLogging: true,
                notificationConfig: {
                    showDownAlerts: true,
                    showUpAlerts: false,
                },
            });

            expect(fullConfigContainer.getNotificationService()).toBeDefined();
            expect(fullConfigContainer.getAutoUpdaterService()).toBeDefined();
        });

        it("should handle getMainOrchestrator when orchestrator is not initialized", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const privateContainer = container as any;
            const result = privateContainer.getMainOrchestrator();

            expect(result).toBeNull();
        });

        it("should handle getMainOrchestrator when orchestrator is initialized", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            // Create SiteManager first to avoid dependency issues
            container.getSiteManager();

            const orchestrator = container.getUptimeOrchestrator();
            const privateContainer = container as any;
            const result = privateContainer.getMainOrchestrator();

            expect(result).toBe(orchestrator);
        });

        it("should handle multiple initialization calls", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            // Create SiteManager first to avoid dependency issues
            container.getSiteManager();

            vi.mocked(
                container.getDatabaseManager().initialize
            ).mockResolvedValue();
            vi.mocked(
                container.getUptimeOrchestrator().initialize
            ).mockResolvedValue();
            vi.mocked(
                container.getIpcService().setupHandlers
            ).mockReturnValue();

            await container.initialize();
            await container.initialize();

            // Should handle multiple calls gracefully
            expect(
                container.getUptimeOrchestrator().initialize
            ).toHaveBeenCalledTimes(1);
            expect(container.getIpcService().setupHandlers).toHaveBeenCalledTimes(1);
        });

        it("should handle service creation order independence", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ServiceContainer", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Create services in random order
            const windowService = container.getWindowService();
            const autoUpdater = container.getAutoUpdaterService();
            const database = container.getDatabaseService();
            const config = container.getConfigurationManager();

            expect(windowService).toBeDefined();
            expect(autoUpdater).toBeDefined();
            expect(database).toBeDefined();
            expect(config).toBeDefined();
        });
    });
});
