import type { JSX, MouseEvent } from "react";

import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import GitHubStatsComponent from "@site/src/components/GitHubStats";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import clsx from "clsx";

import styles from "./index.module.css";

const buttonFeedbackTimers = new WeakMap<
    HTMLButtonElement,
    ReturnType<typeof setTimeout>
>();

const PACKAGE_JSON_EXAMPLE = `{
  "name": "uptime-watcher",
  "version": "23.8.0",
  "description": "An Electron app to monitor website uptime status",
  "main": "dist/main.js",
  "scripts": {
    "dev": "node scripts/run-node-cli.mjs NODE_OPTIONS=--max_old_space_size=8192 -- vite",
    "electron-dev": "concurrently \\"npm run dev\\" \\"npm run electron -- {args}\\" --",
    "build": "npm run build:electron-vite",
    "test": "npm-run-all --sequential --print-name test:frontend test:shared test:electron",
    "test:all": "npm run test && npm run test:storybook && npm run test:playwright"
  },
  "dependencies": {
    "electron": "^41.5.0",
    "react": "^19.2.5",
    "node-sqlite3-wasm": "^0.8.56",
    "zustand": "^5.0.12"
  },
  "license": "UNLICENSED"
}`;

/**
 * Shows temporary button text and restores the original label afterward.
 *
 * @param button - Button element receiving feedback
 * @param temporaryText - Short-lived feedback text
 * @param durationMs - Duration before restoring the original text
 */
function showTemporaryButtonText(
    button: HTMLButtonElement,
    temporaryText: string,
    durationMs = 1000
): void {
    const originalText = button.textContent;
    const existingTimer = buttonFeedbackTimers.get(button);
    if (existingTimer) {
        clearTimeout(existingTimer);
    }

    button.textContent = temporaryText;
    const timer = setTimeout(() => {
        button.textContent = originalText;
        buttonFeedbackTimers.delete(button);
    }, durationMs);

    buttonFeedbackTimers.set(button, timer);
}

/**
 * Returns the active button when button-scoped feedback is available.
 *
 * @returns Active button element, or undefined when focus is elsewhere
 */
function getActiveButton(): HTMLButtonElement | undefined {
    const { activeElement } = document;
    return activeElement instanceof HTMLButtonElement
        ? activeElement
        : undefined;
}

/**
 * Copies code to clipboard with fallback support.
 */
const handleCopyCode = async (): Promise<void> => {
    // Try modern clipboard API first (browser environment only)
    if (
        typeof window !== "undefined" &&
        "navigator" in globalThis &&
        "clipboard" in globalThis.navigator
    ) {
        try {
            await globalThis.navigator.clipboard.writeText(
                PACKAGE_JSON_EXAMPLE
            );
            const button = getActiveButton();
            if (button) {
                showTemporaryButtonText(button, "Copied!");
            }
            return;
        } catch {
            // Fall through to the older method
        }
    }

    // Fallback for older browsers or when navigator is not available
    const textArea = document.createElement("textarea");
    textArea.value = PACKAGE_JSON_EXAMPLE;
    document.body.append(textArea);
    textArea.select();
    try {
        const copySucceeded = document.execCommand("copy");
        const button = getActiveButton();
        if (button) {
            showTemporaryButtonText(
                button,
                copySucceeded ? "Copied!" : "Unavailable"
            );
        }
    } catch {
        const button = getActiveButton();
        if (button) {
            showTemporaryButtonText(button, "Unavailable");
        }
    } finally {
        textArea.remove();
    }
};

/**
 * Copies the sample package code and absorbs unexpected browser errors.
 */
async function copyCodeAndReport(): Promise<void> {
    try {
        await handleCopyCode();
    } catch {
        const button = getActiveButton();
        if (button) {
            showTemporaryButtonText(button, "Unavailable");
        }
    }
}

/**
 * Wrapper for handleCopyCode to handle the async function in onClick.
 */
const handleCopyCodeClick = (): void => {
    void copyCodeAndReport();
};

/**
 * Handles demo button click with feedback message.
 *
 * @param event - Demo button click event
 */
