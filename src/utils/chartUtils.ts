/**
 * Type-safe Chart.js configuration utilities.
 *
 * @remarks
 * Provides type guards and safe access to Chart.js configuration properties
 * with proper TypeScript support.
 *
 * @packageDocumentation
 */

import type { Simplify, UnknownRecord } from "type-fest";

import { hasScales as hasScalesInternal } from "@shared/types/chartConfig";

/**
 * Type-safe scale configuration result.
 */
type ScaleConfigResult = Simplify<{
    /** The scale configuration object */
    config: UnknownRecord;
    /** Whether the scale exists */
    exists: boolean;
}>;

/**
 * Enhanced scale configuration access with existence tracking.
 *
 * @param config - Chart configuration
 * @param axis - Axis name ("x" or "y")
 *
 * @returns Scale configuration result with existence information
 */
export function getScaleConfigSafe(
    config: unknown,
    axis: "x" | "y"
): ScaleConfigResult {
    if (!hasScalesInternal(config)) {
        return {
            config: {},
            exists: false,
        };
    }

    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Safe navigation through Chart.js config object structure */
    const scales = config.scales as UnknownRecord;
    if (axis in scales) {
        const scale = scales[axis];
        const isValidScale = typeof scale === "object" && scale !== null;
        return {
            config: isValidScale ? (scale as UnknownRecord) : {},
            exists: isValidScale,
        };
    }
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */

    return {
        config: {},
        exists: false,
    };
}

// Make hasScales available for external use

/**
 * Safely get scale configuration.
 *
 * @param config - Chart configuration
 * @param axis - Axis name ("x" or "y")
 *
 * @returns Scale configuration or undefined
 */
export function getScaleConfig(
    config: unknown,
    axis: "x" | "y"
): undefined | UnknownRecord {
    const result = getScaleConfigSafe(config, axis);
    return result.exists ? result.config : undefined;
}

/**
 * Type-safe nested property access result.
 */
type PropertyAccessResult = Simplify<{
    /** Whether the property path exists */
    exists: boolean;
    /** The path that was successfully traversed */
    validPath: string[];
    /** The retrieved value */
    value: unknown;
}>;

/**
 * Enhanced nested property access with detailed path information.
 *
 * @param config - Chart configuration
 * @param axis - Axis name ("x" or "y")
 * @param path - Property path (e.g., "title.text")
 *
 * @returns Detailed property access result
 */
export function getNestedScalePropertySafe(
    config: unknown,
    axis: "x" | "y",
    path: string
): PropertyAccessResult {
    const scaleResult = getScaleConfigSafe(config, axis);
    if (!scaleResult.exists) {
        return {
            exists: false,
            validPath: [],
            value: undefined,
        };
    }

    const pathParts = path.split(".");
    let current: unknown = scaleResult.config;
    const validPath: string[] = [];

    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Safe navigation through nested chart config properties */
    for (const part of pathParts) {
        if (
            typeof current !== "object" ||
            current === null ||
            !(part in (current as UnknownRecord))
        ) {
            return {
                exists: false,
                validPath,
                value: undefined,
            };
        }

        validPath.push(part);
        current = (current as UnknownRecord)[part];
    }
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion */

    return {
        exists: true,
        validPath,
        value: current,
    };
}

/**
 * Safely get nested property from scale configuration.
 *
 * @param config - Chart configuration
 * @param axis - Axis name ("x" or "y")
 * @param path - Property path (e.g., "title.text")
 *
 * @returns Property value or undefined
 */
export function getNestedScaleProperty(
    config: unknown,
    axis: "x" | "y",
    path: string
): unknown {
    const result = getNestedScalePropertySafe(config, axis, path);
    return result.exists ? result.value : undefined;
}

/**
 * Safely get a property from a scale configuration.
 *
 * @param config - Chart configuration
 * @param axis - Axis name ("x" or "y")
 * @param property - Property name to access
 *
 * @returns Property value or undefined
 */
export function getScaleProperty(
    config: unknown,
    axis: "x" | "y",
    property: string
): unknown {
    const scale = getScaleConfig(config, axis);
    if (!scale || !(property in scale)) {
        return undefined;
    }

    return scale[property];
}
