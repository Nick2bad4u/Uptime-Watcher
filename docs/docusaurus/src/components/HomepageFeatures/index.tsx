import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Real-time Monitoring',
    icon: '⚡',
    description: (
      <>
        Monitor your websites and services in real-time with customizable check intervals.
        Get instant notifications when your sites go down or come back online.
      </>
    ),
  },
  {
    title: 'Multiple Monitor Types',
    icon: '🌐',
    description: (
      <>
        Support for HTTP/HTTPS monitoring, TCP port checks, and custom monitoring scenarios.
        Flexible configuration options for different types of services.
      </>
    ),
  },
  {
    title: 'Cross-Platform Desktop App',
    icon: '🖥️',
    description: (
      <>
        Native desktop application built with Electron. Runs on Windows, macOS, and Linux
        with consistent performance and user experience across all platforms.
      </>
    ),
  },
  {
    title: 'Historical Analytics',
    icon: '📊',
    description: (
      <>
        Track uptime trends, analyze historical data, and generate detailed reports.
        Understand your infrastructure performance over time.
      </>
    ),
  },
  {
    title: 'Privacy Focused',
    icon: '🔒',
    description: (
      <>
        All monitoring data is stored locally on your device. No cloud dependencies,
        no data sharing, complete control over your monitoring information.
      </>
    ),
  },
  {
    title: 'Open Source',
    icon: '🚀',
    description: (
      <>
        Fully open source project built with modern technologies. Contribute to the
        codebase, request features, or customize it for your specific needs.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureIcon}>{icon}</div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

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
