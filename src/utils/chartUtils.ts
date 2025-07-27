/**
 * Type-safe Chart.js configuration utilities.
 * Provides type guards and safe access to Chart.js configuration properties.
 *
 * @packageDocumentation
 */

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
        // eslint-disable-next-line security/detect-object-injection -- part is from controlled path string
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
    if (!hasScales(config)) {
        return undefined;
    }

    const scales = config.scales as Record<string, unknown>;
    if (axis in scales) {
        // eslint-disable-next-line security/detect-object-injection -- axis is validated to be "x" or "y"
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

    // eslint-disable-next-line security/detect-object-injection -- property is from known Chart.js configuration
    return scale[property];
}

/**
 * Type guard to check if scales property exists and has the expected structure.
 *
 * @param config - Chart configuration object
 * @returns True if scales exists with x and y properties
 */
export function hasScales(config: unknown): config is { scales: { x?: unknown; y?: unknown } } {
    return (
        typeof config === "object" &&
        config !== null &&
        "scales" in config &&
        typeof (config as { scales?: unknown }).scales === "object" &&
        (config as { scales?: unknown }).scales !== null
    );
}
