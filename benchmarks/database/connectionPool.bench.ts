/**
 * Database Connection Pool Performance Benchmarks
 *
 * @file Performance benchmarks for database connection pooling including
 *   connection management, pool sizing, and concurrent access patterns.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Database-ConnectionPool
 *
 * @tags ["performance", "database", "connection-pool", "concurrency", "resources"]
 */

import { bench, describe } from "vitest";

// Mock connection pool implementation
class MockConnection {
    public id: string;
    public isActive: boolean = true;
    public lastUsed: number = Date.now();
    public queryCount: number = 0;

    constructor() {
        this.id = Math.random().toString(36).slice(7);
    }

    async execute(sql: string, params: any[] = []) {
        if (!this.isActive) {
            throw new Error("Connection is closed");
        }

        this.lastUsed = Date.now();
        this.queryCount++;

        // Simulate query execution time
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 5));

        return {
            sql,
            params,
            rows: Math.floor(Math.random() * 100),
            executionTime: Math.random() * 10,
        };
    }

    async close() {
        this.isActive = false;
        await new Promise((resolve) => setTimeout(resolve, 2));
    }

    getAge() {
        return Date.now() - this.lastUsed;
    }
}

class MockConnectionPool {
    private connections = new Map<string, MockConnection>();
    private available: string[] = [];
    private inUse = new Set<string>();
    private maxConnections: number;
    private minConnections: number;
    private maxIdleTime: number;
    private waitQueue: { resolve: Function; reject: Function }[] = [];

    constructor(minConnections = 2, maxConnections = 10, maxIdleTime = 30_000) {
        this.minConnections = minConnections;
        this.maxConnections = maxConnections;
        this.maxIdleTime = maxIdleTime;
        this.initialize();
    }

    private async initialize() {
        for (let i = 0; i < this.minConnections; i++) {
            await this.createConnection();
        }
    }

    private async createConnection(): Promise<string> {
        if (this.connections.size >= this.maxConnections) {
            throw new Error("Maximum connections reached");
        }

        const connection = new MockConnection();
        this.connections.set(connection.id, connection);
        this.available.push(connection.id);

        await new Promise((resolve) => setTimeout(resolve, 5)); // Simulate connection setup
        return connection.id;
    }

    async getConnection(): Promise<MockConnection> {
        // Try to get available connection
        if (this.available.length > 0) {
            const connectionId = this.available.shift()!;
            this.inUse.add(connectionId);
            return this.connections.get(connectionId)!;
        }

        // Try to create new connection if under limit
        if (this.connections.size < this.maxConnections) {
            const connectionId = await this.createConnection();
            this.available.splice(this.available.indexOf(connectionId), 1);
            this.inUse.add(connectionId);
            return this.connections.get(connectionId)!;
        }

        // Wait for connection to become available
        return new Promise((resolve, reject) => {
            this.waitQueue.push({ resolve, reject });

            // Timeout after 10 seconds
            setTimeout(() => {
                const index = this.waitQueue.findIndex(
                    (item) => item.resolve === resolve
                );
                if (index !== -1) {
                    this.waitQueue.splice(index, 1);
                    reject(new Error("Connection timeout"));
                }
            }, 10_000);
        });
    }

    async releaseConnection(connection: MockConnection) {
        if (!this.inUse.has(connection.id)) {
            throw new Error("Connection not in use");
        }

        this.inUse.delete(connection.id);

        // If there's a waiting request, fulfill it
        if (this.waitQueue.length > 0) {
            const { resolve } = this.waitQueue.shift()!;
            this.inUse.add(connection.id);
            resolve(connection);
            return;
        }

        // Return to available pool
        this.available.push(connection.id);
    }

    async executeQuery(sql: string, params: any[] = []) {
        const connection = await this.getConnection();
        try {
            const result = await connection.execute(sql, params);
            return result;
        } finally {
            await this.releaseConnection(connection);
        }
    }

    async executeBatch(queries: { sql: string; params?: any[] }[]) {
        const results: any[] = [];
        for (const query of queries) {
            results.push(await this.executeQuery(query.sql, query.params));
        }
        return results;
    }

    async executeParallel(queries: { sql: string; params?: any[] }[]) {
        const promises = queries.map((query) =>
            this.executeQuery(query.sql, query.params)
        );
        return Promise.all(promises);
    }

