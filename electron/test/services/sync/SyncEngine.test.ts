import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { FilesystemCloudStorageProvider } from "@electron/services/cloud/providers/FilesystemCloudStorageProvider";
import { SyncEngine } from "@electron/services/sync/SyncEngine";
import type { Monitor, Site } from "@shared/types";
import { describe, expect, it, vi } from "vitest";

/* eslint-disable unicorn/numeric-separators-style -- Test constants like 1_000 / 60_000 don't match the project's strict grouping rule; readability here is preferred. */

class InMemorySettingsAdapter {
    private readonly store = new Map<string, string>();

    public async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    public async get(key: string): Promise<string | undefined> {
        return this.store.get(key);
    }

    public async getAll(): Promise<Record<string, string>> {
        return Object.fromEntries(this.store.entries());
    }

    public async set(key: string, value: string): Promise<void> {
        this.store.set(key, value);
    }
}

class InMemoryOrchestrator {
    private sites: Site[];

    public constructor(initialSites: Site[]) {
        this.sites = initialSites;
    }

    public async addSite(site: Site): Promise<Site> {
        this.sites = [...this.sites, site];
        return site;
    }

    public async getSites(): Promise<Site[]> {
        return this.sites;
    }

    public async removeSite(identifier: string): Promise<boolean> {
        const before = this.sites.length;
        this.sites = this.sites.filter(
            (site) => site.identifier !== identifier
        );
        return this.sites.length !== before;
    }

    public async updateSite(
        identifier: string,
        updates: Partial<Site>
    ): Promise<Site> {
        let updated: Site | undefined;
        this.sites = this.sites.map((site) => {
            if (site.identifier !== identifier) {
                return site;
            }

            updated = { ...site, ...updates };
            return updated;
        });

        if (!updated) {
            throw new Error(`Site not found: ${identifier}`);
        }

        return updated;
    }
}

function createMonitor(args: {
    id: string;
    monitoring: boolean;
    type: Monitor["type"];
    url?: string;
}): Monitor {
    return {
        checkInterval: 60_000,
        history: [],
        id: args.id,
        monitoring: args.monitoring,
        responseTime: 0,
        retryAttempts: 0,
        status: "pending",
        timeout: 5_000,
        type: args.type,
        url: args.url,
    };
}

function canonicalizeSites(sites: Site[]): unknown {
    return sites
        .map((site) => ({
            identifier: site.identifier,
            monitoring: site.monitoring,
            monitors: site.monitors
                .map((monitor) => ({
                    checkInterval: monitor.checkInterval,
                    id: monitor.id,
                    monitoring: monitor.monitoring,
                    retryAttempts: monitor.retryAttempts,
                    timeout: monitor.timeout,
                    type: monitor.type,
                    url: monitor.url,
                }))
                .toSorted((a, b) => a.id.localeCompare(b.id)),
            name: site.name,
        }))
        .toSorted((a, b) => a.identifier.localeCompare(b.identifier));
}

describe("SyncEngine (ADR-016)", () => {
    it("converges configuration across two devices", async () => {
        vi.useFakeTimers();

        const baseDirectory = await fs.mkdtemp(
            path.join(os.tmpdir(), "uptime-watcher-sync-")
        );

        try {
            const provider = new FilesystemCloudStorageProvider({
                baseDirectory,
            });

            const siteA: Site = {
                identifier: "example.com",
                monitoring: true,
                monitors: [
                    createMonitor({
                        id: "monitor-1",
                        monitoring: true,
                        type: "http",
                        url: "https://example.com",
                    }),
                ],
                name: "Example",
            };

            const orchestratorA = new InMemoryOrchestrator([siteA]);
            const settingsA = new InMemorySettingsAdapter();
            const engineA = new SyncEngine({
                orchestrator: orchestratorA,
                settings: settingsA,
            });

            vi.setSystemTime(new Date(1_000));
            await engineA.syncNow(provider);

            const orchestratorB = new InMemoryOrchestrator([]);
            const settingsB = new InMemorySettingsAdapter();
            const engineB = new SyncEngine({
                orchestrator: orchestratorB,
                settings: settingsB,
            });

            vi.setSystemTime(new Date(2_000));
            await engineB.syncNow(provider);

            expect(canonicalizeSites(await orchestratorB.getSites())).toEqual(
                canonicalizeSites(await orchestratorA.getSites())
            );

            await orchestratorB.updateSite("example.com", {
                name: "Example Renamed",
            });

            vi.setSystemTime(new Date(3_000));
            await engineB.syncNow(provider);

            vi.setSystemTime(new Date(4_000));
            await engineA.syncNow(provider);

            expect(canonicalizeSites(await orchestratorA.getSites())).toEqual(
                canonicalizeSites(await orchestratorB.getSites())
            );
            expect((await orchestratorA.getSites())[0]?.name).toBe(
                "Example Renamed"
            );
        } finally {
            vi.useRealTimers();
            await fs.rm(baseDirectory, { force: true, recursive: true });
        }
    });
});

/* eslint-enable unicorn/numeric-separators-style */
