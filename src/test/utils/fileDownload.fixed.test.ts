/**
 * Fixed tests for fileDownload utility to improve coverage
 * Tests all edge cases, error conditions, and function paths
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { downloadFile, generateBackupFileName, handleSQLiteBackupDownload } from "../../stores/sites/utils/fileDownload";

// Mock the logger service
vi.mock("../../../services/logger", () => ({
    default: {
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe("File Download Utility - Fixed Coverage Tests", () => {
    let mockAnchor: any;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Mock URL API
        globalThis.URL = {
            createObjectURL: vi.fn(() => "mock-object-url"),
            revokeObjectURL: vi.fn(),
        } as any;

        // Mock anchor element
        mockAnchor = {
            href: "",
            download: "",
            style: { display: "" },
            click: vi.fn(),
            remove: vi.fn(),
        };

        // Mock document
        globalThis.document = {
            createElement: vi.fn(() => mockAnchor),
            body: {
                append: vi.fn(),
                appendChild: vi.fn(),
                removeChild: vi.fn(),
            },
        } as any;

        // Mock Blob constructor
        globalThis.Blob = vi.fn().mockImplementation((parts, options) => ({
            parts,
            options,
            type: options?.type || "",
            size: 100,
        })) as any;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("downloadFile Function", () => {
        it("should successfully download file with all parameters", () => {
            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";
            const mimeType = "text/plain";

            downloadFile({ buffer, fileName, mimeType });

            expect(globalThis.Blob).toHaveBeenCalledWith([buffer], { type: mimeType });
            expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
            expect(globalThis.document.createElement).toHaveBeenCalledWith("a");
            expect(mockAnchor.href).toBe("mock-object-url");
            expect(mockAnchor.download).toBe(fileName);
            expect(globalThis.document.body.append).toHaveBeenCalledWith(mockAnchor);
            expect(mockAnchor.click).toHaveBeenCalled();
            expect(mockAnchor.remove).toHaveBeenCalled();
            expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("mock-object-url");
        });

        it("should use default mimeType when not provided", () => {
            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            downloadFile({ buffer, fileName });

            expect(globalThis.Blob).toHaveBeenCalledWith([buffer], { type: "application/octet-stream" });
        });

        it("should handle DOM manipulation errors with fallback", () => {
            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";
            
            // Mock append to throw an error
            globalThis.document.body.append = vi.fn().mockImplementation(() => {
                throw new Error("DOM error");
            });

            downloadFile({ buffer, fileName });

            // Should still attempt click as fallback
            expect(mockAnchor.click).toHaveBeenCalled();
        });

        it("should handle createObjectURL errors", () => {
            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";
            
            globalThis.URL.createObjectURL = vi.fn().mockImplementation(() => {
                throw new Error("createObjectURL failed");
            });

            expect(() => downloadFile({ buffer, fileName })).toThrow();
        });

        it("should handle createElement errors", () => {
            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";
            
            globalThis.document.createElement = vi.fn().mockImplementation(() => {
                throw new Error("createElement failed");
            });

            expect(() => downloadFile({ buffer, fileName })).toThrow();
        });

        it("should handle appendChild errors with fallback attempt", () => {
            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";
            
            // Mock append to throw appendChild specific error
            globalThis.document.body.append = vi.fn().mockImplementation(() => {
                throw new Error("appendChild failed");
            });
            
            // The fallback will try the same createAndTriggerDownload again, so append will fail again
            // This means the fallback also fails and should throw "File download failed"
            expect(() => downloadFile({ buffer, fileName })).toThrow("File download failed");
            
            // Verify that append was called (indicating both primary and fallback attempts)
            expect(globalThis.document.body.append).toHaveBeenCalled();
        });

        it("should clean up object URL even when errors occur", () => {
            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";
            
            mockAnchor.click = vi.fn().mockImplementation(() => {
                throw new Error("Click failed");
            });

            try {
                downloadFile({ buffer, fileName });
            } catch {
                // Expected to fail
            }

            expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("mock-object-url");
        });

        it("should handle non-Error objects in catch blocks", () => {
            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";
            
            globalThis.document.body.append = vi.fn().mockImplementation(() => {
                throw "String error";
            });

            downloadFile({ buffer, fileName });
            expect(mockAnchor.click).toHaveBeenCalled();
        });
    });

    describe("generateBackupFileName Function", () => {
        it("should generate filename with default parameters", () => {
            const result = generateBackupFileName();
            expect(result).toMatch(/^backup-\d{4}-\d{2}-\d{2}\.sqlite$/);
        });

        it("should generate filename with custom prefix", () => {
            const result = generateBackupFileName("custom");
            expect(result).toMatch(/^custom-\d{4}-\d{2}-\d{2}\.sqlite$/);
        });

        it("should generate filename with custom extension", () => {
            const result = generateBackupFileName("backup", "db");
            expect(result).toMatch(/^backup-\d{4}-\d{2}-\d{2}\.db$/);
        });

        it("should generate filename with both custom parameters", () => {
            const result = generateBackupFileName("myapp", "sqlite3");
            expect(result).toMatch(/^myapp-\d{4}-\d{2}-\d{2}\.sqlite3$/);
        });

        it("should handle empty string parameters", () => {
            const result = generateBackupFileName("", "");
            expect(result).toMatch(/^-\d{4}-\d{2}-\d{2}\.$/);
        });

        it("should handle special characters in parameters", () => {
            const result = generateBackupFileName("test-app", "db.sqlite");
            expect(result).toMatch(/^test-app-\d{4}-\d{2}-\d{2}\.db\.sqlite$/);
        });
    });

    describe("handleSQLiteBackupDownload Function", () => {
        it("should handle successful backup download", async () => {
            const mockData = new Uint8Array([1, 2, 3, 4]);
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);

            await handleSQLiteBackupDownload(mockDownloadFunction);

            expect(mockDownloadFunction).toHaveBeenCalled();
            expect(globalThis.Blob).toHaveBeenCalledWith([mockData], { type: "application/x-sqlite3" });
            expect(mockAnchor.download).toMatch(/^uptime-watcher-\d{4}-\d{2}-\d{2}\.db$/);
            expect(mockAnchor.click).toHaveBeenCalled();
        });

        it("should throw TypeError for invalid backup data type", async () => {
            const mockDownloadFunction = vi.fn().mockResolvedValue("invalid data");

            await expect(handleSQLiteBackupDownload(mockDownloadFunction)).rejects.toThrow(TypeError);
            await expect(handleSQLiteBackupDownload(mockDownloadFunction)).rejects.toThrow("Invalid backup data received");
        });

        it("should throw TypeError for null backup data", async () => {
            const mockDownloadFunction = vi.fn().mockResolvedValue(null);

            await expect(handleSQLiteBackupDownload(mockDownloadFunction)).rejects.toThrow(TypeError);
        });

        it("should throw TypeError for undefined backup data", async () => {
            const mockDownloadFunction = vi.fn().mockResolvedValue(undefined);

            await expect(handleSQLiteBackupDownload(mockDownloadFunction)).rejects.toThrow(TypeError);
        });

        it("should throw TypeError for array instead of Uint8Array", async () => {
            const mockDownloadFunction = vi.fn().mockResolvedValue([1, 2, 3, 4]);

            await expect(handleSQLiteBackupDownload(mockDownloadFunction)).rejects.toThrow(TypeError);
        });

        it("should handle empty Uint8Array", async () => {
            const mockData = new Uint8Array(0);
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);

            await handleSQLiteBackupDownload(mockDownloadFunction);

            expect(globalThis.Blob).toHaveBeenCalledWith([mockData], { type: "application/x-sqlite3" });
            expect(mockAnchor.click).toHaveBeenCalled();
        });

        it("should handle click errors with proper error message", async () => {
            const mockData = new Uint8Array([1, 2, 3, 4]);
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);
            
            mockAnchor.click = vi.fn().mockImplementation(() => {
                throw new Error("Click failed");
            });

            await expect(handleSQLiteBackupDownload(mockDownloadFunction)).rejects.toThrow("Download trigger failed");
        });

        it("should handle non-Error click failures", async () => {
            const mockData = new Uint8Array([1, 2, 3, 4]);
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);
            
            mockAnchor.click = vi.fn().mockImplementation(() => {
                throw "String error";
            });

            await expect(handleSQLiteBackupDownload(mockDownloadFunction)).rejects.toThrow("Download trigger failed");
        });

        it("should clean up object URL even when click fails", async () => {
            const mockData = new Uint8Array([1, 2, 3, 4]);
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);
            
            mockAnchor.click = vi.fn().mockImplementation(() => {
                throw new Error("Click failed");
            });

            try {
                await handleSQLiteBackupDownload(mockDownloadFunction);
            } catch {
                // Expected to fail
            }

            expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("mock-object-url");
        });

        it("should use correct filename format", async () => {
            const mockData = new Uint8Array([1, 2, 3, 4]);
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);

            await handleSQLiteBackupDownload(mockDownloadFunction);

            expect(mockAnchor.download).toMatch(/^uptime-watcher-\d{4}-\d{2}-\d{2}\.db$/);
        });

        it("should handle download function rejection", async () => {
            const mockDownloadFunction = vi.fn().mockRejectedValue(new Error("Download failed"));

            await expect(handleSQLiteBackupDownload(mockDownloadFunction)).rejects.toThrow("Download failed");
        });

        it("should handle large backup data", async () => {
            const mockData = new Uint8Array(1_000_000); // 1MB
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);

            await handleSQLiteBackupDownload(mockDownloadFunction);

            expect(globalThis.Blob).toHaveBeenCalledWith([mockData], { type: "application/x-sqlite3" });
            expect(mockAnchor.click).toHaveBeenCalled();
        });
    });

    describe("Edge Cases and Integration Tests", () => {
        it("should handle multiple sequential downloads", () => {
            const buffer1 = new ArrayBuffer(10);
            const buffer2 = new ArrayBuffer(20);

            downloadFile({ buffer: buffer1, fileName: "file1.txt" });
            downloadFile({ buffer: buffer2, fileName: "file2.txt" });

            expect(globalThis.URL.createObjectURL).toHaveBeenCalledTimes(2);
            expect(mockAnchor.click).toHaveBeenCalledTimes(2);
            expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledTimes(2);
        });

        it("should handle Blob creation with different data types", () => {
            const buffer = new ArrayBuffer(10);
            const view = new Uint8Array(buffer);
            view[0] = 255;

            downloadFile({ buffer, fileName: "binary.bin", mimeType: "application/octet-stream" });

            expect(globalThis.Blob).toHaveBeenCalledWith([buffer], { type: "application/octet-stream" });
        });

        it("should properly set anchor properties", () => {
            const buffer = new ArrayBuffer(10);
            const fileName = "test-file.txt";
            const mimeType = "text/plain";

            downloadFile({ buffer, fileName, mimeType });

            expect(mockAnchor.href).toBe("mock-object-url");
            expect(mockAnchor.download).toBe(fileName);
            expect(mockAnchor.style.display).toBe("none");
        });
    });
});
