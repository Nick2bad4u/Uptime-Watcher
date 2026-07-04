import type { ReactNode } from "react";

import Link from "@docusaurus/Link";
import GitHubButton from "react-github-btn";

import { useGitHubStats, usePackageVersion } from "../hooks/useGitHubStats";
import styles from "../pages/index.module.css";

/**
 * Renders the GitHub statistics panel on the documentation home page.
 *
 * @returns A React node displaying star counts and the latest release version,
 *   or a loading indicator while data is being fetched.
 */
export default function GitHubStatsComponent(): ReactNode {
    const { loading: statsLoading, stats } = useGitHubStats();
    const { loading: versionLoading, version } = usePackageVersion();

    if (statsLoading || versionLoading) {
        return (
            <div className={styles.githubStats}>
                <span className={styles.stat}>⭐ Loading...</span>
                <span className={styles.stat}>🔧 Loading...</span>
            </div>
        );
    }

    const starCount = stats?.stargazers_count ?? 1;
    const starText =
        starCount === 1 ? "1 GitHub star" : `${starCount} GitHub stars`;

    return (
        <div className={styles.githubStats}>
            <div className={styles.statGroup}>
                <span className={styles.stat}>⭐ {starText}</span>
                <Link
                    className={styles.stat || ""}
                    href={`https://github.com/Nick2bad4u/Uptime-Watcher/releases/tag/v${version}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                >
                    🔧 v{version}
                </Link>
            </div>
            <div className={styles.starButtonContainer}>
                <GitHubButton
                    aria-label="Star nick2bad4u/uptime-watcher on GitHub"
                    data-color-scheme="no-preference: dark; light: light; dark: dark;"
                    data-icon="octicon-star"
                    data-show-count="true"
                    data-size="large"
                    href="https://github.com/nick2bad4u/uptime-watcher"
                >
                    Star
                </GitHubButton>
            </div>
        </div>
    );
}
