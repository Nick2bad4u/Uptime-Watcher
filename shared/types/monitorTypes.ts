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
 * Option tuple for selecting monitor types in UI elements.
 *
 * @remarks
 * Shared between renderer dropdowns and backend generated fallback lists to
 * guarantee consistent labeling and identifier usage. Re-exported from renderer
 * constants to maintain backwards compatibility with existing imports.
 *
 * @public
 */
export interface MonitorTypeOption {
    /** Human-readable display label presented to users. */
    label: string;
    /** Stable monitor type identifier used across IPC boundaries. */
    value: string;
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

const ALLOWED_FIELD_TYPES = new Set<MonitorFieldDefinition["type"]>([
    "number",
    "select",
    "text",
    "url",
]);

/**
 * Runtime type guard verifying a monitor field definition structure.
 *
 * @remarks
 * Ensures IPC payloads or cached values match the {@link MonitorFieldDefinition}
 * contract before they reach renderer logic. This guard is shared across main
 * and renderer processes to keep cross-layer validation consistent.
 *
 * @param candidate - Arbitrary value to validate.
 *
 * @returns `true` when the candidate satisfies {@link MonitorFieldDefinition}.
 */
export function isMonitorFieldDefinition(
    candidate: unknown
): candidate is MonitorFieldDefinition {
    if (typeof candidate !== "object" || candidate === null) {
        return false;
    }

    const record = candidate as Partial<MonitorFieldDefinition> &
        Record<string, unknown>;

    if (typeof record.label !== "string" || record.label.length === 0) {
        return false;
    }

    if (typeof record.name !== "string" || record.name.length === 0) {
        return false;
    }

    if (typeof record.required !== "boolean") {
        return false;
    }

    if (!ALLOWED_FIELD_TYPES.has(record.type)) {
        return false;
    }

    if (record.helpText !== undefined && typeof record.helpText !== "string") {
        return false;
    }

    if (
        record.placeholder !== undefined &&
        typeof record.placeholder !== "string"
    ) {
        return false;
    }

    if (record.max !== undefined && typeof record.max !== "number") {
        return false;
    }

    if (record.min !== undefined && typeof record.min !== "number") {
        return false;
    }

    if (record.options !== undefined) {
        if (!Array.isArray(record.options)) {
            return false;
        }

        for (const option of record.options) {
            if (
                typeof option !== "object" ||
                option === null ||
                typeof option.label !== "string" ||
                typeof option.value !== "string"
            ) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Runtime type guard validating serialized monitor type configurations.
 *
 * @remarks
 * Used when accepting IPC payloads or cache entries to ensure they match the
 * canonical {@link MonitorTypeConfig} contract before mutating application
 * state. The guard intentionally checks only JSON-serializable properties to
 * mirror what crosses the process boundary.
 *
 * @param candidate - Value to validate.
 *
 * @returns `true` when the candidate is a {@link MonitorTypeConfig}.
 */
export function isMonitorTypeConfig(
    candidate: unknown
): candidate is MonitorTypeConfig {
    if (typeof candidate !== "object" || candidate === null) {
        return false;
    }

    const record = candidate as Partial<MonitorTypeConfig> &
        Record<string, unknown>;

    if (typeof record.type !== "string" || record.type.length === 0) {
        return false;
    }

    if (
        typeof record.displayName !== "string" ||
        record.displayName.length === 0
    ) {
        return false;
    }

    if (
        typeof record.description !== "string" ||
        record.description.length === 0
    ) {
        return false;
    }

    if (typeof record.version !== "string" || record.version.length === 0) {
        return false;
    }

    if (!Array.isArray(record.fields)) {
        return false;
    }

    if (
        record.fields.length === 0 ||
        !record.fields.every(isMonitorFieldDefinition)
    ) {
        return false;
    }

    if (record.uiConfig !== undefined) {
        if (typeof record.uiConfig !== "object" || record.uiConfig === null) {
            return false;
        }

        const uiConfig = record.uiConfig as MonitorTypeConfig["uiConfig"] &
            Record<string, unknown>;

        const { detailFormats, display, helpTexts } = uiConfig;

        if (detailFormats !== undefined) {
            if (typeof detailFormats !== "object" || detailFormats === null) {
                return false;
            }

            if (
                detailFormats.analyticsLabel !== undefined &&
                typeof detailFormats.analyticsLabel !== "string"
            ) {
                return false;
            }
        }

        if (display !== undefined) {
            if (typeof display !== "object" || display === null) {
                return false;
            }

            const { showAdvancedMetrics, showUrl } = display as Record<
                string,
                unknown
            >;

            if (
                showAdvancedMetrics !== undefined &&
                typeof showAdvancedMetrics !== "boolean"
            ) {
                return false;
            }

            if (showUrl !== undefined && typeof showUrl !== "boolean") {
                return false;
            }
        }

        if (helpTexts !== undefined) {
            if (typeof helpTexts !== "object" || helpTexts === null) {
                return false;
            }

            const { primary, secondary } = helpTexts as Record<string, unknown>;

            if (primary !== undefined && typeof primary !== "string") {
                return false;
            }

            if (secondary !== undefined && typeof secondary !== "string") {
                return false;
            }
        }

        if (
            uiConfig.supportsAdvancedAnalytics !== undefined &&
            typeof uiConfig.supportsAdvancedAnalytics !== "boolean"
        ) {
            return false;
        }

        if (
            uiConfig.supportsResponseTime !== undefined &&
            typeof uiConfig.supportsResponseTime !== "boolean"
        ) {
            return false;
        }
    }

    return true;
}
