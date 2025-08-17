# Repository Template

This template provides a standard structure for implementing repository classes following the established patterns in the Uptime Watcher application.

## Overview

Repository classes manage data persistence using the dual-method pattern:

- Public async methods for external API (wrapped with `withDatabaseOperation`)
- Internal synchronous methods for transaction contexts
- All mutations use `executeTransaction()` for consistency

## Template Structure

````typescript

import { Database } from "node-sqlite3-wasm";
import { logger } from "@shared/utils/logger";
import { withDatabaseOperation } from "@electron/utils/operationalHooks";
import type { DatabaseService } from "@electron/services/database/DatabaseService";

/**
 * Interface representing a data row structure.
 */
export interface ExampleRow {
 /** Unique identifier for the entity */
 id: string;
 /** Display name of the entity */
 name: string;
 /** Creation timestamp */
 createdAt: number;
}

/**
 * Dependencies required for repository initialization.
 */
export interface ExampleRepositoryDependencies {
 /** Database service for transaction management */
 databaseService: DatabaseService;
}

/**
 * SQL query constants for database operations.
 */
const EXAMPLE_QUERIES = {
 INSERT: "INSERT INTO example_table (id, name, createdAt) VALUES (?, ?, ?)",
 SELECT_ALL:
  "SELECT id, name, createdAt FROM example_table ORDER BY createdAt DESC",
 SELECT_BY_ID: "SELECT id, name, createdAt FROM example_table WHERE id = ?",
 UPDATE: "UPDATE example_table SET name = ? WHERE id = ?",
 DELETE_BY_ID: "DELETE FROM example_table WHERE id = ?",
 DELETE_ALL: "DELETE FROM example_table",
} as const;

/**
 * Repository for managing entity data persistence.
 */
export class ExampleRepository {
 /** @internal */
 private readonly databaseService: DatabaseService;

 /**
  * Constructs a new ExampleRepository instance.
  *
  * @example
  *
  * ```typescript
  * const repo = new ExampleRepository({ databaseService });
  * ```
  *
  * @param dependencies - The required dependencies for entity operations.
  */
 constructor(dependencies: ExampleRepositoryDependencies) {
  this.databaseService = dependencies.databaseService;
 }

 /**
  * Creates a new entity in the database.
  *
  * @example
  *
  * ```typescript
  * await repo.create({
  *  id: "123",
  *  name: "Example",
  *  createdAt: Date.now(),
  * });
  * ```
  *
  * @param data - The entity data to create.
  *
  * @returns Promise that resolves when the entity is created.
  *
  * @throws If the database operation fails.
  */
 public async create(data: ExampleRow): Promise<void> {
  return withDatabaseOperation(
   async () =>
    this.databaseService.executeTransaction((db) => {
     this.createInternal(db, data);
     return Promise.resolve();
    }),
   "ExampleRepository.create"
  );
 }

 /**
  * Creates a new entity within an existing transaction context.
  *
  * @remarks
  * - Must be called within an active transaction context.
  * - Applies data validation and normalization.
  *
  * @param db - The database connection (must be within an active transaction).
  * @param data - The entity data to create.
  */
 public createInternal(db: Database, data: ExampleRow): void {
  db.run(EXAMPLE_QUERIES.INSERT, [data.id, data.name, data.createdAt]);
  logger.debug(`[ExampleRepository] Created entity: ${data.id}`);
 }

 /**
  * Retrieves all entity records from the database.
  *
  * @example
  *
  * ```typescript
  * const examples = await repo.findAll();
  * ```
  *
  * @returns Promise resolving to an array of all entity data.
  *
  * @throws If the database operation fails.
  */
 public async findAll(): Promise<ExampleRow[]> {
  return withDatabaseOperation(() => {
   const db = this.getDb();
   return Promise.resolve(db.all(EXAMPLE_QUERIES.SELECT_ALL) as ExampleRow[]);
  }, "ExampleRepository.findAll");
 }

