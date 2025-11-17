import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { STATUS_KIND } from "@shared/types";

import type {
    AlertStore,
    StatusAlert,
} from "../../../stores/alerts/useAlertStore";

import { StatusAlertToaster } from "../../../components/Alerts/StatusAlertToaster";
import { useAlertStore } from "../../../stores/alerts/useAlertStore";

vi.mock("../../../stores/alerts/useAlertStore", () => ({
    useAlertStore: vi.fn(),
}));

vi.mock("../../../components/Alerts/StatusAlertToast", () => ({
    StatusAlertToast: ({
        alert,
        onDismiss,
    }: {
        alert: StatusAlert;
        onDismiss: (id: string) => void;
    }) => (
        <div
            data-testid={`status-alert-${alert.id}`}
            onClick={() => onDismiss(alert.id)}
        >
            {alert.id}
        </div>
    ),
}));

const mockedUseAlertStore = vi.mocked(useAlertStore);

describe(StatusAlertToaster, () => {
    const dismissAlert = vi.fn();
    const baseAlert: StatusAlert = {
        id: "alert-1",
        monitorId: "monitor-1",
        monitorName: "Monitor",
        previousStatus: STATUS_KIND.DOWN,
        siteIdentifier: "site-1",
        siteName: "Site",
        status: STATUS_KIND.UP,
        timestamp: Date.now(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        const mockState: AlertStore = {
            alerts: [],
            clearAlerts: vi.fn(),
            dismissAlert,
            enqueueAlert: vi.fn().mockImplementation((input) => ({
                ...baseAlert,
                ...input,
                id: input.id ?? baseAlert.id,
                timestamp: input.timestamp ?? baseAlert.timestamp,
            })),
        } as AlertStore;

        mockedUseAlertStore.mockImplementation(((
            selector: (state: AlertStore) => unknown
        ) => selector(mockState)) as any);
    });

    it("does not render when there are no alerts", () => {
        render(<StatusAlertToaster />);
        expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    });

    it("renders alerts and forwards dismiss callbacks", () => {
        const alerts: StatusAlert[] = [
            baseAlert,
            { ...baseAlert, id: "alert-2", timestamp: baseAlert.timestamp + 1 },
        ];

        mockedUseAlertStore.mockImplementation(((
            selector: (state: AlertStore) => unknown
        ) =>
            selector({
                alerts,
                clearAlerts: vi.fn(),
                dismissAlert,
                enqueueAlert: vi.fn(),
            } as AlertStore)) as any);

        render(<StatusAlertToaster />);

        const renderedAlerts = screen.getAllByTestId(/status-alert-/);
        expect(renderedAlerts).toHaveLength(2);

        const firstAlert = renderedAlerts[0]!;
        fireEvent.click(firstAlert);
        expect(dismissAlert).toHaveBeenCalledWith("alert-1");
    });
});
