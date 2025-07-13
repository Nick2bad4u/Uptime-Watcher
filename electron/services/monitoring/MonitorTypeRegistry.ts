/**
 * Extensible monitor type system for new monitoring capabilities.
 *
 * @remarks
 * This new architecture replaces hard-coded monitor types with a plugin-based
 * system that allows easy addition of new monitor types without code changes
 * in multiple files.
 */

// Base monitor type definition
export interface BaseMonitorConfig {
    /** Unique identifier for the monitor type */
    readonly type: string;
    /** Human-readable display name */
    readonly displayName: string;
    /** Description of what this monitor checks */
    readonly description: string;
    /** Version of the monitor implementation */
    readonly version: string;
}

// Registry for monitor types
const monitorTypes = new Map<string, BaseMonitorConfig>();

/**
 * Register a new monitor type.
 *
 * @param config - Monitor type configuration
 */
export function registerMonitorType(config: BaseMonitorConfig): void {
    monitorTypes.set(config.type, config);
}

/**
 * Get all registered monitor types.
 *
 * @returns Array of registered monitor types
 */
export function getRegisteredMonitorTypes(): string[] {
    return [...monitorTypes.keys()];
}

/**
 * Check if a monitor type is registered.
 *
 * @param type - Monitor type to check
 * @returns True if type is registered
 */
export function isValidMonitorType(type: string): boolean {
    return monitorTypes.has(type);
}

/**
 * Get configuration for a monitor type.
 *
 * @param type - Monitor type
 * @returns Monitor configuration or undefined
 */
export function getMonitorTypeConfig(type: string): BaseMonitorConfig | undefined {
    return monitorTypes.get(type);
}

// Register existing monitor types
registerMonitorType({
    type: "http",
    displayName: "HTTP/HTTPS Monitor",
    description: "Monitors HTTP/HTTPS endpoints for availability and response time",
    version: "1.0.0",
});

registerMonitorType({
    type: "port",
    displayName: "Port Monitor",
    description: "Monitors TCP port connectivity",
    version: "1.0.0",
});

// Type guard for runtime validation
export function isValidMonitorTypeGuard(type: unknown): type is string {
    return typeof type === "string" && isValidMonitorType(type);
}
