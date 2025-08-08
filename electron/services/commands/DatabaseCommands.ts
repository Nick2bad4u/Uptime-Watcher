/**
 * Command pattern implementation for database operations, providing atomic operations with rollback capabilities and consistent error handling.
 *
 * @remarks
 * This implementation addresses SOLID principle violations in DatabaseManager by extracting complex operations into discrete, testable command objects. Each command encapsulates a single database operation with its validation, execution, and rollback logic.
 *
 * @public
 */

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { Site } from "../../types";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";
import type { DatabaseServiceFactory } from "../factories/DatabaseServiceFactory";

/**
 * Base interface for all database commands.
 *
 * @remarks
 * Defines the contract for atomic database operations with rollback capabilities, including validation, execution, rollback, and description for logging.
 *
 * @typeParam TResult - The result type returned by the command's execute method.
 * @public
 */
export interface IDatabaseCommand<TResult = void> {
    /**
     * Executes the command operation.
     *
     * @remarks
     * Performs the main database operation encapsulated by the command.
     *
     * @returns Promise resolving to the operation result.
     * @throws When command execution fails.
     */
    execute: () => Promise<TResult>;

    /**
     * Gets a description of the command for logging and debugging.
     *
     * @returns Human-readable command description.
     */
    getDescription: () => string;

    /**
     * Rolls back the command operation if possible.
     *
     * @remarks
     * Attempts to revert the effects of the command. Not all commands require rollback.
     *
     * @returns Promise resolving when rollback is complete.
     */
    rollback: () => Promise<void>;

    /**
     * Validates the command before execution.
     *
     * @remarks
     * Ensures the command is in a valid state before execution. Returns a validation result with errors if any.
     *
     * @returns Promise resolving to validation result.
     */
    validate: () => Promise<{ errors: string[]; isValid: boolean }>;
}

/**
 * Abstract base class for database commands providing common functionality for event emission and dependency management.
 *
 * @typeParam TResult - The result type returned by the command's execute method.
 * @public
 */
