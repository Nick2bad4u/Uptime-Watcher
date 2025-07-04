/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handleSQLiteBackupDownload } from "../../../stores/sites/utils/fileDownload";

describe("fileDownload", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Helper function to set up common mocks
    const setupDownloadMocks = () => {
        // Mock URL APIs
        const mockObjectURL = "blob:mock-url";
        const mockCreateObjectURL = vi.fn().mockReturnValue(mockObjectURL);
        const mockRevokeObjectURL = vi.fn();

        global.URL.createObjectURL = mockCreateObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;

        // Mock document.createElement with complete anchor element
        const mockAnchor = {
            href: "",
            download: "",
            style: { display: "" },
            click: vi.fn(),
        };
        const mockCreateElement = vi.fn().mockReturnValue(mockAnchor);
        Object.defineProperty(document, "createElement", {
            value: mockCreateElement,
            writable: true,
            configurable: true,
        });

        // Mock document.body
        const mockBody = {
            appendChild: vi.fn(),
            removeChild: vi.fn(),
        };
        Object.defineProperty(document, "body", {
            value: mockBody,
            writable: true,
            configurable: true,
        });

        return {
            mockObjectURL,
            mockCreateObjectURL,
            mockRevokeObjectURL,
            mockAnchor,
            mockCreateElement,
            mockBody,
        };
    };

    describe("handleSQLiteBackupDownload", () => {
        it("should handle successful backup download", async () => {
            const mockBackupData = new Uint8Array([1, 2, 3, 4, 5]);
            const mockDownloadFn = vi.fn().mockResolvedValue(mockBackupData);

            const { mockObjectURL, mockCreateObjectURL, mockRevokeObjectURL, mockAnchor, mockCreateElement } =
                setupDownloadMocks();

            await handleSQLiteBackupDownload(mockDownloadFn);

            expect(mockDownloadFn).toHaveBeenCalledOnce();
            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
            expect(mockCreateElement).toHaveBeenCalledWith("a");
            expect(mockAnchor.href).toBe(mockObjectURL);
            expect(mockAnchor.download).toBe("uptime-watcher-backup.db");
            expect(mockAnchor.click).toHaveBeenCalledOnce();
            expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockObjectURL);
        });

        it("should handle empty backup data", async () => {
            const mockBackupData = new Uint8Array([]);
            const mockDownloadFn = vi.fn().mockResolvedValue(mockBackupData);

            const { mockObjectURL, mockCreateObjectURL, mockRevokeObjectURL, mockAnchor } = setupDownloadMocks();

            await handleSQLiteBackupDownload(mockDownloadFn);

            expect(mockDownloadFn).toHaveBeenCalledOnce();
            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
            expect(mockAnchor.click).toHaveBeenCalledOnce();
            expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockObjectURL);
        });

        it("should handle download function errors", async () => {
            const mockError = new Error("Download failed");
            const mockDownloadFn = vi.fn().mockRejectedValue(mockError);

            await expect(handleSQLiteBackupDownload(mockDownloadFn)).rejects.toThrow("Download failed");
        });

        it("should handle URL.createObjectURL errors", async () => {
            const mockBackupData = new Uint8Array([1, 2, 3, 4, 5]);
            const mockDownloadFn = vi.fn().mockResolvedValue(mockBackupData);

            // Mock URL.createObjectURL to throw an error
            const mockCreateObjectURL = vi.fn().mockImplementation(() => {
                throw new Error("Failed to create object URL");
            });

            global.URL.createObjectURL = mockCreateObjectURL;

            await expect(handleSQLiteBackupDownload(mockDownloadFn)).rejects.toThrow("Failed to create object URL");
        });

        it("should handle document.createElement errors", async () => {
            const mockBackupData = new Uint8Array([1, 2, 3, 4, 5]);
            const mockDownloadFn = vi.fn().mockResolvedValue(mockBackupData);

            // Mock URL.createObjectURL
            const mockObjectURL = "blob:mock-url";
            const mockCreateObjectURL = vi.fn().mockReturnValue(mockObjectURL);
            global.URL.createObjectURL = mockCreateObjectURL;

            // Mock document.createElement to throw an error
            const mockCreateElement = vi.fn().mockImplementation(() => {
                throw new Error("Failed to create element");
            });
            Object.defineProperty(document, "createElement", {
                value: mockCreateElement,
                writable: true,
            });

            await expect(handleSQLiteBackupDownload(mockDownloadFn)).rejects.toThrow("Failed to create element");
        });

        it("should handle click errors", async () => {
            const mockBackupData = new Uint8Array([1, 2, 3, 4, 5]);
            const mockDownloadFn = vi.fn().mockResolvedValue(mockBackupData);

            // Mock URL.createObjectURL and URL.revokeObjectURL
            const mockObjectURL = "blob:mock-url";
            const mockCreateObjectURL = vi.fn().mockReturnValue(mockObjectURL);
            const mockRevokeObjectURL = vi.fn();

            global.URL.createObjectURL = mockCreateObjectURL;
            global.URL.revokeObjectURL = mockRevokeObjectURL;

            // Mock document.createElement with click that throws
            const mockAnchor = {
                href: "",
                download: "",
                click: vi.fn().mockImplementation(() => {
                    throw new Error("Click failed");
                }),
            };
            const mockCreateElement = vi.fn().mockReturnValue(mockAnchor);
            Object.defineProperty(document, "createElement", {
                value: mockCreateElement,
                writable: true,
            });

            await expect(handleSQLiteBackupDownload(mockDownloadFn)).rejects.toThrow("Click failed");
        });

        it("should clean up resources on success", async () => {
            const mockBackupData = new Uint8Array([1, 2, 3, 4, 5]);
            const mockDownloadFn = vi.fn().mockResolvedValue(mockBackupData);

            const { mockObjectURL, mockCreateObjectURL, mockRevokeObjectURL, mockAnchor } = setupDownloadMocks();

            await handleSQLiteBackupDownload(mockDownloadFn);

            expect(mockDownloadFn).toHaveBeenCalledOnce();
            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
            expect(mockAnchor.click).toHaveBeenCalledOnce();
            expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockObjectURL);
        });

        it("should clean up resources on error", async () => {
            const mockBackupData = new Uint8Array([1, 2, 3, 4, 5]);
            const mockDownloadFn = vi.fn().mockResolvedValue(mockBackupData);

            // Mock console.error to suppress expected error logging
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            // Mock URL.createObjectURL and URL.revokeObjectURL
            const mockObjectURL = "blob:mock-url";
            const mockCreateObjectURL = vi.fn().mockReturnValue(mockObjectURL);
            const mockRevokeObjectURL = vi.fn();

            global.URL.createObjectURL = mockCreateObjectURL;
            global.URL.revokeObjectURL = mockRevokeObjectURL;

            // Mock document.createElement with click that throws
            const mockAnchor = {
                href: "",
                download: "",
                click: vi.fn().mockImplementation(() => {
                    throw new Error("Click failed");
                }),
            };
            const mockCreateElement = vi.fn().mockReturnValue(mockAnchor);
            Object.defineProperty(document, "createElement", {
                value: mockCreateElement,
                writable: true,
            });

            await expect(handleSQLiteBackupDownload(mockDownloadFn)).rejects.toThrow("Click failed");
            expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockObjectURL);

            // Verify that the error was logged (optional assertion)
            expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to trigger download click:", expect.any(Error));

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });

        it("should handle large backup data", async () => {
            const mockBackupData = new Uint8Array(1024 * 1024); // 1MB
            mockBackupData.fill(42);
            const mockDownloadFn = vi.fn().mockResolvedValue(mockBackupData);

            const { mockObjectURL, mockCreateObjectURL, mockRevokeObjectURL, mockAnchor } = setupDownloadMocks();

            await handleSQLiteBackupDownload(mockDownloadFn);

            expect(mockDownloadFn).toHaveBeenCalledOnce();
            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
            expect(mockAnchor.click).toHaveBeenCalledOnce();
            expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockObjectURL);
        });

        it("should set correct blob type for SQLite database", async () => {
            const mockBackupData = new Uint8Array([1, 2, 3, 4, 5]);
            const mockDownloadFn = vi.fn().mockResolvedValue(mockBackupData);

            const { mockCreateObjectURL } = setupDownloadMocks();

            await handleSQLiteBackupDownload(mockDownloadFn);

            expect(mockCreateObjectURL).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "application/x-sqlite3",
                })
            );
        });
    });

    it("should handle null backup data", async () => {
        const mockDownloadFn = vi.fn().mockResolvedValue(null);

        await expect(handleSQLiteBackupDownload(mockDownloadFn)).rejects.toThrow();
    });

    it("should handle undefined backup data", async () => {
        const mockDownloadFn = vi.fn().mockResolvedValue(undefined);

        await expect(handleSQLiteBackupDownload(mockDownloadFn)).rejects.toThrow();
    });

    it("should handle non-Uint8Array backup data", async () => {
        const mockDownloadFn = vi.fn().mockResolvedValue("not-a-uint8array");

        await expect(handleSQLiteBackupDownload(mockDownloadFn)).rejects.toThrow();
    });
});

