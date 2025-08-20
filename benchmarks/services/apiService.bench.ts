/**
 * API Service Performance Benchmarks
 *
 * @file Performance benchmarks for API service, endpoint handling, middleware,
 *   and request processing.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-19
 *
 * @category Performance
 *
 * @benchmark Services-API
 *
 * @tags ["performance", "services", "api", "middleware", "endpoints"]
 */

import { bench, describe } from "vitest";

interface ApiRequest {
    id: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;
    headers: Record<string, string>;
    query: Record<string, any>;
    body?: any;
    ip: string;
    userAgent: string;
    timestamp: Date;
    metadata: Record<string, any>;
}

interface ApiResponse {
    id: string;
    requestId: string;
    status: number;
    headers: Record<string, string>;
    body?: any;
    executionTime: number;
    size: number;
    cached: boolean;
    timestamp: Date;
}

interface Route {
    id: string;
    method: string;
    path: string;
    handler: (req: ApiRequest, res: ApiResponse) => Promise<any>;
    middleware: Middleware[];
    validation?: ValidationRule[];
    rateLimit?: RateLimit;
    cache?: CacheRule;
    authenticated: boolean;
    permissions: string[];
    metadata: Record<string, any>;
}

interface Middleware {
    name: string;
    handler: (
        req: ApiRequest,
        res: ApiResponse,
        next: () => void
    ) => Promise<void>;
    priority: number;
    global: boolean;
    enabled: boolean;
}

interface ValidationRule {
    field: string;
    type: "string" | "number" | "boolean" | "object" | "array";
    required: boolean;
    rules: string[];
}

interface RateLimit {
    windowMs: number;
    maxRequests: number;
    skipIf?: (req: ApiRequest) => boolean;
    keyGenerator?: (req: ApiRequest) => string;
}

interface CacheRule {
    ttl: number;
    keyGenerator: (req: ApiRequest) => string;
    conditions?: (req: ApiRequest) => boolean;
    vary?: string[];
}

interface ApiMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    cacheHitRate: number;
    uniqueIps: number;
    topEndpoints: { path: string; count: number }[];
}

interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
    apiKeyHash?: string;
    lastLoginAt?: Date;
    isActive: boolean;
}

interface ApiKey {
    id: string;
    name: string;
    userId: string;
    key: string;
    hash: string;
    permissions: string[];
    rateLimit?: RateLimit;
    expiresAt?: Date;
    lastUsedAt?: Date;
    isActive: boolean;
}

class MockRateLimiter {
    private requests = new Map<string, number[]>();

    async isAllowed(
        key: string,
        windowMs: number,
        maxRequests: number
    ): Promise<boolean> {
        const now = Date.now();
        const cutoff = now - windowMs;

        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }

        const keyRequests = this.requests.get(key)!;

        // Remove old requests
        const validRequests = keyRequests.filter(
            (timestamp) => timestamp > cutoff
        );

        if (validRequests.length >= maxRequests) {
            return false;
        }

        validRequests.push(now);
        this.requests.set(key, validRequests);
        return true;
    }

    async reset(key?: string): Promise<void> {
        if (key) {
            this.requests.delete(key);
        } else {
            this.requests.clear();
        }
    }

    async getUsage(
        key: string,
        windowMs: number
    ): Promise<{ count: number; resetTime: number }> {
        const now = Date.now();
        const cutoff = now - windowMs;

        const keyRequests = this.requests.get(key) || [];
        const validRequests = keyRequests.filter(
            (timestamp) => timestamp > cutoff
        );

        const oldestRequest = Math.min(...validRequests);
        const resetTime = oldestRequest + windowMs;

        return {
            count: validRequests.length,
            resetTime: Math.max(resetTime, now),
        };
    }

    clear(): void {
        this.requests.clear();
    }
}

class MockCache {
    private cache = new Map<string, { value: any; expiry: number }>();

