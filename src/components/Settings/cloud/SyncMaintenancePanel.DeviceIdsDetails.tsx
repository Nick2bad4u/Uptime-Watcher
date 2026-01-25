import type { JSX } from "react";

import { ThemedText } from "../../../theme/components/ThemedText";

/**
 * Props for {@link SyncMaintenanceDeviceIdsDetails}.
 */
export interface SyncMaintenanceDeviceIdsDetailsProperties {
    readonly deviceIds: readonly string[];
    readonly infoIcon: JSX.Element;
}

/**
 * Details block listing device IDs discovered in the preview.
 */
export const SyncMaintenanceDeviceIdsDetails = ({
    deviceIds,
    infoIcon,
}: SyncMaintenanceDeviceIdsDetailsProperties): JSX.Element => (
    <details className="settings-details">
        <summary className="settings-details__summary">
            <span className="settings-details__summary-inner">
                <span aria-hidden className="settings-accent--primary">
                    {infoIcon}
                </span>
                <ThemedText
                    as="span"
                    size="xs"
                    variant="secondary"
                    weight="medium"
                >
                    View device IDs
                </ThemedText>
            </span>
        </summary>

        <pre className="settings-mono-block">{deviceIds.join("\n")}</pre>
    </details>
);
