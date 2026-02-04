import type { JSX } from "react";

import { useCallback } from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";

/**
 * Props for {@link SyncMaintenanceDangerZoneCard}.
 */
export interface SyncMaintenanceDangerZoneCardProperties {
    readonly canReset: boolean;
    readonly isResetting: boolean;
    readonly onReset: () => void;
    readonly resetIcon: JSX.Element;
}

/**
 * Destructive reset action section.
 */
export const SyncMaintenanceDangerZoneCard = ({
    canReset,
    isResetting,
    onReset,
    resetIcon,
}: SyncMaintenanceDangerZoneCardProperties): JSX.Element => {
    const handleResetClick = useCallback((): void => {
        onReset();
    }, [onReset]);

    return (
        <div className="settings-subcard settings-subcard--danger mt-3">
            <div className="settings-subcard__header">
                <ThemedText
                    as="div"
                    size="xs"
                    variant="secondary"
                    weight="medium"
                >
                    Danger zone
                </ThemedText>

                <div className="settings-subcard__actions">
                    <ThemedButton
                        disabled={!canReset || isResetting}
                        icon={resetIcon}
                        loading={isResetting}
                        onClick={handleResetClick}
                        size="sm"
                        variant="error"
                    >
                        Reset remote sync
                    </ThemedButton>
                </div>
            </div>

            <ThemedText as="p" className="mt-2" size="xs" variant="tertiary">
                Resetting remote sync deletes remote history and re-seeds from
                this device. Other devices may need to resync.
            </ThemedText>
        </div>
    );
};
