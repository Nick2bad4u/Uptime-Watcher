/**
 * Type-safe testing utilities using type-fest for better test type safety.
 *
 * @remarks
 * Provides utilities for creating test objects with better type safety than 'as
 * any' patterns. Uses type-fest utilities to create partial objects, mock data,
 * and invalid data for testing scenarios.
 */

import type { PartialDeep, SetOptional, Except } from "type-fest";

/**
 * Create a partial test object with type safety.
 *
 * @param data - Partial data for testing
 *
 * @returns Type-safe partial object
 */
export function createPartialTestData<T>(data: PartialDeep<T>): PartialDeep<T> {
    return data;
}

/**
 * Create a test object with specific fields made optional.
 *
 * @param data - Test data with optional fields
 *
 * @returns Type-safe object with optional fields
 */
export function createOptionalTestData<T, K extends keyof T>(
    data: SetOptional<T, K>
): SetOptional<T, K> {
    return data;
}

/**
 * Create a test object excluding specific fields.
 *
 * @param data - Test data without excluded fields
 *
 * @returns Type-safe object with excluded fields
 */
export function createExcludedTestData<T, K extends keyof T>(
    data: Except<T, K>
): Except<T, K> {
    return data;
}

/**
 * Type-safe mock data builder with fluent interface.
 */
export class MockDataBuilder<T> {
    private data: Partial<T> = {};

    /**
     * Add a field to the mock data.
     *
     * @param key - Field key
     * @param value - Field value
     *
     * @returns Builder instance for chaining
     */
    with<K extends keyof T>(key: K, value: T[K]): MockDataBuilder<T> {
        this.data[key] = value;
        return this;
    }

    /**
     * Add multiple fields to the mock data.
     *
     * @param fields - Fields to add
     *
     * @returns Builder instance for chaining
     */
    withFields(fields: Partial<T>): MockDataBuilder<T> {
        Object.assign(this.data, fields);
        return this;
    }

    /**
     * Build the mock data object.
     *
     * @returns Partial mock data
     */
    build(): Partial<T> {
        return { ...this.data };
    }

    /**
     * Build the mock data as a specific type (requires all required fields).
     *
     * @returns Complete mock data
     */
    buildComplete(): T {
        return this.data as T;
    }
}

/**
 * Create a new mock data builder.
 *
 * @returns Mock data builder instance
 */
export function mockData<T>(): MockDataBuilder<T> {
    return new MockDataBuilder<T>();
}
