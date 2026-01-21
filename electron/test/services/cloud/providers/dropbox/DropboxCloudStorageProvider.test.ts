import { describe, expect, it, vi } from "vitest";

import { DropboxCloudStorageProvider } from "@electron/services/cloud/providers/dropbox/DropboxCloudStorageProvider";
import { CloudProviderOperationError } from "@electron/services/cloud/providers/cloudProviderErrors";
import { DropboxResponseError } from "dropbox";

describe(DropboxCloudStorageProvider, () => {
    it("ignores folder entries returned by list_folder without warning", async () => {
        const tokenManager = {
            getAccessToken: vi.fn().mockResolvedValue("token"),
        };

        const filesListFolder = vi.fn().mockResolvedValue({
            result: {
                cursor: "cursor",
                entries: [
                    {
                        ".tag": "folder",
                        path_display: "/uptime-watcher/backups",
                    },
                    {
                        ".tag": "file",
                        path_display: "/uptime-watcher/backups/b.sqlite",
                        server_modified: "2025-01-01T00:00:00Z",
                        size: 20,
                    },
                ],
                has_more: false,
            },
        });

        const provider = new DropboxCloudStorageProvider({
            clientFactory: () =>
                ({
                    filesListFolder,
                    filesListFolderContinue: vi.fn(),
                    filesUpload: vi.fn(),
                    filesDownload: vi.fn(),
                    filesDeleteV2: vi.fn(),
                    usersGetCurrentAccount: vi.fn(),
                    authTokenRevoke: vi.fn(),
                }) as never,
            tokenManager: tokenManager as never,
        });

        const electronLogModule = await import("electron-log/main");
        const mockLog = electronLogModule.default;
        vi.mocked(mockLog.warn).mockClear();

        const entries = await provider.listObjects("backups/");

        expect(entries).toHaveLength(1);
        expect(entries[0]?.key).toBe("backups/b.sqlite");
        expect(
            vi
                .mocked(mockLog.warn)
                .mock.calls.some((call) =>
                    String(call[0]).includes(
                        "Skipped invalid Dropbox list-folder entries"
                    )
                )
        ).toBeFalsy();
    });

    it("lists objects under the app root and filters by prefix", async () => {
        const tokenManager = {
            getAccessToken: vi.fn().mockResolvedValue("token"),
        };

        const filesListFolder = vi.fn().mockResolvedValue({
            result: {
                cursor: "cursor",
                entries: [
                    {
                        ".tag": "file",
                        path_display: "/uptime-watcher/sync/a.ndjson",
                        server_modified: "2025-01-01T00:00:00Z",
                        size: 10,
                    },
                    {
                        ".tag": "file",
                        path_display: "/uptime-watcher/syncX/b.ndjson",
                        server_modified: "2025-01-01T00:00:00Z",
                        size: 11,
                    },
                    {
                        ".tag": "file",
                        path_display: "/uptime-watcher/backups/b.sqlite",
                        server_modified: "2025-01-01T00:00:00Z",
                        size: 20,
                    },
                ],
                has_more: false,
            },
        });

        const provider = new DropboxCloudStorageProvider({
            clientFactory: () =>
                ({
                    filesListFolder,
                    filesListFolderContinue: vi.fn(),
                    filesUpload: vi.fn(),
                    filesDownload: vi.fn(),
                    filesDeleteV2: vi.fn(),
                    usersGetCurrentAccount: vi.fn(),
                    authTokenRevoke: vi.fn(),
                }) as never,
            tokenManager: tokenManager as never,
        });

        const entries = await provider.listObjects("sync");
        expect(entries).toHaveLength(1);
        expect(entries[0]?.key).toBe("sync/a.ndjson");
        expect(entries[0]?.sizeBytes).toBe(10);
    });

    it("uploads with overwrite/add mode and returns CloudObjectEntry from response", async () => {
        const tokenManager = {
            getAccessToken: vi.fn().mockResolvedValue("token"),
        };

        const filesUpload = vi.fn().mockResolvedValue({
            result: {
                ".tag": "file",
                path_display: "/uptime-watcher/sync/foo.txt",
                server_modified: "2025-01-01T00:00:00Z",
                size: 3,
            },
        });

        const provider = new DropboxCloudStorageProvider({
            clientFactory: () =>
                ({
                    filesListFolder: vi.fn(),
                    filesListFolderContinue: vi.fn(),
                    filesUpload,
                    filesDownload: vi.fn(),
                    filesDeleteV2: vi.fn(),
                    usersGetCurrentAccount: vi.fn(),
                    authTokenRevoke: vi.fn(),
                }) as never,
            tokenManager: tokenManager as never,
        });

        const entry = await provider.uploadObject({
            buffer: Buffer.from("hey", "utf8"),
            key: "sync/foo.txt",
            overwrite: true,
        });

        expect(entry.key).toBe("sync/foo.txt");
        expect(entry.sizeBytes).toBe(3);

        expect(filesUpload).toHaveBeenCalledTimes(1);

        const call = filesUpload.mock.calls[0]?.[0] as {
            mode?: { ".tag"?: string };
        };

        expect(call.mode?.[".tag"]).toBe("overwrite");
    });

    it("throws EEXIST when overwrite is false and the Dropbox path conflicts", async () => {
        const tokenManager = {
            getAccessToken: vi.fn().mockResolvedValue("token"),
        };

        const conflict = new DropboxResponseError(
            409,
            {},
            {
                ".tag": "path",
                path: {
                    ".tag": "conflict",
                },
            }
        );

        const filesUpload = vi.fn().mockRejectedValue(conflict);

        const provider = new DropboxCloudStorageProvider({
            clientFactory: () =>
                ({
                    filesListFolder: vi.fn(),
                    filesListFolderContinue: vi.fn(),
                    filesUpload,
                    filesDownload: vi.fn(),
                    filesDeleteV2: vi.fn(),
                    usersGetCurrentAccount: vi.fn(),
                    authTokenRevoke: vi.fn(),
                }) as never,
            tokenManager: tokenManager as never,
        });

        try {
            await provider.uploadObject({
                buffer: Buffer.from("hey", "utf8"),
                key: "sync/foo.txt",
                overwrite: false,
            });
            throw new Error("Expected uploadObject to throw");
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(CloudProviderOperationError);

            const typed = error as CloudProviderOperationError;
            expect(typed.code).toBe("EEXIST");
            expect(typed.operation).toBe("uploadObject");
            expect(typed.providerKind).toBe("dropbox");
            expect(typed.target).toBe("sync/foo.txt");
        }
    });
});
