/**
 * Site Management Benchmarks.
 *
 * @packageDocumentation
 *
 * Exercises site management benchmark scenarios to measure service throughput and resilience.
 */

import { bench, describe } from "vitest";

/**
 * Represents site data in the site management benchmark.
 *
 * @remarks
 * This is a synthetic benchmark shape and intentionally does not match the
 * production Site domain type.
 */
interface BenchmarkSite {
    id: string;
    name: string;
    url: string;
    status: "online" | "offline" | "unknown" | "maintenance";
    isActive: boolean;
    checkInterval: number;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    metadata: Record<string, any>;
}

/**
 * Represents site create request data in the site management benchmark.
 */
interface BenchmarkSiteCreateRequest {
    name: string;
    url: string;
    checkInterval?: number;
    tags?: string[];
    metadata?: Record<string, any>;
}

/**
 * Represents site update request data in the site management benchmark.
 */
interface BenchmarkSiteUpdateRequest {
    name?: string;
    url?: string;
    isActive?: boolean;
    checkInterval?: number;
    tags?: string[];
    metadata?: Record<string, any>;
}

/**
 * Represents site filter data in the site management benchmark.
 */
interface BenchmarkSiteFilter {
    status?: string[];
    isActive?: boolean;
    tags?: string[];
    searchTerm?: string;
    createdAfter?: Date;
    createdBefore?: Date;
}

/**
 * Represents site pagination options data in the site management benchmark.
 */
interface BenchmarkSitePaginationOptions {
    page: number;
    limit: number;
    sortBy?: keyof BenchmarkSite;
    sortOrder?: "asc" | "desc";
}

/**
 * Represents paginated result data in the site management benchmark.
 */
interface BenchmarkPaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Mock site repository used to drive the site management benchmark.
 */
class MockSiteRepository {
    private sites = new Map<string, BenchmarkSite>();
    private nextId = 1;

    async create(siteData: BenchmarkSiteCreateRequest): Promise<BenchmarkSite> {
        const id = `site-${this.nextId++}`;
        const now = new Date();

        const site: BenchmarkSite = {
            id,
            name: siteData.name,
            url: siteData.url,
            status: "unknown",
            isActive: true,
            checkInterval: siteData.checkInterval || 300_000, // 5 minutes
            createdAt: now,
            updatedAt: now,
            tags: siteData.tags || [],
            metadata: siteData.metadata || {},
        };

        this.sites.set(id, site);
        return { ...site };
    }

    async findById(id: string): Promise<BenchmarkSite | null> {
        const site = this.sites.get(id);
        return site ? { ...site } : null;
    }

    async findAll(
        filter?: BenchmarkSiteFilter,
        pagination?: BenchmarkSitePaginationOptions
    ): Promise<BenchmarkPaginatedResult<BenchmarkSite>> {
        let sites = Array.from(this.sites.values());

        // Apply filters
        if (filter) {
            sites = this.applyFilters(sites, filter);
        }

        // Apply sorting
        if (pagination?.sortBy) {
            sites = this.applySorting(
                sites,
                pagination.sortBy,
                pagination.sortOrder || "asc"
            );
        }

        // Apply pagination
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;
        const offset = (page - 1) * limit;
        const paginatedSites = sites.slice(offset, offset + limit);

        return {
            data: paginatedSites.map((site) => ({ ...site })),
            total: sites.length,
            page,
            limit,
            totalPages: Math.ceil(sites.length / limit),
        };
    }

    async update(
        id: string,
        updates: BenchmarkSiteUpdateRequest
    ): Promise<BenchmarkSite | null> {
        const site = this.sites.get(id);
        if (!site) return null;

        const updatedSite: BenchmarkSite = {
            ...site,
            ...updates,
            updatedAt: new Date(),
        };

        this.sites.set(id, updatedSite);
        return { ...updatedSite };
    }

    async delete(id: string): Promise<boolean> {
        return this.sites.delete(id);
    }