const handleDemoButtonClick = (event: MouseEvent<HTMLButtonElement>): void => {
    showTemporaryButtonText(event.currentTarget, "Demo only");
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
        <div className={clsx(styles.appWindow, styles.scrollReveal)}>
            <div className={styles.appHeader}>
                <div className={styles.appButtons}>
                    <span className={styles.appButtonRed} />

                    <span className={styles.appButtonYellow} />

                    <span className={styles.appButtonGreen} />
                </div>

                <span className={styles.appTitle}>Uptime Watcher</span>
            </div>

            <div className={styles.appBody}>
                <div className={styles.appToolbar}>
                    <button
                        className={styles.addButton}
                        onClick={handleDemoButtonClick}
                        title="Demo button - not functional"
                        type="button"
                    >
                        + Add Site (Demo)
                    </button>

                    <span className={styles.statusCount}>
                        {sites.length} sites monitored
                    </span>
                </div>

                <div className={styles.siteList}>
                    {sites.map((site) => (
                        <div className={styles.siteItem} key={site.url}>
                            <div className={styles.siteStatus}>
                                <span
                                    className={styles.statusDot}
                                    data-status={site.status}
                                />

                                <span className={styles.siteUrl}>
                                    {site.url}
                                </span>
                            </div>

                            <div className={styles.siteMetrics}>
                                <span className={styles.responseTime}>
                                    {site.responseTime}
                                </span>

                                <span className={styles.uptime}>
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
        <header className={styles.heroSection}>
            <div className="container">
                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <Heading
                            as="h1"
                            className={`${styles.heroTitle} gradient-text-animated`}
                        >
                            Keep your sites alive.
                            <br />
                            <span className={styles.accent}>
                                No drama, just monitoring.
                            </span>
                        </Heading>

                        <p className={styles.heroSubtitle}>
                            A no-nonsense desktop app for developers and
                            sysadmins who need to know when their stuff breaks.
                            Built by someone who&apos;s been there at 3am.
                        </p>

                        <div className={styles.heroCta}>
                            <Link
                                className={clsx(
                                    "button",
                                    styles.primaryButton,
                                    "liquid-button"
                                )}
                                href="https://github.com/Nick2bad4u/Uptime-Watcher/releases"
                            >
                                Download Latest
                            </Link>

                            <Link
                                className={clsx(
                                    "button",
                                    styles.secondaryButton,
                                    "liquid-button"
                                )}
                                to="/docs"
                            >
                                View Docs
                            </Link>

                            <GitHubStatsComponent />
                        </div>
                    </div>

                    <div className={styles.heroDemo}>
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
        <section className={styles.statusSection}>
            <div className="container">
                <Heading as="h2" className={styles.sectionTitle}>
                    🚨 Real monitoring stories from the field
                </Heading>

                <div className={styles.statusGrid}>
                    <div
                        className={clsx(
                            styles.statusCard,
                            styles.scrollRevealLeft
                        )}
                    >
                        <div className={styles.statusHeader}>
                            <span className={styles.statusIndicator}>🔴</span>

                            <span className={styles.statusText}>
                                Saved my ass at 2am
                            </span>
                        </div>

                        <p className={styles.statusDescription}>
                            &quot;Got woken up by notification that payment API
                            was down. Fixed it before any customers noticed.
                            This free tool saved my business.&quot; - DevOps
                            Engineer
                        </p>
                    </div>

                    <div
                        className={clsx(styles.statusCard, styles.scrollReveal)}
                    >
                        <div className={styles.statusHeader}>
                            <span className={styles.statusIndicator}>🟢</span>

                            <span className={styles.statusText}>
                                Finally, monitoring that works
                            </span>
                        </div>

                        <p className={styles.statusDescription}>
                            &quot;No cloud dependencies, no monthly fees, no
                            bullshit. Just install and it works. Monitors 15
                            sites without breaking a sweat.&quot; - Solo Dev
                        </p>
                    </div>

                    <div
                        className={clsx(
                            styles.statusCard,
                            styles.scrollRevealRight
                        )}
                    >
                        <div className={styles.statusHeader}>
                            <span className={styles.statusIndicator}>🟡</span>

                            <span className={styles.statusText}>
                                Lightweight beast
                            </span>
                        </div>

                        <p className={styles.statusDescription}>
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
        <section className={styles.techSection}>
            <div className="container">
                <div className={styles.techContent}>
                    <div className={styles.techInfo}>
                        <Heading as="h2">
                            Built by developers, for developers
                        </Heading>

                        <p>
                            No marketing BS. This started because existing
                            solutions sucked - either too expensive, too
                            complicated, or required uploading your data to
                            someone else&apos;s cloud.
                        </p>

                        <div className={styles.techFeatures}>
                            <div className={styles.techFeature}>
                                <strong>🛠️ Actually Open Source</strong>

                                <p>
                                    Real open source, not &quot;open core&quot;.
                                    Fork it, modify it, break it. Your choice.
                                </p>
                            </div>

                            <div className={styles.techFeature}>
                                <strong>💾 Your Data Stays Yours</strong>

                                <p>
                                    SQLite database on your machine. No cloud,
                                    no tracking, no data mining your uptime
                                    patterns.
                                </p>
                            </div>

                            <div className={styles.techFeature}>
                                <strong>⚡ Stupid Fast</strong>

                                <p>
                                    Electron + React + TypeScript. Modern stack,
                                    but optimized for performance, not just
                                    trends.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.techCode}>
                        <div className={styles.codeBlock}>
                            <div className={styles.codeHeader}>
                                <span>package.json</span>

                                <div className={styles.codeActions}>
                                    <button
                                        className={styles.copyButton}
                                        onClick={handleCopyCodeClick}
                                        type="button"
                                    >
                                        📋 Copy
                                    </button>

                                    <Link
                                        className={styles.viewButton}
                                        href="https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/package.json"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        🔗 View Full
                                    </Link>
                                </div>
                            </div>

                            <pre className={styles.codeContent}>
                                {PACKAGE_JSON_EXAMPLE}
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
            description="Open-source desktop app for monitoring website uptime. No cloud, no monthly fees, no drama."
            title={`${siteConfig.title} - No-BS Website Monitoring`}
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
