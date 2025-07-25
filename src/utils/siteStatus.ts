/**
 * Site status calculation utilities - Frontend wrapper.
 *
 * @remarks
 * This file re-exports the shared status utilities for frontend use,
 * providing a convenient access point for site status calculations
 * and formatting functions.
 */

export {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "../../shared/utils/siteStatus";
export type { SiteStatus } from "@shared/types";
