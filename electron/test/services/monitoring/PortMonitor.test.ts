import { beforeEach, describe, expect, it, vi } from "vitest";

import { PortMonitor } from "../../../services/monitoring/PortMonitor";
import { MonitorCheckResult, MonitorConfig } from "../../../services/monitoring/types";
import { Site } from "../../../types";
import { DEFAULT_REQUEST_TIMEOUT } from "../../../constants";

// Mock dependencies
vi.mock("../../../services/monitoring/utils", () => ({
    performPortCheckWithRetry: vi.fn(),
}));

describe("PortMonitor", () => {
    let portMonitor: PortMonitor;
    const mockConfig: MonitorConfig = {
        timeout: 10000,
        userAgent: "Test Agent",
    };

    const mockPortMonitor: Site["monitors"][0] = {
        id: "1",
        type: "port",
        host: "example.com",
        port: 80,
        checkInterval: 300000,
        timeout: 5000,
        retryAttempts: 3,
        monitoring: true,
        status: "up",
        history: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        portMonitor = new PortMonitor(mockConfig);
    });

    describe("constructor", () => {
        it("should initialize with provided config", () => {
            const customPortMonitor = new PortMonitor(mockConfig);
            expect(customPortMonitor).toBeInstanceOf(PortMonitor);
        });

        it("should initialize with default config when none provided", () => {
            const defaultPortMonitor = new PortMonitor();
            expect(defaultPortMonitor).toBeInstanceOf(PortMonitor);
        });

        it("should merge provided config with defaults", () => {
            const partialConfig = { timeout: 15000 };
            const customPortMonitor = new PortMonitor(partialConfig);
            expect(customPortMonitor).toBeInstanceOf(PortMonitor);
        });
    });

    describe("getType", () => {
        it("should return port as monitor type", () => {
            expect(portMonitor.getType()).toBe("port");
        });
    });

    describe("check", () => {
        it("should throw error for non-port monitor type", async () => {
            const httpMonitor: Site["monitors"][0] = {
                ...mockPortMonitor,
                type: "http",
            };

            await expect(portMonitor.check(httpMonitor)).rejects.toThrow(
                "PortMonitor cannot handle monitor type: http"
            );
        });

        it("should return error when host is missing", async () => {
            const monitorWithoutHost: Site["monitors"][0] = {
                ...mockPortMonitor,
                host: undefined,
            };

            const result = await portMonitor.check(monitorWithoutHost);

            expect(result).toEqual({
                details: "0",
                error: "Port monitor missing host or port",
                responseTime: 0,
                status: "down",
            });
        });

        it("should return error when port is missing", async () => {
            const monitorWithoutPort: Site["monitors"][0] = {
                ...mockPortMonitor,
                port: undefined,
            };

            const result = await portMonitor.check(monitorWithoutPort);

            expect(result).toEqual({
                details: "0",
                error: "Port monitor missing host or port",
                responseTime: 0,
                status: "down",
            });
        });

        it("should perform successful port check", async () => {
            const mockResult: MonitorCheckResult = {
                status: "up",
                responseTime: 150,
                details: "80",
            };

            // Mock the utility function to return success
            const { performPortCheckWithRetry } = await import("../../../services/monitoring/utils");
            vi.mocked(performPortCheckWithRetry).mockResolvedValue(mockResult);

            const result = await portMonitor.check(mockPortMonitor);

            expect(performPortCheckWithRetry).toHaveBeenCalledWith(
                "example.com",
                80,
                5000, // timeout (from mockPortMonitor.timeout)
                3 // retryAttempts
            );
            expect(result).toEqual(mockResult);
        });

        it("should use monitor timeout when provided", async () => {
            const mockResult: MonitorCheckResult = {
                status: "up",
                responseTime: 100,
                details: "Port reachable",
            };

            // Mock the utility function to return success
            const { performPortCheckWithRetry } = await import("../../../services/monitoring/utils");
            vi.mocked(performPortCheckWithRetry).mockResolvedValue(mockResult);

            await portMonitor.check(mockPortMonitor);

            expect(performPortCheckWithRetry).toHaveBeenCalledWith(
                "example.com",
                80,
                5000, // timeout (from mockPortMonitor.timeout)
                3 // retryAttempts
            );
        });

        it("should use default timeout when monitor timeout is not provided", async () => {
            const monitorWithoutTimeout: Site["monitors"][0] = {
                ...mockPortMonitor,
                timeout: undefined,
            };

            const mockResult: MonitorCheckResult = {
                status: "up",
                responseTime: 100,
                details: "Port reachable",
            };

            // Mock the utility function to return success
            const { performPortCheckWithRetry } = await import("../../../services/monitoring/utils");
            vi.mocked(performPortCheckWithRetry).mockResolvedValue(mockResult);

            await portMonitor.check(monitorWithoutTimeout);

            expect(performPortCheckWithRetry).toHaveBeenCalledWith(
                "example.com",
                80,
                10000, // Should use default timeout from config
                3 // retryAttempts
            );
        });

        it("should use config timeout when monitor timeout is undefined and config timeout is set", async () => {
            // Line 67: testing monitor.timeout ?? this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT
            const monitorWithoutTimeout: Site["monitors"][0] = {
                ...mockPortMonitor,
                timeout: undefined, // This should fallback to config.timeout
            };

            const mockResult: MonitorCheckResult = {
                status: "up",
                responseTime: 100,
                details: "Port reachable",
            };

            // Mock the utility function to return success
            const { performPortCheckWithRetry } = await import("../../../services/monitoring/utils");
            vi.mocked(performPortCheckWithRetry).mockResolvedValue(mockResult);

            await portMonitor.check(monitorWithoutTimeout);

            // Verify that the config timeout (10000) was used in the function call
            expect(performPortCheckWithRetry).toHaveBeenCalledWith(
                "example.com",
                80,
                10000, // Should use config timeout
                3 // retryAttempts
            );
        });
        it("should use DEFAULT_REQUEST_TIMEOUT when both monitor and config timeout are undefined", async () => {
            // Create a new port monitor without timeout in config
            const configWithoutTimeout: MonitorConfig = {
                userAgent: "Test Agent",
                // No timeout property
            };
            const portMonitorNoTimeout = new PortMonitor(configWithoutTimeout);

            const monitorWithoutTimeout: Site["monitors"][0] = {
                ...mockPortMonitor,
                timeout: undefined, // This should fallback to config.timeout, then DEFAULT_REQUEST_TIMEOUT
            };

            const mockResult: MonitorCheckResult = {
                status: "up",
                responseTime: 100,
                details: "Port reachable",
            };

            // Mock the utility function to return success
            const { performPortCheckWithRetry } = await import("../../../services/monitoring/utils");
            vi.mocked(performPortCheckWithRetry).mockResolvedValue(mockResult);

            await portMonitorNoTimeout.check(monitorWithoutTimeout);

            // Verify that the DEFAULT_REQUEST_TIMEOUT was used in the function call
            expect(performPortCheckWithRetry).toHaveBeenCalledWith(
                "example.com",
                80,
                DEFAULT_REQUEST_TIMEOUT, // Should use default when both are undefined
                3 // retryAttempts
            );
        });
    });

    describe("updateConfig", () => {
        it("should update monitor configuration", () => {
            const newConfig: MonitorConfig = {
                timeout: 20000,
                userAgent: "New Agent",
            };

            expect(() => portMonitor.updateConfig(newConfig)).not.toThrow();
        });

        it("should accept partial config updates", () => {
            const partialConfig = { timeout: 8000 };

            expect(() => portMonitor.updateConfig(partialConfig)).not.toThrow();
        });

        it("should accept empty config updates", () => {
            expect(() => portMonitor.updateConfig({})).not.toThrow();
        });
    });

    describe("getConfig", () => {
        it("should return current configuration", () => {
            const config = portMonitor.getConfig();

            expect(config).toEqual({
                timeout: 10000,
                userAgent: "Test Agent",
            });
        });

        it("should return a copy of the configuration", () => {
            const config1 = portMonitor.getConfig();
            const config2 = portMonitor.getConfig();

            expect(config1).toEqual(config2);
            expect(config1).not.toBe(config2); // Should be different objects
        });

        it("should reflect config updates", () => {
            portMonitor.updateConfig({ timeout: 15000 });
            const config = portMonitor.getConfig();

            expect(config.timeout).toBe(15000);
            expect(config.userAgent).toBe("Test Agent");
        });
    });
});
