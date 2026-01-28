import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import type { JSX } from "react/jsx-runtime";

import { AppIcons, getIconSize } from "../../../utils/icons";
import { SettingItem } from "../../shared/SettingItem";
import { SettingsSection } from "./SettingsSection";

interface NotificationSectionProperties {
    readonly icon: IconType;
    readonly inAppAlertsControl: ReactNode;
    readonly inAppAlertSoundControl: ReactNode;
    readonly inAppAlertVolumeControl: ReactNode;
    readonly isVolumeControlDisabled: boolean;
    readonly systemNotificationsControl: ReactNode;
    readonly systemNotificationSoundControl: ReactNode;
}

/**
 * Notification preferences section.
 */
export const NotificationSection = ({
    icon,
    inAppAlertsControl,
    inAppAlertSoundControl,
    inAppAlertVolumeControl,
    isVolumeControlDisabled,
    systemNotificationsControl,
    systemNotificationSoundControl,
}: NotificationSectionProperties): JSX.Element => {
    const iconSize = getIconSize("sm");
    const BellIcon = AppIcons.ui.bell;
    const MonitorIcon = AppIcons.ui.monitor;
    const SlidersIcon = AppIcons.ui.sliders;
    const VolumeIcon = AppIcons.ui.volume;

    return (
        <SettingsSection
            description="Choose how Uptime Watcher keeps you informed."
            icon={icon}
            testId="settings-section-notifications"
            title="Notifications"
        >
            <div className="settings-notifications-grid">
                <div className="settings-item-stack">
                    <SettingItem
                        control={inAppAlertsControl}
                        description="Show toast notifications within the app when monitors change state."
                        iconClassName="settings-accent--primary"
                        iconComponent={BellIcon}
                        iconSize={iconSize}
                        title="In-app alerts"
                    />
                    <SettingItem
                        control={inAppAlertSoundControl}
                        description="Play a sound when in-app alerts are displayed."
                        iconClassName="settings-accent--highlight"
                        iconComponent={VolumeIcon}
                        iconSize={iconSize}
                        title="In-app alert sound"
                    />
                    <SettingItem
                        control={inAppAlertVolumeControl}
                        description="Fine-tune how loud the in-app alert tone plays."
                        disabled={isVolumeControlDisabled}
                        iconClassName="settings-accent--warning"
                        iconComponent={SlidersIcon}
                        iconSize={iconSize}
                        title="In-app alert volume"
                    />
                </div>

                <div className="settings-item-stack">
                    <SettingItem
                        control={systemNotificationsControl}
                        description="Trigger operating system notifications for status changes."
                        iconClassName="settings-accent--primary-muted"
                        iconComponent={MonitorIcon}
                        iconSize={iconSize}
                        title="System notifications"
                    />
                    <SettingItem
                        control={systemNotificationSoundControl}
                        description="Play a sound when system notifications are shown."
                        iconClassName="settings-accent--success-muted"
                        iconComponent={VolumeIcon}
                        iconSize={iconSize}
                        title="System notification sound"
                    />
                </div>
            </div>
        </SettingsSection>
    );
};
