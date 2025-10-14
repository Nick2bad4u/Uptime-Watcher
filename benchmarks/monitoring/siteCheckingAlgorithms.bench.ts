/**
 * Performance benchmarks for Site Checking Algorithms Tests the performance of
 * various website monitoring and health check strategies
 */

import { bench, describe } from "vitest";

// Interface definitions for Site Checking
interface SiteCheckRequest {
    id: string;
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: string;
    timeout: number;
    retryCount: number;
    expectedStatus?: number[];
    expectedContent?: string[];
    checkType: CheckType;
    priority: Priority;
    metadata: CheckMetadata;
}

interface CheckMetadata {
    siteIdentifier: string;
    siteName: string;
    tags: string[];
    category: string;
    lastCheck?: number;
    averageResponseTime: number;
    successRate: number;
    alertThresholds: AlertThresholds;
}

interface AlertThresholds {
    responseTime: number;
    downtime: number;
    errorRate: number;
    consecutiveFailures: number;
}

interface SiteCheckResult {
    requestId: string;
    url: string;
    startTime: number;
    endTime: number;
    responseTime: number;
    status: CheckStatus;
    httpStatus?: number;
    headers?: Record<string, string>;
    body?: string;
    contentLength?: number;
    error?: CheckError;
    metrics: CheckMetrics;
    certificates?: CertificateInfo[];
    redirectChain?: RedirectInfo[];
}

interface CheckError {
    type: ErrorType;
    message: string;
    code?: string;
    details?: Record<string, any>;
    recoverable: boolean;
}

interface CheckMetrics {
    dnsLookupTime: number;
    connectionTime: number;
    tlsHandshakeTime: number;
    timeToFirstByte: number;
    contentDownloadTime: number;
    totalRequestTime: number;
    retryAttempts: number;
    bytesReceived: number;
    compression?: CompressionInfo;
}

interface CompressionInfo {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    encoding: string;
}

interface CertificateInfo {
    subject: string;
    issuer: string;
    validFrom: Date;
    validTo: Date;
    daysUntilExpiry: number;
    fingerprint: string;
    algorithm: string;
    keySize: number;
    isValid: boolean;
    chain: CertificateInfo[];
}

interface RedirectInfo {
    from: string;
    to: string;
    status: number;
    permanent: boolean;
    responseTime: number;
}

interface CheckerPerformanceMetrics {
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
    averageResponseTime: number;
    averageCheckDuration: number;
    checksPerSecond: number;
    memoryUsage: number;
    cpuUsage: number;
    networkUtilization: number;
    errorDistribution: Record<ErrorType, number>;
}

interface BatchCheckConfig {
    maxConcurrent: number;
    batchSize: number;
    delayBetweenBatches: number;
    timeoutPerCheck: number;
    retryStrategy: RetryStrategy;
    circuitBreaker?: CircuitBreakerConfig;
}

interface RetryStrategy {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitterFactor: number;
}

interface CircuitBreakerConfig {
    failureThreshold: number;
    recoveryTimeout: number;
    halfOpenMaxCalls: number;
    successThreshold: number;
}

type HttpMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "HEAD"
    | "OPTIONS"
    | "PATCH";
type CheckType =
    | "http"
    | "https"
    | "ping"
    | "tcp"
    | "ssl"
    | "dns"
    | "content"
    | "performance";
type Priority = "low" | "normal" | "high" | "critical";
type CheckStatus = "success" | "failure" | "timeout" | "error" | "warning";
type ErrorType =
    | "network"
    | "timeout"
    | "dns"
    | "ssl"
    | "http"
    | "content"
    | "redirect"
    | "certificate";

// Mock Site Checker Implementation
class MockSiteChecker {
    private checkers = new Map<string, SiteCheckerInstance>();
    private networkSimulator = new NetworkSimulator();
    private dnsResolver = new MockDNSResolver();
    private sslValidator = new MockSSLValidator();
    private contentValidator = new MockContentValidator();
    private circuitBreakers = new Map<string, CircuitBreaker>();
    private rateLimiter = new RateLimiter();
    private performanceMonitor = new PerformanceMonitor();

    // Create checker instance
    createChecker(
        checkerId: string,
        config: BatchCheckConfig
    ): SiteCheckerInstance {
        const checker: SiteCheckerInstance = {
            id: checkerId,
            config,
            activeChecks: new Map(),
            checkQueue: [],
            metrics: this.initializeMetrics(),
            state: "idle",
            lastActivity: Date.now(),
        };

        this.checkers.set(checkerId, checker);
        return checker;
    }

    // Single site check
    async checkSite(
        checkerId: string,
        request: SiteCheckRequest
    ): Promise<SiteCheckResult> {
        const startTime = performance.now();
        const checker = this.getChecker(checkerId);

        // Apply rate limiting
        await this.rateLimiter.waitForSlot(request.priority);

        // Check circuit breaker
        const circuitBreaker = this.getCircuitBreaker(request.url);
        if (circuitBreaker.isOpen()) {
            return this.createErrorResult(
                request,
                "circuit_breaker_open",
                startTime
            );
        }

        try {
            // Perform the actual check
            const result = await this.performSiteCheck(request, startTime);

            // Update circuit breaker
            if (result.status === "success") {
                circuitBreaker.recordSuccess();
            } else {
                circuitBreaker.recordFailure();
            }

            // Update checker metrics
            this.updateCheckerMetrics(checker, result);

            return result;
        } catch (error) {
            circuitBreaker.recordFailure();
            return this.createErrorResult(
                request,
                "unexpected_error",
                startTime,
                error as Error
            );
        }
    }

