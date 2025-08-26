/**
 * Additional tests for logTemplates functions that need coverage
 */
import { describe, it, expect, vi } from "vitest";
import {
    createTemplateLogger,
    interpolateLogTemplate,
} from "../../utils/logTemplates";

// Mock the logger to capture log calls
const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};

describe("logTemplates function coverage", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    describe("createTemplateLogger", () => {
        it("should create a logger with template functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Constructor", "type");

            const logger = createTemplateLogger(mockLogger);

            expect(logger).toBeDefined();
            expect(typeof logger.debug).toBe("function");
            expect(typeof logger.info).toBe("function");
            expect(typeof logger.warn).toBe("function");
            expect(typeof logger.error).toBe("function");
        });

        it("should log debug messages with template interpolation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logger = createTemplateLogger(mockLogger);
            const template = "User {userId} performed {action}";
            const data = { userId: "123", action: "login" };

            logger.debug(template, data);

            expect(mockLogger.debug).toHaveBeenCalledTimes(1);
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "User 123 performed login",
                data
            );
        });

        it("should log info messages with template interpolation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logger = createTemplateLogger(mockLogger);
            const template = "Processing {count} items";
            const data = { count: "42" };

            logger.info(template, data);

            expect(mockLogger.info).toHaveBeenCalledTimes(1);
            expect(mockLogger.info).toHaveBeenCalledWith(
                "Processing 42 items",
                data
            );
        });

        it("should log warning messages with template interpolation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logger = createTemplateLogger(mockLogger);
            const template = "Warning: {type} detected";
            const data = { type: "memory leak" };

            logger.warn(template, data);

            expect(mockLogger.warn).toHaveBeenCalledTimes(1);
            expect(mockLogger.warn).toHaveBeenCalledWith(
                "Warning: memory leak detected",
                data
            );
        });

        it("should log error messages with template interpolation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const logger = createTemplateLogger(mockLogger);
            const template = "Error: {error} in {module}";
            const data = { error: "timeout", module: "database" };

            logger.error(template, data);

            expect(mockLogger.error).toHaveBeenCalledTimes(1);
            expect(mockLogger.error).toHaveBeenCalledWith(
                "Error: timeout in database",
                data
            );
        });

        it("should handle templates without placeholders", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logger = createTemplateLogger(mockLogger);
            const template = "Simple log message";

            logger.info(template);

            expect(mockLogger.info).toHaveBeenCalledWith(
                "Simple log message",
                undefined
            );
        });

        it("should handle templates without variables object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logger = createTemplateLogger(mockLogger);
            const template = "User {userId} performed {action}";

            logger.info(template);

            expect(mockLogger.info).toHaveBeenCalledWith(
                "User {userId} performed {action}",
                undefined
            );
        });

        it("should handle numeric placeholders", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logger = createTemplateLogger(mockLogger);
            const template = "Processing item {itemId} with value {value}";
            const data = { itemId: 123, value: 456 };

            logger.info(template, data);

            expect(mockLogger.info).toHaveBeenCalledWith(
                "Processing item 123 with value 456",
                data
            );
        });
    });

    describe("interpolateLogTemplate", () => {
        it("should interpolate basic placeholders", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "Hello {name}!";
            const data = { name: "World" };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("Hello World!");
        });

        it("should interpolate multiple placeholders", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "{greeting} {name}, you have {count} messages";
            const data = { greeting: "Hello", name: "Alice", count: 5 };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("Hello Alice, you have 5 messages");
        });

        it("should handle missing placeholders gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "User {userId} performed {action}";
            const data = { userId: "123" }; // missing action

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("User 123 performed {action}");
        });

        it("should handle empty template", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "";
            const data = { key: "value" };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("");
        });

        it("should handle empty data object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "Static message with no placeholders";
            const data = {};

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("Static message with no placeholders");
        });

        it("should handle numeric values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "Count: {count}, Price: {price}";
            const data = { count: 0, price: 19.99 };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("Count: 0, Price: 19.99");
        });

        it("should handle string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "User {name} has role {role}";
            const data = { name: "alice", role: "admin" };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("User alice has role admin");
        });

        it("should handle repeated placeholders", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "{name} loves {name}!";
            const data = { name: "coding" };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("coding loves coding!");
        });

        it("should handle case sensitivity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "{Name} and {name} are different";
            const data = { Name: "Alice", name: "bob" };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("Alice and bob are different");
        });

        it("should handle placeholders with underscores", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "User {user_id} in group {group_name}";
            const data = { user_id: "123", group_name: "admin" };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("User 123 in group admin");
        });

        it("should handle placeholders with dollar signs", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "Variable {$config} has value {$value}";
            const data = { $config: "timeout", $value: "5000" };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("Variable timeout has value 5000");
        });

        it("should not interpolate malformed placeholders", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "Good {name} and bad { invalid } placeholder";
            const data = { name: "alice", invalid: "bob" };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("Good alice and bad { invalid } placeholder");
        });

        it("should handle zero values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "Count is {count}";
            const data = { count: 0 };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("Count is 0");
        });

        it("should handle string numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template = "ID: {id}, Port: {port}";
            const data = { id: "123", port: "8080" };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe("ID: 123, Port: 8080");
        });

        it("should handle complex template with many placeholders", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: logTemplates.functions", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const template =
                "Monitor {monitorId} on site {siteId} returned status {status} in {responseTime}ms";
            const data = {
                monitorId: "mon-123",
                siteId: "site-456",
                status: 200,
                responseTime: 145,
            };

            const result = interpolateLogTemplate(template, data);

            expect(result).toBe(
                "Monitor mon-123 on site site-456 returned status 200 in 145ms"
            );
        });
    });
});
