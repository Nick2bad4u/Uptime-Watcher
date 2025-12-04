/**
 * Shared environment utilities that work across renderer and main processes.
 *
 * @remarks
 * Every helper in this module is defensive: it never assumes that
 * `globalThis.process` exists or behaves like a Node.js process. Tests often
 * delete or stub the global process object, so all reads are routed through a
 * guarded snapshot accessor.
 */
/**
 * Documented environment variables used throughout the application.
 */
export interface KnownEnvironmentVariables {
    readonly CODECOV_TOKEN?: string;
    readonly NODE_ENV?: "development" | "production" | "test";
    readonly PLAYWRIGHT_COVERAGE?: string;
}

/**
 * Immutable snapshot of the global process object used for environment
 * detection. Tests can provide synthetic structures via the override helpers.
 */
export interface ProcessSnapshot {
    readonly env?: Record<string, string | undefined> | undefined;
    readonly versions?:
        | undefined
        | {
              readonly node?: unknown;
          };
}

interface ProcessSnapshotProvider {
    process?: ProcessSnapshot;
}

type ProcessSnapshotOverride = null | ProcessSnapshot | undefined;

const processSnapshotState: {
    override: ProcessSnapshotOverride;
} = {
    override: undefined,
};

const getProcessSnapshot = (): ProcessSnapshot | undefined => {
    if (processSnapshotState.override !== undefined) {
        return processSnapshotState.override ?? undefined;
    }

    if (typeof globalThis !== "object") {
        return undefined;
    }

    try {
        const candidate = (globalThis as ProcessSnapshotProvider).process;
        return candidate ?? undefined;
    } catch {
        return undefined;
    }
};

const getProcessEnv = (): Record<string, string | undefined> | undefined => {
    const snapshot = getProcessSnapshot();
    if (!snapshot) {
        return undefined;
    }

    try {
        return snapshot.env ?? undefined;
    } catch {
        return undefined;
    }
};

const getProcessVersions = (): ProcessSnapshot["versions"] | undefined => {
    const snapshot = getProcessSnapshot();
    if (!snapshot) {
        return undefined;
    }

    try {
        return snapshot.versions ?? undefined;
    } catch {
        return undefined;
    }
};

const hasProcessSnapshot = (): boolean => getProcessSnapshot() !== undefined;

/**
 * Testing-only setter for the process snapshot. Allows Vitest suites to
 * simulate environments where {@link globalThis.process} is missing or has
 * bespoke values without mutating the real Node.js global and destabilizing the
 * test runner.
 *
 * @remarks
 * Use {@link resetProcessSnapshotOverrideForTesting} after each test to avoid
 * leaking overrides across suites.
 */
export function setProcessSnapshotOverrideForTesting(
    snapshot: null | ProcessSnapshot
): void {
    processSnapshotState.override = snapshot;
}

/**
 * Clears the testing override and resumes reading directly from
 * {@link globalThis.process}.
 */
export function resetProcessSnapshotOverrideForTesting(): void {
    processSnapshotState.override = undefined;
}

/**
 * Reads an environment variable from the safeguarded snapshot.
 */
export function getEnvVar(key: string): string | undefined {
    const env = getProcessEnv();
    if (!env) {
        return undefined;
    }

    try {
        const value = env[key];
        return typeof value === "string" ? value : undefined;
    } catch {
        return undefined;
    }
}

/**
 * Returns a sanitized snapshot of the current process.env state.
 */
export function getEnvSummary(): Record<string, string> {
    const env = getProcessEnv();
    if (!env) {
        return {};
    }

    const summary: Record<string, string> = {};
    for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
            summary[key] = value;
        }
    }

    return summary;
}

/**
 * Returns the explicitly configured environment or "unknown" when missing.
 */
export function getEnvironment(): string {
    if (!hasProcessSnapshot()) {
        return "unknown";
    }

    const rawValue = getEnvVar("NODE_ENV");
    return rawValue ?? "unknown";
}

/**
 * Returns NODE_ENV with a development-friendly fallback.
 */
export function getNodeEnv(): string {
    return getEnvVar("NODE_ENV") ?? "development";
}

/**
 * Detects whether browser globals are present.
 */
export function isBrowserEnvironment(): boolean {
    return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Detects whether Node.js runtime APIs are available.
 */
export function isNodeEnvironment(): boolean {
    const nodeVersion = getProcessVersions()?.node;
    return typeof nodeVersion === "string" && nodeVersion.length > 0;
}

/**
 * Checks if NODE_ENV is exactly "development".
 */
export function isDevelopment(): boolean {
    return hasProcessSnapshot() && getEnvVar("NODE_ENV") === "development";
}

/**
 * Checks if NODE_ENV is exactly "production".
 */
export function isProduction(): boolean {
    return hasProcessSnapshot() && getEnvVar("NODE_ENV") === "production";
}

/**
 * Checks if NODE_ENV is exactly "test".
 */
export function isTest(): boolean {
    return hasProcessSnapshot() && getEnvVar("NODE_ENV") === "test";
}