describe("Browser API availability", () => {
    it("should handle missing URL.createObjectURL", async () => {
        const mockBackupData = new Uint8Array([1, 2, 3, 4, 5]);
        const mockDownloadFn = vi.fn().mockResolvedValue(mockBackupData);

        // Remove URL.createObjectURL
        const originalCreateObjectURL = global.URL.createObjectURL;
        // @ts-expect-error - Testing undefined case
        delete global.URL.createObjectURL;

        await expect(handleSQLiteBackupDownload(mockDownloadFn)).rejects.toThrow();

        // Restore
        global.URL.createObjectURL = originalCreateObjectURL;
    });

    it("should handle missing URL.revokeObjectURL", async () => {
        const mockBackupData = new Uint8Array([1, 2, 3, 4, 5]);
        const mockDownloadFn = vi.fn().mockResolvedValue(mockBackupData);

        // Mock URL.createObjectURL but remove revokeObjectURL
        const mockObjectURL = "blob:mock-url";
        const mockCreateObjectURL = vi.fn().mockReturnValue(mockObjectURL);
        global.URL.createObjectURL = mockCreateObjectURL;

        const originalRevokeObjectURL = global.URL.revokeObjectURL;
        // @ts-expect-error - Testing undefined case
        delete global.URL.revokeObjectURL;

        // Mock document.createElement and click
        const mockAnchor = {
            href: "",
            download: "",
            click: vi.fn(),
        };
        const mockCreateElement = vi.fn().mockReturnValue(mockAnchor);
        Object.defineProperty(document, "createElement", {
            value: mockCreateElement,
            writable: true,
        });

        // Should not throw even if revokeObjectURL is missing
        await expect(handleSQLiteBackupDownload(mockDownloadFn)).resolves.not.toThrow();

        // Restore
        global.URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it("should handle missing document.createElement", async () => {
        const mockBackupData = new Uint8Array([1, 2, 3, 4, 5]);
        const mockDownloadFn = vi.fn().mockResolvedValue(mockBackupData);

        // Mock URL.createObjectURL
        const mockObjectURL = "blob:mock-url";
        const mockCreateObjectURL = vi.fn().mockReturnValue(mockObjectURL);
        global.URL.createObjectURL = mockCreateObjectURL;

        // Mock document.createElement to throw
        const originalCreateElement = document.createElement;
        const mockCreateElement = vi.fn().mockImplementation(() => {
            throw new Error("createElement not available");
        });
        Object.defineProperty(document, "createElement", {
            value: mockCreateElement,
            writable: true,
            configurable: true,
        });

        await expect(handleSQLiteBackupDownload(mockDownloadFn)).rejects.toThrow();

        // Restore
        Object.defineProperty(document, "createElement", {
            value: originalCreateElement,
            writable: true,
            configurable: true,
        });
    });
});