    async findByUrl(url: string): Promise<BenchmarkSite | null> {
        for (const site of this.sites.values()) {
            if (site.url === url) {
                return { ...site };
            }
        }
        return null;
    }

    async findByStatus(
        status: BenchmarkSite["status"]
    ): Promise<BenchmarkSite[]> {
        return Array.from(this.sites.values())
            .filter((site) => site.status === status)
            .map((site) => ({ ...site }));
    }

    async updateStatus(
        id: string,
        status: BenchmarkSite["status"]
    ): Promise<BenchmarkSite | null> {
        const site = this.sites.get(id);
        if (!site) return null;

        site.status = status;
        site.updatedAt = new Date();

        return { ...site };
    }

    private applyFilters(
        sites: BenchmarkSite[],
        filter: BenchmarkSiteFilter
    ): BenchmarkSite[] {
        return sites.filter((site) => {
            if (filter.status && !filter.status.includes(site.status)) {
                return false;
            }

            if (
                filter.isActive !== undefined &&
                site.isActive !== filter.isActive
            ) {
                return false;
            }

            if (filter.tags && filter.tags.length > 0) {
                const hasTag = filter.tags.some((tag) =>
                    site.tags.includes(tag)
                );
                if (!hasTag) return false;
            }

            if (filter.searchTerm) {
                const searchLower = filter.searchTerm.toLowerCase();
                const matchesSearch =
                    site.name.toLowerCase().includes(searchLower) ||
                    site.url.toLowerCase().includes(searchLower) ||
                    site.tags.some((tag) =>
                        tag.toLowerCase().includes(searchLower)
                    );
                if (!matchesSearch) return false;
            }

            if (filter.createdAfter && site.createdAt < filter.createdAfter) {
                return false;
            }

            if (filter.createdBefore && site.createdAt > filter.createdBefore) {
                return false;
            }

            return true;
        });
    }

    private applySorting(
        sites: BenchmarkSite[],
        sortBy: keyof BenchmarkSite,
        sortOrder: "asc" | "desc"
    ): BenchmarkSite[] {
        return sites.toSorted((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];

            let comparison = 0;

            if (aValue < bValue) {
                comparison = -1;
            } else if (aValue > bValue) {
                comparison = 1;
            }

            return sortOrder === "desc" ? comparison * -1 : comparison;
        });
    }

    clear(): void {
        this.sites.clear();
        this.nextId = 1;
    }

    getCount(): number {
        return this.sites.size;
    }
}

/**
 * Mock event bus used to drive the site management benchmark.
 */
class MockEventBus {
    private handlers = new Map<string, Function[]>();

    emit(event: string, data: any): void {
        const eventHandlers = this.handlers.get(event) || [];
        eventHandlers.forEach((handler) => handler(data));
    }

    on(event: string, handler: Function): void {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)!.push(handler);
    }

    off(event: string, handler: Function): void {
        const handlers = this.handlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    clear(): void {
        this.handlers.clear();
    }
}

/**
 * Mock site management service used to drive the site management benchmark.
 */
class MockSiteManagementService {
    private repository: MockSiteRepository;
    private eventBus: MockEventBus;
    private urlValidator: RegExp;

    constructor() {
        this.repository = new MockSiteRepository();
        this.eventBus = new MockEventBus();
        this.urlValidator = /^https?:\/\/.+/;
    }

    async createSite(
        request: BenchmarkSiteCreateRequest
    ): Promise<BenchmarkSite> {
        // Validate input
        this.validateSiteRequest(request);

        // Check for duplicate URL
        const existingSite = await this.repository.findByUrl(request.url);
        if (existingSite) {
            throw new Error(`Site with URL ${request.url} already exists`);
        }

        // Create site
        const site = await this.repository.create(request);

        // Emit event
        this.eventBus.emit("site.created", { site });

        return site;
    }

