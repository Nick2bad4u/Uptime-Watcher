import { describe, expect, it, vi } from "vitest";

import path from "node:path";
import ts from "typescript";

const { readFileSync, readdirSync } =
    await vi.importActual<typeof import("node:fs")>("node:fs");

const preloadChannels = await vi.importActual<
    typeof import("@shared/types/preload")
>("@shared/types/preload");

const toStringRecord = (map: unknown): Record<string, string> => {
    if (!map || typeof map !== "object") {
        return {};
    }

    const entries = Object.entries(map as Record<string, unknown>);
    const result: Record<string, string> = {};

    for (const [key, value] of entries) {
        if (typeof value === "string") {
            result[key] = value;
        }
    }

    return result;
};

const CHANNEL_MAPS: Record<string, Record<string, string>> = {
    CLOUD_CHANNELS: toStringRecord(preloadChannels.CLOUD_CHANNELS),
    DATA_CHANNELS: toStringRecord(preloadChannels.DATA_CHANNELS),
    DIAGNOSTICS_CHANNELS: toStringRecord(preloadChannels.DIAGNOSTICS_CHANNELS),
    MONITORING_CHANNELS: toStringRecord(preloadChannels.MONITORING_CHANNELS),
    MONITOR_TYPES_CHANNELS: toStringRecord(
        preloadChannels.MONITOR_TYPES_CHANNELS
    ),
    NOTIFICATION_CHANNELS: toStringRecord(
        preloadChannels.NOTIFICATION_CHANNELS
    ),
    SETTINGS_CHANNELS: toStringRecord(preloadChannels.SETTINGS_CHANNELS),
    SITES_CHANNELS: toStringRecord(preloadChannels.SITES_CHANNELS),
    STATE_SYNC_CHANNELS: toStringRecord(preloadChannels.STATE_SYNC_CHANNELS),
    SYSTEM_CHANNELS: toStringRecord(preloadChannels.SYSTEM_CHANNELS),
};

/**
 * Extracts invoke channel identifiers declared in the shared IPC contract map.
 *
 * @returns Unique channel names present on the shared invoke map interface.
 */
const extractChannelNamesFromSharedMap = (): Set<string> => {
    const ipcTypesPath = path.join(process.cwd(), "shared", "types", "ipc.ts");
    const source = readFileSync(ipcTypesPath).toString("utf8");
    if (!source.includes("IpcInvokeChannelMap")) {
        throw new Error(
            `IpcInvokeChannelMap definition not found in source file: ${ipcTypesPath}`
        );
    }
    const sourceFile = ts.createSourceFile(
        ipcTypesPath,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    );

    const channels = new Set<string>();
    let invokeMapDeclaration: ts.InterfaceDeclaration | undefined;

    sourceFile.forEachChild((node) => {
        if (
            ts.isInterfaceDeclaration(node) &&
            node.name.text === "IpcInvokeChannelMap"
        ) {
            invokeMapDeclaration = node;
        }
    });

    if (!invokeMapDeclaration) {
        throw new Error("Failed to locate IpcInvokeChannelMap definition");
    }

    for (const member of invokeMapDeclaration.members) {
        if (
            ts.isPropertySignature(member) &&
            member.name &&
            ts.isStringLiteral(member.name)
        ) {
            channels.add(member.name.text);
        }
    }

    return channels;
};

describe("IPC contract consistency", () => {
    it("ensures every typed invoke channel has a registered handler", () => {
        const sharedChannels = extractChannelNamesFromSharedMap();

        const registeredChannels = extractRegisteredChannelNames();

        const missingHandlers = Array.from(sharedChannels).filter(
            (channel) => !registeredChannels.has(channel)
        );
        const extraneousHandlers = Array.from(registeredChannels).filter(
            (channel) => !sharedChannels.has(channel)
        );

        expect(missingHandlers).toEqual([]);
        expect(extraneousHandlers).toEqual([]);
    });
});

/**
 * Collects invoke channel identifiers registered on the backend IPC service.
 *
 * @returns Unique channel names that have standardized handlers registered.
 */
