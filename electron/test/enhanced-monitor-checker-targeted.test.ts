import { describe, it, expect, vi, beforeEach } from "vitest";
import { EnhancedMonitorChecker } from "../services/monitoring/EnhancedMonitorChecker";
import type { EnhancedMonitorCheckConfig } from "../services/monitoring/EnhancedMonitorChecker";
import type { Site, Monitor } from "../../shared/types";

describe("EnhancedMonitorChecker Targeted Coverage", () => {
    let mockConfig: EnhancedMonitorCheckConfig;
    let checker: EnhancedMonitorChecker;

    beforeEach(() => {
        mockConfig = {
            historyRepository: {
                addEntry: vi.fn().mockResolvedValue(true),
                getHistoryCount: vi.fn().mockResolvedValue(100),
                pruneHistory: vi.fn().mockResolvedValue(true),
            },
            monitorRepository: {
                update: vi.fn().mockRejectedValue(new Error("Database error")),
                findById: vi.fn().mockResolvedValue(null),
            },
            operationRegistry: {
                initiateCheck: vi.fn().mockReturnValue({
                    operationId: "test-operation-id",
                    signal: new AbortController().signal,
                }),
                completeOperation: vi.fn(),
                validateOperation: vi.fn().mockReturnValue(true),
            },
            timeoutManager: {
                scheduleTimeout: vi.fn(),
                clearTimeout: vi.fn(),
            },
            statusUpdateService: {
                updateMonitorStatus: vi.fn(),
            },
            getHistoryLimit: vi.fn().mockReturnValue(50),
        } as any;

        checker = new EnhancedMonitorChecker(mockConfig);
    });

    describe("setupOperationCorrelation error handling", () => {
        it("should handle monitorRepository.update failure and cleanup", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: enhanced-monitor-checker-targeted",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                checkInterval: 300_000,
                timeout: 30_000,
                retryAttempts: 3,
                monitoring: true,
                status: "up",
                responseTime: 150,
                history: [],
                activeOperations: ["existing-op"],
            };

            // Setup mocks to trigger the error path
            mockConfig.monitorRepository.update = vi
                .fn()
                .mockRejectedValue(new Error("Database error"));

            // Call the private method through reflection to test error handling
            const setupMethod = (checker as any).setupOperationCorrelation.bind(
                checker
            );
            const result = await setupMethod(monitor, "monitor-1");

            // Should return undefined when update fails
            expect(result).toBeUndefined();

            // Should cleanup the operation
            expect(
                mockConfig.operationRegistry.completeOperation
            ).toHaveBeenCalledWith("test-operation-id");
            expect(mockConfig.timeoutManager.clearTimeout).toHaveBeenCalledWith(
                "test-operation-id"
            );
        });
    });

    describe("saveHistoryEntry missing monitor ID", () => {
        it("should handle monitor without ID gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: enhanced-monitor-checker-targeted",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const monitor: Monitor = {
                // Missing id field - using empty string
                id: "",
                type: "http",
                url: "https://example.com",
                checkInterval: 300_000,
                timeout: 30_000,
                retryAttempts: 3,
                monitoring: true,
                status: "up",
                responseTime: 150,
                history: [],
            } as Monitor;

            const checkResult = {
                responseTime: 100,
                status: "up" as const,
                timestamp: new Date(),
            };

            // Call the private method through reflection
            const saveMethod = (checker as any).saveHistoryEntry.bind(checker);
            await saveMethod(monitor, checkResult);

            // Should not call addEntry when monitor has no ID
            expect(
                mockConfig.historyRepository.addEntry
            ).not.toHaveBeenCalled();
        });
    });

    describe("validateMonitor missing ID", () => {
        it("should return false for monitor without ID", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: enhanced-monitor-checker-targeted",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            const monitor: Monitor = {
                // Missing id field - using empty string
                id: "",
                type: "http",
                url: "https://example.com",
                checkInterval: 300_000,
                timeout: 30_000,
                retryAttempts: 3,
                monitoring: true,
                status: "up",
                responseTime: 150,
                history: [],
            } as Monitor;

            // Call the private method through reflection - note correct method name
            const validateMethod = (
                checker as any
            ).validateMonitorForCheck.bind(checker);
            const result = validateMethod(monitor, site, "test-monitor-id");

            expect(result).toBe(false);
        });
    });

    describe("history pruning logic", () => {
        it("should trigger history pruning when count exceeds threshold", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: enhanced-monitor-checker-targeted",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                checkInterval: 300_000,
                timeout: 30_000,
                retryAttempts: 3,
                monitoring: true,
                status: "up",
                responseTime: 150,
                history: [],
            };

            const checkResult = {
                responseTime: 100,
                status: "up" as const,
                timestamp: new Date(),
            };

            // Set up pruning scenario: count > threshold
            // With limit 50, buffer = max(floor(50 * 0.2), 5) = 10, so threshold = 60
            // With count 65, should trigger pruning
            mockConfig.getHistoryLimit = vi.fn().mockReturnValue(50);
            mockConfig.historyRepository.getHistoryCount = vi
                .fn()
                .mockResolvedValue(65); // Over threshold
            mockConfig.historyRepository.addEntry = vi
                .fn()
                .mockResolvedValue(undefined);

            const checker = new EnhancedMonitorChecker(mockConfig);

            // Call the private method through reflection
            const saveMethod = (checker as any).saveHistoryEntry.bind(checker);
            await saveMethod(monitor, checkResult);

            // Should call pruneHistory when threshold exceeded
            expect(
                mockConfig.historyRepository.pruneHistory
            ).toHaveBeenCalledWith("monitor-1", 50);
        });
    });

    describe("error handling in saveHistoryEntry", () => {
        it("should handle errors during history saving", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: enhanced-monitor-checker-targeted",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                checkInterval: 300_000,
                timeout: 30_000,
                retryAttempts: 3,
                monitoring: true,
                status: "up",
                responseTime: 150,
                history: [],
            };

            const checkResult = {
                responseTime: 100,
                status: "up" as const,
                timestamp: new Date(),
            };

            // Make addEntry throw an error
            mockConfig.historyRepository.addEntry = vi
                .fn()
                .mockRejectedValue(new Error("DB error"));

            // Call the private method through reflection
            const saveMethod = (checker as any).saveHistoryEntry.bind(checker);
            await saveMethod(monitor, checkResult);

            // Should not throw, error should be caught and logged
            expect(true).toBe(true); // Test passes if no error thrown
        });
    });

    describe("timeout calculation and scheduling", () => {
        it("should calculate correct timeout with buffer", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: enhanced-monitor-checker-targeted",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const monitor: Monitor = {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                checkInterval: 300_000,
                timeout: 45_000, // Custom timeout
                retryAttempts: 3,
                monitoring: true,
                status: "up",
                responseTime: 150,
                history: [],
                activeOperations: [],
            };

            // Make update succeed to test the happy path
            mockConfig.monitorRepository.update = vi
                .fn()
                .mockResolvedValue(true);

            // Call the private method through reflection
            const setupMethod = (checker as any).setupOperationCorrelation.bind(
                checker
            );
            await setupMethod(monitor, "monitor-1");

            // Should schedule timeout with correct calculation (45 * 1000 + buffer)
            expect(
                mockConfig.timeoutManager.scheduleTimeout
            ).toHaveBeenCalledWith(
                "test-operation-id",
                45_000 + 5000 // timeout * 1000 + buffer
            );
        });
    });
});
