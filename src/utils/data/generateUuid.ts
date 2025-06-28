/**
 * Utility function for generating unique identifiers.
 * Uses crypto.randomUUID when available, falls back to custom implementation.
 */

/**
 * Generate a unique identifier string.
 * Uses the browser's crypto.randomUUID() when available for better entropy,
 * otherwise falls back to a custom implementation using Math.random() and timestamp.
 *
 * @returns A unique identifier string (UUID format when crypto is available)
 * @example
 * ```typescript
 * const id = generateUuid();
 * // Returns: "123e4567-e89b-12d3-a456-426614174000" (crypto.randomUUID)
 * // Or: "site-ab3d5ef2-1640995200000" (fallback)
 * ```
 */
export function generateUuid(): string {
    return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `site-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
}
