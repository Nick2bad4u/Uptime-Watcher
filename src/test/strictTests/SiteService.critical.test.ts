/**
 * @file Critical coverage test for SiteService.ts targeting uncovered lines
 *   157-162
 *
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";

import { SiteService } from "../../services/SiteService";
import { logger } from "../../services/logger";

const MOCK_BRIDGE_ERROR_MESSAGE =
    "ElectronAPI not available after maximum attempts. The application may not be running in an Electron environment.";

const mockWaitForElectronBridge = vi.hoisted(() => vi.fn());
const MockElectronBridgeNotReadyError = vi.hoisted(
    () =>
        class extends Error {
            public readonly diagnostics: Record<string, unknown>;

            public constructor(diagnostics: Record<string, unknown>) {
                super(MOCK_BRIDGE_ERROR_MESSAGE);
                this.name = "ElectronBridgeNotReadyError";
                this.diagnostics = diagnostics;
            }
        }
);

vi.mock("../../services/utils/electronBridgeReadiness", () => ({
    ElectronBridgeNotReadyError: MockElectronBridgeNotReadyError,
    waitForElectronBridge: mockWaitForElectronBridge,
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
    monitors: [
        {
            checkInterval: 60_000,
            history: [],
            id: `${identifier}-monitor`,
            lastChecked: new Date(),
            monitoring: true,
            responseTime: 120,
            retryAttempts: 3,
            status: "up",
            timeout: 30_000,
            type: "http",
            url: "https://example.com/status",
        },
    ],
    name: "Site",
});

// Set up global electronAPI mock before tests
(globalThis as any).electronAPI = {
    monitoring: {
        removeMonitor: vi.fn(),
    },
    sites: {
        addSite: vi.fn(),
        getSites: vi.fn(),
        removeMonitor: vi.fn(),
        removeSite: vi.fn(),
        updateSite: vi.fn(),
    },
};

// Also set up window.electronAPI for JSDOM environment
(globalThis as any).window = globalThis;
(globalThis.window as any).electronAPI = {
    monitoring: {},
    sites: {
        addSite: vi.fn(),
        getSites: vi.fn(),
        removeMonitor: vi.fn(),
        removeSite: vi.fn(),
        updateSite: vi.fn(),
    },
};

describe("SiteService Critical Coverage Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Reset the mock functions on the global electronAPI that's already defined
        vi.mocked(
            (globalThis as any).electronAPI.sites.removeMonitor
        ).mockReset();
        vi.mocked((globalThis as any).electronAPI.sites.addSite).mockReset();
        vi.mocked((globalThis as any).electronAPI.sites.getSites).mockReset();
        vi.mocked((globalThis as any).electronAPI.sites.updateSite).mockReset();
        vi.mocked((globalThis as any).electronAPI.sites.removeSite).mockReset();
        mockWaitForElectronBridge.mockReset();

        mockWaitForElectronBridge.mockImplementation(async () => {
            const electronBridge =
                (globalThis as any).window?.electronAPI ??
                (globalThis as any).electronAPI;

            if (!electronBridge) {
                throw new MockElectronBridgeNotReadyError({
                    attempts: 1,
                    reason: "ElectronAPI not available",
                });
            }
        });

        // Set default resolved values
        mockWaitForElectronBridge.mockResolvedValue(undefined);
        vi.mocked(
            (globalThis as any).electronAPI.sites.removeMonitor
        ).mockResolvedValue(createMockSiteSnapshot("site-123"));
        vi.mocked(
            (globalThis as any).electronAPI.sites.addSite
        ).mockResolvedValue(createMockSiteSnapshot("site-123"));
        vi.mocked(
            (globalThis as any).electronAPI.sites.getSites
        ).mockResolvedValue([createMockSiteSnapshot("site-123")]);
        vi.mocked(
            (globalThis as any).electronAPI.sites.updateSite
        ).mockResolvedValue(createMockSiteSnapshot("site-123"));
        vi.mocked(
            (globalThis as any).electronAPI.sites.removeSite
        ).mockResolvedValue(true);
    });

    describe("removeMonitor method - Lines 157-162 Coverage", () => {
        it("should successfully remove a monitor from a site", async () => {
            // Arrange
            const siteIdentifier = "site-123";
            const monitorId = "monitor-456";

            mockWaitForElectronBridge.mockResolvedValue(undefined);
            const persistedSite = createMockSiteSnapshot(siteIdentifier);
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockResolvedValue(persistedSite);

            // Act
            const result = await SiteService.removeMonitor(
                siteIdentifier,
                monitorId
            );

            // Assert
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
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

            mockWaitForElectronBridge.mockRejectedValue(initError);

            // Act & Assert
            await expect(
                SiteService.removeMonitor(siteIdentifier, monitorId)
            ).rejects.toThrowError("Electron API initialization failed");

            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).not.toHaveBeenCalled();
        });

        it("should handle IPC errors when removing monitor", async () => {
            // Arrange
            const siteIdentifier = "site-123";
            const monitorId = "monitor-456";
            const ipcError = new Error("IPC communication failed");

            mockWaitForElectronBridge.mockResolvedValue(undefined);
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockRejectedValue(ipcError);

            // Act & Assert
            await expect(
                SiteService.removeMonitor(siteIdentifier, monitorId)
            ).rejects.toThrowError("IPC communication failed");

            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });

        it("should handle empty string parameters", async () => {
            // Arrange
            const siteIdentifier = "";
            const monitorId = "";

            mockWaitForElectronBridge.mockResolvedValue(undefined);
            const persistedSite = createMockSiteSnapshot(siteIdentifier);
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockResolvedValue(persistedSite);

            // Act & Assert
            await expect(
                SiteService.removeMonitor(siteIdentifier, monitorId)
            ).rejects.toThrowError(
                "Monitor removal returned an invalid site snapshot for /"
            );

            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).toHaveBeenCalledWith("", "");
            expect(logger.error).toHaveBeenCalledWith(
                "[SiteService] Invalid site snapshot returned after monitor removal",
                expect.any(Error),
                expect.objectContaining({
                    monitorId,
                    siteIdentifier,
                })
            );
        });

        it("should handle special characters in identifiers", async () => {
            // Arrange
            const siteIdentifier = "site-123-test@example.com";
            const monitorId = "monitor-456-special_chars!";

            mockWaitForElectronBridge.mockResolvedValue(undefined);
            const persistedSite = createMockSiteSnapshot(siteIdentifier);
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockResolvedValue(persistedSite);

            // Act
            const result = await SiteService.removeMonitor(
                siteIdentifier,
                monitorId
            );

            // Assert
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
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

            mockWaitForElectronBridge.mockImplementation(async () => {
                callOrder.push("initialize");
                return undefined;
            });

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

            mockWaitForElectronBridge.mockResolvedValue(undefined);
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockReturnValue(
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
            ).rejects.toThrowError("Operation timeout");
        });

        it("should handle null/undefined electron API", async () => {
            // Arrange
            const siteIdentifier = "site-123";
            const monitorId = "monitor-456";

            mockWaitForElectronBridge.mockResolvedValue(undefined);

            // Temporarily remove the removeMonitor method
            const originalRemoveMonitor = (globalThis as any).electronAPI.sites
                .removeMonitor;
            (globalThis as any).electronAPI.sites.removeMonitor = undefined;

            try {
                // Act & Assert
                await expect(
                    SiteService.removeMonitor(siteIdentifier, monitorId)
                ).rejects.toThrowError();
            } finally {
                // Restore the original method
                (globalThis as any).electronAPI.sites.removeMonitor =
                    originalRemoveMonitor;
            }
        });

        it("should throw when backend reports unsuccessful removal", async () => {
            const siteIdentifier = "site-123";
            const monitorId = "monitor-456";

            mockWaitForElectronBridge.mockResolvedValue(undefined);
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockResolvedValue(false);

            await expect(
                SiteService.removeMonitor(siteIdentifier, monitorId)
            ).rejects.toThrowError(
                `Monitor removal returned an invalid site snapshot for ${siteIdentifier}/${monitorId}`
            );

            expect(logger.error).toHaveBeenCalledWith(
                "[SiteService] Invalid site snapshot returned after monitor removal",
                expect.any(Error),
                expect.objectContaining({
                    monitorId,
                    siteIdentifier,
                })
            );
        });
    });

    describe("addSite validation", () => {
        it("should validate and return the persisted site snapshot", async () => {
            const inputSite = createMockSiteSnapshot("site-new");

            const result = await SiteService.addSite(inputSite);

            expect(
                (globalThis as any).electronAPI.sites.addSite
            ).toHaveBeenCalledWith(inputSite);
            expect(result.identifier).toBe("site-123");
        });

        it("should throw when backend returns invalid site snapshot", async () => {
            const invalidSite = {
                identifier: "invalid-site",
                monitoring: true,
                monitors: [],
                name: "Broken",
            } as unknown as Site;

            vi.mocked(
                (globalThis as any).electronAPI.sites.addSite
            ).mockResolvedValueOnce(invalidSite);

            await expect(
                SiteService.addSite(createMockSiteSnapshot("invalid-site"))
            ).rejects.toThrowError(
                "Site creation returned an invalid site snapshot for invalid-site"
            );

            expect(logger.error).toHaveBeenCalledWith(
                "[SiteService] Invalid site snapshot returned after addSite",
                expect.any(Error),
                expect.objectContaining({
                    operation: "addSite",
                    siteIdentifier: "invalid-site",
                })
            );
        });
    });

    describe("getSites validation", () => {
        it("should return validated site snapshots", async () => {
            const sites = await SiteService.getSites();

            expect(
                (globalThis as any).electronAPI.sites.getSites
            ).toHaveBeenCalledTimes(1);
            expect(Array.isArray(sites)).toBeTruthy();
            expect(sites[0]?.identifier).toBe("site-123");
        });

        it("should throw when any site snapshot is invalid", async () => {
            const invalidSnapshot = {
                identifier: "invalid",
                monitoring: true,
                monitors: [],
                name: "Invalid",
            } as unknown as Site;

            vi.mocked(
                (globalThis as any).electronAPI.sites.getSites
            ).mockResolvedValueOnce([invalidSnapshot]);

            await expect(SiteService.getSites()).rejects.toThrowError(
                "getSites returned invalid site snapshot data (indices: 0)"
            );

            expect(logger.error).toHaveBeenCalledWith(
                "[SiteService] Invalid site snapshot(s) returned during getSites",
                expect.any(Error),
                expect.objectContaining({
                    invalidIndices: [0],
                })
            );
        });
    });

    describe("updateSite validation", () => {
        it("should return validated updated snapshot", async () => {
            const updates: Partial<Site> = { name: "Updated" };

            const result = await SiteService.updateSite("site-123", updates);

            expect(
                (globalThis as any).electronAPI.sites.updateSite
            ).toHaveBeenCalledWith("site-123", updates);
            expect(result.identifier).toBe("site-123");
        });

        it("should throw when update returns an invalid site snapshot", async () => {
            const invalidSnapshot = {
                identifier: "site-123",
                monitoring: true,
                monitors: [],
                name: "Invalid",
            } as unknown as Site;

            vi.mocked(
                (globalThis as any).electronAPI.sites.updateSite
            ).mockResolvedValueOnce(invalidSnapshot);

            await expect(
                SiteService.updateSite("site-123", { name: "Broken" })
            ).rejects.toThrowError(
                "Site update returned an invalid site snapshot for site-123"
            );

            expect(logger.error).toHaveBeenCalledWith(
                "[SiteService] Invalid site snapshot returned after updateSite",
                expect.any(Error),
                expect.objectContaining({
                    operation: "updateSite",
                    siteIdentifier: "site-123",
                })
            );
        });
    });

    describe("Initialize method coverage", () => {
        it("should properly initialize and handle errors", async () => {
            // Arrange
            const initError = new Error("API unavailable");

            mockWaitForElectronBridge.mockRejectedValue(initError);

            // Act & Assert
            await expect(SiteService.initialize()).rejects.toThrowError(
                "API unavailable"
            );
            expect(logger.error).toHaveBeenCalledWith(
                "[SiteService] Failed to initialize:",
                expect.any(Error)
            );
        });

        it("should successfully initialize when API is available", async () => {
            // Arrange
            mockWaitForElectronBridge.mockResolvedValue(undefined);

            // Act & Assert
            await expect(SiteService.initialize()).resolves.toBeUndefined();
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
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

            mockWaitForElectronBridge.mockResolvedValue(undefined);
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
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(3);
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

            mockWaitForElectronBridge.mockResolvedValue(undefined);
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
            // Concurrent calls share a single in-flight initialization.
            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).toHaveBeenCalledTimes(3);
        });

        it("should handle very long identifiers", async () => {
            // Arrange
            const longSiteId = "a".repeat(1000);
            const longMonitorId = "b".repeat(1000);

            mockWaitForElectronBridge.mockResolvedValue(undefined);
            vi.mocked(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).mockResolvedValue(createMockSiteSnapshot(longSiteId));

            // Act & Assert
            await expect(
                SiteService.removeMonitor(longSiteId, longMonitorId)
            ).rejects.toThrowError(
                `Monitor removal returned an invalid site snapshot for ${longSiteId}/${longMonitorId}`
            );

            expect(mockWaitForElectronBridge).toHaveBeenCalledTimes(1);
            expect(
                (globalThis as any).electronAPI.sites.removeMonitor
            ).toHaveBeenCalledWith(longSiteId, longMonitorId);
            expect(logger.error).toHaveBeenCalledWith(
                "[SiteService] Invalid site snapshot returned after monitor removal",
                expect.any(Error),
                expect.objectContaining({
                    monitorId: longMonitorId,
                    siteIdentifier: longSiteId,
                })
            );
        });
    });
});
