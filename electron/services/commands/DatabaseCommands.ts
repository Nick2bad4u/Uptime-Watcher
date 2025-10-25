/**
 * Command pattern implementation for database operations, providing atomic
 * operations with rollback capabilities and consistent error handling.
 *
 * @remarks
 * This implementation addresses SOLID principle violations in DatabaseManager
 * by extracting complex operations into discrete, testable command objects.
 * Each command encapsulates a single database operation with its validation,
 * execution, and rollback logic.
 *
 * @public
 */

import type { Site } from "@shared/types";

import { SITE_ADDED_SOURCE } from "@shared/types/events";
import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";
import type { DatabaseServiceFactory } from "../factories/DatabaseServiceFactory";

import { logger as backendLogger } from "../../utils/logger";

/**
 * Base interface for all database commands.
 *
 * @remarks
 * Defines the contract for atomic database operations with rollback
 * capabilities, including validation, execution, rollback, and description for
 * logging.
 *
 * @typeParam TResult - The result type returned by the command's execute
 *   method.
 *
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
     *
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
     * Attempts to revert the effects of the command. Not all commands require
     * rollback.
     *
     * @returns Promise resolving when rollback is complete.
     */
    rollback: () => Promise<void>;

    /**
     * Validates the command before execution.
     *
     * @remarks
     * Ensures the command is in a valid state before execution. Returns a
     * validation result with errors if any.
     *
     * @returns Promise resolving to validation result.
     */
    validate: () => Promise<{
        /** Array of error messages if validation fails */
        errors: string[];
        /** Boolean indicating whether validation passed */
        isValid: boolean;
    }>;
}

/**
 * Abstract base class for database commands providing common functionality for
 * event emission and dependency management.
 *
 * @typeParam TResult - The result type returned by the command's execute
 *   method.
 *
 * @public
 */
export abstract class DatabaseCommand<TResult = void>
    implements IDatabaseCommand<TResult>
{
    /** Site cache for data synchronization during operations */
    protected readonly cache: StandardizedCache<Site>;

    /** Event bus for emitting command execution events */
    protected readonly eventEmitter: TypedEventBus<UptimeEvents>;

    /** Factory for accessing database services and repositories */
    protected readonly serviceFactory: DatabaseServiceFactory;

    /**
     * Emits a failure event for the command operation.
     *
     * @remarks
     * Used internally to emit a typed event indicating command failure,
     * including error details and additional event data.
     *
     * @param eventType - The event type to emit.
     * @param error - The {@link Error} that occurred.
     * @param data - Additional event data to include in the event payload.
     *
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
     * Used internally to emit a typed event indicating command success,
     * including additional event data.
     *
     * @param eventType - The event type to emit.
     * @param data - Additional event data to include in the event payload.
     *
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

    public abstract validate(): Promise<{
        /** Array of error messages if validation fails */
        errors: string[];
        /** Boolean indicating whether validation passed */
        isValid: boolean;
    }>;
}

/**
 * Command executor that provides transaction-like semantics for command
 * execution and rollback.
 *
 * @remarks
 * Maintains a history of executed commands and provides automatic rollback on
 * failure. Supports full rollback of all executed commands in reverse order to
 * maintain transactional integrity.
 *
 * @public
 */
export class DatabaseCommandExecutor {
    /** Array of successfully executed commands for potential rollback operations */
    private readonly executedCommands: Array<IDatabaseCommand<unknown>> = [];

