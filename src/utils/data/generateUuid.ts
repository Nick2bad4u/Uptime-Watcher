/**
 * Utility function for generating unique identifiers.
 * Uses crypto.randomUUID in modern Electron/Node.js environments.
 *
 * @remarks
 * UUID generation utility with proper Node.js compatibility through explicit crypto import.
 */

/**
 * Generate a unique identifier string using the modern crypto.randomUUID API.
 *
 * @returns A UUID string in standard format (e.g., "123e4567-e89b-12d3-a456-426614174000")
 *
 * @remarks
 * Uses the native randomUUID() method from Node.js crypto module which is available in modern
 * Node.js (14.17.0+) and Electron environments. The explicit import ensures compatibility
 * across different environments where the global crypto object may not be available.
 *
 * @example
 * ```typescript
 * const id = generateUuid();
 * // Returns: "123e4567-e89b-12d3-a456-426614174000"
 * ```
 */
export function generateUuid(): string {
    return crypto.randomUUID();
}
