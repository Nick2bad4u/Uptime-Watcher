# Repository Template

Use this template when creating new repository classes for database access.

## File Structure

```text
electron/services/database/
├── ExampleRepository.ts     # Main repository class
└── utils/
    └── exampleQueries.ts    # Query constants (if complex)
```

## Template Code

````typescript
/**
 * Repository for managing [ENTITY] data persistence.
 *
 * @remarks
 * Handles all CRUD operations for [ENTITY] in the database using the repository pattern.
 * All mutations are wrapped in transactions for consistency and error handling.
 * [Add any entity-specific remarks here]
 *
 * @public
 */

import type { Database } from "node-sqlite3-wasm";

import { DatabaseService } from "./DatabaseService";
import { withDatabaseOperation } from "../../utils/operationalHooks";
import { logger } from "../../utils/logger";

/**
 * Dependencies required by the {@link ExampleRepository} for managing [ENTITY] data persistence.
 *
 * @remarks
 * Provides the required {@link DatabaseService} for all [ENTITY] operations.
 * This interface is used for dependency injection.
 *
 * @public
 */
export interface ExampleRepositoryDependencies {
 /**
  * The database service used for transactional operations.
  * @readonly
  */
 databaseService: DatabaseService;
}

/**
 * Interface defining the structure of [ENTITY] data in the database.
 *
 * @remarks
 * Represents the raw database row structure for [ENTITY] records.
 * Used for type safety in repository operations.
 *
 * @public
 */
export interface ExampleRow {
 /** Unique identifier for the [ENTITY] */
 id: string;
 /** Name of the [ENTITY] */
 name: string;
 /** Timestamp when the [ENTITY] was created */
 createdAt: number;
 /** Additional fields specific to your entity */
 // Add other fields as needed
}

/**
 * SQL query constants for [ENTITY] operations.
 *
 * @remarks
 * Centralizes query strings for maintainability and consistency.
 * This constant is internal to the repository and not exported.
 *
 * @internal
 */
const EXAMPLE_QUERIES = {
 SELECT_ALL: "SELECT id, name, createdAt FROM example_table",
 SELECT_BY_ID: "SELECT id, name, createdAt FROM example_table WHERE id = ?",
 INSERT: "INSERT INTO example_table (id, name, createdAt) VALUES (?, ?, ?)",
 UPDATE: "UPDATE example_table SET name = ?, createdAt = ? WHERE id = ?",
 DELETE_BY_ID: "DELETE FROM example_table WHERE id = ?",
 DELETE_ALL: "DELETE FROM example_table",
} as const;

/**
 * Repository for managing [ENTITY] data persistence.
 *
 * @remarks
 * Handles all CRUD operations for [ENTITY] in the database using the repository pattern.
 * All mutations are wrapped in transactions for consistency and error handling.
 * [Add any entity-specific behavior notes]
 *
 * @public
 */
export class ExampleRepository {
 /** @internal */
 private readonly databaseService: DatabaseService;

 /**
  * Constructs a new {@link ExampleRepository} instance.
  *
  * @param dependencies - The required dependencies for [ENTITY] operations.
  * @example
  * ```typescript
  * const repo = new ExampleRepository({ databaseService });
  * ```
  */
 constructor(dependencies: ExampleRepositoryDependencies) {
  this.databaseService = dependencies.databaseService;
 }

 /**
  * Creates a new [ENTITY] in the database.
  *
  * @param data - The [ENTITY] data to create.
  * @returns Promise that resolves when the [ENTITY] is created.
  * @throws If the database operation fails.
  * @example
  * ```typescript
  * await repo.create({ id: "123", name: "Example", createdAt: Date.now() });
  * ```
  */
 public async create(data: ExampleRow): Promise<void> {
  return withDatabaseOperation(async () => {
   return this.databaseService.executeTransaction((db) => {
    this.createInternal(db, data);
    return Promise.resolve();
   });
  }, "ExampleRepository.create");
 }

 /**
  * Creates a new [ENTITY] within an existing transaction context.
  *
  * @param db - The database connection (must be within an active transaction).
  * @param data - The [ENTITY] data to create.
  * @remarks
  * - Must be called within an active transaction context.
  * - Applies data validation and normalization.
  */
 public createInternal(db: Database, data: ExampleRow): void {
  db.run(EXAMPLE_QUERIES.INSERT, [data.id, data.name, data.createdAt]);
  logger.debug(`[ExampleRepository] Created [ENTITY]: ${data.id}`);
 }

 /**
  * Retrieves all [ENTITY] records from the database.
  *
  * @returns Promise resolving to an array of all [ENTITY] data.
  * @throws If the database operation fails.
  * @example
  * ```typescript
  * const examples = await repo.findAll();
  * ```
  */
 public async findAll(): Promise<ExampleRow[]> {
  const db = this.getDb();
  return db.all(EXAMPLE_QUERIES.SELECT_ALL);
 }

 /**
  * Finds a [ENTITY] by its unique identifier.
  *
  * @param id - The unique identifier of the [ENTITY].
  * @returns Promise resolving to the [ENTITY] data, or undefined if not found.
  * @throws If the database operation fails.
  * @example
  * ```typescript
  * const example = await repo.findById("123");
  * ```
  */
 public async findById(id: string): Promise<ExampleRow | undefined> {
  const db = this.getDb();
  return db.get(EXAMPLE_QUERIES.SELECT_BY_ID, [id]);
 }

