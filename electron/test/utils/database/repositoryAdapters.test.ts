/**
 * Tests for repositoryAdapters utility classes.
 * Validates adapter functionality and interface compliance.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
    SiteRepositoryAdapter,
    MonitorRepositoryAdapter,
    HistoryRepositoryAdapter,
    SettingsRepositoryAdapter,
    LoggerAdapter,
} from "../../../utils/database/repositoryAdapters";
import type { Monitor, StatusHistory, MonitorType } from "../../../types";

// Mock external dependencies
vi.mock("../../../services/database", () => ({
    SiteRepository: vi.fn().mockImplementation(() => ({
        findAll: vi.fn(),
        findByIdentifier: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
    })),
    MonitorRepository: vi.fn().mockImplementation(() => ({
        findBySiteIdentifier: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteBySiteIdentifier: vi.fn(),
    })),
    HistoryRepository: vi.fn().mockImplementation(() => ({
        findByMonitorId: vi.fn(),
        addEntry: vi.fn(),
        deleteByMonitorId: vi.fn(),
    })),
    SettingsRepository: vi.fn().mockImplementation(() => ({
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
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

describe("repositoryAdapters", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("SiteRepositoryAdapter", () => {
        let mockRepository: {
            findAll: ReturnType<typeof vi.fn>;
            findByIdentifier: ReturnType<typeof vi.fn>;
            upsert: ReturnType<typeof vi.fn>;
            delete: ReturnType<typeof vi.fn>;
        };
        let adapter: SiteRepositoryAdapter;

        beforeEach(() => {
            mockRepository = {
                findAll: vi.fn(),
                findByIdentifier: vi.fn(),
                upsert: vi.fn(),
                delete: vi.fn(),
            };
            adapter = new SiteRepositoryAdapter(mockRepository as never);
        });

        it("should create an adapter with the provided repository", () => {
            expect(adapter).toBeDefined();
            expect(adapter).toBeInstanceOf(SiteRepositoryAdapter);
        });

        it("should delegate findAll to the underlying repository", async () => {
            const mockSites = [
                { identifier: "site1", name: "Site 1" },
                { identifier: "site2", name: "Site 2" },
            ];
            mockRepository.findAll.mockResolvedValue(mockSites);

            const result = await adapter.findAll();

            expect(mockRepository.findAll).toHaveBeenCalledOnce();
            expect(result).toBe(mockSites);
        });

        it("should delegate findByIdentifier to the underlying repository", async () => {
            const mockSite = { identifier: "site1", name: "Site 1" };
            mockRepository.findByIdentifier.mockResolvedValue(mockSite);

            const result = await adapter.findByIdentifier("site1");

            expect(mockRepository.findByIdentifier).toHaveBeenCalledWith("site1");
            expect(result).toBe(mockSite);
        });

        it("should delegate upsert to the underlying repository", async () => {
            const siteData = { identifier: "site1", name: "Site 1" };
            mockRepository.upsert.mockResolvedValue(undefined);

            await adapter.upsert(siteData);

            expect(mockRepository.upsert).toHaveBeenCalledWith(siteData);
        });

        it("should delegate delete to the underlying repository", async () => {
            mockRepository.delete.mockResolvedValue(true);

            const result = await adapter.delete("site1");

            expect(mockRepository.delete).toHaveBeenCalledWith("site1");
            expect(result).toBe(true);
        });
    });

    describe("MonitorRepositoryAdapter", () => {
        let mockRepository: {
            findBySiteIdentifier: ReturnType<typeof vi.fn>;
            create: ReturnType<typeof vi.fn>;
            update: ReturnType<typeof vi.fn>;
            delete: ReturnType<typeof vi.fn>;
            deleteBySiteIdentifier: ReturnType<typeof vi.fn>;
        };
        let adapter: MonitorRepositoryAdapter;

        beforeEach(() => {
            mockRepository = {
                findBySiteIdentifier: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
                deleteBySiteIdentifier: vi.fn(),
            };
            adapter = new MonitorRepositoryAdapter(mockRepository as never);
        });

        it("should create an adapter with the provided repository", () => {
            expect(adapter).toBeDefined();
            expect(adapter).toBeInstanceOf(MonitorRepositoryAdapter);
        });

        it("should delegate findBySiteIdentifier to the underlying repository", async () => {
            const mockMonitors: Monitor[] = [
                {
                    id: "monitor1",
                    type: "http" as MonitorType,
                    status: "up",
                    url: "https://example.com",
                    history: [],
                },
            ];
            mockRepository.findBySiteIdentifier.mockResolvedValue(mockMonitors);

            const result = await adapter.findBySiteIdentifier("site1");

            expect(mockRepository.findBySiteIdentifier).toHaveBeenCalledWith("site1");
            expect(result).toBe(mockMonitors);
        });

        it("should delegate create to the underlying repository", async () => {
            const monitor: Monitor = {
                id: "monitor1",
                type: "http" as MonitorType,
                status: "up",
                url: "https://example.com",
                history: [],
            };
            mockRepository.create.mockResolvedValue("monitor1");

            const result = await adapter.create("site1", monitor);

            expect(mockRepository.create).toHaveBeenCalledWith("site1", monitor);
            expect(result).toBe("monitor1");
        });

        it("should delegate update to the underlying repository", async () => {
            const monitor: Monitor = {
                id: "monitor1",
                type: "http" as MonitorType,
                status: "up",
                url: "https://example.com",
                history: [],
            };
            mockRepository.update.mockResolvedValue(undefined);

            await adapter.update("monitor1", monitor);

            expect(mockRepository.update).toHaveBeenCalledWith("monitor1", monitor);
        });

        it("should delegate delete to the underlying repository", async () => {
            mockRepository.delete.mockResolvedValue(true);

            const result = await adapter.delete("monitor1");

            expect(mockRepository.delete).toHaveBeenCalledWith("monitor1");
            expect(result).toBe(true);
        });

        it("should delegate deleteBySiteIdentifier to the underlying repository", async () => {
            mockRepository.deleteBySiteIdentifier.mockResolvedValue(undefined);

            await adapter.deleteBySiteIdentifier("site1");

            expect(mockRepository.deleteBySiteIdentifier).toHaveBeenCalledWith("site1");
        });
    });

    describe("HistoryRepositoryAdapter", () => {
        let mockRepository: {
            findByMonitorId: ReturnType<typeof vi.fn>;
            addEntry: ReturnType<typeof vi.fn>;
            deleteByMonitorId: ReturnType<typeof vi.fn>;
        };
        let adapter: HistoryRepositoryAdapter;

        beforeEach(() => {
            mockRepository = {
                findByMonitorId: vi.fn(),
                addEntry: vi.fn(),
                deleteByMonitorId: vi.fn(),
            };
            adapter = new HistoryRepositoryAdapter(mockRepository as never);
        });

        it("should create an adapter with the provided repository", () => {
            expect(adapter).toBeDefined();
            expect(adapter).toBeInstanceOf(HistoryRepositoryAdapter);
        });

        it("should delegate findByMonitorId to the underlying repository", async () => {
            const mockHistory: StatusHistory[] = [
                {
                    status: "up",
                    responseTime: 100,
                    timestamp: 1704067200000, // 2024-01-01T00:00:00Z as timestamp
                },
            ];
            mockRepository.findByMonitorId.mockResolvedValue(mockHistory);

            const result = await adapter.findByMonitorId("monitor1");

            expect(mockRepository.findByMonitorId).toHaveBeenCalledWith("monitor1");
            expect(result).toBe(mockHistory);
        });

        it("should delegate create to addEntry on the underlying repository", async () => {
            const historyEntry: StatusHistory = {
                status: "up",
                responseTime: 100,
                timestamp: 1704067200000, // 2024-01-01T00:00:00Z as timestamp
            };
            mockRepository.addEntry.mockResolvedValue(undefined);

            await adapter.create("monitor1", historyEntry);

            expect(mockRepository.addEntry).toHaveBeenCalledWith("monitor1", historyEntry);
        });

        it("should delegate deleteByMonitorId to the underlying repository", async () => {
            mockRepository.deleteByMonitorId.mockResolvedValue(undefined);

            await adapter.deleteByMonitorId("monitor1");

            expect(mockRepository.deleteByMonitorId).toHaveBeenCalledWith("monitor1");
        });
    });

    describe("SettingsRepositoryAdapter", () => {
        let mockRepository: {
            get: ReturnType<typeof vi.fn>;
            set: ReturnType<typeof vi.fn>;
            delete: ReturnType<typeof vi.fn>;
        };
        let adapter: SettingsRepositoryAdapter;

        beforeEach(() => {
            mockRepository = {
                get: vi.fn(),
                set: vi.fn(),
                delete: vi.fn(),
            };
            adapter = new SettingsRepositoryAdapter(mockRepository as never);
        });

        it("should create an adapter with the provided repository", () => {
            expect(adapter).toBeDefined();
            expect(adapter).toBeInstanceOf(SettingsRepositoryAdapter);
        });

        it("should delegate get to the underlying repository and return the value", async () => {
            mockRepository.get.mockResolvedValue("test-value");

            const result = await adapter.get("test-key");

            expect(mockRepository.get).toHaveBeenCalledWith("test-key");
            expect(result).toBe("test-value");
        });

        it("should delegate get to the underlying repository and return undefined for null result", async () => {
            mockRepository.get.mockResolvedValue(null);

            const result = await adapter.get("test-key");

            expect(mockRepository.get).toHaveBeenCalledWith("test-key");
            expect(result).toBeUndefined();
        });

        it("should delegate get to the underlying repository and return undefined for undefined result", async () => {
            mockRepository.get.mockResolvedValue(undefined);

            const result = await adapter.get("test-key");

            expect(mockRepository.get).toHaveBeenCalledWith("test-key");
            expect(result).toBeUndefined();
        });

        it("should delegate set to the underlying repository", async () => {
            mockRepository.set.mockResolvedValue(undefined);

            await adapter.set("test-key", "test-value");

            expect(mockRepository.set).toHaveBeenCalledWith("test-key", "test-value");
        });

        it("should delegate delete to the underlying repository", async () => {
            mockRepository.delete.mockResolvedValue(undefined);

            await adapter.delete("test-key");

            expect(mockRepository.delete).toHaveBeenCalledWith("test-key");
        });
    });

    describe("LoggerAdapter", () => {
        let mockLogger: {
            debug: ReturnType<typeof vi.fn>;
            error: ReturnType<typeof vi.fn>;
            info: ReturnType<typeof vi.fn>;
            warn: ReturnType<typeof vi.fn>;
        };
        let adapter: LoggerAdapter;

        beforeEach(() => {
            mockLogger = {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
            };
            adapter = new LoggerAdapter(mockLogger as never);
        });

        it("should create an adapter with the provided logger", () => {
            expect(adapter).toBeDefined();
            expect(adapter).toBeInstanceOf(LoggerAdapter);
        });

        it("should delegate log methods to the underlying logger", () => {
            // Test debug method
            adapter.debug("debug message", "arg1", "arg2");
            expect(mockLogger.debug).toHaveBeenCalledWith("debug message", "arg1", "arg2");

            // Test info method
            adapter.info("test message", "arg1", "arg2");
            expect(mockLogger.info).toHaveBeenCalledWith("test message", "arg1", "arg2");

            // Verify methods exist
            expect(typeof adapter.debug).toBe("function");
            expect(typeof mockLogger.debug).toBe("function");
        });

        it("should delegate error to the underlying logger", () => {
            const error = new Error("test error");
            adapter.error("test message", error, "arg1");

            expect(mockLogger.error).toHaveBeenCalledWith("test message", error, "arg1");
        });

        it("should delegate error to the underlying logger without error parameter", () => {
            adapter.error("test message", undefined, "arg1");

            expect(mockLogger.error).toHaveBeenCalledWith("test message", undefined, "arg1");
        });

        it("should delegate info to the underlying logger", () => {
            adapter.info("test message", "arg1", "arg2");

            expect(mockLogger.info).toHaveBeenCalledWith("test message", "arg1", "arg2");
        });

        it("should delegate warn to the underlying logger", () => {
            adapter.warn("test message", "arg1", "arg2");

            expect(mockLogger.warn).toHaveBeenCalledWith("test message", "arg1", "arg2");
        });
    });
});
