---
schema: "../../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Zustand Store Template"
summary: "Provides templates for creating new Zustand stores using direct-create and modular composition patterns in the frontend."
created: "2025-08-05"
last_reviewed: "2026-01-31"
doc_category: "guide"
author: "Nick2bad4u"
tags:
  - "uptime-watcher"
  - "architecture"
  - "template"
  - "zustand"
  - "state-management"
---
# Zustand Store Template

## Table of Contents

1. [Simple Store Template](#simple-store-template)
2. [Current Implementation Audit (2025-11-04)](#current-implementation-audit-2025-11-04)
3. [Complex Store with Modules Template](#complex-store-with-modules-template)
4. [Module Template](#module-template)
5. [Testing Template](#testing-template)
6. [Customization Checklist](#customization-checklist)

## Simple Store Template

For stores with straightforward state that don't require modular composition:

## Current Implementation Audit (2025-11-04)

- Confirmed current stores in `src/stores` (error, updates, settings, ui, monitorTypes) still follow the direct-create or modular composition approaches illustrated here.
- Verified renderer services under `src/services` continue to expose typed facades consumed by the templates' async actions.
- Checked utility helpers (`src/stores/utils/storeErrorHandling.ts`, `src/stores/utils/index.ts`) to ensure logging and error propagation remain consistent with the documented patterns.

<!-- keep template code outside of the audit list -->

<!-- prettier-ignore -->

````typescript

/**
 * [DESCRIPTION] store for managing [DOMAIN] state and interactions.
 *
 * @remarks
 *   This store manages [DESCRIPTION OF WHAT IT MANAGES]. It uses Zustand
 *   [with/without] persistence to [PERSISTENCE DESCRIPTION IF APPLICABLE].
 *
 *   The store follows the application's modular architecture by [ARCHITECTURE
 *   NOTES].
 *
 * @example
 *  ```typescript
 *  import { useExampleStore } from "./stores/useExampleStore";
 *
 *  function MyComponent() {
 *   const { exampleValue, setExampleValue } = useExampleStore();
 *
 *   return (
 *    <button onClick={() => setExampleValue("new value")}>
 *     Update Example
 *    </button>
 *   );
 *  }
 *  ```;
 *
 * @public
 */

import { create } from "zustand";
import { persist } from "zustand/middleware"; // Remove if no persistence needed
import { ExampleService } from "@app/services/ExampleService";
import { SystemService } from "@app/services/SystemService";
import { logger } from "@app/services/logger";

import { ensureError, withErrorHandling } from "@shared/utils/errorHandling";
import { isValidUrl } from "@shared/validation/validatorUtils";

import type { CreateItemData, ExampleItem } from "../types"; // Replace with your domain-specific types
import { useErrorStore } from "../error/useErrorStore";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";
import { logStoreAction } from "../utils";

/**
 * Interface defining the state shape for the Example store.
 *
 * @remarks
 *   Contains all state properties managed by this store. Separating state from
 *   actions improves maintainability.
 *
 * @public
 */
export interface ExampleState {
 /** Current example value */
 exampleValue: string;
 /** Loading state for async operations */
 isLoading: boolean;
 /** Array of example items */
 items: ExampleItem[];
 /** Selected item identifier */
 selectedItemId?: string;
 /** User preferences (if using persistence) */
 userPreference: boolean;
}

/**
 * Interface defining the actions available in the Example store.
 *
 * @remarks
 *   Contains all action methods that can modify the store state. Actions should
 *   be descriptive and follow async/sync patterns consistently.
 *
 * @public
 */
export interface ExampleActions {
 // Sync actions for immediate state updates
 setExampleValue: (value: string) => void;
 setLoading: (loading: boolean) => void;
 addItem: (item: ExampleItem) => void;
 removeItem: (id: string) => void;
 setSelectedItem: (item: ExampleItem | undefined) => void;
 setUserPreference: (enabled: boolean) => void;

 // Async actions for operations that involve IPC or complex logic
 fetchItems: () => Promise<void>;
 createItem: (data: CreateItemData) => Promise<ExampleItem>;
 deleteItem: (id: string) => Promise<void>;

 // Utility actions
 reset: () => void;
 openExternal: (url: string, context?: { itemName?: string }) => void;
}

/**
 * Complete store interface combining state and actions.
 *
 * @public
 */
export interface ExampleStore extends ExampleState, ExampleActions {}

/**
 * Initial state for the Example store.
 *
 * @internal
 */
const initialState: ExampleState = {
 exampleValue: "",
 isLoading: false,
 items: [],
 selectedItemId: undefined,
 userPreference: false,
};

const ERROR_STORE_KEY = "example-operations"; // Replace with a domain-specific error store key

const buildErrorHandler = (operation: string) =>
 createStoreErrorHandler(ERROR_STORE_KEY, operation);

/**
 * Example store for managing [DOMAIN] state and interactions.
 *
 * @remarks
 *   {undefined} DETAILED DESCRIPTION OF STORE PURPOSE AND USAGE
 *
 * @public
 */
export const useExampleStore = create<ExampleStore>()(
 // Remove persist wrapper if persistence is not needed
 persist(
  (set, get) => ({
   // Initial state
   ...initialState,

   // Sync actions
   setExampleValue: (exampleValue: string) => {
    logStoreAction("ExampleStore", "setExampleValue", { exampleValue });
    set({ exampleValue });
   },

   setLoading: (isLoading: boolean) => {
    logStoreAction("ExampleStore", "setLoading", { isLoading });
    set({ isLoading });
   },

   addItem: (item: ExampleItem) => {
    logStoreAction("ExampleStore", "addItem", { itemId: item.id });
    set((state) => ({
     items: [...state.items, item],
    }));
   },

   removeItem: (id: string) => {
    logStoreAction("ExampleStore", "removeItem", { id });
    set((state) => ({
     items: state.items.filter((item) => item.id !== id),
     selectedItemId:
      state.selectedItemId === id ? undefined : state.selectedItemId,
    }));
   },

   setSelectedItem: (item: ExampleItem | undefined) => {
    logStoreAction("ExampleStore", "setSelectedItem", { itemId: item?.id });
    set({ selectedItemId: item ? item.id : undefined });
   },

   setUserPreference: (userPreference: boolean) => {
    logStoreAction("ExampleStore", "setUserPreference", { userPreference });
    set({ userPreference });
   },

   // Async actions
   fetchItems: async () => {
    get().setLoading(true);

    try {
     await withErrorHandling(async () => {
      const items = await ExampleService.getItems();
      set({ items });
     }, buildErrorHandler("fetchItems"));
    } finally {
     get().setLoading(false);
    }
   },

   createItem: async (data: CreateItemData) => {
    return await withErrorHandling(async () => {
     const newItem = await ExampleService.createItem(data);
     get().addItem(newItem);
     return newItem;
    }, buildErrorHandler("createItem"));
   },

   deleteItem: async (id: string) => {
    await withErrorHandling(async () => {
     // Optimistic update
     const originalItems = get().items;
     get().removeItem(id);

     try {
      await ExampleService.deleteItem(id);
     } catch (error) {
      // Rollback on failure
      set({ items: originalItems });
      throw error;
     }
    }, buildErrorHandler("deleteItem"));
   },

   // Utility actions
   reset: () => {
    logStoreAction("ExampleStore", "reset");
    set(initialState);
   },

   openExternal: (url: string, context?: { itemName?: string }) => {
    logStoreAction("ExampleStore", "openExternal", { url, context });

    const errorStore = useErrorStore.getState();

    if (!isValidUrl(url)) {
     logger.warn("Blocked invalid external URL", { url, context });
     errorStore.setStoreError(
      "example-open-external",
      `Unable to open external link (${url}): URL must start with http(s)://`
     );
     return;
    }

    void (async () => {
     try {
      await SystemService.openExternal(url);
      logger.user.action("External URL opened", {
       url,
       ...(context && { itemName: context.itemName }),
      });
     } catch (error) {
      logger.error("External URL navigation failed", { error, url, context });
      errorStore.setStoreError(
       "example-open-external",
       `Unable to open external link (${url}): ${ensureError(error).message}`
      );
     }
    })();
   },
  }),
  {
   // Persistence configuration (remove if not needed)
   name: "uptime-watcher-example",

   /**
    * Partialize function for selective state persistence.
    *
    * @remarks
    *   Only persists user preferences and settings. Transient state like loading
    *   states, selected items, and data arrays are excluded.
    *
    * @param state - Current store state
    *
    * @returns Object with only the state properties that should be persisted
    */
   partialize: (state) => ({
    // Persist user preferences
    userPreference: state.userPreference,
    exampleValue: state.exampleValue, // If it's a user setting

    // Exclude transient state
    // isLoading: false,
    // items: [],
    // selectedItemId: undefined,
   }),
  }
 )
);
````

## Complex Store with Modules Template

For stores with complex state that benefit from modular composition:

```typescript
/**
 * Complex store composed of multiple modules for [DOMAIN] management.
 *
 * @remarks
 *   This store uses a modular composition pattern to separate concerns:
 *
 *   - `useExampleState`: Core state management and data manipulation
 *   - `useExampleOperations`: CRUD operations for items
 *   - `useExampleSync`: Backend synchronization and data consistency
 *
 *   Each module is independently testable and has clear responsibilities.
 *
 * @public
 */

import { create } from "zustand";
import type { ExampleStore } from "./types";

import {
 createExampleStateActions,
 initialExampleState,
} from "./useExampleState";
import { createExampleOperationsActions } from "./useExampleOperations";
import { createExampleSyncActions } from "./useExampleSync";

/**
 * Main example store combining all functionality.
 *
 * @remarks
 *   Creates a Zustand store that composes multiple action modules to provide a
 *   complete interface for example management. The store uses dependency
 *   injection to share common functions between modules while maintaining clear
 *   boundaries.
 *
 * @returns Complete example store with all actions and state
 *
 * @public
 */
export const useExampleStore = create<ExampleStore>()((
 set: (partial: (state: ExampleStore) => Partial<ExampleStore>) => void,
 get: () => ExampleStore
) => {
 // Create state actions
 const stateActions = createExampleStateActions(set, get);

 // Shared getItems function - eliminates duplication and improves testability
 const getItems = () => get().items;

 // Create sync actions (needed by other modules)
 const syncActions = createExampleSyncActions({
  getItems,
  setItems: stateActions.setItems,
 });

 // Create operations actions
 const operationsActions = createExampleOperationsActions({
  addItem: stateActions.addItem,
  getItems,
  removeItem: stateActions.removeItem,
  setItems: stateActions.setItems,
  syncItemsFromBackend: syncActions.syncItemsFromBackend,
 });

 return {
  // Initial state
  ...initialExampleState,

  // State actions
  ...stateActions,

  // Operations actions
  ...operationsActions,

  // Sync actions
  ...syncActions,
 };
});
```

## Module Template

For individual modules used in complex stores:

```typescript
/**
 * State management module for Example store.
 *
 * @remarks
 *   Handles core state mutations and basic data operations. This module is
 *   composed into the main store and provides the foundational state management
 *   capabilities.
 *
 * @public
 */

import type { ExampleItem } from "@shared/types";
import { logStoreAction } from "../utils";

/**
 * State interface for the Example state module.
 *
 * @public
 */
export interface ExampleStateModule {
 // State
 items: ExampleItem[];
 selectedItemId?: string;
 lastUpdated?: number;

 // Actions
 setItems: (items: ExampleItem[]) => void;
 addItem: (item: ExampleItem) => void;
 removeItem: (id: string) => void;
 updateItem: (id: string, updates: Partial<ExampleItem>) => void;
 setSelectedItem: (item: ExampleItem | undefined) => void;
 clearSelection: () => void;
}

/**
 * Initial state for the Example state module.
 *
 * @public
 */
export const initialExampleState: Pick<
 ExampleStateModule,
 "items" | "selectedItemId" | "lastUpdated"
> = {
 items: [],
 selectedItemId: undefined,
 lastUpdated: undefined,
};

/**
 * Creates the state management actions for the Example store.
 *
 * @param set - Zustand set function for state updates
 * @param get - Zustand get function for accessing current state
 *
 * @returns Object containing all state management actions
 *
 * @public
 */
export function createExampleStateActions(
 set: (partial: (state: any) => Partial<any>) => void,
 get: () => any
): Omit<ExampleStateModule, "items" | "selectedItemId" | "lastUpdated"> {
 return {
  setItems: (items: ExampleItem[]) => {
   logStoreAction("ExampleStore", "setItems", { count: items.length });
   set((state) => ({
    items,
    lastUpdated: Date.now(),
   }));
  },

  addItem: (item: ExampleItem) => {
   logStoreAction("ExampleStore", "addItem", { itemId: item.id });
   set((state) => ({
    items: [...state.items, item],
    lastUpdated: Date.now(),
   }));
  },

  removeItem: (id: string) => {
   logStoreAction("ExampleStore", "removeItem", { id });
   set((state) => ({
    items: state.items.filter((item) => item.id !== id),
    selectedItemId:
     state.selectedItemId === id ? undefined : state.selectedItemId,
    lastUpdated: Date.now(),
   }));
  },

  updateItem: (id: string, updates: Partial<ExampleItem>) => {
   logStoreAction("ExampleStore", "updateItem", { id, updates });
   set((state) => ({
    items: state.items.map((item) =>
     item.id === id ? { ...item, ...updates } : item
    ),
    lastUpdated: Date.now(),
   }));
  },

  setSelectedItem: (item: ExampleItem | undefined) => {
   logStoreAction("ExampleStore", "setSelectedItem", { itemId: item?.id });
   set({ selectedItemId: item ? item.id : undefined });
  },

  clearSelection: () => {
   logStoreAction("ExampleStore", "clearSelection");
   set({ selectedItemId: undefined });
  },
 };
}
```

## Testing Template

```typescript
/**
 * Comprehensive tests for useExampleStore. Ensures complete coverage of store
 * functionality.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ExampleItem } from "@shared/types";
import { useExampleStore } from "../useExampleStore";

// Mock the shared utils
vi.mock("../utils", () => ({
 logStoreAction: vi.fn(),
}));

// Mock error handling
vi.mock("../../utils/errorHandling", () => ({
 withErrorHandling: vi.fn().mockImplementation(async (operation) => {
  return await operation();
 }),
}));

describe("useExampleStore", () => {
 const mockItem: ExampleItem = {
  id: "test-item-123",
  name: "Test Item",
  createdAt: Date.now(),
 };

 beforeEach(() => {
  // Reset store state before each test
  const store = useExampleStore.getState();
  act(() => {
   store.reset();
  });
  vi.clearAllMocks();
 });

 describe("Initial State", () => {
  it("should initialize with correct default values", () => {
   const { result } = renderHook(() => useExampleStore());

   expect(result.current.items).toEqual([]);
   expect(result.current.selectedItemId).toBeUndefined();
   expect(result.current.isLoading).toBe(false);
   expect(result.current.userPreference).toBe(false);
  });

  it("should have all required action methods", () => {
   const { result } = renderHook(() => useExampleStore());

   expect(typeof result.current.setExampleValue).toBe("function");
   expect(typeof result.current.addItem).toBe("function");
   expect(typeof result.current.removeItem).toBe("function");
   expect(typeof result.current.fetchItems).toBe("function");
  });
 });

 describe("State Management", () => {
  it("should add item correctly", () => {
   const { result } = renderHook(() => useExampleStore());

   act(() => {
    result.current.addItem(mockItem);
   });

   expect(result.current.items).toContain(mockItem);
  });

  it("should remove item correctly", () => {
   const { result } = renderHook(() => useExampleStore());

   act(() => {
    result.current.addItem(mockItem);
    result.current.removeItem(mockItem.id);
   });

   expect(result.current.items).not.toContain(mockItem);
  });

  it("should handle selection correctly", () => {
   const { result } = renderHook(() => useExampleStore());

   act(() => {
    result.current.addItem(mockItem);
    result.current.setSelectedItem(mockItem);
   });

   expect(result.current.selectedItemId).toBe(mockItem.id);
  });

  it("should clear selection when item is removed", () => {
   const { result } = renderHook(() => useExampleStore());

   act(() => {
    result.current.addItem(mockItem);
    result.current.setSelectedItem(mockItem);
    result.current.removeItem(mockItem.id);
   });

   expect(result.current.selectedItemId).toBeUndefined();
  });
 });

 describe("Async Operations", () => {
  it("should handle fetchItems", async () => {
   const mockItems = [mockItem];
   const getItemsSpy = vi
    .spyOn(ExampleService, "getItems")
    .mockResolvedValue(mockItems);

   const { result } = renderHook(() => useExampleStore());

   await act(async () => {
    await result.current.fetchItems();
   });

   expect(result.current.items).toEqual(mockItems);
   expect(getItemsSpy).toHaveBeenCalledTimes(1);
  });

  it("should handle createItem", async () => {
   const createSpy = vi
    .spyOn(ExampleService, "createItem")
    .mockResolvedValue(mockItem);

   const { result } = renderHook(() => useExampleStore());

   await act(async () => {
    await result.current.createItem({ name: "Test Item" });
   });

   expect(result.current.items).toContain(mockItem);
   expect(createSpy).toHaveBeenCalledWith({ name: "Test Item" });
  });
 });

 describe("Error Handling", () => {
  it("should handle fetchItems errors gracefully", async () => {
   vi
    .spyOn(ExampleService, "getItems")
    .mockRejectedValue(new Error("Fetch failed"));

   const { result } = renderHook(() => useExampleStore());

   await act(async () => {
    await expect(result.current.fetchItems()).rejects.toThrow("Fetch failed");
   });
  });
 });

 describe("Reset Functionality", () => {
  it("should reset to initial state", () => {
   const { result } = renderHook(() => useExampleStore());

   act(() => {
    result.current.addItem(mockItem);
    result.current.setExampleValue("test");
    result.current.reset();
   });

   expect(result.current.items).toEqual([]);
   expect(result.current.exampleValue).toBe("");
  });
 });
});
```

## Customization Checklist

When using this template:

- \[ ] Replace `Example` with your domain name
- \[ ] Update state interface with your specific properties
- \[ ] Add your specific actions and their implementations
- \[ ] Configure persistence settings if needed
- \[ ] Update TSDoc comments with domain-specific information
- \[ ] Add any domain-specific computed values
- \[ ] Create corresponding test file
- \[ ] Add IPC integration for backend communication
- \[ ] Consider if modular composition is needed for complex state
