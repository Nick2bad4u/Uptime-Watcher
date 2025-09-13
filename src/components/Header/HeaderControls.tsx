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
}: HeaderControlsProperties): JSX.Element => (
    <div className="flex shrink-0 items-center space-x-2">
        {/* Add Site Button */}
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
            >
                ➕
            </ThemedButton>
        </ThemedBox>

        {/* Theme Toggle */}
        <ThemedBox
            className="header-controls-box flex items-center"
            padding="xs"
            rounded="md"
            variant="tertiary"
        >
            <ThemedButton
                aria-label="Toggle theme"
                className="themed-button--icon p-2"
                onClick={onToggleTheme}
                size="sm"
                variant="secondary"
            >
                {isDark ? "☀️" : "🌙"}
            </ThemedButton>
        </ThemedBox>

        {/* Settings Button */}
        <ThemedBox
            className="header-controls-box flex items-center"
            padding="xs"
            rounded="md"
            variant="tertiary"
        >
            <ThemedButton
                aria-label="Settings"
                className="themed-button--icon p-2"
                onClick={onShowSettings}
                size="sm"
                variant="secondary"
            >
                ⚙️
            </ThemedButton>
        </ThemedBox>
    </div>
);
