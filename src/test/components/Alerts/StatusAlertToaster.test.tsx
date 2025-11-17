import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

describe("StatusAlertToaster", () => {
    const dismissAlert = vi.fn();
    const baseAlert: StatusAlert = {
        createTime: Date.now(),
        id: "alert-1",
        message: "Service recovered",
        monitorId: "monitor-1",
        monitorName: "Monitor",
        previousStatus: "down",
        severity: "info",
        siteIdentifier: "site-1",
        siteName: "Site",
        status: "up",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        const mockState: AlertStore = {
            alerts: [],
            clearAlerts: vi.fn(),
            dismissAlert,
            enqueueAlert: vi.fn(),
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
        const alerts = [baseAlert, { ...baseAlert, id: "alert-2" }];

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

        fireEvent.click(renderedAlerts[0]);
        expect(dismissAlert).toHaveBeenCalledWith("alert-1");
    });
});
