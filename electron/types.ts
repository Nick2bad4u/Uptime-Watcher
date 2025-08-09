/**
 * Type definitions for Electron main process.
 *
 * @remarks
 * All core domain types are imported from shared/types.ts for consistency.
 *
 * @packageDocumentation
 */

// Explicit exports from shared types for clarity and to avoid re-export linting issues
export type {
    DEFAULT_MONITOR_STATUS,
    DEFAULT_SITE_STATUS,
    Monitor,
    MonitorFieldDefinition,
    MonitorStatus,
    MonitorStatusConstants,
    MonitorType,
    Site,
    SiteForStatus,
    SiteStatus,
    StatusHistory,
    StatusUpdate,
} from "../shared/types";

export {
    BASE_MONITOR_TYPES,
    isComputedSiteStatus,
    isMonitorStatus,
    isSiteStatus,
    MONITOR_STATUS,
    validateMonitor,
} from "../shared/types";
