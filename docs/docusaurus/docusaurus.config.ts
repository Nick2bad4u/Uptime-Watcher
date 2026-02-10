// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- We want to disable this rule for the whole file
/* eslint-disable n/no-process-env -- Needed for Github Action builds */
import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

import { fileURLToPath } from "node:url";

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const siteUrl =
    process.env["DOCUSAURUS_SITE_URL"] ?? "https://nick2bad4u.github.io";
const baseUrl = process.env["DOCUSAURUS_BASE_URL"] ?? "/Uptime-Watcher/";
const enableExperimentalFaster =
    process.env["DOCUSAURUS_ENABLE_EXPERIMENTAL"] === "true";

const removeHeadAttrFlagKey = [
    "remove",
    "Le",
    "gacyPostBuildHeadAttribute",
].join("");

const futureConfig = {
    ...(enableExperimentalFaster
        ? {
              experimental_faster: {
                  mdxCrossCompilerCache: true,
                  rspackBundler: true,
                  rspackPersistentCache: true,
                  ssgWorkerThreads: true,
              },
          }
        : {}),
    v4: {
        [removeHeadAttrFlagKey]: true,
        // NOTE: Enabling cascade layers currently breaks our production CSS output
        // (CssMinimizer parsing errors -> large chunks of CSS dropped), which
        // makes many Infima (--ifm-*) variables undefined across the site.
        // Re-enable only after verifying the build output CSS is valid.
        useCssCascadeLayers: false,
    },
} satisfies Config["future"];

const socialCardImage = new URL(
    "img/uptime-watcher-social-card.jpg",
    `${siteUrl}${baseUrl}`
).toString();

const modernEnhancementsClientModule = fileURLToPath(
    new URL("src/js/modernEnhancements.ts", import.meta.url)
);

const pwaThemeColor = "#2E2A33";
const pwaTileColor = "#2E2A33";
const pwaMaskIconColor = "#71B041";

/**
 * Docusaurus site configuration for the Uptime Watcher documentation.
 *
 * @remarks
 * Controls the docs, blog, pages, theming, plugins, and deployment settings
 * used when building the documentation site hosted on GitHub Pages.
 */
