/**
 * Central confirmation dialog overlay rendered at the application root.
 *
 * @remarks
 * Listens to the global confirmation dialog store and renders a themed modal
 * whenever a confirmation is requested. Provides a consistent, accessible
 * replacement for legacy `window.confirm` usage.
 */

import type { JSX } from "react/jsx-runtime";

import {
    memo,
    type MouseEvent,
    type NamedExoticComponent,
    useCallback,
    useId,
} from "react";

import { useConfirmDialogControls } from "../../../stores/ui/useConfirmDialogStore";
import { ThemedBox } from "../../../theme/components/ThemedBox";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

/**
 * Confirmation dialog component rendered globally.
 */
export const ConfirmDialog: NamedExoticComponent = memo(
    function ConfirmDialog(): JSX.Element | null {
        const { isDark } = useTheme();
        const descriptionId = useId();
        const titleId = useId();
        const { cancel, confirm, request } = useConfirmDialogControls();

        const handleBackdropClick = useCallback(
            (event: MouseEvent<HTMLDivElement>) => {
                if (event.target === event.currentTarget) {
                    cancel();
                }
            },
            [cancel]
        );

        if (!request) {
            return null;
        }

        const { cancelLabel, confirmLabel, details, message, title, tone } =
            request;
        const confirmVariant = tone === "danger" ? "error" : "primary";

        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Modal backdrop requires click handler; keyboard dismissal handled globally via escape key handler
            <div
                className={`modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
                    isDark ? "dark" : ""
                }`}
                onClick={handleBackdropClick}
            >
                <ThemedBox
                    aria-describedby={descriptionId}
                    aria-labelledby={titleId}
                    aria-modal="true"
                    as="section"
                    className="m-4 w-full max-w-md"
                    open
                    padding="lg"
                    role="alertdialog"
                    rounded="lg"
                    shadow="lg"
                    surface="elevated"
                >
                    <div className="mb-4" id={titleId}>
                        <ThemedText size="lg" weight="medium">
                            {title}
                        </ThemedText>
                    </div>

                    <div id={descriptionId}>
                        <ThemedText size="md">{message}</ThemedText>
                    </div>

                    {details ? (
                        <ThemedText className="mt-3" size="sm" variant="info">
                            {details}
                        </ThemedText>
                    ) : null}

                    <div className="mt-6 flex justify-end gap-3">
                        <ThemedButton onClick={cancel} variant="secondary">
                            {cancelLabel}
                        </ThemedButton>
                        <ThemedButton
                            onClick={confirm}
                            variant={confirmVariant}
                        >
                            {confirmLabel}
                        </ThemedButton>
                    </div>
                </ThemedBox>
            </div>
        );
    }
);
