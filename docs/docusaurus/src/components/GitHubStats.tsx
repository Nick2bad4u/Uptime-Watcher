/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- This file contains multiple unrelated eslint rules that cannot be properly paired */

import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import GitHubButton from "react-github-btn";

import styles from "../pages/index.module.css";
import { useGitHubStats, usePackageVersion } from "../hooks/useGitHubStats";

export default function GitHubStatsComponent(): ReactNode {
    const { loading: statsLoading, stats } = useGitHubStats();
    const { loading: versionLoading, version } = usePackageVersion();

    if (statsLoading || versionLoading) {
        return (
            <div className={styles["githubStats"]}>
                <span className={styles["stat"]}>⭐ Loading...</span>
                <span className={styles["stat"]}>🔧 Loading...</span>
            </div>
        );
    }

    const starCount = stats?.stargazers_count ?? 1;
    const starText =
        starCount === 1 ? "1 GitHub star" : `${starCount} GitHub stars`;

    return (
        <div className={styles["githubStats"]}>
            <div className={styles["statGroup"]}>
                <span className={styles["stat"]}>⭐ {starText}</span>
                <Link
                    href={`https://github.com/Nick2bad4u/Uptime-Watcher/releases/tag/v${version}`}
                    className={styles["stat"] || ""}
                    style={{ color: "inherit", textDecoration: "none" }}
                >
                    🔧 v{version}
                </Link>
            </div>
            <div className={styles["starButtonContainer"]}>
                <GitHubButton
                    href="https://github.com/nick2bad4u/uptime-watcher"
                    data-color-scheme="no-preference: dark; light: light; dark: dark;"
                    data-icon="octicon-star"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Star nick2bad4u/uptime-watcher on GitHub"
                >
                    Star
                </GitHubButton>
            </div>
        </div>
    );
}
