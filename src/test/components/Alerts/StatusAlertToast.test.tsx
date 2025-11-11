/**
 * Tests for the status alert toast components.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { StatusAlertToast } from "../../../components/Alerts/StatusAlertToast";
import { StatusAlertToaster } from "../../../components/Alerts/StatusAlertToaster";
import type { StatusAlert } from "../../../stores/alerts/useAlertStore";
import { useAlertStore } from "../../../stores/alerts/useAlertStore";

const createAlert = (overrides: Partial<StatusAlert> = {}): StatusAlert => ({
    id: overrides.id ?? "alert-1",
    monitorId: overrides.monitorId ?? "monitor-1",
    monitorName: overrides.monitorName ?? "Primary HTTP",
    siteIdentifier: overrides.siteIdentifier ?? "site-1",
    siteName: overrides.siteName ?? "Example",
    status: overrides.status ?? "down",
    timestamp: overrides.timestamp ?? Date.now(),
    ...(overrides.previousStatus === undefined
        ? {}
        : { previousStatus: overrides.previousStatus }),
});

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
    afterEach(() => {
        act(() => {
            useAlertStore.setState({ alerts: [] });
        });
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
});
