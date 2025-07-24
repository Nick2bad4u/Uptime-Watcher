import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: "Uptime Watcher",
    tagline: "Cross-platform desktop application for monitoring website uptime and server availability",
    favicon: "img/favicon.ico",

    plugins: [
        [
            "docusaurus-plugin-typedoc",
            {
                sidebar: {
                    autoConfiguration: true,
                    pretty: false,
                    typescript: true,
                    deprecatedItemClassName: "typedoc-sidebar-item-deprecated",
                },
                entryPoints: [
                    "../electron/**/*.ts",
                    "../shared/**/*.ts"
                ],
                tsconfig: "../tsconfig.electron.json",
                out: "electron",
                plugin: ["typedoc-plugin-markdown"],
                gitRevision: "main",
            },
        ],
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

    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",

    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },
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
                },
                blog: false, // Disable blog
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        image: "img/uptime-watcher-social-card.jpg",
        metadata: [
            {name: 'keywords', content: 'uptime monitoring, website monitoring, server monitoring, electron app'},
            {name: 'description', content: 'Uptime Watcher - Cross-platform desktop application for monitoring website uptime and server availability'},
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
                    sidebarId: "appSidebar",
                    position: "left",
                    label: "App Docs",
                },
                {
                    type: "docSidebar", 
                    sidebarId: "electronSidebar",
                    position: "left",
                    label: "Electron API",
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
                            label: "Getting Started",
                            to: "/docs/intro",
                        },
                        {
                            label: "User Guide",
                            to: "/docs/user-guide",
                        },
                        {
                            label: "API Reference",
                            to: "/docs/electron",
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
        algolia: {
            // If you have Algolia search setup, configure it here
            // For now, we'll rely on default search
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
