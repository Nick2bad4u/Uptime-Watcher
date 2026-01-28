import type { ChangeEvent } from "react";
import type { IconType } from "react-icons";
import type { JSX } from "react/jsx-runtime";

import { HISTORY_LIMIT_OPTIONS } from "../../../constants";
import { ThemedSelect } from "../../../theme/components/ThemedSelect";
import { ThemedText } from "../../../theme/components/ThemedText";
import { AppIcons, getIconSize } from "../../../utils/icons";
import { SettingsSection } from "./SettingsSection";

interface MonitoringSectionProperties {
    readonly currentHistoryLimit: number;
    readonly icon: IconType;
    readonly isLoading: boolean;
    readonly onHistoryLimitChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Monitoring preferences section.
 */
export const MonitoringSection = ({
    currentHistoryLimit,
    icon,
    isLoading,
    onHistoryLimitChange,
}: MonitoringSectionProperties): JSX.Element => {
    const iconSize = getIconSize("sm");
    const HistoryIcon = AppIcons.ui.history;

    return (
        <SettingsSection
            description="Control how much monitoring history is retained."
            icon={icon}
            testId="settings-section-monitoring"
            title="Monitoring"
        >
            <div className="settings-field">
                <ThemedText
                    className="settings-field__label"
                    size="sm"
                    variant="secondary"
                    weight="medium"
                >
                    <span className="settings-field__label-row">
                        <HistoryIcon
                            aria-hidden
                            className="settings-accent--primary-muted"
                            size={iconSize}
                        />
                        History Limit
                    </span>
                </ThemedText>
                <ThemedSelect
                    aria-label="Maximum number of history records to keep per site"
                    disabled={isLoading}
                    onChange={onHistoryLimitChange}
                    value={currentHistoryLimit}
                >
                    {HISTORY_LIMIT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </ThemedSelect>
                <ThemedText
                    className="settings-field__helper"
                    size="xs"
                    variant="tertiary"
                >
                    Limits the number of response records stored for each
                    monitor.
                </ThemedText>
            </div>
        </SettingsSection>
    );
};
