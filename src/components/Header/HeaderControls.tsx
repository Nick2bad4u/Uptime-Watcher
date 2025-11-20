/**
 * HeaderControls component for action buttons in the header.
 *
 * @remarks
 * This component contains the add site, theme toggle, and settings buttons,
 * reducing nesting complexity in the main Header component.
 */

import type { CSSProperties, JSX } from "react";

import { AppIcons } from "../../utils/icons";
import {
    Tooltip,
    type TooltipTriggerProperties,
} from "../common/Tooltip/Tooltip";

type HeaderControlOrderStyle = CSSProperties & {
    "--header-control-order"?: number;
};

const getHeaderControlOrderStyle = (
    order: number
): HeaderControlOrderStyle => ({ "--header-control-order": order });

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
    /** Layout orientation for the control cluster */
    readonly orientation?: "horizontal" | "vertical";
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
    orientation = "horizontal",
}: HeaderControlsProperties): JSX.Element => {
    const AddIcon = AppIcons.actions.add;
    const ThemeIcon = isDark ? AppIcons.theme.light : AppIcons.theme.dark;
    const SettingsIcon = AppIcons.settings.gear;
    const rootClassName = [
        "header-controls",
        orientation === "vertical" ? "header-controls--vertical" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={rootClassName} data-testid="header-controls">
            <Tooltip content="Add new site to monitor" position="bottom">
                {(triggerProps: TooltipTriggerProperties) => (
                    <button
                        className="header-controls__button header-controls__button--add"
                        data-testid="header-control-add-site"
                        onClick={onShowAddSiteModal}
                        style={getHeaderControlOrderStyle(0)}
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
                        data-testid="header-control-toggle-theme"
                        onClick={onToggleTheme}
                        style={getHeaderControlOrderStyle(1)}
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
                        className="header-controls__button header-controls__button--settings"
                        data-testid="header-control-open-settings"
                        onClick={onShowSettings}
                        style={getHeaderControlOrderStyle(2)}
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
