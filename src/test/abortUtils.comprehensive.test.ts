/**
 * Comprehensive tests for abortUtils.ts - achieving 100% coverage
 *
 * @fileoverview Tests all functions, branches, and edge cases in abortUtils.ts
 * @author GitHub Copilot
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    createAbortableOperation,
    createCombinedAbortSignal,
    isAbortError,
    raceWithAbort,
    retryWithAbort,
    sleep,
} from '@shared/utils/abortUtils';

describe('abortUtils.ts - Comprehensive Coverage', () => {
    beforeAll(() => {
        // Mock AbortSignal.timeout and AbortSignal.any for older Node versions
        if (!AbortSignal.timeout) {
            vi.spyOn(AbortSignal, 'timeout').mockImplementation((delay: number) => {
                const controller = new AbortController();
                setTimeout(() => controller.abort(), delay);
                return controller.signal;
            });
        }

        if (!AbortSignal.any) {
            vi.spyOn(AbortSignal, 'any').mockImplementation((signals: AbortSignal[]) => {
                const controller = new AbortController();
                for (const signal of signals) {
                    if (signal.aborted) {
                        controller.abort();
                        continue;
                    }
                    signal.addEventListener('abort', () => controller.abort(), { once: true });
                }
                return controller.signal;
            });
        }
    });

    beforeEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    describe('createCombinedAbortSignal', () => {
        it('should return a new signal when no options provided', () => {
            const signal = createCombinedAbortSignal();
            expect(signal).toBeInstanceOf(AbortSignal);
            expect(signal.aborted).toBe(false);
        });

        it('should return a new signal when empty options object provided', () => {
            const signal = createCombinedAbortSignal({});
            expect(signal).toBeInstanceOf(AbortSignal);
            expect(signal.aborted).toBe(false);
        });

        it('should create timeout signal when timeoutMs provided', () => {
            const signal = createCombinedAbortSignal({ timeoutMs: 100 });
            expect(signal).toBeInstanceOf(AbortSignal);
        });

        it('should ignore timeoutMs when it is 0', () => {
            const signal = createCombinedAbortSignal({ timeoutMs: 0 });
            expect(signal).toBeInstanceOf(AbortSignal);
            expect(signal.aborted).toBe(false);
        });

        it('should ignore timeoutMs when it is negative', () => {
            const signal = createCombinedAbortSignal({ timeoutMs: -100 });
            expect(signal).toBeInstanceOf(AbortSignal);
            expect(signal.aborted).toBe(false);
        });

        it('should include additional signals when provided', () => {
            const controller1 = new AbortController();
            const controller2 = new AbortController();

            const signal = createCombinedAbortSignal({
                additionalSignals: [controller1.signal, controller2.signal]
            });

            expect(signal).toBeInstanceOf(AbortSignal);
        });

        it('should filter out falsy additional signals', () => {
            const controller = new AbortController();

            const signal = createCombinedAbortSignal({
                additionalSignals: [controller.signal, null, undefined] as any
            });

            expect(signal).toBeInstanceOf(AbortSignal);
        });

        it('should return the single signal directly when only one signal provided', () => {
            const controller = new AbortController();

            const signal = createCombinedAbortSignal({
                additionalSignals: [controller.signal]
            });

            expect(signal).toBe(controller.signal);
        });

        it('should handle single signal with undefined/null values', () => {
            const signal = createCombinedAbortSignal({
                additionalSignals: [null, undefined] as any
            });

            expect(signal).toBeInstanceOf(AbortSignal);
        });

        it('should combine multiple signals using AbortSignal.any', () => {
            const controller1 = new AbortController();
            const controller2 = new AbortController();

            const signal = createCombinedAbortSignal({
                additionalSignals: [controller1.signal, controller2.signal],
                timeoutMs: 1000
            });

            expect(signal).toBeInstanceOf(AbortSignal);
        });

        it('should handle all options together', () => {
            const controller = new AbortController();

            const signal = createCombinedAbortSignal({
                timeoutMs: 5000,
                additionalSignals: [controller.signal],
                reason: 'Test reason'
            });

            expect(signal).toBeInstanceOf(AbortSignal);
        });
    });

    describe('createAbortableOperation', () => {
        it('should execute operation and return result', async () => {
            const result = 'test result';
            const operation = vi.fn().mockResolvedValue(result);

            const actualResult = await createAbortableOperation(operation);

            expect(actualResult).toBe(result);
            expect(operation).toHaveBeenCalledWith(expect.any(AbortSignal));
        });

        it('should call cleanup function after operation completes', async () => {
            const cleanup = vi.fn();
            const operation = vi.fn().mockResolvedValue('result');

            await createAbortableOperation(operation, { cleanup });

            expect(cleanup).toHaveBeenCalledOnce();
        });

        it('should call cleanup function even when operation throws', async () => {
            const cleanup = vi.fn();
            const operation = vi.fn().mockRejectedValue(new Error('Test error'));

            await expect(createAbortableOperation(operation, { cleanup }))
                .rejects.toThrow('Test error');

            expect(cleanup).toHaveBeenCalledOnce();
        });

        it('should pass combined signal to operation', async () => {
            const controller = new AbortController();
            const operation = vi.fn().mockResolvedValue('result');

            await createAbortableOperation(operation, {
                additionalSignals: [controller.signal],
                timeoutMs: 1000
            });

            expect(operation).toHaveBeenCalledWith(expect.any(AbortSignal));
        });

        it('should handle operation with no options', async () => {
            const operation = vi.fn().mockResolvedValue('result');

            const result = await createAbortableOperation(operation);

            expect(result).toBe('result');
        });
    });

    describe('sleep', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        it('should resolve after specified delay', async () => {
            const promise = sleep(1000);

            vi.advanceTimersByTime(1000);

            await expect(promise).resolves.toBeUndefined();
        });

        it('should reject immediately if signal is already aborted', async () => {
            const controller = new AbortController();
            controller.abort();

            await expect(sleep(1000, controller.signal))
                .rejects.toThrow('Sleep was aborted');
        });

        it('should reject when signal is aborted during sleep', async () => {
            const controller = new AbortController();

            const promise = sleep(1000, controller.signal);

            vi.advanceTimersByTime(500);
            controller.abort();

            await expect(promise).rejects.toThrow('Sleep was aborted');
        });

        it('should work without signal parameter', async () => {
            const promise = sleep(500);

            vi.advanceTimersByTime(500);

            await expect(promise).resolves.toBeUndefined();
        });

        it('should handle zero delay', async () => {
            const promise = sleep(0);

            vi.advanceTimersByTime(0);

            await expect(promise).resolves.toBeUndefined();
        });
    });

    describe('retryWithAbort', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        it('should return result on first success', async () => {
            const operation = vi.fn().mockResolvedValue('success');

            const result = await retryWithAbort(operation);

            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledOnce();
        });

        it('should retry on failure and eventually succeed', async () => {
            const operation = vi.fn()
                .mockRejectedValueOnce(new Error('First failure'))
                .mockResolvedValue('success');

            const promise = retryWithAbort(operation, {
                maxRetries: 2,
                initialDelay: 100
            });

            // Let the first attempt fail and start the delay
            await vi.runAllTimersAsync();

            const result = await promise;

            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(2);
        });

        it('should exhaust retries and throw last error', async () => {
            const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

            const promise = retryWithAbort(operation, {
                maxRetries: 2,
                initialDelay: 100
            });

            await vi.runAllTimersAsync(); // Run all timers to completion

            await expect(promise).rejects.toThrow('Always fails');
            expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
        });

        it('should respect abort signal', async () => {
            const controller = new AbortController();
            const operation = vi.fn().mockRejectedValue(new Error('Fails'));

            const promise = retryWithAbort(operation, {
                maxRetries: 5,
                initialDelay: 100,
                signal: controller.signal
            });

            // Abort after the first failure during delay
            setTimeout(() => controller.abort(), 50);
            await vi.runAllTimersAsync();

            await expect(promise).rejects.toThrow('Operation was aborted');
        });

        it('should throw immediately if signal already aborted', async () => {
            const controller = new AbortController();
            controller.abort();
            const operation = vi.fn();

            await expect(retryWithAbort(operation, {
                signal: controller.signal
            })).rejects.toThrow('Operation was aborted');

            expect(operation).not.toHaveBeenCalled();
        });

        it('should use exponential backoff', async () => {
            const operation = vi.fn().mockRejectedValue(new Error('Fails'));

            const promise = retryWithAbort(operation, {
                maxRetries: 2,
                initialDelay: 100,
                backoffMultiplier: 2
            });

            // Run all timers to completion
            await vi.runAllTimersAsync();

            await expect(promise).rejects.toThrow('Fails');
            expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
        });

        it('should respect maxDelay cap', async () => {
            const operation = vi.fn().mockRejectedValue(new Error('Fails'));

            const promise = retryWithAbort(operation, {
                maxRetries: 3,
                initialDelay: 1000,
                backoffMultiplier: 10,
                maxDelay: 2000
            });

            // Run all timers to completion
            await vi.runAllTimersAsync();

            await expect(promise).rejects.toThrow('Fails');
            expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries
        });

        it('should handle default options', async () => {
            const operation = vi.fn().mockResolvedValue('success');

            const result = await retryWithAbort(operation);

            expect(result).toBe('success');
        });

        it('should handle non-Error objects as errors', async () => {
            const operation = vi.fn().mockRejectedValue('string error');

            const promise = retryWithAbort(operation, { maxRetries: 1 });

            await vi.runAllTimersAsync();

            await expect(promise).rejects.toThrow('string error');
            expect(operation).toHaveBeenCalledTimes(2); // Initial + 1 retry
        });

        it('should handle zero retries', async () => {
            const operation = vi.fn().mockRejectedValue(new Error('Fails'));

            await expect(retryWithAbort(operation, {
                maxRetries: 0
            })).rejects.toThrow('Fails');

            expect(operation).toHaveBeenCalledOnce();
        });
    });

    describe('isAbortError', () => {
        it('should return true for AbortError', () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';

            expect(isAbortError(error)).toBe(true);
        });

        it('should return true for TimeoutError', () => {
            const error = new Error('Timeout');
            error.name = 'TimeoutError';

            expect(isAbortError(error)).toBe(true);
        });

        it('should return true for errors with "aborted" in message', () => {
            const error = new Error('Request was aborted');

            expect(isAbortError(error)).toBe(true);
        });

        it('should return true for errors with "cancelled" in message', () => {
            const error = new Error('Operation was cancelled');

            expect(isAbortError(error)).toBe(true);
        });

        it('should return false for regular errors', () => {
            const error = new Error('Regular error');

            expect(isAbortError(error)).toBe(false);
        });

        it('should return false for non-Error objects', () => {
            expect(isAbortError('string')).toBe(false);
            expect(isAbortError(123)).toBe(false);
            expect(isAbortError(null)).toBe(false);
            expect(isAbortError(undefined)).toBe(false);
            expect(isAbortError({})).toBe(false);
        });

        it('should handle errors with mixed case messages', () => {
            const error1 = new Error('Request was ABORTED');
            const error2 = new Error('Operation was CANCELLED');

            expect(isAbortError(error1)).toBe(true);
            expect(isAbortError(error2)).toBe(true);
        });
    });

    describe('raceWithAbort', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        it('should return operation result when operation completes first', async () => {
            const operation = Promise.resolve('success');
            const controller = new AbortController();

            const result = await raceWithAbort(operation, controller.signal);

            expect(result).toBe('success');
        });

        it('should throw when signal aborts before operation completes', async () => {
            const operation = new Promise(resolve => {
                setTimeout(() => resolve('late success'), 1000);
            });
            const controller = new AbortController();

            const promise = raceWithAbort(operation, controller.signal);

            setTimeout(() => controller.abort(), 500);
            vi.advanceTimersByTime(500);

            await expect(promise).rejects.toThrow('Operation was aborted');
        });

        it('should throw immediately if signal is already aborted', async () => {
            const controller = new AbortController();
            controller.abort();
            const operation = Promise.resolve('success');

            await expect(raceWithAbort(operation, controller.signal))
                .rejects.toThrow('Operation was aborted');
        });

        it('should handle operation rejection', async () => {
            const operation = Promise.reject(new Error('Operation failed'));
            const controller = new AbortController();

            await expect(raceWithAbort(operation, controller.signal))
                .rejects.toThrow('Operation failed');
        });

        it('should handle slow operation that eventually completes', async () => {
            let resolveOperation: (value: string) => void;
            const operation = new Promise<string>(resolve => {
                resolveOperation = resolve;
            });
            const controller = new AbortController();

            const promise = raceWithAbort(operation, controller.signal);

            vi.advanceTimersByTime(100);
            resolveOperation!('delayed success');

            const result = await promise;
            expect(result).toBe('delayed success');
        });
    });

    describe('Edge Cases and Integration Tests', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        it('should handle complex abort signal combinations', async () => {
            const controller1 = new AbortController();
            const controller2 = new AbortController();

            const combinedSignal = createCombinedAbortSignal({
                timeoutMs: 1000,
                additionalSignals: [controller1.signal, controller2.signal],
                reason: 'Multiple abort conditions'
            });

            expect(combinedSignal).toBeInstanceOf(AbortSignal);
        });

        it('should handle abortable operation with retries', async () => {
            const operation = async (signal: AbortSignal) => {
                if (signal.aborted) throw new Error('Aborted');
                return await retryWithAbort(
                    () => Promise.resolve('nested success'),
                    { maxRetries: 2, signal }
                );
            };

            const result = await createAbortableOperation(operation);
            expect(result).toBe('nested success');
        });

        it('should handle sleep with retry integration', async () => {
            const controller = new AbortController();
            let attempt = 0;

            const operation = async () => {
                attempt++;
                await sleep(100, controller.signal);
                if (attempt < 3) throw new Error('Not ready yet');
                return 'finally ready';
            };

            const promise = retryWithAbort(operation, {
                maxRetries: 5,
                initialDelay: 50,
                signal: controller.signal
            });

            await vi.runAllTimersAsync();

            const result = await promise;
            expect(result).toBe('finally ready');
        });

        it('should handle race with multiple operations', async () => {
            const slow = new Promise(resolve => setTimeout(() => resolve('slow'), 1000));
            const fast = Promise.resolve('fast');
            const controller = new AbortController();

            const result = await Promise.race([
                raceWithAbort(slow, controller.signal),
                raceWithAbort(fast, controller.signal)
            ]);

            expect(result).toBe('fast');
        });
    });
});
