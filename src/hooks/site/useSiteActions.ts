/**
 * Hook providing site action handlers for CRUD operations and monitoring
 * control.
 *
 * @remarks
 * Provides comprehensive site management functionality including monitor
 * control, site deletion, and monitoring state management. All actions include
 * error handling and user action logging.
 *
 * @public
 */
import type { Monitor, Site } from "@shared/types";

import { ensureError } from "@shared/utils/errorHandling";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { logger } from "../../services/logger";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { useUIStore } from "../../stores/ui/useUiStore";

function runLoggedSiteOperation(args: {
    readonly onSuccess: () => void;
    readonly operation: () => Promise<void>;
    readonly siteIdentifier: string;
}): void {
    // Fire-and-forget: actions may outlive the component that initiated them.
    void (async (): Promise<void> => {
        try {
            await args.operation();
            args.onSuccess();
        } catch (error) {
            logger.site.error(args.siteIdentifier, ensureError(error));
        }
    })();
}

/**
 * Result interface for the useSiteActions hook.
 *
 * @remarks
 * Provides a complete set of action handlers for site operations, including
 * individual monitor control and site-wide monitoring management. All handlers
 * include proper error handling and user action logging.
 *
 * @public
 */
export interface SiteActionsResult {
    /** Handler for clicking on site card to show details */
    handleCardClick: () => void;
    /** Handler for immediate status check of current monitor */
    handleCheckNow: () => void;
    /** Handler for starting monitoring on current monitor */
    handleStartMonitoring: () => void;
    /** Handler for starting monitoring on all site monitors */
    handleStartSiteMonitoring: () => void;
    /** Handler for stopping monitoring on current monitor */
    handleStopMonitoring: () => void;
    /** Handler for stopping monitoring on all site monitors */
    handleStopSiteMonitoring: () => void;
}

/**
 * Hook to handle site-related actions including monitoring control and
 * navigation.
 *
 * @remarks
 * This hook provides a comprehensive set of action handlers for site
 * operations, including both individual monitor control and site-wide
 * monitoring management. All operations are properly logged for debugging and
 * analytics purposes.
 *
 * The hook integrates with the sites store for state management and includes
 * proper error handling with user-friendly logging. All handlers are wrapped in
 * useCallback for performance optimization.
 *
 * Monitoring operations support both individual monitor control (start/stop
 * specific monitor) and site-wide control (start/stop all monitors for a
 * site).
 *
 * @example
 *
 * ```tsx
 * function SiteCard({ site }) {
 *   const { monitor } = useSiteMonitor(site);
 *   const {
 *     handleStartSiteMonitoring,
 *     handleStopSiteMonitoring,
 *     handleCheckNow
 *   } = useSiteActions(site, monitor);
 *
 *   return (
 *     <div>
 *       <button onClick={handleStartSiteMonitoring}>Start All</button>
 *       <button onClick={handleStopSiteMonitoring}>Stop All</button>
 *       <button onClick={handleCheckNow}>Check Now</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param site - The site object to act upon.
 * @param monitor - The specific monitor to use for individual monitor actions.
 *
 * @returns Object containing all available action handler functions.
 *
 * @public
 *
 * @see {@link src/stores/sites/useSitesStore#useSitesStore} for data access.
 * @see {@link useUIStore} for selection updates.
 */
