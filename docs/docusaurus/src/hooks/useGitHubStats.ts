/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- This hook has multiple unrelated eslint rules that cannot be properly paired */

import { useEffect, useState } from "react";

/**
 * Shape of the GitHub repository statistics response used by the documentation
 * site.
 */
interface GitHubStats {
    stargazers_count: number;
    watchers_count: number;
}

/**
 * Minimal package.json shape required to read the current version from the
 * GitHub repository.
 */
interface PackageInfo {
    version: string;
}

/**
 * State returned by the {@link useGitHubStats} hook.
 */
interface UseGitHubStatsReturn {
    error: null | string;
    loading: boolean;
    stats: GitHubStats | null;
}

/**
 * State returned by the {@link usePackageVersion} hook.
 */
interface UsePackageVersionReturn {
    error: null | string;
    loading: boolean;
    version: string;
}

function isGitHubStats(data: unknown): data is GitHubStats {
    return (
        typeof data === "object" &&
        data !== null &&
        "stargazers_count" in data &&
        "watchers_count" in data &&
        typeof (data as Record<string, unknown>)["stargazers_count"] ===
            "number" &&
        typeof (data as Record<string, unknown>)["watchers_count"] === "number"
    );
}

function isPackageInfo(data: unknown): data is PackageInfo {
    return (
        typeof data === "object" &&
        data !== null &&
        "version" in data &&
        typeof (data as Record<string, unknown>)["version"] === "string"
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
    useEffect(function fetchGitHubStatsEffect(): void {
        const fetchStats = async (): Promise<void> => {
            try {
                const response = await fetch(
                    "https://api.github.com/repos/Nick2bad4u/Uptime-Watcher"
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const jsonData: unknown = await response.json();
                if (!isGitHubStats(jsonData)) {
                    throw new Error("Invalid GitHub stats response format");
                }
                setStats(jsonData);
            } catch (caughtError) {
                setError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : "Unknown error"
                );
                // Fallback to static data if API fails
                setStats({ stargazers_count: 1, watchers_count: 1 });
            } finally {
                setLoading(false);
            }
        };

        void fetchStats();
    }, []);

    return { error, loading, stats };
}

/**
 * Fetches and exposes the latest package version from the main branch
 * package.json.
 *
 * @returns Loading, error, and semantic version information for the published
 *   application.
 */
export function usePackageVersion(): UsePackageVersionReturn {
    const [version, setVersion] = useState<string>("12.5.0");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);

    // eslint-disable-next-line canonical/prefer-use-mount -- useMount is not available in this codebase
    useEffect(function fetchPackageVersionEffect(): void {
        const fetchVersion = async (): Promise<void> => {
            try {
                // Try to fetch package.json from the repository

                const response = await fetch(
                    "https://raw.githubusercontent.com/Nick2bad4u/Uptime-Watcher/main/package.json"
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const jsonData: unknown = await response.json();
                if (!isPackageInfo(jsonData)) {
                    throw new Error("Invalid package.json response format");
                }
                setVersion(jsonData.version);
            } catch (caughtError) {
                setError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : "Unknown error"
                );
                // Keep fallback version if fetch fails
            } finally {
                setLoading(false);
            }
        };

        void fetchVersion();
    }, []);

    return { error, loading, version };
}
