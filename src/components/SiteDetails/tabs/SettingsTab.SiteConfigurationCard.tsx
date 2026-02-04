/**
 * Site configuration card for the Site Details Settings tab.
 *
 * @remarks
 * This component is intentionally presentational. It renders:
 *
 * - Site name editing
 * - Immutable site identifier display
 */

import type { ChangeEvent, ReactElement } from "react";

import { useMemo } from "react";

import { ThemedBadge } from "../../../theme/components/ThemedBadge";
import { ThemedButton } from "../../../theme/components/ThemedButton";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedInput } from "../../../theme/components/ThemedInput";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { AppIcons, getIconSize } from "../../../utils/icons";
import { SiteSettingsFieldLabel } from "./SiteSettingsFieldLabel";
import { SiteSettingsHelpText } from "./SiteSettingsHelpText";

const InfoIcon = AppIcons.ui.info;
const IdentifierIcon = AppIcons.ui.link;
const SaveIcon = AppIcons.actions.save;
const SettingsIcon = AppIcons.settings.gear;
const SiteIcon = AppIcons.ui.site;
const WarningIcon = AppIcons.status.warning;

/**
 * Props for {@link SettingsTabSiteConfigurationCard}.
 */
export interface SettingsTabSiteConfigurationCardProperties {
    readonly displayIdentifier: string;
    readonly hasUnsavedChanges: boolean;
    readonly identifierLabel: string;
    readonly isLoading: boolean;
    readonly isSiteNameValid: boolean;
    readonly localName: string;
    readonly onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
    readonly onSaveName: () => void;
}

/**
 * Renders the “Site Configuration” section of {@link SettingsTab}.
 */
export const SettingsTabSiteConfigurationCard = ({
    displayIdentifier,
    hasUnsavedChanges,
    identifierLabel,
    isLoading,
    isSiteNameValid,
    localName,
    onNameChange,
    onSaveName,
}: SettingsTabSiteConfigurationCardProperties): ReactElement => {
    const { currentTheme } = useTheme();

    const buttonIconSize = getIconSize("sm");
    const fieldIconSize = getIconSize("xs");
    const { primary } = currentTheme.colors;
    const { "500": settingsColor } = primary;

    const saveIcon = useMemo(
        () => <SaveIcon aria-hidden size={buttonIconSize} />,
        [buttonIconSize]
    );

    const settingsIcon = useMemo(
        () => <SettingsIcon color={settingsColor} />,
        [settingsColor]
    );

    return (
        <ThemedCard icon={settingsIcon} title="Site Configuration">
            <div className="site-settings-section">
                <div className="site-settings-field">
                    <SiteSettingsFieldLabel>
                        <span className="inline-flex items-center gap-2">
                            <SiteIcon aria-hidden size={fieldIconSize} />
                            Site name
                        </span>
                    </SiteSettingsFieldLabel>
                    <div className="site-settings-field__controls">
                        <ThemedInput
                            className="flex-1"
                            onChange={onNameChange}
                            placeholder="Enter a custom name for this site"
                            type="text"
                            value={localName}
                        />
                        <ThemedButton
                            disabled={
                                !hasUnsavedChanges ||
                                isLoading ||
                                !isSiteNameValid
                            }
                            icon={saveIcon}
                            loading={isLoading}
                            onClick={onSaveName}
                            size="sm"
                            variant={
                                hasUnsavedChanges ? "primary" : "secondary"
                            }
                        >
                            Save
                        </ThemedButton>
                    </div>
                    {hasUnsavedChanges ? (
                        <ThemedBadge size="sm" variant="warning">
                            <WarningIcon size={14} />
                            <span className="ml-1">Unsaved changes</span>
                        </ThemedBadge>
                    ) : null}
                    {isSiteNameValid ? null : (
                        <ThemedText size="xs" variant="error">
                            Enter a name before saving.
                        </ThemedText>
                    )}
                </div>

                <div className="site-settings-field">
                    <SiteSettingsFieldLabel>
                        <span className="inline-flex items-center gap-2">
                            <IdentifierIcon aria-hidden size={fieldIconSize} />
                            {identifierLabel}
                        </span>
                    </SiteSettingsFieldLabel>
                    <ThemedInput
                        className="opacity-70"
                        disabled
                        type="text"
                        value={displayIdentifier}
                    />
                    <div className="mt-2">
                        <SiteSettingsHelpText icon={InfoIcon}>
                            Generated when this site is created and cannot be
                            changed.
                        </SiteSettingsHelpText>
                    </div>
                </div>
            </div>
        </ThemedCard>
    );
};
