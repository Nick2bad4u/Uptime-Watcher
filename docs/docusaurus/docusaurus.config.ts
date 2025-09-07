import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    // Set the /<baseUrl>/ pathname under which your site is served
    baseUrl: "/Uptime-Watcher/",
    clientModules: [require.resolve("./src/js/modernEnhancements.ts")],

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
        // experimental_storage: {
        //     namespace: true,
        //     type: "localStorage",
        // },
        v4: {
            removeLegacyPostBuildHeadAttribute: true,
            useCssCascadeLayers: true,
        },
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
            backgroundColor: "#2E2A33",
            content:
                'Project is still in development! ⭐️ Report any issues to <a target="_blank" rel="noopener noreferrer" href="https://github.com/Nick2bad4u/Uptime-Watcher/issues">the issue tracker</a>',
            id: "announcement_bar",
            isCloseable: true,
            textColor: "#71B041",
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
            copyright: `© ${new Date().getFullYear()} Nick2bad4u. 💻 Website Built and Powered by 🦖 Docusaurus.`,
            links: [
                {
                    items: [
                        {
                            label: "📖 Getting Started",
                            to: "/docs",
                        },
                        {
                            label: "🧩 Frontend API",
                            to: "docs/category/-frontend-react",
                        },
                        {
                            label: "⚙️ Backend API",
                            to: "docs/category/%EF%B8%8F-backend-electron",
                        },
                        {
                            label: "🔗 Shared Code",
                            to: "docs/category/-shared-code",
                        },
                    ],
                    title: "📚 Documentation",
                },
                {
                    items: [
                        {
                            label: "🛠️ Development Guide",
                            to: "docs/category/-guides--package-docs",
                        },
                        {
                            label: "🏗️ Architecture",
                            to: "/docs/documents/Architecture",
                        },
                        {
                            label: "🧪 Advanced Internals",
                            to: "/docs/category/-advanced-internals",
                        },
                        {
                            label: "📝 TSDoc Standards",
                            to: "/docs/category/-tsdoc-documentation",
                        },
                    ],
                    title: "🧠 Deep Dive",
                },
                {
                    items: [
                        {
                            href: "https://github.com/Nick2bad4u/Uptime-Watcher/releases",
                            label: "📦 Download Latest",
                        },
                        {
                            href: "https://github.com/Nick2bad4u/Uptime-Watcher",
                            label: "💻 Source Code",
                        },
                        {
                            href: "https://github.com/Nick2bad4u/Uptime-Watcher/issues",
                            label: "🐛 Report Issues",
                        },
                        {
                            href: "https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/LICENSE",
                            label: "⚖️ UnLicense",
                        },
                    ],
                    title: "🚀 Get Involved",
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
                    href: "/Uptime-Watcher/eslint-inspector/",
                    label: "ESLint Inspector",
                    position: "left",
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
                "css",
                "git",
                "powershell",
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
