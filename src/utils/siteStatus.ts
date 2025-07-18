/**
 * Site status calculation utilities - Frontend wrapper.
 * This file re-exports the shared status utilities for frontend use.
 */

// Re-export everything from shared utilities
export type { SiteStatus } from "../../shared/types";
export {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "../../shared/utils/siteStatus";
