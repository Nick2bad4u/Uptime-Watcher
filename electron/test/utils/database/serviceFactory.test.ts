/**
 * Tests for serviceFactory utility functions.
 * Validates service factory functions and dependency injection.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";

import {
    createSiteRepositoryService,
    createSiteWriterService,
    createSiteLoadingOrchestrator,
    createSiteWritingOrchestrator,
    createSiteCache,
    getSitesFromDatabase,
    loadSitesFromDatabase,
} from "../../../utils/database/serviceFactory";
import { SiteRepositoryService, SiteLoadingOrchestrator } from "../../../utils/database/SiteRepositoryService";
import { SiteWriterService, SiteWritingOrchestrator } from "../../../utils/database/SiteWriterService";
import { SiteCache } from "../../../utils/database/interfaces";
import type { Site } from "../../../types";

// Mock all external dependencies
vi.mock("../../../services/database", () => ({
    SiteRepository: vi.fn().mockImplementation(() => ({
        findAll: vi.fn(),
        findByIdentifier: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
        exportAll: vi.fn(),
        bulkInsert: vi.fn(),
        deleteAll: vi.fn(),
    })),
    MonitorRepository: vi.fn().mockImplementation(() => ({
        findBySiteIdentifier: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteBySiteIdentifier: vi.fn(),
        bulkCreate: vi.fn(),
        deleteAll: vi.fn(),
    })),
    HistoryRepository: vi.fn().mockImplementation(() => ({
        findByMonitorId: vi.fn(),
        create: vi.fn(),
        deleteByMonitorId: vi.fn(),
        bulkInsert: vi.fn(),
        deleteAll: vi.fn(),
    })),
    SettingsRepository: vi.fn().mockImplementation(() => ({
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
        getAll: vi.fn(),
        bulkInsert: vi.fn(),
        deleteAll: vi.fn(),
    })),
}));

vi.mock("../../../utils/logger", () => ({
    monitorLogger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("../../../utils/database/repositoryAdapters", () => ({
    SiteRepositoryAdapter: vi.fn().mockImplementation((repository) => repository),
    MonitorRepositoryAdapter: vi.fn().mockImplementation((repository) => repository),
    HistoryRepositoryAdapter: vi.fn().mockImplementation((repository) => repository),
    SettingsRepositoryAdapter: vi.fn().mockImplementation((repository) => repository),
    LoggerAdapter: vi.fn().mockImplementation((logger) => logger),
}));

vi.mock("../../../utils/database/SiteRepositoryService", () => ({
    SiteRepositoryService: vi.fn().mockImplementation((config) => ({
        getSitesFromDatabase: vi.fn(),
        loadSitesFromDatabase: vi.fn(),
        config,
    })),
    SiteLoadingOrchestrator: vi.fn().mockImplementation((service) => ({
        loadSitesFromDatabase: vi.fn(),
        service,
    })),
}));

vi.mock("../../../utils/database/SiteWriterService", () => ({
    SiteWriterService: vi.fn().mockImplementation((config) => ({
        createSite: vi.fn(),
        updateSite: vi.fn(),
        deleteSite: vi.fn(),
        config,
    })),
    SiteWritingOrchestrator: vi.fn().mockImplementation((service) => ({
        createSite: vi.fn(),
        updateSite: vi.fn(),
        deleteSite: vi.fn(),
        service,
    })),
}));

describe("serviceFactory", () => {
    let eventEmitter: EventEmitter;

    beforeEach(() => {
        eventEmitter = new EventEmitter();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("createSiteRepositoryService", () => {
        it("should create a SiteRepositoryService with proper dependencies", () => {
            const service = createSiteRepositoryService(eventEmitter);

            expect(service).toBeInstanceOf(SiteRepositoryService);
            expect(SiteRepositoryService).toHaveBeenCalledWith({
                eventEmitter,
                logger: expect.any(Object),
                repositories: {
                    history: expect.any(Object),
                    monitor: expect.any(Object),
                    settings: expect.any(Object),
                    site: expect.any(Object),
                },
            });
        });

        it("should create a new instance each time", () => {
            const service1 = createSiteRepositoryService(eventEmitter);
            const service2 = createSiteRepositoryService(eventEmitter);

            expect(service1).not.toBe(service2);
        });
    });

    describe("createSiteWriterService", () => {
        it("should create a SiteWriterService with proper dependencies", () => {
            const service = createSiteWriterService();

            expect(service).toBeInstanceOf(SiteWriterService);
            expect(SiteWriterService).toHaveBeenCalledWith({
                logger: expect.any(Object),
                repositories: {
                    monitor: expect.any(Object),
                    site: expect.any(Object),
                },
            });
        });

        it("should create a new instance each time", () => {
            const service1 = createSiteWriterService();
            const service2 = createSiteWriterService();

            expect(service1).not.toBe(service2);
        });
    });

    describe("createSiteLoadingOrchestrator", () => {
        it("should create a SiteLoadingOrchestrator with proper dependencies", () => {
            const orchestrator = createSiteLoadingOrchestrator(eventEmitter);

            expect(orchestrator).toBeInstanceOf(SiteLoadingOrchestrator);
            expect(SiteLoadingOrchestrator).toHaveBeenCalledWith(expect.any(SiteRepositoryService));
        });

        it("should create a new instance each time", () => {
            const orchestrator1 = createSiteLoadingOrchestrator(eventEmitter);
            const orchestrator2 = createSiteLoadingOrchestrator(eventEmitter);

            expect(orchestrator1).not.toBe(orchestrator2);
        });
    });

    describe("createSiteWritingOrchestrator", () => {
        it("should create a SiteWritingOrchestrator with proper dependencies", () => {
            const orchestrator = createSiteWritingOrchestrator();

            expect(orchestrator).toBeInstanceOf(SiteWritingOrchestrator);
            expect(SiteWritingOrchestrator).toHaveBeenCalledWith(expect.any(SiteWriterService));
        });

        it("should create a new instance each time", () => {
            const orchestrator1 = createSiteWritingOrchestrator();
            const orchestrator2 = createSiteWritingOrchestrator();

            expect(orchestrator1).not.toBe(orchestrator2);
        });
    });

    describe("createSiteCache", () => {
        it("should create a SiteCache instance", () => {
            const cache = createSiteCache();

            expect(cache).toBeInstanceOf(SiteCache);
            expect(cache.size()).toBe(0);
        });

        it("should create a new instance each time", () => {
            const cache1 = createSiteCache();
            const cache2 = createSiteCache();

            expect(cache1).not.toBe(cache2);
        });

        it("should create a functional cache", () => {
            const cache = createSiteCache();
            const testSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
            };

            cache.set("test-site", testSite);
            expect(cache.get("test-site")).toBe(testSite);
            expect(cache.size()).toBe(1);

            cache.delete("test-site");
            expect(cache.get("test-site")).toBeUndefined();
            expect(cache.size()).toBe(0);
        });
    });

    describe("getSitesFromDatabase (legacy)", () => {
        it("should create a service and call getSitesFromDatabase", async () => {
            const mockSites: Site[] = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitors: [],
                },
                {
                    identifier: "site2",
                    name: "Site 2",
                    monitors: [],
                },
            ];

            // Mock the service method
            const mockGetSitesFromDatabase = vi.fn().mockResolvedValue(mockSites);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (SiteRepositoryService as any).mockImplementation(() => ({
                getSitesFromDatabase: mockGetSitesFromDatabase,
            }));

            const config = {
                repositories: {
                    site: vi.fn(),
                    monitor: vi.fn(),
                    history: vi.fn(),
                },
            };

            const result = await getSitesFromDatabase(config as never);

            expect(result).toBe(mockSites);
            expect(mockGetSitesFromDatabase).toHaveBeenCalledOnce();
        });
    });

    describe("loadSitesFromDatabase (legacy)", () => {
        let mockSitesMap: Map<string, Site>;
        let mockSetHistoryLimit: ReturnType<typeof vi.fn>;
        let mockStartMonitoring: ReturnType<typeof vi.fn>;
        let mockConfig: unknown;

        beforeEach(() => {
            mockSitesMap = new Map();
            mockSetHistoryLimit = vi.fn();
            mockStartMonitoring = vi.fn();
            mockConfig = {
                repositories: {
                    site: vi.fn(),
                    monitor: vi.fn(),
                    history: vi.fn(),
                    settings: vi.fn(),
                },
                sites: mockSitesMap,
                setHistoryLimit: mockSetHistoryLimit,
                startMonitoring: mockStartMonitoring,
                eventEmitter: new EventEmitter(),
            };
        });

        const createMockSites = (): Site[] => [
            {
                identifier: "site1",
                name: "Site 1",
                monitors: [],
            },
            {
                identifier: "site2",
                name: "Site 2",
                monitors: [],
            },
        ];

        it("should successfully load sites from database", async () => {
            const mockSites = createMockSites();

            // Mock the orchestrator loadSitesFromDatabase method
            const mockLoadSitesFromDatabase = vi.fn().mockImplementation(async (cache) => {
                // Simulate loading sites into cache
                for (const site of mockSites) {
                    cache.set(site.identifier, site);
                }
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (SiteLoadingOrchestrator as any).mockImplementation(() => ({
                loadSitesFromDatabase: mockLoadSitesFromDatabase,
            }));

            const result = await loadSitesFromDatabase(mockConfig as never);

            expect(result.success).toBe(true);
            expect(result.sitesLoaded).toBe(2);
            expect(result.message).toBe("Successfully loaded 2 sites");
            expect(mockLoadSitesFromDatabase).toHaveBeenCalledWith(expect.any(SiteCache), {
                setHistoryLimit: mockSetHistoryLimit,
                startMonitoring: mockStartMonitoring,
                stopMonitoring: expect.any(Function),
            });
            expect(mockSitesMap.size).toBe(2);
            expect(mockSitesMap.get("site1")).toBeDefined();
            expect(mockSitesMap.get("site2")).toBeDefined();
        });

        it("should handle errors and return failure result", async () => {
            const mockError = new Error("Database connection failed");
            const mockLoadSitesFromDatabase = vi.fn().mockRejectedValue(mockError);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (SiteLoadingOrchestrator as any).mockImplementation(() => ({
                loadSitesFromDatabase: mockLoadSitesFromDatabase,
            }));

            const result = await loadSitesFromDatabase(mockConfig as never);

            expect(result.success).toBe(false);
            expect(result.sitesLoaded).toBe(0);
            expect(result.message).toBe("Failed to load sites: Database connection failed");
            expect(mockSitesMap.size).toBe(0);
        });

        it("should handle unknown errors", async () => {
            const mockLoadSitesFromDatabase = vi.fn().mockRejectedValue("Unknown error");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (SiteLoadingOrchestrator as any).mockImplementation(() => ({
                loadSitesFromDatabase: mockLoadSitesFromDatabase,
            }));

            const result = await loadSitesFromDatabase(mockConfig as never);

            expect(result.success).toBe(false);
            expect(result.sitesLoaded).toBe(0);
            expect(result.message).toBe("Failed to load sites: Unknown error");
        });

        it("should clear existing sites before loading new ones", async () => {
            // Pre-populate the sites map
            mockSitesMap.set("existing-site", {
                identifier: "existing-site",
                name: "Existing Site",
                monitors: [],
            });

            const mockSites: Site[] = [
                {
                    identifier: "new-site",
                    name: "New Site",
                    monitors: [],
                },
            ];

            const mockLoadSitesFromDatabase = vi.fn().mockImplementation(async (cache) => {
                for (const site of mockSites) {
                    cache.set(site.identifier, site);
                }
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (SiteLoadingOrchestrator as any).mockImplementation(() => ({
                loadSitesFromDatabase: mockLoadSitesFromDatabase,
            }));

            const result = await loadSitesFromDatabase(mockConfig as never);

            expect(result.success).toBe(true);
            expect(result.sitesLoaded).toBe(1);
            expect(mockSitesMap.size).toBe(1);
            expect(mockSitesMap.get("existing-site")).toBeUndefined();
            expect(mockSitesMap.get("new-site")).toBeDefined();
        });

        it("should handle empty sites result", async () => {
            const mockLoadSitesFromDatabase = vi.fn().mockImplementation(async () => {
                // Load no sites
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (SiteLoadingOrchestrator as any).mockImplementation(() => ({
                loadSitesFromDatabase: mockLoadSitesFromDatabase,
            }));

            const result = await loadSitesFromDatabase(mockConfig as never);

            expect(result.success).toBe(true);
            expect(result.sitesLoaded).toBe(0);
            expect(result.message).toBe("Successfully loaded 0 sites");
            expect(mockSitesMap.size).toBe(0);
        });
    });
});
