import { CloudProviderOperationError } from "@electron/services/cloud/providers/cloudProviderErrors";
import { GoogleDriveCloudStorageProvider } from "@electron/services/cloud/providers/googleDrive/GoogleDriveCloudStorageProvider";
import { beforeEach, describe, expect, it, vi } from "vitest";

const googleDriveClientMocks = vi.hoisted(() => {
    const driveStub = {
        files: {
            create: vi.fn(),
            delete: vi.fn(),
            get: vi.fn(),
            list: vi.fn(),
            update: vi.fn(),
        },
    };

    const createGoogleDriveClient = vi.fn(() => driveStub);

    return { createGoogleDriveClient, driveStub };
});

vi.mock(
    "@electron/services/cloud/providers/googleDrive/googleDriveHttpClient",
    () => ({
        createGoogleDriveClient: googleDriveClientMocks.createGoogleDriveClient,
    })
);

describe(GoogleDriveCloudStorageProvider, () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("stores data in appDataFolder and creates the app root folder", async () => {
        const tokenManager = {
            isConnected: vi.fn().mockResolvedValue(true),
        };

        // 1) findChildByName for uptime-watcher under appDataFolder => not found
        googleDriveClientMocks.driveStub.files.list
            .mockResolvedValueOnce({ data: { files: [] } })
            // 2) listFolderRecursive for created folder => empty
            .mockResolvedValueOnce({
                data: { files: [], nextPageToken: null },
            });

        googleDriveClientMocks.driveStub.files.create.mockResolvedValueOnce({
            data: { id: "root-id" },
        });

        const provider = new GoogleDriveCloudStorageProvider({
            tokenManager: tokenManager as never,
        });

        const result = await provider.listObjects("");
        expect(result).toEqual([]);

        // It must search in appDataFolder.
        expect(
            googleDriveClientMocks.driveStub.files.list
        ).toHaveBeenCalledWith(
            expect.objectContaining({ spaces: "appDataFolder" })
        );

        // It must create root folder under appDataFolder parents.
        expect(
            googleDriveClientMocks.driveStub.files.create
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                requestBody: expect.objectContaining({
                    mimeType: "application/vnd.google-apps.folder",
                    name: "uptime-watcher",
                    parents: ["appDataFolder"],
                }),
            })
        );

        expect(
            googleDriveClientMocks.createGoogleDriveClient
        ).toHaveBeenCalledWith(tokenManager);
    });

    it("throws ENOENT when downloading a missing object", async () => {
        const tokenManager = {
            isConnected: vi.fn().mockResolvedValue(true),
        };

        // ResolveFolderId() starts by locating the app root folder.
        // Return no folders => treat as missing object.
        googleDriveClientMocks.driveStub.files.list.mockResolvedValueOnce({
            data: { files: [], nextPageToken: null },
        });

        const provider = new GoogleDriveCloudStorageProvider({
            tokenManager: tokenManager as never,
        });

        try {
            await provider.downloadObject("sync/missing.txt");
            throw new Error("Expected downloadObject to throw");
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(CloudProviderOperationError);
            const typed = error as CloudProviderOperationError;
            expect(typed.code).toBe("ENOENT");
            expect(typed.operation).toBe("downloadObject");
            expect(typed.providerKind).toBe("google-drive");
            expect(typed.target).toBe("sync/missing.txt");
        }
    });

    it("throws EEXIST when overwrite is false and object exists", async () => {
        const tokenManager = {
            isConnected: vi.fn().mockResolvedValue(true),
        };

        // GetOrCreateFolderId for ["uptime-watcher", "sync"]:
        // 1) find uptime-watcher under appDataFolder
        // 2) find sync under uptime-watcher
        // 3) find existing.txt under sync
        googleDriveClientMocks.driveStub.files.list
            .mockResolvedValueOnce({
                data: { files: [{ id: "root-id" }], nextPageToken: null },
            })
            .mockResolvedValueOnce({
                data: { files: [{ id: "sync-id" }], nextPageToken: null },
            })
            .mockResolvedValueOnce({
                data: { files: [{ id: "file-id" }], nextPageToken: null },
            });

        const provider = new GoogleDriveCloudStorageProvider({
            tokenManager: tokenManager as never,
        });

        try {
            await provider.uploadObject({
                buffer: Buffer.from("payload", "utf8"),
                key: "sync/existing.txt",
                overwrite: false,
            });
            throw new Error("Expected uploadObject to throw");
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(CloudProviderOperationError);
            const typed = error as CloudProviderOperationError;
            expect(typed.code).toBe("EEXIST");
            expect(typed.operation).toBe("uploadObject");
            expect(typed.providerKind).toBe("google-drive");
            expect(typed.target).toBe("sync/existing.txt");
        }
    });

    it("normalizes invalid Drive list metadata to finite object values", async () => {
        const tokenManager = {
            isConnected: vi.fn().mockResolvedValue(true),
        };

        googleDriveClientMocks.driveStub.files.list
            .mockResolvedValueOnce({
                data: { files: [{ id: "root-id" }], nextPageToken: null },
            })
            .mockResolvedValueOnce({
                data: {
                    files: [
                        {
                            id: "file-id",
                            modifiedTime: "not-a-date",
                            name: "bad-meta.txt",
                            size: "not-a-size",
                        },
                    ],
                    nextPageToken: null,
                },
            });

        const provider = new GoogleDriveCloudStorageProvider({
            tokenManager: tokenManager as never,
        });

        await expect(provider.listObjects("")).resolves.toEqual([
            {
                key: "bad-meta.txt",
                lastModifiedAt: 0,
                sizeBytes: 0,
            },
        ]);
    });

    it("falls back for impossible Drive list modified times", async () => {
        const tokenManager = {
            isConnected: vi.fn().mockResolvedValue(true),
        };

        googleDriveClientMocks.driveStub.files.list
            .mockResolvedValueOnce({
                data: { files: [{ id: "root-id" }], nextPageToken: null },
            })
            .mockResolvedValueOnce({
                data: {
                    files: [
                        {
                            id: "file-id",
                            modifiedTime: "2026-02-30T00:00:00.000Z",
                            name: "bad-date.txt",
                            size: "3",
                        },
                    ],
                    nextPageToken: null,
                },
            });

        const provider = new GoogleDriveCloudStorageProvider({
            tokenManager: tokenManager as never,
        });

        await expect(provider.listObjects("")).resolves.toEqual([
            {
                key: "bad-date.txt",
                lastModifiedAt: 0,
                sizeBytes: 3,
            },
        ]);
    });

    it("falls back to local upload metadata when Drive returns invalid metadata", async () => {
        const fallback = new Date("2026-07-03T09:20:00.000Z");
        vi.useFakeTimers();

        const tokenManager = {
            isConnected: vi.fn().mockResolvedValue(true),
        };

        googleDriveClientMocks.driveStub.files.list
            .mockResolvedValueOnce({
                data: { files: [{ id: "root-id" }], nextPageToken: null },
            })
            .mockResolvedValueOnce({
                data: { files: [{ id: "sync-id" }], nextPageToken: null },
            })
            .mockResolvedValueOnce({
                data: { files: [], nextPageToken: null },
            });

        googleDriveClientMocks.driveStub.files.create.mockResolvedValueOnce({
            data: { id: "created-file-id" },
        });
        googleDriveClientMocks.driveStub.files.get.mockResolvedValueOnce({
            data: {
                modifiedTime: "not-a-date",
                size: "Infinity",
            },
        });

        const provider = new GoogleDriveCloudStorageProvider({
            tokenManager: tokenManager as never,
        });

        let result: Awaited<ReturnType<typeof provider.uploadObject>>;
        try {
            vi.setSystemTime(fallback);
            result = await provider.uploadObject({
                buffer: Buffer.from("payload"),
                key: "sync/bad-meta.txt",
                overwrite: true,
            });
        } finally {
            vi.useRealTimers();
        }

        expect(result).toEqual(
            expect.objectContaining({
                key: "sync/bad-meta.txt",
                lastModifiedAt: fallback.getTime(),
                sizeBytes: 7,
            })
        );
    });

    it("does not treat a same-name folder as an existing upload target", async () => {
        const tokenManager = {
            isConnected: vi.fn().mockResolvedValue(true),
        };

        googleDriveClientMocks.driveStub.files.list
            .mockResolvedValueOnce({
                data: { files: [{ id: "root-id" }], nextPageToken: null },
            })
            .mockResolvedValueOnce({
                data: { files: [{ id: "sync-id" }], nextPageToken: null },
            })
            .mockResolvedValueOnce({
                data: { files: [], nextPageToken: null },
            });

        googleDriveClientMocks.driveStub.files.create.mockResolvedValueOnce({
            data: { id: "created-file-id" },
        });
        googleDriveClientMocks.driveStub.files.get.mockResolvedValueOnce({
            data: {
                modifiedTime: "2026-07-03T00:00:00.000Z",
                size: "7",
            },
        });

        const provider = new GoogleDriveCloudStorageProvider({
            tokenManager: tokenManager as never,
        });

        await expect(
            provider.uploadObject({
                buffer: Buffer.from("payload"),
                key: "sync/collision.txt",
                overwrite: true,
            })
        ).resolves.toEqual({
            key: "sync/collision.txt",
            lastModifiedAt: Date.parse("2026-07-03T00:00:00.000Z"),
            sizeBytes: 7,
        });

        const fileLookupQuery =
            googleDriveClientMocks.driveStub.files.list.mock.calls[2]?.[0].q;
        expect(fileLookupQuery).toContain(
            "mimeType != 'application/vnd.google-apps.folder'"
        );
        expect(
            googleDriveClientMocks.driveStub.files.update
        ).not.toHaveBeenCalled();
        expect(
            googleDriveClientMocks.driveStub.files.create
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                requestBody: expect.objectContaining({
                    name: "collision.txt",
                    parents: ["sync-id"],
                }),
            })
        );
    });

    it("does not treat a same-name folder as a downloadable object", async () => {
        const tokenManager = {
            isConnected: vi.fn().mockResolvedValue(true),
        };

        googleDriveClientMocks.driveStub.files.list
            .mockResolvedValueOnce({
                data: { files: [{ id: "root-id" }], nextPageToken: null },
            })
            .mockResolvedValueOnce({
                data: { files: [{ id: "sync-id" }], nextPageToken: null },
            })
            .mockResolvedValueOnce({
                data: { files: [], nextPageToken: null },
            });

        const provider = new GoogleDriveCloudStorageProvider({
            tokenManager: tokenManager as never,
        });

        await expect(
            provider.downloadObject("sync/collision.txt")
        ).rejects.toThrow(CloudProviderOperationError);

        const fileLookupQuery =
            googleDriveClientMocks.driveStub.files.list.mock.calls[2]?.[0].q;
        expect(fileLookupQuery).toContain(
            "mimeType != 'application/vnd.google-apps.folder'"
        );
        expect(
            googleDriveClientMocks.driveStub.files.get
        ).not.toHaveBeenCalled();
    });
});