export abstract class DatabaseCommand<TResult = void>
    implements IDatabaseCommand<TResult>
{
    protected readonly cache: StandardizedCache<Site>;
    protected readonly eventEmitter: TypedEventBus<UptimeEvents>;
    protected readonly serviceFactory: DatabaseServiceFactory;

    public constructor(
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
     *
     * @remarks
     * Used internally to emit a typed event indicating command failure, including error details and additional event data.
     *
     * @param eventType - The event type to emit.
     * @param error - The {@link Error} that occurred.
     * @param data - Additional event data to include in the event payload.
     * @internal
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
     *
     * @remarks
     * Used internally to emit a typed event indicating command success, including additional event data.
     *
     * @param eventType - The event type to emit.
     * @param data - Additional event data to include in the event payload.
     * @internal
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
 * Command executor that provides transaction-like semantics for command execution and rollback.
 *
 * @remarks
 * Maintains a history of executed commands and provides automatic rollback on failure. Supports full rollback of all executed commands in reverse order to maintain transactional integrity.
 *
 * @public
 */
export class DatabaseCommandExecutor {
    private readonly executedCommands: Array<IDatabaseCommand<unknown>> = [];

    /**
     * Clears the command history without performing rollback.
     *
     * @remarks
     * Removes all references to previously executed commands. Does not attempt to revert any changes.
     * @public
     */
    public clear(): void {
        this.executedCommands.length = 0;
    }

    /**
     * Executes a command with automatic rollback on failure.
     *
     * @remarks
     * Validates the command before execution. If execution fails, attempts to rollback the command. Adds the command to the history if successful.
     *
     * @typeParam TResult - The result type returned by the command's execute method.
     * @param command - The {@link IDatabaseCommand} to execute.
     * @returns Promise resolving to the command result.
     * @throws When command validation or execution fails.
     * @public
     */
    public async execute<TResult>(
        command: IDatabaseCommand<TResult>
    ): Promise<TResult> {
        // Validate command before execution
        const validation = await command.validate();
        if (!validation.isValid) {
            throw new Error(
                `Command validation failed: ${validation.errors.join(", ")}`
            );
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
                console.error(
                    "Rollback failed for command:",
                    command.getDescription(),
                    rollbackError
                );
            }
            throw error;
        }
    }

    /**
     * Rolls back all executed commands in reverse order.
     *
     * @remarks
     * Executes rollback operations for all previously executed commands in reverse order to maintain transactional integrity. Individual rollback failures are collected but do not prevent other rollbacks from executing. Uses array index access which is safe for typed arrays (hence the eslint-disable comment).
     *
     * @returns Promise resolving when all rollbacks are complete.
     * @throws AggregateError containing all rollback failures if any occurred.
     * @public
     */
    public async rollbackAll(): Promise<void> {
        const errors: Error[] = [];

        // Rollback in reverse order
        for (let i = this.executedCommands.length - 1; i >= 0; i--) {
            try {
                const command = this.executedCommands[i];
                if (command != null) {
                    await command.rollback();
                }
            } catch (error) {
                errors.push(
                    error instanceof Error ? error : new Error(String(error))
                );
            }
        }

        this.executedCommands.length = 0;

        if (errors.length > 0) {
            throw new Error(
                `Rollback errors: ${errors.map((e) => e.message).join(", ")}`
            );
        }
    }
}

/**
 * Command for downloading a database backup as a buffer and file name.
 *
 * @remarks
 * Encapsulates the logic for downloading a backup and emitting a success event. Rollback and validation are no-ops.
 *
 * @public
 */
export class DownloadBackupCommand extends DatabaseCommand<{
    buffer: Buffer;
    fileName: string;
}> {
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
     * @remarks
     * Backup operations are inherently safe and do not modify the database state, so no rollback action is necessary. Returns a resolved promise to satisfy the {@link IDatabaseCommand} interface contract.
     *
     * @returns Resolved promise since backup operations are read-only and do not require rollback.
     */
    public async rollback(): Promise<void> {
        // Backup operations don't need rollback
    }

    /**
     * Validates backup operation prerequisites.
     *
     * @remarks
     * Backup operations have minimal prerequisites, so validation always succeeds. Returns a resolved promise to satisfy the {@link IDatabaseCommand} interface contract.
     *
     * @returns Resolved promise with validation result indicating success.
     */
    public async validate(): Promise<{ errors: string[]; isValid: boolean }> {
        // No specific validation needed for backup
        await Promise.resolve();
        return { errors: [], isValid: true };
    }
}

/**
 * Command for exporting all application data to JSON.
 *
 * @remarks
 * Encapsulates the logic for exporting all data and emitting a success event. Rollback and validation are no-ops.
 *
 * @public
 */
export class ExportDataCommand extends DatabaseCommand<string> {
    public async execute(): Promise<string> {
        const dataImportExportService =
            this.serviceFactory.createImportExportService();
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

    public async validate(): Promise<{ errors: string[]; isValid: boolean }> {
        // No specific validation needed for export
        await Promise.resolve();
        return { errors: [], isValid: true };
    }
}

/**
 * Command for importing application data from JSON.
 *
 * @remarks
 * Encapsulates the logic for importing data, updating the cache, and emitting a success event. Rollback restores the previous cache state. Validation checks for valid JSON and non-empty input.
 *
 * @public
 */
export class ImportDataCommand extends DatabaseCommand<boolean> {
    private backupSites: Site[] = [];
    private readonly data: string;

    public constructor(
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

        const dataImportExportService =
            this.serviceFactory.createImportExportService();

        // Parse and import data
        const { settings, sites } =
            await dataImportExportService.importDataFromJson(this.data);
        await dataImportExportService.persistImportedData(sites, settings);

        // Reload sites from database
        const siteRepositoryService =
            this.serviceFactory.createSiteRepositoryService();
        const reloadedSites =
            await siteRepositoryService.getSitesFromDatabase();

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

    public async rollback(): Promise<void> {
        // Restore cache from backup
        this.cache.clear();
        for (const site of this.backupSites) {
            this.cache.set(site.identifier, site);
        }
        await Promise.resolve();
    }

    public async validate(): Promise<{ errors: string[]; isValid: boolean }> {
        const errors: string[] = [];

        if (!this.data || this.data.trim() === "") {
            errors.push("Import data cannot be empty");
        }

        try {
            JSON.parse(this.data);
        } catch {
            errors.push("Import data must be valid JSON");
        }

        // Use microtask to satisfy async requirement
        await Promise.resolve();
        return {
            errors,
            isValid: errors.length === 0,
        };
    }
}

/**
 * Command for loading sites from the database into the in-memory cache.
 *
 * @remarks
 * Encapsulates the logic for loading all sites from the database and atomically replacing the cache. Rollback restores the previous cache state. Validation is a no-op.
 *
 * @public
 */
export class LoadSitesCommand extends DatabaseCommand<Site[]> {
    private readonly originalCacheState = new Map<string, Site>();

    public async execute(): Promise<Site[]> {
        // Backup current cache state
        this.originalCacheState.clear();
        for (const [key, site] of this.cache.entries()) {
            this.originalCacheState.set(key, site);
        }

        const siteRepositoryService =
            this.serviceFactory.createSiteRepositoryService();
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
    public async rollback(): Promise<void> {
        // Restore original cache state
        this.cache.clear();
        for (const [key, site] of this.originalCacheState) {
            this.cache.set(key, site);
        }
        await Promise.resolve();
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
    public async validate(): Promise<{ errors: string[]; isValid: boolean }> {
        // No specific validation needed for loading
        await Promise.resolve();
        return { errors: [], isValid: true };
    }
}
