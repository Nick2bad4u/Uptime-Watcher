/**
 * Test suite for useUpdatesStore.
 * Comprehensive tests for updates store functionality.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useUpdatesStore } from "../stores/updates/useUpdatesStore";
import type { UpdateStatus } from "../stores/types";

// Mock the logger
vi.mock("../utils", () => ({
    logStoreAction: vi.fn(),
}));

describe("useUpdatesStore", () => {
    beforeEach(() => {
        // Reset the store before each test
        useUpdatesStore.setState({
            updateStatus: "idle",
            updateProgress: 0,
            updateError: undefined,
            updateInfo: undefined,
        });
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
    });

    describe("update info management", () => {
        it("should set update info", () => {
            const updateInfo = {
                version: "1.0.0",
                releaseNotes: "Bug fixes and improvements",
                releaseName: "v1.0.0",
                releaseDate: "2023-01-01",
            };

            const { result } = renderHook(() => useUpdatesStore());
            
            act(() => {
                result.current.setUpdateInfo(updateInfo);
            });
            
            expect(result.current.updateInfo).toEqual(updateInfo);
        });

        it("should clear update info", () => {
            const updateInfo = {
                version: "1.0.0",
                releaseNotes: "Bug fixes and improvements",
                releaseName: "v1.0.0",
                releaseDate: "2023-01-01",
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
                    version: "1.0.0",
                    releaseNotes: "New features",
                    releaseName: "v1.0.0",
                    releaseDate: "2023-01-01",
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
                version: "2.0.0",
                releaseNotes: "Major update",
                releaseName: "v2.0.0",
                releaseDate: "2023-02-01",
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
});
