/**
 * @file Critical coverage test for SiteService.ts targeting uncovered lines
 *   157-162
 *
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";

import { SiteService } from "../../stores/sites/services/SiteService";
import { logger } from "../../services/logger";
import * as storeUtils from "../../stores/utils";

// Mock the waitForElectronAPI utility
vi.mock("../../stores/utils", () => ({
    waitForElectronAPI: vi.fn().mockResolvedValue(undefined),
}));

// Mock the IPC utilities
vi.mock("../../types/ipc", () => ({
    safeExtractIpcData: vi.fn(
        (response, fallback) => response?.data || fallback
    ),
}));

// Mock the logger
vi.mock("../../services/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

const createMockSiteSnapshot = (identifier: string): Site => ({
    identifier,
    monitoring: true,
    monitors: [],
    name: `Site ${identifier}`,
});

// Set up global electronAPI mock before tests
(globalThis as any).electronAPI = {
    monitoring: {
        removeMonitor: vi.fn(),
    },
};

// Also set up window.electronAPI for JSDOM environment
(globalThis as any).window = globalThis;
(globalThis.window as any).electronAPI = {
    monitoring: {},
    sites: {
        removeMonitor: vi.fn(),
    },
};

describe("SiteService Critical Coverage Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Reset the mock functions on the global electronAPI that's already defined
        vi.mocked(
            (globalThis as any).electronAPI.sites.removeMonitor
        ).mockReset();
        vi.mocked(storeUtils.waitForElectronAPI).mockReset();

        // Set default resolved values
        vi.mocked(storeUtils.waitForElectronAPI).mockResolvedValue(undefined);
        vi.mocked(
            (globalThis as any).electronAPI.sites.removeMonitor
        ).mockResolvedValue(createMockSiteSnapshot("site-123"));
    });

    describe("removeMonitor method - Lines 157-162 Coverage", () => {
        it("should successfully remove a monitor from a site", async () => {
            // Arrange
            const siteIdentifier = "site-123";
            const monitorId = "monitor-456";

            vi.mocked(storeUtils.waitForElectronAPI).mockResolvedValue(
                undefined
            );
            const persistedSite: Site = {
                identifier: siteIdentifier,
                monitoring: true,
                monitors: [],
                name: "Site",
            };
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockResolvedValue(persistedSite);

            // Act
            const result = await SiteService.removeMonitor(
                siteIdentifier,
                monitorId
            );

            // Assert
            expect(storeUtils.waitForElectronAPI).toHaveBeenCalledTimes(1);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).toHaveBeenCalledTimes(1);
            expect(result).toEqual(persistedSite);
        });

        it("should handle initialization errors when removing monitor", async () => {
            // Arrange
            const siteIdentifier = "site-123";
            const monitorId = "monitor-456";
            const initError = new Error("Electron API initialization failed");

            vi.mocked(storeUtils.waitForElectronAPI).mockRejectedValue(
                initError
            );

            // Act & Assert
            await expect(
                SiteService.removeMonitor(siteIdentifier, monitorId)
            ).rejects.toThrow("Electron API initialization failed");

            expect(storeUtils.waitForElectronAPI).toHaveBeenCalledTimes(1);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).not.toHaveBeenCalled();
        });

        it("should handle IPC errors when removing monitor", async () => {
            // Arrange
            const siteIdentifier = "site-123";
            const monitorId = "monitor-456";
            const ipcError = new Error("IPC communication failed");

            vi.mocked(storeUtils.waitForElectronAPI).mockResolvedValue(
                undefined
            );
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockRejectedValue(ipcError);

            // Act & Assert
            await expect(
                SiteService.removeMonitor(siteIdentifier, monitorId)
            ).rejects.toThrow("IPC communication failed");

            expect(storeUtils.waitForElectronAPI).toHaveBeenCalledTimes(1);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });

        it("should handle empty string parameters", async () => {
            // Arrange
            const siteIdentifier = "";
            const monitorId = "";

            vi.mocked(storeUtils.waitForElectronAPI).mockResolvedValue(
                undefined
            );
            const persistedSite: Site = {
                identifier: siteIdentifier,
                monitoring: true,
                monitors: [],
                name: "Site",
            };
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockResolvedValue(persistedSite);

            // Act
            const result = await SiteService.removeMonitor(
                siteIdentifier,
                monitorId
            );

            // Assert
            expect(storeUtils.waitForElectronAPI).toHaveBeenCalledTimes(1);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).toHaveBeenCalledWith("", "");
            expect(result).toEqual(persistedSite);
        });

        it("should handle special characters in identifiers", async () => {
            // Arrange
            const siteIdentifier = "site-123-test@example.com";
            const monitorId = "monitor-456-special_chars!";

            vi.mocked(storeUtils.waitForElectronAPI).mockResolvedValue(
                undefined
            );
            const persistedSite: Site = {
                identifier: siteIdentifier,
                monitoring: true,
                monitors: [],
                name: "Site",
            };
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockResolvedValue(persistedSite);

            // Act
            const result = await SiteService.removeMonitor(
                siteIdentifier,
                monitorId
            );

            // Assert
            expect(storeUtils.waitForElectronAPI).toHaveBeenCalledTimes(1);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
            expect(result).toEqual(persistedSite);
        });

        it("should maintain proper async execution order", async () => {
            // Arrange
            const siteIdentifier = "site-123";
            const monitorId = "monitor-456";
            const callOrder: string[] = [];

            vi.mocked(storeUtils.waitForElectronAPI).mockImplementation(
                async () => {
                    callOrder.push("initialize");
                    return undefined;
                }
            );

            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockImplementation(async (identifier: string) => {
                callOrder.push("removeMonitor");
                return createMockSiteSnapshot(identifier ?? siteIdentifier);
            });

            // Act
            await SiteService.removeMonitor(siteIdentifier, monitorId);

            // Assert
            expect(callOrder).toEqual(["initialize", "removeMonitor"]);
        });

        it("should handle timeout scenarios", async () => {
            // Arrange
            const siteIdentifier = "site-123";
            const monitorId = "monitor-456";

            vi.mocked(storeUtils.waitForElectronAPI).mockResolvedValue(
                undefined
            );
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockImplementation(
                () =>
                    new Promise((_, reject) => {
                        setTimeout(
                            () => reject(new Error("Operation timeout")),
                            100
                        );
                    })
            );

            // Act & Assert
            await expect(
                SiteService.removeMonitor(siteIdentifier, monitorId)
            ).rejects.toThrow("Operation timeout");
        });

        it("should handle null/undefined electron API", async () => {
            // Arrange
            const siteIdentifier = "site-123";
            const monitorId = "monitor-456";

            vi.mocked(storeUtils.waitForElectronAPI).mockResolvedValue(
                undefined
            );

            // Temporarily remove the removeMonitor method
            const originalRemoveMonitor = (globalThis as any).electronAPI.sites
                .removeMonitor;
            (globalThis as any).electronAPI.sites.removeMonitor = undefined;

            try {
                // Act & Assert
                await expect(
                    SiteService.removeMonitor(siteIdentifier, monitorId)
                ).rejects.toThrow();
            } finally {
                // Restore the original method
                (globalThis as any).electronAPI.sites.removeMonitor =
                    originalRemoveMonitor;
            }
        });

        it("should throw when backend reports unsuccessful removal", async () => {
            const siteIdentifier = "site-123";
            const monitorId = "monitor-456";

            vi.mocked(storeUtils.waitForElectronAPI).mockResolvedValue(
                undefined
            );
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockResolvedValue(false);

            await expect(
                SiteService.removeMonitor(siteIdentifier, monitorId)
            ).rejects.toThrow(
                `Monitor removal returned an invalid site snapshot for ${siteIdentifier}/${monitorId}`
            );
        });
    });

    describe("Initialize method coverage", () => {
        it("should properly initialize and handle errors", async () => {
            // Arrange
            const initError = new Error("API unavailable");

            vi.mocked(storeUtils.waitForElectronAPI).mockRejectedValue(
                initError
            );

            // Act & Assert
            await expect(SiteService.initialize()).rejects.toThrow(
                "API unavailable"
            );
            expect(logger.error).toHaveBeenCalledWith(
                "[SiteService] Failed to initialize:",
                expect.any(Error)
            );
        });

        it("should successfully initialize when API is available", async () => {
            // Arrange
            vi.mocked(storeUtils.waitForElectronAPI).mockResolvedValue(
                undefined
            );

            // Act & Assert
            await expect(SiteService.initialize()).resolves.toBeUndefined();
            expect(storeUtils.waitForElectronAPI).toHaveBeenCalledTimes(1);
        });
    });

    describe("Edge Cases and Integration", () => {
        it("should handle multiple removeMonitor calls sequentially", async () => {
            // Arrange
            const operations = [
                { siteIdentifier: "site-1", monitorId: "monitor-1" },
                { siteIdentifier: "site-2", monitorId: "monitor-2" },
                { siteIdentifier: "site-3", monitorId: "monitor-3" },
            ];

            vi.mocked(storeUtils.waitForElectronAPI).mockResolvedValue(
                undefined
            );
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockImplementation(async (identifier: string) =>
                createMockSiteSnapshot(identifier)
            );

            // Act
            for (const { siteIdentifier, monitorId } of operations) {
                await SiteService.removeMonitor(siteIdentifier, monitorId);
            }

            // Assert
            expect(storeUtils.waitForElectronAPI).toHaveBeenCalledTimes(3);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).toHaveBeenCalledTimes(3);

            for (const [
                index,
                { siteIdentifier, monitorId },
            ] of operations.entries()) {
                expect(
                    (globalThis as any).electronAPI.sites.removeMonitor
                ).toHaveBeenNthCalledWith(index + 1, siteIdentifier, monitorId);
            }
        });

        it("should handle concurrent removeMonitor calls", async () => {
            // Arrange
            const operations = [
                { siteIdentifier: "site-1", monitorId: "monitor-1" },
                { siteIdentifier: "site-2", monitorId: "monitor-2" },
                { siteIdentifier: "site-3", monitorId: "monitor-3" },
            ];

            vi.mocked(storeUtils.waitForElectronAPI).mockResolvedValue(
                undefined
            );
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockImplementation(async (identifier: string) =>
                createMockSiteSnapshot(identifier)
            );

            // Act
            const promises = operations.map(({ siteIdentifier, monitorId }) =>
                SiteService.removeMonitor(siteIdentifier, monitorId)
            );

            await Promise.all(promises);

            // Assert
            expect(storeUtils.waitForElectronAPI).toHaveBeenCalledTimes(3);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).toHaveBeenCalledTimes(3);
        });

        it("should handle very long identifiers", async () => {
            // Arrange
            const longSiteId = "a".repeat(1000);
            const longMonitorId = "b".repeat(1000);

            vi.mocked(storeUtils.waitForElectronAPI).mockResolvedValue(
                undefined
            );
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockImplementation(async (identifier: string) =>
                createMockSiteSnapshot(identifier)
            );

            // Act
            await SiteService.removeMonitor(longSiteId, longMonitorId);

            // Assert
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).toHaveBeenCalledWith(longSiteId, longMonitorId);
        });
    });
});
