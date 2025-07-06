/**
 * @file Test suite for autoMonitorManager.ts
 * @description Tests for auto-monitoring utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { autoStartMonitoring } from "../../../utils/monitoring/autoMonitorManager";
import type { Site, Monitor } from "../../../types";

// Mock logger
const mockLogger = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
};

// Mock isDev function
const mockIsDev = vi.fn();

// Mock start monitoring callback
const mockStartMonitoringCallback = vi.fn();

// Helper function to create test monitor
const createTestMonitor = (partial: Partial<Monitor>): Monitor => ({
    id: "default-id",
    type: "http",
    status: "pending",
    history: [],
    url: "https://example.com",
    ...partial,
});

describe("autoMonitorManager", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("autoStartMonitoring", () => {
        it("should start monitoring for all monitors in a site", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({
                    id: "1",
                    url: "https://example.com",
                    checkInterval: 5000,
                }),
                createTestMonitor({
                    id: "2",
                    url: "https://test.com",
                    checkInterval: 10000,
                }),
            ];

            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors,
            };

            mockIsDev.mockReturnValue(false);
            mockStartMonitoringCallback.mockResolvedValue(undefined);

            await autoStartMonitoring(site, mockStartMonitoringCallback, mockLogger, mockIsDev);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[autoStartMonitoring] Starting monitoring for site: test-site"
            );
            expect(mockStartMonitoringCallback).toHaveBeenCalledTimes(2);
            expect(mockStartMonitoringCallback).toHaveBeenCalledWith("test-site", "1");
            expect(mockStartMonitoringCallback).toHaveBeenCalledWith("test-site", "2");
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[autoStartMonitoring] Completed starting monitoring for all monitors in site: test-site"
            );
        });

        it("should include debug messages when in development mode", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({
                    id: "1",
                    url: "https://example.com",
                    checkInterval: 5000,
                }),
            ];

            const site: Site = {
                identifier: "dev-site",
                name: "Dev Site",
                monitors,
            };

            mockIsDev.mockReturnValue(true);
            mockStartMonitoringCallback.mockResolvedValue(undefined);

            await autoStartMonitoring(site, mockStartMonitoringCallback, mockLogger, mockIsDev);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[autoStartMonitoring] Starting monitoring for site: dev-site"
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[autoStartMonitoring] Auto-started monitoring for monitor 1 with interval 5000ms"
            );
            expect(mockStartMonitoringCallback).toHaveBeenCalledWith("dev-site", "1");
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[autoStartMonitoring] Completed starting monitoring for all monitors in site: dev-site"
            );
        });

        it("should handle site with no monitors", async () => {
            const site: Site = {
                identifier: "empty-site",
                name: "Empty Site",
                monitors: [],
            };

            mockIsDev.mockReturnValue(false);

            await autoStartMonitoring(site, mockStartMonitoringCallback, mockLogger, mockIsDev);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[autoStartMonitoring] Starting monitoring for site: empty-site"
            );
            expect(mockStartMonitoringCallback).not.toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[autoStartMonitoring] Completed starting monitoring for all monitors in site: empty-site"
            );
        });

        it("should skip monitors without id", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({
                    id: "1",
                    url: "https://example.com",
                    checkInterval: 5000,
                }),
                createTestMonitor({
                    id: "", // Empty id
                    url: "https://test.com",
                    checkInterval: 10000,
                }),
                createTestMonitor({
                    id: "3",
                    url: "https://valid.com",
                    checkInterval: 3000,
                }),
            ];

            const site: Site = {
                identifier: "mixed-site",
                name: "Mixed Site",
                monitors,
            };

            mockIsDev.mockReturnValue(false);
            mockStartMonitoringCallback.mockResolvedValue(undefined);

            await autoStartMonitoring(site, mockStartMonitoringCallback, mockLogger, mockIsDev);

            expect(mockStartMonitoringCallback).toHaveBeenCalledTimes(2);
            expect(mockStartMonitoringCallback).toHaveBeenCalledWith("mixed-site", "1");
            expect(mockStartMonitoringCallback).toHaveBeenCalledWith("mixed-site", "3");
            expect(mockStartMonitoringCallback).not.toHaveBeenCalledWith("mixed-site", "");
        });

        it("should handle monitors with string ids", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({
                    id: "123",
                    url: "https://example.com",
                    checkInterval: 5000,
                }),
            ];

            const site: Site = {
                identifier: "string-id-site",
                name: "String ID Site",
                monitors,
            };

            mockIsDev.mockReturnValue(false);
            mockStartMonitoringCallback.mockResolvedValue(undefined);

            await autoStartMonitoring(site, mockStartMonitoringCallback, mockLogger, mockIsDev);

            expect(mockStartMonitoringCallback).toHaveBeenCalledWith("string-id-site", "123");
        });

        it("should handle start monitoring callback errors", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({
                    id: "1",
                    url: "https://example.com",
                    checkInterval: 5000,
                }),
                createTestMonitor({
                    id: "2",
                    url: "https://test.com",
                    checkInterval: 10000,
                }),
            ];

            const site: Site = {
                identifier: "error-site",
                name: "Error Site",
                monitors,
            };

            mockIsDev.mockReturnValue(false);
            mockStartMonitoringCallback
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error("Failed to start monitoring"));

            await expect(autoStartMonitoring(site, mockStartMonitoringCallback, mockLogger, mockIsDev)).rejects.toThrow(
                "Failed to start monitoring"
            );

            expect(mockStartMonitoringCallback).toHaveBeenCalledTimes(2);
            expect(mockStartMonitoringCallback).toHaveBeenCalledWith("error-site", "1");
            expect(mockStartMonitoringCallback).toHaveBeenCalledWith("error-site", "2");
        });

        it("should handle site with empty string identifier", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({
                    id: "1",
                    url: "https://example.com",
                    checkInterval: 5000,
                }),
            ];

            const site: Site = {
                identifier: "",
                name: "Empty Identifier Site",
                monitors,
            };

            mockIsDev.mockReturnValue(false);
            mockStartMonitoringCallback.mockResolvedValue(undefined);

            await autoStartMonitoring(site, mockStartMonitoringCallback, mockLogger, mockIsDev);

            expect(mockLogger.debug).toHaveBeenCalledWith("[autoStartMonitoring] Starting monitoring for site: ");
            expect(mockStartMonitoringCallback).toHaveBeenCalledWith("", "1");
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[autoStartMonitoring] Completed starting monitoring for all monitors in site: "
            );
        });

        it("should work with null id values", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({
                    id: "", // Empty id, simulating null
                    url: "https://example.com",
                    checkInterval: 5000,
                }),
                createTestMonitor({
                    id: "2",
                    url: "https://test.com",
                    checkInterval: 10000,
                }),
            ];

            const site: Site = {
                identifier: "null-id-site",
                name: "Null ID Site",
                monitors,
            };

            mockIsDev.mockReturnValue(false);
            mockStartMonitoringCallback.mockResolvedValue(undefined);

            await autoStartMonitoring(site, mockStartMonitoringCallback, mockLogger, mockIsDev);

            expect(mockStartMonitoringCallback).toHaveBeenCalledTimes(1);
            expect(mockStartMonitoringCallback).toHaveBeenCalledWith("null-id-site", "2");
        });

        it("should handle callback that returns a value", async () => {
            const monitors: Monitor[] = [
                createTestMonitor({
                    id: "1",
                    url: "https://example.com",
                    checkInterval: 5000,
                }),
            ];

            const site: Site = {
                identifier: "return-value-site",
                name: "Return Value Site",
                monitors,
            };

            mockIsDev.mockReturnValue(false);
            mockStartMonitoringCallback.mockResolvedValue("success");

            await autoStartMonitoring(site, mockStartMonitoringCallback, mockLogger, mockIsDev);

            expect(mockStartMonitoringCallback).toHaveBeenCalledWith("return-value-site", "1");
            expect(mockLogger.info).toHaveBeenCalledWith(
                "[autoStartMonitoring] Completed starting monitoring for all monitors in site: return-value-site"
            );
        });
    });
});