const config: Config = {
    // Set the /<baseUrl>/ pathname under which your site is served
    baseUrl,
    baseUrlIssueBanner: true,
    clientModules: [modernEnhancementsClientModule],
    deploymentBranch: "gh-pages",
    favicon: "img/favicon.ico",

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: futureConfig,
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },
    markdown: {
        anchors: {
            maintainCase: true,
        },
        emoji: true,
        format: "detect",
        hooks: {
            onBrokenMarkdownImages: "warn",
            onBrokenMarkdownLinks: "warn",
        },
        mdx1Compat: {
            admonitions: true,
            comments: true,
            headingIds: true,
        },
        mermaid: true,
    },

    noIndex: false,
    onBrokenAnchors: "warn",
    onDuplicateRoutes: "warn",
    organizationName: "Nick2bad4u",
    // TypeDoc documentation is generated via standalone TypeDoc (npm run docs:typedoc)
    // This uses our custom typedoc.config.json configuration for better docs
    plugins: [
        "docusaurus-plugin-image-zoom",
        [
            "@docusaurus/plugin-pwa",
            {
                debug: process.env["DOCUSAURUS_PWA_DEBUG"] === "true",
                offlineModeActivationStrategies: [
                    "appInstalled",
                    "standalone",
                    "queryString",
                ],
                pwaHead: [
                    {
                        href: `${baseUrl}manifest.json`,
                        rel: "manifest",
                        tagName: "link",
                    },
                    {
                        content: pwaThemeColor,
                        name: "theme-color",
                        tagName: "meta",
                    },
                    {
                        content: "yes",
                        name: "apple-mobile-web-app-capable",
                        tagName: "meta",
                    },
                    {
                        content: "default",
                        name: "apple-mobile-web-app-status-bar-style",
                        tagName: "meta",
                    },
                    {
                        href: `${baseUrl}img/icon-192.png`,
                        rel: "apple-touch-icon",
                        tagName: "link",
                    },
                    {
                        color: pwaMaskIconColor,
                        href: `${baseUrl}img/icon-512.svg`,
                        rel: "mask-icon",
                        tagName: "link",
                    },
                    {
                        content: `${baseUrl}img/icon-192.png`,
                        name: "msapplication-TileImage",
                        tagName: "meta",
                    },
                    {
                        content: pwaTileColor,
                        name: "msapplication-TileColor",
                        tagName: "meta",
                    },
                ],
            },
        ],
        [
            "docusaurus-plugin-copy-page-button",
            {
                customStyles: {
                    button: {
                        className: "button button--primary button--sm",
                        style: {
                            borderRadius: "999px",
                            boxShadow: "none",
                            fontWeight: 600,
                            letterSpacing: "0.01em",
                            padding: "0.35rem 0.85rem",
                            textTransform: "none",
                            zIndex: 99_999,
                        },
                    },
                    container: {
                        className: "copy-page-button__container",
                    },
                    dropdown: {
                        style: {
                            backgroundColor:
                                "var(--ifm-background-surface-color)",
                            border: "1px solid var(--ifm-color-emphasis-200)",
                            borderRadius: "0.5rem",
                            boxShadow:
                                "0 10px 30px rgba(15, 23, 42, 0.15), 0 1px 3px rgba(15, 23, 42, 0.08)",
                            minWidth: "13rem",
                            padding: "0.35rem 0",
                        },
                    },
                    dropdownItem: {
                        className: "menu__link",
                        style: {
                            borderRadius: "0.35rem",
                            fontWeight: 500,
                            margin: "0 0.35rem",
                            padding: "0.45rem 0.75rem",
                        },
                    },
                },
            },
        ],
        // [
        //     "@grnet/docusaurus-terminology",
        //     {
        //         // Directory containing all documentation files to process
        //         docsDir: "./docs",
        //         // Path to the glossary file that will be auto-generated
        //         glossaryFilepath: "./docs/glossary.md",
        //         // Directory containing term definition files
        //         termsDir: "./docs/terms",
        //         // Optional: Custom component paths (uncomment if needed)
        //         // glossaryComponentPath: "relative/path/to/your/glossary-component",
        //         // termPreviewComponentPath: "relative/path/to/your/term-preview-component",
        //     },
        // ],
        [
            "docusaurus-plugin-llms",
            {
                // Custom LLM files for specific documentation sections
                customLLMFiles: [],
                description:
                    "Complete reference documentation for Uptime Watcher",
                docsDir: "docs",
                // Content cleaning options
                excludeImports: true,
                generateLLMsFullTxt: true,
                // Options here
                generateLLMsTxt: true,
                // Generate individual markdown files following llmstxt.org specification
                generateMarkdownFiles: true,
                ignoreFiles: ["advanced/*", "private/*"],
                includeBlog: true,
                // Control documentation order
                // includeOrder: [],
                includeUnmatchedLast: true,
                // Path transformation options
                // pathTransformation: {},
                removeDuplicateHeadings: true,
                title: "Uptime Watcher Documentation",
            },
        ],
        // Broken with Docusaurs v3/v4
        // [
        //     "@grnet/docusaurus-terminology",
        //     {
        //         docsDir: "./docs",
        //         glossaryFilepath: "./docs/glossary.md",
        //         termsDir: "./docs/terms",
        //     },
        // ],
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
                blog: {
                    authorsMapPath: "authors.yml", // File located at blog/authors.yml
                    blogDescription: "Updates and posts about Uptime Watcher",
                    blogSidebarCount: 5,
                    blogSidebarTitle: "Recent posts",
                    blogTitle: "Uptime Watcher Blog",
                    editLocalizedFiles: false,
                    editUrl:
                        "https://github.com/Nick2bad4u/Uptime-Watcher/edit/main/docs/docusaurus/blog/",
                    exclude: [
                        "**/_*.{js,jsx,ts,tsx,md,mdx}",
                        "**/_*/**",
                        "**/*.test.{js,jsx,ts,tsx}",
                        "**/__tests__/**",
                    ],
                    feedOptions: {
                        description: "Uptime Watcher updates and changelogs",
                        limit: 20,
                        title: "Uptime Watcher Blog",
                        type: ["rss", "atom"], // Enable rss + atom
                    },
                    include: ["**/*.{md,mdx}"],
                    path: "blog", // Relative to site dir
                    postsPerPage: 10,
                    routeBasePath: "blog", // URL: /Uptime-Watcher/blog/
                    showReadingTime: true,
                    truncateMarker:
                        /<!--\s*truncate\s*-->|\{\/\*\s*truncate\s*\*\/\}/u,
                },
                debug: true,
                docs: {
                    breadcrumbs: true,
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
                    sidebarCollapsed: true,
                    sidebarCollapsible: true,
                    sidebarPath: "./sidebars.ts",
                },
                pages: {
                    editUrl:
                        "https://github.com/Nick2bad4u/Uptime-Watcher/edit/main/docs/docusaurus/src/pages/",
                    exclude: [
                        // Declarations (often generated next to CSS modules)
                        // must never become routable pages.
                        "**/*.d.ts",
                        "**/*.d.tsx",
                        "**/__tests__/**",
                        "**/*.test.{js,jsx,ts,tsx}",
                        "**/*.spec.{js,jsx,ts,tsx}",
                    ],
                    include: ["**/*.{js,jsx,ts,tsx,md,mdx}"],
                    mdxPageComponent: "@theme/MDXPage",
                    path: "src/pages",
                    routeBasePath: "/",
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                },
                sitemap: {
                    changefreq: "weekly",
                    filename: "sitemap.xml",
                    ignorePatterns: ["/tests/**"],
                    lastmod: "datetime",
                    priority: 0.5,
                },
                svgr: {
                    svgrConfig: {
                        dimensions: false, // Remove width/height so CSS controls size
                        expandProps: "start", // Spread props at the start: <svg {...props}>
                        icon: true, // Treat SVGs as icons (scales via viewBox)
                        memo: true, // Wrap component with React.memo
                        native: false, // Produce web React components (not React Native)
                        prettier: true, // Run Prettier on output
                        prettierConfig: "../../.prettierrc",
                        replaceAttrValues: {
                            "#000": "currentColor",
                            "#000000": "currentColor",
                        }, // Inherit color
                        svgo: true, // Enable SVGO optimizations
                        svgoConfig: {
                            plugins: [
                                { active: false, name: "removeViewBox" }, // Keep viewBox for scalability
                            ],
                        },
                        svgProps: { focusable: "false", role: "img" }, // Default SVG props
                        titleProp: true, // Allow passing a title prop for accessibility
                        typescript: true, // Generate TypeScript-friendly output (.tsx)
                    },
                },
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
                            label: "🏗️ Architecture",
                            to: "/docs/documents/Architecture",
                        },
                        {
                            href: "https://nick2bad4u.github.io/Uptime-Watcher/eslint-inspector/",
                            label: "🧪 ESLint Config",
                        },
                        {
                            href: "https://nick2bad4u.github.io/Uptime-Watcher/storybook/",
                            label: "📚 Storybook",                        },
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
        image: socialCardImage,

        liveCodeBlock: {
            /**
             * The position of the live playground, above or under the editor
             * Possible values: "top" | "bottom"
             */
            playgroundPosition: "bottom",
        },

        mermaid: {
            options: {
                configFile: "../../mermaid.config.json",
            },
            theme: { dark: "dark", light: "neutral" },
        },
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
            {
                content: "Uptime Watcher",
                property: "og:site_name",
            },
            {
                content: "website",
                property: "og:type",
            },
            {
                content: socialCardImage,
                property: "og:image",
            },
            {
                content: `${siteUrl}${baseUrl}`,
                property: "og:url",
            },
            {
                content:
                    "Uptime Watcher - Cross-platform desktop application for monitoring website uptime and server availability",
                property: "og:description",
            },
            {
                content: "Uptime Watcher | Cross-platform monitoring dashboard",
                property: "og:title",
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
                    label: "Blog",
                    position: "left",
                    to: "/blog",
                },
                {
                    className: "persistent",
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
                    className: "persistent",
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
        zoom: {
            background: {
                dark: "rgb(50, 50, 50)",
                light: "rgb(255, 255, 255)",
            },
            config: {
                // Options you can specify via https://github.com/francoischalifour/medium-zoom#usage
            },
            selector: ".markdown > img",
        },
    } satisfies Preset.ThemeConfig,
    themes: [
        "@docusaurus/theme-live-codeblock",
        "@docusaurus/theme-mermaid",
        [
            "@easyops-cn/docusaurus-search-local",
            {
                blogDir: "blog",
                blogRouteBasePath: "blog",
                docsDir: "docs",
                docsRouteBasePath: "docs",
                hashed: true,
                indexBlog: true,
                indexDocs: true,
                indexPages: false,
                language: ["en"],
                removeDefaultStopWordFilter: false,
                useAllContextsWithNoSearchContext: false,
            },
        ],
    ],
    title: "Uptime Watcher",

    titleDelimiter: "|",

    trailingSlash: false,

    // Set the production url of your site here
    url: siteUrl,
};

export default config;
