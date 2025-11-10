/**
 * @file Comprehensive coverage tests for SiteWriterService.ts This file
 *   addresses 25.98% coverage by testing all public and private methods
 */

import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    type MockedFunction,
} from "vitest";
import type {
    MonitoringStartSummary,
    MonitoringStopSummary,
    Site,
} from "@shared/types";
import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
import type { MonitorRow } from "@shared/types/database";
import type { Database } from "node-sqlite3-wasm";

import { SiteWriterService } from "../../../utils/database/SiteWriterService";
import { SiteNotFoundError } from "../../../utils/database/interfaces";
import type { StandardizedCache } from "../../../utils/cache/StandardizedCache";
import type { DatabaseService } from "../../../services/database/DatabaseService";
import type {
    MonitorRepository,
    MonitorRepositoryTransactionAdapter,
} from "../../../services/database/MonitorRepository";
import type {
    SiteRepository,
    SiteRepositoryTransactionAdapter,
} from "../../../services/database/SiteRepository";
import type { Logger } from "@shared/utils/logger/interfaces";
import type { MonitoringConfig } from "../../../utils/database/interfaces";
import { DEFAULT_REQUEST_TIMEOUT } from "../../../constants";

// Helper function to create complete Monitor objects
const createCompleteMonitor = (
    overrides: Partial<Site["monitors"][0]> = {}
): Site["monitors"][0] => ({
    id: "monitor-1",
    type: "http",
    url: "https://example.com",
    checkInterval: 30_000,
    timeout: 5000,
    retryAttempts: 3,
    monitoring: false,
    status: "pending",
    responseTime: 0,
    history: [],
    ...overrides,
});

