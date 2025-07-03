/**
 * Tests for ConfigurationManager class.
 * Tests business rules, validation, and configuration management.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConfigurationManager, configurationManager } from "../../managers/ConfigurationManager";
import type { Site } from "../../types";

// Mock isDev utility
vi.mock("../../utils", () => ({
    isDev: vi.fn(() => false),
}));

describe("ConfigurationManager", () => {
    let manager: ConfigurationManager;

    beforeEach(() => {
        manager = new ConfigurationManager();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("Default configuration", () => {
        it("should return default monitor interval", () => {
            const interval = manager.getDefaultMonitorInterval();
            expect(interval).toBe(300000); // 5 minutes from constants
        });

        it("should return history retention rules", () => {
            const rules = manager.getHistoryRetentionRules();
            expect(rules).toEqual({
                defaultLimit: 1000,
                maxLimit: 10000,
                minLimit: 100,
            });
        });

        it("should return minimum check interval", () => {
            const minInterval = manager.getMinimumCheckInterval();
            expect(minInterval).toBe(1000);
        });

        it("should return minimum timeout", () => {
            const minTimeout = manager.getMinimumTimeout();
            expect(minTimeout).toBe(1000);
        });

        it("should return maximum port number", () => {
            const maxPort = manager.getMaximumPortNumber();
            expect(maxPort).toBe(65535);
        });
    });

    describe("Auto-start monitoring business rules", () => {
        it("should not auto-start in development mode", async () => {
            const { isDev } = await import("../../utils");
            vi.mocked(isDev).mockReturnValue(true);

            const site: Site = {
                identifier: "test-site",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        status: "pending",
                        history: [],
                    },
                ],
            };

            const shouldStart = manager.shouldAutoStartMonitoring(site);
            expect(shouldStart).toBe(false);
        });

        it("should not auto-start for sites with no monitors", () => {
            const site: Site = {
                identifier: "test-site",
                monitors: [],
            };

            const shouldStart = manager.shouldAutoStartMonitoring(site);
            expect(shouldStart).toBe(false);
        });

        it("should respect explicit monitoring property when false", () => {
            const site: Site = {
                identifier: "test-site",
                monitoring: false,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        status: "pending",
                        history: [],
                    },
                ],
            };

            const shouldStart = manager.shouldAutoStartMonitoring(site);
            expect(shouldStart).toBe(false);
        });

        it("should respect explicit monitoring property when true", () => {
            const site: Site = {
                identifier: "test-site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        status: "pending",
                        history: [],
                    },
                ],
            };

            const shouldStart = manager.shouldAutoStartMonitoring(site);
            expect(shouldStart).toBe(true);
        });

        it("should auto-start by default for sites with monitors", () => {
            const site: Site = {
                identifier: "test-site",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        status: "pending",
                        history: [],
                    },
                ],
            };

            const shouldStart = manager.shouldAutoStartMonitoring(site);
            expect(shouldStart).toBe(true);
        });
    });

    describe("Default interval business rules", () => {
        it("should apply default interval when monitor has no checkInterval", () => {
            const monitor = {
                id: "monitor-1",
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
            };

            const shouldApply = manager.shouldApplyDefaultInterval(monitor);
            expect(shouldApply).toBe(true);
        });

        it("should not apply default interval when monitor has checkInterval", () => {
            const monitor = {
                id: "monitor-1",
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
                checkInterval: 60000,
            };

            const shouldApply = manager.shouldApplyDefaultInterval(monitor);
            expect(shouldApply).toBe(false);
        });

        it("should apply default interval when checkInterval is 0", () => {
            const monitor = {
                id: "monitor-1",
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
                checkInterval: 0,
            };

            const shouldApply = manager.shouldApplyDefaultInterval(monitor);
            expect(shouldApply).toBe(true);
        });
    });

    describe("Site validation", () => {
        it("should validate a correct site", () => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        status: "pending",
                        history: [],
                    },
                ],
            };

            const result = manager.validateSiteConfiguration(site);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should reject site with no identifier", () => {
            const site: Site = {
                identifier: "",
                monitors: [],
            };

            const result = manager.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Site identifier cannot be empty");
        });

        it("should reject site with undefined identifier", () => {
            const site = {
                identifier: undefined,
                monitors: [],
            } as unknown as Site;

            const result = manager.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Site identifier is required");
        });

        it("should reject site with non-array monitors", () => {
            const site = {
                identifier: "test-site",
                monitors: "not-an-array",
            } as unknown as Site;

            const result = manager.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Site monitors must be an array");
        });

        it("should validate monitors within site", () => {
            const site: Site = {
                identifier: "test-site",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        status: "pending",
                        history: [],
                    },
                    {
                        id: "monitor-2",
                        type: "port",
                        host: "localhost",
                        port: 8080,
                        status: "pending",
                        history: [],
                    },
                ],
            };

            const result = manager.validateSiteConfiguration(site);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should reject site with invalid monitors", () => {
            const site: Site = {
                identifier: "test-site",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        // Missing URL
                        status: "pending",
                        history: [],
                    } as unknown as Site["monitors"][0],
                    {
                        id: "monitor-2",
                        type: "port",
                        host: "localhost",
                        port: -1, // Invalid port
                        status: "pending",
                        history: [],
                    },
                ],
            };

            const result = manager.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Monitor 1: HTTP monitors must have a URL");
            expect(result.errors).toContain("Monitor 2: Port monitors must have a valid port number (1-65535)");
        });
    });

    describe("Monitor validation", () => {
        it("should validate HTTP monitor", () => {
            const monitor = {
                id: "monitor-1",
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
            };

            const result = manager.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should validate port monitor", () => {
            const monitor = {
                id: "monitor-1",
                type: "port" as const,
                host: "localhost",
                port: 8080,
                status: "pending" as const,
                history: [],
            };

            const result = manager.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should reject monitor with no type", () => {
            const monitor = {
                id: "monitor-1",
                status: "pending" as const,
                history: [],
            } as unknown as Site["monitors"][0];

            const result = manager.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Monitor type is required");
        });

        it("should reject HTTP monitor with no URL", () => {
            const monitor = {
                id: "monitor-1",
                type: "http" as const,
                status: "pending" as const,
                history: [],
            };

            const result = manager.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("HTTP monitors must have a URL");
        });

        it("should reject port monitor with no host", () => {
            const monitor = {
                id: "monitor-1",
                type: "port" as const,
                port: 8080,
                status: "pending" as const,
                history: [],
            };

            const result = manager.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Port monitors must have a host");
        });

        it("should reject port monitor with invalid port", () => {
            const monitor = {
                id: "monitor-1",
                type: "port" as const,
                host: "localhost",
                port: 0,
                status: "pending" as const,
                history: [],
            };

            const result = manager.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Port monitors must have a valid port number (1-65535)");
        });

        it("should reject port monitor with port too high", () => {
            const monitor = {
                id: "monitor-1",
                type: "port" as const,
                host: "localhost",
                port: 70000,
                status: "pending" as const,
                history: [],
            };

            const result = manager.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Port monitors must have a valid port number (1-65535)");
        });

        it("should reject monitor with invalid check interval", () => {
            const monitor = {
                id: "monitor-1",
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
                checkInterval: 500, // Too low
            };

            const result = manager.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Monitor check interval must be at least 1000ms");
        });

        it("should reject monitor with invalid timeout", () => {
            const monitor = {
                id: "monitor-1",
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
                timeout: 500, // Too low
            };

            const result = manager.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Monitor timeout must be at least 1000ms");
        });

        it("should reject monitor with negative retry attempts", () => {
            const monitor = {
                id: "monitor-1",
                type: "http" as const,
                url: "https://example.com",
                status: "pending" as const,
                history: [],
                retryAttempts: -1,
            };

            const result = manager.validateMonitorConfiguration(monitor);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Monitor retry attempts cannot be negative");
        });
    });

    describe("Export business rules", () => {
        it("should include site with valid identifier", () => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
            };

            const shouldInclude = manager.shouldIncludeInExport(site);
            expect(shouldInclude).toBe(true);
        });

        it("should exclude site with empty identifier", () => {
            const site: Site = {
                identifier: "",
                monitors: [],
            };

            const shouldInclude = manager.shouldIncludeInExport(site);
            expect(shouldInclude).toBe(false);
        });

        it("should exclude site with whitespace-only identifier", () => {
            const site: Site = {
                identifier: "   ",
                monitors: [],
            };

            const shouldInclude = manager.shouldIncludeInExport(site);
            expect(shouldInclude).toBe(false);
        });
    });

    describe("Singleton instance", () => {
        it("should provide singleton instance", () => {
            expect(configurationManager).toBeInstanceOf(ConfigurationManager);
        });

        it("should be the same instance on multiple imports", async () => {
            // Test that the singleton is consistent
            const instance1 = configurationManager;
            const { configurationManager: instance2 } = await import("../../managers/ConfigurationManager");
            expect(instance1).toBe(instance2);
        });
    });
});
