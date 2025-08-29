/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable react/require-default-props */

import Heading from "@theme/Heading";
import type { CSSProperties, FC, ReactNode } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

interface FeatureItem {
    description: ReactNode;
    icon: string;
    title: string;
}

interface FeatureProps extends FeatureItem {
    style?: CSSProperties;
}

const Feature: FC<FeatureProps> = ({ description, icon, style, title }) => (
    <div className={clsx("col col--4")} style={style}>
        {/* eslint-disable-next-line tailwind/no-custom-classname */}
        <div className={clsx("text--center", styles["featureCard"])}>
            <div className={styles["featureIcon"]}>{icon}</div>
            <div className="padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    </div>
);

const FeatureList: FeatureItem[] = [
    {
        description: (
            <>
                Not your typical &quot;enterprise monitoring solution&quot;.
                Just add your sites, ips, etc, and get notified on intervals
                from 1 second to 1 month without melting your laptop.
            </>
        ),
        icon: "💀",
        title: "Actually Works",
    },
    {
        description: (
            <>
                HTTP, HTTPS, TCP ports, DNS, etc - monitor whatever needs
                monitoring. No artificial limits, no premium tiers. If it has a
                URL or IP, we can check it.
            </>
        ),
        icon: "🔌",
        title: "Monitor Everything",
    },
    {
        description: (
            <>
                Runs natively on Windows, macOS, and Linux. One codebase, three
                platforms, zero compromises. Built with Electron (yes, we know,
                but it&apos;s actually fast).
            </>
        ),
        icon: "🖥️",
        title: "Cross-Platform",
    },
    {
        description: (
            <>
                SQLite database stores everything locally. View uptime trends,
                response times, outage history. Your data stays on your machine
                where it belongs.
            </>
        ),
        icon: "📈",
        title: "Historical Data",
    },
    {
        description: (
            <>
                Zero cloud dependencies. No accounts, no subscription, no data
                collection. Install once, monitor forever. Your uptime data is
                nobody&apos;s business but yours.
            </>
        ),
        icon: "🔒",
        title: "Privacy First",
    },
    {
        description: (
            <>
                MIT licensed, actually open source. Fork it, modify it, sell it
                (please don&apos;t). Built by developers who got tired of
                overpriced monitoring services.
            </>
        ),
        icon: "🛠️",
        title: "Truly Open Source",
    },
];

export default function HomepageFeatures(): ReactNode {
    return (
        <section className={styles["features"]}>
            <div className="container">
                <div className={styles["featuresHeader"]}>
                    <Heading as="h2" className={styles["featuresTitle"]}>
                        Why it doesn&apos;t suck
                    </Heading>
                    <p className={styles["featuresSubtitle"]}>
                        Most monitoring tools are either too expensive, too
                        complicated, or too cloudy. This one is none of those
                        things.
                    </p>
                </div>
                <div
                    className="row"
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        rowGap: "3rem",
                    }}
                >
                    {FeatureList.map((props, idx) => {
                        const featureProps: FeatureProps = {
                            ...props,
                        };

                        if (idx < 3) {
                            featureProps.style = {
                                marginBottom: "1rem",
                            };
                        }

                        return <Feature key={props.title} {...featureProps} />;
                    })}
                </div>
            </div>
        </section>
    );
}
