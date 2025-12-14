/**
 * Central prompt dialog overlay rendered at the application root.
 */

import type { JSX } from "react/jsx-runtime";

import {
    type ChangeEvent,
    memo,
    type MouseEvent,
    type NamedExoticComponent,
    useCallback,
    useId,
} from "react";

import { usePromptDialogControls } from "../../../stores/ui/usePromptDialogStore";
import { ThemedBox } from "../../../theme/components/ThemedBox";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedInput } from "../../../theme/components/ThemedInput";
import { ThemedText } from "../../../theme/components/ThemedText";
import "./PromptDialog.css";

export const PromptDialog: NamedExoticComponent = memo(
    function PromptDialog(): JSX.Element | null {
        const descriptionId = useId();
        const titleId = useId();
        const { cancel, confirm, request, setValue, value } =
            usePromptDialogControls();

        const handleBackdropClick = useCallback(
            (event: MouseEvent<HTMLDivElement>): void => {
                if (event.target === event.currentTarget) {
                    cancel();
                }
            },
            [cancel]
        );

        const handleChange = useCallback(
            (event: ChangeEvent<HTMLInputElement>): void => {
                setValue(event.target.value);
            },
            [setValue]
        );

        const handleConfirm = useCallback((): void => {
            confirm();
        }, [confirm]);

        if (!request) {
            return null;
        }

        const { cancelLabel, confirmLabel, message, placeholder, title, type } =
            request;
        const isConfirmDisabled = value.trim().length === 0;

        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Modal backdrop requires click handler; keyboard dismissal handled globally via escape key handler
            <div
                className="modal-overlay modal-overlay--prompt prompt-dialog__overlay"
                data-testid="prompt-dialog-overlay"
                onClick={handleBackdropClick}
            >
                <ThemedBox
                    aria-describedby={descriptionId}
                    aria-labelledby={titleId}
                    aria-modal="true"
                    as="dialog"
                    className="prompt-dialog__container"
                    data-testid="prompt-dialog"
                    open
                    padding="lg"
                    rounded="lg"
                    shadow="lg"
                    surface="elevated"
                >
                    <header className="prompt-dialog__header" id={titleId}>
                        <ThemedText
                            className="prompt-dialog__title"
                            size="lg"
                            weight="medium"
                        >
                            {title}
                        </ThemedText>
                    </header>

                    <div className="prompt-dialog__body" id={descriptionId}>
                        <ThemedText size="md">{message}</ThemedText>
                    </div>

                    <div className="prompt-dialog__input">
                        <ThemedInput
                            aria-label={title}
                            onChange={handleChange}
                            type={type}
                            value={value}
                            {...(placeholder === undefined
                                ? {}
                                : { placeholder })}
                        />
                    </div>

                    <footer className="prompt-dialog__actions">
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
                            onClick={handleConfirm}
                            variant="primary"
                        >
                            {confirmLabel}
                        </ThemedButton>
                    </footer>
                </ThemedBox>
            </div>
        );
    }
);
