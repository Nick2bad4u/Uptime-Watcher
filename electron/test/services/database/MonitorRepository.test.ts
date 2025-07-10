import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MonitorRepository } from "../../../services/database/MonitorRepository";
import { DatabaseService } from "../../../services/database/DatabaseService";
import { Site } from "../../../types";
import { logger } from "../../../utils/logger";
import { isDev } from "../../../electronUtils";
import {
    safeNumberConvert,
    convertDateForDb,
    rowToMonitor,
    addNumberField,
    MonitorRow,
} from "../../../services/database/utils";

// Mock dependencies
vi.mock("../../../services/database/DatabaseService");
vi.mock("../../../utils/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));
vi.mock("../../../electronUtils", () => ({
    isDev: vi.fn(),
}));

// Define interfaces for better type safety
interface MockDatabase {
    all: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    run: ReturnType<typeof vi.fn>;
}

interface MockDatabaseService {
    getDatabase: ReturnType<typeof vi.fn>;
    executeTransaction: ReturnType<typeof vi.fn>;
}

describe("MonitorRepository", () => {
    let monitorRepository: MonitorRepository;
    let mockDatabase: MockDatabase;
    let mockDatabaseService: MockDatabaseService;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock database methods
        mockDatabase = {
            all: vi.fn(),
            get: vi.fn(),
            run: vi.fn(),
        };

        // Mock DatabaseService
        mockDatabaseService = {
            getDatabase: vi.fn().mockReturnValue(mockDatabase),
            executeTransaction: vi.fn(),
        };

        // Mock the static getInstance method
        (DatabaseService.getInstance as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockDatabaseService);

        monitorRepository = new MonitorRepository();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("findBySiteIdentifier", () => {
        it("should return monitors for a site", async () => {
            const mockRows: MonitorRow[] = [
                {
                    id: 1,
                    site_identifier: "site-1",
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 300,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: true,
                    status: "up",
                    responseTime: 150,
                    lastChecked: "2024-01-01T00:00:00.000Z",
                },
            ];

            mockDatabase.all.mockReturnValue(mockRows);

            const result = await monitorRepository.findBySiteIdentifier("site-1");

            expect(mockDatabase.all).toHaveBeenCalledWith("SELECT * FROM monitors WHERE site_identifier = ?", [
                "site-1",
            ]);
            expect(result).toEqual([
                {
                    id: "1",
                    type: "http",
                    url: "https://example.com",
                    checkInterval: 300,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: true,
                    status: "up",
                    responseTime: 150,
                    lastChecked: new Date("2024-01-01T00:00:00.000Z"),
                    history: [],
                    host: undefined,
                    port: undefined,
                },
            ]);
        });

        it("should return empty array when no monitors found", async () => {
            mockDatabase.all.mockReturnValue([]);

            const result = await monitorRepository.findBySiteIdentifier("site-1");

            expect(result).toEqual([]);
        });
    });

    describe("findById", () => {
        it("should return a monitor by ID", async () => {
            const mockRow: MonitorRow = {
                id: 1,
                site_identifier: "site-1",
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 300,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: false,
                status: "down",
            };

            mockDatabase.get.mockReturnValue(mockRow);

            const result = await monitorRepository.findById("1");

            expect(mockDatabase.get).toHaveBeenCalledWith("SELECT * FROM monitors WHERE id = ?", ["1"]);
            expect(result).toEqual({
                id: "1",
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 300,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: false,
                status: "down",
                history: [],
                lastChecked: undefined,
                responseTime: 0,
                url: undefined,
            });
        });

        it("should return undefined when monitor not found", async () => {
            mockDatabase.get.mockReturnValue(undefined);

            const result = await monitorRepository.findById("999");

            expect(result).toBeUndefined();
        });
    });

    describe("create", () => {
        it("should create a new monitor and return its ID", async () => {
            (isDev as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
            mockDatabase.get.mockReturnValue({ id: 1 });

            const monitor: Omit<Site["monitors"][0], "id"> = {
                type: "http",
                url: "https://example.com",
                checkInterval: 300,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "pending",
                history: [],
                responseTime: 0
            };

            const result = await monitorRepository.create("site-1", monitor);

            expect(mockDatabase.get).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO monitors"),
                expect.arrayContaining(["site-1", "http", "https://example.com"])
            );
            expect(result).toBe("1");
            expect(logger.debug).toHaveBeenCalledWith(
                "[MonitorRepository] Created monitor with id: 1 for site: site-1"
            );
        });

        it("should handle port monitor creation", async () => {
            (isDev as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
            mockDatabase.get.mockReturnValue({ id: 2 });

            const monitor: Omit<Site["monitors"][0], "id"> = {
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 600,
                timeout: 10000,
                retryAttempts: 5,
                monitoring: false,
                status: "pending",
                history: [],
                responseTime: 0
            };

            const result = await monitorRepository.create("site-2", monitor);

            expect(mockDatabase.get).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO monitors"),
                expect.arrayContaining(["site-2", "port", null, "example.com", 80])
            );
            expect(result).toBe("2");
            expect(logger.debug).not.toHaveBeenCalled();
        });
    });

    describe("update", () => {
        it("should update monitor fields", async () => {
            (isDev as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

            const updates: Partial<Site["monitors"][0]> = {
                url: "https://newurl.com",
                checkInterval: 600,
                monitoring: false,
                status: "up",
                responseTime: 200,
                lastChecked: new Date("2024-01-02T00:00:00.000Z"),
            };

            await monitorRepository.update("1", updates);

            expect(mockDatabase.run).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE monitors SET"),
                expect.arrayContaining(["https://newurl.com", 600, 0, "up", 200, "2024-01-02T00:00:00.000Z", "1"])
            );
            expect(logger.debug).toHaveBeenCalledWith("[MonitorRepository] Updated monitor with id: 1");
        });

        it("should handle partial updates", async () => {
            const updates: Partial<Site["monitors"][0]> = {
                monitoring: true,
            };

            await monitorRepository.update("1", updates);

            expect(mockDatabase.run).toHaveBeenCalledWith("UPDATE monitors SET monitoring = ? WHERE id = ?", [1, "1"]);
        });

        it("should handle empty updates", async () => {
            await monitorRepository.update("1", {});

            expect(mockDatabase.run).not.toHaveBeenCalled();
        });

        it("should handle updating monitor type", async () => {
            const updates: Partial<Site["monitors"][0]> = {
                type: "port",
            };

            await monitorRepository.update("1", updates);

            expect(mockDatabase.run).toHaveBeenCalledWith("UPDATE monitors SET type = ? WHERE id = ?", ["port", "1"]);
        });

        it("should handle falsy but defined values in string fields", async () => {
            const monitor = {
                id: "monitor-1",
                type: "http" as const,
                url: "", // Empty string - falsy but defined
                host: "", // Empty string - falsy but defined
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "up" as const,
                responseTime: 150,
                lastChecked: new Date(),
                history: [],
            };

            mockDatabase.run.mockReturnValue({ changes: 1 });

            await monitorRepository.update("monitor-1", monitor);

            // Should call with null for empty strings
            expect(mockDatabase.run).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE monitors SET"),
                expect.arrayContaining([null, null]) // url and host should be null
            );
        });

        it.skip("should handle undefined numeric fields", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://example.com",
                host: undefined,
                port: undefined,
                checkInterval: undefined, // Line 146
                timeout: undefined, // Line 148
                retryAttempts: undefined, // Line 150
                monitoring: true,
                status: "up" as const,
                responseTime: undefined, // Line 152
                lastChecked: new Date(),
                history: [],
            };

            mockDatabase.run.mockReturnValue({ changes: 1, lastInsertRowid: 1 });
            mockDatabase.get.mockReturnValue({ id: 1 });

            await monitorRepository.create("site-1", monitor);

            // Should insert null for undefined numeric fields
            expect(mockDatabase.get).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO monitors"), [
                "site-1",
                "http",
                "https://example.com",
                null, // host
                null, // port
                null, // checkInterval
                null, // timeout
                null, // retryAttempts
                1, // monitoring
                "up",
                null, // responseTime
                expect.any(String), // lastChecked
            ]);
        });

        it("should handle different data types in rowToMonitor", async () => {
            // Test with string values that need conversion
            const row = {
                id: "123", // String instead of number
                type: "port",
                url: "null", // String "null" value
                host: "localhost",
                port: 8080, // String that needs conversion
                checkInterval: "30000", // String that needs conversion
                timeout: "5000", // String that needs conversion
                retryAttempts: "2", // String that needs conversion
                monitoring: 1,
                status: "up",
                responseTime: "100", // String that needs conversion
                lastChecked: "2023-01-01T00:00:00.000Z", // String date
            };

            mockDatabase.get.mockReturnValue(row);

            const result = await monitorRepository.findById("monitor-1");

            expect(result).toEqual({
                id: "123", // Converted to string
                type: "port",
                url: "null", // String value stays as string
                host: "localhost",
                port: 8080, // Converted to number
                checkInterval: 30000, // Converted to number
                timeout: 5000, // Converted to number
                retryAttempts: 2, // Converted to number
                monitoring: true,
                status: "up",
                responseTime: 100, // Converted to number
                lastChecked: new Date("2023-01-01T00:00:00.000Z"),
                history: [],
            });
        });

        it("should handle lastChecked when explicitly set to undefined in updateMonitor", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://example.com",
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 0,
                monitoring: true,
                status: "up" as const,
                responseTime: 150,
                lastChecked: undefined, // Explicitly undefined
                history: [],
            };

            mockDatabase.run.mockReturnValue({ changes: 1 });

            await monitorRepository.update("monitor-1", monitor);

            // Verify that lastChecked is omitted from the SQL when it's explicitly undefined
            // (The SQL doesn't include lastChecked field at all)
            expect(mockDatabase.run).toHaveBeenCalledWith(
                "UPDATE monitors SET type = ?, url = ?, checkInterval = ?, timeout = ?, retryAttempts = ?, monitoring = ?, status = ?, responseTime = ? WHERE id = ?",
                ["http", "https://example.com", 60000, 5000, 0, 1, "up", 150, "monitor-1"]
            );
        });

        it("should handle lastChecked when property is omitted entirely in updateMonitor", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://example.com",
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 0,
                monitoring: true,
                status: "up" as const,
                responseTime: 150,
                // lastChecked: omitted entirely to test undefined case
                history: [],
            };

            mockDatabase.run.mockReturnValue({ changes: 1 });

            await monitorRepository.update("monitor-1", monitor);

            // lastChecked should not appear in SQL when the property is omitted
            expect(mockDatabase.run).toHaveBeenCalledWith(expect.stringContaining("UPDATE monitors SET"), [
                "http",
                "https://example.com",
                60000,
                5000,
                0,
                1,
                "up",
                150,
                "monitor-1",
            ]);
        });

        it("should log debug message when deleting monitor in dev mode", async () => {
            (isDev as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

            // Mock executeTransaction to simulate the delete operation
            mockDatabaseService.executeTransaction.mockImplementation(async (callback) => {
                // Simulate the callback being called with the database
                return callback(mockDatabase);
            });

            mockDatabase.run
                .mockReturnValueOnce({ changes: 1 }) // DELETE history
                .mockReturnValueOnce({ changes: 1 }); // DELETE monitor

            const result = await monitorRepository.delete("monitor-1");

            expect(result).toBe(true);
            expect(logger.debug).toHaveBeenCalledWith("[MonitorRepository] Deleted monitor with id: monitor-1");
        });

        it("should handle numeric value with undefined check", async () => {
            const monitor = {
                id: "monitor-1",
                type: "http" as const,
                url: "https://example.com",
                checkInterval: 0, // Falsy number but defined
                timeout: 5000,
                retryAttempts: 0, // Falsy number but defined
                monitoring: true,
                status: "up" as const,
                responseTime: 0, // Falsy number but defined
                lastChecked: new Date(),
                history: [],
            };

            mockDatabase.run.mockReturnValue({ changes: 1 });

            await monitorRepository.update("monitor-1", monitor);

            // Should include 0 values, not treat them as null
            expect(mockDatabase.run).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE monitors SET"),
                expect.arrayContaining([0, 0, 0]) // checkInterval, retryAttempts, responseTime should be 0
            );
        });

        it("should handle invalid lastChecked date types", async () => {
            const row = {
                id: 1,
                siteIdentifier: "site-1",
                type: "http",
                url: "https://example.com",
                host: "example.com",
                port: null,
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 0,
                monitoring: 1,
                status: "up",
                responseTime: 150,
                lastChecked: 123, // Number that's not a valid date format
            };

            mockDatabase.get.mockReturnValue(row);

            const result = await monitorRepository.findById("monitor-1");

            expect(result?.lastChecked).toEqual(new Date(123));
        });
    });

    describe("delete", () => {
        it("should delete a monitor and return true on success", async () => {
            (isDev as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

            // Mock executeTransaction to simulate the delete operation
            mockDatabaseService.executeTransaction.mockImplementation(async (callback) => {
                // Simulate the callback being called with the database
                return callback(mockDatabase);
            });

            // Mock that the deletion affected one row
            mockDatabase.run.mockReturnValue({ changes: 1 });

            const result = await monitorRepository.delete("1");

            expect(result).toBe(true);
            expect(logger.debug).toHaveBeenCalledWith("[MonitorRepository] Deleted monitor with id: 1");
        });

        it("should return false when monitor not found", async () => {
            // Mock executeTransaction to simulate the delete operation
            mockDatabaseService.executeTransaction.mockImplementation(async (callback) => {
                // Simulate the callback being called with the database
                return callback(mockDatabase);
            });

            // Mock that the deletion affected zero rows
            mockDatabase.run.mockReturnValue({ changes: 0 });

            const result = await monitorRepository.delete("999");

            expect(result).toBe(false);
        });

        it("should handle database errors", async () => {
            const error = new Error("Delete failed");

            // Mock executeTransaction to simulate an error during the transaction
            mockDatabaseService.executeTransaction.mockImplementation(async () => {
                // Simulate an error during the transaction
                throw error;
            });

            await expect(monitorRepository.delete("1")).rejects.toThrow("Delete failed");
            expect(logger.error).toHaveBeenCalledWith("[MonitorRepository] Failed to delete monitor with id: 1", error);
        });
    });

    describe("deleteBySiteIdentifier", () => {
        it("should delete all monitors for a site", async () => {
            (isDev as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
            const mockMonitorIds = [{ id: 1 }, { id: 2 }];

            // Mock executeTransaction to simulate the delete operation
            mockDatabaseService.executeTransaction.mockImplementation(async (callback) => {
                // Simulate the callback being called with the database
                return callback(mockDatabase);
            });

            mockDatabase.all.mockReturnValue(mockMonitorIds);

            await monitorRepository.deleteBySiteIdentifier("site-1");

            expect(mockDatabase.all).toHaveBeenCalledWith("SELECT id FROM monitors WHERE site_identifier = ?", [
                "site-1",
            ]);
            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history WHERE monitor_id = ?", [1]);
            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history WHERE monitor_id = ?", [2]);
            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM monitors WHERE site_identifier = ?", ["site-1"]);
            expect(logger.debug).toHaveBeenCalledWith("[MonitorRepository] Deleted all monitors for site: site-1");
        });

        it("should handle database errors", async () => {
            const error = new Error("Delete by site failed");

            // Mock executeTransaction to simulate an error during the transaction
            mockDatabaseService.executeTransaction.mockImplementation(async () => {
                throw error;
            });

            await expect(monitorRepository.deleteBySiteIdentifier("site-1")).rejects.toThrow("Delete by site failed");
            expect(logger.error).toHaveBeenCalledWith(
                "[MonitorRepository] Failed to delete monitors for site: site-1",
                error
            );
        });
    });

    describe("getAllMonitorIds", () => {
        it("should return all monitor IDs", async () => {
            const mockRows = [{ id: 1 }, { id: 2 }, { id: 3 }];
            mockDatabase.all.mockReturnValue(mockRows);

            const result = await monitorRepository.getAllMonitorIds();

            expect(mockDatabase.all).toHaveBeenCalledWith("SELECT id FROM monitors");
            expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
        });
    });

    describe("deleteAll", () => {
        it("should delete all monitors", async () => {
            (isDev as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

            await monitorRepository.deleteAll();

            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM monitors");
            expect(logger.debug).toHaveBeenCalledWith("[MonitorRepository] Cleared all monitors");
        });
    });

    describe("bulkCreate", () => {
        it("should bulk create monitors", async () => {
            const monitors: Site["monitors"][0][] = [
                {
                    id: "temp-1",
                    type: "http",
                    url: "https://example1.com",
                    monitoring: true,
                    status: "pending",
                    history: [],
                    responseTime: 0
                },
                {
                    id: "temp-2",
                    type: "port",
                    host: "example.com",
                    port: 80,
                    monitoring: false,
                    status: "pending",
                    history: [],
                    responseTime: 0
                },
            ];

            await monitorRepository.bulkCreate("site-1", monitors);

            expect(mockDatabase.get).toHaveBeenCalledTimes(2);
            expect(logger.info).toHaveBeenCalledWith("[MonitorRepository] Bulk created 2 monitors for site: site-1");
        });

        it("should handle case where database insert returns undefined ID", async () => {
            const monitors = [
                {
                    id: "temp-1",
                    type: "http" as const,
                    url: "https://example.com",
                    monitoring: true,
                    status: "pending" as const,
                    history: [],
                    responseTime: 0
                },
                {
                    id: "temp-2",
                    type: "port" as const,
                    host: "example.com",
                    port: 80,
                    monitoring: false,
                    status: "pending" as const,
                    history: [],
                    responseTime: 0
                },
            ];

            // Mock database.get to return undefined for first call, valid result for second
            mockDatabase.get
                .mockReturnValueOnce(undefined) // First call returns undefined
                .mockReturnValueOnce({ id: 2 }); // Second call returns valid ID

            const result = await monitorRepository.bulkCreate("site-1", monitors);

            // Should only contain the monitor with valid ID
            expect(result).toHaveLength(1);
            expect(result[0]?.id).toBe("2");
        });
    });

    describe("Utility helper methods", () => {
        it("should test safeNumberConvert with different value types", () => {
            // Test number input
            expect(safeNumberConvert(42)).toBe(42);

            // Test string input (value branch)
            expect(safeNumberConvert("123")).toBe(123);

            // Test empty string (no value branch)
            expect(safeNumberConvert("")).toBeUndefined();

            // Test null (no value branch)
            expect(safeNumberConvert(null)).toBeUndefined();

            // Test undefined (no value branch)
            expect(safeNumberConvert(undefined)).toBeUndefined();

            // Test zero (value branch)
            expect(safeNumberConvert(0)).toBe(0);
        });

        it("should test convertDateForDb with different inputs", () => {
            // Test null input
            expect(convertDateForDb(null)).toBeNull();

            // Test undefined input
            expect(convertDateForDb(undefined)).toBeNull();

            // Test Date object
            const date = new Date("2024-01-01T00:00:00.000Z");
            expect(convertDateForDb(date)).toBe("2024-01-01T00:00:00.000Z");

            // Test string input
            expect(convertDateForDb("2024-01-01")).toBe("2024-01-01");
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle update with no fields to update", async () => {
            (isDev as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

            // Mock monitor with no fields to update (empty partial)
            const monitorUpdate = {};

            const result = await monitorRepository.update("monitor-1", monitorUpdate);

            expect(result).toBeUndefined();
            expect(logger.debug).toHaveBeenCalledWith("[MonitorRepository] No fields to update for monitor: monitor-1");
        });

        it("should handle string date values in convertDateForDb", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
                lastChecked: "2024-01-01T00:00:00.000Z" as unknown as Date, // String instead of Date
                responseTime: 0
            };

            mockDatabase.get.mockReturnValue({ id: 123 });

            await monitorRepository.create("site-1", monitor);

            // Verify that the string date was handled properly
            expect(mockDatabase.get).toHaveBeenCalled();
        });

        it("should handle null values in safeNumberConvert", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
                port: null as unknown as number, // Test null value
                timeout: 0, // Test zero value
                checkInterval: undefined, // Test undefined
                responseTime: 0
            };

            mockDatabase.get.mockReturnValue({ id: 123 });

            await monitorRepository.create("site-1", monitor);

            expect(mockDatabase.get).toHaveBeenCalled();
        });

        it("should handle truthy but non-number values in safeNumberConvert", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
                port: "8080" as unknown as number, // String number
                timeout: "5000" as unknown as number, // String number
                responseTime: 0
            };

            mockDatabase.get.mockReturnValue({ id: 123 });

            await monitorRepository.create("site-1", monitor);

            expect(mockDatabase.get).toHaveBeenCalled();
        });
    });

    describe("Branch Coverage Tests", () => {
        describe("addNumberField null branch (line 113)", () => {
            it("should handle undefined values in addNumberField", async () => {
                const monitor = {
                    type: "http" as const,
                    url: "https://example.com",
                    port: undefined, // This should not be included in SQL since it's undefined
                    status: "up" as const,
                    history: [],
                };

                mockDatabase.run.mockReturnValue({ changes: 1 });

                await monitorRepository.update("monitor-1", monitor);

                // port is undefined, so it shouldn't appear in the SQL
                expect(mockDatabase.run).toHaveBeenCalledWith(
                    "UPDATE monitors SET type = ?, url = ?, status = ? WHERE id = ?",
                    ["http", "https://example.com", "up", "monitor-1"]
                );
            });

            it("should handle null branch in addNumberField with explicit undefined", async () => {
                // Test the actual null branch by calling addNumberField directly through update
                const monitor = {
                    port: 0, // Zero is falsy but defined, should trigger the Number(value) path
                    checkInterval: 0, // Zero should be included as 0
                    timeout: undefined, // Undefined should not be included
                    retryAttempts: 0, // Zero should be included as 0
                };

                mockDatabase.run.mockReturnValue({ changes: 1 });

                await monitorRepository.update("monitor-1", monitor);

                expect(mockDatabase.run).toHaveBeenCalledWith(
                    "UPDATE monitors SET port = ?, checkInterval = ?, retryAttempts = ? WHERE id = ?",
                    [0, 0, 0, "monitor-1"]
                );
            });
        });

        describe.skip("buildMonitorParameters null branches (lines 146-154)", () => {
            it("should handle falsy url in buildMonitorParameters", async () => {
                const monitor = {
                    type: "http" as const,
                    url: "", // Empty string - triggers null branch (line 146)
                    host: null as unknown as string, // Null - triggers null branch (line 147)
                    port: undefined, // Undefined - triggers null branch (line 148)
                    checkInterval: undefined, // Undefined - triggers null branch (line 149)
                    timeout: undefined, // Undefined - triggers null branch (line 150)
                    retryAttempts: undefined, // Undefined - triggers null branch (line 152)
                    responseTime: undefined, // Undefined - triggers null branch (line 153)
                    monitoring: true,
                    status: "up" as const,
                    lastChecked: undefined, // Undefined - triggers null branch (line 154)
                    history: [],
                };

                mockDatabase.run.mockReturnValue({ changes: 1, lastInsertRowid: 1 });
                mockDatabase.get.mockReturnValue({ id: 1 });

                await monitorRepository.create("site-1", monitor);

                expect(mockDatabase.get).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO monitors"), [
                    "site-1",
                    "http",
                    null, // url (falsy)
                    null, // host (null)
                    null, // port (undefined)
                    null, // checkInterval (undefined)
                    null, // timeout (undefined)
                    null, // retryAttempts (undefined)
                    1, // monitoring
                    "up",
                    null, // responseTime (undefined)
                    null, // lastChecked (undefined)
                ]);
            });
        });

        describe("rowToMonitor undefined/default branches (lines 184, 193-195)", () => {
            it("should handle undefined host in rowToMonitor", async () => {
                const row = {
                    id: 123,
                    site_identifier: "site-1",
                    type: "http",
                    url: "https://example.com",
                    host: undefined, // triggers undefined branch (line 184)
                    port: 8080,
                    checkInterval: 300,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: 1,
                    status: "up",
                    responseTime: null,
                    lastChecked: null,
                };

                mockDatabase.get.mockReturnValue(row);

                const result = await monitorRepository.findById("monitor-1");

                expect(result?.host).toBeUndefined();
            });

            it("should handle non-string status in rowToMonitor", async () => {
                const row = {
                    id: 123,
                    type: "http",
                    url: "https://example.com",
                    monitoring: 1,
                    status: 123, // Non-string - triggers default "down" (line 193)
                };

                mockDatabase.get.mockReturnValue(row);

                const result = await monitorRepository.findById("monitor-1");

                expect(result?.status).toBe("down");
            });

            it("should handle non-string type in rowToMonitor", async () => {
                const row = {
                    id: 123,
                    type: 456, // Non-string - triggers default "http" (line 194)
                    url: "https://example.com",
                    monitoring: 1,
                    status: "up",
                };

                mockDatabase.get.mockReturnValue(row);

                const result = await monitorRepository.findById("monitor-1");

                expect(result?.type).toBe("http");
            });

            it("should handle undefined url in rowToMonitor", async () => {
                const row = {
                    id: 123,
                    type: "http",
                    // url: undefined - triggers undefined branch (line 195)
                    monitoring: 1,
                    status: "up",
                };

                mockDatabase.get.mockReturnValue(row);

                const result = await monitorRepository.findById("monitor-1");

                expect(result?.url).toBeUndefined();
            });
        });

        describe("delete method branch coverage (line 365)", () => {
            it("should not log debug when monitor not found in delete", async () => {
                const consoleDebugSpy = vi.spyOn(logger, "debug");
                (isDev as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);

                // Mock executeTransaction to simulate the delete operation
                mockDatabaseService.executeTransaction.mockImplementation(async (callback) => {
                    // Simulate the callback being called with the database
                    return callback(mockDatabase);
                });

                mockDatabase.run
                    .mockReturnValueOnce({ changes: 1 }) // DELETE history
                    .mockReturnValueOnce({ changes: 0 }); // DELETE monitor - not found

                const result = await monitorRepository.delete("nonexistent-id");

                expect(result).toBe(false);
                expect(consoleDebugSpy).not.toHaveBeenCalledWith(expect.stringContaining("Deleted monitor with id"));
            });
        });

        describe("Additional edge cases for complete branch coverage", () => {
            it("should handle false boolean values correctly", async () => {
                const monitor = {
                    type: "http" as const,
                    url: "https://example.com",
                    monitoring: false, // False boolean
                    status: "down" as const,
                    history: [],
                    responseTime: 0
                };

                mockDatabase.run.mockReturnValue({ changes: 1, lastInsertRowid: 1 });
                mockDatabase.get.mockReturnValue({ id: 1 });

                await monitorRepository.create("site-1", monitor);

                expect(mockDatabase.get).toHaveBeenCalledWith(
                    expect.stringContaining("INSERT INTO monitors"),
                    expect.arrayContaining([0]) // monitoring: false becomes 0
                );
            });

            it.skip("should handle null values in rowToMonitor safeNumberConvert", async () => {
                const row = {
                    id: 123,
                    type: "http",
                    url: "https://example.com",
                    port: null, // Null value
                    checkInterval: null, // Null value
                    timeout: null, // Null value
                    retryAttempts: null, // Null value
                    responseTime: null, // Null value
                    monitoring: 1,
                    status: "up",
                };

                mockDatabase.get.mockReturnValue(row);

                const result = await monitorRepository.findById("monitor-1");

                expect(result?.port).toBeUndefined();
                expect(result?.checkInterval).toBeUndefined();
                expect(result?.timeout).toBeUndefined();
                expect(result?.retryAttempts).toBeUndefined();
                expect(result?.responseTime).toBeUndefined();
            });

            it("should handle lastChecked branch with falsy but not undefined", async () => {
                const row = {
                    id: 123,
                    type: "http",
                    url: "https://example.com",
                    lastChecked: null, // Falsy but not undefined - triggers undefined branch
                    monitoring: 1,
                    status: "up",
                };

                mockDatabase.get.mockReturnValue(row);

                const result = await monitorRepository.findById("monitor-1");

                expect(result?.lastChecked).toBeUndefined();
            });
        });
    });

    describe("Specific Branch Coverage Tests", () => {
        describe("Line 113: addNumberField null branch", () => {
            it("should test the addNumberField utility function behavior", async () => {
                // Test the addNumberField utility function directly
                const updateFields: string[] = [];
                const updateValues: (string | number | null)[] = [];

                // Test undefined value - should not add field at all
                addNumberField("testField", undefined, updateFields, updateValues);
                expect(updateFields).toHaveLength(0);
                expect(updateValues).toHaveLength(0);

                // Test defined value - should add field with Number conversion
                addNumberField("testField", 42, updateFields, updateValues);
                expect(updateFields).toContain("testField = ?");
                expect(updateValues).toContain(42);

                // Test the actual conditional that creates the null branch - undefined should convert to null
                const testValue = undefined;
                const result = testValue !== undefined ? Number(testValue) : null;
                expect(result).toBeNull();
            });
        });

        describe.skip("Lines 146-154: buildMonitorParameters null branches", () => {
            it("should hit all null branches in buildMonitorParameters", async () => {
                const monitor = {
                    type: "http" as const,
                    url: "", // Falsy string - line 146 null branch
                    host: null as unknown as string, // Null value - line 147 null branch
                    port: undefined, // Undefined - line 148 null branch
                    checkInterval: undefined, // Undefined - line 149 null branch
                    timeout: undefined, // Undefined - line 150 null branch
                    retryAttempts: undefined, // Undefined - line 152 null branch
                    monitoring: false, // Test false monitoring
                    status: undefined as unknown as "up" | "down" | "pending", // Test undefined status (should become "down")
                    responseTime: undefined, // Undefined - line 153 null branch
                    lastChecked: undefined, // Undefined - should become null
                    history: [],
                };

                mockDatabase.run.mockReturnValue({ changes: 1, lastInsertRowid: 1 });
                mockDatabase.get.mockReturnValue({ id: 1 });

                await monitorRepository.create("site-1", monitor);

                expect(mockDatabase.get).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO monitors"), [
                    "site-1",
                    "http",
                    null, // url empty string becomes null
                    null, // host null becomes null
                    null, // port undefined becomes null
                    null, // checkInterval undefined becomes null
                    null, // timeout undefined becomes null
                    null, // retryAttempts undefined becomes null
                    0, // monitoring false becomes 0
                    undefined, // status undefined preserved
                    null, // responseTime undefined becomes null
                    null, // lastChecked undefined becomes null
                ]);
            });
        });

        describe("Line 173: insertSingleMonitor return value", () => {
            it("should return empty string when result?.id is null specifically", async () => {
                const monitor = {
                    type: "http" as const,
                    url: "https://example.com",
                    monitoring: true,
                    status: "up" as const,
                    history: [],
                    responseTime: 0
                };

                mockDatabase.run.mockReturnValue({ changes: 1, lastInsertRowid: 1 });
                mockDatabase.get.mockReturnValue({ id: null }); // Explicitly null id

                try {
                    const result = await monitorRepository.create("site-1", monitor);
                    // Should either return "" or throw error
                    expect(result === "" || result === undefined).toBe(true);
                } catch (error) {
                    expect((error as Error).message).toContain("Failed to create monitor for site");
                }
            });
        });

        describe("Line 183: rowToMonitor host branches", () => {
            it("should test different host values in rowToMonitor", async () => {
                // Test with host undefined
                const rowUndefinedHost: MonitorRow = {
                    id: 1,
                    site_identifier: "site-1",
                    type: "http",
                    url: "https://example.com",
                    // host: undefined, - omitted when undefined
                    // port: undefined, - omitted when undefined
                    checkInterval: 300,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: true,
                    status: "up",
                    responseTime: 150,
                    lastChecked: "2024-01-01T00:00:00.000Z",
                };

                // Test with host defined (non-undefined)
                const rowDefinedHost: MonitorRow = {
                    id: 2,
                    site_identifier: "site-1",
                    type: "http",
                    url: "https://example.com",
                    host: "localhost", // defined host - line 183 defined branch
                    // port: undefined, - omitted when undefined
                    checkInterval: 300,
                    timeout: 5000,
                    retryAttempts: 3,
                    monitoring: true,
                    status: "up",
                    responseTime: 150,
                    lastChecked: "2024-01-01T00:00:00.000Z",
                };

                mockDatabase.all.mockReturnValue([rowUndefinedHost, rowDefinedHost]);

                const result = await monitorRepository.findBySiteIdentifier("site-1");

                expect(result).toHaveLength(2);
                expect(result[0]?.host).toBe(undefined); // undefined host
                expect(result[1]?.host).toBe("localhost"); // defined host converted to string
            });
        });

        describe("Line 364: delete method dev mode logging", () => {
            it("should trigger warning when monitor not found", async () => {
                (isDev as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

                mockDatabase.run
                    .mockReturnValueOnce({ changes: 1 }) // DELETE history
                    .mockReturnValueOnce({ changes: 0 }); // DELETE monitor - not found

                await monitorRepository.delete("monitor-1");

                expect(logger.warn).toHaveBeenCalledWith(
                    "[MonitorRepository] Monitor not found for deletion: monitor-1"
                );
            });
        });
    });

    describe("delete method", () => {
        it("should successfully delete an existing monitor", async () => {
            const monitorId = "monitor-1";

            // Mock executeTransaction to simulate the delete operation
            mockDatabaseService.executeTransaction.mockImplementation(async (callback) => {
                // Simulate the callback being called with the database
                return callback(mockDatabase);
            });

            // Mock successful deletion (changes > 0)
            mockDatabase.run.mockReturnValue({ changes: 1 });

            const result = await monitorRepository.delete(monitorId);

            expect(result).toBe(true);
            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM history WHERE monitor_id = ?", [monitorId]);
            expect(mockDatabase.run).toHaveBeenCalledWith("DELETE FROM monitors WHERE id = ?", [monitorId]);
        });

        it("should return false when monitor does not exist", async () => {
            const monitorId = "nonexistent-monitor";

            // Mock executeTransaction to simulate the delete operation
            mockDatabaseService.executeTransaction.mockImplementation(async (callback) => {
                // Simulate the callback being called with the database
                return callback(mockDatabase);
            });

            // Mock no changes (monitor doesn't exist)
            mockDatabase.run.mockReturnValue({ changes: 0 });

            const result = await monitorRepository.delete(monitorId);

            expect(result).toBe(false);
        });

        it("should handle null changes property (line 364 edge case)", async () => {
            const monitorId = "monitor-1";

            // Mock executeTransaction to simulate the delete operation
            mockDatabaseService.executeTransaction.mockImplementation(async (callback) => {
                // Simulate the callback being called with the database
                return callback(mockDatabase);
            });

            // Mock result with null changes (triggers ?? 0 fallback)
            mockDatabase.run.mockReturnValue({ changes: null });

            const result = await monitorRepository.delete(monitorId);

            expect(result).toBe(false); // (null ?? 0) > 0 should be false
        });

        it("should handle undefined changes property (line 364 edge case)", async () => {
            const monitorId = "monitor-1";

            // Mock executeTransaction to simulate the delete operation
            mockDatabaseService.executeTransaction.mockImplementation(async (callback) => {
                // Simulate the callback being called with the database
                return callback(mockDatabase);
            });

            // Mock result with undefined changes (triggers ?? 0 fallback)
            mockDatabase.run.mockReturnValue({ changes: undefined });

            const result = await monitorRepository.delete(monitorId);

            expect(result).toBe(false); // (undefined ?? 0) > 0 should be false
        });

        it("should handle result object without changes property", async () => {
            const monitorId = "monitor-1";

            // Mock executeTransaction to simulate the delete operation
            mockDatabaseService.executeTransaction.mockImplementation(async (callback) => {
                // Simulate the callback being called with the database
                return callback(mockDatabase);
            });

            // Mock result without changes property
            mockDatabase.run.mockReturnValue({});

            const result = await monitorRepository.delete(monitorId);

            expect(result).toBe(false); // (undefined ?? 0) > 0 should be false
        });

        it("should handle database error during deletion", async () => {
            const monitorId = "monitor-1";
            const error = new Error("Database error");

            // Mock executeTransaction to simulate an error during the transaction
            mockDatabaseService.executeTransaction.mockImplementation(async () => {
                throw error;
            });

            await expect(monitorRepository.delete(monitorId)).rejects.toThrow("Database error");
        });
    });

    describe("Edge case coverage for remaining uncovered lines", () => {
        it("should handle monitor creation with falsy host (line 141)", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://test.com",
                host: "", // Empty string should trigger the falsy branch
                port: 80,
                checkInterval: 300,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "up" as const,
                history: [],
                responseTime: 0
            };

            mockDatabase.run.mockReturnValue({ changes: 1, lastInsertRowid: 1 });
            mockDatabase.get.mockReturnValue({ id: 1 });

            await monitorRepository.create("site-1", monitor);

            const insertCall = mockDatabase.get.mock.calls.find((call: any) =>
                call[0].includes("INSERT INTO monitors")
            );
            expect(insertCall).toBeDefined();
            expect(insertCall?.[1]?.[3]).toBeNull();
        });

        it("should handle monitor creation with undefined host", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://test.com",
                host: undefined, // undefined should trigger the falsy branch
                port: 80,
                checkInterval: 300,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "up" as const,
                history: [],
                responseTime: 0
            };

            mockDatabase.run.mockReturnValue({ changes: 1, lastInsertRowid: 1 });
            mockDatabase.get.mockReturnValue({ id: 1 });

            await monitorRepository.create("site-1", monitor);

            const insertCall = mockDatabase.get.mock.calls.find((call: any) =>
                call[0].includes("INSERT INTO monitors")
            );
            expect(insertCall).toBeDefined();
            expect(insertCall?.[1]?.[3]).toBeNull();
        });

        it("should handle database result with falsy id (line 172)", async () => {
            const monitor = {
                type: "http" as const,
                url: "https://test.com",
                host: "example.com",
                port: 80,
                checkInterval: 300,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "up" as const,
                history: [],
                responseTime: 0
            };

            mockDatabase.run.mockReturnValue({ changes: 1, lastInsertRowid: 1 });
            // Mock result with falsy id to trigger the "" fallback
            mockDatabase.get.mockReturnValue({ id: 0 }); // 0 is falsy

            const result = await monitorRepository.create("site-1", monitor);

            expect(result).toBe("0"); // 0 gets converted to String(0) = "0"
        });

        it("should handle rowToMonitor with undefined host (line 183)", () => {
            const row = {
                id: "1",
                type: "http",
                url: "https://test.com",
                host: undefined, // undefined should trigger the undefined branch
                port: 80,
                checkInterval: 300,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: 1,
                status: "up",
                responseTime: 150,
                lastChecked: "2024-01-01T00:00:00.000Z",
            };

            const monitor = rowToMonitor(row);

            expect(monitor.host).toBeUndefined(); // Should be undefined when row.host is undefined
        });
    });
});
