/**
 * Tests for site writer utilities
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    createSite,
    updateSite,
    deleteSite,
    validateUpdateSiteInput,
    createUpdatedSite,
    updateSiteMonitors,
    deleteObsoleteMonitors,
    upsertSiteMonitors,
    type CreateSiteConfig,
    type SiteUpdateDependencies,
    type SiteUpdateCallbacks,
    type RemoveSiteParams
} from "../../../utils/database/siteWriter";
import { MonitorRepository, SiteRepository } from "../../../services/database";
import { Site, Monitor } from "../../../types";
import { monitorLogger } from "../../../utils/logger";
import { isDev } from "../../../electronUtils";

// Mock the dependencies
vi.mock("../../../electronUtils", () => ({
    isDev: vi.fn(() => false)
}));

vi.mock("../../../utils/logger", () => ({
    monitorLogger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn()
    }
}));

describe("siteWriter", () => {
    let mockSiteRepository: SiteRepository;
    let mockMonitorRepository: MonitorRepository;
    let mockSites: Map<string, Site>;
    let mockLogger: typeof monitorLogger;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Create mock repositories
        mockSiteRepository = {
            upsert: vi.fn(),
            delete: vi.fn(),
            findByIdentifier: vi.fn(),
            findAll: vi.fn()
        } as unknown as SiteRepository;

        mockMonitorRepository = {
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            deleteBySiteIdentifier: vi.fn(),
            findBySiteIdentifier: vi.fn(),
            findById: vi.fn(),
            findAll: vi.fn()
        } as unknown as MonitorRepository;

        mockSites = new Map();
        mockLogger = monitorLogger;
    });

    describe("createSite", () => {
        it("should create a site with monitors and assign IDs", async () => {
            const monitor: Monitor = {
                id: "temp-id",
                type: "http",
                url: "https://example.com",
                status: "pending",
                history: [],
                checkInterval: 300,
                monitoring: false
            };

            const siteData: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [monitor]
            };

            const config: CreateSiteConfig = {
                repositories: {
                    site: mockSiteRepository,
                    monitor: mockMonitorRepository
                },
                siteData
            };

            // Mock repository responses
            vi.mocked(mockMonitorRepository.create).mockResolvedValue("new-monitor-id");

            const result = await createSite(config);

            expect(mockSiteRepository.upsert).toHaveBeenCalledWith(siteData);
            expect(mockMonitorRepository.deleteBySiteIdentifier).toHaveBeenCalledWith("test-site");
            expect(mockMonitorRepository.create).toHaveBeenCalledWith("test-site", monitor);
            expect(result.monitors[0].id).toBe("new-monitor-id");
            expect(mockLogger.info).toHaveBeenCalledWith("Creating new site in database: test-site");
            expect(mockLogger.info).toHaveBeenCalledWith("Site created successfully in database: test-site (Test Site)");
        });

        it("should create a site with unnamed site", async () => {
            const siteData: Site = {
                identifier: "test-site",
                monitors: []
            };

            const config: CreateSiteConfig = {
                repositories: {
                    site: mockSiteRepository,
                    monitor: mockMonitorRepository
                },
                siteData
            };

            await createSite(config);

            expect(mockLogger.info).toHaveBeenCalledWith("Site created successfully in database: test-site (unnamed)");
        });

        it("should handle multiple monitors", async () => {
            const monitors: Monitor[] = [
                {
                    id: "temp-id-1",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    history: [],
                    checkInterval: 300,
                    monitoring: false
                },
                {
                    id: "temp-id-2",
                    type: "port",
                    port: 80,
                    host: "example.com",
                    status: "pending",
                    history: [],
                    checkInterval: 300,
                    monitoring: false
                }
            ];

            const siteData: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors
            };

            const config: CreateSiteConfig = {
                repositories: {
                    site: mockSiteRepository,
                    monitor: mockMonitorRepository
                },
                siteData
            };

            vi.mocked(mockMonitorRepository.create)
                .mockResolvedValueOnce("monitor-id-1")
                .mockResolvedValueOnce("monitor-id-2");

            const result = await createSite(config);

            expect(mockMonitorRepository.create).toHaveBeenCalledTimes(2);
            expect(result.monitors[0].id).toBe("monitor-id-1");
            expect(result.monitors[1].id).toBe("monitor-id-2");
        });
    });

    describe("updateSite", () => {
        let deps: SiteUpdateDependencies;
        let callbacks: SiteUpdateCallbacks;
        let existingSite: Site;

        beforeEach(() => {
            existingSite = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [{
                    id: "existing-monitor",
                    type: "http",
                    url: "https://example.com",
                    status: "up",
                    history: [],
                    checkInterval: 300,
                    monitoring: false
                }]
            };

            mockSites.set("test-site", existingSite);

            deps = {
                monitorRepository: mockMonitorRepository,
                siteRepository: mockSiteRepository,
                sites: mockSites,
                logger: mockLogger
            };

            callbacks = {
                stopMonitoringForSite: vi.fn().mockResolvedValue(true),
                startMonitoringForSite: vi.fn().mockResolvedValue(true)
            };
        });

        it("should update site without monitors", async () => {
            const updates = { name: "Updated Site Name" };

            const result = await updateSite(deps, callbacks, "test-site", updates);

            expect(mockSiteRepository.upsert).toHaveBeenCalled();
            expect(result.name).toBe("Updated Site Name");
            expect(mockSites.get("test-site")?.name).toBe("Updated Site Name");
        });

        it("should update site with monitors", async () => {
            const newMonitor: Monitor = {
                id: "new-monitor",
                type: "port",
                port: 443,
                host: "example.com",
                status: "pending",
                history: [],
                checkInterval: 600,
                monitoring: false
            };

            const updates = { 
                name: "Updated Site",
                monitors: [newMonitor]
            };

            vi.mocked(mockMonitorRepository.findBySiteIdentifier)
                .mockResolvedValue([existingSite.monitors[0]]);

            const result = await updateSite(deps, callbacks, "test-site", updates);

            expect(mockSiteRepository.upsert).toHaveBeenCalled();
            expect(result.monitors).toEqual([newMonitor]);
            expect(mockMonitorRepository.findBySiteIdentifier).toHaveBeenCalledWith("test-site");
        });

        it("should throw error for invalid identifier", async () => {
            await expect(
                updateSite(deps, callbacks, "", {})
            ).rejects.toThrow("Site identifier is required");
        });

        it("should throw error for non-existent site", async () => {
            await expect(
                updateSite(deps, callbacks, "non-existent", {})
            ).rejects.toThrow("Site not found: non-existent");
        });
    });

    describe("deleteSite", () => {
        beforeEach(() => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: []
            };
            mockSites.set("test-site", site);
        });

        it("should delete existing site", async () => {
            const params: RemoveSiteParams = {
                identifier: "test-site",
                repositories: {
                    site: mockSiteRepository,
                    monitor: mockMonitorRepository
                },
                sites: mockSites,
                logger: mockLogger
            };

            const result = await deleteSite(params);

            expect(result).toBe(true);
            expect(mockSites.has("test-site")).toBe(false);
            expect(mockMonitorRepository.deleteBySiteIdentifier).toHaveBeenCalledWith("test-site");
            expect(mockSiteRepository.delete).toHaveBeenCalledWith("test-site");
            expect(mockLogger.info).toHaveBeenCalledWith("Removing site: test-site");
            expect(mockLogger.info).toHaveBeenCalledWith("Site removed successfully: test-site");
        });

        it("should handle non-existent site deletion", async () => {
            const params: RemoveSiteParams = {
                identifier: "non-existent",
                repositories: {
                    site: mockSiteRepository,
                    monitor: mockMonitorRepository
                },
                sites: mockSites,
                logger: mockLogger
            };

            const result = await deleteSite(params);

            expect(result).toBe(false);
            expect(mockMonitorRepository.deleteBySiteIdentifier).toHaveBeenCalledWith("non-existent");
            expect(mockSiteRepository.delete).toHaveBeenCalledWith("non-existent");
            expect(mockLogger.warn).toHaveBeenCalledWith("Site not found for removal: non-existent");
        });
    });

    describe("validateUpdateSiteInput", () => {
        let deps: SiteUpdateDependencies;

        beforeEach(() => {
            deps = {
                monitorRepository: mockMonitorRepository,
                siteRepository: mockSiteRepository,
                sites: mockSites,
                logger: mockLogger
            };
        });

        it("should validate and return existing site", () => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: []
            };
            mockSites.set("test-site", site);

            const result = validateUpdateSiteInput(deps, "test-site");

            expect(result).toEqual(site);
        });

        it("should throw error for empty identifier", () => {
            expect(() => validateUpdateSiteInput(deps, "")).toThrow("Site identifier is required");
        });

        it("should throw error for non-existent site", () => {
            expect(() => validateUpdateSiteInput(deps, "non-existent")).toThrow("Site not found: non-existent");
        });
    });

    describe("createUpdatedSite", () => {
        let deps: SiteUpdateDependencies;

        beforeEach(() => {
            deps = {
                monitorRepository: mockMonitorRepository,
                siteRepository: mockSiteRepository,
                sites: mockSites,
                logger: mockLogger
            };
        });

        it("should create updated site with new values", () => {
            const originalSite: Site = {
                identifier: "test-site",
                name: "Original Name",
                monitors: []
            };

            const updates = { name: "Updated Name" };

            const result = createUpdatedSite(deps, originalSite, updates);

            expect(result.name).toBe("Updated Name");
            expect(result.identifier).toBe("test-site");
            expect(mockSites.get("test-site")).toEqual(result);
        });

        it("should handle monitor updates", () => {
            const originalSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: []
            };

            const newMonitors: Monitor[] = [{
                id: "new-monitor",
                type: "http",
                url: "https://example.com",
                status: "pending",
                history: [],
                checkInterval: 300,
                monitoring: false
            }];

            const updates = { monitors: newMonitors };

            const result = createUpdatedSite(deps, originalSite, updates);

            expect(result.monitors).toEqual(newMonitors);
        });

        it("should preserve original monitors when no monitor updates", () => {
            const originalMonitors: Monitor[] = [{
                id: "existing-monitor",
                type: "http",
                url: "https://example.com",
                status: "up",
                history: [],
                checkInterval: 300,
                monitoring: false
            }];

            const originalSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: originalMonitors
            };

            const updates = { name: "Updated Name" };

            const result = createUpdatedSite(deps, originalSite, updates);

            expect(result.monitors).toEqual(originalMonitors);
        });
    });

    describe("updateSiteMonitors", () => {
        let deps: SiteUpdateDependencies;

        beforeEach(() => {
            deps = {
                monitorRepository: mockMonitorRepository,
                siteRepository: mockSiteRepository,
                sites: mockSites,
                logger: mockLogger
            };
        });

        it("should update site monitors", async () => {
            const existingMonitors: Monitor[] = [{
                id: "existing-monitor",
                type: "http",
                url: "https://example.com",
                status: "up",
                history: [],
                checkInterval: 300,
                monitoring: false
            }];

            const newMonitors: Monitor[] = [{
                id: "new-monitor",
                type: "port",
                port: 443,
                host: "example.com",
                status: "pending",
                history: [],
                checkInterval: 600,
                monitoring: false
            }];

            vi.mocked(mockMonitorRepository.findBySiteIdentifier)
                .mockResolvedValue(existingMonitors);

            await updateSiteMonitors(deps, "test-site", newMonitors);

            expect(mockMonitorRepository.findBySiteIdentifier).toHaveBeenCalledWith("test-site");
        });
    });

    describe("deleteObsoleteMonitors", () => {
        let deps: SiteUpdateDependencies;

        beforeEach(() => {
            deps = {
                monitorRepository: mockMonitorRepository,
                siteRepository: mockSiteRepository,
                sites: mockSites,
                logger: mockLogger
            };
        });

        it("should delete monitors not in new monitors array", async () => {
            const dbMonitors: Monitor[] = [
                {
                    id: "monitor-1",
                    type: "http",
                    url: "https://example.com",
                    status: "up",
                    history: [],
                    checkInterval: 300,
                    monitoring: false
                },
                {
                    id: "monitor-2",
                    type: "port",
                    port: 443,
                    host: "example.com",
                    status: "up",
                    history: [],
                    checkInterval: 600,
                    monitoring: false
                }
            ];

            const newMonitors: Monitor[] = [{
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                status: "up",
                history: [],
                checkInterval: 300,
                monitoring: false
            }];

            await deleteObsoleteMonitors(deps, dbMonitors, newMonitors);

            expect(mockMonitorRepository.delete).toHaveBeenCalledWith("monitor-2");
            expect(mockMonitorRepository.delete).toHaveBeenCalledTimes(1);
        });

        it("should not delete monitors that still exist in new monitors", async () => {
            const dbMonitors: Monitor[] = [{
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                status: "up",
                history: [],
                checkInterval: 300,
                monitoring: false
            }];

            const newMonitors: Monitor[] = [{
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                status: "up",
                history: [],
                checkInterval: 300,
                monitoring: false
            }];

            await deleteObsoleteMonitors(deps, dbMonitors, newMonitors);

            expect(mockMonitorRepository.delete).not.toHaveBeenCalled();
        });

        it("should handle monitors without IDs", async () => {
            const dbMonitors: Monitor[] = [{
                id: "",
                type: "http",
                url: "https://example.com",
                status: "up",
                history: [],
                checkInterval: 300,
                monitoring: false
            }];

            const newMonitors: Monitor[] = [];

            await deleteObsoleteMonitors(deps, dbMonitors, newMonitors);

            expect(mockMonitorRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe("upsertSiteMonitors", () => {
        let deps: SiteUpdateDependencies;

        beforeEach(() => {
            deps = {
                monitorRepository: mockMonitorRepository,
                siteRepository: mockSiteRepository,
                sites: mockSites,
                logger: mockLogger
            };
        });

        it("should update existing monitors", async () => {
            const monitors: Monitor[] = [{
                id: "existing-monitor",
                type: "http",
                url: "https://example.com",
                status: "up",
                history: [],
                checkInterval: 300,
                monitoring: false
            }];

            // Mock findById to return the existing monitor
            vi.mocked(mockMonitorRepository.findById).mockResolvedValue(monitors[0]);

            await upsertSiteMonitors(deps, "test-site", monitors);

            expect(mockMonitorRepository.findById).toHaveBeenCalledWith("existing-monitor");
            expect(mockMonitorRepository.update).toHaveBeenCalledWith("existing-monitor", monitors[0]);
            expect(mockMonitorRepository.create).not.toHaveBeenCalled();
        });

        it("should create new monitors for non-existent IDs", async () => {
            const monitors: Monitor[] = [{
                id: "non-existent-monitor",
                type: "http",
                url: "https://example.com",
                status: "pending",
                history: [],
                checkInterval: 300,
                monitoring: false
            }];

            // Mock findById to return null (monitor doesn't exist)
            vi.mocked(mockMonitorRepository.findById).mockResolvedValue(null);
            vi.mocked(mockMonitorRepository.create).mockResolvedValue("new-monitor-id");

            await upsertSiteMonitors(deps, "test-site", monitors);

            expect(mockMonitorRepository.findById).toHaveBeenCalledWith("non-existent-monitor");
            expect(mockMonitorRepository.create).toHaveBeenCalledWith("test-site", monitors[0]);
            expect(monitors[0].id).toBe("new-monitor-id");
            expect(mockMonitorRepository.update).not.toHaveBeenCalled();
        });

        it("should create new monitors without IDs", async () => {
            const monitors: Monitor[] = [{
                id: "",
                type: "http",
                url: "https://example.com",
                status: "pending",
                history: [],
                checkInterval: 300,
                monitoring: false
            }];

            vi.mocked(mockMonitorRepository.create).mockResolvedValue("new-monitor-id");

            await upsertSiteMonitors(deps, "test-site", monitors);

            expect(mockMonitorRepository.create).toHaveBeenCalledWith("test-site", monitors[0]);
            expect(monitors[0].id).toBe("new-monitor-id");
        });

        it("should handle mixed monitor types", async () => {
            const monitors: Monitor[] = [
                {
                    id: "existing-monitor",
                    type: "http",
                    url: "https://example.com",
                    status: "up",
                    history: [],
                    checkInterval: 300,
                    monitoring: false
                },
                {
                    id: "",
                    type: "port",
                    port: 443,
                    host: "example.com",
                    status: "pending",
                    history: [],
                    checkInterval: 600,
                    monitoring: false
                }
            ];

            // Mock findById to return the existing monitor for the first one
            vi.mocked(mockMonitorRepository.findById).mockResolvedValue(monitors[0]);
            vi.mocked(mockMonitorRepository.create).mockResolvedValue("new-monitor-id");

            await upsertSiteMonitors(deps, "test-site", monitors);

            expect(mockMonitorRepository.findById).toHaveBeenCalledWith("existing-monitor");
            expect(mockMonitorRepository.update).toHaveBeenCalledWith("existing-monitor", monitors[0]);
            expect(mockMonitorRepository.create).toHaveBeenCalledWith("test-site", monitors[1]);
            expect(monitors[1].id).toBe("new-monitor-id");
        });
    });

    describe("handleMonitorIntervalChanges (development mode)", () => {
        let deps: SiteUpdateDependencies;
        let callbacks: SiteUpdateCallbacks;

        beforeEach(() => {
            deps = {
                monitorRepository: mockMonitorRepository,
                siteRepository: mockSiteRepository,
                sites: mockSites,
                logger: mockLogger
            };

            callbacks = {
                stopMonitoringForSite: vi.fn().mockResolvedValue(true),
                startMonitoringForSite: vi.fn().mockResolvedValue(true)
            };

            // Mock isDev to return true for these tests
            vi.mocked(isDev).mockReturnValue(true);
        });

        afterEach(() => {
            // Reset isDev mock
            vi.mocked(isDev).mockReturnValue(false);
        });

        it("should skip monitors without IDs", async () => {
            const originalSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [{
                    id: "",
                    type: "http",
                    url: "https://example.com",
                    status: "up",
                    history: [],
                    checkInterval: 300,
                    monitoring: true
                }]
            };

            const newMonitors: Monitor[] = [{
                id: "",
                type: "http",
                url: "https://example.com",
                status: "up",
                history: [],
                checkInterval: 600,
                monitoring: true
            }];

            const updates = { monitors: newMonitors };

            mockSites.set("test-site", originalSite);
            vi.mocked(mockMonitorRepository.findBySiteIdentifier)
                .mockResolvedValue([]);

            await updateSite(deps, callbacks, "test-site", updates);

            expect(callbacks.stopMonitoringForSite).not.toHaveBeenCalled();
            expect(callbacks.startMonitoringForSite).not.toHaveBeenCalled();
        });

        it("should handle no interval changes", async () => {
            const originalSite: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [{
                    id: "monitor-1",
                    type: "http",
                    url: "https://example.com",
                    status: "up",
                    history: [],
                    checkInterval: 300,
                    monitoring: true
                }]
            };

            const newMonitors: Monitor[] = [{
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                status: "up",
                history: [],
                checkInterval: 300, // Same interval
                monitoring: true
            }];

            const updates = { monitors: newMonitors };

            mockSites.set("test-site", originalSite);
            vi.mocked(mockMonitorRepository.findBySiteIdentifier)
                .mockResolvedValue(originalSite.monitors);

            await updateSite(deps, callbacks, "test-site", updates);

            expect(callbacks.stopMonitoringForSite).not.toHaveBeenCalled();
            expect(callbacks.startMonitoringForSite).not.toHaveBeenCalled();
        });
    });
});
