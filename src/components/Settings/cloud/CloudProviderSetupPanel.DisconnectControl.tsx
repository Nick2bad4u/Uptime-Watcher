import type { JSX } from "react/jsx-runtime";

import { useCallback } from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";

/**
 * Props for {@link CloudProviderSetupPanelDisconnectControl}.
 */
export interface CloudProviderSetupPanelDisconnectControlProperties {
    readonly configured: boolean;
    readonly connected: boolean;
    readonly isDisconnecting: boolean;
    readonly isProviderOperationPending: boolean;
    readonly onDisconnect: () => void;
}

/**
 * Renders the Disconnect / Clear configuration CTA based on current cloud
 * status.
 */
export const CloudProviderSetupPanelDisconnectControl = ({
    configured,
    connected,
    isDisconnecting,
    isProviderOperationPending,
    onDisconnect,
}: CloudProviderSetupPanelDisconnectControlProperties): JSX.Element | null => {
    const handleDisconnectClick = useCallback((): void => {
        onDisconnect();
    }, [onDisconnect]);

    if (connected) {
        return (
            <ThemedButton
                disabled={isProviderOperationPending}
                onClick={handleDisconnectClick}
                size="sm"
                variant="error"
            >
                {isDisconnecting ? "Disconnecting…" : "Disconnect"}
            </ThemedButton>
        );
    }

    if (configured) {
        return (
            <ThemedButton
                disabled={isProviderOperationPending}
                onClick={handleDisconnectClick}
                size="sm"
                variant="secondary"
            >
                {isDisconnecting ? "Clearing…" : "Clear configuration"}
            </ThemedButton>
        );
    }

    return null;
};
