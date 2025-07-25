import { useCallback } from "react";

import logger from "../../services/logger";
import { useSitesStore } from "../../stores/sites/useSitesStore";
import { useUIStore } from "../../stores/ui/useUiStore";
import { Monitor, Site } from "../../types";
import { ensureError } from "../../utils/errorHandling";

/**
 * Result interface for the useSiteActions hook
 *
 * @public
 */
export interface SiteActionsResult {
    handleCardClick: () => void;
    handleCheckNow: () => void;
    // Action handlers
    handleStartMonitoring: () => void;
    handleStopMonitoring: () => void;
}

/**
 * Hook to handle site-related actions like checking status and monitoring
 * Integrated with logger and state management for proper tracking
 *
 * @param site - The site object to act upon
 * @param monitor - The specific monitor to use for actions
 * @returns Object containing action handler functions
 */
export function useSiteActions(site: Site, monitor: Monitor | undefined): SiteActionsResult {
    const { checkSiteNow, setSelectedMonitorId, startSiteMonitorMonitoring, stopSiteMonitorMonitoring } =
        useSitesStore();
    const { setSelectedSite, setShowSiteDetails } = useUIStore();

    // Start monitoring the site with proper logging
    const handleStartMonitoring = useCallback(() => {
        if (!monitor) {
            logger.site.error(
                site.identifier,
                ensureError(new Error("Attempted to start monitoring without valid monitor"))
            );
            return;
        }

        try {
            void startSiteMonitorMonitoring(site.identifier, monitor.id);
            logger.user.action("Started site monitoring", {
                monitorId: monitor.id,
                monitorType: monitor.type,
                siteId: site.identifier,
                siteName: site.name,
            });
        } catch (error) {
            logger.site.error(site.identifier, ensureError(error));
        }
    }, [monitor, site.identifier, site.name, startSiteMonitorMonitoring]);

    // Stop monitoring the site with proper logging
    const handleStopMonitoring = useCallback(() => {
        if (!monitor) {
            logger.site.error(
                site.identifier,
                ensureError(new Error("Attempted to stop monitoring without valid monitor"))
            );
            return;
        }

        try {
            void stopSiteMonitorMonitoring(site.identifier, monitor.id);
            logger.user.action("Stopped site monitoring", {
                monitorId: monitor.id,
                monitorType: monitor.type,
                siteId: site.identifier,
                siteName: site.name,
            });
        } catch (error) {
            logger.site.error(site.identifier, ensureError(error));
        }
    }, [monitor, site.identifier, site.name, stopSiteMonitorMonitoring]);

    // Perform an immediate status check with enhanced logging
    const handleCheckNow = useCallback(() => {
        if (!monitor) {
            logger.site.error(site.identifier, ensureError(new Error("Attempted to check site without valid monitor")));
            return;
        }

        logger.user.action("Manual site check initiated", {
            monitorId: monitor.id,
            monitorType: monitor.type,
            siteId: site.identifier,
            siteName: site.name,
        });

        // Handle async operation with proper error handling
        // Note: This is a fire-and-forget operation that continues after component unmount
        void (async () => {
            try {
                await checkSiteNow(site.identifier, monitor.id);
                logger.user.action("Manual site check completed successfully", {
                    monitorId: monitor.id,
                    siteId: site.identifier,
                    siteName: site.name,
                });
            } catch (error) {
                const errorObj = ensureError(error);
                logger.site.error(site.identifier, errorObj);
                // Don't re-throw here since this is a fire-and-forget operation
            }
        })();
    }, [checkSiteNow, monitor, site.identifier, site.name]);

    // Handle clicking on the site card to show details with navigation logging
    const handleCardClick = useCallback(() => {
        logger.user.action("Site card clicked - navigating to details", {
            monitorId: monitor?.id,
            monitorType: monitor?.type,
            siteId: site.identifier,
            siteName: site.name,
        });

        setSelectedSite(site);
        if (monitor) {
            setSelectedMonitorId(site.identifier, monitor.id);
        }
        setShowSiteDetails(true);
    }, [monitor, setSelectedMonitorId, setSelectedSite, setShowSiteDetails, site]);

    return {
        handleCardClick,
        handleCheckNow,
        handleStartMonitoring,
        handleStopMonitoring,
    };
}
