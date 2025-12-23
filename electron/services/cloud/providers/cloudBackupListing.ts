import type { CloudBackupEntry } from "@shared/types/cloud";

import type { CloudObjectEntry } from "./CloudStorageProvider.types";

import { tryParseCloudBackupMetadataFileBuffer } from "./CloudBackupMetadataFile";

/**
 * Lists backups by discovering metadata objects and hydrating them.
 *
 * @remarks
 * Several providers expose the same pattern:
 *
 * 1. List objects
 * 2. Filter for metadata objects
 * 3. Download metadata JSON
 * 4. Map to {@link CloudBackupEntry}
 *
 * This helper centralizes that logic so providers don't drift.
 */
export async function listBackupsFromMetadataObjects(args: {
    readonly downloadObjectBuffer: (key: string) => Promise<Buffer>;
    readonly objects: readonly CloudObjectEntry[];
}): Promise<CloudBackupEntry[]> {
    const metadataObjects = args.objects.filter((entry) =>
        entry.key.endsWith(".metadata.json")
    );

    const entries = await Promise.all(
        metadataObjects.map(
            async (metadataObject): Promise<CloudBackupEntry | null> => {
                try {
                    const metadataBuffer = await args.downloadObjectBuffer(
                        metadataObject.key
                    );
                    return tryParseCloudBackupMetadataFileBuffer(
                        metadataBuffer
                    );
                } catch {
                    return null;
                }
            }
        )
    );

    return entries
        .filter((entry): entry is CloudBackupEntry => entry !== null)
        .toSorted((a, b) => b.metadata.createdAt - a.metadata.createdAt);
}
