/**
 * Global confirmation dialog store.
 *
 * @remarks
 * Provides a centralized mechanism for rendering modern confirmation dialogs
 * without relying on legacy browser alert APIs. Consumers call
 * {@link requestConfirmation} to display the dialog and receive the user's
 * response as a promise.
 *
 * @public
 */

import { useMemo } from "react";
import { create, type StoreApi, type UseBoundStore } from "zustand";

/**
 * Visual tone for the confirm action button.
 *
 * @public
 */
export type ConfirmDialogTone = "danger" | "default";

/**
 * Options accepted when requesting a confirmation dialog.
 *
 * @public
 */
export interface ConfirmDialogOptions {
    /** Custom label for the cancel action button. */
    readonly cancelLabel?: string;
    /** Custom label for the confirm action button. */
    readonly confirmLabel?: string;
    /** Optional additional detail text. */
    readonly details?: string;
    /** Primary message describing the action. */
    readonly message: string;
    /** Dialog headline shown to the user. */
    readonly title: string;
    /** Visual tone for the confirm action button. */
    readonly tone?: ConfirmDialogTone;
}

/**
 * Normalized request stored in the confirm dialog store.
 *
 * @public
 */
export interface ConfirmDialogRequest {
    readonly cancelLabel: string;
    readonly confirmLabel: string;
    readonly details?: string;
    readonly message: string;
    readonly title: string;
    readonly tone: ConfirmDialogTone;
}

interface ConfirmDialogState {
    readonly cancel: () => void;
    readonly confirm: () => void;
    readonly open: (
        request: ConfirmDialogRequest,
        resolver: (result: boolean) => void
    ) => void;
    readonly request: ConfirmDialogRequest | null;
    readonly resolve: ((result: boolean) => void) | null;
}

const DEFAULT_CONFIRM_LABEL = "Confirm";
const DEFAULT_CANCEL_LABEL = "Cancel";

const selectCancel = (
    state: ConfirmDialogState
): ConfirmDialogState["cancel"] => state.cancel;
const selectConfirm = (
    state: ConfirmDialogState
): ConfirmDialogState["confirm"] => state.confirm;
const selectRequest = (
    state: ConfirmDialogState
): ConfirmDialogState["request"] => state.request;
const selectIsOpen = (state: ConfirmDialogState): boolean =>
    state.request !== null;

/**
 * Zustand store holding the active confirmation dialog state.
 *
 * @public
 */
export const useConfirmDialogStore: UseBoundStore<
    StoreApi<ConfirmDialogState>
> = create<ConfirmDialogState>((set, get) => {
    const resolveAndReset = (result: boolean): void => {
        const { resolve } = get();
        set({ request: null, resolve: null });
        resolve?.(result);
    };

    return {
        cancel(): void {
            resolveAndReset(false);
        },
        confirm(): void {
            resolveAndReset(true);
        },
        open(request, resolver): void {
            const { request: activeRequest, resolve: activeResolver } = get();
            if (activeRequest) {
                // Resolve outstanding request as cancelled before opening the new one.
                activeResolver?.(false);
            }
            set({ request, resolve: resolver });
        },
        request: null,
        resolve: null,
    };
});

if (typeof window !== "undefined") {
    const automationTarget = globalThis as typeof globalThis & {
        playwrightConfirmDialog?: {
            cancel: () => void;
            confirm: () => void;
            getState: () => ConfirmDialogStoreState;
            subscribe: (
                listener: (state: ConfirmDialogStoreState) => void
            ) => () => void;
        };
    };

    automationTarget.playwrightConfirmDialog = {
        cancel: (): void => {
            useConfirmDialogStore.getState().cancel();
        },
        confirm: (): void => {
            useConfirmDialogStore.getState().confirm();
        },
        getState: (): ConfirmDialogStoreState =>
            useConfirmDialogStore.getState(),
        subscribe: (
            listener: (state: ConfirmDialogStoreState) => void
        ): (() => void) =>
            useConfirmDialogStore.subscribe((state) => {
                listener(state);
            }),
    };
}

/**
 * State shape of the confirmation dialog store.
 *
 * @public
 */
export type ConfirmDialogStoreState = ReturnType<
    typeof useConfirmDialogStore.getState
>;

/**
 * Shape of the confirm dialog controls returned by
 * {@link useConfirmDialogControls}.
 *
 * @public
 */
export interface ConfirmDialogControls {
    /** Close the active confirmation dialog, resolving to `false`. */
    readonly cancel: ConfirmDialogState["cancel"];
    /** Confirm the active confirmation dialog, resolving to `true`. */
    readonly confirm: ConfirmDialogState["confirm"];
    /** Currently active confirmation dialog request, if any. */
    readonly request: ConfirmDialogState["request"];
}

/**
 * Shape of the confirm dialog visibility helpers returned by
 * {@link useConfirmDialogVisibility}.
 *
 * @public
 */
export interface ConfirmDialogVisibility {
    /** Cancel handler suitable for closing the dialog from UI integrations. */
    readonly cancel: ConfirmDialogState["cancel"];
    /** `true` when a confirmation dialog request is active. */
    readonly isOpen: boolean;
}

/**
 * Provides memoized cancel/confirm handlers and the active request payload.
 *
 * @returns Stable confirm dialog controls for rendering components.
 *
 * @public
 */
export function useConfirmDialogControls(): ConfirmDialogControls {
    const cancel = useConfirmDialogStore(selectCancel);
    const confirm = useConfirmDialogStore(selectConfirm);
    const request = useConfirmDialogStore(selectRequest);

    return useMemo(
        () => ({
            cancel,
            confirm,
            request,
        }),
        [
            cancel,
            confirm,
            request,
        ]
    );
}

/**
 * Exposes dialog visibility information for consumers that only need close
 * semantics.
 *
 * @remarks
 * Maintains stable references for escape key handling and other modal
 * integrations.
 *
 * @returns Stable cancel handler and boolean flag describing dialog visibility.
 *
 * @public
 */
export function useConfirmDialogVisibility(): ConfirmDialogVisibility {
    const cancel = useConfirmDialogStore(selectCancel);
    const isOpen = useConfirmDialogStore(selectIsOpen);

    return useMemo(
        () => ({
            cancel,
            isOpen,
        }),
        [cancel, isOpen]
    );
}

/**
 * Opens a confirmation dialog and resolves with the user's choice.
 *
 * @param options - Dialog configuration options.
 *
 * @returns Promise resolving to `true` when the user confirms, `false`
 *   otherwise.
 *
 * @public
 */
export async function requestConfirmation(
    options: ConfirmDialogOptions
): Promise<boolean> {
    const { open } = useConfirmDialogStore.getState();
    const request: ConfirmDialogRequest = {
        cancelLabel: options.cancelLabel ?? DEFAULT_CANCEL_LABEL,
        confirmLabel: options.confirmLabel ?? DEFAULT_CONFIRM_LABEL,
        message: options.message,
        title: options.title,
        tone: options.tone ?? "default",
        ...(options.details ? { details: options.details } : {}),
    };

    return new Promise<boolean>((resolve) => {
        open(request, resolve);
    });
}

/**
 * Resets the confirm dialog state. Intended for test cleanup.
 *
 * @public
 */
export function resetConfirmDialogState(): void {
    useConfirmDialogStore.setState({ request: null, resolve: null });
}
