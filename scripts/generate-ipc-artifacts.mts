#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import prettier from "prettier";
import type { JSDoc } from "ts-morph";
import {
    Node,
    Project,
    PropertyAssignment,
    PropertySignature,
    SyntaxKind,
} from "ts-morph";

/**
 * Normalized renderer event metadata derived from the canonical schema.
 *
 * @internal
 */
interface RendererEventDefinition {
    channel: string;
    methodSuffix: string;
    aliasName: string;
    description: string;
}

const rootDir = path.resolve(process.cwd());
const checkMode = process.argv.includes("--check");

const project = new Project({
    tsConfigFilePath: path.resolve(rootDir, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
});

const rendererEventsPath = path.resolve(
    rootDir,
    "shared/ipc/rendererEvents.ts"
);
const ipcTypesPath = path.resolve(rootDir, "shared/types/ipc.ts");

const rendererEventsSource = project.addSourceFileAtPath(rendererEventsPath);
const ipcTypesSource = project.addSourceFileAtPath(ipcTypesPath);

const rendererChannelsInitializer = rendererEventsSource
    .getVariableDeclarationOrThrow("RENDERER_EVENT_CHANNELS")
    .getInitializerOrThrow();

const rendererChannelsDeclaration = Node.isAsExpression(
    rendererChannelsInitializer
)
    ? rendererChannelsInitializer.getExpressionIfKindOrThrow(
          SyntaxKind.ObjectLiteralExpression
      )
    : rendererChannelsInitializer.asKindOrThrow(
          SyntaxKind.ObjectLiteralExpression
      );

const rendererChannelEntries = rendererChannelsDeclaration
    .getProperties()
    .filter((property) => Node.isPropertyAssignment(property))
    .map((property: PropertyAssignment) => {
        const initializer = property.getInitializerIfKindOrThrow(
            SyntaxKind.StringLiteral
        );
        const channel = initializer.getLiteralText();
        const docs = "";

        return {
            channel,
            constantName: property.getName(),
            description: docs,
        };
    });

const payloadInterface = rendererEventsSource.getInterfaceOrThrow(
    "RendererEventPayloadMap"
);

const payloadPropertyMap = new Map<string, { description: string }>();

for (const property of payloadInterface.getProperties()) {
    const propertySignature = property as PropertySignature;
    const nameNode = propertySignature.getNameNode();
    const channelName = Node.isStringLiteral(nameNode)
        ? nameNode.getLiteralText()
        : propertySignature.getName();
    if (!channelName) {
        continue;
    }
    const description = propertySignature
        .getJsDocs()
        .map((doc: JSDoc) => doc.getDescription().trim())
        .filter(Boolean)
        .join("\n");

    payloadPropertyMap.set(channelName, { description });
}

/**
 * Breaks an IPC channel name into PascalCase-friendly segments.
 *
 * @param input - Raw channel identifier such as
 *   `settings:history-limit-updated`.
 *
 * @returns Array of normalized string segments used for method suffix
 *   construction.
 */
function splitSegments(input: string): string[] {
    return input
        .split(/[:_-]/u)
        .filter(Boolean)
        .map((segment) =>
            segment.length === 0
                ? segment
                : segment[0]!.toUpperCase() + segment.slice(1));
}

const prefixExclusions = new Set(["settings"]);

/**
 * Derives a stable method suffix for the generated bridge contract.
 *
 * @param channel - Renderer event channel name.
 *
 * @returns Suffix appended to `on` for bridge listener method names.
 */
function deriveMethodSuffix(channel: string): string {
    const [potentialPrefix, ...rest] = channel.split(":");
    const segments =
        rest.length > 0 && prefixExclusions.has(potentialPrefix)
            ? rest
            : rest.length > 0
              ? [potentialPrefix, ...rest]
              : [potentialPrefix];

    return segments.flatMap((segment) => splitSegments(segment)).join("");
}

/**
 * Builds a TSDoc summary for a generated bridge listener.
 *
 * @param description - Schema-sourced description of the renderer event.
 * @param channel - Renderer channel identifier.
 *
 * @returns Fully formatted multi-line comment block.
 */
function formatDocComment(description: string, channel: string): string {
    const normalizedDescription = description.trim().replaceAll(/\s+/gu, " ");
    const summary =
        normalizedDescription.length > 0
            ? normalizedDescription.endsWith(".")
                ? normalizedDescription
                : `${normalizedDescription}.`
            : `Subscribe to events emitted on the \`${channel}\` channel.`;

    return [
        "/**",
        ` * ${summary}`,
        " *",
        ` * @param callback - Invoked with payloads emitted on the \`${channel}\` channel.`,
        " *",
        " * @returns Cleanup function that removes the registered listener.",
        " */",
    ].join("\n");
}

const rendererEventDefinitions: RendererEventDefinition[] =
    rendererChannelEntries
        .map((entry) => {
            const payloadInfo = payloadPropertyMap.get(entry.channel);
            if (!payloadInfo) {
                throw new Error(
                    `RendererEventPayloadMap does not define payload for channel "${entry.channel}"`
                );
            }

            const description =
                payloadInfo.description.trim() || entry.description.trim();
            const methodSuffix = deriveMethodSuffix(entry.channel);
            const aliasName = `${methodSuffix}Payload`;

            return {
                channel: entry.channel,
                description,
                methodSuffix,
                aliasName,
            } satisfies RendererEventDefinition;
        })
        .filter(
            (definition): definition is RendererEventDefinition =>
                definition !== undefined && definition !== null
        )
        .toSorted((a, b) => a.methodSuffix.localeCompare(b.methodSuffix));

const aliasLines = rendererEventDefinitions.map(
    (event) =>
        `type ${event.aliasName} = RendererEventPayloadMap["${event.channel}"];`
);

const methodLines = rendererEventDefinitions.map((event) => {
    const docComment = formatDocComment(event.description, event.channel);
    const indentedDocComment = docComment
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n");

    return `${indentedDocComment}\n    readonly on${event.methodSuffix}: (\n        callback: (data: ${event.aliasName}) => void\n    ) => () => void;`;
});

const eventsBridgeHeader = `// THIS FILE IS AUTO-GENERATED BY scripts/generate-ipc-artifacts.mts. DO NOT EDIT.\n\n/**\n * Shared type definition for the preload events bridge.\n *\n * @remarks\n * Ensures the Electron preload layer and renderer agree on the shape of the\n * event subscription API exposed through \`window.electronAPI.events\`.\n */\nimport type { RendererEventPayloadMap } from "@shared/ipc/rendererEvents";\n\n`;

const eventsBridgeBody = `${aliasLines.join("\n")}\n\n/**\n * Contract for the preload events bridge exposed to the renderer.\n *\n * @public\n */\nexport interface EventsDomainBridge {\n${methodLines
    .map((methodLine) => `${methodLine}`)
    .join(
        "\n\n"
    )}\n\n    /**\n     * Remove all registered renderer event listeners.\n     */\n    readonly removeAllListeners: () => void;\n}\n`;

const eventsBridgeContent = `${eventsBridgeHeader}${eventsBridgeBody}`;

const invokeInterface = ipcTypesSource.getInterfaceOrThrow(
    "IpcInvokeChannelMap"
);

const invokeChannelRows = invokeInterface.getProperties().map((property) => {
    const invokeNameNode = property.getNameNode();
    const channel = Node.isStringLiteral(invokeNameNode)
        ? invokeNameNode.getLiteralText()
        : property.getName();
    const structureType = property
        .getTypeNodeOrThrow()
        .asKindOrThrow(SyntaxKind.TypeLiteral)
        .getMembers();

    const paramsProperty = structureType.find(
        (member) =>
            Node.isPropertySignature(member) && member.getName() === "params"
    ) as PropertySignature | undefined;
    const resultProperty = structureType.find(
        (member) =>
            Node.isPropertySignature(member) && member.getName() === "result"
    ) as PropertySignature | undefined;

    const paramsType = paramsProperty
        ?.getTypeNodeOrThrow()
        .getText()
        .replace(/^readonly\s+/u, "");

    const resultType = resultProperty?.getTypeNodeOrThrow().getText().trim();

    return {
        channel,
        params: paramsType ?? "[/* no params */]",
        result: resultType ?? "void",
    };
});

const escapeTableCell = (value: string): string =>
    value.replaceAll("|", String.raw`\|`);

const invokeTableLines = [
    "| Channel | Description | Parameters | Result |",
    "| :------ | :---------- | :--------- | :----- |",
    ...invokeChannelRows.map((row) => {
        const description = `Handles \`${row.channel}\` invocations.`;
        return `| \`${row.channel}\` | ${escapeTableCell(
            description
        )} | \`${escapeTableCell(row.params)}\` | \`${escapeTableCell(
            row.result
        )}\` |`;
    }),
];

const rendererTableLines = [
    "| Channel | Description | Payload Type |",
    "| :------ | :---------- | :----------- |",
    ...rendererEventDefinitions.map((event) => {
        const normalizedDescription = event.description
            .trim()
            .replaceAll(/\s+/gu, " ");
        const description =
            normalizedDescription.length > 0
                ? normalizedDescription
                : `Events emitted on the \`${event.channel}\` channel.`;
        return `| \`${event.channel}\` | ${escapeTableCell(
            description
        )} | \`RendererEventPayloadMap["${event.channel}"]\` |`;
    }),
];

const docLines = [
    "<!-- THIS FILE IS AUTO-GENERATED BY scripts/generate-ipc-artifacts.mts. DO NOT EDIT. -->",
    "",
    "# IPC Channel Inventory",
    "",
    "## Invoke Channels",
    "",
    ...invokeTableLines,
    "",
    "## Renderer Event Channels",
    "",
    ...rendererTableLines,
    "",
];

const docContent = `${docLines.join("\n")}\n`;

const eventsBridgePath = path.resolve(rootDir, "shared/types/eventsBridge.ts");
const docPath = path.resolve(
    rootDir,
    "docs/Architecture/generated/IPC_CHANNEL_INVENTORY.md"
);

const normalizeForComparison = (content: string): string =>
    content.replaceAll("\r\n", "\n").trim();

/**
 * Formats generated output using the repository Prettier configuration.
 *
 * @param targetPath - Path used to resolve the appropriate Prettier
 *   parser/config.
 * @param content - Unformatted file contents.
 *
 * @returns The prettified artifact.
 */
async function formatWithPrettier(
    targetPath: string,
    content: string
): Promise<string> {
    const resolvedConfig = (await prettier.resolveConfig(targetPath)) ?? {};
    const parser = targetPath.endsWith(".md") ? "markdown" : "typescript";

    return prettier.format(content, {
        ...resolvedConfig,
        parser,
    });
}

/**
 * Result structure returned by artifact writes or drift checks.
 */
interface WriteOrCheckResult {
    success: boolean;
    path: string;
    message: string;
}

/**
 * Writes a generated artifact to disk or verifies parity in check mode.
 *
 * @param targetPath - Destination file path for the artifact.
 * @param content - Generated file contents prior to formatting.
 *
 * @returns Summary of the write/check outcome.
 */
async function writeOrCheck(
    targetPath: string,
    content: string
): Promise<WriteOrCheckResult> {
    const relativePath = path.relative(rootDir, targetPath);

    try {
        const formattedContent = await formatWithPrettier(targetPath, content);
        const normalizedContent = formattedContent.replaceAll("\r\n", "\n");

        if (checkMode) {
            let existing = "";
            try {
                existing = await readFile(targetPath, "utf8");
            } catch {
                // Missing file counts as drift
            }

            const normalizedExisting = normalizeForComparison(existing);
            const normalizedGenerated =
                normalizeForComparison(normalizedContent);

            if (normalizedExisting !== normalizedGenerated) {
                const existingHash = createHash("sha256")
                    .update(normalizedExisting)
                    .digest("hex");
                const generatedHash = createHash("sha256")
                    .update(normalizedGenerated)
                    .digest("hex");

                const message = `Drift detected in ${relativePath}. Run \`npm run generate:ipc\` to regenerate artifacts. (existingHash=${existingHash} generatedHash=${generatedHash})`;
                console.error(`[ipc-artifacts] ✗ ${message}`);
                return { success: false, path: relativePath, message };
            }

            console.log(
                `[ipc-artifacts] ✓ ${relativePath} is up-to-date (check mode)`
            );
            return {
                success: true,
                path: relativePath,
                message: "No changes needed",
            };
        }

        await mkdir(path.dirname(targetPath), { recursive: true });
        await writeFile(targetPath, formattedContent);
        console.log(`[ipc-artifacts] ✓ Generated ${relativePath}`);
        return {
            success: true,
            path: relativePath,
            message: "Generated successfully",
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        console.error(
            `[ipc-artifacts] ✗ Failed to process ${relativePath}: ${errorMessage}`
        );
        return {
            success: false,
            path: relativePath,
            message: `Error: ${errorMessage}`,
        };
    }
}

/**
 * Entrypoint coordinating artifact generation or drift detection.
 */
async function main(): Promise<void> {
    const mode = checkMode ? "CHECK" : "GENERATE";
    console.log(`[ipc-artifacts] Starting IPC artifacts ${mode} mode...`);
    console.log(
        `[ipc-artifacts] Processing renderer events from ${path.relative(rootDir, rendererEventsPath)}`
    );
    console.log(
        `[ipc-artifacts] Processing invoke channels from ${path.relative(rootDir, ipcTypesPath)}`
    );
    console.log(
        `[ipc-artifacts] Found ${rendererEventDefinitions.length} renderer event channels`
    );
    console.log(
        `[ipc-artifacts] Found ${invokeChannelRows.length} invoke channels`
    );
    console.log("");

    const results: WriteOrCheckResult[] = [];

    const eventsBridgeResult = await writeOrCheck(
        eventsBridgePath,
        eventsBridgeContent
    );
    results.push(eventsBridgeResult);

    const docResult = await writeOrCheck(docPath, docContent);
    results.push(docResult);

    console.log("");

    const allSuccess = results.every((r) => r.success);
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    if (allSuccess) {
        console.log(
            `[ipc-artifacts] ✓ ${mode} completed successfully. ${successCount}/${results.length} artifacts processed.`
        );
    } else {
        console.error(
            `[ipc-artifacts] ✗ ${mode} completed with errors. ${successCount} succeeded, ${failureCount} failed.`
        );
        process.exitCode = 1;
    }
}

try {
    await main();
} catch (error) {
    console.error("[ipc-artifacts] ✗ Fatal error during artifact generation:");
    console.error(error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
        console.error("[ipc-artifacts] Stack trace:", error.stack);
    }
    process.exitCode = 1;
}
