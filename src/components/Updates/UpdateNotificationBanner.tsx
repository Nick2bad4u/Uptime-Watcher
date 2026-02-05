import type { JSX } from "react/jsx-runtime";

import { memo, type NamedExoticComponent, useCallback } from "react";

import type { UpdateStatus } from "../../stores/types";

import { UI_MESSAGES } from "../../app/appUiMessages";
import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { ThemedText } from "../../theme/components/ThemedText";
import { AppIcons } from "../../utils/icons";

/**
 * Renders the update alert banner shown near the top of the app shell.
 *
 * @remarks
 * This component intentionally preserves the DOM structure and CSS class names
 * that tests assert against (e.g. `.update-alert`, `.update-alert__icon`).
 */
export const UpdateNotificationBanner: NamedExoticComponent<{
    readonly onAction: () => void;
    readonly updateError: string | undefined;
    readonly updateStatus: UpdateStatus;
}> = memo(function UpdateNotificationBanner({
    onAction,
    updateError,
    updateStatus,
}): JSX.Element | null {
    const UpdateWarningIcon = AppIcons.status.warning;
    const UpdateAvailableIcon = AppIcons.actions.refresh;
    const UpdateDownloadingIcon = AppIcons.actions.refreshAlt;
    const UpdateReadyIcon = AppIcons.status.upFilled;

    const handleUpdateButtonClick = useCallback(() => {
        onAction();
    }, [onAction]);

    if (
        !(
            updateStatus === "available" ||
            updateStatus === "downloading" ||
            updateStatus === "downloaded" ||
            updateStatus === "error"
        )
    ) {
        return null;
    }

    if (updateStatus === "error") {
        return (
            <div
                aria-live="assertive"
                className="fixed inset-x-0 top-12 z-50"
                role="alert"
            >
                <ThemedBox
                    className={`update-alert update-alert--${updateStatus}`}
                    padding="md"
                    surface="elevated"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="update-alert__icon">
                                <UpdateWarningIcon
                                    className="update-alert__icon-symbol"
                                    size={20}
                                />
                            </div>
                            <ThemedText size="sm" variant="error">
                                {updateError ??
                                    UI_MESSAGES.UPDATE_ERROR_FALLBACK}
                            </ThemedText>
                        </div>
                        <ThemedButton
                            className="update-alert__action ml-4"
                            onClick={handleUpdateButtonClick}
                            size="sm"
                            variant="secondary"
                        >
                            {UI_MESSAGES.UPDATE_DISMISS_BUTTON}
                        </ThemedButton>
                    </div>
                </ThemedBox>
            </div>
        );
    }

    return (
        <output aria-live="polite" className="fixed inset-x-0 top-12 z-50">
            <ThemedBox
                className={`update-alert update-alert--${updateStatus}`}
                padding="md"
                surface="elevated"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="update-alert__icon">
                            {updateStatus === "available" ? (
                                <UpdateAvailableIcon
                                    className="update-alert__icon-symbol"
                                    size={20}
                                />
                            ) : null}
                            {updateStatus === "downloading" ? (
                                <UpdateDownloadingIcon
                                    className="update-alert__icon-symbol"
                                    size={20}
                                />
                            ) : null}
                            {updateStatus === "downloaded" ? (
                                <UpdateReadyIcon
                                    className="update-alert__icon-symbol"
                                    size={20}
                                />
                            ) : null}
                        </div>
                        <ThemedText size="sm" variant="primary">
                            {updateStatus === "available" &&
                                UI_MESSAGES.UPDATE_AVAILABLE}
                            {updateStatus === "downloading" &&
                                UI_MESSAGES.UPDATE_DOWNLOADING}
                            {updateStatus === "downloaded" &&
                                UI_MESSAGES.UPDATE_DOWNLOADED}
                        </ThemedText>
                    </div>
                    {updateStatus === "downloaded" ? (
                        <ThemedButton
                            className="update-alert__action ml-4"
                            onClick={handleUpdateButtonClick}
                            size="sm"
                            variant="secondary"
                        >
                            {UI_MESSAGES.UPDATE_RESTART_BUTTON}
                        </ThemedButton>
                    ) : null}
                </div>
            </ThemedBox>
        </output>
    );
});
