/**
 * Performance benchmarks for React state management operations
 * Tests the performance of state updates, state derivation, and state synchronization
 */

import { bench, describe } from "vitest";

// Interface definitions for state management
interface StateAction {
  type: string;
  payload?: any;
  meta?: {
    timestamp: number;
    source: string;
    batch?: boolean;
  };
}

interface StateSlice {
  id: string;
  name: string;
  data: any;
  version: number;
  lastUpdated: number;
  subscribers: string[];
}

interface StateStore {
  slices: Record<string, StateSlice>;
  actions: StateAction[];
  middleware: ((action: StateAction) => StateAction)[];
  subscriptions: Record<string, ((state: any) => void)[]>;
  history: StateAction[];
  maxHistorySize: number;
}

interface StateUpdateResult {
  actionType: string;
  processingTime: number;
  affectedSlices: string[];
  subscribersNotified: number;
  stateSize: number;
  memoryUsage: number;
}

interface StateSelector<T> {
  id: string;
  selector: (state: any) => T;
  dependencies: string[];
  lastResult: T;
  lastComputed: number;
  computeCount: number;
}

interface BatchUpdate {
  id: string;
  actions: StateAction[];
  startTime: number;
  endTime?: number;
  results: StateUpdateResult[];
}

// Mock state management system
class MockStateManager {
  private store: StateStore;
  private selectors = new Map<string, StateSelector<any>>();
  private computedCache = new Map<string, { value: any; timestamp: number }>();

  constructor() {
    this.store = {
      slices: {},
      actions: [],
      middleware: [],
      subscriptions: {},
      history: [],
      maxHistorySize: 1000,
    };
  }

  // State slice management
  createSlice(id: string, name: string, initialData: any): StateSlice {
    const slice: StateSlice = {
      id,
      name,
      data: initialData,
      version: 1,
      lastUpdated: Date.now(),
      subscribers: [],
    };
    
    this.store.slices[id] = slice;
    return slice;
  }

  updateSlice(sliceId: string, updater: (data: any) => any): StateUpdateResult {
    const startTime = performance.now();
    const slice = this.store.slices[sliceId];
    
    if (!slice) {
      throw new Error(`Slice ${sliceId} not found`);
    }

    const oldData = slice.data;
    const newData = updater(oldData);
    
    slice.data = newData;
    slice.version++;
    slice.lastUpdated = Date.now();

    // Notify subscribers
    const subscribers = this.store.subscriptions[sliceId] || [];
    subscribers.forEach(callback => callback(newData));

    // Invalidate dependent selectors
    this.invalidateSelectors(sliceId);

    const endTime = performance.now();

    return {
      actionType: "UPDATE_SLICE",
      processingTime: endTime - startTime,
      affectedSlices: [sliceId],
      subscribersNotified: subscribers.length,
      stateSize: JSON.stringify(newData).length,
      memoryUsage: Math.random() * 1000, // Simulated
    };
  }

  // Action dispatching
  dispatch(action: StateAction): StateUpdateResult {
    const startTime = performance.now();
    
    // Apply middleware
    let processedAction = action;
    for (const middleware of this.store.middleware) {
      processedAction = middleware(processedAction);
    }

    // Add to history
    this.store.history.push(processedAction);
    if (this.store.history.length > this.store.maxHistorySize) {
      this.store.history.shift();
    }

    // Process action
    const result = this.processAction(processedAction);
    
    const endTime = performance.now();
    result.processingTime = endTime - startTime;

    return result;
  }

