/**
 * Type-safe Chart.js configuration utilities.
 *
 * @remarks
 * Provides type guards and safe access to Chart.js configuration properties
 * with proper TypeScript support using hybrid Chart.js types.
 *
 * This module uses the hybrid Chart.js type system to provide:
 *
 * - Type-safe access to scale configurations
 * - Safe nested property navigation
 * - Business logic type integration
 * - Chart.js API compatibility
 *
 * @packageDocumentation
 *
 * @see hybrid-type-system.md for hybrid type strategy
 */

import type { ChartScalesConfig } from "@shared/types/chartHybrid";
import type { Simplify } from "type-fest";

import { hasScales as hasScalesInternal } from "@shared/types/chartConfig";

/**
 * Type-safe scale configuration result.
 */
type ScaleConfigResult = Simplify<{
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
): ChartScalesConfig[keyof ChartScalesConfig] | undefined {
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

    for (const part of pathParts) {
        if (
            typeof current !== "object" ||
            current === null ||
            // eslint-disable-next-line prefer-object-has-own
            !Object.prototype.hasOwnProperty.call(current, part)
        ) {
            return {
                exists: false,
                validPath,
                value: undefined,
            };
        }

        validPath.push(part);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
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
    if (!scale) {
        return undefined;
    }

    // Check if property exists safely
    // eslint-disable-next-line prefer-object-has-own
    if (!Object.prototype.hasOwnProperty.call(scale, property)) {
        return undefined;
    }

    // Scale is guaranteed to be an object here, safe to access property
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (scale as Record<string, unknown>)[property];
}