    async updateSite(
        id: string,
        request: BenchmarkSiteUpdateRequest
    ): Promise<BenchmarkSite> {
        // Validate input
        if (request.url) {
            this.validateUrl(request.url);
        }

        // Check if site exists
        const existingSite = await this.repository.findById(id);
        if (!existingSite) {
            throw new Error(`Site with ID ${id} not found`);
        }

        // Check for URL conflicts
        if (request.url && request.url !== existingSite.url) {
            const urlConflict = await this.repository.findByUrl(request.url);
            if (urlConflict) {
                throw new Error(`Site with URL ${request.url} already exists`);
            }
        }

        // Update site
        const updatedSite = await this.repository.update(id, request);

        // Emit event
        this.eventBus.emit("site.updated", {
            site: updatedSite,
            previous: existingSite,
        });

        return updatedSite!;
    }

    async deleteSite(id: string): Promise<void> {
        // Check if site exists
        const site = await this.repository.findById(id);
        if (!site) {
            throw new Error(`Site with ID ${id} not found`);
        }

        // Delete site
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new Error(`Failed to delete site with ID ${id}`);
        }

        // Emit event
        this.eventBus.emit("site.deleted", { site });
    }

    async getSite(id: string): Promise<BenchmarkSite> {
        const site = await this.repository.findById(id);
        if (!site) {
            throw new Error(`Site with ID ${id} not found`);
        }
        return site;
    }

    async getSites(
        filter?: BenchmarkSiteFilter,
        pagination?: BenchmarkSitePaginationOptions
    ): Promise<BenchmarkPaginatedResult<BenchmarkSite>> {
        return await this.repository.findAll(filter, pagination);
    }

    async updateSiteStatus(
        id: string,
        status: BenchmarkSite["status"]
    ): Promise<BenchmarkSite> {
        const site = await this.repository.findById(id);
        if (!site) {
            throw new Error(`Site with ID ${id} not found`);
        }

        const previousStatus = site.status;
        const updatedSite = await this.repository.updateStatus(id, status);

        // Emit status change event
        this.eventBus.emit("site.status.changed", {
            site: updatedSite,
            previousStatus,
            newStatus: status,
        });

        return updatedSite!;
    }

    async getSitesByStatus(
        status: BenchmarkSite["status"]
    ): Promise<BenchmarkSite[]> {
        return await this.repository.findByStatus(status);
    }

    async bulkUpdateSites(
        updates: { id: string; data: BenchmarkSiteUpdateRequest }[]
    ): Promise<BenchmarkSite[]> {
        const results: BenchmarkSite[] = [];

        for (const update of updates) {
            try {
                const updatedSite = await this.updateSite(
                    update.id,
                    update.data
                );
                results.push(updatedSite);
            } catch (error) {
                // Log error but continue with other updates
                console.error(`Failed to update site ${update.id}:`, error);
            }
        }

        // Emit bulk update event
        this.eventBus.emit("sites.bulk.updated", {
            updated: results,
            attempted: updates.length,
        });

        return results;
    }

    async archiveSite(id: string): Promise<BenchmarkSite> {
        return await this.updateSite(id, { isActive: false });
    }

    async activateSite(id: string): Promise<BenchmarkSite> {
        return await this.updateSite(id, { isActive: true });
    }

    async searchSites(
        searchTerm: string,
        options?: {
            limit?: number;
            includeInactive?: boolean;
        }
    ): Promise<BenchmarkSite[]> {
        const filter: BenchmarkSiteFilter = {
            searchTerm,
            isActive: options?.includeInactive ? undefined : true,
        };

        const pagination: BenchmarkSitePaginationOptions = {
            page: 1,
            limit: options?.limit || 50,
            sortBy: "name",
            sortOrder: "asc",
        };

        const result = await this.repository.findAll(filter, pagination);
        return result.data;
    }

    private validateSiteRequest(request: BenchmarkSiteCreateRequest): void {
        if (!request.name || request.name.trim().length === 0) {
            throw new Error("Site name is required");
        }

        if (!request.url) {
            throw new Error("Site URL is required");
        }

        this.validateUrl(request.url);

        if (request.checkInterval && request.checkInterval < 60_000) {
            throw new Error("Check interval must be at least 60 seconds");
        }
    }

    private validateUrl(url: string): void {
        if (!this.urlValidator.test(url)) {
            throw new Error("Invalid URL format");
        }
    }

    getStatistics(): any {
        return {
            totalSites: this.repository.getCount(),
            eventHandlers: this.eventBus["handlers"].size,
        };
    }

    reset(): void {
        this.repository.clear();
        this.eventBus.clear();
    }
}