    // Batch site checking
    async checkSitesBatch(
        checkerId: string,
        requests: SiteCheckRequest[]
    ): Promise<SiteCheckResult[]> {
        const checker = this.getChecker(checkerId);
        const config = checker.config;
        const results: SiteCheckResult[] = [];

        // Process in batches
        for (let i = 0; i < requests.length; i += config.batchSize) {
            const batch = requests.slice(i, i + config.batchSize);

            // Process batch with concurrency control
            const batchPromises = batch.map(async (request, index) => {
                // Respect concurrency limit
                while (checker.activeChecks.size >= config.maxConcurrent) {
                    await this.delay(10);
                }

                const checkId = `${request.id}-${Date.now()}-${index}`;
                checker.activeChecks.set(checkId, request);

                try {
                    const result = await this.checkSite(checkerId, request);
                    return result;
                } finally {
                    checker.activeChecks.delete(checkId);
                }
            });

            const batchResults = await Promise.allSettled(batchPromises);

            // Process results
            batchResults.forEach((promiseResult, index) => {
                if (promiseResult.status === "fulfilled") {
                    results.push(promiseResult.value);
                } else {
                    // Create error result for failed promises
                    const request = batch[index];
                    results.push(
                        this.createErrorResult(
                            request,
                            "batch_processing_error",
                            performance.now(),
                            promiseResult.reason
                        )
                    );
                }
            });

            // Delay between batches
            if (
                i + config.batchSize < requests.length &&
                config.delayBetweenBatches > 0
            ) {
                await this.delay(config.delayBetweenBatches);
            }
        }

        return results;
    }

    // Advanced checking with retries and circuit breaking
    async checkSiteWithRetries(
        checkerId: string,
        request: SiteCheckRequest
    ): Promise<SiteCheckResult> {
        const checker = this.getChecker(checkerId);
        const retryStrategy = checker.config.retryStrategy;
        let lastResult: SiteCheckResult | null = null;
        let attempt = 0;

        while (attempt <= retryStrategy.maxRetries) {
            try {
                const result = await this.checkSite(checkerId, request);

                if (
                    result.status === "success" ||
                    !this.shouldRetry(result, attempt)
                ) {
                    return result;
                }

                lastResult = result;
                attempt++;

                if (attempt <= retryStrategy.maxRetries) {
                    const delay = this.calculateRetryDelay(
                        retryStrategy,
                        attempt
                    );
                    await this.delay(delay);
                }
            } catch (error) {
                attempt++;
                if (attempt > retryStrategy.maxRetries) {
                    return this.createErrorResult(
                        request,
                        "max_retries_exceeded",
                        performance.now(),
                        error as Error
                    );
                }
            }
        }

        return (
            lastResult ||
            this.createErrorResult(
                request,
                "retry_exhausted",
                performance.now()
            )
        );
    }

    // Continuous monitoring
    async startContinuousMonitoring(
        checkerId: string,
        requests: SiteCheckRequest[],
        intervalMs: number,
        maxDuration: number
    ): Promise<SiteCheckResult[]> {
        const checker = this.getChecker(checkerId);
        const results: SiteCheckResult[] = [];
        const startTime = Date.now();

        checker.state = "monitoring";

        while (
            Date.now() - startTime < maxDuration &&
            checker.state === "monitoring"
        ) {
            const cycleStart = performance.now();

            // Check all sites in this cycle
            const cycleResults = await this.checkSitesBatch(
                checkerId,
                requests
            );
            results.push(...cycleResults);

            // Calculate time taken for this cycle
            const cycleDuration = performance.now() - cycleStart;

            // Wait for next interval (if needed)
            const remainingTime = intervalMs - cycleDuration;
            if (remainingTime > 0) {
                await this.delay(remainingTime);
            }

            // Update monitoring metrics
            this.updateMonitoringMetrics(checker, cycleDuration, cycleResults);
        }

        checker.state = "idle";
        return results;
    }

    // Performance optimized checking
    async checkSitesOptimized(
        checkerId: string,
        requests: SiteCheckRequest[]
    ): Promise<SiteCheckResult[]> {
        const checker = this.getChecker(checkerId);

        // Group requests by domain for connection reuse
        const groupedRequests = this.groupRequestsByDomain(requests);
        const results: SiteCheckResult[] = [];

        // Process each domain group
        for (const [domain, domainRequests] of groupedRequests.entries()) {
            // Simulate connection pooling benefits
            const connectionSetupTime =
                this.networkSimulator.simulateConnectionSetup(domain);

            // Process requests for this domain with shared connection
            const domainPromises = domainRequests.map(async (request) => {
                const optimizedRequest = {
                    ...request,
                    // Reduced timeout due to connection reuse
                    timeout: Math.max(request.timeout * 0.7, 1000),
                };

                const result = await this.performSiteCheck(
                    optimizedRequest,
                    performance.now()
                );

                // Apply connection reuse benefits
                result.metrics.connectionTime *= 0.2; // Reused connection
                result.metrics.dnsLookupTime *= 0.1; // Cached DNS

                return result;
            });

            const domainResults = await Promise.allSettled(domainPromises);

            domainResults.forEach((promiseResult) => {
                if (promiseResult.status === "fulfilled") {
                    results.push(promiseResult.value);
                }
            });
        }

        return results;
    }

