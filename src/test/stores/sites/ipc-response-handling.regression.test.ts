import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";

import { SiteService } from "../../../services/SiteService";
import { installElectronApiMock } from "../../utils/electronApiMock";
import { createMockSite } from "../../utils/mockFactories";

vi.mock("../../../services/utils/electronBridgeReadiness", () => ({
    waitForElectronBridge: vi.fn(async () => undefined),
}));

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
