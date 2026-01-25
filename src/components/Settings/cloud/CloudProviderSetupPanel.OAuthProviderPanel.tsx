import type { ReactNode } from "react";
import type { JSX } from "react/jsx-runtime";

import { useCallback, useMemo } from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons } from "../../../utils/icons";
import { Tooltip } from "../../common/Tooltip/Tooltip";

/**
 * Props for {@link CloudProviderSetupPanelOAuthProviderPanel}.
 */
export interface CloudProviderSetupPanelOAuthProviderPanelProperties {
    readonly children?: ReactNode;
    readonly configured: boolean;
    readonly connected: boolean;
    readonly description: string;
    readonly isConnecting: boolean;
    readonly onConnect: () => void;
    readonly providerKey: "dropbox" | "google-drive";
    readonly providerLabel: string;
}

function resolveConnectActionLabel(args: {
    configured: boolean;
    isConnecting: boolean;
    providerLabel: string;
}): string {
    if (args.isConnecting) {
        return "Connecting…";
    }

    return args.configured
        ? `Reconnect ${args.providerLabel}`
        : `Connect ${args.providerLabel}`;
}

/**
 * Shared panel body for OAuth providers (Dropbox, Google Drive).
 */
export const CloudProviderSetupPanelOAuthProviderPanel = ({
    children,
    configured,
    connected,
    description,
    isConnecting,
    onConnect,
    providerKey,
    providerLabel,
}: CloudProviderSetupPanelOAuthProviderPanelProperties): JSX.Element => {
    const connectLabel = resolveConnectActionLabel({
        configured,
        isConnecting,
        providerLabel,
    });

    const handleConnectClick = useCallback((): void => {
        onConnect();
    }, [onConnect]);

    const ProviderIcon =
        providerKey === "dropbox"
            ? AppIcons.brands.dropbox
            : AppIcons.brands.googleDrive;
    const ConnectedIcon = AppIcons.status.upFilled;
    const InfoIcon = AppIcons.ui.info;

    const providerIconNode = useMemo(
        () => <ProviderIcon aria-hidden className="size-4" />,
        [ProviderIcon]
    );
    const connectedIconNode = useMemo(
        () => <ConnectedIcon aria-hidden className="size-4" />,
        [ConnectedIcon]
    );
    const infoIconNode = useMemo(
        () => <InfoIcon aria-hidden className="size-4" />,
        [InfoIcon]
    );

    return (
        <div
            aria-labelledby={`cloud-provider-tab-${providerKey}`}
            className="mt-3"
            id={`cloud-provider-panel-${providerKey}`}
            role="tabpanel"
        >
            {children}

            <div className="settings-subcard settings-subcard--compact mt-3">
                <div className="settings-subcard__header">
                    <ThemedText
                        as="div"
                        size="xs"
                        variant="secondary"
                        weight="medium"
                    >
                        Authorization
                    </ThemedText>

                    <div className="settings-subcard__actions">
                        <Tooltip
                            content={description}
                            maxWidth={520}
                            position="top"
                        >
                            {(trigger) => (
                                <button
                                    aria-label="Authorization details"
                                    className="settings-provider__tooltip-button"
                                    type="button"
                                    {...trigger}
                                >
                                    {infoIconNode}
                                </button>
                            )}
                        </Tooltip>
                    </div>
                </div>

                {connected ? (
                    <div className="settings-provider__connected-row">
                        <span
                            aria-hidden
                            className="settings-provider__connected-icon settings-accent--success"
                        >
                            {connectedIconNode}
                        </span>
                        <ThemedText as="p" size="xs" variant="tertiary">
                            Connected. To switch accounts or providers,
                            disconnect above and connect again.
                        </ThemedText>
                    </div>
                ) : null}
            </div>

            {connected ? null : (
                <div className="mt-3 flex flex-wrap gap-2">
                    <ThemedButton
                        aria-disabled={isConnecting}
                        disabled={isConnecting}
                        icon={providerIconNode}
                        onClick={handleConnectClick}
                        size="sm"
                        variant="primary"
                    >
                        {connectLabel}
                    </ThemedButton>
                </div>
            )}
        </div>
    );
};
