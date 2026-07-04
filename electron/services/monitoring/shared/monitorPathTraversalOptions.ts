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

function getOwnBooleanOption(
    options: MonitorPathTraversalOptions,
    key: keyof MonitorPathTraversalOptions,
    fallback: boolean
): boolean {
    const descriptor = Object.getOwnPropertyDescriptor(options, key);
    return descriptor &&
        "value" in descriptor &&
        typeof descriptor.value === "boolean"
        ? descriptor.value
        : fallback;
}

/**
 * Normalizes traversal options using secure defaults.
 */
export function normalizeMonitorPathTraversalOptions(
    options: MonitorPathTraversalOptions
): Readonly<Required<MonitorPathTraversalOptions>> {
    return {
        allowArrayIndexTokens: getOwnBooleanOption(
            options,
            "allowArrayIndexTokens",
            DEFAULT_MONITOR_PATH_TRAVERSAL_OPTIONS.allowArrayIndexTokens
        ),
        blockPrototypeAccess: getOwnBooleanOption(
            options,
            "blockPrototypeAccess",
            DEFAULT_MONITOR_PATH_TRAVERSAL_OPTIONS.blockPrototypeAccess
        ),
    };
}
