import type { AxiosInstance } from "axios";

import { describe, expect, it, vi } from "vitest";

import { DropboxCloudStorageProvider } from "@electron/services/cloud/providers/dropbox/DropboxCloudStorageProvider";

describe(DropboxCloudStorageProvider, () => {
    it("lists objects under the app root and filters by prefix", async () => {
        const tokenManager = {
            getAccessToken: vi.fn().mockResolvedValue("token"),
        };

        const httpApi: Pick<AxiosInstance, "post"> = {
            post: vi.fn().mockImplementation(async (url: string) => {
                if (url.endsWith("/2/files/list_folder")) {
                    return {
                        data: {
                            entries: [
                                {
                                    ".tag": "file",
                                    path_display:
                                        "/uptime-watcher/sync/a.ndjson",
                                    server_modified: "2025-01-01T00:00:00Z",
                                    size: 10,
                                },
                                {
                                    ".tag": "file",
                                    path_display:
                                        "/uptime-watcher/backups/b.sqlite",
                                    server_modified: "2025-01-01T00:00:00Z",
                                    size: 20,
                                },
                            ],
                            has_more: false,
                        },
                    };
                }

                if (url.endsWith("/2/users/get_current_account")) {
                    return { data: {} };
                }

                throw new Error(`Unexpected URL: ${url}`);
            }),
        };

        const provider = new DropboxCloudStorageProvider({
            httpApi: httpApi as AxiosInstance,
            tokenManager: tokenManager as never,
        });

        const entries = await provider.listObjects("sync/");
        expect(entries).toHaveLength(1);
        expect(entries[0]?.key).toBe("sync/a.ndjson");
        expect(entries[0]?.sizeBytes).toBe(10);
    });

    it("uploads with overwrite/add mode and returns CloudObjectEntry from response", async () => {
        const tokenManager = {
            getAccessToken: vi.fn().mockResolvedValue("token"),
        };

        const httpContent: Pick<AxiosInstance, "post"> = {
            post: vi.fn().mockResolvedValue({
                data: {
                    ".tag": "file",
                    path_display: "/uptime-watcher/sync/foo.txt",
                    server_modified: "2025-01-01T00:00:00Z",
                    size: 3,
                },
            }),
        };

        const provider = new DropboxCloudStorageProvider({
            httpContent: httpContent as AxiosInstance,
            tokenManager: tokenManager as never,
        });

        const entry = await provider.uploadObject({
            buffer: Buffer.from("hey", "utf8"),
            key: "sync/foo.txt",
            overwrite: true,
        });

        expect(entry.key).toBe("sync/foo.txt");
        expect(entry.sizeBytes).toBe(3);
        expect(httpContent.post).toHaveBeenCalledTimes(1);

        const call = (
            httpContent.post as unknown as { mock: { calls: unknown[] } }
        ).mock.calls[0] as [
            string,
            Buffer,
            { headers?: Record<string, string> },
        ];

        const headers = call[2].headers ?? {};
        const arg = headers["Dropbox-API-Arg"];
        expect(arg).toBeTypeOf("string");
        const parsed = JSON.parse(arg as string) as { mode?: string };
        expect(parsed.mode).toBe("overwrite");
    });
});
