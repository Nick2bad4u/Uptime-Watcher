/**
 * Tests for SiteManager class.
 * Tests all methods and edge cases for comprehensive coverage.
 */

import { EventEmitter } from "events";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the logger with factory function
vi.mock("../../utils/logger", () => ({
    monitorLogger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock the database utilities with factory functions
vi.mock("../../utils/database", () => ({
    getSitesFromDatabase: vi.fn(),
    createSite: vi.fn(),
    deleteSite: vi.fn(),
    updateSite: vi.fn(),
}));

// Mock the ConfigurationManager with factory function
vi.mock("../../managers/ConfigurationManager", () => ({
    configurationManager: {
        validateSiteConfiguration: vi.fn(() => ({ isValid: true, errors: [] })),
        validateMonitorConfiguration: vi.fn(() => ({ isValid: true, errors: [] })),
        shouldAutoStartMonitoring: vi.fn(() => true),
        shouldApplyDefaultInterval: vi.fn(() => true),
        getDefaultMonitorInterval: vi.fn(() => 60000),
        getHistoryRetentionRules: vi.fn(() => ({ defaultLimit: 1000, maxLimit: 10000, minLimit: 100 })),
        getMinimumCheckInterval: vi.fn(() => 1000),
        getMinimumTimeout: vi.fn(() => 1000),
        getMaximumPortNumber: vi.fn(() => 65535),
        shouldIncludeInExport: vi.fn(() => true),
    },
}));

// Import after mocks are set up
import { SiteManager, SiteManagerDependencies } from "../../managers/SiteManager";
import { SITE_EVENTS } from "../../events";
import type { Site } from "../../types";
import { getSitesFromDatabase, createSite, deleteSite, updateSite } from "../../utils/database";
import { configurationManager } from "../../managers/ConfigurationManager";
import { monitorLogger } from "../../utils/logger";

// Get the mocked functions
const mockGetSitesFromDatabase = vi.mocked(getSitesFromDatabase);
const mockCreateSite = vi.mocked(createSite);
const mockDeleteSite = vi.mocked(deleteSite);
const mockUpdateSite = vi.mocked(updateSite);
const mockConfigurationManager = vi.mocked(configurationManager);
const mockLogger = vi.mocked(monitorLogger);

describe("SiteManager", () => {
    let siteManager: SiteManager;
    let mockEventEmitter: EventEmitter;

    const mockSite: Site = {
        identifier: "test-site",
        name: "Test Site",
        monitors: [
            {
                id: "test-monitor",
                type: "http",
                status: "pending",
                history: [],
                url: "https://example.com",
                checkInterval: 60000,
                timeout: 30000,
                retryAttempts: 3,
            },
        ],
    };

    const mockSiteWithoutName: Site = {
        identifier: "test-site-no-name",
        monitors: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockEventEmitter = new EventEmitter();

        const mockRepositories: SiteManagerDependencies = {
            eventEmitter: mockEventEmitter,
            siteRepository: {
                findAll: vi.fn(),
                findByIdentifier: vi.fn(),
                getByIdentifier: vi.fn(),
                upsert: vi.fn(),
                delete: vi.fn(),
                exists: vi.fn(),
                exportAll: vi.fn(),
                deleteAll: vi.fn(),
                bulkInsert: vi.fn(),
            } as Partial<SiteManagerDependencies["siteRepository"]> as SiteManagerDependencies["siteRepository"],
            monitorRepository: {
                findBySiteIdentifier: vi.fn(),
                findById: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
                deleteBySiteIdentifier: vi.fn(),
                getAllMonitorIds: vi.fn(),
                deleteAll: vi.fn(),
                bulkCreate: vi.fn(),
            } as Partial<SiteManagerDependencies["monitorRepository"]> as SiteManagerDependencies["monitorRepository"],
            historyRepository: {
                findByMonitorId: vi.fn(),
                addEntry: vi.fn(),
                deleteByMonitorId: vi.fn(),
                pruneHistory: vi.fn(),
                pruneAllHistory: vi.fn(),
                getHistoryCount: vi.fn(),
                deleteAll: vi.fn(),
                getLatestEntry: vi.fn(),
                bulkInsert: vi.fn(),
            } as Partial<SiteManagerDependencies["historyRepository"]> as SiteManagerDependencies["historyRepository"],
            databaseService: {
                initialize: vi.fn(),
                getDatabase: vi.fn(),
                executeTransaction: vi.fn(),
                downloadBackup: vi.fn(),
                close: vi.fn(),
            } as Partial<SiteManagerDependencies["databaseService"]> as SiteManagerDependencies["databaseService"],
        };

        siteManager = new SiteManager(mockRepositories);
    });

    describe("getSites", () => {
        it("should return sites from database", async () => {
            const expectedSites = [mockSite];
            mockGetSitesFromDatabase.mockResolvedValue(expectedSites);

            const result = await siteManager.getSites();

            expect(result).toEqual(expectedSites);
            expect(mockGetSitesFromDatabase).toHaveBeenCalledWith({
                repositories: {
                    history: expect.any(Object),
                    monitor: expect.any(Object),
                    site: expect.any(Object),
                },
            });
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockGetSitesFromDatabase.mockRejectedValue(error);

            await expect(siteManager.getSites()).rejects.toThrow("Database error");
        });
    });

    describe("getSitesFromCache", () => {
        it("should return sites from cache", () => {
            siteManager.updateSitesCache([mockSite]);

            const result = siteManager.getSitesFromCache();

            expect(result).toEqual([mockSite]);
        });

        it("should return empty array when cache is empty", () => {
            const result = siteManager.getSitesFromCache();

            expect(result).toEqual([]);
        });
    });

    describe("getSitesCache", () => {
        it("should return the sites cache map", () => {
            siteManager.updateSitesCache([mockSite]);

            const result = siteManager.getSitesCache();

            expect(result).toBeInstanceOf(Map);
            expect(result.get("test-site")).toEqual(mockSite);
        });
    });

    describe("addSite", () => {
        it("should add a site successfully", async () => {
            mockCreateSite.mockResolvedValue(mockSite);
            
            const eventSpy = vi.fn();
            mockEventEmitter.on(SITE_EVENTS.SITE_ADDED, eventSpy);

            const result = await siteManager.addSite(mockSite);

            expect(result).toEqual(mockSite);
            expect(mockConfigurationManager.validateSiteConfiguration).toHaveBeenCalledWith(mockSite);
            expect(mockCreateSite).toHaveBeenCalledWith({
                databaseService: expect.any(Object),
                repositories: {
                    monitor: expect.any(Object),
                    site: expect.any(Object),
                },
                siteData: mockSite,
            });
            expect(siteManager.getSiteFromCache("test-site")).toEqual(mockSite);
            expect(eventSpy).toHaveBeenCalledWith({
                identifier: "test-site",
                operation: "added",
                site: mockSite,
            });
            expect(mockLogger.info).toHaveBeenCalledWith("Site added successfully: test-site (Test Site)");
        });

        it("should add a site without name successfully", async () => {
            mockCreateSite.mockResolvedValue(mockSiteWithoutName);

            const result = await siteManager.addSite(mockSiteWithoutName);

            expect(result).toEqual(mockSiteWithoutName);
            expect(mockLogger.info).toHaveBeenCalledWith("Site added successfully: test-site-no-name (unnamed)");
        });

        it("should throw error when site validation fails", async () => {
            mockConfigurationManager.validateSiteConfiguration.mockReturnValue({
                isValid: false,
                errors: ["Invalid URL", "Missing monitors"],
            });

            await expect(siteManager.addSite(mockSite)).rejects.toThrow(
                "Site validation failed: Invalid URL, Missing monitors"
            );

            expect(mockCreateSite).not.toHaveBeenCalled();
        });

        it("should handle database creation errors", async () => {
            const error = new Error("Database creation error");
            mockCreateSite.mockRejectedValue(error);

            await expect(siteManager.addSite(mockSite)).rejects.toThrow("Database creation error");
        });
    });

    describe("removeSite", () => {
        it("should remove a site successfully", async () => {
            mockDeleteSite.mockResolvedValue(true);
            
            const eventSpy = vi.fn();
            mockEventEmitter.on(SITE_EVENTS.SITE_REMOVED, eventSpy);

            const result = await siteManager.removeSite("test-site");

            expect(result).toBe(true);
            expect(mockDeleteSite).toHaveBeenCalledWith({
                databaseService: expect.any(Object),
                identifier: "test-site",
                logger: mockLogger,
                repositories: {
                    monitor: expect.any(Object),
                    site: expect.any(Object),
                },
                sites: expect.any(Map),
            });
            expect(eventSpy).toHaveBeenCalledWith({
                identifier: "test-site",
                operation: "removed",
            });
        });

        it("should return false when site removal fails", async () => {
            mockDeleteSite.mockResolvedValue(false);
            
            const eventSpy = vi.fn();
            mockEventEmitter.on(SITE_EVENTS.SITE_REMOVED, eventSpy);

            const result = await siteManager.removeSite("test-site");

            expect(result).toBe(false);
            expect(eventSpy).not.toHaveBeenCalled();
        });

        it("should handle database deletion errors", async () => {
            const error = new Error("Database deletion error");
            mockDeleteSite.mockRejectedValue(error);

            await expect(siteManager.removeSite("test-site")).rejects.toThrow("Database deletion error");
        });
    });

    describe("updateSite", () => {
        it("should update a site successfully", async () => {
            const updatedSite = { ...mockSite, name: "Updated Site" };
            mockUpdateSite.mockResolvedValue(updatedSite);
            
            const eventSpy = vi.fn();
            mockEventEmitter.on(SITE_EVENTS.SITE_UPDATED, eventSpy);

            const result = await siteManager.updateSite("test-site", { name: "Updated Site" });

            expect(result).toEqual(updatedSite);
            expect(mockUpdateSite).toHaveBeenCalledWith(
                expect.objectContaining({
                    logger: mockLogger,
                    monitorRepository: expect.any(Object),
                    siteRepository: expect.any(Object),
                    sites: expect.any(Map),
                }),
                expect.objectContaining({
                    startMonitoringForSite: expect.any(Function),
                    stopMonitoringForSite: expect.any(Function),
                }),
                "test-site",
                { name: "Updated Site" }
            );
            expect(eventSpy).toHaveBeenCalledWith({
                identifier: "test-site",
                operation: "updated",
                site: updatedSite,
            });
        });

        it("should emit start monitoring event when callback is called", async () => {
            const updatedSite = { ...mockSite, name: "Updated Site" };
            let startMonitoringCallback: ((id: string, monitorId?: string) => Promise<boolean>) | undefined;
            
            mockUpdateSite.mockImplementation((deps, callbacks) => {
                startMonitoringCallback = callbacks.startMonitoringForSite;
                return Promise.resolve(updatedSite);
            });
            
            const eventSpy = vi.fn();
            mockEventEmitter.on(SITE_EVENTS.START_MONITORING_REQUESTED, eventSpy);

            await siteManager.updateSite("test-site", { name: "Updated Site" });

            // Call the callback to test event emission
            if (startMonitoringCallback) {
                const result = await startMonitoringCallback("test-site", "monitor-1");
                expect(result).toBe(true);
                expect(eventSpy).toHaveBeenCalledWith({
                    identifier: "test-site",
                    monitorId: "monitor-1",
                    operation: "start-monitoring",
                });
            }
        });

        it("should emit start monitoring event without monitorId when callback is called", async () => {
            const updatedSite = { ...mockSite, name: "Updated Site" };
            let startMonitoringCallback: ((id: string, monitorId?: string) => Promise<boolean>) | undefined;
            
            mockUpdateSite.mockImplementation((deps, callbacks) => {
                startMonitoringCallback = callbacks.startMonitoringForSite;
                return Promise.resolve(updatedSite);
            });
            
            const eventSpy = vi.fn();
            mockEventEmitter.on(SITE_EVENTS.START_MONITORING_REQUESTED, eventSpy);

            await siteManager.updateSite("test-site", { name: "Updated Site" });

            // Call the callback without monitorId to test event emission
            if (startMonitoringCallback) {
                const result = await startMonitoringCallback("test-site");
                expect(result).toBe(true);
                expect(eventSpy).toHaveBeenCalledWith({
                    identifier: "test-site",
                    operation: "start-monitoring",
                });
            }
        });

        it("should emit stop monitoring event when callback is called", async () => {
            const updatedSite = { ...mockSite, name: "Updated Site" };
            let stopMonitoringCallback: ((id: string, monitorId?: string) => Promise<boolean>) | undefined;
            
            mockUpdateSite.mockImplementation((deps, callbacks) => {
                stopMonitoringCallback = callbacks.stopMonitoringForSite;
                return Promise.resolve(updatedSite);
            });
            
            const eventSpy = vi.fn();
            mockEventEmitter.on(SITE_EVENTS.STOP_MONITORING_REQUESTED, eventSpy);

            await siteManager.updateSite("test-site", { name: "Updated Site" });

            // Call the callback to test event emission
            if (stopMonitoringCallback) {
                const result = await stopMonitoringCallback("test-site", "monitor-1");
                expect(result).toBe(true);
                expect(eventSpy).toHaveBeenCalledWith({
                    identifier: "test-site",
                    monitorId: "monitor-1",
                    operation: "stop-monitoring",
                });
            }
        });

        it("should emit stop monitoring event without monitorId when callback is called", async () => {
            const updatedSite = { ...mockSite, name: "Updated Site" };
            let stopMonitoringCallback: ((id: string, monitorId?: string) => Promise<boolean>) | undefined;
            
            mockUpdateSite.mockImplementation((deps, callbacks) => {
                stopMonitoringCallback = callbacks.stopMonitoringForSite;
                return Promise.resolve(updatedSite);
            });
            
            const eventSpy = vi.fn();
            mockEventEmitter.on(SITE_EVENTS.STOP_MONITORING_REQUESTED, eventSpy);

            await siteManager.updateSite("test-site", { name: "Updated Site" });

            // Call the callback without monitorId to test event emission
            if (stopMonitoringCallback) {
                const result = await stopMonitoringCallback("test-site");
                expect(result).toBe(true);
                expect(eventSpy).toHaveBeenCalledWith({
                    identifier: "test-site",
                    operation: "stop-monitoring",
                });
            }
        });

        it("should handle database update errors", async () => {
            const error = new Error("Database update error");
            mockUpdateSite.mockRejectedValue(error);

            await expect(siteManager.updateSite("test-site", { name: "Updated Site" })).rejects.toThrow(
                "Database update error"
            );
        });
    });

    describe("updateSitesCache", () => {
        it("should update sites cache and emit event", () => {
            const sites = [mockSite, { ...mockSite, identifier: "another-site", name: "Another Site" }];
            
            const eventSpy = vi.fn();
            mockEventEmitter.on(SITE_EVENTS.CACHE_UPDATED, eventSpy);

            siteManager.updateSitesCache(sites);

            expect(siteManager.getSiteFromCache("test-site")).toEqual(mockSite);
            expect(siteManager.getSiteFromCache("another-site")).toBeDefined();
            expect(eventSpy).toHaveBeenCalledWith({
                identifier: "all",
                operation: "cache-updated",
            });
        });

        it("should clear existing cache when updating", () => {
            // Add initial site
            siteManager.updateSitesCache([mockSite]);
            expect(siteManager.getSiteFromCache("test-site")).toBeDefined();

            // Update with different sites
            const newSite = { ...mockSite, identifier: "new-site", name: "New Site" };
            siteManager.updateSitesCache([newSite]);

            // Original site should no longer be in cache
            expect(siteManager.getSiteFromCache("test-site")).toBeUndefined();
            expect(siteManager.getSiteFromCache("new-site")).toBeDefined();
        });

        it("should handle empty sites array", () => {
            // Add initial site
            siteManager.updateSitesCache([mockSite]);
            expect(siteManager.getSiteFromCache("test-site")).toBeDefined();

            // Update with empty array
            siteManager.updateSitesCache([]);

            // Cache should be empty
            expect(siteManager.getSiteFromCache("test-site")).toBeUndefined();
            expect(siteManager.getSitesFromCache()).toEqual([]);
        });
    });

    describe("getSiteFromCache", () => {
        it("should return site when it exists in cache", () => {
            siteManager.updateSitesCache([mockSite]);

            const result = siteManager.getSiteFromCache("test-site");

            expect(result).toEqual(mockSite);
        });

        it("should return undefined when site does not exist in cache", () => {
            const result = siteManager.getSiteFromCache("non-existent-site");

            expect(result).toBeUndefined();
        });
    });

    describe("validation edge cases", () => {
        it("should handle single validation error", async () => {
            mockConfigurationManager.validateSiteConfiguration.mockReturnValue({
                isValid: false,
                errors: ["Single error"],
            });

            await expect(siteManager.addSite(mockSite)).rejects.toThrow(
                "Site validation failed: Single error"
            );
        });

        it("should handle empty validation errors array", async () => {
            mockConfigurationManager.validateSiteConfiguration.mockReturnValue({
                isValid: false,
                errors: [],
            });

            await expect(siteManager.addSite(mockSite)).rejects.toThrow(
                "Site validation failed: "
            );
        });
    });
});