  private processAction(action: StateAction): StateUpdateResult {
    const affectedSlices: string[] = [];
    let subscribersNotified = 0;
    let totalStateSize = 0;

    switch (action.type) {
      case "SET_USER": {
        this.updateSlice("user", () => action.payload);
        affectedSlices.push("user");
        break;
      }
      
      case "ADD_ITEM": {
        this.updateSlice("items", (items) => [...items, action.payload]);
        affectedSlices.push("items");
        break;
      }
      
      case "REMOVE_ITEM": {
        this.updateSlice("items", (items) => 
          items.filter((item: any) => item.id !== action.payload.id)
        );
        affectedSlices.push("items");
        break;
      }
      
      case "UPDATE_SETTINGS": {
        this.updateSlice("settings", (settings) => ({ ...settings, ...action.payload }));
        affectedSlices.push("settings");
        break;
      }
      
      case "RESET_ALL": {
        Object.keys(this.store.slices).forEach(sliceId => {
          this.updateSlice(sliceId, () => ({}));
          affectedSlices.push(sliceId);
        });
        break;
      }
    }

    // Calculate total state size
    affectedSlices.forEach(sliceId => {
      const slice = this.store.slices[sliceId];
      if (slice) {
        totalStateSize += JSON.stringify(slice.data).length;
        subscribersNotified += slice.subscribers.length;
      }
    });

    return {
      actionType: action.type,
      processingTime: 0, // Will be set by caller
      affectedSlices,
      subscribersNotified,
      stateSize: totalStateSize,
      memoryUsage: Math.random() * 1000,
    };
  }

  // Selector management
  createSelector<T>(
    id: string,
    selector: (state: any) => T,
    dependencies: string[]
  ): StateSelector<T> {
    const selectorObj: StateSelector<T> = {
      id,
      selector,
      dependencies,
      lastResult: selector(this.getState()),
      lastComputed: Date.now(),
      computeCount: 1,
    };

    this.selectors.set(id, selectorObj);
    return selectorObj;
  }

  runSelector<T>(selectorId: string): T {
    const selectorObj = this.selectors.get(selectorId);
    if (!selectorObj) {
      throw new Error(`Selector ${selectorId} not found`);
    }

    const currentState = this.getState();
    const result = selectorObj.selector(currentState);
    
    selectorObj.lastResult = result;
    selectorObj.lastComputed = Date.now();
    selectorObj.computeCount++;

    return result;
  }

  private invalidateSelectors(changedSliceId: string) {
    this.selectors.forEach(selector => {
      if (selector.dependencies.includes(changedSliceId)) {
        this.computedCache.delete(selector.id);
      }
    });
  }

  getState(): any {
    const state: any = {};
    Object.keys(this.store.slices).forEach(sliceId => {
      state[sliceId] = this.store.slices[sliceId].data;
    });
    return state;
  }

