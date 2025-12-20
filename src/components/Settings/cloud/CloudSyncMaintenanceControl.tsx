import type { CloudSyncResetResult } from "@shared/types/cloudSyncReset";
import type { CloudSyncResetPreview } from "@shared/types/cloudSyncResetPreview";
import type { JSX } from "react/jsx-runtime";

import {
    useCallback,
    useState,
} from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { Modal } from "../../common/Modal/Modal";
import { SyncMaintenancePanel } from "./SyncMaintenancePanel";

/**
 * Props for {@link CloudSyncMaintenanceControl}.
 */
export interface CloudSyncMaintenanceControlProperties {
    readonly connected: boolean;
    readonly encryptionLocked: boolean;
    readonly encryptionMode: "none" | "passphrase";
    readonly isRefreshingPreview: boolean;
    readonly isResetting: boolean;
    readonly lastResult: CloudSyncResetResult | null;
    readonly onRefreshPreview: () => void;
    readonly onResetRemoteSyncState: () => void;
    readonly preview: CloudSyncResetPreview | null;
    readonly syncEnabled: boolean;
}

/**
 * Renders a small "Sync Maintenance" card that opens the advanced maintenance
 * UI inside a modal dialog.
 */
export const CloudSyncMaintenanceControl = ({
    connected,
    encryptionLocked,
    encryptionMode,
    isRefreshingPreview,
    isResetting,
    lastResult,
    onRefreshPreview,
    onResetRemoteSyncState,
    preview,
    syncEnabled,
}: CloudSyncMaintenanceControlProperties): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = useCallback((): void => {
        setIsOpen(true);
    }, []);

    const handleClose = useCallback((): void => {
        setIsOpen(false);

        queueMicrotask(() => {
            document
                .querySelector<HTMLButtonElement>(
                    '[data-testid="cloud-sync-maintenance-open"]'
                )
                ?.focus();
        });
    }, []);

    return (
        <>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                    <ThemedText size="sm" variant="secondary" weight="medium">
                        Sync Maintenance
                    </ThemedText>
                </div>

                <ThemedText size="sm" variant="tertiary">
                    Advanced tools for diagnosing and resetting remote sync
                    history.
                </ThemedText>

                <div className="mt-3 flex flex-wrap gap-2">
                    <ThemedButton
                        data-testid="cloud-sync-maintenance-open"
                        onClick={handleOpen}
                        size="sm"
                        variant="secondary"
                    >
                        Open sync maintenance
                    </ThemedButton>
                </div>
            </div>

            <Modal
                accent="warning"
                escapePriority={200}
                isBlocking
                isOpen={isOpen}
                modalTestId="cloud-maintenance-modal"
                onRequestClose={handleClose}
                overlayTestId="cloud-maintenance-overlay"
                title="Sync maintenance"
            >
                <SyncMaintenancePanel
                    connected={connected}
                    encryptionLocked={encryptionLocked}
                    encryptionMode={encryptionMode}
                    isRefreshingPreview={isRefreshingPreview}
                    isResetting={isResetting}
                    lastResult={lastResult}
                    onRefreshPreview={onRefreshPreview}
                    onResetRemoteSyncState={onResetRemoteSyncState}
                    preview={preview}
                    syncEnabled={syncEnabled}
                />
            </Modal>
        </>
    );
};