    async cleanup() {
        const now = Date.now();
        const connectionsToClose: string[] = [];

        // Find idle connections beyond minimum
        for (const [id, connection] of this.connections) {
            if (
                !this.inUse.has(id) &&
                connection.getAge() > this.maxIdleTime &&
                this.connections.size > this.minConnections
            ) {
                connectionsToClose.push(id);
            }
        }

        // Close idle connections
        for (const id of connectionsToClose) {
            const connection = this.connections.get(id);
            if (connection) {
                await connection.close();
                this.connections.delete(id);
                const availableIndex = this.available.indexOf(id);
                if (availableIndex !== -1) {
                    this.available.splice(availableIndex, 1);
                }
            }
        }

        return connectionsToClose.length;
    }

    async warmUp() {
        const targetConnections = Math.min(
            this.maxConnections,
            this.minConnections + 3
        );
        while (this.connections.size < targetConnections) {
            await this.createConnection();
        }
    }

    getStats() {
        const totalQueries = Array.from(this.connections.values()).reduce(
            (sum, conn) => sum + conn.queryCount,
            0
        );

        return {
            totalConnections: this.connections.size,
            availableConnections: this.available.length,
            inUseConnections: this.inUse.size,
            waitingRequests: this.waitQueue.length,
            totalQueries,
            avgQueriesPerConnection: totalQueries / this.connections.size || 0,
            oldestConnectionAge: Math.max(
                ...Array.from(this.connections.values()).map((c) => c.getAge())
            ),
        };
    }

    async drainPool() {
        // Wait for all in-use connections to be released
        while (this.inUse.size > 0) {
            await new Promise((resolve) => setTimeout(resolve, 10));
        }

        // Close all connections
        for (const connection of this.connections.values()) {
            await connection.close();
        }

        this.connections.clear();
        this.available.length = 0;
        this.inUse.clear();
        this.waitQueue.length = 0;
    }

    async healthCheck() {
        const healthyConnections: string[] = [];
        const unhealthyConnections: string[] = [];

        for (const [id, connection] of this.connections) {
            try {
                await connection.execute("SELECT 1");
                healthyConnections.push(id);
            } catch {
                unhealthyConnections.push(id);
            }
        }

        // Remove unhealthy connections
        for (const id of unhealthyConnections) {
            this.connections.delete(id);
            const availableIndex = this.available.indexOf(id);
            if (availableIndex !== -1) {
                this.available.splice(availableIndex, 1);
            }
            this.inUse.delete(id);
        }

        return {
            healthy: healthyConnections.length,
            unhealthy: unhealthyConnections.length,
            removed: unhealthyConnections.length,
        };
    }
}

