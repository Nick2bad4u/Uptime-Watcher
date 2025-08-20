/**
 * Site Repository Performance Benchmarks
 *
 * @file Performance benchmarks for site repository operations including CRUD
 *   operations, bulk operations, and query performance.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Database-SiteRepository
 *
 * @tags ["performance", "database", "repository", "sites", "crud"]
 */

import { bench, describe } from "vitest";

// Mock database connection
class MockDatabase {
    private sites: any[] = [];
    private nextId = 1;

    prepare(sql: string) {
        return {
            run: (...params: any[]) => {
                if (sql.includes("INSERT")) {
                    const site = { id: this.nextId++, ...params };
                    this.sites.push(site);
                    return { lastInsertRowid: site.id };
                }
                if (sql.includes("UPDATE")) {
                    const index = this.sites.findIndex(
                        (s) => s.id === params.at(-1)
                    );
                    if (index !== -1) {
                        this.sites[index] = { ...this.sites[index], ...params };
                    }
                    return { changes: index === -1 ? 0 : 1 };
                }
                if (sql.includes("DELETE")) {
                    const index = this.sites.findIndex(
                        (s) => s.id === params[0]
                    );
                    if (index !== -1) {
                        this.sites.splice(index, 1);
                    }
                    return { changes: index === -1 ? 0 : 1 };
                }
                return {};
            },
            get: (...params: any[]) => {
                if (sql.includes("SELECT") && params.length > 0) {
                    return this.sites.find((s) => s.id === params[0]);
                }
                return this.sites[0];
            },
            all: () => this.sites,
        };
    }

    exec(sql: string) {
        return this;
    }
}

// Mock SiteRepository
class MockSiteRepository {
    private db: MockDatabase;

    constructor() {
        this.db = new MockDatabase();
        this.initialize();
    }

    private initialize() {
        // Seed with test data
        for (let i = 0; i < 1000; i++) {
            this.create({
                name: `Site ${i}`,
                url: `https://example${i}.com`,
                isActive: Math.random() > 0.5,
                checkInterval: 60_000,
                timeout: 5000,
                metadata: JSON.stringify({ type: "test", priority: i % 5 }),
            });
        }
    }

    create(site: any) {
        const stmt = this.db.prepare(`
            INSERT INTO sites (name, url, isActive, checkInterval, timeout, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            site.name,
            site.url,
            site.isActive,
            site.checkInterval,
            site.timeout,
            site.metadata
        );
    }

    findById(id: number) {
        const stmt = this.db.prepare("SELECT * FROM sites WHERE id = ?");
        return stmt.get(id);
    }

    findAll() {
        const stmt = this.db.prepare("SELECT * FROM sites");
        return stmt.all();
    }

    findActive() {
        const stmt = this.db.prepare("SELECT * FROM sites WHERE isActive = 1");
        return stmt.all();
    }

    update(id: number, updates: any) {
        const stmt = this.db.prepare(`
            UPDATE sites SET name = ?, url = ?, isActive = ?, checkInterval = ?, timeout = ?, metadata = ?
            WHERE id = ?
        `);
        return stmt.run(
            updates.name,
            updates.url,
            updates.isActive,
            updates.checkInterval,
            updates.timeout,
            updates.metadata,
            id
        );
    }

    delete(id: number) {
        const stmt = this.db.prepare("DELETE FROM sites WHERE id = ?");
        return stmt.run(id);
    }

    bulkCreate(sites: any[]) {
        const stmt = this.db.prepare(`
            INSERT INTO sites (name, url, isActive, checkInterval, timeout, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        return sites.map((site) =>
            stmt.run(
                site.name,
                site.url,
                site.isActive,
                site.checkInterval,
                site.timeout,
                site.metadata
            )
        );
    }

    search(query: string) {
        const stmt = this.db.prepare(
            "SELECT * FROM sites WHERE name LIKE ? OR url LIKE ?"
        );
        return stmt.all();
    }
}

describe("Site Repository Performance", () => {
    let repository: MockSiteRepository;

    bench(
        "repository initialization",
        () => {
            repository = new MockSiteRepository();
        },
        { warmupIterations: 10, iterations: 100 }
    );

    bench(
        "create single site",
        () => {
            repository = new MockSiteRepository();
            repository.create({
                name: "Test Site",
                url: "https://test.com",
                isActive: true,
                checkInterval: 60_000,
                timeout: 5000,
                metadata: JSON.stringify({ type: "test" }),
            });
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "find site by id",
        () => {
            repository = new MockSiteRepository();
            repository.findById(Math.floor(Math.random() * 1000) + 1);
        },
        { warmupIterations: 5, iterations: 10_000 }
    );

    bench(
        "find all sites",
        () => {
            repository = new MockSiteRepository();
            repository.findAll();
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "find active sites",
        () => {
            repository = new MockSiteRepository();
            repository.findActive();
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "update site",
        () => {
            repository = new MockSiteRepository();
            const id = Math.floor(Math.random() * 1000) + 1;
            repository.update(id, {
                name: "Updated Site",
                url: "https://updated.com",
                isActive: false,
                checkInterval: 120_000,
                timeout: 10_000,
                metadata: JSON.stringify({ type: "updated" }),
            });
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "delete site",
        () => {
            repository = new MockSiteRepository();
            const id = Math.floor(Math.random() * 1000) + 1;
            repository.delete(id);
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "bulk create sites (100 sites)",
        () => {
            repository = new MockSiteRepository();
            const sites = Array.from({ length: 100 }, (_, i) => ({
                name: `Bulk Site ${i}`,
                url: `https://bulk${i}.com`,
                isActive: true,
                checkInterval: 60_000,
                timeout: 5000,
                metadata: JSON.stringify({ type: "bulk" }),
            }));
            repository.bulkCreate(sites);
        },
        { warmupIterations: 2, iterations: 50 }
    );

    bench(
        "search sites",
        () => {
            repository = new MockSiteRepository();
            repository.search("Site");
        },
        { warmupIterations: 5, iterations: 500 }
    );
});
