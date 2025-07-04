import { useCallback } from "react";

import logger from "../../services/logger";
import { useSitesStore, useUIStore } from "../../stores";
import { Monitor, Site } from "../../types";

interface SiteActionsResult {
    // Action handlers
    handleStartMonitoring: () => void;
    handleStopMonitoring: () => void;
    handleCheckNow: () => void;
    handleCardClick: () => void;
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
            logger.error("Attempted to start monitoring without valid monitor", undefined, {
                siteId: site.identifier,
                siteName: site.name,
            });
            return;
        }

        try {
            startSiteMonitorMonitoring(site.identifier, monitor.id);
            logger.user.action("Started site monitoring", {
                monitorId: monitor.id,
                monitorType: monitor.type,
                siteId: site.identifier,
                siteName: site.name,
            });
        } catch (error) {
            logger.site.error(site.identifier, error instanceof Error ? error : String(error));
        }
    }, [monitor, site.identifier, site.name, startSiteMonitorMonitoring]);

    // Stop monitoring the site with proper logging
    const handleStopMonitoring = useCallback(() => {
        if (!monitor) {
            logger.error("Attempted to stop monitoring without valid monitor", undefined, {
                siteId: site.identifier,
                siteName: site.name,
            });
            return;
        }

        try {
            stopSiteMonitorMonitoring(site.identifier, monitor.id);
            logger.user.action("Stopped site monitoring", {
                monitorId: monitor.id,
                monitorType: monitor.type,
                siteId: site.identifier,
                siteName: site.name,
            });
        } catch (error) {
            logger.site.error(site.identifier, error instanceof Error ? error : String(error));
        }
    }, [monitor, site.identifier, site.name, stopSiteMonitorMonitoring]);

    // Perform an immediate status check with enhanced logging
    const handleCheckNow = useCallback(() => {
        if (!monitor) {
            logger.error("Attempted to check site without valid monitor", undefined, {
                siteId: site.identifier,
                siteName: site.name,
            });
            return;
        }

        logger.user.action("Manual site check initiated", {
            monitorId: monitor.id,
            monitorType: monitor.type,
            siteId: site.identifier,
            siteName: site.name,
        });

        checkSiteNow(site.identifier, monitor.id)
            .then(() => {
                logger.user.action("Manual site check completed successfully", {
                    monitorId: monitor.id,
                    siteId: site.identifier,
                    siteName: site.name,
                });
                return undefined; // Explicitly return undefined to satisfy ESLint
            })
            .catch((error) => {
                logger.site.error(site.identifier, error instanceof Error ? error : String(error));
                logger.error("Manual site check failed", error instanceof Error ? error : String(error), {
                    monitorId: monitor.id,
                    siteId: site.identifier,
                    siteName: site.name,
                });
            });
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
