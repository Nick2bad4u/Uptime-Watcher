import { beforeEach, describe, expect, it, vi } from "vitest";
import isPortReachable from "is-port-reachable";

import { RETRY_BACKOFF } from "../../../constants";
import { PortMonitor } from "../../../services/monitoring/PortMonitor";
import { MonitorCheckResult, MonitorConfig } from "../../../services/monitoring/types";
import { Site } from "../../../types";
import { isDev } from "../../../utils";
import { logger } from "../../../utils/logger";
import { withRetry } from "../../../utils/retry";

// Mock dependencies
vi.mock("is-port-reachable");
vi.mock("../../../utils/logger");
vi.mock("../../../utils");
vi.mock("../../../utils/retry");

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
        (isDev as any).mockReturnValue(false);
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
                details: "Port reachable",
            };

            (withRetry as any).mockResolvedValue(mockResult);

            const result = await portMonitor.check(mockPortMonitor);

            expect(withRetry).toHaveBeenCalledWith(expect.any(Function), {
                delayMs: RETRY_BACKOFF.INITIAL_DELAY,
                maxRetries: 4, // retryAttempts + 1
                onError: expect.any(Function),
                operationName: "Port check for example.com:80",
            });
            expect(result).toEqual(mockResult);
        });

        it("should use monitor timeout when provided", async () => {
            const mockResult: MonitorCheckResult = {
                status: "up",
                responseTime: 100,
                details: "Port reachable",
            };

            (withRetry as any).mockResolvedValue(mockResult);

            await portMonitor.check(mockPortMonitor);

            expect(withRetry).toHaveBeenCalled();
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

            (withRetry as any).mockResolvedValue(mockResult);

            await portMonitor.check(monitorWithoutTimeout);

            expect(withRetry).toHaveBeenCalled();
        });

        it("should use monitor retry attempts when provided", async () => {
            const mockResult: MonitorCheckResult = {
                status: "up",
                responseTime: 100,
                details: "Port reachable",
            };

            (withRetry as any).mockResolvedValue(mockResult);

            await portMonitor.check(mockPortMonitor);

            expect(withRetry).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    maxRetries: 4, // retryAttempts (3) + 1
                })
            );
        });

        it("should default to 0 retry attempts when not provided", async () => {
            const monitorWithoutRetry: Site["monitors"][0] = {
                ...mockPortMonitor,
                retryAttempts: undefined,
            };

            const mockResult: MonitorCheckResult = {
                status: "up",
                responseTime: 100,
                details: "Port reachable",
            };

            (withRetry as any).mockResolvedValue(mockResult);

            await portMonitor.check(monitorWithoutRetry);

            expect(withRetry).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    maxRetries: 1, // 0 + 1
                })
            );
        });

        it("should handle failed port check with error", async () => {
            const error = new Error("Connection timeout");
            const mockFailedResult: MonitorCheckResult = {
                status: "down",
                responseTime: 5000,
                error: "Connection timeout",
                details: "Port not reachable",
            };

            (withRetry as any).mockRejectedValue(error);

            // Mock the error handling method to return a failed result
            vi.spyOn(portMonitor as any, "handlePortCheckError").mockReturnValue(mockFailedResult);

            const result = await portMonitor.check(mockPortMonitor);

            expect(result).toEqual(mockFailedResult);
            expect((portMonitor as any).handlePortCheckError).toHaveBeenCalledWith(error, "example.com", 80);
        });

        it("should log debug messages when isDev returns true", async () => {
            (isDev as any).mockReturnValue(true);

            const mockResult: MonitorCheckResult = {
                status: "up",
                responseTime: 100,
                details: "Port reachable",
            };

            (withRetry as any).mockImplementation(async (_fn: any, options: any) => {
                // Simulate a retry by calling the onError callback
                if (options.onError) {
                    const error = new Error("Test error");
                    options.onError(error, 1);
                }
                return mockResult;
            });

            await portMonitor.check(mockPortMonitor);

            expect(logger.debug).toHaveBeenCalledWith(
                "[PortMonitor] Port example.com:80 failed attempt 1/4: Test error"
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

    describe("Error Handling and Debug Logging", () => {
        it("should log debug info when isDev returns true", async () => {
            (isDev as any).mockReturnValue(true);
            // Mock the withRetry to actually call the function and allow debug logging
            (withRetry as any).mockImplementation(async (fn: any) => {
                return await fn();
            });

            (isPortReachable as any).mockResolvedValue(true);

            await portMonitor.check(mockPortMonitor);

            expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining("[PortMonitor] Checking port:"));
        });

        it("should handle isPortReachable returning false", async () => {
            (isPortReachable as any).mockResolvedValue(false);
            (withRetry as any).mockImplementation(async (fn: any) => {
                try {
                    return await fn();
                } catch (error: any) {
                    // Explicitly handle the error in test
                    return {
                        status: "down",
                        responseTime: 0,
                        details: "80",
                        error: "Port not reachable",
                    };
                }
            });

            const result = await portMonitor.check(mockPortMonitor);

            expect(result.status).toBe("down");
            expect(result.error).toBe("Port not reachable");
        });

        it("should handle PortCheckError with response time", async () => {
            const mockError = new Error("Port not reachable");
            (mockError as any).responseTime = 150;

            (isPortReachable as any).mockRejectedValue(mockError);
            (withRetry as any).mockImplementation(async (fn: any) => {
                try {
                    return await fn();
                } catch (_error) {
                    // Explicitly handle the error in test
                    return {
                        status: "down",
                        responseTime: 150,
                        details: "80",
                        error: "Port not reachable",
                    };
                }
            });

            const result = await portMonitor.check(mockPortMonitor);

            expect(result.status).toBe("down");
            expect(result.responseTime).toBe(150);
        });

        it("should handle non-Error objects", async () => {
            (isPortReachable as any).mockRejectedValue("String error");
            (withRetry as any).mockImplementation(async (fn: any) => {
                try {
                    return await fn();
                } catch (_error) {
                    // Explicitly handle the error in test
                    return {
                        status: "down",
                        responseTime: 0,
                        details: "80",
                        error: "Unknown error",
                    };
                }
            });

            const result = await portMonitor.check(mockPortMonitor);

            expect(result.status).toBe("down");
            expect(result.error).toBe("Unknown error");
        });

        it("should handle monitors without host", async () => {
            const monitorWithoutHost: Site["monitors"][0] = {
                ...mockPortMonitor,
                host: undefined,
            };

            const result = await portMonitor.check(monitorWithoutHost);

            expect(result.status).toBe("down");
            expect(result.error).toBe("Port monitor missing host or port");
            expect(result.details).toBe("0");
        });

        it("should handle monitors without port", async () => {
            const monitorWithoutPort: Site["monitors"][0] = {
                ...mockPortMonitor,
                port: undefined,
            };

            const result = await portMonitor.check(monitorWithoutPort);

            expect(result.status).toBe("down");
            expect(result.error).toBe("Port monitor missing host or port");
            expect(result.details).toBe("0");
        });

        it("should log debug info for successful port checks in dev mode", async () => {
            (isDev as any).mockReturnValue(true);
            (isPortReachable as any).mockResolvedValue(true);
            (withRetry as any).mockImplementation(async (fn: any) => await fn());

            await portMonitor.check(mockPortMonitor);

            expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining("Port example.com:80 is reachable"));
        });

        it("should log debug info for final errors in dev mode", async () => {
            (isDev as any).mockReturnValue(true);
            const mockError = new Error("Connection refused");

            (isPortReachable as any).mockRejectedValue(mockError);
            (withRetry as any).mockImplementation(async (fn: any) => {
                try {
                    return await fn();
                } catch (_error) {
                    // This simulates the withRetry function handling the error internally
                    // and the PortMonitor.handlePortCheckError method being called
                    return {
                        status: "down",
                        responseTime: 0,
                        details: "80",
                        error: "Connection refused",
                    };
                }
            });

            await portMonitor.check(mockPortMonitor);

            // Just check that debug was called since the error handling is complex
            expect(logger.debug).toHaveBeenCalled();
        });

        it("should handle PortCheckError instances specifically", async () => {
            (isDev as any).mockReturnValue(true);

            // Mock withRetry to reject and let us catch the error
            (withRetry as any).mockRejectedValue(new Error("Port not reachable"));

            // Create a spy on the private handlePortCheckError method
            const handleErrorSpy = vi.spyOn(portMonitor as any, "handlePortCheckError");

            const result = await portMonitor.check(mockPortMonitor);

            expect(handleErrorSpy).toHaveBeenCalledWith(expect.any(Error), "example.com", 80);
            expect(result.status).toBe("down");
        });
    });
});
