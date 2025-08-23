import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    // Set the /<baseUrl>/ pathname under which your site is served
    baseUrl: "/Uptime-Watcher/",
    deploymentBranch: "gh-pages",

    favicon: "../../icons/favicon.ico",

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        experimental_faster: {
            mdxCrossCompilerCache: true,
            rspackBundler: true,
            rspackPersistentCache: true,
            ssgWorkerThreads: true,
        },
        experimental_storage: {
            namespace: true,
            type: "localStorage",
        },
        //@ts-expect-error -- Not known by Schemas Yet
        removeLegacyPostBuildHeadAttributes: true, // Remove legacy head attributes added during post-build
        useCssCascadeLayers: true, // Enable CSS cascade layers for better style management
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },
    markdown: {
        anchors: {
            maintainCase: true,
        },
        format: "detect",
        mdx1Compat: {
            admonitions: true,
            comments: true,
            headingIds: true,
        },
        mermaid: true,
    },

    onBrokenAnchors: "warn",
    onBrokenLinks: "warn",
    onBrokenMarkdownLinks: "warn",
    onDuplicateRoutes: "warn",
    organizationName: "Nick2bad4u",
    // TypeDoc documentation is generated via standalone TypeDoc (npm run docs:typedoc)
    // This uses our custom typedoc.config.json configuration for better docs
    plugins: [
        // [
        //     "docusaurus-plugin-typedoc",
        //     {
        //         sidebar: {
        //             autoConfiguration: false,
        //             pretty: true,
        //             typescript: true,
        //             deprecatedItemClassName: "typedoc-sidebar-item-deprecated",
        //         },
        //         entryPoints: [
        //             "../../src/**/*.{ts,mts,cts,tsx,js,jsx}",
        //             "../../electron/**/*.{ts,mts,cts,tsx,js,jsx}",
        //             "../../shared/**/*.{ts,mts,cts,tsx,js,jsx}"
        //         ],
        //         tsconfig: "tsconfig.typedoc.json",
        //         plugin: ["typedoc-plugin-markdown"],
        //         gitRevision: "main",
        //     },
        // ],
    ],

    presets: [
        [
            "classic",
            {
                blog: false, // Disable blog
                docs: {
                    editUrl:
                        "https://github.com/Nick2bad4u/Uptime-Watcher/edit/main/docs/docusaurus/",
                    exclude: [
                        "**/_*.{js,jsx,ts,tsx,md,mdx}",
                        "**/_*/**",
                        "**/*.test.{js,jsx,ts,tsx}",
                        "**/__tests__/**",
                    ],
                    include: ["**/*.md", "**/*.mdx"],
                    routeBasePath: "docs",
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                    sidebarPath: "./sidebars.ts",
                },
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
    projectName: "Uptime-Watcher",
    tagline:
        "Cross-platform desktop application for monitoring website uptime and server availability",
    themeConfig: {
        announcementBar: {
            backgroundColor: "#000000",
            content:
                'Project is still in development! ⭐️ Report any issues to <a target="_blank" rel="noopener noreferrer" href="https://github.com/Nick2bad4u/Uptime-Watcher/issues">the issue tracker</a>',
            id: "announcement_bar",
            isCloseable: true,
            textColor: "#460e63ff",
        },
        colorMode: {
            defaultMode: "dark",
            disableSwitch: false,
            respectPrefersColorScheme: true,
        },
        docs: {
            sidebar: {
                autoCollapseCategories: true,
                hideable: true,
            },
            versionPersistence: "localStorage",
        },

        footer: {
            copyright: `Copyright © ${new Date().getFullYear()} Uptime Watcher. Built with 🦖 Docusaurus. ©️`,
            links: [
                {
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
                    title: "Documentation",
                },
                {
                    items: [
                        {
                            href: "https://github.com/Nick2bad4u/Uptime-Watcher",
                            label: "GitHub Repository",
                        },
                        {
                            href: "https://github.com/Nick2bad4u/Uptime-Watcher/issues",
                            label: "Issues",
                        },
                        {
                            href: "https://github.com/Nick2bad4u/Uptime-Watcher/releases",
                            label: "Releases",
                        },
                    ],
                    title: "Project",
                },
            ],
            style: "dark",
        },

        image: "img/uptime-watcher-social-card.jpg",
        metadata: [
            {
                content:
                    "uptime monitoring, website monitoring, server monitoring, electron app",
                name: "keywords",
            },
            {
                content:
                    "Uptime Watcher - Cross-platform desktop application for monitoring website uptime and server availability",
                name: "description",
            },
        ],
        navbar: {
            hideOnScroll: true,
            items: [
                {
                    label: "Documentation",
                    position: "left",
                    sidebarId: "unifiedSidebar",
                    type: "docSidebar",
                },
                {
                    href: "https://github.com/Nick2bad4u/Uptime-Watcher",
                    label: "GitHub",
                    position: "right",
                },
                {
                    href: "https://github.com/Nick2bad4u/Uptime-Watcher/issues",
                    label: "Issues",
                    position: "right",
                },
                {
                    href: "https://github.com/Nick2bad4u/Uptime-Watcher/pulls?q=sort%3Aupdated-desc+is%3Apr+is%3Aopen",
                    label: "PRs",
                    position: "right",
                },
                {
                    href: "https://github.com/Nick2bad4u/Uptime-Watcher/actions",
                    label: "CI",
                    position: "right",
                },
                {
                    href: "https://github.com/Nick2bad4u/Uptime-Watcher/releases",
                    label: "Download",
                    position: "right",
                },
            ],
            logo: {
                alt: "Uptime Watcher Logo",
                height: 32,
                src: "img/logo.svg",
                width: 32,
            },
            title: "Uptime Watcher",
        },
        prism: {
            additionalLanguages: [
                "actionscript",
                "atom",
                "bash",
                "css",
                "git",
                "hsts",
                "html",
                "http",
                "javascript",
                "json",
                "json5",
                "jsx",
                "log",
                "markdown",
                "jsdoc",
                "markup",
                "mathml",
                "md",
                "powershell",
                "rss",
                "scss",
                "ssml",
                "svg",
                "tsx",
                "typescript",
                "xml",
                "yaml",
                "yml",
            ],
            darkTheme: prismThemes.dracula,
            defaultLanguage: "typescript",
            theme: prismThemes.github,
        },
    } satisfies Preset.ThemeConfig,

    title: "Uptime Watcher",

    trailingSlash: false,

    // Set the production url of your site here
    url: "https://nick2bad4u.github.io",
};

export default config;
