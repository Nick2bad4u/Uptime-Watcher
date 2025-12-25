/**
 * Central confirmation dialog overlay rendered at the application root.
 *
 * @remarks
 * Listens to the global confirmation dialog store and renders a themed modal
 * whenever a confirmation is requested. Provides a consistent, accessible
 * replacement for direct `window.confirm` usage.
 */

import type { JSX } from "react/jsx-runtime";

import { memo, type NamedExoticComponent, useId, useMemo } from "react";

import { useConfirmDialogControls } from "../../../stores/ui/useConfirmDialogStore";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons, getIconSize } from "../../../utils/icons";
import { Modal } from "../Modal/Modal";

function renderEmphasizedMessage(
    message: string,
    emphasisText?: unknown
): JSX.Element {
    if (typeof emphasisText !== "string") {
        return <span>{message}</span>;
    }

    const matchIndex = message.indexOf(emphasisText);
    if (matchIndex === -1) {
        return <span>{message}</span>;
    }

    const before = message.slice(0, matchIndex);
    const after = message.slice(matchIndex + emphasisText.length);

    return (
        <>
            {before}
            <span className="confirm-dialog__emphasis">{emphasisText}</span>
            {after}
        </>
    );
}

/**
 * Confirmation dialog component rendered globally.
 */
export const ConfirmDialog: NamedExoticComponent = memo(
    function ConfirmDialog(): JSX.Element | null {
        const descriptionId = useId();
        const { cancel, confirm, request } = useConfirmDialogControls();

        const tone = request?.tone ?? "default";
        const confirmVariant = tone === "danger" ? "error" : "primary";

        const HeaderIcon =
            tone === "danger" ? AppIcons.status.warning : AppIcons.ui.info;
        const CancelIcon = AppIcons.ui.close;
        const ConfirmIcon =
            tone === "danger" ? AppIcons.actions.remove : AppIcons.status.upAlt;

        const buttonIconSize = getIconSize("sm");
        const headerIconSize = getIconSize("md");

        const cancelButtonIcon = useMemo(
            () => <CancelIcon aria-hidden size={buttonIconSize} />,
            [buttonIconSize, CancelIcon]
        );

        const confirmButtonIcon = useMemo(
            () => <ConfirmIcon aria-hidden size={buttonIconSize} />,
            [buttonIconSize, ConfirmIcon]
        );

        const headerIcon = useMemo(
            () => <HeaderIcon aria-hidden size={headerIconSize} />,
            [HeaderIcon, headerIconSize]
        );

        if (!request) {
            return null;
        }

        const {
            cancelLabel,
            confirmLabel,
            details,
            emphasisText,
            message,
            title,
        } = request;

        const footer: JSX.Element = (
            <>
                <ThemedButton
                    data-testid="confirm-dialog-cancel"
                    icon={cancelButtonIcon}
                    onClick={cancel}
                    variant="secondary"
                >
                    {cancelLabel}
                </ThemedButton>
                <ThemedButton
                    data-testid="confirm-dialog-confirm"
                    icon={confirmButtonIcon}
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
                headerIcon={headerIcon}
                isBodyScrollable={false}
                isOpen
                modalTestId="confirm-dialog"
                onRequestClose={cancel}
                overlayTestId="confirm-dialog-overlay"
                overlayVariant="confirm"
                role="alertdialog"
                showCloseButton={false}
                size="sm"
                title={title}
            >
                <div id={descriptionId}>
                    <ThemedText className="confirm-dialog__message" size="md">
                        {renderEmphasizedMessage(message, emphasisText)}
                    </ThemedText>
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
