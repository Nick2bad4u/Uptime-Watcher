/**
 * Test suite for useUpdatesStore.
 * Comprehensive tests for updates store functionality.
 */

import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import type { UpdateStatus } from "../stores/types";

import { useUpdatesStore } from "../stores/updates/useUpdatesStore";

// Mock the logger
vi.mock("../stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

// Mock window.electronAPI
const mockQuitAndInstall = vi.fn();

// Helper to setup electronAPI mock
const setupElectronAPIMock = (mockAPI: unknown) => {
    // Use a different approach to avoid property redefinition
    const win = window as unknown as Record<string, unknown>;
    win["electronAPI"] = mockAPI;
};

// Setup default mock
setupElectronAPIMock({
    system: {
        quitAndInstall: mockQuitAndInstall,
    },
});

describe("useUpdatesStore", () => {
    beforeEach(() => {
        // Reset the store before each test
        useUpdatesStore.setState({
            updateError: undefined,
            updateInfo: undefined,
            updateProgress: 0,
            updateStatus: "idle",
        });

        // Reset mocks
        vi.clearAllMocks();

        // Reset the electronAPI mock
        setupElectronAPIMock({
            system: {
                quitAndInstall: mockQuitAndInstall,
            },
        });
    });

    afterEach(() => {
        // Clean up mocks after each test
        vi.clearAllMocks();
    });

    describe("update status management", () => {
        it("should initialize with idle status", () => {
            const { result } = renderHook(() => useUpdatesStore());

            expect(result.current.updateStatus).toBe("idle");
            expect(result.current.updateProgress).toBe(0);
            expect(result.current.updateError).toBeUndefined();
            expect(result.current.updateInfo).toBeUndefined();
        });

        it("should set update status", () => {
            const { result } = renderHook(() => useUpdatesStore());

            act(() => {
                result.current.setUpdateStatus("checking");
            });

            expect(result.current.updateStatus).toBe("checking");
        });

        it("should handle all update status values", () => {
            const { result } = renderHook(() => useUpdatesStore());

            const statuses: UpdateStatus[] = ["idle", "checking", "available", "downloading", "downloaded", "error"];

            for (const status of statuses) {
                act(() => {
                    result.current.setUpdateStatus(status);
                });

                expect(result.current.updateStatus).toBe(status);
            }
        });
    });

    describe("update progress management", () => {
        it("should set update progress", () => {
            const { result } = renderHook(() => useUpdatesStore());

            act(() => {
                result.current.setUpdateProgress(50);
            });

            expect(result.current.updateProgress).toBe(50);
        });

        it("should handle progress values from 0 to 100", () => {
            const { result } = renderHook(() => useUpdatesStore());

            const progressValues = [0, 25, 50, 75, 100];

            for (const progress of progressValues) {
                act(() => {
                    result.current.setUpdateProgress(progress);
                });

                expect(result.current.updateProgress).toBe(progress);
            }
        });
    });

    describe("update error management", () => {
        it("should set update error", () => {
            const { result } = renderHook(() => useUpdatesStore());

            act(() => {
                result.current.setUpdateError("Update failed");
            });

            expect(result.current.updateError).toBe("Update failed");
        });

        it("should clear update error", () => {
            const { result } = renderHook(() => useUpdatesStore());

            act(() => {
                result.current.setUpdateError("Update failed");
            });

            expect(result.current.updateError).toBe("Update failed");

            act(() => {
                result.current.setUpdateError(undefined);
            });

            expect(result.current.updateError).toBeUndefined();
        });

        it("should clear update error using clearUpdateError method", () => {
            const { result } = renderHook(() => useUpdatesStore());

            // Set an error first
            act(() => {
                result.current.setUpdateError("Update failed");
            });

            expect(result.current.updateError).toBe("Update failed");

            // Clear the error using the dedicated method
            act(() => {
                result.current.clearUpdateError();
            });

            expect(result.current.updateError).toBeUndefined();
        });

        it("should handle clearing error when no error exists", () => {
            const { result } = renderHook(() => useUpdatesStore());

            // Ensure no error exists
            expect(result.current.updateError).toBeUndefined();

            // Clear error should not throw
            act(() => {
                result.current.clearUpdateError();
            });

            expect(result.current.updateError).toBeUndefined();
        });
    });

    describe("update info management", () => {
        it("should set update info", () => {
            const updateInfo = {
                releaseDate: "2023-01-01",
                releaseName: "v1.0.0",
                releaseNotes: "Bug fixes and improvements",
                version: "1.0.0",
            };

            const { result } = renderHook(() => useUpdatesStore());

            act(() => {
                result.current.setUpdateInfo(updateInfo);
            });

            expect(result.current.updateInfo).toEqual(updateInfo);
        });

        it("should clear update info", () => {
            const updateInfo = {
                releaseDate: "2023-01-01",
                releaseName: "v1.0.0",
                releaseNotes: "Bug fixes and improvements",
                version: "1.0.0",
            };

            const { result } = renderHook(() => useUpdatesStore());

            act(() => {
                result.current.setUpdateInfo(updateInfo);
            });

            expect(result.current.updateInfo).toEqual(updateInfo);

            act(() => {
                result.current.setUpdateInfo(undefined);
            });

            expect(result.current.updateInfo).toBeUndefined();
        });
    });

    describe("complex scenarios", () => {
        it("should handle complete update lifecycle", () => {
            const { result } = renderHook(() => useUpdatesStore());

            // Start checking for updates
            act(() => {
                result.current.setUpdateStatus("checking");
            });

            expect(result.current.updateStatus).toBe("checking");

            // Update available
            act(() => {
                result.current.setUpdateStatus("available");
                result.current.setUpdateInfo({
                    releaseDate: "2023-01-01",
                    releaseName: "v1.0.0",
                    releaseNotes: "New features",
                    version: "1.0.0",
                });
            });

            expect(result.current.updateStatus).toBe("available");
            expect(result.current.updateInfo?.version).toBe("1.0.0");

            // Start downloading
            act(() => {
                result.current.setUpdateStatus("downloading");
                result.current.setUpdateProgress(0);
            });

            expect(result.current.updateStatus).toBe("downloading");
            expect(result.current.updateProgress).toBe(0);

            // Update progress
            act(() => {
                result.current.setUpdateProgress(50);
            });

            expect(result.current.updateProgress).toBe(50);

            // Download complete
            act(() => {
                result.current.setUpdateStatus("downloaded");
                result.current.setUpdateProgress(100);
            });

            expect(result.current.updateStatus).toBe("downloaded");
            expect(result.current.updateProgress).toBe(100);
        });

        it("should handle update error scenario", () => {
            const { result } = renderHook(() => useUpdatesStore());

            // Start checking for updates
            act(() => {
                result.current.setUpdateStatus("checking");
            });

            // Error occurred
            act(() => {
                result.current.setUpdateStatus("error");
                result.current.setUpdateError("Network error");
            });

            expect(result.current.updateStatus).toBe("error");
            expect(result.current.updateError).toBe("Network error");

            // Reset to idle
            act(() => {
                result.current.setUpdateStatus("idle");
                result.current.setUpdateError(undefined);
            });

            expect(result.current.updateStatus).toBe("idle");
            expect(result.current.updateError).toBeUndefined();
        });

        it("should handle multiple state changes independently", () => {
            const { result } = renderHook(() => useUpdatesStore());

            const updateInfo = {
                releaseDate: "2023-02-01",
                releaseName: "v2.0.0",
                releaseNotes: "Major update",
                version: "2.0.0",
            };

            act(() => {
                result.current.setUpdateStatus("downloading");
                result.current.setUpdateProgress(75);
                result.current.setUpdateInfo(updateInfo);
                result.current.setUpdateError("Connection timeout");
            });

            expect(result.current.updateStatus).toBe("downloading");
            expect(result.current.updateProgress).toBe(75);
            expect(result.current.updateInfo).toEqual(updateInfo);
            expect(result.current.updateError).toBe("Connection timeout");

            // Change only status
            act(() => {
                result.current.setUpdateStatus("error");
            });

            expect(result.current.updateStatus).toBe("error");
            expect(result.current.updateProgress).toBe(75); // Should remain unchanged
            expect(result.current.updateInfo).toEqual(updateInfo); // Should remain unchanged
            expect(result.current.updateError).toBe("Connection timeout"); // Should remain unchanged
        });
    });

    describe("apply update functionality", () => {
        it("should call electronAPI.system.quitAndInstall when applying update", () => {
            const { result } = renderHook(() => useUpdatesStore());

            act(() => {
                result.current.applyUpdate();
            });

            expect(mockQuitAndInstall).toHaveBeenCalledTimes(1);
        });

        it("should apply update in downloaded state", () => {
            const { result } = renderHook(() => useUpdatesStore());

            // Set state to downloaded
            act(() => {
                result.current.setUpdateStatus("downloaded");
                result.current.setUpdateProgress(100);
            });

            expect(result.current.updateStatus).toBe("downloaded");
            expect(result.current.updateProgress).toBe(100);

            // Apply update
            act(() => {
                result.current.applyUpdate();
            });

            expect(mockQuitAndInstall).toHaveBeenCalledTimes(1);
        });
    });

    describe("store action logging", () => {
        it("should log all store actions", async () => {
            const { logStoreAction } = await import("../stores/utils");
            const { result } = renderHook(() => useUpdatesStore());

            const updateInfo = {
                releaseDate: "2023-01-01",
                releaseName: "v1.0.0",
                releaseNotes: "Test update",
                version: "1.0.0",
            };

            // Test all actions that should log
            act(() => {
                result.current.setUpdateStatus("checking");
                result.current.setUpdateProgress(50);
                result.current.setUpdateError("Test error");
                result.current.setUpdateInfo(updateInfo);
                result.current.clearUpdateError();
                result.current.applyUpdate();
            });

            expect(logStoreAction).toHaveBeenCalledWith("UpdatesStore", "setUpdateStatus", { status: "checking" });
            expect(logStoreAction).toHaveBeenCalledWith("UpdatesStore", "setUpdateProgress", { progress: 50 });
            expect(logStoreAction).toHaveBeenCalledWith("UpdatesStore", "setUpdateError", { error: "Test error" });
            expect(logStoreAction).toHaveBeenCalledWith("UpdatesStore", "setUpdateInfo", { info: updateInfo });
            expect(logStoreAction).toHaveBeenCalledWith("UpdatesStore", "clearUpdateError", {
                message: "Update error cleared",
                success: true,
            });
            expect(logStoreAction).toHaveBeenCalledWith("UpdatesStore", "applyUpdate", {
                message: "Applying update and restarting application",
                success: true,
            });
        });
    });
});