    // Core site checking implementation
    private async performSiteCheck(
        request: SiteCheckRequest,
        startTime: number
    ): Promise<SiteCheckResult> {
        const metrics: CheckMetrics = {
            dnsLookupTime: 0,
            connectionTime: 0,
            tlsHandshakeTime: 0,
            timeToFirstByte: 0,
            contentDownloadTime: 0,
            totalRequestTime: 0,
            retryAttempts: 0,
            bytesReceived: 0,
        };

        // DNS Resolution
        const dnsStart = performance.now();
        const ipAddress = await this.dnsResolver.resolve(request.url);
        metrics.dnsLookupTime = performance.now() - dnsStart;

        // Connection establishment
        const connStart = performance.now();
        await this.networkSimulator.establishConnection(
            ipAddress,
            request.timeout
        );
        metrics.connectionTime = performance.now() - connStart;

        // TLS handshake (for HTTPS)
        if (request.url.startsWith("https://")) {
            const tlsStart = performance.now();
            await this.networkSimulator.performTLSHandshake(ipAddress);
            metrics.tlsHandshakeTime = performance.now() - tlsStart;
        }

        // HTTP request/response
        const requestStart = performance.now();
        const response =
            await this.networkSimulator.performHttpRequest(request);
        metrics.timeToFirstByte = performance.now() - requestStart;

        // Content download
        const downloadStart = performance.now();
        const content = await this.networkSimulator.downloadContent(
            response.contentLength || 0
        );
        metrics.contentDownloadTime = performance.now() - downloadStart;
        metrics.bytesReceived = response.contentLength || 0;

        // Calculate total time
        metrics.totalRequestTime = performance.now() - startTime;

        // Validate response
        const validationResult = await this.validateResponse(
            request,
            response,
            content
        );

        // Check SSL certificate (for HTTPS)
        let certificates: CertificateInfo[] | undefined;
        if (request.url.startsWith("https://")) {
            certificates = await this.sslValidator.validateCertificates(
                request.url
            );
        }

        // Build result
        const result: SiteCheckResult = {
            requestId: request.id,
            url: request.url,
            startTime,
            endTime: performance.now(),
            responseTime: metrics.totalRequestTime,
            status: validationResult.isValid ? "success" : "failure",
            httpStatus: response.status,
            headers: response.headers,
            body: content.slice(0, 1000), // Limit body size
            contentLength: response.contentLength,
            metrics,
            certificates,
            redirectChain: response.redirectChain,
        };

        if (!validationResult.isValid) {
            result.error = {
                type: (validationResult.errorType as ErrorType) || "http",
                message: validationResult.errorMessage || "Validation failed",
                recoverable: validationResult.recoverable || false,
            };
        }

        return result;
    }

    // Validation methods
    private async validateResponse(
        request: SiteCheckRequest,
        response: any,
        content: string
    ): Promise<{
        isValid: boolean;
        errorType?: ErrorType;
        errorMessage?: string;
        recoverable?: boolean;
    }> {
        // Status code validation
        if (
            request.expectedStatus &&
            !request.expectedStatus.includes(response.status)
        ) {
            return {
                isValid: false,
                errorType: "http",
                errorMessage: `Expected status ${request.expectedStatus}, got ${response.status}`,
                recoverable: response.status >= 500 && response.status < 600,
            };
        }

        // Content validation
        if (request.expectedContent) {
            const contentValid = request.expectedContent.some((expected) =>
                content.toLowerCase().includes(expected.toLowerCase())
            );

            if (!contentValid) {
                return {
                    isValid: false,
                    errorType: "content",
                    errorMessage: "Expected content not found",
                    recoverable: false,
                };
            }
        }

        // Additional validations based on check type
        switch (request.checkType) {
            case "performance": {
                if (
                    response.responseTime >
                    request.metadata.alertThresholds.responseTime
                ) {
                    return {
                        isValid: false,
                        errorType: "http",
                        errorMessage: `Response time ${response.responseTime}ms exceeds threshold`,
                        recoverable: true,
                    };
                }
                break;
            }

            case "ssl": {
                // SSL-specific validations would go here
                break;
            }
        }

        return { isValid: true };
    }

    // Helper methods
    private shouldRetry(result: SiteCheckResult, attempt: number): boolean {
        if (result.status === "success") return false;
        if (!result.error?.recoverable) return false;

        // Don't retry certain error types
        const nonRetryableErrors: ErrorType[] = ["content", "certificate"];
        if (
            result.error.type &&
            nonRetryableErrors.includes(result.error.type)
        ) {
            return false;
        }

        return true;
    }

    private calculateRetryDelay(
        strategy: RetryStrategy,
        attempt: number
    ): number {
        const baseDelay = strategy.baseDelay;
        const backoffDelay =
            baseDelay * strategy.backoffMultiplier ** (attempt - 1);
        const jitter = Math.random() * strategy.jitterFactor * backoffDelay;

        return Math.min(backoffDelay + jitter, strategy.maxDelay);
    }

