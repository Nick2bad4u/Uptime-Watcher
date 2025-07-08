/**
 * Tests for main.tsx error handling scenarios
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('main.tsx Error Handling', () => {
    let originalDocument: Document;
    let mockQuerySelector: any;

    beforeEach(() => {
        originalDocument = global.document;
        mockQuerySelector = vi.fn();
        
        // Create a mock document with querySelector
        global.document = {
            ...originalDocument,
            querySelector: mockQuerySelector,
        } as any;
    });

    afterEach(() => {
        global.document = originalDocument;
        vi.clearAllMocks();
    });

    it('should throw error when root element is not found (lines 18-19)', async () => {
        // Mock querySelector to return null (no root element found)
        mockQuerySelector.mockReturnValue(null);

        // Expect the import to throw an error
        await expect(async () => {
            // We need to force reimport of main.tsx to trigger the code
            delete require.cache[require.resolve('../main')];
            await import('../main');
        }).rejects.toThrow('Root element not found');

        expect(mockQuerySelector).toHaveBeenCalledWith('#root');
    });
});
