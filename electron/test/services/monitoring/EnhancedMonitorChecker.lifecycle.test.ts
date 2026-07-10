/**
 * @file Lifecycle and error-path tests for EnhancedMonitorChecker.
 */

import type { Monitor, Site } from "@shared/types";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { EnhancedMonitorChecker } from "../../../services/monitoring/EnhancedMonitorChecker";
import type { IMonitorService } from "../../../services/monitoring/types";

type CheckerConfig = ConstructorParameters<typeof EnhancedMonitorChecker>[0];

const defaultMonitor = {
    checkInterval: 30_000,
    history: [],
    id: "monitor-1",
    lastChecked: new Date(),
    monitoring: true,
    responseTime: 200,
    retryAttempts: 3,
    status: "up",
    timeout: 10_000,
    type: "http",
    url: "https://example.com/",
} satisfies Monitor;

const createEventBusMock = () =>
    ({
        emitTyped: vi
            .fn<CheckerConfig["eventEmitter"]["emitTyped"]>()
            .mockResolvedValue(undefined),
    }) satisfies Partial<CheckerConfig["eventEmitter"]>;

const createSitesCacheMock = () =>
    ({
        get: vi.fn<CheckerConfig["sites"]["get"]>(),
    }) satisfies Partial<CheckerConfig["sites"]>;

const createSiteRepositoryMock = () =>
    ({
        findByIdentifier:
            vi.fn<CheckerConfig["siteRepository"]["findByIdentifier"]>(),
    }) satisfies Partial<CheckerConfig["siteRepository"]>;

const createMonitorRepositoryMock = () =>
    ({
        clearActiveOperations: vi
            .fn<CheckerConfig["monitorRepository"]["clearActiveOperations"]>()
            .mockResolvedValue(undefined),
        findByIdentifier: vi
            .fn<CheckerConfig["monitorRepository"]["findByIdentifier"]>()
            .mockResolvedValue(defaultMonitor),
        update: vi
            .fn<CheckerConfig["monitorRepository"]["update"]>()
            .mockResolvedValue(undefined),
    }) satisfies Partial<CheckerConfig["monitorRepository"]>;

const createHistoryRepositoryMock = () =>
    ({
        addEntry: vi
            .fn<CheckerConfig["historyRepository"]["addEntry"]>()
            .mockResolvedValue(undefined),
        findByMonitorId: vi
            .fn<CheckerConfig["historyRepository"]["findByMonitorId"]>()
            .mockResolvedValue([]),
    }) satisfies Partial<CheckerConfig["historyRepository"]>;

const createOperationRegistryMock = () =>
    ({
        cancelOperations: vi
            .fn<CheckerConfig["operationRegistry"]["cancelOperations"]>()
            .mockReturnValue(undefined),
        completeOperation:
            vi.fn<CheckerConfig["operationRegistry"]["completeOperation"]>(),
        getOutstandingOperationIds: vi
            .fn<
                CheckerConfig["operationRegistry"]["getOutstandingOperationIds"]
            >()
            .mockReturnValue([]),
        hasOutstandingOperation: vi
            .fn<CheckerConfig["operationRegistry"]["hasOutstandingOperation"]>()
            .mockReturnValue(false),
        initiateCheck:
            vi.fn<CheckerConfig["operationRegistry"]["initiateCheck"]>(),
        validateOperation: vi
            .fn<CheckerConfig["operationRegistry"]["validateOperation"]>()
            .mockReturnValue(true),
    }) satisfies Partial<CheckerConfig["operationRegistry"]>;

const createTimeoutManagerMock = () =>
    ({
        clearTimeout: vi.fn<CheckerConfig["timeoutManager"]["clearTimeout"]>(),
        scheduleTimeout:
            vi.fn<CheckerConfig["timeoutManager"]["scheduleTimeout"]>(),
    }) satisfies Partial<CheckerConfig["timeoutManager"]>;

