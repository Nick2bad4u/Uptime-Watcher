/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- This page contains multiple unrelated eslint rules that cannot be properly paired */
/* eslint-disable tailwind/no-custom-classname -- Using Docusaurus CSS classes, not Tailwind */

/* eslint-disable deprecation/deprecation -- Using older APIs that remain required for compatibility */
/* eslint-disable etc/no-deprecated -- Older code patterns needed for Docusaurus compatibility */
/* eslint-disable sonarjs/deprecation -- SonarJS deprecation warnings are acceptable in documentation context */
/* eslint-disable @typescript-eslint/no-deprecated -- TypeScript deprecated APIs are still required here */

import Heading from "@theme/Heading";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import type { JSX } from "react";
import clsx from "clsx";
import styles from "./index.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import GitHubStatsComponent from "@site/src/components/GitHubStats";

/**
 * Copies code to clipboard with fallback support.
 */
const handleCopyCode = (() => {
    // Module-scoped variable to track the feedback timer for proper cleanup
    let feedbackTimer: null | ReturnType<typeof setTimeout> = null;

    return async (): Promise<void> => {
        const code = `{
  "name": "uptime-watcher",
  "version": "12.5.0",
  "description": "Desktop uptime monitoring",
  "main": "dist/main.js",
  "scripts": {
    "start": "electron .",
    "build": "npm run build:electron-vite",
    "test": "vitest"
  },
  "dependencies": {
    "electron": "^32.1.2",
    "react": "^18.3.1",
    "node-sqlite3-wasm": "^0.8.15",
    "zustand": "^5.0.0"
  },
  "license": "Unlicense"
}`;

        // Try modern clipboard API first (browser environment only)
        if (
            typeof window !== "undefined" &&
            "navigator" in window &&
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Browser API access requires runtime checks
            window.navigator.clipboard
        ) {
            try {
                await window.navigator.clipboard.writeText(code);
                // Simple feedback
                const button = document.activeElement;
                if (button && button instanceof HTMLButtonElement) {
                    const originalText = button.textContent;
                    button.textContent = "Copied!";

                    // Clear any existing feedback timer
                    if (feedbackTimer) {
                        clearTimeout(feedbackTimer);
                    }

                    feedbackTimer = setTimeout(() => {
                        button.textContent = originalText;
                        feedbackTimer = null;
                    }, 1000);
                }
                return;
            } catch {
                // Fall through to the older method
            }
        }

        // Fallback for older browsers or when navigator is not available
        const textArea = document.createElement("textarea");
        textArea.value = code;
        document.body.append(textArea);
        textArea.select();
        try {
            document.execCommand("copy");
        } catch {
            console.warn("Copy to clipboard not supported");
        }
        textArea.remove();
    };
})();

/**
 * Wrapper for handleCopyCode to handle the async function in onClick.
 */
const handleCopyCodeClick = (): void => {
    // eslint-disable-next-line promise/prefer-await-to-then -- Using Promise.then for error handling pattern in this context
    void handleCopyCode().catch((error: unknown) => {
        console.error("Failed to copy code:", error);
    });
};

/**
 * Handles demo button click with feedback message.
 */
const handleDemoButtonClick = (): void => {
    // Show a simple demo message
    // eslint-disable-next-line no-alert -- Alert is acceptable for user feedback in documentation context
    alert(
        "🎯 Demo Feature!\n\nThis is just a UI demonstration. The Add Site button is not functional in the documentation."
    );
};

/**
 * Renders a demo UI window showcasing the Uptime Watcher app interface. This is
 * a static demo - the Add Site button is for display purposes only.
 */
