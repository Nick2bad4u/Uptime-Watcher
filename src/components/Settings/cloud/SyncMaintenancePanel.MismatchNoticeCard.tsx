import type { JSX } from "react";

import { ThemedText } from "../../../theme/components/ThemedText";

/**
 * Props for {@link SyncMaintenanceMismatchNoticeCard}.
 */
export interface SyncMaintenanceMismatchNoticeCardProperties {
    readonly mismatchText: string;
    readonly warningIcon: JSX.Element;
}

/**
 * Warning card shown when device IDs in preview do not line up.
 */
export const SyncMaintenanceMismatchNoticeCard = ({
    mismatchText,
    warningIcon,
}: SyncMaintenanceMismatchNoticeCardProperties): JSX.Element => (
    <div className="settings-subcard settings-subcard--warning">
        <div className="settings-subcard__header">
            <div className="settings-subcard__title">
                <span aria-hidden className="settings-accent--warning">
                    {warningIcon}
                </span>
                <ThemedText
                    as="div"
                    size="xs"
                    variant="secondary"
                    weight="medium"
                >
                    Device mismatch detected
                </ThemedText>
            </div>
        </div>

        <ThemedText as="p" className="mt-2" size="xs" variant="tertiary">
            {mismatchText}
        </ThemedText>
    </div>
);
