/**
 * Common test utilities for reducing duplication in test files.
 *
 * @remarks
 * This module provides shared utilities for test annotation, mock event
 * creation, and other common testing patterns to reduce code duplication across
 * test files.
 *
 * @packageDocumentation
 */

import type React from "react";

/**
 * Standard test annotation helper for consistent test metadata.
 *
 * @remarks
 * Provides a standardized way to annotate tests with metadata, reducing
 * boilerplate across test files.
 *
 * @param task - Vitest task object
 * @param annotate - Vitest annotate function
 * @param component - Component name for annotation
 * @param category - Category for annotation (default: "Component")
 * @param type - Type for annotation (default: "Business Logic")
 */
export function standardTestAnnotation(
    task: { name: string },
    annotate: (message: string, type: string) => void,
    component: string,
    category = "Component",
    type = "Business Logic"
): void {
    annotate(`Testing: ${task.name}`, "functional");
    annotate(`Component: ${component}`, "component");
    annotate(`Category: ${category}`, "category");
    annotate(`Type: ${type}`, "type");
}

/**
 * Async version of standard test annotation helper for tests using await.
 *
 * @remarks
 * Provides the same standardized annotation as standardTestAnnotation but for
 * tests that require async annotation calls.
 *
 * @param task - Vitest task object
 * @param annotate - Vitest async annotate function
 * @param component - Component name for annotation
 * @param category - Category for annotation (default: "Component")
 * @param type - Type for annotation (default: "Business Logic")
 */
export async function standardTestAnnotationAsync(
    task: { name: string },
    annotate: (message: string, type?: string) => Promise<unknown> | unknown,
    component: string,
    category = "Component",
    type = "Business Logic"
): Promise<void> {
    await annotate(`Testing: ${task.name}`, "functional");
    await annotate(`Component: ${component}`, "component");
    await annotate(`Category: ${category}`, "category");
    await annotate(`Type: ${type}`, "type");
}

/**
 * Creates a mock change event for input elements.
 *
 * @remarks
 * Standardizes mock event creation for testing form inputs, reducing
 * duplication across test files.
 *
 * @param value - The input value for the mock event
 *
 * @returns Mock change event object
 */
export function createMockInputChangeEvent(
    value: string
): React.ChangeEvent<HTMLInputElement> {
    return {
        target: { value },
    } as React.ChangeEvent<HTMLInputElement>;
}

/**
 * Creates a mock change event for select elements.
 *
 * @remarks
 * Standardizes mock event creation for testing select inputs.
 *
 * @param value - The selected value for the mock event
 *
 * @returns Mock change event object
 */
export function createMockSelectChangeEvent(
    value: string
): React.ChangeEvent<HTMLSelectElement> {
    return {
        target: { value },
    } as React.ChangeEvent<HTMLSelectElement>;
}

/**
 * Creates a mock change event for checkbox elements.
 *
 * @remarks
 * Standardizes mock event creation for testing checkbox inputs.
 *
 * @param checked - The checked state for the mock event
 *
 * @returns Mock change event object
 */
export function createMockCheckboxChangeEvent(
    checked: boolean
): React.ChangeEvent<HTMLInputElement> {
    return {
        target: { checked },
    } as React.ChangeEvent<HTMLInputElement>;
}

/**
 * Batch test annotation helper for multiple annotations at once.
 *
 * @remarks
 * Allows setting multiple annotations in a single call to reduce repetitive
 * annotation calls in tests.
 *
 * @param annotate - Vitest annotate function
 * @param annotations - Object with annotation key-value pairs
 */
export function batchAnnotations(
    annotate: (message: string, type: string) => void,
    annotations: Record<string, string>
): void {
    for (const [type, message] of Object.entries(annotations)) {
        annotate(message, type);
    }
}