 /**
  * Updates an existing [ENTITY] in the database.
  *
  * @param id - The unique identifier of the [ENTITY] to update.
  * @param data - The updated [ENTITY] data.
  * @returns Promise that resolves when the [ENTITY] is updated.
  * @throws If the database operation fails.
  * @example
  * ```typescript
  * await repo.update("123", { name: "Updated Name", createdAt: Date.now() });
  * ```
  */
 public async update(id: string, data: Partial<Omit<ExampleRow, "id">>): Promise<void> {
  return withDatabaseOperation(async () => {
   return this.databaseService.executeTransaction((db) => {
    this.updateInternal(db, id, data);
    return Promise.resolve();
   });
  }, "ExampleRepository.update");
 }

 /**
  * Updates an existing [ENTITY] within an existing transaction context.
  *
  * @param db - The database connection (must be within an active transaction).
  * @param id - The unique identifier of the [ENTITY] to update.
  * @param data - The updated [ENTITY] data.
  * @remarks
  * Must be called within an active transaction context.
  */
 public updateInternal(db: Database, id: string, data: Partial<Omit<ExampleRow, "id">>): void {
  // Build dynamic update query based on provided fields
  const fields = Object.keys(data).filter((key) => data[key as keyof typeof data] !== undefined);
  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field as keyof typeof data]);

  const query = `UPDATE example_table SET ${setClause} WHERE id = ?`;
  db.run(query, [...values, id]);

  logger.debug(`[ExampleRepository] Updated [ENTITY]: ${id}`);
 }

 /**
  * Deletes a [ENTITY] by its unique identifier.
  *
  * @param id - The unique identifier of the [ENTITY] to delete.
  * @returns Promise that resolves when the [ENTITY] is deleted.
  * @throws If the database operation fails.
  * @example
  * ```typescript
  * await repo.deleteById("123");
  * ```
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
  * Deletes a [ENTITY] within an existing transaction context.
  *
  * @param db - The database connection (must be within an active transaction).
  * @param id - The unique identifier of the [ENTITY] to delete.
  * @remarks
  * Must be called within an active transaction context.
  */
 public deleteByIdInternal(db: Database, id: string): void {
  db.run(EXAMPLE_QUERIES.DELETE_BY_ID, [id]);
  logger.debug(`[ExampleRepository] Deleted [ENTITY]: ${id}`);
 }

 /**
  * Deletes all [ENTITY] records from the database.
  *
  * @remarks
  * **WARNING**: This operation is irreversible and will delete all [ENTITY] data.
  *
  * @returns Promise that resolves when all records are deleted.
  * @throws If the database operation fails.
  * @example
  * ```typescript
  * await repo.deleteAll();
  * ```
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
  * Deletes all [ENTITY] records within an existing transaction context.
  *
  * @param db - The database connection (must be within an active transaction).
  * @remarks
  * - Must be called within an active transaction context.
  * - This operation is destructive and irreversible.
  */
 public deleteAllInternal(db: Database): void {
  db.run(EXAMPLE_QUERIES.DELETE_ALL);
  logger.debug("[ExampleRepository] All [ENTITY] records deleted (internal)");
 }

 /**
  * Bulk inserts multiple [ENTITY] records into the database.
  *
  * @param records - Array of [ENTITY] data to insert.
  * @returns Promise that resolves when all records are inserted.
  * @throws If the database operation fails.
  * @example
  * ```typescript
  * await repo.bulkInsert([record1, record2, record3]);
  * ```
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
  * Bulk inserts multiple [ENTITY] records within an existing transaction context.
  *
  * @param db - The database connection (must be within an active transaction).
  * @param records - Array of [ENTITY] data to insert.
  * @remarks
  * - Must be called within an active transaction context.
  * - Uses prepared statements for performance.
  */
 public bulkInsertInternal(db: Database, records: ExampleRow[]): void {
  const stmt = db.prepare(EXAMPLE_QUERIES.INSERT);

  try {
   for (const record of records) {
    stmt.run([record.id, record.name, record.createdAt]);
   }
   logger.debug(`[ExampleRepository] Bulk inserted ${records.length} [ENTITY] records (internal)`);
  } finally {
   stmt.finalize();
  }
 }

 /**
  * Gets the database instance for internal operations.
  *
  * @returns Database connection from the {@link DatabaseService}.
  * @remarks
  * Used for read operations and internal methods that don't require transactions.
  */
 private getDb(): Database {
  return this.databaseService.getDatabase();
 }
}
````

## Customization Checklist

When using this template, replace the following placeholders:

- [ ] `ExampleRepository` → Your repository class name
- [ ] `[ENTITY]` → Your entity name (e.g., "site", "monitor", "user")
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
  it("should create [ENTITY] successfully", async () => {
   const data = { id: "test-id", name: "Test", createdAt: Date.now() };

   await repository.create(data);

   expect(mockDatabaseService.executeTransaction).toHaveBeenCalled();
   expect(mockDatabase.run).toHaveBeenCalledWith(expect.stringContaining("INSERT"), [
    data.id,
    data.name,
    data.createdAt,
   ]);
  });
 });

 // Add more tests for other methods...
});
```
