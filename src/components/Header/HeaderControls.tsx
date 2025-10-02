/**
 * HeaderControls component for action buttons in the header.
 *
 * @remarks
 * This component contains the add site, theme toggle, and settings buttons,
 * reducing nesting complexity in the main Header component.
 */

import type { JSX } from "react";

import { ThemedBox } from "../../theme/components/ThemedBox";
import { ThemedButton } from "../../theme/components/ThemedButton";
import { AppIcons } from "../../utils/icons";
import {
    Tooltip,
    type TooltipTriggerProperties,
} from "../common/Tooltip/Tooltip";

/**
 * Properties for the HeaderControls component.
 */
interface HeaderControlsProperties {
    /** Whether dark theme is active */
    readonly isDark: boolean;
    /** Callback to show add site modal */
    readonly onShowAddSiteModal: () => void;
    /** Callback to show settings */
    readonly onShowSettings: () => void;
    /** Callback to toggle theme */
    readonly onToggleTheme: () => void;
}

/**
 * HeaderControls component for header action buttons.
 *
 * @param props - The component properties
 *
 * @returns JSX element representing the header controls
 */
export const HeaderControls = ({
    isDark,
    onShowAddSiteModal,
    onShowSettings,
    onToggleTheme,
}: HeaderControlsProperties): JSX.Element => {
    const AddIcon = AppIcons.actions.add;
    const ThemeIcon = isDark ? AppIcons.theme.light : AppIcons.theme.dark;
    const SettingsIcon = AppIcons.settings.gear;

    return (
        <div className="flex shrink-0 items-center space-x-2">
            {/* Add Site Button */}
            <Tooltip content="Add new site to monitor" position="bottom">
                {(triggerProps: TooltipTriggerProperties) => (
                    <ThemedBox
                        className="header-controls-box flex items-center"
                        padding="xs"
                        rounded="md"
                        variant="tertiary"
                    >
                        <ThemedButton
                            aria-label="Add new site"
                            className="themed-button--icon p-2"
                            onClick={onShowAddSiteModal}
                            size="sm"
                            variant="secondary"
                            {...triggerProps}
                        >
                            <AddIcon size={18} />
                        </ThemedButton>
                    </ThemedBox>
                )}
            </Tooltip>

            {/* Theme Toggle */}
            <Tooltip
                content={
                    isDark ? "Switch to light theme" : "Switch to dark theme"
                }
                position="bottom"
            >
                {(triggerProps: TooltipTriggerProperties) => (
                    <ThemedBox
                        className="header-controls-box flex items-center"
                        padding="xs"
                        rounded="md"
                        variant="tertiary"
                    >
                        <ThemedButton
                            aria-label={
                                isDark
                                    ? "Switch to light theme"
                                    : "Switch to dark theme"
                            }
                            className="themed-button--icon p-2"
                            onClick={onToggleTheme}
                            size="sm"
                            variant="secondary"
                            {...triggerProps}
                        >
                            <ThemeIcon size={18} />
                        </ThemedButton>
                    </ThemedBox>
                )}
            </Tooltip>

            {/* Settings Button */}
            <Tooltip content="Open application settings" position="bottom">
                {(triggerProps: TooltipTriggerProperties) => (
                    <ThemedBox
                        className="header-controls-box flex items-center"
                        padding="xs"
                        rounded="md"
                        variant="tertiary"
                    >
                        <ThemedButton
                            aria-label="Open settings"
                            className="themed-button--icon p-2"
                            onClick={onShowSettings}
                            size="sm"
                            variant="secondary"
                            {...triggerProps}
                        >
                            <SettingsIcon size={18} />
                        </ThemedButton>
                    </ThemedBox>
                )}
            </Tooltip>
        </div>
    );
};
