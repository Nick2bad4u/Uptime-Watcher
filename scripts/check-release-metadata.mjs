#!/usr/bin/env node

/**
 * Release metadata drift checker.
 *
 * Keeps package, README, SECURITY, changelog, Node/npm version files, and
 * release workflow intent aligned before a tag can be created.
 */
/* eslint-disable jsdoc/require-jsdoc -- Internal CLI helpers are scoped to this script. */

import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT_DIRECTORY = path.resolve(import.meta.dirname, "..");

const SECURITY_DEPENDENCIES = [
    "electron",
    "electron-builder",
    "electron-updater",
    "node-sqlite3-wasm",
    "react",
    "typescript",
    "vite",
    "tailwindcss",
];

async function readText(relativePath) {
    return readFile(path.join(ROOT_DIRECTORY, relativePath), "utf8");
}

async function readJson(relativePath) {
    return JSON.parse(await readText(relativePath));
}

function addError(errors, message) {
    errors.push(message);
}

function getDependencyRange(errors, packageJson, dependencyName) {
    const sections = [
        packageJson.dependencies,
        packageJson.devDependencies,
        packageJson.peerDependencies,
    ];

    for (const section of sections) {
        if (section !== undefined && Object.hasOwn(section, dependencyName)) {
            return section[dependencyName];
        }
    }

    addError(errors, `package.json is missing dependency '${dependencyName}'.`);
    return "";
}

function getDisplayVersion(versionRange) {
    const match = /(?<version>\d+\.\d+\.\d+(?:[+-][\d.A-Za-z-]+)?)/.exec(
        versionRange
    );
    return match?.groups?.version ?? versionRange;
}

function requireIncludes(errors, fileName, content, expected) {
    if (!content.includes(expected)) {
        addError(errors, `${fileName} is missing expected text: ${expected}`);
    }
}

function requirePattern(errors, fileName, content, pattern, description) {
    if (!pattern.test(content)) {
        addError(errors, `${fileName} is missing ${description}.`);
    }
}

function escapeRegExp(value) {
    return value.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);
}

