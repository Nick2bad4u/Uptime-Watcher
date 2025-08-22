import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: "Uptime Watcher",
    tagline: "Cross-platform desktop application for monitoring website uptime and server availability",
    favicon: "img/favicon.ico",

    // TypeDoc documentation is generated via standalone TypeDoc (npm run docs:typedoc)
    // This uses our custom typedoc.config.json configuration for better docs
    plugins: [
        // Removed docusaurus-plugin-typedoc to avoid conflicts with standalone generation
    ],


    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    // Set the production url of your site here
    url: "https://nick2bad4u.github.io",
    // Set the /<baseUrl>/ pathname under which your site is served
    baseUrl: "/Uptime-Watcher/",
    organizationName: "Nick2bad4u",
    projectName: "Uptime-Watcher",
    deploymentBranch: "gh-pages",
    trailingSlash: false,

    onBrokenLinks: "warn",
    onBrokenMarkdownLinks: "warn",

    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },

    presets: [
        [
            "classic",
            {
                docs: {
                    sidebarPath: "./sidebars.ts",
                    editUrl: "https://github.com/Nick2bad4u/Uptime-Watcher/edit/main/docs/docusaurus/",
                    routeBasePath: "docs",
                    include: ["**/*.md", "**/*.mdx"],
                    exclude: [
                        "**/_*.{js,jsx,ts,tsx,md,mdx}",
                        "**/_*/**",
                        "**/*.test.{js,jsx,ts,tsx}",
                        "**/__tests__/**",
                    ],
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                },
                blog: false, // Disable blog
                pages: {
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                },
                sitemap: { lastmod: "datetime" },
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        image: "img/uptime-watcher-social-card.jpg",
        metadata: [
            { name: "keywords", content: "uptime monitoring, website monitoring, server monitoring, electron app" },
            {
                name: "description",
                content:
                    "Uptime Watcher - Cross-platform desktop application for monitoring website uptime and server availability",
            },
        ],
        navbar: {
            title: "Uptime Watcher",
            logo: {
                alt: "Uptime Watcher Logo",
                src: "img/logo.svg",
                width: 32,
                height: 32,
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "unifiedSidebar",
                    position: "left",
                    label: "Documentation",
                },
                {
                    href: "https://github.com/Nick2bad4u/Uptime-Watcher",
                    label: "GitHub",
                    position: "right",
                },
                {
                    href: "https://github.com/Nick2bad4u/Uptime-Watcher/releases",
                    label: "Download",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Documentation",
                    items: [
                        {
                            label: "Frontend (React)",
                            to: "/docs/src",
                        },
                        {
                            label: "Backend (Electron)",
                            to: "/docs/electron",
                        },
                        {
                            label: "Shared Code",
                            to: "/docs/shared",
                        },
                    ],
                },
                {
                    title: "Project",
                    items: [
                        {
                            label: "GitHub Repository",
                            href: "https://github.com/Nick2bad4u/Uptime-Watcher",
                        },
                        {
                            label: "Issues",
                            href: "https://github.com/Nick2bad4u/Uptime-Watcher/issues",
                        },
                        {
                            label: "Releases",
                            href: "https://github.com/Nick2bad4u/Uptime-Watcher/releases",
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Uptime Watcher. Built with Docusaurus.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
            additionalLanguages: ["typescript", "javascript", "json", "yaml"],
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
