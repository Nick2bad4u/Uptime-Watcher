/**
 * Site information card for the Site Details Settings tab.
 */

import type { Monitor } from "@shared/types";
import type { ReactElement } from "react";

import { useMemo } from "react";

import { ThemedBadge } from "../../../theme/components/ThemedBadge";
import { ThemedCard } from "../../../theme/components/ThemedCard";
import { ThemedText } from "../../../theme/components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { AppIcons } from "../../../utils/icons";

const HistoryIcon = AppIcons.ui.history;
const IdentifierIcon = AppIcons.ui.link;
const InfoIcon = AppIcons.ui.info;
const LastCheckedIcon = AppIcons.metrics.activity;

/**
 * Props for {@link SettingsTabSiteInformationCard}.
 */
export interface SettingsTabSiteInformationCardProperties {
    readonly displayIdentifier: string;
    readonly identifierLabel: string;
    readonly selectedMonitor: Monitor;
}

/**
 * Renders the “Site Information” section of {@link SettingsTab}.
 */
export const SettingsTabSiteInformationCard = ({
    displayIdentifier,
    identifierLabel,
    selectedMonitor,
}: SettingsTabSiteInformationCardProperties): ReactElement => {
    const { currentTheme } = useTheme();

    const infoColor = currentTheme.colors.info;

    const cardIcon = useMemo(() => <InfoIcon color={infoColor} />, [infoColor]);

    return (
        <ThemedCard icon={cardIcon} title="Site Information">
            <div className="site-settings-info-grid">
                <div className="site-settings-info-grid__column">
                    <div className="site-settings-info-item">
                        <span
                            aria-hidden="true"
                            className="site-settings-info-item__icon"
                        >
                            <IdentifierIcon size={18} />
                        </span>
                        <div className="site-settings-info-item__content">
                            <ThemedText
                                className="site-settings-info-item__label"
                                size="sm"
                                variant="secondary"
                            >
                                {identifierLabel}
                            </ThemedText>
                            <ThemedBadge size="sm" variant="secondary">
                                {displayIdentifier}
                            </ThemedBadge>
                        </div>
                    </div>
                    <div className="site-settings-info-item">
                        <span
                            aria-hidden="true"
                            className="site-settings-info-item__icon"
                        >
                            <HistoryIcon size={18} />
                        </span>
                        <div className="site-settings-info-item__content">
                            <ThemedText
                                className="site-settings-info-item__label"
                                size="sm"
                                variant="secondary"
                            >
                                History Records
                            </ThemedText>
                            <ThemedBadge size="sm" variant="info">
                                {selectedMonitor.history.length}
                            </ThemedBadge>
                        </div>
                    </div>
                </div>
                <div className="site-settings-info-grid__column">
                    <div className="site-settings-info-item">
                        <span
                            aria-hidden="true"
                            className="site-settings-info-item__icon"
                        >
                            <LastCheckedIcon size={18} />
                        </span>
                        <div className="site-settings-info-item__content">
                            <ThemedText
                                className="site-settings-info-item__label"
                                size="sm"
                                variant="secondary"
                            >
                                Last Checked
                            </ThemedText>
                            <ThemedText
                                className="site-settings-info-item__value"
                                size="xs"
                                variant="primary"
                            >
                                {selectedMonitor.lastChecked
                                    ? new Date(
                                          selectedMonitor.lastChecked
                                      ).toLocaleString()
                                    : "Never"}
                            </ThemedText>
                        </div>
                    </div>
                </div>
            </div>
        </ThemedCard>
    );
};
