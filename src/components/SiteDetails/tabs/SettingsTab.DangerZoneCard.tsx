/**
 * Danger zone card for the Site Details Settings tab.
 */

import type { ReactElement } from "react";

import { useMemo } from "react";

import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { AppIcons, getIconSize } from "../../../utils/icons";
import { SettingsTabActionCard } from "./SettingsTab.ActionCard";

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
 * Renders the “Danger Zone” section of
 * {@link src/components/SiteDetails/tabs/SettingsTab#SettingsTab}.
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
        <SettingsTabActionCard
            buttonIcon={trashIcon}
            buttonLabel="Remove Site"
            buttonSize="md"
            buttonVariant="error"
            cardClassName="border-error/30 bg-error/5 border-2"
            cardIcon={dangerIcon}
            contentClassName="site-settings-section"
            fieldLabel="Remove Site"
            fieldLabelVariant="error"
            fieldLabelWeight="medium"
            isLoading={isLoading}
            onClick={onRemoveSite}
            supportingContent={
                <ThemedText size="xs" variant="tertiary">
                    This action cannot be undone. All history data for this site
                    will be lost.
                </ThemedText>
            }
            title="Danger Zone"
        />
    );
};
