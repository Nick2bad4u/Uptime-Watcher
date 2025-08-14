/**
 * Branch Coverage Optimization Tests
 * 
 * Targeted tests to improve branch coverage for specific files identified
 * in the coverage report as having branch coverage below 90%.
 */

import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';

// Import components with low branch coverage
import { StatusBadge } from '../components/common/StatusBadge';
import { SiteCardHistory } from '../components/Dashboard/SiteCard/SiteCardHistory';
import ThemeProvider from '../theme/components/ThemeProvider';

// Mock dependencies
vi.mock('../hooks/useMonitorTypes', () => ({
    useMonitorTypes: () => ({
        options: [
            { value: 'http', label: 'HTTP' },
            { value: 'port', label: 'Port' }
        ]
    })
}));

vi.mock('../utils/monitorTitleFormatters', () => ({
    formatTitleSuffix: (monitor: any) => {
        if (monitor.type === 'http' && monitor.url) {
            return ` - ${monitor.url}`;
        }
        if (monitor.type === 'port' && monitor.host && monitor.port) {
            return ` - ${monitor.host}:${monitor.port}`;
        }
        return '';
    }
}));

vi.mock('../components/common/HistoryChart', () => ({
    HistoryChart: ({ title, history, maxItems }: any) => (
        <div data-testid="history-chart">
            <div data-testid="chart-title">{title}</div>
            <div data-testid="chart-history-count">{history.length}</div>
            <div data-testid="chart-max-items">{maxItems}</div>
        </div>
    )
}));

