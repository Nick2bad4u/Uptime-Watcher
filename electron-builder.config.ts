/* eslint-disable unicorn/filename-case, @eslint-community/eslint-comments/disable-enable-pair -- config file is better in this format */
import type { Configuration } from "electron-builder";

/**
 * Electron Builder configuration for the Uptime-Watcher application.
 *
 * @remarks
 * This is a TypeScript mirror of the existing `build` section in
 * `package.json`. It is not wired into the build pipeline yet; electron-builder
 * still reads from `package.json` by default. To use this file instead, invoke
 * electron-builder with `--config electron-builder.config.ts` and keep this
 * file as the single source of truth going forward.
 *
 * @see {@link https://www.electron.build/configuration}
 * @see {@link https://www.schemastore.org/electron-builder.json}
 */
const config: Configuration = {
    apk: {
        artifactName: `Uptime-Watcher-\${arch}-\${version}.\${ext}`,
    },
    buildDependenciesFromSource: false,
    copyright: "Copyright © 2025 Nick2bad4u",
    appId: "io.github.uptime-watcher",
    appImage: {
        artifactName: `Uptime-Watcher-appimage-\${arch}-\${version}.\${ext}`,
    },
    artifactName: `Uptime-Watcher-\${platform}-\${arch}-\${version}.\${ext}`,
    asar: true,
    compression: "normal",
    deb: {
        artifactName: `Uptime-Watcher-deb-\${arch}-\${version}.\${ext}`,
    },
    directories: {
        output: "dist",
    },
    dmg: {
        artifactName: `Uptime-Watcher-dmg-\${arch}-\${version}.\${ext}`,
    },
    files: [
        "dist/**/*",
        "node_modules/**/*",
        "!node_modules/@tailwindcss/oxide-*",
        "!node_modules/@tailwindcss/oxide-*/**",
        "!dist/mac-universal-*",
        "!dist/*.app",
        "!dist/*.dmg",
        "!dist/*.zip",
    ],
    flatpak: {
        artifactName: `Uptime-Watcher-flatpak-\${arch}-\${version}.\${ext}`,
    },
    freebsd: {
        artifactName: `Uptime-Watcher-freebsd-\${arch}-\${version}.\${ext}`,
    },
    icon: "icons/favicon.ico",
    linux: {
        category: "Utility",
        desktop: {
            entry: {
                Categories: "Utility;",
                Comment: "View and analyze Website Uptime",
                Name: "Uptime Watcher",
            },
        },
        icon: "icons/favicon-256x256.png",
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
            "zip",
            "tar.xz",
            "tar.gz",
            "tar.bz2",
        ],
    },
    mac: {
        category: "public.app-category.productivity",
        gatekeeperAssess: true,
        hardenedRuntime: true,
        icon: "icons/favicon-512x512.icns",
        target: [
            "dmg",
            "zip",
            "pkg",
            "tar.xz",
            "tar.gz",
            "tar.bz2",
        ],
        x64ArchFiles:
            "Contents/Resources/app.asar.unpacked/node_modules/lightningcss-darwin-arm64/**",
    },
    msi: {
        artifactName: `Uptime-Watcher-msi-\${arch}-\${version}.\${ext}`,
    },
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
        icon: "icons/favicon-256x256.ico",
        legalTrademarks: "Uptime Watcher",
        requestedExecutionLevel: "asInvoker",
        target: [
            "nsis",
            "nsis-web",
            "zip",
            "7z",
            "portable",
            "squirrel",
            "msi",
            "tar.xz",
            "tar.gz",
            "tar.bz2",
        ],
    },
};

export default config;
