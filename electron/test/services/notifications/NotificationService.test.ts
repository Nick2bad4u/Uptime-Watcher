/**
 * Tests for NotificationService.
 * Validates system notification management and configuration.
 */

import { Notification } from "electron";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { NotificationService, NotificationConfig } from "../../../services/notifications/NotificationService";
import { Site } from "../../../types";

// Mock Electron modules
vi.mock("electron", () => ({
    Notification: vi.fn().mockImplementation(() => ({
        show: vi.fn(),
    })),
}));

vi.mock("../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe("NotificationService", () => {
    let notificationService: NotificationService;
    let mockNotification: any;
    let logger: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        logger = (await import("../../../utils/logger")).logger;

        mockNotification = {
            show: vi.fn(),
        };

        (Notification as any).mockImplementation(() => mockNotification);
        (Notification as any).isSupported = vi.fn(() => true);

        notificationService = new NotificationService();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("Constructor", () => {
        it("should initialize with default configuration", () => {
            const service = new NotificationService();
            const config = service.getConfig();

            expect(config).toEqual({
                showDownAlerts: true,
                showUpAlerts: true,
            });
        });

        it("should initialize with custom configuration", () => {
            const customConfig: NotificationConfig = {
                showDownAlerts: false,
                showUpAlerts: true,
            };

            const service = new NotificationService(customConfig);
            const config = service.getConfig();

            expect(config).toEqual(customConfig);
        });
    });

    describe("notifyMonitorDown", () => {
        const mockSite: Site = {
            identifier: "example.com",
            name: "Example Site",
            monitors: [
                {
                    id: "monitor-1",
                    type: "http",
                    status: "down",
                    responseTime: undefined,
                    lastChecked: new Date(),
                    history: [],
                },
            ],
        };

        it("should show notification when alerts are enabled", () => {
            notificationService.notifyMonitorDown(mockSite, "monitor-1");

            expect(Notification).toHaveBeenCalledWith({
                body: "Example Site (http) is currently down!",
                title: "Monitor Down Alert",
                urgency: "critical",
            });

            expect(mockNotification.show).toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalledWith("[NotificationService] Monitor down alert: Example Site [http]");
            expect(logger.info).toHaveBeenCalledWith(
                "[NotificationService] Notification sent for monitor down: Example Site (http)"
            );
        });

        it("should not show notification when down alerts are disabled", () => {
            notificationService.updateConfig({ showDownAlerts: false });
            notificationService.notifyMonitorDown(mockSite, "monitor-1");

            expect(Notification).not.toHaveBeenCalled();
            expect(mockNotification.show).not.toHaveBeenCalled();
        });

        it("should handle missing monitor gracefully", () => {
            notificationService.notifyMonitorDown(mockSite, "non-existent-monitor");

            expect(Notification).toHaveBeenCalledWith({
                body: "Example Site (unknown) is currently down!",
                title: "Monitor Down Alert",
                urgency: "critical",
            });
        });

        it("should use identifier when site name is not available", () => {
            const siteWithoutName = { ...mockSite, name: "Example Site" };
            notificationService.notifyMonitorDown(siteWithoutName, "monitor-1");

            expect(Notification).toHaveBeenCalledWith({
                body: "example.com (http) is currently down!",
                title: "Monitor Down Alert",
                urgency: "critical",
            });
        });

        it("should handle unsupported notifications gracefully", () => {
            (Notification as any).isSupported.mockReturnValue(false);

            notificationService.notifyMonitorDown(mockSite, "monitor-1");

            expect(Notification).not.toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalledWith(
                "[NotificationService] Notifications not supported on this platform"
            );
        });
    });

    describe("notifyMonitorUp", () => {
        const mockSite: Site = {
            identifier: "example.com",
            name: "Example Site",
            monitors: [
                {
                    id: "monitor-1",
                    type: "http",
                    status: "up",
                    responseTime: 250,
                    lastChecked: new Date(),
                    history: [],
                },
            ],
        };

        it("should show notification when alerts are enabled", () => {
            notificationService.notifyMonitorUp(mockSite, "monitor-1");

            expect(Notification).toHaveBeenCalledWith({
                body: "Example Site (http) is back online!",
                title: "Monitor Restored",
                urgency: "normal",
            });

            expect(mockNotification.show).toHaveBeenCalled();
            expect(logger.info).toHaveBeenCalledWith("[NotificationService] Monitor restored: Example Site [http]");
            expect(logger.info).toHaveBeenCalledWith(
                "[NotificationService] Notification sent for monitor restored: Example Site (http)"
            );
        });

        it("should not show notification when up alerts are disabled", () => {
            notificationService.updateConfig({ showUpAlerts: false });
            notificationService.notifyMonitorUp(mockSite, "monitor-1");

            expect(Notification).not.toHaveBeenCalled();
            expect(mockNotification.show).not.toHaveBeenCalled();
        });

        it("should handle missing monitor gracefully", () => {
            notificationService.notifyMonitorUp(mockSite, "non-existent-monitor");

            expect(Notification).toHaveBeenCalledWith({
                body: "Example Site (unknown) is back online!",
                title: "Monitor Restored",
                urgency: "normal",
            });
        });

        it("should use identifier when site name is not available", () => {
            const siteWithoutName = { ...mockSite, name: "Example Site" };
            notificationService.notifyMonitorUp(siteWithoutName, "monitor-1");

            expect(Notification).toHaveBeenCalledWith({
                body: "example.com (http) is back online!",
                title: "Monitor Restored",
                urgency: "normal",
            });
        });

        it("should handle unsupported notifications gracefully", () => {
            (Notification as any).isSupported.mockReturnValue(false);

            notificationService.notifyMonitorUp(mockSite, "monitor-1");

            expect(Notification).not.toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalledWith(
                "[NotificationService] Notifications not supported on this platform"
            );
        });
    });

    describe("updateConfig", () => {
        it("should update partial configuration", () => {
            notificationService.updateConfig({ showDownAlerts: false });

            const config = notificationService.getConfig();
            expect(config).toEqual({
                showDownAlerts: false,
                showUpAlerts: true,
            });

            expect(logger.debug).toHaveBeenCalledWith("[NotificationService] Configuration updated", config);
        });

        it("should update multiple configuration options", () => {
            notificationService.updateConfig({
                showDownAlerts: false,
                showUpAlerts: false,
            });

            const config = notificationService.getConfig();
            expect(config).toEqual({
                showDownAlerts: false,
                showUpAlerts: false,
            });
        });

        it("should preserve existing configuration for unspecified options", () => {
            notificationService.updateConfig({ showDownAlerts: false });

            const config = notificationService.getConfig();
            expect(config.showUpAlerts).toBe(true);
        });
    });

    describe("getConfig", () => {
        it("should return a copy of the configuration", () => {
            const config1 = notificationService.getConfig();
            const config2 = notificationService.getConfig();

            expect(config1).toEqual(config2);
            expect(config1).not.toBe(config2); // Different object instances
        });

        it("should return current configuration after updates", () => {
            notificationService.updateConfig({ showDownAlerts: false });
            const config = notificationService.getConfig();

            expect(config.showDownAlerts).toBe(false);
        });
    });

    describe("isSupported", () => {
        it("should return true when notifications are supported", () => {
            (Notification as any).isSupported.mockReturnValue(true);
            expect(notificationService.isSupported()).toBe(true);
        });

        it("should return false when notifications are not supported", () => {
            (Notification as any).isSupported.mockReturnValue(false);
            expect(notificationService.isSupported()).toBe(false);
        });
    });
});
