import { beforeEach, describe, expect, it, vi } from "vitest";

type MockAxiosResponse = Readonly<{ data: unknown }>;

const axiosCreateMock = vi.fn();

vi.mock("axios", () => ({
    default: {
        create: axiosCreateMock,
    },
}));

const randomUuidMock = vi.fn(() => "mock-uuid");

vi.mock("node:crypto", () => ({
    randomUUID: randomUuidMock,
}));

function createAxiosInstance() {
    return {
        delete: vi.fn<
            (url: string, config?: unknown) => Promise<MockAxiosResponse>
        >(),
        get: vi.fn<(url: string, config?: unknown) => Promise<MockAxiosResponse>>(),
        patch: vi.fn<
            (
                url: string,
                data?: unknown,
                config?: unknown
            ) => Promise<MockAxiosResponse>
        >(),
        post: vi.fn<
            (
                url: string,
                data?: unknown,
                config?: unknown
            ) => Promise<MockAxiosResponse>
        >(),
    };
}

describe("googleDriveHttpClient (strict coverage)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it("creates file metadata without media via the Drive API", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        api.post.mockResolvedValueOnce({ data: { ok: true } });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        const result = await client.files.create({
            fields: "id",
            requestBody: { name: "backup.json" },
        });

        expect(result).toEqual({ data: { ok: true } });

        expect(api.post).toHaveBeenCalledTimes(1);
        const [url, requestBody, config] = api.post.mock.calls[0] as [
            string,
            unknown,
            { headers: Record<string, string>; params?: unknown }
        ];

        expect(url).toBe("/files");
        expect(requestBody).toEqual({ name: "backup.json" });
        expect(config.headers["Authorization"]).toBe("Bearer token");
        expect(config.headers["Content-Type"]).toBe("application/json");
        expect(config.params).toEqual({ fields: "id" });
    });

    it("creates file metadata without fields when fields is omitted", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        api.post.mockResolvedValueOnce({ data: { ok: true } });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        await client.files.create({
            requestBody: { name: "backup.json" },
        });

        const [_url, _requestBody, config] = api.post.mock.calls[0] as [
            string,
            unknown,
            { params?: unknown }
        ];

        expect(config.params).toBeUndefined();
    });

    it("creates a multipart upload when media is provided", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        uploadApi.post.mockResolvedValueOnce({ data: { uploaded: true } });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        const payload = Buffer.from("hello", "utf8");

        const result = await client.files.create({
            requestBody: { name: "backup.bin" },
            media: { body: payload, mimeType: "application/octet-stream" },
        });

        expect(result).toEqual({ data: { uploaded: true } });
        expect(randomUuidMock).toHaveBeenCalledTimes(1);

        expect(uploadApi.post).toHaveBeenCalledTimes(1);
        const [url, body, config] = uploadApi.post.mock.calls[0] as [
            string,
            Buffer,
            {
                headers: Record<string, string>;
                params: Record<string, string>;
            },
        ];

        expect(url).toBe("/files");
        expect(Buffer.isBuffer(body)).toBeTruthy();
        expect(body.toString("utf8")).toContain(
            "Content-Type: application/json; charset=UTF-8"
        );
        expect(body.toString("utf8")).toContain(
            JSON.stringify({ name: "backup.bin" })
        );
        expect(body.toString("utf8")).toContain(
            "Content-Type: application/octet-stream"
        );
        expect(body.toString("utf8")).toContain("hello");

        expect(config.headers["Authorization"]).toBe("Bearer token");
        expect(config.headers["Content-Type"]).toContain("multipart/related");
        expect(config.headers["Content-Type"]).toContain("uptimewatcher_mock-uuid");
        expect(config.params["uploadType"]).toBe("multipart");
    });

    it("includes fields query when creating multipart uploads with fields", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        uploadApi.post.mockResolvedValueOnce({ data: { uploaded: true } });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        await client.files.create({
            fields: "id",
            requestBody: { name: "backup.bin" },
            media: {
                body: Buffer.from("hello", "utf8"),
                mimeType: "application/octet-stream",
            },
        });

        const [_url, _body, config] = uploadApi.post.mock.calls[0] as [
            string,
            Buffer,
            { params: Record<string, string> }
        ];

        expect(config.params["uploadType"]).toBe("multipart");
        expect(config.params["fields"]).toBe("id");
    });

    it("gets file metadata when alt is not media", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        api.get.mockResolvedValueOnce({ data: { id: "abc" } });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        const result = await client.files.get({
            fileId: "abc",
            fields: "id",
        });

        expect(result).toEqual({ data: { id: "abc" } });
        expect(api.get).toHaveBeenCalledTimes(1);
        const [url, config] = api.get.mock.calls[0] as [
            string,
            { headers: Record<string, string>; params?: unknown }
        ];
        expect(url).toBe("/files/abc");
        expect(config.headers["Authorization"]).toBe("Bearer token");
        expect(config.params).toEqual({ fields: "id" });
    });

    it("gets file metadata without params when fields is omitted", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        api.get.mockResolvedValueOnce({ data: { id: "abc" } });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        await client.files.get({ fileId: "abc" });

        const [_url, config] = api.get.mock.calls[0] as [
            string,
            { params?: unknown }
        ];

        expect(config.params).toBeUndefined();
    });

    it("downloads binary content as a Buffer when alt=media returns an ArrayBuffer", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        const arrayBuffer = new Uint8Array([1, 2, 3]).buffer;
        api.get.mockResolvedValueOnce({ data: arrayBuffer });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        const result = await client.files.get({
            fileId: "abc",
            alt: "media",
        });

        expect(result.data).toBeInstanceOf(Buffer);
        expect(Buffer.from(result.data as Buffer)).toEqual(Buffer.from([1, 2, 3]));
        expect(api.get).toHaveBeenCalledTimes(1);
        const [_url, config] = api.get.mock.calls[0] as [string, unknown];
        expect(config).toMatchObject({ responseType: "arraybuffer" });
    });

    it("downloads binary content as a Buffer when alt=media returns an ArrayBuffer view", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        const view = new Uint8Array([4, 5, 6]);
        api.get.mockResolvedValueOnce({ data: view });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        const result = await client.files.get({
            fileId: "abc",
            alt: "media",
        });

        expect(result.data).toEqual(Buffer.from([4, 5, 6]));
    });

    it("downloads binary content as a Buffer when alt=media returns a Buffer", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        api.get.mockResolvedValueOnce({ data: Buffer.from([9, 9]) });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        const result = await client.files.get({
            fileId: "abc",
            alt: "media",
        });

        expect(result.data).toEqual(Buffer.from([9, 9]));
    });

    it("throws when alt=media does not yield binary content", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        api.get.mockResolvedValueOnce({ data: "not-binary" });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        await expect(
            client.files.get({ fileId: "abc", alt: "media" })
        ).rejects.toThrowError(/did not return binary content/i);
    });

    it("lists files with correct params and Authorization header", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        api.get.mockResolvedValueOnce({ data: { files: [] } });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        const params = {
            fields: "files(id)",
            pageSize: 10,
            q: "name contains 'backup'",
            spaces: "appDataFolder" as const,
        };

        const result = await client.files.list(params);
        expect(result).toEqual({ data: { files: [] } });
        expect(api.get).toHaveBeenCalledWith("/files", {
            headers: { Authorization: "Bearer token" },
            params,
        });
    });

    it("deletes files using an encoded fileId", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        api.delete.mockResolvedValueOnce({ data: { deleted: true } });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        const result = await client.files.delete({ fileId: "a/b" });
        expect(result).toEqual({ data: { deleted: true } });
        expect(api.delete).toHaveBeenCalledWith("/files/a%2Fb", {
            headers: { Authorization: "Bearer token" },
        });
    });

    it("updates file content using uploadType=media and encoded fileId", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        uploadApi.patch.mockResolvedValueOnce({ data: { updated: true } });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        const buffer = Buffer.from("data", "utf8");
        const result = await client.files.update({
            fileId: "a/b",
            fields: "id",
            media: { body: buffer, mimeType: "application/octet-stream" },
        });

        expect(result).toEqual({ data: { updated: true } });
        expect(uploadApi.patch).toHaveBeenCalledTimes(1);
        const [url, data, config] = uploadApi.patch.mock.calls[0] as [
            string,
            Buffer,
            {
                headers: Record<string, string>;
                params: Record<string, string>;
            },
        ];

        expect(url).toBe("/files/a%2Fb");
        expect(data).toEqual(buffer);
        expect(config.headers["Authorization"]).toBe("Bearer token");
        expect(config.headers["Content-Type"]).toBe("application/octet-stream");
        expect(config.params["uploadType"]).toBe("media");
        expect(config.params["fields"]).toBe("id");
    });

    it("omits the fields query when update fields is undefined", async () => {
        const api = createAxiosInstance();
        const uploadApi = createAxiosInstance();

        uploadApi.patch.mockResolvedValueOnce({ data: { updated: true } });

        let createCalls = 0;
        axiosCreateMock.mockImplementation(() =>
            createCalls++ === 0 ? api : uploadApi
        );

        const tokenManager = {
            getValidAccessToken: vi.fn().mockResolvedValueOnce("token"),
        };

        const { createGoogleDriveClient } = await import(
            "../../../../../../../electron/services/cloud/providers/googleDrive/googleDriveHttpClient"
        );

        const client = createGoogleDriveClient(tokenManager as never);

        await client.files.update({
            fileId: "abc",
            media: {
                body: Buffer.from("data", "utf8"),
                mimeType: "application/octet-stream",
            },
        });

        const [_url, _data, config] = uploadApi.patch.mock.calls[0] as [
            string,
            Buffer,
            { params: Record<string, string> }
        ];

        expect(config.params["uploadType"]).toBe("media");
        expect(Object.hasOwn(config.params, "fields")).toBeFalsy();
    });
});
