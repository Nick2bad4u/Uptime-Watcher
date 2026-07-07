/**
 * @file Comprehensive fast-check property-based tests for fileDownload.ts
 *   Targets achieving 100% test coverage with advanced property-based testing
 */

import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

import { fc } from "@fast-check/vitest";
import { safeCastTo } from "ts-extras";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Import the functions to test
import { handleSQLiteBackupDownload } from "../../../../stores/sites/utils/fileDownload";

const waitForDeferredObjectUrlCleanup = async (): Promise<void> => {
    await new Promise<void>((resolve) => {
        globalThis.setTimeout(resolve, 0);
    });
};

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
        globalThis.Blob = mockBlob;

        // Mock URL with createObjectURL and revokeObjectURL
        mockURL = {
            createObjectURL: vi.fn(),
            revokeObjectURL: vi.fn(),
        };
        globalThis.URL = mockURL;

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
        globalThis.document = mockDocument;

        // Default successful mocks
        mockDocument.createElement.mockReturnValue(mockAnchor);
        mockURL.createObjectURL.mockReturnValue("blob:mock-url");
    });

    afterEach(async () => {
        await waitForDeferredObjectUrlCleanup();

        vi.restoreAllMocks();
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
            const [first] = safeCastTo<unknown[]>(parts);
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
                        ).resolves.not.toThrow();

                        expect(downloadFunction).toHaveBeenCalled();
                        expectBlobCalledWithLength(backupData.length);
                        expect(mockURL.createObjectURL).toHaveBeenCalled();
                        expect(mockAnchor.click).toHaveBeenCalled();
                        await waitForDeferredObjectUrlCleanup();
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
                        ).rejects.toThrow("Invalid backup data received");
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
                        ).rejects.toThrow("Download trigger failed");

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
                        ).rejects.toThrow("Download trigger failed");

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

                            await waitForDeferredObjectUrlCleanup();
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
                        ).rejects.toThrow(errorMessage);

                        expect(downloadFunction).toHaveBeenCalled();
                        expect(mockBlob).not.toHaveBeenCalled();
                        expect(mockURL.createObjectURL).not.toHaveBeenCalled();
                    }
                )
            );
        });
    });

});
