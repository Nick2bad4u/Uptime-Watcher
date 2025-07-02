/**
 * useSiteStats Edge Cases Tests
 * Tests for edge cases and error scenarios in useSiteStats hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSiteStats } from '../hooks/site/useSiteStats';
import type { HistoryRecord } from '../types';

describe('useSiteStats Edge Cases', () => {
    describe('averageResponseTime calculation', () => {
        it('should handle empty history correctly', () => {
            const { result } = renderHook(() => useSiteStats([]));
            
            expect(result.current.averageResponseTime).toBe(0);
            expect(result.current.checkCount).toBe(0);
            expect(result.current.uptime).toBe(0);
        });

        it('should handle history with only down records', () => {
            const history: HistoryRecord[] = [
                {
                    id: '1',
                    monitorId: 'monitor-1',
                    status: 'down',
                    responseTime: undefined,
                    timestamp: new Date(),
                },
                {
                    id: '2',
                    monitorId: 'monitor-1',
                    status: 'down',
                    responseTime: null,
                    timestamp: new Date(),
                }
            ];

            const { result } = renderHook(() => useSiteStats(history));
            
            expect(result.current.averageResponseTime).toBe(0);
            expect(result.current.checkCount).toBe(2);
            expect(result.current.uptime).toBe(0);
        });

        it('should handle history with up records but no response times', () => {
            const history: HistoryRecord[] = [
                {
                    id: '1',
                    monitorId: 'monitor-1',
                    status: 'up',
                    responseTime: undefined,
                    timestamp: new Date(),
                },
                {
                    id: '2',
                    monitorId: 'monitor-1',
                    status: 'up',
                    responseTime: null,
                    timestamp: new Date(),
                }
            ];

            const { result } = renderHook(() => useSiteStats(history));
            
            // Should still be 0 because no valid response times (covers line 47)
            expect(result.current.averageResponseTime).toBe(0);
            expect(result.current.checkCount).toBe(2);
            expect(result.current.uptime).toBe(100);
        });

        it('should handle history with up records and zero response times', () => {
            const history: HistoryRecord[] = [
                {
                    id: '1',
                    monitorId: 'monitor-1',
                    status: 'up',
                    responseTime: 0,
                    timestamp: new Date(),
                },
                {
                    id: '2',
                    monitorId: 'monitor-1',
                    status: 'up',
                    responseTime: 0,
                    timestamp: new Date(),
                }
            ];

            const { result } = renderHook(() => useSiteStats(history));
            
            // Zero response times should be filtered out (covers line 47)
            expect(result.current.averageResponseTime).toBe(0);
            expect(result.current.checkCount).toBe(2);
            expect(result.current.uptime).toBe(100);
        });

        it('should handle mixed history with valid and invalid response times', () => {
            const history: HistoryRecord[] = [
                {
                    id: '1',
                    monitorId: 'monitor-1',
                    status: 'up',
                    responseTime: 100,
                    timestamp: new Date(),
                },
                {
                    id: '2',
                    monitorId: 'monitor-1',
                    status: 'up',
                    responseTime: 0, // Should be filtered out
                    timestamp: new Date(),
                },
                {
                    id: '3',
                    monitorId: 'monitor-1',
                    status: 'up',
                    responseTime: 200,
                    timestamp: new Date(),
                },
                {
                    id: '4',
                    monitorId: 'monitor-1',
                    status: 'up',
                    responseTime: undefined, // Should be filtered out
                    timestamp: new Date(),
                },
                {
                    id: '5',
                    monitorId: 'monitor-1',
                    status: 'down',
                    responseTime: 300, // Should be filtered out (down status)
                    timestamp: new Date(),
                }
            ];

            const { result } = renderHook(() => useSiteStats(history));
            
            // Should only include records 1 and 3: (100 + 200) / 2 = 150
            expect(result.current.averageResponseTime).toBe(150);
            expect(result.current.checkCount).toBe(5);
            expect(result.current.uptime).toBe(80); // 4 up out of 5 total
        });

        it('should handle negative response times correctly', () => {
            const history: HistoryRecord[] = [
                {
                    id: '1',
                    monitorId: 'monitor-1',
                    status: 'up',
                    responseTime: -100, // Invalid negative response time
                    timestamp: new Date(),
                },
                {
                    id: '2',
                    monitorId: 'monitor-1',
                    status: 'up',
                    responseTime: 200,
                    timestamp: new Date(),
                }
            ];

            const { result } = renderHook(() => useSiteStats(history));
            
            // Should filter out negative response time and only use valid one
            expect(result.current.averageResponseTime).toBe(200);
            expect(result.current.checkCount).toBe(2);
            expect(result.current.uptime).toBe(100);
        });
    });
});
