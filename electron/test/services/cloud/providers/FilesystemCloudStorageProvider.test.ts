import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";

import { CloudProviderOperationError } from "@electron/services/cloud/providers/cloudProviderErrors";
import { FilesystemCloudStorageProvider } from "@electron/services/cloud/providers/FilesystemCloudStorageProvider";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe(FilesystemCloudStorageProvider, () => {
    const RESERVED_UPLOAD_ARTIFACT_KEY =
        "sync/state.json.tmp-12345678-1234-1234-1234-123456789abc";

    let baseDirectory: string;
    let provider: FilesystemCloudStorageProvider;

    const getAppRoot = (): string => path.join(baseDirectory, "uptime-watcher");

    beforeEach(async () => {
        baseDirectory = await mkdtemp(
            path.join(tmpdir(), "uptime-watcher-fs-provider-")
        );
        provider = new FilesystemCloudStorageProvider({ baseDirectory });
    });

    afterEach(async () => {
        await rm(baseDirectory, { force: true, recursive: true });
    });

    it("round-trips objects inside the provider root", async () => {
        const entry = await provider.uploadObject({
            buffer: Buffer.from("payload", "utf8"),
            key: "sync/state.json",
        });

        expect(entry).toMatchObject({
            key: "sync/state.json",
            sizeBytes: 7,
        });

        await expect(
            provider.downloadObject("sync/state.json")
        ).resolves.toEqual(Buffer.from("payload", "utf8"));
    });

    it("rejects traversal and Windows drive-token keys before filesystem access", async () => {
        await expect(
            provider.uploadObject({
                buffer: Buffer.from("payload", "utf8"),
                key: "../outside.json",
            })
        ).rejects.toThrow(/traversal/iu);

        await expect(
            provider.downloadObject("C:/outside.json")
        ).rejects.toThrow(/drive tokens/iu);
    });

    it("rejects reserved internal upload artifact keys", async () => {
        await expect(
            provider.uploadObject({
                buffer: Buffer.from("payload", "utf8"),
                key: RESERVED_UPLOAD_ARTIFACT_KEY,
            })
        ).rejects.toThrow(/reserved filesystem upload artifact suffix/iu);

        await expect(
            provider.downloadObject(RESERVED_UPLOAD_ARTIFACT_KEY)
        ).rejects.toThrow(/reserved filesystem upload artifact suffix/iu);

        await expect(
            provider.deleteObject(RESERVED_UPLOAD_ARTIFACT_KEY)
        ).rejects.toThrow(/reserved filesystem upload artifact suffix/iu);
    });

    it("preserves existing objects when overwrite is not requested", async () => {
        await provider.uploadObject({
            buffer: Buffer.from("first", "utf8"),
            key: "sync/state.json",
        });

        await expect(
            provider.uploadObject({
                buffer: Buffer.from("second", "utf8"),
                key: "sync/state.json",
            })
        ).rejects.toMatchObject({
            code: "EEXIST",
            operation: "uploadObject",
            providerKind: "filesystem",
            target: "sync/state.json",
        });

        await expect(
            provider.downloadObject("sync/state.json")
        ).resolves.toEqual(Buffer.from("first", "utf8"));
    });

    it("reports non-file object paths as provider operation failures", async () => {
        const objectDirectory = path.join(getAppRoot(), "sync", "directory");
        await mkdir(objectDirectory, { recursive: true });

        await expect(
            provider.downloadObject("sync/directory")
        ).rejects.toBeInstanceOf(CloudProviderOperationError);
        await expect(
            provider.deleteObject("sync/directory")
        ).rejects.toMatchObject({
            operation: "deleteObject",
            providerKind: "filesystem",
            target: "sync/directory",
        });
    });

    it("lists only canonical object keys under the requested prefix", async () => {
        await provider.uploadObject({
            buffer: Buffer.from("valid", "utf8"),
            key: "backups/valid.sqlite",
        });

        const backupDirectory = path.join(getAppRoot(), "backups");
        await mkdir(backupDirectory, { recursive: true });
        await writeFile(
            path.join(backupDirectory, "trailing-space.sqlite "),
            "ignored",
            "utf8"
        );

        await provider.uploadObject({
            buffer: Buffer.from("other", "utf8"),
            key: "sync/other.json",
        });

        await expect(provider.listObjects("backups")).resolves.toEqual([
            expect.objectContaining({
                key: "backups/valid.sqlite",
                sizeBytes: 5,
            }),
        ]);
    });

    it("hides stray internal upload artifacts from object listings", async () => {
        await provider.uploadObject({
            buffer: Buffer.from("valid", "utf8"),
            key: "sync/state.json",
        });

        const syncDirectory = path.join(getAppRoot(), "sync");
        await mkdir(syncDirectory, { recursive: true });
        await writeFile(
            path.join(
                syncDirectory,
                "state.json.tmp-12345678-1234-1234-1234-123456789abc"
            ),
            "temporary",
            "utf8"
        );
        await writeFile(
            path.join(
                syncDirectory,
                "state.json.bak-12345678-1234-1234-1234-123456789abc"
            ),
            "backup",
            "utf8"
        );

        await expect(provider.listObjects("sync")).resolves.toEqual([
            expect.objectContaining({
                key: "sync/state.json",
                sizeBytes: 5,
            }),
        ]);
    });
});