export function useSiteActions(
    site: Site,
    monitor: Monitor | undefined
): SiteActionsResult {
    const {
        checkSiteNow,
        setSelectedMonitorId,
        startSiteMonitoring,
        startSiteMonitorMonitoring,
        stopSiteMonitoring,
        stopSiteMonitorMonitoring,
    } = useSitesStore(
        useShallow(
            useCallback(
                (state) => ({
                    checkSiteNow: state.checkSiteNow,
                    setSelectedMonitorId: state.setSelectedMonitorId,
                    startSiteMonitoring: state.startSiteMonitoring,
                    startSiteMonitorMonitoring:
                        state.startSiteMonitorMonitoring,
                    stopSiteMonitoring: state.stopSiteMonitoring,
                    stopSiteMonitorMonitoring: state.stopSiteMonitorMonitoring,
                }),
                []
            )
        )
    );
    const { selectSite, setShowSiteDetails } = useUIStore(
        useShallow(
            useCallback(
                (state) => ({
                    selectSite: state.selectSite,
                    setShowSiteDetails: state.setShowSiteDetails,
                }),
                []
            )
        )
    );

    // Start monitoring the site with proper logging
    const handleStartMonitoring = useCallback(() => {
        if (!monitor) {
            logger.site.error(
                site.identifier,
                ensureError(
                    new Error(
                        "Attempted to start monitoring without valid monitor"
                    )
                )
            );
            return;
        }

        runLoggedSiteOperation({
            onSuccess: () => {
                logger.user.action("Started site monitoring", {
                    monitorId: monitor.id,
                    monitorType: monitor.type,
                    siteIdentifier: site.identifier,
                    siteName: site.name,
                });
            },
            operation: () =>
                startSiteMonitorMonitoring(site.identifier, monitor.id),
            siteIdentifier: site.identifier,
        });
    }, [
        monitor,
        site.identifier,
        site.name,
        startSiteMonitorMonitoring,
    ]);

    // Stop monitoring the site with proper logging
    const handleStopMonitoring = useCallback(() => {
        if (!monitor) {
            logger.site.error(
                site.identifier,
                ensureError(
                    new Error(
                        "Attempted to stop monitoring without valid monitor"
                    )
                )
            );
            return;
        }

        runLoggedSiteOperation({
            onSuccess: () => {
                logger.user.action("Stopped site monitoring", {
                    monitorId: monitor.id,
                    monitorType: monitor.type,
                    siteIdentifier: site.identifier,
                    siteName: site.name,
                });
            },
            operation: () =>
                stopSiteMonitorMonitoring(site.identifier, monitor.id),
            siteIdentifier: site.identifier,
        });
    }, [
        monitor,
        site.identifier,
        site.name,
        stopSiteMonitorMonitoring,
    ]);

    // Start monitoring for all monitors in the site with proper logging
    const handleStartSiteMonitoring = useCallback((): void => {
        runLoggedSiteOperation({
            onSuccess: () => {
                logger.user.action("Started site-wide monitoring", {
                    monitorsCount: site.monitors.length,
                    siteIdentifier: site.identifier,
                    siteName: site.name,
                });
            },
            operation: () => startSiteMonitoring(site.identifier),
            siteIdentifier: site.identifier,
        });
    }, [
        site.identifier,
        site.monitors.length,
        site.name,
        startSiteMonitoring,
    ]);

    // Stop monitoring for all monitors in the site with proper logging
    const handleStopSiteMonitoring = useCallback((): void => {
        runLoggedSiteOperation({
            onSuccess: () => {
                logger.user.action("Stopped site-wide monitoring", {
                    monitorsCount: site.monitors.length,
                    siteIdentifier: site.identifier,
                    siteName: site.name,
                });
            },
            operation: () => stopSiteMonitoring(site.identifier),
            siteIdentifier: site.identifier,
        });
    }, [
        site.identifier,
        site.monitors.length,
        site.name,
        stopSiteMonitoring,
    ]);

    // Perform an immediate status check with enhanced logging
    const handleCheckNow = useCallback((): void => {
        if (!monitor) {
            logger.site.error(
                site.identifier,
                ensureError(
                    new Error("Attempted to check site without valid monitor")
                )
            );
            return;
        }

        logger.user.action("Manual site check initiated", {
            monitorId: monitor.id,
            monitorType: monitor.type,
            siteIdentifier: site.identifier,
            siteName: site.name,
        });

        // Handle async operation with proper error handling
        // Note: This is a fire-and-forget operation that continues after
        // component unmount
        void (async (): Promise<void> => {
            try {
                await checkSiteNow(site.identifier, monitor.id);
                logger.user.action("Manual site check completed successfully", {
                    monitorId: monitor.id,
                    siteIdentifier: site.identifier,
                    siteName: site.name,
                });
            } catch (error) {
                const errorObj = ensureError(error);
                logger.site.error(site.identifier, errorObj);
                // Don't re-throw here since this is a fire-and-forget operation
            }
        })();
    }, [
        checkSiteNow,
        monitor,
        site.identifier,
        site.name,
    ]);

    // Handle clicking on the site card to show details with navigation logging
    const handleCardClick = useCallback(() => {
        logger.user.action("Site card clicked - navigating to details", {
            monitorId: monitor?.id,
            monitorType: monitor?.type,
            siteIdentifier: site.identifier,
            siteName: site.name,
        });

        selectSite(site);
        if (monitor) {
            setSelectedMonitorId(site.identifier, monitor.id);
        }
        setShowSiteDetails(true);
    }, [
        monitor,
        selectSite,
        setSelectedMonitorId,
        setShowSiteDetails,
        site,
    ]);

    return {
        handleCardClick,
        handleCheckNow,
        handleStartMonitoring,
        handleStartSiteMonitoring,
        handleStopMonitoring,
        handleStopSiteMonitoring,
    };
}
