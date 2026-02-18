/**
 * AddSiteModal component that wraps the AddSiteForm in a modal dialog.
 *
 * @remarks
 * -
 *
 * Provides a modal wrapper for the AddSiteForm component
 *
 * - Parent-controlled visibility via onClose prop
 * - Handles form success by closing the modal
 * - Uses consistent theming and modal patterns
 *
 * @packageDocumentation
 */

import { memo, type NamedExoticComponent, useCallback, useState } from "react";

import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedText } from "../../theme/components/ThemedText";
import { useTheme } from "../../theme/useTheme";
import { AppIcons } from "../../utils/icons";
import { waitForAnimation } from "../../utils/time/waitForAnimation";
import { GalaxyBackground } from "../common/GalaxyBackground/GalaxyBackground";
import { AddSiteForm } from "./AddSiteForm";
import "./AddSiteModal.css";

/**
 * Props for the AddSiteModal component
 *
 * @public
 */
export interface AddSiteModalProperties {
    /** Callback function to close the modal */
    readonly onClose: () => void;
}

/**
 * Modal wrapper for the AddSiteForm component.
 *
 * @remarks
 * Provides a modal dialog containing the AddSiteForm with proper theming and
 * close functionality. Automatically closes when form submission succeeds.
 *
 * @param props - Component configuration properties
 *
 * @returns JSX element containing the modal dialog with AddSiteForm
 */
export const AddSiteModal: NamedExoticComponent<AddSiteModalProperties> = memo(
    function AddSiteModalComponent({ onClose }: AddSiteModalProperties) {
        const { isDark } = useTheme();
        const CloseIcon = AppIcons.ui.close;
        const AddIcon = AppIcons.actions.add;
        const [isClosing, setIsClosing] = useState(false);

        const handleClose = useCallback((): void => {
            setIsClosing(true);
            void (async (): Promise<void> => {
                await waitForAnimation(300);
                onClose();
            })();
        }, [onClose]);

        const handleCloseButtonClick = useCallback((): void => {
            handleClose();
        }, [handleClose]);

        return (
            <div
                className={`modal-overlay modal-overlay--frosted ${
                    isDark ? "dark" : ""
                } ${isClosing ? "modal-overlay--closing" : ""}`}
                data-testid="add-site-modal-overlay"
            >
                <button
                    aria-label="Close add site modal"
                    className="modal-overlay__dismiss"
                    onClick={handleCloseButtonClick}
                    tabIndex={-1}
                    type="button"
                />
                <ThemedBox
                    as="dialog"
                    className={`modal-shell modal-shell--form modal-shell--accent-success add-site-modal ${
                        isClosing ? "modal-shell--closing" : ""
                    }`}
                    data-testid="add-site-modal"
                    open
                    padding="xl"
                    rounded="xl"
                    shadow="xl"
                    surface="overlay"
                >
                    <div className="modal-shell__header add-site-modal__header">
                        <GalaxyBackground
                            className="galaxy-background--banner galaxy-background--banner-compact"
                            isDark={isDark}
                        />
                        <div className="modal-shell__header-content">
                            <div className="modal-shell__title-group">
                                <div className="flex items-center gap-2">
                                    <div className="modal-shell__accent-icon add-site-modal__header-icon">
                                        <AddIcon size={22} />
                                    </div>
                                    <ThemedText
                                        as="h2"
                                        className="modal-shell__title"
                                        size="xl"
                                        weight="semibold"
                                    >
                                        Add New Site
                                    </ThemedText>
                                </div>
                                <ThemedText
                                    className="modal-shell__subtitle"
                                    size="sm"
                                    variant="secondary"
                                >
                                    Configure monitoring for a new property or
                                    link additional monitors to an existing
                                    site.
                                </ThemedText>
                            </div>
                            <div className="modal-shell__actions">
                                <button
                                    aria-label="Close modal"
                                    className="modal-shell__close"
                                    data-testid="add-site-modal-close"
                                    onClick={handleCloseButtonClick}
                                    title="Close"
                                    type="button"
                                >
                                    <CloseIcon size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="modal-shell__body modal-shell__body-scrollable">
                        <AddSiteForm onSuccess={handleClose} />
                    </div>
                </ThemedBox>
            </div>
        );
    }
);
