# Class: DatabaseService

Defined in: [electron/services/database/DatabaseService.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/DatabaseService.ts#L42)

Core database service for SQLite connection and schema management.

## Remarks

Provides a singleton interface for low-level database operations:
- Connection management
- Schema creation and management
- Transaction support
- Basic backup functionality

Business logic (site loading, import/export, etc.) is handled by DatabaseManager.

**Platform Compatibility:**
- Built for Electron main process environment
- Uses node-sqlite3-wasm (compiled for Node.js compatibility)
- No platform-specific caveats for Windows/macOS/Linux
- WASM binary ensures consistent behavior across platforms

**Thread Safety:**
- Singleton pattern ensures single database connection
- node-sqlite3-wasm operations are synchronous and thread-safe
- Multiple initialize() calls return same connection (idempotent)
- Concurrent access handled at application service layer

## Example

```typescript
const dbService = DatabaseService.getInstance();
dbService.initialize();
const db = dbService.getDatabase();
```

## Methods

### close()

> **close**(): `void`

Defined in: [electron/services/database/DatabaseService.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/DatabaseService.ts#L94)

Closes the database connection safely.

#### Returns

`void`

void

#### Throws

Error When connection close fails.

#### Remarks

**Safety Considerations:**
- Safe to call multiple times (idempotent operation)
- In node-sqlite3-wasm, pending operations complete before close
- All transactions are completed synchronously before closure
- Should be called during application shutdown for proper cleanup

**Platform Compatibility:**
- Optimized for Electron main process environment
- Uses node-sqlite3-wasm which is compiled for Node.js compatibility
- No platform-specific caveats for Windows/macOS/Linux

#### Example

```typescript
dbService.close();
```

***

### executeTransaction()

> **executeTransaction**\<`T`\>(`operation`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Defined in: [electron/services/database/DatabaseService.ts:135](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/DatabaseService.ts#L135)

Executes a function within a database transaction.

#### Type Parameters

##### T

`T`

The return type of the operation.

#### Parameters

##### operation

(`db`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Function to execute within the transaction.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Promise resolving to the operation result.

#### Throws

Error When transaction fails or operation throws.

#### Remarks

**Transaction Behavior in node-sqlite3-wasm:**
- All operations (BEGIN, COMMIT, ROLLBACK) are synchronous
- No race conditions possible due to synchronous execution
- Automatic rollback on operation failure ensures consistency
- Nested transactions not supported (will throw error)

Automatically handles transaction lifecycle:
- Begins transaction before operation
- Commits transaction on successful completion
- Rolls back transaction if operation throws
Ensures data consistency for complex operations involving multiple queries.

#### Example

```typescript
await dbService.executeTransaction(async (db) => {
  // ...your db logic...
});
```

***

### getDatabase()

> **getDatabase**(): `Database`

Defined in: [electron/services/database/DatabaseService.ts:165](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/DatabaseService.ts#L165)

Gets the database instance.

#### Returns

`Database`

The active database connection.

#### Throws

Error When database is not initialized.

#### Remarks

Call [DatabaseService.initialize](#initialize) first to set up the database connection.

#### Example

```typescript
const db = dbService.getDatabase();
```

***

### initialize()

> **initialize**(): `Database`

Defined in: [electron/services/database/DatabaseService.ts:197](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/DatabaseService.ts#L197)

Initializes the database connection and creates schema if it doesn't exist.

#### Returns

`Database`

The initialized database instance.

#### Throws

Error When database initialization fails.

#### Remarks

**Initialization Behavior:**
- Creates the database file in the user data directory if it doesn't exist
- Sets up the complete schema including all required tables and indexes
- Safe to call multiple times - returns existing connection if already initialized
- Uses singleton pattern to prevent multiple connections

**Thread Safety:**
- Multiple concurrent calls are safe (idempotent operation)
- Returns same Database instance for all callers
- No locking required due to synchronous initialization

**Schema Setup:**
- setupMonitorTypeValidation() intentionally receives no database parameter
- Future validation logic may require database access for consistency

#### Example

```typescript
dbService.initialize();
```

***

### getInstance()

> `static` **getInstance**(): `DatabaseService`

Defined in: [electron/services/database/DatabaseService.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/DatabaseService.ts#L69)

Gets the singleton database service instance.

#### Returns

`DatabaseService`

The shared DatabaseService instance.

#### Remarks

Uses singleton pattern to ensure only one database connection
exists throughout the application lifecycle.

#### Example

```typescript
const dbService = DatabaseService.getInstance();
```
