/**
 * Tests for the status alert toast components.
 */

import type { StatusUpdate } from "@shared/types";
import { STATUS_KIND } from "@shared/types";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    sampleOne,
    siteNameArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";

import {
    enqueueAlertFromStatusUpdate,
    resetAlertToneInvoker,
} from "../../../components/Alerts/alertCoordinator";
import { StatusAlertToast } from "../../../components/Alerts/StatusAlertToast";
import { StatusAlertToaster } from "../../../components/Alerts/StatusAlertToaster";
import type { StatusAlert } from "../../../stores/alerts/useAlertStore";
import { useAlertStore } from "../../../stores/alerts/useAlertStore";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
import { defaultSettings } from "../../../stores/settings/state";

const createAlert = (overrides: Partial<StatusAlert> = {}): StatusAlert => ({
    id: overrides.id ?? "alert-1",
    monitorId: overrides.monitorId ?? "monitor-1",
    monitorName: overrides.monitorName ?? "Primary HTTP",
    siteIdentifier: overrides.siteIdentifier ?? "site-1",
    siteName: overrides.siteName ?? sampleOne(siteNameArbitrary),
    status: overrides.status ?? "down",
    timestamp: overrides.timestamp ?? Date.now(),
    ...(overrides.previousStatus === undefined
        ? {}
        : { previousStatus: overrides.previousStatus }),
});

const createStatusUpdate = (
    overrides: Partial<StatusUpdate> = {}
): StatusUpdate => {
    const monitorId = overrides.monitorId ?? "monitor-1";
    const siteIdentifier = overrides.siteIdentifier ?? "site-1";
    const timestamp =
        "timestamp" in overrides
            ? overrides.timestamp
            : new Date().toISOString();

    const fallbackSiteName =
        overrides.site?.name ?? sampleOne(siteNameArbitrary);

    return {
        details: overrides.details ?? "",
        monitor: {
            activeOperations: [],
            checkInterval: 60_000,
            history: [],
            id: monitorId,
            monitoring: true,
            responseTime: overrides.monitor?.responseTime ?? 320,
            retryAttempts: 0,
            status: overrides.monitor?.status ?? STATUS_KIND.DOWN,
            timeout: 10_000,
            type: overrides.monitor?.type ?? "http",
            url: overrides.monitor?.url ?? "https://example.com",
        },
        monitorId,
        previousStatus: overrides.previousStatus ?? STATUS_KIND.UP,
        responseTime: overrides.responseTime ?? 320,
        site: {
            identifier: siteIdentifier,
            monitoring: true,
            monitors: [],
            name: fallbackSiteName,
        },
        siteIdentifier,
        status: overrides.status ?? STATUS_KIND.DOWN,
        timestamp,
    } satisfies StatusUpdate;
};

describe(StatusAlertToast, () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it("renders alert content and dismisses on button click", () => {
        const onDismiss = vi.fn();
        const alert = createAlert({ previousStatus: "up" });

        render(<StatusAlertToast alert={alert} onDismiss={onDismiss} />);

        expect(
            screen.getByRole("button", { name: "Dismiss alert" })
        ).toBeInTheDocument();
        expect(screen.getByText(/primary http/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Dismiss alert" }));
        expect(onDismiss).toHaveBeenCalledWith("alert-1");
    });

    it("auto-dismisses after timeout", () => {
        const onDismiss = vi.fn();
        const alert = createAlert();

        render(<StatusAlertToast alert={alert} onDismiss={onDismiss} />);

        vi.advanceTimersByTime(12_000);
        expect(onDismiss).toHaveBeenCalledWith("alert-1");
    });
});

describe(StatusAlertToaster, () => {
    beforeEach(() => {
        useSettingsStore.setState({
            settings: { ...defaultSettings },
        });
        resetAlertToneInvoker();
    });

    afterEach(() => {
        act(() => {
            useAlertStore.setState({ alerts: [] });
        });
        resetAlertToneInvoker();
    });

    it("returns null when no alerts are queued", () => {
        render(<StatusAlertToaster />);
        expect(screen.queryByRole("complementary")).toBeNull();
    });

    it("renders queued alerts", () => {
        act(() => {
            useAlertStore.setState({
                alerts: [createAlert(), createAlert({ id: "alert-2" })],
            });
        });

        render(<StatusAlertToaster />);
        expect(screen.getAllByRole("status")).toHaveLength(2);
    });

    it("renders alerts produced from status updates when in-app alerts are enabled", () => {
        const statusUpdate = createStatusUpdate();
        act(() => {
            enqueueAlertFromStatusUpdate(statusUpdate);
        });

        render(<StatusAlertToaster />);

        expect(
            screen.getByRole("status", {
                name: /down for http/i,
            })
        ).toBeInTheDocument();
        expect(screen.getByText(statusUpdate.site.name)).toBeInTheDocument();
    });

    it("does not enqueue alerts when in-app alerts are disabled", () => {
        useSettingsStore.setState((state) => ({
            settings: {
                ...state.settings,
                inAppAlertsEnabled: false,
            },
        }));

        act(() => {
            enqueueAlertFromStatusUpdate(createStatusUpdate());
        });

        render(<StatusAlertToaster />);

        expect(screen.queryByRole("status")).toBeNull();
    });
});
