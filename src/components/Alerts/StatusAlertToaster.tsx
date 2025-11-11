import type { JSX } from "react";

import { useCallback } from "react";

import type {
    AlertStore,
    StatusAlert,
} from "../../stores/alerts/useAlertStore";

import { useAlertStore } from "../../stores/alerts/useAlertStore";
import { StatusAlertToast } from "./StatusAlertToast";
import "./StatusAlertToaster.css";

const selectAlerts = (state: AlertStore): StatusAlert[] => state.alerts;
const selectDismissAlert = (state: AlertStore): AlertStore["dismissAlert"] =>
    state.dismissAlert;

/**
 * Global status alert toaster component.
 *
 * @public
 */
export const StatusAlertToaster = (): JSX.Element | null => {
    const alerts = useAlertStore(selectAlerts);
    const dismissAlert = useAlertStore(selectDismissAlert);

    if (alerts.length === 0) {
        return null;
    }

    const handleDismiss = useCallback(
        (id: string): void => {
            dismissAlert(id);
        },
        [dismissAlert]
    );

    return (
        <aside
            aria-live="polite"
            aria-relevant="additions removals"
            className="status-alert-toaster"
        >
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
