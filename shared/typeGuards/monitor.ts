import type { Monitor, MonitorType } from "@shared/types";

/**
 * Runtime type guard to check if a monitor is of a specific type.
 */
export function isMonitorOfType<T extends MonitorType>(
    monitor: Monitor,
    type: T
): monitor is Monitor & { type: T } {
    return monitor.type === type;
}

/**
 * Assertion function to ensure a monitor is of a specific type. Throws an error
 * if assertion fails.
 */
export function assertMonitorType<T extends MonitorType>(
    monitor: Monitor,
    type: T,
    context: string = "monitor"
): asserts monitor is Monitor & { type: T } {
    if (monitor.type !== type) {
        throw new Error(
            `Expected ${context} to be type '${type}', received '${monitor.type}'`
        );
    }
}
