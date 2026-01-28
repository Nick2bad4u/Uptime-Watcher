/**
 * Site details view component with comprehensive tabbed interface.
 *
 * @remarks
 * This component provides a detailed view of a single site's monitoring data,
 * statistics, and configuration options. It uses a composition pattern with
 * specialized child components for maintainability and clear separation of
 * concerns.
 *
 * The component integrates multiple advanced features:
 *
 * - Real-time status monitoring and visualization
 * - Historical data charts with Chart.js integration
 * - Analytics and performance metrics
 * - Configuration management for monitoring settings
 * - Responsive design with theme support
 *
 * Uses custom hooks for state management and Chart.js for data visualization
 * with zoom, pan, and time-based charting capabilities.
 *
 * @example
 *
 * ```tsx
 * <SiteDetails
 *     site={{
 *         identifier: "site-123",
 *         name: "My Website",
 *         monitors: [],
 *         monitoring: true,
 *     }}
 * />;
 * ```
 *
 * @param site - Site object containing monitoring data and configuration
 *
 * @public
 */

import type { Site } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import {
    type EscapeKeyModalConfig,
    useEscapeKeyModalHandler,
} from "@shared/utils/modalHandlers";
import { useCallback, useMemo, useState } from "react";

import { useSiteDetails } from "../../hooks/site/useSiteDetails";
import { ThemedBox } from "../../theme/components/ThemedBox";
import { useAvailabilityColors, useTheme } from "../../theme/useTheme";
import {
    formatDuration,
    formatFullTimestamp,
    formatResponseTime,
} from "../../utils/time";
import { waitForAnimation } from "../../utils/time/waitForAnimation";
import { SurfaceContainer } from "../shared/SurfaceContainer";
import { SiteDetailsHeader } from "./SiteDetailsHeader";
import { SiteDetailsNavigation } from "./SiteDetailsNavigation";
import { SiteDetailsTabContent } from "./SiteDetailsTabContent";
import { useSiteDetailsCharts } from "./useSiteDetailsCharts";

/**
 * Props for the SiteDetails component
 *
 * @public
 */
export interface SiteDetailsProperties {
    /** Callback function to close the site details view */
    readonly onClose: () => void;
    /** The site object to display details for */
    readonly site: Site;
}

/**
 * Site details component with tabbed interface for comprehensive site
 * monitoring. Provides overview, history, analytics, and settings views for a
 * monitored site.
 *
 * Uses composition pattern with specialized tab components and custom hooks for
 * state management and data fetching.
 *
 * @example
 *
 * ```tsx
 * <SiteDetails
 *     site={selectedSite}
 *     onClose={() => setSelectedSite(null)}
 * />;
 * ```
 *
 * @param props - Component props.
 *
 * @returns JSX element containing the site details interface.
 *
 * @public
 */
