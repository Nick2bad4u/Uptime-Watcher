/**
 * Event Middleware Performance Benchmarks
 *
 * @file Performance benchmarks for event middleware and interceptors.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Event-EventMiddleware
 * @tags ["performance", "events", "middleware", "interceptors"]
 */

import { bench, describe } from "vitest";

interface EventContext {
    id: string;
    type: string;
    payload: any;
    timestamp: number;
    correlationId: string;
    metadata: Record<string, any>;
}

type MiddlewareFunction = (context: EventContext, next: () => Promise<void>) => Promise<void>;

class MockEventMiddleware {
    private middlewares: MiddlewareFunction[] = [];
    private interceptors: Map<string, Function[]> = new Map();
    private metrics = {
        processed: 0,
        intercepted: 0,
        errors: 0,
        averageTime: 0
    };

    use(middleware: MiddlewareFunction): void {
        this.middlewares.push(middleware);
    }

    addInterceptor(eventType: string, interceptor: Function): void {
        if (!this.interceptors.has(eventType)) {
            this.interceptors.set(eventType, []);
        }
        this.interceptors.get(eventType)!.push(interceptor);
    }

    async execute(context: EventContext): Promise<void> {
        const startTime = Date.now();
        
        try {
            // Apply interceptors first
            await this.applyInterceptors(context);
            
            // Execute middleware chain
            await this.executeMiddlewareChain(context, 0);
            
            this.metrics.processed++;
        } catch (error) {
            this.metrics.errors++;
            throw error;
        } finally {
            const executionTime = Date.now() - startTime;
            this.updateAverageTime(executionTime);
        }
    }

    private async applyInterceptors(context: EventContext): Promise<void> {
        const interceptors = this.interceptors.get(context.type);
        if (interceptors) {
            for (const interceptor of interceptors) {
                await interceptor(context);
                this.metrics.intercepted++;
            }
        }
    }

    private async executeMiddlewareChain(context: EventContext, index: number): Promise<void> {
        if (index >= this.middlewares.length) {
            return;
        }

        const middleware = this.middlewares[index];
        await middleware(context, () => this.executeMiddlewareChain(context, index + 1));
    }

    private updateAverageTime(newTime: number): void {
        const total = this.metrics.processed + this.metrics.errors;
        this.metrics.averageTime = 
            (this.metrics.averageTime * (total - 1) + newTime) / total;
    }

    // Common middleware implementations
    createLoggingMiddleware(): MiddlewareFunction {
        return async (context: EventContext, next: () => Promise<void>) => {
            console.log(`Processing event: ${context.type} at ${new Date(context.timestamp).toISOString()}`);
            await next();
            console.log(`Completed event: ${context.type}`);
        };
    }

    createValidationMiddleware(): MiddlewareFunction {
        return async (context: EventContext, next: () => Promise<void>) => {
            if (!context.payload) {
                throw new Error('Event payload is required');
            }
            if (!context.correlationId) {
                context.correlationId = `auto-${Date.now()}`;
            }
            await next();
        };
    }

    createEnrichmentMiddleware(): MiddlewareFunction {
        return async (context: EventContext, next: () => Promise<void>) => {
            context.metadata = {
                ...context.metadata,
                processedAt: Date.now(),
                version: '1.0.0',
                source: 'uptime-watcher'
            };
            await next();
        };
    }

    createAuthorizationMiddleware(): MiddlewareFunction {
        return async (context: EventContext, next: () => Promise<void>) => {
            // Simulate authorization check
            const isAuthorized = context.metadata?.userId || context.type.startsWith('public.');
            if (!isAuthorized) {
                throw new Error('Unauthorized event access');
            }
            await next();
        };
    }

    createRateLimitingMiddleware(maxEventsPerSecond: number): MiddlewareFunction {
        const eventCounts = new Map<string, { count: number; resetTime: number }>();
        
        return async (context: EventContext, next: () => Promise<void>) => {
            const key = context.correlationId || 'default';
            const now = Date.now();
            const resetTime = Math.floor(now / 1000) * 1000; // Round to second
            
            let record = eventCounts.get(key);
            if (!record || record.resetTime < resetTime) {
                record = { count: 0, resetTime };
                eventCounts.set(key, record);
            }
            
            if (record.count >= maxEventsPerSecond) {
                throw new Error('Rate limit exceeded');
            }
            
            record.count++;
            await next();
        };
    }

    createRetryMiddleware(maxRetries: number = 3): MiddlewareFunction {
        return async (context: EventContext, next: () => Promise<void>) => {
            let attempts = 0;
            let lastError: Error | null = null;
            
            while (attempts < maxRetries) {
                try {
                    await next();
                    return;
                } catch (error) {
                    lastError = error as Error;
                    attempts++;
                    if (attempts < maxRetries) {
                        // Exponential backoff
                        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
                    }
                }
            }
            
            throw lastError;
        };
    }

    getMetrics(): any {
        return { ...this.metrics };
    }

    reset(): void {
        this.middlewares = [];
        this.interceptors.clear();
        this.metrics = {
            processed: 0,
            intercepted: 0,
            errors: 0,
            averageTime: 0
        };
    }
}

