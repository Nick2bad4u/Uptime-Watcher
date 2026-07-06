/**
 * Notifications configuration card for the Site Details Settings tab.
 */

import type { ReactElement } from "react";

import { useMemo } from "react";

import { useTheme } from "../../../theme/useTheme";
import { AppIcons, getIconSize } from "../../../utils/icons";
import { SettingsTabActionCard } from "./SettingsTab.ActionCard";
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
        <SettingsTabActionCard
            buttonIcon={toggleIcon}
            buttonLabel={
                isSiteMuted
                    ? "Unmute notifications for this site"
                    : "Mute notifications for this site"
            }
            buttonSize="sm"
            buttonVariant={isSiteMuted ? "secondary" : "primary"}
            cardClassName="site-settings-section"
            cardIcon={cardIcon}
            fieldLabel="System notifications"
            fieldLabelVariant="secondary"
            isLoading={isLoading}
            onClick={onToggleSiteMute}
            supportingContent={
                <SiteSettingsHelpText icon={BellIcon}>
                    {isSiteMuted
                        ? "Notifications for this site are muted. This overrides global notification settings."
                        : "This site follows your global notification settings."}
                </SiteSettingsHelpText>
            }
            title="Notifications"
        />
    );
};
