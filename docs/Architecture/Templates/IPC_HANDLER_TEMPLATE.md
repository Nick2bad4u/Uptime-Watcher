---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
title: "IPC Handler Template"
summary: "Provides a template for implementing new IPC handlers aligned with the central IpcService, validation, and error-handling patterns."
created: "2025-08-05"
last_reviewed: "2025-12-11"
category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "template"
  - "ipc"
  - "electron"
---

# IPC Handler Template

## Table of Contents

1. [File Structure](#file-structure)
2. [Handler Implementation Template](#handler-implementation-template)
3. [Validation Functions Template](#validation-functions-template)
4. [Preload API Extension Template](#preload-api-extension-template)
5. [Type Definitions Template](#type-definitions-template)
6. [Test Template](#test-template)
7. [Integration Checklist](#integration-checklist)
8. [Channel Naming Convention](#channel-naming-convention)
9. [Current Implementation Audit (2025-11-04)](#current-implementation-audit-2025-11-04)
10. [Error Handling](#error-handling)

## File Structure

```text
electron/services/ipc/
├── IpcService.ts           # Main IPC service
├── utils.ts               # IPC utility functions
├── types.ts               # IPC type definitions
├── validators.ts          # Validation functions
└── handlers/              # Domain-specific handler modules
  └── *.ts
```

## Handler Implementation Template

````typescript

/**
 * IPC handlers for [DOMAIN] operations.
 *
 * @remarks
 * Provides type-safe IPC communication for [DOMAIN] management between the main
 * process and renderer process. All handlers use standardized validation and
 * error handling patterns.
 *
 * @public
 */

import type { IpcInvokeChannel } from "@shared/types/ipc";
import { EXAMPLE_CHANNELS } from "@shared/types/preload";
import { logger } from "../../utils/logger";

import { registerStandardizedIpcHandler } from "../utils";

// Import validation functions from validators.ts
import {
 isExampleCreateData,
 isExampleUpdateData,
 isExampleIdParams,
} from "../validators";

/**
 * Registers all [DOMAIN]-related IPC handlers.
 *
 * @remarks
 * This function registers all IPC handlers for [DOMAIN] operations using the
 * standardized registration pattern. Each handler includes proper validation
 * and error handling.
 *
 * @example
 *
 * ```typescript
 * registerExampleHandlers({
 *  exampleManager,
 *  registeredHandlers,
 * });
 * ```
 *
 * @public
 */
export function registerExampleHandlers(deps: {
  registeredHandlers: Set<IpcInvokeChannel>;
  exampleManager: ExampleManager;
}): void {
 const { exampleManager, registeredHandlers } = deps;

 // GET operations (no parameters)
 registerStandardizedIpcHandler(
  EXAMPLE_CHANNELS.getExamples,
  async (): Promise<Example[]> => {
   logger.debug("[IPC] Getting all examples");
   const examples = await exampleManager.getAllExamples();
   return examples;
  },
  null,
  registeredHandlers
 );

 // GET operations (with parameters)
 registerStandardizedIpcHandler(
  EXAMPLE_CHANNELS.getExampleById,
  async (params: ExampleIdParams): Promise<Example | undefined> => {
   logger.debug(`[IPC] Getting example by ID: ${params.id}`);
   const example = await exampleManager.getExampleById(params.id);
   return example;
  },
  isExampleIdParams,
  registeredHandlers
 );

 // CREATE operations
 registerStandardizedIpcHandler(
  EXAMPLE_CHANNELS.createExample,
  async (params: ExampleCreateData): Promise<Example> => {
   logger.debug(`[IPC] Creating example: ${params.name}`);
   const example = await exampleManager.createExample(params);
   return example;
  },
  isExampleCreateData,
  registeredHandlers
 );

 // UPDATE operations
 registerStandardizedIpcHandler(
  EXAMPLE_CHANNELS.updateExample,
  async (params: ExampleUpdateParams): Promise<void> => {
   logger.debug(`[IPC] Updating example: ${params.id}`);
   await exampleManager.updateExample(params.id, params.updates);
  },
  isExampleUpdateParams,
  registeredHandlers
 );

 // DELETE operations
 registerStandardizedIpcHandler(
  EXAMPLE_CHANNELS.deleteExample,
  async (params: ExampleIdParams): Promise<void> => {
   logger.debug(`[IPC] Deleting example: ${params.id}`);
   await exampleManager.deleteExample(params.id);
  },
  isExampleIdParams,
  registeredHandlers
 );

 // BULK operations
 registerStandardizedIpcHandler(
  EXAMPLE_CHANNELS.bulkCreateExamples,
  async (params: ExampleBulkCreateData): Promise<Example[]> => {
   logger.debug(`[IPC] Bulk creating ${params.examples.length} examples`);
   const examples = await exampleManager.bulkCreateExamples(params.examples);
   return examples;
  },
  isExampleBulkCreateData,
  registeredHandlers
 );

 // UTILITY operations
 registerStandardizedIpcHandler(
  EXAMPLE_CHANNELS.validateExampleData,
  async (params: ExampleValidationData): Promise<ValidationResult> => {
   logger.debug("[IPC] Validating example data");
   const result = await exampleManager.validateExampleData(params);
   return result;
  },
  isExampleValidationData,
  registeredHandlers
 );

 // EXPORT/IMPORT operations
 registerStandardizedIpcHandler(
  EXAMPLE_CHANNELS.exportExampleData,
  async (): Promise<ExportData> => {
   logger.debug("[IPC] Exporting example data");
   const exportData = await exampleManager.exportExamples();
   return exportData;
  },
  null,
  registeredHandlers
 );

 registerStandardizedIpcHandler(
  EXAMPLE_CHANNELS.importExampleData,
  async (params: ExampleImportData): Promise<ImportResult> => {
   logger.debug(
    `[IPC] Importing example data: ${params.examples.length} items`
   );
   const result = await exampleManager.importExamples(params.examples);
   return result;
  },
  isExampleImportData,
  registeredHandlers
 );

 logger.info("[IPC] Example handlers registered successfully");
}
````

## Validation Functions Template

Add validation functions to `validators.ts` or import them from `../validation/exampleValidation.ts`:

````typescript

/**
 * Validation functions for [DOMAIN] IPC operations.
 *
 * @remarks
 * Provides type-safe validation for all IPC parameters related to [DOMAIN]
 * operations. Each validation function ensures data integrity and type safety
 * before operations are performed.
 *
 * @public
 */

/**
 * Interface for example ID parameters.
 *
 * @public
 */
export interface ExampleIdParams {
 id: string;
}

/**
 * Interface for example creation data.
 *
 * @public
 */
export interface ExampleCreateData {
 name: string;
 description?: string;
 category: string;
 // Add other required fields
}

/**
 * Interface for example update parameters.
 *
 * @public
 */
export interface ExampleUpdateParams {
 id: string;
 updates: Partial<ExampleCreateData>;
}

/**
 * Interface for bulk creation data.
 *
 * @public
 */
export interface ExampleBulkCreateData {
 examples: ExampleCreateData[];
}

/**
 * Interface for validation data.
 *
 * @public
 */
export interface ExampleValidationData {
 name: string;
 category: string;
 // Add validation-specific fields
}

/**
 * Interface for import data.
 *
 * @public
 */
export interface ExampleImportData {
 examples: Example[];
 options?: {
  overwrite?: boolean;
  validate?: boolean;
 };
}

/**
 * Validates example ID parameters.
 *
 * @example
 *
 * ```typescript
 * if (isExampleIdParams(params)) {
 *  // params is now typed as ExampleIdParams
 *  console.log(params.id);
 * }
 * ```
 *
 * @param data - Unknown data to validate
 *
 * @returns Type predicate indicating if data is valid ExampleIdParams
 */
export function isExampleIdParams(data: unknown): data is ExampleIdParams {
 return (
  typeof data === "object" &&
  data !== null &&
  "id" in data &&
  typeof (data as any).id === "string" &&
  (data as any).id.length > 0
 );
}

/**
 * Validates example creation data.
 *
 * @param data - Unknown data to validate
 *
 * @returns Type predicate indicating if data is valid ExampleCreateData
 */
export function isExampleCreateData(data: unknown): data is ExampleCreateData {
 if (typeof data !== "object" || data === null) {
  return false;
 }

 const obj = data as any;

 return (
  // Required fields
  "name" in obj &&
  typeof obj.name === "string" &&
  obj.name.length > 0 &&
  "category" in obj &&
  typeof obj.category === "string" &&
  obj.category.length > 0 &&
  // Optional fields
  (obj.description === undefined || typeof obj.description === "string")

  // Add validation for other fields
 );
}

/**
 * Validates example update parameters.
 *
 * @param data - Unknown data to validate
 *
 * @returns Type predicate indicating if data is valid ExampleUpdateParams
 */
export function isExampleUpdateParams(
 data: unknown
): data is ExampleUpdateParams {
 if (typeof data !== "object" || data === null) {
  return false;
 }

 const obj = data as any;

 return (
  // Must have id
  "id" in obj &&
  typeof obj.id === "string" &&
  obj.id.length > 0 &&
  // Must have updates object
  "updates" in obj &&
  typeof obj.updates === "object" &&
  obj.updates !== null &&
  // Validate updates content (at least one valid field)
  Object.keys(obj.updates).length > 0 &&
  Object.keys(obj.updates).every((key) => {
   switch (key) {
    case "name":
     return typeof obj.updates[key] === "string";
    case "description":
     return (
      typeof obj.updates[key] === "string" || obj.updates[key] === undefined
     );
    case "category":
     return typeof obj.updates[key] === "string";
    // Add other updateable fields
    default:
     return false; // Unknown fields not allowed
   }
  })
 );
}

/**
 * Validates bulk creation data.
 *
 * @param data - Unknown data to validate
 *
 * @returns Type predicate indicating if data is valid ExampleBulkCreateData
 */
export function isExampleBulkCreateData(
 data: unknown
): data is ExampleBulkCreateData {
 if (typeof data !== "object" || data === null) {
  return false;
 }

 const obj = data as any;

 return (
  "examples" in obj &&
  Array.isArray(obj.examples) &&
  obj.examples.length > 0 &&
  obj.examples.every((example: unknown) => isExampleCreateData(example))
 );
}

/**
 * Validates example validation data.
 *
 * @param data - Unknown data to validate
 *
 * @returns Type predicate indicating if data is valid ExampleValidationData
 */
export function isExampleValidationData(
 data: unknown
): data is ExampleValidationData {
 if (typeof data !== "object" || data === null) {
  return false;
 }

 const obj = data as any;

 return (
  "name" in obj &&
  typeof obj.name === "string" &&
  "category" in obj &&
  typeof obj.category === "string"
  // Add other validation-specific field checks
 );
}

/**
 * Validates import data.
 *
 * @param data - Unknown data to validate
 *
 * @returns Type predicate indicating if data is valid ExampleImportData
 */
export function isExampleImportData(data: unknown): data is ExampleImportData {
 if (typeof data !== "object" || data === null) {
  return false;
 }

 const obj = data as any;

 const hasValidExamples =
  "examples" in obj && Array.isArray(obj.examples) && obj.examples.length > 0;
 // Note: Import might have full Example objects, not just creation data

 const hasValidOptions =
  obj.options === undefined ||
  (typeof obj.options === "object" &&
   obj.options !== null &&
   (obj.options.overwrite === undefined ||
    typeof obj.options.overwrite === "boolean") &&
   (obj.options.validate === undefined ||
    typeof obj.options.validate === "boolean"));

 return hasValidExamples && hasValidOptions;
}
````

## Preload API Extension Template

Add to your preload domain module (preferred):

```typescript
// electron/preload/domains/exampleApi.ts
import { EXAMPLE_CHANNELS } from "@shared/types/preload";

import { createTypedInvoker } from "../core/bridgeFactory";

export function createExampleApi() {
 return {
  getAll: createTypedInvoker(EXAMPLE_CHANNELS.getExamples),
  getById: createTypedInvoker(EXAMPLE_CHANNELS.getExampleById),
  create: createTypedInvoker(EXAMPLE_CHANNELS.createExample),
  bulkCreate: createTypedInvoker(EXAMPLE_CHANNELS.bulkCreateExamples),
  update: createTypedInvoker(EXAMPLE_CHANNELS.updateExample),
  delete: createTypedInvoker(EXAMPLE_CHANNELS.deleteExample),
  validateData: createTypedInvoker(EXAMPLE_CHANNELS.validateExampleData),
  exportData: createTypedInvoker(EXAMPLE_CHANNELS.exportExampleData),
  importData: createTypedInvoker(EXAMPLE_CHANNELS.importExampleData),
 };
}

// then expose createExampleApi() from electron/preload.ts on window.electronAPI
```

## Type Definitions Template

Add to your types file:

```typescript
// shared/types/example.ts

/**
 * Core example entity interface.
 *
 * @public
 */
export interface Example {
 id: string;
 name: string;
 description?: string;
 category: string;
 createdAt: number;
 updatedAt: number;
 // Add other entity-specific fields
}

/**
 * Validation result interface.
 *
 * @public
 */
export interface ValidationResult {
 isValid: boolean;
 errors: ValidationError[];
}

/**
 * Individual validation error.
 *
 * @public
 */
export interface ValidationError {
 field: string;
 message: string;
 code: string;
}

/**
 * Export data structure.
 *
 * @public
 */
export interface ExportData {
 examples: Example[];
 metadata: {
  exportedAt: number;
  version: string;
  count: number;
 };
}

/**
 * Import result structure.
 *
 * @public
 */
export interface ImportResult {
 success: boolean;
 imported: number;
 skipped: number;
 errors: ImportError[];
}

/**
 * Import error details.
 *
 * @public
 */
export interface ImportError {
 item: any;
 reason: string;
 code: string;
}
```

## Test Template

Create test file: `exampleHandlers.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { registerExampleHandlers } from "../exampleHandlers";
import { EXAMPLE_CHANNELS } from "@shared/types/preload";

import * as ipcUtils from "../../utils";

describe("Example IPC Handlers", () => {
 let mockExampleManager: Record<string, unknown>;
 let registeredHandlers: Set<string>;
 let registerHandlerSpy: ReturnType<
  typeof vi.spyOn<typeof ipcUtils, "registerStandardizedIpcHandler">
 >;

 beforeEach(() => {
  mockExampleManager = {
   getAllExamples: vi.fn(),
   getExampleById: vi.fn(),
   createExample: vi.fn(),
   updateExample: vi.fn(),
   deleteExample: vi.fn(),
   bulkCreateExamples: vi.fn(),
   validateExampleData: vi.fn(),
   exportExamples: vi.fn(),
   importExamples: vi.fn(),
  };

  registeredHandlers = new Set();
  registerHandlerSpy = vi.spyOn(ipcUtils, "registerStandardizedIpcHandler");
 });

 it("should register all example handlers", () => {
  registerExampleHandlers({
   exampleManager: mockExampleManager,
   registeredHandlers,
  });

  expect(ipcUtils.registerStandardizedIpcHandler).toHaveBeenCalledWith(
   EXAMPLE_CHANNELS.getExamples,
   expect.any(Function),
   null,
   expect.any(Set)
  );

  expect(ipcUtils.registerStandardizedIpcHandler).toHaveBeenCalledWith(
   EXAMPLE_CHANNELS.createExample,
   expect.any(Function),
   expect.any(Function),
   expect.any(Set)
  );
 });

 it("should handle get-all operation", async () => {
  const mockExamples = [{ id: "1", name: "Test" }];
  mockExampleManager.getAllExamples.mockResolvedValue(mockExamples);

  registerExampleHandlers({
   exampleManager: mockExampleManager,
   registeredHandlers,
  });

  // Get the registered handler
  const getAllHandler =
    registerHandlerSpy.mock.calls.find(
     (call) => call[0] === EXAMPLE_CHANNELS.getExamples
    )?.[1];

    if (!getAllHandler) {
    throw new Error("Failed to locate getExamples handler registration");
    }

  const result = await getAllHandler();
  expect(result).toBe(mockExamples);
  expect(mockExampleManager.getAllExamples).toHaveBeenCalled();
 });

 // Add more handler tests...
});
```

## Integration Checklist

When creating new IPC handlers:

- \[ ] Create handler registration function in domain-specific file
- \[ ] Create comprehensive validation functions
- \[ ] Add handlers to main IpcService initialization
- \[ ] Update preload API with new methods
- \[ ] Add TypeScript type definitions
- \[ ] Create comprehensive tests
- \[ ] Update documentation with examples
- \[ ] Test error handling paths
- \[ ] Verify type safety works end-to-end
- \[ ] Add logging for debugging

## Channel Naming Convention

Follow these naming patterns:

- **GET operations**: `domain:get-all`, `domain:get-by-id`
- **CREATE operations**: `domain:create`, `domain:bulk-create`
- **UPDATE operations**: `domain:update`, `domain:bulk-update`
- **DELETE operations**: `domain:delete`, `domain:delete-all`
- **UTILITY operations**: `domain:validate-data`, `domain:export-data`
- **EVENTS**: `domain:event-name` (past tense for completed events)

## Current Implementation Audit (2025-11-04)

- Audited `electron/services/ipc/IpcService.ts` and domain handler modules to confirm they still follow this template, including validator wiring and logging.
- Verified `electron/services/ipc/utils.ts` continues to provide `registerStandardizedIpcHandler` with duplicate-handler protection and consistent error envelopes.
- Checked renderer preload integration in `electron/preload/domains/*.ts` to ensure new handlers surface through type-safe bridges that mirror the template guidance.

## Error Handling

All handlers automatically get:

- Parameter validation
- Error logging
- Consistent error response format
- Type-safe error handling

The `registerStandardizedIpcHandler` method handles these concerns automatically.
