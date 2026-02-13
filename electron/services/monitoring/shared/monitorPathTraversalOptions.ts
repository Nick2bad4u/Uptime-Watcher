/**
 * Options for monitor response path traversal safety controls.
 */
export interface MonitorPathTraversalOptions {
    /**
     * When true, bracketed array-index tokens (e.g. `items[0]`) are expanded
     * into dot-path segments during traversal.
     */
    readonly allowArrayIndexTokens?: boolean;

    /**
     * When true, traversal blocks prototype-chain related segment names.
     */
    readonly blockPrototypeAccess?: boolean;
}

/**
 * Default path traversal safety options.
 */
export const DEFAULT_MONITOR_PATH_TRAVERSAL_OPTIONS: Readonly<
    Required<MonitorPathTraversalOptions>
> = {
    allowArrayIndexTokens: false,
    blockPrototypeAccess: true,
};

/**
 * Normalizes traversal options using secure defaults.
 */
export function normalizeMonitorPathTraversalOptions(
    options: MonitorPathTraversalOptions
): Readonly<Required<MonitorPathTraversalOptions>> {
    return {
        ...DEFAULT_MONITOR_PATH_TRAVERSAL_OPTIONS,
        ...options,
    };
}
