/**
 * Focused tests for the sites preload domain API.
 *
 * These tests cover the remaining CRUD-style IPC bridges after extracting
 * monitoring responsibilities to the monitoring domain.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fc from "fast-check";

const mockIpcRenderer = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: mockIpcRenderer,
}));

import {
    sitesApi,
    type SitesApiInterface,
} from "../../../preload/domains/sitesApi";

const createIpcResponse = <T>(data: T) => ({
    data,
    success: true as const,
});

describe("sitesApi preload bridge", () => {
    let api: SitesApiInterface;

    beforeEach(() => {
        vi.clearAllMocks();
        api = sitesApi;
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("structure", () => {
        it("exposes only CRUD operations", () => {
            expect(api).toHaveProperty("addSite");
            expect(api).toHaveProperty("getSites");
            expect(api).toHaveProperty("updateSite");
            expect(api).toHaveProperty("removeSite");
            expect(api).toHaveProperty("deleteAllSites");
        });
    });

    describe("getSites", () => {
        it("invokes the proper IPC channel", async () => {
            const sites: unknown[] = [];
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(sites));

            const result = await api.getSites();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith("get-sites");
            expect(result).toEqual(sites);
        });

        it("propagates IPC failures", async () => {
            mockIpcRenderer.invoke.mockRejectedValue(new Error("ipc error"));

            await expect(api.getSites()).rejects.toThrow("ipc error");
        });
    });

    describe("addSite", () => {
        it("forwards payload and returns created site", async () => {
            const payload = { name: "Site", monitors: [] } as const;
            const created = {
                identifier: "site-1",
                monitoring: true,
                monitors: [],
                name: "Site",
            };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(created)
            );

            const result = await api.addSite(payload);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "add-site",
                payload
            );
            expect(result).toEqual(created);
        });
    });

    describe("updateSite", () => {
        it("sends identifier and patch data", async () => {
            const identifier = "site-2";
            const updates = { name: "Renamed" } as const;
            const updated = {
                identifier,
                monitoring: false,
                monitors: [],
                name: "Renamed",
            };
            mockIpcRenderer.invoke.mockResolvedValue(
                createIpcResponse(updated)
            );

            const result = await api.updateSite(identifier, updates);

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "update-site",
                identifier,
                updates
            );
            expect(result).toEqual(updated);
        });
    });

    describe("removeSite", () => {
        it("passes identifier and returns success flag", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(true));

            const result = await api.removeSite("site-3");

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "remove-site",
                "site-3"
            );
            expect(result).toBeTruthy();
        });
    });

    describe("deleteAllSites", () => {
        it("returns the number of deleted records", async () => {
            mockIpcRenderer.invoke.mockResolvedValue(createIpcResponse(4));

            const result = await api.deleteAllSites();

            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                "delete-all-sites"
            );
            expect(result).toBe(4);
        });
    });

    describe("property-based scenarios", () => {
        it("handles diverse site payloads for addSite", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.record({
                        name: fc.string({ minLength: 1, maxLength: 64 }),
                        monitors: fc.array(fc.record({}), {
                            maxLength: 5,
                        }),
                    }),
                    async (payload) => {
                        const created = {
                            identifier: `site-${payload.name.slice(0, 5)}`,
                            monitoring: false,
                            monitors: payload.monitors,
                            name: payload.name,
                        };
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(created)
                        );

                        const result = await api.addSite(payload);

                        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
                            "add-site",
                            payload
                        );
                        expect(result.identifier).toContain("site-");
                    }
                ),
                { numRuns: 10 }
            );
        });

        it("handles batches for deleteAllSites", async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.integer({ min: 0, max: 50 }),
                    async (count) => {
                        mockIpcRenderer.invoke.mockResolvedValue(
                            createIpcResponse(count)
                        );

                        const result = await api.deleteAllSites();

                        expect(result).toBe(count);
                    }
                ),
                { numRuns: 10 }
            );
        });
    });
});
