/**
 * Tests for main.tsx error handling scenarios
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock("../services/logger", () => ({
    default: {
        error: vi.fn(),
        user: {
            action: vi.fn(),
            settingsChange: vi.fn(),
        },
        warn: vi.fn(),
    },
}));

describe('main.tsx Error Handling', () => {
    let originalDocument: Document;
    let mockQuerySelector: any;
    let mockCreateElement: any;

    beforeEach(() => {
        originalDocument = global.document;
        mockQuerySelector = vi.fn();
        mockCreateElement = vi.fn();
        
        // Create a mock element with all necessary methods
        const mockElement = {
            setAttribute: vi.fn(),
            appendChild: vi.fn(),
            innerHTML: '',
            id: '',
            className: '',
            style: {},
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            click: vi.fn(),
            focus: vi.fn(),
            blur: vi.fn(),
        };
        
        // Create a more complete mock document
        global.document = {
            querySelector: mockQuerySelector,
            createElement: mockCreateElement.mockReturnValue(mockElement),
            head: { appendChild: vi.fn() },
            body: { appendChild: vi.fn() },
            getElementById: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        } as any;

        // Clear the module cache to ensure fresh imports
        vi.resetModules();
    });

    afterEach(() => {
        global.document = originalDocument;
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('should throw error when root element is not found (lines 18-19)', async () => {
        // Mock querySelector to return null (no root element found)
        mockQuerySelector.mockReturnValue(null);

        // Use dynamic import to catch the error during module initialization
        await expect(async () => {
            await import('../main');
        }).rejects.toThrow('Root element not found');
        
        expect(mockQuerySelector).toHaveBeenCalledWith('#root');
    });
});
