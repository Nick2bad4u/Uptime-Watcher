import type { Site } from "@shared/types";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    DEFAULT_DOWN_ALERT_COOLDOWN_MS,
    type NotificationConfig,
    NotificationService,
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

interface MockNotificationOptions {
    body?: string;
    title: string;
}

const { mockIsSupported, mockShow, notificationCtor } = vi.hoisted(() => {
    const mockShowImpl = vi.fn();
    const mockIsSupportedImpl = vi.fn(() => true);

    const notificationCtorImpl = vi.fn(function NotificationMock(
        this: { show: typeof mockShowImpl },
        _options: MockNotificationOptions
    ) {
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

const rawMonitorId =
    "https://monitor.example/check?token=monitor-token#private-monitor";
const rawSiteIdentifier =
    "https://user:site-secret@example.com/path?access_token=site-token#private-site";

const createSensitiveSite = (): Site => ({
    ...sampleSite,
    identifier: rawSiteIdentifier,
    monitors: (() => {
        const [monitor] = sampleSite.monitors;
        if (!monitor) {
            throw new Error("Expected sample site to include a monitor");
        }

        return [
            {
                ...monitor,
                id: rawMonitorId,
            },
        ];
    })(),
});

function isMockNotificationOptions(
    value: unknown
): value is MockNotificationOptions {
    return (
        typeof value === "object" &&
        value !== null &&
        "title" in value &&
        typeof value.title === "string" &&
        (!("body" in value) || typeof value.body === "string")
    );
}

function getFirstNotificationOptions(): MockNotificationOptions {
    const [firstCall] = notificationCtor.mock.calls;
    const [options] = firstCall ?? [];

    if (!isMockNotificationOptions(options)) {
        throw new Error("Expected Notification constructor options");
    }

    return options;
}

function getFirstNotificationOptionsWithBody(): MockNotificationOptions & {
    body: string;
} {
    const options = getFirstNotificationOptions();
    if (typeof options.body !== "string") {
        throw new TypeError("Expected Notification constructor body");
    }

    return { ...options, body: options.body };
}

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

        it("copies muted site identifiers from update payloads", () => {
            const mutedSiteNotificationIdentifiers = [sampleSite.identifier];

            service.updateConfig({ mutedSiteNotificationIdentifiers });
            mutedSiteNotificationIdentifiers.push("site-2");

            service.notifyMonitorDown(
                { ...sampleSite, identifier: "site-2" },
                "monitor-1"
            );

            expect(notificationCtor).toHaveBeenCalled();
        });

        it("returns muted site identifiers without exposing internal config", () => {
            service.updateConfig({
                mutedSiteNotificationIdentifiers: [sampleSite.identifier],
            });

            const config = service.getConfig();
            (config.mutedSiteNotificationIdentifiers as string[]).push(
                "site-2"
            );

            service.notifyMonitorDown(
                { ...sampleSite, identifier: "site-2" },
                "monitor-1"
            );

            expect(notificationCtor).toHaveBeenCalled();
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

        it("redacts URL-shaped identifiers in muted-site suppression logs", () => {
            const site = createSensitiveSite();
            service.updateConfig({
                mutedSiteNotificationIdentifiers: [rawSiteIdentifier],
            });

            service.notifyMonitorDown(site, rawMonitorId);

            expect(notificationCtor).not.toHaveBeenCalled();

            const logPayload = JSON.stringify(
                vi.mocked(logger.debug).mock.calls
            );
            expect(logPayload).toContain("https://example.com/path");
            expect(logPayload).toContain("https://monitor.example/check");
            expect(logPayload).not.toContain("site-secret");
            expect(logPayload).not.toContain("site-token");
            expect(logPayload).not.toContain("private-site");
            expect(logPayload).not.toContain("monitor-token");
            expect(logPayload).not.toContain("private-monitor");
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

        it("redacts URL-shaped identifiers in cooldown suppression logs", () => {
            vi.useFakeTimers();
            const site = createSensitiveSite();

            service.notifyMonitorDown(site, rawMonitorId);
            expect(notificationCtor).toHaveBeenCalledTimes(1);

            vi.mocked(logger.debug).mockClear();
            notificationCtor.mockClear();
            service.notifyMonitorDown(site, rawMonitorId);

            expect(notificationCtor).not.toHaveBeenCalled();

            const logPayload = JSON.stringify(
                vi.mocked(logger.debug).mock.calls
            );
            expect(logPayload).toContain("https://example.com/path");
            expect(logPayload).toContain("https://monitor.example/check");
            expect(logPayload).not.toContain("site-secret");
            expect(logPayload).not.toContain("site-token");
            expect(logPayload).not.toContain("private-site");
            expect(logPayload).not.toContain("monitor-token");
            expect(logPayload).not.toContain("private-monitor");
        });

        it("sanitizes user-configured monitor notification text", () => {
            const sampleMonitor = sampleSite.monitors.at(0);
            if (!sampleMonitor) {
                throw new Error("Expected sample site to include a monitor");
            }

            const siteWithSensitiveLabel: Site = {
                ...sampleSite,
                name: "Example\nsecret_token=site-secret-token",
                monitors: [
                    {
                        ...sampleMonitor,
                        url: "https://example.com/check?access_token=monitor-secret-token#monitor-fragment",
                    },
                ],
            };

            service.notifyMonitorDown(siteWithSensitiveLabel, "monitor-1");

            const options = getFirstNotificationOptionsWithBody();
            const decodedBody = decodeURIComponent(options.body);

            expect(options.title).toContain("[redacted]");
            expect(options.title).not.toContain("site-secret-token");
            expect(options.title).not.toMatch(/[\n\r]/u);
            expect(options.title.length).toBeLessThanOrEqual(120);
            expect(decodedBody).toContain("https://example.com/check (http)");
            expect(options.body).not.toContain("access_token");
            expect(options.body).not.toContain("monitor-secret-token");
            expect(options.body).not.toContain("monitor-fragment");
            expect(options.body).not.toMatch(/[\n\r]/u);
            expect(options.body.length).toBeLessThanOrEqual(500);
        });

        it("sanitizes advanced monitor URL labels before composing notification text", () => {
            const siteWithReplicationMonitor: Site = {
                ...sampleSite,
                monitors: [
                    {
                        checkInterval: 60_000,
                        history: [],
                        id: "replication-monitor",
                        maxReplicationLagSeconds: 60,
                        monitoring: true,
                        primaryStatusUrl:
                            "https://primary.example.com/status?refresh_token=replication-secret#replication-fragment",
                        replicaStatusUrl:
                            "https://replica.example.com/status?refresh_token=replication-secret",
                        replicationTimestampField: "data.lastApplied",
                        responseTime: 512,
                        retryAttempts: 3,
                        status: "up",
                        timeout: 30,
                        type: "replication",
                    },
                ],
            };

            service.notifyMonitorDown(
                siteWithReplicationMonitor,
                "replication-monitor"
            );

            const options = getFirstNotificationOptionsWithBody();
            const decodedBody = decodeURIComponent(options.body);

            expect(decodedBody).toContain(
                "https://primary.example.com/status (replication)"
            );
            expect(options.body).not.toContain("refresh_token");
            expect(options.body).not.toContain("replication-secret");
            expect(options.body).not.toContain("replication-fragment");
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

        it("redacts URL-shaped identifiers in no-prior-outage suppression logs", () => {
            service.updateConfig({ restoreRequiresOutage: true });
            notificationCtor.mockClear();
            vi.mocked(logger.debug).mockClear();

            const freshService = new NotificationService();
            freshService.notifyMonitorUp(createSensitiveSite(), rawMonitorId);

            expect(notificationCtor).not.toHaveBeenCalled();

            const logPayload = JSON.stringify(
                vi.mocked(logger.debug).mock.calls
            );
            expect(logPayload).toContain("https://example.com/path");
            expect(logPayload).toContain("https://monitor.example/check");
            expect(logPayload).not.toContain("site-secret");
            expect(logPayload).not.toContain("site-token");
            expect(logPayload).not.toContain("private-site");
            expect(logPayload).not.toContain("monitor-token");
            expect(logPayload).not.toContain("private-monitor");
        });
    });

    it("handles unsupported notification platforms", () => {
        mockIsSupported.mockReturnValue(false);

        service.notifyMonitorDown(sampleSite, "monitor-1");

        expect(notificationCtor).not.toHaveBeenCalled();
    });

    it("redacts URL-shaped monitor identifiers when monitor missing", () => {
        const errorSpy = vi.spyOn(logger, "error");

        service.notifyMonitorDown(sampleSite, rawMonitorId);

        expect(errorSpy).toHaveBeenCalled();
        const logPayload = JSON.stringify(errorSpy.mock.calls);
        expect(logPayload).toContain("https://monitor.example/check");
        expect(logPayload).not.toContain("monitor-token");
        expect(logPayload).not.toContain("private-monitor");
        expect(notificationCtor).not.toHaveBeenCalled();
    });

    describe("app event notifications", () => {
        it("sanitizes app event notification text", () => {
            service.notifyAppEvent({
                body: `Upload failed\nrefresh_token=body-secret-token\r\n${"x".repeat(600)}`,
                title: "Upload failed\naccess_token=title-secret-token",
            });

            const options = getFirstNotificationOptions();

            expect(options.title).toContain("[redacted]");
            expect(options.title).not.toContain("title-secret-token");
            expect(options.title).not.toMatch(/[\n\r]/u);
            expect(options.title.length).toBeLessThanOrEqual(120);
            expect(options.body).toContain("[redacted]");
            expect(options.body).not.toContain("body-secret-token");
            expect(options.body).not.toMatch(/[\n\r]/u);
            expect(options.body?.length).toBeLessThanOrEqual(500);
        });
    });

    describe("notification:sent diagnostics event", () => {
        it("redacts URL-shaped identifiers in dispatch logs while preserving emitted diagnostics", async () => {
            const emitTyped = vi.fn().mockResolvedValue(undefined);
            const serviceWithEvents = new NotificationService({ emitTyped });
            const site = createSensitiveSite();

            serviceWithEvents.notifyMonitorDown(site, rawMonitorId);

            await Promise.resolve();

            expect(emitTyped).toHaveBeenCalledWith(
                "notification:sent",
                expect.objectContaining({
                    monitorId: rawMonitorId,
                    siteIdentifier: rawSiteIdentifier,
                    status: "down",
                })
            );

            const logPayload = JSON.stringify(
                vi.mocked(logger.info).mock.calls
            );
            expect(logPayload).toContain("https://example.com/path");
            expect(logPayload).toContain("https://monitor.example/check");
            expect(logPayload).not.toContain("site-secret");
            expect(logPayload).not.toContain("site-token");
            expect(logPayload).not.toContain("private-site");
            expect(logPayload).not.toContain("monitor-token");
            expect(logPayload).not.toContain("private-monitor");
        });

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