describe("Event Middleware Performance", () => {
    let middleware: MockEventMiddleware;

    bench("middleware initialization", () => {
        middleware = new MockEventMiddleware();
    }, { warmupIterations: 10, iterations: 1000 });

    bench("add single middleware", () => {
        middleware = new MockEventMiddleware();
        middleware.use(async (context, next) => await next());
    }, { warmupIterations: 10, iterations: 5000 });

    bench("add multiple middlewares", () => {
        middleware = new MockEventMiddleware();
        middleware.use(middleware.createLoggingMiddleware());
        middleware.use(middleware.createValidationMiddleware());
        middleware.use(middleware.createEnrichmentMiddleware());
    }, { warmupIterations: 10, iterations: 2000 });

    bench("execute simple middleware chain", async () => {
        middleware = new MockEventMiddleware();
        middleware.use(async (context, next) => {
            context.metadata.processed = true;
            await next();
        });
        
        const context: EventContext = {
            id: 'test-1',
            type: 'test.event',
            payload: { data: 'test' },
            timestamp: Date.now(),
            correlationId: 'corr-1',
            metadata: {}
        };
        
        await middleware.execute(context);
    }, { warmupIterations: 5, iterations: 1000 });

    bench("execute logging middleware", async () => {
        middleware = new MockEventMiddleware();
        middleware.use(middleware.createLoggingMiddleware());
        
        const context: EventContext = {
            id: 'test-2',
            type: 'test.logging',
            payload: { message: 'test log' },
            timestamp: Date.now(),
            correlationId: 'corr-2',
            metadata: {}
        };
        
        await middleware.execute(context);
    }, { warmupIterations: 5, iterations: 500 });

    bench("execute validation middleware", async () => {
        middleware = new MockEventMiddleware();
        middleware.use(middleware.createValidationMiddleware());
        
        const context: EventContext = {
            id: 'test-3',
            type: 'test.validation',
            payload: { data: 'valid' },
            timestamp: Date.now(),
            correlationId: 'corr-3',
            metadata: {}
        };
        
        await middleware.execute(context);
    }, { warmupIterations: 5, iterations: 1000 });

    bench("execute enrichment middleware", async () => {
        middleware = new MockEventMiddleware();
        middleware.use(middleware.createEnrichmentMiddleware());
        
        const context: EventContext = {
            id: 'test-4',
            type: 'test.enrichment',
            payload: { data: 'enrich' },
            timestamp: Date.now(),
            correlationId: 'corr-4',
            metadata: {}
        };
        
        await middleware.execute(context);
    }, { warmupIterations: 5, iterations: 1000 });

    bench("execute authorization middleware", async () => {
        middleware = new MockEventMiddleware();
        middleware.use(middleware.createAuthorizationMiddleware());
        
        const context: EventContext = {
            id: 'test-5',
            type: 'public.test.auth',
            payload: { data: 'auth' },
            timestamp: Date.now(),
            correlationId: 'corr-5',
            metadata: { userId: 'user-1' }
        };
        
        await middleware.execute(context);
    }, { warmupIterations: 5, iterations: 1000 });

    bench("execute rate limiting middleware", async () => {
        middleware = new MockEventMiddleware();
        middleware.use(middleware.createRateLimitingMiddleware(100));
        
        const context: EventContext = {
            id: 'test-6',
            type: 'test.ratelimit',
            payload: { data: 'rate' },
            timestamp: Date.now(),
            correlationId: 'rate-corr-1',
            metadata: {}
        };
        
        await middleware.execute(context);
    }, { warmupIterations: 5, iterations: 500 });

    bench("execute complete middleware chain", async () => {
        middleware = new MockEventMiddleware();
        middleware.use(middleware.createValidationMiddleware());
        middleware.use(middleware.createAuthorizationMiddleware());
        middleware.use(middleware.createEnrichmentMiddleware());
        middleware.use(middleware.createRateLimitingMiddleware(50));
        
        const context: EventContext = {
            id: 'test-7',
            type: 'public.test.complete',
            payload: { data: 'complete' },
            timestamp: Date.now(),
            correlationId: 'complete-corr-1',
            metadata: { userId: 'user-1' }
        };
        
        await middleware.execute(context);
    }, { warmupIterations: 5, iterations: 200 });

    bench("execute with interceptors", async () => {
        middleware = new MockEventMiddleware();
        middleware.addInterceptor('test.intercepted', async (context) => {
            context.metadata.intercepted = true;
        });
        middleware.use(middleware.createEnrichmentMiddleware());
        
        const context: EventContext = {
            id: 'test-8',
            type: 'test.intercepted',
            payload: { data: 'intercept' },
            timestamp: Date.now(),
            correlationId: 'intercept-corr-1',
            metadata: {}
        };
        
        await middleware.execute(context);
    }, { warmupIterations: 5, iterations: 500 });

    bench("batch event processing", async () => {
        middleware = new MockEventMiddleware();
        middleware.use(middleware.createValidationMiddleware());
        middleware.use(middleware.createEnrichmentMiddleware());
        
        const contexts: EventContext[] = Array.from({ length: 20 }, (_, i) => ({
            id: `batch-${i}`,
            type: 'batch.event',
            payload: { index: i },
            timestamp: Date.now(),
            correlationId: `batch-corr-${i}`,
            metadata: {}
        }));
        
        for (const context of contexts) {
            await middleware.execute(context);
        }
    }, { warmupIterations: 5, iterations: 50 });
});