 /**
  * Finds an entity by its unique identifier.
  *
  * @example
  *
  * ```typescript
  * const example = await repo.findById("123");
  * ```
  *
  * @param id - The unique identifier to search for.
  *
  * @returns Promise resolving to entity data if found, or undefined if not
  *   found.
  *
  * @throws If the database operation fails.
  */
 public async findById(id: string): Promise<ExampleRow | undefined> {
  return withDatabaseOperation(() => {
   const db = this.getDb();
   const result = db.get(EXAMPLE_QUERIES.SELECT_BY_ID, [id]) as
    | ExampleRow
    | undefined;
   return Promise.resolve(result);
  }, "ExampleRepository.findById");
 }

 /**
  * Updates an existing entity in the database.
  *
  * @example
  *
  * ```typescript
  * await repo.update("123", { name: "Updated Name" });
  * ```
  *
  * @param id - The unique identifier of the entity to update.
  * @param data - The updated entity data.
  *
  * @returns Promise that resolves when the entity is updated.
  *
  * @throws If the database operation fails.
  */
 public async update(
  id: string,
  data: Partial<Omit<ExampleRow, "id">>
 ): Promise<void> {
  return withDatabaseOperation(async () => {
   return this.databaseService.executeTransaction((db) => {
    this.updateInternal(db, id, data);
    return Promise.resolve();
   });
  }, "ExampleRepository.update");
 }

 /**
  * Updates an existing entity within an existing transaction context.
  *
  * @remarks
  * Must be called within an active transaction context.
  *
  * @param db - The database connection (must be within an active transaction).
  * @param id - The unique identifier of the entity to update.
  * @param data - The updated entity data.
  */
 public updateInternal(
  db: Database,
  id: string,
  data: Partial<Omit<ExampleRow, "id">>
 ): void {
  // Build dynamic update query based on provided fields
  const fields = Object.keys(data).filter(
   (key) => data[key as keyof typeof data] !== undefined
  );
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field as keyof typeof data]);

  const query = `UPDATE example_table SET ${setClause} WHERE id = ?`;
  db.run(query, [...values, id]);

  logger.debug(`[ExampleRepository] Updated entity: ${id}`);
 }

 /**
  * Deletes an entity by its unique identifier.
  *
  * @example
  *
  * ```typescript
  * await repo.deleteById("123");
  * ```
  *
  * @param id - The unique identifier of the entity to delete.
  *
  * @returns Promise that resolves when the entity is deleted.
  *
  * @throws If the database operation fails.
  */
 public async deleteById(id: string): Promise<void> {
  return withDatabaseOperation(async () => {
   return this.databaseService.executeTransaction((db) => {
    this.deleteByIdInternal(db, id);
    return Promise.resolve();
   });
  }, "ExampleRepository.deleteById");
 }

 /**
  * Deletes an entity within an existing transaction context.
  *
  * @remarks
  * Must be called within an active transaction context.
  *
  * @param db - The database connection (must be within an active transaction).
  * @param id - The unique identifier of the entity to delete.
  */
 public deleteByIdInternal(db: Database, id: string): void {
  db.run(EXAMPLE_QUERIES.DELETE_BY_ID, [id]);
  logger.debug(`[ExampleRepository] Deleted entity: ${id}`);
 }

 /**
  * Deletes all entity records from the database.
  *
  * @remarks
  * **WARNING**: This operation is irreversible and will delete all entity data.
  *
  * @example
  *
  * ```typescript
  * await repo.deleteAll();
  * ```
  *
  * @returns Promise that resolves when all records are deleted.
  *
  * @throws If the database operation fails.
  */
 public async deleteAll(): Promise<void> {
  return withDatabaseOperation(async () => {
   return this.databaseService.executeTransaction((db) => {
    this.deleteAllInternal(db);
    return Promise.resolve();
   });
  }, "ExampleRepository.deleteAll");
 }

 /**
  * Deletes all entity records within an existing transaction context.
  *
  * @remarks
  * - Must be called within an active transaction context.
  * - This operation is destructive and irreversible.
  *
  * @param db - Database connection (must be within active transaction).
  */
 public deleteAllInternal(db: Database): void {
  db.run(EXAMPLE_QUERIES.DELETE_ALL);
  logger.debug("[ExampleRepository] All entity records deleted (internal)");
 }

 /**
  * Bulk inserts multiple entity records into the database.
  *
  * @example
  *
  * ```typescript
  * await repo.bulkInsert([record1, record2, record3]);
  * ```
  *
  * @param records - Array of entity data to insert.
  *
  * @returns Promise that resolves when all records are inserted.
  *
  * @throws If the database operation fails.
  */
 public async bulkInsert(records: ExampleRow[]): Promise<void> {
  if (records.length === 0) {
   return;
  }

  return withDatabaseOperation(async () => {
   return this.databaseService.executeTransaction((db) => {
    this.bulkInsertInternal(db, records);
    return Promise.resolve();
   });
  }, "ExampleRepository.bulkInsert");
 }

 /**
  * Bulk inserts multiple entity records within an existing transaction context.
  *
  * @remarks
  * - Must be called within an active transaction context.
  * - Uses prepared statements for performance.
  *
  * @param db - The database connection (must be within an active transaction).
  * @param records - Array of entity data to insert.
  */
 public bulkInsertInternal(db: Database, records: ExampleRow[]): void {
  const stmt = db.prepare(EXAMPLE_QUERIES.INSERT);

  try {
   for (const record of records) {
    stmt.run([record.id, record.name, record.createdAt]);
   }
   logger.debug(
    `[ExampleRepository] Bulk inserted ${records.length} entity records (internal)`
   );
  } finally {
   stmt.finalize();
  }
 }

 /**
  * Gets the database instance for internal operations.
  *
  * @remarks
  * Used for read operations and internal methods that don't require
  * transactions.
  *
  * @returns Database connection from the DatabaseService.
  */
 private getDb(): Database {
  return this.databaseService.getDatabase();
 }
}
````

