/**
 * Minimal test for ServiceContainer to validate basic functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ServiceContainer } from "../../services/ServiceContainer";

// Mock logger to prevent noise
vi.mock("../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock DatabaseService singleton
const mockDatabaseServiceInstance = {
    initialize: vi.fn().mockResolvedValue(undefined),
    isInitialized: vi.fn().mockReturnValue(true),
    close: vi.fn().mockResolvedValue(undefined),
    getConnection: vi.fn(),
    beginTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    rollbackTransaction: vi.fn()
};

vi.mock("../../services/database/DatabaseService", () => ({
    DatabaseService: {
        getInstance: vi.fn(() => mockDatabaseServiceInstance),
    },
}));

describe("ServiceContainer - Minimal Test", () => {
    beforeEach(() => {
        ServiceContainer.resetForTesting();
        vi.clearAllMocks();
    });

    afterEach(() => {
        ServiceContainer.resetForTesting();
    });

    describe("Basic Functionality", () => {
        it("should create singleton instance", () => {
            const container1 = ServiceContainer.getInstance();
            const container2 = ServiceContainer.getInstance();
            
            expect(container1).toBeDefined();
            expect(container2).toBeDefined();
            expect(container1).toBe(container2);
        });

        it("should reset for testing", () => {
            const container1 = ServiceContainer.getInstance();
            ServiceContainer.resetForTesting();
            const container2 = ServiceContainer.getInstance();
            
            expect(container2).toBeDefined();
            // After reset, they should be different instances
            expect(container1).not.toBe(container2);
        });

        it("should create DatabaseService singleton", () => {
            const container = ServiceContainer.getInstance();
            const databaseService = container.getDatabaseService();
            
            expect(databaseService).toBeDefined();
            // The mock should return the mocked instance
            expect(databaseService).toBe(mockDatabaseServiceInstance);
        });

        it("should return same DatabaseService instance on multiple calls", () => {
            const container = ServiceContainer.getInstance();
            const db1 = container.getDatabaseService();
            const db2 = container.getDatabaseService();
            
            expect(db1).toBe(db2);
        });

        it("should return initialization status", () => {
            const container = ServiceContainer.getInstance();
            const status = container.getInitializationStatus();
            
            expect(typeof status).toBe("object");
            expect(status).toBeDefined();
        });
    });
});
