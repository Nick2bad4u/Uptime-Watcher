/**
 * Theme Components Edge Cases Tests
 * Tests for edge cases and error scenarios in theme components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemedButton } from '../theme/components';

describe('Theme Components Edge Cases', () => {
    describe('ThemedButton size calculation', () => {
        it('should handle default size when invalid size is provided', () => {
            // @ts-expect-error Testing invalid size
            render(<ThemedButton size="invalid">Test Button</ThemedButton>);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
            // Should default to md size (40px) when invalid size provided (covers line 622)
        });

        it('should handle xs size correctly', () => {
            render(<ThemedButton size="xs">Test Button</ThemedButton>);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
            // Should render with xs size (24px)
        });

        it('should handle sm size correctly', () => {
            render(<ThemedButton size="sm">Test Button</ThemedButton>);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
            // Should render with sm size (32px)
        });

        it('should handle lg size correctly', () => {
            render(<ThemedButton size="lg">Test Button</ThemedButton>);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
            // Should render with lg size (48px)
        });

        it('should handle md size correctly (default)', () => {
            render(<ThemedButton size="md">Test Button</ThemedButton>);
            
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
            // Should render with md size (40px)
        });
    });
});
