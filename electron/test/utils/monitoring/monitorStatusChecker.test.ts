import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

import { DEFAULT_REQUEST_TIMEOUT } from "../../../constants";
import { MonitorFactory } from "../../../services/monitoring/MonitorFactory";
import { IMonitorService } from "../../../services/monitoring/types";
import { Site, Monitor } from "../../../types";
import { checkMonitor, MonitorCheckConfig } from "../../../utils/monitoring/monitorStatusChecker";

// Mock the MonitorFactory
vi.mock("../../../services/monitoring/MonitorFactory", () => ({
    MonitorFactory: {
        getMonitor: vi.fn(),
    },
}));

// Mock logger
vi.mock("../../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe("monitorStatusChecker", () => {
    let mockMonitorService: IMonitorService;
    let mockConfig: MonitorCheckConfig;
    let mockSite: Site;

    beforeEach(() => {
        vi.clearAllMocks();

        mockMonitorService = {
            check: vi.fn().mockResolvedValue({
                status: "up",
                responseTime: 100,
                details: "OK",
            }),
            updateConfig: vi.fn(),
            getType: vi.fn().mockReturnValue("http"),
            getConfig: vi.fn().mockReturnValue({}),
        } as IMonitorService;

        (MonitorFactory.getMonitor as unknown as Mock).mockReturnValue(mockMonitorService);

        mockSite = {
            identifier: "test-site",
            name: "Test Site",
            monitors: [
                {
                    id: "1",
                    type: "http",
                    url: "https://example.com",
                    monitoring: true,
                    timeout: 5000, // Custom timeout
                    status: "down",
                    history: [],
                },
            ],
        };

        mockConfig = {
            repositories: {
                history: {
                    addEntry: vi.fn().mockResolvedValue(undefined),
                    pruneHistory: vi.fn().mockResolvedValue(undefined),
                } as any,
                monitor: {
                    update: vi.fn().mockResolvedValue(undefined),
                } as any,
                site: {
                    // Return synchronously, not as a Promise
                    getByIdentifier: vi.fn().mockImplementation(() => mockSite),
                } as any,
            },
            sites: new Map(),
            eventEmitter: {
                emit: vi.fn(),
                emitTyped: vi.fn(), // <-- Add this line to mock emitTyped
            } as any,
            logger: {
                info: vi.fn(),
                error: vi.fn(),
                debug: vi.fn(),
                warn: vi.fn(),
            },
            historyLimit: 100,
            databaseService: {
                executeTransaction: vi.fn().mockImplementation(async (cb) => cb()),
                // Add other methods if needed for future tests
            } as any,
        };
    });

    describe("checkMonitor", () => {
        it("should pass monitor timeout to MonitorFactory when monitor has custom timeout", async () => {
            const monitorId = "1";
            const customTimeout = 5000;

            // Set custom timeout on monitor
            if (mockSite.monitors[0]) {
                mockSite.monitors[0].timeout = customTimeout;
            }

            await checkMonitor(mockConfig, mockSite, monitorId);

            expect(MonitorFactory.getMonitor).toHaveBeenCalledWith("http", {
                timeout: customTimeout,
            });
        });

        it.skip("should pass default timeout to MonitorFactory when monitor has no custom timeout", async () => {
            const monitorId = "1";

            // Remove custom timeout
            if (mockSite.monitors[0]) {
                delete mockSite.monitors[0].timeout;
            }

            await checkMonitor(mockConfig, mockSite, monitorId);

            expect(MonitorFactory.getMonitor).toHaveBeenCalledWith("http", {
                timeout: DEFAULT_REQUEST_TIMEOUT,
            });
        });

        it.skip("should handle undefined timeout by using default", async () => {
            const monitorId = "1";

            // Set undefined timeout
            if (mockSite.monitors[0]) {
                mockSite.monitors[0].timeout = undefined;
            }

            await checkMonitor(mockConfig, mockSite, monitorId);

            expect(MonitorFactory.getMonitor).toHaveBeenCalledWith("http", {
                timeout: DEFAULT_REQUEST_TIMEOUT,
            });
        });

        it("should handle different monitor types with custom timeouts", async () => {
            const monitorId = "1";
            const customTimeout = 8000;

            // Set up port monitor with custom timeout
            mockSite.monitors[0] = {
                id: "1",
                type: "port",
                host: "example.com",
                port: 80,
                monitoring: true,
                timeout: customTimeout,
                status: "down",
                history: [],
            };

            await checkMonitor(mockConfig, mockSite, monitorId);

            expect(MonitorFactory.getMonitor).toHaveBeenCalledWith("port", {
                timeout: customTimeout,
            });
        });
    });

    describe("checkMonitor error conditions", () => {
        it("should handle monitor not found", async () => {
            const nonExistentMonitorId = "999";

            const result = await checkMonitor(mockConfig, mockSite, nonExistentMonitorId);

            expect(result).toBeUndefined();
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                `[checkMonitor] Monitor not found for id: ${nonExistentMonitorId} on site: ${mockSite.identifier}`
            );
        });

        it("should handle monitor with missing id", async () => {
            const monitorId = "undefined"; // This will match String(undefined)

            // Create a monitor without an id
            const originalMonitor = mockSite.monitors[0];
            if (originalMonitor) {
                mockSite.monitors[0] = {
                    ...originalMonitor,

                    id: undefined as any,
                } as Monitor;
            }

            const result = await checkMonitor(mockConfig, mockSite, monitorId);

            expect(result).toBeUndefined();
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                `[checkMonitor] Monitor missing id for ${mockSite.identifier}, skipping history insert.`
            );
        });

        it("should handle monitor with null id", async () => {
            const monitorId = "null"; // This will match String(null)

            // Create a monitor with null id
            const originalMonitor = mockSite.monitors[0];
            if (originalMonitor) {
                mockSite.monitors[0] = {
                    ...originalMonitor,

                    id: null as any,
                } as Monitor;
            }

            const result = await checkMonitor(mockConfig, mockSite, monitorId);

            expect(result).toBeUndefined();
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                `[checkMonitor] Monitor missing id for ${mockSite.identifier}, skipping history insert.`
            );
        });

        it("should handle monitor with empty string id", async () => {
            const monitorId = ""; // This will match String("")

            // Create a monitor with empty string id
            const originalMonitor = mockSite.monitors[0];
            if (originalMonitor) {
                mockSite.monitors[0] = {
                    ...originalMonitor,
                    id: "",
                } as Monitor;
            }

            const result = await checkMonitor(mockConfig, mockSite, monitorId);

            expect(result).toBeUndefined();
            expect(mockConfig.logger.error).toHaveBeenCalledWith(
                `[checkMonitor] Monitor missing id for ${mockSite.identifier}, skipping history insert.`
            );
        });
    });
});
