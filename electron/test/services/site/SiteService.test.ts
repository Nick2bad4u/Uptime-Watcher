/**
 * Unit tests for {@link SiteService} validating delegation to
 * {@link SiteManager}.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "../../../../shared/types.js";
import type { SiteManager } from "../../../managers/SiteManager";

vi.mock("../../../utils/logger", () => {
    const create = () => ({
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    });
    return {
        diagnosticsLogger: create(),
        logger: create(),
    };
});

import { SiteService } from "../../../services/site/SiteService";

describe(SiteService, () => {
    let siteService: SiteService;
    const siteManager = {
        getSiteWithDetails:
            vi.fn<(identifier: string) => Promise<Site | undefined>>(),
        getSites: vi.fn<() => Promise<Site[]>>(),
        removeSite: vi.fn<(identifier: string) => Promise<boolean>>(),
    } as unknown as SiteManager;

    beforeEach(() => {
        vi.clearAllMocks();
        siteService = new SiteService({ siteManager });
    });

    describe("deleteSiteWithRelatedData", () => {
        it("delegates to SiteManager and returns deletion status", async () => {
            const identifier = "site-123";
            const site: Site = {
                identifier,
                monitoring: true,
                monitors: [
                    {
                        checkInterval: 60_000,
                        history: [],
                        id: "monitor-1",
                        monitoring: true,
                        responseTime: 0,
                        retryAttempts: 3,
                        status: "pending",
                        timeout: 5_000,
                        type: "http",
                        url: "https://example.com",
                    },
                ],
                name: "Integration",
            };

            vi.mocked(siteManager.getSiteWithDetails).mockResolvedValue(site);
            vi.mocked(siteManager.removeSite).mockResolvedValue(true);

            const result =
                await siteService.deleteSiteWithRelatedData(identifier);

            expect(result).toBe(true);
            expect(siteManager.getSiteWithDetails).toHaveBeenCalledWith(
                identifier
            );
            expect(siteManager.removeSite).toHaveBeenCalledWith(identifier);
        });

        it("propagates failure when SiteManager reports no deletion", async () => {
            const identifier = "missing-site";

            vi.mocked(siteManager.getSiteWithDetails).mockResolvedValue(
                undefined
            );
            vi.mocked(siteManager.removeSite).mockResolvedValue(false);

            const result =
                await siteService.deleteSiteWithRelatedData(identifier);

            expect(result).toBe(false);
            expect(siteManager.getSiteWithDetails).toHaveBeenCalledWith(
                identifier
            );
            expect(siteManager.removeSite).toHaveBeenCalledWith(identifier);
        });

        it("throws when identifier is invalid", async () => {
            await expect(
                siteService.deleteSiteWithRelatedData("" as unknown as string)
            ).rejects.toThrow("Invalid site identifier");
        });
    });

    describe("findByIdentifierWithDetails", () => {
        it("returns the site resolved by SiteManager", async () => {
            const identifier = "site-lookup";
            const site: Site = {
                identifier,
                monitoring: true,
                monitors: [],
                name: "Lookup",
            };

            vi.mocked(siteManager.getSiteWithDetails).mockResolvedValue(site);

            const result =
                await siteService.findByIdentifierWithDetails(identifier);

            expect(result).toBe(site);
            expect(siteManager.getSiteWithDetails).toHaveBeenCalledWith(
                identifier
            );
        });

        it("returns undefined when SiteManager cannot find the site", async () => {
            vi.mocked(siteManager.getSiteWithDetails).mockResolvedValue(
                undefined
            );

            const result =
                await siteService.findByIdentifierWithDetails("missing");

            expect(result).toBeUndefined();
            expect(siteManager.getSiteWithDetails).toHaveBeenCalledWith(
                "missing"
            );
        });
    });

    describe("getAllWithDetails", () => {
        it("returns sites provided by SiteManager", async () => {
            const sites: Site[] = [
                {
                    identifier: "site-1",
                    monitoring: true,
                    monitors: [],
                    name: "Site 1",
                },
            ];

            vi.mocked(siteManager.getSites).mockResolvedValue(sites);

            const result = await siteService.getAllWithDetails();

            expect(result).toBe(sites);
            expect(siteManager.getSites).toHaveBeenCalled();
        });
    });
});
