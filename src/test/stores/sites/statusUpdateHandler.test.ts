/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site, StatusUpdate } from "../../../types";

import { StatusUpdateManager, createStatusUpdateHandler } from "../../../stores/sites/utils/statusUpdateHandler";

// Mock the waitForElectronAPI utility
vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    waitForElectronAPI: vi.fn().mockResolvedValue(undefined),
}));

// Mock the electron window API
const mockElectronAPI = {
    events: {
        onStatusUpdate: vi.fn(),
        removeAllListeners: vi.fn(),
    },
};

Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

describe("StatusUpdateHandler", () => {
    let mockWaitForElectronAPI: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        vi.clearAllMocks();
        // Get reference to the mocked function
        const utilsModule = await vi.importMock("../../../stores/utils");
        mockWaitForElectronAPI = utilsModule.waitForElectronAPI as ReturnType<typeof vi.fn>;
        mockWaitForElectronAPI.mockResolvedValue(undefined);
    });

    describe("StatusUpdateManager", () => {
        let manager: StatusUpdateManager;

        beforeEach(() => {
            manager = new StatusUpdateManager();
        });

        it("should initialize with no active subscription", () => {
            expect(manager).toBeDefined();
        });

        it("should unsubscribe from status updates", () => {
            manager.unsubscribe();

            expect(mockElectronAPI.events.removeAllListeners).toHaveBeenCalledWith("status-update");
        });

        it("should handle errors during subscription", async () => {
            const mockHandler = vi.fn();
            const error = new Error("Subscription failed");
            mockElectronAPI.events.onStatusUpdate.mockImplementationOnce(() => {
                throw error;
            });

            await expect(manager.subscribe(mockHandler)).rejects.toThrow("Subscription failed");
        });

        it("should handle multiple subscribe calls", async () => {
            const mockHandler1 = vi.fn();
            const mockHandler2 = vi.fn();

            await manager.subscribe(mockHandler1);
            await manager.subscribe(mockHandler2);

            expect(mockElectronAPI.events.onStatusUpdate).toHaveBeenCalledTimes(2);
        });

        it("should handle multiple unsubscribe calls", () => {
            manager.unsubscribe();
            manager.unsubscribe();

            expect(mockElectronAPI.events.removeAllListeners).toHaveBeenCalledTimes(2);
        });
    });

    describe("createStatusUpdateHandler", () => {
        let mockSites: Site[];
        let mockGetSites: ReturnType<typeof vi.fn>;
        let mockSetSites: ReturnType<typeof vi.fn>;
        let mockFullSyncFromBackend: ReturnType<typeof vi.fn>;
        let mockOnUpdate: ReturnType<typeof vi.fn>;

        beforeEach(() => {
            mockSites = [
                {
                    identifier: "site1",
                    monitors: [
                        {
                            history: [],
                            id: "monitor1",
                            monitoring: true,
                            status: "up",
                            type: "http",
                        },
                    ],
                    name: "Test Site 1",
                },
                {
                    identifier: "site2",
                    monitors: [
                        {
                            history: [],
                            id: "monitor2",
                            monitoring: true,
                            status: "down",
                            type: "http",
                        },
                    ],
                    name: "Test Site 2",
                },
            ];

            mockGetSites = vi.fn().mockReturnValue(mockSites);
            mockSetSites = vi.fn();
            mockFullSyncFromBackend = vi.fn().mockResolvedValue(undefined);
            mockOnUpdate = vi.fn();
        });

        it("should create a handler function", () => {
            const handler = createStatusUpdateHandler({
                fullSyncFromBackend: mockFullSyncFromBackend,
                getSites: mockGetSites,
                onUpdate: mockOnUpdate,
                setSites: mockSetSites,
            });

            expect(typeof handler).toBe("function");
        });

        it("should handle status updates for existing sites", async () => {
            const handler = createStatusUpdateHandler({
                fullSyncFromBackend: mockFullSyncFromBackend,
                getSites: mockGetSites,
                onUpdate: mockOnUpdate,
                setSites: mockSetSites,
            });

            const updatedSite: Site = {
                ...mockSites[0]!,
                monitors: [
                    {
                        ...mockSites[0]!.monitors[0]!,
                        status: "down",
                    },
                ],
            };

            const statusUpdate: StatusUpdate = {
                previousStatus: "up",
                site: updatedSite,
            };

            await handler(statusUpdate);

            expect(mockOnUpdate).toHaveBeenCalledWith(statusUpdate);
            expect(mockSetSites).toHaveBeenCalled();
            expect(mockFullSyncFromBackend).not.toHaveBeenCalled();
        });

        it("should trigger full sync for unknown sites", async () => {
            const handler = createStatusUpdateHandler({
                fullSyncFromBackend: mockFullSyncFromBackend,
                getSites: mockGetSites,
                onUpdate: mockOnUpdate,
                setSites: mockSetSites,
            });

            const unknownSite: Site = {
                identifier: "unknown-site",
                monitors: [],
                name: "Unknown Site",
            };

            const statusUpdate: StatusUpdate = {
                previousStatus: "down",
                site: unknownSite,
            };

            await handler(statusUpdate);

            expect(mockOnUpdate).toHaveBeenCalledWith(statusUpdate);
            expect(mockFullSyncFromBackend).toHaveBeenCalled();
            expect(mockSetSites).not.toHaveBeenCalled();
        });

        it("should handle updates with missing optional properties", async () => {
            const handler = createStatusUpdateHandler({
                fullSyncFromBackend: mockFullSyncFromBackend,
                getSites: mockGetSites,
                onUpdate: mockOnUpdate,
                setSites: mockSetSites,
            });

            const statusUpdate: StatusUpdate = {
                site: mockSites[0]!,
            };

            await handler(statusUpdate);

            expect(mockOnUpdate).toHaveBeenCalledWith(statusUpdate);
            expect(mockSetSites).toHaveBeenCalled();
        });

        it("should handle errors during update processing", async () => {
            // Mock console.error to suppress expected error messages
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            const handler = createStatusUpdateHandler({
                fullSyncFromBackend: mockFullSyncFromBackend,
                getSites: mockGetSites,
                onUpdate: mockOnUpdate,
                setSites: mockSetSites,
            });

            mockSetSites.mockImplementationOnce(() => {
                throw new Error("Set sites failed");
            });

            const statusUpdate: StatusUpdate = {
                site: mockSites[0]!,
            };

            // Should not throw but handle error gracefully
            await expect(handler(statusUpdate)).resolves.not.toThrow();
            expect(mockOnUpdate).toHaveBeenCalledWith(statusUpdate);

            // Restore console.error
            consoleSpy.mockRestore();
        });

        it("should handle empty sites array", async () => {
            mockGetSites.mockReturnValue([]);

            const handler = createStatusUpdateHandler({
                fullSyncFromBackend: mockFullSyncFromBackend,
                getSites: mockGetSites,
                onUpdate: mockOnUpdate,
                setSites: mockSetSites,
            });

            const statusUpdate: StatusUpdate = {
                site: mockSites[0]!,
            };

            await handler(statusUpdate);

            expect(mockOnUpdate).toHaveBeenCalledWith(statusUpdate);
            expect(mockFullSyncFromBackend).toHaveBeenCalled();
            expect(mockSetSites).not.toHaveBeenCalled();
        });

        it("should handle invalid status updates", async () => {
            // Mock console.error to suppress expected error messages
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            const handler = createStatusUpdateHandler({
                fullSyncFromBackend: mockFullSyncFromBackend,
                getSites: mockGetSites,
                onUpdate: mockOnUpdate,
                setSites: mockSetSites,
            });

            const statusUpdate = {
                site: null,
            } as unknown as StatusUpdate;

            await handler(statusUpdate);

            expect(mockFullSyncFromBackend).toHaveBeenCalled();

            // Restore console.error
            consoleSpy.mockRestore();
        });
    });
});