const createStatusUpdateServiceMock = () =>
    ({
        updateMonitorStatus:
            vi.fn<
                CheckerConfig["statusUpdateService"]["updateMonitorStatus"]
            >(),
    }) satisfies Partial<CheckerConfig["statusUpdateService"]>;

const createMonitorServiceMock = (type: Monitor["type"]) =>
    ({
        check: vi.fn<IMonitorService["check"]>(),
        getType: vi.fn<IMonitorService["getType"]>().mockReturnValue(type),
        updateConfig: vi.fn<IMonitorService["updateConfig"]>(),
    }) satisfies IMonitorService;

describe("EnhancedMonitorChecker lifecycle behavior", () => {
    let enhancedChecker: EnhancedMonitorChecker;
    let mockEventBus: ReturnType<typeof createEventBusMock>;
    let mockSitesCache: ReturnType<typeof createSitesCacheMock>;
    let mockSiteRepository: ReturnType<typeof createSiteRepositoryMock>;
    let mockMonitorRepository: ReturnType<typeof createMonitorRepositoryMock>;
    let mockHistoryRepository: ReturnType<typeof createHistoryRepositoryMock>;
    let mockOperationRegistry: ReturnType<typeof createOperationRegistryMock>;
    let mockTimeoutManager: ReturnType<typeof createTimeoutManagerMock>;
    let mockStatusUpdateService: ReturnType<
        typeof createStatusUpdateServiceMock
    >;
    let mockHttpMonitorService: ReturnType<typeof createMonitorServiceMock>;

    const createChecker = (): EnhancedMonitorChecker =>
        new EnhancedMonitorChecker({
            eventEmitter:
                mockEventBus as unknown as CheckerConfig["eventEmitter"],
            getHistoryLimit: () => 100,
            historyRepository:
                mockHistoryRepository as unknown as CheckerConfig["historyRepository"],
            monitorRepository:
                mockMonitorRepository as unknown as CheckerConfig["monitorRepository"],
            operationRegistry:
                mockOperationRegistry as unknown as CheckerConfig["operationRegistry"],
            siteRepository:
                mockSiteRepository as unknown as CheckerConfig["siteRepository"],
            sites: mockSitesCache as unknown as CheckerConfig["sites"],
            statusUpdateService:
                mockStatusUpdateService as unknown as CheckerConfig["statusUpdateService"],
            timeoutManager:
                mockTimeoutManager as unknown as CheckerConfig["timeoutManager"],
        });

    beforeEach(() => {
        // Create mock dependencies
        mockEventBus = createEventBusMock();
        mockSitesCache = createSitesCacheMock();
        mockSiteRepository = createSiteRepositoryMock();
        mockMonitorRepository = createMonitorRepositoryMock();
        mockHistoryRepository = createHistoryRepositoryMock();
        mockOperationRegistry = createOperationRegistryMock();
        mockTimeoutManager = createTimeoutManagerMock();
        mockStatusUpdateService = createStatusUpdateServiceMock();

        mockOperationRegistry.initiateCheck.mockReturnValue({
            operationId: "op-default",
            signal: new AbortController().signal,
        });

        // Create the EnhancedMonitorChecker instance
        enhancedChecker = createChecker();

        // Replace monitor service implementations with deterministic mocks.
        mockHttpMonitorService = createMonitorServiceMock("http");
        enhancedChecker.servicesByType.set("http", mockHttpMonitorService);
        enhancedChecker.servicesByType.set(
            "ping",
            createMonitorServiceMock("ping")
        );
        enhancedChecker.servicesByType.set(
            "port",
            createMonitorServiceMock("port")
        );
        enhancedChecker.servicesByType.set(
            "dns",
            createMonitorServiceMock("dns")
        );
    });

    describe("Constructor and Initialization", () => {
        it("should initialize with all dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const checker = createChecker();

            expect(checker).toBeDefined();
        });
    });

    describe("checkMonitor behavior", () => {
        const mockSite: Site = {
            identifier: "test-site",
            name: "Test Site",
            monitoring: true,
            monitors: [
                {
                    id: "monitor-1",
                    type: "http",
                    url: "https://example.com/",
                    status: "pending",
                    lastChecked: new Date(),
                    checkInterval: 30_000,
                    history: [],
                    monitoring: true,
                    responseTime: 0,
                    retryAttempts: 3,
                    timeout: 10_000,
                },
            ],
        };

        const getMockSiteMonitor = (): Monitor => {
            const monitor = mockSite.monitors[0];
            if (!monitor) {
                throw new TypeError(
                    "Expected the mock site to contain a monitor"
                );
            }
            return monitor;
        };

        it("should handle manual check with valid site and monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            // Mock the repository methods that are called
            mockMonitorRepository.update.mockResolvedValue(undefined);
            mockMonitorRepository.findByIdentifier.mockResolvedValue({
                ...getMockSiteMonitor(),
                status: "up",
                lastChecked: new Date(),
                responseTime: 200,
            });
            // Mock the HTTP monitor check method to return success
            const mockCheckResult = {
                details: "Check successful",
                responseTime: 200,
                status: "up" as const,
            };

            // Mock the HTTP monitor's check method directly
            mockHttpMonitorService.check.mockResolvedValue(mockCheckResult);

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                true
            );

            expect(result).toBeDefined();
            expect(result?.status).toBe("up");
            expect(result?.monitorId).toBe("monitor-1");
            expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith(
                "monitor-1"
            );
            expect(
                mockMonitorRepository.clearActiveOperations
            ).toHaveBeenCalledWith("monitor-1");
            expect(mockMonitorRepository.update).toHaveBeenCalled();
        });

        it("should discard a manual result when the monitor was deleted", async () => {
            mockMonitorRepository.findByIdentifier.mockResolvedValue(undefined);
            mockHttpMonitorService.check.mockResolvedValue({
                details: "Check successful",
                responseTime: 200,
                status: "up",
            });

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                true
            );

            expect(result).toBeUndefined();
            expect(mockHistoryRepository.addEntry).not.toHaveBeenCalled();
            expect(mockMonitorRepository.update).not.toHaveBeenCalled();
            expect(mockEventBus.emitTyped).not.toHaveBeenCalledWith(
                "monitor:status-changed",
                expect.anything()
            );
        });

        it("should abort manual checks after the monitor timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Cancellation", "type");

            const baseMonitor = getMockSiteMonitor();

            const fastTimeoutSite: Site = {
                ...mockSite,
                monitors: [
                    {
                        ...baseMonitor,
                        timeout: 50,
                    },
                ],
            };

            mockMonitorRepository.update.mockResolvedValue(undefined);
            mockMonitorRepository.findByIdentifier.mockResolvedValue({
                ...fastTimeoutSite.monitors[0]!,
                status: "down",
                lastChecked: new Date(),
                responseTime: 0,
            });
            const checkMock = vi
                .fn<IMonitorService["check"]>()
                .mockImplementation(async (_monitor, signal) => {
                    if (!signal) {
                        throw new Error("Missing AbortSignal");
                    }

                    await Promise.race([
                        new Promise<void>((resolve) => {
                            signal.addEventListener(
                                "abort",
                                () => {
                                    resolve();
                                },
                                { once: true }
                            );
                        }),
                        new Promise<void>((_resolve, reject) => {
                            setTimeout(() => {
                                reject(
                                    new Error(
                                        "Manual check did not abort within test window"
                                    )
                                );
                            }, 500);
                        }),
                    ]);

                    return {
                        details: "aborted",
                        responseTime: 0,
                        status: "down" as const,
                    };
                });

            mockHttpMonitorService.check.mockImplementation(checkMock);

            const result = await enhancedChecker.checkMonitor(
                fastTimeoutSite,
                "monitor-1",
                true
            );

            expect(checkMock).toHaveBeenCalledTimes(1);
            const signal = checkMock.mock.calls[0]?.[1];
            expect(signal).toBeDefined();
            expect(signal?.aborted).toBeTruthy();
            expect(result?.status).toBe("down");
        });

        it("should return undefined for non-existent monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "non-existent-monitor",
                true
            );

            expect(result).toBeUndefined();
        });

        it("should handle monitor check failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Mock the repository methods that are called
            mockMonitorRepository.update.mockResolvedValue(undefined);
            mockMonitorRepository.findByIdentifier.mockResolvedValue({
                ...getMockSiteMonitor(),
                status: "down",
                lastChecked: new Date(),
                responseTime: -1,
            });
            // Mock the internal monitor check to return failure
            const mockCheckResult = {
                details: "Connection timeout",
                responseTime: -1,
                status: "down" as const,
            };

            // Mock the HTTP monitor's check method directly
            mockHttpMonitorService.check.mockResolvedValue(mockCheckResult);

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                true
            );

            expect(result).toBeDefined();
            expect(result?.status).toBe("down");
        });

        it("should handle monitor check returning null result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const invalidService = {
                check: vi.fn().mockResolvedValue(null),
            };
            enhancedChecker.servicesByType.set(
                "http",
                invalidService as unknown as IMonitorService
            );

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                true
            );

            expect(result).toBeDefined();
            expect(result?.status).toBe("down");
        });

        it("should handle status update service throwing error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const operationId = "op-123";
            mockOperationRegistry.initiateCheck.mockReturnValue({
                operationId,
                signal: new AbortController().signal,
            });

            mockHttpMonitorService.check.mockResolvedValue({
                responseTime: 200,
                status: "up",
            });
            mockStatusUpdateService.updateMonitorStatus.mockRejectedValue(
                new Error("Update failed")
            );

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                false
            );

            expect(result).toBeUndefined();
        });

        it("should pass an external AbortSignal into operation correlation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Cancellation", "type");

            const external = new AbortController();
            const operationId = "op-789";

            mockOperationRegistry.initiateCheck.mockReturnValue({
                operationId,
                signal: new AbortController().signal,
            });

            mockHttpMonitorService.check.mockResolvedValue({
                responseTime: 1,
                status: "up",
            });
            mockStatusUpdateService.updateMonitorStatus.mockResolvedValue(
                false
            );

            await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                false,
                external.signal
            );

            expect(mockOperationRegistry.initiateCheck).toHaveBeenCalledWith(
                "monitor-1",
                expect.objectContaining({
                    additionalSignals: [external.signal],
                })
            );
        });
    });

    describe("startMonitoring behavior", () => {
        it("should start monitoring successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const isResult = await enhancedChecker.startMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(isResult).toBeTruthy();
            expect(mockMonitorRepository.update).toHaveBeenCalledWith(
                "monitor-1",
                {
                    activeOperations: [],
                    monitoring: true,
                }
            );
            expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith(
                "monitor-1"
            );
        });

        it("should handle monitor update failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockMonitorRepository.update.mockRejectedValue(
                new Error("Database error")
            );

            const isResult = await enhancedChecker.startMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(isResult).toBeFalsy();
        });

        it("should handle successful monitoring start with event emission", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const isResult = await enhancedChecker.startMonitoring(
                "test-site",
                "monitor-2"
            );

            expect(isResult).toBeTruthy();
            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:monitor:started",
                expect.objectContaining({
                    identifier: "test-site",
                    monitorId: "monitor-2",
                    operation: "started",
                })
            );
        });

        it("should handle event emission error gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockEventBus.emitTyped.mockRejectedValue(
                new Error("Event emission failed")
            );

            const isResult = await enhancedChecker.startMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(isResult).toBeFalsy();
        });
    });

    describe("stopMonitoring behavior", () => {
        it("should stop monitoring and cancel operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const isResult = await enhancedChecker.stopMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith(
                "monitor-1"
            );
            expect(mockMonitorRepository.update).toHaveBeenCalledWith(
                "monitor-1",
                {
                    activeOperations: [],
                    monitoring: false,
                }
            );
            expect(isResult).toBeTruthy();
        });

        it("should handle successful stop with event emission", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Event Processing", "type");

            const isResult = await enhancedChecker.stopMonitoring(
                "test-site",
                "monitor-2"
            );

            expect(isResult).toBeTruthy();
            expect(mockEventBus.emitTyped).toHaveBeenCalledWith(
                "internal:monitor:stopped",
                expect.objectContaining({
                    identifier: "test-site",
                    monitorId: "monitor-2",
                    operation: "stopped",
                    reason: "user",
                })
            );
        });

        it("should handle stop monitoring errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            mockMonitorRepository.update.mockRejectedValue(
                new Error("Database update failed")
            );

            const isResult = await enhancedChecker.stopMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(isResult).toBeFalsy();
        });
    });

    describe("Operation Registry Integration", () => {
        it("should cover operation registry cancellation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const isResult = await enhancedChecker.startMonitoring(
                "test-site",
                "monitor-3"
            );

            expect(mockOperationRegistry.cancelOperations).toHaveBeenCalledWith(
                "monitor-3"
            );
            expect(isResult).toBeTruthy();
        });

        it("should cover repository integration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const isResult = await enhancedChecker.stopMonitoring(
                "test-site",
                "monitor-1"
            );

            expect(mockMonitorRepository.update).toHaveBeenCalledWith(
                "monitor-1",
                {
                    activeOperations: [],
                    monitoring: false,
                }
            );
            expect(isResult).toBeTruthy();
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle operation validation failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const operationId = "op-123";
            mockOperationRegistry.initiateCheck.mockReturnValue({
                operationId,
                signal: new AbortController().signal,
            });
            mockOperationRegistry.validateOperation.mockReturnValue(false);

            const mockSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com/",
                        status: "pending",
                        lastChecked: new Date(),
                        checkInterval: 30_000,
                        history: [],
                        monitoring: true,
                        responseTime: 0,
                        retryAttempts: 3,
                        timeout: 10_000,
                    },
                ],
            };

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                false
            );

            expect(result).toBeUndefined();
        });

        it("should handle monitor factory returning null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            // Simulate missing service wiring.
            enhancedChecker.servicesByType.delete("http");

            const mockSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com/",
                        status: "pending",
                        lastChecked: new Date(),
                        checkInterval: 30_000,
                        history: [],
                        monitoring: true,
                        responseTime: 0,
                        retryAttempts: 3,
                        timeout: 10_000,
                    },
                ],
            };

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                true
            );

            expect(result).toBeDefined();
            expect(result?.status).toBe("down");
        });

        it("should handle unsupported monitor type when correlated flag is false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: EnhancedMonitorChecker-lifecycle",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const operationId = "op-456";
            mockOperationRegistry.initiateCheck.mockReturnValue({
                operationId,
                signal: new AbortController().signal,
            });

            mockStatusUpdateService.updateMonitorStatus.mockResolvedValue(true);
            mockMonitorRepository.findByIdentifier.mockResolvedValue({
                id: "monitor-1",
                type: "dns",
                host: "example.com",
                status: "down",
                lastChecked: new Date(),
                checkInterval: 30_000,
                history: [],
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                timeout: 10_000,
            });

            // Simulate missing service wiring for this monitor type.
            enhancedChecker.servicesByType.delete("dns");

            const mockSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "dns",
                        host: "example.com",
                        status: "pending",
                        lastChecked: new Date(),
                        checkInterval: 30_000,
                        history: [],
                        monitoring: true,
                        responseTime: 0,
                        retryAttempts: 3,
                        timeout: 10_000,
                    },
                ],
            };

            const result = await enhancedChecker.checkMonitor(
                mockSite,
                "monitor-1",
                false
            );

            expect(result).toBeDefined();
            expect(result?.status).toBe("down");
        });
    });
});
