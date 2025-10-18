/**
 * Comprehensive test suite for SiteRepositoryService and
 * SiteLoadingOrchestrator
 *
 * @remarks
 * Tests all functionality including database operations, cache management,
 * error handling, event emission, and orchestration workflows.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";

import type { TypedEventBus } from "../../../events/TypedEventBus";
import type { UptimeEvents } from "../../../events/eventTypes";
import type { HistoryRepository } from "../../../services/database/HistoryRepository";
import type { MonitorRepository } from "../../../services/database/MonitorRepository";
import type { SettingsRepository } from "../../../services/database/SettingsRepository";
import type { SiteRepository } from "../../../services/database/SiteRepository";
import type { SiteRow } from "../../../services/database/utils/siteMapper";
import type { StandardizedCache } from "../../../utils/cache/StandardizedCache";
import type { Logger } from "@shared/utils/logger/interfaces";
import type {
    MonitoringConfig,
    SiteLoadingConfig,
} from "../../../utils/database/interfaces";

import { SiteLoadingError } from "../../../utils/database/interfaces";
import {
    SiteLoadingOrchestrator,
    SiteRepositoryService,
} from "../../../utils/database/SiteRepositoryService";

// Mock constants
vi.mock("../../../constants", () => ({
    DEFAULT_SITE_NAME: "Unknown Site",
}));

describe("SiteRepositoryService and SiteLoadingOrchestrator - Comprehensive Coverage", () => {
    let siteRepositoryService: SiteRepositoryService;
    let siteLoadingOrchestrator: SiteLoadingOrchestrator;
    let mockRepositories: {
        site: SiteRepository;
        monitor: MonitorRepository;
        history: HistoryRepository;
        settings: SettingsRepository;
    };
    let mockLogger: Logger;
    let mockEventEmitter: TypedEventBus<UptimeEvents>;
    let mockSiteCache: StandardizedCache<Site>;
    let mockMonitoringConfig: MonitoringConfig;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock repositories
        mockRepositories = {
            site: {
                findAll: vi.fn(),
            } as unknown as SiteRepository,
            monitor: {
                findBySiteIdentifier: vi.fn(),
            } as unknown as MonitorRepository,
            history: {
                findByMonitorId: vi.fn(),
            } as unknown as HistoryRepository,
            settings: {
                get: vi.fn(),
            } as unknown as SettingsRepository,
        };

        // Mock logger
        mockLogger = {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        };

        // Mock event emitter
        mockEventEmitter = {
            emitTyped: vi.fn(),
        } as unknown as TypedEventBus<UptimeEvents>;

        // Mock site cache
        mockSiteCache = {
            clear: vi.fn(),
            replaceAll: vi.fn(),
            set: vi.fn(),
            get: vi.fn(),
            size: 0,
        } as unknown as StandardizedCache<Site>;

        // Mock monitoring config
        mockMonitoringConfig = {
            setHistoryLimit: vi.fn(),
            setupNewMonitors: vi.fn(),
            startMonitoring: vi.fn(),
            stopMonitoring: vi.fn(),
        };

        const config: SiteLoadingConfig = {
            repositories: mockRepositories,
            logger: mockLogger,
            eventEmitter: mockEventEmitter,
        };

        siteRepositoryService = new SiteRepositoryService(config);
        siteLoadingOrchestrator = new SiteLoadingOrchestrator(
            siteRepositoryService
        );
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("SiteRepositoryService - Constructor", () => {
        it("should create instance with all dependencies", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            expect(siteRepositoryService).toBeDefined();
            expect(siteRepositoryService).toBeInstanceOf(SiteRepositoryService);
        });
    });

    describe("SiteRepositoryService - getHistoryLimitSetting", () => {
        it("should return valid history limit from settings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Configuration", "type");

            vi.mocked(mockRepositories.settings.get).mockResolvedValue("100");

            const result = await siteRepositoryService.getHistoryLimitSetting();

            expect(result).toBe(100);
            expect(mockRepositories.settings.get).toHaveBeenCalledWith(
                "historyLimit"
            );
        });

        it("should return undefined when no setting exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(mockRepositories.settings.get).mockResolvedValue(
                undefined
            );

            const result = await siteRepositoryService.getHistoryLimitSetting();

            expect(result).toBeUndefined();
        });

        it("should return undefined for non-numeric setting", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(mockRepositories.settings.get).mockResolvedValue(
                "invalid"
            );

            const result = await siteRepositoryService.getHistoryLimitSetting();

            expect(result).toBeUndefined();
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Invalid history limit setting: invalid"
            );
        });

        it("should return undefined for negative setting", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(mockRepositories.settings.get).mockResolvedValue("-10");

            const result = await siteRepositoryService.getHistoryLimitSetting();

            expect(result).toBeUndefined();
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Invalid history limit setting: -10"
            );
        });

        it("should return undefined for zero setting", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(mockRepositories.settings.get).mockResolvedValue("0");

            const result = await siteRepositoryService.getHistoryLimitSetting();

            expect(result).toBeUndefined();
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Invalid history limit setting: 0"
            );
        });

        it("should handle database error gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Database connection failed");
            vi.mocked(mockRepositories.settings.get).mockRejectedValue(error);

            const result = await siteRepositoryService.getHistoryLimitSetting();

            expect(result).toBeUndefined();
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Could not load history limit from settings:",
                error
            );
        });
    });

    describe("SiteRepositoryService - applyHistoryLimitSetting", () => {
        it("should apply valid history limit to monitoring config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            vi.mocked(mockRepositories.settings.get).mockResolvedValue("50");

            await siteRepositoryService.applyHistoryLimitSetting(
                mockMonitoringConfig
            );

            expect(mockMonitoringConfig.setHistoryLimit).toHaveBeenCalledWith(
                50
            );
            expect(mockLogger.info).toHaveBeenCalledWith(
                "History limit applied: 50"
            );
        });

        it("should not apply when no limit setting exists", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Configuration", "type");

            vi.mocked(mockRepositories.settings.get).mockResolvedValue(
                undefined
            );

            await siteRepositoryService.applyHistoryLimitSetting(
                mockMonitoringConfig
            );

            expect(mockMonitoringConfig.setHistoryLimit).not.toHaveBeenCalled();
            expect(mockLogger.info).not.toHaveBeenCalled();
        });

        it("should not apply invalid limit setting", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Configuration", "type");

            vi.mocked(mockRepositories.settings.get).mockResolvedValue(
                "invalid"
            );

            await siteRepositoryService.applyHistoryLimitSetting(
                mockMonitoringConfig
            );

            expect(mockMonitoringConfig.setHistoryLimit).not.toHaveBeenCalled();
            expect(mockLogger.info).not.toHaveBeenCalled();
        });
    });

    describe("SiteRepositoryService - getSitesFromDatabase", () => {
        it("should get sites with monitors and history", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Retrieval", "type");

            const siteRows: SiteRow[] = [
                { identifier: "site1", name: "Site 1", monitoring: true },
                { identifier: "site2", name: "Site 2", monitoring: false },
            ];

            const monitors1 = [
                {
                    id: "mon1",
                    type: "http" as const,
                    enabled: true,
                    url: "https://site1.com",
                    checkInterval: 60_000,
                    history: [],
                    monitoring: true,
                    responseTime: 100,
                    retryAttempts: 3,
                    status: "pending" as const,
                    timeout: 5000,
                },
                {
                    id: "mon2",
                    type: "ping" as const,
                    enabled: true,
                    host: "site1.com",
                    checkInterval: 60_000,
                    history: [],
                    monitoring: true,
                    responseTime: 50,
                    retryAttempts: 3,
                    status: "pending" as const,
                    timeout: 5000,
                },
            ];

            const monitors2 = [
                {
                    id: "mon3",
                    type: "http" as const,
                    enabled: false,
                    url: "https://site2.com",
                    checkInterval: 60_000,
                    history: [],
                    monitoring: false,
                    responseTime: 0,
                    retryAttempts: 3,
                    status: "pending" as const,
                    timeout: 5000,
                },
            ];

            const history1 = [
                {
                    timestamp: Date.now(),
                    status: "up" as const,
                    responseTime: 100,
                },
            ];
            const history2 = [
                {
                    timestamp: Date.now(),
                    status: "down" as const,
                    responseTime: 0,
                },
            ];

            vi.mocked(mockRepositories.site.findAll).mockResolvedValue(
                siteRows
            );
            vi.mocked(mockRepositories.monitor.findBySiteIdentifier)
                .mockResolvedValueOnce(monitors1)
                .mockResolvedValueOnce(monitors2);
            vi.mocked(mockRepositories.history.findByMonitorId)
                .mockResolvedValueOnce(history1)
                .mockResolvedValueOnce(history2)
                .mockResolvedValueOnce([]);

            const sites = await siteRepositoryService.getSitesFromDatabase();

            expect(sites).toHaveLength(2);
            expect(sites[0]).toEqual({
                identifier: "site1",
                name: "Site 1",
                monitoring: true,
                monitors: [
                    { ...monitors1[0], history: history1 },
                    { ...monitors1[1], history: history2 },
                ],
            });
            expect(sites[1]).toEqual({
                identifier: "site2",
                name: "Site 2",
                monitoring: false,
                monitors: [{ ...monitors2[0], history: [] }],
            });
        });

        it("should handle sites with no monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const siteRows: SiteRow[] = [
                {
                    identifier: "empty-site",
                    name: "Empty Site",
                    monitoring: true,
                },
            ];

            vi.mocked(mockRepositories.site.findAll).mockResolvedValue(
                siteRows
            );
            vi.mocked(
                mockRepositories.monitor.findBySiteIdentifier
            ).mockResolvedValue([]);

            const sites = await siteRepositoryService.getSitesFromDatabase();

            expect(sites).toHaveLength(1);
            expect(sites[0]).toEqual({
                identifier: "empty-site",
                name: "Empty Site",
                monitoring: true,
                monitors: [],
            });
        });

        it("should use default name when name is null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const siteRows: SiteRow[] = [
                { identifier: "no-name", monitoring: true },
            ];

            vi.mocked(mockRepositories.site.findAll).mockResolvedValue(
                siteRows
            );
            vi.mocked(
                mockRepositories.monitor.findBySiteIdentifier
            ).mockResolvedValue([]);

            const sites = await siteRepositoryService.getSitesFromDatabase();

            expect(sites[0]?.name).toBe("Unknown Site");
        });

        it("should use default monitoring status when monitoring is null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const siteRows: SiteRow[] = [
                {
                    identifier: "no-monitoring",
                    name: "Site",
                },
            ];

            vi.mocked(mockRepositories.site.findAll).mockResolvedValue(
                siteRows
            );
            vi.mocked(
                mockRepositories.monitor.findBySiteIdentifier
            ).mockResolvedValue([]);

            const sites = await siteRepositoryService.getSitesFromDatabase();

            expect(sites[0]?.monitoring).toBeTruthy();
        });

        it("should handle monitor without ID", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const siteRows: SiteRow[] = [
                { identifier: "site1", name: "Site 1", monitoring: true },
            ];

            const monitors = [
                {
                    type: "http",
                    enabled: true,
                    url: "https://site1.com",
                    checkInterval: 60_000,
                    history: [],
                    monitoring: true,
                    responseTime: 0,
                    retryAttempts: 3,
                    status: "pending" as const,
                    timeout: 5000,
                } as any, // Cast to bypass id requirement for testing
            ];

            vi.mocked(mockRepositories.site.findAll).mockResolvedValue(
                siteRows
            );
            vi.mocked(
                mockRepositories.monitor.findBySiteIdentifier
            ).mockResolvedValue(monitors);

            const sites = await siteRepositoryService.getSitesFromDatabase();

            expect(sites[0]?.monitors[0]).toEqual(monitors[0]);
            expect(
                mockRepositories.history.findByMonitorId
            ).not.toHaveBeenCalled();
        });

        it("should throw SiteLoadingError on database error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Database error");
            vi.mocked(mockRepositories.site.findAll).mockRejectedValue(error);

            await expect(
                siteRepositoryService.getSitesFromDatabase()
            ).rejects.toThrow(SiteLoadingError);
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to fetch sites from database: Database error",
                error
            );
        });

        it("should handle non-Error exceptions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(mockRepositories.site.findAll).mockRejectedValue(
                "String error"
            );

            await expect(
                siteRepositoryService.getSitesFromDatabase()
            ).rejects.toThrow(SiteLoadingError);
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to fetch sites from database: Unknown error",
                "String error"
            );
        });
    });

    describe("SiteRepositoryService - loadSitesIntoCache", () => {
        it("should load sites into cache successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Loading", "type");

            const sites: Site[] = [
                {
                    identifier: "site1",
                    name: "Site 1",
                    monitoring: true,
                    monitors: [],
                },
                {
                    identifier: "site2",
                    name: "Site 2",
                    monitoring: false,
                    monitors: [],
                },
            ];

            // Mock getSitesFromDatabase
            vi.spyOn(
                siteRepositoryService,
                "getSitesFromDatabase"
            ).mockResolvedValue(sites);
            Object.defineProperty(mockSiteCache, "size", { value: 2 });

            await siteRepositoryService.loadSitesIntoCache(mockSiteCache);

            expect(mockSiteCache.replaceAll).toHaveBeenCalledWith([
                { key: "site1", data: sites[0] },
                { key: "site2", data: sites[1] },
            ]);
            expect(mockSiteCache.clear).not.toHaveBeenCalled();
            expect(mockSiteCache.set).not.toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Loaded 2 sites into cache"
            );
        });

        it("should handle empty sites array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            vi.spyOn(
                siteRepositoryService,
                "getSitesFromDatabase"
            ).mockResolvedValue([]);
            Object.defineProperty(mockSiteCache, "size", { value: 0 });

            await siteRepositoryService.loadSitesIntoCache(mockSiteCache);

            expect(mockSiteCache.replaceAll).toHaveBeenCalledWith([]);
            expect(mockSiteCache.clear).not.toHaveBeenCalled();
            expect(mockSiteCache.set).not.toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Loaded 0 sites into cache"
            );
        });

        it("should handle error and emit database error event", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Cache error");
            vi.spyOn(
                siteRepositoryService,
                "getSitesFromDatabase"
            ).mockRejectedValue(error);

            await expect(
                siteRepositoryService.loadSitesIntoCache(mockSiteCache)
            ).rejects.toThrow(error);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to load sites into cache: Cache error",
                error
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                {
                    details: "Failed to load sites into cache: Cache error",
                    error,
                    operation: "load-sites-into-cache",
                    timestamp: expect.any(Number),
                }
            );
        });

        it("should handle non-Error exceptions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const errorString = "String error";
            vi.spyOn(
                siteRepositoryService,
                "getSitesFromDatabase"
            ).mockRejectedValue(errorString);

            await expect(
                siteRepositoryService.loadSitesIntoCache(mockSiteCache)
            ).rejects.toThrow(errorString);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to load sites into cache: Unknown error",
                errorString
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith(
                "database:error",
                {
                    details: "Failed to load sites into cache: Unknown error",
                    error: new Error("String error"),
                    operation: "load-sites-into-cache",
                    timestamp: expect.any(Number),
                }
            );
        });
    });

    describe("SiteLoadingOrchestrator - Constructor", () => {
        it("should create instance with site repository service", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            expect(siteLoadingOrchestrator).toBeDefined();
            expect(siteLoadingOrchestrator).toBeInstanceOf(
                SiteLoadingOrchestrator
            );
        });
    });

    describe("SiteLoadingOrchestrator - loadSitesFromDatabase", () => {
        it("should successfully load sites and apply settings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Loading", "type");

            Object.defineProperty(mockSiteCache, "size", { value: 3 });
            vi.spyOn(
                siteRepositoryService,
                "loadSitesIntoCache"
            ).mockResolvedValue();
            vi.spyOn(
                siteRepositoryService,
                "applyHistoryLimitSetting"
            ).mockResolvedValue();

            const result = await siteLoadingOrchestrator.loadSitesFromDatabase(
                mockSiteCache,
                mockMonitoringConfig
            );

            expect(result).toEqual({
                message: "Successfully loaded 3 sites",
                sitesLoaded: 3,
                success: true,
            });
            expect(
                siteRepositoryService.loadSitesIntoCache
            ).toHaveBeenCalledWith(mockSiteCache);
            expect(
                siteRepositoryService.applyHistoryLimitSetting
            ).toHaveBeenCalledWith(mockMonitoringConfig);
        });

        it("should handle zero sites loaded", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Loading", "type");

            Object.defineProperty(mockSiteCache, "size", { value: 0 });
            vi.spyOn(
                siteRepositoryService,
                "loadSitesIntoCache"
            ).mockResolvedValue();
            vi.spyOn(
                siteRepositoryService,
                "applyHistoryLimitSetting"
            ).mockResolvedValue();

            const result = await siteLoadingOrchestrator.loadSitesFromDatabase(
                mockSiteCache,
                mockMonitoringConfig
            );

            expect(result).toEqual({
                message: "Successfully loaded 0 sites",
                sitesLoaded: 0,
                success: true,
            });
        });

        it("should handle error during site loading", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Loading failed");
            vi.spyOn(
                siteRepositoryService,
                "loadSitesIntoCache"
            ).mockRejectedValue(error);

            const result = await siteLoadingOrchestrator.loadSitesFromDatabase(
                mockSiteCache,
                mockMonitoringConfig
            );

            expect(result).toEqual({
                message: "Failed to load sites: Loading failed",
                sitesLoaded: 0,
                success: false,
            });
        });

        it("should handle error during settings application", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Settings failed");
            vi.spyOn(
                siteRepositoryService,
                "loadSitesIntoCache"
            ).mockResolvedValue();
            vi.spyOn(
                siteRepositoryService,
                "applyHistoryLimitSetting"
            ).mockRejectedValue(error);

            const result = await siteLoadingOrchestrator.loadSitesFromDatabase(
                mockSiteCache,
                mockMonitoringConfig
            );

            expect(result).toEqual({
                message: "Failed to load sites: Settings failed",
                sitesLoaded: 0,
                success: false,
            });
        });

        it("should handle non-Error exceptions", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            vi.spyOn(
                siteRepositoryService,
                "loadSitesIntoCache"
            ).mockRejectedValue("String error");

            const result = await siteLoadingOrchestrator.loadSitesFromDatabase(
                mockSiteCache,
                mockMonitoringConfig
            );

            expect(result).toEqual({
                message: "Failed to load sites: Unknown error",
                sitesLoaded: 0,
                success: false,
            });
        });
    });

    describe(SiteLoadingError, () => {
        it("should create error with message", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const error = new SiteLoadingError("Test error");

            expect(error.name).toBe("SiteLoadingError");
            expect(error.message).toBe("Failed to load sites: Test error");
        });

        it("should preserve cause error stack trace", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const cause = new Error("Original error");
            const error = new SiteLoadingError("Test error", cause);

            expect(error.stack).toContain("SiteLoadingError");
            expect(error.stack).toContain("Caused by:");
            expect(error.stack).toContain("Original error");
        });

        it("should work without cause error", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new SiteLoadingError("Test error");

            expect(error.name).toBe("SiteLoadingError");
            expect(error.message).toBe("Failed to load sites: Test error");
            expect(error.stack).not.toContain("Caused by:");
        });
    });

    describe("Integration Tests", () => {
        it("should handle complete workflow with complex data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteRepositoryService", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Setup complex site data
            const siteRows: SiteRow[] = [
                {
                    identifier: "complex-site",
                    name: "Complex Site",
                    monitoring: true,
                },
            ];

            const monitors = [
                {
                    id: "mon1",
                    type: "http",
                    enabled: true,
                    url: "https://example.com",
                    checkInterval: 60_000,
                    history: [],
                    monitoring: true,
                    responseTime: 100,
                    retryAttempts: 3,
                    status: "pending" as const,
                    timeout: 5000,
                },
                {
                    id: "mon2",
                    type: "ping",
                    enabled: false,
                    host: "example.com",
                    checkInterval: 60_000,
                    history: [],
                    monitoring: false,
                    responseTime: 0,
                    retryAttempts: 3,
                    status: "pending" as const,
                    timeout: 5000,
                },
                {
                    type: "dns",
                    enabled: true,
                    expectedValue: "example.com",
                    checkInterval: 60_000,
                    history: [],
                    monitoring: true,
                    responseTime: 50,
                    retryAttempts: 3,
                    status: "pending" as const,
                    timeout: 5000,
                } as any, // Cast to bypass id requirement for testing
            ];

            const history1 = [
                {
                    timestamp: Date.now() - 1000,
                    status: "up" as const,
                    responseTime: 100,
                },
                {
                    timestamp: Date.now(),
                    status: "down" as const,
                    responseTime: 0,
                },
            ];
            const history2 = [
                {
                    timestamp: Date.now(),
                    status: "up" as const,
                    responseTime: 80,
                },
            ];

            // Mock repository responses
            vi.mocked(mockRepositories.site.findAll).mockResolvedValue(
                siteRows
            );
            vi.mocked(
                mockRepositories.monitor.findBySiteIdentifier
            ).mockResolvedValue(monitors);
            vi.mocked(mockRepositories.history.findByMonitorId)
                .mockResolvedValueOnce(history1)
                .mockResolvedValueOnce(history2);
            vi.mocked(mockRepositories.settings.get).mockResolvedValue("25");

            Object.defineProperty(mockSiteCache, "size", { value: 1 });

            // Execute orchestrator workflow
            const result = await siteLoadingOrchestrator.loadSitesFromDatabase(
                mockSiteCache,
                mockMonitoringConfig
            );

            // Verify complete workflow
            expect(result.success).toBeTruthy();
            expect(result.sitesLoaded).toBe(1);
            expect(mockSiteCache.replaceAll).toHaveBeenCalledWith([
                {
                    key: "complex-site",
                    data: {
                        identifier: "complex-site",
                        name: "Complex Site",
                        monitoring: true,
                        monitors: [
                            { ...monitors[0], history: history1 },
                            { ...monitors[1], history: history2 },
                            monitors[2],
                        ],
                    },
                },
            ]);
            expect(mockMonitoringConfig.setHistoryLimit).toHaveBeenCalledWith(
                25
            );
        });
    });
});
