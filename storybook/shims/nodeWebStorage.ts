/**
 * Ensures Node-based Storybook environments expose a minimal Web Storage API so
 * addons (for example, MSW) can rely on `localStorage`/`sessionStorage` during
 * initialization. The implementation intentionally sticks to the subset MSW
 * touches.
 */

type StorageName = "localStorage" | "sessionStorage";

type MaybeStorage =
    | null
    | undefined
    | {
          clear?: () => unknown;
          getItem?: (key: string) => unknown;
          key?: (index: number) => unknown;
          readonly length?: number;
          removeItem?: (key: string) => unknown;
          setItem?: (key: string, value: string) => unknown;
      };

interface StorageLike {
    clear: () => void;
    getItem: (key: string) => null | string;
    key: (index: number) => null | string;
    readonly length: number;
    removeItem: (key: string) => void;
    setItem: (key: string, value: string) => void;
}

/**
 * Determines whether a candidate value is a function.
 */
const isFunction = (value: unknown): value is (...args: never[]) => unknown =>
    typeof value === "function";

/**
 * Checks whether an arbitrary value implements the minimal storage contract we
 * rely on.
 */
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

const LOCAL_STORAGE_INITIALIZATION_ERROR =
    "Cannot initialize local storage without a `--localstorage-file` path";

const removePropertyIfConfigurable = (
    target: object,
    propertyKey: PropertyKey
): void => {
    const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey);
    if (!descriptor || descriptor.configurable !== false) {
        Reflect.deleteProperty(target, propertyKey);
    }
};

const readStorageCandidate = (
    target: object,
    name: StorageName
): MaybeStorage => {
    try {
        return Reflect.get(target, name) as MaybeStorage;
    } catch (error: unknown) {
        if (
            error instanceof Error &&
            error.message.includes(LOCAL_STORAGE_INITIALIZATION_ERROR)
        ) {
            removePropertyIfConfigurable(target, name);
            return undefined;
        }

        throw error;
    }
};

const defineStorageProperty = (
    target: object,
    name: StorageName,
    storage: StorageLike
): void => {
    const descriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: true,
        value: storage,
        writable: false,
    };

    Reflect.defineProperty(target, name, descriptor);
};

/**
 * In-memory implementation of the Web Storage API used to backfill Node
 * environments.
 */
class MemoryStorage implements StorageLike {
    readonly #store = new Map<string, string>();

    public get length(): number {
        return this.#store.size;
    }

    public clear(): void {
        this.#store.clear();
    }

    public getItem(key: string): null | string {
        const value = this.#store.get(key);
        return value ?? null;
    }

    /**
     * Retrieves the key at the provided index to mirror the DOM Storage
     * behaviour.
     *
     * The method name intentionally matches the Web Storage API.
     */
    // eslint-disable-next-line function-name/starts-with-verb -- mirrored from the DOM Storage API
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

    public removeItem(key: string): void {
        this.#store.delete(key);
    }

    public setItem(key: string, value: string): void {
        this.#store.set(key, value);
    }
}

/**
 * Installs an in-memory storage shim when the global scope lacks a native
 * implementation.
 */
const installStorage = (name: StorageName): void => {
    if (typeof globalThis === "undefined") {
        return;
    }

    const existing = readStorageCandidate(globalThis, name);
    if (isStorageLike(existing)) {
        return;
    }

    const storage = new MemoryStorage();

    defineStorageProperty(globalThis, name, storage);

    const windowCandidate = Reflect.get(globalThis, "window");
    // eslint-disable-next-line sonarjs/different-types-comparison, @typescript-eslint/no-unnecessary-condition -- null check is required for DOM Storage parity
    if (typeof windowCandidate === "object" && windowCandidate !== null) {
        const maybeStorage = readStorageCandidate(windowCandidate, name);
        if (!isStorageLike(maybeStorage)) {
            defineStorageProperty(windowCandidate, name, storage);
        }
    }
};

installStorage("localStorage");
installStorage("sessionStorage");

export type { StorageLike };
