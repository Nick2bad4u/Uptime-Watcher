/**
 * Tests for siteRepository utility functions.
 * Validates site repository operations and database interactions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";

import {
    getSitesFromDatabase,
    loadSitesFromDatabase,
    type GetSitesConfig,
    type SitesLoaderConfig,
} from "../../../utils/database/siteRepository";
import type { Site, Monitor, StatusHistory, MonitorType } from "../../../types";

// Mock the logger
vi.mock("../../../utils/logger", () => ({
    monitorLogger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock repositories
const mockSiteRepository = {
    findAll: vi.fn(),
    findByIdentifier: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
} as const;

const mockMonitorRepository = {
    findBySiteIdentifier: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteBySiteIdentifier: vi.fn(),
    deleteBySiteIdentifierInternal: vi.fn(),
} as const;

const mockHistoryRepository = {
    findByMonitorId: vi.fn(),
    addEntry: vi.fn(),
    deleteByMonitorId: vi.fn(),
} as const;

const mockSettingsRepository = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
} as const;

// Mock data
const mockSiteRows = [
    { identifier: "site-1", name: "Test Site 1" },
    { identifier: "site-2", name: "Test Site 2" },
    { identifier: "site-3" }, // Site without name
];

const mockMonitors: Monitor[] = [
    {
        id: "monitor-1",
        type: "http" as MonitorType,
        url: "https://example.com",
        status: "up",
        history: [],
    },
    {
        id: "monitor-2",
        type: "http" as MonitorType,
        url: "https://example2.com",
        status: "down",
        history: [],
        monitoring: true,
    },
];

const mockHistory: StatusHistory[] = [
    {
        status: "up",
        responseTime: 100,
        timestamp: Date.now(),
    },
    {
        status: "down",
        responseTime: 0,
        timestamp: Date.now() - 1000,
    },
];

describe("siteRepository", () => {
    let eventEmitter: EventEmitter;
    let sitesMap: Map<string, Site>;
    let mockSetHistoryLimit: ReturnType<typeof vi.fn>;
    let mockStartMonitoring: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        eventEmitter = new EventEmitter();
        sitesMap = new Map();
        mockSetHistoryLimit = vi.fn();
        mockStartMonitoring = vi.fn().mockResolvedValue(true);

        // Reset all mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("getSitesFromDatabase", () => {
        let config: GetSitesConfig;

        beforeEach(() => {
            config = {
                repositories: {
                    site: mockSiteRepository as never,
                    monitor: mockMonitorRepository as never,
                    history: mockHistoryRepository as never,
                },
            };
        });

        it("should get sites with monitors and history from database", async () => {
            // Setup mocks
            mockSiteRepository.findAll.mockResolvedValue(mockSiteRows);
            mockMonitorRepository.findBySiteIdentifier.mockImplementation((siteId: string) => {
                if (siteId === "site-1") return Promise.resolve([mockMonitors[0]]);
                if (siteId === "site-2") return Promise.resolve([mockMonitors[1]]);
                return Promise.resolve([]);
            });
            mockHistoryRepository.findByMonitorId.mockImplementation((monitorId: string) => {
                if (monitorId === "monitor-1" || monitorId === "monitor-2") {
                    return Promise.resolve(mockHistory);
                }
                return Promise.resolve([]);
            });

            const result = await getSitesFromDatabase(config);

            expect(mockSiteRepository.findAll).toHaveBeenCalledOnce();
            expect(mockMonitorRepository.findBySiteIdentifier).toHaveBeenCalledTimes(3);
            expect(mockHistoryRepository.findByMonitorId).toHaveBeenCalledTimes(2);

            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({
                identifier: "site-1",
                name: "Test Site 1",
                monitors: [{ ...mockMonitors[0], history: mockHistory }],
            });
            expect(result[1]).toEqual({
                identifier: "site-2",
                name: "Test Site 2",
                monitors: [{ ...mockMonitors[1], history: mockHistory }],
            });
            expect(result[2]).toEqual({
                identifier: "site-3",
                monitors: [],
            });
        });

        it("should handle sites without names", async () => {
            const siteRowsWithoutNames = [{ identifier: "site-1" }];
            mockSiteRepository.findAll.mockResolvedValue(siteRowsWithoutNames);
            mockMonitorRepository.findBySiteIdentifier.mockResolvedValue([]);

            const result = await getSitesFromDatabase(config);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                identifier: "site-1",
                monitors: [],
            });
            expect(result[0]).not.toHaveProperty("name");
        });

        it("should handle monitors without IDs", async () => {
            const monitorWithoutId = { ...mockMonitors[0] };
            delete monitorWithoutId.id;

            mockSiteRepository.findAll.mockResolvedValue([mockSiteRows[0]]);
            mockMonitorRepository.findBySiteIdentifier.mockResolvedValue([monitorWithoutId]);

            const result = await getSitesFromDatabase(config);

            expect(mockHistoryRepository.findByMonitorId).not.toHaveBeenCalled();
            expect(result[0].monitors[0]).toEqual(monitorWithoutId);
            expect(result[0].monitors[0]).not.toHaveProperty("id");
        });

        it("should handle empty database", async () => {
            mockSiteRepository.findAll.mockResolvedValue([]);

            const result = await getSitesFromDatabase(config);

            expect(result).toHaveLength(0);
            expect(mockMonitorRepository.findBySiteIdentifier).not.toHaveBeenCalled();
            expect(mockHistoryRepository.findByMonitorId).not.toHaveBeenCalled();
        });
    });

    describe("loadSitesFromDatabase", () => {
        let config: SitesLoaderConfig;

        beforeEach(() => {
            config = {
                repositories: {
                    site: mockSiteRepository as never,
                    monitor: mockMonitorRepository as never,
                    history: mockHistoryRepository as never,
                    settings: mockSettingsRepository as never,
                },
                sites: sitesMap,
                setHistoryLimit: mockSetHistoryLimit,
                startMonitoring: mockStartMonitoring,
                eventEmitter,
            };
        });

        it("should successfully load sites from database", async () => {
            // Setup mocks
            mockSiteRepository.findAll.mockResolvedValue(mockSiteRows);
            mockMonitorRepository.findBySiteIdentifier.mockImplementation((siteId: string) => {
                if (siteId === "site-1") return Promise.resolve([mockMonitors[0]]);
                if (siteId === "site-2") return Promise.resolve([{ ...mockMonitors[1], monitoring: true }]);
                return Promise.resolve([]);
            });
            mockHistoryRepository.findByMonitorId.mockResolvedValue(mockHistory);
            mockSettingsRepository.get.mockResolvedValue("100");

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            expect(result.sitesLoaded).toBe(3);
            expect(result.message).toBe("Successfully loaded 3 sites and started monitoring");
            expect(sitesMap.size).toBe(3);
            expect(mockSetHistoryLimit).toHaveBeenCalledWith(100);
            expect(mockStartMonitoring).toHaveBeenCalledWith("site-2", "monitor-2");
        });

        it("should handle sites with site-level monitoring enabled", async () => {
            const siteWithMonitoring = [{ identifier: "site-1", name: "Site 1", monitoring: true }];
            const monitorForSite = { ...mockMonitors[0], id: "monitor-1" };
            
            mockSiteRepository.findAll.mockResolvedValue(siteWithMonitoring);
            mockMonitorRepository.findBySiteIdentifier.mockResolvedValue([monitorForSite]);
            mockHistoryRepository.findByMonitorId.mockResolvedValue([]);
            mockSettingsRepository.get.mockResolvedValue(null);

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            expect(mockStartMonitoring).toHaveBeenCalledWith("site-1", "monitor-1");
            expect(sitesMap.get("site-1")).toEqual({
                identifier: "site-1",
                name: "Site 1",
                monitoring: true,
                monitors: [monitorForSite],
            });
        });

        it("should handle site-level monitoring with monitors without IDs", async () => {
            const siteWithMonitoring = [{ identifier: "site-1", name: "Site 1", monitoring: true }];
            const monitorWithoutId = { ...mockMonitors[0] };
            delete monitorWithoutId.id;
            
            mockSiteRepository.findAll.mockResolvedValue(siteWithMonitoring);
            mockMonitorRepository.findBySiteIdentifier.mockResolvedValue([monitorWithoutId]);
            mockHistoryRepository.findByMonitorId.mockResolvedValue([]);
            mockSettingsRepository.get.mockResolvedValue(null);

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            // No monitoring should be started for monitors without IDs
            expect(mockStartMonitoring).not.toHaveBeenCalled();
        });

        it("should handle mixed monitoring scenarios", async () => {
            const sites = [
                { identifier: "site-1", name: "Site 1", monitoring: true }, // Site-level monitoring
                { identifier: "site-2", name: "Site 2" }, // Individual monitor monitoring
            ];
            const monitorsForSite1 = [{ ...mockMonitors[0], id: "monitor-1" }];
            const monitorsForSite2 = [{ ...mockMonitors[1], id: "monitor-2", monitoring: true }];
            
            mockSiteRepository.findAll.mockResolvedValue(sites);
            mockMonitorRepository.findBySiteIdentifier
                .mockResolvedValueOnce(monitorsForSite1)  // For site-1
                .mockResolvedValueOnce(monitorsForSite2); // For site-2
            mockHistoryRepository.findByMonitorId.mockResolvedValue([]);
            mockSettingsRepository.get.mockResolvedValue(null);

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            expect(mockStartMonitoring).toHaveBeenCalledWith("site-1", "monitor-1"); // Site-level
            expect(mockStartMonitoring).toHaveBeenCalledWith("site-2", "monitor-2"); // Individual
        });

        it("should load history limit from settings", async () => {
            mockSiteRepository.findAll.mockResolvedValue([]);
            mockSettingsRepository.get.mockResolvedValue("50");

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            expect(mockSetHistoryLimit).toHaveBeenCalledWith(50);
        });

        it("should handle invalid history limit settings", async () => {
            mockSiteRepository.findAll.mockResolvedValue([]);
            mockSettingsRepository.get.mockResolvedValue("invalid");

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            expect(mockSetHistoryLimit).not.toHaveBeenCalled();
        });

        it("should handle negative history limit", async () => {
            mockSiteRepository.findAll.mockResolvedValue([]);
            mockSettingsRepository.get.mockResolvedValue("-10");

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            expect(mockSetHistoryLimit).not.toHaveBeenCalled();
        });

        it("should handle missing history limit setting", async () => {
            mockSiteRepository.findAll.mockResolvedValue([]);
            mockSettingsRepository.get.mockResolvedValue(null);

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            expect(mockSetHistoryLimit).not.toHaveBeenCalled();
        });

        it("should handle settings repository errors", async () => {
            mockSiteRepository.findAll.mockResolvedValue([]);
            mockSettingsRepository.get.mockRejectedValue(new Error("Settings error"));

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            expect(mockSetHistoryLimit).not.toHaveBeenCalled();
        });

        it("should handle monitors without IDs during monitoring setup", async () => {
            const siteData = [{ identifier: "site-1", name: "Site 1" }];
            const monitorWithoutId = { ...mockMonitors[0], monitoring: true };
            delete monitorWithoutId.id;
            
            mockSiteRepository.findAll.mockResolvedValue(siteData);
            mockMonitorRepository.findBySiteIdentifier.mockResolvedValue([monitorWithoutId]);
            mockSettingsRepository.get.mockResolvedValue(null);

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            expect(mockStartMonitoring).not.toHaveBeenCalled();
        });

        it("should clear existing sites before loading new ones", async () => {
            // Pre-populate the sites map
            sitesMap.set("existing-site", {
                identifier: "existing-site",
                name: "Existing Site",
                monitors: [],
            });

            mockSiteRepository.findAll.mockResolvedValue([mockSiteRows[0]]);
            mockMonitorRepository.findBySiteIdentifier.mockResolvedValue([]);
            mockHistoryRepository.findByMonitorId.mockResolvedValue([]);
            mockSettingsRepository.get.mockResolvedValue(null);

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            expect(result.sitesLoaded).toBe(1);
            expect(sitesMap.has("existing-site")).toBe(false);
            expect(sitesMap.has("site-1")).toBe(true);
        });

        it("should handle database errors and emit error events", async () => {
            const mockError = new Error("Database connection failed");
            mockSiteRepository.findAll.mockRejectedValue(mockError);

            let emittedError: Error | null = null;
            eventEmitter.once("error", (error) => {
                emittedError = error;
            });

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(false);
            expect(result.sitesLoaded).toBe(0);
            expect(result.message).toContain("Failed to load sites from database");
            expect(result.message).toContain("Database connection failed");

            // Check that an error was emitted
            expect(emittedError).toBeInstanceOf(Error);
            expect(emittedError?.message).toContain("Failed to load sites from database");
        });

        it("should handle non-Error objects thrown", async () => {
            mockSiteRepository.findAll.mockRejectedValue("String error");

            // Prevent error event from failing test
            eventEmitter.on("error", () => {
                // Ignore errors for this test
            });

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(false);
            expect(result.sitesLoaded).toBe(0);
            expect(result.message).toContain("Failed to load sites from database");
            expect(result.message).toContain("String error");
        });

        it("should handle zero history limit", async () => {
            mockSiteRepository.findAll.mockResolvedValue([]);
            mockSettingsRepository.get.mockResolvedValue("0");

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            expect(mockSetHistoryLimit).not.toHaveBeenCalled();
        });

        it("should load sites without monitors", async () => {
            mockSiteRepository.findAll.mockResolvedValue([{ identifier: "site-1", name: "Site 1" }]);
            mockMonitorRepository.findBySiteIdentifier.mockResolvedValue([]);
            mockSettingsRepository.get.mockResolvedValue(null);

            const result = await loadSitesFromDatabase(config);

            expect(result.success).toBe(true);
            expect(result.sitesLoaded).toBe(1);
            expect(sitesMap.get("site-1")).toEqual({
                identifier: "site-1",
                name: "Site 1",
                monitors: [],
            });
        });
    });
});
