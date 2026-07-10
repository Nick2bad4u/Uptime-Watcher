/* eslint-disable unicorn/filename-case -- electron-builder expects this conventional root config filename. */
import type { Configuration } from "electron-builder";

const isOfficialRelease =
    process.env["UPTIME_WATCHER_OFFICIAL_RELEASE"] === "true";
const windowsPublisherName = process.env["WINDOWS_PUBLISHER_NAME"]?.trim();

if (
    isOfficialRelease &&
    process.platform === "win32" &&
    !windowsPublisherName
) {
    throw new Error("Official Windows releases require WINDOWS_PUBLISHER_NAME");
}

if (
    isOfficialRelease &&
    process.platform === "darwin" &&
    (!process.env["APPLE_API_KEY"] ||
        !process.env["APPLE_API_KEY_ID"] ||
        !process.env["APPLE_API_ISSUER"])
) {
    throw new Error(
        "Official macOS releases require App Store Connect API credentials"
    );
}

/**
 * Electron Builder configuration for the Uptime-Watcher application.
 *
 * @remarks
 * This is a TypeScript mirror of the existing `build` section in
 * `package.json`. It is now the primary source of truth for build
 * configuration.
 *
 * @see {@link https://www.electron.build/configuration}
 * @see {@link https://www.schemastore.org/electron-builder.json}
 */
const config: Configuration = {
    apk: {
        artifactName: `Uptime-Watcher-\${arch}-\${version}.\${ext}`,
    },
    appId: "io.github.uptime-watcher",
    appImage: {
        artifactName: `Uptime-Watcher-appimage-\${arch}-\${version}.\${ext}`,
    },
    artifactName: `Uptime-Watcher-\${platform}-\${arch}-\${version}.\${ext}`,
    asar: true,
    buildDependenciesFromSource: false,
    // Prefer faster packaging in CI; artifact size increase is acceptable.
    compression: "normal",
    copyright: "Copyright © 2025 Nick2bad4u",
    deb: {
        artifactName: `Uptime-Watcher-deb-\${arch}-\${version}.\${ext}`,
    },
    directories: {
        // Keep installer artifacts separate from Vite/Electron build outputs
        // under dist/ to avoid accidentally packaging previous installers
        // back into the app (and to keep file inclusion rules simpler).
        output: "release",
    },
    disableDefaultIgnoredFiles: false,
    disableSanityCheckAsar: false,
    dmg: {
        artifactName: `Uptime-Watcher-dmg-\${arch}-\${version}.\${ext}`,
    },
    downloadAlternateFFmpeg: false,
    executableName: "Uptime-Watcher",
    files: [
        "dist/**/*",
        // Visualizer outputs are build diagnostics and should not ship.
        "!dist/build-stats.html",
        "!dist/bundle-analysis.html",
        // Sourcemaps are useful for debugging but massively inflate installers
        // (the renderer map alone can be ~20MB+). Keep them as separate CI
        // artifacts instead of shipping to end users.
        "!dist/**/*.map",
        // TypeScript incremental build artifacts are never needed at runtime.
        "!dist/**/*.tsbuildinfo",
        // MSW is used for dev/testing only.
        "!dist/mockServiceWorker.js",
        // Let electron-builder resolve and include only production
        // dependencies from package.json. Including `node_modules/**/*`
        // would pull in devDependencies (storybook/playwright/etc.) and
        // massively inflate installer size.
    ],
    flatpak: {
        artifactName: `Uptime-Watcher-flatpak-\${arch}-\${version}.\${ext}`,
    },
    forceCodeSigning: isOfficialRelease,
    framework: "electron",
    freebsd: {
        artifactName: `Uptime-Watcher-freebsd-\${arch}-\${version}.\${ext}`,
    },
    generateUpdatesFilesForAllChannels: false,

    icon: "src/components/icons/icon.ico",
    includePdb: false,
    linux: {
        category: "Utility",
        desktop: {
            entry: {
                Categories: "Utility;",
                Comment: "View and analyze Website Uptime",
                Name: "Uptime Watcher",
            },
        },
        icon: "src/components/icons/icon-256.png",
        maintainer: "Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com>",
        synopsis:
            "A cross-platform Electron app to monitor website uptime status",
        target: [
            "AppImage",
            "deb",
            "rpm",
            "snap",
            "freebsd",
            "pacman",
            "apk",
        ],
    },
    mac: {
        category: "public.app-category.productivity",
        gatekeeperAssess: true,
        hardenedRuntime: true,
        ...(isOfficialRelease && { notarize: true }),
        icon: "src/components/icons/favicon-512x512.icns",
        target: [
            "dmg",
            "zip",
            "pkg",
        ],
        x64ArchFiles:
            "Contents/Resources/app.asar.unpacked/node_modules/lightningcss-darwin-arm64/**",
    },
    msi: {
        artifactName: `Uptime-Watcher-msi-\${arch}-\${version}.\${ext}`,
    },
    nativeRebuilder: "sequential",
    nodeGypRebuild: false,
    nodeVersion: "current",
    npmRebuild: true,
    nsis: {
        allowElevation: true,
        allowToChangeInstallationDirectory: true,
        artifactName: `Uptime-Watcher-nsis-\${arch}-\${version}.\${ext}`,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        oneClick: false,
        runAfterFinish: true,
    },
    nsisWeb: {
        artifactName: `Uptime-Watcher-nsis-web-\${arch}-\${version}.\${ext}`,
    },
    p5p: {
        artifactName: `Uptime-Watcher-p5p-\${arch}-\${version}.\${ext}`,
    },
    pacman: {
        artifactName: `Uptime-Watcher-pacman-\${arch}-\${version}.\${ext}`,
    },
    pkg: {
        artifactName: `Uptime-Watcher-pkg-\${arch}-\${version}.\${ext}`,
    },
    portable: {
        artifactName: `Uptime-Watcher-portable-\${arch}-\${version}.\${ext}`,
    },
    productName: "Uptime-Watcher",
    publish: [
        {
            owner: "Nick2bad4u",
            provider: "github",
            repo: "Uptime-Watcher",
        },
    ],
    removePackageKeywords: true,
    removePackageScripts: true,
    rpm: {
        artifactName: `Uptime-Watcher-rpm-\${arch}-\${version}.\${ext}`,
    },
    snap: {
        artifactName: `Uptime-Watcher-snap-\${arch}-\${version}.\${ext}`,
    },
    squirrelWindows: {
        artifactName: `Uptime-Watcher-squirrel-\${arch}-\${version}.\${ext}`,
    },
    win: {
        icon: "src/components/icons/icon.ico",
        legalTrademarks: "Uptime Watcher",
        ...(windowsPublisherName && {
            publisherName: [windowsPublisherName],
        }),
        requestedExecutionLevel: "asInvoker",
        target: [
            "nsis",
            "nsis-web",
            "portable",
            "squirrel",
            "msi",
        ],
    },
};

export default config;

/* eslint-enable unicorn/filename-case -- Re-enable after the electron-builder root config. */
