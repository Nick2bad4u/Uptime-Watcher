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
    type NamedExoticComponent,
    useId,
} from "react";

import { useConfirmDialogControls } from "../../../stores/ui/useConfirmDialogStore";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { Modal } from "../Modal/Modal";

/**
 * Confirmation dialog component rendered globally.
 */
export const ConfirmDialog: NamedExoticComponent = memo(
    function ConfirmDialog(): JSX.Element | null {
        const descriptionId = useId();
        const { cancel, confirm, request } = useConfirmDialogControls();

        if (!request) {
            return null;
        }

        const { cancelLabel, confirmLabel, details, message, title, tone } =
            request;
        const confirmVariant = tone === "danger" ? "error" : "primary";

        const footer: JSX.Element = (
            <>
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
            </>
        );

        return (
            <Modal
                accent={tone === "danger" ? "danger" : "default"}
                ariaDescribedById={descriptionId}
                closeOnOverlayClick
                escapePriority={150}
                footer={footer}
                isBodyScrollable={false}
                isOpen
                modalTestId="confirm-dialog"
                onRequestClose={cancel}
                overlayTestId="confirm-dialog-overlay"
                role="alertdialog"
                showCloseButton={false}
                size="sm"
                title={title}
            >
                <div id={descriptionId}>
                    <ThemedText size="md">{message}</ThemedText>
                </div>

                {details ? (
                    <ThemedText className="mt-3" size="sm" variant="info">
                        {details}
                    </ThemedText>
                ) : null}
            </Modal>
        );
    }
);
