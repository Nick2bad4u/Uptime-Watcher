/*
 * Ensures Node-based Storybook environments expose a minimal Web Storage API so
 * addons (for example, MSW) can rely on `localStorage`/`sessionStorage` during
 * initialization. The implementation intentionally sticks to the subset MSW
 * touches.
 */

type StorageKey = string;
type StorageValue = string;

type StorageName = "localStorage" | "sessionStorage";

type MaybeStorage =
    | null
    | undefined
    | {
          clear?: () => unknown;
          getItem?: (key: StorageKey) => unknown;
          key?: (index: number) => unknown;
          readonly length?: number;
          removeItem?: (key: StorageKey) => unknown;
          setItem?: (key: StorageKey, value: StorageValue) => unknown;
      };

interface StorageLike {
    clear: () => void;
    getItem: (key: StorageKey) => null | string;
    key: (index: number) => null | string;
    readonly length: number;
    removeItem: (key: StorageKey) => void;
    setItem: (key: StorageKey, value: StorageValue) => void;
}

const isFunction = (value: unknown): value is (...args: never[]) => unknown =>
    typeof value === "function";

const isStorageLike = (candidate: MaybeStorage): candidate is StorageLike => {
    if (!candidate || typeof candidate !== "object") {
        return false;
    }

    return (
        typeof candidate.length === "number" &&
        isFunction(candidate.clear) &&
        isFunction(candidate.getItem) &&
        isFunction(candidate.key) &&
        isFunction(candidate.removeItem) &&
        isFunction(candidate.setItem)
    );
};

class MemoryStorage implements StorageLike {
    readonly #store = new Map<string, string>();

    public get length(): number {
        return this.#store.size;
    }

    public clear(): void {
        this.#store.clear();
    }

    public getItem(key: StorageKey): null | string {
        const normalizedKey = String(key);
        const value = this.#store.get(normalizedKey);
        return value ?? null;
    }

    public key(index: number): null | string {
        if (index < 0 || index >= this.#store.size) {
            return null;
        }

        let currentIndex = 0;
        for (const currentKey of this.#store.keys()) {
            if (currentIndex === index) {
                return currentKey;
            }

            currentIndex += 1;
        }

        return null;
    }

    public removeItem(key: StorageKey): void {
        this.#store.delete(String(key));
    }

    public setItem(key: StorageKey, value: StorageValue): void {
        this.#store.set(String(key), String(value));
    }
}

const installStorage = (name: StorageName): void => {
    if (typeof globalThis === "undefined") {
        return;
    }

    const globalScope = globalThis as Record<string, unknown> & {
        window?: null | Record<string, unknown> | undefined;
    };

    const existing = globalScope[name] as MaybeStorage;
    if (isStorageLike(existing)) {
        return;
    }

    const storage = new MemoryStorage();

    Object.defineProperty(globalScope, name, {
        configurable: true,
        enumerable: true,
        value: storage,
        writable: false,
    });

    const { window } = globalScope;
    if (window && typeof window === "object") {
        const maybeStorage = window[
            name as keyof typeof window
        ] as MaybeStorage;
        if (!isStorageLike(maybeStorage)) {
            Object.defineProperty(window, name, {
                configurable: true,
                enumerable: true,
                value: storage,
                writable: false,
            });
        }
    }
};

installStorage("localStorage");
installStorage("sessionStorage");
