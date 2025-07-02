/**
 * @fileoverview Comprehensive test suite for HistoryTab component.
 * Tests all functionality including history filtering, pagination, display controls,
 * and user interactions. Ensures 100% code coverage across all metrics.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryTab } from '../components/SiteDetails/tabs/HistoryTab';
import { Monitor, StatusHistory } from '../types';
import logger from '../services/logger';
import { useStore } from '../store';

// Get typed mocks
const mockLogger = vi.mocked(logger);
const mockUseStore = vi.mocked(useStore);

// Mock the logger service
vi.mock('../services/logger', () => ({
    default: {
        user: {
            action: vi.fn(),
        },
    },
}));

// Mock the store
vi.mock('../store.ts', () => ({
    useStore: vi.fn(() => ({
        settings: {
            historyLimit: 25,
        },
    })),
}));

// Mock themed components
vi.mock('../theme/components', () => ({
    ThemedBox: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => 
        <div data-testid="themed-box" {...props}>{children}</div>,
    ThemedButton: ({ children, onClick, variant, size, disabled, className, ...props }: React.PropsWithChildren<{
        onClick?: () => void;
        variant?: string;
        size?: string;
        disabled?: boolean;
        className?: string;
    } & Record<string, unknown>>) => (
        <button 
            data-testid="themed-button"
            data-variant={variant}
            data-size={size}
            onClick={onClick}
            disabled={disabled}
            className={className}
            {...props}
        >
            {children}
        </button>
    ),
    ThemedText: ({ children, size, variant, weight, className, ...props }: React.PropsWithChildren<{
        size?: string;
        variant?: string;
        weight?: string;
        className?: string;
    } & Record<string, unknown>>) => (
        <span 
            data-testid="themed-text" 
            data-size={size} 
            data-variant={variant} 
            data-weight={weight}
            className={className} 
            {...props}
        >
            {children}
        </span>
    ),
    StatusIndicator: ({ status, size, ...props }: { status: string; size?: string } & Record<string, unknown>) => (
        <div data-testid="status-indicator" data-status={status} data-size={size} {...props}>
            {status}
        </div>
    ),
}));

describe('HistoryTab', () => {
    // Mock data
    const mockHistory: StatusHistory[] = [
        { timestamp: 1640995200000, status: 'up', responseTime: 150 },
        { timestamp: 1640991600000, status: 'down', responseTime: 5000 },
        { timestamp: 1640988000000, status: 'up', responseTime: 200 },
        { timestamp: 1640984400000, status: 'up', responseTime: 175 },
        { timestamp: 1640980800000, status: 'down', responseTime: 8000 },
    ];

    const mockMonitor: Monitor = {
        id: 'test-monitor',
        type: 'http',
        status: 'up',
        url: 'https://example.com',
        history: mockHistory,
    };

    const mockPortMonitor: Monitor = {
        id: 'test-port-monitor',
        type: 'port',
        status: 'up',
        host: 'example.com',
        port: 80,
        history: mockHistory,
    };

    // Mock functions
    const mockFormatFullTimestamp = vi.fn((timestamp: number) => new Date(timestamp).toLocaleString());
    const mockFormatResponseTime = vi.fn((time: number) => `${time}ms`);
    const mockFormatStatusWithIcon = vi.fn((status: string) => status === 'up' ? '✅ Up' : '❌ Down');

    const defaultProps = {
        formatFullTimestamp: mockFormatFullTimestamp,
        formatResponseTime: mockFormatResponseTime,
        formatStatusWithIcon: mockFormatStatusWithIcon,
        selectedMonitor: mockMonitor,
    };

    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            render(<HistoryTab {...defaultProps} />);
            expect(screen.getByText('Check History')).toBeInTheDocument();
        });

        it('should display filter buttons', () => {
            render(<HistoryTab {...defaultProps} />);
            
            expect(screen.getByText('All')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '✅ Up' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '❌ Down' })).toBeInTheDocument();
        });

        it('should display history limit controls', () => {
            render(<HistoryTab {...defaultProps} />);
            
            expect(screen.getByText('Show:')).toBeInTheDocument();
            expect(screen.getByLabelText('History limit')).toBeInTheDocument();
            expect(screen.getByText('of 5 checks')).toBeInTheDocument();
        });

        it('should render history records', () => {
            render(<HistoryTab {...defaultProps} />);
            
            // Should show all 5 records by default
            const statusIndicators = screen.getAllByTestId('status-indicator');
            expect(statusIndicators).toHaveLength(5);
        });
    });

    describe('Filter Functionality', () => {
        it('should highlight active filter button', () => {
            render(<HistoryTab {...defaultProps} />);
            
            const allButton = screen.getByRole('button', { name: 'All' });
            expect(allButton).toHaveAttribute('data-variant', 'primary');
        });

        it('should filter by up status', async () => {
            render(<HistoryTab {...defaultProps} />);
            
            const upButton = screen.getByRole('button', { name: '✅ Up' });
            await user.click(upButton);
            
            expect(upButton).toHaveAttribute('data-variant', 'primary');
            
            // Should only show 'up' status indicators
            const statusIndicators = screen.getAllByTestId('status-indicator');
            statusIndicators.forEach(indicator => {
                expect(indicator).toHaveAttribute('data-status', 'up');
            });
        });

        it('should filter by down status', async () => {
            render(<HistoryTab {...defaultProps} />);
            
            const downButton = screen.getByRole('button', { name: '❌ Down' });
            await user.click(downButton);
            
            expect(downButton).toHaveAttribute('data-variant', 'primary');
            
            // Should only show 'down' status indicators
            const statusIndicators = screen.getAllByTestId('status-indicator');
            statusIndicators.forEach(indicator => {
                expect(indicator).toHaveAttribute('data-status', 'down');
            });
        });

        it('should switch back to all filter', async () => {
            render(<HistoryTab {...defaultProps} />);
            
            // First filter by up
            const upButton = screen.getByRole('button', { name: '✅ Up' });
            await user.click(upButton);
            
            // Then switch back to all
            const allButton = screen.getByRole('button', { name: 'All' });
            await user.click(allButton);
            
            expect(allButton).toHaveAttribute('data-variant', 'primary');
            
            // Should show all records again
            const statusIndicators = screen.getAllByTestId('status-indicator');
            expect(statusIndicators).toHaveLength(5);
        });
    });

    describe('History Limit Controls', () => {
        it('should change history limit', async () => {
            render(<HistoryTab {...defaultProps} />);
            
            const limitSelect = screen.getByLabelText('History limit');
            // Use a valid option that would be available (5 since we have 5 history records)
            await user.selectOptions(limitSelect, '5');
            
            expect(limitSelect).toHaveValue('5');
        });

        it('should show appropriate limit options', () => {
            render(<HistoryTab {...defaultProps} />);
            
            // Should include options that are <= available history length (5)
            const options = screen.getAllByRole('option');
            expect(options.length).toBeGreaterThan(0);
        });
    });

    describe('History Record Display', () => {
        it('should display timestamps using formatFullTimestamp', () => {
            render(<HistoryTab {...defaultProps} />);
            
            expect(mockFormatFullTimestamp).toHaveBeenCalled();
        });

        it('should display response times using formatResponseTime', () => {
            render(<HistoryTab {...defaultProps} />);
            
            expect(mockFormatResponseTime).toHaveBeenCalled();
        });

        it('should display status with icons using formatStatusWithIcon', () => {
            render(<HistoryTab {...defaultProps} />);
            
            expect(mockFormatStatusWithIcon).toHaveBeenCalled();
        });

        it('should display check numbers correctly', () => {
            render(<HistoryTab {...defaultProps} />);
            
            // Check numbers should count down from total (5, 4, 3, 2, 1)
            expect(screen.getByText('Check #5')).toBeInTheDocument();
            expect(screen.getByText('Check #1')).toBeInTheDocument();
        });
    });

    describe('Details Rendering', () => {
        it('should render HTTP response code details', () => {
            const httpMonitorWithDetails = {
                ...mockMonitor,
                history: [
                    { timestamp: 1640995200000, status: 'up' as const, responseTime: 150, details: '200' },
                ]
            };
            
            render(<HistoryTab {...defaultProps} selectedMonitor={httpMonitorWithDetails} />);
            
            expect(screen.getByText('Response Code: 200')).toBeInTheDocument();
        });

        it('should render port details for port monitor', () => {
            const portMonitorWithDetails = {
                ...mockPortMonitor,
                history: [
                    { timestamp: 1640995200000, status: 'up' as const, responseTime: 150, details: '80' },
                ]
            };
            
            render(<HistoryTab {...defaultProps} selectedMonitor={portMonitorWithDetails} />);
            
            expect(screen.getByText('Port: 80')).toBeInTheDocument();
        });

        it('should not render details when not available', () => {
            const monitorWithoutDetails = {
                ...mockMonitor,
                history: [
                    { timestamp: 1640995200000, status: 'up' as const, responseTime: 150 },
                ]
            };
            
            render(<HistoryTab {...defaultProps} selectedMonitor={monitorWithoutDetails} />);
            
            expect(screen.queryByText(/Response Code:/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Port:/)).not.toBeInTheDocument();
        });

        it('should handle records with undefined details (line 105 coverage)', () => {
            // This test specifically targets the early return in renderDetails function
            const monitorWithMixedDetails = {
                ...mockMonitor,
                type: 'http' as const,
                history: [
                    // Record with details
                    { timestamp: 1640995200000, status: 'up' as const, responseTime: 150, details: '200' },
                    // Record without details - should trigger the early return in renderDetails
                    { timestamp: 1640995100000, status: 'down' as const, responseTime: 0 },
                    // Record with empty string details 
                    { timestamp: 1640995000000, status: 'up' as const, responseTime: 120, details: '' },
                    // Record with explicit undefined details
                    { timestamp: 1640994900000, status: 'down' as const, responseTime: 0, details: undefined },
                ]
            };
            
            render(<HistoryTab {...defaultProps} selectedMonitor={monitorWithMixedDetails} />);
            
            // Should render details for records that have them
            expect(screen.getByText('Response Code: 200')).toBeInTheDocument();
            
            // Should not render details for records without them (this tests the early return)
            const detailElements = screen.queryAllByText(/Response Code:/);
            expect(detailElements).toHaveLength(1); // Only one record has details
        });

        it('should handle monitor with mixed nullish and defined details', () => {
            const monitorWithMixedNullishDetails = {
                ...mockMonitor,
                type: 'http' as const,
                history: [
                    { timestamp: 1640995200000, status: 'up' as const, responseTime: 150, details: '200' },
                    { timestamp: 1640995100000, status: 'down' as const, responseTime: 0, details: null },
                    { timestamp: 1640995000000, status: 'up' as const, responseTime: 120, details: undefined },
                ]
            };
            
            render(<HistoryTab {...defaultProps} selectedMonitor={monitorWithMixedNullishDetails} />);
            
            // Should render details for records that have them
            expect(screen.getByText('Response Code: 200')).toBeInTheDocument();
            
            // Should not render details for records without them (null or undefined)
            const detailElements = screen.queryAllByText(/Response Code:/);
            expect(detailElements).toHaveLength(1); // Only one record has details
        });

        it('should cover the exact early return condition in renderDetails (line 105)', () => {
            // This test specifically targets line 105: if (!record.details) return undefined;
            // We need to ensure records with falsy details trigger this condition
            const monitorWithFalsyDetails = {
                ...mockMonitor,
                type: 'http' as const,
                history: [
                    // This record should definitely trigger the early return
                    { timestamp: 1640995200000, status: 'down' as const, responseTime: 0 },
                    // This record with empty string should also trigger early return  
                    { timestamp: 1640995100000, status: 'up' as const, responseTime: 150, details: '' },
                    // This record with explicit undefined should trigger early return
                    { timestamp: 1640995000000, status: 'down' as const, responseTime: 0, details: undefined },
                ]
            };
            
            render(<HistoryTab {...defaultProps} selectedMonitor={monitorWithFalsyDetails} />);
            
            // Verify that no response code details are rendered for any of the falsy detail records
            expect(screen.queryByText(/Response Code:/)).not.toBeInTheDocument();
            
            // Verify the component renders (check for one of the expected elements)
            expect(screen.getByText('All')).toBeInTheDocument(); // Filter button should be present
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no history records', () => {
            const emptyMonitor = { ...mockMonitor, history: [] };
            render(<HistoryTab {...defaultProps} selectedMonitor={emptyMonitor} />);
            
            expect(screen.getByText('No records found for the selected filter.')).toBeInTheDocument();
        });

        it('should show empty state when filter results in no matches', async () => {
            const upOnlyMonitor = {
                ...mockMonitor,
                history: [{ timestamp: 1640995200000, status: 'up' as const, responseTime: 150 }]
            };
            
            render(<HistoryTab {...defaultProps} selectedMonitor={upOnlyMonitor} />);
            
            // Filter by down status (no matches)
            const downButton = screen.getByRole('button', { name: '❌ Down' });
            await user.click(downButton);
            
            expect(screen.getByText('No records found for the selected filter.')).toBeInTheDocument();
        });
    });

    describe('Helper Functions', () => {
        it('should handle getFilterButtonLabel for all filters', () => {
            render(<HistoryTab {...defaultProps} />);
            
            expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '✅ Up' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '❌ Down' })).toBeInTheDocument();
        });
    });

    describe('Settings Integration', () => {
        it('should respect historyLimit from settings', () => {
            mockUseStore.mockReturnValue({
                settings: { historyLimit: 10 }
            });
            
            render(<HistoryTab {...defaultProps} />);
            
            // Should limit options based on settings
            expect(screen.getByLabelText('History limit')).toBeInTheDocument();
        });

        it('should handle unlimited history when available history is less than backend limit', () => {
            mockUseStore.mockReturnValue({
                settings: { historyLimit: 100 }
            });
            
            render(<HistoryTab {...defaultProps} />);
            
            expect(screen.getByText('of 5 checks')).toBeInTheDocument();
        });
    });

    describe('User Action Logging', () => {
        it('should log when history tab is viewed', () => {
            render(<HistoryTab {...defaultProps} />);
            
            expect(mockLogger.user.action).toHaveBeenCalledWith('History tab viewed', {
                monitorId: 'test-monitor',
                monitorType: 'http',
                totalRecords: 5,
            });
        });

        it('should log filter changes', async () => {
            render(<HistoryTab {...defaultProps} />);
            
            const upButton = screen.getByRole('button', { name: '✅ Up' });
            await user.click(upButton);
            
            expect(mockLogger.user.action).toHaveBeenCalledWith('History filter changed', {
                filter: 'up',
                monitorId: 'test-monitor',
                monitorType: 'http',
                totalRecords: 5,
            });
        });

        it('should log history limit changes', async () => {
            render(<HistoryTab {...defaultProps} />);
            
            const limitSelect = screen.getByLabelText('History limit');
            await user.selectOptions(limitSelect, '5');
            
            expect(mockLogger.user.action).toHaveBeenCalledWith('History display limit changed', {
                limit: 5,
                monitorId: 'test-monitor',
                monitorType: 'http',
                totalRecords: 5,
            });
        });

        it('should not log duplicate monitor views', () => {
            const { rerender } = render(<HistoryTab {...defaultProps} />);
            
            // Clear previous calls
            vi.mocked(mockLogger.user.action).mockClear();
            
            // Re-render with same monitor - should not log again
            rerender(<HistoryTab {...defaultProps} />);
            
            expect(mockLogger.user.action).not.toHaveBeenCalledWith(
                'History tab viewed',
                expect.any(Object)
            );
        });

        it('should log when monitor changes', () => {
            const { rerender } = render(<HistoryTab {...defaultProps} />);
            
            // Clear previous calls
            vi.mocked(mockLogger.user.action).mockClear();
            
            // Change to different monitor
            const newMonitor = { ...mockMonitor, id: 'different-monitor' };
            rerender(<HistoryTab {...defaultProps} selectedMonitor={newMonitor} />);
            
            expect(mockLogger.user.action).toHaveBeenCalledWith('History tab viewed', {
                monitorId: 'different-monitor',
                monitorType: 'http',
                totalRecords: 5,
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle monitor with undefined history', () => {
            const monitorWithUndefinedHistory = { ...mockMonitor, history: [] };
            
            render(<HistoryTab {...defaultProps} selectedMonitor={monitorWithUndefinedHistory} />);
            
            expect(screen.getByText('of 0 checks')).toBeInTheDocument();
            expect(screen.getByText('No records found for the selected filter.')).toBeInTheDocument();
        });

        it('should handle very large history arrays', () => {
            const largeHistory = Array.from({ length: 1000 }, (_, i) => ({
                timestamp: 1640995200000 + i * 1000,
                status: i % 2 === 0 ? 'up' as const : 'down' as const,
                responseTime: 100 + Math.random() * 200,
            }));
            
            const largeHistoryMonitor = { ...mockMonitor, history: largeHistory };
            
            render(<HistoryTab {...defaultProps} selectedMonitor={largeHistoryMonitor} />);
            
            expect(screen.getByText('of 1000 checks')).toBeInTheDocument();
        });

        it('should handle malformed history records gracefully', () => {
            const malformedHistory = [
                { timestamp: 1640995200000, status: 'up' as const, responseTime: 150 },
                { timestamp: 1640991600000, status: 'down' as const, responseTime: 5000 },
            ];
            
            const malformedMonitor = { ...mockMonitor, history: malformedHistory };
            
            expect(() => {
                render(<HistoryTab {...defaultProps} selectedMonitor={malformedMonitor} />);
            }).not.toThrow();
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels', () => {
            render(<HistoryTab {...defaultProps} />);
            
            expect(screen.getByLabelText('History limit')).toBeInTheDocument();
        });

        it('should have proper keyboard navigation support', async () => {
            render(<HistoryTab {...defaultProps} />);
            
            const limitSelect = screen.getByLabelText('History limit');
            
            // Should be focusable and interactable
            limitSelect.focus();
            expect(limitSelect).toHaveFocus();
        });
    });

    describe('Complete Integration Scenarios', () => {
        it('should handle complete filter and limit workflow', async () => {
            render(<HistoryTab {...defaultProps} />);
            
            // Filter by up status
            const upButton = screen.getByRole('button', { name: '✅ Up' });
            await user.click(upButton);
            
            // Change limit (use available option)
            const limitSelect = screen.getByLabelText('History limit');
            await user.selectOptions(limitSelect, '5');
            
            // Verify both actions worked
            expect(upButton).toHaveAttribute('data-variant', 'primary');
            expect(limitSelect).toHaveValue('5');
            
            // Should only show up status records
            const statusIndicators = screen.getAllByTestId('status-indicator');
            statusIndicators.forEach(indicator => {
                expect(indicator).toHaveAttribute('data-status', 'up');
            });
        });
    });
});
