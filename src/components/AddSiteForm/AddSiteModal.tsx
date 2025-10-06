/**
 * AddSiteModal component that wraps the AddSiteForm in a modal dialog.
 *
 * @remarks
 * - Provides a modal wrapper for the AddSiteForm component
 * - Parent-controlled visibility via onClose prop
 * - Handles form success by closing the modal
 * - Uses consistent theming and modal patterns
 *
 * @packageDocumentation
 */

import {
    memo,
    type MouseEvent,
    type NamedExoticComponent,
    useCallback,
} from "react";

import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedText } from "../../theme/components/ThemedText";
import { useTheme } from "../../theme/useTheme";
import { AppIcons } from "../../utils/icons";
import { AddSiteForm } from "./AddSiteForm";

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
    function AddSiteModal({ onClose }: AddSiteModalProperties) {
        const { isDark } = useTheme();
        const CloseIcon = AppIcons.ui.close;

        /**
         * Handles overlay clicks to support closing the modal when the user
         * clicks outside the dialog content.
         */
        const handleOverlayClick = useCallback(
            (event: MouseEvent<HTMLDivElement>) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            },
            [onClose]
        );

        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Modal backdrop requires click handler for UX; keyboard support provided by modal focus management
            <div
                className={`modal-overlay modal-overlay--frosted ${
                    isDark ? "dark" : ""
                }`}
                onClick={handleOverlayClick}
            >
                <ThemedBox
                    as="dialog"
                    className="modal-shell modal-shell--form modal-shell--accent-success"
                    open
                    padding="xl"
                    rounded="xl"
                    shadow="xl"
                    surface="overlay"
                >
                    <div className="modal-shell__header">
                        <div className="modal-shell__title-group">
                            {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- Modal header requires explicit role for testing and assistive tech */}
                            <ThemedText
                                aria-level={1}
                                as="h2"
                                className="modal-shell__title"
                                role="heading"
                                size="xl"
                                weight="semibold"
                            >
                                Add New Site
                            </ThemedText>
                            <ThemedText
                                className="modal-shell__subtitle"
                                size="sm"
                                variant="secondary"
                            >
                                Configure monitoring details and instantly join
                                uptime tracking for your next property.
                            </ThemedText>
                        </div>
                        <div className="modal-shell__actions">
                            <button
                                aria-label="Close modal"
                                className="modal-shell__close"
                                onClick={onClose}
                                title="Close"
                                type="button"
                            >
                                <CloseIcon size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="modal-shell__body modal-shell__body-scrollable">
                        <AddSiteForm onSuccess={onClose} />
                    </div>
                </ThemedBox>
            </div>
        );
    }
);