  subscribe(sliceId: string, callback: (state: any) => void): () => void {
    if (!this.store.subscriptions[sliceId]) {
      this.store.subscriptions[sliceId] = [];
    }
    
    this.store.subscriptions[sliceId].push(callback);
    
    if (this.store.slices[sliceId]) {
      this.store.slices[sliceId].subscribers.push(`sub-${Date.now()}`);
    }

    return () => {
      const callbacks = this.store.subscriptions[sliceId];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  // Batch operations
  batchUpdate(actions: StateAction[]): BatchUpdate {
    const batch: BatchUpdate = {
      id: `batch-${Date.now()}`,
      actions,
      startTime: performance.now(),
      results: [],
    };

    // Process all actions in batch
    for (const action of actions) {
      const result = this.dispatch(action);
      batch.results.push(result);
    }

    batch.endTime = performance.now();
    return batch;
  }
}

describe("React State Management Performance", () => {
  
  // Generate test data
  const generateStateActions = (count: number): StateAction[] => {
    const actionTypes = ["SET_USER", "ADD_ITEM", "REMOVE_ITEM", "UPDATE_SETTINGS", "RESET_ALL"];
    
    return Array.from({ length: count }, (_, i) => ({
      type: actionTypes[Math.floor(Math.random() * actionTypes.length)],
      payload: {
        id: `item-${i}`,
        name: `Item ${i}`,
        value: Math.random() * 1000,
        metadata: {
          created: Date.now(),
          category: `category-${i % 10}`,
        },
      },
      meta: {
        timestamp: Date.now(),
        source: "benchmark",
        batch: Math.random() > 0.7,
      },
    }));
  };

  const stateActions = generateStateActions(1000);

  // State creation and initialization benchmarks
  bench("state initialization - large state tree", () => {
    const stateManager = new MockStateManager();
    
    // Create multiple slices with various data structures
    stateManager.createSlice("user", "User Data", {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      preferences: {
        theme: "dark",
        language: "en",
        notifications: true,
      },
      profile: {
        avatar: "avatar.jpg",
        bio: "Test user bio",
        location: "Test City",
      },
    });

    stateManager.createSlice("items", "Items List", 
      Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        value: Math.random() * 1000,
        category: `category-${i % 10}`,
        tags: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => `tag-${j}`),
      }))
    );

    stateManager.createSlice("settings", "Application Settings", {
      api: {
        baseUrl: "https://api.example.com",
        timeout: 5000,
        retries: 3,
      },
      ui: {
        sidebarCollapsed: false,
        gridView: true,
        itemsPerPage: 25,
      },
      features: {
        darkMode: true,
        autoSave: true,
        notifications: true,
      },
    });

    stateManager.createSlice("cache", "Cache Data",
      Array.from({ length: 200 }, (_, i) => ({
        key: `cache-key-${i}`,
        value: `cache-value-${i}`,
        expiry: Date.now() + Math.random() * 3_600_000,
      }))
    );
  });

  // State update benchmarks
  bench("state updates - high frequency", () => {
    const stateManager = new MockStateManager();
    stateManager.createSlice("counter", "Counter", { value: 0 });
    stateManager.createSlice("items", "Items", []);
    
    const updateResults: StateUpdateResult[] = [];
    
    for (let i = 0; i < 500; i++) {
      const result = stateManager.dispatch({
        type: "ADD_ITEM",
        payload: {
          id: `high-freq-${i}`,
          name: `High Frequency Item ${i}`,
          timestamp: Date.now(),
        },
        meta: {
          timestamp: Date.now(),
          source: "high-frequency-test",
        },
      });
      
      updateResults.push(result);
    }
  });

  bench("state updates - batch operations", () => {
    const stateManager = new MockStateManager();
    stateManager.createSlice("batch-items", "Batch Items", []);
    
    const batchSizes = [10, 25, 50, 100, 200];
    const batchResults: BatchUpdate[] = [];
    
    for (const batchSize of batchSizes) {
      const batchActions = stateActions.slice(0, batchSize);
      const batchResult = stateManager.batchUpdate(batchActions);
      batchResults.push(batchResult);
    }
  });

  // Selector performance benchmarks
  bench("selector computations - complex selectors", () => {
    const stateManager = new MockStateManager();
    
    // Initialize state with complex data
    stateManager.createSlice("users", "Users", 
      Array.from({ length: 100 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i}`,
        age: 20 + Math.floor(Math.random() * 40),
        department: `dept-${i % 10}`,
        salary: 30_000 + Math.random() * 70_000,
        active: Math.random() > 0.2,
      }))
    );

    stateManager.createSlice("projects", "Projects",
      Array.from({ length: 50 }, (_, i) => ({
        id: `project-${i}`,
        name: `Project ${i}`,
        budget: Math.random() * 100_000,
        assignees: Array.from({ length: Math.floor(Math.random() * 10) }, 
          (_, j) => `user-${j}`
        ),
        completed: Math.random() > 0.6,
      }))
    );

    // Create complex selectors
    const activeUsersSelector = stateManager.createSelector(
      "activeUsers",
      (state) => state.users.filter((user: any) => user.active),
      ["users"]
    );

    const departmentStatsSelector = stateManager.createSelector(
      "departmentStats",
      (state) => {
        const users = state.users;
        const stats: any = {};
        
        users.forEach((user: any) => {
          if (!stats[user.department]) {
            stats[user.department] = {
              count: 0,
              totalSalary: 0,
              avgAge: 0,
              ages: [],
            };
          }
          
          stats[user.department].count++;
          stats[user.department].totalSalary += user.salary;
          stats[user.department].ages.push(user.age);
        });

        Object.keys(stats).forEach(dept => {
          const deptStats = stats[dept];
          deptStats.avgSalary = deptStats.totalSalary / deptStats.count;
          deptStats.avgAge = deptStats.ages.reduce((sum: number, age: number) => sum + age, 0) / deptStats.ages.length;
        });

        return stats;
      },
      ["users"]
    );

    const projectsByUserSelector = stateManager.createSelector(
      "projectsByUser",
      (state) => {
        const projects = state.projects;
        const userProjects: any = {};
        
        projects.forEach((project: any) => {
          project.assignees.forEach((userId: string) => {
            if (!userProjects[userId]) {
              userProjects[userId] = [];
            }
            userProjects[userId].push(project);
          });
        });

        return userProjects;
      },
      ["projects"]
    );

    // Run selectors multiple times
    for (let i = 0; i < 100; i++) {
      stateManager.runSelector("activeUsers");
      stateManager.runSelector("departmentStats");
      stateManager.runSelector("projectsByUser");
    }
  });

  // Subscription and notification benchmarks
  bench("subscriptions - many subscribers", () => {
    const stateManager = new MockStateManager();
    stateManager.createSlice("notifications", "Notifications", []);
    
    const unsubscribeFunctions: (() => void)[] = [];
    
    // Create many subscribers
    for (let i = 0; i < 200; i++) {
      const unsubscribe = stateManager.subscribe("notifications", (state) => {
        // Simulate subscriber processing
        const processingTime = Math.random() * 5;
      });
      unsubscribeFunctions.push(unsubscribe);
    }
    
    // Trigger updates that will notify all subscribers
    for (let i = 0; i < 50; i++) {
      stateManager.dispatch({
        type: "ADD_ITEM",
        payload: {
          id: `notification-${i}`,
          message: `Notification ${i}`,
          timestamp: Date.now(),
        },
        meta: {
          timestamp: Date.now(),
          source: "subscription-test",
        },
      });
    }
    
    // Cleanup
    unsubscribeFunctions.forEach(unsub => unsub());
  });

  // State serialization and persistence benchmarks
  bench("state serialization - large state", () => {
    const stateManager = new MockStateManager();
    
    // Create large state
    stateManager.createSlice("largeData", "Large Dataset",
      Array.from({ length: 1000 }, (_, i) => ({
        id: `large-item-${i}`,
        name: `Large Item ${i}`,
        data: Array.from({ length: 20 }, (_, j) => ({
          field: `field-${j}`,
          value: Math.random() * 1000,
          nested: {
            a: Math.random(),
            b: Math.random(),
            c: Array.from({ length: 5 }, () => Math.random()),
          },
        })),
        metadata: {
          created: Date.now(),
          modified: Date.now(),
          version: Math.floor(Math.random() * 10),
        },
      }))
    );

    // Serialize state multiple times
    for (let i = 0; i < 20; i++) {
      const state = stateManager.getState();
      const serialized = JSON.stringify(state);
      const deserialized = JSON.parse(serialized);
    }
  });

  // State derivation and computed values benchmarks
  bench("computed values - memoization", () => {
    const stateManager = new MockStateManager();
    
    stateManager.createSlice("products", "Products",
      Array.from({ length: 300 }, (_, i) => ({
        id: `product-${i}`,
        name: `Product ${i}`,
        price: Math.random() * 1000,
        category: `category-${i % 15}`,
        inStock: Math.random() > 0.3,
        rating: Math.random() * 5,
        reviews: Math.floor(Math.random() * 1000),
      }))
    );

    // Create memoized computed values
    const computedValues = new Map<string, { value: any; lastComputed: number; dependencies: any[] }>();

    const computeExpensiveValue = (key: string, computer: () => any, dependencies: any[]) => {
      const cached = computedValues.get(key);
      const depsChanged = !cached || !dependencies.every((dep, i) => dep === cached.dependencies[i]);
      
      if (!cached || depsChanged) {
        const value = computer();
        computedValues.set(key, {
          value,
          lastComputed: Date.now(),
          dependencies: [...dependencies],
        });
        return value;
      }
      
      return cached.value;
    };

    // Run expensive computations with memoization
    for (let i = 0; i < 100; i++) {
      const state = stateManager.getState();
      
      // Expensive computation 1: Category statistics
      computeExpensiveValue("categoryStats", () => {
        const products = state.products;
        const stats: any = {};
        
        products.forEach((product: any) => {
          if (!stats[product.category]) {
            stats[product.category] = {
              count: 0,
              totalValue: 0,
              avgRating: 0,
              inStockCount: 0,
            };
          }
          
          const categoryStats = stats[product.category];
          categoryStats.count++;
          categoryStats.totalValue += product.price;
          categoryStats.avgRating += product.rating;
          if (product.inStock) categoryStats.inStockCount++;
        });
        
        Object.keys(stats).forEach(category => {
          const categoryStats = stats[category];
          categoryStats.avgPrice = categoryStats.totalValue / categoryStats.count;
          categoryStats.avgRating /= categoryStats.count;
          categoryStats.stockPercentage = (categoryStats.inStockCount / categoryStats.count) * 100;
        });
        
        return stats;
      }, [state.products]);

      // Expensive computation 2: Search index
      computeExpensiveValue("searchIndex", () => {
        const products = state.products;
        const index: any = {};
        
        products.forEach((product: any) => {
          const words = product.name.toLowerCase().split(" ");
          words.forEach((word: string) => {
            if (!index[word]) {
              index[word] = [];
            }
            index[word].push(product.id);
          });
        });
        
        return index;
      }, [state.products]);
    }
  });

  // State history and time travel benchmarks
  bench("state history - time travel", () => {
    const stateManager = new MockStateManager();
    stateManager.createSlice("timeTravel", "Time Travel Data", { value: 0 });
    
    const stateHistory: any[] = [];
    
    // Create history by dispatching many actions
    for (let i = 0; i < 200; i++) {
      const currentState = stateManager.getState();
      stateHistory.push(JSON.parse(JSON.stringify(currentState)));
      
      stateManager.dispatch({
        type: "UPDATE_SETTINGS",
        payload: { value: i },
        meta: {
          timestamp: Date.now(),
          source: "time-travel-test",
        },
      });
    }
    
    // Simulate time travel (restoring previous states)
    for (let i = 0; i < 50; i++) {
      const randomHistoryIndex = Math.floor(Math.random() * stateHistory.length);
      const historicalState = stateHistory[randomHistoryIndex];
      
      // Simulate state restoration
      Object.keys(historicalState).forEach(sliceId => {
        stateManager.updateSlice(sliceId, () => historicalState[sliceId]);
      });
    }
  });

  // Middleware performance benchmarks
  bench("middleware processing - complex pipeline", () => {
    const stateManager = new MockStateManager();
    stateManager.createSlice("middleware", "Middleware Data", {});
    
    // Add multiple middleware functions
    const middleware = [
      // Logging middleware
      (action: StateAction) => {
        const logEntry = {
          type: action.type,
          timestamp: Date.now(),
          payload: action.payload,
        };
        return action;
      },
      
      // Validation middleware
      (action: StateAction) => {
        if (!action.type) {
          throw new Error("Action must have a type");
        }
        return action;
      },
      
      // Transformation middleware
      (action: StateAction) => ({
          ...action,
          meta: {
            ...action.meta,
            processed: true,
            middlewareTimestamp: Date.now(),
          },
        }),
      
      // Analytics middleware
      (action: StateAction) => {
        const analytics = {
          actionType: action.type,
          timestamp: Date.now(),
          source: action.meta?.source || "unknown",
        };
        return action;
      },
    ];
    
    // Apply middleware
    (stateManager as any).store.middleware = middleware;
    
    // Dispatch actions through middleware pipeline
    for (const action of stateActions.slice(0, 100)) {
      stateManager.dispatch(action);
    }
  });
});
