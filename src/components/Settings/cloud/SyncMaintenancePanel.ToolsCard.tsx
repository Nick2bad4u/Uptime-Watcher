import type { JSX } from "react";

import { useCallback } from "react";

import type { SyncMaintenanceCopyResult } from "./SyncMaintenancePanel.model";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";

/**
 * Props for {@link SyncMaintenanceToolsCard}.
 */
export interface SyncMaintenanceToolsCardProperties {
    readonly copyIcon: JSX.Element;
    readonly copyJsonIcon: JSX.Element;
    readonly copyResult: SyncMaintenanceCopyResult;
    readonly disabled: boolean;
    readonly onCopy: () => void;
    readonly onCopyJson: () => void;
    readonly previewText: null | string;
}

/**
 * Tool actions for copying diagnostics.
 */
export const SyncMaintenanceToolsCard = ({
    copyIcon,
    copyJsonIcon,
    copyResult,
    disabled,
    onCopy,
    onCopyJson,
    previewText,
}: SyncMaintenanceToolsCardProperties): JSX.Element => {
    const handleCopyClick = useCallback((): void => {
        onCopy();
    }, [onCopy]);

    const handleCopyJsonClick = useCallback((): void => {
        onCopyJson();
    }, [onCopyJson]);

    return (
        <div className="settings-subcard settings-subcard--compact settings-maintenance__tools">
            <div className="settings-subcard__header">
                <ThemedText
                    as="div"
                    size="xs"
                    variant="secondary"
                    weight="medium"
                >
                    Tools
                </ThemedText>

                <div className="settings-subcard__actions">
                    <ThemedButton
                        disabled={disabled}
                        icon={copyIcon}
                        onClick={handleCopyClick}
                        size="sm"
                        variant="secondary"
                    >
                        Copy diagnostics
                    </ThemedButton>

                    <ThemedButton
                        disabled={disabled}
                        icon={copyJsonIcon}
                        onClick={handleCopyJsonClick}
                        size="sm"
                        variant="secondary"
                    >
                        Copy JSON
                    </ThemedButton>
                </div>
            </div>

            <ThemedText as="p" className="mt-2" size="xs" variant="tertiary">
                Includes provider status and remote sync preview. Does not include
                passphrases, encryption keys, or OAuth tokens.
            </ThemedText>

            {previewText ? (
                <details className="settings-details mt-3">
                    <summary className="settings-details__summary">
                        <span className="settings-details__summary-inner">
                            <ThemedText
                                as="span"
                                size="xs"
                                variant="secondary"
                                weight="medium"
                            >
                                Preview copied text
                            </ThemedText>
                        </span>
                    </summary>

                    <pre className="settings-mono-block">{previewText}</pre>
                </details>
            ) : null}

            {copyResult ? (
                <div className="mt-2">
                    <ThemedText as="p" size="xs" variant="tertiary">
                        {copyResult.kind === "success"
                            ? "Copied diagnostics to clipboard."
                            : `Failed to copy diagnostics: ${copyResult.message}`}
                    </ThemedText>
                </div>
            ) : null}
        </div>
    );
};
