/**
 * Central confirmation dialog overlay rendered at the application root.
 *
 * @remarks
 * Listens to the global confirmation dialog store and renders a themed modal
 * whenever a confirmation is requested. Provides a consistent, accessible
 * replacement for direct `window.confirm` usage.
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
import "./ConfirmDialog.css";

/**
 * Confirmation dialog component rendered globally.
 */
export const ConfirmDialog: NamedExoticComponent = memo(
    function ConfirmDialog(): JSX.Element | null {
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
                className="modal-overlay modal-overlay--confirm confirm-dialog__overlay"
                data-testid="confirm-dialog-overlay"
                onClick={handleBackdropClick}
            >
                <ThemedBox
                    aria-describedby={descriptionId}
                    aria-labelledby={titleId}
                    aria-modal="true"
                    as="section"
                    className="confirm-dialog__container"
                    data-testid="confirm-dialog"
                    open
                    padding="lg"
                    role="alertdialog"
                    rounded="lg"
                    shadow="lg"
                    surface="elevated"
                >
                    <header className="confirm-dialog__header" id={titleId}>
                        <ThemedText
                            className="confirm-dialog__title"
                            size="lg"
                            weight="medium"
                        >
                            {title}
                        </ThemedText>
                    </header>

                    <div className="confirm-dialog__body" id={descriptionId}>
                        <ThemedText size="md">{message}</ThemedText>
                    </div>

                    {details ? (
                        <ThemedText
                            className="confirm-dialog__details"
                            size="sm"
                            variant="info"
                        >
                            {details}
                        </ThemedText>
                    ) : null}

                    <footer className="confirm-dialog__actions">
                        <ThemedButton
                            data-testid="confirm-dialog-cancel"
                            onClick={cancel}
                            variant="secondary"
                        >
                            {cancelLabel}
                        </ThemedButton>
                        <ThemedButton
                            data-testid="confirm-dialog-confirm"
                            onClick={confirm}
                            variant={confirmVariant}
                        >
                            {confirmLabel}
                        </ThemedButton>
                    </footer>
                </ThemedBox>
            </div>
        );
    }
);
