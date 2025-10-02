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
import { ThemedButton } from "../../theme/components/ThemedButton";
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

        const handleBackdropClick = useCallback(
            (event: MouseEvent) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            },
            [onClose]
        );

        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Modal backdrop requires click handler for UX; keyboard support provided by modal focus management
            <div
                className={`modal-overlay fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm ${
                    isDark ? "dark" : ""
                }`}
                onClick={handleBackdropClick}
            >
                <ThemedBox
                    as="dialog"
                    className="m-4 max-h-screen w-full max-w-2xl overflow-y-auto"
                    open
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
                            onClick={onClose}
                            size="sm"
                            title="Close"
                            variant="secondary"
                        >
                            <CloseIcon size={16} />
                        </ThemedButton>
                    </div>

                    {/* Modal Content */}
                    <div className="-m-4">
                        <AddSiteForm onSuccess={onClose} />
                    </div>
                </ThemedBox>
            </div>
        );
    }
);