const UIDemo = (): JSX.Element => {
    // Static demo data - no need for state in documentation
    const sites = [
        {
            responseTime: "124ms",
            status: "up",
            uptime: "99.8%",
            url: "example.com",
        },
        {
            responseTime: "89ms",
            status: "up",
            uptime: "100%",
            url: "api.myservice.io",
        },
        {
            responseTime: "timeout",
            status: "down",
            uptime: "87.2%",
            url: "staging.broken.com",
        },
    ];

    return (
        <div className={clsx(styles["appWindow"], styles["scrollReveal"])}>
            <div className={styles["appHeader"]}>
                <div className={styles["appButtons"]}>
                    <span className={styles["appButtonRed"]} />

                    <span className={styles["appButtonYellow"]} />

                    <span className={styles["appButtonGreen"]} />
                </div>

                <span className={styles["appTitle"]}>Uptime Watcher</span>
            </div>

            <div className={styles["appBody"]}>
                <div className={styles["appToolbar"]}>
                    <button
                        type="button"
                        className={styles["addButton"]}
                        onClick={handleDemoButtonClick}
                        title="Demo button - not functional"
                    >
                        + Add Site (Demo)
                    </button>

                    <span className={styles["statusCount"]}>
                        {sites.length} sites monitored
                    </span>
                </div>

                <div className={styles["siteList"]}>
                    {sites.map((site) => (
                        <div key={site.url} className={styles["siteItem"]}>
                            <div className={styles["siteStatus"]}>
                                <span
                                    className={styles["statusDot"]}
                                    data-status={site.status}
                                />

                                <span className={styles["siteUrl"]}>
                                    {site.url}
                                </span>
                            </div>

                            <div className={styles["siteMetrics"]}>
                                <span className={styles["responseTime"]}>
                                    {site.responseTime}
                                </span>

                                <span className={styles["uptime"]}>
                                    {site.uptime}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * Renders the homepage header section, including the main title, subtitle,
 * call-to-action buttons, GitHub stats, and a demo UI window. This component is
 * used as the hero section at the top of the landing page.
 */

const HomepageHeader = (): JSX.Element => (
        <header className={styles["heroSection"]}>
            <div className="container">
                <div className={styles["heroContent"]}>
                    <div className={styles["heroText"]}>
                        <Heading
                            as="h1"
                            className={`${styles["heroTitle"]} gradient-text-animated`}
                        >
                            Keep your sites alive.
                            <br />
                            <span className={styles["accent"]}>
                                No drama, just monitoring.
                            </span>
                        </Heading>

                        <p className={styles["heroSubtitle"]}>
                            A no-nonsense desktop app for developers and
                            sysadmins who need to know when their stuff breaks.
                            Built by someone who&apos;s been there at 3am.
                        </p>

                        <div className={styles["heroCta"]}>
                            <Link
                                className={clsx(
                                    "button",
                                    styles["primaryButton"],
                                    "liquid-button"
                                )}
                                href="https://github.com/Nick2bad4u/Uptime-Watcher/releases"
                            >
                                Download Latest
                            </Link>

                            <Link
                                className={clsx(
                                    "button",
                                    styles["secondaryButton"],
                                    "liquid-button"
                                )}
                                to="/docs"
                            >
                                View Docs
                            </Link>

                            <GitHubStatsComponent />
                        </div>
                    </div>

                    <div className={styles["heroDemo"]}>
                        <UIDemo />
                    </div>
                </div>
            </div>
        </header>
    ),
    /**
     * Renders a section displaying real monitoring stories from users in the
     * field. field. field. This component showcases testimonials about the
     * effectiveness of Uptime Watcher.
     */
    RealTimeStatus = (): JSX.Element => (
        <section className={styles["statusSection"]}>
            <div className="container">
                <Heading as="h2" className={styles["sectionTitle"]}>
                    🚨 Real monitoring stories from the field
                </Heading>

                <div className={styles["statusGrid"]}>
                    <div
                        className={clsx(
                            styles["statusCard"],
                            styles["scrollRevealLeft"]
                        )}
                    >
                        <div className={styles["statusHeader"]}>
                            <span className={styles["statusIndicator"]}>
                                🔴
                            </span>

                            <span className={styles["statusText"]}>
                                Saved my ass at 2am
                            </span>
                        </div>

                        <p className={styles["statusDescription"]}>
                            &quot;Got woken up by notification that payment API
                            was down. Fixed it before any customers noticed.
                            This free tool saved my business.&quot; - DevOps
                            Engineer
                        </p>
                    </div>

                    <div
                        className={clsx(
                            styles["statusCard"],
                            styles["scrollReveal"]
                        )}
                    >
                        <div className={styles["statusHeader"]}>
                            <span className={styles["statusIndicator"]}>
                                🟢
                            </span>

                            <span className={styles["statusText"]}>
                                Finally, monitoring that works
                            </span>
                        </div>

                        <p className={styles["statusDescription"]}>
                            &quot;No cloud dependencies, no monthly fees, no
                            bullshit. Just install and it works. Monitors 15
                            sites without breaking a sweat.&quot; - Solo Dev
                        </p>
                    </div>

                    <div
                        className={clsx(
                            styles["statusCard"],
                            styles["scrollRevealRight"]
                        )}
                    >
                        <div className={styles["statusHeader"]}>
                            <span className={styles["statusIndicator"]}>
                                🟡
                            </span>

                            <span className={styles["statusText"]}>
                                Lightweight beast
                            </span>
                        </div>

                        <p className={styles["statusDescription"]}>
                            &quot;Runs on my old laptop, checks 50+ endpoints,
                            uses less RAM than my Slack app. How is this even
                            possible?&quot; - SysAdmin
                        </p>
                    </div>
                </div>
            </div>
        </section>
    ),
    /**
     * Renders a section highlighting the technology stack and philosophy behind
     * Uptime Watcher. This component showcases the open-source nature, data
     * privacy, and performance focus of the app.
     */
    TechStack = (): JSX.Element => (
        <section className={styles["techSection"]}>
            <div className="container">
                <div className={styles["techContent"]}>
                    <div className={styles["techInfo"]}>
                        <Heading as="h2">
                            Built by developers, for developers
                        </Heading>

                        <p>
                            No marketing BS. This started because existing
                            solutions sucked - either too expensive, too
                            complicated, or required uploading your data to
                            someone else&apos;s cloud.
                        </p>

                        <div className={styles["techFeatures"]}>
                            <div className={styles["techFeature"]}>
                                <strong>🛠️ Actually Open Source</strong>

                                <p>
                                    Real open source, not &quot;open core&quot;.
                                    Fork it, modify it, break it. Your choice.
                                </p>
                            </div>

                            <div className={styles["techFeature"]}>
                                <strong>💾 Your Data Stays Yours</strong>

                                <p>
                                    SQLite database on your machine. No cloud,
                                    no tracking, no data mining your uptime
                                    patterns.
                                </p>
                            </div>

                            <div className={styles["techFeature"]}>
                                <strong>⚡ Stupid Fast</strong>

                                <p>
                                    Electron + React + TypeScript. Modern stack,
                                    but optimized for performance, not just
                                    trends.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={styles["techCode"]}>
                        <div className={styles["codeBlock"]}>
                            <div className={styles["codeHeader"]}>
                                <span>package.json</span>

                                <div className={styles["codeActions"]}>
                                    <button
                                        type="button"
                                        className={styles["copyButton"]}
                                        onClick={handleCopyCodeClick}
                                    >
                                        📋 Copy
                                    </button>

                                    {/* eslint-disable-next-line @docusaurus/no-html-links -- External GitHub link requires standard HTML anchor */}
                                    <a
                                        href="https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/package.json"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles["viewButton"]}
                                    >
                                        🔗 View Full
                                    </a>
                                </div>
                            </div>

                            <pre className={styles["codeContent"]}>
                                {`{
    "name": "uptime-watcher",
    "version": "19.0.0",
    "description": "An Electron app to monitor website uptime status",
    "main": "dist/main.js",
    "scripts": {
        "dev": "vite",
        "electron-dev": "concurrently "npm run dev" "npm run electron -- {args}" --",
        "build": "npm run build:electron-vite",
        "test": "vitest",
        "test:all": "npm run test && npm run test:storybook && npm run test:storybook:runner"
    },
    "dependencies": {
        "electron": "^39.2.3",
        "react": "^19.2.0",
        "node-sqlite3-wasm": "^0.8.51",
        "zustand": "^5.0.0"
    },
    "license": "UNLICENSED"
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
/**
 * Renders the main homepage layout for the Uptime Watcher documentation site.
 * This function composes the hero section, features, real-time status stories,
 * and technology stack sections into a single page.
 *
 * @returns The homepage JSX element.
 */
export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`${siteConfig.title} - No-BS Website Monitoring`}
            description="Open-source desktop app for monitoring website uptime. No cloud, no monthly fees, no drama."
        >
            <HomepageHeader />

            <main>
                <HomepageFeatures />

                <RealTimeStatus />

                <TechStack />
            </main>
        </Layout>
    );
}

/* eslint-enable deprecation/deprecation -- re-enable deprecation warnings after older code section */
/* eslint-enable etc/no-deprecated -- re-enable deprecated feature detection */
/* eslint-enable sonarjs/deprecation -- re-enable SonarJS deprecation analysis */
/* eslint-enable @typescript-eslint/no-deprecated -- re-enable TypeScript deprecation warnings */