async function main() {
    const errors = [];
    const packageJson = await readJson("package.json");
    const readme = await readText("README.md");
    const contributing = await readText("CONTRIBUTING.md");
    const security = await readText("SECURITY.md");
    const developerQuickStart = await readText(
        "docs/Guides/DEVELOPER_QUICK_START.md"
    );
    const docusaurusReadme = await readText("docs/docusaurus/README.md");
    const environmentSetup = await readText("docs/Guides/ENVIRONMENT_SETUP.md");
    const changelog = await readText("CHANGELOG.md");
    const nodeVersion = (await readText(".node-version")).trim();
    const nvmrcVersion = (await readText(".nvmrc")).trim();
    const builderConfig = await readText("electron-builder.config.ts");
    const electronConstants = await readText("electron/constants.ts");
    const sonarProperties = await readText("sonar-project.properties");
    const buildWorkflow = await readText(".github/workflows/Build.yml");
    const codeqlWorkflow = await readText(".github/workflows/codeql.yml");

    const packageVersion = packageJson.version;
    const packageManager = packageJson.packageManager;
    const npmVersion = packageManager?.startsWith("npm@")
        ? packageManager.slice("npm@".length)
        : "";
    const nodeEngine = packageJson.engines?.node;

    if (nodeVersion !== nvmrcVersion) {
        addError(
            errors,
            `.node-version (${nodeVersion}) and .nvmrc (${nvmrcVersion}) differ.`
        );
    }

    if (typeof packageVersion !== "string" || packageVersion.length === 0) {
        addError(errors, "package.json has no string version.");
    }

    if (npmVersion.length === 0) {
        addError(
            errors,
            "package.json packageManager must be an npm@<version> value."
        );
    }

    if (packageJson.build !== undefined) {
        addError(
            errors,
            "package.json#build must stay absent; electron-builder.config.ts is the packaging source of truth."
        );
    }

    requireIncludes(
        errors,
        "electron-builder.config.ts",
        builderConfig,
        "const config: Configuration"
    );

    for (const [scriptName, scriptValue] of Object.entries(
        packageJson.scripts ?? {}
    )) {
        if (
            typeof scriptValue === "string" &&
            scriptValue.includes("electron-builder") &&
            !scriptValue.includes("--config electron-builder.config.ts")
        ) {
            addError(
                errors,
                `package.json script '${scriptName}' calls electron-builder without --config electron-builder.config.ts.`
            );
        }
    }

    const displayVersions = {
        electron: getDisplayVersion(
            getDependencyRange(errors, packageJson, "electron")
        ),
        react: getDisplayVersion(
            getDependencyRange(errors, packageJson, "react")
        ),
        typescript: getDisplayVersion(
            getDependencyRange(errors, packageJson, "typescript")
        ),
        vite: getDisplayVersion(
            getDependencyRange(errors, packageJson, "vite")
        ),
    };

    requireIncludes(
        errors,
        "README.md",
        readme,
        `version-${packageVersion}-blue.svg`
    );
    requireIncludes(
        errors,
        "electron/constants.ts",
        electronConstants,
        `export const USER_AGENT = "Uptime-Watcher/${packageVersion}";`
    );
    requireIncludes(
        errors,
        "sonar-project.properties",
        sonarProperties,
        `sonar.projectVersion=${packageVersion}`
    );
    requireIncludes(
        errors,
        "README.md",
        readme,
        `Electron-v${displayVersions.electron}-`
    );
    requireIncludes(
        errors,
        "README.md",
        readme,
        `React-v${displayVersions.react}-`
    );
    requireIncludes(
        errors,
        "README.md",
        readme,
        `TypeScript-v${displayVersions.typescript}-`
    );
    requireIncludes(
        errors,
        "README.md",
        readme,
        `React-${displayVersions.react}-`
    );
    requireIncludes(
        errors,
        "README.md",
        readme,
        `TypeScript-${displayVersions.typescript}-`
    );
    requireIncludes(
        errors,
        "README.md",
        readme,
        `Vite-${displayVersions.vite}-`
    );
    requireIncludes(
        errors,
        "README.md",
        readme,
        `Electron-${displayVersions.electron}-`
    );
    requireIncludes(errors, "README.md", readme, `Node.js-${nodeVersion}-`);
    requireIncludes(
        errors,
        "README.md",
        readme,
        `<strong>Node.js</strong> | ${nodeVersion} (recommended; ${nodeEngine} required)`
    );
    requireIncludes(
        errors,
        "README.md",
        readme,
        `<strong>npm</strong>     | ${npmVersion} (from packageManager)`
    );
    requireIncludes(
        errors,
        "README.md",
        readme,
        `<em>Last updated: July 2026 • Version ${packageVersion}</em>`
    );
    requireIncludes(
        errors,
        "CONTRIBUTING.md",
        contributing,
        `**Node.js** ${nodeVersion} (recommended; ${nodeEngine} required)`
    );
    requireIncludes(
        errors,
        "CONTRIBUTING.md",
        contributing,
        `**npm** ${npmVersion} (declared by \`packageManager\`)`
    );
    requireIncludes(
        errors,
        "docs/docusaurus/README.md",
        docusaurusReadme,
        `Node.js-${nodeVersion}-`
    );
    requireIncludes(
        errors,
        "docs/docusaurus/README.md",
        docusaurusReadme,
        `**Node.js**: ${nodeVersion} (recommended; ${nodeEngine} required)`
    );
    requireIncludes(
        errors,
        "docs/docusaurus/README.md",
        docusaurusReadme,
        `**npm**: ${npmVersion} (declared by \`packageManager\`)`
    );
    for (const [fileName, content] of [
        ["docs/Guides/DEVELOPER_QUICK_START.md", developerQuickStart],
        ["docs/Guides/ENVIRONMENT_SETUP.md", environmentSetup],
    ]) {
        requireIncludes(
            errors,
            fileName,
            content,
            `**Node.js**: ${nodeVersion} (recommended; ${nodeEngine} required)`
        );
        requireIncludes(
            errors,
            fileName,
            content,
            `**npm**: ${npmVersion} (declared by \`packageManager\`)`
        );
    }

    for (const dependencyName of SECURITY_DEPENDENCIES) {
        const versionRange = getDependencyRange(
            errors,
            packageJson,
            dependencyName
        );
        requirePattern(
            errors,
            "SECURITY.md",
            security,
            new RegExp(
                String.raw`\| ${escapeRegExp(dependencyName)}\s+\| ${escapeRegExp(
                    versionRange
                )}\s+\|`
            ),
            `SECURITY dependency row for ${dependencyName} ${versionRange}`
        );
    }

    requirePattern(
        errors,
        "CHANGELOG.md",
        changelog,
        new RegExp(String.raw`^## \[${escapeRegExp(packageVersion)}\]`, "m"),
        `a changelog heading for ${packageVersion}`
    );

    requireIncludes(
        errors,
        ".github/workflows/Build.yml",
        buildWorkflow,
        "release_version:"
    );
    requireIncludes(
        errors,
        ".github/workflows/Build.yml",
        buildWorkflow,
        "npm run release:check"
    );
    requireIncludes(
        errors,
        ".github/workflows/Build.yml",
        buildWorkflow,
        "--sbom-format cyclonedx"
    );
    requireIncludes(
        errors,
        ".github/workflows/Build.yml",
        buildWorkflow,
        "stagingPercentage: 100"
    );
    if (buildWorkflow.includes("npm version --no-git-tag-version")) {
        addError(
            errors,
            ".github/workflows/Build.yml must not auto-bump package.json during release."
        );
    }

    if (
        /continue-on-error:\s*true\s*# If this fails, the analysis will still run, but it may not be complete\./u.test(
            codeqlWorkflow
        )
    ) {
        addError(
            errors,
            ".github/workflows/codeql.yml still allows incomplete dependency install/build analysis."
        );
    }

    if (errors.length > 0) {
        console.error("Release metadata check failed:");
        for (const error of errors) {
            console.error(`- ${error}`);
        }
        return false;
    }

    console.log("Release metadata check passed.");
    return true;
}

function isDirectRun() {
    return (
        typeof process.argv[1] === "string" &&
        import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
    );
}

if (isDirectRun()) {
    try {
        process.exitCode = (await main()) ? 0 : 1;
    } catch (error) {
        console.error(
            "Release metadata check failed due to an unexpected error."
        );
        console.error(error);
        process.exitCode = 1;
    }
}

export { isDirectRun, main };

/* eslint-enable jsdoc/require-jsdoc */
