/**
 * @file Comprehensive fast-check property-based tests for fileDownload.ts
 *   Targets achieving 100% test coverage with advanced property-based testing
 */

import { fc } from "@fast-check/vitest";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

// Import the functions to test
import {
    downloadFile,
    generateBackupFileName,
    handleSQLiteBackupDownload,
    type FileDownloadOptions,
} from "../../../../stores/sites/utils/fileDownload";

// Mock logger
vi.mock("../../../../services/logger", () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

describe("fileDownload utilities - Comprehensive Fast-Check Coverage", () => {
    // Mock DOM APIs
    let mockURL: any;
    let mockDocument: any;
    let mockAnchor: any;
    let mockBlob: any;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Mock Blob
        mockBlob = vi.fn();
        global.Blob = mockBlob;

        // Mock URL with createObjectURL and revokeObjectURL
        mockURL = {
            createObjectURL: vi.fn(),
            revokeObjectURL: vi.fn(),
        };
        global.URL = mockURL;

        // Mock anchor element
        mockAnchor = {
            href: "",
            download: "",
            style: { display: "" },
            click: vi.fn(),
            remove: vi.fn(),
        };

        // Mock document
        mockDocument = {
            createElement: vi.fn(),
            body: {
                append: vi.fn(),
            },
        };
        global.document = mockDocument;

        // Default successful mocks
        mockDocument.createElement.mockReturnValue(mockAnchor);
        mockURL.createObjectURL.mockReturnValue("blob:mock-url");
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("downloadFile function coverage", () => {
        it("should successfully download files with valid inputs", () => {
            fc.assert(
                fc.property(
                    fc.uint8Array({ minLength: 1, maxLength: 1000 }),
                    fc.string({ minLength: 1, maxLength: 50 }),
                    fc.option(fc.string({ minLength: 1, maxLength: 50 })),
                    (bufferArray, fileName, mimeType) => {
                        const buffer = bufferArray.buffer;
                        const options: FileDownloadOptions = {
                            buffer,
                            fileName,
                            ...(mimeType && { mimeType }),
                        };

                        // Should not throw
                        expect(() => downloadFile(options)).not.toThrowError();

                        // Verify Blob creation
                        expect(mockBlob).toHaveBeenCalledWith([buffer], {
                            type: mimeType || "application/octet-stream",
                        });

                        // Verify anchor setup
                        expect(mockDocument.createElement).toHaveBeenCalledWith(
                            "a"
                        );
                        expect(mockAnchor.href).toBe("blob:mock-url");
                        expect(mockAnchor.download).toBe(fileName);
                        expect(mockAnchor.style.display).toBe("none");

                        // Verify download trigger
                        expect(mockDocument.body.append).toHaveBeenCalledWith(
                            mockAnchor
                        );
                        expect(mockAnchor.click).toHaveBeenCalled();
                        expect(mockAnchor.remove).toHaveBeenCalled();

                        // Verify cleanup
                        expect(mockURL.revokeObjectURL).toHaveBeenCalledWith(
                            "blob:mock-url"
                        );
                    }
                )
            );
        });

        it("should handle errors in createObjectURL", () => {
            fc.assert(
                fc.property(
                    fc.uint8Array({ minLength: 1, maxLength: 100 }),
                    fc.string({ minLength: 1, maxLength: 20 }),
                    (bufferArray, fileName) => {
                        const buffer = bufferArray.buffer;
                        const options: FileDownloadOptions = {
                            buffer,
                            fileName,
                            mimeType: "text/plain",
                        };

                        mockURL.createObjectURL.mockImplementation(() => {
                            throw new Error("createObjectURL failed");
                        });

                        expect(() => downloadFile(options)).toThrowError(
                            "createObjectURL failed"
                        );
                    }
                )
            );
        });

        it("should handle DOM appendChild errors with fallback", () => {
            fc.assert(
                fc.property(
                    fc.uint8Array({ minLength: 1, maxLength: 100 }),
                    fc.string({ minLength: 1, maxLength: 20 }),
                    (bufferArray, fileName) => {
                        // Reset mocks for each property
                        vi.clearAllMocks();
                        mockDocument.createElement.mockReturnValue(mockAnchor);
                        mockURL.createObjectURL.mockReturnValue(
                            "blob:mock-url"
                        );

                        const buffer = bufferArray.buffer;
                        const options: FileDownloadOptions = {
                            buffer,
                            fileName,
                        };

                        // Mock appendChild error on first call, success on second
                        let callCount = 0;
                        mockDocument.body.append.mockImplementation(() => {
                            callCount++;
                            if (callCount === 1) {
                                throw new Error("appendChild failed");
                            }
                        });

                        // Should not throw as fallback should work
                        expect(() => downloadFile(options)).not.toThrowError();

                        // Should be called at least once for original attempt and once for fallback
                        expect(
                            mockDocument.createElement
                        ).toHaveBeenCalledTimes(2);
                    }
                ),
                { numRuns: 5 } // Limit runs to avoid mock conflicts
            );
        });

        it("should handle DOM manipulation errors with fallback click", () => {
            fc.assert(
                fc.property(
                    fc.uint8Array({ minLength: 1, maxLength: 100 }),
                    fc.string({ minLength: 1, maxLength: 20 }),
                    (bufferArray, fileName) => {
                        const buffer = bufferArray.buffer;
                        const options: FileDownloadOptions = {
                            buffer,
                            fileName,
                        };

                        // Mock DOM error that doesn't include "appendChild"
                        mockDocument.body.append.mockImplementation(() => {
                            throw new Error("DOM manipulation failed");
                        });

                        expect(() => downloadFile(options)).not.toThrowError();

                        // Should still try to click even with DOM error
                        expect(mockAnchor.click).toHaveBeenCalled();
                    }
                )
            );
        });

        it("should handle createElement errors", () => {
            fc.assert(
                fc.property(
                    fc.uint8Array({ minLength: 1, maxLength: 100 }),
                    fc.string({ minLength: 1, maxLength: 20 }),
                    (bufferArray, fileName) => {
                        const buffer = bufferArray.buffer;
                        const options: FileDownloadOptions = {
                            buffer,
                            fileName,
                        };

                        mockDocument.createElement.mockImplementation(() => {
                            throw new Error("createElement not available");
                        });

                        expect(() => downloadFile(options)).toThrowError(
                            "createElement not available"
                        );
                    }
                )
            );
        });

        it("should handle click failures", () => {
            fc.assert(
                fc.property(
                    fc.uint8Array({ minLength: 1, maxLength: 100 }),
                    fc.string({ minLength: 1, maxLength: 20 }),
                    (bufferArray, fileName) => {
                        const buffer = bufferArray.buffer;
                        const options: FileDownloadOptions = {
                            buffer,
                            fileName,
                        };

                        mockAnchor.click.mockImplementation(() => {
                            throw new Error("Click failed");
                        });

                        expect(() => downloadFile(options)).toThrowError(
                            "Click failed"
                        );
                    }
                )
            );
        });

        it("should handle non-Error objects in error handling", () => {
            fc.assert(
                fc.property(
                    fc.uint8Array({ minLength: 1, maxLength: 100 }),
                    fc.string({ minLength: 1, maxLength: 20 }),
                    (bufferArray, fileName) => {
                        const buffer = bufferArray.buffer;
                        const options: FileDownloadOptions = {
                            buffer,
                            fileName,
                        };

                        mockDocument.body.append.mockImplementation(() => {
                            throw "string error"; // Non-Error object
                        });

                        expect(() => downloadFile(options)).not.toThrowError();
                        expect(mockAnchor.click).toHaveBeenCalled();
                    }
                )
            );
        });

        it("should handle fallback method failures", () => {
            fc.assert(
                fc.property(
                    fc.uint8Array({ minLength: 1, maxLength: 100 }),
                    fc.string({ minLength: 1, maxLength: 20 }),
                    (bufferArray, fileName) => {
                        const buffer = bufferArray.buffer;
                        const options: FileDownloadOptions = {
                            buffer,
                            fileName,
                        };

                        // Mock both original and fallback to fail with appendChild
                        mockDocument.body.append.mockImplementation(() => {
                            throw new Error("appendChild failed");
                        });

                        expect(() => downloadFile(options)).toThrowError(
                            "File download failed"
                        );
                    }
                )
            );
        });
    });

    describe("generateBackupFileName function coverage", () => {
        it("should generate backup filenames with valid inputs", () => {
            fc.assert(
                fc.property(
                    fc.option(fc.string({ minLength: 1, maxLength: 20 })),
                    fc.option(fc.string({ minLength: 1, maxLength: 10 })),
                    (prefix, extension) => {
                        const fileName = generateBackupFileName(
                            prefix ?? undefined,
                            extension ?? undefined
                        );

                        // Should contain timestamp
                        expect(fileName).toMatch(/\d{4}-\d{2}-\d{2}/);

                        // Should use provided prefix or default
                        const expectedPrefix = prefix || "backup";
                        expect(
                            fileName.startsWith(expectedPrefix)
                        ).toBeTruthy();

                        // Should use provided extension or default
                        const expectedExtension = extension || "sqlite";
                        expect(
                            fileName.endsWith(`.${expectedExtension}`)
                        ).toBeTruthy();
                    }
                )
            );
        });

        it("should generate consistent filename format", () => {
            fc.assert(
                fc.property(
                    fc
                        .string({ minLength: 1, maxLength: 20 })
                        .filter((s) => /^[\w-]+$/.test(s)),
                    fc
                        .string({ minLength: 1, maxLength: 10 })
                        .filter((s) => /^[\w-]+$/.test(s)),
                    (prefix, extension) => {
                        const fileName = generateBackupFileName(
                            prefix,
                            extension
                        );

                        // Since we're using safe characters, no need to escape
                        const pattern = new RegExp(
                            String.raw`^${prefix}-\d{4}-\d{2}-\d{2}\.${extension}$`
                        );
                        expect(fileName).toMatch(pattern);
                    }
                ),
                { numRuns: 10 }
            );
        });

        it("should handle default parameters", () => {
            const fileName = generateBackupFileName();
            expect(fileName).toMatch(/^backup-\d{4}-\d{2}-\d{2}\.sqlite$/);
        });
    });

    describe("handleSQLiteBackupDownload function coverage", () => {
        const buildBackupResult = (
            bytes: Uint8Array
        ): SerializedDatabaseBackupResult => ({
            buffer: new Uint8Array(bytes).buffer,
            fileName: "uptime-watcher-backup.sqlite",
            metadata: {
                appVersion: "0.0.0-test",
                checksum: "mock-checksum",
                createdAt: 0,
                originalPath: "/tmp/uptime-watcher.sqlite",
                retentionHintDays: 30,
                schemaVersion: 1,
                sizeBytes: bytes.length,
            },
        });

        const expectBlobCalledWithLength = (expected: number): void => {
            const lastCall = mockBlob.mock.calls.at(-1);
            expect(lastCall).toBeDefined();
            const [parts, options] = lastCall!;
            expect(Array.isArray(parts)).toBeTruthy();
            expect(parts).toHaveLength(1);
            const [first] = parts as unknown[];
            expect(first).toBeInstanceOf(Uint8Array);
            expect(first as Uint8Array).toHaveLength(expected);
            expect(options).toEqual({ type: "application/x-sqlite3" });
        };

        it("should handle successful SQLite backup download", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.uint8Array({ minLength: 1, maxLength: 1000 }),
                    async (backupData) => {
                        const backup = buildBackupResult(backupData);
                        const downloadFunction = vi
                            .fn()
                            .mockResolvedValue(backup);

                        await expect(
                            handleSQLiteBackupDownload(downloadFunction)
                        ).resolves.not.toThrowError();

                        expect(downloadFunction).toHaveBeenCalled();
                        expectBlobCalledWithLength(backupData.length);
                        expect(mockURL.createObjectURL).toHaveBeenCalled();
                        expect(mockAnchor.click).toHaveBeenCalled();
                        expect(mockURL.revokeObjectURL).toHaveBeenCalled();
                    }
                )
            );
        });

        it("should handle invalid backup data", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.oneof(
                        fc.string(),
                        fc.integer(),
                        fc.array(fc.integer()),
                        fc.constant(null),
                        fc.constant(undefined),
                        fc.record({
                            buffer: fc.uint8Array().map((array) => array),
                        })
                    ),
                    async (invalidData) => {
                        const downloadFunction = vi
                            .fn()
                            .mockResolvedValue(invalidData);

                        await expect(
                            handleSQLiteBackupDownload(downloadFunction)
                        ).rejects.toThrowError("Invalid backup data received");
                    }
                )
            );
        });

        it("should handle click failures during SQLite download", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.uint8Array({ minLength: 1, maxLength: 100 }),
                    async (backupData) => {
                        const backup = buildBackupResult(backupData);
                        const downloadFunction = vi
                            .fn()
                            .mockResolvedValue(backup);
                        mockAnchor.click.mockImplementation(() => {
                            throw new Error("Click failed");
                        });

                        await expect(
                            handleSQLiteBackupDownload(downloadFunction)
                        ).rejects.toThrowError("Download trigger failed");

                        expect(mockURL.revokeObjectURL).toHaveBeenCalled();
                    }
                )
            );
        });

        it("should handle non-Error click failures", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.uint8Array({ minLength: 1, maxLength: 100 }),
                    async (backupData) => {
                        const backup = buildBackupResult(backupData);
                        const downloadFunction = vi
                            .fn()
                            .mockResolvedValue(backup);
                        mockAnchor.click.mockImplementation(() => {
                            throw "string error";
                        });

                        await expect(
                            handleSQLiteBackupDownload(downloadFunction)
                        ).rejects.toThrowError("Download trigger failed");

                        expect(mockURL.revokeObjectURL).toHaveBeenCalled();
                    }
                )
            );
        });

        it("should ensure object URL cleanup in all scenarios", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.uint8Array({ minLength: 1, maxLength: 100 }),
                    async (backupData) => {
                        const backup = buildBackupResult(backupData);
                        const downloadFunction = vi
                            .fn()
                            .mockResolvedValue(backup);

                        const scenarios = [
                            () => {},
                            () => {
                                throw new Error("Click failed");
                            },
                        ];

                        for (const scenario of scenarios) {
                            vi.clearAllMocks();
                            mockAnchor.click.mockImplementation(scenario);

                            try {
                                await handleSQLiteBackupDownload(
                                    downloadFunction
                                );
                            } catch {
                                // Expected for error scenarios
                            }

                            expect(mockURL.revokeObjectURL).toHaveBeenCalled();
                        }
                    }
                )
            );
        });

        it("should handle download function errors", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.string({ minLength: 1, maxLength: 50 }),
                    async (errorMessage) => {
                        const downloadFunction = vi
                            .fn()
                            .mockRejectedValue(new Error(errorMessage));

                        await expect(
                            handleSQLiteBackupDownload(downloadFunction)
                        ).rejects.toThrowError(errorMessage);

                        expect(downloadFunction).toHaveBeenCalled();
                        expect(mockBlob).not.toHaveBeenCalled();
                        expect(mockURL.createObjectURL).not.toHaveBeenCalled();
                    }
                )
            );
        });
    });

    describe("Edge cases and integration tests", () => {
        it("should handle empty file buffers", () => {
            const options: FileDownloadOptions = {
                buffer: new ArrayBuffer(0),
                fileName: "empty.txt",
                mimeType: "text/plain",
            };

            expect(() => downloadFile(options)).not.toThrowError();
            expect(mockBlob).toHaveBeenCalledWith([options.buffer], {
                type: "text/plain",
            });
        });

        it("should handle very long filenames", () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 100, maxLength: 500 }),
                    (longFileName) => {
                        const options: FileDownloadOptions = {
                            buffer: new ArrayBuffer(10),
                            fileName: longFileName,
                        };

                        expect(() => downloadFile(options)).not.toThrowError();
                        expect(mockAnchor.download).toBe(longFileName);
                    }
                )
            );
        });

        it("should handle special characters in filenames", () => {
            fc.assert(
                fc.property(
                    fc
                        .string({ minLength: 1, maxLength: 50 })
                        .filter((s) => s.trim().length > 0),
                    (fileName) => {
                        const options: FileDownloadOptions = {
                            buffer: new ArrayBuffer(10),
                            fileName,
                        };

                        expect(() => downloadFile(options)).not.toThrowError();
                        expect(mockAnchor.download).toBe(fileName);
                    }
                )
            );
        });

        it("should handle missing MIME type correctly", () => {
            const options: FileDownloadOptions = {
                buffer: new ArrayBuffer(10),
                fileName: "test.txt",
                // No mimeType provided
            };

            expect(() => downloadFile(options)).not.toThrowError();
            expect(mockBlob).toHaveBeenCalledWith([options.buffer], {
                type: "application/octet-stream",
            });
        });
    });
});
