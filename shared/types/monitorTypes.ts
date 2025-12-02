/**
 * Shared monitor type interfaces used across frontend and backend.
 *
 * @remarks
 * These interfaces define common configuration and UI properties for monitor
 * types, ensuring consistency between frontend and backend implementations.
 */

import type { MonitorFieldDefinition } from "@shared/types";
import type { UnknownRecord } from "type-fest";

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

const MONITOR_FIELD_TYPE_VALUES: ReadonlyArray<MonitorFieldDefinition["type"]> =
    [
        "number",
        "select",
        "text",
        "url",
    ];

const ALLOWED_FIELD_TYPES = new Set<string>(MONITOR_FIELD_TYPE_VALUES);

const isAllowedFieldType = (
    candidate: unknown
): candidate is MonitorFieldDefinition["type"] =>
    typeof candidate === "string" && ALLOWED_FIELD_TYPES.has(candidate);

/**
 * Determines whether a candidate is a plain object with string keys.
 *
 * @param candidate - Value to evaluate.
 *
 * @returns `true` when the candidate is a non-null object without an array tag.
 */
const isPlainObject = (candidate: unknown): candidate is UnknownRecord =>
    typeof candidate === "object" &&
    candidate !== null &&
    !Array.isArray(candidate);

/**
 * Checks whether a value is an optional string.
 *
 * @param value - Value to check.
 *
 * @returns `true` when the value is either undefined or a string.
 */
const isOptionalString = (value: unknown): value is string | undefined =>
    value === undefined || typeof value === "string";

/**
 * Checks whether a value is an optional number.
 *
 * @param value - Value to check.
 *
 * @returns `true` when the value is either undefined or a number.
 */
const isOptionalNumber = (value: unknown): value is number | undefined =>
    value === undefined || typeof value === "number";

/**
 * Checks whether a value is an optional boolean.
 *
 * @param value - Value to check.
 *
 * @returns `true` when the value is either undefined or a boolean.
 */
const isOptionalBoolean = (value: unknown): value is boolean | undefined =>
    value === undefined || typeof value === "boolean";

/**
 * Determines whether a value is a non-empty string.
 *
 * @param value - Value to check.
 *
 * @returns `true` when the value is a string with a positive length.
 */
const isNonEmptyString = (value: unknown): value is string =>
    typeof value === "string" && value.length > 0;

/**
 * Determines whether a value represents a valid monitor field option.
 *
 * @param value - Value to inspect.
 *
 * @returns `true` when the value includes non-empty label and value strings.
 */
const isValidMonitorFieldOption = (
    value: unknown
): value is { label: string; value: string } => {
    if (!isPlainObject(value)) {
        return false;
    }

    const { label, value: optionValue } = value;

    return isNonEmptyString(label) && isNonEmptyString(optionValue);
};

/**
 * Validates the optional list of select field options.
 *
 * @param options - Value supplied for the `options` property.
 *
 * @returns `true` when the options are either absent or a well-formed array.
 */
const hasValidFieldOptions = (
    options: unknown
): options is MonitorFieldDefinition["options"] => {
    if (options === undefined) {
        return true;
    }

    if (!Array.isArray(options)) {
        return false;
    }

    return options.every(isValidMonitorFieldOption);
};

/**
 * Determines whether a value is a valid monitor UI detail formats object.
 *
 * @param candidate - Value to examine.
 *
 * @returns `true` when the detail formats structure is valid.
 */
const isValidDetailFormats = (
    candidate: unknown
): candidate is NonNullable<MonitorTypeConfig["uiConfig"]>["detailFormats"] => {
    if (candidate === undefined) {
        return true;
    }

    if (!isPlainObject(candidate)) {
        return false;
    }

    const { analyticsLabel } = candidate;

    return isOptionalString(analyticsLabel);
};

/**
 * Determines whether a value is a valid monitor display configuration.
 *
 * @param candidate - Value to examine.
 *
 * @returns `true` when the display configuration is valid.
 */
const isValidDisplayConfig = (
    candidate: unknown
): candidate is NonNullable<MonitorTypeConfig["uiConfig"]>["display"] => {
    if (candidate === undefined) {
        return true;
    }

    if (!isPlainObject(candidate)) {
        return false;
    }

    const { showAdvancedMetrics, showUrl } = candidate;

    return isOptionalBoolean(showAdvancedMetrics) && isOptionalBoolean(showUrl);
};

/**
 * Determines whether a value is a valid monitor help text configuration.
 *
 * @param candidate - Value to examine.
 *
 * @returns `true` when the help text configuration is valid.
 */
const isValidHelpTexts = (
    candidate: unknown
): candidate is NonNullable<MonitorTypeConfig["uiConfig"]>["helpTexts"] => {
    if (candidate === undefined) {
        return true;
    }

    if (!isPlainObject(candidate)) {
        return false;
    }

    const { primary, secondary } = candidate;

    return isOptionalString(primary) && isOptionalString(secondary);
};

/**
 * Determines whether a value is a valid monitor type UI configuration.
 *
 * @param candidate - Value to examine.
 *
 * @returns `true` when the UI configuration satisfies structural requirements.
 */
const isValidMonitorTypeUiConfig = (
    candidate: unknown
): candidate is NonNullable<MonitorTypeConfig["uiConfig"]> => {
    if (candidate === undefined) {
        return true;
    }

    if (!isPlainObject(candidate)) {
        return false;
    }

    const {
        detailFormats,
        display,
        helpTexts,
        supportsAdvancedAnalytics,
        supportsResponseTime,
    } = candidate;

    return (
        isValidDetailFormats(detailFormats) &&
        isValidDisplayConfig(display) &&
        isValidHelpTexts(helpTexts) &&
        isOptionalBoolean(supportsAdvancedAnalytics) &&
        isOptionalBoolean(supportsResponseTime)
    );
};

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
    if (!isPlainObject(candidate)) {
        return false;
    }

    const {
        helpText,
        label,
        max,
        min,
        name,
        options,
        placeholder,
        required,
        type,
    } = candidate;

    if (!isNonEmptyString(label) || !isNonEmptyString(name)) {
        return false;
    }

    if (typeof required !== "boolean") {
        return false;
    }

    if (typeof type !== "string") {
        return false;
    }

    if (!isAllowedFieldType(type)) {
        return false;
    }

    if (!isOptionalString(helpText) || !isOptionalString(placeholder)) {
        return false;
    }

    if (!isOptionalNumber(max) || !isOptionalNumber(min)) {
        return false;
    }

    return hasValidFieldOptions(options);
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
    if (!isPlainObject(candidate)) {
        return false;
    }

    const { description, displayName, fields, type, uiConfig, version } =
        candidate;

    if (
        !isNonEmptyString(type) ||
        !isNonEmptyString(displayName) ||
        !isNonEmptyString(description) ||
        !isNonEmptyString(version)
    ) {
        return false;
    }

    if (!Array.isArray(fields) || fields.length === 0) {
        return false;
    }

    if (!fields.every(isMonitorFieldDefinition)) {
        return false;
    }

    return isValidMonitorTypeUiConfig(uiConfig);
}
