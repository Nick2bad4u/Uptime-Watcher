/**
 * AddSiteModal component that wraps the AddSiteForm in a modal dialog.
 *
 * @remarks
 * - Provides a modal wrapper for the AddSiteForm component
 * - Manages its own visibility state via the UI store
 * - Handles form success by closing the modal
 * - Uses consistent theming and modal patterns
 *
 * @packageDocumentation
 */

import React, { useCallback } from "react";

import { useUIStore } from "../../stores/ui/useUiStore";
import { ThemedBox, ThemedButton, ThemedText } from "../../theme/components";
import { useTheme } from "../../theme/useTheme";
import { AddSiteForm } from "./AddSiteForm";

/**
 * Modal wrapper for the AddSiteForm component.
 *
 * @remarks
 * Provides a modal dialog containing the AddSiteForm with proper theming
 * and close functionality. Automatically closes when form submission succeeds.
 *
 * @returns JSX element containing the modal dialog with AddSiteForm
 */
export const AddSiteModal = React.memo(function AddSiteModal() {
    const { isDark } = useTheme();
    const { setShowAddSiteModal, showAddSiteModal } = useUIStore();

    const handleClose = useCallback(() => {
        setShowAddSiteModal(false);
    }, [setShowAddSiteModal]);

    const handleBackdropClick = useCallback(
        (event: React.MouseEvent) => {
            if (event.target === event.currentTarget) {
                handleClose();
            }
        },
        [handleClose]
    );

    const handleEscapeKey = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === "Escape") {
                handleClose();
            }
        },
        [handleClose]
    );

    if (!showAddSiteModal) {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    }

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-30 ${
                isDark ? "dark" : ""
            }`}
            onClick={handleBackdropClick}
            onKeyDown={handleEscapeKey}
            role="button"
            tabIndex={0}
        >
            <ThemedBox
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
                padding="lg"
                rounded="lg"
                shadow="lg"
                surface="elevated"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                    <ThemedText size="xl" weight="medium">
                        Add New Site
                    </ThemedText>
                    <ThemedButton aria-label="Close modal" onClick={handleClose} size="sm" variant="secondary">
                        ✕
                    </ThemedButton>
                </div>

                {/* Modal Content */}
                <div className="-m-4">
                    <AddSiteForm onSuccess={handleClose} />
                </div>
            </ThemedBox>
        </div>
    );
});
