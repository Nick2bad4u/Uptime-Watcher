/* eslint-disable eslint-comments/disable-enable-pair -- This hook has multiple unrelated eslint rules that cannot be properly paired */
/* eslint-disable @typescript-eslint/dot-notation -- Using bracket notation for GitHub API response properties */

import { useEffect, useState } from "react";

interface GitHubStats {
    stargazers_count: number;
    watchers_count: number;
}

interface PackageInfo {
    version: string;
}

interface UseGitHubStatsReturn {
    error: null | string;
    loading: boolean;
    stats: GitHubStats | null;
}

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

export function useGitHubStats(): UseGitHubStatsReturn {
    const [stats, setStats] = useState<GitHubStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);

    // eslint-disable-next-line canonical/prefer-use-mount -- useMount is not available in this codebase
    useEffect(function fetchGitHubStatsEffect(): void {
        const fetchStats = async (): Promise<void> => {
            try {
                // eslint-disable-next-line n/no-unsupported-features/node-builtins -- We use ES2024
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

export function usePackageVersion(): UsePackageVersionReturn {
    const [version, setVersion] = useState<string>("12.5.0");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);

    // eslint-disable-next-line canonical/prefer-use-mount -- useMount is not available in this codebase
    useEffect(function fetchPackageVersionEffect(): void {
        const fetchVersion = async (): Promise<void> => {
            try {
                // Try to fetch package.json from the repository
                // eslint-disable-next-line n/no-unsupported-features/node-builtins -- We use ES2024
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
