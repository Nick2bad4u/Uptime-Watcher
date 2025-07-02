/**
 * Submit Function Edge Cases Tests
 * Tests for edge cases and error scenarios in Submit handleSubmit function
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSubmit } from '../components/AddSiteForm/Submit';
import logger from '../services/logger';

// Mock the logger
vi.mock('../services/logger', () => ({
    default: {
        app: {
            error: vi.fn(),
            performance: vi.fn(),
            started: vi.fn(),
            stopped: vi.fn(),
        },
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        raw: {} as Record<string, unknown>,
        silly: vi.fn(),
        site: {
            added: vi.fn(),
            check: vi.fn(),
            error: vi.fn(),
            removed: vi.fn(),
            statusChange: vi.fn(),
        },
        system: {
            notification: vi.fn(),
            tray: vi.fn(),
            window: vi.fn(),
        },
        user: {
            action: vi.fn(),
            settingsChange: vi.fn(),
        },
        verbose: vi.fn(),
        warn: vi.fn(),
    },
}));

describe('Submit Edge Cases', () => {
    const mockCreateSite = vi.fn();
    const mockAddMonitorToSite = vi.fn();
    const mockOnSuccess = vi.fn();
    const mockSetFormError = vi.fn();
    const mockClearError = vi.fn();
    const mockGenerateUuid = vi.fn(() => 'test-uuid');

    const mockEvent = {
        preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('handleSubmit edge cases', () => {
        it('should handle error during site creation', async () => {
            const props = {
                // Form state
                url: 'https://example.com',
                host: 'example.com',
                port: '443',
                name: 'Test Site',
                monitorType: 'http' as const,
                checkInterval: 60000,
                siteId: 'test-site-id',
                addMode: 'new' as const,
                selectedExistingSite: '',
                formError: undefined,
                
                // Actions
                setFormError: mockSetFormError,
                
                // Store actions
                createSite: mockCreateSite,
                addMonitorToSite: mockAddMonitorToSite,
                clearError: mockClearError,
                
                // Dependencies
                generateUuid: mockGenerateUuid,
                logger: logger,
                onSuccess: mockOnSuccess,
            };

            const error = new Error('Network error');
            mockCreateSite.mockRejectedValue(error);

            await handleSubmit(mockEvent, props);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockClearError).toHaveBeenCalled();
            expect(logger.error).toHaveBeenCalledWith('Failed to add site/monitor from form', error);
            expect(mockSetFormError).toHaveBeenCalledWith('Failed to add site/monitor. Please try again.');
        });

        it('should handle adding monitor to existing site', async () => {
            const props = {
                // Form state
                url: 'https://example.com',
                host: 'example.com',
                port: '80',
                name: 'Test Site',
                monitorType: 'http' as const,
                checkInterval: 30000,
                siteId: 'new-site-id',
                addMode: 'existing' as const,
                selectedExistingSite: 'existing-site-id',
                formError: undefined,
                
                // Actions
                setFormError: mockSetFormError,
                
                // Store actions
                createSite: mockCreateSite,
                addMonitorToSite: mockAddMonitorToSite,
                clearError: mockClearError,
                
                // Dependencies
                generateUuid: mockGenerateUuid,
                logger: logger,
                onSuccess: mockOnSuccess,
            };

            mockAddMonitorToSite.mockResolvedValue(undefined);

            await handleSubmit(mockEvent, props);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockClearError).toHaveBeenCalled();
            expect(mockAddMonitorToSite).toHaveBeenCalledWith(
                'existing-site-id',
                expect.objectContaining({
                    type: 'http',
                    url: 'https://example.com',
                    checkInterval: 30000,
                })
            );

            expect(logger.info).toHaveBeenCalledWith(
                'Monitor added to site successfully',
                expect.objectContaining({
                    identifier: 'existing-site-id',
                    monitorType: 'http',
                })
            );

            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });
});
