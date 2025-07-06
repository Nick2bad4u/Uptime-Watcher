/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    handleSQLiteBackupDownload,
    downloadFile,
    generateBackupFileName,
    type FileDownloadOptions,
} from "../../../stores/sites/utils/fileDownload";

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

    describe("downloadFile", () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it("should download file with default MIME type", () => {
            const { mockCreateObjectURL, mockRevokeObjectURL, mockAnchor, mockBody } = setupDownloadMocks();

            const buffer = new ArrayBuffer(8);
            const options: FileDownloadOptions = {
                buffer,
                fileName: "test.txt",
            };

            downloadFile(options);

            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
            expect(mockAnchor.href).toBe("blob:mock-url");
            expect(mockAnchor.download).toBe("test.txt");
            expect(mockAnchor.style.display).toBe("none");
            expect(mockBody.appendChild).toHaveBeenCalledWith(mockAnchor);
            expect(mockAnchor.click).toHaveBeenCalledOnce();
            expect(mockBody.removeChild).toHaveBeenCalledWith(mockAnchor);
            expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
        });

        it("should download file with custom MIME type", () => {
            const { mockCreateObjectURL, mockAnchor } = setupDownloadMocks();

            const buffer = new ArrayBuffer(8);
            const options: FileDownloadOptions = {
                buffer,
                fileName: "test.json",
                mimeType: "application/json",
            };

            downloadFile(options);

            expect(mockCreateObjectURL).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "application/json",
                })
            );
            expect(mockAnchor.download).toBe("test.json");
        });

        it("should handle empty buffer", () => {
            const { mockCreateObjectURL, mockAnchor } = setupDownloadMocks();

            const buffer = new ArrayBuffer(0);
            const options: FileDownloadOptions = {
                buffer,
                fileName: "empty.txt",
            };

            downloadFile(options);

            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
            expect(mockAnchor.click).toHaveBeenCalledOnce();
        });

        it("should handle missing document.body", () => {
            const { mockCreateObjectURL, mockRevokeObjectURL, mockAnchor } = setupDownloadMocks();

            // Remove document.body
            Object.defineProperty(document, "body", {
                value: null,
                writable: true,
                configurable: true,
            });

            const buffer = new ArrayBuffer(8);
            const options: FileDownloadOptions = {
                buffer,
                fileName: "test.txt",
            };

            downloadFile(options);

            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
            expect(mockAnchor.click).toHaveBeenCalledOnce();
            expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
        });

        it("should handle DOM manipulation errors with fallback", () => {
            const { mockCreateObjectURL, mockRevokeObjectURL, mockAnchor, mockBody } = setupDownloadMocks();

            // Mock appendChild to throw
            mockBody.appendChild.mockImplementation(() => {
                throw new Error("appendChild failed");
            });

            // Mock console.warn to suppress expected warning
            const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            const buffer = new ArrayBuffer(8);
            const options: FileDownloadOptions = {
                buffer,
                fileName: "test.txt",
            };

            downloadFile(options);

            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
            expect(mockAnchor.click).toHaveBeenCalledTimes(1); // Fallback click only
            expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                "DOM manipulation failed, using fallback click",
                expect.any(Error)
            );

            consoleWarnSpy.mockRestore();
        });

        it("should throw error when createObjectURL fails", () => {
            setupDownloadMocks();

            // Mock createObjectURL to throw
            global.URL.createObjectURL = vi.fn().mockImplementation(() => {
                throw new Error("createObjectURL failed");
            });

            const buffer = new ArrayBuffer(8);
            const options: FileDownloadOptions = {
                buffer,
                fileName: "test.txt",
            };

            expect(() => downloadFile(options)).toThrow("createObjectURL failed");
        });

        it("should throw error when createElement fails", () => {
            setupDownloadMocks();

            // Mock createElement to throw
            const mockCreateElement = vi.fn().mockImplementation(() => {
                throw new Error("createElement not available");
            });
            Object.defineProperty(document, "createElement", {
                value: mockCreateElement,
                writable: true,
                configurable: true,
            });

            const buffer = new ArrayBuffer(8);
            const options: FileDownloadOptions = {
                buffer,
                fileName: "test.txt",
            };

            expect(() => downloadFile(options)).toThrow("createElement not available");
        });

        it("should throw error when click fails", () => {
            const { mockAnchor } = setupDownloadMocks();

            // Mock click to throw
            mockAnchor.click.mockImplementation(() => {
                throw new Error("Click failed");
            });

            const buffer = new ArrayBuffer(8);
            const options: FileDownloadOptions = {
                buffer,
                fileName: "test.txt",
            };

            expect(() => downloadFile(options)).toThrow("Click failed");
        });

        it("should handle appendChild error with fallback success", () => {
            const { mockAnchor, mockBody } = setupDownloadMocks();

            // Mock appendChild to throw
            mockBody.appendChild.mockImplementation(() => {
                throw new Error("appendChild failed");
            });

            // Mock the fallback click to succeed
            mockAnchor.click.mockImplementation(() => {
                // Success - no throw
            });

            const buffer = new ArrayBuffer(8);
            const options: FileDownloadOptions = {
                buffer,
                fileName: "test.txt",
            };

            expect(() => downloadFile(options)).not.toThrow();
            expect(mockAnchor.click).toHaveBeenCalled();
        });

        it("should handle appendChild error with fallback failure and proper error handling", () => {
            const { mockAnchor, mockBody } = setupDownloadMocks();
            const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            // Mock appendChild to throw
            mockBody.appendChild.mockImplementation(() => {
                throw new Error("appendChild failed");
            });

            // Mock the anchor click to also fail in the fallback
            mockAnchor.click.mockImplementation(() => {
                throw new Error("Click failed");
            });

            const buffer = new ArrayBuffer(8);
            const options: FileDownloadOptions = {
                buffer,
                fileName: "test.txt",
            };

            // The actual behavior: warns about DOM manipulation failure, then throws "Click failed"
            expect(() => downloadFile(options)).toThrow("Click failed");
            expect(consoleSpy).toHaveBeenCalledWith("DOM manipulation failed, using fallback click", expect.any(Error));

            consoleSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });

        it("should handle non-appendChild errors with proper logging", () => {
            const { mockBody } = setupDownloadMocks();
            const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            // Mock appendChild to throw a different error
            mockBody.appendChild.mockImplementation(() => {
                throw new Error("Some other error");
            });

            const buffer = new ArrayBuffer(8);
            const options: FileDownloadOptions = {
                buffer,
                fileName: "test.txt",
            };

            // For DOM manipulation errors, the function should warn and continue with fallback
            expect(() => downloadFile(options)).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith("DOM manipulation failed, using fallback click", expect.any(Error));

            consoleSpy.mockRestore();
        });

        it("should handle large files", () => {
            const { mockCreateObjectURL, mockAnchor } = setupDownloadMocks();

            const buffer = new ArrayBuffer(1024 * 1024 * 10); // 10MB
            const options: FileDownloadOptions = {
                buffer,
                fileName: "large-file.bin",
                mimeType: "application/octet-stream",
            };

            downloadFile(options);

            expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
            expect(mockAnchor.click).toHaveBeenCalledOnce();
        });

        it("should handle special characters in filename", () => {
            const { mockAnchor } = setupDownloadMocks();

            const buffer = new ArrayBuffer(8);
            const options: FileDownloadOptions = {
                buffer,
                fileName: "test file with spaces & special chars.txt",
            };

            downloadFile(options);

            expect(mockAnchor.download).toBe("test file with spaces & special chars.txt");
        });
    });

    describe("generateBackupFileName", () => {
        beforeEach(() => {
            vi.clearAllMocks();
            // Mock Date to return consistent timestamp
            vi.useFakeTimers();
            vi.setSystemTime(new Date("2023-12-15T10:30:00Z"));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("should generate filename with default parameters", () => {
            const fileName = generateBackupFileName();

            expect(fileName).toBe("backup-2023-12-15.sqlite");
        });

        it("should generate filename with custom prefix", () => {
            const fileName = generateBackupFileName("database");

            expect(fileName).toBe("database-2023-12-15.sqlite");
        });

        it("should generate filename with custom extension", () => {
            const fileName = generateBackupFileName("backup", "db");

            expect(fileName).toBe("backup-2023-12-15.db");
        });

        it("should generate filename with custom prefix and extension", () => {
            const fileName = generateBackupFileName("myapp", "json");

            expect(fileName).toBe("myapp-2023-12-15.json");
        });

        it("should handle empty prefix", () => {
            const fileName = generateBackupFileName("");

            expect(fileName).toBe("-2023-12-15.sqlite");
        });

        it("should handle empty extension", () => {
            const fileName = generateBackupFileName("backup", "");

            expect(fileName).toBe("backup-2023-12-15.");
        });

        it("should handle special characters in prefix", () => {
            const fileName = generateBackupFileName("my-app_backup");

            expect(fileName).toBe("my-app_backup-2023-12-15.sqlite");
        });

        it("should generate different filenames for different dates", () => {
            const fileName1 = generateBackupFileName();

            // Change date
            vi.setSystemTime(new Date("2023-12-16T10:30:00Z"));

            const fileName2 = generateBackupFileName();

            expect(fileName1).toBe("backup-2023-12-15.sqlite");
            expect(fileName2).toBe("backup-2023-12-16.sqlite");
            expect(fileName1).not.toBe(fileName2);
        });

        it("should handle leap year date", () => {
            vi.setSystemTime(new Date("2024-02-29T10:30:00Z"));

            const fileName = generateBackupFileName();

            expect(fileName).toBe("backup-2024-02-29.sqlite");
        });

        it("should handle year boundary", () => {
            vi.setSystemTime(new Date("2023-12-31T23:59:59Z"));

            const fileName = generateBackupFileName();

            expect(fileName).toBe("backup-2023-12-31.sqlite");
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
});