    private groupRequestsByDomain(
        requests: SiteCheckRequest[]
    ): Map<string, SiteCheckRequest[]> {
        const groups = new Map<string, SiteCheckRequest[]>();

        requests.forEach((request) => {
            const domain = new URL(request.url).hostname;
            const existing = groups.get(domain) || [];
            existing.push(request);
            groups.set(domain, existing);
        });

        return groups;
    }

    private getChecker(checkerId: string): SiteCheckerInstance {
        const checker = this.checkers.get(checkerId);
        if (!checker) {
            throw new Error(`Checker ${checkerId} not found`);
        }
        return checker;
    }

    private getCircuitBreaker(url: string): CircuitBreaker {
        const domain = new URL(url).hostname;
        let breaker = this.circuitBreakers.get(domain);

        if (!breaker) {
            breaker = new CircuitBreaker({
                failureThreshold: 5,
                recoveryTimeout: 30_000,
                halfOpenMaxCalls: 3,
                successThreshold: 2,
            });
            this.circuitBreakers.set(domain, breaker);
        }

        return breaker;
    }

    private createErrorResult(
        request: SiteCheckRequest,
        errorType: string,
        startTime: number,
        error?: Error
    ): SiteCheckResult {
        return {
            requestId: request.id,
            url: request.url,
            startTime,
            endTime: performance.now(),
            responseTime: performance.now() - startTime,
            status: "error",
            error: {
                type: "network",
                message: error?.message || `Check failed: ${errorType}`,
                recoverable: true,
            },
            metrics: {
                dnsLookupTime: 0,
                connectionTime: 0,
                tlsHandshakeTime: 0,
                timeToFirstByte: 0,
                contentDownloadTime: 0,
                totalRequestTime: performance.now() - startTime,
                retryAttempts: 0,
                bytesReceived: 0,
            },
        };
    }

    private updateCheckerMetrics(
        checker: SiteCheckerInstance,
        result: SiteCheckResult
    ): void {
        checker.metrics.totalChecks++;

        if (result.status === "success") {
            checker.metrics.successfulChecks++;
        } else {
            checker.metrics.failedChecks++;
        }

        // Update response time average
        const currentAvg = checker.metrics.averageResponseTime;
        const totalChecks = checker.metrics.totalChecks;
        checker.metrics.averageResponseTime =
            (currentAvg * (totalChecks - 1) + result.responseTime) /
            totalChecks;

        // Update error distribution
        if (result.error?.type) {
            checker.metrics.errorDistribution[result.error.type] =
                (checker.metrics.errorDistribution[result.error.type] || 0) + 1;
        }

        checker.lastActivity = Date.now();
    }

    private updateMonitoringMetrics(
        checker: SiteCheckerInstance,
        cycleDuration: number,
        results: SiteCheckResult[]
    ): void {
        const checksInCycle = results.length;
        checker.metrics.checksPerSecond =
            checksInCycle / (cycleDuration / 1000);

        // Estimate resource usage
        checker.metrics.memoryUsage += checksInCycle * 0.1; // MB per check
        checker.metrics.cpuUsage = Math.min(cycleDuration / 16.67, 100); // Percentage
        checker.metrics.networkUtilization =
            results.reduce(
                (sum, r) => sum + (r.metrics?.bytesReceived || 0),
                0
            ) / 1024; // KB
    }

    private initializeMetrics(): CheckerPerformanceMetrics {
        return {
            totalChecks: 0,
            successfulChecks: 0,
            failedChecks: 0,
            averageResponseTime: 0,
            averageCheckDuration: 0,
            checksPerSecond: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            networkUtilization: 0,
            errorDistribution: {
                network: 0,
                timeout: 0,
                dns: 0,
                ssl: 0,
                http: 0,
                content: 0,
                redirect: 0,
                certificate: 0,
            },
        };
    }

    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Performance analysis
    analyzePerformance(): any {
        const allCheckers = Array.from(this.checkers.values());
        const totalMetrics = allCheckers.reduce(
            (acc, checker) => {
                acc.totalChecks += checker.metrics.totalChecks;
                acc.successfulChecks += checker.metrics.successfulChecks;
                acc.failedChecks += checker.metrics.failedChecks;
                acc.totalResponseTime +=
                    checker.metrics.averageResponseTime *
                    checker.metrics.totalChecks;
                return acc;
            },
            {
                totalChecks: 0,
                successfulChecks: 0,
                failedChecks: 0,
                totalResponseTime: 0,
            }
        );

        return {
            totalCheckers: allCheckers.length,
            aggregatedMetrics: {
                totalChecks: totalMetrics.totalChecks,
                successRate:
                    totalMetrics.totalChecks > 0
                        ? totalMetrics.successfulChecks /
                          totalMetrics.totalChecks
                        : 0,
                averageResponseTime:
                    totalMetrics.totalChecks > 0
                        ? totalMetrics.totalResponseTime /
                          totalMetrics.totalChecks
                        : 0,
            },
            checkerDistribution: allCheckers.map((checker) => ({
                id: checker.id,
                state: checker.state,
                totalChecks: checker.metrics.totalChecks,
                successRate:
                    checker.metrics.totalChecks > 0
                        ? checker.metrics.successfulChecks /
                          checker.metrics.totalChecks
                        : 0,
            })),
        };
    }

    // Cleanup
    reset(): void {
        this.checkers.clear();
        this.circuitBreakers.clear();
    }
}

