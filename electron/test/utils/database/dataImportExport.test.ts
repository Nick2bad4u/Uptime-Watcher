/**
 * Tests for dataImportExport utility functions.
 * Validates data import and export functionality.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";

import {
    exportData,
    importData,
    validateImportData,
    clearExistingData,
    importSitesAndSettings,
    importMonitorsWithHistory,
    importHistoryForMonitors,
    findMatchingOriginalMonitor,
    shouldImportHistory,
} from "../../../utils/database/dataImportExport";
import type {
    DataImportExportDependencies,
    DataImportExportCallbacks,
    ImportSite,
} from "../../../utils/database/dataImportExport";
import type { Site, MonitorType } from "../../../types";

// Mock the logger
vi.mock("../../../utils/logger", () => ({
    monitorLogger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

// Mock repositories
const mockHistoryRepository = {
    findByMonitorId: vi.fn(),
    deleteAll: vi.fn(),
    bulkInsert: vi.fn(),
} as any;

const mockMonitorRepository = {
    findBySiteIdentifier: vi.fn(),
    deleteAll: vi.fn(),
    bulkCreate: vi.fn(),
} as any;

const mockSettingsRepository = {
    getAll: vi.fn(),
    deleteAll: vi.fn(),
    bulkInsert: vi.fn(),
} as any;

const mockSiteRepository = {
    exportAll: vi.fn(),
    deleteAll: vi.fn(),
    bulkInsert: vi.fn(),
} as any;

// Mock EventEmitter
let mockEventEmitter: EventEmitter;

// Mock dependencies
let mockDependencies: DataImportExportDependencies;
let mockCallbacks: DataImportExportCallbacks;

// Mock data
const mockSites: Site[] = [
    {
        identifier: "site-1",
        name: "Test Site 1",
        monitors: [
            {
                id: "1",
                url: "https://example.com",
                type: "http",
                status: "up",
                history: [
                    {
                        status: "up",
                        responseTime: 100,
                        timestamp: Date.now(),
                    },
                ],
            },
        ],
        monitoring: false,
    },
    {
        identifier: "site-2",
        name: "Test Site 2",
        monitors: [
            {
                id: "2",
                url: "https://example2.com",
                type: "http",
                status: "up",
                history: [],
            },
        ],
        monitoring: false,
    },
];

const mockSettings = {
    "history.limit": "30",
    theme: "light",
};

const mockImportSites: ImportSite[] = [
    {
        identifier: "site-1",
        name: "Test Site 1",
        monitors: [
            {
                id: "1",
                url: "https://example.com",
                type: "http",
                status: "up",
                history: [
                    {
                        status: "up",
                        responseTime: 100,
                        timestamp: Date.now(),
                    },
                ],
            },
        ],
    },
    {
        identifier: "site-2",
        name: "Test Site 2",
        monitors: [
            {
                id: "2",
                url: "https://example2.com",
                type: "http",
                status: "up",
                history: [],
            },
        ],
    },
];

describe("dataImportExport", () => {
    beforeEach(() => {
        mockEventEmitter = new EventEmitter();
        mockDependencies = {
            eventEmitter: mockEventEmitter,
            repositories: {
                history: mockHistoryRepository,
                monitor: mockMonitorRepository,
                settings: mockSettingsRepository,
                site: mockSiteRepository,
            },
        };
        mockCallbacks = {
            loadSites: vi.fn().mockResolvedValue(undefined),
            getSitesFromCache: vi.fn().mockReturnValue([]),
        };

        // Reset all mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("exportData", () => {
        it("should export data successfully", async () => {
            // Helper functions to avoid deep nesting
            const findSiteMonitors = (siteId: string) => {
                const site = mockSites.find((s) => s.identifier === siteId);
                return Promise.resolve(site?.monitors || []);
            };

            const findMonitorHistory = (monitorId: string) => {
                const monitor = mockSites.flatMap((s) => s.monitors).find((m) => m.id === monitorId);
                return Promise.resolve(monitor?.history || []);
            };

            // Setup mocks
            mockSiteRepository.exportAll.mockResolvedValue(
                mockSites.map((s) => ({
                    identifier: s.identifier,
                    name: s.name,
                }))
            );
            mockSettingsRepository.getAll.mockResolvedValue(mockSettings);
            mockMonitorRepository.findBySiteIdentifier.mockImplementation(findSiteMonitors);
            mockHistoryRepository.findByMonitorId.mockImplementation(findMonitorHistory);

            const result = await exportData(mockDependencies);
            const parsedResult = JSON.parse(result);

            expect(parsedResult.settings).toEqual(mockSettings);
            expect(parsedResult.sites).toHaveLength(2);
            expect(parsedResult.sites[0].identifier).toBe("site-1");
            expect(parsedResult.sites[0].name).toBe("Test Site 1");
            expect(parsedResult.sites[0].monitors).toHaveLength(1);
            expect(parsedResult.sites[0].monitors[0].history).toHaveLength(1);
        });

        it("should handle export errors", async () => {
            const mockError = new Error("Export failed");
            mockSiteRepository.exportAll.mockRejectedValue(mockError);

            // Use timeout to avoid deep nesting
            const checkErrorEvent = (): Promise<void> => {
                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error("Event not emitted"));
                    }, 100);

                    mockEventEmitter.once("db-error", (data) => {
                        clearTimeout(timeout);
                        expect(data.error).toBe(mockError);
                        expect(data.operation).toBe("exportData");
                        resolve();
                    });
                });
            };

            const [, eventResult] = await Promise.allSettled([exportData(mockDependencies), checkErrorEvent()]);

            expect(eventResult.status).toBe("fulfilled");
        });
    });

    describe("importData", () => {
        const validImportData = JSON.stringify({
            settings: mockSettings,
            sites: mockImportSites,
        });

        it("should import data successfully", async () => {
            mockSiteRepository.bulkInsert.mockResolvedValue(undefined);
            mockSettingsRepository.bulkInsert.mockResolvedValue(undefined);
            mockMonitorRepository.bulkCreate.mockResolvedValue(mockImportSites[0].monitors);
            mockHistoryRepository.bulkInsert.mockResolvedValue(undefined);

            const result = await importData(mockDependencies, mockCallbacks, validImportData);

            expect(result).toBe(true);
            expect(mockSiteRepository.deleteAll).toHaveBeenCalled();
            expect(mockSettingsRepository.deleteAll).toHaveBeenCalled();
            expect(mockMonitorRepository.deleteAll).toHaveBeenCalled();
            expect(mockHistoryRepository.deleteAll).toHaveBeenCalled();
        });

        it("should handle import errors", async () => {
            const mockError = new Error("Import failed");
            mockSiteRepository.deleteAll.mockRejectedValue(mockError);

            // Use timeout to avoid deep nesting
            const checkErrorEvent = (): Promise<void> => {
                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error("Event not emitted"));
                    }, 100);

                    mockEventEmitter.once("db-error", (data) => {
                        clearTimeout(timeout);
                        expect(data.error).toBe(mockError);
                        expect(data.operation).toBe("importData");
                        resolve();
                    });
                });
            };

            const [result, eventResult] = await Promise.allSettled([
                importData(mockDependencies, mockCallbacks, validImportData),
                checkErrorEvent(),
            ]);

            expect(result.status).toBe("fulfilled");
            expect((result as PromiseFulfilledResult<boolean>).value).toBe(false);
            expect(eventResult.status).toBe("fulfilled");
        });

        it("should handle invalid JSON", async () => {
            const result = await importData(mockDependencies, mockCallbacks, "invalid json");

            expect(result).toBe(false);
        });
    });

    describe("validateImportData", () => {
        it("should validate valid import data", () => {
            const validData = JSON.stringify({
                settings: mockSettings,
                sites: mockImportSites,
            });

            const result = validateImportData(validData);

            expect(result.settings).toEqual(mockSettings);
            expect(result.sites).toEqual(mockImportSites);
        });

        it("should throw error for empty string", () => {
            expect(() => validateImportData("")).toThrow("Invalid import data: must be a non-empty string");
        });

        it("should throw error for non-string input", () => {
            expect(() => validateImportData(null as any)).toThrow("Invalid import data: must be a non-empty string");
        });

        it("should throw error for invalid JSON", () => {
            expect(() => validateImportData("invalid json")).toThrow();
        });

        it("should throw error for non-object JSON", () => {
            expect(() => validateImportData('"string"')).toThrow("Invalid import data: must be a valid JSON object");
        });

        it("should throw error for null JSON", () => {
            expect(() => validateImportData("null")).toThrow("Invalid import data: must be a valid JSON object");
        });
    });

    describe("clearExistingData", () => {
        it("should clear all existing data", async () => {
            await clearExistingData(mockDependencies);

            expect(mockSiteRepository.deleteAll).toHaveBeenCalled();
            expect(mockSettingsRepository.deleteAll).toHaveBeenCalled();
            expect(mockMonitorRepository.deleteAll).toHaveBeenCalled();
            expect(mockHistoryRepository.deleteAll).toHaveBeenCalled();
        });

        it("should handle errors in clearing data", async () => {
            const mockError = new Error("Clear failed");
            mockSiteRepository.deleteAll.mockRejectedValue(mockError);

            await expect(clearExistingData(mockDependencies)).rejects.toThrow("Clear failed");
        });
    });

    describe("importSitesAndSettings", () => {
        it("should import sites and settings", async () => {
            const parsedData = {
                sites: mockImportSites,
                settings: mockSettings,
            };

            await importSitesAndSettings(mockDependencies, parsedData);

            expect(mockSiteRepository.bulkInsert).toHaveBeenCalledWith([
                { identifier: "site-1", name: "Test Site 1" },
                { identifier: "site-2", name: "Test Site 2" },
            ]);
            expect(mockSettingsRepository.bulkInsert).toHaveBeenCalledWith(mockSettings);
        });

        it("should handle sites without names", async () => {
            const parsedData = {
                sites: [{ identifier: "site-1" }, { identifier: "site-2", name: "Test Site 2" }],
            };

            await importSitesAndSettings(mockDependencies, parsedData);

            expect(mockSiteRepository.bulkInsert).toHaveBeenCalledWith([
                { identifier: "site-1" },
                { identifier: "site-2", name: "Test Site 2" },
            ]);
        });

        it("should handle missing sites", async () => {
            const parsedData = {
                settings: mockSettings,
            };

            await importSitesAndSettings(mockDependencies, parsedData);

            expect(mockSiteRepository.bulkInsert).not.toHaveBeenCalled();
            expect(mockSettingsRepository.bulkInsert).toHaveBeenCalledWith(mockSettings);
        });

        it("should handle missing settings", async () => {
            const parsedData = {
                sites: mockImportSites,
            };

            await importSitesAndSettings(mockDependencies, parsedData);

            expect(mockSiteRepository.bulkInsert).toHaveBeenCalled();
            expect(mockSettingsRepository.bulkInsert).not.toHaveBeenCalled();
        });

        it("should handle non-array sites", async () => {
            const parsedData = {
                sites: "not an array" as any,
                settings: mockSettings,
            };

            await importSitesAndSettings(mockDependencies, parsedData);

            expect(mockSiteRepository.bulkInsert).not.toHaveBeenCalled();
            expect(mockSettingsRepository.bulkInsert).toHaveBeenCalledWith(mockSettings);
        });

        it("should handle non-object settings", async () => {
            const parsedData = {
                sites: mockImportSites,
                settings: "not an object" as any,
            };

            await importSitesAndSettings(mockDependencies, parsedData);

            expect(mockSiteRepository.bulkInsert).toHaveBeenCalled();
            expect(mockSettingsRepository.bulkInsert).not.toHaveBeenCalled();
        });
    });

    describe("importMonitorsWithHistory", () => {
        it("should import monitors with history", async () => {
            const createdMonitors = [
                {
                    id: "1",
                    url: "https://example.com",
                    type: "http",
                    status: "up",
                    history: [],
                },
            ];
            mockMonitorRepository.bulkCreate.mockResolvedValue(createdMonitors);

            await importMonitorsWithHistory(mockDependencies, mockImportSites);

            expect(mockMonitorRepository.bulkCreate).toHaveBeenCalledWith("site-1", mockImportSites[0].monitors);
            expect(mockMonitorRepository.bulkCreate).toHaveBeenCalledWith("site-2", mockImportSites[1].monitors);
        });

        it("should handle sites without monitors", async () => {
            const sitesWithoutMonitors = [
                { identifier: "site-1", name: "Test Site 1" },
                { identifier: "site-2", name: "Test Site 2", monitors: [] },
            ];

            // Ensure bulkCreate returns an empty array for empty monitors
            mockMonitorRepository.bulkCreate.mockResolvedValue([]);

            await importMonitorsWithHistory(mockDependencies, sitesWithoutMonitors);

            expect(mockMonitorRepository.bulkCreate).toHaveBeenCalledWith("site-2", []);
            expect(mockMonitorRepository.bulkCreate).toHaveBeenCalledTimes(1);
        });

        it("should handle sites with non-array monitors", async () => {
            const sitesWithInvalidMonitors = [
                { identifier: "site-1", name: "Test Site 1", monitors: "not an array" as any },
            ];

            await importMonitorsWithHistory(mockDependencies, sitesWithInvalidMonitors);

            expect(mockMonitorRepository.bulkCreate).not.toHaveBeenCalled();
        });
    });

    describe("importHistoryForMonitors", () => {
        const createdMonitors = [
            {
                id: "1",
                url: "https://example.com",
                type: "http" as MonitorType,
                status: "up" as const,
                history: [],
            },
        ];

        const originalMonitors = [
            {
                id: "999",
                url: "https://example.com",
                type: "http" as MonitorType,
                status: "up" as const,
                history: [
                    {
                        status: "up" as const,
                        responseTime: 100,
                        timestamp: Date.now(),
                    },
                ],
            },
        ];

        it("should import history for matching monitors", async () => {
            await importHistoryForMonitors(mockDependencies, createdMonitors, originalMonitors);

            expect(mockHistoryRepository.bulkInsert).toHaveBeenCalledWith("1", [
                {
                    status: "up",
                    responseTime: 100,
                    timestamp: originalMonitors[0].history![0].timestamp,
                },
            ]);
        });

        it("should handle history with details", async () => {
            const originalMonitorsWithDetails = [
                {
                    ...originalMonitors[0],
                    history: [
                        {
                            status: "up" as const,
                            responseTime: 100,
                            timestamp: Date.now(),
                            details: "Connection successful",
                        },
                    ],
                },
            ];

            await importHistoryForMonitors(mockDependencies, createdMonitors, originalMonitorsWithDetails);

            expect(mockHistoryRepository.bulkInsert).toHaveBeenCalledWith("1", [
                {
                    status: "up",
                    responseTime: 100,
                    timestamp: originalMonitorsWithDetails[0].history![0].timestamp,
                    details: "Connection successful",
                },
            ]);
        });

        it("should handle monitors without matching originals", async () => {
            const nonMatchingCreatedMonitors = [
                {
                    id: "1",
                    url: "https://different.com",
                    type: "http" as MonitorType,
                    status: "up" as const,
                    history: [],
                },
            ];

            await importHistoryForMonitors(mockDependencies, nonMatchingCreatedMonitors, originalMonitors);

            expect(mockHistoryRepository.bulkInsert).not.toHaveBeenCalled();
        });

        it("should handle monitors without history", async () => {
            const originalMonitorsWithoutHistory = [
                {
                    id: "999",
                    url: "https://example.com",
                    type: "http" as MonitorType,
                    status: "up" as const,
                    history: [],
                },
            ];

            await importHistoryForMonitors(mockDependencies, createdMonitors, originalMonitorsWithoutHistory);

            expect(mockHistoryRepository.bulkInsert).toHaveBeenCalledWith("1", []);
        });

        it("should handle monitors without IDs", async () => {
            const createdMonitorsWithoutIds = [
                {
                    url: "https://example.com",
                    type: "http" as MonitorType,
                    status: "up" as const,
                    history: [],
                } as any,
            ];

            await importHistoryForMonitors(mockDependencies, createdMonitorsWithoutIds, originalMonitors);

            expect(mockHistoryRepository.bulkInsert).not.toHaveBeenCalled();
        });
    });

    describe("findMatchingOriginalMonitor", () => {
        const originalMonitors = [
            {
                id: "1",
                url: "https://example.com",
                type: "http" as MonitorType,
                status: "up" as const,
                history: [],
            },
            {
                id: "2",
                url: "https://example2.com",
                type: "http" as MonitorType,
                status: "up" as const,
                history: [],
            },
        ];

        it("should find matching monitor by URL and type", () => {
            const createdMonitor = {
                id: "999",
                url: "https://example.com",
                type: "http" as MonitorType,
                status: "up" as const,
                history: [],
            };

            const result = findMatchingOriginalMonitor(createdMonitor, originalMonitors);

            expect(result).toBe(originalMonitors[0]);
        });

        it("should return undefined for non-matching monitor", () => {
            const createdMonitor = {
                id: "999",
                url: "https://different.com",
                type: "http" as MonitorType,
                status: "up" as const,
                history: [],
            };

            const result = findMatchingOriginalMonitor(createdMonitor, originalMonitors);

            expect(result).toBeUndefined();
        });

        it("should distinguish between different types", () => {
            const createdMonitor = {
                id: "999",
                url: "https://example.com",
                type: "port" as MonitorType,
                status: "up" as const,
                history: [],
            };

            const result = findMatchingOriginalMonitor(createdMonitor, originalMonitors);

            expect(result).toBeUndefined();
        });
    });

    describe("shouldImportHistory", () => {
        it("should return true for valid monitors with IDs", () => {
            const createdMonitor = {
                id: "1",
                url: "https://example.com",
                type: "http" as MonitorType,
                status: "up" as const,
                history: [],
            };

            const originalMonitor = {
                id: "999",
                url: "https://example.com",
                type: "http" as MonitorType,
                status: "up" as const,
                history: [],
            };

            const result = shouldImportHistory(createdMonitor, originalMonitor);

            expect(result).toBe(true);
        });

        it("should return false for monitor without ID", () => {
            const createdMonitor = {
                url: "https://example.com",
                type: "http" as MonitorType,
                status: "up" as const,
                history: [],
            } as any;

            const originalMonitor = {
                id: "999",
                url: "https://example.com",
                type: "http" as MonitorType,
                status: "up" as const,
                history: [],
            };

            const result = shouldImportHistory(createdMonitor, originalMonitor);

            expect(result).toBe(false);
        });

        it("should return false for missing original monitor", () => {
            const createdMonitor = {
                id: "1",
                url: "https://example.com",
                type: "http" as MonitorType,
                status: "up" as const,
                history: [],
            };

            const result = shouldImportHistory(createdMonitor, undefined);

            expect(result).toBe(false);
        });

        it("should return false for missing created monitor", () => {
            const originalMonitor = {
                id: "999",
                url: "https://example.com",
                type: "http" as MonitorType,
                status: "up" as const,
                history: [],
            };

            const result = shouldImportHistory(undefined as any, originalMonitor);

            expect(result).toBe(false);
        });
    });
});
