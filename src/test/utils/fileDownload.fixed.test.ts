/**
 * Fixed tests for fileDownload utility to improve coverage Tests all edge
 * cases, error conditions, and function paths
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import {
    downloadFile,
    generateBackupFileName,
    handleSQLiteBackupDownload,
} from "../../stores/sites/utils/fileDownload";

// Mock the logger service
vi.mock("../../../services/logger", () => ({
    logger: {
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
            type: options?.type ?? "",
            size: 100,
        })) as any;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("downloadFile Function", () => {
        it("should successfully download file with all parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Loading", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";
            const mimeType = "text/plain";

            downloadFile({ buffer, fileName, mimeType });

            expect(globalThis.Blob).toHaveBeenCalledWith([buffer], {
                type: mimeType,
            });
            expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
            expect(globalThis.document.createElement).toHaveBeenCalledWith("a");
            expect(mockAnchor.href).toBe("mock-object-url");
            expect(mockAnchor.download).toBe(fileName);
            expect(globalThis.document.body.append).toHaveBeenCalledWith(
                mockAnchor
            );
            expect(mockAnchor.click).toHaveBeenCalled();
            expect(mockAnchor.remove).toHaveBeenCalled();
            expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(
                "mock-object-url"
            );
        });

        it("should use default mimeType when not provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            downloadFile({ buffer, fileName });

            expect(globalThis.Blob).toHaveBeenCalledWith([buffer], {
                type: "application/octet-stream",
            });
        });

        it("should handle DOM manipulation errors with fallback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle createObjectURL errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            globalThis.URL.createObjectURL = vi.fn().mockImplementation(() => {
                throw new Error("createObjectURL failed");
            });

            expect(() => downloadFile({ buffer, fileName })).toThrow();
        });

        it("should handle createElement errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            globalThis.document.createElement = vi
                .fn()
                .mockImplementation(() => {
                    throw new Error("createElement failed");
                });

            expect(() => downloadFile({ buffer, fileName })).toThrow();
        });

        it("should handle appendChild errors with fallback attempt", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            // Mock append to throw appendChild specific error
            globalThis.document.body.append = vi.fn().mockImplementation(() => {
                throw new Error("appendChild failed");
            });

            // The fallback will try the same createAndTriggerDownload again, so append will fail again
            // This means the fallback also fails and should throw "File download failed"
            expect(() => downloadFile({ buffer, fileName })).toThrow(
                "File download failed"
            );

            // Verify that append was called (indicating both primary and fallback attempts)
            expect(globalThis.document.body.append).toHaveBeenCalled();
        });

        it("should clean up object URL even when errors occur", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

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

            expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(
                "mock-object-url"
            );
        });

        it("should handle non-Error objects in catch blocks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            globalThis.document.body.append = vi.fn().mockImplementation(() => {
                throw "String error";
            });

            downloadFile({ buffer, fileName });
            expect(mockAnchor.click).toHaveBeenCalled();
        });

        describe("Property-based Tests", () => {
            test.prop([
                fc.uint8Array({ minLength: 0, maxLength: 1000 }),
                fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
                fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.includes("/"))
            ])(
                "should handle various buffer, filename, and MIME type combinations",
                (uint8Array, fileName, mimeType) => {
                    const buffer = uint8Array.buffer;

                    downloadFile({ buffer, fileName, mimeType });

                    expect(globalThis.Blob).toHaveBeenCalledWith([buffer], {
                        type: mimeType,
                    });
                    expect(mockAnchor.download).toBe(fileName);
                    expect(mockAnchor.click).toHaveBeenCalled();
                    expect(mockAnchor.remove).toHaveBeenCalled();
                }
            );

            test.prop([
                fc.uint8Array({ minLength: 0, maxLength: 500 }),
                fc.string({ minLength: 1, maxLength: 50 })
                    .filter((s) => s.trim().length > 0)
                    .filter((s) => !s.includes("/") && !s.includes("\\"))
            ])(
                "should use default MIME type when not specified",
                (uint8Array, fileName) => {
                    const buffer = uint8Array.buffer;

                    downloadFile({ buffer, fileName });

                    expect(globalThis.Blob).toHaveBeenCalledWith([buffer], {
                        type: "application/octet-stream",
                    });
                    expect(mockAnchor.download).toBe(fileName);
                    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
                }
            );

            test.prop([
                fc.uint8Array({ minLength: 1, maxLength: 100 })
            ])(
                "should handle various buffer sizes and always create blob URL",
                (uint8Array) => {
                    const buffer = uint8Array.buffer;
                    const fileName = "test-file.bin";

                    downloadFile({ buffer, fileName });

                    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
                    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith("mock-object-url");
                    expect(mockAnchor.href).toBe("mock-object-url");
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 200 })
                    .filter((s) => s.trim().length > 0)
            ])(
                "should handle various filename lengths and formats",
                (fileName) => {
                    const buffer = new ArrayBuffer(10);

                    downloadFile({ buffer, fileName });

                    expect(mockAnchor.download).toBe(fileName);
                    expect(globalThis.document.body.append).toHaveBeenCalledWith(mockAnchor);
                    expect(mockAnchor.click).toHaveBeenCalled();
                }
            );
        });
    });

    describe("generateBackupFileName Function", () => {
        it("should generate filename with default parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateBackupFileName();
            expect(result).toMatch(/^backup-\d{4}-\d{2}-\d{2}\.sqlite$/);
        });

        it("should generate filename with custom prefix", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateBackupFileName("custom");
            expect(result).toMatch(/^custom-\d{4}-\d{2}-\d{2}\.sqlite$/);
        });

        it("should generate filename with custom extension", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateBackupFileName("backup", "db");
            expect(result).toMatch(/^backup-\d{4}-\d{2}-\d{2}\.db$/);
        });

        it("should generate filename with both custom parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateBackupFileName("myapp", "sqlite3");
            expect(result).toMatch(/^myapp-\d{4}-\d{2}-\d{2}\.sqlite3$/);
        });

        it("should handle empty string parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateBackupFileName("", "");
            expect(result).toMatch(/^-\d{4}-\d{2}-\d{2}\.$/);
        });

        it("should handle special characters in parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateBackupFileName("test-app", "db.sqlite");
            expect(result).toMatch(/^test-app-\d{4}-\d{2}-\d{2}\.db\.sqlite$/);
        });

        describe("Property-based Tests", () => {
            test.prop([
                fc.string({ maxLength: 50 }).filter((s) => !s.includes("-")),
                fc.string({ maxLength: 20 }).filter((s) => !s.includes(".") && s.length > 0)
            ])(
                "should generate filename with custom prefix and extension",
                (prefix, extension) => {
                    const result = generateBackupFileName(prefix, extension);
                    const escapedPrefix = prefix.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);
                    const escapedExtension = extension.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);
                    const expectedPattern = new RegExp(String.raw`^${escapedPrefix}-\d{4}-\d{2}-\d{2}\.${escapedExtension}$`);
                    expect(result).toMatch(expectedPattern);
                }
            );

            test.prop([fc.string({ maxLength: 30 })])(
                "should always include timestamp in YYYY-MM-DD format",
                (prefix) => {
                    const result = generateBackupFileName(prefix);

                    // Extract the timestamp part
                    const timestampMatch = result.match(/-(?<timestamp>\d{4}-\d{2}-\d{2})\./);
                    expect(timestampMatch).not.toBeNull();

                    if (timestampMatch?.groups) {
                        const { timestamp } = timestampMatch.groups;
                        const [year, month, day] = timestamp.split('-');

                        // Validate timestamp format
                        expect(Number(year)).toBeGreaterThanOrEqual(2000);
                        expect(Number(year)).toBeLessThanOrEqual(3000);
                        expect(Number(month)).toBeGreaterThanOrEqual(1);
                        expect(Number(month)).toBeLessThanOrEqual(12);
                        expect(Number(day)).toBeGreaterThanOrEqual(1);
                        expect(Number(day)).toBeLessThanOrEqual(31);
                    }
                }
            );

            test.prop([fc.string({ maxLength: 10 })])(
                "should handle various prefix lengths and always return string",
                (prefix) => {
                    const result = generateBackupFileName(prefix);

                    expect(typeof result).toBe("string");
                    expect(result.length).toBeGreaterThan(0);
                    expect(result).toMatch(/-\d{4}-\d{2}-\d{2}\./);
                }
            );

            test.prop([
                fc.string({ maxLength: 15 }),
                fc.string({ maxLength: 15 })
            ])(
                "should produce consistent format regardless of input",
                (prefix, extension) => {
                    const result = generateBackupFileName(prefix, extension);

                    expect(typeof result).toBe("string");

                    // Should contain exactly one timestamp
                    const timestampMatches = result.match(/-\d{4}-\d{2}-\d{2}\./g);
                    expect(timestampMatches).toHaveLength(1);

                    // Should start with prefix (or empty) and end with extension (or default)
                    const parts = result.split('-');
                    expect(parts.length).toBeGreaterThanOrEqual(4); // prefix, year, month, day+extension
                }
            );
        });
    });

    describe("handleSQLiteBackupDownload Function", () => {
        it("should handle successful backup download", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Backup Operation", "type");

            const mockData = new Uint8Array([
                1,
                2,
                3,
                4,
            ]);
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);

            await handleSQLiteBackupDownload(mockDownloadFunction);

            expect(mockDownloadFunction).toHaveBeenCalled();
            expect(globalThis.Blob).toHaveBeenCalledWith([mockData], {
                type: "application/x-sqlite3",
            });
            expect(mockAnchor.download).toMatch(
                /^uptime-watcher-\d{4}-\d{2}-\d{2}\.db$/
            );
            expect(mockAnchor.click).toHaveBeenCalled();
        });

        it("should throw TypeError for invalid backup data type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockDownloadFunction = vi
                .fn()
                .mockResolvedValue("invalid data");

            await expect(
                handleSQLiteBackupDownload(mockDownloadFunction)
            ).rejects.toThrow(TypeError);
            await expect(
                handleSQLiteBackupDownload(mockDownloadFunction)
            ).rejects.toThrow("Invalid backup data received");
        });

        it("should throw TypeError for null backup data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockDownloadFunction = vi.fn().mockResolvedValue(null);

            await expect(
                handleSQLiteBackupDownload(mockDownloadFunction)
            ).rejects.toThrow(TypeError);
        });

        it("should throw TypeError for undefined backup data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockDownloadFunction = vi.fn().mockResolvedValue(undefined);

            await expect(
                handleSQLiteBackupDownload(mockDownloadFunction)
            ).rejects.toThrow(TypeError);
        });

        it("should throw TypeError for array instead of Uint8Array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockDownloadFunction = vi.fn().mockResolvedValue([
                1,
                2,
                3,
                4,
            ]);

            await expect(
                handleSQLiteBackupDownload(mockDownloadFunction)
            ).rejects.toThrow(TypeError);
        });

        it("should handle empty Uint8Array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockData = new Uint8Array(0);
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);

            await handleSQLiteBackupDownload(mockDownloadFunction);

            expect(globalThis.Blob).toHaveBeenCalledWith([mockData], {
                type: "application/x-sqlite3",
            });
            expect(mockAnchor.click).toHaveBeenCalled();
        });

        it("should handle click errors with proper error message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockData = new Uint8Array([
                1,
                2,
                3,
                4,
            ]);
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);

            mockAnchor.click = vi.fn().mockImplementation(() => {
                throw new Error("Click failed");
            });

            await expect(
                handleSQLiteBackupDownload(mockDownloadFunction)
            ).rejects.toThrow("Download trigger failed");
        });

        it("should handle non-Error click failures", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockData = new Uint8Array([
                1,
                2,
                3,
                4,
            ]);
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);

            mockAnchor.click = vi.fn().mockImplementation(() => {
                throw "String error";
            });

            await expect(
                handleSQLiteBackupDownload(mockDownloadFunction)
            ).rejects.toThrow("Download trigger failed");
        });

        it("should clean up object URL even when click fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const mockData = new Uint8Array([
                1,
                2,
                3,
                4,
            ]);
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);

            mockAnchor.click = vi.fn().mockImplementation(() => {
                throw new Error("Click failed");
            });

            try {
                await handleSQLiteBackupDownload(mockDownloadFunction);
            } catch {
                // Expected to fail
            }

            expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(
                "mock-object-url"
            );
        });

        it("should use correct filename format", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const mockData = new Uint8Array([
                1,
                2,
                3,
                4,
            ]);
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);

            await handleSQLiteBackupDownload(mockDownloadFunction);

            expect(mockAnchor.download).toMatch(
                /^uptime-watcher-\d{4}-\d{2}-\d{2}\.db$/
            );
        });

        it("should handle download function rejection", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Loading", "type");

            const mockDownloadFunction = vi
                .fn()
                .mockRejectedValue(new Error("Download failed"));

            await expect(
                handleSQLiteBackupDownload(mockDownloadFunction)
            ).rejects.toThrow("Download failed");
        });

        it("should handle large backup data", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Backup Operation", "type");

            const mockData = new Uint8Array(1_000_000); // 1MB
            const mockDownloadFunction = vi.fn().mockResolvedValue(mockData);

            await handleSQLiteBackupDownload(mockDownloadFunction);

            expect(globalThis.Blob).toHaveBeenCalledWith([mockData], {
                type: "application/x-sqlite3",
            });
            expect(mockAnchor.click).toHaveBeenCalled();
        });

        describe("Property-based Tests", () => {
            test.prop([
                fc.uint8Array({ minLength: 1, maxLength: 10_000 })
            ])(
                "should handle various backup data sizes",
                async (mockDataArray) => {
                    const mockDownloadFunction = vi.fn().mockResolvedValue(mockDataArray);

                    await handleSQLiteBackupDownload(mockDownloadFunction);

                    expect(mockDownloadFunction).toHaveBeenCalledOnce();
                    expect(globalThis.Blob).toHaveBeenCalledWith([mockDataArray], {
                        type: "application/x-sqlite3",
                    });
                    expect(mockAnchor.download).toMatch(
                        /^uptime-watcher-\d{4}-\d{2}-\d{2}\.db$/
                    );
                    expect(mockAnchor.click).toHaveBeenCalled();
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 100 })
            ])(
                "should handle download function rejections with various error messages",
                async (errorMessage) => {
                    const mockDownloadFunction = vi
                        .fn()
                        .mockRejectedValue(new Error(errorMessage));

                    await expect(
                        handleSQLiteBackupDownload(mockDownloadFunction)
                    ).rejects.toThrow(errorMessage);

                    expect(mockDownloadFunction).toHaveBeenCalledOnce();
                }
            );

            test.prop([
                fc.uint8Array({ minLength: 0, maxLength: 1000 })
            ])(
                "should always use SQLite MIME type and generate proper filename",
                async (backupData) => {
                    const mockDownloadFunction = vi.fn().mockResolvedValue(backupData);

                    await handleSQLiteBackupDownload(mockDownloadFunction);

                    expect(globalThis.Blob).toHaveBeenCalledWith([backupData], {
                        type: "application/x-sqlite3",
                    });

                    // Verify filename format
                    const filename = mockAnchor.download;
                    expect(filename).toMatch(/^uptime-watcher-\d{4}-\d{2}-\d{2}\.db$/);

                    // Verify proper cleanup
                    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith(
                        "mock-object-url"
                    );
                }
            );

            test.prop([
                fc.array(fc.integer({ min: 0, max: 255 }), { minLength: 10, maxLength: 500 })
            ])(
                "should handle integer array conversion to Uint8Array",
                async (intArray) => {
                    const uint8Data = new Uint8Array(intArray);
                    const mockDownloadFunction = vi.fn().mockResolvedValue(uint8Data);

                    await handleSQLiteBackupDownload(mockDownloadFunction);

                    expect(globalThis.Blob).toHaveBeenCalledWith([uint8Data], {
                        type: "application/x-sqlite3",
                    });
                    expect(mockAnchor.href).toBe("mock-object-url");
                }
            );
        });
    });

    describe("Edge Cases and Integration Tests", () => {
        it("should handle multiple sequential downloads", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Loading", "type");

            const buffer1 = new ArrayBuffer(10);
            const buffer2 = new ArrayBuffer(20);

            downloadFile({ buffer: buffer1, fileName: "file1.txt" });
            downloadFile({ buffer: buffer2, fileName: "file2.txt" });

            expect(globalThis.URL.createObjectURL).toHaveBeenCalledTimes(2);
            expect(mockAnchor.click).toHaveBeenCalledTimes(2);
            expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledTimes(2);
        });

        it("should handle Blob creation with different data types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const buffer = new ArrayBuffer(10);
            const view = new Uint8Array(buffer);
            view[0] = 255;

            downloadFile({
                buffer,
                fileName: "binary.bin",
                mimeType: "application/octet-stream",
            });

            expect(globalThis.Blob).toHaveBeenCalledWith([buffer], {
                type: "application/octet-stream",
            });
        });

        it("should properly set anchor properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

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
