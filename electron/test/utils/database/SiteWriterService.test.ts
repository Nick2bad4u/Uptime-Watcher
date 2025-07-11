/**
 * Tests for SiteWriterService.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { Site, Monitor } from "../../../types";
import {
    SiteWriterService,
    SiteWritingOrchestrator,
    SiteCache,
    SiteCreationError,
    SiteUpdateError,
    SiteDeletionError,
    SiteNotFoundError,
    ISiteRepository,
    IMonitorRepository,
    ILogger,
    MonitoringConfig,
} from "../../../utils/database";

// Mock isDev function
vi.mock("../../../electronUtils", () => ({
    isDev: vi.fn(() => true),
}));

describe("SiteWriterService", () => {
    let siteWriterService: SiteWriterService;
    let mockSiteRepository: ISiteRepository;
    let mockMonitorRepository: IMonitorRepository;
    let mockLogger: ILogger;
    let mockDatabaseService: any;

    beforeEach(() => {
        mockSiteRepository = {
            findAll: vi.fn(),
            findByIdentifier: vi.fn(),
            upsert: vi.fn(),
            upsertInternal: vi.fn(),
            delete: vi.fn(),
            deleteInternal: vi.fn(),
            exportAll: vi.fn(),
            deleteAll: vi.fn(),
            bulkInsert: vi.fn(),
        };

        mockDatabaseService = {
            executeTransaction: vi.fn(async (callback) => {
                return await callback({} as any); // Pass mock database
            }),
        };

        mockMonitorRepository = {
            findBySiteIdentifier: vi.fn(),
            create: vi.fn(),
            createInternal: vi.fn(),
            update: vi.fn(),
            updateInternal: vi.fn(),
            delete: vi.fn(),
            deleteAll: vi.fn(),
            deleteBySiteIdentifier: vi.fn(),
            deleteBySiteIdentifierInternal: vi.fn(),
            deleteMonitorInternal: vi.fn(),
            bulkCreate: vi.fn(),
        };

        mockLogger = {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        };

        siteWriterService = new SiteWriterService({
            repositories: {
                site: mockSiteRepository,
                monitor: mockMonitorRepository,
            },
            logger: mockLogger,
            databaseService: mockDatabaseService,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("createSite", () => {
        it("should create a site with monitors", async () => {
            const siteData: Site = {
                identifier: "site1",
                name: "Test Site",
                monitors: [
                    {
                        id: "",
                        type: "http",
                        status: "up",
                        history: [],
                        url: "https://example.com",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                    {
                        id: "",
                        type: "port",
                        status: "up",
                        history: [],
                        host: "example.com",
                        port: 80,
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                monitoring: false,
            };

            vi.mocked(mockSiteRepository.upsert).mockResolvedValue();
            vi.mocked(mockMonitorRepository.deleteBySiteIdentifier).mockResolvedValue();
            vi.mocked(mockMonitorRepository.createInternal)
                .mockReturnValueOnce("monitor1")
                .mockReturnValueOnce("monitor2");

            const result = await siteWriterService.createSite(siteData);

            expect(result.identifier).toBe("site1");
            expect(result.name).toBe("Test Site");
            expect(result.monitors).toHaveLength(2);
            expect(result.monitors[0].id).toBe("monitor1");
            expect(result.monitors[1].id).toBe("monitor2");

            expect(mockSiteRepository.upsertInternal).toHaveBeenCalledWith(expect.anything(), siteData);
            expect(mockMonitorRepository.deleteBySiteIdentifierInternal).toHaveBeenCalled();
            expect(mockMonitorRepository.createInternal).toHaveBeenCalledTimes(2);
            expect(mockLogger.info).toHaveBeenCalledWith("Creating new site in database: site1");
            expect(mockLogger.info).toHaveBeenCalledWith("Site created successfully in database: site1 (Test Site)");
        });

        it.skip("should handle sites without names", async () => {
            const siteData: Site = {
                identifier: "site1",
                monitors: [],
                name: "",
                monitoring: false,
            };

            vi.mocked(mockSiteRepository.upsert).mockResolvedValue();
            vi.mocked(mockMonitorRepository.deleteBySiteIdentifier).mockResolvedValue();

            const result = await siteWriterService.createSite(siteData);

            expect(result.identifier).toBe("site1");
            expect(result.name).toBe("");
            expect(mockLogger.info).toHaveBeenCalledWith("Site created successfully in database: site1 ()");
        });

        it("should handle errors and wrap them in SiteCreationError", async () => {
            const siteData: Site = {
                identifier: "site1",
                monitors: [],
                name: "",
                monitoring: false,
            };
            const error = new Error("Database error");
            vi.mocked(mockSiteRepository.upsertInternal).mockImplementation(() => {
                throw error;
            });

            await expect(siteWriterService.createSite(siteData)).rejects.toThrow(SiteCreationError);
            expect(mockLogger.error).toHaveBeenCalledWith("Failed to create site site1: Database error", error);
        });
    });

    describe("updateSite", () => {
        it("should update a site with new values", async () => {
            const siteCache = new SiteCache();
            const existingSite: Site = {
                identifier: "site1",
                name: "Old Name",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "up",
                        history: [],
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                monitoring: false,
            };
            siteCache.set("site1", existingSite);

            const updates: Partial<Site> = {
                name: "New Name",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "up",
                        history: [],
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                    {
                        id: "",
                        type: "port",
                        status: "up",
                        history: [],
                        host: "example.com",
                        port: 80,
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
            };

            vi.mocked(mockSiteRepository.upsert).mockResolvedValue();
            vi.mocked(mockMonitorRepository.findBySiteIdentifier).mockResolvedValue([
                {
                    id: "monitor1",
                    type: "http",
                    status: "up",
                    history: [],
                    responseTime: 0,
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0,
                },
            ]);
            vi.mocked(mockMonitorRepository.create).mockResolvedValue("monitor2");

            const result = await siteWriterService.updateSite(siteCache, "site1", updates);

            expect(result.name).toBe("New Name");
            expect(result.monitors).toHaveLength(2);
            expect(siteCache.get("site1")).toEqual(result);
            expect(mockSiteRepository.upsertInternal).toHaveBeenCalledWith(expect.anything(), result);
            expect(mockLogger.info).toHaveBeenCalledWith("Site updated successfully: site1");
        });

        it("should throw SiteNotFoundError for non-existent site", async () => {
            const siteCache = new SiteCache();
            const updates: Partial<Site> = { name: "New Name" };

            await expect(siteWriterService.updateSite(siteCache, "non-existent", updates)).rejects.toThrow(
                SiteNotFoundError
            );
        });

        it("should throw SiteNotFoundError for empty identifier", async () => {
            const siteCache = new SiteCache();
            const updates: Partial<Site> = { name: "New Name" };

            await expect(siteWriterService.updateSite(siteCache, "", updates)).rejects.toThrow(SiteNotFoundError);
        });

        it("should handle database errors and wrap them in SiteUpdateError", async () => {
            const siteCache = new SiteCache();
            const existingSite: Site = {
                identifier: "site1",
                monitors: [],
                name: "",
                monitoring: false,
            };
            siteCache.set("site1", existingSite);

            const updates: Partial<Site> = { name: "New Name" };
            const error = new Error("Database error");
            vi.mocked(mockSiteRepository.upsertInternal).mockImplementation(() => {
                throw error;
            });

            await expect(siteWriterService.updateSite(siteCache, "site1", updates)).rejects.toThrow(SiteUpdateError);
            expect(mockLogger.error).toHaveBeenCalledWith("Failed to update site site1: Database error", error);
        });
    });

    describe("deleteSite", () => {
        it("should delete a site and return true if found", async () => {
            const siteCache = new SiteCache();
            const site: Site = {
                identifier: "site1",
                monitors: [],
                name: "",
                monitoring: false,
            };
            siteCache.set("site1", site);

            vi.mocked(mockSiteRepository.deleteInternal).mockReturnValue(true);

            const result = await siteWriterService.deleteSite(siteCache, "site1");

            expect(result).toBe(true);
            expect(siteCache.get("site1")).toBeUndefined();
            expect(mockMonitorRepository.deleteBySiteIdentifierInternal).toHaveBeenCalled();
            expect(mockSiteRepository.deleteInternal).toHaveBeenCalledWith(expect.anything(), "site1");
            expect(mockLogger.info).toHaveBeenCalledWith("Removing site: site1");
            expect(mockLogger.info).toHaveBeenCalledWith("Site removed successfully: site1");
        });

        it("should return false and log warning if site not found in cache", async () => {
            const siteCache = new SiteCache();

            vi.mocked(mockSiteRepository.deleteInternal).mockReturnValue(false);

            const result = await siteWriterService.deleteSite(siteCache, "non-existent");

            expect(result).toBe(false);
            expect(mockLogger.warn).toHaveBeenCalledWith("Site not found in cache for removal: non-existent");
        });

        it("should handle errors and wrap them in SiteDeletionError", async () => {
            const siteCache = new SiteCache();
            const error = new Error("Database error");
            // Force error in the executeTransaction function
            mockDatabaseService.executeTransaction.mockRejectedValue(error);

            await expect(siteWriterService.deleteSite(siteCache, "site1")).rejects.toThrow(SiteDeletionError);
            expect(mockLogger.error).toHaveBeenCalledWith("Failed to delete site site1: Database error", error);
        });
    });

    describe("handleMonitorIntervalChanges", () => {
        it("should restart monitoring for monitors with changed intervals", async () => {
            const originalSite: Site = {
                identifier: "site1",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "up",
                        history: [],
                        checkInterval: 10000,
                        monitoring: true,
                        responseTime: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        status: "up",
                        history: [],
                        checkInterval: 20000,
                        monitoring: false,
                        responseTime: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "",
                monitoring: false,
            };

            const newMonitors: Monitor[] = [
                {
                    id: "monitor1",
                    type: "http",
                    status: "up",
                    history: [],
                    checkInterval: 15000,
                    monitoring: true,
                    responseTime: 0,
                    timeout: 0,
                    retryAttempts: 0,
                },
                {
                    id: "monitor2",
                    type: "http",
                    status: "up",
                    history: [],
                    checkInterval: 25000,
                    monitoring: false,
                    responseTime: 0,
                    timeout: 0,
                    retryAttempts: 0,
                },
            ];

            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn().mockResolvedValue(true),
                stopMonitoring: vi.fn().mockResolvedValue(true),
                setupNewMonitors: function (site: Site, newMonitorIds: string[]): Promise<void> {
                    throw new Error("Function not implemented.");
                },
            };

            await siteWriterService.handleMonitorIntervalChanges(
                "site1",
                originalSite,
                newMonitors,
                mockMonitoringConfig
            );

            expect(mockMonitoringConfig.stopMonitoring).toHaveBeenCalledWith("site1", "monitor1");
            expect(mockMonitoringConfig.startMonitoring).toHaveBeenCalledWith("site1", "monitor1");
            expect(mockMonitoringConfig.stopMonitoring).toHaveBeenCalledWith("site1", "monitor2");
            expect(mockMonitoringConfig.startMonitoring).not.toHaveBeenCalledWith("site1", "monitor2");
            expect(mockLogger.debug).toHaveBeenCalledWith("Monitor monitor1 interval changed from 10000 to 15000");
            expect(mockLogger.debug).toHaveBeenCalledWith("Monitor monitor2 interval changed from 20000 to 25000");
        });

        it("should not restart monitoring for monitors with unchanged intervals", async () => {
            const originalSite: Site = {
                identifier: "site1",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "up",
                        history: [],
                        checkInterval: 10000,
                        monitoring: true,
                        responseTime: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "",
                monitoring: false,
            };

            const newMonitors: Monitor[] = [
                {
                    id: "monitor1",
                    type: "http",
                    status: "up",
                    history: [],
                    checkInterval: 10000,
                    monitoring: true,
                    responseTime: 0,
                    timeout: 0,
                    retryAttempts: 0,
                },
            ];

            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn(),
                setupNewMonitors: function (site: Site, newMonitorIds: string[]): Promise<void> {
                    throw new Error("Function not implemented.");
                },
            };

            await siteWriterService.handleMonitorIntervalChanges(
                "site1",
                originalSite,
                newMonitors,
                mockMonitoringConfig
            );

            expect(mockMonitoringConfig.stopMonitoring).not.toHaveBeenCalled();
            expect(mockMonitoringConfig.startMonitoring).not.toHaveBeenCalled();
        });

        it("should handle errors gracefully without throwing", async () => {
            const originalSite: Site = {
                identifier: "site1",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "up",
                        history: [],
                        checkInterval: 10000,
                        monitoring: true,
                        responseTime: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "",
                monitoring: false,
            };

            const newMonitors: Monitor[] = [
                {
                    id: "monitor1",
                    type: "http",
                    status: "up",
                    history: [],
                    checkInterval: 15000,
                    monitoring: true,
                    responseTime: 0,
                    timeout: 0,
                    retryAttempts: 0,
                },
            ];

            const error = new Error("Monitoring error");
            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn().mockRejectedValue(error),
                setupNewMonitors: function (site: Site, newMonitorIds: string[]): Promise<void> {
                    throw new Error("Function not implemented.");
                },
            };

            await expect(
                siteWriterService.handleMonitorIntervalChanges("site1", originalSite, newMonitors, mockMonitoringConfig)
            ).resolves.not.toThrow();

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to handle monitor interval changes for site site1:",
                error
            );
        });
    });

    describe("updateSiteMonitors", () => {
        it("should delete obsolete monitors and upsert new ones", async () => {
            const siteCache = new SiteCache();
            const existingSite: Site = {
                identifier: "site1",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "up",
                        history: [],
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "",
                monitoring: false,
            };
            siteCache.set("site1", existingSite);

            const dbMonitors: Monitor[] = [
                {
                    id: "monitor1",
                    type: "http",
                    status: "up",
                    history: [],
                    responseTime: 0,
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0,
                },
                {
                    id: "monitor2",
                    type: "http",
                    status: "up",
                    history: [],
                    responseTime: 0,
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0,
                },
            ];

            const newMonitors: Monitor[] = [
                {
                    id: "monitor1",
                    type: "http",
                    status: "up",
                    history: [],
                    responseTime: 0,
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0,
                },
                {
                    id: "",
                    type: "port",
                    status: "up",
                    history: [],
                    host: "example.com",
                    port: 80,
                    responseTime: 0,
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0,
                },
            ];

            const updates: Partial<Site> = { monitors: newMonitors };

            vi.mocked(mockSiteRepository.upsert).mockResolvedValue();
            vi.mocked(mockMonitorRepository.findBySiteIdentifier).mockResolvedValue(dbMonitors);
            vi.mocked(mockMonitorRepository.delete).mockResolvedValue(true);
            vi.mocked(mockMonitorRepository.update).mockResolvedValue();
            vi.mocked(mockMonitorRepository.create).mockResolvedValue("monitor3");

            await siteWriterService.updateSite(siteCache, "site1", updates);

            // Check that the repository methods were called correctly
            expect(mockMonitorRepository.findBySiteIdentifier).toHaveBeenCalledWith("site1");
            expect(mockMonitorRepository.deleteMonitorInternal).toHaveBeenCalled();
            expect(mockMonitorRepository.updateInternal).toHaveBeenCalled();
            expect(mockMonitorRepository.createInternal).toHaveBeenCalled();
            // Don't assert the specific ID since we're not actually mutating it anymore
        });
    });
});

describe("SiteWritingOrchestrator", () => {
    let siteWritingOrchestrator: SiteWritingOrchestrator;
    let mockSiteWriterService: SiteWriterService;

    beforeEach(() => {
        mockSiteWriterService = {
            createSite: vi.fn(),
            updateSite: vi.fn(),
            deleteSite: vi.fn(),
            handleMonitorIntervalChanges: vi.fn(),
            detectNewMonitors: vi.fn(() => []),
        } as unknown as SiteWriterService;

        siteWritingOrchestrator = new SiteWritingOrchestrator(mockSiteWriterService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("updateSiteWithMonitoring", () => {
        it("should update site and handle monitoring changes", async () => {
            const siteCache = new SiteCache();
            const originalSite: Site = {
                identifier: "site1",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "up",
                        history: [],
                        checkInterval: 10000,
                        responseTime: 0,
                        monitoring: false,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "",
                monitoring: false,
            };
            siteCache.set("site1", originalSite);

            const updatedSite: Site = {
                identifier: "site1",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "up",
                        history: [],
                        checkInterval: 15000,
                        responseTime: 0,
                        monitoring: false,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "",
                monitoring: false,
            };

            const updates: Partial<Site> = {
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        status: "up",
                        history: [],
                        checkInterval: 15000,
                        responseTime: 0,
                        monitoring: false,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
            };

            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn(),
                setupNewMonitors: function (site: Site, newMonitorIds: string[]): Promise<void> {
                    throw new Error("Function not implemented.");
                },
            };

            vi.mocked(mockSiteWriterService.updateSite).mockResolvedValue(updatedSite);
            vi.mocked(mockSiteWriterService.handleMonitorIntervalChanges).mockResolvedValue();

            const result = await siteWritingOrchestrator.updateSiteWithMonitoring(
                siteCache,
                "site1",
                updates,
                mockMonitoringConfig
            );

            expect(result).toEqual(updatedSite);
            expect(mockSiteWriterService.updateSite).toHaveBeenCalledWith(siteCache, "site1", updates);
            expect(mockSiteWriterService.handleMonitorIntervalChanges).toHaveBeenCalledWith(
                "site1",
                originalSite,
                updates.monitors,
                mockMonitoringConfig
            );
        });

        it("should not handle monitoring changes if monitors are not updated", async () => {
            const siteCache = new SiteCache();
            const originalSite: Site = {
                identifier: "site1",
                monitors: [],
                name: "",
                monitoring: false,
            };
            siteCache.set("site1", originalSite);

            const updatedSite: Site = {
                identifier: "site1",
                name: "Updated Name",
                monitors: [],
                monitoring: false,
            };

            const updates: Partial<Site> = {
                name: "Updated Name",
            };

            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn(),
                setupNewMonitors: function (site: Site, newMonitorIds: string[]): Promise<void> {
                    throw new Error("Function not implemented.");
                },
            };

            vi.mocked(mockSiteWriterService.updateSite).mockResolvedValue(updatedSite);

            const result = await siteWritingOrchestrator.updateSiteWithMonitoring(
                siteCache,
                "site1",
                updates,
                mockMonitoringConfig
            );

            expect(result).toEqual(updatedSite);
            expect(mockSiteWriterService.handleMonitorIntervalChanges).not.toHaveBeenCalled();
        });

        it("should throw SiteNotFoundError if site does not exist", async () => {
            const siteCache = new SiteCache();
            const updates: Partial<Site> = { name: "Updated Name" };
            const mockMonitoringConfig: MonitoringConfig = {
                setHistoryLimit: vi.fn(),
                startMonitoring: vi.fn(),
                stopMonitoring: vi.fn(),
                setupNewMonitors: function (site: Site, newMonitorIds: string[]): Promise<void> {
                    throw new Error("Function not implemented.");
                },
            };

            await expect(
                siteWritingOrchestrator.updateSiteWithMonitoring(
                    siteCache,
                    "non-existent",
                    updates,
                    mockMonitoringConfig
                )
            ).rejects.toThrow(SiteNotFoundError);
        });
    });
});
