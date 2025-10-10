/**
 * @module SiteService.test
 *
 * @file Test suite for SiteService
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "../../../../shared/types.js";
import type { Monitor, StatusHistory } from "../../../../shared/types.js";
import type { DatabaseService } from "../../../services/database/DatabaseService";
import type { HistoryRepository } from "../../../services/database/HistoryRepository";
import type {
    MonitorRepository,
    MonitorRepositoryTransactionAdapter,
} from "../../../services/database/MonitorRepository";
import type {
    SiteRepository,
    SiteRepositoryTransactionAdapter,
} from "../../../services/database/SiteRepository";

// Mock the logger module (must be hoisted before imports)
vi.mock("../../../utils/logger", () => {
    const createLoggerMock = () => ({
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    });
    return {
        logger: createLoggerMock(),
        diagnosticsLogger: createLoggerMock(),
    };
});

import { SiteService } from "../../../services/site/SiteService";
import { logger } from "../../../utils/logger";

// Create mock instances
const mockSiteRepository = {
    findByIdentifier: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
    createTransactionAdapter: vi.fn(),
} as unknown as SiteRepository;

const mockMonitorRepository = {
    findBySiteIdentifier: vi.fn(),
    deleteBySiteIdentifier: vi.fn(),
    createTransactionAdapter: vi.fn(),
} as unknown as MonitorRepository;

const mockHistoryRepository = {
    findByMonitorId: vi.fn(),
    deleteByMonitorId: vi.fn(),
} as unknown as HistoryRepository;

const mockDatabaseService = {
    executeTransaction: vi.fn(),
} as unknown as DatabaseService;

// Get the mocked logger instance
const mockLogger = vi.mocked(logger);

describe(SiteService, () => {
    let siteService: SiteService;

    beforeEach(() => {
        vi.clearAllMocks();
        siteService = new SiteService({
            databaseService: mockDatabaseService,
            historyRepository: mockHistoryRepository,
            monitorRepository: mockMonitorRepository,
            siteRepository: mockSiteRepository,
        });
    });

    describe("constructor", () => {
        it("should initialize with provided dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            expect(siteService).toBeInstanceOf(SiteService);
        });
    });

    describe("deleteSiteWithRelatedData", () => {
        const mockSiteIdentifier = "test-site-id";
        const mockMonitors: Monitor[] = [
            {
                id: "monitor-1",
                url: "https://example.com",
                type: "http",
                checkInterval: 300_000,
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                history: [],
            },
            {
                id: "monitor-2",
                url: "https://example2.com",
                type: "http",
                checkInterval: 600_000,
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                history: [],
            },
        ];

        let monitorTransactionAdapter: MonitorRepositoryTransactionAdapter;
        let siteTransactionAdapter: SiteRepositoryTransactionAdapter;

        beforeEach(() => {
            const mockDbConnection = Symbol("db-connection");

            monitorTransactionAdapter = {
                clearActiveOperations: vi.fn(),
                create: vi.fn(),
                deleteAll: vi.fn(),
                deleteById: vi.fn(),
                deleteBySiteIdentifier: vi.fn(),
                findBySiteIdentifier: vi.fn().mockReturnValue(mockMonitors),
                update: vi.fn(),
            } satisfies MonitorRepositoryTransactionAdapter;

            siteTransactionAdapter = {
                bulkInsert: vi.fn(),
                delete: vi.fn().mockReturnValue(true),
                deleteAll: vi.fn(),
                upsert: vi.fn(),
            } satisfies SiteRepositoryTransactionAdapter;

            mockMonitorRepository.createTransactionAdapter = vi
                .fn()
                .mockReturnValue(monitorTransactionAdapter);
            mockSiteRepository.createTransactionAdapter = vi
                .fn()
                .mockReturnValue(siteTransactionAdapter);

            mockDatabaseService.executeTransaction = vi
                .fn()
                .mockImplementation(
                    async (callback: (db: unknown) => unknown) =>
                        callback(mockDbConnection)
                );
        });

        it("should successfully delete site with all related data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Deletion", "type");

            const result =
                await siteService.deleteSiteWithRelatedData(mockSiteIdentifier);

            expect(result).toBeTruthy();
            expect(
                mockDatabaseService.executeTransaction
            ).toHaveBeenCalledTimes(1);
            expect(
                mockMonitorRepository.createTransactionAdapter
            ).toHaveBeenCalledTimes(1);
            expect(
                mockSiteRepository.createTransactionAdapter
            ).toHaveBeenCalledTimes(1);
            expect(
                monitorTransactionAdapter.findBySiteIdentifier
            ).toHaveBeenCalledWith(mockSiteIdentifier);
            expect(
                monitorTransactionAdapter.deleteBySiteIdentifier
            ).toHaveBeenCalledWith(mockSiteIdentifier);
            expect(siteTransactionAdapter.delete).toHaveBeenCalledWith(
                mockSiteIdentifier
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                `[SiteService] Successfully deleted site ${mockSiteIdentifier} with all related data`
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                `[SiteService] Deletion summary for site ${mockSiteIdentifier}: 2 monitors removed`
            );
            expect(mockLogger.warn).not.toHaveBeenCalledWith(
                expect.stringContaining("Nested transaction detected")
            );
        });

        it("should log debug messages throughout the deletion process", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            await siteService.deleteSiteWithRelatedData(mockSiteIdentifier);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                `[SiteService] Starting deletion of site ${mockSiteIdentifier} with related data`
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                `[SiteService] Found 2 monitors to delete for site ${mockSiteIdentifier}`
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[SiteService] Deleted history for 2 monitors"
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                `[SiteService] Deleted monitors for site ${mockSiteIdentifier}`
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                `[SiteService] Deletion summary for site ${mockSiteIdentifier}: 2 monitors removed`
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                `[SiteService] Successfully deleted site ${mockSiteIdentifier} with all related data`
            );
        });

        it("should handle sites with no monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            monitorTransactionAdapter.findBySiteIdentifier = vi
                .fn()
                .mockReturnValue([]);

            const result =
                await siteService.deleteSiteWithRelatedData(mockSiteIdentifier);

            expect(result).toBeTruthy();
            expect(
                monitorTransactionAdapter.deleteBySiteIdentifier
            ).toHaveBeenCalledWith(mockSiteIdentifier);
            expect(siteTransactionAdapter.delete).toHaveBeenCalledWith(
                mockSiteIdentifier
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                `[SiteService] Found 0 monitors to delete for site ${mockSiteIdentifier}`
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                `[SiteService] Deletion summary for site ${mockSiteIdentifier}: 0 monitors removed`
            );
        });

        it("should throw error for invalid site identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            await expect(
                siteService.deleteSiteWithRelatedData("")
            ).rejects.toThrow("Invalid site identifier: ");
            await expect(
                siteService.deleteSiteWithRelatedData(null as any)
            ).rejects.toThrow("Invalid site identifier: null");
        });

        it("should throw error when monitor deletion fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Monitor deletion failed");
            monitorTransactionAdapter.deleteBySiteIdentifier = vi
                .fn()
                .mockImplementation(() => {
                    throw error;
                });

            await expect(
                siteService.deleteSiteWithRelatedData(mockSiteIdentifier)
            ).rejects.toThrow(
                "Failed to delete monitors for site test-site-id: Monitor deletion failed"
            );
            expect(siteTransactionAdapter.delete).not.toHaveBeenCalled();
        });

        it("should throw error when site deletion fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            siteTransactionAdapter.delete = vi.fn().mockReturnValue(false);

            await expect(
                siteService.deleteSiteWithRelatedData(mockSiteIdentifier)
            ).rejects.toThrow("Failed to delete site test-site-id");
        });

        it("should handle string error objects when monitor deletion fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            monitorTransactionAdapter.deleteBySiteIdentifier = vi
                .fn()
                .mockImplementation(() => {
                    throw "String error";
                });

            await expect(
                siteService.deleteSiteWithRelatedData(mockSiteIdentifier)
            ).rejects.toThrow(
                "Failed to delete monitors for site test-site-id: String error"
            );
            expect(siteTransactionAdapter.delete).not.toHaveBeenCalled();
        });
    });

    describe("findByIdentifierWithDetails", () => {
        const mockSiteIdentifier = "test-site-id";
        const mockSiteRow = {
            identifier: mockSiteIdentifier,
            name: "Test Site",
            monitoring: true,
        };

        const mockMonitors: Monitor[] = [
            {
                id: "monitor-1",
                url: "https://example.com",
                type: "http",
                checkInterval: 300_000,
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                history: [],
            },
        ];

        const mockHistory: StatusHistory[] = [
            {
                status: "up",
                responseTime: 150,
                timestamp: Date.now(),
                details: "Test history entry",
            },
        ];

        beforeEach(() => {
            mockSiteRepository.findByIdentifier = vi
                .fn()
                .mockResolvedValue(mockSiteRow);
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue(mockMonitors);
            mockHistoryRepository.findByMonitorId = vi
                .fn()
                .mockResolvedValue(mockHistory);
        });

        it("should successfully find site with complete details", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const result =
                await siteService.findByIdentifierWithDetails(
                    mockSiteIdentifier
                );

            const expectedSite: Site = {
                identifier: mockSiteIdentifier,
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        url: "https://example.com",
                        type: "http",
                        checkInterval: 300_000,
                        monitoring: true,
                        responseTime: 0,
                        retryAttempts: 3,
                        status: "pending",
                        timeout: 5000,
                        history: mockHistory,
                    },
                ],
            };

            expect(result).toEqual(expectedSite);
            expect(mockSiteRepository.findByIdentifier).toHaveBeenCalledWith(
                mockSiteIdentifier
            );
            expect(
                mockMonitorRepository.findBySiteIdentifier
            ).toHaveBeenCalledWith(mockSiteIdentifier);
            expect(mockHistoryRepository.findByMonitorId).toHaveBeenCalledWith(
                "monitor-1"
            );
        });

        it("should return undefined when site is not found", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            mockSiteRepository.findByIdentifier = vi
                .fn()
                .mockResolvedValue(undefined);

            const result =
                await siteService.findByIdentifierWithDetails(
                    mockSiteIdentifier
                );

            expect(result).toBeUndefined();
            expect(mockLogger.debug).toHaveBeenCalledWith(
                `[SiteService] Site not found: ${mockSiteIdentifier}`
            );
        });

        it("should handle sites with no monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue([]);

            const result =
                await siteService.findByIdentifierWithDetails(
                    mockSiteIdentifier
                );

            expect(result).toEqual({
                identifier: mockSiteIdentifier,
                name: "Test Site",
                monitoring: true,
                monitors: [],
            });
            expect(
                mockHistoryRepository.findByMonitorId
            ).not.toHaveBeenCalled();
        });

        it("should use default name when site name is null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            mockSiteRepository.findByIdentifier = vi.fn().mockResolvedValue({
                ...mockSiteRow,
                name: null,
            });
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue([]);

            const result =
                await siteService.findByIdentifierWithDetails(
                    mockSiteIdentifier
                );

            expect(result?.name).toBe("Unnamed Site");
        });

        it("should use default name when site name is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            mockSiteRepository.findByIdentifier = vi.fn().mockResolvedValue({
                ...mockSiteRow,
                name: undefined,
            });
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue([]);

            const result =
                await siteService.findByIdentifierWithDetails(
                    mockSiteIdentifier
                );

            expect(result?.name).toBe("Unnamed Site");
        });

        it("should default monitoring to false when null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            mockSiteRepository.findByIdentifier = vi.fn().mockResolvedValue({
                ...mockSiteRow,
                monitoring: null,
            });
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue([]);

            const result =
                await siteService.findByIdentifierWithDetails(
                    mockSiteIdentifier
                );

            expect(result?.monitoring).toBeFalsy();
        });

        it("should handle multiple monitors with their history", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const multipleMonitors: Monitor[] = [
                {
                    id: "monitor-1",
                    url: "https://example.com",
                    type: "http",
                    checkInterval: 300_000,
                    monitoring: true,
                    responseTime: 0,
                    retryAttempts: 3,
                    status: "pending",
                    timeout: 5000,
                    history: [],
                },
                {
                    id: "monitor-2",
                    url: "https://example2.com",
                    type: "http",
                    checkInterval: 600_000,
                    monitoring: true,
                    responseTime: 0,
                    retryAttempts: 3,
                    status: "pending",
                    timeout: 5000,
                    history: [],
                },
            ];

            const history1: StatusHistory[] = [
                {
                    status: "up",
                    responseTime: 150,
                    timestamp: Date.now(),
                },
            ];

            const history2: StatusHistory[] = [
                {
                    status: "down",
                    responseTime: 0,
                    timestamp: Date.now(),
                },
            ];

            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue(multipleMonitors);
            mockHistoryRepository.findByMonitorId = vi
                .fn()
                .mockImplementation((monitorId) => {
                    if (monitorId === "monitor-1")
                        return Promise.resolve(history1);
                    if (monitorId === "monitor-2")
                        return Promise.resolve(history2);
                    return Promise.resolve([]);
                });

            const result =
                await siteService.findByIdentifierWithDetails(
                    mockSiteIdentifier
                );

            expect(result?.monitors).toHaveLength(2);
            expect(result?.monitors[0]!.history).toEqual(history1);
            expect(result?.monitors[1]!.history).toEqual(history2);
            expect(mockHistoryRepository.findByMonitorId).toHaveBeenCalledTimes(
                2
            );
        });

        it("should throw error for invalid site identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            await expect(
                siteService.findByIdentifierWithDetails("")
            ).rejects.toThrow("Invalid site identifier: ");
            await expect(
                siteService.findByIdentifierWithDetails(null as any)
            ).rejects.toThrow("Invalid site identifier: null");
        });

        it("should log debug messages", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            await siteService.findByIdentifierWithDetails(mockSiteIdentifier);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                `[SiteService] Found site ${mockSiteIdentifier} with 1 monitors`
            );
        });
    });

    describe("getAllWithDetails", () => {
        const mockSiteRows = [
            {
                identifier: "site-1",
                name: "Site 1",
                monitoring: true,
            },
            {
                identifier: "site-2",
                name: null,
                monitoring: false,
            },
        ];

        const mockMonitors1: Monitor[] = [
            {
                id: "monitor-1",
                url: "https://example.com",
                type: "http",
                checkInterval: 300_000,
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                history: [],
            },
        ];

        const mockHistory1: StatusHistory[] = [
            {
                status: "up",
                responseTime: 150,
                timestamp: Date.now(),
            },
        ];

        beforeEach(() => {
            mockSiteRepository.findAll = vi
                .fn()
                .mockResolvedValue(mockSiteRows);
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockImplementation((siteId) => {
                    if (siteId === "site-1")
                        return Promise.resolve(mockMonitors1);
                    return Promise.resolve([]);
                });
            mockHistoryRepository.findByMonitorId = vi
                .fn()
                .mockResolvedValue(mockHistory1);
        });

        it("should successfully get all sites with complete details", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const result = await siteService.getAllWithDetails();

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                identifier: "site-1",
                name: "Site 1",
                monitoring: true,
                monitors: [
                    {
                        ...mockMonitors1[0],
                        history: mockHistory1,
                    },
                ],
            });
            expect(result[1]).toEqual({
                identifier: "site-2",
                name: "Unnamed Site",
                monitoring: false,
                monitors: [],
            });
        });

        it("should handle empty sites list", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            mockSiteRepository.findAll = vi.fn().mockResolvedValue([]);

            const result = await siteService.getAllWithDetails();

            expect(result).toEqual([]);
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[SiteService] Loading details for 0 sites"
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[SiteService] Loaded 0 sites with complete details"
            );
        });

        it("should handle sites with no monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue([]);

            const result = await siteService.getAllWithDetails();

            expect(result).toHaveLength(2);
            expect(result[0]!.monitors).toEqual([]);
            expect(result[1]!.monitors).toEqual([]);
            expect(
                mockHistoryRepository.findByMonitorId
            ).not.toHaveBeenCalled();
        });

        it("should handle null monitoring values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const sitesWithNullMonitoring = [
                {
                    identifier: "site-1",
                    name: "Site 1",
                    monitoring: null,
                },
            ];
            mockSiteRepository.findAll = vi
                .fn()
                .mockResolvedValue(sitesWithNullMonitoring);
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue([]);

            const result = await siteService.getAllWithDetails();

            expect(result[0]!.monitoring).toBeFalsy();
        });

        it("should log debug and info messages", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            await siteService.getAllWithDetails();

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[SiteService] Loading details for 2 sites"
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[SiteService] Loaded 2 sites with complete details"
            );
        });

        it("should process sites in parallel", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const findBySiteIdentifierSpy = vi.spyOn(
                mockMonitorRepository,
                "findBySiteIdentifier"
            );

            await siteService.getAllWithDetails();

            // Both sites should be processed in parallel
            expect(findBySiteIdentifierSpy).toHaveBeenCalledWith("site-1");
            expect(findBySiteIdentifierSpy).toHaveBeenCalledWith("site-2");
        });
    });

    describe("getDisplayName", () => {
        it("should return provided name when valid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Access private method through type assertion for testing
            const result = (siteService as any).getDisplayName("Test Site");
            expect(result).toBe("Test Site");
        });

        it("should return default name when name is null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = (siteService as any).getDisplayName(null);
            expect(result).toBe("Unnamed Site");
        });

        it("should return default name when name is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = (siteService as any).getDisplayName(undefined);
            expect(result).toBe("Unnamed Site");
        });

        it("should return empty string if provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteService", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const result = (siteService as any).getDisplayName("");
            expect(result).toBe("");
        });
    });
});