## Customization Checklist

When using this template, replace the following placeholders:

- [ ] `ExampleRepository` → Your repository class name
- [ ] `ExampleRow` → Your entity row interface
- [ ] `example_table` → Your database table name
- [ ] `EXAMPLE_QUERIES` → Your query constants object
- [ ] Add entity-specific fields to `ExampleRow` interface
- [ ] Update SQL queries for your table structure
- [ ] Add any entity-specific methods needed
- [ ] Update TSDoc comments with entity-specific information

## Testing Template

Create a corresponding test file: `ExampleRepository.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ExampleRepository } from "../ExampleRepository";

describe("ExampleRepository", () => {
 let repository: ExampleRepository;
 let mockDatabaseService: any;
 let mockDatabase: any;

 beforeEach(() => {
  mockDatabase = {
   all: vi.fn().mockReturnValue([]),
   get: vi.fn().mockReturnValue(undefined),
   run: vi.fn().mockReturnValue({ changes: 1 }),
   prepare: vi.fn().mockReturnValue({
    run: vi.fn().mockReturnValue({ changes: 1 }),
    finalize: vi.fn(),
   }),
  };

  mockDatabaseService = {
   getDatabase: vi.fn().mockReturnValue(mockDatabase),
   executeTransaction: vi.fn().mockImplementation(async (callback) => {
    return callback(mockDatabase);
   }),
  };

  repository = new ExampleRepository({ databaseService: mockDatabaseService });
 });

 describe("create", () => {
  it("should create entity successfully", async () => {
   const data = { id: "test-id", name: "Test", createdAt: Date.now() };

   await repository.create(data);

   expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
   expect(mockDatabase.run).toHaveBeenCalledWith(
    expect.stringContaining("INSERT"),
    [data.id, data.name, data.createdAt]
   );
  });
 });

 // Add more tests for other methods...
});
```
