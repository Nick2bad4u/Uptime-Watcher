/**
 * Tests for the file download utilities.
 *
 * Covers edge cases around DOM interactions, resource cleanup, and serialized
 * SQLite backup download payload handling.
 */

import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { handleSQLiteBackupDownload } from "../../stores/sites/utils/fileDownload";

// Mock the logger service
vi.mock("../../../services/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
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

describe("file Download Utility", () => {
    let mockAnchor: any;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();
        Reflect.deleteProperty(globalThis, "playwrightAutomation");
        Reflect.deleteProperty(globalThis, "playwrightLastBackup");

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
        Reflect.deleteProperty(globalThis, "playwrightAutomation");
        Reflect.deleteProperty(globalThis, "playwrightLastBackup");
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

        it("should return the normalized filename used for unsafe download names", async () => {
            const payload = new Uint8Array([1, 2]);
            const backup = buildBackupResult(payload, {
                fileName: "../backup.sqlite",
            });
            const mockDownloadFunction = vi.fn().mockResolvedValue(backup);

            const result =
                await handleSQLiteBackupDownload(mockDownloadFunction);

            expect(result.fileName).toBe(mockAnchor.download);
            expect(result.fileName).toMatch(
                /^uptime-watcher-\d{4}-\d{2}-\d{2}\.db$/u
            );
        });

        it("should normalize automation backup filenames before storing globally", async () => {
            Reflect.set(globalThis, "playwrightAutomation", true);
            const payload = new Uint8Array([1, 2]);
            const backup = buildBackupResult(payload, {
                fileName: "../backup.sqlite",
            });
            const mockDownloadFunction = vi.fn().mockResolvedValue(backup);

            const result =
                await handleSQLiteBackupDownload(mockDownloadFunction);

            expect(result.fileName).toMatch(
                /^uptime-watcher-\d{4}-\d{2}-\d{2}\.db$/u
            );
            expect(
                (
                    Reflect.get(
                        globalThis,
                        "playwrightLastBackup"
                    ) as SerializedDatabaseBackupResult
                ).fileName
            ).toBe(result.fileName);
            expect(mockAnchor.click).not.toHaveBeenCalled();
        });

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
});