// Supporting classes (simplified implementations)
interface SiteCheckerInstance {
    id: string;
    config: BatchCheckConfig;
    activeChecks: Map<string, SiteCheckRequest>;
    checkQueue: SiteCheckRequest[];
    metrics: CheckerPerformanceMetrics;
    state: "idle" | "checking" | "monitoring";
    lastActivity: number;
}

class NetworkSimulator {
    async resolve(url: string): Promise<string> {
        await this.delay(10 + Math.random() * 50); // DNS lookup time
        return "192.168.1.100"; // Mock IP
    }

    async establishConnection(ip: string, timeout: number): Promise<void> {
        const connectionTime = 20 + Math.random() * 100;
        if (connectionTime > timeout) {
            throw new Error("Connection timeout");
        }
        await this.delay(connectionTime);
    }

    async performTLSHandshake(ip: string): Promise<void> {
        await this.delay(50 + Math.random() * 150); // TLS handshake time
    }

    async performHttpRequest(request: SiteCheckRequest): Promise<any> {
        const responseTime = 100 + Math.random() * 500;
        await this.delay(responseTime);

        // Simulate various response scenarios
        const scenario = Math.random();

        if (scenario < 0.85) {
            // Success response
            return {
                status: 200,
                headers: {
                    "content-type": "text/html",
                    "content-length": "5000",
                    server: "nginx/1.18.0",
                },
                contentLength: 5000,
                redirectChain: [],
            };
        } else if (scenario < 0.92) {
            // Client error
            return {
                status: 404,
                headers: { "content-type": "text/html" },
                contentLength: 200,
                redirectChain: [],
            };
        } else if (scenario < 0.97) {
            // Server error
            return {
                status: 500,
                headers: { "content-type": "text/html" },
                contentLength: 100,
                redirectChain: [],
            };
        }
        // Timeout
        throw new Error("Request timeout");
    }

    async downloadContent(contentLength: number): Promise<string> {
        const downloadTime = contentLength / 10_000; // Simulate download based on size
        await this.delay(downloadTime);

        return "<!DOCTYPE html><html><head><title>Test Site</title></head><body>".repeat(
            Math.floor(contentLength / 100)
        );
    }

