/**
 * Command pattern implementation for database operations.
 * Provides atomic operations with rollback capabilities and consistent error handling.
 *
 * @remarks
 * This implementation addresses the SOLID principle violations in DatabaseManager
 * by extracting complex operations into discrete, testable command objects.
 * Each command encapsulates a single database operation with its validation,
 * execution, and rollback logic.
 */

import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { Site } from "../../types";
import { StandardizedCache } from "../../utils/cache/StandardizedCache";
import { DatabaseServiceFactory } from "../factories/DatabaseServiceFactory";

/**
 * Base interface for all database commands.
 * Defines the contract for atomic database operations with rollback capabilities.
 */
export interface IDatabaseCommand<TResult = void> {
    /**
     * Executes the command operation.
     * @returns Promise resolving to the operation result
     * @throws When command execution fails
     */
    execute(): Promise<TResult>;

    /**
     * Gets a description of the command for logging and debugging.
     * @returns Human-readable command description
     */
    getDescription(): string;

    /**
     * Rolls back the command operation if possible.
     * @returns Promise resolving when rollback is complete
     */
    rollback(): Promise<void>;

    /**
     * Validates the command before execution.
     * @returns Promise resolving to validation result
     */
    validate(): Promise<{ errors: string[]; isValid: boolean }>;
}

/**
 * Abstract base class for database commands providing common functionality.
 */
export abstract class DatabaseCommand<TResult = void> implements IDatabaseCommand<TResult> {
    protected readonly cache: StandardizedCache<Site>;
    protected readonly eventEmitter: TypedEventBus<UptimeEvents>;
    protected readonly serviceFactory: DatabaseServiceFactory;

    constructor(
        serviceFactory: DatabaseServiceFactory,
        eventEmitter: TypedEventBus<UptimeEvents>,
        cache: StandardizedCache<Site>
    ) {
        this.serviceFactory = serviceFactory;
        this.eventEmitter = eventEmitter;
        this.cache = cache;
    }

    public abstract execute(): Promise<TResult>;
    public abstract getDescription(): string;
    public abstract rollback(): Promise<void>;
    public abstract validate(): Promise<{ errors: string[]; isValid: boolean }>;

    /**
     * Emits a failure event for the command operation.
     * @param eventType - The event type to emit
     * @param error - The error that occurred
     * @param data - Additional event data
     */
    protected async emitFailureEvent(
        eventType: keyof UptimeEvents,
        error: Error,
        data: Partial<UptimeEvents[keyof UptimeEvents]> = {}
    ): Promise<void> {
        await this.eventEmitter.emitTyped(eventType, {
            error: error.message,
            success: false,
            timestamp: Date.now(),
            ...data,
        } as UptimeEvents[keyof UptimeEvents]);
    }

    /**
     * Emits a success event for the command operation.
     * @param eventType - The event type to emit
     * @param data - Additional event data
     */
    protected async emitSuccessEvent(
        eventType: keyof UptimeEvents,
        data: Partial<UptimeEvents[keyof UptimeEvents]>
    ): Promise<void> {
        await this.eventEmitter.emitTyped(eventType, {
            success: true,
            timestamp: Date.now(),
            ...data,
        } as UptimeEvents[keyof UptimeEvents]);
    }
}

/**
 * Command executor that provides transaction-like semantics for command execution.
 */
export class DatabaseCommandExecutor {
    private readonly executedCommands: IDatabaseCommand<unknown>[] = [];

    /**
     * Clears the command history without rollback.
     */
    public clear(): void {
        this.executedCommands.length = 0;
    }

    /**
     * Executes a command with automatic rollback on failure.
     * @param command - The command to execute
     * @returns Promise resolving to the command result
     * @throws When command validation or execution fails
     */
    public async execute<TResult>(command: IDatabaseCommand<TResult>): Promise<TResult> {
        // Validate command before execution
        const validation = await command.validate();
        if (!validation.isValid) {
            throw new Error(`Command validation failed: ${validation.errors.join(", ")}`);
        }

        try {
            const result = await command.execute();
            this.executedCommands.push(command as IDatabaseCommand<unknown>);
            return result;
        } catch (error) {
            // Attempt rollback on failure
            try {
                await command.rollback();
            } catch (rollbackError) {
                // Log rollback failure but don't mask original error
                console.error(`Rollback failed for command ${command.getDescription()}:`, rollbackError);
            }
            throw error;
        }
    }

    /**
     * Rolls back all executed commands in reverse order.
     *
     * @returns Promise resolving when all rollbacks are complete
     *
     * @remarks
     * Executes rollback operations for all previously executed commands in reverse order
     * to maintain transactional integrity. Individual rollback failures are collected
     * but don't prevent other rollbacks from executing. Uses array index access which
     * is safe for typed arrays (hence the eslint-disable comment).
     *
     * @throws AggregateError containing all rollback failures if any occurred
     */
    public async rollbackAll(): Promise<void> {
        const errors: Error[] = [];

        // Rollback in reverse order
        for (let i = this.executedCommands.length - 1; i >= 0; i--) {
            try {
                // eslint-disable-next-line security/detect-object-injection
                const command = this.executedCommands[i];
                if (command != null) {
                    await command.rollback();
                }
            } catch (error) {
                errors.push(error instanceof Error ? error : new Error(String(error)));
            }
        }

        this.executedCommands.length = 0;

        if (errors.length > 0) {
            throw new Error(`Rollback errors: ${errors.map((e) => e.message).join(", ")}`);
        }
    }
}

/**
 * Command for downloading database backup.
 */