    async get(key: string): Promise<any | null> {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    async set(key: string, value: any, ttlSeconds: number): Promise<void> {
        const expiry = Date.now() + ttlSeconds * 1000;
        this.cache.set(key, { value, expiry });
    }

    async del(key: string): Promise<boolean> {
        return this.cache.delete(key);
    }

    async exists(key: string): Promise<boolean> {
        const item = this.cache.get(key);
        if (!item) return false;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    async flush(): Promise<void> {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }

    clear(): void {
        this.cache.clear();
    }
}

class MockUserRepository {
    private users = new Map<string, User>();
    private nextId = 1;

    async create(userData: Partial<User>): Promise<User> {
        const user: User = {
            id: `user-${this.nextId++}`,
            username: userData.username || `user${this.nextId}`,
            email: userData.email || `user${this.nextId}@test.com`,
            roles: userData.roles || ["user"],
            permissions: userData.permissions || ["read"],
            isActive:
                userData.isActive === undefined ? true : userData.isActive,
            lastLoginAt: userData.lastLoginAt,
        };

        this.users.set(user.id, user);
        return { ...user };
    }

    async findById(id: string): Promise<User | null> {
        const user = this.users.get(id);
        return user ? { ...user } : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return { ...user };
            }
        }
        return null;
    }

    async findByApiKey(apiKeyHash: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.apiKeyHash === apiKeyHash) {
                return { ...user };
            }
        }
        return null;
    }

    async updateLastLogin(userId: string): Promise<void> {
        const user = this.users.get(userId);
        if (user) {
            user.lastLoginAt = new Date();
            this.users.set(userId, user);
        }
    }

    async hasPermission(userId: string, permission: string): Promise<boolean> {
        const user = this.users.get(userId);
        return user ? user.permissions.includes(permission) : false;
    }

    clear(): void {
        this.users.clear();
        this.nextId = 1;
    }
}

class MockApiKeyRepository {
    private apiKeys = new Map<string, ApiKey>();
    private nextId = 1;

    async create(keyData: Partial<ApiKey>): Promise<ApiKey> {
        const apiKey: ApiKey = {
            id: `key-${this.nextId++}`,
            name: keyData.name || `API Key ${this.nextId}`,
            userId: keyData.userId || "user-1",
            key: keyData.key || this.generateKey(),
            hash:
                keyData.hash || this.hashKey(keyData.key || this.generateKey()),
            permissions: keyData.permissions || ["read"],
            rateLimit: keyData.rateLimit,
            expiresAt: keyData.expiresAt,
            isActive: keyData.isActive === undefined ? true : keyData.isActive,
        };

        this.apiKeys.set(apiKey.id, apiKey);
        return { ...apiKey };
    }

    async findByHash(hash: string): Promise<ApiKey | null> {
        for (const apiKey of this.apiKeys.values()) {
            if (apiKey.hash === hash) {
                return { ...apiKey };
            }
        }
        return null;
    }

    async updateLastUsed(keyId: string): Promise<void> {
        const apiKey = this.apiKeys.get(keyId);
        if (apiKey) {
            apiKey.lastUsedAt = new Date();
            this.apiKeys.set(keyId, apiKey);
        }
    }

    private generateKey(): string {
        return `ak_${Math.random().toString(36).slice(2, 15)}${Math.random().toString(36).slice(2, 15)}`;
    }

    private hashKey(key: string): string {
        // Simple hash implementation
        return `hash_${key.split("").reduce((hash, char) => hash + char.charCodeAt(0), 0)}`;
    }

    clear(): void {
        this.apiKeys.clear();
        this.nextId = 1;
    }
}

class MockApiService {
    private routes = new Map<string, Route>();
    private middleware: Middleware[] = [];
    private rateLimiter: MockRateLimiter;
    private cache: MockCache;
    private userRepo: MockUserRepository;
    private apiKeyRepo: MockApiKeyRepository;
    private requestId = 1;
    private metrics: ApiMetrics;

