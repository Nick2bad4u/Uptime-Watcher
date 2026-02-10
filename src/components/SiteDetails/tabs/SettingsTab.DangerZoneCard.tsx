/**
 * Danger zone card for the Site Details Settings tab.
 */

import type { ReactElement } from "react";

import { useMemo } from "react";

import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { AppIcons, getIconSize } from "../../../utils/icons";

const DangerZoneIcon = AppIcons.status.downFilled;
const TrashIcon = AppIcons.actions.remove;

/**
 * Props for {@link SettingsTabDangerZoneCard}.
 */
export interface SettingsTabDangerZoneCardProperties {
    readonly isLoading: boolean;
    readonly onRemoveSite: () => void;
}

/**
 * Renders the “Danger Zone” section of {@link src/components/SiteDetails/tabs/SettingsTab#SettingsTab}.
 */
export const SettingsTabDangerZoneCard = ({
    isLoading,
    onRemoveSite,
}: SettingsTabDangerZoneCardProperties): ReactElement => {
    const { currentTheme } = useTheme();
    const buttonIconSize = getIconSize("sm");
    const dangerColor = currentTheme.colors.error;

    const trashIcon = useMemo(
        () => <TrashIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize]
    );
    const dangerIcon = useMemo(
        () => <DangerZoneIcon color={dangerColor} />,
        [dangerColor]
    );

    return (
        <ThemedCard
            className="border-error/30 bg-error/5 border-2"
            icon={dangerIcon}
            title="Danger Zone"
        >
            <div className="site-settings-section">
                <div className="site-settings-field">
                    <ThemedText
                        className="mb-2"
                        size="sm"
                        variant="error"
                        weight="medium"
                    >
                        Remove Site
                    </ThemedText>
                    <ThemedText className="mb-4" size="xs" variant="tertiary">
                        This action cannot be undone. All history data for this
                        site will be lost.
                    </ThemedText>
                    <ThemedButton
                        className="site-settings-field__cta"
                        icon={trashIcon}
                        loading={isLoading}
                        onClick={onRemoveSite}
                        size="md"
                        variant="error"
                    >
                        Remove Site
                    </ThemedButton>
                </div>
            </div>
        </ThemedCard>
    );
};