export class DownloadBackupCommand extends DatabaseCommand<{ buffer: Buffer; fileName: string }> {
    public async execute(): Promise<{ buffer: Buffer; fileName: string }> {
        const dataBackupService = this.serviceFactory.createBackupService();
        const result = await dataBackupService.downloadDatabaseBackup();

        await this.emitSuccessEvent("internal:database:backup-downloaded", {
            fileName: result.fileName,
            operation: "backup-downloaded",
        });

        return result;
    }

    public getDescription(): string {
        return "Download SQLite database backup";
    }

    /**
     * No-op rollback for backup operations.
     *
     * @returns Resolved promise since backup operations are read-only and don't require rollback
     *
     * @remarks
     * Backup operations are inherently safe and don't modify the database state,
     * so no rollback action is necessary. Returns a resolved promise to satisfy
     * the IDatabaseCommand interface contract.
     */
    public rollback(): Promise<void> {
        // Backup operations don't need rollback - return resolved promise
        return Promise.resolve();
    }

    /**
     * Validates backup operation prerequisites.
     *
     * @returns Resolved promise with validation result indicating success
     *
     * @remarks
     * Backup operations have minimal prerequisites, so validation always succeeds.
     * Returns a resolved promise to satisfy the IDatabaseCommand interface contract.
     */
    public validate(): Promise<{ errors: string[]; isValid: boolean }> {
        // No specific validation needed for backup - return resolved promise
        return Promise.resolve({ errors: [], isValid: true });
    }
}

/**
 * Command for exporting all application data to JSON.
 */
export class ExportDataCommand extends DatabaseCommand<string> {
    public async execute(): Promise<string> {
        const dataImportExportService = this.serviceFactory.createImportExportService();
        const result = await dataImportExportService.exportAllData();

        await this.emitSuccessEvent("internal:database:data-exported", {
            fileName: `export-${Date.now()}.json`,
            operation: "data-exported",
        });

        return result;
    }

    public getDescription(): string {
        return "Export all application data to JSON";
    }

    public async rollback(): Promise<void> {
        // Export operations don't need rollback
    }

    public validate(): Promise<{ errors: string[]; isValid: boolean }> {
        // No specific validation needed for export
        return Promise.resolve({ errors: [], isValid: true });
    }
}

/**
 * Command for importing application data from JSON.
 */
export class ImportDataCommand extends DatabaseCommand<boolean> {
    private backupSites: Site[] = [];
    private readonly data: string;

    constructor(
        serviceFactory: DatabaseServiceFactory,
        eventEmitter: TypedEventBus<UptimeEvents>,
        cache: StandardizedCache<Site>,
        data: string
    ) {
        super(serviceFactory, eventEmitter, cache);
        this.data = data;
    }

    public async execute(): Promise<boolean> {
        // Create backup of current sites
        this.backupSites = this.cache.getAll();

        const dataImportExportService = this.serviceFactory.createImportExportService();

        // Parse and import data
        const { settings, sites } = await dataImportExportService.importDataFromJson(this.data);
        await dataImportExportService.persistImportedData(sites, settings);

        // Reload sites from database
        const siteRepositoryService = this.serviceFactory.createSiteRepositoryService();
        const reloadedSites = await siteRepositoryService.getSitesFromDatabase();

        // Update cache
        this.cache.clear();
        for (const site of reloadedSites) {
            this.cache.set(site.identifier, site);
        }

        await this.emitSuccessEvent("internal:database:data-imported", {
            operation: "data-imported",
        });

        return true;
    }

    public getDescription(): string {
        return "Import application data from JSON";
    }

    public rollback(): Promise<void> {
        // Restore cache from backup
        this.cache.clear();
        for (const site of this.backupSites) {
            this.cache.set(site.identifier, site);
        }
        return Promise.resolve();
    }

    public validate(): Promise<{ errors: string[]; isValid: boolean }> {
        const errors: string[] = [];

        if (!this.data || this.data.trim() === "") {
            errors.push("Import data cannot be empty");
        }

        try {
            JSON.parse(this.data);
        } catch {
            errors.push("Import data must be valid JSON");
        }

        return Promise.resolve({
            errors,
            isValid: errors.length === 0,
        });
    }
}

/**
 * Command for loading sites from database into cache.
 */
export class LoadSitesCommand extends DatabaseCommand<Site[]> {
    private readonly originalCacheState: Map<string, Site> = new Map();

    public async execute(): Promise<Site[]> {
        // Backup current cache state
        this.originalCacheState.clear();
        for (const [key, site] of this.cache.entries()) {
            this.originalCacheState.set(key, site);
        }

        const siteRepositoryService = this.serviceFactory.createSiteRepositoryService();
        const sites = await siteRepositoryService.getSitesFromDatabase();

        // Atomic cache replacement
        this.cache.clear();
        for (const site of sites) {
            this.cache.set(site.identifier, site);
        }

        return sites;
    }

    public getDescription(): string {
        return "Load sites from database into cache";
    }

    /**
     * Restores the cache to its previous state.
     *
     * @returns Resolved promise after cache restoration is complete
     *
     * @remarks
     * Performs a synchronous cache restoration operation by clearing the current
     * cache and restoring the backup state. Returns a resolved promise to satisfy
     * the IDatabaseCommand interface contract.
     */
    public rollback(): Promise<void> {
        // Restore original cache state
        this.cache.clear();
        for (const [key, site] of this.originalCacheState) {
            this.cache.set(key, site);
        }
        return Promise.resolve();
    }

    /**
     * Validates site loading operation prerequisites.
     *
     * @returns Resolved promise with validation result indicating success
     *
     * @remarks
     * Site loading operations have minimal prerequisites, so validation always succeeds.
     * Returns a resolved promise to satisfy the IDatabaseCommand interface contract.
     */
    public validate(): Promise<{ errors: string[]; isValid: boolean }> {
        // No specific validation needed for loading - return resolved promise
        return Promise.resolve({ errors: [], isValid: true });
    }
}