export const SiteDetails = ({
    onClose,
    site,
}: SiteDetailsProperties): JSX.Element | null => {
    const { currentTheme, isDark } = useTheme();
    const { getAvailabilityDescription } = useAvailabilityColors();
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback((): void => {
        setIsClosing(true);
        void (async (): Promise<void> => {
            await waitForAnimation();
            onClose();
        })();
    }, [onClose]);

    // Add global escape key handler
    const modalConfigs = useMemo<EscapeKeyModalConfig[]>(
        (): EscapeKeyModalConfig[] => [
            {
                isOpen: true, // SiteDetails is always considered "open" when rendered
                onClose: handleClose,
                priority: 1,
            },
        ],
        [handleClose]
    );

    useEscapeKeyModalHandler(modalConfigs);

    // Memoize scroll container style to avoid inline object creation
    const scrollContainerStyle = useMemo(
        () => ({
            display: "flex",
            flex: 1,
            flexDirection: "column" as const,
            minHeight: 0,
        }),
        []
    );

    // Use our custom hook to get all the data and functionality we need
    const {
        // UI state
        activeSiteDetailsTab,
        // Analytics
        analytics,
        // Site data
        currentSite,
        // Handlers
        handleCheckNow,
        handleIntervalChange,
        handleMonitorIdChange,
        handleRemoveMonitor,
        handleRemoveSite,
        handleRetryAttemptsChange,
        handleSaveInterval,
        handleSaveName,
        handleSaveRetryAttempts,
        handleSaveTimeout,
        handleStartMonitoring,
        handleStartSiteMonitoring,
        handleStopMonitoring,
        handleStopSiteMonitoring,
        handleTimeoutChange,
        // Name state
        hasUnsavedChanges,
        // Interval state
        intervalChanged,
        isLoading,
        isMonitoring,
        localCheckIntervalMs,
        localName,
        localRetryAttempts,
        localTimeoutSeconds,
        retryAttemptsChanged,
        selectedMonitor,
        selectedMonitorId,
        // Store actions
        setActiveSiteDetailsTab,
        setLocalName,
        setShowAdvancedMetrics,
        setSiteDetailsChartTimeRange,
        showAdvancedMetrics,
        siteDetailsChartTimeRange,
        siteExists,
        timeoutChanged,

    } = useSiteDetails(useMemo(() => ({ site }), [site]));

    const {
        barChartData,
        barChartOptions,
        doughnutChartData,
        doughnutOptions,
        lineChartData,
        lineChartOptions,
    } = useSiteDetailsCharts(analytics, currentTheme);

    const handleCheckNowClick = useCallback(() => {
        void handleCheckNow();
    }, [handleCheckNow]);

    const handleSaveIntervalClick = useCallback(() => {
        void handleSaveInterval();
    }, [handleSaveInterval]);

    const handleOverlayDismissClick = useCallback((): void => {
        handleClose();
    }, [handleClose]);

    const activeTabId = useMemo(
        () => `site-details-tab-${activeSiteDetailsTab}`,
        [activeSiteDetailsTab]
    );

    // Don't render if site doesn't exist
    if (!siteExists) {
        return null;
    }

    return (
        <div
            className={`modal-overlay modal-overlay--immersive site-details-modal-overlay ${
                isDark ? "dark" : ""
            } ${isClosing ? "modal-overlay--closing" : ""}`}
        >
            <button
                aria-label="Close site details"
                className="modal-overlay__dismiss"
                onClick={handleOverlayDismissClick}
                tabIndex={-1}
                type="button"
            />
            <ThemedBox
                aria-label="Site details"
                as="dialog"
                className={`modal-shell modal-shell--site-details modal-shell--accent-success site-details-modal ${
                    isClosing ? "modal-shell--closing" : ""
                }`}
                data-testid="site-details-modal"
                open
                padding="xl"
                rounded="xl"
                shadow="xl"
                surface="overlay"
            >
                <div className="site-details-modal__body">
                    <div
                        className={`site-details-modal__content-wrapper custom-scrollbar ${isDark ? "dark" : ""}`}
                        style={scrollContainerStyle}
                    >
                        <SiteDetailsHeader
                            onClose={handleClose}
                            site={currentSite}
                            {...(selectedMonitor ? { selectedMonitor } : {})}
                        />

                        <SiteDetailsNavigation
                            activeSiteDetailsTab={activeSiteDetailsTab}
                            currentSite={currentSite}
                            handleMonitorIdChange={handleMonitorIdChange}
                            handleStartMonitoring={handleStartMonitoring}
                            handleStartSiteMonitoring={
                                handleStartSiteMonitoring
                            }
                            handleStopMonitoring={handleStopMonitoring}
                            handleStopSiteMonitoring={handleStopSiteMonitoring}
                            isLoading={isLoading}
                            isMonitoring={isMonitoring}
                            selectedMonitorId={selectedMonitorId}
                            setActiveSiteDetailsTab={setActiveSiteDetailsTab}
                        />

                        <SurfaceContainer
                            aria-labelledby={activeTabId}
                            className={`site-details-modal__content flex flex-col gap-6${isDark ? "dark" : ""}`}
                            id="site-details-tabpanel"
                            padding="xl"
                            role="tabpanel"
                            rounded="lg"
                            surface="elevated"
                            variant="primary"
                        >
                            <SiteDetailsTabContent
                                activeSiteDetailsTab={activeSiteDetailsTab}
                                analytics={analytics}
                                barChartData={barChartData}
                                barChartOptions={barChartOptions}
                                doughnutChartData={doughnutChartData}
                                doughnutOptions={doughnutOptions}
                                formatDuration={formatDuration}
                                formatFullTimestamp={formatFullTimestamp}
                                formatResponseTime={formatResponseTime}
                                getAvailabilityDescription={getAvailabilityDescription}
                                handleCheckNow={handleCheckNowClick}
                                handleIntervalChange={handleIntervalChange}
                                handleRemoveMonitor={handleRemoveMonitor}
                                handleRemoveSite={handleRemoveSite}
                                handleRetryAttemptsChange={handleRetryAttemptsChange}
                                handleSaveInterval={handleSaveInterval}
                                handleSaveIntervalClick={handleSaveIntervalClick}
                                handleSaveName={handleSaveName}
                                handleSaveRetryAttempts={handleSaveRetryAttempts}
                                handleSaveTimeout={handleSaveTimeout}
                                handleStartSiteMonitoring={handleStartSiteMonitoring}
                                handleStopSiteMonitoring={handleStopSiteMonitoring}
                                handleTimeoutChange={handleTimeoutChange}
                                hasUnsavedChanges={hasUnsavedChanges}
                                intervalChanged={intervalChanged}
                                isLoading={isLoading}
                                lineChartData={lineChartData}
                                lineChartOptions={lineChartOptions}
                                localCheckIntervalMs={localCheckIntervalMs}
                                localName={localName}
                                localRetryAttempts={localRetryAttempts}
                                localTimeoutSeconds={localTimeoutSeconds}
                                retryAttemptsChanged={retryAttemptsChanged}
                                selectedMonitor={selectedMonitor}
                                selectedMonitorId={selectedMonitorId}
                                setLocalName={setLocalName}
                                setShowAdvancedMetrics={setShowAdvancedMetrics}
                                setSiteDetailsChartTimeRange={setSiteDetailsChartTimeRange}
                                showAdvancedMetrics={showAdvancedMetrics}
                                site={currentSite}
                                siteDetailsChartTimeRange={siteDetailsChartTimeRange}
                                timeoutChanged={timeoutChanged}
                            />
                        </SurfaceContainer>
                    </div>
                </div>
            </ThemedBox>
        </div>
    );
};
