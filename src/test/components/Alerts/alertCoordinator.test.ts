/**
 * Tests for alert coordinator helpers.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StatusUpdate } from "@shared/types";
import { STATUS_KIND } from "@shared/types";

import * as alertCoordinator from "../../../components/Alerts/alertCoordinator";
import { useAlertStore } from "../../../stores/alerts/useAlertStore";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";

vi.mock("../../../services/NotificationPreferenceService", () => ({
    NotificationPreferenceService: {
        initialize: vi.fn().mockResolvedValue(undefined),
        updatePreferences: vi.fn().mockResolvedValue(undefined),
    },
}));

const createStatusUpdate = (
    overrides: Partial<StatusUpdate> = {}
): StatusUpdate => {
    const timestamp = overrides.timestamp ?? new Date().toISOString();
    return {
        details: overrides.details ?? "",
        monitor: {
            activeOperations: [],
            checkInterval: 60_000,
            history: [],
            id: overrides.monitor?.id ?? "monitor-1",
            monitoring: true,
            responseTime: overrides.monitor?.responseTime ?? 220,
            retryAttempts: 0,
            status: overrides.monitor?.status ?? STATUS_KIND.DOWN,
            timeout: 10_000,
            type: overrides.monitor?.type ?? "http",
            url: overrides.monitor?.url ?? "https://example.com",
        },
        monitorId: overrides.monitorId ?? "monitor-1",
        previousStatus: overrides.previousStatus ?? STATUS_KIND.UP,
        responseTime: overrides.responseTime ?? 220,
        site: {
            identifier: overrides.site?.identifier ?? "site-1",
            monitoring: true,
            monitors: [],
            name: overrides.site?.name ?? "Example",
        },
        siteIdentifier: overrides.siteIdentifier ?? "site-1",
        status: overrides.status ?? STATUS_KIND.DOWN,
        timestamp,
    } satisfies StatusUpdate;
};

const resetStores = (): void => {
    useAlertStore.setState({ alerts: [] });
    const defaults = useSettingsStore.getState().settings;
    useSettingsStore.setState({
        settings: {
            ...defaults,
            inAppAlertsEnabled: true,
            inAppAlertsSoundEnabled: false,
            systemNotificationsEnabled: true,
            systemNotificationsSoundEnabled: false,
        },
    });
};

describe("alertCoordinator", () => {
    beforeEach(() => {
        resetStores();
        alertCoordinator.resetAlertToneInvoker();
    });

    afterEach(() => {
        resetStores();
        alertCoordinator.resetAlertToneInvoker();
        vi.clearAllMocks();
    });

    it("does not enqueue alerts when in-app alerts are disabled", () => {
        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsEnabled: false,
            },
        }));

        const result =
            alertCoordinator.enqueueAlertFromStatusUpdate(createStatusUpdate());

        expect(result).toBeUndefined();
        expect(useAlertStore.getState().alerts).toHaveLength(0);
    });

    it("enqueues alerts when enabled", () => {
        const result =
            alertCoordinator.enqueueAlertFromStatusUpdate(createStatusUpdate());

        expect(result).toBeDefined();
        expect(useAlertStore.getState().alerts).toHaveLength(1);
    });

    it("plays a tone when sound alerts are enabled", () => {
        const toneSpy = vi.fn().mockResolvedValue(undefined);
        alertCoordinator.setAlertToneInvoker(toneSpy);

        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsSoundEnabled: true,
            },
        }));

        alertCoordinator.enqueueAlertFromStatusUpdate(createStatusUpdate());

        expect(toneSpy).toHaveBeenCalledTimes(1);
    });

    it("synchronizes system notification preferences", async () => {
        const { NotificationPreferenceService } = await import(
            "../../../services/NotificationPreferenceService"
        );

        await alertCoordinator.synchronizeNotificationPreferences();

        expect(
            NotificationPreferenceService.updatePreferences
        ).toHaveBeenCalledWith({
            systemNotificationsEnabled: true,
            systemNotificationsSoundEnabled: false,
        });
    });
});
