#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import path from "node:path";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const docusaurusRoot = path.join(repositoryRoot, "docs", "docusaurus");

const typedocConfigFiles = [
    path.join(docusaurusRoot, "typedoc.config.json"),
    path.join(docusaurusRoot, "typedoc.local.config.json"),
];

/**
 * @param {string} candidate Path to verify.
 * @returns {Promise<boolean>} Resolves to true when the path exists.
 */
const pathExists = async (candidate) => {
    try {
        await access(candidate);
        return true;
    } catch {
        return false;
    }
};

/**
 * @returns {Promise<Set<string>>} Normalized TypeDoc output directories.
 */
const loadTypedocOutputPaths = async () => {
    const outputs = new Set();

    for (const configPath of typedocConfigFiles) {
        if (!(await pathExists(configPath))) {
            continue;
        }

        let parsedConfig;
        try {
            parsedConfig = JSON.parse(await readFile(configPath, "utf8"));
        } catch {
            continue;
        }

        if (typeof parsedConfig !== "object" || parsedConfig === null) {
            continue;
        }

        const candidate = parsedConfig.out;
        if (typeof candidate !== "string") {
            continue;
        }

        const trimmed = candidate.trim();
        if (trimmed.length === 0) {
            continue;
        }

        const resolvedPath = path.isAbsolute(trimmed)
            ? trimmed
            : path.resolve(path.dirname(configPath), trimmed);

        outputs.add(path.normalize(resolvedPath));
    }

    return outputs;
};

/**
 * @param {Map<string, string>} targets Paths mapped to logging reasons.
 * @returns {Promise<Array<{ targetPath: string; reason: string }>>}
 */
const removeGeneratedTargets = async (targets) => {
    const removed = [];

    for (const [targetPath, reason] of targets) {
        if (await pathExists(targetPath)) {
            await rm(targetPath, { recursive: true, force: true });
            removed.push({ targetPath, reason });
        }
    }

    return removed;
};

/**
 * @param {Set<string>} typedocOutputs Normalized TypeDoc output directories.
 */
const recreatePlaceholders = async (typedocOutputs) => {
    const typedocRoot = Array.from(typedocOutputs).find((outputPath) =>
        outputPath.startsWith(docusaurusRoot)
    );

    if (!typedocRoot) {
        return;
    }

    await mkdir(typedocRoot, { recursive: true });

    const termsDirectory = path.join(typedocRoot, "terms");
    await mkdir(termsDirectory, { recursive: true });
    await writeFile(path.join(termsDirectory, ".gitkeep"), "");

    const glossaryPath = path.join(typedocRoot, "glossary.md");
    const glossaryContent = `---\nid: glossary\nsidebar_position: 999\nslug: /glossary\ntitle: Glossary\n---\n\nThis glossary is automatically regenerated. Add new term definitions under docs/terms/ and rebuild the documentation site to update this page.\n\n> ℹ️ Keep the content above intact—any additional notes can live below this line.\n`;

    await writeFile(glossaryPath, glossaryContent);
};

const main = async () => {
    const typedocOutputs = await loadTypedocOutputPaths();

    const removalTargets = new Map();
    removalTargets.set(
        path.join(docusaurusRoot, "build"),
        "Removed Docusaurus build output"
    );
    removalTargets.set(
        path.join(docusaurusRoot, ".docusaurus"),
        "Removed Docusaurus cache directory"
    );

    for (const outputPath of typedocOutputs) {
        removalTargets.set(
            outputPath,
            `Removed TypeDoc generated documentation at ${outputPath}`
        );
    }

    const removed = await removeGeneratedTargets(removalTargets);

    if (removed.length === 0) {
        console.log("No generated documentation artifacts were found to remove.");
    } else {
        removed.forEach((entry) => {
            console.log(entry.reason);
        });
    }

    if (typedocOutputs.size > 0) {
        await recreatePlaceholders(typedocOutputs);
    }

    console.log("Generated documentation directories are now clean.");
};

await main().catch((error) => {
    console.error("Failed to clean generated documentation:", error);
    process.exitCode = 1;
});