    constructor() {
        this.rateLimiter = new MockRateLimiter();
        this.cache = new MockCache();
        this.userRepo = new MockUserRepository();
        this.apiKeyRepo = new MockApiKeyRepository();
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            requestsPerSecond: 0,
            errorRate: 0,
            cacheHitRate: 0,
            uniqueIps: 0,
            topEndpoints: [],
        };
    }

    registerRoute(
        method: string,
        path: string,
        handler: Route["handler"],
        options?: {
            middleware?: Middleware[];
            validation?: ValidationRule[];
            rateLimit?: RateLimit;
            cache?: CacheRule;
            authenticated?: boolean;
            permissions?: string[];
            metadata?: Record<string, any>;
        }
    ): Route {
        const routeId = `${method}:${path}`;
        const route: Route = {
            id: routeId,
            method: method.toUpperCase(),
            path,
            handler,
            middleware: options?.middleware || [],
            validation: options?.validation,
            rateLimit: options?.rateLimit,
            cache: options?.cache,
            authenticated: options?.authenticated || false,
            permissions: options?.permissions || [],
            metadata: options?.metadata || {},
        };

        this.routes.set(routeId, route);
        return route;
    }

    registerMiddleware(middleware: Middleware): void {
        this.middleware.push(middleware);
        this.middleware.sort((a, b) => b.priority - a.priority);
    }

    async processRequest(
        method: string,
        path: string,
        requestData?: {
            headers?: Record<string, string>;
            query?: Record<string, any>;
            body?: any;
            ip?: string;
            userAgent?: string;
        }
    ): Promise<ApiResponse> {
        const startTime = Date.now();
        const request: ApiRequest = {
            id: `req-${this.requestId++}`,
            method: method.toUpperCase() as ApiRequest["method"],
            path,
            headers: requestData?.headers || {},
            query: requestData?.query || {},
            body: requestData?.body,
            ip: requestData?.ip || "127.0.0.1",
            userAgent: requestData?.userAgent || "MockClient/1.0",
            timestamp: new Date(),
            metadata: {},
        };

        const response: ApiResponse = {
            id: `res-${this.requestId}`,
            requestId: request.id,
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "X-Request-ID": request.id,
            },
            executionTime: 0,
            size: 0,
            cached: false,
            timestamp: new Date(),
        };

        try {
            // Find matching route
            const routeId = `${method.toUpperCase()}:${path}`;
            const route = this.routes.get(routeId);

            if (!route) {
                response.status = 404;
                response.body = { error: "Route not found" };
                return this.finalizeResponse(request, response, startTime);
            }

            // Rate limiting
            if (route.rateLimit) {
                const key = route.rateLimit.keyGenerator
                    ? route.rateLimit.keyGenerator(request)
                    : request.ip;

                const allowed = await this.rateLimiter.isAllowed(
                    key,
                    route.rateLimit.windowMs,
                    route.rateLimit.maxRequests
                );

                if (!allowed) {
                    response.status = 429;
                    response.body = { error: "Rate limit exceeded" };
                    return this.finalizeResponse(request, response, startTime);
                }
            }

            // Authentication
            if (route.authenticated) {
                const authResult = await this.authenticate(request);
                if (!authResult.success) {
                    response.status = authResult.status || 401;
                    response.body = { error: authResult.error };
                    return this.finalizeResponse(request, response, startTime);
                }
                request.metadata.user = authResult.user;
            }

            // Authorization
            if (route.permissions.length > 0 && request.metadata.user) {
                const hasPermission = route.permissions.some((permission) =>
                    request.metadata.user.permissions.includes(permission)
                );

                if (!hasPermission) {
                    response.status = 403;
                    response.body = { error: "Insufficient permissions" };
                    return this.finalizeResponse(request, response, startTime);
                }
            }

            // Validation
            if (route.validation) {
                const validationResult = this.validateRequest(
                    request,
                    route.validation
                );
                if (!validationResult.valid) {
                    response.status = 400;
                    response.body = {
                        error: "Validation failed",
                        details: validationResult.errors,
                    };
                    return this.finalizeResponse(request, response, startTime);
                }
            }

            // Cache check
            let cacheKey: string | null = null;
            if (route.cache && request.method === "GET") {
                cacheKey = route.cache.keyGenerator(request);
                const cached = await this.cache.get(cacheKey);

                if (cached) {
                    response.body = cached;
                    response.cached = true;
                    return this.finalizeResponse(request, response, startTime);
                }
            }

            // Execute middleware
            for (const mw of [
                ...this.middleware.filter((m) => m.global),
                ...route.middleware,
            ]) {
                if (mw.enabled) {
                    await new Promise<void>((resolve, reject) => {
                        let called = false;
                        const next = () => {
                            if (!called) {
                                called = true;
                                resolve();
                            }
                        };

                        mw.handler(request, response, next).catch(reject);
                    });
                }
            }

            // Execute route handler
            const result = await route.handler(request, response);
            response.body = result;

            // Cache response
            if (
                route.cache &&
                cacheKey &&
                request.method === "GET" &&
                response.status === 200
            ) {
                await this.cache.set(cacheKey, result, route.cache.ttl);
            }

            return this.finalizeResponse(request, response, startTime);
        } catch (error) {
            response.status = 500;
            response.body = {
                error: "Internal server error",
                message: error.message,
            };
            return this.finalizeResponse(request, response, startTime);
        }
    }

    private async authenticate(request: ApiRequest): Promise<{
        success: boolean;
        status?: number;
        error?: string;
        user?: User;
    }> {
        const authHeader = request.headers["authorization"];
        if (!authHeader) {
            return {
                success: false,
                status: 401,
                error: "Authorization header required",
            };
        }

        if (authHeader.startsWith("Bearer ")) {
            const token = authHeader.slice(7);
            // JWT validation would go here
            const user = await this.userRepo.findById("user-1"); // Mock user
            if (user && user.isActive) {
                await this.userRepo.updateLastLogin(user.id);
                return { success: true, user };
            }
        } else if (authHeader.startsWith("ApiKey ")) {
            const apiKey = authHeader.slice(7);
            const hash = this.hashApiKey(apiKey);
            const keyRecord = await this.apiKeyRepo.findByHash(hash);

            if (keyRecord && keyRecord.isActive) {
                if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
                    return {
                        success: false,
                        status: 401,
                        error: "API key expired",
                    };
                }

                const user = await this.userRepo.findById(keyRecord.userId);
                if (user && user.isActive) {
                    await this.apiKeyRepo.updateLastUsed(keyRecord.id);
                    return { success: true, user };
                }
            }
        }

        return { success: false, status: 401, error: "Invalid credentials" };
    }

    private validateRequest(
        request: ApiRequest,
        rules: ValidationRule[]
    ): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        for (const rule of rules) {
            const value =
                request.body?.[rule.field] || request.query[rule.field];

            if (rule.required && (value === undefined || value === null)) {
                errors.push(`Field '${rule.field}' is required`);
                continue;
            }

            if (value !== undefined && value !== null) {
                const actualType = Array.isArray(value)
                    ? "array"
                    : typeof value;
                if (actualType !== rule.type) {
                    errors.push(
                        `Field '${rule.field}' must be of type ${rule.type}`
                    );
                }
            }
        }

        return { valid: errors.length === 0, errors };
    }

    private finalizeResponse(
        request: ApiRequest,
        response: ApiResponse,
        startTime: number
    ): ApiResponse {
        const executionTime = Date.now() - startTime;
        response.executionTime = executionTime;
        response.timestamp = new Date();
        response.size = JSON.stringify(response.body || {}).length;

        // Update metrics
        this.metrics.totalRequests++;
        if (response.status >= 200 && response.status < 400) {
            this.metrics.successfulRequests++;
        } else {
            this.metrics.failedRequests++;
        }

        this.metrics.averageResponseTime =
            (this.metrics.averageResponseTime *
                (this.metrics.totalRequests - 1) +
                executionTime) /
            this.metrics.totalRequests;

        this.metrics.errorRate =
            this.metrics.failedRequests / this.metrics.totalRequests;

        return response;
    }

    private hashApiKey(key: string): string {
        return `hash_${key.split("").reduce((hash, char) => hash + char.charCodeAt(0), 0)}`;
    }

    async getMetrics(): Promise<ApiMetrics> {
        return { ...this.metrics };
    }

    async getRoutes(): Promise<Route[]> {
        return Array.from(this.routes.values()).map((route) => ({ ...route }));
    }

    async createUser(userData: Partial<User>): Promise<User> {
        return await this.userRepo.create(userData);
    }

    async createApiKey(keyData: Partial<ApiKey>): Promise<ApiKey> {
        return await this.apiKeyRepo.create(keyData);
    }

    reset(): void {
        this.routes.clear();
        this.middleware = [];
        this.rateLimiter.clear();
        this.cache.clear();
        this.userRepo.clear();
        this.apiKeyRepo.clear();
        this.requestId = 1;
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            requestsPerSecond: 0,
            errorRate: 0,
            cacheHitRate: 0,
            uniqueIps: 0,
            topEndpoints: [],
        };
    }
}

