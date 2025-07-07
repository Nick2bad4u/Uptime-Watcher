/**
 * Tests for serviceFactory utility functions.
 * Validates service factory functions and dependency injection.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";

// Import the actual functions
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
    DatabaseService: {
        getInstance: vi.fn(() => ({
            executeTransaction: vi.fn(async (callback) => {
                return await callback();
            }),
        })),
    },
    SiteRepository: vi.fn(() => ({
        findAll: vi.fn(),
        findByIdentifier: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
    })),
    MonitorRepository: vi.fn(() => ({
        findBySiteIdentifier: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteBySiteIdentifier: vi.fn(),
    })),
    HistoryRepository: vi.fn(() => ({
        findByMonitorId: vi.fn(),
        addEntry: vi.fn(),
        deleteByMonitorId: vi.fn(),
    })),
    SettingsRepository: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    })),
}));

vi.mock("../../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
    monitorLogger: {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe("serviceFactory", () => {
    let mockConfig: any;
    let mockSitesMap: Map<string, Site>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSitesMap = new Map();

        mockConfig = {
            repositories: {
                site: {
                    findAll: vi.fn().mockResolvedValue([]),
                },
                monitor: {
                    findBySiteIdentifier: vi.fn().mockResolvedValue([]),
                },
                history: {
                    findByMonitorId: vi.fn().mockResolvedValue([]),
                },
                settings: {
                    get: vi.fn().mockResolvedValue(null),
                },
            },
            databaseService: {
                executeTransaction: vi.fn(async (callback) => {
                    return await callback();
                }),
            },
            eventEmitter: new EventEmitter(),
            sites: mockSitesMap,
            logger: {
                info: vi.fn(),
                debug: vi.fn(),
                warn: vi.fn(),
                error: vi.fn(),
            },
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("createSiteRepositoryService", () => {
        it("should create a SiteRepositoryService with the provided dependencies", () => {
            const service = createSiteRepositoryService(mockConfig);

            expect(service).toBeInstanceOf(SiteRepositoryService);
        });
    });

    describe("createSiteWriterService", () => {
        it("should create a SiteWriterService with the provided dependencies", () => {
            const service = createSiteWriterService();

            expect(service).toBeInstanceOf(SiteWriterService);
        });
    });

    describe("createSiteLoadingOrchestrator", () => {
        it("should create a SiteLoadingOrchestrator with the provided dependencies", () => {
            const orchestrator = createSiteLoadingOrchestrator(mockConfig);

            expect(orchestrator).toBeInstanceOf(SiteLoadingOrchestrator);
        });
    });

    describe("createSiteWritingOrchestrator", () => {
        it("should create a SiteWritingOrchestrator with the provided dependencies", () => {
            const orchestrator = createSiteWritingOrchestrator();

            expect(orchestrator).toBeInstanceOf(SiteWritingOrchestrator);
        });
    });

    describe("createSiteCache", () => {
        it("should create a SiteCache instance", () => {
            const cache = createSiteCache();

            expect(cache).toBeInstanceOf(SiteCache);
        });
    });

    describe("getSitesFromDatabase", () => {
        it("should get sites from database with proper dependency injection", async () => {
            const mockSites = [
                {
                    identifier: "site1",
                    name: "Test Site 1",
                    monitors: [],
                },
            ];

            mockConfig.repositories.site.findAll.mockResolvedValue(mockSites);

            const result = await getSitesFromDatabase(mockConfig);

            expect(result).toEqual(mockSites);
            expect(mockConfig.repositories.site.findAll).toHaveBeenCalled();
        });

        it("should handle errors and wrap them in SiteLoadingError", async () => {
            const error = new Error("Database error");
            mockConfig.repositories.site.findAll.mockRejectedValue(error);

            await expect(getSitesFromDatabase(mockConfig)).rejects.toThrow("Database error");
        });
    });

    describe("loadSitesFromDatabase", () => {
        it("should successfully load sites from database", async () => {
            const mockSites = [
                {
                    identifier: "site1",
                    name: "Test Site 1",
                    monitors: [],
                },
            ];

            mockConfig.repositories.site.findAll.mockResolvedValue(mockSites);

            const result = await loadSitesFromDatabase(mockConfig);

            expect(result.success).toBe(true);
            expect(result.sitesLoaded).toBe(1);
            expect(result.message).toContain("Successfully loaded 1 sites");
            expect(mockSitesMap.size).toBe(1);
        });

        it("should handle empty sites result", async () => {
            mockConfig.repositories.site.findAll.mockResolvedValue([]);

            const result = await loadSitesFromDatabase(mockConfig);

            expect(result.success).toBe(true);
            expect(result.sitesLoaded).toBe(0);
            expect(result.message).toContain("Successfully loaded 0 sites");
            expect(mockSitesMap.size).toBe(0);
        });

        it("should handle database errors", async () => {
            const error = new Error("Database error");
            mockConfig.repositories.site.findAll.mockRejectedValue(error);

            // Mock the event emitter error listener to prevent unhandled errors
            const errorListener = vi.fn();
            mockConfig.eventEmitter.on("error", errorListener);

            const result = await loadSitesFromDatabase(mockConfig);

            expect(result.success).toBe(false);
            expect(result.sitesLoaded).toBe(0);
            expect(result.message).toContain("Failed to load sites");
            expect(mockSitesMap.size).toBe(0);
            expect(errorListener).toHaveBeenCalled();
        });
    });
});
