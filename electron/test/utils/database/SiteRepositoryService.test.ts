/**
 * Tests for SiteRepositoryService.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";

import { Site, Monitor, StatusHistory } from "../../../types";
import {
    SiteRepositoryService,
    SiteLoadingOrchestrator,
    SiteCache,
    SiteLoadingError,
    ISiteRepository,
    IMonitorRepository,
    IHistoryRepository,
    ISettingsRepository,
    ILogger,
    MonitoringConfig,
} from "../../../utils/database";

describe("SiteRepositoryService", () => {
    let siteRepositoryService: SiteRepositoryService;
    let mockSiteRepository: ISiteRepository;
    let mockMonitorRepository: IMonitorRepository;
    let mockHistoryRepository: IHistoryRepository;
    let mockSettingsRepository: ISettingsRepository;
    let mockLogger: ILogger;
    let mockEventEmitter: EventEmitter;

    beforeEach(() => {
        mockSiteRepository = {
            findAll: vi.fn(),
            findByIdentifier: vi.fn(),
            upsert: vi.fn(),
            delete: vi.fn(),
        };

        mockMonitorRepository = {
            findBySiteIdentifier: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            deleteBySiteIdentifier: vi.fn(),
        };

        mockHistoryRepository = {
            findByMonitorId: vi.fn(),
            create: vi.fn(),
            deleteByMonitorId: vi.fn(),
        };

        mockSettingsRepository = {
            get: vi.fn(),
            set: vi.fn(),
            delete: vi.fn(),
        };

        mockLogger = {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        };

        mockEventEmitter = new EventEmitter();

        siteRepositoryService = new SiteRepositoryService({
            repositories: {
                site: mockSiteRepository,
                monitor: mockMonitorRepository,
                history: mockHistoryRepository,
                settings: mockSettingsRepository,
            },
            logger: mockLogger,
            eventEmitter: mockEventEmitter,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("getSitesFromDatabase", () => {
        it("should fetch sites with monitors and history", async () => {
            const siteData = { identifier: "site1", name: "Test Site" };
            const monitor: Monitor = {
                id: "monitor1",
                type: "http",
                status: "up",
                history: [],
                url: "https://example.com",
            };
            const history: StatusHistory[] = [
                { timestamp: Date.now(), status: "up", responseTime: 100 },
            ];

            vi.mocked(mockSiteRepository.findAll).mockResolvedValue([siteData]);
            vi.mocked(mockMonitorRepository.findBySiteIdentifier).mockResolvedValue([monitor]);
            vi.mocked(mockHistoryRepository.findByMonitorId).mockResolvedValue(history);

            const result = await siteRepositoryService.getSitesFromDatabase();

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                identifier: "site1",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "up",
                        history: history,
                        url: "https://example.com",
                    },
                ],
            });
            expect(mockSiteRepository.findAll).toHaveBeenCalledOnce();
            expect(mockMonitorRepository.findBySiteIdentifier).toHaveBeenCalledWith("site1");
            expect(mockHistoryRepository.findByMonitorId).toHaveBeenCalledWith("monitor1");
        });

        it("should handle errors and wrap them in SiteLoadingError", async () => {
            const error = new Error("Database error");
            vi.mocked(mockSiteRepository.findAll).mockRejectedValue(error);

            await expect(siteRepositoryService.getSitesFromDatabase()).rejects.toThrow(SiteLoadingError);
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to fetch sites from database: Database error",
                error
            );
        });

        it("should handle sites without names", async () => {
            const siteData = { identifier: "site1" };
            vi.mocked(mockSiteRepository.findAll).mockResolvedValue([siteData]);
            vi.mocked(mockMonitorRepository.findBySiteIdentifier).mockResolvedValue([]);

            const result = await siteRepositoryService.getSitesFromDatabase();

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                identifier: "site1",
                monitors: [],
            });
        });
    });

    describe("loadSitesIntoCache", () => {
        it("should load sites into cache and log success", async () => {
            const siteCache = new SiteCache();
            const sites: Site[] = [
                { identifier: "site1", name: "Site 1", monitors: [] },
                { identifier: "site2", name: "Site 2", monitors: [] },
            ];

            vi.spyOn(siteRepositoryService, "getSitesFromDatabase").mockResolvedValue(sites);

            await siteRepositoryService.loadSitesIntoCache(siteCache);

            expect(siteCache.size()).toBe(2);
            expect(siteCache.get("site1")).toEqual(sites[0]);
            expect(siteCache.get("site2")).toEqual(sites[1]);
            expect(mockLogger.info).toHaveBeenCalledWith("Loaded 2 sites into cache");
        });

        it("should clear cache before loading", async () => {
            const siteCache = new SiteCache();
            siteCache.set("old-site", { identifier: "old-site", monitors: [] });

            vi.spyOn(siteRepositoryService, "getSitesFromDatabase").mockResolvedValue([]);

            await siteRepositoryService.loadSitesIntoCache(siteCache);

            expect(siteCache.size()).toBe(0);
            expect(siteCache.get("old-site")).toBeUndefined();
        });

        it("should handle errors and emit error event", async () => {
            const siteCache = new SiteCache();
            const error = new Error("Loading error");
            vi.spyOn(siteRepositoryService, "getSitesFromDatabase").mockRejectedValue(error);

            const errorSpy = vi.fn();
            mockEventEmitter.on("error", errorSpy);

            await expect(siteRepositoryService.loadSitesIntoCache(siteCache)).rejects.toThrow(error);
            expect(errorSpy).toHaveBeenCalledWith(expect.any(SiteLoadingError));
        });
    });

    describe("getHistoryLimitSetting", () => {
        it("should return parsed history limit from settings", async () => {
            vi.mocked(mockSettingsRepository.get).mockResolvedValue("1000");

            const result = await siteRepositoryService.getHistoryLimitSetting();

            expect(result).toBe(1000);
            expect(mockSettingsRepository.get).toHaveBeenCalledWith("historyLimit");
        });

        it("should return undefined if setting does not exist", async () => {
            vi.mocked(mockSettingsRepository.get).mockResolvedValue(undefined);

            const result = await siteRepositoryService.getHistoryLimitSetting();

            expect(result).toBeUndefined();
        });

        it("should return undefined for invalid numeric values", async () => {
            vi.mocked(mockSettingsRepository.get).mockResolvedValue("invalid");

            const result = await siteRepositoryService.getHistoryLimitSetting();

            expect(result).toBeUndefined();
            expect(mockLogger.warn).toHaveBeenCalledWith("Invalid history limit setting: invalid");
        });

        it("should return undefined for zero or negative values", async () => {
            vi.mocked(mockSettingsRepository.get).mockResolvedValue("0");

            const result = await siteRepositoryService.getHistoryLimitSetting();

            expect(result).toBeUndefined();
            expect(mockLogger.warn).toHaveBeenCalledWith("Invalid history limit setting: 0");
        });

        it("should handle errors gracefully", async () => {
            const error = new Error("Settings error");
            vi.mocked(mockSettingsRepository.get).mockRejectedValue(error);

            const result = await siteRepositoryService.getHistoryLimitSetting();

            expect(result).toBeUndefined();
            expect(mockLogger.warn).toHaveBeenCalledWith("Could not load history limit from settings:", error);
        });
    });

    describe("applyHistoryLimitSetting", () => {
        it("should apply history limit when setting exists", async () => {
            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn(),
            };

            vi.spyOn(siteRepositoryService, "getHistoryLimitSetting").mockResolvedValue(500);

            await siteRepositoryService.applyHistoryLimitSetting(mockMonitoringConfig);

            expect(mockMonitoringConfig.setHistoryLimit).toHaveBeenCalledWith(500);
            expect(mockLogger.info).toHaveBeenCalledWith("History limit applied: 500");
        });

        it("should not apply history limit when setting does not exist", async () => {
            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn(),
            };

            vi.spyOn(siteRepositoryService, "getHistoryLimitSetting").mockResolvedValue(undefined);

            await siteRepositoryService.applyHistoryLimitSetting(mockMonitoringConfig);

            expect(mockMonitoringConfig.setHistoryLimit).not.toHaveBeenCalled();
            expect(mockLogger.info).not.toHaveBeenCalled();
        });
    });

    describe("startMonitoringForSites", () => {
        it("should start monitoring for sites with site-level monitoring enabled", async () => {
            const siteCache = new SiteCache();
            const site: Site = {
                identifier: "site1",
                monitoring: true,
                monitors: [
                    { id: "monitor1", type: "http", status: "up", history: [] },
                    { id: "monitor2", type: "http", status: "up", history: [] },
                ],
            };
            siteCache.set("site1", site);

            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn().mockResolvedValue(true),
                stopMonitoring: vi.fn(),
            };

            await siteRepositoryService.startMonitoringForSites(siteCache, mockMonitoringConfig);

            expect(mockMonitoringConfig.startMonitoring).toHaveBeenCalledWith("site1", "monitor1");
            expect(mockMonitoringConfig.startMonitoring).toHaveBeenCalledWith("site1", "monitor2");
            expect(mockLogger.debug).toHaveBeenCalledWith("Auto-starting monitoring for site: site1");
        });

        it("should start monitoring for individual monitors when site monitoring is disabled", async () => {
            const siteCache = new SiteCache();
            const site: Site = {
                identifier: "site1",
                monitoring: false,
                monitors: [
                    { id: "monitor1", type: "http", status: "up", history: [], monitoring: true },
                    { id: "monitor2", type: "http", status: "up", history: [], monitoring: false },
                ],
            };
            siteCache.set("site1", site);

            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn().mockResolvedValue(true),
                stopMonitoring: vi.fn(),
            };

            await siteRepositoryService.startMonitoringForSites(siteCache, mockMonitoringConfig);

            expect(mockMonitoringConfig.startMonitoring).toHaveBeenCalledWith("site1", "monitor1");
            expect(mockMonitoringConfig.startMonitoring).not.toHaveBeenCalledWith("site1", "monitor2");
            expect(mockLogger.debug).toHaveBeenCalledWith("Auto-starting monitoring for monitor: site1:monitor1");
        });

        it("should handle errors and wrap them in SiteLoadingError", async () => {
            const siteCache = new SiteCache();
            const site: Site = {
                identifier: "site1",
                monitoring: true,
                monitors: [{ id: "monitor1", type: "http", status: "up", history: [] }],
            };
            siteCache.set("site1", site);

            const error = new Error("Monitoring error");
            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn().mockRejectedValue(error),
                stopMonitoring: vi.fn(),
            };

            await expect(siteRepositoryService.startMonitoringForSites(siteCache, mockMonitoringConfig)).rejects.toThrow(
                SiteLoadingError
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to start monitoring for sites: Monitoring error",
                error
            );
        });
    });
});

describe("SiteLoadingOrchestrator", () => {
    let siteLoadingOrchestrator: SiteLoadingOrchestrator;
    let mockSiteRepositoryService: SiteRepositoryService;

    beforeEach(() => {
        mockSiteRepositoryService = {
            getSitesFromDatabase: vi.fn(),
            loadSitesIntoCache: vi.fn(),
            getHistoryLimitSetting: vi.fn(),
            applyHistoryLimitSetting: vi.fn(),
            startMonitoringForSites: vi.fn(),
        } as unknown as SiteRepositoryService;

        siteLoadingOrchestrator = new SiteLoadingOrchestrator(mockSiteRepositoryService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("loadSitesFromDatabase", () => {
        it("should orchestrate the complete loading process", async () => {
            const siteCache = new SiteCache();
            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn(),
            };

            const result = await siteLoadingOrchestrator.loadSitesFromDatabase(siteCache, mockMonitoringConfig);

            expect(mockSiteRepositoryService.loadSitesIntoCache).toHaveBeenCalledWith(siteCache);
            expect(mockSiteRepositoryService.applyHistoryLimitSetting).toHaveBeenCalledWith(mockMonitoringConfig);
            expect(mockSiteRepositoryService.startMonitoringForSites).toHaveBeenCalledWith(siteCache, mockMonitoringConfig);
            expect(result).toEqual({
                message: "Successfully loaded 0 sites and started monitoring",
                sitesLoaded: 0,
                success: true,
            });
        });

        it("should handle errors from any step", async () => {
            const siteCache = new SiteCache();
            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn(),
            };

            const error = new Error("Loading error");
            vi.mocked(mockSiteRepositoryService.loadSitesIntoCache).mockRejectedValue(error);

            const result = await siteLoadingOrchestrator.loadSitesFromDatabase(siteCache, mockMonitoringConfig);
            expect(result).toEqual({
                message: "Failed to load sites: Loading error",
                sitesLoaded: 0,
                success: false,
            });
        });
    });
});

describe("SiteCache", () => {
    let siteCache: SiteCache;

    beforeEach(() => {
        siteCache = new SiteCache();
    });

    it("should store and retrieve sites", () => {
        const site: Site = { identifier: "site1", monitors: [] };
        siteCache.set("site1", site);

        expect(siteCache.get("site1")).toEqual(site);
    });

    it("should return undefined for non-existent sites", () => {
        expect(siteCache.get("non-existent")).toBeUndefined();
    });

    it("should delete sites", () => {
        const site: Site = { identifier: "site1", monitors: [] };
        siteCache.set("site1", site);

        const deleted = siteCache.delete("site1");
        expect(deleted).toBe(true);
        expect(siteCache.get("site1")).toBeUndefined();
    });

    it("should return false when deleting non-existent sites", () => {
        const deleted = siteCache.delete("non-existent");
        expect(deleted).toBe(false);
    });

    it("should clear all sites", () => {
        siteCache.set("site1", { identifier: "site1", monitors: [] });
        siteCache.set("site2", { identifier: "site2", monitors: [] });

        siteCache.clear();
        expect(siteCache.size()).toBe(0);
    });

    it("should return correct size", () => {
        expect(siteCache.size()).toBe(0);
        siteCache.set("site1", { identifier: "site1", monitors: [] });
        expect(siteCache.size()).toBe(1);
        siteCache.set("site2", { identifier: "site2", monitors: [] });
        expect(siteCache.size()).toBe(2);
    });

    it("should provide entries iterator", () => {
        const site1: Site = { identifier: "site1", monitors: [] };
        const site2: Site = { identifier: "site2", monitors: [] };
        siteCache.set("site1", site1);
        siteCache.set("site2", site2);

        const entries = Array.from(siteCache.entries());
        expect(entries).toHaveLength(2);
        expect(entries).toContainEqual(["site1", site1]);
        expect(entries).toContainEqual(["site2", site2]);
    });
});
