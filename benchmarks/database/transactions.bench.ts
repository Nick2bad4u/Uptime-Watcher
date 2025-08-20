/**
 * Database Transaction Performance Benchmarks
 *
 * @file Performance benchmarks for database transaction operations including
 *   transaction handling, rollbacks, and bulk operations within transactions.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Database-Transactions
 *
 * @tags ["performance", "database", "transactions", "rollback", "bulk"]
 */

import { bench, describe } from "vitest";

// Mock database connection with transaction support
class MockDatabase {
    private data: any[] = [];
    private inTransaction = false;
    private transactionData: any[] = [];
    private nextId = 1;

    prepare(sql: string) {
        return {
            run: (...params: any[]) => {
                const record = {
                    id: this.nextId++,
                    sql,
                    params,
                    timestamp: Date.now(),
                };

                if (this.inTransaction) {
                    this.transactionData.push(record);
                } else {
                    this.data.push(record);
                }

                return { lastInsertRowid: record.id, changes: 1 };
            },
            get: (...params: any[]) => {
                const source = this.inTransaction
                    ? this.transactionData
                    : this.data;
                return source.find((r) => r.params[0] === params[0]) || null;
            },
            all: () => (this.inTransaction ? this.transactionData : this.data),
        };
    }

    exec(sql: string) {
        switch (sql) {
            case "BEGIN TRANSACTION": {
                this.inTransaction = true;
                this.transactionData = [];

                break;
            }
            case "COMMIT": {
                this.data.push(...this.transactionData);
                this.inTransaction = false;
                this.transactionData = [];

                break;
            }
            case "ROLLBACK": {
                this.inTransaction = false;
                this.transactionData = [];

                break;
            }
            // No default
        }
        return this;
    }

    getDataSize() {
        return this.data.length;
    }

    clear() {
        this.data = [];
        this.transactionData = [];
        this.inTransaction = false;
        this.nextId = 1;
    }
}

// Mock Transaction Manager
class MockTransactionManager {
    private db: MockDatabase;

    constructor() {
        this.db = new MockDatabase();
    }

    async executeTransaction<T>(operation: () => T): Promise<T> {
        this.db.exec("BEGIN TRANSACTION");
        try {
            const result = operation();
            this.db.exec("COMMIT");
            return result;
        } catch (error) {
            this.db.exec("ROLLBACK");
            throw error;
        }
    }

    async executeWithRetry<T>(
        operation: () => T,
        maxRetries: number = 3
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await this.executeTransaction(operation);
            } catch (error) {
                lastError = error as Error;
                if (attempt === maxRetries) {
                    throw lastError;
                }
                // Simulate retry delay
                await new Promise((resolve) =>
                    setTimeout(resolve, 2 ** attempt * 10)
                );
            }
        }

        throw lastError;
    }

    bulkInsert(records: any[]) {
        return this.executeTransaction(() => {
            const stmt = this.db.prepare("INSERT INTO test (data) VALUES (?)");
            return records.map((record) => stmt.run(JSON.stringify(record)));
        });
    }

    bulkUpdate(updates: { id: number; data: any }[]) {
        return this.executeTransaction(() => {
            const stmt = this.db.prepare(
                "UPDATE test SET data = ? WHERE id = ?"
            );
            return updates.map((update) =>
                stmt.run(JSON.stringify(update.data), update.id)
            );
        });
    }

    bulkDelete(ids: number[]) {
        return this.executeTransaction(() => {
            const stmt = this.db.prepare("DELETE FROM test WHERE id = ?");
            return ids.map((id) => stmt.run(id));
        });
    }

    complexOperation() {
        return this.executeTransaction(() => {
            const insertStmt = this.db.prepare(
                "INSERT INTO test (data) VALUES (?)"
            );
            const updateStmt = this.db.prepare(
                "UPDATE test SET data = ? WHERE id = ?"
            );
            const deleteStmt = this.db.prepare("DELETE FROM test WHERE id = ?");

            // Insert records
            const insertResults: any[] = [];
            for (let i = 0; i < 10; i++) {
                insertResults.push(
                    insertStmt.run(JSON.stringify({ value: i }))
                );
            }

            // Update some records
            const updateResults: any[] = [];
            for (let i = 0; i < 5; i++) {
                updateResults.push(
                    updateStmt.run(JSON.stringify({ value: i * 2 }), i + 1)
                );
            }

            // Delete some records
            const deleteResults: any[] = [];
            for (let i = 6; i < 8; i++) {
                deleteResults.push(deleteStmt.run(i));
            }

            return { insertResults, updateResults, deleteResults };
        });
    }

    simulateFailure() {
        return this.executeTransaction(() => {
            const stmt = this.db.prepare("INSERT INTO test (data) VALUES (?)");
            stmt.run(JSON.stringify({ value: "success" }));
            throw new Error("Simulated failure");
        });
    }

    nestedOperations() {
        return this.executeTransaction(() => {
            const stmt = this.db.prepare("INSERT INTO test (data) VALUES (?)");

            // Simulate nested operations
            for (let i = 0; i < 5; i++) {
                stmt.run(JSON.stringify({ level: 1, value: i }));

                for (let j = 0; j < 3; j++) {
                    stmt.run(JSON.stringify({ level: 2, parent: i, value: j }));

                    for (let k = 0; k < 2; k++) {
                        stmt.run(
                            JSON.stringify({
                                level: 3,
                                parent: `${i}-${j}`,
                                value: k,
                            })
                        );
                    }
                }
            }

            return this.db.prepare("SELECT COUNT(*) as count FROM test").get();
        });
    }

    getDataSize() {
        return this.db.getDataSize();
    }

    clear() {
        this.db.clear();
    }
}

