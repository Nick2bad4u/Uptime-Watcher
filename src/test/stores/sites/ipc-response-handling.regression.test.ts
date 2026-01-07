import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";
import type { IpcResponse } from "@shared/types/ipc";

import { SiteService } from "../../../services/SiteService";
import { extractIpcData } from "../../../types/ipc";
import { installElectronApiMock } from "../../utils/electronApiMock";
import { createMockSite } from "../../utils/mockFactories";

vi.mock("../../../services/utils/electronBridgeReadiness", () => ({
    waitForElectronBridge: vi.fn(async () => undefined),
}));

const createOkResponse = <T>(data: T): IpcResponse<T> => ({
    success: true,
    data,
});

describe("IPC response handling regression", () => {
    const sitesApi = {
        addSite: vi.fn(),
        deleteAllSites: vi.fn(),
        getSites: vi.fn(),
        removeMonitor: vi.fn(),
        removeSite: vi.fn(),
        updateSite: vi.fn(),
    };

    const stateSyncApi = {
        getSyncStatus: vi.fn(),
        requestFullSync: vi.fn(),
        onStateSyncEvent: vi.fn(() => vi.fn()),
    };

    let restoreElectronApi: (() => void) | undefined;

    beforeEach(() => {
        vi.clearAllMocks();

        ({ restore: restoreElectronApi } = installElectronApiMock({
            sites: sitesApi,
            stateSync: stateSyncApi,
        }));
    });

    afterEach(() => {
        restoreElectronApi?.();
        restoreElectronApi = undefined;
    });

    it("extractIpcData returns data on success", () => {
        const response: IpcResponse<number> = createOkResponse(123);
        expect(extractIpcData(response)).toBe(123);
    });

    it("extractIpcData throws on failure", () => {
        const response: IpcResponse<number> = {
            success: false,
            error: "Boom",
        };

        expect(() => extractIpcData(response)).toThrowError(/Boom/);
    });

    it("SiteService.addSite propagates IPC errors", async () => {
        const site: Site = createMockSite({
            identifier: "site-1",
            name: "Example",
        });

        sitesApi.addSite.mockRejectedValueOnce(new Error("IPC failed"));

        await expect(SiteService.addSite(site)).rejects.toThrowError(
            /IPC failed/
        );
    });

    it("SiteService.getSites returns backend data", async () => {
        const sites: Site[] = [
            createMockSite({ identifier: "site-1", name: "Example" }),
        ];

        sitesApi.getSites.mockResolvedValueOnce(sites);

        await expect(SiteService.getSites()).resolves.toEqual(sites);
    });
});
