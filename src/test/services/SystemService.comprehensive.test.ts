/**
 * @file Comprehensive test suite for SystemService
 *
 *   Tests all system operations including external browser integration,
 *   initialization, error handling, and edge cases to achieve 95%+ coverage.
 *
 * @author Generated Test Suite
 *
 * @since 2024
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { ensureError } from "@shared/utils/errorHandling";

import { SystemService } from "../../services/SystemService";

// Mock dependencies using vi.hoisted for proper initialization order
const mockWaitForElectronAPI = vi.hoisted(() => vi.fn());
const mockLogger = vi.hoisted(() => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
}));

const mockElectronAPI = vi.hoisted(() => ({
    system: {
        openExternal: vi.fn(),
    },
}));

// Mock modules
vi.mock("../../stores/utils", () => ({
    waitForElectronAPI: mockWaitForElectronAPI,
}));

vi.mock("../../services/logger", () => ({
    logger: mockLogger,
}));

vi.mock("@shared/utils/errorHandling", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("@shared/utils/errorHandling")>();
    return {
        ...actual,
        ensureError: vi.fn(actual.ensureError),
    };
});

describe("SystemService", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Reset mock implementations
        mockWaitForElectronAPI.mockResolvedValue(undefined);
        mockElectronAPI.system.openExternal.mockResolvedValue(true);

        // Set up global window.electronAPI mock
        (globalThis as any).window = {
            electronAPI: mockElectronAPI,
        };
    });

    afterEach(() => {
        vi.resetAllMocks();
        delete (globalThis as any).window;
    });

    describe("Service Structure", () => {
        it("should expose all required methods", () => {
            expect(SystemService).toBeDefined();
            expect(typeof SystemService.initialize).toBe("function");
            expect(typeof SystemService.openExternal).toBe("function");
        });
    });

    describe("initialize", () => {
        it("should initialize successfully when electron API is available", async () => {
            await expect(SystemService.initialize()).resolves.toBeUndefined();
            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(1);
            expect(mockLogger.error).not.toHaveBeenCalled();
        });

        it("should handle initialization errors and rethrow", async () => {
            const error = new Error("Electron API unavailable");
            mockWaitForElectronAPI.mockRejectedValue(error);

            await expect(SystemService.initialize()).rejects.toThrow(
                "Electron API unavailable"
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Failed to initialize SystemService:",
                error
            );
        });

        it("should handle non-error initialization failures", async () => {
            const error = "String error";
            mockWaitForElectronAPI.mockRejectedValue(error);

            await expect(SystemService.initialize()).rejects.toBe(error);
            expect(mockLogger.error).toHaveBeenCalled();
            expect(vi.mocked(ensureError)).toHaveBeenCalledWith(error);
        });

        it("should handle null/undefined initialization errors", async () => {
            mockWaitForElectronAPI.mockRejectedValue(null);

            await expect(SystemService.initialize()).rejects.toBeNull();
            expect(mockLogger.error).toHaveBeenCalled();
            expect(vi.mocked(ensureError)).toHaveBeenCalledWith(null);
        });
    });

    describe("openExternal", () => {
        it("should open external URL successfully after initialization", async () => {
            const testUrl = "https://example.com";

            await expect(
                SystemService.openExternal(testUrl)
            ).resolves.toBeUndefined();
            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(1);
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledWith(
                testUrl
            );
        });

        it("should fail if initialization fails", async () => {
            const error = new Error("Initialization failed");
            mockWaitForElectronAPI.mockRejectedValue(error);

            await expect(
                SystemService.openExternal("https://example.com")
            ).rejects.toThrow("Initialization failed");
            expect(mockElectronAPI.system.openExternal).not.toHaveBeenCalled();
        });

        it("should handle openExternal API errors", async () => {
            const error = new Error("Failed to open external URL");
            mockElectronAPI.system.openExternal.mockRejectedValue(error);

            await expect(
                SystemService.openExternal("https://example.com")
            ).rejects.toThrow("Failed to open external URL");
            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(1);
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledWith(
                "https://example.com"
            );
        });

        it("should handle different URL formats", async () => {
            const urls = [
                "https://example.com",
                "http://localhost:3000",
                "file:///path/to/file.html",
                "mailto:test@example.com",
                "ftp://ftp.example.com/file.txt",
            ];

            for (const url of urls) {
                await SystemService.openExternal(url);
                expect(
                    mockElectronAPI.system.openExternal
                ).toHaveBeenCalledWith(url);
            }

            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledTimes(
                urls.length
            );
        });

        it("should handle empty and special character URLs", async () => {
            const specialUrls = [
                "",
                " ",
                "https://example.com/path with spaces",
                "https://example.com/path?query=value&other=test",
                "https://example.com/path#fragment",
                "https://user:pass@example.com:8080/path",
            ];

            for (const url of specialUrls) {
                await SystemService.openExternal(url);
                expect(
                    mockElectronAPI.system.openExternal
                ).toHaveBeenCalledWith(url);
            }

            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledTimes(
                specialUrls.length
            );
        });
    });

    describe("Integration Testing", () => {
        it("should handle multiple openExternal calls in sequence", async () => {
            const urls = [
                "https://site1.com",
                "https://site2.com",
                "https://site3.com",
            ];

            for (const url of urls) {
                await SystemService.openExternal(url);
            }

            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(urls.length);
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledTimes(
                urls.length
            );

            for (const [index, url] of urls.entries()) {
                expect(
                    mockElectronAPI.system.openExternal
                ).toHaveBeenNthCalledWith(index + 1, url);
            }
        });

        it("should handle concurrent openExternal calls", async () => {
            const urls = [
                "https://site1.com",
                "https://site2.com",
                "https://site3.com",
            ];

            const promises = urls.map((url) => SystemService.openExternal(url));
            await Promise.all(promises);

            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(urls.length);
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledTimes(
                urls.length
            );
        });

        it("should handle repeated initialization calls gracefully", async () => {
            await SystemService.initialize();
            await SystemService.initialize();
            await SystemService.initialize();

            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(3);
        });

        it("should handle mixed initialization and operation calls", async () => {
            await SystemService.initialize();
            await SystemService.openExternal("https://example.com");
            await SystemService.initialize();
            await SystemService.openExternal("https://another.com");

            expect(mockWaitForElectronAPI).toHaveBeenCalledTimes(4); // 2 explicit + 2 from openExternal
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledTimes(
                2
            );
        });
    });

    describe("Error Edge Cases", () => {
        it("should handle electron API method throwing synchronously", async () => {
            mockElectronAPI.system.openExternal.mockImplementation(() => {
                throw new Error("Synchronous error");
            });

            await expect(
                SystemService.openExternal("https://example.com")
            ).rejects.toThrow("Synchronous error");
        });

        it("should handle missing electron API gracefully", async () => {
            const error = new Error("Missing electron API");
            mockWaitForElectronAPI.mockRejectedValue(error);

            await expect(
                SystemService.openExternal("https://example.com")
            ).rejects.toThrow("Missing electron API");
        });

        it("should handle partial electron API gracefully", async () => {
            mockElectronAPI.system.openExternal.mockImplementation(() => {
                throw new TypeError("Cannot read properties of undefined");
            });

            await expect(
                SystemService.openExternal("https://example.com")
            ).rejects.toThrow();
        });

        it("should handle network-like errors in open operations", async () => {
            const networkErrors = [
                new Error("Network unreachable"),
                new Error("Timeout"),
                new Error("DNS resolution failed"),
                new Error("Connection refused"),
            ];

            for (const error of networkErrors) {
                mockElectronAPI.system.openExternal.mockRejectedValueOnce(
                    error
                );
                await expect(
                    SystemService.openExternal("https://example.com")
                ).rejects.toThrow(error.message);
            }
        });

        it("should handle permission and security errors", async () => {
            const securityErrors = [
                new Error("Permission denied"),
                new Error("Access blocked by security policy"),
                new Error("Untrusted URL"),
                new Error("Malformed URL"),
            ];

            for (const error of securityErrors) {
                mockElectronAPI.system.openExternal.mockRejectedValueOnce(
                    error
                );
                await expect(
                    SystemService.openExternal("https://example.com")
                ).rejects.toThrow(error.message);
            }
        });
    });

    describe("URL Validation Edge Cases", () => {
        it("should handle extremely long URLs", async () => {
            const longPath = "a".repeat(2000);
            const longUrl = `https://example.com/${longPath}`;

            await SystemService.openExternal(longUrl);
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledWith(
                longUrl
            );
        });

        it("should handle unicode characters in URLs", async () => {
            const unicodeUrls = [
                "https://example.com/测试",
                "https://example.com/тест",
                "https://example.com/δοκιμή",
                "https://example.com/🚀",
                "https://example.com/café",
            ];

            for (const url of unicodeUrls) {
                await SystemService.openExternal(url);
                expect(
                    mockElectronAPI.system.openExternal
                ).toHaveBeenCalledWith(url);
            }
        });

        it("should handle special protocol URLs", async () => {
            const protocolUrls = [
                "data:text/html,<h1>Test</h1>",
                "blob:https://example.com/test",
                "about:blank",
                "chrome://settings",
                "file:///path/to/file.html",
            ];

            for (const url of protocolUrls) {
                await SystemService.openExternal(url);
                expect(
                    mockElectronAPI.system.openExternal
                ).toHaveBeenCalledWith(url);
            }
        });

        it("should handle URLs with unusual characters", async () => {
            const unusualUrls = [
                "https://example.com/path<>|",
                'https://example.com/path"quotes"',
                "https://example.com/path`backticks`",
                "https://example.com/path{braces}",
                "https://example.com/path[brackets]",
            ];

            for (const url of unusualUrls) {
                await SystemService.openExternal(url);
                expect(
                    mockElectronAPI.system.openExternal
                ).toHaveBeenCalledWith(url);
            }
        });
    });

    describe("Return Value Handling", () => {
        it("should handle successful openExternal returning true", async () => {
            mockElectronAPI.system.openExternal.mockResolvedValue(true);

            await expect(
                SystemService.openExternal("https://example.com")
            ).resolves.toBeUndefined();
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledWith(
                "https://example.com"
            );
        });

        it("should handle openExternal returning false", async () => {
            mockElectronAPI.system.openExternal.mockResolvedValue(false);

            await expect(
                SystemService.openExternal("https://example.com")
            ).resolves.toBeUndefined();
            expect(mockElectronAPI.system.openExternal).toHaveBeenCalledWith(
                "https://example.com"
            );
        });

        it("should handle openExternal returning unexpected values", async () => {
            const unexpectedValues = [
                null,
                undefined,
                0,
                "",
                {},
                [],
            ];

            for (const value of unexpectedValues) {
                mockElectronAPI.system.openExternal.mockResolvedValueOnce(
                    value
                );
                await expect(
                    SystemService.openExternal("https://example.com")
                ).resolves.toBeUndefined();
            }
        });
    });
});
