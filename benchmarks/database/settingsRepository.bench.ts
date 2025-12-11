/**
 * Settings Repository Performance Benchmarks
 *
 * @file Performance benchmarks for settings repository operations including
 *   configuration management, bulk updates, and validation.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Database-SettingsRepository
 *
 * @tags ["performance", "database", "repository", "settings", "configuration"]
 */

import { bench, describe } from "vitest";

// Mock database connection
class MockDatabase {
    private settings = new Map<string, any>();

    prepare(sql: string) {
        return {
            run: (...params: any[]) => {
                if (sql.includes("INSERT OR REPLACE")) {
                    this.settings.set(params[0], {
                        key: params[0],
                        value: params[1],
                        type: params[2],
                        category: params[3],
                        isSystem: params[4],
                        updatedAt: Date.now(),
                    });
                    return { lastInsertRowid: 1 };
                }
                if (sql.includes("DELETE")) {
                    const deleted = this.settings.has(params[0]);
                    this.settings.delete(params[0]);
                    return { changes: deleted ? 1 : 0 };
                }
                return {};
            },
            get: (...params: any[]) => this.settings.get(params[0]) || null,
            all: () => {
                if (sql.includes("WHERE category =")) {
                    return Array.from(this.settings.values()).filter(
                        (s) => s.category === "test"
                    );
                }
                if (sql.includes("WHERE isSystem =")) {
                    return Array.from(this.settings.values()).filter(
                        (s) => !s.isSystem
                    );
                }
                return Array.from(this.settings.values());
            },
        };
    }

    exec(sql: string) {
        return this;
    }
}

// Mock SettingsRepository
class MockSettingsRepository {
    private db: MockDatabase;

    constructor() {
        this.db = new MockDatabase();
        this.initialize();
    }

    private initialize() {
        // Seed with test data
        const defaultSettings = [
            {
                key: "app.theme",
                value: "dark",
                type: "string",
                category: "appearance",
            },
            {
                key: "app.systemNotificationsEnabled",
                value: "true",
                type: "boolean",
                category: "notifications",
            },
            {
                key: "monitor.defaultInterval",
                value: "60000",
                type: "number",
                category: "monitoring",
            },
            {
                key: "monitor.timeout",
                value: "5000",
                type: "number",
                category: "monitoring",
            },
            {
                key: "monitor.retries",
                value: "3",
                type: "number",
                category: "monitoring",
            },
            {
                key: "ui.autoRefresh",
                value: "true",
                type: "boolean",
                category: "ui",
            },
            {
                key: "ui.refreshInterval",
                value: "30000",
                type: "number",
                category: "ui",
            },
            {
                key: "logging.level",
                value: "info",
                type: "string",
                category: "system",
            },
            {
                key: "logging.maxFiles",
                value: "5",
                type: "number",
                category: "system",
            },
            {
                key: "backup.enabled",
                value: "true",
                type: "boolean",
                category: "backup",
            },
        ];

        defaultSettings.forEach((setting, index) => {
            this.set(
                setting.key,
                setting.value,
                setting.type,
                setting.category,
                index < 5
            );
        });

        // Add more test settings
        for (let i = 0; i < 100; i++) {
            this.set(`test.setting${i}`, `value${i}`, "string", "test", false);
        }
    }

    set(
        key: string,
        value: string,
        type: string = "string",
        category: string = "general",
        isSystem: boolean = false
    ) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO settings (key, value, type, category, isSystem, updatedAt)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `);
        return stmt.run(key, value, type, category, isSystem);
    }

    get(key: string) {
        const stmt = this.db.prepare("SELECT * FROM settings WHERE key = ?");
        return stmt.get(key);
    }

    getTyped(key: string) {
        const setting = this.get(key);
        if (!setting) return null;

        switch (setting.type) {
            case "boolean": {
                return setting.value === "true";
            }
            case "number": {
                return Number.parseFloat(setting.value);
            }
            case "json": {
                try {
                    return JSON.parse(setting.value);
                } catch {
                    return null;
                }
            }
            default: {
                return setting.value;
            }
        }
    }

    getAll() {
        const stmt = this.db.prepare(
            "SELECT * FROM settings ORDER BY category, key"
        );
        return stmt.all();
    }

    getByCategory(category: string) {
        const stmt = this.db.prepare(
            "SELECT * FROM settings WHERE category = ? ORDER BY key"
        );
        return stmt.all();
    }

    getUserSettings() {
        const stmt = this.db.prepare(
            "SELECT * FROM settings WHERE isSystem = 0 ORDER BY category, key"
        );
        return stmt.all();
    }

    getSystemSettings() {
        const stmt = this.db.prepare(
            "SELECT * FROM settings WHERE isSystem = 1 ORDER BY key"
        );
        return stmt.all();
    }

    update(key: string, value: string) {
        return this.set(key, value);
    }

    delete(key: string) {
        const stmt = this.db.prepare("DELETE FROM settings WHERE key = ?");
        return stmt.run(key);
    }

    bulkUpdate(
        settings: {
            key: string;
            value: string;
            type?: string;
            category?: string;
        }[]
    ) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO settings (key, value, type, category, isSystem, updatedAt)
            VALUES (?, ?, ?, ?, 0, datetime('now'))
        `);
        return settings.map((setting) =>
            stmt.run(
                setting.key,
                setting.value,
                setting.type || "string",
                setting.category || "general"
            ));
    }

    reset(category?: string) {
        if (category) {
            const stmt = this.db.prepare(
                "DELETE FROM settings WHERE category = ? AND isSystem = 0"
            );
            return stmt.run(category);
        }
        const stmt = this.db.prepare("DELETE FROM settings WHERE isSystem = 0");
        return stmt.run();
    }

    export() {
        const settings = this.getAll();
        return settings.reduce((acc: any, setting: any) => {
            acc[setting.key] = {
                value: setting.value,
                type: setting.type,
                category: setting.category,
            };
            return acc;
        }, {});
    }

    import(settingsData: any) {
        const settings = Object.entries(settingsData).map(([
            key,
            data,
        ]: [
            string,
            any,
        ]) => ({
            key,
            value: data.value,
            type: data.type || "string",
            category: data.category || "general",
        }));
        return this.bulkUpdate(settings);
    }

    validate(key: string, value: string, type: string) {
        switch (type) {
            case "boolean": {
                return value === "true" || value === "false";
            }
            case "number": {
                return !Number.isNaN(Number.parseFloat(value));
            }
            case "json": {
                try {
                    JSON.parse(value);
                    return true;
                } catch {
                    return false;
                }
            }
            default: {
                return true;
            }
        }
    }

    getCategories() {
        const settings = this.getAll();
        return Array.from(new Set(settings.map((s: any) => s.category)));
    }
}

