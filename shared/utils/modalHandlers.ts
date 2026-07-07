/**
 * Common modal management utilities for reducing duplication across modal
 * components.
 *
 * @remarks
 * This module provides standardized utilities for modal state management,
 * including close handlers, keyboard event handling, and common modal patterns
 * found throughout the app.
 *
 * @packageDocumentation
 */

import {
    getCallableDataProperty,
    getOwnPropertyValue,
} from "./errorPropertyAccess";
import { useEffect } from "react";

const noop = (): void => undefined;

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

function addDocumentKeyDownListener(
    handler: (event: KeyboardEvent) => void
): () => void {
    const documentProperty = getOwnPropertyValue(globalThis, "document");

    if (!documentProperty.found) {
        return noop;
    }

    const addEventListener = getCallableDataProperty(
        documentProperty.value,
        "addEventListener"
    );
    const removeEventListener = getCallableDataProperty(
        documentProperty.value,
        "removeEventListener"
    );

    if (!addEventListener || !removeEventListener) {
        return noop;
    }

    try {
        Reflect.apply(addEventListener, documentProperty.value, [
            "keydown",
            handler,
        ]);
    } catch {
        return noop;
    }

    return (): void => {
        try {
            Reflect.apply(removeEventListener, documentProperty.value, [
                "keydown",
                handler,
            ]);
        } catch {
            // Listener cleanup must remain best-effort during teardown.
        }
    };
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
                if (event.key !== "Escape") {
                    return;
                }

                // Sort by priority (highest first) and find the first open modal
                const sortedConfigs = modalConfigs.toSorted(
                    (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
                );

                const openModal = sortedConfigs.find((config) => config.isOpen);
                if (openModal) {
                    event.preventDefault();
                    openModal.onClose();
                }
            };

            return addDocumentKeyDownListener(handleKeyDown);
        },
        [modalConfigs]
    );
}
