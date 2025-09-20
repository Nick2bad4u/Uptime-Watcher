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
}));

// Mock the store action logging
vi.mock("../../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
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
    getSiteById,
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

        mockDeps = {
            getSites: vi.fn(() => mockSites),
            setSites: vi.fn(),
            addSite: vi.fn(),
            removeSite: vi.fn().mockResolvedValue(true),
            syncSites: vi.fn().mockResolvedValue(undefined),
        };

        // Default mock implementations
        mockWithErrorHandling.mockImplementation(async (fn) => fn());
        mockCreateStoreErrorHandler.mockReturnValue({
            clearError: vi.fn(),
            setError: vi.fn(),
            setLoading: vi.fn(),
        });
        mockUpdateMonitorInSite.mockReturnValue(mockSites[0]!);
        mockElectronAPI.sites.updateSite.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe(getSiteById, () => {
        it("should return site when found", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = getSiteById("site1", mockDeps);

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

            expect(() => getSiteById("nonexistent", mockDeps)).toThrow(
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

            expect(() => getSiteById("site1", mockDeps)).toThrow(
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

            await updateMonitorAndSave("site1", "monitor1", updates, mockDeps);

            expect(mockDeps.getSites).toHaveBeenCalledTimes(1);
            expect(mockUpdateMonitorInSite).toHaveBeenCalledWith(
                mockSites[0]!,
                "monitor1",
                updates
            );
            expect(mockElectronAPI.sites.updateSite).toHaveBeenCalledWith(
                "site1",
                { monitors: updatedSite.monitors }
            );
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
            const params = { siteId: "site1" };

            await withSiteOperation(
                "testOperation",
                mockOperation,
                params,
                mockDeps
            );

            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SitesStore",
                "testOperation",
                params
            );
            expect(mockCreateStoreErrorHandler).toHaveBeenCalledWith(
                "sites-operations",
                "testOperation"
            );
            expect(mockWithErrorHandling).toHaveBeenCalledTimes(1);

            // Get the operation passed to withErrorHandling
            const errorHandlingCall = mockWithErrorHandling.mock.calls[0]!;
            const wrappedOperation = errorHandlingCall[0];

            // Execute the wrapped operation to test its behavior
            await wrappedOperation();

            expect(mockOperation).toHaveBeenCalledTimes(2); // Once in main call, once in test
            expect(mockDeps.syncSites).toHaveBeenCalledTimes(2); // Once in main call, once in test
        });

        it("should execute operation without sync when syncAfter is false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: operationHelpers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockOperation = vi.fn().mockResolvedValue(undefined);
            const params = { siteId: "site1" };

            await withSiteOperation(
                "testOperation",
                mockOperation,
                params,
                mockDeps,
                false
            );

            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SitesStore",
                "testOperation",
                params
            );
            expect(mockWithErrorHandling).toHaveBeenCalledTimes(1);

            // Get the operation passed to withErrorHandling
            const errorHandlingCall = mockWithErrorHandling.mock.calls[0]!;
            const wrappedOperation = errorHandlingCall[0];

            // Execute the wrapped operation to test its behavior
            await wrappedOperation();

            expect(mockOperation).toHaveBeenCalledTimes(2); // Once in main call, once in test
            expect(mockDeps.syncSites).not.toHaveBeenCalled();
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
            const params = { siteId: "site1" };

            // Mock withErrorHandling to throw the error
            mockWithErrorHandling.mockRejectedValue(operationError);

            await expect(
                withSiteOperation(
                    "testOperation",
                    mockOperation,
                    params,
                    mockDeps
                )
            ).rejects.toThrow("Operation failed");

            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SitesStore",
                "testOperation",
                params
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
            const params = { siteId: "site1" };

            // Mock withErrorHandling to execute and re-throw sync error
            mockWithErrorHandling.mockImplementation(async (fn) => {
                await fn();
            });

            await expect(
                withSiteOperation(
                    "testOperation",
                    mockOperation,
                    params,
                    mockDeps
                )
            ).rejects.toThrow("Sync failed");

            expect(mockOperation).toHaveBeenCalledTimes(1);
            expect(mockDeps.syncSites).toHaveBeenCalledTimes(1);
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
            const params = { siteId: "site1" };

            // Mock withErrorHandling to execute the function and return its result
            mockWithErrorHandling.mockImplementation(async (fn) => fn());

            const result = await withSiteOperationReturning(
                "testOperation",
                mockOperation,
                params,
                mockDeps
            );

            expect(result).toEqual(expectedResult);
            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SitesStore",
                "testOperation",
                params
            );
            expect(mockCreateStoreErrorHandler).toHaveBeenCalledWith(
                "sites-operations",
                "testOperation"
            );
            expect(mockWithErrorHandling).toHaveBeenCalledTimes(1);

            // Get the operation passed to withErrorHandling
            const errorHandlingCall = mockWithErrorHandling.mock.calls[0]!;
            const wrappedOperation = errorHandlingCall[0];

            // Execute the wrapped operation to test its behavior
            const wrappedResult = await wrappedOperation();

            expect(wrappedResult).toEqual(expectedResult);
            expect(mockOperation).toHaveBeenCalledTimes(2); // Once in main call, once in test
            expect(mockDeps.syncSites).toHaveBeenCalledTimes(2); // Once in main call, once in test
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
            const params = { siteId: "site1" };

            // Mock withErrorHandling to execute the function and return its result
            mockWithErrorHandling.mockImplementation(async (fn) => fn());

            const result = await withSiteOperationReturning(
                "testOperation",
                mockOperation,
                params,
                mockDeps,
                false
            );

            expect(result).toEqual(expectedResult);
            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SitesStore",
                "testOperation",
                params
            );
            expect(mockWithErrorHandling).toHaveBeenCalledTimes(1);

            // Get the operation passed to withErrorHandling
            const errorHandlingCall = mockWithErrorHandling.mock.calls[0]!;
            const wrappedOperation = errorHandlingCall[0];

            // Execute the wrapped operation to test its behavior
            const wrappedResult = await wrappedOperation();

            expect(wrappedResult).toEqual(expectedResult);
            expect(mockOperation).toHaveBeenCalledTimes(2); // Once in main call, once in test
            expect(mockDeps.syncSites).not.toHaveBeenCalled();
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
            const params = { siteId: "site1" };

            // Mock withErrorHandling to throw the error
            mockWithErrorHandling.mockRejectedValue(operationError);

            await expect(
                withSiteOperationReturning(
                    "testOperation",
                    mockOperation,
                    params,
                    mockDeps
                )
            ).rejects.toThrow("Operation failed");

            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SitesStore",
                "testOperation",
                params
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
            const params = { siteId: "site1" };

            // Mock withErrorHandling to execute and re-throw sync error
            mockWithErrorHandling.mockImplementation(async (fn) => {
                await fn();
            });

            await expect(
                withSiteOperationReturning(
                    "testOperation",
                    mockOperation,
                    params,
                    mockDeps
                )
            ).rejects.toThrow("Sync failed");

            expect(mockOperation).toHaveBeenCalledTimes(1);
            expect(mockDeps.syncSites).toHaveBeenCalledTimes(1);
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
                {},
                mockDeps,
                false
            );
            expect(stringResult).toBe("string result");

            // Test with number result
            const numberOperation = vi.fn().mockResolvedValue(42);
            const numberResult = await withSiteOperationReturning(
                "numberOp",
                numberOperation,
                {},
                mockDeps,
                false
            );
            expect(numberResult).toBe(42);

            // Test with boolean result
            const booleanOperation = vi.fn().mockResolvedValue(true);
            const booleanResult = await withSiteOperationReturning(
                "booleanOp",
                booleanOperation,
                {},
                mockDeps,
                false
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
                {},
                mockDeps,
                false
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
                {},
                mockDeps,
                false
            );
            expect(nullResult).toBeNull();

            // Test with undefined result
            const undefinedOperation = vi.fn().mockResolvedValue(undefined);
            const undefinedResult = await withSiteOperationReturning(
                "undefinedOp",
                undefinedOperation,
                {},
                mockDeps,
                false
            );
            expect(undefinedResult).toBeUndefined();
        });
    });

    describe("Edge Cases and Error Scenarios", () => {
        it("should handle getSiteById with sites array containing null/undefined entries", async ({
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

            const result = getSiteById("site1", mockDeps);
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

            await withSiteOperation(
                "emptyParamsOp",
                mockOperation,
                {},
                mockDeps
            );

            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SitesStore",
                "emptyParamsOp",
                {}
            );
            expect(mockOperation).toHaveBeenCalledTimes(1);
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
                siteId: "site1",
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
                complexParams,
                mockDeps
            );

            expect(mockLogStoreAction).toHaveBeenCalledWith(
                "SitesStore",
                "complexParamsOp",
                complexParams
            );
        });
    });
});
