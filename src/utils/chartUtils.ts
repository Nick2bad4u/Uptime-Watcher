/**
 * Type-safe Chart.js configuration utilities.
 * Provides type guards and safe access to Chart.js configuration properties.
 *
 * @packageDocumentation
 */

import { hasScales as hasScalesInternal } from "@shared/types/chartConfig";

// Re-export hasScales for convenience
export { hasScales } from "@shared/types/chartConfig";

/**
 * Safely get nested property from scale configuration.
 *
 * @param config - Chart configuration
 * @param axis - Axis name ("x" or "y")
 * @param path - Property path (e.g., "title.text")
 * @returns Property value or undefined
 */
export function getNestedScaleProperty(config: unknown, axis: "x" | "y", path: string): unknown {
    const scale = getScaleConfig(config, axis);
    if (!scale) {
        return undefined;
    }

    const pathParts = path.split(".");
    let current: unknown = scale;

    for (const part of pathParts) {
        if (typeof current !== "object" || current === null || !(part in (current as Record<string, unknown>))) {
            return undefined;
        }

        current = (current as Record<string, unknown>)[part];
    }

    return current;
}

/**
 * Safely get scale configuration.
 *
 * @param config - Chart configuration
 * @param axis - Axis name ("x" or "y")
 * @returns Scale configuration or undefined
 */
export function getScaleConfig(config: unknown, axis: "x" | "y"): Record<string, unknown> | undefined {
    if (!hasScalesInternal(config)) {
        return undefined;
    }

    const scales = config.scales as Record<string, unknown>;
    if (axis in scales) {
        const scale = scales[axis];
        return typeof scale === "object" && scale !== null ? (scale as Record<string, unknown>) : undefined;
    }

    return undefined;
}

/**
 * Safely get a property from a scale configuration.
 *
 * @param config - Chart configuration
 * @param axis - Axis name ("x" or "y")
 * @param property - Property name to access
 * @returns Property value or undefined
 */
export function getScaleProperty(config: unknown, axis: "x" | "y", property: string): unknown {
    const scale = getScaleConfig(config, axis);
    if (!scale || !(property in scale)) {
        return undefined;
    }

    return scale[property];
}
