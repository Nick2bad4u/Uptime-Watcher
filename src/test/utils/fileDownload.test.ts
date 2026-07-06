/**
 * Tests for the file download utilities.
 *
 * Covers edge cases around DOM interactions, resource cleanup, and serialized
 * SQLite backup download payload handling.
 */

import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

import { test } from "@fast-check/vitest";
import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import * as fc from "fast-check";
import { arrayJoin } from "ts-extras";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
    downloadFile,
    generateBackupFileName,
    handleSQLiteBackupDownload,
} from "../../stores/sites/utils/fileDownload";

// Mock the logger service
vi.mock("../../../services/logger", () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

const originalBlob = Blob;
const originalDocument = document;
const originalUrl = URL;

const waitForDeferredObjectUrlCleanup = async (): Promise<void> => {
    await new Promise<void>((resolve) => {
        globalThis.setTimeout(resolve, 0);
    });
};

const isSafeDownloadFileName = (fileName: string): boolean => {
    const trimmedFileName = fileName.trim();
    const reservedCharacters = [
        '"',
        "*",
        ":",
        "<",
        ">",
        "?",
        "|",
        "/",
        "\\",
    ];

    return (
        trimmedFileName.length > 0 &&
        trimmedFileName === fileName &&
        trimmedFileName !== "." &&
        trimmedFileName !== ".." &&
        !trimmedFileName.endsWith(".") &&
        !hasAsciiControlCharacters(trimmedFileName) &&
        reservedCharacters.every(
            (character) => !trimmedFileName.includes(character)
        ) &&
        !/^(?:aux|com[1-9]|con|lpt[1-9]|nul|prn)(?:\.|$)/iu.test(
            trimmedFileName
        )
    );
};

const safeFileNameArbitrary = fc
    .string({ maxLength: 100, minLength: 1 })
    .filter(isSafeDownloadFileName);

const SAFE_BACKUP_FILE_NAME_PART_CHARACTERS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";

const safeBackupPrefixArbitrary = fc
    .array(fc.constantFrom(...SAFE_BACKUP_FILE_NAME_PART_CHARACTERS), {
        maxLength: 50,
        minLength: 0,
    })
    .map((characters) => arrayJoin(characters, ""))
    .filter((prefix) => isSafeDownloadFileName(`${prefix}-2000-01-01.sqlite`));

const safeBackupExtensionArbitrary = fc
    .array(fc.constantFrom(...SAFE_BACKUP_FILE_NAME_PART_CHARACTERS), {
        maxLength: 20,
        minLength: 1,
    })
    .map((characters) => arrayJoin(characters, ""))
    .filter((extension) =>
        isSafeDownloadFileName(`backup-2000-01-01.${extension}`)
    );

describe("file Download Utility", () => {
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
            click: vi.fn(),
            download: "",
            href: "",
            remove: vi.fn(),
            style: { display: "" },
        };

        // Mock document
        globalThis.document = {
            body: {
                append: vi.fn(),
                appendChild: vi.fn(),
                removeChild: vi.fn(),
            },
            createElement: vi.fn(() => mockAnchor),
        } as any;

        // Mock Blob constructor with a newable factory to satisfy `new Blob()` usage
        globalThis.Blob = vi.fn(function MockBlob(
            parts: unknown[],
            options?: BlobPropertyBag
        ) {
            return {
                options,
                parts,
                size: 100,
                type: options?.type ?? "",
            } satisfies {
                options: BlobPropertyBag | undefined;
                parts: unknown[];
                size: number;
                type: string;
            };
        }) as unknown as typeof Blob;
    });

    afterEach(async () => {
        await waitForDeferredObjectUrlCleanup();

        vi.clearAllMocks();
        if (originalBlob) {
            globalThis.Blob = originalBlob;
        } else {
            delete (globalThis as { Blob?: typeof Blob }).Blob;
        }

        if (originalDocument) {
            globalThis.document = originalDocument;
        } else {
            delete (globalThis as { document?: Document }).document;
        }

        if (originalUrl) {
            globalThis.URL = originalUrl;
        } else {
            delete (globalThis as { URL?: typeof URL }).URL;
        }
    });

    describe("downloadFile Function", () => {
        it("should successfully download file with all parameters", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Loading", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";
            const mimeType = "text/plain";

            downloadFile({ buffer, fileName, mimeType });
            await waitForDeferredObjectUrlCleanup();

            expect(Blob).toHaveBeenCalledWith([buffer], {
                type: mimeType,
            });
            expect(URL.createObjectURL).toHaveBeenCalled();
            expect(document.createElement).toHaveBeenCalledWith("a");
            expect(mockAnchor.href).toBe("mock-object-url");
            expect(mockAnchor.download).toBe(fileName);
            expect(document.body.append).toHaveBeenCalledWith(mockAnchor);
            expect(mockAnchor.click).toHaveBeenCalled();
            expect(mockAnchor.remove).toHaveBeenCalled();
            expect(URL.revokeObjectURL).toHaveBeenCalledWith("mock-object-url");
        });

        it("should use default mimeType when not provided", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            downloadFile({ buffer, fileName });

            expect(Blob).toHaveBeenCalledWith([buffer], {
                type: "application/octet-stream",
            });
        });

        it("should fall back when the filename is not a safe file segment", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "security");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Input Validation", "type");

            const unsafeFileNames = [
                "../secret.txt",
                String.raw`..\secret.txt`,
                "CON.txt",
                "report:",
                "bad\u0000name.txt",
                ".",
                "..",
                "trailing.",
            ];

            for (const fileName of unsafeFileNames) {
                vi.clearAllMocks();
                const buffer = new ArrayBuffer(10);

                downloadFile({ buffer, fileName });

                expect(mockAnchor.download).toBe("download.bin");
                expect(mockAnchor.click).toHaveBeenCalled();
            }
        });

        it("should handle DOM manipulation errors with fallback", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            // Mock append to throw an error
            vi.spyOn(document.body, "append").mockImplementation(() => {
                throw new Error("DOM error");
            });

            downloadFile({ buffer, fileName });

            // Should still attempt click as fallback
            expect(mockAnchor.click).toHaveBeenCalled();
        });

        it("should handle createObjectURL errors", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
                throw new Error("createObjectURL failed");
            });

            expect(() => {
                downloadFile({ buffer, fileName });
            }).toThrow();
        });

        it("should handle createElement errors", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            vi.spyOn(document, "createElement").mockImplementation(() => {
                throw new Error("createElement failed");
            });

            expect(() => {
                downloadFile({ buffer, fileName });
            }).toThrow();
        });

        it("should classify document access errors during anchor creation", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";
            const originalDocument = Object.getOwnPropertyDescriptor(
                globalThis,
                "document"
            );

            Object.defineProperty(globalThis, "document", {
                configurable: true,
                get() {
                    throw new Error("document unavailable");
                },
            });

            try {
                expect(() => {
                    downloadFile({ buffer, fileName });
                }).toThrow("createElement not available");
            } finally {
                if (originalDocument) {
                    Object.defineProperty(
                        globalThis,
                        "document",
                        originalDocument
                    );
                } else {
                    Reflect.deleteProperty(globalThis, "document");
                }
            }
        });

        it("should handle appendChild errors with fallback attempt", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            // Mock append to throw appendChild specific error
            vi.spyOn(document.body, "append").mockImplementation(() => {
                throw new Error("appendChild failed");
            });

            // The fallback will try the same createAndTriggerDownload again, so append will fail again
            // This means the fallback also fails and should throw "File download failed"
            // Fallback retry uses a direct click without DOM attachment.
            expect(() => {
                downloadFile({ buffer, fileName });
            }).not.toThrow();

            // Verify that append was called (indicating both primary and fallback attempts)
            expect(document.body.append).toHaveBeenCalled();
        });

        it("should handle document body access errors with fallback attempt", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            Object.defineProperty(globalThis.document, "body", {
                configurable: true,
                get() {
                    throw new Error("document body unavailable");
                },
            });

            expect(() => {
                downloadFile({ buffer, fileName });
            }).not.toThrow();

            expect(mockAnchor.click).toHaveBeenCalled();
        });

        it("should clean up object URL even when errors occur", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            vi.spyOn(mockAnchor, "click").mockImplementation(() => {
                throw new Error("Click failed");
            });

            try {
                downloadFile({ buffer, fileName });
            } catch {
                // Expected to fail
            }

            expect(mockAnchor.click).toHaveBeenCalledTimes(1);
            expect(URL.revokeObjectURL).toHaveBeenCalledWith("mock-object-url");
        });

        it("should handle non-Error objects in catch blocks", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const buffer = new ArrayBuffer(10);
            const fileName = "test.txt";

            vi.spyOn(document.body, "append").mockImplementation(() => {
                throw "String error";
            });

            downloadFile({ buffer, fileName });

            expect(mockAnchor.click).toHaveBeenCalled();
        });

        describe("property-based Tests", () => {
            test.prop([
                fc.uint8Array({ maxLength: 1000, minLength: 0 }),
                safeFileNameArbitrary,
                fc
                    .string({ maxLength: 50, minLength: 1 })
                    .filter((s) => s.includes("/")),
            ])(
                "should handle various buffer, filename, and MIME type combinations",
                (uint8Array, fileName, mimeType) => {
                    const buffer = uint8Array.buffer;

                    downloadFile({ buffer, fileName, mimeType });

                    expect(Blob).toHaveBeenCalledWith([buffer], {
                        type: mimeType,
                    });
                    expect(mockAnchor.download).toBe(fileName);
                    expect(mockAnchor.click).toHaveBeenCalled();
                    expect(mockAnchor.remove).toHaveBeenCalled();
                }
            );

            test.prop([
                fc.uint8Array({ maxLength: 500, minLength: 0 }),
                safeFileNameArbitrary,
            ])(
                "should use default MIME type when not specified",
                (uint8Array, fileName) => {
                    const buffer = uint8Array.buffer;

                    downloadFile({ buffer, fileName });

                    expect(Blob).toHaveBeenCalledWith([buffer], {
                        type: "application/octet-stream",
                    });
                    expect(mockAnchor.download).toBe(fileName);
                    expect(URL.createObjectURL).toHaveBeenCalled();
                }
            );

            test.prop([fc.uint8Array({ maxLength: 100, minLength: 1 })])(
                "should handle various buffer sizes and always create blob URL",
                async (uint8Array) => {
                    const buffer = uint8Array.buffer;
                    const fileName = "test-file.bin";

                    downloadFile({ buffer, fileName });
                    await waitForDeferredObjectUrlCleanup();

                    expect(URL.createObjectURL).toHaveBeenCalled();
                    expect(URL.revokeObjectURL).toHaveBeenCalledWith(
                        "mock-object-url"
                    );
                    expect(mockAnchor.href).toBe("mock-object-url");
                }
            );

            test.prop([
                fc
                    .string({ maxLength: 200, minLength: 1 })
                    .filter(isSafeDownloadFileName),
            ])(
                "should handle various filename lengths and formats",
                (fileName) => {
                    const buffer = new ArrayBuffer(10);

                    downloadFile({ buffer, fileName });

                    expect(mockAnchor.download).toBe(fileName);
                    expect(document.body.append).toHaveBeenCalledWith(
                        mockAnchor
                    );
                    expect(mockAnchor.click).toHaveBeenCalled();
                }
            );
        });
    });

    describe("generateBackupFileName Function", () => {
        it("should generate filename with default parameters", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateBackupFileName();

            expect(result).toMatch(/^backup-\d{4}-\d{2}-\d{2}\.sqlite$/u);
        });

        it("should generate filename with custom prefix", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateBackupFileName("custom");

            expect(result).toMatch(/^custom-\d{4}-\d{2}-\d{2}\.sqlite$/u);
        });

        it("should generate filename with custom extension", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateBackupFileName("backup", "db");

            expect(result).toMatch(/^backup-\d{4}-\d{2}-\d{2}\.db$/u);
        });

        it("should generate filename with both custom parameters", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateBackupFileName("myapp", "sqlite3");

            expect(result).toMatch(/^myapp-\d{4}-\d{2}-\d{2}\.sqlite3$/u);
        });

        it("should handle empty string parameters", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateBackupFileName("", "");

            expect(result).toMatch(/^backup-\d{4}-\d{2}-\d{2}\.sqlite$/u);
        });

        it("should handle special characters in parameters", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = generateBackupFileName("test-app", "db.sqlite");

            expect(result).toMatch(/^test-app-\d{4}-\d{2}-\d{2}\.db\.sqlite$/u);
        });

        it.each([
            ["../backup", "sqlite"],
            [String.raw`..\backup`, "sqlite"],
            [" backup", "sqlite"],
            ["backup", ""],
            ["backup", "db."],
            ["backup", "db\nsqlite"],
            ["backup", "db:sqlite"],
        ])(
            "should fall back when generated filename parts are unsafe: %s %s",
            (prefix, extension) => {
                const result = generateBackupFileName(prefix, extension);

                expect(result).toMatch(/^backup-\d{4}-\d{2}-\d{2}\.sqlite$/u);
            }
        );

        describe("property-based Tests", () => {
            test.prop([
                safeBackupPrefixArbitrary,
                safeBackupExtensionArbitrary,
            ])(
                "should generate filename with custom prefix and extension",
                (prefix, extension) => {
                    const result = generateBackupFileName(prefix, extension);
                    const escapedPrefix = prefix.replaceAll(
                        /[$()*+.?[\\\]^{|}]/gu,
                        String.raw`\$&`
                    );
                    const escapedExtension = extension.replaceAll(
                        /[$()*+.?[\\\]^{|}]/gu,
                        String.raw`\$&`
                    );
                    const expectedPattern = new RegExp(
                        String.raw`^${escapedPrefix}-\d{4}-\d{2}-\d{2}\.${escapedExtension}$`
                    );

                    expect(result).toMatch(expectedPattern);
                }
            );

            test.prop([fc.string({ maxLength: 30 })])(
                "should always include timestamp in YYYY-MM-DD format",
                (prefix) => {
                    const result = generateBackupFileName(prefix);

                    // Extract the timestamp part
                    const timestampMatch =
                        /-(?<timestamp>\d{4}-\d{2}-\d{2})\./.exec(result);

                    expect(timestampMatch).not.toBeNull();

                    if (timestampMatch?.groups) {
                        const { timestamp } = timestampMatch.groups;
                        if (timestamp) {
                            const [
                                year,
                                month,
                                day,
                            ] = timestamp.split("-");

                            // Validate timestamp format
                            expect(Number(year)).toBeGreaterThanOrEqual(2000);
                            expect(Number(year)).toBeLessThanOrEqual(3000);
                            expect(Number(month)).toBeGreaterThanOrEqual(1);
                            expect(Number(month)).toBeLessThanOrEqual(12);
                            expect(Number(day)).toBeGreaterThanOrEqual(1);
                            expect(Number(day)).toBeLessThanOrEqual(31);
                        }
                    }
                }
            );

            test.prop([fc.string({ maxLength: 10 })])(
                "should handle various prefix lengths and always return string",
                (prefix) => {
                    const result = generateBackupFileName(prefix);

                    expect(result).toBeTypeOf("string");
                    expect(result.length).toBeGreaterThan(0);
                    expect(result).toMatch(/-\d{4}-\d{2}-\d{2}\./u);
                }
            );

            test.prop([
                fc.string({ maxLength: 15 }),
                fc.string({ maxLength: 15 }),
            ])(
                "should produce consistent format regardless of input",
                (prefix, extension) => {
                    const result = generateBackupFileName(prefix, extension);

                    expect(result).toBeTypeOf("string");

                    // Should contain exactly one timestamp
                    const timestampMatches =
                        result.match(/-\d{4}-\d{2}-\d{2}\./gu);

                    expect(timestampMatches).toHaveLength(1);

                    // Should start with prefix (or empty) and end with extension (or default)
                    const parts = result.split("-");

                    expect(parts.length).toBeGreaterThanOrEqual(4); // Prefix, year, month, day+extension
                }
            );
        });
    });

    describe("handleSQLiteBackupDownload Function", () => {
        const buildBackupResult = (
            data: Uint8Array,
            overrides: Partial<SerializedDatabaseBackupResult> = {}
        ): SerializedDatabaseBackupResult => {
            const cloned = new Uint8Array(data);
            const sizeBytes = overrides.metadata?.sizeBytes ?? data.length;

            return {
                buffer: cloned.buffer,
                fileName: overrides.fileName ?? "uptime-watcher-backup.sqlite",
                metadata: {
                    appVersion: overrides.metadata?.appVersion ?? "0.0.0-test",
                    checksum: overrides.metadata?.checksum ?? "mock-checksum",
                    createdAt: overrides.metadata?.createdAt ?? 0,
                    originalPath:
                        overrides.metadata?.originalPath ??
                        "/tmp/uptime-watcher.sqlite",
                    retentionHintDays:
                        overrides.metadata?.retentionHintDays ?? 30,
                    schemaVersion: overrides.metadata?.schemaVersion ?? 1,
                    sizeBytes,
                },
            };
        };

        const expectLatestBlobCall = (expectedLength: number): void => {
            const lastCall = vi.mocked(Blob).mock.calls.at(-1);

            expect(lastCall).toBeDefined();

            const [parts, options] = lastCall!;

            expect(Array.isArray(parts)).toBe(true);
            expect(parts).toHaveLength(1);

            const [firstPart] = parts as unknown[];

            expect(firstPart).toBeInstanceOf(Uint8Array);
            expect(firstPart as Uint8Array).toHaveLength(expectedLength);
            expect(options).toEqual({ type: "application/x-sqlite3" });
        };

        it("should handle successful backup download", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Backup Operation", "type");

            const payload = new Uint8Array([
                1,
                2,
                3,
                4,
            ]);
            const backup = buildBackupResult(payload);
            const mockDownloadFunction = vi.fn().mockResolvedValue(backup);

            await handleSQLiteBackupDownload(mockDownloadFunction);

            expect(mockDownloadFunction).toHaveBeenCalled();

            expectLatestBlobCall(payload.length);

            expect(mockAnchor.download).toBe(backup.fileName);
            expect(mockAnchor.click).toHaveBeenCalled();
        });

        it("should throw TypeError for invalid backup data type", async ({
            annotate,
            task,
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
            annotate,
            task,
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

        it("should throw TypeError when required fields are missing", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const invalidResult = {
                fileName: "invalid.sqlite",
                metadata: {
                    createdAt: 0,
                    originalPath: "",
                    sizeBytes: 0,
                },
            } as SerializedDatabaseBackupResult;

            const mockDownloadFunction = vi
                .fn()
                .mockResolvedValue(invalidResult);

            await expect(
                handleSQLiteBackupDownload(mockDownloadFunction)
            ).rejects.toThrow(TypeError);
        });

        it("should handle empty backup buffers", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const payload = new Uint8Array(0);
            const backup = buildBackupResult(payload);
            const mockDownloadFunction = vi.fn().mockResolvedValue(backup);

            await handleSQLiteBackupDownload(mockDownloadFunction);

            expectLatestBlobCall(payload.length);

            expect(mockAnchor.click).toHaveBeenCalled();
        });

        it("should fall back to generated filename when provided name is blank", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const payload = new Uint8Array([1, 2]);
            const backup = buildBackupResult(payload, { fileName: "  " });
            const mockDownloadFunction = vi.fn().mockResolvedValue(backup);

            await handleSQLiteBackupDownload(mockDownloadFunction);

            expect(mockAnchor.download).toMatch(
                /^uptime-watcher-\d{4}-\d{2}-\d{2}\.db$/u
            );
        });

        it.each([
            "../backup.sqlite",
            String.raw`..\backup.sqlite`,
            "C:backup.sqlite",
            "backup\n.sqlite",
            "backup?.sqlite",
            "CON.sqlite",
            "backup.",
        ])(
            "should fall back to generated filename when provided name is unsafe: %s",
            async (fileName) => {
                const payload = new Uint8Array([1, 2]);
                const backup = buildBackupResult(payload, { fileName });
                const mockDownloadFunction = vi.fn().mockResolvedValue(backup);

                await handleSQLiteBackupDownload(mockDownloadFunction);

                expect(mockAnchor.download).toMatch(
                    /^uptime-watcher-\d{4}-\d{2}-\d{2}\.db$/u
                );
            }
        );

        it("should handle click errors with proper error message", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const backup = buildBackupResult(new Uint8Array([1]));
            const mockDownloadFunction = vi.fn().mockResolvedValue(backup);

            vi.spyOn(mockAnchor, "click").mockImplementation(() => {
                throw new Error("Click failed");
            });

            await expect(
                handleSQLiteBackupDownload(mockDownloadFunction)
            ).rejects.toThrow("Download trigger failed");
        });

        it("should handle non-Error click failures", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const backup = buildBackupResult(new Uint8Array([1]));
            const mockDownloadFunction = vi.fn().mockResolvedValue(backup);

            vi.spyOn(mockAnchor, "click").mockImplementation(() => {
                throw "String error";
            });

            await expect(
                handleSQLiteBackupDownload(mockDownloadFunction)
            ).rejects.toThrow("Download trigger failed");
        });

        it("should clean up object URL even when click fails", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const backup = buildBackupResult(new Uint8Array([1]));
            const mockDownloadFunction = vi.fn().mockResolvedValue(backup);

            vi.spyOn(mockAnchor, "click").mockImplementation(() => {
                throw new Error("Click failed");
            });

            await expect(
                handleSQLiteBackupDownload(mockDownloadFunction)
            ).rejects.toThrow();

            expect(URL.revokeObjectURL).toHaveBeenCalledWith("mock-object-url");
        });

        it("should handle download function rejection", async ({
            annotate,
            task,
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

        it("should handle large backup data", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Backup Operation", "type");

            const payload = new Uint8Array(1_000_000); // 1MB
            const backup = buildBackupResult(payload);
            const mockDownloadFunction = vi.fn().mockResolvedValue(backup);

            await handleSQLiteBackupDownload(mockDownloadFunction);

            expectLatestBlobCall(payload.length);

            expect(mockAnchor.click).toHaveBeenCalled();
        });

        describe("property-based Tests", () => {
            test.prop([fc.uint8Array({ maxLength: 10_000, minLength: 1 })])(
                "should handle various backup data sizes",
                async (mockDataArray) => {
                    const backup = buildBackupResult(mockDataArray);
                    const mockDownloadFunction = vi
                        .fn()
                        .mockResolvedValue(backup);

                    await handleSQLiteBackupDownload(mockDownloadFunction);

                    expect(mockDownloadFunction).toHaveBeenCalledTimes(1);

                    expectLatestBlobCall(mockDataArray.length);

                    expect(mockAnchor.download).toBe(backup.fileName);
                    expect(mockAnchor.click).toHaveBeenCalled();
                }
            );

            test.prop([fc.string({ maxLength: 100, minLength: 1 })])(
                "should handle download function rejections with various error messages",
                async (errorMessage) => {
                    const mockDownloadFunction = vi
                        .fn()
                        .mockRejectedValue(new Error(errorMessage));

                    await expect(
                        handleSQLiteBackupDownload(mockDownloadFunction)
                    ).rejects.toThrow(errorMessage);

                    expect(mockDownloadFunction).toHaveBeenCalledTimes(1);
                }
            );

            test.prop([fc.uint8Array({ maxLength: 1000, minLength: 0 })])(
                "should always use SQLite MIME type and cleanup resources",
                async (backupData) => {
                    const backup = buildBackupResult(backupData);
                    const mockDownloadFunction = vi
                        .fn()
                        .mockResolvedValue(backup);

                    await handleSQLiteBackupDownload(mockDownloadFunction);
                    await waitForDeferredObjectUrlCleanup();

                    expectLatestBlobCall(backupData.length);

                    expect(URL.revokeObjectURL).toHaveBeenCalledWith(
                        "mock-object-url"
                    );
                }
            );

            test.prop([
                fc.array(fc.integer({ max: 255, min: 0 }), {
                    maxLength: 500,
                    minLength: 10,
                }),
            ])(
                "should reflect metadata byte size in the backup result",
                async (intArray) => {
                    const uint8Data = new Uint8Array(intArray);
                    const backup = buildBackupResult(uint8Data);
                    const mockDownloadFunction = vi
                        .fn()
                        .mockResolvedValue(backup);

                    await handleSQLiteBackupDownload(mockDownloadFunction);

                    expectLatestBlobCall(uint8Data.length);

                    expect(mockAnchor.href).toBe("mock-object-url");
                    expect(backup.metadata).toBeDefined();
                    expect(backup.metadata?.sizeBytes).toBe(uint8Data.length);
                }
            );
        });
    });

    describe("edge Cases and Integration Tests", () => {
        it("should handle multiple sequential downloads", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fileDownload", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Data Loading", "type");

            const buffer1 = new ArrayBuffer(10);
            const buffer2 = new ArrayBuffer(20);

            downloadFile({ buffer: buffer1, fileName: "file1.txt" });
            downloadFile({ buffer: buffer2, fileName: "file2.txt" });
            await waitForDeferredObjectUrlCleanup();

            expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
            expect(mockAnchor.click).toHaveBeenCalledTimes(2);
            expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
        });

        it("should handle Blob creation with different data types", async ({
            annotate,
            task,
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

            expect(Blob).toHaveBeenCalledWith([buffer], {
                type: "application/octet-stream",
            });
        });

        it("should properly set anchor properties", async ({
            annotate,
            task,
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
