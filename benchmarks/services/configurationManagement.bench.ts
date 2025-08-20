/**
 * Configuration Management Service Performance Benchmarks
 *
 * @file Performance benchmarks for application configuration and settings
 *   management.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Services-ConfigurationManagement
 *
 * @tags ["performance", "services", "configuration", "settings"]
 */

import { bench, describe } from "vitest";

type ConfigurationSchema = Record<
    string,
    {
        type: "string" | "number" | "boolean" | "object" | "array";
        default?: any;
        required?: boolean;
        validation?: (value: any) => boolean;
        description?: string;
        group?: string;
    }
>;

interface ConfigurationValue {
    key: string;
    value: any;
    type: string;
    lastModified: Date;
    modifiedBy?: string;
    version: number;
}

interface ConfigurationGroup {
    name: string;
    description?: string;
    settings: ConfigurationValue[];
    metadata: Record<string, any>;
}

interface ConfigChangeEvent {
    key: string;
    oldValue: any;
    newValue: any;
    timestamp: Date;
    source: string;
    userId?: string;
}

interface ConfigValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

interface ConfigBackup {
    id: string;
    timestamp: Date;
    configuration: Record<string, any>;
    metadata: {
        version: string;
        source: string;
        reason?: string;
    };
}

class MockConfigurationRepository {
    private configurations = new Map<string, ConfigurationValue>();
    private changeHistory: ConfigChangeEvent[] = [];
    private backups = new Map<string, ConfigBackup>();
    private nextBackupId = 1;

    async get(key: string): Promise<ConfigurationValue | null> {
        const config = this.configurations.get(key);
        return config ? { ...config } : null;
    }

    async set(
        key: string,
        value: any,
        metadata?: { modifiedBy?: string }
    ): Promise<ConfigurationValue> {
        const existing = this.configurations.get(key);
        const now = new Date();

        const config: ConfigurationValue = {
            key,
            value,
            type: typeof value,
            lastModified: now,
            modifiedBy: metadata?.modifiedBy,
            version: existing ? existing.version + 1 : 1,
        };

        this.configurations.set(key, config);

        // Record change
        if (existing) {
            this.changeHistory.push({
                key,
                oldValue: existing.value,
                newValue: value,
                timestamp: now,
                source: "api",
                userId: metadata?.modifiedBy,
            });
        }

        return { ...config };
    }

    async getAll(): Promise<ConfigurationValue[]> {
        return Array.from(this.configurations.values()).map((config) => ({
            ...config,
        }));
    }

    async getByGroup(
        group: string,
        schema: ConfigurationSchema
    ): Promise<ConfigurationValue[]> {
        const groupKeys = Object.keys(schema).filter(
            (key) => schema[key].group === group
        );
        const results: ConfigurationValue[] = [];

        for (const key of groupKeys) {
            const config = this.configurations.get(key);
            if (config) {
                results.push({ ...config });
            }
        }

        return results;
    }

    async delete(key: string): Promise<boolean> {
        const existing = this.configurations.get(key);
        if (!existing) return false;

        this.configurations.delete(key);

        this.changeHistory.push({
            key,
            oldValue: existing.value,
            newValue: undefined,
            timestamp: new Date(),
            source: "api",
        });

        return true;
    }

    async getChangeHistory(
        key?: string,
        limit?: number
    ): Promise<ConfigChangeEvent[]> {
        let history = [...this.changeHistory];

        if (key) {
            history = history.filter((event) => event.key === key);
        }

        // Sort by timestamp descending
        history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        if (limit) {
            history = history.slice(0, limit);
        }

        return history;
    }

    async createBackup(reason?: string): Promise<ConfigBackup> {
        const id = `backup-${this.nextBackupId++}`;
        const configuration: Record<string, any> = {};

        for (const [key, config] of Array.from(this.configurations.entries())) {
            configuration[key] = config.value;
        }

        const backup: ConfigBackup = {
            id,
            timestamp: new Date(),
            configuration,
            metadata: {
                version: "1.0.0",
                source: "manual",
                reason,
            },
        };

        this.backups.set(id, backup);
        return { ...backup };
    }

    async restoreBackup(backupId: string): Promise<boolean> {
        const backup = this.backups.get(backupId);
        if (!backup) return false;

        // Clear current configuration
        this.configurations.clear();

        // Restore from backup
        for (const [key, value] of Object.entries(backup.configuration)) {
            await this.set(key, value, { modifiedBy: "system-restore" });
        }

        return true;
    }