describe("Database Connection Pool Performance", () => {
    let pool: MockConnectionPool;

    bench(
        "connection pool initialization",
        async () => {
            pool = new MockConnectionPool(2, 10, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 20)); // Wait for initialization
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "get single connection",
        async () => {
            pool = new MockConnectionPool(5, 10, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 30));
            const connection = await pool.getConnection();
            await pool.releaseConnection(connection);
        },
        { warmupIterations: 5, iterations: 2000 }
    );

    bench(
        "execute single query through pool",
        async () => {
            pool = new MockConnectionPool(5, 10, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 30));
            await pool.executeQuery("SELECT * FROM users WHERE id = ?", [1]);
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "execute batch queries (5 queries)",
        async () => {
            pool = new MockConnectionPool(5, 10, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 30));
            const queries = Array.from({ length: 5 }, (_, i) => ({
                sql: "INSERT INTO test (value) VALUES (?)",
                params: [`value${i}`],
            }));
            await pool.executeBatch(queries);
        },
        { warmupIterations: 2, iterations: 200 }
    );

    bench(
        "execute parallel queries (5 queries)",
        async () => {
            pool = new MockConnectionPool(5, 10, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 30));
            const queries = Array.from({ length: 5 }, (_, i) => ({
                sql: "SELECT * FROM test WHERE id = ?",
                params: [i + 1],
            }));
            await pool.executeParallel(queries);
        },
        { warmupIterations: 2, iterations: 200 }
    );

    bench(
        "execute parallel queries (10 queries)",
        async () => {
            pool = new MockConnectionPool(5, 10, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 30));
            const queries = Array.from({ length: 10 }, (_, i) => ({
                sql: "SELECT * FROM test WHERE id = ?",
                params: [i + 1],
            }));
            await pool.executeParallel(queries);
        },
        { warmupIterations: 2, iterations: 100 }
    );

    bench(
        "connection pool cleanup",
        async () => {
            pool = new MockConnectionPool(2, 10, 1000); // Short idle time
            await new Promise((resolve) => setTimeout(resolve, 30));

            // Use some connections
            const conn1 = await pool.getConnection();
            const conn2 = await pool.getConnection();
            await pool.releaseConnection(conn1);
            await pool.releaseConnection(conn2);

            // Wait for connections to become idle
            await new Promise((resolve) => setTimeout(resolve, 1100));

            await pool.cleanup();
        },
        { warmupIterations: 2, iterations: 100 }
    );

    bench(
        "pool warm-up",
        async () => {
            pool = new MockConnectionPool(1, 10, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 20));
            await pool.warmUp();
        },
        { warmupIterations: 2, iterations: 200 }
    );

    bench(
        "get pool statistics",
        async () => {
            pool = new MockConnectionPool(5, 10, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 30));

            // Execute some queries to generate stats
            await pool.executeQuery("SELECT 1");
            await pool.executeQuery("SELECT 2");

            pool.getStats();
        },
        { warmupIterations: 5, iterations: 5000 }
    );

    bench(
        "connection pool health check",
        async () => {
            pool = new MockConnectionPool(3, 8, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 30));
            await pool.healthCheck();
        },
        { warmupIterations: 2, iterations: 200 }
    );

    bench(
        "high concurrency simulation (20 parallel queries)",
        async () => {
            pool = new MockConnectionPool(5, 10, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 30));

            const queries = Array.from({ length: 20 }, (_, i) => ({
                sql: "SELECT * FROM table WHERE id = ?",
                params: [i + 1],
            }));

            await pool.executeParallel(queries);
        },
        { warmupIterations: 1, iterations: 50 }
    );

    bench(
        "connection exhaustion recovery",
        async () => {
            pool = new MockConnectionPool(2, 3, 30_000); // Small pool
            await new Promise((resolve) => setTimeout(resolve, 20));

            // Get all connections
            const conn1 = await pool.getConnection();
            const conn2 = await pool.getConnection();
            const conn3 = await pool.getConnection();

            // Release them
            await pool.releaseConnection(conn1);
            await pool.releaseConnection(conn2);
            await pool.releaseConnection(conn3);

            // Execute a query to ensure pool is functional
            await pool.executeQuery("SELECT 1");
        },
        { warmupIterations: 2, iterations: 200 }
    );

    bench(
        "pool drain operation",
        async () => {
            pool = new MockConnectionPool(3, 8, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 30));

            // Execute some queries
            await pool.executeQuery("SELECT 1");
            await pool.executeQuery("SELECT 2");

            await pool.drainPool();
        },
        { warmupIterations: 2, iterations: 100 }
    );

    bench(
        "connection reuse efficiency",
        async () => {
            pool = new MockConnectionPool(2, 5, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 20));

            // Execute multiple queries to test reuse
            for (let i = 0; i < 10; i++) {
                await pool.executeQuery("SELECT ?", [i]);
            }
        },
        { warmupIterations: 2, iterations: 100 }
    );

    bench(
        "mixed workload simulation",
        async () => {
            pool = new MockConnectionPool(3, 8, 30_000);
            await new Promise((resolve) => setTimeout(resolve, 30));

            // Mix of serial and parallel operations
            await pool.executeQuery("SELECT 1");

            const parallelQueries = Array.from({ length: 3 }, (_, i) => ({
                sql: "INSERT INTO test VALUES (?)",
                params: [i],
            }));
            await pool.executeParallel(parallelQueries);

            const batchQueries = Array.from({ length: 2 }, (_, i) => ({
                sql: "UPDATE test SET value = ? WHERE id = ?",
                params: [`updated${i}`, i],
            }));
            await pool.executeBatch(batchQueries);
        },
        { warmupIterations: 2, iterations: 100 }
    );
});
