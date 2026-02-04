import { type ReactElement, useMemo } from "react";

import { ThemedText } from "../../theme/components/ThemedText";
import { AppIcons } from "../../utils/icons";
import { ErrorAlert } from "../common/ErrorAlert/ErrorAlert";
import { Modal } from "../common/Modal/Modal";
import { CloudSettingsSection } from "./CloudSettingsSection";
import { ApplicationSection } from "./sections/ApplicationSection";
import { MaintenanceSection } from "./sections/MaintenanceSection";
import { MonitoringSection } from "./sections/MonitoringSection";
import { NotificationSection } from "./sections/NotificationSection";
import { useSettingsController } from "./useSettingsController";
import "./Settings.css";

/**
 * Properties for the Settings modal.
 */
export interface SettingsProperties {
    /** Called once the Settings modal finishes closing. */
    readonly onClose: () => void;
}

/**
 * Settings modal.
 *
 * @remarks
 * This component is intentionally kept as a small, declarative view layer. The
 * bulk of the state + event-handler logic lives in
 * {@link useSettingsController}.
 */
export const Settings = ({
    onClose,
}: Readonly<SettingsProperties>): ReactElement => {
    const {
        applicationSectionProps,
        clearError,
        handleCloseButtonClick,
        headerBackground,
        headerIcon,
        isLoading,
        lastError,
        maintenanceSectionProps,
        monitoringSectionProps,
        notificationSectionProps,
        overlayClassName,
        shellClassName,
        showSyncSuccessBanner,
        subtitle,
    } = useSettingsController(useMemo(() => ({ onClose }), [onClose]));

    const SuccessIcon = AppIcons.status.upFilled;

    return (
        <Modal
            accent="success"
            closeButtonAriaLabel="Close settings"
            headerBackground={headerBackground}
            headerIcon={headerIcon}
            isOpen
            modalTestId="settings-modal"
            onRequestClose={handleCloseButtonClick}
            overlayClassName={overlayClassName}
            shellClassName={shellClassName}
            showCloseButton={!isLoading}
            subtitle={subtitle}
            title="Settings"
        >
            {lastError ? (
                <ErrorAlert message={lastError} onDismiss={clearError} />
            ) : null}

            {showSyncSuccessBanner ? (
                <div className="settings-modal__success-banner">
                    <SuccessIcon size={20} />
                    <div className="settings-modal__success-message">
                        <ThemedText size="sm">Sync complete</ThemedText>
                        <ThemedText size="xs" variant="tertiary">
                            Latest data loaded from the monitoring database.
                        </ThemedText>
                    </div>
                </div>
            ) : null}

            <div className="settings-modal__sections">
                <ApplicationSection {...applicationSectionProps} />
                <NotificationSection {...notificationSectionProps} />
                <MonitoringSection {...monitoringSectionProps} />
                <MaintenanceSection {...maintenanceSectionProps} />
                <CloudSettingsSection />
            </div>
        </Modal>
    );
};
