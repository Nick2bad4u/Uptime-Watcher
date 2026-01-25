import type { JSX } from "react/jsx-runtime";

import { useCallback } from "react";

import { ErrorAlert } from "../../common/ErrorAlert/ErrorAlert";

/**
 * Props for {@link CloudProviderSetupPanelProviderLockNotice}.
 */
export interface CloudProviderSetupPanelProviderLockNoticeProperties {
    readonly attemptMessage: null | string;
    readonly infoMessage: null | string;
    readonly onDismissAttempt: () => void;
}

/**
 * Renders the provider lock status callout(s) shown beneath the tab strip.
 */
export const CloudProviderSetupPanelProviderLockNotice = ({
    attemptMessage,
    infoMessage,
    onDismissAttempt,
}: CloudProviderSetupPanelProviderLockNoticeProperties): JSX.Element | null => {
    const handleDismissAttempt = useCallback((): void => {
        onDismissAttempt();
    }, [onDismissAttempt]);

    if (attemptMessage) {
        return (
            <ErrorAlert
                message={attemptMessage}
                onDismiss={handleDismissAttempt}
                variant="warning"
            />
        );
    }

    if (infoMessage) {
        return <ErrorAlert message={infoMessage} variant="info" />;
    }

    return null;
};
