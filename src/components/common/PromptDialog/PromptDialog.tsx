/**
 * Central prompt dialog overlay rendered at the application root.
 */

import type { JSX } from "react/jsx-runtime";

import {
    type ChangeEvent,
    type FormEvent,
    memo,
    type NamedExoticComponent,
    useCallback,
    useId,
} from "react";

import { usePromptDialogControls } from "../../../stores/ui/usePromptDialogStore";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedInput } from "../../../theme/components/ThemedInput";
import { ThemedText } from "../../../theme/components/ThemedText";
import { Modal } from "../Modal/Modal";

export const PromptDialog: NamedExoticComponent = memo(
    function PromptDialog(): JSX.Element | null {
        const descriptionId = useId();
        const formId = useId();
        const { cancel, confirm, request, setValue, value } =
            usePromptDialogControls();

        const handleChange = useCallback(
            (event: ChangeEvent<HTMLInputElement>): void => {
                setValue(event.target.value);
            },
            [setValue]
        );

        const handleSubmit = useCallback(
            (event: FormEvent<HTMLFormElement>): void => {
                event.preventDefault();

                if (value.trim().length === 0) {
                    return;
                }

                confirm();
            },
            [confirm, value]
        );

        if (!request) {
            return null;
        }

        const { cancelLabel, confirmLabel, message, placeholder, title, type } =
            request;
        const isConfirmDisabled = value.trim().length === 0;

        const footer: JSX.Element = (
            <>
                <ThemedButton
                    data-testid="prompt-dialog-cancel"
                    onClick={cancel}
                    variant="secondary"
                >
                    {cancelLabel}
                </ThemedButton>
                <ThemedButton
                    data-testid="prompt-dialog-confirm"
                    disabled={isConfirmDisabled}
                    form={formId}
                    type="submit"
                    variant="primary"
                >
                    {confirmLabel}
                </ThemedButton>
            </>
        );

        return (
            <Modal
                ariaDescribedById={descriptionId}
                closeOnOverlayClick
                escapePriority={150}
                footer={footer}
                isBodyScrollable={false}
                isOpen
                modalTestId="prompt-dialog"
                onRequestClose={cancel}
                overlayTestId="prompt-dialog-overlay"
                showCloseButton={false}
                size="sm"
                title={title}
            >
                <div id={descriptionId}>
                    <ThemedText size="md">{message}</ThemedText>
                </div>

                <form className="mt-3" id={formId} onSubmit={handleSubmit}>
                    <ThemedInput
                        aria-label={title}
                        onChange={handleChange}
                        type={type}
                        value={value}
                        {...(placeholder === undefined
                            ? {}
                            : { placeholder })}
                    />
                </form>
            </Modal>
        );
    }
);
