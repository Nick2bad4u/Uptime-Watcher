import type { ReactNode } from "react";
/**
 * Shared card layout used by the cloud sync maintenance UI.
 *
 * @remarks
 * This component exists to avoid duplicating the same card header + container
 * markup across multiple sync maintenance entry points.
 */
import type { JSX } from "react/jsx-runtime";

import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons } from "../../../utils/icons";

export const SyncMaintenanceCard = (props: {
    readonly children: ReactNode;
    readonly description: ReactNode;
}): JSX.Element => {
    const { children, description } = props;

    const MaintenanceIcon = AppIcons.actions.refreshAlt;

    return (
        <div className="settings-subcard">
            <div className="settings-subcard__header">
                <div className="settings-subcard__title">
                    <span
                        aria-hidden
                        className="settings-maintenance__icon settings-accent--warning"
                    >
                        <MaintenanceIcon className="size-5" />
                    </span>
                    <ThemedText
                        as="h4"
                        size="md"
                        variant="secondary"
                        weight="semibold"
                    >
                        Sync Maintenance
                    </ThemedText>
                </div>
            </div>

            <ThemedText as="p" size="sm" variant="tertiary">
                {description}
            </ThemedText>

            <div className="settings-maintenance__body">{children}</div>
        </div>
    );
};
