/**
 * @fileoverview Test suite for SiteService
 * @module SiteService.test
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "../../../types";
import type { Monitor, StatusHistory } from "../../../types";
import type { DatabaseService } from "../../../services/database/DatabaseService";
import type { HistoryRepository } from "../../../services/database/HistoryRepository";
import type { MonitorRepository } from "../../../services/database/MonitorRepository";
import type { SiteRepository } from "../../../services/database/SiteRepository";

// Mock the logger module (must be hoisted before imports)
vi.mock("../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

import { SiteService } from "../../../services/site/SiteService";
import { logger } from "../../../utils/logger";

// Create mock instances
const mockSiteRepository = {
    findByIdentifier: vi.fn(),
    findAll: vi.fn(),
    delete: vi.fn(),
} as unknown as SiteRepository;

const mockMonitorRepository = {
    findBySiteIdentifier: vi.fn(),
    deleteBySiteIdentifier: vi.fn(),
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

describe("SiteService", () => {
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
        it("should initialize with provided dependencies", () => {
            expect(siteService).toBeInstanceOf(SiteService);
        });
    });

    describe("deleteSiteWithRelatedData", () => {
        const mockSiteIdentifier = "test-site-id";
        const mockMonitors: Monitor[] = [
            {
                id: "monitor-1",
                siteIdentifier: mockSiteIdentifier,
                name: "Monitor 1",
                url: "https://example.com",
                type: "http",
                interval: 300,
                enabled: true,
                history: [],
            },
            {
                id: "monitor-2",
                siteIdentifier: mockSiteIdentifier,
                name: "Monitor 2",
                url: "https://example2.com",
                type: "http",
                interval: 600,
                enabled: true,
                history: [],
            },
        ];

        beforeEach(() => {
            // Mock transaction to execute the callback immediately
            mockDatabaseService.executeTransaction = vi
                .fn()
                .mockImplementation(async (callback) => callback());
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue(mockMonitors);
            mockHistoryRepository.deleteByMonitorId = vi
                .fn()
                .mockResolvedValue(true);
            mockMonitorRepository.deleteBySiteIdentifier = vi
                .fn()
                .mockResolvedValue(true);
            mockSiteRepository.delete = vi.fn().mockResolvedValue(true);
        });

        it("should successfully delete site with all related data", async () => {
            const result = await siteService.deleteSiteWithRelatedData(
                mockSiteIdentifier
            );

            expect(result).toBe(true);
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalledTimes(
                1
            );
            expect(mockMonitorRepository.findBySiteIdentifier).toHaveBeenCalledWith(
                mockSiteIdentifier
            );
            expect(mockHistoryRepository.deleteByMonitorId).toHaveBeenCalledTimes(
                2
            );
            expect(mockHistoryRepository.deleteByMonitorId).toHaveBeenCalledWith(
                "monitor-1"
            );
            expect(mockHistoryRepository.deleteByMonitorId).toHaveBeenCalledWith(
                "monitor-2"
            );
            expect(mockMonitorRepository.deleteBySiteIdentifier).toHaveBeenCalledWith(
                mockSiteIdentifier
            );
            expect(mockSiteRepository.delete).toHaveBeenCalledWith(
                mockSiteIdentifier
            );
        });

        it("should log debug messages throughout the deletion process", async () => {
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
            expect(mockLogger.info).toHaveBeenCalledWith(
                `[SiteService] Successfully deleted site ${mockSiteIdentifier} with all related data`
            );
        });

        it("should handle sites with no monitors", async () => {
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue([]);

            const result = await siteService.deleteSiteWithRelatedData(
                mockSiteIdentifier
            );

            expect(result).toBe(true);
            expect(mockHistoryRepository.deleteByMonitorId).not.toHaveBeenCalled();
            expect(mockLogger.debug).toHaveBeenCalledWith(
                `[SiteService] Found 0 monitors to delete for site ${mockSiteIdentifier}`
            );
        });

        it("should throw error for invalid site identifier", async () => {
            await expect(
                siteService.deleteSiteWithRelatedData("")
            ).rejects.toThrow("Invalid site identifier: ");
            await expect(
                siteService.deleteSiteWithRelatedData(null as any)
            ).rejects.toThrow("Invalid site identifier: null");
        });

        it("should throw error when history deletion fails", async () => {
            const error = new Error("History deletion failed");
            mockHistoryRepository.deleteByMonitorId = vi
                .fn()
                .mockRejectedValueOnce(error);

            await expect(
                siteService.deleteSiteWithRelatedData(mockSiteIdentifier)
            ).rejects.toThrow(
                "Failed to delete history for monitor monitor-1 in site test-site-id: History deletion failed"
            );
        });

        it("should throw error when monitor deletion fails", async () => {
            const error = new Error("Monitor deletion failed");
            mockMonitorRepository.deleteBySiteIdentifier = vi
                .fn()
                .mockRejectedValueOnce(error);

            await expect(
                siteService.deleteSiteWithRelatedData(mockSiteIdentifier)
            ).rejects.toThrow(
                "Failed to delete monitors for site test-site-id: Monitor deletion failed"
            );
        });

        it("should throw error when site deletion fails", async () => {
            mockSiteRepository.delete = vi.fn().mockResolvedValue(false);

            await expect(
                siteService.deleteSiteWithRelatedData(mockSiteIdentifier)
            ).rejects.toThrow("Failed to delete site test-site-id");
        });

        it("should handle string error objects when history deletion fails", async () => {
            mockHistoryRepository.deleteByMonitorId = vi
                .fn()
                .mockRejectedValueOnce("String error");

            await expect(
                siteService.deleteSiteWithRelatedData(mockSiteIdentifier)
            ).rejects.toThrow(
                "Failed to delete history for monitor monitor-1 in site test-site-id: String error"
            );
        });

        it("should handle string error objects when monitor deletion fails", async () => {
            mockMonitorRepository.deleteBySiteIdentifier = vi
                .fn()
                .mockRejectedValueOnce("String error");

            await expect(
                siteService.deleteSiteWithRelatedData(mockSiteIdentifier)
            ).rejects.toThrow(
                "Failed to delete monitors for site test-site-id: String error"
            );
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
                siteIdentifier: mockSiteIdentifier,
                name: "Monitor 1",
                url: "https://example.com",
                type: "http",
                interval: 300,
                enabled: true,
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

        it("should successfully find site with complete details", async () => {
            const result = await siteService.findByIdentifierWithDetails(
                mockSiteIdentifier
            );

            const expectedSite: Site = {
                identifier: mockSiteIdentifier,
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        ...mockMonitors[0],
                        history: mockHistory,
                    },
                ],
            };

            expect(result).toEqual(expectedSite);
            expect(mockSiteRepository.findByIdentifier).toHaveBeenCalledWith(
                mockSiteIdentifier
            );
            expect(mockMonitorRepository.findBySiteIdentifier).toHaveBeenCalledWith(
                mockSiteIdentifier
            );
            expect(mockHistoryRepository.findByMonitorId).toHaveBeenCalledWith(
                "monitor-1"
            );
        });

        it("should return undefined when site is not found", async () => {
            mockSiteRepository.findByIdentifier = vi
                .fn()
                .mockResolvedValue(undefined);

            const result = await siteService.findByIdentifierWithDetails(
                mockSiteIdentifier
            );

            expect(result).toBeUndefined();
            expect(mockLogger.debug).toHaveBeenCalledWith(
                `[SiteService] Site not found: ${mockSiteIdentifier}`
            );
        });

        it("should handle sites with no monitors", async () => {
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue([]);

            const result = await siteService.findByIdentifierWithDetails(
                mockSiteIdentifier
            );

            expect(result).toEqual({
                identifier: mockSiteIdentifier,
                name: "Test Site",
                monitoring: true,
                monitors: [],
            });
            expect(mockHistoryRepository.findByMonitorId).not.toHaveBeenCalled();
        });

        it("should use default name when site name is null", async () => {
            mockSiteRepository.findByIdentifier = vi.fn().mockResolvedValue({
                ...mockSiteRow,
                name: null,
            });
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue([]);

            const result = await siteService.findByIdentifierWithDetails(
                mockSiteIdentifier
            );

            expect(result?.name).toBe("Unnamed Site");
        });

        it("should use default name when site name is undefined", async () => {
            mockSiteRepository.findByIdentifier = vi.fn().mockResolvedValue({
                ...mockSiteRow,
                name: undefined,
            });
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue([]);

            const result = await siteService.findByIdentifierWithDetails(
                mockSiteIdentifier
            );

            expect(result?.name).toBe("Unnamed Site");
        });

        it("should default monitoring to false when null", async () => {
            mockSiteRepository.findByIdentifier = vi.fn().mockResolvedValue({
                ...mockSiteRow,
                monitoring: null,
            });
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue([]);

            const result = await siteService.findByIdentifierWithDetails(
                mockSiteIdentifier
            );

            expect(result?.monitoring).toBe(false);
        });

        it("should handle multiple monitors with their history", async () => {
            const multipleMonitors: Monitor[] = [
                {
                    id: "monitor-1",
                    siteIdentifier: mockSiteIdentifier,
                    name: "Monitor 1",
                    url: "https://example.com",
                    type: "http",
                    interval: 300,
                    enabled: true,
                    history: [],
                },
                {
                    id: "monitor-2",
                    siteIdentifier: mockSiteIdentifier,
                    name: "Monitor 2",
                    url: "https://example2.com",
                    type: "http",
                    interval: 600,
                    enabled: true,
                    history: [],
                },
            ];

            const history1: HistoryEntry[] = [
                {
                    id: "history-1",
                    monitorId: "monitor-1",
                    status: "up",
                    responseTime: 150,
                    timestamp: new Date(),
                    errorMessage: null,
                },
            ];

            const history2: HistoryEntry[] = [
                {
                    id: "history-2",
                    monitorId: "monitor-2",
                    status: "down",
                    responseTime: 0,
                    timestamp: new Date(),
                    errorMessage: "Connection timeout",
                },
            ];

            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue(multipleMonitors);
            mockHistoryRepository.findByMonitorId = vi
                .fn()
                .mockImplementation((monitorId) => {
                    if (monitorId === "monitor-1") return Promise.resolve(history1);
                    if (monitorId === "monitor-2") return Promise.resolve(history2);
                    return Promise.resolve([]);
                });

            const result = await siteService.findByIdentifierWithDetails(
                mockSiteIdentifier
            );

            expect(result?.monitors).toHaveLength(2);
            expect(result?.monitors[0].history).toEqual(history1);
            expect(result?.monitors[1].history).toEqual(history2);
            expect(mockHistoryRepository.findByMonitorId).toHaveBeenCalledTimes(
                2
            );
        });

        it("should throw error for invalid site identifier", async () => {
            await expect(
                siteService.findByIdentifierWithDetails("")
            ).rejects.toThrow("Invalid site identifier: ");
            await expect(
                siteService.findByIdentifierWithDetails(null as any)
            ).rejects.toThrow("Invalid site identifier: null");
        });

        it("should log debug messages", async () => {
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
                siteIdentifier: "site-1",
                name: "Monitor 1",
                url: "https://example.com",
                type: "http",
                interval: 300,
                enabled: true,
                history: [],
            },
        ];

        const mockHistory1: HistoryEntry[] = [
            {
                id: "history-1",
                monitorId: "monitor-1",
                status: "up",
                responseTime: 150,
                timestamp: new Date(),
                errorMessage: null,
            },
        ];

        beforeEach(() => {
            mockSiteRepository.findAll = vi.fn().mockResolvedValue(mockSiteRows);
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockImplementation((siteId) => {
                    if (siteId === "site-1") return Promise.resolve(mockMonitors1);
                    return Promise.resolve([]);
                });
            mockHistoryRepository.findByMonitorId = vi
                .fn()
                .mockResolvedValue(mockHistory1);
        });

        it("should successfully get all sites with complete details", async () => {
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

        it("should handle empty sites list", async () => {
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

        it("should handle sites with no monitors", async () => {
            mockMonitorRepository.findBySiteIdentifier = vi
                .fn()
                .mockResolvedValue([]);

            const result = await siteService.getAllWithDetails();

            expect(result).toHaveLength(2);
            expect(result[0].monitors).toEqual([]);
            expect(result[1].monitors).toEqual([]);
            expect(mockHistoryRepository.findByMonitorId).not.toHaveBeenCalled();
        });

        it("should handle null monitoring values", async () => {
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

            expect(result[0].monitoring).toBe(false);
        });

        it("should log debug and info messages", async () => {
            await siteService.getAllWithDetails();

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[SiteService] Loading details for 2 sites"
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[SiteService] Loaded 2 sites with complete details"
            );
        });

        it("should process sites in parallel", async () => {
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
        it("should return provided name when valid", () => {
            // Access private method through type assertion for testing
            const result = (siteService as any).getDisplayName("Test Site");
            expect(result).toBe("Test Site");
        });

        it("should return default name when name is null", () => {
            const result = (siteService as any).getDisplayName(null);
            expect(result).toBe("Unnamed Site");
        });

        it("should return default name when name is undefined", () => {
            const result = (siteService as any).getDisplayName(undefined);
            expect(result).toBe("Unnamed Site");
        });

        it("should return empty string if provided", () => {
            const result = (siteService as any).getDisplayName("");
            expect(result).toBe("");
        });
    });
});
