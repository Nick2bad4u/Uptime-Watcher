import { describe, expect, it, vi, beforeEach } from "vitest";

import { GoogleDriveCloudStorageProvider } from "@electron/services/cloud/providers/googleDrive/GoogleDriveCloudStorageProvider";

const googleApisMocks = vi.hoisted(() => {
    const driveStub = {
        files: {
            create: vi.fn(),
            delete: vi.fn(),
            get: vi.fn(),
            list: vi.fn(),
            update: vi.fn(),
        },
    };

    const driveFactory = vi.fn(() => driveStub);

    return { driveFactory, driveStub };
});


vi.mock("googleapis", () => ({
    google: {
        auth: {
            OAuth2: class {
                public setCredentials(): void {
                    // noop
                }
            },
        },
        drive: googleApisMocks.driveFactory,
    },
}));

describe(GoogleDriveCloudStorageProvider, () => {
    beforeEach(() => {
        vi.clearAllMocks();
        googleApisMocks.driveFactory.mockReturnValue(googleApisMocks.driveStub);
    });

    it("stores data in appDataFolder and creates the app root folder", async () => {
        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValue("token"),
            isConnected: vi.fn().mockResolvedValue(true),
        };

        // 1) findChildByName for uptime-watcher under appDataFolder => not found
        googleApisMocks.driveStub.files.list
            .mockResolvedValueOnce({ data: { files: [] } })
            // 2) listFolderRecursive for created folder => empty
            .mockResolvedValueOnce({ data: { files: [], nextPageToken: null } });

        googleApisMocks.driveStub.files.create.mockResolvedValueOnce({
            data: { id: "root-id" },
        });

        const provider = new GoogleDriveCloudStorageProvider({
            clientId: "client-id",
            tokenManager: tokenManager as never,
        });

        const result = await provider.listObjects("");
        expect(result).toEqual([]);

        // It must search in appDataFolder.
        expect(googleApisMocks.driveStub.files.list).toHaveBeenCalledWith(
            expect.objectContaining({ spaces: "appDataFolder" })
        );

        // It must create root folder under appDataFolder parents.
        expect(googleApisMocks.driveStub.files.create).toHaveBeenCalledWith(
            expect.objectContaining({
                requestBody: expect.objectContaining({
                    mimeType: "application/vnd.google-apps.folder",
                    name: "uptime-watcher",
                    parents: ["appDataFolder"],
                }),
            })
        );

        expect(tokenManager.getValidAccessToken).toHaveBeenCalledTimes(1);
    });
});