describe("Settings Repository Performance", () => {
    let repository: MockSettingsRepository;

    bench(
        "repository initialization",
        () => {
            repository = new MockSettingsRepository();
        },
        { warmupIterations: 10, iterations: 100 }
    );

    bench(
        "set single setting",
        () => {
            repository = new MockSettingsRepository();
            repository.set("test.benchmark", "value", "string", "test");
        },
        { warmupIterations: 5, iterations: 5000 }
    );

    bench(
        "get setting by key",
        () => {
            repository = new MockSettingsRepository();
            repository.get("app.theme");
        },
        { warmupIterations: 5, iterations: 10_000 }
    );

    bench(
        "get typed setting",
        () => {
            repository = new MockSettingsRepository();
            repository.getTyped("monitor.defaultInterval");
        },
        { warmupIterations: 5, iterations: 10_000 }
    );

    bench(
        "get all settings",
        () => {
            repository = new MockSettingsRepository();
            repository.getAll();
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "get settings by category",
        () => {
            repository = new MockSettingsRepository();
            repository.getByCategory("monitoring");
        },
        { warmupIterations: 5, iterations: 2000 }
    );

    bench(
        "get user settings",
        () => {
            repository = new MockSettingsRepository();
            repository.getUserSettings();
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "get system settings",
        () => {
            repository = new MockSettingsRepository();
            repository.getSystemSettings();
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "update setting",
        () => {
            repository = new MockSettingsRepository();
            repository.update("app.theme", "light");
        },
        { warmupIterations: 5, iterations: 5000 }
    );

    bench(
        "delete setting",
        () => {
            repository = new MockSettingsRepository();
            repository.delete("test.setting1");
        },
        { warmupIterations: 5, iterations: 2000 }
    );

    bench(
        "bulk update settings (20 settings)",
        () => {
            repository = new MockSettingsRepository();
            const settings = Array.from({ length: 20 }, (_, i) => ({
                key: `bulk.setting${i}`,
                value: `bulkValue${i}`,
                type: "string",
                category: "bulk",
            }));
            repository.bulkUpdate(settings);
        },
        { warmupIterations: 2, iterations: 500 }
    );

    bench(
        "reset category settings",
        () => {
            repository = new MockSettingsRepository();
            repository.reset("test");
        },
        { warmupIterations: 5, iterations: 200 }
    );

    bench(
        "export settings",
        () => {
            repository = new MockSettingsRepository();
            repository.export();
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "import settings",
        () => {
            repository = new MockSettingsRepository();
            const settingsData = {
                "import.setting1": {
                    value: "value1",
                    type: "string",
                    category: "import",
                },
                "import.setting2": {
                    value: "true",
                    type: "boolean",
                    category: "import",
                },
                "import.setting3": {
                    value: "42",
                    type: "number",
                    category: "import",
                },
            };
            repository.import(settingsData);
        },
        { warmupIterations: 2, iterations: 500 }
    );

    bench(
        "validate setting value",
        () => {
            repository = new MockSettingsRepository();
            repository.validate("test.number", "123", "number");
            repository.validate("test.boolean", "true", "boolean");
            repository.validate("test.json", '{"key":"value"}', "json");
        },
        { warmupIterations: 5, iterations: 10_000 }
    );

    bench(
        "get categories",
        () => {
            repository = new MockSettingsRepository();
            repository.getCategories();
        },
        { warmupIterations: 5, iterations: 2000 }
    );
});