function extractRegisteredChannelNames(): Set<string> {
    const ipcServicePath = path.join(
        process.cwd(),
        "electron",
        "services",
        "ipc",
        "IpcService.ts"
    );

    const handlersDir = path.join(
        process.cwd(),
        "electron",
        "services",
        "ipc",
        "handlers"
    );

    const handlerFiles = readdirSync(handlersDir)
        .filter((fileName) => fileName.endsWith(".ts"))
        .map((fileName) => path.join(handlersDir, fileName));

    const channels = new Set<string>();

    for (const filePath of [ipcServicePath, ...handlerFiles]) {
        collectChannelsFromFile(filePath, channels);
    }

    return channels;
}

function collectChannelsFromFile(
    filePath: string,
    channels: Set<string>
): void {
    const source = readFileSync(filePath, "utf8");
    const sourceFile = ts.createSourceFile(
        filePath,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    );

    const stringConstants = new Map<string, string>();

    const registerStringConstants = (node: ts.Node): void => {
        if (ts.isVariableStatement(node)) {
            for (const declaration of node.declarationList.declarations) {
                if (
                    ts.isIdentifier(declaration.name) &&
                    declaration.initializer &&
                    (ts.isStringLiteral(declaration.initializer) ||
                        ts.isNoSubstitutionTemplateLiteral(
                            declaration.initializer
                        ))
                ) {
                    stringConstants.set(
                        declaration.name.text,
                        declaration.initializer.text
                    );
                }
            }
        }

        ts.forEachChild(node, registerStringConstants);
    };

    registerStringConstants(sourceFile);

    const resolveChannelName = (
        expression: ts.Expression
    ): string | undefined => {
        if (ts.isStringLiteral(expression)) {
            return expression.text;
        }

        if (ts.isNoSubstitutionTemplateLiteral(expression)) {
            return expression.text;
        }

        if (ts.isPropertyAccessExpression(expression)) {
            const objectExpression = expression.expression;
            const propertyName = expression.name.text;

            if (ts.isIdentifier(objectExpression)) {
                const channelMap = CHANNEL_MAPS[objectExpression.text];
                const resolved = channelMap?.[propertyName];
                if (typeof resolved === "string") {
                    return resolved;
                }
            }
        }

        if (ts.isIdentifier(expression)) {
            const resolved = stringConstants.get(expression.text);
            if (resolved) {
                return resolved;
            }
        }

        return undefined;
    };

    const visit = (node: ts.Node): void => {
        if (ts.isCallExpression(node)) {
            const callee = node.expression;

            if (
                ts.isIdentifier(callee) &&
                callee.text === "registerStandardizedIpcHandler"
            ) {
                const [channelArgument] = node.arguments;
                if (channelArgument) {
                    const channelName = resolveChannelName(channelArgument);
                    if (channelName) {
                        channels.add(channelName);
                    }
                }
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    if (filePath.endsWith("IpcService.ts")) {
        collectInjectedChannels(sourceFile, channels, resolveChannelName);
    }
}

function collectInjectedChannels(
    sourceFile: ts.SourceFile,
    channels: Set<string>,
    resolveChannelName: (expression: ts.Expression) => string | undefined
): void {
    const visit = (node: ts.Node): void => {
        if (ts.isCallExpression(node)) {
            const callee = node.expression;

            if (
                ts.isIdentifier(callee) &&
                (callee.text === "registerNotificationHandlers" ||
                    callee.text === "registerDiagnosticsHandlers")
            ) {
                const [configArg] = node.arguments;
                if (configArg && ts.isObjectLiteralExpression(configArg)) {
                    for (const property of configArg.properties) {
                        if (
                            ts.isPropertyAssignment(property) &&
                            property.name &&
                            ts.isIdentifier(property.name)
                        ) {
                            const propertyName = property.name.text;

                            if (propertyName === "updatePreferencesChannel") {
                                const channelName = resolveChannelName(
                                    property.initializer
                                );
                                channels.add(
                                    channelName ??
                                        "update-notification-preferences"
                                );
                            } else if (
                                propertyName === "verifyChannel" ||
                                propertyName === "reportChannel"
                            ) {
                                const channelName = resolveChannelName(
                                    property.initializer
                                );
                                if (channelName) {
                                    channels.add(channelName);
                                }
                            }
                        }
                    }
                }
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);
}
