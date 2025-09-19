/\*\*

- Enhanced Circuit Breaker Implementation Plan
-
- This document outlines the implementation of a circuit breaker pattern
- for the monitoring services, though it provides minimal value given
- the existing robust failure handling infrastructure.
  \*/

# Circuit Breaker Implementation Plan

## 🚨 Recommendation: DON'T IMPLEMENT

**After analyzing the existing code, implementing a circuit breaker would add unnecessary complexity with minimal benefit because:**

1. ✅ **SimpleRateLimiter** already prevents host flooding
2. ✅ **withOperationalHooks** provides comprehensive retry logic
3. ✅ **Local monitoring context** - user controls all targets
4. ✅ **Existing graceful degradation** when monitors fail

## 🛠️ Implementation Plan (If Overriding Recommendation)

### Phase 1: Circuit Breaker Core (2-3 hours)

**File**: `electron/services/monitoring/utils/CircuitBreaker.ts`

```typescript
export enum CircuitState {
 CLOSED = "CLOSED", // Normal operation
 OPEN = "OPEN", // Failing - reject requests
 HALF_OPEN = "HALF_OPEN", // Testing - allow limited requests
}

export interface CircuitBreakerConfig {
 failureThreshold: number; // Failures before opening (default: 5)
 successThreshold: number; // Successes to close from half-open (default: 2)
 timeout: number; // Time before half-open retry (default: 60s)
 monitorWindow: number; // Time window for failure counting (default: 60s)
}

export class CircuitBreaker {
 private state: CircuitState = CircuitState.CLOSED;
 private failures: Array<{ timestamp: number; error: Error }> = [];
 private successes: number = 0;
 private lastFailureTime: number = 0;

 constructor(
  private readonly hostId: string,
  private readonly config: CircuitBreakerConfig = DEFAULT_CONFIG
 ) {}

 async execute<T>(operation: () => Promise<T>): Promise<T> {
  if (this.shouldRejectRequest()) {
   throw new CircuitBreakerOpenError(`Circuit breaker OPEN for ${this.hostId}`);
  }

  try {
   const result = await operation();
   this.onSuccess();
   return result;
  } catch (error) {
   this.onFailure(error as Error);
   throw error;
  }
 }

 private shouldRejectRequest(): boolean {
  this.cleanOldFailures();

  switch (this.state) {
   case CircuitState.OPEN:
    return !this.shouldAttemptReset();
   case CircuitState.HALF_OPEN:
    return false; // Allow request to test
   case CircuitState.CLOSED:
   default:
    return false;
  }
 }

 private onSuccess(): void {
  this.failures = [];

  if (this.state === CircuitState.HALF_OPEN) {
   this.successes++;
   if (this.successes >= this.config.successThreshold) {
    this.state = CircuitState.CLOSED;
    this.successes = 0;
   }
  }
 }

 private onFailure(error: Error): void {
  this.failures.push({ timestamp: Date.now(), error });
  this.lastFailureTime = Date.now();

  if (this.state === CircuitState.HALF_OPEN) {
   this.state = CircuitState.OPEN;
   this.successes = 0;
  } else if (this.failures.length >= this.config.failureThreshold) {
   this.state = CircuitState.OPEN;
  }
 }

 private shouldAttemptReset(): boolean {
  return Date.now() - this.lastFailureTime >= this.config.timeout;
 }

 private cleanOldFailures(): void {
  const cutoff = Date.now() - this.config.monitorWindow;
  this.failures = this.failures.filter((f) => f.timestamp > cutoff);
 }

 // Getters for monitoring/debugging
 getState(): CircuitState {
  return this.state;
 }
 getFailureCount(): number {
  return this.failures.length;
 }
 getHealthStatus() {
  return {
   state: this.state,
   failures: this.failures.length,
   lastFailure: this.lastFailureTime,
   hostId: this.hostId,
  };
 }
}

export class CircuitBreakerOpenError extends Error {
 constructor(message: string) {
  super(message);
  this.name = "CircuitBreakerOpenError";
 }
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
 failureThreshold: 5,
 successThreshold: 2,
 timeout: 60000, // 1 minute
 monitorWindow: 300000, // 5 minutes
};
```