    async getBackups(): Promise<ConfigBackup[]> {
        return Array.from(this.backups.values()).map((backup) => ({
            ...backup,
        }));
    }

    clear(): void {
        this.configurations.clear();
        this.changeHistory = [];
        this.backups.clear();
        this.nextBackupId = 1;
    }

    getStats(): any {
        return {
            totalConfigurations: this.configurations.size,
            totalChanges: this.changeHistory.length,
            totalBackups: this.backups.size,
        };
    }
}

class MockEventEmitter {
    private listeners = new Map<string, Function[]>();

    emit(event: string, data: any): void {
        const handlers = this.listeners.get(event) || [];
        handlers.forEach((handler) => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }

    on(event: string, handler: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(handler);
    }

    off(event: string, handler: Function): void {
        const handlers = this.listeners.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    clear(): void {
        this.listeners.clear();
    }
}

class MockConfigurationManagementService {
    private repository: MockConfigurationRepository;
    private eventEmitter: MockEventEmitter;
    private schema: ConfigurationSchema;
    private cache = new Map<string, { value: any; expiry: number }>();
    private cacheTimeout = 300_000; // 5 minutes

    constructor() {
        this.repository = new MockConfigurationRepository();
        this.eventEmitter = new MockEventEmitter();
        this.schema = this.createDefaultSchema();
    }

    async get<T = any>(
        key: string,
        useCache: boolean = true
    ): Promise<T | null> {
        // Check cache first
        if (useCache) {
            const cached = this.cache.get(key);
            if (cached && cached.expiry > Date.now()) {
                return cached.value;
            }
        }

        const config = await this.repository.get(key);
        if (!config) {
            // Return default value if available
            const schemaEntry = this.schema[key];
            if (schemaEntry && schemaEntry.default !== undefined) {
                return schemaEntry.default;
            }
            return null;
        }

        // Update cache
        if (useCache) {
            this.cache.set(key, {
                value: config.value,
                expiry: Date.now() + this.cacheTimeout,
            });
        }

        return config.value;
    }

    async set(
        key: string,
        value: any,
        options?: {
            validateSchema?: boolean;
            modifiedBy?: string;
            skipCache?: boolean;
        }
    ): Promise<void> {
        const opts = { validateSchema: true, ...options };

        // Validate against schema
        if (opts.validateSchema) {
            const validation = this.validateValue(key, value);
            if (!validation.isValid) {
                throw new Error(
                    `Validation failed for ${key}: ${validation.errors.join(", ")}`
                );
            }
        }

        // Get old value for event
        const oldConfig = await this.repository.get(key);
        const oldValue = oldConfig?.value;

        // Set value
        const config = await this.repository.set(key, value, {
            modifiedBy: opts.modifiedBy,
        });

        // Update cache
        if (!opts.skipCache) {
            this.cache.set(key, {
                value,
                expiry: Date.now() + this.cacheTimeout,
            });
        }

        // Emit change event
        this.eventEmitter.emit("config.changed", {
            key,
            oldValue,
            newValue: value,
            timestamp: config.lastModified,
            modifiedBy: opts.modifiedBy,
        });
    }

    async getGroup(groupName: string): Promise<ConfigurationGroup> {
        const configurations = await this.repository.getByGroup(
            groupName,
            this.schema
        );

        return {
            name: groupName,
            description: `Configuration group: ${groupName}`,
            settings: configurations,
            metadata: {
                count: configurations.length,
                lastModified:
                    configurations.length > 0
                        ? Math.max(
                              ...configurations.map((c) =>
                                  c.lastModified.getTime()
                              )
                          )
                        : Date.now(),
            },
        };
    }

    async setGroup(
        groupName: string,
        values: Record<string, any>,
        modifiedBy?: string
    ): Promise<void> {
        const groupKeys = Object.keys(this.schema).filter(
            (key) => this.schema[key].group === groupName
        );

        // Validate all values first
        const validationErrors: string[] = [];
        for (const [key, value] of Object.entries(values)) {
            if (!groupKeys.includes(key)) {
                validationErrors.push(
                    `Key ${key} does not belong to group ${groupName}`
                );
                continue;
            }

            const validation = this.validateValue(key, value);
            if (!validation.isValid) {
                validationErrors.push(
                    `${key}: ${validation.errors.join(", ")}`
                );
            }
        }

        if (validationErrors.length > 0) {
            throw new Error(
                `Group validation failed: ${validationErrors.join("; ")}`
            );
        }

        // Set all values
        for (const [key, value] of Object.entries(values)) {
            await this.set(key, value, { modifiedBy, validateSchema: false });
        }

        // Emit group change event
        this.eventEmitter.emit("config.group.changed", {
            groupName,
            values,
            modifiedBy,
            timestamp: new Date(),
        });
    }

    async getAll(): Promise<Record<string, any>> {
        const configurations = await this.repository.getAll();
        const result: Record<string, any> = {};

        for (const config of configurations) {
            result[config.key] = config.value;
        }

        // Add defaults for missing values
        for (const [key, schemaEntry] of Object.entries(this.schema)) {
            if (!(key in result) && schemaEntry.default !== undefined) {
                result[key] = schemaEntry.default;
            }
        }

        return result;
    }

    async reset(key: string): Promise<void> {
        const schemaEntry = this.schema[key];
        if (!schemaEntry) {
            throw new Error(`Unknown configuration key: ${key}`);
        }

        if (schemaEntry.default === undefined) {
            await this.repository.delete(key);
            this.cache.delete(key);
        } else {
            await this.set(key, schemaEntry.default, {
                modifiedBy: "system-reset",
            });
        }
    }

    async resetGroup(groupName: string): Promise<void> {
        const groupKeys = Object.keys(this.schema).filter(
            (key) => this.schema[key].group === groupName
        );

        for (const key of groupKeys) {
            await this.reset(key);
        }

        this.eventEmitter.emit("config.group.reset", {
            groupName,
            keys: groupKeys,
            timestamp: new Date(),
        });
    }

    async validate(): Promise<ConfigValidationResult> {
        const configurations = await this.repository.getAll();
        const configMap = new Map(configurations.map((c) => [c.key, c.value]));

        const errors: string[] = [];
        const warnings: string[] = [];

        // Check required values
        for (const [key, schemaEntry] of Object.entries(this.schema)) {
            if (schemaEntry.required && !configMap.has(key)) {
                if (schemaEntry.default === undefined) {
                    errors.push(`Required configuration ${key} is missing`);
                } else {
                    warnings.push(
                        `Required configuration ${key} is using default value`
                    );
                }
            }
        }

        // Validate existing values
        for (const [key, value] of Array.from(configMap.entries())) {
            const validation = this.validateValue(key, value);
            if (!validation.isValid) {
                errors.push(`${key}: ${validation.errors.join(", ")}`);
            }
            warnings.push(...validation.warnings.map((w) => `${key}: ${w}`));
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    async createBackup(reason?: string): Promise<ConfigBackup> {
        const backup = await this.repository.createBackup(reason);

        this.eventEmitter.emit("config.backup.created", {
            backupId: backup.id,
            timestamp: backup.timestamp,
            reason,
        });

        return backup;
    }

    async restoreBackup(backupId: string): Promise<void> {
        const success = await this.repository.restoreBackup(backupId);
        if (!success) {
            throw new Error(`Backup ${backupId} not found`);
        }

        // Clear cache after restore
        this.cache.clear();

        this.eventEmitter.emit("config.backup.restored", {
            backupId,
            timestamp: new Date(),
        });
    }

    async getBackups(): Promise<ConfigBackup[]> {
        return await this.repository.getBackups();
    }

    async getChangeHistory(
        key?: string,
        limit?: number
    ): Promise<ConfigChangeEvent[]> {
        return await this.repository.getChangeHistory(key, limit);
    }

    onConfigChange(handler: (event: any) => void): void {
        this.eventEmitter.on("config.changed", handler);
    }

    onGroupChange(handler: (event: any) => void): void {
        this.eventEmitter.on("config.group.changed", handler);
    }

    private validateValue(key: string, value: any): ConfigValidationResult {
        const schemaEntry = this.schema[key];
        if (!schemaEntry) {
            return {
                isValid: false,
                errors: [`Unknown configuration key: ${key}`],
                warnings: [],
            };
        }

        const errors: string[] = [];
        const warnings: string[] = [];

        // Type validation
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (actualType !== schemaEntry.type) {
            errors.push(`Expected ${schemaEntry.type}, got ${actualType}`);
        }

        // Custom validation
        if (schemaEntry.validation && !schemaEntry.validation(value)) {
            errors.push("Custom validation failed");
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    private createDefaultSchema(): ConfigurationSchema {
        return {
            "app.name": {
                type: "string",
                default: "Uptime Watcher",
                required: true,
                group: "application",
            },
            "app.theme": {
                type: "string",
                default: "dark",
                validation: (value: string) =>
                    [
                        "light",
                        "dark",
                        "auto",
                    ].includes(value),
                group: "appearance",
            },
            "monitoring.defaultInterval": {
                type: "number",
                default: 300_000,
                validation: (value: number) => value >= 60_000,
                group: "monitoring",
            },
            "monitoring.timeout": {
                type: "number",
                default: 30_000,
                validation: (value: number) =>
                    value >= 5000 && value <= 120_000,
                group: "monitoring",
            },
            "alerts.enabled": {
                type: "boolean",
                default: true,
                group: "alerts",
            },
            "alerts.emailNotifications": {
                type: "boolean",
                default: false,
                group: "alerts",
            },
            "dashboard.refreshInterval": {
                type: "number",
                default: 30_000,
                validation: (value: number) => value >= 5000,
                group: "dashboard",
            },
            "database.retentionDays": {
                type: "number",
                default: 90,
                validation: (value: number) => value > 0,
                group: "database",
            },
        };
    }

    clearCache(): void {
        this.cache.clear();
    }

    getStats(): any {
        const repoStats = this.repository.getStats();
        return {
            ...repoStats,
            cacheSize: this.cache.size,
            schemaKeys: Object.keys(this.schema).length,
            eventHandlers: this.eventEmitter["listeners"].size,
        };
    }

    resetService(): void {
        this.repository.clear();
        this.eventEmitter.clear();
        this.cache.clear();
    }
}

// Helper functions for creating test configurations
function createTestConfiguration(): Record<string, any> {
    return {
        "app.name": "Test Application",
        "app.theme": "light",
        "monitoring.defaultInterval": 180_000,
        "monitoring.timeout": 25_000,
        "alerts.enabled": true,
        "alerts.emailNotifications": true,
        "dashboard.refreshInterval": 15_000,
        "database.retentionDays": 30,
    };
}

function createLargeConfiguration(count: number): Record<string, any> {
    const config: Record<string, any> = {};

    for (let i = 0; i < count; i++) {
        config[`setting.${i}`] = {
            value: `Setting value ${i}`,
            enabled: i % 2 === 0,
            priority: i % 5,
            tags: [`tag${i}`, `category${i % 3}`],
            metadata: {
                description: `Description for setting ${i}`,
                lastModified: new Date(Date.now() - i * 1000),
            },
        };
    }

    return config;
}

describe("Configuration Management Service Performance", () => {
    let service: MockConfigurationManagementService;

    bench(
        "service initialization",
        () => {
            service = new MockConfigurationManagementService();
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "get single configuration",
        () => {
            service = new MockConfigurationManagementService();
            service.set("test.key", "test value").then(() => {
                service.get("test.key");
            });
        },
        { warmupIterations: 10, iterations: 8000 }
    );

    bench(
        "get configuration with cache",
        () => {
            service = new MockConfigurationManagementService();
            service.set("cached.key", "cached value").then(() => {
                // First call populates cache
                service.get("cached.key", true).then(() => {
                    // Second call uses cache
                    service.get("cached.key", true);
                });
            });
        },
        { warmupIterations: 10, iterations: 10_000 }
    );

    bench(
        "set single configuration",
        () => {
            service = new MockConfigurationManagementService();
            service.set("new.key", "new value");
        },
        { warmupIterations: 10, iterations: 5000 }
    );

    bench(
        "set configuration with validation",
        () => {
            service = new MockConfigurationManagementService();
            service.set("monitoring.defaultInterval", 600_000, {
                validateSchema: true,
                modifiedBy: "user123",
            });
        },
        { warmupIterations: 10, iterations: 3000 }
    );

    bench(
        "get configuration group",
        () => {
            service = new MockConfigurationManagementService();
            const config = createTestConfiguration();
            Promise.all(
                Object.entries(config).map(([key, value]) =>
                    service.set(key, value)
                )
            ).then(() => {
                service.getGroup("monitoring");
            });
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "set configuration group",
        () => {
            service = new MockConfigurationManagementService();
            const groupValues = {
                "monitoring.defaultInterval": 240_000,
                "monitoring.timeout": 20_000,
            };
            service.setGroup("monitoring", groupValues, "admin");
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "get all configurations",
        () => {
            service = new MockConfigurationManagementService();
            const config = createTestConfiguration();
            Promise.all(
                Object.entries(config).map(([key, value]) =>
                    service.set(key, value)
                )
            ).then(() => {
                service.getAll();
            });
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "validate configuration",
        () => {
            service = new MockConfigurationManagementService();
            const config = createTestConfiguration();
            Promise.all(
                Object.entries(config).map(([key, value]) =>
                    service.set(key, value)
                )
            ).then(() => {
                service.validate();
            });
        },
        { warmupIterations: 10, iterations: 1500 }
    );

    bench(
        "reset single configuration",
        () => {
            service = new MockConfigurationManagementService();
            service.set("app.theme", "custom").then(() => {
                service.reset("app.theme");
            });
        },
        { warmupIterations: 10, iterations: 3000 }
    );

    bench(
        "reset configuration group",
        () => {
            service = new MockConfigurationManagementService();
            const groupValues = {
                "monitoring.defaultInterval": 120_000,
                "monitoring.timeout": 60_000,
            };
            service.setGroup("monitoring", groupValues).then(() => {
                service.resetGroup("monitoring");
            });
        },
        { warmupIterations: 10, iterations: 1500 }
    );

    bench(
        "create backup",
        () => {
            service = new MockConfigurationManagementService();
            const config = createTestConfiguration();
            Promise.all(
                Object.entries(config).map(([key, value]) =>
                    service.set(key, value)
                )
            ).then(() => {
                service.createBackup("Performance test backup");
            });
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "restore backup",
        () => {
            service = new MockConfigurationManagementService();
            const config = createTestConfiguration();
            Promise.all(
                Object.entries(config).map(([key, value]) =>
                    service.set(key, value)
                )
            ).then(() => {
                service.createBackup("Test backup").then((backup) => {
                    // Modify some settings
                    service.set("app.theme", "modified").then(() => {
                        service.restoreBackup(backup.id);
                    });
                });
            });
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "get change history",
        () => {
            service = new MockConfigurationManagementService();
            // Create multiple changes
            service.set("test.key", "value1").then(() => {
                service.set("test.key", "value2").then(() => {
                    service.set("test.key", "value3").then(() => {
                        service.getChangeHistory("test.key", 10);
                    });
                });
            });
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "bulk configuration operations",
        () => {
            service = new MockConfigurationManagementService();
            const largeConfig = createLargeConfiguration(50);

            const operations = Object.entries(largeConfig).map(([key, value]) =>
                service.set(key, value)
            );

            Promise.all(operations).then(() => {
                service.getAll();
            });
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "configuration with complex validation",
        () => {
            service = new MockConfigurationManagementService();

            // Multiple validation operations
            const operations = [
                service.set("monitoring.defaultInterval", 150_000),
                service.set("monitoring.timeout", 45_000),
                service.set("app.theme", "dark"),
                service.set("alerts.enabled", false),
                service.set("dashboard.refreshInterval", 10_000),
            ];

            Promise.all(operations).then(() => {
                service.validate();
            });
        },
        { warmupIterations: 10, iterations: 800 }
    );

    bench(
        "event handling performance",
        () => {
            service = new MockConfigurationManagementService();

            let changeCount = 0;
            service.onConfigChange(() => changeCount++);
            service.onGroupChange(() => changeCount++);

            // Generate multiple events
            const operations = [
                service.set("test1", "value1"),
                service.set("test2", "value2"),
                service.setGroup("monitoring", {
                    "monitoring.defaultInterval": 300_000,
                    "monitoring.timeout": 30_000,
                }),
            ];

            Promise.all(operations);
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "cache performance",
        () => {
            service = new MockConfigurationManagementService();

            service.set("cached.test", "test value").then(() => {
                // Multiple cache hits
                const promises = Array.from({ length: 20 }, () =>
                    service.get("cached.test", true)
                );
                Promise.all(promises);
            });
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "service statistics",
        () => {
            service = new MockConfigurationManagementService();
            const config = createTestConfiguration();
            Promise.all(
                Object.entries(config).map(([key, value]) =>
                    service.set(key, value)
                )
            ).then(() => {
                service.getStats();
            });
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "service cleanup",
        () => {
            service = new MockConfigurationManagementService();
            const config = createTestConfiguration();
            Promise.all(
                Object.entries(config).map(([key, value]) =>
                    service.set(key, value)
                )
            ).then(() => {
                service.clearCache();
                service.resetService();
            });
        },
        { warmupIterations: 10, iterations: 1000 }
    );
});
