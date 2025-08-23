import Heading from "@theme/Heading";
import type { ReactNode } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

interface FeatureItem {
    description: ReactNode;
    icon: string;
    title: string;
}

const Feature = ({ description, icon, title }: FeatureItem): ReactNode => (
        <div className={clsx("col col--4")}>
            <div className="text--center">
                <div className={styles.featureIcon}>{icon}</div>
            </div>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    ),
    FeatureList: FeatureItem[] = [
        {
            description: (
                <>
                    Monitor your websites and services in real-time with
                    customizable check intervals. Get instant notifications when
                    your sites go down or come back online.
                </>
            ),
            icon: "⚡",
            title: "Real-time Monitoring",
        },
        {
            description: (
                <>
                    Support for HTTP/HTTPS monitoring, TCP port checks, and
                    custom monitoring scenarios. Flexible configuration options
                    for different types of services.
                </>
            ),
            icon: "🌐",
            title: "Multiple Monitor Types",
        },
        {
            description: (
                <>
                    Native desktop application built with Electron. Runs on
                    Windows, macOS, and Linux with consistent performance and
                    user experience across all platforms.
                </>
            ),
            icon: "🖥️",
            title: "Cross-Platform Desktop App",
        },
        {
            description: (
                <>
                    Track uptime trends, analyze historical data, and generate
                    detailed reports. Understand your infrastructure performance
                    over time.
                </>
            ),
            icon: "📊",
            title: "Historical Analytics",
        },
        {
            description: (
                <>
                    All monitoring data is stored locally on your device. No
                    cloud dependencies, no data sharing, complete control over
                    your monitoring information.
                </>
            ),
            icon: "🔒",
            title: "Privacy Focused",
        },
        {
            description: (
                <>
                    Fully open source project built with modern technologies.
                    Contribute to the codebase, request features, or customize
                    it for your specific needs.
                </>
            ),
            icon: "🚀",
            title: "Open Source",
        },
    ];

export default function HomepageFeatures(): ReactNode {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props) => (
                        <Feature key={props.title} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
