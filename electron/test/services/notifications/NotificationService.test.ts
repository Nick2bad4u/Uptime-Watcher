/**
 * Tests for NotificationService. Validates system notification management and
 * configuration.
 */

import { Notification } from "electron";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
    NotificationService,
    NotificationConfig,
} from "../../../services/notifications/NotificationService";
import { Site } from "../../../../shared/types.js";

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
        it("should initialize with default configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            const service = new NotificationService();
            const config = service.getConfig();

            expect(config).toEqual({
                showDownAlerts: true,
                showUpAlerts: true,
            });
        });
        it("should initialize with custom configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

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
                    responseTime: 0,
                    lastChecked: new Date(),
                    history: [],
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0,
                },
            ],
            monitoring: false,
        };

        it("should show notification when alerts are enabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            notificationService.notifyMonitorDown(mockSite, "monitor-1");

            expect(Notification).toHaveBeenCalledWith({
                body: "Example Site (http) is currently down!",
                title: "Monitor Down Alert",
                urgency: "critical",
            });
            expect(mockNotification.show).toHaveBeenCalled();
        });
        it("should not show notification when down alerts are disabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            notificationService.updateConfig({ showDownAlerts: false });
            notificationService.notifyMonitorDown(mockSite, "monitor-1");

            expect(Notification).not.toHaveBeenCalled();
            expect(mockNotification.show).not.toHaveBeenCalled();
        });
        it("should handle missing monitor gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            notificationService.notifyMonitorDown(
                mockSite,
                "non-existent-monitor"
            );

            expect(Notification).not.toHaveBeenCalled();
            expect(mockNotification.show).not.toHaveBeenCalled();
        });
        it("should handle invalid monitorId gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            notificationService.notifyMonitorDown(mockSite, "");

            expect(Notification).not.toHaveBeenCalled();
            expect(mockNotification.show).not.toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith(
                "[NotificationService] Cannot notify down: monitorId is invalid"
            );
        });
        it("should handle unsupported notifications gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            (Notification as any).isSupported.mockReturnValue(false);

            notificationService.notifyMonitorDown(mockSite, "monitor-1");

            expect(Notification).not.toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalledWith(
                "Notifications not supported on this platform"
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
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0,
                },
            ],
            monitoring: false,
        };

        it("should show notification when alerts are enabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            notificationService.notifyMonitorUp(mockSite, "monitor-1");

            expect(Notification).toHaveBeenCalledWith({
                body: "Example Site (http) is back online!",
                title: "Monitor Restored",
                urgency: "normal",
            });
            expect(mockNotification.show).toHaveBeenCalled();
        });
        it("should not show notification when up alerts are disabled", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            notificationService.updateConfig({ showUpAlerts: false });
            notificationService.notifyMonitorUp(mockSite, "monitor-1");

            expect(Notification).not.toHaveBeenCalled();
            expect(mockNotification.show).not.toHaveBeenCalled();
        });
        it("should handle missing monitor gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            notificationService.notifyMonitorUp(
                mockSite,
                "non-existent-monitor"
            );

            expect(Notification).not.toHaveBeenCalled();
            expect(mockNotification.show).not.toHaveBeenCalled();
        });
        it("should handle unsupported notifications gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            (Notification as any).isSupported.mockReturnValue(false);

            notificationService.notifyMonitorUp(mockSite, "monitor-1");

            expect(Notification).not.toHaveBeenCalled();
            expect(logger.warn).toHaveBeenCalledWith(
                "Notifications not supported on this platform"
            );
        });
    });
    describe("updateConfig", () => {
        it("should update partial configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            notificationService.updateConfig({ showDownAlerts: false });

            const config = notificationService.getConfig();
            expect(config).toEqual({
                showDownAlerts: false,
                showUpAlerts: true,
            });
        });
        it("should update multiple configuration options", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

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
    });
    describe("getConfig", () => {
        it("should return a copy of the configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            const config1 = notificationService.getConfig();
            const config2 = notificationService.getConfig();

            expect(config1).toEqual(config2);
            expect(config1).not.toBe(config2); // Different object instances
        });
    });
    describe("isSupported", () => {
        it("should return true when notifications are supported", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            (Notification as any).isSupported.mockReturnValue(true);
            expect(notificationService.isSupported()).toBe(true);
        });
        it("should return false when notifications are not supported", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");

            (Notification as any).isSupported.mockReturnValue(false);
            expect(notificationService.isSupported()).toBe(false);
        });
    });
});
