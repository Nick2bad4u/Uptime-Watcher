import type { JSX } from "react";

import { useCallback } from "react";

import type {
    AlertStore,
    AppToast,
    StatusAlert,
} from "../../stores/alerts/useAlertStore";

import { useAlertStore } from "../../stores/alerts/useAlertStore";
import { AppToastToast } from "./AppToastToast";
import { StatusAlertToast } from "./StatusAlertToast";
import "./StatusAlertToaster.css";

const selectAlerts = (state: AlertStore): StatusAlert[] => state.alerts;
const selectToasts = (state: AlertStore): AppToast[] => state.toasts;
const selectDismissAlert = (state: AlertStore): AlertStore["dismissAlert"] =>
    state.dismissAlert;
const selectDismissToast = (state: AlertStore): AlertStore["dismissToast"] =>
    state.dismissToast;

/**
 * Global status alert toaster component.
 *
 * @public
 */
export const StatusAlertToaster = (): JSX.Element | null => {
    const alerts = useAlertStore(selectAlerts);
    const toasts = useAlertStore(selectToasts);
    const dismissAlert = useAlertStore(selectDismissAlert);
    const dismissToast = useAlertStore(selectDismissToast);

    const handleDismiss = useCallback(
        (id: string): void => {
            dismissAlert(id);
        },
        [dismissAlert]
    );

    const handleDismissToast = useCallback(
        (id: string): void => {
            dismissToast(id);
        },
        [dismissToast]
    );

    if (alerts.length === 0 && toasts.length === 0) {
        return null;
    }

    return (
        <aside
            aria-live="polite"
            aria-relevant="additions removals"
            className="status-alert-toaster"
        >
            {toasts.map((toast) => (
                <AppToastToast
                    key={toast.id}
                    onDismiss={handleDismissToast}
                    toast={toast}
                />
            ))}
            {alerts.map((alert) => (
                <StatusAlertToast
                    alert={alert}
                    key={alert.id}
                    onDismiss={handleDismiss}
                />
            ))}
        </aside>
    );
};
