import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { JSX } from "react";

import { ThemedText } from "../../../theme/components/ThemedText";
import { formatOptionalEpochMs } from "./SyncMaintenancePanel.utils";

/**
 * Props for {@link SyncMaintenanceOperationLogsDetails}.
 */
export interface SyncMaintenanceOperationLogsDetailsProperties {
    readonly infoIcon: JSX.Element;
    readonly perDevice: CloudSyncResetPreview["perDevice"];
}

/**
 * Details block listing per-device operation log metadata.
 */
export const SyncMaintenanceOperationLogsDetails = ({
    infoIcon,
    perDevice,
}: SyncMaintenanceOperationLogsDetailsProperties): JSX.Element => (
    <details className="settings-details">
        <summary className="settings-details__summary">
            <span className="settings-details__summary-inner">
                <span aria-hidden className="settings-accent--success">
                    {infoIcon}
                </span>
                <ThemedText
                    as="span"
                    size="xs"
                    variant="secondary"
                    weight="medium"
                >
                    Operation logs by device
                </ThemedText>
            </span>
        </summary>

        <div className="settings-paragraph-stack mt-3">
            {perDevice.map((device) => (
                <div
                    className="settings-subcard settings-subcard--compact"
                    key={device.deviceId}
                >
                    <ThemedText as="div" size="xs" variant="secondary">
                        {device.deviceId} — {device.operationObjectCount} op object(s)
                    </ThemedText>
                    <div className="settings-paragraph-stack mt-2">
                        <ThemedText as="p" size="xs" variant="tertiary">
                            Oldest:{" "}
                            {formatOptionalEpochMs(device.oldestCreatedAtEpochMs)}
                        </ThemedText>
                        <ThemedText as="p" size="xs" variant="tertiary">
                            Newest:{" "}
                            {formatOptionalEpochMs(device.newestCreatedAtEpochMs)}
                        </ThemedText>
                    </div>
                </div>
            ))}
        </div>
    </details>
);
