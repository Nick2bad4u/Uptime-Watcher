/**
 * HeaderControls component for action buttons in the header.
 *
 * @remarks
 * This component contains the add site, theme toggle, and settings buttons,
 * reducing nesting complexity in the main Header component.
 */

import type { JSX } from "react";

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
        <div className="header-controls">
            <Tooltip content="Add new site to monitor" position="bottom">
                {(triggerProps: TooltipTriggerProperties) => (
                    <button
                        aria-label="Add new site"
                        className="header-controls__button header-controls__button--add"
                        onClick={onShowAddSiteModal}
                        type="button"
                        {...triggerProps}
                    >
                        <span className="header-controls__icon">
                            <AddIcon size={18} />
                        </span>
                        <span className="header-controls__label">Add Site</span>
                    </button>
                )}
            </Tooltip>

            <Tooltip
                content={
                    isDark ? "Switch to light theme" : "Switch to dark theme"
                }
                position="bottom"
            >
                {(triggerProps: TooltipTriggerProperties) => (
                    <button
                        aria-label={
                            isDark
                                ? "Switch to light theme"
                                : "Switch to dark theme"
                        }
                        className="header-controls__button header-controls__button--theme"
                        onClick={onToggleTheme}
                        type="button"
                        {...triggerProps}
                    >
                        <span className="header-controls__icon">
                            <ThemeIcon size={18} />
                        </span>
                        <span className="header-controls__label">Theme</span>
                    </button>
                )}
            </Tooltip>

            <Tooltip content="Open application settings" position="bottom">
                {(triggerProps: TooltipTriggerProperties) => (
                    <button
                        aria-label="Open settings"
                        className="header-controls__button header-controls__button--settings"
                        onClick={onShowSettings}
                        type="button"
                        {...triggerProps}
                    >
                        <span className="header-controls__icon">
                            <SettingsIcon size={18} />
                        </span>
                        <span className="header-controls__label">Settings</span>
                    </button>
                )}
            </Tooltip>
        </div>
    );
};
