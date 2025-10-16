/**
 * Tests for operationHelpers.ts - covering all branches and scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Site } from "../../../../../shared/types";
import type { SiteOperationsDependencies } from "../../../../stores/sites/types";

// Mock the error catalog
vi.mock("../../../../../shared/utils/errorCatalog", () => ({
    ERROR_CATALOG: {
        sites: {
            NOT_FOUND: "Site not found",
        },
    },
}));

// Mock the error handling utility
vi.mock("../../../../../shared/utils/errorHandling", () => ({
    withErrorHandling: vi.fn(),
    ensureError: vi.fn((error) =>
        error instanceof Error ? error : new Error(String(error))
    ),
}));

// Mock the store action logging
vi.mock("../../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    waitForElectronAPI: vi.fn().mockResolvedValue(undefined),
}));

// Mock the store error handling
vi.mock("../../../../stores/utils/storeErrorHandling", () => ({
    createStoreErrorHandler: vi.fn(),
}));

// Mock the monitor operations
vi.mock("../../../../stores/sites/utils/monitorOperations", () => ({
    updateMonitorInSite: vi.fn(),
}));

// Mock window.electronAPI
const mockElectronAPI = {
    sites: {
        updateSite: vi.fn(),
    },
};

Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

// Import after mocking
import {
    getSiteByIdentifier,
    updateMonitorAndSave,
    withSiteOperation,
    withSiteOperationReturning,
} from "../../../../stores/sites/utils/operationHelpers";
import { withErrorHandling } from "../../../../../shared/utils/errorHandling";
import { logStoreAction } from "../../../../stores/utils";
import { createStoreErrorHandler } from "../../../../stores/utils/storeErrorHandling";
import { updateMonitorInSite } from "../../../../stores/sites/utils/monitorOperations";

const mockWithErrorHandling = vi.mocked(withErrorHandling);
const mockLogStoreAction = vi.mocked(logStoreAction);
const mockCreateStoreErrorHandler = vi.mocked(createStoreErrorHandler);
const mockUpdateMonitorInSite = vi.mocked(updateMonitorInSite);

describe("OperationHelpers", () => {
    let mockDeps: SiteOperationsDependencies;
    let mockSites: Site[];

    const createMockSite = (id: string, monitorId: string): Site => ({
        identifier: id,
        name: `Site ${id}`,
        monitoring: true,
        monitors: [
            {
                id: monitorId,
                type: "http",
                url: "https://example.com",
                timeout: 5000,
                checkInterval: 60_000,
                retryAttempts: 3,
                monitoring: true,
                responseTime: 150,
                status: "up",
                lastChecked: new Date(),
                history: [],
                host: "example.com",
                port: 443,
                activeOperations: [],
            },
        ],
    });

    beforeEach(() => {
        vi.clearAllMocks();

        mockSites = [
            createMockSite("site1", "monitor1"),
            createMockSite("site2", "monitor2"),
            createMockSite("site3", "monitor3"),
        ];

        const dataService = {
            downloadSqliteBackup: vi.fn(async () => ({
                buffer: new ArrayBuffer(0),
                fileName: "backup.db",
                metadata: {
                    createdAt: Date.now(),
                    originalPath: "",
                    sizeBytes: 0,
                },
            })),
        };

        const siteService = {
            addSite: vi.fn(async (site: Site) => site),
            getSites: vi.fn(async () => mockSites),
            removeMonitor: vi.fn(async () => true),
            removeSite: vi.fn(async () => true),
            updateSite: vi.fn(async (identifier: string, updates: unknown) =>
                mockElectronAPI.sites.updateSite(identifier, updates)
            ),
        };

        const monitoringService = {
            startMonitoring: vi.fn(async () => {}),
            startSiteMonitoring: vi.fn(async () => {}),
            stopMonitoring: vi.fn(async () => {}),
            stopSiteMonitoring: vi.fn(async () => {}),
        };

        mockDeps = {
            getSites: vi.fn(() => mockSites),
            setSites: vi.fn(),
            addSite: vi.fn(),
            removeSite: vi.fn(),
            syncSites: vi.fn().mockResolvedValue(undefined),
            services: {
                data: dataService,
                monitoring: monitoringService,
                site: siteService,
            },
        } satisfies SiteOperationsDependencies;

        // Default mock implementations
        mockWithErrorHandling.mockImplementation(async (fn) => fn());
        mockCreateStoreErrorHandler.mockReturnValue({
            clearError: vi.fn(),
            setError: vi.fn(),
            setLoading: vi.fn(),
        });
        mockUpdateMonitorInSite.mockReturnValue(mockSites[0]!);
        mockElectronAPI.sites.updateSite.mockResolvedValue(mockSites[0]!);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe(getSiteByIdentifier, () => {
        it("should return site when found", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = getSiteByIdentifier("site1", mockDeps);

            expect(result).toBe(mockSites[0]);
            expect(mockDeps.getSites).toHaveBeenCalledTimes(1);
        });

        it("should throw error when site not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => getSiteByIdentifier("nonexistent", mockDeps)).toThrow(
                "Site not found"
            );
            expect(mockDeps.getSites).toHaveBeenCalledTimes(1);
        });

        it("should handle empty sites array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(mockDeps.getSites).mockReturnValue([]);

            expect(() => getSiteByIdentifier("site1", mockDeps)).toThrow(
                "Site not found"
            );
            expect(mockDeps.getSites).toHaveBeenCalledTimes(1);
        });
    });

    describe(updateMonitorAndSave, () => {
        it("should update monitor and save successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Saving", "type");

            const updates = { timeout: 10_000 };
            const updatedSite = {
                ...mockSites[0]!,
                monitors: [{ ...mockSites[0]!.monitors[0]!, ...updates }],
            };
            mockUpdateMonitorInSite.mockReturnValue(updatedSite);
            mockElectronAPI.sites.updateSite.mockResolvedValue(updatedSite);

            await updateMonitorAndSave("site1", "monitor1", updates, mockDeps);

            expect(mockDeps.getSites).toHaveBeenCalledTimes(2);
            expect(mockUpdateMonitorInSite).toHaveBeenCalledWith(
                mockSites[0]!,
                "monitor1",
                updates
            );
            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                "site1",
                { monitors: updatedSite.monitors }
            );
            expect(mockDeps.setSites).toHaveBeenCalledWith([
                updatedSite,
                mockSites[1]!,
                mockSites[2]!,
            ]);
            expect(mockDeps.setSites).toHaveBeenCalledTimes(1);
        });

        it("should throw error when site not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            await expect(
                updateMonitorAndSave("nonexistent", "monitor1", {}, mockDeps)
            ).rejects.toThrow("Site not found");

            expect(mockDeps.getSites).toHaveBeenCalledTimes(1);
            expect(mockUpdateMonitorInSite).not.toHaveBeenCalled();
            expect(mockElectronAPI.sites.updateSite).not.toHaveBeenCalled();
            expect(mockDeps.setSites).not.toHaveBeenCalled();
        });

        it("should handle updateSite API errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const apiError = new Error("API Error");
            mockElectronAPI.sites.updateSite.mockRejectedValue(apiError);

            await expect(
                updateMonitorAndSave("site1", "monitor1", {}, mockDeps)
            ).rejects.toThrow("API Error");

            expect(mockDeps.getSites).toHaveBeenCalledTimes(1);
            expect(mockUpdateMonitorInSite).toHaveBeenCalled();
            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalled();
            expect(mockDeps.setSites).not.toHaveBeenCalled();
        });
    });

    describe(withSiteOperation, () => {
        it("should execute operation with sync by default", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue(undefined);
            const params = { siteIdentifier: "site1" };

            await withSiteOperation("testOperation", mockOperation, mockDeps, {
                telemetry: params,
            });

            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    status: "pending",
                })
            );
            const firstPayload = mockLogStoreAction.mock.calls[0]?.[2];
            expect(firstPayload).toBeDefined();
            expect(firstPayload).not.toHaveProperty("success");
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                2,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    success: true,
                    status: "success",
                })
            );
            expect(mockCreateStoreErrorHandler).toHaveBeenCalledWith(
                "sites-operations",
                "testOperation"
            );
            expect(mockWithErrorHandling).toHaveBeenCalledTimes(1);

            // Get the operation passed to withErrorHandling
            const [wrappedOperation] = mockWithErrorHandling.mock.calls.at(-1)!;

            mockLogStoreAction.mockClear();

            // Execute the wrapped operation to test its behavior
            await wrappedOperation();

            expect(mockOperation).toHaveBeenCalledTimes(2); // Once in main call, once in test
            expect(mockDeps.syncSites).toHaveBeenCalledTimes(2); // Once in main call, once in test
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    status: "success",
                    success: true,
                })
            );
            expect(mockLogStoreAction).toHaveBeenCalledTimes(1);

            mockLogStoreAction.mockClear();

            await withSiteOperation("testOperation", mockOperation, mockDeps, {
                telemetry: params,
                syncAfter: false,
            });

            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    status: "pending",
                })
            );
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                2,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    status: "success",
                    success: true,
                })
            );
            expect(mockLogStoreAction).toHaveBeenCalledTimes(2);
            expect(mockWithErrorHandling).toHaveBeenCalledTimes(2);

            const [wrappedOperationAgain] =
                mockWithErrorHandling.mock.calls.at(-1)!;

            mockLogStoreAction.mockClear();
            mockOperation.mockClear();
            const syncSitesMock = vi.mocked(mockDeps.syncSites);
            syncSitesMock.mockClear();

            // Execute the wrapped operation to test its behavior
            await wrappedOperationAgain();

            expect(mockOperation).toHaveBeenCalledTimes(1);
            expect(syncSitesMock).not.toHaveBeenCalled();
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    status: "success",
                    success: true,
                })
            );
            expect(mockLogStoreAction).toHaveBeenCalledTimes(1);
        });

        it("should handle operation errors through withErrorHandling", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const operationError = new Error("Operation failed");
            const mockOperation = vi.fn().mockRejectedValue(operationError);
            const params = { siteIdentifier: "site1" };

            // Mock withErrorHandling to throw the error
            mockWithErrorHandling.mockRejectedValue(operationError);

            await expect(
                withSiteOperation("testOperation", mockOperation, mockDeps, {
                    telemetry: params,
                })
            ).rejects.toThrow("Operation failed");

            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    status: "pending",
                })
            );
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                2,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    error: "Operation failed",
                    success: false,
                    status: "failure",
                })
            );
            expect(mockWithErrorHandling).toHaveBeenCalledTimes(1);
        });

        it("should handle sync errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockOperation = vi.fn().mockResolvedValue(undefined);
            const syncError = new Error("Sync failed");
            mockDeps.syncSites = vi.fn().mockRejectedValue(syncError);
            const params = { siteIdentifier: "site1" };

            // Mock withErrorHandling to execute and re-throw sync error
            mockWithErrorHandling.mockImplementation(async (fn) => {
                await fn();
            });

            await expect(
                withSiteOperation("testOperation", mockOperation, mockDeps, {
                    telemetry: params,
                })
            ).rejects.toThrow("Sync failed");

            expect(mockOperation).toHaveBeenCalledTimes(1);
            expect(mockDeps.syncSites).toHaveBeenCalledTimes(1);
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    status: "pending",
                })
            );
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                2,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    error: "Sync failed",
                    success: false,
                    status: "failure",
                })
            );
        });

        it("applies stage-specific telemetry metadata on success", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Telemetry", "type");

            const mockOperation = vi.fn().mockResolvedValue(undefined);

            await withSiteOperation("testOperation", mockOperation, mockDeps, {
                telemetry: {
                    base: { siteIdentifier: "site-1" },
                    pending: { phase: "initializing" },
                    success: { message: "completed" },
                },
                syncAfter: false,
            });

            expect(mockOperation).toHaveBeenCalledTimes(1);
            expect(mockLogStoreAction).toHaveBeenCalledTimes(2);

            const [pendingCall, successCall] = mockLogStoreAction.mock.calls;
            const pendingPayload = pendingCall?.[2];
            const successPayload = successCall?.[2];

            expect(pendingPayload).toMatchObject({
                phase: "initializing",
                siteIdentifier: "site-1",
                status: "pending",
            });
            expect(pendingPayload).not.toHaveProperty("message");

            expect(successPayload).toMatchObject({
                message: "completed",
                siteIdentifier: "site-1",
                status: "success",
                success: true,
            });
        });

        it("applies stage-specific telemetry metadata on failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Telemetry", "type");

            const operationError = new Error("failure");
            const mockOperation = vi.fn().mockRejectedValue(operationError);

            mockWithErrorHandling.mockRejectedValue(operationError);

            await expect(
                withSiteOperation("testOperation", mockOperation, mockDeps, {
                    telemetry: {
                        base: { siteIdentifier: "site-2" },
                        failure: { reason: "ipc" },
                    },
                })
            ).rejects.toThrow("failure");

            expect(mockLogStoreAction).toHaveBeenCalledTimes(2);

            const [pendingCall, failureCall] = mockLogStoreAction.mock.calls;
            const pendingPayload = pendingCall?.[2];
            const failurePayload = failureCall?.[2];

            expect(pendingPayload).toMatchObject({
                siteIdentifier: "site-2",
                status: "pending",
            });
            expect(pendingPayload).not.toHaveProperty("reason");

            expect(failurePayload).toMatchObject({
                error: "failure",
                reason: "ipc",
                siteIdentifier: "site-2",
                status: "failure",
                success: false,
            });
        });
    });

    describe(withSiteOperationReturning, () => {
        it("should execute operation with sync by default and return result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const expectedResult = { data: "test result" };
            const mockOperation = vi.fn().mockResolvedValue(expectedResult);
            const params = { siteIdentifier: "site1" };

            // Mock withErrorHandling to execute the function and return its result
            mockWithErrorHandling.mockImplementation(async (fn) => fn());

            const result = await withSiteOperationReturning(
                "testOperation",
                mockOperation,
                mockDeps,
                { telemetry: params }
            );

            expect(result).toEqual(expectedResult);
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    status: "pending",
                })
            );
            const returningPendingPayload =
                mockLogStoreAction.mock.calls[0]?.[2];
            expect(returningPendingPayload).toBeDefined();
            expect(returningPendingPayload).not.toHaveProperty("success");
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                2,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    success: true,
                    status: "success",
                })
            );
            expect(mockCreateStoreErrorHandler).toHaveBeenCalledWith(
                "sites-operations",
                "testOperation"
            );
            expect(mockWithErrorHandling).toHaveBeenCalledTimes(1);

            const [wrappedOperationReturn] =
                mockWithErrorHandling.mock.calls.at(-1)!;

            mockLogStoreAction.mockClear();

            // Execute the wrapped operation to test its behavior
            const wrappedResult = await wrappedOperationReturn();

            expect(wrappedResult).toEqual(expectedResult);
            expect(mockOperation).toHaveBeenCalledTimes(2); // Once in main call, once in test
            expect(mockDeps.syncSites).toHaveBeenCalledTimes(2); // Once in main call, once in test
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    status: "success",
                    success: true,
                })
            );
            expect(mockLogStoreAction).toHaveBeenCalledTimes(1);
        });

        it("should execute operation without sync when syncAfter is false and return result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const expectedResult = { data: "test result" };
            const mockOperation = vi.fn().mockResolvedValue(expectedResult);
            const params = { siteIdentifier: "site1" };

            // Mock withErrorHandling to execute the function and return its result
            mockWithErrorHandling.mockImplementation(async (fn) => fn());

            const result = await withSiteOperationReturning(
                "testOperation",
                mockOperation,
                mockDeps,
                { telemetry: params, syncAfter: false }
            );

            expect(result).toEqual(expectedResult);
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    status: "pending",
                })
            );
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                2,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    success: true,
                    status: "success",
                })
            );
            expect(mockWithErrorHandling).toHaveBeenCalledTimes(1);

            const [wrappedOperationReturnAgain] =
                mockWithErrorHandling.mock.calls.at(-1)!;

            mockLogStoreAction.mockClear();

            // Execute the wrapped operation to test its behavior
            const wrappedResult = await wrappedOperationReturnAgain();

            expect(wrappedResult).toEqual(expectedResult);
            expect(mockOperation).toHaveBeenCalledTimes(2); // Once in main call, once in test
            expect(mockDeps.syncSites).not.toHaveBeenCalled();
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    success: true,
                    status: "success",
                })
            );
            expect(mockLogStoreAction).toHaveBeenCalledTimes(1);
        });

        it("should handle operation errors through withErrorHandling", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const operationError = new Error("Operation failed");
            const mockOperation = vi.fn().mockRejectedValue(operationError);
            const params = { siteIdentifier: "site1" };

            // Mock withErrorHandling to throw the error
            mockWithErrorHandling.mockRejectedValue(operationError);

            await expect(
                withSiteOperationReturning(
                    "testOperation",
                    mockOperation,
                    mockDeps,
                    { telemetry: params }
                )
            ).rejects.toThrow("Operation failed");

            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    status: "pending",
                })
            );
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                2,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    error: "Operation failed",
                    success: false,
                    status: "failure",
                })
            );
            expect(mockWithErrorHandling).toHaveBeenCalledTimes(1);
        });

        it("should handle sync errors when syncAfter is true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const expectedResult = { data: "test result" };
            const mockOperation = vi.fn().mockResolvedValue(expectedResult);
            const syncError = new Error("Sync failed");
            mockDeps.syncSites = vi.fn().mockRejectedValue(syncError);
            const params = { siteIdentifier: "site1" };

            // Mock withErrorHandling to execute and re-throw sync error
            mockWithErrorHandling.mockImplementation(async (fn) => {
                await fn();
            });

            await expect(
                withSiteOperationReturning(
                    "testOperation",
                    mockOperation,
                    mockDeps,
                    { telemetry: params }
                )
            ).rejects.toThrow("Sync failed");

            expect(mockOperation).toHaveBeenCalledTimes(1);
            expect(mockDeps.syncSites).toHaveBeenCalledTimes(1);
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    status: "pending",
                })
            );
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                2,
                "SitesStore",
                "testOperation",
                expect.objectContaining({
                    ...params,
                    error: "Sync failed",
                    success: false,
                    status: "failure",
                })
            );
        });

        it("should return different types of results", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test with string result
            const stringOperation = vi.fn().mockResolvedValue("string result");
            mockWithErrorHandling.mockImplementation(async (fn) => fn());

            const stringResult = await withSiteOperationReturning(
                "stringOp",
                stringOperation,
                mockDeps,
                { syncAfter: false }
            );
            expect(stringResult).toBe("string result");

            // Test with number result
            const numberOperation = vi.fn().mockResolvedValue(42);
            const numberResult = await withSiteOperationReturning(
                "numberOp",
                numberOperation,
                mockDeps,
                { syncAfter: false }
            );
            expect(numberResult).toBe(42);

            // Test with boolean result
            const booleanOperation = vi.fn().mockResolvedValue(true);
            const booleanResult = await withSiteOperationReturning(
                "booleanOp",
                booleanOperation,
                mockDeps,
                { syncAfter: false }
            );
            expect(booleanResult).toBeTruthy();

            // Test with array result
            const arrayOperation = vi.fn().mockResolvedValue([
                1,
                2,
                3,
            ]);
            const arrayResult = await withSiteOperationReturning(
                "arrayOp",
                arrayOperation,
                mockDeps,
                { syncAfter: false }
            );
            expect(arrayResult).toEqual([
                1,
                2,
                3,
            ]);
        });

        it("should handle null and undefined results", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            mockWithErrorHandling.mockImplementation(async (fn) => fn());

            // Test with null result
            const nullOperation = vi.fn().mockResolvedValue(null);
            const nullResult = await withSiteOperationReturning(
                "nullOp",
                nullOperation,
                mockDeps,
                { syncAfter: false }
            );
            expect(nullResult).toBeNull();

            // Test with undefined result
            const undefinedOperation = vi.fn().mockResolvedValue(undefined);
            const undefinedResult = await withSiteOperationReturning(
                "undefinedOp",
                undefinedOperation,
                mockDeps,
                { syncAfter: false }
            );
            expect(undefinedResult).toBeUndefined();
        });
    });

    describe("Edge Cases and Error Scenarios", () => {
        it("should handle getSiteByIdentifier with sites array containing null/undefined entries", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Retrieval", "type");

            const sitesWithNulls = [
                null,
                undefined,
                mockSites[0],
                null,
                mockSites[1],
            ] as any;
            vi.mocked(mockDeps.getSites).mockReturnValue(sitesWithNulls);

            const result = getSiteByIdentifier("site1", mockDeps);
            expect(result).toBe(mockSites[0]);
        });

        it("should handle updateMonitorAndSave with complex monitor updates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Saving", "type");

            const complexUpdates = {
                timeout: 15_000,
                checkInterval: 120_000,
                retryAttempts: 5,
                monitoring: false,
                url: "https://updated.example.com",
            };

            const updatedSite = {
                ...mockSites[0]!,
                monitors: [
                    { ...mockSites[0]!.monitors[0]!, ...complexUpdates },
                ],
            };
            mockUpdateMonitorInSite.mockReturnValue(updatedSite);
            mockElectronAPI.sites.updateSite.mockResolvedValue(updatedSite);

            await updateMonitorAndSave(
                "site1",
                "monitor1",
                complexUpdates,
                mockDeps
            );

            expect(mockUpdateMonitorInSite).toHaveBeenCalledWith(
                mockSites[0]!,
                "monitor1",
                complexUpdates
            );
            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                "site1",
                { monitors: updatedSite.monitors }
            );
            expect(mockDeps.setSites).toHaveBeenCalledWith([
                updatedSite,
                mockSites[1]!,
                mockSites[2]!,
            ]);
            expect(mockDeps.setSites).toHaveBeenCalledTimes(1);
        });

        it("should handle operations with empty parameters object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue(undefined);
            mockWithErrorHandling.mockImplementation(async (fn) => fn());

            await withSiteOperation("emptyParamsOp", mockOperation, mockDeps);

            expect(mockOperation).toHaveBeenCalledTimes(1);
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "emptyParamsOp",
                expect.objectContaining({ status: "pending" })
            );
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                2,
                "SitesStore",
                "emptyParamsOp",
                expect.objectContaining({
                    status: "success",
                    success: true,
                })
            );
        });

        it("should handle operations with complex parameters object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const complexParams = {
                siteIdentifier: "site1",
                monitorId: "monitor1",
                config: {
                    timeout: 5000,
                    retries: 3,
                    metadata: {
                        region: "us-west-2",
                        tags: ["production", "api"],
                    },
                },
                timestamp: new Date().toISOString(),
                options: null,
                callback: undefined,
            };

            const mockOperation = vi.fn().mockResolvedValue(undefined);
            mockWithErrorHandling.mockImplementation(async (fn) => fn());

            await withSiteOperation(
                "complexParamsOp",
                mockOperation,
                mockDeps,
                { telemetry: complexParams }
            );

            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                1,
                "SitesStore",
                "complexParamsOp",
                expect.objectContaining({
                    ...complexParams,
                    status: "pending",
                })
            );
            expect(mockLogStoreAction).toHaveBeenNthCalledWith(
                2,
                "SitesStore",
                "complexParamsOp",
                expect.objectContaining({
                    ...complexParams,
                    status: "success",
                    success: true,
                })
            );
        });
    });
});