// Helper functions for creating test data
function createTestRoutes(): {
    method: string;
    path: string;
    handler: Route["handler"];
    options?: any;
}[] {
    return [
        {
            method: "GET",
            path: "/api/sites",
            handler: async () => ({
                sites: [
                    "site1",
                    "site2",
                    "site3",
                ],
            }),
            options: {
                cache: {
                    ttl: 300,
                    keyGenerator: (req: ApiRequest) => `sites:${req.ip}`,
                },
            },
        },
        {
            method: "POST",
            path: "/api/sites",
            handler: async (req: ApiRequest) => ({
                site: { id: "new-site", ...req.body },
            }),
            options: {
                authenticated: true,
                permissions: ["write"],
                validation: [
                    {
                        field: "name",
                        type: "string",
                        required: true,
                        rules: [],
                    },
                    { field: "url", type: "string", required: true, rules: [] },
                ],
            },
        },
        {
            method: "GET",
            path: "/api/monitors",
            handler: async () => ({ monitors: ["monitor1", "monitor2"] }),
            options: {
                rateLimit: {
                    windowMs: 60_000,
                    maxRequests: 100,
                    keyGenerator: (req: ApiRequest) => req.ip,
                },
            },
        },
        {
            method: "DELETE",
            path: "/api/sites",
            handler: async () => ({ deleted: true }),
            options: {
                authenticated: true,
                permissions: ["delete"],
            },
        },
    ];
}