describe("SiteWriterService Coverage Tests", () => {
    let siteWriterService: SiteWriterService;
    let mockDatabaseService: DatabaseService;
    let mockMonitorRepository: MonitorRepository;
    let mockSiteRepository: SiteRepository;
    let mockLogger: Logger;
    let mockSitesCache: StandardizedCache<Site>;
    let mockDb: Database;
    let monitorAdapter: MonitorRepositoryTransactionAdapter;
    let siteAdapter: SiteRepositoryTransactionAdapter;

    const mockSite: Site = {
        identifier: "test-site",
        name: "Test Site",
        monitoring: false,
        monitors: [
            {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: false,
                status: "pending",
                responseTime: 0,
                history: [],
            },
        ],
    };

    beforeEach(() => {
        // Mock database instance
        mockDb = {
            all: vi.fn(),
            run: vi.fn(),
            get: vi.fn(),
            prepare: vi.fn(),
        } as any;

        // Mock DatabaseService
        mockDatabaseService = {
            executeTransaction: vi.fn(),
            getDatabase: vi.fn().mockResolvedValue(mockDb),
        } as any;

        // Mock repositories with transaction adapters
        monitorAdapter = {
            clearActiveOperations: vi.fn(),
            create: vi.fn().mockReturnValue("new-monitor-id"),
            deleteAll: vi.fn(),
            deleteById: vi.fn(),
            deleteBySiteIdentifier: vi.fn(),
            findBySiteIdentifier: vi.fn().mockReturnValue([
                {
                    id: "monitor-1",
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 30_000,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: false,
                    status: "pending",
                    responseTime: 0,
                    lastChecked: undefined,
                    history: [],
                },
            ]),
            update: vi.fn(),
        } satisfies MonitorRepositoryTransactionAdapter as MonitorRepositoryTransactionAdapter;

        mockMonitorRepository = {
            createTransactionAdapter: vi
                .fn()
                .mockImplementation(() => monitorAdapter),
        } as unknown as MonitorRepository;

        siteAdapter = {
            bulkInsert: vi.fn(),
            delete: vi.fn().mockReturnValue(true),
            deleteAll: vi.fn(),
            upsert: vi.fn(),
        } satisfies SiteRepositoryTransactionAdapter;

        mockSiteRepository = {
            createTransactionAdapter: vi
                .fn()
                .mockImplementation(() => siteAdapter),
        } as unknown as SiteRepository;

        // Mock logger
        mockLogger = {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        };

        // Mock cache
        mockSitesCache = {
            get: vi.fn(),
            set: vi.fn(),
            delete: vi.fn().mockReturnValue(true),
            has: vi.fn(),
            getAll: vi.fn(() => [mockSite]),
            clear: vi.fn(),
        } as any;

        // Create service instance
        siteWriterService = new SiteWriterService({
            databaseService: mockDatabaseService,
            repositories: {
                monitor: mockMonitorRepository,
                site: mockSiteRepository,
            },
            logger: mockLogger,
        });
    });

    describe("Constructor", () => {
        it("should initialize with provided configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Initialization", "type");

            expect(siteWriterService).toBeInstanceOf(SiteWriterService);
        });
    });

    describe("createSite", () => {
        beforeEach(() => {
            (
                mockDatabaseService.executeTransaction as MockedFunction<any>
            ).mockImplementation(async (callback: any) => callback(mockDb));
        });

        it("should create a new site successfully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const siteData = { ...mockSite };
            siteData.monitors[0]!.id = ""; // New monitor without ID

            const result = await siteWriterService.createSite(siteData);

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
            expect(
                mockSiteRepository.createTransactionAdapter
            ).toHaveBeenCalledWith(mockDb);
            expect(
                mockMonitorRepository.createTransactionAdapter
            ).toHaveBeenCalledWith(mockDb);
            const upsertMock = siteAdapter.upsert as MockedFunction<
                SiteRepositoryTransactionAdapter["upsert"]
            >;
            const upsertCall = upsertMock.mock.calls[0]?.[0] as Site;

            expect(upsertCall.identifier).toBe(siteData.identifier);
            expect(upsertCall.monitors).toHaveLength(siteData.monitors.length);
            expect(monitorAdapter.deleteBySiteIdentifier).toHaveBeenCalledWith(
                siteData.identifier
            );
            expect(monitorAdapter.create).toHaveBeenCalledWith(
                siteData.identifier,
                expect.objectContaining({
                    checkInterval: siteData.monitors[0]!.checkInterval,
                    retryAttempts: siteData.monitors[0]!.retryAttempts,
                    timeout: siteData.monitors[0]!.timeout,
                    type: siteData.monitors[0]!.type,
                })
            );
            expect(result.monitors[0]!.id).toBe("new-monitor-id");
            expect(mockLogger.info).toHaveBeenCalledWith(
                `Creating new site in database: ${siteData.identifier}`
            );
        });

        it("should handle site creation with multiple monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const siteData = {
                ...mockSite,
                monitors: [
                    createCompleteMonitor({ id: "" }),
                    createCompleteMonitor({
                        id: "",
                        type: "port",
                        host: "example.com",
                        port: 443,
                        checkInterval: 60_000,
                        timeout: 10_000,
                        retryAttempts: 2,
                    }),
                ],
            };

            const result = await siteWriterService.createSite(siteData);

            expect(monitorAdapter.create).toHaveBeenCalledTimes(2);
            expect(result.monitors).toHaveLength(2);
            expect(result.monitors[0]!.id).toBe("new-monitor-id");
            expect(result.monitors[1]!.id).toBe("new-monitor-id");
        });

        it("should clamp monitor checkInterval below minimum during creation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Normalization", "type");

            const belowMinimum = Math.max(
                1,
                MIN_MONITOR_CHECK_INTERVAL_MS - 5000
            );
            const siteData = {
                ...mockSite,
                monitors: [
                    createCompleteMonitor({
                        id: "",
                        checkInterval: belowMinimum,
                    }),
                ],
            };

            await siteWriterService.createSite(siteData);

            expect(monitorAdapter.create).toHaveBeenCalledWith(
                siteData.identifier,
                expect.objectContaining({
                    checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS,
                })
            );
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "[SiteWriterService] Monitor checkInterval below minimum; clamping to shared floor",
                expect.objectContaining({
                    minimum: MIN_MONITOR_CHECK_INTERVAL_MS,
                    monitorId: "<new-monitor>",
                    originalInterval: belowMinimum,
                    siteIdentifier: siteData.identifier,
                })
            );
        });

        it("should handle site creation with empty monitors array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const siteData = { ...mockSite, monitors: [] };

            const result = await siteWriterService.createSite(siteData);

            expect(monitorAdapter.create).not.toHaveBeenCalled();
            expect(result.monitors).toHaveLength(0);
        });

        it("should handle database transaction errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Transaction failed");
            (
                mockDatabaseService.executeTransaction as MockedFunction<any>
            ).mockRejectedValue(error);

            await expect(
                siteWriterService.createSite(mockSite)
            ).rejects.toThrow("Transaction failed");
        });
    });

    describe("deleteSite", () => {
        beforeEach(() => {
            (
                mockDatabaseService.executeTransaction as MockedFunction<any>
            ).mockImplementation(async (callback: any) => callback(mockDb));
        });

        it("should delete site successfully when found in cache", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Deletion", "type");

            // Mock successful database deletion and cache presence
            (siteAdapter.delete as MockedFunction<any>).mockReturnValue(true);
            (mockSitesCache.has as MockedFunction<any>).mockReturnValue(true);
            (mockSitesCache.delete as MockedFunction<any>).mockReturnValue(
                true
            );

            const result = await siteWriterService.deleteSite(
                mockSitesCache,
                "test-site"
            );

            expect(monitorAdapter.findBySiteIdentifier).toHaveBeenCalledWith(
                "test-site"
            );
            expect(mockSitesCache.delete).toHaveBeenCalledWith("test-site");
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
            expect(
                mockMonitorRepository.createTransactionAdapter
            ).toHaveBeenCalledWith(mockDb);
            expect(
                mockSiteRepository.createTransactionAdapter
            ).toHaveBeenCalledWith(mockDb);
            expect(monitorAdapter.deleteBySiteIdentifier).toHaveBeenCalledWith(
                "test-site"
            );
            expect(siteAdapter.delete).toHaveBeenCalledWith("test-site");
            expect(result).toBeTruthy();
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Site removed successfully from database: test-site"
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "Removed 1 monitors for site: test-site"
            );
        });

        it("should handle site not found in cache but still cleanup database", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            // Mock database deletion failure (site not found in database)
            (siteAdapter.delete as MockedFunction<any>).mockReturnValue(false);
            (mockSitesCache.delete as MockedFunction<any>).mockReturnValue(
                false
            );

            const result = await siteWriterService.deleteSite(
                mockSitesCache,
                "nonexistent-site"
            );

            expect(monitorAdapter.findBySiteIdentifier).toHaveBeenCalledWith(
                "nonexistent-site"
            );
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
            expect(
                mockMonitorRepository.createTransactionAdapter
            ).toHaveBeenCalledWith(mockDb);
            expect(
                mockSiteRepository.createTransactionAdapter
            ).toHaveBeenCalledWith(mockDb);
            expect(monitorAdapter.deleteBySiteIdentifier).toHaveBeenCalledWith(
                "nonexistent-site"
            );
            expect(siteAdapter.delete).toHaveBeenCalledWith("nonexistent-site");
            expect(result).toBeFalsy();
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Site not found in database for removal: nonexistent-site"
            );
        });

        it("should handle database errors during deletion", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Database deletion failed");
            (
                mockDatabaseService.executeTransaction as MockedFunction<any>
            ).mockRejectedValue(error);

            await expect(
                siteWriterService.deleteSite(mockSitesCache, "test-site")
            ).rejects.toThrow("Database deletion failed");
        });
    });

    describe("deleteAllSites", () => {
        beforeEach(() => {
            (
                mockDatabaseService.executeTransaction as MockedFunction<any>
            ).mockImplementation(async (callback: any) => callback(mockDb));
        });

        it("should delete all sites and return snapshot", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Deletion", "type");

            (mockSitesCache.getAll as MockedFunction<any>).mockReturnValue([
                mockSite,
            ]);

            const result =
                await siteWriterService.deleteAllSites(mockSitesCache);

            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
            expect(
                mockMonitorRepository.createTransactionAdapter
            ).toHaveBeenCalledWith(mockDb);
            expect(
                mockSiteRepository.createTransactionAdapter
            ).toHaveBeenCalledWith(mockDb);
            expect(monitorAdapter.deleteAll).toHaveBeenCalledWith();
            expect(siteAdapter.deleteAll).toHaveBeenCalledWith();
            expect(mockSitesCache.clear).toHaveBeenCalled();
            expect(result.deletedCount).toBe(1);
            expect(result.deletedSites).toEqual([
                expect.objectContaining({ identifier: "test-site" }),
            ]);
        });

        it("should short-circuit when no sites exist", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            (mockSitesCache.getAll as MockedFunction<any>).mockReturnValue([]);

            const result =
                await siteWriterService.deleteAllSites(mockSitesCache);

            expect(result).toEqual({ deletedCount: 0, deletedSites: [] });
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[SiteWriterService] No sites available for bulk deletion"
            );
            expect(
                mockDatabaseService.executeTransaction
            ).not.toHaveBeenCalled();
            expect(mockSitesCache.clear).not.toHaveBeenCalled();
        });
    });

    describe("updateSite", () => {
        beforeEach(() => {
            (mockSitesCache.get as MockedFunction<any>).mockReturnValue(
                mockSite
            );
            (
                mockDatabaseService.executeTransaction as MockedFunction<any>
            ).mockImplementation(async (callback: any) => callback(mockDb));
            // Set up default DB mock that will be overridden by specific tests
            (mockDb.all as MockedFunction<any>).mockReturnValue([
                {
                    id: 1,
                    site_identifier: "test-site",
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 30_000,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: 0,
                    status: "pending",
                    responseTime: 0,
                } as MonitorRow,
            ]);

            // Set up default monitor repository response
            (
                monitorAdapter.findBySiteIdentifier as MockedFunction<any>
            ).mockReturnValue([
                {
                    id: "monitor-1",
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 30_000,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: false,
                    status: "pending",
                    responseTime: 0,
                    lastChecked: undefined,
                    history: [],
                },
            ]);
        });

        it("should update site successfully", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            const updates = { name: "Updated Site Name", monitoring: true };

            const result = await siteWriterService.updateSite(
                mockSitesCache,
                "test-site",
                updates
            );

            expect(mockSitesCache.get).toHaveBeenCalledWith("test-site");
            expect(mockSitesCache.set).toHaveBeenCalled();
            expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
            expect(siteAdapter.upsert).toHaveBeenCalled();
            expect(result.name).toBe("Updated Site Name");
            expect(result.monitoring).toBeTruthy();
        });

        it("should normalize invalid monitor configuration during update", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Normalization", "type");

            const updates: Partial<Site> = {
                monitors: [
                    {
                        ...createCompleteMonitor({ id: "monitor-1" }),
                        checkInterval: 10,
                        retryAttempts: -5,
                        timeout: 0,
                    },
                ],
            };

            await siteWriterService.updateSite(
                mockSitesCache,
                "test-site",
                updates
            );

            expect(monitorAdapter.update).toHaveBeenCalledWith(
                "monitor-1",
                expect.objectContaining({
                    checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS,
                    retryAttempts: mockSite.monitors[0]!.retryAttempts,
                    timeout: DEFAULT_REQUEST_TIMEOUT,
                })
            );

            expect(mockLogger.warn).toHaveBeenCalledWith(
                "[SiteWriterService] Monitor checkInterval below minimum; clamping to shared floor",
                expect.objectContaining({
                    monitorId: "monitor-1",
                    originalInterval: 10,
                    siteIdentifier: "test-site",
                })
            );

            expect(mockLogger.warn).toHaveBeenCalledWith(
                "[SiteWriterService] Monitor retryAttempts invalid; defaulting to non-negative floor",
                expect.objectContaining({
                    monitorId: "monitor-1",
                    originalRetryAttempts: -5,
                    siteIdentifier: "test-site",
                })
            );

            expect(mockLogger.warn).toHaveBeenCalledWith(
                "[SiteWriterService] Monitor timeout invalid; defaulting to fallback",
                expect.objectContaining({
                    monitorId: "monitor-1",
                    originalTimeout: 0,
                    siteIdentifier: "test-site",
                })
            );
        });

        it("should create new monitors when updating", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const newMonitor = createCompleteMonitor({
                id: "",
                type: "port",
                host: "newhost.com",
                port: 80,
                checkInterval: 45_000,
                timeout: 8000,
                retryAttempts: 2,
            });
            const updates = { monitors: [...mockSite.monitors, newMonitor] };

            await siteWriterService.updateSite(
                mockSitesCache,
                "test-site",
                updates
            );

            expect(
                mockMonitorRepository.createTransactionAdapter
            ).toHaveBeenCalledWith(mockDb);
            expect(monitorAdapter.create).toHaveBeenCalledWith(
                "test-site",
                expect.objectContaining({
                    checkInterval: newMonitor.checkInterval,
                    host: newMonitor.host,
                    port: newMonitor.port,
                    retryAttempts: newMonitor.retryAttempts,
                    timeout: newMonitor.timeout,
                    type: newMonitor.type,
                })
            );
        });

        it("should remove obsolete monitors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Deletion", "type");

            const updates = { monitors: [] }; // Remove all monitors

            await siteWriterService.updateSite(
                mockSitesCache,
                "test-site",
                updates
            );

            expect(
                mockMonitorRepository.createTransactionAdapter
            ).toHaveBeenCalledWith(mockDb);
            expect(monitorAdapter.deleteById).toHaveBeenCalledWith("monitor-1");
        });

        it("should throw SiteNotFoundError when site not in cache", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            (mockSitesCache.get as MockedFunction<any>).mockReturnValue(
                undefined
            );

            await expect(
                siteWriterService.updateSite(mockSitesCache, "nonexistent", {})
            ).rejects.toThrow(SiteNotFoundError);
        });

        it("should throw SiteNotFoundError when identifier is empty", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            await expect(
                siteWriterService.updateSite(mockSitesCache, "", {})
            ).rejects.toThrow(SiteNotFoundError);
        });

        it("should handle updates without monitors field", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            const updates = { name: "Updated Name Only" };

            const result = await siteWriterService.updateSite(
                mockSitesCache,
                "test-site",
                updates
            );

            expect(mockDb.all).not.toHaveBeenCalled(); // Should not query monitors
            expect(result.name).toBe("Updated Name Only");
            expect(result.monitors).toEqual(mockSite.monitors); // Should preserve original monitors
        });
    });

    describe("handleMonitorIntervalChanges", () => {
        let mockMonitoringConfig: MonitoringConfig;

        beforeEach(() => {
            mockMonitoringConfig = {
                setHistoryLimit: vi.fn().mockResolvedValue(undefined),
                setupNewMonitors: vi.fn().mockResolvedValue(undefined),
                startMonitoring: vi.fn().mockResolvedValue({
                    attempted: 1,
                    failed: 0,
                    partialFailures: false,
                    siteCount: 1,
                    skipped: 0,
                    succeeded: 1,
                    isMonitoring: true,
                    alreadyActive: false,
                } satisfies MonitoringStartSummary),
                stopMonitoring: vi.fn().mockResolvedValue({
                    attempted: 1,
                    failed: 0,
                    partialFailures: false,
                    siteCount: 1,
                    skipped: 0,
                    succeeded: 1,
                    isMonitoring: false,
                    alreadyInactive: false,
                } satisfies MonitoringStopSummary),
            };
        });

        it("should handle interval changes correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalSite = {
                ...mockSite,
                monitors: [
                    createCompleteMonitor({
                        id: "monitor-1",
                        checkInterval: 30_000,
                        monitoring: true,
                    }),
                ],
            };

            const newMonitors = [
                createCompleteMonitor({
                    id: "monitor-1",
                    checkInterval: 60_000, // Changed interval
                }),
            ];

            await siteWriterService.handleMonitorIntervalChanges(
                "test-site",
                originalSite,
                newMonitors,
                mockMonitoringConfig
            );

            expect(mockMonitoringConfig.stopMonitoring).toHaveBeenCalledWith(
                "test-site",
                "monitor-1"
            );
            expect(mockMonitoringConfig.startMonitoring).toHaveBeenCalledWith(
                "test-site",
                "monitor-1"
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "Monitor monitor-1 interval changed from 30000 to 60000"
            );
        });

        it("should only stop monitoring when monitor was not actively monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const originalSite = {
                ...mockSite,
                monitors: [
                    createCompleteMonitor({
                        id: "monitor-1",
                        checkInterval: 30_000,
                        monitoring: false, // Not monitoring
                    }),
                ],
            };

            const newMonitors = [
                createCompleteMonitor({
                    id: "monitor-1",
                    checkInterval: 60_000,
                }),
            ];

            await siteWriterService.handleMonitorIntervalChanges(
                "test-site",
                originalSite,
                newMonitors,
                mockMonitoringConfig
            );

            expect(mockMonitoringConfig.stopMonitoring).toHaveBeenCalledWith(
                "test-site",
                "monitor-1"
            );
            expect(mockMonitoringConfig.startMonitoring).not.toHaveBeenCalled();
        });

        it("should handle monitors without IDs gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const originalSite = { ...mockSite };
            const newMonitors = [
                createCompleteMonitor({
                    id: "", // No ID
                    checkInterval: 60_000,
                }),
            ];

            await siteWriterService.handleMonitorIntervalChanges(
                "test-site",
                originalSite,
                newMonitors,
                mockMonitoringConfig
            );

            expect(mockMonitoringConfig.stopMonitoring).not.toHaveBeenCalled();
            expect(mockMonitoringConfig.startMonitoring).not.toHaveBeenCalled();
        });

        it("should handle monitoring config errors gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const error = new Error("Monitoring failed");
            (
                mockMonitoringConfig.stopMonitoring as MockedFunction<any>
            ).mockRejectedValue(error);

            const originalSite = {
                ...mockSite,
                monitors: [
                    createCompleteMonitor({
                        checkInterval: 30_000,
                        monitoring: true,
                    }),
                ],
            };
            const newMonitors = [
                createCompleteMonitor({ checkInterval: 60_000 }),
            ];

            // Should not throw
            await expect(
                siteWriterService.handleMonitorIntervalChanges(
                    "test-site",
                    originalSite,
                    newMonitors,
                    mockMonitoringConfig
                )
            ).resolves.not.toThrow();

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to handle monitor interval changes for site test-site:",
                error
            );
        });

        it("should skip monitors without interval changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const originalSite = { ...mockSite };
            const newMonitors = Array.from(mockSite.monitors); // Same intervals

            await siteWriterService.handleMonitorIntervalChanges(
                "test-site",
                originalSite,
                newMonitors,
                mockMonitoringConfig
            );

            expect(mockMonitoringConfig.stopMonitoring).not.toHaveBeenCalled();
            expect(mockMonitoringConfig.startMonitoring).not.toHaveBeenCalled();
        });
    });

    describe("detectNewMonitors", () => {
        it("should detect new monitors with IDs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const originalMonitors = [
                createCompleteMonitor({ id: "monitor-1" }),
            ];
            const updatedMonitors = [
                ...originalMonitors,
                createCompleteMonitor({ id: "monitor-2" }),
            ];

            const newIds = siteWriterService.detectNewMonitors(
                originalMonitors,
                updatedMonitors
            );

            expect(newIds).toEqual(["monitor-2"]);
        });

        it("should detect new monitors without IDs by signature", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const originalMonitors = [
                createCompleteMonitor({
                    id: "monitor-1",
                    url: "https://example.com",
                }),
            ];
            const updatedMonitors = [
                ...originalMonitors,
                createCompleteMonitor({
                    id: "", // No ID
                    url: "https://newsite.com", // Different URL
                }),
            ];

            const newIds = siteWriterService.detectNewMonitors(
                originalMonitors,
                updatedMonitors
            );

            expect(newIds).toEqual([""]); // Empty string placeholder for new monitor without ID
        });

        it("should not detect existing monitors without IDs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const originalMonitors = [
                createCompleteMonitor({
                    id: "monitor-1",
                    url: "https://example.com",
                }),
            ];
            const updatedMonitors = [
                ...originalMonitors,
                createCompleteMonitor({
                    id: "", // No ID but same signature
                    url: "https://example.com",
                }),
            ];

            const newIds = siteWriterService.detectNewMonitors(
                originalMonitors,
                updatedMonitors
            );

            expect(newIds).toEqual([]); // Should not detect as new
        });

        it("should handle empty arrays", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const newIds = siteWriterService.detectNewMonitors([], []);
            expect(newIds).toEqual([]);
        });

        it("should handle mixed scenarios", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalMonitors = [
                createCompleteMonitor({
                    id: "monitor-1",
                    url: "https://example.com",
                }),
            ];
            const updatedMonitors = [
                ...originalMonitors,
                createCompleteMonitor({
                    id: "monitor-2",
                    url: "https://example.com",
                }), // New with ID
                createCompleteMonitor({ id: "", url: "https://newsite.com" }), // New without ID
            ];

            const newIds = siteWriterService.detectNewMonitors(
                originalMonitors,
                updatedMonitors
            );

            expect(newIds).toEqual(["monitor-2", ""]);
        });
    });

    describe("Private Methods Coverage", () => {
        beforeEach(() => {
            (mockSitesCache.get as MockedFunction<any>).mockReturnValue(
                mockSite
            );
            (
                mockDatabaseService.executeTransaction as MockedFunction<any>
            ).mockImplementation(async (callback: any) => callback(mockDb));

            // Set up default monitor repository response for this describe block
            (
                monitorAdapter.findBySiteIdentifier as MockedFunction<any>
            ).mockReturnValue([
                {
                    id: "monitor-1",
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 30_000,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: false,
                    status: "pending",
                    responseTime: 0,
                    lastChecked: undefined,
                    history: [],
                },
            ]);
        });

        it("should cover createMonitorSignature via detectNewMonitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const monitor1 = createCompleteMonitor({
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
            });

            const monitor2 = createCompleteMonitor({
                ...monitor1,
                id: "monitor-2",
                type: "port",
                host: "example.com",
                port: 443,
            });

            const newIds = siteWriterService.detectNewMonitors(
                [monitor1],
                [monitor1, monitor2]
            );

            expect(newIds).toContain("monitor-2");
        });

        it("should cover updateExistingMonitor warning path", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            // This test covers a defensive programming scenario in updateExistingMonitor
            // where a monitor somehow loses its ID during processing
            const monitorWithoutId = createCompleteMonitor({ id: "" });

            // Configure monitor repository to return an existing monitor
            (
                monitorAdapter.findBySiteIdentifier as MockedFunction<any>
            ).mockReturnValueOnce([
                {
                    id: "monitor-1",
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 30_000,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: false,
                    status: "pending",
                    responseTime: 0,
                    lastChecked: undefined,
                    history: [],
                },
            ]);

            await siteWriterService.updateSite(mockSitesCache, "test-site", {
                monitors: [monitorWithoutId],
            });

            // Since monitor has no ID, it should create a new monitor instead of updating
            expect(monitorAdapter.create).toHaveBeenCalled();
            expect(monitorAdapter.update).not.toHaveBeenCalled();
        });

        it("should cover orphaned monitor handling in handleExistingMonitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            (mockDb.all as MockedFunction<any>).mockReturnValue([]); // No existing monitors

            const orphanedMonitor = createCompleteMonitor({
                id: "orphaned-id",
            });

            await siteWriterService.updateSite(mockSitesCache, "test-site", {
                monitors: [orphanedMonitor],
            });

            expect(
                mockMonitorRepository.createTransactionAdapter
            ).toHaveBeenCalledWith(mockDb);
            expect(monitorAdapter.create).toHaveBeenCalledWith(
                "test-site",
                expect.objectContaining({
                    checkInterval: orphanedMonitor.checkInterval,
                    retryAttempts: orphanedMonitor.retryAttempts,
                    timeout: orphanedMonitor.timeout,
                    type: orphanedMonitor.type,
                })
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "Created new monitor new-monitor-id for site test-site (ID not found)"
            );
        });

        it("should cover createUpdatedSite cache update", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const updates = { name: "Updated Name" };

            await siteWriterService.updateSite(
                mockSitesCache,
                "test-site",
                updates
            );

            expect(mockSitesCache.set).toHaveBeenCalledWith(
                "test-site",
                expect.objectContaining({
                    ...mockSite,
                    name: "Updated Name",
                })
            );
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle monitors with all optional fields defined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = {
                id: "monitor-1",
                type: "port" as const,
                host: "example.com",
                port: 443,
                url: "https://example.com",
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: false,
                status: "pending" as const,
                responseTime: 0,
                lastChecked: undefined,
                history: [],
            };

            const signature = (siteWriterService as any).createMonitorSignature(
                monitor
            );

            expect(signature).toContain("type:port");
            expect(signature).toContain("host:example.com");
            expect(signature).toContain("port:443");
            expect(signature).toContain("url:https://example.com");
        });

        it("should handle monitors with undefined optional fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = {
                id: "monitor-1",
                type: "http" as const,
                host: undefined,
                port: undefined,
                url: "https://example.com",
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: false,
                status: "pending" as const,
                responseTime: 0,
                lastChecked: undefined,
                history: [],
            };

            const signature = (siteWriterService as any).createMonitorSignature(
                monitor
            );

            expect(signature).toContain("host:");
            expect(signature).toContain("port:");
            expect(signature).toContain("url:https://example.com");
        });

        it("should handle complex monitor update scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: SiteWriterService-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Update", "type");

            (mockSitesCache.get as MockedFunction<any>).mockReturnValue(
                mockSite
            );
            (
                mockDatabaseService.executeTransaction as MockedFunction<any>
            ).mockImplementation(async (callback: any) => callback(mockDb));

            // Configure monitor repository to return two existing monitors
            (
                monitorAdapter.findBySiteIdentifier as MockedFunction<any>
            ).mockReturnValueOnce([
                {
                    id: "monitor-1",
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 30_000,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: true,
                    status: "up",
                    responseTime: 100,
                    lastChecked: undefined,
                    history: [],
                },
                {
                    id: "monitor-2",
                    type: "port",
                    host: "example.com",
                    port: 80,
                    checkInterval: 30_000,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: false,
                    status: "pending",
                    responseTime: 0,
                    lastChecked: undefined,
                    history: [],
                },
            ]);

            const updates = {
                monitors: [
                    createCompleteMonitor({
                        id: "monitor-1",
                        checkInterval: 60_000,
                    }), // Update existing
                    // Remove monitor-2 (not included)
                    createCompleteMonitor({
                        id: "",
                        url: "https://newsite.com",
                    }), // Add new
                ],
            };

            await siteWriterService.updateSite(
                mockSitesCache,
                "test-site",
                updates
            );

            expect(
                mockMonitorRepository.createTransactionAdapter
            ).toHaveBeenCalledWith(mockDb);
            expect(monitorAdapter.update).toHaveBeenCalledWith(
                "monitor-1",
                expect.any(Object)
            );
            expect(monitorAdapter.deleteById).toHaveBeenCalledWith("monitor-2");
            expect(monitorAdapter.create).toHaveBeenCalledWith(
                "test-site",
                expect.objectContaining({ url: "https://newsite.com" })
            );
        });
    });
});
