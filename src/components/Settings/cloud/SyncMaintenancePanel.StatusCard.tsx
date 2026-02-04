import type { JSX } from "react";

import type { MaintenanceTone } from "./SyncMaintenancePanel.model";

import { ThemedText } from "../../../theme/components/ThemedText";

/**
 * Props for {@link SyncMaintenanceStatusCard}.
 */
export interface SyncMaintenanceStatusCardProperties {
    readonly infoIcon: JSX.Element;
    readonly statusText: string;
    readonly summary: null | string;
    readonly tone: MaintenanceTone;
    readonly warningIcon: JSX.Element;
}

/**
 * Summary of the current reset eligibility state.
 */
export const SyncMaintenanceStatusCard = ({
    infoIcon,
    statusText,
    summary,
    tone,
    warningIcon,
}: SyncMaintenanceStatusCardProperties): JSX.Element => {
    const statusIcon = tone === "warning" ? warningIcon : infoIcon;
    const statusAccentClass =
        tone === "warning"
            ? "settings-accent--warning"
            : "settings-accent--primary";
    const statusCardClass =
        tone === "warning"
            ? "settings-subcard settings-subcard--warning"
            : "settings-subcard settings-subcard--info";

    return (
        <div className={statusCardClass}>
            <div className="settings-subcard__header">
                <div className="settings-subcard__title">
                    <span aria-hidden className={statusAccentClass}>
                        {statusIcon}
                    </span>
                    <ThemedText
                        as="div"
                        size="xs"
                        variant="secondary"
                        weight="medium"
                    >
                        About this action
                    </ThemedText>
                </div>
            </div>

            <ThemedText as="p" className="mt-2" size="sm" variant="tertiary">
                {statusText}
            </ThemedText>

            {summary ? (
                <ThemedText
                    as="p"
                    className="mt-2"
                    size="xs"
                    variant="tertiary"
                >
                    {summary}
                </ThemedText>
            ) : null}
        </div>
    );
};
