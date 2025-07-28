/**
 * Comprehensive tests for SiteManager.ts
 * Targets 90%+ branch coverage for all site management functions
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Site } from "../../types";
import { SiteManager, type IMonitoringOperations } from "../../managers/SiteManager";

// Mock all the dependencies
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("../../utils/database/serviceFactory", () => ({
    LoggerAdapter: vi.fn().mockImplementation(() => ({
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    })),
}));

vi.mock("../../utils/cache/StandardizedCache", () => {
    const mockStandardizedCache = vi.fn().mockImplementation(() => ({
        set: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
        has: vi.fn(),
        getAll: vi.fn().mockReturnValue([]),
        size: 0,
        keys: vi.fn().mockReturnValue([]),
        values: vi.fn().mockReturnValue([]),
        entries: vi.fn().mockReturnValue([]),
        forEach: vi.fn(),
        stats: vi.fn().mockReturnValue({}),
    }));
    return { StandardizedCache: mockStandardizedCache };
});

vi.mock("../../utils/database/SiteRepositoryService", () => {
    const mockSiteRepositoryService = vi.fn().mockImplementation(() => ({
        getSitesFromDatabase: vi.fn(),
    }));
    return { SiteRepositoryService: mockSiteRepositoryService };
});

vi.mock("../../utils/database/SiteWriterService", () => {
    const mockSiteWriterService = vi.fn().mockImplementation(() => ({
        createSite: vi.fn(),
        updateSite: vi.fn(),
        deleteSite: vi.fn(),
        handleMonitorIntervalChanges: vi.fn(),
        detectNewMonitors: vi.fn().mockReturnValue([]),
    }));
    return { SiteWriterService: mockSiteWriterService };
});

describe("SiteManager - Comprehensive", () => {
    let siteManager: SiteManager;
    let mockDeps: any;
    let mockSite: Site;
    let mockMonitoringOperations: IMonitoringOperations;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSite = {
            identifier: "site-1",
            name: "Test Site",
            monitoring: true,
            monitors: [
                {
                    id: "monitor-1",
                    type: "http" as const,
                    url: "https://example.com",
                    checkInterval: 5000,
                    timeout: 10000,
                    retryAttempts: 3,
                    monitoring: true,
                    status: "unknown" as const,
                    responseTime: 0,
                    history: [],
                },
            ],
        };

        mockMonitoringOperations = {
            setHistoryLimit: vi.fn().mockResolvedValue(undefined),
            setupNewMonitors: vi.fn().mockResolvedValue(undefined),
            startMonitoringForSite: vi.fn().mockResolvedValue(true),
            stopMonitoringForSite: vi.fn().mockResolvedValue(true),
        };

        mockDeps = {
            configurationManager: {
                validateSiteConfiguration: vi.fn().mockResolvedValue({ isValid: true, errors: [] }),
            },
            databaseService: {
                executeTransaction: vi.fn().mockImplementation(async (fn) => fn()),
            },
            eventEmitter: {
                emitTyped: vi.fn().mockResolvedValue(undefined),
            },
            historyRepository: {
                findBySiteIdentifier: vi.fn(),
                create: vi.fn(),
                deleteAll: vi.fn(),
            },
            monitoringOperations: mockMonitoringOperations,
            monitorRepository: {
                findBySiteIdentifier: vi.fn(),
                create: vi.fn(),
                delete: vi.fn().mockResolvedValue(true),
                bulkCreate: vi.fn(),
                deleteBySiteIdentifier: vi.fn(),
            },
            settingsRepository: {
                get: vi.fn(),
                set: vi.fn(),
            },
            siteRepository: {
                findAll: vi.fn(),
                findByIdentifier: vi.fn(),
                upsert: vi.fn(),
                delete: vi.fn(),
                exists: vi.fn(),
            },
        };
    });

    describe("constructor", () => {
        it("should initialize SiteManager with all dependencies", () => {
            siteManager = new SiteManager(mockDeps);
            expect(siteManager).toBeDefined();
        });

        it("should initialize SiteManager without monitoring operations", () => {
            const depsWithoutMonitoring = { ...mockDeps };
            delete depsWithoutMonitoring.monitoringOperations;
            
            siteManager = new SiteManager(depsWithoutMonitoring);
            expect(siteManager).toBeDefined();
        });
    });

    describe("addSite", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should add a new site successfully", async () => {
            const mockSiteWriterService = siteManager["siteWriterService"];
            vi.mocked(mockSiteWriterService.createSite).mockResolvedValue(mockSite);

            const result = await siteManager.addSite(mockSite);

            expect(mockDeps.configurationManager.validateSiteConfiguration).toHaveBeenCalledWith(mockSite);
            expect(mockSiteWriterService.createSite).toHaveBeenCalledWith(mockSite);
            expect(mockDeps.eventEmitter.emitTyped).toHaveBeenCalledWith("site:added", expect.any(Object));
            expect(mockDeps.eventEmitter.emitTyped).toHaveBeenCalledWith("sites:state-synchronized", expect.any(Object));
            expect(result).toEqual(mockSite);
        });

        it("should handle validation errors", async () => {
            vi.mocked(mockDeps.configurationManager.validateSiteConfiguration).mockResolvedValue({
                isValid: false,
                errors: ["Invalid URL", "Missing name"],
            });

            await expect(siteManager.addSite(mockSite)).rejects.toThrow(
                "Site validation failed for 'site-1':\n  - Invalid URL\n  - Missing name"
            );
        });

        it("should handle single validation error", async () => {
            vi.mocked(mockDeps.configurationManager.validateSiteConfiguration).mockResolvedValue({
                isValid: false,
                errors: ["Invalid URL"],
            });

            await expect(siteManager.addSite(mockSite)).rejects.toThrow(
                "Site validation failed for 'site-1': Invalid URL"
            );
        });

        it("should handle empty validation errors array", async () => {
            vi.mocked(mockDeps.configurationManager.validateSiteConfiguration).mockResolvedValue({
                isValid: false,
                errors: [undefined as any],
            });

            await expect(siteManager.addSite(mockSite)).rejects.toThrow(
                "Site validation failed for 'site-1': "
            );
        });

        it("should handle createSite errors", async () => {
            const mockSiteWriterService = siteManager["siteWriterService"];
            vi.mocked(mockSiteWriterService.createSite).mockRejectedValue(new Error("Database error"));

            await expect(siteManager.addSite(mockSite)).rejects.toThrow("Database error");
        });
    });

    describe("getSiteFromCache", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should return site from cache if available", () => {
            const mockCache = siteManager["sitesCache"];
            vi.mocked(mockCache.get).mockReturnValue(mockSite);

            const result = siteManager.getSiteFromCache("site-1");

            expect(mockCache.get).toHaveBeenCalledWith("site-1");
            expect(result).toEqual(mockSite);
        });

        it("should handle cache miss and trigger background loading", () => {
            const mockCache = siteManager["sitesCache"];
            vi.mocked(mockCache.get).mockReturnValue(undefined);

            const result = siteManager.getSiteFromCache("site-1");

            expect(mockCache.get).toHaveBeenCalledWith("site-1");
            expect(result).toBeUndefined();
            expect(mockDeps.eventEmitter.emitTyped).toHaveBeenCalledWith("site:cache-miss", expect.any(Object));
        });

        it("should handle event emission error during cache miss", () => {
            const mockCache = siteManager["sitesCache"];
            vi.mocked(mockCache.get).mockReturnValue(undefined);
            vi.mocked(mockDeps.eventEmitter.emitTyped).mockRejectedValue(new Error("Event error"));

            const result = siteManager.getSiteFromCache("site-1");

            expect(result).toBeUndefined();
        });

        it("should handle background loading error", async () => {
            const mockCache = siteManager["sitesCache"];
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            
            vi.mocked(mockCache.get).mockReturnValue(undefined);
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockRejectedValue(new Error("DB error"));

            siteManager.getSiteFromCache("site-1");

            // Wait for background loading to complete
            await new Promise(resolve => setTimeout(resolve, 10));
        });
    });

    describe("getSites", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should get sites from database and update cache", async () => {
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockResolvedValue([mockSite]);

            const result = await siteManager.getSites();

            expect(mockSiteRepositoryService.getSitesFromDatabase).toHaveBeenCalled();
            expect(result).toEqual([mockSite]);
        });

        it("should handle database errors", async () => {
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockRejectedValue(new Error("DB error"));

            await expect(siteManager.getSites()).rejects.toThrow("DB error");
        });
    });

    describe("getSitesFromCache", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should return all sites from cache", () => {
            const mockCache = siteManager["sitesCache"];
            vi.mocked(mockCache.getAll).mockReturnValue([mockSite]);

            const result = siteManager.getSitesFromCache();

            expect(mockCache.getAll).toHaveBeenCalled();
            expect(result).toEqual([mockSite]);
        });
    });

    describe("getSitesCache", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should return the cache instance", () => {
            const result = siteManager.getSitesCache();
            expect(result).toBe(siteManager["sitesCache"]);
        });
    });

    describe("initialize", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should initialize by loading sites into cache", async () => {
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockResolvedValue([mockSite]);

            await siteManager.initialize();

            expect(mockSiteRepositoryService.getSitesFromDatabase).toHaveBeenCalled();
        });

        it("should handle initialization errors", async () => {
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockRejectedValue(new Error("Init error"));

            await expect(siteManager.initialize()).rejects.toThrow("Init error");
        });
    });

    describe("removeMonitor", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should remove monitor successfully", async () => {
            const mockCache = siteManager["sitesCache"];
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            
            vi.mocked(mockCache.get).mockReturnValue(mockSite);
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockResolvedValue([mockSite]);

            const result = await siteManager.removeMonitor("site-1", "monitor-1");

            expect(mockDeps.monitorRepository.delete).toHaveBeenCalledWith("monitor-1");
            expect(result).toBe(true);
        });

        it("should handle monitor deletion failure", async () => {
            vi.mocked(mockDeps.monitorRepository.delete).mockResolvedValue(false);

            const result = await siteManager.removeMonitor("site-1", "monitor-1");

            expect(result).toBe(false);
        });

        it("should handle deletion errors", async () => {
            vi.mocked(mockDeps.monitorRepository.delete).mockRejectedValue(new Error("Delete error"));

            await expect(siteManager.removeMonitor("site-1", "monitor-1")).rejects.toThrow("Delete error");
        });

        it("should handle site not found after deletion", async () => {
            const mockCache = siteManager["sitesCache"];
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            
            vi.mocked(mockCache.get).mockReturnValue(undefined);
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockResolvedValue([mockSite]);

            const result = await siteManager.removeMonitor("site-1", "monitor-1");

            expect(result).toBe(true);
            // Should not emit internal site updated event if site not found in cache
        });
    });

    describe("removeSite", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should remove site successfully", async () => {
            const mockCache = siteManager["sitesCache"];
            const mockSiteWriterService = siteManager["siteWriterService"];
            
            vi.mocked(mockCache.get).mockReturnValue(mockSite);
            vi.mocked(mockSiteWriterService.deleteSite).mockResolvedValue(true);

            const result = await siteManager.removeSite("site-1");

            expect(mockSiteWriterService.deleteSite).toHaveBeenCalledWith(mockCache, "site-1");
            expect(mockDeps.eventEmitter.emitTyped).toHaveBeenCalledWith("site:removed", expect.any(Object));
            expect(result).toBe(true);
        });

        it("should handle site not found in cache", async () => {
            const mockCache = siteManager["sitesCache"];
            const mockSiteWriterService = siteManager["siteWriterService"];
            
            vi.mocked(mockCache.get).mockReturnValue(undefined);
            vi.mocked(mockSiteWriterService.deleteSite).mockResolvedValue(true);

            const result = await siteManager.removeSite("site-1");

            expect(result).toBe(true);
            // Should use "Unknown" as siteName when site not found in cache
        });

        it("should handle deletion failure", async () => {
            const mockCache = siteManager["sitesCache"];
            const mockSiteWriterService = siteManager["siteWriterService"];
            
            vi.mocked(mockCache.get).mockReturnValue(mockSite);
            vi.mocked(mockSiteWriterService.deleteSite).mockResolvedValue(false);

            const result = await siteManager.removeSite("site-1");

            expect(result).toBe(false);
            // Should not emit events when deletion fails
            expect(mockDeps.eventEmitter.emitTyped).not.toHaveBeenCalled();
        });
    });

    describe("updateSite", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should update site successfully", async () => {
            const mockCache = siteManager["sitesCache"];
            const mockSiteWriterService = siteManager["siteWriterService"];
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            
            const updates = { name: "Updated Site" };
            const updatedSite = { ...mockSite, ...updates };
            
            vi.mocked(mockCache.get)
                .mockReturnValueOnce(mockSite) // First call to get original site
                .mockReturnValueOnce(updatedSite); // Second call after refresh
            vi.mocked(mockSiteWriterService.updateSite).mockResolvedValue(updatedSite);
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockResolvedValue([updatedSite]);

            const result = await siteManager.updateSite("site-1", updates);

            expect(mockDeps.configurationManager.validateSiteConfiguration).toHaveBeenCalled();
            expect(mockSiteWriterService.updateSite).toHaveBeenCalledWith(mockCache, "site-1", updates);
            expect(result).toEqual(updatedSite);
        });

        it("should handle site not found", async () => {
            const mockCache = siteManager["sitesCache"];
            vi.mocked(mockCache.get).mockReturnValue(undefined);

            await expect(siteManager.updateSite("site-1", { name: "New Name" })).rejects.toThrow(
                "Site with identifier site-1 not found"
            );
        });

        it("should handle validation errors during update", async () => {
            const mockCache = siteManager["sitesCache"];
            vi.mocked(mockCache.get).mockReturnValue(mockSite);
            vi.mocked(mockDeps.configurationManager.validateSiteConfiguration).mockResolvedValue({
                isValid: false,
                errors: ["Invalid update"],
            });

            await expect(siteManager.updateSite("site-1", { name: "New Name" })).rejects.toThrow(
                "Site validation failed"
            );
        });

        it("should handle monitor updates with new monitors", async () => {
            const mockCache = siteManager["sitesCache"];
            const mockSiteWriterService = siteManager["siteWriterService"];
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            
            const newMonitor = {
                id: "monitor-2",
                type: "http" as const,
                url: "https://example2.com",
                checkInterval: 10000,
                timeout: 5000,
                retryAttempts: 2,
                monitoring: true,
                status: "unknown" as const,
                responseTime: 0,
                history: [],
            };
            
            const updates = { monitors: [mockSite.monitors[0], newMonitor] };
            const updatedSite = { ...mockSite, ...updates };
            
            vi.mocked(mockCache.get)
                .mockReturnValueOnce(mockSite)
                .mockReturnValueOnce(updatedSite);
            vi.mocked(mockSiteWriterService.updateSite).mockResolvedValue(updatedSite);
            vi.mocked(mockSiteWriterService.detectNewMonitors).mockReturnValue(["monitor-2"]);
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockResolvedValue([updatedSite]);

            const result = await siteManager.updateSite("site-1", updates);

            expect(mockSiteWriterService.handleMonitorIntervalChanges).toHaveBeenCalled();
            expect(mockMonitoringOperations.setupNewMonitors).toHaveBeenCalledWith(updatedSite, ["monitor-2"]);
            expect(result).toEqual(updatedSite);
        });

        it("should handle site not found after refresh", async () => {
            const mockCache = siteManager["sitesCache"];
            const mockSiteWriterService = siteManager["siteWriterService"];
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            
            const updates = { name: "Updated Site" };
            const updatedSite = { ...mockSite, ...updates };
            
            vi.mocked(mockCache.get)
                .mockReturnValueOnce(mockSite) // First call to get original site
                .mockReturnValueOnce(undefined); // Second call after refresh returns undefined
            vi.mocked(mockSiteWriterService.updateSite).mockResolvedValue(updatedSite);
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockResolvedValue([updatedSite]);

            await expect(siteManager.updateSite("site-1", updates)).rejects.toThrow(
                "Site with identifier site-1 not found in cache after refresh"
            );
        });
    });

    describe("updateSitesCache", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should update sites cache atomically", async () => {
            const sites = [mockSite];
            const mockCache = siteManager["sitesCache"];

            await siteManager.updateSitesCache(sites);

            expect(mockCache.clear).toHaveBeenCalled();
            expect(mockCache.set).toHaveBeenCalledWith("site-1", mockSite);
            expect(mockDeps.eventEmitter.emitTyped).toHaveBeenCalledWith("internal:site:cache-updated", expect.any(Object));
        });
    });

    describe("createMonitoringConfig - monitoring operations not available", () => {
        beforeEach(() => {
            const depsWithoutMonitoring = { ...mockDeps };
            delete depsWithoutMonitoring.monitoringOperations;
            siteManager = new SiteManager(depsWithoutMonitoring);
        });

        it("should throw error when setHistoryLimit called without monitoring operations", async () => {
            const mockCache = siteManager["sitesCache"];
            const mockSiteWriterService = siteManager["siteWriterService"];
            
            const updates = { monitors: [mockSite.monitors[0]] };
            const updatedSite = { ...mockSite, ...updates };
            
            vi.mocked(mockCache.get)
                .mockReturnValueOnce(mockSite)
                .mockReturnValueOnce(updatedSite);
            vi.mocked(mockSiteWriterService.updateSite).mockResolvedValue(updatedSite);

            // Mock handleMonitorIntervalChanges to call setHistoryLimit which should throw
            vi.mocked(mockSiteWriterService.handleMonitorIntervalChanges).mockImplementation(async (id, orig, monitors, config) => {
                config.setHistoryLimit(100);
            });

            await expect(siteManager.updateSite("site-1", updates)).rejects.toThrow(
                "MonitoringOperations not available but required for setHistoryLimit"
            );
        });

        it("should throw error when setupNewMonitors called without monitoring operations", async () => {
            const mockCache = siteManager["sitesCache"];
            const mockSiteWriterService = siteManager["siteWriterService"];
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            
            const newMonitor = {
                id: "monitor-2",
                type: "http" as const,
                url: "https://example2.com",
                checkInterval: 10000,
                timeout: 5000,
                retryAttempts: 2,
                monitoring: true,
                status: "unknown" as const,
                responseTime: 0,
                history: [],
            };
            
            const updates = { monitors: [mockSite.monitors[0], newMonitor] };
            const updatedSite = { ...mockSite, ...updates };
            
            vi.mocked(mockCache.get)
                .mockReturnValueOnce(mockSite)
                .mockReturnValueOnce(updatedSite);
            vi.mocked(mockSiteWriterService.updateSite).mockResolvedValue(updatedSite);
            vi.mocked(mockSiteWriterService.detectNewMonitors).mockReturnValue(["monitor-2"]);
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockResolvedValue([updatedSite]);

            await expect(siteManager.updateSite("site-1", updates)).rejects.toThrow(
                "MonitoringOperations not available but required for setupNewMonitors"
            );
        });

        it("should throw error when startMonitoring called without monitoring operations", async () => {
            const config = siteManager["createMonitoringConfig"]();
            
            await expect(config.startMonitoring("site-1", "monitor-1")).rejects.toThrow(
                "MonitoringOperations not available but required for startMonitoring"
            );
        });

        it("should throw error when stopMonitoring called without monitoring operations", async () => {
            const config = siteManager["createMonitoringConfig"]();
            
            await expect(config.stopMonitoring("site-1", "monitor-1")).rejects.toThrow(
                "MonitoringOperations not available but required for stopMonitoring"
            );
        });
    });

    describe("createMonitoringConfig - with monitoring operations", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should handle setHistoryLimit error gracefully", async () => {
            vi.mocked(mockMonitoringOperations.setHistoryLimit).mockRejectedValue(new Error("History limit error"));
            
            const config = siteManager["createMonitoringConfig"]();
            
            // Should not throw, just log error
            config.setHistoryLimit(100);
            
            // Wait for promise to resolve
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        it("should call setupNewMonitors successfully", async () => {
            const config = siteManager["createMonitoringConfig"]();
            
            await config.setupNewMonitors(mockSite, ["monitor-1"]);
            
            expect(mockMonitoringOperations.setupNewMonitors).toHaveBeenCalledWith(mockSite, ["monitor-1"]);
        });

        it("should call startMonitoring successfully", async () => {
            const config = siteManager["createMonitoringConfig"]();
            
            const result = await config.startMonitoring("site-1", "monitor-1");
            
            expect(mockMonitoringOperations.startMonitoringForSite).toHaveBeenCalledWith("site-1", "monitor-1");
            expect(result).toBe(true);
        });

        it("should call stopMonitoring successfully", async () => {
            const config = siteManager["createMonitoringConfig"]();
            
            const result = await config.stopMonitoring("site-1", "monitor-1");
            
            expect(mockMonitoringOperations.stopMonitoringForSite).toHaveBeenCalledWith("site-1", "monitor-1");
            expect(result).toBe(true);
        });
    });

    describe("loadSiteInBackground", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should load site in background successfully", async () => {
            const mockCache = siteManager["sitesCache"];
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockResolvedValue([mockSite]);

            await siteManager["loadSiteInBackground"]("site-1");

            expect(mockCache.set).toHaveBeenCalledWith("site-1", mockSite);
            expect(mockDeps.eventEmitter.emitTyped).toHaveBeenCalledWith("site:cache-updated", expect.any(Object));
        });

        it("should handle site not found during background loading", async () => {
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockResolvedValue([]);

            await siteManager["loadSiteInBackground"]("site-1");

            expect(mockDeps.eventEmitter.emitTyped).toHaveBeenCalledWith("site:cache-miss", expect.objectContaining({
                backgroundLoading: false,
            }));
        });

        it("should handle database error during background loading", async () => {
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockRejectedValue(new Error("DB error"));

            await siteManager["loadSiteInBackground"]("site-1");

            expect(mockDeps.eventEmitter.emitTyped).toHaveBeenCalledWith("site:cache-miss", expect.objectContaining({
                backgroundLoading: false,
            }));
        });

        it("should handle event emission error during background loading", async () => {
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockRejectedValue(new Error("DB error"));
            vi.mocked(mockDeps.eventEmitter.emitTyped).mockRejectedValue(new Error("Event error"));

            await siteManager["loadSiteInBackground"]("site-1");

            // Should not throw even if both DB and event emission fail
        });
    });

    describe("validateSite", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should validate site successfully", async () => {
            await siteManager["validateSite"](mockSite);

            expect(mockDeps.configurationManager.validateSiteConfiguration).toHaveBeenCalledWith(mockSite);
        });

        it("should throw error for invalid site", async () => {
            vi.mocked(mockDeps.configurationManager.validateSiteConfiguration).mockResolvedValue({
                isValid: false,
                errors: ["Invalid site"],
            });

            await expect(siteManager["validateSite"](mockSite)).rejects.toThrow(
                "Site validation failed for 'site-1': Invalid site"
            );
        });
    });

    describe("formatValidationErrors", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should format single error", () => {
            const result = siteManager["formatValidationErrors"](["Single error"]);
            expect(result).toBe("Single error");
        });

        it("should format multiple errors", () => {
            const result = siteManager["formatValidationErrors"](["Error 1", "Error 2"]);
            expect(result).toBe("\n  - Error 1\n  - Error 2");
        });

        it("should handle empty error", () => {
            const result = siteManager["formatValidationErrors"]([undefined as any]);
            expect(result).toBe("");
        });
    });

    describe("executeMonitorDeletion", () => {
        beforeEach(() => {
            siteManager = new SiteManager(mockDeps);
        });

        it("should execute monitor deletion successfully", async () => {
            const result = await siteManager["executeMonitorDeletion"]("monitor-1");

            expect(mockDeps.monitorRepository.delete).toHaveBeenCalledWith("monitor-1");
            expect(result).toBe(true);
        });

        it("should handle deletion failure", async () => {
            vi.mocked(mockDeps.monitorRepository.delete).mockResolvedValue(false);

            const result = await siteManager["executeMonitorDeletion"]("monitor-1");

            expect(result).toBe(false);
        });
    });

    describe("Integration Tests", () => {
        it("should handle complex site lifecycle", async () => {
            siteManager = new SiteManager(mockDeps);

            // Initialize
            const mockSiteRepositoryService = siteManager["siteRepositoryService"];
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockResolvedValue([]);
            await siteManager.initialize();

            // Add site
            const mockSiteWriterService = siteManager["siteWriterService"];
            vi.mocked(mockSiteWriterService.createSite).mockResolvedValue(mockSite);
            const addedSite = await siteManager.addSite(mockSite);
            expect(addedSite).toEqual(mockSite);

            // Get from cache
            const mockCache = siteManager["sitesCache"];
            vi.mocked(mockCache.get).mockReturnValue(mockSite);
            const cachedSite = siteManager.getSiteFromCache("site-1");
            expect(cachedSite).toEqual(mockSite);

            // Update site
            const updates = { name: "Updated Site" };
            const updatedSite = { ...mockSite, ...updates };
            vi.mocked(mockCache.get)
                .mockReturnValueOnce(mockSite)
                .mockReturnValueOnce(updatedSite);
            vi.mocked(mockSiteWriterService.updateSite).mockResolvedValue(updatedSite);
            vi.mocked(mockSiteRepositoryService.getSitesFromDatabase).mockResolvedValue([updatedSite]);

            const result = await siteManager.updateSite("site-1", updates);
            expect(result).toEqual(updatedSite);

            // Remove site
            vi.mocked(mockCache.get).mockReturnValue(updatedSite);
            vi.mocked(mockSiteWriterService.deleteSite).mockResolvedValue(true);
            const removed = await siteManager.removeSite("site-1");
            expect(removed).toBe(true);
        });
    });
});
