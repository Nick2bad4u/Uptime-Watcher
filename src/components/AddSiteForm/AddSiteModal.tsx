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

import React, { useCallback, useEffect } from "react";

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
export const AddSiteModal: React.NamedExoticComponent<object> = React.memo(
    function AddSiteModal() {
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

        // Handle escape key for modal
        useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Escape" && showAddSiteModal) {
                    handleClose();
                }
            };

            if (showAddSiteModal) {
                document.addEventListener("keydown", handleKeyDown);
            }

            return () => {
                document.removeEventListener("keydown", handleKeyDown);
            };
        }, [handleClose, showAddSiteModal]);

        if (!showAddSiteModal) {
            // eslint-disable-next-line react/jsx-no-useless-fragment
            return <></>;
        }

        return (
            /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm ${
                    isDark ? "dark" : ""
                }`}
                onClick={handleBackdropClick}
            >
                <ThemedBox
                    className="m-4 max-h-screen w-full max-w-2xl overflow-y-auto"
                    padding="lg"
                    rounded="lg"
                    shadow="lg"
                    surface="elevated"
                >
                    {/* Modal Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <ThemedText size="xl" weight="medium">
                            Add New Site
                        </ThemedText>
                        <ThemedButton
                            aria-label="Close modal"
                            onClick={handleClose}
                            size="sm"
                            title="Close"
                            variant="secondary"
                        >
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
    }
);