### Phase 2: Integration with HttpMonitor (1 hour)

**File**: `electron/services/monitoring/HttpMonitor.ts`

```typescript
// Add to HttpMonitor class
private circuitBreakers = new Map<string, CircuitBreaker>();

private getCircuitBreaker(url: string): CircuitBreaker {
    const hostKey = this.rateLimiter.getKey(url); // Reuse existing key logic

    if (!this.circuitBreakers.has(hostKey)) {
        this.circuitBreakers.set(hostKey, new CircuitBreaker(hostKey));
    }

    return this.circuitBreakers.get(hostKey)!;
}

// Modify existing check method
public async check(config: MonitorConfig): Promise<MonitorCheckResult> {
    const { url } = config;

    // Existing validation...

    const circuitBreaker = this.getCircuitBreaker(url);

    try {
        return await circuitBreaker.execute(async () => {
            // Wrap existing HTTP check logic
            return await this.performHttpCheck(config);
        });
    } catch (error) {
        if (error instanceof CircuitBreakerOpenError) {
            return {
                status: 'down',
                responseTime: 0,
                message: `Circuit breaker open: ${error.message}`,
                timestamp: Date.now()
            };
        }
        throw error;
    }
}
```

### Phase 3: Monitoring Dashboard (2 hours)

**File**: `src/components/monitoring/CircuitBreakerStatus.tsx`

```typescript
export function CircuitBreakerStatus() {
    const [breakerStatus, setBreakerStatus] = useState<CircuitBreakerHealth[]>([]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const status = await window.electronAPI.monitoring.getCircuitBreakerStatus();
            setBreakerStatus(status);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <ThemedCard title="Circuit Breaker Status">
            {breakerStatus.map(breaker => (
                <div key={breaker.hostId} className="mb-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                        breaker.state === 'CLOSED' ? 'bg-green-100 text-green-800' :
                        breaker.state === 'HALF_OPEN' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {breaker.hostId}: {breaker.state}
                    </span>
                    {breaker.failures > 0 && (
                        <span className="ml-2 text-sm text-gray-600">
                            {breaker.failures} failures
                        </span>
                    )}
                </div>
            ))}
        </ThemedCard>
    );
}
```

### Phase 4: Configuration (30 minutes)

**File**: `shared/types/monitorConfig.ts`

```typescript
export interface CircuitBreakerSettings {
 enabled: boolean;
 failureThreshold: number;
 successThreshold: number;
 timeoutMs: number;
 monitorWindowMs: number;
}

// Add to MonitorConfig interface
export interface MonitorConfig {
 // ... existing fields
 circuitBreaker?: CircuitBreakerSettings;
}
```

## 📊 Implementation Estimate

- **Total Effort**: ~6 hours
- **Files Changed**: 4-5 files
- **Testing Required**: 2-3 hours
- **Documentation**: 1 hour

## ⚠️ STRONG RECOMMENDATION: Skip This

**Your existing infrastructure already provides:**

- ✅ Rate limiting (prevents flooding)
- ✅ Retry logic with backoff (handles transient failures)
- ✅ Timeout handling (prevents hangs)
- ✅ Graceful degradation (monitors can be disabled)

**Circuit breakers would add:**

- ❌ Additional complexity
- ❌ More configuration to manage
- ❌ Minimal actual benefit
- ❌ Another potential point of failure

## 🎯 Better Alternatives

Instead of circuit breakers, consider these higher-value improvements:

1. **Enhanced Retry Configuration** (15 minutes)
   - Make retry attempts configurable per monitor
   - Add jitter to backoff timing

2. **Monitoring Insights Dashboard** (2 hours)
   - Show failure patterns over time
   - Alert on repeated failures
   - Performance trends

3. **Bulk Monitor Operations** (1 hour)
   - Enable/disable multiple monitors
   - Bulk configuration updates

These provide more user value with less complexity than circuit breakers.
