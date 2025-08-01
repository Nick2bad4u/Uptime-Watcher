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
                    pretty: true,
                    typescript: true,
                    deprecatedItemClassName: "typedoc-sidebar-item-deprecated",
                    entryPoints: ["../../src/**/*.*", "../../shared/**/*.*"],
                    tsconfig: "../../tsconfig.json",
                },
                plugin: ["typedoc-plugin-markdown"],
                gitRevision: "main",
            },
        ],
        [
            "docusaurus-plugin-typedoc",
            {
                id: "typedoc-plugin-2",
                sidebar: {
                    autoConfiguration: true,
                    pretty: true,
                    typescript: true,
                    deprecatedItemClassName: "typedoc-sidebar-item-deprecated",
                    entryPoints: ["../../electron/**/*.*", "../../shared/**/*.*"],
                    tsconfig: "../../tsconfig.electron.json",
                },
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
                    sidebarId: "frontEndSidebar",
                    position: "left",
                    label: "React (Frontend)",
                },
                {
                    label: "Electron (Backend)",
                    to: "/docs/electron",
                    position: "left",
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
                            label: "React Reference",
                            to: "/docs/app",
                        },
                        {
                            label: "Electron Reference",
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
    } satisfies Preset.ThemeConfig,
};

export default config;
