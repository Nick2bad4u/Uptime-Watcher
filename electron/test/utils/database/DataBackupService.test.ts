import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { DataBackupService, DataBackupOrchestrator } from "../../../utils/database/DataBackupService";
import { SiteLoadingError, ISiteCache } from "../../../utils/database/interfaces";

describe("DataBackupService", () => {
    let mockDatabaseService: any;
    let mockLogger: any;
    let mockEventEmitter: any;
    let dataBackupService: DataBackupService;

    beforeEach(() => {
        mockDatabaseService = {
            downloadBackup: vi.fn(),
        };

        mockLogger = {
            info: vi.fn(),
            error: vi.fn(),
        };

        mockEventEmitter = {
            emitTyped: vi.fn(),
        };

        dataBackupService = new DataBackupService({
            databaseService: mockDatabaseService,
            logger: mockLogger,
            eventEmitter: mockEventEmitter,
        });

        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("downloadDatabaseBackup", () => {
        it("should successfully download database backup", async () => {
            const mockBackup = {
                buffer: Buffer.from("test data"),
                fileName: "backup.sqlite",
            };

            mockDatabaseService.downloadBackup.mockResolvedValue(mockBackup);

            const result = await dataBackupService.downloadDatabaseBackup();

            expect(result).toEqual(mockBackup);
            expect(mockDatabaseService.downloadBackup).toHaveBeenCalledOnce();
            expect(mockLogger.info).toHaveBeenCalledWith("Database backup created: backup.sqlite");
        });

        it("should handle database service errors", async () => {
            const mockError = new Error("Database connection failed");
            mockDatabaseService.downloadBackup.mockRejectedValue(mockError);

            await expect(dataBackupService.downloadDatabaseBackup()).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to download backup: Database connection failed",
                mockError
            );
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith("database:error", {
                details: "Failed to download backup: Database connection failed",
                error: mockError,
                operation: "download-backup",
                timestamp: expect.any(Number),
            });
        });

        it("should handle non-Error objects", async () => {
            const mockError = "String error";
            mockDatabaseService.downloadBackup.mockRejectedValue(mockError);

            await expect(dataBackupService.downloadDatabaseBackup()).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to download backup: String error", mockError);
            expect(mockEventEmitter.emitTyped).toHaveBeenCalledWith("database:error", {
                details: "Failed to download backup: String error",
                error: new Error("String error"),
                operation: "download-backup",
                timestamp: expect.any(Number),
            });
        });

        it("should handle null error", async () => {
            mockDatabaseService.downloadBackup.mockRejectedValue(null);

            await expect(dataBackupService.downloadDatabaseBackup()).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to download backup: null", null);
        });

        it("should handle undefined error", async () => {
            mockDatabaseService.downloadBackup.mockRejectedValue(undefined);

            await expect(dataBackupService.downloadDatabaseBackup()).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to download backup: undefined", undefined);
        });

        it("should handle empty error", async () => {
            mockDatabaseService.downloadBackup.mockRejectedValue("");

            await expect(dataBackupService.downloadDatabaseBackup()).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to download backup: ", "");
        });

        it("should handle complex error objects", async () => {
            const complexError = { message: "Complex error", code: 500 };
            mockDatabaseService.downloadBackup.mockRejectedValue(complexError);

            await expect(dataBackupService.downloadDatabaseBackup()).rejects.toThrow(SiteLoadingError);

            expect(mockLogger.error).toHaveBeenCalledWith("Failed to download backup: [object Object]", complexError);
        });

        it("should handle empty buffer in response", async () => {
            const mockBackup = {
                buffer: Buffer.alloc(0),
                fileName: "empty-backup.sqlite",
            };

            mockDatabaseService.downloadBackup.mockResolvedValue(mockBackup);

            const result = await dataBackupService.downloadDatabaseBackup();

            expect(result).toEqual(mockBackup);
            expect(mockLogger.info).toHaveBeenCalledWith("Database backup created: empty-backup.sqlite");
        });

        it("should handle large backup files", async () => {
            const largeBuffer = Buffer.alloc(1024 * 1024 * 10); // 10MB
            const mockBackup = {
                buffer: largeBuffer,
                fileName: "large-backup.sqlite",
            };

            mockDatabaseService.downloadBackup.mockResolvedValue(mockBackup);

            const result = await dataBackupService.downloadDatabaseBackup();

            expect(result).toEqual(mockBackup);
            expect(result.buffer.length).toBe(1024 * 1024 * 10);
        });
    });
});

describe("DataBackupOrchestrator", () => {
    let mockDataBackupService: any;
    let dataBackupOrchestrator: DataBackupOrchestrator;

    beforeEach(() => {
        mockDataBackupService = {
            downloadDatabaseBackup: vi.fn(),
        };

        dataBackupOrchestrator = new DataBackupOrchestrator(mockDataBackupService);

        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("downloadBackup", () => {
        it("should delegate to data backup service", async () => {
            const mockBackup = {
                buffer: Buffer.from("test data"),
                fileName: "backup.sqlite",
            };

            mockDataBackupService.downloadDatabaseBackup.mockResolvedValue(mockBackup);

            const result = await dataBackupOrchestrator.downloadBackup();

            expect(result).toEqual(mockBackup);
            expect(mockDataBackupService.downloadDatabaseBackup).toHaveBeenCalledOnce();
        });

        it("should propagate errors from data backup service", async () => {
            const mockError = new Error("Service error");
            mockDataBackupService.downloadDatabaseBackup.mockRejectedValue(mockError);

            await expect(dataBackupOrchestrator.downloadBackup()).rejects.toThrow("Service error");
        });
    });

    describe("refreshSitesFromCache", () => {
        it("should successfully refresh sites from cache", async () => {
            const mockSiteCache: ISiteCache = {
                entries: vi.fn().mockReturnValue([
                    ["site1", { identifier: "site1", name: "Site 1", monitors: [] }],
                    ["site2", { identifier: "site2", name: "Site 2", monitors: [] }],
                    ["site3", { identifier: "site3", monitors: [] }],
                ]),
                get: vi.fn(),
                set: vi.fn(),
                delete: vi.fn(),
                clear: vi.fn(),
                size: vi.fn(),
            };

            const result = await dataBackupOrchestrator.refreshSitesFromCache(mockSiteCache);

            expect(result).toEqual([
                { identifier: "site1", name: "Site 1" },
                { identifier: "site2", name: "Site 2" },
                { identifier: "site3" },
            ]);
        });

        it("should handle empty cache", async () => {
            const mockSiteCache: ISiteCache = {
                entries: vi.fn().mockReturnValue([]),
                get: vi.fn(),
                set: vi.fn(),
                delete: vi.fn(),
                clear: vi.fn(),
                size: vi.fn(),
            };

            const result = await dataBackupOrchestrator.refreshSitesFromCache(mockSiteCache);

            expect(result).toEqual([]);
        });

        it("should handle sites without names", async () => {
            const mockSiteCache: ISiteCache = {
                entries: vi.fn().mockReturnValue([
                    ["site1", { identifier: "site1", monitors: [] }],
                    ["site2", { identifier: "site2", name: "Site 2", monitoring: true, monitors: [] }],
                ]),
                get: vi.fn(),
                set: vi.fn(),
                delete: vi.fn(),
                clear: vi.fn(),
                size: vi.fn(),
            };

            const result = await dataBackupOrchestrator.refreshSitesFromCache(mockSiteCache);

            expect(result).toEqual([
                { identifier: "site1" }, 
                { identifier: "site2", name: "Site 2" }
            ]);
        });

        it("should handle sites with empty string names", async () => {
            const mockSiteCache: ISiteCache = {
                entries: vi.fn().mockReturnValue([["site1", { identifier: "site1", name: "", monitors: [] }]]),
                get: vi.fn(),
                set: vi.fn(),
                delete: vi.fn(),
                clear: vi.fn(),
                size: vi.fn(),
            };

            const result = await dataBackupOrchestrator.refreshSitesFromCache(mockSiteCache);

            expect(result).toEqual([{ identifier: "site1", name: "" }]);
        });

        it("should handle cache iteration errors", async () => {
            const mockSiteCache: ISiteCache = {
                entries: vi.fn().mockImplementation(() => {
                    throw new Error("Iterator error");
                }),
                get: vi.fn(),
                set: vi.fn(),
                delete: vi.fn(),
                clear: vi.fn(),
                size: vi.fn(),
            };

            await expect(dataBackupOrchestrator.refreshSitesFromCache(mockSiteCache)).rejects.toThrow(SiteLoadingError);
        });

        it("should handle non-Error exceptions in cache operations", async () => {
            const mockSiteCache: ISiteCache = {
                entries: vi.fn().mockImplementation(() => {
                    const error = "String error";
                    throw error;
                }),
                get: vi.fn(),
                set: vi.fn(),
                delete: vi.fn(),
                clear: vi.fn(),
                size: vi.fn(),
            };

            const error = await dataBackupOrchestrator.refreshSitesFromCache(mockSiteCache).catch((e) => e);

            expect(error).toBeInstanceOf(SiteLoadingError);
            expect(error.message).toContain("String error");
        });

        it("should handle large number of sites", async () => {
            const entries: Array<[string, any]> = [];

            // Add 1000 sites
            for (let i = 0; i < 1000; i++) {
                entries.push([
                    `site${i}`,
                    {
                        identifier: `site${i}`,
                        name: `Site ${i}`,
                        monitors: [],
                    },
                ]);
            }

            const mockSiteCache: ISiteCache = {
                entries: vi.fn().mockReturnValue(entries),
                get: vi.fn(),
                set: vi.fn(),
                delete: vi.fn(),
                clear: vi.fn(),
                size: vi.fn(),
            };

            const result = await dataBackupOrchestrator.refreshSitesFromCache(mockSiteCache);

            expect(result).toHaveLength(1000);
            expect(result[0]).toEqual({ identifier: "site0", name: "Site 0" });
            expect(result[999]).toEqual({ identifier: "site999", name: "Site 999" });
        });
    });
});