    /**
     * Executes a command with automatic rollback on failure.
     *
     * @remarks
     * Validates the command before execution. If execution fails, attempts to
     * rollback the command. Adds the command to the history if successful.
     *
     * @typeParam TResult - The result type returned by the command's execute
     *   method.
     *
     * @param command - The {@link IDatabaseCommand} to execute.
     *
     * @returns Promise resolving to the command result.
     *
     * @throws When command validation or execution fails.
     *
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
            this.executedCommands.push(command as IDatabaseCommand<unknown>);
            return await command.execute();
        } catch (error) {
            // Attempt rollback on failure
            try {
                await command.rollback();
            } catch (rollbackError) {
                // Log rollback failure but don't mask original error
                backendLogger.error(
                    "Rollback failed for database command",
                    rollbackError,
                    { command: command.getDescription() }
                );
            }
            throw error;
        }
    }

    /**
     * Rolls back all executed commands in reverse order.
     *
     * @remarks
     * Executes rollback operations for all previously executed commands in
     * reverse order to maintain transactional integrity. Individual rollback
     * failures are collected but do not prevent other rollbacks from executing.
     * Uses array index access which is safe for typed arrays (hence the
     * eslint-disable comment).
     *
     * @returns Promise resolving when all rollbacks are complete.
     *
     * @throws AggregateError containing all rollback failures if any occurred.
     *
     * @public
     */
    public async rollbackAll(): Promise<void> {
        const errors: Error[] = [];

        // Rollback in reverse order - sequential for data integrity
        for (let i = this.executedCommands.length - 1; i >= 0; i--) {
            try {
                const command = this.executedCommands[i];
                if (command) {
                    // eslint-disable-next-line no-await-in-loop -- Sequential rollback required for data integrity
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

    /**
     * Clears the command history without performing rollback.
     *
     * @remarks
     * Removes all references to previously executed commands. Does not attempt
     * to revert any changes.
     *
     * @public
     */
    public clear(): void {
        this.executedCommands.length = 0;
    }
}

/**
 * Command for downloading a database backup as a buffer and file name.
 *
 * @remarks
 * Encapsulates the logic for downloading a backup and emitting a success event.
 * Rollback and validation are no-ops.
 *
 * @public
 */
export class DownloadBackupCommand extends DatabaseCommand<{
    /** The backup data as a Buffer containing the database file contents */
    buffer: Buffer;
    /** The generated filename for the backup file */
    fileName: string;
}> {
    public async execute(): Promise<{
        /** The backup data as a Buffer containing the database file contents */
        buffer: Buffer;
        /** The generated filename for the backup file */
        fileName: string;
    }> {
        const dataBackupService = this.serviceFactory.createBackupService();
        const result = await dataBackupService.downloadDatabaseBackup();

        await this.emitSuccessEvent("internal:database:backup-downloaded", {
            fileName: result.fileName,
            operation: "backup-downloaded",
        });

        return result;
    }

    /**
     * No-op rollback for backup operations.
     *
     * @remarks
     * Backup operations are inherently safe and do not modify the database
     * state, so no rollback action is necessary. Returns a resolved promise to
     * satisfy the {@link IDatabaseCommand} interface contract.
     *
     * @returns Resolved promise since backup operations are read-only and do
     *   not require rollback.
     */
    public async rollback(): Promise<void> {
        // Backup operations don't need rollback
    }

    /**
     * Validates backup operation prerequisites.
     *
     * @remarks
     * Backup operations have minimal prerequisites, so validation always
     * succeeds. Returns a resolved promise to satisfy the
     * {@link IDatabaseCommand} interface contract.
     *
     * @returns Resolved promise with validation result indicating success.
     */
    public async validate(): Promise<{
        /** Array of error messages if validation fails */
        errors: string[];
        /** Boolean indicating whether validation passed */
        isValid: boolean;
    }> {
        // No specific validation needed for backup
        await Promise.resolve();
        return { errors: [], isValid: true };
    }

    public getDescription(): string {
        return "Download SQLite database backup";
    }
}

/**
 * Command for exporting all application data to JSON.
 *
 * @remarks
 * Encapsulates the logic for exporting all data and emitting a success event.
 * Rollback and validation are no-ops.
 *
 * @public
 */
export class ExportDataCommand extends DatabaseCommand<string> {
    public async execute(): Promise<string> {
        const dataImportExportService =
            this.serviceFactory.createImportExportService();

        await this.emitSuccessEvent("internal:database:data-exported", {
            fileName: `export-${Date.now()}.json`,
            operation: "data-exported",
        });

        return dataImportExportService.exportAllData();
    }

    public async rollback(): Promise<void> {
        // Export operations don't need rollback
    }

    public async validate(): Promise<{
        /** Array of error messages if validation fails */
        errors: string[];
        /** Boolean indicating whether validation passed */
        isValid: boolean;
    }> {
        // No specific validation needed for export
        await Promise.resolve();
        return { errors: [], isValid: true };
    }

    public getDescription(): string {
        return "Export all application data to JSON";
    }
}

/**
 * Command for importing application data from JSON.
 *
 * @remarks
 * Encapsulates the logic for importing data, updating the cache, and emitting a
 * success event. Also emits a `cache:invalidated` event so renderer caches can
 * resynchronize with freshly imported data. Rollback restores the previous
 * cache state. Validation checks for valid JSON and non-empty input.
 *
 * @public
 */
export class ImportDataCommand extends DatabaseCommand<boolean> {
    /** Backup of current sites for rollback functionality */
    private backupSites: Site[] = [];

    /** JSON data string to be imported */
    private readonly data: string;

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
        const previousSiteIdentifiers = new Set(
            this.backupSites.map((site) => site.identifier)
        );

        this.cache.clear();
        const newlyImportedSites: Site[] = [];

        for (const site of reloadedSites) {
            this.cache.set(site.identifier, site);

            if (!previousSiteIdentifiers.has(site.identifier)) {
                newlyImportedSites.push(site);
            }
        }

        if (newlyImportedSites.length > 0) {
            await Promise.all(
                newlyImportedSites.map((site) =>
                    this.eventEmitter.emitTyped("internal:site:added", {
                        identifier: site.identifier,
                        operation: "added",
                        site: structuredClone(site),
                        source: SITE_ADDED_SOURCE.IMPORT,
                        timestamp: Date.now(),
                    })
                )
            );
        }

        await this.emitSuccessEvent("internal:database:data-imported", {
            operation: "data-imported",
        });

        await this.eventEmitter.emitTyped("sites:state-synchronized", {
            action: STATE_SYNC_ACTION.BULK_SYNC,
            siteIdentifier: "all",
            sites: reloadedSites.map((site) => structuredClone(site)),
            source: STATE_SYNC_SOURCE.DATABASE,
            timestamp: Date.now(),
        });

        await this.eventEmitter.emitTyped("cache:invalidated", {
            reason: "update",
            timestamp: Date.now(),
            type: "site",
        });

        return true;
    }

    public async rollback(): Promise<void> {
        // Restore cache from backup
        this.cache.clear();
        for (const site of this.backupSites) {
            this.cache.set(site.identifier, site);
        }
        await Promise.resolve();
    }

    public async validate(): Promise<{
        /** Array of error messages if validation fails */
        errors: string[];
        /** Boolean indicating whether validation passed */
        isValid: boolean;
    }> {
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

    public constructor(
        serviceFactory: DatabaseServiceFactory,
        eventEmitter: TypedEventBus<UptimeEvents>,
        cache: StandardizedCache<Site>,
        data: string
    ) {
        super(serviceFactory, eventEmitter, cache);
        this.data = data;
    }

    public getDescription(): string {
        return "Import application data from JSON";
    }
}

/**
 * Command for loading sites from the database into the in-memory cache.
 *
 * @remarks
 * Encapsulates the logic for loading all sites from the database and atomically
 * replacing the cache. Rollback restores the previous cache state. Validation
 * is a no-op.
 *
 * @public
 */
export class LoadSitesCommand extends DatabaseCommand<Site[]> {
    /** Backup of original cache state for rollback functionality */
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

    /**
     * Restores the cache to its previous state.
     *
     * @remarks
     * Performs a synchronous cache restoration operation by clearing the
     * current cache and restoring the backup state. Returns a resolved promise
     * to satisfy the IDatabaseCommand interface contract.
     *
     * @returns Resolved promise after cache restoration is complete
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
     * @remarks
     * Site loading operations have minimal prerequisites, so validation always
     * succeeds. Returns a resolved promise to satisfy the IDatabaseCommand
     * interface contract.
     *
     * @returns Resolved promise with validation result indicating success
     */
    public async validate(): Promise<{
        /** Array of error messages if validation fails */
        errors: string[];
        /** Boolean indicating whether validation passed */
        isValid: boolean;
    }> {
        // No specific validation needed for loading
        await Promise.resolve();
        return { errors: [], isValid: true };
    }

    public getDescription(): string {
        return "Load sites from database into cache";
    }
}
