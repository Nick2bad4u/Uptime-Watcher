import type { ChangeEvent, ReactNode } from "react";
import type { IconType } from "react-icons";
import type { JSX } from "react/jsx-runtime";

import type { ThemeName } from "../../../theme/types";

import { StatusIndicator } from "../../../theme/components/StatusIndicator";
import { ThemedSelect } from "../../../theme/components/ThemedSelect";
import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons, getIconSize } from "../../../utils/icons";
import { SettingItem } from "../../shared/SettingItem";
import { SettingsSection } from "./SettingsSection";

interface ApplicationSectionProperties {
    readonly autoStartControl: ReactNode;
    readonly availableThemes: readonly ThemeName[];
    readonly currentThemeName: ThemeName;
    readonly icon: IconType;
    readonly isLoading: boolean;
    readonly minimizeToTrayControl: ReactNode;
    readonly onThemeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Application/UX preferences section.
 */
export const ApplicationSection = ({
    autoStartControl,
    availableThemes,
    currentThemeName,
    icon,
    isLoading,
    minimizeToTrayControl,
    onThemeChange,
}: ApplicationSectionProperties): JSX.Element => {
    const iconSize = getIconSize("sm");
    const ThemeIcon = AppIcons.theme.dark;
    const StartIcon = AppIcons.metrics.time;
    const TrayIcon = AppIcons.ui.inbox;

    return (
        <SettingsSection
            description="Personalize the desktop experience."
            icon={icon}
            testId="settings-section-application"
            title="Application"
        >
            <div className="settings-field">
                <ThemedText size="sm" weight="medium">
                    <span className="settings-field__label-row">
                        <ThemeIcon
                            aria-hidden
                            className="settings-accent--highlight"
                            size={iconSize}
                        />
                        Theme
                    </span>
                </ThemedText>
                <ThemedSelect
                    aria-label="Select application theme"
                    disabled={isLoading}
                    onChange={onThemeChange}
                    value={currentThemeName}
                >
                    {availableThemes.map((theme) => (
                        <option key={theme} value={theme}>
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </option>
                    ))}
                </ThemedSelect>
                <div className="settings-theme-preview">
                    <ThemedText size="xs" variant="tertiary">
                        Preview:
                    </ThemedText>
                    <StatusIndicator size="sm" status="up" />
                    <StatusIndicator size="sm" status="down" />
                    <StatusIndicator size="sm" status="pending" />
                </div>
            </div>
            <div className="settings-toggle-stack">
                <SettingItem
                    control={autoStartControl}
                    description="Launch Uptime Watcher when you sign in to your computer (requires restart)."
                    iconClassName="settings-accent--primary"
                    iconComponent={StartIcon}
                    iconSize={iconSize}
                    title="Start at login"
                />
                <SettingItem
                    control={minimizeToTrayControl}
                    description="Keep the app running in the background without cluttering the taskbar."
                    iconClassName="settings-accent--success"
                    iconComponent={TrayIcon}
                    iconSize={iconSize}
                    title="Minimize to tray"
                />
            </div>
        </SettingsSection>
    );
};
