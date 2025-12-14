/**
 * Global prompt dialog store.
 *
 * @remarks
 * Provides a centralized mechanism for collecting short user input (e.g.
 * passphrases) via a themed modal, without relying on `window.prompt`.
 * Consumers call {@link requestPrompt} and receive the result as a promise.
 */

import { useMemo } from "react";
import { create, type StoreApi, type UseBoundStore } from "zustand";

/**
 * Input type displayed by the prompt dialog.
 */
export type PromptDialogInputType = "password" | "text";

/**
 * Options accepted when requesting a prompt dialog.
 */
export interface PromptDialogOptions {
    readonly cancelLabel?: string;
    readonly confirmLabel?: string;
    readonly message: string;
    readonly placeholder?: string;
    readonly title: string;
    readonly type?: PromptDialogInputType;
}

/**
 * Normalized request stored in the prompt dialog store.
 */
export interface PromptDialogRequest {
    readonly cancelLabel: string;
    readonly confirmLabel: string;
    readonly message: string;
    readonly placeholder?: string;
    readonly title: string;
    readonly type: PromptDialogInputType;
}

interface PromptDialogState {
    readonly cancel: () => void;
    readonly confirm: () => void;
    readonly open: (
        request: PromptDialogRequest,
        resolver: (result: null | string) => void
    ) => void;
    readonly request: null | PromptDialogRequest;
    readonly resolve: ((result: null | string) => void) | null;
    readonly setValue: (value: string) => void;
    readonly value: string;
}

const DEFAULT_CONFIRM_LABEL = "Confirm";
const DEFAULT_CANCEL_LABEL = "Cancel";
const DEFAULT_INPUT_TYPE: PromptDialogInputType = "text";

const selectCancel = (state: PromptDialogState): PromptDialogState["cancel"] =>
    state.cancel;
const selectConfirm = (
    state: PromptDialogState
): PromptDialogState["confirm"] => state.confirm;
const selectRequest = (
    state: PromptDialogState
): PromptDialogState["request"] => state.request;
const selectSetValue = (
    state: PromptDialogState
): PromptDialogState["setValue"] => state.setValue;
const selectValue = (state: PromptDialogState): string => state.value;
const selectIsOpen = (state: PromptDialogState): boolean =>
    state.request !== null;

/**
 * Zustand store holding the active prompt dialog state.
 */
export const usePromptDialogStore: UseBoundStore<StoreApi<PromptDialogState>> =
    create<PromptDialogState>((set, get) => {
        const resolveAndReset = (result: null | string): void => {
            const { resolve } = get();
            set({ request: null, resolve: null, value: "" });
            resolve?.(result);
        };

        return {
            cancel(): void {
                resolveAndReset(null);
            },
            confirm(): void {
                resolveAndReset(get().value);
            },
            open(request, resolver): void {
                const { request: activeRequest, resolve: activeResolver } =
                    get();

                if (activeRequest) {
                    activeResolver?.(null);
                }

                set({ request, resolve: resolver, value: "" });
            },
            request: null,
            resolve: null,
            setValue(value: string): void {
                set({ value });
            },
            value: "",
        };
    });

/**
 * State shape of the prompt dialog store.
 */
export type PromptDialogStoreState = ReturnType<
    typeof usePromptDialogStore.getState
>;

/**
 * Controls and state required to render and operate the prompt dialog.
 */
export interface PromptDialogControls {
    readonly cancel: PromptDialogState["cancel"];
    readonly confirm: PromptDialogState["confirm"];
    readonly request: PromptDialogState["request"];
    readonly setValue: PromptDialogState["setValue"];
    readonly value: string;
}

/**
 * Minimal state for rendering/dismissing the global prompt dialog.
 */
export interface PromptDialogVisibility {
    readonly cancel: PromptDialogState["cancel"];
    readonly isOpen: boolean;
}

/**
 * Returns the prompt dialog controls needed to render and operate the dialog.
 */
export function usePromptDialogControls(): PromptDialogControls {
    const cancel = usePromptDialogStore(selectCancel);
    const confirm = usePromptDialogStore(selectConfirm);
    const request = usePromptDialogStore(selectRequest);
    const setValue = usePromptDialogStore(selectSetValue);
    const value = usePromptDialogStore(selectValue);

    return useMemo(
        () => ({
            cancel,
            confirm,
            request,
            setValue,
            value,
        }),
        [
            cancel,
            confirm,
            request,
            setValue,
            value,
        ]
    );
}

/**
 * Returns whether the prompt dialog is currently open.
 */
export function usePromptDialogVisibility(): PromptDialogVisibility {
    const cancel = usePromptDialogStore(selectCancel);
    const isOpen = usePromptDialogStore(selectIsOpen);

    return useMemo(
        () => ({
            cancel,
            isOpen,
        }),
        [cancel, isOpen]
    );
}

/**
 * Opens a prompt dialog and resolves with the user's input.
 */
export async function requestPrompt(
    options: PromptDialogOptions
): Promise<null | string> {
    const { open } = usePromptDialogStore.getState();
    const request: PromptDialogRequest = {
        cancelLabel: options.cancelLabel ?? DEFAULT_CANCEL_LABEL,
        confirmLabel: options.confirmLabel ?? DEFAULT_CONFIRM_LABEL,
        message: options.message,
        title: options.title,
        type: options.type ?? DEFAULT_INPUT_TYPE,
        ...(options.placeholder ? { placeholder: options.placeholder } : {}),
    };

    return new Promise<null | string>((resolve) => {
        open(request, resolve);
    });
}
