/**
 * Notifications configuration card for the Site Details Settings tab.
 */

import type { ReactElement } from "react";

import { useMemo } from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { AppIcons, getIconSize } from "../../../utils/icons";
import { SiteSettingsHelpText } from "./SiteSettingsHelpText";

const BellIcon = AppIcons.ui.bell;
const LockIcon = AppIcons.ui.lock;
const UnlockIcon = AppIcons.ui.unlock;

/**
 * Props for {@link SettingsTabNotificationsCard}.
 */
export interface SettingsTabNotificationsCardProperties {
    readonly isLoading: boolean;
    readonly isSiteMuted: boolean;
    readonly onToggleSiteMute: () => void;
}

/**
 * Renders the “Notifications” section of
 * {@link src/components/SiteDetails/tabs/SettingsTab#SettingsTab}.
 */
export const SettingsTabNotificationsCard = ({
    isLoading,
    isSiteMuted,
    onToggleSiteMute,
}: SettingsTabNotificationsCardProperties): ReactElement => {
    const { currentTheme } = useTheme();
    const buttonIconSize = getIconSize("sm");

    const cardIcon = useMemo(
        () => <BellIcon color={currentTheme.colors.info} size={18} />,
        [currentTheme.colors.info]
    );

    const toggleIcon = useMemo(() => {
        const ToggleIconComponent = isSiteMuted ? UnlockIcon : LockIcon;
        return <ToggleIconComponent aria-hidden size={buttonIconSize} />;
    }, [buttonIconSize, isSiteMuted]);

    return (
        <ThemedCard
            className="site-settings-section"
            icon={cardIcon}
            title="Notifications"
        >
            <div className="site-settings-field">
                <ThemedText className="mb-2" size="sm" variant="secondary">
                    System notifications
                </ThemedText>
                <div className="mb-4">
                    <SiteSettingsHelpText icon={BellIcon}>
                        {isSiteMuted
                            ? "Notifications for this site are muted. This overrides global notification settings."
                            : "This site follows your global notification settings."}
                    </SiteSettingsHelpText>
                </div>
                <ThemedButton
                    className="site-settings-field__cta"
                    icon={toggleIcon}
                    loading={isLoading}
                    onClick={onToggleSiteMute}
                    size="sm"
                    variant={isSiteMuted ? "secondary" : "primary"}
                >
                    {isSiteMuted
                        ? "Unmute notifications for this site"
                        : "Mute notifications for this site"}
                </ThemedButton>
            </div>
        </ThemedCard>
    );
};
