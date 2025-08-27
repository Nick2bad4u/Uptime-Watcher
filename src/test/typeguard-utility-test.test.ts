/**
 * Simple utility coverage test with typeGuards imports.
 */

import { describe, expect, it } from 'vitest';
import { hasProperties, hasProperty, isArray } from '../../shared/utils/typeGuards';

describe('TypeGuard Utility Coverage Test', () => {
    it('should test typeguard functions', () => {
        const testObj = { test: 'value' };
        const testArray = [1, 2, 3];

        expect(hasProperties(testObj, ['test'])).toBe(true);
        expect(hasProperty(testObj, 'test')).toBe(true);
        expect(isArray(testArray)).toBe(true);
    });
});
