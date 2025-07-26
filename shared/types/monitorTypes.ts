/**
 * Shared monitor type interfaces used across frontend and backend.
 */

/**
 * Common display configuration for monitor types.
 */
export interface MonitorTypeDisplayCommons {
    /** Display preferences */
    display?: {
        showAdvancedMetrics?: boolean;
        showUrl?: boolean;
    };
}

/**
 * Common UI configuration properties shared between frontend and backend monitor types.
 */
export interface MonitorTypeUICommons {
    /** Help text for form fields */
    helpTexts?: {
        primary?: string;
        secondary?: string;
    };
    /** Whether this monitor type supports advanced analytics */
    supportsAdvancedAnalytics?: boolean;
    /** Whether this monitor type supports response time analytics */
    supportsResponseTime?: boolean;
}