    simulateConnectionSetup(domain: string): number {
        // Simulate connection setup overhead
        return 50 + Math.random() * 100;
    }

    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

class MockDNSResolver {
    async resolve(url: string): Promise<string> {
        const domain = new URL(url).hostname;

        // Simulate DNS lookup time based on domain
        const lookupTime = domain.includes("fast")
            ? 5 + Math.random() * 10
            : domain.includes("slow")
              ? 100 + Math.random() * 200
              : 20 + Math.random() * 80;

        await this.delay(lookupTime);

        // Simulate DNS failure
        if (domain.includes("nonexistent")) {
            throw new Error(`DNS resolution failed for ${domain}`);
        }

        return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }

    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

class MockSSLValidator {
    async validateCertificates(url: string): Promise<CertificateInfo[]> {
        await this.delay(20 + Math.random() * 30);

        const domain = new URL(url).hostname;
        const now = new Date();
        const validFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        const validTo = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

        return [
            {
                subject: `CN=${domain}`,
                issuer: "CN=Let's Encrypt Authority X3",
                validFrom,
                validTo,
                daysUntilExpiry: Math.floor(
                    (validTo.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
                ),
                fingerprint: "SHA256:1234567890abcdef...",
                algorithm: "RSA",
                keySize: 2048,
                isValid: !domain.includes("expired"),
                chain: [],
            },
        ];
    }

    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

class MockContentValidator {
    validate(content: string, expectedContent: string[]): boolean {
        return expectedContent.some((expected) =>
            content.toLowerCase().includes(expected.toLowerCase())
        );
    }
}

class CircuitBreaker {
    private state: "closed" | "open" | "half-open" = "closed";
    private failures = 0;
    private lastFailureTime = 0;
    private successes = 0;

    constructor(private config: CircuitBreakerConfig) {}

    isOpen(): boolean {
        if (this.state === "open") {
            // Check if recovery timeout has passed
            if (
                Date.now() - this.lastFailureTime >
                this.config.recoveryTimeout
            ) {
                this.state = "half-open";
                this.successes = 0;
                return false;
            }
            return true;
        }
        return false;
    }

    recordSuccess(): void {
        this.failures = 0;

        if (this.state === "half-open") {
            this.successes++;
            if (this.successes >= this.config.successThreshold) {
                this.state = "closed";
            }
        }
    }

    recordFailure(): void {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (
            this.state === "closed" &&
            this.failures >= this.config.failureThreshold
        ) {
            this.state = "open";
        } else if (this.state === "half-open") {
            this.state = "open";
            this.successes = 0;
        }
    }
}

class RateLimiter {
    private tokens = new Map<Priority, number>();
    private lastRefill = Date.now();
    private limits: Record<Priority, number> = {
        low: 10,
        normal: 25,
        high: 50,
        critical: 100,
    };

    async waitForSlot(priority: Priority): Promise<void> {
        this.refillTokens();

        const currentTokens =
            this.tokens.get(priority) || this.limits[priority];

        if (currentTokens > 0) {
            this.tokens.set(priority, currentTokens - 1);
            return;
        }

        // Wait and retry
        await this.delay(100);
        await this.waitForSlot(priority);
    }

    private refillTokens(): void {
        const now = Date.now();
        const timePassed = now - this.lastRefill;

        if (timePassed > 1000) {
            // Refill every second
            Object.keys(this.limits).forEach((priority) => {
                this.tokens.set(
                    priority as Priority,
                    this.limits[priority as Priority]
                );
            });
            this.lastRefill = now;
        }
    }

    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

class PerformanceMonitor {
    private metrics = {
        memoryUsage: 0,
        cpuUsage: 0,
        activeConnections: 0,
        requestsPerSecond: 0,
    };

    updateMetrics(newMetrics: Partial<typeof this.metrics>): void {
        Object.assign(this.metrics, newMetrics);
    }

    getMetrics(): typeof this.metrics {
        return { ...this.metrics };
    }
}

describe("Site Checking Algorithms Performance", () => {
    // Basic site checking
    bench("single site checks", () => {
        const checker = new MockSiteChecker();
        const checkerId = "single-checker";

        checker.createChecker(checkerId, {
            maxConcurrent: 10,
            batchSize: 5,
            delayBetweenBatches: 0,
            timeoutPerCheck: 5000,
            retryStrategy: {
                maxRetries: 2,
                baseDelay: 1000,
                maxDelay: 5000,
                backoffMultiplier: 2,
                jitterFactor: 0.1,
            },
        });

        const requests: SiteCheckRequest[] = Array.from(
            { length: 100 },
            (_, index) => ({
                id: `check-${index}`,
                url: `https://example${index % 10}.com/`,
                method: "GET",
                timeout: 3000,
                retryCount: 1,
                expectedStatus: [200],
                checkType: "http",
                priority: "normal",
                metadata: {
                    siteIdentifier: `site-${index}`,
                    siteName: `Site ${index}`,
                    tags: [`tag${index % 5}`],
                    category: "web",
                    averageResponseTime: 500,
                    successRate: 0.95,
                    alertThresholds: {
                        responseTime: 2000,
                        downtime: 30_000,
                        errorRate: 0.1,
                        consecutiveFailures: 3,
                    },
                },
            })
        );

        // Perform individual checks
        const promises = requests.map((request) =>
            checker.checkSite(checkerId, request)
        );

        Promise.allSettled(promises);
        checker.reset();
    });

    bench("batch site checking", () => {
        const checker = new MockSiteChecker();
        const checkerId = "batch-checker";

        checker.createChecker(checkerId, {
            maxConcurrent: 15,
            batchSize: 10,
            delayBetweenBatches: 100,
            timeoutPerCheck: 4000,
            retryStrategy: {
                maxRetries: 3,
                baseDelay: 500,
                maxDelay: 3000,
                backoffMultiplier: 1.5,
                jitterFactor: 0.2,
            },
        });

        const requests: SiteCheckRequest[] = Array.from(
            { length: 200 },
            (_, index) => ({
                id: `batch-check-${index}`,
                url: `https://site${index % 20}.example.com/api/health`,
                method: "GET",
                headers: {
                    "User-Agent": "UptimeWatcher/1.0",
                    Accept: "application/json",
                },
                timeout: 5000,
                retryCount: 2,
                expectedStatus: [200, 201],
                expectedContent: [
                    "ok",
                    "healthy",
                    "status",
                ],
                checkType: "http",
                priority: index % 4 === 0 ? "high" : "normal",
                metadata: {
                    siteIdentifier: `batch-site-${index}`,
                    siteName: `Batch Site ${index}`,
                    tags: [
                        `batch`,
                        `api`,
                        `category${index % 4}`,
                    ],
                    category: "api",
                    averageResponseTime: 300 + Math.random() * 400,
                    successRate: 0.92 + Math.random() * 0.07,
                    alertThresholds: {
                        responseTime: 1500,
                        downtime: 15_000,
                        errorRate: 0.05,
                        consecutiveFailures: 2,
                    },
                },
            })
        );

        checker.checkSitesBatch(checkerId, requests);
        checker.reset();
    });

    // Advanced checking with retries
    bench("site checking with retry logic", () => {
        const checker = new MockSiteChecker();
        const checkerId = "retry-checker";

        checker.createChecker(checkerId, {
            maxConcurrent: 8,
            batchSize: 4,
            delayBetweenBatches: 200,
            timeoutPerCheck: 6000,
            retryStrategy: {
                maxRetries: 5,
                baseDelay: 1000,
                maxDelay: 8000,
                backoffMultiplier: 2,
                jitterFactor: 0.3,
            },
            circuitBreaker: {
                failureThreshold: 5,
                recoveryTimeout: 30_000,
                halfOpenMaxCalls: 3,
                successThreshold: 2,
            },
        });

        const requests: SiteCheckRequest[] = Array.from(
            { length: 80 },
            (_, index) => ({
                id: `retry-check-${index}`,
                url:
                    index % 5 === 0
                        ? `https://unreliable${index}.com/` // Some unreliable sites
                        : `https://reliable${index}.com/`,
                method: "GET",
                timeout: 4000,
                retryCount: 3,
                expectedStatus: [200],
                checkType: "performance",
                priority: index % 3 === 0 ? "high" : "normal",
                metadata: {
                    siteIdentifier: `retry-site-${index}`,
                    siteName: `Retry Site ${index}`,
                    tags: [`retry`, `performance`],
                    category: "monitoring",
                    averageResponseTime: 600,
                    successRate: index % 5 === 0 ? 0.7 : 0.95, // Unreliable sites have lower success rate
                    alertThresholds: {
                        responseTime: 3000,
                        downtime: 60_000,
                        errorRate: 0.15,
                        consecutiveFailures: 4,
                    },
                },
            })
        );

        const promises = requests.map((request) =>
            checker.checkSiteWithRetries(checkerId, request)
        );

        Promise.allSettled(promises);
        checker.reset();
    });

    // Optimized checking with connection reuse
    bench("optimized site checking", () => {
        const checker = new MockSiteChecker();
        const checkerId = "optimized-checker";

        checker.createChecker(checkerId, {
            maxConcurrent: 20,
            batchSize: 15,
            delayBetweenBatches: 50,
            timeoutPerCheck: 3000,
            retryStrategy: {
                maxRetries: 2,
                baseDelay: 500,
                maxDelay: 2000,
                backoffMultiplier: 1.5,
                jitterFactor: 0.1,
            },
        });

        // Create requests grouped by domain for optimization testing
        const domains = [
            "alpha.com",
            "beta.com",
            "gamma.com",
            "delta.com",
            "epsilon.com",
        ];
        const requests: SiteCheckRequest[] = [];

        domains.forEach((domain) => {
            for (let i = 0; i < 30; i++) {
                requests.push({
                    id: `optimized-${domain}-${i}`,
                    url: `https://${domain}/page${i}`,
                    method: "GET",
                    timeout: 2500,
                    retryCount: 1,
                    expectedStatus: [
                        200,
                        301,
                        302,
                    ],
                    checkType: "http",
                    priority: "normal",
                    metadata: {
                        siteIdentifier: `${domain}-${i}`,
                        siteName: `${domain} Page ${i}`,
                        tags: [`optimized`, domain.split(".")[0]],
                        category: "web",
                        averageResponseTime: 200 + Math.random() * 300,
                        successRate: 0.98,
                        alertThresholds: {
                            responseTime: 1000,
                            downtime: 10_000,
                            errorRate: 0.02,
                            consecutiveFailures: 2,
                        },
                    },
                });
            }
        });

        checker.checkSitesOptimized(checkerId, requests);
        checker.reset();
    });

    // Continuous monitoring simulation
    bench("continuous monitoring", () => {
        const checker = new MockSiteChecker();
        const checkerId = "monitoring-checker";

        checker.createChecker(checkerId, {
            maxConcurrent: 12,
            batchSize: 8,
            delayBetweenBatches: 100,
            timeoutPerCheck: 5000,
            retryStrategy: {
                maxRetries: 2,
                baseDelay: 1000,
                maxDelay: 4000,
                backoffMultiplier: 2,
                jitterFactor: 0.2,
            },
        });

        const requests: SiteCheckRequest[] = Array.from(
            { length: 25 },
            (_, index) => ({
                id: `monitor-${index}`,
                url: `https://service${index}.monitor.com/health`,
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "X-Monitor": "UptimeWatcher",
                },
                timeout: 4000,
                retryCount: 1,
                expectedStatus: [200],
                expectedContent: [
                    "healthy",
                    "ok",
                    "running",
                ],
                checkType: "http",
                priority:
                    index < 5 ? "critical" : index < 15 ? "high" : "normal",
                metadata: {
                    siteIdentifier: `monitor-service-${index}`,
                    siteName: `Monitor Service ${index}`,
                    tags: [
                        `monitoring`,
                        `service`,
                        `tier${Math.floor(index / 5)}`,
                    ],
                    category: "service",
                    averageResponseTime: 150 + Math.random() * 200,
                    successRate: 0.995,
                    alertThresholds: {
                        responseTime: 1000,
                        downtime: 5000,
                        errorRate: 0.01,
                        consecutiveFailures: 1,
                    },
                },
            })
        );

        // Simulate 10 seconds of continuous monitoring with 2-second intervals
        checker.startContinuousMonitoring(checkerId, requests, 2000, 10_000);
        checker.reset();
    });

    // SSL certificate checking
    bench("SSL certificate validation", () => {
        const checker = new MockSiteChecker();
        const checkerId = "ssl-checker";

        checker.createChecker(checkerId, {
            maxConcurrent: 10,
            batchSize: 5,
            delayBetweenBatches: 200,
            timeoutPerCheck: 8000,
            retryStrategy: {
                maxRetries: 1,
                baseDelay: 2000,
                maxDelay: 5000,
                backoffMultiplier: 2,
                jitterFactor: 0.1,
            },
        });

        const requests: SiteCheckRequest[] = Array.from(
            { length: 50 },
            (_, index) => ({
                id: `ssl-check-${index}`,
                url: `https://secure${index}.example.org/`,
                method: "HEAD", // Faster for SSL checks
                timeout: 6000,
                retryCount: 1,
                expectedStatus: [
                    200,
                    301,
                    302,
                ],
                checkType: "ssl",
                priority: "normal",
                metadata: {
                    siteIdentifier: `ssl-site-${index}`,
                    siteName: `SSL Site ${index}`,
                    tags: [
                        `ssl`,
                        `security`,
                        `certificate`,
                    ],
                    category: "security",
                    averageResponseTime: 800,
                    successRate: 0.99,
                    alertThresholds: {
                        responseTime: 5000,
                        downtime: 30_000,
                        errorRate: 0.02,
                        consecutiveFailures: 2,
                    },
                },
            })
        );

        const promises = requests.map((request) =>
            checker.checkSite(checkerId, request)
        );

        Promise.allSettled(promises);
        checker.reset();
    });

    // Mixed priority checking
    bench("mixed priority site checking", () => {
        const checker = new MockSiteChecker();
        const checkerId = "priority-checker";

        checker.createChecker(checkerId, {
            maxConcurrent: 25,
            batchSize: 20,
            delayBetweenBatches: 50,
            timeoutPerCheck: 4000,
            retryStrategy: {
                maxRetries: 3,
                baseDelay: 800,
                maxDelay: 6000,
                backoffMultiplier: 1.8,
                jitterFactor: 0.25,
            },
        });

        const priorities: Priority[] = [
            "critical",
            "high",
            "normal",
            "low",
        ];
        const requests: SiteCheckRequest[] = Array.from(
            { length: 120 },
            (_, index) => {
                const priority = priorities[index % priorities.length];
                const timeoutMultiplier =
                    priority === "critical"
                        ? 1.5
                        : priority === "high"
                          ? 1.2
                          : priority === "normal"
                            ? 1
                            : 0.8;

                return {
                    id: `priority-${priority}-${index}`,
                    url: `https://${priority}-site${index}.com/api/status`,
                    method: "GET",
                    headers: {
                        Priority: priority,
                        "X-Check-Type": "uptime",
                    },
                    timeout: Math.floor(3000 * timeoutMultiplier),
                    retryCount:
                        priority === "critical"
                            ? 3
                            : priority === "high"
                              ? 2
                              : 1,
                    expectedStatus: [200],
                    checkType: "performance",
                    priority,
                    metadata: {
                        siteIdentifier: `${priority}-${index}`,
                        siteName: `${priority.charAt(0).toUpperCase() + priority.slice(1)} Site ${index}`,
                        tags: [
                            priority,
                            "api",
                            "status",
                        ],
                        category: "service",
                        averageResponseTime: 400,
                        successRate:
                            priority === "critical"
                                ? 0.999
                                : priority === "high"
                                  ? 0.995
                                  : priority === "normal"
                                    ? 0.99
                                    : 0.95,
                        alertThresholds: {
                            responseTime:
                                priority === "critical"
                                    ? 500
                                    : priority === "high"
                                      ? 1000
                                      : priority === "normal"
                                        ? 2000
                                        : 3000,
                            downtime:
                                priority === "critical"
                                    ? 5000
                                    : priority === "high"
                                      ? 15_000
                                      : priority === "normal"
                                        ? 30_000
                                        : 60_000,
                            errorRate:
                                priority === "critical"
                                    ? 0.001
                                    : priority === "high"
                                      ? 0.005
                                      : priority === "normal"
                                        ? 0.01
                                        : 0.05,
                            consecutiveFailures:
                                priority === "critical"
                                    ? 1
                                    : priority === "high"
                                      ? 2
                                      : priority === "normal"
                                        ? 3
                                        : 5,
                        },
                    },
                };
            }
        );

        checker.checkSitesBatch(checkerId, requests);
        checker.reset();
    });

    // Performance analysis benchmark
    bench("site checking performance analysis", () => {
        const checker = new MockSiteChecker();
        const checkerIds = [
            "analyzer-1",
            "analyzer-2",
            "analyzer-3",
        ];

        // Create multiple checkers with different configurations
        checkerIds.forEach((id, index) => {
            checker.createChecker(id, {
                maxConcurrent: 10 + index * 5,
                batchSize: 5 + index * 3,
                delayBetweenBatches: 100 - index * 25,
                timeoutPerCheck: 3000 + index * 1000,
                retryStrategy: {
                    maxRetries: 2 + index,
                    baseDelay: 500 + index * 250,
                    maxDelay: 3000 + index * 1000,
                    backoffMultiplier: 1.5 + index * 0.2,
                    jitterFactor: 0.1 + index * 0.05,
                },
            });
        });

        // Perform checks with each checker
        const allResults: Promise<any>[] = [];

        checkerIds.forEach((checkerId, checkerIndex) => {
            const requests: SiteCheckRequest[] = Array.from(
                { length: 40 },
                (_, index) => ({
                    id: `analysis-${checkerId}-${index}`,
                    url: `https://analysis${index}.benchmark.com/`,
                    method: "GET",
                    timeout: 3000,
                    retryCount: 2,
                    expectedStatus: [200],
                    checkType: "performance",
                    priority: "normal",
                    metadata: {
                        siteIdentifier: `analysis-${checkerId}-${index}`,
                        siteName: `Analysis Site ${index}`,
                        tags: [
                            `analysis`,
                            `benchmark`,
                            `checker-${checkerIndex}`,
                        ],
                        category: "benchmark",
                        averageResponseTime: 300 + checkerIndex * 100,
                        successRate: 0.95 + checkerIndex * 0.01,
                        alertThresholds: {
                            responseTime: 2000,
                            downtime: 20_000,
                            errorRate: 0.05,
                            consecutiveFailures: 3,
                        },
                    },
                })
            );

            allResults.push(checker.checkSitesBatch(checkerId, requests));
        });

        Promise.allSettled(allResults);

        // Analyze performance across all checkers
        const analysis = checker.analyzePerformance();

        checker.reset();
    });
});
