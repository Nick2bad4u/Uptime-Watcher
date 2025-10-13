/**
 * Type-safe Chart.js configuration utilities.
 *
 * @remarks
 * Provides safe accessors and metadata helpers for Chart.js configuration
 * structures using the project's hybrid Chart.js type system.
 *
 * @public
 *
 * @see hybrid-type-system.md for hybrid type strategy.
 */

import type { ChartScalesConfig } from "@shared/types/chartConfig";
import type { Simplify } from "type-fest";

import { hasScales as hasScalesInternal } from "@shared/types/chartConfig";

/**
 * Type-safe scale configuration result describing lookup outcomes.
 *
 * @public
 */
export type ScaleConfigResult = Simplify<{
    /** The scale configuration object */
    config:
        | ChartScalesConfig[keyof ChartScalesConfig]
        | Record<string, unknown>;
    /** Whether the scale exists */
    exists: boolean;
}>;

/**
 * Enhanced scale configuration access with existence tracking.
 *
 * @param config - Chart configuration
 * @param axis - Axis name ("x" or "y")
 *
 * @returns Scale configuration result with existence information.
 *
 * @public
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

    const chartConfig = config as { scales: Record<string, unknown> };
    const { scales } = chartConfig;

    if (axis in scales && scales[axis] !== undefined) {
        const scale = scales[axis];
        // Validate that the scale is actually an object (handle runtime type safety)
        if (typeof scale === "object" && scale !== null) {
            return {
                config: scale as ChartScalesConfig[keyof ChartScalesConfig],
                exists: true,
            };
        }
    }

    return {
        config: {},
        exists: false,
    };
}

// Make hasScales available for external use

/**
 * Safely get scale configuration, returning `undefined` when absent.
 *
 * @param config - Chart configuration.
 * @param axis - Axis name ("x" or "y").
 *
 * @returns Scale configuration or `undefined` when the scale is missing.
 *
 * @public
 */
export function getScaleConfig(
    config: unknown,
    axis: "x" | "y"
): ChartScalesConfig[keyof ChartScalesConfig] | undefined {
    const result = getScaleConfigSafe(config, axis);
    return result.exists ? result.config : undefined;
}

/**
 * Type-safe nested property access result.
 *
 * @public
 */
export type PropertyAccessResult = Simplify<{
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
 * @returns Detailed property access result.
 *
 * @public
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

    for (const part of pathParts) {
        if (
            typeof current !== "object" ||
            current === null ||
            !Object.hasOwn(current, part)
        ) {
            return {
                exists: false,
                validPath,
                value: undefined,
            };
        }

        validPath.push(part);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe: current is validated as object above, accessing known property
        current = (current as Record<string, unknown>)[part];
    }

    return {
        exists: true,
        validPath,
        value: current,
    };
}

/**
 * Safely get nested property from scale configuration.
 *
 * @param config - Chart configuration.
 * @param axis - Axis name ("x" or "y").
 * @param path - Property path (e.g., "title.text").
 *
 * @returns Property value or `undefined` when unavailable.
 *
 * @public
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
 * @param config - Chart configuration.
 * @param axis - Axis name ("x" or "y").
 * @param property - Property name to access.
 *
 * @returns Property value or `undefined` when the property is missing.
 *
 * @public
 */
export function getScaleProperty(
    config: unknown,
    axis: "x" | "y",
    property: string
): unknown {
    const scale = getScaleConfig(config, axis);
    if (!scale) {
        return undefined;
    }

    // Check if property exists safely
    if (!Object.hasOwn(scale, property)) {
        return undefined;
    }

    // Scale is guaranteed to be an object here, safe to access property
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Safe: scale validated as object with hasOwn check above
    return (scale as Record<string, unknown>)[property];
}
