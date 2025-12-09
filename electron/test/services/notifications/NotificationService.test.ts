import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { type Site } from "@shared/types";

import {
    NotificationService,
    DEFAULT_DOWN_ALERT_COOLDOWN_MS,
    type NotificationConfig,
} from "../../../services/notifications/NotificationService";
import { logger } from "../../../utils/logger";

vi.mock("../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

const { mockIsSupported, mockShow, notificationCtor } = vi.hoisted(() => {
    const mockShowImpl = vi.fn();
    const mockIsSupportedImpl = vi.fn(() => true);

    const notificationCtorImpl = vi.fn(function NotificationMock(this: {
        show: typeof mockShowImpl;
    }) {
        this.show = mockShowImpl;
    });

    Object.assign(notificationCtorImpl, {
        isSupported: mockIsSupportedImpl,
    });

    return {
        mockIsSupported: mockIsSupportedImpl,
        mockShow: mockShowImpl,
        notificationCtor: notificationCtorImpl,
    };
});

vi.mock("electron", async () => {
    const actual = await vi.importActual<typeof import("electron")>("electron");
    return {
        ...actual,
        Notification: notificationCtor,
    };
});

const sampleSite: Site = {
    identifier: "site-1",
    name: "Example",
    monitoring: true,
    monitors: [
        {
            id: "monitor-1",
            type: "http",
            url: "https://example.com",
            checkInterval: 60_000,
            history: [],
            responseTime: 512,
            retryAttempts: 3,
            timeout: 30,
            status: "up",
            monitoring: true,
        },
    ],
};

describe(NotificationService, () => {
    let service: NotificationService;

    beforeEach(() => {
        service = new NotificationService();
        notificationCtor.mockClear();
        mockShow.mockClear();
        mockIsSupported.mockReturnValue(true);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.resetAllMocks();
    });

    describe("configuration", () => {
        it("returns default configuration", () => {
            expect(service.getConfig()).toEqual({
                enabled: true,
                playSound: false,
                showDownAlerts: true,
                showUpAlerts: true,
                downAlertCooldownMs: DEFAULT_DOWN_ALERT_COOLDOWN_MS,
                restoreRequiresOutage: true,
            });
        });

        it("merges configuration updates", () => {
            const overrides: Partial<NotificationConfig> = {
                enabled: false,
                playSound: true,
                showDownAlerts: false,
                downAlertCooldownMs: 45_000,
            };

            service.updateConfig(overrides);

            expect(service.getConfig()).toEqual({
                enabled: false,
                playSound: true,
                showDownAlerts: false,
                showUpAlerts: true,
                downAlertCooldownMs: 45_000,
                restoreRequiresOutage: true,
            });
        });
    });

    describe("per-site mute", () => {
        it("suppresses down notifications for muted sites", () => {
            service.updateConfig({
                mutedSiteNotificationIdentifiers: [sampleSite.identifier],
            });

            service.notifyMonitorDown(sampleSite, "monitor-1");

            expect(notificationCtor).not.toHaveBeenCalled();
        });

        it("suppresses up notifications for muted sites", () => {
            service.updateConfig({
                mutedSiteNotificationIdentifiers: [sampleSite.identifier],
            });

            service.notifyMonitorUp(sampleSite, "monitor-1");

            expect(notificationCtor).not.toHaveBeenCalled();
        });
    });

    describe("down notifications", () => {
        it("emits notification when enabled", () => {
            service.notifyMonitorDown(sampleSite, "monitor-1");

            expect(notificationCtor).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: `${sampleSite.name} monitor is down`,
                    urgency: "critical",
                    silent: true,
                })
            );
            expect(mockShow).toHaveBeenCalled();
        });

        it("respects playSound preference", () => {
            service.updateConfig({ playSound: true });

            service.notifyMonitorDown(sampleSite, "monitor-1");

            expect(notificationCtor).toHaveBeenCalledWith(
                expect.objectContaining({ silent: false })
            );
        });

        it("skips notification when down alerts disabled", () => {
            service.updateConfig({ showDownAlerts: false });

            service.notifyMonitorDown(sampleSite, "monitor-1");

            expect(notificationCtor).not.toHaveBeenCalled();
        });

        it("suppresses repeated alerts during cooldown window", () => {
            vi.useFakeTimers();
            service.notifyMonitorDown(sampleSite, "monitor-1");
            expect(notificationCtor).toHaveBeenCalledTimes(1);

            notificationCtor.mockClear();
            service.notifyMonitorDown(sampleSite, "monitor-1");
            expect(notificationCtor).not.toHaveBeenCalled();
        });
    });

    describe("up notifications", () => {
        beforeEach(() => {
            service.notifyMonitorDown(sampleSite, "monitor-1");
            notificationCtor.mockClear();
            mockShow.mockClear();
        });

        it("emits restore notification after outage", () => {
            service.notifyMonitorUp(sampleSite, "monitor-1");

            expect(notificationCtor).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: `${sampleSite.name} monitor restored`,
                    urgency: "normal",
                })
            );
            expect(mockShow).toHaveBeenCalled();
        });

        it("skips restore when toggle disabled", () => {
            service.updateConfig({ showUpAlerts: false });

            service.notifyMonitorUp(sampleSite, "monitor-1");

            expect(notificationCtor).not.toHaveBeenCalled();
        });

        it("requires prior outage when configured", () => {
            service.updateConfig({ restoreRequiresOutage: true });
            notificationCtor.mockClear();

            const freshService = new NotificationService();
            freshService.notifyMonitorUp(sampleSite, "monitor-1");

            expect(notificationCtor).not.toHaveBeenCalled();
        });
    });

    it("handles unsupported notification platforms", () => {
        mockIsSupported.mockReturnValue(false);

        service.notifyMonitorDown(sampleSite, "monitor-1");

        expect(notificationCtor).not.toHaveBeenCalled();
    });

    it("logs error when monitor missing", () => {
        const errorSpy = vi.spyOn(logger, "error");

        service.notifyMonitorDown(sampleSite, "missing");

        expect(errorSpy).toHaveBeenCalled();
        expect(notificationCtor).not.toHaveBeenCalled();
    });

    describe("notification:sent diagnostics event", () => {
        it("emits a notification:sent event when a notification is dispatched", async () => {
            const emitTyped = vi.fn().mockResolvedValue(undefined);
            const serviceWithEvents = new NotificationService({ emitTyped });

            serviceWithEvents.notifyMonitorDown(sampleSite, "monitor-1");

            await Promise.resolve();

            expect(emitTyped).toHaveBeenCalledTimes(1);
            expect(emitTyped).toHaveBeenCalledWith(
                "notification:sent",
                expect.objectContaining({
                    monitorId: "monitor-1",
                    siteIdentifier: "site-1",
                    status: "down",
                })
            );
        });
    });
});
