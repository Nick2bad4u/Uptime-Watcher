import { describe, expect, it, vi } from "vitest";

import path from "node:path";
import ts from "typescript";

const { readFileSync } =
    await vi.importActual<typeof import("node:fs")>("node:fs");

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
    const source = readFileSync(ipcServicePath, "utf8");
    const channelRegex =
        /registerStandardizedIpcHandler\s*\(\s*["'](?<channel>[^"']+)["']/gu;
    const channels = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = channelRegex.exec(source)) !== null) {
        const channelName = match.groups?.["channel"];
        if (channelName) {
            channels.add(channelName);
        }
    }
    return channels;
}
