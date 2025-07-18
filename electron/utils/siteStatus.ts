/**
 * Site status calculation utilities - Backend wrapper.
 * This file re-exports the shared status utilities for backend use.
 */

// Re-export everything from shared utilities
export type { SiteStatus } from "../../shared/types";
export {
    calculateSiteStatus,
    calculateSiteMonitoringStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "../../shared/utils/siteStatus";