function createTestMiddleware(): Middleware[] {
    return [
        {
            name: "cors",
            handler: async (
                req: ApiRequest,
                res: ApiResponse,
                next: () => void
            ) => {
                res.headers["Access-Control-Allow-Origin"] = "*";
                next();
            },
            priority: 10,
            global: true,
            enabled: true,
        },
        {
            name: "logger",
            handler: async (
                req: ApiRequest,
                res: ApiResponse,
                next: () => void
            ) => {
                console.log(`${req.method} ${req.path}`);
                next();
            },
            priority: 5,
            global: true,
            enabled: true,
        },
        {
            name: "security",
            handler: async (
                req: ApiRequest,
                res: ApiResponse,
                next: () => void
            ) => {
                res.headers["X-Frame-Options"] = "DENY";
                res.headers["X-Content-Type-Options"] = "nosniff";
                next();
            },
            priority: 8,
            global: true,
            enabled: true,
        },
    ];
}

describe("API Service Performance", () => {
    let service: MockApiService;

    bench(
        "service initialization",
        () => {
            service = new MockApiService();
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "route registration",
        () => {
            service = new MockApiService();
            const routes = createTestRoutes();

            routes.forEach((route) => {
                service.registerRoute(
                    route.method,
                    route.path,
                    route.handler,
                    route.options
                );
            });
        },
        { warmupIterations: 10, iterations: 1500 }
    );

    bench(
        "middleware registration",
        () => {
            service = new MockApiService();
            const middleware = createTestMiddleware();

            middleware.forEach((mw) => {
                service.registerMiddleware(mw);
            });
        },
        { warmupIterations: 10, iterations: 3000 }
    );

    bench(
        "simple GET request",
        () => {
            service = new MockApiService();
            service.registerRoute("GET", "/api/test", async () => ({
                message: "Hello World",
            }));

            service.processRequest("GET", "/api/test");
        },
        { warmupIterations: 10, iterations: 2500 }
    );

    bench(
        "POST request with body",
        () => {
            service = new MockApiService();
            service.registerRoute(
                "POST",
                "/api/data",
                async (req: ApiRequest) => ({
                    received: req.body,
                    processed: true,
                })
            );

            service.processRequest("POST", "/api/data", {
                body: { name: "Test", value: 123, active: true },
                headers: { "Content-Type": "application/json" },
            });
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "authenticated request",
        () => {
            service = new MockApiService();

            service
                .createUser({
                    username: "testuser",
                    email: "test@example.com",
                    permissions: ["read", "write"],
                })
                .then(() => {
                    service.registerRoute(
                        "GET",
                        "/api/protected",
                        async () => ({
                            data: "sensitive information",
                        }),
                        { authenticated: true }
                    );

                    service.processRequest("GET", "/api/protected", {
                        headers: { Authorization: "Bearer valid-token" },
                    });
                });
        },
        { warmupIterations: 10, iterations: 1500 }
    );

    bench(
        "rate limited requests",
        () => {
            service = new MockApiService();

            service.registerRoute(
                "GET",
                "/api/limited",
                async () => ({
                    data: "rate limited endpoint",
                }),
                {
                    rateLimit: {
                        windowMs: 60_000,
                        maxRequests: 10,
                        keyGenerator: (req: ApiRequest) => req.ip,
                    },
                }
            );

            // Make multiple requests from same IP
            const requests = Array.from({ length: 5 }, () =>
                service.processRequest("GET", "/api/limited", {
                    ip: "192.168.1.1",
                })
            );

            Promise.all(requests);
        },
        { warmupIterations: 10, iterations: 800 }
    );

    bench(
        "cached requests",
        () => {
            service = new MockApiService();

            service.registerRoute(
                "GET",
                "/api/cached",
                async () => ({
                    data: "expensive computation",
                    timestamp: Date.now(),
                }),
                {
                    cache: {
                        ttl: 300,
                        keyGenerator: (req: ApiRequest) =>
                            `cached:${req.path}:${req.ip}`,
                    },
                }
            );

            // First request (cache miss) then second request (cache hit)
            service.processRequest("GET", "/api/cached").then(() => {
                service.processRequest("GET", "/api/cached");
            });
        },
        { warmupIterations: 10, iterations: 1200 }
    );

    bench(
        "request validation",
        () => {
            service = new MockApiService();

            service.registerRoute(
                "POST",
                "/api/validated",
                async (req: ApiRequest) => ({
                    validated: true,
                    data: req.body,
                }),
                {
                    validation: [
                        {
                            field: "name",
                            type: "string",
                            required: true,
                            rules: [],
                        },
                        {
                            field: "age",
                            type: "number",
                            required: true,
                            rules: [],
                        },
                        {
                            field: "active",
                            type: "boolean",
                            required: false,
                            rules: [],
                        },
                    ],
                }
            );

            const validRequest = service.processRequest(
                "POST",
                "/api/validated",
                {
                    body: { name: "John", age: 30, active: true },
                }
            );

            const invalidRequest = service.processRequest(
                "POST",
                "/api/validated",
                {
                    body: { name: "John" }, // Missing required age field
                }
            );

            Promise.all([validRequest, invalidRequest]);
        },
        { warmupIterations: 10, iterations: 1500 }
    );

    bench(
        "middleware processing",
        () => {
            service = new MockApiService();

            const middleware = createTestMiddleware();
            middleware.forEach((mw) => service.registerMiddleware(mw));

            service.registerRoute("GET", "/api/middleware-test", async () => ({
                processed: true,
            }));

            service.processRequest("GET", "/api/middleware-test");
        },
        { warmupIterations: 10, iterations: 1800 }
    );

    bench(
        "API key authentication",
        () => {
            service = new MockApiService();

            service
                .createUser({
                    username: "apiuser",
                    permissions: ["api:read", "api:write"],
                })
                .then((user) =>
                    service.createApiKey({
                        name: "Test API Key",
                        userId: user.id,
                        permissions: ["api:read", "api:write"],
                    })
                )
                .then((apiKey) => {
                    service.registerRoute(
                        "GET",
                        "/api/key-protected",
                        async () => ({
                            data: "API key protected data",
                        }),
                        { authenticated: true }
                    );

                    service.processRequest("GET", "/api/key-protected", {
                        headers: { Authorization: `ApiKey ${apiKey.key}` },
                    });
                });
        },
        { warmupIterations: 10, iterations: 1000 }
    );

    bench(
        "permission-based authorization",
        () => {
            service = new MockApiService();

            service
                .createUser({
                    username: "limiteduser",
                    permissions: ["read"],
                })
                .then(() => {
                    service.registerRoute(
                        "DELETE",
                        "/api/admin-only",
                        async () => ({
                            deleted: true,
                        }),
                        {
                            authenticated: true,
                            permissions: ["delete", "admin"],
                        }
                    );

                    service.processRequest("DELETE", "/api/admin-only", {
                        headers: { Authorization: "Bearer valid-token" },
                    });
                });
        },
        { warmupIterations: 10, iterations: 1200 }
    );

    bench(
        "bulk route registration",
        () => {
            service = new MockApiService();

            const routes = Array.from({ length: 20 }, (_, i) => ({
                method:
                    i % 4 === 0
                        ? "GET"
                        : i % 4 === 1
                          ? "POST"
                          : i % 4 === 2
                            ? "PUT"
                            : "DELETE",
                path: `/api/endpoint-${i}`,
                handler: async () => ({ id: i, data: `Endpoint ${i}` }),
                options: i % 3 === 0 ? { authenticated: true } : undefined,
            }));

            routes.forEach((route) => {
                service.registerRoute(
                    route.method,
                    route.path,
                    route.handler,
                    route.options
                );
            });
        },
        { warmupIterations: 10, iterations: 500 }
    );

    bench(
        "concurrent request processing",
        () => {
            service = new MockApiService();

            // Setup multiple routes
            const routes = createTestRoutes();
            routes.forEach((route) => {
                service.registerRoute(
                    route.method,
                    route.path,
                    route.handler,
                    route.options
                );
            });

            // Create user for authenticated routes
            service
                .createUser({
                    username: "concurrentuser",
                    permissions: [
                        "read",
                        "write",
                        "delete",
                    ],
                })
                .then(() => {
                    // Process multiple concurrent requests
                    const requests = [
                        service.processRequest("GET", "/api/sites"),
                        service.processRequest("GET", "/api/monitors"),
                        service.processRequest("POST", "/api/sites", {
                            body: {
                                name: "New Site",
                                url: "https://example.com",
                            },
                            headers: { Authorization: "Bearer valid-token" },
                        }),
                        service.processRequest("DELETE", "/api/sites", {
                            headers: { Authorization: "Bearer valid-token" },
                        }),
                    ];

                    Promise.all(requests);
                });
        },
        { warmupIterations: 10, iterations: 400 }
    );

    bench(
        "error handling",
        () => {
            service = new MockApiService();

            // Register route that throws error
            service.registerRoute("GET", "/api/error", async () => {
                throw new Error("Simulated error");
            });

            // Register route that doesn't exist
            const validRequest = service.processRequest("GET", "/api/error");
            const notFoundRequest = service.processRequest(
                "GET",
                "/api/nonexistent"
            );

            Promise.all([validRequest, notFoundRequest]);
        },
        { warmupIterations: 10, iterations: 1500 }
    );

    bench(
        "metrics collection",
        () => {
            service = new MockApiService();

            service.registerRoute("GET", "/api/metrics-test", async () => ({
                data: "test",
            }));

            // Process multiple requests
            const requests = Array.from({ length: 10 }, () =>
                service.processRequest("GET", "/api/metrics-test")
            );

            Promise.all(requests).then(() => {
                service.getMetrics();
            });
        },
        { warmupIterations: 10, iterations: 800 }
    );

    bench(
        "route information retrieval",
        () => {
            service = new MockApiService();

            const routes = createTestRoutes();
            routes.forEach((route) => {
                service.registerRoute(
                    route.method,
                    route.path,
                    route.handler,
                    route.options
                );
            });

            service.getRoutes();
        },
        { warmupIterations: 10, iterations: 2000 }
    );

    bench(
        "service reset",
        () => {
            service = new MockApiService();

            // Create full setup
            const middleware = createTestMiddleware();
            middleware.forEach((mw) => service.registerMiddleware(mw));

            const routes = createTestRoutes();
            routes.forEach((route) => {
                service.registerRoute(
                    route.method,
                    route.path,
                    route.handler,
                    route.options
                );
            });

            service.createUser({ username: "testuser" }).then(() => {
                service
                    .createApiKey({ name: "Test Key", userId: "user-1" })
                    .then(() => {
                        service.reset();
                    });
            });
        },
        { warmupIterations: 10, iterations: 800 }
    );
});
