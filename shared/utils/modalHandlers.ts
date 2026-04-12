/**
 * Common modal management utilities for reducing duplication across modal
 * components.
 *
 * @remarks
 * This module provides standardized utilities for modal state management,
 * including close handlers, keyboard event handling, and common modal patterns
 * found throughout the application.
 *
 * @packageDocumentation
 */

import { type SetStateAction, useCallback, useEffect, useState } from "react";

/**
 * Type for a state setter function.
 */
export type StateSetter<T> = (value: SetStateAction<T>) => void;

/**
 * Creates a standardized modal close handler.
 *
 * @remarks
 * Provides a memoized callback for closing modals by setting state to false.
 * Common pattern found across modal components.
 *
 * @param setShowModal - State setter function for the modal visibility
 *
 * @returns Memoized close handler function
 */
export function useModalCloseHandler(
    setShowModal: StateSetter<boolean>
): () => void {
    return useCallback(() => {
        setShowModal(false);
    }, [setShowModal]);
}

/**
 * Configuration for escape key modal handling.
 */
export interface EscapeKeyModalConfig {
    /** Whether this modal is currently open */
    isOpen: boolean;
    /** Handler to close this modal */
    onClose: () => void;
    /** Priority for closing (higher numbers close first) */
    priority?: number;
}

/**
 * Sets up escape key handling for multiple modals with priority.
 *
 * @remarks
 * Handles escape key events to close modals in priority order. Higher priority
 * modals are closed first.
 *
 * @param modalConfigs - Array of modal configurations
 */
export function useEscapeKeyModalHandler(
    modalConfigs: EscapeKeyModalConfig[]
): void {
    useEffect(
        function setupEscapeKeyModalHandler(): () => void {
            const handleKeyDown = (event: KeyboardEvent): void => {
                if (event.key === "Escape") {
                    // Sort by priority (highest first) and find the first open modal
                    const sortedConfigs = modalConfigs.toSorted(
                        (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
                    );

                    const openModal = sortedConfigs.find(
                        (config) => config.isOpen
                    );
                    if (openModal) {
                        event.preventDefault();
                        openModal.onClose();
                    }
                }
            };

            document.addEventListener("keydown", handleKeyDown);

            return (): void => {
                document.removeEventListener("keydown", handleKeyDown);
            };
        },
        [modalConfigs]
    );
}

/**
 * Creates a toggle handler for modal state.
 *
 * @remarks
 * Provides a memoized callback for toggling modal visibility.
 *
 * @param setShowModal - State setter function for the modal visibility
 *
 * @returns Memoized toggle handler function
 */
export function useModalToggleHandler(
    setShowModal: StateSetter<boolean>
): () => void {
    return useCallback(() => {
        setShowModal((prev) => !prev);
    }, [setShowModal]);
}

/**
 * Creates an open handler for modal state.
 *
 * @remarks
 * Provides a memoized callback for opening modals by setting state to true.
 *
 * @param setShowModal - State setter function for the modal visibility
 *
 * @returns Memoized open handler function
 */
export function useModalOpenHandler(
    setShowModal: StateSetter<boolean>
): () => void {
    return useCallback(() => {
        setShowModal(true);
    }, [setShowModal]);
}

/**
 * Hook for managing a single modal's state with open, close, and toggle
 * handlers.
 *
 * @remarks
 * Combines modal state management with handler creation for convenience.
 *
 * @param initialState - Initial visibility state (default: false)
 *
 * @returns Object containing state and handlers
 */
export function useModalState(initialState = false): {
    close: () => void;
    isOpen: boolean;
    open: () => void;
    setIsOpen: StateSetter<boolean>;
    toggle: () => void;
} {
    const [isOpen, setIsOpen] = useState(initialState);

    const open = useModalOpenHandler(setIsOpen);
    const close = useModalCloseHandler(setIsOpen);
    const toggle = useModalToggleHandler(setIsOpen);

    return {
        close,
        isOpen,
        open,
        setIsOpen,
        toggle,
    };
}

/**
 * Creates handlers for modal interactions with additional context.
 *
 * @remarks
 * Utility for creating handlers that need to perform additional actions when
 * opening or closing modals.
 *
 * @param setShowModal - State setter function for the modal visibility
 * @param onOpen - Optional callback to run when opening
 * @param onClose - Optional callback to run when closing
 *
 * @returns Object with open and close handlers
 */
export function useModalHandlersWithCallbacks(
    setShowModal: StateSetter<boolean>,
    onOpen?: () => void,
    onClose?: () => void
): {
    close: () => void;
    open: () => void;
} {
    const open = useCallback(() => {
        setShowModal(true);
        onOpen?.();
    }, [onOpen, setShowModal]);

    const close = useCallback(() => {
        setShowModal(false);
        onClose?.();
    }, [onClose, setShowModal]);

    return { close, open };
}
