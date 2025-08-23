import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: "Uptime Watcher",
    tagline:
        "Cross-platform desktop application for monitoring website uptime and server availability",
    favicon: "../../icons/favicon.ico",

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

    markdown: {
        format: "detect",
        mermaid: true,
        mdx1Compat: {
            comments: true,
            admonitions: true,
            headingIds: true,
        },
        anchors: {
            maintainCase: true,
        },
    },
    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
        //@ts-expect-error
        removeLegacyPostBuildHeadAttributes: true, // Remove legacy head attributes added during post-build
        useCssCascadeLayers: true, // Enable CSS cascade layers for better style management
    },
    experimental_faster: {
        ssgWorkerThreads: true,
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
    onBrokenAnchors: "warn",
    onDuplicateRoutes: "warn",

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
                    editUrl:
                        "https://github.com/Nick2bad4u/Uptime-Watcher/edit/main/docs/docusaurus/",
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
        colorMode: {
            defaultMode: "dark",
            disableSwitch: false,
            respectPrefersColorScheme: true,
        },
        announcementBar: {
            id: "announcement_bar",
            content:
                'Project is still in development! ⭐️ Report any issues to <a target="_blank" rel="noopener noreferrer" href="https://github.com/Nick2bad4u/Uptime-Watcher/issues">the issue tracker</a>',
            backgroundColor: "#000000",
            textColor: "#460e63ff",
            isCloseable: true,
        },

        docs: {
            versionPersistence: "localStorage",
            sidebar: {
                hideable: true,
                autoCollapseCategories: true,
            },
        },

        metadata: [
            {
                name: "keywords",
                content:
                    "uptime monitoring, website monitoring, server monitoring, electron app",
            },
            {
                name: "description",
                content:
                    "Uptime Watcher - Cross-platform desktop application for monitoring website uptime and server availability",
            },
        ],
        navbar: {
            title: "Uptime Watcher",
            hideOnScroll: true,
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
            copyright: `Copyright © ${new Date().getFullYear()} Uptime Watcher. Built with 🦖 Docusaurus. ©️`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
            defaultLanguage: "typescript",
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
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
