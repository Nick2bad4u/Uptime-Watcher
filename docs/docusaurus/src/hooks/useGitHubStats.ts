import { useEffect, useState } from "react";

/**
 * Shape of the GitHub repository statistics response used by the documentation
 * site.
 */
interface GitHubStats {
    readonly stargazers_count: number;
    readonly watchers_count: number;
}

/**
 * Minimal package.json shape required to read the current version from the
 * GitHub repository.
 */
interface PackageInfo {
    readonly version: string;
}

/**
 * State returned by the {@link useGitHubStats} hook.
 */
interface UseGitHubStatsReturn {
    readonly error: null | string;
    readonly loading: boolean;
    readonly stats: GitHubStats | null;
}

/**
 * State returned by the {@link usePackageVersion} hook.
 */
interface UsePackageVersionReturn {
    readonly error: null | string;
    readonly loading: boolean;
    readonly version: string;
}

const FALLBACK_GITHUB_STATS: GitHubStats = {
    stargazers_count: 1,
    watchers_count: 1,
};
const FALLBACK_PACKAGE_VERSION = "23.8.0";
const GITHUB_REPOSITORY_API_URL =
    "https://api.github.com/repos/Nick2bad4u/Uptime-Watcher";
const PACKAGE_JSON_URL =
    "https://raw.githubusercontent.com/Nick2bad4u/Uptime-Watcher/main/package.json";

function shouldIgnoreFetchResult(signal: AbortSignal): boolean {
    return signal.aborted;
}

function isGitHubStats(data: unknown): data is GitHubStats {
    return (
        typeof data === "object" &&
        data !== null &&
        "stargazers_count" in data &&
        "watchers_count" in data &&
        typeof (data as { stargazers_count?: unknown }).stargazers_count ===
            "number" &&
        typeof (data as { watchers_count?: unknown }).watchers_count ===
            "number"
    );
}

function isPackageInfo(data: unknown): data is PackageInfo {
    return (
        typeof data === "object" &&
        data !== null &&
        "version" in data &&
        typeof (data as { version?: unknown }).version === "string"
    );
}

/**
 * Fetches and exposes GitHub repository statistics for the documentation site.
 *
 * @returns Loading, error, and stats information for the
 *   `Nick2bad4u/Uptime-Watcher` repository.
 */
export function useGitHubStats(): UseGitHubStatsReturn {
    const [stats, setStats] = useState<GitHubStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);

    // eslint-disable-next-line canonical/prefer-use-mount -- useMount is not available in this codebase
    useEffect(function fetchGitHubStatsEffect() {
        const abortController = new AbortController();

        const fetchStats = async (): Promise<void> => {
            try {
                const response = await fetch(GITHUB_REPOSITORY_API_URL, {
                    signal: abortController.signal,
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const jsonData: unknown = await response.json();
                if (!isGitHubStats(jsonData)) {
                    throw new Error("Invalid GitHub stats response format");
                }
                if (shouldIgnoreFetchResult(abortController.signal)) {
                    return;
                }
                setStats(jsonData);
            } catch (caughtError) {
                if (shouldIgnoreFetchResult(abortController.signal)) {
                    return;
                }
                setError(
                    Error.isError(caughtError)
                        ? caughtError.message
                        : "Unknown error"
                );
                // Fallback to static data if API fails
                setStats(FALLBACK_GITHUB_STATS);
            } finally {
                if (!shouldIgnoreFetchResult(abortController.signal)) {
                    setLoading(false);
                }
            }
        };

        void fetchStats();

        return (): void => {
            abortController.abort();
        };
    }, []);

    return { error, loading, stats };
}

/**
 * Fetches and exposes the latest package version from the main branch
 * package.json.
 *
 * @returns Loading, error, and semantic version information for the published
 *   app.
 */
export function usePackageVersion(): UsePackageVersionReturn {
    const [version, setVersion] = useState(FALLBACK_PACKAGE_VERSION);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);

    // eslint-disable-next-line canonical/prefer-use-mount -- useMount is not available in this codebase
    useEffect(function fetchPackageVersionEffect() {
        const abortController = new AbortController();

        const fetchVersion = async (): Promise<void> => {
            try {
                // Try to fetch package.json from the repository

                const response = await fetch(PACKAGE_JSON_URL, {
                    signal: abortController.signal,
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const jsonData: unknown = await response.json();
                if (!isPackageInfo(jsonData)) {
                    throw new Error("Invalid package.json response format");
                }
                if (shouldIgnoreFetchResult(abortController.signal)) {
                    return;
                }
                setVersion(jsonData.version);
            } catch (caughtError) {
                if (shouldIgnoreFetchResult(abortController.signal)) {
                    return;
                }
                setError(
                    Error.isError(caughtError)
                        ? caughtError.message
                        : "Unknown error"
                );
                // Keep fallback version if fetch fails
            } finally {
                if (!shouldIgnoreFetchResult(abortController.signal)) {
                    setLoading(false);
                }
            }
        };

        void fetchVersion();

        return (): void => {
            abortController.abort();
        };
    }, []);

    return { error, loading, version };
}