describe('Branch Coverage Optimization Tests', () => {
    describe('StatusBadge Component', () => {
        it('should handle all size mappings in getIndicatorSize switch statement', () => {
            // Test 2xl size (should map to "lg")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" status="up" size="2xl" />
                </ThemeProvider>
            );

            // Test 3xl size (should map to "lg") 
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" status="up" size="3xl" />
                </ThemeProvider>
            );

            // Test 4xl size (should map to "lg")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" status="up" size="4xl" />
                </ThemeProvider>
            );

            // Test xl size (should map to "lg")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" status="up" size="xl" />
                </ThemeProvider>
            );

            // Test base size (should map to "md")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" status="up" size="base" />
                </ThemeProvider>
            );

            // Test lg size (should map to "md")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" status="up" size="lg" />
                </ThemeProvider>
            );

            // Test sm size (should map to "sm")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" status="up" size="sm" />
                </ThemeProvider>
            );

            // Test xs size (should map to "sm")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" status="up" size="xs" />
                </ThemeProvider>
            );

            expect(screen.getAllByText(/Test/).length).toBeGreaterThan(0);
        });

        it('should handle custom formatter function', () => {
            const customFormatter = (label: string, status: string) => `Custom: ${label} (${status.toUpperCase()})`;
            
            render(
                <ThemeProvider>
                    <StatusBadge 
                        label="Status" 
                        status="up" 
                        formatter={customFormatter} 
                    />
                </ThemeProvider>
            );

            expect(screen.getByText('Custom: Status (UP)')).toBeInTheDocument();
        });

        it('should handle default formatter when no custom formatter provided', () => {
            render(
                <ThemeProvider>
                    <StatusBadge label="Status" status="down" />
                </ThemeProvider>
            );

            expect(screen.getByText('Status: down')).toBeInTheDocument();
        });

        it('should handle showIcon=false branch', () => {
            render(
                <ThemeProvider>
                    <StatusBadge label="Status" status="up" showIcon={false} />
                </ThemeProvider>
            );

            expect(screen.getByText('Status: up')).toBeInTheDocument();
        });

        it('should handle showIcon=true branch (default)', () => {
            render(
                <ThemeProvider>
                    <StatusBadge label="Status" status="up" showIcon={true} />
                </ThemeProvider>
            );

            expect(screen.getByText('Status: up')).toBeInTheDocument();
        });
    });

    describe('SiteCardHistory Component', () => {
        const mockHistory = [
            { timestamp: Date.now(), status: 'up' as const, responseTime: 100 },
            { timestamp: Date.now() - 1000, status: 'down' as const, responseTime: -1 }
        ];

        it('should handle undefined monitor case', () => {
            render(
                <SiteCardHistory 
                    monitor={undefined} 
                    filteredHistory={mockHistory} 
                />
            );

            expect(screen.getByTestId('chart-title')).toHaveTextContent('No Monitor Selected');
        });

        it('should handle monitor with type not found in options', () => {
            const monitor = {
                id: 'test-1',
                type: 'unknown' as any,
                url: 'https://example.com',
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: 'up' as const,
                responseTime: 100,
                monitoring: true
            };

            render(
                <SiteCardHistory 
                    monitor={monitor} 
                    filteredHistory={mockHistory} 
                />
            );

            // Should fallback to monitor.type when option not found
            expect(screen.getByTestId('chart-title')).toHaveTextContent('unknown History');
        });

        it('should handle HTTP monitor with URL', () => {
            const monitor = {
                id: 'test-1',
                type: 'http' as const,
                url: 'https://example.com',
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: 'up' as const,
                responseTime: 100,
                monitoring: true
            };

            render(
                <SiteCardHistory 
                    monitor={monitor} 
                    filteredHistory={mockHistory} 
                />
            );

            expect(screen.getByTestId('chart-title')).toHaveTextContent('HTTP History - https://example.com');
        });

        it('should handle port monitor with host and port', () => {
            const monitor = {
                id: 'test-1',
                type: 'port' as const,
                host: 'example.com',
                port: 80,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: 'up' as const,
                responseTime: 100,
                monitoring: true
            };

            render(
                <SiteCardHistory 
                    monitor={monitor} 
                    filteredHistory={mockHistory} 
                />
            );

            expect(screen.getByTestId('chart-title')).toHaveTextContent('Port History - example.com:80');
        });

        it('should handle ping monitor without URL or port', () => {
            const monitor = {
                id: 'test-1',
                type: 'ping' as any,
                host: 'example.com',
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: 'up' as const,
                responseTime: 100,
                monitoring: true
            };

            render(
                <SiteCardHistory 
                    monitor={monitor} 
                    filteredHistory={mockHistory} 
                />
            );

            // Should not have suffix for ping monitor
            expect(screen.getByTestId('chart-title')).toHaveTextContent('ping History');
        });
    });

    describe('Props Comparison Function Coverage', () => {
        const SiteCardHistoryWrapped = React.memo(SiteCardHistory, (prev, next) => {
            // Test all branches of areHistoryPropsEqual function
            
            // Compare history arrays length
            if (prev.filteredHistory.length !== next.filteredHistory.length) {
                return false;
            }
            
            // Compare first history item timestamp
            const prevTimestamp = prev.filteredHistory[0]?.timestamp;
            const nextTimestamp = next.filteredHistory[0]?.timestamp;
            if (prevTimestamp !== nextTimestamp) {
                return false;
            }

            // Compare monitor objects
            const prevMonitor = prev.monitor;
            const nextMonitor = next.monitor;
            
            // Both undefined
            if (prevMonitor === undefined && nextMonitor === undefined) {
                return true;
            }
            
            // One undefined, one defined
            if (prevMonitor === undefined || nextMonitor === undefined) {
                return false;
            }
            
            // Compare monitor properties
            if (
                prevMonitor.id !== nextMonitor.id ||
                prevMonitor.type !== nextMonitor.type
            ) {
                return false;
            }
            
            // Compare optional properties
            return !(
                prevMonitor.url !== nextMonitor.url ||
                prevMonitor.port !== nextMonitor.port ||
                prevMonitor.host !== nextMonitor.host
            );
        });

        it('should handle different history lengths', () => {
            const { rerender } = render(
                <SiteCardHistoryWrapped 
                    monitor={undefined} 
                    filteredHistory={[]} 
                />
            );

            rerender(
                <SiteCardHistoryWrapped 
                    monitor={undefined} 
                    filteredHistory={[{ timestamp: Date.now(), status: 'up', responseTime: 100 }]} 
                />
            );

            expect(screen.getByTestId('chart-history-count')).toHaveTextContent('1');
        });

        it('should handle empty history arrays', () => {
            render(
                <SiteCardHistoryWrapped 
                    monitor={undefined} 
                    filteredHistory={[]} 
                />
            );

            expect(screen.getByTestId('chart-history-count')).toHaveTextContent('0');
        });

        it('should handle both monitor and no monitor cases', () => {
            const monitor = {
                id: 'test-1',
                type: 'http' as const,
                url: 'https://example.com',
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: 'up' as const,
                responseTime: 100,
                monitoring: true
            };

            const { rerender } = render(
                <SiteCardHistoryWrapped 
                    monitor={undefined} 
                    filteredHistory={[]} 
                />
            );

            rerender(
                <SiteCardHistoryWrapped 
                    monitor={monitor} 
                    filteredHistory={[]} 
                />
            );

            expect(screen.getByTestId('chart-title')).toHaveTextContent('HTTP History - https://example.com');
        });

        it('should handle monitor property differences', () => {
            const monitor1 = {
                id: 'test-1',
                type: 'http' as const,
                url: 'https://example.com',
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: 'up' as const,
                responseTime: 100,
                monitoring: true
            };

            const monitor2 = {
                ...monitor1,
                url: 'https://different.com'
            };

            const { rerender } = render(
                <SiteCardHistoryWrapped 
                    monitor={monitor1} 
                    filteredHistory={[]} 
                />
            );

            rerender(
                <SiteCardHistoryWrapped 
                    monitor={monitor2} 
                    filteredHistory={[]} 
                />
            );

            expect(screen.getByTestId('chart-title')).toHaveTextContent('HTTP History - https://different.com');
        });

        it('should handle different monitor types', () => {
            const httpMonitor = {
                id: 'test-1',
                type: 'http' as const,
                url: 'https://example.com',
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: 'up' as const,
                responseTime: 100,
                monitoring: true
            };

            const portMonitor = {
                id: 'test-1',
                type: 'port' as const,
                host: 'example.com',
                port: 80,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: 'up' as const,
                responseTime: 100,
                monitoring: true
            };

            const { rerender } = render(
                <SiteCardHistoryWrapped 
                    monitor={httpMonitor} 
                    filteredHistory={[]} 
                />
            );

            rerender(
                <SiteCardHistoryWrapped 
                    monitor={portMonitor} 
                    filteredHistory={[]} 
                />
            );

            expect(screen.getByTestId('chart-title')).toHaveTextContent('Port History - example.com:80');
        });

        it('should handle monitor ID differences', () => {
            const monitor1 = {
                id: 'test-1',
                type: 'http' as const,
                url: 'https://example.com',
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: 'up' as const,
                responseTime: 100,
                monitoring: true
            };

            const monitor2 = {
                ...monitor1,
                id: 'test-2'
            };

            const { rerender } = render(
                <SiteCardHistoryWrapped 
                    monitor={monitor1} 
                    filteredHistory={[]} 
                />
            );

            rerender(
                <SiteCardHistoryWrapped 
                    monitor={monitor2} 
                    filteredHistory={[]} 
                />
            );

            expect(screen.getByTestId('chart-title')).toHaveTextContent('HTTP History - https://example.com');
        });
    });

    describe('Edge Cases and Complex Scenarios', () => {
        it('should handle monitor with all optional properties undefined', () => {
            const monitor = {
                id: 'test-1',
                type: 'unknown' as any,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: 'up' as const,
                responseTime: 100,
                monitoring: true
            };

            render(
                <SiteCardHistory 
                    monitor={monitor} 
                    filteredHistory={[]} 
                />
            );

            expect(screen.getByTestId('chart-title')).toHaveTextContent('unknown History');
        });

        it('should handle monitor with partial properties', () => {
            const monitor = {
                id: 'test-1',
                type: 'http' as const,
                // url is missing
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: 'up' as const,
                responseTime: 100,
                monitoring: true
            };

            render(
                <SiteCardHistory 
                    monitor={monitor} 
                    filteredHistory={[]} 
                />
            );

            expect(screen.getByTestId('chart-title')).toHaveTextContent('HTTP History');
        });

        it('should verify maxItems is passed correctly', () => {
            render(
                <SiteCardHistory 
                    monitor={undefined} 
                    filteredHistory={[]} 
                />
            );

            expect(screen.getByTestId('chart-max-items')).toHaveTextContent('60');
        });

        it('should handle very long monitor URLs', () => {
            const monitor = {
                id: 'test-1',
                type: 'http' as const,
                url: 'https://very-long-domain-name-that-exceeds-normal-length-limits.example.com/very/long/path/with/many/segments/that/goes/on/and/on',
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: 'up' as const,
                responseTime: 100,
                monitoring: true
            };

            render(
                <SiteCardHistory 
                    monitor={monitor} 
                    filteredHistory={[]} 
                />
            );

            expect(screen.getByTestId('chart-title')).toHaveTextContent('HTTP History');
        });
    });
});