// Helper functions for creating test data
/**
 * Creates site request for the site management benchmark.
 */
function createSiteRequest(index: number): BenchmarkSiteCreateRequest {
    return {
        name: `Site ${index}`,
        url: `https://site${index}.example.com`,
        checkInterval: 300_000 + index * 60_000,
        tags: [`tag${index}`, `category${index % 3}`],
        metadata: {
            owner: `owner${index}`,
            priority: index % 5,
            description: `Description for site ${index}`,
        },
    };
}

/**
 * Creates bulk sites for the site management benchmark.
 */
function createBulkSites(count: number): BenchmarkSiteCreateRequest[] {
    return Array.from({ length: count }, (_, i) => createSiteRequest(i + 1));
}

describe("Site Management Service Performance", () => {
    let service: MockSiteManagementService;

    bench(
        "service initialization",
        () => {
            service = new MockSiteManagementService();
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "create single site",
        () => {
            service = new MockSiteManagementService();
            const request = createSiteRequest(1);
            service.createSite(request);
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "create site with validation",
        () => {
            service = new MockSiteManagementService();
            const request: BenchmarkSiteCreateRequest = {
                name: "Complex Site",
                url: "https://complex-site.example.com/path?param=value",
                checkInterval: 120_000,
                tags: [
                    "production",
                    "critical",
                    "api",
                    "monitoring",
                ],
                metadata: {
                    owner: "team-platform",
                    environment: "production",
                    region: "us-east-1",
                    alertChannels: [
                        "slack",
                        "email",
                        "pagerduty",
                    ],
                    dependencies: [
                        "database",
                        "cache",
                        "cdn",
                    ],
                    maintenanceWindow: "02:00-04:00 UTC",
                },
            };
            service.createSite(request);
        },
        { warmupIterations: 10, iterations: 3000 }
    );

    bench(
        "get site by ID",
        () => {
            service = new MockSiteManagementService();
            // Setup
            const request = createSiteRequest(1);
            service.createSite(request).then((site) => {
                service.getSite(site.id);
            });
        },
        { warmupIterations: 10, iterations: 8000 }
    );

    bench(
        "update site",
        () => {
            service = new MockSiteManagementService();
            const request = createSiteRequest(1);
            service.createSite(request).then((site) => {
                service.updateSite(site.id, {
                    name: "Updated Site Name",
                    checkInterval: 600_000,
                    tags: ["updated", "modified"],
                });
            });
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "update site status",
        () => {
            service = new MockSiteManagementService();
            const request = createSiteRequest(1);
            service.createSite(request).then((site) => {
                service.updateSiteStatus(site.id, "online");
            });
        },
        { warmupIterations: 10, iterations: 8000 }
    );

    bench(
        "delete site",
        () => {
            service = new MockSiteManagementService();
            const request = createSiteRequest(1);
            service.createSite(request).then((site) => {
                service.deleteSite(site.id);
            });
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "get all sites without pagination",
        () => {
            service = new MockSiteManagementService();
            // Setup multiple sites
            const sites = createBulkSites(50);
            Promise.all(sites.map((site) => service.createSite(site))).then(
                () => {
                    service.getSites();
                }
            );
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "get sites with pagination",
        () => {
            service = new MockSiteManagementService();
            const sites = createBulkSites(100);
            Promise.all(sites.map((site) => service.createSite(site))).then(
                () => {
                    service.getSites(undefined, {
                        page: 2,
                        limit: 20,
                        sortBy: "name",
                        sortOrder: "asc",
                    });
                }
            );
        },
        { warmupIterations: 5, iterations: 300 }
    );

    bench(
        "filter sites by status",
        () => {
            service = new MockSiteManagementService();
            const sites = createBulkSites(75);
            Promise.all(sites.map((site) => service.createSite(site))).then(
                () => {
                    service.getSites({
                        status: ["online", "offline"],
                        isActive: true,
                    });
                }
            );
        },
        { warmupIterations: 5, iterations: 400 }
    );

    bench(
        "search sites",
        () => {
            service = new MockSiteManagementService();
            const sites = createBulkSites(60);
            Promise.all(sites.map((site) => service.createSite(site))).then(
                () => {
                    service.searchSites("site", { limit: 10 });
                }
            );
        },
        { warmupIterations: 5, iterations: 600 }
    );

    bench(
        "bulk update sites",
        () => {
            service = new MockSiteManagementService();
            const sites = createBulkSites(30);
            Promise.all(sites.map((site) => service.createSite(site))).then(
                (createdSites) => {
                    const updates = createdSites.slice(0, 10).map((site) => ({
                        id: site.id,
                        data: { isActive: false, tags: ["bulk-updated"] },
                    }));
                    service.bulkUpdateSites(updates);
                }
            );
        },
        { warmupIterations: 5, iterations: 200 }
    );

    bench(
        "get sites by status",
        () => {
            service = new MockSiteManagementService();
            const sites = createBulkSites(40);
            Promise.all(sites.map((site) => service.createSite(site))).then(
                (createdSites) => {
                    // Update some sites to online status
                    const statusUpdates = createdSites
                        .slice(0, 20)
                        .map((site) =>
                            service.updateSiteStatus(site.id, "online")
                        );
                    Promise.all(statusUpdates).then(() => {
                        service.getSitesByStatus("online");
                    });
                }
            );
        },
        { warmupIterations: 5, iterations: 400 }
    );

    bench(
        "archive site",
        () => {
            service = new MockSiteManagementService();
            const request = createSiteRequest(1);
            service.createSite(request).then((site) => {
                service.archiveSite(site.id);
            });
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "activate site",
        () => {
            service = new MockSiteManagementService();
            const request = createSiteRequest(1);
            service.createSite(request).then((site) => {
                service.archiveSite(site.id).then(() => {
                    service.activateSite(site.id);
                });
            });
        },
        { warmupIterations: 10, iterations: 3000 }
    );

    bench(
        "complex filtering and sorting",
        () => {
            service = new MockSiteManagementService();
            const sites = createBulkSites(80);
            Promise.all(sites.map((site) => service.createSite(site))).then(
                () => {
                    service.getSites(
                        {
                            isActive: true,
                            tags: [
                                "tag1",
                                "tag2",
                                "category1",
                            ],
                            searchTerm: "site",
                            createdAfter: new Date(Date.now() - 86_400_000), // 24 hours ago
                        },
                        {
                            page: 1,
                            limit: 25,
                            sortBy: "createdAt",
                            sortOrder: "desc",
                        }
                    );
                }
            );
        },
        { warmupIterations: 5, iterations: 150 }
    );

    bench(
        "service statistics",
        () => {
            service = new MockSiteManagementService();
            const sites = createBulkSites(25);
            Promise.all(sites.map((site) => service.createSite(site))).then(
                () => {
                    service.getStatistics();
                }
            );
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "service reset",
        () => {
            service = new MockSiteManagementService();
            const sites = createBulkSites(20);
            Promise.all(sites.map((site) => service.createSite(site))).then(
                () => {
                    service.reset();
                }
            );
        },
        { warmupIterations: 10, iterations: 800 }
    );
});
