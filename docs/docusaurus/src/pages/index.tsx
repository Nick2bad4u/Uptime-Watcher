import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started - 5min ⏱️
          </Link>
          <Link
            className="button button--primary button--lg margin-left--md"
            href="https://github.com/Nick2bad4u/Uptime-Watcher/releases">
            Download Latest Release 📥
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} Documentation`}
      description="Cross-platform desktop application for monitoring website uptime and server availability">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        
        {/* Quick Stats Section */}
        <section className={styles.statsSection}>
          <div className="container">
            <div className="row">
              <div className="col col--3">
                <div className={styles.statCard}>
                  <h3>🚀 Cross-Platform</h3>
                  <p>Windows, macOS, Linux</p>
                </div>
              </div>
              <div className="col col--3">
                <div className={styles.statCard}>
                  <h3>⚡ Real-time</h3>
                  <p>Live monitoring & alerts</p>
                </div>
              </div>
              <div className="col col--3">
                <div className={styles.statCard}>
                  <h3>🔧 Customizable</h3>
                  <p>Flexible configuration</p>
                </div>
              </div>
              <div className="col col--3">
                <div className={styles.statCard}>
                  <h3>📊 Analytics</h3>
                  <p>Detailed reporting</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started Preview */}
        <section className={styles.previewSection}>
          <div className="container">
            <div className="row">
              <div className="col col--6">
                <Heading as="h2">Quick Setup</Heading>
                <ol>
                  <li>Download the latest release for your platform</li>
                  <li>Install and launch Uptime Watcher</li>
                  <li>Add your first website to monitor</li>
                  <li>Configure notification preferences</li>
                  <li>Start monitoring!</li>
                </ol>
                <Link
                  className="button button--outline button--primary"
                  to="/docs/installation">
                  View Installation Guide →
                </Link>
              </div>
              <div className="col col--6">
                <Heading as="h2">Key Features</Heading>
                <ul>
                  <li>🌐 <strong>Multiple Monitor Types:</strong> HTTP, HTTPS, TCP Port monitoring</li>
                  <li>📱 <strong>Desktop Notifications:</strong> Real-time status alerts</li>
                  <li>📈 <strong>Historical Data:</strong> Track uptime trends over time</li>
                  <li>⚙️ <strong>Configurable Intervals:</strong> Custom check frequencies</li>
                  <li>🎯 <strong>Site Management:</strong> Organize multiple sites efficiently</li>
                  <li>🔒 <strong>Secure:</strong> Local data storage, no cloud dependencies</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
