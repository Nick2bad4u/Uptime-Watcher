/**
 * Shared monitor type interfaces used across frontend and backend.
 *
 * @remarks
 * These interfaces define common configuration and UI properties for monitor
 * types, ensuring consistency between frontend and backend implementations.
 */

import type { MonitorFieldDefinition } from "@shared/types";

/**
 * Shared representation of a monitor type configuration used by frontend and
 * backend.
 *
 * @remarks
 * Mirrors the structure provided by the backend registry and consumed by the
 * renderer. Kept in shared types to avoid circular dependencies between
 * src/utils helpers and Zustand stores.
 *
 * @public
 */
export interface MonitorTypeConfig {
    /** Description of what this monitor checks */
    description: string;
    /** Human-readable display name */
    displayName: string;
    /** Field definitions for dynamic form generation */
    fields: MonitorFieldDefinition[];
    /** Unique identifier for the monitor type */
    type: string;
    /** UI display configuration */
    uiConfig?: {
        /** Detail label formatter for different contexts */
        detailFormats?: {
            /** Format for analytics display */
            analyticsLabel?: string;
            // Note: Functions are excluded as they can't be serialized over IPC
        };
        /** Display preferences */
        display?: {
            showAdvancedMetrics?: boolean;
            showUrl?: boolean;
        };
        /** Help text for form fields */
        helpTexts?: {
            primary?: string;
            secondary?: string;
        };
        /** Whether this monitor type supports advanced analytics */
        supportsAdvancedAnalytics?: boolean;
        /** Whether this monitor type supports response time analytics */
        supportsResponseTime?: boolean;
    };
    /** Version of the monitor implementation */
    version: string;
}

/**
 * Common display configuration for monitor types.
 *
 * @remarks
 * Provides display-related preferences that can be used to control how monitor
 * types are presented in the UI.
 *
 * @public
 */
export interface MonitorTypeDisplayCommons {
    /**
     * Display preferences for the monitor type.
     *
     * @remarks
     * Controls visibility of advanced metrics and URL display in the UI.
     */
    display?: {
        /**
         * Whether to show advanced metrics for this monitor type.
         *
         * @defaultValue false
         */
        showAdvancedMetrics?: boolean;
        /**
         * Whether to display the monitored URL in the UI.
         *
         * @defaultValue true
         */
        showUrl?: boolean;
    };
}

/**
 * Common UI configuration properties shared between frontend and backend
 * monitor types.
 *
 * @remarks
 * These properties provide UI hints, help texts, and feature support flags for
 * monitor types, enabling consistent rendering and feature gating.
 *
 * @public
 */
export interface MonitorTypeUICommons {
    /**
     * Help text for form fields associated with this monitor type.
     *
     * @remarks
     * Used to provide contextual guidance to users configuring monitors.
     */
    helpTexts?: {
        /**
         * Primary help text for the main form field.
         */
        primary?: string;
        /**
         * Secondary help text for additional context or advanced options.
         */
        secondary?: string;
    };
    /**
     * Whether this monitor type supports advanced analytics.
     *
     * @remarks
     * If true, advanced analytics features may be enabled in the UI.
     *
     * @defaultValue false
     */
    supportsAdvancedAnalytics?: boolean;
    /**
     * Whether this monitor type supports response time analytics.
     *
     * @remarks
     * If true, response time metrics and charts may be shown in the UI.
     *
     * @defaultValue false
     */
    supportsResponseTime?: boolean;
}
