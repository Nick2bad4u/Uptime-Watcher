/**
 * Tests for Submit.tsx uncovered scenarios and validation logic
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import validator from 'validator';
import { handleSubmit } from '../components/AddSiteForm/Submit';
import type { AddSiteFormState, AddSiteFormActions } from '../components/AddSiteForm/useAddSiteForm';

// Mock electron-log to prevent initialization warning
vi.mock('electron-log', () => ({
    default: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock validator
vi.mock('validator', () => ({
    default: {
        isIP: vi.fn(),
        isFQDN: vi.fn(),
        isPort: vi.fn(),
        isURL: vi.fn(),
    },
}));

// Mock UUID generation
const mockGenerateUuid = vi.fn();

// Mock logger
const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
};

describe('Submit.tsx - Uncovered Lines Coverage', () => {
    let mockEvent: React.FormEvent;
    let mockFormState: AddSiteFormState;
    let mockFormActions: Pick<AddSiteFormActions, "setFormError">;
    let mockStoreActions: any;
    let mockOnSuccess: any;

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Reset validator mocks to default false
        vi.mocked(validator.isIP).mockReturnValue(false);
        vi.mocked(validator.isFQDN).mockReturnValue(false);
        vi.mocked(validator.isPort).mockReturnValue(false);
        vi.mocked(validator.isURL).mockReturnValue(false);
        
        mockEvent = {
            preventDefault: vi.fn(),
        } as any;

        mockFormState = {
            addMode: 'new',
            checkInterval: 30000,
            host: '',
            monitorType: 'http',
            name: 'Test Site',
            port: '',
            selectedExistingSite: '',
            url: 'https://example.com',
            siteId: 'test-site-id',
            formError: undefined,
        };

        mockFormActions = {
            setFormError: vi.fn(),
        };

        mockStoreActions = {
            addMonitorToSite: vi.fn().mockResolvedValue(undefined),
            clearError: vi.fn(),
            createSite: vi.fn().mockResolvedValue(undefined),
        };

        mockOnSuccess = vi.fn();

        mockGenerateUuid.mockReturnValue('test-uuid-123');
    });

    const createProps = (overrides = {}) => ({
        ...mockFormState,
        ...mockFormActions,
        ...mockStoreActions,
        generateUuid: mockGenerateUuid,
        logger: mockLogger,
        onSuccess: mockOnSuccess,
        ...overrides,
    });

    describe('HTTP Monitor Validation', () => {
        it('should validate HTTP monitor with invalid URL format', async () => {
            const validator = await import('validator');
            (validator.default.isURL as any).mockReturnValue(false);

            const props = createProps({
                monitorType: 'http',
                url: 'invalid-url',
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).toHaveBeenCalledWith('HTTP monitor requires a URL starting with http:// or https://');
            expect(mockStoreActions.createSite).not.toHaveBeenCalled();
        });

        it('should validate HTTP monitor with non-HTTP protocol', async () => {
            const validator = await import('validator');
            (validator.default.isURL as any).mockReturnValue(true);

            const props = createProps({
                monitorType: 'http',
                url: 'ftp://example.com',
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).toHaveBeenCalledWith('HTTP monitor requires a URL starting with http:// or https://');
            expect(mockStoreActions.createSite).not.toHaveBeenCalled();
        });

        it('should validate HTTP monitor missing URL', async () => {
            const props = createProps({
                monitorType: 'http',
                url: '',
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Website URL is required for HTTP monitor');
            expect(mockStoreActions.createSite).not.toHaveBeenCalled();
        });
    });

    describe('Port Monitor Validation', () => {
        it('should validate port monitor with missing host', async () => {
            const props = createProps({
                monitorType: 'port',
                host: '',
                port: '8080',
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Host is required for port monitor');
            expect(mockStoreActions.createSite).not.toHaveBeenCalled();
        });

        it('should validate port monitor with invalid IP and domain', async () => {
            const validator = await import('validator');
            (validator.default.isIP as any).mockReturnValue(false);
            (validator.default.isFQDN as any).mockReturnValue(false);

            const props = createProps({
                monitorType: 'port',
                host: 'invalid-host',
                port: '8080',
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Host must be a valid IP address or domain name');
            expect(mockStoreActions.createSite).not.toHaveBeenCalled();
        });

        it('should validate port monitor with missing port', async () => {
            const validator = await import('validator');
            (validator.default.isIP as any).mockReturnValue(true);

            const props = createProps({
                monitorType: 'port',
                host: '127.0.0.1',
                port: '',
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Port is required for port monitor');
            expect(mockStoreActions.createSite).not.toHaveBeenCalled();
        });

        it('should validate port monitor with invalid port number', async () => {
            const validator = await import('validator');
            (validator.default.isIP as any).mockReturnValue(true);
            (validator.default.isPort as any).mockReturnValue(false);

            const props = createProps({
                monitorType: 'port',
                host: '127.0.0.1',
                port: '99999',
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Port must be a valid port number (1-65535)');
            expect(mockStoreActions.createSite).not.toHaveBeenCalled();
        });

        it('should accept valid IP address for port monitor', async () => {
            // Set up mocks for valid IP validation
            vi.mocked(validator.isIP).mockReturnValue(true);
            vi.mocked(validator.isFQDN).mockReturnValue(false);
            vi.mocked(validator.isPort).mockReturnValue(true);

            const props = createProps({
                monitorType: 'port',
                host: '127.0.0.1',
                port: '8080',
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).not.toHaveBeenCalledWith(expect.stringContaining('Host must be a valid'));
            expect(mockStoreActions.createSite).toHaveBeenCalled();
        });

        it('should accept valid domain for port monitor', async () => {
            // Set up mocks for valid domain validation
            vi.mocked(validator.isIP).mockReturnValue(false);
            vi.mocked(validator.isFQDN).mockReturnValue(true);
            vi.mocked(validator.isPort).mockReturnValue(true);

            const props = createProps({
                monitorType: 'port',
                host: 'example.com',
                port: '8080',
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).not.toHaveBeenCalledWith(expect.stringContaining('Host must be a valid'));
            expect(mockStoreActions.createSite).toHaveBeenCalled();
        });
    });

    describe('Add Mode Validation', () => {
        it('should validate new site mode with missing name', async () => {
            const props = createProps({
                addMode: 'new',
                name: '',
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Site name is required');
            expect(mockStoreActions.createSite).not.toHaveBeenCalled();
        });

        it('should validate new site mode with whitespace-only name', async () => {
            const props = createProps({
                addMode: 'new',
                name: '   ',
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Site name is required');
            expect(mockStoreActions.createSite).not.toHaveBeenCalled();
        });

        it('should validate existing site mode with missing selection', async () => {
            const props = createProps({
                addMode: 'existing',
                selectedExistingSite: '',
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Please select a site to add the monitor to');
            expect(mockStoreActions.addMonitorToSite).not.toHaveBeenCalled();
        });
    });

    describe('Check Interval Validation', () => {
        it('should validate missing check interval', async () => {
            // Set up mocks to make port validation pass
            vi.mocked(validator.isIP).mockReturnValue(true);
            vi.mocked(validator.isPort).mockReturnValue(true);

            const props = createProps({
                monitorType: 'port',
                host: '127.0.0.1',
                port: '8080',
                checkInterval: 0,
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Check interval must be a positive number');
            expect(mockStoreActions.createSite).not.toHaveBeenCalled();
        });

        it('should validate negative check interval', async () => {
            // Set up mocks to make port validation pass
            vi.mocked(validator.isIP).mockReturnValue(true);
            vi.mocked(validator.isPort).mockReturnValue(true);

            const props = createProps({
                monitorType: 'port',
                host: '127.0.0.1',
                port: '8080',
                checkInterval: -1,
            });

            await handleSubmit(mockEvent, props);

            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Check interval must be a positive number');
            expect(mockStoreActions.createSite).not.toHaveBeenCalled();
        });
    });

    describe('Successful Submissions', () => {
        it('should handle successful new site creation', async () => {
            const validator = await import('validator');
            (validator.default.isURL as any).mockReturnValue(true);

            const props = createProps({
                addMode: 'new',
                monitorType: 'http',
                name: 'Test Site',
                url: 'https://example.com',
                checkInterval: 30000,
            });

            await handleSubmit(mockEvent, props);

            expect(mockStoreActions.clearError).toHaveBeenCalled();
            expect(mockStoreActions.createSite).toHaveBeenCalledWith({
                identifier: 'test-site-id',
                name: 'Test Site',
                monitors: [{
                    id: 'test-uuid-123',
                    type: 'http',
                    url: 'https://example.com',
                    checkInterval: 30000,
                    timeout: 10000,
                    retryAttempts: 0,
                    status: 'pending',
                    history: [],
                }],
            });
            expect(mockOnSuccess).toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining('Successfully created site: test-site-id')
            );
        });

        it('should handle successful monitor addition to existing site', async () => {
            const validator = await import('validator');
            (validator.default.isURL as any).mockReturnValue(true);

            const props = createProps({
                addMode: 'existing',
                selectedExistingSite: 'existing-site-id',
                monitorType: 'http',
                url: 'https://example.com',
                checkInterval: 30000,
            });

            await handleSubmit(mockEvent, props);

            expect(mockStoreActions.clearError).toHaveBeenCalled();
            expect(mockStoreActions.addMonitorToSite).toHaveBeenCalledWith(
                'existing-site-id',
                expect.objectContaining({
                    id: 'test-uuid-123',
                    type: 'http',
                    url: 'https://example.com',
                }),
            );
            expect(mockOnSuccess).toHaveBeenCalled();
            expect(mockLogger.info).toHaveBeenCalledWith(
                expect.stringContaining('Successfully added monitor: existing-site-id')
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle createSite error', async () => {
            const validator = await import('validator');
            (validator.default.isURL as any).mockReturnValue(true);

            const error = new Error('Database error');
            mockStoreActions.createSite.mockRejectedValue(error);

            const props = createProps({
                addMode: 'new',
                name: 'Test Site',
                url: 'https://example.com',
            });

            await handleSubmit(mockEvent, props);

            expect(mockLogger.error).toHaveBeenCalledWith('Failed to add site/monitor from form', error);
            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Failed to add site/monitor. Please try again.');
        });

        it('should handle addMonitorToSite error', async () => {
            const validator = await import('validator');
            (validator.default.isURL as any).mockReturnValue(true);

            const error = new Error('Network error');
            mockStoreActions.addMonitorToSite.mockRejectedValue(error);

            const props = createProps({
                addMode: 'existing',
                selectedExistingSite: 'existing-site-id',
                url: 'https://example.com',
            });

            await handleSubmit(mockEvent, props);

            expect(mockLogger.error).toHaveBeenCalledWith('Failed to add site/monitor from form', error);
            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Failed to add site/monitor. Please try again.');
        });

        it('should handle non-Error objects thrown', async () => {
            const validator = await import('validator');
            (validator.default.isURL as any).mockReturnValue(true);

            const errorString = 'String error';
            mockStoreActions.createSite.mockRejectedValue(errorString);

            const props = createProps({
                addMode: 'new',
                name: 'Test Site',
                url: 'https://example.com',
            });

            await handleSubmit(mockEvent, props);

            expect(mockLogger.error).toHaveBeenCalledWith(
                'Failed to add site/monitor from form', 
                new Error('String error')
            );
            expect(mockFormActions.setFormError).toHaveBeenCalledWith('Failed to add site/monitor. Please try again.');
        });
    });

    describe('Logging and Debug Information', () => {
        it('should log submission start with debug information', async () => {
            const validator = await import('validator');
            (validator.default.isURL as any).mockReturnValue(true);

            const props = createProps({
                addMode: 'new',
                name: 'Test Site',
                url: 'https://example.com',
                host: 'test-host',
                port: '8080',
            });

            await handleSubmit(mockEvent, props);

            expect(mockLogger.debug).toHaveBeenCalledWith('Form submission started', {
                addMode: 'new',
                hasHost: true,
                hasName: true,
                hasPort: true,
                hasUrl: true,
                monitorType: 'http',
                selectedExistingSite: false,
            });
        });

        it('should log validation failures with detailed information', async () => {
            const props = createProps({
                addMode: 'new',
                name: '',
                url: '',
                checkInterval: 0,
            });

            await handleSubmit(mockEvent, props);

            expect(mockLogger.debug).toHaveBeenCalledWith('Form validation failed', {
                errors: expect.arrayContaining([
                    'Site name is required',
                    'Website URL is required for HTTP monitor',
                    'Check interval must be a positive number',
                ]),
                formData: {
                    addMode: 'new',
                    checkInterval: 0,
                    host: '',
                    monitorType: 'http',
                    name: '',
                    port: '',
                    url: '',
                },
            });
        });

        it('should log successful monitor addition with details', async () => {
            const validator = await import('validator');
            (validator.default.isURL as any).mockReturnValue(true);

            const props = createProps({
                addMode: 'existing',
                selectedExistingSite: 'existing-site-id',
                url: 'https://example.com',
            });

            await handleSubmit(mockEvent, props);

            expect(mockLogger.info).toHaveBeenCalledWith('Monitor added to site successfully', {
                identifier: 'existing-site-id',
                monitorId: 'test-uuid-123',
                monitorType: 'http',
            });
        });

        it('should truncate sensitive data in debug logs', async () => {
            const longData = 'a'.repeat(100);
            const props = createProps({
                name: longData,
                url: longData,
                host: longData,
                checkInterval: 0,
            });

            await handleSubmit(mockEvent, props);

            expect(mockLogger.debug).toHaveBeenCalledWith('Form validation failed', {
                errors: expect.any(Array),
                formData: expect.objectContaining({
                    name: longData.slice(0, 50),
                    url: longData.slice(0, 50),
                    host: longData.slice(0, 50),
                }),
            });
        });
    });

    describe('Monitor Creation', () => {
        it('should create HTTP monitor with default values', async () => {
            const validator = await import('validator');
            (validator.default.isURL as any).mockReturnValue(true);

            const props = createProps({
                addMode: 'new',
                name: 'Test Site',
                monitorType: 'http',
                url: 'https://example.com',
                checkInterval: 60000,
            });

            await handleSubmit(mockEvent, props);

            expect(mockStoreActions.createSite).toHaveBeenCalledWith({
                identifier: 'test-site-id',
                name: 'Test Site',
                monitors: [{
                    id: 'test-uuid-123',
                    type: 'http',
                    url: 'https://example.com',
                    checkInterval: 60000,
                    timeout: 10000,
                    retryAttempts: 0,
                    status: 'pending',
                    history: [],
                }],
            });
        });

        it('should create port monitor with all fields', async () => {
            const validator = await import('validator');
            (validator.default.isIP as any).mockReturnValue(true);
            (validator.default.isPort as any).mockReturnValue(true);

            const props = createProps({
                addMode: 'new',
                name: 'Test Site',
                monitorType: 'port',
                host: '127.0.0.1',
                port: '8080',
                checkInterval: 30000,
            });

            await handleSubmit(mockEvent, props);

            expect(mockStoreActions.createSite).toHaveBeenCalledWith({
                identifier: 'test-site-id',
                name: 'Test Site',
                monitors: [{
                    id: 'test-uuid-123',
                    type: 'port',
                    host: '127.0.0.1',
                    port: 8080,
                    checkInterval: 30000,
                    timeout: 10000,
                    retryAttempts: 0,
                    status: 'pending',
                    history: [],
                }],
            });
        });
    });
});
