import type { AppNotificationRequest } from "@shared/types/notifications";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultSettings } from "../../../stores/settings/state";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
import { dispatchSystemNotificationIfEnabled } from "../../../stores/cloud/utils/cloudStoreNotifications";

const appNotificationServiceMock = vi.hoisted(() => ({
    notifyAppEvent: vi.fn(async (_request: AppNotificationRequest) => {}),
}));

vi.mock("../../../services/AppNotificationService", () => ({
    AppNotificationService: appNotificationServiceMock,
}));

describe(dispatchSystemNotificationIfEnabled, () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useSettingsStore.setState({
            settings: { ...defaultSettings },
        });
    });

    it("does not dispatch when system notifications are disabled", async () => {
        await dispatchSystemNotificationIfEnabled({
            body: "Sync complete",
            title: "Sync complete",
        });

        expect(
            appNotificationServiceMock.notifyAppEvent
        ).not.toHaveBeenCalled();
    });

    it("sanitizes enabled notification bodies before dispatch", async () => {
        useSettingsStore.setState({
            settings: {
                ...defaultSettings,
                systemNotificationsEnabled: true,
            },
        });

        await dispatchSystemNotificationIfEnabled({
            body: `Restored backup\nsecret_token=uptime-secret-token\r\n${"x".repeat(600)}`,
            title: "Backup restored",
        });

        expect(appNotificationServiceMock.notifyAppEvent).toHaveBeenCalledTimes(
            1
        );

        const [[request]] = appNotificationServiceMock.notifyAppEvent.mock
            .calls as [[AppNotificationRequest]];

        expect(request.title).toBe("Backup restored");
        expect(request.body).toBeDefined();
        expect(request.body).toContain("[redacted]");
        expect(request.body).not.toContain("uptime-secret-token");
        expect(request.body).not.toMatch(/[\n\r]/u);
        expect(request.body?.length).toBeLessThanOrEqual(500);
    });
});
