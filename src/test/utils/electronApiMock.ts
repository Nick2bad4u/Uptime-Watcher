import type { ElectronAPI } from "../../types";

import type { PartialDeep } from "type-fest";

type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject => {
    if (value === null || typeof value !== "object") {
        return false;
    }

    if (Array.isArray(value)) {
        return false;
    }

    return Object.getPrototypeOf(value) === Object.prototype;
};

const shallowCloneApi = (api: ElectronAPI): ElectronAPI => {
    const clone: PlainObject = { ...api };

    for (const [key, value] of Object.entries(clone)) {
        if (isPlainObject(value)) {
            clone[key] = { ...value };
        }
    }

    return clone as unknown as ElectronAPI;
};

const mergeInto = (target: PlainObject, source: PlainObject): void => {
    for (const [key, value] of Object.entries(source)) {
        if (value !== undefined) {
            const current = target[key];

            if (isPlainObject(current) && isPlainObject(value)) {
                mergeInto(current, value);
            } else {
                target[key] = value;
            }
        }
    }
};

/**
 * Installs a test-local `window.electronAPI` mock.
 *
 * @remarks
 * The global test setup installs a canonical `electronAPI` mock. Some suites
 * still override it ad-hoc, which can leak changes into later tests. This
 * helper provides a consistent pattern:
 *
 * - Shallow-clone the existing API surface,
 * - Apply deep overrides,
 * - Install the clone into `globalThis` + `window`,
 * - Return a restore function.
 */
export const installElectronApiMock = (
    overrides: PartialDeep<ElectronAPI> = {},
    options: {
        /**
         * Ensure `globalThis.window` exists.
         *
         * @remarks
         * Some Vitest suites run in a non-DOM environment. Production code
         * accesses `window.electronAPI`, so those suites historically created a
         * fake `window` object. This option centralizes that behavior and
         * restores the original global after the test.
         */
        ensureWindow?: boolean;
    } = {}
): { mock: ElectronAPI; restore: () => void } => {
    const original = Reflect.get(globalThis, "electronAPI") as
        | ElectronAPI
        | undefined;

    if (!original) {
        throw new Error(
            "installElectronApiMock requires the global test setup to install globalThis.electronAPI"
        );
    }

    const mock = shallowCloneApi(original);
    mergeInto(
        mock as unknown as PlainObject,
        overrides as unknown as PlainObject
    );

    const hadWindow = Reflect.has(globalThis, "window");
    const createdWindow = options.ensureWindow === true && !hadWindow;

    if (createdWindow) {
        Object.defineProperty(globalThis, "window", {
            configurable: true,
            writable: true,
            value: {},
        });
    }

    const windowRef = Reflect.get(globalThis, "window");

    Object.defineProperty(globalThis, "electronAPI", {
        configurable: true,
        writable: true,
        value: mock,
    });

    if (windowRef !== undefined && typeof windowRef === "object") {
        Object.defineProperty(windowRef as object, "electronAPI", {
            configurable: true,
            writable: true,
            value: mock,
        });
    }

    const restore = (): void => {
        Object.defineProperty(globalThis, "electronAPI", {
            configurable: true,
            writable: true,
            value: original,
        });

        const currentWindowRef = Reflect.get(globalThis, "window");
        if (
            currentWindowRef !== undefined &&
            typeof currentWindowRef === "object"
        ) {
            Object.defineProperty(currentWindowRef as object, "electronAPI", {
                configurable: true,
                writable: true,
                value: original,
            });
        }

        if (createdWindow) {
            delete (globalThis as Record<string, unknown>)["window"];
        }
    };

    return { mock, restore };
};