describe("Database Transaction Performance", () => {
    let manager: MockTransactionManager;

    bench(
        "transaction manager initialization",
        () => {
            manager = new MockTransactionManager();
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "simple transaction (single insert)",
        async () => {
            manager = new MockTransactionManager();
            await manager.executeTransaction(() => {
                const stmt = manager["db"].prepare(
                    "INSERT INTO test (data) VALUES (?)"
                );
                return stmt.run(JSON.stringify({ test: "data" }));
            });
        },
        { warmupIterations: 5, iterations: 5000 }
    );

    bench(
        "simple transaction (multiple operations)",
        async () => {
            manager = new MockTransactionManager();
            await manager.executeTransaction(() => {
                const insertStmt = manager["db"].prepare(
                    "INSERT INTO test (data) VALUES (?)"
                );
                const updateStmt = manager["db"].prepare(
                    "UPDATE test SET data = ? WHERE id = ?"
                );

                const result1 = insertStmt.run(JSON.stringify({ value: 1 }));
                const result2 = insertStmt.run(JSON.stringify({ value: 2 }));
                const result3 = updateStmt.run(
                    JSON.stringify({ value: 3 }),
                    result1.lastInsertRowid
                );

                return [
                    result1,
                    result2,
                    result3,
                ];
            });
        },
        { warmupIterations: 5, iterations: 2000 }
    );

    bench(
        "bulk insert in transaction (50 records)",
        async () => {
            manager = new MockTransactionManager();
            const records = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                value: `record${i}`,
            }));
            await manager.bulkInsert(records);
        },
        { warmupIterations: 2, iterations: 200 }
    );

    bench(
        "bulk insert in transaction (200 records)",
        async () => {
            manager = new MockTransactionManager();
            const records = Array.from({ length: 200 }, (_, i) => ({
                id: i,
                value: `record${i}`,
            }));
            await manager.bulkInsert(records);
        },
        { warmupIterations: 2, iterations: 50 }
    );

    bench(
        "bulk update in transaction (50 records)",
        async () => {
            manager = new MockTransactionManager();
            const updates = Array.from({ length: 50 }, (_, i) => ({
                id: i + 1,
                data: { updated: true, value: i },
            }));
            await manager.bulkUpdate(updates);
        },
        { warmupIterations: 2, iterations: 200 }
    );

    bench(
        "bulk delete in transaction (20 records)",
        async () => {
            manager = new MockTransactionManager();
            const ids = Array.from({ length: 20 }, (_, i) => i + 1);
            await manager.bulkDelete(ids);
        },
        { warmupIterations: 2, iterations: 500 }
    );

    bench(
        "complex transaction operation",
        async () => {
            manager = new MockTransactionManager();
            await manager.complexOperation();
        },
        { warmupIterations: 2, iterations: 500 }
    );

    bench(
        "transaction with retry (success)",
        async () => {
            manager = new MockTransactionManager();
            await manager.executeWithRetry(() => {
                const stmt = manager["db"].prepare(
                    "INSERT INTO test (data) VALUES (?)"
                );
                return stmt.run(JSON.stringify({ retry: "success" }));
            });
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "transaction rollback simulation",
        async () => {
            manager = new MockTransactionManager();
            try {
                await manager.simulateFailure();
            } catch {
                // Expected failure
            }
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "nested operations in transaction",
        async () => {
            manager = new MockTransactionManager();
            await manager.nestedOperations();
        },
        { warmupIterations: 2, iterations: 100 }
    );

    bench(
        "transaction with concurrent reads",
        async () => {
            manager = new MockTransactionManager();
            await manager.executeTransaction(() => {
                const insertStmt = manager["db"].prepare(
                    "INSERT INTO test (data) VALUES (?)"
                );
                const selectStmt = manager["db"].prepare(
                    "SELECT * FROM test WHERE id = ?"
                );

                for (let i = 0; i < 10; i++) {
                    const result = insertStmt.run(
                        JSON.stringify({ concurrent: i })
                    );
                    selectStmt.get(result.lastInsertRowid);
                }

                return selectStmt.all();
            });
        },
        { warmupIterations: 2, iterations: 500 }
    );

    bench(
        "transaction cleanup",
        () => {
            manager = new MockTransactionManager();
            manager.clear();
        },
        { warmupIterations: 5, iterations: 1000 }
    );
});
